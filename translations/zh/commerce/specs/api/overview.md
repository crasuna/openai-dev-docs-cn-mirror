---
status: needs-review
sourceId: "14ec8bbfc380"
sourceChecksum: "14ec8bbfc3801db7c13132b6280c79054b8abbd5dd5a2e7259277f5c9b08bd48"
sourceUrl: "https://developers.openai.com/commerce/specs/api/overview"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# API 概览

API 让你通过三个 API surfaces 管理 product feed data：

- [Feeds](https://developers.openai.com/commerce/specs/api/feeds) 创建 product feeds 并检索 feed
  metadata。
- [Products](https://developers.openai.com/commerce/specs/api/products) 检索某个 feed 的 products，并
  upserts partial product changes。
- [Promotions](https://developers.openai.com/commerce/specs/api/promotions) 检索某个 feed 的 promotions，并
  upserts partial promotion changes。

当你想通过 API-based delivery 而不是 file upload 来创建 feed、检索当前数据，并 upsert product 和 promotion changes 时，请组合使用这些 APIs。

## REST endpoints（REST 端点）

所有 API endpoints 都使用相同的 request headers 和 response
headers。`Feeds`、`Products` 和 `Promotions` subtabs 定义 endpoint-
specific request 和 response bodies。

### Request headers（请求标头）

| 字段 | 说明 | 示例值 |
| :---------------- | :-------------------------------------------------------- | :---------------------------------------------- |
| `Authorization` | 用于发起 requests 的 API key | `Bearer api_key_123` |
| `Accept-Language` | messages 和 errors 等内容的首选 locale | `en-US` |
| `User-Agent` | 关于发起此 request 的 client 信息 | `ChatGPT/2.0 (Mac OS X 15.0.1; arm64; build 0)` |
| `Idempotency-Key` | 用于确保 requests idempotent 的 key | `idempotency_key_123` |
| `Request-Id` | 每个 request 的唯一 key，用于 tracing purposes | `request_id_123` |
| `Content-Type` | request content 的类型 | `application/json` |
| `Timestamp` | 格式为 RFC 3339 string | `2025-09-25T10:30:00Z` |
| `API-Version` | API 版本 | `2025-09-12` |

### Response headers（响应标头）

| 字段 | 说明 | 示例值 |
| :---------------- | :------------------------------------ | :-------------------- |
| `Idempotency-Key` | request 中传入的 idempotency key | `idempotency_key_123` |
| `Request-Id` | request 中传入的 request ID | `request_id_123` |
