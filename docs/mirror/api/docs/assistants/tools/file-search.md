---
title: "Assistants File Search"
description: "Use File Search as a built-in RAG tool for assistants."
outline: deep
---

# Assistants File Search

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/assistants/tools/file-search](https://developers.openai.com/api/docs/assistants/tools/file-search)
- Markdown 来源：[https://developers.openai.com/api/docs/assistants/tools/file-search.md](https://developers.openai.com/api/docs/assistants/tools/file-search.md)
- 抓取时间：2026-06-27T05:53:56.855Z
- Checksum：`a5294400fb097c13ca7ee99e244663670be048ab280ea26deb799d0cd44fefae`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

File Search 可用模型以外的知识增强 Assistant，例如专有产品信息或用户提供的文档。OpenAI 会自动解析文档、切分文档块、创建并存储 embeddings，并同时使用向量搜索和关键词搜索来检索相关内容，以回答用户查询。

## 快速开始

在这个示例中，我们将创建一个可以帮助回答公司财务报表问题的 assistant。

### 第 1 步：创建启用 File Search 的新 Assistant

在 Assistant 的 `tools` 参数中启用 `file_search`，创建一个新的 assistant。

```python
from openai import OpenAI

client = OpenAI()

assistant = client.beta.assistants.create(
name="Financial Analyst Assistant",
instructions="You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
model="gpt-4o",
tools=[{"type": "file_search"}],
)
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

async function main() {
const assistant = await openai.beta.assistants.create({
name: "Financial Analyst Assistant",
instructions: "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
model: "gpt-4o",
tools: [{ type: "file_search" }],
});
}

main();
```

```bash
curl https://api.openai.com/v1/assistants \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "OpenAI-Beta: assistants=v2" \
-d '{
"name": "Financial Analyst Assistant",
"instructions": "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
"tools": [{"type": "file_search"}],
"model": "gpt-4o"
}'
```


启用 `file_search` 工具后，模型会根据用户消息决定何时检索内容。

### 第 2 步：上传文件并将其添加到 Vector Store

为了访问你的文件，`file_search` 工具会使用 Vector Store 对象。
上传文件并创建一个 Vector Store 来容纳它们。
创建 Vector Store 后，你应轮询其状态，直到所有文件都离开 `in_progress` 状态，
以确保全部内容都已完成处理。SDK 提供了可一次性完成上传和轮询的辅助方法。

```python
# Create a vector store called "Financial Statements"
vector_store = client.vector_stores.create(name="Financial Statements")

# Ready the files for upload to OpenAI

file_paths = ["edgar/goog-10k.pdf", "edgar/brka-10k.txt"]
file_streams = [open(path, "rb") for path in file_paths]

# Use the upload and poll SDK helper to upload the files, add them to the vector store,

# and poll the status of the file batch for completion.

file_batch = client.vector_stores.file_batches.upload_and_poll(
vector_store_id=vector_store.id, files=file_streams
)

# You can print the status and the file counts of the batch to see the result of this operation.

print(file_batch.status)
print(file_batch.file_counts)
```

```javascript
const fileStreams = ["edgar/goog-10k.pdf", "edgar/brka-10k.txt"].map((path) =>
fs.createReadStream(path),
);

// Create a vector store including our two files.
let vectorStore = await openai.vectorStores.create({
name: "Financial Statement",
});

await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, fileStreams)
```


### 第 3 步：更新 assistant 以使用新的 Vector Store

为了让 assistant 能访问这些文件，请用新的 `vector_store` id 更新 assistant 的 `tool_resources`。

```python
assistant = client.beta.assistants.update(
  assistant_id=assistant.id,
  tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
)
```

```javascript
await openai.beta.assistants.update(assistant.id, {
  tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
});
```


### 第 4 步：创建 thread

你也可以把文件作为 Message 附件附加到 thread。这样会创建另一个与该 thread 关联的 `vector_store`；如果这个 thread 已经附加了 vector store，则会把新文件附加到现有的 thread vector store。在该 thread 上创建 Run 时，file search 工具会同时查询来自 assistant 的 `vector_store` 和 thread 上的 `vector_store`。

在这个示例中，用户附加了一份 Apple 最新 10-K 文件的副本。

```python
# Upload the user provided file to OpenAI
message_file = client.files.create(
  file=open("edgar/aapl-10k.pdf", "rb"), purpose="assistants"
)

# Create a thread and attach the file to the message

thread = client.beta.threads.create(
messages=[
{
"role": "user",
"content": "How many shares of AAPL were outstanding at the end of of October 2023?", # Attach the new file to the message.
"attachments": [
{ "file_id": message_file.id, "tools": [{"type": "file_search"}] }
],
}
]
)

# The thread now has a vector store with that file in its tool resources.

print(thread.tool_resources.file_search)
```

```javascript
// A user wants to attach a file to a specific message, let's upload it.
const aapl10k = await openai.files.create({
file: fs.createReadStream("edgar/aapl-10k.pdf"),
purpose: "assistants",
});

const thread = await openai.beta.threads.create({
messages: [
{
role: "user",
content:
"How many shares of AAPL were outstanding at the end of of October 2023?",
// Attach the new file to the message.
attachments: [{ file_id: aapl10k.id, tools: [{ type: "file_search" }] }],
},
],
});

// The thread now has a vector store in its tool resources.
console.log(thread.tool_resources?.file_search);
```


使用消息附件创建的 vector store 默认过期策略为最后一次活跃后 7 天过期（“活跃”定义为该 vector store 最后一次参与某个 run）。这个默认设置可帮助你管理向量存储成本。你可以随时覆盖这些过期策略。在[这里](/mirror/api/docs/assistants/tools/file-search#managing-costs-with-expiration-policies)了解更多。

### 第 5 步：创建 run 并检查输出

现在，创建一个 Run，并观察模型如何使用 File Search 工具回答用户的问题。




使用流式传输
```python
from typing_extensions import override
from openai import AssistantEventHandler, OpenAI

client = OpenAI()

class EventHandler(AssistantEventHandler):
@override
def on_text_created(self, text) -> None:
print(f"\nassistant > ", end="", flush=True)

    @override
    def on_tool_call_created(self, tool_call):
        print(f"\nassistant > {tool_call.type}\n", flush=True)

    @override
    def on_message_done(self, message) -> None:
        # print a citation to the file searched
        message_content = message.content[0].text
        annotations = message_content.annotations
        citations = []
        for index, annotation in enumerate(annotations):
            message_content.value = message_content.value.replace(
                annotation.text, f"[{index}]"
            )
            if file_citation := getattr(annotation, "file_citation", None):
                cited_file = client.files.retrieve(file_citation.file_id)
                citations.append(f"[{index}] {cited_file.filename}")

        print(message_content.value)
        print("\n".join(citations))

# Then, we use the stream SDK helper

# with the EventHandler class to create the Run

# and stream the response.

with client.beta.threads.runs.stream(
thread_id=thread.id,
assistant_id=assistant.id,
instructions="Please address the user as Jane Doe. The user has a premium account.",
event_handler=EventHandler(),
) as stream:
stream.until_done()
```

```javascript
const stream = openai.beta.threads.runs
.stream(thread.id, {
assistant_id: assistant.id,
})
.on("textCreated", () => console.log("assistant >"))
.on("toolCallCreated", (event) => console.log("assistant " + event.type))
.on("messageDone", async (event) => {
if (event.content[0].type === "text") {
const { text } = event.content[0];
const { annotations } = text;
const citations: string[] = [];

      let index = 0;
      for (let annotation of annotations) {
        text.value = text.value.replace(annotation.text, "[" + index + "]");
        const { file_citation } = annotation;
        if (file_citation) {
          const citedFile = await openai.files.retrieve(file_citation.file_id);
          citations.push("[" + index + "]" + citedFile.filename);
        }
        index++;
      }

      console.log(text.value);
      console.log(citations.join("\n"));
    }
```



不使用流式传输
```python
# Use the create and poll SDK helper to create a run and poll the status of
# the run until it's in a terminal state.

run = client.beta.threads.runs.create_and_poll(
thread_id=thread.id, assistant_id=assistant.id
)

messages = list(client.beta.threads.messages.list(thread_id=thread.id, run_id=run.id))

message_content = messages[0].content[0].text
annotations = message_content.annotations
citations = []
for index, annotation in enumerate(annotations):
message_content.value = message_content.value.replace(annotation.text, f"[{index}]")
if file_citation := getattr(annotation, "file_citation", None):
cited_file = client.files.retrieve(file_citation.file_id)
citations.append(f"[{index}] {cited_file.filename}")

print(message_content.value)
print("\n".join(citations))
```

```javascript
const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
assistant_id: assistant.id,
});

const messages = await openai.beta.threads.messages.list(thread.id, {
run_id: run.id,
});

const message = messages.data.pop()!;
if (message.content[0].type === "text") {
const { text } = message.content[0];
const { annotations } = text;
const citations: string[] = [];

let index = 0;
for (let annotation of annotations) {
text.value = text.value.replace(annotation.text, "[" + index + "]");
const { file_citation } = annotation;
if (file_citation) {
const citedFile = await openai.files.retrieve(file_citation.file_id);
citations.push("[" + index + "]" + citedFile.filename);
}
index++;
}

console.log(text.value);
console.log(citations.join("\n"));
}
```





你的新 assistant 会查询两个已附加的 vector store（一个包含 `goog-10k.pdf` 和 `brka-10k.txt`，另一个包含 `aapl-10k.pdf`），并从 `aapl-10k.pdf` 返回此结果。

要检索模型所使用的 file search 结果内容，请使用 `include` 查询参数，并以 `?include[]=step_details.tool_calls[*].file_search.results[*].content` 格式提供值 `step_details.tool_calls[*].file_search.results[*].content`。

---

## 工作原理

`file_search` 工具开箱即用地实现了多项检索最佳实践，帮助你从文件中提取正确数据并增强模型响应。`file_search` 工具会：

- 重写用户查询，以便针对搜索进行优化。
- 将复杂用户查询拆解成多个可并行运行的搜索。
- 在 assistant 和 thread 的 vector store 中同时运行关键词搜索和语义搜索。
- 在生成最终响应之前，对搜索结果重新排序以选出最相关的内容。

默认情况下，`file_search` 工具使用以下设置，但你可以[配置](/mirror/api/docs/assistants/tools/file-search#customizing-file-search-settings)它们以满足自己的需求：

- Chunk 大小：800 tokens
- Chunk overlap：400 tokens
- Embedding 模型：`text-embedding-3-large`，256 维
- 添加到上下文中的最大 chunk 数：20（可能更少）
- Ranker：`auto`（OpenAI 将选择要使用的 ranker）
- Score threshold：0，最小排序分数

**已知限制**

我们正在努力在未来几个月中增加对以下已知限制的支持：

1. 支持使用自定义元数据进行确定性的搜索前过滤。
2. 支持解析文档中的图片（包括图表、曲线图、表格等图片）。
3. 支持对结构化文件格式（如 `csv` 或 `jsonl`）进行检索。
4. 更好地支持摘要生成；目前该工具针对搜索查询进行了优化。

## Vector stores

Vector Store 对象赋予 File Search 工具搜索文件的能力。向 `vector_store` 添加文件会自动解析、切分、嵌入并将该文件存储到一个支持关键词搜索和语义搜索的向量数据库中。每个 `vector_store` 最多可容纳 10,000 个文件。对于从 2025 年 11 月开始创建的 vector store，此限制为 100,000,000 个文件。Vector store 可以附加到 Assistants 和 Threads。目前，你最多可以向一个 assistant 附加一个 vector store，并且最多向一个 thread 附加一个 vector store。

#### 创建 vector store 并添加文件

你可以在单个 API 调用中创建 vector store 并向其中添加文件：

```python
vector_store = client.vector_stores.create(
  name="Product Documentation",
  file_ids=['file_1', 'file_2', 'file_3', 'file_4', 'file_5']
)
```

```javascript
const vectorStore = await openai.vectorStores.create({
  name: "Product Documentation",
  file_ids: ['file_1', 'file_2', 'file_3', 'file_4', 'file_5']
});
```


向 vector store 添加文件是异步操作。为确保操作完成，我们建议你使用官方 SDK 中的“create and poll”辅助方法。如果你没有使用 SDK，可以检索 `vector_store` 对象，并监控其 [`file_counts`](https://developers.openai.com/api/docs/api-reference/vector-stores/object#vector-stores/object-file_counts) 属性来查看文件摄取操作的结果。

也可以在 vector store 创建后，通过[创建 vector store files](https://developers.openai.com/api/docs/api-reference/vector-stores/createFile) 来添加文件。

按 vector store ID 维度对添加文件进行速率限制。对 `/vector_stores/{vector_store_id}/files` 和 `/vector_stores/{vector_store_id}/file_batches` 的请求共享每个 vector store 每分钟 300 个请求的限制。

```python
file = client.vector_stores.files.create_and_poll(
  vector_store_id="vs_abc123",
  file_id="file-abc123"
)
```

```javascript
const file = await openai.vectorStores.files.createAndPoll(
  "vs_abc123",
  { file_id: "file-abc123" }
);
```


或者，你可以通过[创建 batches](https://developers.openai.com/api/docs/api-reference/vector-stores/createBatch)，一次向 vector store 添加最多 500 个文件。

Batch 创建接受简单的 `file_ids` 列表，或由带有 `file_id` 以及可选 `attributes` 和 `chunking_strategy` 的对象组成的 `files` 数组。当你需要逐文件元数据或 chunking 设置时，请使用 `files`；并注意 `file_ids` 与 `files` 在单个请求中互斥。

对于向一个 vector store 进行高吞吐量摄取的场景，尽可能优先使用 file batches，以减少请求量并改善延迟。

```python
batch = client.vector_stores.file_batches.create_and_poll(
  vector_store_id="vs_abc123",
  files=[
    {
      "file_id": "file_1",
      "attributes": {"category": "finance"}
    },
    {
      "file_id": "file_2",
      "chunking_strategy": {
        "type": "static",
        "max_chunk_size_tokens": 1000,
        "chunk_overlap_tokens": 200
      }
    }
  ]
)
```

```javascript
const batch = await openai.vectorStores.fileBatches.createAndPoll(
  "vs_abc123",
  {
    files: [
      {
        file_id: "file_1",
        attributes: { category: "finance" },
      },
      {
        file_id: "file_2",
        chunking_strategy: {
          type: "static",
          max_chunk_size_tokens: 1000,
          chunk_overlap_tokens: 200,
        },
      },
    ],
  },
);
```


同样，可以通过以下任一方式从 vector store 中移除这些文件：

- 删除 [vector store file 对象](https://developers.openai.com/api/docs/api-reference/vector-stores/deleteFile)，或
- 删除底层 [file 对象](https://developers.openai.com/api/docs/api-reference/files/delete)（这会从组织内所有 assistants 和 threads 的全部 `vector_store` 与 `code_interpreter` 配置中移除该文件）

最大文件大小为 512 MB。每个文件包含的 token 数不应超过 5,000,000（附加文件时会自动计算）。

File Search 支持多种文件格式，包括 `.pdf`、`.md` 和 `.docx`。有关受支持文件扩展名及其对应 MIME 类型的更多详细信息，请参见下面的[支持的文件](/mirror/api/docs/assistants/tools/file-search#supported-files)部分。

#### 附加 vector store

你可以使用 `tool_resources` 参数将 vector store 附加到 Assistant 或 Thread。

```python
assistant = client.beta.assistants.create(
  instructions="You are a helpful product support assistant and you answer questions based on the files provided to you.",
  model="gpt-4o",
  tools=[{"type": "file_search"}],
  tool_resources={
    "file_search": {
      "vector_store_ids": ["vs_1"]
    }
  }
)

thread = client.beta.threads.create(
messages=[ { "role": "user", "content": "How do I cancel my subscription?"} ],
tool_resources={
"file_search": {
"vector_store_ids": ["vs_2"]
}
}
)
```

```javascript
const assistant = await openai.beta.assistants.create({
instructions: "You are a helpful product support assistant and you answer questions based on the files provided to you.",
model: "gpt-4o",
tools: [{"type": "file_search"}],
tool_resources: {
"file_search": {
"vector_store_ids": ["vs_1"]
}
}
});

const thread = await openai.beta.threads.create({
messages: [ { role: "user", content: "How do I cancel my subscription?"} ],
tool_resources: {
"file_search": {
"vector_store_ids": ["vs_2"]
}
}
});
```


你也可以在 Threads 或 Assistants 创建后，通过使用正确的 `tool_resources` 更新它们来附加 vector store。

#### 创建 runs 前确保 vector store 就绪

我们强烈建议你在创建 run 之前，确保 `vector_store` 中的所有文件都已完全处理。这会确保 `vector_store` 中的所有数据都可以被搜索。你可以使用 SDK 中的轮询辅助方法检查 `vector_store` 是否就绪，也可以手动轮询 `vector_store` 对象，确保其 [`status`](https://developers.openai.com/api/docs/api-reference/vector-stores/object#vector-stores/object-status) 为 `completed`。

作为兜底机制，当 **thread 的** vector store 中包含仍在处理的文件时，我们在 Run 对象中内置了最长 **60 秒等待**。这是为了确保用户在线程中上传的任何文件，在 run 继续之前都已完全可搜索。此兜底等待_不_适用于 assistant 的 vector store。

#### 自定义 File Search 设置

你可以自定义 `file_search` 工具切分数据的方式，以及它向模型上下文返回多少个 chunk。

**Chunking 配置**

默认情况下，`max_chunk_size_tokens` 设置为 `800`，`chunk_overlap_tokens` 设置为 `400`，这意味着每个文件都会通过拆分为 800-token 的 chunk 进行索引，相邻 chunk 之间有 400-token 的重叠。

你可以在向 vector store 添加文件时设置 [`chunking_strategy`](https://developers.openai.com/api/docs/api-reference/vector-stores-files/createFile#vector-stores-files-createfile-chunking_strategy) 来调整这一点。`chunking_strategy` 有一些限制：

- `max_chunk_size_tokens` 必须在 100 到 4096 之间（含端点）。
- `chunk_overlap_tokens` 必须为非负值，并且不应超过 `max_chunk_size_tokens / 2`。

**Chunk 数量**

默认情况下，`file_search` 工具会为 `gpt-4*` 和 o-series 模型输出最多 20 个 chunk，为 `gpt-3.5-turbo` 输出最多 5 个 chunk。你可以在创建 assistant 或 run 时，在工具中设置 [`file_search.max_num_results`](https://developers.openai.com/api/docs/api-reference/assistants/createAssistant#assistants-createassistant-tools) 来调整这一点。

请注意，出于多种原因，`file_search` 工具输出的数量可能少于此数：

- chunk 总数少于 `max_num_results`。
- 所有检索到的 chunk 的总 token 大小超过分配给 `file_search` 工具的 token“预算”。`file_search` 工具目前的 token 预算为：
  - `gpt-3.5-turbo` 为 4,000 tokens
  - `gpt-4*` 模型为 16,000 tokens
  - o-series 模型为 16,000 tokens

#### 通过 chunk ranking 提升 file search 结果相关性

默认情况下，file search 工具在生成响应时，会把它认为具有任何相关性的所有搜索结果返回给模型。不过，如果响应使用了低相关性的内容生成，可能会导致响应质量下降。你可以先检查生成响应时返回的 file search 结果，再调整 file search 工具 ranker 的行为，以改变结果在被用于生成响应前必须达到的相关性程度。

**检查 file search chunks**

提升 file search 结果质量的第一步，是检查 assistant 当前的行为。多数情况下，这意味着调查 assistant 表现不佳的响应。你可以使用 REST API 获取[过去某个 run step 的细粒度信息](https://developers.openai.com/api/docs/api-reference/run-steps/getRunStep)，具体做法是使用 `include` 查询参数获取用于生成结果的文件 chunk。

创建 run 时在响应中包含 file search 结果

```python
from openai import OpenAI
client = OpenAI()

run_step = client.beta.threads.runs.steps.retrieve(
thread_id="thread_abc123",
run_id="run_abc123",
step_id="step_abc123",
include=["step_details.tool_calls[*].file_search.results[*].content"]
)

print(run_step)
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const runStep = await openai.beta.threads.runs.steps.retrieve(
"thread_abc123",
"run_abc123",
"step_abc123",
{
include: ["step_details.tool_calls[*].file_search.results[*].content"]
}
);

console.log(runStep);
```

```bash
curl -g https://api.openai.com/v1/threads/thread_abc123/runs/run_abc123/steps/step_abc123?include[]=step_details.tool_calls[*].file_search.results[*].content \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "Content-Type: application/json" \
-H "OpenAI-Beta: assistants=v2"
```


然后，你可以记录并检查 run step 期间使用的搜索结果，判断它们是否持续与 assistant 应生成的响应相关。

**配置 ranking options**

如果你已经确定 file search 结果的相关性不足以生成高质量响应，可以调整用于选择哪些搜索结果应被用于生成响应的 result ranker 设置。你可以在**创建 assistant** 或**创建 run** 时，在工具中调整 [`file_search.ranking_options`](https://developers.openai.com/api/docs/api-reference/assistants/createAssistant#assistants-createassistant-tools) 设置。

你可以配置的设置包括：

- `ranker` - 用于确定要使用哪些 chunk 的 ranker。可用值为 `auto`（使用最新可用的 ranker）和 `default_2024_08_21`。
- `score_threshold` - 0.0 到 1.0 之间的排名分数，其中 1.0 表示最高排名。数值越高，越会限制用于生成结果的文件 chunk 只包含可能相关性更高的 chunk，但代价是可能遗漏相关 chunk。
- `hybrid_search.embedding_weight`（也称为 `rrf_embedding_weight`）- 决定在使用[倒数排序融合](https://en.wikipedia.org/wiki/Reciprocal_rank_fusion)组合 dense（embedding）和 sparse（文本）排名时，对语义相似度赋予多少权重。提高该权重会更偏向 embedding 空间中接近的 chunk。
- `hybrid_search.text_weight`（也称为 `rrf_text_weight`）- 决定启用 hybrid search 时，对关键词/文本匹配赋予多少权重。提高该权重会更偏向与查询共享精确词项的 chunk。

配置 hybrid search 时，`hybrid_search.embedding_weight` 或 `hybrid_search.text_weight` 中至少一个必须大于零。

#### 使用过期策略管理成本

`file_search` 工具使用 `vector_stores` 对象作为资源，你将根据所创建 `vector_store` 对象的[大小](https://developers.openai.com/api/docs/api-reference/vector-stores/object#vector-stores/object-bytes)付费。Vector store 对象的大小是所有来自文件的已解析 chunk 及其对应 embeddings 的总和。

你的第一个 GB 免费，超出后按 $0.10/GB/day 的向量存储费用计费。Vector store 操作没有其他相关成本。

为了帮助你管理与这些 `vector_store` 对象相关的成本，我们在 `vector_store` 对象中增加了对过期策略的支持。你可以在创建或更新 `vector_store` 对象时设置这些策略。

```python
vector_store = client.vector_stores.create_and_poll(
  name="Product Documentation",
  file_ids=['file_1', 'file_2', 'file_3', 'file_4', 'file_5'],
  expires_after={
    "anchor": "last_active_at",
    "days": 7
  }
)
```

```javascript
let vectorStore = await openai.vectorStores.create({
  name: "rag-store",
  file_ids: ['file_1', 'file_2', 'file_3', 'file_4', 'file_5'],
  expires_after: {
    anchor: "last_active_at",
    days: 7
  }
});
```


**Thread vector store 具有默认过期策略**

使用 thread 辅助方法创建的 vector store（例如 Threads 中的 [`tool_resources.file_search.vector_stores`](https://developers.openai.com/api/docs/api-reference/threads/createThread#threads-createthread-tool_resources)，或 Messages 中的 [message.attachments](https://developers.openai.com/api/docs/api-reference/messages/createMessage#messages-createmessage-attachments)）默认过期策略为最后一次活跃后 7 天过期（“活跃”定义为该 vector store 最后一次参与某个 run）。

当 vector store 过期时，该 thread 上的 runs 将失败。要修复这一点，你只需用相同文件重新创建一个新的 `vector_store`，并将其重新附加到该 thread。

```python
all_files = list(client.vector_stores.files.list("vs_expired"))

vector_store = client.vector_stores.create(name="rag-store")
client.beta.threads.update(
"thread_abc123",
tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
)

for file_batch in chunked(all_files, 100):
client.vector_stores.file_batches.create_and_poll(
vector_store_id=vector_store.id, file_ids=[file.id for file in file_batch]
)
```

```javascript
const fileIds = [];
for await (const file of openai.vectorStores.files.list(
"vs_toWTk90YblRLCkbE2xSVoJlF",
)) {
fileIds.push(file.id);
}

const vectorStore = await openai.vectorStores.create({
name: "rag-store",
});
await openai.beta.threads.update("thread_abcd", {
tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
});

for (const fileBatch of _.chunk(fileIds, 100)) {
await openai.vectorStores.fileBatches.create(vectorStore.id, {
file_ids: fileBatch,
});
}
```


## 支持的文件

_对于 `text/` MIME 类型，编码必须是 `utf-8`、`utf-16` 或 `ascii` 之一。_



| 文件格式 | MIME 类型                                                                   |
| ----------- | --------------------------------------------------------------------------- |
| `.c`        | `text/x-c`                                                                  |
| `.cpp`      | `text/x-c++`                                                                |
| `.cs`       | `text/x-csharp`                                                             |
| `.css`      | `text/css`                                                                  |
| `.doc`      | `application/msword`                                                        |
| `.docx`     | `application/vnd.openxmlformats-officedocument.wordprocessingml.document`   |
| `.go`       | `text/x-golang`                                                             |
| `.html`     | `text/html`                                                                 |
| `.java`     | `text/x-java`                                                               |
| `.js`       | `text/javascript`                                                           |
| `.json`     | `application/json`                                                          |
| `.md`       | `text/markdown`                                                             |
| `.pdf`      | `application/pdf`                                                           |
| `.php`      | `text/x-php`                                                                |
| `.pptx`     | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `.py`       | `text/x-python`                                                             |
| `.py`       | `text/x-script.python`                                                      |
| `.rb`       | `text/x-ruby`                                                               |
| `.sh`       | `application/x-sh`                                                          |
| `.tex`      | `text/x-tex`                                                                |
| `.ts`       | `application/typescript`                                                    |
| `.txt`      | `text/plain`                                                                |

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
## Overview

File Search augments the Assistant with knowledge from outside its model, such as proprietary product information or documents provided by your users. OpenAI automatically parses and chunks your documents, creates and stores the embeddings, and use both vector and keyword search to retrieve relevant content to answer user queries.

## Quickstart

In this example, we’ll create an assistant that can help answer questions about companies’ financial statements.

### Step 1: Create a new Assistant with File Search Enabled

Create a new assistant with `file_search` enabled in the `tools` parameter of the Assistant.

```python
from openai import OpenAI

client = OpenAI()

assistant = client.beta.assistants.create(
name="Financial Analyst Assistant",
instructions="You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
model="gpt-4o",
tools=[{"type": "file_search"}],
)
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

async function main() {
const assistant = await openai.beta.assistants.create({
name: "Financial Analyst Assistant",
instructions: "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
model: "gpt-4o",
tools: [{ type: "file_search" }],
});
}

main();
```

```bash
curl https://api.openai.com/v1/assistants \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "OpenAI-Beta: assistants=v2" \
-d '{
"name": "Financial Analyst Assistant",
"instructions": "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements.",
"tools": [{"type": "file_search"}],
"model": "gpt-4o"
}'
```


Once the `file_search` tool is enabled, the model decides when to retrieve content based on user messages.

### Step 2: Upload files and add them to a Vector Store

To access your files, the `file_search` tool uses the Vector Store object.
Upload your files and create a Vector Store to contain them.
Once the Vector Store is created, you should poll its status until all files are out of the `in_progress` state to
ensure that all content has finished processing. The SDK provides helpers to uploading and polling in one shot.

```python
# Create a vector store called "Financial Statements"
vector_store = client.vector_stores.create(name="Financial Statements")

# Ready the files for upload to OpenAI

file_paths = ["edgar/goog-10k.pdf", "edgar/brka-10k.txt"]
file_streams = [open(path, "rb") for path in file_paths]

# Use the upload and poll SDK helper to upload the files, add them to the vector store,

# and poll the status of the file batch for completion.

file_batch = client.vector_stores.file_batches.upload_and_poll(
vector_store_id=vector_store.id, files=file_streams
)

# You can print the status and the file counts of the batch to see the result of this operation.

print(file_batch.status)
print(file_batch.file_counts)
```

```javascript
const fileStreams = ["edgar/goog-10k.pdf", "edgar/brka-10k.txt"].map((path) =>
fs.createReadStream(path),
);

// Create a vector store including our two files.
let vectorStore = await openai.vectorStores.create({
name: "Financial Statement",
});

await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, fileStreams)
```


### Step 3: Update the assistant to use the new Vector Store

To make the files accessible to your assistant, update the assistant’s `tool_resources` with the new `vector_store` id.

```python
assistant = client.beta.assistants.update(
  assistant_id=assistant.id,
  tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
)
```

```javascript
await openai.beta.assistants.update(assistant.id, {
  tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
});
```


### Step 4: Create a thread

You can also attach files as Message attachments on your thread. Doing so will create another `vector_store` associated with the thread, or, if there is already a vector store attached to this thread, attach the new files to the existing thread vector store. When you create a Run on this thread, the file search tool will query both the `vector_store` from your assistant and the `vector_store` on the thread.

In this example, the user attached a copy of Apple’s latest 10-K filing.

```python
# Upload the user provided file to OpenAI
message_file = client.files.create(
  file=open("edgar/aapl-10k.pdf", "rb"), purpose="assistants"
)

# Create a thread and attach the file to the message

thread = client.beta.threads.create(
messages=[
{
"role": "user",
"content": "How many shares of AAPL were outstanding at the end of of October 2023?", # Attach the new file to the message.
"attachments": [
{ "file_id": message_file.id, "tools": [{"type": "file_search"}] }
],
}
]
)

# The thread now has a vector store with that file in its tool resources.

print(thread.tool_resources.file_search)
```

```javascript
// A user wants to attach a file to a specific message, let's upload it.
const aapl10k = await openai.files.create({
file: fs.createReadStream("edgar/aapl-10k.pdf"),
purpose: "assistants",
});

const thread = await openai.beta.threads.create({
messages: [
{
role: "user",
content:
"How many shares of AAPL were outstanding at the end of of October 2023?",
// Attach the new file to the message.
attachments: [{ file_id: aapl10k.id, tools: [{ type: "file_search" }] }],
},
],
});

// The thread now has a vector store in its tool resources.
console.log(thread.tool_resources?.file_search);
```


Vector stores created using message attachments have a default expiration policy of 7 days after they were last active (defined as the last time the vector store was part of a run). This default exists to help you manage your vector storage costs. You can override these expiration policies at any time. Learn more [here](#managing-costs-with-expiration-policies).

### Step 5: Create a run and check the output

Now, create a Run and observe that the model uses the File Search tool to provide a response to the user’s question.



<div data-content-switcher-pane data-value="streaming">
    <div class="hidden">With streaming</div>
    ```python
from typing_extensions import override
from openai import AssistantEventHandler, OpenAI

client = OpenAI()

class EventHandler(AssistantEventHandler):
@override
def on_text_created(self, text) -> None:
print(f"\nassistant > ", end="", flush=True)

    @override
    def on_tool_call_created(self, tool_call):
        print(f"\nassistant > {tool_call.type}\n", flush=True)

    @override
    def on_message_done(self, message) -> None:
        # print a citation to the file searched
        message_content = message.content[0].text
        annotations = message_content.annotations
        citations = []
        for index, annotation in enumerate(annotations):
            message_content.value = message_content.value.replace(
                annotation.text, f"[{index}]"
            )
            if file_citation := getattr(annotation, "file_citation", None):
                cited_file = client.files.retrieve(file_citation.file_id)
                citations.append(f"[{index}] {cited_file.filename}")

        print(message_content.value)
        print("\n".join(citations))

# Then, we use the stream SDK helper

# with the EventHandler class to create the Run

# and stream the response.

with client.beta.threads.runs.stream(
thread_id=thread.id,
assistant_id=assistant.id,
instructions="Please address the user as Jane Doe. The user has a premium account.",
event_handler=EventHandler(),
) as stream:
stream.until_done()
```

```javascript
const stream = openai.beta.threads.runs
.stream(thread.id, {
assistant_id: assistant.id,
})
.on("textCreated", () => console.log("assistant >"))
.on("toolCallCreated", (event) => console.log("assistant " + event.type))
.on("messageDone", async (event) => {
if (event.content[0].type === "text") {
const { text } = event.content[0];
const { annotations } = text;
const citations: string[] = [];

      let index = 0;
      for (let annotation of annotations) {
        text.value = text.value.replace(annotation.text, "[" + index + "]");
        const { file_citation } = annotation;
        if (file_citation) {
          const citedFile = await openai.files.retrieve(file_citation.file_id);
          citations.push("[" + index + "]" + citedFile.filename);
        }
        index++;
      }

      console.log(text.value);
      console.log(citations.join("\n"));
    }
```

  </div>
  <div data-content-switcher-pane data-value="without-streaming" hidden>
    <div class="hidden">Without streaming</div>
    ```python
# Use the create and poll SDK helper to create a run and poll the status of
# the run until it's in a terminal state.

run = client.beta.threads.runs.create_and_poll(
thread_id=thread.id, assistant_id=assistant.id
)

messages = list(client.beta.threads.messages.list(thread_id=thread.id, run_id=run.id))

message_content = messages[0].content[0].text
annotations = message_content.annotations
citations = []
for index, annotation in enumerate(annotations):
message_content.value = message_content.value.replace(annotation.text, f"[{index}]")
if file_citation := getattr(annotation, "file_citation", None):
cited_file = client.files.retrieve(file_citation.file_id)
citations.append(f"[{index}] {cited_file.filename}")

print(message_content.value)
print("\n".join(citations))
```

```javascript
const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
assistant_id: assistant.id,
});

const messages = await openai.beta.threads.messages.list(thread.id, {
run_id: run.id,
});

const message = messages.data.pop()!;
if (message.content[0].type === "text") {
const { text } = message.content[0];
const { annotations } = text;
const citations: string[] = [];

let index = 0;
for (let annotation of annotations) {
text.value = text.value.replace(annotation.text, "[" + index + "]");
const { file_citation } = annotation;
if (file_citation) {
const citedFile = await openai.files.retrieve(file_citation.file_id);
citations.push("[" + index + "]" + citedFile.filename);
}
index++;
}

console.log(text.value);
console.log(citations.join("\n"));
}
```

  </div>



Your new assistant will query both attached vector stores (one containing `goog-10k.pdf` and `brka-10k.txt`, and the other containing `aapl-10k.pdf`) and return this result from `aapl-10k.pdf`.

To retrieve the contents of the file search results that were used by the model, use the `include` query parameter and provide a value of `step_details.tool_calls[*].file_search.results[*].content` in the format `?include[]=step_details.tool_calls[*].file_search.results[*].content`.

---

## How it works

The `file_search` tool implements several retrieval best practices out of the box to help you extract the right data from your files and augment the model’s responses. The `file_search` tool:

- Rewrites user queries to optimize them for search.
- Breaks down complex user queries into multiple searches it can run in parallel.
- Runs both keyword and semantic searches across both assistant and thread vector stores.
- Reranks search results to pick the most relevant ones before generating the final response.

By default, the `file_search` tool uses the following settings but these can be [configured](#customizing-file-search-settings) to suit your needs:

- Chunk size: 800 tokens
- Chunk overlap: 400 tokens
- Embedding model: `text-embedding-3-large` at 256 dimensions
- Maximum number of chunks added to context: 20 (could be fewer)
- Ranker: `auto` (OpenAI will choose which ranker to use)
- Score threshold: 0 minimum ranking score

**Known Limitations**

We have a few known limitations we're working on adding support for in the coming months:

1. Support for deterministic pre-search filtering using custom metadata.
2. Support for parsing images within documents (including images of charts, graphs, tables etc.)
3. Support for retrievals over structured file formats (like `csv` or `jsonl`).
4. Better support for summarization — the tool today is optimized for search queries.

## Vector stores

Vector Store objects give the File Search tool the ability to search your files. Adding a file to a `vector_store` automatically parses, chunks, embeds and stores the file in a vector database that's capable of both keyword and semantic search. Each `vector_store` can hold up to 10,000 files. For vector stores created starting in November 2025, this limit is 100,000,000 files. Vector stores can be attached to both Assistants and Threads. Today, you can attach at most one vector store to an assistant and at most one vector store to a thread.

#### Creating vector stores and adding files

You can create a vector store and add files to it in a single API call:

```python
vector_store = client.vector_stores.create(
  name="Product Documentation",
  file_ids=['file_1', 'file_2', 'file_3', 'file_4', 'file_5']
)
```

```javascript
const vectorStore = await openai.vectorStores.create({
  name: "Product Documentation",
  file_ids: ['file_1', 'file_2', 'file_3', 'file_4', 'file_5']
});
```


Adding files to vector stores is an async operation. To ensure the operation is complete, we recommend that you use the 'create and poll' helpers in our official SDKs. If you're not using the SDKs, you can retrieve the `vector_store` object and monitor its [`file_counts`](https://developers.openai.com/api/docs/api-reference/vector-stores/object#vector-stores/object-file_counts) property to see the result of the file ingestion operation.

Files can also be added to a vector store after it's created by [creating vector store files](https://developers.openai.com/api/docs/api-reference/vector-stores/createFile).

Adding files is rate limited per vector store ID. Requests to `/vector_stores/{vector_store_id}/files` and `/vector_stores/{vector_store_id}/file_batches` share a per-vector-store limit of 300 requests per minute.

```python
file = client.vector_stores.files.create_and_poll(
  vector_store_id="vs_abc123",
  file_id="file-abc123"
)
```

```javascript
const file = await openai.vectorStores.files.createAndPoll(
  "vs_abc123",
  { file_id: "file-abc123" }
);
```


Alternatively, you can add several files to a vector store by [creating batches](https://developers.openai.com/api/docs/api-reference/vector-stores/createBatch) of up to 500 files.

Batch creation accepts either a simple list of `file_ids` or a `files` array made up of objects with a `file_id` plus optional `attributes` and `chunking_strategy`. Use `files` when you need per-file metadata or chunking settings, and note that `file_ids` and `files` are mutually exclusive in a single request.

For high-throughput ingestion into one vector store, prefer file batches whenever possible to reduce request volume and improve latency.

```python
batch = client.vector_stores.file_batches.create_and_poll(
  vector_store_id="vs_abc123",
  files=[
    {
      "file_id": "file_1",
      "attributes": {"category": "finance"}
    },
    {
      "file_id": "file_2",
      "chunking_strategy": {
        "type": "static",
        "max_chunk_size_tokens": 1000,
        "chunk_overlap_tokens": 200
      }
    }
  ]
)
```

```javascript
const batch = await openai.vectorStores.fileBatches.createAndPoll(
  "vs_abc123",
  {
    files: [
      {
        file_id: "file_1",
        attributes: { category: "finance" },
      },
      {
        file_id: "file_2",
        chunking_strategy: {
          type: "static",
          max_chunk_size_tokens: 1000,
          chunk_overlap_tokens: 200,
        },
      },
    ],
  },
);
```


Similarly, these files can be removed from a vector store by either:

- Deleting the [vector store file object](https://developers.openai.com/api/docs/api-reference/vector-stores/deleteFile) or,
- By deleting the underlying [file object](https://developers.openai.com/api/docs/api-reference/files/delete) (which removes the file it from all `vector_store` and `code_interpreter` configurations across all assistants and threads in your organization)

The maximum file size is 512 MB. Each file should contain no more than 5,000,000 tokens per file (computed automatically when you attach a file).

File Search supports a variety of file formats including `.pdf`, `.md`, and `.docx`. More details on the file extensions (and their corresponding MIME-types) supported can be found in the [Supported files](#supported-files) section below.

#### Attaching vector stores

You can attach vector stores to your Assistant or Thread using the `tool_resources` parameter.

```python
assistant = client.beta.assistants.create(
  instructions="You are a helpful product support assistant and you answer questions based on the files provided to you.",
  model="gpt-4o",
  tools=[{"type": "file_search"}],
  tool_resources={
    "file_search": {
      "vector_store_ids": ["vs_1"]
    }
  }
)

thread = client.beta.threads.create(
messages=[ { "role": "user", "content": "How do I cancel my subscription?"} ],
tool_resources={
"file_search": {
"vector_store_ids": ["vs_2"]
}
}
)
```

```javascript
const assistant = await openai.beta.assistants.create({
instructions: "You are a helpful product support assistant and you answer questions based on the files provided to you.",
model: "gpt-4o",
tools: [{"type": "file_search"}],
tool_resources: {
"file_search": {
"vector_store_ids": ["vs_1"]
}
}
});

const thread = await openai.beta.threads.create({
messages: [ { role: "user", content: "How do I cancel my subscription?"} ],
tool_resources: {
"file_search": {
"vector_store_ids": ["vs_2"]
}
}
});
```


You can also attach a vector store to Threads or Assistants after they're created by updating them with the right `tool_resources`.

#### Ensuring vector store readiness before creating runs

We highly recommend that you ensure all files in a `vector_store` are fully processed before you create a run. This will ensure that all the data in your `vector_store` is searchable. You can check for `vector_store` readiness by using the polling helpers in our SDKs, or by manually polling the `vector_store` object to ensure the [`status`](https://developers.openai.com/api/docs/api-reference/vector-stores/object#vector-stores/object-status) is `completed`.

As a fallback, we've built a **60 second maximum wait** in the Run object when the **thread’s** vector store contains files that are still being processed. This is to ensure that any files your users upload in a thread a fully searchable before the run proceeds. This fallback wait _does not_ apply to the assistant's vector store.

#### Customizing File Search settings

You can customize how the `file_search` tool chunks your data and how many chunks it returns to the model context.

**Chunking configuration**

By default, `max_chunk_size_tokens` is set to `800` and `chunk_overlap_tokens` is set to `400`, meaning every file is indexed by being split up into 800-token chunks, with 400-token overlap between consecutive chunks.

You can adjust this by setting [`chunking_strategy`](https://developers.openai.com/api/docs/api-reference/vector-stores-files/createFile#vector-stores-files-createfile-chunking_strategy) when adding files to the vector store. There are certain limitations to `chunking_strategy`:

- `max_chunk_size_tokens` must be between 100 and 4096 inclusive.
- `chunk_overlap_tokens` must be non-negative and should not exceed `max_chunk_size_tokens / 2`.

**Number of chunks**

By default, the `file_search` tool outputs up to 20 chunks for `gpt-4*` and o-series models and up to 5 chunks for `gpt-3.5-turbo`. You can adjust this by setting [`file_search.max_num_results`](https://developers.openai.com/api/docs/api-reference/assistants/createAssistant#assistants-createassistant-tools) in the tool when creating the assistant or the run.

Note that the `file_search` tool may output fewer than this number for a myriad of reasons:

- The total number of chunks is fewer than `max_num_results`.
- The total token size of all the retrieved chunks exceeds the token "budget" assigned to the `file_search` tool. The `file_search` tool currently has a token budget of:
  - 4,000 tokens for `gpt-3.5-turbo`
  - 16,000 tokens for `gpt-4*` models
  - 16,000 tokens for o-series models

#### Improve file search result relevance with chunk ranking

By default, the file search tool will return all search results to the model that it thinks have any level of relevance when generating a response. However, if responses are generated using content that has low relevance, it can lead to lower quality responses. You can adjust this behavior by both inspecting the file search results that are returned when generating responses, and then tuning the behavior of the file search tool's ranker to change how relevant results must be before they are used to generate a response.

**Inspecting file search chunks**

The first step in improving the quality of your file search results is inspecting the current behavior of your assistant. Most often, this will involve investigating responses from your assistant that are not not performing well. You can get [granular information about a past run step](https://developers.openai.com/api/docs/api-reference/run-steps/getRunStep) using the REST API, specifically using the `include` query parameter to get the file chunks that are being used to generate results.

Include file search results in response when creating a run

```python
from openai import OpenAI
client = OpenAI()

run_step = client.beta.threads.runs.steps.retrieve(
thread_id="thread_abc123",
run_id="run_abc123",
step_id="step_abc123",
include=["step_details.tool_calls[*].file_search.results[*].content"]
)

print(run_step)
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const runStep = await openai.beta.threads.runs.steps.retrieve(
"thread_abc123",
"run_abc123",
"step_abc123",
{
include: ["step_details.tool_calls[*].file_search.results[*].content"]
}
);

console.log(runStep);
```

```bash
curl -g https://api.openai.com/v1/threads/thread_abc123/runs/run_abc123/steps/step_abc123?include[]=step_details.tool_calls[*].file_search.results[*].content \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "Content-Type: application/json" \
-H "OpenAI-Beta: assistants=v2"
```


You can then log and inspect the search results used during the run step, and determine whether or not they are consistently relevant to the responses your assistant should generate.

**Configure ranking options**

If you have determined that your file search results are not sufficiently relevant to generate high quality responses, you can adjust the settings of the result ranker used to choose which search results should be used to generate responses. You can adjust this setting [`file_search.ranking_options`](https://developers.openai.com/api/docs/api-reference/assistants/createAssistant#assistants-createassistant-tools) in the tool when **creating the assistant** or **creating the run**.

The settings you can configure are:

- `ranker` - Which ranker to use in determining which chunks to use. The available values are `auto`, which uses the latest available ranker, and `default_2024_08_21`.
- `score_threshold` - a ranking between 0.0 and 1.0, with 1.0 being the highest ranking. A higher number will constrain the file chunks used to generate a result to only chunks with a higher possible relevance, at the cost of potentially leaving out relevant chunks.
- `hybrid_search.embedding_weight` (also referred to as `rrf_embedding_weight`) - determines how much weight to give to semantic similarity when combining dense (embedding) and sparse (text) rankings with [reciprocal rank fusion](https://en.wikipedia.org/wiki/Reciprocal_rank_fusion). Increase this weight to favor chunks that are close in embedding space.
- `hybrid_search.text_weight` (also referred to as `rrf_text_weight`) - determines how much weight to give to keyword/text matching when hybrid search is enabled. Increase this weight to favor chunks that share exact terms with the query.

At least one of `hybrid_search.embedding_weight` or `hybrid_search.text_weight` must be greater than zero when hybrid search is configured.

#### Managing costs with expiration policies

The `file_search` tool uses the `vector_stores` object as its resource and you will be billed based on the [size](https://developers.openai.com/api/docs/api-reference/vector-stores/object#vector-stores/object-bytes) of the `vector_store` objects created. The size of the vector store object is the sum of all the parsed chunks from your files and their corresponding embeddings.

You first GB is free and beyond that, usage is billed at $0.10/GB/day of vector storage. There are no other costs associated with vector store operations.

In order to help you manage the costs associated with these `vector_store` objects, we have added support for expiration policies in the `vector_store` object. You can set these policies when creating or updating the `vector_store` object.

```python
vector_store = client.vector_stores.create_and_poll(
  name="Product Documentation",
  file_ids=['file_1', 'file_2', 'file_3', 'file_4', 'file_5'],
  expires_after={
    "anchor": "last_active_at",
    "days": 7
  }
)
```

```javascript
let vectorStore = await openai.vectorStores.create({
  name: "rag-store",
  file_ids: ['file_1', 'file_2', 'file_3', 'file_4', 'file_5'],
  expires_after: {
    anchor: "last_active_at",
    days: 7
  }
});
```


**Thread vector stores have default expiration policies**

Vector stores created using thread helpers (like [`tool_resources.file_search.vector_stores`](https://developers.openai.com/api/docs/api-reference/threads/createThread#threads-createthread-tool_resources) in Threads or [message.attachments](https://developers.openai.com/api/docs/api-reference/messages/createMessage#messages-createmessage-attachments) in Messages) have a default expiration policy of 7 days after they were last active (defined as the last time the vector store was part of a run).

When a vector store expires, runs on that thread will fail. To fix this, you can simply recreate a new `vector_store` with the same files and reattach it to the thread.

```python
all_files = list(client.vector_stores.files.list("vs_expired"))

vector_store = client.vector_stores.create(name="rag-store")
client.beta.threads.update(
"thread_abc123",
tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
)

for file_batch in chunked(all_files, 100):
client.vector_stores.file_batches.create_and_poll(
vector_store_id=vector_store.id, file_ids=[file.id for file in file_batch]
)
```

```javascript
const fileIds = [];
for await (const file of openai.vectorStores.files.list(
"vs_toWTk90YblRLCkbE2xSVoJlF",
)) {
fileIds.push(file.id);
}

const vectorStore = await openai.vectorStores.create({
name: "rag-store",
});
await openai.beta.threads.update("thread_abcd", {
tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
});

for (const fileBatch of _.chunk(fileIds, 100)) {
await openai.vectorStores.fileBatches.create(vectorStore.id, {
file_ids: fileBatch,
});
}
```


## Supported files

_For `text/` MIME types, the encoding must be one of `utf-8`, `utf-16`, or `ascii`._

{/* Keep this table in sync with RETRIEVAL_SUPPORTED_EXTENSIONS in the agentapi service */}

| File format | MIME type                                                                   |
| ----------- | --------------------------------------------------------------------------- |
| `.c`        | `text/x-c`                                                                  |
| `.cpp`      | `text/x-c++`                                                                |
| `.cs`       | `text/x-csharp`                                                             |
| `.css`      | `text/css`                                                                  |
| `.doc`      | `application/msword`                                                        |
| `.docx`     | `application/vnd.openxmlformats-officedocument.wordprocessingml.document`   |
| `.go`       | `text/x-golang`                                                             |
| `.html`     | `text/html`                                                                 |
| `.java`     | `text/x-java`                                                               |
| `.js`       | `text/javascript`                                                           |
| `.json`     | `application/json`                                                          |
| `.md`       | `text/markdown`                                                             |
| `.pdf`      | `application/pdf`                                                           |
| `.php`      | `text/x-php`                                                                |
| `.pptx`     | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `.py`       | `text/x-python`                                                             |
| `.py`       | `text/x-script.python`                                                      |
| `.rb`       | `text/x-ruby`                                                               |
| `.sh`       | `application/x-sh`                                                          |
| `.tex`      | `text/x-tex`                                                                |
| `.ts`       | `application/typescript`                                                    |
| `.txt`      | `text/plain`                                                                |
``````
:::
:::

