---
title: "弃用"
description: "Find information about OpenAI API deprecations and recommended replacements."
outline: deep
---

# 弃用

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/deprecations](https://developers.openai.com/api/docs/deprecations)
- Markdown 来源：[https://developers.openai.com/api/docs/deprecations.md](https://developers.openai.com/api/docs/deprecations.md)
- 抓取时间：2026-06-27T05:53:57.376Z
- Checksum：`151b04166eb2d9e897f722b17a7d024964a7753b80bdcd004818a74f803734d7`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
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

要迁移，请将 reusable prompt 内容移入你的应用代码。请参见[从 prompt 对象迁移](/mirror/api/docs/guides/prompting/migrate-from-prompt-object)。

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

请参见[从 Agent Builder 迁移](/mirror/api/docs/guides/agent-builder/migrate-from-agent-builder)，以继续使用 Agents SDK 或 ChatGPT Workspace Agents。

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

Realtime beta API 中的接口与已发布的 GA API 之间有一些关键差异。请参见[迁移指南](/mirror/api/docs/guides/realtime#beta-to-ga-migration)，了解当前 GA 接口以及相关 Realtime 文档。

| 关闭日期 | 模型 / 系统              | 推荐替代项   |
| -------- | ------------------------ | ------------ |
| 2026‑05‑12    | OpenAI-Beta: realtime=v1 | Realtime API            |

### 2025-08-20：Assistants API

2025 年 8 月 26 日，我们通知了正在使用 Assistants API 的开发者：该 API 将被弃用，并于一年后的 2026 年 8 月 26 日从 API 中移除。

当我们在 [2025 年 3 月](https://developers.openai.com/api/docs/changelog)发布 [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) 时，我们宣布计划将 Assistants API 的所有功能带到更易用的 Responses API，并将 sunset date 设在 2026 年。

请参见 Assistants to Conversations [迁移指南](/mirror/api/docs/assistants/migration)，了解如何将当前集成迁移到 Responses API 和 Conversations API。

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

请参见 Assistants API v2 beta [迁移指南](/mirror/api/docs/assistants/migration)，了解如何将你的工具使用迁移到 Assistants API 的最新版本。

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

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

As we launch safer and more capable models, we regularly retire older models. Software relying on OpenAI models may need occasional updates to keep working. Impacted customers will always be notified by email and in our documentation along with [blog posts](https://openai.com/blog) for larger changes.

This page lists all API deprecations, along with recommended replacements.

## Model deprecation notice periods

We provide advance notice before retiring models so customers have time to plan and migrate. When we announce a model deprecation, we notify customers who are actively using the model by email and document the deprecation on this page.

Unless safety or compliance concerns require a faster timeline, we provide the following minimum notice periods before model retirement:

- **Generally available models:** At least 6 months.
- **Specialized variants of generally available models:** At least 3 months. Examples include chat variants such as `gpt-5.1-chat-latest`, Codex variants such as `gpt-5.3-codex`, and deep research variants such as `o3-deep-research`.
- **Preview models:** Preview models, identified by `preview` in the model name, may be retired with much shorter notice, such as 2 weeks. Examples include `computer-use-preview` and `gpt-4o-audio-preview`. We don't recommend using preview models for business-critical production workloads unless you can migrate on short notice.

If safety or compliance concerns require us to retire a model sooner, we will provide as much notice as reasonably possible.

These notice periods give customers time to evaluate recommended replacement models, test application behavior, and complete migrations before a model is no longer available. In some cases, developers may be able to provision dedicated capacity for continued access after a model's shutdown date. To explore this option, [contact our sales team](https://openai.com/contact-sales/).

## Deprecation vs. legacy

We use the term "deprecation" to refer to the process of retiring a model or endpoint. When we announce that a model or endpoint is being deprecated, it immediately becomes deprecated. All deprecated models and endpoints will also have a shut down date. At the time of the shut down, the model or endpoint will no longer be accessible.

We use the terms "sunset" and "shut down" interchangeably to mean a model or endpoint is no longer accessible.

We use the term "legacy" to refer to models and endpoints that no longer receive updates. We tag endpoints and models as legacy to signal to developers where we're moving as a platform and that they should likely migrate to newer models or endpoints. You can expect that a legacy model or endpoint will be deprecated at some point in the future.

## Upcoming deprecations

Upcoming deprecations are listed below, with the most recent announcements at the top.

### 2026-06-11: GPT-5 and o3 model deprecations

On June 11, 2026, we notified developers using older GPT-5 and o3 model snapshots of their deprecation and removal from the API on December 11, 2026.

| Shutdown date | Model / system          | Recommended replacement |
| ------------- | ----------------------- | ----------------------- |
| Dec 11, 2026  | `gpt-5-2025-08-07`      | `gpt-5.5`               |
| Dec 11, 2026  | `gpt-5-mini-2025-08-07` | `gpt-5.4-mini`          |
| Dec 11, 2026  | `gpt-5-nano-2025-08-07` | `gpt-5.4-nano`          |
| Dec 11, 2026  | `gpt-5-pro-2025-10-06`  | `gpt-5.5-pro`           |
| Dec 11, 2026  | `o3-2025-04-16`         | `gpt-5.5`               |
| Dec 11, 2026  | `o3-pro-2025-06-10`     | `gpt-5.5-pro`           |

### 2026-06-03: Reusable prompts

On June 3, 2026, we notified developers using reusable prompts in the dashboard and API that reusable prompt objects are being deprecated.

| Date         | Update                                                                       |
| ------------ | ---------------------------------------------------------------------------- |
| June 3, 2026 | Deprecation announced and prompt creation de-emphasized in the platform.     |
| Nov 30, 2026 | The `v1/prompts` API and reusable prompt objects are scheduled to shut down. |

To migrate, move reusable prompt content into your application code. See [Migrate from prompt objects](/mirror/api/docs/guides/prompting/migrate-from-prompt-object).

### 2026-06-03: Evals platform

On June 3, 2026, we notified developers using the Evals platform that the product is being deprecated.

| Date         | Update                                                  |
| ------------ | ------------------------------------------------------- |
| June 3, 2026 | Deprecation announced for the Evals platform.           |
| Oct 31, 2026 | Existing evals become read-only.                        |
| Nov 30, 2026 | The Evals dashboard and API are scheduled to shut down. |

Graders documented for eval workflows are part of this transition. Fine-tuning-related timelines remain covered in the self-serve fine-tuning section below.

See [Moving from OpenAI Evals to Promptfoo](https://developers.openai.com/cookbook/examples/evaluation/moving-from-openai-evals-to-promptfoo) for a migration path.

### 2026-06-03: Agent Builder

On June 3, 2026, we notified developers using Agent Builder that the product is being deprecated. ChatKit remains available.

| Date         | Update                                   |
| ------------ | ---------------------------------------- |
| June 3, 2026 | Deprecation announced for Agent Builder. |
| Nov 30, 2026 | Agent Builder is scheduled to shut down. |

See [Migrate from Agent Builder](/mirror/api/docs/guides/agent-builder/migrate-from-agent-builder) to continue with the Agents SDK or ChatGPT Workspace Agents.

### 2026-06-02: GPT Image model deprecations

On June 2, 2026, we notified developers using older GPT Image models of their deprecation and removal from the API on December 1, 2026.

| Shutdown date | Model / system         | Recommended replacement |
| ------------- | ---------------------- | ----------------------- |
| Dec 1, 2026   | `gpt-image-1-mini`     | `gpt-image-2`           |
| Dec 1, 2026   | `gpt-image-1.5`        | `gpt-image-2`           |
| Dec 1, 2026   | `chatgpt-image-latest` | `gpt-image-2`           |

### 2026-05-08: gpt-5.2-chat-latest and gpt-5.3-chat-latest model snapshots

On May 8th, 2026, we notified developers using `gpt-5.2-chat-latest` and `gpt-5.3-chat-latest` model snapshots of their deprecation and removal from the API.

| Shutdown date | Model / system        | Recommended replacement |
| ------------- | --------------------- | ----------------------- |
| Aug 10, 2026  | `gpt-5.2-chat-latest` | `gpt-5.5`               |
| Aug 10, 2026  | `gpt-5.3-chat-latest` | `gpt-5.5`               |

### Update to OpenAI’s self-serve fine-tuning

On May 7th, 2026, we notified developers using OpenAI’s self-serve fine-tuning platform of updates to availability.

Inference on fine-tuned models will continue to be available until the base models are deprecated.

| Date         | Update                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| May 7, 2026  | Creating fine-tuning jobs or training is not available to organizations that have not previously run fine-tuning.                                                                                |
| July 2, 2026 | Creating fine-tuning jobs is no longer available to organizations that have not run inference on a fine-tuned model in the past 60 days.                                                         |
| Jan 6, 2027  | Active existing customers will no longer be able to create new fine-tuning jobs on this date. Inference on fine-tuned models will be disabled only when the underlying base model is deprecated. |

### 2026-04-22: Legacy GPT model snapshots

To improve reliability and make it easier for developers to choose the right models, we are deprecating a set of older OpenAI models. Access to these models will be shut down on the dates below.

| Shutdown date | Model snapshot                                                         | Substitute model             |
| ------------- | ---------------------------------------------------------------------- | ---------------------------- |
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

We are also removing fine-tuned versions as below:

| Shutdown date | Model snapshot               | Recommended replacement base model |
| ------------- | ---------------------------- | ---------------------------------- |
| 2026-10-23    | `ft-gpt-3.5-turbo`           | `gpt-5.4-mini`                     |
| 2026-10-23    | `ft-gpt-4`                   | `gpt-5.5`                          |
| 2026-10-23    | `ft-gpt-4.1-nano-2025-04-14` | `gpt-5.4-nano`                     |
| 2026-10-23    | `ft-babbage-002`             | `gpt-5.4-mini`                     |
| 2026-10-23    | `ft-davinci-002`             | `gpt-5.4-mini`                     |

### 2026-03-24: Sora 2 video generation models and Videos API

On March 24th, 2026, we notified developers using the Videos API and Sora 2 video generation model aliases and snapshots of their deprecation and removal from the API on September 24, 2026.

| Shutdown date | Model / system          | Recommended replacement |
| ------------- | ----------------------- | ----------------------- |
| 2026-09-24    | Videos API              | ---                     |
| 2026-09-24    | `sora-2`                | ---                     |
| 2026-09-24    | `sora-2-pro`            | ---                     |
| 2026-09-24    | `sora-2-2025-10-06`     | ---                     |
| 2026-09-24    | `sora-2-2025-12-08`     | ---                     |
| 2026-09-24    | `sora-2-pro-2025-10-06` | ---                     |

### 2025-11-14: DALL·E model snapshots

On November 14th, 2025, we notified developers using DALL·E model snapshots of their deprecation and removal from the API on May 12, 2026.

| Shutdown date | Model / system | Recommended replacement                             |
| ------------- | -------------- | --------------------------------------------------- |
| 2026-05-12    | `dall-e-2`     | `gpt-image-2`, `gpt-image-1`, or `gpt-image-1-mini` |
| 2026-05-12    | `dall-e-3`     | `gpt-image-2`, `gpt-image-1`, or `gpt-image-1-mini` |

### 2025-09-26: Legacy GPT model snapshots

To improve reliability and make it easier for developers to choose the right models, we are deprecating a set of older OpenAI models with declining usage over the next six to twelve months. Access to these models will be shut down on the dates below.

| Shutdown date | Model / system                                                                                                             | Recommended replacement        |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 2026‑03‑26    | `gpt-4-0314`                                                                                                               | `gpt-5` or `gpt-4.1*`          |
| 2026‑03‑26    | `gpt-4-1106-preview`                                                                                                       | `gpt-5` or `gpt-4.1*`          |
| 2026‑03‑26    | `gpt-4-0125-preview` (including `gpt-4-turbo-preview` and `gpt-4-turbo-preview-completions`, which point to this snapshot) | `gpt-5` or `gpt-4.1*`          |
| 2026-09-28    | `gpt-3.5-turbo-instruct`                                                                                                   | `gpt-5.4-mini` or `gpt-5-mini` |
| 2026-09-28    | `babbage-002`                                                                                                              | `gpt-5.4-mini` or `gpt-5-mini` |
| 2026-09-28    | `davinci-002`                                                                                                              | `gpt-5.4-mini` or `gpt-5-mini` |
| 2026-09-28    | `gpt-3.5-turbo-1106`                                                                                                       | `gpt-5.4-mini` or `gpt-5-mini` |

\*For tasks that are especially latency sensitive and don't require reasoning

### 2025-09-15: Realtime API Beta

The Realtime API Beta was deprecated and removed from the API on May 12, 2026.

There are a few key differences between the interfaces in the Realtime beta API and the released GA API. See [the migration guide](/mirror/api/docs/guides/realtime#beta-to-ga-migration) for the current GA interface and related Realtime docs.

| Shutdown date | Model / system           | Recommended replacement |
| ------------- | ------------------------ | ----------------------- |
| 2026‑05‑12    | OpenAI-Beta: realtime=v1 | Realtime API            |

### 2025-08-20: Assistants API

On August 26th, 2025, we notified developers using the Assistants API of its deprecation and removal from the API one year later, on August 26, 2026.

When we released the [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) in [March 2025](https://developers.openai.com/api/docs/changelog), we announced plans to bring all Assistants API features to the easier to use Responses API, with a sunset date in 2026.

See the Assistants to Conversations [migration guide](/mirror/api/docs/assistants/migration) to learn more about how to migrate your current integration to the Responses API and Conversations API.

| Shutdown date | Model / system | Recommended replacement             |
| ------------- | -------------- | ----------------------------------- |
| 2026‑08‑26    | Assistants API | Responses API and Conversations API |

### 2025-09-15: gpt-4o-realtime-preview models

In September, 2025, we notified developers using gpt-4o-realtime-preview models of their deprecation and removal from the API in six months.

| Shutdown date | Model / system                     | Recommended replacement |
| ------------- | ---------------------------------- | ----------------------- |
| 2026-05-07    | gpt-4o-realtime-preview            | gpt-realtime-1.5        |
| 2026-05-07    | gpt-4o-realtime-preview-2025-06-03 | gpt-realtime-1.5        |
| 2026-05-07    | gpt-4o-realtime-preview-2024-12-17 | gpt-realtime-1.5        |
| 2026-05-07    | gpt-4o-mini-realtime-preview       | gpt-realtime-mini       |
| 2026-05-07    | gpt-4o-audio-preview               | gpt-audio-1.5           |
| 2026-05-07    | gpt-4o-mini-audio-preview          | gpt-audio-mini          |

## Past deprecations

Past deprecations are listed below, with the most recent announcements at the top.

### 2025-11-18: chatgpt-4o-latest snapshot

On November 18th, 2025, we notified developers using `chatgpt-4o-latest` model snapshot of its deprecation and removal from the API on February 17, 2026.

| Shutdown date | Model / system      | Recommended replacement |
| ------------- | ------------------- | ----------------------- |
| 2026-02-17    | `chatgpt-4o-latest` | `gpt-5.1-chat-latest`   |

### 2025-11-17: codex-mini-latest model snapshot

On November 17th, 2025, we notified developers using `codex-mini-latest` model of its deprecation and removal from the API on February 12, 2026. As part of this deprecation, we will no longer support our legacy local shell tool, which is only available for use with `codex-mini-latest`. For new use cases, please use our latest shell tool.

| Shutdown date | Model / system      | Recommended replacement |
| ------------- | ------------------- | ----------------------- |
| 2026-02-12    | `codex-mini-latest` | `gpt-5-codex-mini`      |

### 2025-06-10: gpt-4o-realtime-preview-2024-10-01

On June 10th, 2025, we notified developers using gpt-4o-realtime-preview-2024-10-01 of its deprecation and removal from the API in three months.

| Shutdown date | Model / system                     | Recommended replacement |
| ------------- | ---------------------------------- | ----------------------- |
| 2025-10-10    | gpt-4o-realtime-preview-2024-10-01 | gpt-realtime-1.5        |

### 2025-06-10: gpt-4o-audio-preview-2024-10-01

On June 10th, 2025, we notified developers using `gpt-4o-audio-preview-2024-10-01` of its deprecation and removal from the API in three months.

| Shutdown date | Model / system                    | Recommended replacement |
| ------------- | --------------------------------- | ----------------------- |
| 2025-10-10    | `gpt-4o-audio-preview-2024-10-01` | `gpt-audio-1.5`         |

### 2025-04-28: text-moderation

On April 28th, 2025, we notified developers using `text-moderation` of its deprecation and removal from the API in six months.

| Shutdown date | Model / system           | Recommended replacement |
| ------------- | ------------------------ | ----------------------- |
| 2025-10-27    | `text-moderation-007`    | `omni-moderation`       |
| 2025-10-27    | `text-moderation-stable` | `omni-moderation`       |
| 2025-10-27    | `text-moderation-latest` | `omni-moderation`       |

### 2025-04-28: o1-preview and o1-mini

On April 28th, 2025, we notified developers using `o1-preview` and `o1-mini` of their deprecations and removal from the API in three months and six months respectively.

| Shutdown date | Model / system | Recommended replacement |
| ------------- | -------------- | ----------------------- |
| 2025-07-28    | `o1-preview`   | `o3`                    |
| 2025-10-27    | `o1-mini`      | `o4-mini`               |

### 2025-04-14: GPT-4.5-preview

On April 14th, 2025, we notified developers that the `gpt-4.5-preview` model is deprecated and will be removed from the API in the coming months.

| Shutdown date | Model / system    | Recommended replacement |
| ------------- | ----------------- | ----------------------- |
| 2025-07-14    | `gpt-4.5-preview` | `gpt-4.1`               |

### 2024-10-02: Assistants API beta v1

In [April 2024](https://developers.openai.com/api/docs/assistants/whats-new) when we released the v2 beta version of the Assistants API, we announced that access to the v1 beta would be shut off by the end of 2024. Access to the v1 beta will be discontinued on December 18, 2024.

See the Assistants API v2 beta [migration guide](/mirror/api/docs/assistants/migration) to learn more about how to migrate your tool usage to the latest version of the Assistants API.

| Shutdown date | Model / system             | Recommended replacement    |
| ------------- | -------------------------- | -------------------------- |
| 2024-12-18    | OpenAI-Beta: assistants=v1 | OpenAI-Beta: assistants=v2 |

### 2024-08-29: Fine-tuning training on babbage-002 and davinci-002 models

On August 29th, 2024, we notified developers fine-tuning `babbage-002` and `davinci-002` that new fine-tuning training runs on these models will no longer be supported starting October 28, 2024.

Fine-tuned models created from these base models are not affected by this deprecation, but you will no longer be able to create new fine-tuned versions with these models.

| Shutdown date | Model / system                            | Recommended replacement |
| ------------- | ----------------------------------------- | ----------------------- |
| 2024-10-28    | New fine-tuning training on `babbage-002` | `gpt-4o-mini`           |
| 2024-10-28    | New fine-tuning training on `davinci-002` | `gpt-4o-mini`           |

### 2024-06-06: GPT-4-32K and Vision Preview models

On June 6th, 2024, we notified developers using `gpt-4-32k` and `gpt-4-vision-preview` of their upcoming deprecations in one year and six months respectively. As of June 17, 2024, only existing users of these models will be able to continue using them.

| Shutdown date | Deprecated model            | Deprecated model price                             | Recommended replacement |
| ------------- | --------------------------- | -------------------------------------------------- | ----------------------- |
| 2025-06-06    | `gpt-4-32k`                 | $60.00 / 1M input tokens + $120 / 1M output tokens | `gpt-4o`                |
| 2025-06-06    | `gpt-4-32k-0613`            | $60.00 / 1M input tokens + $120 / 1M output tokens | `gpt-4o`                |
| 2025-06-06    | `gpt-4-32k-0314`            | $60.00 / 1M input tokens + $120 / 1M output tokens | `gpt-4o`                |
| 2024-12-06    | `gpt-4-vision-preview`      | $10.00 / 1M input tokens + $30 / 1M output tokens  | `gpt-4o`                |
| 2024-12-06    | `gpt-4-1106-vision-preview` | $10.00 / 1M input tokens + $30 / 1M output tokens  | `gpt-4o`                |

### 2023-11-06: Chat model updates

On November 6th, 2023, we [announced](https://openai.com/blog/new-models-and-developer-products-announced-at-devday) the release of an updated GPT-3.5-Turbo model (which now comes by default with 16k context) along with deprecation of `gpt-3.5-turbo-0613` and ` gpt-3.5-turbo-16k-0613`. As of June 17, 2024, only existing users of these models will be able to continue using them.

| Shutdown date | Deprecated model         | Deprecated model price                             | Recommended replacement |
| ------------- | ------------------------ | -------------------------------------------------- | ----------------------- |
| 2024-09-13    | `gpt-3.5-turbo-0613`     | $1.50 / 1M input tokens + $2.00 / 1M output tokens | `gpt-3.5-turbo`         |
| 2024-09-13    | `gpt-3.5-turbo-16k-0613` | $3.00 / 1M input tokens + $4.00 / 1M output tokens | `gpt-3.5-turbo`         |

Fine-tuned models created from these base models are not affected by this deprecation, but you will no longer be able to create new fine-tuned versions with these models.

### 2023-08-22: Fine-tunes endpoint

On August 22nd, 2023, we [announced](https://openai.com/blog/gpt-3-5-turbo-fine-tuning-and-api-updates) the new fine-tuning API (`/v1/fine_tuning/jobs`) and that the original `/v1/fine-tunes` API along with legacy models (including those fine-tuned with the `/v1/fine-tunes` API) will be shut down on January 04, 2024. This means that models fine-tuned using the `/v1/fine-tunes` API will no longer be accessible and you would have to fine-tune new models with the updated endpoint and associated base models.

#### Fine-tunes endpoint

| Shutdown date | System           | Recommended replacement |
| ------------- | ---------------- | ----------------------- |
| 2024-01-04    | `/v1/fine-tunes` | `/v1/fine_tuning/jobs`  |

### 2023-07-06: GPT and embeddings

On July 06, 2023, we [announced](https://openai.com/blog/gpt-4-api-general-availability) the upcoming retirements of older GPT-3 and GPT-3.5 models served via the completions endpoint. We also announced the upcoming retirement of our first-generation text embedding models. They will be shut down on January 04, 2024.

#### InstructGPT models

| Shutdown date | Deprecated model   | Deprecated model price | Recommended replacement  |
| ------------- | ------------------ | ---------------------- | ------------------------ |
| 2024-01-04    | `text-ada-001`     | $0.40 / 1M tokens      | `gpt-3.5-turbo-instruct` |
| 2024-01-04    | `text-babbage-001` | $0.50 / 1M tokens      | `gpt-3.5-turbo-instruct` |
| 2024-01-04    | `text-curie-001`   | $2.00 / 1M tokens      | `gpt-3.5-turbo-instruct` |
| 2024-01-04    | `text-davinci-001` | $20.00 / 1M tokens     | `gpt-3.5-turbo-instruct` |
| 2024-01-04    | `text-davinci-002` | $20.00 / 1M tokens     | `gpt-3.5-turbo-instruct` |
| 2024-01-04    | `text-davinci-003` | $20.00 / 1M tokens     | `gpt-3.5-turbo-instruct` |

Pricing for the replacement `gpt-3.5-turbo-instruct` model can be found on the [pricing page](https://openai.com/api/pricing).

#### Base GPT models

| Shutdown date | Deprecated model   | Deprecated model price | Recommended replacement  |
| ------------- | ------------------ | ---------------------- | ------------------------ |
| 2024-01-04    | `ada`              | $0.40 / 1M tokens      | `babbage-002`            |
| 2024-01-04    | `babbage`          | $0.50 / 1M tokens      | `babbage-002`            |
| 2024-01-04    | `curie`            | $2.00 / 1M tokens      | `davinci-002`            |
| 2024-01-04    | `davinci`          | $20.00 / 1M tokens     | `davinci-002`            |
| 2024-01-04    | `code-davinci-002` | ---                    | `gpt-3.5-turbo-instruct` |

Pricing for the replacement `babbage-002` and `davinci-002` models can be found on the [pricing page](https://openai.com/api/pricing).

#### Edit models & endpoint

| Shutdown date | Model / system          | Recommended replacement |
| ------------- | ----------------------- | ----------------------- |
| 2024-01-04    | `text-davinci-edit-001` | `gpt-4o`                |
| 2024-01-04    | `code-davinci-edit-001` | `gpt-4o`                |
| 2024-01-04    | `/v1/edits`             | `/v1/chat/completions`  |

#### Fine-tuning GPT models

| Shutdown date | Deprecated model | Training price     | Usage price         | Recommended replacement                  |
| ------------- | ---------------- | ------------------ | ------------------- | ---------------------------------------- |
| 2024-01-04    | `ada`            | $0.40 / 1M tokens  | $1.60 / 1M tokens   | `babbage-002`                            |
| 2024-01-04    | `babbage`        | $0.60 / 1M tokens  | $2.40 / 1M tokens   | `babbage-002`                            |
| 2024-01-04    | `curie`          | $3.00 / 1M tokens  | $12.00 / 1M tokens  | `davinci-002`                            |
| 2024-01-04    | `davinci`        | $30.00 / 1M tokens | $120.00 / 1K tokens | `davinci-002`, `gpt-3.5-turbo`, `gpt-4o` |

#### First-generation text embedding models

| Shutdown date | Deprecated model                | Deprecated model price | Recommended replacement  |
| ------------- | ------------------------------- | ---------------------- | ------------------------ |
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

### 2023-06-13: Updated chat models

On June 13, 2023, we announced new chat model versions in the [Function calling and other API updates](https://openai.com/blog/function-calling-and-other-api-updates) blog post. The three original versions will be retired in June 2024 at the earliest. As of January 10, 2024, only existing users of these models will be able to continue using them.

| Shutdown date          | Legacy model | Legacy model price                                   | Recommended replacement |
| ---------------------- | ------------ | ---------------------------------------------------- | ----------------------- |
| at earliest 2024-06-13 | `gpt-4-0314` | $30.00 / 1M input tokens + $60.00 / 1M output tokens | `gpt-4o`                |

| Shutdown date | Deprecated model     | Deprecated model price                                | Recommended replacement |
| ------------- | -------------------- | ----------------------------------------------------- | ----------------------- |
| 2024-09-13    | `gpt-3.5-turbo-0301` | $15.00 / 1M input tokens + $20.00 / 1M output tokens  | `gpt-3.5-turbo`         |
| 2025-06-06    | `gpt-4-32k-0314`     | $60.00 / 1M input tokens + $120.00 / 1M output tokens | `gpt-4o`                |

### 2023-03-20: Codex models

| Shutdown date | Deprecated model   | Recommended replacement |
| ------------- | ------------------ | ----------------------- |
| 2023-03-23    | `code-davinci-002` | `gpt-4o`                |
| 2023-03-23    | `code-davinci-001` | `gpt-4o`                |
| 2023-03-23    | `code-cushman-002` | `gpt-4o`                |
| 2023-03-23    | `code-cushman-001` | `gpt-4o`                |

### 2022-06-03: Legacy endpoints

| Shutdown date | System                | Recommended replacement                                                                               |
| ------------- | --------------------- | ----------------------------------------------------------------------------------------------------- |
| 2022-12-03    | `/v1/engines`         | [/v1/models](https://platform.openai.com/docs/api-reference/models/list)                              |
| 2022-12-03    | `/v1/search`          | [View transition guide](https://help.openai.com/en/articles/6272952-search-transition-guide)          |
| 2022-12-03    | `/v1/classifications` | [View transition guide](https://help.openai.com/en/articles/6272941-classifications-transition-guide) |
| 2022-12-03    | `/v1/answers`         | [View transition guide](https://help.openai.com/en/articles/6233728-answers-transition-guide)         |

:::
:::

