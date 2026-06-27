# Product checkout conversion spec

Product checkout conversion apps in ChatGPT are currently in beta and being
  tested with approved partners. To apply for access, fill out this form 
  <a
    href="https://chatgpt.com/merchants"
    target="_blank"
    rel="noopener noreferrer"
  >
    here
  </a>

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
[here](https://developers.openai.com/commerce/specs/checkout/#post-checkout_sessions).
