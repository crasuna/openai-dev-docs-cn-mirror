# Ad Account

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
