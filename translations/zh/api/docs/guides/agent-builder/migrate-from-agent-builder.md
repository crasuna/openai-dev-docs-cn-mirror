---
status: needs-review
sourceId: "3cdaef348daa"
sourceChecksum: "3cdaef348daa9191926687d1e33d1c7dc67de2badee1156f7df48a4494a544e1"
sourceUrl: "https://developers.openai.com/api/docs/guides/agent-builder/migrate-from-agent-builder"
translatedAt: "2026-06-27T18:00:55+08:00"
translator: codex-gpt-5.5-xhigh
---

# 从 Agent Builder 迁移

使用本指南将现有 Agent Builder 工作流导出为 Agents SDK 代码。你可以使用导出内容，将该工作流重新创建为 ChatGPT Workspace Agent，或在你的应用中继续使用 Agents SDK。

此过程不会转换你的工作流图，也不保证每一种行为都能原样迁移。

## 选择迁移路径

- **Agents SDK**：最适合通过代码构建 agent。
- **ChatGPT Workspace Agents**：最适合通过自然语言构建 agent，并与团队共享。

## 迁移前准备

你需要能够访问 [Agent Builder](https://developers.openai.com/api/docs/guides/agent-builder) 中的该工作流。

## 导出你的工作流

1. 在 Agent Builder 中打开你的工作流。
1. 在顶部导航中选择 **Code**。
1. 在代码对话框中选择 **Agents SDK**。
1. 选择 **TypeScript** 或 **Python**，然后复制完整导出内容。

![选中 Agents SDK 的 Agent Builder Code 对话框](https://developers.openai.com/images/platform/guides/agent-builder/agents-sdk-export.png)

## 选项 1：继续使用 Agents SDK

如果你想在自己构建和部署的应用中运行导出的工作流，请使用此选项。

将 TypeScript 或 Python 导出内容复制到你的应用中，安装并配置对应的 Agents SDK，然后在你的运行时中测试该工作流。有关配置和运行导出内容的指导，请参阅 [Agents SDK overview](https://developers.openai.com/api/docs/guides/agents) 和 [quickstart](https://developers.openai.com/api/docs/guides/agents/quickstart)。部署前，请验证你的应用配置和行为。

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

- [Agent Builder](https://developers.openai.com/api/docs/guides/agent-builder)
- [Safety in building agents](https://developers.openai.com/api/docs/guides/agent-builder-safety)
- [Agents SDK overview](https://developers.openai.com/api/docs/guides/agents)
- [Agents SDK quickstart](https://developers.openai.com/api/docs/guides/agents/quickstart)
- [在 ChatGPT 中构建 workspace agents，用于可重复工作](https://developers.openai.com/cookbook/articles/chatgpt-agents-sales-meeting-prep)
