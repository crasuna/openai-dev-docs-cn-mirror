---
title: "Product checkout conversion spec"
description: "Contract for integrating a product checkout app into ChatGPT's conversion flow."
outline: deep
---

# Product checkout conversion spec

**文档集**：Apps SDK  
**分组**：Apps SDK — Guides  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/guides/product-checkout-conversion-spec](https://developers.openai.com/apps-sdk/guides/product-checkout-conversion-spec)
- Markdown 来源：[https://developers.openai.com/apps-sdk/guides/product-checkout-conversion-spec.md](https://developers.openai.com/apps-sdk/guides/product-checkout-conversion-spec.md)
- 抓取时间：2026-06-27T05:54:47.577Z
- Checksum：`c4b44d7eee68ed90c87b694523cb9ef2be1f73062ff6e12788c91d8154da829f`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
ChatGPT 中的产品结账转化 app 目前处于 beta 阶段，并正在与已获批准的合作伙伴一起测试。要申请访问权限，请填写此表单
  &lt;a
    href="https://chatgpt.com/merchants"
    target="_blank"
    rel="noopener noreferrer"
  &gt;
    here


## Purpose

我们的目标是让 ChatGPT 能够为产品结账等高意图用例直接调用合作伙伴 app。

合作伙伴向我们提供用于搜索的产品 feed 后，我们就可以将其 app 接入漏斗底部的转化动作。为此，合作伙伴 app 需要遵循 widget name、tool name 和 tool input 的标准化 contract。

如果你想构建遵循此规格的 app，请通过 [ChatGPT merchants form](https://chatgpt.com/merchants/) 申请访问权限。

## User experience

当用户搜索产品时，产品实体侧边栏可以为卖家显示 **Open** 按钮。如果卖家有 ChatGPT app，ChatGPT 可以内联打开该 app 进行结账，而不是跳转到外部网站。

## Required contract (today)

- Widget name: `ui://widget/checkout-session.html`
- Tool name: `checkout_session`

`checkout_session` 必须设置：

```ts
_meta.ui.resourceUri = "ui://widget/checkout-session.html";
```

任何直接从 widget 调用的工具都必须设置：

```ts
_meta["openai/widgetAccessible"] = true;
```

## `checkout_session` input

当前 input shape：

```json
{
  "checkout_session": {
    "items": [
      {
        "id": "string",
        "quantity": 1,
        "offerId": "string"
      }
    ]
  }
}
```

此 payload 与 [此处](/mirror/commerce/specs/checkout#post-checkout_sessions)记录的 Commerce checkout session shape 一致。

:::

## English source

::: details 展开英文原文
::: v-pre
Product checkout conversion apps in ChatGPT are currently in beta and being
  tested with approved partners. To apply for access, fill out this form 
  &lt;a
    href="https://chatgpt.com/merchants"
    target="_blank"
    rel="noopener noreferrer"
  &gt;
    here


## Purpose

Our goal is to let ChatGPT directly invoke partner apps for high-intent use
cases such as product checkout.

Once partners provide us with a product feed for search, we can hook up their apps for
bottom-of-funnel conversion actions. To do this, partner apps need to follow a
standardized contract for widget name, tool name, and tool input.

If you want to build an app that follows this spec, apply for access through the
[ChatGPT merchants form](https://chatgpt.com/merchants/).

## User experience

When users search for products, the product entity sidebar can show **Open**
buttons for sellers. If a seller has a ChatGPT app, ChatGPT can open that app
inline for checkout instead of punching out to an external website.

## Required contract (today)

- Widget name: `ui://widget/checkout-session.html`
- Tool name: `checkout_session`

`checkout_session` must set:

```ts
_meta.ui.resourceUri = "ui://widget/checkout-session.html";
```

Any tool called directly from a widget must set:

```ts
_meta["openai/widgetAccessible"] = true;
```

## `checkout_session` input

Current input shape:

```json
{
  "checkout_session": {
    "items": [
      {
        "id": "string",
        "quantity": 1,
        "offerId": "string"
      }
    ]
  }
}
```

This payload aligns with the Commerce checkout session shape documented
[here](/mirror/commerce/specs/checkout#post-checkout_sessions).

:::
:::

