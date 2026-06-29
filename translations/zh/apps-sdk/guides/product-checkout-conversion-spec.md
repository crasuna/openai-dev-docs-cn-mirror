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
    这里
  </a>

## 目的

我们的目标是让 ChatGPT 能够为产品结账等高意图用例直接调用合作伙伴 app。

合作伙伴向我们提供用于搜索的产品 feed 后，我们就可以将其应用接入漏斗底部的转化动作。为此，合作伙伴应用需要遵循 widget name、tool name 和 tool input 的标准化契约。

如果你想构建遵循此规格的应用，请通过 [ChatGPT merchants 表单](https://chatgpt.com/merchants/) 申请访问权限。

## 用户体验

当用户搜索产品时，产品实体侧边栏可以为卖家显示 **Open** 按钮。如果卖家有 ChatGPT 应用，ChatGPT 可以内联打开该应用进行结账，而不是跳转到外部网站。

## 必需契约（当前）

- Widget name：`ui://widget/checkout-session.html`
- Tool name：`checkout_session`

`checkout_session` 必须设置：

```ts
_meta.ui.resourceUri = "ui://widget/checkout-session.html";
```

任何直接从 widget 调用的工具都必须设置：

```ts
_meta["openai/widgetAccessible"] = true;
```

## `checkout_session` 输入

当前输入 shape：

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
