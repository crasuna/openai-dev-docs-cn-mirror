---
title: "使用 GPT Actions 发送和返回文件"
description: "Learn how to send and return files using GPT Actions in the OpenAI API."
outline: deep
---

# 使用 GPT Actions 发送和返回文件

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/actions/sending-files](https://developers.openai.com/api/docs/actions/sending-files)
- Markdown 来源：[https://developers.openai.com/api/docs/actions/sending-files.md](https://developers.openai.com/api/docs/actions/sending-files.md)
- 抓取时间：2026-06-27T05:53:56.036Z
- Checksum：`c358f8d870de601f3294928c50850891e1c6bb981f878f6edc8e6dc56a0cf78b`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 发送文件

POST 请求最多可以包含来自对话的十个文件（包括 DALL-E 生成的图片）。它们会以 URL 形式发送，有效期为五分钟。

要让文件成为 POST 请求的一部分，参数必须命名为 `openaiFileIdRefs`，并且 description 应该向模型说明你的 API 期望的文件类型和数量。

`openaiFileIdRefs` 参数会被填充为 JSON objects 数组。每个 object 包含：

- `name` 文件名。如果文件由 DALL-E 创建，这将是自动生成的名称。
- `id` 文件的稳定标识符。
- `mime_type` 文件的 MIME type。对于用户上传的文件，这基于文件扩展名。
- `download_link` 用于获取文件的 URL，有效期为五分钟。

下面是一个包含两个元素的 `openaiFileIdRefs` 数组示例：

```json
[
  {
    "name": "dalle-Lh2tg7WuosbyR9hk",
    "id": "file-XFlOqJYTPBPwMZE3IopCBv1Z",
    "mime_type": "image/webp",
    "download_link": "https://files.oaiusercontent.com/file-XFlOqJYTPBPwMZE3IopCBv1Z?se=2024-03-11T20%3A29%3A52Z&sp=r&sv=2021-08-06&sr=b&rscc=max-age%3D31536000%2C%20immutable&rscd=attachment%3B%20filename%3Da580bae6-ea30-478e-a3e2-1f6c06c3e02f.webp&sig=ZPWol5eXACxU1O9azLwRNgKVidCe%2BwgMOc/TdrPGYII%3D"
  },
  {
    "name": "2023 Benefits Booklet.pdf",
    "id": "file-s5nX7o4junn2ig0J84r8Q0Ew",
    "mime_type": "application/pdf",
    "download_link": "https://files.oaiusercontent.com/file-s5nX7o4junn2ig0J84r8Q0Ew?se=2024-03-11T20%3A29%3A52Z&sp=r&sv=2021-08-06&sr=b&rscc=max-age%3D299%2C%20immutable&rscd=attachment%3B%20filename%3D2023%2520Benefits%2520Booklet.pdf&sig=Ivhviy%2BrgoyUjxZ%2BingpwtUwsA4%2BWaRfXy8ru9AfcII%3D"
  }
]
```

Actions 可以包含用户上传的文件、DALL-E 生成的图片，以及 Code Interpreter 创建的文件。

### OpenAPI 示例

```yaml
/createWidget:
  post:
    operationId: createWidget
    summary: Creates a widget based on an image.
    description: Uploads a file reference using its file id. This file should be an image created by DALL·E or uploaded by the user. JPG, WEBP, and PNG are supported for widget creation.
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              openaiFileIdRefs:
                type: array
                items:
                  type: string
```

虽然此 schema 显示 `openaiFileIdRefs` 是 `string` 类型的数组，但在运行时它会被填充为前面所示的 JSON objects 数组。

## 返回文件

请求最多可返回 10 个文件。每个文件最大为 10 MB，且不能是图片或视频。

这些文件会像用户上传的文件一样成为对话的一部分，也就是说，它们可能会提供给 code interpreter、file search，并作为后续 action invocations 的一部分发送。在 web app 中，用户会看到文件已返回并可以下载。

要返回文件，响应 body 必须包含 `openaiFileResponse` 参数。该参数必须始终是数组，并且必须以两种方式之一填充。

### Inline option

数组中的每个元素都是一个 JSON object，包含：

- `name` 文件名。它会对用户可见。
- `mime_type` 文件的 MIME type。它用于判断资格以及哪些功能可以访问该文件。
- `content` 文件内容的 base64 编码。

下面是一个包含两个元素的 openaiFileResponse 数组示例：

```json
[
  {
    "name": "example_document.pdf",
    "mime_type": "application/pdf",
    "content": "JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGggNiAwIFIvRmlsdGVyIC9GbGF0ZURlY29kZT4+CnN0cmVhbQpHhD93PQplbmRzdHJlYW0KZW5kb2JqCg=="
  },
  {
    "name": "sample_spreadsheet.csv",
    "mime_type": "text/csv",
    "content": "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
  }
]
```

OpenAPI 示例

```yaml
/papers:
  get:
    operationId: findPapers
    summary: Retrieve PDFs of relevant academic papers.
    description: Provided an academic topic, up to five relevant papers will be returned as PDFs.
    parameters:
      - in: query
        name: topic
        required: true
        schema:
          type: string
        description: The topic the papers should be about.
    responses:
      "200":
        description: Zero to five academic paper PDFs
        content:
          application/json:
            schema:
              type: object
              properties:
                openaiFileResponse:
                  type: array
                  items:
                    type: object
                    properties:
                      name:
                        type: string
                        description: The name of the file.
                      mime_type:
                        type: string
                        description: The MIME type of the file.
                      content:
                        type: string
                        format: byte
                        description: The content of the file in base64 encoding.
```

### URL option

数组中的每个元素都是一个引用待下载文件的 URL。必须设置 `Content-Disposition` 和 `Content-Type` headers，以便确定文件名和 MIME type。文件名会对用户可见。文件的 MIME type 会决定资格以及哪些功能可以访问该文件。

获取每个文件有 10 秒超时。

下面是一个包含两个元素的 `openaiFileResponse` 数组示例：

```json
[
  "https://example.com/f/dca89f18-16d4-4a65-8ea2-ededced01646",
  "https://example.com/f/01fad6b0-635b-4803-a583-0f678b2e6153"
]
```

下面是每个 URL 所需 headers 的示例：

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="example_document.pdf"
```

OpenAPI 示例

```yaml
/papers:
  get:
    operationId: findPapers
    summary: Retrieve PDFs of relevant academic papers.
    description: Provided an academic topic, up to five relevant papers will be returned as PDFs.
    parameters:
      - in: query
        name: topic
        required: true
        schema:
          type: string
        description: The topic the papers should be about.
    responses:
      '200':
        description: Zero to five academic paper PDFs
        content:
            application/json:
              schema:
                type: object
                properties:
                  openaiFileResponse:
                    type: array
                    items:
                    type: string
                    format: uri
                    description: URLs to fetch the files.
```

:::

## English source

::: details 展开英文原文
::: v-pre
## Sending files

POST requests can include up to ten files (including DALL-E generated images) from the conversation. They will be sent as URLs which are valid for five minutes.

For files to be part of your POST request, the parameter must be named `openaiFileIdRefs` and the description should explain to the model the type and quantity of the files which your API is expecting.

The `openaiFileIdRefs` parameter will be populated with an array of JSON objects. Each object contains:

- `name` The name of the file. This will be an auto generated name when created by DALL-E.
- `id` A stable identifier for the file.
- `mime_type` The mime type of the file. For user uploaded files this is based on file extension.
- `download_link` The URL to fetch the file which is valid for five minutes.

Here’s an example of an `openaiFileIdRefs` array with two elements:

```json
[
  {
    "name": "dalle-Lh2tg7WuosbyR9hk",
    "id": "file-XFlOqJYTPBPwMZE3IopCBv1Z",
    "mime_type": "image/webp",
    "download_link": "https://files.oaiusercontent.com/file-XFlOqJYTPBPwMZE3IopCBv1Z?se=2024-03-11T20%3A29%3A52Z&sp=r&sv=2021-08-06&sr=b&rscc=max-age%3D31536000%2C%20immutable&rscd=attachment%3B%20filename%3Da580bae6-ea30-478e-a3e2-1f6c06c3e02f.webp&sig=ZPWol5eXACxU1O9azLwRNgKVidCe%2BwgMOc/TdrPGYII%3D"
  },
  {
    "name": "2023 Benefits Booklet.pdf",
    "id": "file-s5nX7o4junn2ig0J84r8Q0Ew",
    "mime_type": "application/pdf",
    "download_link": "https://files.oaiusercontent.com/file-s5nX7o4junn2ig0J84r8Q0Ew?se=2024-03-11T20%3A29%3A52Z&sp=r&sv=2021-08-06&sr=b&rscc=max-age%3D299%2C%20immutable&rscd=attachment%3B%20filename%3D2023%2520Benefits%2520Booklet.pdf&sig=Ivhviy%2BrgoyUjxZ%2BingpwtUwsA4%2BWaRfXy8ru9AfcII%3D"
  }
]
```

Actions can include files uploaded by the user, images generated by DALL-E, and files created by Code Interpreter.

### OpenAPI Example

```yaml
/createWidget:
  post:
    operationId: createWidget
    summary: Creates a widget based on an image.
    description: Uploads a file reference using its file id. This file should be an image created by DALL·E or uploaded by the user. JPG, WEBP, and PNG are supported for widget creation.
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              openaiFileIdRefs:
                type: array
                items:
                  type: string
```

While this schema shows `openaiFileIdRefs` as being an array of type `string`, at runtime this will be populated with an array of JSON objects as previously shown.

## Returning files

Requests may return up to 10 files. Each file may be up to 10 MB and cannot be an image or video.

These files will become part of the conversation similarly to if a user uploaded them, meaning they may be made available to code interpreter, file search, and sent as part of subsequent action invocations. In the web app users will see that the files have been returned and can download them.

To return files, the body of the response must contain an `openaiFileResponse` parameter. This parameter must always be an array and must be populated in one of two ways.

### Inline option

Each element of the array is a JSON object which contains:

- `name` The name of the file. This will be visible to the user.
- `mime_type` The MIME type of the file. This is used to determine eligibility and which features have access to the file.
- `content` The base64 encoded contents of the file.

Here’s an example of an openaiFileResponse array with two elements:

```json
[
  {
    "name": "example_document.pdf",
    "mime_type": "application/pdf",
    "content": "JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGggNiAwIFIvRmlsdGVyIC9GbGF0ZURlY29kZT4+CnN0cmVhbQpHhD93PQplbmRzdHJlYW0KZW5kb2JqCg=="
  },
  {
    "name": "sample_spreadsheet.csv",
    "mime_type": "text/csv",
    "content": "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
  }
]
```

OpenAPI example

```yaml
/papers:
  get:
    operationId: findPapers
    summary: Retrieve PDFs of relevant academic papers.
    description: Provided an academic topic, up to five relevant papers will be returned as PDFs.
    parameters:
      - in: query
        name: topic
        required: true
        schema:
          type: string
        description: The topic the papers should be about.
    responses:
      "200":
        description: Zero to five academic paper PDFs
        content:
          application/json:
            schema:
              type: object
              properties:
                openaiFileResponse:
                  type: array
                  items:
                    type: object
                    properties:
                      name:
                        type: string
                        description: The name of the file.
                      mime_type:
                        type: string
                        description: The MIME type of the file.
                      content:
                        type: string
                        format: byte
                        description: The content of the file in base64 encoding.
```

### URL option

Each element of the array is a URL referencing a file to be downloaded. The headers `Content-Disposition` and `Content-Type` must be set such that a file name and MIME type can be determined. The name of the file will be visible to the user. The MIME type of the file determines eligibility and which features have access to the file.

There is a 10 second timeout for fetching each file.

Here’s an example of an `openaiFileResponse` array with two elements:

```json
[
  "https://example.com/f/dca89f18-16d4-4a65-8ea2-ededced01646",
  "https://example.com/f/01fad6b0-635b-4803-a583-0f678b2e6153"
]
```

Here’s an example of the required headers for each URL:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="example_document.pdf"
```

OpenAPI example

```yaml
/papers:
  get:
    operationId: findPapers
    summary: Retrieve PDFs of relevant academic papers.
    description: Provided an academic topic, up to five relevant papers will be returned as PDFs.
    parameters:
      - in: query
        name: topic
        required: true
        schema:
          type: string
        description: The topic the papers should be about.
    responses:
      '200':
        description: Zero to five academic paper PDFs
        content:
            application/json:
              schema:
                type: object
                properties:
                  openaiFileResponse:
                    type: array
                    items:
                    type: string
                    format: uri
                    description: URLs to fetch the files.
```

:::
:::

