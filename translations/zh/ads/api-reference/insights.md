---
status: needs-review
sourceId: "209d29324de5"
sourceChecksum: "209d29324de524f08fbe6bf43e72ca207000d5d2393382e854ccdc34f6c7969e"
sourceUrl: "https://developers.openai.com/ads/api-reference/insights"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# Insights（效果洞察）

## Endpoint（端点）

使用与你想获取结果的 scope 相匹配的 endpoint。每个 endpoint 都返回相同的顶层响应形状，其中包含适合该 scope 的 ID、metadata 和 metrics。

| 端点                                    |
| --------------------------------------- |
| `GET /ad_account/insights`              |
| `GET /campaigns/{campaign_id}/insights` |
| `GET /ad_groups/{ad_group_id}/insights` |
| `GET /ads/{ad_id}/insights`             |

## 术语

| 术语                             | 取值 | 含义 |
| -------------------------------- | ------ | ------- |
| `{aggregation_level}`            | `ad_account`、`campaign`、`ad_group`、`ad` | 公共行实体。endpoint 设置 scope；`aggregation_level` 选择该 scope 内的行实体。 |
| `time_granularity`               | `hourly`、`daily`、`monthly`、`none` | Bucket 大小。`none` 会针对完整请求窗口返回一个 bucket。 |
| `segments[]`                     | `product`、`country`、`device` | 可选的额外细分维度。下文中的 `{segment}` 表示所请求的 segment 值。 |
| `{entity}`                       | 行 `{aggregation_level}` 或请求的 `{segment}` | 在 `override_segment_group_order[]` 中命名的实体。请求 segmented request 中的 grouped metrics 时使用它。 |
| `{metric}`                       | `impressions`、`clicks`、`spend`、`ctr`、`cpc`、`cpm` | 聚合数值字段。 |
| `{aggregation_level}.id`         | `ad_account.id`、`campaign.id`、`ad_group.id`、`ad.id` | 规范 aggregation-level ID 字段。当该 aggregation level 存在于行中时有效。 |
| `{aggregation_level}.{metric}`   | `campaign.impressions`、`ad.clicks`、`ad_group.spend` | 行 aggregation level 的 metric。对于默认行，使用 `{aggregation_level}.{metric}`。在 segmented request 中，grouped metrics 可以命名 `override_segment_group_order[]` 中的实体或 segment。 |
| `{aggregation_level}.{metadata}` | `ad_account.name`、`ad_account.url`、`ad_account.budget.lifetime`、`ad_account.budget.daily`；`campaign.name`、`campaign.description`、`campaign.status`、`campaign.start_time`、`campaign.end_time`、`campaign.budget.lifetime`、`campaign.budget.daily`；`ad_group.name`、`ad_group.description`、`ad_group.status`；`ad.title`、`ad.copy`、`ad.link`、`ad.name`、`ad.status`、`ad.review_status` | 规范 aggregation-level metadata 字段。当该 aggregation level 存在于行中时有效。 |
| `{segment}.{metric}`             | `product.impressions`、`country.clicks`、`device.spend` | 所请求 segment group 的 metric。仅当存在匹配的 `segments[]` 值时有效。 |
| `{segment}.{metadata}`           | `product.feed_id`、`product.item_id`、`product.title`、`product.description`、`product.body`、`product.target_url`、`product.image_url`、`product.brand`、`product.seller_name`、`product.price`、`product.availability`；`country.name`；`device.type` | 规范 segment metadata 字段。仅当存在匹配的 `segments[]` 值时有效。 |
| `metadata.{field}`               | `metadata.readable_time`、`metadata.timezone` | 报表 metadata。响应返回扁平 key，例如 `readable_time` 和 `timezone`。 |
| `{product}.{id}`                 | `product.feed_id`、`product.item_id`、`product.feed_item_id` | 使用 `product.feed_id` 和 `product.item_id` 投影身份。仅在 `filters[]` 中使用 `product.feed_item_id` 来精确匹配 feed/item 对。 |
| `filters[].operator`             | `IN`、`GREATER_THAN`、`LESS_THAN` | Filter operator。`IN` 用于等值风格的 filter。`GREATER_THAN` 和 `LESS_THAN` 用于数值阈值。 |
| `sort[].direction`               | `asc`、`desc` | 排序方向。 |
| `sort[].field`                   | `{aggregation_level}.{metric}`；segmented request 中的 `{entity}.{metric}`；`{aggregation_level}.id`；可排序的 `{aggregation_level}.{metadata}`；可排序的 `{segment}.{metadata}` | 规范 sort key。字段必须对当前行形状有效。 |
| `includes[]`                     | `zero_impression_items`、`zero_impression_products` | 可选的 zero-row 扩展。请参阅 [Includes](#includes) 了解每个值何时可用。 |
| `time_ranges[].type`             | `unix_range`、`hour_range`、`date_range` | Time-range object 类型。`unix_range` 使用 Unix 秒形式的 `start` 和 `end`。`hour_range` 使用 `YYYY-MM-DDTHH` 形式的本地 `since` 和 `until` 值。`date_range` 使用 `YYYY-MM-DD` 形式的本地 `since` 和 `until` 值。`hour_range` 和 `date_range` 可以包含 IANA `timezone`；否则使用 ad account timezone。 |

## 请求参数

所有查询参数都是可选的。

| 参数                           | 类型       | 值形状 | 规则 |
| ------------------------------ | ---------- | ----------- | ----- |
| `time_granularity`             | `string`   | 一个 `time_granularity` 值 | 默认值为 `daily`。Bucket 行为请参阅 [Terminology](#术语)。 |
| `aggregation_level`            | `string`   | 一个公共 `{aggregation_level}` | 设置 endpoint scope 内的行实体。每个 endpoint 支持自己的实体级别，以及 `ad_account` > `campaign` > `ad_group` > `ad` 层级中的更低级别。 |
| `time_ranges`                  | `string[]` | 一个 JSON 编码的 time-range object today | 限制报表窗口。至少包含一个边界。边界必须位于 5 年内，不能在未来，并且会规范化为有效的完整小时边界。 |
| `fields`                       | `string[]` | 重复的 canonical field names | 投影所选字段。请参阅 [Projection](#projection)。 |
| `filters`                      | `string[]` | JSON 编码的 filter object | 限制保留下来的行。请参阅 [Filters](#filters)。 |
| `sort`                         | `string[]` | JSON 编码的 sort object | 在分页前对行排序。请参阅 [Sorts](#sorts)。 |
| `segments`                     | `string[]` | 最多一个 `{segment}` | 添加一个额外细分维度。请参阅 [Segments](#segments)。 |
| `override_segment_group_order` | `string[]` | 行实体加所请求 segment | 通过重新排序 groups 来改变 grouped metric 的含义。请参阅 [Segments](#segments)。 |
| `includes`                     | `string[]` | 最多一个 include 值 | 使用受支持的 zero rows 扩展结果。请参阅 [Includes](#includes)。 |
| `limit`                        | `integer`  | `1` 到 `2000` | 默认值为 `20`。限制在应用 filter 和 sort 后一页返回的行数。 |
| `before`                       | `string`   | 上一页 cursor | 按当前行顺序向后翻页。一次只发送一个 cursor；使用上一页的 `first_id`。 |
| `after`                        | `string`   | 下一页 cursor | 按当前行顺序向前翻页。一次只发送一个 cursor；使用上一页的 `last_id`。 |

### Projection（字段投影）

Projection 控制返回的列，而不是行分组。将 `fields[]` 与上方的 canonical field names 一起使用。响应会将许多字段序列化为扁平 wire keys，例如 `campaign.id` 到 `campaign_id`、`metadata.readable_time` 到 `readable_time`，以及 `product.feed_id` 到 `product_feed_id`。

如果省略 `fields[]`，响应默认返回 `impressions`；当 `time_granularity` 不是 `none` 时添加 `readable_time`；并添加行实体的默认名称，例如 `campaign_name` 或 `ad_name`。

### Filters（过滤）

| 参数                 | 值形状 | 规则 | 示例 |
| -------------------- | ----------- | ----- | ------- |
| `filters[]`          | 带有 `field`、`operator`、`value` 的 JSON 编码对象 | 重复 `filters[]` 可将 filters 以 AND 组合。 | `{"field":"campaign.id","operator":"IN","value":["cmpn_101"]}` |
| `filters[].field`    | 来自 [Terminology](#术语) 的一个 canonical field name | 字段必须对当前行形状有效。仅在精确 feed/item 对 filter 中使用 `product.feed_item_id`，并使用形如 `{"feed_id":"feed_1","item_id":"sku_1"}` 的 JSON-string `IN` 值。 | `campaign.id` 或 `ad.clicks` |
| `filters[].operator` | `IN`、`GREATER_THAN`、`LESS_THAN` | 对 resource、segment 或 metadata 等值使用 `IN`。对数值 metadata 或 grouped metric 阈值使用 `GREATER_THAN` 或 `LESS_THAN`。 | `IN` 或 `GREATER_THAN` |
| `filters[].value`    | 字符串数组或数字，取决于 operator | 值形状必须与 operator 匹配。 | `["cmpn_101"]` 或 `10` |

### Sorts（排序）

| 参数               | 值形状 | 规则 | 示例 |
| ------------------ | ----------- | ----- | ------- |
| `sort[]`           | JSON 编码对象 | 重复 `sort[]` 并带上 `field` 和 `direction`。 | `{"field":"ad.clicks","direction":"desc"}` |
| `sort[].field`     | 来自 [Terminology](#术语) 的一个 canonical sort key | 使用对当前行形状有效的 sort key。 | `ad.clicks` 或 `product.title` |
| `sort[].direction` | 一个 `sort[].direction` 值 | 使用 `asc` 或 `desc`。 | `desc` |

### Segments（细分）

#### Segment rules（细分规则）

| 参数                             | 规则 |
| -------------------------------- | ----- |
| `segments[]`                     | 添加一个可选细分维度。 |
| `time_granularity`               | Segmented requests 支持 `none`、`daily` 和 `monthly`。 |
| Segment fields                   | 仅在请求了该 segment 时使用 `{segment}.{metadata}`。 |
| `override_segment_group_order[]` | 按顺序恰好包含一次行 `aggregation_level` 和请求的 segment。 |

#### Product example（商品示例）

| 目标                 | 请求形状 |
| -------------------- | ------------- |
| Product breakdown    | 向 `ad_account`、`campaign`、`ad_group` 或 `ad` aggregation level 添加 `segments[]=product`。 |
| Product fields       | 从 [Terminology](#术语) 投影 `product.*` 字段。 |
| Product-first rows   | 先设置 `override_segment_group_order[]=product`，再设置 `override_segment_group_order[]=<aggregation_level>`。 |
| Zero-impression rows | 添加 `includes[]=zero_impression_products`；请求要求请参阅 [Includes](#includes)。 |

### Includes（附加行）

`includes[]` 会使用受支持的 zero-metric rows 扩展结果集。它不会改变 endpoint scope 或 `aggregation_level`。

| Include                    | 生效条件 | 添加内容 |
| -------------------------- | ---------- | ---- |
| `zero_impression_items`    | 仅默认实体分组：不要发送 `segments[]`。 | 在所请求窗口中 impressions 为零的实体行。 |
| `zero_impression_products` | 仅 product reporting：使用 `segments[]=product`，并将 `override_segment_group_order[]=product` 放在首位。 | 在所请求窗口中 impressions 为零的已配置 product 行。 |

## 示例



此请求的 scope 是一个 ad account，按 campaign 对行分组，并每天返回一个 bucket。因为 `aggregation_level=campaign`，每个数据行都有 `campaign_id` 而不是 `ad_id`。

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

代表性响应：

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





这里使用与前一个示例相同的 ad-account scope 和时间窗口，但将 `aggregation_level` 从 `campaign` 改为 `ad`。结果现在每天每个广告有一行，因此 campaign 总数会展开为多个广告行。

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

代表性响应：

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





`filters[]` 会移除不匹配 `campaign.id` 的行。`sort[]` 按 clicks 对剩余广告排序，`limit=1` 只保留页面中的第一行。

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

代表性响应：

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





当你需要所选 entity level 下的 product 行时，请使用 product segment。此请求先按 products 分组，再按 ad account 分组，因此即使某个已配置 product 的 impressions 为零，响应也可以包含该 product 行。

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

代表性响应：

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
