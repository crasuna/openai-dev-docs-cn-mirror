---
title: "Ad Account（广告账户）"
description: "Retrieve metadata for the current ad account."
outline: deep
---

# Ad Account（广告账户）

**文档集**：广告<br>
**分组**：API 参考<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/ads/api-reference/ad-account](https://developers.openai.com/ads/api-reference/ad-account)
- Markdown 来源：[https://developers.openai.com/ads/api-reference/ad-account.md](https://developers.openai.com/ads/api-reference/ad-account.md)
- 抓取时间：2026-06-27T05:53:53.889Z
- Checksum：`76ca9675a324642c9ba70968d5d7b65aebdaed0843c2434d6d9b042a1969bea2`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 获取 ad account metadata

获取当前 ad account 的 metadata。

`GET /ad_account`

此 endpoint 不接受请求体或查询参数。

```bash
curl -X GET "https://api.ads.openai.com/v1/ad_account" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

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

响应包括：

- ad account 的 `id`
- display name 的 `name`
- primary destination 的 `url`
- 有可用 preview destination 时的 `preview_url`
- ad account timezone 的 `timezone`
- account currency 的 `currency_code`

:::

## English source

::: details 展开英文原文
::: v-pre
## Get ad account metadata

Fetch metadata for the current ad account.

`GET /ad_account`

This endpoint takes no request body or query parameters.

```bash
curl -X GET "https://api.ads.openai.com/v1/ad_account" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY"
```

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

The response includes:

- `id` for the ad account
- `name` for the display name
- `url` for the primary destination
- `preview_url` when a preview destination is available
- `timezone` for the ad account timezone
- `currency_code` for the account currency

:::
:::

