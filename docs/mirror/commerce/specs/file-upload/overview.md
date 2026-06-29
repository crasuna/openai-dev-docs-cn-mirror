---
title: "文件上传概览"
description: "Provide a structured product feed as file upload to an SFTP server."
outline: deep
---

# 文件上传概览

**文档集**：Commerce 商务<br>
**分组**：Agentic Commerce — 规范<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/commerce/specs/file-upload/overview](https://developers.openai.com/commerce/specs/file-upload/overview)
- Markdown 来源：[https://developers.openai.com/commerce/specs/file-upload/overview.md](https://developers.openai.com/commerce/specs/file-upload/overview.md)
- 抓取时间：2026-06-27T05:55:13.138Z
- Checksum：`1f46c5655266d83cda633b6911e22617b55d1a13f68f473785fb177098531ba1`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用本指南，以最少的来回沟通从第一个 sample 迁移到 production feed delivery，并使用
[products spec](/mirror/commerce/specs/file-upload/products) 查看完整 schema 和 field
definitions。

## Feed model 和交付

### 支持的 feed 类型

- **Full snapshot feed**：作为事实来源处理的完整 catalog export。
- **Recommended cadence**：建议至少每天一次。

### 交付和文件要求

| &lt;span class="whitespace-nowrap"&gt;主题&lt;/span&gt; | 指引 |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| &lt;span class="whitespace-nowrap"&gt;Delivery model&lt;/span&gt; | 通过 SFTP 将 feeds push 到 OpenAI。 |
| &lt;span class="whitespace-nowrap"&gt;Formats&lt;/span&gt; | 优先使用 `parquet`（最好使用 `ztsd` compression）。也支持 `jsonl.gz`、`csv.gz` 和 `tsv.gz`。 |
| &lt;span class="whitespace-nowrap"&gt;Encoding&lt;/span&gt; | UTF-8 |
| &lt;span class="whitespace-nowrap"&gt;Filename stability&lt;/span&gt; | 使用稳定文件名。每次更新时保持同一文件名，并用最新 snapshot 覆盖它，而不是每次运行都创建新名称。 |
| &lt;span class="whitespace-nowrap"&gt;Update behavior&lt;/span&gt; | 如果使用多个 shard files，请保持该 shard set 稳定，并在每次更新时替换相同的 shard files。 |
| &lt;span class="whitespace-nowrap"&gt;Shard sizing&lt;/span&gt; | 建议每个 shard 最多 500k items；目标 shard files 小于约 500MB |

### 留意常见摄取失败

- 缺少 required fields
- 过时或不符合 spec 的 field names
- 格式错误的 field values

### 明确处理移除

- 要移除 product，请设置 `is_eligible_search=false`，或从下一次 full snapshot 中移除该 record。

### 以 snapshot pipeline 方式运行

- 按可预测节奏发布 full snapshots（至少每天一次）。

### 使用 push-based delivery 和稳定文件名

- 通过受支持 channels push feeds。
- 每次发布都复用相同 file path/name，并原地覆盖。
- 如果多个 brand feeds 共享一个位置，请使用清晰的 brand-prefixed names。

### 分阶段验证

- 从小 sample 开始（约 100 items）。
- 在每个 sample row 中包含所有 required fields。
- 对第一个 full snapshot 运行 QA。
- validation 干净后再进入 steady-state automation。

:::

## English source

::: details 展开英文原文
::: v-pre
Use this guide to move from first sample to production feed delivery with
minimal back-and-forth, and use the
[products spec](/mirror/commerce/specs/file-upload/products) for full schema and field
definitions.

## Feed model and delivery

### Supported feed type

- **Full snapshot feed**: a complete catalog export treated as the source of truth.
- **Recommended cadence**: at least daily.

### Delivery and file requirements

| &lt;span class="whitespace-nowrap"&gt;Topic&lt;/span&gt;              | Guidance                                                                                                                                           |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| &lt;span class="whitespace-nowrap"&gt;Delivery model&lt;/span&gt;     | Push feeds to OpenAI via SFTP.                                                                                                                     |
| &lt;span class="whitespace-nowrap"&gt;Formats&lt;/span&gt;            | Prefer `parquet` (ideally with `ztsd` compression). `jsonl.gz`, `csv.gz`, and `tsv.gz` are also supported.                                         |
| &lt;span class="whitespace-nowrap"&gt;Encoding&lt;/span&gt;           | UTF-8                                                                                                                                              |
| &lt;span class="whitespace-nowrap"&gt;Filename stability&lt;/span&gt; | Use a stable file name. Keep the same file name on every update and overwrite it with the latest snapshot instead of creating a new name each run. |
| &lt;span class="whitespace-nowrap"&gt;Update behavior&lt;/span&gt;    | If you use multiple shard files, keep that shard set stable and replace the same shard files on each update.                                       |
| &lt;span class="whitespace-nowrap"&gt;Shard sizing&lt;/span&gt;       | Up to 500k items per shard is recommended; target shard files under ~500MB                                                                         |

### Watch common ingestion failures

- Missing required fields
- Outdated or non-spec field names
- Malformed field values

### Handle removals explicitly

- To remove a product, either set `is_eligible_search=false` or remove the record from your next full snapshot.

### Operate as a snapshot pipeline

- Publish full snapshots on a predictable cadence (at least daily).

### Use push-based delivery and stable filenames

- Push feeds through supported channels.
- Reuse the same file path/name each publish and overwrite in place.
- If multiple brand feeds share one location, use clear brand-prefixed names.

### Validate in phases

- Start with a small sample (around 100 items).
- Include all required fields in every sample row.
- Run QA on the first full snapshot.
- Move to steady-state automation once validation is clean.

:::
:::

