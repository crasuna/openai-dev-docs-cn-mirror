---
title: "Managed configuration"
description: "Configure managed Codex requirements and defaults"
outline: deep
---

# Managed configuration

**文档集**：Codex  
**分组**：Codex — Enterprise  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/enterprise/managed-configuration](https://developers.openai.com/codex/enterprise/managed-configuration)
- Markdown 来源：[https://developers.openai.com/codex/enterprise/managed-configuration.md](https://developers.openai.com/codex/enterprise/managed-configuration.md)
- 抓取时间：2026-06-27T05:54:57.369Z
- Checksum：`1f15954b6d7b09c9bbe3b6c1b911883d7b697a07747fb196ab8d066d50212245`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
企业管理员可以通过两种方式控制本地 Codex 行为：

- **Requirements**：用户无法覆盖的管理员强制约束。
- **Managed defaults**：Codex 启动时应用的初始值。用户仍可在会话期间更改设置；Codex 会在下次启动时重新应用 managed defaults。

## 管理员强制 requirements（requirements.toml）

Requirements 会约束安全敏感设置（approval policy、approvals reviewer、automatic review policy、sandbox mode、permission profiles、web search mode、managed hooks、用户可以启用哪些 MCP servers，以及用户配置的 plugin marketplace sources 中哪些可以添加、安装或刷新）。解析配置时（例如来自 `config.toml`、[profile files](/mirror/codex/config-advanced#profiles) 或 CLI config overrides），如果某个值与强制规则冲突，Codex 会回退到兼容值并通知用户。如果你配置了 `mcp_servers` allowlist，Codex 只有在 MCP server 的名称和 identity 都匹配已批准条目时才会启用它；否则，Codex 会禁用它。

Requirements 还可以通过 `requirements.toml` 中的 `[features]` 表约束 [feature flags](/mirror/codex/config-basic#feature-flags)。请注意，features 并非总是安全敏感，但企业可以根据需要 pin 值。省略的 key 保持不受约束。

对于 Codex 0.138.0 或更高版本，请优先使用带有 `allowed_permission_profiles` 和托管 `default_permissions` 的 [permission profiles](/mirror/codex/permissions)。仅对仍配置 `sandbox_mode` 的旧部署使用 `allowed_sandbox_modes`。

精确 key 列表请参阅 [Configuration Reference 中的 `requirements.toml` 部分](/mirror/codex/config-reference#requirementstoml)。

### 位置和优先级

Codex 会按以下顺序检查 requirement sources。如果同一设置出现多次，第一个值获胜：

1. Cloud-managed requirements（ChatGPT Business 或 Enterprise）
2. 通过 `com.openai.codex:requirements_toml_base64` 提供的 macOS managed preferences（MDM）
3. 系统 `requirements.toml`（Unix 系统上为 `/etc/codex/requirements.toml`，包括 Linux/macOS；Windows 上为 `%ProgramData%\OpenAI\Codex\requirements.toml`）

Codex 会从上到下检查这些来源。对于普通设置和列表，它会使用找到的第一个值。后面的来源仍可提供前面来源未设置的设置。

表会逐条合并。对于 `allowed_permission_profiles`，后面的来源可以添加前面来源未提及的 profile 名称。如果两个来源设置了相同 profile 名称，则前面的来源获胜。

为保持向后兼容，Codex 还会将 legacy `managed_config.toml` 字段 `approval_policy` 和 `sandbox_mode` 解释为 requirements（只允许该单一值）。

### Cloud-managed requirements

当你在 Business 或 Enterprise 计划中使用 ChatGPT 登录时，Codex 还可以从 Codex 服务获取管理员强制 requirements。这是另一个与 `requirements.toml` 兼容的 requirements 来源。它适用于 Codex 的各个界面，包括 CLI、App 和 IDE Extension。

#### 配置 cloud-managed requirements

前往 [Codex managed-config page](https://chatgpt.com/codex/settings/managed-configs)。

使用与 `requirements.toml` 相同的格式和 key 创建新的 managed requirements 文件。

```toml
enforce_residency = "us"
allowed_approval_policies = ["on-request"]
allowed_sandbox_modes = ["read-only", "workspace-write"]

[rules]
prefix_rules = [
  { pattern = [{ any_of = ["bash", "sh", "zsh"] }], decision = "prompt", justification = "Require explicit approval for shell entrypoints" },
]
```

保存配置。保存后，更新后的 managed requirements 会立即应用到匹配用户。
更多示例请参阅 [Example requirements.toml](/mirror/codex/enterprise/managed-configuration#example-requirementstoml)。

#### 将 requirements 分配给 groups

管理员可以为不同用户组配置不同的 managed requirements，也可以设置默认 fallback requirements 策略。

如果用户匹配多个 group-specific 规则，则应用第一个匹配规则。Codex 不会从后续匹配的 group 规则中填补未设置字段。

例如，如果第一个匹配的 group 规则只设置 `allowed_sandbox_modes = ["read-only"]`，后续匹配的 group 规则设置 `allowed_approval_policies = ["on-request"]`，Codex 只应用第一个匹配的 group 规则，并且不会从后续规则填补 `allowed_approval_policies`。

#### Codex 如何在本地应用 cloud-managed requirements

当用户启动 Codex 并在 Business 或 Enterprise 计划中使用 ChatGPT 登录时，Codex 会以 best-effort 方式应用 managed requirements。Codex 首先检查是否有有效、未过期的本地 managed requirements cache entry，并在可用时使用它。如果 cache 缺失、过期、损坏，或与当前 auth identity 不匹配，Codex 会尝试从服务获取 managed requirements（包含重试），并在成功时写入新的 signed cache entry。如果没有可用的有效缓存条目，且获取失败或超时，Codex 会在没有 managed requirements 层的情况下继续。

完成 cache 解析后，Codex 会作为上述正常 requirements layering 的一部分强制执行 managed requirements。

### Example requirements.toml

此示例会阻止 `--ask-for-approval never` 和 `--sandbox danger-full-access`（包括 `--yolo`）：

```toml
allowed_approval_policies = ["untrusted", "on-request"]
allowed_sandbox_modes = ["read-only", "workspace-write"]
```

### 禁用 Appshots

要为受管用户禁用 Appshots，请设置顶层 `allow_appshots` requirement：

```toml
allow_appshots = false
```

Codex 只会将 `allow_appshots = false` 视为禁用 Appshots。如果省略该 key，Appshots 不受 requirements 约束，并使用正常产品可用性检查。通过 `configRequirements/read` 读取有效 requirements 的 app-server clients 会收到与 `allowAppshots` 相同的限制；省略或 `null` 的 `allowAppshots` 值不会禁用 Appshots。

### 禁用设备远程控制

要为受管用户禁用[设备远程控制](/mirror/codex/remote-connections#pick-up-work-from-another-device)，请设置顶层 `allow_remote_control` requirement：

```toml
allow_remote_control = false
```

Codex 只会将 `allow_remote_control = false` 视为禁用设备远程控制。如果省略该 key，设备远程控制不受 requirements 约束，并使用正常产品可用性检查。此 requirement 不会禁用 SSH remote connections。

### 控制可用 permission profiles

使用 `allowed_permission_profiles` 控制用户可以选择哪些内置和自定义 [permission profiles](/mirror/codex/permissions)。这是 `allowed_sandbox_modes` 的 permission-profile 等价形式；请使用与你的用户选择 permissions 方式匹配的 allowlist。

Permission-profile allowlists 需要 Codex 0.138.0 或更高版本。Codex 0.137.0 及更早版本会忽略 `allowed_permission_profiles` 和托管 `default_permissions`。

请仅在所有受管 client 都运行支持版本之后，才使用下面的 permission-profile 示例。在 fleet upgrade 完成前，不要部署托管 custom profiles。

当该表存在时，它就是允许 profiles 的完整列表。设置为 `true` 的 profiles 被允许。省略或设置为 `false` 的 profiles 会被拒绝，包括未来 Codex 版本新增的内置项。

#### 允许标准 profiles

此策略允许 read-only 和 workspace 访问，但不允许 full access：

```toml
default_permissions = ":workspace"

[allowed_permission_profiles]
":read-only" = true
":workspace" = true
# ":danger-full-access" is omitted, so it is denied.
```

#### 添加托管 least-privilege default

管理员可以在同一个 requirements 来源中定义自定义 profile。请使用不会与用户已加载 config 中名称冲突的组织特定 profile 名称。自定义名称不能以 `:` 开头，也不能使用保留名称 `filesystem`。

不要将托管 custom profiles 部署到运行 Codex 0.137.0 或更早版本的 clients。这些 clients 能识别 profile 表，但不能识别选择该 profile 的托管 default。

例如：

```toml
default_permissions = "acme_review_only"

[allowed_permission_profiles]
":read-only" = true
":workspace" = true
acme_review_only = true
# ":danger-full-access" is intentionally omitted, so it is denied.

[permissions.acme_review_only]
description = "Review code without modifying the workspace."
extends = ":read-only"
```

#### 仅允许企业定义的 profiles

当用户应只选择管理员定义的 profiles 时，请省略所有内置项：

```toml
default_permissions = "acme_workspace"

[allowed_permission_profiles]
acme_workspace = true

[permissions.acme_workspace]
description = "Workspace access with sensitive files denied."
extends = ":workspace"

[permissions.acme_workspace.filesystem]
glob_scan_max_depth = 3

[permissions.acme_workspace.filesystem.":workspace_roots"]
"**/*.env" = "deny"
```

即使用户不能直接选择内置 `:workspace` profile，自定义 profile 仍可以扩展 `:workspace`。

#### 关闭另一个来源允许的 profile

Permission allowlists 会按 profile 名称合并。由于 Codex 会先检查 cloud requirements，再检查 system requirements，因此 cloud requirements 可以使用 `false` 关闭 system file 允许的 profile。

Cloud requirements：

```toml
default_permissions = ":read-only"

[allowed_permission_profiles]
":read-only" = true
":workspace" = false
```

System requirements：

```toml
[allowed_permission_profiles]
":read-only" = true
":workspace" = true  # Not honored because cloud requirements set this to false.
```

请将 `default_permissions` 显式设置为一个允许的 profile。如果省略它，只有当 `:workspace` 和 `:read-only` 都被显式允许时，Codex 才默认使用 `:workspace`。当 `allowed_permission_profiles` 不存在时，managed requirements 不会限制用户可以选择哪些 profile 名称。每个条目都必须命名一个内置 profile，或命名一个在已加载 config 或 requirements 来源中定义的自定义 profile。当自定义 profile 的行为应集中控制时，请在 managed requirements 中定义 custom profiles。

### 按 host 覆盖 sandbox requirements

当一个托管策略应在不同 hosts 上应用不同 sandbox requirements 时，请使用 `[[remote_sandbox_config]]`。例如，你可以为笔记本保留更严格默认值，同时允许匹配的 dev boxes 或 CI runners 进行 workspace writes。Host-specific 条目目前只覆盖 `allowed_sandbox_modes`：

```toml
allowed_sandbox_modes = ["read-only"]

[[remote_sandbox_config]]
hostname_patterns = ["*.devbox.example.com", "runner-??.ci.example.com"]
allowed_sandbox_modes = ["read-only", "workspace-write"]
```

Codex 会将每个 `hostname_patterns` 条目与 best-effort 解析出的 host name 比较。可用时它优先使用 fully qualified domain name，否则回退到 local host name。匹配不区分大小写；`*` 匹配任意字符序列，`?` 匹配一个字符。

在同一 requirements 来源内，第一个匹配的 `[[remote_sandbox_config]]` 条目获胜。如果没有条目匹配，Codex 保留顶层 `allowed_sandbox_modes`。Host name matching 仅用于策略选择；不要将它视为已认证的设备证明。

你还可以约束 web search mode：

```toml
allowed_web_search_modes = ["cached"] # "disabled" remains implicitly allowed
```

`allowed_web_search_modes = []` 只允许 `"disabled"`。
例如，`allowed_web_search_modes = ["cached"]` 会阻止 live web search，即使在 `danger-full-access` 会话中也是如此。

### 配置网络访问 requirements


  `[experimental_network]` 是实验性的，可能会变化。不要在未验证这些
  requirements 在用户运行的 Codex client 版本和操作系统上的行为前，将它们
  大范围启用到企业部署中。Windows 支持仍然有限；除非你已在自己的环境中
  测试过，否则应避免将此策略应用到 Windows 用户。


当管理员应集中定义网络访问 requirements 时，请在 `requirements.toml` 中使用 `[experimental_network]`。这些 requirements 独立于用户的 `features.network_proxy` 开关：它们可以在没有该 feature flag 的情况下配置 sandbox networking，但当当前 sandbox 保持 networking 关闭时，它们不会授予命令网络访问权限。

```toml
experimental_network.enabled = true
experimental_network.allowed_domains = [
  "api.openai.com",
  "*.example.com",
]
experimental_network.denied_domains = [
  "blocked.example.com",
  "*.exfil.example.com",
]
```

仅当你同时定义了管理员拥有的 `allowed_domains` 且希望该 allowlist 具有排他性时，才使用 `experimental_network.managed_allowed_domains_only = true`。如果它为 `true` 但没有托管 allow rules，则用户添加的 domain allow rules 不会继续生效。

域名语法、本地/私有目标规则、deny-over-allow 行为和 DNS rebinding 限制，与 [Agent approvals & security](/mirror/codex/agent-approvals-security#network-isolation) 中描述的 sandbox networking 行为相同。

### Pin feature flags

你也可以为接收托管 `requirements.toml` 的用户 pin [feature flags](/mirror/codex/config-basic#feature-flags)：

```toml
[features]
personality = true
unified_exec = false

# Disable specific Codex feature surfaces when needed.
browser_use = false
browser_use_full_cdp_access = false
in_app_browser = false
computer_use = false
```

请使用 `config.toml` 的 `[features]` 表中的 canonical feature keys。Codex 会规范化最终 feature set 以满足这些 pins，并拒绝对 `config.toml` 或 profile file feature settings 的冲突写入。



- `in_app_browser = false` 禁用 in-app browser pane。
- `browser_use = false` 禁用 Browser Use 和 Browser Agent 可用性。
- `browser_use_full_cdp_access = false` 阻止用户在 Browser Developer mode 中启用 full CDP access。
- `computer_use = false` 禁用 Computer Use、Record & Replay 以及相关安装或设置流程。

如果省略，这些 features 会被策略允许，但仍受正常 client、platform 和 rollout 可用性约束。

### 限制锁屏状态下的 Computer Use

要阻止 [Computer Use](/mirror/codex/app/computer-use#locked-use) 在受管 Mac 锁定后运行，请添加此 requirement：

```toml
[computer_use]
allow_locked_computer_use = false
```

此 requirement 不会启用 Computer Use。它只会阻止 macOS 上的锁屏使用。如果省略它，锁屏使用不受 requirements 约束，并且仍受正常产品可用性和用户本地设置约束。

### 配置 automatic review policy

使用 `allowed_approvals_reviewers` 要求或允许 automatic review。将其设置为 `["auto_review"]` 可要求 automatic review；包含 `"user"` 时，用户可以选择 manual approval。

设置 `guardian_policy_config` 可替换 automatic review policy 的 tenant-specific 部分。Codex 仍使用内置 reviewer template 和 output contract。托管 `guardian_policy_config` 优先于本地 `[auto_review].policy`。

```toml
allowed_approval_policies = ["on-request"]
allowed_approvals_reviewers = ["auto_review"]

guardian_policy_config = """
## Environment Profile
- Trusted internal destinations include github.com/my-org, artifacts.example.com,
  and internal CI systems.

## Tenant Risk Taxonomy and Allow/Deny Rules
- Treat uploads to unapproved third-party file-sharing services as high risk.
- Deny actions that expose credentials or private source code to untrusted
  destinations.
"""
```

### 强制执行 deny-read requirements

管理员可以通过 `[permissions.filesystem]` 对精确路径或 glob patterns 拒绝读取。用户无法通过本地配置削弱这些 requirements。

```toml
[permissions.filesystem]
deny_read = [
  # values can be absolute paths...
  "/**/*.env",
  # ...or relative to $HOME/%USERPROFILE% using `~`.
  "~/.ssh",
  # But relative paths starting with `./` are not allowed.
]
```

当存在 deny-read requirements 时，Codex 会拒绝 full-access permissions，并将本地执行保持在 read-only 或 workspace sandbox 中，以便强制执行它们。在原生 Windows 上，托管 `deny_read` 适用于直接文件工具；shell subprocess reads 不使用此 sandbox 规则。

### 从 requirements 强制执行 managed hooks

管理员也可以直接在 `requirements.toml` 中定义 managed lifecycle hooks。使用 `[hooks]` 配置 hook 本身，并将 `managed_dir` 指向 MDM 或 endpoint-management 工具安装引用脚本的目录。

要即使用户本地禁用了 hooks 也强制执行 managed hooks，请在 `[hooks]` 旁边 pin `[features].hooks = true`。要跳过 user、project、session 和 plugin hooks，同时仍允许 managed hooks，请设置 `allow_managed_hooks_only = true`。

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

说明：

- Codex 会从 `requirements.toml` 强制执行 hook 配置，但不会分发 `managed_dir` 中的脚本。
- 请通过你的 MDM 或设备管理方案单独交付这些脚本。
- Managed hook commands 应引用已配置托管目录下的绝对脚本路径。
- `allow_managed_hooks_only = true` 会跳过来自 user、project、session 和 plugin 来源的 hooks，但仍会加载来自 `requirements.toml` 和其他 managed config 层的 hooks。

### 从 requirements 强制执行 command rules

管理员还可以使用 `[rules]` 表从 `requirements.toml` 强制执行 restrictive command rules。这些规则会与常规 `.rules` 文件合并，并且最严格的 decision 仍然获胜。

与 `.rules` 不同，requirements rules 必须指定 `decision`，并且该 decision 必须是 `"prompt"` 或 `"forbidden"`（不能是 `"allow"`）。

```toml
[rules]
prefix_rules = [
  { pattern = [{ token = "rm" }], decision = "forbidden", justification = "Use git clean -fd instead." },
  { pattern = [{ token = "git" }, { any_of = ["push", "commit"] }], decision = "prompt", justification = "Require review before mutating history." },
]
```

要限制 Codex 可以启用哪些 MCP servers，请添加 `mcp_servers` approved list。对于 stdio servers，按 `command` 匹配；对于 streamable HTTP servers，按 `url` 匹配：

```toml
[mcp_servers.docs]
identity = { command = "codex-mcp" }

[mcp_servers.remote]
identity = { url = "https://example.com/mcp" }
```

`identity.command` 的字符串形式只匹配已配置的 `command`。它不会检查 `args`、`cwd`、`env` 或 `env_vars`。

要约束完整 stdio 调用，请匹配可执行文件和每个位置参数：

```toml
[mcp_servers.internal.identity]
command = { executable = "/usr/local/bin/codex-mcp", args = [
  { match = "exact", value = "serve" },
  { match = "prefix", value = "--workspace=" },
] }
```

可执行文件、参数数量和参数顺序必须匹配。Argument 和 URL 规则支持 `exact`、`prefix` 和 full-value `regex` 匹配。Structured command rules 仍不会检查 `cwd`、`env` 或 `env_vars`。Plugin-bundled MCP servers 使用 `plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;` 下的相同 identity shapes。

如果存在 `mcp_servers` 但为空，Codex 会禁用所有 MCP servers。

### 限制 plugin marketplace sources

要限制对用户配置 marketplace sources 的操作，请设置 `restrict_to_allowed_sources = true` 并定义一个或多个 source rules：

```toml
[marketplaces]
restrict_to_allowed_sources = true

[marketplaces.allowed_sources.company_plugins]
source = "git"
url = "https://github.com/example/company-plugins.git"
ref = "main"

[marketplaces.allowed_sources.internal_git]
source = "host_pattern"
host_pattern = '^git\.example\.com$'

[marketplaces.allowed_sources.local_plugins]
source = "local"
path = "/opt/company/codex-plugins"
```

Git rules 会匹配规范化后的仓库 URL；当存在 `ref` 时，还会要求精确匹配该 `ref`。Host patterns 是匹配小写 Git host 的正则表达式；请使用 `^` 和 `$` 要求 whole-host 匹配。Local rules 要求绝对且规范化的路径。完整 schema 和 merge 行为请参阅 [`requirements.toml` reference](/mirror/codex/config-reference#requirementstoml)。

这些 requirements 会拒绝 user-configured sources 中不匹配的 marketplace add、plugin install 和已配置 Git marketplace refresh 操作。当 Codex-managed OpenAI marketplaces 的 source 和保留名称匹配时，它们仍可用。这些 requirements 不会在运行时过滤已经配置的 user marketplaces 或其 plugins。

## Managed defaults（`managed_config.toml`）

Managed defaults 会合并到用户本地 `config.toml` 之上，并优先于任何 CLI `--config` overrides，用于设置 Codex 启动时的初始值。用户仍可在会话期间更改这些设置；Codex 会在下次启动时重新应用 managed defaults。

请确保你的 managed defaults 满足你的 requirements；Codex 会拒绝不被允许的值。

### 优先级和 layering

Codex 按以下顺序组装有效配置（上方覆盖下方）：

- Managed preferences（macOS MDM；最高优先级）
- `managed_config.toml`（system/managed file）
- `config.toml`（用户的 base configuration）

CLI `--config key=value` overrides 会应用到底层 base，但 managed layers 会覆盖它们。这意味着每次运行都会从 managed defaults 启动，即使你提供了本地 flags。

Cloud-managed requirements 会影响 requirements 层（而不是 managed defaults）。有关优先级，请参阅上方 Admin-enforced requirements 部分。

### 位置

- Linux/macOS（Unix）：`/etc/codex/managed_config.toml`
- Windows/non-Unix：`~/.codex/managed_config.toml`

如果该文件缺失，Codex 会跳过 managed layer。

### macOS managed preferences（MDM）

在 macOS 上，管理员可以推送设备 profile，在以下位置提供 base64 编码的 TOML payloads：

- Preference domain：`com.openai.codex`
- Keys：
  - `config_toml_base64`（managed defaults）
  - `requirements_toml_base64`（requirements）

Codex 会将这些 "managed preferences" payloads 解析为 TOML。对于 managed defaults（`config_toml_base64`），managed preferences 拥有最高优先级。对于 requirements（`requirements_toml_base64`），优先级遵循上述 cloud-managed requirements 顺序。相同的 requirements 侧 `[features]` 表也可在 `requirements_toml_base64` 中使用；同样请在那里使用 canonical feature keys。

### MDM 设置工作流

Codex 遵循标准 macOS MDM payloads，因此你可以使用 `Jamf Pro`、`Fleet` 或 `Kandji` 等工具分发设置。轻量部署如下：

1. 构建 managed payload TOML，并使用 `base64` 编码（不换行）。
2. 将该字符串放入 MDM profile 中 `com.openai.codex` domain 下的 `config_toml_base64`（managed defaults）或 `requirements_toml_base64`（requirements）。
3. 推送 profile，然后请用户重启 Codex，并确认启动配置摘要反映了 managed values。
4. 撤销或更改策略时，更新 managed payload；CLI 会在下次启动时读取刷新的 preference。

避免在 payload 中嵌入 secrets 或高频变化的动态值。请像对待任何其他受变更控制的 MDM 设置一样对待 managed TOML。

### Example managed_config.toml

```toml
# Set conservative defaults
approval_policy = "on-request"
sandbox_mode    = "workspace-write"

[sandbox_workspace_write]
network_access = false             # keep network disabled unless explicitly allowed

[otel]
environment = "prod"
exporter = "otlp-http"            # point at your collector
log_user_prompt = false            # keep prompts redacted
# exporter details live under exporter tables; see Monitoring and telemetry above
```

### 推荐防护栏

- 对多数用户优先使用带 approvals 的 `workspace-write`；将 full access 保留给受控容器。
- 除非你的安全审查允许 collector 或工作流所需域名，否则保持 `network_access = false`。
- 使用 managed configuration pin OTel 设置（exporter、environment），但除非你的策略明确允许存储 prompt contents，否则保持 `log_user_prompt = false`。
- 定期审计本地 `config.toml` 和 managed policy 之间的 diff，以发现漂移；managed layers 应优先于本地 flags 和 files。

:::

## English source

::: details 展开英文原文
::: v-pre
Enterprise admins can control local Codex behavior in two ways:

- **Requirements**: admin-enforced constraints that users can't override.
- **Managed defaults**: starting values applied when Codex launches. Users can still change settings during a session; Codex reapplies managed defaults the next time it starts.

## Admin-enforced requirements (requirements.toml)

Requirements constrain security-sensitive settings (approval policy, approvals reviewer, automatic review policy, sandbox mode, permission profiles, web search mode, managed hooks, which MCP servers users can enable, and which user-configured plugin marketplace sources they can add, install from, or refresh). When resolving configuration (for example from `config.toml`, [profile files](/mirror/codex/config-advanced#profiles), or CLI config overrides), if a value conflicts with an enforced rule, Codex falls back to a compatible value and notifies the user. If you configure an `mcp_servers` allowlist, Codex enables an MCP server only when both its name and identity match an approved entry; otherwise, Codex disables it.

Requirements can also constrain [feature flags](/mirror/codex/config-basic#feature-flags) via the `[features]` table in `requirements.toml`. Note that features aren't always security-sensitive, but enterprises can pin values if desired. Omitted keys remain unconstrained.

For Codex 0.138.0 or later, prefer [permission profiles](/mirror/codex/permissions)
with `allowed_permission_profiles` and managed `default_permissions`. Use
`allowed_sandbox_modes` only for legacy deployments that still configure
`sandbox_mode`.

For the exact key list, see the [`requirements.toml` section in Configuration Reference](/mirror/codex/config-reference#requirementstoml).

### Locations and precedence

Codex checks requirement sources in this order. If the same setting appears more
than once, the first value wins:

1. Cloud-managed requirements (ChatGPT Business or Enterprise)
2. macOS managed preferences (MDM) via `com.openai.codex:requirements_toml_base64`
3. System `requirements.toml` (`/etc/codex/requirements.toml` on Unix systems, including Linux/macOS, or `%ProgramData%\OpenAI\Codex\requirements.toml` on Windows)

Codex checks these sources from top to bottom. For ordinary settings and lists,
it uses the first value it finds. A later source can still provide a setting
that earlier sources leave unset.

Tables combine one entry at a time. For `allowed_permission_profiles`, a later
source can add profile names that earlier sources don't mention. If two sources
set the same profile name, the earlier source wins.

For backwards compatibility, Codex also interprets legacy `managed_config.toml` fields `approval_policy` and `sandbox_mode` as requirements (allowing only that single value).

### Cloud-managed requirements

When you sign in with ChatGPT on a Business or Enterprise plan, Codex can also fetch admin-enforced requirements from the Codex service. This is another source of `requirements.toml`-compatible requirements. This applies across Codex surfaces, including the CLI, App, and IDE Extension.

#### Configure cloud-managed requirements

Go to the [Codex managed-config page](https://chatgpt.com/codex/settings/managed-configs).

Create a new managed requirements file using the same format and keys as `requirements.toml`.

```toml
enforce_residency = "us"
allowed_approval_policies = ["on-request"]
allowed_sandbox_modes = ["read-only", "workspace-write"]

[rules]
prefix_rules = [
  { pattern = [{ any_of = ["bash", "sh", "zsh"] }], decision = "prompt", justification = "Require explicit approval for shell entrypoints" },
]
```

Save the configuration. Once saved, the updated managed requirements apply immediately for matching users.
For more examples, see [Example requirements.toml](/mirror/codex/enterprise/managed-configuration#example-requirementstoml).

#### Assign requirements to groups

Admins can configure different managed requirements for different user groups, and also set a default fallback requirements policy.

If a user matches more than one group-specific rule, the first matching rule applies. Codex doesn't fill unset fields from later matching group rules.

For example, if the first matching group rule sets only `allowed_sandbox_modes = ["read-only"]` and a later matching group rule sets `allowed_approval_policies = ["on-request"]`, Codex applies only the first matching group rule and doesn't fill `allowed_approval_policies` from the later rule.

#### How Codex applies cloud-managed requirements locally

When a user starts Codex and signs in with ChatGPT on a Business or Enterprise plan, Codex applies managed requirements on a best-effort basis. Codex first checks for a valid, unexpired local managed requirements cache entry and uses it if available. If the cache is missing, expired, corrupted, or doesn't match the current auth identity, Codex attempts to fetch managed requirements from the service (with retries) and writes a new signed cache entry on success. If no valid cached entry is available and the fetch fails or times out, Codex continues without the managed requirements layer.

After cache resolution, Codex enforces managed requirements as part of the normal requirements layering described above.

### Example requirements.toml

This example blocks `--ask-for-approval never` and `--sandbox danger-full-access` (including `--yolo`):

```toml
allowed_approval_policies = ["untrusted", "on-request"]
allowed_sandbox_modes = ["read-only", "workspace-write"]
```

### Disable Appshots

To disable Appshots for managed users, set the top-level `allow_appshots` requirement:

```toml
allow_appshots = false
```

Codex treats only `allow_appshots = false` as disabling Appshots. If the key is omitted, Appshots remain unconstrained by requirements and use normal product availability checks. App-server clients that read effective requirements through `configRequirements/read` receive the same restriction as `allowAppshots`; an omitted or `null` `allowAppshots` value doesn't disable Appshots.

### Disable device remote control

To disable [device remote control](/mirror/codex/remote-connections#pick-up-work-from-another-device)
for managed users, set the top-level `allow_remote_control` requirement:

```toml
allow_remote_control = false
```

Codex treats only `allow_remote_control = false` as disabling device remote
control. If the key is omitted, device remote control remains unconstrained by
requirements and uses normal product availability checks. This requirement does
not disable SSH remote connections.

### Control available permission profiles

Use `allowed_permission_profiles` to control which built-in and custom
[permission profiles](/mirror/codex/permissions) users can select. This is the
permission-profile equivalent of `allowed_sandbox_modes`; use the allowlist that
matches how your users select permissions.

Permission-profile allowlists require Codex 0.138.0 or later. Codex 0.137.0 and
earlier ignore `allowed_permission_profiles` and managed
`default_permissions`.

Use the permission-profile examples below only after every managed client runs a
supporting release. Don't deploy managed custom profiles until the fleet upgrade
is complete.

When the table is present, it's the complete list of allowed profiles. Profiles
set to `true` are allowed. Profiles that are omitted or set to `false` are
denied, including built-ins added in future Codex versions.

#### Allow the standard profiles

This policy allows read-only and workspace access, but not full access:

```toml
default_permissions = ":workspace"

[allowed_permission_profiles]
":read-only" = true
":workspace" = true
# ":danger-full-access" is omitted, so it is denied.
```

#### Add a managed least-privilege default

Admins can define a custom profile in the same requirements source. Use
organization-specific profile names that won't collide with names in users'
loaded config. Custom names can't start with `:` or use the reserved `filesystem`
name.

Don't deploy managed custom profiles to clients running Codex 0.137.0 or
earlier. Those clients recognize the profile table but not the managed default
that selects it.

For example:

```toml
default_permissions = "acme_review_only"

[allowed_permission_profiles]
":read-only" = true
":workspace" = true
acme_review_only = true
# ":danger-full-access" is intentionally omitted, so it is denied.

[permissions.acme_review_only]
description = "Review code without modifying the workspace."
extends = ":read-only"
```

#### Allow only enterprise-defined profiles

Omit all built-ins when users should select only admin-defined profiles:

```toml
default_permissions = "acme_workspace"

[allowed_permission_profiles]
acme_workspace = true

[permissions.acme_workspace]
description = "Workspace access with sensitive files denied."
extends = ":workspace"

[permissions.acme_workspace.filesystem]
glob_scan_max_depth = 3

[permissions.acme_workspace.filesystem.":workspace_roots"]
"**/*.env" = "deny"
```

The custom profile can extend `:workspace` even though users can't select the
built-in `:workspace` profile directly.

#### Turn off a profile allowed by another source

Permission allowlists combine by profile name. Because Codex checks cloud
requirements before system requirements, cloud requirements can use `false` to
turn off a profile allowed by the system file.

Cloud requirements:

```toml
default_permissions = ":read-only"

[allowed_permission_profiles]
":read-only" = true
":workspace" = false
```

System requirements:

```toml
[allowed_permission_profiles]
":read-only" = true
":workspace" = true  # Not honored because cloud requirements set this to false.
```

Set `default_permissions` explicitly to an allowed profile. If it's omitted,
Codex defaults to `:workspace` only when both `:workspace` and `:read-only` are
explicitly allowed. When `allowed_permission_profiles` is absent, managed
requirements don't restrict which profile names users can select. Every entry
must name a built-in profile or a custom profile defined in a loaded config or
requirements source. Define custom profiles in managed requirements when their
behavior should be controlled centrally.

### Override sandbox requirements by host

Use `[[remote_sandbox_config]]` when one managed policy should apply different
sandbox requirements on different hosts. For example, you can keep a stricter
default for laptops while allowing workspace writes on matching dev boxes or CI
runners. Host-specific entries currently override `allowed_sandbox_modes` only:

```toml
allowed_sandbox_modes = ["read-only"]

[[remote_sandbox_config]]
hostname_patterns = ["*.devbox.example.com", "runner-??.ci.example.com"]
allowed_sandbox_modes = ["read-only", "workspace-write"]
```

Codex compares each `hostname_patterns` entry against the best-effort resolved
host name. It prefers the fully qualified domain name when available and falls
back to the local host name. Matching is case-insensitive; `*` matches any
sequence of characters, and `?` matches one character.

The first matching `[[remote_sandbox_config]]` entry wins within the same
requirements source. If no entry matches, Codex keeps the top-level
`allowed_sandbox_modes`. Host name matching is for policy selection only; don't
treat it as authenticated device proof.

You can also constrain web search mode:

```toml
allowed_web_search_modes = ["cached"] # "disabled" remains implicitly allowed
```

`allowed_web_search_modes = []` allows only `"disabled"`.
For example, `allowed_web_search_modes = ["cached"]` prevents live web search even in `danger-full-access` sessions.

### Configure network access requirements


  `[experimental_network]` is experimental and may change. Do not enable these
  requirements broadly across an enterprise deployment without validating them
  on the Codex client versions and operating systems your users run. Windows
  support is still limited; avoid applying this policy to Windows users unless
  you have tested it in your environment.


Use `[experimental_network]` in `requirements.toml` when administrators should
define network access requirements centrally. These requirements are separate
from the user `features.network_proxy` toggle: they can configure sandbox
networking without that feature flag, but they don't grant command network
access when the active sandbox keeps networking off.

```toml
experimental_network.enabled = true
experimental_network.allowed_domains = [
  "api.openai.com",
  "*.example.com",
]
experimental_network.denied_domains = [
  "blocked.example.com",
  "*.exfil.example.com",
]
```

Use `experimental_network.managed_allowed_domains_only = true` only when you
also define administrator-owned `allowed_domains` and want that allowlist to be
exclusive. If it's `true` without managed allow rules, user-added domain allow
rules don't remain effective.

The domain syntax, local/private destination rules, deny-over-allow behavior,
and DNS rebinding limitations are the same as the sandbox networking behavior
described in [Agent approvals & security](/mirror/codex/agent-approvals-security#network-isolation).

### Pin feature flags

You can also pin [feature flags](/mirror/codex/config-basic#feature-flags) for users
receiving a managed `requirements.toml`:

```toml
[features]
personality = true
unified_exec = false

# Disable specific Codex feature surfaces when needed.
browser_use = false
browser_use_full_cdp_access = false
in_app_browser = false
computer_use = false
```

Use the canonical feature keys from `config.toml`'s `[features]` table. Codex normalizes the resulting feature set to meet these pins and rejects conflicting writes to `config.toml` or profile file feature settings.



- `in_app_browser = false` disables the in-app browser pane.
- `browser_use = false` disables Browser Use and Browser Agent availability.
- `browser_use_full_cdp_access = false` prevents users from enabling full CDP
  access in Browser Developer mode.
- `computer_use = false` disables Computer Use, Record & Replay, and related
  install or setup flows.

If omitted, these features are allowed by policy, subject to normal client,
platform, and rollout availability.

### Restrict locked computer use

To prevent [Computer Use](/mirror/codex/app/computer-use#locked-use) from operating
after a managed Mac locks, add this requirement:

```toml
[computer_use]
allow_locked_computer_use = false
```

This requirement doesn't enable Computer Use. It only prevents locked use on
macOS. If you omit it, locked use remains unconstrained by requirements and is
still subject to normal product availability and the user's local setting.

### Configure automatic review policy

Use `allowed_approvals_reviewers` to require or allow automatic review. Set it
to `["auto_review"]` to require automatic review, or include `"user"` when users
can choose manual approval.

Set `guardian_policy_config` to replace the tenant-specific section of the
automatic review policy. Codex still uses the built-in reviewer template and
output contract. Managed `guardian_policy_config` takes precedence over local
`[auto_review].policy`.

```toml
allowed_approval_policies = ["on-request"]
allowed_approvals_reviewers = ["auto_review"]

guardian_policy_config = """
## Environment Profile
- Trusted internal destinations include github.com/my-org, artifacts.example.com,
  and internal CI systems.

## Tenant Risk Taxonomy and Allow/Deny Rules
- Treat uploads to unapproved third-party file-sharing services as high risk.
- Deny actions that expose credentials or private source code to untrusted
  destinations.
"""
```

### Enforce deny-read requirements

Admins can deny reads for exact paths or glob patterns with
`[permissions.filesystem]`. Users can't weaken these requirements with local
configuration.

```toml
[permissions.filesystem]
deny_read = [
  # values can be absolute paths...
  "/**/*.env",
  # ...or relative to $HOME/%USERPROFILE% using `~`.
  "~/.ssh",
  # But relative paths starting with `./` are not allowed.
]
```

When deny-read requirements are present, Codex rejects full-access permissions
and keeps local execution in a read-only or workspace sandbox so it can enforce
them. On native Windows, managed `deny_read` applies to direct file tools; shell
subprocess reads don't use this sandbox rule.

### Enforce managed hooks from requirements

Admins can also define managed lifecycle hooks directly in `requirements.toml`.
Use `[hooks]` for the hook configuration itself, and point `managed_dir` at the
directory where your MDM or endpoint-management tooling installs the referenced
scripts.

To enforce managed hooks even for users who disabled hooks locally, pin
`[features].hooks = true` alongside `[hooks]`. To skip user, project, session,
and plugin hooks while still allowing managed hooks, set
`allow_managed_hooks_only = true`.

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

Notes:

- Codex enforces the hook configuration from `requirements.toml`, but it does
  not distribute the scripts in `managed_dir`.
- Deliver those scripts separately with your MDM or device-management solution.
- Managed hook commands should reference absolute script paths under the
  configured managed directory.
- `allow_managed_hooks_only = true` skips hooks from user, project, session, and
  plugin sources, but still loads hooks from `requirements.toml` and other
  managed config layers.

### Enforce command rules from requirements

Admins can also enforce restrictive command rules from `requirements.toml`
using a `[rules]` table. These rules merge with regular `.rules` files, and the
most restrictive decision still wins.

Unlike `.rules`, requirements rules must specify `decision`, and that decision
must be `"prompt"` or `"forbidden"` (not `"allow"`).

```toml
[rules]
prefix_rules = [
  { pattern = [{ token = "rm" }], decision = "forbidden", justification = "Use git clean -fd instead." },
  { pattern = [{ token = "git" }, { any_of = ["push", "commit"] }], decision = "prompt", justification = "Require review before mutating history." },
]
```

To restrict which MCP servers Codex can enable, add an `mcp_servers` approved list. For stdio servers, match on `command`; for streamable HTTP servers, match on `url`:

```toml
[mcp_servers.docs]
identity = { command = "codex-mcp" }

[mcp_servers.remote]
identity = { url = "https://example.com/mcp" }
```

The string form of `identity.command` matches only the configured `command`. It
doesn't inspect `args`, `cwd`, `env`, or `env_vars`.

To constrain a complete stdio invocation, match the executable and each
positional argument:

```toml
[mcp_servers.internal.identity]
command = { executable = "/usr/local/bin/codex-mcp", args = [
  { match = "exact", value = "serve" },
  { match = "prefix", value = "--workspace=" },
] }
```

The executable, argument count, and argument order must match. Argument and URL
rules support `exact`, `prefix`, and full-value `regex` matching. Structured
command rules still don't inspect `cwd`, `env`, or `env_vars`. Plugin-bundled
MCP servers use the same identity shapes under
`plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;`.

If `mcp_servers` is present but empty, Codex disables all MCP servers.

### Restrict plugin marketplace sources

To restrict operations on user-configured marketplace sources, set
`restrict_to_allowed_sources = true` and define one or more source rules:

```toml
[marketplaces]
restrict_to_allowed_sources = true

[marketplaces.allowed_sources.company_plugins]
source = "git"
url = "https://github.com/example/company-plugins.git"
ref = "main"

[marketplaces.allowed_sources.internal_git]
source = "host_pattern"
host_pattern = '^git\.example\.com$'

[marketplaces.allowed_sources.local_plugins]
source = "local"
path = "/opt/company/codex-plugins"
```

Git rules match the normalized repository URL and, when present, an exact
`ref`. Host patterns are regular expressions matched against the lowercase Git
host; use `^` and `$` for a whole-host match. Local rules require an absolute,
normalized path. See the [`requirements.toml` reference](/mirror/codex/config-reference#requirementstoml)
for the full schema and merge behavior.

These requirements reject unmatched marketplace add, plugin install, and
configured Git marketplace refresh operations for user-configured sources.
Codex-managed OpenAI marketplaces remain available when their source and
reserved name match. The requirements don't filter already configured user
marketplaces or their plugins at runtime.

## Managed defaults (`managed_config.toml`)

Managed defaults merge on top of a user's local `config.toml` and take precedence over any CLI `--config` overrides, setting the starting values when Codex launches. Users can still change those settings during a session; Codex reapplies managed defaults the next time it starts.

Make sure your managed defaults meet your requirements; Codex rejects disallowed values.

### Precedence and layering

Codex assembles the effective configuration in this order (top overrides bottom):

- Managed preferences (macOS MDM; highest precedence)
- `managed_config.toml` (system/managed file)
- `config.toml` (user's base configuration)

CLI `--config key=value` overrides apply to the base, but managed layers override them. This means each run starts from the managed defaults even if you provide local flags.

Cloud-managed requirements affect the requirements layer (not managed defaults). See the Admin-enforced requirements section above for precedence.

### Locations

- Linux/macOS (Unix): `/etc/codex/managed_config.toml`
- Windows/non-Unix: `~/.codex/managed_config.toml`

If the file is missing, Codex skips the managed layer.

### macOS managed preferences (MDM)

On macOS, admins can push a device profile that provides base64-encoded TOML payloads at:

- Preference domain: `com.openai.codex`
- Keys:
  - `config_toml_base64` (managed defaults)
  - `requirements_toml_base64` (requirements)

Codex parses these "managed preferences" payloads as TOML. For managed defaults (`config_toml_base64`), managed preferences have the highest precedence. For requirements (`requirements_toml_base64`), precedence follows the cloud-managed requirements order described above. The same requirements-side `[features]` table works in `requirements_toml_base64`; use canonical feature keys there as well.

### MDM setup workflow

Codex honors standard macOS MDM payloads, so you can distribute settings with tooling like `Jamf Pro`, `Fleet`, or `Kandji`. A lightweight deployment looks like:

1. Build the managed payload TOML and encode it with `base64` (no wrapping).
2. Drop the string into your MDM profile under the `com.openai.codex` domain at `config_toml_base64` (managed defaults) or `requirements_toml_base64` (requirements).
3. Push the profile, then ask users to restart Codex and confirm the startup config summary reflects the managed values.
4. When revoking or changing policy, update the managed payload; the CLI reads the refreshed preference the next time it launches.

Avoid embedding secrets or high-churn dynamic values in the payload. Treat the managed TOML like any other MDM setting under change control.

### Example managed_config.toml

```toml
# Set conservative defaults
approval_policy = "on-request"
sandbox_mode    = "workspace-write"

[sandbox_workspace_write]
network_access = false             # keep network disabled unless explicitly allowed

[otel]
environment = "prod"
exporter = "otlp-http"            # point at your collector
log_user_prompt = false            # keep prompts redacted
# exporter details live under exporter tables; see Monitoring and telemetry above
```

### Recommended guardrails

- Prefer `workspace-write` with approvals for most users; reserve full access for controlled containers.
- Keep `network_access = false` unless your security review allows a collector or domains required by your workflows.
- Use managed configuration to pin OTel settings (exporter, environment), but keep `log_user_prompt = false` unless your policy explicitly allows storing prompt contents.
- Periodically audit diffs between local `config.toml` and managed policy to catch drift; managed layers should win over local flags and files.

:::
:::

