---
status: needs-review
sourceId: "19efdaa467c1"
sourceChecksum: "19efdaa467c10df842d0e0994ee2e4b8f76847c76977bfdfb21686775e27a8a2"
sourceUrl: "https://developers.openai.com/api/docs/guides/ip-addresses"
translatedAt: "2026-06-27T17:44:39.0189315+08:00"
translator: codex-gpt-5.5-xhigh
---

# IP 出站范围

部分 OpenAI 产品会向你控制的服务发起出站请求。如果你的网络需要 IP allowlist，请使用发起请求的产品所发布的范围。

IP allowlisting 标识的是来自 OpenAI 运营网络的流量，而不是某个特定用户或 workspace；当你的集成需要请求认证或授权时，它也不能替代这些机制。对于 ChatGPT apps，请使用 [mutual TLS](https://developers.openai.com/apps-sdk/build/auth#mutual-tls-mtls) 将 ChatGPT 认证为 MCP client。当你的 app 需要用户认证时，请使用 OAuth 2.1 对用户进行认证和授权。

## 出站 IP 地址

| 产品 | 用途 | 已发布范围 |
| -------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| ChatGPT integrations | 使用 Apps SDK、connectors、GPT Actions 和 Agentic Commerce 构建的 apps | [chatgpt-connectors.json](https://openai.com/chatgpt-connectors.json) |
| Codex cloud | 从 Codex cloud 连接到 GitHub 等服务 | [chatgpt-agents.json](https://openai.com/chatgpt-agents.json) |

每个 JSON 文件都包含一个 `creationTime` 和一个 `prefixes` 数组。随着 OpenAI 基础设施变化，这些范围可能会改变。请定期获取相关文件，并自动更新你的 allowlist。
