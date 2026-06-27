---
title: "Codex CLI features"
description: "Overview of functionality in the Codex terminal client"
outline: deep
---

# Codex CLI features

**文档集**：Codex  
**分组**：Codex — Cli  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/cli/features](https://developers.openai.com/codex/cli/features)
- Markdown 来源：[https://developers.openai.com/codex/cli/features.md](https://developers.openai.com/codex/cli/features.md)
- 抓取时间：2026-06-27T05:54:53.610Z
- Checksum：`650215f1085f8361cfb95ad619c6ac9ad683e334b9e6048b3f1fe0b80f2f4734`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex 支持 chat 之外的工作流。使用本指南了解每个功能可以解锁什么，以及何时使用。

## 以交互模式运行

Codex 会启动一个全屏终端 UI，它可以读取你的仓库、进行编辑，并在你们一起迭代时运行命令。当你想要一种对话式工作流，并能实时审查 Codex 的操作时，请使用它。

```bash
codex
```

你也可以在命令行上指定初始提示词。

```bash
codex "Explain this codebase to me"
```

session 打开后，你可以：

- 直接把提示词、代码片段或截图（参见[图像输入](/mirror/codex/cli/features#image-inputs)）发送到 composer。
- 在 Codex 进行更改前查看它解释计划，并在线批准或拒绝步骤。
- 在 TUI 中阅读带语法高亮的 markdown 代码块和 diff，然后使用 `/theme` 预览并保存喜欢的主题。
- 使用 `/clear` 清空终端并开始新的聊天，或按 &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;L&lt;/kbd&gt; 清屏而不开始新对话。
- 使用 `/copy` 或按 &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;O&lt;/kbd&gt; 复制最近完成的 Codex 输出。如果某个 turn 仍在运行，Codex 会复制最近已完成的输出，而不是进行中的文本。
- 在 Codex 运行时按 &lt;kbd&gt;Tab&lt;/kbd&gt;，为下一个 turn 排队后续文本、slash commands 或 `!` shell commands。
- 使用 &lt;kbd&gt;Up&lt;/kbd&gt;/&lt;kbd&gt;Down&lt;/kbd&gt; 在 composer 中浏览草稿历史；Codex 会恢复之前的草稿文本和图像占位符。
- 在 composer 中按 &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;R&lt;/kbd&gt; 搜索提示词历史，然后按 &lt;kbd&gt;Enter&lt;/kbd&gt; 接受匹配项，或按 &lt;kbd&gt;Esc&lt;/kbd&gt; 取消。
- 完成后，按 &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;C&lt;/kbd&gt; 或使用 `/exit` 关闭交互式 session。

## 恢复对话

Codex 会在本地存储你的 transcript，这样你可以从离开的地方继续，而不必重复上下文。当你想以相同仓库状态和指令重新打开较早的 thread 时，请使用 `resume` 子命令。

- `codex resume` 会启动最近交互式 session 的选择器。高亮某次运行可查看其摘要，按 &lt;kbd&gt;Enter&lt;/kbd&gt; 重新打开。
- `codex resume --all` 会显示当前工作目录之外的 session，因此你可以重新打开任何本地运行。
- `codex resume --last` 会跳过选择器，直接跳到当前工作目录中最近的 session（添加 `--all` 可忽略当前工作目录过滤器）。
- `codex resume &lt;SESSION_ID&gt;` 会定位到特定运行。你可以从选择器、`/status` 或 `~/.codex/sessions/` 下的文件复制该 ID。

非交互式自动化运行也可以恢复：

```bash
codex exec resume --last "Fix the race conditions you found"
codex exec resume 7f9f9a2e-1b3c-4c7a-9b0e-.... "Implement the plan"
```

每次恢复的运行都会保留原始 transcript、计划历史和 approvals，因此 Codex 可以使用之前的上下文，而你只需提供新的指令。如果你需要在恢复前调整环境，可以使用 `--cd` 覆盖工作目录，或使用 `--add-dir` 添加额外根目录。

## 将 TUI 连接到远程 app server

Remote TUI 模式让你可以在一台机器上运行 Codex app server，并从另一台机器使用 Codex terminal UI。使用 WebSocket listener 启动 app server：

```bash
codex app-server --listen ws://127.0.0.1:4500
```

然后把 TUI 连接到该 endpoint：

```bash
codex --remote ws://127.0.0.1:4500
```

若要从另一台机器访问，请把 app server 绑定到可访问的接口，并在远程使用前配置 WebSocket auth：

```bash
TOKEN_FILE="$HOME/.codex/app-server-token"
openssl rand -base64 32 > "$TOKEN_FILE"
chmod 600 "$TOKEN_FILE"
codex app-server --listen ws://0.0.0.0:4500 --ws-auth capability-token --ws-token-file "$TOKEN_FILE"
```

`--remote` 接受显式的 `ws://host:port`、`wss://host:port`、`unix://` 和 `unix://PATH` 地址。使用 `unix://` 连接 Codex 默认的本地 Unix socket，或使用 `unix://PATH` 指定显式本地 socket 路径。明文 WebSocket 连接适用于 localhost 和 SSH port-forwarding 工作流。对于非本地客户端，请使用 WebSocket auth，并把连接置于 TLS 后面。

Codex 支持以下 WebSocket authentication modes：

- Capability token：使用 `--ws-auth capability-token` 启动服务器，并提供 `--ws-token-file /absolute/path` 或 `--ws-token-sha256 HEX`。
- Signed bearer token：使用 `--ws-auth signed-bearer-token --ws-shared-secret-file /absolute/path` 启动服务器，并可选添加 `--ws-issuer`、`--ws-audience` 和 `--ws-max-clock-skew-seconds`。

TUI 会在 WebSocket handshake 期间以 `Authorization: Bearer &lt;token&gt;` header 发送 remote auth token。Codex 只接受通过 `wss://` URL 或仅本地 `ws://` URL 发送的 remote auth tokens。

```bash
export CODEX_REMOTE_TOKEN="$(cat "$TOKEN_FILE")"
codex --remote wss://remote-host:4500 --remote-auth-token-env CODEX_REMOTE_TOKEN
```

对于 Codex app 中的 SSH remote projects，请使用 [Remote connections](/mirror/codex/remote-connections)。对于托管的 remote-control 客户端，`codex remote-control` 会启动启用 remote-control 支持的 app-server 进程。

## 模型和推理

对于 Codex 中的大多数任务，`gpt-5.5` 是推荐模型。它是 OpenAI 最新的 frontier model，适用于复杂编码、computer use、知识工作和研究工作流，在规划、工具使用和多步骤任务跟进方面更强。对于特别快速的任务，ChatGPT Pro 订阅者可以访问处于 research preview 的 GPT-5.3-Codex-Spark 模型。

使用 `/model` 命令在 session 中途切换模型，或在启动 CLI 时指定模型。

```bash
codex --model gpt-5.5
```


[了解 Codex 中可用模型的更多信息](/mirror/codex/models)。

## Feature flags

Codex 包含一小组 feature flags。使用 `features` 子命令检查可用项，并把改动持久保存到你的配置中。

```bash
codex features list
codex features enable unified_exec
codex features disable shell_snapshot
```

`codex features enable &lt;feature&gt;` 和 `codex features disable &lt;feature&gt;` 会写入 `$CODEX_HOME/config.toml`。`features` 子命令不接受 `--profile`。

## Subagents

使用 Codex subagent 工作流并行处理较大的任务。有关设置、角色配置（`config.toml` 中的 `[agents]`）和示例，请参阅 [Subagents](/mirror/codex/subagents)。

Codex 只会在你明确要求时生成 subagents。由于每个 subagent 都会执行自己的模型和工具工作，subagent 工作流会比相当的单 agent 运行消耗更多 token。

## 图像输入

附加截图或设计规格，让 Codex 可以在读取你的提示词时一并读取图像细节。你可以把图片粘贴到交互式 composer 中，或在命令行提供文件。

```bash
codex -i screenshot.png "Explain this error"
```

```bash
codex --image img1.png,img2.jpg "Summarize these diagrams"
```

Codex 接受 PNG 和 JPEG 等常见格式。对于两张或更多图片，请使用逗号分隔的文件名，并把它们与文本指令结合起来以添加上下文。

## 图像生成

让 Codex 直接在 CLI 中生成或编辑图像。这很适合图标、横幅、插图、sprite sheets 和占位图等素材。如果你希望 Codex 变换或扩展现有素材，请在提示词中附加参考图。

你可以使用自然语言提出请求，也可以在提示词中包含 `$imagegen`，显式调用 image generation skill。

内置图像生成使用 `gpt-image-2`，会计入你的常规 Codex 使用限制，并且平均比不使用图像生成的类似 turn 更快使用 included limits 3-5 倍，具体取决于图像质量和尺寸。详情参见 [Pricing](/mirror/codex/pricing#image-generation-usage-limits)。有关提示词技巧和模型详情，请参阅 [image generation guide](/mirror/api/docs/guides/image-generation)。

对于更大批量的图像生成，请在环境变量中设置 `OPENAI_API_KEY`，并让 Codex 通过 API 生成图像，这样会应用 API pricing。

## 语法高亮和主题

TUI 会对 fenced markdown code blocks 和文件 diff 进行语法高亮，让代码在审查和调试期间更容易浏览。

使用 `/theme` 打开主题选择器、实时预览主题，并把你的选择保存到 `~/.codex/config.toml` 中的 `tui.theme`。你也可以把自定义 `.tmTheme` 文件添加到 `$CODEX_HOME/themes` 下，并在选择器中选择它们。

## 运行本地代码审查

在 CLI 中输入 `/review` 打开 Codex 的 review presets。CLI 会启动一个专用 reviewer，读取你选择的 diff，并报告有优先级、可操作的发现，而不会触碰你的 working tree。默认情况下它使用当前 session 模型；可以在 `config.toml` 中设置 `review_model` 来覆盖。

- **Review against a base branch** 让你选择一个本地分支；Codex 会找到它相对于 upstream 的 merge base，对你的工作生成 diff，并在你打开 pull request 前突出最大的风险。
- **Review uncommitted changes** 会检查所有 staged、not staged 或 untracked 的改动，以便你在提交前处理问题。
- **Review a commit** 会列出最近提交，并让 Codex 读取你选择的 SHA 对应的精确变更集。
- **Custom review instructions** 接受你自己的措辞（例如 "Focus on accessibility regressions"），并用该提示词运行同一个 reviewer。

每次运行都会作为自己的 turn 出现在 transcript 中，因此你可以随着代码演进重新运行 review，并比较反馈。

## Web search

Codex 内置第一方 web search 工具。对于 Codex CLI 中的本地任务，Codex 默认启用 web search，并从 web search cache 提供结果。该 cache 是 OpenAI 维护的网页结果索引，因此缓存模式会返回预索引结果，而不是获取实时页面。这减少了来自任意实时内容的 prompt injection 暴露，但你仍应把网页结果视为不受信任。如果你使用 `--yolo` 或其他 [full access sandbox setting](/mirror/codex/agent-approvals-security)，web search 默认使用实时结果。若要获取最新数据，请为单次运行传入 `--search`，或在 [Config basics](/mirror/codex/config-basic) 中设置 `web_search = "live"`。你也可以设置 `web_search = "disabled"` 来关闭该工具。

每当 Codex 查找内容时，你会在 transcript 或 `codex exec --json` 输出中看到 `web_search` items。

## 使用输入提示词运行

当你只需要快速回答时，可以用单个提示词运行 Codex，跳过交互式 UI。

```bash
codex "explain this codebase"
```

Codex 会读取工作目录、制定计划，并在退出前把响应流式输出回你的终端。你可以把它与 `--path` 等 flag 结合使用，以定位特定目录，或用 `--model` 提前调整行为。

## Shell completions

安装为你的 shell 生成的 completion scripts，加速日常使用：

```bash
codex completion bash
codex completion zsh
codex completion fish
```

在 shell 配置文件中运行 completion script，为新 session 设置 completions。例如，如果你使用 `zsh`，可以把下面内容添加到 `~/.zshrc` 文件末尾：

```bash
# ~/.zshrc
eval "$(codex completion zsh)"
```

启动一个新 session，输入 `codex`，然后按 &lt;kbd&gt;Tab&lt;/kbd&gt; 查看 completions。如果你看到 `command not found: compdef` 错误，请在 `~/.zshrc` 文件中把 `autoload -Uz compinit && compinit` 添加到 `eval "$(codex completion zsh)"` 行之前，然后重启 shell。

## Approval modes

Approval modes 定义 Codex 可以在不停止等待确认的情况下做多少事。使用交互式 session 中的 `/permissions`，可以随着舒适程度变化切换模式。

- **Auto**（默认）允许 Codex 在工作目录内读取文件、编辑并运行命令。它在触碰该范围之外的内容或使用网络之前仍会询问。
- **Read-only** 让 Codex 保持咨询模式。它可以浏览文件，但在你批准计划之前不会进行更改或运行命令。
- **Full Access** 授予 Codex 在你的机器上工作的能力，包括网络访问，并且不再询问。请谨慎使用，并且只在你信任该仓库和任务时使用。

Codex 始终会展示其操作的 transcript，因此你可以用惯常的 git workflow 审查或回滚改动。

## 脚本化 Codex

使用 `exec` 子命令自动化工作流，或把 Codex 接入你现有的脚本。这会以非交互方式运行 Codex，把最终计划和结果通过管道返回到 `stdout`。

```bash
codex exec "fix the CI failure"
```

把 `exec` 与 shell scripting 结合起来，可以构建自定义工作流，例如在 PR 发出前自动更新 changelog、整理 issues，或执行编辑检查。

## 使用 Codex cloud

`codex cloud` 命令让你可以在不离开终端的情况下分流和启动 [Codex cloud tasks](/mirror/codex/cloud)。不带参数运行它会打开交互式选择器，浏览活跃或已完成的任务，并把改动应用到你的本地项目。

你也可以直接从终端启动任务：

```bash
codex cloud exec --env ENV_ID "Summarize open bugs"
```

当你希望 Codex cloud 生成多个方案时，添加 `--attempts`（1-4）请求 best-of-N runs。例如，`codex cloud exec --env ENV_ID --attempts 3 "Summarize open bugs"`。

Environment IDs 来自你的 Codex cloud 配置；使用 `codex cloud` 并按 &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;O&lt;/kbd&gt; 选择环境，或通过 web dashboard 确认精确值。认证遵循你现有的 CLI 登录；如果提交失败，该命令会以非零状态退出，便于接入脚本或 CI。

## Slash commands

Slash commands 让你快速访问 `/review`、`/fork`、`/side` 或你自己的可复用提示词等专门工作流。Codex 自带一组精选 built-ins，你也可以为团队特定任务或个人快捷方式创建自定义命令。

参阅 [slash commands guide](https://developers.openai.com/codex/guides/slash-commands)，浏览 built-ins 目录，学习如何编写自定义命令，并了解它们在磁盘上的位置。

## 提示词编辑器

当你起草较长提示词时，切换到完整编辑器再把结果发送回 composer 可能更容易。

在提示词输入框中，按 &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;G&lt;/kbd&gt; 打开由 `VISUAL` 环境变量定义的编辑器（如果未设置 `VISUAL`，则使用 `EDITOR`）。

## Model Context Protocol (MCP)

通过配置 Model Context Protocol servers，将 Codex 连接到更多工具。在 `~/.codex/config.toml` 中添加 STDIO 或 streaming HTTP servers，或用 `codex mcp` CLI commands 管理它们；Codex 会在 session 启动时自动启动这些服务器，并把它们的工具与内置工具一起暴露。你甚至可以在需要把 Codex 放入另一个 agent 时，把 Codex 本身作为 MCP server 运行。

参阅 [Model Context Protocol](/mirror/codex/mcp)，获取示例配置、支持的 auth flows，以及更详细的指南。

## 提示和快捷键

- 在 composer 中输入 `@`，打开对 workspace root 的 fuzzy file search；按 &lt;kbd&gt;Tab&lt;/kbd&gt; 或 &lt;kbd&gt;Enter&lt;/kbd&gt; 把高亮路径放入你的消息。
- 当 Codex 正在运行时按 &lt;kbd&gt;Enter&lt;/kbd&gt;，可向当前 turn 注入新指令；按 &lt;kbd&gt;Tab&lt;/kbd&gt; 则为下一个 turn 排队后续输入。排队输入可以是普通提示词、`/review` 这样的 slash command，或 `!` shell command。Codex 会在运行时解析排队的 slash commands。
- 用 `!` 作为行前缀运行本地 shell command（例如 `!ls`）。Codex 会把输出当作用户提供的命令结果，并且仍会应用你的 approval 和 sandbox 设置。
- 当 composer 为空时，连续按两次 &lt;kbd&gt;Esc&lt;/kbd&gt; 可编辑上一条用户消息。继续按 &lt;kbd&gt;Esc&lt;/kbd&gt; 可在 transcript 中进一步向前移动，然后按 &lt;kbd&gt;Enter&lt;/kbd&gt; 从该位置 fork。
- 使用 `codex --cd &lt;path&gt;` 从任何目录启动 Codex，设置 working root，而无需先运行 `cd`。活动路径会显示在 TUI header 中。
- 当你需要跨多个项目协调改动时，使用 `--add-dir` 暴露更多可写根目录（例如 `codex --cd apps/frontend --add-dir ../backend --add-dir ../shared`）。
- 在启动 Codex 之前，请确保你的环境已经设置好，这样它就不会花费 token 探测要激活什么。例如，提前 source 你的 Python virtual environment（或其他语言环境）、启动所需守护进程，并导出你希望使用的环境变量。

:::

## English source

::: details 展开英文原文
::: v-pre
Codex supports workflows beyond chat. Use this guide to learn what each one unlocks and when to use it.

## Running in interactive mode

Codex launches into a full-screen terminal UI that can read your repository, make edits, and run commands as you iterate together. Use it whenever you want a conversational workflow where you can review Codex's actions in real time.

```bash
codex
```

You can also specify an initial prompt on the command line.

```bash
codex "Explain this codebase to me"
```

Once the session is open, you can:

- Send prompts, code snippets, or screenshots (see [image inputs](/mirror/codex/cli/features#image-inputs)) directly into the composer.
- Watch Codex explain its plan before making a change, and approve or reject steps inline.
- Read syntax-highlighted markdown code blocks and diffs in the TUI, then use `/theme` to preview and save a preferred theme.
- Use `/clear` to wipe the terminal and start a fresh chat, or press &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;L&lt;/kbd&gt; to clear the screen without starting a new conversation.
- Use `/copy` or press &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;O&lt;/kbd&gt; to copy the latest completed Codex output. If a turn is still running, Codex copies the most recent finished output instead of in-progress text.
- Press &lt;kbd&gt;Tab&lt;/kbd&gt; while Codex is running to queue follow-up text, slash commands, or `!` shell commands for the next turn.
- Navigate draft history in the composer with &lt;kbd&gt;Up&lt;/kbd&gt;/&lt;kbd&gt;Down&lt;/kbd&gt;; Codex restores prior draft text and image placeholders.
- Press &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;R&lt;/kbd&gt; to search prompt history from the composer, then press &lt;kbd&gt;Enter&lt;/kbd&gt; to accept a match or &lt;kbd&gt;Esc&lt;/kbd&gt; to cancel.
- Press &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;C&lt;/kbd&gt; or use `/exit` to close the interactive session when you're done.

## Resuming conversations

Codex stores your transcripts locally so you can pick up where you left off instead of repeating context. Use the `resume` subcommand when you want to reopen an earlier thread with the same repository state and instructions.

- `codex resume` launches a picker of recent interactive sessions. Highlight a run to see its summary and press &lt;kbd&gt;Enter&lt;/kbd&gt; to reopen it.
- `codex resume --all` shows sessions beyond the current working directory, so you can reopen any local run.
- `codex resume --last` skips the picker and jumps straight to your most recent session from the current working directory (add `--all` to ignore the current working directory filter).
- `codex resume &lt;SESSION_ID&gt;` targets a specific run. You can copy the ID from the picker, `/status`, or the files under `~/.codex/sessions/`.

Non-interactive automation runs can resume too:

```bash
codex exec resume --last "Fix the race conditions you found"
codex exec resume 7f9f9a2e-1b3c-4c7a-9b0e-.... "Implement the plan"
```

Each resumed run keeps the original transcript, plan history, and approvals, so Codex can use prior context while you supply new instructions. Override the working directory with `--cd` or add extra roots with `--add-dir` if you need to steer the environment before resuming.

## Connect the TUI to a remote app server

Remote TUI mode lets you run the Codex app server on one machine and use the
Codex terminal UI from another machine. Start the app server with a WebSocket
listener:

```bash
codex app-server --listen ws://127.0.0.1:4500
```

Then connect the TUI to that endpoint:

```bash
codex --remote ws://127.0.0.1:4500
```

For access from another machine, bind the app server to a reachable interface
and configure WebSocket auth before remote use:

```bash
TOKEN_FILE="$HOME/.codex/app-server-token"
openssl rand -base64 32 > "$TOKEN_FILE"
chmod 600 "$TOKEN_FILE"
codex app-server --listen ws://0.0.0.0:4500 --ws-auth capability-token --ws-token-file "$TOKEN_FILE"
```

`--remote` accepts explicit `ws://host:port`, `wss://host:port`, `unix://`, and
`unix://PATH` addresses. Use `unix://` for Codex's default local Unix socket or
`unix://PATH` for an explicit local socket path. Plain WebSocket connections are
appropriate for localhost and SSH port-forwarding workflows. For non-local
clients, use WebSocket auth and put the connection behind TLS.

Codex supports these WebSocket authentication modes:

- Capability token: start the server with `--ws-auth capability-token` and
  either `--ws-token-file /absolute/path` or `--ws-token-sha256 HEX`.
- Signed bearer token: start the server with
  `--ws-auth signed-bearer-token --ws-shared-secret-file /absolute/path`, plus
  optional `--ws-issuer`, `--ws-audience`, and `--ws-max-clock-skew-seconds`.

The TUI sends the remote auth token as an `Authorization: Bearer &lt;token&gt;` header
during the WebSocket handshake. Codex only accepts remote auth tokens over
`wss://` URLs or local-only `ws://` URLs.

```bash
export CODEX_REMOTE_TOKEN="$(cat "$TOKEN_FILE")"
codex --remote wss://remote-host:4500 --remote-auth-token-env CODEX_REMOTE_TOKEN
```

For SSH remote projects in the Codex app, use
[Remote connections](/mirror/codex/remote-connections). For managed remote-control
clients, `codex remote-control` starts an app-server process with
remote-control support enabled.

## Models and reasoning

For most tasks in Codex, `gpt-5.5` is the recommended model. It's OpenAI's newest frontier model for complex coding, computer
use, knowledge work, and research workflows, with stronger planning, tool use,
and follow-through on multi-step tasks. For extra fast tasks, ChatGPT Pro subscribers have
access to the GPT-5.3-Codex-Spark model in research preview.

Switch models mid-session with the `/model` command, or specify one when launching the CLI.

```bash
codex --model gpt-5.5
```


[Learn more about the models available in Codex](/mirror/codex/models).

## Feature flags

Codex includes a small set of feature flags. Use the `features` subcommand to inspect what's available and to persist changes in your configuration.

```bash
codex features list
codex features enable unified_exec
codex features disable shell_snapshot
```

`codex features enable &lt;feature&gt;` and `codex features disable &lt;feature&gt;` write
to `$CODEX_HOME/config.toml`. The `features` subcommand doesn't accept
`--profile`.

## Subagents

Use Codex subagent workflows to parallelize larger tasks. For setup, role configuration (`[agents]` in `config.toml`), and examples, see [Subagents](/mirror/codex/subagents).

Codex only spawns subagents when you explicitly ask it to. Because each
subagent does its own model and tool work, subagent workflows consume more
tokens than comparable single-agent runs.

## Image inputs

Attach screenshots or design specs so Codex can read image details alongside your prompt. You can paste images into the interactive composer or provide files on the command line.

```bash
codex -i screenshot.png "Explain this error"
```

```bash
codex --image img1.png,img2.jpg "Summarize these diagrams"
```

Codex accepts common formats such as PNG and JPEG. Use comma-separated filenames for two or more images, and combine them with text instructions to add context.

## Image generation

Ask Codex to generate or edit images directly in the CLI. This works well for assets such as icons, banners, illustrations, sprite sheets, and placeholder art. If you want Codex to transform or extend an existing asset, attach a reference image with your prompt.

You can ask in natural language or explicitly invoke the image generation skill by including `$imagegen` in your prompt.

Built-in image generation uses `gpt-image-2`, counts toward your general Codex usage limits, and uses included limits 3-5x faster on average than similar turns without image generation, depending on image quality and size. For details, see [Pricing](/mirror/codex/pricing#image-generation-usage-limits). For prompting tips and model details, see the [image generation guide](/mirror/api/docs/guides/image-generation).

For larger batches of image generation, set `OPENAI_API_KEY` in your environment variables and ask Codex to generate images through the API so API pricing applies instead.

## Syntax highlighting and themes

The TUI syntax-highlights fenced markdown code blocks and file diffs so code is easier to scan during reviews and debugging.

Use `/theme` to open the theme picker, preview themes live, and save your selection to `tui.theme` in `~/.codex/config.toml`. You can also add custom `.tmTheme` files under `$CODEX_HOME/themes` and select them in the picker.

## Running local code review

Type `/review` in the CLI to open Codex's review presets. The CLI launches a dedicated reviewer that reads the diff you select and reports prioritized, actionable findings without touching your working tree. By default it uses the current session model; set `review_model` in `config.toml` to override.

- **Review against a base branch** lets you pick a local branch; Codex finds the merge base against its upstream, diffs your work, and highlights the biggest risks before you open a pull request.
- **Review uncommitted changes** inspects everything that's staged, not staged, or not tracked so you can address issues before committing.
- **Review a commit** lists recent commits and has Codex read the exact change set for the SHA you choose.
- **Custom review instructions** accepts your own wording (for example, "Focus on accessibility regressions") and runs the same reviewer with that prompt.

Each run shows up as its own turn in the transcript, so you can rerun reviews as the code evolves and compare the feedback.

## Web search

Codex ships with a first-party web search tool. For local tasks in the Codex CLI, Codex enables web search by default and serves results from a web search cache. The cache is an OpenAI-maintained index of web results, so cached mode returns pre-indexed results instead of fetching live pages. This reduces exposure to prompt injection from arbitrary live content, but you should still treat web results as untrusted. If you are using `--yolo` or another [full access sandbox setting](/mirror/codex/agent-approvals-security), web search defaults to live results. To fetch the most recent data, pass `--search` for a single run or set `web_search = "live"` in [Config basics](/mirror/codex/config-basic). You can also set `web_search = "disabled"` to turn the tool off.

You'll see `web_search` items in the transcript or `codex exec --json` output whenever Codex looks something up.

## Running with an input prompt

When you just need a quick answer, run Codex with a single prompt and skip the interactive UI.

```bash
codex "explain this codebase"
```

Codex will read the working directory, craft a plan, and stream the response back to your terminal before exiting. Pair this with flags like `--path` to target a specific directory or `--model` to dial in the behavior up front.

## Shell completions

Speed up everyday usage by installing the generated completion scripts for your shell:

```bash
codex completion bash
codex completion zsh
codex completion fish
```

Run the completion script in your shell configuration file to set up completions for new sessions. For example, if you use `zsh`, you can add the following to the end of your `~/.zshrc` file:

```bash
# ~/.zshrc
eval "$(codex completion zsh)"
```

Start a new session, type `codex`, and press &lt;kbd&gt;Tab&lt;/kbd&gt; to see the completions. If you see a `command not found: compdef` error, add `autoload -Uz compinit && compinit` to your `~/.zshrc` file before the `eval "$(codex completion zsh)"` line, then restart your shell.

## Approval modes

Approval modes define how much Codex can do without stopping for confirmation. Use `/permissions` inside an interactive session to switch modes as your comfort level changes.

- **Auto** (default) lets Codex read files, edit, and run commands within the working directory. It still asks before touching anything outside that scope or using the network.
- **Read-only** keeps Codex in a consultative mode. It can browse files but won't make changes or run commands until you approve a plan.
- **Full Access** grants Codex the ability to work across your machine, including network access, without asking. Use it sparingly and only when you trust the repository and task.

Codex always surfaces a transcript of its actions, so you can review or roll back changes with your usual git workflow.

## Scripting Codex

Automate workflows or wire Codex into your existing scripts with the `exec` subcommand. This runs Codex non-interactively, piping the final plan and results back to `stdout`.

```bash
codex exec "fix the CI failure"
```

Combine `exec` with shell scripting to build custom workflows, such as automatically updating changelogs, sorting issues, or enforcing editorial checks before a PR ships.

## Working with Codex cloud

The `codex cloud` command lets you triage and launch [Codex cloud tasks](/mirror/codex/cloud) without leaving the terminal. Run it with no arguments to open an interactive picker, browse active or finished tasks, and apply the changes to your local project.

You can also start a task directly from the terminal:

```bash
codex cloud exec --env ENV_ID "Summarize open bugs"
```

Add `--attempts` (1–4) to request best-of-N runs when you want Codex cloud to generate more than one solution. For example, `codex cloud exec --env ENV_ID --attempts 3 "Summarize open bugs"`.

Environment IDs come from your Codex cloud configuration—use `codex cloud` and press &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;O&lt;/kbd&gt; to choose an environment or the web dashboard to confirm the exact value. Authentication follows your existing CLI login, and the command exits non-zero if submission fails so you can wire it into scripts or CI.

## Slash commands

Slash commands give you quick access to specialized workflows like `/review`, `/fork`, `/side`, or your own reusable prompts. Codex ships with a curated set of built-ins, and you can create custom ones for team-specific tasks or personal shortcuts.

See the [slash commands guide](https://developers.openai.com/codex/guides/slash-commands) to browse the catalog of built-ins, learn how to author custom commands, and understand where they live on disk.

## Prompt editor

When you're drafting a longer prompt, it can be easier to switch to a full editor and then send the result back to the composer.

In the prompt input, press &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;G&lt;/kbd&gt; to open the editor defined by the `VISUAL` environment variable (or `EDITOR` if `VISUAL` isn't set).

## Model Context Protocol (MCP)

Connect Codex to more tools by configuring Model Context Protocol servers. Add STDIO or streaming HTTP servers in `~/.codex/config.toml`, or manage them with the `codex mcp` CLI commands—Codex launches them automatically when a session starts and exposes their tools next to the built-ins. You can even run Codex itself as an MCP server when you need it inside another agent.

See [Model Context Protocol](/mirror/codex/mcp) for example configurations, supported auth flows, and a more detailed guide.

## Tips and shortcuts

- Type `@` in the composer to open a fuzzy file search over the workspace root; press &lt;kbd&gt;Tab&lt;/kbd&gt; or &lt;kbd&gt;Enter&lt;/kbd&gt; to drop the highlighted path into your message.
- Press &lt;kbd&gt;Enter&lt;/kbd&gt; while Codex is running to inject new instructions into the current turn, or press &lt;kbd&gt;Tab&lt;/kbd&gt; to queue follow-up input for the next turn. Queued input can be a normal prompt, a slash command such as `/review`, or a `!` shell command. Codex parses queued slash commands when they run.
- Prefix a line with `!` to run a local shell command (for example, `!ls`). Codex treats the output like a user-provided command result and still applies your approval and sandbox settings.
- Tap &lt;kbd&gt;Esc&lt;/kbd&gt; twice while the composer is empty to edit your previous user message. Continue pressing &lt;kbd&gt;Esc&lt;/kbd&gt; to walk further back in the transcript, then hit &lt;kbd&gt;Enter&lt;/kbd&gt; to fork from that point.
- Launch Codex from any directory using `codex --cd &lt;path&gt;` to set the working root without running `cd` first. The active path appears in the TUI header.
- Expose more writable roots with `--add-dir` (for example, `codex --cd apps/frontend --add-dir ../backend --add-dir ../shared`) when you need to coordinate changes across more than one project.
- Make sure your environment is already set up before launching Codex so it doesn't spend tokens probing what to activate. For example, source your Python virtual environment (or other language environments), start any required daemons, and export the environment variables you expect to use ahead of time.

:::
:::

