---
status: needs-review
sourceId: cc94e1860821
sourceChecksum: cc94e18608217745cac282769350e5d43e3989b08f90ee1c07085871818283bc
sourceUrl: https://developers.openai.com/api/docs/assistants/tools/code-interpreter
translatedAt: 2026-06-27T16:51:57.1346199+08:00
translator: codex-gpt-5.5-xhigh
---

# Assistants Code Interpreter 代码解释器

## 概览

Code Interpreter 允许 Assistant 在沙盒执行环境中编写并运行 Python 代码。此工具可以处理具有多种数据和格式的文件，并生成包含数据和图表图片的文件。Code Interpreter 允许你的 Assistant 通过迭代运行代码来解决困难的代码与数学问题。当你的 Assistant 写出的代码运行失败时，它可以尝试运行不同代码并持续迭代，直到代码执行成功。

请在[这里](https://developers.openai.com/api/docs/assistants/overview#step-1-create-an-assistant?context=with-streaming)查看 Code Interpreter 入门 quickstart。

## 工作方式

Code Interpreter 按每个 session 0.03 美元收费。如果你的 Assistant 在两个不同 thread 中同时调用 Code Interpreter（例如每个最终用户一个 thread），则会创建两个 Code Interpreter session。每个 session 默认有效一小时，这意味着如果用户在同一个 thread 中与 Code Interpreter 交互最长一小时，你只需为一个 session 付费。

### 启用 Code Interpreter

在 Assistant 对象的 `tools` 参数中传入 `code_interpreter`，即可启用 Code Interpreter：

```python
assistant = client.beta.assistants.create(
  instructions="You are a personal math tutor. When asked a math question, write and run code to answer the question.",
  model="gpt-4o",
  tools=[{"type": "code_interpreter"}]
)
```

```javascript
const assistant = await openai.beta.assistants.create({
  instructions: "You are a personal math tutor. When asked a math question, write and run code to answer the question.",
  model: "gpt-4o",
  tools: [{"type": "code_interpreter"}]
});
```

```bash
curl https://api.openai.com/v1/assistants \
  -u :$OPENAI_API_KEY \
  -H 'Content-Type: application/json' \
  -H 'OpenAI-Beta: assistants=v2' \
  -d '{
    "instructions": "You are a personal math tutor. When asked a math question, write and run code to answer the question.",
    "tools": [
      { "type": "code_interpreter" }
    ],
    "model": "gpt-4o"
  }'
```


随后，模型会根据用户请求的性质，在 Run 中决定何时调用 Code Interpreter。你可以在 Assistant 的 `instructions` 中提示来促进这种行为，例如“write code to solve this problem”。

### 将文件传递给 Code Interpreter

在 Assistant 级别传入的文件可被此 Assistant 的所有 Run 访问：

```python
# Upload a file with an "assistants" purpose
file = client.files.create(
  file=open("mydata.csv", "rb"),
  purpose='assistants'
)

# Create an assistant using the file ID
assistant = client.beta.assistants.create(
  instructions="You are a personal math tutor. When asked a math question, write and run code to answer the question.",
  model="gpt-4o",
  tools=[{"type": "code_interpreter"}],
  tool_resources={
    "code_interpreter": {
      "file_ids": [file.id]
    }
  }
)
```

```javascript
// Upload a file with an "assistants" purpose
const file = await openai.files.create({
  file: fs.createReadStream("mydata.csv"),
  purpose: "assistants",
});

// Create an assistant using the file ID
const assistant = await openai.beta.assistants.create({
  instructions: "You are a personal math tutor. When asked a math question, write and run code to answer the question.",
  model: "gpt-4o",
  tools: [{"type": "code_interpreter"}],
  tool_resources: {
    "code_interpreter": {
      "file_ids": [file.id]
    }
  }
});
```

```bash
# Upload a file with an "assistants" purpose
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="assistants" \
  -F file="@/path/to/mydata.csv"

# Create an assistant using the file ID
curl https://api.openai.com/v1/assistants \
  -u :$OPENAI_API_KEY \
  -H 'Content-Type: application/json' \
  -H 'OpenAI-Beta: assistants=v2' \
  -d '{
    "instructions": "You are a personal math tutor. When asked a math question, write and run code to answer the question.",
    "tools": [{"type": "code_interpreter"}],
    "model": "gpt-4o",
    "tool_resources": {
      "code_interpreter": {
        "file_ids": ["file-BK7bzQj3FfZFXr7DbL6xJwfo"]
      }
    }
  }'
```


文件也可以在 Thread 级别传入。这些文件只在特定 Thread 中可访问。请使用 [File upload](https://developers.openai.com/api/docs/api-reference/files/create) endpoint 上传文件，然后在 Message 创建请求中把 File ID 作为一部分传入：

```python
thread = client.beta.threads.create(
  messages=[
    {
      "role": "user",
      "content": "I need to solve the equation `3x + 11 = 14`. Can you help me?",
      "attachments": [
        {
          "file_id": file.id,
          "tools": [{"type": "code_interpreter"}]
        }
      ]
    }
  ]
)
```

```javascript
const thread = await openai.beta.threads.create({
  messages: [
    {
      "role": "user",
      "content": "I need to solve the equation `3x + 11 = 14`. Can you help me?",
      "attachments": [
        {
          file_id: file.id,
          tools: [{type: "code_interpreter"}]
        }
      ]
    }
  ]
});
```

```bash
curl https://api.openai.com/v1/threads/thread_abc123/messages \
  -u :$OPENAI_API_KEY \
  -H 'Content-Type: application/json' \
  -H 'OpenAI-Beta: assistants=v2' \
  -d '{
    "role": "user",
    "content": "I need to solve the equation `3x + 11 = 14`. Can you help me?",
    "attachments": [
      {
        "file_id": "file-ACq8OjcLQm2eIG0BvRM4z5qX",
        "tools": [{"type": "code_interpreter"}]
      }
    ]
  }'
```


文件最大大小为 512 MB。Code Interpreter 支持多种文件格式，包括 `.csv`、`.pdf`、`.json` 等。有关支持的文件扩展名及其对应 MIME type 的更多详情，请见下方[支持的文件](#supported-files)部分。

### 读取 Code Interpreter 生成的图片和文件

API 中的 Code Interpreter 也会输出文件，例如生成图片图表、CSV 和 PDF。生成的文件有两类：

1. 图片
2. 数据文件（例如包含 Assistant 生成数据的 `csv` 文件）

当 Code Interpreter 生成图片时，你可以在 Assistant Message response 的 `file_id` 字段中查找并下载此文件：

```json
{
	"id": "msg_abc123",
	"object": "thread.message",
	"created_at": 1698964262,
	"thread_id": "thread_abc123",
	"role": "assistant",
	"content": [
    {
      "type": "image_file",
      "image_file": {
        "file_id": "file-abc123"
      }
    }
  ]
  # ...
}
```

随后，可以把 file ID 传给 Files API 来下载文件内容：

```python
from openai import OpenAI

client = OpenAI()

image_data = client.files.content("file-abc123")
image_data_bytes = image_data.read()

with open("./my-image.png", "wb") as file:
    file.write(image_data_bytes)
```

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

async function main() {
  const response = await openai.files.content("file-abc123");

  // Extract the binary data from the Response object
  const image_data = await response.arrayBuffer();

  // Convert the binary data to a Buffer
  const image_data_buffer = Buffer.from(image_data);

  // Save the image to a specific location
  fs.writeFileSync("./my-image.png", image_data_buffer);
}

main();
```

```bash
curl https://api.openai.com/v1/files/file-abc123/content \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output image.png
```


当 Code Interpreter 引用文件路径时（例如“Download this csv file”），文件路径会列为 annotation。你可以把这些 annotation 转换成用于下载文件的链接：

```json
{
  "id": "msg_abc123",
  "object": "thread.message",
  "created_at": 1699073585,
  "thread_id": "thread_abc123",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": {
        "value": "The rows of the CSV file have been shuffled and saved to a new CSV file. You can download the shuffled CSV file from the following link:\\n\\n[Download Shuffled CSV File](sandbox:/mnt/data/shuffled_file.csv)",
        "annotations": [
          {
            "type": "file_path",
            "text": "sandbox:/mnt/data/shuffled_file.csv",
            "start_index": 167,
            "end_index": 202,
            "file_path": {
              "file_id": "file-abc123"
            }
          }
          ...
```

### Code Interpreter 的输入和输出日志

通过列出调用了 Code Interpreter 的 Run 的 step，你可以检查 Code Interpreter 的代码 `input` 和 `outputs` 日志：

```python
run_steps = client.beta.threads.runs.steps.list(
  thread_id=thread.id,
  run_id=run.id
)
```

```javascript
const runSteps = await openai.beta.threads.runs.steps.list(
  thread.id,
  run.id
);
```

```bash
curl https://api.openai.com/v1/threads/thread_abc123/runs/RUN_ID/steps \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "OpenAI-Beta: assistants=v2" \
```


```bash
{
  "object": "list",
  "data": [
    {
      "id": "step_abc123",
      "object": "thread.run.step",
      "type": "tool_calls",
      "run_id": "run_abc123",
      "thread_id": "thread_abc123",
      "status": "completed",
      "step_details": {
        "type": "tool_calls",
        "tool_calls": [
          {
            "type": "code",
            "code": {
              "input": "# Calculating 2 + 2\\nresult = 2 + 2\\nresult",
              "outputs": [
                {
                  "type": "logs",
                  "logs": "4"
                }
						...
 }
```

## 支持的文件 {#supported-files}

| 文件格式 | MIME type                                                                   |
| -------- | --------------------------------------------------------------------------- |
| `.c`     | `text/x-c`                                                                  |
| `.cs`    | `text/x-csharp`                                                             |
| `.cpp`   | `text/x-c++`                                                                |
| `.csv`   | `text/csv`                                                                  |
| `.doc`   | `application/msword`                                                        |
| `.docx`  | `application/vnd.openxmlformats-officedocument.wordprocessingml.document`   |
| `.html`  | `text/html`                                                                 |
| `.java`  | `text/x-java`                                                               |
| `.json`  | `application/json`                                                          |
| `.md`    | `text/markdown`                                                             |
| `.pdf`   | `application/pdf`                                                           |
| `.php`   | `text/x-php`                                                                |
| `.pptx`  | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `.py`    | `text/x-python`                                                             |
| `.py`    | `text/x-script.python`                                                      |
| `.rb`    | `text/x-ruby`                                                               |
| `.tex`   | `text/x-tex`                                                                |
| `.txt`   | `text/plain`                                                                |
| `.css`   | `text/css`                                                                  |
| `.js`    | `text/javascript`                                                           |
| `.sh`    | `application/x-sh`                                                          |
| `.ts`    | `application/typescript`                                                    |
| `.csv`   | `application/csv`                                                           |
| `.jpeg`  | `image/jpeg`                                                                |
| `.jpg`   | `image/jpeg`                                                                |
| `.gif`   | `image/gif`                                                                 |
| `.pkl`   | `application/octet-stream`                                                  |
| `.png`   | `image/png`                                                                 |
| `.tar`   | `application/x-tar`                                                         |
| `.xlsx`  | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`         |
| `.xml`   | `application/xml or "text/xml"`                                             |
| `.zip`   | `application/zip`                                                           |
