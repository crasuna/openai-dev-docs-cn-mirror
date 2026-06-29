---
status: needs-review
sourceId: "1f46c5655266"
sourceChecksum: "1f46c5655266d83cda633b6911e22617b55d1a13f68f473785fb177098531ba1"
sourceUrl: "https://developers.openai.com/commerce/specs/file-upload/overview"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# 文件上传概览

使用本指南，以最少的来回沟通从第一个 sample 迁移到 production feed delivery，并使用
[products spec](https://developers.openai.com/commerce/specs/file-upload/products) 查看完整 schema 和 field
definitions。

## Feed model 和交付

### 支持的 feed 类型

- **Full snapshot feed**：作为事实来源处理的完整 catalog export。
- **Recommended cadence**：建议至少每天一次。

### 交付和文件要求

| <span class="whitespace-nowrap">主题</span> | 指引 |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span class="whitespace-nowrap">Delivery model</span> | 通过 SFTP 将 feeds push 到 OpenAI。 |
| <span class="whitespace-nowrap">Formats</span> | 优先使用 `parquet`（最好使用 `ztsd` compression）。也支持 `jsonl.gz`、`csv.gz` 和 `tsv.gz`。 |
| <span class="whitespace-nowrap">Encoding</span> | UTF-8 |
| <span class="whitespace-nowrap">Filename stability</span> | 使用稳定文件名。每次更新时保持同一文件名，并用最新 snapshot 覆盖它，而不是每次运行都创建新名称。 |
| <span class="whitespace-nowrap">Update behavior</span> | 如果使用多个 shard files，请保持该 shard set 稳定，并在每次更新时替换相同的 shard files。 |
| <span class="whitespace-nowrap">Shard sizing</span> | 建议每个 shard 最多 500k items；目标 shard files 小于约 500MB |

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
