---
title: "Ad Groups（广告组）"
description: "Create, list, retrieve, update, and change ad group state."
outline: deep
---

# Ad Groups（广告组）

**文档集**：Ads  
**分组**：Ads — Api Reference  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/ads/api-reference/ad-groups](https://developers.openai.com/ads/api-reference/ad-groups)
- Markdown 来源：[https://developers.openai.com/ads/api-reference/ad-groups.md](https://developers.openai.com/ads/api-reference/ad-groups.md)
- 抓取时间：2026-06-27T05:53:53.940Z
- Checksum：`5771fc38748d6c8b719756e0890faec725da8d5dd1cb804054dc7ec22064e550`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 列出 ad group

列出某个 campaign 的 ad group。

`GET /ad_groups`

| 参数          | 类型    | 是否必填 | 说明 |
| ------------- | ------- | -------- | ----- |
| `campaign_id` | string  | 是 | 父级 campaign ID。 |
| `limit`       | integer | 否 | 介于 `1` 和 `500` 之间。默认值为 20。 |
| `after`       | string  | 否 | 下一页的 cursor。 |
| `before`      | string  | 否 | 上一页的 cursor。 |
| `order`       | string  | 否 | `asc` 或 `desc`。 |

```bash
curl -X GET "https://api.ads.openai.com/v1/ad_groups?campaign_id=cmpn_101&limit=10" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "adgrp_301",
      "created_at": 1735689700,
      "updated_at": 1735776100,
      "name": "US English",
      "description": "Primary English-speaking audience.",
      "context_hints": ["productivity", "team collaboration"],
      "status": "active",
      "bidding_config": {
        "billing_event_type": "impression",
        "max_bid_micros": 60000
      }
    }
  ],
  "first_id": "adgrp_301",
  "last_id": "adgrp_301",
  "has_more": false
}
```

## 创建 ad group

为 campaign 创建 ad group。

`POST /ad_groups`

| 字段                                | 类型     | 是否必填                   | 说明 |
| ----------------------------------- | -------- | -------------------------- | ----- |
| `campaign_id`                       | string   | 是 | 父级 campaign ID。 |
| `name`                              | string   | 是 | `3` 到 `1000` 个字符，并且必须包含一个非空格字符。 |
| `description`                       | string   | 否 | Ad group 描述。 |
| `context_hints`                     | string[] | 否 | 自由格式的受众或展示位置提示。 |
| `status`                            | string   | 是 | `active` 或 `paused`。 |
| `bidding_config.billing_event_type` | string   | 是 | 当前为 `impression`。 |
| `bidding_config.max_bid_micros`     | integer  | 是 | 介于 `1` 和 `100000000` 之间。 |
| `product_set`                       | object   | product-feed campaign 适用 | 选择已链接的 feed 和可选 product filters。参阅 [Product feeds](/mirror/ads/product-feeds)。 |
| `product_set.product_feed_id`       | string   | product-feed campaign 适用 | 链接到当前 ad account 的 Feed ID。 |
| `product_set.filters`               | object[] | 否 | Product filters。不要在一个 product set 中重复同一个字段。 |
| `product_set.filters[].field`       | string   | Yes, in each filter        | 要过滤的 feed attribute。 |
| `product_set.filters[].operator`    | string   | Yes, in each filter        | `in`、`gt`、`gte`、`lt` 或 `lte`。 |
| `product_set.filters[].values`      | string[] | Yes, in each filter        | 匹配值。将数值比较值作为字符串发送，例如 `"4.5"`。 |

### 字段说明

Product-set filters 支持 `title`、`body`、`item_id`、`offer_id`、`price`、
`target_url`、`image_url`、`product_category`、`brand`、`seller_name`、
`external_seller_id`、`star_rating`、`condition` 和 `age_group`。仅可将 `gt`、
`gte`、`lt` 和 `lte` 与 `price` 或 `star_rating` 一起使用。

Context hints 提供关于你认为广告何时可能有用的额外信息，并帮助指导广告出现的时机。请提供一组描述或关键词，用来说明何时适合展示该产品或服务。

Micros 是主货币单位（例如 Dollar）的百万分之一。`max_bid` 字段按每个 event 计价，因此 $60CPM（每次 impression $0.06）会作为 60,000 传给 API。请注意，货币字段会遵循你的 ad account 默认货币。

```bash
curl -X POST "https://api.ads.openai.com/v1/ad_groups" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "cmpn_101",
    "name": "US English",
    "description": "Primary English-speaking audience.",
    "context_hints": ["productivity", "team collaboration"],
    "status": "active",
    "bidding_config": {
      "billing_event_type": "impression",
      "max_bid_micros": 60000
    }
  }'
```

## 检索 ad group

按 ID 获取一个 ad group。

`GET /ad_groups/{ad_group_id}`

```bash
curl -X GET "https://api.ads.openai.com/v1/ad_groups/adgrp_301" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

## 更新 ad group

使用 `POST` 更新 ad group。

`POST /ad_groups/{ad_group_id}`

更新时所有字段都是可选的。`description` 可以设置为 `null` 以清除它。如果包含 `bidding_config`，请发送完整对象。`status` 接受 `active`、`paused` 或 `archived`。对于 product-feed campaign，请包含完整的 `product_set` 对象，以更改 feed 或其 filters。如果需要更新后的 `product_set`，请在更新后检索 ad group；即时更新响应可能会省略它。

```bash
curl -X POST "https://api.ads.openai.com/v1/ad_groups/adgrp_301" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "context_hints": ["productivity", "workflow automation"],
    "status": "paused",
    "bidding_config": {
      "billing_event_type": "impression",
      "max_bid_micros": 75000
    }
  }'
```

## 使用专用操作更改状态

Ads API 还公开了显式状态转换。Paused ad groups 不会向客户投放广告。只归档不再需要的对象，因为归档不可逆。

- `POST /ad_groups/{ad_group_id}/activate`
- `POST /ad_groups/{ad_group_id}/pause`
- `POST /ad_groups/{ad_group_id}/archive`

```bash
curl -X POST "https://api.ads.openai.com/v1/ad_groups/adgrp_301/archive" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

```json
{
  "id": "adgrp_301",
  "created_at": 1735689700,
  "updated_at": 1735948800,
  "name": "US English",
  "description": "Primary English-speaking audience.",
  "context_hints": ["productivity", "team collaboration"],
  "status": "archived",
  "bidding_config": {
    "billing_event_type": "impression",
    "max_bid_micros": 60000
  }
}
```

:::

## English source

::: details 展开英文原文
::: v-pre
## List ad groups

List ad groups for a campaign.

`GET /ad_groups`

| Parameter     | Type    | Required | Notes                              |
| ------------- | ------- | -------- | ---------------------------------- |
| `campaign_id` | string  | Yes      | Parent campaign ID.                |
| `limit`       | integer | No       | Between `1` and `500`. Default 20. |
| `after`       | string  | No       | Cursor for the next page.          |
| `before`      | string  | No       | Cursor for the previous page.      |
| `order`       | string  | No       | `asc` or `desc`.                   |

```bash
curl -X GET "https://api.ads.openai.com/v1/ad_groups?campaign_id=cmpn_101&limit=10" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "adgrp_301",
      "created_at": 1735689700,
      "updated_at": 1735776100,
      "name": "US English",
      "description": "Primary English-speaking audience.",
      "context_hints": ["productivity", "team collaboration"],
      "status": "active",
      "bidding_config": {
        "billing_event_type": "impression",
        "max_bid_micros": 60000
      }
    }
  ],
  "first_id": "adgrp_301",
  "last_id": "adgrp_301",
  "has_more": false
}
```

## Create an ad group

Create an ad group for a campaign.

`POST /ad_groups`

| Field                               | Type     | Required                   | Notes                                                                                        |
| ----------------------------------- | -------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| `campaign_id`                       | string   | Yes                        | Parent campaign ID.                                                                          |
| `name`                              | string   | Yes                        | `3` to `1000` chars and must include a non-space character.                                  |
| `description`                       | string   | No                         | Ad group description.                                                                        |
| `context_hints`                     | string[] | No                         | Free-form audience or placement hints.                                                       |
| `status`                            | string   | Yes                        | `active` or `paused`.                                                                        |
| `bidding_config.billing_event_type` | string   | Yes                        | Currently `impression`.                                                                      |
| `bidding_config.max_bid_micros`     | integer  | Yes                        | Between `1` and `100000000`.                                                                 |
| `product_set`                       | object   | For product-feed campaigns | Selects a linked feed and optional product filters. See [Product feeds](/mirror/ads/product-feeds). |
| `product_set.product_feed_id`       | string   | For product-feed campaigns | Feed ID linked to the current ad account.                                                    |
| `product_set.filters`               | object[] | No                         | Product filters. Don't repeat the same field within one product set.                         |
| `product_set.filters[].field`       | string   | Yes, in each filter        | Feed attribute to filter.                                                                    |
| `product_set.filters[].operator`    | string   | Yes, in each filter        | `in`, `gt`, `gte`, `lt`, or `lte`.                                                           |
| `product_set.filters[].values`      | string[] | Yes, in each filter        | Match values. Send numeric comparison values as strings, such as `"4.5"`.                    |

### Field notes

Product-set filters support `title`, `body`, `item_id`, `offer_id`, `price`,
`target_url`, `image_url`, `product_category`, `brand`, `seller_name`,
`external_seller_id`, `star_rating`, `condition`, and `age_group`. Use `gt`,
`gte`, `lt`, and `lte` only with `price` or `star_rating`.

Context hints provide extra information on when you think your ads might be useful, and help guide when they appear. Provide a list of descriptions or keywords for when the product or service might be useful to show.

Micros are millionths of the main currency unit (e.g., Dollars). The max_bid field is per event, so a $60CPM ($0.06 per impression) is passed as 60,000 to the API. Note that currency fields respect your ad account's default currency.

```bash
curl -X POST "https://api.ads.openai.com/v1/ad_groups" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "cmpn_101",
    "name": "US English",
    "description": "Primary English-speaking audience.",
    "context_hints": ["productivity", "team collaboration"],
    "status": "active",
    "bidding_config": {
      "billing_event_type": "impression",
      "max_bid_micros": 60000
    }
  }'
```

## Retrieve an ad group

Fetch one ad group by ID.

`GET /ad_groups/{ad_group_id}`

```bash
curl -X GET "https://api.ads.openai.com/v1/ad_groups/adgrp_301" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

## Update an ad group

Update an ad group with `POST`.

`POST /ad_groups/{ad_group_id}`

All fields are optional on update. `description` can be set to `null` to clear
it. If you include `bidding_config`, send the full object. `status` accepts
`active`, `paused`, or `archived`. For a product-feed campaign, include the full
`product_set` object to change the feed or its filters. Retrieve the ad group
after the update if you need the resulting `product_set`; the immediate update
response can omit it.

```bash
curl -X POST "https://api.ads.openai.com/v1/ad_groups/adgrp_301" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "context_hints": ["productivity", "workflow automation"],
    "status": "paused",
    "bidding_config": {
      "billing_event_type": "impression",
      "max_bid_micros": 75000
    }
  }'
```

## Change state with dedicated actions

The Ads API also exposes explicit state transitions. Paused ad groups won't deliver ads to customers. Only archive objects you have no further use for, as archiving isn't reversible.

- `POST /ad_groups/{ad_group_id}/activate`
- `POST /ad_groups/{ad_group_id}/pause`
- `POST /ad_groups/{ad_group_id}/archive`

```bash
curl -X POST "https://api.ads.openai.com/v1/ad_groups/adgrp_301/archive" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

```json
{
  "id": "adgrp_301",
  "created_at": 1735689700,
  "updated_at": 1735948800,
  "name": "US English",
  "description": "Primary English-speaking audience.",
  "context_hints": ["productivity", "team collaboration"],
  "status": "archived",
  "bidding_config": {
    "billing_event_type": "impression",
    "max_bid_micros": 60000
  }
}
```

:::
:::

