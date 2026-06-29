---
title: "Memories 记忆"
description: "How Codex carries useful context forward across threads"
outline: deep
---

# Memories 记忆

**文档集**：Codex<br>
**分组**：记忆<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/memories](https://developers.openai.com/codex/memories)
- Markdown 来源：[https://developers.openai.com/codex/memories.md](https://developers.openai.com/codex/memories.md)
- 抓取时间：2026-06-27T05:55:02.279Z
- Checksum：`4f821a28faa6ffb8b12b053748d31e436103244e25c1b483c1e6eabc7f564ee8`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Memories 默认关闭。在欧洲经济区、英国和瑞士，Codex 只有在你于 Codex 设置中启用 memories，或在 `~/.codex/config.toml` 的 `[features]` 表中设置 `memories = true` 后，才会使用或生成 memories。

Memories 让 Codex 能够把早先线程中的有用上下文带入未来工作。启用 memories 后，Codex 可以记住稳定偏好、反复出现的工作流、技术栈、项目约定和已知陷阱，这样你就不必在每个线程中重复相同上下文。

请把必需的团队指导放在 `AGENTS.md` 或已提交到仓库的文档中。把 memories 视为有用的本地回忆层，而不是必须始终应用的规则的唯一来源。

[Chronicle](/mirror/codex/memories/chronicle) 会帮助 Codex 从你的屏幕恢复最近工作上下文，以构建 memory。

## 启用 memories

在 Codex app 中，在设置里启用 Memories。

对于基于配置的设置，请把 feature flag 添加到 `config.toml`：

```toml
[features]
memories = true
```

请参阅 [Config basics](/mirror/codex/config-basic)，了解 Codex 在哪里存储用户级配置，以及 Codex 如何加载 `~/.codex/config.toml`。

## Memories 如何工作

启用 memories 后，Codex 可以把符合条件的既往线程中的有用上下文转化为本地 memory 文件。Codex 会跳过活跃或短暂会话，从生成的 memory 字段中遮盖 secrets，并在后台更新 memories，而不是在每个线程结束时立即更新。

线程结束时，memories 可能不会马上更新。Codex 会等到线程空闲足够长时间后再处理，以避免总结仍在进行中的工作。

当你的 Codex rate-limit 剩余百分比低于配置阈值时，memory generation 也可能跳过一次后台处理，这样 Codex 在你接近限制时不会消耗配额。

## Memory 存储

Codex 将 memories 存储在你的 Codex home 目录下。默认情况下，该目录是 `~/.codex`。请参阅 [Config and state locations](/mirror/codex/config-advanced#config-and-state-locations)，了解 Codex 如何使用 `CODEX_HOME`。

主要 memory 文件位于 `~/.codex/memories/` 下，包括 summaries、durable entries、recent inputs，以及来自既往线程的 supporting evidence。

请把这些文件视为生成状态。排查问题或分享 Codex home 目录前，你可以检查它们，但不要依赖手动编辑它们作为主要控制界面。

## 按线程控制 memories

在 Codex app 和 Codex TUI 中，使用 `/memories` 控制当前线程的 memory 行为。线程级选择让你决定当前线程能否使用已有 memories，以及 Codex 能否使用该线程生成未来 memories。

线程级选择不会改变你的全局 memory 设置。

## 配置

在 Codex app 设置中启用 memories，或在 `config.toml` 的 `[features]` 部分设置 `memories = true`。

如需配置文件位置和 memory 相关设置的完整列表，请参阅[配置参考](/mirror/codex/config-reference)。

常见的 memory 专用设置包括：

- `memories.generate_memories`：控制新建线程是否可以被存储为 memory-generation 输入。
- `memories.use_memories`：控制 Codex 是否将已有 memories 注入未来会话。
- `memories.disable_on_external_context`：当为 `true` 时，会把使用了外部上下文（例如 MCP tool calls、web search 或 tool search）的线程排除在 memory generation 之外。较旧的 `memories.no_memories_if_mcp_or_web_search` 键仍作为别名被接受。
- `memories.min_rate_limit_remaining_percent`：控制 memory generation 启动前所需的最低 Codex rate-limit 剩余百分比。
- `memories.extract_model`：覆盖用于按线程提取 memory 的模型。
- `memories.consolidation_model`：覆盖用于全局 memory consolidation 的模型。

## 审查 memories

不要在 memories 中存储 secrets。Codex 会从生成的 memory 字段中遮盖 secrets，但在分享 Codex home 目录或生成的 memory artifacts 之前，你仍应审查 memory 文件。

:::

## English source

::: details 展开英文原文
::: v-pre
Memories are off by default. In the European Economic Area, the United
  Kingdom, and Switzerland, Codex uses or generates memories only after you
  enable them in Codex settings, or set `memories = true` in the `[features]`
  table in `~/.codex/config.toml`.

Memories let Codex carry useful context from earlier threads into future work.
After you enable memories, Codex can remember stable preferences, recurring
workflows, tech stacks, project conventions, and known pitfalls so you don't
need to repeat the same context in every thread.

Keep required team guidance in `AGENTS.md` or checked-in documentation. Treat
memories as a helpful local recall layer, not as the only source for rules that
must always apply.

[Chronicle](/mirror/codex/memories/chronicle) helps Codex recover recent working
context from your screen to build up memory.

## Enable memories

In the Codex app, enable Memories in settings.

For config-based setup, add the feature flag to `config.toml`:

```toml
[features]
memories = true
```

See [Config basics](/mirror/codex/config-basic) for where Codex stores user-level
configuration and how Codex loads `~/.codex/config.toml`.

## How memories work

After you enable memories, Codex can turn useful context from eligible prior
threads into local memory files. Codex skips active or short-lived sessions,
redacts secrets from generated memory fields, and updates memories in the
background instead of immediately at the end of every thread.

Memories may not update right away when a thread ends. Codex waits until a
thread has been idle long enough to avoid summarizing work that's still in
progress.

Memory generation can also skip a background pass when your Codex rate-limit
remaining percentage is below the configured threshold, so Codex doesn't spend
quota when you're near a limit.

## Memory storage

Codex stores memories under your Codex home directory. By default, that's
`~/.codex`. See [Config and state locations](/mirror/codex/config-advanced#config-and-state-locations)
for how Codex uses `CODEX_HOME`.

The main memory files live under `~/.codex/memories/` and include summaries,
durable entries, recent inputs, and supporting evidence from prior threads.

Treat these files as generated state. You can inspect them when troubleshooting
or before sharing your Codex home directory, but don't rely on editing them by
hand as your primary control surface.

## Control memories per thread

In the Codex app and Codex TUI, use `/memories` to control memory behavior for
the current thread. Thread-level choices let you decide whether the current
thread can use existing memories and whether Codex can use the thread to
generate future memories.

Thread-level choices don't change your global memory settings.

## Configuration

Enable memories in the Codex app settings, or set `memories = true` in the
`[features]` section of `config.toml`.

For config file locations and the full list of memory-related settings, see the
[configuration reference](/mirror/codex/config-reference).

Common memory-specific settings include:

- `memories.generate_memories`: controls whether newly created threads can be
  stored as memory-generation inputs.
- `memories.use_memories`: controls whether Codex injects existing memories into
  future sessions.
- `memories.disable_on_external_context`: when `true`, keeps threads that used
  external context such as MCP tool calls, web search, or tool search out of
  memory generation. The older `memories.no_memories_if_mcp_or_web_search` key
  is still accepted as an alias.
- `memories.min_rate_limit_remaining_percent`: controls the minimum remaining
  Codex rate-limit percentage required before memory generation starts.
- `memories.extract_model`: overrides the model used for per-thread memory
  extraction.
- `memories.consolidation_model`: overrides the model used for global memory
  consolidation.

## Review memories

Don't store secrets in memories. Codex redacts secrets from generated memory
fields, but you should still review memory files before sharing your Codex home
directory or generated memory artifacts.

:::
:::

