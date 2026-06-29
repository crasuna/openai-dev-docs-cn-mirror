---
status: needs-review
sourceId: "58486297f0ec"
sourceChecksum: "58486297f0ec58f43998b62f3e70b24709ce6fabb2d17e81bf3161c606fde204"
sourceUrl: "https://developers.openai.com/api/docs/guides/tools-tool-search"
translatedAt: "2026-06-27T10:24:24.269Z"
translator: codex-gpt-5.5-xhigh
---

# Tool search 工具搜索

Tool search 允许模型根据需要动态搜索工具并将其加载到模型上下文中。这样你就可以避免一开始就把所有工具定义都加载到模型上下文中，并且**可能有助于降低总体 token 使用量和成本**。为实现最佳成本和延迟，tool search 被设计为**保留模型缓存**。当模型发现新工具时，它们会被注入到上下文窗口末尾。

只有 `gpt-5.4` 及后续模型支持 `tool_search`。

要激活 tool search，你必须做两件事：

1. 在 `tools` 数组中添加 `tool_search` 作为工具。
2. 如果你使用 [functions](https://developers.openai.com/api/docs/guides/function-calling#defining-functions)，请将想要延迟加载的函数标记为 `defer_loading: true`。如果你使用 [MCP servers](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)，请在 MCP server 工具定义上设置 `defer_loading: true`。

### 尽可能使用 namespaces

你可以将 tool search 与延迟的 [functions](https://developers.openai.com/api/docs/guides/function-calling#defining-functions)、[namespaces](https://developers.openai.com/api/docs/guides/function-calling#defining-namespaces) 或 [MCP servers](https://developers.openai.com/api/docs/guides/tools-connectors-mcp) 一起使用，但我们建议尽可能使用 namespaces 或 MCP servers。我们的模型主要是在这些 surface 上训练来进行搜索的，并且在那里 token savings 通常更明显。

对于 namespaces，`defer_loading` 适用于 namespace 内部的 functions，而不是 namespace 对象本身。

在请求开始时，模型仍会看到任何可搜索对象的名称和描述。对于 namespace 或 MCP server，这意味着模型一开始只会看到 namespace 或 server 的名称和描述，而不会看到其中各个函数的详细信息，直到 tool search 工具加载它们。对于单个延迟函数，模型仍会看到函数名称和描述，因此实践中 tool search 主要是在延迟参数 schema。

为了最大化 token savings，我们建议将延迟函数分组到 namespaces 或 MCP servers 中，并为它们提供清晰、高层的描述，让模型对其中包含的内容有强概览，从而可以有效搜索并只加载相关函数。作为最佳实践，目标是让每个 namespace 少于 10 个 functions，以获得更好的 token 效率和模型性能。

```json
{
    "tools": [
      {
// highlight-start:subtle
        "type": "namespace",
// highlight-end
        "name": "crm",
        "description": "CRM tools for customer lookup and order management.",
        "tools": [
          {
            "type": "function",
            "name": "list_open_orders",
            "description": "List open orders for a customer ID.",
// highlight-start:subtle
            "defer_loading": true,
// highlight-end
            "parameters": {
              "type": "object",
              "properties": {
                "customer_id": { "type": "string" }
              },
              "required": ["customer_id"],
              "additionalProperties": false
            }
          }
        ]
      },
      {
        "type": "tool_search"
      }
    ]
  }
```


Namespaces 可以混合包含 deferred 和 non-deferred 工具。没有 `defer_loading: true` 的工具可以立即调用，而同一 namespace 中的 deferred tools 会通过 tool search 加载。

### Tool search 类型

使用 tool search 有两种方式：

- **Hosted tool search：**OpenAI 会在你在请求中声明的 deferred tools 中搜索，并在同一响应中返回已加载的子集。
- **Client-executed tool search：**模型发出 `tool_search_call`，你的应用执行查找，然后返回匹配的 `tool_search_output`。

如果 candidate tools 在创建请求时已经已知，请从 hosted tool search 开始。当 tool discovery 取决于 project state、tenant state 或由你的应用控制的另一个系统时，请使用 client-executed tool search。

## Hosted tool search

当你已经知道希望模型搜索的 [functions](https://developers.openai.com/api/docs/guides/function-calling#defining-functions)、[namespaces](https://developers.openai.com/api/docs/guides/function-calling#defining-namespaces) 或 [MCP servers](https://developers.openai.com/api/docs/guides/tools-connectors-mcp) 的完整 inventory 时，hosted tool search 是最简单的路径。你先声明它们，添加 `{"type": "tool_search"}`，然后让 API 决定加载什么。

配置 hosted tool search

```python
from openai import OpenAI

client = OpenAI()

crm_namespace = {
    "type": "namespace",
    "name": "crm",
    "description": "CRM tools for customer lookup and order management.",
    "tools": [
        {
            "type": "function",
            "name": "get_customer_profile",
            "description": "Fetch a customer profile by customer ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_id": {"type": "string"},
                },
                "required": ["customer_id"],
                "additionalProperties": False,
            },
        },
        {
            "type": "function",
            "name": "list_open_orders",
            "description": "List open orders for a customer ID.",
            # highlight-start:subtle
            "defer_loading": True,
            # highlight-end
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_id": {"type": "string"},
                },
                "required": ["customer_id"],
                "additionalProperties": False,
            },
        },
    ],
}

response = client.responses.create(
    model="gpt-5.5",
    input="List open orders for customer CUST-12345.",
    tools=[
        crm_namespace,
        # highlight-start:subtle
        {"type": "tool_search"},
        # highlight-end
    ],
    parallel_tool_calls=False,
)

print(response.output)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const crmNamespace = {
  type: "namespace",
  name: "crm",
  description: "CRM tools for customer lookup and order management.",
  tools: [
    {
      type: "function",
      name: "get_customer_profile",
      description: "Fetch a customer profile by customer ID.",
      parameters: {
        type: "object",
        properties: {
          customer_id: { type: "string" },
        },
        required: ["customer_id"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "list_open_orders",
      description: "List open orders for a customer ID.",
      // highlight-start:subtle
      defer_loading: true,
      // highlight-end
      parameters: {
        type: "object",
        properties: {
          customer_id: { type: "string" },
        },
        required: ["customer_id"],
        additionalProperties: false,
      },
    },
  ],
};

const response = await client.responses.create({
  model: "gpt-5.5",
  input: "List open orders for customer CUST-12345.",
  // highlight-start:subtle
  tools: [crmNamespace, { type: "tool_search" }],
  // highlight-end
  parallel_tool_calls: false,
});

console.log(response.output);
```


如果模型判断它需要 deferred tool，响应会在最终 function call 之前包含两个额外 output items：

- `tool_search_call`，记录 hosted search 步骤。
- `tool_search_output`，包含已加载并变为可调用的子集。

Hosted tool search 响应

```json
[
  {
    // highlight-start:subtle
    "type": "tool_search_call",
    // highlight-end
    "execution": "server",
    "call_id": null,
    "status": "completed",
    "arguments": {
      "paths": ["crm"]
    }
  },
  {
    // highlight-start:subtle
    "type": "tool_search_output",
    // highlight-end
    "execution": "server",
    "call_id": null,
    "status": "completed",
    "tools": [
      {
        "type": "namespace",
        "name": "crm",
        "description": "CRM tools for customer lookup and order management.",
        "tools": [
          {
            "type": "function",
            "name": "list_open_orders",
            "description": "List open orders for a customer ID.",
            "defer_loading": true,
            "parameters": {
              "type": "object",
              "properties": {
                "customer_id": { "type": "string" }
              },
              "required": ["customer_id"],
              "additionalProperties": false
            }
          }
        ]
      }
    ]
  },
  {
    "type": "function_call",
    "name": "list_open_orders",
    "namespace": "crm",
    "call_id": "call_abc123",
    "arguments": "{\"customer_id\":\"CUST-12345\"}"
  }
]
```


在 hosted 模式下，`execution` 设置为 `server`，`call_id` 设置为 `null`。

对于更复杂的任务，模型也可以在同一个 `tool_search_call` 中加载多个 namespaces 或 MCP servers。例如，如果它需要来自不同 namespaces 的函数来完成一个任务，它可能会选择一起搜索和加载这些 surfaces，然后再进行后续 function calls。

## Client-executed tool search

Client-executed tool search 让你的应用可以完全控制 tool discovery 的工作方式。当可用工具取决于不适合在初始 `tools` 列表中声明的信息时，这很有用。

使用 `execution: "client"` 和你的应用所期望的搜索参数 schema 来配置 `tool_search` 工具：

配置 client-executed tool search

```python
from openai import OpenAI

client = OpenAI()

first_response = client.responses.create(
    model="gpt-5.5",
    input="Find the shipping ETA tool first, then use it for order_42.",
    tools=[
        {
            "type": "tool_search",
            # highlight-start:subtle
            "execution": "client",
            # highlight-end
            "description": "Find the project-specific tools needed to continue the task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "goal": {"type": "string"},
                },
                "required": ["goal"],
                "additionalProperties": False,
            },
        }
    ],
    parallel_tool_calls=False,
)

search_call = next(
    item for item in first_response.output if item.type == "tool_search_call"
)

loaded_tools = [
    {
        "type": "function",
        "name": "get_shipping_eta",
        "description": "Look up shipping ETA details for an order.",
        "defer_loading": True,
        "parameters": {
            "type": "object",
            "properties": {
                "order_id": {"type": "string"},
            },
            "required": ["order_id"],
            "additionalProperties": False,
        },
    }
]

second_response = client.responses.create(
    model="gpt-5.5",
    input=[
        *first_response.output,
        {
            # highlight-start:subtle
            "type": "tool_search_output",
            # highlight-end
            "execution": "client",
            "call_id": search_call.call_id,
            "status": "completed",
            # highlight-start:subtle
            "tools": loaded_tools,
            # highlight-end
        },
    ],
)

print(second_response.output)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const firstResponse = await client.responses.create({
  model: "gpt-5.5",
  input: "Find the shipping ETA tool first, then use it for order_42.",
  tools: [
    {
      type: "tool_search",
      // highlight-start:subtle
      execution: "client",
      // highlight-end
      description: "Find the project-specific tools needed to continue the task.",
      parameters: {
        type: "object",
        properties: {
          goal: { type: "string" },
        },
        required: ["goal"],
        additionalProperties: false,
      },
    },
  ],
  parallel_tool_calls: false,
});

const searchCall = firstResponse.output.find(
  (item) => item.type === "tool_search_call",
);

const loadedTools = [
  {
    type: "function",
    name: "get_shipping_eta",
    description: "Look up shipping ETA details for an order.",
    defer_loading: true,
    parameters: {
      type: "object",
      properties: {
        order_id: { type: "string" },
      },
      required: ["order_id"],
      additionalProperties: false,
    },
  },
];

const secondResponse = await client.responses.create({
  model: "gpt-5.5",
  input: [
    ...firstResponse.output,
    {
      // highlight-start:subtle
      type: "tool_search_output",
      // highlight-end
      execution: "client",
      call_id: searchCall.call_id,
      status: "completed",
      // highlight-start:subtle
      tools: loadedTools,
      // highlight-end
    },
  ],
});

console.log(secondResponse.output);
```


第一轮中，模型会发出 `tool_search_call` 并停在那里：

Client tool search call

```json
[
  {
    "type": "tool_search_call",
    "execution": "client",
    "call_id": "call_abc123",
    "status": "completed",
    "arguments": {
      "goal": "Find the shipping ETA tool for order_42."
    }
  }
]
```


然后你的应用执行搜索，并返回带有希望加载工具的 `tool_search_output`：

返回 tool_search_output

```json
[
  {
    "type": "tool_search_output",
    "execution": "client",
    "call_id": "call_abc123",
    "status": "completed",
    "tools": [
      {
        "type": "function",
        "name": "get_shipping_eta",
        "description": "Look up shipping ETA details for an order.",
        "defer_loading": true,
        "parameters": {
          "type": "object",
          "properties": {
            "order_id": { "type": "string" }
          },
          "required": ["order_id"],
          "additionalProperties": false
        }
      }
    ]
  }
]
```


下一轮中，已加载工具可以像普通函数一样调用：

已加载函数调用

```json
[
  {
    "type": "function_call",
    "name": "get_shipping_eta",
    "namespace": "get_shipping_eta",
    "call_id": "call_xyz456",
    "arguments": "{\"order_id\":\"order_42\"}"
  }
]
```


在 client 模式下，`execution` 设置为 `client`，并定义 `call_id`。在你的 `tool_search_output` 中回显来自 `tool_search_call` 的同一个 `call_id`。

## 高级用法

### 保持 namespace descriptions 清晰

Namespace descriptions 要清楚，并描述用例，因为模型依赖这段描述来决定何时加载该 namespace 中的一部分函数。避免过长描述。相反，把更丰富的细节放在 deferred function descriptions 中，只在需要时加载。

### 理解会加载什么

`tool_search_output.tools` 包含模型动态加载的工具列表。模型将能够在未来轮次中调用这些工具，因此在 client 模式下，你不需要跨轮次重复加载同一个工具。未列入此数组的工具将不可用于模型。如果你想禁用已加载工具，可以从定义已加载工具集的 `tool_search_output` item 中移除它，但请注意，更改已加载工具集会从那一点开始破坏模型缓存。

### 高级注入模式

大多数集成会在请求的 `tools` 参数中声明工具。Client-executed tool search 还支持更高级的模式，即你的应用返回原始请求中不存在的工具。请将其视为高级 workflow：仔细验证返回的 schemas，并且只暴露受信任的工具定义。

### Tool search 与缓存

所有工具都加载到模型上下文窗口的末尾。Hosted tool search 和 client-executed tool search 都如此。这可以让模型缓存从一个请求保留到下一个请求，从而降低总体成本并提升速度。

### 在输入中的特定位置添加工具

对于高级 workflows，你可以使用 `additional_tools` input item，让工具在对话中的特定位置可用。当你的应用在普通 tool search 流之外加载工具，或需要保留先前响应期间添加工具的顺序时，这很有用。

将 `role` 设置为 `developer`，并在 item 的 `tools` 数组中包含要添加的工具：

```json
{
    "type": "additional_tools",
    "role": "developer",
    "tools": [
      {
        "type": "function",
        "name": "get_customer",
        "description": "Look up a customer by ID.",
        "parameters": {
          "type": "object",
          "properties": {
            "customer_id": { "type": "string" }
          },
          "required": ["customer_id"],
          "additionalProperties": false
        }
      }
    ]
  }
```


`additional_tools` item 中的工具只会在该 item 出现在输入之后变得可用。当你手动往返传递 conversation items 时，请保留该 item 的位置，使模型在对话中的同一位置看到相同工具。

## 相关指南

- 使用 [function calling](https://developers.openai.com/api/docs/guides/function-calling) 定义 callable functions 和 custom tools。
- 使用 [Using tools](https://developers.openai.com/api/docs/guides/tools) 了解 Responses 中更广泛的工具图景。
