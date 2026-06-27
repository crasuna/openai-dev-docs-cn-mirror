---
title: "Batch API"
description: "Learn how to use OpenAI's Batch API for processing jobs with asynchronous requests, increased rate limits, and cost efficiency."
outline: deep
---

# Batch API

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/batch](https://developers.openai.com/api/docs/guides/batch)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/batch.md](https://developers.openai.com/api/docs/guides/batch.md)
- 抓取时间：2026-06-27T05:53:59.506Z
- Checksum：`359e5395563ecff3c1b6380b0c8ab0337db70651321f201185b2d84fcd8bd77a`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
了解如何使用 OpenAI 的 Batch API 发送异步请求组：成本降低 50%，使用一组单独且显著更高的速率限制，并提供明确的 24 小时完成时限。该服务非常适合处理不需要即时响应的任务。你也可以[在这里直接查看 API reference](https://developers.openai.com/api/docs/api-reference/batch)。

## 概览

OpenAI Platform 的某些使用场景需要发送同步请求，但也有许多情况下，请求并不需要立即响应，或者 [rate limits](/mirror/api/docs/guides/rate-limits) 会阻止你快速执行大量查询。批处理作业通常适用于以下用例：

1. 运行评估
2. 对大型数据集进行分类
3. 为内容仓库生成 embedding
4. 将大型离线视频渲染任务排队

Batch API 提供了一组直观的端点，让你可以把一组请求收集到单个文件中，启动一个批处理作业来执行这些请求，在底层请求执行期间查询该 batch 的状态，并在 batch 完成后取回汇总结果。

与直接使用标准端点相比，Batch API 具有：

1. **更好的成本效率：** 与同步 API 相比享受 50% 的成本折扣
2. **更高的速率限制：** 与同步 API 相比拥有[显著更多余量](https://platform.openai.com/settings/organization/limits)
3. **快速完成时间：** 每个 batch 都会在 24 小时内完成（并且通常更快）

## 快速开始

### 1. 准备你的 batch 文件

Batch 从一个 `.jsonl` 文件开始，其中每一行都包含对 API 发起的单个请求的详细信息。目前可用的端点包括：

- `/v1/responses` ([Responses API](https://developers.openai.com/api/docs/api-reference/responses))
- `/v1/chat/completions` ([Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat))
- `/v1/embeddings` ([Embeddings API](https://developers.openai.com/api/docs/api-reference/embeddings))
- `/v1/completions` ([Completions API](https://developers.openai.com/api/docs/api-reference/completions))
- `/v1/moderations` ([Moderations guide](/mirror/api/docs/guides/moderation))
- `/v1/images/generations` ([Images API](https://developers.openai.com/api/docs/api-reference/images))
- `/v1/images/edits` ([Images API](https://developers.openai.com/api/docs/api-reference/images))
- `/v1/videos` ([Video generation guide](/mirror/api/docs/guides/video-generation))

对于给定的输入文件，每一行 `body` 字段中的参数都与底层端点的参数相同。每个请求都必须包含一个唯一的 `custom_id` 值，你可以在完成后用它来引用结果。下面是一个包含 2 个请求的输入文件示例。请注意，每个输入文件只能包含发往单个模型的请求。

在 Batch 中生成视频时：

- Batch 目前仅支持 `POST /v1/videos`。
- 视频的 Batch 请求必须使用 JSON，而不是 multipart。
- 请提前上传资产，并在请求正文中传入受支持的资产引用，而不是使用 multipart 上传。
- 在 Batch 中进行图像引导生成时，使用 `input_reference`。在 JSON 请求中，将 `input_reference` 作为对象传入，其中包含 `file_id` 或 `image_url`。
- Batch 不支持 multipart `input_reference` 上传，包括视频参考输入。
- Batch 生成的视频会在 batch 完成后的最多 `24` 小时内可供下载。

当目标端点为 `/v1/moderations` 时，请在每个请求正文中包含 `input` 字段。Batch 接受纯文本输入，也接受在 `omni-moderation-latest` 中使用文本或图像输入的内容数组。Batch worker 会拒绝设置了 `stream=true` 的请求，这与同步 moderation 端点保持一致。

```jsonl
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-3.5-turbo-0125", "messages": [{"role": "system", "content": "You are a helpful assistant."},{"role": "user", "content": "Hello world!"}],"max_tokens": 1000}}
{"custom_id": "request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-3.5-turbo-0125", "messages": [{"role": "system", "content": "You are an unhelpful assistant."},{"role": "user", "content": "Hello world!"}],"max_tokens": 1000}}
```

#### Moderations 输入示例

纯文本请求：

```jsonl
{
  "custom_id": "moderation-text-1",
  "method": "POST",
  "url": "/v1/moderations",
  "body": {
    "model": "omni-moderation-latest",
    "input": "This is a harmless test sentence."
  }
}
```

多模态请求：

```jsonl
{
  "custom_id": "moderation-mm-1",
  "method": "POST",
  "url": "/v1/moderations",
  "body": {
    "model": "omni-moderation-latest",
    "input": [
      {
        "type": "text",
        "text": "Describe this image"
      },
      {
        "type": "image_url",
        "image_url": {
          "url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg"
        }
      }
    ]
  }
}
```

建议使用 `image_url` 引用远程资产（而不是 base64 blob），这样可以让你的 `.jsonl` 文件远低于 200&nbsp;MB 的 Batch 上传限制，尤其适用于多模态 Moderations 请求。

### 2. 上传 batch 输入文件

与我们的 [Fine-tuning API](/mirror/api/docs/guides/model-optimization) 类似，你必须先上传输入文件，这样在启动 batch 时才能正确引用它。请使用 [Files API](https://developers.openai.com/api/docs/api-reference/files) 上传你的 `.jsonl` 文件。

为 Batch API 上传文件

```javascript
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI();

const file = await openai.files.create({
  file: fs.createReadStream("batchinput.jsonl"),
  purpose: "batch",
});

console.log(file);
```

```python
from openai import OpenAI
client = OpenAI()

batch_input_file = client.files.create(
    file=open("batchinput.jsonl", "rb"),
    purpose="batch"
)

print(batch_input_file)
```

```bash
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="batch" \
  -F file="@batchinput.jsonl"
```

```bash
openai files create \
  --file batchinput.jsonl \
  --purpose batch
```


### 3. 创建 batch

成功上传输入文件后，你可以使用输入 File 对象的 ID 来创建 batch。在这个例子中，假设文件 ID 是 `file-abc123`。目前，completion window 只能设置为 `24h`。你也可以通过可选的 `metadata` 参数提供自定义元数据。

创建 Batch

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const batch = await openai.batches.create({
  input_file_id: "file-abc123",
  endpoint: "/v1/chat/completions",
  completion_window: "24h"
});

console.log(batch);
```

```python
from openai import OpenAI
client = OpenAI()

batch_input_file_id = batch_input_file.id
client.batches.create(
    input_file_id=batch_input_file_id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
    metadata={
        "description": "nightly eval job"
    }
)
```

```bash
curl https://api.openai.com/v1/batches \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-abc123",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'
```

```bash
openai batches create \
  --input-file-id file-abc123 \
  --endpoint /v1/chat/completions \
  --completion-window 24h
```


此请求将返回一个 [Batch object](https://developers.openai.com/api/docs/api-reference/batch/object)，其中包含你的 batch 元数据：

```python
{
  "id": "batch_abc123",
  "object": "batch",
  "endpoint": "/v1/chat/completions",
  "errors": null,
  "input_file_id": "file-abc123",
  "completion_window": "24h",
  "status": "validating",
  "output_file_id": null,
  "error_file_id": null,
  "created_at": 1714508499,
  "in_progress_at": null,
  "expires_at": 1714536634,
  "completed_at": null,
  "failed_at": null,
  "expired_at": null,
  "request_counts": {
    "total": 0,
    "completed": 0,
    "failed": 0
  },
  "metadata": null
}
```

### 4. 检查 batch 状态

你可以随时检查 batch 状态，这同样会返回一个 Batch object。

检查 batch 状态

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const batch = await openai.batches.retrieve("batch_abc123");
console.log(batch);
```

```python
from openai import OpenAI
client = OpenAI()

batch = client.batches.retrieve("batch_abc123")
print(batch)
```

```bash
curl https://api.openai.com/v1/batches/batch_abc123 \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json"
```

```bash
openai batches retrieve \
  --batch-id batch_abc123
```


给定 Batch object 的状态可以是以下任一值：

| 状态          | 说明                                                                           |
| ------------- | ------------------------------------------------------------------------------ |
| `validating`  | 批处理开始前正在验证输入文件                                                   |
| `failed`      | 输入文件未通过验证流程                                                         |
| `in_progress` | 输入文件已成功验证，batch 当前正在运行                                         |
| `finalizing`  | batch 已完成，正在准备结果                                                     |
| `completed`   | batch 已完成，结果已准备就绪                                                   |
| `expired`     | batch 未能在 24 小时时间窗口内完成                                             |
| `cancelling`  | batch 正在取消（最多可能需要 10 分钟）                                         |
| `cancelled`   | batch 已取消                                                                   |

### 5. 取回结果

batch 完成后，你可以通过 Batch object 的 `output_file_id` 字段，向 [Files API](https://developers.openai.com/api/docs/api-reference/files) 发起请求来下载输出，并将其写入本机文件；在此例中写入 `batch_output.jsonl`。

取回 batch 结果

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const fileResponse = await openai.files.content("file-xyz123");
const fileContents = await fileResponse.text();

console.log(fileContents);
```

```python
from openai import OpenAI
client = OpenAI()

file_response = client.files.content("file-xyz123")
print(file_response.text)
```

```bash
curl https://api.openai.com/v1/files/file-xyz123/content \
  -H "Authorization: Bearer $OPENAI_API_KEY" > batch_output.jsonl
```

```bash
openai files content \
  --file-id file-xyz123 \
  --output batch_output.jsonl
```


输出 `.jsonl` 文件会为输入文件中的每个成功请求行包含一行响应。batch 中任何失败的请求都会把错误信息写入一个 error file，该文件可通过 batch 的 `error_file_id` 找到。

对于 `/v1/videos`，完成的 batch 结果包含已经到达终态的视频对象，例如 `completed`、`failed` 或 `expired`。你可以使用返回的视频 ID，在 batch 完成后立即下载最终资产。

请注意，输出行顺序**可能与**输入行顺序不一致。不要依赖顺序来处理结果，而应使用 `custom_id` 字段；该字段会出现在输出文件的每一行中，使你能够将输入中的请求映射到输出中的结果。

```jsonl
{"id": "batch_req_123", "custom_id": "request-2", "response": {"status_code": 200, "request_id": "req_123", "body": {"id": "chatcmpl-123", "object": "chat.completion", "created": 1711652795, "model": "gpt-3.5-turbo-0125", "choices": [{"index": 0, "message": {"role": "assistant", "content": "Hello."}, "logprobs": null, "finish_reason": "stop"}], "usage": {"prompt_tokens": 22, "completion_tokens": 2, "total_tokens": 24}, "system_fingerprint": "fp_123"}}, "error": null}
{"id": "batch_req_456", "custom_id": "request-1", "response": {"status_code": 200, "request_id": "req_789", "body": {"id": "chatcmpl-abc", "object": "chat.completion", "created": 1711652789, "model": "gpt-3.5-turbo-0125", "choices": [{"index": 0, "message": {"role": "assistant", "content": "Hello! How can I assist you today?"}, "logprobs": null, "finish_reason": "stop"}], "usage": {"prompt_tokens": 20, "completion_tokens": 9, "total_tokens": 29}, "system_fingerprint": "fp_3ba"}}, "error": null}
```

输出文件会在 batch 完成 30 天后自动删除。

### 6. 取消 batch

如有必要，你可以取消正在进行的 batch。batch 状态会变为 `cancelling`，直到正在执行的请求完成（最多 10 分钟），之后状态会变为 `cancelled`。

取消 batch

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const batch = await openai.batches.cancel("batch_abc123");
console.log(batch);
```

```python
from openai import OpenAI
client = OpenAI()

client.batches.cancel("batch_abc123")
```

```bash
curl https://api.openai.com/v1/batches/batch_abc123/cancel \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST
```

```bash
openai batches cancel \
  --batch-id batch_abc123
```


### 7. 获取所有 batch 的列表

你可以随时查看自己的所有 batch。对于拥有大量 batch 的用户，可以使用 `limit` 和 `after` 参数对结果分页。

获取所有 batch 的列表

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const list = await openai.batches.list();

for await (const batch of list) {
  console.log(batch);
}
```

```python
from openai import OpenAI
client = OpenAI()

client.batches.list(limit=10)
```

```bash
curl https://api.openai.com/v1/batches?limit=10 \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json"
```

```bash
openai batches list \
  --limit 10
```


## 模型可用性

Batch API 在我们的大多数模型中广泛可用，但并非全部模型都支持。请参考 [model reference docs](https://developers.openai.com/api/docs/models)，确保你使用的模型支持 Batch API。

## 速率限制

Batch API 的速率限制独立于现有的按模型速率限制。Batch API 有三类速率限制：

1. **每个 batch 的限制：** 单个 batch 最多可包含 50,000 个请求，batch 输入文件大小最多为 200 MB。请注意，`/v1/embeddings` batch 还限制为整个 batch 中最多 50,000 个 embedding 输入。
2. **每个模型排队的 prompt token：** 每个模型都有一个允许用于 batch 处理的最大排队 prompt token 数。你可以在 [Platform Settings page](https://platform.openai.com/settings/organization/limits) 查看这些限制。
3. **Batch 创建速率限制：** 你每小时最多可以创建 2,000 个 batch。如果需要提交更多请求，请增加每个 batch 中的请求数量。

目前 Batch API 对输出 token 没有限制。由于 Batch API 的速率限制是一个新的独立池，**使用 Batch API 不会消耗你的标准按模型速率限制中的 token**，因此它提供了一种方便的方式，让你在查询我们的 API 时增加可用请求数和可处理 token 数。

## Batch 过期

未能及时完成的 batch 最终会进入 `expired` 状态；该 batch 中未完成的请求会被取消，已完成请求的任何响应都会通过 batch 的输出文件提供。你需要为任何已完成请求所消耗的 token 付费。

过期请求会写入你的 error file，消息如下所示。你可以使用 `custom_id` 取回过期请求的请求数据。

```jsonl
{"id": "batch_req_123", "custom_id": "request-3", "response": null, "error": {"code": "batch_expired", "message": "This request could not be executed before the completion window expired."}}
{"id": "batch_req_123", "custom_id": "request-7", "response": null, "error": {"code": "batch_expired", "message": "This request could not be executed before the completion window expired."}}
```

:::

## English source

::: details 展开英文原文
::: v-pre
Learn how to use OpenAI's Batch API to send asynchronous groups of requests with 50% lower costs, a separate pool of significantly higher rate limits, and a clear 24-hour turnaround time. The service is ideal for processing jobs that don't require immediate responses. You can also [explore the API reference directly here](https://developers.openai.com/api/docs/api-reference/batch).

## Overview

While some uses of the OpenAI Platform require you to send synchronous requests, there are many cases where requests do not need an immediate response or [rate limits](/mirror/api/docs/guides/rate-limits) prevent you from executing a large number of queries quickly. Batch processing jobs are often helpful in use cases like:

1. Running evaluations
2. Classifying large datasets
3. Embedding content repositories
4. Queuing large offline video-render jobs

The Batch API offers a straightforward set of endpoints that allow you to collect a set of requests into a single file, kick off a batch processing job to execute these requests, query for the status of that batch while the underlying requests execute, and eventually retrieve the collected results when the batch is complete.

Compared to using standard endpoints directly, Batch API has:

1. **Better cost efficiency:** 50% cost discount compared to synchronous APIs
2. **Higher rate limits:** [Substantially more headroom](https://platform.openai.com/settings/organization/limits) compared to the synchronous APIs
3. **Fast completion times:** Each batch completes within 24 hours (and often more quickly)

## Getting started

### 1. Prepare your batch file

Batches start with a `.jsonl` file where each line contains the details of an individual request to the API. For now, the available endpoints are:

- `/v1/responses` ([Responses API](https://developers.openai.com/api/docs/api-reference/responses))
- `/v1/chat/completions` ([Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat))
- `/v1/embeddings` ([Embeddings API](https://developers.openai.com/api/docs/api-reference/embeddings))
- `/v1/completions` ([Completions API](https://developers.openai.com/api/docs/api-reference/completions))
- `/v1/moderations` ([Moderations guide](/mirror/api/docs/guides/moderation))
- `/v1/images/generations` ([Images API](https://developers.openai.com/api/docs/api-reference/images))
- `/v1/images/edits` ([Images API](https://developers.openai.com/api/docs/api-reference/images))
- `/v1/videos` ([Video generation guide](/mirror/api/docs/guides/video-generation))

For a given input file, the parameters in each line's `body` field are the same as the parameters for the underlying endpoint. Each request must include a unique `custom_id` value, which you can use to reference results after completion. Here's an example of an input file with 2 requests. Note that each input file can only include requests to a single model.

For video generation in Batch:

- Batch currently supports `POST /v1/videos` only.
- Batch requests for videos must use JSON, not multipart.
- Upload assets ahead of time and pass supported asset references in the request body rather than using multipart uploads.
- Use `input_reference` for image-guided generations in Batch. In JSON requests, pass `input_reference` as an object with either `file_id` or `image_url`.
- Multipart `input_reference` uploads, including video reference inputs, aren't supported in Batch.
- Batch-generated videos are available for download for up to `24` hours after the batch completes.

When targeting `/v1/moderations`, include an `input` field in every request body. Batch accepts plain-text inputs and content arrays with text or image inputs using `omni-moderation-latest`. The Batch worker rejects requests that set `stream=true`, matching the synchronous moderation endpoint.

```jsonl
{"custom_id": "request-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-3.5-turbo-0125", "messages": [{"role": "system", "content": "You are a helpful assistant."},{"role": "user", "content": "Hello world!"}],"max_tokens": 1000}}
{"custom_id": "request-2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-3.5-turbo-0125", "messages": [{"role": "system", "content": "You are an unhelpful assistant."},{"role": "user", "content": "Hello world!"}],"max_tokens": 1000}}
```

#### Moderations input examples

Text-only request:

```jsonl
{
  "custom_id": "moderation-text-1",
  "method": "POST",
  "url": "/v1/moderations",
  "body": {
    "model": "omni-moderation-latest",
    "input": "This is a harmless test sentence."
  }
}
```

Multimodal request:

```jsonl
{
  "custom_id": "moderation-mm-1",
  "method": "POST",
  "url": "/v1/moderations",
  "body": {
    "model": "omni-moderation-latest",
    "input": [
      {
        "type": "text",
        "text": "Describe this image"
      },
      {
        "type": "image_url",
        "image_url": {
          "url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg"
        }
      }
    ]
  }
}
```

Prefer referencing remote assets with `image_url` (instead of base64 blobs) to
  keep your `.jsonl` files well below the 200&nbsp;MB Batch upload limit,
  especially for multimodal Moderations requests.

### 2. Upload your batch input file

Similar to our [Fine-tuning API](/mirror/api/docs/guides/model-optimization), you must first upload your input file so that you can reference it correctly when kicking off batches. Upload your `.jsonl` file using the [Files API](https://developers.openai.com/api/docs/api-reference/files).

Upload files for Batch API

```javascript
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI();

const file = await openai.files.create({
  file: fs.createReadStream("batchinput.jsonl"),
  purpose: "batch",
});

console.log(file);
```

```python
from openai import OpenAI
client = OpenAI()

batch_input_file = client.files.create(
    file=open("batchinput.jsonl", "rb"),
    purpose="batch"
)

print(batch_input_file)
```

```bash
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="batch" \
  -F file="@batchinput.jsonl"
```

```bash
openai files create \
  --file batchinput.jsonl \
  --purpose batch
```


### 3. Create the batch

Once you've successfully uploaded your input file, you can use the input File object's ID to create a batch. In this case, let's assume the file ID is `file-abc123`. For now, the completion window can only be set to `24h`. You can also provide custom metadata via an optional `metadata` parameter.

Create the Batch

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const batch = await openai.batches.create({
  input_file_id: "file-abc123",
  endpoint: "/v1/chat/completions",
  completion_window: "24h"
});

console.log(batch);
```

```python
from openai import OpenAI
client = OpenAI()

batch_input_file_id = batch_input_file.id
client.batches.create(
    input_file_id=batch_input_file_id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
    metadata={
        "description": "nightly eval job"
    }
)
```

```bash
curl https://api.openai.com/v1/batches \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input_file_id": "file-abc123",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'
```

```bash
openai batches create \
  --input-file-id file-abc123 \
  --endpoint /v1/chat/completions \
  --completion-window 24h
```


This request will return a [Batch object](https://developers.openai.com/api/docs/api-reference/batch/object) with metadata about your batch:

```python
{
  "id": "batch_abc123",
  "object": "batch",
  "endpoint": "/v1/chat/completions",
  "errors": null,
  "input_file_id": "file-abc123",
  "completion_window": "24h",
  "status": "validating",
  "output_file_id": null,
  "error_file_id": null,
  "created_at": 1714508499,
  "in_progress_at": null,
  "expires_at": 1714536634,
  "completed_at": null,
  "failed_at": null,
  "expired_at": null,
  "request_counts": {
    "total": 0,
    "completed": 0,
    "failed": 0
  },
  "metadata": null
}
```

### 4. Check the status of a batch

You can check the status of a batch at any time, which will also return a Batch object.

Check the status of a batch

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const batch = await openai.batches.retrieve("batch_abc123");
console.log(batch);
```

```python
from openai import OpenAI
client = OpenAI()

batch = client.batches.retrieve("batch_abc123")
print(batch)
```

```bash
curl https://api.openai.com/v1/batches/batch_abc123 \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json"
```

```bash
openai batches retrieve \
  --batch-id batch_abc123
```


The status of a given Batch object can be any of the following:

| Status        | Description                                                                    |
| ------------- | ------------------------------------------------------------------------------ |
| `validating`  | the input file is being validated before the batch can begin                   |
| `failed`      | the input file has failed the validation process                               |
| `in_progress` | the input file was successfully validated and the batch is currently being run |
| `finalizing`  | the batch has completed and the results are being prepared                     |
| `completed`   | the batch has been completed and the results are ready                         |
| `expired`     | the batch was not able to be completed within the 24-hour time window          |
| `cancelling`  | the batch is being cancelled (may take up to 10 minutes)                       |
| `cancelled`   | the batch was cancelled                                                        |

### 5. Retrieve the results

Once the batch is complete, you can download the output by making a request against the [Files API](https://developers.openai.com/api/docs/api-reference/files) via the `output_file_id` field from the Batch object and writing it to a file on your machine, in this case `batch_output.jsonl`

Retrieving the batch results

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const fileResponse = await openai.files.content("file-xyz123");
const fileContents = await fileResponse.text();

console.log(fileContents);
```

```python
from openai import OpenAI
client = OpenAI()

file_response = client.files.content("file-xyz123")
print(file_response.text)
```

```bash
curl https://api.openai.com/v1/files/file-xyz123/content \
  -H "Authorization: Bearer $OPENAI_API_KEY" > batch_output.jsonl
```

```bash
openai files content \
  --file-id file-xyz123 \
  --output batch_output.jsonl
```


The output `.jsonl` file will have one response line for every successful request line in the input file. Any failed requests in the batch will have their error information written to an error file that can be found via the batch's `error_file_id`.

For `/v1/videos`, a completed batch result contains video objects that have already reached a terminal state such as `completed`, `failed`, or `expired`. You can use the returned video IDs to download final assets immediately after the batch finishes.

Note that the output line order **may not match** the input line order.
  Instead of relying on order to process your results, use the custom_id field
  which will be present in each line of your output file and allow you to map
  requests in your input to results in your output.

```jsonl
{"id": "batch_req_123", "custom_id": "request-2", "response": {"status_code": 200, "request_id": "req_123", "body": {"id": "chatcmpl-123", "object": "chat.completion", "created": 1711652795, "model": "gpt-3.5-turbo-0125", "choices": [{"index": 0, "message": {"role": "assistant", "content": "Hello."}, "logprobs": null, "finish_reason": "stop"}], "usage": {"prompt_tokens": 22, "completion_tokens": 2, "total_tokens": 24}, "system_fingerprint": "fp_123"}}, "error": null}
{"id": "batch_req_456", "custom_id": "request-1", "response": {"status_code": 200, "request_id": "req_789", "body": {"id": "chatcmpl-abc", "object": "chat.completion", "created": 1711652789, "model": "gpt-3.5-turbo-0125", "choices": [{"index": 0, "message": {"role": "assistant", "content": "Hello! How can I assist you today?"}, "logprobs": null, "finish_reason": "stop"}], "usage": {"prompt_tokens": 20, "completion_tokens": 9, "total_tokens": 29}, "system_fingerprint": "fp_3ba"}}, "error": null}
```

The output file will automatically be deleted 30 days after the batch is complete.

### 6. Cancel a batch

If necessary, you can cancel an ongoing batch. The batch's status will change to `cancelling` until in-flight requests are complete (up to 10 minutes), after which the status will change to `cancelled`.

Cancelling a batch

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const batch = await openai.batches.cancel("batch_abc123");
console.log(batch);
```

```python
from openai import OpenAI
client = OpenAI()

client.batches.cancel("batch_abc123")
```

```bash
curl https://api.openai.com/v1/batches/batch_abc123/cancel \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST
```

```bash
openai batches cancel \
  --batch-id batch_abc123
```


### 7. Get a list of all batches

At any time, you can see all your batches. For users with many batches, you can use the `limit` and `after` parameters to paginate your results.

Getting a list of all batches

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const list = await openai.batches.list();

for await (const batch of list) {
  console.log(batch);
}
```

```python
from openai import OpenAI
client = OpenAI()

client.batches.list(limit=10)
```

```bash
curl https://api.openai.com/v1/batches?limit=10 \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json"
```

```bash
openai batches list \
  --limit 10
```


## Model availability

The Batch API is widely available across most of our models, but not all. Please refer to the [model reference docs](https://developers.openai.com/api/docs/models) to ensure the model you're using supports the Batch API.

## Rate limits

Batch API rate limits are separate from existing per-model rate limits. The Batch API has three types of rate limits:

1. **Per-batch limits:** A single batch may include up to 50,000 requests, and a batch input file can be up to 200 MB in size. Note that `/v1/embeddings` batches are also restricted to a maximum of 50,000 embedding inputs across all requests in the batch.
2. **Enqueued prompt tokens per model:** Each model has a maximum number of enqueued prompt tokens allowed for batch processing. You can find these limits on the [Platform Settings page](https://platform.openai.com/settings/organization/limits).
3. **Batch creation rate limit:** You can create up to 2,000 batches per hour. If you need to submit more requests, increase the number of requests per batch.

There are no limits for output tokens for the Batch API today. Because Batch API rate limits are a new, separate pool, **using the Batch API will not consume tokens from your standard per-model rate limits**, thereby offering you a convenient way to increase the number of requests and processed tokens you can use when querying our API.

## Batch expiration

Batches that do not complete in time eventually move to an `expired` state; unfinished requests within that batch are cancelled, and any responses to completed requests are made available via the batch's output file. You will be charged for tokens consumed from any completed requests.

Expired requests will be written to your error file with the message as shown below. You can use the `custom_id` to retrieve the request data for expired requests.

```jsonl
{"id": "batch_req_123", "custom_id": "request-3", "response": null, "error": {"code": "batch_expired", "message": "This request could not be executed before the completion window expired."}}
{"id": "batch_req_123", "custom_id": "request-7", "response": null, "error": {"code": "batch_expired", "message": "This request could not be executed before the completion window expired."}}
```

:::
:::

