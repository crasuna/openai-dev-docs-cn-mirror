---
title: "Subagents"
description: "How subagent workflows keep Codex focused and how to choose models for different agents"
outline: deep
---

# Subagents

**文档集**：Codex  
**分组**：Codex — Concepts  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/concepts/subagents](https://developers.openai.com/codex/concepts/subagents)
- Markdown 来源：[https://developers.openai.com/codex/concepts/subagents.md](https://developers.openai.com/codex/concepts/subagents.md)
- 抓取时间：2026-06-27T05:54:55.166Z
- Checksum：`8db6c46df7dd476c3575e57e5972b168bae4e16730f8c20145e2de942e6e24f5`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex 可以通过并行启动专门的 agents 来运行 subagent workflows，让它们并发探索、处理或分析工作。

本页解释核心概念和权衡。有关 setup、agent 配置和示例，请参见 [Subagents](/mirror/codex/subagents)。

## 为什么 subagent workflows 有帮助

即使有大型 context windows，模型也有局限。如果你把充满噪声的中间输出（例如探索笔记、测试日志、堆栈跟踪和命令输出）大量塞进主对话（你定义需求、约束和决策的地方），session 可能会随着时间推移变得不那么可靠。

这通常被描述为：

- **Context pollution**：有用信息被嘈杂的中间输出掩埋。
- **Context rot**：随着对话填满相关性较低的细节，性能下降。

背景信息请参见 Chroma 关于 [context rot](https://research.trychroma.com/context-rot) 的文章。

Subagent workflows 通过把嘈杂工作移出主线程来提供帮助：

- 让 **main agent** 专注于需求、决策和最终输出。
- 并行运行专门的 **subagents**，用于探索、测试或日志分析。
- 从 subagents 返回 **summaries**，而不是原始中间输出。

当工作可以独立并行运行时，它们也能节省时间；通过把问题拆成有边界的小块，它们让更大形态的 tasks 更容易处理。例如，Codex 可以把一个包含数百万 tokens 的文档分析拆成更小的问题，并向主线程返回提炼后的结论。

作为起点，请把 parallel agents 用于读取较多的 tasks，例如探索、测试、triage 和摘要。对并行写入较多的 workflows 要更谨慎，因为多个 agents 同时编辑代码可能产生冲突并增加协调开销。

## 核心术语

Codex 在 subagent workflows 中使用几个相关术语：

- **Subagent workflow**：Codex 运行 parallel agents 并合并其结果的 workflow。
- **Subagent**：Codex 启动来处理特定 task 的委派 agent。
- **Agent thread**：agent 的 CLI thread，你可以用 `/agent` 查看并切换。

## 触发 subagent workflows

Codex 不会自动启动 subagents，并且只有在你明确要求 subagents 或 parallel agent work 时才应使用 subagents。

在实践中，手动触发意味着使用直接指令，例如 “spawn two agents”、“delegate this work in parallel” 或 “use one agent per point”。与类似的单 agent 运行相比，subagent workflows 会消耗更多 tokens，因为每个 subagent 都会执行自己的模型和工具工作。

一个好的 subagent prompt 应说明如何拆分工作、Codex 是否应等所有 agents 完成后再继续，以及需要返回什么 summary 或输出。

```text
Review this branch with parallel subagents. Spawn one subagent for security risks, one for test gaps, and one for maintainability. Wait for all three, then summarize the findings by category with file references.
```

## 选择模型和 reasoning

不同 agents 需要不同的模型和 reasoning 设置。

如果你没有固定模型或 `model_reasoning_effort`，Codex 可以为 task 选择一个在智能、速度和价格之间平衡的设置。它可能会偏向 `gpt-5.4-mini` 来做快速扫描，或为更需要推理的工作选择更高 effort 的 `gpt-5.5` 配置。当你需要更细粒度控制时，可以在 prompt 中引导该选择，或直接在 agent 文件中设置 `model` 和 `model_reasoning_effort`。

对于 Codex 中的大多数 tasks，从
  `gpt-5.5` 开始。需要更快、更低成本的轻量 subagent work 时，使用
  `gpt-5.4-mini`。如果你有 ChatGPT Pro，并且希望近乎即时地进行纯文本迭代，`gpt-5.3-codex-spark` 仍以 research preview 形式可用。

### 模型选择

- **`gpt-5.5`**：对要求较高的 agents，从这里开始。它最适合需要规划、工具使用、验证，并在较大 context 中持续推进的模糊多步骤工作。
- **`gpt-5.4`**：当 workflow 固定到 GPT-5.4 时使用。它结合了强大的编码、推理、工具使用和更广泛的 workflows 能力。
- **`gpt-5.4-mini`**：用于更看重速度和效率而非深度的 agents，例如探索、读密集型扫描、大文件 review 或处理支撑文档。它很适合返回提炼结果给 main agent 的 parallel workers。
- **`gpt-5.3-codex-spark`**：如果你有 ChatGPT Pro，在延迟比更广能力更重要时，可以使用这个 research preview model 进行近乎即时的纯文本迭代。

### Reasoning effort (`model_reasoning_effort`)

- **`high`**：当 agent 需要追踪复杂逻辑、检查假设或处理边界情况时使用（例如 reviewer 或偏安全的 agents）。
- **`medium`**：适合大多数 agents 的均衡默认值。
- **`low`**：当 task 很直接且速度最重要时使用。

更高的 reasoning effort 会增加响应时间和 token 用量，但可以提升复杂工作的质量。详情请参见 [Models](/mirror/codex/models)、[Config basics](/mirror/codex/config-basic) 和 [Configuration Reference](/mirror/codex/config-reference)。

:::

## English source

::: details 展开英文原文
::: v-pre
Codex can run subagent workflows by spawning specialized agents in parallel so
they can explore, tackle, or analyze work concurrently.

This page explains the core concepts and tradeoffs. For setup, agent configuration, and examples, see [Subagents](/mirror/codex/subagents).

## Why subagent workflows help

Even with large context windows, models have limits. If you flood the main conversation (where you're defining requirements, constraints, and decisions) with noisy intermediate output such as exploration notes, test logs, stack traces, and command output, the session can become less reliable over time.

This is often described as:

- **Context pollution**: useful information gets buried under noisy intermediate output.
- **Context rot**: performance degrades as the conversation fills up with less relevant details.

For background, see the Chroma writeup on [context rot](https://research.trychroma.com/context-rot).

Subagent workflows help by moving noisy work off the main thread:

- Keep the **main agent** focused on requirements, decisions, and final outputs.
- Run specialized **subagents** in parallel for exploration, tests, or log analysis.
- Return **summaries** from subagents instead of raw intermediate output.

They can also save time when the work can run independently in parallel, and
they make larger-shaped tasks more tractable by breaking them into bounded
pieces. For example, Codex can split analysis of a multi-million-token
document into smaller problems and return distilled takeaways to the main
thread.

As a starting point, use parallel agents for read-heavy tasks such as
exploration, tests, triage, and summarization. Be more careful with parallel
write-heavy workflows, because agents editing code at once can create
conflicts and increase coordination overhead.

## Core terms

Codex uses a few related terms in subagent workflows:

- **Subagent workflow**: A workflow where Codex runs parallel agents and combines their results.
- **Subagent**: A delegated agent that Codex starts to handle a specific task.
- **Agent thread**: The CLI thread for an agent, which you can inspect and switch between with `/agent`.

## Triggering subagent workflows

Codex doesn't spawn subagents automatically, and it should only use subagents when you
explicitly ask for subagents or parallel agent work.

In practice, manual triggering means using direct instructions such as
"spawn two agents," "delegate this work in parallel," or "use one agent per
point." Subagent workflows consume more tokens than comparable single-agent runs
because each subagent does its own model and tool work.

A good subagent prompt should explain how to divide the work, whether Codex
should wait for all agents before continuing, and what summary or output to
return.

```text
Review this branch with parallel subagents. Spawn one subagent for security risks, one for test gaps, and one for maintainability. Wait for all three, then summarize the findings by category with file references.
```

## Choosing models and reasoning

Different agents need different model and reasoning settings.

If you don't pin a model or `model_reasoning_effort`, Codex can choose a setup
that balances intelligence, speed, and price for the task. It may favor `gpt-5.4-mini` for fast scans or a higher-effort `gpt-5.5` configuration for more demanding reasoning. When you want finer control, steer that choice in your prompt or set `model` and `model_reasoning_effort` directly in the agent file.

For most tasks in Codex, start with 
  `gpt-5.5`. Use 
  `gpt-5.4-mini` when you want
  a faster, lower-cost option for lighter subagent work. If you have ChatGPT Pro
  and want near-instant text-only iteration, `gpt-5.3-codex-spark` remains
  available in research preview.

### Model choice

- **`gpt-5.5`**: Start here for demanding agents. It is strongest for ambiguous, multi-step work that needs planning, tool use, validation, and follow-through across a larger context.
- **`gpt-5.4`**: Use this when a workflow is pinned to GPT-5.4. It combines strong coding, reasoning, tool use, and broader workflows.
- **`gpt-5.4-mini`**: Use for agents that favor speed and efficiency over depth, such as exploration, read-heavy scans, large-file review, or processing supporting documents. It works well for parallel workers that return distilled results to the main agent.
- **`gpt-5.3-codex-spark`**: If you have ChatGPT Pro, use this research preview model for near-instant, text-only iteration when latency matters more than broader capability.

### Reasoning effort (`model_reasoning_effort`)

- **`high`**: Use when an agent needs to trace complex logic, check assumptions, or work through edge cases (for example, reviewer or security-focused agents).
- **`medium`**: A balanced default for most agents.
- **`low`**: Use when the task is straightforward and speed matters most.

Higher reasoning effort increases response time and token usage, but it can improve quality for complex work. For details, see [Models](/mirror/codex/models), [Config basics](/mirror/codex/config-basic), and [Configuration Reference](/mirror/codex/config-reference).

:::
:::

