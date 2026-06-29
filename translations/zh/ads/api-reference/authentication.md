---
status: needs-review
sourceId: "7fb6adf06692"
sourceChecksum: "7fb6adf0669248cdda964f1c2f90d2cf5d68187ae2273a07625c00715a886780"
sourceUrl: "https://developers.openai.com/ads/api-reference/authentication"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# 认证

## Base URL（基础 URL）

将 Ads API 请求发送到：

```text
https://api.ads.openai.com/v1
```

## Authorization（授权）

OpenAPI spec 定义了 bearer security scheme。请在每个请求中传入你的 Ads API key：

| Header          | 值 |
| --------------- | ----- |
| `Authorization` | `Bearer $OPENAI_ADS_API_KEY` |

## 请求格式

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
