---
title: "Monetization"
description: "Monetize your ChatGPT app."
outline: deep
---

# Monetization

**文档集**：Apps SDK  
**分组**：Apps SDK — Build  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/build/monetization](https://developers.openai.com/apps-sdk/build/monetization)
- Markdown 来源：[https://developers.openai.com/apps-sdk/build/monetization.md](https://developers.openai.com/apps-sdk/build/monetization.md)
- 抓取时间：2026-06-27T05:54:45.485Z
- Checksum：`c9e8f32e79baa3fa05a85e55b51c84d0774412d8623f6172dc59b3f97ebb9f6a`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

构建 ChatGPT app 时，开发者负责选择如何将自己的体验商业化。今天，**推荐** 且 **普遍可用** 的方式是使用 **external checkout**，即用户在开发者自己的 domain 上完成购买。虽然当前批准范围仅限于实物商品购买类 apps，但我们正在积极努力支持更广泛的 commerce use cases。

我们也正在为部分 marketplace partners（beta）启用 **in-app checkout with ChatGPT payment sheet**，并计划随着时间推移将访问扩展到更多 marketplaces 和 physical-goods retailers。在此之前，我们建议把购买流程路由到你的标准 external checkout。

## 推荐商业化方式

### ✅ External Checkout（推荐）

**External checkout** 指将用户从 ChatGPT 引导到你自己网站或应用上的 **merchant-hosted checkout flow**，在那里由你处理 pricing、payments、subscriptions 和 fulfillment。

这是大多数构建 ChatGPT apps 的开发者推荐采用的方式。

#### 工作方式

1. 用户在 ChatGPT 中与你的 app 交互。
2. 你的 app 呈现可购买 items、plans 或 services（例如 “Upgrade”、“Buy now”、“Subscribe”）。
3. 当用户决定购买时，你的 app 会把他们链接或重定向出 ChatGPT，前往你的 external checkout flow。
4. Payment、billing、taxes、refunds 和 compliance 全部在你的 domain 上处理。
5. 购买后，用户可以带着确认信息或已解锁功能回到 ChatGPT。

### 使用已保存支付方式的 In-app Checkout

App developers 可以直接在 ChatGPT app 中构建 checkout flow，允许客户使用已与 merchant 保存的 payment methods。此 flow 只能显示已保存的 payment methods，不能从客户收集新的 payment method credentials。

在这种方式中，客户无需被重定向到 ChatGPT 外部的其他 surface 即可完成购买。

#### 工作方式

1. 用户在 ChatGPT 中与你的 app 交互。
2. 你的 app 呈现可购买 items、plans 或 services，以及相关 totals。
3. 你的 app 显示客户已与你保存的 eligible payment methods。
4. 客户选择已保存的 payment method，并在 ChatGPT 中确认购买。
5. 你的后端使用已保存 payment method 处理购买，并向 app 返回确认。

### 使用 ChatGPT Payment Sheet 的 In-app Checkout（private beta）



使用 ChatGPT payment sheet 的 in-app checkout 当前仅限部分 marketplaces，且并非所有用户都可用。



为了在 in-app checkout flow 中收集新的 payment methods，app developers 需要使用 ChatGPT payment sheet。调用 `requestCheckout` 并传入 checkout session data（line items、totals、saved payment methods）以打开 ChatGPT payment sheet。用户点击 buy 后，代表所选 payment method 的 token 会通过 `complete_checkout` tool call 发送到你的 MCP server。你可以使用 PSP integration 通过该 token 收款，并把最终 order details 作为 `complete_checkout` tool call 的响应发回。

### 流程一览

1. **Server prepares session**：MCP tool 在 `structuredContent` 中返回 checkout session data（session id、line items、totals、payment provider）。
2. **Widget previews cart**：widget 渲染 line items 和 totals，供用户确认。
3. **Widget calls `requestCheckout`**：widget 调用 `requestCheckout(session_data)`。ChatGPT 打开 payment sheet，显示要扣款的金额，并显示各种 payment methods。
4. **Server finalizes**：一旦用户点击 pay 按钮，widget 会通过 `complete_checkout` tool call 回调你的 MCP。MCP tool 返回已完成订单，该订单会作为 `requestCheckout` 的响应返回给 widget。

## Checkout session

你负责构造 host 将渲染的 checkout session payload。某些字段（例如 `id` 和 `payment_provider`）的确切值取决于你的 PSP（payment service provider）和 commerce backend。实际中，你的 MCP tool 应返回：

- 用户正在购买的 line items 和 quantities。
- 与你的后端计算一致的 totals（subtotal、tax、discounts、fees、total）。
- 你的 PSP integration 所需的 provider metadata。
- 法律和政策链接（terms、refund policy 等）。

## Widget：调用 `requestCheckout`（ChatGPT Apps SDK capability）

host 提供 `window.openai.requestCheckout`。在用户发起购买时使用它打开 ChatGPT payment sheet：

示例：

```tsx
async function handleCheckout(sessionJson: string) {
  const session = JSON.parse(sessionJson);

  if (!window.openai?.requestCheckout) {
    throw new Error("requestCheckout is not available in this host");
  }

  // Host opens the ChatGPT payment sheet.
  const order = await window.openai.requestCheckout({
    ...session,
    id: checkout_session_id, // Every unique checkout session should have a unique id
  });

  return order; // host returns the order payload
}
```

在你的组件中，你可以在按钮点击时发起此流程：

```tsx


{
    setIsLoading(true);
    try {
      const orderResponse = await handleCheckout(checkoutSessionJson);
      setOrder(orderResponse);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }}
>
  {isLoading ? "Loading..." : "Checkout"}


```

下面是一个完整 checkout session 示例，你的 widget 可以把它传给 host。你的 app 提供以下 checkout session fields。ChatGPT 会添加 host-owned fields，例如 `merchant`、`logo_url`、`conversation_id`、`connector_id` 和 `ecosystem_app_uri`。请用你的 PSP 指定的值填充 `merchant_id` 字段：

```tsx
const checkoutRequest = {
  id: "checkout_session_123",
  payment_provider: {
    provider: "stripe",
    merchant_id: "merchant_123",
    supported_payment_methods: [
      {
        type: "card",
        allowed_card_brands: ["visa", "mastercard"],
      },
      { type: "apple_pay" },
      { type: "google_pay" },
    ],
    managed_payment_methods: [
      {
        type: "card",
        id: "pm_123",
        display_name: "Visa ending in 4242",
        display_last4: "4242",
        display_brand: "visa",
      },
    ],
  },
  payment_mode: "live",
  status: "ready_for_payment",
  currency: "USD",
  metadata: {
    cart_id: "cart_123",
    merchant_order_reference: "order_ref_123",
  },
  line_items: [
    {
      id: "line_item_123",
      item: {
        id: "item_123",
        quantity: 1,
      },
      name: "Canvas backpack",
      description: "A weather-resistant everyday backpack.",
      images: ["https://merchant.example.com/images/canvas-backpack.png"],
      base_amount: 3000,
      discount: 0,
      subtotal: 3000,
      tax: 300,
      total: 3300,
    },
  ],
  totals: [
    {
      type: "items_base_amount",
      display_text: "Items subtotal",
      amount: 3000,
    },
    {
      type: "subtotal",
      display_text: "Subtotal",
      amount: 3000,
    },
    {
      type: "fulfillment",
      display_text: "Shipping",
      amount: 550,
    },
    {
      type: "tax",
      display_text: "Tax",
      amount: 300,
    },
    {
      type: "total",
      display_text: "Total",
      amount: 3850,
    },
  ],
  fulfillment_options: [
    {
      id: "standard_shipping",
      type: "shipping",
      title: "Standard shipping",
      subtitle: "Arrives in 3-5 business days",
      carrier: "USPS",
      earliest_delivery_time: "2027-01-15T15:00:00Z",
      latest_delivery_time: "2027-01-19T18:00:00Z",
      subtotal: 500,
      tax: 50,
      total: 550,
    },
  ],
  fulfillment_option_id: "standard_shipping",
  fulfillment_address: {
    name: "Jane Customer",
    line_one: "123 Main St",
    line_two: "Apt 4B",
    city: "San Francisco",
    state: "CA",
    country: "US",
    postal_code: "94107",
    phone_number: "+14155550123",
  },
  messages: [
    {
      type: "info",
      param: "fulfillment_address",
      content_type: "plain",
      content: "Free returns within 30 days.",
    },
  ],
  links: [
    { type: "terms_of_use", url: "https://merchant.example.com/terms" },
    { type: "privacy_policy", url: "https://merchant.example.com/privacy" },
    { type: "support_url", url: "https://merchant.example.com/support" },
  ],
};

const response = await window.openai.requestCheckout(checkoutRequest);
```

要点：

- `window.openai.requestCheckout(session)` 会打开 host checkout UI。
- promise 会以 order result resolve，或在 error/cancel 时 reject。
- 渲染 session JSON，让用户可以查看自己将支付的内容。
- 所有 amount fields 都使用 integer minor currency units。
- 对客户已经与你的 merchant 保存的 payment methods，使用 `payment_provider.managed_payment_methods`。
- 保持 `metadata` values 为 strings。
- 为 `provider` 使用 integration 要求的 PSP slug，并咨询你的 PSP 获取其 `merchant_id` 值。

## MCP server：公开 `complete_checkout` 工具

你可以镜像此模式，并替换为自己的逻辑：

对于直接返回 `CallToolResult` 的情况，Python MCP SDK 使用下面的 `Annotated` return type 来为 `structuredContent` 声明工具 `outputSchema`。

```py
from typing import Annotated, Any

from pydantic import BaseModel


class CompleteCheckoutOutput(BaseModel):
    id: str
    status: str
    currency: str
    line_items: list[dict[str, Any]]
    fulfillment_address: dict[str, Any]
    fulfillment_options: list[dict[str, Any]]
    fulfillment_option_id: str
    totals: list[dict[str, Any]]
    order: dict[str, Any]


@tool(description="")
async def complete_checkout(
    self,
    checkout_session_id: str,
    buyer: Buyer,
    payment_data: PaymentData,
) -> Annotated[types.CallToolResult, CompleteCheckoutOutput]:
    return types.CallToolResult(
        content=[],
        structuredContent={
            "id": checkout_session_id,
            "status": "completed",
            "currency": "USD",
            "line_items": [
                {
                    "id": "line_item_1",
                    "item": {
                        "id": "item_1",
                        "quantity": 1,
                    },
                    "base_amount": 3000,
                    "discount": 0,
                    "subtotal": 3000,
                    "tax": 300,
                    "total": 3300,
                },
            ],
            "fulfillment_address": {
                "name": "Jane Customer",
                "line_one": "123 Main St",
                "line_two": "Apt 4B",
                "city": "San Francisco",
                "state": "CA",
                "country": "US",
                "postal_code": "94107",
                "phone_number": "+1 (555) 555-5555",
            },
            "fulfillment_options": [
                {
                    "id": "fulfillment_option_1",
                    "type": "shipping",
                    "title": "Standard shipping",
                    "subtitle": "3-5 business days",
                    "carrier": "USPS",
                    "earliest_delivery_time": "2026-02-24T15:00:00Z",
                    "latest_delivery_time": "2026-02-28T18:00:00Z",
                    "subtotal": 0,
                    "tax": 0,
                    "total": 0,
                },
            ],
            "fulfillment_option_id": "fulfillment_option_1",
            "totals": [
                {
                    "type": "items_base_amount",
                    "display_text": "Items subtotal",
                    "amount": 3000,
                },
                {
                    "type": "subtotal",
                    "display_text": "Subtotal",
                    "amount": 3000,
                },
                {
                    "type": "tax",
                    "display_text": "Tax",
                    "amount": 300,
                },
                {
                    "type": "total",
                    "display_text": "Total",
                    "amount": 3300,
                },
            ],
            "order": {
                "id": "order_id_123",
                "checkout_session_id": checkout_session_id,
                "permalink_url": "",
            },
        },
        _meta={META_SESSION_ID: "checkout-flow"},
        isError=False,
    )
```

将其调整为：

- 与你的 PSP 集成，以便通过 `payment_data` 中的 payment method 收款。
- 在后端持久化订单。
- 返回权威 order/receipt data。
- 如果你想渲染 confirmation widget，请包含 `_meta.ui.resourceUri`（ChatGPT 会把 `_meta["openai/outputTemplate"]` 作为可选 compatibility alias 处理）。

以下 PSPs 支持 ChatGPT payment sheet 的 payments processing：

- [Adyen](https://docs.adyen.com/online-payments/agentic-commerce)
- [Checkout.com](https://api-reference.checkout.com/tag/Agentic-Commerce-Protocol/)
- Fiserv
- [PayPal](https://docs.paypal.ai/growth/agentic-commerce/agent-ready)
- [Stripe](https://docs.stripe.com/agentic-commerce/apps)
- [Worldpay](https://docs.worldpay.com/access/products/ai/acp)

## 可选：接收 Raw Payment Methods

如果你是拥有 PCI DSS Level 1 certificate 的 merchant，可以通过实现 Agentic Commerce Protocol Delegate Payment endpoint 直接接收 raw payment methods。delegated payment request 会包含你的 payment flow 所需的完整 payment method details，包括 raw card number、expiration date、CVC、billing address、allowance constraints、risk signals 和 metadata。

例如，raw card payment method request 如下：

```json
{
  "payment_method": {
    "type": "card",
    "card_number_type": "fpan",
    "number": "4242424242424242",
    "exp_month": "11",
    "exp_year": "2026",
    "name": "Jane Doe",
    "cvc": "223",
    "checks_performed": ["avs", "cvv"],
    "iin": "424242",
    "display_card_funding_type": "credit",
    "display_brand": "visa",
    "display_last4": "4242",
    "metadata": {}
  },
  "allowance": {
    "reason": "one_time",
    "max_amount": 5000,
    "currency": "usd",
    "checkout_session_id": "cs_01HV3P3ABC123",
    "merchant_id": "acme_corp",
    "expires_at": "2026-02-13T12:00:00Z"
  },
  "billing_address": {
    "name": "Jane Doe",
    "line_one": "185 Berry Street",
    "line_two": "Suite 550",
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "postal_code": "94107"
  },
  "risk_signals": [
    {
      "type": "card_testing",
      "score": 5,
      "action": "authorized"
    }
  ],
  "metadata": {
    "session_id": "sess_abc123",
    "user_agent": "ChatGPT/2.0"
  }
}
```

对应响应应返回一个代表 payment method 的 id。此 id 会作为 `payment_data` 的一部分传给 `complete_checkout`。

```json
{
  "id": "vt_01J8Z3WXYZ9ABC123",
  "created": "2026-02-12T14:30:00Z",
  "metadata": {
    "source": "agent_checkout",
    "merchant_id": "acme_corp",
    "idempotency_key": "idem_xyz789"
  }
}
```

## Error Handling

`complete_checkout` tool call 可以返回 type 为 `error` 的 messages。`code` 设为 `payment_declined` 或 `requires_3ds` 的 error messages 会显示在 ChatGPT payment sheet 上。所有其他 error messages 都会作为 `requestCheckout` 的响应发回 widget。widget 可以按需显示错误。

## Test payment mode

你可以在调用 `requestCheckout` 时把 `payment_mode` 字段的值设为 `test`。这会显示一个接受 test cards（例如 4242 test card）的 ChatGPT payment sheet。传给 `complete_checkout` tool 的 `payment_data` 中生成的 `token` 可以在你的 PSP staging environment 中处理。这允许你测试端到端流程，而不移动真实资金。

请注意，在 test payment mode 中，你可能必须为 `merchant_id` 设置不同值。更多详情请参考你的 PSP monetization guide。

## Implementation checklist

1. **Define your checkout session model**：包含 ids、payment_provider、line_items、totals 和 legal links。
2. **Return the session from your MCP tool**：在 `structuredContent` 中返回 session，并附带你的 widget template。
3. **Render the session in the widget**：让用户可以查看 items、totals 和 terms。
4. **Call `requestCheckout(session_data)`**：在用户操作时调用；处理 resolved order 或 error。
5. **Charge the user**：实现 `complete_checkout` MCP tool，并返回遵循 checkout spec 的响应。
6. **Test end-to-end**：使用现实的 amounts、taxes 和 discounts 进行端到端测试，确保 host 按你的预期渲染 totals。

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

When building a ChatGPT app, developers are responsible for choosing how to monetize their experience. Today, the **recommended** and **generally available** approach is to use **external checkout**, where users complete purchases on the developer’s own domain. While current approval is limited to apps for physical goods purchases, we are actively working to support a wider range of commerce use cases.

We’re also enabling **in-app checkout with ChatGPT payment sheet** for select marketplace partners (beta), with plans to extend access to more marketplaces and physical-goods retailers over time. Until then, we recommend routing purchase flows to your standard external checkout.

## Recommended Monetization Approach

### ✅ External Checkout (recommended)

**External checkout** means directing users from ChatGPT to a **merchant-hosted checkout flow** on your own website or application, where you handle pricing, payments, subscriptions, and fulfillment.

This is the recommended approach for most developers building ChatGPT apps.

#### How it works

1. A user interacts with your app in ChatGPT.
2. Your app presents purchasable items, plans, or services (e.g., “Upgrade,” “Buy now,” “Subscribe”).
3. When the user decides to purchase, your app links or redirects them out of ChatGPT and to your external checkout flow.
4. Payment, billing, taxes, refunds, and compliance are handled entirely on your domain.
5. After purchase, the user can return to ChatGPT with confirmation or unlocked features.

### In-app Checkout with Saved Payment Methods

App developers can build a checkout flow directly in their ChatGPT app that allows customers to use payment methods already saved with the merchant. This flow can only display saved payment methods and cannot collect new payment method credentials from customers.

In this approach, the customer does not need to be redirected to another surface outside ChatGPT to complete the purchase.

#### How it works

1. A user interacts with your app in ChatGPT.
2. Your app presents purchasable items, plans, or services with the relevant totals.
3. Your app displays eligible payment methods that the customer has already saved with you.
4. The customer selects a saved payment method and confirms the purchase in ChatGPT.
5. Your backend processes the purchase with the saved payment method and returns confirmation to the app.

### In-app Checkout with ChatGPT Payment Sheet (private beta)



In-app checkout with ChatGPT payment sheet is limited to select marketplaces
  today and is not available to all users.



In order to collect new payment methods within the in-app checkout flow, app developers need to use the ChatGPT payment sheet. Call `requestCheckout` with checkout session data (line items, totals, saved payment methods) to open the ChatGPT payment sheet. When the user clicks buy, a token representing the selected payment method is sent to your MCP server via the `complete_checkout` tool call. You can use your PSP integration to collect payment using this token, and send back finalized order details as a response to the `complete_checkout` tool call.

### Flow at a glance

1. **Server prepares session**: An MCP tool returns checkout session data (session id, line items, totals, payment provider) in `structuredContent`.
2. **Widget previews cart**: The widget renders line items and totals so the user can confirm.
3. **Widget calls `requestCheckout`**: The widget invokes `requestCheckout(session_data)`. ChatGPT opens the payment sheet, displays the amount to charge, and displays various payment methods.
4. **Server finalizes**: Once the user clicks the pay button, the widget calls back to your MCP via the `complete_checkout` tool call. The MCP tool returns the completed order, which will be returned back to widget as a response to `requestCheckout`.

## Checkout session

You are responsible for constructing the checkout session payload that the host will render. The exact values for certain fields such as `id` and `payment_provider` depend on your PSP (payment service provider) and commerce backend. In practice, your MCP tool should return:

- Line items and quantities the user is purchasing.
- Totals (subtotal, tax, discounts, fees, total) that match your backend calculations.
- Provider metadata required by your PSP integration.
- Legal and policy links (terms, refund policy, etc.).

## Widget: calling `requestCheckout` (ChatGPT Apps SDK capability)

The host provides `window.openai.requestCheckout`. Use it to open the ChatGPT payment sheet when the user initiates a purchase:

Example:

```tsx
async function handleCheckout(sessionJson: string) {
  const session = JSON.parse(sessionJson);

  if (!window.openai?.requestCheckout) {
    throw new Error("requestCheckout is not available in this host");
  }

  // Host opens the ChatGPT payment sheet.
  const order = await window.openai.requestCheckout({
    ...session,
    id: checkout_session_id, // Every unique checkout session should have a unique id
  });

  return order; // host returns the order payload
}
```

In your component, you might initiate this in a button click:

```tsx


{
    setIsLoading(true);
    try {
      const orderResponse = await handleCheckout(checkoutSessionJson);
      setOrder(orderResponse);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }}
>
  {isLoading ? "Loading..." : "Checkout"}


```

Here is a complete checkout session example that your widget can pass to the host. Your app supplies the checkout session fields below. ChatGPT adds host-owned fields such as `merchant`, `logo_url`, `conversation_id`, `connector_id`, and `ecosystem_app_uri`. Populate the `merchant_id` field with the value specified by your PSP:

```tsx
const checkoutRequest = {
  id: "checkout_session_123",
  payment_provider: {
    provider: "stripe",
    merchant_id: "merchant_123",
    supported_payment_methods: [
      {
        type: "card",
        allowed_card_brands: ["visa", "mastercard"],
      },
      { type: "apple_pay" },
      { type: "google_pay" },
    ],
    managed_payment_methods: [
      {
        type: "card",
        id: "pm_123",
        display_name: "Visa ending in 4242",
        display_last4: "4242",
        display_brand: "visa",
      },
    ],
  },
  payment_mode: "live",
  status: "ready_for_payment",
  currency: "USD",
  metadata: {
    cart_id: "cart_123",
    merchant_order_reference: "order_ref_123",
  },
  line_items: [
    {
      id: "line_item_123",
      item: {
        id: "item_123",
        quantity: 1,
      },
      name: "Canvas backpack",
      description: "A weather-resistant everyday backpack.",
      images: ["https://merchant.example.com/images/canvas-backpack.png"],
      base_amount: 3000,
      discount: 0,
      subtotal: 3000,
      tax: 300,
      total: 3300,
    },
  ],
  totals: [
    {
      type: "items_base_amount",
      display_text: "Items subtotal",
      amount: 3000,
    },
    {
      type: "subtotal",
      display_text: "Subtotal",
      amount: 3000,
    },
    {
      type: "fulfillment",
      display_text: "Shipping",
      amount: 550,
    },
    {
      type: "tax",
      display_text: "Tax",
      amount: 300,
    },
    {
      type: "total",
      display_text: "Total",
      amount: 3850,
    },
  ],
  fulfillment_options: [
    {
      id: "standard_shipping",
      type: "shipping",
      title: "Standard shipping",
      subtitle: "Arrives in 3-5 business days",
      carrier: "USPS",
      earliest_delivery_time: "2027-01-15T15:00:00Z",
      latest_delivery_time: "2027-01-19T18:00:00Z",
      subtotal: 500,
      tax: 50,
      total: 550,
    },
  ],
  fulfillment_option_id: "standard_shipping",
  fulfillment_address: {
    name: "Jane Customer",
    line_one: "123 Main St",
    line_two: "Apt 4B",
    city: "San Francisco",
    state: "CA",
    country: "US",
    postal_code: "94107",
    phone_number: "+14155550123",
  },
  messages: [
    {
      type: "info",
      param: "fulfillment_address",
      content_type: "plain",
      content: "Free returns within 30 days.",
    },
  ],
  links: [
    { type: "terms_of_use", url: "https://merchant.example.com/terms" },
    { type: "privacy_policy", url: "https://merchant.example.com/privacy" },
    { type: "support_url", url: "https://merchant.example.com/support" },
  ],
};

const response = await window.openai.requestCheckout(checkoutRequest);
```

Key points:

- `window.openai.requestCheckout(session)` opens the host checkout UI.
- The promise resolves with the order result or rejects on error/cancel.
- Render the session JSON so users can review what they’re paying for.
- Use integer minor currency units for all amount fields.
- Use `payment_provider.managed_payment_methods` for payment methods the customer has already saved with your merchant.
- Keep `metadata` values as strings.
- Use the PSP slug required by your integration for `provider`, and consult your PSP to get its `merchant_id` value.

## MCP server: expose the `complete_checkout` tool

You can mirror this pattern and swap in your logic:

For direct `CallToolResult` returns, the Python MCP SDK uses the `Annotated`
return type below to declare the tool `outputSchema` for `structuredContent`.

```py
from typing import Annotated, Any

from pydantic import BaseModel


class CompleteCheckoutOutput(BaseModel):
    id: str
    status: str
    currency: str
    line_items: list[dict[str, Any]]
    fulfillment_address: dict[str, Any]
    fulfillment_options: list[dict[str, Any]]
    fulfillment_option_id: str
    totals: list[dict[str, Any]]
    order: dict[str, Any]


@tool(description="")
async def complete_checkout(
    self,
    checkout_session_id: str,
    buyer: Buyer,
    payment_data: PaymentData,
) -> Annotated[types.CallToolResult, CompleteCheckoutOutput]:
    return types.CallToolResult(
        content=[],
        structuredContent={
            "id": checkout_session_id,
            "status": "completed",
            "currency": "USD",
            "line_items": [
                {
                    "id": "line_item_1",
                    "item": {
                        "id": "item_1",
                        "quantity": 1,
                    },
                    "base_amount": 3000,
                    "discount": 0,
                    "subtotal": 3000,
                    "tax": 300,
                    "total": 3300,
                },
            ],
            "fulfillment_address": {
                "name": "Jane Customer",
                "line_one": "123 Main St",
                "line_two": "Apt 4B",
                "city": "San Francisco",
                "state": "CA",
                "country": "US",
                "postal_code": "94107",
                "phone_number": "+1 (555) 555-5555",
            },
            "fulfillment_options": [
                {
                    "id": "fulfillment_option_1",
                    "type": "shipping",
                    "title": "Standard shipping",
                    "subtitle": "3-5 business days",
                    "carrier": "USPS",
                    "earliest_delivery_time": "2026-02-24T15:00:00Z",
                    "latest_delivery_time": "2026-02-28T18:00:00Z",
                    "subtotal": 0,
                    "tax": 0,
                    "total": 0,
                },
            ],
            "fulfillment_option_id": "fulfillment_option_1",
            "totals": [
                {
                    "type": "items_base_amount",
                    "display_text": "Items subtotal",
                    "amount": 3000,
                },
                {
                    "type": "subtotal",
                    "display_text": "Subtotal",
                    "amount": 3000,
                },
                {
                    "type": "tax",
                    "display_text": "Tax",
                    "amount": 300,
                },
                {
                    "type": "total",
                    "display_text": "Total",
                    "amount": 3300,
                },
            ],
            "order": {
                "id": "order_id_123",
                "checkout_session_id": checkout_session_id,
                "permalink_url": "",
            },
        },
        _meta={META_SESSION_ID: "checkout-flow"},
        isError=False,
    )
```

Adapt this to:

- Integrate with your PSP to charge the payment method within `payment_data`.
- Persist the order in your backend.
- Return authoritative order/receipt data.
- Include `_meta.ui.resourceUri` if you want to render a confirmation widget (ChatGPT honors `_meta["openai/outputTemplate"]` as an optional compatibility alias).

The following PSPs support payments processing for the ChatGPT payment sheet:

- [Adyen](https://docs.adyen.com/online-payments/agentic-commerce)
- [Checkout.com](https://api-reference.checkout.com/tag/Agentic-Commerce-Protocol/)
- Fiserv
- [PayPal](https://docs.paypal.ai/growth/agentic-commerce/agent-ready)
- [Stripe](https://docs.stripe.com/agentic-commerce/apps)
- [Worldpay](https://docs.worldpay.com/access/products/ai/acp)

## Optional: Receive Raw Payment Methods

If you are a merchant with a PCI DSS Level 1 certificate, you can receive raw payment methods directly by implementing the Agentic Commerce Protocol Delegate Payment endpoint. The delegated payment request will include the full payment method details your payment flow requires, including the raw card number, expiration date, CVC, billing address, allowance constraints, risk signals, and metadata.

For example, a raw card payment method request is as follows:

```json
{
  "payment_method": {
    "type": "card",
    "card_number_type": "fpan",
    "number": "4242424242424242",
    "exp_month": "11",
    "exp_year": "2026",
    "name": "Jane Doe",
    "cvc": "223",
    "checks_performed": ["avs", "cvv"],
    "iin": "424242",
    "display_card_funding_type": "credit",
    "display_brand": "visa",
    "display_last4": "4242",
    "metadata": {}
  },
  "allowance": {
    "reason": "one_time",
    "max_amount": 5000,
    "currency": "usd",
    "checkout_session_id": "cs_01HV3P3ABC123",
    "merchant_id": "acme_corp",
    "expires_at": "2026-02-13T12:00:00Z"
  },
  "billing_address": {
    "name": "Jane Doe",
    "line_one": "185 Berry Street",
    "line_two": "Suite 550",
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "postal_code": "94107"
  },
  "risk_signals": [
    {
      "type": "card_testing",
      "score": 5,
      "action": "authorized"
    }
  ],
  "metadata": {
    "session_id": "sess_abc123",
    "user_agent": "ChatGPT/2.0"
  }
}
```

The corresponding response should return an id representing the payment method. This id will be passed to `complete_checkout` as part of `payment_data`.

```json
{
  "id": "vt_01J8Z3WXYZ9ABC123",
  "created": "2026-02-12T14:30:00Z",
  "metadata": {
    "source": "agent_checkout",
    "merchant_id": "acme_corp",
    "idempotency_key": "idem_xyz789"
  }
}
```

## Error Handling

The `complete_checkout` tool call can send back messages of type `error`. Error messages with `code` set to `payment_declined` or `requires_3ds` will be displayed on the ChatGPT payment sheet. All other error messages will be sent back to the widget as a response to `requestCheckout`. The widget can display the error as desired.

## Test payment mode

You can set the value of the `payment_mode` field to `test` in the call to `requestCheckout`. This will present a ChatGPT payment sheet that accepts test cards (such as the 4242 test card). The resulting `token` within `payment_data` that is passed to the `complete_checkout` tool can be processed in the staging environment of your PSP. This allows you to test end-to-end flows without moving real funds.

Note that in test payment mode, you might have to set a different value for `merchant_id`. Refer to your PSP's monetization guide for more details.

## Implementation checklist

1. **Define your checkout session model**: include ids, payment_provider,
   line_items, totals, and legal links.
2. **Return the session from your MCP tool** in `structuredContent` alongside your widget template.
3. **Render the session in the widget** so users can review items, totals, and terms.
4. **Call `requestCheckout(session_data)`** on user action; handle the resolved order or error.
5. **Charge the user** by implementing the `complete_checkout` MCP tool which
   returns a response that follows the checkout spec.
6. **Test end-to-end** with realistic amounts, taxes, and discounts to ensure the host renders the totals you expect.

:::
:::

