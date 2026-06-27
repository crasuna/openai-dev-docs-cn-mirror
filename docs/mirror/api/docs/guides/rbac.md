---
title: "Manage permissions in the OpenAI platform"
description: "Learn how to use role-based access control to assign permissions, create custom roles, group users, and scope access across both the OpenAI API and dashboard."
outline: deep
---

# Manage permissions in the OpenAI platform

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/rbac](https://developers.openai.com/api/docs/guides/rbac)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/rbac.md](https://developers.openai.com/api/docs/guides/rbac.md)
- 抓取时间：2026-06-27T05:54:05.952Z
- Checksum：`649d0ed306c75a2939891e7e919a2cb2d82e8b88c8f509dcea8f58e0de4a0b44`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
基于角色的访问控制（RBAC）让你可以决定组织和项目中的哪些人可以执行哪些操作，包括通过 API 和 Dashboard 执行的操作。两处界面由同一套权限控制：如果某人可以调用某个 endpoint（例如 `/v1/chat/completions`），他们也可以使用等效的 Dashboard 页面；缺少权限时，相关 UI 会被禁用（例如 Playground 中的 **Upload** 按钮）。借助 RBAC，你可以：

- 将用户分组并大规模分配权限
- 创建具备所需精确权限的自定义角色
- 将访问范围限定在组织或项目级别
- 在 Dashboard 和 API 中实施一致的权限

## 核心概念

- **Organization**：你的顶层账户。组织角色可以授予跨所有项目的访问权限。
- **Project**：用于管理 key、文件和资源的工作区。项目角色只在该项目内授予访问权限。
- **Groups**：可向其分配角色的用户集合。Groups 可以从你的身份提供商同步（通过 SCIM），从而自动保持成员关系最新。
- **Roles**：权限的组合（例如 Models Request 或 Files Write）。角色可以在 **Organization settings** 下为组织创建，也可以在某个项目的设置下为该特定项目创建。创建后，可以将组织或项目角色分配给用户或 groups。用户可以拥有多个角色，其访问权限是这些角色的并集。
- **Permissions**：角色允许执行的具体操作（例如向模型发起请求、读取文件、写入文件、管理 key）。

### 权限

下表展示了可用权限、哪些预设角色包含这些权限，以及它们是否可用于自定义角色配置。



| 领域                   | 允许的操作                                                                             | Org owner 权限          | Org reader 权限 | Project owner 权限 | Project member 权限 | Project viewer 权限 | 可用于自定义角色 |
| ---------------------- | -------------------------------------------------------------------------------------- | ----------------------- | --------------- | ------------------ | ------------------- | ------------------- | ---------------- |
| List models            | 列出此组织可访问的模型                                                                 | `Read`                  | `Read`          | `Read`             | `Read`              | `Read`              | ✓                |
| Groups                 | 查看和管理 groups                                                                      | `Read`, `Write`         | `Read`          | `Read`, `Write`    | `Read`, `Write`     | `Read`              |                  |
| Roles                  | 查看和管理 roles                                                                       | `Read`, `Write`         | `Read`          | `Read`, `Write`    | `Read`, `Write`     | `Read`              |                  |
| Organization Admin     | 管理组织用户、项目、邀请、管理员 API key 和速率限制                                    | `Read`, `Write`         |                 |                    |                     |                     |                  |
| Usage                  | 查看用量 dashboard 并导出                                                              | `Read`                  |                 |                    |                     |                     | ✓                |
| External Keys          | 查看和管理 Enterprise Key Management 的 key                                            | `Read`, `Write`         |                 |                    |                     |                     |                  |
| IP allowlist           | 查看和管理 IP allowlist                                                                | `Read`, `Write`         |                 |                    |                     |                     |                  |
| mTLS                   | 查看和管理 mutual TLS 设置                                                             | `Read`, `Write`         |                 |                    |                     |                     |                  |
| OIDC                   | 查看和管理 OIDC 配置                                                                   | `Read`, `Write`         |                 |                    |                     |                     |                  |
| Model capabilities     | 向 chat completions、audio、embeddings 和 images 发起请求                              | `Request`               | `Request`       | `Request`          | `Request`           |                     | ✓                |
| Assistants             | 创建和检索 Assistants                                                                  | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     | `Read`              | ✓                |
| Threads                | 创建和检索 Threads/Messages/Runs                                                       | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     | `Read`              | ✓                |
| Evals                  | 创建、检索和删除 Evals                                                                 | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     | `Read`              | ✓                |
| Fine-tuning            | 创建和检索 fine tuning jobs                                                            | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     | `Read`              | ✓                |
| Files                  | 创建和检索文件                                                                         | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     | `Read`              | ✓                |
| Vector Stores          | 创建和检索 vector stores                                                               | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     |                     | ✓                |
| Responses API          | 创建 responses                                                                         | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     |                     | ✓                |
| Prompts                | 创建和检索 prompts，以作为 Responses API 和 Realtime API 的上下文使用                  | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     | `Read`              | ✓                |
| Webhooks               | 在你的项目中创建和查看 webhooks                                                        | `Read`, `Write`         | `Read`          | `Read`, `Write`    | `Read`, `Write`     | `Read`              | ✓                |
| Datasets               | 创建和检索 Datasets                                                                    | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     | `Read`              | ✓                |
| Apps                   | 在 Dashboard 中创建、管理应用并提交审核                                                | `Read`, `Write`         |                 |                    |                     |                     | ✓                |
| Tunnels                | 检查、使用和管理组织范围的 tunnels                                                     | `Read`, `Use`, `Manage` |                 |                    |                     |                     | ✓                |
| Project API Keys       | 用户管理自己 API key 的权限                                                            | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     | `Read`              | ✓                |
| Project Administration | 通过 management API 管理项目用户、service accounts、API key 和速率限制                 | `Read`, `Write`         |                 | `Read`, `Write`    |                     |                     |                  |
| Batch                  | 创建和管理 batch jobs                                                                  | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     | `Read`              |                  |
| Service Accounts       | 查看和管理项目 service accounts                                                        | `Read`, `Write`         |                 | `Read`, `Write`    |                     |                     |                  |
| Videos                 | 创建和检索 videos                                                                      | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     |                     |                  |
| Voices                 | 创建和检索 voices                                                                      | `Read`, `Write`         | `Read`, `Write` | `Read`, `Write`    | `Read`, `Write`     | `Read`              |                  |
| Agent Builder          | 在 Agent Builder 中创建和管理 agents 与 workflows                                      | `Read`, `Write`         | `Read`          | `Read`, `Write`    | `Read`, `Write`     | `Read`              | ✓                |



## 设置 RBAC

角色变更和 group 同步最多可能需要 **30 分钟** 才会生效。

1. **创建 groups**
   为团队添加 groups（例如“Data Science”“Support”）。如果你使用 IdP，请启用 SCIM 同步，让 group 成员关系保持最新。

2. **创建自定义角色**
   从最小权限开始。例如：
   - _Model Tester_：Models Read、Model Capabilities Request、Evals
   - _Model Engineer_：Model Capabilities Request、Files Read/Write、Fine-tuning
   - _App Publisher_：Apps Read、Apps Write

3. **分配角色**
   - **组织级别**角色会应用到所有位置（组织内的所有项目）。
   - **项目级别**角色仅应用于该项目。
     你可以将角色分配给**用户**和 **groups**。用户可以拥有多个角色；访问权限是这些角色的**并集**。

4. **验证**
   使用非 owner 账户确认预期访问权限（API 和 Dashboard）。如果用户能看到超出所需范围的内容，请调整角色。

使用最小权限原则。先从完成任务所需的最低权限开始，
  只在需要时再添加更多权限。

## 访问配置示例

### 小型团队

- 为核心团队授予一个组织级别角色，包含 Model Capabilities Request 和 Files Read/Write。
- 为每个 app 创建一个项目；仅将承包商添加到对应项目，并使用项目级别角色。

### 较大型组织

- 从你的 IdP 同步 groups（例如“Research”“Support”“Finance”）。
- 按职能创建自定义角色并在组织级别分配；或者在项目需要更严格控制时，只授予项目特定角色。

### 承包商和供应商

- 创建一个不含组织级别角色的“Contractors” group。
- 将他们添加到特定项目，并分配范围很窄的项目角色（例如只读访问）。

## 如何评估用户访问权限

在 dashboard 中，我们会组合：

- 来自**组织**的角色（直接分配 + 通过 groups 分配）
- 来自**项目**的角色（直接分配 + 通过 groups 分配）

有效权限是所有已分配角色的**并集**。

如果使用项目内的 API key 发起请求，我们会采用分配给该 API key 的权限，并确保该用户拥有某个项目角色，且该角色授予了这些权限。例如，如果请求 /v1/models，则 API key 必须分配有 api.model.read，且用户必须拥有包含 api.model.read 的项目角色。

## 最佳实践

- **用 groups 建模你的组织**：在 IdP 中映射团队，并将角色分配给 groups，而不是个人。
- **职责分离**：读取模型、上传文件、管理 key 应分别控制。
- **项目边界**：将实验、staging 和 production 放在不同项目中。
- **定期审核**：移除未使用的角色和 key；轮换敏感 key。
- **以非 owner 身份测试**：在广泛推出前验证访问权限符合预期。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Role-based access control (RBAC) lets you decide who can do what across your organization and projects—both through the API and in the Dashboard. The same permissions govern both surfaces: if someone can call an endpoint (for example, `/v1/chat/completions`), they can use the equivalent Dashboard page, and missing permissions disable related UI (such as the **Upload** button in Playground). With RBAC you can:

- Group users and assign permissions at scale
- Create custom roles with the exact permissions you need
- Scope access at the organization or project level
- Enforce consistent permissions in both the Dashboard and API

## Key concepts

- **Organization**: Your top-level account. Organization roles can grant access across all projects.
- **Project**: A workspace for keys, files, and resources. Project roles grant access within only that project.
- **Groups**: Collections of users you can assign roles to. Groups can be synced from your identity provider (via SCIM) to keep membership up to date automatically.
- **Roles**: Bundles of permissions (like Models Request or Files Write). Roles can be created for the organization under **Organization settings**, or created for a specific project under that project's settings. Once created, organization or project roles can be assigned to users or groups. Users can have multiple roles, and their access is the union of those roles.
- **Permissions**: The specific actions a role allows (e.g., make request to models, read files, write files, manage keys).

### Permissions

The table below shows the available permissions, which preset roles include them, and whether they can be configured for custom roles.

<div style={{ overflowX: "auto" }}>

| Area                   | What it allows                                                                       | Org owner permissions   | Org reader permissions | Project owner permissions | Project member permissions | Project viewer permissions | Custom role eligible |
| ---------------------- | ------------------------------------------------------------------------------------ | ----------------------- | ---------------------- | ------------------------- | -------------------------- | -------------------------- | -------------------- |
| List models            | List models this organization has access to                                          | `Read`                  | `Read`                 | `Read`                    | `Read`                     | `Read`                     | ✓                    |
| Groups                 | View and manage groups                                                               | `Read`, `Write`         | `Read`                 | `Read`, `Write`           | `Read`, `Write`            | `Read`                     |                      |
| Roles                  | View and manage roles                                                                | `Read`, `Write`         | `Read`                 | `Read`, `Write`           | `Read`, `Write`            | `Read`                     |                      |
| Organization Admin     | Manage organization users, projects, invites, admin API keys, and rate limits        | `Read`, `Write`         |                        |                           |                            |                            |                      |
| Usage                  | View usage dashboard and export                                                      | `Read`                  |                        |                           |                            |                            | ✓                    |
| External Keys          | View and manage keys for Enterprise Key Management                                   | `Read`, `Write`         |                        |                           |                            |                            |                      |
| IP allowlist           | View and manage IP allowlist                                                         | `Read`, `Write`         |                        |                           |                            |                            |                      |
| mTLS                   | View and manage mutual TLS settings                                                  | `Read`, `Write`         |                        |                           |                            |                            |                      |
| OIDC                   | View and manage OIDC configuration                                                   | `Read`, `Write`         |                        |                           |                            |                            |                      |
| Model capabilities     | Make requests to chat completions, audio, embeddings, and images                     | `Request`               | `Request`              | `Request`                 | `Request`                  |                            | ✓                    |
| Assistants             | Create and retrieve Assistants                                                       | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            | `Read`                     | ✓                    |
| Threads                | Create and retrieve Threads/Messages/Runs                                            | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            | `Read`                     | ✓                    |
| Evals                  | Create, retrieve, and delete Evals                                                   | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            | `Read`                     | ✓                    |
| Fine-tuning            | Create and retrieve fine tuning jobs                                                 | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            | `Read`                     | ✓                    |
| Files                  | Create and retrieve files                                                            | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            | `Read`                     | ✓                    |
| Vector Stores          | Create and retrieve vector stores                                                    | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            |                            | ✓                    |
| Responses API          | Create responses                                                                     | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            |                            | ✓                    |
| Prompts                | Create and retrieve prompts to use as context for Responses API and Realtime API     | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            | `Read`                     | ✓                    |
| Webhooks               | Create and view webhooks in your project                                             | `Read`, `Write`         | `Read`                 | `Read`, `Write`           | `Read`, `Write`            | `Read`                     | ✓                    |
| Datasets               | Create and retrieve Datasets                                                         | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            | `Read`                     | ✓                    |
| Apps                   | Create, manage, and submit apps for review in the Dashboard                          | `Read`, `Write`         |                        |                           |                            |                            | ✓                    |
| Tunnels                | Inspect, use, and manage organization-scoped tunnels                                 | `Read`, `Use`, `Manage` |                        |                           |                            |                            | ✓                    |
| Project API Keys       | Permission for a user to manage their own API keys                                   | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            | `Read`                     | ✓                    |
| Project Administration | Manage project users, service accounts, API keys, and rate limits via management API | `Read`, `Write`         |                        | `Read`, `Write`           |                            |                            |                      |
| Batch                  | Create and manage batch jobs                                                         | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            | `Read`                     |                      |
| Service Accounts       | View and manage project service accounts                                             | `Read`, `Write`         |                        | `Read`, `Write`           |                            |                            |                      |
| Videos                 | Create and retrieve videos                                                           | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            |                            |                      |
| Voices                 | Create and retrieve voices                                                           | `Read`, `Write`         | `Read`, `Write`        | `Read`, `Write`           | `Read`, `Write`            | `Read`                     |                      |
| Agent Builder          | Create and manage agents and workflows in Agent Builder                              | `Read`, `Write`         | `Read`                 | `Read`, `Write`           | `Read`, `Write`            | `Read`                     | ✓                    |

</div>

## Setting up RBAC

Allow up to **30 minutes** for role changes and group sync to propagate.

1. **Create groups**
   Add groups for teams (e.g., “Data Science”, “Support”). If you use an IdP, enable SCIM sync so group membership stays current.

2. **Create custom roles**
   Start from least privilege. For example:
   - _Model Tester_: Models Read, Model Capabilities Request, Evals
   - _Model Engineer_: Model Capabilities Request, Files Read/Write, Fine-tuning
   - _App Publisher_: Apps Read, Apps Write

3. **Assign roles**
   - **Organization level** roles apply everywhere (all projects within the organization).
   - **Project level** roles apply only in that project.
     You can assign roles to **users** and **groups**. Users can hold multiple roles; access is the **union**.

4. **Verify**
   Use a non-owner account to confirm expected access (API and Dashboard). Adjust roles if users can see more than they need.

Use the principle of least privilege. Start with the minimum permissions
  required for a task, then add more only as needed.

## Access configuration examples

### Small team

- Give the core team an org-level role with Model Capabilities Request and Files Read/Write.
- Create a project for each app; add contractors to those projects only, with project-level roles.

### Larger org

- Sync groups from your IdP (e.g., “Research”, “Support”, “Finance”).
- Create custom roles per function and assign at the org level; or only grant project-specific roles when a project needs tighter controls.

### Contractors & vendors

- Create a “Contractors” group without org-level roles.
- Add them to specific projects with narrowly scoped project roles (for example, read-only access).

## How user access is evaluated

In the dashboard, we combine:

- roles from the **organization** (direct + via groups)
- roles from the **project** (direct + via groups)

The effective permissions are the **union** of all assigned roles.

If requesting with an API key within a project, we take the permissions assigned to the API key, and ensure that the user has some project role that grants them those permissions. For example, if requesting /v1/models, the API key must have api.model.read assigned to it and the user must have a project role with api.model.read.

## Best practices

- **Model your org in groups**: Mirror teams in your IdP and assign roles to groups, not individuals.
- **Separate duties**: reading models vs. uploading files vs. managing keys.
- **Project boundaries**: put experiments, staging, and production in separate projects.
- **Review regularly**: remove unused roles and keys; rotate sensitive keys.
- **Test as a non-owner**: validate access matches expectations before broad rollout.
``````
:::
:::

