---
status: needs-review
sourceId: "44bda052c706"
sourceChecksum: "44bda052c70642fbdb3df10698c1a9d9175a6b511346e8c09cf999256342d0d7"
sourceUrl: "https://developers.openai.com/commerce/specs/checkout"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# Agentic Checkout Spec（Agentic Checkout 规范）

## 概览

让商家能够在 ChatGPT 内运行端到端 checkout flows，同时将 orders、payments 和 compliance 保持在其现有 commerce stack 上。

**工作方式**

1. Create session (REST)。ChatGPT 调用你的 `POST /checkout_sessions`，使用 cart contents 和 buyer context 启动 session；你的响应必须包含丰富、权威的 cart state。
2. Update session (REST)。当用户更改 items、shipping 或 discounts 时，ChatGPT 调用 `POST /checkout_sessions/{checkout_session_id}`；每个响应都会返回用于显示和验证的完整 cart state。
3. Order events (webhooks)。你的系统将 order lifecycle events（例如 `order.created`、`order.updated`）发布到提供的 webhook，使 ChatGPT 与 fulfillment-grade truth 保持同步。
4. Complete checkout (REST)。ChatGPT 通过 `POST /checkout_sessions/{checkout_session_id}/complete` 完成结账；你确认 order creation 并返回最终 cart 和 order identifiers。
5. 可选地，使用 POST `/checkout_sessions/{checkout_session_id}/cancel` 取消 checkouts，并使用 `GET /checkout_sessions/{checkout_session_id}` 获取 checkout information。
6. Payments on your rails。你使用现有 PSP 处理 payment；如果使用 Delegated Payments，请接受 token 并应用你的常规 authorization/capture flow。

**要点**

- **必需端点。** 实现 create、update 和 complete checkout session REST endpoints；所有 responses 都必须返回丰富的 cart state（items、pricing、taxes/fees、shipping、discounts、totals、status）。
- **权威 webhooks。** 向提供的 webhook 发送 order events，以在 retries 和 edge cases 中保持状态一致。
- **付款保留在现有体系中。** 使用你当前的 PSP 和 settlement processes；仅在适用时集成 Delegated Payments。
- **安全性和稳健性。** 认证每个 request、验证 signatures、强制 idempotency、验证 inputs，并支持安全 retries。
- **认证集成。** 通过 conformance checks（schema、error codes、rate limits、webhook delivery），确保可靠的 in-ChatGPT checkout。

## Checkout session（结账会话）

为了让用户通过 ChatGPT 下单，你必须创建、更新并完成 Checkout session。该 Checkout session 保存有关待购买 items、fulfillment information 和 payment information 的信息。

随着用户推进 checkout flow，Checkout session 会被更新，并在不同状态之间移动。

update calls 的 response 应返回所有要显示给用户的 checkout options、messages 和 errors。客户点击 “Buy” 后，checkout session 会使用所选 payment method 完成。

![State diagram showing order states](https://developers.openai.com/images/commerce/commerce-order-states.png)

## REST endpoints（REST 端点）

商家必须实现以下五个 endpoints，代表 ChatGPT 用户下单。

未来，Agentic Checkout Spec 将支持 MCP servers。

### 所有端点的共同特性

所有 endpoints 都必须使用 HTTPS 并返回 JSON。

#### Request headers（请求标头）

所有 endpoints 调用时都会设置以下 headers：

| 字段 | 说明 | 示例值 |
| :-------------- | :-------------------------------------------------------- | :---------------------------------------------- |
| Authorization | 用于发起 requests 的 API Key | `Bearer api_key_123` |
| Accept-Language | messages 和 errors 等内容的首选 locale | `en-US` |
| User-Agent | 关于发起此 request 的 client 信息 | `ChatGPT/2.0 (Mac OS X 15.0.1; arm64; build 0)` |
| Idempotency-Key | 用于确保 requests idempotent 的 key | `idempotency_key_123` |
| Request-Id | 每个 request 的唯一 key，用于 tracing purposes | `request_id_123` |
| Content-Type | request content 的类型 | `application/json` |
| Signature | request body 的 Base64 encoded signature | `eyJtZX...` |
| Timestamp | 格式为 RFC 3339 string。 | 2025-09-25T10:30:00Z |
| API-Version | API 版本 | 2025-09-12 |

#### Response headers（响应标头）

| 字段 | 说明 | 示例值 |
| :-------------- | :------------------------------------ | :-------------------- |
| Idempotency-Key | request 中传入的 idempotency key | `idempotency_key_123` |
| Request-Id | request 中传入的 request ID | `request_id_123` |

### POST /checkout_sessions

调用方向：OpenAI -> Merchant

这是创建 checkout session 的初始调用。该调用会包含客户希望购买的 items 信息，并应返回 line item information，以及需要展示给客户的任何 messages 或 errors。它应始终返回 checkout session id。所有 responses 都应以 201 status 返回。

#### Request（请求）

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :------------------ | :--------- | :------- | :---------------------------------------------------------- | :------------------------- |
| buyer | Buyer | 否 | 关于 buyer 的可选信息。 | 无 |
| items | List[Item] | 是 | 用于启动 checkout session 的初始 items 列表。 | 应为非空列表 |
| fulfillment_address | Address | 否 | 如果存在，表示可选 fulfillment address。 | 无 |

#### Response（响应）

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id | String | 是 | 标识 checkout session 的唯一 id。此 id 将用于后续调用中更新 checkout session。 | 无 |
| buyer | Buyer | 否 | Buyer information（买家信息），如已提供 | 无 |
| payment_provider | PaymentProvider | 是 | 将用于完成此交易的 payment provider。 | 无 |
| status | String enum | 是 | checkout session 的当前 status。可能值为：`not_ready_for_payment` `ready_for_payment` `completed` `canceled` | 无 |
| currency | String | 是 | 符合 ISO 4217 标准的 currency code | 应遵循 ISO 4217 标准并使用小写 |
| line_items | List[LineItem] | 是 | items 和 computed costs 的列表。 | 无 |
| fulfillment_address | Address | 否 | items 的收货地址。 | 无 |
| fulfillment_options | List[FulfillmentOption] | 是 | 所有可用 fulfillment options 及相关 costs。 | 无 |
| fulfillment_option_id | String | 否 | 所选 fulfillment option 的 id。 | 无 |
| totals | List[Total] | 是 | totals 列表。 | 无 |
| messages | List[Message] | 是 | 要显示给客户的 informational 和 error messages 列表。 | 无 |
| links | List[Link] | 是 | 要显示给客户的 links 列表（例如 ToS/privacy policy/etc.）。 | 无 |

#### Examples（示例）

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

调用方向：OpenAI -> Merchant

当 checkout session 更新时会调用此 endpoint，例如 fulfillment address 或 fulfillment option 发生变化。该 endpoint 应返回更新后的 costs、新 options（例如基于 fulfillment address 更新得到的新 fulfillment options），以及任何新的 errors。

#### Request（请求）

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :-------------------- | :--------- | :------- | :-------------------------------------------------------------------- | :--------- |
| buyer | Buyer | 否 | 关于 buyer 的可选信息。 | 无 |
| items | List[Item] | 否 | 要购买的更新后 items 的可选列表。 | 无 |
| fulfillment_address | Address | 否 | 客户指定的新添加或已更新 fulfillment address。 | 无 |
| fulfillment_option_id | String | 否 | 客户指定的 fulfillment option 的 id。 | 无 |

#### Response（响应）

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id | String | 是 | 标识 checkout session 的唯一 id。此 id 将用于后续调用中更新 checkout session。 | 无 |
| buyer | Buyer | 否 | Buyer information（买家信息），如已提供 | 无 |
| status | String enum | 是 | checkout session 的当前 status。可能值为：`not_ready_for_payment` `ready_for_payment` `completed` `canceled` | 无 |
| currency | String | 是 | 符合 ISO 4217 标准的 currency code | 应遵循 ISO 4217 标准并使用小写 |
| line_items | List[LineItem] | 是 | items 和 computed costs 的列表。 | 无 |
| fulfillment_address | Address | 否 | items 的收货地址。 | 无 |
| fulfillment_options | List[FulfillmentOption] | 是 | 所有可用 fulfillment options 及相关 costs。 | 无 |
| fulfillment_option_id | String | 否 | 所选 fulfillment option 的 id。 | 无 |
| totals | List[Total] | 是 | totals 列表。 | 无 |
| messages | List[Message] | 是 | 要显示给客户的 informational 和 error messages 列表。 | 无 |
| links | List[Link] | 是 | 要显示给客户的 links 列表（例如 ToS/privacy policy/etc.）。 | 无 |

#### Example（示例）

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

调用方向：OpenAI -> Merchant

该 endpoint 将携带 payment method 调用，以完成购买。预期此调用后 checkout session 会完成，并创建 order。任何阻止完成的 errors 都应在 response 中返回。

#### Request（请求）

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :----------- | :---------- | :------- | :-------------------------------------------------- | :--------- |
| buyer | Buyer | 否 | 关于 buyer 的可选信息。 | 无 |
| payment_data | PaymentData | 是 | 用于完成 checkout session 的 payment data。 | 无 |

#### Response（响应）

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id | String | 是 | 标识 checkout session 的唯一 id。此 id 将用于后续调用中更新 checkout session。 | 无 |
| buyer | Buyer | 是 | Buyer information（买家信息） | 无 |
| status | String enum | 是 | checkout session 的当前 status。可能值为：`not_ready_for_payment` `ready_for_payment` `completed` `canceled` | 无 |
| currency | String | 是 | 符合 ISO 4217 标准的 currency code | 应遵循 ISO 4217 标准并使用小写 |
| line_items | List[LineItem] | 是 | items 和 computed costs 的列表。 | 无 |
| fulfillment_address | Address | 否 | items 的收货地址。 | 无 |
| fulfillment_options | List[FulfillmentOption] | 是 | 所有可用 fulfillment options 及相关 costs。 | 无 |
| fulfillment_option_id | String | 否 | 所选 fulfillment option 的 id。 | 无 |
| totals | List[Total] | 是 | totals 列表。 | 无 |
| order | Order | 否 | checkout session 完成后创建的 order。 | 无 |
| messages | List[Message] | 是 | 要显示给客户的 informational 和 error messages 列表。 | 无 |
| links | List[Link] | 是 | 要显示给客户的 links 列表（例如 ToS/privacy policy/etc.）。 | 无 |

#### Example（示例）

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

#### Request（请求）

无

#### Response（响应）

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id | String | 是 | 标识 checkout session 的唯一 id。此 id 将用于后续调用中更新 checkout session。 | 无 |
| buyer | Buyer | 否 | Buyer information（买家信息），如已提供 | 无 |
| status | String enum | 是 | checkout session 的当前 status。可能值为：`not_ready_for_payment` `ready_for_payment` `completed` `canceled` | 无 |
| currency | String | 是 | 符合 ISO 4217 标准的 currency code | 应遵循 ISO 4217 标准并使用小写 |
| line_items | List[LineItem] | 是 | items 和 computed costs 的列表。 | 无 |
| fulfillment_address | Address | 否 | items 的收货地址。 | 无 |
| fulfillment_options | List[FulfillmentOption] | 是 | 所有可用 fulfillment options 及相关 costs。 | 无 |
| fulfillment_option_id | String | 否 | 所选 fulfillment option 的 id。 | 无 |
| totals | List[Total] | 是 | totals 列表。 | 无 |
| messages | List[Message] | 是 | 要显示给客户的 informational 和 error messages 列表。 | 无 |
| links | List[Link] | 是 | 要显示给客户的 links 列表（例如 ToS/privacy policy/etc.）。 | 无 |

### GET `/checkout_sessions/{checkout_session_id}`

此 endpoint 用于返回 checkout session 的最新信息。如果找不到 checkout session，server 应返回 status 404。

#### Request（请求）

无

#### Response（响应）

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :-------------------- | :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------ |
| id | String | 是 | 标识 checkout session 的唯一 id。此 id 将用于后续调用中更新 checkout session。 | 无 |
| buyer | Buyer | 否 | Buyer information（买家信息），如已提供 | 无 |
| status | String enum | 是 | checkout session 的当前 status。可能值为：`not_ready_for_payment` `ready_for_payment` `completed` `canceled` | 无 |
| currency | String | 是 | 符合 ISO 4217 标准的 currency code | 应遵循 ISO 4217 标准并使用小写 |
| line_items | List[LineItem] | 是 | items 和 computed costs 的列表。 | 无 |
| fulfillment_address | Address | 否 | items 的收货地址。 | 无 |
| fulfillment_options | List[FulfillmentOption] | 是 | 所有可用 fulfillment options 及相关 costs。 | 无 |
| fulfillment_option_id | String | 否 | 所选 fulfillment option 的 id。 | 无 |
| totals | List[Total] | 是 | totals 列表。 | 无 |
| messages | List[Message] | 是 | 要显示给客户的 informational 和 error messages 列表。 | 无 |
| links | List[Link] | 是 | 要显示给客户的 links 列表（例如 ToS/privacy policy/etc.）。 | 无 |

### Response Errors（响应错误）

如果 server 无法返回 201 response，则应返回以下 shape 的 error，并带 4xx/5xx status。

#### Error（错误）

| 字段 | 类型 | 是否必填 | 说明 |
| :------ | :---------- | :------- | :--------------------------------------------------------------------- |
| type | String enum | 是 | 错误类型。可能值为：`invalid_request` |
| code | String enum | 是 | 错误代码。可能值为：`request_not_idempotent` |
| message | String | 是 | Human-readable error description（人类可读的错误描述）。 |
| param | String | 否 | 适用时，指向有问题 request body field 的 JSONPath。 |

## Object definitions（对象定义）

### Item

| 字段 | 类型 | 是否必填 | 说明 | 示例值 | 校验 |
| :------- | :----- | :------- | :------------------------------------------------- | :------------ | :------------------------------------------- |
| id | string | 是 | 可购买商品的 id | `“itm_123”` | `无` |
| quantity | int | 是 | 用于 fulfillment 的 item 数量 | `1` | 应为大于 0 的正整数。 |

### Address

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :----------- | :----- | :------- | :----------------------------------------------- | :------------------------------------ |
| name | String | 是 | items 收件人的姓名 | 最大长度为 256 |
| line_one | String | 是 | 地址第一行 | 最大长度为 60 |
| line_two | String | 否 | 可选地址第二行 | 最大长度为 60 |
| city | String | 是 | 地址 city/district/suburb/town/village。 | 最大长度为 60 |
| state | String | 是 | 地址 state/county/province/region。 | 应遵循 ISO 3166-1 标准 |
| country | String | 是 | 地址 country | 应遵循 ISO 3166-1 标准 |
| postal_code | String | 是 | 地址 postal code 或 zip code | 最大长度为 20 |
| phone_number | String | 否 | Optional phone number（可选电话号码） | 遵循 E.164 标准 |

### PaymentProvider

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :------------------------ | :---------------- | :------- | :--------------------------------------------------------------------------------------------- | :--------- |
| provider | String enum | 是 | 表示 payment processor 的 string value。可能值为：`stripe` `adyen` `braintree` | 无 |
| supported_payment_methods | List[String enum] | 是 | 商家愿意接受的 payment methods 列表。可能值为：`card` | 无 |

### Message (type = info)

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :----------- | :---------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| type | String | 是 | 表示 message 类型的 string value。对于 informational message，type 应为 `info.` | 无 |
| param | String | 是 | 指向 checkout session 中该 message 所引用 component 的 RFC 9535 JSONPath。例如，如果 message 引用第二个 line item，则 path 为 `$.line_items[1]`。 | 无 |
| content_type | String enum | 是 | 用于 rendering purposes 的 message content 类型。可能值为：`plain` `markdown` | 无 |
| content | String | 是 | 原始 message content。 | 无 |

### Message (type = error)

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :----------- | :---------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| type | String | 是 | 表示 message 类型的 string value。对于 error message，type 应为 `error.` | 无 |
| code | String enum | 是 | 错误代码。可能值为：`missing` `invalid` `out_of_stock` `payment_declined` `requires_sign_in` `requires_3ds` | 无 |
| param | String | 否 | 指向 checkout session 中该 message 所引用 component 的 RFC 9535 JSONPath。例如，如果 message 引用第二个 line item，则 path 为 `$.line_items[1]`。 | 无 |
| content_type | String enum | 是 | 用于 rendering purposes 的 message content 类型。可能值为：`plain` `markdown` | 无 |
| content | String | 是 | 原始 message content。 | 无 |

### Link

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :---- | :----------- | :------- | :-------------------------------------------------------------------------------------------- | :--------- |
| type | Enum(String) | 是 | link 类型。可能值为：`terms_of_use` `privacy_policy` `seller_shop_policies` | 无 |
| url | String | 是 | 指定为 URL 的 link content。 | 无 |

### Buyer

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :----------- | :----- | :------- | :------------------------------------------------------- | :------------------------- |
| name | String | 是 | Buyer 姓名。 | 最大长度为 256 |
| email | String | 是 | 用于 communication 的 buyer email address。 | 最大长度为 256 |
| phone_number | String | 否 | Buyer 的 optional phone number。 | 遵循 E.164 标准 |

### Line Item

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :---------- | :----- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| id | String | 是 | line item 的 id。这不同于 item 的 id，表示同一 item 的两个 line items 会有不同 line item ids。 | 无 |
| item | Item | 是 | 该 line item 表示的 item。 | 无 |
| base_amount | int | 是 | 表示调整前 item base amount 的整数。 | 应 >= 0 |
| discount | int | 是 | 表示应用到 item 的任何 discount 的整数。 | 应 >= 0 |
| subtotal | int | 是 | 表示所有调整后金额的整数。 | 应等于 `base_amount - discount`，且应 >= 0 |
| tax | int | 是 | 表示 tax amount 的整数。 | 应 >= 0 |
| total | int | 是 | 表示 total amount 的整数。 | 应等于 `base_amount - discount + tax`，且应 >= 0 |

### Total

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :----------- | :---------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type | String enum | 是 | 表示 total 类型的 string value。可能值为：`items_base_amount` `items_discount` `subtotal` `discount` `fulfillment` `tax` `fee` `total` | 无 |
| display_text | String | 是 | 向客户显示的此 total 文本。 | 无 |
| amount | int | 是 | 以 minor units 表示 total amount 的整数。 | 如果 type == `subtotal`，应等于 `items_base_amount - items_discount`；如果 type == `total`，应等于 `items_base_amount - items_discount - discount + fulfillment + tax + fee`；应 >= 0 |

### FulfillmentOption (type = shipping)

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :--------------------- | :----- | :------- | :--------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| type | String | 是 | 表示 fulfillment option 类型的 string value。对于 shipping option，该值应为 `shipping.` | 无 |
| id | String | 是 | 表示 shipping option 的唯一 ID。在所有 fulfillment options 中唯一。 | 在所有 fulfillment options 中唯一。 |
| title | String | 是 | 向客户显示的 shipping option title。 | 无 |
| subtitle | String | 是 | 向客户显示的描述预计 shipping timeline 的 text content。 | 无 |
| carrier | String | 是 | Shipping carrier 名称。 | 无 |
| earliest_delivery_time | String | 是 | 预计最早 delivery time，格式为 RFC 3339 string。 | 格式为 RFC 3339 string。 |
| latest_delivery_time | String | 是 | 预计最晚 delivery time，格式为 RFC 3339 string。 | 格式为 RFC 3339 string。 |
| subtotal | int | 是 | shipping option 的整数 subtotal cost，格式为 string。 | 应 >= 0 |
| tax | int | 是 | 表示 tax amount 的整数。 | 应 >= 0 |
| total | int | 是 | shipping option 的整数 total cost，格式为 string。 | 应等于 `subtotal + tax` |

### FulfillmentOption (type = digital)

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :------- | :----- | :------- | :------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| type | String | 是 | 表示 fulfillment option 类型的 string value。对于 digital option，该值应为 `digital.` | 无 |
| id | String | 是 | 表示 digital option 的唯一 ID。在所有 fulfillment options 中唯一。 | 在所有 fulfillment options 中唯一。 |
| title | String | 是 | 向客户显示的 digital option title。 | 无 |
| subtitle | String | 否 | 描述 item 将如何以数字方式交付给客户的 text content。 | 无 |
| subtotal | int | 是 | digital option 的整数 subtotal cost，格式为 string。 | 应 >= 0 |
| tax | int | 是 | 表示 tax amount 的整数。 | 应 >= 0 |
| total | int | 是 | digital option 的整数 total cost，格式为 string。 | 应等于 `subtotal + tax` |

### PaymentData

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :-------------- | :---------- | :------- | :------------------------------------------------------------------------------------------------- | :--------- |
| token | String | 是 | 表示 payment method 的 token。 | 无 |
| provider | String enum | 是 | 表示 payment processor 的 string value。可能值为：`stripe` `adyen` `braintree` | 无 |
| billing_address | Address | 否 | 与 payment method 关联的 optional billing address | 无 |

### Order

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :------------------ | :----- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| id | String | 是 | 标识完成 checkout session 后创建的 order 的唯一 id。 | 无 |
| checkout_session_id | String | 是 | 标识创建此 order 的 checkout session 的 id | 无 |
| permalink_url | String | 是 | 指向 order 的 URL。Customers 应能访问此 URL，并最多只需提供 email address 即可查看 order details。 | 无 |

## Webhooks（Webhook）

商家会在 order creation 和 update events 上向 OpenAI 发送 webhook events。这些 events 确保 buyer 的视图保持同步。Webhook events 将携带作为 request header 发送的 HMAC signature（即 `Merchant_Name-Signature`），该 signature 使用 webhook payload 创建，并使用 OpenAI 提供的 key 签名。

### Webhook Event（Webhook 事件）

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :---- | :---------- | :------- | :------------------------------------------------------------------------------------------ | :--------- |
| type | String enum | 是 | 表示 event 类型的 string。可能值为：`order_created` `order_updated` | 无 |
| data | EventData | 是 | Webhook event data。更多信息请参见 EventData。 | 无 |

### EventData (type = order)

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :------------------ | :----------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| type | String | 是 | 表示 event data 类型的 string value。对于 order data，该值应为 `order` | 无 |
| checkout_session_id | String | 是 | 标识创建此 order 的 checkout session 的 ID。 | 无 |
| permalink_url | String | 是 | 指向 order 的 URL。Customers 应能访问此 URL，并最多只需提供 email address 即可查看 order details。 | 无 |
| status | String enum | 是 | 表示 order 最新 status 的 string。可能值为：`created` `manual_review` `confirmed` `canceled` `shipped` `fulfilled` | 无 |
| refunds | List[Refund] | 是 | 已为 order 签发的 refunds 列表。 | 无 |

### Refund

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :----- | :---------- | :------- | :--------------------------------------------------------------------------------------------- | :------------- |
| type | String enum | 是 | 表示 refund 类型的 string。可能值为：`store_credit` `original_payment` | 无 |
| amount | integer | 是 | 表示已 refund 的 total amount of money 的整数。 | 应 >= 0 |
