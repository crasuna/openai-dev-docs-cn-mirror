# Files

## Upload from an image URL

Upload a remote image with JSON and receive a reusable `file_id`.

`POST /upload`

```bash
curl -X POST "https://api.ads.openai.com/v1/upload" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/assets/workspace-planner-card.png"
  }'
```

```json
{
  "file_id": "file_901"
}
```

## Upload a binary file

The same endpoint also accepts `multipart/form-data` with a binary file.

```bash
curl -X POST "https://api.ads.openai.com/v1/upload" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -F "file=@workspace-planner-card.png"
```

## Use the uploaded file in an ad

Pass the returned `file_id` when you create or update an ad creative.

`POST /ads`

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
