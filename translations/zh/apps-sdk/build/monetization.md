---
status: needs-review
sourceId: "c9e8f32e79ba"
sourceChecksum: "c9e8f32e79baa3fa05a85e55b51c84d0774412d8623f6172dc59b3f97ebb9f6a"
sourceUrl: "https://developers.openai.com/apps-sdk/build/monetization"
translatedAt: "2026-06-27T19:35:17.0701114+08:00"
translator: codex-gpt-5.5-xhigh
---

# 商业化

## 概览

构建 ChatGPT 应用时，开发者负责选择如何将自己的体验商业化。今天，**推荐** 且 **普遍可用** 的方式是使用 **external checkout**，即用户在开发者自己的域名上完成购买。虽然当前批准范围仅限于实物商品购买类应用，但我们正在积极努力支持更广泛的 commerce 使用场景。

我们也正在为部分 marketplace partner（beta）启用 **in-app checkout with ChatGPT payment sheet**，并计划随着时间推移将访问扩展到更多 marketplace 和实物商品零售商。在此之前，我们建议把购买流程路由到你的标准 external checkout。

## 推荐商业化方式

### ✅ External Checkout（推荐）

**External checkout** 指将用户从 ChatGPT 引导到你自己网站或应用上的 **merchant-hosted checkout flow**，在那里由你处理定价、支付、订阅和履约。

这是大多数构建 ChatGPT 应用的开发者推荐采用的方式。

#### 工作方式

1. 用户在 ChatGPT 中与你的 app 交互。
2. 你的应用呈现可购买的 item、plan 或 service（例如 “Upgrade”、“Buy now”、“Subscribe”）。
3. 当用户决定购买时，你的应用会把他们链接或重定向出 ChatGPT，前往你的 external checkout flow。
4. 支付、账单、税费、退款和合规全部在你的域名上处理。
5. 购买后，用户可以带着确认信息或已解锁功能回到 ChatGPT。

### 使用已保存支付方式的 In-app Checkout

应用开发者可以直接在 ChatGPT 应用中构建 checkout flow，允许客户使用已与商户保存的 payment method。此流程只能显示已保存的 payment method，不能从客户收集新的 payment method credential。

在这种方式中，客户无需被重定向到 ChatGPT 外部的其他 surface 即可完成购买。

#### 工作方式

1. 用户在 ChatGPT 中与你的应用交互。
2. 你的应用呈现可购买的 item、plan 或 service，以及相关 totals。
3. 你的应用显示客户已与你保存的 eligible payment method。
4. 客户选择已保存的 payment method，并在 ChatGPT 中确认购买。
5. 你的后端使用已保存 payment method 处理购买，并向应用返回确认。

### 使用 ChatGPT Payment Sheet 的 In-app Checkout（private beta）



使用 ChatGPT payment sheet 的 in-app checkout 当前仅限部分 marketplaces，且并非所有用户都可用。



为了在 in-app checkout flow 中收集新的 payment method，应用开发者需要使用 ChatGPT payment sheet。调用 `requestCheckout` 并传入 checkout session data（line items、totals、saved payment methods）以打开 ChatGPT payment sheet。用户点击 buy 后，代表所选 payment method 的 token 会通过 `complete_checkout` 工具调用发送到你的 MCP server。你可以使用 PSP 集成通过该 token 收款，并把最终订单详情作为 `complete_checkout` 工具调用的响应发回。

### 流程一览

1. **服务器准备 session**：MCP 工具在 `structuredContent` 中返回 checkout session data（session id、line items、totals、payment provider）。
2. **Widget 预览购物车**：widget 渲染 line items 和 totals，供用户确认。
3. **Widget 调用 `requestCheckout`**：widget 调用 `requestCheckout(session_data)`。ChatGPT 打开 payment sheet，显示要扣款的金额，并显示各种 payment method。
4. **服务器完成收尾**：一旦用户点击 pay 按钮，widget 会通过 `complete_checkout` 工具调用回调你的 MCP。MCP 工具返回已完成订单，该订单会作为 `requestCheckout` 的响应返回给 widget。

## Checkout session

你负责构造 host 将渲染的 checkout session payload。某些字段（例如 `id` 和 `payment_provider`）的确切值取决于你的 PSP（payment service provider）和 commerce backend。实际中，你的 MCP 工具应返回：

- 用户正在购买的 line items 和数量。
- 与你的后端计算一致的 totals（subtotal、tax、discounts、fees、total）。
- 你的 PSP 集成所需的 provider metadata。
- 法律和政策链接（terms、refund policy 等）。

## Widget：调用 `requestCheckout`（ChatGPT Apps SDK 能力）

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

下面是一个完整 checkout session 示例，你的 widget 可以把它传给 host。你的应用提供以下 checkout session 字段。ChatGPT 会添加 host-owned 字段，例如 `merchant`、`logo_url`、`conversation_id`、`connector_id` 和 `ecosystem_app_uri`。请用你的 PSP 指定的值填充 `merchant_id` 字段：

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
- 所有金额字段都使用整数形式的最小货币单位。
- 对客户已经与你的商户保存的 payment method，使用 `payment_provider.managed_payment_methods`。
- 保持 `metadata` 值为字符串。
- 为 `provider` 使用集成要求的 PSP slug，并咨询你的 PSP 获取其 `merchant_id` 值。

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
- 返回权威订单/收据数据。
- 如果你想渲染 confirmation widget，请包含 `_meta.ui.resourceUri`（ChatGPT 会把 `_meta["openai/outputTemplate"]` 作为可选兼容别名处理）。

以下 PSP 支持 ChatGPT payment sheet 的支付处理：

- [Adyen](https://docs.adyen.com/online-payments/agentic-commerce)
- [Checkout.com](https://api-reference.checkout.com/tag/Agentic-Commerce-Protocol/)
- Fiserv
- [PayPal](https://docs.paypal.ai/growth/agentic-commerce/agent-ready)
- [Stripe](https://docs.stripe.com/agentic-commerce/apps)
- [Worldpay](https://docs.worldpay.com/access/products/ai/acp)

## 可选：接收原始 Payment Method

如果你是拥有 PCI DSS Level 1 certificate 的商户，可以通过实现 Agentic Commerce Protocol Delegate Payment endpoint 直接接收原始 payment method。delegated payment request 会包含你的支付流程所需的完整 payment method details，包括原始卡号、到期日期、CVC、账单地址、allowance constraints、risk signals 和 metadata。

例如，原始卡 payment method request 如下：

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

## 错误处理

`complete_checkout` 工具调用可以返回 type 为 `error` 的 message。`code` 设为 `payment_declined` 或 `requires_3ds` 的 error message 会显示在 ChatGPT payment sheet 上。所有其他 error message 都会作为 `requestCheckout` 的响应发回 widget。widget 可以按需显示错误。

## 测试支付模式

你可以在调用 `requestCheckout` 时把 `payment_mode` 字段的值设为 `test`。这会显示一个接受测试卡（例如 4242 test card）的 ChatGPT payment sheet。传给 `complete_checkout` 工具的 `payment_data` 中生成的 `token` 可以在你的 PSP staging environment 中处理。这允许你测试端到端流程，而不移动真实资金。

请注意，在测试支付模式中，你可能必须为 `merchant_id` 设置不同值。更多详情请参考你的 PSP monetization guide。

## 实现清单

1. **定义你的 checkout session model**：包含 ids、payment_provider、line_items、totals 和 legal links。
2. **从你的 MCP 工具返回 session**：在 `structuredContent` 中返回 session，并附带你的 widget template。
3. **在 widget 中渲染 session**：让用户可以查看 items、totals 和 terms。
4. **调用 `requestCheckout(session_data)`**：在用户操作时调用；处理 resolved order 或 error。
5. **向用户收费**：实现 `complete_checkout` MCP 工具，并返回遵循 checkout spec 的响应。
6. **端到端测试**：使用现实的 amounts、taxes 和 discounts 进行端到端测试，确保 host 按你的预期渲染 totals。
