---
title: "Node reference 节点参考"
description: "Explore all available nodes for composing workflows in Agent Builder."
outline: deep
---

# Node reference 节点参考

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/node-reference](https://developers.openai.com/api/docs/guides/node-reference)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/node-reference.md](https://developers.openai.com/api/docs/guides/node-reference.md)
- 抓取时间：2026-06-27T05:54:03.873Z
- Checksum：`2cc707cbecd72e0146a3b0068881f5eff2b58002e3ff112f74ec3d839e7615fa`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
[Agent Builder](https://platform.openai.com/agent-builder) 是一个用于组合 agentic workflows 的可视化画布。Workflows 由 nodes 和 connections 组成，用于控制顺序和流转。插入 nodes，然后配置并连接它们，以定义你希望 agents 遵循的流程。

OpenAI 正在弃用 Agent Builder。现有用户可以在过渡窗口期间继续使用它，该产品计划于 2026 年 11 月 30 日关闭。ChatKit 仍然可用。请查看 [deprecations page](/mirror/api/docs/deprecations#2026-06-03-agent-builder) 了解当前时间线。

浏览下面所有可用 nodes。要了解更多，请阅读 [Agent Builder guide](/mirror/api/docs/guides/agent-builder)。

### Core nodes

从基础构建块开始。所有 workflows 都有 start 和 agent nodes。

![core nodes](https://cdn.openai.com/API/docs/images/core-nodes2.png)

#### Start

定义 workflow 的 inputs。对于 chat workflow 中的 user input，start nodes 会做两件事：

- 将 user input 追加到 conversation history
- 暴露 `input_as_text` 来表示该 input 的文本内容

所有 chat start nodes 都将 `input_as_text` 作为 input variable。你也可以添加 state variables。

#### Agent

定义 instructions、tools 和 model configuration，或附加 evaluations。

请让每个 agent 的范围定义清晰。在我们的 homework helper 示例中，我们使用一个 agent 重写用户 query，使其更具体且更贴合知识库。另一个 agent 用于将 query 分类为 Q&A 或 fact-finding，另一个 agent 则负责处理每种类型的问题。

像使用任何其他 model prompt 一样添加 model behavior instructions 和 user messages。要传入上一步的 output，你可以将它作为 context 添加。

你可以根据需要拥有任意数量的 agent nodes。

#### Note

为你的 workflow 留下注释和说明。不同于其他 nodes，notes 不会在 flow 中_执行_任何操作。它们只是提供给你和团队的有用 commentary。

### Tool nodes

Tool nodes 让你为 agents 配备 tools 和 external services。你可以检索数据、监控滥用，并连接到 external services。

![tool nodes](https://cdn.openai.com/API/docs/images/tool-nodes2.png)

#### File search

从你在 OpenAI 平台创建的 vector stores 中检索数据。按 vector store ID 搜索，并为模型应搜索的内容添加 query。你可以使用 variables 将 workflow 中之前 nodes 的 output 包含进来。

请参阅 [file search documentation](/mirror/api/docs/guides/tools-file-search) 来设置 vector stores 并查看支持的文件类型。

要在 OpenAI 托管存储之外搜索，请改用 [MCP](/mirror/api/docs/guides/node-reference#mcp)。

#### Guardrails

为不需要的 inputs 设置 input monitors，例如 personally identifiable information (PII)、jailbreaks、hallucinations 和其他 misuse。

Guardrails 默认是 pass/fail，这意味着它们会测试上一个 node 的 output，而你定义接下来会发生什么。当出现 guardrails failure 时，我们建议结束 workflow，或回到上一步并提醒安全使用。

#### MCP

调用第三方 tools 和 services。连接 OpenAI connectors 或第三方 servers，或添加你自己的 server。MCP connections 对需要在其他应用（如 Gmail 或 Zapier）中读取或搜索数据的 workflow 很有帮助。

在 Agent Builder 中浏览选项。要了解关于 MCP 的更多信息，请参阅 [connectors and MCP documentation](/mirror/api/docs/guides/tools-connectors-mcp)。

### Logic nodes

![logic nodes](https://cdn.openai.com/API/docs/images/logic-nodes.png)

Logic nodes 让你编写自定义逻辑并定义 control flow，例如基于自定义条件循环，或在继续操作前请求用户批准。

#### If/else

添加条件逻辑。使用 [Common Expression Language](https://cel.dev/) (CEL) 创建自定义表达式。这对于定义如何处理已经被分入不同 classifications 的输入很有用。

例如，如果某个 agent 将输入分类为 Q&A，就将该 query 路由到 Q&A agent 以获得直接答案。如果它是开放式 query，则路由到查找相关事实的 agent。否则，结束 workflow。

#### While

基于自定义条件循环。使用 [Common Expression Language](https://cel.dev/) (CEL) 创建自定义表达式。这对于检查某个条件是否仍为 true 很有用。

#### Human approval

将批准权交给 end-users。适用于 agents 起草的工作在发出前可能需要人工审核的 workflows。

例如，想象一个代表你发送电子邮件的 agent workflow。你会包含一个输出 email widget 的 agent node，随后紧跟一个 human approval node。你可以配置 human approval node 询问：“Would you like me to send this email?”，如果获批，就继续到连接 Gmail 的 MCP node。

### Data nodes

Data nodes 让你在 workflow 中定义和操作数据。重塑 outputs，或定义可在整个 workflow 中使用的 global variables。

![data nodes](https://cdn.openai.com/API/docs/images/data-nodes.png)

#### Transform

重塑 outputs（例如 object → array）。适用于强制 types 遵循你的 schema，或重塑 outputs 以供 agents 作为 inputs 读取和理解。

#### Set state

定义可在整个 workflow 中使用的 global variables。适用于当 agent 接收 input 并输出一些你想在整个 workflow 中使用的新内容时。你可以将该 output 定义为新的 global variable。

:::

## English source

::: details 展开英文原文
::: v-pre
[Agent Builder](https://platform.openai.com/agent-builder) is a visual canvas for composing agentic workflows. Workflows are made up of nodes and connections that control the sequence and flow. Insert nodes, then configure and connect them to define the process you want your agents to follow.

OpenAI is deprecating Agent Builder. Existing users can continue using it
  during the transition window, and the product is scheduled to shut down on
  November 30, 2026. ChatKit remains available. See the [deprecations page](/mirror/api/docs/deprecations#2026-06-03-agent-builder) for the current
  timeline.

Explore all available nodes below. To learn more, read the [Agent Builder guide](/mirror/api/docs/guides/agent-builder).

### Core nodes

Get started with basic building blocks. All workflows have start and agent nodes.

![core nodes](https://cdn.openai.com/API/docs/images/core-nodes2.png)

#### Start

Define inputs to your workflow. For user input in a chat workflow, start nodes do two things:

- Append the user input to the conversation history
- Expose `input_as_text` to represent the text contents of this input

All chat start nodes have `input_as_text` as an input variable. You can add state variables too.

#### Agent

Define instructions, tools, and model configuration, or attach evaluations.

Keep each agent well defined in scope. In our homework helper example, we use one agent to rewrite the user's query for more specificity and relevance with the knowledge base. We use another agent to classify the query as either Q&A or fact-finding, and another agent to field each type of question.

Add model behavior instructions and user messages as you would with any other model prompt. To pipe output from a previous step, you can add it as context.

You can have as many agent nodes as you'd like.

#### Note

Leave comments and explanations about your workflow. Unlike other nodes, notes don't _do_ anything in the flow. They're just helpful commentary for you and your team.

### Tool nodes

Tool nodes let you equip your agents with tools and external services. You can retrieve data, monitor for misuse, and connect to external services.

![tool nodes](https://cdn.openai.com/API/docs/images/tool-nodes2.png)

#### File search

Retrieve data from vector stores you've created in the OpenAI platform. Search by vector store ID, and add a query for what the model should search for. You can use variables to include output from previous nodes in the workflow.

See the [file search documentation](/mirror/api/docs/guides/tools-file-search) to set up vector stores and see supported file types.

To search outside of your hosted storage with OpenAI, use [MCP](/mirror/api/docs/guides/node-reference#mcp) instead.

#### Guardrails

Set up input monitors for unwanted inputs such as personally identifiable information (PII), jailbreaks, hallucinations, and other misuse.

Guardrails are pass/fail by default, meaning they test the output from a previous node, and you define what happens next. When there's a guardrails failure, we recommend either ending the workflow or returning to the previous step with a reminder of safe use.

#### MCP

Call third-party tools and services. Connect with OpenAI connectors or third-party servers, or add your own server. MCP connections are helpful in a workflow that needs to read or search data in another application, like Gmail or Zapier.

Browse options in the Agent Builder. To learn more about MCP, see the [connectors and MCP documentation](/mirror/api/docs/guides/tools-connectors-mcp).

### Logic nodes

![logic nodes](https://cdn.openai.com/API/docs/images/logic-nodes.png)

Logic nodes let you write custom logic and define the control flow—for example, looping on custom conditions, or asking the user for approval before continuing an operation.

#### If/else

Add conditional logic. Use [Common Expression Language](https://cel.dev/) (CEL) to create a custom expression. Useful for defining what to do with input that's been sorted into classifications.

For example, if an agent classifies input as Q&A, route that query to the Q&A agent for a straightforward answer. If it's an open-ended query, route to an agent that finds relevant facts. Else, end the workflow.

#### While

Loop on custom conditions. Use [Common Expression Language](https://cel.dev/) (CEL) to create a custom expression. Useful for checking whether a condition is still true.

#### Human approval

Defer to end-users for approval. Useful for workflows where agents draft work that could use a human review before it goes out.

For example, picture an agent workflow that sends emails on your behalf. You'd include an agent node that outputs an email widget, then a human approval node immediately following. You can configure the human approval node to ask, "Would you like me to send this email?" and, if approved, proceeds to an MCP node that connects to Gmail.

### Data nodes

Data nodes let you define and manipulate data in your workflow. Reshape outputs or define global variables for use across your workflow.

![data nodes](https://cdn.openai.com/API/docs/images/data-nodes.png)

#### Transform

Reshape outputs (e.g., object → array). Useful for enforcing types to adhere to your schema or reshaping outputs for agents to read and understand as inputs.

#### Set state

Define global variables for use across the workflow. Useful for when an agent takes input and outputs something new that you'll want to use throughout the workflow. You can define that output as a new global variable.

:::
:::

