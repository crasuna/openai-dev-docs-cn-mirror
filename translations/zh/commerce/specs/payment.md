---
status: needs-review
sourceId: "08f1a0e94220"
sourceChecksum: "08f1a0e942203387b0e6ac04146fe1b5965fae22f7f1ed0a8d6724e154211f55"
sourceUrl: "https://developers.openai.com/commerce/specs/payment"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# Delegated Payment Spec

## Overview

Delegated payment spec 允许 OpenAI 与商家或其指定的 payment service provider (PSP) 安全共享 payment details。商家及其 PSP 随后会以处理他们收集的其他订单和付款相同的方式，处理该交易和相关付款。

### Who is this spec for?

通过 Delegated Payment Spec 直接与 OpenAI 集成仅适用于 PSP，或使用自有 vault 的 PCI DSS level 1 merchants。对于其他方，[Stripe’s Shared Payment Token](https://docs.stripe.com/agentic-commerce) 是第一个兼容 Delegated Payment Spec 的实现，更多 PSP 即将推出。

### How it works

1. Buyers 使用其首选 payment method 结账，并将其保存在 ChatGPT 中。
2. Delegated payment payload 会直接发送到商家的 PSP 或 vault。Delegated payment 是 single-use，并设置了 allowances。
3. PSP 或 vault 返回一个限定于 delegated payment 的 payment token，且该 token 位于 PCI scope 之外。
4. OpenAI 在 complete-checkout call 期间转发该 token，使商家能够完成交易。

### Key points

- **OpenAI is not the merchant of record**。在 Agentic Commerce Protocol 下，商家自带 PSP，并像处理任何其他数字交易一样处理付款。
- **Single-use and constrained**。Payment token 受 delegated payment 的 max amount 和 expiry 限制，有助于保护用户并防止滥用。
- **Merchant-owned payments**。Settlement、refunds、chargebacks 和 compliance 仍由商家及其 PSP 负责。
- **Security by design**。Delegated Payment Spec 确保 PSP 返回的 credentials 范围很窄，不能在用户批准购买所定义的 limits 之外使用。
- **PCI Scope**。直接集成 Delegated Payment Spec 涉及直接处理 cardholder data (CHD)，并可能影响你的 PCI scope。

## REST endpoints

### POST /agentic_commerce/delegate_payment

Call direction: OpenAI -> PSP

#### Headers

| Field | Description | Example Value |
| :-------------- | :-------------------------------------------------------- | :---------------------------------------------- |
| Authorization | 用于发起 requests 的 API Key | `Bearer api_key_123` |
| Accept-Language | messages 和 errors 等内容的首选 locale | `en-us` |
| User-Agent | 关于发起此 request 的 client 信息 | `ChatGPT/2.0 (Mac OS X 15.0.1; arm64; build 0)` |
| Idempotency-Key | 用于确保 requests idempotent 的 key | `idempotency_key_123` |
| Request-Id | 每个 request 的唯一 key，用于 tracing purposes | `request_id_123` |
| Content-Type | request content 的类型 | `application/json` |
| Signature | request body 的 Base64 encoded signature | `eyJtZX...` |
| Timestamp | 格式为 RFC 3339 string。 | 2025-09-25T10:30:00Z |
| API-Version | API version | 2025-09-29 |

request body 中必须存在以下 input 之一且只能存在一个：card。

#### Request

| Field | Type | Required | Description | Example | Validation |
| :-------------- | :----------------------- | :------- | :------------------------------------------------------ | :------------------------------ | :--------- |
| payment_method | Object | Yes | Credential 类型。唯一接受的值是 “CARD”。 | 见 Payment Method | None |
| allowance | Allowance object | Yes | stored credential 可应用的 use cases。 | 见 Allowance object definition | None |
| billing_address | Address object | No | 与 payment method 关联的地址。 | 见 Address object definition | None |
| risk_signals | list[Risk Signal object] | Yes | risk signals 列表 | 见 Risk Signal definition | None |
| metadata | Object (map) | Yes | 任意 key/value pairs。 | `{ "campaign": "q4"}` | None |

#### Response

##### Success

Response code: HTTP 201

**Response Body**

| Field | Type | Required | Description | Validation |
| :------- | :----- | :------- | :-------------------------------------------------------------------------------------------- | :--------- |
| id | String | Yes | 唯一 vault token identifier vt\_…。 | None |
| created | String | Yes | 格式为 RFC 3339 string 的时间 | None |
| metadata | Object | Yes | 用于 correlation 的任意 key/value pairs（例如 `source`、`merchant_id`、`idempotency_key`）。 | None |

##### Error

Response code: HTTP 4xx/5xx

**Response Body**

| Field | Type | Required | Description | Example | Validation |
| :------ | :---------- | :------- | :-------------------------------------------------------------------------- | :-------------------------------------------------------------------- | :--------- |
| type | String enum | Yes | Error type | invalid_request rate_limit_exceeded processing_error service_unavailable | None |
| code | String | Yes | Error code | invalid_card | None |
| message | String | Yes | 适合 logs/support 的 human-readable error description（通常对 end-user 也是安全的）。 | Missing/malformed field | None |
| param | JSONPath | No | 适用时，导致问题的 request field 名称。 | payment_method.number | None |

## Code values and meanings

- **invalid_request** - 缺少字段或字段格式错误；通常返回 **400**。

  _Example message:_ `”card field is required when payment_method_type=card”`。
  - **invalid_card** - Credential 未通过基本验证（例如长度或 expiry）；返回 **400** 或 **422**。

  - **idempotency_conflict** - 相同 idempotency key 但参数不同；返回 **409**。

- **rate_limit_exceeded** - 请求过多；返回 **429**。

- **processing_error** - 下游 gateway 或 network failure；返回 **500**。

- **service_unavailable** - 临时 outage 或 maintenance；返回 **503**，可附带可选 retry_after header。

## Object definitions

#### Payment method

| Field | Type | Required | Description | Example | Validation |
| ------------------------- | :------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ---------------------------------------- |
| type | String enum | Yes | 所用 payment method 类型。目前仅支持 `card`。 | card | Must be card |
| card_number_type | String enum | Yes | 卡号类型。优先使用 network tokens，并回退到 FPAN。更多详情请参见 [PCI Scope](https://developers.openai.com/commerce/guides/production#security-and-compliance)。 | “fpan” or “network_token” | Must be “fpan” or “network_token” |
| number | String | Yes | Card number。 | "4242424242424242" | |
| exp_month | String | No | Expiry month。 | "11" | Max. length 2 |
| exp_year | String | No | 4 digit expiry year。 | "2026" | Max. length 4 |
| name | String | No | Cardholder name。 | "Jane Doe" | |
| cvc | String | No | Card CVC number。 | "223" | Max. length 4 |
| cryptogram | String | No | 随 network tokens 提供的 cryptogram。 | "gXc5UCLnM6ckD7pjM1TdPA==" | |
| eci_value | String | No | 随 network tokens 提供的 Electronic Commerce Indicator / Security Level Indicator。 | "07" | |
| checks_performed | List\<String\> | No | 已在卡片上执行的 checks。 | \[avs, cvv, ani, auth0\] | |
| iin | String | No | Institution Identification Number（也称 BIN）。卡片前 6 位，用于标识 issuer。 | "123456" | Max. length 6 |
| display_card_funding_type | String enum | No | 用于展示的卡 funding type。 | “credit” or “debit” or “prepaid” | Must be “credit” or “debit” or “prepaid” |
| display_wallet_type | String | No | 如果卡来自 digital wallet，表示 wallet 类型。 | “wallet” | |
| display_brand | String | No | 用于展示的卡 brand。 | “Visa”, “amex”, “discover” | |
| display_last4 | String | No | 对于 non-PAN，这是用于客户展示的原始卡号末 4 位。 | "1234" | Max. length 4 |
| metadata | Object (map) | Yes | 任意 key/value pairs。 | Example: `{ “issuing\_bank”: “temp” }` | |

### Address

| Field | Type | Required | Description | Example | Validation |
| ------------ | :----- | :------- | ------------------------------------------ | --------------- | ------------------------------------- |
| name | String | Yes | Customer name | “John Doe” | Max. length 256 |
| line_one | String | Yes | Street line 1 | "123 Fake St." | Max. length 60 |
| line_two | String | No | Street line 2 | "Unit 1" | Max. length 60 |
| city | String | Yes | City | "San Francisco" | Max. length 60 |
| state | String | No | State/region（适用时使用 ISO-3166-2） | "CA" | Should follow the ISO 3166-2 standard |
| country | String | Yes | ISO-3166-1 alpha-2 | "US" | Should follow the ISO 3166-1 standard |
| postal_code | String | Yes | Postal/ZIP code | "12345" | Max. length 20 |
| phone_number | String | No | Optional phone number | "+15552003434" | Follows the E.164 standard |

### Allowance

| Field | Type | Required | Description | Example | Validation |
| ------------------- | :---------- | :------- | ------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------- |
| reason | String enum | Yes | 当前可能值： “one_time” | “one_time”：不应再用于其他 flows。可用额度至 max amount。 | Must be one_time |
| max_amount | int | Yes | 可向 payment method 收取的最高金额 | checkout_total | |
| currency | String | Yes | currency | ISO-4217（例如 “USD”）。 | Should follow the ISO 4217 standard in lower case |
| checkout_session_id | String | Yes | checkout_session_id 的引用 | "1PQrsT..." | |
| merchant_id | String | Yes | Merchant identifying descriptor | XX | Max. length 256 |
| expires_at | String | Yes | 格式为 RFC 3339 string 的时间 | “2025-10-09T07:20:50.52Z” | Should follow RFC 3339 standard |

### Risk Signal

| Field | Type | Required | Description | Example | Validation |
| ------ | :---------- | :------- | -------------------------- | :------------------------------------- | :--------- |
| type | String enum | Yes | risk signal 类型 | “card_testing” | None |
| score | int | Yes | risk signal 详情 | 10 | None |
| action | String enum | Yes | 采取的 action | “blocked” “manual_review” “authorized” | None |
