# Product feeds

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
[standard bearer-token authentication](https://developers.openai.com/ads/api-reference/authentication).

## Set up the feed in Ads Manager

For product-feed Ads campaigns, use the **Feeds** area in [Ads
Manager](https://ads.openai.com) to create the feed connection and configure
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

See the [campaigns reference](https://developers.openai.com/ads/api-reference/campaigns) for scheduling,
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

See the [ad groups reference](https://developers.openai.com/ads/api-reference/ad-groups) for all fields and
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
destination URL. See the [ads reference](https://developers.openai.com/ads/api-reference/ads) for the full
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
reference for [filters](https://developers.openai.com/ads/api-reference/insights#filters),
[segments](https://developers.openai.com/ads/api-reference/insights#segments),
[includes](https://developers.openai.com/ads/api-reference/insights#includes), and complete
[examples](https://developers.openai.com/ads/api-reference/insights#examples).

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
