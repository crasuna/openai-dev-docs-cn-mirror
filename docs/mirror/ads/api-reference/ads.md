---
title: "Ads（广告）"
description: "Create, list, retrieve, update, and change ad state."
outline: deep
---

# Ads（广告）

**文档集**：广告\
**分组**：API 参考\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/ads/api-reference/ads](https://developers.openai.com/ads/api-reference/ads)
- Markdown 来源：[https://developers.openai.com/ads/api-reference/ads.md](https://developers.openai.com/ads/api-reference/ads.md)
- 抓取时间：2026-06-27T05:53:53.825Z
- Checksum：`d062db7532307a1ab0006e16902b8fc920d9d0e4dc938f18d7c07f7f9e098a77`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 列出广告

列出某个 ad group 的广告。

`GET /ads`

| 参数          | 类型    | 是否必填 | 说明 |
| ------------- | ------- | -------- | ----- |
| `ad_group_id` | string  | 是 | 父级 ad group ID。 |
| `limit`       | integer | 否 | 介于 `1` 和 `500` 之间。默认值为 20。 |
| `after`       | string  | 否 | 下一页的 cursor。 |
| `before`      | string  | 否 | 上一页的 cursor。 |
| `order`       | string  | 否 | `asc` 或 `desc`。 |

```bash
curl -X GET "https://api.ads.openai.com/v1/ads?ad_group_id=adgrp_301&limit=10" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "ad_501",
      "name": "Planner launch card",
      "created_at": 1735689800,
      "updated_at": 1735776200,
      "creative": {
        "type": "chat_card",
        "title": "Try the new workspace planner",
        "body": "Coordinate tasks, docs, and meetings in one place.",
        "file_id": "file_901",
        "image_url": "https://cdn.openai.com/ads/file_901.png",
        "target_url": "https://example.com/workspace-planner"
      },
      "status": "active",
      "review_status": "approved"
    }
  ],
  "first_id": "ad_501",
  "last_id": "ad_501",
  "has_more": false
}
```

## 创建广告

为 ad group 创建广告。

`POST /ads`

| 字段                  | 类型   | 是否必填        | 说明 |
| --------------------- | ------ | --------------- | ----- |
| `ad_group_id`         | string | 是 | 父级 ad group ID。 |
| `name`                | string | 是 | `3` 到 `1000` 个字符，并且必须包含一个非空格字符。用于组织管理，不会显示给最终用户。 |
| `creative.type`       | string | 是 | `chat_card` 或 `product_ad_template`。参阅 [Product feeds](/mirror/ads/product-feeds)。 |
| `creative.title`      | string | 是 | `3` 到 `50` 个字符。 |
| `creative.body`       | string | 是 | 最多 `100` 个字符。 |
| `creative.price`      | string | 否 | 价格文本，或 product-ad template 使用的 `&#123;&#123;product.price&#125;&#125;`。 |
| `creative.target_url` | string | `chat_card` 适用 | 目标 URL。product-ad template 会从所选 feed item 接收该值。 |
| `creative.file_id`    | string | `chat_card` 适用 | `POST /upload` 返回的文件。product-ad template 会从所选 feed item 接收其图片。 |
| `status`              | string | 是 | `active` 或 `paused`。 |

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

### Product-ad templates（商品广告模板）

一个 product-feed ad group 最多只能包含一个未归档的 `product_ad_template` 广告。Product-ad templates 会从所选 feed item 接收图片和目标 URL，因此不需要 `creative.file_id` 或 `creative.target_url`。

请按照 [product feeds guide](/mirror/ads/product-feeds) 完成 campaign、product-set 和 template 工作流。

## 检索广告

按 ID 获取一条广告。

`GET /ads/{ad_id}`

```bash
curl -X GET "https://api.ads.openai.com/v1/ads/ad_501" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

## 更新广告

使用 `POST` 更新广告。

`POST /ads/{ad_id}`

更新时所有字段都是可选的。如果包含 `creative`，请发送完整 creative 对象。`status` 接受 `active`、`paused` 或 `archived`。

```bash
curl -X POST "https://api.ads.openai.com/v1/ads/ad_501" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Planner launch card v2",
    "status": "paused",
    "creative": {
      "type": "chat_card",
      "title": "Plan work faster",
      "body": "Bring tasks, docs, and meetings together.",
      "target_url": "https://example.com/workspace-planner",
      "file_id": "file_901"
    }
  }'
```

## Review status（审核状态）

每个广告响应都包含 `review_status`，其值可以是：

- `in_review`
- `rejected`
- `approved`

如果你的广告被 rejected，则说明它违反了我们的 [ads policies](https://openai.com/policies/ad-policies/)。请编辑广告，以便重新审核。

## 使用专用操作更改状态

Ads API 还公开了显式状态转换。Paused ads 不会向客户投放。只归档不再需要的对象，因为归档不可逆。

- `POST /ads/{ad_id}/activate`
- `POST /ads/{ad_id}/pause`
- `POST /ads/{ad_id}/archive`

```bash
curl -X POST "https://api.ads.openai.com/v1/ads/ad_501/pause" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

```json
{
  "id": "ad_501",
  "name": "Planner launch card",
  "created_at": 1735689800,
  "updated_at": 1736035200,
  "creative": {
    "type": "chat_card",
    "title": "Try the new workspace planner",
    "body": "Coordinate tasks, docs, and meetings in one place.",
    "file_id": "file_901",
    "image_url": "https://cdn.openai.com/ads/file_901.png",
    "target_url": "https://example.com/workspace-planner"
  },
  "status": "paused",
  "review_status": "approved"
}
```

:::

## English source

::: details 展开英文原文
::: v-pre
## List ads

List ads for an ad group.

`GET /ads`

| Parameter     | Type    | Required | Notes                              |
| ------------- | ------- | -------- | ---------------------------------- |
| `ad_group_id` | string  | Yes      | Parent ad group ID.                |
| `limit`       | integer | No       | Between `1` and `500`. Default 20. |
| `after`       | string  | No       | Cursor for the next page.          |
| `before`      | string  | No       | Cursor for the previous page.      |
| `order`       | string  | No       | `asc` or `desc`.                   |

```bash
curl -X GET "https://api.ads.openai.com/v1/ads?ad_group_id=adgrp_301&limit=10" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "ad_501",
      "name": "Planner launch card",
      "created_at": 1735689800,
      "updated_at": 1735776200,
      "creative": {
        "type": "chat_card",
        "title": "Try the new workspace planner",
        "body": "Coordinate tasks, docs, and meetings in one place.",
        "file_id": "file_901",
        "image_url": "https://cdn.openai.com/ads/file_901.png",
        "target_url": "https://example.com/workspace-planner"
      },
      "status": "active",
      "review_status": "approved"
    }
  ],
  "first_id": "ad_501",
  "last_id": "ad_501",
  "has_more": false
}
```

## Create an ad

Create an ad for an ad group.

`POST /ads`

| Field                 | Type   | Required        | Notes                                                                                                         |
| --------------------- | ------ | --------------- | ------------------------------------------------------------------------------------------------------------- |
| `ad_group_id`         | string | Yes             | Parent ad group ID.                                                                                           |
| `name`                | string | Yes             | `3` to `1000` chars and must include a non-space character. Used for organization, is not shown to end users. |
| `creative.type`       | string | Yes             | `chat_card` or `product_ad_template`. See [Product feeds](/mirror/ads/product-feeds).                                |
| `creative.title`      | string | Yes             | `3` to `50` chars.                                                                                            |
| `creative.body`       | string | Yes             | Maximum `100` chars.                                                                                          |
| `creative.price`      | string | No              | Price text or `&#123;&#123;product.price&#125;&#125;` for a product-ad template.                                                  |
| `creative.target_url` | string | For `chat_card` | Destination URL. A product-ad template receives it from the selected feed item.                               |
| `creative.file_id`    | string | For `chat_card` | File returned by `POST /upload`. A product-ad template receives its image from the selected feed item.        |
| `status`              | string | Yes             | `active` or `paused`.                                                                                         |

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

### Product-ad templates

A product-feed ad group can contain at most one non-archived
`product_ad_template` ad. Product-ad templates receive their image and
destination URL from the selected feed item, so they don't require
`creative.file_id` or `creative.target_url`.

Follow the [product feeds guide](/mirror/ads/product-feeds) for the complete campaign,
product-set, and template workflow.

## Retrieve an ad

Fetch one ad by ID.

`GET /ads/{ad_id}`

```bash
curl -X GET "https://api.ads.openai.com/v1/ads/ad_501" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

## Update an ad

Update an ad with `POST`.

`POST /ads/{ad_id}`

All fields are optional on update. If you include `creative`, send the full
creative object. `status` accepts `active`, `paused`, or `archived`.

```bash
curl -X POST "https://api.ads.openai.com/v1/ads/ad_501" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Planner launch card v2",
    "status": "paused",
    "creative": {
      "type": "chat_card",
      "title": "Plan work faster",
      "body": "Bring tasks, docs, and meetings together.",
      "target_url": "https://example.com/workspace-planner",
      "file_id": "file_901"
    }
  }'
```

## Review status

Every ad response includes `review_status`, which can be:

- `in_review`
- `rejected`
- `approved`

If your ad has been rejected, it violates one of our [ads policies](https://openai.com/policies/ad-policies/). Please edit your ad for it to be re-reviewed.

## Change state with dedicated actions

The Ads API also exposes explicit state transitions. Paused ads won't deliver to customers. Only archive objects you have no further use for, as archiving isn't reversible.

- `POST /ads/{ad_id}/activate`
- `POST /ads/{ad_id}/pause`
- `POST /ads/{ad_id}/archive`

```bash
curl -X POST "https://api.ads.openai.com/v1/ads/ad_501/pause" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

```json
{
  "id": "ad_501",
  "name": "Planner launch card",
  "created_at": 1735689800,
  "updated_at": 1736035200,
  "creative": {
    "type": "chat_card",
    "title": "Try the new workspace planner",
    "body": "Coordinate tasks, docs, and meetings in one place.",
    "file_id": "file_901",
    "image_url": "https://cdn.openai.com/ads/file_901.png",
    "target_url": "https://example.com/workspace-planner"
  },
  "status": "paused",
  "review_status": "approved"
}
```

:::
:::

