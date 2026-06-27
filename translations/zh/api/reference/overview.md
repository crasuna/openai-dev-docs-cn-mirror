---
status: needs-review
sourceId: "bbf7f5a7be99"
sourceChecksum: "bbf7f5a7be998c3dc64ce9aa77cfdb5d6c5b40688c550a22561c5bea65d527f9"
sourceUrl: "https://developers.openai.com/api/reference/overview"
translatedAt: "2026-06-27T18:23:48.7352177+08:00"
translator: codex-gpt-5.5-xhigh
---

# API 概览

使用本 reference 查询 OpenAI API endpoints、请求和响应 schema、streaming events、client library methods，以及身份验证、错误、rate limits 和 request IDs 等共享行为。

## 从这里开始

1. 为你的应用选择 API surface：
   - [Responses](https://developers.openai.com/api/reference/responses/overview)：用于直接模型请求、工具使用、音频、图像和文本输入，以及有状态交互。
   - [Realtime API](https://developers.openai.com/api/docs/guides/realtime)：用于通过 WebRTC、WebSocket 或 SIP 进行低延迟语音或音频会话。构建会话时请参考 [client events](https://developers.openai.com/api/reference/resources/realtime/client-events) 和 [server events](https://developers.openai.com/api/reference/resources/realtime/server-events) reference。
   - [Administration](https://developers.openai.com/api/reference/administration/overview)：用于组织工作流，例如用户、邀请、项目、API keys 和审计日志。
2. 创建凭据。对应用请求使用标准 [API key](https://platform.openai.com/settings/organization/api-keys)，对 Administration endpoints 使用 [Admin API key](https://platform.openai.com/settings/organization/admin-keys)，或使用 [workload identity federation](https://developers.openai.com/api/docs/guides/workload-identity-federation) 获取短期 access tokens。
3. 从 [libraries page](https://developers.openai.com/api/docs/libraries) 安装官方 client library，或从任何支持 HTTP requests 的环境直接调用 HTTP API。
4. 使用 [developer quickstart](https://developers.openai.com/api/docs/quickstart) 发出第一个请求，或直接查看 [Responses create reference](https://developers.openai.com/api/reference/resources/responses/methods/create)。
5. 上线生产前，请查看下面的 [error codes](https://developers.openai.com/api/docs/guides/error-codes)、[rate limits](https://developers.openai.com/api/docs/guides/rate-limits) 和 request ID 日志记录。

## 身份验证

OpenAI API 接受来自 API keys 的 bearer credentials，或接受通过 [workload identity federation](https://developers.openai.com/api/docs/guides/workload-identity-federation) 创建的短期 access tokens。

**请记住，你的 API key 是秘密。** 不要与他人共享，也不要在浏览器或应用等任何客户端代码中暴露它。请在服务器上从环境变量或密钥管理服务加载 API keys。

使用 [HTTP Bearer authentication](https://swagger.io/docs/specification/v3_0/authentication/bearer-authentication/) 提供 API credentials。

```bash
Authorization: Bearer OPENAI_API_KEY_OR_ACCESS_TOKEN
```

如果你属于多个组织，或通过旧版 user API key 访问项目，请传入 header 来指定该 API request 要使用的组织和项目：

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "OpenAI-Organization: $ORGANIZATION_ID" \
  -H "OpenAI-Project: $PROJECT_ID"
```

这些 API requests 的用量会计入指定组织和项目。你可以在 [dashboard settings](https://platform.openai.com/settings/organization/general) 中找到组织和项目 ID。

## 调试请求

[Error codes](https://developers.openai.com/api/docs/guides/error-codes) 描述 API responses 返回的失败。请检查 HTTP response headers，以获取请求的唯一 ID 和 rate limit 详情。常见 response headers 包括：

**API 元信息**

- `openai-organization`：与该请求关联的[组织](https://developers.openai.com/api/docs/guides/production-best-practices#setting-up-your-organization)
- `openai-processing-ms`：处理你的 API request 所花的时间
- `openai-version`：该请求使用的 REST API 版本（当前为 `2020-10-01`）
- `x-request-id`：该 API request 的唯一标识符（用于故障排查）

**[Rate limiting 信息](https://developers.openai.com/api/docs/guides/rate-limits)**

- `x-ratelimit-limit-requests`
- `x-ratelimit-limit-tokens`
- `x-ratelimit-remaining-requests`
- `x-ratelimit-remaining-tokens`
- `x-ratelimit-reset-requests`
- `x-ratelimit-reset-tokens`
- `x-ratelimit-limit-project-tokens`
- `x-ratelimit-remaining-project-tokens`
- `x-ratelimit-reset-project-tokens`

当适用 project-scoped token limit 时，可能会出现 project-token headers。

**OpenAI 建议在生产部署中记录 request IDs**，以便在需要时与[支持团队](https://help.openai.com/en/)更高效地排查问题。官方 [client libraries](https://developers.openai.com/api/docs/libraries) 会在顶层 response objects 上提供一个属性，其中包含 `x-request-id` header 的值。

### 使用 `X-Client-Request-Id` 提供你自己的 request ID

除了服务器生成的 `x-request-id`，你还可以通过 `X-Client-Request-Id` request header 为每个请求提供自己的唯一标识符。此 header 不会自动添加；你必须在请求上显式设置它。

当你包含 `X-Client-Request-Id` 时：

- 你可以控制 ID 格式（例如 UUID 或内部 trace ID），但它必须只包含 ASCII 字符，并且长度不超过 512 个字符；否则，请求会以 400 error 失败。请确保该值对每个请求都是唯一的。

- OpenAI 会为受支持的 endpoints 在内部记录此值，包括 chat/completions、embeddings、responses 等。

- 在 timeout 或网络问题等无法获取 `X-Request-Id` response header 的情况下，你可以把 `X-Client-Request-Id` 值分享给支持团队，用于查询 OpenAI 是否以及何时收到了该请求。

**示例：**

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "X-Client-Request-Id: 123e4567-e89b-12d3-a456-426614174000"
```

## 向后兼容性

OpenAI 通过尽可能避免在主要 API 版本中引入 breaking changes，为 API 用户提供稳定性。这包括：

- REST API（当前为 `v1`）
- 第一方 [client libraries](https://developers.openai.com/api/docs/libraries)（已发布的 libraries 遵循[语义化版本](https://semver.org/)）
- [Model](https://developers.openai.com/api/docs/models) families（例如 `gpt-4o` 或 `o4-mini`）

**不同 snapshots 之间的模型 prompting 行为可能发生变化**。
模型输出本质上具有可变性，因此应预期 snapshots 之间的 prompting 和模型行为会有变化。确保 prompting 行为和模型输出保持一致的最佳方式，是使用 pinned model versions，并为你的应用运行 [evals](https://developers.openai.com/api/docs/guides/evals)。

**向后兼容的 API changes**：

- 向 REST API 和 client libraries 添加新 resources（URLs）
- 添加新的可选 API parameters
- 向 JSON response objects 或 event data 添加新 properties
- 改变 JSON response object 中 properties 的顺序
- 改变 opaque strings（例如 resource identifiers）的长度或格式
- 在 streaming APIs 中添加新的 event types

请参阅 [changelog](https://developers.openai.com/api/docs/changelog)，了解向后兼容 changes 和少见 breaking changes 的列表。
