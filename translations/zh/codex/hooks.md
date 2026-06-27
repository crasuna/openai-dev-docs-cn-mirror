---
status: needs-review
sourceId: "0000d1822441"
sourceChecksum: "0000d1822441adbaae7a4193bce2bb8abc9fca44afa59e91cd6cc86d5a406eb1"
sourceUrl: "https://developers.openai.com/codex/hooks"
translatedAt: "2026-06-27T19:05:47.1891485+08:00"
translator: codex-gpt-5.5-xhigh
---

# Hooks

Hooks 是 Codex 的扩展性框架。它们允许你将自己的 scripts 注入 agentic loop，从而启用如下功能：

- 将对话发送到自定义 logging/analytics engine
- 扫描团队 prompts，阻止意外粘贴 API keys
- 总结对话以自动创建持久 memories
- 在 conversation turn 停止时运行自定义 validation check，以强制执行标准
- 在某个目录中自定义 prompting

Hooks 默认启用。如果你需要在 `config.toml` 中关闭它们，请设置：

```toml
[features]
hooks = false
```

请使用 `hooks` 作为规范 feature key。`codex_hooks` 仍作为已弃用别名可用。

Admins 也可以在 `requirements.toml` 中用同样方式通过 `[features].hooks = false` 强制关闭 hooks。

需要牢记的运行时行为：

- 来自多个文件的匹配 hooks 都会运行。
- 同一 event 的多个匹配 command hooks 会并发启动，因此一个 hook 无法阻止另一个匹配 hook 启动。
- 非托管 command hooks 必须先被 review 并 trusted，然后才能运行。
- `PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`UserPromptSubmit`、`SubagentStop` 和 `Stop` 在 turn scope 运行。`SessionStart` 和 `SubagentStart` 在 thread 或 subagent-start scope 运行。

## Codex 在哪里查找 hooks

Codex 会在 active config layers 旁边，以以下任一形式发现 hooks：

- `hooks.json`
- `config.toml` 中的 inline `[hooks]` tables

已安装的 plugins 也可以通过其 plugin manifest 或默认的 `hooks/hooks.json` 文件捆绑 lifecycle config。Plugin 打包规则请参见[构建 plugins](https://developers.openai.com/codex/plugins/build#bundled-mcp-servers-and-lifecycle-hooks)。

实践中，四个最有用的位置是：

- `~/.codex/hooks.json`
- `~/.codex/config.toml`
- `<repo>/.codex/hooks.json`
- `<repo>/.codex/config.toml`

如果存在多个 hook source，Codex 会加载所有匹配 hooks。更高优先级的 config layers 不会替换更低优先级的 hooks。如果单个 layer 同时包含 `hooks.json` 和 inline `[hooks]`，Codex 会合并它们并在启动时警告。每个 layer 建议只使用一种表示方式。

Codex 也可以发现 enabled plugins 捆绑的 hooks。Plugin-bundled hooks 会与其他 hook sources 一起加载，并使用与其他非托管 hooks 相同的 trust-review flow。

Project-local hooks 只会在项目 `.codex/` layer 受信任时加载。在不受信任的项目中，Codex 仍会从各自 active config layers 加载 user 和 system hooks。

## Review 和信任 hooks

Codex 会先列出已配置 hooks，再决定哪些可以运行。在非托管 command hook 可以运行之前，Codex 要求你 review 并 trust 精确的 hook definition。Codex 会根据 hook 当前 hash 记录 trust，因此新的或已更改的 hooks 会被标记为需要 review，并在被信任前跳过。

在 CLI 中使用 `/hooks` 可以检查 hook sources、review 新的或已更改的 hooks、信任 hooks，或禁用单个非托管 hooks。如果启动时 hooks 需要 review，Codex 会打印一条 warning，提示你打开 `/hooks`。

来自 system、MDM、cloud 或 `requirements.toml` sources 的 managed hooks 会被标记为 managed、按策略 trusted，并且无法从用户 hook browser 中禁用。

对于已经在 Codex 外部审查 hook sources 的一次性自动化，可以传递 `--dangerously-bypass-hook-trust`，让 enabled hooks 在该调用中运行，而不要求持久化 hook trust。

## 配置形状

Hooks 分为三个层级：

- 一个 hook event，例如 `PreToolUse`、`PostToolUse`、`PreCompact`、`SubagentStart` 或 `Stop`
- 一个 matcher group，决定该 event 何时匹配
- 一个或多个 hook handlers，在 matcher group 匹配时运行

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
- `statusMessage` 是可选的。
- `commandWindows` 是可选的、仅限 Windows 的 command override。在 TOML 中，使用 `command_windows` 或 `commandWindows`。
- `async` 会被解析，但 async command hooks 尚不受支持。Codex 会跳过带有 `async: true` 的 handlers。
- 目前只有 `type: "command"` handlers 会运行。`prompt` 和 `agent` handlers 会被解析，但会跳过。
- Commands 会以 session `cwd` 作为其工作目录运行。
- 对于 repo-local hooks，建议从 git root 解析，而不是使用 `.codex/hooks/...` 这样的相对路径。Codex 可能从子目录启动，基于 git root 的路径能保持 hook 位置稳定。

`config.toml` 中的等效 inline TOML：

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

## 来自 `requirements.toml` 的 managed hooks

Enterprise-managed requirements 也可以在 `[hooks]` 下 inline 定义 hooks。当 admins 希望强制执行 hook configuration，同时通过 MDM 或其他 device-management system 分发实际 scripts 时，这很有用。若要即使在用户本地禁用 hooks 时也强制执行 managed hooks，请在 `requirements.toml` 中与 `[hooks]` 一起固定 `[features].hooks = true`。若要忽略 user、project、session 和 plugin hooks，同时仍允许 administrator managed hooks，请设置 `allow_managed_hooks_only = true`。

```toml
allow_managed_hooks_only = true

[features]
hooks = true

[hooks]
managed_dir = "/enterprise/hooks"
windows_managed_dir = 'C:\enterprise\hooks'

[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = "python3 /enterprise/hooks/pre_tool_use_policy.py"
command_windows = 'py -3 C:\enterprise\hooks\pre_tool_use_policy.py'
timeout = 30
statusMessage = "Checking managed Bash command"
```

Managed hooks 说明：

- `managed_dir` 用于 macOS 和 Linux。
- `windows_managed_dir` 用于 Windows。
- Codex 不会分发 `managed_dir` 中的 scripts；你的 enterprise tooling 必须单独安装和更新它们。
- Managed hook commands 应使用已配置 managed directory 下的绝对 script paths。
- `allow_managed_hooks_only = true` 会跳过来自 user、project、session 和 plugin sources 的 hooks，但仍会从 `requirements.toml` 和其他 managed config layers 加载 managed hooks。

## Plugin-bundled hooks

启用 plugin 后，Codex 可以从该 plugin 加载 lifecycle hooks，并与 user、project 和 managed hooks 一起使用。

默认情况下，Codex 会在 plugin root 内查找 `hooks/hooks.json`。Plugin manifest 可以用 `.codex-plugin/plugin.json` 中的 `hooks` entry 覆盖默认值。Manifest entry 可以是带 `./` 前缀的 path、带 `./` 前缀的 paths 数组、inline hooks object，或 inline hooks objects 数组。

```json
{
  "name": "repo-policy",
  "hooks": "./hooks/hooks.json"
}
```

Manifest hook paths 会相对于 plugin root 解析，并且必须保持在该 root 内。如果 manifest 定义了 `hooks`，Codex 会使用这些 manifest entries，而不是默认的 `hooks/hooks.json`。

Plugin hook commands 会收到这些环境变量：

- `PLUGIN_ROOT` 是 Codex-specific extension，指向已安装 plugin root。
- `PLUGIN_DATA` 是 Codex-specific extension，指向 plugin 的 writable data directory。
- 为兼容现有 plugin hooks，Codex 还会设置 `CLAUDE_PLUGIN_ROOT` 和 `CLAUDE_PLUGIN_DATA`。

Plugin hooks 使用与其他 hooks 相同的 event schema。安装或启用 plugin 不会自动信任其 hooks；在你 review 并 trust 当前 hook definition 前，Codex 会跳过 plugin-bundled hooks。

## Matcher patterns

`matcher` 字段是一个 regex string，用于过滤 hooks 何时触发。使用 `"*"`、`""`，或完全省略 `matcher`，可匹配受支持 event 的每次发生。

目前只有部分 Codex events 会遵循 `matcher`：

| Event               | `matcher` 过滤内容 | 说明                                                         |
| ------------------- | ------------------ | ------------------------------------------------------------ |
| `PermissionRequest` | tool name          | 支持包括 `Bash`、`apply_patch`\* 和 MCP tool names           |
| `PostToolUse`       | tool name          | 支持包括 `Bash`、`apply_patch`\* 和 MCP tool names           |
| `PostCompact`       | compaction trigger | 值为 `manual` 或 `auto`                                      |
| `PreCompact`        | compaction trigger | 值为 `manual` 或 `auto`                                      |
| `PreToolUse`        | tool name          | 支持包括 `Bash`、`apply_patch`\* 和 MCP tool names           |
| `SessionStart`      | start source       | 值为 `startup`、`resume`、`clear` 和 `compact`               |
| `SubagentStart`     | subagent type      | 值取决于启动的 subagent                                      |
| `SubagentStop`      | subagent type      | 值取决于停止的 subagent                                      |
| `UserPromptSubmit`  | not supported      | 为该 event 配置的任何 `matcher` 都会被忽略                   |
| `Stop`              | not supported      | 为该 event 配置的任何 `matcher` 都会被忽略                   |

\*对于 `apply_patch`，`matcher` 值也可以使用 `Edit` 或 `Write`。

示例：

- `Bash`
- `^apply_patch$`
- `Edit|Write`
- `mcp__filesystem__read_file`
- `mcp__filesystem__.*`
- `startup|resume|clear|compact`
- `manual|auto`

## 通用输入字段 <a id="common-input-fields"></a>

每个 command hook 都会在 `stdin` 上接收一个 JSON object。

这些是你通常会使用的共享字段：

| 字段              | 类型             | 含义                                                                 |
| ----------------- | ---------------- | -------------------------------------------------------------------- |
| `session_id`      | `string`         | 当前 Codex session id。Subagent hooks 使用 parent session id。       |
| `transcript_path` | `string \| null` | session transcript file 的路径（如果有）                             |
| `cwd`             | `string`         | session 的工作目录                                                   |
| `hook_event_name` | `string`         | 当前 hook event name                                                 |
| `model`           | `string`         | Codex-specific extension。当前 active model slug                     |

Turn-scoped hooks 会在其 event-specific tables 中将 `turn_id` 列为 Codex-specific extension。

`SessionStart`、`PreToolUse`、`PermissionRequest`、`PostToolUse`、`UserPromptSubmit`、`SubagentStart`、`SubagentStop` 和 `Stop` 还包含 `permission_mode`，用于描述当前 permission mode，值为 `default`、`acceptEdits`、`plan`、`dontAsk` 或 `bypassPermissions`。

`transcript_path` 为方便起见指向 conversation transcript，但 transcript format 不是 hooks 的稳定接口，并且可能随时间变化。

如果你需要完整 wire format，请参见 [Schemas](#schemas)。

## 通用输出字段 <a id="common-output-fields"></a>

`SessionStart`、`PreCompact`、`PostCompact`、`UserPromptSubmit`、`SubagentStop` 和 `Stop` 支持这些共享 JSON 字段。`SubagentStart` 对 `systemMessage` 和 hook-specific context 接受相同形状，但 `continue: false` 不会停止 subagent：

```json
{
  "continue": true,
  "stopReason": "optional",
  "systemMessage": "optional",
  "suppressOutput": false
}
```

| 字段             | 效果                                             |
| ---------------- | ------------------------------------------------ |
| `continue`       | 如果为 `false`，将该 hook run 标记为 stopped     |
| `stopReason`     | 记录为停止原因                                   |
| `systemMessage`  | 在 UI 或 event stream 中显示为 warning           |
| `suppressOutput` | 目前会解析，但尚未实现                           |

Exit `0` 且无输出会被视为成功，Codex 会继续。

`PreToolUse` 和 `PermissionRequest` 支持 `systemMessage`，但这些 events 目前不支持 `continue`、`stopReason` 和 `suppressOutput`。如果 `PreToolUse` hook 返回这些不受支持的字段之一，Codex 会将该 hook run 标记为 failed，报告错误，并继续 tool call。

`PostToolUse` 支持 `systemMessage`、`continue: false` 和 `stopReason`。`suppressOutput` 会被解析，但该 event 目前不支持它。

## Hooks

### SessionStart

对于此 event，`matcher` 会应用到 `source`。

除[通用输入字段](#common-input-fields)外的字段：

| 字段     | 类型     | 含义                                                                |
| -------- | -------- | ------------------------------------------------------------------- |
| `source` | `string` | session 如何开始：`startup`、`resume`、`clear` 或 `compact`         |

`stdout` 上的纯文本会作为额外 developer context 添加。

`stdout` 上的 JSON 支持[通用输出字段](#common-output-fields)以及此 hook-specific shape：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Load the workspace conventions before editing."
  }
}
```

该 `additionalContext` 文本会作为额外 developer context 添加。

### SubagentStart

对于此 event，`matcher` 会应用到 `agent_type`。

除[通用输入字段](#common-input-fields)外的字段：

| 字段              | 类型     | 含义                                             |
| ----------------- | -------- | ------------------------------------------------ |
| `turn_id`         | `string` | Codex-specific extension。当前 active Codex turn id |
| `agent_id`        | `string` | subagent 的标识符                                |
| `agent_type`      | `string` | Subagent type 或 profile                         |
| `permission_mode` | `string` | 当前 permission mode                             |

`stdout` 上的纯文本会作为 subagent 的额外 developer context 添加。

`stdout` 上的 JSON 支持 `systemMessage` 以及此 hook-specific shape：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SubagentStart",
    "additionalContext": "Review the repository test conventions first."
  }
}
```

该 `additionalContext` 文本会作为 subagent 的额外 developer context 添加。`continue: false` 会为兼容性而解析，但不会阻止 subagent 启动。

### PreToolUse

`PreToolUse` 可以拦截 Bash、通过 `apply_patch` 执行的文件编辑，以及 MCP tool calls。它仍是 guardrail，而不是完整 enforcement boundary，因为 Codex 通常可以通过另一条受支持 tool path 完成等效工作。

它尚不能拦截所有 shell calls，只能拦截简单调用。较新的 `unified_exec` 机制允许更丰富的 shell streaming stdin/stdout 处理，但拦截还不完整。类似地，它不会拦截 `WebSearch` 或其他非 shell、非 MCP tool calls。

`matcher` 会应用到 `tool_name` 和 matcher aliases。对于通过 `apply_patch` 进行的文件编辑，`matcher` 值可以使用 `apply_patch`、`Edit` 或 `Write`；hook input 仍会报告 `tool_name: "apply_patch"`。

除[通用输入字段](#common-input-fields)外的字段：

| 字段          | 类型         | 含义                                                                                                      |
| ------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| `turn_id`     | `string`     | Codex-specific extension。当前 active Codex turn id                                                       |
| `tool_name`   | `string`     | 规范 hook tool name，例如 `Bash`、`apply_patch`，或 `mcp__fs__read` 这样的 MCP 名称                       |
| `tool_use_id` | `string`     | 此次调用的 tool-call id                                                                                   |
| `tool_input`  | `JSON value` | Tool-specific input。`Bash` 和 `apply_patch` 使用 `tool_input.command`，而 MCP tools 会发送所有 arguments。 |

`stdout` 上的纯文本会被忽略。

`stdout` 上的 JSON 可以使用 `systemMessage`。若要拒绝受支持的 tool call，请返回此 hook-specific shape：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive command blocked by hook."
  }
}
```

Codex 也接受这个较旧的 block shape：

```json
{
  "decision": "block",
  "reason": "Destructive command blocked by hook."
}
```

你也可以使用 exit code `2`，并将阻止原因写入 `stderr`。

若要在不阻止的情况下添加 model-visible context，请返回 `hookSpecificOutput.additionalContext`：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "additionalContext": "The pending command touches generated files."
  }
}
```

若要在不阻止的情况下重写受支持的 tool call，请返回带有 `updatedInput` 的 `permissionDecision: "allow"`：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "updatedInput": {
      "command": "echo rewritten"
    }
  }
}
```

对于 Bash commands 和 `apply_patch`，`updatedInput` 必须包含 string `command` 字段。对于 MCP tools，`updatedInput` 是替换后的 arguments object。只能将 `updatedInput` 与 `permissionDecision: "allow"` 一起返回；其他 `updatedInput` shapes 会被报告为错误。

`permissionDecision: "ask"`、legacy `decision: "approve"`、`continue: false`、`stopReason` 和 `suppressOutput` 会被解析，但尚不受支持。Codex 会将 hook run 标记为 failed，报告错误，并继续 tool call。

### PermissionRequest

`PermissionRequest` 会在 Codex 即将请求审批时运行，例如 shell escalation 或 managed-network approval。它可以允许请求、拒绝请求，或不做决定并让正常 approval prompt 继续。它不会针对不需要审批的 commands 运行。

`matcher` 会应用到 `tool_name` 和 matcher aliases。目前规范值包括 `Bash`、`apply_patch`，以及 `mcp__server__tool` 等 MCP tool names；`apply_patch` 也匹配 `Edit` 和 `Write`。

除[通用输入字段](#common-input-fields)外的字段：

| 字段                     | 类型             | 含义                                                                                                       |
| ------------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `turn_id`                | `string`         | Codex-specific extension。当前 active Codex turn id                                                        |
| `tool_name`              | `string`         | 规范 hook tool name，例如 `Bash`、`apply_patch`，或 `mcp__fs__read` 这样的 MCP 名称                        |
| `tool_input`             | `JSON value`     | Tool-specific input。`Bash` 和 `apply_patch` 使用 `tool_input.command`，而 MCP tools 会发送所有 args。     |
| `tool_input.description` | `string \| null` | Codex 提供时的人类可读 approval reason                                                                     |

`stdout` 上的纯文本会被忽略。

某些 tool inputs 可能包含人类可读描述，但不要依赖每个 tool 都有 `tool_input.description` 字段。

若要批准请求，请返回：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow"
    }
  }
}
```

若要拒绝请求，请返回：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "deny",
      "message": "Blocked by repository policy."
    }
  }
}
```

如果多个匹配 hooks 返回 decisions，任何 `deny` 都会胜出。否则，`allow` 会让请求在不显示 approval prompt 的情况下继续。如果没有匹配 hook 做出决定，Codex 使用正常 approval flow。

不要为 `PermissionRequest` 返回 `updatedInput`、`updatedPermissions` 或 `interrupt`；这些字段保留给未来行为，目前会 fail closed。

### PostToolUse

`PostToolUse` 在受支持 tools 产生输出后运行，包括 Bash、`apply_patch` 和 MCP tool calls。对于 Bash，它也会在 commands 以非零状态退出后运行。它无法撤销已经运行的 tool 的 side effects。

它尚不能拦截所有 shell calls，只能拦截简单调用。较新的 `unified_exec` 机制允许更丰富的 shell streaming stdin/stdout 处理，但拦截还不完整。类似地，它不会拦截 `WebSearch` 或其他非 shell、非 MCP tool calls。

`matcher` 会应用到 `tool_name` 和 matcher aliases。对于通过 `apply_patch` 进行的文件编辑，`matcher` 值可以使用 `apply_patch`、`Edit` 或 `Write`；hook input 仍会报告 `tool_name: "apply_patch"`。

除[通用输入字段](#common-input-fields)外的字段：

| 字段            | 类型         | 含义                                                                                                      |
| --------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| `turn_id`       | `string`     | Codex-specific extension。当前 active Codex turn id                                                       |
| `tool_name`     | `string`     | 规范 hook tool name，例如 `Bash`、`apply_patch`，或 `mcp__fs__read` 这样的 MCP 名称                       |
| `tool_use_id`   | `string`     | 此次调用的 tool-call id                                                                                   |
| `tool_input`    | `JSON value` | Tool-specific input。`Bash` 和 `apply_patch` 使用 `tool_input.command`，而 MCP tools 会发送所有 arguments。 |
| `tool_response` | `JSON value` | Tool-specific output。对于 MCP tools，这是 MCP call result。                                               |

`stdout` 上的纯文本会被忽略。

`stdout` 上的 JSON 可以使用 `systemMessage` 和此 hook-specific shape：

```json
{
  "decision": "block",
  "reason": "The Bash output needs review before continuing.",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "The command updated generated files."
  }
}
```

该 `additionalContext` 文本会作为额外 developer context 添加。

对于此 event，`decision: "block"` 不会撤销已完成的 Bash command。相反，Codex 会记录反馈，用该反馈替换 tool result，并从 hook-provided message 继续模型。

你也可以使用 exit code `2`，并将反馈原因写入 `stderr`。

若要在命令已经运行后停止对原始 tool result 的正常处理，请返回 `continue: false`。Codex 会用你的反馈或 stop text 替换 tool result，并从那里继续。

`updatedMCPToolOutput` 和 `suppressOutput` 会被解析，但尚不受支持。Codex 会将 hook run 标记为 failed，报告错误，并继续正常处理 tool result。

### PreCompact

`PreCompact` 在 Codex 压缩对话之前运行。`matcher` 会应用到 `trigger`，其值为 `manual` 和 `auto`。

除[通用输入字段](#common-input-fields)外的字段：

| 字段      | 类型     | 含义                                             |
| --------- | -------- | ------------------------------------------------ |
| `turn_id` | `string` | Codex-specific extension。当前 active Codex turn id |
| `trigger` | `string` | 触发 compaction 的原因：`manual` 或 `auto`       |

`stdout` 上的纯文本会被忽略。

`stdout` 上的 JSON 支持[通用输出字段](#common-output-fields)。如果匹配的 `PreCompact` hook 返回 `continue: false`，Codex 会在 compacting 前停止。

### PostCompact

`PostCompact` 在 Codex 压缩对话后运行。`matcher` 会应用到 `trigger`，其值为 `manual` 和 `auto`。

除[通用输入字段](#common-input-fields)外的字段：

| 字段      | 类型     | 含义                                             |
| --------- | -------- | ------------------------------------------------ |
| `turn_id` | `string` | Codex-specific extension。当前 active Codex turn id |
| `trigger` | `string` | 触发 compaction 的原因：`manual` 或 `auto`       |

`stdout` 上的纯文本会被忽略。

`stdout` 上的 JSON 支持[通用输出字段](#common-output-fields)。如果匹配的 `PostCompact` hook 返回 `continue: false`，Codex 会在 compacting 后停止。

### UserPromptSubmit

`matcher` 当前不用于此 event。

除[通用输入字段](#common-input-fields)外的字段：

| 字段      | 类型     | 含义                                             |
| --------- | -------- | ------------------------------------------------ |
| `turn_id` | `string` | Codex-specific extension。当前 active Codex turn id |
| `prompt`  | `string` | 即将发送的 user prompt                          |

`stdout` 上的纯文本会作为额外 developer context 添加。

`stdout` 上的 JSON 支持[通用输出字段](#common-output-fields)和此 hook-specific shape：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "Ask for a clearer reproduction before editing files."
  }
}
```

该 `additionalContext` 文本会作为额外 developer context 添加。

若要阻止 prompt，请返回：

```json
{
  "decision": "block",
  "reason": "Ask for confirmation before doing that."
}
```

你也可以使用 exit code `2`，并将阻止原因写入 `stderr`。

### SubagentStop

对于此 event，`matcher` 会应用到 `agent_type`。

除[通用输入字段](#common-input-fields)外的字段：

| 字段                     | 类型             | 含义                                            |
| ------------------------ | ---------------- | ----------------------------------------------- |
| `turn_id`                | `string`         | Codex-specific extension。当前 active Codex turn id |
| `agent_id`               | `string`         | subagent 的标识符                               |
| `agent_type`             | `string`         | Subagent type 或 profile                        |
| `agent_transcript_path`  | `string \| null` | subagent transcript file 的路径（如果有）       |
| `stop_hook_active`       | `boolean`        | 此 subagent 是否已经 continued                  |
| `last_assistant_message` | `string \| null` | 最新 subagent assistant message（如果可用）     |

`SubagentStop` 在以 `0` 退出时预期 `stdout` 上是 JSON。对于此 event，纯文本输出无效。

`stdout` 上的 JSON 支持[通用输出字段](#common-output-fields)。若要请求 Codex 继续 subagent flow，请返回：

```json
{
  "decision": "block",
  "reason": "Run one more focused pass inside the subagent."
}
```

你也可以使用 exit code `2`，并将 continuation reason 写入 `stderr`。

如果任何匹配的 `SubagentStop` hook 返回 `continue: false`，它会优先于其他匹配 `SubagentStop` hooks 的 continuation decisions。

### Stop

`matcher` 当前不用于此 event。

除[通用输入字段](#common-input-fields)外的字段：

| 字段                     | 类型             | 含义                                           |
| ------------------------ | ---------------- | ---------------------------------------------- |
| `turn_id`                | `string`         | Codex-specific extension。当前 active Codex turn id |
| `stop_hook_active`       | `boolean`        | 此 turn 是否已经由 `Stop` continued            |
| `last_assistant_message` | `string \| null` | 最新 assistant message text（如果可用）        |

`Stop` 在以 `0` 退出时预期 `stdout` 上是 JSON。对于此 event，纯文本输出无效。

`stdout` 上的 JSON 支持[通用输出字段](#common-output-fields)。若要让 Codex 继续，请返回：

```json
{
  "decision": "block",
  "reason": "Run one more pass over the failing tests."
}
```

你也可以使用 exit code `2`，并将 continuation reason 写入 `stderr`。

对于此 event，`decision: "block"` 不会拒绝 turn。相反，它会告诉 Codex 继续，并自动创建一个新的 continuation prompt，该 prompt 作为新的 user prompt，以你的 `reason` 作为 prompt text。

如果任何匹配的 `Stop` hook 返回 `continue: false`，它会优先于其他匹配 `Stop` hooks 的 continuation decisions。

## Schemas

链接的 `main` branch schemas 可能包含当前 release 中没有的 hook fields。请将本页作为 release behavior reference。

如果你需要确切的当前 wire format，请参见 [Codex GitHub repository](https://github.com/openai/codex/tree/main/codex-rs/hooks/schema/generated) 中生成的 schemas。
