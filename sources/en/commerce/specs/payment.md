# Delegated Payment Spec

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

Call direction: OpenAI -> PSP

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
| card_number_type          | String enum    | Yes      | The type of card number. Network tokens are preferred with fallback to FPAN. See [PCI Scope](https://developers.openai.com/commerce/guides/production#security-and-compliance) for more details. | “fpan” or “network_token”             | Must be “fpan” or “network_token”        |
| number                    | String         | Yes      | Card number.                                                                                                                                                        | "4242424242424242"                    |                                          |
| exp_month                 | String         | No       | Expiry month.                                                                                                                                                       | "11"                                  | Max. length 2                            |
| exp_year                  | String         | No       | 4 digit expiry year.                                                                                                                                                | "2026"                                | Max. length 4                            |
| name                      | String         | No       | Cardholder name.                                                                                                                                                    | "Jane Doe"                            |                                          |
| cvc                       | String         | No       | Card CVC number.                                                                                                                                                    | "223"                                 | Max. length 4                            |
| cryptogram                | String         | No       | Cryptogram provided with network tokens.                                                                                                                            | "gXc5UCLnM6ckD7pjM1TdPA=="            |                                          |
| eci_value                 | String         | No       | Electronic Commerce Indicator / Security Level Indicator provided with network tokens.                                                                              | "07"                                  |                                          |
| checks_performed          | List\<String\> | No       | Checks already performed on the card.                                                                                                                               | \[avs, cvv, ani, auth0\]              |                                          |
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
