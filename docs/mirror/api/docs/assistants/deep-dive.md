---
title: "Assistants API 深入指南"
description: "A detailed guide to creating and managing assistants with the Assistants API on the OpenAI platform."
outline: deep
---

# Assistants API 深入指南

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/assistants/deep-dive](https://developers.openai.com/api/docs/assistants/deep-dive)
- Markdown 来源：[https://developers.openai.com/api/docs/assistants/deep-dive.md](https://developers.openai.com/api/docs/assistants/deep-dive.md)
- 抓取时间：2026-06-27T05:53:56.234Z
- Checksum：`2c6db0275258150252c834467f64a412d96ed0b1449b1821acdda91786f1a651`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

不要在 Assistants API 上开始新的集成。我们已经宣布计划很快弃用它，因为 Responses API 现在提供相同功能，并且集成方式更加优雅。

使用 Assistants API 构建应用涉及多个概念。下面会逐一介绍，以便在你进行[迁移到 Responses](https://developers.openai.com/api/docs/guides/assistants/migration) 时有所帮助。

## 创建 assistant

我们建议在 Assistants API 中使用 OpenAI 的 &lt;a href="/api/docs/models"&gt;latest models&lt;/a&gt;，以获得最佳结果和最高的工具兼容性。

开始时，创建 Assistant 只需要指定要使用的 `model`。不过，你还可以进一步自定义 Assistant 的行为：

1. 使用 `instructions` 参数来引导 Assistant 的个性并定义它的目标。Instructions 类似于 Chat Completions API 中的 system message。
2. 使用 `tools` 参数让 Assistant 访问最多 128 个工具。你可以让它访问 OpenAI 内置工具，例如 `code_interpreter` 和 `file_search`，也可以通过 `function` calling 调用第三方工具。
3. 使用 `tool_resources` 参数，让 `code_interpreter` 和 `file_search` 等工具访问文件。文件通过 `File` [upload endpoint](https://developers.openai.com/api/docs/api-reference/files/create) 上传，并且必须将 `purpose` 设置为 `assistants`，才能与此 API 一起使用。

例如，要创建一个可以基于 `.csv` 文件生成数据可视化的 Assistant，请先上传文件。

```python
file = client.files.create(
  file=open("revenue-forecast.csv", "rb"),
  purpose='assistants'
)
```

```javascript
const file = await openai.files.create({
  file: fs.createReadStream("revenue-forecast.csv"),
  purpose: "assistants",
});
```

```bash
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="assistants" \
  -F file="@revenue-forecast.csv"
```


然后，创建启用了 `code_interpreter` 工具的 Assistant，并将该文件作为资源提供给工具。

```python
assistant = client.beta.assistants.create(
  name="Data visualizer",
  description="You are great at creating beautiful data visualizations. You analyze data present in .csv files, understand trends, and come up with data visualizations relevant to those trends. You also share a brief text summary of the trends observed.",
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
const assistant = await openai.beta.assistants.create({
  name: "Data visualizer",
  description: "You are great at creating beautiful data visualizations. You analyze data present in .csv files, understand trends, and come up with data visualizations relevant to those trends. You also share a brief text summary of the trends observed.",
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
curl https://api.openai.com/v1/assistants \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "name": "Data visualizer",
    "description": "You are great at creating beautiful data visualizations. You analyze data present in .csv files, understand trends, and come up with data visualizations relevant to those trends. You also share a brief text summary of the trends observed.",
    "model": "gpt-4o",
    "tools": [{"type": "code_interpreter"}],
    "tool_resources": {
      "code_interpreter": {
        "file_ids": ["file-BK7bzQj3FfZFXr7DbL6xJwfo"]
      }
    }
  }'
```


你最多可以向 `code_interpreter` 附加 20 个文件，向 `file_search` 附加 10,000 个文件（使用 `vector_store` [对象](https://developers.openai.com/api/docs/api-reference/vector-stores/object)）。对于从 2025 年 11 月开始创建的 vector store，`file_search` 的限制是 100,000,000 个文件。

每个文件最大 512 MB，且最多包含 5,000,000 个 token。默认情况下，每个 project 总共最多可存储 2.5 TB 文件。没有组织级存储限制。你可以联系我们的支持团队来提高此限制。

## 管理 Thread 和 Message

Thread 和 Message 表示 Assistant 与用户之间的一次会话。每个 Thread 最多可包含 100,000 条 Message。一旦 Message 大小超过模型的上下文窗口，Thread 会尝试智能截断消息，然后才会完全丢弃它认为最不重要的消息。

你可以像这样创建一个带初始 Message 列表的 Thread：

```python
thread = client.beta.threads.create(
  messages=[
    {
      "role": "user",
      "content": "Create 3 data visualizations based on the trends in this file.",
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
      "content": "Create 3 data visualizations based on the trends in this file.",
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
curl https://api.openai.com/v1/threads \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Create 3 data visualizations based on the trends in this file.",
        "attachments": [
          {
            "file_id": "file-ACq8OjcLQm2eIG0BvRM4z5qX",
            "tools": [{"type": "code_interpreter"}]
          }
        ]
      }
    ]
  }'
```


Message 可以包含文本、图片或文件附件。Message 的 `attachments` 是一种 helper 方法，会将文件添加到 thread 的 `tool_resources`。你也可以选择直接把文件添加到 `thread.tool_resources`。

### 创建图片输入内容

Message 内容可以包含外部图片 URL，或通过 [File API](https://developers.openai.com/api/docs/api-reference/files/create) 上传的 File ID。只有支持 Vision 的[模型](https://developers.openai.com/api/docs/models)可以接受图片输入。支持的图片内容类型包括 png、jpg、gif 和 webp。创建图片文件时，传入 `purpose="vision"`，以便之后下载并显示输入内容。Project 的总文件存储限制为 2.5 TB，且没有组织级存储限制。请联系我们申请提高限制。

除非另有指定，否则工具无法访问图片内容。要把图片文件传递给 Code Interpreter，请在 message `attachments` 列表中添加 file ID，让工具能够读取和分析输入。Code Interpreter 目前无法下载图片 URL。

```python
file = client.files.create(
  file=open("myimage.png", "rb"),
  purpose="vision"
)
thread = client.beta.threads.create(
  messages=[
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is the difference between these images?"
        },
        {
          "type": "image_url",
          "image_url": {"url": "https://example.com/image.png"}
        },
        {
          "type": "image_file",
          "image_file": {"file_id": file.id}
        },
      ],
    }
  ]
)
```

```javascript
import fs from "fs";
const file = await openai.files.create({
  file: fs.createReadStream("myimage.png"),
  purpose: "vision",
});
const thread = await openai.beta.threads.create({
  messages: [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is the difference between these images?"
        },
        {
          "type": "image_url",
          "image_url": {"url": "https://example.com/image.png"}
        },
        {
          "type": "image_file",
          "image_file": {"file_id": file.id}
        },
      ]
    }
  ]
});
```

```bash
# Upload a file with an "vision" purpose
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="vision" \
  -F file="@/path/to/myimage.png"

## Pass the file ID in the content

curl https://api.openai.com/v1/threads \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "Content-Type: application/json" \
-H "OpenAI-Beta: assistants=v2" \
-d '{
"messages": [
{
"role": "user",
"content": [
{
"type": "text",
"text": "What is the difference between these images?"
},
{
"type": "image_url",
"image_url": {"url": "https://example.com/image.png"}
},
{
"type": "image_file",
"image_file": {"file_id": file.id}
}
]
}
]
}'
```


#### 低保真或高保真的图片理解

通过控制 `detail` 参数，你可以控制模型如何处理图片并生成文本理解。该参数有三个选项：`low`、`high` 或 `auto`。

- `low` 会启用“low res”模式。模型会收到一张低分辨率的 512px x 512px 图片版本，并用 85 个 token 的预算表示该图片。这使 API 能够更快返回响应，并为不需要高细节的用例消耗更少输入 token。
- `high` 会启用“high res”模式，该模式会先让模型看到低分辨率图片，然后根据输入图片大小创建详细裁剪。请使用 [pricing calculator](https://openai.com/api/pricing/) 查看不同图片尺寸的 token 数。

```python
thread = client.beta.threads.create(
  messages=[
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is this an image of?"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://example.com/image.png",
            "detail": "high"
          }
        },
      ],
    }
  ]
)
```

```javascript
const thread = await openai.beta.threads.create({
  messages: [
    {
      "role": "user",
      "content": [
          {
            "type": "text",
            "text": "What is this an image of?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://example.com/image.png",
              "detail": "high"
            }
          },
      ]
    }
  ]
});
```

```bash
curl https://api.openai.com/v1/threads \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is this an image of?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://example.com/image.png",
              "detail": "high"
            }
          },
        ]
      }
    ]
  }'
```


### 上下文窗口管理

Assistants API 会自动管理截断，以确保它保持在模型的最大上下文长度内。你可以在创建 Run 时指定希望使用的最大 token 数，和/或希望在 Run 中包含的最近消息数量，从而自定义此行为。

#### Max Completion 和 Max Prompt Tokens

要控制单个 Run 中的 token 使用量，请在创建 Run 时设置 `max_prompt_tokens` 和 `max_completion_tokens`。这些限制适用于 Run 生命周期内所有 completion 使用的 token 总数。

例如，以 `max_prompt_tokens` 设为 500、`max_completion_tokens` 设为 1000 来启动 Run，意味着第一次 completion 会把 thread 截断到 500 token，并将输出限制在 1000 token。如果第一次 completion 只使用了 200 个 prompt token 和 300 个 completion token，那么第二次 completion 将有 300 个 prompt token 和 700 个 completion token 的可用限额。

如果某次 completion 达到 `max_completion_tokens` 限制，Run 会以 `incomplete` 状态终止，并在 Run 对象的 `incomplete_details` 字段中提供详情。

使用 File Search 工具时，我们建议将 max_prompt_tokens 设置为不低于 20,000。对于更长的对话或与 File Search 的多次交互，请考虑将此限制提高到 50,000，或者理想情况下，完全移除 max_prompt_tokens 限制，以获得最高质量的结果。

#### 截断策略

你也可以指定截断策略，以控制如何将你的 thread 渲染进模型的上下文窗口。
使用类型为 `auto` 的截断策略会使用 OpenAI 的默认截断策略。使用类型为 `last_messages` 的截断策略时，你可以指定上下文窗口中要包含的最近消息数量。

### Message annotation

Assistants 创建的 Message 可能在对象的 `content` 数组中包含 [`annotations`](https://developers.openai.com/api/docs/api-reference/messages/object#messages/object-content)。Annotation 提供信息，说明你应如何为 Message 中的文本添加标注。

Annotation 有两种类型：

1. `file_citation`：File citation 由 [`file_search`](/mirror/api/docs/assistants/tools/file-search) 工具创建，用于定义对某个特定文件的引用，该文件已上传并由 Assistant 用来生成响应。
2. `file_path`：File path annotation 由 [`code_interpreter`](/mirror/api/docs/assistants/tools/code-interpreter) 工具创建，包含对该工具生成文件的引用。

当 Message 对象中存在 annotation 时，你会在文本中看到模型生成的、不可读的子字符串，应当用 annotation 替换这些字符串。这些字符串可能类似于 `【13†source】` 或 `sandbox:/mnt/data/file.csv`。下面是一段 Python 示例代码，用 annotation 替换这些字符串。

```python
# Retrieve the message object
message = client.beta.threads.messages.retrieve(
  thread_id="...",
  message_id="..."
)

# Extract the message content

message_content = message.content[0].text
annotations = message_content.annotations
citations = []

# Iterate over the annotations and add footnotes

for index, annotation in enumerate(annotations): # Replace the text with a footnote
message_content.value = message_content.value.replace(annotation.text, f' [{index}]')

    # Gather citations based on annotation attributes
    if (file_citation := getattr(annotation, 'file_citation', None)):
        cited_file = client.files.retrieve(file_citation.file_id)
        citations.append(f'[{index}] {file_citation.quote} from {cited_file.filename}')
    elif (file_path := getattr(annotation, 'file_path', None)):
        cited_file = client.files.retrieve(file_path.file_id)
        citations.append(f'[{index}] Click <here> to download {cited_file.filename}')
        # Note: File download functionality not implemented above for brevity

# Add footnotes to the end of the message before displaying to user

message_content.value += '\n' + '\n'.join(citations)
```


## Run 和 Run Step

当 Thread 中已经拥有来自用户的所有必要上下文后，你可以使用所选 Assistant 来运行该 Thread。

```python
run = client.beta.threads.runs.create(
  thread_id=thread.id,
  assistant_id=assistant.id
)
```

```javascript
const run = await openai.beta.threads.runs.create(
  thread.id,
  { assistant_id: assistant.id }
);
```

```bash
curl https://api.openai.com/v1/threads/THREAD_ID/runs \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "assistant_id": "asst_ToSF7Gb04YMj8AMMm50ZLLtY"
  }'
```


默认情况下，Run 会使用 Assistant 对象中指定的 `model` 和 `tools` 配置，但为了获得额外灵活性，你可以在创建 Run 时覆盖其中大多数配置：

```python
run = client.beta.threads.runs.create(
  thread_id=thread.id,
  assistant_id=assistant.id,
  model="gpt-4o",
  instructions="New instructions that override the Assistant instructions",
  tools=[{"type": "code_interpreter"}, {"type": "file_search"}]
)
```

```javascript
const run = await openai.beta.threads.runs.create(
  thread.id,
  {
    assistant_id: assistant.id,
    model: "gpt-4o",
    instructions: "New instructions that override the Assistant instructions",
    tools: [{"type": "code_interpreter"}, {"type": "file_search"}]
  }
);
```

```bash
curl https://api.openai.com/v1/threads/THREAD_ID/runs \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "assistant_id": "ASSISTANT_ID",
    "model": "gpt-4o",
    "instructions": "New instructions that override the Assistant instructions",
    "tools": [{"type": "code_interpreter"}, {"type": "file_search"}]
  }'
```


注意：与 Assistant 关联的 `tool_resources` 不能在 Run 创建期间被覆盖。你必须使用 [modify Assistant](https://developers.openai.com/api/docs/api-reference/assistants/modifyAssistant) endpoint 来执行此操作。

#### Run 生命周期

Run 对象可能具有多种状态。

![Run 生命周期，展示可能状态转换的图示](https://cdn.openai.com/API/docs/images/diagram-run-statuses-v2.png)

| 状态              | 定义                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `queued`          | 当 Run 首次创建，或你完成 `required_action` 时，它们会进入 queued 状态。它们应几乎立即转为 `in_progress`。                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `in_progress`     | 在 in_progress 期间，Assistant 会使用模型和工具执行步骤。你可以通过查看 [Run Steps](https://developers.openai.com/api/docs/api-reference/runs/step-object) 来了解 Run 正在取得的进展。                                                                                                                                                                                                                                                                                                                                        |
| `completed`       | Run 已成功完成。你现在可以查看 Assistant 添加到 Thread 的所有 Message，以及 Run 执行过的所有步骤。你也可以通过向 Thread 添加更多用户 Message 并创建另一个 Run 来继续对话。                                                                                                                                                                                                                                                                                                                                                  |
| `requires_action` | 使用 [Function calling](/mirror/api/docs/assistants/tools/function-calling) 工具时，一旦模型确定要调用的函数名称和参数，Run 就会进入 `required_action` 状态。然后你必须运行这些函数，并在 run 继续之前[提交输出](https://developers.openai.com/api/docs/api-reference/runs/submitToolOutputs)。如果输出没有在 `expires_at` 时间戳之前提供（大约是创建后 10 分钟），run 会进入 expired 状态。                                                |
| `expired`         | 当 function calling 输出没有在 `expires_at` 前提交，导致 run 过期时，会发生这种情况。此外，如果 run 执行时间太长并超过 `expires_at` 中说明的时间，我们的系统也会让 run 过期。                                                                                                                                                                                                                                                                                                                                                 |
| `cancelling`      | 你可以使用 [Cancel Run](https://developers.openai.com/api/docs/api-reference/runs/cancelRun) endpoint 尝试取消一个 `in_progress` run。取消尝试成功后，Run 状态会变为 `cancelled`。取消会被尝试，但不保证一定成功。                                                                                                                                                                                                                                                                                                             |
| `cancelled`       | Run 已成功取消。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `failed`          | 你可以查看 Run 中的 `last_error` 对象来了解失败原因。失败时间戳会记录在 `failed_at` 下。                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `incomplete`      | Run 因达到 `max_prompt_tokens` 或 `max_completion_tokens` 而结束。你可以查看 Run 中的 `incomplete_details` 对象来了解具体原因。                                                                                                                                                                                                                                                                                                                                                                                               |

#### 轮询更新

如果你没有使用 [streaming](https://developers.openai.com/api/docs/assistants/overview#step-4-create-a-run?context=with-streaming)，为了让 run 状态保持最新，你需要定期[检索 Run](https://developers.openai.com/api/docs/api-reference/runs/getRun) 对象。每次检索对象时，都可以检查 run 状态，以决定你的应用下一步应该做什么。

你也可以使用我们的 [Node](https://github.com/openai/openai-node?tab=readme-ov-file#polling-helpers) 和 [Python](https://github.com/openai/openai-python?tab=readme-ov-file#polling-helpers) SDK 中的 Polling Helpers 来帮助完成此事。这些 helper 会自动为你轮询 Run 对象，并在它进入终止状态时返回 Run 对象。

#### Thread lock

当 Run 处于 `in_progress` 且不在终止状态时，Thread 会被锁定。这意味着：

- 无法向 Thread 添加新的 Message。
- 无法在该 Thread 上创建新的 Run。

#### Run step

![Run step 生命周期，展示可能状态转换的图示](https://cdn.openai.com/API/docs/images/diagram-2.png)

Run step 状态与 Run 状态含义相同。

Run Step 对象中大多数有趣的细节位于 `step_details` 字段。step detail 有两种类型：

1. `message_creation`：当 Assistant 在 Thread 上创建 Message 时，会创建此 Run Step。
2. `tool_calls`：当 Assistant 调用工具时，会创建此 Run Step。相关详情会在 [Tools](/mirror/api/docs/assistants/tools) 指南的相应章节中介绍。

## 数据访问指导

目前，通过 API 创建的 Assistants、Threads、Messages 和 Vector Stores 都限定在创建它们的 Project 范围内。因此，任何拥有该 Project API key 访问权限的人都能够读取或写入该 Project 中的 Assistants、Threads、Messages 和 Runs。

我们强烈建议采用以下数据访问控制：

- _实现授权。_ 在对 Assistants、Threads、Messages 和 Vector Stores 执行读取或写入之前，请确保最终用户有权这样做。例如，在你的数据库中存储最终用户可访问的 object ID，并在通过 API 获取 object ID 前检查它。
- _限制 API key 访问。_ 请仔细考虑组织中哪些人应该拥有 API key 并成为 Project 成员。定期审计此列表。API key 会启用大量操作，包括读取和修改敏感信息，例如 Messages 和 Files。
- _创建单独账户。_ 考虑为不同应用创建单独的 Project，以便在多个应用之间隔离数据。

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

Don't start a new integration on the Assistants API. We've announced plans to deprecate it soon, as the Responses API now provides the same features and a more elegant integration.

There are several concepts involved in building an app with the Assistants API, covered below in case it helps with your [migration to Responses](https://developers.openai.com/api/docs/guides/assistants/migration).

## Creating assistants

We recommend using OpenAI's &lt;a href="/api/docs/models"&gt;latest models&lt;/a&gt; with
  the Assistants API for best results and maximum compatibility with tools.

To get started, creating an Assistant only requires specifying the `model` to use. But you can further customize the behavior of the Assistant:

1. Use the `instructions` parameter to guide the personality of the Assistant and define its goals. Instructions are similar to system messages in the Chat Completions API.
2. Use the `tools` parameter to give the Assistant access to up to 128 tools. You can give it access to OpenAI built-in tools like `code_interpreter` and `file_search`, or call a third-party tools via a `function` calling.
3. Use the `tool_resources` parameter to give the tools like `code_interpreter` and `file_search` access to files. Files are uploaded using the `File` [upload endpoint](https://developers.openai.com/api/docs/api-reference/files/create) and must have the `purpose` set to `assistants` to be used with this API.

For example, to create an Assistant that can create data visualization based on a `.csv` file, first upload a file.

```python
file = client.files.create(
  file=open("revenue-forecast.csv", "rb"),
  purpose='assistants'
)
```

```javascript
const file = await openai.files.create({
  file: fs.createReadStream("revenue-forecast.csv"),
  purpose: "assistants",
});
```

```bash
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="assistants" \
  -F file="@revenue-forecast.csv"
```


Then, create the Assistant with the `code_interpreter` tool enabled and provide the file as a resource to the tool.

```python
assistant = client.beta.assistants.create(
  name="Data visualizer",
  description="You are great at creating beautiful data visualizations. You analyze data present in .csv files, understand trends, and come up with data visualizations relevant to those trends. You also share a brief text summary of the trends observed.",
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
const assistant = await openai.beta.assistants.create({
  name: "Data visualizer",
  description: "You are great at creating beautiful data visualizations. You analyze data present in .csv files, understand trends, and come up with data visualizations relevant to those trends. You also share a brief text summary of the trends observed.",
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
curl https://api.openai.com/v1/assistants \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "name": "Data visualizer",
    "description": "You are great at creating beautiful data visualizations. You analyze data present in .csv files, understand trends, and come up with data visualizations relevant to those trends. You also share a brief text summary of the trends observed.",
    "model": "gpt-4o",
    "tools": [{"type": "code_interpreter"}],
    "tool_resources": {
      "code_interpreter": {
        "file_ids": ["file-BK7bzQj3FfZFXr7DbL6xJwfo"]
      }
    }
  }'
```


You can attach a maximum of 20 files to `code_interpreter` and 10,000 files to `file_search` (using `vector_store` [objects](https://developers.openai.com/api/docs/api-reference/vector-stores/object)). For vector stores created starting in November 2025, the `file_search` limit is 100,000,000 files.

Each file can be at most 512 MB in size and have a maximum of 5,000,000 tokens. By default, each project can store up to 2.5 TB of files total. There is no organization-wide storage limit. You can reach out to our support team to increase this limit.

## Managing Threads and Messages

Threads and Messages represent a conversation session between an Assistant and a user. There is a limit of 100,000 Messages per Thread. Once the size of the Messages exceeds the context window of the model, the Thread will attempt to smartly truncate messages, before fully dropping the ones it considers the least important.

You can create a Thread with an initial list of Messages like this:

```python
thread = client.beta.threads.create(
  messages=[
    {
      "role": "user",
      "content": "Create 3 data visualizations based on the trends in this file.",
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
      "content": "Create 3 data visualizations based on the trends in this file.",
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
curl https://api.openai.com/v1/threads \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Create 3 data visualizations based on the trends in this file.",
        "attachments": [
          {
            "file_id": "file-ACq8OjcLQm2eIG0BvRM4z5qX",
            "tools": [{"type": "code_interpreter"}]
          }
        ]
      }
    ]
  }'
```


Messages can contain text, images, or file attachment. Message `attachments` are helper methods that add files to a thread's `tool_resources`. You can also choose to add files to the `thread.tool_resources` directly.

### Creating image input content

Message content can contain either external image URLs or File IDs uploaded via the [File API](https://developers.openai.com/api/docs/api-reference/files/create). Only [models](https://developers.openai.com/api/docs/models) with Vision support can accept image input. Supported image content types include png, jpg, gif, and webp. When creating image files, pass `purpose="vision"` to allow you to later download and display the input content. Projects are limited to 2.5 TB total file storage, and there is no organization-wide storage limit. Please contact us to request a limit increase.

Tools cannot access image content unless specified. To pass image files to Code Interpreter, add the file ID in the message `attachments` list to allow the tool to read and analyze the input. Image URLs cannot be downloaded in Code Interpreter today.

```python
file = client.files.create(
  file=open("myimage.png", "rb"),
  purpose="vision"
)
thread = client.beta.threads.create(
  messages=[
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is the difference between these images?"
        },
        {
          "type": "image_url",
          "image_url": {"url": "https://example.com/image.png"}
        },
        {
          "type": "image_file",
          "image_file": {"file_id": file.id}
        },
      ],
    }
  ]
)
```

```javascript
import fs from "fs";
const file = await openai.files.create({
  file: fs.createReadStream("myimage.png"),
  purpose: "vision",
});
const thread = await openai.beta.threads.create({
  messages: [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is the difference between these images?"
        },
        {
          "type": "image_url",
          "image_url": {"url": "https://example.com/image.png"}
        },
        {
          "type": "image_file",
          "image_file": {"file_id": file.id}
        },
      ]
    }
  ]
});
```

```bash
# Upload a file with an "vision" purpose
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="vision" \
  -F file="@/path/to/myimage.png"

## Pass the file ID in the content

curl https://api.openai.com/v1/threads \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "Content-Type: application/json" \
-H "OpenAI-Beta: assistants=v2" \
-d '{
"messages": [
{
"role": "user",
"content": [
{
"type": "text",
"text": "What is the difference between these images?"
},
{
"type": "image_url",
"image_url": {"url": "https://example.com/image.png"}
},
{
"type": "image_file",
"image_file": {"file_id": file.id}
}
]
}
]
}'
```


#### Low or high fidelity image understanding

By controlling the `detail` parameter, which has three options, `low`, `high`, or `auto`, you have control over how the model processes the image and generates its textual understanding.

- `low` will enable the "low res" mode. The model will receive a low-res 512px x 512px version of the image, and represent the image with a budget of 85 tokens. This allows the API to return faster responses and consume fewer input tokens for use cases that do not require high detail.
- `high` will enable "high res" mode, which first allows the model to see the low res image and then creates detailed crops of input images based on the input image size. Use the [pricing calculator](https://openai.com/api/pricing/) to see token counts for various image sizes.

```python
thread = client.beta.threads.create(
  messages=[
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What is this an image of?"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://example.com/image.png",
            "detail": "high"
          }
        },
      ],
    }
  ]
)
```

```javascript
const thread = await openai.beta.threads.create({
  messages: [
    {
      "role": "user",
      "content": [
          {
            "type": "text",
            "text": "What is this an image of?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://example.com/image.png",
              "detail": "high"
            }
          },
      ]
    }
  ]
});
```

```bash
curl https://api.openai.com/v1/threads \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is this an image of?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://example.com/image.png",
              "detail": "high"
            }
          },
        ]
      }
    ]
  }'
```


### Context window management

The Assistants API automatically manages the truncation to ensure it stays within the model's maximum context length. You can customize this behavior by specifying the maximum tokens you'd like a run to utilize and/or the maximum number of recent messages you'd like to include in a run.

#### Max Completion and Max Prompt Tokens

To control the token usage in a single Run, set `max_prompt_tokens` and `max_completion_tokens` when creating the Run. These limits apply to the total number of tokens used in all completions throughout the Run's lifecycle.

For example, initiating a Run with `max_prompt_tokens` set to 500 and `max_completion_tokens` set to 1000 means the first completion will truncate the thread to 500 tokens and cap the output at 1000 tokens. If only 200 prompt tokens and 300 completion tokens are used in the first completion, the second completion will have available limits of 300 prompt tokens and 700 completion tokens.

If a completion reaches the `max_completion_tokens` limit, the Run will terminate with a status of `incomplete`, and details will be provided in the `incomplete_details` field of the Run object.

When using the File Search tool, we recommend setting the max_prompt_tokens to
  no less than 20,000. For longer conversations or multiple interactions with
  File Search, consider increasing this limit to 50,000, or ideally, removing
  the max_prompt_tokens limits altogether to get the highest quality results.

#### Truncation Strategy

You may also specify a truncation strategy to control how your thread should be rendered into the model's context window.
Using a truncation strategy of type `auto` will use OpenAI's default truncation strategy. Using a truncation strategy of type `last_messages` will allow you to specify the number of the most recent messages to include in the context window.

### Message annotations

Messages created by Assistants may contain [`annotations`](https://developers.openai.com/api/docs/api-reference/messages/object#messages/object-content) within the `content` array of the object. Annotations provide information around how you should annotate the text in the Message.

There are two types of Annotations:

1. `file_citation`: File citations are created by the [`file_search`](/mirror/api/docs/assistants/tools/file-search) tool and define references to a specific file that was uploaded and used by the Assistant to generate the response.
2. `file_path`: File path annotations are created by the [`code_interpreter`](/mirror/api/docs/assistants/tools/code-interpreter) tool and contain references to the files generated by the tool.

When annotations are present in the Message object, you'll see illegible model-generated substrings in the text that you should replace with the annotations. These strings may look something like `【13†source】` or `sandbox:/mnt/data/file.csv`. Here’s an example python code snippet that replaces these strings with the annotations.

```python
# Retrieve the message object
message = client.beta.threads.messages.retrieve(
  thread_id="...",
  message_id="..."
)

# Extract the message content

message_content = message.content[0].text
annotations = message_content.annotations
citations = []

# Iterate over the annotations and add footnotes

for index, annotation in enumerate(annotations): # Replace the text with a footnote
message_content.value = message_content.value.replace(annotation.text, f' [{index}]')

    # Gather citations based on annotation attributes
    if (file_citation := getattr(annotation, 'file_citation', None)):
        cited_file = client.files.retrieve(file_citation.file_id)
        citations.append(f'[{index}] {file_citation.quote} from {cited_file.filename}')
    elif (file_path := getattr(annotation, 'file_path', None)):
        cited_file = client.files.retrieve(file_path.file_id)
        citations.append(f'[{index}] Click <here> to download {cited_file.filename}')
        # Note: File download functionality not implemented above for brevity

# Add footnotes to the end of the message before displaying to user

message_content.value += '\n' + '\n'.join(citations)
```


## Runs and Run Steps

When you have all the context you need from your user in the Thread, you can run the Thread with an Assistant of your choice.

```python
run = client.beta.threads.runs.create(
  thread_id=thread.id,
  assistant_id=assistant.id
)
```

```javascript
const run = await openai.beta.threads.runs.create(
  thread.id,
  { assistant_id: assistant.id }
);
```

```bash
curl https://api.openai.com/v1/threads/THREAD_ID/runs \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "assistant_id": "asst_ToSF7Gb04YMj8AMMm50ZLLtY"
  }'
```


By default, a Run will use the `model` and `tools` configuration specified in Assistant object, but you can override most of these when creating the Run for added flexibility:

```python
run = client.beta.threads.runs.create(
  thread_id=thread.id,
  assistant_id=assistant.id,
  model="gpt-4o",
  instructions="New instructions that override the Assistant instructions",
  tools=[{"type": "code_interpreter"}, {"type": "file_search"}]
)
```

```javascript
const run = await openai.beta.threads.runs.create(
  thread.id,
  {
    assistant_id: assistant.id,
    model: "gpt-4o",
    instructions: "New instructions that override the Assistant instructions",
    tools: [{"type": "code_interpreter"}, {"type": "file_search"}]
  }
);
```

```bash
curl https://api.openai.com/v1/threads/THREAD_ID/runs \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "assistant_id": "ASSISTANT_ID",
    "model": "gpt-4o",
    "instructions": "New instructions that override the Assistant instructions",
    "tools": [{"type": "code_interpreter"}, {"type": "file_search"}]
  }'
```


Note: `tool_resources` associated with the Assistant cannot be overridden during Run creation. You must use the [modify Assistant](https://developers.openai.com/api/docs/api-reference/assistants/modifyAssistant) endpoint to do this.

#### Run lifecycle

Run objects can have multiple statuses.

![Run lifecycle - diagram showing possible status transitions](https://cdn.openai.com/API/docs/images/diagram-run-statuses-v2.png)

| Status            | Definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queued`          | When Runs are first created or when you complete the `required_action`, they are moved to a queued status. They should almost immediately move to `in_progress`.                                                                                                                                                                                                                                                                                                                                           |
| `in_progress`     | While in_progress, the Assistant uses the model and tools to perform steps. You can view progress being made by the Run by examining the [Run Steps](https://developers.openai.com/api/docs/api-reference/runs/step-object).                                                                                                                                                                                                                                                                                                            |
| `completed`       | The Run successfully completed! You can now view all Messages the Assistant added to the Thread, and all the steps the Run took. You can also continue the conversation by adding more user Messages to the Thread and creating another Run.                                                                                                                                                                                                                                                               |
| `requires_action` | When using the [Function calling](/mirror/api/docs/assistants/tools/function-calling) tool, the Run will move to a `required_action` state once the model determines the names and arguments of the functions to be called. You must then run those functions and [submit the outputs](https://developers.openai.com/api/docs/api-reference/runs/submitToolOutputs) before the run proceeds. If the outputs are not provided before the `expires_at` timestamp passes (roughly 10 mins past creation), the run will move to an expired status. |
| `expired`         | This happens when the function calling outputs were not submitted before `expires_at` and the run expires. Additionally, if the runs take too long to execute and go beyond the time stated in `expires_at`, our systems will expire the run.                                                                                                                                                                                                                                                              |
| `cancelling`      | You can attempt to cancel an `in_progress` run using the [Cancel Run](https://developers.openai.com/api/docs/api-reference/runs/cancelRun) endpoint. Once the attempt to cancel succeeds, status of the Run moves to `cancelled`. Cancellation is attempted but not guaranteed.                                                                                                                                                                                                                                                         |
| `cancelled`       | Run was successfully cancelled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `failed`          | You can view the reason for the failure by looking at the `last_error` object in the Run. The timestamp for the failure will be recorded under `failed_at`.                                                                                                                                                                                                                                                                                                                                                |
| `incomplete`      | Run ended due to `max_prompt_tokens` or `max_completion_tokens` reached. You can view the specific reason by looking at the `incomplete_details` object in the Run.                                                                                                                                                                                                                                                                                                                                        |

#### Polling for updates

If you are not using [streaming](https://developers.openai.com/api/docs/assistants/overview#step-4-create-a-run?context=with-streaming), in order to keep the status of your run up to date, you will have to periodically [retrieve the Run](https://developers.openai.com/api/docs/api-reference/runs/getRun) object. You can check the status of the run each time you retrieve the object to determine what your application should do next.

You can optionally use Polling Helpers in our [Node](https://github.com/openai/openai-node?tab=readme-ov-file#polling-helpers) and [Python](https://github.com/openai/openai-python?tab=readme-ov-file#polling-helpers) SDKs to help you with this. These helpers will automatically poll the Run object for you and return the Run object when it's in a terminal state.

#### Thread locks

When a Run is `in_progress` and not in a terminal state, the Thread is locked. This means that:

- New Messages cannot be added to the Thread.
- New Runs cannot be created on the Thread.

#### Run steps

![Run steps lifecycle - diagram showing possible status transitions](https://cdn.openai.com/API/docs/images/diagram-2.png)

Run step statuses have the same meaning as Run statuses.

Most of the interesting detail in the Run Step object lives in the `step_details` field. There can be two types of step details:

1. `message_creation`: This Run Step is created when the Assistant creates a Message on the Thread.
2. `tool_calls`: This Run Step is created when the Assistant calls a tool. Details around this are covered in the relevant sections of the [Tools](/mirror/api/docs/assistants/tools) guide.

## Data Access Guidance

Currently, Assistants, Threads, Messages, and Vector Stores created via the API are scoped to the Project they're created in. As such, any person with API key access to that Project is able to read or write Assistants, Threads, Messages, and Runs in the Project.

We strongly recommend the following data access controls:

- _Implement authorization._ Before performing reads or writes on Assistants, Threads, Messages, and Vector Stores, ensure that the end-user is authorized to do so. For example, store in your database the object IDs that the end-user has access to, and check it before fetching the object ID with the API.
- _Restrict API key access._ Carefully consider who in your organization should have API keys and be part of a Project. Periodically audit this list. API keys enable a wide range of operations including reading and modifying sensitive information, such as Messages and Files.
- _Create separate accounts._ Consider creating separate Projects for different applications in order to isolate data across multiple applications.

:::
:::

