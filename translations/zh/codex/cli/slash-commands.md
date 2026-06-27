---
status: needs-review
sourceId: "d1de22232d64"
sourceChecksum: "d1de22232d6429d9b76da24f8b854df329c3ab1e087c76200913cc519bd321a1"
sourceUrl: "https://developers.openai.com/codex/cli/slash-commands"
translatedAt: "2026-06-27T11:05:32.948Z"
translator: codex-gpt-5.5-xhigh
---

# Codex CLI 中的 Slash commands

Slash commands 让你能以键盘优先的方式快速控制 Codex。在 composer 中输入 `/` 打开 slash popup，选择一个 command，Codex 就会执行切换模型、调整 permissions 或总结长对话等 actions，而无需离开终端。

本指南会展示如何：

- 为 task 找到合适的内置 slash command
- 使用 `/model`、`/fast`、`/personality`、`/permissions`、`/approve`、`/raw`、`/agent` 和 `/status` 等 commands 引导 active session

## 内置 slash commands

Codex 随附以下 commands。打开 slash popup 并开始输入 command name，即可筛选列表。

当 task 已经在运行时，你可以输入 slash command 并按 `Tab`，将它排入下一个 turn。Codex 会在 queued slash commands 运行时解析它们，因此 command menus 和 errors 会在当前 turn 完成后出现。排队前 slash completion 仍然可用。

| Command                                                                         | Purpose                                                         | When to use it                                                                                             |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`/permissions`](#update-permissions-with-permissions)                          | 设置 Codex 在无需先询问的情况下可以做什么。                     | 在 session 中途放宽或收紧 approval requirements，例如在 Auto 和 Read Only 之间切换。          |
| [`/ide`](#include-ide-context-with-ide)                                         | 包含打开的文件、当前 selection 和其他 IDE context。   | 把 editor context 拉入下一个 prompt，而无需重新说明 IDE 中打开了什么。                    |
| [`/keymap`](#remap-tui-shortcuts-with-keymap)                                   | 重新映射 TUI keyboard shortcuts。                                   | 检查自定义 shortcut bindings，并将其持久化到 `config.toml`。                                             |
| [`/vim`](#toggle-vim-mode-with-vim)                                             | 切换 composer 的 Vim mode。                               | 在 Vim normal/insert 行为和默认 composer editing mode 之间切换。                           |
| [`/sandbox-add-read-dir`](#grant-sandbox-read-access-with-sandbox-add-read-dir) | 授予 sandbox 对额外目录的 read access（仅 Windows）。 | 解除需要读取当前 readable roots 之外 absolute directory path 的 commands 的阻塞。          |
| [`/agent`](#switch-agent-threads-with-agent)                                    | 切换 active agent thread。                                 | 检查或继续 spawned subagent thread 中的工作。                                                     |
| [`/apps`](#browse-apps-with-apps)                                               | 浏览 apps（connectors）并把它们插入 prompt。      | 在要求 Codex 使用某个 app 前，先将 app 作为 `$app-slug` 附加。                                                |
| [`/plugins`](#browse-plugins-with-plugins)                                      | 浏览已安装和可发现的 plugins。                      | 检查 plugin tools、安装建议的 plugins，或管理 plugin availability。                            |
| [`/hooks`](#view-and-manage-lifecycle-hooks-with-hooks)                         | 查看和管理 lifecycle hooks。                                | 检查已配置 hooks、信任新增或变更的 hooks，或在 non-managed hooks 运行前禁用它们。        |
| [`/clear`](#clear-the-terminal-and-start-a-new-chat-with-clear)                 | 清空终端并开始一个新的 chat。                      | 当你想重新开始时，同时重置可见 UI 和 conversation。                                |
| [`/archive`](#archive-the-current-session-with-archive)                         | 归档当前 session 并退出 Codex。                     | 将当前 session 从 active session lists 中移除，但不删除 transcript。                      |
| [`/delete`](#delete-the-current-session-with-delete)                            | 永久删除当前 session 并退出 Codex。          | 当 archiving 不够时，移除 transcript 和 descendant sessions。                                 |
| [`/compact`](#keep-transcripts-lean-with-compact)                               | 总结可见 conversation 以释放 tokens。              | 长时间运行后使用，让 Codex 保留关键点而不耗尽 context window。                        |
| [`/copy`](#copy-the-latest-response-with-copy)                                  | 复制最新完成的 Codex 输出。                         | 无需手动选择即可获取最新完成的 response 或 plan text。你也可以按 `Ctrl+O`。 |
| [`/diff`](#review-changes-with-diff)                                            | 显示 Git diff，包括 Git 尚未 tracking 的文件。      | 在 commit 或运行 tests 前 review Codex 的 edits。                                                       |
| [`/exit`](#exit-the-cli-with-quit-or-exit)                                      | 退出 CLI（与 `/quit` 相同）。                                 | 另一种拼写；两个 commands 都会退出 session。                                                      |
| [`/experimental`](#toggle-experimental-features-with-experimental)              | 切换 experimental features。                                   | 从 CLI 启用可选功能，例如 subagents。                                                   |
| [`/approve`](#approve-an-auto-review-denial-with-approve)                       | 批准最近一次 auto review denial 的一次 retry。               | 重试 automatic reviewer 拒绝过的 command 或 action。                                                   |
| [`/memories`](#configure-memories-with-memories)                                | 配置 memory 使用和生成。                            | 在不离开 TUI 的情况下打开或关闭 memory injection 或 memory generation。                              |
| [`/skills`](#use-skills-with-skills)                                            | 浏览并使用 skills。                                          | 通过选择相关 local skill 来改善 task-specific behavior。                                        |
| [`/import`](#import-claude-code-configuration-with-import)                      | 导入 Claude Code setup、project files 和 recent chats。      | 将支持的 external-agent artifacts 迁移到 Codex configuration 和 local files。                       |
| [`/feedback`](#send-feedback-with-feedback)                                     | 向 Codex maintainers 发送 logs。                             | 报告问题或与 support 共享 diagnostics。                                                           |
| [`/init`](#generate-agentsmd-with-init)                                         | 在当前目录生成 `AGENTS.md` scaffold。      | 捕获 repository 或 subdirectory 的 persistent instructions。                      |
| [`/logout`](#sign-out-with-logout)                                              | 退出 Codex 登录。                                              | 在共享机器上清除 local credentials。                                                       |
| [`/mcp`](#list-mcp-tools-with-mcp)                                              | 列出已配置的 Model Context Protocol (MCP) tools。             | 检查 Codex 在 session 中可以调用哪些外部 tools；添加 `verbose` 查看 server details。            |
| [`/mention`](#highlight-files-with-mention)                                     | 将文件附加到 conversation。                              | 指向你希望 Codex 接下来检查的特定 files 或 folders。                                      |
| [`/model`](#set-the-active-model-with-model)                                    | 选择 active model（以及可用时的 reasoning effort）。 | 在运行 task 前，在通用模型（`gpt-4.1-mini`）和更深推理模型之间切换。  |
| [`/fast`](#toggle-fast-mode-with-fast)                                          | 当 model catalog 暴露 Fast service tier 时切换它。  | 打开或关闭当前 model 的 Fast tier，或检查 thread 是否正在使用它。                     |
| [`/plan`](#switch-to-plan-mode-with-plan)                                       | 切换到 plan mode，并可选发送 prompt。               | 在 implementation work 开始前，让 Codex 提出 execution plan。                                  |
| [`/goal`](#set-or-view-a-task-goal-with-goal)                                   | 设置、暂停、恢复、查看或清除 task goal。                 | 在更大的 task 运行期间，给 Codex 一个持久 target 进行跟踪。                                          |
| [`/personality`](#set-a-communication-style-with-personality)                   | 选择 response 的 communication style。                     | 在不改变 instructions 的情况下，让 Codex 更简洁、更具解释性或更协作。       |
| [`/ps`](#check-background-terminals-with-ps)                                    | 显示 experimental background terminals 及其最近输出。 | 在不离开主 transcript 的情况下检查 long-running commands。                                           |
| [`/stop`](#stop-background-terminals-with-stop)                                 | 停止所有 background terminals。                                  | 取消当前 session 启动的 background terminal work。                                            |
| [`/fork`](#fork-the-current-conversation-with-fork)                             | 将当前 conversation fork 到新 thread。                | 分支 active session 来探索新方法，同时不丢失当前 transcript。                 |
| [`/side`, `/btw`](#start-a-side-conversation-with-side)                         | 开始一个 ephemeral side conversation。                           | 提出 focused follow-up，而不打断主 thread 的 transcript。                                   |
| [`/raw`](#toggle-raw-scrollback-with-raw)                                       | 切换 raw scrollback mode。                                     | 在 review 长输出时，让 terminal selection 和 copying 的格式化更少。                            |
| [`/resume`](#resume-a-saved-conversation-with-resume)                           | 从 session list 恢复一个 saved conversation。             | 继续之前的 CLI session，而无需从头开始。                                           |
| [`/new`](#start-a-new-conversation-with-new)                                    | 在同一个 CLI session 内开始一个新 conversation。           | 当你想在同一个 repo 中用全新 prompt 开始时，重置 chat context 而不离开 CLI。              |
| [`/quit`](#exit-the-cli-with-quit-or-exit)                                      | 退出 CLI。                                                   | 立即离开 session。                                                                             |
| [`/review`](#ask-for-a-working-tree-review-with-review)                         | 要求 Codex review 你的 working tree。                          | 在 Codex 完成工作后，或你想对 local changes 再看一遍时运行。                     |
| [`/status`](#inspect-the-session-with-status)                                   | 显示 session configuration 和 token usage。                  | 确认 active model、approval policy、writable roots 和剩余 context capacity。                 |
| [`/usage`](#view-account-usage-with-usage)                                      | 查看 account token usage 或使用 rate-limit reset。             | 在 TUI 内检查 daily、weekly 或 cumulative ChatGPT token activity。                           |
| [`/debug-config`](#inspect-config-layers-with-debug-config)                     | 打印 config layer 和 requirements diagnostics。                | 调试 precedence 和 policy requirements，包括 experimental network constraints。                      |
| [`/statusline`](#configure-footer-items-with-statusline)                        | 交互式配置 TUI status-line fields。                 | 选择并重新排序 footer items（model/context/limits/git/tokens/session），并持久化到 config.toml。        |
| [`/title`](#configure-terminal-title-items-with-title)                          | 交互式配置 terminal window 或 tab title fields。    | 选择并重新排序 title items，例如 project、status、thread、branch、model 和 task progress。            |
| [`/theme`](#choose-a-syntax-theme-with-theme)                                   | 选择 syntax-highlighting theme。                             | 预览并持久化 terminal syntax-highlighting theme。                                                  |

`/quit` 和 `/exit` 都会退出 CLI。只有在你已经保存或提交任何重要工作后才使用它们。

使用 `/permissions` 调整 Codex 在无需先询问的情况下可以做什么。只有在你需要重试最近被 automatic review 拒绝的 action 时，才使用 `/approve`。

## 使用 slash commands 控制你的 session

以下 workflows 可让你的 session 保持正轨，而无需重启 Codex。

### 使用 `/model` 设置 active model

1. 启动 Codex 并打开 composer。
2. 输入 `/model` 并按 Enter。
3. 从 popup 中选择一个 model，例如 `gpt-4.1-mini` 或 `gpt-4.1`。

预期：Codex 在 transcript 中确认新 model。运行 `/status` 验证更改。

### 使用 `/fast` 切换 Fast mode

1. 输入 `/fast on`、`/fast off` 或 `/fast status`。
2. 如果你希望设置持久化，请在 Codex 提示保存时确认更新。

预期：Codex 报告当前 model 的 Fast service tier 对当前 thread 是开启还是关闭。在 TUI footer 中，你也可以用 `/statusline` 显示 Fast mode status-line item。

Fast tier commands 由 catalog 驱动。如果当前 model 没有声明 Fast tier，Codex 不会显示 `/fast`。

### 使用 `/personality` 设置 communication style

使用 `/personality` 改变 Codex 的沟通方式，而无需重写 prompt。

1. 在 active conversation 中，输入 `/personality` 并按 Enter。
2. 从 popup 中选择一种 style。

预期：Codex 在 transcript 中确认新 style，并在 thread 后续 responses 中使用它。

Codex 支持 `friendly`、`pragmatic` 和 `none` personalities。使用 `none` 禁用 personality instructions。

如果 active model 不支持 personality-specific instructions，Codex 会隐藏此 command。

### 使用 `/plan` 切换到 plan mode

1. 输入 `/plan` 并按 Enter，将 active conversation 切换到 plan mode。
2. 可选：提供 inline prompt text（例如 `/plan Propose a
migration plan for this service`）。
3. 使用 inline `/plan` arguments 时，你可以粘贴内容或附加 images。

预期：Codex 进入 plan mode，并把你的可选 inline prompt 用作第一个 planning request。

当 task 已经在运行时，`/plan` 会暂时不可用。

### 使用 `/goal` 设置或查看 task goal

1. 输入 `/goal <objective>` 设置 goal，例如 `/goal Finish the migration and keep tests green`。
2. 输入 `/goal` 查看当前 goal。
3. 使用 `/goal pause`、`/goal resume` 或 `/goal clear` 来暂停、恢复或移除它。

预期：Codex 会在工作继续时把 goal 附加到 active thread。

Goal objectives 必须非空，且最多 4,000 个字符。对于更长的 instructions，请把细节放进文件，并让 goal 指向该文件。

### 使用 `/experimental` 切换 experimental features

1. 输入 `/experimental` 并按 Enter。
2. 切换你想要的 features（例如 Apps 或 Smart Approvals），然后在 prompt 要求时重启 Codex。

预期：Codex 将你的 feature choices 保存到 config，并在重启后应用。

### 使用 `/approve` 批准 auto review denial

当 automatic reviewer 拒绝了最近的 action，而你希望 Codex 重试一次时，使用 `/approve`。

1. 输入 `/approve`。
2. 当 Codex 显示相关 denied action 时，确认 retry。

预期：Codex 会在当前 session policy 下重试该 denied action 一次。

### 使用 `/memories` 配置 memories

1. 输入 `/memories`。
2. 选择 Codex 应使用 existing memories、生成 new memories，还是保持 memory behavior disabled。

预期：Codex 更新相关 memory settings，用于未来 sessions。

### 使用 `/skills`

1. 输入 `/skills`。
2. 选择你希望 Codex 应用的 skill。

预期：Codex 插入所选 skill context，让下一个 request 遵循该 skill 的 instructions。

### 使用 `/import` 导入 Claude Code 配置

1. 输入 `/import`。
2. 选择你要迁移的 Claude Code setup、project files 或 recent chats。

预期：Codex 打开 external-agent import picker，并把支持的 artifacts 导入 Codex configuration 和 local files。

从 local TUI session 运行 `/import`。当 task 正在运行、处于 remote sessions、或连接到 local app-server daemon 时，它不可用。

### 使用 `/clear` 清空终端并开始新 chat

1. 输入 `/clear` 并按 Enter。

预期：Codex 清空终端、重置可见 transcript，并在同一个 CLI session 中开始一个新 chat。

与 <kbd>Ctrl</kbd>+<kbd>L</kbd> 不同，`/clear` 会开始一个新的 conversation。

<kbd>Ctrl</kbd>+<kbd>L</kbd> 只会清空 terminal view，并保留当前 chat。当 task 正在进行时，Codex 会禁用这两个 actions。

### 使用 `/archive` 归档当前 session

1. 输入 `/archive` 并按 Enter。
2. 确认你想归档当前 session 并退出 Codex。

预期：Codex 归档当前 session 并关闭 interactive TUI。Codex 会在本地保存 session transcript；稍后可用 `codex unarchive <SESSION>` 恢复。

`/archive` 在 task 正在运行时不可用。

### 使用 `/delete` 删除当前 session

1. 输入 `/delete` 并按 Enter。
2. 确认你想删除当前 session 并退出 Codex。

预期：Codex 删除当前 session transcript 并关闭 interactive TUI。删除是永久性的，也会移除 spawned descendant sessions。

`/delete` 在 task 正在运行或处于 side conversation 时不可用。

### 使用 `/permissions` 更新 permissions

1. 输入 `/permissions` 并按 Enter。
2. 选择与你舒适程度匹配的 approval preset，例如用于免打扰运行的 `Auto`，或用于 review edits 的 `Read Only`。当 named permission profiles 处于 active 状态时，picker 也会显示已配置的 custom profiles 及其 descriptions。

预期：Codex 宣告更新后的 policy。未来 actions 会遵循更新后的 approval mode，直到你再次更改它。

### 使用 `/ide` 包含 IDE context

1. 输入 `/ide`。
2. 如果你想说明 Codex 应如何处理当前 IDE selection 或 open files，可以添加可选 inline text。

预期：Codex 会在下一个 prompt 中包含可用 IDE context。

### 使用 `/vim` 切换 Vim mode

1. 输入 `/vim`。
2. 在 composer 中继续编辑。

预期：Codex 为当前 session 切换 composer Vim mode。要让 Vim mode 成为新 sessions 的默认值，请在 `config.toml` 中设置 `tui.vim_mode_default = true`。

### 使用 `/copy` 复制最新 response

1. 输入 `/copy` 并按 Enter。

预期：Codex 将最新完成的 Codex 输出复制到 clipboard。

如果某个 turn 仍在运行，`/copy` 会使用最新完成的输出，而不是 in-progress response。该 command 在第一个已完成的 Codex 输出之前，以及 rollback 之后立即不可用。

你也可以在主 TUI 中按 <kbd>Ctrl</kbd>+<kbd>O</kbd>，无需打开 slash command menu 即可复制最新完成的 response。

### 使用 `/raw` 切换 raw scrollback

1. 输入 `/raw`、`/raw on` 或 `/raw off`。

预期：Codex 切换 raw scrollback mode，使 terminal selection 和 copying 更直接。你也可以使用默认 <kbd>Alt</kbd>+<kbd>R</kbd> binding，或用 `tui.raw_output_mode = true` 持久化默认值。

### 使用 `/sandbox-add-read-dir` 授予 sandbox read access

该 command 仅在 Windows 原生运行 CLI 时可用。

1. 输入 `/sandbox-add-read-dir C:\absolute\directory\path` 并按 Enter。
2. 确认该 path 是一个现有 absolute directory。

预期：Codex 刷新 Windows sandbox policy，并授予该目录的 read access，供之后在 sandbox 中运行且需要读取该目录的 commands 使用。

### 使用 `/status` 检查 session

1. 在任意 conversation 中，输入 `/status`。
2. 查看 active model、approval policy、writable roots 和当前 token usage 的输出。当 TUI 远程连接时，输出还会显示 remote address 和 server version。

预期：Codex 打印 summary，确认它正在你预期的位置运行。

### 使用 `/usage` 查看 account usage

1. 输入 `/usage` 打开 usage menu。
2. 选择显示 token activity，或兑换可用的 earned reset。
3. 要直接打开 token activity，请输入 `/usage daily`、`/usage weekly` 或 `/usage cumulative`。

预期：Codex 打开 usage actions，或显示所选 view 的 account token activity。如果 session 没有 Codex service account auth，Codex 会显示 sign-in requirement。

### 使用 `/debug-config` 检查 config layers

1. 输入 `/debug-config`。
2. 查看 config layer order（从最低优先级开始）、on/off state 和 policy sources。

预期：Codex 打印 layer diagnostics 以及 policy details，例如 `allowed_approval_policies`、`allowed_sandbox_modes`、`mcp_servers`、`rules`、`enforce_residency` 和配置时的 `experimental_network`。

使用此输出来调试为什么 effective setting 与 `config.toml` 不同。

### 使用 `/statusline` 配置 footer items

1. 输入 `/statusline`。
2. 使用 picker 切换和重新排序 items，然后确认。

预期：footer status line 立即更新，并持久化到 `config.toml` 中的 `tui.status_line`。

可用 status-line items 包括 model、model+reasoning、context stats、rate limits、git branch、token counters、session id、current directory/project root 和 Codex version。

### 使用 `/title` 配置 terminal title items

1. 输入 `/title`。
2. 使用 picker 切换和重新排序 items，然后确认。

预期：terminal window 或 tab title 立即更新，并持久化到 `config.toml` 中的 `tui.terminal_title`。

可用 title items 包括 app name、project、spinner、status、thread、git branch、model 和 task progress。

### 使用 `/theme` 选择 syntax theme

1. 输入 `/theme`。
2. 从 picker 预览 theme，然后确认。

预期：Codex 更新 syntax highlighting，并持久化选择到 `config.toml` 中的 `tui.theme`。

### 使用 `/keymap` 重新映射 TUI shortcuts

使用 `/keymap` 检查、更新并持久化 TUI 的 keyboard shortcut bindings。

1. 输入 `/keymap`。
2. 选择你想更改的 shortcut context 和 action。
3. 输入 new binding，或移除 existing one。

预期：Codex 更新 active keymap，并把 custom binding 写入 `config.toml` 中的 `tui.keymap`。

Key bindings 使用 `ctrl-a`、`shift-enter` 和 `page-down` 等名称。Context-specific bindings 会覆盖 `tui.keymap.global`；空 binding list 会解绑该 action。

### 使用 `/ps` 检查 background terminals

1. 输入 `/ps`。
2. 查看 background terminals 列表及其 status。

预期：Codex 显示每个 background terminal 的 command，以及最多三行最近的非空 output，让你一眼判断进展。

当使用 `unified_exec` 时会出现 background terminals；否则列表可能为空。

### 使用 `/stop` 停止 background terminals

1. 输入 `/stop`。
2. 如果 Codex 在停止列出的 terminals 前要求确认，请确认。

预期：Codex 停止当前 session 的所有 background terminals。`/clean` 仍可作为 `/stop` 的 alias 使用。

### 使用 `/compact` 保持 transcripts 精简

1. 在长对话后，输入 `/compact`。
2. 当 Codex 提示 summarize 到目前为止的 conversation 时确认。

预期：Codex 用简洁 summary 替换较早 turns，在保留关键细节的同时释放 context。

### 使用 `/diff` review changes

1. 输入 `/diff` 检查 Git diff。
2. 在 CLI 中滚动查看输出，以 review edits 和 added files。

预期：Codex 显示你已 staged 的变更、尚未 staged 的变更，以及 Git 尚未开始 tracking 的文件，便于你决定保留什么。

### 使用 `/mention` 高亮文件

1. 输入 `/mention` 后跟 path，例如 `/mention src/lib/api.ts`。
2. 从 popup 中选择匹配结果。

预期：Codex 将该文件加入 conversation，确保后续 turns 直接引用它。

### 使用 `/new` 开始新 conversation

1. 输入 `/new` 并按 Enter。

预期：Codex 在同一个 CLI session 中开始一个全新 conversation，让你可以切换 tasks 而无需离开终端。

与 `/clear` 不同，`/new` 不会先清空当前 terminal view。

### 使用 `/resume` 恢复 saved conversation

1. 输入 `/resume` 并按 Enter。
2. 从 saved-session picker 中选择你想要的 session。

预期：Codex 重新加载所选 conversation 的 transcript，让你可以从中断处继续，同时保持原始 history 不变。

### 使用 `/fork` fork 当前 conversation

1. 输入 `/fork` 并按 Enter。

预期：Codex 将当前 conversation 克隆到一个带有新 ID 的新 thread 中，保留原始 transcript 不受影响，让你可以并行探索替代方案。

如果你需要 fork saved session 而不是当前 session，请在终端运行 `codex fork` 打开 session picker。

### 使用 `/side` 开始 side conversation

使用 `/side` 从当前 conversation 开始一个 ephemeral fork，而不切离主 task。

1. 输入 `/side` 打开 side conversation。
2. 可选添加 inline text，例如 `/side Check whether this plan has an obvious risk`。
3. focused detour 完成后返回 parent thread。

预期：Codex 打开一个 transcript 与 parent thread 分开的 side conversation。当你处于 side mode 时，TUI 会继续显示 parent-thread status，因此你可以看到 main task 是否仍在运行。

`/side` 在另一个 side conversation 内和 review mode 期间不可用。

### 使用 `/init` 生成 `AGENTS.md`

1. 在你希望 Codex 查找 persistent instructions 的目录中运行 `/init`。
2. 查看生成的 `AGENTS.md`，然后编辑它以匹配你的 repository conventions。

预期：Codex 创建一个 `AGENTS.md` scaffold，你可以完善并 commit，供未来 sessions 使用。

### 使用 `/review` 请求 working tree review

1. 输入 `/review`。
2. 如果你想检查确切 file changes，请继续使用 `/diff`。

预期：Codex 总结它在你的 working tree 中发现的问题，重点关注 behavior changes 和 missing tests。除非你在 `config.toml` 中设置 `review_model`，否则它使用当前 session model。

### 使用 `/mcp` 列出 MCP tools

1. 输入 `/mcp`。
2. 查看列表，确认当前 session 中可用的 MCP servers 和 tools。

预期：你会看到已配置的 Model Context Protocol (MCP) tools，Codex 可在该 session 中调用它们。

使用 `/mcp verbose` 可以包含详细 server diagnostics。如果你传入除 `verbose` 之外的任何内容，Codex 会显示 command usage。

### 使用 `/apps` 浏览 apps

1. 输入 `/apps`。
2. 从列表中选择一个 app。

预期：Codex 将 app mention 作为 `$app-slug` 插入 composer，让你可以立刻要求 Codex 使用它。

### 使用 `/plugins` 浏览 plugins

1. 输入 `/plugins`。
2. 选择 marketplace tab，然后选择一个 plugin，检查其 capabilities 或 available actions。

预期：Codex 打开 plugin browser，让你查看 installed plugins、你的配置允许的 discoverable plugins，以及 installed plugin state。在 installed plugin 上按 <kbd>Space</kbd> 可切换其 enabled state。

### 使用 `/hooks` 查看和管理 lifecycle hooks

1. 输入 `/hooks`。
2. 选择一个 hook event，检查匹配的 handlers。
3. 按需 trust、disable 或 re-enable non-managed hooks。

预期：Codex 打开 hook browser，让你查看 configured lifecycle hooks。Managed hooks 会显示为 managed，不能从 user hook browser 禁用。

### 使用 `/agent` 切换 agent threads

1. 输入 `/agent` 并按 Enter。
2. 从 picker 中选择你想要的 thread。

预期：Codex 切换 active thread，让你可以检查或继续该 agent 的工作。

### 使用 `/feedback` 发送 feedback

1. 输入 `/feedback` 并按 Enter。
2. 按 prompts 包含 logs 或 diagnostics。

预期：Codex 收集请求的 diagnostics，并提交给 maintainers。

### 使用 `/logout` 退出登录

1. 输入 `/logout` 并按 Enter。

预期：Codex 清除当前 user session 的 local credentials。

### 使用 `/quit` 或 `/exit` 退出 CLI

1. 输入 `/quit`（或 `/exit`）并按 Enter。

预期：Codex 立即退出。请先保存或 commit 任何重要工作。
