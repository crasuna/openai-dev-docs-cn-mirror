---
status: needs-review
sourceId: "b23ef681c4ab"
sourceChecksum: "b23ef681c4ab9c1df12e72fc6358de7cce177f7a8cac50cccfaa25af13ef963d"
sourceUrl: "https://developers.openai.com/commerce/guides/key-concepts"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# Key concepts

在 ChatGPT 中支持 Instant Checkout 需要商家实现三个 flows。

## Sharing a product feed

[Product feeds docs](https://developers.openai.com/commerce/specs) 定义了商家如何与 OpenAI 共享结构化 product data，使 ChatGPT 能在搜索和购物体验中准确展示其产品。

- 商家提供安全、定期刷新的 feed（CSV 或 JSON），其中包含 identifiers、descriptions、pricing、inventory、media 和 fulfillment options 等关键细节。
- Required fields 确保 price 和 availability 正确显示，而 rich media、reviews 和 performance signals 等推荐 attributes 会提升 ranking、relevance 和 user trust。
- 集成包括发送初始 sample feed 以供 validation，以及 daily snapshots。

## Handling orders and checkout

[Agentic Checkout Spec](https://developers.openai.com/commerce/specs/checkout) 让 ChatGPT 能作为客户的 AI agent，并渲染嵌入 ChatGPT UI 的 checkout experience。

- ChatGPT 从用户处收集 buyer、fulfillment 和 payment information。
- ChatGPT 调用商家的 Agentic Commerce Protocol endpoints，以创建或更新 checkout session，并安全共享信息。
- 商家执行 validation、确定 fulfillment options、计算并收取 sales tax，在自己的 stack 上分析 payment 和 risk signals，并通过现有 payment processor 对 payment method 扣款。商家接受或拒绝订单，并将此状态返回给 ChatGPT。
- ChatGPT 反映 states，并向用户显示 order confirmation（或 decline）message。

checkout session 在 OpenAI UI 中渲染，但实际 checkout
  state 和 payment processing 发生在商家系统中。OpenAI 向商家发送
  信息，商家决定是否接受或拒绝订单、对 payment method 扣款并确认订单，全部
  都在自己的系统中完成。

## Handling payments

[Delegated Payment Spec](https://developers.openai.com/commerce/specs/payment) 允许 OpenAI 与商家或其指定 payment service provider (PSP) 安全共享 payment details。商家及其 PSP 随后会以处理他们收集的其他订单和付款相同的方式处理交易和相关付款。

- OpenAI 准备一次性 delegated payment request，并根据用户在 ChatGPT UI 中选择购买的内容设置 maximum chargeable amount 和 expiry。
- 此 payload 会传递给商家受信任的 PSP，由其处理交易。
- PSP 返回 payment token，OpenAI 将其转交给商家以完成付款。
- [Stripe’s Shared Payment Token](https://docs.stripe.com/agentic-commerce) 是第一个兼容 Delegated Payment Spec 的实现，更多 PSP 即将推出。
- 符合条件的卡片将使用 network tokenization 升级。
- 如果你是 PSP，或是拥有自有 vault 的 PCI DSS level 1 merchant，请[了解如何构建与 OpenAI 的 direct integration](https://developers.openai.com/commerce/specs/payment)。

OpenAI 不是 Agentic Commerce Protocol 中的 merchant of record。
  商家应自带 PSP，并像接受其他数字付款一样处理付款。OpenAI Delegated Payment Spec
  确保这些 payment credentials 的使用方式受到限制，从而保护用户交易。

## End-to-end flow diagram

此图说明 Agentic Commerce Protocol 的端到端 data flow。

![Agentic Commerce Protocol flow diagram](https://developers.openai.com/images/commerce/commerce-acp-flow.png)
