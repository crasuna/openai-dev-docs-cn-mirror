---
status: needs-review
sourceId: fcb692855d77
sourceChecksum: fcb692855d77abc948739af12cbba7583b72f6a5d5215afa57d82ff78fb20ebc
sourceUrl: https://developers.openai.com/api/docs/guides/tools-code-interpreter
translatedAt: 2026-06-27T17:13:53.3182238+08:00
translator: codex-gpt-5.5-xhigh
---

# Code Interpreter

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


你可以选择 `1g`（默认）、`4g`、`16g` 或 `64g`。更高档位为会话提供更多 RAM，并按 Code Interpreter 的 [built-in tools rates](https://developers.openai.com/api/docs/pricing#built-in-tools) 计费。所选 `memory_limit` 会在该 container 的整个生命周期内生效，无论它是自动创建的，还是通过 containers API 创建的。

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

模型输入中的任何[文件](https://developers.openai.com/api/docs/guides/file-inputs)都会自动上传到 container。你不需要显式将其上传到 container。

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

<table>
<tbody>

<tr>
  <th>API 可用性</th>
  <th>速率限制</th>
  <th>备注</th>
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
  <td style={{ maxWidth: "150px" }}>每个组织 100 RPM</td>
  <td style={{ maxWidth: "150px" }}>
    [Pricing](https://developers.openai.com/api/docs/pricing#built-in-tools) <br />
    [ZDR and data residency](https://developers.openai.com/api/docs/guides/your-data)
  </td>
</tr>

</tbody>
</table>
