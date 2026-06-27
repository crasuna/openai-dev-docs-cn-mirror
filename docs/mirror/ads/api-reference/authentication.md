---
title: "Authentication"
description: "Setting up bearer token authentication."
outline: deep
---

# Authentication

**文档集**：Ads  
**分组**：Ads — Api Reference  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/ads/api-reference/authentication](https://developers.openai.com/ads/api-reference/authentication)
- Markdown 来源：[https://developers.openai.com/ads/api-reference/authentication.md](https://developers.openai.com/ads/api-reference/authentication.md)
- 抓取时间：2026-06-27T05:53:53.789Z
- Checksum：`7fb6adf0669248cdda964f1c2f90d2cf5d68187ae2273a07625c00715a886780`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## Base URL

将 Ads API 请求发送到：

```text
https://api.ads.openai.com/v1
```

## Authorization

OpenAPI spec 定义了 bearer security scheme。请在每个请求中传入你的 Ads API key：

| Header          | Value |
| --------------- | ----- |
| `Authorization` | `Bearer $OPENAI_ADS_API_KEY` |

## Request formats

大多数 Ads API endpoint 接受 `application/json`。upload endpoint 支持两种请求格式：

- 带有 `image_url` 的 `application/json`
- 带有二进制 `file` 的 `multipart/form-data`

## 示例请求

使用 `GET /ad_account` 确认你的 bearer token 可用。

```bash
curl -X GET "https://api.ads.openai.com/v1/ad_account" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Accept: application/json"
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

:::

## English source

::: details 展开英文原文
::: v-pre
## Base URL

Send Ads API requests to:

```text
https://api.ads.openai.com/v1
```

## Authorization

The OpenAPI spec defines a bearer security scheme. Pass your Ads API key on
every request:

| Header          | Value                        |
| --------------- | ---------------------------- |
| `Authorization` | `Bearer $OPENAI_ADS_API_KEY` |

## Request formats

Most Ads API endpoints accept `application/json`. The upload endpoint supports
two request formats:

- `application/json` with an `image_url`
- `multipart/form-data` with a binary `file`

## Example request

Use `GET /ad_account` to confirm that your bearer token works.

```bash
curl -X GET "https://api.ads.openai.com/v1/ad_account" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Accept: application/json"
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

:::
:::

