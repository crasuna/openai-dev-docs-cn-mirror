---
status: needs-review
sourceId: "a632e25a8035"
sourceChecksum: "a632e25a8035f6ec6886ef28633095363180d012984c70497d356b2ef237b182"
sourceUrl: "https://developers.openai.com/api/docs/guides/retrieval"
translatedAt: "2026-06-27T18:24:42.5859087+08:00"
translator: codex-gpt-5.5-xhigh
---

# Retrieval

**Retrieval API** 允许你对自己的数据执行[**语义搜索**](#semantic-search)。语义搜索是一种能够浮现语义相似结果的技术，即使这些结果只匹配很少关键词，甚至没有匹配关键词。Retrieval 本身就很有用，但与我们的模型结合来合成响应时尤其强大。

![Retrieval 示意图](https://cdn.openai.com/API/docs/images/retrieval-depiction.png)

Retrieval API 由 [**vector stores**](#vector-stores) 提供支持，vector stores 作为你数据的索引。本指南将介绍如何执行语义搜索，并深入说明 vector stores 的细节。

## 快速开始

<li className={s.StandaloneLi} data-number={1}>
  **创建 vector store** 并上传文件。
</li>

<li className={s.StandaloneLi} data-number={2}>
  **发送搜索查询** 以获得相关结果。
</li>

如需了解如何将结果与我们的模型一起使用，请查看[合成响应](#synthesizing-responses)部分。

## 语义搜索

**语义搜索**是一种利用 [vector embeddings](https://developers.openai.com/api/docs/guides/embeddings) 来浮现语义相关结果的技术。重要的是，这包括那些只有很少共享关键词、甚至没有共享关键词的结果，而传统搜索技术可能会错过这些结果。

例如，让我们看看对 `"When did we go to the moon?"` 的潜在结果：

| 文本                                              | 关键词相似度 | 语义相似度 |
| ------------------------------------------------- | ------------ | ---------- |
| The first lunar landing occurred in July of 1969. | 0%           | 65%        |
| The first man on the moon was Neil Armstrong.     | 27%          | 43%        |
| When I ate the moon cake, it was delicious.       | 40%          | 28%        |

_（关键词使用 [Jaccard](https://en.wikipedia.org/wiki/Jaccard_index)，语义使用基于 `text-embedding-3-small` 的 [cosine](https://en.wikipedia.org/wiki/Cosine_similarity)。）_

注意，最相关的结果并不包含搜索查询中的任何词。这种灵活性使语义搜索成为查询任意规模知识库的强大技术。

语义搜索由 [vector stores](#vector-stores) 提供支持，我们会在本指南后面详细介绍。本节将重点说明语义搜索的机制。

### 执行语义搜索

你可以使用 `search` 函数查询 vector store，并用自然语言指定 `query`。它会返回结果列表，每个结果都包含相关 chunks、相似度分数和来源文件。

默认情况下，一个响应最多包含 10 条结果，但你可以使用 `max_num_results` 参数将上限设置为 50。

### Query rewriting

某些查询风格会产生更好的结果，因此我们提供了一个设置，可以自动重写查询以获得最佳表现。执行 `search` 时设置 `rewrite_query=true` 即可启用此功能。

重写后的查询会出现在结果的 `search_query` 字段中。

| **原始查询**                                                          | **重写后**                                 |
| --------------------------------------------------------------------- | ------------------------------------------ |
| I'd like to know the height of the main office building.              | primary office building height             |
| What are the safety regulations for transporting hazardous materials? | safety regulations for hazardous materials |
| How do I file a complaint about a service issue?                      | service complaint filing process           |

### Attribute filtering

Attribute filtering 可通过应用条件来缩小结果范围，例如将搜索限制到特定日期范围。你可以在 `attribute_filter` 中定义并组合条件，以便在执行语义搜索之前，基于文件属性定位文件。

使用 **comparison filters** 将文件 `attributes` 中的特定 `key` 与给定 `value` 比较，并使用 **compound filters** 通过 `and` 和 `or` 组合多个 filters。

下面是一些示例 filters。



<div data-content-switcher-pane data-value="region">
    <div class="hidden">区域</div>
    </div>
  <div data-content-switcher-pane data-value="date-range" hidden>
    <div class="hidden">日期范围</div>
    </div>
  <div data-content-switcher-pane data-value="filename" hidden>
    <div class="hidden">文件名</div>
    </div>
  <div data-content-switcher-pane data-value="exclude-filenames" hidden>
    <div class="hidden">排除文件名</div>
    </div>
  <div data-content-switcher-pane data-value="date-range-and-region" hidden>
    <div class="hidden">复杂</div>
    </div>



### Ranking

如果你发现文件搜索结果不够相关，可以调整 `ranking_options` 来提升响应质量。这包括指定 `ranker`，例如 `auto` 或 `default-2024-08-21`，以及设置 0.0 到 1.0 之间的 `score_threshold`。更高的 `score_threshold` 会将结果限制为更相关的 chunks，不过也可能排除一些潜在有用的结果。当提供 `ranking_options.hybrid_search` 时，你还可以调节 `hybrid_search.embedding_weight`（`rrf_embedding_weight`）和 `hybrid_search.text_weight`（`rrf_text_weight`），以控制 reciprocal rank fusion 如何平衡语义 embedding 匹配与稀疏关键词匹配。增大前者会强调语义相似性，增大后者会强调文本重合，并且请确保至少有一个权重大于零。

## Vector stores

Vector stores 是为 Retrieval API 和 [file search](https://developers.openai.com/api/docs/guides/tools-file-search) tool 提供语义搜索能力的容器。当你向 vector store 添加文件时，该文件会被自动 chunk、embedding 和 indexing。

Vector stores 包含 `vector_store_file` objects，这些 objects 由 `file` object 支撑。

| <div style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>Object type</div> | 描述                                                                                                                                                                          |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file`                                                                     | 表示通过 [Files API](https://developers.openai.com/api/docs/api-reference/files) 上传的内容。常与 vector stores 一起使用，也用于 fine-tuning 和其他使用场景。                      |
| `vector_store`                                                             | 可搜索文件的容器。                                                                                                                                                            |
| `vector_store.file`                                                        | 专门表示某个 `file` 的 wrapper type；该 `file` 已被 chunk 和 embedded，并已关联到一个 `vector_store`。<br/>包含用于 filtering 的 `attributes` map。 |

### Pricing

你将按照所有 vector stores 使用的总存储量付费，该存储量由解析后的 chunks 及其对应 embeddings 的大小决定。

| 存储                           | 费用         |
| ------------------------------ | ------------ |
| 最多 1 GB（跨所有 stores）     | 免费         |
| 超过 1 GB                      | $0.10/GB/天  |

请查看 [expiration policies](#expiration-policies)，了解尽量降低成本的选项。

### Vector store operations



<div data-content-switcher-pane data-value="create">
    <div class="hidden">创建</div>
    </div>
  <div data-content-switcher-pane data-value="retrieve" hidden>
    <div class="hidden">检索</div>
    </div>
  <div data-content-switcher-pane data-value="update" hidden>
    <div class="hidden">更新</div>
    </div>
  <div data-content-switcher-pane data-value="delete" hidden>
    <div class="hidden">删除</div>
    </div>
  <div data-content-switcher-pane data-value="list" hidden>
    <div class="hidden">列出</div>
    </div>



### Vector store file operations

某些操作（例如为 `vector_store.file` 执行 `create`）是异步的，可能需要时间完成。请使用我们的 helper functions，例如 `create_and_poll`，阻塞等待直到完成。否则，你可以检查状态。从 vector store 中移除文件是最终一致的，搜索结果可能会在短时间内继续包含已移除文件的内容。

添加文件按 vector store ID 进行 rate limit。发往 [`/vector_stores/{vector_store_id}/files`](https://developers.openai.com/api/docs/api-reference/vector-stores/createFile) 和 [`/vector_stores/{vector_store_id}/file_batches`](https://developers.openai.com/api/docs/api-reference/vector-stores/createBatch) 的请求共享每个 vector store 每分钟 300 个请求的限制。



<div data-content-switcher-pane data-value="create">
    <div class="hidden">创建</div>
    </div>
  <div data-content-switcher-pane data-value="upload" hidden>
    <div class="hidden">上传</div>
    </div>
  <div data-content-switcher-pane data-value="retrieve" hidden>
    <div class="hidden">检索</div>
    </div>
  <div data-content-switcher-pane data-value="update" hidden>
    <div class="hidden">更新</div>
    </div>
  <div data-content-switcher-pane data-value="delete" hidden>
    <div class="hidden">删除</div>
    </div>
  <div data-content-switcher-pane data-value="list" hidden>
    <div class="hidden">列出</div>
    </div>



### Batch operations



<div data-content-switcher-pane data-value="create">
    <div class="hidden">创建</div>
    </div>
  <div data-content-switcher-pane data-value="retrieve" hidden>
    <div class="hidden">检索</div>
    </div>
  <div data-content-switcher-pane data-value="cancel" hidden>
    <div class="hidden">取消</div>
    </div>
  <div data-content-switcher-pane data-value="list" hidden>
    <div class="hidden">列出</div>
    </div>



创建 batch 时，你可以提供带有可选 `attributes` 和/或 `chunking_strategy` 的 `file_ids`，也可以使用 `files` 数组，为每个文件传入包含 `file_id` 以及可选 `attributes` 和 `chunking_strategy` 的 objects。这两个选项互斥，因此你可以清晰控制是让每个文件共享相同设置，还是需要按文件覆盖。

为了将更高吞吐量的数据摄入单个 vector store，我们建议尽可能创建 batch。每个请求中 batch 最多可包含 500 个文件，相比发送许多单文件创建请求，这通常会减少竞争并改善端到端延迟。

### Attributes

每个 `vector_store.file` 都可以有关联的 `attributes`，这是一个值字典，在使用 [attribute filtering](#attribute-filtering) 执行[语义搜索](#semantic-search)时可以引用。该字典最多可包含 16 个键，每个键限制为 256 个字符。

### Expiration policies

你可以使用 `expires_after` 为 `vector_store` objects 设置 expiration policy。vector store 过期后，所有关联的 `vector_store.file` objects 都会被删除，并且你不会再为它们付费。

### Limits

最大文件大小为 512 MB。每个文件应包含不超过 5,000,000 个 tokens（附加文件时会自动计算）。

### Chunking

默认情况下，`max_chunk_size_tokens` 设置为 `800`，`chunk_overlap_tokens` 设置为 `400`，这意味着每个文件都会通过拆分成 800-token chunks 来建立索引，相邻 chunks 之间有 400-token overlap。

你可以在向 vector store 添加文件时设置 [`chunking_strategy`](https://developers.openai.com/api/docs/api-reference/vector-stores-files/createFile#vector-stores-files-createfile-chunking_strategy) 来调整这一点。`chunking_strategy` 有一些限制：

- `max_chunk_size_tokens` 必须介于 100 和 4096 之间（含两端）。
- `chunk_overlap_tokens` 必须为非负数，并且不应超过 `max_chunk_size_tokens / 2`。

支持的文件类型

_对于 `text/` MIME 类型，编码必须是 `utf-8`、`utf-16` 或 `ascii` 之一。_

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

## 合成响应

执行查询后，你可能想根据结果合成响应。你可以通过提供结果和原始查询，利用我们的模型返回 grounded response。

这里使用一个示例 `format_results` 函数，其实现可以如下：
