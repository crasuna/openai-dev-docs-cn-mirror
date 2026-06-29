---
title: "将 Codex 与 Amazon Bedrock 搭配使用"
description: "Configure Codex to use OpenAI models available through Amazon Bedrock."
outline: deep
---

# 将 Codex 与 Amazon Bedrock 搭配使用

**文档集**：Codex 编码智能体<br>
**分组**：Codex — Amazon Bedrock<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/amazon-bedrock](https://developers.openai.com/codex/amazon-bedrock)
- Markdown 来源：[https://developers.openai.com/codex/amazon-bedrock.md](https://developers.openai.com/codex/amazon-bedrock.md)
- 抓取时间：2026-06-27T05:54:49.789Z
- Checksum：`700e0b975ee9ae699df004865fde1e6c605cff9048d0e884356b7eca33cd3004`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
配置 Codex 使用通过 Amazon Bedrock 提供的 OpenAI models。在这种设置中，Codex 会在本地运行，并使用 AWS 管理的认证和访问控制将模型请求发送到 Bedrock。

## 工作原理

当你将 Codex 配置为以 Amazon Bedrock 作为 model provider 时，请求路径中不会包含 OpenAI-hosted Responses API。Codex 会将模型请求发送到 Amazon Bedrock，而 Bedrock 会为受支持的 OpenAI models 提供 OpenAI-compatible Responses API 实现。

认证是 AWS-native 的。用户使用 Bedrock API key 或 AWS IAM credentials 认证。对于此 provider，他们不使用 ChatGPT sign-in 或 `OPENAI_API_KEY`。

## 开始之前

请确保你具备：

- 在 Amazon Bedrock 中访问受支持 OpenAI models 的权限。
- 所选模型可用的 AWS Region。
- 已为 AWS account 配置 Amazon Bedrock Mantle path 的认证。

## 配置 Codex

将 Amazon Bedrock Mantle path 的 `amazon-bedrock` model provider 添加到 `~/.codex/config.toml`。是否提供 model 是可选的。需要时请显式选择受支持的模型。

```toml
model_provider = "amazon-bedrock"
```

本指南涵盖受支持 commercial AWS Regions 中的 Amazon Bedrock Mantle path。Codex 不支持 AWS GovCloud Regions 中的 Bedrock Mantle endpoints。

## 认证选项

Codex 支持两种 Bedrock 认证路径。它会按以下顺序检查：

1. Bedrock API key。
2. AWS SDK credential chain。

### 选项 1：Bedrock API key

在 Codex 读取的环境中设置 Bedrock API key。使用 API-key 认证时，必须指定 Region。

```shell
export AWS_BEARER_TOKEN_BEDROCK=<your-bedrock-api-key>
export AWS_REGION=us-east-2
```

### 选项 2：AWS SDK credentials

当你的组织通过 AWS SDK credential chain 管理 Bedrock access 时，请使用此路径。Codex 可以使用这些标准 AWS SDK credential sources：

1. 共享 AWS `config` 和 `credentials` 文件。

```shell
   aws configure
```

2. Environment variables。

```shell
   export AWS_ACCESS_KEY_ID=<your-access-key-id>
   export AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
   export AWS_SESSION_TOKEN=<your-session-token>
```

3. AWS Management Console credentials。

```shell
   aws login
```

4. AWS SSO 或 named profile。

```shell
   aws sso login --profile codex-bedrock
   export AWS_PROFILE=codex-bedrock
```

5. 使用 `credential_process` 配置的 Federated identity。对于 corporate SSO 或 OIDC federation，请在 Codex 外部配置 AWS profile，并让 AWS SDK 解析 credentials。将 browser login、token exchange、caching 和 refresh 放在你的 AWS profile 的 `credential_process` helper 中。

## Desktop app 与 VS Code extension

Desktop apps 和 IDE extensions 可能不会继承 shell 中的 environment variables。请将所需值放入 `~/.codex/.env`，然后重启 app 或 extension。

```shell
export AWS_BEARER_TOKEN_BEDROCK=<your-bedrock-api-key>
export AWS_REGION=us-east-2
```

## 验证设置

- 在 Codex CLI 中，打开 `/status` 并确认 Codex 正在使用 `amazon-bedrock` model provider。
- 在 desktop app 或 VS Code extension 中，重启 app 后启动新 session。
- 确认所选模型在配置的 AWS Region 中可用，并且 AWS identity 有权限访问它。

## 支持的模型

使用精确的 model IDs：

```text
openai.gpt-5.5
openai.gpt-5.4
```

模型可用性因 AWS Region 而异。选择模型前，请参阅 [AWS Region 的模型支持情况](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html)。

## 功能可用性

此配置支持本地 Codex 工作流。一些依赖 OpenAI-hosted cloud services、hosted tools 或 cloud-managed discovery 的功能目前不可用。

Amazon Bedrock 不支持 Fast Mode。Fast Mode 使用 priority processing，而最初的 Amazon Bedrock offering 仅支持 on-demand inference。


  &lt;CodexPlanFeatureMatrix
    client:load
    data=&#123;&#123;
      plans: [
        {
          id: "bedrock",
          shortLabel: "Amazon Bedrock",
          label: "Amazon Bedrock",
        },
      ],
      sections: [
        {
          title: "访问和界面",
          features: [
            {
              name: "Codex web",
              href: "/codex/cloud",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "用于本地任务的 Codex app",
              href: "/codex/app",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Codex CLI",
              href: "/codex/cli",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "IDE extension",
              href: "/codex/ide",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Codex SDK、`codex exec` 和可脚本化工作流",
              shortName: "Codex SDK 和脚本",
              href: "/codex/sdk",
              availability: {
                bedrock: "available",
              },
            },
          ],
        },
        {
          title: "模型和多模态",
          features: [
            {
              name: "由 Bedrock 支撑的受支持 OpenAI models 推理",
              shortName: "Bedrock-backed inference",
              href: "/codex/amazon-bedrock",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Fast mode",
              href: "/codex/speed",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "图像生成和编辑",
              href: "/codex/app/features#image-generation",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "语音听写",
              href: "/codex/app/features#voice-dictation",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Web search",
              href: "/codex/app/features#web-search",
              availability: {
                bedrock: "unavailable",
              },
            },
          ],
        },
        {
          title: "本地功能",
          features: [
            {
              name: "使用 `/review` 进行本地代码 review",
              shortName: "本地代码 review",
              href: "/codex/workflows#do-a-local-code-review",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Approval requests 的 Auto-review",
              href: "/codex/concepts/sandboxing/auto-review",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Sandboxing 和权限控制",
              href: "/codex/permissions",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "项目和独立 app automations",
              shortName: "App automations",
              href: "/codex/app/automations",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Automations",
              href: "/codex/app/automations",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Worktrees 和内置 Git tools",
              shortName: "内置 Git tools",
              href: "/codex/app/worktrees",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "本地环境和可重复操作",
              shortName: "可重复操作",
              href: "/codex/app/local-environments",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Appshots",
              href: "/codex/appshots",
              availability: {
                bedrock: "available",
              },
            },
          ],
        },
        {
          title: "浏览器和远程控制",
          features: [
            {
              name: "In-app browser previews 和 comments",
              shortName: "In-app browser",
              href: "/codex/app/browser",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Browser Use automation",
              href: "/codex/app/browser#browser-use",
              availability: {
                bedrock: "limited",
              },
            },
            {
              name: "Chrome extension browser control",
              shortName: "Chrome browser control",
              href: "/codex/app/chrome-extension",
              availability: {
                bedrock: "limited",
              },
            },
            {
              name: "Computer Use",
              href: "/codex/app/computer-use",
              availability: {
                bedrock: "limited",
              },
            },
            {
              name: "SSH remote connections",
              shortName: "SSH remote",
              href: "/codex/remote-connections#connect-to-an-ssh-host",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "移动端远程控制",
              href: "/codex/remote-connections",
              availability: {
                bedrock: "unavailable",
              },
            },
          ],
        },
        {
          title: "自定义和扩展",
          features: [
            {
              name: "使用 `AGENTS.md` 的自定义指令",
              shortName: "自定义指令",
              href: "/codex/guides/agents-md",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Skills",
              href: "/codex/skills",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Plugins",
              href: "/codex/plugins",
              availability: {
                bedrock: "limited",
              },
              limitedFootnote: "plugins",
            },
            {
              name: "Plugin sharing",
              href: "/codex/plugins/build#share-a-local-plugin-with-your-workspace",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "App connectors",
              href: "/codex/plugins",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "MCP",
              href: "/codex/mcp",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Subagents 和 custom agents",
              shortName: "Subagents",
              href: "/codex/subagents",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Memories",
              href: "/codex/memories",
              availability: {
                bedrock: "limited",
              },
            },
            {
              name: "Chronicle",
              href: "/codex/memories/chronicle",
              availability: {
                bedrock: "unavailable",
              },
            },
          ],
        },
        {
          title: "Cloud 和 integrations",
          features: [
            {
              name: "Codex cloud tasks",
              shortName: "Cloud tasks",
              href: "/codex/cloud",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Sites",
              href: "/codex/sites",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "使用 `@codex` 进行 GitHub issue 和 PR delegation",
              shortName: "GitHub delegation",
              href: "/codex/integrations/github#give-codex-other-tasks",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "GitHub code review 和 automatic PR reviews",
              shortName: "GitHub PR reviews",
              href: "/codex/integrations/github",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Slack cloud integration",
              shortName: "Slack integration",
              href: "/codex/integrations/slack",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Linear cloud integration",
              shortName: "Linear integration",
              href: "/codex/integrations/linear",
              availability: {
                bedrock: "unavailable",
              },
            },
          ],
        },
        {
          title: "Admin、安全和 analytics",
          features: [
            {
              name: "SAML SSO、MFA 和 workspace user management",
              shortName: "Workspace management",
              href: "/codex/enterprise/admin-setup",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "`requirements.toml` managed config",
              shortName: "`requirements.toml` config",
              href: "/codex/enterprise/managed-configuration",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Cloud-managed config policies",
              shortName: "Cloud-managed policies",
              href: "/codex/enterprise/managed-configuration#cloud-managed-requirements",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Codex RBAC 和 custom roles",
              shortName: "RBAC 和 roles",
              href: "/codex/enterprise/admin-setup#step-2-set-up-custom-roles-rbac",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "SCIM、EKM 和 domain verification",
              shortName: "SCIM、EKM 和 domains",
              href: "/codex/enterprise/admin-setup#enterprise-grade-security-and-privacy",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Enterprise retention 和 residency controls",
              shortName: "Retention 和 residency",
              href: "/codex/enterprise/admin-setup#enterprise-grade-security-and-privacy",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "默认不使用 API 或 business data 进行训练",
              shortName: "默认不训练",
              href: "https://openai.com/business-data/",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Analytics dashboard",
              href: "/codex/enterprise/governance#analytics-dashboard",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Analytics API",
              href: "/codex/enterprise/governance#analytics-api",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Compliance API 和 audit logs",
              shortName: "Compliance 和 audit logs",
              href: "/codex/enterprise/governance#compliance-api",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "用于已连接 GitHub repositories 的 Codex Security",
              shortName: "Codex Security",
              href: "/codex/security",
              availability: {
                bedrock: "unavailable",
              },
            },
          ],
        },
      ],
    &#125;&#125;
  /&gt;

  &lt;div
    id="codex-plan-region-limits"
    className="not-prose mt-3 text-sm text-secondary"
  &gt;
    &lt;sup&gt;*&lt;/sup&gt; 功能目前仅限特定 regions。请查看单项功能文档以了解更多地理限制。

  &lt;div
    id="codex-plan-plugin-limits"
    className="not-prose mt-1 text-sm text-secondary"
  &gt;
    &lt;sup&gt;†&lt;/sup&gt; 当 local plugin bundles 的能力不需要 ChatGPT authentication 时支持它们。OpenAI-curated plugin discovery 以及依赖 app connectors 或 cloud-hosted sharing 的功能不可用。



## 故障排除

如果设置失败，请检查以下内容：

- model ID 是否与受支持模型精确匹配。
- 你是否指定了模型可用的 AWS Region。
- Bedrock API key 或 AWS credentials 是否有效且未过期。
- AWS identity 是否有权限访问所选 Bedrock model。
- `AWS_BEARER_TOKEN_BEDROCK` 是否没有设置为已过期或非预期的 key。
- 对于 desktop app 或 VS Code extension 用法，所需 environment variables 是否存在于 `~/.codex/.env` 中。

## 支持边界

OpenAI Support 可以帮助处理 Codex client setup、configuration、local CLI behavior、desktop app behavior、IDE extension behavior，以及本地 Codex product experience。

对于 AWS credentials、IAM permissions、Bedrock model access、quotas、billing、regional availability、Bedrock request failures、AWS service logs 或 Bedrock service behavior，请联系客户的 AWS administrator 或 AWS Support。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Configure Codex to use OpenAI models available through Amazon Bedrock. In this
setup, Codex runs locally and sends model requests to Bedrock using
AWS-managed authentication and access controls.

## How it works

When you configure Codex with Amazon Bedrock as the model provider, the
OpenAI-hosted Responses API isn't in the request path. Codex sends model
requests to Amazon Bedrock, and Bedrock provides an OpenAI-compatible Responses
API implementation for supported OpenAI models.

Authentication is AWS-native. Users authenticate with a Bedrock API key or AWS
  IAM credentials. They do not use ChatGPT sign-in or `OPENAI_API_KEY` for this
  provider.

## Before you start

Make sure you have:

- Access to supported OpenAI models in Amazon Bedrock.
- An AWS Region where the selected model is available.
- Authentication for the Amazon Bedrock Mantle path configured for the AWS
  account.

## Configure Codex

Add the `amazon-bedrock` model provider for the Amazon Bedrock Mantle path to
`~/.codex/config.toml`. Supplying a model is optional. Select a supported model
explicitly when needed.

```toml
model_provider = "amazon-bedrock"
```

This guide covers the Amazon Bedrock Mantle path in supported commercial AWS
  Regions. Codex doesn't support Bedrock Mantle endpoints in AWS GovCloud
  Regions.

## Authentication options

Codex supports two Bedrock authentication paths. It checks them in this order:

1. Bedrock API key.
2. AWS SDK credential chain.

### Option 1: Bedrock API key

Set the Bedrock API key in the environment Codex reads. You must specify a
Region when using API-key authentication.

```shell
export AWS_BEARER_TOKEN_BEDROCK=<your-bedrock-api-key>
export AWS_REGION=us-east-2
```

### Option 2: AWS SDK credentials

Use this path when your organization manages Bedrock access through the AWS SDK
credential chain. Codex can use these standard AWS SDK credential sources:

1. Shared AWS `config` and `credentials` files.

   ```shell
   aws configure
   ```

2. Environment variables.

   ```shell
   export AWS_ACCESS_KEY_ID=<your-access-key-id>
   export AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
   export AWS_SESSION_TOKEN=<your-session-token>
   ```

3. AWS Management Console credentials.

   ```shell
   aws login
   ```

4. AWS SSO or a named profile.

   ```shell
   aws sso login --profile codex-bedrock
   export AWS_PROFILE=codex-bedrock
   ```

5. Federated identity configured with `credential_process`. For corporate SSO or
   OIDC federation, configure the AWS profile outside Codex and let the AWS SDK
   resolve credentials. Put browser login, token exchange, caching, and refresh
   in your AWS profile's `credential_process` helper.

## Desktop app and VS Code extension

Desktop apps and IDE extensions may not inherit environment variables from the
shell. Put required values in `~/.codex/.env`, then restart the app or
extension.

```shell
export AWS_BEARER_TOKEN_BEDROCK=<your-bedrock-api-key>
export AWS_REGION=us-east-2
```

## Verify setup

- In Codex CLI, open `/status` and confirm Codex is using the
  `amazon-bedrock` model provider.
- In the desktop app or VS Code extension, start a new session after restarting
  the app.
- Confirm the selected model is available in the configured AWS Region and that
  the AWS identity has permission to access it.

## Supported models

Use exact model IDs:

```text
openai.gpt-5.5
openai.gpt-5.4
```

Model availability varies by AWS Region. Before selecting a model, see [model
support by AWS
Region](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html).

## Feature availability

This configuration supports local Codex workflows. Some features that depend on
OpenAI-hosted cloud services, hosted tools, or cloud-managed discovery aren't
currently available.

Fast Mode isn't available with Amazon Bedrock. Fast Mode uses priority
  processing, and the initial Amazon Bedrock offering supports on-demand
  inference only.

<ToggleSection title="Detailed feature availability">
  <CodexPlanFeatureMatrix
    client:load
    data={{
      plans: [
        {
          id: "bedrock",
          shortLabel: "Amazon Bedrock",
          label: "Amazon Bedrock",
        },
      ],
      sections: [
        {
          title: "Access and surfaces",
          features: [
            {
              name: "Codex web",
              href: "/codex/cloud",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Codex app for local tasks",
              href: "/codex/app",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Codex CLI",
              href: "/codex/cli",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "IDE extension",
              href: "/codex/ide",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Codex SDK, `codex exec`, and scriptable workflows",
              shortName: "Codex SDK and scripting",
              href: "/codex/sdk",
              availability: {
                bedrock: "available",
              },
            },
          ],
        },
        {
          title: "Models and multimodal",
          features: [
            {
              name: "Bedrock-backed inference with supported OpenAI models",
              shortName: "Bedrock-backed inference",
              href: "/codex/amazon-bedrock",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Fast mode",
              href: "/codex/speed",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Image generation and editing",
              href: "/codex/app/features#image-generation",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Voice dictation",
              href: "/codex/app/features#voice-dictation",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Web search",
              href: "/codex/app/features#web-search",
              availability: {
                bedrock: "unavailable",
              },
            },
          ],
        },
        {
          title: "Local features",
          features: [
            {
              name: "Local code review with `/review`",
              shortName: "Local code review",
              href: "/codex/workflows#do-a-local-code-review",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Auto-review for approval requests",
              href: "/codex/concepts/sandboxing/auto-review",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Sandboxing and permission controls",
              href: "/codex/permissions",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Project and standalone app automations",
              shortName: "App automations",
              href: "/codex/app/automations",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Automations",
              href: "/codex/app/automations",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Worktrees and built-in Git tools",
              shortName: "Built-in Git tools",
              href: "/codex/app/worktrees",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Local environments and repeatable actions",
              shortName: "Repeatable actions",
              href: "/codex/app/local-environments",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Appshots",
              href: "/codex/appshots",
              availability: {
                bedrock: "available",
              },
            },
          ],
        },
        {
          title: "Browser and remote control",
          features: [
            {
              name: "In-app browser previews and comments",
              shortName: "In-app browser",
              href: "/codex/app/browser",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Browser Use automation",
              href: "/codex/app/browser#browser-use",
              availability: {
                bedrock: "limited",
              },
            },
            {
              name: "Chrome extension browser control",
              shortName: "Chrome browser control",
              href: "/codex/app/chrome-extension",
              availability: {
                bedrock: "limited",
              },
            },
            {
              name: "Computer Use",
              href: "/codex/app/computer-use",
              availability: {
                bedrock: "limited",
              },
            },
            {
              name: "SSH remote connections",
              shortName: "SSH remote",
              href: "/codex/remote-connections#connect-to-an-ssh-host",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Mobile remote control",
              href: "/codex/remote-connections",
              availability: {
                bedrock: "unavailable",
              },
            },
          ],
        },
        {
          title: "Customization and extensions",
          features: [
            {
              name: "Custom instructions with `AGENTS.md`",
              shortName: "Custom instructions",
              href: "/codex/guides/agents-md",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Skills",
              href: "/codex/skills",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Plugins",
              href: "/codex/plugins",
              availability: {
                bedrock: "limited",
              },
              limitedFootnote: "plugins",
            },
            {
              name: "Plugin sharing",
              href: "/codex/plugins/build#share-a-local-plugin-with-your-workspace",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "App connectors",
              href: "/codex/plugins",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "MCP",
              href: "/codex/mcp",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Subagents and custom agents",
              shortName: "Subagents",
              href: "/codex/subagents",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Memories",
              href: "/codex/memories",
              availability: {
                bedrock: "limited",
              },
            },
            {
              name: "Chronicle",
              href: "/codex/memories/chronicle",
              availability: {
                bedrock: "unavailable",
              },
            },
          ],
        },
        {
          title: "Cloud and integrations",
          features: [
            {
              name: "Codex cloud tasks",
              shortName: "Cloud tasks",
              href: "/codex/cloud",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Sites",
              href: "/codex/sites",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "GitHub issue and PR delegation with `@codex`",
              shortName: "GitHub delegation",
              href: "/codex/integrations/github#give-codex-other-tasks",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "GitHub code review and automatic PR reviews",
              shortName: "GitHub PR reviews",
              href: "/codex/integrations/github",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Slack cloud integration",
              shortName: "Slack integration",
              href: "/codex/integrations/slack",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Linear cloud integration",
              shortName: "Linear integration",
              href: "/codex/integrations/linear",
              availability: {
                bedrock: "unavailable",
              },
            },
          ],
        },
        {
          title: "Admin, security, and analytics",
          features: [
            {
              name: "SAML SSO, MFA, and workspace user management",
              shortName: "Workspace management",
              href: "/codex/enterprise/admin-setup",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "`requirements.toml` managed config",
              shortName: "`requirements.toml` config",
              href: "/codex/enterprise/managed-configuration",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Cloud-managed config policies",
              shortName: "Cloud-managed policies",
              href: "/codex/enterprise/managed-configuration#cloud-managed-requirements",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Codex RBAC and custom roles",
              shortName: "RBAC and roles",
              href: "/codex/enterprise/admin-setup#step-2-set-up-custom-roles-rbac",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "SCIM, EKM, and domain verification",
              shortName: "SCIM, EKM, and domains",
              href: "/codex/enterprise/admin-setup#enterprise-grade-security-and-privacy",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Enterprise retention and residency controls",
              shortName: "Retention and residency",
              href: "/codex/enterprise/admin-setup#enterprise-grade-security-and-privacy",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "No training on API or business data by default",
              shortName: "No default training",
              href: "https://openai.com/business-data/",
              availability: {
                bedrock: "available",
              },
            },
            {
              name: "Analytics dashboard",
              href: "/codex/enterprise/governance#analytics-dashboard",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Analytics API",
              href: "/codex/enterprise/governance#analytics-api",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Compliance API and audit logs",
              shortName: "Compliance and audit logs",
              href: "/codex/enterprise/governance#compliance-api",
              availability: {
                bedrock: "unavailable",
              },
            },
            {
              name: "Codex Security for connected GitHub repositories",
              shortName: "Codex Security",
              href: "/codex/security",
              availability: {
                bedrock: "unavailable",
              },
            },
          ],
        },
      ],
    }}
  />

  <div
    id="codex-plan-region-limits"
    className="not-prose mt-3 text-sm text-secondary"
  >
    <sup>*</sup> Feature is currently limited to only specific regions. Check
    the individual feature documentation to learn more about geo restrictions.
  </div>
  <div
    id="codex-plan-plugin-limits"
    className="not-prose mt-1 text-sm text-secondary"
  >
    <sup>†</sup> Local plugin bundles are supported when their capabilities do
    not require ChatGPT authentication. OpenAI-curated plugin discovery and
    features that depend on app connectors or cloud-hosted sharing aren't
    available.
  </div>
</ToggleSection>

## Troubleshooting

If setup fails, check the following:

- The model ID exactly matches a supported model.
- You specify an AWS Region where the model is available.
- The Bedrock API key or AWS credentials are valid and not expired.
- The AWS identity has permission to access the selected Bedrock model.
- `AWS_BEARER_TOKEN_BEDROCK` isn't set to an expired or unintended key.
- For desktop app or VS Code extension usage, required environment variables
  are present in `~/.codex/.env`.

## Support boundaries

OpenAI Support can help with Codex client setup, configuration, local CLI
behavior, desktop app behavior, IDE extension behavior, and the local Codex
product experience.

For AWS credentials, IAM permissions, Bedrock model access, quotas, billing,
regional availability, Bedrock request failures, AWS service logs, or Bedrock
service behavior, contact the customer's AWS administrator or AWS Support.
``````
:::
:::

