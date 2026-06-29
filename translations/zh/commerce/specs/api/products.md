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

## REST endpoint（REST 端点）

- <code>GET /product_feeds/&#123;id&#125;/products</code> 返回指定 feed
  的商品。
- <code>PATCH /product_feeds/&#123;id&#125;/products</code> 将商品 upsert
  到指定 feed 中。商品按 <code>id</code> 匹配，未包含在请求中的商品保持不变。

### **GET /product_feeds/&#123;id&#125;/products**

返回指定 feed 的商品。

#### Path parameters（路径参数）

| 字段 | 类型     | 是否必填 | 说明 |
| :---- | :------- | :------- | :---------- |
| `id`  | `string` | 是 | feed 的标识符。 |

#### Request（请求）

此 endpoint 不定义请求体。

#### Response（响应）

`200 OK`

| 字段             | 类型        | 是否必填 | 说明 |
| :--------------- | :---------- | :------- | :---------- |
| `target_country` | `string`    | 否 | 符合 ISO 3166 的两字母国家/地区代码。 |
| `products`       | `Product[]` | 是 | 指定 feed 的商品数组。 |

`404 Not Found`

当找不到该 feed 时返回。

### **PATCH /product_feeds/&#123;id&#125;/products**

将商品 upsert 到指定 feed 中。商品按 `id` 匹配。未包含在请求中的商品保持不变。

#### Path parameters（路径参数）

| 字段 | 类型     | 是否必填 | 说明 |
| :---- | :------- | :------- | :---------- |
| `id`  | `string` | 是 | feed 的标识符。 |

#### Request（请求）

| 字段             | 类型        | 是否必填 | 说明 |
| :--------------- | :---------- | :------- | :---------- |
| `target_country` | `string`    | 否 | 符合 ISO 3166 的两字母国家/地区代码。 |
| `products`       | `Product[]` | 是 | product feed 的商品数组。 |

#### Response（响应）

`200 OK`

返回以下接受对象：

| 字段       | 类型      | 是否必填 | 说明 |
| :--------- | :-------- | :------- | :---------- |
| `id`       | `string`  | 是 | feed 的标识符。 |
| `accepted` | `boolean` | 是 | 是否接受了商品 payload。 |

`400 Bad Request`

当商品 payload 无效时返回。

`404 Not Found`

当找不到该 feed 时返回。

## Schema reference（Schema 参考）

### Product

| 字段          | 类型           | 是否必填 | 说明 |
| :------------ | :------------- | :------- | :---------- |
| `id`          | `string`       | 是 | 此商品的稳定全局标识符。 |
| `title`       | `string`       | 否 | 商品标题。 |
| `description` | `Description`  | 否 | 商品描述内容。 |
| `url`         | `string (uri)` | 否 | 规范商品 URL。 |
| `media`       | `Media[]`      | 否 | 商品级 media 资产。 |
| `variants`    | `Variant[]`    | 是 | 与商品关联的变体。 |

### Variant

| 字段              | 类型              | 是否必填 | 说明 |
| :---------------- | :---------------- | :------- | :---------- |
| `id`              | `string`          | 是 | 此变体的稳定全局标识符。 |
| `title`           | `string`          | 是 | 变体标题。 |
| `description`     | `Description`     | 否 | 变体描述内容。 |
| `url`             | `string (uri)`    | 否 | 变体 URL。 |
| `barcodes`        | `Barcode[]`       | 否 | 变体条码值。 |
| `price`           | `Price`           | 否 | 此变体的当前销售价格。 |
| `list_price`      | `Price`           | 否 | 应用任何折扣之前的参考价格。 |
| `unit_price`      | `UnitPrice`       | 否 | 单价 metadata。 |
| `availability`    | `Availability`    | 否 | 变体的可售状态。 |
| `categories`      | `Category[]`      | 否 | 与变体关联的类别。 |
| `condition`       | `Condition`       | 否 | 适用的商品成色/状态。 |
| `variant_options` | `VariantOption[]` | 否 | 变体的选项选择集合，例如颜色或尺码。 |
| `media`           | `Media[]`         | 否 | 变体 media 资产。第一项会被视为主项。 |
| `seller`          | `Seller`          | 否 | 变体的卖家 metadata。 |

### Description（描述）

以下字段中必须至少存在一个。

| 字段       | 类型     | 是否必填 | 说明 |
| :--------- | :------- | :------- | :---------- |
| `plain`    | `string` | 否 | 纯文本描述。 |
| `html`     | `string` | 否 | HTML 描述。 |
| `markdown` | `string` | 否 | Markdown 描述。 |

### Availability

| 字段        | 类型      | 是否必填 | 说明 |
| :---------- | :-------- | :------- | :---------- |
| `available` | `boolean` | 否 | 表示该变体当前是否可购买。 |
| `status`    | `string`  | 否 | 报告 availability 时的履约状态，例如 `in_stock`、`backorder`、`preorder`、`out_of_stock` 或 `discontinued`。 |

### Price

| 字段       | 类型      | 是否必填 | 说明 |
| :--------- | :-------- | :------- | :---------- |
| `amount`   | `integer` | 是 | 以 ISO 4217 最小货币单位表示的金额。 |
| `currency` | `string`  | 是 | 三字母 ISO 4217 货币标识符。 |

### UnitPrice

| 字段        | 类型               | 是否必填 | 说明 |
| :---------- | :----------------- | :------- | :---------- |
| `amount`    | `integer`          | 是 | 单价金额。 |
| `currency`  | `string`           | 是 | 货币代码。 |
| `measure`   | `Measure`          | 是 | 被计量的数量。 |
| `reference` | `ReferenceMeasure` | 是 | 参考数量。 |

### Measure

| 字段    | 类型     | 是否必填 | 说明 |
| :------ | :------- | :------- | :---------- |
| `value` | `number` | 是 | 计量值。 |
| `unit`  | `string` | 是 | 计量单位。 |

### ReferenceMeasure

| 字段    | 类型      | 是否必填 | 说明 |
| :------ | :-------- | :------- | :---------- |
| `value` | `integer` | 是 | 参考值。 |
| `unit`  | `string`  | 是 | 参考单位。 |

### Barcode

| 字段    | 类型     | 是否必填 | 说明 |
| :------ | :------- | :------- | :---------- |
| `type`  | `string` | 是 | 条码类型。 |
| `value` | `string` | 是 | 条码值。 |

### Media

| 字段       | 类型           | 是否必填 | 说明 |
| :--------- | :------------- | :------- | :---------- |
| `type`     | `string`       | 是 | Media 类型。 |
| `url`      | `string (uri)` | 是 | Media URL。 |
| `alt_text` | `string`       | 否 | 替代文本。 |
| `width`    | `integer`      | 否 | Media 宽度。 |
| `height`   | `integer`      | 否 | Media 高度。 |

### VariantOption

| 字段    | 类型     | 是否必填 | 说明 |
| :------ | :------- | :------- | :---------- |
| `name`  | `string` | 是 | 选项名称，例如颜色或尺码。 |
| `value` | `string` | 是 | 已选择的选项值。 |

### Category

| 字段       | 类型     | 是否必填 | 说明 |
| :--------- | :------- | :------- | :---------- |
| `value`    | `string` | 是 | 类别标签或层级路径。 |
| `taxonomy` | `string` | 否 | 用于类别值的 taxonomy 系统，例如 `google_product_category`、`shopify` 或 `merchant`。 |

### Seller

| 字段    | 类型     | 是否必填 | 说明 |
| :------ | :------- | :------- | :---------- |
| `name`  | `string` | 否 | 卖家名称。 |
| `links` | `Link[]` | 否 | 与卖家相关的链接。 |

### Link

| 字段    | 类型     | 是否必填 | 说明 |
| :------ | :------- | :------- | :---------- |
| `type`  | `string` | 是 | 目标类型，例如 `privacy_policy`、`terms_of_service`、`refund_policy`、`shipping_policy` 或 `faq`。 |
| `title` | `string` | 否 | 链接标题。 |
| `url`   | `string` | 是 | 链接目标 URL。 |

### Condition

`Condition` 是字符串数组，用于描述适用的商品成色/状态，例如 `new` 或 `secondhand`。可以适用多个值。
