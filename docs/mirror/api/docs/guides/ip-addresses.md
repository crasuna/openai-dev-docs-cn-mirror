---
title: "IP egress ranges"
description: "Find the published IP egress ranges used by OpenAI products."
outline: deep
---

# IP egress ranges

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/ip-addresses](https://developers.openai.com/api/docs/guides/ip-addresses)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/ip-addresses.md](https://developers.openai.com/api/docs/guides/ip-addresses.md)
- 抓取时间：2026-06-27T05:54:03.111Z
- Checksum：`19efdaa467c10df842d0e0994ee2e4b8f76847c76977bfdfb21686775e27a8a2`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
部分 OpenAI 产品会向你控制的服务发起出站请求。如果你的网络需要 IP allowlist，请使用发起请求的产品所发布的范围。

IP allowlisting 标识的是来自 OpenAI 运营网络的流量，而不是某个特定用户或 workspace；当你的集成需要请求认证或授权时，它也不能替代这些机制。对于 ChatGPT apps，请使用 [mutual TLS](/mirror/apps-sdk/build/auth#mutual-tls-mtls) 将 ChatGPT 认证为 MCP client。当你的 app 需要用户认证时，请使用 OAuth 2.1 对用户进行认证和授权。

## 出站 IP 地址

| 产品 | 用途 | 已发布范围 |
| -------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| ChatGPT integrations | 使用 Apps SDK、connectors、GPT Actions 和 Agentic Commerce 构建的 apps | [chatgpt-connectors.json](https://openai.com/chatgpt-connectors.json) |
| Codex cloud | 从 Codex cloud 连接到 GitHub 等服务 | [chatgpt-agents.json](https://openai.com/chatgpt-agents.json) |

每个 JSON 文件都包含一个 `creationTime` 和一个 `prefixes` 数组。随着 OpenAI 基础设施变化，这些范围可能会改变。请定期获取相关文件，并自动更新你的 allowlist。

:::

## English source

::: details 展开英文原文
::: v-pre
Some OpenAI products make outbound requests to services you control. If your network requires an IP allowlist, use the published ranges for the product making the request.

IP allowlisting identifies traffic from an OpenAI-operated network, not a specific user or workspace, and does not replace request authentication or authorization when your integration requires them. For ChatGPT apps, use [mutual TLS](/mirror/apps-sdk/build/auth#mutual-tls-mtls) to authenticate ChatGPT as the MCP client. When your app requires user authentication, use OAuth 2.1 to authenticate and authorize the user.

## Outbound IP addresses

| Product              | Used for                                                                    | Published ranges                                                      |
| -------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| ChatGPT integrations | Apps built with the Apps SDK, connectors, GPT Actions, and Agentic Commerce | [chatgpt-connectors.json](https://openai.com/chatgpt-connectors.json) |
| Codex cloud          | Connections from Codex cloud to services such as GitHub                     | [chatgpt-agents.json](https://openai.com/chatgpt-agents.json)         |

Each JSON file includes a `creationTime` and a `prefixes` array. The ranges can change as OpenAI infrastructure changes. Fetch the relevant file regularly and update your allowlist automatically.

:::
:::

