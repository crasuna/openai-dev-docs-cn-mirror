---
title: "配置基础"
description: "Learn the basics of configuring your local Codex client"
outline: deep
---

# 配置基础

**文档集**：Codex 编码智能体<br>
**分组**：Codex — 基础配置<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/config-basic](https://developers.openai.com/codex/config-basic)
- Markdown 来源：[https://developers.openai.com/codex/config-basic.md](https://developers.openai.com/codex/config-basic.md)
- 抓取时间：2026-06-27T05:54:55.784Z
- Checksum：`10b65fdf18d674f18b2ecce454f160a8523c28cb669969c748f404333fab47cf`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex 会从多个位置读取配置详情。你的个人 defaults 位于 `~/.codex/config.toml`，你也可以用 `.codex/config.toml` 文件添加 project overrides。出于安全原因，Codex 只会在你 trust 该项目时加载 project `.codex/` layers。

## Codex 配置文件

Codex 将 user-level configuration 存储在 `~/.codex/config.toml`。要把设置限定到特定 project 或 subfolder，请在你的 repo 中添加 `.codex/config.toml` 文件。

要从 Codex IDE extension 打开配置文件，请选择右上角的齿轮图标，然后选择 **Codex Settings &gt; Open config.toml**。

CLI 和 IDE extension 共享相同的 configuration layers。你可以用它们来：

- 设置默认 model 和 provider。
- 配置 [approval policies and sandbox settings](/mirror/codex/agent-approvals-security#sandbox-and-approvals)。
- 配置 [MCP servers](/mirror/codex/mcp)。

## 配置优先级

Codex 按以下顺序解析值（最高优先级在前）：

1. CLI flags 和 `--config` overrides
2. Project config files：`.codex/config.toml`，从 project root 到当前 working directory 排序（最接近者优先；仅 trusted projects）
3. 使用 `--profile profile-name` 选择的 [Profile](/mirror/codex/config-advanced#profiles) files（`~/.codex/profile-name.config.toml`）
4. User config：`~/.codex/config.toml`
5. System config（如果存在）：Unix 上的 `/etc/codex/config.toml`
6. Built-in defaults

使用该优先级在 `config.toml` 中设置 shared defaults，并让 [profile files](/mirror/codex/config-advanced#profiles) 专注于不同的值。

如果你把 project 标记为 untrusted，Codex 会跳过 project-scoped `.codex/` layers，包括 project-local config、hooks 和 rules。User 和 system config 仍会加载，包括 user/global hooks 和 rules。

有关通过 `-c`/`--config` 进行 one-off overrides（包括 TOML quoting rules）的说明，请参见 [Advanced Config](/mirror/codex/config-advanced#one-off-overrides-from-the-cli)。

在 managed machines 上，你的组织也可能通过
  `requirements.toml` 强制施加约束（例如禁止 `approval_policy = "never"` 或
  `sandbox_mode = "danger-full-access"`）。请参见 [Managed configuration](/mirror/codex/enterprise/managed-configuration) 和 [Admin-enforced requirements](/mirror/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml)。

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

有关 `untrusted`、`on-request` 和 `never` 的行为差异，请参见 [Run without approval prompts](/mirror/codex/agent-approvals-security#run-without-approval-prompts) 和 [Common sandbox and approval combinations](/mirror/codex/agent-approvals-security#common-sandbox-and-approval-combinations)。

#### Sandbox level

调整 Codex 执行命令时拥有多少文件系统和网络访问权限。

```toml
sandbox_mode = "workspace-write"
```

有关各模式行为（包括 protected `.git`/`.codex` paths 和网络 defaults），请参见 [Sandbox and approvals](/mirror/codex/agent-approvals-security#sandbox-and-approvals)、[Protected paths in writable roots](/mirror/codex/agent-approvals-security#protected-paths-in-writable-roots) 和 [Network access](/mirror/codex/agent-approvals-security#network-access)。

#### Permission profiles

Codex 也支持 named permission profiles，用于可复用的 filesystem 和 network policies。内置 profiles 是 `:read-only`、`:workspace` 和 `:danger-full-access`。Custom profiles 使用 `[permissions.&lt;name&gt;]` tables 和匹配的 `default_permissions` 值。请参见 [Permissions](/mirror/codex/permissions)。

#### Windows sandbox mode

在 Windows 原生运行 Codex 时，请在 `windows` table 中把 native sandbox mode 设置为 `elevated`。只有在你没有 administrator permissions，或 elevated setup 失败时，才使用 `unelevated`。

```toml
[windows]
sandbox = "elevated"   # Recommended
# sandbox = "unelevated" # Fallback if admin permissions/setup are unavailable
```

#### Web search mode

Codex 默认为本地 tasks 启用 web search，并从 web search cache 提供结果。该 cache 是 OpenAI 维护的 web results index，因此 cached mode 会返回预先索引的结果，而不是抓取 live pages。这会减少来自任意 live content 的提示注入暴露，但你仍应把 web results 视为不可信。如果你使用 `--yolo` 或其他 [full access sandbox setting](/mirror/codex/agent-approvals-security#common-sandbox-and-approval-combinations)，web search 默认使用 live results。用 `web_search` 选择模式：

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
| `hooks`              |         true          | Stable       | 启用来自 `hooks.json` 或 inline `[hooks]` 的 lifecycle hooks。请参见 [Hooks](/mirror/codex/hooks)。 |
| `fast_mode`          |         true          | Stable       | 启用 Fast mode 选择和 `service_tier = "fast"` 路径                          |
| `memories`           |         false         | Stable       | 启用 [Memories](/mirror/codex/memories)                                                       |
| `multi_agent`        |         true          | Stable       | 启用 subagent collaboration tools                                                      |
| `personality`        |         true          | Stable       | 启用 personality selection controls                                                    |
| `shell_snapshot`     |         true          | Stable       | 快照你的 shell environment，以加快重复 commands                            |
| `shell_tool`         |         true          | Stable       | 启用默认 `shell` tool                                                          |
| `unified_exec`       | `true` except Windows | Stable       | 使用 unified PTY-backed exec tool                                                     |
| `undo`               |         false         | Stable       | 通过 per-turn git ghost snapshots 启用 undo                                             |
| `web_search`         |         true          | Deprecated   | Legacy toggle；优先使用 top-level `web_search` setting                                 |
| `web_search_cached`  |         false         | Deprecated   | Legacy toggle；未设置时映射到 `web_search = "cached"`                            |
| `web_search_request` |         false         | Deprecated   | Legacy toggle；未设置时映射到 `web_search = "live"`                              |

Maturity 列使用 Experimental、Beta 和 Stable 等 feature maturity labels。请参见 [Feature Maturity](/mirror/codex/feature-maturity)，了解如何解读这些 labels。

省略 feature keys 即保留 defaults。

有关 lifecycle hook 配置，请参见 [Hooks](/mirror/codex/hooks)。

### 启用 features

- 在 `config.toml` 中，在 `[features]` 下添加 `feature_name = true`。
- 从 CLI 运行 `codex --enable feature_name`。
- 要启用多个 features，运行 `codex --enable feature_a --enable feature_b`。
- 要禁用某个 feature，请在 `config.toml` 中将该 key 设置为 `false`。

:::

## English source

::: details 展开英文原文
::: v-pre
Codex reads configuration details from more than one location. Your personal defaults live in `~/.codex/config.toml`, and you can add project overrides with `.codex/config.toml` files. For security, Codex loads project `.codex/` layers only when you trust the project.

## Codex configuration file

Codex stores user-level configuration at `~/.codex/config.toml`. To scope settings to a specific project or subfolder, add a `.codex/config.toml` file in your repo.

To open the configuration file from the Codex IDE extension, select the gear icon in the top-right corner, then select **Codex Settings &gt; Open config.toml**.

The CLI and IDE extension share the same configuration layers. You can use them to:

- Set the default model and provider.
- Configure [approval policies and sandbox settings](/mirror/codex/agent-approvals-security#sandbox-and-approvals).
- Configure [MCP servers](/mirror/codex/mcp).

## Configuration precedence

Codex resolves values in this order (highest precedence first):

1. CLI flags and `--config` overrides
2. Project config files: `.codex/config.toml`, ordered from the project root down to your current working directory (closest wins; trusted projects only)
3. [Profile](/mirror/codex/config-advanced#profiles) files selected with `--profile profile-name` (`~/.codex/profile-name.config.toml`)
4. User config: `~/.codex/config.toml`
5. System config (if present): `/etc/codex/config.toml` on Unix
6. Built-in defaults

Use that precedence to set shared defaults in `config.toml` and keep [profile files](/mirror/codex/config-advanced#profiles) focused on the values that differ.

If you mark a project as untrusted, Codex skips project-scoped `.codex/` layers, including project-local config, hooks, and rules. User and system config still load, including user/global hooks and rules.

For one-off overrides via `-c`/`--config` (including TOML quoting rules), see [Advanced Config](/mirror/codex/config-advanced#one-off-overrides-from-the-cli).

On managed machines, your organization may also enforce constraints via
  `requirements.toml` (for example, disallowing `approval_policy = "never"` or
  `sandbox_mode = "danger-full-access"`). See [Managed configuration](/mirror/codex/enterprise/managed-configuration) and [Admin-enforced requirements](/mirror/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml).

## Common configuration options

Here are a few options people change most often:

#### Default model

Choose the model Codex uses by default in the CLI and IDE.

```toml
model = "gpt-5.5"
```


#### Approval prompts

Control when Codex pauses to ask before running generated commands.

```toml
approval_policy = "on-request"
```

For behavior differences between `untrusted`, `on-request`, and `never`, see [Run without approval prompts](/mirror/codex/agent-approvals-security#run-without-approval-prompts) and [Common sandbox and approval combinations](/mirror/codex/agent-approvals-security#common-sandbox-and-approval-combinations).

#### Sandbox level

Adjust how much filesystem and network access Codex has while executing commands.

```toml
sandbox_mode = "workspace-write"
```

For mode-by-mode behavior (including protected `.git`/`.codex` paths and network defaults), see [Sandbox and approvals](/mirror/codex/agent-approvals-security#sandbox-and-approvals), [Protected paths in writable roots](/mirror/codex/agent-approvals-security#protected-paths-in-writable-roots), and [Network access](/mirror/codex/agent-approvals-security#network-access).

#### Permission profiles

Codex also supports named permission profiles for reusable filesystem and
network policies. Built-in profiles are `:read-only`, `:workspace`, and
`:danger-full-access`. Custom profiles use `[permissions.&lt;name&gt;]` tables and a
matching `default_permissions` value. See [Permissions](/mirror/codex/permissions).

#### Windows sandbox mode

When running Codex natively on Windows, set the native sandbox mode to `elevated` in the `windows` table. Use `unelevated` only if you don't have administrator permissions or if elevated setup fails.

```toml
[windows]
sandbox = "elevated"   # Recommended
# sandbox = "unelevated" # Fallback if admin permissions/setup are unavailable
```

#### Web search mode

Codex enables web search by default for local tasks and serves results from a web search cache. The cache is an OpenAI-maintained index of web results, so cached mode returns pre-indexed results instead of fetching live pages. This reduces exposure to prompt injection from arbitrary live content, but you should still treat web results as untrusted. If you are using `--yolo` or another [full access sandbox setting](/mirror/codex/agent-approvals-security#common-sandbox-and-approval-combinations), web search defaults to live results. Choose a mode with `web_search`:

- `"cached"` (default) serves results from the web search cache.
- `"live"` fetches the most recent data from the web (same as `--search`).
- `"disabled"` turns off the web search tool.

```toml
web_search = "cached"  # default; serves results from the web search cache
# web_search = "live"  # fetch the most recent data from the web (same as --search)
# web_search = "disabled"
```

#### Reasoning effort

Tune how much reasoning effort the model applies when supported.

```toml
model_reasoning_effort = "high"
```

#### Communication style

Set a default communication style for supported models.

```toml
personality = "friendly" # or "pragmatic" or "none"
```

You can override this later in an active session with `/personality` or per thread/turn when using the app-server APIs.

#### TUI keymap

Customize terminal shortcuts under `tui.keymap`. Selected composer actions fall back to matching `tui.keymap.global` bindings; context-specific bindings take precedence when supported. An empty list unbinds the action.

```toml
[tui.keymap.global]
open_transcript = "ctrl-t"

[tui.keymap.composer]
submit = ["enter", "ctrl-m"]

[tui.keymap.chat]
interrupt_turn = "f12"
```

#### Command environment

Control which environment variables Codex forwards to spawned commands.

```toml
[shell_environment_policy]
include_only = ["PATH", "HOME"]
```

#### Log directory

Override where Codex writes local log files. Setting `log_dir` explicitly also
enables the opt-in plaintext TUI log, `codex-tui.log`, in that directory.

```toml
log_dir = "/absolute/path/to/codex-logs"
```

For one-off runs, you can also set it from the CLI:

```bash
codex -c log_dir=./.codex-log
```

## Feature flags

Use the `[features]` table in `config.toml` to toggle optional and experimental capabilities.

```toml
[features]
shell_snapshot = true           # Speed up repeated commands
```

### Supported features

| Key                  |        Default        | Maturity     | Description                                                                              |
| -------------------- | :-------------------: | ------------ | ---------------------------------------------------------------------------------------- |
| `apps`               |         false         | Experimental | Enable ChatGPT Apps/connectors support                                                   |
| `codex_git_commit`   |         false         | Experimental | Enable Codex-generated git commits and commit attribution trailers                       |
| `hooks`              |         true          | Stable       | Enable lifecycle hooks from `hooks.json` or inline `[hooks]`. See [Hooks](/mirror/codex/hooks). |
| `fast_mode`          |         true          | Stable       | Enable Fast mode selection and the `service_tier = "fast"` path                          |
| `memories`           |         false         | Stable       | Enable [Memories](/mirror/codex/memories)                                                       |
| `multi_agent`        |         true          | Stable       | Enable subagent collaboration tools                                                      |
| `personality`        |         true          | Stable       | Enable personality selection controls                                                    |
| `shell_snapshot`     |         true          | Stable       | Snapshot your shell environment to speed up repeated commands                            |
| `shell_tool`         |         true          | Stable       | Enable the default `shell` tool                                                          |
| `unified_exec`       | `true` except Windows | Stable       | Use the unified PTY-backed exec tool                                                     |
| `undo`               |         false         | Stable       | Enable undo via per-turn git ghost snapshots                                             |
| `web_search`         |         true          | Deprecated   | Legacy toggle; prefer the top-level `web_search` setting                                 |
| `web_search_cached`  |         false         | Deprecated   | Legacy toggle that maps to `web_search = "cached"` when unset                            |
| `web_search_request` |         false         | Deprecated   | Legacy toggle that maps to `web_search = "live"` when unset                              |

The Maturity column uses feature maturity labels such as Experimental, Beta,
  and Stable. See [Feature Maturity](/mirror/codex/feature-maturity) for how to
  interpret these labels.

Omit feature keys to keep their defaults.

For lifecycle hook configuration, see [Hooks](/mirror/codex/hooks).

### Enabling features

- In `config.toml`, add `feature_name = true` under `[features]`.
- From the CLI, run `codex --enable feature_name`.
- To enable more than one feature, run `codex --enable feature_a --enable feature_b`.
- To disable a feature, set the key to `false` in `config.toml`.

:::
:::

