---
title: "Prompting"
description: "Interacting with the Codex agent"
outline: deep
---

# Prompting

**文档集**：Codex  
**分组**：Codex — Prompting  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/prompting](https://developers.openai.com/codex/prompting)
- Markdown 来源：[https://developers.openai.com/codex/prompting.md](https://developers.openai.com/codex/prompting.md)
- 抓取时间：2026-06-27T05:55:05.382Z
- Checksum：`07be122341a7f89b57b9a0ec1a5a7cae5cd8d2fbcb8acfb3bc22c5e57e7b6588`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## Prompts

你通过发送 prompts（用户消息）与 Codex 交互，这些消息描述你希望它做什么。

示例 prompts：

```text
Explain how the transform module works and how other modules use it.
```

```text
Add a new command-line option `--json` that outputs JSON.
```

提交 prompt 后，Codex 会在一个循环中工作：它调用模型，然后执行模型输出指示的操作，例如读取文件、编辑文件和调用工具。此过程会在任务完成或你取消任务时结束。

和 ChatGPT 一样，Codex 的效果取决于你给它的 instructions。下面是一些我们认为对提示 Codex 有帮助的建议：

- 当 Codex 能够验证自己的工作时，它会产出更高质量的结果。请包含复现问题、验证功能，以及运行 linting 和 pre-commit checks 的步骤。
- 当你把复杂工作拆成更小、更聚焦的步骤时，Codex 处理得更好。小任务更容易让 Codex 测试，也更容易让你审查。如果你不确定如何拆分任务，可以请 Codex 提出计划。

如需更多关于提示 Codex 的想法，请参阅 [workflows](/mirror/codex/workflows)。

## Threads

Thread 是一个单独会话：你的 prompt，以及随后产生的模型输出和 tool calls。一个 thread 可以包含多个 prompts。例如，你的第一个 prompt 可能要求 Codex 实现一个功能，后续 prompt 可能要求它添加测试。

当 Codex 正在主动处理 thread 时，该 thread 被称为“running”。你可以同时运行多个 threads，但请避免让两个 threads 修改相同文件。你也可以稍后通过继续发送另一个 prompt 来恢复 thread。

Threads 可以在本地或 cloud 中运行：

- **Local threads** 在你的机器上运行。Codex 可以读取和编辑你的文件并运行命令，因此你可以看到发生了什么变化并使用你现有的工具。为了降低 workspace 外出现不想要更改的风险，local threads 会在 [sandbox](/mirror/codex/agent-approvals-security) 中运行。
- **Cloud threads** 在隔离的 [environment](/mirror/codex/cloud/environments) 中运行。Codex 会克隆你的 repository，并 checkout 它正在处理的 branch。当你想并行运行工作或从另一台设备委托任务时，cloud threads 很有用。要将 cloud threads 用于你的 repo，请先把代码推送到 GitHub。你也可以[从本地机器委托任务](https://developers.openai.com/codex/ide/cloud-tasks)，其中会包含你当前的工作状态。

在 Codex app 中，你也可以在不选择项目的情况下开始聊天。Chats 不绑定到已保存 repository 或 project folder。请将它们用于研究、规划、connected-tool workflows，或其他 Codex 不应从代码库开始的工作。Chats 使用 Codex 管理的 `threads` directory 作为工作位置，该目录位于你的 Codex home 下。默认情况下，此位置为 `~/.codex/threads`。要更改此状态的基础位置，请设置 `CODEX_HOME`；请参阅 [Config and state locations](/mirror/codex/config-advanced#config-and-state-locations)。

## Context

提交 prompt 时，请包含 Codex 可以使用的上下文，例如相关文件和图片的 references。Codex IDE extension 会自动把打开文件列表和所选文本范围作为上下文包含进去。

随着 agent 工作，它还会从文件内容、工具输出，以及它已经做了什么和还需要做什么的持续记录中收集上下文。

Thread 中的所有信息都必须适配模型的 **context window**，其大小因模型而异。Codex 会监控并报告剩余空间。对于较长任务，Codex 可能会自动 **compact** 上下文，总结相关信息并丢弃较不相关的细节。通过反复 compact，Codex 可以在多个步骤中继续处理复杂任务。

## Goal mode

Goal mode 为 Codex 提供一个跨较长任务持续追踪的目标。当工作可能需要很多步骤，或 Codex 需要清晰的完成定义并在工作中持续检查时，请使用它。

&lt;CodexScreenshot
  alt="Codex app goal progress controls above the composer"
  lightSrc="/images/codex/app/goal-dialog-light.webp"
  darkSrc="/images/codex/app/goal-dialog-dark.webp"
  class="mb-6"
/&gt;

设置 goal 后，goal text 既作为起始 prompt，也作为 completion criteria。Codex 会用它决定下一步做什么，以及任务是否完成。可以在 [Codex app](/mirror/codex/app/commands#set-or-manage-a-goal-with-goal)、[IDE extension](/mirror/codex/ide/slash-commands) 或 [CLI](/mirror/codex/cli/slash-commands#set-or-view-a-task-goal-with-goal) 中使用 `/goal` 启动 Goal mode。

如果 `/goal` 没有出现在 slash command list 中，请在 `config.toml` 中启用 `features.goals`：

```toml
[features]
goals = true
```

你也可以从 CLI 运行 `codex features enable goals`，或请 Codex 运行它。在 Codex app 中，progress 会显示在 composer 上方，并带有 pause、resume、edit 或 clear goal 的控件。

编写 goals 时，要让 Codex 能判断自己是否已成功。好的 goals 包含具体结果、可衡量目标或测试标准。例如：

```text
Migrate this codebase from JavaScript to TypeScript. The app should compile in
strict mode without explicit `any` type definitions.
```

```text
Reduce the time to interactive of the home page to below 1 second.
```

如果 goal 很难一开始就定义清楚，请从 `/plan` 开始，并请求 Codex 在实现前先塑造它。你也可以请 Codex 采访你，并起草一个带有清晰成功标准的 goal。

Goal 开始后，你仍可以继续引导 Codex。发送 follow-up messages 来调整约束，例如要求 Codex 使用特定库或避免某种方法。当你想要状态回顾或解释而不打断主任务时，请使用 side chats。对于 long-running work，请在失去连接前暂停 goal，然后在准备好时恢复或编辑它。

:::

## English source

::: details 展开英文原文
::: v-pre
## Prompts

You interact with Codex by sending prompts (user messages) that describe what you want it to do.

Example prompts:

```text
Explain how the transform module works and how other modules use it.
```

```text
Add a new command-line option `--json` that outputs JSON.
```

When you submit a prompt, Codex works in a loop: it calls the model and then performs the actions indicated by the model output, such as file reads, file edits, and tool calls. This process ends when the task is complete or you cancel it.

As with ChatGPT, Codex is only as effective as the instructions you give it. Here are some tips we find helpful when prompting Codex:

- Codex produces higher-quality outputs when it can verify its work. Include steps to reproduce an issue, validate a feature, and run linting and pre-commit checks.
- Codex handles complex work better when you break it into smaller, focused steps. Smaller tasks are easier for Codex to test and for you to review. If you're not sure how to split a task up, ask Codex to propose a plan.

For more ideas about prompting Codex, refer to [workflows](/mirror/codex/workflows).

## Threads

A thread is a single session: your prompt plus the model outputs and tool calls that follow. A thread can include multiple prompts. For example, your first prompt might ask Codex to implement a feature, and a follow-up prompt might ask it to add tests.

A thread is said to be "running" when Codex is actively working on it. You can run multiple threads at once, but avoid having two threads modify the same files. You can also resume a thread later by continuing it with another prompt.

Threads can run either locally or in the cloud:

- **Local threads** run on your machine. Codex can read and edit your files and run commands, so you can see what changes and use your existing tools. To reduce the risk of unwanted changes outside your workspace, local threads run in a [sandbox](/mirror/codex/agent-approvals-security).
- **Cloud threads** run in an isolated [environment](/mirror/codex/cloud/environments). Codex clones your repository and checks out the branch it's working on. Cloud threads are useful when you want to run work in parallel or delegate tasks from another device. To use cloud threads with your repo, push your code to GitHub first. You can also [delegate tasks from your local machine](https://developers.openai.com/codex/ide/cloud-tasks), which includes your current working state.

In the Codex app, you can also start a chat without choosing a project. Chats
aren't tied to a saved repository or project folder. Use them for research,
planning, connected-tool workflows, or other work where Codex shouldn't start
from a codebase. Chats use a Codex-managed `threads` directory under your Codex
home as their working location. By default, that location is `~/.codex/threads`.
To change the base location for this state, set `CODEX_HOME`; see
[Config and state locations](/mirror/codex/config-advanced#config-and-state-locations).

## Context

When you submit a prompt, include context that Codex can use, such as references to relevant files and images. The Codex IDE extension automatically includes the list of open files and the selected text range as context.

As the agent works, it also gathers context from file contents, tool output, and an ongoing record of what it has done and what it still needs to do.

All information in a thread must fit within the model's **context window**, which varies by model. Codex monitors and reports the remaining space. For longer tasks, Codex may automatically **compact** the context by summarizing relevant information and discarding less relevant details. With repeated compaction, Codex can continue working on complex tasks over many steps.

## Goal mode

Goal mode gives Codex a persistent objective to work toward across a longer
task. Use it when the work may take many steps, or when Codex needs a clear
definition of done that it can keep checking as it works.

&lt;CodexScreenshot
  alt="Codex app goal progress controls above the composer"
  lightSrc="/images/codex/app/goal-dialog-light.webp"
  darkSrc="/images/codex/app/goal-dialog-dark.webp"
  class="mb-6"
/&gt;

When you set a goal, the goal text acts as both the starting prompt and the
completion criteria. Codex uses it to decide what to do next and whether the
task is complete. Start Goal mode with `/goal` in the [Codex app](/mirror/codex/app/commands#set-or-manage-a-goal-with-goal), [IDE extension](/mirror/codex/ide/slash-commands), or [CLI](/mirror/codex/cli/slash-commands#set-or-view-a-task-goal-with-goal).

If `/goal` doesn't appear in the slash command list, enable `features.goals`
in `config.toml`:

```toml
[features]
goals = true
```

You can also run `codex features enable goals` from the CLI or ask Codex to run it.
In the Codex app, progress appears above the composer with controls to pause,
resume, edit, or clear the goal.

Write goals so Codex can tell whether it has succeeded. Good goals include a
specific outcome, measurable target, or test criteria. For example:

```text
Migrate this codebase from JavaScript to TypeScript. The app should compile in
strict mode without explicit `any` type definitions.
```

```text
Reduce the time to interactive of the home page to below 1 second.
```

If the goal is hard to define up front, start with `/plan` and ask Codex to
shape it before implementation. You can also ask Codex to interview you and
draft a goal with clear success criteria.

You can continue steering Codex after the goal starts. Send follow-up messages
to adjust constraints, such as asking Codex to use a particular library or
avoid a specific approach. Use side chats when you want a status recap or
explanation without interrupting the main task. For long-running work, pause
the goal before you lose connectivity, then resume or edit it when you are
ready to continue.

:::
:::

