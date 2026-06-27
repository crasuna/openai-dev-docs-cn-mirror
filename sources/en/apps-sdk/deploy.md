# Deploy your app

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

- Validate tooling and telemetry with the [Test your integration](https://developers.openai.com/apps-sdk/deploy/testing) guide.
- Keep a troubleshooting playbook handy via [Troubleshooting](https://developers.openai.com/apps-sdk/deploy/troubleshooting) so on-call responders can quickly diagnose issues.
- Submit your app through the current review flow. Learn more in the [Submit your app](https://developers.openai.com/apps-sdk/deploy/submission) guide.
