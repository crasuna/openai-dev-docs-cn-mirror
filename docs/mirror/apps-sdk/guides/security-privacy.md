---
title: "安全与隐私"
description: "Security and privacy considerations for Apps SDK."
outline: deep
---

# 安全与隐私

**文档集**：Apps SDK  
**分组**：Apps SDK — Guides  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/guides/security-privacy](https://developers.openai.com/apps-sdk/guides/security-privacy)
- Markdown 来源：[https://developers.openai.com/apps-sdk/guides/security-privacy.md](https://developers.openai.com/apps-sdk/guides/security-privacy.md)
- 抓取时间：2026-06-27T05:54:48.954Z
- Checksum：`84ade8bf058a9efb36e1567a42ee8c34b430b9ad5fb9499cf081ba8817c37906`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## Principles

Apps SDK 让你的代码能够访问用户数据、第三方 API 和写入操作。请把每个 connector 都当作生产软件来对待：

- **最小权限** - 只请求你需要的 scopes、storage access 和 network permissions。
- **明确的用户同意** - 确保用户理解自己何时在链接账户或授予写入权限。对于可能具有破坏性的操作，请依靠 ChatGPT 的 confirmation prompts。
- **纵深防御** - 假设 prompt injection 和恶意输入会到达你的服务器。验证所有内容并保留 audit logs。

## Data handling

- **Structured content** - 只包含当前 prompt 所需的数据。避免将 secrets 或 tokens 嵌入 component props。
- **Storage** - 决定你保留用户数据的时长，并发布 retention policy。及时响应删除请求。
- **Logging** - 写入日志前请对 PII 做脱敏。存储 correlation IDs 以便调试，但除非必要，避免存储原始 prompt text。

## Prompt injection 和写入操作

Developer mode 启用完整 MCP 访问，包括 write tools。通过以下方式降低风险：

- 定期审查 tool descriptions，避免误用（“Do not use to delete records”）。
- 即使输入由模型提供，也要在 server-side 验证所有输入。
- 对不可逆操作要求人工确认。

将你用于测试 injection 的最佳 prompts 分享给 QA 团队，以便他们尽早探测薄弱点。

## Network access

Widgets 在带有严格 Content Security Policy 的 sandboxed iframe 内运行。它们无法访问特权浏览器 API，例如 `window.alert`、`window.prompt`、`window.confirm` 或 `navigator.clipboard`。标准 `fetch` 请求只有在符合 CSP 时才被允许。Subframes（iframes）默认被阻止，只有当你在 resource CSP metadata 中明确允许它们时才允许（例如 `_meta.ui.csp.frameDomains`）。如果需要 allow-listed 的特定域，请与你的 OpenAI partner 合作。

Server-side code 除托管环境强制执行的限制之外没有网络限制。请遵循 outbound calls 的常规最佳实践（TLS verification、retries、timeouts）。

## Authentication & authorization

- 集成外部账户时使用 OAuth 2.1 authorization-code flows。当你的 authorization server 支持 CIMD 且 connector creator 选择 CIMD 时，优先使用 Client ID Metadata Documents (CIMD)。对于 public-client token exchange 使用 `none`，或在你的 authorization server 需要 client authentication 时使用 `private_key_jwt`。当 connector creator 选择 DCR 或 CIMD 不可用时，请支持 DCR。
- 在每次 tool call 上验证并强制执行 scopes。对过期或格式错误的 tokens 返回 `401` responses。
- 对于 built-in identity，避免存储长期 secrets；请改用提供的 auth context。

## Operational readiness

- 发布前运行 security reviews，尤其是在处理受监管数据时。
- 监控异常流量模式，并为重复错误或认证失败尝试设置 alerts。
- 保持第三方依赖（React、SDKs、build tooling）已打补丁，以降低 supply chain risks。

安全和隐私是用户信任的基础。请将它们融入 planning、implementation 和 deployment workflows，而不是事后补救。

:::

## English source

::: details 展开英文原文
::: v-pre
## Principles

Apps SDK gives your code access to user data, third-party APIs, and write actions. Treat every connector as production software:

- **Least privilege** – only request the scopes, storage access, and network permissions you need.
- **Explicit user consent** – make sure users understand when they are linking accounts or granting write access. Lean on ChatGPT’s confirmation prompts for potentially destructive actions.
- **Defense in depth** – assume prompt injection and malicious inputs will reach your server. Validate everything and keep audit logs.

## Data handling

- **Structured content** – include only the data required for the current prompt. Avoid embedding secrets or tokens in component props.
- **Storage** – decide how long you keep user data and publish a retention policy. Respect deletion requests promptly.
- **Logging** – redact PII before writing to logs. Store correlation IDs for debugging but avoid storing raw prompt text unless necessary.

## Prompt injection and write actions

Developer mode enables full MCP access, including write tools. Mitigate risk by:

- Reviewing tool descriptions regularly to discourage misuse (“Do not use to delete records”).
- Validating all inputs server-side even if the model provided them.
- Requiring human confirmation for irreversible operations.

Share your best prompts for testing injections with your QA team so they can probe weak spots early.

## Network access

Widgets run inside a sandboxed iframe with a strict Content Security Policy. They cannot access privileged browser APIs such as `window.alert`, `window.prompt`, `window.confirm`, or `navigator.clipboard`. Standard `fetch` requests are allowed only when they comply with the CSP. Subframes (iframes) are blocked by default and only allowed when you explicitly allow them in your resource CSP metadata (for example, `_meta.ui.csp.frameDomains`). Work with your OpenAI partner if you need specific domains allow-listed.

Server-side code has no network restrictions beyond what your hosting environment enforces. Follow normal best practices for outbound calls (TLS verification, retries, timeouts).

## Authentication & authorization

- Use OAuth 2.1 authorization-code flows when integrating external accounts. Prefer Client ID Metadata Documents (CIMD) when your authorization server supports CIMD and the connector creator chooses it. Use `none` for public-client token exchange or `private_key_jwt` when your authorization server requires client authentication. Support DCR when the connector creator chooses it or CIMD is not available.
- Verify and enforce scopes on every tool call. Reject expired or malformed tokens with `401` responses.
- For built-in identity, avoid storing long-lived secrets; use the provided auth context instead.

## Operational readiness

- Run security reviews before launch, especially if you handle regulated data.
- Monitor for anomalous traffic patterns and set up alerts for repeated errors or failed auth attempts.
- Keep third-party dependencies (React, SDKs, build tooling) patched to mitigate supply chain risks.

Security and privacy are foundational to user trust. Bake them into your planning, implementation, and deployment workflows rather than treating them as an afterthought.

:::
:::

