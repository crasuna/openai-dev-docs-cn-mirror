---
status: needs-review
sourceId: "649d0ed306c7"
sourceChecksum: "649d0ed306c75a2939891e7e919a2cb2d82e8b88c8f509dcea8f58e0de4a0b44"
sourceUrl: "https://developers.openai.com/api/docs/guides/rbac"
translatedAt: "2026-06-27T18:00:58.7410056+08:00"
translator: codex-gpt-5.5-xhigh
---

# 在 OpenAI 平台中管理权限

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

<div style={{ overflowX: "auto" }}>

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

</div>

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
