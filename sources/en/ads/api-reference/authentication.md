# Authentication

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
