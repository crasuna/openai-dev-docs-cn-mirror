---
status: needs-review
sourceId: "61ff6a6b55bd"
sourceChecksum: "61ff6a6b55bd79dfd5e2801ec3e7db26def65e478e1c1278146ef2d1a52a5588"
sourceUrl: "https://developers.openai.com/codex/permissions"
translatedAt: "2026-06-27T19:06:51.2133192+08:00"
translator: codex-gpt-5.5-xhigh
---

# 权限

Beta。Permission profiles 正在积极开发中，可能会发生变化。

Permission profiles 不会与较旧的 sandbox settings 组合使用。请配置 `default_permissions` 和 `[permissions]`，或配置 `sandbox_mode` / `sandbox_workspace_write`，但不要两者同时配置。如果任何已加载 config file 中出现 `sandbox_mode`，你传入 `--sandbox`，或所选 config profile 设置了 `sandbox_mode`，Codex 会使用这些较旧的 sandbox settings，而不是 `default_permissions`。

Managed `allowed_permission_profiles` 是例外：它会让 Codex 使用 permission profiles。在部署 managed profile allowlist 之前，请移除 `sandbox_mode` 和 `[sandbox_workspace_write]` 等较旧设置。对于 mixed-version enterprise rollout，你可以暂时保留 managed `allowed_sandbox_modes` requirement 作为兼容性约束，直到每个 client 都运行 Codex 0.138.0 或更高版本。

Permission profiles 让你可以对 Codex 代表你运行的本地命令应用 least-privilege boundaries。Profile 是一个命名 policy，它将 filesystem rules（定义命令可以读写什么）与 network rules（定义命令可以访问哪些 destinations）组合起来。

使用 profiles，为 Codex 提供当前任务所需的足够访问权限，同时避免授予对你的机器或网络的宽泛访问。例如，read-only profile 可以让 Codex 检查项目而不编辑它，而 write-capable profile 可以将编辑限制在选定 workspace roots 内。

Local permission profiles 支持 macOS、Linux、WSL 和 native Windows。平台特定的详情和注意事项请参阅 [Scope and enforcement](#scope-and-enforcement)。

如需 Codex cloud network settings，请参阅 [Internet Access](https://developers.openai.com/codex/cloud/internet-access)。

## 定义和选择 profile

Codex 包含三个内置 permission profiles：

- `:read-only` 保持本地命令执行为只读。
- `:workspace` 允许在 active workspace roots 和 system temp directories 内写入。
- `:danger-full-access` 移除本地 sandbox restrictions，并且只有在明确需要这种宽泛访问时才应使用。

在 `[permissions.<name>]` 下创建 named profile，然后将顶层 `default_permissions` key 设置为该 profile name，或设置为上面的某个 built-in。在此示例中，`project-edit` 是 user-defined profile name，而不是 built-in value。

Enterprise administrators 可以定义 profiles，并通过 managed `requirements.toml` 限制用户可以选择哪些 profiles。一旦存在 `allowed_permission_profiles`，未列出的 profiles 都会被拒绝，包括未列出的 built-ins 和未来 Codex 版本中新增的 profiles。推荐的 managed configuration 请参阅 [Control available permission profiles](https://developers.openai.com/codex/enterprise/managed-configuration#control-available-permission-profiles)。

Custom profiles 使用两个相关概念：

- `[permissions.<name>.workspace_roots]` 添加具体目录，这些目录应算作该 profile 的 workspace roots。
- `[permissions.<name>.filesystem.":workspace_roots"]` 定义 Codex 在每个 effective workspace root 内应用的 filesystem rules：当前 session 的 runtime workspace roots 加上上面 profile-defined roots。

Profiles 也使用常规 config-layer model。更高优先级的 layers 可以在同一个 profile name 下添加或替换 entries，而不必重述整个 profile。

例如，organization-level config 和 user-level config 可以独立扩展同一个 profile：

```toml
# /etc/codex/config.toml
[permissions.server.workspace_roots]
"~/code/server" = true
```

```toml
# ~/.codex/config.toml
[permissions.server.workspace_roots]
"~/code/mobile-app" = true
```

当 `server` 处于 active 状态时，两个 workspace roots 都会参与 effective profile。

```toml
default_permissions = "project-edit"

[permissions.project-edit.workspace_roots]
"~/code/app" = true
"~/code/shared-lib" = true

[permissions.project-edit.filesystem]
":minimal" = "read"

[permissions.project-edit.filesystem.":workspace_roots"]
"." = "write"
".devcontainer" = "read"
"**/*.env" = "deny"

[permissions.project-edit.network]
enabled = true

[permissions.project-edit.network.domains]
"api.openai.com" = "allow"
"objects.githubusercontent.com" = "allow"
"*.github.com" = "allow"
"tracking.example.com" = "deny"
```

此 profile：

- 读取常用开发者工具所需的 minimal runtime paths。
- 将相同的 workspace-root rules 应用于当前 session 和 profile-defined roots。
- 让 `.devcontainer/` 等 IDE-adjacent settings 在每个 root 下保持只读。
- 用 glob rule 拒绝匹配的 environment files。
- 只允许通过已配置 domain policy 访问网络。

在 active profile 内，即使更宽泛路径可读或可写，更窄的 deny rules 仍然生效。例如，profile 可以让 workspace roots 可写，同时仍将匹配的 `.env` 路径设置为 `deny`。

## 扩展 profile

当某个 profile 与 built-in 或另一个 named profile 大体相同时，请使用 `extends`。优先扩展 built-in profile，而不是从零开始，这样 baseline protections 会被继承。例如，扩展 `:workspace` 会让 workspace root 的 `.codex` directory 保持只读，除非你显式覆盖。设置一次 parent，然后只添加或覆盖不同的 rules。

```toml
default_permissions = "project-edit"

[permissions.project-edit]
description = "Project editing with OpenAI API access."
extends = ":workspace"

[permissions.project-edit.filesystem.":workspace_roots"]
"**/*.env" = "deny"

[permissions.project-edit.network]
enabled = true

[permissions.project-edit.network.domains]
"api.openai.com" = "allow"
```

此 profile 以 `:workspace` 为起点，保持匹配的 `.env` files 被拒绝，并允许向 `api.openai.com` 发出请求。Profile 可以扩展 `:read-only`、`:workspace` 或另一个 named profile。它不能扩展 `:danger-full-access`；Codex 也会拒绝 unknown parents 和 inheritance cycles。

## 配置规范

| 条目                                                              | 类型 / 值                  | 默认值                  | 详情                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------- | -------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default_permissions`                                             | String profile name        | None                    | 命名 Codex 默认应用的 permissions profile。它必须匹配 `[permissions]` 下的 profile，或 `:workspace` 等 built-in。请显式设置它以获得可预测行为；managed requirements 只有在 `:workspace` 和 `:read-only` 都被显式允许时才可以省略它。除非 managed `allowed_permission_profiles` 告诉 Codex 在此设置中使用 permission profiles，否则 Codex 会使用较旧的 sandbox settings。 |
| `[permissions.<name>]`                                            | Table                      | None                    | 定义 named profile。`default_permissions` 会选择一个 profile 作为默认；其他 permission-profile settings 也使用 profile name。                                                                                                                                                                                                                                                                                 |
| `permissions.<name>.description`                                  | String                     | None                    | 为 profile 提供 human-readable description。Profile 不会通过 `extends` 继承 parent 的 description。                                                                                                                                                                                                                                                                                                           |
| `permissions.<name>.extends`                                      | String profile name        | None                    | 让此 profile 从另一个 named profile 或 built-in `:read-only` / `:workspace` profile 开始。Codex 会拒绝 `:danger-full-access`、unknown parents 和 inheritance cycles。                                                                                                                                                                                                                                          |
| `[permissions.<name>.workspace_roots]`                            | Table                      | None                    | 添加 profile-defined workspace roots，这些 roots 会与当前 session 的 runtime workspace roots 一起接收 `:workspace_roots` filesystem rules。                                                                                                                                                                                                                                                                  |
| `permissions.<name>.workspace_roots."<path>"`                     | Boolean                    | `false`                 | 当为 `true` 时，将该 path 添加到 profile 的 workspace root set。设置为 `false` 的 entries 保持 inactive。                                                                                                                                                                                                                                                                                                    |
| `[permissions.<name>.filesystem]`                                 | Table                      | None                    | 将 filesystem paths 映射到 access values 或 scoped subpath maps。缺失或空的 filesystem tables 会保持 filesystem access 受限，并发出 startup warning。                                                                                                                                                                                                                                                        |
| `permissions.<name>.filesystem.glob_scan_max_depth`               | Number                     | None                    | 当 Codex 在 sandbox startup 前快照 matches 时，在 Linux、WSL 和 native Windows 上限制 deny-read glob expansion。较大的值可能增加 startup scanning work。当无界 `**` pattern 需要有界预展开时，请使用至少为 `1` 的值。                                                                                                                                                                                        |
| `[permissions.<name>.filesystem]."<path>"`                        | `read`, `write`, or `deny` | None                    | 为受支持 path 授予直接访问。`deny` 会拒绝访问，并优先于同等 specific 的 `write` 或 `read` entries。Codex 会拒绝 active runtime 无法 enforce 的 direct write rules。                                                                                                                                                                                                                                           |
| `[permissions.<name>.filesystem."<path>"]."<subpath>"`            | `read`, `write`, or `deny` | None                    | 向 `<path>` 的 descendant 授予访问。使用 `.` 表示 base path。其他 subpaths 必须是 relative descendants，且不能包含 `.` 或 `..` components。                                                                                                                                                                                                                                                                   |
| `[permissions.<name>.network]`                                    | Table                      | None                    | 为 profile 配置 network sandbox proxy 和 sandbox network policy。                                                                                                                                                                                                                                                                                                                                             |
| `permissions.<name>.network.enabled`                              | Boolean                    | `false`                 | 为 profile 中的 sandboxed commands 启用 network access。这会改变 sandbox network policy；它本身不会启动 network proxy。                                                                                                                                                                                                                                                                                      |
| `[permissions.<name>.network.domains]`                            | Table                      | None                    | 将 host patterns 映射到 `allow` 或 `deny`。如果没有 `allow` entries，domain requests 会被阻止。Deny entries 会覆盖 allow entries。                                                                                                                                                                                                                                                                           |
| `permissions.<name>.network.domains."<pattern>"`                  | `allow` or `deny`          | None                    | 支持 exact hosts、表示 subdomains 的 `*.example.com`、表示 apex plus subdomains 的 `**.example.com`，以及作为 allow-only global wildcard 的 `*`。Host patterns 会通过 trim、lowercase、去掉 trailing dot，以及去掉简单 ports 或 brackets 来标准化。                                                                                                                                                             |
| `[permissions.<name>.network.unix_sockets]`                       | Table                      | None                    | 映射 Unix socket allowlist overrides。仅用于 Docker 等 local integrations。                                                                                                                                                                                                                                                                                                                                  |
| `permissions.<name>.network.unix_sockets."<path>"`                | `allow` or `deny`          | None                    | 使用 `allow` 将 absolute Unix socket path 添加到 effective allowlist，或使用 `deny` 拒绝它。Denied entries 会从 effective allowlist 中省略。                                                                                                                                                                                                                                                                 |
| `permissions.<name>.network.proxy_url`                            | URL string                 | `http://127.0.0.1:3128` | HTTP proxy listener，用于 `HTTP_PROXY`、`HTTPS_PROXY`、websocket proxy variables 以及相关 tool proxy environment variables。                                                                                                                                                                                                                                                                                  |
| `permissions.<name>.network.enable_socks5`                        | Boolean                    | `true`                  | 启用用于 `ALL_PROXY` 和 FTP proxy variables 的 SOCKS5 listener。                                                                                                                                                                                                                                                                                                                                              |
| `permissions.<name>.network.socks_url`                            | URL string                 | `http://127.0.0.1:8081` | SOCKS5 listener address。                                                                                                                                                                                                                                                                                                                                                                                    |
| `permissions.<name>.network.enable_socks5_udp`                    | Boolean                    | `true`                  | 在 SOCKS5 listener 启用时，启用 SOCKS5 UDP support。                                                                                                                                                                                                                                                                                                                                                         |
| `permissions.<name>.network.allow_upstream_proxy`                 | Boolean                    | `true`                  | 允许 network sandbox proxy 针对 outbound requests 遵循 upstream `HTTP(S)_PROXY` 和 `ALL_PROXY` settings。                                                                                                                                                                                                                                                                                                    |
| `permissions.<name>.network.allow_local_binding`                  | Boolean                    | `false`                 | 当为 `true` 时，禁用 local/private-network guard。当为 `false` 时，`localhost` 或 `127.0.0.1` 等 exact local literals 必须显式列入 allowlist，并且解析为 local 或 private IPs 的 hostnames 仍会被阻止。                                                                                                                                                                                                        |
| `permissions.<name>.network.dangerously_allow_non_loopback_proxy` | Boolean                    | `false`                 | 允许 proxy listeners 绑定 non-loopback addresses。普通 local development 请保持未设置。                                                                                                                                                                                                                                                                                                                     |
| `permissions.<name>.network.dangerously_allow_all_unix_sockets`   | Boolean                    | `false`                 | 在支持 Unix socket proxying 的位置绕过 Unix socket allowlist。这是一个宽泛的 local escape hatch。                                                                                                                                                                                                                                                                                                           |

## Filesystem permissions

Filesystem entries 使用 `read`、`write` 或 `deny`：

| 访问    | 含义                                                                                                                        |
| ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `read`  | 允许命令读取 path 下的文件并列出目录。命令不能在那里创建、修改、重命名或删除文件。                                          |
| `write` | 允许命令读取和修改 path 下的文件，包括在 OS 允许时创建、重命名和删除文件。                                                  |
| `deny`  | 拒绝 path 下的读取和写入。用它从更宽泛的 `read` 或 `write` grant 中划出被拒绝的 subpath。                                   |

更具体 entries 会覆盖更宽泛 entries。当两个 entries 指向同一 path 时，`deny` 优先于 `write`，`write` 优先于 `read`。

这种优先级让 profile 可以先描述一个宽泛 working area，然后划出应保持不可读的文件或目录：

```toml
[permissions.project-edit.filesystem]
":minimal" = "read"

[permissions.project-edit.filesystem.":workspace_roots"]
"." = "write"
".devcontainer" = "read"
"**/*.env" = "deny"
```

在此示例中，workspace root 保持可写，`.devcontainer/` 保持可读但不会变成可写，匹配的 environment files 仍对 sandboxed commands 不可用。

更具体的 path 也可以在更宽泛 deny 内重新打开更窄的 subtree：

```toml
[permissions.project-edit.filesystem]
"~/Documents" = "deny"
"~/Documents/codex" = "write"
```

支持的 path forms：

| Path               | 含义                                                                                         | Scoped subpaths |
| ------------------ | -------------------------------------------------------------------------------------------- | --------------- |
| `:root`            | Filesystem root                                                                               | 仅 `.`          |
| `:minimal`         | 常用工具所需的平台和 runtime paths                                                            | 仅 `.`          |
| `:workspace_roots` | 当前 session 的 workspace roots 加上任何启用的 profile-defined workspace roots                | 是              |
| `:tmpdir`          | 可用时的 `$TMPDIR` 位置                                                                       | 仅 `.`          |
| `:slash_tmp`       | `/tmp` 文件夹（如果存在）                                                                     | 仅 `.`          |
| `/absolute/path`   | 平台 absolute path，例如 macOS/Linux/WSL 上的 `/path` 或 native Windows 上的 `C:\path`        | 是              |
| `~/path`           | 当前用户 home directory 下的 path                                                             | 是              |

在 native Windows 上，home-relative paths 也可以使用反斜杠，例如 `~\work`。

只有当 profile 明确需要宽泛 read coverage 时，才使用 `:root`：

```toml
[permissions.audit.filesystem]
":root" = "read"
```

使用 `:workspace_roots` 下的 nested entries，将访问作用域限定到 workspace-root relative subpaths：

```toml
[permissions.project-edit.filesystem.":workspace_roots"]
"." = "write"          # each workspace root
"docs" = "read"        # each workspace-root docs directory
"generated" = "deny"   # each workspace-root generated directory
```

Nested subpaths 必须留在其 workspace root 内。`../other-repo` 等 parent traversal 会被拒绝。

### 用 exact paths 或 globs 拒绝读取

对 Codex 不应读取的文件或 subtrees 使用 `deny`，即使附近有更宽泛的 profile rule 授予访问。Exact paths 适合 `~/.ssh` 等稳定位置。Glob patterns 更适合覆盖一类敏感文件，因为这些文件在不同 repositories 中的确切位置可能变化。

当 glob 位于 `:workspace_roots` 下时，Codex 会将它解释为相对于每个 effective workspace root。例如：

```toml
[permissions.project-edit.filesystem.":workspace_roots"]
"**/*.env" = "deny"
```

该 rule 会拒绝读取每个 runtime 或 profile-defined workspace root 下找到的匹配 `.env` files。当你想保留正常 workspace writes，同时让 environment files、generated secrets 或类似 credential-bearing files 不可读时，请使用它。

`deny` glob patterns 支持作为 deny-read rules。`read` 或 `write` globs 在 Linux、WSL 和 native Windows sandboxing 上可移植性较差，因此请尽可能优先使用 exact paths 或 subtree rules，例如 `"docs/**" = "read"`。

在 Linux、WSL 和 native Windows 上，无界 `**` deny-read pattern 可能需要在 sandbox 启动前进行有界 pre-expansion。当你使用 `"**/*.env" = "deny"` 之类无界 pattern 时，请设置 `glob_scan_max_depth`：

```toml
[permissions.project-edit.filesystem]
glob_scan_max_depth = 3

[permissions.project-edit.filesystem.":workspace_roots"]
"**/*.env" = "deny"
```

`glob_scan_max_depth` 必须至少为 `1`。较高值会在 sandbox startup 前扫描更深，这可能在 Linux、WSL 和 native Windows 上增加 startup work。如果你不想使用有界 expansion，可以枚举显式深度，例如 `*.env`、`*/*.env` 和 `*/*/*.env`。

当同样 rules 应应用到不止当前 session root 时，请向 profile 添加可复用 workspace roots：

```toml
[permissions.project-edit.workspace_roots]
"~/code/app" = true
"~/code/shared-lib" = true
```

当此 profile 处于 active 状态时，Codex 会将 `:workspace_roots` rules 应用于当前 session 的 runtime workspace roots，以及每个启用的 profile-defined workspace root。

在 native Windows 上，支持 `D:\work` 等 drive-letter paths，以及 `\\server\share` 等 UNC paths 作为 absolute paths。

## Network permissions

设置 `enabled = true` 为所选 profile 允许 network access：

```toml
[permissions.project-edit.network]
enabled = true
```

启用 network access 后，Codex 默认使用完整 network behavior。大多数 profiles 还应定义 domain rules：

```toml
[permissions.project-edit.network.domains]
"example.com" = "allow"      # exact host
"*.example.com" = "allow"    # subdomains only
"**.example.com" = "allow"   # apex and subdomains
"ads.example.com" = "deny"   # deny wins over allow
```

Network sandbox proxy 默认绑定到 local listeners：

```toml
[permissions.project-edit.network]
enabled = true
proxy_url = "http://127.0.0.1:3128"
enable_socks5 = true
socks_url = "http://127.0.0.1:8081"
enable_socks5_udp = true
```

除非你正在与特定 runtime 集成，否则请保持这些 listener settings 为默认值。`dangerously_*` network keys 是 specialized environments 的 escape hatches，不应在普通 local development 中使用。

### Local and private networks

Codex 默认应用 local/private-network guard，以防御 DNS rebinding 和意外访问 local services。要有意允许 literal local target，请将 exact host 或 IP literal 加入 allowlist：

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

### Unix sockets

Unix socket proxying 是用于 Docker 等工具的 local escape hatch。请谨慎使用：

```toml
[permissions.project-edit.network.unix_sockets]
"/var/run/docker.sock" = "allow"
"/tmp/old.sock" = "deny"
```

使用 `deny` 拒绝 socket path，包括 inherited allow entry。Denied socket paths 会从 effective allowlist 中省略。

启用 Unix sockets 时，请让 proxy listeners 绑定到 loopback addresses。

## 从较旧的 sandbox settings 迁移

当你希望用一个可复用 profile 同时描述 filesystem 和 network behavior 时，Permission profiles 会替代较旧的 `sandbox_mode` 与 `sandbox_workspace_write` 组合。一个 session 中请使用其中一种系统，不要两者同时使用。

建议起点：

- 对于 read-only workflow，请使用内置 `:read-only` profile，或定义只在需要位置拥有 read access 的 custom profile。
- 对于 workspace editing，请使用内置 `:workspace` profile，或定义通过 `:workspace_roots` 写入、并仅添加该工作流所需额外 temp 或 cache paths 的 custom profile。
- 对于 unrestricted local execution，仅在你明确想要最宽泛 local access model 时使用 `:danger-full-access`。

Profiles 描述 session 的 local default posture。Organization-managed requirements 仍然可以添加用户配置不应拓宽的 restrictions。请参阅 [Managed configuration](https://developers.openai.com/codex/enterprise/managed-configuration)，了解 admin-enforced filesystem 和 network constraints。

## Scope and enforcement {#scope-and-enforcement}

Permission profiles 定义本地 sandboxed command execution 的边界。请将它们与 approval policies 以及其他 Codex surfaces 的单独控制一起使用。

### Profiles 控制什么

- **Local command execution：** Permission profiles 管理在你机器上运行的 sandboxed commands。App connectors、MCP servers、browser 或 computer-use surfaces、Codex cloud environment settings，以及 approved escalations 都使用各自的控制。
- **Filesystem writes：** Write-capable profile 可以创建持久更改。请将对 scripts、build steps、package manager hooks、shell startup files 和 shared directories 的写入视为敏感，因为后续 tools 或 users 可以在原始 sandbox context 之外执行这些文件。
- **Outbound destinations：** Network domain rules 约束 sandboxed command traffic 可以通过 network proxy 到达哪里。它们不决定被允许 destination 是否可信，并且 wildcard allow rules 仍然很宽泛。
- **Local services：** Local 和 private network targets 默认被阻止。Allowlisting `localhost`、private IPs、Unix sockets，或设置 `allow_local_binding = true` 会显式打开对 local services 的访问。

### Enforcement 如何工作

- 在 macOS 上，Codex 使用 Seatbelt sandbox profiles。如果所选 policy 无法由 platform sandbox enforce，Codex 会拒绝运行命令，而不是静默地以 unsandboxed 方式运行。
- 在 Linux 和 WSL 上，Codex 使用 [bubblewrap](https://github.com/containers/bubblewrap) 和 [seccomp](https://www.kernel.org/doc/html/latest/userspace-api/seccomp_filter.html)，并用 Landlock 作为 compatibility fallback paths。最强 enforcement path 取决于 user namespaces 和 kernel support；受限 container hosts 可能会强制 compatibility paths，不受支持的 split policies 会被拒绝。
- 在 native Windows 上，[`elevated` sandboxing](https://developers.openai.com/codex/windows#windows-sandbox) 最强，因为它可以使用专用的 lower-privilege sandbox users、filesystem permission boundaries 和 firewall rules。`unelevated` sandboxing 是隔离性较弱的 fallback，其 network isolation 较弱，且无法 enforce 每个 split read/write carveout，因此不受支持的 policies 会被拒绝。当你需要 Linux sandbox model 时，请使用 WSL。

### 操作指南

选择仍能完成任务的最窄 profile，尤其是在授予 writes 或 outbound network access 时。请让 approval policy、secret handling 和 allow rules 与该访问级别保持一致。

## 常见 profiles

### 带 network allowlist 的 read-only

```toml
default_permissions = "readonly-net"

[permissions.readonly-net.filesystem]
":minimal" = "read"

[permissions.readonly-net.filesystem.":workspace_roots"]
"." = "read"

[permissions.readonly-net.network]
enabled = true

[permissions.readonly-net.network.domains]
"api.openai.com" = "allow"
```

### 文件访问限制在 workspace 内

下面是一个 permission profile 示例，它会让你的 workspace folders 对 Codex 可写，同时拒绝读取 filesystem 其他部分（但有 `:minimal` 决定的有限例外）。

```toml
default_permissions = "workspace-only"

[permissions.workspace-only]
# By extending the :workspace profile, you get Codex's safeguards to ensure
# subfolders such as .codex/ and .git/ within a workspace root are read-only
# while the rest of the folder is writable.
extends = ":workspace"

[permissions.workspace-only.filesystem]
# By default, deny read access to all files on disk.
":root" = "deny"

# Though in practice, a software agent needs to be able to read folders that
# contain common tools, such as `/usr/bin`, to get work done, so grant access
# to a "minimal" set of files and folders, as determined by Codex.
":minimal" = "read"

# By extending the :workspace profile, :tmpdir and :slash_tmp are "write" by
# default, though you can deny access to them altogether, if desired.
":tmpdir" = "deny"
":slash_tmp" = "deny"
```

### 无 network 的 workspace write

```toml
default_permissions = "project-edit"

[permissions.project-edit.filesystem]
":minimal" = "read"

[permissions.project-edit.filesystem.":workspace_roots"]
"." = "write"

[permissions.project-edit.network]
enabled = false
```

### 带 public web access 的 workspace write

```toml
default_permissions = "workspace-net"

[permissions.workspace-net.filesystem]
":minimal" = "read"

[permissions.workspace-net.filesystem.":workspace_roots"]
"." = "write"

[permissions.workspace-net.network]
enabled = true

[permissions.workspace-net.network.domains]
"*" = "allow"
```

仅在你有意允许 public network access 时，才使用全局 `"*"` allow rule。Deny rules 可以缩小宽泛 allowlist 的范围。
