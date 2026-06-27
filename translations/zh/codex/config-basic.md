---
status: needs-review
sourceId: "10b65fdf18d6"
sourceChecksum: "10b65fdf18d674f18b2ecce454f160a8523c28cb669969c748f404333fab47cf"
sourceUrl: "https://developers.openai.com/codex/config-basic"
translatedAt: "2026-06-27T11:05:32.948Z"
translator: codex-gpt-5.5-xhigh
---

# 配置基础

Codex 会从多个位置读取配置详情。你的个人 defaults 位于 `~/.codex/config.toml`，你也可以用 `.codex/config.toml` 文件添加 project overrides。出于安全原因，Codex 只会在你 trust 该项目时加载 project `.codex/` layers。

## Codex 配置文件

Codex 将 user-level configuration 存储在 `~/.codex/config.toml`。要把设置限定到特定 project 或 subfolder，请在你的 repo 中添加 `.codex/config.toml` 文件。

要从 Codex IDE extension 打开配置文件，请选择右上角的齿轮图标，然后选择 **Codex Settings > Open config.toml**。

CLI 和 IDE extension 共享相同的 configuration layers。你可以用它们来：

- 设置默认 model 和 provider。
- 配置 [approval policies and sandbox settings](https://developers.openai.com/codex/agent-approvals-security#sandbox-and-approvals)。
- 配置 [MCP servers](https://developers.openai.com/codex/mcp)。

## 配置优先级

Codex 按以下顺序解析值（最高优先级在前）：

1. CLI flags 和 `--config` overrides
2. Project config files：`.codex/config.toml`，从 project root 到当前 working directory 排序（最接近者优先；仅 trusted projects）
3. 使用 `--profile profile-name` 选择的 [Profile](https://developers.openai.com/codex/config-advanced#profiles) files（`~/.codex/profile-name.config.toml`）
4. User config：`~/.codex/config.toml`
5. System config（如果存在）：Unix 上的 `/etc/codex/config.toml`
6. Built-in defaults

使用该优先级在 `config.toml` 中设置 shared defaults，并让 [profile files](https://developers.openai.com/codex/config-advanced#profiles) 专注于不同的值。

如果你把 project 标记为 untrusted，Codex 会跳过 project-scoped `.codex/` layers，包括 project-local config、hooks 和 rules。User 和 system config 仍会加载，包括 user/global hooks 和 rules。

有关通过 `-c`/`--config` 进行 one-off overrides（包括 TOML quoting rules）的说明，请参见 [Advanced Config](https://developers.openai.com/codex/config-advanced#one-off-overrides-from-the-cli)。

在 managed machines 上，你的组织也可能通过
  `requirements.toml` 强制施加约束（例如禁止 `approval_policy = "never"` 或
  `sandbox_mode = "danger-full-access"`）。请参见 [Managed
  configuration](https://developers.openai.com/codex/enterprise/managed-configuration) 和 [Admin-enforced
  requirements](https://developers.openai.com/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml)。

## 常见配置选项

以下是人们最常更改的一些选项：

#### 默认 model

选择 Codex 在 CLI 和 IDE 中默认使用的 model。

```toml
model = "gpt-5.5"
```


#### Approval prompts

控制 Codex 在运行生成的命令前何时暂停询问。

```toml
approval_policy = "on-request"
```

有关 `untrusted`、`on-request` 和 `never` 的行为差异，请参见 [Run without approval prompts](https://developers.openai.com/codex/agent-approvals-security#run-without-approval-prompts) 和 [Common sandbox and approval combinations](https://developers.openai.com/codex/agent-approvals-security#common-sandbox-and-approval-combinations)。

#### Sandbox level

调整 Codex 执行命令时拥有多少文件系统和网络访问权限。

```toml
sandbox_mode = "workspace-write"
```

有关各模式行为（包括 protected `.git`/`.codex` paths 和网络 defaults），请参见 [Sandbox and approvals](https://developers.openai.com/codex/agent-approvals-security#sandbox-and-approvals)、[Protected paths in writable roots](https://developers.openai.com/codex/agent-approvals-security#protected-paths-in-writable-roots) 和 [Network access](https://developers.openai.com/codex/agent-approvals-security#network-access)。

#### Permission profiles

Codex 也支持 named permission profiles，用于可复用的 filesystem 和 network policies。内置 profiles 是 `:read-only`、`:workspace` 和 `:danger-full-access`。Custom profiles 使用 `[permissions.<name>]` tables 和匹配的 `default_permissions` 值。请参见 [Permissions](https://developers.openai.com/codex/permissions)。

#### Windows sandbox mode

在 Windows 原生运行 Codex 时，请在 `windows` table 中把 native sandbox mode 设置为 `elevated`。只有在你没有 administrator permissions，或 elevated setup 失败时，才使用 `unelevated`。

```toml
[windows]
sandbox = "elevated"   # Recommended
# sandbox = "unelevated" # Fallback if admin permissions/setup are unavailable
```

#### Web search mode

Codex 默认为本地 tasks 启用 web search，并从 web search cache 提供结果。该 cache 是 OpenAI 维护的 web results index，因此 cached mode 会返回预先索引的结果，而不是抓取 live pages。这会减少来自任意 live content 的提示注入暴露，但你仍应把 web results 视为不可信。如果你使用 `--yolo` 或其他 [full access sandbox setting](https://developers.openai.com/codex/agent-approvals-security#common-sandbox-and-approval-combinations)，web search 默认使用 live results。用 `web_search` 选择模式：

- `"cached"`（默认）从 web search cache 提供结果。
- `"live"` 从 web 获取最新数据（与 `--search` 相同）。
- `"disabled"` 关闭 web search tool。

```toml
web_search = "cached"  # default; serves results from the web search cache
# web_search = "live"  # fetch the most recent data from the web (same as --search)
# web_search = "disabled"
```

#### Reasoning effort

在支持时，调节模型应用多少 reasoning effort。

```toml
model_reasoning_effort = "high"
```

#### Communication style

为支持的 models 设置默认 communication style。

```toml
personality = "friendly" # or "pragmatic" or "none"
```

你可以稍后在 active session 中用 `/personality` 覆盖它，或在使用 app-server APIs 时按 thread/turn 覆盖。

#### TUI keymap

在 `tui.keymap` 下自定义 terminal shortcuts。选中的 composer actions 会回退到匹配的 `tui.keymap.global` bindings；当支持 context-specific bindings 时，它们优先级更高。空 list 会解绑该 action。

```toml
[tui.keymap.global]
open_transcript = "ctrl-t"

[tui.keymap.composer]
submit = ["enter", "ctrl-m"]

[tui.keymap.chat]
interrupt_turn = "f12"
```

#### Command environment

控制 Codex 将哪些环境变量转发给 spawned commands。

```toml
[shell_environment_policy]
include_only = ["PATH", "HOME"]
```

#### Log directory

覆盖 Codex 写入本地 log files 的位置。显式设置 `log_dir` 也会在该目录中启用 opt-in plaintext TUI log：`codex-tui.log`。

```toml
log_dir = "/absolute/path/to/codex-logs"
```

对于 one-off runs，也可以从 CLI 设置：

```bash
codex -c log_dir=./.codex-log
```

## Feature flags

使用 `config.toml` 中的 `[features]` table 切换可选和实验性能力。

```toml
[features]
shell_snapshot = true           # Speed up repeated commands
```

### 支持的 features

| Key                  |        Default        | Maturity     | Description                                                                              |
| -------------------- | :-------------------: | ------------ | ---------------------------------------------------------------------------------------- |
| `apps`               |         false         | Experimental | 启用 ChatGPT Apps/connectors 支持                                                   |
| `codex_git_commit`   |         false         | Experimental | 启用 Codex 生成的 git commits 和 commit attribution trailers                       |
| `hooks`              |         true          | Stable       | 启用来自 `hooks.json` 或 inline `[hooks]` 的 lifecycle hooks。请参见 [Hooks](https://developers.openai.com/codex/hooks)。 |
| `fast_mode`          |         true          | Stable       | 启用 Fast mode 选择和 `service_tier = "fast"` 路径                          |
| `memories`           |         false         | Stable       | 启用 [Memories](https://developers.openai.com/codex/memories)                                                       |
| `multi_agent`        |         true          | Stable       | 启用 subagent collaboration tools                                                      |
| `personality`        |         true          | Stable       | 启用 personality selection controls                                                    |
| `shell_snapshot`     |         true          | Stable       | 快照你的 shell environment，以加快重复 commands                            |
| `shell_tool`         |         true          | Stable       | 启用默认 `shell` tool                                                          |
| `unified_exec`       | `true` except Windows | Stable       | 使用 unified PTY-backed exec tool                                                     |
| `undo`               |         false         | Stable       | 通过 per-turn git ghost snapshots 启用 undo                                             |
| `web_search`         |         true          | Deprecated   | Legacy toggle；优先使用 top-level `web_search` setting                                 |
| `web_search_cached`  |         false         | Deprecated   | Legacy toggle；未设置时映射到 `web_search = "cached"`                            |
| `web_search_request` |         false         | Deprecated   | Legacy toggle；未设置时映射到 `web_search = "live"`                              |

Maturity 列使用 Experimental、Beta 和 Stable 等 feature maturity labels。请参见 [Feature Maturity](https://developers.openai.com/codex/feature-maturity)，了解如何解读这些 labels。

省略 feature keys 即保留 defaults。

有关 lifecycle hook 配置，请参见 [Hooks](https://developers.openai.com/codex/hooks)。

### 启用 features

- 在 `config.toml` 中，在 `[features]` 下添加 `feature_name = true`。
- 从 CLI 运行 `codex --enable feature_name`。
- 要启用多个 features，运行 `codex --enable feature_a --enable feature_b`。
- 要禁用某个 feature，请在 `config.toml` 中将该 key 设置为 `false`。
