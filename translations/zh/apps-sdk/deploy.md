---
status: needs-review
sourceId: "33aec67d714d"
sourceChecksum: "33aec67d714de0368c31260118069c5136a14869af7a23ba26f8a0d5a4fdc915"
sourceUrl: "https://developers.openai.com/apps-sdk/deploy"
translatedAt: "2026-06-27T19:35:17.0701114+08:00"
translator: codex-gpt-5.5-xhigh
---

# 部署你的应用

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

- 使用 [Test your integration](https://developers.openai.com/apps-sdk/deploy/testing) 指南验证 tooling 和 telemetry。
- 通过 [Troubleshooting](https://developers.openai.com/apps-sdk/deploy/troubleshooting) 准备一份 troubleshooting playbook，帮助 on-call responders 快速诊断问题。
- 通过当前审核流程提交你的应用。阅读 [Submit your app](https://developers.openai.com/apps-sdk/deploy/submission) 指南了解更多。
