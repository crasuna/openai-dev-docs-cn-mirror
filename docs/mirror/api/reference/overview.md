---
title: "API 概览"
description: "API Overview"
outline: deep
---

# API 概览

**文档集**：API Reference 参考<br>
**分组**：OpenAI API — 参考<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/reference/overview](https://developers.openai.com/api/reference/overview)
- Markdown 来源：[https://developers.openai.com/api/reference/overview.md](https://developers.openai.com/api/reference/overview.md)
- 抓取时间：2026-06-27T05:54:15.446Z
- Checksum：`bbf7f5a7be998c3dc64ce9aa77cfdb5d6c5b40688c550a22561c5bea65d527f9`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用本参考文档查询 OpenAI API 端点、请求和响应 schema、流式事件、客户端库方法，以及身份验证、错误、速率限制和请求 ID 等共享行为。

## 从这里开始

1. 为你的应用选择 API：
   - [Responses](/mirror/api/reference/responses/overview)：用于直接模型请求、工具使用、音频、图像和文本输入，以及有状态交互。
   - [Realtime API](/mirror/api/docs/guides/realtime)：用于通过 WebRTC、WebSocket 或 SIP 进行低延迟语音或音频会话。构建会话时请参考[客户端事件](https://developers.openai.com/api/reference/resources/realtime/client-events)和[服务器事件](https://developers.openai.com/api/reference/resources/realtime/server-events)参考。
   - [Administration](/mirror/api/reference/administration/overview)：用于组织工作流，例如用户、邀请、项目、API key 和审计日志。
2. 创建凭据。对应用请求使用标准 [API key](https://platform.openai.com/settings/organization/api-keys)，对 Administration 端点使用 [Admin API key](https://platform.openai.com/settings/organization/admin-keys)，或使用[工作负载身份联合](/mirror/api/docs/guides/workload-identity-federation)获取短期 access token。
3. 从[库页面](/mirror/api/docs/libraries)安装官方客户端库，或从任何支持 HTTP 请求的环境直接调用 HTTP API。
4. 使用[开发者快速入门](/mirror/api/docs/quickstart)发出第一个请求，或直接查看 [Responses 创建参考](/mirror/api/reference/resources/responses/methods/create)。
5. 上线生产前，请查看下面的[错误代码](/mirror/api/docs/guides/error-codes)、[速率限制](/mirror/api/docs/guides/rate-limits)和 request ID 日志记录。

## 身份验证

OpenAI API 接受来自 API key 的 bearer 凭据，或接受通过[工作负载身份联合](/mirror/api/docs/guides/workload-identity-federation)创建的短期 access token。

**请记住，你的 API key 是秘密。** 不要与他人共享，也不要在浏览器或应用等任何客户端代码中暴露它。请在服务器上从环境变量或密钥管理服务加载 API key。

使用 [HTTP Bearer 身份验证](https://swagger.io/docs/specification/v3_0/authentication/bearer-authentication/) 提供 API 凭据。

```bash
Authorization: Bearer OPENAI_API_KEY_OR_ACCESS_TOKEN
```

如果你属于多个组织，或通过旧版 user API key 访问项目，请传入标头来指定该 API 请求要使用的组织和项目：

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "OpenAI-Organization: $ORGANIZATION_ID" \
  -H "OpenAI-Project: $PROJECT_ID"
```

这些 API 请求的用量会计入指定组织和项目。你可以在 [Dashboard 设置](https://platform.openai.com/settings/organization/general)中找到组织和项目 ID。

## 调试请求

[错误代码](/mirror/api/docs/guides/error-codes)描述 API 响应返回的失败。请检查 HTTP 响应标头，以获取请求的唯一 ID 和速率限制详情。常见响应标头包括：

**API 元信息**

- `openai-organization`：与该请求关联的[组织](/mirror/api/docs/guides/production-best-practices#setting-up-your-organization)
- `openai-processing-ms`：处理你的 API 请求所花的时间
- `openai-version`：该请求使用的 REST API 版本（当前为 `2020-10-01`）
- `x-request-id`：该 API 请求的唯一标识符（用于故障排查）

**[速率限制信息](/mirror/api/docs/guides/rate-limits)**

- `x-ratelimit-limit-requests`
- `x-ratelimit-limit-tokens`
- `x-ratelimit-remaining-requests`
- `x-ratelimit-remaining-tokens`
- `x-ratelimit-reset-requests`
- `x-ratelimit-reset-tokens`
- `x-ratelimit-limit-project-tokens`
- `x-ratelimit-remaining-project-tokens`
- `x-ratelimit-reset-project-tokens`

当适用项目范围的 token 限制时，可能会出现 project-token 标头。

**OpenAI 建议在生产部署中记录 request ID**，以便在需要时与[支持团队](https://help.openai.com/en/)更高效地排查问题。官方[客户端库](/mirror/api/docs/libraries)会在顶层响应对象上提供一个属性，其中包含 `x-request-id` 标头的值。

### 使用 `X-Client-Request-Id` 提供你自己的 request ID

除了服务器生成的 `x-request-id`，你还可以通过 `X-Client-Request-Id` 请求标头为每个请求提供自己的唯一标识符。此标头不会自动添加；你必须在请求上显式设置它。

当你包含 `X-Client-Request-Id` 时：

- 你可以控制 ID 格式（例如 UUID 或内部 trace ID），但它必须只包含 ASCII 字符，并且长度不超过 512 个字符；否则，请求会以 400 错误失败。请确保该值对每个请求都是唯一的。

- OpenAI 会为受支持的端点在内部记录此值，包括 chat/completions、embeddings、responses 等。

- 在超时或网络问题等无法获取 `X-Request-Id` 响应标头的情况下，你可以把 `X-Client-Request-Id` 值分享给支持团队，用于查询 OpenAI 是否以及何时收到了该请求。

**示例：**

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "X-Client-Request-Id: 123e4567-e89b-12d3-a456-426614174000"
```

## 向后兼容性

OpenAI 通过尽可能避免在主要 API 版本中引入破坏性变更，为 API 用户提供稳定性。这包括：

- REST API（当前为 `v1`）
- 第一方[客户端库](/mirror/api/docs/libraries)（已发布的库遵循[语义化版本](https://semver.org/)）
- [模型](https://developers.openai.com/api/docs/models)系列（例如 `gpt-4o` 或 `o4-mini`）

**不同快照之间的模型提示行为可能发生变化**。
模型输出本质上具有可变性，因此应预期快照之间的提示和模型行为会有变化。确保提示行为和模型输出保持一致的最佳方式，是使用固定的模型版本，并为你的应用运行 [evals](/mirror/api/docs/guides/evals)。

**向后兼容的 API 变更**：

- 向 REST API 和客户端库添加新资源（URL）
- 添加新的可选 API 参数
- 向 JSON 响应对象或事件数据添加新属性
- 改变 JSON 响应对象中属性的顺序
- 改变不透明字符串（例如资源标识符）的长度或格式
- 在流式 API 中添加新的事件类型

请参阅 [changelog](https://developers.openai.com/api/docs/changelog)，了解向后兼容变更和少见破坏性变更的列表。

:::

## English source

::: details 展开英文原文
::: v-pre
Use this reference to look up OpenAI API endpoints, request and response
schemas, streaming events, client library methods, and shared behavior such as
authentication, errors, rate limits, and request IDs.

## Start here

1. Choose the API surface for your application:
   - [Responses](/mirror/api/reference/responses/overview) for direct model requests, tool use, audio, image, and text inputs, and stateful interactions.
   - [Realtime API](/mirror/api/docs/guides/realtime) for low-latency voice or audio sessions over WebRTC, WebSocket, or SIP. Use the [client events](https://developers.openai.com/api/reference/resources/realtime/client-events) and [server events](https://developers.openai.com/api/reference/resources/realtime/server-events) references while building sessions.
   - [Administration](/mirror/api/reference/administration/overview) for organization workflows such as users, invites, projects, API keys, and audit logs.
2. Create credentials. Use a standard [API key](https://platform.openai.com/settings/organization/api-keys) for application requests, an [Admin API key](https://platform.openai.com/settings/organization/admin-keys) for Administration endpoints, or [workload identity federation](/mirror/api/docs/guides/workload-identity-federation) for short-lived access tokens.
3. Install an official client library from the [libraries page](/mirror/api/docs/libraries), or call the HTTP API directly from any environment that supports HTTP requests.
4. Make a first request with the [developer quickstart](/mirror/api/docs/quickstart) or go straight to the [Responses create reference](/mirror/api/reference/resources/responses/methods/create).
5. Before production, review [error codes](/mirror/api/docs/guides/error-codes), [rate limits](/mirror/api/docs/guides/rate-limits), and request ID logging below.

## Authentication

The OpenAI API accepts bearer credentials from API keys or from short-lived access tokens created with [workload identity federation](/mirror/api/docs/guides/workload-identity-federation).

**Remember that your API key is a secret.** Don't share it with others or expose it in any client-side code such as browsers or apps. Load API keys from an environment variable or key management service on the server.

Provide API credentials with [HTTP Bearer authentication](https://swagger.io/docs/specification/v3_0/authentication/bearer-authentication/).

```bash
Authorization: Bearer OPENAI_API_KEY_OR_ACCESS_TOKEN
```

If you belong to more than one organization or access projects through a legacy user API key, pass a header to specify which organization and project to use for an API request:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "OpenAI-Organization: $ORGANIZATION_ID" \
  -H "OpenAI-Project: $PROJECT_ID"
```

Usage from these API requests counts as usage for the specified organization and project. Find organization and project IDs in your [dashboard settings](https://platform.openai.com/settings/organization/general).

## Debugging requests

[Error codes](/mirror/api/docs/guides/error-codes) describe failures returned from API responses. Inspect HTTP response headers for the unique ID of a request and rate limit details. Common response headers include:

**API meta information**

- `openai-organization`: The [organization](/mirror/api/docs/guides/production-best-practices#setting-up-your-organization) associated with the request
- `openai-processing-ms`: Time taken processing your API request
- `openai-version`: REST API version used for this request (currently `2020-10-01`)
- `x-request-id`: Unique identifier for this API request (used in troubleshooting)

**[Rate limiting information](/mirror/api/docs/guides/rate-limits)**

- `x-ratelimit-limit-requests`
- `x-ratelimit-limit-tokens`
- `x-ratelimit-remaining-requests`
- `x-ratelimit-remaining-tokens`
- `x-ratelimit-reset-requests`
- `x-ratelimit-reset-tokens`
- `x-ratelimit-limit-project-tokens`
- `x-ratelimit-remaining-project-tokens`
- `x-ratelimit-reset-project-tokens`

Project-token headers may be present when a project-scoped token limit applies.

**OpenAI recommends logging request IDs in production deployments** for more efficient troubleshooting with the [support team](https://help.openai.com/en/), should the need arise. Official [client libraries](/mirror/api/docs/libraries) provide a property on top-level response objects containing the value of the `x-request-id` header.

### Supplying your own request ID with `X-Client-Request-Id`

Along with the server-generated `x-request-id`, you can supply your own unique identifier for each request via the `X-Client-Request-Id` request header. This header isn't added automatically; you must explicitly set it on the request.

When you include `X-Client-Request-Id`:

- You control the ID format (for example, a UUID or your internal trace ID), but it must contain only ASCII characters and be no more than 512 characters long; otherwise, the request will fail with a 400 error. Make this value unique per request.

- OpenAI logs this value internally for supported endpoints, including chat/completions, embeddings, responses, and more.

- In cases like timeouts or network issues when you can't get the `X-Request-Id` response header, you can share the `X-Client-Request-Id` value with the support team to look up whether OpenAI received the request and when.

**Example:**

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "X-Client-Request-Id: 123e4567-e89b-12d3-a456-426614174000"
```

## Backwards compatibility

OpenAI provides stability to API users by avoiding breaking changes in major API versions whenever reasonably possible. This includes:

- The REST API (currently `v1`)
- First-party [client libraries](/mirror/api/docs/libraries) (released libraries adhere to [semantic versioning](https://semver.org/))
- [Model](https://developers.openai.com/api/docs/models) families (like `gpt-4o` or `o4-mini`)

**Model prompting behavior between snapshots is subject to change**.
Model outputs are by their nature variable, so expect changes in prompting and model behavior between snapshots. The best way to ensure consistent prompting behavior and model output is to use pinned model versions, and to run [evals](/mirror/api/docs/guides/evals) for your applications.

**Backwards-compatible API changes**:

- Adding new resources (URLs) to the REST API and client libraries
- Adding new optional API parameters
- Adding new properties to JSON response objects or event data
- Changing the order of properties in a JSON response object
- Changing the length or format of opaque strings, like resource identifiers
- Adding new event types in streaming APIs

See the [changelog](https://developers.openai.com/api/docs/changelog) for a list of backwards-compatible changes and rare breaking changes.

:::
:::

