---
title: "Feeds（Feed 管理）"
description: "Create product feeds and retrieve feed metadata."
outline: deep
---

# Feeds（Feed 管理）

**文档集**：Commerce  
**分组**：Agentic Commerce — Specs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/commerce/specs/api/feeds](https://developers.openai.com/commerce/specs/api/feeds)
- Markdown 来源：[https://developers.openai.com/commerce/specs/api/feeds.md](https://developers.openai.com/commerce/specs/api/feeds.md)
- 抓取时间：2026-06-27T05:55:11.243Z
- Checksum：`14e3150b98d03ea9a365f68cfcc86b8699f31622cdce7b6432ed7d6acc97d77b`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

使用这些 endpoints 创建 product feed 并检索 feed metadata。

## REST endpoints（REST 端点）

- &lt;code&gt;GET /product_feeds/&#123;id&#125;&lt;/code&gt; 返回 feed 的 metadata。
- &lt;code&gt;POST /product_feeds&lt;/code&gt; 创建新的 product feed，并返回其
  metadata。

### **GET /product_feeds/&#123;id&#125;**

返回指定 product feed 的 metadata。

#### Path parameters（路径参数）

| 字段 | 类型 | 是否必填 | 说明 |
| :---- | :------- | :------- | :------------------------------- |
| `id` | `string` | 是 | Product feed 的 identifier。 |

#### Request（请求）

此 endpoint 不定义 request body。

#### Response（响应）

`200 OK`

| 字段 | 类型 | 是否必填 | 说明 |
| :--------------- | :------- | :------- | :----------------------------------------------- |
| `id` | `string` | 是 | Product feed 的 identifier。 |
| `target_country` | `string` | 否 | 符合 ISO 3166 的两字母国家/地区代码。 |
| `updated_at` | `string` | 否 | feed 最近一次更新的 timestamp。 |

`404 Not Found`

当找不到 product feed 时返回。

### **POST /product_feeds**

创建新的 product feed，并返回其 metadata。

#### Request（请求）

| 字段 | 类型 | 是否必填 | 说明 |
| :--------------- | :------- | :------- | :------------------------------------ |
| `target_country` | `string` | 否 | 符合 ISO 3166 的两字母国家/地区代码。 |

#### Response（响应）

`200 OK`

| 字段 | 类型 | 是否必填 | 说明 |
| :--------------- | :------- | :------- | :----------------------------------------------- |
| `id` | `string` | 是 | Product feed 的 identifier。 |
| `target_country` | `string` | 否 | 符合 ISO 3166 的两字母国家/地区代码。 |
| `updated_at` | `string` | 否 | feed 最近一次更新的 timestamp。 |

`400 Bad Request`

当 product feed payload 无效时返回。

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

Use these endpoints to create a product feed and retrieve feed metadata.

## REST endpoints

- &lt;code&gt;GET /product_feeds/&#123;id&#125;&lt;/code&gt; returns metadata for a feed.
- &lt;code&gt;POST /product_feeds&lt;/code&gt; creates a new product feed and returns its
  metadata.

### **GET /product_feeds/&#123;id&#125;**

Returns metadata for the specified product feed.

#### Path parameters

| Field | Type     | Required | Description                      |
| :---- | :------- | :------- | :------------------------------- |
| `id`  | `string` | Yes      | Identifier for the product feed. |

#### Request

This endpoint does not define a request body.

#### Response

`200 OK`

| Field            | Type     | Required | Description                                      |
| :--------------- | :------- | :------- | :----------------------------------------------- |
| `id`             | `string` | Yes      | Identifier for the product feed.                 |
| `target_country` | `string` | No       | Two letter country code per ISO 3166.            |
| `updated_at`     | `string` | No       | Timestamp of the most recent update to the feed. |

`404 Not Found`

Returned when the product feed is not found.

### **POST /product_feeds**

Creates a new product feed and returns its metadata.

#### Request

| Field            | Type     | Required | Description                           |
| :--------------- | :------- | :------- | :------------------------------------ |
| `target_country` | `string` | No       | Two letter country code per ISO 3166. |

#### Response

`200 OK`

| Field            | Type     | Required | Description                                      |
| :--------------- | :------- | :------- | :----------------------------------------------- |
| `id`             | `string` | Yes      | Identifier for the product feed.                 |
| `target_country` | `string` | No       | Two letter country code per ISO 3166.            |
| `updated_at`     | `string` | No       | Timestamp of the most recent update to the feed. |

`400 Bad Request`

Returned when the product feed payload is invalid.

:::
:::

