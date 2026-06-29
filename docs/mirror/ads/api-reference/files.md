---
title: "Files（文件）"
description: "Upload remote images or binary files and reuse the returned file ID in ad creatives."
outline: deep
---

# Files（文件）

**文档集**：广告<br>
**分组**：API 参考<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/ads/api-reference/files](https://developers.openai.com/ads/api-reference/files)
- Markdown 来源：[https://developers.openai.com/ads/api-reference/files.md](https://developers.openai.com/ads/api-reference/files.md)
- 抓取时间：2026-06-27T05:53:54.542Z
- Checksum：`b82b636e2a5f61df7ec336545e9bef15566a3c990eca286ca8a7b8ea92173df4`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 从图片 URL 上传

使用 JSON 上传远程图片，并接收可复用的 `file_id`。

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

## 上传二进制文件

同一 endpoint 也接受带有二进制文件的 `multipart/form-data`。

```bash
curl -X POST "https://api.ads.openai.com/v1/upload" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -F "file=@workspace-planner-card.png"
```

## 在广告中使用已上传文件

创建或更新 ad creative 时传入返回的 `file_id`。

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

:::

## English source

::: details 展开英文原文
::: v-pre
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

:::
:::

