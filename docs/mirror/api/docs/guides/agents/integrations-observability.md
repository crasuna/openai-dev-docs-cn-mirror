---
title: "集成与可观测性"
description: "Learn how to integrate MCP into Agents SDK workflows and how to trace and debug runs."
outline: deep
---

# 集成与可观测性

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agents/integrations-observability](https://developers.openai.com/api/docs/guides/agents/integrations-observability)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agents/integrations-observability.md](https://developers.openai.com/api/docs/guides/agents/integrations-observability.md)
- 抓取时间：2026-06-27T05:53:58.443Z
- Checksum：`c4fbb6db8c162d9a9d4d81c5fd298ca34ff22e9d94f657064b2fd7c263fd421c`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
在 workflow 的形态清晰之后，接下来的问题是：哪些外部表面应该放在 agent loop 内，以及你将如何检查运行时实际发生了什么。

## 选择哪些内容放进 SDK

| 需求 | 起点 | 原因 |
| --------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| 让 agent 访问公开的远程托管 MCP tools | SDK 中的 hosted MCP tools | 模型可以通过托管表面调用远程 MCP server |
| 从你的 runtime 连接本地或私有 MCP servers | 通过 stdio 或 streamable HTTP 使用 SDK-managed MCP servers | 你的 runtime 拥有连接、approvals 和网络边界 |
| 调试 prompts、tools、handoffs 或 approvals | 内置 tracing | Traces 会在你正式建立 evals 之前展示端到端记录 |

Tool capability semantics 仍以 [Using tools](/mirror/api/docs/guides/tools) 为准。本页聚焦于 SDK 特定的 MCP 接线方式和 observability loop。

## MCP

当远程 server 应通过模型表面运行时，请使用 hosted MCP tools。

附加一个 hosted MCP server

```typescript
import { Agent, hostedMcpTool } from "@openai/agents";

const agent = new Agent({
  name: "MCP assistant",
  instructions: "Use the MCP tools to answer questions.",
  tools: [
    hostedMcpTool({
      serverLabel: "gitmcp",
      serverUrl: "https://gitmcp.io/openai/codex",
    }),
  ],
});
```

```python
from agents import Agent, HostedMCPTool

agent = Agent(
    name="MCP assistant",
    instructions="Use the MCP tools to answer questions.",
    tools=[
        HostedMCPTool(
            tool_config={
                "type": "mcp",
                "server_label": "gitmcp",
                "server_url": "https://gitmcp.io/openai/codex",
                "require_approval": "never",
            }
        )
    ],
)
```


当你的应用应直接连接到 MCP server 时，请使用本地 transports。

连接一个本地 MCP server

```typescript
import { Agent, MCPServerStdio, run } from "@openai/agents";

const server = new MCPServerStdio({
  name: "Filesystem MCP Server",
  fullCommand: "npx -y @modelcontextprotocol/server-filesystem ./sample_files",
});

await server.connect();

try {
  const agent = new Agent({
    name: "Filesystem assistant",
    instructions: "Read files with the MCP tools before answering.",
    mcpServers: [server],
  });

  const result = await run(agent, "Read the files and list them.");
  console.log(result.finalOutput);
} finally {
  await server.close();
}
```

```python
import asyncio

from agents import Agent, Runner
from agents.mcp import MCPServerStdio


async def main() -> None:
    async with MCPServerStdio(
        name="Filesystem MCP Server",
        params={
            "command": "npx",
            "args": [
                "-y",
                "@modelcontextprotocol/server-filesystem",
                "./sample_files",
            ],
        },
    ) as server:
        agent = Agent(
            name="Filesystem assistant",
            instructions="Read files with the MCP tools before answering.",
            mcp_servers=[server],
        )
        result = await Runner.run(agent, "Read the files and list them.")
        print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


实用上的划分是：

- 对适合平台信任模型的公开远程 servers，使用 **hosted MCP**。
- 当你的 runtime 应负责连接、过滤或 approvals 时，使用 **local or private MCP**。

对于平台范围内的概念、信任模型和产品支持情况，请始终将 [MCP and Connectors](/mirror/api/docs/guides/tools-connectors-mcp) 作为权威参考。

## Tracing

Tracing 内置于 Agents SDK，并且在常规 server-side SDK 路径中默认启用。每次 run 都可以发出一条结构化记录，其中包含 model calls、tool calls、handoffs、guardrails 和 custom spans；你可以在 [Traces dashboard](https://platform.openai.com/traces) 中检查这些记录。

默认 trace 通常会给你：

- 整体 run 或 workflow
- 每次 model call
- tool calls 及其 outputs
- handoffs 和 guardrails
- 你包裹在 workflow 周围的任何 custom spans

如果你需要减少 tracing，请使用 SDK 级别或 per-run tracing 控件，而不是从 workflow 中移除所有可观测性。

将多次 runs 包裹在一个 trace 中

```typescript
import { Agent, run, withTrace } from "@openai/agents";

const agent = new Agent({
  name: "Joke generator",
  instructions: "Tell funny jokes.",
});

await withTrace("Joke workflow", async () => {
  const first = await run(agent, "Tell me a joke");
  const second = await run(agent, `Rate this joke: ${first.finalOutput}`);
  console.log(first.finalOutput);
  console.log(second.finalOutput);
});
```

```python
import asyncio

from agents import Agent, Runner, trace

agent = Agent(
    name="Joke generator",
    instructions="Tell funny jokes.",
)


async def main() -> None:
    with trace("Joke workflow"):
        first = await Runner.run(agent, "Tell me a joke")
        second = await Runner.run(
            agent,
            f"Rate this joke: {first.final_output}",
        )
        print(first.final_output)
        print(second.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


将 traces 用于两项工作：

- 调试一次 workflow run，并理解发生了什么。
- 在准备好系统性地评分行为之后，将更高信号的示例馈入 [agent workflow evaluation](/mirror/api/docs/guides/agent-evals)。

## 后续步骤

外部表面接线完成后，请继续阅读覆盖 capability design、review boundaries 或 evaluation 的指南。


  &lt;a
    href="/api/docs/guides/tools#usage-in-the-agents-sdk"
    class="block no-underline hover:no-underline"
  &gt;
    



      查看 hosted tools、function tools 和 agents-as-tools 如何与 MCP 并列配合。



  &lt;a
    href="/api/docs/guides/agents/guardrails-approvals"
    class="block no-underline hover:no-underline"
  &gt;
    



      在敏感 capabilities 周围添加 approval 或 validation boundaries。



  &lt;a
    href="/api/docs/guides/agent-evals"
    class="block no-underline hover:no-underline"
  &gt;
    



      当行为稳定后，从一次性的 traces 进入可重复的 grading。





:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
After the workflow shape is clear, the next questions are which external surfaces should live inside the agent loop and how you will inspect what actually happened at runtime.

## Choose what lives in the SDK

| Need                                                      | Start with                                            | Why                                                                 |
| --------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| Give an agent access to public, remotely hosted MCP tools | Hosted MCP tools in the SDK                           | The model can call the remote MCP server through the hosted surface |
| Connect local or private MCP servers from your runtime    | SDK-managed MCP servers over stdio or streamable HTTP | Your runtime owns the connection, approvals, and network boundaries |
| Debug prompts, tools, handoffs, or approvals              | Built-in tracing                                      | Traces show the end-to-end record before you formalize evals        |

Tool capability semantics still live in [Using tools](https://developers.openai.com/api/docs/guides/tools). This page focuses on the SDK-specific MCP wiring and observability loop.

## MCP

Use hosted MCP tools when the remote server should run through the model surface.

Attach a hosted MCP server

```typescript
import { Agent, hostedMcpTool } from "@openai/agents";

const agent = new Agent({
  name: "MCP assistant",
  instructions: "Use the MCP tools to answer questions.",
  tools: [
    hostedMcpTool({
      serverLabel: "gitmcp",
      serverUrl: "https://gitmcp.io/openai/codex",
    }),
  ],
});
```

```python
from agents import Agent, HostedMCPTool

agent = Agent(
    name="MCP assistant",
    instructions="Use the MCP tools to answer questions.",
    tools=[
        HostedMCPTool(
            tool_config={
                "type": "mcp",
                "server_label": "gitmcp",
                "server_url": "https://gitmcp.io/openai/codex",
                "require_approval": "never",
            }
        )
    ],
)
```


Use local transports when your application should connect to the MCP server directly.

Connect a local MCP server

```typescript
import { Agent, MCPServerStdio, run } from "@openai/agents";

const server = new MCPServerStdio({
  name: "Filesystem MCP Server",
  fullCommand: "npx -y @modelcontextprotocol/server-filesystem ./sample_files",
});

await server.connect();

try {
  const agent = new Agent({
    name: "Filesystem assistant",
    instructions: "Read files with the MCP tools before answering.",
    mcpServers: [server],
  });

  const result = await run(agent, "Read the files and list them.");
  console.log(result.finalOutput);
} finally {
  await server.close();
}
```

```python
import asyncio

from agents import Agent, Runner
from agents.mcp import MCPServerStdio


async def main() -> None:
    async with MCPServerStdio(
        name="Filesystem MCP Server",
        params={
            "command": "npx",
            "args": [
                "-y",
                "@modelcontextprotocol/server-filesystem",
                "./sample_files",
            ],
        },
    ) as server:
        agent = Agent(
            name="Filesystem assistant",
            instructions="Read files with the MCP tools before answering.",
            mcp_servers=[server],
        )
        result = await Runner.run(agent, "Read the files and list them.")
        print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


The practical split is:

- Use **hosted MCP** for public remote servers that fit the platform trust model.
- Use **local or private MCP** when your runtime should own connectivity, filtering, or approvals.

For the platform-wide concept, trust model, and product support story, keep [MCP and Connectors](https://developers.openai.com/api/docs/guides/tools-connectors-mcp) as the canonical reference.

## Tracing

Tracing is built into the Agents SDK and is enabled by default in the normal server-side SDK path. Every run can emit a structured record of model calls, tool calls, handoffs, guardrails, and custom spans, which you can inspect in the [Traces dashboard](https://platform.openai.com/traces).

The default trace usually gives you:

- the overall run or workflow
- each model call
- tool calls and their outputs
- handoffs and guardrails
- any custom spans you wrap around the workflow

If you need less tracing, use the SDK-level or per-run tracing controls rather than removing all observability from the workflow.

Wrap multiple runs in one trace

```typescript
import { Agent, run, withTrace } from "@openai/agents";

const agent = new Agent({
  name: "Joke generator",
  instructions: "Tell funny jokes.",
});

await withTrace("Joke workflow", async () => {
  const first = await run(agent, "Tell me a joke");
  const second = await run(agent, `Rate this joke: ${first.finalOutput}`);
  console.log(first.finalOutput);
  console.log(second.finalOutput);
});
```

```python
import asyncio

from agents import Agent, Runner, trace

agent = Agent(
    name="Joke generator",
    instructions="Tell funny jokes.",
)


async def main() -> None:
    with trace("Joke workflow"):
        first = await Runner.run(agent, "Tell me a joke")
        second = await Runner.run(
            agent,
            f"Rate this joke: {first.final_output}",
        )
        print(first.final_output)
        print(second.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


Use traces for two jobs:

- Debug one workflow run and understand what happened.
- Feed higher-signal examples into [agent workflow evaluation](https://developers.openai.com/api/docs/guides/agent-evals) once you are ready to score behavior systematically.

## Next steps

Once the external surfaces are wired in, continue with the guide that covers capability design, review boundaries, or evaluation.

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/tools#usage-in-the-agents-sdk"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      See how hosted tools, function tools, and agents-as-tools fit beside MCP.


  </a>
  <a
    href="/api/docs/guides/agents/guardrails-approvals"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Add approval or validation boundaries around sensitive capabilities.


  </a>
  <a
    href="/api/docs/guides/agent-evals"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Move from one-off traces into repeatable grading once behavior stabilizes.


  </a>
</div>
``````
:::
:::

