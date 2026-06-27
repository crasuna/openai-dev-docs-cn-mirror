---
status: needs-review
sourceId: "a8e904feb9d6"
sourceChecksum: "a8e904feb9d6308ec4b615a13841abb546c4810b123896042dc05825ba67fda0"
sourceUrl: "https://developers.openai.com/codex/integrations/slack"
translatedAt: "2026-06-27T19:05:47.1891485+08:00"
translator: codex-gpt-5.5-xhigh
---

# 在 Slack 中使用 Codex

在 Slack 中使用 Codex，可以从 channels 和 threads 发起 coding tasks。用 prompt 提及 `@Codex`，Codex 会创建云端任务并回复结果。

<div class="not-prose max-w-3xl mr-auto">
  <img src="https://developers.openai.com/images/codex/integrations/slack-example.png"
    alt="Codex Slack integration 实际运行"
    class="block h-auto w-full mx-0!"
  />
</div>

<br />

## 设置 Slack app

1. 设置 [Codex cloud tasks](https://developers.openai.com/codex/cloud)。你需要 Plus、Pro、Business、Enterprise 或 Edu 方案（参见 [ChatGPT pricing](https://chatgpt.com/pricing)）、一个已连接的 GitHub account，以及至少一个[环境](https://developers.openai.com/codex/cloud/environments)。
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
有关安全的更多信息，请参见 Codex [安全文档](https://developers.openai.com/codex/agent-approvals-security)。

Codex 使用 large language models，可能会出错。请始终审查答案和 diffs。

### 提示和排查

- **缺少连接**：如果 Codex 无法确认你的 Slack 或 GitHub 连接，它会回复一个重新连接链接。
- **环境选择不符合预期**：在 thread 中回复你想使用的环境（例如 `Please run this in openai/openai (applied)`），然后再次提及 `@Codex`。
- **较长或复杂的 threads**：在你的最新消息中总结关键细节，避免 Codex 漏掉埋在较早 thread 中的上下文。
- **Workspace 发布**：某些 Enterprise workspaces 会限制发布最终答案。在这些情况下，请打开任务链接查看进度和结果。
- **更多帮助**：参见 [OpenAI Help Center](https://help.openai.com/)。
