---
status: needs-review
sourceId: "15d2724895bc"
sourceChecksum: "15d2724895bcaefdab3865d93862a4712e7b1fda71e89f75c6884302e9ddb772"
sourceUrl: "https://developers.openai.com/api/docs/guides/agents/orchestration"
translatedAt: "2026-06-27T18:00:38.1935616+08:00"
translator: codex-gpt-5.5-xhigh
---

# Orchestration 与 handoffs

当 specialist 应该负责作业的不同部分时，multi-agent workflows 很有用。第一个设计选择是决定在工作流的每个分支上，谁拥有最终面向用户的回答。

## 选择 orchestration 模式

| 模式         | 适用场景                                                                   | 会发生什么                             |
| --------------- | ----------------------------------------------------------------------------- | ---------------------------------------- |
| Handoffs        | specialist 应该接管该工作分支的对话    | 控制权转移给 specialist agent    |
| Agents as tools | manager 应该保持控制，并把 specialists 作为有边界的能力来调用 | manager 保持对回复的所有权 |

## 使用 handoffs 进行委托所有权转移

当 specialist 应该拥有下一条响应，而不是只在幕后提供帮助时，handoffs 是最清晰的选择。

用 handoffs 进行委托

```typescript
import { Agent, handoff } from "@openai/agents";

const billingAgent = new Agent({ name: "Billing agent" });
const refundAgent = new Agent({ name: "Refund agent" });

const triageAgent = Agent.create({
  name: "Triage agent",
  handoffs: [billingAgent, handoff(refundAgent)],
});
```

```python
from agents import Agent, handoff

billing_agent = Agent(name="Billing agent")
refund_agent = Agent(name="Refund agent")

triage_agent = Agent(
    name="Triage agent",
    handoffs=[billing_agent, handoff(refund_agent)],
)
```


保持 routing surface 清晰易读：

- 为每个 specialist 分配窄范围任务。
- 保持简短、具体。
- 只有当下一个分支确实需要不同 instructions、tools 或 policy 时，才拆分。

在高级用法中，handoffs 也可以携带 structured metadata 或 filtered history。由于不同语言的 wiring 不同，这些确切 API 会保留在 SDK docs 中。

## 将 agents 作为 tools 用于 manager-style workflows

当 main agent 应该继续负责最终回答，并将 specialists 作为 helpers 调用时使用。

把 specialist 作为 tool 调用

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


在以下情况下，这通常更合适：

- manager 应该综合出最终回答
- specialist 执行的是有边界的任务，例如 summarization 或 classification
- 你想要一个稳定的外层工作流，其中嵌套 specialist 调用，而不是转移所有权

## 仅在 contract 改变时添加 specialists

只要可以，就从一个 agent 开始。只有当 specialists 能实质性改善 capability isolation、policy isolation、prompt clarity 或 trace legibility 时，才添加它们。

过早拆分会创建更多 prompts、更多 traces 和更多 approval surfaces，却不一定让工作流变得更好。

## 下一步

明确 ownership pattern 后，继续阅读覆盖相邻 runtime 或 state 问题的指南。

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/define-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      优化每个 specialist 的 instructions、tools 和 output contract。


  </a>
  <a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      了解 handoffs 和 tools 在 run 内部如何表现。


  </a>
  <a
    href="/api/docs/guides/agents/results"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      了解
      和 resumable state 如何影响下一轮。


  </a>
</div>
