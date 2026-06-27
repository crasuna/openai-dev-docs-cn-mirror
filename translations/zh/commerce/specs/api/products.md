---
status: needs-review
sourceId: "57a2ef3131d3"
sourceChecksum: "57a2ef3131d3fe2d8761eb87146621ee7c642af6c7252d4c963c58e6d40538f5"
sourceUrl: "https://developers.openai.com/commerce/specs/api/products"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# 商品

## 概览

使用这些 endpoint 获取某个 feed 的当前商品，或按 `id` 匹配并 upsert
部分商品变更。

## REST endpoint

- <code>GET /product_feeds/&#123;id&#125;/products</code> 返回指定 feed
  的商品。
- <code>PATCH /product_feeds/&#123;id&#125;/products</code> 将商品 upsert
  到指定 feed 中。商品按 <code>id</code> 匹配，未包含在请求中的商品保持不变。

### **GET /product_feeds/&#123;id&#125;/products**

返回指定 feed 的商品。

#### Path parameters

| Field | Type     | Required | Description |
| :---- | :------- | :------- | :---------- |
| `id`  | `string` | Yes      | feed 的标识符。 |

#### Request

此 endpoint 不定义请求体。

#### Response

`200 OK`

| Field            | Type        | Required | Description |
| :--------------- | :---------- | :------- | :---------- |
| `target_country` | `string`    | No       | 符合 ISO 3166 的两字母国家/地区代码。 |
| `products`       | `Product[]` | Yes      | 指定 feed 的商品数组。 |

`404 Not Found`

当找不到该 feed 时返回。

### **PATCH /product_feeds/&#123;id&#125;/products**

将商品 upsert 到指定 feed 中。商品按 `id` 匹配。未包含在请求中的商品保持不变。

#### Path parameters

| Field | Type     | Required | Description |
| :---- | :------- | :------- | :---------- |
| `id`  | `string` | Yes      | feed 的标识符。 |

#### Request

| Field            | Type        | Required | Description |
| :--------------- | :---------- | :------- | :---------- |
| `target_country` | `string`    | No       | 符合 ISO 3166 的两字母国家/地区代码。 |
| `products`       | `Product[]` | Yes      | product feed 的商品数组。 |

#### Response

`200 OK`

返回以下接受对象：

| Field      | Type      | Required | Description |
| :--------- | :-------- | :------- | :---------- |
| `id`       | `string`  | Yes      | feed 的标识符。 |
| `accepted` | `boolean` | Yes      | 是否接受了商品 payload。 |

`400 Bad Request`

当商品 payload 无效时返回。

`404 Not Found`

当找不到该 feed 时返回。

## Schema reference

### Product

| Field         | Type           | Required | Description |
| :------------ | :------------- | :------- | :---------- |
| `id`          | `string`       | Yes      | 此商品的稳定全局标识符。 |
| `title`       | `string`       | No       | 商品标题。 |
| `description` | `Description`  | No       | 商品描述内容。 |
| `url`         | `string (uri)` | No       | 规范商品 URL。 |
| `media`       | `Media[]`      | No       | 商品级 media 资产。 |
| `variants`    | `Variant[]`    | Yes      | 与商品关联的变体。 |

### Variant

| Field             | Type              | Required | Description |
| :---------------- | :---------------- | :------- | :---------- |
| `id`              | `string`          | Yes      | 此变体的稳定全局标识符。 |
| `title`           | `string`          | Yes      | 变体标题。 |
| `description`     | `Description`     | No       | 变体描述内容。 |
| `url`             | `string (uri)`    | No       | 变体 URL。 |
| `barcodes`        | `Barcode[]`       | No       | 变体条码值。 |
| `price`           | `Price`           | No       | 此变体的当前销售价格。 |
| `list_price`      | `Price`           | No       | 应用任何折扣之前的参考价格。 |
| `unit_price`      | `UnitPrice`       | No       | 单价 metadata。 |
| `availability`    | `Availability`    | No       | 变体的可售状态。 |
| `categories`      | `Category[]`      | No       | 与变体关联的类别。 |
| `condition`       | `Condition`       | No       | 适用的商品成色/状态。 |
| `variant_options` | `VariantOption[]` | No       | 变体的选项选择集合，例如颜色或尺码。 |
| `media`           | `Media[]`         | No       | 变体 media 资产。第一项会被视为主项。 |
| `seller`          | `Seller`          | No       | 变体的卖家 metadata。 |

### Description

以下字段中必须至少存在一个。

| Field      | Type     | Required | Description |
| :--------- | :------- | :------- | :---------- |
| `plain`    | `string` | No       | 纯文本描述。 |
| `html`     | `string` | No       | HTML 描述。 |
| `markdown` | `string` | No       | Markdown 描述。 |

### Availability

| Field       | Type      | Required | Description |
| :---------- | :-------- | :------- | :---------- |
| `available` | `boolean` | No       | 表示该变体当前是否可购买。 |
| `status`    | `string`  | No       | 报告 availability 时的履约状态，例如 `in_stock`、`backorder`、`preorder`、`out_of_stock` 或 `discontinued`。 |

### Price

| Field      | Type      | Required | Description |
| :--------- | :-------- | :------- | :---------- |
| `amount`   | `integer` | Yes      | 以 ISO 4217 最小货币单位表示的金额。 |
| `currency` | `string`  | Yes      | 三字母 ISO 4217 货币标识符。 |

### UnitPrice

| Field       | Type               | Required | Description |
| :---------- | :----------------- | :------- | :---------- |
| `amount`    | `integer`          | Yes      | 单价金额。 |
| `currency`  | `string`           | Yes      | 货币代码。 |
| `measure`   | `Measure`          | Yes      | 被计量的数量。 |
| `reference` | `ReferenceMeasure` | Yes      | 参考数量。 |

### Measure

| Field   | Type     | Required | Description |
| :------ | :------- | :------- | :---------- |
| `value` | `number` | Yes      | 计量值。 |
| `unit`  | `string` | Yes      | 计量单位。 |

### ReferenceMeasure

| Field   | Type      | Required | Description |
| :------ | :-------- | :------- | :---------- |
| `value` | `integer` | Yes      | 参考值。 |
| `unit`  | `string`  | Yes      | 参考单位。 |

### Barcode

| Field   | Type     | Required | Description |
| :------ | :------- | :------- | :---------- |
| `type`  | `string` | Yes      | 条码类型。 |
| `value` | `string` | Yes      | 条码值。 |

### Media

| Field      | Type           | Required | Description |
| :--------- | :------------- | :------- | :---------- |
| `type`     | `string`       | Yes      | Media 类型。 |
| `url`      | `string (uri)` | Yes      | Media URL。 |
| `alt_text` | `string`       | No       | 替代文本。 |
| `width`    | `integer`      | No       | Media 宽度。 |
| `height`   | `integer`      | No       | Media 高度。 |

### VariantOption

| Field   | Type     | Required | Description |
| :------ | :------- | :------- | :---------- |
| `name`  | `string` | Yes      | 选项名称，例如颜色或尺码。 |
| `value` | `string` | Yes      | 已选择的选项值。 |

### Category

| Field      | Type     | Required | Description |
| :--------- | :------- | :------- | :---------- |
| `value`    | `string` | Yes      | 类别标签或层级路径。 |
| `taxonomy` | `string` | No       | 用于类别值的 taxonomy 系统，例如 `google_product_category`、`shopify` 或 `merchant`。 |

### Seller

| Field   | Type     | Required | Description |
| :------ | :------- | :------- | :---------- |
| `name`  | `string` | No       | 卖家名称。 |
| `links` | `Link[]` | No       | 与卖家相关的链接。 |

### Link

| Field   | Type     | Required | Description |
| :------ | :------- | :------- | :---------- |
| `type`  | `string` | Yes      | 目标类型，例如 `privacy_policy`、`terms_of_service`、`refund_policy`、`shipping_policy` 或 `faq`。 |
| `title` | `string` | No       | 链接标题。 |
| `url`   | `string` | Yes      | 链接目标 URL。 |

### Condition

`Condition` 是字符串数组，用于描述适用的商品成色/状态，例如 `new` 或 `secondhand`。可以适用多个值。
