---
status: needs-review
sourceId: "a559fb2a99ef"
sourceChecksum: "a559fb2a99ef8518842156c4eef420b4717f6163aa3dc9678b8b676bef546669"
sourceUrl: "https://developers.openai.com/ads/supported-events"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# Supported events

## Supported event names

| Event name               | Data type         | Use for |
| ------------------------ | ----------------- | ------- |
| `app_installed`          | `customer_action` | 用户安装 app。 |
| `app_opened`             | `customer_action` | 用户打开 app。 |
| `appointment_scheduled`  | `customer_action` | 用户预约会议、demo 或咨询。 |
| `checkout_started`       | `contents`        | 用户开始 checkout。 |
| `contents_viewed`        | `contents`        | 用户查看商品、listing、文章或其他内容单元。 |
| `custom`                 | `custom`          | 未被标准 taxonomy 覆盖的用户定义 event。 |
| `items_added`            | `contents`        | 用户向购物车、bundle 或 selection 添加一个或多个 items。 |
| `lead_created`           | `customer_action` | 用户提交 lead form 或请求联系。 |
| `order_created`          | `contents`        | 购买已完成。 |
| `page_viewed`            | `contents`        | 用户到达或查看重要页面。 |
| `registration_completed` | `customer_action` | 用户完成账户或活动 registration flow。 |
| `subscription_created`   | `plan_enrollment` | 付费订阅开始。 |
| `trial_started`          | `plan_enrollment` | 免费试用开始。 |

`app_installed` 和 `app_opened` 仅可通过 Conversions API 使用。发送它们时将 `action_source` 设为 `mobile_app`。JavaScript Pixel 当前不支持它们。

页面加载请使用 `page_viewed`。当用户查看特定商品或内容项时，包括页面加载后发生的交互，请使用 `contents_viewed`。

## Event data shapes

所有 event data objects 都必须包含与所发送 event 匹配的 `type` 字段。如果包含 `amount`，也要包含 `currency`。请以你提供的 currency code 对应的标准 ISO 4217 最小货币单位，将 monetary values 作为整数发送，例如 `currency: "USD"` 时 $129.99 应发送为 `12999`。

### `contents`

| Field      | Required | Type               | Notes |
| ---------- | -------- | ------------------ | ----- |
| `type`     | Yes      | string             | 必须为 `contents`。 |
| `amount`   | No       | integer            | 使用该 currency 标准最小单位的 event-level monetary value。 |
| `currency` | Depends  | string             | 当存在 `amount` 时必填。 |
| `contents` | No       | array of `Content` | 与 event 关联的 items。 |

### `customer_action`

| Field      | Required | Type    | Notes |
| ---------- | -------- | ------- | ----- |
| `type`     | Yes      | string  | 必须为 `customer_action`。 |
| `amount`   | No       | integer | 使用该 currency 标准最小单位的 event-level monetary value。 |
| `currency` | Depends  | string  | 当存在 `amount` 时必填。 |

### `plan_enrollment`

| Field      | Required | Type               | Notes |
| ---------- | -------- | ------------------ | ----- |
| `type`     | Yes      | string             | 必须为 `plan_enrollment`。 |
| `plan_id`  | No       | string             | 你的内部 plan identifier。 |
| `amount`   | No       | integer            | 使用该 currency 标准最小单位的 event-level monetary value。 |
| `currency` | Depends  | string             | 当存在 `amount` 时必填。 |
| `contents` | No       | array of `Content` | 可选的 plan-related items。 |

### `custom`

| Field      | Required | Type               | Notes |
| ---------- | -------- | ------------------ | ----- |
| `type`     | Yes      | string             | 必须为 `custom`。 |
| `plan_id`  | No       | string             | 可选的 plan identifier。 |
| `amount`   | No       | integer            | 使用该 currency 标准最小单位的 event-level monetary value。 |
| `currency` | Depends  | string             | 当存在 `amount` 时必填。 |
| `contents` | No       | array of `Content` | 与 custom event 关联的可选 items。 |

### `Content`

每个 `contents[]` item 只能使用这些字段。

| Field          | Required | Type    | Notes |
| -------------- | -------- | ------- | ----- |
| `id`           | No       | string  | 你的内部 item identifier。 |
| `name`         | No       | string  | 人类可读的 item name。 |
| `content_type` | No       | string  | 可选的非空类别，例如 `product`、`plan` 或 `page`。 |
| `quantity`     | No       | integer | item 的数量。使用整数，不要使用字符串。 |
| `amount`       | No       | integer | 使用该 currency 标准最小单位的 item-level monetary value。 |
| `currency`     | No       | string  | 发送 item-level `amount` 时包含；如果一种 currency 适用于整个 event，也可以依赖 event-level `currency`。 |

在 `custom_event_name` 中使用小写字母、数字、下划线或连字符。名称长度保持在 1 到 64 个字符之间，并且不要复用任何内置 event name。
