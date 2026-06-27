---
title: "Agentic Checkout Spec"
description: "Merchants integrate with OpenAI’s checkout flow by implementing the Agentic Checkout Spec"
outline: deep
---

# Agentic Checkout Spec

**文档集**：Commerce  
**分组**：Agentic Commerce — Specs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/commerce/specs/checkout](https://developers.openai.com/commerce/specs/checkout)
- Markdown 来源：[https://developers.openai.com/commerce/specs/checkout.md](https://developers.openai.com/commerce/specs/checkout.md)
- 抓取时间：2026-06-27T05:55:13.531Z
- Checksum：`44bda052c70642fbdb3df10698c1a9d9175a6b511346e8c09cf999256342d0d7`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## Overview

让商家能够在 ChatGPT 内运行端到端 checkout flows，同时将 orders、payments 和 compliance 保持在其现有 commerce stack 上。

**How it works**

1. Create session (REST)。ChatGPT 调用你的 `POST /checkout_sessions`，使用 cart contents 和 buyer context 启动 session；你的响应必须包含丰富、权威的 cart state。
2. Update session (REST)。当用户更改 items、shipping 或 discounts 时，ChatGPT 调用 `POST /checkout_sessions/{checkout_session_id}`；每个响应都会返回用于显示和验证的完整 cart state。
3. Order events (webhooks)。你的系统将 order lifecycle events（例如 `order.created`、`order.updated`）发布到提供的 webhook，使 ChatGPT 与 fulfillment-grade truth 保持同步。
4. Complete checkout (REST)。ChatGPT 通过 `POST /checkout_sessions/{checkout_session_id}/complete` 完成结账；你确认 order creation 并返回最终 cart 和 order identifiers。
5. 可选地，使用 POST `/checkout_sessions/{checkout_session_id}/cancel` 取消 checkouts，并使用 `GET /checkout_sessions/{checkout_session_id}` 获取 checkout information。
6. Payments on your rails。你使用现有 PSP 处理 payment；如果使用 Delegated Payments，请接受 token 并应用你的常规 authorization/capture flow。

**Key points**

- **Required endpoints。** 实现 create、update 和 complete checkout session REST endpoints；所有 responses 都必须返回丰富的 cart state（items、pricing、taxes/fees、shipping、discounts、totals、status）。
- **Authoritative webhooks。** 向提供的 webhook 发送 order events，以在 retries 和 edge cases 中保持状态一致。
- **Keep payments where they are。** 使用你当前的 PSP 和 settlement processes；仅在适用时集成 Delegated Payments。
- **Security and robustness。** 认证每个 request、验证 signatures、强制 idempotency、验证 inputs，并支持安全 retries。
- **Certify integration。** 通过 conformance checks（schema、error codes、rate limits、webhook delivery），确保可靠的 in-ChatGPT checkout。

## Checkout session

为了让用户通过 ChatGPT 下单，你必须创建、更新并完成 Checkout session。该 Checkout session 保存有关待购买 items、fulfillment information 和 payment information 的信息。

随着用户推进 checkout flow，Checkout session 会被更新，并在不同状态之间移动。

update calls 的 response 应返回所有要显示给用户的 checkout options、messages 和 errors。客户点击 “Buy” 后，checkout session 会使用所选 payment method 完成。

![State diagram showing order states](/openai-assets/developers.openai.com/images/commerce/commerce-order-states.png)

## REST endpoints

商家必须实现以下五个 endpoints，代表 ChatGPT 用户下单。

未来，Agentic Checkout Spec 将支持 MCP servers。

### Common features of all endpoints

所有 endpoints 都必须使用 HTTPS 并返回 JSON。

#### Request headers

所有 endpoints 调用时都会设置以下 headers：

| Field | Description | Example Value |
| :-------------- | :-------------------------------------------------------- | :---------------------------------------------- |
| Authorization | 用于发起 requests 的 API Key | `Bearer api_key_123` |
| Accept-Language | messages 和 errors 等内容的首选 locale | `en-US` |
| User-Agent | 关于发起此 request 的 client 信息 | `ChatGPT/2.0 (Mac OS X 15.0.1; arm64; build 0)` |
| Idempotency-Key | 用于确保 requests idempotent 的 key | `idempotency_key_123` |
| Request-Id | 每个 request 的唯一 key，用于 tracing purposes | `request_id_123` |
| Content-Type | request content 的类型 | `application/json` |
| Signature | request body 的 Base64 encoded signature | `eyJtZX...` |
| Timestamp | 格式为 RFC 3339 string。 | 2025-09-25T10:30:00Z |
| API-Version | API version | 2025-09-12 |

#### Response headers

| Field | Description | Example Value |
| :-------------- | :------------------------------------ | :-------------------- |
| Idempotency-Key | request 中传入的 idempotency key | `idempotency_key_123` |
| Request-Id | request 中传入的 request ID | `request_id_123` |

### POST /checkout_sessions

Call direction: OpenAI -&gt; Merchant

这是创建 checkout session 的初始调用。该调用会包含客户希望购买的 items 信息，并应返回 line item information，以及需要展示给客户的任何 messages 或 errors。它应始终返回 checkout session id。所有 responses 都应以 201 status 返回。

#### Request

| Field | Type | Required | Description | Validation |
| :------------------ | :--------- | :------- | :---------------------------------------------------------- | :------------------------- |
| buyer | Buyer | No | 关于 buyer 的可选信息。 | None |
| items | List[Item] | Yes | 用于启动 checkout session 的初始 items 列表。 | Should be a non empty list |
| fulfillment_address | Address | No | 如果存在，表示可选 fulfillment address。 | None |

#### Response

| Field | Type | Required | Description | Validation |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id | String | Yes | 标识 checkout session 的唯一 id。此 id 将用于后续调用中更新 checkout session。 | None |
| buyer | Buyer | No | Buyer information，如已提供 | None |
| payment_provider | PaymentProvider | Yes | 将用于完成此交易的 payment provider。 | None |
| status | String enum | Yes | checkout session 的当前 status。可能值为：`not_ready_for_payment` `ready_for_payment` `completed` `canceled` | None |
| currency | String | Yes | 符合 ISO 4217 标准的 currency code | Should follow the ISO 4217 standard in lower case |
| line_items | List[LineItem] | Yes | items 和 computed costs 的列表。 | None |
| fulfillment_address | Address | No | items 的收货地址。 | None |
| fulfillment_options | List[FulfillmentOption] | Yes | 所有可用 fulfillment options 及相关 costs。 | None |
| fulfillment_option_id | String | No | 所选 fulfillment option 的 id。 | None |
| totals | List[Total] | Yes | totals 列表。 | None |
| messages | List[Message] | Yes | 要显示给客户的 informational 和 error messages 列表。 | None |
| links | List[Link] | Yes | 要显示给客户的 links 列表（例如 ToS/privacy policy/etc.）。 | None |

#### Examples

1. 创建带单个 item 和 quantity 的 checkout session。未提供 fulfillment address，因此 checkout 无法完成。

```json
POST Request to /checkout_sessions

{
   "items": [
       {
           "id": "item_123",
           "quantity": 1
       }
   ]
}
```

```json
Response

{
   "id": "checkout_session_123",
   "payment_provider": {
       "provider": "stripe",
       "supported_payment_methods": ["card"]
   },
   "status": "in_progress",
   "currency": "usd",
   "line_items": [
       {
           "id": "line_item_123",
           "item": {
               "id": "item_123",
               "quantity": 1
           },
           "base_amount": 300,
           "discount": 0,
           "subtotal": 300,
           "tax": 30,
           "total": 330
       }
   ],
   "totals": [
       {
           "type": "items_base_amount",
           "display_text": "Item(s) total",
           "amount": 300
       },
       {
           "type": "subtotal",
           "display_text": "Subtotal",
           "amount": 300
       },
       {
           "type": "tax",
           "display_text": "Tax",
           "amount": "0.30"
       },
       {
           "type": "total",
           "display_text": "Total",
           "amount": 330
       }
   ],
   "fulfillment_options": [],
   "messages": [
       {
           "type": "error",
           "code": "out_of_stock",
           "path": "$.line_items[0]",
           "content_type": "plain",
           "content": "This item is not available for sale.",
       }
   ],
   "links": [
       {
           "type": "terms_of_use",
           "url": "https://www.testshop.com/legal/terms-of-use"
       }
   ]
}
```

2. 创建带单个 item 和 quantity、且提供 fulfillment address 的 checkout session。由于提供了 fulfillment address，因此也会返回 taxes。Fulfillment options 同样可用，并默认选择最便宜的一项。也会返回基于用户 fulfillment address 需要向客户展示的任何 messages（例如 CA 65 warning）。

```json
POST Request to /checkout_sessions

{
   "items": [
       {
           "id": "item_456",
           "quantity": 1
       }
   ],
   "fulfillment_address": {
       "name": "test",
       "line_one": "1234 Chat Road",
       "line_two": "Apt 101",
       "city": "San Francisco",
       "state": "CA",
       "country": "US",
       "postal_code": "94131"
   }
}

```

```json
Response

{
   "id": "checkout_session_123",
   "payment_provider": {
       "provider": "stripe",
       "supported_payment_methods": ["card"]
   },
   "status": "ready_for_payment",
   "currency": "usd",
   "line_items": [
       {
           "id": "line_item_456",
           "item": {
               "id": "item_456",
               "quantity": 1
           },
           "base_amount": 300,
           "discount": 0,
           "subtotal": 0,
           "tax": 30,
           "total": 330
       }
   ],
   "fulfillment_address": {
       "name": "test",
       "line_one": "1234 Chat Road",
       "line_two": "Apt 101",
       "city": "San Francisco",
       "state": "CA",
       "country": "US",
       "postal_code": "94131"
   },
   "fulfillment_option_id": "fulfillment_option_123",
   "totals": [
       {
           "type": "items_base_amount",
           "display_text": "Item(s) total",
           "amount": 300
       },
       {
           "type": "subtotal",
           "display_text": "Subtotal",
           "amount": 300
       },
       {
           "type": "tax",
           "display_text": "Tax",
           "amount": 30
       },
       {
           "type": "fulfillment",
           "display_text": "Fulfillment",
           "amount": 100
       },
       {
           "type": "total",
           "display_text": "Total",
           "amount": 430
       }
   ],
   "fulfillment_options": [
       {
           "type": "shipping",
           "id": "fulfillment_option_123",
           "title": "Standard",
           "subtitle": "Arrives in 4-5 days",
           "carrier": "USPS",
           "earliest_delivery_time": "2025-10-12T07:20:50.52Z",
           "latest_delivery_time": "2025-10-13T07:20:50.52Z",
           "subtotal": 100,
           "tax": 0,
           "total": 100
       },
       {
           "type": "shipping",
           "id": "fulfillment_option_456",
           "title": "Express",
           "subtitle": "Arrives in 1-2 days",
           "carrier": "USPS",
           "earliest_delivery_time": "2025-10-09T07:20:50.52Z",
           "latest_delivery_time": "2025-10-10T07:20:50.52Z",
           "subtotal": 500,
           "tax": 0,
           "total": 500
       }
   ],
   "messages": [],
   "links": [
       {
           "type": "terms_of_use",
           "url": "https://www.testshop.com/legal/terms-of-use"
       }
   ]
}
```

### POST `/checkout_sessions/{checkout_session_id}`

Call direction: OpenAI -&gt; Merchant

当 checkout session 更新时会调用此 endpoint，例如 fulfillment address 或 fulfillment option 发生变化。该 endpoint 应返回更新后的 costs、新 options（例如基于 fulfillment address 更新得到的新 fulfillment options），以及任何新的 errors。

#### Request

| Field | Type | Required | Description | Validation |
| :-------------------- | :--------- | :------- | :-------------------------------------------------------------------- | :--------- |
| buyer | Buyer | No | 关于 buyer 的可选信息。 | None |
| items | List[Item] | No | 要购买的更新后 items 的可选列表。 | None |
| fulfillment_address | Address | No | 客户指定的新添加或已更新 fulfillment address。 | None |
| fulfillment_option_id | String | No | 客户指定的 fulfillment option 的 id。 | None |

#### Response

| Field | Type | Required | Description | Validation |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id | String | Yes | 标识 checkout session 的唯一 id。此 id 将用于后续调用中更新 checkout session。 | None |
| buyer | Buyer | No | Buyer information，如已提供 | None |
| status | String enum | Yes | checkout session 的当前 status。可能值为：`not_ready_for_payment` `ready_for_payment` `completed` `canceled` | None |
| currency | String | Yes | 符合 ISO 4217 标准的 currency code | Should follow the ISO 4217 standard in lower case |
| line_items | List[LineItem] | Yes | items 和 computed costs 的列表。 | None |
| fulfillment_address | Address | No | items 的收货地址。 | None |
| fulfillment_options | List[FulfillmentOption] | Yes | 所有可用 fulfillment options 及相关 costs。 | None |
| fulfillment_option_id | String | No | 所选 fulfillment option 的 id。 | None |
| totals | List[Total] | Yes | totals 列表。 | None |
| messages | List[Message] | Yes | 要显示给客户的 informational 和 error messages 列表。 | None |
| links | List[Link] | Yes | 要显示给客户的 links 列表（例如 ToS/privacy policy/etc.）。 | None |

#### Example

更新 fulfillment option 会更新 checkout session totals。

```json
POST Request to /checkout_sessions/checkout_session_123

{
   "fulfillment_option_id": "fulfillment_option_456"
}
```

```json
Response

{
   "id": "checkout_session_123",
   "status": "ready_for_payment",
   "currency": "usd",
   "line_items": [
       {
           "id": "line_item_456",
           "item": {
               "id": "item_456",
               "quantity": 1
           },
           "base_amount": 300,
           "discount": 0,
           "subtotal": 0,
           "tax": 30,
           "total": 330
       }
   ],
   "fulfillment_address": {
       "name": "test",
       "line_one": "1234 Chat Road",
       "line_two": "Apt 101",
       "city": "San Francisco",
       "state": "CA",
       "country": "US",
       "postal_code": "94131"
   },
   "fulfillment_option_id": "fulfillment_option_456",
   "totals": [
       {
           "type": "items_base_amount",
           "display_text": "Item(s) total",
           "amount": 300
       },
       {
           "type": "subtotal",
           "display_text": "Subtotal",
           "amount": 300
       },
       {
           "type": "tax",
           "display_text": "Tax",
           "amount": 30
       },
       {
           "type": "fulfillment",
           "display_text": "Fulfillment",
           "amount": 500
       },
       {
           "type": "total",
           "display_text": "Total",
           "amount": 830
       }
   ],
   "fulfillment_options": [
       {
           "type": "shipping",
           "id": "fulfillment_option_123",
           "title": "Standard",
           "subtitle": "Arrives in 4-5 days",
           "carrier": "USPS",
           "earliest_delivery_time": "2025-10-12T07:20:50.52Z",
           "latest_delivery_time": "2025-10-13T07:20:50.52Z",
           "subtotal": 100,
           "tax": 0,
           "total": 100
       },
       {
           "type": "shipping",
           "id": "fulfillment_option_456",
           "title": "Express",
           "subtitle": "Arrives in 1-2 days",
           "carrier": "USPS",
           "earliest_delivery_time": "2025-10-09T07:20:50.52Z",
           "latest_delivery_time": "2025-10-10T07:20:50.52Z",
           "subtotal": 500,
           "tax": 0,
           "total": 500
       }
   ],
   "messages": [],
   "links": [
       {
           "type": "terms_of_use",
           "url": "https://www.testshop.com/legal/terms-of-use"
       }
   ]
}
```

### POST `/checkout_sessions/{checkout_session_id}/complete`

Call direction: OpenAI -&gt; Merchant

该 endpoint 将携带 payment method 调用，以完成购买。预期此调用后 checkout session 会完成，并创建 order。任何阻止完成的 errors 都应在 response 中返回。

#### Request

| Field | Type | Required | Description | Validation |
| :----------- | :---------- | :------- | :-------------------------------------------------- | :--------- |
| buyer | Buyer | No | 关于 buyer 的可选信息。 | None |
| payment_data | PaymentData | Yes | 用于完成 checkout session 的 payment data。 | None |

#### Response

| Field | Type | Required | Description | Validation |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id | String | Yes | 标识 checkout session 的唯一 id。此 id 将用于后续调用中更新 checkout session。 | None |
| buyer | Buyer | Yes | Buyer information | None |
| status | String enum | Yes | checkout session 的当前 status。可能值为：`not_ready_for_payment` `ready_for_payment` `completed` `canceled` | None |
| currency | String | Yes | 符合 ISO 4217 标准的 currency code | Should follow the ISO 4217 standard in lower case |
| line_items | List[LineItem] | Yes | items 和 computed costs 的列表。 | None |
| fulfillment_address | Address | No | items 的收货地址。 | None |
| fulfillment_options | List[FulfillmentOption] | Yes | 所有可用 fulfillment options 及相关 costs。 | None |
| fulfillment_option_id | String | No | 所选 fulfillment option 的 id。 | None |
| totals | List[Total] | Yes | totals 列表。 | None |
| order | Order | No | checkout session 完成后创建的 order。 | None |
| messages | List[Message] | Yes | 要显示给客户的 informational 和 error messages 列表。 | None |
| links | List[Link] | Yes | 要显示给客户的 links 列表（例如 ToS/privacy policy/etc.）。 | None |

#### Example

使用表示 payment method 的 encrypted payload 完成 checkout session。

```json
POST Request to /checkout_sessions/checkout_session_123/complete

{
   "buyer": {
       "name": "John Smith",
       "email": "johnsmith@mail.com",
       "phone_number": "+15552003434"
   },
   "payment_data": {
       "token": "spt_123",
       "provider": "stripe",
       "billing_address": {
           "name": "test",
           "line_one": "1234 Chat Road",
           "line_two": "Apt 101",
           "city": "San Francisco",
           "state": "CA",
           "country": "US",
           "postal_code": "94131",
           "phone_number": "+15552428478"
       }
   }
}

```

```json
Response

{
   "id": "checkout_session_123",
   "buyer": {
       "name": "John Smith",
       "email": "johnsmith@mail.com",
       "phone_number": "+15552003434"
   },
   "status": "completed",
   "currency": "usd",
   "line_items": [
       {
           "id": "line_item_456",
           "item": {
               "id": "item_456",
               "quantity": 1
           },
           "base_amount": 300,
           "discount": 0,
           "subtotal": 300,
           "tax": 30,
           "total": 330
       }
   ],
   "fulfillment_address": {
       "name": "test",
       "line_one": "1234 Chat Road",
       "line_two": "Apt 101",
       "city": "San Francisco",
       "state": "CA",
       "country": "US",
       "postal_code": "94131"
   },
   "fulfillment_option_id": "fulfillment_option_123",
   "totals": [
       {
           "type": "items_base_amount",
           "display_text": "Item(s) total",
           "amount": 300
       },
       {
           "type": "subtotal",
           "display_text": "Subtotal",
           "amount": 300
       },
       {
           "type": "tax",
           "display_text": "Tax",
           "amount": 30
       },
       {
           "type": "fulfillment",
           "display_text": "Fulfillment",
           "Amount": 100
       },
       {
           "type": "total",
           "display_text": "Total",
           "amount": 430
       }
   ],
   "fulfillment_options": [
       {
           "type": "shipping",
           "id": "fulfillment_option_123",
           "title": "Standard",
           "subtitle": "Arrives in 4-5 days",
           "carrier": "USPS",
           "earliest_delivery_time": "2025-10-12T07:20:50.52Z",
           "latest_delivery_time": "2025-10-13T07:20:50.52Z",
           "subtotal": 100,
           "tax": 0,
           "total": 100
       },
       {
           "type": "shipping",
           "id": "fulfillment_option_456",
           "title": "Express",
           "subtitle": "Arrives in 1-2 days",
           "carrier": "USPS",
           "earliest_delivery_time": "2025-10-09T07:20:50.52Z",
           "latest_delivery_time": "2025-10-10T07:20:50.52Z",
           "subtotal": 500,
           "tax": 0,
           "total": 500
       }
   ],
   "messages": [],
   "links": [
       {
           "type": "terms_of_use",
           "url": "https://www.testshop.com/legal/terms-of-use"
       }
   ]
}
```

### POST `/checkout_sessions/{checkout_session_id}/cancel`

如果 checkout session 可以取消，此 endpoint 将用于取消它。如果 checkout session 无法取消（例如 checkout session 已经 canceled 或 completed），server 应返回 status 405。任何 status 不等于 completed 或 canceled 的 checkout session 都应可取消。

#### Request

None

#### Response

| Field | Type | Required | Description | Validation |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id | String | Yes | 标识 checkout session 的唯一 id。此 id 将用于后续调用中更新 checkout session。 | None |
| buyer | Buyer | No | Buyer information，如已提供 | None |
| status | String enum | Yes | checkout session 的当前 status。可能值为：`not_ready_for_payment` `ready_for_payment` `completed` `canceled` | None |
| currency | String | Yes | 符合 ISO 4217 标准的 currency code | Should follow the ISO 4217 standard in lower case |
| line_items | List[LineItem] | Yes | items 和 computed costs 的列表。 | None |
| fulfillment_address | Address | No | items 的收货地址。 | None |
| fulfillment_options | List[FulfillmentOption] | Yes | 所有可用 fulfillment options 及相关 costs。 | None |
| fulfillment_option_id | String | No | 所选 fulfillment option 的 id。 | None |
| totals | List[Total] | Yes | totals 列表。 | None |
| messages | List[Message] | Yes | 要显示给客户的 informational 和 error messages 列表。 | None |
| links | List[Link] | Yes | 要显示给客户的 links 列表（例如 ToS/privacy policy/etc.）。 | None |

### GET `/checkout_sessions/{checkout_session_id}`

此 endpoint 用于返回 checkout session 的最新信息。如果找不到 checkout session，server 应返回 status 404。

#### Request

None

#### Response

| Field | Type | Required | Description | Validation |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id | String | Yes | 标识 checkout session 的唯一 id。此 id 将用于后续调用中更新 checkout session。 | None |
| buyer | Buyer | No | Buyer information，如已提供 | None |
| status | String enum | Yes | checkout session 的当前 status。可能值为：`not_ready_for_payment` `ready_for_payment` `completed` `canceled` | None |
| currency | String | Yes | 符合 ISO 4217 标准的 currency code | Should follow the ISO 4217 standard in lower case |
| line_items | List[LineItem] | Yes | items 和 computed costs 的列表。 | None |
| fulfillment_address | Address | No | items 的收货地址。 | None |
| fulfillment_options | List[FulfillmentOption] | Yes | 所有可用 fulfillment options 及相关 costs。 | None |
| fulfillment_option_id | String | No | 所选 fulfillment option 的 id。 | None |
| totals | List[Total] | Yes | totals 列表。 | None |
| messages | List[Message] | Yes | 要显示给客户的 informational 和 error messages 列表。 | None |
| links | List[Link] | Yes | 要显示给客户的 links 列表（例如 ToS/privacy policy/etc.）。 | None |

### Response Errors

如果 server 无法返回 201 response，则应返回以下 shape 的 error，并带 4xx/5xx status。

#### Error

| Field | Type | Required | Description |
| :------ | :---------- | :------- | :--------------------------------------------------------------------- |
| type | String enum | Yes | Error type。可能值为：`invalid_request` |
| code | String enum | Yes | Error code。可能值为：`request_not_idempotent` |
| message | String | Yes | Human-readable error description。 |
| param | String | No | 适用时，指向有问题 request body field 的 JSONPath。 |

## Object definitions

### Item

| Field | Type | Required | Description | Example Value | Validation |
| :------- | :----- | :------- | :------------------------------------------------- | :------------ | :------------------------------------------- |
| id | string | Yes | 可购买商品的 id | `“itm_123”` | `None` |
| quantity | int | Yes | 用于 fulfillment 的 item 数量 | `1` | Should be a positive integer greater than 0. |

### Address

| Field | Type | Required | Description | Validation |
| :----------- | :----- | :------- | :----------------------------------------------- | :------------------------------------ |
| name | String | Yes | items 收件人的姓名 | Max. length is 256 |
| line_one | String | Yes | 地址第一行 | Max. length is 60 |
| line_two | String | No | 可选地址第二行 | Max. length is 60 |
| city | String | Yes | 地址 city/district/suburb/town/village。 | Max. length is 60 |
| state | String | Yes | 地址 state/county/province/region。 | Should follow the ISO 3166-1 standard |
| country | String | Yes | 地址 country | Should follow the ISO 3166-1 standard |
| postal_code | String | Yes | 地址 postal code 或 zip code | Max. length is 20 |
| phone_number | String | No | Optional phone number | Follows the E.164 standard |

### PaymentProvider

| Field | Type | Required | Description | Validation |
| :------------------------ | :---------------- | :------- | :--------------------------------------------------------------------------------------------- | :--------- |
| provider | String enum | Yes | 表示 payment processor 的 string value。可能值为：`stripe` `adyen` `braintree` | None |
| supported_payment_methods | List[String enum] | Yes | 商家愿意接受的 payment methods 列表。可能值为：`card` | None |

### Message (type = info)

| Field | Type | Required | Description | Validation |
| :----------- | :---------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| type | String | Yes | 表示 message 类型的 string value。对于 informational message，type 应为 `info.` | None |
| param | String | Yes | 指向 checkout session 中该 message 所引用 component 的 RFC 9535 JSONPath。例如，如果 message 引用第二个 line item，则 path 为 `$.line_items[1]`。 | None |
| content_type | String enum | Yes | 用于 rendering purposes 的 message content 类型。可能值为：`plain` `markdown` | None |
| content | String | Yes | Raw message content。 | None |

### Message (type = error)

| Field | Type | Required | Description | Validation |
| :----------- | :---------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| type | String | Yes | 表示 message 类型的 string value。对于 error message，type 应为 `error.` | None |
| code | String enum | Yes | Error code。可能值为：`missing` `invalid` `out_of_stock` `payment_declined` `requires_sign_in` `requires_3ds` | None |
| param | String | No | 指向 checkout session 中该 message 所引用 component 的 RFC 9535 JSONPath。例如，如果 message 引用第二个 line item，则 path 为 `$.line_items[1]`。 | None |
| content_type | String enum | Yes | 用于 rendering purposes 的 message content 类型。可能值为：`plain` `markdown` | None |
| content | String | Yes | Raw message content。 | None |

### Link

| Field | Type | Required | Description | Validation |
| :---- | :----------- | :------- | :-------------------------------------------------------------------------------------------- | :--------- |
| type | Enum(String) | Yes | link 类型。可能值为：`terms_of_use` `privacy_policy` `seller_shop_policies` | None |
| url | String | Yes | 指定为 URL 的 link content。 | None |

### Buyer

| Field | Type | Required | Description | Validation |
| :----------- | :----- | :------- | :------------------------------------------------------- | :------------------------- |
| name | String | Yes | Buyer 姓名。 | Max. length is 256 |
| email | String | Yes | 用于 communication 的 buyer email address。 | Max. length is 256 |
| phone_number | String | No | Buyer 的 optional phone number。 | Follows the E.164 standard |

### Line Item

| Field | Type | Required | Description | Validation |
| :---------- | :----- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| id | String | Yes | line item 的 id。这不同于 item 的 id，表示同一 item 的两个 line items 会有不同 line item ids。 | None |
| item | Item | Yes | 该 line item 表示的 item。 | None |
| base_amount | int | Yes | 表示调整前 item base amount 的整数。 | Should be &gt;= 0 |
| discount | int | Yes | 表示应用到 item 的任何 discount 的整数。 | Should be &gt;= 0 |
| subtotal | int | Yes | 表示所有调整后金额的整数。 | Should sum up to `base_amount - discount` Should be &gt;= 0 |
| tax | int | Yes | 表示 tax amount 的整数。 | Should be &gt;= 0 |
| total | int | Yes | 表示 total amount 的整数。 | Should sum up to `base_amount - discount + tax` Should be &gt;= 0 |

### Total

| Field | Type | Required | Description | Validation |
| :----------- | :---------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type | String enum | Yes | 表示 total 类型的 string value。可能值为：`items_base_amount` `items_discount` `subtotal` `discount` `fulfillment` `tax` `fee` `total` | None |
| display_text | String | Yes | 向客户显示的此 total 文本。 | None |
| amount | int | Yes | 以 minor units 表示 total amount 的整数。 | If type == `subtotal`, should sum to `items_base_amount - items_discount` If type == `total`, should sum to `items_base_amount - items_discount - discount + fulfillment + tax + fee` Should be &gt;= 0 |

### FulfillmentOption (type = shipping)

| Field | Type | Required | Description | Validation |
| :--------------------- | :----- | :------- | :--------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| type | String | Yes | 表示 fulfillment option 类型的 string value。对于 shipping option，该值应为 `shipping.` | None |
| id | String | Yes | 表示 shipping option 的唯一 ID。在所有 fulfillment options 中唯一。 | Unique across all fulfillment options. |
| title | String | Yes | 向客户显示的 shipping option title。 | None |
| subtitle | String | Yes | 向客户显示的描述预计 shipping timeline 的 text content。 | None |
| carrier | String | Yes | Shipping carrier 名称。 | None |
| earliest_delivery_time | String | Yes | 预计最早 delivery time，格式为 RFC 3339 string。 | Formatted as an RFC 3339 string. |
| latest_delivery_time | String | Yes | 预计最晚 delivery time，格式为 RFC 3339 string。 | Formatted as an RFC 3339 string. |
| subtotal | int | Yes | shipping option 的整数 subtotal cost，格式为 string。 | Should be &gt;= 0 |
| tax | int | Yes | 表示 tax amount 的整数。 | Should be &gt;= 0 |
| total | int | Yes | shipping option 的整数 total cost，格式为 string。 | Should sum to `subtotal + tax` |

### FulfillmentOption (type = digital)

| Field | Type | Required | Description | Validation |
| :------- | :----- | :------- | :------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| type | String | Yes | 表示 fulfillment option 类型的 string value。对于 digital option，该值应为 `digital.` | None |
| id | String | Yes | 表示 digital option 的唯一 ID。在所有 fulfillment options 中唯一。 | Unique across all fulfillment options. |
| title | String | Yes | 向客户显示的 digital option title。 | None |
| subtitle | String | No | 描述 item 将如何以数字方式交付给客户的 text content。 | None |
| subtotal | int | Yes | digital option 的整数 subtotal cost，格式为 string。 | Should be &gt;= 0 |
| tax | int | Yes | 表示 tax amount 的整数。 | Should be &gt;= 0 |
| total | int | Yes | digital option 的整数 total cost，格式为 string。 | Should sum to `subtotal + tax` |

### PaymentData

| Field | Type | Required | Description | Validation |
| :-------------- | :---------- | :------- | :------------------------------------------------------------------------------------------------- | :--------- |
| token | String | Yes | 表示 payment method 的 token。 | None |
| provider | String enum | Yes | 表示 payment processor 的 string value。可能值为：`stripe` `adyen` `braintree` | None |
| billing_address | Address | No | 与 payment method 关联的 optional billing address | None |

### Order

| Field | Type | Required | Description | Validation |
| :------------------ | :----- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| id | String | Yes | 标识完成 checkout session 后创建的 order 的唯一 id。 | None |
| checkout_session_id | String | Yes | 标识创建此 order 的 checkout session 的 id | None |
| permalink_url | String | Yes | 指向 order 的 URL。Customers 应能访问此 URL，并最多只需提供 email address 即可查看 order details。 | None |

## Webhooks

商家会在 order creation 和 update events 上向 OpenAI 发送 webhook events。这些 events 确保 buyer 的视图保持同步。Webhook events 将携带作为 request header 发送的 HMAC signature（即 `Merchant_Name-Signature`），该 signature 使用 webhook payload 创建，并使用 OpenAI 提供的 key 签名。

### Webhook Event

| Field | Type | Required | Description | Validation |
| :---- | :---------- | :------- | :------------------------------------------------------------------------------------------ | :--------- |
| type | String enum | Yes | 表示 event 类型的 string。可能值为：`order_created` `order_updated` | None |
| data | EventData | Yes | Webhook event data。更多信息请参见 EventData。 | None |

### EventData (type = order)

| Field | Type | Required | Description | Validation |
| :------------------ | :----------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| type | String | Yes | 表示 event data 类型的 string value。对于 order data，该值应为 `order` | None |
| checkout_session_id | String | Yes | 标识创建此 order 的 checkout session 的 ID。 | None |
| permalink_url | String | Yes | 指向 order 的 URL。Customers 应能访问此 URL，并最多只需提供 email address 即可查看 order details。 | None |
| status | String enum | Yes | 表示 order 最新 status 的 string。可能值为：`created` `manual_review` `confirmed` `canceled` `shipped` `fulfilled` | None |
| refunds | List[Refund] | Yes | 已为 order 签发的 refunds 列表。 | None |

### Refund

| Field | Type | Required | Description | Validation |
| :----- | :---------- | :------- | :--------------------------------------------------------------------------------------------- | :------------- |
| type | String enum | Yes | 表示 refund 类型的 string。可能值为：`store_credit` `original_payment` | None |
| amount | integer | Yes | 表示已 refund 的 total amount of money 的整数。 | Should be &gt;= 0 |

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

Enable merchants to run end-to-end checkout flows inside ChatGPT while keeping orders, payments, and compliance on their existing commerce stack.

**How it works**

1. Create session (REST). ChatGPT calls your `POST /checkout_sessions` to start a session with cart contents and buyer context; your response must include a rich, authoritative cart state.
2. Update session (REST). As the user changes items, shipping, or discounts, ChatGPT calls `POST /checkout_sessions/{checkout_session_id}`; each response returns the full cart state for display and validation.
3. Order events (webhooks). Your system publishes order lifecycle events (e.g., `order.created`, `order.updated`) to the provided webhook so ChatGPT stays in sync with fulfillment-grade truth.
4. Complete checkout (REST). ChatGPT finalizes via `POST /checkout_sessions/{checkout_session_id}/complete`; you confirm order creation and return the final cart and order identifiers.
5. Optionally, cancel checkouts using POST `/checkout_sessions/{checkout_session_id}/cancel` and get checkout information with `GET /checkout_sessions/{checkout_session_id}`.
6. Payments on your rails. You process payment with your existing PSP; if using Delegated Payments, accept the token and apply your normal authorization/capture flow.

**Key points**

- **Required endpoints.** Implement create, update, and complete checkout session REST endpoints; all responses must return a rich cart state (items, pricing, taxes/fees, shipping, discounts, totals, status).
- **Authoritative webhooks.** Emit order events to the provided webhook to keep state consistent across retries and edge cases.
- **Keep payments where they are.** Use your current PSP and settlement processes; integrate Delegated Payments only if applicable.
- **Security and robustness.** Authenticate every request, verify signatures, enforce idempotency, validate inputs, and support safe retries.
- **Certify integration.** Pass conformance checks (schema, error codes, rate limits, webhook delivery) to ensure reliable in-ChatGPT checkout.

## Checkout session

For users to place an order through ChatGPT, you must create, update and complete a Checkout session. This Checkout session holds information about items to be purchased, fulfillment information, and payment information.

As the user progresses through the checkout flow the Checkout session will be updated and move between various states.

The response to update calls, should return all checkout options, messages, and errors to be displayed to the user. Once the customer clicks “Buy”, the checkout session is completed with a selected payment method.

![State diagram showing order states](/openai-assets/developers.openai.com/images/commerce/commerce-order-states.png)

## REST endpoints

Merchants must implement the following five endpoints to place orders on behalf of ChatGPT users.

In the future, the Agentic Checkout Spec will support MCP servers.

### Common features of all endpoints

All endpoints must use HTTPS and return JSON.

#### Request headers

All endpoints will be called with the following headers set:

| Field           | Description                                               | Example Value                                   |
| :-------------- | :-------------------------------------------------------- | :---------------------------------------------- |
| Authorization   | API Key used to make requests                             | `Bearer api_key_123`                            |
| Accept-Language | The preferred locale for content like messages and errors | `en-US`                                         |
| User-Agent      | Information about the client making this request          | `ChatGPT/2.0 (Mac OS X 15.0.1; arm64; build 0)` |
| Idempotency-Key | Key used to ensure requests are idempotent                | `idempotency_key_123`                           |
| Request-Id      | Unique key for each request for tracing purposes          | `request_id_123`                                |
| Content-Type    | Type of request content                                   | `application/json`                              |
| Signature       | Base64 encoded signature of the request body              | `eyJtZX...`                                     |
| Timestamp       | Formatted as an RFC 3339 string.                          | 2025-09-25T10:30:00Z                            |
| API-Version     | API version                                               | 2025-09-12                                      |

#### Response headers

| Field           | Description                           | Example Value         |
| :-------------- | :------------------------------------ | :-------------------- |
| Idempotency-Key | Idempotency key passed in the request | `idempotency_key_123` |
| Request-Id      | Request ID passed in the request      | `request_id_123`      |

### POST /checkout_sessions

Call direction: OpenAI -&gt; Merchant

This is the initial call to create a checkout session. The call will contain information about the items the customer wishes to purchase and should return line item information, along with any messages or errors to be displayed to the customer. It should always return a checkout session id. All responses should be returned with a 201 status.

#### Request

| Field               | Type       | Required | Description                                                 | Validation                 |
| :------------------ | :--------- | :------- | :---------------------------------------------------------- | :------------------------- |
| buyer               | Buyer      | No       | Optional information about the buyer.                       | None                       |
| items               | List[Item] | Yes      | The initial list of items to initiate the checkout session. | Should be a non empty list |
| fulfillment_address | Address    | No       | Optional fulfillment address if present.                    | None                       |

#### Response

| Field                 | Type                    | Required | Description                                                                                                                     | Validation                                        |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id                    | String                  | Yes      | Unique id that identifies the checkout session. This id will be used to update the checkout session in subsequent calls.        | None                                              |
| buyer                 | Buyer                   | No       | Buyer information, if provided                                                                                                  | None                                              |
| payment_provider      | PaymentProvider         | Yes      | Payment provider that will be used to complete this transaction.                                                                | None                                              |
| status                | String enum             | Yes      | Current status of the checkout session. Possible values are: `not_ready_for_payment` `ready_for_payment` `completed` `canceled` | None                                              |
| currency              | String                  | Yes      | Currency code as per the ISO 4217 standard                                                                                      | Should follow the ISO 4217 standard in lower case |
| line_items            | List[LineItem]          | Yes      | List of items and computed costs.                                                                                               | None                                              |
| fulfillment_address   | Address                 | No       | Address to ship items to.                                                                                                       | None                                              |
| fulfillment_options   | List[FulfillmentOption] | Yes      | All available fulfillment options and associated costs.                                                                         | None                                              |
| fulfillment_option_id | String                  | No       | Id of the selected fulfillment option.                                                                                          | None                                              |
| totals                | List[Total]             | Yes      | List of totals.                                                                                                                 | None                                              |
| messages              | List[Message]           | Yes      | List of informational and error messages to be displayed to the customer.                                                       | None                                              |
| links                 | List[Link]              | Yes      | List of links (e.g. ToS/privacy policy/etc.) to be displayed to the customer.                                                   | None                                              |

#### Examples

1. Creating a checkout session with a single item and quantity. No fulfillment address is provided, so the checkout cannot be completed.

```json
POST Request to /checkout_sessions

{
   "items": [
       {
           "id": "item_123",
           "quantity": 1
       }
   ]
}
```

```json
Response

{
   "id": "checkout_session_123",
   "payment_provider": {
       "provider": "stripe",
       "supported_payment_methods": ["card"]
   },
   "status": "in_progress",
   "currency": "usd",
   "line_items": [
       {
           "id": "line_item_123",
           "item": {
               "id": "item_123",
               "quantity": 1
           },
           "base_amount": 300,
           "discount": 0,
           "subtotal": 300,
           "tax": 30,
           "total": 330
       }
   ],
   "totals": [
       {
           "type": "items_base_amount",
           "display_text": "Item(s) total",
           "amount": 300
       },
       {
           "type": "subtotal",
           "display_text": "Subtotal",
           "amount": 300
       },
       {
           "type": "tax",
           "display_text": "Tax",
           "amount": "0.30"
       },
       {
           "type": "total",
           "display_text": "Total",
           "amount": 330
       }
   ],
   "fulfillment_options": [],
   "messages": [
       {
           "type": "error",
           "code": "out_of_stock",
           "path": "$.line_items[0]",
           "content_type": "plain",
           "content": "This item is not available for sale.",
       }
   ],
   "links": [
       {
           "type": "terms_of_use",
           "url": "https://www.testshop.com/legal/terms-of-use"
       }
   ]
}
```

2. Creating a checkout session with a single item and quantity, and a provided fulfillment address. Since a fulfillment address is provided, taxes are returned as well. Fulfillment options are also available, and the cheapest one is selected by default. Any messages to show to the customer based on their fulfillment address (e.g. CA 65 warning) are also returned.

```json
POST Request to /checkout_sessions

{
   "items": [
       {
           "id": "item_456",
           "quantity": 1
       }
   ],
   "fulfillment_address": {
       "name": "test",
       "line_one": "1234 Chat Road",
       "line_two": "Apt 101",
       "city": "San Francisco",
       "state": "CA",
       "country": "US",
       "postal_code": "94131"
   }
}

```

```json
Response

{
   "id": "checkout_session_123",
   "payment_provider": {
       "provider": "stripe",
       "supported_payment_methods": ["card"]
   },
   "status": "ready_for_payment",
   "currency": "usd",
   "line_items": [
       {
           "id": "line_item_456",
           "item": {
               "id": "item_456",
               "quantity": 1
           },
           "base_amount": 300,
           "discount": 0,
           "subtotal": 0,
           "tax": 30,
           "total": 330
       }
   ],
   "fulfillment_address": {
       "name": "test",
       "line_one": "1234 Chat Road",
       "line_two": "Apt 101",
       "city": "San Francisco",
       "state": "CA",
       "country": "US",
       "postal_code": "94131"
   },
   "fulfillment_option_id": "fulfillment_option_123",
   "totals": [
       {
           "type": "items_base_amount",
           "display_text": "Item(s) total",
           "amount": 300
       },
       {
           "type": "subtotal",
           "display_text": "Subtotal",
           "amount": 300
       },
       {
           "type": "tax",
           "display_text": "Tax",
           "amount": 30
       },
       {
           "type": "fulfillment",
           "display_text": "Fulfillment",
           "amount": 100
       },
       {
           "type": "total",
           "display_text": "Total",
           "amount": 430
       }
   ],
   "fulfillment_options": [
       {
           "type": "shipping",
           "id": "fulfillment_option_123",
           "title": "Standard",
           "subtitle": "Arrives in 4-5 days",
           "carrier": "USPS",
           "earliest_delivery_time": "2025-10-12T07:20:50.52Z",
           "latest_delivery_time": "2025-10-13T07:20:50.52Z",
           "subtotal": 100,
           "tax": 0,
           "total": 100
       },
       {
           "type": "shipping",
           "id": "fulfillment_option_456",
           "title": "Express",
           "subtitle": "Arrives in 1-2 days",
           "carrier": "USPS",
           "earliest_delivery_time": "2025-10-09T07:20:50.52Z",
           "latest_delivery_time": "2025-10-10T07:20:50.52Z",
           "subtotal": 500,
           "tax": 0,
           "total": 500
       }
   ],
   "messages": [],
   "links": [
       {
           "type": "terms_of_use",
           "url": "https://www.testshop.com/legal/terms-of-use"
       }
   ]
}
```

### POST `/checkout_sessions/{checkout_session_id}`

Call direction: OpenAI -&gt; Merchant

This endpoint will be called on checkout session updates, such as a change in fulfillment address or fulfillment option. The endpoint should return updated costs, new options (e.g. new fulfillment options based on update in fulfillment address), and any new errors.

#### Request

| Field                 | Type       | Required | Description                                                           | Validation |
| :-------------------- | :--------- | :------- | :-------------------------------------------------------------------- | :--------- |
| buyer                 | Buyer      | No       | Optional information about the buyer.                                 | None       |
| items                 | List[Item] | No       | Optional list of updated items to be purchased.                       | None       |
| fulfillment_address   | Address    | No       | Newly added or updated fulfillment address specified by the customer. | None       |
| fulfillment_option_id | String     | No       | Id of the fulfillment option specified by the customer.               | None       |

#### Response

| Field                 | Type                    | Required | Description                                                                                                                     | Validation                                        |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id                    | String                  | Yes      | Unique id that identifies the checkout session. This id will be used to update the checkout session in subsequent calls.        | None                                              |
| buyer                 | Buyer                   | No       | Buyer information, if provided                                                                                                  | None                                              |
| status                | String enum             | Yes      | Current status of the checkout session. Possible values are: `not_ready_for_payment` `ready_for_payment` `completed` `canceled` | None                                              |
| currency              | String                  | Yes      | Currency code as per the ISO 4217 standard                                                                                      | Should follow the ISO 4217 standard in lower case |
| line_items            | List[LineItem]          | Yes      | List of items and computed costs.                                                                                               | None                                              |
| fulfillment_address   | Address                 | No       | Address to ship items to.                                                                                                       | None                                              |
| fulfillment_options   | List[FulfillmentOption] | Yes      | All available fulfillment options and associated costs.                                                                         | None                                              |
| fulfillment_option_id | String                  | No       | Id of the selected fulfillment option.                                                                                          | None                                              |
| totals                | List[Total]             | Yes      | List of totals.                                                                                                                 | None                                              |
| messages              | List[Message]           | Yes      | List of informational and error messages to be displayed to the customer.                                                       | None                                              |
| links                 | List[Link]              | Yes      | List of links (e.g. ToS/privacy policy/etc.) to be displayed to the customer.                                                   | None                                              |

#### Example

Updating the fulfillment option updates the checkout session totals.

```json
POST Request to /checkout_sessions/checkout_session_123

{
   "fulfillment_option_id": "fulfillment_option_456"
}
```

```json
Response

{
   "id": "checkout_session_123",
   "status": "ready_for_payment",
   "currency": "usd",
   "line_items": [
       {
           "id": "line_item_456",
           "item": {
               "id": "item_456",
               "quantity": 1
           },
           "base_amount": 300,
           "discount": 0,
           "subtotal": 0,
           "tax": 30,
           "total": 330
       }
   ],
   "fulfillment_address": {
       "name": "test",
       "line_one": "1234 Chat Road",
       "line_two": "Apt 101",
       "city": "San Francisco",
       "state": "CA",
       "country": "US",
       "postal_code": "94131"
   },
   "fulfillment_option_id": "fulfillment_option_456",
   "totals": [
       {
           "type": "items_base_amount",
           "display_text": "Item(s) total",
           "amount": 300
       },
       {
           "type": "subtotal",
           "display_text": "Subtotal",
           "amount": 300
       },
       {
           "type": "tax",
           "display_text": "Tax",
           "amount": 30
       },
       {
           "type": "fulfillment",
           "display_text": "Fulfillment",
           "amount": 500
       },
       {
           "type": "total",
           "display_text": "Total",
           "amount": 830
       }
   ],
   "fulfillment_options": [
       {
           "type": "shipping",
           "id": "fulfillment_option_123",
           "title": "Standard",
           "subtitle": "Arrives in 4-5 days",
           "carrier": "USPS",
           "earliest_delivery_time": "2025-10-12T07:20:50.52Z",
           "latest_delivery_time": "2025-10-13T07:20:50.52Z",
           "subtotal": 100,
           "tax": 0,
           "total": 100
       },
       {
           "type": "shipping",
           "id": "fulfillment_option_456",
           "title": "Express",
           "subtitle": "Arrives in 1-2 days",
           "carrier": "USPS",
           "earliest_delivery_time": "2025-10-09T07:20:50.52Z",
           "latest_delivery_time": "2025-10-10T07:20:50.52Z",
           "subtotal": 500,
           "tax": 0,
           "total": 500
       }
   ],
   "messages": [],
   "links": [
       {
           "type": "terms_of_use",
           "url": "https://www.testshop.com/legal/terms-of-use"
       }
   ]
}
```

### POST `/checkout_sessions/{checkout_session_id}/complete`

Call direction: OpenAI -&gt; Merchant

The endpoint will be called with the payment method to complete the purchase. It is expected that the checkout session will be completed and an order will be created after this call. Any errors that prevent this from happening should be returned in the response.

#### Request

| Field        | Type        | Required | Description                                         | Validation |
| :----------- | :---------- | :------- | :-------------------------------------------------- | :--------- |
| buyer        | Buyer       | No       | Optional information about the buyer.               | None       |
| payment_data | PaymentData | Yes      | Payment data used to complete the checkout session. | None       |

#### Response

| Field                 | Type                    | Required | Description                                                                                                                     | Validation                                        |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id                    | String                  | Yes      | Unique id that identifies the checkout session. This id will be used to update the checkout session in subsequent calls.        | None                                              |
| buyer                 | Buyer                   | Yes      | Buyer information                                                                                                               | None                                              |
| status                | String enum             | Yes      | Current status of the checkout session. Possible values are: `not_ready_for_payment` `ready_for_payment` `completed` `canceled` | None                                              |
| currency              | String                  | Yes      | Currency code as per the ISO 4217 standard                                                                                      | Should follow the ISO 4217 standard in lower case |
| line_items            | List[LineItem]          | Yes      | List of items and computed costs.                                                                                               | None                                              |
| fulfillment_address   | Address                 | No       | Address to ship items to.                                                                                                       | None                                              |
| fulfillment_options   | List[FulfillmentOption] | Yes      | All available fulfillment options and associated costs.                                                                         | None                                              |
| fulfillment_option_id | String                  | No       | Id of the selected fulfillment option.                                                                                          | None                                              |
| totals                | List[Total]             | Yes      | List of totals.                                                                                                                 | None                                              |
| order                 | Order                   | No       | Order that is created after the checkout session completes.                                                                     | None                                              |
| messages              | List[Message]           | Yes      | List of informational and error messages to be displayed to the customer.                                                       | None                                              |
| links                 | List[Link]              | Yes      | List of links (e.g. ToS/privacy policy/etc.) to be displayed to the customer.                                                   | None                                              |

#### Example

Completing the checkout session with an encrypted payload representing the payment method.

```json
POST Request to /checkout_sessions/checkout_session_123/complete

{
   "buyer": {
       "name": "John Smith",
       "email": "johnsmith@mail.com",
       "phone_number": "+15552003434"
   },
   "payment_data": {
       "token": "spt_123",
       "provider": "stripe",
       "billing_address": {
           "name": "test",
           "line_one": "1234 Chat Road",
           "line_two": "Apt 101",
           "city": "San Francisco",
           "state": "CA",
           "country": "US",
           "postal_code": "94131",
           "phone_number": "+15552428478"
       }
   }
}

```

```json
Response

{
   "id": "checkout_session_123",
   "buyer": {
       "name": "John Smith",
       "email": "johnsmith@mail.com",
       "phone_number": "+15552003434"
   },
   "status": "completed",
   "currency": "usd",
   "line_items": [
       {
           "id": "line_item_456",
           "item": {
               "id": "item_456",
               "quantity": 1
           },
           "base_amount": 300,
           "discount": 0,
           "subtotal": 300,
           "tax": 30,
           "total": 330
       }
   ],
   "fulfillment_address": {
       "name": "test",
       "line_one": "1234 Chat Road",
       "line_two": "Apt 101",
       "city": "San Francisco",
       "state": "CA",
       "country": "US",
       "postal_code": "94131"
   },
   "fulfillment_option_id": "fulfillment_option_123",
   "totals": [
       {
           "type": "items_base_amount",
           "display_text": "Item(s) total",
           "amount": 300
       },
       {
           "type": "subtotal",
           "display_text": "Subtotal",
           "amount": 300
       },
       {
           "type": "tax",
           "display_text": "Tax",
           "amount": 30
       },
       {
           "type": "fulfillment",
           "display_text": "Fulfillment",
           "Amount": 100
       },
       {
           "type": "total",
           "display_text": "Total",
           "amount": 430
       }
   ],
   "fulfillment_options": [
       {
           "type": "shipping",
           "id": "fulfillment_option_123",
           "title": "Standard",
           "subtitle": "Arrives in 4-5 days",
           "carrier": "USPS",
           "earliest_delivery_time": "2025-10-12T07:20:50.52Z",
           "latest_delivery_time": "2025-10-13T07:20:50.52Z",
           "subtotal": 100,
           "tax": 0,
           "total": 100
       },
       {
           "type": "shipping",
           "id": "fulfillment_option_456",
           "title": "Express",
           "subtitle": "Arrives in 1-2 days",
           "carrier": "USPS",
           "earliest_delivery_time": "2025-10-09T07:20:50.52Z",
           "latest_delivery_time": "2025-10-10T07:20:50.52Z",
           "subtotal": 500,
           "tax": 0,
           "total": 500
       }
   ],
   "messages": [],
   "links": [
       {
           "type": "terms_of_use",
           "url": "https://www.testshop.com/legal/terms-of-use"
       }
   ]
}
```

### POST `/checkout_sessions/{checkout_session_id}/cancel`

This endpoint will be used to cancel a checkout session, if it can be canceled. If the checkout session cannot be canceled (e.g. if the checkout session is already canceled or completed), then the server should send back a response with status 405. Any checkout session with a status that is not equal to completed or canceled should be cancelable.

#### Request

None

#### Response

| Field                 | Type                    | Required | Description                                                                                                                     | Validation                                        |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id                    | String                  | Yes      | Unique id that identifies the checkout session. This id will be used to update the checkout session in subsequent calls.        | None                                              |
| buyer                 | Buyer                   | No       | Buyer information, if provided                                                                                                  | None                                              |
| status                | String enum             | Yes      | Current status of the checkout session. Possible values are: `not_ready_for_payment` `ready_for_payment` `completed` `canceled` | None                                              |
| currency              | String                  | Yes      | Currency code as per the ISO 4217 standard                                                                                      | Should follow the ISO 4217 standard in lower case |
| line_items            | List[LineItem]          | Yes      | List of items and computed costs.                                                                                               | None                                              |
| fulfillment_address   | Address                 | No       | Address to ship items to.                                                                                                       | None                                              |
| fulfillment_options   | List[FulfillmentOption] | Yes      | All available fulfillment options and associated costs.                                                                         | None                                              |
| fulfillment_option_id | String                  | No       | Id of the selected fulfillment option.                                                                                          | None                                              |
| totals                | List[Total]             | Yes      | List of totals.                                                                                                                 | None                                              |
| messages              | List[Message]           | Yes      | List of informational and error messages to be displayed to the customer.                                                       | None                                              |
| links                 | List[Link]              | Yes      | List of links (e.g. ToS/privacy policy/etc.) to be displayed to the customer.                                                   | None                                              |

### GET `/checkout_sessions/{checkout_session_id}`

This endpoint is used to return update to date information about the checkout session. If the checkout session is not found, then the server should return a response with status 404.

#### Request

None

#### Response

| Field                 | Type                    | Required | Description                                                                                                                     | Validation                                        |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id                    | String                  | Yes      | Unique id that identifies the checkout session. This id will be used to update the checkout session in subsequent calls.        | None                                              |
| buyer                 | Buyer                   | No       | Buyer information, if provided                                                                                                  | None                                              |
| status                | String enum             | Yes      | Current status of the checkout session. Possible values are: `not_ready_for_payment` `ready_for_payment` `completed` `canceled` | None                                              |
| currency              | String                  | Yes      | Currency code as per the ISO 4217 standard                                                                                      | Should follow the ISO 4217 standard in lower case |
| line_items            | List[LineItem]          | Yes      | List of items and computed costs.                                                                                               | None                                              |
| fulfillment_address   | Address                 | No       | Address to ship items to.                                                                                                       | None                                              |
| fulfillment_options   | List[FulfillmentOption] | Yes      | All available fulfillment options and associated costs.                                                                         | None                                              |
| fulfillment_option_id | String                  | No       | Id of the selected fulfillment option.                                                                                          | None                                              |
| totals                | List[Total]             | Yes      | List of totals.                                                                                                                 | None                                              |
| messages              | List[Message]           | Yes      | List of informational and error messages to be displayed to the customer.                                                       | None                                              |
| links                 | List[Link]              | Yes      | List of links (e.g. ToS/privacy policy/etc.) to be displayed to the customer.                                                   | None                                              |

### Response Errors

If the server is unable to return a 201 response, then it should return an error of the following shape with a 4xx/5xx status.

#### Error

| Field   | Type        | Required | Description                                                            |
| :------ | :---------- | :------- | :--------------------------------------------------------------------- |
| type    | String enum | Yes      | Error type. Possible values are: `invalid_request`                     |
| code    | String enum | Yes      | Error code. Possible values are: `request_not_idempotent`              |
| message | String      | Yes      | Human‑readable description of the error.                               |
| param   | String      | No       | JSONPath referring to the offending request body field, if applicable. |

## Object definitions

### Item

| Field    | Type   | Required | Description                                        | Example Value | Validation                                   |
| :------- | :----- | :------- | :------------------------------------------------- | :------------ | :------------------------------------------- |
| id       | string | Yes      | Id of a piece of merchandise that can be purchased | `“itm_123”`   | `None`                                       |
| quantity | int    | Yes      | Quantity of the item for fulfillment               | `1`           | Should be a positive integer greater than 0. |

### Address

| Field        | Type   | Required | Description                                      | Validation                            |
| :----------- | :----- | :------- | :----------------------------------------------- | :------------------------------------ |
| name         | String | Yes      | Name of the person to whom the items are shipped | Max. length is 256                    |
| line_one     | String | Yes      | First line of address                            | Max. length is 60                     |
| line_two     | String | No       | Optional second line of address                  | Max. length is 60                     |
| city         | String | Yes      | Address city/district/suburb/town/village.       | Max. length is 60                     |
| state        | String | Yes      | Address state/county/province/region.            | Should follow the ISO 3166-1 standard |
| country      | String | Yes      | Address country                                  | Should follow the ISO 3166-1 standard |
| postal_code  | String | Yes      | Address postal code or zip code                  | Max. length is 20                     |
| phone_number | String | No       | Optional phone number                            | Follows the E.164 standard            |

### PaymentProvider

| Field                     | Type              | Required | Description                                                                                    | Validation |
| :------------------------ | :---------------- | :------- | :--------------------------------------------------------------------------------------------- | :--------- |
| provider                  | String enum       | Yes      | String value representing payment processor. Possible values are: `stripe` `adyen` `braintree` | None       |
| supported_payment_methods | List[String enum] | Yes      | List of payment methods that the merchant is willing to accept. Possible values are: `card`    | None       |

### Message (type = info)

| Field        | Type        | Required | Description                                                                                                                                                                                          | Validation |
| :----------- | :---------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| type         | String      | Yes      | String value representing the type of message. For an informational message, the type should be `info.`                                                                                              | None       |
| param        | String      | Yes      | RFC 9535 JSONPath to the component of the checkout session that the message is referring to. For instance, if the message is referring to the second line item, the path would be `$.line_items[1]`. | None       |
| content_type | String enum | Yes      | Type of the message content for rendering purposes. Possible values are: `plain` `markdown`                                                                                                          | None       |
| content      | String      | Yes      | Raw message content.                                                                                                                                                                                 | None       |

### Message (type = error)

| Field        | Type        | Required | Description                                                                                                                                                                                          | Validation |
| :----------- | :---------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| type         | String      | Yes      | String value representing the type of message. For an error message, the type should be `error.`                                                                                                     | None       |
| code         | String enum | Yes      | Error code. Possible values are: `missing` `invalid` `out_of_stock` `payment_declined` `requires_sign_in` `requires_3ds`                                                                             | None       |
| param        | String      | No       | RFC 9535 JSONPath to the component of the checkout session that the message is referring to. For instance, if the message is referring to the second line item, the path would be `$.line_items[1]`. | None       |
| content_type | String enum | Yes      | Type of the message content for rendering purposes. Possible values are: `plain` `markdown`                                                                                                          | None       |
| content      | String      | Yes      | Raw message content.                                                                                                                                                                                 | None       |

### Link

| Field | Type         | Required | Description                                                                                   | Validation |
| :---- | :----------- | :------- | :-------------------------------------------------------------------------------------------- | :--------- |
| type  | Enum(String) | Yes      | Type of the link. Possible values are: `terms_of_use` `privacy_policy` `seller_shop_policies` | None       |
| url   | String       | Yes      | Link content specified as a URL.                                                              | None       |

### Buyer

| Field        | Type   | Required | Description                                              | Validation                 |
| :----------- | :----- | :------- | :------------------------------------------------------- | :------------------------- |
| name         | String | Yes      | Name of the buyer.                                       | Max. length is 256         |
| email        | String | Yes      | Email address of the buyer to be used for communication. | Max. length is 256         |
| phone_number | String | No       | Optional phone number of the buyer.                      | Follows the E.164 standard |

### Line Item

| Field       | Type   | Required | Description                                                                                                                                   | Validation                                                     |
| :---------- | :----- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| id          | String | Yes      | Id of the line item. This is different from the id of the item - two line items representing the same item will have different line item ids. | None                                                           |
| item        | Item   | Yes      | Item that is represented by the line item.                                                                                                    | None                                                           |
| base_amount | int    | Yes      | Integer representing item base amount before adjustments.                                                                                     | Should be &gt;= 0                                                 |
| discount    | int    | Yes      | Integer representing any discount applied to the item.                                                                                        | Should be &gt;= 0                                                 |
| subtotal    | int    | Yes      | Integer representing amount after all adjustments.                                                                                            | Should sum up to `base_amount - discount` Should be &gt;= 0       |
| tax         | int    | Yes      | Integer representing tax amount.                                                                                                              | Should be &gt;= 0                                                 |
| total       | int    | Yes      | Integer representing total amount.                                                                                                            | Should sum up to `base_amount - discount + tax` Should be &gt;= 0 |

### Total

| Field        | Type        | Required | Description                                                                                                                                                    | Validation                                                                                                                                                                                           |
| :----------- | :---------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type         | String enum | Yes      | String value representing the type of total. Possible values are: `items_base_amount` `items_discount` `subtotal` `discount` `fulfillment` `tax` `fee` `total` | None                                                                                                                                                                                                 |
| display_text | String      | Yes      | The text displayed to the customer for this total.                                                                                                             | None                                                                                                                                                                                                 |
| amount       | int         | Yes      | Integer representing total amount in minor units.                                                                                                              | If type == `subtotal`, should sum to `items_base_amount - items_discount` If type == `total`, should sum to `items_base_amount - items_discount - discount + fulfillment + tax + fee` Should be &gt;= 0 |

### FulfillmentOption (type = shipping)

| Field                  | Type   | Required | Description                                                                                                      | Validation                             |
| :--------------------- | :----- | :------- | :--------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| type                   | String | Yes      | String value representing the type of fulfillment option. For a shipping option, the value should be `shipping.` | None                                   |
| id                     | String | Yes      | Unique ID that represents the shipping option. Unique across all fulfillment options.                            | Unique across all fulfillment options. |
| title                  | String | Yes      | Title of the shipping option to display to the customer.                                                         | None                                   |
| subtitle               | String | Yes      | Text content describing the estimated timeline for shipping to display to the customer.                          | None                                   |
| carrier                | String | Yes      | Name of the shipping carrier.                                                                                    | None                                   |
| earliest_delivery_time | String | Yes      | Estimated earliest delivery time, formatted as an RFC 3339 string.                                               | Formatted as an RFC 3339 string.       |
| latest_delivery_time   | String | Yes      | Estimated latest delivery time, formatted as an RFC 3339 string.                                                 | Formatted as an RFC 3339 string.       |
| subtotal               | int    | Yes      | Integer subtotal cost of the shipping option, formatted as a string.                                             | Should be &gt;= 0                         |
| tax                    | int    | Yes      | Integer representing tax amount.                                                                                 | Should be &gt;= 0                         |
| total                  | int    | Yes      | Integer total cost of the shipping option, formatted as a string.                                                | Should sum to `subtotal + tax`         |

### FulfillmentOption (type = digital)

| Field    | Type   | Required | Description                                                                                                    | Validation                             |
| :------- | :----- | :------- | :------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| type     | String | Yes      | String value representing the type of fulfillment option. For a digital option, the value should be `digital.` | None                                   |
| id       | String | Yes      | Unique ID that represents the digital option. Unique across all fulfillment options.                           | Unique across all fulfillment options. |
| title    | String | Yes      | Title of the digital option to display to the customer.                                                        | None                                   |
| subtitle | String | No       | Text content describing how the item will be digitally delivered to the customer.                              | None                                   |
| subtotal | int    | Yes      | Integer subtotal cost of the digital option, formatted as a string.                                            | Should be &gt;= 0                         |
| tax      | int    | Yes      | Integer representing tax amount.                                                                               | Should be &gt;= 0                         |
| total    | int    | Yes      | Integer total cost of the digital option, formatted as a string.                                               | Should sum to `subtotal + tax`         |

### PaymentData

| Field           | Type        | Required | Description                                                                                        | Validation |
| :-------------- | :---------- | :------- | :------------------------------------------------------------------------------------------------- | :--------- |
| token           | String      | Yes      | Token that represents the payment method.                                                          | None       |
| provider        | String enum | Yes      | String value representing the payment processor. Possible values are: `stripe` `adyen` `braintree` | None       |
| billing_address | Address     | No       | Optional billing address associated with the payment method                                        | None       |

### Order

| Field               | Type   | Required | Description                                                                                                                             | Validation |
| :------------------ | :----- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| id                  | String | Yes      | Unique id that identifies the order that is created after completing the checkout session.                                              | None       |
| checkout_session_id | String | Yes      | Id that identifies the checkout session that created this order                                                                         | None       |
| permalink_url       | String | Yes      | URL that points to the order. Customers should be able to visit this URL and provide at most their email address to view order details. | None       |

## Webhooks

The merchant sends OpenAI webhook events on order creation and update events. These events ensure that the buyer’s view stays in sync. The webhook events will be sent with a HMAC signature sent as a request header (i.e. `Merchant_Name-Signature`) that is created using the webhook payload and signed using a key provided by OpenAI.

### Webhook Event

| Field | Type        | Required | Description                                                                                 | Validation |
| :---- | :---------- | :------- | :------------------------------------------------------------------------------------------ | :--------- |
| type  | String enum | Yes      | String representing the type of event. Possible values are: `order_created` `order_updated` | None       |
| data  | EventData   | Yes      | Webhook event data. See EventData for more information.                                     | None       |

### EventData (type = order)

| Field               | Type         | Required | Description                                                                                                                                     | Validation |
| :------------------ | :----------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| type                | String       | Yes      | String value representing the type of event data. For order data, the value should be `order`                                                   | None       |
| checkout_session_id | String       | Yes      | ID that identifies the checkout session that created this order.                                                                                | None       |
| permalink_url       | String       | Yes      | URL that points to the order. Customers should be able to visit this URL and provide at most their email address to view order details.         | None       |
| status              | String enum  | Yes      | String representing the latest status of the order. Possible values are: `created` `manual_review` `confirmed` `canceled` `shipped` `fulfilled` | None       |
| refunds             | List[Refund] | Yes      | List of refunds that have been issued for the order.                                                                                            | None       |

### Refund

| Field  | Type        | Required | Description                                                                                    | Validation     |
| :----- | :---------- | :------- | :--------------------------------------------------------------------------------------------- | :------------- |
| type   | String enum | Yes      | String representing the type of refund. Possible values are: `store_credit` `original_payment` | None           |
| amount | integer     | Yes      | Integer representing total amount of money refunded.                                           | Should be &gt;= 0 |

:::
:::

