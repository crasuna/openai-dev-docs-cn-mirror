---
title: "Conversions API"
description: "Server-to-server conversion events."
outline: deep
---

# Conversions API

**文档集**：Ads  
**分组**：Ads — Conversions Api  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/ads/conversions-api](https://developers.openai.com/ads/conversions-api)
- Markdown 来源：[https://developers.openai.com/ads/conversions-api.md](https://developers.openai.com/ads/conversions-api.md)
- 抓取时间：2026-06-27T05:53:54.662Z
- Checksum：`e6a4972c637e67a3685258850889ffa5734181b33dce3eee1e5758b9bbb17aa7`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Conversions API 是比单独使用 pixel 更可靠的 tracking 来源。为了获得更准确的 insights，我们鼓励尽可能使用 Conversions API。

## 发送 events

只能从你的服务器向 Conversions API 发送 events。

```bash
curl -X POST "https://bzr.openai.com/v1/events?pid=<PIXEL-ID>" \
  -H "Authorization: Bearer <API-KEY>" \
  -H "Content-Type: application/json" \
  --data '{
    "validate_only": false,
    "events": []
  }'
```

你可以从 Ads Manager 账户的 conversions 标签页配置 Pixel ID 和 Conversions API key。
| Value | Required | Description |
| --------------- | -------- | ------------------------------------------------- |
| `pid` | Yes | 你的 Pixel ID。 |
| `validate_only` | No | 当为 `true` 时，校验 events 但不保存它们。 |
| `events` | Yes | 要发送的 events。 |

API 接受最多 1,000 个 events 的批次。如果批次中的一个 event 失败，整个批次都会失败。

对于 app lifecycle events，请使用现有 web data source 的 Pixel ID。从你的服务器发送 `app_installed` 和 `app_opened`，并将 `action_source` 设为 `mobile_app`。当前不支持 native mobile SDK 设置和 mobile data sources。

## Event structure

每个 event 都包含 event metadata 和一个 `data` 对象。

```json
{
  "id": "order_12345",
  "type": "order_created",
  "timestamp_ms": 1773892800000,
  "oppref": "oppref_abc",
  "source_url": "https://shop.example.com/checkout/confirmation",
  "action_source": "web",
  "user": {
    "email_sha256": "b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514",
    "external_id_sha256": "73d83a078369bb4f0971b317aa7797a91cf5c0df1b62161c2e47d75c33ab5b6e",
    "country": "US",
    "city": "San Francisco",
    "zip_code": "94107",
    "ip_address": "203.0.113.1",
    "user_agent": "Mozilla/5.0"
  },
  "data": {
    "type": "contents"
  }
}
```

| Field               | Required | Description |
| ------------------- | -------- | ----------- |
| `id`                | Yes      | 你的唯一 event 标识符。与 `type` 一起用于对 events 去重。 |
| `type`              | Yes      | 受支持的标准 event name，或 `custom`。 |
| `timestamp_ms`      | Yes      | event 时间，单位为毫秒。必须在过去 7 天内，且不能超前超过 10 分钟。 |
| `custom_event_name` | Depends  | 当 `type` 为 `custom` 时必填。 |
| `oppref`            | No       | OpenAI 提供的隐私保护标识符。 |
| `source_url`.       | Depends  | 当 `action_source` 为 `web` 时必填。对 `app_installed` 或 `app_opened` 不要求。 |
| `action_source`     | Depends  | 对 `app_installed` 和 `app_opened` 必填且必须为 `mobile_app`。其他情况下可选。 |
| `user`              | No       | 可选 user fields，可提高广告 conversions 的归因准确性。 |
| `opt_out`           | No       | 设为 `true` 可让该 event 退出未来的用户级个性化。默认值为 `false`。 |
| `data`              | Yes      | 与 event type 匹配的 event data。 |

event names 和 data shapes 请参阅 [Supported events](/mirror/ads/supported-events)。

与 pixel 不同，API 不会替你捕获 `oppref`。请自行捕获该值，并在可用时随 server event 一起传入。

## 发送 user data

向每个 event 添加可选的 `user` 对象，以改进 conversion matching。该对象是 event-scoped，因此请把它放在 `events` 中每个条目内部，而不是请求根级别。

`user` 对象中的每个字段都是可选的。只包含你拥有的用户字段。

### User object example

将此对象放在 event 的 `events[].user` 中：

```json
{
  "email_sha256": "b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514",
  "external_id_sha256": "73d83a078369bb4f0971b317aa7797a91cf5c0df1b62161c2e47d75c33ab5b6e",
  "country": "US",
  "city": "San Francisco",
  "zip_code": "94107",
  "ip_address": "203.0.113.1",
  "user_agent": "Mozilla/5.0"
}
```

| Field                | Description |
| -------------------- | ----------- |
| `email_sha256`       | 对 email address 去除首尾空白并转换为小写后得到的 SHA-256 hash。 |
| `external_id_sha256` | 来自你系统的稳定、假名化 customer identifier 的 SHA-256 hash。 |
| `country`            | 两字母 ISO 3166-1 国家/地区代码，例如 `US`。 |
| `city`               | 城市名称，最多 128 个字符。OpenAI 会去除首尾空白并转换为小写。 |
| `zip_code`           | Postal 或 ZIP code。可使用字母、数字、空格或连字符，最多 32 个字符。 |
| `ip_address`         | 有效的 IPv4 或 IPv6 地址。 |
| `user_agent`         | 生成该 event 的客户端中的非空 user agent 字符串。 |

请以小写的 64 字符十六进制字符串发送 hashes。请以原始值发送 geographic、IP address 和 user agent 字段。不要发送原始 email addresses、原始 external IDs、电话号码或电话号码 hashes。

## Example event

```bash
curl -X POST "https://bzr.openai.com/v1/events?pid=<PIXEL-ID>" \
  -H "Authorization: Bearer <API-KEY>" \
  -H "Content-Type: application/json" \
  --data '{
    "validate_only": false,
    "events": [
      {
        "id": "order_12345",
        "type": "order_created",
        "timestamp_ms": 1773892800000,
        "oppref": "oppref_abc",
        "source_url": "https://shop.example.com/checkout/confirmation",
        "action_source": "web",
        "user": {
          "email_sha256": "b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514",
          "external_id_sha256": "73d83a078369bb4f0971b317aa7797a91cf5c0df1b62161c2e47d75c33ab5b6e",
          "country": "US",
          "city": "San Francisco",
          "zip_code": "94107",
          "ip_address": "203.0.113.1",
          "user_agent": "Mozilla/5.0"
        },
        "data": {
          "type": "contents",
          "amount": 2599,
          "currency": "USD",
          "contents": [
            {
              "id": "sku_123",
              "name": "Starter bundle",
              "content_type": "product",
              "quantity": 1
            }
          ]
        }
      }
    ]
  }'
```

## App lifecycle events

App lifecycle events 使用 `customer_action` data shape，并要求 `action_source` 为 `mobile_app`。

### App installed

```json
{
  "id": "app_installed_123",
  "type": "app_installed",
  "timestamp_ms": <TIMESTAMP_MS>,
  "action_source": "mobile_app",
  "data": {
    "type": "customer_action"
  }
}
```

### App opened

```json
{
  "id": "app_opened_123",
  "type": "app_opened",
  "timestamp_ms": <TIMESTAMP_MS>,
  "action_source": "mobile_app",
  "data": {
    "type": "customer_action"
  }
}
```

## 对 browser 和 server events 去重

如果你同时通过 pixel 和 Conversions API 发送同一个 conversion，请复用同一个值作为 API `id` 和 pixel `event_id`。使用相同 Pixel ID 发送两个 events。对于 custom events，也请在两端使用相同的 `custom_event_name`。

:::

## English source

::: details 展开英文原文
::: v-pre
The Conversions API is a more reliable tracking source than the pixel alone. We encourage using the Conversions API when possible for more accurate insights.

## Send events

Send events to the Conversions API from your server only.

```bash
curl -X POST "https://bzr.openai.com/v1/events?pid=<PIXEL-ID>" \
  -H "Authorization: Bearer <API-KEY>" \
  -H "Content-Type: application/json" \
  --data '{
    "validate_only": false,
    "events": []
  }'
```

You can provision a Pixel ID and Conversions API key from the conversions tab on your Ads Manager account.
| Value | Required | Description |
| --------------- | -------- | ------------------------------------------------- |
| `pid` | Yes | Your Pixel ID. |
| `validate_only` | No | Validates events without saving them when `true`. |
| `events` | Yes | The events to send. |

The API accepts batches of up to 1,000 events. If one event in the batch fails,
the full batch fails.

For app lifecycle events, use the Pixel ID from an existing web data source.
Send `app_installed` and `app_opened` from your server with `action_source`
set to `mobile_app`. Native mobile SDK setup and mobile data sources are not
currently supported.

## Event structure

Each event includes the event metadata and a `data` object.

```json
{
  "id": "order_12345",
  "type": "order_created",
  "timestamp_ms": 1773892800000,
  "oppref": "oppref_abc",
  "source_url": "https://shop.example.com/checkout/confirmation",
  "action_source": "web",
  "user": {
    "email_sha256": "b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514",
    "external_id_sha256": "73d83a078369bb4f0971b317aa7797a91cf5c0df1b62161c2e47d75c33ab5b6e",
    "country": "US",
    "city": "San Francisco",
    "zip_code": "94107",
    "ip_address": "203.0.113.1",
    "user_agent": "Mozilla/5.0"
  },
  "data": {
    "type": "contents"
  }
}
```

| Field               | Required | Description                                                                                     |
| ------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `id`                | Yes      | Your unique event identifier. Used with `type` to deduplicate events.                           |
| `type`              | Yes      | A supported standard event name, or `custom`.                                                   |
| `timestamp_ms`      | Yes      | Event time in milliseconds. Must be within the last 7 days and no more than 10 minutes ahead.   |
| `custom_event_name` | Depends  | Required when `type` is `custom`.                                                               |
| `oppref`            | No       | OpenAI-provided privacy-preserving identifier.                                                  |
| `source_url`.       | Depends  | Required when `action_source` is `web`. Not required for `app_installed` or `app_opened`.       |
| `action_source`     | Depends  | Required and must be `mobile_app` for `app_installed` and `app_opened`. Otherwise optional.     |
| `user`              | No       | Optional user fields that can improve attribution accuracy for advertising conversions.         |
| `opt_out`           | No       | Set to `true` to opt out the event from future user-level personalization. Defaults to `false`. |
| `data`              | Yes      | Event data matching the event type.                                                             |

See [Supported events](/mirror/ads/supported-events) for event names and data shapes.

Unlike the pixel, the API does not capture `oppref` for you. Capture the value
yourself and pass it with the server event when it is available.

## Send user data

Add an optional `user` object to each event to improve conversion matching. The
object is event-scoped, so put it inside each entry in `events`, not at the
request root.

Every field in the `user` object is optional. Include only the fields you have
for the user.

### User object example

Place this object inside an event at `events[].user`:

```json
{
  "email_sha256": "b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514",
  "external_id_sha256": "73d83a078369bb4f0971b317aa7797a91cf5c0df1b62161c2e47d75c33ab5b6e",
  "country": "US",
  "city": "San Francisco",
  "zip_code": "94107",
  "ip_address": "203.0.113.1",
  "user_agent": "Mozilla/5.0"
}
```

| Field                | Description                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `email_sha256`       | SHA-256 hash of the email address after trimming whitespace and converting it to lowercase.        |
| `external_id_sha256` | SHA-256 hash of a stable, pseudonymous customer identifier from your system.                       |
| `country`            | Two-letter ISO 3166-1 country code, such as `US`.                                                  |
| `city`               | City name, with a maximum of 128 characters. OpenAI trims whitespace and converts it to lowercase. |
| `zip_code`           | Postal or ZIP code. Use letters, numbers, spaces, or hyphens, with a maximum of 32 characters.     |
| `ip_address`         | Valid IPv4 or IPv6 address.                                                                        |
| `user_agent`         | Non-empty user agent string from the client that generated the event.                              |

Send hashes as lowercase, 64-character hexadecimal strings. Send the geographic,
IP address, and user agent fields as raw values. Don't send raw email addresses,
raw external IDs, phone numbers, or phone number hashes.

## Example event

```bash
curl -X POST "https://bzr.openai.com/v1/events?pid=<PIXEL-ID>" \
  -H "Authorization: Bearer <API-KEY>" \
  -H "Content-Type: application/json" \
  --data '{
    "validate_only": false,
    "events": [
      {
        "id": "order_12345",
        "type": "order_created",
        "timestamp_ms": 1773892800000,
        "oppref": "oppref_abc",
        "source_url": "https://shop.example.com/checkout/confirmation",
        "action_source": "web",
        "user": {
          "email_sha256": "b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514",
          "external_id_sha256": "73d83a078369bb4f0971b317aa7797a91cf5c0df1b62161c2e47d75c33ab5b6e",
          "country": "US",
          "city": "San Francisco",
          "zip_code": "94107",
          "ip_address": "203.0.113.1",
          "user_agent": "Mozilla/5.0"
        },
        "data": {
          "type": "contents",
          "amount": 2599,
          "currency": "USD",
          "contents": [
            {
              "id": "sku_123",
              "name": "Starter bundle",
              "content_type": "product",
              "quantity": 1
            }
          ]
        }
      }
    ]
  }'
```

## App lifecycle events

App lifecycle events use the `customer_action` data shape and require
`action_source` to be `mobile_app`.

### App installed

```json
{
  "id": "app_installed_123",
  "type": "app_installed",
  "timestamp_ms": <TIMESTAMP_MS>,
  "action_source": "mobile_app",
  "data": {
    "type": "customer_action"
  }
}
```

### App opened

```json
{
  "id": "app_opened_123",
  "type": "app_opened",
  "timestamp_ms": <TIMESTAMP_MS>,
  "action_source": "mobile_app",
  "data": {
    "type": "customer_action"
  }
}
```

## Deduplicate browser and server events

If you send the same conversion from the pixel and the Conversions API, reuse
the same value as the API `id` and pixel `event_id`. Send both events with the
same Pixel ID. For custom events, use the same `custom_event_name` on both sides
as well.

:::
:::

