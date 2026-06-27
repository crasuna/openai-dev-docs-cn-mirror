# Insights

## Endpoint

Use the endpoint that matches the scope you want to get results for. Each endpoint
returns the same top-level response shape, with IDs, metadata, and metrics
appropriate to that scope.

| Endpoint                                |
| --------------------------------------- |
| `GET /ad_account/insights`              |
| `GET /campaigns/{campaign_id}/insights` |
| `GET /ad_groups/{ad_group_id}/insights` |
| `GET /ads/{ad_id}/insights`             |

## Terminology

| Term                             | Values                                                                                                                                                                                                                                                                                                                                                                                              | Meaning                                                                                                                                                                                                                                                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{aggregation_level}`            | `ad_account`, `campaign`, `ad_group`, `ad`                                                                                                                                                                                                                                                                                                                                                          | Public row entities. The endpoint sets scope; `aggregation_level` chooses the row entity inside that scope.                                                                                                                                                                                                                 |
| `time_granularity`               | `hourly`, `daily`, `monthly`, `none`                                                                                                                                                                                                                                                                                                                                                                | Bucket size. `none` returns one bucket for the full requested window.                                                                                                                                                                                                                                                       |
| `segments[]`                     | `product`, `country`, `device`                                                                                                                                                                                                                                                                                                                                                                      | Optional extra breakdown dimension. `{segment}` below means the requested segment value.                                                                                                                                                                                                                                    |
| `{entity}`                       | The row `{aggregation_level}` or requested `{segment}`                                                                                                                                                                                                                                                                                                                                              | Entity named in `override_segment_group_order[]`. Use it when requesting grouped metrics in a segmented request.                                                                                                                                                                                                            |
| `{metric}`                       | `impressions`, `clicks`, `spend`, `ctr`, `cpc`, `cpm`                                                                                                                                                                                                                                                                                                                                               | Aggregated numeric fields.                                                                                                                                                                                                                                                                                                  |
| `{aggregation_level}.id`         | `ad_account.id`, `campaign.id`, `ad_group.id`, `ad.id`                                                                                                                                                                                                                                                                                                                                              | Canonical aggregation-level ID fields. They are valid when that aggregation level is present in the row.                                                                                                                                                                                                                    |
| `{aggregation_level}.{metric}`   | `campaign.impressions`, `ad.clicks`, `ad_group.spend`                                                                                                                                                                                                                                                                                                                                               | Metric for the row aggregation level. For default rows, use `{aggregation_level}.{metric}`. In segmented requests, grouped metrics can name the entity or segment in `override_segment_group_order[]`.                                                                                                                      |
| `{aggregation_level}.{metadata}` | `ad_account.name`, `ad_account.url`, `ad_account.budget.lifetime`, `ad_account.budget.daily`; `campaign.name`, `campaign.description`, `campaign.status`, `campaign.start_time`, `campaign.end_time`, `campaign.budget.lifetime`, `campaign.budget.daily`; `ad_group.name`, `ad_group.description`, `ad_group.status`; `ad.title`, `ad.copy`, `ad.link`, `ad.name`, `ad.status`, `ad.review_status` | Canonical aggregation-level metadata fields. They are valid when that aggregation level is present in the row.                                                                                                                                                                                                              |
| `{segment}.{metric}`             | `product.impressions`, `country.clicks`, `device.spend`                                                                                                                                                                                                                                                                                                                                             | Metric for the requested segment group. Valid only when the matching `segments[]` value is present.                                                                                                                                                                                                                         |
| `{segment}.{metadata}`           | `product.feed_id`, `product.item_id`, `product.title`, `product.description`, `product.body`, `product.target_url`, `product.image_url`, `product.brand`, `product.seller_name`, `product.price`, `product.availability`; `country.name`; `device.type`                                                                                                                                             | Canonical segment metadata fields. Valid only when the matching `segments[]` value is present.                                                                                                                                                                                                                              |
| `metadata.{field}`               | `metadata.readable_time`, `metadata.timezone`                                                                                                                                                                                                                                                                                                                                                       | Report metadata. The response returns flat keys such as `readable_time` and `timezone`.                                                                                                                                                                                                                                     |
| `{product}.{id}`                 | `product.feed_id`, `product.item_id`, `product.feed_item_id`                                                                                                                                                                                                                                                                                                                                        | Use `product.feed_id` and `product.item_id` to project identity. Use `product.feed_item_id` only in `filters[]` for an exact feed/item pair.                                                                                                                                                                                |
| `filters[].operator`             | `IN`, `GREATER_THAN`, `LESS_THAN`                                                                                                                                                                                                                                                                                                                                                                   | Filter operators. `IN` is for equality-style filters. `GREATER_THAN` and `LESS_THAN` are for numeric thresholds.                                                                                                                                                                                                            |
| `sort[].direction`               | `asc`, `desc`                                                                                                                                                                                                                                                                                                                                                                                       | Sort order.                                                                                                                                                                                                                                                                                                                 |
| `sort[].field`                   | `{aggregation_level}.{metric}`; `{entity}.{metric}` for a segmented request; `{aggregation_level}.id`; sortable `{aggregation_level}.{metadata}`; sortable `{segment}.{metadata}`                                                                                                                                                                                                                   | Canonical sort keys. The field must be valid for the current row shape.                                                                                                                                                                                                                                                     |
| `includes[]`                     | `zero_impression_items`, `zero_impression_products`                                                                                                                                                                                                                                                                                                                                                 | Optional zero-row expansions. See [Includes](#includes) for when each value works.                                                                                                                                                                                                                                          |
| `time_ranges[].type`             | `unix_range`, `hour_range`, `date_range`                                                                                                                                                                                                                                                                                                                                                            | Time-range object type. `unix_range` uses `start` and `end` Unix seconds. `hour_range` uses local `since` and `until` values in `YYYY-MM-DDTHH`. `date_range` uses local `since` and `until` values in `YYYY-MM-DD`. `hour_range` and `date_range` can include IANA `timezone`; otherwise they use the ad account timezone. |

## Request parameters

All query parameters are optional.

| Parameter                      | Type       | Value shape                              | Rules                                                                                                                                                                      |
| ------------------------------ | ---------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `time_granularity`             | `string`   | One `time_granularity` value             | Default `daily`. See [Terminology](#terminology) for bucket behavior.                                                                                                      |
| `aggregation_level`            | `string`   | One public `{aggregation_level}`         | Set the row entity inside the endpoint scope. Each endpoint supports its own entity level and lower levels in the hierarchy `ad_account` > `campaign` > `ad_group` > `ad`. |
| `time_ranges`                  | `string[]` | One JSON-encoded time-range object today | Restrict the report window. Include at least one bound. Bounds must be within 5 years, not in the future, and normalize to valid full-hour boundaries.                     |
| `fields`                       | `string[]` | Repeated canonical field names           | Project selected fields. See [Projection](#projection).                                                                                                                    |
| `filters`                      | `string[]` | JSON-encoded filter objects              | Restrict which rows survive. See [Filters](#filters).                                                                                                                      |
| `sort`                         | `string[]` | JSON-encoded sort objects                | Order rows before pagination. See [Sorts](#sorts).                                                                                                                         |
| `segments`                     | `string[]` | At most one `{segment}`                  | Add one extra breakdown dimension. See [Segments](#segments).                                                                                                              |
| `override_segment_group_order` | `string[]` | Row entity plus requested segment        | Change grouped metric meaning by reordering groups. See [Segments](#segments).                                                                                             |
| `includes`                     | `string[]` | At most one include value                | Expand results with supported zero rows. See [Includes](#includes).                                                                                                        |
| `limit`                        | `integer`  | `1` through `2000`                       | Default `20`. Caps rows returned in one page after filters and sorting are applied.                                                                                        |
| `before`                       | `string`   | Previous-page cursor                     | Page backward through the current row order. Send only one cursor at a time; use the previous page's `first_id`.                                                           |
| `after`                        | `string`   | Next-page cursor                         | Page forward through the current row order. Send only one cursor at a time; use the previous page's `last_id`.                                                             |

### Projection

Projection controls returned columns, not row grouping. Use `fields[]` with
the canonical field names above. The response serializes many fields as flat
wire keys, such as `campaign.id` to
`campaign_id`, `metadata.readable_time` to `readable_time`, and
`product.feed_id` to `product_feed_id`.

If you omit `fields[]`, the response defaults to `impressions`, adds
`readable_time` when `time_granularity` is not `none`, and adds the default name
for the row entity such as `campaign_name` or `ad_name`.

### Filters

| Parameter            | Value shape                                               | Rules                                                                                                                                                                                                    | Example                                                        |
| -------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `filters[]`          | JSON-encoded objects with `field`, `operator`, `value`    | Repeat `filters[]` to AND filters together.                                                                                                                                                              | `{"field":"campaign.id","operator":"IN","value":["cmpn_101"]}` |
| `filters[].field`    | One canonical field name from [Terminology](#terminology) | The field must be valid for the current row shape. Use `product.feed_item_id` only for an exact feed/item pair filter with JSON-string `IN` values shaped like `{"feed_id":"feed_1","item_id":"sku_1"}`. | `campaign.id` or `ad.clicks`                                   |
| `filters[].operator` | `IN`, `GREATER_THAN`, `LESS_THAN`                         | Use `IN` for resource, segment, or metadata equality. Use `GREATER_THAN` or `LESS_THAN` for numeric metadata or grouped metric thresholds.                                                               | `IN` or `GREATER_THAN`                                         |
| `filters[].value`    | Array of strings or number depending on operator          | The value shape must match the operator.                                                                                                                                                                 | `["cmpn_101"]` or `10`                                         |

### Sorts

| Parameter          | Value shape                                             | Rules                                           | Example                                    |
| ------------------ | ------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| `sort[]`           | JSON-encoded objects                                    | Repeat `sort[]` with `field` and `direction`.   | `{"field":"ad.clicks","direction":"desc"}` |
| `sort[].field`     | One canonical sort key from [Terminology](#terminology) | Use a sort key valid for the current row shape. | `ad.clicks` or `product.title`             |
| `sort[].direction` | One `sort[].direction` value                            | Use `asc` or `desc`.                            | `desc`                                     |

### Segments

#### Segment rules

| Parameter                        | Rules                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------- |
| `segments[]`                     | Add one optional breakdown dimension.                                             |
| `time_granularity`               | Segmented requests support `none`, `daily`, and `monthly`.                        |
| Segment fields                   | Use `{segment}.{metadata}` only when that segment is requested.                   |
| `override_segment_group_order[]` | Include the row `aggregation_level` and requested segment exactly once, in order. |

#### Product example

| Goal                 | Request shape                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| Product breakdown    | Add `segments[]=product` to an `ad_account`, `campaign`, `ad_group`, or `ad` aggregation level.          |
| Product fields       | Project `product.*` fields from [Terminology](#terminology).                                             |
| Product-first rows   | Set `override_segment_group_order[]=product`, then `override_segment_group_order[]=<aggregation_level>`. |
| Zero-impression rows | Add `includes[]=zero_impression_products`; see [Includes](#includes) for request requirements.           |

### Includes

`includes[]` expands the result set with supported zero-metric rows. It does
not change endpoint scope or `aggregation_level`.

| Include                    | Works when                                                                                               | Adds                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `zero_impression_items`    | Default entity grouping only: do not send `segments[]`.                                                  | Entity rows that had zero impressions in the requested window.             |
| `zero_impression_products` | Product reporting only: use `segments[]=product` and put `override_segment_group_order[]=product` first. | Configured product rows that had zero impressions in the requested window. |

## Examples



This request scopes to one ad account, groups rows by campaign, and returns one
bucket per day. Because `aggregation_level=campaign`, each data row has a
`campaign_id` instead of an `ad_id`.

```bash
curl -sS -G "https://api.ads.openai.com/v1/ad_account/insights" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  --data-urlencode 'time_granularity=daily' \
  --data-urlencode 'aggregation_level=campaign' \
  --data-urlencode 'fields[]=metadata.readable_time' \
  --data-urlencode 'fields[]=campaign.id' \
  --data-urlencode 'fields[]=campaign.name' \
  --data-urlencode 'fields[]=campaign.clicks' \
  --data-urlencode 'fields[]=campaign.impressions' \
  --data-urlencode 'fields[]=campaign.spend' \
  --data-urlencode 'time_ranges[]={"type":"unix_range","start":1777075200,"end":1777248000}'
```

Representative response:

```json
{
  "object": "list",
  "data": [
    {
      "id": "start=1777075200:end=1777161600:entity_id=cmpn_101",
      "start_time": 1777075200,
      "end_time": 1777161600,
      "readable_time": "2026-04-25",
      "campaign_id": "cmpn_101",
      "campaign_name": "Spring launch",
      "impressions": 1200,
      "clicks": 36,
      "spend": 18.42
    },
    {
      "id": "start=1777161600:end=1777248000:entity_id=cmpn_101",
      "start_time": 1777161600,
      "end_time": 1777248000,
      "readable_time": "2026-04-26",
      "campaign_id": "cmpn_101",
      "campaign_name": "Spring launch",
      "impressions": 980,
      "clicks": 29,
      "spend": 14.86
    }
  ],
  "count": 2,
  "first_id": "start=1777075200:end=1777161600:entity_id=cmpn_101",
  "last_id": "start=1777161600:end=1777248000:entity_id=cmpn_101",
  "has_more": false
}
```





This uses the same ad-account scope and time window as the previous example,
but changes `aggregation_level` from `campaign` to `ad`. The result now has one
row per ad per day, so campaign totals can fan out into multiple ad rows.

```bash
curl -sS -G "https://api.ads.openai.com/v1/ad_account/insights" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  --data-urlencode 'time_granularity=daily' \
  --data-urlencode 'aggregation_level=ad' \
  --data-urlencode 'fields[]=metadata.readable_time' \
  --data-urlencode 'fields[]=campaign.id' \
  --data-urlencode 'fields[]=ad.id' \
  --data-urlencode 'fields[]=ad.name' \
  --data-urlencode 'fields[]=ad.clicks' \
  --data-urlencode 'fields[]=ad.impressions' \
  --data-urlencode 'time_ranges[]={"type":"unix_range","start":1777075200,"end":1777161600}'
```

Representative response:

```json
{
  "object": "list",
  "data": [
    {
      "id": "start=1777075200:end=1777161600:entity_id=ad_501",
      "start_time": 1777075200,
      "end_time": 1777161600,
      "readable_time": "2026-04-25",
      "campaign_id": "cmpn_101",
      "ad_id": "ad_501",
      "ad_name": "Blue shoes",
      "impressions": 700,
      "clicks": 22
    },
    {
      "id": "start=1777075200:end=1777161600:entity_id=ad_502",
      "start_time": 1777075200,
      "end_time": 1777161600,
      "readable_time": "2026-04-25",
      "campaign_id": "cmpn_101",
      "ad_id": "ad_502",
      "ad_name": "Red shoes",
      "impressions": 500,
      "clicks": 14
    }
  ],
  "count": 2,
  "first_id": "start=1777075200:end=1777161600:entity_id=ad_501",
  "last_id": "start=1777075200:end=1777161600:entity_id=ad_502",
  "has_more": false
}
```





`filters[]` removes rows that do not match `campaign.id`. `sort[]` ranks the
remaining ads by clicks, and `limit=1` keeps only the top row in the page.

```bash
curl -sS -G "https://api.ads.openai.com/v1/ad_account/insights" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  --data-urlencode 'time_granularity=none' \
  --data-urlencode 'aggregation_level=ad' \
  --data-urlencode 'filters[]={"field":"campaign.id","operator":"IN","value":["cmpn_101"]}' \
  --data-urlencode 'sort[]={"field":"ad.clicks","direction":"desc"}' \
  --data-urlencode 'limit=1' \
  --data-urlencode 'fields[]=campaign.id' \
  --data-urlencode 'fields[]=ad.id' \
  --data-urlencode 'fields[]=ad.name' \
  --data-urlencode 'fields[]=ad.clicks' \
  --data-urlencode 'fields[]=ad.impressions' \
  --data-urlencode 'time_ranges[]={"type":"unix_range","start":1777075200,"end":1777680000}'
```

Representative response:

```json
{
  "object": "list",
  "data": [
    {
      "id": "start=1777075200:end=1777680000:entity_id=ad_501:sort=clicks.desc:sort_values=126",
      "start_time": 1777075200,
      "end_time": 1777680000,
      "campaign_id": "cmpn_101",
      "ad_id": "ad_501",
      "ad_name": "Blue shoes",
      "impressions": 4200,
      "clicks": 126
    }
  ],
  "count": 1,
  "first_id": "start=1777075200:end=1777680000:entity_id=ad_501:sort=clicks.desc:sort_values=126",
  "last_id": "start=1777075200:end=1777680000:entity_id=ad_501:sort=clicks.desc:sort_values=126",
  "has_more": true
}
```





Use a product segment when you need product rows within the selected entity
level. This request groups products first, then the ad account, so the response
can include one configured product row even when that product had zero
impressions.

```bash
curl -sS -G "https://api.ads.openai.com/v1/ad_account/insights" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  --data-urlencode 'time_granularity=daily' \
  --data-urlencode 'aggregation_level=ad_account' \
  --data-urlencode 'segments[]=product' \
  --data-urlencode 'override_segment_group_order[]=product' \
  --data-urlencode 'override_segment_group_order[]=ad_account' \
  --data-urlencode 'includes[]=zero_impression_products' \
  --data-urlencode 'fields[]=product.feed_id' \
  --data-urlencode 'fields[]=product.item_id' \
  --data-urlencode 'fields[]=product.title' \
  --data-urlencode 'fields[]=product.impressions' \
  --data-urlencode 'fields[]=product.clicks' \
  --data-urlencode 'time_ranges[]={"type":"unix_range","start":1777075200,"end":1777161600}'
```

Representative response:

```json
{
  "object": "list",
  "data": [
    {
      "id": "start=1777075200:end=1777161600:entity_id=v2ad_account_id%3Dadacct_123%7Cproduct_feed_id%3Dfeed_1%7Citem_id%3Dsku_1",
      "start_time": 1777075200,
      "end_time": 1777161600,
      "product_feed_id": "feed_1",
      "item_id": "sku_1",
      "product_title": "Blue shoes",
      "product_impressions": 240,
      "product_clicks": 9
    },
    {
      "id": "start=1777075200:end=1777161600:entity_id=v2ad_account_id%3Dadacct_123%7Cproduct_feed_id%3Dfeed_1%7Citem_id%3Dsku_2",
      "start_time": 1777075200,
      "end_time": 1777161600,
      "product_feed_id": "feed_1",
      "item_id": "sku_2",
      "product_title": "Green shoes",
      "product_impressions": 0,
      "product_clicks": 0
    }
  ],
  "count": 2,
  "first_id": "start=1777075200:end=1777161600:entity_id=v2ad_account_id%3Dadacct_123%7Cproduct_feed_id%3Dfeed_1%7Citem_id%3Dsku_1",
  "last_id": "start=1777075200:end=1777161600:entity_id=v2ad_account_id%3Dadacct_123%7Cproduct_feed_id%3Dfeed_1%7Citem_id%3Dsku_2",
  "has_more": false
}
```
