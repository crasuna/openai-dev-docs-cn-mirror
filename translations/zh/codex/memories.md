---
status: needs-review
sourceId: "4f821a28faa6"
sourceChecksum: "4f821a28faa6ffb8b12b053748d31e436103244e25c1b483c1e6eabc7f564ee8"
sourceUrl: "https://developers.openai.com/codex/memories"
translatedAt: "2026-06-27T19:06:51.2133192+08:00"
translator: codex-gpt-5.5-xhigh
---

# Memories 记忆

Memories 默认关闭。在欧洲经济区、英国和瑞士，Codex 只有在你于 Codex 设置中启用 memories，或在 `~/.codex/config.toml` 的 `[features]` 表中设置 `memories = true` 后，才会使用或生成 memories。

Memories 让 Codex 能够把早先线程中的有用上下文带入未来工作。启用 memories 后，Codex 可以记住稳定偏好、反复出现的工作流、技术栈、项目约定和已知陷阱，这样你就不必在每个线程中重复相同上下文。

请把必需的团队指导放在 `AGENTS.md` 或已提交到仓库的文档中。把 memories 视为有用的本地回忆层，而不是必须始终应用的规则的唯一来源。

[Chronicle](https://developers.openai.com/codex/memories/chronicle) 会帮助 Codex 从你的屏幕恢复最近工作上下文，以构建 memory。

## 启用 memories

在 Codex app 中，在设置里启用 Memories。

对于基于配置的设置，请把 feature flag 添加到 `config.toml`：

```toml
[features]
memories = true
```

请参阅 [Config basics](https://developers.openai.com/codex/config-basic)，了解 Codex 在哪里存储用户级配置，以及 Codex 如何加载 `~/.codex/config.toml`。

## Memories 如何工作

启用 memories 后，Codex 可以把符合条件的既往线程中的有用上下文转化为本地 memory 文件。Codex 会跳过活跃或短暂会话，从生成的 memory 字段中遮盖 secrets，并在后台更新 memories，而不是在每个线程结束时立即更新。

线程结束时，memories 可能不会马上更新。Codex 会等到线程空闲足够长时间后再处理，以避免总结仍在进行中的工作。

当你的 Codex rate-limit 剩余百分比低于配置阈值时，memory generation 也可能跳过一次后台处理，这样 Codex 在你接近限制时不会消耗配额。

## Memory 存储

Codex 将 memories 存储在你的 Codex home 目录下。默认情况下，该目录是 `~/.codex`。请参阅 [Config and state locations](https://developers.openai.com/codex/config-advanced#config-and-state-locations)，了解 Codex 如何使用 `CODEX_HOME`。

主要 memory 文件位于 `~/.codex/memories/` 下，包括 summaries、durable entries、recent inputs，以及来自既往线程的 supporting evidence。

请把这些文件视为生成状态。排查问题或分享 Codex home 目录前，你可以检查它们，但不要依赖手动编辑它们作为主要控制界面。

## 按线程控制 memories

在 Codex app 和 Codex TUI 中，使用 `/memories` 控制当前线程的 memory 行为。线程级选择让你决定当前线程能否使用已有 memories，以及 Codex 能否使用该线程生成未来 memories。

线程级选择不会改变你的全局 memory 设置。

## 配置

在 Codex app 设置中启用 memories，或在 `config.toml` 的 `[features]` 部分设置 `memories = true`。

如需配置文件位置和 memory 相关设置的完整列表，请参阅[配置参考](https://developers.openai.com/codex/config-reference)。

常见的 memory 专用设置包括：

- `memories.generate_memories`：控制新建线程是否可以被存储为 memory-generation 输入。
- `memories.use_memories`：控制 Codex 是否将已有 memories 注入未来会话。
- `memories.disable_on_external_context`：当为 `true` 时，会把使用了外部上下文（例如 MCP tool calls、web search 或 tool search）的线程排除在 memory generation 之外。较旧的 `memories.no_memories_if_mcp_or_web_search` 键仍作为别名被接受。
- `memories.min_rate_limit_remaining_percent`：控制 memory generation 启动前所需的最低 Codex rate-limit 剩余百分比。
- `memories.extract_model`：覆盖用于按线程提取 memory 的模型。
- `memories.consolidation_model`：覆盖用于全局 memory consolidation 的模型。

## 审查 memories

不要在 memories 中存储 secrets。Codex 会从生成的 memory 字段中遮盖 secrets，但在分享 Codex home 目录或生成的 memory artifacts 之前，你仍应审查 memory 文件。
