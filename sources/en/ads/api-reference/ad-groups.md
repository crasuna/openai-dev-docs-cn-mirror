# Ad Groups

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
| `product_set`                       | object   | For product-feed campaigns | Selects a linked feed and optional product filters. See [Product feeds](https://developers.openai.com/ads/product-feeds). |
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
