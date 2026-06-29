---
title: "商品 feed"
description: "Use a merchant catalog to create and measure product-feed ads."
outline: deep
---

# 商品 feed

**文档集**：Ads 广告<br>
**分组**：Ads — Product Feeds 商品 Feed<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/ads/product-feeds](https://developers.openai.com/ads/product-feeds)
- Markdown 来源：[https://developers.openai.com/ads/product-feeds.md](https://developers.openai.com/ads/product-feeds.md)
- 抓取时间：2026-06-27T05:53:55.206Z
- Checksum：`ab7818f62049222e1c5270b75c47ddd2d479fd6083b0a5368b3f71a153107e43`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Product feed（商品 feed）是商家的 catalog，用于让标题、描述、价格、可售性、图片和目标 URL 等商品详情保持最新。你无需为每个 item 创建单独广告，而是将 feed 连接到 campaign，并让 OpenAI 在广告投放时选择一个符合条件的商品。

## 了解 product-feed 工作流

Ads 层级中的每一部分都有不同角色：

| 部分                | 用途 |
| ------------------- | ------- |
| Product feed        | 提供商家的当前 catalog。 |
| Campaign            | 设置预算、排期、定向和 `product_feed` mode。 |
| Product set         | 选择一个已链接的 feed，并可选地过滤可投放的商品。 |
| Product-ad template | 定义所选商品中的值如何显示在广告中。 |

例如，product set 可以把鞋类 catalog 限定到一个品牌。随后 product-ad template 可以从所选的任意符合条件的鞋款中填充标题、描述和价格。

## 开始之前

你需要：

- 一个有资格创建广告的 ad account。
- 一个链接到该 ad account 的 product feed。
- Ads Manager 中显示的 feed ID。
- 从该 ad account 的 **Settings** 标签页签发的 Ads API key。

本指南中的所有 API 请求都使用 public Advertiser API 和[标准 bearer-token authentication](/mirror/ads/api-reference/authentication)。

## 在 Ads Manager 中设置 feed

对于 product-feed Ads campaigns，请在 [Ads Manager](https://ads.openai.com) 的 **Feeds** 区域创建 feed connection 并配置其凭据。将商家 catalog 上传到那里显示的 SFTP 位置。

Public Advertiser API 不提供用于创建 feed connection、列出已链接 feed 或上传 catalog file 的 endpoint。此 Ads catalog transfer 使用 SFTP；`POST /upload` 只用于静态广告创意资产。

随着商品、价格和 availability 变化，请保持 catalog 最新。对用于广告的商品，将规范 `is_ads_eligible` 字段设为 `true`。也接受旧版 alias `is_eligible_ads`。Ads eligibility 是必要条件，但并不保证某个商品会被投放。

## 创建 product-feed campaign

创建 campaign，并将 `mode` 设为 `product_feed`。创建后无法更改 mode。

```bash
curl -X POST "https://api.ads.openai.com/v1/campaigns" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Running shoes catalog",
    "status": "active",
    "mode": "product_feed",
    "budget": {
      "lifetime_spend_limit_micros": 25000000
    }
  }'
```

响应会包含 campaign ID 和 `"mode": "product_feed"`。保存 campaign ID，供下一次请求使用。

关于 scheduling、targeting、budget、update 和 state-control fields，请参阅 [campaigns reference](/mirror/ads/api-reference/campaigns)。

## 在 ad group 中选择商品

创建带有 `product_set` 的 ad group。其 `product_feed_id` 必须标识与你的 API key 属于同一个 ad account 的 feed。

使用 `filters` 缩小可 serving 的商品范围。省略 `filters` 则使用 feed 中的所有 eligible products。

```bash
curl -X POST "https://api.ads.openai.com/v1/ad_groups" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "cmpn_101",
    "name": "Example Brand running shoes",
    "status": "active",
    "bidding_config": {
      "billing_event_type": "impression",
      "max_bid_micros": 60000
    },
    "product_set": {
      "product_feed_id": "product_feed_123",
      "filters": [
        {
          "field": "brand",
          "operator": "in",
          "values": ["Example Brand"]
        }
      ]
    }
  }'
```

响应会包含 ad group ID 和解析后的 `product_set`。保存 ad group ID，供广告请求使用。

每个 filter object 都必须包含 `field`、`operator` 和 `values`。支持的 operators 为 `in`、`gt`、`gte`、`lt` 和 `lte`。请将 filter values 作为字符串发送，包括诸如 `"4.5"` 这样的数值。不要在一个 product set 中重复同一个字段。

所有字段和 update operations 请参阅 [ad groups reference](/mirror/ads/api-reference/ad-groups)。

## 创建 product-ad template

在 ad group 中创建一个 `product_ad_template` creative。OpenAI 会在 serving 时用所选商品的数据替换 template tokens。

```bash
curl -X POST "https://api.ads.openai.com/v1/ads" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ad_group_id": "adgrp_301",
    "name": "Running shoe product template",
    "status": "active",
    "creative": {
      "type": "product_ad_template",
      "title": "{{product.title}}",
      "body": "{{product.body}}",
      "price": "{{product.price}}"
    }
  }'
```

响应会包含 ad ID、`creative.type: "product_ad_template"` 和 `review_status`。一个 product-feed ad group 最多只能包含一个未归档的 product-ad template。

与 `chat_card` creative 不同，product-ad template 不需要 `file_id` 或 `target_url`；所选 feed item 会提供其图片和目标 URL。完整 creative contract 和 review states 请参阅 [ads reference](/mirror/ads/api-reference/ads)。

## 查询商品表现

从任意 public insights endpoint 请求 `product` segment，以按 feed item 拆分结果。此示例返回 ad account 的每日 product impressions 和 clicks。Product-segmented insights 可用于 product-feed campaigns：

```bash
curl -sS -G "https://api.ads.openai.com/v1/ad_account/insights" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  --data-urlencode "time_granularity=daily" \
  --data-urlencode "aggregation_level=ad_account" \
  --data-urlencode "segments[]=product" \
  --data-urlencode "fields[]=product.feed_id" \
  --data-urlencode "fields[]=product.item_id" \
  --data-urlencode "fields[]=product.title" \
  --data-urlencode "fields[]=product.impressions" \
  --data-urlencode "fields[]=product.clicks"
```

响应会为每个 product 和 time bucket 包含一行。关于 [filters](/mirror/ads/api-reference/insights#filters)、[segments](/mirror/ads/api-reference/insights#segments)、[includes](/mirror/ads/api-reference/insights#includes) 和完整 [examples](/mirror/ads/api-reference/insights#examples)，请参阅 insights reference。

## Product-feed API 端点

Product-feed campaigns 使用与其他 Ads campaigns 相同的 public resources。所有 route 都使用 `https://api.ads.openai.com/v1` base URL 和你的 Ads API key。

| 资源           | 公开端点 | Product-feed 用途 |
| -------------- | ---------------- | ---------------- |
| Campaigns      | `POST /campaigns`、`GET /campaigns`、`GET /campaigns/{campaign_id}`、`POST /campaigns/{campaign_id}` | 创建和管理 `mode` 为 `product_feed` 的 campaign。 |
| Campaign state | `POST /campaigns/{campaign_id}/activate`、`POST /campaigns/{campaign_id}/pause`、`POST /campaigns/{campaign_id}/archive` | 控制 product-feed campaign 是否可以投放。 |
| Ad groups      | `POST /ad_groups`、`GET /ad_groups?campaign_id={campaign_id}`、`GET /ad_groups/{ad_group_id}`、`POST /ad_groups/{ad_group_id}` | 在 `product_set` 中创建和管理 feed 选择与 product filters。 |
| Ad-group state | `POST /ad_groups/{ad_group_id}/activate`、`POST /ad_groups/{ad_group_id}/pause`、`POST /ad_groups/{ad_group_id}/archive` | 控制 product set 是否可以投放。 |
| Ads            | `POST /ads`、`GET /ads?ad_group_id={ad_group_id}`、`GET /ads/{ad_id}`、`POST /ads/{ad_id}` | 创建和管理 `product_ad_template`。 |
| Ad state       | `POST /ads/{ad_id}/activate`、`POST /ads/{ad_id}/pause`、`POST /ads/{ad_id}/archive` | 控制 template 是否可以投放。 |
| Insights       | `GET /ad_account/insights`、`GET /campaigns/{campaign_id}/insights`、`GET /ad_groups/{ad_group_id}/insights`、`GET /ads/{ad_id}/insights` | 查询按 product 细分的投放和效果数据。 |

Ads Manager feed-connection APIs 以及 OpenAI 内部 feed-processing 和 debugging APIs 不属于 public Advertiser API。

## 了解投放资格

上传 feed 不会自动为每个商品投放广告。商品必须被标记为 Ads-eligible、保持 available、包含可用 product data，并通过 feed processing 和 review。已链接的 campaign、ad group 和 ad 也必须处于 active、有资金且在其他方面具备投放资格。

Ads 系统随后会选择符合条件的商品、评估生成的广告，并让它们进入常规 auction。使用按 product 细分的 insights 验证哪些商品获得了 impressions 和 clicks。

:::

## English source

::: details 展开英文原文
::: v-pre
A product feed is a merchant catalog that keeps product details such as titles,
descriptions, prices, availability, images, and destination URLs up to date.
Instead of creating a separate ad for every item, you connect the feed to a
campaign and let OpenAI select an eligible product when the ad serves.

## Understand the product-feed workflow

Each part of the Ads hierarchy has a different role:

| Part                | Purpose                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| Product feed        | Supplies the merchant's current catalog.                                    |
| Campaign            | Sets the budget, schedule, targeting, and `product_feed` mode.              |
| Product set         | Selects one linked feed and optionally filters the products that can serve. |
| Product-ad template | Defines how values from the selected product appear in the ad.              |

For example, a product set can limit a shoe catalog to one brand. The product-ad
template can then fill its title, description, and price from whichever eligible
shoe is selected.

## Before you begin

You need:

- An ad account eligible to create ads.
- A product feed linked to that ad account.
- The feed ID shown in Ads Manager.
- An Ads API key issued from the ad account's **Settings** tab.

All API requests in this guide use the public Advertiser API and the
[standard bearer-token authentication](/mirror/ads/api-reference/authentication).

## Set up the feed in Ads Manager

For product-feed Ads campaigns, use the **Feeds** area in [Ads Manager](https://ads.openai.com) to create the feed connection and configure
its credentials. Upload the merchant catalog to the SFTP location shown there.

The public Advertiser API does not provide endpoints to create a feed
  connection, list linked feeds, or upload a catalog file. This Ads catalog
  transfer uses SFTP; `POST /upload` is only for static ad creative assets.

Keep the catalog current as products, prices, and availability change. Set the
canonical `is_ads_eligible` field to `true` for products intended for
advertising. The legacy `is_eligible_ads` alias is also accepted. Ads
eligibility is necessary, but it does not guarantee that a product will serve.

## Create a product-feed campaign

Create a campaign with `mode` set to `product_feed`. You cannot change the mode
after creation.

```bash
curl -X POST "https://api.ads.openai.com/v1/campaigns" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Running shoes catalog",
    "status": "active",
    "mode": "product_feed",
    "budget": {
      "lifetime_spend_limit_micros": 25000000
    }
  }'
```

The response includes the campaign ID and `"mode": "product_feed"`. Save the
campaign ID for the next request.

See the [campaigns reference](/mirror/ads/api-reference/campaigns) for scheduling,
targeting, budget, update, and state-control fields.

## Select products in an ad group

Create an ad group with a `product_set`. Its `product_feed_id` must identify a
feed linked to the same ad account as your API key.

Use `filters` to narrow which products can serve. Omit `filters` to use all
eligible products in the feed.

```bash
curl -X POST "https://api.ads.openai.com/v1/ad_groups" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "cmpn_101",
    "name": "Example Brand running shoes",
    "status": "active",
    "bidding_config": {
      "billing_event_type": "impression",
      "max_bid_micros": 60000
    },
    "product_set": {
      "product_feed_id": "product_feed_123",
      "filters": [
        {
          "field": "brand",
          "operator": "in",
          "values": ["Example Brand"]
        }
      ]
    }
  }'
```

The response includes the ad group ID and the resolved `product_set`. Save the
ad group ID for the ad request.

Each filter object must contain `field`, `operator`, and `values`. Supported
operators are `in`, `gt`, `gte`, `lt`, and `lte`. Send filter values as strings,
including numeric values such as `"4.5"`. Don't repeat the same field within one
product set.

See the [ad groups reference](/mirror/ads/api-reference/ad-groups) for all fields and
update operations.

## Create the product-ad template

Create one `product_ad_template` creative in the ad group. OpenAI replaces the
template tokens with data from the product selected at serving time.

```bash
curl -X POST "https://api.ads.openai.com/v1/ads" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ad_group_id": "adgrp_301",
    "name": "Running shoe product template",
    "status": "active",
    "creative": {
      "type": "product_ad_template",
      "title": "{{product.title}}",
      "body": "{{product.body}}",
      "price": "{{product.price}}"
    }
  }'
```

The response includes the ad ID, `creative.type: "product_ad_template"`, and a
`review_status`. A product-feed ad group can contain at most one non-archived
product-ad template.

Unlike a `chat_card` creative, the product-ad template does not require
`file_id` or `target_url`; the selected feed item supplies its image and
destination URL. See the [ads reference](/mirror/ads/api-reference/ads) for the full
creative contract and review states.

## Query product performance

Request the `product` segment from any public insights endpoint to break down
results by feed item. This example returns daily product impressions and clicks
for the ad account. Product-segmented insights are available for product-feed campaigns:

```bash
curl -sS -G "https://api.ads.openai.com/v1/ad_account/insights" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  --data-urlencode "time_granularity=daily" \
  --data-urlencode "aggregation_level=ad_account" \
  --data-urlencode "segments[]=product" \
  --data-urlencode "fields[]=product.feed_id" \
  --data-urlencode "fields[]=product.item_id" \
  --data-urlencode "fields[]=product.title" \
  --data-urlencode "fields[]=product.impressions" \
  --data-urlencode "fields[]=product.clicks"
```

The response contains one row per product and time bucket. See the insights
reference for [filters](/mirror/ads/api-reference/insights#filters),
[segments](/mirror/ads/api-reference/insights#segments),
[includes](/mirror/ads/api-reference/insights#includes), and complete
[examples](/mirror/ads/api-reference/insights#examples).

## Product-feed API endpoints

Product-feed campaigns use the same public resources as other Ads campaigns.
All routes use the `https://api.ads.openai.com/v1` base URL and your Ads API
key.

| Resource       | Public endpoints                                                                                                                          | Product-feed use                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Campaigns      | `POST /campaigns`, `GET /campaigns`, `GET /campaigns/{campaign_id}`, `POST /campaigns/{campaign_id}`                                      | Create and manage a campaign whose `mode` is `product_feed`.               |
| Campaign state | `POST /campaigns/{campaign_id}/activate`, `POST /campaigns/{campaign_id}/pause`, `POST /campaigns/{campaign_id}/archive`                  | Control whether the product-feed campaign can deliver.                     |
| Ad groups      | `POST /ad_groups`, `GET /ad_groups?campaign_id={campaign_id}`, `GET /ad_groups/{ad_group_id}`, `POST /ad_groups/{ad_group_id}`            | Create and manage the feed selection and product filters in `product_set`. |
| Ad-group state | `POST /ad_groups/{ad_group_id}/activate`, `POST /ad_groups/{ad_group_id}/pause`, `POST /ad_groups/{ad_group_id}/archive`                  | Control whether the product set can deliver.                               |
| Ads            | `POST /ads`, `GET /ads?ad_group_id={ad_group_id}`, `GET /ads/{ad_id}`, `POST /ads/{ad_id}`                                                | Create and manage the `product_ad_template`.                               |
| Ad state       | `POST /ads/{ad_id}/activate`, `POST /ads/{ad_id}/pause`, `POST /ads/{ad_id}/archive`                                                      | Control whether the template can deliver.                                  |
| Insights       | `GET /ad_account/insights`, `GET /campaigns/{campaign_id}/insights`, `GET /ad_groups/{ad_group_id}/insights`, `GET /ads/{ad_id}/insights` | Query product-segmented delivery and performance.                          |

The Ads Manager feed-connection APIs and OpenAI's internal feed-processing and
debugging APIs are not part of the public Advertiser API.

## Understand serving eligibility

Uploading a feed does not automatically advertise every product. A product must
be marked Ads-eligible, remain available, contain usable product data, and pass
feed processing and review. The linked campaign, ad group, and ad must also be
active, funded, and otherwise eligible to serve.

The Ads system then selects eligible products, evaluates the resulting ads, and
runs them through the normal auction. Use product-segmented insights to verify
which products received impressions and clicks.

:::
:::

