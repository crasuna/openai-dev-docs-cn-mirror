---
title: "Agent Builder 智能体构建器"
description: "Use the OpenAI Agent Builder to start from templates, compose nodes, preview runs, and export workflows to code."
outline: deep
---

# Agent Builder 智能体构建器

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agent-builder](https://developers.openai.com/api/docs/guides/agent-builder)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agent-builder.md](https://developers.openai.com/api/docs/guides/agent-builder.md)
- 抓取时间：2026-06-27T05:53:57.509Z
- Checksum：`1f2cd204185648f37d1ed8019319bd8a0f8fb063199a3d7ad84b18803642f590`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
**Agent Builder** 是用于构建多步骤 agent 工作流的可视化画布。

你可以从模板开始，为工作流中的每个步骤拖放节点，提供带类型的输入和输出，并使用实时数据预览运行。当你准备好部署时，可以通过 ChatKit 将工作流嵌入你的网站，或下载 SDK 代码自行运行。

OpenAI 正在弃用 Agent Builder。现有用户可在过渡窗口期间继续使用它，
  该产品计划于 2026 年 11 月 30 日关闭。ChatKit 仍将可用。请查看[弃用 页面](/mirror/api/docs/deprecations#2026-06-03-agent-builder)了解当前
  时间线。

使用本指南了解构建 agent 的流程和组成部分。

## Agent 和工作流

要构建有用的 agent，你需要为它们创建工作流。**工作流** 是 agent、工具和控制流逻辑的组合。工作流封装了处理任务或驱动聊天所涉及的所有步骤和操作，并包含可在准备就绪时部署的可运行代码。



打开 Agent Builder





构建用于处理任务的 agent 主要有三个步骤：

1. 在 [Agent Builder](https://platform.openai.com/agent-builder) 中设计工作流。这会定义你的 agent 以及它们的工作方式。
1. 发布你的工作流。它是一个带有 ID 和版本控制的对象。
1. 部署你的工作流。将 ID 传入你的 [ChatKit](/mirror/api/docs/guides/chatkit) 集成，或下载 Agents SDK 代码来自行部署工作流。

## 使用节点组合

在 Agent Builder 中，插入并连接节点来创建工作流。节点之间的每个连接都会变成一条带类型的边。点击一个节点来配置其输入和输出，观察步骤之间的数据契约，并确保下游节点收到它们所期望的属性。

### 示例和模板

Agent Builder 提供常见工作流模式的模板。你可以从模板开始，了解节点如何协同工作，也可以从零开始。

下面是一个作业助手工作流。它使用 agent 接收问题、重写问题以获得更好的答案、将问题路由给其他专门的 agent，并返回答案。

![prompts chat](https://cdn.openai.com/API/docs/images/homework-helper2.png)

### 可用节点

节点是 agent 的构建块。要查看所有可用节点及其配置选项，请参阅[节点参考文档](/mirror/api/docs/guides/node-reference)。

### 预览和调试

在构建过程中，你可以使用 **Preview** 功能测试工作流。在这里，你可以交互式运行工作流、附加示例文件，并观察每个节点的执行情况。

### 安全和风险

构建 agent 工作流伴随着风险，例如 prompt injection 和数据泄露。请参阅[构建 agent 时的安全性](/mirror/api/docs/guides/agent-builder-safety)，了解并帮助降低 agent 工作流的风险。

### 评估你的工作流

在 Agent Builder 内运行 [trace graders](/mirror/api/docs/guides/trace-grading)。在顶部导航中点击 **Evaluate**。在这里，你可以选择一条 trace（或一组 trace），并运行自定义 grader 来评估整体工作流性能。

## 发布你的工作流

Agent Builder 会在你工作时自动保存。当你对工作流满意后，将其发布以创建一个新的主版本，作为快照。随后你可以在 [ChatKit](/mirror/api/docs/guides/chatkit) 中使用你的工作流；ChatKit 是用于嵌入聊天体验的 OpenAI 框架。

你可以创建新版本，也可以在 API 调用中指定旧版本。

## 在你的产品中部署

当你准备实现自己创建的 agent 工作流时，在顶部导航中点击 **Code**。你有两个选项，可用于在生产环境中实现工作流：

**ChatKit**：按照 [ChatKit 快速开始](/mirror/api/docs/guides/chatkit)，传入你的工作流 ID，将此工作流嵌入你的应用。如果你不确定，我们推荐这个选项。

**高级集成**：复制工作流代码并在任何地方使用。你可以在自己的基础设施上运行 ChatKit，并使用 Agents SDK 构建和自定义 agent 聊天体验。

## 后续步骤

现在你已经创建了一个 agent 工作流，请用 ChatKit 将它带入你的产品。

- [ChatKit 快速开始](/mirror/api/docs/guides/chatkit) →
- [高级集成](/mirror/api/docs/guides/custom-chatkit) →

:::

## English source

::: details 展开英文原文
::: v-pre
**Agent Builder** is a visual canvas for building multi-step agent workflows.

You can start from templates, drag and drop nodes for each step in your workflow, provide typed inputs and outputs, and preview runs using live data. When you're ready to deploy, embed the workflow into your site with ChatKit, or download the SDK code to run it yourself.

OpenAI is deprecating Agent Builder. Existing users can continue using it
  during the transition window, and the product is scheduled to shut down on
  November 30, 2026. ChatKit remains available. See the [deprecations page](/mirror/api/docs/deprecations#2026-06-03-agent-builder) for the current
  timeline.

Use this guide to learn the process and parts of building agents.

## Agents and workflows

To build useful agents, you create workflows for them. A **workflow** is a combination of agents, tools, and control-flow logic. A workflow encapsulates all steps and actions involved in handling your tasks or powering your chats, with working code you can deploy when you're ready.



Open Agent Builder





There are three main steps in building agents to handle tasks:

1. Design a workflow in [Agent Builder](https://platform.openai.com/agent-builder). This defines your agents and how they'll work.
1. Publish your workflow. It's an object with an ID and versioning.
1. Deploy your workflow. Pass the ID into your [ChatKit](/mirror/api/docs/guides/chatkit) integration, or download the Agents SDK code to deploy your workflow yourself.

## Compose with nodes

In Agent Builder, insert and connect nodes to create your workflow. Each connection between nodes becomes a typed edge. Click a node to configure its inputs and outputs, observe the data contract between steps, and ensure downstream nodes receive the properties they expect.

### Examples and templates

Agent Builder provides templates for common workflow patterns. Start with a template to see how nodes work together, or start from scratch.

Here's a homework helper workflow. It uses agents to take questions, reframe them for better answers, route them to other specialized agents, and return an answer.

![prompts chat](https://cdn.openai.com/API/docs/images/homework-helper2.png)

### Available nodes

Nodes are the building blocks for agents. To see all available nodes and their configuration options, see the [node reference documentation](/mirror/api/docs/guides/node-reference).

### Preview and debug

As you build, you can test your workflow by using the **Preview** feature. Here, you can interactively run your workflow, attach sample files, and observe the execution of each node.

### Safety and risks

Building agent workflows comes with risks, like prompt injection and data leakage. See [safety in building agents](/mirror/api/docs/guides/agent-builder-safety) to learn about and help mitigate the risks of agent workflows.

### Evaluate your workflow

Run [trace graders](/mirror/api/docs/guides/trace-grading) inside of Agent Builder. In the top navigation, click **Evaluate**. Here, you can select a trace (or set of traces) and run custom graders to assess overall workflow performance.

## Publish your workflow

Agent Builder autosaves your work as you go. When you're happy with your workflow, publish it to create a new major version that acts as a snapshot. You can then use your workflow in [ChatKit](/mirror/api/docs/guides/chatkit), an OpenAI framework for embedding chat experiences.

You can create new versions or specify an older version in your API calls.

## Deploy in your product

When you're ready to implement the agent workflow you created, click **Code** in the top navigation. You have two options for implementing your workflow in production:

**ChatKit**: Follow the [ChatKit quickstart](/mirror/api/docs/guides/chatkit) and pass in your workflow ID to embed this workflow into your application. If you're not sure, we recommend this option.

**Advanced integration**: Copy the workflow code and use it anywhere. You can run ChatKit on your own infrastructure and use the Agents SDK to build and customize agent chat experiences.

## Next steps

Now that you've created an agent workflow, bring it into your product with ChatKit.

- [ChatKit quickstart](/mirror/api/docs/guides/chatkit) →
- [Advanced integration](/mirror/api/docs/guides/custom-chatkit) →

:::
:::

