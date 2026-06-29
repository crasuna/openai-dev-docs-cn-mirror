---
status: needs-review
sourceId: "aff8c15d30a5"
sourceChecksum: "aff8c15d30a56ab8c72b153279abfbb34fe6ded7899d418aa90ee2927e040133"
sourceUrl: "https://developers.openai.com/apps-sdk/deploy/connect-chatgpt"
translatedAt: "2026-06-27T19:35:17.0701114+08:00"
translator: codex-gpt-5.5-xhigh
---

# 从 ChatGPT 连接

## 开始之前

你可以使用 [developer mode](https://platform.openai.com/docs/guides/developer-mode)，用自己的账号在 ChatGPT 中测试你的应用。

现在可以通过提交流程将应用发布为公开访问。你可以在我们的 [ChatGPT app submission guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines) 中了解更多。

若要开启 developer mode，请前往 **Settings → Apps & Connectors → Advanced settings（页面底部）**。

在那里，如果你的组织允许，你可以切换 developer mode。

developer mode 启用后，你会在 **Settings → Apps & Connectors** 下看到 **Create** 按钮。

截至 2025 年 11 月 13 日，ChatGPT Apps 在所有计划中均受支持，包括 Business、Enterprise 和 Education 计划。

## 创建 connector

启用 developer mode 后，你可以在 ChatGPT 中为应用创建 connector。

1. 确保你的 MCP server 可通过 HTTPS 访问（本地开发时，使用 [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) 并在 connector settings 中选择 **Tunnel**，或者你可以通过 [ngrok](https://ngrok.com/) 或 [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) 等工具把本地 server 暴露到公共互联网）。
2. 在 ChatGPT 中，前往 **Settings → Connectors → Create**。
3. 提供 connector 的 metadata：
   - **Connector name** - 面向用户的标题，例如 _Kanban board_。
   - **Description** - 说明 connector 做什么，以及何时使用它。模型会在 discovery 期间使用这段文本。
   - **Connector URL** - 你的 server 的公共 `/mcp` endpoint（例如 `https://abc123.ngrok.app/mcp`）。
4. 点击 **Create**。如果连接成功，你会看到 server 公告的工具列表。如果失败，请参阅 [Testing](https://developers.openai.com/apps-sdk/deploy/testing) 指南，使用 MCP Inspector 或 API Playground 调试你的应用。

## 试用应用

connector 创建完成后，你可以在新的 ChatGPT 对话中试用它。

1. 在 ChatGPT 中打开一个新聊天。
2. 点击消息 composer 附近的 **+** 按钮，然后点击 **More**。
3. 在可用工具列表中选择你的应用 connector。这会把你的应用加入对话上下文，供模型使用。
4. 用与你应用相关的说法提示模型调用工具。例如，对于 Kanban board app，可以说 “What are my available tasks?”。

ChatGPT 会使用每个应用的 tool annotations 和用户的应用权限设置来决定何时请求确认。用户可以选择以下三个权限级别之一：

- **Always ask**：在检索信息或进行更改前询问。
- **Ask before making changes**：自动检索信息，但在进行更改前询问。
- **Ask only before important changes**（默认）：自动检索信息并进行常规更改，但在发送、删除、发布或购买等重大更改前询问。

对于个人账号，用户可以设置全局权限级别，也可以在 **Settings > Apps** 中针对单个应用覆盖设置。符合条件的确认提示还会提供 **Always allow**，用于记住用户对该应用的权限。

对于 Business 和 Enterprise workspaces，管理员控制 workspace default 和 per-app overrides。成员不会看到 **Always allow**。管理员可以在 **Workspace settings > Permissions & roles > Connected data** 中更新 workspace default，也可以从 **Admin Apps > App permissions** 配置单个应用。

这些设置适用于 ChatGPT 中的 connected apps。在 Codex 中认证的应用使用单独的权限控制。

## 刷新 metadata

每当你更改工具列表或描述时，都可以在 ChatGPT 中刷新 MCP server 的 metadata。

1. 更新你的 MCP server 并重新部署它（除非你使用的是本地 server）。
2. 在 **Settings → Connectors** 中，点击进入你的 connector 并选择 **Refresh**。
3. 验证工具列表已更新，并尝试几个提示来测试更新后的流程。

此刷新流程适用于 developer mode connectors。已发布的应用使用经过审核的 [app version snapshots](https://developers.openai.com/apps-sdk/deploy/submission#how-published-app-versions-work)。若要更新已发布应用的工具或 metadata，请扫描、提交并发布新的应用版本。

## 使用其他 client

你可以在其他 clients 上连接到你的 MCP server。

- **API Playground** - 访问 [platform playground](https://platform.openai.com/chat)，并把你的 MCP server 添加到对话中：打开 **Tools → Add → MCP Server**，然后粘贴同一个 HTTPS endpoint。当你想查看原始 request/response logs 时，这很有用。
- **Mobile clients** - connector 在 ChatGPT Web 上连接后，也会在 ChatGPT 移动应用中可用。如果你的组件有自定义控件，请尽早测试移动端布局。

connector 连接后，你就可以继续进行验证、实验和最终 rollout。
