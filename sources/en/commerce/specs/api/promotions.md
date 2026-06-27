# Promotions

## Overview

Use these endpoints to retrieve the current promotions for a feed or upsert
partial promotion changes matched by `id`.

## REST endpoints

- <code>GET /product_feeds/&#123;id&#125;/promotions</code> returns the
  promotions for the specified feed.
- <code>PATCH /product_feeds/&#123;id&#125;/promotions</code> upserts promotions
  into the specified feed. Promotions are matched by <code>id</code>, and
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
