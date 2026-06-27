---
status: needs-review
sourceId: "54a552213629"
sourceChecksum: "54a552213629c5790d5b5a8e146b817341d5caf90d844a46b48be5752cd72477"
sourceUrl: "https://developers.openai.com/ads/api-reference/campaigns"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# Campaigns

## 列出 campaign

列出当前 ad account 中的 campaign。

`GET /campaigns`

| Parameter | Type    | Required | Notes |
| --------- | ------- | -------- | ----- |
| `limit`   | integer | No       | 介于 `1` 和 `500` 之间。默认值为 20。 |
| `after`   | string  | No       | 下一页的 cursor。 |
| `before`  | string  | No       | 上一页的 cursor。 |
| `order`   | string  | No       | `asc` 或 `desc`。 |

```bash
curl -X GET "https://api.ads.openai.com/v1/campaigns?limit=20&order=desc" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "cmpn_101",
      "created_at": 1735689600,
      "updated_at": 1735776000,
      "name": "Spring launch",
      "description": "Promote the new productivity bundle.",
      "status": "active",
      "start_time": 1735689600,
      "end_time": 1738368000,
      "budget": {
        "lifetime_spend_limit_micros": 25000000
      }
    }
  ],
  "first_id": "cmpn_101",
  "last_id": "cmpn_101",
  "has_more": false
}
```

## 创建 campaign

为当前 ad account 创建 campaign。属于某个 campaign 的 Ads 只会在定义的开始和结束时间之间展示，并且只会在 campaign targeting 中指定的位置展示。

关于 region 和 DMA targeting，请参阅 [Campaign Targeting](https://developers.openai.com/ads/campaign-targeting)。

### 默认值

如果省略 `start_time`，campaign 会立即开始投放。如果省略 location targeting，campaign 可以面向所有可用位置。

请注意，时间和货币字段会遵循你的账户设置的 timezone 和 currency 默认值。

`POST /campaigns`

| Field                                | Type     | Required | Notes |
| ------------------------------------ | -------- | -------- | ----- |
| `name`                               | string   | Yes      | `3` 到 `1000` 个字符，并且必须包含一个非空格字符。 |
| `description`                        | string   | No       | Campaign 描述。 |
| `start_time`                         | integer  | No       | 介于 `946684800` 和 `4102444800` 之间的 Unix timestamp。 |
| `end_time`                           | integer  | No       | 介于 `946684800` 和 `4102444800` 之间的 Unix timestamp。 |
| `status`                             | string   | Yes      | `active` 或 `paused`。 |
| `budget.lifetime_spend_limit_micros` | integer  | Yes      | 最小值为 `1000000`。 |
| `mode`                               | string   | No       | 设置为 `product_feed` 可创建 [product-feed campaign](https://developers.openai.com/ads/product-feeds)。 |
| `targeting.locations.include`        | object[] | No       | 包含的位置 ID。 |

```bash
curl -X POST "https://api.ads.openai.com/v1/campaigns" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spring launch",
    "description": "Promote the new productivity bundle.",
    "start_time": 1735689600,
    "end_time": 1738368000,
    "status": "active",
    "budget": {
      "lifetime_spend_limit_micros": 25000000
    },
    "targeting": {
      "locations": {
        "include": [{ "id": "2000043" }, { "id": "3000194" }]
      }
    }
  }'
```

```json
{
  "id": "cmpn_101",
  "created_at": 1735689600,
  "updated_at": 1735689600,
  "name": "Spring launch",
  "description": "Promote the new productivity bundle.",
  "status": "active",
  "start_time": 1735689600,
  "end_time": 1738368000,
  "budget": {
    "lifetime_spend_limit_micros": 25000000
  },
  "targeting": {
    "locations": {
      "include": [
        {
          "id": "2000043",
          "type": "region",
          "country_code": "US",
          "name": "California",
          "region_code": "US-CA"
        },
        {
          "id": "3000194",
          "type": "dma",
          "country_code": "US",
          "name": "San Francisco - Oakland - San Jose",
          "region_code": "807"
        }
      ]
    }
  }
}
```

## 检索 campaign

按 ID 获取一个 campaign。

`GET /campaigns/{campaign_id}`

```bash
curl -X GET "https://api.ads.openai.com/v1/campaigns/cmpn_101" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

## 更新 campaign

使用 `POST` 而不是 `PATCH` 或 `PUT` 更新 campaign。

`POST /campaigns/{campaign_id}`

更新时所有字段都是可选的。如果包含 `budget`，请发送完整 budget 对象。`description`、`start_time`、`end_time` 和 `targeting` 可以设置为 `null` 以清除它们。`status` 接受 `active`、`paused` 或 `archived`。创建 campaign 后不能更改 `mode`。

```bash
curl -X POST "https://api.ads.openai.com/v1/campaigns/cmpn_101" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated launch window and budget.",
    "status": "paused",
    "budget": {
      "lifetime_spend_limit_micros": 30000000
    }
  }'
```

## 使用专用操作更改状态

Ads API 还公开了显式状态转换。每个 endpoint 都会返回更新后的 campaign 对象。Paused campaigns 不会向客户投放广告。只归档不再需要的对象，因为归档不可逆。

- `POST /campaigns/{campaign_id}/activate`
- `POST /campaigns/{campaign_id}/pause`
- `POST /campaigns/{campaign_id}/archive`

```bash
curl -X POST "https://api.ads.openai.com/v1/campaigns/cmpn_101/pause" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

```json
{
  "id": "cmpn_101",
  "created_at": 1735689600,
  "updated_at": 1735862400,
  "name": "Spring launch",
  "description": "Promote the new productivity bundle.",
  "status": "paused",
  "start_time": 1735689600,
  "end_time": 1738368000,
  "budget": {
    "lifetime_spend_limit_micros": 25000000
  }
}
```
