---
status: needs-review
sourceId: "d06881257c62"
sourceChecksum: "d06881257c62c1485225404604623d3750eea280a42a40e542e1c2fbdea27f92"
sourceUrl: "https://developers.openai.com/codex/mcp"
translatedAt: "2026-06-27T19:06:51.2133192+08:00"
translator: codex-gpt-5.5-xhigh
---

# Model Context Protocol 模型上下文协议

Model Context Protocol (MCP) 将模型连接到工具和上下文。可以用它让 Codex 访问第三方文档，或让 Codex 与你的浏览器、Figma 等开发者工具交互。

Codex 在 CLI 和 IDE extension 中都支持 MCP servers。

## 支持的 MCP 功能

- **STDIO servers**：作为本地进程运行的 servers（由命令启动）。
  - 环境变量
- **Streamable HTTP servers**：通过地址访问的 servers。
  - Bearer token authentication
  - OAuth authentication（对于支持 OAuth 的 servers，运行 `codex mcp login <server-name>`）
- **Server instructions**：Codex 会读取初始化期间返回的 MCP `instructions` 字段，并将其作为 server-wide guidance，与该 server 的 tools 一起使用。

如果你为 Codex 构建或维护 MCP server，请使用 `instructions` 描述跨工具工作流、约束以及适用于整个 server 的速率限制。请让前 512 个字符本身就完整表达最重要的指导，这样 Codex 在决定如何使用该 server 时就能获得关键信息。

## 将 Codex 连接到 MCP server

Codex 将 MCP 配置与其他 Codex 配置设置一起存储在 `config.toml` 中。默认情况下这是 `~/.codex/config.toml`，但你也可以在项目中用 `.codex/config.toml` 将 MCP servers 作用域限定到该项目（仅限 trusted projects）。

CLI 和 IDE extension 共享此配置。配置好 MCP servers 后，你可以在两个 Codex clients 之间切换，而无需重新设置。

要配置 MCP servers，请选择一种方式：

1. **使用 CLI**：运行 `codex mcp` 添加和管理 servers。
2. **编辑 `config.toml`**：直接更新 `~/.codex/config.toml`（或 trusted projects 中项目作用域的 `.codex/config.toml`）。

### 使用 CLI 配置

#### 添加 MCP server

```bash
codex mcp add <server-name> --env VAR1=VALUE1 --env VAR2=VALUE2 -- <stdio server-command>
```

例如，要添加 Context7（一个面向开发者文档的免费 MCP server），可以运行以下命令：

```bash
codex mcp add context7 -- npx -y @upstash/context7-mcp
```

#### 其他 CLI 命令

要查看所有可用的 MCP 命令，可以运行 `codex mcp --help`。

#### Terminal UI (TUI)

在 `codex` TUI 中，使用 `/mcp` 查看你的活跃 MCP servers。

### 使用 config.toml 配置

要对 MCP server 选项进行更细粒度控制，请编辑 `~/.codex/config.toml`（或项目作用域的 `.codex/config.toml`）。在 IDE extension 中，从齿轮菜单选择 **MCP settings** > **Open config.toml**。

在配置文件中，用 `[mcp_servers.<server-name>]` 表配置每个 MCP server。

#### STDIO servers

- `command`（必需）：启动 server 的命令。
- `args`（可选）：传给 server 的参数。
- `env`（可选）：为 server 设置的环境变量。
- `env_vars`（可选）：允许并转发的环境变量。
- `cwd`（可选）：启动 server 时使用的工作目录。
- `experimental_environment`（可选）：当可用时，设置为 `remote` 可通过远程执行器环境启动 stdio server。

`env_vars` 可以包含普通变量名，也可以包含带 source 的对象：

```toml
env_vars = ["LOCAL_TOKEN", { name = "REMOTE_TOKEN", source = "remote" }]
```

字符串条目和 `source = "local"` 会从 Codex 的本地环境读取。`source = "remote"` 会从远程执行器环境读取，并要求使用 remote MCP stdio。

#### Streamable HTTP servers

- `url`（必需）：server 地址。
- `bearer_token_env_var`（可选）：用于在 `Authorization` 中发送 bearer token 的环境变量名。
- `http_headers`（可选）：header 名称到静态值的映射。
- `env_http_headers`（可选）：header 名称到环境变量名的映射（值从环境中拉取）。

#### 其他配置选项

- `startup_timeout_sec`（可选）：server 启动超时（秒）。默认值：`10`。
- `tool_timeout_sec`（可选）：server 运行 tool 的超时（秒）。默认值：`60`。
- `enabled`（可选）：设置为 `false` 可在不删除 server 的情况下禁用它。
- `required`（可选）：设置为 `true` 可在此启用的 server 无法初始化时让启动失败。
- `enabled_tools`（可选）：Tool allow list。
- `disabled_tools`（可选）：Tool deny list（在 `enabled_tools` 之后应用）。
- `default_tools_approval_mode`（可选）：来自此 server 的 tools 的默认 approval 行为。支持的值为 `auto`、`prompt` 和 `approve`。
- `tools.<tool>.approval_mode`（可选）：按 tool 覆盖 approval 行为。

如果你的 OAuth provider 要求固定 callback port，请在 `config.toml` 中设置顶层 `mcp_oauth_callback_port`。如果未设置，Codex 会绑定到临时端口。

如果你的 MCP OAuth flow 必须使用特定 callback URL（例如远程 Devbox ingress URL 或自定义 callback path），请设置 `mcp_oauth_callback_url`。Codex 会将此值用作基础 callback URL，然后追加 server-specific callback ID，以生成登录期间发送的 OAuth `redirect_uri`。请向 OAuth provider 注册完整派生出的 `redirect_uri`，包括追加的 callback ID 以及任何已配置的 path、query 或 port，而不是只注册基础 host 或未加后缀的 path。Local callback URLs（例如 `localhost`）绑定在本地接口上；non-local callback URLs 绑定在 `0.0.0.0` 上，以便 callback 可以到达主机。

如果 MCP server 公布了 `scopes_supported`，Codex 会在 OAuth login 期间优先使用这些 server-advertised scopes。否则，Codex 会回退到 `config.toml` 中配置的 scopes。

#### config.toml 示例

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
env_vars = ["LOCAL_TOKEN"]

[mcp_servers.context7.env]
MY_ENV_VAR = "MY_ENV_VALUE"
```

```toml
# Optional MCP OAuth callback overrides (used by `codex mcp login`)
mcp_oauth_callback_port = 5555
mcp_oauth_callback_url = "https://devbox.example.internal/callback"
```

```toml
[mcp_servers.figma]
url = "https://mcp.figma.com/mcp"
bearer_token_env_var = "FIGMA_OAUTH_TOKEN"
http_headers = { "X-Figma-Region" = "us-east-1" }
```

```toml
[mcp_servers.chrome_devtools]
url = "http://localhost:3000/mcp"
enabled_tools = ["open", "screenshot"]
disabled_tools = ["screenshot"] # applied after enabled_tools
default_tools_approval_mode = "prompt"
startup_timeout_sec = 20
tool_timeout_sec = 45
enabled = true

[mcp_servers.chrome_devtools.tools.open]
approval_mode = "approve"
```

### Plugin 提供的 MCP servers

已安装的 plugins 可以在其 plugin manifest 中打包 MCP servers。这些 servers 由 plugin 启动，因此 user config 不设置它们的 transport command。User config 仍可在 `plugins.<plugin>.mcp_servers.<server>` 下控制启用/关闭状态和 tool policy。

```toml
[plugins."sample@test".mcp_servers.sample]
enabled = true
default_tools_approval_mode = "prompt"
enabled_tools = ["read", "search"]

[plugins."sample@test".mcp_servers.sample.tools.search]
approval_mode = "approve"
```

## 有用 MCP servers 示例

MCP servers 列表仍在不断增长。以下是一些常见示例：

- [OpenAI Docs MCP](https://developers.openai.com/learn/docs-mcp)：搜索并读取 OpenAI developer docs。
- [Context7](https://github.com/upstash/context7)：连接到最新的开发者文档。
- Figma [Local](https://developers.figma.com/docs/figma-mcp-server/local-server-installation/) 和 [Remote](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)：访问你的 Figma designs。
- [Playwright](https://www.npmjs.com/package/@playwright/mcp)：使用 Playwright 控制并检查浏览器。
- [Chrome Developer Tools](https://github.com/ChromeDevTools/chrome-devtools-mcp/)：控制并检查 Chrome。
- [Sentry](https://docs.sentry.io/product/sentry-mcp/#codex)：访问 Sentry logs。
- [GitHub](https://github.com/github/github-mcp-server)：管理超出 `git` 支持范围的 GitHub 内容（例如 pull requests 和 issues）。
