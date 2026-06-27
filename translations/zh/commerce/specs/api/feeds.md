---
status: needs-review
sourceId: "14e3150b98d0"
sourceChecksum: "14e3150b98d03ea9a365f68cfcc86b8699f31622cdce7b6432ed7d6acc97d77b"
sourceUrl: "https://developers.openai.com/commerce/specs/api/feeds"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# Feeds

## Overview

使用这些 endpoints 创建 product feed 并检索 feed metadata。

## REST endpoints

- <code>GET /product_feeds/&#123;id&#125;</code> 返回 feed 的 metadata。
- <code>POST /product_feeds</code> 创建新的 product feed，并返回其
  metadata。

### **GET /product_feeds/&#123;id&#125;**

返回指定 product feed 的 metadata。

#### Path parameters

| Field | Type | Required | Description |
| :---- | :------- | :------- | :------------------------------- |
| `id` | `string` | Yes | Product feed 的 identifier。 |

#### Request

此 endpoint 不定义 request body。

#### Response

`200 OK`

| Field | Type | Required | Description |
| :--------------- | :------- | :------- | :----------------------------------------------- |
| `id` | `string` | Yes | Product feed 的 identifier。 |
| `target_country` | `string` | No | 符合 ISO 3166 的两字母国家/地区代码。 |
| `updated_at` | `string` | No | feed 最近一次更新的 timestamp。 |

`404 Not Found`

当找不到 product feed 时返回。

### **POST /product_feeds**

创建新的 product feed，并返回其 metadata。

#### Request

| Field | Type | Required | Description |
| :--------------- | :------- | :------- | :------------------------------------ |
| `target_country` | `string` | No | 符合 ISO 3166 的两字母国家/地区代码。 |

#### Response

`200 OK`

| Field | Type | Required | Description |
| :--------------- | :------- | :------- | :----------------------------------------------- |
| `id` | `string` | Yes | Product feed 的 identifier。 |
| `target_country` | `string` | No | 符合 ISO 3166 的两字母国家/地区代码。 |
| `updated_at` | `string` | No | feed 最近一次更新的 timestamp。 |

`400 Bad Request`

当 product feed payload 无效时返回。
