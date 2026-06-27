# Supported events

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
