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

## REST endpoint（REST 端点）

- <code>GET /product_feeds/&#123;id&#125;/promotions</code> 返回指定 feed
  的促销。
- <code>PATCH /product_feeds/&#123;id&#125;/promotions</code> 将促销 upsert
  到指定 feed 中。促销按 <code>id</code> 匹配，未包含在请求中的促销保持不变。

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
