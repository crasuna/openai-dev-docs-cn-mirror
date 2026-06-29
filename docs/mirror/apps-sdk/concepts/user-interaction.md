---
title: "用户交互"
description: "How users find, engage with, activate, and manage app experiences in ChatGPT."
outline: deep
---

# 用户交互

**文档集**：Apps SDK\
**分组**：概念\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/concepts/user-interaction](https://developers.openai.com/apps-sdk/concepts/user-interaction)
- Markdown 来源：[https://developers.openai.com/apps-sdk/concepts/user-interaction.md](https://developers.openai.com/apps-sdk/concepts/user-interaction.md)
- 抓取时间：2026-06-27T05:54:46.016Z
- Checksum：`ad30a599473bfd6e54afbd2c517bb20c1662be857504446f702900df4c53935f`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 发现

发现指用户或模型发现你的应用及其提供工具的不同方式：自然语言提示、目录浏览，以及主动 [入口点](/mirror/apps-sdk/concepts/user-interaction#entry-points)。Apps SDK 会依托你的工具 metadata 和过去使用情况做出智能选择。良好的发现卫生意味着你的应用会在应该出现时出现，在不该出现时保持安静。

对于当前的公开分发，OpenAI 会把获批的应用转换为 Codex plugins。就目前而言，Codex 是唯一具有 plugins 的产品界面。面向用户的体验仍从你使用 Apps SDK 构建的应用开始，而生成的 plugin 则是用户在 Codex 中安装的内容。

### 点名提及

当用户在提示开头提到你的应用名称时，你的应用会自动出现在响应中。用户必须在提示开头指定你的应用名称。如果没有这样做，你的应用也可以通过对话内 discovery 作为建议出现。

### 对话内发现

当用户发送提示时，模型会评估：

- **Conversation context** - 聊天历史，包括之前的工具结果、memories 和显式工具偏好
- **Conversation brand mentions and citations** - 你的品牌是否在查询中被明确请求，或是否在搜索结果中作为来源/引用出现。
- **Tool metadata** - 你在 MCP server 中提供的名称、描述和参数文档。
- **User linking state** - 用户是否已经授予你的应用访问权限，或是否需要先连接才能运行工具。

你可以通过以下方式影响对话内 discovery：

1. 编写面向动作的 [tool descriptions](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool)（例如“当用户想查看自己的 kanban board 时使用此工具”），而不是泛泛的宣传文案。
2. 在 resource UI template metadata 上编写清晰的 [component descriptions](/mirror/apps-sdk/reference#add-component-descriptions)。
3. 定期在 ChatGPT developer mode 中测试你的 golden prompt set，并记录 precision/recall。

如果 assistant 选择了你的工具，它会处理参数、在需要时显示确认，并内联渲染组件。如果没有已连接的工具明显匹配，模型会默认使用内置能力，因此要持续评估和改进你的 metadata。

### 目录

Directory 是一个共享目录，包含用户可在 Codex 中浏览的公开可用 plugins。它为用户提供了一个位置来发现由获批应用生成的 plugins。你在此目录中的 listing 将包括：

- 应用名称和图标
- 简短描述和长描述
- 标签或类别（在支持时）
- 可选的 onboarding instructions 或 screenshots

## 入口点

用户连接你的应用后，ChatGPT 可以通过几个 entry points 展示它。理解每个 surface 有助于你设计出原生且易发现的流程。

### 对话内入口

已连接的工具会始终存在于模型上下文中。当用户编写提示时，assistant 会根据对话状态和你提供的 metadata 决定是否调用你的工具。最佳实践：

- 让工具描述保持面向动作，帮助模型区分类似应用。
- 返回引用稳定 ID 的结构化内容，这样后续提示可以变更或总结之前的结果。
- 提供 `_meta` [hints](/mirror/apps-sdk/reference#tool-descriptor-parameters)，让 client 可以简化确认和渲染。

调用成功后，组件会内联渲染，并继承当前主题、composer 和确认设置。

### Launcher

Launcher（可从 composer 中的 + 按钮打开）是一个高意图入口，用户可以在其中明确选择应用。你的 listing 应包含简洁的标签和图标。请考虑：

- **Deep linking** - 包含 starter prompts 或入口参数，让用户直接进入最有用的工具。
- **Context awareness** - launcher 会把当前对话作为信号来给应用排序，因此要让 metadata 与你支持的场景保持一致。

:::

## English source

::: details 展开英文原文
::: v-pre
## Discovery

Discovery refers to the different ways a user or the model can find out about your app and the tools it provides: natural-language prompts, directory browsing, and proactive [entry points](/mirror/apps-sdk/concepts/user-interaction#entry-points). Apps SDK leans on your tool metadata and past usage to make intelligent choices. Good discovery hygiene means your app appears when it should and stays quiet when it should not.

For public distribution today, OpenAI turns approved apps into plugins for Codex. For now, Codex is the only product surface with plugins. The user-facing experience still starts from the app you build with Apps SDK, and the resulting plugin is what users install in Codex.

### Named mention

When a user mentions the name of your app at the beginning of a prompt, your app will be surfaced automatically in the response. The user must specify your app name at the beginning of their prompt. If they do not, your app can also appear as a suggestion through in-conversation discovery.

### In-conversation discovery

When a user sends a prompt, the model evaluates:

- **Conversation context** – the chat history, including previous tool results, memories, and explicit tool preferences
- **Conversation brand mentions and citations** - whether your brand is explicitly requested in the query or is surfaced as a source/citation in search results.
- **Tool metadata** – the names, descriptions, and parameter documentation you provide in your MCP server.
- **User linking state** – whether the user already granted access to your app, or needs to connect it before the tool can run.

You influence in-conversation discovery by:

1. Writing action-oriented [tool descriptions](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool) (“Use this when the user wants to view their kanban board”) rather than generic copy.
2. Writing clear [component descriptions](/mirror/apps-sdk/reference#add-component-descriptions) on the resource UI template metadata.
3. Regularly testing your golden prompt set in ChatGPT developer mode and logging precision/recall.

If the assistant selects your tool, it handles arguments, displays confirmation if needed, and renders the component inline. If no linked tool is an obvious match, the model will default to built-in capabilities, so keep evaluating and improving your metadata.

### Directory

The directory is a shared catalog of publicly available plugins that users can
browse in Codex. It gives users a place to find plugins produced from approved
apps. Your listing in this directory will include:

- App name and icon
- Short and long descriptions
- Tags or categories (where supported)
- Optional onboarding instructions or screenshots

## Entry points

Once a user links your app, ChatGPT can surface it through several entry points. Understanding each surface helps you design flows that feel native and discoverable.

### In-conversation entry

Linked tools are always on in the model’s context. When the user writes a prompt, the assistant decides whether to call your tool based on the conversation state and metadata you supplied. Best practices:

- Keep tool descriptions action oriented so the model can disambiguate similar apps.
- Return structured content that references stable IDs so follow-up prompts can mutate or summarise prior results.
- Provide `_meta` [hints](/mirror/apps-sdk/reference#tool-descriptor-parameters) so the client can streamline confirmation and rendering.

When a call succeeds, the component renders inline and inherits the current theme, composer, and confirmation settings.

### Launcher

The launcher (available from the + button in the composer) is a high-intent entry point where users can explicitly choose an app. Your listing should include a succinct label and icon. Consider:

- **Deep linking** – include starter prompts or entry arguments so the user lands on the most useful tool immediately.
- **Context awareness** – the launcher ranks apps using the current conversation as a signal, so keep metadata aligned with the scenarios you support.

:::
:::

