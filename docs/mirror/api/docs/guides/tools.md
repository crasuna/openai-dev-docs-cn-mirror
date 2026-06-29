---
title: "使用工具"
description: "Use powerful tools like remote MCP servers, or built-in tools like web search and file search to extend the model's capabilities."
outline: deep
---

# 使用工具

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/tools](https://developers.openai.com/api/docs/guides/tools)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/tools.md](https://developers.openai.com/api/docs/guides/tools.md)
- 抓取时间：2026-06-27T05:54:09.577Z
- Checksum：`4b205df8b2bf84f99e95302d34a7953da087349e611d1e941199b3e67d6225b1`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
生成模型回答或构建 agents 时，你可以通过内置工具、function calling、tool search 和 remote MCP servers 扩展能力。这些能力让模型可以搜索网页、从你的文件中检索、在运行时加载延迟定义的工具、调用你自己的函数，或访问第三方服务。只有 `gpt-5.4` 及之后的模型支持 `tool_search`。




Web search


File search
    在响应中搜索你的文件

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }]
)
print(response)
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "What is deep research by OpenAI?",
    tools: [
        {
            type: "file_search",
            vector_store_ids: ["<vector_store_id>"],
        },
    ],
});
console.log(response);
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateFileSearchTool(["<vector_store_id>"]));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is deep research by OpenAI?"),
    ]),
], options);

Console.WriteLine(response.GetOutputText());
```



Tool search
    在运行时加载延迟工具

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



Function calling


Remote MCP
    调用 remote MCP server

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





## 可用工具

下面概览了 OpenAI platform 中可用的工具。请选择其中一个，进一步了解使用指导。


  



    调用自定义代码，让模型访问额外数据和能力。





  



    在模型响应生成中包含来自互联网的数据。





  



    通过 Model Context Protocol (MCP) servers 让模型访问新能力。





  



    在 hosted shell environments 中上传并复用带版本的 skill bundles。





  



    在 hosted containers 或你自己的本地运行时中运行 shell 命令。





  



    创建 agentic 工作流，使模型能够控制计算机界面。





  



    使用 GPT Image 生成或编辑图像。





  



    搜索已上传文件的内容，为生成响应提供上下文。





  



    将相关工具动态加载到模型上下文中，以优化 token 使用量。




## API 中的用法

发起请求以生成 [model response](https://developers.openai.com/api/docs/api-reference/responses/create) 时，通常通过在 `tools` 参数中指定配置来启用工具访问。每个工具都有自己独特的配置要求。详细说明请参阅 [Available tools](/mirror/api/docs/guides/tools#available-tools) 部分。

根据提供的 [prompt](/mirror/api/docs/guides/text)，模型会自动决定是否使用已配置的工具。例如，如果你的 prompt 请求的信息超出了模型训练截止日期，并且启用了 web search，模型通常会调用 web search 工具来检索相关的最新信息。

一些高级工作流还可以在交互过程中加载更多工具定义。例如，[tool search](/mirror/api/docs/guides/tools-tool-search) 可以延迟 function definitions，直到模型判断需要它们时再加载。

你可以通过在 [API 请求](https://developers.openai.com/api/docs/api-reference/responses/create)中设置 `tool_choice` 参数来显式控制或引导这一行为。

## Agents SDK 中的用法

在 Agents SDK 中，工具语义保持不变，但接线方式从单个 Responses API 请求迁移到 agent 定义和工作流设计中。

- 当某个 specialist 应自行调用工具时，直接在 agent 上附加 hosted tools、function tools 或 hosted MCP tools。
- 当 manager 应保持对面向用户回复的控制时，把 specialist 暴露为工具。
- 即使 SDK 对工具决策建模，也要在你的运行时中保留 shell、apply patch 和 computer-use harnesses。

将本地逻辑包装为 function tool

```typescript
import { tool } from "@openai/agents";
import { z } from "zod";

const getWeatherTool = tool({
  name: "get_weather",
  description: "Get the weather for a given city.",
  parameters: z.object({ city: z.string() }),
  async execute({ city }) {
    return `The weather in ${city} is sunny.`;
  },
});
```

```python
from agents import function_tool


@function_tool
def get_weather(city: str) -> str:
    """Get the weather for a given city."""
    return f"The weather in {city} is sunny."
```


将 specialist 暴露为工具

```typescript
import { Agent } from "@openai/agents";

const summarizer = new Agent({
  name: "Summarizer",
  instructions: "Generate a concise summary of the supplied text.",
});

const mainAgent = new Agent({
  name: "Research assistant",
  tools: [
    summarizer.asTool({
      toolName: "summarize_text",
      toolDescription: "Generate a concise summary of the supplied text.",
    }),
  ],
});
```

```python
from agents import Agent

summarizer = Agent(
    name="Summarizer",
    instructions="Generate a concise summary of the supplied text.",
)

main_agent = Agent(
    name="Research assistant",
    tools=[
        summarizer.as_tool(
            tool_name="summarize_text",
            tool_description="Generate a concise summary of the supplied text.",
        )
    ],
)
```


当你在塑造单个 specialist 时，使用 [Agent definitions](/mirror/api/docs/guides/agents/define-agents)；当工具影响所有权时，使用 [Orchestration and handoffs](/mirror/api/docs/guides/agents/orchestration)；当工具影响审批时，使用 [Guardrails and human review](/mirror/api/docs/guides/agents/guardrails-approvals)；当能力来自 MCP 时，使用 [Integrations and observability](/mirror/api/docs/guides/agents/integrations-observability#mcp)。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
When generating model responses or building agents, you can extend capabilities using built‑in tools, function calling, tool search, and remote MCP servers. These enable the model to search the web, retrieve from your files, load deferred tool definitions at runtime, call your own functions, or access third‑party services. Only `gpt-5.4` and later models support `tool_search`.



<div data-content-switcher-pane data-value="web-search">
    <div class="hidden">Web search</div>
    </div>
  <div data-content-switcher-pane data-value="file-search" hidden>
    <div class="hidden">File search</div>
    Search your files in a response

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }]
)
print(response)
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "What is deep research by OpenAI?",
    tools: [
        {
            type: "file_search",
            vector_store_ids: ["<vector_store_id>"],
        },
    ],
});
console.log(response);
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateFileSearchTool(["<vector_store_id>"]));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is deep research by OpenAI?"),
    ]),
], options);

Console.WriteLine(response.GetOutputText());
```

  </div>
  <div data-content-switcher-pane data-value="tool-search" hidden>
    <div class="hidden">Tool search</div>
    Load deferred tools at runtime

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

  </div>
  <div data-content-switcher-pane data-value="function-calling" hidden>
    <div class="hidden">Function calling</div>
    </div>
  <div data-content-switcher-pane data-value="remote-mcp" hidden>
    <div class="hidden">Remote MCP</div>
    Call a remote MCP server

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

  </div>



## Available tools

Here's an overview of the tools available in the OpenAI platform—select one of them for further guidance on usage.

<a href="/api/docs/guides/function-calling">
  

<span slot="icon">
      </span>
    Call custom code to give the model access to additional data and
    capabilities.


</a>

<a href="/api/docs/guides/tools-web-search">
  

<span slot="icon">
      </span>
    Include data from the Internet in model response generation.


</a>

<a href="/api/docs/guides/tools-connectors-mcp">
  

<span slot="icon">
      </span>
    Give the model access to new capabilities via Model Context Protocol (MCP)
    servers.


</a>

<a href="/api/docs/guides/tools-skills">
  

<span slot="icon">
      </span>
    Upload and reuse versioned skill bundles in hosted shell environments.


</a>

<a href="/api/docs/guides/tools-shell">
  

<span slot="icon">
      </span>
    Run shell commands in hosted containers or in your own local runtime.


</a>

<a href="/api/docs/guides/tools-computer-use">
  

<span slot="icon">
      </span>
    Create agentic workflows that enable a model to control a computer
    interface.


</a>

<a href="/api/docs/guides/tools-image-generation">
  

<span slot="icon">
      </span>
    Generate or edit images using GPT Image.


</a>

<a href="/api/docs/guides/tools-file-search">
  

<span slot="icon">
      </span>
    Search the contents of uploaded files for context when generating a
    response.


</a>

<a href="/api/docs/guides/tools-tool-search">
  

<span slot="icon">
      </span>
    Dynamically load relevant tools into the model’s context to optimize token
    usage.


</a>

## Usage in the API

When making a request to generate a [model response](https://developers.openai.com/api/docs/api-reference/responses/create), you usually enable tool access by specifying configurations in the `tools` parameter. Each tool has its own unique configuration requirements—see the [Available tools](#available-tools) section for detailed instructions.

Based on the provided [prompt](https://developers.openai.com/api/docs/guides/text), the model automatically decides whether to use a configured tool. For instance, if your prompt requests information beyond the model's training cutoff date and web search is enabled, the model will typically invoke the web search tool to retrieve relevant, up-to-date information.

Some advanced workflows can also load more tool definitions during the interaction. For example, [tool search](https://developers.openai.com/api/docs/guides/tools-tool-search) can defer function definitions until the model decides they're needed.

You can explicitly control or guide this behavior by setting the `tool_choice` parameter [in the API request](https://developers.openai.com/api/docs/api-reference/responses/create).

## Usage in the Agents SDK

In the Agents SDK, the tool semantics stay the same, but the wiring moves into the agent definition and workflow design rather than a single Responses API request.

- Attach hosted tools, function tools, or hosted MCP tools directly on the agent when one specialist should call them itself.
- Expose a specialist as a tool when a manager should stay in control of the user-facing reply.
- Keep shell, apply patch, and computer-use harnesses in your runtime even when the SDK models the tool decision.

Wrap local logic as a function tool

```typescript
import { tool } from "@openai/agents";
import { z } from "zod";

const getWeatherTool = tool({
  name: "get_weather",
  description: "Get the weather for a given city.",
  parameters: z.object({ city: z.string() }),
  async execute({ city }) {
    return `The weather in ${city} is sunny.`;
  },
});
```

```python
from agents import function_tool


@function_tool
def get_weather(city: str) -> str:
    """Get the weather for a given city."""
    return f"The weather in {city} is sunny."
```


Expose a specialist as a tool

```typescript
import { Agent } from "@openai/agents";

const summarizer = new Agent({
  name: "Summarizer",
  instructions: "Generate a concise summary of the supplied text.",
});

const mainAgent = new Agent({
  name: "Research assistant",
  tools: [
    summarizer.asTool({
      toolName: "summarize_text",
      toolDescription: "Generate a concise summary of the supplied text.",
    }),
  ],
});
```

```python
from agents import Agent

summarizer = Agent(
    name="Summarizer",
    instructions="Generate a concise summary of the supplied text.",
)

main_agent = Agent(
    name="Research assistant",
    tools=[
        summarizer.as_tool(
            tool_name="summarize_text",
            tool_description="Generate a concise summary of the supplied text.",
        )
    ],
)
```


Use [Agent definitions](https://developers.openai.com/api/docs/guides/agents/define-agents) when you are shaping a single specialist, [Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration) when tools affect ownership, [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals) when tools affect approvals, and [Integrations and observability](https://developers.openai.com/api/docs/guides/agents/integrations-observability#mcp) when the capability comes from MCP.
``````
:::
:::

