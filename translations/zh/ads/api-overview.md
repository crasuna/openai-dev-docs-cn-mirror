---
status: needs-review
sourceId: "a986b298237a"
sourceChecksum: "a986b298237a173d5f7fe6424dcc0cf1edd2a105c80f81ccdeae96f42aa52d70"
sourceUrl: "https://developers.openai.com/ads/api-overview"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# 概览

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

使用 [Quickstart](https://developers.openai.com/ads/api-quickstart) 完成一个最小端到端流程，或直接查看 [API reference](https://developers.openai.com/ads/api-reference/authentication)。若要基于商家 catalog 投放广告，请按照 [product feeds guide](https://developers.openai.com/ads/product-feeds) 操作。

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

<a href="/ads/openapi.json" download>
  {"下载 OpenAPI spec"}
</a>

## Changelog

### 2026 年 6 月 11 日

- 添加了按 product、country 和 device 细分的 insights，以及 zero-impression product 扩展。

### 2026 年 6 月 3 日

- 添加了地理定向支持，包括 `/geo_lookup/search` 以及 campaign `targeting.locations.include` 对 country、region 和 DMA location ID 的支持。
- 添加了用于 API key、pixel、event settings 和 conversion insights 的 conversion setup 与 reporting endpoint。

### v1

- 发布了初始 API 版本。
