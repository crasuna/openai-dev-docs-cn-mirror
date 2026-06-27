---
status: needs-review
sourceId: "151b04166eb2"
sourceChecksum: "151b04166eb2d9e897f722b17a7d024964a7753b80bdcd004818a74f803734d7"
sourceUrl: "https://developers.openai.com/api/docs/deprecations"
translatedAt: "2026-06-27T09:29:03.914Z"
translator: codex-gpt-5.5-xhigh
---

# 弃用

## 概览

随着我们推出更安全、能力更强的模型，我们会定期停用较旧的模型。依赖 OpenAI 模型的软件可能需要偶尔更新，才能持续正常工作。受影响的客户始终会通过电子邮件和我们的文档收到通知；对于较大的变更，也会通过[博客文章](https://openai.com/blog)通知。

本页面列出所有 API 弃用，以及推荐的替代方案。

## 模型弃用通知周期

我们会在停用模型前提前通知，以便客户有时间规划和迁移。宣布模型弃用时，我们会通过电子邮件通知正在使用该模型的客户，并在本页面记录该弃用。

除非安全或合规问题要求更快的时间线，否则我们会在模型停用前提供以下最短通知周期：

- **正式发布的模型：**至少 6 个月。
- **正式发布模型的专用变体：**至少 3 个月。例如 `gpt-5.1-chat-latest` 等 chat 变体、`gpt-5.3-codex` 等 Codex 变体，以及 `o3-deep-research` 等 deep research 变体。
- **预览模型：**模型名称中带有 `preview` 的预览模型可能会以短得多的通知周期停用，例如 2 周。示例包括 `computer-use-preview` 和 `gpt-4o-audio-preview`。除非你能够在短时间内迁移，否则我们不建议将预览模型用于业务关键型生产工作负载。

如果安全或合规问题要求我们更早停用某个模型，我们会尽可能合理地提前通知。

这些通知周期让客户有时间评估推荐的替代模型、测试应用行为，并在模型不再可用之前完成迁移。在某些情况下，开发者可能可以为模型关闭日期之后的持续访问预配专用容量。要探索此选项，请[联系我们的销售团队](https://openai.com/contact-sales/)。

## Deprecation 与 legacy

我们使用“deprecation”一词来指代停用某个模型或 endpoint 的流程。当我们宣布某个模型或 endpoint 正在被弃用时，它会立即成为 deprecated 状态。所有已弃用的模型和 endpoint 也都会有关闭日期。到达关闭时间时，该模型或 endpoint 将不再可访问。

我们将“sunset”和“shut down”互换使用，表示某个模型或 endpoint 不再可访问。

我们使用“legacy”一词来指代不再接收更新的模型和 endpoint。我们将 endpoint 和模型标记为 legacy，是为了向开发者表明平台的发展方向，并表示他们很可能应迁移到更新的模型或 endpoint。你可以预期，legacy 模型或 endpoint 会在未来某个时间点被弃用。

## 即将到来的弃用

即将到来的弃用如下所列，最新公告位于顶部。

### 2026-06-11：GPT-5 和 o3 模型弃用

2026 年 6 月 11 日，我们通知了正在使用较旧 GPT-5 和 o3 模型快照的开发者：这些模型将被弃用，并于 2026 年 12 月 11 日从 API 中移除。

| 关闭日期 | 模型 / 系统             | 推荐替代项     |
| -------- | ----------------------- | -------------- |
| Dec 11, 2026  | `gpt-5-2025-08-07`      | `gpt-5.5`               |
| Dec 11, 2026  | `gpt-5-mini-2025-08-07` | `gpt-5.4-mini`          |
| Dec 11, 2026  | `gpt-5-nano-2025-08-07` | `gpt-5.4-nano`          |
| Dec 11, 2026  | `gpt-5-pro-2025-10-06`  | `gpt-5.5-pro`           |
| Dec 11, 2026  | `o3-2025-04-16`         | `gpt-5.5`               |
| Dec 11, 2026  | `o3-pro-2025-06-10`     | `gpt-5.5-pro`           |

### 2026-06-03：Reusable prompts

2026 年 6 月 3 日，我们通知了正在 dashboard 和 API 中使用 reusable prompts 的开发者：reusable prompt 对象正在被弃用。

| 日期         | 更新                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| June 3, 2026 | 宣布弃用，并在平台中弱化 prompt 创建入口。                                   |
| Nov 30, 2026 | `v1/prompts` API 和 reusable prompt 对象计划关闭。                           |

要迁移，请将 reusable prompt 内容移入你的应用代码。请参见[从 prompt 对象迁移](https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object)。

### 2026-06-03：Evals platform

2026 年 6 月 3 日，我们通知了正在使用 Evals platform 的开发者：该产品正在被弃用。

| 日期         | 更新                                           |
| ------------ | ---------------------------------------------- |
| June 3, 2026 | 宣布弃用 Evals platform。                      |
| Oct 31, 2026 | 现有 evals 变为只读。                          |
| Nov 30, 2026 | Evals dashboard 和 API 计划关闭。              |

为 eval 工作流记录的 graders 属于此次过渡的一部分。与 fine-tuning 相关的时间线仍由下方的 self-serve fine-tuning 小节覆盖。

请参见[从 OpenAI Evals 迁移到 Promptfoo](https://developers.openai.com/cookbook/examples/evaluation/moving-from-openai-evals-to-promptfoo)，了解一种迁移路径。

### 2026-06-03：Agent Builder

2026 年 6 月 3 日，我们通知了正在使用 Agent Builder 的开发者：该产品正在被弃用。ChatKit 仍然可用。

| 日期         | 更新                                   |
| ------------ | -------------------------------------- |
| June 3, 2026 | 宣布弃用 Agent Builder。               |
| Nov 30, 2026 | Agent Builder 计划关闭。               |

请参见[从 Agent Builder 迁移](https://developers.openai.com/api/docs/guides/agent-builder/migrate-from-agent-builder)，以继续使用 Agents SDK 或 ChatGPT Workspace Agents。

### 2026-06-02：GPT Image 模型弃用

2026 年 6 月 2 日，我们通知了正在使用较旧 GPT Image 模型的开发者：这些模型将被弃用，并于 2026 年 12 月 1 日从 API 中移除。

| 关闭日期 | 模型 / 系统            | 推荐替代项    |
| -------- | ---------------------- | ------------- |
| Dec 1, 2026   | `gpt-image-1-mini`     | `gpt-image-2`           |
| Dec 1, 2026   | `gpt-image-1.5`        | `gpt-image-2`           |
| Dec 1, 2026   | `chatgpt-image-latest` | `gpt-image-2`           |

### 2026-05-08：gpt-5.2-chat-latest 和 gpt-5.3-chat-latest 模型快照

2026 年 5 月 8 日，我们通知了正在使用 `gpt-5.2-chat-latest` 和 `gpt-5.3-chat-latest` 模型快照的开发者：这些模型将被弃用并从 API 中移除。

| 关闭日期 | 模型 / 系统        | 推荐替代项 |
| -------- | --------------------- | ---------- |
| Aug 10, 2026  | `gpt-5.2-chat-latest` | `gpt-5.5`               |
| Aug 10, 2026  | `gpt-5.3-chat-latest` | `gpt-5.5`               |

### OpenAI self-serve fine-tuning 更新

2026 年 5 月 7 日，我们通知了正在使用 OpenAI self-serve fine-tuning 平台的开发者相关可用性更新。

已 fine-tuned 模型上的推理将继续可用，直到基础模型被弃用。

| 日期         | 更新                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| May 7, 2026  | 尚未运行过 fine-tuning 的组织无法创建 fine-tuning jobs 或进行训练。                                                                                |
| July 2, 2026 | 过去 60 天内未在 fine-tuned 模型上运行过推理的组织，将无法再创建 fine-tuning jobs。                                                         |
| Jan 6, 2027  | 现有活跃客户从此日期起将无法再创建新的 fine-tuning jobs。仅当底层基础模型被弃用时，fine-tuned 模型上的推理才会被禁用。 |

### 2026-04-22：Legacy GPT 模型快照

为了提高可靠性，并让开发者更容易选择合适的模型，我们正在弃用一组较旧的 OpenAI 模型。对这些模型的访问将在下列日期关闭。

| 关闭日期 | 模型快照                                                               | 替代模型                     |
| -------- | ---------------------------------------------------------------------- | ---------------------------- |
| 2026-07-23    | `computer-use-preview-2025-03-11` \| `computer-use-preview`            | `gpt-5.4-mini`               |
| 2026-07-23    | `gpt-4o-mini-search-preview-2025-03-11`                                | `gpt-5.4-mini`               |
| 2026-07-23    | `gpt-4o-mini-tts-2025-03-20`                                           | `gpt-4o-mini-tts-2025-12-15` |
| 2026-07-23    | `gpt-4o-search-preview-2025-03-11`                                     | `gpt-5.4-mini`               |
| 2026-07-23    | `gpt-5-chat-latest`                                                    | `gpt-5.5`                    |
| 2026-07-23    | `gpt-5-codex`                                                          | `gpt-5.5`                    |
| 2026-07-23    | `gpt-5.1-chat-latest`                                                  | `gpt-5.5`                    |
| 2026-07-23    | `gpt-5.1-codex`                                                        | `gpt-5.5`                    |
| 2026-07-23    | `gpt-5.1-codex-max`                                                    | `gpt-5.5`                    |
| 2026-07-23    | `gpt-5.1-codex-mini`                                                   | `gpt-5.4-mini`               |
| 2026-07-23    | `gpt-audio-mini-2025-10-06`                                            | `gpt-audio-1.5`              |
| 2026-07-23    | `gpt-realtime-mini-2025-10-06`                                         | `gpt-realtime-mini`          |
| 2026-07-23    | `o3-deep-research-2025-06-26` \| `o3-deep-research`                    | `gpt-5.5-pro`                |
| 2026-07-23    | `o4-mini-deep-research-2025-06-26` \| `o4-mini-deep-research`          | `gpt-5.5-pro`                |
| 2026-07-23    | `gpt-5.2-codex`                                                        | `gpt-5.5`                    |
| 2026-10-23    | `gpt-3.5-turbo-0125` \| `gpt-3.5-turbo`, `gpt-3.5-turbo-completions`   | `gpt-5.4-mini`               |
| 2026-10-23    | `gpt-4-0613` \| `gpt-4`, `gpt-4-0613-completions`, `gpt-4-completions` | `gpt-5.5`                    |
| 2026-10-23    | `gpt-4-1106-preview`                                                   | `gpt-5.5`                    |
| 2026-10-23    | `gpt-4-turbo` \| `gpt-4-turbo-2024-04-09`, `gpt-4-turbo-completions`   | `gpt-5.5`                    |
| 2026-10-23    | `gpt-4.1-nano` \| `gpt-4.1-nano-2025-04-14`                            | `gpt-5.4-nano`               |
| 2026-10-23    | `gpt-4o-2024-05-13`                                                    | `gpt-5.5`                    |
| 2026-10-23    | `gpt-image-1`                                                          | `gpt-image-2`                |
| 2026-10-23    | `o1-2024-12-17` \| `o1`                                                | `gpt-5.5`                    |
| 2026-10-23    | `o1-pro-2025-03-19` \| `o1-pro`                                        | `gpt-5.5-pro`                |
| 2026-10-23    | `o3-mini-2025-01-31` \| `o3-mini`                                      | `gpt-5.5`                    |
| 2026-10-23    | `ft-o4-mini-2025-04-16`                                                | `gpt-5.4-mini`               |
| 2026-10-23    | `o4-mini-2025-04-16` \| `o4-mini`                                      | `gpt-5.4-mini`               |

我们还将移除如下 fine-tuned 版本：

| 关闭日期 | 模型快照                     | 推荐替代基础模型           |
| -------- | ---------------------------- | -------------------------- |
| 2026-10-23    | `ft-gpt-3.5-turbo`           | `gpt-5.4-mini`                     |
| 2026-10-23    | `ft-gpt-4`                   | `gpt-5.5`                          |
| 2026-10-23    | `ft-gpt-4.1-nano-2025-04-14` | `gpt-5.4-nano`                     |
| 2026-10-23    | `ft-babbage-002`             | `gpt-5.4-mini`                     |
| 2026-10-23    | `ft-davinci-002`             | `gpt-5.4-mini`                     |

### 2026-03-24：Sora 2 视频生成模型和 Videos API

2026 年 3 月 24 日，我们通知了正在使用 Videos API 以及 Sora 2 视频生成模型别名和快照的开发者：这些项目将被弃用，并于 2026 年 9 月 24 日从 API 中移除。

| 关闭日期 | 模型 / 系统             | 推荐替代项 |
| -------- | ----------------------- | ---------- |
| 2026-09-24    | Videos API              | ---                     |
| 2026-09-24    | `sora-2`                | ---                     |
| 2026-09-24    | `sora-2-pro`            | ---                     |
| 2026-09-24    | `sora-2-2025-10-06`     | ---                     |
| 2026-09-24    | `sora-2-2025-12-08`     | ---                     |
| 2026-09-24    | `sora-2-pro-2025-10-06` | ---                     |

### 2025-11-14：DALL·E 模型快照

2025 年 11 月 14 日，我们通知了正在使用 DALL·E 模型快照的开发者：这些模型将被弃用，并于 2026 年 5 月 12 日从 API 中移除。

| 关闭日期 | 模型 / 系统 | 推荐替代项                                        |
| -------- | ------------ | ------------------------------------------------- |
| 2026-05-12    | `dall-e-2`     | `gpt-image-2`, `gpt-image-1`, or `gpt-image-1-mini` |
| 2026-05-12    | `dall-e-3`     | `gpt-image-2`, `gpt-image-1`, or `gpt-image-1-mini` |

### 2025-09-26：Legacy GPT 模型快照

为了提高可靠性，并让开发者更容易选择合适的模型，我们将在未来 6 到 12 个月内弃用一组使用量下降的较旧 OpenAI 模型。对这些模型的访问将在下列日期关闭。

| 关闭日期 | 模型 / 系统                                                                                                             | 推荐替代项                     |
| -------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 2026‑03‑26    | `gpt-4-0314`                                                                                                               | `gpt-5` or `gpt-4.1*`          |
| 2026‑03‑26    | `gpt-4-1106-preview`                                                                                                       | `gpt-5` or `gpt-4.1*`          |
| 2026‑03‑26    | `gpt-4-0125-preview` (including `gpt-4-turbo-preview` and `gpt-4-turbo-preview-completions`, which point to this snapshot) | `gpt-5` or `gpt-4.1*`          |
| 2026-09-28    | `gpt-3.5-turbo-instruct`                                                                                                   | `gpt-5.4-mini` or `gpt-5-mini` |
| 2026-09-28    | `babbage-002`                                                                                                              | `gpt-5.4-mini` or `gpt-5-mini` |
| 2026-09-28    | `davinci-002`                                                                                                              | `gpt-5.4-mini` or `gpt-5-mini` |
| 2026-09-28    | `gpt-3.5-turbo-1106`                                                                                                       | `gpt-5.4-mini` or `gpt-5-mini` |

\*适用于对延迟特别敏感且不需要推理的任务

### 2025-09-15：Realtime API Beta

Realtime API Beta 已被弃用，并于 2026 年 5 月 12 日从 API 中移除。

Realtime beta API 中的接口与已发布的 GA API 之间有一些关键差异。请参见[迁移指南](https://developers.openai.com/api/docs/guides/realtime#beta-to-ga-migration)，了解当前 GA 接口以及相关 Realtime 文档。

| 关闭日期 | 模型 / 系统              | 推荐替代项   |
| -------- | ------------------------ | ------------ |
| 2026‑05‑12    | OpenAI-Beta: realtime=v1 | Realtime API            |

### 2025-08-20：Assistants API

2025 年 8 月 26 日，我们通知了正在使用 Assistants API 的开发者：该 API 将被弃用，并于一年后的 2026 年 8 月 26 日从 API 中移除。

当我们在 [2025 年 3 月](https://developers.openai.com/api/docs/changelog)发布 [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) 时，我们宣布计划将 Assistants API 的所有功能带到更易用的 Responses API，并将 sunset date 设在 2026 年。

请参见 Assistants to Conversations [迁移指南](https://developers.openai.com/api/docs/assistants/migration)，了解如何将当前集成迁移到 Responses API 和 Conversations API。

| 关闭日期 | 模型 / 系统 | 推荐替代项                        |
| -------- | ------------ | --------------------------------- |
| 2026‑08‑26    | Assistants API | Responses API and Conversations API |

### 2025-09-15：gpt-4o-realtime-preview 模型

2025 年 9 月，我们通知了正在使用 gpt-4o-realtime-preview 模型的开发者：这些模型将被弃用，并在 6 个月后从 API 中移除。

| 关闭日期 | 模型 / 系统                        | 推荐替代项        |
| -------- | ---------------------------------- | ----------------- |
| 2026-05-07    | gpt-4o-realtime-preview            | gpt-realtime-1.5        |
| 2026-05-07    | gpt-4o-realtime-preview-2025-06-03 | gpt-realtime-1.5        |
| 2026-05-07    | gpt-4o-realtime-preview-2024-12-17 | gpt-realtime-1.5        |
| 2026-05-07    | gpt-4o-mini-realtime-preview       | gpt-realtime-mini       |
| 2026-05-07    | gpt-4o-audio-preview               | gpt-audio-1.5           |
| 2026-05-07    | gpt-4o-mini-audio-preview          | gpt-audio-mini          |

## 过去的弃用

过去的弃用如下所列，最新公告位于顶部。

### 2025-11-18：chatgpt-4o-latest 快照

2025 年 11 月 18 日，我们通知了正在使用 `chatgpt-4o-latest` 模型快照的开发者：该快照将被弃用，并于 2026 年 2 月 17 日从 API 中移除。

| 关闭日期 | 模型 / 系统      | 推荐替代项              |
| -------- | ------------------- | ----------------------- |
| 2026-02-17    | `chatgpt-4o-latest` | `gpt-5.1-chat-latest`   |

### 2025-11-17：codex-mini-latest 模型快照

2025 年 11 月 17 日，我们通知了正在使用 `codex-mini-latest` 模型的开发者：该模型将被弃用，并于 2026 年 2 月 12 日从 API 中移除。作为此次弃用的一部分，我们将不再支持旧版 local shell 工具，该工具仅可与 `codex-mini-latest` 一起使用。对于新的用例，请使用我们最新的 shell 工具。

| 关闭日期 | 模型 / 系统      | 推荐替代项         |
| -------- | ------------------- | ------------------ |
| 2026-02-12    | `codex-mini-latest` | `gpt-5-codex-mini`      |

### 2025-06-10：gpt-4o-realtime-preview-2024-10-01

2025 年 6 月 10 日，我们通知了正在使用 gpt-4o-realtime-preview-2024-10-01 的开发者：该模型将被弃用，并在 3 个月后从 API 中移除。

| 关闭日期 | 模型 / 系统                        | 推荐替代项        |
| -------- | ---------------------------------- | ----------------- |
| 2025-10-10    | gpt-4o-realtime-preview-2024-10-01 | gpt-realtime-1.5        |

### 2025-06-10：gpt-4o-audio-preview-2024-10-01

2025 年 6 月 10 日，我们通知了正在使用 `gpt-4o-audio-preview-2024-10-01` 的开发者：该模型将被弃用，并在 3 个月后从 API 中移除。

| 关闭日期 | 模型 / 系统                       | 推荐替代项        |
| -------- | --------------------------------- | ----------------- |
| 2025-10-10    | `gpt-4o-audio-preview-2024-10-01` | `gpt-audio-1.5`         |

### 2025-04-28：text-moderation

2025 年 4 月 28 日，我们通知了正在使用 `text-moderation` 的开发者：该模型将被弃用，并在 6 个月后从 API 中移除。

| 关闭日期 | 模型 / 系统           | 推荐替代项        |
| -------- | ------------------------ | ----------------- |
| 2025-10-27    | `text-moderation-007`    | `omni-moderation`       |
| 2025-10-27    | `text-moderation-stable` | `omni-moderation`       |
| 2025-10-27    | `text-moderation-latest` | `omni-moderation`       |

### 2025-04-28：o1-preview 和 o1-mini

2025 年 4 月 28 日，我们通知了正在使用 `o1-preview` 和 `o1-mini` 的开发者：它们分别将在 3 个月和 6 个月后被弃用并从 API 中移除。

| 关闭日期 | 模型 / 系统 | 推荐替代项 |
| -------- | ------------ | ---------- |
| 2025-07-28    | `o1-preview`   | `o3`                    |
| 2025-10-27    | `o1-mini`      | `o4-mini`               |

### 2025-04-14：GPT-4.5-preview

2025 年 4 月 14 日，我们通知开发者：`gpt-4.5-preview` 模型已弃用，并将在未来几个月内从 API 中移除。

| 关闭日期 | 模型 / 系统    | 推荐替代项 |
| -------- | ----------------- | ---------- |
| 2025-07-14    | `gpt-4.5-preview` | `gpt-4.1`               |

### 2024-10-02：Assistants API beta v1

在[2024 年 4 月](https://developers.openai.com/api/docs/assistants/whats-new)发布 Assistants API 的 v2 beta 版本时，我们宣布 v1 beta 的访问将在 2024 年底前关闭。v1 beta 的访问将于 2024 年 12 月 18 日停止。

请参见 Assistants API v2 beta [迁移指南](https://developers.openai.com/api/docs/assistants/migration)，了解如何将你的工具使用迁移到 Assistants API 的最新版本。

| 关闭日期 | 模型 / 系统             | 推荐替代项              |
| -------- | -------------------------- | -------------------------- |
| 2024-12-18    | OpenAI-Beta: assistants=v1 | OpenAI-Beta: assistants=v2 |

### 2024-08-29：babbage-002 和 davinci-002 模型上的 fine-tuning 训练

2024 年 8 月 29 日，我们通知了正在 fine-tune `babbage-002` 和 `davinci-002` 的开发者：从 2024 年 10 月 28 日起，这些模型上的新 fine-tuning training runs 将不再受支持。

从这些基础模型创建的 fine-tuned 模型不受此次弃用影响，但你将无法再使用这些模型创建新的 fine-tuned 版本。

| 关闭日期 | 模型 / 系统                               | 推荐替代项  |
| -------- | ----------------------------------------- | ----------- |
| 2024-10-28    | New fine-tuning training on `babbage-002` | `gpt-4o-mini`           |
| 2024-10-28    | New fine-tuning training on `davinci-002` | `gpt-4o-mini`           |

### 2024-06-06：GPT-4-32K 和 Vision Preview 模型

2024 年 6 月 6 日，我们通知了正在使用 `gpt-4-32k` 和 `gpt-4-vision-preview` 的开发者：它们即将分别在一年和 6 个月后弃用。截至 2024 年 6 月 17 日，只有这些模型的现有用户能够继续使用它们。

| 关闭日期 | 已弃用模型                 | 已弃用模型价格                                      | 推荐替代项 |
| -------- | --------------------------- | -------------------------------------------------- | ---------- |
| 2025-06-06    | `gpt-4-32k`                 | $60.00 / 1M input tokens + $120 / 1M output tokens | `gpt-4o`                |
| 2025-06-06    | `gpt-4-32k-0613`            | $60.00 / 1M input tokens + $120 / 1M output tokens | `gpt-4o`                |
| 2025-06-06    | `gpt-4-32k-0314`            | $60.00 / 1M input tokens + $120 / 1M output tokens | `gpt-4o`                |
| 2024-12-06    | `gpt-4-vision-preview`      | $10.00 / 1M input tokens + $30 / 1M output tokens  | `gpt-4o`                |
| 2024-12-06    | `gpt-4-1106-vision-preview` | $10.00 / 1M input tokens + $30 / 1M output tokens  | `gpt-4o`                |

### 2023-11-06：Chat 模型更新

2023 年 11 月 6 日，我们在[发布新模型和开发者产品的 DevDay 公告](https://openai.com/blog/new-models-and-developer-products-announced-at-devday)中宣布发布更新后的 GPT-3.5-Turbo 模型（现在默认带有 16k 上下文），并弃用 `gpt-3.5-turbo-0613` 和 ` gpt-3.5-turbo-16k-0613`。截至 2024 年 6 月 17 日，只有这些模型的现有用户能够继续使用它们。

| 关闭日期 | 已弃用模型         | 已弃用模型价格                                      | 推荐替代项          |
| -------- | ------------------------ | -------------------------------------------------- | ------------------- |
| 2024-09-13    | `gpt-3.5-turbo-0613`     | $1.50 / 1M input tokens + $2.00 / 1M output tokens | `gpt-3.5-turbo`         |
| 2024-09-13    | `gpt-3.5-turbo-16k-0613` | $3.00 / 1M input tokens + $4.00 / 1M output tokens | `gpt-3.5-turbo`         |

从这些基础模型创建的 fine-tuned 模型不受此次弃用影响，但你将无法再使用这些模型创建新的 fine-tuned 版本。

### 2023-08-22：Fine-tunes endpoint

2023 年 8 月 22 日，我们[宣布](https://openai.com/blog/gpt-3-5-turbo-fine-tuning-and-api-updates)推出新的 fine-tuning API（`/v1/fine_tuning/jobs`），并宣布原始 `/v1/fine-tunes` API 以及旧版模型（包括使用 `/v1/fine-tunes` API fine-tuned 的模型）将于 2024 年 1 月 04 日关闭。这意味着使用 `/v1/fine-tunes` API fine-tuned 的模型将不再可访问，你必须使用更新后的 endpoint 和相关基础模型来 fine-tune 新模型。

#### Fine-tunes endpoint

| 关闭日期 | 系统             | 推荐替代项            |
| -------- | ---------------- | --------------------- |
| 2024-01-04    | `/v1/fine-tunes` | `/v1/fine_tuning/jobs`  |

### 2023-07-06：GPT 和 embeddings

2023 年 7 月 06 日，我们[宣布](https://openai.com/blog/gpt-4-api-general-availability)即将停用通过 completions endpoint 提供服务的较旧 GPT-3 和 GPT-3.5 模型。我们还宣布即将停用第一代文本嵌入模型。它们将于 2024 年 1 月 04 日关闭。

#### InstructGPT 模型

| 关闭日期 | 已弃用模型        | 已弃用模型价格    | 推荐替代项               |
| -------- | ------------------ | ----------------- | ------------------------ |
| 2024-01-04    | `text-ada-001`     | $0.40 / 1M tokens      | `gpt-3.5-turbo-instruct` |
| 2024-01-04    | `text-babbage-001` | $0.50 / 1M tokens      | `gpt-3.5-turbo-instruct` |
| 2024-01-04    | `text-curie-001`   | $2.00 / 1M tokens      | `gpt-3.5-turbo-instruct` |
| 2024-01-04    | `text-davinci-001` | $20.00 / 1M tokens     | `gpt-3.5-turbo-instruct` |
| 2024-01-04    | `text-davinci-002` | $20.00 / 1M tokens     | `gpt-3.5-turbo-instruct` |
| 2024-01-04    | `text-davinci-003` | $20.00 / 1M tokens     | `gpt-3.5-turbo-instruct` |

替代模型 `gpt-3.5-turbo-instruct` 的价格可在[价格页面](https://openai.com/api/pricing)找到。

#### Base GPT 模型

| 关闭日期 | 已弃用模型        | 已弃用模型价格    | 推荐替代项               |
| -------- | ------------------ | ----------------- | ------------------------ |
| 2024-01-04    | `ada`              | $0.40 / 1M tokens      | `babbage-002`            |
| 2024-01-04    | `babbage`          | $0.50 / 1M tokens      | `babbage-002`            |
| 2024-01-04    | `curie`            | $2.00 / 1M tokens      | `davinci-002`            |
| 2024-01-04    | `davinci`          | $20.00 / 1M tokens     | `davinci-002`            |
| 2024-01-04    | `code-davinci-002` | ---                    | `gpt-3.5-turbo-instruct` |

替代模型 `babbage-002` 和 `davinci-002` 的价格可在[价格页面](https://openai.com/api/pricing)找到。

#### Edit models 和 endpoint

| 关闭日期 | 模型 / 系统          | 推荐替代项 |
| -------- | ----------------------- | ---------- |
| 2024-01-04    | `text-davinci-edit-001` | `gpt-4o`                |
| 2024-01-04    | `code-davinci-edit-001` | `gpt-4o`                |
| 2024-01-04    | `/v1/edits`             | `/v1/chat/completions`  |

#### Fine-tuning GPT 模型

| 关闭日期 | 已弃用模型 | 训练价格           | 使用价格           | 推荐替代项                         |
| -------- | ---------- | ------------------ | ------------------ | ---------------------------------- |
| 2024-01-04    | `ada`            | $0.40 / 1M tokens  | $1.60 / 1M tokens   | `babbage-002`                            |
| 2024-01-04    | `babbage`        | $0.60 / 1M tokens  | $2.40 / 1M tokens   | `babbage-002`                            |
| 2024-01-04    | `curie`          | $3.00 / 1M tokens  | $12.00 / 1M tokens  | `davinci-002`                            |
| 2024-01-04    | `davinci`        | $30.00 / 1M tokens | $120.00 / 1K tokens | `davinci-002`, `gpt-3.5-turbo`, `gpt-4o` |

#### 第一代文本嵌入模型

| 关闭日期 | 已弃用模型                    | 已弃用模型价格       | 推荐替代项              |
| -------- | ------------------------------- | -------------------- | ------------------------ |
| 2024-01-04    | `text-similarity-ada-001`       | $4.00 / 1M tokens      | `text-embedding-3-small` |
| 2024-01-04    | `text-search-ada-doc-001`       | $4.00 / 1M tokens      | `text-embedding-3-small` |
| 2024-01-04    | `text-search-ada-query-001`     | $4.00 / 1M tokens      | `text-embedding-3-small` |
| 2024-01-04    | `code-search-ada-code-001`      | $4.00 / 1M tokens      | `text-embedding-3-small` |
| 2024-01-04    | `code-search-ada-text-001`      | $4.00 / 1M tokens      | `text-embedding-3-small` |
| 2024-01-04    | `text-similarity-babbage-001`   | $5.00 / 1M tokens      | `text-embedding-3-small` |
| 2024-01-04    | `text-search-babbage-doc-001`   | $5.00 / 1M tokens      | `text-embedding-3-small` |
| 2024-01-04    | `text-search-babbage-query-001` | $5.00 / 1M tokens      | `text-embedding-3-small` |
| 2024-01-04    | `code-search-babbage-code-001`  | $5.00 / 1M tokens      | `text-embedding-3-small` |
| 2024-01-04    | `code-search-babbage-text-001`  | $5.00 / 1M tokens      | `text-embedding-3-small` |
| 2024-01-04    | `text-similarity-curie-001`     | $20.00 / 1M tokens     | `text-embedding-3-small` |
| 2024-01-04    | `text-search-curie-doc-001`     | $20.00 / 1M tokens     | `text-embedding-3-small` |
| 2024-01-04    | `text-search-curie-query-001`   | $20.00 / 1M tokens     | `text-embedding-3-small` |
| 2024-01-04    | `text-similarity-davinci-001`   | $200.00 / 1M tokens    | `text-embedding-3-small` |
| 2024-01-04    | `text-search-davinci-doc-001`   | $200.00 / 1M tokens    | `text-embedding-3-small` |
| 2024-01-04    | `text-search-davinci-query-001` | $200.00 / 1M tokens    | `text-embedding-3-small` |

### 2023-06-13：Updated chat 模型

2023 年 6 月 13 日，我们在 [Function calling and other API updates](https://openai.com/blog/function-calling-and-other-api-updates) 博客文章中宣布新的 chat 模型版本。三个原始版本最早将于 2024 年 6 月停用。截至 2024 年 1 月 10 日，只有这些模型的现有用户能够继续使用它们。

| 关闭日期               | Legacy 模型 | Legacy 模型价格                                      | 推荐替代项 |
| ---------------------- | ------------ | ---------------------------------------------------- | ---------- |
| at earliest 2024-06-13 | `gpt-4-0314` | $30.00 / 1M input tokens + $60.00 / 1M output tokens | `gpt-4o`                |

| 关闭日期 | 已弃用模型        | 已弃用模型价格                                      | 推荐替代项          |
| -------- | -------------------- | ----------------------------------------------------- | ------------------- |
| 2024-09-13    | `gpt-3.5-turbo-0301` | $15.00 / 1M input tokens + $20.00 / 1M output tokens  | `gpt-3.5-turbo`         |
| 2025-06-06    | `gpt-4-32k-0314`     | $60.00 / 1M input tokens + $120.00 / 1M output tokens | `gpt-4o`                |

### 2023-03-20：Codex 模型

| 关闭日期 | 已弃用模型       | 推荐替代项 |
| -------- | ------------------ | ---------- |
| 2023-03-23    | `code-davinci-002` | `gpt-4o`                |
| 2023-03-23    | `code-davinci-001` | `gpt-4o`                |
| 2023-03-23    | `code-cushman-002` | `gpt-4o`                |
| 2023-03-23    | `code-cushman-001` | `gpt-4o`                |

### 2022-06-03：Legacy endpoints

| 关闭日期 | 系统                  | 推荐替代项                                                                                            |
| -------- | --------------------- | ----------------------------------------------------------------------------------------------------- |
| 2022-12-03    | `/v1/engines`         | [/v1/models](https://platform.openai.com/docs/api-reference/models/list)                              |
| 2022-12-03    | `/v1/search`          | [查看迁移指南](https://help.openai.com/en/articles/6272952-search-transition-guide)          |
| 2022-12-03    | `/v1/classifications` | [查看迁移指南](https://help.openai.com/en/articles/6272941-classifications-transition-guide) |
| 2022-12-03    | `/v1/answers`         | [查看迁移指南](https://help.openai.com/en/articles/6233728-answers-transition-guide)         |
