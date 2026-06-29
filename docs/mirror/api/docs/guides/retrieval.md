---
title: "检索"
description: "Learn how to search your data using semantic similarity with the OpenAI API."
outline: deep
---

# 检索

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/retrieval](https://developers.openai.com/api/docs/guides/retrieval)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/retrieval.md](https://developers.openai.com/api/docs/guides/retrieval.md)
- 抓取时间：2026-06-27T05:54:07.839Z
- Checksum：`a632e25a8035f6ec6886ef28633095363180d012984c70497d356b2ef237b182`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
**检索 API（Retrieval API）** 允许你对自己的数据执行[**语义搜索**](/mirror/api/docs/guides/retrieval#semantic-search)。语义搜索是一种能够浮现语义相似结果的技术，即使这些结果只匹配很少关键词，甚至没有匹配关键词。检索本身就很有用，但与我们的模型结合来合成响应时尤其强大。

![Retrieval 示意图](https://cdn.openai.com/API/docs/images/retrieval-depiction.png)

检索 API 由[**向量存储（vector stores）**](/mirror/api/docs/guides/retrieval#vector-stores)提供支持，向量存储作为你数据的索引。本指南将介绍如何执行语义搜索，并深入说明向量存储的细节。

## 快速开始


  **创建 vector store** 并上传文件。



  **发送搜索查询** 以获得相关结果。


如需了解如何将结果与我们的模型一起使用，请查看[合成响应](/mirror/api/docs/guides/retrieval#synthesizing-responses)部分。

## 语义搜索

**语义搜索**是一种利用[向量嵌入](/mirror/api/docs/guides/embeddings)来浮现语义相关结果的技术。重要的是，这包括那些只有很少共享关键词、甚至没有共享关键词的结果，而传统搜索技术可能会错过这些结果。

例如，让我们看看对 `"When did we go to the moon?"` 的潜在结果：

| 文本                                              | 关键词相似度 | 语义相似度 |
| ------------------------------------------------- | ------------ | ---------- |
| The first lunar landing occurred in July of 1969. | 0%           | 65%        |
| The first man on the moon was Neil Armstrong.     | 27%          | 43%        |
| When I ate the moon cake, it was delicious.       | 40%          | 28%        |

_（关键词使用 [Jaccard](https://en.wikipedia.org/wiki/Jaccard_index)，语义使用基于 `text-embedding-3-small` 的 [cosine](https://en.wikipedia.org/wiki/Cosine_similarity)。）_

注意，最相关的结果并不包含搜索查询中的任何词。这种灵活性使语义搜索成为查询任意规模知识库的强大技术。

语义搜索由 [vector stores](/mirror/api/docs/guides/retrieval#vector-stores) 提供支持，我们会在本指南后面详细介绍。本节将重点说明语义搜索的机制。

### 执行语义搜索

你可以使用 `search` 函数查询 vector store，并用自然语言指定 `query`。它会返回结果列表，每个结果都包含相关 chunks、相似度分数和来源文件。

默认情况下，一个响应最多包含 10 条结果，但你可以使用 `max_num_results` 参数将上限设置为 50。

### 查询重写

某些查询风格会产生更好的结果，因此我们提供了一个设置，可以自动重写查询以获得最佳表现。执行 `search` 时设置 `rewrite_query=true` 即可启用此功能。

重写后的查询会出现在结果的 `search_query` 字段中。

| **原始查询**                                                          | **重写后**                                 |
| --------------------------------------------------------------------- | ------------------------------------------ |
| I'd like to know the height of the main office building.              | primary office building height             |
| What are the safety regulations for transporting hazardous materials? | safety regulations for hazardous materials |
| How do I file a complaint about a service issue?                      | service complaint filing process           |

### 属性筛选

属性筛选可以通过应用条件来缩小结果范围，例如将搜索限制到特定日期范围。你可以在 `attribute_filter` 中定义并组合条件，以便在执行语义搜索之前，基于文件属性定位文件。

使用 **comparison filters** 将文件 `attributes` 中的特定 `key` 与给定 `value` 比较，并使用 **compound filters** 通过 `and` 和 `or` 组合多个 filters。

下面是一些示例 filters。




区域


日期范围


文件名


排除文件名


复杂




### 排序

如果你发现文件搜索结果不够相关，可以调整 `ranking_options` 来提升响应质量。这包括指定 `ranker`，例如 `auto` 或 `default-2024-08-21`，以及设置 0.0 到 1.0 之间的 `score_threshold`。更高的 `score_threshold` 会将结果限制为更相关的 chunks，不过也可能排除一些潜在有用的结果。当提供 `ranking_options.hybrid_search` 时，你还可以调节 `hybrid_search.embedding_weight`（`rrf_embedding_weight`）和 `hybrid_search.text_weight`（`rrf_text_weight`），以控制 reciprocal rank fusion 如何平衡语义 embedding 匹配与稀疏关键词匹配。增大前者会强调语义相似性，增大后者会强调文本重合，并且请确保至少有一个权重大于零。

## 向量存储

向量存储是为检索 API 和[文件搜索](/mirror/api/docs/guides/tools-file-search)工具提供语义搜索能力的容器。当你向向量存储添加文件时，该文件会被自动分块、嵌入并建立索引。

向量存储包含 `vector_store_file` 对象，这些对象由 `file` 对象支撑。

| &lt;div style=&#123;&#123; minWidth: '150px', whiteSpace: 'nowrap' &#125;&#125;&gt;对象类型&lt;/div&gt; | 描述                                                                                                                                                                          |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file`                                                                     | 表示通过 [Files API](https://developers.openai.com/api/docs/api-reference/files) 上传的内容。常与 vector stores 一起使用，也用于 fine-tuning 和其他使用场景。                      |
| `vector_store`                                                             | 可搜索文件的容器。                                                                                                                                                            |
| `vector_store.file`                                                        | 专门表示某个 `file` 的包装类型；该 `file` 已被分块和嵌入，并已关联到一个 `vector_store`。&lt;br/&gt;包含用于筛选的 `attributes` map。 |

### 价格

你将按照所有向量存储使用的总存储量付费，该存储量由解析后的 chunks 及其对应嵌入的大小决定。

| 存储                           | 费用         |
| ------------------------------ | ------------ |
| 最多 1 GB（跨所有存储）        | 免费         |
| 超过 1 GB                      | $0.10/GB/天  |

请查看[过期策略](/mirror/api/docs/guides/retrieval#expiration-policies)，了解尽量降低成本的选项。

### 向量存储操作




创建


检索


更新


删除


列出




### 向量存储文件操作

某些操作（例如为 `vector_store.file` 执行 `create`）是异步的，可能需要时间完成。请使用我们的辅助函数，例如 `create_and_poll`，阻塞等待直到完成。否则，你可以检查状态。从向量存储中移除文件是最终一致的，搜索结果可能会在短时间内继续包含已移除文件的内容。

添加文件按向量存储 ID 进行速率限制。发往 [`/vector_stores/{vector_store_id}/files`](https://developers.openai.com/api/docs/api-reference/vector-stores/createFile) 和 [`/vector_stores/{vector_store_id}/file_batches`](https://developers.openai.com/api/docs/api-reference/vector-stores/createBatch) 的请求共享每个向量存储每分钟 300 个请求的限制。




创建


上传


检索


更新


删除


列出




### 批处理操作




创建


检索


取消


列出




创建 batch 时，你可以提供带有可选 `attributes` 和/或 `chunking_strategy` 的 `file_ids`，也可以使用 `files` 数组，为每个文件传入包含 `file_id` 以及可选 `attributes` 和 `chunking_strategy` 的对象。这两个选项互斥，因此你可以清晰控制是让每个文件共享相同设置，还是需要按文件覆盖。

为了将更高吞吐量的数据摄入单个向量存储，我们建议尽可能创建 batch。每个请求中 batch 最多可包含 500 个文件，相比发送许多单文件创建请求，这通常会减少竞争并改善端到端延迟。

### 属性

每个 `vector_store.file` 都可以有关联的 `attributes`，这是一个值字典，在使用 [attribute filtering](/mirror/api/docs/guides/retrieval#attribute-filtering) 执行[语义搜索](/mirror/api/docs/guides/retrieval#semantic-search)时可以引用。该字典最多可包含 16 个键，每个键限制为 256 个字符。

### 过期策略

你可以使用 `expires_after` 为 `vector_store` 对象设置过期策略。向量存储过期后，所有关联的 `vector_store.file` 对象都会被删除，并且你不会再为它们付费。

### 限制

最大文件大小为 512 MB。每个文件应包含不超过 5,000,000 个 tokens（附加文件时会自动计算）。

### 分块

默认情况下，`max_chunk_size_tokens` 设置为 `800`，`chunk_overlap_tokens` 设置为 `400`，这意味着每个文件都会通过拆分成 800-token chunks 来建立索引，相邻 chunks 之间有 400-token 重叠。

你可以在向 vector store 添加文件时设置 [`chunking_strategy`](https://developers.openai.com/api/docs/api-reference/vector-stores-files/createFile#vector-stores-files-createfile-chunking_strategy) 来调整这一点。`chunking_strategy` 有一些限制：

- `max_chunk_size_tokens` 必须介于 100 和 4096 之间（含两端）。
- `chunk_overlap_tokens` 必须为非负数，并且不应超过 `max_chunk_size_tokens / 2`。

### 支持的文件类型

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

## 合成响应

执行查询后，你可能想根据结果合成响应。你可以通过提供结果和原始查询，利用我们的模型返回有依据的响应。

这里使用一个示例 `format_results` 函数，其实现可以如下：

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
The **Retrieval API** allows you to perform [**semantic search**](#semantic-search) over your data, which is a technique that surfaces semantically similar results — even when they match few or no keywords. Retrieval is useful on its own, but is especially powerful when combined with our models to synthesize responses.

![Retrieval depiction](https://cdn.openai.com/API/docs/images/retrieval-depiction.png)

The Retrieval API is powered by [**vector stores**](#vector-stores), which serve as indices for your data. This guide will cover how to perform semantic search, and go into the details of vector stores.

## Quickstart

<li className={s.StandaloneLi} data-number={1}>
  **Create vector store** and upload files.
</li>

<li className={s.StandaloneLi} data-number={2}>
  **Send search query** to get relevant results.
</li>

To learn how to use the results with our models, check out the [synthesizing
  responses](#synthesizing-responses) section.

## Semantic search

**Semantic search** is a technique that leverages [vector embeddings](https://developers.openai.com/api/docs/guides/embeddings) to surface semantically relevant results. Importantly, this includes results with few or no shared keywords, which classical search techniques might miss.

For example, let's look at potential results for `"When did we go to the moon?"`:

| Text                                              | Keyword Similarity | Semantic Similarity |
| ------------------------------------------------- | ------------------ | ------------------- |
| The first lunar landing occurred in July of 1969. | 0%                 | 65%                 |
| The first man on the moon was Neil Armstrong.     | 27%                | 43%                 |
| When I ate the moon cake, it was delicious.       | 40%                | 28%                 |

_([Jaccard](https://en.wikipedia.org/wiki/Jaccard_index) used for keyword, [cosine](https://en.wikipedia.org/wiki/Cosine_similarity) with `text-embedding-3-small` used for semantic.)_

Notice how the most relevant result contains none of the words in the search query. This flexibility makes semantic search a very powerful technique for querying knowledge bases of any size.

Semantic search is powered by [vector stores](#vector-stores), which we cover in detail later in the guide. This section will focus on the mechanics of semantic search.

### Performing semantic search

You can query a vector store using the `search` function and specifying a `query` in natural language. This will return a list of results, each with the relevant chunks, similarity scores, and file of origin.

A response will contain 10 results maximum by default, but you can set up to 50 using the `max_num_results` param.

### Query rewriting

Certain query styles yield better results, so we've provided a setting to automatically rewrite your queries for optimal performance. Enable this feature by setting `rewrite_query=true` when performing a `search`.

The rewritten query will be available in the result's `search_query` field.

| **Original**                                                          | **Rewritten**                              |
| --------------------------------------------------------------------- | ------------------------------------------ |
| I'd like to know the height of the main office building.              | primary office building height             |
| What are the safety regulations for transporting hazardous materials? | safety regulations for hazardous materials |
| How do I file a complaint about a service issue?                      | service complaint filing process           |

### Attribute filtering

Attribute filtering helps narrow down results by applying criteria, such as restricting searches to a specific date range. You can define and combine criteria in `attribute_filter` to target files based on their attributes before performing semantic search.

Use **comparison filters** to compare a specific `key` in a file's `attributes` with a given `value`, and **compound filters** to combine multiple filters using `and` and `or`.

Below are some example filters.



<div data-content-switcher-pane data-value="region">
    <div class="hidden">Region</div>
    </div>
  <div data-content-switcher-pane data-value="date-range" hidden>
    <div class="hidden">Date range</div>
    </div>
  <div data-content-switcher-pane data-value="filename" hidden>
    <div class="hidden">Filenames</div>
    </div>
  <div data-content-switcher-pane data-value="exclude-filenames" hidden>
    <div class="hidden">Exclude filenames</div>
    </div>
  <div data-content-switcher-pane data-value="date-range-and-region" hidden>
    <div class="hidden">Complex</div>
    </div>



### Ranking

If you find that your file search results are not sufficiently relevant, you can adjust the `ranking_options` to improve the quality of responses. This includes specifying a `ranker`, such as `auto` or `default-2024-08-21`, and setting a `score_threshold` between 0.0 and 1.0. A higher `score_threshold` will limit the results to more relevant chunks, though it may exclude some potentially useful ones. When `ranking_options.hybrid_search` is provided you can also tune `hybrid_search.embedding_weight` (`rrf_embedding_weight`) and `hybrid_search.text_weight` (`rrf_text_weight`) to control how reciprocal rank fusion balances semantic embedding matches vs. sparse keyword matches. Increase the former to emphasize semantic similarity, increase the latter to emphasize textual overlap, and ensure at least one of the weights is greater than zero.

## Vector stores

Vector stores are the containers that power semantic search for the Retrieval API and the [file search](https://developers.openai.com/api/docs/guides/tools-file-search) tool. When you add a file to a vector store it will be automatically chunked, embedded, and indexed.

Vector stores contain `vector_store_file` objects, which are backed by a `file` object.

| <div style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>Object type</div> | Description                                                                                                                                                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file`                                                                     | Represents content uploaded through the [Files API](https://developers.openai.com/api/docs/api-reference/files). Often used with vector stores, but also for fine-tuning and other use cases.                      |
| `vector_store`                                                             | Container for searchable files.                                                                                                                                                       |
| `vector_store.file`                                                        | Wrapper type specifically representing a `file` that has been chunked and embedded, and has been associated with a `vector_store`. <br/>Contains `attributes` map used for filtering. |

### Pricing

You will be charged based on the total storage used across all your vector stores, determined by the size of parsed chunks and their corresponding embeddings.

| Storage                        | Cost         |
| ------------------------------ | ------------ |
| Up to 1 GB (across all stores) | Free         |
| Beyond 1 GB                    | $0.10/GB/day |

See [expiration policies](#expiration-policies) for options to minimize costs.

### Vector store operations



<div data-content-switcher-pane data-value="create">
    <div class="hidden">Create</div>
    </div>
  <div data-content-switcher-pane data-value="retrieve" hidden>
    <div class="hidden">Retrieve</div>
    </div>
  <div data-content-switcher-pane data-value="update" hidden>
    <div class="hidden">Update</div>
    </div>
  <div data-content-switcher-pane data-value="delete" hidden>
    <div class="hidden">Delete</div>
    </div>
  <div data-content-switcher-pane data-value="list" hidden>
    <div class="hidden">List</div>
    </div>



### Vector store file operations

Some operations, like `create` for `vector_store.file`, are asynchronous and may take time to complete — use our helper functions, like `create_and_poll` to block until it is. Otherwise, you may check the status. Removing files from a vector store is eventually consistent, and search results may still include content from a removed file for a short period.

Adding files is rate limited per vector store ID. Requests to [`/vector_stores/{vector_store_id}/files`](https://developers.openai.com/api/docs/api-reference/vector-stores/createFile) and [`/vector_stores/{vector_store_id}/file_batches`](https://developers.openai.com/api/docs/api-reference/vector-stores/createBatch) share a per-vector-store limit of 300 requests per minute.



<div data-content-switcher-pane data-value="create">
    <div class="hidden">Create</div>
    </div>
  <div data-content-switcher-pane data-value="upload" hidden>
    <div class="hidden">Upload</div>
    </div>
  <div data-content-switcher-pane data-value="retrieve" hidden>
    <div class="hidden">Retrieve</div>
    </div>
  <div data-content-switcher-pane data-value="update" hidden>
    <div class="hidden">Update</div>
    </div>
  <div data-content-switcher-pane data-value="delete" hidden>
    <div class="hidden">Delete</div>
    </div>
  <div data-content-switcher-pane data-value="list" hidden>
    <div class="hidden">List</div>
    </div>



### Batch operations



<div data-content-switcher-pane data-value="create">
    <div class="hidden">Create</div>
    </div>
  <div data-content-switcher-pane data-value="retrieve" hidden>
    <div class="hidden">Retrieve</div>
    </div>
  <div data-content-switcher-pane data-value="cancel" hidden>
    <div class="hidden">Cancel</div>
    </div>
  <div data-content-switcher-pane data-value="list" hidden>
    <div class="hidden">List</div>
    </div>



When creating a batch you can either provide `file_ids` with optional `attributes` and/or `chunking_strategy`, or use the `files` array to pass objects that include a `file_id` plus optional `attributes` and `chunking_strategy` for each file. The two options are mutually exclusive so that you can cleanly control whether every file shares the same settings or you need per-file overrides.

For higher-throughput ingestion into a single vector store, we recommend batch creation whenever possible. Batches can include up to 500 files in one request, which usually reduces contention and improves end-to-end latency versus sending many single-file create requests.

### Attributes

Each `vector_store.file` can have associated `attributes`, a dictionary of values that can be referenced when performing [semantic search](#semantic-search) with [attribute filtering](#attribute-filtering). The dictionary can have at most 16 keys, with a limit of 256 characters each.

### Expiration policies

You can set an expiration policy on `vector_store` objects with `expires_after`. Once a vector store expires, all associated `vector_store.file` objects will be deleted and you'll no longer be charged for them.

### Limits

The maximum file size is 512 MB. Each file should contain no more than 5,000,000 tokens per file (computed automatically when you attach a file).

### Chunking

By default, `max_chunk_size_tokens` is set to `800` and `chunk_overlap_tokens` is set to `400`, meaning every file is indexed by being split up into 800-token chunks, with 400-token overlap between consecutive chunks.

You can adjust this by setting [`chunking_strategy`](https://developers.openai.com/api/docs/api-reference/vector-stores-files/createFile#vector-stores-files-createfile-chunking_strategy) when adding files to the vector store. There are certain limitations to `chunking_strategy`:

- `max_chunk_size_tokens` must be between 100 and 4096 inclusive.
- `chunk_overlap_tokens` must be non-negative and should not exceed `max_chunk_size_tokens / 2`.

Supported file types

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

## Synthesizing responses

After performing a query you may want to synthesize a response based on the results. You can leverage our models to do so, by supplying the results and original query, to get back a grounded response.

This uses a sample `format_results` function, which could be implemented like
so:
``````
:::
:::

