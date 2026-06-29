---
title: "从 Agent Builder 迁移"
description: "Learn how to export an Agent Builder workflow and continue with ChatGPT Workspace Agents or the Agents SDK."
outline: deep
---

# 从 Agent Builder 迁移

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agent-builder/migrate-from-agent-builder](https://developers.openai.com/api/docs/guides/agent-builder/migrate-from-agent-builder)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agent-builder/migrate-from-agent-builder.md](https://developers.openai.com/api/docs/guides/agent-builder/migrate-from-agent-builder.md)
- 抓取时间：2026-06-27T05:53:57.927Z
- Checksum：`3cdaef348daa9191926687d1e33d1c7dc67de2badee1156f7df48a4494a544e1`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用本指南将现有 Agent Builder 工作流导出为 Agents SDK 代码。你可以使用导出内容，将该工作流重新创建为 ChatGPT Workspace Agent，或在你的应用中继续使用 Agents SDK。

此过程不会转换你的工作流图，也不保证每一种行为都能原样迁移。

## 选择迁移路径

- **Agents SDK**：最适合通过代码构建 agent。
- **ChatGPT Workspace Agents**：最适合通过自然语言构建 agent，并与团队共享。

## 迁移前准备

你需要能够访问 [Agent Builder](/mirror/api/docs/guides/agent-builder) 中的该工作流。

## 导出你的工作流

1. 在 Agent Builder 中打开你的工作流。
1. 在顶部导航中选择 **Code**。
1. 在代码对话框中选择 **Agents SDK**。
1. 选择 **TypeScript** 或 **Python**，然后复制完整导出内容。

![选中 Agents SDK 的 Agent Builder Code 对话框](/openai-assets/developers.openai.com/images/platform/guides/agent-builder/agents-sdk-export.png)

## 选项 1：继续使用 Agents SDK

如果你想在自己构建和部署的应用中运行导出的工作流，请使用此选项。

将 TypeScript 或 Python 导出内容复制到你的应用中，安装并配置对应的 Agents SDK，然后在你的运行时中测试该工作流。有关配置和运行导出内容的指导，请参阅 [Agents SDK overview](/mirror/api/docs/guides/agents) 和 [quickstart](/mirror/api/docs/guides/agents/quickstart)。部署前，请验证你的应用配置和行为。

## 选项 2：根据导出内容创建 workspace agent

要使用此选项，你需要一个可访问 [workspace agents](https://chatgpt.com/agents) 且拥有创建 agent 权限的 ChatGPT Business、Enterprise 或 Edu workspace。

在 ChatGPT 中，[创建 workspace agent](https://chatgpt.com/agents/studio/new)。将导出的代码与以下提示词一起粘贴到聊天中：

```text
Please help me convert this workflow into an agent:

<paste your exported code here>
```

继续之前，请审查 builder 标识为需要更改的所有行为。

## 审查并测试 agent

某些工作流行为可能需要手动重新创建。测试迁移后的 agent 时，请审查控制流、触发器、工具和权限。

创建 agent 之前：

1. 审查生成的 instructions 和已配置的 capabilities。
1. 配置所需的应用、工具、skills、身份验证和连接权限。
1. 选择 **Preview**，并使用原始工作流中的代表性输入进行测试。
1. 将预览中的行为与原始工作流的预期行为进行比较。
1. 仅在验证迁移后的 agent 后，才选择 **Create**。

请遵循你为工作流采用的相同安全实践，尤其是在 agent 能够访问私有数据或通过已连接工具执行操作时。

## 限制

- 如果工作流的核心高度依赖确定性，迁移到 workspace agent 后可能无法忠实复现。
- 已连接应用、身份验证、发布和权限配置需要在 ChatGPT 中单独审查。
- Agents SDK 实现要求你验证应用的运行时配置、工具、身份验证、权限和部署。

## 相关资源

- [Agent Builder](/mirror/api/docs/guides/agent-builder)
- [Safety in building agents](/mirror/api/docs/guides/agent-builder-safety)
- [Agents SDK overview](/mirror/api/docs/guides/agents)
- [Agents SDK quickstart](/mirror/api/docs/guides/agents/quickstart)
- [在 ChatGPT 中构建 workspace agents，用于可重复工作](https://developers.openai.com/cookbook/articles/chatgpt-agents-sales-meeting-prep)

:::

## English source

::: details 展开英文原文
::: v-pre
Use this guide to export an existing Agent Builder workflow as Agents SDK code.
You can use the export to recreate the workflow as a ChatGPT Workspace Agent or
continue with the Agents SDK in your application.

This process does not convert your workflow graph or guarantee that every
behavior transfers unchanged.

## Choose a migration path

- **Agents SDK**: Best for building agents through code.
- **ChatGPT Workspace Agents**: Best for building agents through natural
  language and sharing them with teams.

## Before you migrate

You need access to the workflow in
[Agent Builder](/mirror/api/docs/guides/agent-builder).

## Export your workflow

1. Open your workflow in Agent Builder.
1. Select **Code** in the top navigation.
1. Select **Agents SDK** in the code dialog.
1. Select **TypeScript** or **Python**, then copy the complete export.

![Agent Builder Code dialog with Agents SDK selected](/openai-assets/developers.openai.com/images/platform/guides/agent-builder/agents-sdk-export.png)

## Option 1: Continue with the Agents SDK

Use this option when you want to run the exported workflow in an application
you build and deploy.

Copy the TypeScript or Python export into your application, install and
configure the matching Agents SDK, and test the workflow in your runtime. For
guidance on configuring and running the export, see the
[Agents SDK overview](/mirror/api/docs/guides/agents) and
[quickstart](/mirror/api/docs/guides/agents/quickstart).
Validate your application's configuration and behavior before deploying it.

## Option 2: Create a workspace agent from the export

To use this option, you need a ChatGPT Business, Enterprise, or Edu workspace
with access to [workspace agents](https://chatgpt.com/agents) and permission to
create agents.

In ChatGPT, [create a workspace agent](https://chatgpt.com/agents/studio/new).
Paste your exported code into the chat with this prompt:

```text
Please help me convert this workflow into an agent:

<paste your exported code here>
```

Review any behavior that the builder identifies as requiring changes before you
continue.

## Review and test the agent

Some workflow behavior may need manual recreation. Review control flow,
triggers, tools, and permissions as you test the migrated agent.

Before creating the agent:

1. Review the generated instructions and configured capabilities.
1. Configure any required apps, tools, skills, authentication, and connection
   permissions.
1. Select **Preview** and test representative inputs from the original
   workflow.
1. Compare the previewed behavior with the original workflow's expected
   behavior.
1. Select **Create** only after you have validated the migrated agent.

Follow the same safety practices you used for your workflow, especially when
the agent can access private data or take actions through connected tools.

## Limitations

- Workflows with strong determinism at their core may not migrate faithfully to
  a workspace agent.
- Connected apps, authentication, publishing, and permission configuration
  require separate review in ChatGPT.
- An Agents SDK implementation requires you to validate your application's
  runtime configuration, tools, authentication, permissions, and deployment.

## Related resources

- [Agent Builder](/mirror/api/docs/guides/agent-builder)
- [Safety in building agents](/mirror/api/docs/guides/agent-builder-safety)
- [Agents SDK overview](/mirror/api/docs/guides/agents)
- [Agents SDK quickstart](/mirror/api/docs/guides/agents/quickstart)
- [Build workspace agents in ChatGPT for repeatable work](https://developers.openai.com/cookbook/articles/chatgpt-agents-sales-meeting-prep)

:::
:::

