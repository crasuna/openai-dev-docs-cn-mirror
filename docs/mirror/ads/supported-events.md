---
title: "Supported events"
description: "Supported conversion events & data shapes."
outline: deep
---

# Supported events

**文档集**：Ads  
**分组**：Ads — Supported Events  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/ads/supported-events](https://developers.openai.com/ads/supported-events)
- Markdown 来源：[https://developers.openai.com/ads/supported-events.md](https://developers.openai.com/ads/supported-events.md)
- 抓取时间：2026-06-27T05:53:55.330Z
- Checksum：`a559fb2a99ef8518842156c4eef420b4717f6163aa3dc9678b8b676bef546669`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
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

:::

## English source

::: details 展开英文原文
::: v-pre
## Supported event names

| Event name               | Data type         | Use for                                                            |
| ------------------------ | ----------------- | ------------------------------------------------------------------ |
| `app_installed`          | `customer_action` | A user installs an app.                                            |
| `app_opened`             | `customer_action` | A user opens an app.                                               |
| `appointment_scheduled`  | `customer_action` | A user books a meeting, demo, or consultation.                     |
| `checkout_started`       | `contents`        | A user starts checkout.                                            |
| `contents_viewed`        | `contents`        | A user views a product, listing, article, or other content unit.   |
| `custom`                 | `custom`          | A user-defined event that is not covered by the standard taxonomy. |
| `items_added`            | `contents`        | A user adds one or more items to a cart, bundle, or selection.     |
| `lead_created`           | `customer_action` | A user submits a lead form or requests contact.                    |
| `order_created`          | `contents`        | A purchase is completed.                                           |
| `page_viewed`            | `contents`        | A user lands on or views an important page.                        |
| `registration_completed` | `customer_action` | A user finishes an account or event registration flow.             |
| `subscription_created`   | `plan_enrollment` | A paid subscription starts.                                        |
| `trial_started`          | `plan_enrollment` | A free trial starts.                                               |

`app_installed` and `app_opened` are available through the Conversions API
only. Send them with `action_source` set to `mobile_app`. They are not
supported by the JavaScript Pixel currently.

Use `page_viewed` for page loads. Use `contents_viewed` when a user views a
specific product or content item, including interactions that happen after the
page has loaded.

## Event data shapes

All event data objects must include a `type` field that matches the event you
send. If you include an `amount`, also include a `currency`. Send monetary
values as integers in the standard ISO 4217 minor unit for the currency code
you provide, for example `12999` for $129.99 with `currency: "USD"`.

### `contents`

| Field      | Required | Type               | Notes                                                             |
| ---------- | -------- | ------------------ | ----------------------------------------------------------------- |
| `type`     | Yes      | string             | Must be `contents`.                                               |
| `amount`   | No       | integer            | Event-level monetary value in the currency's standard minor unit. |
| `currency` | Depends  | string             | Required when `amount` is present.                                |
| `contents` | No       | array of `Content` | Items associated with the event.                                  |

### `customer_action`

| Field      | Required | Type    | Notes                                                             |
| ---------- | -------- | ------- | ----------------------------------------------------------------- |
| `type`     | Yes      | string  | Must be `customer_action`.                                        |
| `amount`   | No       | integer | Event-level monetary value in the currency's standard minor unit. |
| `currency` | Depends  | string  | Required when `amount` is present.                                |

### `plan_enrollment`

| Field      | Required | Type               | Notes                                                             |
| ---------- | -------- | ------------------ | ----------------------------------------------------------------- |
| `type`     | Yes      | string             | Must be `plan_enrollment`.                                        |
| `plan_id`  | No       | string             | Your internal plan identifier.                                    |
| `amount`   | No       | integer            | Event-level monetary value in the currency's standard minor unit. |
| `currency` | Depends  | string             | Required when `amount` is present.                                |
| `contents` | No       | array of `Content` | Optional plan-related items.                                      |

### `custom`

| Field      | Required | Type               | Notes                                                             |
| ---------- | -------- | ------------------ | ----------------------------------------------------------------- |
| `type`     | Yes      | string             | Must be `custom`.                                                 |
| `plan_id`  | No       | string             | Optional plan identifier.                                         |
| `amount`   | No       | integer            | Event-level monetary value in the currency's standard minor unit. |
| `currency` | Depends  | string             | Required when `amount` is present.                                |
| `contents` | No       | array of `Content` | Optional items associated with the custom event.                  |

### `Content`

Use only these fields in each `contents[]` item.

| Field          | Required | Type    | Notes                                                                                                                             |
| -------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | No       | string  | Your internal item identifier.                                                                                                    |
| `name`         | No       | string  | Human-readable item name.                                                                                                         |
| `content_type` | No       | string  | Optional non-empty category such as `product`, `plan`, or `page`.                                                                 |
| `quantity`     | No       | integer | Quantity of the item. Use integers, not strings.                                                                                  |
| `amount`       | No       | integer | Item-level monetary value in the currency's standard minor unit.                                                                  |
| `currency`     | No       | string  | Include when you send an item-level `amount`, or rely on the event-level `currency` when one currency applies to the whole event. |

Use lowercase letters, numbers, underscores, or dashes in
`custom_event_name`. Keep the name between 1 and 64 characters, and do not
reuse one of the built-in event names.

:::
:::

