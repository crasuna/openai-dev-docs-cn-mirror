---
status: needs-review
sourceId: "e0765c1af15d"
sourceChecksum: "e0765c1af15dad7e97f8769442ac780a2294f8017eb627be913462c335877a8b"
sourceUrl: "https://developers.openai.com/ads/api-quickstart"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# 快速开始

Ads API 可以通过程序创建广告 campaign 并监控结果。本指南介绍让广告上线并检查结果所需的最小实现。

## 广告结构

广告位于 Ad Group 内，Ad Group 位于 Campaign 内。Campaign 和 Ad Group 定义预算与定向，而 Ads 承载广告的标题、描述和图片。

## 1. 确认可以访问你的 ad account

在你的 [Ads Manager](https://ads.openai.com) 账户的 Settings 标签页中签发 API key。更多信息请参阅 [authentication reference](https://developers.openai.com/ads/api-reference/authentication)。

调用 `GET /ad_account`，确认你的 bearer token 可用，并且你正在使用正确的账户：

```bash
curl -X GET "https://api.ads.openai.com/v1/ad_account" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Accept: application/json"
```

响应：

```json
{
  "id": "act_123",
  "name": "Acme Ads",
  "url": "https://www.acme.example",
  "preview_url": "https://preview.acme.example",
  "timezone": "UTC",
  "currency_code": "USD"
}
```

## 2. 上传一个创意资产

上传远程图片，并保存返回的 `file_id`。创建广告时会用到它。

```bash
curl -X POST "https://api.ads.openai.com/v1/upload" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/assets/workspace-planner-card.png"
  }'
```

响应：

```json
{
  "file_id": "file_901"
}
```

如果你已有本地文件，同一 endpoint 也接受 `multipart/form-data`。

## 3. 创建 campaign

先创建顶层 campaign。保存返回的 campaign ID，供下一步使用。

```bash
curl -X POST "https://api.ads.openai.com/v1/campaigns" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spring launch",
    "status": "active",
    "budget": {
      "lifetime_spend_limit_micros": 25000000
    }
  }'
```

响应：

```json
{
  "id": "cmpn_101",
  "created_at": 1735689600,
  "updated_at": 1735689600,
  "name": "Spring launch",
  "description": null,
  "status": "active",
  "start_time": null,
  "end_time": null,
  "budget": {
    "lifetime_spend_limit_micros": 25000000
  },
  "targeting": {}
}
```

## 4. 创建 ad group

在 campaign 内创建 ad group。保存返回的 ad group ID，供广告创建步骤使用。

```bash
curl -X POST "https://api.ads.openai.com/v1/ad_groups" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "cmpn_101",
    "name": "US English",
    "status": "active",
    "context_hints": ["productivity", "team collaboration"],
    "bidding_config": {
      "billing_event_type": "impression",
      "max_bid_micros": 60000
    }
  }'
```

响应：

```json
{
  "id": "adgrp_301",
  "created_at": 1735689700,
  "updated_at": 1735689700,
  "name": "US English",
  "description": null,
  "context_hints": ["productivity", "team collaboration"],
  "status": "active",
  "bidding_config": {
    "billing_event_type": "impression",
    "max_bid_micros": 60000
  }
}
```

## 5. 创建广告

使用 `chat_card` creative 创建广告，并通过 `file_id` 附加已上传的资产。

```bash
curl -X POST "https://api.ads.openai.com/v1/ads" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ad_group_id": "adgrp_301",
    "name": "Planner launch card",
    "status": "active",
    "creative": {
      "type": "chat_card",
      "title": "Try the new workspace planner",
      "body": "Coordinate tasks, docs, and meetings in one place.",
      "target_url": "https://example.com/workspace-planner",
      "file_id": "file_901"
    }
  }'
```

响应：

```json
{
  "id": "ad_501",
  "name": "Planner launch card",
  "created_at": 1735689800,
  "updated_at": 1735689800,
  "creative": {
    "type": "chat_card",
    "title": "Try the new workspace planner",
    "body": "Coordinate tasks, docs, and meetings in one place.",
    "file_id": "file_901",
    "image_url": "https://cdn.openai.com/ads/file_901.png",
    "target_url": "https://example.com/workspace-planner"
  },
  "status": "active",
  "review_status": "in_review"
}
```

## 6. 检索 insights

广告开始 serving 后，从广告级 insights endpoint 检索效果数据。

```bash
curl -sS -G "https://api.ads.openai.com/v1/ads/ad_501/insights" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  --data-urlencode "time_granularity=daily" \
  --data-urlencode "limit=7"
```

```json
{
  "object": "list",
  "count": 1,
  "data": [
    {
      "id": "start=1775088000:end=1775174400:entity_id=ad_501",
      "readable_time": "2026-04-02",
      "timezone": "UTC",
      "impressions": 15548,
      "clicks": 312,
      "spend": 42.75,
      "start_time": 1775088000,
      "end_time": 1775174400
    }
  ],
  "first_id": "start=1775088000:end=1775174400:entity_id=ad_501",
  "last_id": "start=1775088000:end=1775174400:entity_id=ad_501",
  "has_more": false
}
```

## 后续步骤

基础流程可用后，使用每个集成部分的完整 reference：

- [Authentication](https://developers.openai.com/ads/api-reference/authentication)
- [Campaigns](https://developers.openai.com/ads/api-reference/campaigns)
- [Campaign Targeting](https://developers.openai.com/ads/campaign-targeting)
- [Product feeds](https://developers.openai.com/ads/product-feeds)
- [Ad Groups](https://developers.openai.com/ads/api-reference/ad-groups)
- [Ads](https://developers.openai.com/ads/api-reference/ads)
- [Files](https://developers.openai.com/ads/api-reference/files)
- [Insights](https://developers.openai.com/ads/api-reference/insights)
