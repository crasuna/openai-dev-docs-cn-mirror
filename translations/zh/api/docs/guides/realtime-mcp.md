---
status: needs-review
sourceId: "885381375e15"
sourceChecksum: "885381375e1538f81af57ec1befc7e96a31822299f133d0f8f589272dae204a8"
sourceUrl: "https://developers.openai.com/api/docs/guides/realtime-mcp"
translatedAt: "2026-06-27T18:23:41.3718846+08:00"
translator: codex-gpt-5.5-xhigh
---

# Realtime 与工具

你可以把工具附加到 Realtime session，让模型在实时对话期间查询数据、执行操作或调用服务。无论客户端使用 [WebRTC data channel](https://developers.openai.com/api/docs/guides/realtime-webrtc) 还是 [WebSocket](https://developers.openai.com/api/docs/guides/realtime-websocket)，工具配置都使用相同的事件接口。

当工具应由你的应用执行并返回结果时，请使用 function tools。当 Realtime API 应为你连接到远程工具服务器时，请使用 MCP tools 或内置 connectors。

## 选择工具类型

| 工具类型                  | 适用场景                                                                             | 由谁执行                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `function`                | 你的应用拥有业务逻辑、审批检查或私有系统访问权限。                                  | 你的客户端或服务器接收 function call，并返回 `function_call_output`。          |
| `mcp` with `server_url`   | 你希望模型调用由远程 MCP server 暴露的工具。                                        | Realtime API 调用远程 MCP server。                                             |
| `mcp` with `connector_id` | 你希望使用 Google Calendar 等内置 connector。                                       | Realtime API 使用你提供的授权调用 connector。                                  |

在**两个位置之一**添加工具：

- 在 **session 级别**，通过 [`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update) 中的 `session.tools` 添加，如果你希望该工具在整个 session 中可用。
- 在 **response 级别**，通过 [`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 中的 `response.tools` 添加，如果你只需要该工具用于一个轮次。

## 配置 function tool

当工具应在你的应用中运行时，function tools 是合适的默认选择。模型发出 function call arguments，你的代码执行操作，然后你的代码用 `function_call_output` item 将结果发回。

使用 session.update 配置 function tool

```javascript
const event = {
  type: "session.update",
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    tools: [
      {
        type: "function",
        name: "lookup_order",
        description: "Look up an order by its order number.",
        parameters: {
          type: "object",
          properties: {
            order_number: {
              type: "string",
              description: "The customer-facing order number.",
            },
          },
          required: ["order_number"],
        },
      },
    ],
    tool_choice: "auto",
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "session.update",
    "session": {
        "type": "realtime",
        "model": "gpt-realtime-2",
        "tools": [
            {
                "type": "function",
                "name": "lookup_order",
                "description": "Look up an order by its order number.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "order_number": {
                            "type": "string",
                            "description": "The customer-facing order number.",
                        }
                    },
                    "required": ["order_number"],
                },
            }
        ],
        "tool_choice": "auto",
    },
}

ws.send(json.dumps(event))
```


当模型调用函数时，监听 function call item，运行你的应用逻辑，然后把输出发回：

发送 function call output

```javascript
const event = {
  type: "conversation.item.create",
  item: {
    type: "function_call_output",
    call_id: functionCall.call_id,
    output: JSON.stringify({
      status: "shipped",
      delivery_date: "2026-05-09",
    }),
  },
};

ws.send(JSON.stringify(event));
ws.send(JSON.stringify({ type: "response.create" }));
```

```python
event = {
    "type": "conversation.item.create",
    "item": {
        "type": "function_call_output",
        "call_id": function_call["call_id"],
        "output": json.dumps(
            {
                "status": "shipped",
                "delivery_date": "2026-05-09",
            }
        ),
    },
}

ws.send(json.dumps(event))
ws.send(json.dumps({"type": "response.create"}))
```


如需 function calling 的逐事件完整讲解，请参阅[管理对话](https://developers.openai.com/api/docs/guides/realtime-conversations#function-calling)。

## 配置 MCP tool

当工具已经存在于远程 MCP server 后面，或你想使用 OpenAI 管理的 connector 时，MCP tools 很有用。不同于 function tools，MCP tools 由 Realtime API 自身执行。

在 Realtime 中，MCP tool 的形状是：

- `type: "mcp"`
- `server_label`
- `server_url` 或 `connector_id` 之一
- 可选的 `authorization` 和 `headers`
- 可选的 `allowed_tools`
- 可选的 `require_approval`
- 可选的 `server_description`

这个示例让一个 docs MCP server 在整个 session 中可用：

使用 session.update 配置 MCP tool

```javascript
const event = {
  type: "session.update",
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    output_modalities: ["text"],
    tools: [
      {
        type: "mcp",
        server_label: "openai_docs",
        server_url: "https://developers.openai.com/mcp",
        allowed_tools: ["search_openai_docs", "fetch_openai_doc"],
        require_approval: "never",
      },
    ],
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "session.update",
    "session": {
        "type": "realtime",
        "model": "gpt-realtime-2",
        "output_modalities": ["text"],
        "tools": [
            {
                "type": "mcp",
                "server_label": "openai_docs",
                "server_url": "https://developers.openai.com/mcp",
                "allowed_tools": ["search_openai_docs", "fetch_openai_doc"],
                "require_approval": "never",
            }
        ],
    },
}

ws.send(json.dumps(event))
```


内置 connectors 使用相同的 MCP tool 形状，但传入 `connector_id`
而不是 `server_url`。例如，Google Calendar 使用
`connector_googlecalendar`。在 Realtime 中，将这些内置 connectors 用于读取
操作，例如搜索或读取事件或邮件。将用户的 OAuth
access token 传入 `authorization`，并尽可能用
`allowed_tools` 收窄工具面：

配置 Google Calendar connector

```javascript
const event = {
  type: "session.update",
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    output_modalities: ["text"],
    tools: [
      {
        type: "mcp",
        server_label: "google_calendar",
        connector_id: "connector_googlecalendar",
        authorization: "<google-oauth-access-token>",
        allowed_tools: ["search_events", "read_event"],
        require_approval: "never",
      },
    ],
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "session.update",
    "session": {
        "type": "realtime",
        "model": "gpt-realtime-2",
        "output_modalities": ["text"],
        "tools": [
            {
                "type": "mcp",
                "server_label": "google_calendar",
                "connector_id": "connector_googlecalendar",
                "authorization": "<google-oauth-access-token>",
                "allowed_tools": ["search_events", "read_event"],
                "require_approval": "never",
            }
        ],
    },
}

ws.send(json.dumps(event))
```


Remote MCP servers 
  <strong>不会自动接收完整 conversation context</strong>，
  但<strong>它们可以看到模型在 tool call 中发送的任何数据</strong>。
  使用 <code>allowed_tools</code>
  <strong>保持工具面狭窄</strong>，
  并对任何你不会自动运行的操作要求审批。

## Realtime MCP 流程

不同于 Realtime `function` tools，远程 MCP tools 由 **Realtime API 自身执行**。**你的客户端不会运行远程工具**，也不会返回 `function_call_output`。相反，你的客户端配置访问权限、监听 MCP 生命周期事件，并在服务器要求时选择性发送 approval response。

典型流程如下：

1. 你发送 `session.update` 或 `response.create`，其中包含一个 `type` 为 `mcp` 的 `tools` 条目。
1. 服务器开始导入工具，并发出 `mcp_list_tools.in_progress`。
1. 当列表仍在进行时，模型不能调用尚未加载的工具。如果你希望在开始依赖这些工具的轮次前等待，请监听 [`mcp_list_tools.completed`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/mcp_list_tools/completed)。`item.type` 为 `mcp_list_tools` 的 [`conversation.item.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/conversation/item/done) 事件会显示实际导入了哪些工具名称。如果导入失败，你会收到 [`mcp_list_tools.failed`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/mcp_list_tools/failed)。
1. 用户说话或发送文本，并创建一个 response，这可以由你的客户端创建，也可以由 session 配置自动创建。
1. 如果模型选择 MCP tool，你会看到 `response.mcp_call_arguments.delta` 和 `response.mcp_call_arguments.done`。
1. **如果需要审批**，服务器会添加一个 `item.type` 为 `mcp_approval_request` 的 conversation item。你的客户端必须用一个 `mcp_approval_response` item 回答它。
1. 工具运行后，你会看到 `response.mcp_call.in_progress`。成功时，你之后会收到一个 `item.type` 为 `mcp_call` 的 [`response.output_item.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_item/done) 事件；失败时，你会收到 [`response.mcp_call.failed`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/mcp_call/failed)。assistant message item 和 `response.done` 会完成该轮次。

这个事件处理器覆盖主要检查点：

在 Realtime session 期间监听 MCP 事件

```javascript
function parseRealtimeEvent(rawMessage) {
  if (typeof rawMessage === "string") {
    return JSON.parse(rawMessage);
  }

  if (typeof rawMessage?.data === "string") {
    return JSON.parse(rawMessage.data);
  }

  return JSON.parse(rawMessage.toString());
}

function getOutputText(item) {
  if (item.type !== "message") return "";

  return (item.content ?? [])
    .filter((part) => part.type === "output_text")
    .map((part) => part.text)
    .join("");
}

ws.on("message", (rawMessage) => {
  const event = parseRealtimeEvent(rawMessage);

  switch (event.type) {
    case "mcp_list_tools.in_progress":
      console.log("Listing MCP tools for item:", event.item_id);
      break;

    case "mcp_list_tools.completed":
      console.log("MCP tool listing complete for item:", event.item_id);
      break;

    case "mcp_list_tools.failed":
      console.error("MCP tool listing failed for item:", event.item_id);
      break;

    case "conversation.item.done":
      if (event.item.type === "mcp_list_tools") {
        const names = event.item.tools.map((tool) => tool.name).join(", ");
        console.log(`MCP tools ready on ${event.item.server_label}: ${names}`);
      }

      if (event.item.type === "mcp_approval_request") {
        console.log("Approval required for:", event.item.name, event.item.arguments);
      }
      break;

    case "response.mcp_call_arguments.done":
      console.log("Final MCP call arguments:", event.arguments);
      break;

    case "response.mcp_call.in_progress":
      console.log("Running MCP tool for item:", event.item_id);
      break;

    case "response.mcp_call.failed":
      console.error("MCP tool call failed for item:", event.item_id);
      break;

    case "response.output_item.done":
      if (event.item.type === "mcp_call") {
        console.log(
          `MCP output from ${event.item.server_label}.${event.item.name}:`,
          event.item.output
        );
      }

      if (event.item.type === "message") {
        console.log("Assistant:", getOutputText(event.item));
      }
      break;

    case "response.done":
      console.log("Realtime turn complete.");
      break;
  }
});
```

```python
def on_message(ws, message):
    event = json.loads(message)
    event_type = event["type"]

    if event_type == "mcp_list_tools.in_progress":
        print("Listing MCP tools for item:", event["item_id"])
        return

    if event_type == "mcp_list_tools.completed":
        print("MCP tool listing complete for item:", event["item_id"])
        return

    if event_type == "mcp_list_tools.failed":
        print("MCP tool listing failed for item:", event["item_id"])
        return

    if event_type == "conversation.item.done":
        item = event["item"]

        if item["type"] == "mcp_list_tools":
            names = ", ".join(tool["name"] for tool in item["tools"])
            print(f"MCP tools ready on {item['server_label']}: {names}")
            return

        if item["type"] == "mcp_approval_request":
            print("Approval required for:", item["name"], item["arguments"])
            return

    if event_type == "response.mcp_call_arguments.done":
        print("Final MCP call arguments:", event["arguments"])
        return

    if event_type == "response.mcp_call.in_progress":
        print("Running MCP tool for item:", event["item_id"])
        return

    if event_type == "response.mcp_call.failed":
        print("MCP tool call failed for item:", event["item_id"])
        return

    if event_type == "response.output_item.done":
        item = event["item"]

        if item["type"] == "mcp_call":
            print(
                f"MCP output from {item['server_label']}.{item['name']}:",
                item.get("output"),
            )
            return

        if item["type"] == "message":
            text_parts = [
                part["text"]
                for part in item.get("content", [])
                if part["type"] == "output_text"
            ]
            print("Assistant:", "".join(text_parts))
            return

    if event_type == "response.done":
        print("Realtime turn complete.")
```


## 常见失败

- [`mcp_list_tools.failed`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/mcp_list_tools/failed)：Realtime API 无法从远程 server 或 connector 导入工具。检查 `server_url` 或 `connector_id`、认证、服务器连接性，以及你指定的任何 `allowed_tools` 名称。
- [`response.mcp_call.failed`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/mcp_call/failed)：模型选择了工具，但 tool call 未完成。检查事件 payload，以及后续 `mcp_call` item 中的 MCP 协议、执行或传输错误。
- `mcp_approval_request` 没有匹配的 `mcp_approval_response`：tool call 无法继续，直到你的客户端显式批准或拒绝它。
- 当 `mcp_list_tools.in_progress` 仍处于活动状态时开始一个轮次：只有已经完成加载的工具才有资格用于该轮次。
- 一个 response 使用 `tool_choice: "required"`，但当前没有可用工具：模型没有任何符合条件的工具可调用。等待 `mcp_list_tools.completed`，确认至少导入了一个工具，或对不要求工具的轮次使用不同的 `tool_choice`。
- MCP tool definition validation 在导入开始前失败：常见原因包括同一个 `tools` 数组中存在重复的 `server_label`、同时设置 `server_url` 和 `connector_id`、在初始 session 创建请求中两者都省略、使用无效的 `connector_id`，或同时发送 `authorization` 和 `headers.Authorization`。对于 connectors，完全不要发送 `headers.Authorization`。

## 批准或拒绝 MCP tool call

如果工具需要审批，Realtime API 会在 conversation 中插入一个 `mcp_approval_request` item。**要继续**，请发送新的 [`conversation.item.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/conversation/item/create) 事件，其中 `item.type` 为 `mcp_approval_response`。

批准一个 MCP request

```javascript
function approveMcpRequest(approvalRequestId) {
  const event = {
    type: "conversation.item.create",
    item: {
      id: `mcp_approval_${approvalRequestId}`,
      type: "mcp_approval_response",
      approval_request_id: approvalRequestId,
      approve: true,
    },
  };

  ws.send(JSON.stringify(event));
}
```

```python
def approve_mcp_request(ws, approval_request_id):
    event = {
        "type": "conversation.item.create",
        "item": {
            "id": f"mcp_approval_{approval_request_id}",
            "type": "mcp_approval_response",
            "approval_request_id": approval_request_id,
            "approve": True,
        },
    }

    ws.send(json.dumps(event))
```


如果你拒绝 request，请将 `approve` 设置为 `false`，并可选择包含 `reason`。

## 只为一个 response 使用 MCP

如果 MCP **只应在单个轮次中可用**，请将同一个 MCP tool 对象附加到 `response.tools`，而不是 `session.tools`：

在一个 response 上添加 MCP tools

```javascript
const event = {
  type: "response.create",
  response: {
    output_modalities: ["text"],
    input: [
      {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Which transport should I use for browser clients in the Realtime API?",
          },
        ],
      },
    ],
    tools: [
      {
        type: "mcp",
        server_label: "openai_docs",
        server_url: "https://developers.openai.com/mcp",
        allowed_tools: ["search_openai_docs", "fetch_openai_doc"],
        require_approval: "never",
      },
    ],
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "response.create",
    "response": {
        "output_modalities": ["text"],
        "input": [
            {
                "type": "message",
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Which transport should I use for browser clients in the Realtime API?",
                    }
                ],
            }
        ],
        "tools": [
            {
                "type": "mcp",
                "server_label": "openai_docs",
                "server_url": "https://developers.openai.com/mcp",
                "allowed_tools": ["search_openai_docs", "fetch_openai_doc"],
                "require_approval": "never",
            }
        ],
    },
}

ws.send(json.dumps(event))
```


当只有一个 response 需要外部上下文，或不同轮次应使用不同 MCP servers 时，这很有用。

## 复用先前定义的 server label

`server_label` 是当前 Realtime session 中工具定义的稳定句柄。你用
`server_label` 加 `server_url` 或 `connector_id` 定义一次 server 或 connector 后，之后的 `session.update` 或
`response.create` 事件可以只引用同一个 `server_label`，Realtime API 会复用先前定义，而不要求你再次发送完整 tool 对象。

复用先前定义的 connector

```javascript
const event = {
  type: "response.create",
  response: {
    output_modalities: ["text"],
    input: [
      {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Check my schedule for this afternoon.",
          },
        ],
      },
    ],
    // Reuses the google_calendar connector defined earlier in this session.
    tools: [
      {
        type: "mcp",
        server_label: "google_calendar",
      },
    ],
  },
};

ws.send(JSON.stringify(event));
```

```python
event = {
    "type": "response.create",
    "response": {
        "output_modalities": ["text"],
        "input": [
            {
                "type": "message",
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Check my schedule for this afternoon.",
                    }
                ],
            }
        ],
        # Reuses the google_calendar connector defined earlier in this session.
        "tools": [
            {
                "type": "mcp",
                "server_label": "google_calendar",
            }
        ],
    },
}

ws.send(json.dumps(event))
```


这种复用仅限当前 session。如果你启动新的 Realtime session，请再次发送完整 MCP definition，以便服务器导入其工具列表。
