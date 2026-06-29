---
title: "API 概览"
description: "Create, retrieve, and upsert product feed data using an API."
outline: deep
---

# API 概览

**文档集**：商务\
**分组**：规范\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/commerce/specs/api/overview](https://developers.openai.com/commerce/specs/api/overview)
- Markdown 来源：[https://developers.openai.com/commerce/specs/api/overview.md](https://developers.openai.com/commerce/specs/api/overview.md)
- 抓取时间：2026-06-27T05:55:11.380Z
- Checksum：`14ec8bbfc3801db7c13132b6280c79054b8abbd5dd5a2e7259277f5c9b08bd48`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
API 让你通过三个 API surfaces 管理 product feed data：

- [Feeds](/mirror/commerce/specs/api/feeds) 创建 product feeds 并检索 feed
  metadata。
- [Products](/mirror/commerce/specs/api/products) 检索某个 feed 的 products，并
  upserts partial product changes。
- [Promotions](/mirror/commerce/specs/api/promotions) 检索某个 feed 的 promotions，并
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

:::

## English source

::: details 展开英文原文
::: v-pre
The API lets you manage product feed data through three API surfaces:

- [Feeds](/mirror/commerce/specs/api/feeds) creates product feeds and retrieves feed
  metadata.
- [Products](/mirror/commerce/specs/api/products) retrieves products for a feed and
  upserts partial product changes.
- [Promotions](/mirror/commerce/specs/api/promotions) retrieves promotions for a feed
  and upserts partial promotion changes.

Use these APIs together when you want to create a feed, retrieve current data,
and upsert product and promotion changes through API-based delivery instead of
file upload.

## REST endpoints

All API endpoints use the same request headers and response
headers. The `Feeds`, `Products`, and `Promotions` subtabs define the endpoint-
specific request and response bodies.

### Request headers

| Field             | Description                                               | Example Value                                   |
| :---------------- | :-------------------------------------------------------- | :---------------------------------------------- |
| `Authorization`   | API key used to make requests                             | `Bearer api_key_123`                            |
| `Accept-Language` | The preferred locale for content like messages and errors | `en-US`                                         |
| `User-Agent`      | Information about the client making this request          | `ChatGPT/2.0 (Mac OS X 15.0.1; arm64; build 0)` |
| `Idempotency-Key` | Key used to ensure requests are idempotent                | `idempotency_key_123`                           |
| `Request-Id`      | Unique key for each request for tracing purposes          | `request_id_123`                                |
| `Content-Type`    | Type of request content                                   | `application/json`                              |
| `Timestamp`       | Formatted as an RFC 3339 string                           | `2025-09-25T10:30:00Z`                          |
| `API-Version`     | API version                                               | `2025-09-12`                                    |

### Response headers

| Field             | Description                           | Example Value         |
| :---------------- | :------------------------------------ | :-------------------- |
| `Idempotency-Key` | Idempotency key passed in the request | `idempotency_key_123` |
| `Request-Id`      | Request ID passed in the request      | `request_id_123`      |

:::
:::

