---
title: "Overview"
description: "Advertiser API endpoints & usage"
outline: deep
---

# Overview

**文档集**：Ads  
**分组**：Ads — Api Overview  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/ads/api-overview](https://developers.openai.com/ads/api-overview)
- Markdown 来源：[https://developers.openai.com/ads/api-overview.md](https://developers.openai.com/ads/api-overview.md)
- 抓取时间：2026-06-27T05:53:53.884Z
- Checksum：`a986b298237a173d5f7fe6424dcc0cf1edd2a105c80f81ccdeae96f42aa52d70`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Advertiser API 让你可以通过一个 API 管理广告 campaign、ad group、广告、文件和报表。
它支持类似 CRUD 的功能，并使用标准 JSON 内容类型。

## Authentication

在 [Ads Manager](https://ads.openai.com) 的 Settings 标签页中签发 API key。
每个 key 的 scope 都限定为一个 ad account。

在每个请求中将该 key 作为 bearer token 传入：

```bash
Authorization: Bearer $OPENAI_ADS_API_KEY
```

默认情况下，Advertiser API 在单个 Ad Account 的上下文中工作。如果你需要使用 API
管理多个 Ad Account，请[联系我们](https://openai.com/advertisers/)。

## Endpoints

| Resource      | Use for |
| ------------- | ------- |
| Campaigns     | 创建、列出、检索、更新 campaign，以及更改 campaign 状态。 |
| Ad Groups     | 创建、列出、检索、更新 ad group，以及更改 ad group 状态。 |
| Ads           | 创建、列出、检索、更新广告，以及更改广告状态。 |
| Product feeds | 使用商家 catalog 创建 product-feed campaign。 |
| Files         | 上传可在广告中使用的创意资产。 |
| Insights      | 在 ad account、campaign、ad group 和广告 scope 上检索效果数据。 |

所有资源都位于单个 Ad Account 内。

使用 [Quickstart](/mirror/ads/api-quickstart) 完成一个最小端到端流程，或直接查看 [API reference](/mirror/ads/api-reference/authentication)。若要基于商家 catalog 投放广告，请按照 [product feeds guide](/mirror/ads/product-feeds) 操作。

## Object Statuses

要让一条广告向用户展示，该广告以及它的父级 ad group 和 campaign 都必须处于 enabled 状态。此外，广告还必须经过 review。Review 通常只需要几分钟，你可以通过 `review_status` 字段监控进度。

## Rate limits

Advertiser API 同时按 ad account 和 IP address 执行限制：

| Scope        | Limit |
| ------------ | ----- |
| Per endpoint | 每分钟 600 个请求 |
| Overall      | 每分钟 1,200 个请求 |

请求必须同时保持在 ad-account 和 IP-address 限制内。

## OpenAPI spec


  {"下载 OpenAPI spec"}


## Changelog

### 2026 年 6 月 11 日

- 添加了按 product、country 和 device 细分的 insights，以及 zero-impression product 扩展。

### 2026 年 6 月 3 日

- 添加了地理定向支持，包括 `/geo_lookup/search` 以及 campaign `targeting.locations.include` 对 country、region 和 DMA location ID 的支持。
- 添加了用于 API key、pixel、event settings 和 conversion insights 的 conversion setup 与 reporting endpoint。

### v1

- 发布了初始 API 版本。

:::

## English source

::: details 展开英文原文
::: v-pre
The Advertiser API lets you manage ad campaigns, ad groups, ads, files, and
reporting from one API. It supports CRUD-like functions with standard JSON content types.

## Authentication

Issue an API key in the Settings tab of [Ads Manager](https://ads.openai.com).
Each key is scoped to one ad account.

Pass the key as a bearer token on every request:

```bash
Authorization: Bearer $OPENAI_ADS_API_KEY
```

By default, the Advertiser API works in the context of a single Ad Account. If
  you need to manage multiple Ad Accounts with the API, please [contact us](https://openai.com/advertisers/).

## Endpoints

| Resource      | Use for                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| Campaigns     | Create, list, retrieve, update, and change campaign state.                      |
| Ad Groups     | Create, list, retrieve, update, and change ad group state.                      |
| Ads           | Create, list, retrieve, update, and change ad state.                            |
| Product feeds | Use a merchant catalog to create product-feed campaigns.                        |
| Files         | Upload creative assets for use in ads.                                          |
| Insights      | Retrieve performance data across ad account, campaign, ad group, and ad scopes. |

All resources live inside a single Ad Account.

Use the [Quickstart](/mirror/ads/api-quickstart) for a minimal end-to-end workflow, or go
directly to the [API reference](/mirror/ads/api-reference/authentication). To advertise
from a merchant catalog, follow the [product feeds guide](/mirror/ads/product-feeds).

## Object Statuses

For an ad to show to users, the ad, and its parent ad group and campaign all have to be enabled. Further, the Ad has to be reviewed. Reviews typically only take a few minutes, you can monitor with the review_status field.

## Rate limits

The Advertiser API enforces limits by both ad account and IP address:

| Scope        | Limit                     |
| ------------ | ------------------------- |
| Per endpoint | 600 requests per minute   |
| Overall      | 1,200 requests per minute |

Requests must stay within both the ad-account and IP-address limits.

## OpenAPI spec


  {"Download the OpenAPI spec"}


## Changelog

### June 11th, 2026

- Added segmented insights for product, country, and device breakdowns, plus zero-impression product expansion.

### June 3rd, 2026

- Added geotargeting support, including `/geo_lookup/search` and campaign `targeting.locations.include` for country, region, and DMA location IDs.
- Added conversion setup and reporting endpoints for API keys, pixels, event settings, and conversion insights.

### v1

- Published the initial API version.

:::
:::

