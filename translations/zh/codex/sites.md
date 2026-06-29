---
status: needs-review
sourceId: "41080a4ebf38"
sourceChecksum: "41080a4ebf38737e905978f76729e55022b7080a33d1d8c537fb4c42f06fb97b"
sourceUrl: "https://developers.openai.com/codex/sites"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# Sites 站点

Sites 让 Codex 可以创建、保存、部署和检查由 OpenAI 托管的网站、web apps 和 games。当你想把一个 prompt 或兼容的现有项目变成托管站点，而不想设置单独部署工作流时，请使用 **Sites** plugin。

每个 Sites deployment URL 都是 production deployment。如果你希望在 build 变为 live 之前审查它，请要求 Codex 保存一个版本而不部署。

## 开始使用 Sites

Sites 处于 preview 阶段，目前面向 ChatGPT Business 和 Enterprise workspaces 开放，更多 plans 会随后推出。对于 ChatGPT Enterprise workspaces，管理员必须先通过 role-based access control（RBAC）启用它，成员才能使用。按 plan 对比支持情况请参见 [Feature availability](https://developers.openai.com/codex/pricing#feature-availability)。

<WorkflowSteps variant="headings">
1. 为 Enterprise workspace 启用 Sites

    如果你使用 ChatGPT Enterprise，请让 workspace admin 在 [ChatGPT admin settings](https://chatgpt.com/admin/settings) 中打开 RBAC controls，并为相应 role 打开 Sites。ChatGPT Business workspaces 可以跳过这一步，因为 Sites 默认启用。

2. 添加 Sites plugin

   如果 **Sites** 还不可用，请在 Codex app 中打开 **Plugins**，找到 **Sites**，并把它添加到 Codex。安装 plugin 后请启动一个新 thread。

3. 开始 Sites 任务

   在 thread 中描述你想创建或发布的 site。你可以用 `@Sites` 明确命名该 plugin，尤其是当你的任务应以托管部署结束时。

   <CodexScreenshot
     alt="Codex app composer with the Sites plugin and connected apps mentioned in a prompt"
     lightSrc="/images/codex/sites/prompt-input-light.jpg"
     darkSrc="/images/codex/sites/prompt-input-dark.jpg"
     variant="no-wallpaper"
   />

4. 审查是保存还是部署

   要求 Codex 验证 site 的 build。然后告诉它保存一个可部署版本以供审查，或部署已批准的 saved version。

5. 返回已部署 sites

   在 app sidebar 中打开 **Sites**，回到你的 Sites projects。你也可以要求 Codex 检查 saved versions、查看 deployment status，或更改谁可以访问已部署 site。

   <CodexScreenshot
     alt="Sites project list in the Codex app"
     lightSrc="/images/codex/sites/sites-list-light.jpg"
     darkSrc="/images/codex/sites/sites-list-dark.jpg"
     variant="no-wallpaper"
   />

</WorkflowSteps>

## 针对常见任务提示 Sites

对于新网站、dashboard 或 internal tool，请包含 audience、core experience 和 required data：

```text
@Sites Build a project request dashboard for my operations team. Let team
members submit requests, see who owns each one, update the status, and filter
the list. Require people to sign in with their workspace account, and keep the
request data saved between visits.
```

对于现有项目，请要求 Sites 准备并发布当前 app：

```text
@Sites Deploy this project. Check whether it is compatible with Sites, make any
required changes, and give me the deployment URL.
```

当 site 需要 durable application data 或 uploaded files 时，请在请求中说明：

```text
@Sites Add persistent player scores and avatar uploads to this game. Use
the appropriate Sites storage and deploy the updated game.
```

浏览 [Sites showcase](https://developers.openai.com/showcase/sites)，查看已部署的 internal apps 以及用于创建它们的完整 prompts。

## 理解 projects、versions 和 deployments

Sites project 会把本地 source project 与通过 Sites 管理的 hosting 关联起来。Codex 会把该关联以及可选 storage binding names 存储在 `.openai/hosting.json` 中。新创建的本地 starter 可以在没有 `project_id` 的情况下开始；Sites 会在 provision hosted project 后添加一个。

例如，一个已 provision、使用 relational database binding 且没有 file storage 的 site 可以包含：

```json
{
  "project_id": "<project-id>",
  "d1": "DB",
  "r2": null
}
```

Sites publishing 有两个独立阶段：

1. **Save a version.** Codex 会构建可部署 site，并将该 version 与 build 使用的 source Git commit 关联起来。当你需要可审查的 deployment candidate 时，使用这一阶段。
2. **Deploy a version.** Codex 会发布一个 saved version，并在部署成功时报告 production URL。只有当你希望选定 audience 访问该 site 时才使用它。

当你需要识别之前的 deployment candidate 时，可以要求 Codex 列出或检查 saved versions。

## 选择受支持的 site 形态

Sites 托管的项目需要构建出与 Cloudflare Worker 兼容的 ES modules output。对于新项目，Sites 工作流可以从它推荐的 site starter 开始。对于现有 site，请先要求 Codex 确认该项目的 build 可以生成兼容 deployment artifacts，再请求部署。

告诉 Codex 你需要的产品行为，以便它选择合适的 site shape：

| Site 需求                                                     | 应向 Sites 请求什么                                                          |
| ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 以内容为主的网站或 landing page                               | 一个没有持久 application state 的 site，除非体验需要它                      |
| 保存的 records、user progress 或 game scores                  | D1，用于持久 structured data 的 relational database                         |
| Images、documents、audio、video 或其他 uploads                | R2，用于文件的 object storage                                                |
| 带有可搜索 metadata 的 uploaded files                         | D1 用于 metadata，R2 用于 file contents                                      |
| 需要当前 workspace user identity 的 internal site              | Workspace-authenticated user identity                                       |
| Public sign-in 或外部 identity provider                       | 启用 authentication 的 Sites project                                         |

不要为临时 presentation state 请求 durable storage，例如 theme choice 或 dismissed banner。对于用户期望托管 site 会记住的 product data，则应该请求 durable storage。

## 控制访问和 secrets

在分享 deployed URL 前设置 audience。对于新 site，在审查 content、data handling 和 expected audience 之前，请将访问限制为 owner 和 workspace admins。

你可以要求 Sites 应用以下 access modes 之一：

| Access mode                      | 谁可以访问该 site                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Owner and admins (`admins_only`) | site owner 和 workspace admins                                                     |
| Workspace (`workspace_all`)      | workspace 中所有 active users                                                      |
| Custom (`custom`)                | 你选择的特定 active users 或 workspace groups；Sites 仍允许 owner 访问             |

例如：

```text
@Sites Change this deployed site's access to everyone in my workspace after
showing me the current site and confirming the deployment URL.
```

### 配置 runtime environment values

在 app sidebar 中打开 **Sites**，选择一个 project，在 Sites panel 中添加、更新或移除 hosted environment variables 和 secrets。不要把这些值存储在 `.openai/hosting.json` 中。保持本地 `.env` 和 `.env.example` 文件与本地开发所需 keys 对齐，并且不要提交 secret values。

当你添加、更新或移除 hosted environment values 时，请要求 Codex 重新部署已批准的 saved version，让下一次部署使用更新后的配置。

## 分享前审查

在部署或扩大访问范围前：

- 在 Codex [review pane](https://developers.openai.com/codex/app/review) 中审查 source changes 和任何 database migrations。
- 确认 build 成功，并且选定 saved version 是你打算发布的 version。
- 检查只有预期 audience 可以访问该 site。
- 确认你通过 Sites 配置了 runtime secret values，并且没有把它们提交到 source files。
- 部署后，要求 Codex 确认 deployment status 和 production URL，再进行分享。

## 相关文档

- [Plugins](https://developers.openai.com/codex/plugins) 解释如何安装和调用 Codex plugins。
- [Codex app](https://developers.openai.com/codex/app) 介绍 app navigation 和 project threads。
- [Review and ship changes](https://developers.openai.com/codex/app/review) 解释如何在发布前检查 source changes。

