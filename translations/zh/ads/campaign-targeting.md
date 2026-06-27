---
status: needs-review
sourceId: "61329cb9c470"
sourceChecksum: "61329cb9c470bab0a644cc30374c52d13ae4747d0a9d88f8f5ee3303431d02e9"
sourceUrl: "https://developers.openai.com/ads/campaign-targeting"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# Campaign Targeting

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

<a href="/ads/openai-geotargets.csv" download>
  {"下载 OpenAI Ads locations"}
</a>

## Campaign creation

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

| Location ID | Meaning | Type |
| ----------- | ------- | ---- |
| `2000043`   | California, United States | `region` |
| `3000194`   | San Francisco - Oakland - San Jose, United States | `dma` |
| `3000001`   | New York, United States | `dma` |

验证 campaign 设置时，请使用 `status: "paused"`。当 campaign、ad groups 和 ads 准备好 serving 时，再将 campaign 切换为 `active`。
