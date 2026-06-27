# Feeds

## Overview

Use these endpoints to create a product feed and retrieve feed metadata.

## REST endpoints

- <code>GET /product_feeds/&#123;id&#125;</code> returns metadata for a feed.
- <code>POST /product_feeds</code> creates a new product feed and returns its
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
