---
title: "术语表"
description: "Definitions for common Codex terms and concepts"
outline: deep
---

# 术语表

**文档集**：Codex<br>
**分组**：术语表<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/glossary](https://developers.openai.com/codex/glossary)
- Markdown 来源：[https://developers.openai.com/codex/glossary.md](https://developers.openai.com/codex/glossary.md)
- 抓取时间：2026-06-27T05:54:58.477Z
- Checksum：`d016caec18e2878bbfb58ede76bdeef66085c60ff904985b199c627bdd0f5962`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用本术语表快速查阅 Codex 在 app、CLI、IDE extension、cloud、SDK 和相关 integrations 中的术语。

&lt;GlossaryTable
  client:load
  searchPlaceholder="按术语、定义或适用范围筛选"
  searchLabel="搜索术语表"
  emptyStateMessage="没有匹配你搜索的术语。"
  maxVisibleEntries={100}
  options={[
    {
      key: "Agent",
      href: "/codex",
      appliesTo: "App, CLI, IDE extension, Cloud",
      description:
        "Codex worker，会基于上下文推理、使用工具并完成任务。",
    },
    {
      key: "AGENTS.md",
      href: "/codex/guides/agents-md",
      appliesTo: "App, CLI, IDE extension, Cloud",
      description:
        "为 Codex 提供持久指令的仓库或用户指导文件。",
    },
    {
      key: "Analytics dashboard",
      href: "/codex/enterprise/governance#analytics-dashboard",
      appliesTo: "Enterprise",
      description:
        "面向 Codex 使用情况、采用情况和代码审查指标的管理员视图。",
    },
    {
      key: "API key sign-in",
      href: "/codex/auth#sign-in-with-an-api-key",
      appliesTo: "App, CLI, IDE extension",
      description: "使用 OpenAI API key 进行认证。",
    },
    {
      key: "Approval policy",
      href: "/codex/agent-approvals-security#sandbox-and-approvals",
      appliesTo: "App, CLI, IDE extension",
      description: "规定 Codex 何时必须在执行操作前请求确认的规则。",
    },
    {
      key: "Approval request",
      href: "/codex/agent-approvals-security#automatic-approval-reviews",
      appliesTo: "App, CLI, IDE extension",
      description: "Codex 请求允许某个受限操作。",
    },
    {
      key: "Apps (connectors)",
      href: "/codex/plugins",
      appliesTo: "App, CLI, IDE extension",
      description:
        "让 Codex 访问外部服务的 integration。通过 plugins 提供，也称为 connectors。",
    },
    {
      key: "Appshot",
      href: "/codex/appshots",
      appliesTo: "App",
      description:
        "发送到 Codex thread 的最前方应用窗口快照。",
    },
    {
      key: "Auth cache",
      href: "/codex/auth#login-caching",
      appliesTo: "App, CLI, IDE extension",
      description: "Codex 复用的本地存储登录凭据。",
    },
    {
      key: "Automatic approval review",
      href: "/codex/agent-approvals-security#automatic-approval-reviews",
      appliesTo: "App, CLI, IDE extension",
      description:
        "在符合条件的审批请求继续之前，对其进行的基于模型的 review。",
    },
    {
      key: "Automation",
      href: "/codex/app/automations",
      appliesTo: "App",
      description: "计划执行或重复执行的 Codex 任务。",
    },
    {
      key: "Automation run",
      href: "/codex/app/automations#managing-tasks",
      appliesTo: "App",
      description:
        "计划自动化的一次执行，可能会报告 findings 或归档自身。",
    },
    {
      key: "Browser use",
      href: "/codex/app/browser#browser-use",
      appliesTo: "App",
      description:
        "让 Codex 直接操作内置浏览器的 app 能力。",
    },
    {
      key: "Chat",
      href: "/codex/app/features#chats",
      appliesTo: "App",
      description: "不绑定到项目的 Codex 对话。",
    },
    {
      key: "ChatGPT sign-in",
      href: "/codex/auth#sign-in-with-chatgpt",
      appliesTo: "App, CLI, IDE extension, Cloud",
      description:
        "使用 ChatGPT account 和 workspace permissions 进行认证。",
    },
    {
      key: "Chronicle",
      href: "/codex/memories/chronicle",
      appliesTo: "App",
      description:
        "从最近屏幕上下文构建 memories 的可选功能。",
    },
    {
      key: "Cloud",
      href: "/codex/cloud",
      appliesTo: "App, IDE extension, Web",
      description:
        "Codex 在 OpenAI 托管环境中远程工作的模式。",
    },
    {
      key: "Cloud environment",
      href: "/codex/cloud/environments",
      appliesTo: "Cloud",
      description: "用于 Codex cloud tasks 的已配置容器设置。",
    },
    {
      key: "Cloud task",
      href: "/codex/cloud/environments#how-codex-cloud-tasks-run",
      appliesTo: "Cloud",
      description:
        "在 cloud environment 中运行的远程 Codex 任务。",
    },
    {
      key: "Cloud thread",
      href: "/codex/prompting#threads",
      appliesTo: "Cloud",
      description: "在 Codex cloud environment 中运行的 thread。",
    },
    {
      key: "Codex",
      href: "/codex",
      appliesTo: "App, CLI, IDE extension, Web, Cloud, SDK",
      description: "OpenAI 面向软件开发任务的 coding agent。",
    },
    {
      key: "Codex app",
      href: "/codex/app",
      appliesTo: "Desktop",
      description:
        "用于并行运行 Codex threads 的桌面 app，内置 worktree support、automations 和 Git 功能。",
    },
    {
      key: "Codex app-server",
      href: "/codex/app-server",
      appliesTo: "App, IDE extension, SDK",
      description:
        "本地 JSON-RPC server，用于在自定义 clients 中嵌入 Codex threads、turns、approvals、history 和 streamed events。",
    },
    {
      key: "Codex CLI",
      href: "/codex/cli",
      appliesTo: "Terminal",
      description:
        "用于以交互方式或在脚本中运行 Codex 的终端 client。",
    },
    {
      key: "Codex cloud",
      href: "/codex/cloud",
      appliesTo: "Web, App, IDE extension",
      description:
        "OpenAI 托管执行环境，Codex 可在其中远程处理仓库任务。",
    },
    {
      key: "codex exec",
      href: "/codex/noninteractive",
      appliesTo: "CLI",
      description:
        "用于从脚本或 CI 非交互运行 Codex 的 CLI 命令。",
    },
    {
      key: "Codex IDE extension",
      href: "/codex/ide",
      appliesTo: "IDE",
      description:
        "用于在 VS Code、JetBrains IDEs、Cursor 和 Windsurf 等 IDE 中使用 Codex 的编辑器 integration。",
    },
    {
      key: "Codex SDK",
      href: "/codex/sdk",
      appliesTo: "SDK",
      description:
        "用于构建 Codex 驱动 workflows 或 integrations 的编程接口。",
    },
    {
      key: "Codex web",
      href: "/codex/cloud",
      appliesTo: "Browser",
      description: "用于委托 cloud tasks 的浏览器版 Codex 界面。",
    },
    {
      key: "Codex-managed worktree",
      href: "/codex/app/worktrees#codex-managed-and-permanent-worktrees",
      appliesTo: "App",
      description:
        "Codex 为 thread 创建并管理的临时 worktree。",
    },
    {
      key: "Compaction",
      href: "/codex/prompting#context",
      appliesTo: "App, CLI, IDE extension, Cloud",
      description:
        "对较早上下文进行总结，让长时间运行的工作可以继续。",
    },
    {
      key: "Compliance API",
      href: "/codex/enterprise/governance#compliance-api",
      appliesTo: "Enterprise",
      description: "用于导出 Codex activity 和 audit metadata 的 API。",
    },
    {
      key: "Computer use",
      href: "/codex/app/computer-use",
      appliesTo: "App",
      description:
        "让 Codex 通过 UI 与桌面应用交互的 app 能力。",
    },
    {
      key: "config.toml",
      href: "/codex/config-reference#configtoml",
      appliesTo: "App, CLI, IDE extension",
      description: "本地 Codex 配置文件。",
    },
    {
      key: "Connected host",
      href: "/codex/remote-connections#what-comes-from-the-connected-host",
      appliesTo: "App, Mobile",
      description:
        "为远程 Codex 工作提供文件、工具和 shell access 的计算机或开发环境。",
    },
    {
      key: "Connector",
      href: "/codex/plugins",
      appliesTo: "App, Cloud",
      description:
        "让 Codex 访问外部服务的 app integration。通过 plugins 提供，也称为 apps。",
    },
    {
      key: "Container cache",
      href: "/codex/cloud/environments#container-caching",
      appliesTo: "Cloud",
      description:
        "保存的 cloud container 状态，可复用以加快未来任务。",
    },
    {
      key: "Context",
      href: "/codex/prompting#context",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description:
        "Codex 工作时可使用的信息，例如文件、先前消息、工具输出和指令。",
    },
    {
      key: "Context window",
      href: "/api/docs/guides/conversation-state#managing-the-context-window",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description:
        "模型一次可考虑的信息最大量。",
    },
    {
      key: "Custom agent",
      href: "/codex/subagents#custom-agents",
      appliesTo: "App, CLI",
      description:
        "用户定义的 agent 角色，拥有自己的指令和设置。",
    },
    {
      key: "Deny-read rule",
      href: "/codex/permissions#deny-reads-with-exact-paths-or-globs",
      appliesTo: "App, CLI, IDE extension, Enterprise",
      description:
        "防止 Codex 读取敏感路径或 glob 匹配项的文件系统权限规则。",
    },
    {
      key: "Diff",
      href: "/codex/app/review#what-changes-it-shows",
      appliesTo: "App, Git, Review",
      description:
        "一组用于检查、评论、暂存或还原的 Git 文件变更。",
    },
    {
      key: "Domain allowlist",
      href: "/codex/cloud/internet-access#domain-allowlist",
      appliesTo: "Cloud",
      description:
        "当 agent internet access 启用时，Codex cloud 可以访问的一组 domains。",
    },
    {
      key: "Environment (local)",
      href: "/codex/app/local-environments",
      appliesTo: "App, Worktree",
      description:
        "告诉 Codex 如何为项目设置 worktrees 的 app 配置。",
    },
    {
      key: "Environment variable",
      href: "/codex/cloud/environments#environment-variables-and-secrets",
      appliesTo: "Cloud, CLI, IDE extension",
      description:
        "任务执行期间可用的运行时配置值。",
    },
    {
      key: "Ephemeral session",
      href: "/codex/noninteractive#basic-usage",
      appliesTo: "CLI",
      description:
        "完成后跳过保存 session state 的非交互运行。",
    },
    {
      key: "Fast mode",
      href: "/codex/speed#fast-mode",
      appliesTo: "CLI, IDE extension",
      description:
        "让受支持模型以更高 credit 成本更快响应的速度设置。",
    },
    {
      key: "Filesystem permission",
      href: "/codex/permissions#filesystem-permissions",
      appliesTo: "App, CLI, IDE extension",
      description:
        "授予或拒绝路径读写访问的 permission profile 规则。",
    },
    {
      key: "Finding",
      href: "/codex/app/automations#managing-tasks",
      appliesTo: "App",
      description: "由 automation 暴露的重要结果或问题。",
    },
    {
      key: "Full access",
      href: "/codex/concepts/sandboxing#configure-defaults",
      appliesTo: "App, CLI, IDE extension",
      description: "Codex 在没有常规 sandbox 限制的情况下运行的模式。",
    },
    {
      key: "Git worktree",
      href: "/codex/app/worktrees#whats-a-worktree",
      appliesTo: "App, Git",
      description:
        "同一仓库的第二个 checkout，用于并行分支工作。",
    },
    {
      key: "Handoff",
      href: "/codex/app/worktrees#working-between-local-and-worktree",
      appliesTo: "App",
      description: "在线程及其工作之间，在 Local 与 Worktree 间移动。",
    },
    {
      key: "Heartbeat",
      href: "/codex/app/automations#thread-automations",
      appliesTo: "App",
      description:
        "按计划将 Codex 带回同一对话的重复 thread wake-up。也称为 thread automation。",
    },
    {
      key: "Hook",
      href: "/codex/hooks",
      appliesTo: "App, CLI, IDE extension",
      description:
        "当 Codex event 匹配时运行的 lifecycle handler，例如 tool use、permission requests 或 turn 停止。",
    },
    {
      key: "Hook event",
      href: "/codex/hooks#config-shape",
      appliesTo: "App, CLI, IDE extension",
      description: "配置的 hook handlers 可以运行的生命周期点。",
    },
    {
      key: "Hunk",
      href: "/codex/app/review#staging-and-reverting-files",
      appliesTo: "App, Git, Review",
      description:
        "diff 中可独立 staged、unstaged 或 reverted 的连续片段。",
    },
    {
      key: "Inline comment",
      href: "/codex/app/review#inline-comments-for-feedback",
      appliesTo: "App",
      description: "附加到 diff 中特定行的反馈。",
    },
    {
      key: "Live web search",
      href: "/codex/config-basic#web-search-mode",
      appliesTo: "App, CLI, IDE extension",
      description: "用于当前信息的实时 web lookup。",
    },
    {
      key: "Local",
      href: "/codex/app/worktrees#working-between-local-and-worktree",
      appliesTo: "App, CLI, IDE extension",
      description: "Codex 在用户计算机上工作的模式。",
    },
    {
      key: "Local thread",
      href: "/codex/prompting#threads",
      appliesTo: "App, CLI, IDE extension",
      description: "在用户机器上运行的 thread。",
    },
    {
      key: "Maintenance script",
      href: "/codex/cloud/environments#container-caching",
      appliesTo: "Cloud",
      description: "cached cloud container 恢复时运行的可选脚本。",
    },
    {
      key: "Managed configuration",
      href: "/codex/enterprise/managed-configuration",
      appliesTo: "Enterprise",
      description: "组织控制的 Codex 默认值和限制。",
    },
    {
      key: "MCP",
      href: "/codex/mcp",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Model Context Protocol，一种用于将 Codex 连接到外部工具和上下文的标准。",
    },
    {
      key: "MCP resource",
      href: "/codex/mcp#supported-mcp-features",
      appliesTo: "App, CLI, IDE extension",
      description:
        "由 MCP server 暴露、可供 Codex 检查的可读上下文。",
    },
    {
      key: "MCP server",
      href: "/codex/mcp#supported-mcp-features",
      appliesTo: "App, CLI, IDE extension",
      description: "通过 MCP 暴露的外部工具或上下文提供方。",
    },
    {
      key: "MCP tool",
      href: "/codex/mcp#supported-mcp-features",
      appliesTo: "App, CLI, IDE extension",
      description:
        "由 MCP server 暴露、Codex 可在任务期间调用的 action。",
    },
    {
      key: "MDM",
      href: "/codex/enterprise/managed-configuration#macos-managed-preferences-mdm",
      appliesTo: "Enterprise",
      description:
        "用于分发 device profiles 和托管 Codex 设置的移动设备管理工具。",
    },
    {
      key: "Memories",
      href: "/codex/memories",
      appliesTo: "App, CLI, IDE extension",
      description: "Codex 可跨 sessions 复用的本地存储上下文。",
    },
    {
      key: "Model",
      href: "/codex/models",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description: "Codex 用于推理和工具工作的 AI model。",
    },
    {
      key: "Network access",
      href: "/codex/agent-approvals-security#network-access-",
      appliesTo: "App, CLI, IDE extension, Cloud",
      description:
        "允许命令或环境访问互联网的权限。",
    },
    {
      key: "Network policy",
      href: "/codex/agent-approvals-security#network-policy",
      appliesTo: "App, CLI, IDE extension",
      description:
        "基于 domain 的 allow 和 deny 规则，用于约束 sandboxed outbound network traffic。",
    },
    {
      key: "Non-interactive mode",
      href: "/codex/noninteractive",
      appliesTo: "CLI",
      description: "用于从脚本或 CI 运行 Codex 的 CLI 模式。",
    },
    {
      key: "Output schema",
      href: "/codex/noninteractive#create-structured-outputs-with-a-schema",
      appliesTo: "CLI",
      description:
        "传递给 `codex exec` 的 JSON Schema，用于约束最终响应。",
    },
    {
      key: "Permanent worktree",
      href: "/codex/app/worktrees#codex-managed-and-permanent-worktrees",
      appliesTo: "App",
      description: "作为自身项目保留的长期 worktree。",
    },
    {
      key: "Permission profile",
      href: "/codex/permissions#define-and-select-a-profile",
      appliesTo: "App, CLI, IDE extension",
      description:
        "命名的最小权限策略，将本地命令执行的 filesystem 和 network rules 组合在一起。",
    },
    {
      key: "Plan",
      href: "/codex/learn/best-practices#plan-first-for-difficult-tasks",
      appliesTo: "App, CLI, IDE extension, Cloud",
      description: "Codex 为完成任务提出或跟踪的步骤。",
    },
    {
      key: "Plugin",
      href: "/codex/plugins",
      appliesTo: "App, CLI, IDE extension",
      description:
        "可安装的 bundle，可分发 skills、tools 和 integrations。",
    },
    {
      key: "Plugin manifest",
      href: "/codex/plugins/build#plugin-structure",
      appliesTo: "App, CLI, IDE extension, Plugins",
      description:
        "标识 plugin 并指向 bundled skills、apps、MCP servers、hooks 和 metadata 的 plugin metadata file。",
    },
    {
      key: "Prefix rule",
      href: "/codex/rules#understand-the-rules-language",
      appliesTo: "App, CLI, IDE extension, Enterprise",
      description:
        "允许、提示确认或禁止匹配 command prefixes 的 command-rule pattern。",
    },
    {
      key: "Profile",
      href: "/codex/config-advanced#profiles",
      appliesTo: "CLI, IDE extension",
      description: "Codex 的命名配置 preset。",
    },
    {
      key: "Progressive disclosure",
      href: "/codex/skills",
      appliesTo: "App, CLI, IDE extension",
      description:
        "仅在需要时加载 skill details，以保留上下文。",
    },
    {
      key: "Project",
      href: "/codex/app/features#multitask-across-projects",
      appliesTo: "App",
      description: "Codex 工作所在的已选择代码库或文件夹。",
    },
    {
      key: "Prompt",
      href: "/codex/prompting",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description: "发送给 Codex 的用户指令或请求。",
    },
    {
      key: "Pull request review",
      href: "/codex/app/review#pull-request-reviews",
      appliesTo: "App, CLI, GitHub",
      description: "Codex 对变更的 review，或对 pull request 的反馈。",
    },
    {
      key: "RBAC",
      href: "/codex/enterprise/admin-setup#step-2-set-up-custom-roles-rbac",
      appliesTo: "Enterprise",
      description: "用于 workspace permissions 的基于角色的访问控制。",
    },
    {
      key: "Read-only mode",
      href: "/codex/concepts/sandboxing",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Codex 可以检查但不能在未经批准时修改的模式。",
    },
    {
      key: "Reasoning effort",
      href: "/codex/config-basic#reasoning-effort",
      appliesTo: "App, CLI, IDE extension, SDK",
      description:
        "控制模型使用多少 reasoning budget 的设置。",
    },
    {
      key: "Remote connection",
      href: "/codex/remote-connections",
      appliesTo: "App, Mobile",
      description:
        "让 Codex 通过 connected host 从另一台设备工作的连接。",
    },
    {
      key: "requirements.toml",
      href: "/codex/config-reference#requirementstoml",
      appliesTo: "Enterprise",
      description: "用于 managed Codex setups 的管理员强制 requirements 文件。",
    },
    {
      key: "Review pane",
      href: "/codex/app/review",
      appliesTo: "App",
      description: "用于检查 diffs、comments 和 Git changes 的 app view。",
    },
    {
      key: "Rules",
      href: "/codex/rules",
      appliesTo: "App, CLI, IDE extension",
      description:
        "允许、提示确认或拒绝 command prefixes 或 permission exceptions 的 policies。",
    },
    {
      key: "Sandbox",
      href: "/codex/concepts/sandboxing",
      appliesTo: "App, CLI, IDE extension",
      description:
        "限制 Codex commands 可以访问或修改内容的强制边界。",
    },
    {
      key: "Sandbox mode",
      href: "/codex/config-basic#sandbox-level",
      appliesTo: "App, CLI, IDE extension",
      description:
        "定义 Codex filesystem 和 network limits 的配置。",
    },
    {
      key: "Sandbox preset",
      href: "/codex/sdk#sandbox-presets",
      appliesTo: "SDK",
      description:
        "SDK 中用于常见 sandbox policies 的简写，例如 read-only、workspace-write 或 full access。",
    },
    {
      key: "Schedule",
      href: "/codex/app/automations",
      appliesTo: "App",
      description: "automation 的时间规则。",
    },
    {
      key: "Secret",
      href: "/codex/cloud/environments#environment-variables-and-secrets",
      appliesTo: "Cloud",
      description:
        "可供 setup scripts 使用、但会在 agent phase 前移除的加密值。",
    },
    {
      key: "Setup script",
      href: "/codex/app/local-environments#setup-scripts",
      appliesTo: "App worktrees",
      description:
        "agent 启动前运行的脚本，用于安装依赖或准备工具。",
    },
    {
      key: "Skill",
      href: "/codex/skills",
      appliesTo: "App, CLI, IDE extension",
      description:
        "可复用的 workflow package，包含指令以及可选 scripts 或 references。",
    },
    {
      key: "Skill invocation",
      href: "/codex/skills#how-codex-uses-skills",
      appliesTo: "App, CLI, IDE extension",
      description: "skill 的显式或隐式激活。",
    },
    {
      key: "Slash command",
      href: "/codex/cli/slash-commands",
      appliesTo: "CLI",
      description:
        "以前导斜杠输入的命令，用于控制或检查 Codex CLI session。",
    },
    {
      key: "Standalone automation",
      href: "/codex/app/automations",
      appliesTo: "App",
      description: "报告独立 findings 的独立计划运行。",
    },
    {
      key: "STDIO MCP server",
      href: "/codex/mcp#stdio-servers",
      appliesTo: "CLI, IDE extension",
      description:
        "由已配置 command 和 arguments 作为本地进程启动的 MCP server。",
    },
    {
      key: "Streamable HTTP MCP server",
      href: "/codex/mcp#streamable-http-servers",
      appliesTo: "CLI, IDE extension",
      description:
        "通过 HTTP 访问的 MCP server，可选使用 bearer token 或 OAuth 认证。",
    },
    {
      key: "Subagent",
      href: "/codex/concepts/subagents",
      appliesTo: "App, CLI",
      description: "为处理任务的一部分而生成的专用 child agent。",
    },
    {
      key: "Subagent workflow",
      href: "/codex/concepts/subagents#core-terms",
      appliesTo: "App, CLI",
      description:
        "Codex 并行运行 delegated agents 并合并其结果的 workflow。",
    },
    {
      key: "Task",
      href: "/codex/app/automations#managing-tasks",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description: "Codex 被要求完成的工作单元。",
    },
    {
      key: "Thread",
      href: "/codex/prompting#threads",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description:
        "包含 prompts、model output 和 tool activity 的单个 Codex session。",
    },
    {
      key: "Thread automation",
      href: "/codex/app/automations#thread-automations",
      appliesTo: "App",
      description:
        "附加到现有 thread 的 recurring wake-up。也称为 heartbeat。",
    },
    {
      key: "Thread fork",
      href: "/codex/app-server#start-or-resume-a-thread",
      appliesTo: "App-server, SDK",
      description:
        "从现有 thread 的 stored history 分支出来的新 thread。",
    },
    {
      key: "Turn",
      href: "/codex/app-server#core-primitives",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description:
        "thread 中的一次 exchange，通常包含一个 user prompt 加上 Codex response 和 actions。",
    },
    {
      key: "Universal image",
      href: "/codex/cloud/environments#default-universal-image",
      appliesTo: "Cloud",
      description:
        "预装常用工具的默认 Codex cloud container image。",
    },
    {
      key: "Web search cache",
      href: "/codex/config-basic#web-search-mode",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Codex 可在不进行 live browsing 的情况下使用的预索引搜索结果。",
    },
    {
      key: "Worktree",
      href: "/codex/app/worktrees",
      appliesTo: "App",
      description:
        "Codex 将变更隔离在单独 Git worktree 中的模式。",
    },
    {
      key: "Writable roots",
      href: "/codex/agent-approvals-security#protected-paths-in-writable-roots",
      appliesTo: "App, CLI, IDE extension",
      description: "Codex 被允许修改的目录。",
    },
  ]}
/&gt;

:::

## English source

::: details 展开英文原文
::: v-pre
Use this glossary as a quick reference for Codex terms across the app, CLI, IDE extension, cloud, SDK, and related integrations.

&lt;GlossaryTable
  client:load
  searchPlaceholder="Filter by term, definition, or surface"
  searchLabel="Search glossary terms"
  emptyStateMessage="No glossary terms match your search."
  maxVisibleEntries={100}
  options={[
    {
      key: "Agent",
      href: "/codex",
      appliesTo: "App, CLI, IDE extension, Cloud",
      description:
        "The Codex worker that reasons over context, uses tools, and completes a task.",
    },
    {
      key: "AGENTS.md",
      href: "/codex/guides/agents-md",
      appliesTo: "App, CLI, IDE extension, Cloud",
      description:
        "Repository or user guidance file that gives Codex persistent instructions.",
    },
    {
      key: "Analytics dashboard",
      href: "/codex/enterprise/governance#analytics-dashboard",
      appliesTo: "Enterprise",
      description:
        "Admin view for Codex usage, adoption, and code review metrics.",
    },
    {
      key: "API key sign-in",
      href: "/codex/auth#sign-in-with-an-api-key",
      appliesTo: "App, CLI, IDE extension",
      description: "Authentication using an OpenAI API key.",
    },
    {
      key: "Approval policy",
      href: "/codex/agent-approvals-security#sandbox-and-approvals",
      appliesTo: "App, CLI, IDE extension",
      description: "Rules for when Codex must ask before taking an action.",
    },
    {
      key: "Approval request",
      href: "/codex/agent-approvals-security#automatic-approval-reviews",
      appliesTo: "App, CLI, IDE extension",
      description: "Codex asking to allow a restricted action.",
    },
    {
      key: "Apps (connectors)",
      href: "/codex/plugins",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Integration that lets Codex access external services. Available through plugins; also called connectors.",
    },
    {
      key: "Appshot",
      href: "/codex/appshots",
      appliesTo: "App",
      description:
        "Snapshot of the frontmost app window sent to a Codex thread.",
    },
    {
      key: "Auth cache",
      href: "/codex/auth#login-caching",
      appliesTo: "App, CLI, IDE extension",
      description: "Locally stored login credentials reused by Codex.",
    },
    {
      key: "Automatic approval review",
      href: "/codex/agent-approvals-security#automatic-approval-reviews",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Model-based review of eligible approval requests before they proceed.",
    },
    {
      key: "Automation",
      href: "/codex/app/automations",
      appliesTo: "App",
      description: "A scheduled or recurring Codex task.",
    },
    {
      key: "Automation run",
      href: "/codex/app/automations#managing-tasks",
      appliesTo: "App",
      description:
        "One execution of a scheduled automation that may report findings or archive itself.",
    },
    {
      key: "Browser use",
      href: "/codex/app/browser#browser-use",
      appliesTo: "App",
      description:
        "App capability that lets Codex operate the in-app browser directly.",
    },
    {
      key: "Chat",
      href: "/codex/app/features#chats",
      appliesTo: "App",
      description: "A Codex conversation not tied to a project.",
    },
    {
      key: "ChatGPT sign-in",
      href: "/codex/auth#sign-in-with-chatgpt",
      appliesTo: "App, CLI, IDE extension, Cloud",
      description:
        "Authentication using a ChatGPT account and workspace permissions.",
    },
    {
      key: "Chronicle",
      href: "/codex/memories/chronicle",
      appliesTo: "App",
      description:
        "Opt-in feature that builds memories from recent screen context.",
    },
    {
      key: "Cloud",
      href: "/codex/cloud",
      appliesTo: "App, IDE extension, Web",
      description:
        "Mode where Codex works remotely in an OpenAI-managed environment.",
    },
    {
      key: "Cloud environment",
      href: "/codex/cloud/environments",
      appliesTo: "Cloud",
      description: "Configured container setup used for Codex cloud tasks.",
    },
    {
      key: "Cloud task",
      href: "/codex/cloud/environments#how-codex-cloud-tasks-run",
      appliesTo: "Cloud",
      description:
        "A remotely executed Codex task that runs in a cloud environment.",
    },
    {
      key: "Cloud thread",
      href: "/codex/prompting#threads",
      appliesTo: "Cloud",
      description: "A thread that runs in a Codex cloud environment.",
    },
    {
      key: "Codex",
      href: "/codex",
      appliesTo: "App, CLI, IDE extension, Web, Cloud, SDK",
      description: "OpenAI's coding agent for software development tasks.",
    },
    {
      key: "Codex app",
      href: "/codex/app",
      appliesTo: "Desktop",
      description:
        "Desktop app for running Codex threads in parallel, with built-in worktree support, automations, and Git functionality.",
    },
    {
      key: "Codex app-server",
      href: "/codex/app-server",
      appliesTo: "App, IDE extension, SDK",
      description:
        "Local JSON-RPC server for embedding Codex threads, turns, approvals, history, and streamed events in custom clients.",
    },
    {
      key: "Codex CLI",
      href: "/codex/cli",
      appliesTo: "Terminal",
      description:
        "Terminal client for running Codex interactively or in scripts.",
    },
    {
      key: "Codex cloud",
      href: "/codex/cloud",
      appliesTo: "Web, App, IDE extension",
      description:
        "OpenAI-managed execution environment where Codex can work on repository tasks remotely.",
    },
    {
      key: "codex exec",
      href: "/codex/noninteractive",
      appliesTo: "CLI",
      description:
        "CLI command for running Codex non-interactively from scripts or CI.",
    },
    {
      key: "Codex IDE extension",
      href: "/codex/ide",
      appliesTo: "IDE",
      description:
        "Editor integration for using Codex inside IDEs like VS Code, JetBrains IDEs, Cursor, and Windsurf.",
    },
    {
      key: "Codex SDK",
      href: "/codex/sdk",
      appliesTo: "SDK",
      description:
        "Programmatic interface for building Codex-powered workflows or integrations.",
    },
    {
      key: "Codex web",
      href: "/codex/cloud",
      appliesTo: "Browser",
      description: "Browser-based Codex surface for delegating cloud tasks.",
    },
    {
      key: "Codex-managed worktree",
      href: "/codex/app/worktrees#codex-managed-and-permanent-worktrees",
      appliesTo: "App",
      description:
        "A temporary worktree Codex creates and manages for a thread.",
    },
    {
      key: "Compaction",
      href: "/codex/prompting#context",
      appliesTo: "App, CLI, IDE extension, Cloud",
      description:
        "Summarizing older context so long-running work can continue.",
    },
    {
      key: "Compliance API",
      href: "/codex/enterprise/governance#compliance-api",
      appliesTo: "Enterprise",
      description: "API for exporting Codex activity and audit metadata.",
    },
    {
      key: "Computer use",
      href: "/codex/app/computer-use",
      appliesTo: "App",
      description:
        "App capability that lets Codex interact with desktop applications through the UI.",
    },
    {
      key: "config.toml",
      href: "/codex/config-reference#configtoml",
      appliesTo: "App, CLI, IDE extension",
      description: "Local Codex configuration files.",
    },
    {
      key: "Connected host",
      href: "/codex/remote-connections#what-comes-from-the-connected-host",
      appliesTo: "App, Mobile",
      description:
        "Computer or development environment that provides files, tools, and shell access for remote Codex work.",
    },
    {
      key: "Connector",
      href: "/codex/plugins",
      appliesTo: "App, Cloud",
      description:
        "App integration that lets Codex access external services. Available through plugins; also called apps.",
    },
    {
      key: "Container cache",
      href: "/codex/cloud/environments#container-caching",
      appliesTo: "Cloud",
      description:
        "Saved cloud container state reused to speed up future tasks.",
    },
    {
      key: "Context",
      href: "/codex/prompting#context",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description:
        "Information Codex can use while working, such as files, prior messages, tool output, and instructions.",
    },
    {
      key: "Context window",
      href: "/api/docs/guides/conversation-state#managing-the-context-window",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description:
        "The maximum amount of information the model can consider at once.",
    },
    {
      key: "Custom agent",
      href: "/codex/subagents#custom-agents",
      appliesTo: "App, CLI",
      description:
        "User-defined agent role with its own instructions and settings.",
    },
    {
      key: "Deny-read rule",
      href: "/codex/permissions#deny-reads-with-exact-paths-or-globs",
      appliesTo: "App, CLI, IDE extension, Enterprise",
      description:
        "Filesystem permission rule that prevents Codex from reading sensitive paths or glob matches.",
    },
    {
      key: "Diff",
      href: "/codex/app/review#what-changes-it-shows",
      appliesTo: "App, Git, Review",
      description:
        "Set of Git file changes shown for inspection, comments, staging, or reverting.",
    },
    {
      key: "Domain allowlist",
      href: "/codex/cloud/internet-access#domain-allowlist",
      appliesTo: "Cloud",
      description:
        "Set of domains Codex cloud can reach when agent internet access is enabled.",
    },
    {
      key: "Environment (local)",
      href: "/codex/app/local-environments",
      appliesTo: "App, Worktree",
      description:
        "App configuration to tell Codex how to set up worktrees for a project.",
    },
    {
      key: "Environment variable",
      href: "/codex/cloud/environments#environment-variables-and-secrets",
      appliesTo: "Cloud, CLI, IDE extension",
      description:
        "Runtime configuration value available during task execution.",
    },
    {
      key: "Ephemeral session",
      href: "/codex/noninteractive#basic-usage",
      appliesTo: "CLI",
      description:
        "Non-interactive run that skips saving session state after it completes.",
    },
    {
      key: "Fast mode",
      href: "/codex/speed#fast-mode",
      appliesTo: "CLI, IDE extension",
      description:
        "Speed setting that makes supported models respond faster at a higher credit cost.",
    },
    {
      key: "Filesystem permission",
      href: "/codex/permissions#filesystem-permissions",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Permission profile rule that grants or denies read and write access to paths.",
    },
    {
      key: "Finding",
      href: "/codex/app/automations#managing-tasks",
      appliesTo: "App",
      description: "A notable result or issue surfaced by an automation.",
    },
    {
      key: "Full access",
      href: "/codex/concepts/sandboxing#configure-defaults",
      appliesTo: "App, CLI, IDE extension",
      description: "Mode where Codex runs without normal sandbox restrictions.",
    },
    {
      key: "Git worktree",
      href: "/codex/app/worktrees#whats-a-worktree",
      appliesTo: "App, Git",
      description:
        "A second checkout of the same repository for parallel branch work.",
    },
    {
      key: "Handoff",
      href: "/codex/app/worktrees#working-between-local-and-worktree",
      appliesTo: "App",
      description: "Moving a thread and its work between Local and Worktree.",
    },
    {
      key: "Heartbeat",
      href: "/codex/app/automations#thread-automations",
      appliesTo: "App",
      description:
        "A recurring thread wake-up that returns Codex to the same conversation on a schedule. Also called a thread automation.",
    },
    {
      key: "Hook",
      href: "/codex/hooks",
      appliesTo: "App, CLI, IDE extension",
      description:
        "A lifecycle handler that runs when a Codex event matches, such as tool use, permission requests, or when a turn stops.",
    },
    {
      key: "Hook event",
      href: "/codex/hooks#config-shape",
      appliesTo: "App, CLI, IDE extension",
      description: "Lifecycle point where configured hook handlers can run.",
    },
    {
      key: "Hunk",
      href: "/codex/app/review#staging-and-reverting-files",
      appliesTo: "App, Git, Review",
      description:
        "Contiguous section of a diff that can be staged, unstaged, or reverted independently.",
    },
    {
      key: "Inline comment",
      href: "/codex/app/review#inline-comments-for-feedback",
      appliesTo: "App",
      description: "Line-specific feedback attached to a diff.",
    },
    {
      key: "Live web search",
      href: "/codex/config-basic#web-search-mode",
      appliesTo: "App, CLI, IDE extension",
      description: "Real-time web lookup for current information.",
    },
    {
      key: "Local",
      href: "/codex/app/worktrees#working-between-local-and-worktree",
      appliesTo: "App, CLI, IDE extension",
      description: "Mode where Codex works on the user's computer.",
    },
    {
      key: "Local thread",
      href: "/codex/prompting#threads",
      appliesTo: "App, CLI, IDE extension",
      description: "A thread that runs on the user's machine.",
    },
    {
      key: "Maintenance script",
      href: "/codex/cloud/environments#container-caching",
      appliesTo: "Cloud",
      description: "Optional script run when a cached cloud container resumes.",
    },
    {
      key: "Managed configuration",
      href: "/codex/enterprise/managed-configuration",
      appliesTo: "Enterprise",
      description: "Organization-controlled Codex defaults and restrictions.",
    },
    {
      key: "MCP",
      href: "/codex/mcp",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Model Context Protocol, a standard for connecting Codex to external tools and context.",
    },
    {
      key: "MCP resource",
      href: "/codex/mcp#supported-mcp-features",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Readable context exposed by an MCP server for Codex to inspect.",
    },
    {
      key: "MCP server",
      href: "/codex/mcp#supported-mcp-features",
      appliesTo: "App, CLI, IDE extension",
      description: "External tool or context provider exposed through MCP.",
    },
    {
      key: "MCP tool",
      href: "/codex/mcp#supported-mcp-features",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Action exposed by an MCP server that Codex can call during a task.",
    },
    {
      key: "MDM",
      href: "/codex/enterprise/managed-configuration#macos-managed-preferences-mdm",
      appliesTo: "Enterprise",
      description:
        "Mobile device management tooling for distributing device profiles and managed Codex settings.",
    },
    {
      key: "Memories",
      href: "/codex/memories",
      appliesTo: "App, CLI, IDE extension",
      description: "Locally stored context Codex can reuse across sessions.",
    },
    {
      key: "Model",
      href: "/codex/models",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description: "The AI model Codex uses for reasoning and tool work.",
    },
    {
      key: "Network access",
      href: "/codex/agent-approvals-security#network-access-",
      appliesTo: "App, CLI, IDE extension, Cloud",
      description:
        "Permission for commands or environments to reach the internet.",
    },
    {
      key: "Network policy",
      href: "/codex/agent-approvals-security#network-policy",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Domain-based allow and deny rules that constrain sandboxed outbound network traffic.",
    },
    {
      key: "Non-interactive mode",
      href: "/codex/noninteractive",
      appliesTo: "CLI",
      description: "CLI mode for running Codex from scripts or CI.",
    },
    {
      key: "Output schema",
      href: "/codex/noninteractive#create-structured-outputs-with-a-schema",
      appliesTo: "CLI",
      description:
        "JSON Schema passed to `codex exec` to constrain the final response.",
    },
    {
      key: "Permanent worktree",
      href: "/codex/app/worktrees#codex-managed-and-permanent-worktrees",
      appliesTo: "App",
      description: "A long-lived worktree kept as its own project.",
    },
    {
      key: "Permission profile",
      href: "/codex/permissions#define-and-select-a-profile",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Named least-privilege policy that combines filesystem and network rules for local command execution.",
    },
    {
      key: "Plan",
      href: "/codex/learn/best-practices#plan-first-for-difficult-tasks",
      appliesTo: "App, CLI, IDE extension, Cloud",
      description: "Codex's proposed or tracked steps for completing a task.",
    },
    {
      key: "Plugin",
      href: "/codex/plugins",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Installable bundle that can distribute skills, tools, and integrations.",
    },
    {
      key: "Plugin manifest",
      href: "/codex/plugins/build#plugin-structure",
      appliesTo: "App, CLI, IDE extension, Plugins",
      description:
        "Plugin metadata file that identifies a plugin and points to bundled skills, apps, MCP servers, hooks, and metadata.",
    },
    {
      key: "Prefix rule",
      href: "/codex/rules#understand-the-rules-language",
      appliesTo: "App, CLI, IDE extension, Enterprise",
      description:
        "Command-rule pattern that allows, prompts for, or forbids matching command prefixes.",
    },
    {
      key: "Profile",
      href: "/codex/config-advanced#profiles",
      appliesTo: "CLI, IDE extension",
      description: "Named configuration preset for Codex.",
    },
    {
      key: "Progressive disclosure",
      href: "/codex/skills",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Loading skill details only when needed to preserve context.",
    },
    {
      key: "Project",
      href: "/codex/app/features#multitask-across-projects",
      appliesTo: "App",
      description: "A selected codebase or folder Codex works in.",
    },
    {
      key: "Prompt",
      href: "/codex/prompting",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description: "The user instruction or request sent to Codex.",
    },
    {
      key: "Pull request review",
      href: "/codex/app/review#pull-request-reviews",
      appliesTo: "App, CLI, GitHub",
      description: "Codex review of changes or feedback on a pull request.",
    },
    {
      key: "RBAC",
      href: "/codex/enterprise/admin-setup#step-2-set-up-custom-roles-rbac",
      appliesTo: "Enterprise",
      description: "Role-based access control for workspace permissions.",
    },
    {
      key: "Read-only mode",
      href: "/codex/concepts/sandboxing",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Mode where Codex can inspect but not modify without approval.",
    },
    {
      key: "Reasoning effort",
      href: "/codex/config-basic#reasoning-effort",
      appliesTo: "App, CLI, IDE extension, SDK",
      description:
        "Setting that controls how much reasoning budget a model uses.",
    },
    {
      key: "Remote connection",
      href: "/codex/remote-connections",
      appliesTo: "App, Mobile",
      description:
        "Connection that lets Codex work from another device using a connected host.",
    },
    {
      key: "requirements.toml",
      href: "/codex/config-reference#requirementstoml",
      appliesTo: "Enterprise",
      description: "Admin-enforced requirements file for managed Codex setups.",
    },
    {
      key: "Review pane",
      href: "/codex/app/review",
      appliesTo: "App",
      description: "App view for inspecting diffs, comments, and Git changes.",
    },
    {
      key: "Rules",
      href: "/codex/rules",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Policies that allow, prompt for, or deny command prefixes or permission exceptions.",
    },
    {
      key: "Sandbox",
      href: "/codex/concepts/sandboxing",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Enforced boundary limiting what Codex commands can access or modify.",
    },
    {
      key: "Sandbox mode",
      href: "/codex/config-basic#sandbox-level",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Configuration that defines Codex's filesystem and network limits.",
    },
    {
      key: "Sandbox preset",
      href: "/codex/sdk#sandbox-presets",
      appliesTo: "SDK",
      description:
        "SDK shorthand for common sandbox policies such as read-only, workspace-write, or full access.",
    },
    {
      key: "Schedule",
      href: "/codex/app/automations",
      appliesTo: "App",
      description: "The timing rule for an automation.",
    },
    {
      key: "Secret",
      href: "/codex/cloud/environments#environment-variables-and-secrets",
      appliesTo: "Cloud",
      description:
        "Encrypted value available to setup scripts but removed before the agent phase.",
    },
    {
      key: "Setup script",
      href: "/codex/app/local-environments#setup-scripts",
      appliesTo: "App worktrees",
      description:
        "Script run before the agent starts to install dependencies or prepare tools.",
    },
    {
      key: "Skill",
      href: "/codex/skills",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Reusable workflow package with instructions and optional scripts or references.",
    },
    {
      key: "Skill invocation",
      href: "/codex/skills#how-codex-uses-skills",
      appliesTo: "App, CLI, IDE extension",
      description: "Explicit or implicit activation of a skill.",
    },
    {
      key: "Slash command",
      href: "/codex/cli/slash-commands",
      appliesTo: "CLI",
      description:
        "Command entered with a leading slash to control or inspect a Codex CLI session.",
    },
    {
      key: "Standalone automation",
      href: "/codex/app/automations",
      appliesTo: "App",
      description: "Independent scheduled run that reports separate findings.",
    },
    {
      key: "STDIO MCP server",
      href: "/codex/mcp#stdio-servers",
      appliesTo: "CLI, IDE extension",
      description:
        "MCP server launched as a local process by a configured command and arguments.",
    },
    {
      key: "Streamable HTTP MCP server",
      href: "/codex/mcp#streamable-http-servers",
      appliesTo: "CLI, IDE extension",
      description:
        "MCP server reached over HTTP, optionally with bearer token or OAuth authentication.",
    },
    {
      key: "Subagent",
      href: "/codex/concepts/subagents",
      appliesTo: "App, CLI",
      description: "Specialized child agent spawned to work on part of a task.",
    },
    {
      key: "Subagent workflow",
      href: "/codex/concepts/subagents#core-terms",
      appliesTo: "App, CLI",
      description:
        "Workflow where Codex runs delegated agents in parallel and combines their results.",
    },
    {
      key: "Task",
      href: "/codex/app/automations#managing-tasks",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description: "The unit of work Codex is asked to complete.",
    },
    {
      key: "Thread",
      href: "/codex/prompting#threads",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description:
        "A single Codex session containing prompts, model output, and tool activity.",
    },
    {
      key: "Thread automation",
      href: "/codex/app/automations#thread-automations",
      appliesTo: "App",
      description:
        "Recurring wake-up attached to an existing thread. Also called a heartbeat.",
    },
    {
      key: "Thread fork",
      href: "/codex/app-server#start-or-resume-a-thread",
      appliesTo: "App-server, SDK",
      description:
        "New thread branched from the stored history of an existing thread.",
    },
    {
      key: "Turn",
      href: "/codex/app-server#core-primitives",
      appliesTo: "App, CLI, IDE extension, Cloud, SDK",
      description:
        "One exchange in a thread, usually a user prompt plus Codex's response and actions.",
    },
    {
      key: "Universal image",
      href: "/codex/cloud/environments#default-universal-image",
      appliesTo: "Cloud",
      description:
        "Default Codex cloud container image with common tools preinstalled.",
    },
    {
      key: "Web search cache",
      href: "/codex/config-basic#web-search-mode",
      appliesTo: "App, CLI, IDE extension",
      description:
        "Pre-indexed search results Codex can use without live browsing.",
    },
    {
      key: "Worktree",
      href: "/codex/app/worktrees",
      appliesTo: "App",
      description:
        "Mode where Codex isolates changes in a separate Git worktree.",
    },
    {
      key: "Writable roots",
      href: "/codex/agent-approvals-security#protected-paths-in-writable-roots",
      appliesTo: "App, CLI, IDE extension",
      description: "Directories Codex is allowed to modify.",
    },
  ]}
/&gt;

:::
:::

