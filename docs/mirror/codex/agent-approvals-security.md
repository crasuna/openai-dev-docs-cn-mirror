---
title: "Agent approvals & security"
description: "How to securely operate Codex with sandboxing, approvals, and network controls"
outline: deep
---

# Agent approvals & security

**文档集**：Codex  
**分组**：Codex — Agent Approvals Security  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/agent-approvals-security](https://developers.openai.com/codex/agent-approvals-security)
- Markdown 来源：[https://developers.openai.com/codex/agent-approvals-security.md](https://developers.openai.com/codex/agent-approvals-security.md)
- 抓取时间：2026-06-27T05:54:49.501Z
- Checksum：`0e4565feb798d5201c921e447b5c7c357a7715bde53f3d6f0a2a3ce0ea9493af`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex 帮助保护你的代码和数据，并降低被误用的风险。

本页介绍如何安全地运行 Codex，包括 sandboxing、approvals 和网络访问。如果你要查找用于扫描已连接 GitHub 仓库的 Codex Security 产品，请参阅 [Codex Security](/mirror/codex/security)。

默认情况下，agent 会在网络访问关闭的状态下运行。在本地，Codex 使用由操作系统强制执行的 sandbox 来限制它可以触达的范围（通常限于当前 workspace），并使用 approval policy 控制它在执行操作前何时必须停下来询问你。

关于 Codex app、IDE extension 和 CLI 中 sandboxing 工作方式的高层说明，请参阅 [sandboxing](/mirror/codex/concepts/sandboxing)。更广泛的企业安全概览请参阅 [Codex security white paper](https://trust.openai.com/?itemUid=382f924d-54f3-43a8-a9df-c39e6c959958&source=click)。

## Sandbox 和 approvals

Codex 安全控制来自两层协同工作的机制：

- **Sandbox mode**：当 Codex 执行模型生成的命令时，它在技术上能做什么（例如可以写入哪里，以及是否可以访问网络）。
- **Approval policy**：Codex 在执行某个动作前什么时候必须询问你（例如离开 sandbox、使用网络，或运行受信任集合之外的命令）。

Codex 会根据运行位置使用不同的 sandbox modes：

- **Codex cloud**：在 OpenAI 管理的隔离容器中运行，防止访问你的 host system 或无关数据。它使用两阶段 runtime model：setup 在 agent phase 之前运行，可以访问网络以安装指定依赖；随后 agent phase 默认离线运行，除非你为该环境启用 internet access。为 cloud environments 配置的 secrets 只在 setup 期间可用，并会在 agent phase 开始前移除。
- **Codex CLI / IDE extension**：由 OS-level 机制强制执行 sandbox policies。默认设置包括无网络访问，并且写入权限限制在 active workspace 内。你可以根据自己的风险承受能力配置 sandbox、approval policy 和 network settings。

在 `Auto` preset（例如 `--sandbox workspace-write --ask-for-approval on-request`）中，Codex 可以自动读取文件、进行编辑，并在 working directory 中运行命令。

Codex 会在编辑 workspace 外的文件或运行需要网络访问的命令时请求 approval。如果你只想聊天或规划而不做更改，请使用 `/permissions` 命令切换到 `read-only` mode。

Codex 也可以针对声明会产生 side effects 的 app（connector）tool calls 请求 approval，即使该操作不是 shell command 或文件更改。破坏性 app/MCP tool calls 在 tool 声明 destructive annotation 时总是需要 approval，即使它同时声明了其他 hints（例如 read-only hints）。

## 网络访问 &lt;ElevatedRiskBadge class="ml-2" /&gt;

对于 Codex cloud，请参阅 [agent internet access](/mirror/codex/cloud/internet-access)，以启用完整 internet access 或 domain allow list。

对于 Codex app、CLI 或 IDE Extension，默认的 `workspace-write` sandbox mode 会保持网络访问关闭，除非你在配置中启用它：

```toml
[sandbox_workspace_write]
network_access = true
```

### 网络隔离

网络访问通过 destination rules 控制，这些规则适用于命令启动的 scripts、programs 和 subprocesses。当 command network access 已经启用时，请开启 `network_proxy` feature，将该流量约束到你配置的 network policy。

```toml
[features.network_proxy]
enabled = true
domains = { "api.openai.com" = "allow", "example.com" = "deny" }
```

对于一次性的 CLI session，如果只需要开关，可以使用 boolean shorthand；如果还要设置 policy options，则使用 table 形式：

```bash
codex \
  -c 'features.network_proxy=true' \
  -c 'sandbox_workspace_write.network_access=true'

codex \
  -c 'features.network_proxy.enabled=true' \
  -c 'features.network_proxy.domains={ "api.openai.com" = "allow", "example.com" = "deny" }' \
  -c 'sandbox_workspace_write.network_access=true'
```

该 feature 会改变已启用的网络访问如何被强制执行；它本身不会授予网络访问。使用带有 `workspace-write` config 的 `sandbox_workspace_write.network_access` 来决定命令是否完全拥有网络访问：

- Network off + `network_proxy` on：网络保持关闭，该 feature 不起作用。
- Network on + `network_proxy` off：网络保持开启，并具有不受限制的直接 outbound access。
- Network on + `network_proxy` on：网络保持开启，并且 outbound traffic 受到配置的 network policy 约束。

管理员管理的 `experimental_network` requirements 与用户 feature toggle 是分开的。它们可以在没有 `features.network_proxy` 的情况下配置并启动 sandboxed networking，但在 active sandbox 保持网络关闭时不会开启网络访问。管理员侧 `requirements.toml` 的结构请参阅 [Managed configuration](/mirror/codex/enterprise/managed-configuration#configure-network-access-requirements)。

#### Network policy

Domain rules 采用 allowlist-first：

- 精确 hosts 只匹配自身。
- `*.example.com` 匹配 `api.example.com` 等 subdomains，但不匹配 `example.com`。
- `**.example.com` 同时匹配 apex 和 subdomains。
- 全局 `*` allow rule 会匹配任何未被 deny 的 public host。请将 `*` 视为宽泛网络访问，并尽可能优先使用 scoped rules。
- `deny` 总是优先于 `allow`，且全局 `*` 只对 allow rules 有效。

#### 本地和私有 destinations

默认情况下，`allow_local_binding = false` 会阻止 loopback、link-local 和 private destinations：

- 特定例外：当命令需要某个本地目标时，添加精确的本地 IP literal 或 `localhost` allow rule。
- 更宽访问：只有在你有意允许更广的 local/private reach 时，才设置 `allow_local_binding = true`。
- Wildcards：wildcard rules 不计为显式 local exceptions。
- Resolved addresses：解析到 local/private IPs 的 hostnames 即使匹配 allowlist，也会保持阻止。

#### DNS rebinding 防护

在允许某个 hostname 之前，Codex 会尽力执行 DNS 和 IP classification 检查：

- 失败或超时的 lookups 会被阻止。
- 解析到非 public addresses 的 hostnames 会被阻止。
- 该检查降低 DNS rebinding 风险，但不会消除它。要完全防止 rebinding，需要在 transport layer pin resolved IPs。

如果 hostile DNS 在你的威胁范围内，也请在更低层强制执行 egress controls。

#### 危险设置

两个设置会刻意扩大 trust boundary：

- `dangerously_allow_non_loopback_proxy = true` 可能会将 proxy listeners 暴露到 loopback 之外。
- `dangerously_allow_all_unix_sockets = true` 会绕过 Unix socket allowlist。

仅在严格受控的环境中使用它们。启用 Unix socket proxying 时，即使请求了 non-loopback binding，listeners 也会保持 loopback-only，因此 sandboxed networking 不会变成通向 local daemons 的 remote bridge。

`network_proxy` 默认关闭。启用后：

| Setting                                | Default | Behavior                                                                                                                                                                              |
| -------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`                              | `false` | 仅当 command network access 已经开启时，才启动 sandboxed networking。                                                                                                           |
| `domains`                              | unset   | 使用 allowlist 行为，因此在添加 `allow` rules 之前，不允许任何外部 destinations。支持精确 hosts、scoped wildcards 和全局 `*` allow rules；`deny` 总是优先。 |
| `unix_sockets`                         | unset   | 在添加显式 `allow` rules 之前，不允许任何 Unix socket destinations。                                                                                                         |
| `allow_local_binding`                  | `false` | 阻止本地和私有网络 destinations，除非你添加精确的本地 IP literal 或 `localhost` allow rule，或显式选择更广的 local/private access。                |
| `enable_socks5`                        | `true`  | 当 policy 允许时暴露 SOCKS5 support。                                                                                                                                         |
| `enable_socks5_udp`                    | `true`  | 当 SOCKS5 可用时，允许 UDP over SOCKS5。                                                                                                                                      |
| `allow_upstream_proxy`                 | `true`  | 让 sandboxed networking 遵循环境中的 upstream proxy。                                                                                                               |
| `dangerously_allow_non_loopback_proxy` | `false` | 保持 listener endpoints 在 loopback 上，除非你刻意将其暴露到 localhost 之外。                                                                                            |
| `dangerously_allow_all_unix_sockets`   | `false` | 保持 Unix socket access 基于 allowlist，除非你刻意绕过该保护。                                                                                              |

你还可以控制 [web search tool](https://platform.openai.com/docs/guides/tools-web-search)，而不向 spawned commands 授予完整网络访问。Codex 默认使用 web search cache 来访问结果。该 cache 是 OpenAI 维护的 web results 索引，因此 cached mode 会返回预索引结果，而不是获取 live pages。这会减少任意 live content 带来的 prompt injection 暴露面，但你仍应将 web results 视为不可信。如果你使用 `--yolo` 或其他 [full access sandbox setting](/mirror/codex/agent-approvals-security#common-sandbox-and-approval-combinations)，web search 默认使用 live results。使用 `--search` 或设置 `web_search = "live"` 以允许 live browsing，或将其设为 `"disabled"` 以关闭该 tool：

```toml
web_search = "cached"  # default
# web_search = "disabled"
# web_search = "live"  # same as --search
```

在 Codex 中启用网络访问或 web search 时请谨慎。Prompt injection 可能导致 agent 获取并遵循不可信指令。

## 默认值与建议

- 启动时，Codex 会检测文件夹是否受版本控制，并推荐：
  - 受版本控制的文件夹：`Auto`（workspace write + on-request approvals）
  - 非版本控制文件夹：`read-only`
- 取决于你的设置，Codex 也可能先以 `read-only` 启动，直到你显式信任 working directory（例如通过 onboarding prompt 或 `/permissions`）。
- workspace 包括当前目录以及 `/tmp` 等临时目录。使用 `/status` 命令查看哪些目录在 workspace 中。
- 要接受默认设置，请运行 `codex`。
- 你可以显式设置：
  - `codex --sandbox workspace-write --ask-for-approval on-request`
  - `codex --sandbox read-only --ask-for-approval on-request`

### 可写 roots 中的 protected paths

在默认 `workspace-write` sandbox policy 中，可写 roots 仍包含 protected paths：

- 无论 `&lt;writable_root&gt;/.git` 是目录还是文件，都会作为 read-only 受到保护。
- 如果 `&lt;writable_root&gt;/.git` 是 pointer file（`gitdir: ...`），解析后的 Git directory path 也会作为 read-only 受到保护。
- 当 `&lt;writable_root&gt;/.agents` 以目录形式存在时，它作为 read-only 受到保护。
- 当 `&lt;writable_root&gt;/.codex` 以目录形式存在时，它作为 read-only 受到保护。
- 保护是递归的，因此这些路径下的所有内容都是 read-only。

### 无 approval prompts 运行

你可以使用 `--ask-for-approval never` 或 `-a never`（shorthand）禁用 approval prompts。

此选项适用于所有 `--sandbox` modes，因此你仍然可以控制 Codex 的自治级别。Codex 会在你设置的约束内尽力执行。

如果需要 Codex 在没有 approval prompts 的情况下读取文件、进行编辑，并使用网络访问运行命令，请使用 `--sandbox danger-full-access`（或 `--dangerously-bypass-approvals-and-sandbox` flag）。这样做前请谨慎。

作为中间方案，`approval_policy = { granular = { ... } }` 可让你保持特定 approval prompt categories 为交互式，同时自动拒绝其他类别。granular policy 覆盖 sandbox approvals、execpolicy-rule prompts、MCP prompts、`request_permissions` prompts 和 skill-script approvals。

### Automatic approval reviews

默认情况下，approval requests 会路由给你：

```toml
approvals_reviewer = "user"
```

当 approvals 是交互式时，例如 `approval_policy = "on-request"` 或 granular approval policy，automatic approval reviews 会生效。将 `approvals_reviewer = "auto_review"` 设置为通过 reviewer agent 路由符合条件的 approval requests，然后 Codex 才运行该请求：

```toml
approval_policy = "on-request"
approvals_reviewer = "auto_review"
```

完整 reviewer lifecycle、触发条件、配置优先级和失败行为请参阅 [Auto-review](/mirror/codex/concepts/sandboxing/auto-review)。

reviewer 只评估已经需要 approval 的动作，例如 sandbox escalations、blocked network requests、`request_permissions` prompts，或具有 side effects 的 app 和 MCP tool calls。留在 sandbox 内的动作会继续执行，不会增加额外 review step。

reviewer policy 会检查 data exfiltration、credential probing、persistent security weakening 和 destructive actions。当 policy 允许时，low-risk 和 medium-risk actions 可以继续。policy 会拒绝 critical-risk actions。High-risk actions 需要足够的用户授权，并且没有匹配的 deny rule。Prompt-build、review-session 和 parse failures 会 fail closed。Timeouts 会单独呈现，但该动作仍不会运行。

[默认 reviewer policy](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md) 位于开源 Codex 仓库。企业可以用 managed requirements 中的 `guardian_policy_config` 替换其 tenant-specific section。也支持本地 `[auto_review].policy` 文本，但 managed requirements 优先。设置详情请参阅 [Managed configuration](/mirror/codex/enterprise/managed-configuration#configure-automatic-review-policy)。

在 Codex app 中，这些 reviews 会显示为 automatic review items，状态可能是 Reviewing、Approved、Denied、Aborted 或 Timed out。它们还可以包含 risk level，以及对被 review request 的 user-authorization assessment。

Automatic review 会使用额外的 model calls，因此可能增加 Codex 使用量。Admins 可以通过 `allowed_approvals_reviewers` 对其加以约束。

### 常见 sandbox 与 approval 组合

| Intent                                                            | Flags / config                                                                                                                      | Effect                                                                                                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Auto（preset）                                                     | _no flags needed_ 或 `--sandbox workspace-write --ask-for-approval on-request`                                                      | Codex 可以读取文件、进行编辑，并在 workspace 中运行命令。Codex 需要 approval 才能编辑 workspace 外部内容或访问网络。 |
| 安全的 read-only 浏览                                           | `--sandbox read-only --ask-for-approval on-request`                                                                                 | Codex 可以读取文件并回答问题。Codex 需要 approval 才能进行编辑、运行命令或访问网络。                               |
| Read-only non-interactive（CI）                                    | `--sandbox read-only --ask-for-approval never`                                                                                      | Codex 只能读取文件；从不请求 approval。                                                                                              |
| 自动编辑，但运行不可信命令前请求 approval | `--sandbox workspace-write --ask-for-approval untrusted`                                                                            | Codex 可以读取和编辑文件，但会在运行 untrusted commands 前请求 approval。                                                           |
| Auto-review mode                                                  | `--sandbox workspace-write --ask-for-approval on-request -c approvals_reviewer=auto_review` 或 `approvals_reviewer = "auto_review"` | 与标准 on-request mode 相同的 sandbox boundary，但符合条件的 approval requests 会由 Auto-review review，而不是呈现给用户。  |
| Dangerous full access                                             | `--dangerously-bypass-approvals-and-sandbox`（alias：`--yolo`）                                                                      | &lt;ElevatedRiskBadge /&gt; 无 sandbox；无 approvals _（不推荐）_                                                                               |

对于 non-interactive runs，使用 `codex exec --sandbox workspace-write`；Codex 将较旧的 `codex exec --full-auto` 调用保留为 deprecated compatibility path，并会打印警告。

使用 `--ask-for-approval untrusted` 时，Codex 只会自动运行已知安全的读取操作。可能改变状态或触发外部执行路径的命令（例如破坏性 Git 操作或 Git output/config-override flags）需要 approval。

#### `config.toml` 中的配置

更广泛的配置工作流请参阅 [Config basics](/mirror/codex/config-basic)、[Advanced Config](/mirror/codex/config-advanced#approval-policies-and-sandbox-modes) 和 [Configuration Reference](/mirror/codex/config-reference)。

```toml
# Always ask for approval mode
approval_policy = "untrusted"
sandbox_mode    = "read-only"
allow_login_shell = false # optional hardening: disallow login shells for shell-based tools

# Optional: Allow network in workspace-write mode
[sandbox_workspace_write]
network_access = true

# Optional: granular approval policy
# approval_policy = { granular = {
#   sandbox_approval = true,
#   rules = true,
#   mcp_elicitations = true,
#   request_permissions = false,
#   skill_approval = false
# } }
```

你还可以将 presets 保存为 [profile files](/mirror/codex/config-advanced#profiles)，然后使用 `codex --profile profile-name` 选择它们：

```toml
# ~/.codex/full_auto.config.toml
approval_policy = "on-request"
sandbox_mode    = "workspace-write"
```

```toml
# ~/.codex/readonly_quiet.config.toml
approval_policy = "never"
sandbox_mode    = "read-only"
```

### 在本地测试 sandbox

要查看命令在 Codex sandbox 下运行时会发生什么，请使用这些 Codex CLI 命令：

```bash
# macOS
codex sandbox macos [--permissions-profile <name>] [--log-denials] [COMMAND]...
# Linux
codex sandbox linux [--permissions-profile <name>] [COMMAND]...
# Windows
codex sandbox windows [--permissions-profile <name>] [COMMAND]...
```

`sandbox` 命令也可以作为 `codex debug` 使用，并且 platform helpers 有 aliases（例如 `codex sandbox seatbelt` 和 `codex sandbox landlock`）。

## OS-level sandbox

Codex 会根据你的 OS 以不同方式强制执行 sandbox：

- **macOS** 使用 Seatbelt policies，并通过 `sandbox-exec` 以与你选择的 `--sandbox` mode 对应的 profile（`-p`）运行命令。当受限读取访问启用 platform defaults 时，Codex 会附加精选的 macOS platform policy（而不是宽泛允许 `/System`），以保留常见 tool compatibility。
- **Linux** 默认使用 `bwrap` 加 `seccomp`。
- **Windows** 在 [Windows Subsystem for Linux 2 (WSL2)](/mirror/codex/windows#windows-subsystem-for-linux) 中运行时使用 Linux sandbox implementation。WSL1 支持到 Codex `0.114`；从 `0.115` 开始，Linux sandbox 迁移到 `bwrap`，因此不再支持 WSL1。原生运行在 Windows 上时，Codex 使用 [Windows sandbox](/mirror/codex/windows#windows-sandbox) implementation。

如果你在 Windows 上使用 Codex IDE extension，它直接支持 WSL2。请在 VS Code settings 中设置以下内容，以便在 WSL2 可用时让 agent 保持在 WSL2 内：

```json
{
  "chatgpt.runCodexInWindowsSubsystemForLinux": true
}
```

这可确保 IDE extension 即使在 host OS 是 Windows 时，也继承 Linux sandbox semantics，用于 commands、approvals 和 filesystem access。更多信息见 [Windows setup guide](/mirror/codex/windows)。

原生运行在 Windows 上时，请在 `config.toml` 中配置 native sandbox mode：

```toml
[windows]
sandbox = "unelevated" # or "elevated"
# sandbox_private_desktop = true  # default; set false only for compatibility
```

详情请参阅 [Windows setup guide](/mirror/codex/windows#windows-sandbox)。

当你在 Docker 等容器化环境中运行 Linux 时，如果 host 或 container configuration 阻止 Codex 所需的 namespace、setuid `bwrap` 或 `seccomp` 操作，sandbox 可能无法工作。

在这种情况下，请配置 Docker container 以提供你需要的隔离，然后在 container 内使用 `--sandbox danger-full-access`（或 `--dangerously-bypass-approvals-and-sandbox` flag）运行 `codex`。

### 在 Dev Containers 中运行 Codex

如果你的 host 无法直接运行 Linux sandbox，或你的组织已经标准化使用 containerized development，请使用 Dev Containers 运行 Codex，并让 Docker 提供外层 isolation boundary。它可与 Visual Studio Code Dev Containers 和兼容工具配合使用。

以 [Codex secure devcontainer example](https://github.com/openai/codex/tree/main/.devcontainer) 作为参考实现。该示例安装 Codex、常见开发工具、`bubblewrap`，以及基于 firewall 的 outbound controls。

Devcontainers 提供了实质性保护，但不能防止所有攻击。如果你在 container 内使用 `--sandbox danger-full-access` 或 `--dangerously-bypass-approvals-and-sandbox` 运行 Codex，恶意项目可能 exfiltrate devcontainer 内可用的任何内容，包括 Codex credentials。仅对受信任的仓库使用此模式，并像监控任何其他 elevated environment 一样监控 Codex activity。

参考实现包括：

- 安装了 Codex 和常见开发工具的 Ubuntu 24.04 base image；
- allowlist-driven firewall profile，用于 outbound access；
- VS Code settings 和 extension recommendations，用于在 container 中重新打开 workspace；
- 用于 command history 和 Codex configuration 的 persistent mounts；
- `bubblewrap`，这样当 container 授予所需 capabilities 时，Codex 仍可使用其 Linux sandbox。

试用步骤：

1. 安装 Visual Studio Code 和 [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)。
2. 将 Codex 示例 `.devcontainer` 设置复制到你的 repository，或直接从 Codex repository 开始。
3. 在 VS Code 中运行 **Dev Containers: Open Folder in Container...**，并选择 `.devcontainer/devcontainer.secure.json`。
4. container 启动后，打开 terminal 并运行 `codex`。

你也可以从 CLI 启动 container：

```bash
devcontainer up --workspace-folder . --config .devcontainer/devcontainer.secure.json
```

该示例包含三个主要部分：

- `.devcontainer/devcontainer.secure.json` 控制 container settings、capabilities、mounts、environment variables 和 VS Code extensions。
- `.devcontainer/Dockerfile.secure` 定义基于 Ubuntu 的 image 和已安装 tools。
- `.devcontainer/init-firewall.sh` 应用 outbound network policy。

参考 firewall 有意作为起点。如果你依赖 domain allowlisting 进行隔离，请实现适合你环境的 DNS rebinding 和 DNS refresh protections，例如 TTL-aware refreshes 或 DNS-aware firewall。

在 container 内，选择以下模式之一：

- 如果 Dev Container profile 授予 `bwrap` 创建内部 sandbox 所需的 capabilities，请保持 Codex 的 Linux sandbox 启用。
- 如果 container 是你预期的 security boundary，请在 container 内使用 `--sandbox danger-full-access` 运行 Codex，这样 Codex 不会尝试创建第二层 sandbox。

## 版本控制

Codex 最适合搭配版本控制工作流使用：

- 在 feature branch 上工作，并在委托前保持 `git status` 干净。这会让 Codex patches 更容易隔离和回滚。
- 优先使用 patch-based workflows（例如 `git diff`/`git apply`），而不是直接编辑 tracked files。频繁提交，以便你能以小增量回滚。
- 像对待任何其他 PR 一样对待 Codex suggestions：运行 targeted verification、review diffs，并在 commit messages 中记录决策以便审计。

## Monitoring 与 telemetry

Codex 支持 opt-in monitoring via OpenTelemetry（OTel），以帮助团队审计使用情况、调查问题，并满足合规要求，同时不削弱本地安全默认值。Telemetry 默认关闭；请在配置中显式启用。

### 概览

- Codex 默认关闭 OTel export，以保持本地运行 self-contained。
- 启用后，Codex 会发出 structured log events，覆盖 conversations、API requests、SSE/WebSocket stream activity、user prompts（默认 redacted）、tool approval decisions 和 tool results。
- Codex 会使用 `service.name`（originator）、CLI version 和 environment label 标记 exported events，以区分 dev/staging/prod traffic。

### 启用 OTel（opt-in）

在 Codex configuration（通常是 `~/.codex/config.toml`）中添加 `[otel]` block，选择 exporter，以及是否记录 prompt text。

```toml
[otel]
environment = "staging"   # dev | staging | prod
exporter = "none"          # none | otlp-http | otlp-grpc
log_user_prompt = false     # redact prompt text unless policy allows
```

- `exporter = "none"` 会保持 instrumentation active，但不会向任何地方发送数据。
- 要将 events 发送到你自己的 collector，请选择其一：

```toml
[otel]
exporter = { otlp-http = {
  endpoint = "https://otel.example.com/v1/logs",
  protocol = "binary",
  headers = { "x-otlp-api-key" = "${OTLP_TOKEN}" }
}}
```

```toml
[otel]
exporter = { otlp-grpc = {
  endpoint = "https://otel.example.com:4317",
  headers = { "x-otlp-meta" = "abc123" }
}}
```

Codex 会批处理 events，并在 shutdown 时 flush。Codex 只导出由其 OTel module 产生的 telemetry。

### Event categories

代表性 event types 包括：

- `codex.conversation_starts`（model、reasoning settings、sandbox/approval policy）
- `codex.api_request`（attempt、status/success、duration 和 error details）
- `codex.sse_event`（stream event kind、success/failure、duration，以及 `response.completed` 上的 token counts）
- `codex.websocket_request` 和 `codex.websocket_event`（request duration，以及每条消息的 kind/success/error）
- `codex.user_prompt`（length；content 默认 redacted，除非显式启用）
- `codex.tool_decision`（approved/denied，source：configuration vs. user）
- `codex.tool_result`（duration、success、output snippet）

相关 OTel metrics（counter 加 duration histogram pairs）包括 `codex.api_request`、`codex.sse_event`、`codex.websocket.request`、`codex.websocket.event` 和 `codex.tool.call`（带对应的 `.duration_ms` instruments）。

完整 event catalog 和 configuration reference 请参阅 [GitHub 上的 Codex configuration documentation](https://github.com/openai/codex/blob/main/docs/config.md#otel)。

### 安全与隐私指南

- 除非 policy 明确允许存储 prompt contents，否则保持 `log_user_prompt = false`。Prompts 可能包含 source code 和 sensitive data。
- 只将 telemetry 路由到你控制的 collectors；应用与你合规要求一致的 retention limits 和 access controls。
- 将 tool arguments 和 outputs 视为 sensitive。尽可能在 collector 或 SIEM 中进行 redaction。
- 如果你不希望 Codex 在 `CODEX_HOME` 下保存 session transcripts，请 review local data retention settings（例如 `history.persistence` / `history.max_bytes`）。参见 [Advanced Config](/mirror/codex/config-advanced#history-persistence) 和 [Configuration Reference](/mirror/codex/config-reference)。
- 如果你在网络访问关闭的情况下运行 CLI，OTel export 无法到达你的 collector。要 export，请在 `workspace-write` mode 中为 OTel endpoint 允许网络访问，或从 Codex cloud export，并将 collector domain 放入 approved list。
- 定期 review events，关注 approval/sandbox changes 和 unexpected tool executions。

OTel 是可选的，旨在补充而不是取代本页描述的 sandbox 和 approval protections。

## Managed configuration

Enterprise admins 可以在 [Managed configuration](/mirror/codex/enterprise/managed-configuration) 中为其 workspace 配置 Codex security settings。设置和 policy 详情见该页面。

:::

## English source

::: details 展开英文原文
::: v-pre
Codex helps protect your code and data and reduces the risk of misuse.

This page covers how to operate Codex safely, including sandboxing, approvals,
  and network access. If you are looking for Codex Security, the product for
  scanning connected GitHub repositories, see [Codex Security](/mirror/codex/security).

By default, the agent runs with network access turned off. Locally, Codex uses an OS-enforced sandbox that limits what it can touch (typically to the current workspace), plus an approval policy that controls when it must stop and ask you before acting.

For a high-level explanation of how sandboxing works across the Codex app, IDE
extension, and CLI, see [sandboxing](/mirror/codex/concepts/sandboxing).
For a broader enterprise security overview, see the [Codex security white paper](https://trust.openai.com/?itemUid=382f924d-54f3-43a8-a9df-c39e6c959958&source=click).

## Sandbox and approvals

Codex security controls come from two layers that work together:

- **Sandbox mode**: What Codex can do technically (for example, where it can write and whether it can reach the network) when it executes model-generated commands.
- **Approval policy**: When Codex must ask you before it executes an action (for example, leaving the sandbox, using the network, or running commands outside a trusted set).

Codex uses different sandbox modes depending on where you run it:

- **Codex cloud**: Runs in isolated OpenAI-managed containers, preventing access to your host system or unrelated data. Uses a two-phase runtime model: setup runs before the agent phase and can access the network to install specified dependencies, then the agent phase runs offline by default unless you enable internet access for that environment. Secrets configured for cloud environments are available only during setup and are removed before the agent phase starts.
- **Codex CLI / IDE extension**: OS-level mechanisms enforce sandbox policies. Defaults include no network access and write permissions limited to the active workspace. You can configure the sandbox, approval policy, and network settings based on your risk tolerance.

In the `Auto` preset (for example, `--sandbox workspace-write --ask-for-approval on-request`), Codex can read files, make edits, and run commands in the working directory automatically.

Codex asks for approval to edit files outside the workspace or to run commands that require network access. If you want to chat or plan without making changes, switch to `read-only` mode with the `/permissions` command.

Codex can also elicit approval for app (connector) tool calls that advertise side effects, even when the action isn't a shell command or file change. Destructive app/MCP tool calls always require approval when the tool advertises a destructive annotation, even if it also advertises other hints (for example, read-only hints).

## Network access &lt;ElevatedRiskBadge class="ml-2" /&gt;

For Codex cloud, see [agent internet access](/mirror/codex/cloud/internet-access) to enable full internet access or a domain allow list.

For the Codex app, CLI, or IDE Extension, the default `workspace-write` sandbox mode keeps network access turned off unless you enable it in your configuration:

```toml
[sandbox_workspace_write]
network_access = true
```

### Network isolation

Network access is controlled through destination rules that apply to scripts,
programs, and subprocesses spawned by commands. When command network access is
already enabled, turn on the `network_proxy` feature to constrain that traffic
to the network policy you configure.

```toml
[features.network_proxy]
enabled = true
domains = { "api.openai.com" = "allow", "example.com" = "deny" }
```

For a one-off CLI session, use the boolean shorthand when you only need the
toggle, and the table form when you also set policy options:

```bash
codex \
  -c 'features.network_proxy=true' \
  -c 'sandbox_workspace_write.network_access=true'

codex \
  -c 'features.network_proxy.enabled=true' \
  -c 'features.network_proxy.domains={ "api.openai.com" = "allow", "example.com" = "deny" }' \
  -c 'sandbox_workspace_write.network_access=true'
```

The feature changes how enabled network access is enforced; it does not grant
network access by itself. Use `sandbox_workspace_write.network_access` with
`workspace-write` config to decide whether commands have network access at all:

- Network off + `network_proxy` on: network stays off, and the feature does nothing.
- Network on + `network_proxy` off: network stays on with unrestricted direct
  outbound access.
- Network on + `network_proxy` on: network stays on, and outbound traffic is
  constrained by the configured network policy.

Admin-managed `experimental_network` requirements are separate from the user
feature toggle. They can configure and start sandboxed networking without
`features.network_proxy`, but they do not turn on network access when the active
sandbox keeps it off. See [Managed configuration](/mirror/codex/enterprise/managed-configuration#configure-network-access-requirements)
for the administrator-side `requirements.toml` shape.

#### Network policy

Domain rules are allowlist-first:

- Exact hosts match only themselves.
- `*.example.com` matches subdomains such as `api.example.com`, but not
  `example.com`.
- `**.example.com` matches both the apex and subdomains.
- A global `*` allow rule matches any public host that is not denied. Treat `*`
  as broad network access and prefer scoped rules when you can.
- `deny` always wins over `allow`, and global `*` is only valid for allow rules.

#### Local and private destinations

By default, `allow_local_binding = false` blocks loopback, link-local, and
private destinations:

- Specific exceptions: add an exact local IP literal or `localhost` allow rule
  when a command needs one local target.
- Broader access: set `allow_local_binding = true` only when you intentionally
  want wider local/private reach.
- Wildcards: wildcard rules do not count as explicit local exceptions.
- Resolved addresses: hostnames that resolve to local/private IPs stay blocked
  even if they match the allowlist.

#### DNS rebinding protections

Before allowing a hostname, Codex performs a best-effort DNS and IP
classification check:

- Lookups that fail or time out are blocked.
- Hostnames that resolve to non-public addresses are blocked.
- The check reduces DNS rebinding risk, but it does not eliminate it. Preventing
  rebinding completely would require pinning resolved IPs through the transport
  layer.

If hostile DNS is in scope, enforce egress controls at a lower layer too.

#### Dangerous settings

Two settings deliberately widen the trust boundary:

- `dangerously_allow_non_loopback_proxy = true` can expose proxy listeners beyond
  loopback.
- `dangerously_allow_all_unix_sockets = true` bypasses the Unix socket allowlist.

Use them only in tightly controlled environments. When Unix socket proxying is
enabled, listeners stay loopback-only even if non-loopback binding was requested,
so sandboxed networking does not become a remote bridge into local daemons.

`network_proxy` is off by default. When you enable it:

| Setting                                | Default | Behavior                                                                                                                                                                              |
| -------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`                              | `false` | Starts sandboxed networking only when command network access is already on.                                                                                                           |
| `domains`                              | unset   | Uses allowlist behavior, so no external destinations are allowed until you add `allow` rules. Supports exact hosts, scoped wildcards, and global `*` allow rules; `deny` always wins. |
| `unix_sockets`                         | unset   | No Unix socket destinations are allowed until you add explicit `allow` rules.                                                                                                         |
| `allow_local_binding`                  | `false` | Blocks local and private-network destinations unless you add an exact local IP literal or `localhost` allow rule, or explicitly opt into broader local/private access.                |
| `enable_socks5`                        | `true`  | Exposes SOCKS5 support when policy allows it.                                                                                                                                         |
| `enable_socks5_udp`                    | `true`  | Allows UDP over SOCKS5 when SOCKS5 is available.                                                                                                                                      |
| `allow_upstream_proxy`                 | `true`  | Lets sandboxed networking honor an upstream proxy from the environment.                                                                                                               |
| `dangerously_allow_non_loopback_proxy` | `false` | Keeps listener endpoints on loopback unless you deliberately expose them beyond localhost.                                                                                            |
| `dangerously_allow_all_unix_sockets`   | `false` | Keeps Unix socket access allowlist-based unless you deliberately bypass that protection.                                                                                              |

You can also control the [web search tool](https://platform.openai.com/docs/guides/tools-web-search) without granting full network access to spawned commands. Codex defaults to using a web search cache to access results. The cache is an OpenAI-maintained index of web results, so cached mode returns pre-indexed results instead of fetching live pages. This reduces exposure to prompt injection from arbitrary live content, but you should still treat web results as untrusted. If you are using `--yolo` or another [full access sandbox setting](/mirror/codex/agent-approvals-security#common-sandbox-and-approval-combinations), web search defaults to live results. Use `--search` or set `web_search = "live"` to allow live browsing, or set it to `"disabled"` to turn the tool off:

```toml
web_search = "cached"  # default
# web_search = "disabled"
# web_search = "live"  # same as --search
```

Use caution when enabling network access or web search in Codex. Prompt injection can cause the agent to fetch and follow untrusted instructions.

## Defaults and recommendations

- On launch, Codex detects whether the folder is version-controlled and recommends:
  - Version-controlled folders: `Auto` (workspace write + on-request approvals)
  - Non-version-controlled folders: `read-only`
- Depending on your setup, Codex may also start in `read-only` until you explicitly trust the working directory (for example, via an onboarding prompt or `/permissions`).
- The workspace includes the current directory and temporary directories like `/tmp`. Use the `/status` command to see which directories are in the workspace.
- To accept the defaults, run `codex`.
- You can set these explicitly:
  - `codex --sandbox workspace-write --ask-for-approval on-request`
  - `codex --sandbox read-only --ask-for-approval on-request`

### Protected paths in writable roots

In the default `workspace-write` sandbox policy, writable roots still include protected paths:

- `&lt;writable_root&gt;/.git` is protected as read-only whether it appears as a directory or file.
- If `&lt;writable_root&gt;/.git` is a pointer file (`gitdir: ...`), the resolved Git directory path is also protected as read-only.
- `&lt;writable_root&gt;/.agents` is protected as read-only when it exists as a directory.
- `&lt;writable_root&gt;/.codex` is protected as read-only when it exists as a directory.
- Protection is recursive, so everything under those paths is read-only.

### Run without approval prompts

You can disable approval prompts with `--ask-for-approval never` or `-a never` (shorthand).

This option works with all `--sandbox` modes, so you still control Codex's level of autonomy. Codex makes a best effort within the constraints you set.

If you need Codex to read files, make edits, and run commands with network access without approval prompts, use `--sandbox danger-full-access` (or the `--dangerously-bypass-approvals-and-sandbox` flag). Use caution before doing so.

For a middle ground, `approval_policy = { granular = { ... } }` lets you keep specific approval prompt categories interactive while automatically rejecting others. The granular policy covers sandbox approvals, execpolicy-rule prompts, MCP prompts, `request_permissions` prompts, and skill-script approvals.

### Automatic approval reviews

By default, approval requests route to you:

```toml
approvals_reviewer = "user"
```

Automatic approval reviews apply when approvals are interactive, such as
`approval_policy = "on-request"` or a granular approval policy. Set
`approvals_reviewer = "auto_review"` to route eligible approval requests
through a reviewer agent before Codex runs the request:

```toml
approval_policy = "on-request"
approvals_reviewer = "auto_review"
```

For the full reviewer lifecycle, trigger conditions, configuration precedence,
and failure behavior, see
[Auto-review](/mirror/codex/concepts/sandboxing/auto-review).

The reviewer evaluates only actions that already need approval, such as sandbox
escalations, blocked network requests, `request_permissions` prompts, or
side-effecting app and MCP tool calls. Actions that stay inside the sandbox
continue without an extra review step.

The reviewer policy checks for data exfiltration, credential probing, persistent
security weakening, and destructive actions. Low-risk and medium-risk actions
can proceed when policy allows them. The policy denies critical-risk actions.
High-risk actions require enough user authorization and no matching deny rule.
Prompt-build, review-session, and parse failures fail closed. Timeouts are
surfaced separately, but the action still does not run.

The [default reviewer policy](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md)
is in the open-source Codex repository. Enterprises can replace its
tenant-specific section with `guardian_policy_config` in managed requirements.
Local `[auto_review].policy` text is also supported, but managed requirements
take precedence. For setup details, see
[Managed configuration](/mirror/codex/enterprise/managed-configuration#configure-automatic-review-policy).

In the Codex app, these reviews appear as automatic review items with a status
such as Reviewing, Approved, Denied, Aborted, or Timed out. They can also
include a risk level and user-authorization assessment for the reviewed
request.

Automatic review uses extra model calls, so it can add to Codex usage. Admins
can constrain it with `allowed_approvals_reviewers`.

### Common sandbox and approval combinations

| Intent                                                            | Flags / config                                                                                                                      | Effect                                                                                                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Auto (preset)                                                     | _no flags needed_ or `--sandbox workspace-write --ask-for-approval on-request`                                                      | Codex can read files, make edits, and run commands in the workspace. Codex requires approval to edit outside the workspace or to access network. |
| Safe read-only browsing                                           | `--sandbox read-only --ask-for-approval on-request`                                                                                 | Codex can read files and answer questions. Codex requires approval to make edits, run commands, or access network.                               |
| Read-only non-interactive (CI)                                    | `--sandbox read-only --ask-for-approval never`                                                                                      | Codex can only read files; never asks for approval.                                                                                              |
| Automatically edit but ask for approval to run untrusted commands | `--sandbox workspace-write --ask-for-approval untrusted`                                                                            | Codex can read and edit files but asks for approval before running untrusted commands.                                                           |
| Auto-review mode                                                  | `--sandbox workspace-write --ask-for-approval on-request -c approvals_reviewer=auto_review` or `approvals_reviewer = "auto_review"` | Same sandbox boundary as standard on-request mode, but eligible approval requests are reviewed by Auto-review instead of surfacing to the user.  |
| Dangerous full access                                             | `--dangerously-bypass-approvals-and-sandbox` (alias: `--yolo`)                                                                      | &lt;ElevatedRiskBadge /&gt; No sandbox; no approvals _(not recommended)_                                                                               |

For non-interactive runs, use `codex exec --sandbox workspace-write`; Codex keeps older `codex exec --full-auto` invocations as a deprecated compatibility path and prints a warning.

With `--ask-for-approval untrusted`, Codex runs only known-safe read operations automatically. Commands that can mutate state or trigger external execution paths (for example, destructive Git operations or Git output/config-override flags) require approval.

#### Configuration in `config.toml`

For the broader configuration workflow, see [Config basics](/mirror/codex/config-basic), [Advanced Config](/mirror/codex/config-advanced#approval-policies-and-sandbox-modes), and the [Configuration Reference](/mirror/codex/config-reference).

```toml
# Always ask for approval mode
approval_policy = "untrusted"
sandbox_mode    = "read-only"
allow_login_shell = false # optional hardening: disallow login shells for shell-based tools

# Optional: Allow network in workspace-write mode
[sandbox_workspace_write]
network_access = true

# Optional: granular approval policy
# approval_policy = { granular = {
#   sandbox_approval = true,
#   rules = true,
#   mcp_elicitations = true,
#   request_permissions = false,
#   skill_approval = false
# } }
```

You can also save presets as [profile files](/mirror/codex/config-advanced#profiles), then select them with `codex --profile profile-name`:

```toml
# ~/.codex/full_auto.config.toml
approval_policy = "on-request"
sandbox_mode    = "workspace-write"
```

```toml
# ~/.codex/readonly_quiet.config.toml
approval_policy = "never"
sandbox_mode    = "read-only"
```

### Test the sandbox locally

To see what happens when a command runs under the Codex sandbox, use these Codex CLI commands:

```bash
# macOS
codex sandbox macos [--permissions-profile <name>] [--log-denials] [COMMAND]...
# Linux
codex sandbox linux [--permissions-profile <name>] [COMMAND]...
# Windows
codex sandbox windows [--permissions-profile <name>] [COMMAND]...
```

The `sandbox` command is also available as `codex debug`, and the platform helpers have aliases (for example `codex sandbox seatbelt` and `codex sandbox landlock`).

## OS-level sandbox

Codex enforces the sandbox differently depending on your OS:

- **macOS** uses Seatbelt policies and runs commands using `sandbox-exec` with a profile (`-p`) that corresponds to the `--sandbox` mode you selected. When restricted read access enables platform defaults, Codex appends a curated macOS platform policy (instead of broadly allowing `/System`) to preserve common tool compatibility.
- **Linux** uses `bwrap` plus `seccomp` by default.
- **Windows** uses the Linux sandbox implementation when running in [Windows Subsystem for Linux 2 (WSL2)](/mirror/codex/windows#windows-subsystem-for-linux). WSL1 was supported through Codex `0.114`; starting in `0.115`, the Linux sandbox moved to `bwrap`, so WSL1 is no longer supported. When running natively on Windows, Codex uses a [Windows sandbox](/mirror/codex/windows#windows-sandbox) implementation.

If you use the Codex IDE extension on Windows, it supports WSL2 directly. Set the following in your VS Code settings to keep the agent inside WSL2 whenever it's available:

```json
{
  "chatgpt.runCodexInWindowsSubsystemForLinux": true
}
```

This ensures the IDE extension inherits Linux sandbox semantics for commands, approvals, and filesystem access even when the host OS is Windows. Learn more in the [Windows setup guide](/mirror/codex/windows).

When running natively on Windows, configure the native sandbox mode in `config.toml`:

```toml
[windows]
sandbox = "unelevated" # or "elevated"
# sandbox_private_desktop = true  # default; set false only for compatibility
```

See the [Windows setup guide](/mirror/codex/windows#windows-sandbox) for details.

When you run Linux in a containerized environment such as Docker, the sandbox may not work if the host or container configuration blocks the namespace, setuid `bwrap`, or `seccomp` operations that Codex needs.

In that case, configure your Docker container to provide the isolation you need, then run `codex` with `--sandbox danger-full-access` (or the `--dangerously-bypass-approvals-and-sandbox` flag) inside the container.

### Run Codex in Dev Containers

If your host cannot run the Linux sandbox directly, or if your organization already standardizes on containerized development, run Codex with Dev Containers and let Docker provide the outer isolation boundary. This works with Visual Studio Code Dev Containers and compatible tools.

Use the [Codex secure devcontainer example](https://github.com/openai/codex/tree/main/.devcontainer) as a reference implementation. The example installs Codex, common development tools, `bubblewrap`, and firewall-based outbound controls.

Devcontainers provide substantial protection, but they do not prevent every
  attack. If you run Codex with `--sandbox danger-full-access` or
  `--dangerously-bypass-approvals-and-sandbox` inside the container, a malicious
  project can exfiltrate anything available inside the devcontainer, including
  Codex credentials. Use this pattern only with trusted repositories, and
  monitor Codex activity as you would in any other elevated environment.

The reference implementation includes:

- an Ubuntu 24.04 base image with Codex and common development tools installed;
- an allowlist-driven firewall profile for outbound access;
- VS Code settings and extension recommendations for reopening the workspace in a container;
- persistent mounts for command history and Codex configuration;
- `bubblewrap`, so Codex can still use its Linux sandbox when the container grants the needed capabilities.

To try it:

1. Install Visual Studio Code and the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
2. Copy the Codex example `.devcontainer` setup into your repository, or start from the Codex repository directly.
3. In VS Code, run **Dev Containers: Open Folder in Container...** and select `.devcontainer/devcontainer.secure.json`.
4. After the container starts, open a terminal and run `codex`.

You can also start the container from the CLI:

```bash
devcontainer up --workspace-folder . --config .devcontainer/devcontainer.secure.json
```

The example has three main pieces:

- `.devcontainer/devcontainer.secure.json` controls container settings, capabilities, mounts, environment variables, and VS Code extensions.
- `.devcontainer/Dockerfile.secure` defines the Ubuntu-based image and installed tools.
- `.devcontainer/init-firewall.sh` applies the outbound network policy.

The reference firewall is intentionally a starting point. If you depend on domain allowlisting for isolation, implement DNS rebinding and DNS refresh protections that fit your environment, such as TTL-aware refreshes or a DNS-aware firewall.

Inside the container, choose one of these modes:

- Keep Codex's Linux sandbox enabled if the Dev Container profile grants the capabilities needed for `bwrap` to create the inner sandbox.
- If the container is your intended security boundary, run Codex with `--sandbox danger-full-access` inside the container so Codex does not try to create a second sandbox layer.

## Version control

Codex works best with a version control workflow:

- Work on a feature branch and keep `git status` clean before delegating. This keeps Codex patches easier to isolate and revert.
- Prefer patch-based workflows (for example, `git diff`/`git apply`) over editing tracked files directly. Commit frequently so you can roll back in small increments.
- Treat Codex suggestions like any other PR: run targeted verification, review diffs, and document decisions in commit messages for auditing.

## Monitoring and telemetry

Codex supports opt-in monitoring via OpenTelemetry (OTel) to help teams audit usage, investigate issues, and meet compliance requirements without weakening local security defaults. Telemetry is off by default; enable it explicitly in your configuration.

### Overview

- Codex turns off OTel export by default to keep local runs self-contained.
- When enabled, Codex emits structured log events covering conversations, API requests, SSE/WebSocket stream activity, user prompts (redacted by default), tool approval decisions, and tool results.
- Codex tags exported events with `service.name` (originator), CLI version, and an environment label to separate dev/staging/prod traffic.

### Enable OTel (opt-in)

Add an `[otel]` block to your Codex configuration (typically `~/.codex/config.toml`), choosing an exporter and whether to log prompt text.

```toml
[otel]
environment = "staging"   # dev | staging | prod
exporter = "none"          # none | otlp-http | otlp-grpc
log_user_prompt = false     # redact prompt text unless policy allows
```

- `exporter = "none"` leaves instrumentation active but doesn't send data anywhere.
- To send events to your own collector, pick one of:

```toml
[otel]
exporter = { otlp-http = {
  endpoint = "https://otel.example.com/v1/logs",
  protocol = "binary",
  headers = { "x-otlp-api-key" = "${OTLP_TOKEN}" }
}}
```

```toml
[otel]
exporter = { otlp-grpc = {
  endpoint = "https://otel.example.com:4317",
  headers = { "x-otlp-meta" = "abc123" }
}}
```

Codex batches events and flushes them on shutdown. Codex exports only telemetry produced by its OTel module.

### Event categories

Representative event types include:

- `codex.conversation_starts` (model, reasoning settings, sandbox/approval policy)
- `codex.api_request` (attempt, status/success, duration, and error details)
- `codex.sse_event` (stream event kind, success/failure, duration, plus token counts on `response.completed`)
- `codex.websocket_request` and `codex.websocket_event` (request duration plus per-message kind/success/error)
- `codex.user_prompt` (length; content redacted unless explicitly enabled)
- `codex.tool_decision` (approved/denied, source: configuration vs. user)
- `codex.tool_result` (duration, success, output snippet)

Associated OTel metrics (counter plus duration histogram pairs) include `codex.api_request`, `codex.sse_event`, `codex.websocket.request`, `codex.websocket.event`, and `codex.tool.call` (with corresponding `.duration_ms` instruments).

For the full event catalog and configuration reference, see the [Codex configuration documentation on GitHub](https://github.com/openai/codex/blob/main/docs/config.md#otel).

### Security and privacy guidance

- Keep `log_user_prompt = false` unless policy explicitly permits storing prompt contents. Prompts can include source code and sensitive data.
- Route telemetry only to collectors you control; apply retention limits and access controls aligned with your compliance requirements.
- Treat tool arguments and outputs as sensitive. Favor redaction at the collector or SIEM when possible.
- Review local data retention settings (for example, `history.persistence` / `history.max_bytes`) if you don't want Codex to save session transcripts under `CODEX_HOME`. See [Advanced Config](/mirror/codex/config-advanced#history-persistence) and [Configuration Reference](/mirror/codex/config-reference).
- If you run the CLI with network access turned off, OTel export can't reach your collector. To export, allow network access in `workspace-write` mode for the OTel endpoint, or export from Codex cloud with the collector domain on your approved list.
- Review events periodically for approval/sandbox changes and unexpected tool executions.

OTel is optional and designed to complement, not replace, the sandbox and approval protections described above.

## Managed configuration

Enterprise admins can configure Codex security settings for their workspace in [Managed configuration](/mirror/codex/enterprise/managed-configuration). See that page for setup and policy details.

:::
:::

