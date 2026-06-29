---
title: "认证"
description: "Authentication patterns for Apps SDK apps."
outline: deep
---

# 认证

**文档集**：Apps SDK  
**分组**：Apps SDK — Build  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/build/auth](https://developers.openai.com/apps-sdk/build/auth)
- Markdown 来源：[https://developers.openai.com/apps-sdk/build/auth.md](https://developers.openai.com/apps-sdk/build/auth.md)
- 抓取时间：2026-06-27T05:54:45.394Z
- Checksum：`dbc39d56ebf6b6ec99a40f10a230a5880d06ea973d45edea8e470260f9290a09`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 认证你的用户

许多 Apps SDK apps 可以在只读、匿名模式下运行，但任何会暴露客户特定数据或写入动作的内容都应认证用户。

当你需要连接现有后端或在用户之间共享数据时，可以集成自己的 authorization server。

## 使用 OAuth 2.1 的自定义 auth

对于需要认证的 MCP server，你应实现符合 [MCP authorization spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization) 的 OAuth 2.1 flow。

### 组件

- **Resource server** – 你的 MCP server，它公开 tools，并在每个请求上验证 access tokens。
- **Authorization server** – 你的 identity provider（Auth0、Okta、Cognito 或自定义实现），用于签发 tokens 并发布 discovery metadata。
- **Client** – 代表用户行动的 ChatGPT。它支持 Client ID Metadata Documents（CIMD）、dynamic client registration（DCR）、预定义 OAuth clients 和 PKCE。

### MCP authorization spec 要求

- 在你的 MCP server 上托管 protected resource metadata
- 从你的 authorization server 发布 OAuth metadata
- 在整个 OAuth flow 中回显 `resource` parameter
- 选择 ChatGPT 如何识别或注册其 OAuth client：CIMD、DCR 或预定义 OAuth client
- 发布你的 authorization server 接受的 token endpoint authentication methods

下面用普通语言说明该规范的预期。

#### 在你的 MCP server 上托管 protected resource metadata

- 你需要一个 HTTPS endpoint，例如 `GET https://your-mcp.example.com/.well-known/oauth-protected-resource`（或者在 `401 Unauthorized` 响应的 `WWW-Authenticate` header 中公告同一个 URL），以便 ChatGPT 知道到哪里获取你的 metadata。
- 该 endpoint 返回一个 JSON document，描述 resource server 及其可用的 authorization servers：

```json
{
  "resource": "https://your-mcp.example.com",
  "authorization_servers": ["https://auth.yourcompany.com"],
  "scopes_supported": ["files:read", "files:write"],
  "resource_documentation": "https://yourcompany.com/docs/mcp"
}
```

- 你必须填充的关键字段：
  - `resource`：你的 MCP server 的规范 HTTPS identifier。ChatGPT 会在 OAuth 期间把这个精确值作为 `resource` query parameter 发送。
  - `authorization_servers`：一个或多个指向你的 identity provider 的 issuer base URLs。ChatGPT 会逐一尝试以查找 OAuth metadata。
  - `scopes_supported`：可选列表，帮助 ChatGPT 向用户解释即将请求的 permissions。
  - 来自 [RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728) 的可选附加项，例如 `resource_documentation`、`token_endpoint_auth_methods_supported` 或 `introspection_endpoint`，可以让 clients 和 admins 更容易理解你的设置。

当你因请求未认证而阻止它时，返回如下 challenge：

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="https://your-mcp.example.com/.well-known/oauth-protected-resource",
                         scope="files:read"
```

即使 ChatGPT 之前没有见过这个 metadata URL，这个单一 header 也能让它发现该 URL。

#### 从你的 authorization server 发布 OAuth metadata

- 你的 identity provider 必须公开以下 well-known discovery documents 之一，方便 ChatGPT 读取其配置：
  - 位于 `https://auth.yourcompany.com/.well-known/oauth-authorization-server` 的 OAuth 2.0 metadata
  - 位于 `https://auth.yourcompany.com/.well-known/openid-configuration` 的 OpenID Connect metadata
- 每个 document 都会为 ChatGPT 回答三个关键问题：把用户发送到哪里、如何交换 codes，以及如何识别自己。典型响应如下：

```json
{
  "issuer": "https://auth.yourcompany.com",
  "authorization_endpoint": "https://auth.yourcompany.com/oauth2/v1/authorize",
  "token_endpoint": "https://auth.yourcompany.com/oauth2/v1/token",
  "client_id_metadata_document_supported": true,
  "token_endpoint_auth_methods_supported": ["none", "private_key_jwt"],
  "registration_endpoint": "https://auth.yourcompany.com/oauth2/v1/register",
  "code_challenge_methods_supported": ["S256"],
  "scopes_supported": ["files:read", "files:write"]
}
```

- 必须正确的字段：
  - `authorization_endpoint`、`token_endpoint`：ChatGPT 端到端运行 OAuth authorization-code + PKCE flow 所需的 URLs。
  - `client_id_metadata_document_supported`：当你希望 ChatGPT 使用 CIMD 进行 client registration 时，将其设为 `true`。ChatGPT 会在可用时优先使用 CIMD，但当 CIMD 和 DCR 都可用时，connector creator 可以选择 DCR。
  - `token_endpoint_auth_methods_supported`：包含你的 authorization server 接受的 token endpoint authentication methods。这适用于 CIMD、DCR 和预定义 OAuth clients。对于 CIMD，ChatGPT 支持 `none` 用于 public-client token exchange，支持 `private_key_jwt` 用于 signed client assertion token exchange。其他 OAuth clients 常用 `none`、`client_secret_post` 或 `client_secret_basic`。
  - `registration_endpoint`：当你支持 dynamic client registration（DCR）时包含它，这让 ChatGPT 可以为 connector instance 创建并复用专用 `client_id`。
  - `code_challenge_methods_supported`：如果你的 authorization server 公告 PKCE 支持，请包含 `S256`。
  - 可选字段遵循 [RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414) / [OpenID Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html)；包含任何有助于 administrators 配置 policies 的内容。

#### OIDC scopes

- 如果你的 provider 在其 `.well-known/oauth-authorization-server` 或 `.well-known/openid-configuration` document 的 `scopes_supported` 中公告 OIDC scopes（例如 `openid`、`email`、`profile`），ChatGPT 默认会在 OAuth flow 期间请求这些 scopes。
- 某些 identity providers 可能默认不启用已公告的 OIDC scopes。请检查你的 provider 配置设置，并确保每个已公告 scope 都对 OAuth client 启用，无论它使用 CIMD、手动创建，还是通过 DCR 创建。



#### 在 reauthorization 期间保留登录上下文

当 ChatGPT 对现有链接重新授权（包括请求额外 OAuth scopes）时，它可能会在 authorization request 中以标准 `id_token_hint` parameter 包含之前的 OIDC ID token。若要让用户无需从头登录即可授予额外 scopes，请配置你的 authorization server，在原始 OAuth flow 中签发 ID token，并在 authorization 期间遵循 `id_token_hint`。

此优化是可选的。当 ID token 不可用或你的 authorization server 不使用该 hint 时，reauthorization 仍然可以工作。

#### Redirect URL

ChatGPT 通过重定向到 `https://chatgpt.com/connector/oauth/{callback_id}` 来完成 OAuth flow，该 URL 会显示在 app management page 中。请把这个 production redirect URI 添加到你的 authorization server allowlist，以便 authorization code 能成功返回。

- 对于已经发布的 apps，之前的 legacy redirect URI `https://chatgpt.com/connector_platform_oauth_redirect` 会继续工作。

#### 在整个 OAuth flow 中回显 `resource` parameter

- 预期 ChatGPT 会向 authorization 和 token requests 都追加 `resource=https%3A%2F%2Fyour-mcp.example.com`。这会把 token 绑定回上面显示的 protected resource metadata。
- 配置你的 authorization server，把该值复制到 access token 中（通常是 `aud` claim），这样你的 MCP server 可以验证 token 是为它而非其他对象签发的。
- 如果 token 到达时没有预期的 audience 或 scopes，请拒绝它，并依赖 `WWW-Authenticate` challenge 提示 ChatGPT 用正确参数重新授权。

#### 支持 authorization-code flow

- ChatGPT 作为 MCP client，会使用带有 `S256` code challenge 的 PKCE 执行 authorization-code flow，这样被截获的 authorization codes 就不能被攻击者重放。
- 如果你的 authorization server 发布 `code_challenge_methods_supported`，请包含 `S256`，以便 clients 能从 metadata 确认 PKCE 支持。

### OAuth flow

如果你已实现上述 MCP authorization spec，OAuth flow 将如下进行：

1. ChatGPT 查询你的 MCP server 以获取 protected resource metadata。

![](/openai-assets/developers.openai.com/images/apps-sdk/protected_resource_metadata.png)

2. ChatGPT 将自己识别为 OAuth client。当 connector 使用 CIMD 时，ChatGPT 跳过 dynamic client registration，并发送 CIMD document URL 作为 `client_id`，例如 `https://chatgpt.com/oauth/.../client.json`（确切 URL 与 MCP server 相关，因为 redirect URI 是 MCP-specific）。当 connector 使用 DCR 时，ChatGPT 会为 connector instance 调用一次你的 authorization server 的 `registration_endpoint`，收到生成的 `client_id`，并为该 instance 复用该 client。

使用 CIMD 时，没有 client registration 步骤。下面的屏幕展示 DCR 路径：

![](/openai-assets/developers.openai.com/images/apps-sdk/client_registration.png)

3. 当用户首次调用工具时，ChatGPT client 启动 OAuth authorization code + PKCE flow。用户认证并同意所请求的 scopes。

![](/openai-assets/developers.openai.com/images/apps-sdk/preparing_authorization.png)

4. ChatGPT 用 authorization code 交换 access token，并将其附加到后续 MCP requests（`Authorization: Bearer &lt;token&gt;`）。

![](/openai-assets/developers.openai.com/images/apps-sdk/auth_complete.png)

5. 你的 server 在每个请求上验证 token（issuer、audience、expiration、scopes），然后再执行工具。

### Client registration

当你的 authorization server 支持且 connector creator 选择它时，请优先使用 [Client ID Metadata Documents (CIMD)](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#client-id-metadata-documents) 作为 client registration method。使用 CIMD 时，ChatGPT 使用 HTTPS metadata document URL 作为其 `client_id`。你的 authorization server 会获取该 document、验证已发布的 client metadata 和 redirect URIs，并将该 URL 视为 ChatGPT 的稳定 client identity。

如果你支持 CIMD，请在 authorization server metadata 中设置 `client_id_metadata_document_supported: true`。这让 ChatGPT 能为选择 CIMD 的 connectors 使用一个稳定 client identity，你的 authorization server 可以据此配置 redirect URI allowlists、rate limits 和其他 policies。

ChatGPT 对 CIMD-backed clients 支持两种 token endpoint authentication methods：

- `none`：当你的 token endpoint 支持基于 PKCE 的 authorization-code exchange 且不需要 client authentication 时，使用此 public-client flow。ChatGPT 不会存储每个 client 的 secret。
- `private_key_jwt`：当你的 token endpoint 需要 client authentication 时，使用此 signed client assertion flow。ChatGPT 会发布包含 `token_endpoint_auth_method: "private_key_jwt"` 和 public JWKS URL 的 CIMD metadata。JWKS 从 metadata origin 上的 `/oauth/jwks.json` 提供。ChatGPT 在 server-side 使用托管 private key 和 `kid` 签署 token requests；你的 authorization server 根据 public JWKS 验证 assertion。

DCR 仍受支持。如果你包含 `registration_endpoint`，当 connector creator 选择 DCR 或 CIMD 不可用时，ChatGPT 可以动态注册。ChatGPT 会为每个 connector instance 运行一次 DCR，然后保留并复用为该 instance 注册的 OAuth client。DCR 仍可能在许多独立 connector instances 中创建大量已注册 clients，因此 CIMD 通常更容易大规模管理。

### Client identification

一个常见问题是你的 MCP server 如何确认请求确实来自 ChatGPT。ChatGPT 在连接 MCP servers 时会呈现 OpenAI-managed client certificate，因此你可以通过 mTLS 在 transport layer 验证 client。你也可以 allowlist ChatGPT 的 [published egress IP ranges](/mirror/api/docs/guides/ip-addresses)。ChatGPT **不** 支持 machine-to-machine OAuth grants，例如 client credentials、service accounts 或 JWT bearer assertions，也不能呈现自定义 API keys 或 customer-provided mTLS certificates。

CIMD 通过向你的 authorization server 提供一个稳定、HTTPS-hosted 的 ChatGPT identity 声明，进一步增强 client identification。使用 `private_key_jwt` 时，请根据 CIMD metadata 中发布的 public JWKS 验证 ChatGPT 的 token endpoint client assertion。

### Mutual TLS (mTLS)

ChatGPT 现在在与 MCP servers 建立 TLS connections 时会呈现 OpenAI-managed client certificate。如果你的应用验证 client certificates，请配置它信任下面的 OpenAI certificate chain。

- &lt;a href="/apps-sdk/mtls/openai-root-ca.pem" download&gt;
    Download OpenAI Root CA

- &lt;a href="/apps-sdk/mtls/openai-connectors-mtls-ca.pem" download&gt;
    Download OpenAI Connectors mTLS intermediate CA


在与 MCP server 建立 TLS connection 时验证 client certificate：

- 验证 leaf certificate 存在，并链到 OpenAI Connectors mTLS intermediate CA。
- 验证 leaf certificate 对 client authentication 有效。
- 验证 leaf certificate 的 SAN `dnsName` 为 `mtls.prod.connectors.openai.com`。
- 避免 pinning leaf certificate fingerprint；OpenAI 可能在保持其位于已发布 CA chain 下的同时轮换 leaf certificate。

使用 mTLS 将 ChatGPT 认证为 MCP client。继续使用 OAuth 2.1 认证最终用户并授权工具访问。

### 选择 identity provider

大多数 OAuth 2.1 identity providers 只要公开 discovery document、支持使用 `none` 或 `private_key_jwt` 的 CIMD、在需要时支持 DCR，并把 `resource` parameter 回显到已签发 tokens 中，就能满足 MCP authorization requirements。优先选择支持 CIMD 进行 client registration 的 providers。

我们 _强烈_ 建议你使用现有成熟 identity provider，而不是从零开始自行实现认证。

下面是一些热门 identity providers 的说明。

#### Auth0

Auth0 通过提供 metadata discovery、CIMD registration、API security，以及 first- and third-party tool calls 的 token exchange，使 MCP clients 能安全连接到 MCP servers。

- [Guide to configuring Auth0 for MCP authorization](https://github.com/openai/openai-mcpkit/blob/main/python-authenticated-mcp-server-scaffold/README.md#2-configure-auth0-authentication)
- [Auth0 securing MCP servers overview](https://auth0.com/ai/docs/mcp/intro/overview)
- [Auth0 securing MCP servers quickstarts](https://auth0.com/ai/docs/mcp/get-started/overview)

#### Stytch

- [Guide to configuring Stytch for MCP authorization](https://stytch.com/docs/guides/connected-apps/mcp-server-overview)
- [Overview guide to MCP authorization](https://stytch.com/blog/MCP-authentication-and-authorization-guide/)
- [Overview guide to MCP authorization specifically for Apps SDK](https://stytch.com/blog/guide-to-authentication-for-the-openai-apps-sdk/)

### 实现 token verification

当 OAuth flow 完成后，ChatGPT 只是把它收到的 access token 附加到后续 MCP requests（`Authorization: Bearer …`）。一旦请求到达你的 MCP server，你必须假设 token 不可信，并自行执行完整的 resource-server checks，包括 signature validation、issuer 和 audience matching、expiry、replay considerations，以及 scope enforcement。这项责任在你，而不在 ChatGPT。

实际操作中你应：

- 获取你的 authorization server 发布的 signing keys（通常通过 JWKS），并验证 token 的 signature 和 `iss`。
- 拒绝已经过期或尚未生效的 tokens（`exp`/`nbf`）。
- 确认 token 是为你的 server 签发的（`aud` 或 `resource` claim），并包含你标记为 required 的 scopes。
- 运行任何 app-specific policy checks，然后将解析出的 identity 附加到 request context，或返回带有 `WWW-Authenticate` challenge 的 `401`。

如果验证失败，请以 `401 Unauthorized` 和指向你的 protected-resource metadata 的 `WWW-Authenticate` header 响应。这会告知 client 再次运行 OAuth flow。

#### SDK token verification primitives

Python 和 TypeScript MCP SDKs 都包含 helpers，因此你不必从零连接这一流程。

- [Python](https://github.com/modelcontextprotocol/python-sdk?tab=readme-ov-file#authentication)
- [TypeScript](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#proxy-authorization-requests-upstream)

## Testing 和 rollout

- **Local testing** – 从签发短生命周期 tokens 的 development tenant 开始，这样你可以快速迭代。
- **Dogfood** – 认证可用后，在广泛 rollout 前先向可信 testers 开放。你可以要求特定 tools 或整个 connector 进行 linking。
- **Rotation** – 为 token revocation、refresh 和 scope changes 做好计划。你的 server 应把缺失或陈旧 tokens 视为未认证，并返回有帮助的错误消息。
- **OAuth debugging** – 使用 [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) Auth settings 逐步走完每个 OAuth step，并在发布前定位 flow 断裂位置。

认证到位后，你就可以放心向 ChatGPT 用户暴露用户特定数据和写入动作。

## 触发 authentication UI

只有当你的 MCP server 发出 OAuth 可用或必要的信号时，ChatGPT 才会显示它的 OAuth linking UI。

触发 tool-level OAuth flow 需要 metadata（`securitySchemes` 和 resource metadata document）**以及** 携带 `_meta["mcp/www_authenticate"]` 的 runtime errors。没有这两部分，ChatGPT 不会为该工具显示 linking UI。

1. **发布 resource metadata。** MCP server 必须在 well-known URL（例如 `https://your-mcp.example.com/.well-known/oauth-protected-resource`）公开其 OAuth 配置。

2. **使用 `securitySchemes` 描述每个工具的 auth policy。** 按工具声明 `securitySchemes` 会告诉 ChatGPT 哪些工具需要 OAuth，哪些可以匿名运行。即使整个 server 使用相同策略，也请坚持按工具声明；server-level defaults 会让之后演进单个工具变得困难。

   目前可用两种 scheme types，并且你可以列出多个以表达 optional auth：
   - `noauth` — 该工具可匿名调用；ChatGPT 可以立即运行它。
   - `oauth2` — 该工具需要 OAuth 2.0 access token；请包含你将请求的 scopes，以便 consent screen 准确。

   如果你完全省略该数组，工具会继承 server 公告的任何 default。同时声明 `noauth` 和 `oauth2` 表示 ChatGPT 可以从匿名调用开始，但 linking 会解锁 privileged behavior。无论你向 client 传递什么信号，你的 server 仍必须在每次调用时验证 token、scopes 和 audience。

   示例（public + optional auth）– TypeScript SDK

```ts



   declare const server: McpServer;

   server.registerTool(
     "search",
     {
       title: "Public Search",
       description: "Search public documents.",
       inputSchema: {
         q: z.string(),
       },
       outputSchema: {},
       securitySchemes: [
         { type: "noauth" },
         { type: "oauth2", scopes: ["search.read"] },
       ],
     },
     async ({ q }) => {
       return {
         content: [{ type: "text", text: `Results for ${q}` }],
         structuredContent: {},
       };
     }
   );
```

   示例（auth required）– TypeScript SDK

```ts



   declare const server: McpServer;

   server.registerTool(
     "create_doc",
     {
       title: "Create Document",
       description: "Make a new doc in your account.",
       inputSchema: {
         title: z.string(),
       },
       outputSchema: {},
       securitySchemes: [{ type: "oauth2", scopes: ["docs.write"] }],
     },
     async ({ title }) => {
       return {
         content: [{ type: "text", text: `Created doc: ${title}` }],
         structuredContent: {},
       };
     }
   );
```

3. **在 tool handler 内检查 tokens，并在希望 ChatGPT 触发 authentication UI 时发出 `_meta["mcp/www_authenticate"]`。** 检查 token 并验证 issuer、audience、expiry 和 scopes。如果没有有效 token，返回包含 `_meta["mcp/www_authenticate"]` 的 error result，并确保其值同时包含 `error` 和 `error_description` parameter。这个 `WWW-Authenticate` payload 才是在步骤 1 和 2 就位后实际触发 tool-level OAuth UI 的内容。当 challenge 提示 reauthorization 时，你的 provider 可以在该 flow 期间 [保留用户已有登录上下文](/mirror/apps-sdk/build/auth#preserve-login-context-during-reauthorization)。

   示例

```json
   {
     "jsonrpc": "2.0",
     "id": 4,
     "result": {
       "content": [
         {
           "type": "text",
           "text": "Authentication required: no access token provided."
         }
       ],
       "_meta": {
         "mcp/www_authenticate": [
           "'Bearer resource_metadata=\"https://your-mcp.example.com/.well-known/oauth-protected-resource\", error=\"insufficient_scope\", error_description=\"You need to login to continue\"'"
         ]
       },
       "isError": true
     }
   }
```

:::

## English source

::: details 展开英文原文
::: v-pre
## Authenticate your users

Many Apps SDK apps can operate in a read-only, anonymous mode, but anything that exposes customer-specific data or write actions should authenticate users.

You can integrate with your own authorization server when you need to connect to an existing backend or share data between users.

## Custom auth with OAuth 2.1

For an authenticated MCP server, you are expected to implement an OAuth 2.1 flow that conforms to the [MCP authorization spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization).

### Components

- **Resource server** – your MCP server, which exposes tools and verifies access tokens on each request.
- **Authorization server** – your identity provider (Auth0, Okta, Cognito, or a custom implementation) that issues tokens and publishes discovery metadata.
- **Client** – ChatGPT acting on behalf of the user. It supports Client ID Metadata Documents (CIMD), dynamic client registration (DCR), predefined OAuth clients, and PKCE.

### MCP authorization spec requirements

- Host protected resource metadata on your MCP server
- Publish OAuth metadata from your authorization server
- Echo the `resource` parameter throughout the OAuth flow
- Choose how ChatGPT identifies or registers its OAuth client: CIMD, DCR, or a predefined OAuth client
- Publish the token endpoint authentication methods your authorization server accepts

Here is what the spec expects, in plain language.

#### Host protected resource metadata on your MCP server

- You need an HTTPS endpoint such as `GET https://your-mcp.example.com/.well-known/oauth-protected-resource` (or advertise the same URL in a `WWW-Authenticate` header on `401 Unauthorized` responses) so ChatGPT knows where to fetch your metadata.
- That endpoint returns a JSON document describing the resource server and its available authorization servers:

```json
{
  "resource": "https://your-mcp.example.com",
  "authorization_servers": ["https://auth.yourcompany.com"],
  "scopes_supported": ["files:read", "files:write"],
  "resource_documentation": "https://yourcompany.com/docs/mcp"
}
```

- Key fields you must populate:
  - `resource`: the canonical HTTPS identifier for your MCP server. ChatGPT sends this exact value as the `resource` query parameter during OAuth.
  - `authorization_servers`: one or more issuer base URLs that point to your identity provider. ChatGPT will try each to find OAuth metadata.
  - `scopes_supported`: optional list that helps ChatGPT explain the permissions it is going to ask the user for.
  - Optional extras from [RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728) such as `resource_documentation`, `token_endpoint_auth_methods_supported`, or `introspection_endpoint` make it easier for clients and admins to understand your setup.

When you block a request because it is unauthenticated, return a challenge like:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="https://your-mcp.example.com/.well-known/oauth-protected-resource",
                         scope="files:read"
```

That single header lets ChatGPT discover the metadata URL even if it has not seen it before.

#### Publish OAuth metadata from your authorization server

- Your identity provider must expose one of the well-known discovery documents so ChatGPT can read its configuration:
  - OAuth 2.0 metadata at `https://auth.yourcompany.com/.well-known/oauth-authorization-server`
  - OpenID Connect metadata at `https://auth.yourcompany.com/.well-known/openid-configuration`
- Each document answers three big questions for ChatGPT: where to send the user, how to exchange codes, and how to identify itself. A typical response looks like:

```json
{
  "issuer": "https://auth.yourcompany.com",
  "authorization_endpoint": "https://auth.yourcompany.com/oauth2/v1/authorize",
  "token_endpoint": "https://auth.yourcompany.com/oauth2/v1/token",
  "client_id_metadata_document_supported": true,
  "token_endpoint_auth_methods_supported": ["none", "private_key_jwt"],
  "registration_endpoint": "https://auth.yourcompany.com/oauth2/v1/register",
  "code_challenge_methods_supported": ["S256"],
  "scopes_supported": ["files:read", "files:write"]
}
```

- Fields that must be correct:
  - `authorization_endpoint`, `token_endpoint`: the URLs ChatGPT needs to run the OAuth authorization-code + PKCE flow end to end.
  - `client_id_metadata_document_supported`: set to `true` when you want ChatGPT to use CIMD for client registration. ChatGPT prioritizes CIMD when it is available, but the connector creator can choose DCR when both CIMD and DCR are available.
  - `token_endpoint_auth_methods_supported`: include the token endpoint authentication methods your authorization server accepts. This applies to CIMD, DCR, and predefined OAuth clients. For CIMD, ChatGPT supports `none` for public-client token exchange and `private_key_jwt` for signed client assertion token exchange. Other OAuth clients commonly use `none`, `client_secret_post`, or `client_secret_basic`.
  - `registration_endpoint`: include this when you support dynamic client registration (DCR), which lets ChatGPT create and reuse a dedicated `client_id` for the connector instance.
  - `code_challenge_methods_supported`: include `S256` if your authorization server advertises PKCE support.
  - Optional fields follow [RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414) / [OpenID Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html); include whatever helps your administrators configure policies.

#### OIDC scopes

- If your provider advertises OIDC scopes (e.g. `openid`, `email`, `profile`) in `scopes_supported` of its `.well-known/oauth-authorization-server` or `.well-known/openid-configuration` document, ChatGPT requests those scopes by default during the OAuth flow.
- Some identity providers may not enable advertised OIDC scopes by default. Check your provider's configuration settings and make sure every advertised scope is enabled for the OAuth client, whether it uses CIMD, was created manually, or was created through DCR.

#### Preserve login context during reauthorization

When ChatGPT reauthorizes an existing link, including to request additional OAuth scopes, it may include the prior OIDC ID token in the authorization request as the standard `id_token_hint` parameter. To let users grant additional scopes without starting login from scratch, configure your authorization server to issue an ID token during the original OAuth flow and honor `id_token_hint` during authorization.

This optimization is optional. Reauthorization still works when an ID token is unavailable or your authorization server does not use the hint.

#### Redirect URL

ChatGPT completes the OAuth flow by redirecting to `https://chatgpt.com/connector/oauth/{callback_id}` and the URL will be shown in the app management page. Add that production redirect URI to your authorization server's allowlist so the authorization code can be returned successfully.

- For apps that are already published, the previous legacy redirect URI `https://chatgpt.com/connector_platform_oauth_redirect` continues to work.

#### Echo the `resource` parameter throughout the OAuth flow

- Expect ChatGPT to append `resource=https%3A%2F%2Fyour-mcp.example.com` to both the authorization and token requests. This ties the token back to the protected resource metadata shown above.
- Configure your authorization server to copy that value into the access token (commonly the `aud` claim) so your MCP server can verify the token was minted for it and nobody else.
- If a token arrives without the expected audience or scopes, reject it and rely on the `WWW-Authenticate` challenge to prompt ChatGPT to re-authorize with the correct parameters.

#### Support the authorization-code flow

- ChatGPT, acting as the MCP client, performs the authorization-code flow with PKCE using the `S256` code challenge so intercepted authorization codes cannot be replayed by an attacker.
- If your authorization server publishes `code_challenge_methods_supported`, include `S256` so clients can confirm PKCE support from metadata.

### OAuth flow

Provided that you have implemented the MCP authorization spec delineated above, the OAuth flow will be as follows:

1. ChatGPT queries your MCP server for protected resource metadata.

![](/openai-assets/developers.openai.com/images/apps-sdk/protected_resource_metadata.png)

2. ChatGPT identifies itself as the OAuth client. When the connector uses CIMD, ChatGPT skips dynamic client registration and sends a CIMD document URL as the `client_id`, such as `https://chatgpt.com/oauth/.../client.json` (the exact URL is specific to the MCP server because the redirect URI is MCP-specific). When the connector uses DCR, ChatGPT calls your authorization server's `registration_endpoint` once for the connector instance, receives a generated `client_id`, and reuses that client for the instance.

When using CIMD, there is no client registration step. The following screen shows the DCR path:

![](/openai-assets/developers.openai.com/images/apps-sdk/client_registration.png)

3. When the user first invokes a tool, the ChatGPT client launches the OAuth authorization code + PKCE flow. The user authenticates and consents to the requested scopes.

![](/openai-assets/developers.openai.com/images/apps-sdk/preparing_authorization.png)

4. ChatGPT exchanges the authorization code for an access token and attaches it to subsequent MCP requests (`Authorization: Bearer &lt;token&gt;`).

![](/openai-assets/developers.openai.com/images/apps-sdk/auth_complete.png)

5. Your server verifies the token on each request (issuer, audience, expiration, scopes) before executing the tool.

### Client registration

Use [Client ID Metadata Documents (CIMD)](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#client-id-metadata-documents) as the preferred client registration method when your authorization server supports it and the connector creator chooses it. With CIMD, ChatGPT uses an HTTPS metadata document URL as its `client_id`. Your authorization server fetches that document, validates the published client metadata and redirect URIs, and treats the URL as ChatGPT's stable client identity.

If you support CIMD, set `client_id_metadata_document_supported: true` in your authorization server metadata. This lets ChatGPT use one stable client identity for connectors that choose CIMD, which your authorization server can use for redirect URI allowlists, rate limits, and other policies.

ChatGPT supports two token endpoint authentication methods for CIMD-backed clients:

- `none`: use this public-client flow when your token endpoint supports PKCE-based authorization-code exchange without client authentication. ChatGPT does not store a per-client secret.
- `private_key_jwt`: use this signed client assertion flow when your token endpoint requires client authentication. ChatGPT publishes CIMD metadata with `token_endpoint_auth_method: "private_key_jwt"` and a public JWKS URL. The JWKS is served from `/oauth/jwks.json` on the metadata origin. ChatGPT signs token requests server-side with a managed private key and `kid`; your authorization server verifies the assertion against the public JWKS.

DCR is still supported. If you include `registration_endpoint`, ChatGPT can register dynamically when the connector creator chooses DCR or CIMD is not available. ChatGPT runs DCR once per connector instance, then keeps and reuses the registered OAuth client for that instance. DCR can still create many registered clients across many separate connector instances, so CIMD is usually easier to administer at scale.

### Client identification

A frequent question is how your MCP server can confirm that a request actually comes from ChatGPT. ChatGPT presents an OpenAI-managed client certificate when connecting to MCP servers, so you can verify the client at the transport layer with mTLS. You can also allowlist ChatGPT’s [published egress IP ranges](/mirror/api/docs/guides/ip-addresses). ChatGPT does **not** support machine-to-machine OAuth grants such as client credentials, service accounts, or JWT bearer assertions, nor can it present custom API keys or customer-provided mTLS certificates.

CIMD further strengthens client identification by giving your authorization server a stable, HTTPS-hosted declaration of ChatGPT’s identity. When you use `private_key_jwt`, verify ChatGPT's token endpoint client assertion against the public JWKS published in the CIMD metadata.

### Mutual TLS (mTLS)

ChatGPT now presents an OpenAI-managed client certificate when establishing TLS connections to MCP servers. If your application validates client certificates, configure it to trust the OpenAI certificate chain below.

- &lt;a href="/apps-sdk/mtls/openai-root-ca.pem" download&gt;
    Download OpenAI Root CA

- &lt;a href="/apps-sdk/mtls/openai-connectors-mtls-ca.pem" download&gt;
    Download OpenAI Connectors mTLS intermediate CA


To validate the client certificate when establishing the TLS connection to your MCP server:

- Verify a leaf certificate is present and chains to the OpenAI Connectors mTLS intermediate CA.
- Verify the leaf certificate is valid for client authentication.
- Verify the leaf certificate’s SAN `dnsName` is `mtls.prod.connectors.openai.com`.
- Avoid pinning a leaf certificate fingerprint; OpenAI may rotate the leaf certificate while keeping it under the published CA chain.

Use mTLS to authenticate ChatGPT as the MCP client. Continue to use OAuth 2.1 to authenticate the end user and authorize tool access.

### Choosing an identity provider

Most OAuth 2.1 identity providers can satisfy the MCP authorization requirements once they expose a discovery document, support CIMD with `none` or `private_key_jwt`, support DCR when needed, and echo the `resource` parameter into issued tokens. Prefer providers that support CIMD for client registration.

We _strongly_ recommend that you use an existing established identity provider rather than implementing authentication from scratch yourself.

Here are instructions for some popular identity providers.

#### Auth0

Auth0 enables MCP clients to securely connect to MCP servers by providing metadata discovery, CIMD registration, API security, and token exchange for first- and third-party tool calls.

- [Guide to configuring Auth0 for MCP authorization](https://github.com/openai/openai-mcpkit/blob/main/python-authenticated-mcp-server-scaffold/README.md#2-configure-auth0-authentication)
- [Auth0 securing MCP servers overview](https://auth0.com/ai/docs/mcp/intro/overview)
- [Auth0 securing MCP servers quickstarts](https://auth0.com/ai/docs/mcp/get-started/overview)

#### Stytch

- [Guide to configuring Stytch for MCP authorization](https://stytch.com/docs/guides/connected-apps/mcp-server-overview)
- [Overview guide to MCP authorization](https://stytch.com/blog/MCP-authentication-and-authorization-guide/)
- [Overview guide to MCP authorization specifically for Apps SDK](https://stytch.com/blog/guide-to-authentication-for-the-openai-apps-sdk/)

### Implementing token verification

When the OAuth flow finishes, ChatGPT simply attaches the access token it received to subsequent MCP requests (`Authorization: Bearer …`). Once a request reaches your MCP server you must assume the token is untrusted and perform the full set of resource-server checks yourself—signature validation, issuer and audience matching, expiry, replay considerations, and scope enforcement. That responsibility sits with you, not with ChatGPT.

In practice you should:

- Fetch the signing keys published by your authorization server (usually via JWKS) and verify the token’s signature and `iss`.
- Reject tokens that have expired or have not yet become valid (`exp`/`nbf`).
- Confirm the token was minted for your server (`aud` or the `resource` claim) and contains the scopes you marked as required.
- Run any app-specific policy checks, then either attach the resolved identity to the request context or return a `401` with a `WWW-Authenticate` challenge.

If verification fails, respond with `401 Unauthorized` and a `WWW-Authenticate` header that points back to your protected-resource metadata. This tells the client to run the OAuth flow again.

#### SDK token verification primitives

Both Python and TypeScript MCP SDKs include helpers so you do not have to wire this from scratch.

- [Python](https://github.com/modelcontextprotocol/python-sdk?tab=readme-ov-file#authentication)
- [TypeScript](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#proxy-authorization-requests-upstream)

## Testing and rollout

- **Local testing** – start with a development tenant that issues short-lived tokens so you can iterate quickly.
- **Dogfood** – once authentication works, gate access to trusted testers before rolling out broadly. You can require linking for specific tools or the entire connector.
- **Rotation** – plan for token revocation, refresh, and scope changes. Your server should treat missing or stale tokens as unauthenticated and return a helpful error message.
- **OAuth debugging** – use the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) Auth settings to walk through each OAuth step and pinpoint where the flow breaks before you ship.

With authentication in place you can confidently expose user-specific data and write actions to ChatGPT users.

## Triggering authentication UI

ChatGPT only surfaces its OAuth linking UI when your MCP server signals that OAuth is available or necessary.

Triggering the tool-level OAuth flow requires both metadata (`securitySchemes` and the resource metadata document) **and** runtime errors that carry `_meta["mcp/www_authenticate"]`. Without both halves ChatGPT will not show the linking UI for that tool.

1. **Publish resource metadata.** The MCP server must expose its OAuth configuration at a well-known URL such as `https://your-mcp.example.com/.well-known/oauth-protected-resource`.

2. **Describe each tool’s auth policy with `securitySchemes`.** Declaring `securitySchemes` per tool tells ChatGPT which tools require OAuth versus which can run anonymously. Stick to per-tool declarations even if the entire server uses the same policy; server-level defaults make it difficult to evolve individual tools later.

   Two scheme types are available today, and you can list more than one to express optional auth:
   - `noauth` — the tool is callable anonymously; ChatGPT can run it immediately.
   - `oauth2` — the tool needs an OAuth 2.0 access token; include the scopes you will request so the consent screen is accurate.

   If you omit the array entirely, the tool inherits whatever default the server advertises. Declaring both `noauth` and `oauth2` tells ChatGPT it can start with anonymous calls but that linking unlocks privileged behavior. Regardless of what you signal to the client, your server must still verify the token, scopes, and audience on every invocation.

   Example (public + optional auth) – TypeScript SDK

```ts



   declare const server: McpServer;

   server.registerTool(
     "search",
     {
       title: "Public Search",
       description: "Search public documents.",
       inputSchema: {
         q: z.string(),
       },
       outputSchema: {},
       securitySchemes: [
         { type: "noauth" },
         { type: "oauth2", scopes: ["search.read"] },
       ],
     },
     async ({ q }) => {
       return {
         content: [{ type: "text", text: `Results for ${q}` }],
         structuredContent: {},
       };
     }
   );
```

   Example (auth required) – TypeScript SDK

```ts



   declare const server: McpServer;

   server.registerTool(
     "create_doc",
     {
       title: "Create Document",
       description: "Make a new doc in your account.",
       inputSchema: {
         title: z.string(),
       },
       outputSchema: {},
       securitySchemes: [{ type: "oauth2", scopes: ["docs.write"] }],
     },
     async ({ title }) => {
       return {
         content: [{ type: "text", text: `Created doc: ${title}` }],
         structuredContent: {},
       };
     }
   );
```

3. **Check tokens inside the tool handler and emit `_meta["mcp/www_authenticate"]`** when you want ChatGPT to trigger the authentication UI. Inspect the token and verify issuer, audience, expiry, and scopes. If no valid token is present, return an error result that includes `_meta["mcp/www_authenticate"]` and make sure the value contains both an `error` and `error_description` parameter. This `WWW-Authenticate` payload is what actually triggers the tool-level OAuth UI once steps 1 and 2 are in place. When a challenge prompts reauthorization, your provider can [preserve the user's existing login context](/mirror/apps-sdk/build/auth#preserve-login-context-during-reauthorization) during that flow.

   Example

```json
   {
     "jsonrpc": "2.0",
     "id": 4,
     "result": {
       "content": [
         {
           "type": "text",
           "text": "Authentication required: no access token provided."
         }
       ],
       "_meta": {
         "mcp/www_authenticate": [
           "'Bearer resource_metadata=\"https://your-mcp.example.com/.well-known/oauth-protected-resource\", error=\"insufficient_scope\", error_description=\"You need to login to continue\"'"
         ]
       },
       "isError": true
     }
   }
```

:::
:::

