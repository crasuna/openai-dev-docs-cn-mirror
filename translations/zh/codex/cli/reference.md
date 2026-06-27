---
status: needs-review
sourceId: "c2609972184d"
sourceChecksum: "c2609972184de40132036b462d1f4384760780454a041bfbbf67601528610bb9"
sourceUrl: "https://developers.openai.com/codex/cli/reference"
translatedAt: "2026-06-27T19:07:21.7838419+08:00"
translator: codex-gpt-5.5-xhigh
---

# 命令行选项

export const globalFlagOptions = [
  {
    key: "PROMPT",
    type: "string",
    description:
      "用于启动 session 的可选文本指令。省略时会启动 TUI，且不预填消息。",
  },
  {
    key: "--image, -i",
    type: "path[,path...]",
    description:
      "把一个或多个图像文件附加到初始提示词。多个路径可用逗号分隔，也可以重复使用该 flag。",
  },
  {
    key: "--model, -m",
    type: "string",
    description:
      "覆盖配置中设置的模型（例如 `gpt-5.4`）。",
  },
  {
    key: "--oss",
    type: "boolean",
    defaultValue: "false",
    description:
      '使用本地开源模型提供商（等价于 `-c model_provider="oss"`）。会验证 Ollama 是否正在运行。',
  },
  {
    key: "--profile, -p",
    type: "string",
    description:
      "把 `$CODEX_HOME/profile-name.config.toml` 叠加到基础用户配置之上。",
  },
  {
    key: "--sandbox, -s",
    type: "read-only | workspace-write | danger-full-access",
    description:
      "为模型生成的 shell commands 选择 sandbox policy。",
  },
  {
    key: "--ask-for-approval, -a",
    type: "untrusted | on-request | never",
    description:
      "控制 Codex 在运行命令前何时暂停等待人工批准。`on-failure` 已弃用；交互式运行请优先使用 `on-request`，非交互式运行请优先使用 `never`。",
  },
  {
    key: "--dangerously-bypass-approvals-and-sandbox, --yolo",
    type: "boolean",
    defaultValue: "false",
    description:
      "在没有 approvals 或 sandboxing 的情况下运行每个命令。只应在外部已加固的环境中使用。",
  },
  {
    key: "--dangerously-bypass-hook-trust",
    type: "boolean",
    defaultValue: "false",
    description:
      "在本次调用中运行已启用的 hooks，而不要求持久化的 hook trust。仅适用于已经审查 hook 来源的自动化。",
  },
  {
    key: "--cd, -C",
    type: "path",
    description:
      "在 agent 开始处理你的请求之前设置其工作目录。",
  },
  {
    key: "--search",
    type: "boolean",
    defaultValue: "false",
    description:
      '启用 live web search（把 `web_search` 设置为 `"live"`，而不是默认的 `"cached"`）。',
  },
  {
    key: "--add-dir",
    type: "path",
    description:
      "除了主 workspace 之外，授予额外目录写入权限。可重复使用以提供多个路径。",
  },
  {
    key: "--no-alt-screen",
    type: "boolean",
    defaultValue: "false",
    description:
      "禁用 TUI 的 alternate screen mode（覆盖本次运行的 `tui.alternate_screen`）。",
  },
  {
    key: "--remote",
    type: "ws://host:port | wss://host:port | unix:// | unix://PATH",
    description:
      "通过 WebSocket 或 Unix socket 连接到远程 app-server endpoint。支持 `codex`、`codex resume`、`codex fork`、`codex archive`、`codex delete` 和 `codex unarchive`；其他子命令会拒绝 remote mode。",
  },
  {
    key: "--remote-auth-token-env",
    type: "ENV_VAR",
    description:
      "从该环境变量读取 bearer token，并在使用 `--remote` 连接时发送。需要 `--remote`；token 只会通过 `wss://` URL 或仅本地 `ws://` URL 发送。",
  },
  {
    key: "--strict-config",
    type: "boolean",
    defaultValue: "false",
    description:
      "当 `config.toml` 包含此 Codex 版本无法识别的字段时报错。受 `codex`、`exec`、`review`、`resume`、`fork`、`app-server`、`mcp-server` 和 `exec-server` 等运行时命令支持。",
  },
  {
    key: "--enable",
    type: "feature",
    description:
      "强制启用某个 feature flag（会转换为 `-c features.<name>=true`）。可重复使用。",
  },
  {
    key: "--disable",
    type: "feature",
    description:
      "强制禁用某个 feature flag（会转换为 `-c features.<name>=false`）。可重复使用。",
  },
  {
    key: "--config, -c",
    type: "key=value",
    description:
      "覆盖配置值。值会尽可能按 TOML 解析；否则使用字面字符串。",
  },
];

export const commandOverview = [
  {
    key: "codex",
    href: "/codex/cli/reference#codex-interactive",
    type: "stable",
    description:
      "启动 terminal UI。接受上面的 global flags，以及可选提示词或图像附件。",
  },
  {
    key: "codex app-server",
    href: "/codex/cli/reference#codex-app-server",
    type: "experimental",
    description:
      "通过 stdio、WebSocket 或 Unix socket 启动 Codex app server，用于本地开发或调试。",
  },
  {
    key: "codex remote-control",
    href: "/codex/cli/reference#codex-remote-control",
    type: "experimental",
    description:
      "确保本地 app-server daemon 正在运行，并已启用 remote-control 支持。",
  },
  {
    key: "codex app",
    href: "/codex/cli/reference#codex-app",
    type: "stable",
    description:
      "在 macOS 或 Windows 上启动 Codex desktop app。在 macOS 上，Codex 可以打开 workspace path；在 Windows 上，Codex 会打印要打开的路径。",
  },
  {
    key: "codex debug app-server send-message-v2",
    href: "/codex/cli/reference#codex-debug-app-server-send-message-v2",
    type: "experimental",
    description:
      "通过内置 test client 发送一条 V2 消息，以调试 app-server。",
  },
  {
    key: "codex debug models",
    href: "/codex/cli/reference#codex-debug-models",
    type: "experimental",
    description:
      "打印 Codex 看到的原始 model catalog，包括只检查 bundled catalog 的选项。",
  },
  {
    key: "codex apply",
    href: "/codex/cli/reference#codex-apply",
    type: "stable",
    description:
      "把 Codex Cloud task 生成的最新 diff 应用到你的本地 working tree。别名：`codex a`。",
  },
  {
    key: "codex archive",
    href: "/codex/cli/reference#codex-archive-and-codex-unarchive",
    type: "stable",
    description:
      "按 session ID 或 session name 归档已保存的交互式 session。",
  },
  {
    key: "codex delete",
    href: "/codex/cli/reference#codex-delete",
    type: "stable",
    description:
      "按 session ID 或 session name 永久删除已保存的交互式 session。",
  },
  {
    key: "codex cloud",
    href: "/codex/cli/reference#codex-cloud",
    type: "experimental",
    description:
      "不离开 TUI，即可从终端浏览或执行 Codex Cloud tasks。别名：`codex cloud-tasks`。",
  },
  {
    key: "codex completion",
    href: "/codex/cli/reference#codex-completion",
    type: "stable",
    description:
      "为 Bash、Zsh、Fish 或 PowerShell 生成 shell completion scripts。",
  },
  {
    key: "codex doctor",
    href: "/codex/cli/reference#codex-doctor",
    type: "stable",
    description:
      "为本地安装、配置、认证、运行时、Git、终端、app-server 和 thread inventory 问题生成诊断报告。",
  },
  {
    key: "codex features",
    href: "/codex/cli/reference#codex-features",
    type: "stable",
    description:
      "列出 feature flags，并在 `config.toml` 中持久启用或禁用它们。",
  },
  {
    key: "codex exec",
    href: "/codex/cli/reference#codex-exec",
    type: "stable",
    description:
      "以非交互方式运行 Codex。别名：`codex e`。把结果流式输出到 stdout 或 JSONL，并可选择恢复之前的 session。",
  },
  {
    key: "codex execpolicy",
    href: "/codex/cli/reference#codex-execpolicy",
    type: "experimental",
    description:
      "评估 execpolicy rule files，并查看某个命令会被允许、提示确认还是阻止。",
  },
  {
    key: "codex login",
    href: "/codex/cli/reference#codex-login",
    type: "stable",
    description:
      "使用 ChatGPT OAuth、device auth、API key 或通过 stdin 管道传入的 access token 认证 Codex。",
  },
  {
    key: "codex logout",
    href: "/codex/cli/reference#codex-logout",
    type: "stable",
    description: "移除已存储的认证凭据。",
  },
  {
    key: "codex mcp",
    href: "/codex/cli/reference#codex-mcp",
    type: "experimental",
    description:
      "管理 Model Context Protocol servers（list、add、remove、authenticate）。",
  },
  {
    key: "codex plugin marketplace",
    href: "/codex/cli/reference#codex-plugin-marketplace",
    type: "experimental",
    description:
      "从 Git 或本地源添加、列出、升级或移除 plugin marketplaces。",
  },
  {
    key: "codex plugin",
    href: "/codex/cli/reference#codex-plugin",
    type: "experimental",
    description:
      "从已配置的 marketplace sources 安装、列出和移除 plugins。",
  },
  {
    key: "codex mcp-server",
    href: "/codex/cli/reference#codex-mcp-server",
    type: "experimental",
    description:
      "通过 stdio 把 Codex 自身作为 MCP server 运行。适用于另一个 agent 消费 Codex 的场景。",
  },
  {
    key: "codex resume",
    href: "/codex/cli/reference#codex-resume",
    type: "stable",
    description:
      "按 ID 继续之前的交互式 session，或恢复最近的对话。",
  },
  {
    key: "codex fork",
    href: "/codex/cli/reference#codex-fork",
    type: "stable",
    description:
      "把之前的交互式 session fork 成一个新 thread，同时保留原始 transcript。",
  },
  {
    key: "codex sandbox",
    href: "/codex/cli/reference#codex-sandbox",
    type: "experimental",
    description:
      "在 Codex 提供的 macOS、Linux 或 Windows sandboxes 中运行任意命令。",
  },
  {
    key: "codex update",
    href: "/codex/cli/reference#codex-update",
    type: "stable",
    description:
      "当已安装版本支持自更新时，检查并应用 Codex CLI 更新。",
  },
  {
    key: "codex unarchive",
    href: "/codex/cli/reference#codex-archive-and-codex-unarchive",
    type: "stable",
    description:
      "按 session ID 或 session name 恢复已归档的交互式 session。",
  },
];

export const execOptions = [
  {
    key: "PROMPT",
    type: "string | - (read stdin)",
    description:
      "任务的初始指令。使用 `-` 可从 stdin 管道传入提示词。",
  },
  {
    key: "--image, -i",
    type: "path[,path...]",
    description:
      "把图像附加到第一条消息。可重复使用；支持逗号分隔列表。",
  },
  {
    key: "--model, -m",
    type: "string",
    description: "覆盖本次运行配置的模型。",
  },
  {
    key: "--oss",
    type: "boolean",
    defaultValue: "false",
    description:
      "使用本地开源提供商（需要正在运行的 Ollama instance）。",
  },
  {
    key: "--sandbox, -s",
    type: "read-only | workspace-write | danger-full-access",
    description:
      "模型生成命令的 sandbox policy。默认使用配置值。",
  },
  {
    key: "--profile, -p",
    type: "string",
    description:
      "把 `$CODEX_HOME/profile-name.config.toml` 叠加到基础用户配置之上。",
  },
  {
    key: "--full-auto",
    type: "boolean",
    defaultValue: "false",
    description:
      "已弃用的兼容 flag。请优先使用 `--sandbox workspace-write`；使用此 flag 时 Codex 会打印警告。",
  },
  {
    key: "--dangerously-bypass-approvals-and-sandbox, --yolo",
    type: "boolean",
    defaultValue: "false",
    description:
      "绕过 approval prompts 和 sandboxing。危险：只应在隔离 runner 内使用。",
  },
  {
    key: "--dangerously-bypass-hook-trust",
    type: "boolean",
    defaultValue: "false",
    description:
      "在本次调用中运行已启用的 hooks，而不要求持久化的 hook trust。仅适用于已经审查 hook 来源的自动化。",
  },
  {
    key: "--cd, -C",
    type: "path",
    description: "在执行任务前设置 workspace root。",
  },
  {
    key: "--skip-git-repo-check",
    type: "boolean",
    defaultValue: "false",
    description:
      "允许在 Git 仓库外运行（适用于一次性目录）。",
  },
  {
    key: "--ephemeral",
    type: "boolean",
    defaultValue: "false",
    description: "运行时不把 session rollout files 持久化到磁盘。",
  },
  {
    key: "--ignore-user-config",
    type: "boolean",
    defaultValue: "false",
    description:
      "不加载 `$CODEX_HOME/config.toml`。认证仍使用 `CODEX_HOME`。",
  },
  {
    key: "--ignore-rules",
    type: "boolean",
    defaultValue: "false",
    description:
      "本次运行不加载用户或项目的 execpolicy `.rules` 文件。",
  },
  {
    key: "--output-schema",
    type: "path",
    description:
      "描述预期最终响应形状的 JSON Schema 文件。Codex 会根据它验证工具输出。",
  },
  {
    key: "--color",
    type: "always | never | auto",
    defaultValue: "auto",
    description: "控制 stdout 中的 ANSI color。",
  },
  {
    key: "--json, --experimental-json",
    type: "boolean",
    defaultValue: "false",
    description:
      "打印 newline-delimited JSON events，而不是格式化文本。",
  },
  {
    key: "--output-last-message, -o",
    type: "path",
    description:
      "把 assistant 的最终消息写入文件。适用于下游脚本。",
  },
  {
    key: "Resume subcommand",
    type: "codex exec resume [SESSION_ID]",
    description:
      "按 ID 恢复 exec session，或添加 `--last` 继续当前工作目录中最近的 session。添加 `--all` 可考虑来自任意目录的 session。接受可选的后续提示词。",
  },
  {
    key: "-c, --config",
    type: "key=value",
    description:
      "非交互式运行的内联配置覆盖（可重复使用）。",
  },
];

export const appServerOptions = [
  {
    key: "--stdio",
    type: "boolean",
    defaultValue: "false",
    description:
      "使用 stdio transport。等价于 `--listen stdio://`，并且与 `--listen` 互斥。",
  },
  {
    key: "--listen",
    type: "stdio:// | ws://IP:PORT | unix:// | unix://PATH | off",
    defaultValue: "stdio://",
    description:
      "Transport listener URL。使用 `stdio://` 表示 JSONL，`ws://IP:PORT` 表示 TCP WebSocket endpoint，`unix://` 表示默认 Unix socket，`unix://PATH` 表示自定义 Unix socket，或使用 `off` 禁用本地 transport。",
  },
  {
    key: "--ws-auth",
    type: "capability-token | signed-bearer-token",
    description:
      "app-server WebSocket clients 的 authentication mode。省略时 WebSocket auth 被禁用；非本地 listeners 会在启动时警告。",
  },
  {
    key: "--ws-token-file",
    type: "absolute path",
    description:
      "包含共享 capability token 的文件。与 `--ws-auth capability-token` 一起使用，除非你改为提供 `--ws-token-sha256`。",
  },
  {
    key: "--ws-token-sha256",
    type: "hexadecimal SHA-256 digest",
    description:
      "用于 capability-token authentication 的预期 SHA-256 digest。当客户端 token 来自其他来源时，用它替代 `--ws-token-file`。",
  },
  {
    key: "--ws-shared-secret-file",
    type: "absolute path",
    description:
      "包含 HMAC shared secret 的文件，用于验证 signed JWT bearer tokens。与 `--ws-auth signed-bearer-token` 一起使用时必需。",
  },
  {
    key: "--ws-issuer",
    type: "string",
    description:
      "signed bearer tokens 的预期 `iss` claim。需要 `--ws-auth signed-bearer-token`。",
  },
  {
    key: "--ws-audience",
    type: "string",
    description:
      "signed bearer tokens 的预期 `aud` claim。需要 `--ws-auth signed-bearer-token`。",
  },
  {
    key: "--ws-max-clock-skew-seconds",
    type: "number",
    defaultValue: "30",
    description:
      "验证 signed bearer token 的 `exp` 和 `nbf` claims 时允许的 clock skew。需要 `--ws-auth signed-bearer-token`。",
  },
  {
    key: "--analytics-default-enabled",
    type: "boolean",
    defaultValue: "false",
    description:
      "除非用户在 config 中选择退出，否则默认为第一方 app-server clients 启用 analytics。",
  },
];

export const appOptions = [
  {
    key: "PATH",
    type: "path",
    defaultValue: ".",
    description:
      "Codex Desktop 的 workspace path。在 macOS 上，Codex 会打开此路径；在 Windows 上，Codex 会打印该路径。",
  },
  {
    key: "--download-url",
    type: "url",
    description:
      "Codex desktop installer URL 的高级覆盖，用于安装期间。",
  },
];

export const debugAppServerSendMessageV2Options = [
  {
    key: "USER_MESSAGE",
    type: "string",
    description:
      "通过内置 V2 test-client flow 发送到 app-server 的消息文本。",
  },
];

export const debugModelsOptions = [
  {
    key: "--bundled",
    type: "boolean",
    defaultValue: "false",
    description:
      "跳过刷新，只打印当前 Codex binary bundled 的 model catalog。",
  },
];

export const doctorOptions = [
  {
    key: "--json",
    type: "boolean",
    defaultValue: "false",
    description: "输出经脱敏的机器可读 support report。",
  },
  {
    key: "--summary",
    type: "boolean",
    defaultValue: "false",
    description: "只显示分组 check rows 和最终计数摘要。",
  },
  {
    key: "--all",
    type: "boolean",
    defaultValue: "false",
    description: "展开详细 human-readable report 中的长列表。",
  },
  {
    key: "--no-color",
    type: "boolean",
    defaultValue: "false",
    description: "在 human-readable output 中禁用 ANSI color。",
  },
  {
    key: "--ascii",
    type: "boolean",
    defaultValue: "false",
    description:
      "在 human-readable output 中使用 ASCII status labels 和 separators。",
  },
];

export const resumeOptions = [
  {
    key: "SESSION_ID",
    type: "uuid",
    description:
      "恢复指定 session。省略并使用 `--last` 可继续最近的 session。",
  },
  {
    key: "--last",
    type: "boolean",
    defaultValue: "false",
    description:
      "跳过选择器，恢复当前工作目录中最近的对话。",
  },
  {
    key: "--all",
    type: "boolean",
    defaultValue: "false",
    description:
      "选择最近 session 时包括当前工作目录之外的 session。",
  },
];

export const featuresOptions = [
  {
    key: "List subcommand",
    type: "codex features list",
    description:
      "显示已知 feature flags、它们的 maturity stage 和 effective state。",
  },
  {
    key: "Enable subcommand",
    type: "codex features enable <feature>",
    description:
      "在 `$CODEX_HOME/config.toml` 中持久启用某个 feature flag。",
  },
  {
    key: "Disable subcommand",
    type: "codex features disable <feature>",
    description:
      "在 `$CODEX_HOME/config.toml` 中持久禁用某个 feature flag。",
  },
];

export const execResumeOptions = [
  {
    key: "SESSION_ID",
    type: "uuid",
    description:
      "恢复指定 session。省略并使用 `--last` 可继续最近的 session。",
  },
  {
    key: "--last",
    type: "boolean",
    defaultValue: "false",
    description:
      "恢复当前工作目录中最近的对话。",
  },
  {
    key: "--all",
    type: "boolean",
    defaultValue: "false",
    description:
      "选择最近 session 时包括当前工作目录之外的 session。",
  },
  {
    key: "--image, -i",
    type: "path[,path...]",
    description:
      "把一个或多个图像附加到后续提示词。多个路径可用逗号分隔，也可以重复使用该 flag。",
  },
  {
    key: "PROMPT",
    type: "string | - (read stdin)",
    description:
      "恢复后立即发送的可选后续指令。",
  },
];

export const forkOptions = [
  {
    key: "SESSION_ID",
    type: "uuid",
    description:
      "Fork 指定 session。省略并使用 `--last` 可 fork 最近的 session。",
  },
  {
    key: "--last",
    type: "boolean",
    defaultValue: "false",
    description:
      "跳过选择器，并自动 fork 最近的对话。",
  },
  {
    key: "--all",
    type: "boolean",
    defaultValue: "false",
    description:
      "在选择器中显示当前工作目录之外的 session。",
  },
];

export const execpolicyOptions = [
  {
    key: "--rules, -r",
    type: "path (repeatable)",
    description:
      "要评估的 execpolicy rule file 路径。提供多个 flag 可组合跨文件规则。",
  },
  {
    key: "--pretty",
    type: "boolean",
    defaultValue: "false",
    description: "美化打印 JSON result。",
  },
  {
    key: "COMMAND...",
    type: "var-args",
    description: "要根据指定 policies 检查的命令。",
  },
];

export const loginOptions = [
  {
    key: "--with-api-key",
    type: "boolean",
    description:
      "从 stdin 读取 API key（例如 `printenv OPENAI_API_KEY | codex login --with-api-key`）。",
  },
  {
    key: "--with-access-token",
    type: "boolean",
    description:
      "从 stdin 读取 access token（例如 `printenv CODEX_ACCESS_TOKEN | codex login --with-access-token`）。",
  },
  {
    key: "--device-auth",
    type: "boolean",
    description:
      "使用 OAuth device code flow，而不是启动浏览器窗口。",
  },
  {
    key: "status subcommand",
    type: "codex login status",
    description:
      "打印当前 authentication mode，并在已登录时以 0 退出。",
  },
];

export const applyOptions = [
  {
    key: "TASK_ID",
    type: "string",
    description:
      "要应用其 diff 的 Codex Cloud task identifier。",
  },
];

export const sandboxMacOptions = [
  {
    key: "--profile, -p",
    type: "NAME",
    description:
      "把 `$CODEX_HOME/NAME.config.toml` 叠加到基础用户配置之上。",
  },
  {
    key: "--permissions-profile, -P",
    type: "NAME",
    description:
      "应用 active configuration stack 中的命名 permissions profile。",
  },
  {
    key: "--cd, -C",
    type: "DIR",
    description:
      "用于 profile resolution 和命令执行的工作目录。需要 `--permissions-profile`。",
  },
  {
    key: "--include-managed-config",
    type: "boolean",
    defaultValue: "false",
    description:
      "解析显式 permissions profile 时包含 managed requirements。需要 `--permissions-profile`。",
  },
  {
    key: "--allow-unix-socket",
    type: "path",
    description:
      "允许 sandboxed command 绑定或连接以此路径为根的 Unix sockets。可重复使用以允许多个路径。",
  },
  {
    key: "--log-denials",
    type: "boolean",
    defaultValue: "false",
    description:
      "命令运行时用 `log stream` 捕获 macOS sandbox denials，并在退出后打印。",
  },
  {
    key: "--config, -c",
    type: "key=value",
    description:
      "向 sandboxed run 传入配置覆盖（可重复使用）。",
  },
  {
    key: "COMMAND...",
    type: "var-args",
    description:
      "要在 macOS Seatbelt 下执行的 shell command。`--` 后的所有内容都会转发。",
  },
];

export const sandboxLinuxOptions = [
  {
    key: "--profile, -p",
    type: "NAME",
    description:
      "把 `$CODEX_HOME/NAME.config.toml` 叠加到基础用户配置之上。",
  },
  {
    key: "--permissions-profile, -P",
    type: "NAME",
    description:
      "应用 active configuration stack 中的命名 permissions profile。",
  },
  {
    key: "--cd, -C",
    type: "DIR",
    description:
      "用于 profile resolution 和命令执行的工作目录。需要 `--permissions-profile`。",
  },
  {
    key: "--include-managed-config",
    type: "boolean",
    defaultValue: "false",
    description:
      "解析显式 permissions profile 时包含 managed requirements。需要 `--permissions-profile`。",
  },
  {
    key: "--config, -c",
    type: "key=value",
    description:
      "启动 sandbox 前应用的配置覆盖（可重复使用）。",
  },
  {
    key: "COMMAND...",
    type: "var-args",
    description:
      "要在 Landlock + seccomp 下执行的命令。请在 `--` 后提供 executable。",
  },
];

export const sandboxWindowsOptions = [
  {
    key: "--profile, -p",
    type: "NAME",
    description:
      "把 `$CODEX_HOME/NAME.config.toml` 叠加到基础用户配置之上。",
  },
  {
    key: "--permissions-profile, -P",
    type: "NAME",
    description:
      "应用 active configuration stack 中的命名 permissions profile。",
  },
  {
    key: "--cd, -C",
    type: "DIR",
    description:
      "用于 profile resolution 和命令执行的工作目录。需要 `--permissions-profile`。",
  },
  {
    key: "--include-managed-config",
    type: "boolean",
    defaultValue: "false",
    description:
      "解析显式 permissions profile 时包含 managed requirements。需要 `--permissions-profile`。",
  },
  {
    key: "--config, -c",
    type: "key=value",
    description:
      "启动 sandbox 前应用的配置覆盖（可重复使用）。",
  },
  {
    key: "COMMAND...",
    type: "var-args",
    description:
      "要在原生 Windows sandbox 下执行的命令。请在 `--` 后提供 executable。",
  },
];

export const completionOptions = [
  {
    key: "SHELL",
    type: "bash | zsh | fish | power-shell | elvish",
    defaultValue: "bash",
    description: "要为其生成 completions 的 shell。输出会打印到 stdout。",
  },
];

export const cloudExecOptions = [
  {
    key: "QUERY",
    type: "string",
    description:
      "任务提示词。省略时，Codex 会以交互方式提示输入详情。",
  },
  {
    key: "--env",
    type: "ENV_ID",
    description:
      "目标 Codex Cloud environment identifier（必需）。使用 `codex cloud` 列出选项。",
  },
  {
    key: "--attempts",
    type: "1-4",
    defaultValue: "1",
    description:
      "Codex Cloud 应运行的 assistant attempts 数量（best-of-N）。",
  },
];

export const cloudListOptions = [
  {
    key: "--env",
    type: "ENV_ID",
    description: "按 environment identifier 过滤 tasks。",
  },
  {
    key: "--limit",
    type: "1-20",
    defaultValue: "20",
    description: "要返回的最大 task 数。",
  },
  {
    key: "--cursor",
    type: "string",
    description: "上一次请求返回的 pagination cursor。",
  },
  {
    key: "--json",
    type: "boolean",
    defaultValue: "false",
    description: "输出 machine-readable JSON，而不是 plain text。",
  },
];

export const mcpCommands = [
  {
    key: "list",
    type: "--json",
    description:
      "列出已配置的 MCP servers。添加 `--json` 可获得 machine-readable output。",
  },
  {
    key: "get <name>",
    type: "--json",
    description:
      "显示特定 server configuration。`--json` 会打印原始 config entry。",
  },
  {
    key: "add <name>",
    type: "-- <command...> | --url <value>",
    description:
      "使用 stdio launcher command 或 streamable HTTP URL 注册 server。stdio transports 支持 `--env KEY=VALUE`。",
  },
  {
    key: "remove <name>",
    description: "删除已存储的 MCP server definition。",
  },
  {
    key: "login <name>",
    type: "--scopes scope1,scope2",
    description:
      "为 streamable HTTP server 启动 OAuth login（仅限支持 OAuth 的 servers）。",
  },
  {
    key: "logout <name>",
    description:
      "移除 streamable HTTP server 的已存储 OAuth credentials。",
  },
];

export const mcpAddOptions = [
  {
    key: "COMMAND...",
    type: "stdio transport",
    description:
      "用于启动 MCP server 的 executable 和参数。请在 `--` 后提供。",
  },
  {
    key: "--env KEY=VALUE",
    type: "repeatable",
    description:
      "启动 stdio server 时应用的环境变量赋值。",
  },
  {
    key: "--url",
    type: "https://…",
    description:
      "注册 streamable HTTP server，而不是 stdio。与 `COMMAND...` 互斥。",
  },
  {
    key: "--bearer-token-env-var",
    type: "ENV_VAR",
    description:
      "连接 streamable HTTP server 时，会将此环境变量的值作为 bearer token 发送。",
  },
  {
    key: "--oauth-client-id",
    type: "CLIENT_ID",
    description:
      "streamable HTTP MCP server 的 OAuth client identifier。需要 `--url`。",
  },
  {
    key: "--oauth-resource",
    type: "RESOURCE",
    description:
      "登录 streamable HTTP MCP server 时要包含的 OAuth resource parameter。需要 `--url`。",
  },
];

export const marketplaceCommands = [
  {
    key: "add <source>",
    type: "[--ref REF] [--sparse PATH] [--json]",
    description:
      "从 GitHub shorthand、Git URL、SSH URL 或本地 marketplace root directory 安装 plugin marketplace。`--sparse` 仅支持 Git sources，并且可重复使用。",
  },
  {
    key: "list",
    type: "[--json]",
    description:
      "显示 Codex 当前正在考虑的 plugin marketplaces，以及每个 marketplace 的 root path。",
  },
  {
    key: "upgrade [marketplace-name]",
    type: "[--json]",
    description:
      "刷新一个已配置的 Git marketplace；省略名称时刷新所有已配置 Git marketplaces。",
  },
  {
    key: "remove <marketplace-name>",
    type: "[--json]",
    description: "移除已配置的 plugin marketplace。",
  },
];

export const pluginCommands = [
  {
    key: "add <plugin[@marketplace]>",
    type: "[--marketplace, -m NAME] [--json]",
    description:
      "从已配置 marketplace 安装 plugin。当 plugin 参数省略 `@marketplace` 时，使用 `--marketplace` 或 `-m`。",
  },
  {
    key: "list",
    type: "[--marketplace, -m NAME] [--available --json] [--json]",
    description:
      "列出已安装 plugins。使用 `--json` 时，输出包含 `installed` 和 `available` arrays；`--available` 会包含未安装的 marketplace plugins，并要求使用 `--json`。",
  },
  {
    key: "remove <plugin[@marketplace]>",
    type: "[--marketplace, -m NAME] [--json]",
    description:
      "从本地 config 和 cache 中移除已安装 plugin。使用 `--json` 可获得 automation-friendly output。",
  },
  {
    key: "marketplace",
    description:
      "管理已配置的 marketplace sources。参见下方的 `codex plugin marketplace`。",
  },
];

export const archiveOptions = [
  {
    key: "SESSION",
    type: "session ID | session name",
    description:
      "要归档或恢复的已保存 session。Session IDs 优先于 session names。",
  },
  {
    key: "--remote",
    type: "ws://host:port | wss://host:port | unix:// | unix://PATH",
    description:
      "更改 archive state 之前连接到远程 app-server endpoint。",
  },
  {
    key: "--remote-auth-token-env",
    type: "ENV_VAR",
    description:
      "当 `--remote` 需要认证时，从该环境变量读取 bearer token。",
  },
];

export const deleteOptions = [
  {
    key: "SESSION",
    type: "session ID | session name",
    description:
      "要删除的已保存 session。Session IDs 优先于 session names。",
  },
  {
    key: "--force",
    type: "boolean",
    defaultValue: "false",
    description:
      "不提示直接删除。session 参数必须是 UUID；名称仍需要交互式确认。",
  },
  {
    key: "--remote",
    type: "ws://host:port | wss://host:port | unix:// | unix://PATH",
    description:
      "删除 session 前连接到远程 app-server endpoint。",
  },
  {
    key: "--remote-auth-token-env",
    type: "ENV_VAR",
    description:
      "当 `--remote` 需要认证时，从该环境变量读取 bearer token。",
  },
];

## 如何阅读此参考

本页列出了每个已记录的 Codex CLI command 和 flag。使用交互式表格按 key 或 description 搜索。每个 section 都会说明该选项是 stable 还是 experimental，并指出有风险的组合。

CLI 会从 <code>~/.codex/config.toml</code> 继承大多数默认值。你在命令行传入的任何
  <code>-c key=value</code> 覆盖都会在本次调用中优先生效。更多信息参见 [Config
  basics](https://developers.openai.com/codex/config-basic#configuration-precedence)。

## Global flags

<ConfigTable client:load options={globalFlagOptions} />

这些选项适用于基础 `codex` 命令。大多数选项会传播到其他命令；例外情况请参见上面的说明或相关命令 help。对于会传播的 flags，请遵循相关命令 help。例如，`codex exec --oss ...` 会把 `--oss` 应用于 `exec`。

## 命令概览

Maturity 列使用 Experimental、Beta 和 Stable 等 feature maturity labels。请参阅 [Feature Maturity](https://developers.openai.com/codex/feature-maturity)，了解如何解释这些标签。

<ConfigTable
  client:load
  options={commandOverview}
  secondColumnTitle="成熟度"
  secondColumnVariant="maturity"
/>

## 命令详情

### `codex`（interactive）

不带子命令运行 `codex` 会启动交互式 terminal UI（TUI）。该 agent 接受上面的 global flags 以及 image attachments。Web search 默认使用 cached mode；使用 `--search` 可切换到 live browsing。为了低摩擦的本地工作，请使用 `--sandbox workspace-write --ask-for-approval on-request`。

使用 `--remote ws://host:port` 或 `--remote wss://host:port`，可以把 TUI 连接到通过 `codex app-server --listen ws://IP:PORT` 启动的 app server。对于本地 Unix socket，使用 `--remote unix://` 连接默认 socket，或使用 `--remote unix://PATH` 指定显式路径。当 server 要求 WebSocket authentication 的 bearer token 时，添加 `--remote-auth-token-env <ENV_VAR>`。

### `codex app-server`

在本地启动 Codex app server。它主要用于开发和调试，并且可能在不通知的情况下更改。

<ConfigTable client:load options={appServerOptions} />

`codex app-server --listen stdio://` 保持默认的 JSONL-over-stdio 行为，而 `codex app-server --stdio` 是该 transport 的别名。`--listen ws://IP:PORT` 会为 app-server clients 启用 WebSocket transport。server 接受 `ws://` listen URLs；当 clients 使用 `wss://` 连接时，请使用 TLS termination 或 secure proxy。使用 `--listen unix://` 可在 Codex 默认 Unix socket 上接受 WebSocket handshakes，或使用 `--listen unix:///absolute/path.sock` 选择 socket path。如果你为 client bindings 生成 schemas，请添加 `--experimental` 以包含 gated fields 和 methods。

### `codex remote-control`

确保 app-server daemon 正在运行，并且已启用 remote-control 支持。托管的 remote-control clients 和 SSH remote workflows 使用此命令；当你在构建本地 protocol client 时，它不能替代 `codex app-server --listen`。

### `codex app`

从终端在 macOS 或 Windows 上启动 Codex Desktop。在 macOS 上，Codex 可以打开特定 workspace path；在 Windows 上，Codex 会打印要打开的路径。

<ConfigTable client:load options={appOptions} />

`codex app` 会打开已安装的 Codex Desktop app；如果缺失，则启动 installer。在 macOS 上，Codex 会打开提供的 workspace path；在 Windows 上，它会在安装后打印要打开的路径。

### `codex debug app-server send-message-v2`

使用内置 app-server test client，通过 app-server 的 V2 thread/turn flow 发送一条消息。

<ConfigTable client:load options={debugAppServerSendMessageV2Options} />

此 debug flow 会以 `experimentalApi: true` 初始化，启动一个 thread，发送一个 turn，并流式传输 server notifications。使用它在本地复现和检查 app-server protocol behavior。

### `codex debug models`

以 JSON 打印 Codex 看到的原始 model catalog。

<ConfigTable client:load options={debugModelsOptions} />

当你只想检查当前 binary bundled 的 catalog，而不从远程 models endpoint 刷新时，请使用 `--bundled`。

### `codex apply`

把 Codex cloud task 的最新 diff 应用到你的本地仓库。你必须完成认证并拥有该 task 的访问权限。

<ConfigTable client:load options={applyOptions} />

Codex 会打印已 patch 的文件；如果 `git apply` 失败（例如因为冲突），会以非零状态退出。

### `codex archive` 和 `codex unarchive`

按 session ID 或 session name 归档或恢复已保存的交互式 session。当你想清理 session picker 但不删除 transcript 时，请使用这些命令。Session IDs 优先于 session names。

```bash
codex archive <SESSION>
codex unarchive <SESSION>
```

<ConfigTable client:load options={archiveOptions} />

### `codex delete`

按 session ID 或 session name 永久删除已保存的交互式 session。只有当你想删除 transcript，而不是仅从 active session lists 中隐藏它时，才使用此命令。

```bash
codex delete <SESSION>
codex delete <SESSION_UUID> --force
```

<ConfigTable client:load options={deleteOptions} />

只对 session UUID 使用 `--force`。Named sessions 仍需要确认，这样 Codex 不会在没有提示的情况下删除重复或有歧义的名称。

### `codex cloud`

从终端与 Codex cloud tasks 交互。默认命令会打开交互式选择器；`codex cloud exec` 会直接提交 task；`codex cloud list` 会返回近期 tasks，便于脚本化或快速检查。

<ConfigTable client:load options={cloudExecOptions} />

认证遵循与主 CLI 相同的凭据。如果 task 提交失败，Codex 会以非零状态退出。

#### `codex cloud list`

列出最近的 cloud tasks，可选 filtering 和 pagination。

<ConfigTable client:load options={cloudListOptions} />

Plain-text output 会打印 task URL，随后是 status details。使用 `--json` 可用于自动化。JSON payload 包含 `tasks` array 和可选的 `cursor` value。每个 task 都包含 `id`、`url`、`title`、`status`、`updated_at`、`environment_id`、`environment_label`、`summary`、`is_review` 和 `attempt_total`。

### `codex completion`

生成 shell completion scripts，并把输出重定向到适当位置，例如 `codex completion zsh > "${fpath[1]}/_codex"`。

<ConfigTable client:load options={completionOptions} />

### `codex doctor`

在提交 support issue 前，或调查损坏的 Codex 安装时，生成本地诊断报告。该报告会检查安装、配置、认证、运行时、Git、终端、app-server 和 thread inventory health。

<ConfigTable client:load options={doctorOptions} />

### `codex features`

管理存储在 `$CODEX_HOME/config.toml` 中的 feature flags。`enable` 和 `disable` 命令会持久保存改动，使其应用于未来 session。`features` 子命令不接受 `--profile`。

<ConfigTable client:load options={featuresOptions} />

### `codex exec`

对于应在无人交互下完成的脚本化或 CI 风格运行，请使用 `codex exec`（或短形式 `codex e`）。

<ConfigTable client:load options={execOptions} />

Codex 默认写入格式化输出。添加 `--json` 可接收 newline-delimited JSON events（每次状态变化一个）。可选的 `resume` 子命令让你可以继续非交互式任务。使用 `--last` 选择当前工作目录中最近的 session，或添加 `--all` 跨所有 session 搜索：

<ConfigTable client:load options={execResumeOptions} />

### `codex execpolicy`

保存 `execpolicy` rule files 前先检查它们。`codex execpolicy check` 接受一个或多个 `--rules` flags（例如 `~/.codex/rules` 下的文件），并输出 JSON，显示最严格 decision 和任何匹配规则。添加 `--pretty` 可格式化输出。`execpolicy` 命令当前处于 preview。

<ConfigTable client:load options={execpolicyOptions} />

### `codex login`

使用 ChatGPT 账户、API key 或 access token 对 CLI 进行认证。不带 flags 时，Codex 会打开浏览器完成 ChatGPT OAuth flow。

<ConfigTable client:load options={loginOptions} />

`codex login status` 会在存在凭据时以 `0` 退出，这对自动化脚本很有帮助。

### `codex logout`

移除 API key 和 ChatGPT authentication 的已保存凭据。此命令没有 flags。

### `codex mcp`

管理存储在 `~/.codex/config.toml` 中的 Model Context Protocol server entries。

<ConfigTable client:load options={mcpCommands} />

`add` 子命令同时支持 stdio 和 streamable HTTP transports：

<ConfigTable client:load options={mcpAddOptions} />

OAuth actions（`login`、`logout`）只适用于 streamable HTTP servers（并且只有当 server 支持 OAuth 时才可用）。

### `codex plugin`

从已配置 marketplaces 安装、列出和移除 plugins。

<ConfigTable client:load options={pluginCommands} />

`codex plugin add --json` 会打印 `pluginId`、`name`、`marketplaceName`、`version`、`installedPath` 和 `authPolicy`。`codex plugin list --json` 会打印 `installed` 和 `available` arrays。条目包含 `pluginId`、`name`、`marketplaceName`、`version`、`installed`、`enabled`、`source`、`installPolicy`、`authPolicy`，并在可用时包含 `marketplaceSource`，其中带有已配置 marketplace source type 和 value。`codex plugin remove --json` 会打印 `pluginId`、`name` 和 `marketplaceName`。

### `codex plugin marketplace`

管理 Codex 可以浏览和安装的 plugin marketplace sources。

<ConfigTable client:load options={marketplaceCommands} />

`codex plugin marketplace add` 接受 GitHub shorthand，例如 `owner/repo` 或 `owner/repo@ref`，也接受 HTTP 或 HTTPS Git URLs、SSH Git URLs 和本地 marketplace root directories。使用 `--ref` pin 某个 Git ref，并重复 `--sparse PATH` 以对 Git-backed marketplace repositories 使用 sparse checkout。

`codex plugin marketplace list` 会打印 in-scope marketplace names 和 roots，包括隐式发现的 default marketplaces 和已配置 marketplace snapshots。

向 marketplace add、list、upgrade 或 remove commands 添加 `--json` 可获得 automation-friendly output。Marketplace add JSON 包含 `marketplaceName`、`installedRoot` 和 `alreadyAdded`；list JSON 包含 `marketplaces` array，其中有 `name`、`root` 和可选 `marketplaceSource`；upgrade JSON 包含 `selectedMarketplaces`、`upgradedRoots` 和 `errors`；remove JSON 包含 `marketplaceName` 和 `installedRoot`。

### `codex mcp-server`

通过 stdio 把 Codex 作为 MCP server 运行，以便其他工具连接。此命令继承全局配置覆盖，并在下游 client 关闭连接时退出。

### `codex resume`

按 ID 继续交互式 session，或恢复最近的对话。除非你传入 `--all`，否则 `codex resume` 会把 `--last` 限定到当前工作目录。它接受与 `codex` 相同的 global flags，包括 model 和 sandbox overrides。

<ConfigTable client:load options={resumeOptions} />

### `codex fork`

把之前的交互式 session fork 成一个新 thread。默认情况下，`codex fork` 会打开 session picker；添加 `--last` 可改为 fork 最近的 session。

<ConfigTable client:load options={forkOptions} />

### `codex sandbox`

使用 sandbox helper 在 Codex 内部使用的相同 policies 下运行命令。

#### macOS seatbelt

<ConfigTable client:load options={sandboxMacOptions} />

#### Linux Landlock

<ConfigTable client:load options={sandboxLinuxOptions} />

#### Windows

<ConfigTable client:load options={sandboxWindowsOptions} />

### `codex update`

当已安装 release 支持 self-update 时，检查并应用 Codex CLI 更新。Debug builds 会打印消息，提示你改为安装 release build。

## Flag 组合和安全提示

- 对于可留在 workspace 内的无人值守本地工作，使用 `--sandbox workspace-write`，并避免使用 `--dangerously-bypass-approvals-and-sandbox`，除非你位于专用 sandbox VM 内。
- 当你需要授予 Codex 对更多目录的写入访问时，优先使用 `--add-dir`，而不是强制使用 `--sandbox danger-full-access`。
- 在 CI 中把 `--json` 与 `--output-last-message` 搭配使用，以捕获 machine-readable progress 和最终自然语言摘要。

## 相关资源

- [Codex CLI overview](https://developers.openai.com/codex/cli)：安装、升级和快速提示。
- [Config basics](https://developers.openai.com/codex/config-basic)：持久保存默认值，例如 model 和 provider。
- [Advanced Config](https://developers.openai.com/codex/config-advanced)：profiles、providers、sandbox tuning 和 integrations。
- [AGENTS.md](https://developers.openai.com/codex/guides/agents-md)：Codex agent capabilities 和 best practices 的概念概览。
