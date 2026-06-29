---
title: "促销"
description: "Retrieve and upsert promotions for a feed."
outline: deep
---

# 促销

**文档集**：商务\
**分组**：规范\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/commerce/specs/api/promotions](https://developers.openai.com/commerce/specs/api/promotions)
- Markdown 来源：[https://developers.openai.com/commerce/specs/api/promotions.md](https://developers.openai.com/commerce/specs/api/promotions.md)
- 抓取时间：2026-06-27T05:55:11.871Z
- Checksum：`47459ec46864d886cd57645094bf0c4beb3f3e8a3c853213b3cf3038b995df67`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

使用这些 endpoint 获取某个 feed 的当前促销，或按 `id` 匹配并 upsert
部分促销变更。

## REST endpoint（REST 端点）

- &lt;code&gt;GET /product_feeds/&#123;id&#125;/promotions&lt;/code&gt; 返回指定 feed
  的促销。
- &lt;code&gt;PATCH /product_feeds/&#123;id&#125;/promotions&lt;/code&gt; 将促销 upsert
  到指定 feed 中。促销按 &lt;code&gt;id&lt;/code&gt; 匹配，未包含在请求中的促销保持不变。

### **GET /product_feeds/&#123;id&#125;/promotions**

返回指定 feed 的促销。

#### Path parameters（路径参数）

| 字段 | 类型     | 是否必填 | 说明 |
| :---- | :------- | :------- | :---------- |
| `id`  | `string` | 是 | feed 的标识符。 |

#### Request（请求）

此 endpoint 不定义请求体。

#### Response（响应）

`200 OK`

| 字段 | 类型          | 是否必填 | 说明 |
| :---- | :------------ | :------- | :---------- |
| `[]`  | `Promotion[]` | 是 | 指定 feed 的促销数组。 |

`404 Not Found`

当找不到该 feed 时返回。

### **PATCH /product_feeds/&#123;id&#125;/promotions**

将促销 upsert 到指定 feed 中。促销按 `id` 匹配。未包含在请求中的促销保持不变。

#### Path parameters（路径参数）

| 字段 | 类型     | 是否必填 | 说明 |
| :---- | :------- | :------- | :---------- |
| `id`  | `string` | 是 | feed 的标识符。 |

#### Request（请求）

| 字段 | 类型          | 是否必填 | 说明 |
| :---- | :------------ | :------- | :---------- |
| `[]`  | `Promotion[]` | 是 | feed 的促销数组。 |

#### Response（响应）

`200 OK`

返回以下接受对象：

| 字段       | 类型      | 是否必填 | 说明 |
| :--------- | :-------- | :------- | :---------- |
| `id`       | `string`  | 是 | feed 的标识符。 |
| `accepted` | `boolean` | 是 | 是否接受了促销 payload。 |

`400 Bad Request`

当促销 payload 无效时返回。

`404 Not Found`

当找不到该 feed 时返回。

## Schema reference（Schema 参考）

### Promotion

| 字段            | 类型                 | 是否必填 | 说明 |
| :-------------- | :------------------- | :------- | :---------- |
| `id`            | `string`             | 是 | 促销标识符。 |
| `title`         | `string`             | 是 | 促销标题。 |
| `description`   | `Description`        | 否 | 促销描述内容。 |
| `status`        | `PromotionStatus`    | 否 | 促销状态。 |
| `active_period` | `DateTimeRange`      | 是 | 促销的开始和结束时间。 |
| `benefits`      | `PromotionBenefit[]` | 是 | 促销所应用的权益。 |
| `applies_to`    | `ProductTarget[]`    | 否 | 该促销面向的商品或变体。 |
| `url`           | `string (uri)`       | 否 | 规范促销 URL。 |

### Description（描述）

以下字段中必须至少存在一个。

| 字段       | 类型     | 是否必填 | 说明 |
| :--------- | :------- | :------- | :---------- |
| `plain`    | `string` | 否 | 纯文本描述。 |
| `html`     | `string` | 否 | HTML 描述。 |
| `markdown` | `string` | 否 | Markdown 描述。 |

### Price

| 字段       | 类型      | 是否必填 | 说明 |
| :--------- | :-------- | :------- | :---------- |
| `amount`   | `integer` | 是 | 以 ISO 4217 最小货币单位表示的金额。 |
| `currency` | `string`  | 是 | 货币标识符。 |

### DateTimeRange

| 字段         | 类型     | 是否必填 | 说明 |
| :----------- | :------- | :------- | :---------- |
| `start_time` | `string` | 是 | 开始时间戳。 |
| `end_time`   | `string` | 是 | 结束时间戳。 |

### PromotionStatus

`PromotionStatus` 是一个字符串。已知值包括 `draft`、`scheduled`、`active`、`expired` 和 `disabled`。

### PromotionBenefit

`PromotionBenefit` 是以下类型的 union：

- `AmountOffBenefit`
- `PercentOffBenefit`
- `FreeShippingBenefit`

### AmountOffBenefit

| 字段         | 类型    | 是否必填 | 说明 |
| :----------- | :------ | :------- | :---------- |
| `type`       | `const` | 是 | 必须为 `amount_off`。 |
| `amount_off` | `Price` | 是 | 折扣金额。 |

### PercentOffBenefit

| 字段          | 类型     | 是否必填 | 说明 |
| :------------ | :------- | :------- | :---------- |
| `type`        | `const`  | 是 | 必须为 `percent_off`。 |
| `percent_off` | `number` | 是 | 折扣百分比。 |

### FreeShippingBenefit

| 字段   | 类型    | 是否必填 | 说明 |
| :----- | :------ | :------- | :---------- |
| `type` | `const` | 是 | 必须为 `free_shipping`。 |

### ProductTarget

| 字段          | 类型       | 是否必填 | 说明 |
| :------------ | :--------- | :------- | :---------- |
| `product_id`  | `string`   | 是 | 促销面向的商品。 |
| `variant_ids` | `string[]` | 否 | 该商品中促销面向的变体。 |

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

Use these endpoints to retrieve the current promotions for a feed or upsert
partial promotion changes matched by `id`.

## REST endpoints

- &lt;code&gt;GET /product_feeds/&#123;id&#125;/promotions&lt;/code&gt; returns the
  promotions for the specified feed.
- &lt;code&gt;PATCH /product_feeds/&#123;id&#125;/promotions&lt;/code&gt; upserts promotions
  into the specified feed. Promotions are matched by &lt;code&gt;id&lt;/code&gt;, and
  promotions not included in the request remain unchanged.

### **GET /product_feeds/&#123;id&#125;/promotions**

Returns the promotions for the specified feed.

#### Path parameters

| Field | Type     | Required | Description              |
| :---- | :------- | :------- | :----------------------- |
| `id`  | `string` | Yes      | Identifier for the feed. |

#### Request

This endpoint does not define a request body.

#### Response

`200 OK`

| Field | Type          | Required | Description                                 |
| :---- | :------------ | :------- | :------------------------------------------ |
| `[]`  | `Promotion[]` | Yes      | Array of promotions for the specified feed. |

`404 Not Found`

Returned when the feed is not found.

### **PATCH /product_feeds/&#123;id&#125;/promotions**

Upserts promotions into the specified feed. Promotions are matched by `id`. Promotions not included in the request remain unchanged.

#### Path parameters

| Field | Type     | Required | Description              |
| :---- | :------- | :------- | :----------------------- |
| `id`  | `string` | Yes      | Identifier for the feed. |

#### Request

| Field | Type          | Required | Description                       |
| :---- | :------------ | :------- | :-------------------------------- |
| `[]`  | `Promotion[]` | Yes      | Array of promotions for the feed. |

#### Response

`200 OK`

Returns the following acceptance object:

| Field      | Type      | Required | Description                                 |
| :--------- | :-------- | :------- | :------------------------------------------ |
| `id`       | `string`  | Yes      | Identifier for the feed.                    |
| `accepted` | `boolean` | Yes      | Whether the promotion payload was accepted. |

`400 Bad Request`

Returned when the promotion payload is invalid.

`404 Not Found`

Returned when the feed is not found.

## Schema reference

### Promotion

| Field           | Type                 | Required | Description                                     |
| :-------------- | :------------------- | :------- | :---------------------------------------------- |
| `id`            | `string`             | Yes      | Promotion identifier.                           |
| `title`         | `string`             | Yes      | Promotion title.                                |
| `description`   | `Description`        | No       | Promotion description content.                  |
| `status`        | `PromotionStatus`    | No       | Promotion status.                               |
| `active_period` | `DateTimeRange`      | Yes      | Start and end time for the promotion.           |
| `benefits`      | `PromotionBenefit[]` | Yes      | Benefits applied by the promotion.              |
| `applies_to`    | `ProductTarget[]`    | No       | Products or variants targeted by the promotion. |
| `url`           | `string (uri)`       | No       | Canonical promotion URL.                        |

### Description

At least one of the following fields must be present.

| Field      | Type     | Required | Description             |
| :--------- | :------- | :------- | :---------------------- |
| `plain`    | `string` | No       | Plain-text description. |
| `html`     | `string` | No       | HTML description.       |
| `markdown` | `string` | No       | Markdown description.   |

### Price

| Field      | Type      | Required | Description                                        |
| :--------- | :-------- | :------- | :------------------------------------------------- |
| `amount`   | `integer` | Yes      | Monetary amount expressed in ISO 4217 minor units. |
| `currency` | `string`  | Yes      | Currency identifier.                               |

### DateTimeRange

| Field        | Type     | Required | Description      |
| :----------- | :------- | :------- | :--------------- |
| `start_time` | `string` | Yes      | Start timestamp. |
| `end_time`   | `string` | Yes      | End timestamp.   |

### PromotionStatus

`PromotionStatus` is a string. Known values include `draft`, `scheduled`, `active`, `expired`, and `disabled`.

### PromotionBenefit

`PromotionBenefit` is a union of:

- `AmountOffBenefit`
- `PercentOffBenefit`
- `FreeShippingBenefit`

### AmountOffBenefit

| Field        | Type    | Required | Description           |
| :----------- | :------ | :------- | :-------------------- |
| `type`       | `const` | Yes      | Must be `amount_off`. |
| `amount_off` | `Price` | Yes      | Amount discounted.    |

### PercentOffBenefit

| Field         | Type     | Required | Description            |
| :------------ | :------- | :------- | :--------------------- |
| `type`        | `const`  | Yes      | Must be `percent_off`. |
| `percent_off` | `number` | Yes      | Percentage discounted. |

### FreeShippingBenefit

| Field  | Type    | Required | Description              |
| :----- | :------ | :------- | :----------------------- |
| `type` | `const` | Yes      | Must be `free_shipping`. |

### ProductTarget

| Field         | Type       | Required | Description                           |
| :------------ | :--------- | :------- | :------------------------------------ |
| `product_id`  | `string`   | Yes      | Product targeted by the promotion.    |
| `variant_ids` | `string[]` | No       | Variants targeted within the product. |

:::
:::

