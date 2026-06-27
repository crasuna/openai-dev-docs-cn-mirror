---
status: needs-review
sourceId: "76ca9675a324"
sourceChecksum: "76ca9675a324642c9ba70968d5d7b65aebdaed0843c2434d6d9b042a1969bea2"
sourceUrl: "https://developers.openai.com/ads/api-reference/ad-account"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# Ad Account

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
