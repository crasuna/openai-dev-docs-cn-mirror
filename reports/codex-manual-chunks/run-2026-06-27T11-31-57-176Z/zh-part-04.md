### Model Context Protocol

来源：[Model Context Protocol](/codex/mcp.md)

Model Context Protocol (MCP) 将模型连接到工具和上下文。你可以用它让 Codex 访问第三方文档，或让它与你的浏览器、Figma 等开发者工具交互。

Codex 在 CLI 和 IDE 扩展中都支持 MCP 服务器。

#### 支持的 MCP 功能

- **STDIO 服务器**：作为本地进程运行的服务器（由命令启动）。
  - 环境变量
- **Streamable HTTP 服务器**：通过地址访问的服务器。
  - Bearer token 认证
  - OAuth 认证（对支持 OAuth 的服务器运行 `codex mcp login `）
- **服务器指令**：Codex 会读取初始化期间返回的 MCP `instructions` 字段，并将其作为服务器级指导，与该服务器的工具一起使用。

如果你为 Codex 构建或维护 MCP 服务器，请使用 `instructions` 描述适用于整个服务器的跨工具工作流、约束和速率限制。请让前 512 个字符自包含，这样 Codex 在决定如何使用该服务器时能获得最重要的指导。

#### 将 Codex 连接到 MCP 服务器

Codex 将 MCP 配置与其他 Codex 配置设置一起存储在 `config.toml` 中。默认情况下这是 `~/.codex/config.toml`，但你也可以使用 `.codex/config.toml` 将 MCP 服务器限定到某个项目（仅限受信任项目）。

CLI 和 IDE 扩展共享这份配置。配置好 MCP 服务器后，你可以在两个 Codex 客户端之间切换，而无需重新设置。

要配置 MCP 服务器，请选择一个选项：

1. **使用 CLI**：运行 `codex mcp` 来添加和管理服务器。
2. **编辑 `config.toml`**：直接更新 `~/.codex/config.toml`（或受信任项目中的项目级 `.codex/config.toml`）。

#### 使用 CLI 配置

#### 添加 MCP 服务器

```bash
codex mcp add  --env VAR1=VALUE1 --env VAR2=VALUE2 --
```

例如，要添加 Context7（一个用于开发者文档的免费 MCP 服务器），可以运行以下命令：

```bash
codex mcp add context7 -- npx -y @upstash/context7-mcp
```

#### 其他 CLI 命令

要查看所有可用的 MCP 命令，可以运行 `codex mcp --help`。

#### Terminal UI (TUI)

在 `codex` TUI 中，使用 `/mcp` 查看当前活动的 MCP 服务器。

#### 使用 config.toml 配置

如需更细粒度地控制 MCP 服务器选项，请编辑 `~/.codex/config.toml`（或项目级 `.codex/config.toml`）。在 IDE 扩展中，从齿轮菜单选择 **MCP settings** > **Open config.toml**。

在配置文件中使用 `[mcp_servers.]` 表来配置每个 MCP 服务器。

#### STDIO 服务器

- `command`（必需）：启动服务器的命令。
- `args`（可选）：传递给服务器的参数。
- `env`（可选）：为服务器设置的环境变量。
- `env_vars`（可选）：允许并转发的环境变量。
- `cwd`（可选）：启动服务器时使用的工作目录。
- `experimental_environment`（可选）：当可用时，设置为 `remote` 可通过远程执行器环境启动 stdio
  服务器。

`env_vars` 可以包含普通变量名，也可以包含带有来源的对象：

```toml
env_vars = ["LOCAL_TOKEN", { name = "REMOTE_TOKEN", source = "remote" }]
```

字符串条目和 `source = "local"` 会从 Codex 的本地环境读取。
`source = "remote"` 会从远程执行器环境读取，并且需要
remote MCP stdio。

#### Streamable HTTP 服务器

- `url`（必需）：服务器地址。
- `bearer_token_env_var`（可选）：用于发送到 `Authorization` 的 bearer token 环境变量名。
- `http_headers`（可选）：从标头名称到静态值的映射。
- `env_http_headers`（可选）：从标头名称到环境变量名称的映射（值从环境中拉取）。

#### 其他配置选项

- `startup_timeout_sec`（可选）：服务器启动的超时时间（秒）。默认值：`10`。
- `tool_timeout_sec`（可选）：服务器运行工具的超时时间（秒）。默认值：`60`。
- `enabled`（可选）：设置为 `false` 可在不删除服务器的情况下禁用它。
- `required`（可选）：设置为 `true` 后，如果这个已启用服务器无法初始化，启动将失败。
- `enabled_tools`（可选）：工具允许列表。
- `disabled_tools`（可选）：工具拒绝列表（在 `enabled_tools` 之后应用）。
- `default_tools_approval_mode`（可选）：来自该服务器的
  工具的默认审批行为。支持的值为 `auto`、`prompt` 和
  `approve`。
- `tools..approval_mode`（可选）：按工具覆盖审批行为。

如果你的 OAuth 提供方需要固定回调端口，请在 `config.toml` 中设置顶层 `mcp_oauth_callback_port`。如果未设置，Codex 会绑定到临时端口。

如果你的 MCP OAuth 流程必须使用特定回调 URL（例如远程 Devbox 入口 URL 或自定义回调路径），请设置 `mcp_oauth_callback_url`。Codex 会将此值用作基础回调 URL，然后追加服务器专用回调 ID，以生成登录期间发送的 OAuth `redirect_uri`。请向 OAuth 提供方注册完整派生出的 `redirect_uri`，包括追加的回调 ID 以及任何已配置的路径、查询或端口，而不是只注册基础主机或未加后缀的路径。本地回调 URL（例如 `localhost`）会绑定到本地接口；非本地回调 URL 会绑定到 `0.0.0.0`，以便回调可以到达主机。

如果 MCP 服务器声明了 `scopes_supported`，Codex 会在 OAuth 登录期间优先使用这些
服务器声明的 scopes。否则，Codex 会回退到
`config.toml` 中配置的 scopes。

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

#### 插件提供的 MCP 服务器

已安装的插件可以在其插件清单中捆绑 MCP 服务器。这些
服务器从插件启动，因此用户配置不会设置其
传输命令。用户配置仍可在
`plugins..mcp_servers.` 下控制开关状态和工具策略。

```toml
[plugins."sample@test".mcp_servers.sample]
enabled = true
default_tools_approval_mode = "prompt"
enabled_tools = ["read", "search"]

[plugins."sample@test".mcp_servers.sample.tools.search]
approval_mode = "approve"
```

#### 有用的 MCP 服务器示例

MCP 服务器列表仍在持续增长。下面是一些常见示例：

- [OpenAI Docs MCP](/learn/docs-mcp)：搜索并读取 OpenAI developer docs。
- [Context7](https://github.com/upstash/context7)：连接到最新的开发者文档。
- Figma [Local](https://developers.figma.com/docs/figma-mcp-server/local-server-installation/) 和 [Remote](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)：访问你的 Figma 设计。
- [Playwright](https://www.npmjs.com/package/@playwright/mcp)：使用 Playwright 控制并检查浏览器。
- [Chrome Developer Tools](https://github.com/ChromeDevTools/chrome-devtools-mcp/)：控制并检查 Chrome。
- [Sentry](https://docs.sentry.io/product/sentry-mcp/#codex)：访问 Sentry 日志。
- [GitHub](https://github.com/github/github-mcp-server)：管理 `git` 支持范围之外的 GitHub 功能（例如 pull request 和 issue）。

### 规则

来源：[Rules](/codex/rules.md)

使用规则控制 Codex 可以在沙盒外运行哪些命令。

规则是实验性的，可能会发生变化。

#### 创建规则文件

1. 在活动配置层旁边的 `rules/` 文件夹下创建 `.rules` 文件（例如 `~/.codex/rules/default.rules`）。
2. 添加一条规则。此示例会在允许 `gh pr view` 在沙盒外运行之前提示确认。

   ```python
   # Prompt before running commands with the prefix `gh pr view` outside the sandbox.
   prefix_rule(
       # The prefix to match.
       pattern = ["gh", "pr", "view"],

       # The action to take when Codex requests to run a matching command.
       decision = "prompt",

       # Optional rationale for why this rule exists.
       justification = "Viewing PRs is allowed with approval",

       # `match` and `not_match` are optional "inline unit tests" where you can
       # provide examples of commands that should (or should not) match this rule.
       match = [
           "gh pr view 7888",
           "gh pr view --repo openai/codex",
           "gh pr view 7888 --json title,body,comments",
       ],
       not_match = [
           # Does not match because the `pattern` must be an exact prefix.
           "gh pr --repo openai/codex view 7888",
       ],
   )
   ```

3. 重启 Codex。

Codex 会在启动时扫描每个活动配置层下的 `rules/`，包括 [Team Config](/codex/enterprise/admin-setup#team-config) 位置和用户层 `~/.codex/rules/`。只有当项目 `.codex/` 层受信任时，`/.codex/rules/` 下的项目本地规则才会加载。

当你在 TUI 中将命令添加到允许列表时，Codex 会写入用户层 `~/.codex/rules/default.rules`，这样后续运行可以跳过提示。

启用 Smart approvals（默认）时，Codex 可能会在提权请求期间为你提出
`prefix_rule`。接受之前请仔细检查建议的前缀。

管理员也可以通过
[`requirements.toml`](/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml)
强制执行限制性的 `prefix_rule` 条目。

#### 理解规则字段

`prefix_rule()` 支持以下字段：

- `pattern` **（必需）**：定义要匹配的命令前缀的非空列表。每个元素可以是：
  - 字面字符串（例如 `"pr"`）。
  - 字面值联合（例如 `["view", "list"]`），用于匹配该参数位置的多个备选项。
- `decision` **（默认值为 `"allow"`）**：规则匹配时要采取的操作。当多条规则匹配时，Codex 会应用限制最严格的 decision（`forbidden` > `prompt` > `allow`）。
  - `allow`：无需提示即可在沙盒外运行命令。
  - `prompt`：每次匹配调用前都提示。
  - `forbidden`：不提示，直接阻止请求。
- `justification` **（可选）**：说明该规则存在原因的非空、人类可读文本。Codex 可能会在审批提示或拒绝消息中展示它。使用 `forbidden` 时，如果合适，请在 justification 中包含推荐替代方案（例如 `"Use \`rg\` instead of \`grep\`."`）。
- `match` 和 `not_match` **（默认值为 `[]`）**：Codex 加载规则时会验证的示例。使用这些示例可以在规则生效前发现错误。

当 Codex 考虑运行某个命令时，它会将该命令的参数列表与 `pattern` 比较。在内部，Codex 会把命令视为参数列表（类似 `execvp(3)` 接收的内容）。

#### Shell 包装器和复合命令

有些工具会把多个 shell 命令包装到一次调用中，例如：

```text
["bash", "-lc", "git add . && rm -rf /"]
```

因为这种命令可能把多个操作隐藏在一个字符串中，所以 Codex 会特别处理 `bash -lc`、`bash -c` 以及它们的 `zsh` / `sh` 等价形式。

#### Codex 何时可以安全拆分脚本

如果 shell 脚本是由以下内容构成的线性命令链：

- 普通单词（没有变量展开，没有 `VAR=...`、`$FOO`、`*` 等）
- 由安全运算符（`&&`、`||`、`;` 或 `|`）连接

那么 Codex 会解析它（使用 tree-sitter），并在应用规则前将其拆分为单个命令。

上面的脚本会被视为两个独立命令：

- `["git", "add", "."]`
- `["rm", "-rf", "/"]`

然后 Codex 会根据你的规则评估每个命令，并以限制最严格的结果为准。

即使你允许 `pattern=["git", "add"]`，Codex 也不会自动允许 `git add . && rm -rf /`，因为 `rm -rf /` 这一部分会单独评估，并阻止整次调用被自动允许。

这可以防止危险命令被夹带在安全命令旁边。

#### Codex 何时不拆分脚本

如果脚本使用更高级的 shell 功能，例如：

- 重定向（`>`、`>>`、`<`）
- 替换（`$(...)`、`...`）
- 环境变量（`FOO=bar`）
- 通配符模式（`*`、`?`）
- 控制流（`if`、`for`、带赋值的 `&&` 等）

那么 Codex 不会尝试解释或拆分它。

在这些情况下，整次调用会被视为：

```text
["bash", "-lc", ""]
```

并且你的规则会应用到这个 **单一** 调用。

这种处理方式在安全时提供按命令评估的安全性，并在不安全时采取保守行为。

#### 测试规则文件

使用 `codex execpolicy check` 测试规则如何应用到某个命令：

```shell
codex execpolicy check --pretty \
  --rules ~/.codex/rules/default.rules \
  -- gh pr view 7888 --json title,body,comments
```

该命令会输出 JSON，显示最严格的 decision 以及所有匹配规则，包括匹配规则中的任何 `justification` 值。使用多个 `--rules` 标志可以组合文件，添加 `--pretty` 可以格式化输出。

#### 理解规则语言

`.rules` 文件格式使用 `Starlark`（参见[语言规范](https://github.com/bazelbuild/starlark/blob/master/spec.md)）。它的语法类似 Python，但设计为可安全运行：规则引擎可以在没有副作用的情况下运行它（例如不会触碰文件系统）。

### 在 Linear 中使用 Codex

来源：[Use Codex in Linear](/codex/integrations/linear.md)

在 Linear 中使用 Codex 可以从 issue 委派工作。将 issue 分配给 Codex 或在评论中提及 `@Codex`，Codex 会创建云任务，并回复进度和结果。

Codex in Linear 适用于付费计划（参见 [Pricing](/codex/pricing)）。

如果你使用 Enterprise 计划，请让你的 ChatGPT 工作区管理员在[工作区设置](https://chatgpt.com/admin/settings)中开启 Codex cloud tasks，并在[连接器设置](https://chatgpt.com/admin/ca)中启用 **Codex for Linear**。

#### 设置 Linear 集成

1. 在 [Codex](https://chatgpt.com/codex) 中连接 GitHub，并为你希望 Codex 工作的代码库创建一个[环境](/codex/cloud/environments)，从而设置 [Codex cloud tasks](/codex/cloud)。
2. 前往 [Codex settings](https://chatgpt.com/codex/settings/connectors)，并为你的工作区安装 **Codex for Linear**。
3. 通过在 Linear issue 的评论线程中提及 `@Codex` 来关联你的 Linear 帐户。

#### 将工作委派给 Codex

你可以通过两种方式委派：

#### 将 issue 分配给 Codex

安装集成后，你可以像把 issue 分配给队友一样将其分配给 Codex。Codex 会开始工作，并将更新发布回该 issue。

#### 在评论中提及 `@Codex`

你也可以在评论线程中提及 `@Codex` 来委派工作或提问。Codex 回复后，可在同一线程中继续跟进该会话。

Codex 开始处理 issue 后，会[选择一个环境和 repo](#how-codex-chooses-an-environment-and-repo) 来工作。
若要固定到特定 repo，请在评论中包含它，例如：`@Codex fix this in openai/codex`。

要跟踪进度：

- 打开 issue 上的 **Activity** 查看进度更新。
- 打开任务链接以更详细地跟进。

任务完成后，Codex 会发布摘要和已完成任务的链接，以便你创建 pull request。

#### Codex 如何选择环境和 repo

- Linear 会根据 issue 上下文建议一个代码库。Codex 会选择最匹配该建议的环境。如果请求含糊，它会回退到你最近使用的环境。
- 任务会针对该环境 repo map 中列出的第一个代码库的默认分支运行。如果你需要不同的默认值或更多代码库，请在 Codex 中更新 repo map。
- 如果没有可用的合适环境或代码库，Codex 会在 Linear 中回复如何修复该问题的说明，然后你再重试。

#### 自动将 issue 分配给 Codex

你可以使用 triage rules 自动将 issue 分配给 Codex：

1. 在 Linear 中，前往 **Settings**。
2. 在 **Your teams** 下，选择你的团队。
3. 在工作流设置中，打开 **Triage** 并启用它。
4. 在 **Triage rules** 中，创建一条规则并选择 **Delegate** > **Codex**（以及你想设置的任何其他属性）。

Linear 会自动把进入 triage 的新 issue 分配给 Codex。
使用 triage rules 时，Codex 会使用 issue 创建者的帐户运行任务。

#### 数据使用、隐私和安全

当你提及 `@Codex` 或将 issue 分配给它时，Codex 会接收你的 issue 内容，以理解你的请求并创建任务。
数据处理遵循 OpenAI 的 [Privacy Policy](https://openai.com/privacy)、[Terms of Use](https://openai.com/terms/) 和其他适用的[政策](https://openai.com/policies)。
有关安全性的更多信息，请参阅 [Codex security documentation](/codex/agent-approvals-security)。

Codex 使用大型语言模型，可能会出错。请始终审查回答和 diff。

#### 提示和故障排查

- **缺少连接**：如果 Codex 无法确认你的 Linear 连接，它会在 issue 中回复一个用于连接帐户的链接。
- **意外的环境选择**：在线程中回复你希望使用的环境（例如 `@Codex please run this in openai/codex`）。
- **代码位置错误**：在 issue 中添加更多上下文，或在 `@Codex` 评论中给出明确说明。
- **更多帮助**：参见 [OpenAI Help Center](https://help.openai.com/)。

#### 为本地任务连接 Linear (MCP)

如果你使用 Codex app、CLI 或 IDE Extension，并希望 Codex 在本地访问 Linear issue，请配置 Codex 使用 Linear Model Context Protocol (MCP) 服务器。

要了解更多，请[查看 Linear MCP 文档](https://linear.app/integrations/codex-mcp)。

无论你使用 IDE 扩展还是 CLI，MCP 服务器的设置步骤都相同，因为二者共享同一份配置。

#### 使用 CLI（推荐）

如果你已安装 CLI，请运行：

```bash
codex mcp add linear --url https://mcp.linear.app/mcp
```

这会提示你使用 Linear 帐户登录，并将其连接到 Codex。

#### 手动配置

1. 在编辑器中打开 `~/.codex/config.toml`。
2. 添加以下内容：

```toml
[mcp_servers.linear]
url = "https://mcp.linear.app/mcp"
```

3. 运行 `codex mcp login linear` 进行登录。

### 在 Slack 中使用 Codex

来源：[Use Codex in Slack](/codex/integrations/slack.md)

在 Slack 中使用 Codex 可以从频道和线程启动编码任务。用提示提及 `@Codex`，Codex 会创建云任务并回复结果。

#### 设置 Slack app

1. 设置 [Codex cloud tasks](/codex/cloud)。你需要 Plus、Pro、Business、Enterprise 或 Edu 计划（参见 [ChatGPT pricing](https://chatgpt.com/pricing)）、已连接的 GitHub 帐户以及至少一个[环境](/codex/cloud/environments)。
2. 前往 [Codex settings](https://chatgpt.com/codex/settings/connectors)，并为你的工作区安装 Slack app。根据你的 Slack 工作区策略，可能需要管理员批准安装。
3. 将 `@Codex` 添加到频道。如果尚未添加，Slack 会在你提及时提示你。

#### 启动任务

1. 在频道或线程中，提及 `@Codex` 并包含你的提示。Codex 可以引用线程中较早的消息，所以你通常不需要重复说明上下文。
2. （可选）在提示中指定环境或代码库，例如：`@Codex fix the above in openai/codex`。
3. 等待 Codex 做出反应（👀）并回复任务链接。任务完成后，Codex 会发布结果，并根据你的设置在线程中发布答案。

#### Codex 如何选择环境和 repo

- Codex 会审查你有权访问的环境，并选择最匹配你请求的环境。如果请求含糊，它会回退到你最近使用的环境。
- 任务会针对该环境 repo map 中列出的第一个代码库的默认分支运行。如果你需要不同的默认值或更多代码库，请在 Codex 中更新 repo map。
- 如果没有可用的合适环境或代码库，Codex 会在 Slack 中回复如何修复该问题的说明，然后你再重试。

#### 企业数据控制

默认情况下，Codex 会在线程中回复答案，答案可能包含来自其运行环境的信息。
为防止这种情况，Enterprise 管理员可以在 [ChatGPT workspace settings](https://chatgpt.com/admin/settings) 中清除 **Allow Codex Slack app to post answers on task completion**。管理员关闭答案后，Codex 只会回复任务链接。

#### 数据使用、隐私和安全

当你提及 `@Codex` 时，Codex 会接收你的消息和线程历史，以理解你的请求并创建任务。
数据处理遵循 OpenAI 的 [Privacy Policy](https://openai.com/privacy)、[Terms of Use](https://openai.com/terms/) 和其他适用的[政策](https://openai.com/policies)。
有关安全性的更多信息，请参见 Codex [security documentation](/codex/agent-approvals-security)。

Codex 使用大型语言模型，可能会出错。请始终审查回答和 diff。

#### 提示和故障排查

- **缺少连接**：如果 Codex 无法确认你的 Slack 或 GitHub 连接，它会回复一个重新连接的链接。
- **意外的环境选择**：在线程中回复你希望使用的环境（例如 `Please run this in openai/openai (applied)`），然后再次提及 `@Codex`。
- **冗长或复杂的线程**：在最新消息中总结关键细节，避免 Codex 漏掉埋在早先线程中的上下文。
- **工作区发帖**：某些 Enterprise 工作区会限制发布最终答案。在这些情况下，请打开任务链接查看进度和结果。
- **更多帮助**：参见 [OpenAI Help Center](https://help.openai.com/)。

## 非交互式和程序化接口

<a id="automation-and-programmatic-interfaces"></a>

面向 CI、SDK 使用、app-server、GitHub Actions 以及相关 agents 工具的自动化路径。

### Codex App Server

来源：[Codex App Server](/codex/app-server.md)

Codex app-server 是 Codex 用来驱动丰富客户端（例如 Codex VS Code 扩展）的接口。当你想在自己的产品中做深度集成时，可以使用它：认证、对话历史、审批以及流式 agent 事件。app-server 实现在 Codex GitHub 仓库中开源（[openai/codex/codex-rs/app-server](https://github.com/openai/codex/tree/main/codex-rs/app-server)）。完整的开源 Codex 组件列表见 [Open Source](/codex/open-source) 页面。

如果你要自动化作业或在 CI 中运行 Codex，请改用
Codex SDK。

#### 协议

与 [MCP](https://modelcontextprotocol.io/) 类似，`codex app-server` 支持使用 JSON-RPC 2.0 消息进行双向通信（线上会省略 `"jsonrpc":"2.0"` 标头）。

支持的传输：

- `stdio`（`--listen stdio://`，默认）：newline-delimited JSON (JSONL)。
- `websocket`（`--listen ws://IP:PORT`，实验性且不受支持）：每个
  WebSocket text frame 传输一条 JSON-RPC 消息。
- Unix socket（`--listen unix://` 或 `--listen unix://PATH`）：通过 Codex 默认 app-server control socket 或自定义 Unix
  socket path 进行 WebSocket
  连接，使用标准 HTTP Upgrade handshake。
- `off`（`--listen off`）：不暴露本地传输。

使用 `--listen ws://IP:PORT` 运行时，同一个 listener 也会提供基本
HTTP health probes：

- `GET /readyz` 在 listener 接受新连接后返回 `200 OK`。
- `GET /healthz` 在请求不包含 `Origin`
  header 时返回 `200 OK`。
- 带有 `Origin` header 的请求会以 `403 Forbidden` 拒绝。

WebSocket transport 是实验性的，且不受支持。`ws://127.0.0.1:PORT` 这类本地 listener 适合 localhost 和 SSH port-forwarding
工作流。非 loopback WebSocket listener 在 rollout 期间目前默认允许未经认证的
连接，因此在远程暴露之前请配置 WebSocket auth。

支持的 WebSocket auth flags：

- `--ws-auth capability-token --ws-token-file /absolute/path`
- `--ws-auth capability-token --ws-token-sha256 HEX`
- `--ws-auth signed-bearer-token --ws-shared-secret-file /absolute/path`

对于 signed bearer tokens，你也可以设置 `--ws-issuer`、`--ws-audience` 和
`--ws-max-clock-skew-seconds`。客户端在 WebSocket handshake 期间以
`Authorization: Bearer ` 形式提供 credential，app-server 会在 JSON-RPC
`initialize` 之前强制执行 auth。

相比在命令行上传递原始 bearer tokens，优先使用 `--ws-token-file`。只有当客户端把原始高熵 token 保存在单独的本地 secret store 中时，才使用
`--ws-token-sha256`；hash 只是 verifier，客户端仍然需要
原始 token。

在 WebSocket 模式下，app-server 使用有界队列。当 request ingress 已满时，
服务器会拒绝新请求，返回 JSON-RPC error code `-32001` 和消息
`"Server overloaded; retry later."`。客户端应使用指数递增延迟和 jitter 重试。

#### 消息 schema

请求包含 `method`、`params` 和 `id`：

```json
{ "method": "thread/start", "id": 10, "params": { "model": "gpt-5.4" } }
```

响应会回显 `id`，并包含 `result` 或 `error`：

```json
{ "id": 10, "result": { "thread": { "id": "thr_123" } } }
```

```json
{ "id": 10, "error": { "code": 123, "message": "Something went wrong" } }
```

通知省略 `id`，仅使用 `method` 和 `params`：

```json
{ "method": "turn/started", "params": { "turn": { "id": "turn_456" } } }
```

你可以从 CLI 生成 TypeScript schema 或 JSON Schema bundle。每个输出都特定于你运行的 Codex 版本，因此生成的 artifact 与该版本完全匹配：

```bash
codex app-server generate-ts --out ./schemas
codex app-server generate-json-schema --out ./schemas
```

#### App-server 快速开始

1. 使用 `codex app-server`（默认 stdio transport）、
   `codex app-server --listen ws://127.0.0.1:4500`（TCP WebSocket）或
   `codex app-server --listen unix://`（默认 Unix socket）启动服务器。
2. 通过所选传输连接客户端，然后发送 `initialize`，接着发送 `initialized` notification。
3. 启动 thread 和 turn，然后持续从活动传输流中读取 notifications。

示例（Node.js / TypeScript）：

```ts
const proc = spawn("codex", ["app-server"], {
  stdio: ["pipe", "pipe", "inherit"],
});
const rl = readline.createInterface({ input: proc.stdout });

const send = (message: unknown) => {
  proc.stdin.write(`${JSON.stringify(message)}\n`);
};

let threadId: string | null = null;

rl.on("line", (line) => {
  const msg = JSON.parse(line) as any;
  console.log("server:", msg);

  if (msg.id === 1 && msg.result?.thread?.id && !threadId) {
    threadId = msg.result.thread.id;
    send({
      method: "turn/start",
      id: 2,
      params: {
        threadId,
        input: [{ type: "text", text: "Summarize this repo." }],
      },
    });
  }
});

send({
  method: "initialize",
  id: 0,
  params: {
    clientInfo: {
      name: "my_product",
      title: "My Product",
      version: "0.1.0",
    },
  },
});
send({ method: "initialized", params: {} });
send({ method: "thread/start", id: 1, params: { model: "gpt-5.4" } });
```

#### 核心原语

- **Thread**：用户和 Codex agent 之间的一段对话。Threads 包含 turns。
- **Turn**：一次用户请求以及随后发生的 agent 工作。Turns 包含 items 并流式传输增量更新。
- **Item**：输入或输出的单元（用户消息、agent 消息、命令运行、文件变更、工具调用等）。

使用 thread API 创建、列出或归档对话。使用 turn API 驱动对话，并通过 turn notifications 流式传输进度。

#### 生命周期概览

- **每个连接初始化一次**：打开传输连接后，立即发送包含客户端元数据的 `initialize` 请求，然后发出 `initialized`。服务器会拒绝该连接上在此握手之前的任何请求。
- **启动（或恢复）thread**：调用 `thread/start` 创建新对话，调用 `thread/resume` 继续现有对话，或调用 `thread/fork` 将历史分支到新的 thread id。
- **开始 turn**：使用目标 `threadId` 和用户输入调用 `turn/start`。可选字段可覆盖 model、personality、`cwd`、sandbox policy 等。
- **引导活动 turn**：调用 `turn/steer` 将用户输入追加到当前正在进行的 turn，而不创建新的 turn。
- **流式传输事件**：在 `turn/start` 之后，持续读取 stdout 上的 notifications：`thread/archived`、`thread/unarchived`、`item/started`、`item/completed`、`item/agentMessage/delta`、tool progress 和其他更新。
- **结束 turn**：模型完成或 `turn/interrupt` 取消后，服务器会发出带有最终状态的 `turn/completed`。

#### 初始化

客户端必须在传输连接上调用任何其他方法之前，针对每个传输连接发送一个 `initialize` 请求，然后用 `initialized` notification 进行确认。初始化前发送的请求会收到 `Not initialized` 错误，同一连接上的重复 `initialize` 调用会返回 `Already initialized`。

服务器会返回它将呈现给上游服务的 user agent string，以及描述运行时目标的 `platformFamily` 和 `platformOs` 值。设置 `clientInfo` 来标识你的集成。

`initialize.params.capabilities` 还支持通过 `optOutNotificationMethods` 按连接选择退出 notification，这是要在该连接上抑制的确切 method 名称列表。匹配是精确的（没有通配符/前缀）。未知 method 名称会被接受并忽略。

**重要**：使用 `clientInfo.name` 为 OpenAI Compliance Logs Platform 标识你的客户端。如果你正在开发面向企业使用的新 Codex 集成，请联系 OpenAI 将其加入已知客户端列表。更多上下文见 [Codex logs reference](https://chatgpt.com/admin/api-reference#tag/Logs:-Codex)。

示例（来自 Codex VS Code 扩展）：

```json
{
  "method": "initialize",
  "id": 0,
  "params": {
    "clientInfo": {
      "name": "codex_vscode",
      "title": "Codex VS Code Extension",
      "version": "0.1.0"
    }
  }
}
```

带 notification opt-out 的示例：

```json
{
  "method": "initialize",
  "id": 1,
  "params": {
    "clientInfo": {
      "name": "my_client",
      "title": "My Client",
      "version": "0.1.0"
    },
    "capabilities": {
      "experimentalApi": true,
      "optOutNotificationMethods": ["thread/started", "item/agentMessage/delta"]
    }
  }
}
```

#### 选择加入实验性 API

某些 app-server methods 和 fields 会被有意限制在 `experimentalApi` capability 之后。

- 省略 `capabilities`（或将 `experimentalApi` 设为 `false`）可停留在稳定 API surface，服务器会拒绝实验性 methods/fields。
- 将 `capabilities.experimentalApi` 设为 `true` 可启用实验性 methods 和 fields。

```json
{
  "method": "initialize",
  "id": 1,
  "params": {
    "clientInfo": {
      "name": "my_client",
      "title": "My Client",
      "version": "0.1.0"
    },
    "capabilities": {
      "experimentalApi": true
    }
  }
}
```

如果客户端发送实验性 method 或 field 但没有选择加入，app-server 会用以下内容拒绝：

` requires experimentalApi capability`

### Codex GitHub Action

来源：[Codex GitHub Action](/codex/github-action.md)

使用 Codex GitHub Action（`openai/codex-action@v1`）可以在 CI/CD job 中运行 Codex、应用 patch，或从 GitHub Actions workflow 发布 review。
该 action 会安装 Codex CLI，在你提供 API key 时启动 Responses API proxy，并以你指定的权限运行 `codex exec`。

当你希望做到以下事情时，可以使用该 action：

- 自动对 pull request 或 release 提供 Codex 反馈，而无需自己管理 CLI。
- 将 Codex 驱动的质量检查作为 CI pipeline 的一部分来阻断变更。
- 从 workflow file 运行可重复的 Codex 任务（代码 review、release 准备、迁移）。

CI 示例见 [Non-interactive mode](/codex/noninteractive)，并可浏览 [openai/codex-action repository](https://github.com/openai/codex-action) 中的源代码。

#### 前置条件

- 将你的 OpenAI key 存为 GitHub secret（例如 `OPENAI_API_KEY`），并在 workflow 中引用它。
- 在 Linux 或 macOS runner 上运行 job。对于 Windows，设置 `safety-strategy: unsafe`。
- 调用 action 前检出你的代码，以便 Codex 可以读取 repository 内容。
- 决定要运行哪些 prompts。你可以通过 `prompt` 提供 inline text，或通过 `prompt-file` 指向 repo 中提交的文件。

#### 示例 workflow

下面的示例 workflow 会 review 新的 pull requests，捕获 Codex 的响应，并将其发回 PR。

```yaml
name: Codex pull request review
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  codex:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    outputs:
      final_message: ${{ steps.run_codex.outputs.final-message }}
    steps:
      - uses: actions/checkout@v5
        with:
          ref: refs/pull/${{ github.event.pull_request.number }}/merge
          fetch-depth: 0
          persist-credentials: false

      - name: Run Codex
        id: run_codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt-file: .github/codex/prompts/review.md
          output-file: codex-output.md

  post_feedback:
    runs-on: ubuntu-latest
    needs: codex
    if: needs.codex.outputs.final_message != ''
    permissions:
      issues: write
      pull-requests: write
    steps:
      - name: Post Codex feedback
        uses: actions/github-script@v7
        with:
          github-token: ${{ github.token }}
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              body: process.env.CODEX_FINAL_MESSAGE,
            });
        env:
          CODEX_FINAL_MESSAGE: ${{ needs.codex.outputs.final_message }}
```

将 `.github/codex/prompts/review.md` 替换为你自己的 prompt 文件，或使用 `prompt` input 提供 inline text。该示例还会将最终 Codex 消息写入 `codex-output.md`，供稍后检查或上传 artifact。

#### 配置 `codex exec`

通过设置映射到 `codex exec` 选项的 action inputs，微调 Codex 的运行方式：

- `prompt` 或 `prompt-file`（二选一）：你的任务的 inline instructions，或指向 Markdown/text 的 repository path。可考虑将 prompts 存放在 `.github/codex/prompts/`。
- `codex-args`：额外 CLI flags。提供 JSON array（例如 `["--ephemeral"]`）或 shell string（`--profile ci`）来配置 sessions、profiles 或 MCP settings。
- `model` 和 `effort`：选择你想要的 Codex agent 配置；留空则使用默认值。
- `sandbox`：将 sandbox mode（`workspace-write`、`read-only`、`danger-full-access`）与运行期间 Codex 需要的权限相匹配。
- `output-file`：将最终 Codex 消息保存到磁盘，供后续步骤上传或 diff。
- `codex-version`：固定具体 CLI release。留空则使用最新发布版本。
- `codex-home`：指向共享 Codex home 目录，如果你想在多个步骤之间复用配置文件或 MCP 设置。

#### 管理权限

除非你限制它，否则 Codex 在 GitHub-hosted runners 上拥有广泛访问权限。使用以下 inputs 控制暴露面：

- `safety-strategy`（默认 `drop-sudo`）会在运行 Codex 前移除 `sudo`。这对该 job 不可逆，并可保护内存中的 secrets。在 Windows 上必须设置 `safety-strategy: unsafe`。
- `unprivileged-user` 将 `safety-strategy: unprivileged-user` 与 `codex-user` 配对，以指定帐户运行 Codex。确保该用户可以读写 repository checkout（参见 [`unprivileged-user` example](https://github.com/openai/codex-action/blob/main/examples/unprivileged-user.yml) 中的 ownership fix）。
- `read-only` 阻止 Codex 更改文件或使用网络，但它仍以提升权限运行。不要仅依赖 `read-only` 来保护 secrets。
- `sandbox` 会在 Codex 内部限制 filesystem 和 network access。选择仍能完成任务的最窄选项。
- `allow-users` 和 `allow-bots` 限制谁可以触发 workflow。默认情况下，只有具有写入权限的用户可以运行该 action；请显式列出额外受信任帐户，或将字段留空以使用默认行为。

#### 捕获输出

该 action 通过 `final-message` output 发出最后一条 Codex 消息。将它映射为 job output（如上所示），或在后续步骤中直接处理。如果你更希望收集 runner 的完整 transcript，可将 `output-file` 与 uploaded artifacts 功能结合使用。需要结构化数据时，通过 `codex-args` 传递 `--output-schema` 来强制 JSON 形状。

#### 安全检查清单

- 限制谁可以启动 workflow。优先使用受信任事件或显式审批，而不是允许所有人针对你的 repository 运行 Codex。
- 清理来自 pull requests、commit messages 或 issue bodies 的 prompt inputs，以避免 prompt injection。将内容送入 Codex 前，请检查 HTML comments 或隐藏文本。
- 通过保持 `safety-strategy` 为 `drop-sudo` 或将 Codex 移到 unprivileged user 来保护你的 `OPENAI_API_KEY`。切勿在多租户 runner 上将 action 留在 `unsafe` 模式。
- 将 Codex 作为 job 的最后一步运行，这样后续步骤不会继承任何意外状态变更。
- 如果怀疑 proxy logs 或 action output 暴露了 secret material，请立即轮换 keys。

#### 故障排查

- **同时设置了 prompt 和 prompt-file**：删除重复 input，确保只提供一个来源。
- **responses-api-proxy 未写入 server info**：确认 API key 存在且有效；proxy 只有在你提供 `openai-api-key` 时才会启动。
- **预期 `sudo` 被移除，但 `sudo` 仍成功**：确保没有早前步骤恢复了 `sudo`，并确认 runner OS 是 Linux 或 macOS。用全新 job 重新运行。
- **`drop-sudo` 之后出现权限错误**：在 action 运行前授予写入权限（例如使用 `chmod -R g+rwX "$GITHUB_WORKSPACE"`，或使用 unprivileged-user 模式）。
- **未授权触发被阻止**：如果需要允许默认写入协作者之外的服务帐户，请调整 `allow-users` 或 `allow-bots` inputs。

### Codex SDK

来源：[Codex SDK](/codex/sdk.md)

如果你通过 Codex CLI、IDE 扩展或 Codex Web 使用 Codex，也可以用程序化方式控制它。

在需要以下能力时使用 SDK：

- 将 Codex 作为 CI/CD pipeline 的一部分进行控制
- 创建可以与 Codex 交互以执行复杂工程任务的自定义 agent
- 将 Codex 构建到你自己的内部工具和工作流中
- 将 Codex 集成到你自己的应用中

#### TypeScript library

TypeScript library 提供一种从应用内部控制 Codex 的方式，相比非交互模式更全面、更灵活。

请在 server-side 使用该 library；它需要 Node.js 18 或更高版本。

#### 安装

要开始使用，请通过 `npm` 安装 Codex SDK：

```bash
npm install @openai/codex-sdk
```

#### 用法

使用你的 prompt 启动一个 Codex thread 并运行它。

```ts
const codex = new Codex();
const thread = codex.startThread();
const result = await thread.run(
  "Make a plan to diagnose and fix the CI failures"
);

console.log(result);
```

再次调用 `run()` 可在同一 thread 上继续，或通过提供 thread ID 恢复过去的 thread。

```ts
// running the same thread
const result = await thread.run("Implement the plan");

console.log(result);

// resuming past thread

const threadId = "";
const thread2 = codex.resumeThread(threadId);
const result2 = await thread2.run("Pick up where you left off");

console.log(result2);
```

更多详情请查看 [TypeScript repo](https://github.com/openai/codex/tree/main/sdk/typescript)。

#### Python library

Python SDK 通过 JSON-RPC 控制本地 Codex app-server。它需要 Python 3.10 或更高版本。发布的 SDK builds 包含一个 pinned Codex CLI runtime dependency。

#### 安装

要安装 SDK，请运行：

```bash
pip install openai-codex
```

发布的 SDK builds 会自动使用其 pinned runtime。仅当你有意针对某个特定本地 Codex executable 运行时，才传递 `CodexConfig(codex_bin=...)`。

当 Python SDK 处于 beta 阶段时，`pip install openai-codex` 会选择最新
已发布的 beta build。稳定 SDK release 出现后，使用
`pip install --pre openai-codex` 选择加入更新的 prerelease builds。

#### 用法

启动 Codex，创建 thread，并运行 prompt：

```python
from openai_codex import Codex, Sandbox

with Codex() as codex:
    thread = codex.thread_start(
        model="gpt-5.4",
        sandbox=Sandbox.workspace_write,
    )
    result = thread.run("Make a plan to diagnose and fix the CI failures")
    print(result.final_response)
```

当你的应用已经是异步时，使用 `AsyncCodex`：

```python
import asyncio

from openai_codex import AsyncCodex

async def main() -> None:
    async with AsyncCodex() as codex:
        thread = await codex.thread_start(model="gpt-5.4")
        result = await thread.run("Implement the plan")
        print(result.final_response)

asyncio.run(main())
```

#### Sandbox presets

创建 thread 或更改后续 turn 的 filesystem
访问权限时，请使用同一组 `Sandbox` presets：

```python
from openai_codex import Codex, Sandbox

with Codex() as codex:
    thread = codex.thread_start(sandbox=Sandbox.workspace_write)
    thread.run("Make the requested change.")
    review = thread.run("Review the diff only.", sandbox=Sandbox.read_only)
```

可用 presets：

- `Sandbox.read_only`：读取文件而不允许写入。
- `Sandbox.workspace_write`：读取文件，并在 workspace 和配置的 writable roots 内写入。
- `Sandbox.full_access`：在没有 filesystem access 限制的情况下运行。

省略 `sandbox=` 时，app-server 会使用其配置的默认值。传递给 `run(...)` 或 `turn(...)` 的 sandbox 会应用到该 turn 以及该 thread 后续 turns。

更多详情请查看 [Python repo](https://github.com/openai/codex/tree/main/sdk/python)。

### 非交互模式

来源：[Non-interactive mode](/codex/noninteractive.md)

非交互模式让你可以从脚本（例如 continuous integration (CI) jobs）运行 Codex，而无需打开交互式 TUI。
你通过 `codex exec` 调用它。

有关 flag 级别的详情，请参见 [`codex exec`](/codex/cli/reference#codex-exec)。

#### 何时使用 `codex exec`

当你希望 Codex 做以下事情时，使用 `codex exec`：

- 作为 pipeline（CI、pre-merge checks、scheduled jobs）的一部分运行。
- 生成可以 pipe 到其他工具的输出（例如生成 release notes 或 summaries）。
- 自然融入 CLI workflows，将命令输出链入 Codex，并将 Codex 输出传给其他工具。
- 使用显式、预先设置的 sandbox 和 approval settings 运行。

#### 基本用法

将任务 prompt 作为单个参数传入：

```bash
codex exec "summarize the repository structure and list the top 5 risky areas"
```

`codex exec` 运行时，Codex 会将进度流式传输到 `stderr`，并且只将最终 agent message 打印到 `stdout`。这使重定向或 pipe 最终结果变得直接：

```bash
codex exec "generate release notes for the last 10 commits" | tee release-notes.md
```

当你不想将 session rollout files 持久化到磁盘时，使用 `--ephemeral`：

```bash
codex exec --ephemeral "triage this repository and suggest next steps"
```

如果 stdin 被 pipe，且你也提供了 prompt 参数，Codex 会将 prompt 视为 instruction，将 pipe 进来的内容视为附加上下文。

这使你可以轻松用一个命令生成输入，并直接交给 Codex：

```bash
curl -s https://jsonplaceholder.typicode.com/comments \
  | codex exec "format the top 20 items into a markdown table" \
  > table.md
```

更多高级 stdin piping 模式见 [Advanced stdin piping](#advanced-stdin-piping)。

#### 权限和安全

默认情况下，`codex exec` 在 read-only sandbox 中运行。在自动化中，请设置工作流所需的最小权限：

- 允许编辑：`codex exec --sandbox workspace-write ""`
- 允许更广泛访问：`codex exec --sandbox danger-full-access ""`

仅在受控环境中（例如隔离的 CI runner 或 container）使用 `danger-full-access`。

Codex 保留 `codex exec --full-auto` 作为已弃用的兼容性 flag，并会打印 warning。新脚本中优先使用显式的 `--sandbox workspace-write` flag。

当你需要一次不加载 `$CODEX_HOME/config.toml` 的运行时，使用 `--ignore-user-config`；当你需要在受控自动化环境中跳过用户和项目 execpolicy `.rules` 文件时，使用 `--ignore-rules`。

如果你配置了带 `required = true` 的已启用 MCP 服务器，而它初始化失败，`codex exec` 会带错误退出，而不是在没有该服务器的情况下继续。

#### 让输出可被机器读取

要在脚本中消费 Codex 输出，请使用 JSON Lines 输出：

```bash
codex exec --json "summarize the repo structure" | jq
```

启用 `--json` 后，`stdout` 会变成 JSON Lines (JSONL) 流，因此你可以捕获 Codex 运行时发出的每个事件。事件类型包括 `thread.started`、`turn.started`、`turn.completed`、`turn.failed`、`item.*` 和 `error`。

Item types 包括 agent messages、reasoning、command executions、file changes、MCP tool calls、web searches 和 plan updates。

示例 JSON stream（每一行都是一个 JSON object）：

```jsonl
{"type":"thread.started","thread_id":"0199a213-81c0-7800-8aa1-bbab2a035a53"}
{"type":"turn.started"}
{"type":"item.started","item":{"id":"item_1","type":"command_execution","command":"bash -lc ls","status":"in_progress"}}
{"type":"item.completed","item":{"id":"item_3","type":"agent_message","text":"Repo contains docs, sdk, and examples directories."}}
{"type":"turn.completed","usage":{"input_tokens":24763,"cached_input_tokens":24448,"output_tokens":122,"reasoning_output_tokens":0}}
```

如果你只需要最终消息，请用 `-o `/`--output-last-message ` 将其写入文件。这会将最终消息写入文件，同时仍将其打印到 `stdout`（详情见 [`codex exec`](/codex/cli/reference#codex-exec)）。

#### 使用 schema 创建结构化输出

如果下游步骤需要结构化数据，请使用 `--output-schema` 请求符合 JSON Schema 的最终响应。
这适合需要稳定字段的自动化工作流（例如 job summaries、risk reports 或 release metadata）。

`schema.json`

```json
{
  "type": "object",
  "properties": {
    "project_name": { "type": "string" },
    "programming_languages": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["project_name", "programming_languages"],
  "additionalProperties": false
}
```

带 schema 运行 Codex，并将最终 JSON response 写入磁盘：

```bash
codex exec "Extract project metadata" \
  --output-schema ./schema.json \
  -o ./project-metadata.json
```

示例最终输出（stdout）：

```json
{
  "project_name": "Codex CLI",
  "programming_languages": ["Rust", "TypeScript", "Shell"]
}
```

#### 自动化中的认证

`codex exec` 默认复用已保存的 CLI authentication。在 CI 中，通常会显式提供 credentials：

#### 使用 API key auth

对于 GitHub Actions，请使用 [Codex GitHub Action](/codex/github-action)，而不是自行安装和认证 CLI。该 action 通过安装 Codex、启动 Responses API proxy 并以可配置 safety strategy 运行 Codex，来降低 API key 暴露风险。

不要在会检出或运行 repository-controlled code 的 workflows 中，将 `OPENAI_API_KEY` 或 `CODEX_API_KEY` 设置为 job-level environment variable。Build scripts、tests、dependency lifecycle hooks 或同一 job 中被攻陷的 action 都可以读取这些 environment variables。

对于其他自动化环境，请仅为单次 `codex exec` 调用设置 `CODEX_API_KEY`，并确保没有不受信任代码在同一 process environment 中运行。

要为单次运行使用不同 API key，请 inline 设置 `CODEX_API_KEY`：

```bash
CODEX_API_KEY= codex exec --json "triage open bug reports"
```

`CODEX_API_KEY` 仅在 `codex exec` 中受支持。

#### 在 CI/CD 中使用 ChatGPT-managed auth（高级）

如果你需要用 Codex 用户帐户而不是
API key 运行 CI/CD jobs，请阅读本节，例如使用 ChatGPT-managed Codex access 的企业团队在受信任
runners 上运行，或需要 ChatGPT/Codex rate limits 而不是 API key usage 的用户。

API keys 是自动化的正确默认选择，因为它们更容易
配置和轮换。仅当你明确需要以
你的 Codex account 身份运行时，才使用此路径。

请像对待密码一样对待 `~/.codex/auth.json`：它包含 access tokens。不要
提交它、粘贴到 tickets 中，或在 chat 中分享。

不要将此工作流用于 public 或 open-source repositories。如果 runner 上不能使用 `codex login`，
请通过安全存储注入 `auth.json`，在
runner 上运行 Codex 以便 Codex 原地刷新它，并在两次运行之间持久化更新后的文件。

参见 [Maintain Codex account auth in CI/CD (advanced)](/codex/auth/ci-cd-auth)。

#### 恢复非交互会话

如果你需要继续之前的运行（例如两阶段 pipeline），请使用 `resume` subcommand：

```bash
codex exec "review the change for race conditions"
codex exec resume --last "fix the race conditions you found"
```

你也可以使用 `codex exec resume <SESSION_ID>` 指向特定 session ID。

#### 需要 Git repository

Codex 要求命令在 Git repository 内运行，以防止破坏性变更。如果你确定环境安全，可使用 `codex exec --skip-git-repo-check` 覆盖此检查。

#### 常见自动化模式

#### 示例：在 GitHub Actions 中自动修复 CI failure

对于 GitHub Actions workflows，请使用 [`openai/codex-action`](https://github.com/openai/codex-action)，而不是安装 Codex 并把 API key 传给 shell step。该 action 会为 OpenAI API key 启动安全 proxy。

当 CI workflow 失败时，你可以使用 Codex 自动提出修复。模式如下：

1. 当主 CI workflow 以错误完成时，触发一个后续 workflow。
2. 以 repository read permissions only 检出失败 commit。
3. 在 Codex 之前运行 setup commands，且不要向这些步骤暴露你的 OpenAI API key。
4. 运行 Codex GitHub Action。
5. 将 Codex 的本地变更保存为 patch artifact。
6. 在单独的 job 中，应用 patch 并打开 pull request。

下面的 Codex job 只有 `contents: read`。Codex 运行后，它只会将 diff 序列化为 artifact。`open_pr` job 会获得 repository write permissions，但它不会接收 `OPENAI_API_KEY`。

该示例假定是 Node.js project。请根据你的 stack 调整 setup 和 test commands。

更深入的安全检查清单见 [Codex GitHub Action security guidance](https://github.com/openai/codex-action/blob/main/docs/security.md)。

```yaml
name: Codex auto-fix on CI failure

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]

jobs:
  generate_fix:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
    outputs:
      has_patch: ${{ steps.diff.outputs.has_patch }}
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
          fetch-depth: 0
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then npm ci; fi

      - name: Run Codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt: |
            The CI workflow "${{ github.event.workflow_run.name }}" failed for commit
            ${{ github.event.workflow_run.head_sha }}.

            Run `npm test --silent` to reproduce the failure. Identify the minimal
            change needed to make the tests pass, implement only that change, and
            run `npm test --silent` again.

            Do not refactor unrelated files.

      - name: Create patch artifact
        id: diff
        run: |
          git add -N .
          git diff --binary HEAD > codex.patch
          if [ -s codex.patch ]; then
            echo "has_patch=true" >> "$GITHUB_OUTPUT"
          else
            echo "has_patch=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Upload patch artifact
        if: steps.diff.outputs.has_patch == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: codex-fix-patch
          path: codex.patch
          if-no-files-found: error

  open_pr:
    runs-on: ubuntu-latest
    needs: generate_fix
    if: needs.generate_fix.outputs.has_patch == 'true'
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
          fetch-depth: 0

      - uses: actions/download-artifact@v4
        with:
          name: codex-fix-patch

      - name: Apply Codex patch
        run: git apply --index codex.patch

      - name: Open pull request
        env:
          GH_TOKEN: ${{ github.token }}
          FAILED_HEAD_BRANCH: ${{ github.event.workflow_run.head_branch }}
          FAILED_HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
          RUN_ID: ${{ github.event.workflow_run.run_id }}
        run: |
          branch="codex/auto-fix-$RUN_ID"

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git switch -c "$branch"
          git commit -m "Auto-fix failing CI via Codex"
          git push origin "$branch"

          {
            echo "Codex generated this patch after CI failed for \`$FAILED_HEAD_SHA\`."
            echo
            echo "Review the changes before merging."
          } > pr-body.md

          gh pr create \
            --base "$FAILED_HEAD_BRANCH" \
            --head "$branch" \
            --title "Auto-fix failing CI via Codex" \
            --body-file pr-body.md
```

#### 高级 stdin piping

当另一个命令为 Codex 生成输入时，请根据 instruction 应该来自哪里选择 stdin 模式。当你已经知道 instruction，并希望将 piped output 作为上下文传入时，使用 prompt-plus-stdin。当 stdin 应该成为完整 prompt 时，使用 `codex exec -`。

#### 使用 prompt-plus-stdin

当另一个命令已经生成你希望 Codex 检查的数据时，prompt-plus-stdin 很有用。在这种模式下，你自己编写 instruction，并将输出通过 pipe 作为上下文传入，这自然适合围绕 command output、logs 和 generated data 构建的 CLI workflows。

```bash
npm test 2>&1 \
  | codex exec "summarize the failing tests and propose the smallest likely fix" \
  | tee test-summary.md
```

#### 更多 prompt-plus-stdin 示例

#### 总结日志

```bash
tail -n 200 app.log \
  | codex exec "identify the likely root cause, cite the most important errors, and suggest the next three debugging steps" \
  > log-triage.md
```

#### 检查 TLS 或 HTTP 问题

```bash
curl -vv https://api.example.com/health 2>&1 \
  | codex exec "explain the TLS or HTTP failure and suggest the most likely fix" \
  > tls-debug.md
```

#### 准备 Slack-ready 更新

```bash
gh run view 123456 --log \
  | codex exec "write a concise Slack-ready update on the CI failure, including the likely cause and next step" \
  | pbcopy
```

#### 从 CI logs 草拟 pull request 评论

```bash
gh run view 123456 --log \
  | codex exec "summarize the failure in 5 bullets for the pull request thread" \
  | gh pr comment 789 --body-file -
```

### 将 Codex 与 Agents SDK 搭配使用

来源：[Use Codex with the Agents SDK](/codex/guides/agents-sdk.md)

你可以将 Codex 作为 MCP 服务器运行，并从其他 MCP 客户端连接它（例如使用 [OpenAI Agents SDK MCP integration](/api/docs/guides/agents/integrations-observability#mcp) 构建的 agent）。

要将 Codex 启动为 MCP 服务器，可以使用以下命令：

```bash
codex mcp-server
```

你可以使用 [Model Context Protocol Inspector](https://modelcontextprotocol.io/legacy/tools/inspector) 启动 Codex MCP 服务器：

```bash
npx @modelcontextprotocol/inspector codex mcp-server
```

发送 `tools/list` request 可以看到两个工具：

**`codex`**：运行 Codex session。接受与 Codex `Config` struct 匹配的 configuration parameters。`codex` 工具接受以下 properties：

| Property                | Type      | Description                                                                                                |
| ----------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| **`prompt`** (required) | `string`  | 用于启动 Codex 对话的初始用户 prompt。                                                   |
| `approval-policy`       | `string`  | 模型生成的 shell commands 的 approval policy：`untrusted`、`on-request` 和 `never`。         |
| `base-instructions`     | `string`  | 要使用的一组 instructions，用来替代默认 instructions。                                                |
| `config`                | `object`  | 会覆盖 `$CODEX_HOME/config.toml` 中内容的单项 configuration settings。                       |
| `cwd`                   | `string`  | session 的工作目录。如果为相对路径，则相对于 server process 的当前目录解析。   |
| `include-plan-tool`     | `boolean` | 是否在对话中包含 plan tool。                                                      |
| `model`                 | `string`  | 可选的 model name 覆盖（例如 `o3`、`o4-mini`）。                                       |
| `profile`               | `string`  | Configuration profile name；Codex 加载 `$CODEX_HOME/profile-name.config.toml` 来指定默认选项。 |
| `sandbox`               | `string`  | Sandbox mode：`read-only`、`workspace-write` 或 `danger-full-access`。                                     |

**`codex-reply`**：通过提供 thread ID 和 prompt 继续 Codex session。`codex-reply` 工具接受以下 properties：

| Property                      | Type   | Description                                               |
| ----------------------------- | ------ | --------------------------------------------------------- |
| **`prompt`** (required)       | string | 用于继续 Codex 对话的下一条用户 prompt。  |
| **`threadId`** (required)     | string | 要继续的 thread 的 ID。                         |
| `conversationId` (deprecated) | string | `threadId` 的已弃用别名（为兼容性保留）。 |

使用 `tools/call` response 中 `structuredContent.threadId` 里的 `threadId`。Approval prompts（exec/patch）也会在其 `params` payload 中包含 `threadId`。

示例 response payload：

```json
{
  "structuredContent": {
    "threadId": "019bbb20-bff6-7130-83aa-bf45ab33250e",
    "content": "`ls -lah` (or `ls -alh`) — long listing, includes dotfiles, human-readable sizes."
  },
  "content": [
    {
      "type": "text",
      "text": "`ls -lah` (or `ls -alh`) — long listing, includes dotfiles, human-readable sizes."
    }
  ]
}
```

请注意，现代 MCP clients 通常只将 `"structuredContent"`（如果存在）报告为 tool call 的结果，不过 Codex MCP server 也会返回 `"content"`，以兼容较旧的 MCP clients。

Codex CLI 能做的远不止运行 ad-hoc tasks。通过将 CLI 作为 [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) 服务器暴露，并用 OpenAI Agents SDK 编排它，你可以创建确定性、可 review 的工作流，从单个 agent 扩展到完整的软件交付 pipeline。

本指南会带你走完 [OpenAI Cookbook](https://github.com/openai/openai-cookbook/blob/main/examples/codex/codex_mcp_agents_sdk/building_consistent_workflows_codex_cli_agents_sdk.ipynb) 中展示的同一工作流。你将：

- 将 Codex CLI 作为长时间运行的 MCP server 启动，
- 构建一个专注的 single-agent workflow，用于生成可玩的 browser game，以及
- 编排一个带 hand-offs、guardrails 和完整 traces 的 multi-agent team，方便你事后 review。

开始前，请确保你具备：

- 本地已安装 [Codex CLI](/codex/cli)，因此 `codex` 命令可用。
- Python 3.10+ 和 `pip`。
- Node.js 18+，如果你想运行上面的 MCP Inspector 示例。
- 本地保存的 OpenAI API key。你可以在 [OpenAI dashboard](https://platform.openai.com/account/api-keys) 创建或管理 keys。

为本指南创建工作目录，并将 API key 添加到 `.env` 文件：

```bash
mkdir codex-workflows
cd codex-workflows
printf "OPENAI_API_KEY=sk-..." > .env
```

#### 安装依赖

Agents SDK 处理 Codex、hand-offs 和 traces 之间的编排。安装最新 SDK packages：

```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade openai openai-agents python-dotenv
```

激活 virtual environment 可使 SDK dependencies 与
系统其余部分隔离。

#### 将 Codex CLI 初始化为 MCP 服务器

首先将 Codex CLI 变成 Agents SDK 可调用的 MCP 服务器。该服务器暴露两个工具（`codex()` 用于开始对话，`codex-reply()` 用于继续对话），并让 Codex 在多个 agent turns 之间保持运行。

创建一个名为 `codex_mcp.py` 的文件，并添加以下内容：

```python
import asyncio

from agents import Agent, Runner
from agents.mcp import MCPServerStdio

async def main() -> None:
    async with MCPServerStdio(
        name="Codex CLI",
        params={
            "command": "codex",
            "args": ["mcp-server"],
        },
        client_session_timeout_seconds=360000,
    ) as codex_mcp_server:
        print("Codex MCP server started.")
        # More logic coming in the next sections.
        return

if __name__ == "__main__":
    asyncio.run(main())
```

运行脚本一次，以验证 Codex 是否成功启动：

```bash
python codex_mcp.py
```

脚本在打印 `Codex MCP server started.` 后退出。在后续章节中，你会在更丰富的工作流中复用同一个 MCP server。

#### 构建 single-agent workflow

先从一个有明确范围的示例开始：使用 Codex MCP 发布一个小型 browser game。该工作流依赖两个 agents：

1. **Game Designer**：为游戏编写 brief。
2. **Game Developer**：通过调用 Codex MCP 实现游戏。

用以下代码更新 `codex_mcp.py`。它保留上面的 MCP server setup，并添加两个 agents。

```python
import asyncio
import os

from dotenv import load_dotenv

from agents import Agent, Runner, set_default_openai_api
from agents.mcp import MCPServerStdio

load_dotenv(override=True)
set_default_openai_api(os.getenv("OPENAI_API_KEY"))

async def main() -> None:
    async with MCPServerStdio(
        name="Codex CLI",
        params={
            "command": "codex",
            "args": ["mcp-server"],
        },
        client_session_timeout_seconds=360000,
    ) as codex_mcp_server:
        developer_agent = Agent(
            name="Game Developer",
            instructions=(
                "You are an expert in building simple games using basic html + css + javascript with no dependencies. "
                "Save your work in a file called index.html in the current directory. "
                "Always call codex with \"approval-policy\": \"never\" and \"sandbox\": \"workspace-write\"."
            ),
            mcp_servers=[codex_mcp_server],
        )

        designer_agent = Agent(
            name="Game Designer",
            instructions=(
                "You are an indie game connoisseur. Come up with an idea for a single page html + css + javascript game that a developer could build in about 50 lines of code. "
                "Format your request as a 3 sentence design brief for a game developer and call the Game Developer coder with your idea."
            ),
            model="gpt-5",
            handoffs=[developer_agent],
        )

        await Runner.run(designer_agent, "Implement a fun new game!")

if __name__ == "__main__":
    asyncio.run(main())
```

执行脚本：

```bash
python codex_mcp.py
```

Codex 会读取 designer 的 brief，创建 `index.html` 文件，并将完整游戏写入磁盘。在浏览器中打开生成的文件即可游玩。每次运行都会生成不同的设计，带有独特的玩法变化和打磨细节。

## 平台、企业和注意事项

<a id="platform-enterprise-and-caveats"></a>

Windows、企业控制、OSS 说明，以及影响部署选择的产品或策略注意事项。

### 环境变量

来源：[Environment variables](/codex/environment-variables.md)

Codex 使用 `config.toml` 保存持久设置。将环境变量用于
shell 作用域覆盖、自动化 secrets、installer behavior 或 diagnostics。

本页列出 Codex 直接读取的稳定公开环境变量。
它不列出 internal development variables、test variables，或
你通过 [`env_key`](/codex/config-advanced#custom-model-providers)
自行选择的 provider-specific secret names。

#### 核心位置

| Variable            | Used by                                    | Default      | Description                                                                                                                                                      |
| ------------------- | ------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_HOME`        | CLI, IDE extension, app-server, installers | `~/.codex`   | 设置 Codex state 的 root，包括 config、auth、logs、sessions、skills 和 standalone package metadata。如果设置它，该目录必须已存在。 |
| `CODEX_SQLITE_HOME` | CLI and app-server state                   | `CODEX_HOME` | 设置 SQLite-backed state 的存储位置。`sqlite_home` config option 优先。相对路径会从当前工作目录解析。           |

有关 `CODEX_HOME` 下存储文件的更多信息，请参见
[Config and state locations](/codex/config-advanced#config-and-state-locations)。

#### Installer variables

这些变量适用于从
`https://chatgpt.com/codex/install.sh` 和
`https://chatgpt.com/codex/install.ps1` 提供的 standalone install scripts。

| Variable                | Default                                                                              | Description                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_NON_INTERACTIVE` | `false`                                                                              | 设置为 `1`、`true` 或 `yes` 可跳过 installer prompts。Prompts 会使用默认响应，因此请将其用于 scripted installs 和 updates，而不是 first-run setup。 |
| `CODEX_INSTALL_DIR`     | `~/.local/bin` on macOS/Linux; `%LOCALAPPDATA%\Programs\OpenAI\Codex\bin` on Windows | 更改可见 `codex` 命令的安装位置。standalone package cache 仍位于 `CODEX_HOME/packages/standalone` 下。                        |

对于无人值守安装，请在运行
已下载 installer 的 shell 上设置 `CODEX_NON_INTERACTIVE=1`：

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh
```

```powershell
$env:CODEX_NON_INTERACTIVE=1; irm https://chatgpt.com/codex/install.ps1 | iex
```

#### 认证和网络

| Variable               | Used by                             | Description                                                                                                                                                               |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_API_KEY`        | `codex exec`                        | 为单次非交互运行提供 API key。仅在 `codex exec` 中受支持；运行 repository-controlled code 时请 inline 设置，而不是 job-wide 设置。 |
| `CODEX_ACCESS_TOKEN`   | CLI, app-server, trusted automation | 为受信任自动化提供 ChatGPT 或 Codex access token。对于持久化登录，请将其 pipe 到 `codex login --with-access-token`。                                       |
| `CODEX_CA_CERTIFICATE` | HTTPS, login, and WebSocket clients | 指向用于企业 TLS interception 或 private root CAs 环境的 PEM CA bundle。优先于 `SSL_CERT_FILE`。                                    |
| `SSL_CERT_FILE`        | HTTPS, login, and WebSocket clients | 当 `CODEX_CA_CERTIFICATE` 未设置时的 fallback PEM CA bundle path。                                                                                                         |

对于 provider API keys，请在 model provider
configuration 中设置
[`env_key`](/codex/config-advanced#custom-model-providers)。Codex 会读取该 config 指定的变量，因此变量
名本身不是固定的 Codex environment variable。

有关自动化 secret handling，请参见
[Use API key auth](/codex/noninteractive#use-api-key-auth)。
有关 access token 设置，请参见 [Access tokens](/codex/enterprise/access-tokens)。

#### Diagnostics

| Variable   | Used by            | Description                                                                                                             |
| ---------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `RUST_LOG` | CLI and app-server | 控制 Rust log filtering 和 verbosity。除非你设置更详细的值，否则 `codex exec` 默认输出 `error`。 |

`RUST_LOG` 接受 `error`、`warn`、`info`、`debug` 和
`trace` 等值。它还接受更有针对性的 Rust logging filters，例如
`codex_core=debug,codex_tui=debug`。

交互式 CLI 默认会将 diagnostics 记录在有界本地存储中，但
plaintext `codex-tui.log` 文件是 opt-in。需要 plaintext log 进行故障排查时，请显式设置 `log_dir`：

```bash
RUST_LOG=debug codex -c log_dir=./.codex-log
tail -F ./.codex-log/codex-tui.log
```

在非交互模式中，`codex exec` 会 inline 打印消息，而不是写入
单独的 TUI log 文件。

### Access tokens

来源：[Access tokens](/codex/enterprise/access-tokens.md)

Codex access tokens 是限定到 Codex 权限的 ChatGPT access tokens，可让受信任自动化以 ChatGPT workspace identity 运行 Codex local。当脚本、scheduled job 或 CI runner 需要可重复的非交互式 Codex access 时，请使用它们。

Codex access tokens 目前支持 ChatGPT Business 和
Enterprise workspaces。

Access tokens 在 ChatGPT admin console 的 [Access tokens](https://chatgpt.com/admin/access-tokens) 中创建。它们绑定到创建它们的 ChatGPT 用户和 workspace，Codex 会将它们作为 programmatic local workflows 的 agent identities。

如果 Platform API key 可满足你的自动化，请继续使用 API key auth。当 workflow 明确需要 ChatGPT workspace
access、ChatGPT-managed Codex entitlements 或 enterprise workspace controls 时，使用
Codex access tokens。

需要从自己的系统触发已发布的 ChatGPT workspace agent？请改用
Workspace Agents API 的 Workspace Agent access token。Codex
access tokens 用于认证 Codex local workflows；它们不会认证
workspace agent trigger calls。参见 [Authenticate with Workspace Agent access
tokens](/workspace-agents/authentication)。

#### Access tokens 如何工作

当 Codex 需要在没有用户完成 browser sign-in 的情况下运行时，使用 access token。该 token 代表创建它的 ChatGPT workspace 用户，因此 runs 可以使用该用户的 Codex access，并出现在 workspace governance data 中。

Codex 会在 run 启动时检查 token，并将 run 绑定到该 workspace identity。请像对待其他自动化 secret 一样对待 token：将其存储在 secret manager 中，避免出现在 logs 中，并定期轮换。

Access tokens 适用于：

- 从受信任自动化运行的 `codex exec` jobs。
- 需要可重复、非交互式 Codex runs 的本地脚本。
- 希望 usage 与 ChatGPT workspace user 而不是 API organization key 关联的企业工作流。

要避免的主要风险：

- **Leaked secrets：** 任何拿到 token 的人都可以以 token 创建者身份启动 Codex runs。请将 tokens 存储在 secret manager 中，避免进入 logs，并定期轮换。
- **Untrusted runners：** public CI、forked pull requests 或 shared machines 可能向工作区外人员暴露 tokens。仅在 trusted runners 上使用 access tokens。
- **Shared identities：** 一个人的 token 在不相关团队中复用，会让 ownership 和 audit trails 更难解释。请为具体 workflow owner 创建 tokens。
- **Stale credentials：** 长期 token 可能在 workflow 变化后仍保持有效。优先使用有限 expiration，并撤销不再使用的 tokens。
- **Wrong credential type：** Codex access tokens 用于 Codex local workflows。请使用 Workspace Agent access tokens 触发已发布的 ChatGPT workspace agents，并使用 Platform API keys 进行一般 OpenAI API calls。

#### 启用 access token 创建

使用 workspace settings 中的 access token permission，为允许的成员开启 access token creation。

1. 前往 [Workspace Settings > Permissions & roles](https://chatgpt.com/admin/settings)。
2. 在 **Access tokens** 部分，如果所有被允许的成员都应能创建 access tokens，请开启 **Allow users to create access tokens**。
3. 如果成员需要将这些 tokens 用于 Codex app、CLI 或 IDE 扩展，请确保 **Codex Local** 部分中的 **Allow members to use Codex Local** 也已开启。

请将 access token creation 限制在了解 token 将存储在哪里、哪个自动化会使用它以及如何轮换它的人员或 service owners 范围内。

#### 设置 access token expiration limit

Workspace owners 和 admins 可以设置成员创建 Codex access token 时可选择的最长 expiration。前往 [Workspace Settings > Permissions & roles](https://chatgpt.com/admin/settings)，然后在 Codex Local 部分设置 **Access token expiration limit**。

该限制适用于新的 access tokens。现有 tokens 保持其当前 expiration。

#### 创建 access token

使用 Access tokens 页面为 token 命名并选择到期时间。

1. 前往 [Access tokens](https://chatgpt.com/admin/access-tokens)。
2. 选择 **Create**。

3. 输入描述性名称，例如 `release-ci` 或 `nightly-docs-check`。

4. 选择 expiration。优先选择有限 expiration，例如 7、30、60 或 90 天。如果选择 **No expiration**，请按固定计划轮换 token。
5. 选择 **Create**。
6. 立即复制生成的 access token。关闭 modal 后无法再次查看。
7. 将 token 存储在你的 secret manager 或 CI secret store 中。

最短 custom expiration 是一天。已撤销和已过期的 tokens 不能用于启动新的 Codex runs。

#### 将 access token 用于 Codex CLI

对于 ephemeral automation，请将 token 存储在 `CODEX_ACCESS_TOKEN` 中，并正常运行 Codex：

```bash
export CODEX_ACCESS_TOKEN=""
codex exec --json "review this repository and summarize the top risks"
```

对于持久化本地登录，请将 token pipe 到 `codex login --with-access-token`：

```bash
printf '%s' "$CODEX_ACCESS_TOKEN" | codex login --with-access-token
codex exec "summarize the last release diff"
```

`codex login --with-access-token` 会在 Codex auth storage 中存储 agent identity credential。如果你不希望在机器上持久化 credentials，请改用 `CODEX_ACCESS_TOKEN` 环境变量。

#### 轮换或撤销 token

像轮换其他 automation secrets 一样轮换 access tokens：

1. 创建替代 token。
2. 更新 runner、scheduler 或 secret manager 中的 secret。
3. 使用新 token 运行 smoke test。
4. 从 [Access tokens](https://chatgpt.com/admin/access-tokens) 撤销旧 token。

在 Access tokens 页面，workspace owners 和 admins 可以撤销工作区中的任何 token。拥有 access token permission 的成员只能撤销自己创建的 tokens。

#### 权限模型

Access token creation 由 workspace 的 access token permission 控制，它独立于通用 Codex local permission。成员可以访问 Codex app、CLI 或 IDE 扩展，但不能创建 access tokens。

| Capability                                                    | Workspace owners and admins                          | Member with access token permission           | Member without access token permission |
| ------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| Open [Access tokens](https://chatgpt.com/admin/access-tokens) | 是                                                  | 是                                           | 否                                     |
| Create access tokens                                          | 是，针对自己的 ChatGPT workspace identity        | 是，针对自己的 ChatGPT workspace identity | 否                                     |
| List access tokens                                            | Workspace list，包括谁创建了每个 token     | 仅限自己创建的 tokens                      | 否                                     |
| Revoke access tokens from the Access tokens page              | Workspace 中的任何 token                           | 仅限自己创建的 tokens                      | 无 page access                         |
| Grant or remove access token permission                       | 是                                                  | 否                                            | 否                                     |
| Manage other Codex enterprise settings                        | 是，取决于 admin role 和 Codex admin permissions | 否，除非单独授予                 | 否                                     |

简而言之：workspace owners 和 admins 在 workspace level 管理访问权限。成员需要 access token permission 才能创建和管理自己的 tokens，但该 permission 不授予 admin rights，也不授予访问其他成员 tokens 的权限。

#### 故障排查

#### Access tokens 页面返回 404 或 forbidden

请让 workspace owner 或 admin 确认你的角色包含 **Allow users to create access tokens**，并且如果你计划将 token 用于 Codex，**Allow members to use Codex Local** 已启用。

#### `codex login --with-access-token` 失败

确认你复制的是生成的 access token，而不是 browser session token 或 Platform API key。还要确认该 token 未过期或被撤销。

#### 相关文档

- [Authentication](/codex/auth)
- [Non-interactive mode](/codex/noninteractive)
- [Admin setup](/codex/enterprise/admin-setup)
- [Governance](/codex/enterprise/governance)

### Admin Setup

来源：[Admin Setup](/codex/enterprise/admin-setup.md)

本指南适用于想为其工作区设置 Codex 的 ChatGPT Enterprise admins。

请将本页作为分步 rollout guide。有关详细的 policy、configuration、automation 和 monitoring 信息，请使用链接页面：[Authentication](/codex/auth)、[Agent approvals & security](/codex/agent-approvals-security)、[Access tokens](/codex/enterprise/access-tokens)、[Managed configuration](/codex/enterprise/managed-configuration) 和 [Governance](/codex/enterprise/governance)。

#### 企业级安全和隐私

Codex 支持 ChatGPT Enterprise 安全功能，包括：

- 不使用企业数据进行训练
- 遵循 ChatGPT Enterprise policies 的 residency 和 retention
- 细粒度用户访问控制
- 静态数据加密（AES-256）和传输中加密（TLS 1.2+）
- 通过 ChatGPT Compliance API 进行 audit logging

有关安全控制和运行时保护，请参见 [Agent approvals & security](/codex/agent-approvals-security)。有关更多详情，请参阅 [Zero Data Retention (ZDR)](https://platform.openai.com/docs/guides/your-data#zero-data-retention)。
更广泛的企业安全概览见 [Codex security white paper](https://trust.openai.com/?itemUid=382f924d-54f3-43a8-a9df-c39e6c959958&source=click)。

#### 前置条件：确定负责人和 rollout strategy

在 rollout 期间，团队成员可能支持将 Codex 集成到组织中的不同方面。请确保你有以下负责人：

- **ChatGPT Enterprise workspace owner：** 配置工作区中的 Codex settings 所必需。
- **Security owner：** 决定 Codex 的 agent permissions settings。
- **Analytics owner：** 将 analytics 和 compliance APIs 集成到你的 data pipelines。

决定你将使用哪些 Codex surfaces：

- **Codex local：** 包括 Codex app、CLI 和 IDE extension。agent 在开发者计算机上的 sandbox 中运行。
- **Codex cloud：** 包括 hosted Codex features（包括 Codex cloud、iOS、Code Review，以及由 [Slack integration](/codex/integrations/slack) 或 [Linear integration](/codex/integrations/linear) 创建的 tasks）。agent 在托管 container 中远程运行，并带有你的 codebase。
- **两者：** local + cloud 一起使用。

你可以启用 local、cloud 或两者，并通过 workspace settings 和 role-based access control (RBAC) 控制访问。

#### 第 1 步：在工作区中启用 Codex

你在 ChatGPT Enterprise workspace settings 中配置 Codex 访问权限。

前往 [Workspace Settings > Settings and Permissions](https://chatgpt.com/admin/settings)。

#### Codex local

对于新的 ChatGPT Enterprise workspaces，Codex local 默认启用。如果
你不是 ChatGPT workspace owner，可以通过
[installing Codex](/codex/quickstart) 并使用工作邮箱登录来测试是否有访问权限。

开启 **Allow members to use Codex Local**。

这会允许被授权用户使用 Codex app、CLI 和 IDE extension。

如果成员需要 programmatic Codex local workflows，请在 **Access tokens** 部分或通过 custom role 授予 **Allow users to create access tokens**。Workspace owners 和 admins 可以使用 **Codex Local** 部分中的 **Access token expiration limit**，设置成员可为新 tokens 选择的最长 expiration。有关设置和权限详情，请参见 [Access tokens](/codex/enterprise/access-tokens)。

如果 Codex Local toggle 关闭，尝试使用 Codex app、CLI 或 IDE 的用户会看到以下错误：“403 - Unauthorized. Contact your ChatGPT administrator for access.”

#### 为 Codex CLI 启用 device code authentication

允许开发者在非交互式环境（例如 remote development box）中使用 Codex CLI 时通过 device code 登录。更多详情见 [authentication](https://developers.openai.com/codex/auth/)。

#### Codex cloud

#### 前置条件

Codex cloud 需要 **GitHub（cloud-hosted）repositories**。如果你的 codebase 在本地部署或不在 GitHub 上，可以使用 Codex SDK 在自己的基础设施上构建类似工作流。

要以 admin 身份设置 Codex，你必须拥有组织内常用 repositories 的 GitHub 访问权限。如果没有必要的
访问权限，请与你工程团队中的相关人员合作。

#### 在 workspace settings 中启用 Codex cloud

首先在 [Workspace Settings > Settings and Permissions](https://chatgpt.com/admin/settings) 的 Codex 部分开启 ChatGPT GitHub Connector。

要为你的 workspace 启用 Codex cloud，请开启 **Allow members to use Codex cloud**。启用后，用户可以直接从 ChatGPT 左侧导航面板访问 Codex。

请注意，Codex 可能最多需要 10 分钟才会出现在 ChatGPT 中。

#### 允许 Codex Slack app 在任务完成时发布答案

任务完成时，Codex 会将完整答案发回 Slack。否则，Codex 只会发布任务链接。

要了解更多，请参见 [Codex in Slack](/codex/integrations/slack)。

#### 允许 Codex agent 访问互联网

默认情况下，Codex cloud agents 在运行时没有互联网访问权限，以帮助防范 prompt injection 等 security 和 safety risks。

此设置允许用户使用常用软件依赖域的 allowlist、添加 domains 和 trusted sites，并指定允许的 HTTP methods。

有关互联网访问和运行时控制的安全影响，请参见 [Agent approvals & security](/codex/agent-approvals-security)。

#### 第 2 步：设置 custom roles (RBAC)

使用 RBAC 控制访问 Codex local 和 Codex cloud 的细粒度权限。

#### RBAC 允许你做什么

Workspace Owners 可以在 ChatGPT admin settings 中使用 RBAC：

- 为未分配任何 custom role 的用户设置 default role
- 创建具有细粒度 permissions 的 custom roles
- 将一个或多个 custom roles 分配给 Groups
- 通过 SCIM 自动同步用户到 Groups
- 从 Custom Roles tab 集中管理 roles

用户可以继承多个 role，permissions 会解析为这些 roles 中最宽松（least restrictive）的访问。

#### 创建 Codex Admin group

设置专用的 "Codex Admin" group，而不是向广泛人群授予 Codex administration。

**Allow members to administer Codex** toggle 会授予 Codex Admin role。Codex Admins 可以：

- 查看 Codex [workspace analytics](https://chatgpt.com/codex/settings/analytics)
- 打开 Codex [Policies page](https://chatgpt.com/codex/settings/policies) 管理 cloud-managed `requirements.toml` policies
- 将这些 managed policies 分配给 user groups，或配置 default fallback policy
- 管理 Codex cloud environments，包括编辑和删除 environments

将此 role 用于负责 Codex rollout、policy management 和 governance 的少量 admins。普通 Codex users 不需要它。不需要启用 Codex cloud 即可启用此 toggle。

推荐 rollout 模式：

- 创建 "Codex Users" group，供应使用 Codex 的人员加入
- 创建单独的 "Codex Admin" group，供较少数应管理 Codex settings 和 policies 的人员加入
- 仅将启用 **Allow members to administer Codex** 的 custom role 分配给 "Codex Admin" group
- 将 "Codex Admin" group 的成员限制为 workspace owners 或指定的 platform、IT 和 governance operators
- 如果使用 SCIM，请用你的 identity provider 支撑 "Codex Admin" group，这样 membership 变更可审计并集中管理

这种分离让 Codex rollout 更容易，同时将 analytics、environment management 和 policy deployment 限制在受信任 admins 范围内。有关 RBAC 设置详情和完整权限模型，请参见 [OpenAI RBAC Help Center article](https://help.openai.com/en/articles/11750701-rbac)。

#### 第 3 步：配置 Codex local requirements

Codex Admins 可以从 Codex [Policies page](https://chatgpt.com/codex/settings/policies) 部署 admin-enforced `requirements.toml` policies。

当你想对不同 groups 应用不同的 local Codex constraints，而不先分发 device-level files 时，请使用此页面。managed policy 使用与 [Managed configuration](/codex/enterprise/managed-configuration) 中描述相同的 `requirements.toml` 格式，因此你可以定义 allowed approval policies、sandbox modes、web search behavior、MCP server allowlists、feature pins 和 restrictive command rules。要禁用 Browser Use、in-app browser 或 Computer Use，请参见 [Pin feature flags](/codex/enterprise/managed-configuration#pin-feature-flags)。

推荐设置：

1. 为大多数用户创建 baseline policy，然后仅在需要时创建更严格或更宽松的 variants。
2. 将每个 managed policy 分配给特定 user group，并为其他所有人配置 default fallback policy。
3. 谨慎排列 group rules。如果用户匹配多个 group-specific rule，则第一个匹配规则适用。
4. 将每个 policy 视为该 group 的完整 profile。Codex 不会从后续匹配的 group rules 中填补缺失字段。

当用户使用 ChatGPT 登录时，这些 cloud-managed policies 会应用到所有 Codex local surfaces，包括 Codex app、CLI 和 IDE extension。

#### requirements.toml policies 示例

使用 cloud-managed `requirements.toml` policies 强制执行你希望每个 group 采用的 guardrails。下面的 snippets 是你可以调整的示例，而非必需设置。

对于 Codex 0.138.0 或更高版本，优先使用带有 managed
`default_permissions` 的 `allowed_permission_profiles`。仅对仍配置
`sandbox_mode` 的 legacy deployments 使用 `allowed_sandbox_modes`。

示例：限制标准 local rollout 的 web search、sandbox mode 和 approvals：

```toml
allowed_web_search_modes = ["disabled", "cached"]
allowed_sandbox_modes = ["workspace-write"]
allowed_approval_policies = ["on-request"]
```

示例：为已升级 fleet 允许标准 permission profiles：

Permission-profile allowlists 需要 Codex 0.138.0 或更高版本。请仅在
每个 managed client 都运行支持 release 后使用此示例。

```toml
default_permissions = ":workspace"

[allowed_permission_profiles]
":read-only" = true
":workspace" = true
```

示例：约束 Browser Use、in-app browser 和 Computer Use：

```toml
[features]
browser_use = false
browser_use_full_cdp_access = false
in_app_browser = false
computer_use = false
```

示例：当你希望 admins 阻止或 gate 特定命令时，添加 restrictive command rule：

```toml
[rules]
prefix_rules = [
  { pattern = [{ token = "git" }, { any_of = ["push", "commit"] }], decision = "prompt", justification = "Require review before mutating remote history." },
]
```

你可以单独使用任一示例，也可以将它们组合到某个 group 的单个 managed policy 中。有关确切 keys、precedence 和更多示例，请参见 [Managed configuration](/codex/enterprise/managed-configuration) 和 [Agent approvals & security](/codex/agent-approvals-security)。

#### 检查用户 policies

使用 workflow 末尾的 policy lookup tools 确认哪个 managed policy 适用于某个用户。你可以按 group 检查 policy assignment，或输入用户 email。

如果你计划限制 local clients 的登录方式或 workspace，请参见 [Authentication](https://developers.openai.com/codex/auth) 中的 admin-managed authentication restrictions。

#### 第 4 步：使用 Team Config 标准化本地配置

想在组织内标准化 Codex 的团队可以使用 Team Config 共享 defaults、rules 和 skills，而无需在每个本地配置上重复设置。

你可以将 Team Config settings 提交到 repository 的 `.codex` 目录下。当用户打开该 repository 时，Codex 会自动拾取 Team Config settings。

从流量最高的 repositories 开始使用 Team Config，让团队在最常使用 Codex 的地方获得一致行为。

| Type                                 | Path          | Use it to                                                                    |
| ------------------------------------ | ------------- | ---------------------------------------------------------------------------- |
| [Config basics](/codex/config-basic) | `config.toml` | 设置 sandbox mode、approvals、model、reasoning effort 等 defaults。 |
| [Rules](/codex/rules)                | `rules/`      | 控制 Codex 可以在 sandbox 外运行哪些命令。                    |
| [Skills](/codex/skills)              | `skills/`     | 让 shared skills 可供你的团队使用。                                   |

有关位置和 precedence，请参见 [Config basics](/codex/config-basic#configuration-precedence)。

#### 第 5 步：配置 Codex cloud 使用（如果已启用）

此步骤涵盖你启用 Codex cloud workspace toggle 之后的 repository 和 environment 设置。

#### 将 Codex cloud 连接到 repositories

1. 前往 [Codex](https://chatgpt.com/codex) 并选择 **Get started**
2. 选择 **Connect to GitHub**，以安装 ChatGPT GitHub Connector（如果尚未将 GitHub 连接到 ChatGPT）
3. 安装或连接 ChatGPT GitHub Connector
4. 为 ChatGPT Connector 选择 installation target（通常是你的主要 organization）
5. 允许你希望连接到 Codex 的 repositories

对于 GitHub Enterprise Managed Users (EMU)，organization owner 必须先为 organization 安装
Codex GitHub App，用户才能在 Codex cloud 中连接
repositories。

更多信息见 [Cloud environments](https://developers.openai.com/codex/cloud/environments)。

Codex 会为每次操作使用短期、最小权限的 GitHub App installation tokens，并尊重用户现有的 GitHub repository permissions 和 branch protection rules。

### Auto-review

来源：[Auto-review](/codex/concepts/sandboxing/auto-review.md)

Auto-review 用一个单独的
reviewer agent 取代 sandbox boundary 处的人工审批。主 Codex agent 仍在同一个 sandbox 内运行，具有
相同的 approval policy 以及相同的 network 和 filesystem limits。区别在于谁来 review 符合条件的 escalation requests。

Auto-review 只在 approvals 为 interactive 时适用。实际中，这
意味着 `approval_policy = "on-request"` 或仍会显示相关 prompt category 的 granular approval policy。使用 `approval_policy = "never"` 时，
没有内容需要 review。

#### Auto-review 如何工作

高层流程如下：

1. 主 agent 在 `read-only` 或 `workspace-write` 内工作。
2. 当它需要跨越 sandbox boundary 时，请求 approval。
3. 如果 `approvals_reviewer = "auto_review"`，Codex 会将该 approval request
   路由给单独的 reviewer agent，而不是停下来等待人。
4. reviewer 决定该 action 是否应运行，并返回 rationale。
5. 如果 action 获批，则继续执行。如果被拒绝，主
   agent 会被指示寻找实质上更安全的路径，或停止并询问
   用户。

Auto-review 是 reviewer 的替换，而不是权限授予。它不会扩展
`writable_roots`、启用 network access 或削弱 protected paths。它只
改变 Codex 如何处理本来就需要 approval 的 actions。

#### 何时触发

Auto-review 会评估原本会暂停等待人类的 approval requests。
这些包括：

- 请求 escalated sandbox permissions 的 shell 或 exec tool calls。
- 被当前 sandbox 或 policy 阻止的 network requests。
- 允许的 writable roots 之外的 file edits。
- 基于 tool annotations 或 configured approval mode 需要 approval 的 MCP 或 app tool calls。
- Browser Use 对新网站或 domain 的访问。

Auto-review 不会针对已在
sandbox 内允许的 routine actions 运行。如果某个命令可以在活动 `sandbox_mode` 下运行，或 tool call
保持在允许的 policy 内，主 agent 会不经 review 继续执行。

Computer Use 是另一种情况。Computer Use 的 app approvals 仍会
直接显示给用户，因此 Auto-review 不会替换这些 app-level prompts。

#### Auto-review 会阻止什么

从高层看，Auto-review 旨在阻止如下 actions：

- 将 private data、secrets 或 credentials 发送到 untrusted destinations
- 探测 credentials、tokens、cookies 或 session material
- 广泛或持久的 security weakening
- 具有重大不可逆损害风险的 destructive actions

确切 policy 位于 open-source Codex repository：
[policy_template.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy_template.md)
和
[policy.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md)。
该 policy 可以通过 `guardian_policy_config` 针对每个 enterprise 自定义，或
由用户通过本地 [`[auto_review].policy`](/codex/config-advanced#approval-policies-and-sandbox-modes) 自定义。

#### reviewer 会看到什么

reviewer 本身也是一个 Codex agent，但它的任务比主 agent 更窄：
决定某个具体的 boundary-crossing action 是否应运行。

reviewer 会看到一个紧凑 transcript 以及确切的 approval request。这
通常包括 user messages、显示出的 assistant updates、相关 tool
calls 和 tool outputs，以及当前被提议审批的 action。它也可以
执行 read-only checks 来收集缺失上下文，但很少这样做。

Hidden assistant reasoning 不会包含在内。Auto-review 看到的是保留的
conversation items 和 tool evidence，而不是 private chain-of-thought。

#### 拒绝和失败行为

明确拒绝不会被视为普通 sandbox error。Codex 会将
review rationale 返回给主 agent，并添加更强的 instruction：

- 不要通过 workaround、indirect execution 或 policy
  circumvention 追求相同结果。
- 仅在有实质上更安全的替代方案时继续。
- 否则，停止并询问用户。

Codex 还会按 turn 应用 rejection circuit breaker。在当前
open-source implementation 中，Auto-review 会在同一 turn 内连续 `3`
次拒绝，或最近 `50` 次 reviews 的滚动窗口内有 `10` 次拒绝后 interrupt 当前 turn。

任何 non-denial 都会重置 consecutive-denial counter。当 breaker 触发时，
Codex 会发出 warning，并以 interrupt 中止当前 turn，而不是
让 agent 循环发起更多 escalation attempts。

Timeouts 会与明确拒绝分开展示，主 agent 会被告知
timeout 本身并不证明 action 不安全。

对于被拒绝的 actions，也有显式 override 路径。在当前
open-source TUI 中，运行 `/approve` 打开 **Auto-review Denials** picker，然后
选择最近一个被拒绝的 action 批准一次 retry。Codex 每个 thread 最多记录 10 个
recent denials。该 approval 是狭窄的：它只适用于完全相同的
被拒 action，而不适用于未来类似 actions；它在同一 context 中记录一次 retry；并且 retry 仍会经过 Auto-review。底层实现上，
Codex 会为该 exact action 注入 developer-scoped approval marker。随后
reviewer 会将该显式用户 override 作为上下文看到，但它仍然遵循
policy；如果 policy 认为用户不能覆盖该类
denial，仍可再次拒绝。

#### 配置

设置详情见
[Managed configuration](/codex/enterprise/managed-configuration#configure-automatic-review-policy)。

默认 reviewer policy 位于 open-source Codex repository：
[core/src/guardian/policy.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md)。
Enterprises 可以在 managed requirements 中用
`guardian_policy_config` 替换其 tenant-specific section。Individual users 也可以在
`config.toml` 中设置本地
[`[auto_review].policy`](/codex/config-advanced#approval-policies-and-sandbox-modes)，
但 managed requirements 优先：

```toml
[auto_review]
policy = """
YOUR POLICY GOES HERE
"""
```

要自定义 policy，请先复制完整默认 policy wording，然后
根据你的 individual risk profile 进行迭代。

#### 在不削弱安全性的情况下降低 review 量

当 sandbox 已覆盖常见安全
工作流时，Auto-review 效果最好。如果太多普通 action 需要 review，请先修复 boundary，
而不是教 reviewer 永远批准 noisy escalations。

实践中，杠杆最高的变更是：

- 为你有意使用的 scratch directories 或 neighboring repos 添加狭窄的
  [`writable_roots`](/codex/config-advanced#approval-policies-and-sandbox-modes)。
- 添加窄作用域的 [prefix rules](/codex/rules)。优先使用精确 command
  prefixes，例如 `["cargo", "test"]` 或 `["pnpm", "run", "lint"]`，而不是宽泛
  patterns，例如 `["python"]` 或 `["curl"]`。宽泛规则通常会抹掉 Auto-review 本应守护的
  boundary。

Auto-review session transcripts 默认保留在 `~/.codex/sessions` 下，
因此你可以在更改 policy 或 permissions 之前，让 Codex 分析那里的历史 traffic。

#### 限制

Auto-review 改善了长时间运行 agentic work 的默认运行点，
但它不是确定性的安全保证。

- 它只评估请求跨越 boundary 的 actions。
- 它仍可能出错，尤其是在 adversarial 或 unusual contexts 中。
- 它应补充而非取代良好的 sandbox design、monitoring 和
  organization-specific policy。

有关研究动机和已发布评估结果，请参见
[Alignment Research post on Auto-review](https://alignment.openai.com/auto-review/)。

### Governance

来源：[Governance](/codex/enterprise/governance.md)

Codex 让企业团队能够看到 adoption 和 impact，并提供 security 和 compliance programs 所需的 auditability。使用 self-serve dashboard 进行日常跟踪，使用 Analytics API 进行 programmatic reporting，并使用 Compliance API 将详细 logs 导出到你的 governance stack。

#### 跟踪 Codex usage 的方式

根据你的需求，有三种监控 Codex usage 的方式：

- **Analytics Dashboard**：快速查看 adoption、usage 和 code review impact。
- **Analytics API**：将结构化 daily metrics 拉入你的 data warehouse 或 BI tools。
- **Compliance API**：导出详细 activity logs，用于 audit、monitoring 和 investigations。

#### Analytics Dashboard

#### Dashboard views

analytics dashboard 允许 ChatGPT workspace administrators 和 analytics viewers 跟踪 Codex adoption、usage 和 Code Review feedback。Usage data 可能最多滞后 12 小时。

Codex 为 daily 和 weekly views 提供 date-range controls。关键 charts 包括：

- 按 product surface 划分的 active users，包括 CLI、IDE extension、cloud、desktop 和 Code Review
- Workspace 和 personal usage breakdowns，包括按 product surface 或 model 划分的 credit 和 token usage
- 按 client 划分的 threads 和 turns 产品活动
- User ranking table，带有 client filters 以及 credits、threads、turns、text tokens 和 current streak 等 sort options
- Code Review activity，包括 PRs reviewed、按 priority 划分的 issues、comments、replies、reactions 和 feedback sentiment
- 当你的 workspace 具备相关功能时，包含 Skill invocations、agent identity usage 和 access token usage

#### Data export

Administrators 还可以以 CSV 或 JSON format 导出 Codex analytics data。Codex 提供以下 export options：

- Workspace usage，包括 daily active users、threads、turns，以及按 surface 划分的 credits
- Usage per user，包括 across surfaces 的 daily threads、turns 和 credits，并在允许时包含可选 email addresses
- Code Review details，包括 daily comments、reactions、replies 和 priority-level findings

#### Analytics API

当你想自动化 reporting、构建 internal dashboards，或将 Codex metrics 与现有 engineering data 结合时，使用 [Analytics API](https://chatgpt.com/codex/cloud/settings/apireference)。

#### 衡量内容

企业 Analytics API 返回 workspace 的 daily 或 weekly UTC buckets。它支持 workspace-level 和 per-user usage、per-client breakdowns、Code Review throughput、Code Review comment priority，以及用户对 Code Review comments 的 engagement。

#### Endpoints

Base URL 是 `https://api.chatgpt.com/v1/analytics/codex`。所有 endpoints 都返回带有 `has_more` 和 `next_page` 的 paginated `page` objects。

使用 `start_time` 表示 reporting window 开始处的 inclusive Unix timestamp，`end_time` 表示 reporting window 结束处的 exclusive Unix timestamp，`group_by` 表示 `day` 或 `week` buckets，`limit` 表示 page size，`page` 用于从上一响应继续。Requests 最多可回看 90 天。

#### Usage

`GET /workspaces/{workspace_id}/usage`

- 返回 daily 或 weekly buckets 中的 threads、turns、credits 和 per-client usage 总计。
- 省略 `group` 可返回 per-user rows。
- 设置 `group=workspace` 可返回 workspace-wide rows。
- 包含 text input、cached input 和 output token fields。

#### Code review activity

`GET /workspaces/{workspace_id}/code_reviews`

- 返回 Codex 完成的 pull request reviews。
- 返回 Codex 生成的总 comments。
- 按 P0、P1 和 P2 priority 分解 comments。

#### 用户对 code review 的 engagement

`GET /workspaces/{workspace_id}/code_review_responses`

- 返回对 Codex comments 的 replies 和 reactions。
- 将 reactions 分解为 positive、negative 和 other reactions。
- 统计获得 reactions、replies 或任一 engagement form 的 comments。

#### 工作原理

Analytics 使用 time windows，并支持 day 或 week grouping。结果按时间排序，并通过 cursor-based pagination 分页返回。请使用限定到 `codex.enterprise.analytics.read` 的 API key。

#### 常见用例

- Engineering observability dashboards
- 面向 leadership updates 的 adoption reporting
- Usage governance 和 cost monitoring

#### Compliance API

当你需要 security、legal 和 governance workflows 的 auditable records 时，使用 [Compliance API](https://chatgpt.com/admin/api-reference)。

#### 衡量内容

Compliance API 为 enterprises 提供导出 Codex activity logs 和 metadata 的方式，以便你将这些数据连接到现有 audit、monitoring 和 security workflows。它设计用于 eDiscovery、DLP、SIEM 或其他 compliance systems 等工具。

对于通过 ChatGPT 认证的 Codex usage，Compliance API exports 会提供 Codex activity 的 audit records，并可用于 investigations 和 compliance workflows。这些 audit logs 最多保留 30 天。API-key-authenticated Codex usage 遵循你的 API organization settings，不包含在 Compliance API exports 中。

#### 可导出内容

#### Activity logs

- 发送给 Codex 的 prompt text
- Codex 生成的 responses
- workspace、user、timestamp 和 model 等 identifiers
- Token usage 和相关 request metadata

#### 用于 audit 和 investigation 的 metadata

使用 record metadata 回答以下问题：

- 谁运行了任务
- 谁创建或撤销了 access token
- 何时运行
- 使用了哪个 model
- 处理了多少 content

#### 常见用例

- Security investigations
- Compliance reporting
- Policy enforcement audits
- 将 events 路由到 SIEM 和 eDiscovery pipelines

### Managed configuration

来源：[Managed configuration](/codex/enterprise/managed-configuration.md)

Enterprise admins 可以通过两种方式控制本地 Codex 行为：

- **Requirements**：用户不能覆盖的 admin-enforced constraints。
- **Managed defaults**：Codex 启动时应用的起始值。用户仍可在 session 期间更改设置；Codex 下次启动时会重新应用 managed defaults。

#### Admin-enforced requirements (requirements.toml)

Requirements 会约束 security-sensitive settings（approval policy、approvals reviewer、automatic review policy、sandbox mode、permission profiles、web search mode、managed hooks、用户可启用的 MCP servers，以及用户可添加、安装或刷新来源的 user-configured plugin marketplace sources）。在解析配置时（例如来自 `config.toml`、[profile files](/codex/config-advanced#profiles) 或 CLI config overrides），如果某个值与 enforced rule 冲突，Codex 会回退到兼容值并通知用户。如果配置了 `mcp_servers` allowlist，只有当 MCP server 的 name 和 identity 都匹配已批准条目时，Codex 才会启用该 MCP server；否则，Codex 会禁用它。

Requirements 也可以通过 `requirements.toml` 中的 `[features]` table 约束 [feature flags](/codex/config-basic/#feature-flags)。请注意，features 并不总是 security-sensitive，但 enterprises 可以按需 pin values。省略的 keys 保持不受约束。

对于 Codex 0.138.0 或更高版本，优先使用带有
`allowed_permission_profiles` 和 managed `default_permissions` 的 [permission profiles](/codex/permissions)。
仅对仍配置
`sandbox_mode` 的 legacy deployments 使用 `allowed_sandbox_modes`。

确切 key 列表见 [Configuration Reference 中的 `requirements.toml` 部分](/codex/config-reference#requirementstoml)。

#### 位置和优先级

Codex 按以下顺序检查 requirement sources。如果同一设置出现多次，
第一个值生效：

1. Cloud-managed requirements（ChatGPT Business 或 Enterprise）
2. macOS managed preferences (MDM)，通过 `com.openai.codex:requirements_toml_base64`
3. System `requirements.toml`（Unix 系统上为 `/etc/codex/requirements.toml`，包括 Linux/macOS；Windows 上为 `%ProgramData%\OpenAI\Codex\requirements.toml`）

Codex 从上到下检查这些来源。对于普通 settings 和 lists，
它使用找到的第一个值。后续来源仍可提供
早先来源未设置的 setting。

Tables 会逐条目合并。对于 `allowed_permission_profiles`，后续
source 可以添加早先 sources 未提及的 profile names。如果两个 sources
设置同一 profile name，早先 source 生效。

为向后兼容，Codex 也会将 legacy `managed_config.toml` fields `approval_policy` 和 `sandbox_mode` 解释为 requirements（只允许该单一值）。

#### Cloud-managed requirements

当你在 Business 或 Enterprise plan 上用 ChatGPT 登录时，Codex 也可以从 Codex service 获取 admin-enforced requirements。这是另一个 `requirements.toml`-compatible requirements 来源。它适用于所有 Codex surfaces，包括 CLI、App 和 IDE Extension。

#### 配置 cloud-managed requirements

前往 [Codex managed-config page](https://chatgpt.com/codex/settings/managed-configs)。

使用与 `requirements.toml` 相同的格式和 keys 创建新的 managed requirements file。

```toml
enforce_residency = "us"
allowed_approval_policies = ["on-request"]
allowed_sandbox_modes = ["read-only", "workspace-write"]

[rules]
prefix_rules = [
  { pattern = [{ any_of = ["bash", "sh", "zsh"] }], decision = "prompt", justification = "Require explicit approval for shell entrypoints" },
]
```

保存配置。保存后，更新后的 managed requirements 会立即应用于匹配用户。
更多示例见 [Example requirements.toml](#example-requirementstoml)。

#### 将 requirements 分配给 groups

Admins 可以为不同 user groups 配置不同 managed requirements，也可以设置 default fallback requirements policy。

如果用户匹配多个 group-specific rule，第一个匹配规则适用。Codex 不会从后续匹配 group rules 中填补 unset fields。

例如，如果第一个匹配 group rule 只设置 `allowed_sandbox_modes = ["read-only"]`，而后续匹配 group rule 设置 `allowed_approval_policies = ["on-request"]`，Codex 只应用第一个匹配 group rule，不会从后续规则填补 `allowed_approval_policies`。

#### Codex 如何在本地应用 cloud-managed requirements

当用户启动 Codex 并以 Business 或 Enterprise plan 上的 ChatGPT 登录时，Codex 会以 best-effort 方式应用 managed requirements。Codex 首先检查是否存在有效且未过期的本地 managed requirements cache entry，若可用则使用它。如果 cache 缺失、过期、损坏或与当前 auth identity 不匹配，Codex 会尝试从 service 获取 managed requirements（带 retries），并在成功时写入新的 signed cache entry。如果没有可用的有效 cached entry，且 fetch 失败或超时，Codex 会在没有 managed requirements layer 的情况下继续。

Cache resolution 完成后，Codex 会按照上面描述的正常 requirements layering 强制执行 managed requirements。

#### requirements.toml 示例

此示例会阻止 `--ask-for-approval never` 和 `--sandbox danger-full-access`（包括 `--yolo`）：

```toml
allowed_approval_policies = ["untrusted", "on-request"]
allowed_sandbox_modes = ["read-only", "workspace-write"]
```

#### 禁用 Appshots

要为 managed users 禁用 Appshots，请设置顶层 `allow_appshots` requirement：

```toml
allow_appshots = false
```

Codex 只有在 `allow_appshots = false` 时才将 Appshots 视为禁用。如果省略该 key，Appshots 不受 requirements 约束，并使用正常 product availability checks。通过 `configRequirements/read` 读取 effective requirements 的 app-server clients 会收到与 `allowAppshots` 相同的限制；省略或 `null` 的 `allowAppshots` 值不会禁用 Appshots。

#### 禁用 device remote control

要为 managed users 禁用 [device remote control](/codex/remote-connections#pick-up-work-from-another-device)，
请设置顶层 `allow_remote_control` requirement：

```toml
allow_remote_control = false
```

Codex 只有在 `allow_remote_control = false` 时才将 device remote
control 视为禁用。如果省略该 key，device remote control 不受
requirements 约束，并使用正常 product availability checks。此 requirement 不会
禁用 SSH remote connections。

#### 控制可用 permission profiles

使用 `allowed_permission_profiles` 控制用户可选择哪些 built-in 和 custom
[permission profiles](/codex/permissions)。这是
`allowed_sandbox_modes` 的 permission-profile 等价物；请选择与用户选择 permissions 方式匹配的 allowlist。

Permission-profile allowlists 需要 Codex 0.138.0 或更高版本。Codex 0.137.0 和
更早版本会忽略 `allowed_permission_profiles` 和 managed
`default_permissions`。

仅在每个 managed client 都运行
支持 release 后，才使用下面的 permission-profile 示例。在 fleet upgrade
完成前，不要部署 managed custom profiles。

当 table 存在时，它就是完整的 allowed profiles 列表。设置为
`true` 的 profiles 允许使用。省略或设置为 `false` 的 profiles 会
被拒绝，包括未来 Codex versions 中新增的 built-ins。

#### 允许标准 profiles

此 policy 允许 read-only 和 workspace access，但不允许 full access：

```toml
default_permissions = ":workspace"

[allowed_permission_profiles]
":read-only" = true
":workspace" = true
# ":danger-full-access" is omitted, so it is denied.
```

#### 添加 managed least-privilege default

Admins 可以在同一 requirements source 中定义 custom profile。使用
不会与 users
loaded config 中 names 冲突的 organization-specific profile names。Custom names 不能以 `:` 开头，也不能使用 reserved `filesystem`
name。

不要向运行 Codex 0.137.0 或
更早版本的 clients 部署 managed custom profiles。这些 clients 能识别 profile table，但不识别选择它的 managed default。

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

#### 仅允许 enterprise-defined profiles

当用户应只选择 admin-defined profiles 时，省略所有 built-ins：

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

Custom profile 可以 extend `:workspace`，即使用户不能直接选择
built-in `:workspace` profile。

#### 关闭另一个来源允许的 profile

Permission allowlists 按 profile name 组合。因为 Codex 先检查 cloud
requirements，再检查 system requirements，所以 cloud requirements 可以使用 `false`
关闭 system file 允许的 profile。

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

请将 `default_permissions` 显式设置为允许的 profile。如果省略，
只有当 `:workspace` 和 `:read-only` 都被
显式允许时，Codex 才默认使用 `:workspace`。当 `allowed_permission_profiles` 不存在时，managed
requirements 不限制用户可以选择哪些 profile names。每个条目
必须命名一个 built-in profile，或一个在已加载 config 或
requirements source 中定义的 custom profile。当 custom profiles 的
行为应集中控制时，请在 managed requirements 中定义它们。

#### 按 host 覆盖 sandbox requirements

当一个 managed policy 应在不同 hosts 上应用不同的
sandbox requirements 时，使用 `[[remote_sandbox_config]]`。例如，你可以为 laptops 保留更严格的
默认值，同时允许匹配的 dev boxes 或 CI
runners 进行 workspace writes。Host-specific entries 目前只覆盖 `allowed_sandbox_modes`：

```toml
allowed_sandbox_modes = ["read-only"]

[[remote_sandbox_config]]
hostname_patterns = ["*.devbox.example.com", "runner-??.ci.example.com"]
allowed_sandbox_modes = ["read-only", "workspace-write"]
```

Codex 会将每个 `hostname_patterns` 条目与 best-effort resolved
host name 进行比较。它会优先使用可用的 fully qualified domain name，
并回退到 local host name。匹配不区分大小写；`*` 匹配任意
字符序列，`?` 匹配一个字符。

同一 requirements source 内第一个匹配的 `[[remote_sandbox_config]]` 条目生效。如果没有匹配项，Codex 保留顶层
`allowed_sandbox_modes`。Host name matching 仅用于 policy selection；不要
将其视为 authenticated device proof。

你也可以约束 web search mode：

```toml
allowed_web_search_modes = ["cached"] # "disabled" remains implicitly allowed
```

`allowed_web_search_modes = []` 只允许 `"disabled"`。
例如，`allowed_web_search_modes = ["cached"]` 即使在 `danger-full-access` sessions 中也会阻止 live web search。

#### 配置 network access requirements

`[experimental_network]` 是实验性的，可能会变化。不要在未验证
用户运行的 Codex client versions 和 operating systems 的情况下，在 enterprise deployment 中广泛启用这些
requirements。Windows
支持仍然有限；除非已在你的环境中测试，否则避免将此 policy 应用于 Windows users。

当 administrators 应集中定义 network access requirements 时，在 `requirements.toml` 中使用 `[experimental_network]`。这些 requirements 独立于
用户的 `features.network_proxy` toggle：它们可以在没有该 feature flag 的情况下配置 sandbox
networking，但当 active sandbox 保持 networking 关闭时，它们不会授予 command network
access。

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

仅当你也定义 administrator-owned `allowed_domains` 且希望该 allowlist 为
exclusive 时，才使用 `experimental_network.managed_allowed_domains_only = true`。如果它在没有 managed allow rules 的情况下为 `true`，用户添加的 domain allow
rules 不会继续有效。

Domain syntax、local/private destination rules、deny-over-allow behavior
和 DNS rebinding limitations，与 [Agent approvals & security](/codex/agent-approvals-security#network-isolation) 中描述的 sandbox networking behavior 相同。

#### Pin feature flags

你也可以为接收 managed `requirements.toml` 的用户 pin [feature flags](/codex/config-basic/#feature-flags)：

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

使用 `config.toml` 的 `[features]` table 中的 canonical feature keys。Codex 会规范化 resulting feature set 以满足这些 pins，并拒绝对 `config.toml` 或 profile file feature settings 的冲突写入。

- `in_app_browser = false` 禁用 in-app browser pane。
- `browser_use = false` 禁用 Browser Use 和 Browser Agent availability。
- `browser_use_full_cdp_access = false` 防止用户在 Browser Developer mode 中启用 full CDP
  access。
- `computer_use = false` 禁用 Computer Use、Record & Replay 以及相关
  install 或 setup flows。

如果省略，这些 features 会由 policy 允许，具体仍受正常 client、
platform 和 rollout availability 约束。

#### 限制 locked computer use

要防止 [Computer Use](/codex/app/computer-use#locked-use) 在 managed Mac 锁定后继续运行，
请添加此 requirement：

```toml
[computer_use]
allow_locked_computer_use = false
```

此 requirement 不启用 Computer Use。它只阻止 macOS 上的
locked use。如果省略，locked use 不受 requirements 约束，并且
仍受正常 product availability 和用户本地设置约束。

#### 配置 automatic review policy

使用 `allowed_approvals_reviewers` 要求或允许 automatic review。将其设置
为 `["auto_review"]` 可要求 automatic review；当用户
可以选择 manual approval 时，包含 `"user"`。

设置 `guardian_policy_config` 可替换 automatic review policy 的
tenant-specific section。Codex 仍使用 built-in reviewer template 和
output contract。Managed `guardian_policy_config` 优先于本地
`[auto_review].policy`。

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

### Subagents

来源：[Subagents](/codex/concepts/subagents.md)

Codex 可以通过并行生成 specialized agents 来运行 subagent workflows，使它们能够并发探索、处理或分析工作。

本页说明核心概念和 tradeoffs。有关设置、agent configuration 和示例，请参见 [Subagents](/codex/subagents)。

#### 为什么 subagent workflows 有帮助

即使有较大的 context windows，模型也有局限。如果你用嘈杂的 intermediate output（例如 exploration notes、test logs、stack traces 和 command output）淹没主对话（即定义 requirements、constraints 和 decisions 的地方），session 会随着时间变得不那么可靠。

这通常被描述为：

- **Context pollution**：有用信息被埋在嘈杂的 intermediate output 中。
- **Context rot**：随着对话充满不太相关的细节，性能下降。

背景信息见 Chroma 关于 [context rot](https://research.trychroma.com/context-rot) 的文章。

Subagent workflows 通过将嘈杂工作移出主线程来提供帮助：

- 让 **main agent** 专注于 requirements、decisions 和 final outputs。
- 并行运行 specialized **subagents**，用于 exploration、tests 或 log analysis。
- 从 subagents 返回 **summaries**，而不是原始 intermediate output。

当工作可以独立并行运行时，它们也能节省时间，并且
通过将任务拆分成有边界的
小问题，让更大形状的任务更易处理。例如，Codex 可以将 multi-million-token
document 的分析拆成更小的问题，并向主
thread 返回提炼后的 takeaways。

作为起点，将 parallel agents 用于 read-heavy tasks，例如
exploration、tests、triage 和 summarization。对 parallel
write-heavy workflows 要更谨慎，因为 agents 同时编辑代码可能造成
conflicts，并增加 coordination overhead。

#### 核心术语

Codex 在 subagent workflows 中使用几个相关术语：

- **Subagent workflow**：Codex 运行 parallel agents 并组合其结果的工作流。
- **Subagent**：Codex 启动以处理特定任务的 delegated agent。
- **Agent thread**：agent 的 CLI thread，你可以通过 `/agent` 检查和切换。

#### 触发 subagent workflows

Codex 不会自动生成 subagents，并且只有当你
明确要求 subagents 或 parallel agent work 时才应使用 subagents。

实践中，手动触发意味着使用直接说明，例如
"spawn two agents,"、"delegate this work in parallel," 或 "use one agent per
point." 与可比的 single-agent runs 相比，Subagent workflows 会消耗更多 tokens，
因为每个 subagent 都会执行自己的 model 和 tool work。

好的 subagent prompt 应说明如何划分工作、Codex
是否应等待所有 agents 再继续，以及要返回什么 summary 或 output。

```text
Review this branch with parallel subagents. Spawn one subagent for security risks, one for test gaps, and one for maintainability. Wait for all three, then summarize the findings by category with file references.
```

#### 选择 models 和 reasoning

不同 agents 需要不同的 model 和 reasoning settings。

如果你没有固定 model 或 `model_reasoning_effort`，Codex 可以选择一个
在 intelligence、speed 和 price 之间平衡的设置。它可能偏向使用 `gpt-5.4-mini` 进行快速扫描，或使用 higher-effort `gpt-5.5` configuration 处理更高要求的推理。当你需要更精细控制时，请在 prompt 中引导该选择，或直接在 agent file 中设置 `model` 和 `model_reasoning_effort`。

对于 Codex 中的大多数任务，从
`gpt-5.5` 开始。需要为较轻的 subagent work 使用
更快、成本更低的选项时，使用
`gpt-5.4-mini`。如果你拥有 ChatGPT Pro
并希望进行近乎即时的 text-only iteration，`gpt-5.3-codex-spark` 仍在
research preview 中可用。

#### Model choice

- **`gpt-5.5`**：对高要求 agents 从这里开始。它最擅长需要 planning、tool use、validation 以及跨较大 context follow-through 的 ambiguous、multi-step work。
- **`gpt-5.4`**：当 workflow 固定到 GPT-5.4 时使用。它结合了强 coding、reasoning、tool use 和更广泛 workflows。
- **`gpt-5.4-mini`**：用于更重视 speed 和 efficiency 而非 depth 的 agents，例如 exploration、read-heavy scans、large-file review 或处理 supporting documents。它非常适合返回 distilled results 给 main agent 的 parallel workers。
- **`gpt-5.3-codex-spark`**：如果你有 ChatGPT Pro，当 latency 比更广泛能力更重要时，可使用这个 research preview model 进行近乎即时的 text-only iteration。

#### Reasoning effort (`model_reasoning_effort`)

- **`high`**：当 agent 需要追踪复杂逻辑、检查假设或处理 edge cases 时使用（例如 reviewer 或 security-focused agents）。
- **`medium`**：适合大多数 agents 的 balanced default。
- **`low`**：当任务直接且 speed 更重要时使用。

更高的 reasoning effort 会增加 response time 和 token usage，但它能改善复杂工作的质量。详情见 [Models](/codex/models)、[Config basics](/codex/config-basic) 和 [Configuration Reference](/codex/config-reference)。

### 构建插件

来源：[Build plugins](/codex/plugins/build.md)

本页面向 plugin authors。如果你想浏览、安装和使用
Codex 中的 plugins，请参见 [Plugins](/codex/plugins)。如果你仍在迭代
一个 repo 或一个 personal workflow，请从 local skill 开始。当你想在 teams 间共享该 workflow、捆绑 app integrations 或
MCP config、打包 lifecycle hooks，或发布 stable package 时，再构建 plugin。

#### 使用 `@plugin-creator` 创建插件

最快的设置方式是使用 built-in `@plugin-creator` skill。

它会 scaffold 所需的 `.codex-plugin/plugin.json` manifest，也可以
生成用于测试的 local marketplace entry。如果你已经有 plugin
folder，仍可使用 `@plugin-creator` 将其接入 local
marketplace。

#### 构建自己的 curated plugin list

Marketplace 是 plugins 的 JSON catalog。`@plugin-creator` 可以为
单个 plugin 生成一个 marketplace，你也可以持续向同一 marketplace
添加条目，为 repo、team 或 personal workflow 构建自己的 curated list。

在 Codex 中，每个 marketplace 会作为 plugin
directory 中的可选 source 出现。使用 `$REPO_ROOT/.agents/plugins/marketplace.json` 作为 repo-scoped
list，或使用 `~/.agents/plugins/marketplace.json` 作为 personal list。将每个 plugin 的一个
entry 添加到 `plugins[]` 下，让每个 `source.path` 指向 plugin
folder，路径需带 `./` 前缀且相对于 marketplace root，并将
`interface.displayName` 设置为你希望 Codex 在 marketplace
picker 中显示的标签。然后重启 Codex。之后，打开 plugin directory，选择你的
marketplace，并浏览或安装该 curated list 中的 plugins。

你不需要为每个 plugin 创建单独 marketplace。一个 marketplace 可以在
测试时暴露单个 plugin，然后随着你添加更多 plugins，
成长为更大的 curated catalog。

#### 从 CLI 添加 marketplace

当你希望 Codex 为你安装和跟踪
marketplace source，而不是手动编辑 `config.toml` 时，使用 `codex plugin marketplace add`。

```bash
codex plugin marketplace add owner/repo
codex plugin marketplace add owner/repo --ref main
codex plugin marketplace add https://github.com/example/plugins.git --sparse .agents/plugins
codex plugin marketplace add ./local-marketplace-root
```

Marketplace sources 可以是 GitHub shorthand（`owner/repo` 或
`owner/repo@ref`）、HTTP 或 HTTPS Git URLs、SSH Git URLs，或 local marketplace root
directories。使用 `--ref` 固定 Git ref，重复 `--sparse PATH` 可对 Git-backed marketplace repos 使用
sparse checkout。`--sparse` 仅对
Git marketplace sources 有效。

要检查、刷新或移除已配置 marketplaces：

```bash
codex plugin marketplace list
codex plugin marketplace upgrade
codex plugin marketplace upgrade marketplace-name
codex plugin marketplace remove marketplace-name
```

`codex plugin marketplace list` 会打印 Codex 正在考虑的每个 marketplace，
以及它解析到的 root path，包括 local default marketplaces 和
configured marketplace snapshots。

#### 手动创建插件

先从打包一个 skill 的 minimal plugin 开始。

1. 创建一个带有 `.codex-plugin/plugin.json` manifest 的 plugin folder。

```bash
mkdir -p my-first-plugin/.codex-plugin
```

`my-first-plugin/.codex-plugin/plugin.json`

```json
{
  "name": "my-first-plugin",
  "version": "1.0.0",
  "description": "Reusable greeting workflow",
  "skills": "./skills/"
}
```

使用 kebab-case 的稳定 plugin `name`。Codex 会将它用作 plugin
identifier 和 component namespace。

2. 在 `skills//SKILL.md` 下添加 skill。

```bash
mkdir -p my-first-plugin/skills/hello
```

`my-first-plugin/skills/hello/SKILL.md`

```md
---
name: hello
description: Greet the user with a friendly message.
---

Greet the user warmly and ask how you can help.
```

3. 将 plugin 添加到 marketplace。使用 `@plugin-creator` 生成一个，或
   按照 [Build your own curated plugin list](#build-your-own-curated-plugin-list)
   将 plugin 手动接入 Codex。

从这里开始，你可以按需添加 MCP config、app integrations 或 marketplace metadata。

#### 手动安装 local plugin

根据谁应能够访问 plugin 或 curated list，使用 repo marketplace 或 personal marketplace。

    在 `$REPO_ROOT/.agents/plugins/marketplace.json` 添加 marketplace file，
    并将 plugins 存放在 `$REPO_ROOT/plugins/` 下。

    **Repo marketplace 示例**

    Step 1：将 plugin folder 复制到 `$REPO_ROOT/plugins/my-plugin`。

```bash
mkdir -p ./plugins
cp -R /absolute/path/to/my-plugin ./plugins/my-plugin
```

    Step 2：添加或更新 `$REPO_ROOT/.agents/plugins/marketplace.json`，使
    `source.path` 指向该 plugin directory，路径需带 `./` 前缀且为
    relative path：

```json
{
  "name": "local-repo",
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "local",
        "path": "./plugins/my-plugin"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

    Step 3：重启 Codex，并验证 plugin 是否出现。

    在 `~/.agents/plugins/marketplace.json` 添加 marketplace file，并将
    plugins 存放在 `~/.codex/plugins/` 下。

    **Personal marketplace 示例**

    Step 1：将 plugin folder 复制到 `~/.codex/plugins/my-plugin`。

```bash
mkdir -p ~/.codex/plugins
cp -R /absolute/path/to/my-plugin ~/.codex/plugins/my-plugin
```

    Step 2：添加或更新 `~/.agents/plugins/marketplace.json`，使
    plugin entry 的 `source.path` 指向该 directory。

    Step 3：重启 Codex，并验证 plugin 是否出现。

Marketplace file 指向 plugin location，因此这些 directories 是
示例而非固定要求。Codex 会相对于 marketplace root 解析 `source.path`，而不是相对于 `.agents/plugins/` folder。文件格式见
[Marketplace metadata](#marketplace-metadata)。

更改 plugin 后，请更新你的 marketplace
entry 指向的 plugin directory，并重启 Codex，使 local install 获取新文件。

#### 与你的 workspace 分享 local plugin

创建 plugin 并将其添加到 Codex 后，你可以从 Codex app 将它分享给其他
ChatGPT workspace 成员。

1. 在 Codex app 中打开 **Plugins**。
2. 前往 **Created by you**，并打开 plugin details page。
3. 选择 **Share**。
4. 添加 workspace members 或 workspace groups，或复制 share link。
5. 选择谁有 access，然后发送 invitation 或 link。

你分享给的人可以在 plugin directory 的 **Shared with you** 下找到该
plugin。与 workspace 分享 local plugin 不会将其发布到 public Plugin Directory。Shared plugins 会保留在你的 workspace
和 organization boundary 内；未登录该 workspace 的 accounts
无法访问它们。当 team 或 role 应共享同一 plugin
access 时，使用 groups。当你想要 repo 或 CLI distribution 时，使用 marketplace；当你希望选定 teammates 从
Codex app 安装 plugin 时，使用
workspace sharing。

Workspace admins 可以通过在 cloud-managed requirements 中向
`requirements.toml` 添加 `features.plugin_sharing = false` 来禁用 plugin sharing：

```toml
features.plugin_sharing = false
```
