# Overview

Use this guide to move from first sample to production feed delivery with
minimal back-and-forth, and use the
[products spec](https://developers.openai.com/commerce/specs/file-upload/products) for full schema and field
definitions.

## Feed model and delivery

### Supported feed type

- **Full snapshot feed**: a complete catalog export treated as the source of truth.
- **Recommended cadence**: at least daily.

### Delivery and file requirements

| <span class="whitespace-nowrap">Topic</span>              | Guidance                                                                                                                                           |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span class="whitespace-nowrap">Delivery model</span>     | Push feeds to OpenAI via SFTP.                                                                                                                     |
| <span class="whitespace-nowrap">Formats</span>            | Prefer `parquet` (ideally with `ztsd` compression). `jsonl.gz`, `csv.gz`, and `tsv.gz` are also supported.                                         |
| <span class="whitespace-nowrap">Encoding</span>           | UTF-8                                                                                                                                              |
| <span class="whitespace-nowrap">Filename stability</span> | Use a stable file name. Keep the same file name on every update and overwrite it with the latest snapshot instead of creating a new name each run. |
| <span class="whitespace-nowrap">Update behavior</span>    | If you use multiple shard files, keep that shard set stable and replace the same shard files on each update.                                       |
| <span class="whitespace-nowrap">Shard sizing</span>       | Up to 500k items per shard is recommended; target shard files under ~500MB                                                                         |

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
