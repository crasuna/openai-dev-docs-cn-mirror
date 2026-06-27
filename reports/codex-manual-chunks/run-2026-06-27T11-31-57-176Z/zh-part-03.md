### Codex CLI 功能

来源：[Codex CLI features](/codex/cli/features.md)

Codex 支持聊天以外的工作流。使用本指南了解每种工作流能解锁什么能力，以及何时使用它。

#### 以交互模式运行

Codex 会启动一个全屏终端 UI，它可以读取你的仓库、进行编辑，并在你们一起迭代时运行命令。每当你需要一种对话式工作流，并希望实时审查 Codex 的操作时，都可以使用它。

```bash
codex
```

你也可以在命令行中指定初始提示。

```bash
codex "Explain this codebase to me"
```

会话打开后，你可以：

- 将提示、代码片段或截图（参见[图片输入](#image-inputs)）直接发送到输入框。
- 在 Codex 进行更改前查看它对计划的说明，并在行内批准或拒绝步骤。
- 在 TUI 中阅读带语法高亮的 Markdown 代码块和 diff，然后使用 `/theme` 预览并保存偏好的主题。
- 使用 `/clear` 清空终端并开始一次新的聊天，或按 Ctrl+L 清屏但不开始新对话。
- 使用 `/copy` 或按 Ctrl+O 复制最新已完成的 Codex 输出。如果某个回合仍在运行，Codex 会复制最近一次已完成的输出，而不是正在生成中的文本。
- 在 Codex 运行时按 Tab，为下一个回合排队后续文本、斜杠命令或 `!` shell 命令。
- 使用 Up/Down 在输入框中浏览草稿历史；Codex 会恢复以前的草稿文本和图片占位符。
- 在输入框中按 Ctrl+R 搜索提示历史，然后按 Enter 接受匹配项，或按 Esc 取消。
- 完成后按 Ctrl+C 或使用 `/exit` 关闭交互式会话。

#### 恢复对话

Codex 会在本地保存你的转录记录，因此你可以从离开的地方继续，而不必重复提供上下文。当你想使用相同的仓库状态和指令重新打开早先的线程时，请使用 `resume` 子命令。

- `codex resume` 会启动一个最近交互式会话的选择器。高亮某次运行可查看其摘要，按 Enter 重新打开。
- `codex resume --all` 会显示当前工作目录之外的会话，因此你可以重新打开任何本地运行。
- `codex resume --last` 会跳过选择器，直接跳到当前工作目录中最近的会话（添加 `--all` 可忽略当前工作目录过滤器）。
- `codex resume <SESSION_ID>` 会定位到特定运行。你可以从选择器、`/status`，或 `~/.codex/sessions/` 下的文件复制 ID。

非交互式自动化运行也可以恢复：

```bash
codex exec resume --last "Fix the race conditions you found"
codex exec resume 7f9f9a2e-1b3c-4c7a-9b0e-.... "Implement the plan"
```

每次恢复的运行都会保留原始转录记录、计划历史和批准记录，因此 Codex 可以使用先前上下文，同时你提供新的指令。如果需要在恢复前调整环境，可以用 `--cd` 覆盖工作目录，或用 `--add-dir` 添加额外根目录。

#### 将 TUI 连接到远程 app server

远程 TUI 模式让你可以在一台机器上运行 Codex app server，并从另一台机器使用 Codex 终端 UI。先用 WebSocket 监听器启动 app server：

```bash
codex app-server --listen ws://127.0.0.1:4500
```

然后将 TUI 连接到该端点：

```bash
codex --remote ws://127.0.0.1:4500
```

如需从另一台机器访问，请将 app server 绑定到可访问的接口，并在远程使用前配置 WebSocket 认证：

```bash
TOKEN_FILE="$HOME/.codex/app-server-token"
openssl rand -base64 32 > "$TOKEN_FILE"
chmod 600 "$TOKEN_FILE"
codex app-server --listen ws://0.0.0.0:4500 --ws-auth capability-token --ws-token-file "$TOKEN_FILE"
```

`--remote` 接受显式的 `ws://host:port`、`wss://host:port`、`unix://` 和 `unix://PATH` 地址。将 `unix://` 用于 Codex 默认的本地 Unix socket，或将 `unix://PATH` 用于显式本地 socket 路径。普通 WebSocket 连接适用于 localhost 和 SSH 端口转发工作流。对于非本地客户端，请使用 WebSocket 认证，并将连接置于 TLS 后面。

Codex 支持以下 WebSocket 认证模式：

- Capability token：用 `--ws-auth capability-token` 启动服务器，并使用 `--ws-token-file /absolute/path` 或 `--ws-token-sha256 HEX`。
- Signed bearer token：用 `--ws-auth signed-bearer-token --ws-shared-secret-file /absolute/path` 启动服务器，并可附加可选的 `--ws-issuer`、`--ws-audience` 和 `--ws-max-clock-skew-seconds`。

TUI 会在 WebSocket 握手期间将远程认证令牌作为 `Authorization: Bearer ` 头发送。Codex 只接受通过 `wss://` URL 或仅限本地的 `ws://` URL 发送的远程认证令牌。

```bash
export CODEX_REMOTE_TOKEN="$(cat "$TOKEN_FILE")"
codex --remote wss://remote-host:4500 --remote-auth-token-env CODEX_REMOTE_TOKEN
```

对于 Codex app 中的 SSH 远程项目，请使用[远程连接](/codex/remote-connections)。对于托管的远程控制客户端，`codex remote-control` 会启动一个启用了远程控制支持的 app-server 进程。

#### 模型与推理

对于 Codex 中的大多数任务，`gpt-5.5` 是推荐模型。它是 OpenAI 最新的前沿模型，适用于复杂编码、computer use、知识工作和研究工作流，具备更强的规划、工具使用能力，以及对多步骤任务的跟进能力。对于特别快速的任务，ChatGPT Pro 订阅者可以使用研究预览版 GPT-5.3-Codex-Spark 模型。

使用 `/model` 命令在会话中途切换模型，或在启动 CLI 时指定模型。

```bash
codex --model gpt-5.5
```

[了解 Codex 中可用模型的更多信息](/codex/models)。

#### 功能标志

Codex 包含一小组功能标志。使用 `features` 子命令检查可用项，并将更改持久保存到你的配置中。

```bash
codex features list
codex features enable unified_exec
codex features disable shell_snapshot
```

`codex features enable ` 和 `codex features disable ` 会写入 `$CODEX_HOME/config.toml`。`features` 子命令不接受 `--profile`。

#### Subagents

使用 Codex subagent 工作流并行处理更大的任务。关于设置、角色配置（`config.toml` 中的 `[agents]`）和示例，请参见 [Subagents](/codex/subagents)。

Codex 只会在你明确要求时生成 subagent。因为每个 subagent 都会自行执行模型和工具工作，所以与类似的单 agent 运行相比，subagent 工作流会消耗更多 token。

#### 图片输入

附加截图或设计规范，让 Codex 可以在读取你的提示时一并读取图片细节。你可以将图片粘贴到交互式输入框中，也可以在命令行上提供文件。

```bash
codex -i screenshot.png "Explain this error"
```

```bash
codex --image img1.png,img2.jpg "Summarize these diagrams"
```

Codex 接受 PNG 和 JPEG 等常见格式。对于两张或更多图片，请使用逗号分隔的文件名，并将它们与文本指令结合以添加上下文。

#### 图片生成

让 Codex 直接在 CLI 中生成或编辑图片。这非常适合图标、横幅、插图、sprite sheets 和占位图等素材。如果你想让 Codex 转换或扩展现有素材，请在提示中附加参考图片。

你可以用自然语言提出请求，也可以在提示中包含 `$imagegen` 来显式调用图片生成技能。

内置图片生成使用 `gpt-image-2`，计入你的通用 Codex 使用限制，并且平均比没有图片生成的类似回合更快地使用内含限制 3-5 倍，具体取决于图片质量和大小。详情请参见[定价](/codex/pricing#image-generation-usage-limits)。有关提示技巧和模型详情，请参见[图片生成指南](/api/docs/guides/image-generation)。

对于更大批量的图片生成，请在环境变量中设置 `OPENAI_API_KEY`，并要求 Codex 通过 API 生成图片，这样会按 API 定价计费。

#### 语法高亮和主题

TUI 会对 fenced Markdown 代码块和文件 diff 进行语法高亮，使代码在审查和调试时更易扫描。

使用 `/theme` 打开主题选择器、实时预览主题，并将你的选择保存到 `~/.codex/config.toml` 中的 `tui.theme`。你也可以在 `$CODEX_HOME/themes` 下添加自定义 `.tmTheme` 文件，并在选择器中选择它们。

#### 运行本地代码审查

在 CLI 中输入 `/review` 打开 Codex 的审查预设。CLI 会启动一个专用审查器，它会读取你选择的 diff，并报告按优先级排序、可操作的发现，而不会触碰你的工作树。默认情况下，它使用当前会话模型；可在 `config.toml` 中设置 `review_model` 进行覆盖。

- **Review against a base branch** 让你选择一个本地分支；Codex 会找到它相对于上游的 merge base，对你的工作进行 diff，并在你打开 pull request 前突出显示最大风险。
- **Review uncommitted changes** 会检查所有已暂存、未暂存或未跟踪的内容，以便你在提交前处理问题。
- **Review a commit** 会列出最近的提交，并让 Codex 读取你选择的 SHA 的确切变更集。
- **Custom review instructions** 接受你自己的措辞（例如，“Focus on accessibility regressions”），并用该提示运行同一个审查器。

每次运行都会作为独立回合显示在转录记录中，因此你可以随着代码演进重新运行审查，并比较反馈。

#### Web search

Codex 内置第一方 web search 工具。对于 Codex CLI 中的本地任务，Codex 默认启用 web search，并从 web search 缓存提供结果。该缓存是 OpenAI 维护的网页结果索引，因此缓存模式会返回预索引结果，而不是抓取实时页面。这降低了来自任意实时内容的提示注入暴露面，但你仍应将网页结果视为不受信任。如果你使用 `--yolo` 或其他[完全访问沙箱设置](/codex/agent-approvals-security)，web search 默认会使用实时结果。要获取最新数据，可为单次运行传入 `--search`，或在[配置基础](/codex/config-basic)中设置 `web_search = "live"`。你也可以设置 `web_search = "disabled"` 来关闭该工具。

每当 Codex 查找内容时，你会在转录记录或 `codex exec --json` 输出中看到 `web_search` 项。

#### 使用输入提示运行

当你只需要一个快速回答时，可以用单条提示运行 Codex，并跳过交互式 UI。

```bash
codex "explain this codebase"
```

Codex 会读取工作目录、制定计划，并在退出前将响应流式输出回你的终端。可将它与 `--path` 等标志搭配使用，以定位特定目录，或用 `--model` 预先调整行为。

#### Shell 补全

安装为你的 shell 生成的补全脚本，以加速日常使用：

```bash
codex completion bash
codex completion zsh
codex completion fish
```

在你的 shell 配置文件中运行补全脚本，为新会话设置补全。例如，如果你使用 `zsh`，可以将以下内容添加到 `~/.zshrc` 文件末尾：

```bash
# ~/.zshrc
eval "$(codex completion zsh)"
```

启动一个新会话，输入 `codex`，然后按 Tab 查看补全。如果你看到 `command not found: compdef` 错误，请在 `eval "$(codex completion zsh)"` 行之前，将 `autoload -Uz compinit && compinit` 添加到 `~/.zshrc` 文件，然后重启 shell。

#### 批准模式

批准模式定义了 Codex 在不暂停请求确认的情况下能做多少事。随着你的舒适程度变化，可以在交互式会话中使用 `/permissions` 切换模式。

- **Auto**（默认）允许 Codex 在工作目录内读取文件、编辑并运行命令。对于触碰该范围之外的任何内容或使用网络，它仍会先询问。
- **Read-only** 让 Codex 保持咨询模式。它可以浏览文件，但在你批准计划之前不会进行更改或运行命令。
- **Full Access** 授予 Codex 跨你的机器工作的能力，包括无需询问即可访问网络。请谨慎使用，并且只在你信任该仓库和任务时使用。

Codex 始终会公开其操作的转录记录，因此你可以用常规 git 工作流审查或回滚更改。

#### 编写 Codex 脚本

使用 `exec` 子命令自动化工作流，或将 Codex 接入你现有的脚本。这会以非交互方式运行 Codex，并将最终计划和结果通过管道输出到 `stdout`。

```bash
codex exec "fix the CI failure"
```

将 `exec` 与 shell 脚本结合，可构建自定义工作流，例如在 PR 发布前自动更新 changelog、整理 issue，或执行编辑检查。

#### 使用 Codex cloud

`codex cloud` 命令让你无需离开终端即可分流和启动 [Codex cloud 任务](/codex/cloud)。不带参数运行它会打开交互式选择器，浏览进行中或已完成的任务，并将更改应用到你的本地项目。

你也可以直接从终端启动任务：

```bash
codex cloud exec --env ENV_ID "Summarize open bugs"
```

当你希望 Codex cloud 生成多个解决方案时，可添加 `--attempts`（1-4）请求 best-of-N 运行。例如，`codex cloud exec --env ENV_ID --attempts 3 "Summarize open bugs"`。

环境 ID 来自你的 Codex cloud 配置；使用 `codex cloud` 并按 Ctrl+O 选择环境，或通过网页控制台确认确切值。认证会遵循你现有的 CLI 登录，提交失败时命令会以非零状态退出，因此你可以将它接入脚本或 CI。

#### 斜杠命令

斜杠命令让你快速访问 `/review`、`/fork`、`/side` 等专用工作流，或访问你自己的可复用提示。Codex 随附一组精选内置命令，你也可以为团队特定任务或个人快捷方式创建自定义命令。

请参见[斜杠命令指南](/codex/guides/slash-commands)，浏览内置命令目录、了解如何编写自定义命令，以及理解它们在磁盘上的位置。

#### 提示编辑器

当你正在起草较长的提示时，切换到完整编辑器，然后将结果发送回输入框，可能更方便。

在提示输入框中，按 Ctrl+G 打开由 `VISUAL` 环境变量定义的编辑器（如果未设置 `VISUAL`，则使用 `EDITOR`）。

#### Model Context Protocol (MCP)

通过配置 Model Context Protocol 服务器，将 Codex 连接到更多工具。在 `~/.codex/config.toml` 中添加 STDIO 或 streaming HTTP 服务器，或用 `codex mcp` CLI 命令管理它们；Codex 会在会话启动时自动启动它们，并在内置工具旁公开它们的工具。当你需要在另一个 agent 内使用 Codex 时，甚至可以将 Codex 本身作为 MCP server 运行。

请参见 [Model Context Protocol](/codex/mcp)，了解示例配置、支持的认证流程和更详细的指南。

### Codex IDE extension 命令

来源：[Codex IDE extension commands](/codex/ide/commands.md)

使用这些命令从 VS Code Command Palette 控制 Codex。你也可以将它们绑定到键盘快捷键。

#### 分配按键绑定

要为 Codex 命令分配或更改按键绑定：

1. 打开 Command Palette（macOS 上为 **Cmd+Shift+P**，Windows/Linux 上为 **Ctrl+Shift+P**）。
2. 运行 **Preferences: Open Keyboard Shortcuts**。
3. 搜索 `Codex` 或命令 ID（例如 `chatgpt.newChat`）。
4. 选择铅笔图标，然后输入你想要的快捷键。

#### Extension commands

| Command                   | Default key binding | Description                                               |
| ------------------------- | ------------------- | --------------------------------------------------------- |
| `chatgpt.addToThread`     | -                   | 将选中的文本范围作为当前 thread 的上下文添加              |
| `chatgpt.addFileToThread` | -                   | 将整个文件作为当前 thread 的上下文添加                    |
| `chatgpt.newChat`         | macOS: `Cmd+N`      |
| Windows/Linux: `Ctrl+N`   | 创建一个新 thread   |
| `chatgpt.implementTodo`   | -                   | 要求 Codex 处理所选 TODO 注释                             |
| `chatgpt.newCodexPanel`   | -                   | 创建一个新的 Codex panel                                  |
| `chatgpt.openSidebar`     | -                   | 打开 Codex sidebar panel                                  |

### Codex IDE extension 功能

来源：[Codex IDE extension features](/codex/ide/features.md)

Codex IDE extension 让你可以在 VS Code、Cursor、Windsurf 和其他兼容 VS Code 的编辑器中直接使用 Codex。它使用与 Codex CLI 相同的 agent，并共享相同配置。

#### 提示 Codex

在编辑器中使用 Codex，可以无缝地聊天、编辑和预览更改。当 Codex 拥有来自打开文件和所选代码的上下文时，你可以编写更短的提示，并获得更快、更相关的结果。

你可以在提示中像这样标记任何编辑器中的文件来引用它：

```text
Use @example.tsx as a reference to add a new page named "Resources" to the app that contains a list of resources defined in @resources.ts
```

#### 在模型之间切换

你可以使用聊天输入框下方的切换器切换模型。

#### 调整推理强度

你可以调整推理强度，以控制 Codex 在响应前思考多久。更高的强度可帮助处理复杂任务，但响应会花费更长时间。更高强度也会使用更多 token，并可能更快消耗你的速率限制，尤其是在使用能力更强的模型时。

使用上面显示的同一个模型切换器，并为每个模型选择 `low`、`medium` 或 `high`。从 `medium` 开始，只在需要更深入分析时切换到 `high`。

#### 选择批准模式

默认情况下，Codex 在 `Agent` 模式下运行。在该模式下，Codex 可以自动读取文件、进行编辑，并在工作目录中运行命令。Codex 在工作目录之外工作或访问网络时仍需要你的批准。

当你只想聊天，或想在更改前先规划时，请使用聊天输入框下方的切换器切换到 `Chat`。

如果你需要 Codex 无需批准即可读取文件、进行编辑，并运行带网络访问的命令，请使用 `Agent (Full Access)`。在这样做之前请谨慎。

#### Cloud delegation

你可以将较大的作业卸载到云端的 Codex，然后在不离开 IDE 的情况下跟踪进度并审查结果。

1. 为 Codex 设置一个 [cloud environment](https://chatgpt.com/codex/settings/environments)。
2. 选择你的环境，然后选择 **Run in the cloud**。

你可以让 Codex 从 `main` 运行（适合开始新想法），或从你的本地更改运行（适合完成任务）。

当你从本地对话启动 cloud task 时，Codex 会记住对话上下文，以便从你离开的地方继续。

#### Cloud task 后续处理

Codex extension 让预览云端更改变得简单。你可以要求后续操作在云端运行，但通常你会希望将更改应用到本地，以测试并完成任务。当你在本地继续对话时，Codex 也会保留上下文，从而节省时间。

你也可以在 [Codex cloud interface](https://chatgpt.com/codex) 中查看 cloud tasks。

#### Web search

Codex 内置第一方 web search 工具。对于 Codex IDE Extension 中的本地任务，Codex 默认启用 web search，并从 web search 缓存提供结果。该缓存是 OpenAI 维护的网页结果索引，因此缓存模式会返回预索引结果，而不是抓取实时页面。这降低了来自任意实时内容的提示注入暴露面，但你仍应将网页结果视为不受信任。如果你将沙箱配置为[完全访问](/codex/agent-approvals-security)，web search 默认会使用实时结果。请参见[配置基础](/codex/config-basic)，了解如何禁用 web search 或切换到会抓取最新数据的实时结果。

每当 Codex 查找内容时，你会在转录记录或 `codex exec --json` 输出中看到 `web_search` 项。

#### 将图片拖放到提示中

你可以将图片拖放到提示输入框中，将它们作为上下文包含进来。

拖放图片时按住 `Shift`。否则 VS Code 会阻止扩展接受拖放。

#### 图片生成

让 Codex 无需离开编辑器即可生成或编辑图片。这适用于 UI 素材、布局、插图、sprite sheets，以及你工作时的快速占位图。当你希望 Codex 转换或扩展现有素材时，请向提示添加参考图片。

你可以用自然语言提出请求，也可以在提示中包含 `$imagegen` 来显式调用图片生成技能。

内置图片生成使用 `gpt-image-2`，计入你的通用 Codex 使用限制，并且平均比没有图片生成的类似回合更快地使用内含限制 3-5 倍，具体取决于图片质量和大小。详情请参见[定价](/codex/pricing#image-generation-usage-limits)。有关提示技巧和模型详情，请参见[图片生成指南](/api/docs/guides/image-generation)。

对于更大批量的图片生成，请在环境变量中设置 `OPENAI_API_KEY`，并要求 Codex 通过 API 生成图片，这样会按 API 定价计费。

#### IDE 功能参考

- [Codex IDE extension settings](/codex/ide/settings)

### Codex IDE extension 设置

来源：[Codex IDE extension settings](/codex/ide/settings.md)

使用这些设置自定义 Codex IDE extension。

#### 更改设置

要更改设置，请按以下步骤操作：

1. 打开你的编辑器设置。
2. 搜索 `Codex` 或设置名称。
3. 更新该值。

Codex IDE extension 使用 Codex CLI。请在共享的 `~/.codex/config.toml` 文件中配置某些行为，例如默认模型、批准和沙箱设置，而不是在编辑器设置中配置。请参见[配置基础](/codex/config-basic)。

该扩展也会为 Codex 对话界面遵循 VS Code 的内置聊天字体设置。

#### 设置参考

| Setting                                      | Description                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chat.fontSize`                              | 控制 Codex sidebar 中的聊天文本，包括对话内容和输入框。                                                                                                                                                                                                                                                              |
| `chat.editor.fontSize`                       | 控制 Codex 对话中以代码形式渲染的内容，包括代码片段和 diff。                                                                                                                                                                                                                                                        |
| `chatgpt.cliExecutable`                      | 仅开发用途：Codex CLI 可执行文件的路径。除非你正在主动开发 Codex CLI，否则不需要设置它。如果手动设置，扩展的部分功能可能无法按预期工作。                                                                                                                                                                            |
| `chatgpt.commentCodeLensEnabled`             | 在 to-do 注释上方显示 CodeLens，以便你可以用 Codex 完成它们。                                                                                                                                                                                                                                                       |
| `chatgpt.localeOverride`                     | Codex UI 的首选语言。留空可自动检测。                                                                                                                                                                                                                                                                                |
| `chatgpt.openOnStartup`                      | 扩展完成启动后聚焦 Codex sidebar。                                                                                                                                                                                                                                                                                   |
| `chatgpt.runCodexInWindowsSubsystemForLinux` | 仅 Windows：当 Windows Subsystem for Linux (WSL) 可用时，在 WSL 中运行 Codex。当你的仓库和工具链位于 WSL2 中，或你需要 Linux 原生工具链时使用此设置。否则，Codex 可以使用 Windows sandbox 在 Windows 上原生运行。更改此设置会重新加载 VS Code 以应用更改。 |

### Codex IDE extension 斜杠命令

来源：[Codex IDE extension slash commands](/codex/ide/slash-commands.md)

斜杠命令让你无需离开聊天输入框即可控制 Codex。使用它们检查状态、在本地和云端模式之间切换，或发送反馈。

#### 使用斜杠命令

1. 在 Codex 聊天输入框中，输入 `/`。
2. 从列表中选择一个命令，或继续输入以过滤（例如 `/status`）。
3. 按 **Enter**。

#### 可用斜杠命令

| Slash command        | Description                                                                            |
| -------------------- | -------------------------------------------------------------------------------------- |
| `/auto-context`      | 打开或关闭 Auto Context，以自动包含最近文件和 IDE 上下文。                             |
| `/cloud`             | 切换到云端模式以远程运行任务（需要 cloud access）。                                    |
| `/cloud-environment` | 选择要使用的 cloud environment（仅在云端模式中可用）。                                 |
| `/feedback`          | 打开反馈对话框以提交反馈，并可选择包含日志。                                           |
| `/goal`              | 设置一个持久目标供 Codex 努力达成。                                                    |
| `/local`             | 切换到本地模式，在你的 workspace 中运行任务。                                          |
| `/review`            | 启动代码审查模式，以审查未提交更改或与 base branch 比较。                              |
| `/status`            | 显示 thread ID、上下文使用量和速率限制。                                                |

如果 `/goal` 没有出现在斜杠命令列表中，请在 `config.toml` 中启用 `features.goals`：

```toml
[features]
goals = true
```

你也可以从 CLI 运行 `codex features enable goals`，或要求 Codex 运行它。

### Computer Use

来源：[Computer Use](/codex/app/computer-use.md)

在支持的地区，Codex app 中的 computer use 可用于 macOS 和 Windows。请安装 Computer Use 插件。在 macOS 上，请在提示时授予 Screen Recording 和 Accessibility 权限。

通过 computer use，Codex 可以查看并操作 macOS 或 Windows 上的图形用户界面。对于命令行工具或结构化集成不足以完成的任务，可以使用它，例如检查桌面 app、使用浏览器、更改 app 设置、处理没有插件可用的数据源，或复现只在图形用户界面中发生的 bug。

由于 computer use 可能影响项目 workspace 之外的 app 和系统状态，请将它用于范围明确的任务，并在继续前审查权限提示。

#### 设置 computer use

在 Codex 设置中，打开 **Computer Use** 并点击 **Install**，先安装 Computer Use 插件，再要求 Codex 操作桌面 app。在 Windows 上，任务运行期间请让目标 app 在活动桌面上保持可见。在 macOS 上，请在提示时授予 Screen Recording 和 Accessibility 权限，以便 Codex 可以查看并交互目标 app。

在 macOS 上，授予：

- **Screen Recording** 权限，使 Codex 可以看到目标 app。
- **Accessibility** 权限，使 Codex 可以点击、输入和导航。

#### 何时使用 computer use

当任务依赖图形用户界面，而仅凭文件或命令输出难以验证时，选择 computer use。

适合的情况包括：

- 测试 Codex 正在构建的 macOS app、Windows app、iOS simulator 流程，或其他桌面 app。
- 执行需要使用你的网页浏览器的任务。
- 复现只出现在图形界面中的 bug。
- 更改需要通过 UI 点击完成的 app 设置。
- 检查无法通过插件获得的 app 或数据源中的信息。
- 在 macOS 上，在你继续处理其他工作时，在后台运行范围明确的任务。
- 执行跨多个 app 的工作流。

对于你正在本地构建的 web app，请先使用 [in-app browser](/codex/app/browser)。

#### Windows 前台使用

在 Windows 上，computer use 在活动桌面上运行。它无法在你继续使用同一个 Windows 会话时于后台操作，因此预计 Codex 会移动指针、输入，并在任务运行时接管前台。

对于你离开时仍应继续的 Windows 任务，请保持 Windows 设备解锁并连接到互联网。使用手机上的[远程控制](/codex/remote-connections)查看进度或发送后续指令，或在 Windows 虚拟机中运行 Codex app，让 computer use 接管虚拟机而不是你的主桌面。

#### 启动 computer use 任务

在提示中提及 `@Computer` 或 `@AppName`，或要求 Codex 使用 computer use。描述 Codex 应操作的确切 app、窗口或流程。

```text
Open the app with computer use, reproduce the onboarding bug, and fix the
smallest code path that causes it. After each change, run the same UI flow
again.
```

```text
Open @Chrome and verify the checkout page still works after the latest changes.
```

如果目标 app 公开了专用插件或 MCP server，请优先使用该结构化集成进行数据访问和可重复操作。当 Codex 需要从视觉上检查或操作 app 时，选择 computer use。

#### 权限与批准

computer use 的系统权限与 Codex 中的 app 批准是分开的。在 macOS 上，Screen Recording 和 Accessibility 权限让 Codex 可以查看并操作 app。App 批准决定你允许 Codex 使用哪些 app。文件读取、文件编辑和 shell 命令仍遵循该线程的沙箱和批准设置。

使用 computer use 时，Codex 只能查看并执行你允许的 app 中的操作。在任务期间，Codex 在使用你电脑上的 app 前会请求你的许可。你可以选择 **Always allow**，让 Codex 以后无需再次询问即可使用该 app。你可以在 Codex 设置的 **Computer Use** 部分从 **Always allow** 列表移除 app。

Codex 在采取敏感或破坏性操作前也可能请求许可。

如果 Codex 无法看到或控制 app，请打开 **System Settings > Privacy & Security**，并在 macOS 上检查 Codex app 的 **Screen Recording** 和 **Accessibility**。在 Windows 上，确保目标 app 在活动桌面会话中可见。

#### 配置 Windows app 策略

在 Windows 上，Computer Use 会将持久 app 决策存储在 `$CODEX_HOME/computer-use/config.toml` 中。列出 Computer Use 可以无需提示打开的 app，以及它必须拒绝的 app：

```toml
[apps]
allowed = ["mspaint.exe"]
denied = ["calc.exe"]
```

使用 Windows Computer Use 报告的 app 标识符，例如桌面 app 的可执行文件名，或打包 app 的 app user model ID。拒绝的 app 优先于允许的 app。未出现在任一列表中的 app 会触发 Codex 提示。

该文件存储本地 Computer Use 决策。它不同于管理员强制执行的 `requirements.toml`，管理员可以在其中使用 `[features].computer_use = false` 禁用 Computer Use。

#### Locked use

Locked use 适用于 macOS。在 Windows 上，computer use 在前台工作。

Locked computer use 允许 Codex 在你的 Mac 锁定后使用 Computer Use，但前提是你已启用它。当 Codex 任务需要在 Mac 锁定后从连接的设备使用桌面 app 时，请使用它。

启用 locked computer use 时，Codex 会安装一个参与 macOS 解锁流程的 Apple [authorization plug-in](https://developer.apple.com/documentation/security/authorization-plug-ins)。

Locked use 的范围刻意保持狭窄。它不是 Mac 的通用远程解锁路径，也不会让其他 app 或本地进程解锁电脑。

要使用 locked computer use：

1. 打开 **Codex settings > Computer Use**。
2. 启用 locked computer use。
3. 从连接的设备启动一个在你的 Mac 屏幕锁定后使用 computer use 的任务。

当 Codex 任务在你的 Mac 锁定后通过 Computer Use 访问 app 时，Codex 会临时解锁 Mac，同时阻止本地使用，并保留锁屏保护。解锁前，Codex 会检查解锁尝试是否属于一个活动且可信的 computer use 回合。在这个短暂窗口之外，Codex 会拒绝解锁，并在需要时要求你手动解锁。

Locked use 包含防护措施：

- 授权窗口短暂，并且限定于当前解锁尝试。
- 自动解锁只对活动 computer use 回合期间的 Codex 可用。
- 当桌面被临时解锁时，Codex 会覆盖每个显示器。
- 如果 Codex 检测到本地键盘或指针输入，它会重新锁定 Mac，并暂停自动解锁，直到你手动解锁。

#### 安全指南

使用 computer use 时，Codex 可以在目标 app 中查看屏幕内容、截取屏幕截图，并与窗口、菜单、键盘输入和剪贴板状态交互。将可见 app 内容、浏览器页面、截图和在目标 app 中打开的文件视为 Codex 在任务运行期间可能处理的上下文。

保持任务狭窄，并在敏感流程中保持在场：

- 一次只给 Codex 一个清晰的目标 app 或流程。
- 你可以随时停止任务或接管电脑。
- 除非任务需要，否则关闭敏感 app。
- 在 Windows 上，预计 Codex 工作时会接管前台输入；请使用辅助设备、虚拟机，或在自己使用该桌面前停止任务。
- 避免需要 secret 的任务，除非你在场并可以批准每一步。
- 在允许 Codex 使用 app 前审查 app 权限提示。
- 只对你信任 Codex 在未来任务中自动使用的 app 使用 **Always allow**。
- 对账号、安全、隐私、网络、支付或凭据相关设置保持在场。
- 如果 Codex 开始与错误窗口交互，请取消任务。

如果 Codex 使用你的浏览器，它可以与已登录的网站页面交互。像审查你自己执行的操作一样审查网站操作：网页可能包含恶意或误导性内容，网站可能会将已批准的点击、表单提交和登录状态下的操作视为来自你的账号。若要在 Codex 工作时继续使用浏览器，请要求 Codex 使用不同的浏览器。

该功能不能自动化终端 app 或 Codex 本身，因为自动化它们可能绕过 Codex 安全策略。它也不能以管理员身份认证，或批准你电脑上的安全与隐私权限提示。

文件编辑和 shell 命令在适用时仍遵循 Codex 批准和沙箱设置。通过桌面 app 进行的更改在保存到磁盘并由项目跟踪前，可能不会显示在审查窗格中。你的 ChatGPT 数据控制适用于通过 Codex 处理的内容，包括 computer use 拍摄的截图。

### In-app browser

来源：[In-app browser](/codex/app/browser.md)

In-app browser 为你和 Codex 提供线程内渲染网页的共享视图。当你正在构建或调试 web app，并希望预览页面和附加视觉评论时，请使用它。

它适用于本地开发服务器、基于文件的预览，以及不需要登录的公共页面。对于依赖登录状态或浏览器扩展的任何内容，请使用你的常规浏览器或 [Codex Chrome extension](/codex/app/chrome-extension)。

可通过工具栏打开 in-app browser，点击 URL 打开，手动在浏览器中导航，或按 Cmd+Shift+B（Windows 上为 Ctrl+Shift+B）。

In-app browser 不支持认证流程、已登录页面、你的常规浏览器配置文件、cookie、扩展或现有标签页。请将它用于 Codex 无需登录即可打开的页面。

将页面内容视为不受信任的上下文。不要将 secret 粘贴到浏览器流程中。

#### Browser use

Browser use 让 Codex 直接操作 in-app browser。当 Codex 需要点击、输入、检查渲染状态、截图、下载页面资产、运行只读页面检查 JavaScript，或在页面中验证修复时，可将它用于本地开发服务器和基于文件的预览。

要使用它，请安装并启用 Browser 插件。然后在任务中要求 Codex 使用浏览器，或用 `@Browser` 直接引用它。该 app 会将 browser use 限制在 in-app browser 内，并允许你从设置中管理允许和阻止的网站。

示例：

```text
Use the browser to open http://localhost:3000/settings, reproduce the layout
bug, and fix only the overflowing controls.
```

除非你已经允许某个网站，否则 Codex 会在使用网站前询问。从允许列表中移除网站意味着 Codex 使用前会再次询问；从阻止列表中移除网站意味着 Codex 可以再次询问，而不是将其视为已阻止。

对于 Chrome 中的已登录网站，请参见 [Codex Chrome extension](/codex/app/chrome-extension)。

#### 预览页面

1. 在[集成终端](/codex/app/features#integrated-terminal)中启动你的 app 开发服务器，或使用[本地环境操作](/codex/app/local-environments#actions)启动。
2. 通过点击 URL 或在浏览器中手动导航，打开一个未认证的本地路由、基于文件的页面或公共页面。
3. 在代码 diff 旁审查渲染状态。
4. 在需要更改的元素或区域上留下浏览器评论。
5. 要求 Codex 处理评论，并保持范围狭窄。

反馈示例：

```text
I left comments on the pricing page in the in-app browser. Address the mobile
layout issues and keep the card structure unchanged.
```

#### 在页面上评论

当 bug 只在渲染页面中可见时，使用浏览器评论给 Codex 提供页面上的精确反馈。

- 打开 Annotation mode，选择元素或区域，然后提交评论。
- 在 Annotation mode 中，按住 Shift 并点击以选择一个区域。
- 点击时按住 Cmd 可立即发送评论。

留下评论后，请在线程中发送消息，要求 Codex 处理它们。当 Codex 需要进行精确的视觉更改时，评论最有用。

好的反馈应当具体：

```text
This button overflows on mobile. Keep the label on one line if it fits,
otherwise wrap it without changing the card height.
```

```text
This tooltip covers the data point under the cursor. Reposition the tooltip so
it stays inside the chart bounds.
```

#### 样式反馈

当你在页面某一 section 上添加注释时，按文本输入框旁的 config 图标，可以给 Codex 更细粒度的样式反馈。你可以更改字体、文本、间距和颜色等值，直接在页面上预览结果，然后发送注释，让 Codex 获得更清晰的更改目标。

#### 保持浏览器任务范围明确

In-app browser 用于审查和迭代。让每个浏览器任务小到可以一次性审查。

- 命名页面、路由或本地 URL。
- 命名你关心的视觉状态，例如 loading、empty、error 或 success。
- 在需要更改的确切元素或区域上留下评论。
- 在 Codex 更改代码后审查更新后的路由。
- 要求 Codex 在使用浏览器前启动或检查 dev server。

对于仓库更改，请使用[审查窗格](/codex/app/review)检查更改并留下评论。

#### Developer mode

Developer mode 与 Chrome 中的 Browser use 和 Codex in-app browser 配合使用。它让 Codex 受控访问 Chrome DevTools Protocol (CDP)。当你希望 Codex 分析 JavaScript 性能、检查 console 输出和网络流量、查看 DOM 和已应用样式等页面状态，或直接在实时浏览器中诊断问题时，请使用它。

要启用它，请打开 [**Settings > Browser**](codex://settings/browser-use)，并在 **Developer mode** 下打开 **Enable full CDP access**。如果你的组织禁用了该设置，你无法在本地启用它。管理员可以在 [`requirements.toml`](/codex/enterprise/managed-configuration#pin-feature-flags) 中的 `[features]` 下设置 `browser_use_full_cdp_access = false`。

Full CDP access 允许 Codex 检查和控制敏感浏览器内部机制，这可能使你的数据面临风险。Codex 在使用 full CDP 检查网站前会请求明确批准。批准前请审查网站、任务和请求的访问权限。

对于 in-app browser，请使用 `@Browser`。若要在 Chrome 中使用 Developer mode，请[设置 Codex Chrome extension](/codex/app/chrome-extension) 并调用 `@Chrome`。

例如：

```text
This app is slow. Use @Browser to capture a performance trace and inspect
network traffic, then identify the bottleneck.
```

### Local environments

来源：[Local environments](/codex/app/local-environments.md)

Local environments 让你可以为 worktree 配置设置步骤，以及为项目配置常用操作。

你可以通过 [Codex app settings](codex://settings) 窗格配置本地环境。你可以将生成的文件提交到项目的 Git 仓库中，与其他人共享。

Codex 将该配置存储在项目根目录的 `.codex` 文件夹中。如果你的仓库包含多个项目，请打开包含共享 `.codex` 文件夹的项目目录。

#### 设置脚本

由于 worktree 在不同于本地任务的目录中运行，你的项目可能尚未完全设置，并且可能缺少依赖项或未检入仓库的文件。Codex 在新线程开始时创建新 worktree 时，会自动运行设置脚本。

使用该脚本运行配置环境所需的任何命令，例如安装依赖项或运行构建过程。

例如，对于 TypeScript 项目，你可能希望使用设置脚本安装依赖项并执行初始构建：

```bash
npm install
npm run build
```

如果你的设置与平台相关，请为 macOS、Windows 或 Linux 定义设置脚本，以覆盖默认值。

#### 操作

使用 actions 定义常用任务，例如启动 app 的开发服务器或运行测试套件。这些操作会出现在 Codex app 顶栏中，方便快速访问。actions 会在 app 的[集成终端](/codex/app/features#integrated-terminal)内运行。

Actions 有助于避免反复输入常用操作，例如触发项目构建或启动开发服务器。对于一次性的快速调试，可以直接使用集成终端。

例如，对于 Node.js 项目，你可以创建一个名为 "Run" 的 action，其中包含以下脚本：

```bash
npm start
```

如果你的 action 命令与平台相关，请为 macOS、Windows 和 Linux 定义平台特定脚本。

为识别你的 actions，请为每个 action 选择一个相关图标。

### Review

来源：[Review](/codex/app/review.md)

审查窗格帮助你了解 Codex 更改了什么、给出有针对性的反馈，并决定保留哪些内容。

它只适用于位于 Git 仓库内的项目。如果你的项目还不是 Git 仓库，审查窗格会提示你创建一个。

#### 它显示哪些更改

审查窗格反映的是你的 Git 仓库状态，而不只是 Codex 编辑过的内容。这意味着它会显示：

- Codex 所做的更改
- 你自己所做的更改
- 仓库中的任何其他未提交更改

默认情况下，审查窗格聚焦于**未提交更改**。你也可以将范围切换为：

- **All branch changes**（相对于 base branch 的 diff）
- **Last turn changes**（仅最近一个 assistant 回合）

在本地工作时，你也可以在 **Unstaged** 和 **Staged** 更改之间切换。

#### 导航审查窗格

- 点击文件名通常会在你选择的编辑器中打开该文件。你可以在[设置](/codex/app/settings)中选择默认编辑器。
- 点击文件名背景会展开或折叠 diff。
- 按住 Cmd 点击单行，会在你选择的编辑器中打开该行。
- 如果你对某项更改满意，可以[暂存更改或还原更改](#staging-and-reverting-files)中你不喜欢的内容。

#### 用于反馈的行内评论

行内评论让你可以将反馈直接附加到 diff 中的具体行。这通常是引导 Codex 找到正确修复的最快方式。

要留下行内评论：

1. 打开审查窗格。
2. 将鼠标悬停在你想评论的行上。
3. 点击出现的 **+** 按钮。
4. 写下你的反馈并提交。
5. 完成反馈后，向线程发送一条消息。

由于评论与行绑定，Codex 可以比面对一般性指令时更精确地响应。

Codex 会将行内评论视为审查指导。留下评论后，请发送一条后续消息明确你的意图，例如 “Address the inline comments and keep the scope minimal.”

#### 代码审查结果

如果你使用 `/review` 运行代码审查，评论会直接以内联方式显示在审查窗格中。

#### Pull request 审查

当 Codex 对你的仓库拥有 GitHub 访问权限，并且当前项目位于 pull request 分支上时，Codex app 可以帮助你在不离开 app 的情况下处理 pull request 反馈。Sidebar 会显示 pull request 上下文和审查者反馈，审查窗格会在 diff 旁显示评论，这样你可以要求 Codex 在同一个线程中处理问题。

安装 GitHub CLI (`gh`) 并使用 `gh auth login` 认证它，以便 Codex 可以加载 pull request 上下文、审查评论和已更改文件。如果缺少 `gh` 或未认证，pull request 详情可能不会出现在 sidebar 或审查窗格中。

当你希望将完整修复循环保持在一个地方时，请使用这个流程：

1. 在 pull request 分支上打开审查窗格。
2. 审查 pull request 上下文、评论和已更改文件。
3. 要求 Codex 修复你想处理的具体评论。
4. 在审查窗格中检查生成的 diff。
5. 准备好后，暂存、提交并将更改推送到 PR 分支。

对于由 GitHub 触发的审查，请参见[在 GitHub 中使用 Codex](/codex/integrations/github)。

#### 暂存和还原文件

审查窗格包含 Git 操作，因此你可以在提交前调整 diff。

你可以在这些层级暂存、取消暂存或还原更改：

- **Entire diff**：使用审查 header 中的操作按钮（例如 "Stage all" 或 "Revert all"）
- **Per file**：暂存、取消暂存或还原单个文件
- **Per hunk**：暂存、取消暂存或还原单个 hunk

当你想接受部分工作时使用暂存；当你想丢弃更改时使用还原。

#### 已暂存和未暂存状态

Git 可以在同一个文件中同时表示已暂存和未暂存更改。当这种情况发生时，窗格可能看起来像是在已暂存和未暂存视图中显示“同一个文件两次”。这是正常的 Git 行为。

### Codex CLI 中的斜杠命令

来源：[Slash commands in Codex CLI](/codex/cli/slash-commands.md)

斜杠命令为你提供快速、键盘优先的 Codex 控制方式。在输入框中输入 `/` 打开斜杠弹窗，选择一个命令，Codex 就会执行操作，例如切换模型、调整权限，或摘要长对话，而无需离开终端。

本指南说明如何：

- 为任务找到合适的内置斜杠命令
- 使用 `/model`、`/fast`、`/personality`、`/permissions`、`/approve`、`/raw`、`/agent` 和 `/status` 等命令引导活动会话

#### 内置斜杠命令

Codex 随附以下命令。打开斜杠弹窗并开始输入命令名以过滤列表。

当任务已经在运行时，你可以输入斜杠命令并按 `Tab`，将它排队到下一个回合。Codex 会在排队的斜杠命令运行时解析它们，因此命令菜单和错误会在当前回合结束后出现。排队命令前，斜杠补全仍然可用。

| Command                                                                         | Purpose                                                         | When to use it                                                                                             |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`/permissions`](#update-permissions-with-permissions)                          | 设置 Codex 可以先不询问就执行的操作。                          | 在会话中途放宽或收紧批准要求，例如在 Auto 和 Read Only 之间切换。                                         |
| [`/ide`](#include-ide-context-with-ide)                                         | 包含打开的文件、当前选择和其他 IDE 上下文。                     | 将编辑器上下文拉入下一条提示，而无需重新说明 IDE 中打开了什么。                                           |
| [`/keymap`](#remap-tui-shortcuts-with-keymap)                                   | 重新映射 TUI 键盘快捷键。                                      | 检查并将自定义快捷键绑定持久保存到 `config.toml`。                                                        |
| [`/vim`](#toggle-vim-mode-with-vim)                                             | 为输入框切换 Vim mode。                                        | 在 Vim normal/insert 行为与默认输入框编辑模式之间切换。                                                   |
| [`/sandbox-add-read-dir`](#grant-sandbox-read-access-with-sandbox-add-read-dir) | 授予沙箱对额外目录的读取访问权限（仅 Windows）。               | 解除需要读取当前可读根目录之外绝对目录路径的命令限制。                                                    |
| [`/agent`](#switch-agent-threads-with-agent)                                    | 切换活动 agent thread。                                        | 检查或继续某个已生成 subagent thread 中的工作。                                                           |
| [`/apps`](#browse-apps-with-apps)                                               | 浏览 apps（connectors）并将它们插入你的提示。                  | 在要求 Codex 使用 app 前，将 app 作为 `$app-slug` 附加。                                                  |
| [`/plugins`](#browse-plugins-with-plugins)                                      | 浏览已安装和可发现的插件。                                    | 检查插件工具、安装建议插件，或管理插件可用性。                                                           |
| [`/hooks`](#view-and-manage-lifecycle-hooks-with-hooks)                         | 查看并管理 lifecycle hooks。                                   | 检查已配置的 hooks、信任新的或已更改的 hooks，或在非托管 hooks 运行前禁用它们。                           |
| [`/clear`](#clear-the-terminal-and-start-a-new-chat-with-clear)                 | 清空终端并开始新聊天。                                        | 当你想重新开始时，同时重置可见 UI 和对话。                                                               |
| [`/archive`](#archive-the-current-session-with-archive)                         | 归档当前会话并退出 Codex。                                    | 从活动会话列表中移除当前会话，但不删除其转录记录。                                                       |
| [`/delete`](#delete-the-current-session-with-delete)                            | 永久删除当前会话并退出 Codex。                                | 当归档还不够时，移除转录记录和后代会话。                                                                 |
| [`/compact`](#keep-transcripts-lean-with-compact)                               | 摘要可见对话以释放 token。                                    | 在长时间运行后使用，让 Codex 保留关键点，而不让上下文窗口爆掉。                                          |
| [`/copy`](#copy-the-latest-response-with-copy)                                  | 复制最新的已完成 Codex 输出。                                 | 抓取最新已完成的响应或计划文本，而无需手动选择。你也可以按 `Ctrl+O`。                                    |
| [`/diff`](#review-changes-with-diff)                                            | 显示 Git diff，包括 Git 尚未跟踪的文件。                       | 在提交或运行测试前审查 Codex 的编辑。                                                                    |
| [`/exit`](#exit-the-cli-with-quit-or-exit)                                      | 退出 CLI（与 `/quit` 相同）。                                  | 替代拼写；两个命令都会退出会话。                                                                         |
| [`/experimental`](#toggle-experimental-features-with-experimental)              | 切换实验性功能。                                              | 从 CLI 启用可选功能，例如 subagents。                                                                    |
| [`/approve`](#approve-an-auto-review-denial-with-approve)                       | 批准最近一次 auto review 拒绝的一次重试。                     | 重试被自动审查器拒绝的命令或操作。                                                                       |
| [`/memories`](#configure-memories-with-memories)                                | 配置 memory 使用和生成。                                      | 在不离开 TUI 的情况下打开或关闭 memory injection 或 memory generation。                                   |
| [`/skills`](#use-skills-with-skills)                                            | 浏览并使用 skills。                                           | 通过选择相关本地 skill 改善特定任务行为。                                                               |
| [`/import`](#import-claude-code-configuration-with-import)                      | 导入 Claude Code 设置、项目文件和最近聊天。                    | 将受支持的外部 agent 工件迁移到 Codex 配置和本地文件中。                                                 |
| [`/feedback`](#send-feedback-with-feedback)                                     | 向 Codex 维护者发送日志。                                     | 向支持团队报告问题或共享诊断信息。                                                                       |
| [`/init`](#generate-agentsmd-with-init)                                         | 在当前目录生成 `AGENTS.md` 脚手架。                           | 捕获当前仓库或子目录的持久指令。                                                                         |
| [`/logout`](#sign-out-with-logout)                                              | 退出 Codex。                                                  | 在共享机器上使用时清除本地凭据。                                                                         |
| [`/mcp`](#list-mcp-tools-with-mcp)                                              | 列出已配置的 Model Context Protocol (MCP) 工具。              | 检查 Codex 在会话期间可调用哪些外部工具；添加 `verbose` 查看服务器详情。                                 |
| [`/mention`](#highlight-files-with-mention)                                     | 将文件附加到对话。                                           | 指向你希望 Codex 接下来检查的特定文件或文件夹。                                                          |
| [`/model`](#set-the-active-model-with-model)                                    | 选择活动模型（以及可用时的推理强度）。                        | 在运行任务前，在通用模型（`gpt-4.1-mini`）和更深推理模型之间切换。                                      |
| [`/fast`](#toggle-fast-mode-with-fast)                                          | 当模型目录公开 Fast service tier 时切换它。                   | 打开或关闭当前模型的 Fast tier，或检查线程是否正在使用它。                                               |
| [`/plan`](#switch-to-plan-mode-with-plan)                                       | 切换到 plan mode，并可选择发送提示。                          | 要求 Codex 在实现工作开始前提出执行计划。                                                               |
| [`/goal`](#set-or-view-a-task-goal-with-goal)                                   | 设置、暂停、恢复、查看或清除任务目标。                        | 给 Codex 一个持久目标，让它在较大任务运行时跟踪。                                                        |
| [`/personality`](#set-a-communication-style-with-personality)                   | 选择响应的沟通风格。                                         | 让 Codex 更简洁、更具解释性或更协作，而不更改你的指令。                                                  |
| [`/ps`](#check-background-terminals-with-ps)                                    | 显示实验性后台终端及其最近输出。                              | 不离开主转录记录即可检查长时间运行的命令。                                                               |
| [`/stop`](#stop-background-terminals-with-stop)                                 | 停止所有后台终端。                                           | 取消当前会话启动的后台终端工作。                                                                         |
| [`/fork`](#fork-the-current-conversation-with-fork)                             | 将当前对话 fork 到新线程。                                   | 分支当前会话以探索新方法，而不丢失当前转录记录。                                                        |
| [`/side`, `/btw`](#start-a-side-conversation-with-side)                         | 启动临时 side conversation。                                  | 提出一个聚焦的后续问题，而不打断主线程的转录记录。                                                       |
| [`/raw`](#toggle-raw-scrollback-with-raw)                                       | 切换 raw scrollback mode。                                    | 在审查长输出时，让终端选择和复制更少格式化。                                                             |
| [`/resume`](#resume-a-saved-conversation-with-resume)                           | 从你的会话列表恢复已保存对话。                                | 无需重新开始即可从之前的 CLI 会话继续工作。                                                             |
| [`/new`](#start-a-new-conversation-with-new)                                    | 在同一个 CLI 会话内开始新对话。                               | 当你想在同一个 repo 中使用新的提示重新开始时，重置聊天上下文而不离开 CLI。                               |
| [`/quit`](#exit-the-cli-with-quit-or-exit)                                      | 退出 CLI。                                                    | 立即离开会话。                                                                                           |
| [`/review`](#ask-for-a-working-tree-review-with-review)                         | 要求 Codex 审查你的工作树。                                  | 在 Codex 完成工作后运行，或当你想对本地更改再多一双眼睛时运行。                                          |
| [`/status`](#inspect-the-session-with-status)                                   | 显示会话配置和 token 使用量。                                | 确认活动模型、批准策略、可写根目录和剩余上下文容量。                                                     |
| [`/usage`](#view-account-usage-with-usage)                                      | 查看账号 token 使用情况或使用 rate-limit reset。              | 在 TUI 内检查每日、每周或累计 ChatGPT token 活动。                                                       |
| [`/debug-config`](#inspect-config-layers-with-debug-config)                     | 打印配置层和 requirements 诊断。                              | 调试优先级和策略要求，包括实验性网络约束。                                                               |
| [`/statusline`](#configure-footer-items-with-statusline)                        | 交互式配置 TUI status-line 字段。                             | 选择并重新排序 footer 项（model/context/limits/git/tokens/session），并持久保存到 config.toml。           |
| [`/title`](#configure-terminal-title-items-with-title)                          | 交互式配置终端窗口或标签页标题字段。                          | 选择并重新排序 title 项，例如 project、status、thread、branch、model 和 task progress。                   |
| [`/theme`](#choose-a-syntax-theme-with-theme)                                   | 选择语法高亮主题。                                           | 预览并持久保存终端语法高亮主题。                                                                         |

`/quit` 和 `/exit` 都会退出 CLI。请只在你已保存或提交任何重要工作后使用它们。

使用 `/permissions` 调整 Codex 可以先不询问就做哪些事。只有在你需要重试最近被自动审查拒绝的操作时，才使用 `/approve`。

#### 用斜杠命令控制会话

以下工作流可帮助你在不重启 Codex 的情况下保持会话有序。

#### 使用 `/model` 设置活动模型

1. 启动 Codex 并打开输入框。
2. 输入 `/model` 并按 Enter。
3. 从弹窗中选择一个模型，例如 `gpt-4.1-mini` 或 `gpt-4.1`。

预期：Codex 会在转录记录中确认新模型。运行 `/status` 验证更改。

#### 使用 `/fast` 切换 Fast mode

1. 输入 `/fast on`、`/fast off` 或 `/fast status`。
2. 如果你希望该设置持久化，请在 Codex 提议保存时确认更新。

预期：Codex 会报告当前模型的 Fast service tier 在当前线程中是开启还是关闭。在 TUI footer 中，你也可以用 `/statusline` 显示 Fast mode status-line 项。

Fast tier 命令由目录驱动。如果当前模型未声明 Fast tier，Codex 不会显示 `/fast`。

#### 使用 `/personality` 设置沟通风格

使用 `/personality` 改变 Codex 的沟通方式，而无需重写你的提示。

1. 在活动对话中，输入 `/personality` 并按 Enter。
2. 从弹窗中选择一种风格。

预期：Codex 会在转录记录中确认新风格，并在后续线程响应中使用它。

Codex 支持 `friendly`、`pragmatic` 和 `none` personalities。使用 `none` 可禁用 personality 指令。

如果活动模型不支持 personality-specific instructions，Codex 会隐藏该命令。

#### 使用 `/plan` 切换到 plan mode

1. 输入 `/plan` 并按 Enter，将活动对话切换到 plan mode。
2. 可选：提供行内提示文本（例如 `/plan Propose a migration plan for this service`）。
3. 使用行内 `/plan` 参数时，你可以粘贴内容或附加图片。

预期：Codex 进入 plan mode，并将你的可选行内提示用作第一个规划请求。

当任务已经在运行时，`/plan` 会暂时不可用。

#### 使用 `/goal` 设置或查看任务目标

1. 输入 `/goal ` 设置目标，例如 `/goal Finish the migration and keep tests green`。
2. 输入 `/goal` 查看当前目标。
3. 使用 `/goal pause`、`/goal resume` 或 `/goal clear` 暂停、恢复或移除目标。

预期：在工作继续期间，Codex 会将目标附加到活动线程。

目标 objective 必须非空且最多 4,000 个字符。对于更长的指令，请将详情放入文件并将 goal 指向该文件。

#### 使用 `/experimental` 切换实验性功能

1. 输入 `/experimental` 并按 Enter。
2. 切换你想要的功能（例如 Apps 或 Smart Approvals），然后在提示要求时重启 Codex。

预期：Codex 会将你的功能选择保存到配置中，并在重启时应用。

#### 使用 `/approve` 批准 auto review 拒绝

当自动审查器拒绝了最近的操作，而你希望 Codex 重试一次时，请使用 `/approve`。

1. 输入 `/approve`。
2. 当 Codex 显示相关被拒绝操作时，确认重试。

预期：Codex 会在当前会话策略下重试该被拒绝操作一次。

#### 使用 `/memories` 配置 memories

1. 输入 `/memories`。
2. 选择 Codex 是应使用现有 memories、生成新 memories，还是保持 memory 行为禁用。

预期：Codex 会更新相关 memory 设置，以供未来会话使用。

#### 使用 `/skills` 使用 skills

1. 输入 `/skills`。
2. 选择你希望 Codex 应用的 skill。

预期：Codex 会插入所选 skill 上下文，使下一个请求遵循该 skill 的指令。

#### 使用 `/import` 导入 Claude Code 配置

1. 输入 `/import`。
2. 选择你要迁移的 Claude Code 设置、项目文件或最近聊天。

预期：Codex 会打开外部 agent 导入选择器，并将所选的受支持工件导入 Codex 配置和本地文件。

请从本地 TUI 会话运行 `/import`。任务运行期间、远程会话中，以及连接到本地 app-server daemon 时，它不可用。

#### 使用 `/clear` 清空终端并开始新聊天

1. 输入 `/clear` 并按 Enter。

预期：Codex 会清空终端、重置可见转录记录，并在同一个 CLI 会话中开始新聊天。

与 Ctrl+L 不同，`/clear` 会开始一个新对话。

Ctrl+L 只会清除终端视图，并保留当前聊天。当任务正在进行时，Codex 会禁用这两项操作。

### Troubleshooting

来源：[Troubleshooting](/codex/app/troubleshooting.md)

#### 常见问题

#### Codex 没有编辑的文件出现在侧边面板中

如果你的项目位于 Git 仓库内，审查面板会根据项目的 Git 状态自动显示更改，包括 Codex 没有进行的更改。

在审查窗格中，你可以在已暂存更改和未暂存更改之间切换，并将你的分支与 main 比较。

如果你只想查看最近一个 Codex 回合的更改，请将 diff 窗格切换到 "Last turn changes" 视图。

[了解有关如何使用审查窗格的更多信息](/codex/app/review)。

#### 从 sidebar 移除项目

要从 sidebar 移除项目，请将鼠标悬停在项目名称上，点击三个点并选择 "Remove." 要恢复它，请使用 **Threads** 旁边的 **Add new project** 按钮重新添加项目，或使用

Cmd+O。

#### 查找已归档线程

已归档线程可在 [Settings](codex://settings) 中找到。取消归档某个线程后，它会重新出现在 sidebar 的原始位置。

#### Sidebar 中只显示部分线程

Sidebar 允许根据项目状态过滤线程。如果你缺少线程，请点击 **Threads** 标签旁的过滤图标，并切换到 Chronological。如果仍然看不到该线程，请打开 [Settings](codex://settings)，并检查 archived chats 或 archived threads section。

#### 代码无法在 worktree 上运行

Worktree 会在不同目录中创建，并默认继承已检入 Git 的文件。根据你管理项目依赖项和工具链的方式，你可能需要使用[本地环境](/codex/app/local-environments)在 worktree 上运行设置脚本，或使用 [`.worktreeinclude`](/codex/app/worktrees#copy-ignored-local-files-into-managed-worktrees) 复制被忽略的设置文件。或者，你也可以在常规本地项目中检出更改。请参见 [worktrees documentation](/codex/app/worktrees) 了解更多。

#### App 没有获取队友共享的 local environment

Local environment 配置必须位于项目根目录的 `.codex` 文件夹中。如果你在包含多个项目的 monorepo 中工作，请确保打开包含 `.codex` 文件夹的目录中的项目。

#### Codex 要求访问 Apple Music

根据你的任务，Codex 可能需要浏览文件系统。macOS 上的某些目录，包括 Music、Downloads 或 Desktop，需要用户额外批准。如果 Codex 需要读取你的 home directory，macOS 会提示你批准访问这些文件夹。

#### Automations 创建许多 worktree

频繁的 automations 可能会随着时间创建许多 worktree。归档你不再需要的 automation 运行，并避免固定运行，除非你打算保留它们的 worktree。

#### 选择了错误 target 后恢复提示

如果你意外以错误 target（**Local**、**Worktree** 或 **Cloud**）启动了线程，可以取消当前运行，并在输入框中按上箭头键恢复之前的提示。

#### 功能在 Codex CLI 中可用，但在 Codex app 中不可用

Codex app 和 Codex CLI 使用相同的底层 Codex agent 和配置，但它们在任何时候可能依赖不同版本的 agent，且某些实验性功能可能会先进入 Codex CLI。

要获取你系统上的 Codex CLI 版本，请运行：

```bash
codex --version
```

要获取 Codex app 捆绑的 Codex 版本，请运行：

```bash
/Applications/Codex.app/Contents/Resources/codex --version
```

#### 反馈和日志

在消息输入框中输入 /，向团队提供反馈。如果你在现有对话中触发反馈，可以选择将现有会话连同反馈一起共享。提交反馈后，你会收到一个可与团队共享的 session ID。

报告问题：

1. 在 Codex GitHub repo 上查找[现有 issues](https://github.com/openai/codex/issues)。
2. [打开新的 GitHub issue](https://github.com/openai/codex/issues/new?template=2-bug-report.yml&steps=Uploaded%20thread%3A%20019c0d37-d2b6-74c0-918f-0e64af9b6e14)

更多日志可在以下位置找到：

- App logs (macOS)：`~/Library/Logs/com.openai.codex/YYYY/MM/DD`
- Session transcripts：`$CODEX_HOME/sessions`（默认：`~/.codex/sessions`）
- Archived sessions：`$CODEX_HOME/archived_sessions`（默认：`~/.codex/archived_sessions`）

如果你共享日志，请先审查它们，确认不包含敏感信息。

#### 卡住状态和恢复模式

如果某个线程看起来卡住：

1. 检查 Codex 是否正在等待批准。
2. 打开终端并运行一个基本命令，例如 `git status`。
3. 用更小、更聚焦的提示开始一个新线程。

如果你误取消 worktree 创建并丢失提示，请在输入框中按上箭头键恢复它。

#### 终端问题

**Terminal appears stuck**

1. 关闭终端面板。
2. 用 Cmd+J 重新打开它。
3. 重新运行一个基本命令，例如 `pwd` 或 `git status`。

如果命令行为与预期不同，请先在终端中验证当前目录和分支。

如果它持续卡住，请等待你的活动 Codex 线程完成，然后重启 app。

**Fonts aren't rendering correctly**

Codex 在审查窗格、集成终端以及 app 内显示的任何其他代码中使用同一种字体。你可以在 [Settings](codex://settings) 窗格中将字体配置为 **Code font**。

### Windows app

来源：[Windows](/codex/app/windows.md)

[Codex app for Windows](https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi) 为跨项目工作、运行并行 agent 线程和审查结果提供一个界面。Windows app 支持核心工作流，例如 worktrees、automations、Git 功能、in-app browser、artifact previews、plugins 和 skills。它使用 PowerShell 和 [Windows sandbox](/codex/windows#windows-sandbox) 在 Windows 上原生运行，或者你可以配置它在 [Windows Subsystem for Linux 2 (WSL2)](#windows-subsystem-for-linux-wsl) 中运行。

#### 下载 Codex app

下载 Windows 版 [Codex app](https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi)。

然后按照[快速入门](/codex/quickstart?setup=app)开始。

对于企业，管理员可以通过企业管理工具使用 Microsoft Store app distribution 部署该 app。

如果你偏好命令行安装路径，或需要替代打开 Microsoft Store UI 的方式，请运行：

```powershell
winget install Codex -s msstore
```

#### Native sandbox

当 agent 在 PowerShell 中运行时，Windows 上的 Codex app 支持原生 [Windows sandbox](/codex/windows#windows-sandbox)；当你在 [Windows Subsystem for Linux 2 (WSL2)](#windows-subsystem-for-linux-wsl) 中运行 agent 时，它使用 Linux sandboxing。要在任一模式中应用沙箱保护，请在向 Codex 发送消息前，在 Composer 中将 sandbox permissions 设置为 **Default permissions**。

以 full access mode 运行 Codex 意味着 Codex 不受你的项目目录限制，并且可能执行无意的破坏性操作，从而导致数据丢失。请保持沙箱边界，并使用 [rules](/codex/rules) 进行有针对性的例外，或将你的[批准策略设置为
never](/codex/agent-approvals-security#run-without-approval-prompts)，让 Codex 根据你的[批准和安全设置](/codex/agent-approvals-security)尝试在不请求升级权限的情况下解决问题。

#### 为你的开发设置自定义

#### 首选编辑器

为 **Open** 选择默认 app，例如 Visual Studio、VS Code 或其他编辑器。你可以按项目覆盖该选择。如果你已经从某个项目的 **Open** 菜单中选择了不同 app，则该项目特定选择优先。

#### 集成终端

你也可以选择默认集成终端。根据你已安装的内容，选项包括：

- PowerShell
- Command Prompt
- Git Bash
- WSL

此更改只适用于新的终端会话。如果你已经打开了集成终端，请重启 app 或开始一个新线程，再期待新的默认终端出现。

#### Windows Subsystem for Linux (WSL)

默认情况下，Codex app 使用 Windows 原生 agent。这意味着 agent 会在 PowerShell 中运行命令。该 app 仍可以通过在需要时使用 `wsl` CLI，处理位于 Windows Subsystem for Linux 2 (WSL2) 中的项目。

如果你想从 WSL 文件系统添加项目，请点击 **Add new project** 或按 Ctrl+O，然后在 File Explorer 窗口中输入 `\\wsl$\`。从那里选择你的 Linux 发行版和要打开的文件夹。

如果你计划继续使用 Windows 原生 agent，建议将项目存储在 Windows 文件系统上，并通过 `/mnt//...` 从 WSL 访问它们。此设置比直接从 WSL 文件系统打开项目更可靠。

如果你希望 agent 本身在 WSL2 中运行，请打开 **[Settings](codex://settings)**，将 agent 从 Windows native 切换到 WSL，并**重启 app**。在你重启前，更改不会生效。重启后你的项目应保持在原位。

Codex `0.114` 支持 WSL1。从 Codex `0.115` 开始，Linux sandbox 迁移到 `bubblewrap`，因此不再支持 WSL1。

你可以独立于 agent 配置集成终端。终端选项请参见[为你的开发设置自定义](#customize-for-your-dev-setup)。你可以让 agent 保持在 WSL 中，同时仍在终端中使用 PowerShell；也可以根据工作流同时对二者使用 WSL。

#### 有用的开发者工具

Codex 在已安装一些常见开发者工具时效果最佳：

- **Git**：为 Codex app 中的审查面板提供支持，并让你检查或还原更改。
- **Node.js**：agent 用来更高效执行任务的常见工具。
- **Python**：agent 用来更高效执行任务的常见工具。
- **.NET SDK**：当你想构建原生 Windows app 时很有用。
- **GitHub CLI**：为 Codex app 中 GitHub 特定功能提供支持。

使用默认 Windows 包管理器 `winget` 安装它们，方法是将以下内容粘贴到[集成终端](/codex/app/features#integrated-terminal)中，或要求 Codex 安装它们：

```powershell
winget install --id Git.Git
winget install --id OpenJS.NodeJS.LTS
winget install --id Python.Python.3.14
winget install --id Microsoft.DotNet.SDK.10
winget install --id GitHub.cli
```

安装 GitHub CLI 后，运行 `gh auth login` 以在 app 中启用 GitHub 功能。

如果你需要不同的 Python 或 .NET 版本，请将包 ID 更改为你想要的版本。

#### 故障排查和 FAQ

#### 使用提升的权限运行命令

如果你需要 Codex 使用提升的权限运行命令，请以管理员身份启动 Codex app。安装后，打开 Start 菜单，找到 Codex，并选择 Run as administrator。Codex agent 会继承该权限级别。

#### PowerShell 执行策略阻止命令

如果你以前从未在 PowerShell 中使用过 Node.js 或 `npm` 等工具，Codex agent 或集成终端可能会遇到执行策略错误。

如果 Codex 为你创建 PowerShell 脚本，也可能发生这种情况。在这种情况下，你可能需要较宽松的执行策略，PowerShell 才能运行它们。

错误可能类似如下：

```text
npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

一个常见修复是将执行策略设置为 `RemoteSigned`：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```

在更改策略前，请查看 Microsoft 的[执行策略指南](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies)，了解详情和其他选项。

#### Windows 上的 Local environment 脚本

如果你的[本地环境](/codex/app/local-environments)使用 `npm` scripts 等跨平台命令，可以为每个平台保留一个共享设置脚本或一组 actions。

如果需要 Windows 特定行为，请创建 Windows 特定的设置脚本或 Windows 特定的 actions。

Actions 会在你的集成终端所使用的环境中运行。请参见[为你的开发设置自定义](#customize-for-your-dev-setup)。

Local setup scripts 会在 agent 环境中运行：如果 agent 使用 WSL，则为 WSL；否则为 PowerShell。

#### 与 WSL 共享 config、auth 和 sessions

Windows app 使用与 Windows 原生 Codex 相同的 Codex home directory：`%USERPROFILE%\.codex`。

如果你也在 WSL 中运行 Codex CLI，CLI 默认使用 Linux home directory，因此它不会自动与 Windows app 共享配置、缓存认证或会话历史。

要共享它们，请使用以下方法之一：

- 在文件系统上同步 WSL `~/.codex` 与 `%USERPROFILE%\.codex`。
- 通过设置 `CODEX_HOME` 将 WSL 指向 Windows Codex home directory：

```bash
export CODEX_HOME=/mnt/c/Users//.codex
```

如果你希望该设置在每个 shell 中生效，请将它添加到你的 WSL shell profile，例如 `~/.bashrc` 或 `~/.zshrc`。

#### Git 功能不可用

如果你没有在 Windows 原生安装 Git，该 app 无法使用某些功能。请从 PowerShell 或 `cmd.exe` 使用 `winget install Git.Git` 安装它。

#### 从 `\\wsl$` 打开的项目检测不到 Git

目前，如果你想将 Windows 原生 agent 与也可从 WSL 访问的项目一起使用，最可靠的临时解决方法是将项目存储在原生 Windows 驱动器上，并在 WSL 中通过 `/mnt//...` 访问它。

#### `Cmder` 没有列在打开对话框中

如果安装了 `Cmder` 但没有显示在 Codex 的打开对话框中，请将它添加到 Windows Start Menu：右键点击 `Cmder` 并选择 **Add to Start**，然后重启 Codex 或重启电脑。

### Worktrees

来源：[Worktrees](/codex/app/worktrees.md)

在 Codex app 中，worktrees 让 Codex 可以在同一个项目中运行多个独立任务，而不会相互干扰。对于 Git 仓库，[automations](/codex/app/automations) 会在专用后台 worktrees 上运行，因此它们不会与你正在进行的工作冲突。在未进行版本控制的项目中，automations 会直接在项目目录中运行。你也可以手动在 worktree 上启动线程，并使用 Handoff 在线程的 Local 和 Worktree 之间移动它。

#### 什么是 worktree

Worktrees 只适用于属于 Git 仓库的项目，因为它们底层使用 [Git worktrees](https://git-scm.com/docs/git-worktree)。Worktree 允许你创建仓库的第二份副本（“checkout”）。每个 worktree 都有自己的仓库中每个文件副本，但它们共享关于提交、分支等的相同元数据（`.git` 文件夹）。这让你可以并行检出和处理多个分支。

#### 术语

- **Local checkout**：你创建的仓库。有时在 Codex app 中简称为 **Local**。
- **Worktree**：从你在 Codex app 中的本地 checkout 创建的 [Git worktree](https://git-scm.com/docs/git-worktree)。
- **Handoff**：在线程的 Local 和 Worktree 之间移动线程的流程。Codex 会处理在它们之间安全移动工作所需的 Git 操作。

#### 为什么使用 worktree

1. 与 Codex 并行工作，而不打扰当前 Local 设置。
2. 在你专注于前台工作时，排队后台工作。
3. 当你准备好检查、测试或更直接协作时，将线程稍后移入 Local。

#### Worktree 设置

Worktrees 需要 Git 仓库。确保你选择的项目位于一个仓库中。

1.  选择 "Worktree"

    在新线程视图中，在输入框下方选择 **Worktree**。
    可选地，选择一个[本地环境](/codex/app/local-environments)为 worktree 运行设置脚本。

2.  选择起始分支

    在输入框下方，选择 worktree 要基于的 Git 分支。它可以是你的 `main` / `master` 分支、feature branch，或带有未暂存本地更改的当前分支。

3.  提交你的提示

    提交你的任务，Codex 会基于你选择的分支创建一个 Git worktree。默认情况下，Codex 会在 ["detached HEAD"](https://git-scm.com/docs/git-checkout#_detached_head) 中工作。

4.  选择继续工作的地方

    准备好后，你可以直接在 worktree 上继续工作，或将线程 hand off 到本地 checkout。Handing off 到 local 或从 local hand off 都会移动你的线程和代码，让你可以在另一个 checkout 中继续。

#### 在 Local 与 Worktree 之间工作

Worktrees 的外观和使用感受很像你的本地 checkout。差异在于它们在你的流程中的位置。你可以把 Local 理解为前台，把 Worktree 理解为后台。Handoff 让你可以在它们之间移动线程。

在底层，Handoff 会处理在两个 checkout 之间安全移动工作所需的 Git 操作。这一点很重要，因为 **Git 只允许一个分支同时在一个地方被检出**。如果你在 worktree 上检出某个分支，就**不能**同时在你的本地 checkout 中检出它，反之亦然。

实践中有两种常见路径：

1. [只在 worktree 上工作](#option-1-working-on-the-worktree)。当你可以直接在 worktree 上验证更改时，这条路径最合适，例如因为你已使用[本地环境设置脚本](/codex/app/local-environments)安装了依赖项和工具。
2. [将线程 hand off 到 Local](#option-2-handing-a-thread-off-to-local)。当你想把线程带入前台时使用，例如因为你想在常用 IDE 中检查更改，或只能运行一个 app 实例。

#### 选项 1：在 worktree 上工作

如果你想带着更改只停留在 worktree 上，请使用线程 header 中的 **Create branch here** 按钮，将 worktree 转换为分支。

从这里，你可以提交更改、将分支推送到远程仓库，并在 GitHub 上打开 pull request。

你可以使用 header 中的 "Open" 按钮在该 worktree 中打开 IDE，使用集成终端，或执行任何需要在 worktree 目录中完成的操作。

请记住，如果你在 worktree 上创建分支，就不能在任何其他 worktree 中检出它，包括你的本地 checkout。

#### 选项 2：将线程 hand off 到 Local

如果你想把线程带入前台，请点击线程 header 中的 **Hand off**，并将它移动到 **Local**。

当你想在常用 IDE 窗口中读取更改、运行现有开发服务器，或在你日常已使用的同一个环境中验证工作时，这条路径很合适。

Codex 会处理在线程安全地在 worktree 和本地 checkout 之间移动时所需的 Git 步骤。

每个线程会随着时间保留相同的关联 worktree。如果你稍后将线程 hand 回 worktree，Codex 会将它返回到同一个后台环境，以便从离开的地方继续。

你也可以反向操作。如果你已经在 Local 中工作，并想释放前台，可以使用 **Hand off** 将线程移动到 worktree。当你希望 Codex 在后台继续工作，而你把注意力切回本地其他事情时，这很有用。

由于 Handoff 使用 Git 操作，除非 Codex 使用 `.worktreeinclude` 将文件复制到本地托管 worktree，否则属于 `.gitignore` 文件的任何文件都不会随线程移动。

#### 高级细节

#### Codex 托管和永久 worktrees

默认情况下，线程使用 Codex 托管的 worktree。这些 worktree 旨在保持轻量且可丢弃。Codex 托管的 worktree 通常专用于一个线程，如果你之后将该线程 hand 回那里，Codex 会把线程返回到同一个 worktree。

如果你想要长期存在的环境，请从 sidebar 中某个项目的三点菜单创建永久 worktree。这会创建一个新的永久 worktree，作为它自己的项目。永久 worktree 不会被自动删除，你也可以从同一个 worktree 启动多个线程。

#### Codex 如何为你管理 worktrees

Codex 在 `$CODEX_HOME/worktrees` 中创建 worktrees。起始提交会是你启动线程时所选分支的 `HEAD` 提交。如果你选择的分支带有本地更改，未提交更改也会应用到 worktree。该 worktree **不会**作为分支被检出。它会处于 [detached HEAD](https://git-scm.com/docs/git-checkout#_detached_head) 状态。这让 Codex 可以创建多个 worktree，而不污染你的分支。

#### 将被忽略的本地文件复制到托管 worktrees

本地 Codex 托管 worktrees 从 Git checkout 开始，因此 tracked files 已经存在。如果你的仓库忽略了新 worktree 所需的本地设置文件，请在仓库根目录添加 `.worktreeinclude` 文件，并列出在 Codex 创建托管 worktree 时要复制的被忽略路径或 `.gitignore` 样式 pattern。

将它用于 Git 有意忽略的文件，例如 `.env`、`.env.local` 或 `config/secrets.json`。Codex 只会复制匹配 `.worktreeinclude` 的被忽略文件；它不会复制 Git 未跟踪的其他本地文件。不要列出 tracked files。

Codex 会自动将被忽略的 `AGENTS.override.md` 复制到本地托管 worktrees，因此你无需将它列入 `.worktreeinclude`。

```text
# .worktreeinclude
.env
.env.local
config/secrets.json
```

Codex 会跳过源 symlink，并且不会覆盖新 checkout 中已经存在的文件。此行为适用于本地 Codex app 托管 worktrees，不适用于远程 worktrees 或你自己从命令行创建的 Git worktrees。

#### 分支限制

假设 Codex 在某个 worktree 上完成了一些工作，而你选择使用 **Create branch here** 在其上创建 `feature/a` 分支。现在，你想在本地 checkout 上尝试它。如果你尝试检出该分支，会收到以下错误：

```
fatal: 'feature/a' is already used by worktree at '<WORKTREE_PATH>'
```

要解决此问题，你需要在该 worktree 上检出 `feature/a` 以外的另一个分支。

如果你计划在本地检出该分支，请使用 Handoff 将线程移动到 Local，而不是尝试在两个位置同时保持同一个分支被检出。

#### 为什么存在此限制

Git 会阻止同一个分支同时在多个 worktree 中被检出，因为分支表示一个单一的可变引用（`refs/heads/`），其含义是某个工作树的“当前检出状态”。

当某个分支被检出时，Git 会将其 HEAD 视为由该 worktree 拥有，并期望提交、reset、rebase 和 merge 等操作以定义良好、串行化的方式推进该引用。允许多个 worktrees 同时检出同一个分支，会围绕哪个 worktree 的操作更新分支引用产生歧义和竞态条件，可能导致提交丢失、索引不一致或冲突解决不明确。

通过强制执行一个分支对应一个 worktree 的规则，Git 保证每个分支都有单一权威 working copy，同时仍允许其他 worktrees 通过 detached HEAD 或不同分支安全地引用相同提交。

#### Worktree 清理

Worktrees 可能占用大量磁盘空间。每个 worktree 都有自己的一组仓库文件、依赖项、构建缓存等。因此，Codex app 会尝试将 worktree 数量保持在合理限制内。

默认情况下，Codex 会保留最近的 15 个 Codex 托管 worktrees。如果你更喜欢自行管理磁盘使用量，可以在设置中更改此限制或关闭自动删除。

Codex 会尝试避免删除仍然重要的 worktrees。在以下情况下，Codex 托管 worktree 不会被自动删除：

- 有 pinned conversation 与它关联
- 线程仍在进行中
- 该 worktree 是永久 worktree

Codex 托管 worktrees 会在以下情况下自动删除：

- 你归档关联线程
- Codex 需要删除较旧的 worktrees，以保持在你配置的限制内

删除 Codex 托管 worktree 前，Codex 会保存其上的工作快照。如果你在其 worktree 被删除后打开对话，会看到恢复它的选项。

#### 我可以控制 worktree 创建位置吗？

目前不可以。Codex 会在 `$CODEX_HOME/worktrees` 下创建 worktrees，以便一致地管理它们。

#### 我可以在线程的 Local 和 Worktree 之间移动它吗？

可以。使用 thread header 中的 **Hand off** 在线程的本地 checkout 和 worktree 之间移动线程。Codex 会处理在线程安全地在环境之间移动时所需的 Git 操作。如果你之后将线程 hand 回 worktree，Codex 会把它返回到同一个关联 worktree。

#### 如果 worktree 被删除，线程会怎样？

即使底层 worktree 目录被删除，线程也可以保留在你的历史记录中。对于 Codex 托管 worktrees，Codex 会在删除 worktree 前保存快照，并在你重新打开关联线程时提供恢复选项。当你归档永久 worktree 的线程时，永久 worktree 不会被自动删除。

### Appshots

来源：[Appshots](/codex/appshots.md)

Appshots 让你可以将最前面的 app 窗口发送到 Codex 线程。当你正在电脑上的另一个 app 中工作，并希望向 Codex 提供当前上下文，以便它帮助你完成任务时，请使用它们。

Appshots 可在 macOS 上的 Codex app 中使用。按下两个 Command 键，或按下你的自定义 Appshots 热键，即可拍摄一个 appshot。

#### Appshots 捕获什么

Appshot 只捕获最前面的窗口。它可以包括：

- 可见窗口的图片。
- 来自该窗口的可用文本，包括可见文本以及 app 在可见滚动区域之外提供的文本。

将 appshot 添加到线程后，它的行为就像 Codex 附件。Codex 会像保存你手动附加的文件或图片一样，将 appshots 本地存储在 session file 中。

#### 何时使用 appshots

当 Codex 需要 Mac app 的上下文才能行动时，请使用 appshots。

示例：

- 共享 API 参考页面，并要求 Codex 编写使用它的脚本。
- 共享电子邮件或日历视图，并要求 Codex 起草下一步。
- 共享图片编辑器、设计或预览窗口，并要求 Codex 修改相关 assets 或代码。
- 共享错误、设置面板或 app 状态，这些内容展示出来比描述更容易。

#### 拍摄 appshot

1. 在你的 Mac 上打开 Codex app。
2. 打开你想共享的 app 和窗口。
3. 按下两个 Command 键，或按下你在 Codex 设置中配置的自定义热键。
4. 如果 Codex 请求 macOS 权限，请允许。
5. 要求 Codex 使用该 appshot 执行任务。

默认情况下，Codex 会为 appshot 启动一个新线程。如果你在过去 60 秒内与某个 Codex 线程交互过，Codex 会将 appshot 添加到最近的线程。连续拍摄 appshots 会将它们添加到同一个线程。

你可以在 Codex 设置中更改 Appshots 热键。

#### 权限和安全

Codex 在能够拍摄 appshots 前可能会请求权限：

- **Screen & System Audio Recording** 让 Codex 捕获最前面窗口的图片。
- **Accessibility** 让 Codex 从最前面的窗口读取可用文本。

拍摄 appshot 会与 Codex 共享捕获的图片和可用文本。除非任务需要该内容，否则请避免拍摄敏感内容的 appshots。

审查 appshots 的方式，应与审查向 Codex 共享截图和文档的方式相同。

#### 限制和故障排查

Appshots 是 Codex app 功能。请从 macOS 上的 Codex app 创建它们。如果你在 CLI 中恢复一个已经包含 appshot 的线程，该附件是线程历史的一部分，但 CLI 无法创建新的 appshot。

对于某些 app 和网站，包括 Google Docs、Gmail、Google Sheets 和 Google Slides，Codex 可能只接收可见截图，而不会接收完整文档或屏幕外文本。如果你安装了匹配插件，Codex 可以使用该插件访问相关 app 内容，并帮助处理你的请求。

如果 appshots 不工作：

1. 打开 **System Settings > Privacy & Security**。
2. 检查 Codex Computer Use 的 **Screen & System Audio Recording** 和 **Accessibility**。
3. 重启 Codex 并重试。

### Codex app

来源：[Codex app](/codex/app.md)

Codex app 是一个专注的桌面体验，用于并行处理 Codex 线程，内置 worktree 支持、automations 和 Git 功能。

ChatGPT Plus、Pro、Business、Edu 和 Enterprise 计划包含 Codex。了解更多[包含的内容](/codex/pricing)。

#### 开始使用

Codex app 可用于 macOS 和 Windows。

大多数 Codex app 功能在两个平台上都可用。相关文档会描述平台特定的例外。

1. 下载并安装 Codex app

   下载适用于 macOS 或 Windows 的 Codex app。如果你使用基于 Intel 的 Mac，请选择 Intel build。

2. 打开 Codex 并登录

   下载并安装 Codex app 后，打开它，并使用你的 ChatGPT 账号或 OpenAI API key 登录。

   如果你使用 OpenAI API key 登录，[某些功能可能不可用](/codex/pricing#feature-availability)。

3. 选择项目

   选择你希望 Codex 在其中工作的项目文件夹。

如果你以前使用过 Codex app、CLI 或 IDE Extension，会看到你曾处理过的历史项目。

4. 发送第一条消息

   选择项目后，确保已选择 **Local**，让 Codex 在你的机器上工作，然后向 Codex 发送第一条消息。

   你可以向 Codex 询问关于该项目或你的电脑的一般问题。以下是一些示例：

---

#### 使用 Codex app

#### Worktrees

使用内置 Git worktree 支持，隔离并行代码更改。

### Codex CLI

来源：[Codex CLI](/codex/cli.md)

Codex CLI 是 OpenAI 的 coding agent，你可以从终端在本地运行它。它可以在所选目录中读取、更改并运行你机器上的代码。它是[开源](https://github.com/openai/codex)的，并使用 Rust 构建以实现速度和效率。

ChatGPT Plus、Pro、Business、Edu 和 Enterprise 计划包含 Codex。了解更多[包含的内容](/codex/pricing)。

#### CLI 设置

Codex CLI 可用于 macOS、Windows 和 Linux。在 Windows 上，你可以使用 Windows sandbox 在 PowerShell 中原生运行 Codex，或在需要 Linux 原生环境时使用 WSL2。设置详情请参见 Windows setup guide。

---

#### 使用 Codex CLI

#### 运行本地代码审查

在你提交或推送更改前，让一个单独的 Codex agent 审查你的代码。

### Codex IDE extension

来源：[Codex IDE extension](/codex/ide.md)

Codex 是 OpenAI 的 coding agent，可以读取、编辑和运行代码。它帮助你更快构建、修复 bug，并理解陌生代码。通过 Codex VS Code extension，你可以在 IDE 中并排使用 Codex，或将任务委托给 Codex Cloud。

ChatGPT Plus、Pro、Business、Edu 和 Enterprise 计划包含 Codex。了解更多[包含的内容](/codex/pricing)。

#### JetBrains IDE 集成

如果你想在 Rider、IntelliJ、PyCharm 或 WebStorm 等 JetBrains IDE 中使用 Codex，请安装 JetBrains IDE integration。它支持使用 ChatGPT、API key 或 JetBrains AI subscription 登录。

[安装适用于 JetBrains IDEs 的 Codex](https://blog.jetbrains.com/ai/2026/01/codex-in-jetbrains-ides/)

#### 将 Codex 移到右侧 sidebar

在 VS Code 中，Codex 会自动出现在右侧 sidebar。
如果你更喜欢将它放在主（左）sidebar 中，请将 Codex 图标拖回左侧 activity bar。

在 Cursor 等 VS Code forks 中，你可能需要手动将 Codex 移到右侧 sidebar。
为此，你可能需要先临时更改 activity bar orientation：

1. 打开编辑器设置并搜索 `activity bar`（在 Workbench 设置中）。
2. 将 orientation 更改为 `vertical`。
3. 重启编辑器。

现在将 Codex 图标拖到右侧 sidebar（例如，放在 Cursor chat 旁边）。Codex 会作为 sidebar 中的另一个标签页出现。

移动后，将 activity bar orientation 重置为 `horizontal`，以恢复默认行为。
如果你之后改变主意，可以随时将 Codex 拖回主（左）sidebar。

#### 登录

安装扩展后，它会提示你使用 ChatGPT 账号或 API key 登录。你的 ChatGPT 计划包含使用额度，因此你可以无需额外设置即可使用 Codex。请在[定价页面](/codex/pricing)了解更多。

### Codex web

来源：[Codex web](/codex/cloud.md)

#### Codex web 设置

前往 [Codex](https://chatgpt.com/codex) 并连接你的 GitHub 账号。这让 Codex 可以处理你仓库中的代码，并从它的工作创建 pull requests。

你的 Plus、Pro、Business、Edu 或 Enterprise 计划包含 Codex。了解更多[包含的内容](/codex/pricing)。某些 Enterprise workspaces 可能需要[管理员设置](/codex/enterprise/admin-setup)，你才能访问 Codex。

---

#### 使用 Codex web

#### 了解提示

编写更清晰的提示、添加约束，并选择合适的详细程度，以获得更好的结果。

#### 常见工作流

从经过验证的模式开始，用于委托任务、审查更改，并将结果转化为 PR。

## Customization, Skills, Rules, MCP, and Integrations

<a id="customization-and-tooling"></a>

如何用 instructions、skills、prompts、MCP 和外部集成塑造 Codex 行为。

### Agent Skills

来源：[Agent Skills](/codex/skills.md)

使用 agent skills 为 Codex 扩展任务特定能力。Skill 会打包指令、资源和可选脚本，使 Codex 能够可靠地遵循工作流。Skills 建立在 [open agent skills standard](https://agentskills.io) 之上。

Skills 是可复用工作流的创作格式。Plugins 是 Codex 中可复用 skills 和 apps 的可安装分发单元。使用 skills 设计工作流本身；当你希望其他开发者安装它时，再将其打包为 [plugin](/codex/plugins/build)。

Skills 可用于 Codex CLI、IDE extension 和 Codex app。

Skills 使用**渐进式披露**高效管理上下文：Codex 会先看到每个 skill 的名称、描述和文件路径。只有在 Codex 决定使用某个 skill 时，才会加载完整的 `SKILL.md` 指令。

Codex 在上下文中包含初始可用 skills 列表，以便为任务选择合适的 skill。为了避免挤占提示的其余部分，该列表最多使用模型上下文窗口的 2%，在上下文窗口未知时最多使用 8,000 个字符。如果安装了很多 skills，Codex 会先缩短 skill 描述。对于大型 skill 集，Codex 可能会从初始列表中省略一些 skills，并显示警告。

该预算只适用于初始 skills 列表。当 Codex 选择某个 skill 时，它仍会读取该 skill 的完整 SKILL.md 指令。

Skill 是一个包含 `SKILL.md` 文件以及可选脚本和 references 的目录。`SKILL.md` 文件必须包含 `name` 和 `description`。

#### Codex 如何使用 skills

Codex 可以通过两种方式激活 skills：

1. **显式调用：** 直接在你的提示中包含该 skill。在 CLI/IDE 中，运行 `/skills` 或输入 `$` 提及某个 skill。
2. **隐式调用：** 当你的任务匹配 skill 的 `description` 时，Codex 可以选择该 skill。

由于隐式匹配依赖 `description`，请编写简洁且范围和边界清晰的描述。将关键用例和触发词前置，以便即使描述被缩短，Codex 仍能匹配该 skill。

#### 创建 skill

如果你已经知道工作流，并且展示它比描述它更容易，请使用 [Record & Replay](/codex/record-and-replay)。Codex 会记录该工作流、检查步骤，并从演示中起草可复用 skill。

如果你想描述 skill，请使用内置 creator：

```text
$skill-creator
```

Creator 会询问 skill 做什么、何时应触发，以及它应保持为仅指令，还是包含脚本。默认是仅指令。

你也可以通过创建包含 `SKILL.md` 文件的文件夹，手动创建 skill：

```md
---
name: skill-name
description: Explain exactly when this skill should and should not trigger.
---

Skill instructions for Codex to follow.
```

Codex 会自动检测 skill 更改。如果更新未出现，请重启 Codex。

#### 保存 skills 的位置

Codex 从 repository、user、admin 和 system 位置读取 skills。对于 repositories，Codex 会从当前工作目录向上到仓库根目录，扫描每一层目录中的 `.agents/skills`。如果两个 skills 共享同一个 `name`，Codex 不会合并它们；二者都可以出现在 skill selectors 中。

| Skill Scope                                                                    | Location                                                                                                                                                                                             | Suggested use                                                                                                                      |
| :----------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `REPO`                                                                         | `$CWD/.agents/skills`                                                                                                                                                                                |
| 当前工作目录：你启动 Codex 的位置。                                            | 如果你位于仓库或代码环境中，团队可以检入与某个工作文件夹相关的 skills。例如，只与某个 microservice 或 module 相关的 skills。                                                                         |
| `REPO`                                                                         | `$CWD/../.agents/skills`                                                                                                                                                                             |
| 当你在 Git 仓库中启动 Codex 时，CWD 上方的文件夹。                             | 如果你位于包含嵌套文件夹的仓库中，组织可以在父文件夹中检入与共享区域相关的 skills。                                                                                                                  |
| `REPO`                                                                         | `$REPO_ROOT/.agents/skills`                                                                                                                                                                          |
| 当你在 Git 仓库中启动 Codex 时，最顶层的根文件夹。                             | 如果你位于包含嵌套文件夹的仓库中，组织可以检入与所有使用该仓库的人相关的 skills。这些会作为根 skills 提供给仓库中的任何子文件夹。                                                                    |
| `USER`                                                                         | `$HOME/.agents/skills`                                                                                                                                                                               |
| 检入用户个人文件夹的任何 skills。                                              | 用于整理与某个用户相关、并适用于该用户可能工作的任何仓库的 skills。                                                                                                                                  |
| `ADMIN`                                                                        | `/etc/codex/skills`                                                                                                                                                                                  |
| 检入机器或容器上的共享系统位置的任何 skills。                                  | 用于 SDK scripts、automation，以及检入默认 admin skills，供机器上的每位用户使用。                                                                                                                     |
| `SYSTEM`                                                                       | Bundled with Codex by OpenAI.                                                                                                                                                                        | 适用于广泛受众的有用 skills，例如 skill-creator 和 plan skills。每个人启动 Codex 时都可用。                                                                                                        |

Codex 支持 symlinked skill folders，并在扫描这些位置时跟随 symlink target。

这些位置用于创作和本地发现。当你想将可复用 skills 分发到单个 repo 之外，或可选地将它们与 app integrations 捆绑时，请使用 [plugins](/codex/plugins/build)。

#### 用 plugins 分发 skills

直接使用 skill folders 最适合本地创作和 repo 作用域工作流。如果你想分发可复用 skill、将两个或更多 skills 打包在一起，或将 skill 与 app integration 一起发布，请将它们打包为 [plugin](/codex/plugins/build)。

Plugins 可以包含一个或多个 skills。它们也可以选择性地将 app mappings、MCP server 配置和 presentation assets 打包在一个 package 中。

#### 安装精选 skills 以供本地使用

要为你自己的本地 Codex 设置添加内置以外的精选 skills，请使用 `$skill-installer`。例如，要安装 `$linear` skill：

```bash
$skill-installer linear
```

你也可以提示 installer 从其他 repositories 下载 skills。Codex 会自动检测新安装的 skills；如果某个 skill 没有出现，请重启 Codex。

将它用于本地设置和实验。对于你自己的 skills 的可复用分发，请优先使用 plugins。

#### 启用或禁用 skills

使用 `~/.codex/config.toml` 中的 `[[skills.config]]` 条目，可以在不删除 skill 的情况下禁用它：

```toml
[[skills.config]]
path = "/path/to/skill/SKILL.md"
enabled = false
```

更改 `~/.codex/config.toml` 后请重启 Codex。

#### 可选元数据

添加 `agents/openai.yaml` 以在 [Codex app](/codex/app) 中配置 UI 元数据、设置调用策略，并声明工具依赖项，从而让使用 skill 的体验更顺畅。

```yaml
interface:
  display_name: "Optional user-facing name"
  short_description: "Optional user-facing description"
  icon_small: "./assets/small-logo.svg"
  icon_large: "./assets/large-logo.png"
  brand_color: "#3B82F6"
  default_prompt: "Optional surrounding prompt to use the skill with"

policy:
  allow_implicit_invocation: false

dependencies:
  tools:
    - type: "mcp"
      value: "openaiDeveloperDocs"
      description: "OpenAI Docs MCP server"
      transport: "streamable_http"
      url: "https://developers.openai.com/mcp"
```

`allow_implicit_invocation`（默认：`true`）：当为 `false` 时，Codex 不会基于用户提示隐式调用该 skill；显式 `$skill` 调用仍然有效。

#### Best practices

- 保持每个 skill 专注于一件事。
- 除非你需要确定性行为或外部工具，否则优先使用指令而不是脚本。
- 使用带有明确输入和输出的命令式步骤。
- 针对 skill description 测试提示，确认触发行为正确。

更多示例请参见 [github.com/openai/skills](https://github.com/openai/skills) 和 [agent skills specification](https://agentskills.io/specification)。

### GitHub 中的 Codex code review

来源：[Codex code review in GitHub](/codex/integrations/github.md)

使用 Codex code review 可在 GitHub pull requests 上获得另一轮高信号审查。Codex 会审查 pull request diff、遵循你的仓库指导，并发布一条标准 GitHub code review，重点关注严重问题。

#### 开始前

确保你拥有：

- 为你想审查的仓库设置的 [Codex cloud](/codex/cloud)。
- 对 [Codex code review settings](https://chatgpt.com/codex/settings/code-review) 的访问权限。
- 如果你希望 Codex 遵循仓库特定审查指导，则需要一个 `AGENTS.md` 文件。

#### 设置 Codex code review

1. 设置 [Codex cloud](/codex/cloud)。
2. 前往 [Codex settings](https://chatgpt.com/codex/settings/code-review)。
3. 为你的仓库打开 **Code review**。

#### 请求 Codex review

1. 在 pull request 评论中提及 `@codex review`。
2. 等待 Codex 做出反应（👀）并发布审查。

Codex 会像队友一样在 pull request 上发布审查。在 GitHub 中，Codex 只会标记 P0 和 P1 问题，因此审查评论会聚焦于高优先级风险。

#### 启用自动审查

如果你希望 Codex 自动审查每个 pull request，请在 [Codex settings](https://chatgpt.com/codex/settings/code-review) 中打开 **Automatic reviews**。Codex 会在有人打开新的 PR 以供审查时发布审查，无需 `@codex review` 评论。

#### 自定义 Codex 审查内容

Codex 会在你的仓库中搜索 `AGENTS.md` 文件，并遵循你包含的任何 **Review guidelines**。

要为仓库设置指导，请添加或更新顶层 `AGENTS.md`，并包含如下 section：

```md
## Review guidelines

- Don't log PII.
- Verify that authentication middleware wraps every route.
```

Codex 会将距离每个 changed file 最近的 `AGENTS.md` 中的指导应用到该文件。当特定 packages 需要额外审查时，你可以在更深层目录放置更具体的指令。

对于一次性关注点，请将其添加到你的 pull request 评论中：

`@codex review for security regressions`

如果你希望 Codex 标记文档中的 typo，请在 `AGENTS.md` 中添加指导（例如，“Treat typos in docs as P1.”）。

#### 处理审查发现

Codex 发布审查后，你可以在同一个 pull request 中留下另一条评论，要求它修复问题：

```md
@codex fix the P1 issue
```

Codex 会启动一个以 pull request 为上下文的 cloud task，并在有权限时将修复推回该分支。

#### 给 Codex 其他任务

如果你在评论中提及 `@codex`，且内容不是 `review`，Codex 会使用你的 pull request 作为上下文启动一个 [cloud task](/codex/cloud)。

```md
@codex fix the CI failures
```

#### Codex code review 故障排查

如果 Codex 没有反应或没有发布审查：

- 确认你已在 [Codex settings](https://chatgpt.com/codex/settings/code-review) 中为该仓库打开 **Code review**。
- 确认该 pull request 属于已设置 [Codex cloud](/codex/cloud) 的仓库。
- 在 pull request 评论中使用确切触发词 `@codex review`。
- 对于自动审查，请检查你已打开 **Automatic reviews**，并且 pull request 事件匹配你的审查触发设置。

### 使用 AGENTS.md 的自定义指令

来源：[Custom instructions with AGENTS.md](/codex/guides/agents-md.md)

Codex 在执行任何工作前会读取 `AGENTS.md` 文件。通过将全局指导与项目特定覆盖分层，无论你打开哪个仓库，都可以让每个任务以一致预期开始。

#### Codex 如何发现指导

Codex 在启动时构建一条指令链（每次运行一次；在 TUI 中通常意味着每次启动会话一次）。发现遵循以下优先级顺序：

1. **Global scope：** 在你的 Codex home directory 中（默认是 `~/.codex`，除非设置了 `CODEX_HOME`），如果存在 `AGENTS.override.md`，Codex 会读取它。否则，Codex 会读取 `AGENTS.md`。Codex 只使用该层级的第一个非空文件。
2. **Project scope：** 从项目根目录（通常是 Git root）开始，Codex 会向下遍历到当前工作目录。如果 Codex 找不到项目根目录，它只会检查当前目录。在路径上的每个目录中，它会检查 `AGENTS.override.md`，然后是 `AGENTS.md`，再是 `project_doc_fallback_filenames` 中的任何 fallback 名称。Codex 每个目录最多包含一个文件。
3. **Merge order：** Codex 从根向下连接文件，并用空行连接。离当前目录更近的文件会覆盖更早的指导，因为它们在合并提示中出现得更晚。

Codex 会跳过空文件，并在合并后的大小达到 `project_doc_max_bytes` 定义的限制（默认 32 KiB）时停止添加文件。有关这些旋钮的详情，请参见[项目指令发现](/codex/config-advanced#project-instructions-discovery)。当你遇到上限时，请提高限制，或将指令拆分到嵌套目录中。

#### 创建全局指导

在你的 Codex home directory 中创建持久默认值，让每个仓库继承你的工作约定。

1. 确保目录存在：

   ```bash
   mkdir -p ~/.codex
   ```

2. 创建 `~/.codex/AGENTS.md`，写入可复用偏好：

   ```md
   # ~/.codex/AGENTS.md

   ## Working agreements

   - Always run `npm test` after modifying JavaScript files.
   - Prefer `pnpm` when installing dependencies.
   - Ask for confirmation before adding new production dependencies.
   ```

3. 在任何地方运行 Codex，确认它加载了该文件：

   ```bash
   codex --ask-for-approval never "Summarize the current instructions."
   ```

   Expected: Codex quotes the items from `~/.codex/AGENTS.md` before proposing work.

当你需要临时全局覆盖而不删除基础文件时，请使用 `~/.codex/AGENTS.override.md`。移除 override 可恢复共享指导。

#### 分层项目指令

仓库级文件让 Codex 了解项目规范，同时仍继承你的全局默认值。

1. 在仓库根目录添加一个覆盖基本设置的 `AGENTS.md`：

   ```md
   # AGENTS.md

   ## Repository expectations

   - Run `npm run lint` before opening a pull request.
   - Document public utilities in `docs/` when you change behavior.
   ```

2. 当特定团队需要不同规则时，在嵌套目录中添加 overrides。例如，在 `services/payments/` 内创建 `AGENTS.override.md`：

   ```md
   # services/payments/AGENTS.override.md

   ## Payments service rules

   - Use `make test-payments` instead of `npm test`.
   - Never rotate API keys without notifying the security channel.
   ```

3. 从 payments 目录启动 Codex：

   ```bash
   codex --cd services/payments --ask-for-approval never "List the instruction sources you loaded."
   ```

   Expected: Codex reports the global file first, the repository root `AGENTS.md` second, and the payments override last.

Codex 到达当前目录后停止搜索，因此请将 overrides 放在尽可能接近专门工作的地方。

以下是在添加全局文件和 payments 特定 override 后的示例仓库：

#### 自定义 fallback 文件名

如果你的仓库已经使用其他文件名（例如 `TEAM_GUIDE.md`），请将它添加到 fallback 列表，让 Codex 将其视为指令文件。

1. 编辑你的 Codex 配置：

   ```toml
   # ~/.codex/config.toml
   project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
   project_doc_max_bytes = 65536
   ```

2. 重启 Codex 或运行新命令，以便加载更新后的配置。

现在 Codex 会按以下顺序检查每个目录：`AGENTS.override.md`、`AGENTS.md`、`TEAM_GUIDE.md`、`.agents.md`。未列入此列表的文件名会被忽略，不用于指令发现。更大的 byte 限制允许在截断前合并更多指导。

有了 fallback 列表后，Codex 会将备用文件视为指令：

当你想使用不同 profile（例如项目特定 automation user）时，请设置 `CODEX_HOME` 环境变量：

```bash
CODEX_HOME=$(pwd)/.codex codex exec "List active instruction sources"
```

Expected: The output lists files relative to the custom `.codex` directory.

#### 验证你的设置

- 从仓库根目录运行 `codex --ask-for-approval never "Summarize the current instructions."`。Codex 应按优先级顺序回显来自全局和项目文件的指导。
- 使用 `codex --cd subdir --ask-for-approval never "Show which instruction files are active."`，确认嵌套 overrides 替换更宽泛的规则。
- 要审计 Codex 加载了哪些指令文件，可用 `codex -c log_dir=./.codex-log` 选择启用 plaintext TUI log，并检查 `./.codex-log/codex-tui.log`；如果启用了 session logging，也可以检查最新的 `session-*.jsonl` 文件。
- 如果指令看起来陈旧，请在目标目录中重启 Codex。Codex 会在每次运行（以及每个 TUI 会话开始时）重建指令链，因此没有需要手动清除的缓存。

#### 排查发现问题

- **Nothing loads：** 确认你位于预期仓库中，并且 `codex status` 报告的 workspace root 符合预期。确保指令文件有内容；Codex 会忽略空文件。
- **Wrong guidance appears：** 查找目录树更高处或 Codex home 下的 `AGENTS.override.md`。重命名或移除该 override，以回退到常规文件。
- **Codex ignores fallback names：** 确认你在 `project_doc_fallback_filenames` 中列出的名称没有拼写错误，然后重启 Codex，使更新后的配置生效。
- **Instructions truncated：** 提高 `project_doc_max_bytes`，或将大型文件拆分到嵌套目录中，以保留关键指导。
- **Profile confusion：** 启动 Codex 前运行 `echo $CODEX_HOME`。非默认值表示 Codex 指向与你编辑的 home directory 不同的位置。

#### 后续步骤

- 访问官方 [AGENTS.md](https://agents.md) 网站了解更多信息。
- 查看 [Prompting Codex](/codex/prompting)，了解与持久指导配合良好的对话模式。

### Custom Prompts

来源：[Custom Prompts](/codex/custom-prompts.md)

Custom prompts 已弃用。请使用 [skills](/codex/skills) 提供 Codex 可以显式或隐式调用的可复用指令。

Custom prompts（已弃用）让你可以将 Markdown 文件转换为可复用提示，并在 Codex CLI 和 Codex IDE extension 中作为斜杠命令调用它们。

Custom prompts 需要显式调用，并位于你的本地 Codex home directory（例如 `~/.codex`）中，因此不会通过仓库共享。如果你想共享 prompt（或希望 Codex 隐式调用它），请[使用 skills](/codex/skills)。

1. 创建 prompts 目录：

   ```bash
   mkdir -p ~/.codex/prompts
   ```

2. 创建带有可复用指导的 `~/.codex/prompts/draftpr.md`：

   ```markdown
   ---
   description: Prep a branch, commit, and open a draft PR
   argument-hint: [FILES=] [PR_TITLE=""]
   ---

   Create a branch named `dev/` for this work.
   If files are specified, stage them first: $FILES.
   Commit the staged changes with a clear message.
   Open a draft PR on the same branch. Use $PR_TITLE when supplied; otherwise write a concise summary yourself.
   ```

3. 重启 Codex，使其加载新 prompt（重启 CLI 会话；如果你使用 IDE extension，请 reload 它）。

Expected: Typing `/prompts:draftpr` in the slash command menu shows your custom command with the description from the front matter and hints that files and a PR title are optional.

#### 添加元数据和参数

Codex 会在下次会话开始时读取 prompt metadata 并解析 placeholders。

- **Description：** 显示在弹窗中的命令名下方。在 YAML front matter 中将其设置为 `description:`。
- **Argument hint：** 使用 `argument-hint: KEY=` 记录预期参数。
- **Positional placeholders：** `$1` 到 `$9` 会从你在命令后提供的空格分隔参数展开。`$ARGUMENTS` 包含全部参数。
- **Named placeholders：** 使用 `$FILE` 或 `$TICKET_ID` 这类大写名称，并以 `KEY=value` 提供值。包含空格的值请加引号（例如 `FOCUS="loading state"`）。
- **Literal dollar signs：** 写 `$$` 可在展开后的提示中输出单个 `$`。

编辑 prompt files 后，请重启 Codex 或打开新聊天以加载更新。Codex 会忽略 prompts 目录中的非 Markdown 文件。

#### 调用和管理自定义命令

1. 在 Codex（CLI 或 IDE extension）中，输入 `/` 打开斜杠命令菜单。
2. 输入 `prompts:` 或 prompt name，例如 `/prompts:draftpr`。
3. 提供必需参数：

   ```text
   /prompts:draftpr FILES="src/pages/index.astro src/lib/api.ts" PR_TITLE="Add hero animation"
   ```

4. 按 Enter 发送展开后的指令（当你不需要某个参数时，可跳过它）。

Expected: Codex expands the content of `draftpr.md`, replacing placeholders with the arguments you supplied, then sends the result as a message.

通过编辑或删除 `~/.codex/prompts/` 下的文件来管理 prompts。Codex 只扫描该文件夹顶层的 Markdown 文件，因此请将每个 custom prompt 直接放在 `~/.codex/prompts/` 下，而不是放在子目录中。

### Customization

来源：[Customization](/codex/concepts/customization.md)

Customization 是让 Codex 按你的团队工作方式工作的方式。

在 Codex 中，customization 来自几个协同工作的层：

- 用于持久指令的 **Project guidance (`AGENTS.md`)**
- 用于保存先前工作中有用上下文的 **[Memories](/codex/memories)**
- 用于可复用工作流和领域专业知识的 **Skills**
- 用于访问外部工具和共享系统的 **[MCP](/codex/mcp)**
- 用于将工作委派给专门 subagents 的 **[Subagents](/codex/concepts/subagents)**

这些是互补关系，而不是竞争关系。`AGENTS.md` 塑造行为，memories 将本地上下文向前传递，skills 打包可重复流程，[MCP](/codex/mcp) 将 Codex 连接到本地 workspace 之外的系统。

#### AGENTS Guidance

`AGENTS.md` 为 Codex 提供随仓库同行的持久项目指导，并在 agent 开始工作前应用。保持它简短。

将它用于你希望 Codex 每次在 repo 中都遵循的规则，例如：

- 构建和测试命令
- 审查期望
- repo 特定约定
- 目录特定指令

当 agent 对你的代码库做出错误假设时，请在 `AGENTS.md` 中纠正它们，并要求 agent 更新 `AGENTS.md`，使修复持久化。将它视为反馈循环。

**Updating `AGENTS.md`：** 从真正重要的指令开始。将反复出现的审查反馈编入规范，把指导放在最接近适用位置的目录中，并在你纠正某件事时告诉 agent 更新 `AGENTS.md`，使未来会话继承该修复。

#### 何时更新 `AGENTS.md`

- **Repeated mistakes**：如果 agent 反复犯同样的错误，请添加规则。
- **Too much reading**：如果它找到了正确文件但读取了太多文档，请添加路由指导（优先读取哪些目录/文件）。
- **Recurring PR feedback**：如果你多次留下相同反馈，请将其编入规范。
- **In GitHub**：在 pull request 评论中，用请求标记 `@codex`（例如 `@codex add this to AGENTS.md`），将更新委托给 cloud task。
- **Automate drift checks**：使用 [automations](/codex/app/automations) 运行重复检查（例如每日），查找指导缺口并建议应添加到 `AGENTS.md` 的内容。

将 `AGENTS.md` 与执行这些规则的基础设施配对：pre-commit hooks、linters 和 type checkers 会在你看到问题前捕获它们，因此系统会更擅长防止重复错误。

Codex 可以从多个位置加载指导：你的 Codex home directory 中的全局文件（供你作为开发者使用），以及团队可以检入的 repo-specific files。距离工作目录更近的文件优先级更高。使用全局文件塑造 Codex 与你的沟通方式（例如审查风格、详细程度和默认值），并让 repo 文件聚焦于团队和代码库规则。

[Custom instructions with AGENTS.md](/codex/guides/agents-md)

#### Skills

Skills 为 Codex 提供可复用能力，用于可重复工作流。Skills 通常最适合可复用工作流，因为它们支持更丰富的指令、脚本和 references，同时可跨任务复用。Skills 会被加载并对 agent 可见（至少是其 metadata），因此 Codex 可以隐式发现和选择它们。这让丰富工作流可用，而不会一开始就膨胀上下文。

使用 skill folders 在本地创作和迭代工作流。如果某个工作流已有 plugin，请先安装它，以复用经过验证的设置。当你想将自己的工作流分发到团队，或将其与 app integrations 捆绑时，请将它打包为 [plugin](/codex/plugins/build)。Skills 保持为创作格式；plugins 是可安装的分发单元。

Skill 通常是一个 `SKILL.md` 文件，加上可选的 scripts、references 和 assets。

Skill directory 可以包含 `scripts/` 文件夹，里面放置 Codex 作为工作流一部分调用的 CLI scripts（例如 seed data 或运行 validations）。当工作流需要外部系统（issue trackers、design tools、docs servers）时，请将 skill 与 [MCP](/codex/mcp) 搭配。

示例 `SKILL.md`：

```md
---
name: commit
description: Stage and commit changes in semantic groups. Use when the user wants to commit, organize commits, or clean up a branch before pushing.
---

1. Do not run `git add .`. Stage files in logical groups by purpose.
2. Group into separate commits: feat → test → docs → refactor → chore.
3. Write concise commit messages that match the change scope.
4. Keep each commit focused and reviewable.
```

将 skills 用于：

- 可重复工作流（release steps、review routines、docs updates）
- 团队特定专业知识
- 需要示例、references 或 helper scripts 的流程

Skills 可以是全局的（在你的用户目录中，供你作为开发者使用），也可以是 repo-specific 的（检入 `.agents/skills`，供你的团队使用）。当工作流适用于该项目时，将 repo skills 放入 `.agents/skills`；将你想跨所有 repos 使用的 skills 放入用户目录。

| Layer  | Global                 | Repo                                           |
| :----- | :--------------------- | :--------------------------------------------- |
| AGENTS | `~/.codex/AGENTS.md`   | `AGENTS.md` in repo root or nested directories |
| Skills | `$HOME/.agents/skills` | `.agents/skills` in repo                       |

Codex 对 skills 使用渐进式披露：

- 它从用于发现的 metadata（`name`、`description`）开始
- 只有当选择某个 skill 时，才加载 `SKILL.md`
- 只在需要时读取 references 或运行 scripts

Skills 可以被显式调用，当任务匹配 skill description 时，Codex 也可以隐式选择它们。清晰的 skill descriptions 可提高触发可靠性。

[Agent Skills](/codex/skills)

#### MCP

MCP (Model Context Protocol) 是将 Codex 连接到外部工具和上下文提供方的标准方式。它特别适用于 Figma、Linear、GitHub 或团队依赖的内部知识服务等远程托管系统。

当 Codex 需要本地 repo 之外的能力时，请使用 MCP，例如 issue trackers、design tools、browsers 或共享文档系统。

一种理解方式：

- **Host**：Codex
- **Client**：Codex 内部的 MCP connection
- **Server**：外部工具或上下文提供方

MCP servers 可以公开：

- **Tools**（动作）
- **Resources**（可读取数据）
- **Prompts**（可复用 prompt templates）

这种分离有助于你理解信任和能力边界。有些 servers 主要提供上下文，而另一些则公开强大的动作。

实践中，MCP 与 skills 搭配时通常最有用：

- Skill 定义工作流，并命名要使用的 MCP tools

[Model Context Protocol](/codex/mcp)

#### Subagents

你可以创建具有不同角色的不同 agents，并提示它们以不同方式使用工具。例如，一个 agent 可能运行特定测试命令和配置，而另一个 agent 拥有可获取生产日志以进行调试的 MCP servers。每个 subagent 都保持聚焦，并使用适合其工作的工具。

[Subagent concepts](/codex/concepts/subagents)

#### Skills + MCP together

Skills 加 MCP 是它们汇合的地方：skills 定义可重复工作流，MCP 将它们连接到外部工具和系统。如果某个 skill 依赖 MCP，请在 `agents/openai.yaml` 中声明该依赖，以便 Codex 可以自动安装和接线（参见 [Agent Skills](/codex/skills)）。

#### 下一步

按此顺序构建：

1. [Custom instructions with AGENTS.md](/codex/guides/agents-md)，让 Codex 遵循你的 repo 约定。添加 pre-commit hooks 和 linters 来执行这些规则。
2. 当已经存在可复用工作流时，安装 [plugin](/codex/plugins)。否则，创建 [skill](/codex/skills)，并在你想共享它时将其打包为 plugin。
3. 当工作流需要外部系统（Linear、GitHub、docs servers、design tools）时，使用 [MCP](/codex/mcp)。
4. 当你准备好将嘈杂或专门的任务委派给 subagents 时，使用 [Subagents](/codex/subagents)。
