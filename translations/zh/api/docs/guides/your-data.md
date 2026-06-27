---
status: needs-review
sourceId: "fc916c28735f"
sourceChecksum: "fc916c28735fb6bca92bb34bbfca513af8406a79a602321802a454f4da634452"
sourceUrl: "https://developers.openai.com/api/docs/guides/your-data"
translatedAt: "2026-06-27T17:30:14.9009790+08:00"
translator: codex-gpt-5.5-xhigh
---

# OpenAI 平台中的数据控制

了解 OpenAI 如何使用你的数据，以及你可以如何控制这些数据。

你的数据就是你的数据。自 2023 年 3 月 1 日起，发送到 OpenAI API 的数据不会用于训练或改进 OpenAI 模型（除非你明确选择加入，与我们共享数据）。

## OpenAI API 存储的数据类型

使用 OpenAI API 时，数据可能会以下列形式存储：

- **滥用监控日志：** 根据你对平台的使用情况生成的日志，OpenAI 需要这些日志来执行我们的[使用政策](https://openai.com/policies/usage-policies)，并减少 AI 的有害使用。
- **应用状态：** 为了完成任务或请求，由某些 API 功能持久化的数据。

## 滥用监控的数据保留控制

滥用监控日志可能包含某些客户内容，例如 prompts 和 responses，也可能包含从这些客户内容派生出的元数据，例如分类器输出。默认情况下，所有 API 功能使用都会生成滥用监控日志，并最多保留 30 天，除非法律要求保留更长时间，或者为了保护我们的服务或任何第三方免受损害而有合理必要。

符合条件的客户可以通过获批使用 [Zero Data Retention](#zero-data-retention) 或 [Modified Abuse Monitoring](#modified-abuse-monitoring) 控制，在下列限制约束下，将其客户内容排除在这些滥用监控日志之外。目前，这些控制需要 OpenAI 事先批准，并需要接受额外要求。获批客户可以为其 API Organization 或项目在 Modified Abuse Monitoring 与 Zero Data Retention 之间进行选择。

启用 Modified Abuse Monitoring 或 Zero Data Retention 的客户负责确保其用户遵守 OpenAI 关于安全、负责任地使用 AI 的政策，并遵守适用法律下的任何审核和报告要求。

请联系我们的[销售团队](https://openai.com/contact-sales)，了解这些产品并咨询资格条件。

### Modified Abuse Monitoring

Modified Abuse Monitoring 会从所有 API endpoint 的滥用监控日志中排除客户内容（少数情况下的图片和文件输入除外，如[下文](https://developers.openai.com/api/docs/guides/your-data#image-and-file-inputs)所述），同时仍允许客户使用 OpenAI 平台的全部能力。

### Zero Data Retention

Zero Data Retention 会以与 Modified Abuse Monitoring 相同的方式，将客户内容排除在滥用监控日志之外。

此外，Zero Data Retention 会改变某些 endpoint 的行为：即使请求尝试将值设为 `true`，`/v1/responses` 和 `v1/chat/completions` 的 `store` 参数也始终会被视为 `false`。

除这些特定行为变更外，下表中 Zero Data Retention Eligible 为 No 的 endpoints 和能力即使在启用 Zero Data Retention 后，仍可能存储应用状态。

### Safety Retention

如果为了调查严重风险活动而有合理必要，我们保留使特定客户无法将 `gpt-5.5`、`gpt-5.5-pro` 以及未来模型用于 Zero Data Retention 或 Modified Abuse Monitoring 的权利，并会提前以书面形式通知受影响客户。在这种情况下，当使用这些模型时，如果我们的分类器检测到客户内容可能违反我们的[使用政策](https://openai.com/policies/usage-policies/)，我们可能会保留这些客户内容。除此之外，保留不会受到影响。

### 配置数据保留控制

一旦你的组织获批使用数据保留控制，你将在 [Settings → Organization → Data controls](https://platform.openai.com/settings/organization/data-controls/data-retention) 中看到 **Data Retention** 标签页。你可以在该标签页中，在组织和项目两个层级配置数据保留控制。

- **组织级控制：** 为整个组织选择 Zero Data Retention 或 Modified Abuse Monitoring。
- **项目级控制：** 对每个项目，选择 `default` 以继承组织级设置，明确选择 Zero Data Retention 或 Modified Abuse Monitoring，或选择 **None** 以对该项目禁用这些控制。

### 每个 endpoint 的存储要求和保留控制

下表说明每个 endpoint 何时会存储应用状态。Zero Data Retention eligible endpoints 不会为应用状态保留任何客户内容，但受下列限制约束。Zero Data Retention ineligible endpoints 或能力在使用时可能会保留应用状态，即使你已启用 Zero Data Retention。

| Endpoint                   | 用于训练的数据 | 滥用监控保留 | 应用状态保留 | Zero Data Retention eligible |
| -------------------------- | :------------: | :----------: | :----------: | :--------------------------: |
| `/v1/chat/completions`     |       否       |    30 天     | 无，例外见下文 | 是，限制见下文 |
| `/v1/responses`            |       否       |    30 天     | 无，例外见下文 | 是，限制见下文 |
| `/v1/conversations`        |       否       |  直到删除    |  直到删除    |              否              |
| `/v1/conversations/items`  |       否       |  直到删除    |  直到删除    |              否              |
| `/v1/chatkit/threads`      |       否       |  直到删除    |  直到删除    |              否              |
| `/v1/assistants`           |       否       |    30 天     |  直到删除    |              否              |
| `/v1/threads`              |       否       |    30 天     |  直到删除    |              否              |
| `/v1/threads/messages`     |       否       |    30 天     |  直到删除    |              否              |
| `/v1/threads/runs`         |       否       |    30 天     |  直到删除    |              否              |
| `/v1/threads/runs/steps`   |       否       |    30 天     |  直到删除    |              否              |
| `/v1/vector_stores`        |       否       |    30 天     |  直到删除    |              否              |
| `/v1/images/generations`   |       否       |    30 天     |      无      | 是，限制见下文 |
| `/v1/images/edits`         |       否       |    30 天     |      无      | 是，限制见下文 |
| `/v1/images/variations`    |       否       |    30 天     |      无      | 是，限制见下文 |
| `/v1/embeddings`           |       否       |    30 天     |      无      |              是              |
| `/v1/audio/transcriptions` |       否       |      无      |      无      |              是              |
| `/v1/audio/translations`   |       否       |      无      |      无      |              是              |
| `/v1/audio/speech`         |       否       |    30 天     |      无      |              是              |
| `/v1/files`                |       否       |    30 天     |  直到删除\*  |              否              |
| `/v1/fine_tuning/jobs`     |       否       |    30 天     |  直到删除    |              否              |
| `/v1/evals`                |       否       |    30 天     |  直到删除    |              否              |
| `/v1/batches`              |       否       |    30 天     |  直到删除    |              否              |
| `/v1/moderations`          |       否       |      无      |      无      |              是              |
| `/v1/completions`          |       否       |    30 天     |      无      |              是              |
| `/v1/realtime`             |       否       |    30 天     |      无      |              是              |
| `/v1/videos`               |       否       |    30 天     |      无      |              否              |

#### `/v1/chat/completions`

- Audio outputs 的应用状态会存储 1 小时，以支持[多轮对话](https://developers.openai.com/api/docs/guides/audio)。
- 当组织启用 Zero Data Retention 时，即使请求尝试将值设为 `true`，`store` 参数也始终会被视为 `false`。
- 请参阅[图片和文件输入](#图片和文件输入)。
- Extended prompt caching 需要将加密的 key/value tensors 作为应用状态存储到 GPU 本地存储。该数据存储在本地 GPU 机器上，并且在 24 小时数据过期后不会保留。对 gpt-5.5、gpt-5.5-pro 以及所有未来模型的请求都需要 extended prompt caching，并且将 prompt_cache_retention 值设为 in_memory 会导致请求错误。要了解更多信息，请参阅 [prompt caching guide](https://developers.openai.com/api/docs/guides/prompt-caching#prompt-cache-retention)。

#### `/v1/responses`

- Responses API 默认具有 30 天的 Application State 保留期，或在 `store` 参数设置为 `true` 时具有该保留期。Response data 将至少存储 30 天。
- 当组织启用 Zero Data Retention 时，即使请求尝试将值设为 `true`，`store` 参数也始终会被视为 `false`。
- Background mode 会将 response data 存储到磁盘约 10 分钟，以支持轮询。
- Audio outputs 的应用状态会存储 1 小时，以支持[多轮对话](https://developers.openai.com/api/docs/guides/audio)。
- 请参阅[图片和文件输入](#图片和文件输入)。
- MCP servers（与 [remote MCP server tool](https://developers.openai.com/api/docs/guides/tools-remote-mcp) 一起使用）是第三方服务，发送到 MCP server 的数据受其数据保留政策约束。
- [Hosted Shell](https://developers.openai.com/api/docs/guides/tools-shell#hosted-shell-quickstart) 和 [Code Interpreter](https://developers.openai.com/api/docs/guides/tools-code-interpreter) 使用的 hosted containers 在处于活动状态时，可能会将临时应用状态写入容器文件系统（由临时 block storage 支撑）。当容器过期或被明确删除时，容器数据会被删除。
- Extended prompt caching 需要将加密的 key/value tensors 作为应用状态存储到 GPU 本地存储。该数据存储在本地 GPU 机器上，并且在 24 小时数据过期后不会保留。对 gpt-5.5、gpt-5.5-pro 以及所有未来模型的请求都需要 extended prompt caching，并且将 prompt_cache_retention 值设为 in_memory 会导致请求错误。要了解更多信息，请参阅 [prompt caching guide](https://developers.openai.com/api/docs/guides/prompt-caching#prompt-cache-retention)。
- 当组织未启用 Zero Data Retention 时，所有查询都会对所有受支持模型使用 extended prompt caching。
- 对于 server-side compaction，当 `store="false"` 时不会保留任何数据。
- 我们支持两种形态的 [Skills](https://developers.openai.com/api/docs/guides/tools-skills)：本地执行和基于 hosted container 的执行。Hosted skills 遵循与 hosted shell 相同的容器生命周期：挂载的 skills 和容器文件会在容器处于活动状态时保持可用，并在容器过期或被删除时丢弃。
- 通过网络连接传输到第三方服务的数据受其数据保留政策约束。

#### `/v1/assistants`、`/v1/threads` 和 `/v1/vector_stores`

- 与 Assistants API 相关的对象会在你通过 API 或 dashboard 删除后 30 天内从我们的服务器删除。未通过 API 或 dashboard 删除的对象会无限期保留。

#### `/v1/images`

- 使用 `gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 和 `gpt-image-1-mini` 时，图片生成与 Zero Data Retention 兼容；使用 `dall-e-3` 或 `dall-e-2` 时不兼容。

#### `/v1/files`

- 文件可以通过 API 或 dashboard 手动删除，也可以通过设置 `expires_after` 参数自动删除。更多信息见[此处](https://developers.openai.com/api/docs/api-reference/files/create#files_create-expires_after)。

#### `/v1/videos`

- `v1/videos` API 包含一个工作流，会在处理期间将数据保存到磁盘，并保留 48 小时以允许调用方下载生成的视频，之后为滥用监控再保留 30 天。`v1/videos` 当前会阻止 MAM 或 ZDR 请求。如果你的组织启用了数据保留控制，请按[配置数据保留控制](#配置数据保留控制)中所述，配置一个保留设置为 **None** 的项目，以便通过该项目使用 `/v1/videos`。

#### 图片和文件输入

图片和文件可以作为输入上传到 `/v1/responses`（包括使用 Computer Use tool 时）、`/v1/chat/completions` 和 `/v1/images`。图片和文件输入在提交时会被扫描是否包含 CSAM 内容。如果分类器检测到潜在 CSAM 内容，即使启用了 Zero Data Retention 或 Modified Abuse Monitoring，该图片也会被保留以供人工审核。

#### Web Search

具有实时互联网访问能力的 Web Search 不符合 HIPAA 适用资格，也不受 BAA 覆盖。在 offline/cache-only mode（`external_web_access: false`）下，当使用来自 ZDR 组织内启用 ZDR 的项目的 API key 时，Web Search 有资格受 BAA 覆盖。本 HIPAA/BAA 指引仅适用于 Responses API 的 `web_search` tool。注意：Preview variants（`web_search_preview`）会忽略此参数，并表现得就像 `external_web_access` 为 `true`。我们建议使用 `web_search`。

## 数据驻留控制

数据驻留控制是一项项目配置选项，可让你配置 OpenAI 用于提供服务的基础设施位置。

请联系我们的[销售团队](https://openai.com/contact-sales)，了解你是否有资格使用数据驻留控制。对于 2026 年 3 月 5 日或之后发布且符合数据驻留条件的模型，数据驻留 endpoints 会收取 [10% 上浮](https://developers.openai.com/api/docs/pricing)费用。

### 数据驻留如何工作？

当你的账户启用数据驻留后，你可以为账户中新建的项目设置一个区域，区域来自下方列出的可用区域。如果你使用下方列出的受支持 endpoint、模型和 snapshots，则该项目的 Customer Content（按你的服务协议定义）会在 endpoint 为运行而需要数据持久化的范围内（例如 /v1/batches），以静态存储形式存储在所选区域中。

如果你选择的区域支持 regional processing（如下方明确标识），服务也会在所选区域内对你的 Customer Content 执行推理。

数据驻留不适用于系统数据；系统数据可能会在所选区域之外处理和存储。系统数据是指不包含 Customer Content 的账户数据、元数据和使用数据，这些数据由服务收集并用于管理和运营服务，例如账户信息，或直接访问服务的最终用户（例如你的人员）的 profile、分析、使用统计、账单信息、支持请求和 structured output schema。

### 限制

数据驻留不适用于：(a) 因 End User 或 Customer 的基础设施位置在访问服务时造成的 Customer Content 在所选区域之外的任何传输或存储；(b) 由 OpenAI 以外的各方通过 Services 提供的产品、服务或内容；或 (c) Customer Content 以外的任何数据，例如系统数据。

如果你选择的 Region 不支持 regional processing（如下方标识），OpenAI 也可能会在 Region 之外处理并临时存储 Customer Content，以交付服务。

### 非美国区域的额外要求

要在美国以外的任何区域使用数据驻留，你必须获批使用滥用监控控制，并签署 Zero Data Retention 修正案。

选择阿拉伯联合酋长国区域需要额外批准。请联系[销售](https://openai.com/contact-sales)获取帮助。

### 如何使用数据驻留

数据驻留在你的 API Organization 内按项目配置。

要为 regional storage 配置数据驻留，请在创建新项目时从下拉列表中选择适当区域。

对于发送到已配置数据驻留的项目的请求，请将下表定义的域名前缀添加到每个请求中。

### 哪些模型和功能符合数据驻留条件？

以下模型和 API 服务目前在下方指定区域符合数据驻留条件。

使用 **按区域支持情况** 比较区域能力，并展开每个区域中可用的服务。使用 **API Endpoint、tool 和 model support** 查看完整模型列表和详细服务视图。支持 regional storage 并不意味着支持 regional processing。

#### 按区域支持情况

下面是完整、未过滤的区域支持表。每项服务的 model snapshots 列在 **API Endpoint、tool 和 model support** 中。当 regional processing 仅支持一部分 snapshots 时，该子集会包含在 processing-services 单元格中。

| Region | Domain prefix | Regional storage | Regional processing | MAM 或 ZDR 必需 | 支持的模式 | Storage services | Processing services |
| ------ | ------------- | :--------------: | :-----------------: | :-------------: | ---------- | ---------------- | ------------------- |
| 美国 | `us.api.openai.com` | 是 | 是 | 否 | Text, Audio, Voice, Image | `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech`<br />`/v1/batches`<br />`/v1/chat/completions`<br />`/v1/embeddings`<br />`/v1/evals`<br />`/v1/files`<br />`/v1/fine_tuning/jobs`<br />`/v1/images/edits`<br />`/v1/images/generations`<br />`/v1/moderations`<br />`/v1/realtime`<br />`/v1/realtime/transcription_sessions`<br />`/v1/realtime/translations`<br />`/v1/realtime (legacy previews)`<br />`/v1/responses`<br />`/v1/responses File Search`<br />`/v1/responses Web Search`<br />`/v1/vector_stores`<br />`Code Interpreter tool`<br />`File Search`<br />`File Uploads`<br />`Remote MCP server tool`<br />`Scale Tier`<br />`Structured Outputs (excluding schema)`<br />`Supported input modalities` | `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech`<br />`/v1/batches`<br />`/v1/chat/completions`<br />`/v1/embeddings`<br />`/v1/evals`<br />`/v1/fine_tuning/jobs`<br />`/v1/images/edits`<br />`/v1/images/generations`<br />`/v1/moderations`<br />`/v1/realtime`<br />`/v1/realtime/transcription_sessions`<br />`/v1/realtime/translations`<br />`/v1/realtime (legacy previews)`<br />`/v1/responses`<br />`/v1/responses File Search`<br />`/v1/responses Web Search`<br />`Code Interpreter tool`<br />`File Search`<br />`Remote MCP server tool`<br />`Scale Tier`<br />`Structured Outputs (excluding schema)`<br />`Supported input modalities` |
| 欧洲（EEA + 瑞士）\* | `eu.api.openai.com` | 是 | 是 | 是 | Text, Audio, Voice, Image | `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech`<br />`/v1/batches`<br />`/v1/chat/completions`<br />`/v1/embeddings`<br />`/v1/evals`<br />`/v1/files`<br />`/v1/fine_tuning/jobs`<br />`/v1/images/edits`<br />`/v1/images/generations`<br />`/v1/moderations`<br />`/v1/realtime`<br />`/v1/realtime/transcription_sessions`<br />`/v1/realtime/translations`<br />`/v1/responses`<br />`/v1/responses File Search`<br />`/v1/responses Web Search`<br />`/v1/vector_stores`<br />`Code Interpreter tool`<br />`File Search`<br />`File Uploads`<br />`Remote MCP server tool`<br />`Scale Tier`<br />`Structured Outputs (excluding schema)`<br />`Supported input modalities` | `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech`<br />`/v1/batches`<br />`/v1/chat/completions`<br />`/v1/embeddings`<br />`/v1/evals`<br />`/v1/fine_tuning/jobs`<br />`/v1/images/edits`<br />`/v1/images/generations`<br />`/v1/moderations`<br />`/v1/realtime`<br />`/v1/realtime/transcription_sessions`<br />`/v1/realtime/translations`<br />`/v1/responses`<br />`/v1/responses File Search`<br />`/v1/responses Web Search`<br />`Code Interpreter tool`<br />`File Search`<br />`Remote MCP server tool`<br />`Scale Tier`<br />`Structured Outputs (excluding schema)`<br />`Supported input modalities` |
| 澳大利亚\* | `au.api.openai.com` | 是 | 否 | 是 | Text, Audio, Voice, Image | `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech`<br />`/v1/batches`<br />`/v1/chat/completions`<br />`/v1/embeddings`<br />`/v1/files`<br />`/v1/fine_tuning/jobs`<br />`/v1/images/edits`<br />`/v1/images/generations`<br />`/v1/moderations`<br />`/v1/responses`<br />`/v1/responses File Search`<br />`/v1/responses Web Search`<br />`/v1/vector_stores`<br />`Code Interpreter tool`<br />`File Search`<br />`File Uploads`<br />`Remote MCP server tool`<br />`Scale Tier`<br />`Structured Outputs (excluding schema)`<br />`Supported input modalities` | 无 |
| 加拿大\* | `ca.api.openai.com` | 是 | 否 | 是 | Text, Audio, Voice, Image | `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech`<br />`/v1/batches`<br />`/v1/chat/completions`<br />`/v1/embeddings`<br />`/v1/files`<br />`/v1/fine_tuning/jobs`<br />`/v1/images/edits`<br />`/v1/images/generations`<br />`/v1/moderations`<br />`/v1/responses`<br />`/v1/responses File Search`<br />`/v1/responses Web Search`<br />`/v1/vector_stores`<br />`Code Interpreter tool`<br />`File Search`<br />`File Uploads`<br />`Remote MCP server tool`<br />`Scale Tier`<br />`Structured Outputs (excluding schema)`<br />`Supported input modalities` | 无 |
| 日本\* | `jp.api.openai.com` | 是 | 否 | 是 | Text, Audio, Voice, Image | `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech`<br />`/v1/batches`<br />`/v1/chat/completions`<br />`/v1/embeddings`<br />`/v1/files`<br />`/v1/fine_tuning/jobs`<br />`/v1/images/edits`<br />`/v1/images/generations`<br />`/v1/moderations`<br />`/v1/responses`<br />`/v1/responses File Search`<br />`/v1/responses Web Search`<br />`/v1/vector_stores`<br />`Code Interpreter tool`<br />`File Search`<br />`File Uploads`<br />`Remote MCP server tool`<br />`Scale Tier`<br />`Structured Outputs (excluding schema)`<br />`Supported input modalities` | 无 |
| 印度\* | `in.api.openai.com` | 是 | 否 | 是 | Text, Audio, Voice, Image | `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech`<br />`/v1/batches`<br />`/v1/chat/completions`<br />`/v1/embeddings`<br />`/v1/files`<br />`/v1/fine_tuning/jobs`<br />`/v1/images/edits`<br />`/v1/images/generations`<br />`/v1/moderations`<br />`/v1/responses`<br />`/v1/responses File Search`<br />`/v1/responses Web Search`<br />`/v1/vector_stores`<br />`Code Interpreter tool`<br />`File Search`<br />`File Uploads`<br />`Remote MCP server tool`<br />`Scale Tier`<br />`Structured Outputs (excluding schema)`<br />`Supported input modalities` | 无 |
| 新加坡\* | `sg.api.openai.com` | 是 | 否 | 是 | Text, Audio, Voice, Image | `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech`<br />`/v1/batches`<br />`/v1/chat/completions`<br />`/v1/embeddings`<br />`/v1/files`<br />`/v1/fine_tuning/jobs`<br />`/v1/images/edits`<br />`/v1/images/generations`<br />`/v1/moderations`<br />`/v1/responses`<br />`/v1/responses File Search`<br />`/v1/responses Web Search`<br />`/v1/vector_stores`<br />`Code Interpreter tool`<br />`File Search`<br />`File Uploads`<br />`Remote MCP server tool`<br />`Scale Tier`<br />`Structured Outputs (excluding schema)`<br />`Supported input modalities` | 无 |
| 韩国\* | `kr.api.openai.com` | 是 | 否 | 是 | Text, Audio, Voice, Image | `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech`<br />`/v1/batches`<br />`/v1/chat/completions`<br />`/v1/embeddings`<br />`/v1/files`<br />`/v1/fine_tuning/jobs`<br />`/v1/images/edits`<br />`/v1/images/generations`<br />`/v1/moderations`<br />`/v1/responses`<br />`/v1/responses File Search`<br />`/v1/responses Web Search`<br />`/v1/vector_stores`<br />`Code Interpreter tool`<br />`File Search`<br />`File Uploads`<br />`Remote MCP server tool`<br />`Scale Tier`<br />`Structured Outputs (excluding schema)`<br />`Supported input modalities` | 无 |
| 英国\* | `gb.api.openai.com` | 是 | 否 | 是 | Text, Audio, Voice, Image | `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech`<br />`/v1/batches`<br />`/v1/chat/completions`<br />`/v1/embeddings`<br />`/v1/files`<br />`/v1/fine_tuning/jobs`<br />`/v1/images/edits`<br />`/v1/images/generations`<br />`/v1/moderations`<br />`/v1/responses`<br />`/v1/responses File Search`<br />`/v1/responses Web Search`<br />`/v1/vector_stores`<br />`Code Interpreter tool`<br />`File Search`<br />`File Uploads`<br />`Remote MCP server tool`<br />`Scale Tier`<br />`Structured Outputs (excluding schema)`<br />`Supported input modalities` | 无 |
| 阿拉伯联合酋长国\* | `ae.api.openai.com` | 是 | 是 | 是 | Text, Audio, Voice, Image | `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech`<br />`/v1/batches`<br />`/v1/chat/completions`<br />`/v1/embeddings`<br />`/v1/files`<br />`/v1/fine_tuning/jobs`<br />`/v1/images/edits`<br />`/v1/images/generations`<br />`/v1/moderations`<br />`/v1/responses`<br />`/v1/responses File Search`<br />`/v1/responses Web Search`<br />`/v1/vector_stores`<br />`Code Interpreter tool`<br />`File Search`<br />`File Uploads`<br />`Remote MCP server tool`<br />`Scale Tier`<br />`Structured Outputs (excluding schema)`<br />`Supported input modalities` | `/v1/chat/completions` (`gpt-5.2-2025-12-11`, `gpt-4.1-2025-04-14`)<br />`/v1/embeddings` (`text-embedding-3-small`, `text-embedding-3-large`)<br />`/v1/responses` (`gpt-5.2-2025-12-11`, `gpt-4.1-2025-04-14`) |

\* 这些区域中的 Image 支持需要获批使用增强版 Zero Data Retention 或增强版 Modified Abuse Monitoring。

#### API Endpoint、tool 和 model support

| Endpoint 或 feature | Service | Storage regions | Processing regions | 支持的 models 和 snapshots | Regional processing snapshot exceptions | 备注 |
| ------------------- | ------- | --------------- | ------------------ | --------------------------- | ---------------------------------------- | ---- |
| `/v1/audio/transcriptions, /v1/audio/translations, /v1/audio/speech` | Audio | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | `tts-1`, `whisper-1`, `gpt-4o-tts`, `gpt-4o-transcribe`, `gpt-4o-mini-transcribe` | 无 | — |
| `/v1/batches` | Batches | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | `gpt-5.5-pro-2026-04-23`, `gpt-5.4-pro-2026-03-05`, `gpt-5.2-pro-2025-12-11`, `gpt-5-pro-2025-10-06`, `gpt-5.5-2026-04-23`, `gpt-5.4-2026-03-05`, `gpt-5-2025-08-07`, `gpt-5.4-mini-2026-03-17`, `gpt-5.4-nano-2026-03-17`, `gpt-5.2-2025-12-11`, `gpt-5.1-2025-11-13`, `gpt-5-mini-2025-08-07`, `gpt-5-nano-2025-08-07`, `gpt-4.1-2025-04-14`, `gpt-4.1-mini-2025-04-14`, `gpt-4.1-nano-2025-04-14`, `o3-2025-04-16`, `o4-mini-2025-04-16`, `o1-pro`, `o1-pro-2025-03-19`, `o3-mini-2025-01-31`, `o1-2024-12-17`, `o1-mini-2024-09-12`, `o1-preview`, `gpt-4o-2024-11-20`, `gpt-4o-2024-08-06`, `gpt-4o-mini-2024-07-18`, `gpt-4-turbo-2024-04-09`, `gpt-4-0613`, `gpt-3.5-turbo-0125` | 无 | — |
| `/v1/chat/completions` | Chat Completions | 所有列出的区域 | 美国、欧洲（EEA + 瑞士）、阿拉伯联合酋长国 | `gpt-5.5-2026-04-23`, `gpt-5.4-2026-03-05`, `gpt-5.4-mini-2026-03-17`, `gpt-5.4-nano-2026-03-17`, `gpt-5.2-2025-12-11`, `gpt-5.1-2025-11-13`, `gpt-5-2025-08-07`, `gpt-5-mini-2025-08-07`, `gpt-5-nano-2025-08-07`, `gpt-5-chat-latest-2025-08-07`, `gpt-4.1-2025-04-14`, `gpt-4.1-mini-2025-04-14`, `gpt-4.1-nano-2025-04-14`, `o3-mini-2025-01-31`, `o3-2025-04-16`, `o4-mini-2025-04-16`, `o1-2024-12-17`, `o1-mini-2024-09-12`, `o1-preview`, `gpt-4o-2024-11-20`, `gpt-4o-2024-08-06`, `gpt-4o-mini-2024-07-18`, `gpt-4-turbo-2024-04-09`, `gpt-4-0613`, `gpt-3.5-turbo-0125` | 阿拉伯联合酋长国：`gpt-5.2-2025-12-11`, `gpt-4.1-2025-04-14` | — |
| `/v1/embeddings` | Embeddings | 所有列出的区域 | 美国、欧洲（EEA + 瑞士）、阿拉伯联合酋长国 | `text-embedding-3-small`, `text-embedding-3-large`, `text-embedding-ada-002` | 阿拉伯联合酋长国：`text-embedding-3-small`, `text-embedding-3-large` | — |
| `/v1/evals` | Evals | 美国、欧洲（EEA + 瑞士） | 美国、欧洲（EEA + 瑞士） | 服务级支持 | 无 | — |
| `/v1/files` | Files | 所有列出的区域 | 无 | 服务级支持 | 无 | — |
| `/v1/fine_tuning/jobs` | Fine-tuning | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | `gpt-4o-2024-08-06`, `gpt-4o-mini-2024-07-18`, `gpt-4.1-2025-04-14`, `gpt-4.1-mini-2025-04-14` | 无 | — |
| `/v1/images/edits` | Images | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | `gpt-image-1`, `gpt-image-1.5`, `gpt-image-1-mini` | 无 | — |
| `/v1/images/generations` | Images | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | `dall-e-3`, `gpt-image-1`, `gpt-image-1.5`, `gpt-image-1-mini` | 无 | — |
| `/v1/moderations` | Moderation | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | `omni-moderation-latest` | 无 | — |
| `/v1/realtime` | Realtime | 美国、欧洲（EEA + 瑞士） | 美国、欧洲（EEA + 瑞士） | `gpt-4o-realtime-preview-2025-06-03`, `gpt-realtime`, `gpt-realtime-1.5`, `gpt-realtime-mini`, `gpt-realtime-2` | 无 | — |
| `/v1/realtime/transcription_sessions` | Realtime | 美国、欧洲（EEA + 瑞士） | 美国、欧洲（EEA + 瑞士） | `gpt-realtime-whisper` | 无 | — |
| `/v1/realtime/translations` | Realtime | 美国、欧洲（EEA + 瑞士） | 美国、欧洲（EEA + 瑞士） | `gpt-realtime-translate` | 无 | — |
| `/v1/realtime (legacy previews)` | Realtime | 美国 | 美国 | `gpt-4o-realtime-preview-2024-12-17`, `gpt-4o-realtime-preview-2024-10-01`, `gpt-4o-mini-realtime-preview-2024-12-17` | 无 | — |
| `/v1/responses` | Responses | 所有列出的区域 | 美国、欧洲（EEA + 瑞士）、阿拉伯联合酋长国 | `gpt-5.5-pro-2026-04-23`, `gpt-5.4-pro-2026-03-05`, `gpt-5.2-pro-2025-12-11`, `gpt-5-pro-2025-10-06`, `gpt-5.5-2026-04-23`, `gpt-5.4-2026-03-05`, `gpt-5-2025-08-07`, `gpt-5.4-mini-2026-03-17`, `gpt-5.4-nano-2026-03-17`, `gpt-5.2-2025-12-11`, `gpt-5.1-2025-11-13`, `gpt-5-mini-2025-08-07`, `gpt-5-nano-2025-08-07`, `gpt-5-chat-latest-2025-08-07`, `gpt-4.1-2025-04-14`, `gpt-4.1-mini-2025-04-14`, `gpt-4.1-nano-2025-04-14`, `o3-2025-04-16`, `o4-mini-2025-04-16`, `o1-pro`, `o1-pro-2025-03-19`, `computer-use-preview`, `o3-mini-2025-01-31`, `o1-2024-12-17`, `o1-mini-2024-09-12`, `o1-preview`, `gpt-4o-2024-11-20`, `gpt-4o-2024-08-06`, `gpt-4o-mini-2024-07-18`, `gpt-4-turbo-2024-04-09`, `gpt-4-0613`, `gpt-3.5-turbo-0125` | 阿拉伯联合酋长国：`gpt-5.2-2025-12-11`, `gpt-4.1-2025-04-14` | computer-use-preview 仅在美国和欧洲受支持。 |
| `/v1/responses File Search` | Responses | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | 服务级支持 | 无 | — |
| `/v1/responses Web Search` | Responses | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | 服务级支持 | 无 | — |
| `/v1/vector_stores` | Vector stores | 所有列出的区域 | 无 | 服务级支持 | 无 | — |
| `Code Interpreter tool` | Tools | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | 服务级支持 | 无 | — |
| `File Search` | Tools | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | 服务级支持 | 无 | — |
| `File Uploads` | Files | 所有列出的区域 | 无 | 服务级支持 | 无 | 使用 base64 file uploads 时受支持。 |
| `Remote MCP server tool` | Tools | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | 服务级支持 | 无 | MCP servers 是第三方服务。发送到 MCP server 的数据受其数据驻留政策约束。 |
| `Scale Tier` | Other | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | 服务级支持 | 无 | — |
| `Structured Outputs (excluding schema)` | Other | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | 服务级支持 | 无 | — |
| `Supported input modalities` | Other | 所有列出的区域 | 美国、欧洲（EEA + 瑞士） | `Text`, `Image`, `Audio/Voice` | 无 | — |



### Endpoint limitations

#### /v1/chat/completions

- 不能在非美国区域设置 store=true。
- 在不支持 Regional processing 的区域中，[Extended prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching#prompt-cache-retention) 可能要求 OpenAI 在 Region 之外处理并临时存储 Customer Content，以交付服务。

#### /v1/responses

- computer-use-preview snapshots 仅支持美国/欧盟。
- 不能在 EU region 中设置 background=True。
- 在不支持 Regional processing 的区域中，[Extended prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching#prompt-cache-retention) 可能要求 OpenAI 在 Region 之外处理并临时存储 Customer Content，以交付服务。

#### /v1/realtime

Tracing 当前不符合 `/v1/realtime` 的 EU data residency 合规要求。

## Enterprise Key Management (EKM)

Enterprise Key Management (EKM) 允许你在 OpenAI 使用由你自己的外部 Key Management System (KMS) 管理的密钥来加密客户内容。

配置后，EKM 会应用于你使用平台期间创建的任何[应用状态](#openai-api-存储的数据类型)。有关 EKM 如何工作以及如何与你的 KMS provider 集成的更多信息，请参阅 [EKM help center article](https://help.openai.com/en/articles/20000943-openai-enterprise-key-management-ekm-overview)。

### EKM 限制

OpenAI 支持使用 AWS KMS、Google Cloud (GCP) 和 Azure Key Vault 中外部账户的 Bring Your Own Key (BYOK) 加密。如果你的组织使用不同的 key management service，则这些密钥需要同步到受支持的 Cloud KMS 之一，才能与 OpenAI 一起使用。

EKM 不支持以下产品。在启用了 EKM 的项目中尝试使用这些 endpoints 会返回错误。

- Assistants (/v1/assistants)
- Vision fine tuning
