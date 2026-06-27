---
title: "Orchestration and handoffs"
description: "Learn how to orchestrate multiple agents with handoffs and agents-as-tools in the OpenAI Agents SDK."
outline: deep
---

# Orchestration and handoffs

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agents/orchestration](https://developers.openai.com/api/docs/guides/agents/orchestration)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agents/orchestration.md](https://developers.openai.com/api/docs/guides/agents/orchestration.md)
- 抓取时间：2026-06-27T05:53:58.537Z
- Checksum：`15d2724895bcaefdab3865d93862a4712e7b1fda71e89f75c6884302e9ddb772`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
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


  &lt;a
    href="/api/docs/guides/agents/define-agents"
    class="block no-underline hover:no-underline"
  &gt;
    



      优化每个 specialist 的 instructions、tools 和 output contract。



  &lt;a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  &gt;
    



      了解 handoffs 和 tools 在 run 内部如何表现。



  &lt;a
    href="/api/docs/guides/agents/results"
    class="block no-underline hover:no-underline"
  &gt;
    



      了解
      和 resumable state 如何影响下一轮。





:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Multi-agent workflows are useful when specialists should own different parts of the job. The first design choice is deciding who owns the final user-facing answer at each branch of the workflow.

## Choose the orchestration pattern

| Pattern         | Use it when                                                                   | What happens                             |
| --------------- | ----------------------------------------------------------------------------- | ---------------------------------------- |
| Handoffs        | A specialist should take over the conversation for that branch of the work    | Control moves to the specialist agent    |
| Agents as tools | A manager should stay in control and call specialists as bounded capabilities | The manager keeps ownership of the reply |

## Use handoffs for delegated ownership

Handoffs are the clearest fit when a specialist should own the next response rather than merely helping behind the scenes.

Delegate with handoffs

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


Keep the routing surface legible:

- Give each specialist a narrow job.
- Keep short and concrete.
- Split only when the next branch truly needs different instructions, tools, or policy.

At the advanced end, handoffs can also carry structured metadata or filtered history. Those exact APIs stay in the SDK docs because the wiring differs by language.

## Use agents as tools for manager-style workflows

Use when the main agent should stay responsible for the final answer and call specialists as helpers.

Call a specialist as a tool

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


This is usually the better fit when:

- the manager should synthesize the final answer
- the specialist is doing a bounded task like summarization or classification
- you want one stable outer workflow with nested specialist calls instead of ownership transfer

## Add specialists only when the contract changes

Start with one agent whenever you can. Add specialists only when they materially improve capability isolation, policy isolation, prompt clarity, or trace legibility.

Splitting too early creates more prompts, more traces, and more approval surfaces without necessarily making the workflow better.

## Next steps

Once the ownership pattern is clear, continue with the guide that covers the adjacent runtime or state question.

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/define-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Refine each specialist's instructions, tools, and output contract.


  </a>
  <a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Understand how handoffs and tools behave inside a run.


  </a>
  <a
    href="/api/docs/guides/agents/results"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      See how 
      and resumable state affect the next turn.


  </a>
</div>
``````
:::
:::

