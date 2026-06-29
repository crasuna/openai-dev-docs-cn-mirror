---
title: "Sites 站点"
description: "Build and deploy hosted sites from Codex with the Sites plugin"
outline: deep
---

# Sites 站点

**文档集**：Codex\
**分组**：站点\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/sites](https://developers.openai.com/codex/sites)
- Markdown 来源：[https://developers.openai.com/codex/sites.md](https://developers.openai.com/codex/sites.md)
- 抓取时间：2026-06-27T05:55:08.800Z
- Checksum：`41080a4ebf38737e905978f76729e55022b7080a33d1d8c537fb4c42f06fb97b`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Sites 让 Codex 可以创建、保存、部署和检查由 OpenAI 托管的网站、web apps 和 games。当你想把一个 prompt 或兼容的现有项目变成托管站点，而不想设置单独部署工作流时，请使用 **Sites** plugin。

每个 Sites deployment URL 都是 production deployment。如果你希望在 build 变为 live 之前审查它，请要求 Codex 保存一个版本而不部署。

## 开始使用 Sites

Sites 处于 preview 阶段，目前面向 ChatGPT Business 和 Enterprise workspaces 开放，更多 plans 会随后推出。对于 ChatGPT Enterprise workspaces，管理员必须先通过 role-based access control（RBAC）启用它，成员才能使用。按 plan 对比支持情况请参见 [Feature availability](/mirror/codex/pricing#feature-availability)。


1. 为 Enterprise workspace 启用 Sites

    如果你使用 ChatGPT Enterprise，请让 workspace admin 在 [ChatGPT admin settings](https://chatgpt.com/admin/settings) 中打开 RBAC controls，并为相应 role 打开 Sites。ChatGPT Business workspaces 可以跳过这一步，因为 Sites 默认启用。

2. 添加 Sites plugin

   如果 **Sites** 还不可用，请在 Codex app 中打开 **Plugins**，找到 **Sites**，并把它添加到 Codex。安装 plugin 后请启动一个新 thread。

3. 开始 Sites 任务

   在 thread 中描述你想创建或发布的 site。你可以用 `@Sites` 明确命名该 plugin，尤其是当你的任务应以托管部署结束时。

   &lt;CodexScreenshot
     alt="Codex app composer with the Sites plugin and connected apps mentioned in a prompt"
     lightSrc="/images/codex/sites/prompt-input-light.jpg"
     darkSrc="/images/codex/sites/prompt-input-dark.jpg"
     variant="no-wallpaper"
   /&gt;

4. 审查是保存还是部署

   要求 Codex 验证 site 的 build。然后告诉它保存一个可部署版本以供审查，或部署已批准的 saved version。

5. 返回已部署 sites

   在 app sidebar 中打开 **Sites**，回到你的 Sites projects。你也可以要求 Codex 检查 saved versions、查看 deployment status，或更改谁可以访问已部署 site。

   &lt;CodexScreenshot
     alt="Sites project list in the Codex app"
     lightSrc="/images/codex/sites/sites-list-light.jpg"
     darkSrc="/images/codex/sites/sites-list-dark.jpg"
     variant="no-wallpaper"
   /&gt;



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

- 在 Codex [review pane](/mirror/codex/app/review) 中审查 source changes 和任何 database migrations。
- 确认 build 成功，并且选定 saved version 是你打算发布的 version。
- 检查只有预期 audience 可以访问该 site。
- 确认你通过 Sites 配置了 runtime secret values，并且没有把它们提交到 source files。
- 部署后，要求 Codex 确认 deployment status 和 production URL，再进行分享。

## 相关文档

- [Plugins](/mirror/codex/plugins) 解释如何安装和调用 Codex plugins。
- [Codex app](/mirror/codex/app) 介绍 app navigation 和 project threads。
- [Review and ship changes](/mirror/codex/app/review) 解释如何在发布前检查 source changes。

:::

## English source

::: details 展开英文原文
::: v-pre
Sites lets Codex create, save, deploy, and inspect websites, web apps, and
games hosted by OpenAI. Use the **Sites** plugin when you want to turn a prompt
or a compatible existing project into a hosted site without setting up a
separate deployment workflow.

Every Sites deployment URL is a production deployment. If you want to review a
  build before it becomes live, ask Codex to save a version without deploying
  it.

## Get started with Sites

Sites is in preview and currently available for ChatGPT Business and Enterprise
workspaces, with more plans rolling out later. For ChatGPT Enterprise
workspaces, an admin must turn it on through role-based access control (RBAC)
before members can use it. Compare support by plan in
[Feature availability](/mirror/codex/pricing#feature-availability).


1. Enable Sites for an Enterprise workspace

    If you use ChatGPT Enterprise, ask your workspace admin to open the RBAC
    controls in [ChatGPT admin settings](https://chatgpt.com/admin/settings) and
    turn on Sites for the appropriate role. ChatGPT Business workspaces can skip
    this step because Sites is enabled by default.

2. Add the Sites plugin

   If **Sites** isn't already available, open **Plugins** in the Codex app, find
   **Sites**, and add it to Codex. Start a new thread after installing a plugin.

3. Start a Sites task

   In a thread, describe the site you want to create or publish. You can name
   the plugin explicitly with `@Sites`, especially when your task should end in
   a hosted deployment.

   &lt;CodexScreenshot
     alt="Codex app composer with the Sites plugin and connected apps mentioned in a prompt"
     lightSrc="/images/codex/sites/prompt-input-light.jpg"
     darkSrc="/images/codex/sites/prompt-input-dark.jpg"
     variant="no-wallpaper"
   /&gt;

4. Review whether to save or deploy

   Ask Codex to validate the site's build. Then tell it either to save a
   deployable version for review or to deploy the approved saved version.

5. Return to deployed sites

   Open **Sites** in the app sidebar to return to your Sites projects. You can
   also ask Codex to inspect saved versions, check deployment status, or change
   who can access a deployed site.

   &lt;CodexScreenshot
     alt="Sites project list in the Codex app"
     lightSrc="/images/codex/sites/sites-list-light.jpg"
     darkSrc="/images/codex/sites/sites-list-dark.jpg"
     variant="no-wallpaper"
   /&gt;



## Prompt Sites for common tasks

For a new website, dashboard, or internal tool, include the audience, core
experience, and required data:

```text
@Sites Build a project request dashboard for my operations team. Let team
members submit requests, see who owns each one, update the status, and filter
the list. Require people to sign in with their workspace account, and keep the
request data saved between visits.
```

For an existing project, ask Sites to prepare and publish the current app:

```text
@Sites Deploy this project. Check whether it is compatible with Sites, make any
required changes, and give me the deployment URL.
```

When a site needs durable application data or uploaded files, say so in the
request:

```text
@Sites Add persistent player scores and avatar uploads to this game. Use
the appropriate Sites storage and deploy the updated game.
```

Browse the [Sites showcase](https://developers.openai.com/showcase/sites) for deployed internal apps and
  the full prompts used to create them.

## Understand projects, versions, and deployments

A Sites project links a local source project to hosting managed through Sites.
Codex stores that linkage and optional storage binding names in
`.openai/hosting.json`. A newly created local starter can begin without a
`project_id`; Sites adds one after it provisions the hosted project.

For example, a provisioned site that uses a relational database binding and no
file storage can contain:

```json
{
  "project_id": "<project-id>",
  "d1": "DB",
  "r2": null
}
```

Sites publishing has two separate stages:

1. **Save a version.** Codex builds the deployable site and associates that
   version with the source Git commit used for the build. Use this stage when
   you want a reviewable deployment candidate.
2. **Deploy a version.** Codex publishes a saved version and reports the
   production URL when deployment succeeds. Use this only when you intend for
   the selected audience to access the site.

Ask Codex to list or inspect saved versions when you need to identify a
previous deployment candidate.

## Choose a supported site shape

Sites hosts projects that build Cloudflare Worker-compatible output as ES
modules. For new projects, the Sites workflow can start with its recommended
site starter. For an existing site, ask Codex to confirm that the project's
build can produce compatible deployment artifacts before you request a
deployment.

Tell Codex about the product behavior you need so it can select the appropriate
site shape:

| Site need                                                      | What to ask Sites for                                                         |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Content-led website or landing page                            | A site with no persistent application state unless the experience requires it |
| Saved records, user progress, or game scores                   | D1, a relational database for durable structured data                         |
| Images, documents, audio, video, or other uploads              | R2, object storage for files                                                  |
| Uploaded files with searchable metadata                        | D1 for metadata and R2 for file contents                                      |
| Internal site that needs the current workspace user's identity | Workspace-authenticated user identity                                         |
| Public sign-in or an external identity provider                | An authentication-enabled Sites project                                       |

Don't request durable storage for temporary presentation state, such as a
theme choice or a dismissed banner. Do request it for product data that people
expect the hosted site to remember.

## Control access and secrets

Set the audience before you share a deployed URL. For a new site, keep access
limited to the owner and workspace admins until you have reviewed the content,
data handling, and expected audience.

You can ask Sites to apply one of these access modes:

| Access mode                      | Who can access the site                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| Owner and admins (`admins_only`) | The site owner and workspace admins                                                           |
| Workspace (`workspace_all`)      | All active users in the workspace                                                             |
| Custom (`custom`)                | Specific active users or workspace groups that you choose; Sites continues to allow the owner |

For example:

```text
@Sites Change this deployed site's access to everyone in my workspace after
showing me the current site and confirming the deployment URL.
```

### Configure runtime environment values

Open **Sites** in the app sidebar and select a project to add, update, or remove
hosted environment variables and secrets in the Sites panel. Don't store these
values in `.openai/hosting.json`. Keep local `.env` and `.env.example` files
aligned with the keys needed for local development, and don't commit secret
values.

When you add, update, or remove hosted environment values, ask Codex to
redeploy the approved saved version so the next deployment uses the updated
configuration.

## Review before you share

Before you deploy or widen access:

- Review the source changes and any database migrations in the Codex
  [review pane](/mirror/codex/app/review).
- Confirm that the build succeeded and that the selected saved version is the
  version you intend to publish.
- Check that only the intended audience can access the site.
- Confirm that you configured runtime secret values through Sites and didn't
  commit them in source files.
- After deployment, ask Codex to confirm deployment status and the production
  URL before you share it.

## Related documentation

- [Plugins](/mirror/codex/plugins) explains how to install and invoke Codex plugins.
- [Codex app](/mirror/codex/app) introduces app navigation and project threads.
- [Review and ship changes](/mirror/codex/app/review) explains how to inspect source
  changes before publishing them.

:::
:::

