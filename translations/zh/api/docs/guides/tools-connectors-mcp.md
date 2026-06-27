---
status: needs-review
sourceId: "9ff9fb04e231"
sourceChecksum: "9ff9fb04e231ef415aa6f8aaf560e8cf3c1e3b608a39681151a139a4015785f3"
sourceUrl: "https://developers.openai.com/api/docs/guides/tools-connectors-mcp"
translatedAt: "2026-06-27T18:00:58.7410056+08:00"
translator: codex-gpt-5.5-xhigh
---

# MCP 和 Connectors

除了可以通过 [function calling](https://developers.openai.com/api/docs/guides/function-calling) 提供给模型的工具之外，你还可以使用 **connectors** 和 **remote MCP servers** 为模型赋予新能力。这些工具让模型能够在需要响应用户 prompt 时连接并控制外部服务。你可以允许这些工具调用自动进行，也可以限制为必须由你作为开发者明确批准。

- **Connectors** 是 OpenAI 维护的 MCP wrapper，面向 Google Workspace 或 Dropbox 等常用服务，类似 [ChatGPT](https://chatgpt.com) 中可用的 connectors。
- **Remote MCP servers** 可以是公共互联网上任何实现了远程 [Model Context Protocol](https://modelcontextprotocol.io/introduction)（MCP）server 的服务器。

本指南将展示如何同时使用 remote MCP servers 和 connectors，为模型提供新能力的访问权限。

## Secure MCP Tunnel

如果你的 MCP server 是私有的、本地部署的，或位于防火墙之后，请使用 [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) 将其连接到受支持的 OpenAI 产品，而无需把服务器暴露到公共互联网。请从 [openai/tunnel-client](https://github.com/openai/tunnel-client/releases/latest) 下载最新公开版本。

## Quickstart

查看下面的示例，了解 remote MCP servers 和 connectors 如何通过 [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) 工作。Connectors 和 remote MCP servers 都可以与 `mcp` 内置工具类型一起使用。



<div data-content-switcher-pane data-value="remote-mcp">
    <div class="hidden">使用 remote MCP servers</div>
    <p>
        Remote MCP servers 需要一个 <code>server_url</code>。根据 server 不同，
        你可能还需要一个 OAuth <code>authorization</code> 参数，其中包含
        access token。
    </p>

    在 Responses API 中使用 remote MCP server

```bash
curl https://api.openai.com/v1/responses \ 
-H "Content-Type: application/json" \ 
-H "Authorization: Bearer $OPENAI_API_KEY" \ 
-d '{
  "model": "gpt-5.5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "never"
      }
    ],
    "input": "Roll 2d4+1"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    {
      type: "mcp",
      server_label: "dmcp",
      server_description: "A Dungeons and Dragons MCP server to assist with dice rolling.",
      server_url: "https://dmcp-server.deno.dev/sse",
      require_approval: "never",
    },
  ],
  input: "Roll 2d4+1",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5.5",
    tools=[
        {
            "type": "mcp",
            "server_label": "dmcp",
            "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
            "server_url": "https://dmcp-server.deno.dev/sse",
            "require_approval": "never",
        },
    ],
    input="Roll 2d4+1",
)

print(resp.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "dmcp",
    serverUri: new Uri("https://dmcp-server.deno.dev/sse"),
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.NeverRequireApproval)
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Roll 2d4+1")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```


    开发者信任任何与 Responses API 搭配使用的 remote MCP server 非常重要。
        恶意 server 可以从进入模型上下文的任何内容中外泄敏感数据。在使用此工具前，请仔细阅读下面的
        <strong>风险和安全</strong>部分。

  </div>
  <div data-content-switcher-pane data-value="connector" hidden>
    <div class="hidden">使用 connectors</div>
    <p>
        Connectors 需要一个 <code>connector_id</code> 参数，以及你的应用在
        <code>authorization</code> 参数中提供的 OAuth access token。
    </p>

    在 Responses API 中使用 connectors

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
    "model": "gpt-5.5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "Dropbox",
        "connector_id": "connector_dropbox",
        "authorization": "<oauth access token>",
        "require_approval": "never"
      }
    ],
    "input": "Summarize the Q2 earnings report."
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    {
      type: "mcp",
      server_label: "Dropbox",
      connector_id: "connector_dropbox",
      authorization: "<oauth access token>",
      require_approval: "never",
    },
  ],
  input: "Summarize the Q2 earnings report.",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5.5",
    tools=[
        {
            "type": "mcp",
            "server_label": "Dropbox",
            "connector_id": "connector_dropbox",
            "authorization": "<oauth access token>",
            "require_approval": "never",
        },
    ],
    input="Summarize the Q2 earnings report.",
)

print(resp.output_text)
```

```csharp
using OpenAI.Responses;

string dropboxToken = Environment.GetEnvironmentVariable("DROPBOX_OAUTH_ACCESS_TOKEN")!;
string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "Dropbox",
    connectorId: McpToolConnectorId.Dropbox,
    authorizationToken: dropboxToken,
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.NeverRequireApproval)
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Summarize the Q2 earnings report.")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```


  </div>



API 会在模型响应的 `output` 数组中返回新的 items。如果模型决定使用 Connector 或 MCP server，它会先发出请求，从 server 列出可用工具，这会创建一个 `mcp_list_tools` output item。对于上面的简单 remote MCP server 示例，它只包含一个工具定义：

```json
{
  "id": "mcpl_68a6102a4968819c8177b05584dd627b0679e572a900e618",
  "type": "mcp_list_tools",
  "server_label": "dmcp",
  "tools": [
    {
      "annotations": null,
      "description": "Given a string of text describing a dice roll...",
      "input_schema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "diceRollExpression": {
            "type": "string"
          }
        },
        "required": ["diceRollExpression"],
        "additionalProperties": false
      },
      "name": "roll"
    }
  ]
}
```

如果模型决定调用 MCP server 提供的某个可用工具，你还会看到一个 `mcp_call` output，其中会显示模型发送给 MCP 工具的内容，以及 MCP 工具返回的输出。

```json
{
  "id": "mcp_68a6102d8948819c9b1490d36d5ffa4a0679e572a900e618",
  "type": "mcp_call",
  "approval_request_id": null,
  "arguments": "{\"diceRollExpression\":\"2d4 + 1\"}",
  "error": null,
  "name": "roll",
  "output": "4",
  "server_label": "dmcp"
}
```

继续阅读下面的指南，了解 MCP 工具如何工作、如何过滤可用工具，以及如何处理工具调用审批请求。

## 工作原理

MCP 工具（用于 remote MCP servers 和 connectors）可在 [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) 中与最新的大多数模型一起使用。请在[这里](https://developers.openai.com/api/docs/models)检查你的模型是否兼容 MCP 工具。使用 MCP 工具时，你只需为导入工具定义或进行工具调用时使用的 [tokens](https://developers.openai.com/api/docs/pricing) 付费。每次工具调用没有额外费用。

下面，我们将逐步说明 API 调用 MCP 工具时所经历的流程。

### 第 1 步：列出可用工具

当你在 `tools` 参数中指定 remote MCP server 时，API 会尝试从该 server 获取工具列表。Responses API 支持使用 Streamable HTTP 或 HTTP/SSE transport protocols 的 remote MCP servers。

如果成功检索工具列表，模型响应 output 中会出现一个新的 `mcp_list_tools` output item。该对象的 `tools` 属性会显示成功导入的工具。

```json
{
  "id": "mcpl_68a6102a4968819c8177b05584dd627b0679e572a900e618",
  "type": "mcp_list_tools",
  "server_label": "dmcp",
  "tools": [
    {
      "annotations": null,
      "description": "Given a string of text describing a dice roll...",
      "input_schema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "diceRollExpression": {
            "type": "string"
          }
        },
        "required": ["diceRollExpression"],
        "additionalProperties": false
      },
      "name": "roll"
    }
  ]
}
```

只要 `mcp_list_tools` item 存在于某个 API 请求的上下文中，API 就不会在
  [conversation](https://developers.openai.com/api/docs/guides/conversation-state) 的每一轮都再次从 MCP server 获取工具列表。我们建议你在每个
  conversation 或 workflow execution 中将此 item 保留在模型上下文里，以优化延迟。

#### 过滤工具

一些 MCP servers 可能有几十个工具，把大量工具暴露给模型可能导致高成本和高延迟。如果你只关注某个 MCP server 暴露的一部分工具，可以使用 `allowed_tools` 参数只导入这些工具。

限制允许的工具

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
    "model": "gpt-5.5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "never",
        "allowed_tools": ["roll"]
      }
    ],
    "input": "Roll 2d4+1"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5.5",
  tools: [{
    type: "mcp",
    server_label: "dmcp",
    server_description: "A Dungeons and Dragons MCP server to assist with dice rolling.",
    server_url: "https://dmcp-server.deno.dev/sse",
    require_approval: "never",
    allowed_tools: ["roll"],
  }],
  input: "Roll 2d4+1",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5.5",
    tools=[{
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "never",
        "allowed_tools": ["roll"],
    }],
    input="Roll 2d4+1",
)

print(resp.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "dmcp",
    serverUri: new Uri("https://dmcp-server.deno.dev/sse"),
    allowedTools: new McpToolFilter() { ToolNames = { "roll" } },
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.NeverRequireApproval)
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Roll 2d4+1")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```


### 第 2 步：调用工具

一旦模型能够访问这些工具定义，它就可能根据模型上下文中的内容选择调用它们。当模型决定调用 MCP 工具时，API 会向 remote MCP server 发出请求来调用该工具，并将其输出放入模型上下文。这会创建一个 `mcp_call` item，如下所示：

```json
{
  "id": "mcp_68a6102d8948819c9b1490d36d5ffa4a0679e572a900e618",
  "type": "mcp_call",
  "approval_request_id": null,
  "arguments": "{\"diceRollExpression\":\"2d4 + 1\"}",
  "error": null,
  "name": "roll",
  "output": "4",
  "server_label": "dmcp"
}
```

此 item 同时包含模型为这次工具调用决定使用的 arguments，以及 remote MCP server 返回的 `output`。所有模型都可以选择进行多次 MCP 工具调用，因此你可能会在单个 API 请求中看到生成多个这样的 items。

失败的工具调用会在此 item 的 error 字段中填入 MCP protocol errors、MCP tool execution errors 或一般 connectivity errors。MCP errors 记录在 MCP spec 的[这里](https://modelcontextprotocol.io/specification/2025-03-26/server/tools#error-handling)。

#### 审批

默认情况下，OpenAI 会在任何数据与 connector 或 remote MCP server 共享之前请求你的批准。审批有助于你保持对发送到 MCP server 的数据的控制和可见性。我们强烈建议你仔细审查（并可选择记录）所有将与 remote MCP server 共享的数据。请求批准某次 MCP 工具调用，会在 Response 的 output 中创建一个 `mcp_approval_request` item，如下所示：

```json
{
  "id": "mcpr_68a619e1d82c8190b50c1ccba7ad18ef0d2d23a86136d339",
  "type": "mcp_approval_request",
  "arguments": "{\"diceRollExpression\":\"2d4 + 1\"}",
  "name": "roll",
  "server_label": "dmcp"
}
```

随后你可以通过创建新的 Response object 并向其中追加一个 `mcp_approval_response` item 来响应该请求。

在 API 请求中批准使用工具

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
    "model": "gpt-5.5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "always",
      }
    ],
    "previous_response_id": "resp_682d498bdefc81918b4a6aa477bfafd904ad1e533afccbfa",
    "input": [{
      "type": "mcp_approval_response",
      "approve": true,
      "approval_request_id": "mcpr_682d498e3bd4819196a0ce1664f8e77b04ad1e533afccbfa"
    }]
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5.5",
  tools: [{
    type: "mcp",
    server_label: "dmcp",
    server_description: "A Dungeons and Dragons MCP server to assist with dice rolling.",
    server_url: "https://dmcp-server.deno.dev/sse",
    require_approval: "always",
  }],
  previous_response_id: "resp_682d498bdefc81918b4a6aa477bfafd904ad1e533afccbfa",
  input: [{
    type: "mcp_approval_response",
    approve: true,
    approval_request_id: "mcpr_682d498e3bd4819196a0ce1664f8e77b04ad1e533afccbfa"
  }],
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5.5",
    tools=[{
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "always",
    }],
    previous_response_id="resp_682d498bdefc81918b4a6aa477bfafd904ad1e533afccbfa",
    input=[{
        "type": "mcp_approval_response",
        "approve": True,
        "approval_request_id": "mcpr_682d498e3bd4819196a0ce1664f8e77b04ad1e533afccbfa"
    }],
)

print(resp.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "dmcp",
    serverUri: new Uri("https://dmcp-server.deno.dev/sse"),
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.AlwaysRequireApproval)
));

// STEP 1: Create response that requests tool call approval
OpenAIResponse response1 = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Roll 2d4+1")
    ])
], options);

McpToolCallApprovalRequestItem? approvalRequestItem = response1.OutputItems.Last() as McpToolCallApprovalRequestItem;

// STEP 2: Approve the tool call request and get final response
options.PreviousResponseId = response1.Id;
OpenAIResponse response2 = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateMcpApprovalResponseItem(approvalRequestItem!.Id, approved: true),
], options);

Console.WriteLine(response2.GetOutputText());
```


这里我们使用 `previous_response_id` 参数，把这个新的 Response 与生成审批请求的前一个 Response 串接起来。不过，你也可以将[一个 response 的 outputs 作为另一个 response 的 inputs 传回](https://developers.openai.com/api/docs/guides/conversation-state#manually-manage-conversation-state)，以最大化控制哪些内容进入模型上下文。

如果并且当你愿意信任某个 remote MCP server 时，可以选择跳过审批以降低延迟。为此，你可以将 MCP 工具的 `require_approval` 参数设置为一个对象，只列出希望跳过审批的工具，如下所示；也可以将其设置为 `'never'`，为该 remote MCP server 中的所有工具跳过审批。

对某些工具永不要求审批

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
    "model": "gpt-5.5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "require_approval": {
          "never": {
            "tool_names": ["ask_question", "read_wiki_structure"]
          }
        }
      }
    ],
    "input": "What transport protocols does the 2025-03-26 version of the MCP spec (modelcontextprotocol/modelcontextprotocol) support?"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    {
      type: "mcp",
      server_label: "deepwiki",
      server_url: "https://mcp.deepwiki.com/mcp",
      require_approval: {
        never: {
          tool_names: ["ask_question", "read_wiki_structure"]
        }
      }
    },
  ],
  input: "What transport protocols does the 2025-03-26 version of the MCP spec (modelcontextprotocol/modelcontextprotocol) support?",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5.5",
    tools=[
        {
            "type": "mcp",
            "server_label": "deepwiki",
            "server_url": "https://mcp.deepwiki.com/mcp",
            "require_approval": {
                "never": {
                    "tool_names": ["ask_question", "read_wiki_structure"]
                }
            }
        },
    ],
    input="What transport protocols does the 2025-03-26 version of the MCP spec (modelcontextprotocol/modelcontextprotocol) support?",
)

print(resp.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "deepwiki",
    serverUri: new Uri("https://mcp.deepwiki.com/mcp"),
    allowedTools: new McpToolFilter() { ToolNames = { "ask_question", "read_wiki_structure" } },
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.NeverRequireApproval)
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What transport protocols does the 2025-03-26 version of the MCP spec (modelcontextprotocol/modelcontextprotocol) support?")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```


## 认证

与我们上面使用的[示例 MCP server](https://dash.deno.com/playground/dmcp-server) 不同，大多数其他 MCP servers 都需要认证。最常见的方案是 OAuth access token。请使用 MCP 工具的 `authorization` 字段提供此 token：

使用 Stripe MCP 工具

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
    "model": "gpt-5.5",
    "input": "Create a payment link for $20",
    "tools": [
      {
        "type": "mcp",
        "server_label": "stripe",
        "server_url": "https://mcp.stripe.com",
        "authorization": "$STRIPE_OAUTH_ACCESS_TOKEN"
      }
    ]
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5.5",
  input: "Create a payment link for $20",
  tools: [
    {
      type: "mcp",
      server_label: "stripe",
      server_url: "https://mcp.stripe.com",
      authorization: "$STRIPE_OAUTH_ACCESS_TOKEN"
    }
  ]
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5.5",
    input="Create a payment link for $20",
    tools=[
        {
            "type": "mcp",
            "server_label": "stripe",
            "server_url": "https://mcp.stripe.com",
            "authorization": "$STRIPE_OAUTH_ACCESS_TOKEN"
        }
    ]
)

print(resp.output_text)
```

```csharp
using OpenAI.Responses;

string authToken = Environment.GetEnvironmentVariable("STRIPE_OAUTH_ACCESS_TOKEN")!;
string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "stripe",
    serverUri: new Uri("https://mcp.stripe.com"),
    authorizationToken: authToken
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Create a payment link for $20")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```


为防止敏感 token 泄漏，Responses API 不会存储你在 `authorization` 字段中提供的值。这个值也不会出现在已创建的 Response object 中。因此，你必须在每次创建 Responses API 请求时都发送 `authorization` 值。

## Connectors

Responses API 对一组有限的第三方服务 connectors 提供内置支持。这些 connectors 让你可以从 Dropbox 和 Gmail 等常用应用中拉取上下文，使模型能够与常用服务交互。

Connectors 的使用方式与 remote MCP servers 相同。二者都能让 OpenAI 模型在 API 请求中访问额外的第三方工具。不过，与调用 remote MCP server 时传入 `server_url` 不同，你需要传入 `connector_id`，它会唯一标识 API 中可用的 connector。

### 可用 connectors

- Dropbox: `connector_dropbox`
- Gmail: `connector_gmail`
- Google Calendar: `connector_googlecalendar`
- Google Drive: `connector_googledrive`
- Microsoft Teams: `connector_microsoftteams`
- Outlook Calendar: `connector_outlookcalendar`
- Outlook Email: `connector_outlookemail`
- SharePoint: `connector_sharepoint`

我们优先支持没有官方 remote MCP servers 的服务。例如 GitHub 有官方 MCP server，你可以通过在 MCP 工具的 `server_url` 字段中传入 `https://api.githubcopilot.com/mcp/` 来连接。

### 授权 connector

在 `authorization` 字段中传入 OAuth access token。OAuth client registration 和授权必须由你的应用单独处理。

出于测试目的，你可以使用 Google 的 [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) 生成临时 access tokens，然后在 API 请求中使用。

若要使用 playground 测试 connectors API 功能，请先输入：

```
https://www.googleapis.com/auth/calendar.events
```

这个授权 scope 会让 API 能够读取 Google Calendar events。在 UI 中，它位于 "Step 1: Select and authorize APIs" 下。

使用你的 Google 账户授权应用后，你会进入 "Step 2: Exchange authorization code for tokens"。这会生成一个 access token，你可以在使用 Google Calendar connector 的 API 请求中使用它：

使用 Google Calendar connector

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "google_calendar",
        "connector_id": "connector_googlecalendar",
        "authorization": "ya29.A0AS3H6...",
        "require_approval": "never"
      }
    ],
    "input": "What is on my Google Calendar for today?"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    {
      type: "mcp",
      server_label: "google_calendar",
      connector_id: "connector_googlecalendar",
      authorization: "ya29.A0AS3H6...",
      require_approval: "never",
    },
  ],
  input: "What's on my Google Calendar for today?",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5.5",
    tools=[
        {
            "type": "mcp",
            "server_label": "google_calendar",
            "connector_id": "connector_googlecalendar",
            "authorization": "ya29.A0AS3H6...",
            "require_approval": "never",
        },
    ],
    input="What's on my Google Calendar for today?",
)

print(resp.output_text)
```

```csharp
using OpenAI.Responses;

string authToken = Environment.GetEnvironmentVariable("GOOGLE_CALENDAR_OAUTH_ACCESS_TOKEN")!;
string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "google_calendar",
    connectorId: McpToolConnectorId.GoogleCalendar,
    authorizationToken: authToken,
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.NeverRequireApproval)
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What's on my Google Calendar for today?")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```


来自 Connector 的 MCP 工具调用看起来与来自 remote MCP server 的 MCP 工具调用相同，都会使用 `mcp_call` output item type。在这种情况下，传给 Connector 的 arguments 和 Connector 返回的 response 都是 JSON strings：

```json
{
  "id": "mcp_68a62ae1c93c81a2b98c29340aa3ed8800e9b63986850588",
  "type": "mcp_call",
  "approval_request_id": null,
  "arguments": "{\"time_min\":\"2025-08-20T00:00:00\",\"time_max\":\"2025-08-21T00:00:00\",\"timezone_str\":null,\"max_results\":50,\"query\":null,\"calendar_id\":null,\"next_page_token\":null}",
  "error": null,
  "name": "search_events",
  "output": "{\"events\": [{\"id\": \"2n8ni54ani58pc3ii6soelupcs_20250820\", \"summary\": \"Home\", \"location\": null, \"start\": \"2025-08-20T00:00:00\", \"end\": \"2025-08-21T00:00:00\", \"url\": \"https://www.google.com/calendar/event?eid=Mm44bmk1NGFuaTU4cGMzaWk2c29lbHVwY3NfMjAyNTA4MjAga3doaW5uZXJ5QG9wZW5haS5jb20&ctz=America/Los_Angeles\", \"description\": \"\\n\\n\", \"transparency\": \"transparent\", \"display_url\": \"https://www.google.com/calendar/event?eid=Mm44bmk1NGFuaTU4cGMzaWk2c29lbHVwY3NfMjAyNTA4MjAga3doaW5uZXJ5QG9wZW5haS5jb20&ctz=America/Los_Angeles\", \"display_title\": \"Home\"}], \"next_page_token\": null}",
  "server_label": "Google_Calendar"
}
```

### 每个 connector 中的可用工具

可用工具取决于你的 OAuth token 可用的 scopes。展开下面的表格，查看连接到每个应用时可以使用哪些工具。

Dropbox

<table>
    <tr>
      <th>Tool</th>
      <th>Description</th>
      <th>Scopes</th>
    </tr>
    <tr>
      <td>`search`</td>
      <td>在 Dropbox 中搜索匹配查询的文件</td>
      <td>files.metadata.read, account_info.read</td>
    </tr>
    <tr>
      <td>`fetch`</td>
      <td>按路径获取文件，并可选择原始下载</td>
      <td>files.content.read</td>
    </tr>
    <tr>
      <td>`search_files`</td>
      <td>搜索 Dropbox 文件并返回结果</td>
      <td>files.metadata.read, account_info.read</td>
    </tr>
    <tr>
      <td>`fetch_file`</td>
      <td>检索文件的文本或原始内容</td>
      <td>files.content.read, account_info.read</td>
    </tr>
    <tr>
      <td>`list_recent_files`</td>
      <td>返回当前用户可访问的最近修改文件</td>
      <td>files.metadata.read, account_info.read</td>
    </tr>
    <tr>
      <td>`get_profile`</td>
      <td>检索当前用户的 Dropbox profile</td>
      <td>account_info.read</td>
    </tr>
  </table>

Gmail

<table>
    <tr>
      <th>Tool</th>
      <th>Description</th>
      <th>Scopes</th>
    </tr>
    <tr>
      <td>`get_profile`</td>
      <td>返回当前 Gmail 用户的 profile</td>
      <td>userinfo.email, userinfo.profile</td>
    </tr>
    <tr>
      <td>`search_emails`</td>
      <td>搜索匹配查询或 label 的 Gmail 邮件</td>
      <td>gmail.modify</td>
    </tr>
    <tr>
      <td>`search_email_ids`</td>
      <td>检索匹配搜索条件的 Gmail message IDs</td>
      <td>gmail.modify</td>
    </tr>
    <tr>
      <td>`get_recent_emails`</td>
      <td>返回最近收到的 Gmail messages</td>
      <td>gmail.modify</td>
    </tr>
    <tr>
      <td>`read_email`</td>
      <td>获取单个 Gmail message，包括正文</td>
      <td>gmail.modify</td>
    </tr>
    <tr>
      <td>`batch_read_email`</td>
      <td>在一次调用中读取多条 Gmail messages</td>
      <td>gmail.modify</td>
    </tr>
  </table>

Google Calendar

<table>
    <tr>
      <th>Tool</th>
      <th>Description</th>
      <th>Scopes</th>
    </tr>
    <tr>
      <td>`get_profile`</td>
      <td>返回当前 Calendar 用户的 profile</td>
      <td>userinfo.email, userinfo.profile</td>
    </tr>
    <tr>
      <td>`search`</td>
      <td>在可选时间窗口内搜索 Calendar events</td>
      <td>calendar.events</td>
    </tr>
    <tr>
      <td>`fetch`</td>
      <td>获取单个 Calendar event 的详情</td>
      <td>calendar.events</td>
    </tr>
    <tr>
      <td>`search_events`</td>
      <td>使用 filters 查找 Calendar events</td>
      <td>calendar.events</td>
    </tr>
    <tr>
      <td>`read_event`</td>
      <td>按 ID 读取 Google Calendar event</td>
      <td>calendar.events</td>
    </tr>
  </table>

Google Drive

<table>
    <tr>
      <th>Tool</th>
      <th>Description</th>
      <th>Scopes</th>
    </tr>
    <tr>
      <td>`get_profile`</td>
      <td>返回当前 Drive 用户的 profile</td>
      <td>userinfo.email, userinfo.profile</td>
    </tr>
    <tr>
      <td>`list_drives`</td>
      <td>列出当前用户可访问的 shared drives</td>
      <td>drive.readonly</td>
    </tr>
    <tr>
      <td>`search`</td>
      <td>使用查询搜索 Drive 文件</td>
      <td>drive.readonly</td>
    </tr>
    <tr>
      <td>`recent_documents`</td>
      <td>返回最近修改的 documents</td>
      <td>drive.readonly</td>
    </tr>
    <tr>
      <td>`fetch`</td>
      <td>下载 Drive 文件内容</td>
      <td>drive.readonly</td>
    </tr>
  </table>

Microsoft Teams

<table>
    <tr>
      <th>Tool</th>
      <th>Description</th>
      <th>Scopes</th>
    </tr>
    <tr>
      <td>`search`</td>
      <td>搜索 Microsoft Teams chats 和 channel messages</td>
      <td>Chat.Read, ChannelMessage.Read.All</td>
    </tr>
    <tr>
      <td>`fetch`</td>
      <td>按路径获取 Teams message</td>
      <td>Chat.Read, ChannelMessage.Read.All</td>
    </tr>
    <tr>
      <td>`get_chat_members`</td>
      <td>列出 Teams chat 的成员</td>
      <td>Chat.Read</td>
    </tr>
    <tr>
      <td>`get_profile`</td>
      <td>返回已认证 Teams 用户的 profile</td>
      <td>User.Read</td>
    </tr>
  </table>

Outlook Calendar

<table>
    <tr>
      <th>Tool</th>
      <th>Description</th>
      <th>Scopes</th>
    </tr>
    <tr>
      <td>`search_events`</td>
      <td>使用日期 filters 搜索 Outlook Calendar events</td>
      <td>Calendars.Read</td>
    </tr>
    <tr>
      <td>`fetch_event`</td>
      <td>检索单个 event 的详情</td>
      <td>Calendars.Read</td>
    </tr>
    <tr>
      <td>`fetch_events_batch`</td>
      <td>在一次调用中检索多个 events</td>
      <td>Calendars.Read</td>
    </tr>
    <tr>
      <td>`list_events`</td>
      <td>列出某个日期范围内的 calendar events</td>
      <td>Calendars.Read</td>
    </tr>
    <tr>
      <td>`get_profile`</td>
      <td>检索当前用户的 profile</td>
      <td>User.Read</td>
    </tr>
  </table>

Outlook Email

<table>
    <tr>
      <th>Tool</th>
      <th>Description</th>
      <th>Scopes</th>
    </tr>
    <tr>
      <td>`get_profile`</td>
      <td>返回 Outlook account 的 profile 信息</td>
      <td>User.Read</td>
    </tr>
    <tr>
      <td>`list_messages`</td>
      <td>从文件夹检索 Outlook emails</td>
      <td>Mail.Read</td>
    </tr>
    <tr>
      <td>`search_messages`</td>
      <td>使用可选 filters 搜索 Outlook emails</td>
      <td>Mail.Read</td>
    </tr>
    <tr>
      <td>`get_recent_emails`</td>
      <td>返回最近收到的 emails</td>
      <td>Mail.Read</td>
    </tr>
    <tr>
      <td>`fetch_message`</td>
      <td>按 ID 获取单封 email</td>
      <td>Mail.Read</td>
    </tr>
    <tr>
      <td>`fetch_messages_batch`</td>
      <td>在一次请求中检索多封 emails</td>
      <td>Mail.Read</td>
    </tr>
  </table>

Sharepoint

<table>
    <tr>
      <th>Tool</th>
      <th>Description</th>
      <th>Scopes</th>
    </tr>
    <tr>
      <td>`get_site`</td>
      <td>按 hostname 和 path 解析 SharePoint site</td>
      <td>Sites.Read.All</td>
    </tr>
    <tr>
      <td>`search`</td>
      <td>按 keyword 搜索 SharePoint/OneDrive documents</td>
      <td>Sites.Read.All, Files.Read.All</td>
    </tr>
    <tr>
      <td>`list_recent_documents`</td>
      <td>返回最近访问的 documents</td>
      <td>Files.Read.All</td>
    </tr>
    <tr>
      <td>`fetch`</td>
      <td>从 Graph file download URL 获取内容</td>
      <td>Files.Read.All</td>
    </tr>
    <tr>
      <td>`get_profile`</td>
      <td>检索当前用户的 profile</td>
      <td>User.Read</td>
    </tr>
  </table>

## 延迟加载 MCP server 中的工具

如果你使用 [tool search](https://developers.openai.com/api/docs/guides/tools-tool-search)，可以推迟加载 MCP server 暴露的 functions，直到模型决定需要它们。为此，请在 MCP server 工具定义上设置 `defer_loading: true`。

当你延迟加载 MCP server 时，模型仍然可以使用 MCP server 的 label 和 description 来决定何时搜索它，但各个 function definitions 只有在需要时才会加载。这有助于降低整体 token 用量，对暴露大量 functions 的 MCP servers 尤其有用。

```json
{
    "type": "mcp",
    "server_label": "dmcp",
    "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
    "server_url": "https://dmcp-server.deno.dev/sse",
// highlight-start:subtle
    "defer_loading": true,
// highlight-end
    "require_approval": "never"
}
```


## 风险和安全

MCP 工具允许你将 OpenAI 模型连接到外部服务。这是一项强大的功能，也伴随一些风险。

对于 connectors，存在将敏感数据发送到 OpenAI，或允许模型读取这些服务中潜在敏感数据的风险。

Remote MCP servers 具有同样的风险，而且还没有经过 OpenAI 验证。这些 servers 可以允许模型访问、发送和接收数据，并在这些服务中采取行动。所有 MCP servers 都是第三方服务，受其自身条款和条件约束。

如果你遇到恶意 MCP server，请报告给 `security@openai.com`。

以下是在集成 connectors 和 remote MCP servers 时可考虑的一些最佳实践。

#### Prompt injection

[Prompt injection](https://chatgpt.com/?prompt=what%20is%20prompt%20injection?) 是任何 LLM 应用中的重要安全考量；当你让模型访问能够访问敏感数据或采取行动的 MCP servers 和 connectors 时，尤其如此。如果模型 prompt 包含用户提供的内容，请带着适当谨慎和缓解措施使用这些工具。

#### 对敏感操作始终要求审批

使用 `require_approval` 和 `allowed_tools` 参数的可用配置，确保任何敏感操作都需要审批流程。

#### MCP 工具调用和输出中的 URL

请求 URL 或嵌入由 connectors 或 remote MCP servers 的工具调用输出提供的图片 URL 可能存在危险。在将这些 URL 嵌入应用代码或以其他方式使用它们之前，请确保你信任提供这些 URL 的域名和服务。

#### 连接到受信任的 servers

选择由服务提供商自己托管的官方 servers（例如，我们建议连接到 Stripe 自己托管在 mcp.stripe.com 上的 Stripe server，而不是第三方托管的 Stripe MCP server）。由于目前官方 remote MCP servers 还不多，你可能会想使用由某个组织托管的 MCP server，该组织并不运营该服务，而只是通过你的 API 将请求代理到该服务。如果必须这样做，请格外谨慎地对这些“aggregators”进行尽职调查，并仔细审查它们如何使用你的数据。

#### 记录并审查与第三方 MCP servers 共享的数据。

由于 MCP servers 定义自己的工具定义，它们可能会请求你并不总是愿意与该 MCP server 主机共享的数据。因此，Responses API 中的 MCP 工具默认要求对每次 MCP 工具调用进行审批。在开发应用时，请仔细且稳健地审查与这些 MCP servers 共享的数据类型。当你对该 MCP server 的可信度建立信心后，可以跳过这些审批以获得更高性能的执行。

我们还建议记录发送给 MCP servers 的任何数据。如果你在使用 Responses API 时设置了 `store=true`，除非你的组织启用了 Zero Data Retention，否则这些数据已经会通过 API 记录 30 天。你可能还希望在自己的系统中记录这些数据，并对此进行定期审查，以确保数据共享符合你的预期。

恶意 MCP servers 可能包含隐藏 instructions（prompt injections），旨在让 OpenAI 模型出现非预期行为。虽然 OpenAI 已经实现内置防护措施来帮助检测并阻止这些威胁，但仍必须仔细审查输入和输出，并确保只与受信任的 servers 建立连接。

MCP servers 可能会意外更新工具行为，从而可能导致非预期或恶意行为。

#### 对 Zero Data Retention 和 Data Residency 的影响

MCP 工具兼容 Zero Data Retention 和 Data Residency，但需要注意，MCP servers 是第三方服务，发送给 MCP server 的数据受其数据保留和数据驻留政策约束。

换句话说，如果你是一个在欧洲使用 Data Residency 的组织，OpenAI 会将 Customer Content 的推理和存储限制在欧洲进行，直到通信或数据被发送给 MCP server 为止。你有责任确保 MCP server 也遵守你可能拥有的任何 Zero Data Retention 或 Data Residency 要求。请在[这里](https://developers.openai.com/api/docs/guides/your-data)了解更多关于 Zero Data Retention 和 Data Residency 的信息。

## 使用说明

<table>
  <tbody>

 

<tr>
  <th>API Availability</th>
  <th>Rate limits</th>
  <th>Notes</th>
</tr>

<tr>
<td>
<div className="mb-1 flex items-center gap-2">
    [Responses](https://developers.openai.com/api/docs/api-reference/responses)
</div>
<div className="mb-1 flex items-center gap-2">
    [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat)
</div>
<div className="mb-1 flex items-center gap-2">
    [Assistants](https://developers.openai.com/api/docs/api-reference/assistants)
</div>
</td>
<td style={{"maxWidth": "150px"}}>
**Tier 1**<br/>
200 RPM

**Tier 2 and 3**<br/>
1000 RPM

**Tier 4 and 5**<br/>
2000 RPM

</td>
<td style={{"maxWidth": "150px"}}>
[Pricing](https://developers.openai.com/api/docs/pricing#built-in-tools) <br/>
[ZDR and data residency](https://developers.openai.com/api/docs/guides/your-data)
</td>
</tr>

</tbody>
</table>
