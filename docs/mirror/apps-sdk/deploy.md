---
title: "Deploy your app"
description: "Learn how to deploy your MCP server"
outline: deep
---

# Deploy your app

**文档集**：Apps SDK  
**分组**：Apps SDK — Deploy  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/deploy](https://developers.openai.com/apps-sdk/deploy)
- Markdown 来源：[https://developers.openai.com/apps-sdk/deploy.md](https://developers.openai.com/apps-sdk/deploy.md)
- 抓取时间：2026-06-27T05:54:46.480Z
- Checksum：`33aec67d714de0368c31260118069c5136a14869af7a23ba26f8a0d5a4fdc915`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 本地开发

开发期间，你可以使用 ngrok 等 tunnel 将本地 server 暴露给 ChatGPT：

```bash
ngrok http 2091
# https://<subdomain>.ngrok.app/mcp → http://127.0.0.1:2091/mcp
```

迭代 connector 时请保持 tunnel 运行。更改代码后：

1. 重新构建组件 bundle（在 `web/` 内运行 `npm run build`）。
2. 重启你的 MCP server。
3. 在 ChatGPT settings 中刷新 connector，以拉取最新 metadata。

## 部署选项

一旦你有了可工作的 MCP server 和组件 bundle，就把它们托管在稳定的 HTTPS endpoint 后面。关键要求是 `/mcp` 上的低延迟 streaming responses、可靠 TLS，以及出问题时能查看日志和指标。

### Manufact

[Manufact](https://manufact.com/) 维护 `mcp-use`，这是一个社区 MCP framework，用于用 TypeScript 和 Python 构建 MCP servers、clients、agents 和 app widgets。

对于 ChatGPT apps，`mcp-use` 可以生成带有 ChatGPT-compatible fields 的 MCP Apps metadata。它还包含用于测试工具和 widgets 的本地 inspector，并支持通过 Manufact Cloud 部署。请将 OpenAI Apps SDK docs 作为 ChatGPT 行为、metadata 和审核要求的权威参考。

请参阅 [`mcp-use` MCP Apps docs](https://manufact.com/docs/typescript/server/mcp-apps) 和 [`create-mcp-use-app`](https://manufact.com/docs/typescript/getting-started) 开始使用。

### Vercel

如果你想要快速部署、用于审核的 preview environments，以及自动 HTTPS，Vercel 也是很合适的选择。
[他们已经宣布支持 ChatGPT Apps hosting](https://vercel.com/changelog/chatgpt-apps-support-on-vercel)，因此你可以将 MCP endpoints 与前端一起发布，并使用 Vercel previews 在提升到生产环境前验证 connector 行为。

你可以使用他们的 Next.js [starter template](https://vercel.com/templates/ai/chatgpt-app-with-next-js) 开始。

### Alpic

[Alpic](https://alpic.ai/) 维护 [Skybridge](https://skybridge.tech)，这是一个用于 ChatGPT 和 MCP Apps 的开源 TypeScript framework。Skybridge 提供完整开发环境，包含本地 emulator、HMR 和 persistent tunnel，可轻松在 ChatGPT 内测试你的应用。它还提供 React hooks 和更高层抽象来处理 widgets 状态并与模型同步，以及一个 compatibility layer，帮助你的应用跨所有 MCP clients 运行。

Alpic 还提供通过 [Alpic Cloud](https://app.alpic.ai/) 一键部署的方案，以及一个 [auditing tool](https://beacon.alpic.ai/) 来检查你的应用为在 store 中发布做好的准备程度。

如果你需要带有 widget HMR 和生产部署路径的参考实现，[Skybridge starter kit](https://docs.skybridge.tech/quickstart/create-new-app) 可以让你快速启动。

### MCPcat

为了了解部署后用户如何使用你的 MCP server，[MCPcat](https://mcpcat.io/) 维护了适用于任何 ChatGPT app 的开源 SDK，无论它如何托管。

除了 tool call 和 session metrics，MCPcat 还会推断每个 session 的用户目标，让你看到应用实际支持的工作流。

你可以使用他们的 [TypeScript](https://github.com/mcpcat/mcpcat-typescript-sdk)、[Python](https://github.com/mcpcat/mcpcat-python-sdk) 或 [Go](https://github.com/mcpcat/mcpcat-go-sdk) SDK 开始。

### 其他托管选项

- **Managed containers**：Fly.io、Render 或 Railway，适合快速启动、自动 TLS，并为长生命周期请求提供可预测的 streaming 行为。
- **Cloud serverless**：Google Cloud Run 或 Azure Container Apps，如果你需要 scale-to-zero，请注意较长的 cold starts 可能中断 streaming HTTP。
- **Kubernetes**：适合已经运行 clusters 的团队。使用支持 server-sent events 的 ingress controller 放在 pods 前面。

无论选择哪个平台，请确保 `/mcp` 保持响应、支持 streaming responses，并为错误返回合适的 HTTP status codes。

## 环境配置

- **Secrets**：将 API keys 或 OAuth client secrets 存在 repo 外部。使用平台特定的 secret managers，并把它们作为 environment variables 注入。
- **Logging**：记录 tool-call IDs、request latency 和 error payloads。这有助于 connector 上线后调试用户报告。
- **Observability**：监控 CPU、memory 和 request counts，这样你可以为部署选择合适规格。

## Dogfood 和 rollout

在广泛发布前：

1. **Gate access**：在 developer mode 中测试 connector，直到你确信其稳定性。
2. **Run golden prompts**：执行你在规划期间起草的 discovery prompts，并记录每次发布后的 precision/recall 变化。
3. **Capture artifacts**：录制 screenshots 或 screen captures，展示组件在 MCP Inspector 和 ChatGPT 中的效果，供参考。

准备好生产发布后，更新 metadata，确认 auth 和 storage 配置正确，然后通过当前审核流程提交你的应用。获批应用会成为 ChatGPT 中的 apps，或用于 Codex 分发的 plugins。

## 后续步骤

- 使用 [Test your integration](/mirror/apps-sdk/deploy/testing) 指南验证 tooling 和 telemetry。
- 通过 [Troubleshooting](/mirror/apps-sdk/deploy/troubleshooting) 准备一份 troubleshooting playbook，帮助 on-call responders 快速诊断问题。
- 通过当前审核流程提交你的应用。阅读 [Submit your app](/mirror/apps-sdk/deploy/submission) 指南了解更多。

:::

## English source

::: details 展开英文原文
::: v-pre
## Local development

During development you can expose your local server to ChatGPT using a tunnel such as ngrok:

```bash
ngrok http 2091
# https://<subdomain>.ngrok.app/mcp → http://127.0.0.1:2091/mcp
```

Keep the tunnel running while you iterate on your connector. When you change code:

1. Rebuild the component bundle (`npm run build`).
2. Restart your MCP server.
3. Refresh the connector in ChatGPT settings to pull the latest metadata.

## Deployment options

Once you have a working MCP server and component bundle, host them behind a stable HTTPS endpoint. The key requirements are low-latency streaming responses on `/mcp`, dependable TLS, and the ability to surface logs and metrics when something goes wrong.

### Manufact

[Manufact](https://manufact.com/) maintains `mcp-use`, a community MCP framework for building MCP servers, clients, agents, and app widgets in TypeScript and Python.

For ChatGPT apps, `mcp-use` can generate MCP Apps metadata with ChatGPT-compatible fields. It also includes a local inspector for testing tools and widgets, and supports deployment through Manufact Cloud. Use the OpenAI Apps SDK docs as the canonical reference for ChatGPT behavior, metadata, and review requirements.

See the [`mcp-use` MCP Apps docs](https://manufact.com/docs/typescript/server/mcp-apps) and [`create-mcp-use-app`](https://manufact.com/docs/typescript/getting-started) to get started.

### Vercel

Vercel is another strong fit when you want quick deploys, preview environments for review, and automatic HTTPS.
[They have announced support for ChatGPT Apps hosting](https://vercel.com/changelog/chatgpt-apps-support-on-vercel), so you can ship MCP endpoints alongside your frontend and use Vercel previews to validate connector behavior before promoting to production.

You can use their Next.js [starter template](https://vercel.com/templates/ai/chatgpt-app-with-next-js) to get started.

### Alpic

[Alpic](https://alpic.ai/) maintains [Skybridge](https://skybridge.tech), an open-source TypeScript framework for ChatGPT and MCP Apps. Skybridge provides a full development environment with a local emulator, HMR and persistent tunnel to easily test your app inside ChatGPT. It also provides React hooks and higher-level abstractions to handle the state of your widgets and synchronize it with the model, as well as a compatibility layer to help your app work across all MCP clients.

Alpic also provides a one-click deploy solution with [Alpic Cloud](https://app.alpic.ai/) and an [auditing tool](https://beacon.alpic.ai/) to check how ready your app is for publication in the store.

If you’re looking for a reference implementation with HMR for widgets plus a production deployment path, the [Skybridge starter kit](https://docs.skybridge.tech/quickstart/create-new-app) gets you up and running fast.

### MCPcat

To understand what your users are doing with your MCP server after deployment, [MCPcat](https://mcpcat.io/) maintains open-source SDKs that work with any ChatGPT app, regardless of how it's hosted.

On top of tool call and session metrics, MCPcat infers the user’s goal for each session, so you can see the actual workflows your app supports.

You can use their [TypeScript](https://github.com/mcpcat/mcpcat-typescript-sdk), [Python](https://github.com/mcpcat/mcpcat-python-sdk), or [Go](https://github.com/mcpcat/mcpcat-go-sdk) SDK to get started.

### Other hosting options

- **Managed containers**: Fly.io, Render, or Railway for quick spin-up and automatic TLS, plus predictable streaming behavior for long-lived requests.
- **Cloud serverless**: Google Cloud Run or Azure Container Apps if you need scale-to-zero, keeping in mind that long cold starts can interrupt streaming HTTP.
- **Kubernetes**: for teams that already run clusters. Front your pods with an ingress controller that supports server-sent events.

Regardless of platform, make sure `/mcp` stays responsive, supports streaming responses, and returns appropriate HTTP status codes for errors.

## Environment configuration

- **Secrets**: store API keys or OAuth client secrets outside your repo. Use platform-specific secret managers and inject them as environment variables.
- **Logging**: log tool-call IDs, request latency, and error payloads. This helps debug user reports once the connector is live.
- **Observability**: monitor CPU, memory, and request counts so you can right-size your deployment.

## Dogfood and rollout

Before launching broadly:

1. **Gate access**: test your connector in developer mode until you are confident in stability.
2. **Run golden prompts**: exercise the discovery prompts you drafted during planning and note precision/recall changes with each release.
3. **Capture artifacts**: record screenshots or screen captures showing the component in MCP Inspector and ChatGPT for reference.

When you are ready for production, update metadata, confirm auth and storage are configured correctly, and submit your app through the current review flow. Approved apps become apps in ChatGPT or plugins for Codex distribution.

## Next steps

- Validate tooling and telemetry with the [Test your integration](/mirror/apps-sdk/deploy/testing) guide.
- Keep a troubleshooting playbook handy via [Troubleshooting](/mirror/apps-sdk/deploy/troubleshooting) so on-call responders can quickly diagnose issues.
- Submit your app through the current review flow. Learn more in the [Submit your app](/mirror/apps-sdk/deploy/submission) guide.

:::
:::

