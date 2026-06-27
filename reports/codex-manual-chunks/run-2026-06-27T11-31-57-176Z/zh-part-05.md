### Chronicle

来源：[Chronicle](/codex/memories/chronicle.md)

Chronicle 处于**选择加入的研究预览**阶段。它仅面向 macOS 上的 ChatGPT Pro 订阅者提供。启用前，请查看[隐私和安全](#privacy-and-security)部分，了解详细信息并理解当前风险。

Chronicle 会用来自你屏幕的上下文增强 Codex memories。当你向 Codex 发出提示时，这些 memories 可以帮助它理解你一直在做什么，减少你重新说明上下文的需要。

Chronicle 在 macOS 的 Codex app 中作为选择加入的研究预览提供。它需要 macOS 屏幕录制和辅助功能权限。启用前，请注意 Chronicle 会快速消耗速率限制，增加提示注入风险，并且会在你的设备上以未加密方式存储 memories。

#### Chronicle 如何提供帮助

我们设计 Chronicle 是为了减少你在使用 Codex 时必须重复说明的上下文量。通过使用近期屏幕上下文来改进 memory 构建，Chronicle 可以帮助 Codex 理解你指的是什么、识别应使用的正确来源，并学会你依赖的工具和工作流。

#### 使用屏幕上的内容

借助 Chronicle，Codex 可以理解你当前正在查看的内容，从而节省你的时间并减少上下文切换。

#### 补全缺失上下文

无需精心编写上下文并从零开始。Chronicle 让 Codex 能够补全你上下文中的空白。

#### 记住工具和工作流

无需向 Codex 解释要使用哪些工具来完成你的工作。Codex 会随着你的工作而学习，从长远来看为你节省时间。

在这些情况下，Codex 使用 Chronicle 来提供额外上下文。当另一个来源更适合完成任务时，例如读取特定文件、Slack thread、Google Doc、dashboard 或 pull request，Codex 会使用 Chronicle 识别该来源，然后直接使用该来源。

#### 启用 Chronicle

1. 在 Codex app 中打开 Settings。
2. 前往 **Personalization**，并确保 **Memories** 已启用。
3. 在 Memories 设置下方开启 **Chronicle**。
4. 查看同意对话框并选择 **Continue**。
5. 在出现提示时授予 macOS Screen Recording 和 Accessibility 权限。
6. 设置完成后，选择 **Try it out** 或启动一个新 thread。

如果 macOS 报告 Screen Recording 或 Accessibility 权限被拒绝，请打开 System Settings &gt; Privacy & Security &gt; Screen Recording 或 Accessibility，并启用 Codex。如果某项权限受到 macOS 或你的组织限制，Chronicle 会在限制解除且 Codex 获得所需权限后启动。

#### 随时暂停或禁用 Chronicle

你可以控制 Chronicle 何时使用屏幕上下文生成 memories。使用 Codex 菜单栏图标选择 **Pause Chronicle** 或 **Resume Chronicle**。在会议前，或查看你不希望 Codex 用作上下文的敏感内容时，请暂停 Chronicle。要禁用 Chronicle，请返回 **Settings &gt; Personalization &gt; Memories** 并关闭 **Chronicle**。

你也可以控制是否在某个给定 thread 中使用 memories。[了解更多](/codex/memories#control-memories-per-thread)。

#### 速率限制

Chronicle 的工作方式是在后台运行沙箱化 agents，从捕获的屏幕图像生成 memories。这些 agents 目前会快速消耗速率限制。

#### 隐私和安全

Chronicle 使用屏幕捕获，其中可能包含屏幕上可见的敏感信息。它无法访问你的麦克风或系统音频。未经他人同意，不要使用 Chronicle 记录会议或与他人的通信。在查看你不希望被记入 memories 的内容时，请暂停 Chronicle。

#### Chronicle 将我的数据存储在哪里？

屏幕捕获是临时的，并且只会暂时保存在你的计算机上。Chronicle 运行时，临时屏幕捕获文件可能会出现在 `$TMPDIR/chronicle/screen_recording/` 下。Chronicle 运行时，会删除超过 6 小时的屏幕捕获。

Chronicle 生成的 memories 与其他 Codex memories 一样：是未加密的 markdown 文件，你可以按需读取和修改。你也可以要求 Codex 搜索它们。如果你想让 Codex 忘记某些内容，可以删除该文件夹中的相应文件，或有选择地编辑 markdown 文件来移除你想删除的信息。你不应手动添加新信息。生成的 Chronicle memories 会本地存储在你的计算机上的 `$CODEX_HOME/memories_extensions/chronicle/` 下（通常是 `~/.codex/memories_extensions/chronicle`）。

#### 哪些数据会与 OpenAI 共享？

Chronicle 会在本地捕获屏幕上下文，然后定期使用 Codex 将近期活动总结为 memories。为了生成这些 memories，Chronicle 会启动一个可访问此屏幕上下文的临时 Codex session。该 session 可能会处理选定的截图帧、从截图中提取的 OCR 文本、时间信息，以及相关时间窗口内的本地文件路径。

用于 memory 生成的屏幕捕获会暂时存储在你的设备上。它们会在我们的服务器上处理以生成 memories，随后这些 memories 会本地存储在设备上。除非法律要求，否则我们不会在处理后把截图存储在我们的服务器上，也不会将其用于训练。

生成的 memories 是本地存储在 `$CODEX_HOME/memories_extensions/chronicle/` 下的 Markdown 文件。当 Codex 在未来 session 中使用 memories 时，相关 memory 内容可能会作为该 session 的上下文包含进去，并且如果你的 ChatGPT 设置允许，可能会用于改进我们的模型。[了解更多](https://help.openai.com/en/articles/7730893-data-controls-faq)。

#### 提示注入风险

使用 Chronicle 会增加来自屏幕内容的提示注入攻击风险。例如，如果你浏览包含恶意 agent 指令的网站，Codex 可能会遵循这些指令。

### Codex Security

来源：[Codex Security](/codex/security/index.md)

[在 Codex App 中安装插件](https://chatgpt.com/plugins/share/676aca3811d54fa7bcdef5255236b3c4)

若要进行规范化的首次本地扫描，请从 [Codex Security plugin quickstart](/codex/security/plugin) 开始。

#### 探索插件用例

- [运行安全扫描](/codex/security/plugin/scans)，扫描一个 repository 或一个限定范围的文件夹。
- 当你需要更全面的扫描并且可以等待更长时间完成时，[运行深度安全扫描](/codex/security/plugin/deep-scans)。
- 在合并 pull request 或 branch 前，[审查代码变更](/codex/security/plugin/code-changes)。
- 当你有现有安全 findings 需要审查时，[分诊 backlog](/codex/security/plugin/triage-backlog)。
- 使用有界补丁对已批准的 findings 进行[修复并验证](/codex/security/plugin/fix-findings)。
- 将 findings 作为可移植 artifacts 或需要批准的跟踪目标进行[导出或跟踪](/codex/security/plugin/export-findings)。
- 查看 Codex Security plugin 中的[新增内容](/codex/security/plugin/changelog)。

该插件在你的 Codex thread 中运行。Codex Security cloud 通过 Codex Web 扫描已连接的 GitHub repositories。有关 Codex sandboxing、approvals、network controls 和 admin settings，请参阅 [Agent approvals & security](/codex/agent-approvals-security)。

#### Codex Security cloud

Codex Security cloud 目前处于研究预览阶段。它会扫描已连接的 GitHub repositories，以查找可能的安全问题。

它帮助团队：

1. 通过使用 repository 特定的威胁模型和真实代码上下文，**发现可能的漏洞**。
2. 通过在你审查之前验证 findings，**减少噪声**。
3. 通过排序结果、证据和建议补丁选项，**推动 findings 走向修复**。

#### Codex Security cloud 的工作方式

Codex Security 会按 commit 扫描已连接的 repositories。它根据你的 repository 构建扫描上下文，对照该上下文检查可能的漏洞，并在暴露之前于隔离环境中验证高信号问题。

你会获得一个专注于以下内容的工作流：

- repository 特定上下文，而不是通用签名
- 有助于减少误报的验证证据
- 你可以在 GitHub 中审查的建议修复

#### Codex Security cloud 访问和前提条件

Codex Security 面向 ChatGPT Enterprise、Edu、Business 和 Pro 用户提供。它通过 Codex Web 与已连接的 GitHub repositories 一起使用。如果你需要访问权限，或某个 repository 不可见，请确认该 repository 可通过你的 Codex Web workspace 使用，或联系你的 OpenAI account team。

#### 安全概览参考

- [Codex Security plugin quickstart](/codex/security/plugin) 演示安装和首次本地扫描。
- [Codex Security cloud setup](/codex/security/setup) 详细说明设置、扫描和 findings 审查。
- [Improving the threat model](/codex/security/threat-model) 解释如何调优范围、攻击面和关键性假设。
- [FAQ](/codex/security/faq) 覆盖常见产品问题。

### 术语表

来源：[Glossary](/codex/glossary.md)

使用此术语表作为跨 app、CLI、IDE extension、cloud、SDK 和相关 integrations 的 Codex 术语快速参考。

### Hooks

来源：[Hooks](/codex/hooks.md)

Hooks 是 Codex 的扩展框架。它们允许你把自己的脚本注入到 agentic loop 中，从而启用以下功能：

- 将 conversation 发送到自定义 logging/analytics engine
- 扫描团队 prompts，防止意外粘贴 API keys
- 自动总结 conversations，以创建持久 memories
- 在 conversation turn 停止时运行自定义 validation check，以强制执行标准
- 在某个目录中自定义 prompting

Hooks 默认启用。如果需要在 `config.toml` 中关闭它们，请设置：

```toml
[features]
hooks = false
```

请使用 `hooks` 作为规范 feature key。`codex_hooks` 仍可作为已弃用别名使用。

Admins 可以用同样方式在 `requirements.toml` 中通过 `[features].hooks = false` 强制关闭 hooks。

需要记住的运行时行为：

- 来自多个文件的匹配 hooks 都会运行。
- 针对同一 event 的多个匹配 command hooks 会并发启动，因此一个 hook 无法阻止另一个匹配 hook 启动。
- 非托管 command hooks 必须在运行前经过审查并被信任。
- `PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`UserPromptSubmit`、`SubagentStop` 和 `Stop` 在 turn scope 运行。`SessionStart` 和 `SubagentStart` 在 thread 或 subagent-start scope 运行。

#### Codex 在哪里查找 hooks

Codex 会在 active config layers 旁边以下列任一形式发现 hooks：

- `hooks.json`
- `config.toml` 中的 inline `[hooks]` tables

已安装插件也可以通过其 plugin manifest 或默认的 `hooks/hooks.json` 文件捆绑 lifecycle config。有关插件打包规则，请参阅 [Build plugins](/codex/plugins/build#bundled-mcp-servers-and-lifecycle-hooks)。

实际使用中，四个最有用的位置是：

- `~/.codex/hooks.json`
- `~/.codex/config.toml`
- `/.codex/hooks.json`
- `/.codex/config.toml`

如果存在多个 hook source，Codex 会加载所有匹配的 hooks。较高优先级的 config layers 不会替换较低优先级的 hooks。如果单个 layer 同时包含 `hooks.json` 和 inline `[hooks]`，Codex 会合并它们并在启动时发出警告。每个 layer 最好只使用一种表示形式。

Codex 也可以发现随已启用 plugins 捆绑的 hooks。插件捆绑的 hooks 会与其他 hook sources 一起加载，并使用与其他非托管 hooks 相同的 trust-review 流程。

Project-local hooks 仅在项目 `.codex/` layer 受信任时加载。在不受信任的项目中，Codex 仍会从各自的 active config layers 加载 user 和 system hooks。

#### 审查并信任 hooks

Codex 会在决定哪些 hooks 可以运行之前列出已配置的 hooks。在非托管 command hook 可以运行之前，Codex 要求你审查并信任确切的 hook definition。Codex 会针对 hook 当前的 hash 记录 trust，因此新的或已更改的 hooks 会被标记为需要审查，并在被信任之前跳过。

在 CLI 中使用 `/hooks` 检查 hook sources、审查新的或已更改的 hooks、信任 hooks，或禁用单个非托管 hooks。如果 hooks 需要在启动时审查，Codex 会打印一条警告，告诉你打开 `/hooks`。

来自 system、MDM、cloud 或 `requirements.toml` sources 的 managed hooks 会被标记为 managed、按 policy 受信任，并且不能从 user hook browser 中禁用。

对于已经在 Codex 之外审查 hook sources 的一次性自动化，可传入 `--dangerously-bypass-hook-trust`，以在该次 invocation 中运行已启用 hooks，而不要求持久化 hook trust。

#### 配置形状

Hooks 分为三层组织：

- 一个 hook event，例如 `PreToolUse`、`PostToolUse`、`PreCompact`、`SubagentStart` 或 `Stop`
- 一个 matcher group，用于决定该 event 何时匹配
- 一个或多个 hook handlers，会在 matcher group 匹配时运行

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.codex/hooks/session_start.py",
            "statusMessage": "Loading session notes"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py\"",
            "statusMessage": "Checking Bash command"
          }
        ]
      }
    ],
    "PermissionRequest": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/permission_request.py\"",
            "statusMessage": "Checking approval request"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/post_tool_use_review.py\"",
            "statusMessage": "Reviewing Bash output"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/user_prompt_submit_data_flywheel.py\""
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/stop_continue.py\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

说明：

- `timeout` 以秒为单位。
- 如果省略 `timeout`，Codex 使用 `600` 秒。
- `statusMessage` 是可选项。
- `commandWindows` 是可选的仅 Windows command override。在 TOML 中，使用 `command_windows` 或 `commandWindows`。
- `async` 会被解析，但目前尚不支持 async command hooks。Codex 会跳过带有 `async: true` 的 handlers。
- 目前只有 `type: "command"` handlers 会运行。`prompt` 和 `agent` handlers 会被解析但跳过。
- Commands 以 session 的 `cwd` 作为其 working directory 运行。
- 对于 repo-local hooks，最好从 git root 解析，而不是使用 `.codex/hooks/...` 这样的 relative path。Codex 可能从某个 subdirectory 启动，而基于 git root 的路径可保持 hook location 稳定。

`config.toml` 中等价的 inline TOML：

```toml
[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py"'
timeout = 30
statusMessage = "Checking Bash command"

[[hooks.PostToolUse]]
matcher = "^Bash$"

[[hooks.PostToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/post_tool_use_review.py"'
timeout = 30
statusMessage = "Reviewing Bash output"
```

#### Matcher patterns

`matcher` 字段是一个 regex string，用于筛选 hooks 何时触发。使用 `"*"`、`""`，或完全省略 `matcher`，即可匹配受支持 event 的每一次出现。

只有部分当前 Codex events 会遵循 `matcher`：

| Event               | `matcher` 筛选内容 | 说明                                                         |
| ------------------- | ------------------ | ------------------------------------------------------------ |
| `PermissionRequest` | tool name          | 支持包括 `Bash`、`apply_patch`\* 和 MCP tool names           |
| `PostToolUse`       | tool name          | 支持包括 `Bash`、`apply_patch`\* 和 MCP tool names           |
| `PostCompact`       | compaction trigger | 值为 `manual` 或 `auto`                                      |
| `PreCompact`        | compaction trigger | 值为 `manual` 或 `auto`                                      |
| `PreToolUse`        | tool name          | 支持包括 `Bash`、`apply_patch`\* 和 MCP tool names           |
| `SessionStart`      | start source       | 值为 `startup`、`resume`、`clear` 和 `compact`               |
| `SubagentStart`     | subagent type      | 值取决于启动的 subagent                                      |
| `SubagentStop`      | subagent type      | 值取决于停止的 subagent                                      |
| `UserPromptSubmit`  | not supported      | 针对此 event，会忽略任何已配置的 `matcher`                   |
| `Stop`              | not supported      | 针对此 event，会忽略任何已配置的 `matcher`                   |

\*对于 `apply_patch`，`matcher` values 也可以使用 `Edit` 或 `Write`。

示例：

- `Bash`
- `^apply_patch$`
- `Edit|Write`
- `mcp__filesystem__read_file`
- `mcp__filesystem__.*`
- `startup|resume|clear|compact`
- `manual|auto`

### 导入到 Codex

来源：[Import to Codex](/codex/import.md)

使用导入流程，把你的 instructions、settings、skills、plugins、projects 和来自其他 agents 的近期 chat sessions 带入 Codex。Codex 会直接导入受支持的 items，并让你为任何需要 authorization 的已导入 plugins 或 connections 完成设置。

导入不会更改或删除你现有的 agent setup。

#### 开始导入

1. 在 Codex app 中打开 **Settings**。
2. 在 **General** 下，找到 **Import other agent setup**。
3. 选择 **Import**。
4. 选择要从中导入的 agents，然后选择 **Continue**。
5. 在 **Select items to import** 上，选择 **Continue** 以导入所有内容，或选择 **Customize** 以选择特定 items。
6. 如果你自定义导入，请选择要带入的 items，然后选择 **Confirm**。
7. 导入完成后，打开一个已导入的 project 或 thread 继续工作。

#### 导入的工作方式

Codex 会检查你的 user-level setup 和现有 projects。User-level setup 来自你机器上的文件。Project-level setup 来自你选择的 repositories 和 folders 中的文件。

导入时，Codex 会：

1. 检测受支持的 setup 和近期工作。
2. 导入你选择的 items。
3. 保持现有 agent setup 不变。
4. 检查已导入 plugins 或 connections 是否仍需要设置。
5. 在需要跟进时显示 status card。

#### Codex 可以导入什么

| 导入项                              | Codex 目标                              |
| ----------------------------------- | --------------------------------------- |
| Instruction files                   | [`AGENTS.md`](/codex/guides/agents-md) |
| `settings.json`                     | [`config.toml`](/codex/config-basic)   |
| Skills                              | [Codex skills](/codex/skills)          |
| Plugins                             | Codex plugins                          |
| Existing project folders            | 使用相同 folders 的 Codex projects      |
| Chat sessions from the last 30 days | Codex threads                          |
| MCP server configuration            | [Codex MCP configuration](/codex/mcp)  |
| Hooks                               | [Codex hooks](/codex/hooks)            |
| Slash commands                      | [Codex skills](/codex/skills)          |
| Subagents                           | [Codex agents](/codex/subagents)       |

#### 导入后完成设置

导入完成后，Codex 会在左下角显示 status card。如果某个已导入 plugin 或 connection 仍需要设置，该 card 会指出。

当 Codex 标记某个 item 需要注意时，选择 **Finish** 并按照提示完成设置。

#### 导入后要审查什么

在依赖已导入 setup 前，请审查它，尤其是：

- 已导入 skills 和 agents 中的 tool restrictions 或 permissions。
- 使用 custom authentication、headers、environment variables 或 transports 的 MCP server settings。你可能需要重新登录。
- 行为可能在 Codex 中有所不同的 Hooks。
- 需要手动跟进的 Plugins、marketplaces 或其他 setup。
- 依赖 arguments、shell interpolation 或 file-path placeholders 的 prompt templates 或 command-style prompts。

#### 导入之后

导入完成后，打开一个已导入的 projects 并从那里继续。如果你刚开始使用 Codex，请查看 [quickstart](/codex/quickstart) 了解其余设置流程。

### Memories

来源：[Memories](/codex/memories.md)

Memories 默认关闭。在欧洲经济区、英国和瑞士，Codex 只有在你在 Codex settings 中启用 memories，或在 `~/.codex/config.toml` 的 `[features]` table 中设置 `memories = true` 后，才会使用或生成 memories。

Memories 让 Codex 能够把早期 threads 中有用的上下文带入未来工作。启用 memories 后，Codex 可以记住稳定偏好、重复工作流、技术栈、project conventions 和已知陷阱，因此你不需要在每个 thread 中重复相同上下文。

请把必需的团队指导放在 `AGENTS.md` 或已提交的 documentation 中。将 memories 视为有帮助的本地 recall layer，而不是必须始终适用的规则的唯一来源。

[Chronicle](/codex/memories/chronicle) 帮助 Codex 从你的屏幕恢复近期工作上下文，以构建 memory。

#### 启用 memories

在 Codex app 中，在 settings 里启用 Memories。

对于基于 config 的设置，请把 feature flag 添加到 `config.toml`：

```toml
[features]
memories = true
```

请参阅 [Config basics](/codex/config-basic)，了解 Codex 存储 user-level configuration 的位置，以及 Codex 如何加载 `~/.codex/config.toml`。

#### memories 的工作方式

启用 memories 后，Codex 可以把符合条件的先前 threads 中的有用上下文转换成本地 memory files。Codex 会跳过 active 或 short-lived sessions，从生成的 memory fields 中 redact secrets，并在后台更新 memories，而不是在每个 thread 结束时立即更新。

当 thread 结束时，Memories 可能不会立刻更新。Codex 会等待 thread 空闲足够长时间，以避免总结仍在进行中的工作。

当你的 Codex rate-limit remaining percentage 低于已配置阈值时，Memory generation 也可以跳过一次后台 pass，因此 Codex 在你接近限制时不会消耗 quota。

#### Memory storage

Codex 将 memories 存储在你的 Codex home directory 下。默认情况下，那是 `~/.codex`。请参阅 [Config and state locations](/codex/config-advanced#config-and-state-locations)，了解 Codex 如何使用 `CODEX_HOME`。

主要 memory files 位于 `~/.codex/memories/` 下，包括 summaries、durable entries、recent inputs，以及来自先前 threads 的 supporting evidence。

请将这些文件视为 generated state。你可以在 troubleshooting 或共享 Codex home directory 前检查它们，但不要依赖手动编辑它们作为主要 control surface。

#### 按 thread 控制 memories

在 Codex app 和 Codex TUI 中，使用 `/memories` 控制当前 thread 的 memory behavior。Thread-level choices 让你决定当前 thread 是否可以使用现有 memories，以及 Codex 是否可以使用该 thread 来生成未来 memories。

Thread-level choices 不会更改你的 global memory settings。

#### 配置

在 Codex app settings 中启用 memories，或在 `config.toml` 的 `[features]` section 中设置 `memories = true`。

有关 config file locations 和 memory-related settings 的完整列表，请参阅 [configuration reference](/codex/config-reference)。

常见的 memory-specific settings 包括：

- `memories.generate_memories`：控制新创建的 threads 是否可以存储为 memory-generation inputs。
- `memories.use_memories`：控制 Codex 是否将现有 memories 注入未来 sessions。
- `memories.disable_on_external_context`：当为 `true` 时，让使用过 external context（例如 MCP tool calls、web search 或 tool search）的 threads 不参与 memory generation。较旧的 `memories.no_memories_if_mcp_or_web_search` key 仍作为 alias 接受。
- `memories.min_rate_limit_remaining_percent`：控制 memory generation 启动前所需的最低剩余 Codex rate-limit percentage。
- `memories.extract_model`：覆盖用于 per-thread memory extraction 的 model。
- `memories.consolidation_model`：覆盖用于 global memory consolidation 的 model。

#### 审查 memories

不要在 memories 中存储 secrets。Codex 会从生成的 memory fields 中 redact secrets，但在共享 Codex home directory 或 generated memory artifacts 前，你仍应审查 memory files。

### Open Source

来源：[Open Source](/codex/open-source.md)

OpenAI 以开源方式开发 Codex 的关键部分。这些工作位于 GitHub 上，因此你可以关注进展、报告 issues 并贡献改进。

如果你维护一个被广泛使用的 open-source project，或想提名维护重要 projects 的 maintainers，也可以[申请 Codex for OSS program](/community/codex-for-oss)，以获取 API credits、带 Codex 的 ChatGPT Pro，以及 Codex Security 的选择性访问权限。

#### 开源组件

| 组件                        | 在哪里找到                                                                                        | 说明                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Codex CLI                   | [openai/codex](https://github.com/openai/codex)                                                   | Codex open-source development 的主要主页 |
| Codex SDK                   | [openai/codex/sdk](https://github.com/openai/codex/tree/main/sdk)                                 | SDK sources 位于 Codex repo 中        |
| Codex App Server            | [openai/codex/codex-rs/app-server](https://github.com/openai/codex/tree/main/codex-rs/app-server) | App-server sources 位于 Codex repo 中 |
| Skills                      | [openai/skills](https://github.com/openai/skills)                                                 | 扩展 Codex 的可复用 skills           |
| IDE extension               | -                                                                                                 | 非开源                                |
| Codex web                   | -                                                                                                 | 非开源                                |
| Universal cloud environment | [openai/codex-universal](https://github.com/openai/codex-universal)                               | Codex cloud 使用的基础环境            |

#### 在哪里报告 issues 和请求功能

使用 Codex GitHub repository 提交跨 Codex components 的 bug reports 和 feature requests：

- Bug reports and feature requests：[openai/codex/issues](https://github.com/openai/codex/issues)
- Discussion forum：[openai/codex/discussions](https://github.com/openai/codex/discussions)

提交 issue 时，请包含你正在使用的 component（CLI、SDK、IDE extension、Codex web），并尽可能包含版本。

### Permissions

来源：[Permissions](/codex/permissions.md)

#### Filesystem permissions

Filesystem entries 使用 `read`、`write` 或 `deny`：

| 访问    | 含义                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `read`  | 允许 commands 读取该 path 下的 files 和列出 directories。Commands 不能在其中创建、修改、重命名或删除 files。                  |
| `write` | 允许 commands 读取并修改该 path 下的 files，包括在 OS 允许时创建、重命名和删除 files。                                        |
| `deny`  | 拒绝该 path 下的读取和写入。可用于从更宽泛的 `read` 或 `write` grant 中划出一个被拒绝的 subpath。                             |

更具体的 entries 会覆盖更宽泛的 entries。当两个 entries 指向同一 path 时，`deny` 优先于 `write`，`write` 优先于 `read`。

这种优先级让 profile 可以先描述一个宽泛的 working area，然后划出应保持不可读的 files 或 directories：

```toml
[permissions.project-edit.filesystem]
":minimal" = "read"

[permissions.project-edit.filesystem.":workspace_roots"]
"." = "write"
".devcontainer" = "read"
"**/*.env" = "deny"
```

在此示例中，workspace root 保持可写，`.devcontainer/` 保持可读但不会变为可写，匹配的 environment files 仍然不可供 sandboxed commands 访问。

更具体的 path 也可以在更宽泛的 deny 内重新打开较窄的 subtree：

```toml
[permissions.project-edit.filesystem]
"~/Documents" = "deny"
"~/Documents/codex" = "write"
```

支持的 path forms：

| Path               | 含义                                                                                        | Scoped subpaths |
| ------------------ | ------------------------------------------------------------------------------------------- | --------------- |
| `:root`            | filesystem root                                                                             | 仅 `.`          |
| `:minimal`         | common tools 所需的 platform 和 runtime paths                                                | 仅 `.`          |
| `:workspace_roots` | 当前 session 的 workspace roots，加上任何已启用的 profile-defined workspace roots            | 是              |
| `:tmpdir`          | `$TMPDIR` location（如果可用）                                                              | 仅 `.`          |
| `:slash_tmp`       | `/tmp` folder（如果存在）                                                                   | 仅 `.`          |
| `/absolute/path`   | platform absolute path，例如 macOS/Linux/WSL 上的 `/path` 或 native Windows 上的 `C:\path` | 是              |
| `~/path`           | current user's home directory 下的 path                                                     | 是              |

在 native Windows 上，home-relative paths 也可以使用反斜杠，例如 `~\work`。

仅在 profile 有意需要宽泛 read coverage 时使用 `:root`：

```toml
[permissions.audit.filesystem]
":root" = "read"
```

使用 `:workspace_roots` 下的 nested entries，将访问范围限定到 workspace-root relative subpaths：

```toml
[permissions.project-edit.filesystem.":workspace_roots"]
"." = "write"          # each workspace root
"docs" = "read"        # each workspace-root docs directory
"generated" = "deny"   # each workspace-root generated directory
```

Nested subpaths 必须保持在其 workspace root 内。`../other-repo` 这样的 parent traversal 会被拒绝。

#### 使用 exact paths 或 globs 拒绝读取

对 Codex 不应读取的 files 或 subtrees 使用 `deny`，即使附近有更宽泛的 profile rule 授予了访问权限。Exact paths 适合稳定 locations，例如 `~/.ssh`。当 profile 需要覆盖一类位置会因 repository 而异的敏感 files 时，Glob patterns 更适合。

当 glob 位于 `:workspace_roots` 下时，Codex 会相对于每个 effective workspace root 解释它。例如：

```toml
[permissions.project-edit.filesystem.":workspace_roots"]
"**/*.env" = "deny"
```

此规则会拒绝读取在每个 runtime 或 profile-defined workspace root 下发现的匹配 `.env` files。当你希望保留正常 workspace writes，同时让 environment files、generated secrets 或类似 credential-bearing files 不可读时，请使用它。

`deny` glob patterns 支持作为 deny-read rules。`read` 或 `write` globs 在 Linux、WSL 和 native Windows sandboxing 上可移植性较差，因此请尽可能优先使用 exact paths 或 subtree rules，例如 `"docs/**" = "read"`。

在 Linux、WSL 和 native Windows 上，无界 `**` deny-read pattern 可能需要在 sandbox 启动前进行有界 pre-expansion。当你使用 `"**/*.env" = "deny"` 这类无界 pattern 时，请设置 `glob_scan_max_depth`：

```toml
[permissions.project-edit.filesystem]
glob_scan_max_depth = 3

[permissions.project-edit.filesystem.":workspace_roots"]
"**/*.env" = "deny"
```

`glob_scan_max_depth` 必须至少为 `1`。更高的值会在 sandbox startup 前扫描更深层级，这可能会增加 Linux、WSL 和 native Windows 上的启动工作量。如果你不想使用有界 expansion，请枚举显式深度，例如 `*.env`、`*/*.env` 和 `*/*/*.env`。

当相同规则应应用于当前 session root 之外的更多位置时，请将可复用 workspace roots 添加到 profile：

```toml
[permissions.project-edit.workspace_roots]
"~/code/app" = true
"~/code/shared-lib" = true
```

当此 profile 激活时，Codex 会将 `:workspace_roots` rules 应用于当前 session 的 runtime workspace roots，以及每个已启用的 profile-defined workspace root。

在 native Windows 上，支持 drive-letter paths（例如 `D:\work`）和 UNC paths（例如 `\\server\share`）作为 absolute paths。

#### Network permissions

设置 `enabled = true` 以允许所选 profile 进行 network access：

```toml
[permissions.project-edit.network]
enabled = true
```

启用 network access 后，Codex 默认使用 full network behavior。大多数 profiles 也应定义 domain rules：

```toml
[permissions.project-edit.network.domains]
"example.com" = "allow"      # exact host
"*.example.com" = "allow"    # subdomains only
"**.example.com" = "allow"   # apex and subdomains
"ads.example.com" = "deny"   # deny wins over allow
```

network sandbox proxy 默认绑定到 local listeners：

```toml
[permissions.project-edit.network]
enabled = true
proxy_url = "http://127.0.0.1:3128"
enable_socks5 = true
socks_url = "http://127.0.0.1:8081"
enable_socks5_udp = true
```

除非你正在集成特定 runtime，否则请保持这些 listener settings 为默认值。`dangerously_*` network keys 是面向 specialized environments 的 escape hatches，不应用于普通 local development。

#### Local and private networks

作为防御 DNS rebinding 和意外访问 local services 的措施，Codex 默认应用 local/private-network guard。若要有意允许 literal local target，请 allowlist 确切 host 或 IP literal：

```toml
[permissions.project-edit.network.domains]
"localhost" = "allow"
"127.0.0.1" = "allow"
```

仅当 profile 必须访问解析为 local 或 private addresses 的 allowlisted hostnames 时，才设置 `allow_local_binding = true`：

```toml
[permissions.project-edit.network]
enabled = true
allow_local_binding = true

[permissions.project-edit.network.domains]
"localhost" = "allow"
```

#### Unix sockets

Unix socket proxying 是用于 Docker 等工具的 local escape hatch。请谨慎使用：

```toml
[permissions.project-edit.network.unix_sockets]
"/var/run/docker.sock" = "allow"
"/tmp/old.sock" = "deny"
```

使用 `deny` 拒绝 socket path，包括 inherited allow entry。Denied socket paths 会从 effective allowlist 中省略。

启用 Unix sockets 时，请让 proxy listeners 绑定到 loopback addresses。

#### 从较旧 sandbox settings 迁移

当你希望一个可复用 profile 同时描述 filesystem 和 network behavior 时，Permission profiles 会替代较旧的 `sandbox_mode` 与 `sandbox_workspace_write` 组合。一个 session 请使用其中一种系统，而不是两者同时使用。

建议起点：

- 对于 read-only workflow，使用内置 `:read-only` profile，或定义一个只在需要位置授予 read access 的 custom profile。
- 对于 workspace editing，使用内置 `:workspace` profile，或定义一个通过 `:workspace_roots` 写入并只添加 workflow 所需额外 temp 或 cache paths 的 custom profile。
- 对于 unrestricted local execution，仅在你有意使用最宽泛 local access model 时使用 `:danger-full-access`。

Profiles 描述 session 的本地默认姿态。Organization-managed requirements 仍可添加 user configuration 不应放宽的限制。有关 admin-enforced filesystem 和 network constraints，请参阅 [Managed configuration](/codex/enterprise/managed-configuration)。

### Plugins

来源：[Plugins](/codex/plugins.md)

#### 概览

Plugins 将 skills、app integrations 和 MCP servers 打包成 Codex 的可复用 workflows。

扩展 Codex 可以做的事情，例如：

- 安装 Codex Security plugin，以扫描授权代码并确认 plausible vulnerability findings。
- 安装 Gmail plugin，让 Codex 读取和管理 Gmail。
- 安装 Google Drive plugin，以跨 Drive、Docs、Sheets 和 Slides 工作。
- 安装 Slack plugin，以总结 channels 或起草 replies。
- 安装 [Sites](/codex/sites)，以创建和部署 hosted websites、web apps 和 games。

一个 plugin 可以包含：

- **Skills：** 用于特定工作类型的可复用 instructions。Codex 可以在需要时加载它们，以便遵循正确步骤并使用正确 references 或 helper scripts 来完成任务。
- **Apps：** 连接到 GitHub、Slack 或 Google Drive 等工具，让 Codex 可以从这些工具读取信息并在其中执行 actions。
- **MCP servers：** 为 Codex 提供更多 tools 或 shared information 的 services，通常来自 local project 之外的系统。

你可以通过 marketplace source（例如 project 或 team 的 repo marketplace）发布 plugins 来共享它们。有关 marketplace setup、packaging 和 distribution guidance，请参阅 [Build plugins](/codex/plugins/build)。

#### 使用和安装 plugins

#### Codex app 中的 Plugin Directory

在 Codex app 中打开 **Plugins**，浏览并安装 curated plugins。

Plugin directory 将 plugins 分为以下 categories：

- **Curated by OpenAI：** 面向所有 Codex users 的 highlighted plugins。
- **Shared with you：** 由 ChatGPT workspace 中其他成员与你共享的 plugins。
- **Created by you：** 你创建或添加到自己 workspace 的 plugins。

#### CLI 中的 Plugin directory

在 Codex CLI 中，运行以下命令打开 plugins list：

```text
codex
/plugins
```

CLI plugin browser 会按 marketplace 对 plugins 分组。使用 marketplace tabs 切换 sources，打开 plugin 检查 details，安装或卸载 marketplace entries，并在已安装 plugin 上按 Space 切换其 enabled state。

#### 安装并使用 plugin

打开 plugin directory 后：

1. 搜索或浏览 plugin，然后打开其 details。
2. 选择 install button。在 app 中，选择 plus button 或 **Add to Codex**。在 CLI 中，选择 `Install plugin`。
3. 如果 plugin 需要 external app，请在提示时连接它。有些 plugins 会要求你在安装时 authenticate。其他 plugins 会等到你首次使用时再要求。
4. 安装后，启动一个新 thread，并要求 Codex 使用该 plugin。

安装 plugin 后，你可以直接在 prompt window 中使用它：

    Describe the task directly

      Ask for the outcome you want, such as "Summarize unread Gmail threads
      from today" or "Pull the latest launch notes from Google Drive."

      Use this when you want Codex to choose the right installed tools for the
      task.

    Choose a specific plugin

      Type @ to invoke the plugin or one of its bundled skills
      explicitly.

      Use this when you want to be specific about which plugin or skill Codex
      should use. See Codex app commands and
      Skills.

#### 权限和数据共享如何工作

安装 plugin 会让其 workflows 在 Codex 中可用，但你现有的 [approval settings](/codex/agent-approvals-security) 仍然适用。任何已连接 external services 仍受其自身 authentication、privacy 和 data-sharing policies 约束。

- Bundled skills 会在你安装 plugin 后立即可用。
- 如果 plugin 包含 apps，Codex 可能会在 setup 或你首次使用它们时，提示你在 ChatGPT 中安装这些 apps 或登录。
- 如果 plugin 包含 MCP servers，它们可能需要额外 setup 或 authentication 才能使用。
- 当 Codex 通过 bundled app 发送数据时，适用该 app 的 terms 和 privacy policy。

#### 移除或关闭 plugin

若要移除 plugin，请从 plugin browser 重新打开它并选择 **Uninstall plugin**。

卸载 plugin 会从 Codex 中移除 plugin bundle，但 bundled apps 会保持安装状态，直到你在 ChatGPT 中管理它们。

如果你想保留 plugin 已安装但将其关闭，请在 `~/.codex/config.toml` 中将其 entry 设置为 `enabled = false`，然后重启 Codex：

```toml
[plugins."gmail@openai-curated"]
enabled = false
```

#### 构建你自己的 plugin

如果你想创建、测试或分发自己的 plugin，请参阅 [Build plugins](/codex/plugins/build)。该页面覆盖 local scaffolding、manual marketplace setup、workspace sharing、plugin manifests 和 packaging guidance。

#### Plugin guides

- [Record & Replay](/codex/record-and-replay)：向 Codex 展示一次 workflow，并将其转换为可复用 skill。
- [Codex Security plugin quickstart](/codex/security/plugin)：安装 plugin、扫描授权代码并审查结果。

### Record & Replay

来源：[Record & Replay](/codex/record-and-replay.md)

Record & Replay 可在 macOS 上使用。初始可用范围不包括欧洲经济区、英国和瑞士。Computer Use 也必须可用且已启用。

Record & Replay 让你可以在 Mac 上演示一个 workflow，并将其转换为可复用 skill。当 workflow 具有重复性、依赖你的偏好，或相比在 prompt 中描述更适合演示时，请使用它。

例如，你可以录制如何报销费用、预订停车位、创建正确配置的 issue、发布视频或下载 recurring report。Codex 可以把该模式打包成一个 skill，你可以再次配合 Computer Use、browser actions、connected plugins 或它们的组合使用。

#### 开始前

选择一个你已经知道如何完成的 workflow。Record & Replay 在步骤稳定且成功标准清晰时效果最好。

#### 开始录制

1. 在 Codex app 中打开 **Plugins**。
2. 打开 **+** menu。
3. 选择 **Record a skill**。
4. 查看 suggested prompt，给 Codex 任何有用上下文，然后提交。
5. 当 Codex 请求记录你的 actions 的权限时，在你准备好演示 workflow 后批准该请求。
6. 在你的 Mac 上执行 workflow。
7. 完成后，从 menu bar、overlay 停止录制，或告诉 Codex 你已经完成。

录制期间，Codex 会观察学习该 workflow 所需的 actions 和 window content。录制会持续到你停止为止。请让录制聚焦于你希望 Codex 学会的任务。

停止录制后，Codex 会检查捕获的 workflow 并草拟一个 skill。该 skill 会说明何时使用该 workflow、它需要哪些 inputs、应遵循哪些 steps，以及如何验证结果。你也可以要求 Codex 进一步 refine 该 skill。

#### 重放 workflow

启动一个新 thread，并要求 Codex 使用生成的 skill。提供这次不同的 values，例如要上传的文件、要创建的 issue，或 report 的 date range。

Codex 会将该 skill 用作任务的可复用上下文。然后它可以使用当前环境中可用的 tools 完成 workflow，包括 Computer Use、browser actions 和 installed plugins。

#### 获取更好录制的技巧

- 保持演示简短且完整。
- 在开始录制前，让 Codex 知道你的目标，以及 skill 使用之间可能变化的任何 specific inputs。
- 使用 realistic inputs，但避免 secrets 和 sensitive data。
- 录制后 refine skill，指出重要的 hidden preferences，例如 naming conventions、field defaults 或 decision points。
- 在 workflow 完成时停止录制，而不是继续进行无关 cleanup。

#### 何时构建另一个 plugin

Record & Replay 是一种从已演示 workflow 创建 skill 的快速方式。如果你想跨 team 分发一个独立、稳定的 package，捆绑多个 skills，包含 app integrations，添加 MCP servers，或管理 install metadata，请将该 workflow 打包为自己的 plugin。请参阅 [Build plugins](/codex/plugins/build)。

#### 我看不到 Record & Replay

如果你的组织使用 `requirements.toml` 管理 Codex，则 `[features].computer_use` requirement 也会控制 Record & Replay。设置 `computer_use = false` 会使这两个功能都不可用。

### Remote connections

来源：[Remote connections](/codex/remote-connections.md)

import {
Desktop,
Storage,
Terminal,
} from "@components/react/oai/platform/ui/Icon.react";

Remote connections 让你可以从另一台设备或另一台机器使用 Codex。使用 ChatGPT mobile app 在已连接的 Mac 或 Windows 设备上使用 Codex，从另一台受支持的 Codex App 设备继续工作，或将 Codex App 连接到 SSH host 上的 projects。

Remote access 使用已连接 host 的 projects、threads、files、credentials、permissions、plugins、Computer Use、browser setup 和 local tools。

#### 你可以远程做什么

- 在 host 上的 projects 中启动新 threads，或继续现有 threads。
- 发送 follow-up instructions、回答问题并引导 active work。
- 批准 commands 和其他 actions。
- 审查 outputs、diffs、test results、terminal output 和 screenshots。
- 在 Codex 完成任务或需要你注意时收到通知。
- 在 connected hosts 和 threads 之间切换。

接下来的 sections 覆盖如何在 ChatGPT mobile app 中使用 Codex 来控制 Codex App host。若要将 Codex 连接到 SSH host 上的 project，请参阅[连接到 SSH host](#connect-to-an-ssh-host)。

#### 设置 mobile access 前

Codex mobile setup 支持 macOS 和 Windows 上的 Codex App hosts。你可以从 iOS 或 Android 上的 ChatGPT，或从运行 Codex 的 Mac，控制 Windows host。Windows 目前无法从 Codex App 控制另一台计算机。

请确保你具备：

- 要使用的 ChatGPT account 和 workspace 中的 Codex access。
- iOS 或 Android 设备上的最新版 ChatGPT mobile app。如果你在 ChatGPT mobile app 中看不到 Codex，请先更新 ChatGPT。
- 在一台 awake、online 且已登录同一 account 和 workspace 的 host 上运行的最新版 macOS 或 Windows Codex App。Mobile setup 从 Codex App 开始；你不能从 Codex CLI 或 IDE Extension 设置它。
- 该 account 或 workspace 所需的任何 multi-factor authentication、SSO 或 passkey configuration。

如果你通过 ChatGPT workspace 使用 Codex，你的 admin 可能需要先启用 Remote Control access，你才能从手机连接。

#### 设置 mobile access

从你想连接的 host 上的 Codex App 开始。设置流程会为该 host 启用 remote access，然后显示一个可从手机扫描的 QR code。该 QR code 会将该手机与该 host 配对。请将每部手机或受支持的 Codex App 设备与每台你希望其控制的 host 配对。

自 2026 年 6 月 8 日以来使用过的现有 connections 会保持配对。如果你自 2026 年 6 月 8 日以来没有使用过某个现有 connection，请更新两个 apps 并重新配对 devices。

1. 启动 Codex mobile setup。

   在 host 上打开 Codex，并在 sidebar 中选择 **Set up Codex mobile**。

2. 扫描 QR code。

   使用手机扫描 Codex 显示的 QR code。该 code 会打开 ChatGPT，以便你完成 mobile app 与 host 的连接。

3. 在 ChatGPT 中完成设置。

   ChatGPT 会打开 Codex mobile setup flow。确认同一个 ChatGPT account 和 workspace，然后完成任何所需的 multi-factor authentication、SSO 或 passkey steps。设置成功后，host 会出现在你手机上的 Codex 中。

4. 审查 host settings。

   在 host 上的 Codex 中，使用 **Settings > Connections** 管理 connected devices。你也可以选择是否保持计算机唤醒、启用 Computer Use，或安装 Chrome extension。

#### 选择要连接的内容

从你日常已经使用 Codex 的 laptop 或 desktop 开始。需要持续访问或不同环境时，添加一台 always-on computer 或 SSH host。

#### 你的 laptop 或 desktop

连接你日常已经运行 Codex 的 Mac 或 Windows PC。这会提供对同一 projects、threads、credentials、plugins 和 local setup 的 remote access。

如果该计算机进入 sleep、失去 network access 或关闭 Codex，remote access 会停止，直到它再次可用。如果你将此计算机用作 host device，请保持其接通电源，并在可用时使用 host 的 connection settings 让它保持 awake。

在 Mac laptop 上，remote access 可以在 lid open 且连接电源时保持可用。盖上 lid 时，还要连接 external display。选择 **Sleep** 仍会停止 remote access。

在 Windows host 上，对于使用 [Computer Use](/codex/app/computer-use) 的任务，请保持 session unlocked 且可用。Windows 上的 Computer Use 在 foreground 运行，因此 remote control 最适合在你将 host desktop 专用于任务时启动或检查工作。

#### 专用 always-on computer

当你希望 Codex 在较长时间运行的工作中保持可访问时，请使用专用 always-on Mac 或 Windows PC。

在该机器上安装 Codex 应使用的 projects、credentials、plugins、MCP servers 和 tools。

#### 远程开发环境

当 project 已经位于 remote environment 中时，请使用 SSH host 或 managed remote development environment。先将 Codex App host 连接到该 environment；你的手机仍连接到 Codex App host，而 Codex 会在 remote environment 中使用其 dependencies、security policies 和 compute resources 工作。

有关 SSH 设置详情，请参阅[连接到 SSH host](#connect-to-an-ssh-host)。

对于 always-on computer 或 remote host 上的 browser 或 desktop tasks，请在该 host 上启用 Computer Use 并安装 Chrome extension。

#### 来自 connected host 的内容

你的手机会向 Codex 发送 prompts、approvals 和 follow-up messages。Connected host 提供 Codex 使用的 environment。

这意味着：

- Repository files 和 local documents 来自 connected host。
- Shell commands 在该 host 或 remote environment 上运行。
- 当你远程使用 Codex 时，该 host 上安装的任何 plugin 都可用。
- MCP servers、skills、browser access 和 Computer Use 来自该 host 的 configuration。
- Signed-in websites 和 desktop apps 仅在 host 可以访问它们时可用。
- Sandboxing settings、security controls 和 action approvals 仍适用于 connected session。

Codex 使用 secure relay layer，让 trusted machines 能够跨你授权的 ChatGPT devices 保持可访问，而无需将它们直接暴露到 public internet。

#### 从另一台设备接续工作

你可以从另一台支持 remote control 的已登录 Codex App 设备继续工作。例如，如果你的 laptop 不可用，你可以从手机在 always-on host 上启动 thread，然后稍后在 laptop 上打开 Codex 并在那里继续同一个 thread。

在 Mac 上的 Codex 中，使用 **Settings > Connections > Control other devices** 添加另一台 host。一台 device 可以同时允许 remote access 并控制另一台 device。你可以从 Mac 或 iOS/Android 上的 ChatGPT 控制 Windows hosts，但不能使用 Windows 控制另一台计算机。例如，你可以从 Mac 或手机控制 Windows device，但不能使用 Windows device 控制另一台 Windows device。

#### 连接到 SSH host

在 Codex App 中，从 SSH host 添加 remote projects，并针对 remote filesystem 和 shell 运行 threads。Remote project threads 会在 remote host 上运行 commands、读取 files 并写入 changes。

保持 remote host 按照你用于普通 SSH access 的同样安全期望进行配置：trusted keys、least-privilege accounts，且没有 unauthenticated public listeners。

1. 将 host 添加到你的 SSH config 中，以便 Codex 可以 auto-discover 它。

   ```text
   Host devbox
     HostName devbox.example.com
     User you
     IdentityFile ~/.ssh/id_ed25519
   ```

   Codex 会从 `~/.ssh/config` 读取 concrete host aliases，用 OpenSSH 解析它们，并忽略 pattern-only hosts。

2. 确认你可以从运行 Codex App 的机器 SSH 到该 host。

   ```bash
   ssh devbox
   ```

3. 在 remote host 上安装并 authenticate Codex。

   App 会通过 SSH 启动 remote Codex app server，使用 remote user's login shell。请确保 `codex` command 在该 shell 中可通过 remote host 的 `PATH` 使用。

4. 在 Codex App 中，打开 **Settings > Connections**，添加或启用 SSH host，然后选择 remote project folder。

### Sites

来源：[Sites](/codex/sites.md)

Sites 让 Codex 可以创建、保存、部署和检查由 OpenAI 托管的 websites、web apps 和 games。当你想把 prompt 或兼容的现有 project 转换为 hosted site，而不设置单独 deployment workflow 时，请使用 **Sites** plugin。

每个 Sites deployment URL 都是 production deployment。如果你想在 build 变为 live 前审查它，请要求 Codex 保存一个 version，而不部署它。

#### 理解 projects、versions 和 deployments

Sites project 会把 local source project 链接到通过 Sites 管理的 hosting。Codex 会把该 linkage 和可选 storage binding names 存储在 `.openai/hosting.json` 中。新创建的 local starter 可以在没有 `project_id` 的情况下开始；Sites 在 provision hosted project 后会添加一个。

例如，一个使用 relational database binding 且没有 file storage 的 provisioned site 可以包含：

```json
{
  "project_id": "",
  "d1": "DB",
  "r2": null
}
```

Sites publishing 有两个独立阶段：

1. **保存 version。** Codex 会构建可部署的 site，并将该 version 与用于 build 的 source Git commit 关联。若你需要一个可审查的 deployment candidate，请使用此阶段。
2. **部署 version。** Codex 发布已保存的 version，并在 deployment 成功时报告 production URL。仅当你希望选定 audience 访问该 site 时才使用此阶段。

当你需要识别之前的 deployment candidate 时，请要求 Codex 列出或检查 saved versions。

#### 选择受支持的 site 形态

Sites 托管 build 会生成 Cloudflare Worker-compatible output（以 ES modules 形式）的 projects。对于新 projects，Sites workflow 可以从其推荐的 site starter 开始。对于现有 site，请在请求 deployment 前，要求 Codex 确认该 project 的 build 可以生成兼容的 deployment artifacts。

告诉 Codex 你需要的 product behavior，以便它选择合适的 site shape：

| Site need                                                      | 要向 Sites 请求什么                                                           |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Content-led website or landing page                            | 除非体验需要，否则不带持久 application state 的 site                          |
| Saved records, user progress, or game scores                   | D1，用于 durable structured data 的 relational database                        |
| Images, documents, audio, video, or other uploads              | R2，用于 files 的 object storage                                               |
| Uploaded files with searchable metadata                        | D1 用于 metadata，R2 用于 file contents                                        |
| Internal site that needs the current workspace user's identity | Workspace-authenticated user identity                                          |
| Public sign-in or an external identity provider                | 启用 authentication 的 Sites project                                           |

不要为 temporary presentation state（例如 theme choice 或 dismissed banner）请求 durable storage。对于人们期望 hosted site 记住的 product data，则应请求它。

#### 控制访问和 secrets

在共享 deployed URL 前设置 audience。对于新 site，请在你审查 content、data handling 和 expected audience 之前，将访问限制为 owner 和 workspace admins。

你可以要求 Sites 应用以下 access modes 之一：

| Access mode                      | 谁可以访问该 site                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| Owner and admins (`admins_only`) | site owner 和 workspace admins                                                                |
| Workspace (`workspace_all`)      | workspace 中的所有 active users                                                               |
| Custom (`custom`)                | 你选择的特定 active users 或 workspace groups；Sites 会继续允许 owner                         |

例如：

```text
@Sites Change this deployed site's access to everyone in my workspace after
showing me the current site and confirming the deployment URL.
```

#### 配置 runtime environment values

在 app sidebar 中打开 **Sites**，并选择一个 project，以在 Sites panel 中添加、更新或移除 hosted environment variables 和 secrets。不要把这些 values 存储在 `.openai/hosting.json` 中。请保持 local `.env` 和 `.env.example` files 与 local development 所需的 keys 一致，并且不要提交 secret values。

当你添加、更新或移除 hosted environment values 时，请要求 Codex 重新部署已批准的 saved version，以便下一次 deployment 使用更新后的 configuration。

#### 分享前审查

在部署或扩大访问范围前：

- 在 Codex [review pane](/codex/app/review) 中审查 source changes 和任何 database migrations。
- 确认 build 已成功，并且选定的 saved version 是你打算发布的 version。
- 检查只有预期 audience 可以访问该 site。
- 确认你已通过 Sites 配置 runtime secret values，并且没有把它们提交到 source files 中。
- 部署后，在共享前要求 Codex 确认 deployment status 和 production URL。

#### 相关文档

- [Plugins](/codex/plugins) 解释如何安装和调用 Codex plugins。
- [Codex app](/codex/app) 介绍 app navigation 和 project threads。
- [Review and ship changes](/codex/app/review) 解释如何在发布前检查 source changes。

### Subagents

来源：[Subagents](/codex/subagents.md)

Codex 可以通过并行生成 specialized agents 并随后在一个 response 中收集其结果，来运行 subagent workflows。这对于高度并行的复杂任务尤其有帮助，例如 codebase exploration 或实现 multi-step feature plan。

借助 subagent workflows，你也可以根据任务定义自己的 custom agents，为其配置不同 model configurations 和 instructions。

有关 subagent workflows 背后的 concepts 和 tradeoffs，包括 context pollution、context rot 和 model-selection guidance，请参阅 [Subagent concepts](/codex/concepts/subagents)。

#### 可用性

当前 Codex releases 默认启用 subagent workflows。

Subagent activity 目前会在 Codex app 和 CLI 中显示。IDE Extension 中的 visibility 即将推出。

Codex 只会在你明确要求时生成 subagents。由于每个 subagent 都会执行自己的 model 和 tool work，subagent workflows 会比类似的 single-agent runs 消耗更多 tokens。

#### 典型工作流

Codex 处理 agents 之间的 orchestration，包括生成 new subagents、路由 follow-up instructions、等待结果，以及关闭 agent threads。

当许多 agents 正在运行时，Codex 会等待所有请求结果可用，然后返回 consolidated response。

Codex 只会在你明确要求时生成 new agent。

若要查看实际效果，请在你的 project 上尝试以下 prompt：

```text
I would like to review the following points on the current PR (this branch vs main). Spawn one agent per point, wait for all of them, and summarize the result for each point.
1. Security issue
2. Code quality
3. Bugs
4. Race
5. Test flakiness
6. Maintainability of the code
```

#### 管理 subagents

- 在 CLI 中使用 `/agent`，在 active agent threads 之间切换并检查 ongoing thread。
- 直接要求 Codex 引导 running subagent、停止它，或关闭已完成的 agent threads。

#### Approvals 和 sandbox controls

Subagents 会继承你当前的 sandbox policy。

在 interactive CLI sessions 中，approval requests 可以来自 inactive agent threads，即使你正在查看 main thread。Approval overlay 会显示 source thread label，你可以在 approve、reject 或回答 request 前按 `o` 打开该 thread。

在 non-interactive flows 中，或每当 run 无法显示 fresh approval 时，需要新 approval 的 action 会失败，Codex 会将 error 返回给 parent workflow。

Codex 在生成 child 时，也会重新应用 parent turn 的 live runtime overrides。这包括你在 session 期间交互式设置的 sandbox 和 approval choices，例如 `/permissions` changes 或 `--yolo`，即使所选 custom agent file 设置了不同 defaults。

你也可以覆盖单个 [custom agents](#custom-agents) 的 sandbox configuration，例如明确标记某个 agent 以 read-only mode 工作。

#### Custom agents

Codex 随附内置 agents：

- `default`：通用 fallback agent。
- `worker`：专注 execution 的 agent，用于 implementation 和 fixes。
- `explorer`：偏重读取的 codebase exploration agent。

若要定义自己的 custom agents，请在 `~/.codex/agents/` 下添加 standalone TOML files 用于 personal agents，或在 `.codex/agents/` 下添加用于 project-scoped agents。

每个文件定义一个 custom agent。Codex 会将这些文件作为 spawned sessions 的 configuration layers 加载，因此 custom agents 可以覆盖与普通 Codex session config 相同的 settings。这可能比专用 agent manifest 感觉更重，且 format 可能会随着 authoring 和 sharing 成熟而演进。

每个 standalone custom agent file 必须定义：

- `name`
- `description`
- `developer_instructions`

当你省略可选字段（例如 `nickname_candidates`、`model`、`model_reasoning_effort`、`sandbox_mode`、`mcp_servers` 和 `skills.config`）时，它们会从 parent session 继承。

#### Global settings

Global subagent settings 仍位于 [configuration](/codex/config-basic#configuration-precedence) 的 `[agents]` 下。

| Field                            | Type   | Required | Purpose                                                    |
| -------------------------------- | ------ | :------: | ---------------------------------------------------------- |
| `agents.max_threads`             | number |    No    | Concurrent open agent thread cap.                          |
| `agents.max_depth`               | number |    No    | Spawned agent nesting depth (root session starts at 0).    |
| `agents.job_max_runtime_seconds` | number |    No    | Default timeout per worker for `spawn_agents_on_csv` jobs. |

**说明：**

- 当你未设置 `agents.max_threads` 时，它默认为 `6`。
- `agents.max_depth` 默认为 `1`，这允许 direct child agent 生成，但防止更深层嵌套。除非你确实需要 recursive delegation，否则请保留默认值。提高该值可能会把宽泛的 delegation instructions 转化为重复 fan-out，从而增加 token usage、latency 和 local resource consumption。`agents.max_threads` 仍会限制 concurrent open threads，但它不会消除更深递归带来的成本和可预测性风险。
- `agents.job_max_runtime_seconds` 是可选项。当你未设置它时，`spawn_agents_on_csv` 会回退到每个 worker 1800 秒的 per-call default timeout。
- 如果 custom agent name 与内置 agent（例如 `explorer`）匹配，你的 custom agent 优先。

#### Custom agent file schema

| Field                    | Type     | Required | Purpose                                                         |
| ------------------------ | -------- | :------: | --------------------------------------------------------------- |
| `name`                   | string   |   Yes    | Agent name Codex uses when spawning or referring to this agent. |
| `description`            | string   |   Yes    | Human-facing guidance for when Codex should use this agent.     |
| `developer_instructions` | string   |   Yes    | Core instructions that define the agent's behavior.             |
| `nickname_candidates`    | string[] |    No    | Optional pool of display nicknames for spawned agents.          |

你也可以在 custom agent file 中包含其他受支持的 `config.toml` keys，例如 `model`、`model_reasoning_effort`、`sandbox_mode`、`mcp_servers` 和 `skills.config`。

Codex 通过其 `name` 字段识别 custom agent。让 filename 与 agent name 匹配是最简单的约定，但 `name` 字段才是 source of truth。

#### Display nicknames

当你希望 Codex 为 spawned agents 分配更易读的 display names 时，请使用 `nickname_candidates`。当你运行同一 custom agent 的许多 instances，并希望 UI 显示不同 labels 而不是重复同一个 agent name 时，这尤其有用。

Nicknames 仅用于展示。Codex 仍通过其 `name` 识别并生成 agent。

Nickname candidates 必须是唯一 names 的非空列表。每个 nickname 可以使用 ASCII letters、digits、spaces、hyphens 和 underscores。

示例：

```toml
name = "reviewer"
description = "PR reviewer focused on correctness, security, and missing tests."
developer_instructions = """
Review code like an owner.
Prioritize correctness, security, behavior regressions, and missing test coverage.
"""
nickname_candidates = ["Atlas", "Delta", "Echo"]
```

实际使用中，Codex app 和 CLI 可以在显示 agent activity 的位置显示这些 nicknames，而底层 agent type 保持为 `reviewer`。

#### Example custom agents

最好的 custom agents 范围狭窄且有明确取向。给每个 agent 一个清晰的 job、与该 job 匹配的 tool surface，以及防止它漂移到相邻工作的 instructions。

### Use Codex with Amazon Bedrock

来源：[Use Codex with Amazon Bedrock](/codex/amazon-bedrock.md)

配置 Codex 使用通过 Amazon Bedrock 提供的 OpenAI models。在此设置中，Codex 在本地运行，并使用 AWS-managed authentication 和 access controls 将 model requests 发送到 Bedrock。

#### 工作方式

当你将 Codex 配置为使用 Amazon Bedrock 作为 model provider 时，OpenAI-hosted Responses API 不在 request path 中。Codex 会将 model requests 发送到 Amazon Bedrock，而 Bedrock 为受支持的 OpenAI models 提供 OpenAI-compatible Responses API implementation。

Authentication 是 AWS-native 的。Users 使用 Bedrock API key 或 AWS IAM credentials 进行 authentication。对于此 provider，他们不使用 ChatGPT sign-in 或 `OPENAI_API_KEY`。

#### 开始前

请确保你具备：

- 对 Amazon Bedrock 中受支持 OpenAI models 的访问权限。
- 所选 model 可用的 AWS Region。
- 为 AWS account 配置好的 Amazon Bedrock Mantle path authentication。

#### 配置 Codex

将 Amazon Bedrock Mantle path 的 `amazon-bedrock` model provider 添加到 `~/.codex/config.toml`。提供 model 是可选的。需要时请明确选择受支持的 model。

```toml
model_provider = "amazon-bedrock"
```

本指南覆盖受支持 commercial AWS Regions 中的 Amazon Bedrock Mantle path。Codex 不支持 AWS GovCloud Regions 中的 Bedrock Mantle endpoints。

#### Authentication options

Codex 支持两种 Bedrock authentication paths。它按以下顺序检查：

1. Bedrock API key。
2. AWS SDK credential chain。

#### 选项 1：Bedrock API key

在 Codex 读取的环境中设置 Bedrock API key。使用 API-key authentication 时必须指定 Region。

```shell
export AWS_BEARER_TOKEN_BEDROCK=
export AWS_REGION=us-east-2
```

#### 选项 2：AWS SDK credentials

当你的组织通过 AWS SDK credential chain 管理 Bedrock access 时，请使用此路径。Codex 可以使用这些标准 AWS SDK credential sources：

1. Shared AWS `config` 和 `credentials` files。

   ```shell
   aws configure
   ```

2. Environment variables。

   ```shell
   export AWS_ACCESS_KEY_ID=
   export AWS_SECRET_ACCESS_KEY=
   export AWS_SESSION_TOKEN=
   ```

3. AWS Management Console credentials。

   ```shell
   aws login
   ```

4. AWS SSO 或 named profile。

   ```shell
   aws sso login --profile codex-bedrock
   export AWS_PROFILE=codex-bedrock
   ```

5. 使用 `credential_process` 配置的 federated identity。对于 corporate SSO 或 OIDC federation，请在 Codex 之外配置 AWS profile，并让 AWS SDK 解析 credentials。把 browser login、token exchange、caching 和 refresh 放入 AWS profile 的 `credential_process` helper。

#### Desktop app 和 VS Code extension

Desktop apps 和 IDE extensions 可能不会继承 shell 中的 environment variables。请将所需 values 放入 `~/.codex/.env`，然后重启 app 或 extension。

```shell
export AWS_BEARER_TOKEN_BEDROCK=
export AWS_REGION=us-east-2
```

#### 验证设置

- 在 Codex CLI 中，打开 `/status` 并确认 Codex 正在使用 `amazon-bedrock` model provider。
- 在 desktop app 或 VS Code extension 中，重启 app 后启动一个新 session。
- 确认所选 model 在已配置 AWS Region 中可用，并且 AWS identity 有权访问它。

#### 支持的 models

使用精确 model IDs：

```text
openai.gpt-5.5
openai.gpt-5.4
```

Model availability 因 AWS Region 而异。选择 model 前，请参阅 [model support by AWS Region](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html)。

#### Feature availability

此配置支持本地 Codex workflows。一些依赖 OpenAI-hosted cloud services、hosted tools 或 cloud-managed discovery 的 features 目前不可用。

Fast Mode 不适用于 Amazon Bedrock。Fast Mode 使用 priority processing，而 Amazon Bedrock 初始 offering 仅支持 on-demand inference。

#### 详细 feature availability

- Feature 目前仅限于特定 regions。请查看各个 feature documentation，了解更多 geo restrictions。

  † 当 local plugin bundles 的 capabilities 不需要 ChatGPT authentication 时，支持它们。OpenAI-curated plugin discovery 以及依赖 app connectors 或 cloud-hosted sharing 的 features 不可用。

### Windows platform

来源：[Windows](/codex/windows.md)

在 Windows 上使用 Codex，可选择 native [Codex app](/codex/app/windows)、[CLI](/codex/cli) 或 [IDE extension](/codex/ide)。

Windows 上的 Codex app 支持核心 workflows，例如 parallel agent threads、worktrees、automations、Git functionality、in-app browser、artifact previews、plugins 和 skills。

根据 surface 和你的设置，Codex 可以通过三种实用方式在 Windows 上运行：

- 在 Windows 上原生运行，并使用更强的 `elevated` sandbox；
- 在 Windows 上原生运行，并使用 fallback `unelevated` sandbox；
- 或在 [Windows Subsystem for Linux 2](https://learn.microsoft.com/en-us/windows/wsl/install) (WSL2) 内运行，该方式使用 Linux sandbox implementation。

#### Windows sandbox

当你在 Windows 上原生运行 Codex 时，agent mode 会使用 Windows sandbox 来阻止 working folder 外的 filesystem writes，并在未经你明确批准的情况下防止 network access。

Native Windows sandbox support 包含两种可在 `config.toml` 中配置的模式：

```toml
[windows]
sandbox = "elevated" # or "unelevated"
```

`elevated` 是首选 native Windows sandbox。它使用专用 lower-privilege sandbox users、filesystem permission boundaries、firewall rules，以及 sandbox 中运行的 commands 所需的 local policy changes。

`unelevated` 是 fallback native Windows sandbox。它使用从当前用户派生的 restricted Windows token 运行 commands，应用基于 ACL 的 filesystem boundaries，并使用 environment-level offline controls，而不是专用 offline-user firewall rule。它比 `elevated` 弱，但当 administrator-approved setup 被 local 或 enterprise policy 阻止时仍然有用。

如果两种模式都可用，请使用 `elevated`。如果默认 native sandbox 在你的环境中无法工作，请在排查设置问题时使用 `unelevated` 作为 fallback。

Enterprise administrators 可以通过 [`requirements.toml`](/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml) 约束 Codex 可以使用哪些 native sandbox implementations：

```toml
[windows]
allowed_sandbox_implementations = ["elevated"]
```

此示例要求使用 `elevated` sandbox，并防止 users fallback 到 `unelevated`。若要允许任一 implementation，请包含两个 values；未选择模式时，Codex 偏好 `elevated`。有关支持的 values，请参阅 [`requirements.toml` reference](/codex/config-reference#requirementstoml)。

默认情况下，两种 sandbox modes 也会使用 private desktop，以获得更强 UI isolation。仅当你因兼容性需要较旧的 `Winsta0\\Default` behavior 时，才设置 `windows.sandbox_private_desktop = false`。

#### Sandbox permissions

以 full access mode 运行 Codex 意味着 Codex 不限于你的 project directory，并且可能执行无意的 destructive actions，导致 data loss。为了更安全的 automation，请保持 sandbox boundaries，并对特定 exceptions 使用 [rules](/codex/rules)，或将你的 [approval policy 设置为 never](/codex/agent-approvals-security#run-without-approval-prompts)，让 Codex 在不请求 escalated permissions 的情况下尝试解决问题，这取决于你的 [approval and security setup](/codex/agent-approvals-security)。

#### Windows version matrix

| Windows version                  | Support level   | Notes                                                                                                                                                                                 |
| -------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows 11                       | Recommended     | Codex on Windows 的最佳基线。如果你正在标准化 enterprise deployment，请使用它。                                                                                                      |
| Recent, fully updated Windows 10 | Best effort     | 可以工作，但不如 Windows 11 可靠。对于 Windows 10，Codex 依赖 modern console support，包括 ConPTY。实际使用中，需要 Windows 10 version 1809 或更高版本。                             |
| Older Windows 10 builds          | Not recommended | 更可能缺少所需 console components（例如 ConPTY），也更可能在 enterprise setups 中失败。                                                                                              |

Additional environment assumptions：

- `winget` 应可用。如果缺失，请在设置 Codex 前更新 Windows 或安装 Windows Package Manager。
- 推荐的 native sandbox 依赖 administrator-approved setup。
- 一些 enterprise-managed devices 会阻止所需 setup steps，即使 OS version 本身是可接受的。

#### 授予 sandbox read access

当 command 因 Windows sandbox 无法读取某个 directory 而失败时，使用：

```text
/sandbox-add-read-dir C:\absolute\directory\path
```

该 path 必须是现有 absolute directory。命令成功后，后续在 sandbox 中运行的 commands 可以在当前 session 期间读取该 directory。

默认使用 native Windows sandbox。Native Windows sandbox 在保持同等安全性的同时提供最佳性能和最高速度。当你需要 Windows 上的 Linux-native environment、你的 workflow 已经位于 WSL2 中，或两种 native Windows sandbox modes 都无法满足需求时，请选择 WSL2。

#### Windows Subsystem for Linux

如果你选择 WSL2，Codex 会在 Linux environment 内运行，而不是使用 native Windows sandbox。如果你需要 Windows 上的 Linux-native tooling、你的 repositories 和 developer workflow 已经位于 WSL2 中，或两种 native Windows sandbox modes 都不适合你的环境，这会很有用。

Codex `0.114` 之前支持 WSL1。从 Codex `0.115` 开始，Linux sandbox 迁移到 `bubblewrap`，因此不再支持 WSL1。

#### 从 WSL 内启动 VS Code

有关分步说明，请参阅 [official VS Code WSL tutorial](https://code.visualstudio.com/docs/remote/wsl-tutorial)。

#### 前提条件

- 已安装 WSL 的 Windows。若要安装 WSL，请以 administrator 身份打开 PowerShell，然后运行 `wsl --install`（Ubuntu 是常见选择）。
- 已安装 [WSL extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) 的 VS Code。

#### 从 WSL terminal 打开 VS Code

```bash
# From your WSL shell
cd ~/code/your-project
code .
```

这会打开一个 WSL remote window，在需要时安装 VS Code Server，并确保 integrated terminals 在 Linux 中运行。

#### 确认你已连接到 WSL

- 查找显示 `WSL: ` 的绿色 status bar。
- Integrated terminals 应显示 Linux paths（例如 `/home/...`），而不是 `C:\`。
- 你可以用以下命令验证：

  ```bash
  echo $WSL_DISTRO_NAME
  ```

  这会打印你的 distribution name。

如果 status bar 中没有看到 "WSL: ..."，请按 `Ctrl+Shift+P`，选择 `WSL: Reopen Folder in WSL`，并将 repository 保持在 `/home/...` 下（不是 `C:\`），以获得最佳性能。

如果 Windows app 或 project picker 未显示你的 WSL repository，请在 file picker 或 Explorer 中输入 \\wsl$，然后导航到你的 distro 的 home directory。

#### 在 WSL 中使用 Codex CLI

从 elevated PowerShell 或 Windows Terminal 运行这些 commands：

```powershell
# Install default Linux distribution (like Ubuntu)
wsl --install

# Start a shell inside Windows Subsystem for Linux
wsl
```

然后从你的 WSL shell 运行这些 commands：

```bash
# Install and run Codex in WSL
curl -fsSL https://chatgpt.com/codex/install.sh | sh
codex
```

#### 在 WSL 内处理代码

- 在 /mnt/c/... 这类 Windows-mounted paths 中工作，可能比在 Windows-native paths 中工作更慢。请把 repositories 放在你的 Linux home directory 下（例如 ~/code/my-app），以获得更快 I/O，并减少 symlink 和 permission issues：
  ```bash
  mkdir -p ~/code && cd ~/code
  git clone https://github.com/your/repo.git
  cd repo
  ```
- 如果你需要从 Windows 访问 files，它们位于 Explorer 中的 \\wsl$\Ubuntu\home\&lt;user&gt; 下。
