---
title: "Troubleshooting"
description: "Troubleshoot issues in Apps SDK apps."
outline: deep
---

# Troubleshooting

**文档集**：Apps SDK  
**分组**：Apps SDK — Deploy  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/deploy/troubleshooting](https://developers.openai.com/apps-sdk/deploy/troubleshooting)
- Markdown 来源：[https://developers.openai.com/apps-sdk/deploy/troubleshooting.md](https://developers.openai.com/apps-sdk/deploy/troubleshooting.md)
- 抓取时间：2026-06-27T05:54:47.396Z
- Checksum：`109d1ddba3cc7b1713801d2ba2c5fc47e15b155491ed55f1e4c39cb3e736d650`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 如何分诊问题

当出现问题时，例如组件无法渲染、发现流程缺少提示、认证循环等，请先隔离负责的层级：server、component，还是 ChatGPT client。下面的清单覆盖最常见的问题以及解决方式。

## Server-side 问题

- **没有列出工具** - 确认你的服务器正在运行，并且你连接的是 `/mcp` endpoint。如果你更改了端口，请更新 connector URL 并重启 MCP Inspector。
- **只有 structured content，没有 component** - 确认 tool descriptor 将 `_meta.ui.resourceUri` 设置为已注册的 HTML resource，且其 `mimeType: "text/html;profile=mcp-app"`（ChatGPT 会将 `_meta["openai/outputTemplate"]` 作为可选的兼容别名处理），并确认该 resource 加载时没有 CSP 错误。
- **Schema mismatch errors** - 确保你的 Pydantic 或 TypeScript 模型与 `outputSchema` 中声明的 schema 匹配。更改后请重新生成类型。
- **响应缓慢** - 当工具调用超过几百毫秒时，组件会显得迟钝。请分析 backend 调用耗时，并在可能时缓存结果。

## Widget 问题

- **Widget 加载失败** - 打开浏览器 console（或 MCP Inspector 日志）查看 CSP 违规或缺失 bundle。确保 HTML 内联了编译后的 JS，并且所有依赖都已打包。
- **拖放或编辑没有持久化** - 如果你依赖 ChatGPT 的 widget-state persistence（可选），请确认每次更新后都调用 `window.openai.setWidgetState`，并在挂载时从 `window.openai.widgetState` 重新水合。
- **移动端布局问题** - 如果你依赖 ChatGPT layout signals（可选），请检查 `window.openai.displayMode` 和 `window.openai.maxHeight` 以调整布局。避免固定高度或只依赖 hover 的操作。

## Discovery 和入口点问题

- **Tool 从不触发** - 重新检查你的 metadata。用“Use this when...”句式重写 descriptions，更新 starter prompts，并使用你的 golden prompt set 重新测试。
- **选错 tool** - 为相似工具添加澄清细节，或在 description 中指定禁止使用的场景。考虑将大型工具拆分为更小、目的更明确的工具。
- **Launcher 排名不符合预期** - 刷新你的 directory metadata，并确保 app icon 和 descriptions 符合用户预期。

## Authentication 问题

- **401 错误** - 在错误响应中包含 `WWW-Authenticate` header，让 ChatGPT 知道需要重新启动 OAuth flow。仔细检查 issuer URLs 和 audience claims。
- **Client registration 失败** - 如果你使用 CIMD，请确认你的 authorization server metadata 包含 `client_id_metadata_document_supported: true`，并且可以获取 ChatGPT 的 client metadata document。对于 `private_key_jwt`，请确认你的 authorization server 能获取 ChatGPT 的 public JWKS 并验证签名后的 client assertion。如果你使用 DCR，请确认你的 authorization server 暴露了 `registration_endpoint`，并且新创建的 clients 至少启用了一个 login connection。

## Deployment 问题

- **Ngrok tunnel 超时** - 重启 tunnel，并在共享 URL 前确认本地服务器正在运行。生产环境请使用带 health checks 的稳定托管服务商。
- **代理后方 streaming 中断** - 确保你的 load balancer 或 CDN 允许 server-sent events 或 streaming HTTP responses，且不会缓冲。

## 何时升级处理

如果你已经验证了上述要点但问题仍然存在：

1. 收集日志（server、component console、ChatGPT tool call transcript）和截图。
2. 记录你发出的 prompt 以及任何确认对话框。
3. 将详细信息分享给你的 OpenAI partner contact，以便他们在内部复现问题。

清晰简洁的故障排查日志可以缩短周转时间，并让你的 connector 对用户保持可靠。

:::

## English source

::: details 展开英文原文
::: v-pre
## How to triage issues

When something goes wrong—components failing to render, discovery missing prompts, auth loops—start by isolating which layer is responsible: server, component, or ChatGPT client. The checklist below covers the most common problems and how to resolve them.

## Server-side issues

- **No tools listed** – confirm your server is running and that you are connecting to the `/mcp` endpoint. If you changed ports, update the connector URL and restart MCP Inspector.
- **Structured content only, no component** – confirm the tool descriptor sets `_meta.ui.resourceUri` to a registered HTML resource with `mimeType: "text/html;profile=mcp-app"` (ChatGPT honors `_meta["openai/outputTemplate"]` as an optional compatibility alias), and that the resource loads without CSP errors.
- **Schema mismatch errors** – ensure your Pydantic or TypeScript models match the schema advertised in `outputSchema`. Regenerate types after making changes.
- **Slow responses** – components feel sluggish when tool calls take longer than a few hundred milliseconds. Profile backend calls and cache results when possible.

## Widget issues

- **Widget fails to load** – open the browser console (or MCP Inspector logs) for CSP violations or missing bundles. Make sure the HTML inlines your compiled JS and that all dependencies are bundled.
- **Drag-and-drop or editing doesn’t persist** – if you rely on ChatGPT’s widget-state persistence (optional), verify you call `window.openai.setWidgetState` after each update and that you rehydrate from `window.openai.widgetState` on mount.
- **Layout problems on mobile** – if you rely on ChatGPT layout signals (optional), inspect `window.openai.displayMode` and `window.openai.maxHeight` to adjust layout. Avoid fixed heights or hover-only actions.

## Discovery and entry-point issues

- **Tool never triggers** – revisit your metadata. Rewrite descriptions with “Use this when…” phrasing, update starter prompts, and retest using your golden prompt set.
- **Wrong tool selected** – add clarifying details to similar tools or specify disallowed scenarios in the description. Consider splitting large tools into smaller, purpose-built ones.
- **Launcher ranking feels off** – refresh your directory metadata and ensure the app icon and descriptions match what users expect.

## Authentication problems

- **401 errors** – include a `WWW-Authenticate` header in the error response so ChatGPT knows to start the OAuth flow again. Double-check issuer URLs and audience claims.
- **Client registration fails** – if you use CIMD, confirm your authorization server metadata includes `client_id_metadata_document_supported: true` and can fetch ChatGPT's client metadata document. For `private_key_jwt`, confirm your authorization server can fetch ChatGPT's public JWKS and validate the signed client assertion. If you use DCR, confirm your authorization server exposes `registration_endpoint` and that newly created clients have at least one login connection enabled.

## Deployment problems

- **Ngrok tunnel times out** – restart the tunnel and verify your local server is running before sharing the URL. For production, use a stable hosting provider with health checks.
- **Streaming breaks behind proxies** – ensure your load balancer or CDN allows server-sent events or streaming HTTP responses without buffering.

## When to escalate

If you have validated the points above and the issue persists:

1. Collect logs (server, component console, ChatGPT tool call transcript) and screenshots.
2. Note the prompt you issued and any confirmation dialogs.
3. Share the details with your OpenAI partner contact so they can reproduce the issue internally.

A crisp troubleshooting log shortens turnaround time and keeps your connector reliable for users.

:::
:::

