---
title: "Campaign 定向"
description: "Target campaigns by country, region, or DMA."
outline: deep
---

# Campaign 定向

**文档集**：广告<br>
**分组**：广告活动定向<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/ads/campaign-targeting](https://developers.openai.com/ads/campaign-targeting)
- Markdown 来源：[https://developers.openai.com/ads/campaign-targeting.md](https://developers.openai.com/ads/campaign-targeting.md)
- 抓取时间：2026-06-27T05:53:54.539Z
- Checksum：`61329cb9c470bab0a644cc30374c52d13ae4747d0a9d88f8f5ee3303431d02e9`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用 campaign targeting 控制广告可以投放到哪些位置。OpenAI Ads 支持 country、region 和 DMA targeting。查找你想要的位置，复制它们的 location ID，然后在创建或更新 campaign 时传入这些 ID。

如果你没有提供 location targeting，campaign 可以面向所有可用位置。

## 可用位置

当你想搜索当前可定向的位置时，请使用 geo lookup API。响应会返回位置的 `id`、display `name`、`canonical_name`、`country_code`、`type` 和 `region_code`。

```bash
curl -G "https://api.ads.openai.com/v1/geo_lookup/search" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  --data-urlencode "q=San Francisco" \
  --data-urlencode "limit=5"
```

```json
{
  "count": 1,
  "query": "San Francisco",
  "results": [
    {
      "id": "3000194",
      "type": "dma",
      "canonical_name": "San Francisco - Oakland - San Jose, United States",
      "country_code": "US",
      "name": "San Francisco - Oakland - San Jose",
      "region_code": "807"
    }
  ]
}
```

你也可以将当前位置 catalog 下载为 CSV：


  {"下载 OpenAI Ads locations"}


## 创建 campaign

使用 `targeting.locations.include` 创建 campaign。每一项只需要 location `id`；API 会使用匹配的位置详情扩展已保存的 campaign。

```bash
curl -X POST "https://api.ads.openai.com/v1/campaigns" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: campaign-targeting-example-1" \
  -d '{
    "name": "West Coast launch",
    "status": "paused",
    "budget": {
      "lifetime_spend_limit_micros": 25000000
    },
    "bidding_type": "clicks",
    "targeting": {
      "locations": {
        "include": [
          { "id": "2000043" },
          { "id": "3000194" },
          { "id": "3000001" }
        ]
      }
    }
  }'
```

在此示例中：

| Location ID | 含义 | 类型 |
| ----------- | ------- | ---- |
| `2000043`   | California, United States | `region` |
| `3000194`   | San Francisco - Oakland - San Jose, United States | `dma` |
| `3000001`   | New York, United States | `dma` |

验证 campaign 设置时，请使用 `status: "paused"`。当 campaign、ad groups 和 ads 准备好 serving 时，再将 campaign 切换为 `active`。

:::

## English source

::: details 展开英文原文
::: v-pre
Use campaign targeting to control where your ads can deliver. OpenAI Ads supports
country, region, and DMA targeting. Look up the locations you want, copy their
location IDs, then pass those IDs when you create or update a campaign.

If you do not provide location targeting, the campaign can target all available
locations.

## Available locations

Use the geo lookup API when you want to search for current targetable locations.
The response returns the location `id`, display `name`, `canonical_name`,
`country_code`, `type`, and `region_code`.

```bash
curl -G "https://api.ads.openai.com/v1/geo_lookup/search" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  --data-urlencode "q=San Francisco" \
  --data-urlencode "limit=5"
```

```json
{
  "count": 1,
  "query": "San Francisco",
  "results": [
    {
      "id": "3000194",
      "type": "dma",
      "canonical_name": "San Francisco - Oakland - San Jose, United States",
      "country_code": "US",
      "name": "San Francisco - Oakland - San Jose",
      "region_code": "807"
    }
  ]
}
```

You can also download the current location catalog as a CSV:


  {"Download OpenAI Ads locations"}


## Campaign creation

Create a campaign with `targeting.locations.include`. Each item only needs the
location `id`; the API expands the saved campaign with the matching location
details.

```bash
curl -X POST "https://api.ads.openai.com/v1/campaigns" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: campaign-targeting-example-1" \
  -d '{
    "name": "West Coast launch",
    "status": "paused",
    "budget": {
      "lifetime_spend_limit_micros": 25000000
    },
    "bidding_type": "clicks",
    "targeting": {
      "locations": {
        "include": [
          { "id": "2000043" },
          { "id": "3000194" },
          { "id": "3000001" }
        ]
      }
    }
  }'
```

In this example:

| Location ID | Meaning                                           | Type     |
| ----------- | ------------------------------------------------- | -------- |
| `2000043`   | California, United States                         | `region` |
| `3000194`   | San Francisco - Oakland - San Jose, United States | `dma`    |
| `3000001`   | New York, United States                           | `dma`    |

Use `status: "paused"` while you are validating campaign setup. Switch the
campaign to `active` when the campaign, ad groups, and ads are ready to serve.

:::
:::

