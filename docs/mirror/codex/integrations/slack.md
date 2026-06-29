---
title: "在 Slack 中使用 Codex"
description: "Ask Codex to run tasks from channels and threads"
outline: deep
---

# 在 Slack 中使用 Codex

**文档集**：Codex\
**分组**：集成\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/integrations/slack](https://developers.openai.com/codex/integrations/slack)
- Markdown 来源：[https://developers.openai.com/codex/integrations/slack.md](https://developers.openai.com/codex/integrations/slack.md)
- 抓取时间：2026-06-27T05:55:01.542Z
- Checksum：`a8e904feb9d6308ec4b615a13841abb546c4810b123896042dc05825ba67fda0`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
在 Slack 中使用 Codex，可以从 channels 和 threads 发起 coding tasks。用 prompt 提及 `@Codex`，Codex 会创建云端任务并回复结果。


  &lt;img src="https://developers.openai.com/images/codex/integrations/slack-example.png"
    alt="Codex Slack integration 实际运行"
    class="block h-auto w-full mx-0!"
  /&gt;




## 设置 Slack app

1. 设置 [Codex cloud tasks](/mirror/codex/cloud)。你需要 Plus、Pro、Business、Enterprise 或 Edu 方案（参见 [ChatGPT pricing](https://chatgpt.com/pricing)）、一个已连接的 GitHub account，以及至少一个[环境](/mirror/codex/cloud/environments)。
2. 前往 [Codex settings](https://chatgpt.com/codex/settings/connectors)，并为你的 workspace 安装 Slack app。根据你的 Slack workspace policies，可能需要 admin 批准安装。
3. 将 `@Codex` 添加到 channel。如果你还没有添加它，Slack 会在你提及时提示你。

## 启动任务

1. 在 channel 或 thread 中提及 `@Codex` 并包含你的 prompt。Codex 可以引用 thread 中更早的消息，因此你通常不需要重述上下文。
2. （可选）在 prompt 中指定环境或仓库，例如：`@Codex fix the above in openai/codex`。
3. 等待 Codex 做出反应（👀），并回复任务链接。完成后，Codex 会发布结果，并根据你的设置在 thread 中发布答案。

### Codex 如何选择环境和 repo

- Codex 会查看你有权访问的环境，并选择最匹配你请求的环境。如果请求含糊，它会回退到你最近使用过的环境。
- 任务会针对该环境 repo map 中列出的第一个仓库的默认分支运行。如果你需要不同默认值或更多仓库，请在 Codex 中更新 repo map。
- 如果没有可用的合适环境或仓库，Codex 会在 Slack 中回复如何修复问题的说明，然后你可以重试。

### Enterprise 数据控制

默认情况下，Codex 会在 thread 中回复答案，其中可能包含来自其运行环境的信息。
为防止这种情况，Enterprise admin 可以在 [ChatGPT workspace settings](https://chatgpt.com/admin/settings) 中清除 **Allow Codex Slack app to post answers on task completion**。当 admin 关闭答案时，Codex 只会回复任务链接。

### 数据使用、隐私和安全

当你提及 `@Codex` 时，Codex 会接收你的消息和 thread history，以理解你的请求并创建任务。
数据处理遵循 OpenAI 的[隐私政策](https://openai.com/privacy)、[使用条款](https://openai.com/terms/)和其他适用[政策](https://openai.com/policies)。
有关安全的更多信息，请参见 Codex [安全文档](/mirror/codex/agent-approvals-security)。

Codex 使用 large language models，可能会出错。请始终审查答案和 diffs。

### 提示和排查

- **缺少连接**：如果 Codex 无法确认你的 Slack 或 GitHub 连接，它会回复一个重新连接链接。
- **环境选择不符合预期**：在 thread 中回复你想使用的环境（例如 `Please run this in openai/openai (applied)`），然后再次提及 `@Codex`。
- **较长或复杂的 threads**：在你的最新消息中总结关键细节，避免 Codex 漏掉埋在较早 thread 中的上下文。
- **Workspace 发布**：某些 Enterprise workspaces 会限制发布最终答案。在这些情况下，请打开任务链接查看进度和结果。
- **更多帮助**：参见 [OpenAI Help Center](https://help.openai.com/)。

:::

## English source

::: details 展开英文原文
::: v-pre
Use Codex in Slack to kick off coding tasks from channels and threads. Mention `@Codex` with a prompt, and Codex creates a cloud task and replies with the results.


  &lt;img src="https://developers.openai.com/images/codex/integrations/slack-example.png"
    alt="Codex Slack integration in action"
    class="block h-auto w-full mx-0!"
  /&gt;




## Set up the Slack app

1. Set up [Codex cloud tasks](/mirror/codex/cloud). You need a Plus, Pro, Business, Enterprise, or Edu plan (see [ChatGPT pricing](https://chatgpt.com/pricing)), a connected GitHub account, and at least one [environment](/mirror/codex/cloud/environments).
2. Go to [Codex settings](https://chatgpt.com/codex/settings/connectors) and install the Slack app for your workspace. Depending on your Slack workspace policies, an admin may need to approve the install.
3. Add `@Codex` to a channel. If you haven't added it yet, Slack prompts you when you mention it.

## Start a task

1. In a channel or thread, mention `@Codex` and include your prompt. Codex can reference earlier messages in the thread, so you often don't need to restate context.
2. (Optional) Specify an environment or repository in your prompt, for example: `@Codex fix the above in openai/codex`.
3. Wait for Codex to react (👀) and reply with a link to the task. When it finishes, Codex posts the result and, depending on your settings, an answer in the thread.

### How Codex chooses an environment and repo

- Codex reviews the environments you have access to and selects the one that best matches your request. If the request is ambiguous, it falls back to the environment you used most recently.
- The task runs against the default branch of the first repository listed in that environment’s repo map. Update the repo map in Codex if you need a different default or more repositories.
- If no suitable environment or repository is available, Codex will reply in Slack with instructions on how to fix the issue before retrying.

### Enterprise data controls

By default, Codex replies in the thread with an answer, which can include information from the environment it ran in.
To prevent this, an Enterprise admin can clear **Allow Codex Slack app to post answers on task completion** in [ChatGPT workspace settings](https://chatgpt.com/admin/settings). When an admin turns off answers, Codex replies only with a link to the task.

### Data usage, privacy, and security

When you mention `@Codex`, Codex receives your message and thread history to understand your request and create a task.
Data handling follows OpenAI's [Privacy Policy](https://openai.com/privacy), [Terms of Use](https://openai.com/terms/), and other applicable [policies](https://openai.com/policies).
For more on security, see the Codex [security documentation](/mirror/codex/agent-approvals-security).

Codex uses large language models that can make mistakes. Always review answers and diffs.

### Tips and troubleshooting

- **Missing connections**: If Codex can't confirm your Slack or GitHub connection, it replies with a link to reconnect.
- **Unexpected environment choice**: Reply in the thread with the environment you want (for example, `Please run this in openai/openai (applied)`), then mention `@Codex` again.
- **Long or complex threads**: Summarize key details in your latest message so Codex doesn't miss context buried earlier in the thread.
- **Workspace posting**: Some Enterprise workspaces restrict posting final answers. In those cases, open the task link to view progress and results.
- **More help**: See the [OpenAI Help Center](https://help.openai.com/).

:::
:::

