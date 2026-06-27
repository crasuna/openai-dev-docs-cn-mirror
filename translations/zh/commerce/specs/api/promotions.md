---
status: needs-review
sourceId: "47459ec46864"
sourceChecksum: "47459ec46864d886cd57645094bf0c4beb3f3e8a3c853213b3cf3038b995df67"
sourceUrl: "https://developers.openai.com/commerce/specs/api/promotions"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# 促销

## 概览

使用这些 endpoint 获取某个 feed 的当前促销，或按 `id` 匹配并 upsert
部分促销变更。

## REST endpoint

- <code>GET /product_feeds/&#123;id&#125;/promotions</code> 返回指定 feed
  的促销。
- <code>PATCH /product_feeds/&#123;id&#125;/promotions</code> 将促销 upsert
  到指定 feed 中。促销按 <code>id</code> 匹配，未包含在请求中的促销保持不变。

### **GET /product_feeds/&#123;id&#125;/promotions**

返回指定 feed 的促销。

#### Path parameters

| Field | Type     | Required | Description |
| :---- | :------- | :------- | :---------- |
| `id`  | `string` | Yes      | feed 的标识符。 |

#### Request

此 endpoint 不定义请求体。

#### Response

`200 OK`

| Field | Type          | Required | Description |
| :---- | :------------ | :------- | :---------- |
| `[]`  | `Promotion[]` | Yes      | 指定 feed 的促销数组。 |

`404 Not Found`

当找不到该 feed 时返回。

### **PATCH /product_feeds/&#123;id&#125;/promotions**

将促销 upsert 到指定 feed 中。促销按 `id` 匹配。未包含在请求中的促销保持不变。

#### Path parameters

| Field | Type     | Required | Description |
| :---- | :------- | :------- | :---------- |
| `id`  | `string` | Yes      | feed 的标识符。 |

#### Request

| Field | Type          | Required | Description |
| :---- | :------------ | :------- | :---------- |
| `[]`  | `Promotion[]` | Yes      | feed 的促销数组。 |

#### Response

`200 OK`

返回以下接受对象：

| Field      | Type      | Required | Description |
| :--------- | :-------- | :------- | :---------- |
| `id`       | `string`  | Yes      | feed 的标识符。 |
| `accepted` | `boolean` | Yes      | 是否接受了促销 payload。 |

`400 Bad Request`

当促销 payload 无效时返回。

`404 Not Found`

当找不到该 feed 时返回。

## Schema reference

### Promotion

| Field           | Type                 | Required | Description |
| :-------------- | :------------------- | :------- | :---------- |
| `id`            | `string`             | Yes      | 促销标识符。 |
| `title`         | `string`             | Yes      | 促销标题。 |
| `description`   | `Description`        | No       | 促销描述内容。 |
| `status`        | `PromotionStatus`    | No       | 促销状态。 |
| `active_period` | `DateTimeRange`      | Yes      | 促销的开始和结束时间。 |
| `benefits`      | `PromotionBenefit[]` | Yes      | 促销所应用的权益。 |
| `applies_to`    | `ProductTarget[]`    | No       | 该促销面向的商品或变体。 |
| `url`           | `string (uri)`       | No       | 规范促销 URL。 |

### Description

以下字段中必须至少存在一个。

| Field      | Type     | Required | Description |
| :--------- | :------- | :------- | :---------- |
| `plain`    | `string` | No       | 纯文本描述。 |
| `html`     | `string` | No       | HTML 描述。 |
| `markdown` | `string` | No       | Markdown 描述。 |

### Price

| Field      | Type      | Required | Description |
| :--------- | :-------- | :------- | :---------- |
| `amount`   | `integer` | Yes      | 以 ISO 4217 最小货币单位表示的金额。 |
| `currency` | `string`  | Yes      | 货币标识符。 |

### DateTimeRange

| Field        | Type     | Required | Description |
| :----------- | :------- | :------- | :---------- |
| `start_time` | `string` | Yes      | 开始时间戳。 |
| `end_time`   | `string` | Yes      | 结束时间戳。 |

### PromotionStatus

`PromotionStatus` 是一个字符串。已知值包括 `draft`、`scheduled`、`active`、`expired` 和 `disabled`。

### PromotionBenefit

`PromotionBenefit` 是以下类型的 union：

- `AmountOffBenefit`
- `PercentOffBenefit`
- `FreeShippingBenefit`

### AmountOffBenefit

| Field        | Type    | Required | Description |
| :----------- | :------ | :------- | :---------- |
| `type`       | `const` | Yes      | 必须为 `amount_off`。 |
| `amount_off` | `Price` | Yes      | 折扣金额。 |

### PercentOffBenefit

| Field         | Type     | Required | Description |
| :------------ | :------- | :------- | :---------- |
| `type`        | `const`  | Yes      | 必须为 `percent_off`。 |
| `percent_off` | `number` | Yes      | 折扣百分比。 |

### FreeShippingBenefit

| Field  | Type    | Required | Description |
| :----- | :------ | :------- | :---------- |
| `type` | `const` | Yes      | 必须为 `free_shipping`。 |

### ProductTarget

| Field         | Type       | Required | Description |
| :------------ | :--------- | :------- | :---------- |
| `product_id`  | `string`   | Yes      | 促销面向的商品。 |
| `variant_ids` | `string[]` | No       | 该商品中促销面向的变体。 |
