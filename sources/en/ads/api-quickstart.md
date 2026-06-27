# Quickstart

The Ads API can programmatically create ad campaigns and monitor your results. This guide covers the minimal implementation to get an ad live, and check your results.

## Ad Structure

Ads live inside an Ad Group, and Ad Groups live inside a Campaign. Campaigns and Ad Groups define your budget and targeting, while Ads host your Ad's title, description and images.

## 1. Confirm access to your ad account

Issue an API key in the Settings tab of your [Ads Manager](https://ads.openai.com) account. See the [authentication reference](https://developers.openai.com/ads/api-reference/authentication) for more info.

Call `GET /ad_account` to confirm that your bearer token works and that
you are using the right account:

```bash
curl -X GET "https://api.ads.openai.com/v1/ad_account" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Accept: application/json"
```

Response:

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

## 2. Upload a creative asset

Upload a remote image and store the returned `file_id`. You'll use it when
you create the ad.

```bash
curl -X POST "https://api.ads.openai.com/v1/upload" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/assets/workspace-planner-card.png"
  }'
```

Response:

```json
{
  "file_id": "file_901"
}
```

If you already have a local file, the same endpoint also accepts
`multipart/form-data`.

## 3. Create a campaign

Create the top-level campaign first. Save the returned campaign ID for the next
step.

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

Response:

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

## 4. Create an ad group

Create an ad group inside the campaign. Save the returned ad group ID for the
ad creation step.

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

Response:

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

## 5. Create an ad

Create the ad with a `chat_card` creative and attach the uploaded asset by
`file_id`.

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

Response:

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

## 6. Retrieve insights

Once the ad is serving, retrieve performance data from the ad-level insights
endpoint.

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

## Next steps

Once the basic flow works, use the full reference for each part of the
integration:

- [Authentication](https://developers.openai.com/ads/api-reference/authentication)
- [Campaigns](https://developers.openai.com/ads/api-reference/campaigns)
- [Campaign Targeting](https://developers.openai.com/ads/campaign-targeting)
- [Product feeds](https://developers.openai.com/ads/product-feeds)
- [Ad Groups](https://developers.openai.com/ads/api-reference/ad-groups)
- [Ads](https://developers.openai.com/ads/api-reference/ads)
- [Files](https://developers.openai.com/ads/api-reference/files)
- [Insights](https://developers.openai.com/ads/api-reference/insights)
