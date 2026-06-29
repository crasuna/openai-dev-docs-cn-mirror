---
title: "配置参考"
description: "Complete reference for Codex config.toml and requirements.toml"
outline: deep
---

# 配置参考

**文档集**：Codex  
**分组**：Codex — Config Reference  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/config-reference](https://developers.openai.com/codex/config-reference)
- Markdown 来源：[https://developers.openai.com/codex/config-reference.md](https://developers.openai.com/codex/config-reference.md)
- 抓取时间：2026-06-27T05:54:57.366Z
- Checksum：`78ba655a5dc192e6828431198f3c36c6ab74bcac269ffbb619497a9ff46f8104`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
请将本页作为 Codex 配置文件的可搜索参考。有关概念指导和示例，请先阅读 [Config basics](/mirror/codex/config-basic) 和 [Advanced Config](/mirror/codex/config-advanced)。

## `config.toml`

用户级配置位于 `~/.codex/config.toml`。你也可以在 `.codex/config.toml` 文件中添加项目范围的覆盖。Codex 仅在你信任该项目时才会加载项目范围的配置文件。

项目范围的配置不能覆盖机器本地 provider、auth、host-owned app request metadata、notification、configuration profile selection 或 telemetry routing keys。当 `openai_base_url`、`chatgpt_base_url`、`apps_mcp_product_sku`、`model_provider`、`model_providers`、`notify`、`profile`、`profiles`、`experimental_realtime_ws_base_url` 和 `otel` 出现在项目本地 `.codex/config.toml` 中时，Codex 会忽略它们；请改为将 provider、notification 和 telemetry keys 放入用户级配置。Config [profile files](/mirror/codex/config-advanced#profiles) 与 `config.toml` 位于同一位置，形式为 `$CODEX_HOME/profile-name.config.toml`；使用 `--profile profile-name` 选择其中一个。

对于 sandbox 和 approval keys（`approval_policy`、`sandbox_mode` 和 `sandbox_workspace_write.*`），请将本参考与 [Sandbox and approvals](/mirror/codex/agent-approvals-security#sandbox-and-approvals)、[Protected paths in writable roots](/mirror/codex/agent-approvals-security#protected-paths-in-writable-roots) 和 [Network access](/mirror/codex/agent-approvals-security#network-access) 配合阅读。有关 beta permission profiles，请参阅 [Permissions](/mirror/codex/permissions)。

&lt;ConfigTable
  options={[
    {
      key: "model",
      type: "string",
      description: "要使用的模型（例如 `gpt-5.5`）。",
    },
    {
      key: "review_model",
      type: "string",
      description:
        "`/review` 使用的可选模型覆盖（默认使用当前会话模型）。",
    },
    {
      key: "model_provider",
      type: "string",
      description: "来自 `model_providers` 的 provider id（默认：`openai`）。",
    },
    {
      key: "openai_base_url",
      type: "string",
      description:
        "内置 `openai` model provider 的基础 URL 覆盖。",
    },
    {
      key: "model_context_window",
      type: "number",
      description: "活动模型可用的上下文窗口 token 数。",
    },
    {
      key: "model_auto_compact_token_limit",
      type: "number",
      description:
        "触发自动历史压缩的 token 阈值（未设置时使用模型默认值）。",
    },
    {
      key: "model_catalog_json",
      type: "string (path)",
      description:
        "启动时加载的可选 JSON model catalog 路径。所选 `$CODEX_HOME/profile-name.config.toml` profile file 可以按 profile 覆盖此值。",
    },
    {
      key: "oss_provider",
      type: "lmstudio | ollama",
      description:
        "使用 `--oss` 运行时使用的默认本地 provider（未设置时默认提示）。",
    },
    {
      key: "approval_policy",
      type: "untrusted | on-request | never | { granular = { sandbox_approval = bool, rules = bool, mcp_elicitations = bool, request_permissions = bool, skill_approval = bool } }",
      description:
        "控制 Codex 在执行命令前何时暂停请求批准。你也可以使用 `approval_policy = { granular = { ... } }`，在保持其他提示交互式的同时允许或自动拒绝特定提示类别。`on-failure` 已弃用；交互式运行请使用 `on-request`，非交互式运行请使用 `never`。",
    },
    {
      key: "approval_policy.granular.sandbox_approval",
      type: "boolean",
      description:
        "为 `true` 时，允许显示 sandbox escalation approval prompts。",
    },
    {
      key: "approval_policy.granular.rules",
      type: "boolean",
      description:
        "为 `true` 时，允许显示由 execpolicy `prompt` rules 触发的 approvals。",
    },
    {
      key: "approval_policy.granular.mcp_elicitations",
      type: "boolean",
      description:
        "为 `true` 时，允许显示 MCP elicitation prompts，而不是自动拒绝。",
    },
    {
      key: "approval_policy.granular.request_permissions",
      type: "boolean",
      description:
        "为 `true` 时，允许显示来自 `request_permissions` 工具的提示。",
    },
    {
      key: "approval_policy.granular.skill_approval",
      type: "boolean",
      description:
        "为 `true` 时，允许显示 skill-script approval prompts。",
    },
    {
      key: "approvals_reviewer",
      type: "user | auto_review",
      description:
        "在 `on-request` 或 granular approval policies 下，由谁审核符合条件的 approval prompts。默认是 `user`；`auto_review` 使用 reviewer subagent。此设置不会改变 sandboxing，也不会改变 sandbox 内已经允许的 review actions。",
    },
    {
      key: "auto_review.policy",
      type: "string",
      description:
        "automatic review 的本地 Markdown policy instructions。托管 `guardian_policy_config` 优先。空白值会被忽略。",
    },
    {
      key: "allow_login_shell",
      type: "boolean",
      description:
        "允许基于 shell 的工具使用 login-shell 语义。默认值为 `true`；当为 `false` 时，`login = true` 请求会被拒绝，省略的 `login` 默认为 non-login shells。",
    },
    {
      key: "sandbox_mode",
      type: "read-only | workspace-write | danger-full-access",
      description:
        "命令执行期间 filesystem 和 network access 的 sandbox policy。",
    },
    {
      key: "sandbox_workspace_write.writable_roots",
      type: "array&lt;string&gt;",
      description:
        '当 `sandbox_mode = "workspace-write"` 时的额外 writable roots。',
    },
    {
      key: "sandbox_workspace_write.network_access",
      type: "boolean",
      description:
        "允许 workspace-write sandbox 内的 outbound network access。",
    },
    {
      key: "sandbox_workspace_write.exclude_tmpdir_env_var",
      type: "boolean",
      description:
        "在 workspace-write 模式下从 writable roots 中排除 `$TMPDIR`。",
    },
    {
      key: "sandbox_workspace_write.exclude_slash_tmp",
      type: "boolean",
      description:
        "在 workspace-write 模式下从 writable roots 中排除 `/tmp`。",
    },
    {
      key: "windows.sandbox",
      type: "unelevated | elevated",
      description:
        "在原生 Windows 上运行 Codex 时，仅 Windows 可用的 native sandbox mode。",
    },
    {
      key: "windows.sandbox_private_desktop",
      type: "boolean",
      description:
        "在原生 Windows 上默认让最终 sandboxed child process 运行在 private desktop 上。仅在需要兼容较旧的 `Winsta0\\\\Default` 行为时才设置为 `false`。",
    },
    {
      key: "notify",
      type: "array&lt;string&gt;",
      description:
        "用于通知的命令；接收来自 Codex 的 JSON payload。",
    },
    {
      key: "check_for_update_on_startup",
      type: "boolean",
      description:
        "启动时检查 Codex 更新（仅在更新由中央管理时才设置为 false）。",
    },
    {
      key: "feedback.enabled",
      type: "boolean",
      description:
        "在各个 Codex 界面启用通过 `/feedback` 提交反馈（默认：true）。",
    },
    {
      key: "analytics.enabled",
      type: "boolean",
      description:
        "为此机器/profile 启用或禁用 analytics。未设置时应用 client 默认值。",
    },
    {
      key: "instructions",
      type: "string",
      description:
        "保留供未来使用；优先使用 `model_instructions_file` 或 `AGENTS.md`。",
    },
    {
      key: "developer_instructions",
      type: "string",
      description:
        "注入会话的额外 developer instructions（可选）。",
    },
    {
      key: "log_dir",
      type: "string (path)",
      description:
        "Codex 写入日志文件的目录；默认是 `$CODEX_HOME/log`。显式设置它还会在该目录中启用 opt-in plaintext TUI log，即 `codex-tui.log`。",
    },
    {
      key: "sqlite_home",
      type: "string (path)",
      description:
        "Codex 存储 SQLite-backed state DB 的目录，该 DB 用于 agent jobs 和其他可恢复 runtime state。",
    },
    {
      key: "compact_prompt",
      type: "string",
      description: "历史压缩提示词的 inline override。",
    },
    {
      key: "commit_attribution",
      type: "string",
      description:
        '启用 `[features].codex_git_commit` 时使用的 commit co-author trailer。默认是 `Codex &lt;noreply@openai.com&gt;`；设置为 `""` 可禁用。',
    },
    {
      key: "model_instructions_file",
      type: "string (path)",
      description:
        "替代内置 instructions，而不是使用 `AGENTS.md`。",
    },
    {
      key: "personality",
      type: "none | friendly | pragmatic",
      description:
        "对声明 `supportsPersonality` 的模型使用的默认沟通风格；可按 thread/turn 或通过 `/personality` 覆盖。",
    },
    {
      key: "service_tier",
      type: "string",
      description:
        "新 turns 的首选 service tier。内置值包括 `flex` 和 `fast`；legacy `fast` config 会映射到请求值 `priority`，也可以存储 catalog-provided tier IDs。",
    },
    {
      key: "experimental_compact_prompt_file",
      type: "string (path)",
      description:
        "从文件加载 compaction prompt override（实验性）。",
    },
    {
      key: "skills.config",
      type: "array&lt;object&gt;",
      description: "存储在 config.toml 中的 per-skill enablement overrides。",
    },
    {
      key: "skills.config.&lt;index&gt;.path",
      type: "string (path)",
      description: "包含 `SKILL.md` 的 skill 文件夹路径。",
    },
    {
      key: "skills.config.&lt;index&gt;.enabled",
      type: "boolean",
      description: "启用或禁用引用的 skill。",
    },
    {
      key: "apps.&lt;id&gt;.enabled",
      type: "boolean",
      description:
        "按 id 启用或禁用特定 app/connector（默认：true）。",
    },
    {
      key: "apps._default.enabled",
      type: "boolean",
      description:
        "除非按 app 覆盖，否则适用于所有 apps 的默认启用状态。",
    },
    {
      key: "apps._default.destructive_enabled",
      type: "boolean",
      description:
        "对于带有 `destructive_hint = true` 的 app tools，默认允许或拒绝。",
    },
    {
      key: "apps._default.open_world_enabled",
      type: "boolean",
      description:
        "对于带有 `open_world_hint = true` 的 app tools，默认允许或拒绝。",
    },
    {
      key: "apps._default.approvals_reviewer",
      type: "user | auto_review",
      description:
        "除非按 app 覆盖，否则用于 app tool approval prompts 的默认 reviewer。省略时，apps 继承顶层 `approvals_reviewer` 值。",
    },
    {
      key: "apps._default.default_tools_approval_mode",
      type: "auto | prompt | approve",
      description:
        "没有 per-app 或 per-tool overrides 的 app tools 的默认 approval behavior。",
    },
    {
      key: "apps.&lt;id&gt;.destructive_enabled",
      type: "boolean",
      description:
        "允许或阻止此 app 中声明 `destructive_hint = true` 的 tools。",
    },
    {
      key: "apps.&lt;id&gt;.open_world_enabled",
      type: "boolean",
      description:
        "允许或阻止此 app 中声明 `open_world_hint = true` 的 tools。",
    },
    {
      key: "apps.&lt;id&gt;.default_tools_enabled",
      type: "boolean",
      description:
        "此 app 中 tools 的默认启用状态，除非存在 per-tool override。",
    },
    {
      key: "apps.&lt;id&gt;.approvals_reviewer",
      type: "user | auto_review",
      description:
        "此 app 的 tool approval prompts 的 reviewer。覆盖 `apps._default.approvals_reviewer`。",
    },
    {
      key: "apps.&lt;id&gt;.default_tools_approval_mode",
      type: "auto | prompt | approve",
      description:
        "此 app 中 tools 的默认 approval behavior，除非存在 per-tool override。",
    },
    {
      key: "apps.&lt;id&gt;.tools.&lt;tool&gt;.enabled",
      type: "boolean",
      description:
        "某个 app tool 的 per-tool enabled override（例如 `repos/list`）。",
    },
    {
      key: "apps.&lt;id&gt;.tools.&lt;tool&gt;.approval_mode",
      type: "auto | prompt | approve",
      description: "单个 app tool 的 per-tool approval behavior override。",
    },
    {
      key: "tool_suggest.discoverables",
      type: "array&lt;table&gt;",
      description:
        '允许针对额外 discoverable connectors 或 plugins 提供 tool suggestions。每个条目使用 `type = "connector"` 或 `"plugin"`，并包含一个 `id`。',
    },
    {
      key: "tool_suggest.disabled_tools",
      type: "array&lt;table&gt;",
      description:
        '禁用针对特定 discoverable connectors 或 plugins 的 suggestions。每个条目使用 `type = "connector"` 或 `"plugin"`，并包含一个 `id`。',
    },
    {
      key: "features.apps",
      type: "boolean",
      description: "启用 ChatGPT Apps/connectors 支持（实验性）。",
    },
    {
      key: "features.hooks",
      type: "boolean",
      description:
        "启用从 `hooks.json` 或 inline `[hooks]` config 加载的 lifecycle hooks。`features.codex_hooks` 是已弃用别名。",
    },
    {
      key: "features.codex_git_commit",
      type: "boolean",
      description:
        "启用 Codex 生成 git commits。启用后，Codex 使用 `commit_attribution` 在生成的 commit messages 中追加 `Co-authored-by:` trailer。",
    },
    {
      key: "features.code_mode.enabled",
      type: "boolean",
      description:
        "启用 code mode feature configuration。此功能正在开发中，默认关闭。",
    },
    {
      key: "features.code_mode.excluded_tool_namespaces",
      type: "array&lt;string&gt;",
      description:
        "Code mode 从嵌套 code-mode tool guidance 和 executor exposure 中排除的 tool namespaces。",
    },
    {
      key: "features.code_mode.direct_only_tool_namespaces",
      type: "array&lt;string&gt;",
      description:
        "Code mode 只能通过 direct tool calls 使用的 tool namespaces。",
    },
    {
      key: "features.rollout_budget.enabled",
      type: "boolean",
      description:
        "启用 rollout budget tracking。此功能正在开发中，默认关闭。启用后，`features.rollout_budget.limit_tokens` 是必需项。",
    },
    {
      key: "features.rollout_budget.limit_tokens",
      type: "integer",
      description:
        "Rollout budget tracking 的正 token limit。启用 rollout budget 时必需。",
    },
    {
      key: "features.rollout_budget.reminder_interval_tokens",
      type: "integer",
      description:
        "Rollout budget reminders 之间的正 token 间隔。默认是 `limit_tokens` 的 10%，最小为 1 token。",
    },
    {
      key: "features.rollout_budget.sampling_token_weight",
      type: "number",
      description:
        "Rollout budget accounting 中 sampled tokens 的有限非负乘数。默认是 `1.0`。",
    },
    {
      key: "features.rollout_budget.prefill_token_weight",
      type: "number",
      description:
        "Rollout budget accounting 中 prefill tokens 的有限非负乘数。默认是 `1.0`。",
    },
    {
      key: "hooks",
      type: "table",
      description:
        "在 `config.toml` 中 inline 配置的 lifecycle hooks。使用与 `hooks.json` 相同的 event schema；示例和支持事件请参阅 Hooks guide。",
    },
    {
      key: "hooks.&lt;Event&gt;",
      type: "array&lt;table&gt;",
      description:
        "Hook events 的 matcher groups，例如 `PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`SessionStart`、`SubagentStart`、`SubagentStop`、`UserPromptSubmit` 或 `Stop`。",
    },
    {
      key: "hooks.&lt;Event&gt;[].hooks",
      type: "array&lt;table&gt;",
      description:
        "Matcher group 的 hook handlers。目前支持 command hooks；prompt 和 agent hook handlers 会被解析但跳过。",
    },
    {
      key: "hooks.&lt;Event&gt;[].hooks[].commandWindows",
      type: "string",
      description:
        "Command hooks 的 Windows-only command override。也接受 TOML 别名 `command_windows`。",
    },
    {
      key: "features.memories",
      type: "boolean",
      description: "启用 [Memories](/mirror/codex/memories)（默认关闭）。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.command",
      type: "string",
      description: "MCP stdio server 的 launcher command。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.args",
      type: "array&lt;string&gt;",
      description: "传给 MCP stdio server command 的参数。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.env",
      type: "map&lt;string,string&gt;",
      description: "转发给 MCP stdio server 的环境变量。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.env_vars",
      type: 'array&lt;string | { name = string, source = "local" | "remote" }&gt;',
      description:
        '为 MCP stdio server 额外列入白名单的环境变量。字符串条目默认使用 `source = "local"`；只有 executor-backed remote stdio 才使用 `source = "remote"`。',
    },
    {
      key: "mcp_servers.&lt;id&gt;.cwd",
      type: "string",
      description: "MCP stdio server process 的工作目录。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.url",
      type: "string",
      description: "MCP streamable HTTP server 的 endpoint。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.bearer_token_env_var",
      type: "string",
      description:
        "为 MCP HTTP server 提供 bearer token 的环境变量。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.http_headers",
      type: "map&lt;string,string&gt;",
      description: "随每个 MCP HTTP request 包含的 static HTTP headers。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.env_http_headers",
      type: "map&lt;string,string&gt;",
      description:
        "从环境变量填充的 MCP HTTP server HTTP headers。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.enabled",
      type: "boolean",
      description: "禁用 MCP server，而无需移除其配置。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.required",
      type: "boolean",
      description:
        "为 true 时，如果此已启用 MCP server 无法初始化，则 startup/resume 失败。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.startup_timeout_sec",
      type: "number",
      description:
        "覆盖 MCP server 默认 10s startup timeout。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.startup_timeout_ms",
      type: "number",
      description: "`startup_timeout_sec` 的毫秒别名。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.tool_timeout_sec",
      type: "number",
      description:
        "覆盖 MCP server 默认 60s per-tool timeout。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.enabled_tools",
      type: "array&lt;string&gt;",
      description: "MCP server 暴露的 tool names allow list。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.disabled_tools",
      type: "array&lt;string&gt;",
      description:
        "在 MCP server 的 `enabled_tools` 之后应用的 deny list。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.default_tools_approval_mode",
      type: "auto | prompt | approve",
      description:
        "此 server 上 MCP tools 的默认 approval behavior，除非存在 per-tool override。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.tools.&lt;tool&gt;.approval_mode",
      type: "auto | prompt | approve",
      description:
        "此 server 上某个 MCP tool 的 per-tool approval behavior override。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.scopes",
      type: "array&lt;string&gt;",
      description:
        "认证该 MCP server 时请求的 OAuth scopes。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.oauth_resource",
      type: "string",
      description:
        "MCP login 期间要包含的可选 RFC 8707 OAuth resource parameter。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.experimental_environment",
      type: "local | remote",
      description:
        "MCP server 的实验性运行位置。`remote` 会通过 remote executor environment 启动 stdio servers；streamable HTTP remote placement 尚未实现。",
    },
    {
      key: "agents.max_threads",
      type: "number",
      description:
        "可同时打开的 agent threads 最大数量。未设置时默认 `6`。",
    },
    {
      key: "agents.max_depth",
      type: "number",
      description:
        "允许 spawned agent threads 的最大嵌套深度（root sessions 从深度 0 开始；默认：1）。",
    },
    {
      key: "agents.job_max_runtime_seconds",
      type: "number",
      description:
        "`spawn_agents_on_csv` jobs 的默认 per-worker timeout。未设置时，该工具回退到每个 worker 1800 秒。",
    },
    {
      key: "agents.&lt;name&gt;.description",
      type: "string",
      description:
        "Codex 选择并 spawn 该 agent 类型时显示的 role guidance。",
    },
    {
      key: "agents.&lt;name&gt;.config_file",
      type: "string (path)",
      description:
        "该角色的 TOML config layer 路径；相对路径从声明该角色的 config file 解析。",
    },
    {
      key: "agents.&lt;name&gt;.nickname_candidates",
      type: "array&lt;string&gt;",
      description:
        "该角色 spawned agents 的可选 display nicknames 池。",
    },
    {
      key: "memories.generate_memories",
      type: "boolean",
      description:
        "为 `false` 时，新创建的 threads 不会存储为 memory-generation inputs。默认是 `true`。",
    },
    {
      key: "memories.use_memories",
      type: "boolean",
      description:
        "为 `false` 时，Codex 会跳过向未来 sessions 注入现有 memories。默认是 `true`。",
    },
    {
      key: "memories.disable_on_external_context",
      type: "boolean",
      description:
        "为 `true` 时，使用 MCP tool calls、web search 或 tool search 等外部上下文的 threads 不会用于 memory generation。默认是 `false`。Legacy alias：`memories.no_memories_if_mcp_or_web_search`。",
    },
    {
      key: "memories.max_raw_memories_for_consolidation",
      type: "number",
      description:
        "为 global consolidation 保留的最近 raw memories 最大数量。默认是 `256`，上限为 `4096`。",
    },
    {
      key: "memories.max_unused_days",
      type: "number",
      description:
        "Memory 距离上次使用多少天后不再有资格参与 consolidation。默认是 `30`，并 clamp 到 `0`-`365`。",
    },
    {
      key: "memories.max_rollout_age_days",
      type: "number",
      description:
        "参与 memory generation 的 threads 最大年龄。默认是 `30`，并 clamp 到 `0`-`90`。",
    },
    {
      key: "memories.max_rollouts_per_startup",
      type: "number",
      description:
        "每次 startup pass 处理的 rollout candidates 最大数量。默认是 `16`，上限为 `128`。",
    },
    {
      key: "memories.min_rollout_idle_hours",
      type: "number",
      description:
        "Thread 被纳入 memory generation 前的最小 idle time。默认是 `6`，并 clamp 到 `1`-`48`。",
    },
    {
      key: "memories.min_rate_limit_remaining_percent",
      type: "number",
      description:
        "启动 memory generation 前，Codex rate-limit windows 中要求的最小剩余百分比。默认是 `25`，并 clamp 到 `0`-`100`。",
    },
    {
      key: "memories.extract_model",
      type: "string",
      description: "Per-thread memory extraction 的可选模型覆盖。",
    },
    {
      key: "memories.consolidation_model",
      type: "string",
      description: "Global memory consolidation 的可选模型覆盖。",
    },
    {
      key: "features.unified_exec",
      type: "boolean",
      description:
        "使用统一的 PTY-backed exec tool（稳定；除 Windows 外默认启用）。",
    },
    {
      key: "features.shell_snapshot",
      type: "boolean",
      description:
        "对 shell environment 进行快照，以加速重复命令（稳定；默认开启）。",
    },
    {
      key: "features.undo",
      type: "boolean",
      description: "启用 undo 支持（稳定；默认关闭）。",
    },
    {
      key: "features.multi_agent",
      type: "boolean",
      description:
        "启用 multi-agent collaboration tools（`spawn_agent`、`send_input`、`resume_agent`、`wait_agent` 和 `close_agent`）（稳定；默认开启）。",
    },
    {
      key: "features.personality",
      type: "boolean",
      description:
        "启用 personality selection controls（稳定；默认开启）。",
    },
    {
      key: "features.network_proxy",
      type: "boolean | table",
      description:
        "启用 sandboxed networking。设置 `domains` 等 network policy options 时使用 table form（实验性；默认关闭）。",
    },
    {
      key: "features.network_proxy.enabled",
      type: "boolean",
      description: "启用 sandboxed networking。默认是 `false`。",
    },
    {
      key: "features.network_proxy.domains",
      type: "map&lt;string, allow | deny&gt;",
      description:
        "Sandboxed networking 的 domain policy。默认未设置，意味着在添加 `allow` rules 前不允许外部目标。支持 exact hosts、仅匹配 subdomains 的 `*.example.com`、匹配 apex 加 subdomains 的 `**.example.com`，以及 global `*` allow rules；请优先使用 scoped rules，因为 `*` 会广泛打开 public outbound access。为 blocked destinations 添加 `deny` rules；冲突时 `deny` 获胜。",
    },
    {
      key: "features.network_proxy.unix_sockets",
      type: "map&lt;string, allow | deny&gt;",
      description:
        "Sandboxed networking 的 Unix socket policy。默认未设置；为允许的 sockets 添加 `allow` entries。",
    },
    {
      key: "features.network_proxy.allow_local_binding",
      type: "boolean",
      description:
        "允许更广泛的 local/private-network access。默认是 `false`；exact local IP literal 或 `localhost` allow rules 仍可允许特定本地目标。",
    },
    {
      key: "features.network_proxy.enable_socks5",
      type: "boolean",
      description: "暴露 SOCKS5 支持。默认是 `true`。",
    },
    {
      key: "features.network_proxy.enable_socks5_udp",
      type: "boolean",
      description: "允许 UDP over SOCKS5。默认是 `true`。",
    },
    {
      key: "features.network_proxy.allow_upstream_proxy",
      type: "boolean",
      description:
        "允许通过环境中的 upstream proxy 串联。默认是 `true`。",
    },
    {
      key: "features.network_proxy.dangerously_allow_non_loopback_proxy",
      type: "boolean",
      description:
        "允许 non-loopback listener addresses。默认是 `false`；启用后可能会将 proxy listeners 暴露到 localhost 之外。",
    },
    {
      key: "features.network_proxy.dangerously_allow_all_unix_sockets",
      type: "boolean",
      description:
        "允许任意 Unix socket destinations，而不是仅限 allowlist access。默认是 `false`；仅在严格受控环境中使用。",
    },
    {
      key: "features.network_proxy.proxy_url",
      type: "string",
      description:
        'Sandboxed networking 的 HTTP listener URL。默认是 `"http://127.0.0.1:3128"`。',
    },
    {
      key: "features.network_proxy.socks_url",
      type: "string",
      description:
        'SOCKS5 listener URL。默认是 `"http://127.0.0.1:8081"`。',
    },
    {
      key: "features.web_search",
      type: "boolean",
      description:
        "已弃用的 legacy toggle；请优先使用顶层 `web_search` 设置。",
    },
    {
      key: "features.web_search_cached",
      type: "boolean",
      description:
        '已弃用的 legacy toggle。当 `web_search` 未设置时，true 映射为 `web_search = "cached"`。',
    },
    {
      key: "features.web_search_request",
      type: "boolean",
      description:
        '已弃用的 legacy toggle。当 `web_search` 未设置时，true 映射为 `web_search = "live"`。',
    },
    {
      key: "features.shell_tool",
      type: "boolean",
      description:
        "启用用于运行命令的默认 `shell` tool（稳定；默认开启）。",
    },
    {
      key: "features.enable_request_compression",
      type: "boolean",
      description:
        "在支持时使用 zstd 压缩 streaming request bodies（稳定；默认开启）。",
    },
    {
      key: "features.skill_mcp_dependency_install",
      type: "boolean",
      description:
        "允许为 skills 提示并安装缺失的 MCP dependencies（稳定；默认开启）。",
    },
    {
      key: "features.fast_mode",
      type: "boolean",
      description:
        "在 TUI 中启用 model-catalog service tier selection，包括当活动模型声明支持时的 Fast-tier commands（稳定；默认开启）。",
    },
    {
      key: "features.prevent_idle_sleep",
      type: "boolean",
      description:
        "当 turn 正在主动运行时，防止机器睡眠（实验性；默认关闭）。",
    },
    {
      key: "suppress_unstable_features_warning",
      type: "boolean",
      description:
        "抑制启用 under-development feature flags 时显示的警告。",
    },
    {
      key: "model_providers.&lt;id&gt;",
      type: "table",
      description:
        "自定义 provider definition。内置 provider IDs（`openai`、`ollama` 和 `lmstudio`）是保留项，不能覆盖。",
    },
    {
      key: "model_providers.&lt;id&gt;.name",
      type: "string",
      description: "自定义 model provider 的 display name。",
    },
    {
      key: "model_providers.&lt;id&gt;.base_url",
      type: "string",
      description: "Model provider 的 API base URL。",
    },
    {
      key: "model_providers.&lt;id&gt;.env_key",
      type: "string",
      description: "提供 provider API key 的环境变量。",
    },
    {
      key: "model_providers.&lt;id&gt;.env_key_instructions",
      type: "string",
      description: "Provider API key 的可选 setup guidance。",
    },
    {
      key: "model_providers.&lt;id&gt;.experimental_bearer_token",
      type: "string",
      description:
        "Provider 的 direct bearer token（不推荐；请使用 `env_key`）。",
    },
    {
      key: "model_providers.&lt;id&gt;.requires_openai_auth",
      type: "boolean",
      description:
        "该 provider 使用 OpenAI authentication（默认为 false）。",
    },
    {
      key: "model_providers.&lt;id&gt;.wire_api",
      type: "responses",
      description:
        "Provider 使用的 protocol。`responses` 是唯一支持的值，省略时也是默认值。",
    },
    {
      key: "model_providers.&lt;id&gt;.query_params",
      type: "map&lt;string,string&gt;",
      description: "追加到 provider requests 的额外 query parameters。",
    },
    {
      key: "model_providers.&lt;id&gt;.http_headers",
      type: "map&lt;string,string&gt;",
      description: "添加到 provider requests 的 static HTTP headers。",
    },
    {
      key: "model_providers.&lt;id&gt;.env_http_headers",
      type: "map&lt;string,string&gt;",
      description:
        "存在时从环境变量填充的 HTTP headers。",
    },
    {
      key: "model_providers.&lt;id&gt;.request_max_retries",
      type: "number",
      description:
        "发往 provider 的 HTTP requests 重试次数（默认：4）。",
    },
    {
      key: "model_providers.&lt;id&gt;.stream_max_retries",
      type: "number",
      description: "SSE streaming interruptions 的重试次数（默认：5）。",
    },
    {
      key: "model_providers.&lt;id&gt;.stream_idle_timeout_ms",
      type: "number",
      description:
        "SSE streams 的 idle timeout，单位为毫秒（默认：300000）。",
    },
    {
      key: "model_providers.&lt;id&gt;.supports_websockets",
      type: "boolean",
      description:
        "该 provider 是否支持 Responses API WebSocket transport。",
    },
    {
      key: "model_providers.&lt;id&gt;.auth",
      type: "table",
      description:
        "自定义 provider 的 command-backed bearer token configuration。不要与 `env_key`、`experimental_bearer_token` 或 `requires_openai_auth` 组合使用。",
    },
    {
      key: "model_providers.&lt;id&gt;.auth.command",
      type: "string",
      description:
        "当 Codex 需要 bearer token 时运行的命令。该命令必须将 token 打印到 stdout。",
    },
    {
      key: "model_providers.&lt;id&gt;.auth.args",
      type: "array&lt;string&gt;",
      description: "传给 token command 的参数。",
    },
    {
      key: "model_providers.&lt;id&gt;.auth.timeout_ms",
      type: "number",
      description:
        "Token command 的最大运行时间，单位为毫秒（默认：5000）。",
    },
    {
      key: "model_providers.&lt;id&gt;.auth.refresh_interval_ms",
      type: "number",
      description:
        "Codex 主动刷新 token 的频率，单位为毫秒（默认：300000）。设置为 `0` 则仅在 authentication retry 后刷新。",
    },
    {
      key: "model_providers.&lt;id&gt;.auth.cwd",
      type: "string (path)",
      description: "Token command 的工作目录。",
    },
    {
      key: "model_providers.amazon-bedrock.aws.profile",
      type: "string",
      description:
        "内置 `amazon-bedrock` provider 使用的 AWS profile name。",
    },
    {
      key: "model_providers.amazon-bedrock.aws.region",
      type: "string",
      description: "内置 `amazon-bedrock` provider 使用的 AWS region。",
    },
    {
      key: "model_reasoning_effort",
      type: "minimal | low | medium | high | xhigh",
      description:
        "为支持的模型调整 reasoning effort（仅 Responses API；`xhigh` 取决于模型）。",
    },
    {
      key: "plan_mode_reasoning_effort",
      type: "none | minimal | low | medium | high | xhigh",
      description:
        "Plan mode 专用的 reasoning override。未设置时，Plan mode 使用其内置 preset default。",
    },
    {
      key: "model_reasoning_summary",
      type: "auto | concise | detailed | none",
      description:
        "选择 reasoning summary 详细程度，或完全禁用 summaries。",
    },
    {
      key: "model_verbosity",
      type: "low | medium | high",
      description:
        "可选的 GPT-5 Responses API verbosity override；未设置时使用所选模型/preset 默认值。",
    },
    {
      key: "model_supports_reasoning_summaries",
      type: "boolean",
      description: "强制 Codex 发送或不发送 reasoning metadata。",
    },
    {
      key: "shell_environment_policy.inherit",
      type: "all | core | none",
      description:
        "生成 subprocesses 时的 baseline environment inheritance。",
    },
    {
      key: "shell_environment_policy.ignore_default_excludes",
      type: "boolean",
      description:
        "在其他 filters 运行前保留包含 KEY/SECRET/TOKEN 的变量。",
    },
    {
      key: "shell_environment_policy.exclude",
      type: "array&lt;string&gt;",
      description:
        "在 defaults 之后移除环境变量的 glob patterns。",
    },
    {
      key: "shell_environment_policy.include_only",
      type: "array&lt;string&gt;",
      description:
        "Patterns whitelist；设置后只保留匹配的变量。",
    },
    {
      key: "shell_environment_policy.set",
      type: "map&lt;string,string&gt;",
      description:
        "注入每个 subprocess 的显式环境 overrides。",
    },
    {
      key: "shell_environment_policy.experimental_use_profile",
      type: "boolean",
      description: "生成 subprocesses 时使用 user shell profile。",
    },
    {
      key: "project_root_markers",
      type: "array&lt;string&gt;",
      description:
        "Project root marker filenames 列表；在 parent directories 中搜索 project root 时使用。",
    },
    {
      key: "project_doc_max_bytes",
      type: "number",
      description:
        "构建 project instructions 时从 `AGENTS.md` 读取的最大 bytes。",
    },
    {
      key: "project_doc_fallback_filenames",
      type: "array&lt;string&gt;",
      description: "`AGENTS.md` 缺失时尝试的额外 filenames。",
    },
    {
      key: "history.persistence",
      type: "save-all | none",
      description:
        "控制 Codex 是否将 session transcripts 保存到 history.jsonl。",
    },
    {
      key: "tool_output_token_limit",
      type: "number",
      description:
        "在 history 中存储单个 tool/function outputs 的 token budget。",
    },
    {
      key: "background_terminal_max_timeout",
      type: "number",
      description:
        "空 `write_stdin` polls 的最大 poll window，单位为毫秒（background terminal polling）。默认：`300000`（5 分钟）。替代较旧的 `background_terminal_timeout` key。",
    },
    {
      key: "history.max_bytes",
      type: "number",
      description:
        "如果设置，则通过丢弃最旧 entries 来限制 history file size，以 bytes 为单位。",
    },
    {
      key: "file_opener",
      type: "vscode | vscode-insiders | windsurf | cursor | none",
      description:
        "从 Codex output 打开 citations 时使用的 URI scheme（默认：`vscode`）。",
    },
    {
      key: "otel.environment",
      type: "string",
      description:
        "应用于 emitted OpenTelemetry events 的 environment tag（默认：`dev`）。",
    },
    {
      key: "otel.exporter",
      type: "none | otlp-http | otlp-grpc",
      description:
        "选择 OpenTelemetry exporter，并提供任何 endpoint metadata。",
    },
    {
      key: "otel.trace_exporter",
      type: "none | otlp-http | otlp-grpc",
      description:
        "选择 OpenTelemetry trace exporter，并提供任何 endpoint metadata。",
    },
    {
      key: "otel.metrics_exporter",
      type: "none | statsig | otlp-http | otlp-grpc",
      description:
        "选择 OpenTelemetry metrics exporter（默认是 `statsig`）。",
    },
    {
      key: "otel.log_user_prompt",
      type: "boolean",
      description:
        "选择将原始 user prompts 与 OpenTelemetry logs 一起导出。",
    },
    {
      key: "otel.exporter.&lt;id&gt;.endpoint",
      type: "string",
      description: "OTEL logs 的 exporter endpoint。",
    },
    {
      key: "otel.exporter.&lt;id&gt;.protocol",
      type: "binary | json",
      description: "OTLP/HTTP exporter 使用的 protocol。",
    },
    {
      key: "otel.exporter.&lt;id&gt;.headers",
      type: "map&lt;string,string&gt;",
      description: "OTEL exporter requests 中包含的 static headers。",
    },
    {
      key: "otel.trace_exporter.&lt;id&gt;.endpoint",
      type: "string",
      description: "OTEL logs 的 trace exporter endpoint。",
    },
    {
      key: "otel.trace_exporter.&lt;id&gt;.protocol",
      type: "binary | json",
      description: "OTLP/HTTP trace exporter 使用的 protocol。",
    },
    {
      key: "otel.trace_exporter.&lt;id&gt;.headers",
      type: "map&lt;string,string&gt;",
      description: "OTEL trace exporter requests 中包含的 static headers。",
    },
    {
      key: "otel.exporter.&lt;id&gt;.tls.ca-certificate",
      type: "string",
      description: "OTEL exporter TLS 的 CA certificate path。",
    },
    {
      key: "otel.exporter.&lt;id&gt;.tls.client-certificate",
      type: "string",
      description: "OTEL exporter TLS 的 client certificate path。",
    },
    {
      key: "otel.exporter.&lt;id&gt;.tls.client-private-key",
      type: "string",
      description: "OTEL exporter TLS 的 client private key path。",
    },
    {
      key: "otel.trace_exporter.&lt;id&gt;.tls.ca-certificate",
      type: "string",
      description: "OTEL trace exporter TLS 的 CA certificate path。",
    },
    {
      key: "otel.trace_exporter.&lt;id&gt;.tls.client-certificate",
      type: "string",
      description: "OTEL trace exporter TLS 的 client certificate path。",
    },
    {
      key: "otel.trace_exporter.&lt;id&gt;.tls.client-private-key",
      type: "string",
      description: "OTEL trace exporter TLS 的 client private key path。",
    },
    {
      key: "tui",
      type: "table",
      description:
        "TUI-specific options，例如启用 inline desktop notifications。",
    },
    {
      key: "tui.notifications",
      type: "boolean | array&lt;string&gt;",
      description:
        "启用 TUI notifications；可选地限制为特定 event types。",
    },
    {
      key: "tui.notification_method",
      type: "auto | osc9 | bel",
      description:
        "Terminal notifications 的 notification method（默认：auto）。",
    },
    {
      key: "tui.notification_condition",
      type: "unfocused | always",
      description:
        "控制 TUI notifications 是仅在 terminal 未聚焦时触发，还是无论焦点如何都触发。默认是 `unfocused`。",
    },
    {
      key: "tui.animations",
      type: "boolean",
      description:
        "启用 terminal animations（welcome screen、shimmer、spinner）（默认：true）。",
    },
    {
      key: "tui.alternate_screen",
      type: "auto | always | never",
      description:
        "控制 TUI 的 alternate screen usage（默认：auto；auto 会在 Zellij 中跳过它以保留 scrollback）。",
    },
    {
      key: "tui.vim_mode_default",
      type: "boolean",
      description:
        "让 composer 以 Vim normal mode 而不是 insert mode 启动（默认：false）。你仍可在每个 session 中使用 `/vim` 切换。",
    },
    {
      key: "tui.raw_output_mode",
      type: "boolean",
      description:
        "以 raw scrollback mode 启动 TUI，便于 terminal selection 复制（默认：false）。你可以使用 `/raw` 或默认 `alt-r` key binding 切换。",
    },
    {
      key: "tui.show_tooltips",
      type: "boolean",
      description:
        "在 TUI welcome screen 中显示 onboarding tooltips（默认：true）。",
    },
    {
      key: "tui.status_line",
      type: "array&lt;string&gt; | null",
      description:
        "TUI footer status-line item identifiers 的有序列表。`null` 禁用 status line。",
    },
    {
      key: "tui.terminal_title",
      type: "array&lt;string&gt; | null",
      description:
        'Terminal window/tab title item identifiers 的有序列表。默认是 `["spinner", "project"]`；`null` 禁用 title updates。',
    },
    {
      key: "tui.theme",
      type: "string",
      description:
        "Syntax-highlighting theme override（kebab-case theme name）。",
    },
    {
      key: "tui.keymap.&lt;context&gt;.&lt;action&gt;",
      type: "string | array&lt;string&gt;",
      description:
        "TUI action 的 keyboard shortcut binding。支持的 contexts 包括 `global`、`chat`、`composer`、`editor`、`vim_normal`、`vim_operator`、`vim_text_object`、`pager`、`list` 和 `approval`。选定的 composer actions 会回退到匹配的 `tui.keymap.global` bindings；支持时，context-specific bindings 优先。",
    },
    {
      key: "tui.keymap.&lt;context&gt;.&lt;action&gt; = []",
      type: "empty array",
      description:
        "在该 keymap context 中 unbind action。Key names 使用规范化字符串，例如 `ctrl-a`、`shift-enter`、`page-down` 或 `minus`。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.enabled",
      type: "boolean",
      description:
        "启用或禁用已安装 plugin 捆绑的 MCP server，而无需更改 plugin manifest。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.default_tools_approval_mode",
      type: "auto | prompt | approve",
      description:
        "Plugin-provided MCP server 上 tools 的默认 approval behavior。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.enabled_tools",
      type: "array&lt;string&gt;",
      description:
        "从 plugin-provided MCP server 暴露的 tools allow list。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.disabled_tools",
      type: "array&lt;string&gt;",
      description:
        "在 plugin-provided MCP server 的 `enabled_tools` 之后应用的 deny list。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.tools.&lt;tool&gt;.approval_mode",
      type: "auto | prompt | approve",
      description:
        "Plugin-provided MCP tool 的 per-tool approval behavior override。",
    },
    {
      key: "tui.model_availability_nux.&lt;model&gt;",
      type: "integer",
      description: "按 model slug 存储的 internal startup-tooltip state。",
    },
    {
      key: "hide_agent_reasoning",
      type: "boolean",
      description:
        "在 TUI 和 `codex exec` output 中抑制 reasoning events。",
    },
    {
      key: "show_raw_agent_reasoning",
      type: "boolean",
      description:
        "当活动模型发出 raw reasoning content 时显示该内容。",
    },
    {
      key: "disable_paste_burst",
      type: "boolean",
      description: "禁用 TUI 中的 burst-paste detection。",
    },
    {
      key: "windows_wsl_setup_acknowledged",
      type: "boolean",
      description: "跟踪 Windows onboarding acknowledgement（仅 Windows）。",
    },
    {
      key: "chatgpt_base_url",
      type: "string",
      description: "覆盖 ChatGPT login flow 期间使用的 base URL。",
    },
    {
      key: "cli_auth_credentials_store",
      type: "file | keyring | auto",
      description:
        "控制 CLI 存储 cached credentials 的位置（file-based auth.json 与 OS keychain）。",
    },
    {
      key: "mcp_oauth_credentials_store",
      type: "auto | file | keyring",
      description: "MCP OAuth credentials 的首选存储。",
    },
    {
      key: "mcp_oauth_callback_port",
      type: "integer",
      description:
        "MCP OAuth login 期间用于 local HTTP callback server 的可选固定端口。未设置时，Codex 会绑定到 OS 选择的 ephemeral port。",
    },
    {
      key: "mcp_oauth_callback_url",
      type: "string",
      description:
        "MCP OAuth login 的可选 base callback URL override（例如 devbox ingress URL）。Codex 会在发送最终 OAuth `redirect_uri` 前追加 server-specific callback ID，因此请向 provider 注册完整派生 URI。`mcp_oauth_callback_port` 仍控制 callback listener port。",
    },
    {
      key: "experimental_use_unified_exec_tool",
      type: "boolean",
      description:
        "启用 unified exec 的 legacy name；请优先使用 `[features].unified_exec` 或 `codex --enable unified_exec`。",
    },
    {
      key: "tools.web_search",
      type: 'boolean | { context_size = "low|medium|high", allowed_domains = [string], location = { country, region, city, timezone } }',
      description:
        "可选 web search tool configuration。仍接受 legacy boolean form，但 object form 可设置 search context size、allowed domains 和 approximate user location。",
    },
    {
      key: "tools.view_image",
      type: "boolean",
      description: "启用 local-image attachment tool `view_image`。",
    },
    {
      key: "web_search",
      type: "disabled | cached | live",
      description:
        'Web search mode（默认：`"cached"`；cached 使用 OpenAI-maintained index，不抓取 live pages；如果使用 `--yolo` 或其他 full access sandbox 设置，则默认是 `"live"`）。使用 `"live"` 可从 web 获取最新数据，或使用 `"disabled"` 移除该工具。',
    },
    {
      key: "default_permissions",
      type: "string",
      description:
        "应用到 sandboxed tool calls 的默认 permissions profile 名称。内置项是 `:read-only`、`:workspace` 和 `:danger-full-access`；自定义 profile 名称需要匹配的 `[permissions.&lt;name&gt;]` tables。不要与 `sandbox_mode` 或 `[sandbox_workspace_write]` 组合使用。",
    },
    {
      key: "permissions.&lt;name&gt;.description",
      type: "string",
      description:
        "此 named profile 的人类可读描述。Profile 不会通过 `extends` 继承其父级 description。",
    },
    {
      key: "permissions.&lt;name&gt;.extends",
      type: "string",
      description:
        "在此 named profile 前应用的可选 parent profile。将其设置为另一个 named profile、`:read-only` 或 `:workspace`；`:danger-full-access`、未定义 parent 和 cycles 会被拒绝。",
    },
    {
      key: "permissions.&lt;name&gt;.workspace_roots",
      type: "table",
      description:
        "Profile-defined workspace roots，会与 session 的 runtime workspace roots 一起接收 `:workspace_roots` filesystem rules。",
    },
    {
      key: "permissions.&lt;name&gt;.workspace_roots.&lt;path&gt;",
      type: "boolean",
      description:
        "为 `true` 时，将某路径纳入 profile 的 workspace root set。Disabled entries 保持 inactive。",
    },
    {
      key: "permissions.&lt;name&gt;.filesystem",
      type: "table",
      description:
        "Named filesystem permission profile。每个 key 是绝对路径或 `:minimal`、`:workspace_roots` 等 special token。",
    },
    {
      key: "permissions.&lt;name&gt;.filesystem.glob_scan_max_depth",
      type: "number",
      description:
        "在 sandbox startup 前需要 snapshot matches 的平台上，用于扩展 deny-read glob patterns 的最大深度。设置时必须至少为 `1`。",
    },
    {
      key: "permissions.&lt;name&gt;.filesystem.&lt;path-or-glob&gt;",
      type: '"read" | "write" | "deny" | table',
      description:
        '为路径、glob pattern 或 special token 授予 direct access，或在该 root 下限定 nested entries。使用 `"deny"` 拒绝读取匹配路径。',
    },
    {
      key: 'permissions.&lt;name&gt;.filesystem.":workspace_roots".&lt;subpath-or-glob&gt;',
      type: '"read" | "write" | "deny"',
      description:
        '相对于每个 effective workspace root 的 scoped filesystem access。使用 `"."` 表示 root 本身；`"**/*.env"` 等 glob subpaths 可通过 `"deny"` 拒绝读取。',
    },
    {
      key: "permissions.&lt;name&gt;.network.enabled",
      type: "boolean",
      description:
        "为此 named permissions profile 启用 network access。这会更改 sandbox network policy；它本身不会启动 network proxy。",
    },
    {
      key: "permissions.&lt;name&gt;.network.proxy_url",
      type: "string",
      description:
        "当此 permissions profile 启用 sandboxed networking 时使用的 HTTP listener URL。",
    },
    {
      key: "permissions.&lt;name&gt;.network.enable_socks5",
      type: "boolean",
      description:
        "当此 permissions profile 启用 sandboxed networking 时暴露 SOCKS5 支持。",
    },
    {
      key: "permissions.&lt;name&gt;.network.socks_url",
      type: "string",
      description: "此 permissions profile 使用的 SOCKS5 proxy endpoint。",
    },
    {
      key: "permissions.&lt;name&gt;.network.enable_socks5_udp",
      type: "boolean",
      description: "启用时允许 UDP over SOCKS5 listener。",
    },
    {
      key: "permissions.&lt;name&gt;.network.allow_upstream_proxy",
      type: "boolean",
      description:
        "允许 sandboxed networking 通过另一个 upstream proxy 串联。",
    },
    {
      key: "permissions.&lt;name&gt;.network.dangerously_allow_non_loopback_proxy",
      type: "boolean",
      description:
        "允许 sandboxed networking listeners 使用 non-loopback bind addresses。启用后可能会将 listeners 暴露到 localhost 之外。",
    },
    {
      key: "permissions.&lt;name&gt;.network.dangerously_allow_all_unix_sockets",
      type: "boolean",
      description:
        "允许任意 Unix socket destinations，而不是默认 restricted set。仅在严格受控环境中使用。",
    },
    {
      key: "permissions.&lt;name&gt;.network.mode",
      type: "limited | full",
      description: "Subprocess traffic 使用的 network proxy mode。",
    },
    {
      key: "permissions.&lt;name&gt;.network.domains",
      type: "table",
      description:
        "Sandboxed networking 的 domain rules。支持 exact hosts、仅匹配 subdomains 的 `*.example.com`、匹配 apex 加 subdomains 的 `**.example.com`，以及 global `*` allow rules。冲突时 `deny` 获胜。",
    },
    {
      key: "permissions.&lt;name&gt;.network.domains.&lt;pattern&gt;",
      type: "allow | deny",
      description:
        "允许或拒绝 exact host 或 scoped wildcard pattern，例如 `*.example.com` 或 `**.example.com`。",
    },
    {
      key: "permissions.&lt;name&gt;.network.unix_sockets",
      type: "table",
      description:
        "Sandboxed networking 的 Unix socket allowlist overrides。使用 socket paths 作为 keys；`allow` 添加路径，`deny` 拒绝路径。",
    },
    {
      key: "permissions.&lt;name&gt;.network.unix_sockets.&lt;path&gt;",
      type: "allow | deny",
      description:
        "使用 `allow` 将一个绝对 Unix socket path 添加到 effective allowlist，或使用 `deny` 拒绝它。Denied entries 会从 effective allowlist 中省略。",
    },
    {
      key: "permissions.&lt;name&gt;.network.allow_local_binding",
      type: "boolean",
      description:
        "允许通过 sandboxed networking 进行更广泛的 local/private-network access。当此值保持 `false` 时，exact local IP literal 或 `localhost` allow rules 仍可允许特定本地目标。",
    },
    {
      key: "projects.&lt;path&gt;.trust_level",
      type: "string",
      description:
        '将项目或 worktree 标记为 trusted 或 untrusted（`"trusted"` | `"untrusted"`）。Untrusted projects 会跳过 project-scoped `.codex/` layers，包括 project-local config、hooks 和 rules。',
    },
    {
      key: "notice.hide_full_access_warning",
      type: "boolean",
      description: "跟踪 full access warning prompt 的 acknowledgement。",
    },
    {
      key: "notice.hide_world_writable_warning",
      type: "boolean",
      description:
        "跟踪 Windows world-writable directories warning 的 acknowledgement。",
    },
    {
      key: "notice.hide_rate_limit_model_nudge",
      type: "boolean",
      description: "跟踪 opt-out of the rate limit model switch reminder。",
    },
    {
      key: "notice.hide_gpt5_1_migration_prompt",
      type: "boolean",
      description: "跟踪 GPT-5.1 migration prompt 的 acknowledgement。",
    },
    {
      key: "notice.hide_gpt-5.1-codex-max_migration_prompt",
      type: "boolean",
      description:
        "跟踪 gpt-5.1-codex-max migration prompt 的 acknowledgement。",
    },
    {
      key: "notice.model_migrations",
      type: "map&lt;string,string&gt;",
      description: "以 old-&gt;new mappings 形式跟踪已确认的 model migrations。",
    },
    {
      key: "forced_login_method",
      type: "chatgpt | api",
      description: "将 Codex 限制为特定 authentication method。",
    },
    {
      key: "forced_chatgpt_workspace_id",
      type: "string (uuid)",
      description: "将 ChatGPT logins 限制到特定 workspace identifier。",
    },
  ]}
  client:load
/&gt;

你可以在[这里](https://developers.openai.com/codex/config-schema.json)找到 `config.toml` 的最新 JSON schema。

要在 VS Code 或 Cursor 中编辑 `config.toml` 时获得 autocompletion 和 diagnostics，可以安装 [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml) 扩展，并将此行添加到 `config.toml` 顶部：

```toml
#:schema https://developers.openai.com/codex/config-schema.json
```

注意：请将 `experimental_instructions_file` 重命名为 `model_instructions_file`。Codex 已弃用旧 key；请将现有配置更新为新名称。

## `requirements.toml`

`requirements.toml` 是管理员强制执行的配置文件，用于约束用户无法覆盖的安全敏感设置。有关详情、位置和示例，请参阅 [Admin-enforced requirements](/mirror/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml)。

对于 ChatGPT Business 和 Enterprise 用户，Codex 还可以应用从 cloud 获取的 requirements。有关优先级详情，请参阅安全页面。

在 `requirements.toml` 中使用 `[features]`，通过与 `config.toml` 相同的 canonical keys pin feature flags。省略的 keys 保持不受约束。

Managed permission-profile allowlists 需要 Codex 0.138.0 或更高版本。Codex 0.137.0 及更早版本会忽略 `allowed_permission_profiles` 和托管 `default_permissions`。

将 `allowed_sandbox_modes` 与 `sandbox_mode` 搭配使用。对于 permission-profile deployments，请将 `allowed_permission_profiles` 与托管 `default_permissions` 搭配使用。

&lt;ConfigTable
  options={[
    {
      key: "allowed_approval_policies",
      type: "array&lt;string&gt;",
      description:
        "允许的 `approval_policy` 值（例如 `untrusted`、`on-request`、`never` 和 `granular`）。",
    },
    {
      key: "allowed_approvals_reviewers",
      type: "array&lt;string&gt;",
      description:
        "`approvals_reviewer` 允许的值，例如 `user` 和 `auto_review`。",
    },
    {
      key: "guardian_policy_config",
      type: "string",
      description:
        "Automatic review 的 managed Markdown policy instructions。它优先于本地 `[auto_review].policy`。空白值会被忽略。",
    },
    {
      key: "allowed_permission_profiles",
      type: "table&lt;boolean&gt;",
      description:
        "允许的 permission profiles 的完整列表。设置为 `true` 的 profiles 被允许。省略或设置为 `false` 的 profiles 会被拒绝，包括未来版本中新增的 profiles。组合 requirements sources 时，entries 按 profile name 匹配。",
    },
    {
      key: "allowed_permission_profiles.&lt;name&gt;",
      type: "boolean",
      description:
        "允许或拒绝在已加载 config 或 requirements source 中定义的 built-in 或 custom permission profile。较早的 requirements source 可以使用 `false` 关闭较晚来源允许的 profile。",
    },
    {
      key: "default_permissions",
      type: "string",
      description:
        "托管默认 permission profile。该 profile 必须被 `allowed_permission_profiles` 允许。请显式设置它以获得可预测行为；如果省略，只有当 `:workspace` 和 `:read-only` 都被显式允许时，Codex 才默认使用 `:workspace`。",
    },
    {
      key: "enforce_residency",
      type: "string",
      description:
        "要求 Codex service traffic 使用受支持的数据驻留。目前接受 `us`。",
    },
    {
      key: "permissions",
      type: "table",
      description:
        "按 profile name keyed 的 admin-defined permission profiles。使用与 `config.toml` 相同的 profile fields。",
    },
    {
      key: "permissions.&lt;name&gt;",
      type: "table",
      description:
        "Admin-defined permission profile。名称不能以 `:` 开头、不能使用保留名称 `filesystem`，也不能与已加载 config 中的 profile 重名。使用与 `config.toml` 相同的 profile fields；完整 profile schema 请参阅 Permissions guide。",
    },
    {
      key: "allowed_sandbox_modes",
      type: "array&lt;string&gt;",
      description: "`sandbox_mode` 允许的值。",
    },
    {
      key: "windows",
      type: "table",
      description: "Native Windows sandbox requirements。",
    },
    {
      key: "windows.allowed_sandbox_implementations",
      type: "array&lt;string&gt;",
      description:
        "`windows.sandbox` 允许的 native Windows sandbox implementations（`elevated` 和 `unelevated`）。该列表不能为空。当两者都被允许且未选择 mode 时，Codex 优先使用 `elevated`。",
    },
    {
      key: "remote_sandbox_config",
      type: "array&lt;table&gt;",
      description:
        "Host-specific sandbox requirements。第一个 `hostname_patterns` 匹配解析出的 host name 的条目，会覆盖该 requirements source 的顶层 `allowed_sandbox_modes`。Host-specific entries 目前只覆盖 sandbox modes。",
    },
    {
      key: "remote_sandbox_config[].hostname_patterns",
      type: "array&lt;string&gt;",
      description:
        "不区分大小写的 host name patterns。支持 `*` 匹配任意字符序列，`?` 匹配一个字符。",
    },
    {
      key: "remote_sandbox_config[].allowed_sandbox_modes",
      type: "array&lt;string&gt;",
      description:
        "当此 host-specific entry 匹配时应用的 allowed sandbox modes。",
    },
    {
      key: "allowed_web_search_modes",
      type: "array&lt;string&gt;",
      description:
        "`web_search` 允许的值（`disabled`、`cached`、`live`）。`disabled` 始终被允许；空列表实际只允许 `disabled`。",
    },
    {
      key: "allow_managed_hooks_only",
      type: "boolean",
      description:
        "为 `true` 时，Codex 会跳过 user、project、session 和 plugin hooks，同时仍允许来自 `requirements.toml` 和其他 managed config layers 的 managed hooks。",
    },
    {
      key: "allow_appshots",
      type: "boolean",
      description:
        "设置为 `false` 可为受管用户禁用 Appshots。如果省略，Appshots 不受 requirements 约束，并遵循正常产品可用性。",
    },
    {
      key: "allow_remote_control",
      type: "boolean",
      description:
        "设置为 `false` 可为受管用户禁用 device remote control。如果省略，device remote control 不受 requirements 约束，并遵循正常产品可用性。",
    },
    {
      key: "features.plugin_sharing",
      type: "boolean",
      description:
        "在 cloud-managed `requirements.toml` 中设置为 `false`，可禁用 locally built plugins 的 workspace sharing。",
    },
    {
      key: "features",
      type: "table",
      description:
        "按 `config.toml` 的 `[features]` 表 canonical names keyed 的 pinned feature values。",
    },
    {
      key: "features.&lt;name&gt;",
      type: "boolean",
      description:
        "要求特定 canonical feature key 保持 enabled 或 disabled。",
    },
    {
      key: "features.apps",
      type: "boolean",
      description:
        "为受管用户 pin Apps integration availability on 或 off。",
    },
    {
      key: "features.in_app_browser",
      type: "boolean",
      description:
        "在 `requirements.toml` 中设置为 `false` 可禁用 in-app browser pane。",
    },
    {
      key: "features.browser_use",
      type: "boolean",
      description:
        "在 `requirements.toml` 中设置为 `false` 可禁用 Browser Use 和 Browser Agent 可用性。",
    },
    {
      key: "features.browser_use_external",
      type: "boolean",
      description:
        "在 `requirements.toml` 中设置为 `false` 可禁用 external-browser Browser Use 可用性。",
    },
    {
      key: "features.browser_use_full_cdp_access",
      type: "boolean",
      description:
        "在 `requirements.toml` 中设置为 `false`，可阻止用户在 Browser Developer mode 中启用完整 Chrome DevTools Protocol access。如果省略，则应用正常产品可用性。",
    },
    {
      key: "features.fast_mode",
      type: "boolean",
      description:
        "为受管用户 pin canonical `fast_mode` feature on 或 off。",
    },
    {
      key: "features.guardian_approval",
      type: "boolean",
      description:
        "为受管用户 pin Guardian approval availability on 或 off。",
    },
    {
      key: "features.memories",
      type: "boolean",
      description: "为受管用户 pin Memories availability on 或 off。",
    },
    {
      key: "features.multi_agent",
      type: "boolean",
      description: "为受管用户 pin multi-agent availability on 或 off。",
    },
    {
      key: "features.plugins",
      type: "boolean",
      description: "为受管用户 pin plugin availability on 或 off。",
    },
    {
      key: "features.computer_use",
      type: "boolean",
      description:
        "在 `requirements.toml` 中设置为 `false` 可禁用 Computer Use、Record & Replay 以及相关 install 或 enablement flows。",
    },
    {
      key: "features.workspace_dependencies",
      type: "boolean",
      description:
        "为受管用户 pin bundled workspace-dependency runtime availability on 或 off。",
    },
    {
      key: "computer_use",
      type: "table",
      description:
        "从 `requirements.toml` 强制执行的 Computer Use requirements。",
    },
    {
      key: "computer_use.allow_locked_computer_use",
      type: "boolean",
      description:
        "设置为 `false` 可阻止 Computer Use 在受管 macOS device 锁定后运行。如果省略，locked use 不受 requirements 约束。",
    },
    {
      key: "experimental_network",
      type: "table",
      description:
        "从 `requirements.toml` 强制执行的 network access requirements。这些约束独立于 `features.network_proxy`，并且可以在没有用户 feature flag 的情况下配置 sandboxed networking。",
    },
    {
      key: "experimental_network.enabled",
      type: "boolean",
      description:
        "启用 sandboxed networking requirements。当活动 sandbox 保持 command networking 关闭时，这不会授予 network access。",
    },
    {
      key: "experimental_network.http_port",
      type: "integer",
      description:
        "`[experimental_network]` requirements 使用的 loopback HTTP listener port。",
    },
    {
      key: "experimental_network.socks_port",
      type: "integer",
      description:
        "`[experimental_network]` requirements 使用的 loopback SOCKS5 listener port。",
    },
    {
      key: "experimental_network.allow_upstream_proxy",
      type: "boolean",
      description:
        "允许 sandboxed networking 通过环境中的 upstream proxy 串联。",
    },
    {
      key: "experimental_network.dangerously_allow_non_loopback_proxy",
      type: "boolean",
      description:
        "允许 `[experimental_network]` requirements 使用 non-loopback listener addresses。启用后可能会将 listeners 暴露到 localhost 之外。",
    },
    {
      key: "experimental_network.dangerously_allow_all_unix_sockets",
      type: "boolean",
      description:
        "允许任意 Unix socket destinations，而不是仅限 allowlist access。仅在严格受控环境中使用。",
    },
    {
      key: "experimental_network.domains",
      type: "map&lt;string, allow | deny&gt;",
      description:
        "Sandboxed networking 的 map-shaped administrator domain policy。支持 exact hosts、仅匹配 subdomains 的 `*.example.com`、匹配 apex 加 subdomains 的 `**.example.com`，以及 global `*` allow rules；请优先使用 scoped rules，因为 `*` 会广泛打开 public outbound access。冲突时 `deny` 获胜。不要将其与 `experimental_network.allowed_domains` 或 `experimental_network.denied_domains` 组合使用。",
    },
    {
      key: "experimental_network.allowed_domains",
      type: "array&lt;string&gt;",
      description:
        "Sandboxed networking 的 list-shaped administrator allow rules。不要将其与 `experimental_network.domains` 组合使用。",
    },
    {
      key: "experimental_network.denied_domains",
      type: "array&lt;string&gt;",
      description:
        "Sandboxed networking 的 list-shaped administrator deny rules。不要将其与 `experimental_network.domains` 组合使用。",
    },
    {
      key: "experimental_network.managed_allowed_domains_only",
      type: "boolean",
      description:
        "为 `true` 时，在 sandboxed networking requirements 处于活动状态期间，只有 administrator-managed allow rules 继续生效；用户 allowlist additions 会被忽略。没有 managed allow rules 时，用户添加的 domain allow rules 不会继续生效。",
    },
    {
      key: "experimental_network.unix_sockets",
      type: "map&lt;string, allow | deny&gt;",
      description:
        "Sandboxed networking 的 administrator-managed Unix socket policy。",
    },
    {
      key: "experimental_network.allow_local_binding",
      type: "boolean",
      description:
        "允许 sandboxed networking 进行更广泛的 local/private-network access。当此值保持 `false` 时，exact local IP literal 或 `localhost` allow rules 仍可允许特定本地目标。",
    },
    {
      key: "hooks",
      type: "table",
      description:
        "Admin-enforced managed lifecycle hooks。需要 managed hook directory，并使用与 `config.toml` 中 inline `[hooks]` 相同的 event schema。",
    },
    {
      key: "hooks.managed_dir",
      type: "string (absolute path)",
      description:
        "macOS 和 Linux 上包含 managed hook scripts 的目录。Codex 会在加载 managed hooks 前验证它是绝对路径且存在。",
    },
    {
      key: "hooks.windows_managed_dir",
      type: "string (absolute path)",
      description:
        "Windows 上包含 managed hook scripts 的目录。Codex 会在加载 managed hooks 前验证它是绝对路径且存在。",
    },
    {
      key: "hooks.&lt;Event&gt;",
      type: "array&lt;table&gt;",
      description:
        "Hook event 的 matcher groups，例如 `PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`SessionStart`、`SubagentStart`、`SubagentStop`、`UserPromptSubmit` 或 `Stop`。",
    },
    {
      key: "hooks.&lt;Event&gt;[].hooks",
      type: "array&lt;table&gt;",
      description:
        "Matcher group 的 hook handlers。目前支持 command hooks；prompt 和 agent hook handlers 会被解析但跳过。",
    },
    {
      key: "hooks.&lt;Event&gt;[].hooks[].commandWindows",
      type: "string",
      description:
        "Command hooks 的 Windows-only command override。也接受 TOML 别名 `command_windows`。",
    },
    {
      key: "permissions.filesystem.deny_read",
      type: "array&lt;string&gt;",
      description:
        "Admin-enforced filesystem read denials。Entries 可以是 paths 或 glob patterns，用户无法通过 local config 削弱它们。",
    },
    {
      key: "mcp_servers",
      type: "table",
      description:
        "可启用 MCP servers 的 allowlist。MCP server 必须同时匹配 server name（`&lt;id&gt;`）和 identity 才会启用。任何未在 allowlist 中的已配置 MCP server（或 identity 不匹配的 server）都会被禁用。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.identity",
      type: "table",
      description:
        "单个 MCP server 的 identity rule。设置 `command`（stdio）或 `url`（streamable HTTP）之一。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.identity.command",
      type: "string | table",
      description:
        "通过 exact command string 允许一个 MCP stdio server，或使用 matcher table 要求 exact executable 和 ordered argument matchers。字符串形式不会检查 arguments、`cwd`、`env` 或 `env_vars`。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.identity.command.executable",
      type: "string",
      description:
        "必须与 stdio server 已配置 `command` 精确匹配的 executable。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.identity.command.args",
      type: "array&lt;table&gt;",
      description:
        "Stdio server 的 ordered argument matchers。已配置 argument list 必须长度相同，并且每个位置都必须匹配。Command matchers 不会检查 `cwd`、`env` 或 `env_vars`。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.identity.command.args[].match",
      type: "exact | prefix | regex",
      description: "此 argument position 的 match operation。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.identity.command.args[].value",
      type: "string",
      description: "`exact` 或 `prefix` argument matcher 使用的值。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.identity.command.args[].expression",
      type: "string",
      description:
        "`regex` argument matcher 使用的 regular expression。该 expression 必须有效，并匹配完整 argument value。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.identity.url",
      type: "string | table",
      description:
        "通过 exact URL string 允许一个 MCP streamable HTTP server，或使用 `exact`、`prefix` 或 `regex` value matcher table。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.identity.url.match",
      type: "exact | prefix | regex",
      description: "已配置 MCP server URL 的 match operation。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.identity.url.value",
      type: "string",
      description: "`exact` 或 `prefix` URL matcher 使用的值。",
    },
    {
      key: "mcp_servers.&lt;id&gt;.identity.url.expression",
      type: "string",
      description:
        "`regex` URL matcher 使用的 regular expression。该 expression 必须有效，并匹配完整 URL value。",
    },
    {
      key: "plugins",
      type: "table",
      description:
        "按 plugin identifier keyed 的 plugin-specific MCP server allowlists。当此表存在时，没有匹配 plugin 和 server entry 的 plugin-bundled servers 会被禁用。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers",
      type: "table",
      description:
        "一个 plugin 捆绑的 MCP servers 的 allowlist。Plugin server requirements 使用与顶层 `mcp_servers` requirements 相同的 exact identity 和 matcher forms。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.identity",
      type: "table",
      description:
        "一个 plugin-bundled MCP server 的 identity rule。设置 `command`（stdio）或 `url`（streamable HTTP）之一。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.identity.command",
      type: "string | table",
      description:
        "通过 exact command string 允许 plugin 的 stdio MCP server，或使用 matcher table 要求 exact executable 和 ordered argument matchers。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.identity.command.executable",
      type: "string",
      description:
        "必须与 plugin-bundled stdio server 已配置 command 精确匹配的 executable。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.identity.command.args",
      type: "array&lt;table&gt;",
      description:
        "Plugin-bundled stdio server 的 ordered argument matchers。已配置 argument list 必须长度相同，并且每个位置都必须匹配。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.identity.command.args[].match",
      type: "exact | prefix | regex",
      description: "此 argument position 的 match operation。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.identity.command.args[].value",
      type: "string",
      description: "`exact` 或 `prefix` argument matcher 使用的值。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.identity.command.args[].expression",
      type: "string",
      description:
        "`regex` argument matcher 使用的 regular expression。该 expression 必须匹配完整 argument value。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.identity.url",
      type: "string | table",
      description:
        "通过 exact URL string 允许 plugin 的 streamable HTTP MCP server，或使用 `exact`、`prefix` 或 `regex` value matcher table。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.identity.url.match",
      type: "exact | prefix | regex",
      description: "Plugin-bundled MCP server URL 的 match operation。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.identity.url.value",
      type: "string",
      description: "`exact` 或 `prefix` URL matcher 使用的值。",
    },
    {
      key: "plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;.identity.url.expression",
      type: "string",
      description:
        "`regex` URL matcher 使用的 regular expression。该 expression 必须匹配完整 URL value。",
    },
    {
      key: "marketplaces",
      type: "table",
      description:
        "Plugin marketplace sources 的 admin requirements。当 `restrict_to_allowed_sources` 为 `true` 时，rules 生效。",
    },
    {
      key: "marketplaces.restrict_to_allowed_sources",
      type: "boolean",
      description:
        "为 `true` 时，要求 user-configured marketplace sources 在 marketplace add、plugin install 和 configured Git marketplace refresh operations 中匹配 `allowed_sources`。当 Codex-managed OpenAI marketplaces 的 reserved source 和 name 匹配时，它们仍被允许。这不会在运行时过滤已经配置的 user marketplaces。",
    },
    {
      key: "marketplaces.allowed_sources",
      type: "table",
      description:
        "按 administrator-chosen rule name keyed 的 allowed marketplace sources。不同 names 会跨 requirements layers 累积；同名下的 fields 使用正常 layer precedence。",
    },
    {
      key: "marketplaces.allowed_sources.&lt;name&gt;",
      type: "table",
      description:
        "一个 allowed source rule。Requirements merge 后的最终 `source` 值决定 Codex 解释哪些 sibling fields。",
    },
    {
      key: "marketplaces.allowed_sources.&lt;name&gt;.source",
      type: "git | host_pattern | local",
      description:
        "Marketplace source matcher type。使用 `git` 匹配一个 repository，使用 `host_pattern` 匹配由 regular expression 匹配的 Git hosts，或使用 `local` 匹配一个 directory。",
    },
    {
      key: "marketplaces.allowed_sources.&lt;name&gt;.url",
      type: "string",
      description:
        '当 `source = "git"` 时需要的 Git repository URL。Codex 会先规范化 configured 和 allowed URLs，再要求 exact repository match。',
    },
    {
      key: "marketplaces.allowed_sources.&lt;name&gt;.ref",
      type: "string",
      description:
        "用于 `git` rule 的可选 exact Git ref。省略时，该 rule 允许匹配 repository 的任何 ref。",
    },
    {
      key: "marketplaces.allowed_sources.&lt;name&gt;.host_pattern",
      type: "string",
      description:
        '当 `source = "host_pattern"` 时需要的 regular expression。Codex 会将它与从 HTTPS、SSH 或 SCP-style Git source 解析出的小写 hostname 匹配。请使用 `^` 和 `$` 要求 whole-host match。',
    },
    {
      key: "marketplaces.allowed_sources.&lt;name&gt;.path",
      type: "string (absolute path)",
      description:
        '当 `source = "local"` 时需要的 local marketplace directory。Codex 要求绝对路径，并在规范化后比较路径。',
    },
    {
      key: "apps",
      type: "table",
      description:
        "按 app identifier keyed 的 managed app requirements。Requirements 可以禁用 app，或约束 individual tools 的 approval behavior。",
    },
    {
      key: "apps.&lt;id&gt;.enabled",
      type: "boolean",
      description:
        "设置为 `false` 可禁用 app。当多个 requirements sources 合并时，disabled requirement 仍保持限制性。",
    },
    {
      key: "apps.&lt;id&gt;.tools.&lt;tool&gt;.approval_mode",
      type: "auto | prompt | approve",
      description: "为一个 app tool 设置 managed approval mode。",
    },
    {
      key: "rules",
      type: "table",
      description:
        "与 `.rules` files 合并的 admin-enforced command rules。Requirements rules 必须是限制性的。",
    },
    {
      key: "rules.prefix_rules",
      type: "array&lt;table&gt;",
      description:
        "Enforced prefix rules 列表。每条 rule 必须包含 `pattern` 和 `decision`。",
    },
    {
      key: "rules.prefix_rules[].pattern",
      type: "array&lt;table&gt;",
      description:
        "以 pattern tokens 表示的 command prefix。每个 token 设置 `token` 或 `any_of` 之一。",
    },
    {
      key: "rules.prefix_rules[].pattern[].token",
      type: "string",
      description: "此位置的单个 literal token。",
    },
    {
      key: "rules.prefix_rules[].pattern[].any_of",
      type: "array&lt;string&gt;",
      description: "此位置允许的 alternative tokens 列表。",
    },
    {
      key: "rules.prefix_rules[].decision",
      type: "prompt | forbidden",
      description:
        "必需。Requirements rules 只能 prompt 或 forbid（不能 allow）。",
    },
    {
      key: "rules.prefix_rules[].justification",
      type: "string",
      description:
        "在 approval prompts 或 rejection messages 中显示的可选非空理由。",
    },
  ]}
  client:load
/&gt;

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Use this page as a searchable reference for Codex configuration files. For conceptual guidance and examples, start with [Config basics](https://developers.openai.com/codex/config-basic) and [Advanced Config](https://developers.openai.com/codex/config-advanced).

## `config.toml`

User-level configuration lives in `~/.codex/config.toml`. You can also add project-scoped overrides in `.codex/config.toml` files. Codex loads project-scoped config files only when you trust the project.

Project-scoped config can't override machine-local provider, auth,
host-owned app request metadata, notification, configuration profile selection,
or telemetry routing keys. Codex ignores `openai_base_url`,
`chatgpt_base_url`, `apps_mcp_product_sku`, `model_provider`,
`model_providers`, `notify`, `profile`, `profiles`,
`experimental_realtime_ws_base_url`, and `otel` when they appear in a
project-local `.codex/config.toml`; put provider, notification, and telemetry
keys in user-level config instead. Config [profile files](https://developers.openai.com/codex/config-advanced#profiles) live next to
`config.toml` as `$CODEX_HOME/profile-name.config.toml`; select one with
`--profile profile-name`.

For sandbox and approval keys (`approval_policy`, `sandbox_mode`, and `sandbox_workspace_write.*`), pair this reference with [Sandbox and approvals](https://developers.openai.com/codex/agent-approvals-security#sandbox-and-approvals), [Protected paths in writable roots](https://developers.openai.com/codex/agent-approvals-security#protected-paths-in-writable-roots), and [Network access](https://developers.openai.com/codex/agent-approvals-security#network-access). For beta permission profiles, see [Permissions](https://developers.openai.com/codex/permissions).

<ConfigTable
  options={[
    {
      key: "model",
      type: "string",
      description: "Model to use (e.g., `gpt-5.5`).",
    },
    {
      key: "review_model",
      type: "string",
      description:
        "Optional model override used by `/review` (defaults to the current session model).",
    },
    {
      key: "model_provider",
      type: "string",
      description: "Provider id from `model_providers` (default: `openai`).",
    },
    {
      key: "openai_base_url",
      type: "string",
      description:
        "Base URL override for the built-in `openai` model provider.",
    },
    {
      key: "model_context_window",
      type: "number",
      description: "Context window tokens available to the active model.",
    },
    {
      key: "model_auto_compact_token_limit",
      type: "number",
      description:
        "Token threshold that triggers automatic history compaction (unset uses model defaults).",
    },
    {
      key: "model_catalog_json",
      type: "string (path)",
      description:
        "Optional path to a JSON model catalog loaded on startup. A selected `$CODEX_HOME/profile-name.config.toml` profile file can override this per profile.",
    },
    {
      key: "oss_provider",
      type: "lmstudio | ollama",
      description:
        "Default local provider used when running with `--oss` (defaults to prompting if unset).",
    },
    {
      key: "approval_policy",
      type: "untrusted | on-request | never | { granular = { sandbox_approval = bool, rules = bool, mcp_elicitations = bool, request_permissions = bool, skill_approval = bool } }",
      description:
        "Controls when Codex pauses for approval before executing commands. You can also use `approval_policy = { granular = { ... } }` to allow or auto-reject specific prompt categories while keeping other prompts interactive. `on-failure` is deprecated; use `on-request` for interactive runs or `never` for non-interactive runs.",
    },
    {
      key: "approval_policy.granular.sandbox_approval",
      type: "boolean",
      description:
        "When `true`, sandbox escalation approval prompts are allowed to surface.",
    },
    {
      key: "approval_policy.granular.rules",
      type: "boolean",
      description:
        "When `true`, approvals triggered by execpolicy `prompt` rules are allowed to surface.",
    },
    {
      key: "approval_policy.granular.mcp_elicitations",
      type: "boolean",
      description:
        "When `true`, MCP elicitation prompts are allowed to surface instead of being auto-rejected.",
    },
    {
      key: "approval_policy.granular.request_permissions",
      type: "boolean",
      description:
        "When `true`, prompts from the `request_permissions` tool are allowed to surface.",
    },
    {
      key: "approval_policy.granular.skill_approval",
      type: "boolean",
      description:
        "When `true`, skill-script approval prompts are allowed to surface.",
    },
    {
      key: "approvals_reviewer",
      type: "user | auto_review",
      description:
        "Who reviews eligible approval prompts under `on-request` or granular approval policies. Defaults to `user`; `auto_review` uses the reviewer subagent. This setting doesn't change sandboxing or review actions already allowed inside the sandbox.",
    },
    {
      key: "auto_review.policy",
      type: "string",
      description:
        "Local Markdown policy instructions for automatic review. Managed `guardian_policy_config` takes precedence. Blank values are ignored.",
    },
    {
      key: "allow_login_shell",
      type: "boolean",
      description:
        "Allow shell-based tools to use login-shell semantics. Defaults to `true`; when `false`, `login = true` requests are rejected and omitted `login` defaults to non-login shells.",
    },
    {
      key: "sandbox_mode",
      type: "read-only | workspace-write | danger-full-access",
      description:
        "Sandbox policy for filesystem and network access during command execution.",
    },
    {
      key: "sandbox_workspace_write.writable_roots",
      type: "array<string>",
      description:
        'Additional writable roots when `sandbox_mode = "workspace-write"`.',
    },
    {
      key: "sandbox_workspace_write.network_access",
      type: "boolean",
      description:
        "Allow outbound network access inside the workspace-write sandbox.",
    },
    {
      key: "sandbox_workspace_write.exclude_tmpdir_env_var",
      type: "boolean",
      description:
        "Exclude `$TMPDIR` from writable roots in workspace-write mode.",
    },
    {
      key: "sandbox_workspace_write.exclude_slash_tmp",
      type: "boolean",
      description:
        "Exclude `/tmp` from writable roots in workspace-write mode.",
    },
    {
      key: "windows.sandbox",
      type: "unelevated | elevated",
      description:
        "Windows-only native sandbox mode when running Codex natively on Windows.",
    },
    {
      key: "windows.sandbox_private_desktop",
      type: "boolean",
      description:
        "Run the final sandboxed child process on a private desktop by default on native Windows. Set `false` only for compatibility with the older `Winsta0\\\\Default` behavior.",
    },
    {
      key: "notify",
      type: "array<string>",
      description:
        "Command invoked for notifications; receives a JSON payload from Codex.",
    },
    {
      key: "check_for_update_on_startup",
      type: "boolean",
      description:
        "Check for Codex updates on startup (set to false only when updates are centrally managed).",
    },
    {
      key: "feedback.enabled",
      type: "boolean",
      description:
        "Enable feedback submission via `/feedback` across Codex surfaces (default: true).",
    },
    {
      key: "analytics.enabled",
      type: "boolean",
      description:
        "Enable or disable analytics for this machine/profile. When unset, the client default applies.",
    },
    {
      key: "instructions",
      type: "string",
      description:
        "Reserved for future use; prefer `model_instructions_file` or `AGENTS.md`.",
    },
    {
      key: "developer_instructions",
      type: "string",
      description:
        "Additional developer instructions injected into the session (optional).",
    },
    {
      key: "log_dir",
      type: "string (path)",
      description:
        "Directory where Codex writes log files; defaults to `$CODEX_HOME/log`. Setting this explicitly also enables the opt-in plaintext TUI log, `codex-tui.log`, in that directory.",
    },
    {
      key: "sqlite_home",
      type: "string (path)",
      description:
        "Directory where Codex stores the SQLite-backed state DB used by agent jobs and other resumable runtime state.",
    },
    {
      key: "compact_prompt",
      type: "string",
      description: "Inline override for the history compaction prompt.",
    },
    {
      key: "commit_attribution",
      type: "string",
      description:
        'Commit co-author trailer used when `[features].codex_git_commit` is enabled. Defaults to `Codex <noreply@openai.com>`; set `""` to disable.',
    },
    {
      key: "model_instructions_file",
      type: "string (path)",
      description:
        "Replacement for built-in instructions instead of `AGENTS.md`.",
    },
    {
      key: "personality",
      type: "none | friendly | pragmatic",
      description:
        "Default communication style for models that advertise `supportsPersonality`; can be overridden per thread/turn or via `/personality`.",
    },
    {
      key: "service_tier",
      type: "string",
      description:
        "Preferred service tier for new turns. Built-in values include `flex` and `fast`; legacy `fast` config maps to the request value `priority`, and catalog-provided tier IDs can also be stored.",
    },
    {
      key: "experimental_compact_prompt_file",
      type: "string (path)",
      description:
        "Load the compaction prompt override from a file (experimental).",
    },
    {
      key: "skills.config",
      type: "array<object>",
      description: "Per-skill enablement overrides stored in config.toml.",
    },
    {
      key: "skills.config.<index>.path",
      type: "string (path)",
      description: "Path to a skill folder containing `SKILL.md`.",
    },
    {
      key: "skills.config.<index>.enabled",
      type: "boolean",
      description: "Enable or disable the referenced skill.",
    },
    {
      key: "apps.<id>.enabled",
      type: "boolean",
      description:
        "Enable or disable a specific app/connector by id (default: true).",
    },
    {
      key: "apps._default.enabled",
      type: "boolean",
      description:
        "Default app enabled state for all apps unless overridden per app.",
    },
    {
      key: "apps._default.destructive_enabled",
      type: "boolean",
      description:
        "Default allow/deny for app tools with `destructive_hint = true`.",
    },
    {
      key: "apps._default.open_world_enabled",
      type: "boolean",
      description:
        "Default allow/deny for app tools with `open_world_hint = true`.",
    },
    {
      key: "apps._default.approvals_reviewer",
      type: "user | auto_review",
      description:
        "Default reviewer for app tool approval prompts unless overridden per app. When omitted, apps inherit the top-level `approvals_reviewer` value.",
    },
    {
      key: "apps._default.default_tools_approval_mode",
      type: "auto | prompt | approve",
      description:
        "Default approval behavior for app tools without per-app or per-tool overrides.",
    },
    {
      key: "apps.<id>.destructive_enabled",
      type: "boolean",
      description:
        "Allow or block tools in this app that advertise `destructive_hint = true`.",
    },
    {
      key: "apps.<id>.open_world_enabled",
      type: "boolean",
      description:
        "Allow or block tools in this app that advertise `open_world_hint = true`.",
    },
    {
      key: "apps.<id>.default_tools_enabled",
      type: "boolean",
      description:
        "Default enabled state for tools in this app unless a per-tool override exists.",
    },
    {
      key: "apps.<id>.approvals_reviewer",
      type: "user | auto_review",
      description:
        "Reviewer for this app's tool approval prompts. Overrides `apps._default.approvals_reviewer`.",
    },
    {
      key: "apps.<id>.default_tools_approval_mode",
      type: "auto | prompt | approve",
      description:
        "Default approval behavior for tools in this app unless a per-tool override exists.",
    },
    {
      key: "apps.<id>.tools.<tool>.enabled",
      type: "boolean",
      description:
        "Per-tool enabled override for an app tool (for example `repos/list`).",
    },
    {
      key: "apps.<id>.tools.<tool>.approval_mode",
      type: "auto | prompt | approve",
      description: "Per-tool approval behavior override for a single app tool.",
    },
    {
      key: "tool_suggest.discoverables",
      type: "array<table>",
      description:
        'Allow tool suggestions for additional discoverable connectors or plugins. Each entry uses `type = "connector"` or `"plugin"` and an `id`.',
    },
    {
      key: "tool_suggest.disabled_tools",
      type: "array<table>",
      description:
        'Disable suggestions for specific discoverable connectors or plugins. Each entry uses `type = "connector"` or `"plugin"` and an `id`.',
    },
    {
      key: "features.apps",
      type: "boolean",
      description: "Enable ChatGPT Apps/connectors support (experimental).",
    },
    {
      key: "features.hooks",
      type: "boolean",
      description:
        "Enable lifecycle hooks loaded from `hooks.json` or inline `[hooks]` config. `features.codex_hooks` is a deprecated alias.",
    },
    {
      key: "features.codex_git_commit",
      type: "boolean",
      description:
        "Enable Codex-generated git commits. When enabled, Codex uses `commit_attribution` to append a `Co-authored-by:` trailer to generated commit messages.",
    },
    {
      key: "features.code_mode.enabled",
      type: "boolean",
      description:
        "Enable code mode feature configuration. This feature is under development and off by default.",
    },
    {
      key: "features.code_mode.excluded_tool_namespaces",
      type: "array<string>",
      description:
        "Tool namespaces code mode excludes from nested code-mode tool guidance and executor exposure.",
    },
    {
      key: "features.code_mode.direct_only_tool_namespaces",
      type: "array<string>",
      description:
        "Tool namespaces code mode can use only through direct tool calls.",
    },
    {
      key: "features.rollout_budget.enabled",
      type: "boolean",
      description:
        "Enable rollout budget tracking. This feature is under development and off by default. When enabled, `features.rollout_budget.limit_tokens` is required.",
    },
    {
      key: "features.rollout_budget.limit_tokens",
      type: "integer",
      description:
        "Positive token limit for rollout budget tracking. Required when rollout budget is enabled.",
    },
    {
      key: "features.rollout_budget.reminder_interval_tokens",
      type: "integer",
      description:
        "Positive token interval between rollout budget reminders. Defaults to 10% of `limit_tokens`, with a minimum of 1 token.",
    },
    {
      key: "features.rollout_budget.sampling_token_weight",
      type: "number",
      description:
        "Finite non-negative multiplier for sampled tokens in rollout budget accounting. Defaults to `1.0`.",
    },
    {
      key: "features.rollout_budget.prefill_token_weight",
      type: "number",
      description:
        "Finite non-negative multiplier for prefill tokens in rollout budget accounting. Defaults to `1.0`.",
    },
    {
      key: "hooks",
      type: "table",
      description:
        "Lifecycle hooks configured inline in `config.toml`. Uses the same event schema as `hooks.json`; see the Hooks guide for examples and supported events.",
    },
    {
      key: "hooks.<Event>",
      type: "array<table>",
      description:
        "Matcher groups for hook events such as `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PreCompact`, `PostCompact`, `SessionStart`, `SubagentStart`, `SubagentStop`, `UserPromptSubmit`, or `Stop`.",
    },
    {
      key: "hooks.<Event>[].hooks",
      type: "array<table>",
      description:
        "Hook handlers for a matcher group. Command hooks are currently supported; prompt and agent hook handlers are parsed but skipped.",
    },
    {
      key: "hooks.<Event>[].hooks[].commandWindows",
      type: "string",
      description:
        "Windows-only command override for command hooks. The TOML alias `command_windows` is also accepted.",
    },
    {
      key: "features.memories",
      type: "boolean",
      description: "Enable [Memories](https://developers.openai.com/codex/memories) (off by default).",
    },
    {
      key: "mcp_servers.<id>.command",
      type: "string",
      description: "Launcher command for an MCP stdio server.",
    },
    {
      key: "mcp_servers.<id>.args",
      type: "array<string>",
      description: "Arguments passed to the MCP stdio server command.",
    },
    {
      key: "mcp_servers.<id>.env",
      type: "map<string,string>",
      description: "Environment variables forwarded to the MCP stdio server.",
    },
    {
      key: "mcp_servers.<id>.env_vars",
      type: 'array<string | { name = string, source = "local" | "remote" }>',
      description:
        'Additional environment variables to whitelist for an MCP stdio server. String entries default to `source = "local"`; use `source = "remote"` only with executor-backed remote stdio.',
    },
    {
      key: "mcp_servers.<id>.cwd",
      type: "string",
      description: "Working directory for the MCP stdio server process.",
    },
    {
      key: "mcp_servers.<id>.url",
      type: "string",
      description: "Endpoint for an MCP streamable HTTP server.",
    },
    {
      key: "mcp_servers.<id>.bearer_token_env_var",
      type: "string",
      description:
        "Environment variable sourcing the bearer token for an MCP HTTP server.",
    },
    {
      key: "mcp_servers.<id>.http_headers",
      type: "map<string,string>",
      description: "Static HTTP headers included with each MCP HTTP request.",
    },
    {
      key: "mcp_servers.<id>.env_http_headers",
      type: "map<string,string>",
      description:
        "HTTP headers populated from environment variables for an MCP HTTP server.",
    },
    {
      key: "mcp_servers.<id>.enabled",
      type: "boolean",
      description: "Disable an MCP server without removing its configuration.",
    },
    {
      key: "mcp_servers.<id>.required",
      type: "boolean",
      description:
        "When true, fail startup/resume if this enabled MCP server cannot initialize.",
    },
    {
      key: "mcp_servers.<id>.startup_timeout_sec",
      type: "number",
      description:
        "Override the default 10s startup timeout for an MCP server.",
    },
    {
      key: "mcp_servers.<id>.startup_timeout_ms",
      type: "number",
      description: "Alias for `startup_timeout_sec` in milliseconds.",
    },
    {
      key: "mcp_servers.<id>.tool_timeout_sec",
      type: "number",
      description:
        "Override the default 60s per-tool timeout for an MCP server.",
    },
    {
      key: "mcp_servers.<id>.enabled_tools",
      type: "array<string>",
      description: "Allow list of tool names exposed by the MCP server.",
    },
    {
      key: "mcp_servers.<id>.disabled_tools",
      type: "array<string>",
      description:
        "Deny list applied after `enabled_tools` for the MCP server.",
    },
    {
      key: "mcp_servers.<id>.default_tools_approval_mode",
      type: "auto | prompt | approve",
      description:
        "Default approval behavior for MCP tools on this server unless a per-tool override exists.",
    },
    {
      key: "mcp_servers.<id>.tools.<tool>.approval_mode",
      type: "auto | prompt | approve",
      description:
        "Per-tool approval behavior override for one MCP tool on this server.",
    },
    {
      key: "mcp_servers.<id>.scopes",
      type: "array<string>",
      description:
        "OAuth scopes to request when authenticating to that MCP server.",
    },
    {
      key: "mcp_servers.<id>.oauth_resource",
      type: "string",
      description:
        "Optional RFC 8707 OAuth resource parameter to include during MCP login.",
    },
    {
      key: "mcp_servers.<id>.experimental_environment",
      type: "local | remote",
      description:
        "Experimental placement for an MCP server. `remote` starts stdio servers through a remote executor environment; streamable HTTP remote placement is not implemented.",
    },
    {
      key: "agents.max_threads",
      type: "number",
      description:
        "Maximum number of agent threads that can be open concurrently. Defaults to `6` when unset.",
    },
    {
      key: "agents.max_depth",
      type: "number",
      description:
        "Maximum nesting depth allowed for spawned agent threads (root sessions start at depth 0; default: 1).",
    },
    {
      key: "agents.job_max_runtime_seconds",
      type: "number",
      description:
        "Default per-worker timeout for `spawn_agents_on_csv` jobs. When unset, the tool falls back to 1800 seconds per worker.",
    },
    {
      key: "agents.<name>.description",
      type: "string",
      description:
        "Role guidance shown to Codex when choosing and spawning that agent type.",
    },
    {
      key: "agents.<name>.config_file",
      type: "string (path)",
      description:
        "Path to a TOML config layer for that role; relative paths resolve from the config file that declares the role.",
    },
    {
      key: "agents.<name>.nickname_candidates",
      type: "array<string>",
      description:
        "Optional pool of display nicknames for spawned agents in that role.",
    },
    {
      key: "memories.generate_memories",
      type: "boolean",
      description:
        "When `false`, newly created threads are not stored as memory-generation inputs. Defaults to `true`.",
    },
    {
      key: "memories.use_memories",
      type: "boolean",
      description:
        "When `false`, Codex skips injecting existing memories into future sessions. Defaults to `true`.",
    },
    {
      key: "memories.disable_on_external_context",
      type: "boolean",
      description:
        "When `true`, threads that use external context such as MCP tool calls, web search, or tool search are kept out of memory generation. Defaults to `false`. Legacy alias: `memories.no_memories_if_mcp_or_web_search`.",
    },
    {
      key: "memories.max_raw_memories_for_consolidation",
      type: "number",
      description:
        "Maximum recent raw memories retained for global consolidation. Defaults to `256` and is capped at `4096`.",
    },
    {
      key: "memories.max_unused_days",
      type: "number",
      description:
        "Maximum days since a memory was last used before it becomes ineligible for consolidation. Defaults to `30` and is clamped to `0`-`365`.",
    },
    {
      key: "memories.max_rollout_age_days",
      type: "number",
      description:
        "Maximum age of threads considered for memory generation. Defaults to `30` and is clamped to `0`-`90`.",
    },
    {
      key: "memories.max_rollouts_per_startup",
      type: "number",
      description:
        "Maximum rollout candidates processed per startup pass. Defaults to `16` and is capped at `128`.",
    },
    {
      key: "memories.min_rollout_idle_hours",
      type: "number",
      description:
        "Minimum idle time before a thread is considered for memory generation. Defaults to `6` and is clamped to `1`-`48`.",
    },
    {
      key: "memories.min_rate_limit_remaining_percent",
      type: "number",
      description:
        "Minimum remaining percentage required in Codex rate-limit windows before memory generation starts. Defaults to `25` and is clamped to `0`-`100`.",
    },
    {
      key: "memories.extract_model",
      type: "string",
      description: "Optional model override for per-thread memory extraction.",
    },
    {
      key: "memories.consolidation_model",
      type: "string",
      description: "Optional model override for global memory consolidation.",
    },
    {
      key: "features.unified_exec",
      type: "boolean",
      description:
        "Use the unified PTY-backed exec tool (stable; enabled by default except on Windows).",
    },
    {
      key: "features.shell_snapshot",
      type: "boolean",
      description:
        "Snapshot shell environment to speed up repeated commands (stable; on by default).",
    },
    {
      key: "features.undo",
      type: "boolean",
      description: "Enable undo support (stable; off by default).",
    },
    {
      key: "features.multi_agent",
      type: "boolean",
      description:
        "Enable multi-agent collaboration tools (`spawn_agent`, `send_input`, `resume_agent`, `wait_agent`, and `close_agent`) (stable; on by default).",
    },
    {
      key: "features.personality",
      type: "boolean",
      description:
        "Enable personality selection controls (stable; on by default).",
    },
    {
      key: "features.network_proxy",
      type: "boolean | table",
      description:
        "Enable sandboxed networking. Use a table form when setting network policy options such as `domains` (experimental; off by default).",
    },
    {
      key: "features.network_proxy.enabled",
      type: "boolean",
      description: "Enable sandboxed networking. Defaults to `false`.",
    },
    {
      key: "features.network_proxy.domains",
      type: "map<string, allow | deny>",
      description:
        "Domain policy for sandboxed networking. Unset by default, which means no external destinations are allowed until you add `allow` rules. Supports exact hosts, `*.example.com` for subdomains only, `**.example.com` for apex plus subdomains, and global `*` allow rules; prefer scoped rules because `*` broadly opens public outbound access. Add `deny` rules for blocked destinations; `deny` wins on conflicts.",
    },
    {
      key: "features.network_proxy.unix_sockets",
      type: "map<string, allow | deny>",
      description:
        "Unix socket policy for sandboxed networking. Unset by default; add `allow` entries for permitted sockets.",
    },
    {
      key: "features.network_proxy.allow_local_binding",
      type: "boolean",
      description:
        "Allow broader local/private-network access. Defaults to `false`; exact local IP literal or `localhost` allow rules can still permit specific local targets.",
    },
    {
      key: "features.network_proxy.enable_socks5",
      type: "boolean",
      description: "Expose SOCKS5 support. Defaults to `true`.",
    },
    {
      key: "features.network_proxy.enable_socks5_udp",
      type: "boolean",
      description: "Allow UDP over SOCKS5. Defaults to `true`.",
    },
    {
      key: "features.network_proxy.allow_upstream_proxy",
      type: "boolean",
      description:
        "Allow chaining through an upstream proxy from the environment. Defaults to `true`.",
    },
    {
      key: "features.network_proxy.dangerously_allow_non_loopback_proxy",
      type: "boolean",
      description:
        "Permit non-loopback listener addresses. Defaults to `false`; enabling it can expose proxy listeners beyond localhost.",
    },
    {
      key: "features.network_proxy.dangerously_allow_all_unix_sockets",
      type: "boolean",
      description:
        "Permit arbitrary Unix socket destinations instead of allowlist-only access. Defaults to `false`; use only in tightly controlled environments.",
    },
    {
      key: "features.network_proxy.proxy_url",
      type: "string",
      description:
        'HTTP listener URL for sandboxed networking. Defaults to `"http://127.0.0.1:3128"`.',
    },
    {
      key: "features.network_proxy.socks_url",
      type: "string",
      description:
        'SOCKS5 listener URL. Defaults to `"http://127.0.0.1:8081"`.',
    },
    {
      key: "features.web_search",
      type: "boolean",
      description:
        "Deprecated legacy toggle; prefer the top-level `web_search` setting.",
    },
    {
      key: "features.web_search_cached",
      type: "boolean",
      description:
        'Deprecated legacy toggle. When `web_search` is unset, true maps to `web_search = "cached"`.',
    },
    {
      key: "features.web_search_request",
      type: "boolean",
      description:
        'Deprecated legacy toggle. When `web_search` is unset, true maps to `web_search = "live"`.',
    },
    {
      key: "features.shell_tool",
      type: "boolean",
      description:
        "Enable the default `shell` tool for running commands (stable; on by default).",
    },
    {
      key: "features.enable_request_compression",
      type: "boolean",
      description:
        "Compress streaming request bodies with zstd when supported (stable; on by default).",
    },
    {
      key: "features.skill_mcp_dependency_install",
      type: "boolean",
      description:
        "Allow prompting and installing missing MCP dependencies for skills (stable; on by default).",
    },
    {
      key: "features.fast_mode",
      type: "boolean",
      description:
        "Enable model-catalog service tier selection in the TUI, including Fast-tier commands when the active model advertises them (stable; on by default).",
    },
    {
      key: "features.prevent_idle_sleep",
      type: "boolean",
      description:
        "Prevent the machine from sleeping while a turn is actively running (experimental; off by default).",
    },
    {
      key: "suppress_unstable_features_warning",
      type: "boolean",
      description:
        "Suppress the warning that appears when under-development feature flags are enabled.",
    },
    {
      key: "model_providers.<id>",
      type: "table",
      description:
        "Custom provider definition. Built-in provider IDs (`openai`, `ollama`, and `lmstudio`) are reserved and cannot be overridden.",
    },
    {
      key: "model_providers.<id>.name",
      type: "string",
      description: "Display name for a custom model provider.",
    },
    {
      key: "model_providers.<id>.base_url",
      type: "string",
      description: "API base URL for the model provider.",
    },
    {
      key: "model_providers.<id>.env_key",
      type: "string",
      description: "Environment variable supplying the provider API key.",
    },
    {
      key: "model_providers.<id>.env_key_instructions",
      type: "string",
      description: "Optional setup guidance for the provider API key.",
    },
    {
      key: "model_providers.<id>.experimental_bearer_token",
      type: "string",
      description:
        "Direct bearer token for the provider (discouraged; use `env_key`).",
    },
    {
      key: "model_providers.<id>.requires_openai_auth",
      type: "boolean",
      description:
        "The provider uses OpenAI authentication (defaults to false).",
    },
    {
      key: "model_providers.<id>.wire_api",
      type: "responses",
      description:
        "Protocol used by the provider. `responses` is the only supported value, and it is the default when omitted.",
    },
    {
      key: "model_providers.<id>.query_params",
      type: "map<string,string>",
      description: "Extra query parameters appended to provider requests.",
    },
    {
      key: "model_providers.<id>.http_headers",
      type: "map<string,string>",
      description: "Static HTTP headers added to provider requests.",
    },
    {
      key: "model_providers.<id>.env_http_headers",
      type: "map<string,string>",
      description:
        "HTTP headers populated from environment variables when present.",
    },
    {
      key: "model_providers.<id>.request_max_retries",
      type: "number",
      description:
        "Retry count for HTTP requests to the provider (default: 4).",
    },
    {
      key: "model_providers.<id>.stream_max_retries",
      type: "number",
      description: "Retry count for SSE streaming interruptions (default: 5).",
    },
    {
      key: "model_providers.<id>.stream_idle_timeout_ms",
      type: "number",
      description:
        "Idle timeout for SSE streams in milliseconds (default: 300000).",
    },
    {
      key: "model_providers.<id>.supports_websockets",
      type: "boolean",
      description:
        "Whether that provider supports the Responses API WebSocket transport.",
    },
    {
      key: "model_providers.<id>.auth",
      type: "table",
      description:
        "Command-backed bearer token configuration for a custom provider. Do not combine with `env_key`, `experimental_bearer_token`, or `requires_openai_auth`.",
    },
    {
      key: "model_providers.<id>.auth.command",
      type: "string",
      description:
        "Command to run when Codex needs a bearer token. The command must print the token to stdout.",
    },
    {
      key: "model_providers.<id>.auth.args",
      type: "array<string>",
      description: "Arguments passed to the token command.",
    },
    {
      key: "model_providers.<id>.auth.timeout_ms",
      type: "number",
      description:
        "Maximum token command runtime in milliseconds (default: 5000).",
    },
    {
      key: "model_providers.<id>.auth.refresh_interval_ms",
      type: "number",
      description:
        "How often Codex proactively refreshes the token in milliseconds (default: 300000). Set to `0` to refresh only after an authentication retry.",
    },
    {
      key: "model_providers.<id>.auth.cwd",
      type: "string (path)",
      description: "Working directory for the token command.",
    },
    {
      key: "model_providers.amazon-bedrock.aws.profile",
      type: "string",
      description:
        "AWS profile name used by the built-in `amazon-bedrock` provider.",
    },
    {
      key: "model_providers.amazon-bedrock.aws.region",
      type: "string",
      description: "AWS region used by the built-in `amazon-bedrock` provider.",
    },
    {
      key: "model_reasoning_effort",
      type: "minimal | low | medium | high | xhigh",
      description:
        "Adjust reasoning effort for supported models (Responses API only; `xhigh` is model-dependent).",
    },
    {
      key: "plan_mode_reasoning_effort",
      type: "none | minimal | low | medium | high | xhigh",
      description:
        "Plan-mode-specific reasoning override. When unset, Plan mode uses its built-in preset default.",
    },
    {
      key: "model_reasoning_summary",
      type: "auto | concise | detailed | none",
      description:
        "Select reasoning summary detail or disable summaries entirely.",
    },
    {
      key: "model_verbosity",
      type: "low | medium | high",
      description:
        "Optional GPT-5 Responses API verbosity override; when unset, the selected model/preset default is used.",
    },
    {
      key: "model_supports_reasoning_summaries",
      type: "boolean",
      description: "Force Codex to send or not send reasoning metadata.",
    },
    {
      key: "shell_environment_policy.inherit",
      type: "all | core | none",
      description:
        "Baseline environment inheritance when spawning subprocesses.",
    },
    {
      key: "shell_environment_policy.ignore_default_excludes",
      type: "boolean",
      description:
        "Keep variables containing KEY/SECRET/TOKEN before other filters run.",
    },
    {
      key: "shell_environment_policy.exclude",
      type: "array<string>",
      description:
        "Glob patterns for removing environment variables after the defaults.",
    },
    {
      key: "shell_environment_policy.include_only",
      type: "array<string>",
      description:
        "Whitelist of patterns; when set only matching variables are kept.",
    },
    {
      key: "shell_environment_policy.set",
      type: "map<string,string>",
      description:
        "Explicit environment overrides injected into every subprocess.",
    },
    {
      key: "shell_environment_policy.experimental_use_profile",
      type: "boolean",
      description: "Use the user shell profile when spawning subprocesses.",
    },
    {
      key: "project_root_markers",
      type: "array<string>",
      description:
        "List of project root marker filenames; used when searching parent directories for the project root.",
    },
    {
      key: "project_doc_max_bytes",
      type: "number",
      description:
        "Maximum bytes read from `AGENTS.md` when building project instructions.",
    },
    {
      key: "project_doc_fallback_filenames",
      type: "array<string>",
      description: "Additional filenames to try when `AGENTS.md` is missing.",
    },
    {
      key: "history.persistence",
      type: "save-all | none",
      description:
        "Control whether Codex saves session transcripts to history.jsonl.",
    },
    {
      key: "tool_output_token_limit",
      type: "number",
      description:
        "Token budget for storing individual tool/function outputs in history.",
    },
    {
      key: "background_terminal_max_timeout",
      type: "number",
      description:
        "Maximum poll window in milliseconds for empty `write_stdin` polls (background terminal polling). Default: `300000` (5 minutes). Replaces the older `background_terminal_timeout` key.",
    },
    {
      key: "history.max_bytes",
      type: "number",
      description:
        "If set, caps the history file size in bytes by dropping oldest entries.",
    },
    {
      key: "file_opener",
      type: "vscode | vscode-insiders | windsurf | cursor | none",
      description:
        "URI scheme used to open citations from Codex output (default: `vscode`).",
    },
    {
      key: "otel.environment",
      type: "string",
      description:
        "Environment tag applied to emitted OpenTelemetry events (default: `dev`).",
    },
    {
      key: "otel.exporter",
      type: "none | otlp-http | otlp-grpc",
      description:
        "Select the OpenTelemetry exporter and provide any endpoint metadata.",
    },
    {
      key: "otel.trace_exporter",
      type: "none | otlp-http | otlp-grpc",
      description:
        "Select the OpenTelemetry trace exporter and provide any endpoint metadata.",
    },
    {
      key: "otel.metrics_exporter",
      type: "none | statsig | otlp-http | otlp-grpc",
      description:
        "Select the OpenTelemetry metrics exporter (defaults to `statsig`).",
    },
    {
      key: "otel.log_user_prompt",
      type: "boolean",
      description:
        "Opt in to exporting raw user prompts with OpenTelemetry logs.",
    },
    {
      key: "otel.exporter.<id>.endpoint",
      type: "string",
      description: "Exporter endpoint for OTEL logs.",
    },
    {
      key: "otel.exporter.<id>.protocol",
      type: "binary | json",
      description: "Protocol used by the OTLP/HTTP exporter.",
    },
    {
      key: "otel.exporter.<id>.headers",
      type: "map<string,string>",
      description: "Static headers included with OTEL exporter requests.",
    },
    {
      key: "otel.trace_exporter.<id>.endpoint",
      type: "string",
      description: "Trace exporter endpoint for OTEL logs.",
    },
    {
      key: "otel.trace_exporter.<id>.protocol",
      type: "binary | json",
      description: "Protocol used by the OTLP/HTTP trace exporter.",
    },
    {
      key: "otel.trace_exporter.<id>.headers",
      type: "map<string,string>",
      description: "Static headers included with OTEL trace exporter requests.",
    },
    {
      key: "otel.exporter.<id>.tls.ca-certificate",
      type: "string",
      description: "CA certificate path for OTEL exporter TLS.",
    },
    {
      key: "otel.exporter.<id>.tls.client-certificate",
      type: "string",
      description: "Client certificate path for OTEL exporter TLS.",
    },
    {
      key: "otel.exporter.<id>.tls.client-private-key",
      type: "string",
      description: "Client private key path for OTEL exporter TLS.",
    },
    {
      key: "otel.trace_exporter.<id>.tls.ca-certificate",
      type: "string",
      description: "CA certificate path for OTEL trace exporter TLS.",
    },
    {
      key: "otel.trace_exporter.<id>.tls.client-certificate",
      type: "string",
      description: "Client certificate path for OTEL trace exporter TLS.",
    },
    {
      key: "otel.trace_exporter.<id>.tls.client-private-key",
      type: "string",
      description: "Client private key path for OTEL trace exporter TLS.",
    },
    {
      key: "tui",
      type: "table",
      description:
        "TUI-specific options such as enabling inline desktop notifications.",
    },
    {
      key: "tui.notifications",
      type: "boolean | array<string>",
      description:
        "Enable TUI notifications; optionally restrict to specific event types.",
    },
    {
      key: "tui.notification_method",
      type: "auto | osc9 | bel",
      description:
        "Notification method for terminal notifications (default: auto).",
    },
    {
      key: "tui.notification_condition",
      type: "unfocused | always",
      description:
        "Control whether TUI notifications fire only when the terminal is unfocused or regardless of focus. Defaults to `unfocused`.",
    },
    {
      key: "tui.animations",
      type: "boolean",
      description:
        "Enable terminal animations (welcome screen, shimmer, spinner) (default: true).",
    },
    {
      key: "tui.alternate_screen",
      type: "auto | always | never",
      description:
        "Control alternate screen usage for the TUI (default: auto; auto skips it in Zellij to preserve scrollback).",
    },
    {
      key: "tui.vim_mode_default",
      type: "boolean",
      description:
        "Start the composer in Vim normal mode instead of insert mode (default: false). You can still toggle it per session with `/vim`.",
    },
    {
      key: "tui.raw_output_mode",
      type: "boolean",
      description:
        "Start the TUI in raw scrollback mode for copy-friendly terminal selection (default: false). You can toggle it with `/raw` or the default `alt-r` key binding.",
    },
    {
      key: "tui.show_tooltips",
      type: "boolean",
      description:
        "Show onboarding tooltips in the TUI welcome screen (default: true).",
    },
    {
      key: "tui.status_line",
      type: "array<string> | null",
      description:
        "Ordered list of TUI footer status-line item identifiers. `null` disables the status line.",
    },
    {
      key: "tui.terminal_title",
      type: "array<string> | null",
      description:
        'Ordered list of terminal window/tab title item identifiers. Defaults to `["spinner", "project"]`; `null` disables title updates.',
    },
    {
      key: "tui.theme",
      type: "string",
      description:
        "Syntax-highlighting theme override (kebab-case theme name).",
    },
    {
      key: "tui.keymap.<context>.<action>",
      type: "string | array<string>",
      description:
        "Keyboard shortcut binding for a TUI action. Supported contexts include `global`, `chat`, `composer`, `editor`, `vim_normal`, `vim_operator`, `vim_text_object`, `pager`, `list`, and `approval`. Selected composer actions fall back to matching `tui.keymap.global` bindings; context-specific bindings take precedence when supported.",
    },
    {
      key: "tui.keymap.<context>.<action> = []",
      type: "empty array",
      description:
        "Unbind the action in that keymap context. Key names use normalized strings such as `ctrl-a`, `shift-enter`, `page-down`, or `minus`.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.enabled",
      type: "boolean",
      description:
        "Enable or disable an MCP server bundled by an installed plugin without changing the plugin manifest.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.default_tools_approval_mode",
      type: "auto | prompt | approve",
      description:
        "Default approval behavior for tools on a plugin-provided MCP server.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.enabled_tools",
      type: "array<string>",
      description:
        "Allow list of tools exposed from a plugin-provided MCP server.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.disabled_tools",
      type: "array<string>",
      description:
        "Deny list applied after `enabled_tools` for a plugin-provided MCP server.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.tools.<tool>.approval_mode",
      type: "auto | prompt | approve",
      description:
        "Per-tool approval behavior override for a plugin-provided MCP tool.",
    },
    {
      key: "tui.model_availability_nux.<model>",
      type: "integer",
      description: "Internal startup-tooltip state keyed by model slug.",
    },
    {
      key: "hide_agent_reasoning",
      type: "boolean",
      description:
        "Suppress reasoning events in both the TUI and `codex exec` output.",
    },
    {
      key: "show_raw_agent_reasoning",
      type: "boolean",
      description:
        "Surface raw reasoning content when the active model emits it.",
    },
    {
      key: "disable_paste_burst",
      type: "boolean",
      description: "Disable burst-paste detection in the TUI.",
    },
    {
      key: "windows_wsl_setup_acknowledged",
      type: "boolean",
      description: "Track Windows onboarding acknowledgement (Windows only).",
    },
    {
      key: "chatgpt_base_url",
      type: "string",
      description: "Override the base URL used during the ChatGPT login flow.",
    },
    {
      key: "cli_auth_credentials_store",
      type: "file | keyring | auto",
      description:
        "Control where the CLI stores cached credentials (file-based auth.json vs OS keychain).",
    },
    {
      key: "mcp_oauth_credentials_store",
      type: "auto | file | keyring",
      description: "Preferred store for MCP OAuth credentials.",
    },
    {
      key: "mcp_oauth_callback_port",
      type: "integer",
      description:
        "Optional fixed port for the local HTTP callback server used during MCP OAuth login. When unset, Codex binds to an ephemeral port chosen by the OS.",
    },
    {
      key: "mcp_oauth_callback_url",
      type: "string",
      description:
        "Optional base callback URL override for MCP OAuth login (for example, a devbox ingress URL). Codex appends a server-specific callback ID before sending the final OAuth `redirect_uri`, so register the full derived URI with your provider. `mcp_oauth_callback_port` still controls the callback listener port.",
    },
    {
      key: "experimental_use_unified_exec_tool",
      type: "boolean",
      description:
        "Legacy name for enabling unified exec; prefer `[features].unified_exec` or `codex --enable unified_exec`.",
    },
    {
      key: "tools.web_search",
      type: 'boolean | { context_size = "low|medium|high", allowed_domains = [string], location = { country, region, city, timezone } }',
      description:
        "Optional web search tool configuration. The legacy boolean form is still accepted, but the object form lets you set search context size, allowed domains, and approximate user location.",
    },
    {
      key: "tools.view_image",
      type: "boolean",
      description: "Enable the local-image attachment tool `view_image`.",
    },
    {
      key: "web_search",
      type: "disabled | cached | live",
      description:
        'Web search mode (default: `"cached"`; cached uses an OpenAI-maintained index and does not fetch live pages; if you use `--yolo` or another full access sandbox setting, it defaults to `"live"`). Use `"live"` to fetch the most recent data from the web, or `"disabled"` to remove the tool.',
    },
    {
      key: "default_permissions",
      type: "string",
      description:
        "Name of the default permissions profile to apply to sandboxed tool calls. Built-ins are `:read-only`, `:workspace`, and `:danger-full-access`; custom profile names require matching `[permissions.<name>]` tables. Don't combine with `sandbox_mode` or `[sandbox_workspace_write]`.",
    },
    {
      key: "permissions.<name>.description",
      type: "string",
      description:
        "Human-readable description for this named profile. A profile does not inherit its parent's description through `extends`.",
    },
    {
      key: "permissions.<name>.extends",
      type: "string",
      description:
        "Optional parent profile applied before this named profile. Set it to another named profile, `:read-only`, or `:workspace`; `:danger-full-access`, undefined parents, and cycles are rejected.",
    },
    {
      key: "permissions.<name>.workspace_roots",
      type: "table",
      description:
        "Profile-defined workspace roots that receive `:workspace_roots` filesystem rules alongside the session's runtime workspace roots.",
    },
    {
      key: "permissions.<name>.workspace_roots.<path>",
      type: "boolean",
      description:
        "Opt a path into the profile's workspace root set when `true`. Disabled entries remain inactive.",
    },
    {
      key: "permissions.<name>.filesystem",
      type: "table",
      description:
        "Named filesystem permission profile. Each key is an absolute path or special token such as `:minimal` or `:workspace_roots`.",
    },
    {
      key: "permissions.<name>.filesystem.glob_scan_max_depth",
      type: "number",
      description:
        "Maximum depth for expanding deny-read glob patterns on platforms that snapshot matches before sandbox startup. Must be at least `1` when set.",
    },
    {
      key: "permissions.<name>.filesystem.<path-or-glob>",
      type: '"read" | "write" | "deny" | table',
      description:
        'Grant direct access for a path, glob pattern, or special token, or scope nested entries under that root. Use `"deny"` to deny reads for matching paths.',
    },
    {
      key: 'permissions.<name>.filesystem.":workspace_roots".<subpath-or-glob>',
      type: '"read" | "write" | "deny"',
      description:
        'Scoped filesystem access relative to each effective workspace root. Use `"."` for the root itself; glob subpaths such as `"**/*.env"` can deny reads with `"deny"`.',
    },
    {
      key: "permissions.<name>.network.enabled",
      type: "boolean",
      description:
        "Enable network access for this named permissions profile. This changes the sandbox network policy; it does not start the network proxy by itself.",
    },
    {
      key: "permissions.<name>.network.proxy_url",
      type: "string",
      description:
        "HTTP listener URL used when this permissions profile enables sandboxed networking.",
    },
    {
      key: "permissions.<name>.network.enable_socks5",
      type: "boolean",
      description:
        "Expose SOCKS5 support when this permissions profile enables sandboxed networking.",
    },
    {
      key: "permissions.<name>.network.socks_url",
      type: "string",
      description: "SOCKS5 proxy endpoint used by this permissions profile.",
    },
    {
      key: "permissions.<name>.network.enable_socks5_udp",
      type: "boolean",
      description: "Allow UDP over the SOCKS5 listener when enabled.",
    },
    {
      key: "permissions.<name>.network.allow_upstream_proxy",
      type: "boolean",
      description:
        "Allow sandboxed networking to chain through another upstream proxy.",
    },
    {
      key: "permissions.<name>.network.dangerously_allow_non_loopback_proxy",
      type: "boolean",
      description:
        "Permit non-loopback bind addresses for sandboxed networking listeners. Enabling it can expose listeners beyond localhost.",
    },
    {
      key: "permissions.<name>.network.dangerously_allow_all_unix_sockets",
      type: "boolean",
      description:
        "Allow arbitrary Unix socket destinations instead of the default restricted set. Use only in tightly controlled environments.",
    },
    {
      key: "permissions.<name>.network.mode",
      type: "limited | full",
      description: "Network proxy mode used for subprocess traffic.",
    },
    {
      key: "permissions.<name>.network.domains",
      type: "table",
      description:
        "Domain rules for sandboxed networking. Supports exact hosts, `*.example.com` for subdomains only, `**.example.com` for apex plus subdomains, and global `*` allow rules. `deny` wins on conflicts.",
    },
    {
      key: "permissions.<name>.network.domains.<pattern>",
      type: "allow | deny",
      description:
        "Allow or deny an exact host or scoped wildcard pattern such as `*.example.com` or `**.example.com`.",
    },
    {
      key: "permissions.<name>.network.unix_sockets",
      type: "table",
      description:
        "Unix socket allowlist overrides for sandboxed networking. Use socket paths as keys; `allow` adds a path, and `deny` rejects it.",
    },
    {
      key: "permissions.<name>.network.unix_sockets.<path>",
      type: "allow | deny",
      description:
        "Add an absolute Unix socket path to the effective allowlist with `allow`, or reject it with `deny`. Denied entries are omitted from the effective allowlist.",
    },
    {
      key: "permissions.<name>.network.allow_local_binding",
      type: "boolean",
      description:
        "Permit broader local/private-network access through sandboxed networking. Exact local IP literal or `localhost` allow rules can still permit specific local targets when this stays `false`.",
    },
    {
      key: "projects.<path>.trust_level",
      type: "string",
      description:
        'Mark a project or worktree as trusted or untrusted (`"trusted"` | `"untrusted"`). Untrusted projects skip project-scoped `.codex/` layers, including project-local config, hooks, and rules.',
    },
    {
      key: "notice.hide_full_access_warning",
      type: "boolean",
      description: "Track acknowledgement of the full access warning prompt.",
    },
    {
      key: "notice.hide_world_writable_warning",
      type: "boolean",
      description:
        "Track acknowledgement of the Windows world-writable directories warning.",
    },
    {
      key: "notice.hide_rate_limit_model_nudge",
      type: "boolean",
      description: "Track opt-out of the rate limit model switch reminder.",
    },
    {
      key: "notice.hide_gpt5_1_migration_prompt",
      type: "boolean",
      description: "Track acknowledgement of the GPT-5.1 migration prompt.",
    },
    {
      key: "notice.hide_gpt-5.1-codex-max_migration_prompt",
      type: "boolean",
      description:
        "Track acknowledgement of the gpt-5.1-codex-max migration prompt.",
    },
    {
      key: "notice.model_migrations",
      type: "map<string,string>",
      description: "Track acknowledged model migrations as old->new mappings.",
    },
    {
      key: "forced_login_method",
      type: "chatgpt | api",
      description: "Restrict Codex to a specific authentication method.",
    },
    {
      key: "forced_chatgpt_workspace_id",
      type: "string (uuid)",
      description: "Limit ChatGPT logins to a specific workspace identifier.",
    },
  ]}
  client:load
/>

You can find the latest JSON schema for `config.toml` [here](https://developers.openai.com/codex/config-schema.json).

To get autocompletion and diagnostics when editing `config.toml` in VS Code or Cursor, you can install the [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml) extension and add this line to the top of your `config.toml`:

```toml
#:schema https://developers.openai.com/codex/config-schema.json
```

Note: Rename `experimental_instructions_file` to `model_instructions_file`. Codex deprecates the old key; update existing configs to the new name.

## `requirements.toml`

`requirements.toml` is an admin-enforced configuration file that constrains security-sensitive settings users can't override. For details, locations, and examples, see [Admin-enforced requirements](https://developers.openai.com/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml).

For ChatGPT Business and Enterprise users, Codex can also apply cloud-fetched
requirements. See the security page for precedence details.

Use `[features]` in `requirements.toml` to pin feature flags by the same
canonical keys that `config.toml` uses. Omitted keys remain unconstrained.

Managed permission-profile allowlists require Codex 0.138.0 or later. Codex
0.137.0 and earlier ignore `allowed_permission_profiles` and managed
`default_permissions`.

Use `allowed_sandbox_modes` with `sandbox_mode`. For permission-profile
deployments, use `allowed_permission_profiles` with managed
`default_permissions`.

<ConfigTable
  options={[
    {
      key: "allowed_approval_policies",
      type: "array<string>",
      description:
        "Allowed values for `approval_policy` (for example `untrusted`, `on-request`, `never`, and `granular`).",
    },
    {
      key: "allowed_approvals_reviewers",
      type: "array<string>",
      description:
        "Allowed values for `approvals_reviewer`, such as `user` and `auto_review`.",
    },
    {
      key: "guardian_policy_config",
      type: "string",
      description:
        "Managed Markdown policy instructions for automatic review. This takes precedence over local `[auto_review].policy`. Blank values are ignored.",
    },
    {
      key: "allowed_permission_profiles",
      type: "table<boolean>",
      description:
        "Complete list of allowed permission profiles. Profiles set to `true` are allowed. Profiles that are omitted or set to `false` are denied, including profiles added in future versions. When requirements sources are combined, entries are matched by profile name.",
    },
    {
      key: "allowed_permission_profiles.<name>",
      type: "boolean",
      description:
        "Allow or deny a built-in or custom permission profile defined in a loaded config or requirements source. An earlier requirements source can use `false` to turn off a profile allowed by a later source.",
    },
    {
      key: "default_permissions",
      type: "string",
      description:
        "Managed default permission profile. The profile must be allowed by `allowed_permission_profiles`. Set this explicitly for predictable behavior; if omitted, Codex defaults to `:workspace` only when both `:workspace` and `:read-only` are explicitly allowed.",
    },
    {
      key: "enforce_residency",
      type: "string",
      description:
        "Require Codex service traffic to use a supported data residency. Currently accepts `us`.",
    },
    {
      key: "permissions",
      type: "table",
      description:
        "Admin-defined permission profiles keyed by profile name. Uses the same profile fields as `config.toml`.",
    },
    {
      key: "permissions.<name>",
      type: "table",
      description:
        "Admin-defined permission profile. The name can't start with `:`, use the reserved name `filesystem`, or duplicate a profile from a loaded config. Uses the same profile fields as `config.toml`; see the Permissions guide for the complete profile schema.",
    },
    {
      key: "allowed_sandbox_modes",
      type: "array<string>",
      description: "Allowed values for `sandbox_mode`.",
    },
    {
      key: "windows",
      type: "table",
      description: "Native Windows sandbox requirements.",
    },
    {
      key: "windows.allowed_sandbox_implementations",
      type: "array<string>",
      description:
        "Allowed native Windows sandbox implementations for `windows.sandbox` (`elevated` and `unelevated`). The list must not be empty. When both are allowed and no mode is selected, Codex prefers `elevated`.",
    },
    {
      key: "remote_sandbox_config",
      type: "array<table>",
      description:
        "Host-specific sandbox requirements. The first entry whose `hostname_patterns` match the resolved host name overrides top-level `allowed_sandbox_modes` for that requirements source. Host-specific entries currently override sandbox modes only.",
    },
    {
      key: "remote_sandbox_config[].hostname_patterns",
      type: "array<string>",
      description:
        "Case-insensitive host name patterns. Supports `*` for any sequence of characters and `?` for one character.",
    },
    {
      key: "remote_sandbox_config[].allowed_sandbox_modes",
      type: "array<string>",
      description:
        "Allowed sandbox modes to apply when this host-specific entry matches.",
    },
    {
      key: "allowed_web_search_modes",
      type: "array<string>",
      description:
        "Allowed values for `web_search` (`disabled`, `cached`, `live`). `disabled` is always allowed; an empty list effectively allows only `disabled`.",
    },
    {
      key: "allow_managed_hooks_only",
      type: "boolean",
      description:
        "When `true`, Codex skips user, project, session, and plugin hooks while still allowing managed hooks from `requirements.toml` and other managed config layers.",
    },
    {
      key: "allow_appshots",
      type: "boolean",
      description:
        "Set to `false` to disable Appshots for managed users. If omitted, Appshots remain unconstrained by requirements and follow normal product availability.",
    },
    {
      key: "allow_remote_control",
      type: "boolean",
      description:
        "Set to `false` to disable device remote control for managed users. If omitted, device remote control remains unconstrained by requirements and follows normal product availability.",
    },
    {
      key: "features.plugin_sharing",
      type: "boolean",
      description:
        "Set to `false` in cloud-managed `requirements.toml` to disable workspace sharing for locally built plugins.",
    },
    {
      key: "features",
      type: "table",
      description:
        "Pinned feature values keyed by the canonical names from `config.toml`'s `[features]` table.",
    },
    {
      key: "features.<name>",
      type: "boolean",
      description:
        "Require a specific canonical feature key to stay enabled or disabled.",
    },
    {
      key: "features.apps",
      type: "boolean",
      description:
        "Pin Apps integration availability on or off for managed users.",
    },
    {
      key: "features.in_app_browser",
      type: "boolean",
      description:
        "Set to `false` in `requirements.toml` to disable the in-app browser pane.",
    },
    {
      key: "features.browser_use",
      type: "boolean",
      description:
        "Set to `false` in `requirements.toml` to disable Browser Use and Browser Agent availability.",
    },
    {
      key: "features.browser_use_external",
      type: "boolean",
      description:
        "Set to `false` in `requirements.toml` to disable external-browser Browser Use availability.",
    },
    {
      key: "features.browser_use_full_cdp_access",
      type: "boolean",
      description:
        "Set to `false` in `requirements.toml` to prevent users from enabling full Chrome DevTools Protocol access in Browser Developer mode. If omitted, normal product availability applies.",
    },
    {
      key: "features.fast_mode",
      type: "boolean",
      description:
        "Pin the canonical `fast_mode` feature on or off for managed users.",
    },
    {
      key: "features.guardian_approval",
      type: "boolean",
      description:
        "Pin Guardian approval availability on or off for managed users.",
    },
    {
      key: "features.memories",
      type: "boolean",
      description: "Pin Memories availability on or off for managed users.",
    },
    {
      key: "features.multi_agent",
      type: "boolean",
      description: "Pin multi-agent availability on or off for managed users.",
    },
    {
      key: "features.plugins",
      type: "boolean",
      description: "Pin plugin availability on or off for managed users.",
    },
    {
      key: "features.computer_use",
      type: "boolean",
      description:
        "Set to `false` in `requirements.toml` to disable Computer Use, Record & Replay, and related install or enablement flows.",
    },
    {
      key: "features.workspace_dependencies",
      type: "boolean",
      description:
        "Pin bundled workspace-dependency runtime availability on or off for managed users.",
    },
    {
      key: "computer_use",
      type: "table",
      description:
        "Computer Use requirements enforced from `requirements.toml`.",
    },
    {
      key: "computer_use.allow_locked_computer_use",
      type: "boolean",
      description:
        "Set to `false` to prevent Computer Use from operating after a managed macOS device locks. If omitted, locked use remains unconstrained by requirements.",
    },
    {
      key: "experimental_network",
      type: "table",
      description:
        "Network access requirements enforced from `requirements.toml`. These constraints are separate from `features.network_proxy` and can configure sandboxed networking without the user feature flag.",
    },
    {
      key: "experimental_network.enabled",
      type: "boolean",
      description:
        "Enable sandboxed networking requirements. This does not grant network access when the active sandbox keeps command networking off.",
    },
    {
      key: "experimental_network.http_port",
      type: "integer",
      description:
        "Loopback HTTP listener port to use for `[experimental_network]` requirements.",
    },
    {
      key: "experimental_network.socks_port",
      type: "integer",
      description:
        "Loopback SOCKS5 listener port to use for `[experimental_network]` requirements.",
    },
    {
      key: "experimental_network.allow_upstream_proxy",
      type: "boolean",
      description:
        "Allow sandboxed networking to chain through an upstream proxy from the environment.",
    },
    {
      key: "experimental_network.dangerously_allow_non_loopback_proxy",
      type: "boolean",
      description:
        "Permit non-loopback listener addresses for `[experimental_network]` requirements. Enabling it can expose listeners beyond localhost.",
    },
    {
      key: "experimental_network.dangerously_allow_all_unix_sockets",
      type: "boolean",
      description:
        "Permit arbitrary Unix socket destinations instead of allowlist-only access. Use only in tightly controlled environments.",
    },
    {
      key: "experimental_network.domains",
      type: "map<string, allow | deny>",
      description:
        "Map-shaped administrator domain policy for sandboxed networking. Supports exact hosts, `*.example.com` for subdomains only, `**.example.com` for apex plus subdomains, and global `*` allow rules; prefer scoped rules because `*` broadly opens public outbound access. `deny` wins on conflicts. Do not combine this with `experimental_network.allowed_domains` or `experimental_network.denied_domains`.",
    },
    {
      key: "experimental_network.allowed_domains",
      type: "array<string>",
      description:
        "List-shaped administrator allow rules for sandboxed networking. Do not combine this with `experimental_network.domains`.",
    },
    {
      key: "experimental_network.denied_domains",
      type: "array<string>",
      description:
        "List-shaped administrator deny rules for sandboxed networking. Do not combine this with `experimental_network.domains`.",
    },
    {
      key: "experimental_network.managed_allowed_domains_only",
      type: "boolean",
      description:
        "When `true`, only administrator-managed allow rules remain effective while sandboxed networking requirements are active; user allowlist additions are ignored. Without managed allow rules, user-added domain allow rules do not remain effective.",
    },
    {
      key: "experimental_network.unix_sockets",
      type: "map<string, allow | deny>",
      description:
        "Administrator-managed Unix socket policy for sandboxed networking.",
    },
    {
      key: "experimental_network.allow_local_binding",
      type: "boolean",
      description:
        "Permit broader local/private-network access for sandboxed networking. Exact local IP literal or `localhost` allow rules can still permit specific local targets when this stays `false`.",
    },
    {
      key: "hooks",
      type: "table",
      description:
        "Admin-enforced managed lifecycle hooks. Requires a managed hook directory and uses the same event schema as inline `[hooks]` in `config.toml`.",
    },
    {
      key: "hooks.managed_dir",
      type: "string (absolute path)",
      description:
        "Directory containing managed hook scripts on macOS and Linux. Codex validates that it is absolute and exists before loading managed hooks.",
    },
    {
      key: "hooks.windows_managed_dir",
      type: "string (absolute path)",
      description:
        "Directory containing managed hook scripts on Windows. Codex validates that it is absolute and exists before loading managed hooks.",
    },
    {
      key: "hooks.<Event>",
      type: "array<table>",
      description:
        "Matcher groups for a hook event such as `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PreCompact`, `PostCompact`, `SessionStart`, `SubagentStart`, `SubagentStop`, `UserPromptSubmit`, or `Stop`.",
    },
    {
      key: "hooks.<Event>[].hooks",
      type: "array<table>",
      description:
        "Hook handlers for a matcher group. Command hooks are currently supported; prompt and agent hook handlers are parsed but skipped.",
    },
    {
      key: "hooks.<Event>[].hooks[].commandWindows",
      type: "string",
      description:
        "Windows-only command override for command hooks. The TOML alias `command_windows` is also accepted.",
    },
    {
      key: "permissions.filesystem.deny_read",
      type: "array<string>",
      description:
        "Admin-enforced filesystem read denials. Entries can be paths or glob patterns, and users cannot weaken them with local config.",
    },
    {
      key: "mcp_servers",
      type: "table",
      description:
        "Allowlist of MCP servers that may be enabled. Both the server name (`<id>`) and its identity must match for the MCP server to be enabled. Any configured MCP server not in the allowlist (or with a mismatched identity) is disabled.",
    },
    {
      key: "mcp_servers.<id>.identity",
      type: "table",
      description:
        "Identity rule for a single MCP server. Set either `command` (stdio) or `url` (streamable HTTP).",
    },
    {
      key: "mcp_servers.<id>.identity.command",
      type: "string | table",
      description:
        "Allow an MCP stdio server by exact command string, or use a matcher table to require an exact executable and ordered argument matchers. The string form doesn't inspect arguments, `cwd`, `env`, or `env_vars`.",
    },
    {
      key: "mcp_servers.<id>.identity.command.executable",
      type: "string",
      description:
        "Executable that the stdio server's configured `command` must match exactly.",
    },
    {
      key: "mcp_servers.<id>.identity.command.args",
      type: "array<table>",
      description:
        "Ordered argument matchers for a stdio server. The configured argument list must have the same length, and every position must match. Command matchers don't inspect `cwd`, `env`, or `env_vars`.",
    },
    {
      key: "mcp_servers.<id>.identity.command.args[].match",
      type: "exact | prefix | regex",
      description: "Match operation for this argument position.",
    },
    {
      key: "mcp_servers.<id>.identity.command.args[].value",
      type: "string",
      description: "Value used by an `exact` or `prefix` argument matcher.",
    },
    {
      key: "mcp_servers.<id>.identity.command.args[].expression",
      type: "string",
      description:
        "Regular expression used by a `regex` argument matcher. The expression must be valid and match the complete argument value.",
    },
    {
      key: "mcp_servers.<id>.identity.url",
      type: "string | table",
      description:
        "Allow an MCP streamable HTTP server by exact URL string, or use an `exact`, `prefix`, or `regex` value matcher table.",
    },
    {
      key: "mcp_servers.<id>.identity.url.match",
      type: "exact | prefix | regex",
      description: "Match operation for the configured MCP server URL.",
    },
    {
      key: "mcp_servers.<id>.identity.url.value",
      type: "string",
      description: "Value used by an `exact` or `prefix` URL matcher.",
    },
    {
      key: "mcp_servers.<id>.identity.url.expression",
      type: "string",
      description:
        "Regular expression used by a `regex` URL matcher. The expression must be valid and match the complete URL value.",
    },
    {
      key: "plugins",
      type: "table",
      description:
        "Plugin-specific MCP server allowlists keyed by plugin identifier. When this table is present, plugin-bundled servers without a matching plugin and server entry are disabled.",
    },
    {
      key: "plugins.<plugin>.mcp_servers",
      type: "table",
      description:
        "Allowlist for MCP servers bundled with one plugin. Plugin server requirements use the same exact identity and matcher forms as top-level `mcp_servers` requirements.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.identity",
      type: "table",
      description:
        "Identity rule for one plugin-bundled MCP server. Set either `command` (stdio) or `url` (streamable HTTP).",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.identity.command",
      type: "string | table",
      description:
        "Allow a plugin's stdio MCP server by exact command string, or use a matcher table to require an exact executable and ordered argument matchers.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.identity.command.executable",
      type: "string",
      description:
        "Executable that the plugin-bundled stdio server's configured command must match exactly.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.identity.command.args",
      type: "array<table>",
      description:
        "Ordered argument matchers for a plugin-bundled stdio server. The configured argument list must have the same length, and every position must match.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.identity.command.args[].match",
      type: "exact | prefix | regex",
      description: "Match operation for this argument position.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.identity.command.args[].value",
      type: "string",
      description: "Value used by an `exact` or `prefix` argument matcher.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.identity.command.args[].expression",
      type: "string",
      description:
        "Regular expression used by a `regex` argument matcher. The expression must match the complete argument value.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.identity.url",
      type: "string | table",
      description:
        "Allow a plugin's streamable HTTP MCP server by exact URL string, or use an `exact`, `prefix`, or `regex` value matcher table.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.identity.url.match",
      type: "exact | prefix | regex",
      description: "Match operation for the plugin-bundled MCP server URL.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.identity.url.value",
      type: "string",
      description: "Value used by an `exact` or `prefix` URL matcher.",
    },
    {
      key: "plugins.<plugin>.mcp_servers.<server>.identity.url.expression",
      type: "string",
      description:
        "Regular expression used by a `regex` URL matcher. The expression must match the complete URL value.",
    },
    {
      key: "marketplaces",
      type: "table",
      description:
        "Admin requirements for plugin marketplace sources. Rules take effect when `restrict_to_allowed_sources` is `true`.",
    },
    {
      key: "marketplaces.restrict_to_allowed_sources",
      type: "boolean",
      description:
        "When `true`, require user-configured marketplace sources to match `allowed_sources` for marketplace add, plugin install, and configured Git marketplace refresh operations. Codex-managed OpenAI marketplaces remain allowed when their reserved source and name match. This doesn't filter already configured user marketplaces at runtime.",
    },
    {
      key: "marketplaces.allowed_sources",
      type: "table",
      description:
        "Allowed marketplace sources keyed by administrator-chosen rule name. Distinct names accumulate across requirements layers; fields under the same name use normal layer precedence.",
    },
    {
      key: "marketplaces.allowed_sources.<name>",
      type: "table",
      description:
        "One allowed source rule. The final `source` value after requirements merge determines which sibling fields Codex interprets.",
    },
    {
      key: "marketplaces.allowed_sources.<name>.source",
      type: "git | host_pattern | local",
      description:
        "Marketplace source matcher type. Use `git` for one repository, `host_pattern` for Git hosts matched by regular expression, or `local` for one directory.",
    },
    {
      key: "marketplaces.allowed_sources.<name>.url",
      type: "string",
      description:
        'Git repository URL required when `source = "git"`. Codex normalizes the configured and allowed URLs before requiring an exact repository match.',
    },
    {
      key: "marketplaces.allowed_sources.<name>.ref",
      type: "string",
      description:
        "Optional exact Git ref for a `git` rule. When omitted, the rule allows any ref for the matching repository.",
    },
    {
      key: "marketplaces.allowed_sources.<name>.host_pattern",
      type: "string",
      description:
        'Regular expression required when `source = "host_pattern"`. Codex matches it against the lowercase hostname parsed from an HTTPS, SSH, or SCP-style Git source. Use `^` and `$` to require a whole-host match.',
    },
    {
      key: "marketplaces.allowed_sources.<name>.path",
      type: "string (absolute path)",
      description:
        'Local marketplace directory required when `source = "local"`. Codex requires an absolute path and compares paths after normalization.',
    },
    {
      key: "apps",
      type: "table",
      description:
        "Managed app requirements keyed by app identifier. Requirements can disable an app or constrain approval behavior for individual tools.",
    },
    {
      key: "apps.<id>.enabled",
      type: "boolean",
      description:
        "Set to `false` to disable an app. A disabled requirement remains restrictive when multiple requirements sources are merged.",
    },
    {
      key: "apps.<id>.tools.<tool>.approval_mode",
      type: "auto | prompt | approve",
      description: "Set the managed approval mode for one app tool.",
    },
    {
      key: "rules",
      type: "table",
      description:
        "Admin-enforced command rules merged with `.rules` files. Requirements rules must be restrictive.",
    },
    {
      key: "rules.prefix_rules",
      type: "array<table>",
      description:
        "List of enforced prefix rules. Each rule must include `pattern` and `decision`.",
    },
    {
      key: "rules.prefix_rules[].pattern",
      type: "array<table>",
      description:
        "Command prefix expressed as pattern tokens. Each token sets either `token` or `any_of`.",
    },
    {
      key: "rules.prefix_rules[].pattern[].token",
      type: "string",
      description: "A single literal token at this position.",
    },
    {
      key: "rules.prefix_rules[].pattern[].any_of",
      type: "array<string>",
      description: "A list of allowed alternative tokens at this position.",
    },
    {
      key: "rules.prefix_rules[].decision",
      type: "prompt | forbidden",
      description:
        "Required. Requirements rules can only prompt or forbid (not allow).",
    },
    {
      key: "rules.prefix_rules[].justification",
      type: "string",
      description:
        "Optional non-empty rationale surfaced in approval prompts or rejection messages.",
    },
  ]}
  client:load
/>
``````
:::
:::

