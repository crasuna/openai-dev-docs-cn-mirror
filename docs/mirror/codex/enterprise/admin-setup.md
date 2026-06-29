---
title: "管理员设置"
description: "Set up Codex for your ChatGPT Enterprise workspace"
outline: deep
---

# 管理员设置

**文档集**：Codex 编码智能体<br>
**分组**：Codex — 企业<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/enterprise/admin-setup](https://developers.openai.com/codex/enterprise/admin-setup)
- Markdown 来源：[https://developers.openai.com/codex/enterprise/admin-setup.md](https://developers.openai.com/codex/enterprise/admin-setup.md)
- 抓取时间：2026-06-27T05:54:57.097Z
- Checksum：`ec7392684496715b28eac55d391cc98cb16d630d736c2dd0e7a5a760daef55f8`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre

  &lt;img src="https://developers.openai.com/images/codex/codex_enterprise_admin.png"
    alt="Codex 企业管理员开关"
    class="block w-full mx-auto rounded-lg"
  /&gt;




本指南面向希望为其 workspace 设置 Codex 的 ChatGPT Enterprise 管理员。

请将本页作为分步 rollout 指南。有关详细的策略、配置、自动化和监控信息，请使用链接页面：[Authentication](/mirror/codex/auth)、[Agent approvals & security](/mirror/codex/agent-approvals-security)、[Access tokens](/mirror/codex/enterprise/access-tokens)、[Managed configuration](/mirror/codex/enterprise/managed-configuration) 和 [Governance](/mirror/codex/enterprise/governance)。

## 企业级安全和隐私

Codex 支持 ChatGPT Enterprise 安全功能，包括：

- 不使用企业数据进行训练
- 遵循 ChatGPT Enterprise 策略的数据驻留和保留
- 精细的用户访问控制
- 静态数据加密（AES-256）和传输中加密（TLS 1.2+）
- 通过 ChatGPT Compliance API 进行审计日志记录

有关安全控制和运行时保护，请参阅 [Agent approvals & security](/mirror/codex/agent-approvals-security)。有关更多详情，请参阅 [Zero Data Retention (ZDR)](https://platform.openai.com/docs/guides/your-data#zero-data-retention)。
如需更广泛的企业安全概览，请参阅 [Codex security white paper](https://trust.openai.com/?itemUid=382f924d-54f3-43a8-a9df-c39e6c959958&source=click)。

## 前提条件：确定负责人和 rollout 策略

在 rollout 过程中，团队成员可能会支持将 Codex 集成到组织中的不同方面。请确保你有以下负责人：

- **ChatGPT Enterprise workspace owner：** 配置 workspace 中的 Codex 设置所必需。
- **Security owner：** 决定 Codex 的 agent 权限设置。
- **Analytics owner：** 将分析和合规 API 集成到你的数据管道中。

决定你将使用哪些 Codex 界面：

- **Codex local：** 包括 Codex app、CLI 和 IDE 扩展。Agent 在开发者计算机上的 sandbox 中运行。
- **Codex cloud：** 包括托管的 Codex 功能（包括 Codex cloud、iOS、Code Review，以及由 [Slack integration](/mirror/codex/integrations/slack) 或 [Linear integration](/mirror/codex/integrations/linear) 创建的任务）。Agent 在托管容器中远程运行，并访问你的代码库。
- **两者：** 同时使用 local + cloud。

你可以启用 local、cloud 或两者，并通过 workspace 设置和基于角色的访问控制（RBAC）控制访问权限。

## 第 1 步：在你的 workspace 中启用 Codex

你可以在 ChatGPT Enterprise workspace 设置中配置 Codex 访问权限。

前往 [Workspace Settings &gt; Settings and Permissions](https://chatgpt.com/admin/settings)。

### Codex local

对于新的 ChatGPT Enterprise workspace，Codex local 默认启用。如果你不是 ChatGPT workspace owner，可以通过[安装 Codex](/mirror/codex/quickstart) 并使用工作 email 登录来测试自己是否有访问权限。

开启 **Allow members to use Codex Local**。

这会允许获准用户使用 Codex app、CLI 和 IDE 扩展。

如果成员需要程序化 Codex local 工作流，请在 **Access tokens** 区域或通过自定义角色授予 **Allow users to create access tokens**。Workspace owners 和 admins 可以在 **Codex Local** 区域中使用 **Access token expiration limit** 设置成员为新令牌可选择的最长过期时间。有关设置和权限详情，请参阅 [Access tokens](/mirror/codex/enterprise/access-tokens)。

如果 Codex Local 开关关闭，尝试使用 Codex app、CLI 或 IDE 的用户将看到以下错误：“403 - Unauthorized. Contact your ChatGPT administrator for access.”

#### 为 Codex CLI 启用设备码认证

允许开发者在非交互式环境（例如远程开发机器）中使用 Codex CLI 时通过设备码登录。更多详情请参阅 [authentication](/mirror/codex/auth)。


  &lt;img src="https://developers.openai.com/images/codex/enterprise/local-toggle-config.png"
    alt="Codex local 开关"
    class="block w-full mx-auto rounded-lg"
  /&gt;


### Codex cloud

### 前提条件

Codex cloud 需要 **GitHub（cloud-hosted）仓库**。如果你的代码库位于本地部署环境或不在 GitHub 上，可以使用 Codex SDK 在自己的基础设施上构建类似工作流。

作为管理员设置 Codex 时，你必须拥有组织中常用仓库的 GitHub 访问权限。如果你没有必要权限，请与你工程团队中的相关人员协作。

### 在 workspace 设置中启用 Codex cloud

首先在 [Workspace Settings &gt; Settings and Permissions](https://chatgpt.com/admin/settings) 的 Codex 区域中开启 ChatGPT GitHub Connector。

要为你的 workspace 启用 Codex cloud，请开启 **Allow members to use Codex cloud**。启用后，用户可以从 ChatGPT 左侧导航面板直接访问 Codex。

请注意，Codex 可能最多需要 10 分钟才会出现在 ChatGPT 中。

#### 启用 Codex Slack app 在任务完成时发布答案

任务完成时，Codex 会将完整答案发布回 Slack。否则，Codex 只发布任务链接。

要了解更多信息，请参阅 [Codex in Slack](/mirror/codex/integrations/slack)。

#### 启用 Codex agent 访问互联网

默认情况下，Codex cloud agents 在运行时没有互联网访问权限，以帮助防范 prompt injection 等安全和安全性风险。

此设置允许用户为常见软件依赖域名使用 allowlist、添加域名和受信任站点，并指定允许的 HTTP 方法。

有关互联网访问和运行时控制的安全影响，请参阅 [Agent approvals & security](/mirror/codex/agent-approvals-security)。


  &lt;img src="https://developers.openai.com/images/codex/enterprise/cloud-toggle-config.png"
    alt="Codex cloud 开关"
    class="block w-full mx-auto rounded-lg"
  /&gt;


## 第 2 步：设置自定义角色（RBAC）

使用 RBAC 对 Codex local 和 Codex cloud 的访问进行细粒度权限控制。


  &lt;img src="https://developers.openai.com/images/codex/enterprise/rbac_custom_roles.png"
    alt="Codex cloud 开关"
    class="block w-full mx-auto rounded-lg"
  /&gt;


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

当你想对不同 groups 应用不同的本地 Codex 约束，而不先分发设备级文件时，请使用此页面。托管策略使用 [Managed configuration](/mirror/codex/enterprise/managed-configuration) 中描述的同一 `requirements.toml` 格式，因此你可以定义允许的 approval policies、sandbox modes、web search behavior、MCP server allowlists、feature pins 和 restrictive command rules。要禁用 Browser Use、in-app browser 或 Computer Use，请参阅 [Pin feature flags](/mirror/codex/enterprise/managed-configuration#pin-feature-flags)。


  &lt;img src="https://developers.openai.com/images/codex/enterprise/policies_and_configurations_page.png"
    alt="Codex policies and configurations 页面"
    class="block w-full mx-auto rounded-lg"
  /&gt;


推荐设置：

1. 为多数用户创建 baseline 策略，只有在需要时才创建更严格或更宽松的变体。
2. 将每个托管策略分配给特定用户组，并为其他所有人配置默认 fallback 策略。
3. 谨慎排列 group 规则。如果用户匹配多个 group-specific 规则，则应用第一个匹配规则。
4. 将每个策略视为该 group 的完整配置文件。Codex 不会从后续匹配的 group 规则中填补缺失字段。

这些 cloud-managed 策略会在用户使用 ChatGPT 登录时应用到各个 Codex local 界面，包括 Codex app、CLI 和 IDE 扩展。

### requirements.toml 策略示例

使用 cloud-managed `requirements.toml` 策略，为每个 group 强制执行你需要的防护栏。以下片段是可供你改编的示例，并非必需设置。

对于 Codex 0.138.0 或更高版本，请优先使用带托管 `default_permissions` 的 `allowed_permission_profiles`。仅对仍配置 `sandbox_mode` 的旧部署使用 `allowed_sandbox_modes`。


  &lt;img src="https://developers.openai.com/images/codex/enterprise/example_policy.png"
    alt="托管 requirements 策略示例"
    class="block w-full mx-auto rounded-lg"
  /&gt;


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

你可以单独使用任一示例，也可以将它们组合到同一个 group 的托管策略中。有关精确 key、优先级和更多示例，请参阅 [Managed configuration](/mirror/codex/enterprise/managed-configuration) 和 [Agent approvals & security](/mirror/codex/agent-approvals-security)。

### 检查用户策略

使用工作流末尾的策略查询工具确认哪个托管策略适用于某个用户。你可以按 group 检查策略分配，也可以输入用户 email 检查。


  &lt;img src="https://developers.openai.com/images/codex/enterprise/policy_lookup.png"
    alt="按 group 或用户 email 查询策略"
    class="block w-full mx-auto rounded-lg"
  /&gt;


如果你计划限制本地 clients 的登录方式或 workspace，请参阅 [Authentication](/mirror/codex/auth) 中管理员管理的认证限制。

## 第 4 步：使用 Team Config 标准化本地配置

希望在组织内标准化 Codex 的团队可以使用 Team Config 共享 defaults、rules 和 skills，而无需在每个本地配置中重复设置。

你可以将 Team Config 设置提交到仓库的 `.codex` 目录下。用户打开该仓库时，Codex 会自动选取 Team Config 设置。

从流量最高的仓库开始使用 Team Config，让团队在最常使用 Codex 的地方获得一致行为。

| 类型 | 路径 | 用途 |
| ------------------------------------ | ------------- | ---------------------------------------------------------------------------- |
| [Config basics](/mirror/codex/config-basic) | `config.toml` | 设置 sandbox mode、approvals、model、reasoning effort 等默认值。 |
| [Rules](/mirror/codex/rules) | `rules/` | 控制 Codex 可以在 sandbox 外运行哪些命令。 |
| [Skills](/mirror/codex/skills) | `skills/` | 让共享 skills 可供你的团队使用。 |

有关位置和优先级，请参阅 [Config basics](/mirror/codex/config-basic#configuration-precedence)。

## 第 5 步：配置 Codex cloud 使用情况（如果已启用）

此步骤涵盖启用 Codex cloud workspace 开关后的仓库和 environment 设置。

### 将 Codex cloud 连接到仓库

1. 导航到 [Codex](https://chatgpt.com/codex)，并选择 **Get started**
2. 选择 **Connect to GitHub** 安装 ChatGPT GitHub Connector（如果你尚未将 GitHub 连接到 ChatGPT）
3. 安装或连接 ChatGPT GitHub Connector
4. 为 ChatGPT Connector 选择安装目标（通常是你的主组织）
5. 允许你想连接到 Codex 的仓库

对于 GitHub Enterprise Managed Users（EMU），组织 owner 必须先为组织安装 Codex GitHub App，然后用户才能在 Codex cloud 中连接仓库。

更多信息请参阅 [Cloud environments](/mirror/codex/cloud/environments)。

Codex 会为每次操作使用短期、最小权限的 GitHub App installation tokens，并遵守用户现有的 GitHub 仓库权限和 branch protection rules。

### 配置 IP 地址

如果你的 GitHub 组织控制 app 用于连接的 IP 地址，请确保包含 [Codex cloud egress IP ranges](/mirror/api/docs/guides/ip-addresses)。

这些 IP ranges 可能会变化。请考虑自动检查它们，并根据最新值更新 allow list。

### 启用 Codex cloud 代码审查

要允许 Codex 在 GitHub 上执行代码审查，请前往 [Settings → Code review](https://chatgpt.com/codex/settings/code-review)。

你可以在仓库级别配置 code review。用户也可以为自己的 PR 启用 auto review，并选择 Codex 何时自动触发审查。更多详情请参阅 [GitHub integration page](/mirror/codex/integrations/github)。

使用 overview 页面确认你的 workspace 已开启 code review，并查看可用的 review controls。


  &lt;img src="https://developers.openai.com/images/codex/enterprise/code_review_settings_overview.png"
    alt="Code review 设置概览"
    class="block w-full mx-auto rounded-lg"
  /&gt;





      使用 auto review 设置决定 Codex 是否应自动审查已连接仓库的 pull
      requests。

    &lt;img src="https://developers.openai.com/images/codex/enterprise/auto_code_review_settings.png"
      alt="自动 code review 设置"
      class="block w-full mx-auto rounded-lg"
    /&gt;



      使用 review triggers 控制哪些 pull request 事件应启动
      Codex review。

    &lt;img src="https://developers.openai.com/images/codex/enterprise/review_triggers.png"
      alt="Code review 触发器设置"
      class="block w-full mx-auto rounded-lg"
    /&gt;



### 配置 Codex security

Codex Security 帮助工程和安全团队在已连接的 GitHub 仓库中发现、确认并修复可能的漏洞。

从高层看，Codex Security 会：

- 逐 commit 扫描已连接仓库
- 对可能的发现进行排序，并在可能时确认它们
- 展示带有证据、严重性和建议修复方案的结构化发现
- 让团队优化仓库 threat model，以提升优先级排序和审查质量

有关设置、扫描创建、发现审查和 threat model 指南，请参阅 [Codex Security setup](/mirror/codex/security/setup)。有关产品概览，请参阅 [Codex Security](/mirror/codex/security)。

还提供了 [Slack](/mirror/codex/integrations/slack)、[GitHub](/mirror/codex/integrations/github) 和 [Linear](/mirror/codex/integrations/linear) 的集成文档。

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


  &lt;img src="https://developers.openai.com/images/codex/codex_analytics_key.png"
    alt="Codex analytics key 创建"
    class="block w-full mx-auto rounded-lg"
  /&gt;


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

有关 Analytics API 的更多详情，请参阅 [Analytics API](/mirror/codex/enterprise/governance#analytics-api)。

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

有关 Compliance API 的更多详情，请参阅 [Compliance API](/mirror/codex/enterprise/governance#compliance-api)。

## 第 7 步：确认并验证设置

### 要验证什么

- 用户可以登录 Codex local（ChatGPT 或 API key）
- （如果已启用）用户可以登录 Codex cloud（需要 ChatGPT 登录）
- MFA 和 SSO 要求与你的企业安全策略一致
- RBAC 和 workspace 开关产生预期的访问行为
- Managed configuration 对用户生效
- 管理员可以看到治理数据

有关认证选项和企业登录限制，请参阅 [Authentication](/mirror/codex/auth)。

一旦团队对设置有信心，就可以将 Codex rollout 给更多团队和组织。

:::

## English source

::: details 展开英文原文
::: v-pre

  &lt;img src="https://developers.openai.com/images/codex/codex_enterprise_admin.png"
    alt="Codex enterprise admin toggle"
    class="block w-full mx-auto rounded-lg"
  /&gt;




This guide is for ChatGPT Enterprise admins who want to set up Codex for their workspace.

Use this page as the step-by-step rollout guide. For detailed policy, configuration, automation, and monitoring details, use the linked pages: [Authentication](/mirror/codex/auth), [Agent approvals & security](/mirror/codex/agent-approvals-security), [Access tokens](/mirror/codex/enterprise/access-tokens), [Managed configuration](/mirror/codex/enterprise/managed-configuration), and [Governance](/mirror/codex/enterprise/governance).

## Enterprise-grade security and privacy

Codex supports ChatGPT Enterprise security features, including:

- No training on enterprise data
- Residency and retention that follow ChatGPT Enterprise policies
- Granular user access controls
- Data encryption at rest (AES-256) and in transit (TLS 1.2+)
- Audit logging via the ChatGPT Compliance API

For security controls and runtime protections, see [Agent approvals & security](/mirror/codex/agent-approvals-security). Refer to [Zero Data Retention (ZDR)](https://platform.openai.com/docs/guides/your-data#zero-data-retention) for more details.
For a broader enterprise security overview, see the [Codex security white paper](https://trust.openai.com/?itemUid=382f924d-54f3-43a8-a9df-c39e6c959958&source=click).

## Pre-requisites: Determine owners and rollout strategy

During your rollout, team members may support different aspects of integrating Codex into your organization. Ensure you have the following owners:

- **ChatGPT Enterprise workspace owner:** required to configure Codex settings in your workspace.
- **Security owner:** determines agent permissions settings for Codex.
- **Analytics owner:** integrates analytics and compliance APIs into your data pipelines.

Decide which Codex surfaces you will use:

- **Codex local:** includes the Codex app, CLI, and IDE extension. The agent runs on the developer's computer in a sandbox.
- **Codex cloud:** includes hosted Codex features (including Codex cloud, iOS, Code Review, and tasks created by the [Slack integration](/mirror/codex/integrations/slack) or [Linear integration](/mirror/codex/integrations/linear)). The agent runs remotely in a hosted container with your codebase.
- **Both:** use local + cloud together.

You can enable local, cloud, or both, and control access with workspace settings and role-based access control (RBAC).

## Step 1: Enable Codex in your workspace

You configure access to Codex in ChatGPT Enterprise workspace settings.

Go to [Workspace Settings &gt; Settings and Permissions](https://chatgpt.com/admin/settings).

### Codex local

Codex local is enabled by default for new ChatGPT Enterprise workspaces. If
  you are not a ChatGPT workspace owner, you can test whether you have access by
  [installing Codex](/mirror/codex/quickstart) and logging in with your work email.

Turn on **Allow members to use Codex Local**.

This enables use of the Codex app, CLI, and IDE extension for allowed users.

If members need programmatic Codex local workflows, grant **Allow users to create access tokens** in the **Access tokens** section or through a custom role. Workspace owners and admins can use **Access token expiration limit** in the **Codex Local** section to set the longest expiration members can choose for new tokens. For setup and permission details, see [Access tokens](/mirror/codex/enterprise/access-tokens).

If the Codex Local toggle is off, users who attempt to use the Codex app, CLI, or IDE will see the following error: “403 - Unauthorized. Contact your ChatGPT administrator for access.”

#### Enable device code authentication for Codex CLI

Allow developers to sign in with a device code when using Codex CLI in a non-interactive environment (for example, a remote development box). More details are in [authentication](/mirror/codex/auth).


  &lt;img src="https://developers.openai.com/images/codex/enterprise/local-toggle-config.png"
    alt="Codex local toggle"
    class="block w-full mx-auto rounded-lg"
  /&gt;


### Codex cloud

### Prerequisites

Codex cloud requires **GitHub (cloud-hosted) repositories**. If your codebase is on-premises or not on GitHub, you can use the Codex SDK to build similar workflows on your own infrastructure.

To set up Codex as an admin, you must have GitHub access to the repositories
  commonly used across your organization. If you don't have the necessary
  access, work with someone on your engineering team who does.

### Enable Codex cloud in workspace settings

Start by turning on the ChatGPT GitHub Connector in the Codex section of [Workspace Settings &gt; Settings and Permissions](https://chatgpt.com/admin/settings).

To enable Codex cloud for your workspace, turn on **Allow members to use Codex cloud**. Once enabled, users can access Codex directly from the left-hand navigation panel in ChatGPT.

Note that it may take up to 10 minutes for Codex to appear in ChatGPT.

#### Enable Codex Slack app to post answers on task completion

Codex posts its full answer back to Slack when the task completes. Otherwise, Codex posts only a link to the task.

To learn more, see [Codex in Slack](/mirror/codex/integrations/slack).

#### Enable Codex agent to access the internet

By default, Codex cloud agents have no internet access during runtime to help protect against security and safety risks like prompt injection.

This setting lets users use an allowlist for common software dependency domains, add domains and trusted sites, and specify allowed HTTP methods.

For security implications of internet access and runtime controls, see [Agent approvals & security](/mirror/codex/agent-approvals-security).


  &lt;img src="https://developers.openai.com/images/codex/enterprise/cloud-toggle-config.png"
    alt="Codex cloud toggle"
    class="block w-full mx-auto rounded-lg"
  /&gt;


## Step 2: Set up custom roles (RBAC)

Use RBAC to control granular permissions for access Codex local and Codex cloud.


  &lt;img src="https://developers.openai.com/images/codex/enterprise/rbac_custom_roles.png"
    alt="Codex cloud toggle"
    class="block w-full mx-auto rounded-lg"
  /&gt;


### What RBAC lets you do

Workspace Owners can use RBAC in ChatGPT admin settings to:

- Set a default role for users who aren't assigned any custom role
- Create custom roles with granular permissions
- Assign one or more custom roles to Groups
- Automatically sync users into Groups via SCIM
- Manage roles centrally from the Custom Roles tab

Users can inherit more than one role, and permissions resolve to the most permissive (least restrictive) access across those roles.

### Create a Codex Admin group

Set up a dedicated "Codex Admin" group rather than granting Codex administration to a broad audience.

The **Allow members to administer Codex** toggle grants the Codex Admin role. Codex Admins can:

- View Codex [workspace analytics](https://chatgpt.com/codex/settings/analytics)
- Open the Codex [Policies page](https://chatgpt.com/codex/settings/policies) to manage cloud-managed `requirements.toml` policies
- Assign those managed policies to user groups or configure a default fallback policy
- Manage Codex cloud environments, including editing and deleting environments

Use this role for the small set of admins who own Codex rollout, policy management, and governance. It's not required for general Codex users. You don't need Codex cloud to enable this toggle.

Recommended rollout pattern:

- Create a "Codex Users" group for people who should use Codex
- Create a separate "Codex Admin" group for the smaller set of people who should manage Codex settings and policies
- Assign the custom role with **Allow members to administer Codex** enabled only to the "Codex Admin" group
- Keep membership in the "Codex Admin" group limited to workspace owners or designated platform, IT, and governance operators
- If you use SCIM, back the "Codex Admin" group with your identity provider so membership changes are auditable and centrally managed

This separation makes it easier to roll out Codex while keeping analytics, environment management, and policy deployment limited to trusted admins. For RBAC setup details and the full permission model, see the [OpenAI RBAC Help Center article](https://help.openai.com/en/articles/11750701-rbac).

## Step 3: Configure Codex local requirements

Codex Admins can deploy admin-enforced `requirements.toml` policies from the Codex [Policies page](https://chatgpt.com/codex/settings/policies).

Use this page when you want to apply different local Codex constraints to different groups without distributing device-level files first. The managed policy uses the same `requirements.toml` format described in [Managed configuration](/mirror/codex/enterprise/managed-configuration), so you can define allowed approval policies, sandbox modes, web search behavior, MCP server allowlists, feature pins, and restrictive command rules. To disable Browser Use, the in-app browser, or Computer Use, see [Pin feature flags](/mirror/codex/enterprise/managed-configuration#pin-feature-flags).


  &lt;img src="https://developers.openai.com/images/codex/enterprise/policies_and_configurations_page.png"
    alt="Codex policies and configurations page"
    class="block w-full mx-auto rounded-lg"
  /&gt;


Recommended setup:

1. Create a baseline policy for most users, then create stricter or more permissive variants only where needed.
2. Assign each managed policy to a specific user group, and configure a default fallback policy for everyone else.
3. Order group rules with care. If a user matches more than one group-specific rule, the first matching rule applies.
4. Treat each policy as a complete profile for that group. Codex doesn't fill missing fields from later matching group rules.

These cloud-managed policies apply across Codex local surfaces when users sign in with ChatGPT, including the Codex app, CLI, and IDE extension.

### Example requirements.toml policies

Use cloud-managed `requirements.toml` policies to enforce the guardrails you want for each group. The snippets below are examples you can adapt, not required settings.

For Codex 0.138.0 or later, prefer `allowed_permission_profiles` with managed
`default_permissions`. Use `allowed_sandbox_modes` only for legacy deployments
that still configure `sandbox_mode`.


  &lt;img src="https://developers.openai.com/images/codex/enterprise/example_policy.png"
    alt="Example managed requirements policy"
    class="block w-full mx-auto rounded-lg"
  /&gt;


Example: limit web search, sandbox mode, and approvals for a standard local rollout:

```toml
allowed_web_search_modes = ["disabled", "cached"]
allowed_sandbox_modes = ["workspace-write"]
allowed_approval_policies = ["on-request"]
```

Example: allow the standard permission profiles for an upgraded fleet:

Permission-profile allowlists require Codex 0.138.0 or later. Use this example
  only after every managed client runs a supporting release.

```toml
default_permissions = ":workspace"

[allowed_permission_profiles]
":read-only" = true
":workspace" = true
```

Example: constrain Browser Use, the in-app browser, and Computer Use:

```toml
[features]
browser_use = false
browser_use_full_cdp_access = false
in_app_browser = false
computer_use = false
```

Example: add a restrictive command rule when you want admins to block or gate specific commands:

```toml
[rules]
prefix_rules = [
  { pattern = [{ token = "git" }, { any_of = ["push", "commit"] }], decision = "prompt", justification = "Require review before mutating remote history." },
]
```

You can use any example on its own or combine them in a single managed policy for a group. For exact keys, precedence, and more examples, see [Managed configuration](/mirror/codex/enterprise/managed-configuration) and [Agent approvals & security](/mirror/codex/agent-approvals-security).

### Checking user policies

Use the policy lookup tools at the end of the workflow to confirm which managed policy applies to a user. You can check policy assignment by group or by entering a user email.


  &lt;img src="https://developers.openai.com/images/codex/enterprise/policy_lookup.png"
    alt="Policy lookup by group or user email"
    class="block w-full mx-auto rounded-lg"
  /&gt;


If you plan to restrict login method or workspace for local clients, see the admin-managed authentication restrictions in [Authentication](/mirror/codex/auth).

## Step 4: Standardize local configuration with Team Config

Teams who want to standardize Codex across an organization can use Team Config to share defaults, rules, and skills without duplicating setup on every local configuration.

You can check Team Config settings into the repository under the `.codex` directory. Codex automatically picks up Team Config settings when a user opens that repository.

Start with Team Config for your highest-traffic repositories so teams get consistent behavior in the places they use Codex most.

| Type                                 | Path          | Use it to                                                                    |
| ------------------------------------ | ------------- | ---------------------------------------------------------------------------- |
| [Config basics](/mirror/codex/config-basic) | `config.toml` | Set defaults for sandbox mode, approvals, model, reasoning effort, and more. |
| [Rules](/mirror/codex/rules)                | `rules/`      | Control which commands Codex can run outside the sandbox.                    |
| [Skills](/mirror/codex/skills)              | `skills/`     | Make shared skills available to your team.                                   |

For locations and precedence, see [Config basics](/mirror/codex/config-basic#configuration-precedence).

## Step 5: Configure Codex cloud usage (if enabled)

This step covers repository and environment setup after you enable the Codex cloud workspace toggle.

### Connect Codex cloud to repositories

1. Navigate to [Codex](https://chatgpt.com/codex) and select **Get started**
2. Select **Connect to GitHub** to install the ChatGPT GitHub Connector if you haven't already connected GitHub to ChatGPT
3. Install or connect the ChatGPT GitHub Connector
4. Choose an installation target for the ChatGPT Connector (typically your main organization)
5. Allow the repositories you want to connect to Codex

For GitHub Enterprise Managed Users (EMU), an organization owner must install
  the Codex GitHub App for the organization before users can connect
  repositories in Codex cloud.

For more, see [Cloud environments](/mirror/codex/cloud/environments).

Codex uses short-lived, least-privilege GitHub App installation tokens for each operation and respects the user's existing GitHub repository permissions and branch protection rules.

### Configure IP addresses

If your GitHub organization controls the IP addresses that apps use to connect, make sure to include the [Codex cloud egress IP ranges](/mirror/api/docs/guides/ip-addresses).

These IP ranges can change. Consider checking them automatically and updating your allow list based on the latest values.

### Enable code review with Codex cloud

To allow Codex to perform code reviews on GitHub, go to [Settings → Code review](https://chatgpt.com/codex/settings/code-review).

You can configure code review at the repository level. Users can also enable auto review for their PRs and choose when Codex automatically triggers a review. More details are on the [GitHub integration page](/mirror/codex/integrations/github).

Use the overview page to confirm your workspace has code review turned on and to see the available review controls.


  &lt;img src="https://developers.openai.com/images/codex/enterprise/code_review_settings_overview.png"
    alt="Code review settings overview"
    class="block w-full mx-auto rounded-lg"
  /&gt;





      Use the auto review settings to decide whether Codex should review pull
      requests automatically for connected repositories.

    &lt;img src="https://developers.openai.com/images/codex/enterprise/auto_code_review_settings.png"
      alt="Automatic code review settings"
      class="block w-full mx-auto rounded-lg"
    /&gt;



      Use review triggers to control which pull request events should start a
      Codex review.

    &lt;img src="https://developers.openai.com/images/codex/enterprise/review_triggers.png"
      alt="Code review trigger settings"
      class="block w-full mx-auto rounded-lg"
    /&gt;



### Configure Codex security

Codex Security helps engineering and security teams find, confirm, and remediate likely vulnerabilities in connected GitHub repositories.

At a high level, Codex Security:

- scans connected repositories commit by commit
- ranks likely findings and confirms them when possible
- shows structured findings with evidence, criticality, and suggested remediation
- lets teams refine a repository threat model to improve prioritization and review quality

For setup, scan creation, findings review, and threat model guidance, see [Codex Security setup](/mirror/codex/security/setup). For a product overview, see [Codex Security](/mirror/codex/security).

Integration docs are also available for [Slack](/mirror/codex/integrations/slack), [GitHub](/mirror/codex/integrations/github), and [Linear](/mirror/codex/integrations/linear).

## Step 6: Set up governance and observability

Codex gives enterprise teams options for visibility into adoption and impact. Set up governance early so your team can track adoption, investigate issues, and support compliance workflows.

### Codex governance typically uses

- Analytics Dashboard for quick, self-serve visibility
- Analytics API for programmatic reporting and business intelligence integration
- Compliance API for audit and investigation workflows

### Recommended baseline setup

- Assign an owner for adoption reporting
- Assign an owner for audit and compliance review
- Define a review cadence
- Decide what success looks like

### Analytics API setup steps

To set up the Analytics API key:

1. Sign in to the [OpenAI API Platform Portal](https://platform.openai.com) as an owner or admin, and select the correct organization.
2. Go to the [API keys page](https://platform.openai.com/settings/organization/api-keys).
3. Create a new secret key dedicated to Codex Analytics, and give it a descriptive name such as Codex Analytics API.
4. Select the appropriate project for your organization. If you only have one project, the default project is fine.
5. Set the key permissions to Read only, since this API only retrieves analytics data.
6. Copy the key value and store it securely, because you can only view it once.
7. Email support@openai.com to have that key scoped to `codex.enterprise.analytics.read` only. Wait for OpenAI to confirm your API key has Codex Analytics API access.


  &lt;img src="https://developers.openai.com/images/codex/codex_analytics_key.png"
    alt="Codex analytics key creation"
    class="block w-full mx-auto rounded-lg"
  /&gt;


To use the Analytics API key:

1. Find your `workspace_id` in the [ChatGPT Admin console](https://chatgpt.com/admin) under Workspace details.
2. Call the Analytics API at `https://api.chatgpt.com/v1/analytics/codex` using your Platform API key, and include your `workspace_id` in the path.
3. Choose the endpoint you want to query:

- /workspaces/`{workspace_id}`/usage
- /workspaces/`{workspace_id}`/code_reviews
- /workspaces/`{workspace_id}`/code_review_responses

4. Set a reporting date range with `start_time` and `end_time` if needed.
5. Retrieve the next page of results with `next_page` if the response spans more than one page.

Example curl command to retrieve workspace usage:

```bash
curl -H "Authorization: Bearer YOUR_PLATFORM_API_KEY" \
  "https://api.chatgpt.com/v1/analytics/codex/workspaces/WORKSPACE_ID/usage"
```

For more details on the Analytics API, see [Analytics API](/mirror/codex/enterprise/governance#analytics-api).

### Compliance API setup steps

To set up the Compliance API key:

1. Sign in to the [OpenAI API Platform Portal](https://platform.openai.com) as an owner or admin, and select the correct organization.
2. Go to the [API keys page](https://platform.openai.com/settings/organization/api-keys).
3. Create a new secret key dedicated to Compliance API and select the appropriate project for your organization. If you only have one project, the default project is fine.
4. Choose All permissions.
5. Copy the key value and store it securely, because you can only view it once.
6. Send an email to support@openai.com with:

- the last 4 digits of the API key
- the key name
- the created-by name
- the scope needed: `read`, `delete`, or both

7. Wait for OpenAI to confirm your API key has Compliance API access.

To use the Compliance API key:

1. Find your `workspace_id` in the [ChatGPT Admin console](https://chatgpt.com/admin) under Workspace details.
2. Use the Compliance API at `https://api.chatgpt.com/v1/`
3. Pass your Compliance API key in the Authorization header as a Bearer token.
4. For Codex-related compliance data, use these endpoints:

- /compliance/workspaces/`{workspace_id}`/logs
- /compliance/workspaces/`{workspace_id}`/logs/`{log_file_id}`
- /compliance/workspaces/`{workspace_id}`/codex_tasks
- /compliance/workspaces/`{workspace_id}`/codex_environments

5. For most Codex compliance integrations, start with the logs endpoint and request Codex event types such as CODEX_LOG or CODEX_SECURITY_LOG.
6. Use /logs to list available Codex compliance log files, then /logs/`{log_file_id}` to download a specific file.

Example curl command to list compliance log files:

```bash
curl -L -H "Authorization: Bearer YOUR_COMPLIANCE_API_KEY" \
  "https://api.chatgpt.com/v1/compliance/workspaces/WORKSPACE_ID/logs?event_type=CODEX_LOG&after=2026-03-01T00:00:00Z"
```

Example curl command to list Codex tasks:

```bash
curl -H "Authorization: Bearer YOUR_COMPLIANCE_API_KEY" \
  "https://api.chatgpt.com/v1/compliance/workspaces/WORKSPACE_ID/codex_tasks"
```

For more details on the Compliance API, see [Compliance API](/mirror/codex/enterprise/governance#compliance-api).

## Step 7: Confirm and verify setup

### What to verify

- Users can sign in to Codex local (ChatGPT or API key)
- (If enabled) Users can sign in to Codex cloud (ChatGPT sign-in required)
- MFA and SSO requirements match your enterprise security policy
- RBAC and workspace toggles produce the expected access behavior
- Managed configuration applies for users
- Governance data is visible for admins

For authentication options and enterprise login restrictions, see [Authentication](/mirror/codex/auth).

Once your team is confident with setup, you can roll Codex out to more teams and organizations.

:::
:::

