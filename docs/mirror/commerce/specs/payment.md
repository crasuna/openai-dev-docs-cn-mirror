---
title: "Delegated Payment Spec（委托付款规范）"
description: "Payment Service Providers implement the Delegated Payment Spec to handle and secure Agentic Commerce transactions"
outline: deep
---

# Delegated Payment Spec（委托付款规范）

**文档集**：Commerce  
**分组**：Agentic Commerce — Specs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/commerce/specs/payment](https://developers.openai.com/commerce/specs/payment)
- Markdown 来源：[https://developers.openai.com/commerce/specs/payment.md](https://developers.openai.com/commerce/specs/payment.md)
- 抓取时间：2026-06-27T05:55:13.494Z
- Checksum：`08f1a0e942203387b0e6ac04146fe1b5965fae22f7f1ed0a8d6724e154211f55`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

Delegated payment spec 允许 OpenAI 与商家或其指定的 payment service provider (PSP) 安全共享 payment details。商家及其 PSP 随后会以处理他们收集的其他订单和付款相同的方式，处理该交易和相关付款。

### 此规范适合谁？

通过 Delegated Payment Spec 直接与 OpenAI 集成仅适用于 PSP，或使用自有 vault 的 PCI DSS level 1 merchants。对于其他方，[Stripe’s Shared Payment Token](https://docs.stripe.com/agentic-commerce) 是第一个兼容 Delegated Payment Spec 的实现，更多 PSP 即将推出。

### 工作方式

1. 买家使用其首选 payment method 结账，并将其保存在 ChatGPT 中。
2. Delegated payment payload 会直接发送到商家的 PSP 或 vault。Delegated payment 是 single-use，并设置了 allowances。
3. PSP 或 vault 返回一个限定于 delegated payment 的 payment token，且该 token 位于 PCI scope 之外。
4. OpenAI 在 complete-checkout call 期间转发该 token，使商家能够完成交易。

### 要点

- **OpenAI 不是 merchant of record**。在 Agentic Commerce Protocol 下，商家自带 PSP，并像处理任何其他数字交易一样处理付款。
- **一次性且受限制**。Payment token 受 delegated payment 的 max amount 和 expiry 限制，有助于保护用户并防止滥用。
- **付款由商家负责**。Settlement、refunds、chargebacks 和 compliance 仍由商家及其 PSP 负责。
- **安全性内建于设计中**。Delegated Payment Spec 确保 PSP 返回的 credentials 范围很窄，不能在用户批准购买所定义的 limits 之外使用。
- **PCI Scope**。直接集成 Delegated Payment Spec 涉及直接处理 cardholder data (CHD)，并可能影响你的 PCI scope。

## REST endpoints（REST 端点）

### POST /agentic_commerce/delegate_payment

调用方向：OpenAI -&gt; PSP

#### Headers（标头）

| 字段 | 说明 | 示例值 |
| :-------------- | :-------------------------------------------------------- | :---------------------------------------------- |
| Authorization | 用于发起 requests 的 API Key | `Bearer api_key_123` |
| Accept-Language | messages 和 errors 等内容的首选 locale | `en-us` |
| User-Agent | 关于发起此 request 的 client 信息 | `ChatGPT/2.0 (Mac OS X 15.0.1; arm64; build 0)` |
| Idempotency-Key | 用于确保 requests idempotent 的 key | `idempotency_key_123` |
| Request-Id | 每个 request 的唯一 key，用于 tracing purposes | `request_id_123` |
| Content-Type | request content 的类型 | `application/json` |
| Signature | request body 的 Base64 encoded signature | `eyJtZX...` |
| Timestamp | 格式为 RFC 3339 string。 | 2025-09-25T10:30:00Z |
| API-Version | API 版本 | 2025-09-29 |

request body 中必须存在以下 input 之一且只能存在一个：card。

#### Request（请求）

| 字段 | 类型 | 是否必填 | 说明 | 示例 | 校验 |
| :-------------- | :----------------------- | :------- | :------------------------------------------------------ | :------------------------------ | :--------- |
| payment_method | Object | 是 | Credential 类型。唯一接受的值是 “CARD”。 | 见 Payment Method | 无 |
| allowance | Allowance object | 是 | stored credential 可应用的 use cases。 | 见 Allowance object definition | 无 |
| billing_address | Address object | 否 | 与 payment method 关联的地址。 | 见 Address object definition | 无 |
| risk_signals | list[Risk Signal object] | 是 | risk signals 列表 | 见 Risk Signal definition | 无 |
| metadata | Object (map) | 是 | 任意 key/value pairs。 | `{ "campaign": "q4"}` | 无 |

#### Response（响应）

##### Success（成功）

响应代码：HTTP 201

**响应体**

| 字段 | 类型 | 是否必填 | 说明 | 校验 |
| :------- | :----- | :------- | :-------------------------------------------------------------------------------------------- | :--------- |
| id | String | 是 | 唯一 vault token identifier vt\_…。 | 无 |
| created | String | 是 | 格式为 RFC 3339 string 的时间 | 无 |
| metadata | Object | 是 | 用于 correlation 的任意 key/value pairs（例如 `source`、`merchant_id`、`idempotency_key`）。 | 无 |

##### Error（错误）

响应代码：HTTP 4xx/5xx

**响应体**

| 字段 | 类型 | 是否必填 | 说明 | 示例 | 校验 |
| :------ | :---------- | :------- | :-------------------------------------------------------------------------- | :-------------------------------------------------------------------- | :--------- |
| type | String enum | 是 | 错误类型 | invalid_request rate_limit_exceeded processing_error service_unavailable | 无 |
| code | String | 是 | 错误代码 | invalid_card | 无 |
| message | String | 是 | 适合 logs/support 的 human-readable error description（通常对 end-user 也是安全的）。 | Missing/malformed field | 无 |
| param | JSONPath | 否 | 适用时，导致问题的 request field 名称。 | payment_method.number | 无 |

## Code values and meanings（代码值及含义）

- **invalid_request** - 缺少字段或字段格式错误；通常返回 **400**。

  _Example message:_ `”card field is required when payment_method_type=card”`（示例消息：当 `payment_method_type=card` 时需要 `card` 字段）。
  - **invalid_card** - Credential 未通过基本验证（例如长度或 expiry）；返回 **400** 或 **422**。

  - **idempotency_conflict** - 相同 idempotency key 但参数不同；返回 **409**。

- **rate_limit_exceeded** - 请求过多；返回 **429**。

- **processing_error** - 下游 gateway 或 network failure；返回 **500**。

- **service_unavailable** - 临时 outage 或 maintenance；返回 **503**，可附带可选 retry_after header。

## Object definitions（对象定义）

#### Payment method（付款方式）

| 字段 | 类型 | 是否必填 | 说明 | 示例 | 校验 |
| ------------------------- | :------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ---------------------------------------- |
| type | String enum | 是 | 所用 payment method 类型。目前仅支持 `card`。 | card | 必须为 card |
| card_number_type | String enum | 是 | 卡号类型。优先使用 network tokens，并回退到 FPAN。更多详情请参见 [PCI Scope](/mirror/commerce/guides/production#security-and-compliance)。 | “fpan” or “network_token” | 必须为 “fpan” 或 “network_token” |
| number | String | 是 | 卡号。 | "4242424242424242" | |
| exp_month | String | 否 | 到期月份。 | "11" | 最大长度 2 |
| exp_year | String | 否 | 4 位到期年份。 | "2026" | 最大长度 4 |
| name | String | 否 | 持卡人姓名。 | "Jane Doe" | |
| cvc | String | 否 | 卡片 CVC 号码。 | "223" | 最大长度 4 |
| cryptogram | String | 否 | 随 network tokens 提供的 cryptogram。 | "gXc5UCLnM6ckD7pjM1TdPA==" | |
| eci_value | String | 否 | 随 network tokens 提供的 Electronic Commerce Indicator / Security Level Indicator。 | "07" | |
| checks_performed | List\&lt;String\&gt; | 否 | 已在卡片上执行的 checks。 | \[avs, cvv, ani, auth0\] | |
| iin | String | 否 | Institution Identification Number（也称 BIN）。卡片前 6 位，用于标识 issuer。 | "123456" | 最大长度 6 |
| display_card_funding_type | String enum | 否 | 用于展示的卡 funding type。 | “credit” or “debit” or “prepaid” | 必须为 “credit”、“debit” 或 “prepaid” |
| display_wallet_type | String | 否 | 如果卡来自 digital wallet，表示 wallet 类型。 | “wallet” | |
| display_brand | String | 否 | 用于展示的卡 brand。 | “Visa”, “amex”, “discover” | |
| display_last4 | String | 否 | 对于 non-PAN，这是用于客户展示的原始卡号末 4 位。 | "1234" | 最大长度 4 |
| metadata | Object (map) | 是 | 任意 key/value pairs。 | Example: `{ “issuing\_bank”: “temp” }` | |

### Address

| 字段 | 类型 | 是否必填 | 说明 | 示例 | 校验 |
| ------------ | :----- | :------- | ------------------------------------------ | --------------- | ------------------------------------- |
| name | String | 是 | Customer name（客户姓名） | “John Doe” | 最大长度 256 |
| line_one | String | 是 | Street line 1（街道地址第 1 行） | "123 Fake St." | 最大长度 60 |
| line_two | String | 否 | Street line 2（街道地址第 2 行） | "Unit 1" | 最大长度 60 |
| city | String | 是 | City（城市） | "San Francisco" | 最大长度 60 |
| state | String | 否 | State/region（适用时使用 ISO-3166-2） | "CA" | 应遵循 ISO 3166-2 标准 |
| country | String | 是 | ISO-3166-1 alpha-2 | "US" | 应遵循 ISO 3166-1 标准 |
| postal_code | String | 是 | Postal/ZIP code | "12345" | 最大长度 20 |
| phone_number | String | 否 | Optional phone number（可选电话号码） | "+15552003434" | 遵循 E.164 标准 |

### Allowance

| 字段 | 类型 | 是否必填 | 说明 | 示例 | 校验 |
| ------------------- | :---------- | :------- | ------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------- |
| reason | String enum | 是 | 当前可能值： “one_time” | “one_time”：不应再用于其他 flows。可用额度至 max amount。 | 必须为 one_time |
| max_amount | int | 是 | 可向 payment method 收取的最高金额 | checkout_total | |
| currency | String | 是 | currency | ISO-4217（例如 “USD”）。 | 应遵循 ISO 4217 标准并使用小写 |
| checkout_session_id | String | 是 | checkout_session_id 的引用 | "1PQrsT..." | |
| merchant_id | String | 是 | 商家识别描述符 | XX | 最大长度 256 |
| expires_at | String | 是 | 格式为 RFC 3339 string 的时间 | “2025-10-09T07:20:50.52Z” | 应遵循 RFC 3339 标准 |

### Risk Signal

| 字段 | 类型 | 是否必填 | 说明 | 示例 | 校验 |
| ------ | :---------- | :------- | -------------------------- | :------------------------------------- | :--------- |
| type | String enum | 是 | risk signal 类型 | “card_testing” | 无 |
| score | int | 是 | risk signal 详情 | 10 | 无 |
| action | String enum | 是 | 采取的 action | “blocked” “manual_review” “authorized” | 无 |

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

The delegated payment spec allows OpenAI to securely share payment details with the merchant or its designated payment service provider (PSP). The merchant and its PSP then handle the transaction and process the related payment in the same manner as any other order and payment they collect.

### Who is this spec for?

Directly integrating with OpenAI via the Delegated Payment Spec is only for PSPs or PCI DSS level 1 merchants using their own vaults. For others, [Stripe’s Shared Payment Token](https://docs.stripe.com/agentic-commerce) is the first Delegated Payment Spec-compatible implementation, with more PSPs coming soon.

### How it works

1. Buyers check out using their preferred payment method and save it in ChatGPT.
2. The delegated payment payload is sent to the merchant’s PSP or vault directly. The delegated payment is single-use and set with allowances.
3. The PSP or vault returns a payment token scoped to the delegated payment outside of PCI scope.
4. OpenAI forwards the token during the complete-checkout call to enable the merchant to complete the transaction.

### Key points

- **OpenAI is not the merchant of record**. Under the Agentic Commerce Protocol, merchants bring their own PSP and process payments as they would for any other digital transaction.
- **Single-use and constrained**. The payment token is restricted by the delegated payment’s max amount and expiry, helping protect users and prevent misuse.
- **Merchant-owned payments**. Settlement, refunds, chargebacks, and compliance remain with the merchant and their PSP.
- **Security by design**. The Delegated Payment Spec ensures PSP-returned credentials are narrowly scoped and cannot be used outside the defined limits of the user-approved purchase.
- **PCI Scope**. Directly integrating with the Delegated Payment Spec involves directly handling cardholder data (CHD) and may affect your PCI scope.

## REST endpoints

### POST /agentic_commerce/delegate_payment

Call direction: OpenAI -&gt; PSP

#### Headers

| Field           | Description                                               | Example Value                                   |
| :-------------- | :-------------------------------------------------------- | :---------------------------------------------- |
| Authorization   | API Key used to make requests                             | `Bearer api_key_123`                            |
| Accept-Language | The preferred locale for content like messages and errors | `en-us`                                         |
| User-Agent      | Information about the client making this request          | `ChatGPT/2.0 (Mac OS X 15.0.1; arm64; build 0)` |
| Idempotency-Key | Key used to ensure requests are idempotent                | `idempotency_key_123`                           |
| Request-Id      | Unique key for each request for tracing purposes          | `request_id_123`                                |
| Content-Type    | Type of request content                                   | `application/json`                              |
| Signature       | Base64 encoded signature of the request body              | `eyJtZX...`                                     |
| Timestamp       | Formatted as an RFC 3339 string.                          | 2025-09-25T10:30:00Z                            |
| API-Version     | API version                                               | 2025-09-29                                      |

Exactly one of the following inputs must be present in the request body: card.

#### Request

| Field           | Type                     | Required | Description                                             | Example                         | Validation |
| :-------------- | :----------------------- | :------- | :------------------------------------------------------ | :------------------------------ | :--------- |
| payment_method  | Object                   | Yes      | Type of credential. The only accepted value is “CARD”.  | See Payment Method              | None       |
| allowance       | Allowance object         | Yes      | Use cases that the stored credential can be applied to. | See Allowance object definition | None       |
| billing_address | Address object           | No       | Address associated with the payment method.             | See Address object definition   | None       |
| risk_signals    | list[Risk Signal object] | Yes      | List of risk signals                                    | See Risk Signal definition      | None       |
| metadata        | Object (map)             | Yes      | Arbitrary key/value pairs.                              | `{ "campaign": "q4"}`           | None       |

#### Response

##### Success

Response code: HTTP 201

**Response Body**

| Field    | Type   | Required | Description                                                                                   | Validation |
| :------- | :----- | :------- | :-------------------------------------------------------------------------------------------- | :--------- |
| id       | String | Yes      | Unique vault token identifier vt\_….                                                          | None       |
| created  | String | Yes      | Time formatted as an RFC 3339 string                                                          | None       |
| metadata | Object | Yes      | Arbitrary key/value pairs for correlation (e.g., `source`, `merchant_id`, `idempotency_key`). | None       |

##### Error

Response code: HTTP 4xx/5xx

**Response Body**

| Field   | Type        | Required | Description                                                                 | Example                                                               | Validation |
| :------ | :---------- | :------- | :-------------------------------------------------------------------------- | :-------------------------------------------------------------------- | :--------- |
| type    | String enum | Yes      | Error type                                                                  | invalid_requestrate_limit_exceededprocessing_errorservice_unavailable | None       |
| code    | String      | Yes      | Error code                                                                  | invalid_card                                                          | None       |
| message | String      | Yes      | Human‑readable description suitable for logs/support (often end‑user safe). | Missing/malformed field                                               | None       |
| param   | JSONPath    | No       | Name of the offending request field, when applicable.                       | payment_method.number                                                 | None       |

## Code values and meanings

- **invalid_request** — Missing or malformed field; typically returns **400**.

  _Example message:_ `”card field is required when payment_method_type=card”`.
  - **invalid_card** — Credential failed basic validation (such as length or expiry); returns **400** or **422**.

  - **idempotency_conflict** — Same idempotency key but different parameters; returns **409**.

- **rate_limit_exceeded** — Too many requests; returns **429**.

- **processing_error** — Downstream gateway or network failure; returns **500**.

- **service_unavailable** — Temporary outage or maintenance; returns **503** with an optional retry_after header.

## Object definitions

#### Payment method

| Field                     | Type           | Required | Description                                                                                                                                                         | Example                               | Validation                               |
| ------------------------- | :------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ---------------------------------------- |
| type                      | String enum    | Yes      | The type of payment method used. Currently only `card`.                                                                                                             | card                                  | Must be card                             |
| card_number_type          | String enum    | Yes      | The type of card number. Network tokens are preferred with fallback to FPAN. See [PCI Scope](/mirror/commerce/guides/production#security-and-compliance) for more details. | “fpan” or “network_token”             | Must be “fpan” or “network_token”        |
| number                    | String         | Yes      | Card number.                                                                                                                                                        | "4242424242424242"                    |                                          |
| exp_month                 | String         | No       | Expiry month.                                                                                                                                                       | "11"                                  | Max. length 2                            |
| exp_year                  | String         | No       | 4 digit expiry year.                                                                                                                                                | "2026"                                | Max. length 4                            |
| name                      | String         | No       | Cardholder name.                                                                                                                                                    | "Jane Doe"                            |                                          |
| cvc                       | String         | No       | Card CVC number.                                                                                                                                                    | "223"                                 | Max. length 4                            |
| cryptogram                | String         | No       | Cryptogram provided with network tokens.                                                                                                                            | "gXc5UCLnM6ckD7pjM1TdPA=="            |                                          |
| eci_value                 | String         | No       | Electronic Commerce Indicator / Security Level Indicator provided with network tokens.                                                                              | "07"                                  |                                          |
| checks_performed          | List\&lt;String\&gt; | No       | Checks already performed on the card.                                                                                                                               | \[avs, cvv, ani, auth0\]              |                                          |
| iin                       | String         | No       | Institution Identification Number (aka BIN). The first 6 digits on a card identifying the issuer.                                                                   | "123456"                              | Max. length 6                            |
| display_card_funding_type | String enum    | No       | Funding type of the card to display.                                                                                                                                | “credit” or “debit” or “prepaid”      | Must be “credit” or “debit” or “prepaid” |
| display_wallet_type       | String         | No       | If the card came via a digital wallet, what type of wallet.                                                                                                         | “wallet”                              |                                          |
| display_brand             | String         | No       | Brand of the card to display.                                                                                                                                       | “Visa”, “amex”, “discover”            |                                          |
| display_last4             | String         | No       | In case of non-PAN, this is the original last 4 digits of the card for customer display.                                                                            | "1234"                                | Max. length 4                            |
| metadata                  | Object (map)   | Yes      | Arbitrary key/value pairs.                                                                                                                                          | Example:`{ “issuing\_bank”: “temp” }` |                                          |

### Address

| Field        | Type   | Required | Description                                | Example         | Validation                            |
| ------------ | :----- | :------- | ------------------------------------------ | --------------- | ------------------------------------- |
| name         | String | Yes      | Customer name                              | “John Doe”      | Max. length 256                       |
| line_one     | String | Yes      | Street line 1                              | "123 Fake St."  | Max. length 60                        |
| line_two     | String | No       | Street line 2                              | "Unit 1"        | Max. length 60                        |
| city         | String | Yes      | City                                       | "San Francisco" | Max. length 60                        |
| state        | String | No       | State/region (ISO‑3166‑2 where applicable) | "CA"            | Should follow the ISO 3166-2 standard |
| country      | String | Yes      | ISO‑3166‑1 alpha‑2                         | "US"            | Should follow the ISO 3166-1 standard |
| postal_code  | String | Yes      | Postal/ZIP code                            | "12345"         | Max. length 20                        |
| phone_number | String | No       | Optional phone number                      | "+15552003434"  | Follows the E.164 standard            |

### Allowance

| Field               | Type        | Required | Description                                      | Example                                                                      | Validation                                        |
| ------------------- | :---------- | :------- | ------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------- |
| reason              | String enum | Yes      | Current possible values: “one_time”              | “one_time”: should not be used again for other flows. Usage upto max amount. | Must be one_time                                  |
| max_amount          | int         | Yes      | Max amount the payment method can be charged for | checkout_total                                                               |                                                   |
| currency            | String      | Yes      | currency                                         | ISO-4217 (e.g., “USD”).                                                      | Should follow the ISO 4217 standard in lower case |
| checkout_session_id | String      | Yes      | Reference to checkout_session_id                 | "1PQrsT..."                                                                  |                                                   |
| merchant_id         | String      | Yes      | Merchant identifying descriptor                  | XX                                                                           | Max. length 256                                   |
| expires_at          | String      | Yes      | Time formatted as an RFC 3339 string             | “2025-10-09T07:20:50.52Z”                                                    | Should follow RFC 3339 standard                   |

### Risk Signal

| Field  | Type        | Required | Description                | Example                                | Validation |
| ------ | :---------- | :------- | -------------------------- | :------------------------------------- | :--------- |
| type   | String enum | Yes      | The type of risk signal    | “card_testing”                         | None       |
| score  | int         | Yes      | Details of the risk signal | 10                                     | None       |
| action | String enum | Yes      | Action taken               | “blocked” “manual_review” “authorized” | None       |

:::
:::

