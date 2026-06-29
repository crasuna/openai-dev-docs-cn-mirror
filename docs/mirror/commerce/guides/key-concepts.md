---
title: "关键概念"
description: "Understand the concepts of the Agentic Commerce Protocol"
outline: deep
---

# 关键概念

**文档集**：Commerce 商务<br>
**分组**：Agentic Commerce — 指南<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/commerce/guides/key-concepts](https://developers.openai.com/commerce/guides/key-concepts)
- Markdown 来源：[https://developers.openai.com/commerce/guides/key-concepts.md](https://developers.openai.com/commerce/guides/key-concepts.md)
- 抓取时间：2026-06-27T05:55:11.033Z
- Checksum：`b23ef681c4ab9c1df12e72fc6358de7cce177f7a8cac50cccfaa25af13ef963d`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
在 ChatGPT 中支持 Instant Checkout 需要商家实现三个流程。

## 共享 product feed

[Product feeds docs](https://developers.openai.com/commerce/specs) 定义了商家如何与 OpenAI 共享结构化 product data，使 ChatGPT 能在搜索和购物体验中准确展示其产品。

- 商家提供安全、定期刷新的 feed（CSV 或 JSON），其中包含 identifiers、descriptions、pricing、inventory、media 和 fulfillment options 等关键细节。
- 必填字段确保 price 和 availability 正确显示，而 rich media、reviews 和 performance signals 等推荐 attributes 会提升 ranking、relevance 和 user trust。
- 集成包括发送初始 sample feed 以供 validation，以及每日 snapshots。

## 处理订单和结账

[Agentic Checkout Spec](/mirror/commerce/specs/checkout) 让 ChatGPT 能作为客户的 AI agent，并渲染嵌入 ChatGPT UI 的 checkout experience。

- ChatGPT 从用户处收集 buyer、fulfillment 和 payment information。
- ChatGPT 调用商家的 Agentic Commerce Protocol endpoints，以创建或更新 checkout session，并安全共享信息。
- 商家执行 validation、确定 fulfillment options、计算并收取 sales tax，在自己的 stack 上分析 payment 和 risk signals，并通过现有 payment processor 对 payment method 扣款。商家接受或拒绝订单，并将此状态返回给 ChatGPT。
- ChatGPT 反映这些状态，并向用户显示 order confirmation（或 decline）message。

checkout session 在 OpenAI UI 中渲染，但实际 checkout
  state 和 payment processing 发生在商家系统中。OpenAI 向商家发送
  信息，商家决定是否接受或拒绝订单、对 payment method 扣款并确认订单，全部
  都在自己的系统中完成。

## 处理付款

[Delegated Payment Spec](/mirror/commerce/specs/payment) 允许 OpenAI 与商家或其指定 payment service provider (PSP) 安全共享 payment details。商家及其 PSP 随后会以处理他们收集的其他订单和付款相同的方式处理交易和相关付款。

- OpenAI 准备一次性 delegated payment request，并根据用户在 ChatGPT UI 中选择购买的内容设置 maximum chargeable amount 和 expiry。
- 此 payload 会传递给商家受信任的 PSP，由其处理交易。
- PSP 返回 payment token，OpenAI 将其转交给商家以完成付款。
- [Stripe’s Shared Payment Token](https://docs.stripe.com/agentic-commerce) 是第一个兼容 Delegated Payment Spec 的实现，更多 PSP 即将推出。
- 符合条件的卡片将使用 network tokenization 升级。
- 如果你是 PSP，或是拥有自有 vault 的 PCI DSS level 1 merchant，请[了解如何构建与 OpenAI 的 direct integration](/mirror/commerce/specs/payment)。

OpenAI 不是 Agentic Commerce Protocol 中的 merchant of record。
  商家应自带 PSP，并像接受其他数字付款一样处理付款。OpenAI Delegated Payment Spec
  确保这些 payment credentials 的使用方式受到限制，从而保护用户交易。

## 端到端流程图

此图说明 Agentic Commerce Protocol 的端到端 data flow。

![Agentic Commerce Protocol flow diagram](/openai-assets/developers.openai.com/images/commerce/commerce-acp-flow.png)

:::

## English source

::: details 展开英文原文
::: v-pre
Supporting Instant Checkout in ChatGPT requires a merchant to implement three flows.

## Sharing a product feed

The [Product feeds docs](https://developers.openai.com/commerce/specs) define how merchants share structured product data with OpenAI so ChatGPT can accurately surface their products in search and shopping experiences.

- Merchants provide a secure, regularly refreshed feed (CSV or JSON) containing key details such as identifiers, descriptions, pricing, inventory, media, and fulfillment options.
- Required fields ensure correct display of price and availability, while recommended attributes—like rich media, reviews, and performance signals—improve ranking, relevance, and user trust.
- Integration involves sending an initial sample feed for validation, and daily snapshots.

## Handling orders and checkout

The [Agentic Checkout Spec](/mirror/commerce/specs/checkout) enables ChatGPT to act as the customer’s AI agent and renders a checkout experience embedded in ChatGPT’s UI.

- ChatGPT collects buyer, fulfillment, and payment information from the user.
- ChatGPT calls the merchant’s Agentic Commerce Protocol endpoints to create or update a checkout session, and securely share information.
- The merchant performs validation, determines fulfillment options, calculates and charges sales tax, , analyzes payment and risk signals on their own stack, and charges the payment method with their existing payment processor. The merchant accepts or declines the order, and returns this state to ChatGPT.
- ChatGPT reflects states and shows the order confirmation (or decline) message to the user.

The checkout session is rendered in the OpenAI UI, but the actual checkout
  state and payment processing occurs on the merchant’s systems. OpenAI sends
  the merchant information and the merchant determines whether to accept or
  decline the order, charge the payment method, and confirm the order – all on
  their own systems.

## Handling payments

The [Delegated Payment Spec](/mirror/commerce/specs/payment) allows OpenAI to securely share payment details with the merchant or its designated payment service provider (PSP). The merchant and its PSP then handle the transaction and process the related payment in the same manner as any other order and payment they collect.

- OpenAI prepares a one-time delegated payment request and sets a maximum chargeable amount and expiry based on what the user has selected to buy in ChatGPT’s UI.
- This payload is passed to the merchant’s trusted PSP who will handle the transaction.
- The PSP responds with a payment token that OpenAI passes on to the merchant to complete the payment.
- [Stripe’s Shared Payment Token](https://docs.stripe.com/agentic-commerce) is the first Delegated Payment Spec-compatible implementation, with more PSPs coming soon.
- Eligible cards will be upgraded using network tokenization.
- If you’re a PSP or a PCI DSS level 1 merchant with your own vault, [learn how to build a direct integration with OpenAI](/mirror/commerce/specs/payment).

OpenAI is not the merchant of record in the Agentic Commerce Protocol.
  Merchants are expected to bring their own PSP and handle payments just as they
  do for accepting any other digital payment. The OpenAI Delegated Payment Spec
  ensures that restrictions are placed on how these payment credentials are used
  to secure user transactions.

## End-to-end flow diagram

This diagram illustrates the end-to-end data flow of the Agentic Commerce Protocol.

![Agentic Commerce Protocol flow diagram](/openai-assets/developers.openai.com/images/commerce/commerce-acp-flow.png)

:::
:::

