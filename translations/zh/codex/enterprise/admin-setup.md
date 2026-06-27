---
status: needs-review
sourceId: "ec7392684496"
sourceChecksum: "ec7392684496715b28eac55d391cc98cb16d630d736c2dd0e7a5a760daef55f8"
sourceUrl: "https://developers.openai.com/codex/enterprise/admin-setup"
translatedAt: "2026-06-27T19:06:42.8400589+08:00"
translator: codex-gpt-5.5-xhigh
---

# 管理员设置

<div class="max-w-1xl mx-auto">
  <img src="https://developers.openai.com/images/codex/codex_enterprise_admin.png"
    alt="Codex 企业管理员开关"
    class="block w-full mx-auto rounded-lg"
  />
</div>



本指南面向希望为其 workspace 设置 Codex 的 ChatGPT Enterprise 管理员。

请将本页作为分步 rollout 指南。有关详细的策略、配置、自动化和监控信息，请使用链接页面：[Authentication](https://developers.openai.com/codex/auth)、[Agent approvals & security](https://developers.openai.com/codex/agent-approvals-security)、[Access tokens](https://developers.openai.com/codex/enterprise/access-tokens)、[Managed configuration](https://developers.openai.com/codex/enterprise/managed-configuration) 和 [Governance](https://developers.openai.com/codex/enterprise/governance)。

## 企业级安全和隐私

Codex 支持 ChatGPT Enterprise 安全功能，包括：

- 不使用企业数据进行训练
- 遵循 ChatGPT Enterprise 策略的数据驻留和保留
- 精细的用户访问控制
- 静态数据加密（AES-256）和传输中加密（TLS 1.2+）
- 通过 ChatGPT Compliance API 进行审计日志记录

有关安全控制和运行时保护，请参阅 [Agent approvals & security](https://developers.openai.com/codex/agent-approvals-security)。有关更多详情，请参阅 [Zero Data Retention (ZDR)](https://platform.openai.com/docs/guides/your-data#zero-data-retention)。
如需更广泛的企业安全概览，请参阅 [Codex security white paper](https://trust.openai.com/?itemUid=382f924d-54f3-43a8-a9df-c39e6c959958&source=click)。

## 前提条件：确定负责人和 rollout 策略

在 rollout 过程中，团队成员可能会支持将 Codex 集成到组织中的不同方面。请确保你有以下负责人：

- **ChatGPT Enterprise workspace owner：** 配置 workspace 中的 Codex 设置所必需。
- **Security owner：** 决定 Codex 的 agent 权限设置。
- **Analytics owner：** 将分析和合规 API 集成到你的数据管道中。

决定你将使用哪些 Codex 界面：

- **Codex local：** 包括 Codex app、CLI 和 IDE 扩展。Agent 在开发者计算机上的 sandbox 中运行。
- **Codex cloud：** 包括托管的 Codex 功能（包括 Codex cloud、iOS、Code Review，以及由 [Slack integration](https://developers.openai.com/codex/integrations/slack) 或 [Linear integration](https://developers.openai.com/codex/integrations/linear) 创建的任务）。Agent 在托管容器中远程运行，并访问你的代码库。
- **两者：** 同时使用 local + cloud。

你可以启用 local、cloud 或两者，并通过 workspace 设置和基于角色的访问控制（RBAC）控制访问权限。

## 第 1 步：在你的 workspace 中启用 Codex

你可以在 ChatGPT Enterprise workspace 设置中配置 Codex 访问权限。

前往 [Workspace Settings > Settings and Permissions](https://chatgpt.com/admin/settings)。

### Codex local

对于新的 ChatGPT Enterprise workspace，Codex local 默认启用。如果你不是 ChatGPT workspace owner，可以通过[安装 Codex](https://developers.openai.com/codex/quickstart) 并使用工作 email 登录来测试自己是否有访问权限。

开启 **Allow members to use Codex Local**。

这会允许获准用户使用 Codex app、CLI 和 IDE 扩展。

如果成员需要程序化 Codex local 工作流，请在 **Access tokens** 区域或通过自定义角色授予 **Allow users to create access tokens**。Workspace owners 和 admins 可以在 **Codex Local** 区域中使用 **Access token expiration limit** 设置成员为新令牌可选择的最长过期时间。有关设置和权限详情，请参阅 [Access tokens](https://developers.openai.com/codex/enterprise/access-tokens)。

如果 Codex Local 开关关闭，尝试使用 Codex app、CLI 或 IDE 的用户将看到以下错误：“403 - Unauthorized. Contact your ChatGPT administrator for access.”

#### 为 Codex CLI 启用设备码认证

允许开发者在非交互式环境（例如远程开发机器）中使用 Codex CLI 时通过设备码登录。更多详情请参阅 [authentication](https://developers.openai.com/codex/auth/)。

<div class="max-w-1xl mx-auto py-1">
  <img src="https://developers.openai.com/images/codex/enterprise/local-toggle-config.png"
    alt="Codex local 开关"
    class="block w-full mx-auto rounded-lg"
  />
</div>

### Codex cloud

### 前提条件

Codex cloud 需要 **GitHub（cloud-hosted）仓库**。如果你的代码库位于本地部署环境或不在 GitHub 上，可以使用 Codex SDK 在自己的基础设施上构建类似工作流。

作为管理员设置 Codex 时，你必须拥有组织中常用仓库的 GitHub 访问权限。如果你没有必要权限，请与你工程团队中的相关人员协作。

### 在 workspace 设置中启用 Codex cloud

首先在 [Workspace Settings > Settings and Permissions](https://chatgpt.com/admin/settings) 的 Codex 区域中开启 ChatGPT GitHub Connector。

要为你的 workspace 启用 Codex cloud，请开启 **Allow members to use Codex cloud**。启用后，用户可以从 ChatGPT 左侧导航面板直接访问 Codex。

请注意，Codex 可能最多需要 10 分钟才会出现在 ChatGPT 中。

#### 启用 Codex Slack app 在任务完成时发布答案

任务完成时，Codex 会将完整答案发布回 Slack。否则，Codex 只发布任务链接。

要了解更多信息，请参阅 [Codex in Slack](https://developers.openai.com/codex/integrations/slack)。

#### 启用 Codex agent 访问互联网

默认情况下，Codex cloud agents 在运行时没有互联网访问权限，以帮助防范 prompt injection 等安全和安全性风险。

此设置允许用户为常见软件依赖域名使用 allowlist、添加域名和受信任站点，并指定允许的 HTTP 方法。

有关互联网访问和运行时控制的安全影响，请参阅 [Agent approvals & security](https://developers.openai.com/codex/agent-approvals-security)。

<div class="max-w-1xl mx-auto py-1">
  <img src="https://developers.openai.com/images/codex/enterprise/cloud-toggle-config.png"
    alt="Codex cloud 开关"
    class="block w-full mx-auto rounded-lg"
  />
</div>

## 第 2 步：设置自定义角色（RBAC）

使用 RBAC 对 Codex local 和 Codex cloud 的访问进行细粒度权限控制。

<div class="max-w-1xl mx-auto">
  <img src="https://developers.openai.com/images/codex/enterprise/rbac_custom_roles.png"
    alt="Codex cloud 开关"
    class="block w-full mx-auto rounded-lg"
  />
</div>

### RBAC 能让你做什么

Workspace Owners 可以在 ChatGPT 管理设置中使用 RBAC 来：

- 为未分配任何自定义角色的用户设置默认角色
- 创建具有细粒度权限的自定义角色
- 将一个或多个自定义角色分配给 Groups
- 通过 SCIM 自动将用户同步到 Groups
- 从 Custom Roles 标签集中管理角色

用户可以继承多个角色，权限会解析为这些角色中最宽松（限制最少）的访问。

### 创建 Codex Admin 组

设置专门的 "Codex Admin" 组，而不是将 Codex 管理权限授予过宽的人群。

**Allow members to administer Codex** 开关会授予 Codex Admin 角色。Codex Admins 可以：

- 查看 Codex [workspace analytics](https://chatgpt.com/codex/settings/analytics)
- 打开 Codex [Policies page](https://chatgpt.com/codex/settings/policies)，管理 cloud-managed `requirements.toml` 策略
- 将这些托管策略分配给用户组，或配置默认 fallback 策略
- 管理 Codex cloud environments，包括编辑和删除 environments

请将此角色用于负责 Codex rollout、策略管理和治理的小范围管理员。普通 Codex 用户不需要此角色。启用此开关不需要 Codex cloud。

推荐的 rollout 模式：

- 为应使用 Codex 的人员创建 "Codex Users" 组
- 为应管理 Codex 设置和策略的较小人群创建单独的 "Codex Admin" 组
- 仅将启用了 **Allow members to administer Codex** 的自定义角色分配给 "Codex Admin" 组
- 将 "Codex Admin" 组成员限制为 workspace owners 或指定的平台、IT 和治理运维人员
- 如果使用 SCIM，请让身份提供商支持 "Codex Admin" 组，使成员变更可审计并集中管理

这种分离让 Codex rollout 更容易，同时将 analytics、environment 管理和策略部署限制给受信任管理员。有关 RBAC 设置详情和完整权限模型，请参阅 [OpenAI RBAC Help Center article](https://help.openai.com/en/articles/11750701-rbac)。

## 第 3 步：配置 Codex local requirements

Codex Admins 可以从 Codex [Policies page](https://chatgpt.com/codex/settings/policies) 部署管理员强制执行的 `requirements.toml` 策略。

当你想对不同 groups 应用不同的本地 Codex 约束，而不先分发设备级文件时，请使用此页面。托管策略使用 [Managed configuration](https://developers.openai.com/codex/enterprise/managed-configuration) 中描述的同一 `requirements.toml` 格式，因此你可以定义允许的 approval policies、sandbox modes、web search behavior、MCP server allowlists、feature pins 和 restrictive command rules。要禁用 Browser Use、in-app browser 或 Computer Use，请参阅 [Pin feature flags](https://developers.openai.com/codex/enterprise/managed-configuration#pin-feature-flags)。

<div class="max-w-1xl mx-auto py-1">
  <img src="https://developers.openai.com/images/codex/enterprise/policies_and_configurations_page.png"
    alt="Codex policies and configurations 页面"
    class="block w-full mx-auto rounded-lg"
  />
</div>

推荐设置：

1. 为多数用户创建 baseline 策略，只有在需要时才创建更严格或更宽松的变体。
2. 将每个托管策略分配给特定用户组，并为其他所有人配置默认 fallback 策略。
3. 谨慎排列 group 规则。如果用户匹配多个 group-specific 规则，则应用第一个匹配规则。
4. 将每个策略视为该 group 的完整配置文件。Codex 不会从后续匹配的 group 规则中填补缺失字段。

这些 cloud-managed 策略会在用户使用 ChatGPT 登录时应用到各个 Codex local 界面，包括 Codex app、CLI 和 IDE 扩展。

### requirements.toml 策略示例

使用 cloud-managed `requirements.toml` 策略，为每个 group 强制执行你需要的防护栏。以下片段是可供你改编的示例，并非必需设置。

对于 Codex 0.138.0 或更高版本，请优先使用带托管 `default_permissions` 的 `allowed_permission_profiles`。仅对仍配置 `sandbox_mode` 的旧部署使用 `allowed_sandbox_modes`。

<div class="max-w-1xl mx-auto py-1">
  <img src="https://developers.openai.com/images/codex/enterprise/example_policy.png"
    alt="托管 requirements 策略示例"
    class="block w-full mx-auto rounded-lg"
  />
</div>

示例：为标准本地 rollout 限制 web search、sandbox mode 和 approvals：

```toml
allowed_web_search_modes = ["disabled", "cached"]
allowed_sandbox_modes = ["workspace-write"]
allowed_approval_policies = ["on-request"]
```

示例：为已升级 fleet 允许标准 permission profiles：

Permission-profile allowlists 需要 Codex 0.138.0 或更高版本。仅在所有受管 client 都运行支持版本之后使用此示例。

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

示例：当你希望管理员阻止或 gate 特定命令时，添加 restrictive command rule：

```toml
[rules]
prefix_rules = [
  { pattern = [{ token = "git" }, { any_of = ["push", "commit"] }], decision = "prompt", justification = "Require review before mutating remote history." },
]
```

你可以单独使用任一示例，也可以将它们组合到同一个 group 的托管策略中。有关精确 key、优先级和更多示例，请参阅 [Managed configuration](https://developers.openai.com/codex/enterprise/managed-configuration) 和 [Agent approvals & security](https://developers.openai.com/codex/agent-approvals-security)。

### 检查用户策略

使用工作流末尾的策略查询工具确认哪个托管策略适用于某个用户。你可以按 group 检查策略分配，也可以输入用户 email 检查。

<div class="max-w-1xl mx-auto py-1">
  <img src="https://developers.openai.com/images/codex/enterprise/policy_lookup.png"
    alt="按 group 或用户 email 查询策略"
    class="block w-full mx-auto rounded-lg"
  />
</div>

如果你计划限制本地 clients 的登录方式或 workspace，请参阅 [Authentication](https://developers.openai.com/codex/auth) 中管理员管理的认证限制。

## 第 4 步：使用 Team Config 标准化本地配置

希望在组织内标准化 Codex 的团队可以使用 Team Config 共享 defaults、rules 和 skills，而无需在每个本地配置中重复设置。

你可以将 Team Config 设置提交到仓库的 `.codex` 目录下。用户打开该仓库时，Codex 会自动选取 Team Config 设置。

从流量最高的仓库开始使用 Team Config，让团队在最常使用 Codex 的地方获得一致行为。

| 类型 | 路径 | 用途 |
| ------------------------------------ | ------------- | ---------------------------------------------------------------------------- |
| [Config basics](https://developers.openai.com/codex/config-basic) | `config.toml` | 设置 sandbox mode、approvals、model、reasoning effort 等默认值。 |
| [Rules](https://developers.openai.com/codex/rules) | `rules/` | 控制 Codex 可以在 sandbox 外运行哪些命令。 |
| [Skills](https://developers.openai.com/codex/skills) | `skills/` | 让共享 skills 可供你的团队使用。 |

有关位置和优先级，请参阅 [Config basics](https://developers.openai.com/codex/config-basic#configuration-precedence)。

## 第 5 步：配置 Codex cloud 使用情况（如果已启用）

此步骤涵盖启用 Codex cloud workspace 开关后的仓库和 environment 设置。

### 将 Codex cloud 连接到仓库

1. 导航到 [Codex](https://chatgpt.com/codex)，并选择 **Get started**
2. 选择 **Connect to GitHub** 安装 ChatGPT GitHub Connector（如果你尚未将 GitHub 连接到 ChatGPT）
3. 安装或连接 ChatGPT GitHub Connector
4. 为 ChatGPT Connector 选择安装目标（通常是你的主组织）
5. 允许你想连接到 Codex 的仓库

对于 GitHub Enterprise Managed Users（EMU），组织 owner 必须先为组织安装 Codex GitHub App，然后用户才能在 Codex cloud 中连接仓库。

更多信息请参阅 [Cloud environments](https://developers.openai.com/codex/cloud/environments)。

Codex 会为每次操作使用短期、最小权限的 GitHub App installation tokens，并遵守用户现有的 GitHub 仓库权限和 branch protection rules。

### 配置 IP 地址

如果你的 GitHub 组织控制 app 用于连接的 IP 地址，请确保包含 [Codex cloud egress IP ranges](https://developers.openai.com/api/docs/guides/ip-addresses)。

这些 IP ranges 可能会变化。请考虑自动检查它们，并根据最新值更新 allow list。

### 启用 Codex cloud 代码审查

要允许 Codex 在 GitHub 上执行代码审查，请前往 [Settings → Code review](https://chatgpt.com/codex/settings/code-review)。

你可以在仓库级别配置 code review。用户也可以为自己的 PR 启用 auto review，并选择 Codex 何时自动触发审查。更多详情请参阅 [GitHub integration page](https://developers.openai.com/codex/integrations/github)。

使用 overview 页面确认你的 workspace 已开启 code review，并查看可用的 review controls。

<div class="max-w-1xl mx-auto py-1">
  <img src="https://developers.openai.com/images/codex/enterprise/code_review_settings_overview.png"
    alt="Code review 设置概览"
    class="block w-full mx-auto rounded-lg"
  />
</div>

<div class="grid grid-cols-1 gap-4 py-1 md:grid-cols-2">
  <div class="max-w-1xl mx-auto">
    <p>
      使用 auto review 设置决定 Codex 是否应自动审查已连接仓库的 pull
      requests。
    </p>
    <img src="https://developers.openai.com/images/codex/enterprise/auto_code_review_settings.png"
      alt="自动 code review 设置"
      class="block w-full mx-auto rounded-lg"
    />
  </div>
  <div class="max-w-1xl mx-auto">
    <p>
      使用 review triggers 控制哪些 pull request 事件应启动
      Codex review。
    </p>
    <img src="https://developers.openai.com/images/codex/enterprise/review_triggers.png"
      alt="Code review 触发器设置"
      class="block w-full mx-auto rounded-lg"
    />
  </div>
</div>

### 配置 Codex security

Codex Security 帮助工程和安全团队在已连接的 GitHub 仓库中发现、确认并修复可能的漏洞。

从高层看，Codex Security 会：

- 逐 commit 扫描已连接仓库
- 对可能的发现进行排序，并在可能时确认它们
- 展示带有证据、严重性和建议修复方案的结构化发现
- 让团队优化仓库 threat model，以提升优先级排序和审查质量

有关设置、扫描创建、发现审查和 threat model 指南，请参阅 [Codex Security setup](https://developers.openai.com/codex/security/setup)。有关产品概览，请参阅 [Codex Security](https://developers.openai.com/codex/security)。

还提供了 [Slack](https://developers.openai.com/codex/integrations/slack)、[GitHub](https://developers.openai.com/codex/integrations/github) 和 [Linear](https://developers.openai.com/codex/integrations/linear) 的集成文档。

## 第 6 步：设置治理和可观测性

Codex 为企业团队提供采用情况和影响可见性的多种选项。请尽早设置治理，使你的团队能够跟踪采用情况、调查问题并支持合规工作流。

### Codex 治理通常使用

- Analytics Dashboard，用于快速、自助式可见性
- Analytics API，用于程序化报告和 business intelligence 集成
- Compliance API，用于审计和调查工作流

### 推荐 baseline 设置

- 指定采用情况报告负责人
- 指定审计和合规审查负责人
- 定义审查节奏
- 决定成功标准

### Analytics API 设置步骤

要设置 Analytics API key：

1. 以 owner 或 admin 身份登录 [OpenAI API Platform Portal](https://platform.openai.com)，并选择正确的组织。
2. 前往 [API keys page](https://platform.openai.com/settings/organization/api-keys)。
3. 创建专用于 Codex Analytics 的新 secret key，并给它一个描述性名称，例如 Codex Analytics API。
4. 为你的组织选择适当的 project。如果你只有一个 project，默认 project 即可。
5. 将 key 权限设置为 Read only，因为此 API 只检索 analytics 数据。
6. 复制 key 值并安全存放，因为你只能查看它一次。
7. 发送 email 到 support@openai.com，请求将该 key 的作用域仅限定为 `codex.enterprise.analytics.read`。等待 OpenAI 确认你的 API key 已获得 Codex Analytics API 访问权限。

<div class="not-prose max-w-md mx-auto py-1">
  <img src="https://developers.openai.com/images/codex/codex_analytics_key.png"
    alt="Codex analytics key 创建"
    class="block w-full mx-auto rounded-lg"
  />
</div>

要使用 Analytics API key：

1. 在 [ChatGPT Admin console](https://chatgpt.com/admin) 的 Workspace details 下找到你的 `workspace_id`。
2. 使用 Platform API key 调用 `https://api.chatgpt.com/v1/analytics/codex` 上的 Analytics API，并在路径中包含你的 `workspace_id`。
3. 选择你要查询的端点：

- /workspaces/`{workspace_id}`/usage
- /workspaces/`{workspace_id}`/code_reviews
- /workspaces/`{workspace_id}`/code_review_responses

4. 如有需要，使用 `start_time` 和 `end_time` 设置报告日期范围。
5. 如果响应跨越多个页面，请使用 `next_page` 检索下一页结果。

用于检索 workspace 使用情况的 curl 命令示例：

```bash
curl -H "Authorization: Bearer YOUR_PLATFORM_API_KEY" \
  "https://api.chatgpt.com/v1/analytics/codex/workspaces/WORKSPACE_ID/usage"
```

有关 Analytics API 的更多详情，请参阅 [Analytics API](https://developers.openai.com/codex/enterprise/governance#analytics-api)。

### Compliance API 设置步骤

要设置 Compliance API key：

1. 以 owner 或 admin 身份登录 [OpenAI API Platform Portal](https://platform.openai.com)，并选择正确的组织。
2. 前往 [API keys page](https://platform.openai.com/settings/organization/api-keys)。
3. 创建专用于 Compliance API 的新 secret key，并为你的组织选择适当的 project。如果你只有一个 project，默认 project 即可。
4. 选择 All permissions。
5. 复制 key 值并安全存放，因为你只能查看它一次。
6. 向 support@openai.com 发送 email，包含：

- API key 的最后 4 位
- key 名称
- 创建者姓名
- 所需 scope：`read`、`delete` 或两者

7. 等待 OpenAI 确认你的 API key 已获得 Compliance API 访问权限。

要使用 Compliance API key：

1. 在 [ChatGPT Admin console](https://chatgpt.com/admin) 的 Workspace details 下找到你的 `workspace_id`。
2. 在 `https://api.chatgpt.com/v1/` 使用 Compliance API
3. 在 Authorization header 中以 Bearer token 形式传递你的 Compliance API key。
4. 对于 Codex 相关合规数据，请使用这些端点：

- /compliance/workspaces/`{workspace_id}`/logs
- /compliance/workspaces/`{workspace_id}`/logs/`{log_file_id}`
- /compliance/workspaces/`{workspace_id}`/codex_tasks
- /compliance/workspaces/`{workspace_id}`/codex_environments

5. 对于多数 Codex 合规集成，请从 logs endpoint 开始，并请求 CODEX_LOG 或 CODEX_SECURITY_LOG 等 Codex event types。
6. 使用 /logs 列出可用的 Codex compliance log files，然后使用 /logs/`{log_file_id}` 下载特定文件。

列出 compliance log files 的 curl 命令示例：

```bash
curl -L -H "Authorization: Bearer YOUR_COMPLIANCE_API_KEY" \
  "https://api.chatgpt.com/v1/compliance/workspaces/WORKSPACE_ID/logs?event_type=CODEX_LOG&after=2026-03-01T00:00:00Z"
```

列出 Codex tasks 的 curl 命令示例：

```bash
curl -H "Authorization: Bearer YOUR_COMPLIANCE_API_KEY" \
  "https://api.chatgpt.com/v1/compliance/workspaces/WORKSPACE_ID/codex_tasks"
```

有关 Compliance API 的更多详情，请参阅 [Compliance API](https://developers.openai.com/codex/enterprise/governance#compliance-api)。

## 第 7 步：确认并验证设置

### 要验证什么

- 用户可以登录 Codex local（ChatGPT 或 API key）
- （如果已启用）用户可以登录 Codex cloud（需要 ChatGPT 登录）
- MFA 和 SSO 要求与你的企业安全策略一致
- RBAC 和 workspace 开关产生预期的访问行为
- Managed configuration 对用户生效
- 管理员可以看到治理数据

有关认证选项和企业登录限制，请参阅 [Authentication](https://developers.openai.com/codex/auth)。

一旦团队对设置有信心，就可以将 Codex rollout 给更多团队和组织。
