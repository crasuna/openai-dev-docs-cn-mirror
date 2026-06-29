---
title: "MCP 和 Connectors"
description: "Use remote MCP servers and OpenAI-maintained connectors for popular services to give models new capabilities."
outline: deep
---

# MCP 和 Connectors

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/tools-connectors-mcp](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/tools-connectors-mcp.md](https://developers.openai.com/api/docs/guides/tools-connectors-mcp.md)
- 抓取时间：2026-06-27T05:54:10.331Z
- Checksum：`9ff9fb04e231ef415aa6f8aaf560e8cf3c1e3b608a39681151a139a4015785f3`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
除了可以通过 [function calling](/mirror/api/docs/guides/function-calling) 提供给模型的工具之外，你还可以使用 **connectors** 和 **remote MCP servers** 为模型赋予新能力。这些工具让模型能够在需要响应用户 prompt 时连接并控制外部服务。你可以允许这些工具调用自动进行，也可以限制为必须由你作为开发者明确批准。

- **Connectors** 是 OpenAI 维护的 MCP wrapper，面向 Google Workspace 或 Dropbox 等常用服务，类似 [ChatGPT](https://chatgpt.com) 中可用的 connectors。
- **Remote MCP servers** 可以是公共互联网上任何实现了远程 [Model Context Protocol](https://modelcontextprotocol.io/introduction)（MCP）server 的服务器。

本指南将展示如何同时使用 remote MCP servers 和 connectors，为模型提供新能力的访问权限。

## Secure MCP Tunnel

如果你的 MCP server 是私有的、本地部署的，或位于防火墙之后，请使用 [Secure MCP Tunnel](/mirror/api/docs/guides/secure-mcp-tunnels) 将其连接到受支持的 OpenAI 产品，而无需把服务器暴露到公共互联网。请从 [openai/tunnel-client](https://github.com/openai/tunnel-client/releases/latest) 下载最新公开版本。

## Quickstart

查看下面的示例，了解 remote MCP servers 和 connectors 如何通过 [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) 工作。Connectors 和 remote MCP servers 都可以与 `mcp` 内置工具类型一起使用。




使用 remote MCP servers

        Remote MCP servers 需要一个 &lt;code&gt;server_url&lt;/code&gt;。根据 server 不同，
        你可能还需要一个 OAuth &lt;code&gt;authorization&lt;/code&gt; 参数，其中包含
        access token。


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
        &lt;strong&gt;风险和安全&lt;/strong&gt;部分。



使用 connectors

        Connectors 需要一个 &lt;code&gt;connector_id&lt;/code&gt; 参数，以及你的应用在
        &lt;code&gt;authorization&lt;/code&gt; 参数中提供的 OAuth access token。


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

MCP 工具（用于 remote MCP servers 和 connectors）可在 [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) 中与最新的大多数模型一起使用。请在[这里](https://developers.openai.com/api/docs/models)检查你的模型是否兼容 MCP 工具。使用 MCP 工具时，你只需为导入工具定义或进行工具调用时使用的 [tokens](/mirror/api/docs/pricing) 付费。每次工具调用没有额外费用。

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
  [conversation](/mirror/api/docs/guides/conversation-state) 的每一轮都再次从 MCP server 获取工具列表。我们建议你在每个
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


这里我们使用 `previous_response_id` 参数，把这个新的 Response 与生成审批请求的前一个 Response 串接起来。不过，你也可以将[一个 response 的 outputs 作为另一个 response 的 inputs 传回](/mirror/api/docs/guides/conversation-state#manually-manage-conversation-state)，以最大化控制哪些内容进入模型上下文。

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



Tool
Description
Scopes


`search`
在 Dropbox 中搜索匹配查询的文件
files.metadata.read, account_info.read


`fetch`
按路径获取文件，并可选择原始下载
files.content.read


`search_files`
搜索 Dropbox 文件并返回结果
files.metadata.read, account_info.read


`fetch_file`
检索文件的文本或原始内容
files.content.read, account_info.read


`list_recent_files`
返回当前用户可访问的最近修改文件
files.metadata.read, account_info.read


`get_profile`
检索当前用户的 Dropbox profile
account_info.read



Gmail



Tool
Description
Scopes


`get_profile`
返回当前 Gmail 用户的 profile
userinfo.email, userinfo.profile


`search_emails`
搜索匹配查询或 label 的 Gmail 邮件
gmail.modify


`search_email_ids`
检索匹配搜索条件的 Gmail message IDs
gmail.modify


`get_recent_emails`
返回最近收到的 Gmail messages
gmail.modify


`read_email`
获取单个 Gmail message，包括正文
gmail.modify


`batch_read_email`
在一次调用中读取多条 Gmail messages
gmail.modify



Google Calendar



Tool
Description
Scopes


`get_profile`
返回当前 Calendar 用户的 profile
userinfo.email, userinfo.profile


`search`
在可选时间窗口内搜索 Calendar events
calendar.events


`fetch`
获取单个 Calendar event 的详情
calendar.events


`search_events`
使用 filters 查找 Calendar events
calendar.events


`read_event`
按 ID 读取 Google Calendar event
calendar.events



Google Drive



Tool
Description
Scopes


`get_profile`
返回当前 Drive 用户的 profile
userinfo.email, userinfo.profile


`list_drives`
列出当前用户可访问的 shared drives
drive.readonly


`search`
使用查询搜索 Drive 文件
drive.readonly


`recent_documents`
返回最近修改的 documents
drive.readonly


`fetch`
下载 Drive 文件内容
drive.readonly



Microsoft Teams



Tool
Description
Scopes


`search`
搜索 Microsoft Teams chats 和 channel messages
Chat.Read, ChannelMessage.Read.All


`fetch`
按路径获取 Teams message
Chat.Read, ChannelMessage.Read.All


`get_chat_members`
列出 Teams chat 的成员
Chat.Read


`get_profile`
返回已认证 Teams 用户的 profile
User.Read



Outlook Calendar



Tool
Description
Scopes


`search_events`
使用日期 filters 搜索 Outlook Calendar events
Calendars.Read


`fetch_event`
检索单个 event 的详情
Calendars.Read


`fetch_events_batch`
在一次调用中检索多个 events
Calendars.Read


`list_events`
列出某个日期范围内的 calendar events
Calendars.Read


`get_profile`
检索当前用户的 profile
User.Read



Outlook Email



Tool
Description
Scopes


`get_profile`
返回 Outlook account 的 profile 信息
User.Read


`list_messages`
从文件夹检索 Outlook emails
Mail.Read


`search_messages`
使用可选 filters 搜索 Outlook emails
Mail.Read


`get_recent_emails`
返回最近收到的 emails
Mail.Read


`fetch_message`
按 ID 获取单封 email
Mail.Read


`fetch_messages_batch`
在一次请求中检索多封 emails
Mail.Read



Sharepoint



Tool
Description
Scopes


`get_site`
按 hostname 和 path 解析 SharePoint site
Sites.Read.All


`search`
按 keyword 搜索 SharePoint/OneDrive documents
Sites.Read.All, Files.Read.All


`list_recent_documents`
返回最近访问的 documents
Files.Read.All


`fetch`
从 Graph file download URL 获取内容
Files.Read.All


`get_profile`
检索当前用户的 profile
User.Read



## 延迟加载 MCP server 中的工具

如果你使用 [tool search](/mirror/api/docs/guides/tools-tool-search)，可以推迟加载 MCP server 暴露的 functions，直到模型决定需要它们。为此，请在 MCP server 工具定义上设置 `defer_loading: true`。

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

换句话说，如果你是一个在欧洲使用 Data Residency 的组织，OpenAI 会将 Customer Content 的推理和存储限制在欧洲进行，直到通信或数据被发送给 MCP server 为止。你有责任确保 MCP server 也遵守你可能拥有的任何 Zero Data Retention 或 Data Residency 要求。请在[这里](/mirror/api/docs/guides/your-data)了解更多关于 Zero Data Retention 和 Data Residency 的信息。

## 使用说明




 


API Availability
Rate limits
Notes





    [Responses](https://developers.openai.com/api/docs/api-reference/responses)


    [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat)


    [Assistants](https://developers.openai.com/api/docs/api-reference/assistants)



**Tier 1**&lt;br/&gt;
200 RPM

**Tier 2 and 3**&lt;br/&gt;
1000 RPM

**Tier 4 and 5**&lt;br/&gt;
2000 RPM



[Pricing](/mirror/api/docs/pricing#built-in-tools) &lt;br/&gt;
[ZDR and data residency](/mirror/api/docs/guides/your-data)






:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
In addition to tools you make available to the model with [function calling](https://developers.openai.com/api/docs/guides/function-calling), you can give models new capabilities using **connectors** and **remote MCP servers**. These tools give the model the ability to connect to and control external services when needed to respond to a user's prompt. These tool calls can either be allowed automatically, or restricted with explicit approval required by you as the developer.

- **Connectors** are OpenAI-maintained MCP wrappers for popular services like Google Workspace or Dropbox, like the connectors available in [ChatGPT](https://chatgpt.com).
- **Remote MCP servers** can be any server on the public Internet that implements a remote [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) server.

This guide will show how to use both remote MCP servers and connectors to give the model access to new capabilities.

## Secure MCP Tunnel

If your MCP server is private, on-premises, or behind a firewall, use [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) to connect it to supported OpenAI products without exposing the server to the public internet. Download the latest public release from [openai/tunnel-client](https://github.com/openai/tunnel-client/releases/latest).

## Quickstart

Check out the examples below to see how remote MCP servers and connectors work through the [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create). Both connectors and remote MCP servers can be used with the `mcp` built-in tool type.



<div data-content-switcher-pane data-value="remote-mcp">
    <div class="hidden">Using remote MCP servers</div>
    <p>
        Remote MCP servers require a <code>server_url</code>. Depending on the server,
        you may also need an OAuth <code>authorization</code> parameter containing an
        access token.
    </p>

    Using a remote MCP server in the Responses API

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


    It is very important that developers trust any remote MCP server they use with
        the Responses API. A malicious server can exfiltrate sensitive data from
        anything that enters the model's context. Carefully review the 
        <strong>Risks and Safety</strong> section below before using this tool.

  </div>
  <div data-content-switcher-pane data-value="connector" hidden>
    <div class="hidden">Using connectors</div>
    <p>
        Connectors require a <code>connector_id</code> parameter, and an OAuth access
        token provided by your application in the <code>authorization</code> parameter.
    </p>

    Using connectors in the Responses API

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



The API will return new items in the `output` array of the model response. If the model decides to use a Connector or MCP server, it will first make a request to list available tools from the server, which will create a `mcp_list_tools` output item. From the simple remote MCP server example above, it contains only one tool definition:

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

If the model decides to call one of the available tools from the MCP server, you will also find a `mcp_call` output which will show what the model sent to the MCP tool, and what the MCP tool sent back as output.

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

Read on in the guide below to learn more about how the MCP tool works, how to filter available tools, and how to handle tool call approval requests.

## How it works

The MCP tool (for both remote MCP servers and connectors) is available in the [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) in most recent models. Check MCP tool compatibility for your model [here](https://developers.openai.com/api/docs/models). When you're using the MCP tool, you only pay for [tokens](https://developers.openai.com/api/docs/pricing) used when importing tool definitions or making tool calls. There are no additional fees involved per tool call.

Below, we'll step through the process the API takes when calling an MCP tool.

### Step 1: Listing available tools

When you specify a remote MCP server in the `tools` parameter, the API will attempt to get a list of tools from the server. The Responses API works with remote MCP servers that support either the Streamable HTTP or the HTTP/SSE transport protocols.

If successful in retrieving the list of tools, a new `mcp_list_tools` output item will appear in the model response output. The `tools` property of this object will show the tools that were successfully imported.

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

As long as the `mcp_list_tools` item is present in the context of an API
  request, the API will not fetch a list of tools from the MCP server again at
  each turn in a [conversation](https://developers.openai.com/api/docs/guides/conversation-state). We
  recommend you keep this item in the model's context as part of every
  conversation or workflow execution to optimize for latency.

#### Filtering tools

Some MCP servers can have dozens of tools, and exposing many tools to the model can result in high cost and latency. If you're only interested in a subset of tools an MCP server exposes, you can use the `allowed_tools` parameter to only import those tools.

Constrain allowed tools

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


### Step 2: Calling tools

Once the model has access to these tool definitions, it may choose to call them depending on what's in the model's context. When the model decides to call an MCP tool, the API will make an request to the remote MCP server to call the tool and put its output into the model's context. This creates an `mcp_call` item which looks like this:

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

This item includes both the arguments the model decided to use for this tool call, and the `output` that the remote MCP server returned. All models can choose to make multiple MCP tool calls, so you may see several of these items generated in a single API request.

Failed tool calls will populate the error field of this item with MCP protocol errors, MCP tool execution errors, or general connectivity errors. The MCP errors are documented in the MCP spec [here](https://modelcontextprotocol.io/specification/2025-03-26/server/tools#error-handling).

#### Approvals

By default, OpenAI will request your approval before any data is shared with a connector or remote MCP server. Approvals help you maintain control and visibility over what data is being sent to an MCP server. We highly recommend that you carefully review (and optionally log) all data being shared with a remote MCP server. A request for an approval to make an MCP tool call creates a `mcp_approval_request` item in the Response's output that looks like this:

```json
{
  "id": "mcpr_68a619e1d82c8190b50c1ccba7ad18ef0d2d23a86136d339",
  "type": "mcp_approval_request",
  "arguments": "{\"diceRollExpression\":\"2d4 + 1\"}",
  "name": "roll",
  "server_label": "dmcp"
}
```

You can then respond to this by creating a new Response object and appending an `mcp_approval_response` item to it.

Approving the use of tools in an API request

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


Here we're using the `previous_response_id` parameter to chain this new Response, with the previous Response that generated the approval request. But you can also pass back the [outputs from one response, as inputs into another](https://developers.openai.com/api/docs/guides/conversation-state#manually-manage-conversation-state) for maximum control over what enter's the model's context.

If and when you feel comfortable trusting a remote MCP server, you can choose to skip the approvals for reduced latency. To do this, you can set the `require_approval` parameter of the MCP tool to an object listing just the tools you'd like to skip approvals for like shown below, or set it to the value `'never'` to skip approvals for all tools in that remote MCP server.

Never require approval for some tools

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


## Authentication

Unlike the [example MCP server we used above](https://dash.deno.com/playground/dmcp-server), most other MCP servers require authentication. The most common scheme is an OAuth access token. Provide this token using the `authorization` field of the MCP tool:

Use Stripe MCP tool

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


To prevent the leakage of sensitive tokens, the Responses API does not store the value you provide in the `authorization` field. This value will also not be visible in the Response object created. Because of this, you must send the `authorization` value in every Responses API creation request you make.

## Connectors

The Responses API has built-in support for a limited set of connectors to third-party services. These connectors let you pull in context from popular applications, like Dropbox and Gmail, to allow the model to interact with popular services.

Connectors can be used in the same way as remote MCP servers. Both let an OpenAI model access additional third-party tools in an API request. However, instead of passing a `server_url` as you would to call a remote MCP server, you pass a `connector_id` which uniquely identifies a connector available in the API.

### Available connectors

- Dropbox: `connector_dropbox`
- Gmail: `connector_gmail`
- Google Calendar: `connector_googlecalendar`
- Google Drive: `connector_googledrive`
- Microsoft Teams: `connector_microsoftteams`
- Outlook Calendar: `connector_outlookcalendar`
- Outlook Email: `connector_outlookemail`
- SharePoint: `connector_sharepoint`

We prioritized services that don't have official remote MCP servers. GitHub, for instance, has an official MCP server you can connect to by passing `https://api.githubcopilot.com/mcp/` to the `server_url` field in the MCP tool.

### Authorizing a connector

In the `authorization` field, pass in an OAuth access token. OAuth client registration and authorization must be handled separately by your application.

For testing purposes, you can use Google's [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) to generate temporary access tokens that you can use in an API request.

To use the playground to test the connectors API functionality, start by entering:

```
https://www.googleapis.com/auth/calendar.events
```

This authorization scope will enable the API to read Google Calendar events. In the UI under "Step 1: Select and authorize APIs".

After authorizing the application with your Google account, you will come to "Step 2: Exchange authorization code for tokens". This will generate an access token you can use in an API request using the Google Calendar connector:

Use the Google Calendar connector

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


An MCP tool call from a Connector will look the same as an MCP tool call from a remote MCP server, using the `mcp_call` output item type. In this case, both the arguments to and the response from the Connector are JSON strings:

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

### Available tools in each connector

The available tools depend on which scopes your OAuth token has available to it. Expand the tables below to see what tools you can use when connecting to each application.

Dropbox

<table>
    <tr>
      <th>Tool</th>
      <th>Description</th>
      <th>Scopes</th>
    </tr>
    <tr>
      <td>`search`</td>
      <td>Search Dropbox for files that match a query</td>
      <td>files.metadata.read, account_info.read</td>
    </tr>
    <tr>
      <td>`fetch`</td>
      <td>Fetch a file by path with optional raw download</td>
      <td>files.content.read</td>
    </tr>
    <tr>
      <td>`search_files`</td>
      <td>Search Dropbox files and return results</td>
      <td>files.metadata.read, account_info.read</td>
    </tr>
    <tr>
      <td>`fetch_file`</td>
      <td>Retrieve a file's text or raw content</td>
      <td>files.content.read, account_info.read</td>
    </tr>
    <tr>
      <td>`list_recent_files`</td>
      <td>Return the most recently modified files accessible to the user</td>
      <td>files.metadata.read, account_info.read</td>
    </tr>
    <tr>
      <td>`get_profile`</td>
      <td>Retrieve the Dropbox profile of the current user</td>
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
      <td>Return the current Gmail user's profile</td>
      <td>userinfo.email, userinfo.profile</td>
    </tr>
    <tr>
      <td>`search_emails`</td>
      <td>Search Gmail for emails matching a query or label</td>
      <td>gmail.modify</td>
    </tr>
    <tr>
      <td>`search_email_ids`</td>
      <td>Retrieve Gmail message IDs matching a search</td>
      <td>gmail.modify</td>
    </tr>
    <tr>
      <td>`get_recent_emails`</td>
      <td>Return the most recently received Gmail messages</td>
      <td>gmail.modify</td>
    </tr>
    <tr>
      <td>`read_email`</td>
      <td>Fetch a single Gmail message including its body</td>
      <td>gmail.modify</td>
    </tr>
    <tr>
      <td>`batch_read_email`</td>
      <td>Read multiple Gmail messages in one call</td>
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
      <td>Return the current Calendar user's profile</td>
      <td>userinfo.email, userinfo.profile</td>
    </tr>
    <tr>
      <td>`search`</td>
      <td>Search Calendar events within an optional time window</td>
      <td>calendar.events</td>
    </tr>
    <tr>
      <td>`fetch`</td>
      <td>Get details for a single Calendar event</td>
      <td>calendar.events</td>
    </tr>
    <tr>
      <td>`search_events`</td>
      <td>Look up Calendar events using filters</td>
      <td>calendar.events</td>
    </tr>
    <tr>
      <td>`read_event`</td>
      <td>Read a Google Calendar event by ID</td>
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
      <td>Return the current Drive user's profile</td>
      <td>userinfo.email, userinfo.profile</td>
    </tr>
    <tr>
      <td>`list_drives`</td>
      <td>List shared drives accessible to the user</td>
      <td>drive.readonly</td>
    </tr>
    <tr>
      <td>`search`</td>
      <td>Search Drive files using a query</td>
      <td>drive.readonly</td>
    </tr>
    <tr>
      <td>`recent_documents`</td>
      <td>Return the most recently modified documents</td>
      <td>drive.readonly</td>
    </tr>
    <tr>
      <td>`fetch`</td>
      <td>Download the content of a Drive file</td>
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
      <td>Search Microsoft Teams chats and channel messages</td>
      <td>Chat.Read, ChannelMessage.Read.All</td>
    </tr>
    <tr>
      <td>`fetch`</td>
      <td>Fetch a Teams message by path</td>
      <td>Chat.Read, ChannelMessage.Read.All</td>
    </tr>
    <tr>
      <td>`get_chat_members`</td>
      <td>List the members of a Teams chat</td>
      <td>Chat.Read</td>
    </tr>
    <tr>
      <td>`get_profile`</td>
      <td>Return the authenticated Teams user's profile</td>
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
      <td>Search Outlook Calendar events with date filters</td>
      <td>Calendars.Read</td>
    </tr>
    <tr>
      <td>`fetch_event`</td>
      <td>Retrieve details for a single event</td>
      <td>Calendars.Read</td>
    </tr>
    <tr>
      <td>`fetch_events_batch`</td>
      <td>Retrieve multiple events in one call</td>
      <td>Calendars.Read</td>
    </tr>
    <tr>
      <td>`list_events`</td>
      <td>List calendar events within a date range</td>
      <td>Calendars.Read</td>
    </tr>
    <tr>
      <td>`get_profile`</td>
      <td>Retrieve the current user's profile</td>
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
      <td>Return profile info for the Outlook account</td>
      <td>User.Read</td>
    </tr>
    <tr>
      <td>`list_messages`</td>
      <td>Retrieve Outlook emails from a folder</td>
      <td>Mail.Read</td>
    </tr>
    <tr>
      <td>`search_messages`</td>
      <td>Search Outlook emails with optional filters</td>
      <td>Mail.Read</td>
    </tr>
    <tr>
      <td>`get_recent_emails`</td>
      <td>Return the most recently received emails</td>
      <td>Mail.Read</td>
    </tr>
    <tr>
      <td>`fetch_message`</td>
      <td>Fetch a single email by ID</td>
      <td>Mail.Read</td>
    </tr>
    <tr>
      <td>`fetch_messages_batch`</td>
      <td>Retrieve multiple emails in one request</td>
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
      <td>Resolve a SharePoint site by hostname and path</td>
      <td>Sites.Read.All</td>
    </tr>
    <tr>
      <td>`search`</td>
      <td>Search SharePoint/OneDrive documents by keyword</td>
      <td>Sites.Read.All, Files.Read.All</td>
    </tr>
    <tr>
      <td>`list_recent_documents`</td>
      <td>Return recently accessed documents</td>
      <td>Files.Read.All</td>
    </tr>
    <tr>
      <td>`fetch`</td>
      <td>Fetch content from a Graph file download URL</td>
      <td>Files.Read.All</td>
    </tr>
    <tr>
      <td>`get_profile`</td>
      <td>Retrieve the current user's profile</td>
      <td>User.Read</td>
    </tr>
  </table>

## Defer loading tools in an MCP server

If you are using [tool search](https://developers.openai.com/api/docs/guides/tools-tool-search), you can defer loading the functions exposed by an MCP server until the model decides it needs them. To do this, set `defer_loading: true` on the MCP server tool definition.

When you defer loading an MCP server, the model can still use the MCP server's label and description to decide when to search it, but the individual function definitions are loaded only when needed. This can help reduce overall token usage, and it is most useful for MCP servers that expose large numbers of functions.

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


## Risks and safety

The MCP tool permits you to connect OpenAI models to external services. This is a powerful feature that comes with some risks.

For connectors, there is a risk of potentially sending sensitive data to OpenAI, or allowing models read access to potentially sensitive data in those services.

Remote MCP servers carry those same risks, but also have not been verified by OpenAI. These servers can allow models to access, send, and receive data, and take action in these services. All MCP servers are third-party services that are subject to their own terms and conditions.

If you come across a malicious MCP server, please report it to `security@openai.com`.

Below are some best practices to consider when integrating connectors and remote MCP servers.

#### Prompt injection

[Prompt injection](https://chatgpt.com/?prompt=what%20is%20prompt%20injection?) is an important security consideration in any LLM application, and is especially true when you give the model access to MCP servers and connectors which can access sensitive data or take action. Use these tools with appropriate caution and mitigations if the prompt for the model contains user-provided content.

#### Always require approval for sensitive actions

Use the available configurations of the `require_approval` and `allowed_tools` parameters to ensure that any sensitive actions require an approval flow.

#### URLs within MCP tool calls and outputs

It can be dangerous to request URLs or embed image URLs provided by tool call outputs either from connectors or remote MCP servers. Ensure that you trust the domains and services providing those URLs before embedding or otherwise using them in your application code.

#### Connecting to trusted servers

Pick official servers hosted by the service providers themselves (e.g. we recommend connecting to the Stripe server hosted by Stripe themselves on mcp.stripe.com, instead of a Stripe MCP server hosted by a third party). Because there aren't too many official remote MCP servers today, you may be tempted to use a MCP server hosted by an organization that doesn't operate that server and simply proxies request to that service via your API. If you must do this, be extra careful in doing your due diligence on these "aggregators", and carefully review how they use your data.

#### Log and review data being shared with third party MCP servers.

Because MCP servers define their own tool definitions, they may request for data that you may not always be comfortable sharing with the host of that MCP server. Because of this, the MCP tool in the Responses API defaults to requiring approvals of each MCP tool call being made. When developing your application, review the type of data being shared with these MCP servers carefully and robustly. Once you gain confidence in your trust of this MCP server, you can skip these approvals for more performant execution.

We also recommend logging any data sent to MCP servers. If you're using the Responses API with `store=true`, these data are already logged via the API for 30 days unless Zero Data Retention is enabled for your organization. You may also want to log these data in your own systems and perform periodic reviews on this to ensure data is being shared per your expectations.

Malicious MCP servers may include hidden instructions (prompt injections) designed to make OpenAI models behave unexpectedly. While OpenAI has implemented built-in safeguards to help detect and block these threats, it's essential to carefully review inputs and outputs, and ensure connections are established only with trusted servers.

MCP servers may update tool behavior unexpectedly, potentially leading to unintended or malicious behavior.

#### Implications on Zero Data Retention and Data Residency

The MCP tool is compatible with Zero Data Retention and Data Residency, but it's important to note that MCP servers are third-party services, and data sent to an MCP server is subject to their data retention and data residency policies.

In other words, if you're an organization with Data Residency in Europe, OpenAI will limit inference and storage of Customer Content to take place in Europe up until the point communication or data is sent to the MCP server. It is your responsibility to ensure that the MCP server also adheres to any Zero Data Retention or Data Residency requirements you may have. Learn more about Zero Data Retention and Data Residency [here](https://developers.openai.com/api/docs/guides/your-data).

## Usage notes

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
``````
:::
:::

