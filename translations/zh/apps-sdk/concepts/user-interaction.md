---
status: needs-review
sourceId: "ad30a599473b"
sourceChecksum: "ad30a599473bfd6e54afbd2c517bb20c1662be857504446f702900df4c53935f"
sourceUrl: "https://developers.openai.com/apps-sdk/concepts/user-interaction"
translatedAt: "2026-06-27T19:35:17.0701114+08:00"
translator: codex-gpt-5.5-xhigh
---

# 用户交互

## Discovery

Discovery 指用户或模型发现你的应用及其提供工具的不同方式：自然语言提示、目录浏览，以及主动 [entry points](#entry-points)。Apps SDK 会依托你的工具 metadata 和过去使用情况做出智能选择。良好的 discovery 卫生意味着你的应用会在应该出现时出现，在不该出现时保持安静。

对于当前的公开分发，OpenAI 会把获批的应用转换为 Codex plugins。就目前而言，Codex 是唯一具有 plugins 的产品界面。面向用户的体验仍从你使用 Apps SDK 构建的应用开始，而生成的 plugin 则是用户在 Codex 中安装的内容。

### 点名提及

当用户在提示开头提到你的应用名称时，你的应用会自动出现在响应中。用户必须在提示开头指定你的应用名称。如果没有这样做，你的应用也可以通过对话内 discovery 作为建议出现。

### 对话内 discovery

当用户发送提示时，模型会评估：

- **Conversation context** - 聊天历史，包括之前的工具结果、memories 和显式工具偏好
- **Conversation brand mentions and citations** - 你的品牌是否在查询中被明确请求，或是否在搜索结果中作为来源/引用出现。
- **Tool metadata** - 你在 MCP server 中提供的名称、描述和参数文档。
- **User linking state** - 用户是否已经授予你的应用访问权限，或是否需要先连接才能运行工具。

你可以通过以下方式影响对话内 discovery：

1. 编写面向动作的 [tool descriptions](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool)（例如“当用户想查看自己的 kanban board 时使用此工具”），而不是泛泛的宣传文案。
2. 在 resource UI template metadata 上编写清晰的 [component descriptions](https://developers.openai.com/apps-sdk/reference#add-component-descriptions)。
3. 定期在 ChatGPT developer mode 中测试你的 golden prompt set，并记录 precision/recall。

如果 assistant 选择了你的工具，它会处理参数、在需要时显示确认，并内联渲染组件。如果没有已连接的工具明显匹配，模型会默认使用内置能力，因此要持续评估和改进你的 metadata。

### Directory

Directory 是一个共享目录，包含用户可在 Codex 中浏览的公开可用 plugins。它为用户提供了一个位置来发现由获批应用生成的 plugins。你在此目录中的 listing 将包括：

- 应用名称和图标
- 简短描述和长描述
- 标签或类别（在支持时）
- 可选的 onboarding instructions 或 screenshots

## Entry points

用户连接你的应用后，ChatGPT 可以通过几个 entry points 展示它。理解每个 surface 有助于你设计出原生且易发现的流程。

### 对话内入口

已连接的工具会始终存在于模型上下文中。当用户编写提示时，assistant 会根据对话状态和你提供的 metadata 决定是否调用你的工具。最佳实践：

- 让工具描述保持面向动作，帮助模型区分类似应用。
- 返回引用稳定 ID 的结构化内容，这样后续提示可以变更或总结之前的结果。
- 提供 `_meta` [hints](https://developers.openai.com/apps-sdk/reference#tool-descriptor-parameters)，让 client 可以简化确认和渲染。

调用成功后，组件会内联渲染，并继承当前主题、composer 和确认设置。

### Launcher

Launcher（可从 composer 中的 + 按钮打开）是一个高意图入口，用户可以在其中明确选择应用。你的 listing 应包含简洁的标签和图标。请考虑：

- **Deep linking** - 包含 starter prompts 或入口参数，让用户直接进入最有用的工具。
- **Context awareness** - launcher 会把当前对话作为信号来给应用排序，因此要让 metadata 与你支持的场景保持一致。
