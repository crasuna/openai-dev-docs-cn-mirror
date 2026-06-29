---
title: "商品"
description: "Retrieve and upsert products for a feed."
outline: deep
---

# 商品

**文档集**：商务\
**分组**：规范\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/commerce/specs/api/products](https://developers.openai.com/commerce/specs/api/products)
- Markdown 来源：[https://developers.openai.com/commerce/specs/api/products.md](https://developers.openai.com/commerce/specs/api/products.md)
- 抓取时间：2026-06-27T05:55:11.939Z
- Checksum：`57a2ef3131d3fe2d8761eb87146621ee7c642af6c7252d4c963c58e6d40538f5`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

使用这些 endpoint 获取某个 feed 的当前商品，或按 `id` 匹配并 upsert
部分商品变更。

## REST endpoint（REST 端点）

- &lt;code&gt;GET /product_feeds/&#123;id&#125;/products&lt;/code&gt; 返回指定 feed
  的商品。
- &lt;code&gt;PATCH /product_feeds/&#123;id&#125;/products&lt;/code&gt; 将商品 upsert
  到指定 feed 中。商品按 &lt;code&gt;id&lt;/code&gt; 匹配，未包含在请求中的商品保持不变。

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

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

Use these endpoints to retrieve the current products for a feed or upsert
partial product changes matched by `id`.

## REST endpoints

- &lt;code&gt;GET /product_feeds/&#123;id&#125;/products&lt;/code&gt; returns the products
  for the specified feed.
- &lt;code&gt;PATCH /product_feeds/&#123;id&#125;/products&lt;/code&gt; upserts products
  into the specified feed. Products are matched by &lt;code&gt;id&lt;/code&gt;, and products
  not included in the request remain unchanged.

### **GET /product_feeds/&#123;id&#125;/products**

Returns the products for the specified feed.

#### Path parameters

| Field | Type     | Required | Description              |
| :---- | :------- | :------- | :----------------------- |
| `id`  | `string` | Yes      | Identifier for the feed. |

#### Request

This endpoint does not define a request body.

#### Response

`200 OK`

| Field            | Type        | Required | Description                               |
| :--------------- | :---------- | :------- | :---------------------------------------- |
| `target_country` | `string`    | No       | Two letter country code per ISO 3166.     |
| `products`       | `Product[]` | Yes      | Array of products for the specified feed. |

`404 Not Found`

Returned when the feed is not found.

### **PATCH /product_feeds/&#123;id&#125;/products**

Upserts products into the specified feed. Products are matched by `id`. Products not included in the request remain unchanged.

#### Path parameters

| Field | Type     | Required | Description              |
| :---- | :------- | :------- | :----------------------- |
| `id`  | `string` | Yes      | Identifier for the feed. |

#### Request

| Field            | Type        | Required | Description                             |
| :--------------- | :---------- | :------- | :-------------------------------------- |
| `target_country` | `string`    | No       | Two letter country code per ISO 3166.   |
| `products`       | `Product[]` | Yes      | Array of products for the product feed. |

#### Response

`200 OK`

Returns the following acceptance object:

| Field      | Type      | Required | Description                               |
| :--------- | :-------- | :------- | :---------------------------------------- |
| `id`       | `string`  | Yes      | Identifier for the feed.                  |
| `accepted` | `boolean` | Yes      | Whether the product payload was accepted. |

`400 Bad Request`

Returned when the product payload is invalid.

`404 Not Found`

Returned when the feed is not found.

## Schema reference

### Product

| Field         | Type           | Required | Description                                |
| :------------ | :------------- | :------- | :----------------------------------------- |
| `id`          | `string`       | Yes      | Stable global identifier for this product. |
| `title`       | `string`       | No       | Product title.                             |
| `description` | `Description`  | No       | Product description content.               |
| `url`         | `string (uri)` | No       | Canonical product URL.                     |
| `media`       | `Media[]`      | No       | Product-level media assets.                |
| `variants`    | `Variant[]`    | Yes      | Variants associated with the product.      |

### Variant

| Field             | Type              | Required | Description                                                      |
| :---------------- | :---------------- | :------- | :--------------------------------------------------------------- |
| `id`              | `string`          | Yes      | Stable global identifier for this variant.                       |
| `title`           | `string`          | Yes      | Variant title.                                                   |
| `description`     | `Description`     | No       | Variant description content.                                     |
| `url`             | `string (uri)`    | No       | Variant URL.                                                     |
| `barcodes`        | `Barcode[]`       | No       | Variant barcode values.                                          |
| `price`           | `Price`           | No       | Active sale price for this variant.                              |
| `list_price`      | `Price`           | No       | Reference price before any discount is applied.                  |
| `unit_price`      | `UnitPrice`       | No       | Unit pricing metadata.                                           |
| `availability`    | `Availability`    | No       | Availability state for the variant.                              |
| `categories`      | `Category[]`      | No       | Categories associated with the variant.                          |
| `condition`       | `Condition`       | No       | Applicable item conditions.                                      |
| `variant_options` | `VariantOption[]` | No       | Set of option selections for the variant, such as color or size. |
| `media`           | `Media[]`         | No       | Variant media assets. The first entry is treated as primary.     |
| `seller`          | `Seller`          | No       | Seller metadata for the variant.                                 |

### Description

At least one of the following fields must be present.

| Field      | Type     | Required | Description             |
| :--------- | :------- | :------- | :---------------------- |
| `plain`    | `string` | No       | Plain-text description. |
| `html`     | `string` | No       | HTML description.       |
| `markdown` | `string` | No       | Markdown description.   |

### Availability

| Field       | Type      | Required | Description                                                                                                                          |
| :---------- | :-------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `available` | `boolean` | No       | Indicates whether the variant is currently purchasable.                                                                              |
| `status`    | `string`  | No       | Fulfillment state when availability is reported, for example `in_stock`, `backorder`, `preorder`, `out_of_stock`, or `discontinued`. |

### Price

| Field      | Type      | Required | Description                                        |
| :--------- | :-------- | :------- | :------------------------------------------------- |
| `amount`   | `integer` | Yes      | Monetary amount expressed in ISO 4217 minor units. |
| `currency` | `string`  | Yes      | Three-letter ISO 4217 currency identifier.         |

### UnitPrice

| Field       | Type               | Required | Description         |
| :---------- | :----------------- | :------- | :------------------ |
| `amount`    | `integer`          | Yes      | Unit price amount.  |
| `currency`  | `string`           | Yes      | Currency code.      |
| `measure`   | `Measure`          | Yes      | Measured quantity.  |
| `reference` | `ReferenceMeasure` | Yes      | Reference quantity. |

### Measure

| Field   | Type     | Required | Description    |
| :------ | :------- | :------- | :------------- |
| `value` | `number` | Yes      | Measure value. |
| `unit`  | `string` | Yes      | Measure unit.  |

### ReferenceMeasure

| Field   | Type      | Required | Description      |
| :------ | :-------- | :------- | :--------------- |
| `value` | `integer` | Yes      | Reference value. |
| `unit`  | `string`  | Yes      | Reference unit.  |

### Barcode

| Field   | Type     | Required | Description    |
| :------ | :------- | :------- | :------------- |
| `type`  | `string` | Yes      | Barcode type.  |
| `value` | `string` | Yes      | Barcode value. |

### Media

| Field      | Type           | Required | Description     |
| :--------- | :------------- | :------- | :-------------- |
| `type`     | `string`       | Yes      | Media type.     |
| `url`      | `string (uri)` | Yes      | Media URL.      |
| `alt_text` | `string`       | No       | Alternate text. |
| `width`    | `integer`      | No       | Media width.    |
| `height`   | `integer`      | No       | Media height.   |

### VariantOption

| Field   | Type     | Required | Description                         |
| :------ | :------- | :------- | :---------------------------------- |
| `name`  | `string` | Yes      | Option name, such as color or size. |
| `value` | `string` | Yes      | Selected option value.              |

### Category

| Field      | Type     | Required | Description                                                                                               |
| :--------- | :------- | :------- | :-------------------------------------------------------------------------------------------------------- |
| `value`    | `string` | Yes      | Category label or hierarchical path.                                                                      |
| `taxonomy` | `string` | No       | Taxonomy system used for the category value, such as `google_product_category`, `shopify`, or `merchant`. |

### Seller

| Field   | Type     | Required | Description           |
| :------ | :------- | :------- | :-------------------- |
| `name`  | `string` | No       | Seller name.          |
| `links` | `Link[]` | No       | Seller-related links. |

### Link

| Field   | Type     | Required | Description                                                                                                      |
| :------ | :------- | :------- | :--------------------------------------------------------------------------------------------------------------- |
| `type`  | `string` | Yes      | Kind of destination, such as `privacy_policy`, `terms_of_service`, `refund_policy`, `shipping_policy`, or `faq`. |
| `title` | `string` | No       | Link title.                                                                                                      |
| `url`   | `string` | Yes      | Link destination URL.                                                                                            |

### Condition

`Condition` is an array of strings describing applicable item conditions, such as `new` or `secondhand`. More than one value may apply.

:::
:::

