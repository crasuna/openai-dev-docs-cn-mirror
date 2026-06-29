---
status: needs-review
sourceId: "2cc707cbecd7"
sourceChecksum: "2cc707cbecd72e0146a3b0068881f5eff2b58002e3ff112f74ec3d839e7615fa"
sourceUrl: "https://developers.openai.com/api/docs/guides/node-reference"
translatedAt: "2026-06-27T18:00:55+08:00"
translator: codex-gpt-5.5-xhigh
---

# Node reference 节点参考

[Agent Builder](https://platform.openai.com/agent-builder) 是一个用于组合 agentic workflows 的可视化画布。Workflows 由 nodes 和 connections 组成，用于控制顺序和流转。插入 nodes，然后配置并连接它们，以定义你希望 agents 遵循的流程。

OpenAI 正在弃用 Agent Builder。现有用户可以在过渡窗口期间继续使用它，该产品计划于 2026 年 11 月 30 日关闭。ChatKit 仍然可用。请查看 [deprecations page](https://developers.openai.com/api/docs/deprecations#2026-06-03-agent-builder) 了解当前时间线。

浏览下面所有可用 nodes。要了解更多，请阅读 [Agent Builder guide](https://developers.openai.com/api/docs/guides/agent-builder)。

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

请参阅 [file search documentation](https://developers.openai.com/api/docs/guides/tools-file-search) 来设置 vector stores 并查看支持的文件类型。

要在 OpenAI 托管存储之外搜索，请改用 [MCP](#mcp)。

#### Guardrails

为不需要的 inputs 设置 input monitors，例如 personally identifiable information (PII)、jailbreaks、hallucinations 和其他 misuse。

Guardrails 默认是 pass/fail，这意味着它们会测试上一个 node 的 output，而你定义接下来会发生什么。当出现 guardrails failure 时，我们建议结束 workflow，或回到上一步并提醒安全使用。

#### MCP

调用第三方 tools 和 services。连接 OpenAI connectors 或第三方 servers，或添加你自己的 server。MCP connections 对需要在其他应用（如 Gmail 或 Zapier）中读取或搜索数据的 workflow 很有帮助。

在 Agent Builder 中浏览选项。要了解关于 MCP 的更多信息，请参阅 [connectors and MCP documentation](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)。

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
