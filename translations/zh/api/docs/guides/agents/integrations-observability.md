---
status: needs-review
sourceId: "c4fbb6db8c16"
sourceChecksum: "c4fbb6db8c162d9a9d4d81c5fd298ca34ff22e9d94f657064b2fd7c263fd421c"
sourceUrl: "https://developers.openai.com/api/docs/guides/agents/integrations-observability"
translatedAt: "2026-06-27T17:44:39.0189315+08:00"
translator: codex-gpt-5.5-xhigh
---

# 集成与可观测性

在 workflow 的形态清晰之后，接下来的问题是：哪些外部表面应该放在 agent loop 内，以及你将如何检查运行时实际发生了什么。

## 选择哪些内容放进 SDK

| 需求 | 起点 | 原因 |
| --------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| 让 agent 访问公开的远程托管 MCP tools | SDK 中的 hosted MCP tools | 模型可以通过托管表面调用远程 MCP server |
| 从你的 runtime 连接本地或私有 MCP servers | 通过 stdio 或 streamable HTTP 使用 SDK-managed MCP servers | 你的 runtime 拥有连接、approvals 和网络边界 |
| 调试 prompts、tools、handoffs 或 approvals | 内置 tracing | Traces 会在你正式建立 evals 之前展示端到端记录 |

Tool capability semantics 仍以 [Using tools](https://developers.openai.com/api/docs/guides/tools) 为准。本页聚焦于 SDK 特定的 MCP 接线方式和 observability loop。

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

对于平台范围内的概念、信任模型和产品支持情况，请始终将 [MCP and Connectors](https://developers.openai.com/api/docs/guides/tools-connectors-mcp) 作为权威参考。

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
- 在准备好系统性地评分行为之后，将更高信号的示例馈入 [agent workflow evaluation](https://developers.openai.com/api/docs/guides/agent-evals)。

## 后续步骤

外部表面接线完成后，请继续阅读覆盖 capability design、review boundaries 或 evaluation 的指南。

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/tools#usage-in-the-agents-sdk"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      查看 hosted tools、function tools 和 agents-as-tools 如何与 MCP 并列配合。


  </a>
  <a
    href="/api/docs/guides/agents/guardrails-approvals"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      在敏感 capabilities 周围添加 approval 或 validation boundaries。


  </a>
  <a
    href="/api/docs/guides/agent-evals"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      当行为稳定后，从一次性的 traces 进入可重复的 grading。


  </a>
</div>
