---
status: needs-review
sourceId: "d72e7a169d41"
sourceChecksum: "d72e7a169d4122528bc40ad8f3383503e8f0068255600e20e4d9ecb0aa1e3e0a"
sourceUrl: "https://developers.openai.com/api/docs/actions/authentication"
translatedAt: "2026-06-27T17:44:20.0905341+08:00"
translator: codex-gpt-5.5-xhigh
---

# GPT Action authentication 身份验证

Actions 提供不同的认证 schema，以适配各种用例。要为你的 action 指定认证 schema，请使用 GPT editor，并选择 "None"、"API Key" 或 "OAuth"。

默认情况下，所有 actions 的认证方法都设置为 "None"，但你可以更改它，并允许不同 actions 使用不同的认证方法。

## 无认证

对于用户无需 API key 或通过 OAuth 登录即可直接向你的 API 发送请求的应用，我们支持无认证流程。

可以考虑在初始用户交互中不使用认证，因为如果用户被迫登录某个应用，可能会出现用户流失。你可以创建一种“已登出”体验，然后通过启用单独的 action 将用户转到“已登录”体验。

## API key 认证

就像用户可能已经在使用你的 API 一样，我们允许通过 GPT editor UI 配置 API key 认证。我们在数据库中存储密钥时会对 secret key 加密，以保证你的 API key 安全。

如果你的 API 执行的操作比无认证流程稍微更有影响，但又不要求每个用户单独登录，这种方式会很有用。添加 API key 认证可以保护你的 API，并提供更细粒度的访问控制，同时让你了解请求来源。

## OAuth

Actions 允许每个用户使用 OAuth 登录。这是提供个性化体验并向用户开放最强大 actions 的最佳方式。一个使用 actions 的 OAuth 流程简单示例如下：

- 首先，在 GPT editor UI 中选择 "Authentication"，然后选择 "OAuth"。
- 系统会提示你输入 OAuth client ID、client secret、authorization URL、token URL 和 scope。
  - client ID 和 secret 可以是简单的文本字符串，但应[遵循 OAuth 最佳实践](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/)。
  - 我们会存储 client secret 的加密版本，而 client ID 对最终用户可见。
- OAuth 请求将包含以下信息：`request={'grant_type': 'authorization_code', 'client_id': 'YOUR_CLIENT_ID', 'client_secret': 'YOUR_CLIENT_SECRET', 'code': 'abc123', 'redirect_uri': 'https://chat.openai.com/aip/{g-YOUR-GPT-ID-HERE}/oauth/callback'}` 注意：`https://chatgpt.com/aip/{g-YOUR-GPT-ID-HERE}/oauth/callback` 也有效。
- 为了让某人使用带 OAuth 的 action，他们需要发送一条会调用该 action 的消息，然后用户会在 ChatGPT UI 中看到 "Sign in to [domain]" 按钮。
- `authorization_url` 端点应返回类似如下的响应：
  `{ "access_token": "example_token", "token_type": "bearer", "refresh_token": "example_token", "expires_in": 59 }`
- 在用户登录过程中，ChatGPT 会使用指定的 `authorization_content_type` 向你的 `authorization_url` 发出请求；我们期望返回 access token，并可选返回一个 [refresh token](https://auth0.com/learn/refresh-tokens)，用于周期性获取新的 access token。
- 每次用户向 action 发起请求时，用户的 token 都会在 Authorization header 中传递：("Authorization": "[Bearer/Basic] [user’s token]")。
- 出于安全原因，我们要求 OAuth 应用使用 [state parameter](https://auth0.com/docs/secure/attack-protection/state-parameters#set-and-compare-state-parameter-values)。

Custom GPTs 登录失败问题（Redirect URLs）？

- 请确保在你的 OAuth 应用中启用此 redirect URL：
- #1 Redirect URL: `https://chat.openai.com/aip/{g-YOUR-GPT-ID-HERE}/oauth/callback`（某些客户端可能使用不同域名）
- #2 Redirect URL: `https://chatgpt.com/aip/{g-YOUR-GPT-ID-HERE}/oauth/callback`（保存后可在 ChatGPT UI 的 URL 栏中获取你的 GPT ID）。如果你有多个 GPT，需要根据风险容忍度为每个 GPT 启用，或使用通配符。
- Debug Note: 你的 Auth Provider 通常会记录失败信息（例如 'redirect_uri is not registered for client'），这也有助于调试登录问题。
