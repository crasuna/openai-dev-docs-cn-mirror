---
status: needs-review
sourceId: "dbc39d56ebf6"
sourceChecksum: "dbc39d56ebf6b6ec99a40f10a230a5880d06ea973d45edea8e470260f9290a09"
sourceUrl: "https://developers.openai.com/apps-sdk/build/auth"
translatedAt: "2026-06-27T19:35:17.0701114+08:00"
translator: codex-gpt-5.5-xhigh
---

# 认证

## 认证你的用户

许多 Apps SDK apps 可以在只读、匿名模式下运行，但任何会暴露客户特定数据或写入动作的内容都应认证用户。

当你需要连接现有后端或在用户之间共享数据时，可以集成自己的 authorization server。

## 使用 OAuth 2.1 的自定义认证

对于需要认证的 MCP server，你应实现符合 [MCP 授权规范](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization) 的 OAuth 2.1 流程。

### 组件

- **Resource server（资源服务器）** – 你的 MCP server，它公开工具，并在每个请求上验证访问令牌。
- **Authorization server（授权服务器）** – 你的身份提供商（Auth0、Okta、Cognito 或自定义实现），用于签发令牌并发布发现元数据。
- **Client（客户端）** – 代表用户行动的 ChatGPT。它支持 Client ID Metadata Documents（CIMD）、dynamic client registration（DCR）、预定义 OAuth clients 和 PKCE。

### MCP 授权规范要求

- 在你的 MCP server 上托管受保护资源元数据
- 从你的授权服务器发布 OAuth 元数据
- 在整个 OAuth 流程中回显 `resource` 参数
- 选择 ChatGPT 如何识别或注册其 OAuth client：CIMD、DCR 或预定义 OAuth client
- 发布你的授权服务器接受的 token endpoint 认证方法

下面用普通语言说明该规范的预期。

#### 在你的 MCP server 上托管受保护资源元数据

- 你需要一个 HTTPS endpoint，例如 `GET https://your-mcp.example.com/.well-known/oauth-protected-resource`（或者在 `401 Unauthorized` 响应的 `WWW-Authenticate` header 中公告同一个 URL），以便 ChatGPT 知道到哪里获取你的元数据。
- 该 endpoint 返回一个 JSON 文档，描述 resource server 及其可用的授权服务器：

```json
{
  "resource": "https://your-mcp.example.com",
  "authorization_servers": ["https://auth.yourcompany.com"],
  "scopes_supported": ["files:read", "files:write"],
  "resource_documentation": "https://yourcompany.com/docs/mcp"
}
```

- 你必须填充的关键字段：
  - `resource`：你的 MCP server 的规范 HTTPS 标识符。ChatGPT 会在 OAuth 期间把这个精确值作为 `resource` 查询参数发送。
  - `authorization_servers`：一个或多个指向你的身份提供商的 issuer base URL。ChatGPT 会逐一尝试以查找 OAuth 元数据。
  - `scopes_supported`：可选列表，帮助 ChatGPT 向用户解释即将请求的权限。
  - 来自 [RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728) 的可选附加项，例如 `resource_documentation`、`token_endpoint_auth_methods_supported` 或 `introspection_endpoint`，可以让客户端和管理员更容易理解你的设置。

当你因请求未认证而阻止它时，返回如下质询：

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="https://your-mcp.example.com/.well-known/oauth-protected-resource",
                         scope="files:read"
```

即使 ChatGPT 之前没有见过这个元数据 URL，这个单一 header 也能让它发现该 URL。

#### 从你的授权服务器发布 OAuth 元数据

- 你的身份提供商必须公开以下 well-known 发现文档之一，方便 ChatGPT 读取其配置：
  - 位于 `https://auth.yourcompany.com/.well-known/oauth-authorization-server` 的 OAuth 2.0 元数据
  - 位于 `https://auth.yourcompany.com/.well-known/openid-configuration` 的 OpenID Connect 元数据
- 每个文档都会为 ChatGPT 回答三个关键问题：把用户发送到哪里、如何交换授权码，以及如何识别自己。典型响应如下：

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
  - `authorization_endpoint`、`token_endpoint`：ChatGPT 端到端运行 OAuth authorization-code + PKCE 流程所需的 URL。
  - `client_id_metadata_document_supported`：当你希望 ChatGPT 使用 CIMD 进行客户端注册时，将其设为 `true`。ChatGPT 会在可用时优先使用 CIMD，但当 CIMD 和 DCR 都可用时，connector 创建者可以选择 DCR。
  - `token_endpoint_auth_methods_supported`：包含你的授权服务器接受的 token endpoint 认证方法。这适用于 CIMD、DCR 和预定义 OAuth clients。对于 CIMD，ChatGPT 支持 `none` 用于 public-client token exchange，支持 `private_key_jwt` 用于 signed client assertion token exchange。其他 OAuth clients 常用 `none`、`client_secret_post` 或 `client_secret_basic`。
  - `registration_endpoint`：当你支持 dynamic client registration（DCR）时包含它，这让 ChatGPT 可以为 connector instance 创建并复用专用 `client_id`。
  - `code_challenge_methods_supported`：如果你的授权服务器公告 PKCE 支持，请包含 `S256`。
  - 可选字段遵循 [RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414) / [OpenID Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html)；包含任何有助于管理员配置策略的内容。

#### OIDC scope

- 如果你的提供商在其 `.well-known/oauth-authorization-server` 或 `.well-known/openid-configuration` 文档的 `scopes_supported` 中公告 OIDC scopes（例如 `openid`、`email`、`profile`），ChatGPT 默认会在 OAuth 流程期间请求这些 scopes。
- 某些身份提供商可能默认不启用已公告的 OIDC scopes。请检查你的提供商配置设置，并确保每个已公告 scope 都对 OAuth client 启用，无论它使用 CIMD、手动创建，还是通过 DCR 创建。

<a id="preserve-login-context-during-reauthorization"></a>

#### 在重新授权期间保留登录上下文

当 ChatGPT 对现有链接重新授权（包括请求额外 OAuth scopes）时，它可能会在 authorization request 中以标准 `id_token_hint` 参数包含之前的 OIDC ID token。若要让用户无需从头登录即可授予额外 scopes，请配置你的授权服务器，在原始 OAuth 流程中签发 ID token，并在授权期间遵循 `id_token_hint`。

此优化是可选的。当 ID token 不可用或你的授权服务器不使用该 hint 时，重新授权仍然可以工作。

#### 重定向 URL

ChatGPT 通过重定向到 `https://chatgpt.com/connector/oauth/{callback_id}` 来完成 OAuth 流程，该 URL 会显示在应用管理页面中。请把这个 production redirect URI 添加到你的授权服务器 allowlist，以便 authorization code 能成功返回。

- 对于已经发布的应用，之前的 legacy redirect URI `https://chatgpt.com/connector_platform_oauth_redirect` 会继续工作。

#### 在整个 OAuth 流程中回显 `resource` 参数

- 预期 ChatGPT 会向 authorization 和 token requests 都追加 `resource=https%3A%2F%2Fyour-mcp.example.com`。这会把 token 绑定回上面显示的受保护资源元数据。
- 配置你的授权服务器，把该值复制到 access token 中（通常是 `aud` claim），这样你的 MCP server 可以验证 token 是为它而非其他对象签发的。
- 如果 token 到达时没有预期的 audience 或 scopes，请拒绝它，并依赖 `WWW-Authenticate` challenge 提示 ChatGPT 用正确参数重新授权。

#### 支持 authorization-code 流程

- ChatGPT 作为 MCP client，会使用带有 `S256` code challenge 的 PKCE 执行 authorization-code 流程，这样被截获的 authorization codes 就不能被攻击者重放。
- 如果你的授权服务器发布 `code_challenge_methods_supported`，请包含 `S256`，以便客户端能从元数据确认 PKCE 支持。

### OAuth 流程

如果你已实现上述 MCP 授权规范，OAuth 流程将如下进行：

1. ChatGPT 查询你的 MCP server 以获取受保护资源元数据。

![](https://developers.openai.com/images/apps-sdk/protected_resource_metadata.png)

2. ChatGPT 将自己识别为 OAuth client。当 connector 使用 CIMD 时，ChatGPT 跳过 dynamic client registration，并发送 CIMD 文档 URL 作为 `client_id`，例如 `https://chatgpt.com/oauth/.../client.json`（确切 URL 与 MCP server 相关，因为 redirect URI 是 MCP-specific）。当 connector 使用 DCR 时，ChatGPT 会为 connector instance 调用一次你的授权服务器的 `registration_endpoint`，收到生成的 `client_id`，并为该 instance 复用该 client。

使用 CIMD 时，没有客户端注册步骤。下面的屏幕展示 DCR 路径：

![](https://developers.openai.com/images/apps-sdk/client_registration.png)

3. 当用户首次调用工具时，ChatGPT client 启动 OAuth authorization code + PKCE 流程。用户认证并同意所请求的 scopes。

![](https://developers.openai.com/images/apps-sdk/preparing_authorization.png)

4. ChatGPT 用 authorization code 交换 access token，并将其附加到后续 MCP 请求（`Authorization: Bearer <token>`）。

![](https://developers.openai.com/images/apps-sdk/auth_complete.png)

5. 你的 server 在每个请求上验证 token（issuer、audience、expiration、scopes），然后再执行工具。

### 客户端注册

当你的授权服务器支持且 connector 创建者选择它时，请优先使用 [Client ID Metadata Documents (CIMD)](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#client-id-metadata-documents) 作为客户端注册方法。使用 CIMD 时，ChatGPT 使用 HTTPS 元数据文档 URL 作为其 `client_id`。你的授权服务器会获取该文档、验证已发布的 client metadata 和 redirect URIs，并将该 URL 视为 ChatGPT 的稳定 client identity。

如果你支持 CIMD，请在授权服务器元数据中设置 `client_id_metadata_document_supported: true`。这让 ChatGPT 能为选择 CIMD 的 connectors 使用一个稳定 client identity，你的授权服务器可以据此配置 redirect URI allowlists、rate limits 和其他策略。

ChatGPT 对 CIMD-backed clients 支持两种 token endpoint 认证方法：

- `none`：当你的 token endpoint 支持基于 PKCE 的 authorization-code exchange 且不需要 client authentication 时，使用此 public-client flow。ChatGPT 不会存储每个 client 的 secret。
- `private_key_jwt`：当你的 token endpoint 需要 client authentication 时，使用此 signed client assertion flow。ChatGPT 会发布包含 `token_endpoint_auth_method: "private_key_jwt"` 和 public JWKS URL 的 CIMD metadata。JWKS 从 metadata origin 上的 `/oauth/jwks.json` 提供。ChatGPT 在 server-side 使用托管 private key 和 `kid` 签署 token requests；你的 authorization server 根据 public JWKS 验证 assertion。

DCR 仍受支持。如果你包含 `registration_endpoint`，当 connector 创建者选择 DCR 或 CIMD 不可用时，ChatGPT 可以动态注册。ChatGPT 会为每个 connector instance 运行一次 DCR，然后保留并复用为该 instance 注册的 OAuth client。DCR 仍可能在许多独立 connector instances 中创建大量已注册 clients，因此 CIMD 通常更容易大规模管理。

### 客户端身份识别

一个常见问题是你的 MCP server 如何确认请求确实来自 ChatGPT。ChatGPT 在连接 MCP servers 时会呈现 OpenAI-managed client certificate，因此你可以通过 mTLS 在传输层验证 client。你也可以将 ChatGPT 的 [published egress IP ranges](https://developers.openai.com/api/docs/guides/ip-addresses) 加入允许列表。ChatGPT **不** 支持 machine-to-machine OAuth grants，例如 client credentials、service accounts 或 JWT bearer assertions，也不能呈现自定义 API keys 或 customer-provided mTLS certificates。

CIMD 通过向你的授权服务器提供一个稳定、HTTPS-hosted 的 ChatGPT identity 声明，进一步增强客户端身份识别。使用 `private_key_jwt` 时，请根据 CIMD metadata 中发布的 public JWKS 验证 ChatGPT 的 token endpoint client assertion。

### 双向 TLS (mTLS)

ChatGPT 现在在与 MCP servers 建立 TLS 连接时会呈现 OpenAI-managed client certificate。如果你的应用验证 client certificates，请配置它信任下面的 OpenAI 证书链。

- <a href="/apps-sdk/mtls/openai-root-ca.pem" download>
    下载 OpenAI Root CA
  </a>
- <a href="/apps-sdk/mtls/openai-connectors-mtls-ca.pem" download>
    下载 OpenAI Connectors mTLS intermediate CA
  </a>

在与 MCP server 建立 TLS 连接时验证 client certificate：

- 验证 leaf certificate 存在，并链到 OpenAI Connectors mTLS intermediate CA。
- 验证 leaf certificate 对 client authentication 有效。
- 验证 leaf certificate 的 SAN `dnsName` 为 `mtls.prod.connectors.openai.com`。
- 避免固定 leaf certificate fingerprint；OpenAI 可能在保持其位于已发布 CA chain 下的同时轮换 leaf certificate。

使用 mTLS 将 ChatGPT 认证为 MCP client。继续使用 OAuth 2.1 认证最终用户并授权工具访问。

### 选择身份提供商

大多数 OAuth 2.1 身份提供商只要公开发现文档、支持使用 `none` 或 `private_key_jwt` 的 CIMD、在需要时支持 DCR，并把 `resource` 参数回显到已签发 tokens 中，就能满足 MCP 授权要求。优先选择支持 CIMD 进行客户端注册的提供商。

我们 _强烈_ 建议你使用现有成熟身份提供商，而不是从零开始自行实现认证。

下面是一些热门身份提供商的说明。

#### Auth0

Auth0 通过提供元数据发现、CIMD 注册、API 安全性，以及第一方和第三方工具调用的 token exchange，使 MCP clients 能安全连接到 MCP servers。

- [Guide to configuring Auth0 for MCP authorization](https://github.com/openai/openai-mcpkit/blob/main/python-authenticated-mcp-server-scaffold/README.md#2-configure-auth0-authentication)
- [Auth0 securing MCP servers overview](https://auth0.com/ai/docs/mcp/intro/overview)
- [Auth0 securing MCP servers quickstarts](https://auth0.com/ai/docs/mcp/get-started/overview)

#### Stytch

- [Guide to configuring Stytch for MCP authorization](https://stytch.com/docs/guides/connected-apps/mcp-server-overview)
- [Overview guide to MCP authorization](https://stytch.com/blog/MCP-authentication-and-authorization-guide/)
- [Overview guide to MCP authorization specifically for Apps SDK](https://stytch.com/blog/guide-to-authentication-for-the-openai-apps-sdk/)

### 实现令牌验证

当 OAuth 流程完成后，ChatGPT 只是把它收到的 access token 附加到后续 MCP 请求（`Authorization: Bearer …`）。一旦请求到达你的 MCP server，你必须假设 token 不可信，并自行执行完整的 resource-server 检查，包括 signature validation、issuer 和 audience matching、expiry、replay considerations，以及 scope enforcement。这项责任在你，而不在 ChatGPT。

实际操作中你应：

- 获取你的 authorization server 发布的 signing keys（通常通过 JWKS），并验证 token 的 signature 和 `iss`。
- 拒绝已经过期或尚未生效的 tokens（`exp`/`nbf`）。
- 确认 token 是为你的 server 签发的（`aud` 或 `resource` claim），并包含你标记为 required 的 scopes。
- 运行任何应用特定策略检查，然后将解析出的 identity 附加到 request context，或返回带有 `WWW-Authenticate` challenge 的 `401`。

如果验证失败，请以 `401 Unauthorized` 和指向你的 protected-resource metadata 的 `WWW-Authenticate` header 响应。这会告知 client 再次运行 OAuth 流程。

#### SDK 令牌验证原语

Python 和 TypeScript MCP SDKs 都包含辅助函数，因此你不必从零连接这一流程。

- [Python](https://github.com/modelcontextprotocol/python-sdk?tab=readme-ov-file#authentication)
- [TypeScript](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#proxy-authorization-requests-upstream)

## 测试和逐步发布

- **本地测试** – 从签发短生命周期 tokens 的 development tenant 开始，这样你可以快速迭代。
- **内部试用** – 认证可用后，在广泛发布前先向可信测试者开放。你可以要求特定 tools 或整个 connector 进行 linking。
- **轮换** – 为 token revocation、refresh 和 scope changes 做好计划。你的 server 应把缺失或陈旧 tokens 视为未认证，并返回有帮助的错误消息。
- **OAuth debugging** – 使用 [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) Auth settings 逐步走完每个 OAuth step，并在发布前定位 flow 断裂位置。

认证到位后，你就可以放心向 ChatGPT 用户暴露用户特定数据和写入动作。

## 触发认证 UI

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

3. **在 tool handler 内检查 tokens，并在希望 ChatGPT 触发 authentication UI 时发出 `_meta["mcp/www_authenticate"]`。** 检查 token 并验证 issuer、audience、expiry 和 scopes。如果没有有效 token，返回包含 `_meta["mcp/www_authenticate"]` 的 error result，并确保其值同时包含 `error` 和 `error_description` parameter。这个 `WWW-Authenticate` payload 才是在步骤 1 和 2 就位后实际触发 tool-level OAuth UI 的内容。当 challenge 提示 reauthorization 时，你的 provider 可以在该 flow 期间 [保留用户已有登录上下文](#preserve-login-context-during-reauthorization)。

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
