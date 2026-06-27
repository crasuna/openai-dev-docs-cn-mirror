---
status: needs-review
sourceId: "8b58a44018a0"
sourceChecksum: "8b58a44018a0fd7532ba7aad587f510ccb576eb75015f1df16f3dd93da09dd04"
sourceUrl: "https://developers.openai.com/apps-sdk/concepts/mcp-server"
translatedAt: "2026-06-27T19:35:17.0701114+08:00"
translator: codex-gpt-5.5-xhigh
---

# MCP

## 什么是 MCP？

[Model Context Protocol](https://modelcontextprotocol.io/)（MCP）是一项开放规范，用于把大语言模型客户端连接到外部工具和资源。MCP server 会公开模型可在对话中调用的 **tools**，并根据指定参数返回结果。
还可以随工具结果一起返回其他资源（metadata），包括我们可在 Apps SDK 中用于渲染界面的内联 html。

在 Apps SDK 中，MCP 是让 server、model 和 UI 保持同步的主干。通过标准化 wire format、认证和 metadata，它让 ChatGPT 能像理解内置工具一样理解你的应用。

## 协议构建块

一个用于 Apps SDK 的最小 MCP server 会实现三项能力：

1. **List tools** - 你的 server 公告它支持的工具，包括这些工具的 JSON Schema 输入和输出契约，以及可选 annotations。
2. **Call tools** - 当模型选择使用某个工具时，它会发送带有参数的 `call_tool` 请求，这些参数对应用户意图。你的 server 执行动作，并返回模型可解析的结构化内容。
3. **Return components** - 除了工具返回的结构化内容，每个工具还可以在自己的 metadata 中可选地指向一个代表要在 ChatGPT client 中渲染的界面的 [embedded resource](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#embedded-resources)。

server 还可以在 MCP 初始化期间返回可选的 [`instructions`](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#initialization)。ChatGPT 和 Codex 会把这些 instructions 作为 server 范围的指导，用于跨工具工作流、约束、速率限制，以及其他不适合放在单个工具描述中的上下文。

协议与传输无关，你可以通过 Server-Sent Events 或 Streamable HTTP 托管 server。Apps SDK 同时支持这两种选项，但我们推荐 Streamable HTTP。

## 为什么 Apps SDK 以 MCP 为标准

通过 MCP 工作会直接带来几项好处：

- **Discovery integration** - 模型会像处理第一方 connectors 一样读取你的工具 metadata 和 surface 描述，从而支持自然语言发现和 launcher 排名。详情参见 [Discovery](https://developers.openai.com/apps-sdk/concepts/user-interaction)。
- **Server-wide guidance** - 可选的 server instructions 为模型提供跨工具上下文，这是单个工具描述本身无法覆盖的。
- **Conversation awareness** - 结构化内容和组件状态会流经对话。模型可以检查 JSON 结果、在后续轮次引用 ID，或稍后再次渲染组件。
- **Multiclient support** - MCP 是自描述的，因此你的 connector 可以在 ChatGPT Web 和移动端运行，无需自定义客户端代码。
- **Extensible auth** - 该规范包含 protected resource metadata、OAuth 2.1 flows、使用 public-client 或 `private_key_jwt` token exchange 的 Client ID Metadata Documents，以及 DCR，让你无需发明专有握手就能控制访问。

## 后续步骤

如果你刚接触 MCP，我们建议先从以下资源开始：

- [Model Context Protocol specification](https://modelcontextprotocol.io/specification)
- 官方 SDK：[Python SDK（官方；包含 FastMCP 模块）](https://github.com/modelcontextprotocol/python-sdk) 和 [TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)
- 用于本地调试的 [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)

熟悉 MCP primitives 后，你可以继续阅读 [Set up your server](https://developers.openai.com/apps-sdk/build/mcp-server) 指南，了解实现细节。
