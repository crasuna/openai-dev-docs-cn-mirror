---
title: "Code Interpreter 代码解释器"
description: "Allow models to write and run Python to solve problems."
outline: deep
---

# Code Interpreter 代码解释器

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/tools-code-interpreter](https://developers.openai.com/api/docs/guides/tools-code-interpreter)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/tools-code-interpreter.md](https://developers.openai.com/api/docs/guides/tools-code-interpreter.md)
- 抓取时间：2026-06-27T05:54:09.870Z
- Checksum：`fcb692855d77abc948739af12cbba7583b72f6a5d5215afa57d82ff78fb20ebc`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Code Interpreter 工具允许模型在沙盒环境中编写并运行 Python 代码，以解决数据分析、编码和数学等领域的复杂问题。可将其用于：

- 处理具有不同数据和格式的文件
- 生成包含数据和图表图片的文件
- 迭代式地编写和运行代码来解决问题，例如，模型写出的代码运行失败后，可以持续重写并运行，直到成功
- 提升我们最新 reasoning 模型（如 [o3](https://developers.openai.com/api/docs/models/o3) 和 [o4-mini](https://developers.openai.com/api/docs/models/o4-mini)）的视觉智能。模型可以使用此工具裁剪、缩放、旋转，以及以其他方式处理和变换图像。

下面是一个调用 [Responses API](https://developers.openai.com/api/docs/api-reference/responses)，并让其向 Code Interpreter 发起工具调用的示例：

通过 Responses API 使用 Code Interpreter

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "tools": [{
      "type": "code_interpreter",
      "container": { "type": "auto", "memory_limit": "4g" }
    }],
    "instructions": "You are a personal math tutor. When asked a math question, write and run code using the python tool to answer the question.",
    "input": "I need to solve the equation 3x + 11 = 14. Can you help me?"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const instructions = `
You are a personal math tutor. When asked a math question,
write and run code using the python tool to answer the question.
`;

const resp = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    {
      type: "code_interpreter",
      container: { type: "auto", memory_limit: "4g" },
    },
  ],
  instructions,
  input: "I need to solve the equation 3x + 11 = 14. Can you help me?",
});

console.log(JSON.stringify(resp.output, null, 2));
```

```python
from openai import OpenAI

client = OpenAI()

instructions = """
You are a personal math tutor. When asked a math question,
write and run code using the python tool to answer the question.
"""

resp = client.responses.create(
    model="gpt-5.5",
    tools=[
        {
            "type": "code_interpreter",
            "container": {"type": "auto", "memory_limit": "4g"}
        }
    ],
    instructions=instructions,
    input="I need to solve the equation 3x + 11 = 14. Can you help me?",
)

print(resp.output)
```


虽然我们称这个工具为 Code Interpreter，但模型知道它是 "python tool"。模型通常能理解提到 code interpreter tool 的 prompt；不过，调用此工具最明确的方式，是在 prompt 中请求使用 "the python tool"。

## 容器

Code Interpreter 工具需要一个 [container object](https://developers.openai.com/api/docs/api-reference/containers/object)。container 是一个完全沙盒化的虚拟机，模型可以在其中运行 Python 代码。这个 container 可以包含你上传的文件，也可以包含模型生成的文件。

创建 container 有两种方式：

1. 自动模式：如上例所示，你可以在创建新的 Response object 时，在工具配置中传入 `"container": { "type": "auto", "memory_limit": "4g", "file_ids": ["file-1", "file-2"] }` 属性。这样会自动创建新的 container，或复用模型上下文中先前 `code_interpreter_call` item 使用过的 active container。省略 `memory_limit` 会让 container 保持默认的 1 GB 档位。请在此 API 请求的输出中查找 `code_interpreter_call` item，以找到已生成或已使用的 `container_id`。
2. 显式模式：在这种模式下，你使用 `v1/containers` endpoint 显式[创建 container](https://developers.openai.com/api/docs/api-reference/containers/createContainers)，包含所需的 `memory_limit`（例如 `"memory_limit": "4g"`），并在 Response object 的工具配置中把它的 `id` 指定为 `container` 值。例如：

使用显式 container 创建

```bash
curl https://api.openai.com/v1/containers \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "My Container",
        "memory_limit": "4g"
      }'

# Use the returned container id in the next call:
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "tools": [{
      "type": "code_interpreter",
      "container": "cntr_abc123"
    }],
    "tool_choice": "required",
    "input": "use the python tool to calculate what is 4 * 3.82. and then find its square root and then find the square root of that result"
  }'
```

```python
from openai import OpenAI
client = OpenAI()

container = client.containers.create(name="test-container", memory_limit="4g")

response = client.responses.create(
    model="gpt-5.5",
    tools=[{
        "type": "code_interpreter",
        "container": container.id
    }],
    tool_choice="required",
    input="use the python tool to calculate what is 4 * 3.82. and then find its square root and then find the square root of that result"
)

print(response.output_text)
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const container = await client.containers.create({ name: "test-container", memory_limit: "4g" });

const resp = await client.responses.create({
    model: "gpt-5.5",
    tools: [
      {
        type: "code_interpreter",
        container: container.id
      }
    ],
    tool_choice: "required",
    input: "use the python tool to calculate what is 4 * 3.82. and then find its square root and then find the square root of that result"
});

console.log(resp.output_text);
```


你可以选择 `1g`（默认）、`4g`、`16g` 或 `64g`。更高档位为会话提供更多 RAM，并按 Code Interpreter 的 [built-in tools rates](/mirror/api/docs/pricing#built-in-tools) 计费。所选 `memory_limit` 会在该 container 的整个生命周期内生效，无论它是自动创建的，还是通过 containers API 创建的。

请注意，使用自动模式创建的 container 也可以通过 [`/v1/containers`](https://developers.openai.com/api/docs/api-reference/containers) endpoint 访问。

### 过期

我们强烈建议你把 container 视为临时资源，并将与使用此工具相关的所有数据存储在你自己的系统中。过期详情如下：

- 如果 container 在 20 分钟内未被使用，它会过期。发生这种情况时，在 `v1/responses` 中使用该 container 会失败。你仍能看到该 container 过期时的元数据快照，但与该 container 关联的所有数据都会从我们的系统中丢弃且无法恢复。你应该在 container 仍处于 active 状态时下载任何可能需要的文件。
- 你不能把 container 从 expired 状态移动回 active 状态。请改为创建新的 container 并重新上传文件。请注意，旧 container 内存中的任何状态（如 python 对象）都会丢失。
- 任何 container 操作，例如检索 container，或向 container 添加文件、删除文件，都会自动刷新该 container 的 `last_active_at` 时间。

## 处理文件

运行 Code Interpreter 时，模型可以创建自己的文件。例如，如果你要求它构建图表或创建 CSV，它会直接在你的 container 上创建这些图片。这样做时，它会在下一条消息的 `annotations` 中引用这些文件。示例如下：

```json
{
  "id": "msg_682d514e268c8191a89c38ea318446200f2610a7ec781a4f",
  "content": [
    {
      "annotations": [
        {
          "file_id": "cfile_682d514b2e00819184b9b07e13557f82",
          "index": null,
          "type": "container_file_citation",
          "container_id": "cntr_682d513bb0c48191b10bd4f8b0b3312200e64562acc2e0af",
          "end_index": 0,
          "filename": "cfile_682d514b2e00819184b9b07e13557f82.png",
          "start_index": 0
        }
      ],
      "text": "Here is the histogram of the RGB channels for the uploaded image. Each curve represents the distribution of pixel intensities for the red, green, and blue channels. Peaks toward the high end of the intensity scale (right-hand side) suggest a lot of brightness and strong warm tones, matching the orange and light background in the image. If you want a different style of histogram (e.g., overall intensity, or quantized color groups), let me know!",
      "type": "output_text",
      "logprobs": []
    }
  ],
  "role": "assistant",
  "status": "completed",
  "type": "message"
}
```

你可以调用 [get container file content](https://developers.openai.com/api/docs/api-reference/container-files/retrieveContainerFileContent) 方法来下载这些已构造的文件。

模型输入中的任何[文件](/mirror/api/docs/guides/file-inputs)都会自动上传到 container。你不需要显式将其上传到 container。

### 上传和下载文件

使用 [Create container file](https://developers.openai.com/api/docs/api-reference/container-files/createContainerFile) 向你的 container 添加新文件。此 endpoint 接受 multipart 上传，或带有 `file_id` 的 JSON body。
使用 [List container files](https://developers.openai.com/api/docs/api-reference/container-files/listContainerFiles) 列出现有 container 文件，并使用 [Retrieve container file content](https://developers.openai.com/api/docs/api-reference/container-files/retrieveContainerFileContent) 下载字节内容。

### 处理引用

模型生成的文件和图片会作为 assistant 消息上的 annotations 返回。`container_file_citation` annotation 指向在 container 中创建的文件。它们包含 `container_id`、`file_id` 和 `filename`。你可以解析这些 annotations，以展示下载链接或以其他方式处理文件。

### 支持的文件

| 文件格式 | MIME type                                                                   |
| -------- | --------------------------------------------------------------------------- |
| `.c`        | `text/x-c`                                                                  |
| `.cs`       | `text/x-csharp`                                                             |
| `.cpp`      | `text/x-c++`                                                                |
| `.csv`      | `text/csv`                                                                  |
| `.doc`      | `application/msword`                                                        |
| `.docx`     | `application/vnd.openxmlformats-officedocument.wordprocessingml.document`   |
| `.html`     | `text/html`                                                                 |
| `.java`     | `text/x-java`                                                               |
| `.json`     | `application/json`                                                          |
| `.md`       | `text/markdown`                                                             |
| `.pdf`      | `application/pdf`                                                           |
| `.php`      | `text/x-php`                                                                |
| `.pptx`     | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `.py`       | `text/x-python`                                                             |
| `.py`       | `text/x-script.python`                                                      |
| `.rb`       | `text/x-ruby`                                                               |
| `.tex`      | `text/x-tex`                                                                |
| `.txt`      | `text/plain`                                                                |
| `.css`      | `text/css`                                                                  |
| `.js`       | `text/javascript`                                                           |
| `.sh`       | `application/x-sh`                                                          |
| `.ts`       | `application/typescript`                                                    |
| `.csv`      | `application/csv`                                                           |
| `.jpeg`     | `image/jpeg`                                                                |
| `.jpg`      | `image/jpeg`                                                                |
| `.gif`      | `image/gif`                                                                 |
| `.pkl`      | `application/octet-stream`                                                  |
| `.png`      | `image/png`                                                                 |
| `.tar`      | `application/x-tar`                                                         |
| `.xlsx`     | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`         |
| `.xml`      | `application/xml or "text/xml"`                                             |
| `.zip`      | `application/zip`                                                           |

## 使用说明





API 可用性
速率限制
备注





      [Responses](https://developers.openai.com/api/docs/api-reference/responses)


      [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat)


      [Assistants](https://developers.openai.com/api/docs/api-reference/assistants)


每个组织 100 RPM

    [Pricing](/mirror/api/docs/pricing#built-in-tools) &lt;br /&gt;
    [ZDR and data residency](/mirror/api/docs/guides/your-data)






:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
The Code Interpreter tool allows models to write and run Python code in a sandboxed environment to solve complex problems in domains like data analysis, coding, and math. Use it for:

- Processing files with diverse data and formatting
- Generating files with data and images of graphs
- Writing and running code iteratively to solve problems—for example, a model that writes code that fails to run can keep rewriting and running that code until it succeeds
- Boosting visual intelligence in our latest reasoning models (like [o3](https://developers.openai.com/api/docs/models/o3) and [o4-mini](https://developers.openai.com/api/docs/models/o4-mini)). The model can use this tool to crop, zoom, rotate, and otherwise process and transform images.

Here's an example of calling the [Responses API](https://developers.openai.com/api/docs/api-reference/responses) with a tool call to Code Interpreter:

Use the Responses API with Code Interpreter

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "tools": [{
      "type": "code_interpreter",
      "container": { "type": "auto", "memory_limit": "4g" }
    }],
    "instructions": "You are a personal math tutor. When asked a math question, write and run code using the python tool to answer the question.",
    "input": "I need to solve the equation 3x + 11 = 14. Can you help me?"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const instructions = `
You are a personal math tutor. When asked a math question,
write and run code using the python tool to answer the question.
`;

const resp = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    {
      type: "code_interpreter",
      container: { type: "auto", memory_limit: "4g" },
    },
  ],
  instructions,
  input: "I need to solve the equation 3x + 11 = 14. Can you help me?",
});

console.log(JSON.stringify(resp.output, null, 2));
```

```python
from openai import OpenAI

client = OpenAI()

instructions = """
You are a personal math tutor. When asked a math question,
write and run code using the python tool to answer the question.
"""

resp = client.responses.create(
    model="gpt-5.5",
    tools=[
        {
            "type": "code_interpreter",
            "container": {"type": "auto", "memory_limit": "4g"}
        }
    ],
    instructions=instructions,
    input="I need to solve the equation 3x + 11 = 14. Can you help me?",
)

print(resp.output)
```


While we call this tool Code Interpreter, the model knows it as the "python
  tool". Models usually understand prompts that refer to the code interpreter
  tool, however, the most explicit way to invoke this tool is to ask for "the
  python tool" in your prompts.

## Containers

The Code Interpreter tool requires a [container object](https://developers.openai.com/api/docs/api-reference/containers/object). A container is a fully sandboxed virtual machine that the model can run Python code in. This container can contain files that you upload, or that it generates.

There are two ways to create containers:

1. Auto mode: as seen in the example above, you can do this by passing the `"container": { "type": "auto", "memory_limit": "4g", "file_ids": ["file-1", "file-2"] }` property in the tool configuration while creating a new Response object. This automatically creates a new container, or reuses an active container that was used by a previous `code_interpreter_call` item in the model's context. Leaving out `memory_limit` keeps the default 1 GB tier for the container. Look for the `code_interpreter_call` item in the output of this API request to find the `container_id` that was generated or used.
2. Explicit mode: here, you explicitly [create a container](https://developers.openai.com/api/docs/api-reference/containers/createContainers) using the `v1/containers` endpoint, including the `memory_limit` you need (for example `"memory_limit": "4g"`), and assign its `id` as the `container` value in the tool configuration in the Response object. For example:

Use explicit container creation

```bash
curl https://api.openai.com/v1/containers \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "My Container",
        "memory_limit": "4g"
      }'

# Use the returned container id in the next call:
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "tools": [{
      "type": "code_interpreter",
      "container": "cntr_abc123"
    }],
    "tool_choice": "required",
    "input": "use the python tool to calculate what is 4 * 3.82. and then find its square root and then find the square root of that result"
  }'
```

```python
from openai import OpenAI
client = OpenAI()

container = client.containers.create(name="test-container", memory_limit="4g")

response = client.responses.create(
    model="gpt-5.5",
    tools=[{
        "type": "code_interpreter",
        "container": container.id
    }],
    tool_choice="required",
    input="use the python tool to calculate what is 4 * 3.82. and then find its square root and then find the square root of that result"
)

print(response.output_text)
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const container = await client.containers.create({ name: "test-container", memory_limit: "4g" });

const resp = await client.responses.create({
    model: "gpt-5.5",
    tools: [
      {
        type: "code_interpreter",
        container: container.id
      }
    ],
    tool_choice: "required",
    input: "use the python tool to calculate what is 4 * 3.82. and then find its square root and then find the square root of that result"
});

console.log(resp.output_text);
```


You can choose from `1g` (default), `4g`, `16g`, or `64g`. Higher tiers offer more RAM for the session and are billed at the [built-in tools rates](https://developers.openai.com/api/docs/pricing#built-in-tools) for Code Interpreter. The selected `memory_limit` applies for the entire life of that container, whether it was created automatically or via the containers API.

Note that containers created with the auto mode are also accessible using the [`/v1/containers`](https://developers.openai.com/api/docs/api-reference/containers) endpoint.

### Expiration

We highly recommend you treat containers as ephemeral and store all data related to the use of this tool on your own systems. Expiration details:

- A container expires if it is not used for 20 minutes. When this happens, using the container in `v1/responses` will fail. You'll still be able to see a snapshot of the container's metadata at its expiry, but all data associated with the container will be discarded from our systems and not recoverable. You should download any files you may need from the container while it is active.
- You can't move a container from an expired state to an active one. Instead, create a new container and upload files again. Note that any state in the old container's memory (like python objects) will be lost.
- Any container operation, like retrieving the container, or adding or deleting files from the container, will automatically refresh the container's `last_active_at` time.

## Work with files

When running Code Interpreter, the model can create its own files. For example, if you ask it to construct a plot, or create a CSV, it creates these images directly on your container. When it does so, it cites these files in the `annotations` of its next message. Here's an example:

```json
{
  "id": "msg_682d514e268c8191a89c38ea318446200f2610a7ec781a4f",
  "content": [
    {
      "annotations": [
        {
          "file_id": "cfile_682d514b2e00819184b9b07e13557f82",
          "index": null,
          "type": "container_file_citation",
          "container_id": "cntr_682d513bb0c48191b10bd4f8b0b3312200e64562acc2e0af",
          "end_index": 0,
          "filename": "cfile_682d514b2e00819184b9b07e13557f82.png",
          "start_index": 0
        }
      ],
      "text": "Here is the histogram of the RGB channels for the uploaded image. Each curve represents the distribution of pixel intensities for the red, green, and blue channels. Peaks toward the high end of the intensity scale (right-hand side) suggest a lot of brightness and strong warm tones, matching the orange and light background in the image. If you want a different style of histogram (e.g., overall intensity, or quantized color groups), let me know!",
      "type": "output_text",
      "logprobs": []
    }
  ],
  "role": "assistant",
  "status": "completed",
  "type": "message"
}
```

You can download these constructed files by calling the [get container file content](https://developers.openai.com/api/docs/api-reference/container-files/retrieveContainerFileContent) method.

Any [files in the model input](https://developers.openai.com/api/docs/guides/file-inputs) get automatically uploaded to the container. You do not have to explicitly upload it to the container.

### Uploading and downloading files

Add new files to your container using [Create container file](https://developers.openai.com/api/docs/api-reference/container-files/createContainerFile). This endpoint accepts either a multipart upload or a JSON body with a `file_id`.
List existing container files with [List container files](https://developers.openai.com/api/docs/api-reference/container-files/listContainerFiles) and download bytes from [Retrieve container file content](https://developers.openai.com/api/docs/api-reference/container-files/retrieveContainerFileContent).

### Dealing with citations

Files and images generated by the model are returned as annotations on the assistant's message. `container_file_citation` annotations point to files created in the container. They include the `container_id`, `file_id`, and `filename`. You can parse these annotations to surface download links or otherwise process the files.

### Supported files

| File format | MIME type                                                                   |
| ----------- | --------------------------------------------------------------------------- |
| `.c`        | `text/x-c`                                                                  |
| `.cs`       | `text/x-csharp`                                                             |
| `.cpp`      | `text/x-c++`                                                                |
| `.csv`      | `text/csv`                                                                  |
| `.doc`      | `application/msword`                                                        |
| `.docx`     | `application/vnd.openxmlformats-officedocument.wordprocessingml.document`   |
| `.html`     | `text/html`                                                                 |
| `.java`     | `text/x-java`                                                               |
| `.json`     | `application/json`                                                          |
| `.md`       | `text/markdown`                                                             |
| `.pdf`      | `application/pdf`                                                           |
| `.php`      | `text/x-php`                                                                |
| `.pptx`     | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `.py`       | `text/x-python`                                                             |
| `.py`       | `text/x-script.python`                                                      |
| `.rb`       | `text/x-ruby`                                                               |
| `.tex`      | `text/x-tex`                                                                |
| `.txt`      | `text/plain`                                                                |
| `.css`      | `text/css`                                                                  |
| `.js`       | `text/javascript`                                                           |
| `.sh`       | `application/x-sh`                                                          |
| `.ts`       | `application/typescript`                                                    |
| `.csv`      | `application/csv`                                                           |
| `.jpeg`     | `image/jpeg`                                                                |
| `.jpg`      | `image/jpeg`                                                                |
| `.gif`      | `image/gif`                                                                 |
| `.pkl`      | `application/octet-stream`                                                  |
| `.png`      | `image/png`                                                                 |
| `.tar`      | `application/x-tar`                                                         |
| `.xlsx`     | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`         |
| `.xml`      | `application/xml or "text/xml"`                                             |
| `.zip`      | `application/zip`                                                           |

## Usage notes

<table>
<tbody>

<tr>
  <th>API Availability</th>
  <th>Rate limits</th>
  <th>Notes</th>
</tr>

<tr>
  <td>
    <div className="mb-1 flex items-center gap-2">
      [Responses](https://developers.openai.com/api/docs/api-reference/responses)
    </div>
    <div className="mb-1 flex items-center gap-2">
      [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat)
    </div>
    <div className="mb-1 flex items-center gap-2">
      [Assistants](https://developers.openai.com/api/docs/api-reference/assistants)
    </div>
  </td>
  <td style={{ maxWidth: "150px" }}>100 RPM per org</td>
  <td style={{ maxWidth: "150px" }}>
    [Pricing](https://developers.openai.com/api/docs/pricing#built-in-tools) <br />
    [ZDR and data residency](https://developers.openai.com/api/docs/guides/your-data)
  </td>
</tr>

</tbody>
</table>
``````
:::
:::

