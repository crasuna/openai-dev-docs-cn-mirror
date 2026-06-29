---
status: needs-review
sourceId: "e6a4972c637e"
sourceChecksum: "e6a4972c637e67a3685258850889ffa5734181b33dce3eee1e5758b9bbb17aa7"
sourceUrl: "https://developers.openai.com/ads/conversions-api"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# Conversions API（转化 API）

Conversions API 是比单独使用 Pixel 更可靠的 tracking 来源。为了获得更准确的 insights，我们鼓励尽可能使用 Conversions API。

## 发送事件

只能从你的服务器向 Conversions API 发送事件。

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
| 值 | 是否必填 | 说明 |
| --------------- | -------- | ------------------------------------------------- |
| `pid` | 是 | 你的 Pixel ID。 |
| `validate_only` | 否 | 当为 `true` 时，校验 events 但不保存它们。 |
| `events` | 是 | 要发送的 events。 |

API 接受最多 1,000 个 events 的批次。如果批次中的一个 event 失败，整个批次都会失败。

对于 app lifecycle events，请使用现有 web data source 的 Pixel ID。从你的服务器发送 `app_installed` 和 `app_opened`，并将 `action_source` 设为 `mobile_app`。当前不支持 native mobile SDK 设置和 mobile data sources。

## 事件结构

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

| 字段                | 是否必填 | 说明 |
| ------------------- | -------- | ----------- |
| `id`                | 是 | 你的唯一 event 标识符。与 `type` 一起用于对 events 去重。 |
| `type`              | 是 | 受支持的标准 event name，或 `custom`。 |
| `timestamp_ms`      | 是 | event 时间，单位为毫秒。必须在过去 7 天内，且不能超前超过 10 分钟。 |
| `custom_event_name` | 视情况而定 | 当 `type` 为 `custom` 时必填。 |
| `oppref`            | 否 | OpenAI 提供的隐私保护标识符。 |
| `source_url`.       | 视情况而定 | 当 `action_source` 为 `web` 时必填。对 `app_installed` 或 `app_opened` 不要求。 |
| `action_source`     | 视情况而定 | 对 `app_installed` 和 `app_opened` 必填且必须为 `mobile_app`。其他情况下可选。 |
| `user`              | 否 | 可选 user fields，可提高广告 conversions 的归因准确性。 |
| `opt_out`           | 否 | 设为 `true` 可让该 event 退出未来的用户级个性化。默认值为 `false`。 |
| `data`              | 是 | 与 event type 匹配的 event data。 |

event names 和 data shapes 请参阅 [Supported events](https://developers.openai.com/ads/supported-events)。

与 pixel 不同，API 不会替你捕获 `oppref`。请自行捕获该值，并在可用时随 server event 一起传入。

## 发送用户数据

向每个 event 添加可选的 `user` 对象，以改进 conversion matching。该对象是 event-scoped，因此请把它放在 `events` 中每个条目内部，而不是请求根级别。

`user` 对象中的每个字段都是可选的。只包含你拥有的用户字段。

### User 对象示例

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

| 字段                 | 说明 |
| -------------------- | ----------- |
| `email_sha256`       | 对 email address 去除首尾空白并转换为小写后得到的 SHA-256 hash。 |
| `external_id_sha256` | 来自你系统的稳定、假名化 customer identifier 的 SHA-256 hash。 |
| `country`            | 两字母 ISO 3166-1 国家/地区代码，例如 `US`。 |
| `city`               | 城市名称，最多 128 个字符。OpenAI 会去除首尾空白并转换为小写。 |
| `zip_code`           | Postal 或 ZIP code。可使用字母、数字、空格或连字符，最多 32 个字符。 |
| `ip_address`         | 有效的 IPv4 或 IPv6 地址。 |
| `user_agent`         | 生成该 event 的客户端中的非空 user agent 字符串。 |

请以小写的 64 字符十六进制字符串发送 hashes。请以原始值发送 geographic、IP address 和 user agent 字段。不要发送原始 email addresses、原始 external IDs、电话号码或电话号码 hashes。

## 事件示例

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

## App lifecycle events（应用生命周期事件）

App lifecycle events 使用 `customer_action` data shape，并要求 `action_source` 为 `mobile_app`。

### App installed（应用已安装）

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

### App opened（应用已打开）

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

## 对浏览器和服务器事件去重

如果你同时通过 pixel 和 Conversions API 发送同一个 conversion，请复用同一个值作为 API `id` 和 pixel `event_id`。使用相同 Pixel ID 发送两个 events。对于 custom events，也请在两端使用相同的 `custom_event_name`。
