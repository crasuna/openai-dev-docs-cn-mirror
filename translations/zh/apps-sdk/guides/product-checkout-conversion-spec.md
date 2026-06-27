---
status: needs-review
sourceId: "c4b44d7eee68"
sourceChecksum: "c4b44d7eee68ed90c87b694523cb9ef2be1f73062ff6e12788c91d8154da829f"
sourceUrl: "https://developers.openai.com/apps-sdk/guides/product-checkout-conversion-spec"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# 产品结账转化规格

ChatGPT 中的产品结账转化 app 目前处于 beta 阶段，并正在与已获批准的合作伙伴一起测试。要申请访问权限，请填写此表单
  <a
    href="https://chatgpt.com/merchants"
    target="_blank"
    rel="noopener noreferrer"
  >
    here
  </a>

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

此 payload 与 [此处](https://developers.openai.com/commerce/specs/checkout/#post-checkout_sessions)记录的 Commerce checkout session shape 一致。
