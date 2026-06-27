# Products

## Overview

Use these endpoints to retrieve the current products for a feed or upsert
partial product changes matched by `id`.

## REST endpoints

- <code>GET /product_feeds/&#123;id&#125;/products</code> returns the products
  for the specified feed.
- <code>PATCH /product_feeds/&#123;id&#125;/products</code> upserts products
  into the specified feed. Products are matched by <code>id</code>, and products
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
