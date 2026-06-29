---
title: "提示词"
description: "Learn how to create, optimize, and maintain prompts with OpenAI models."
outline: deep
---

# 提示词

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/prompting](https://developers.openai.com/api/docs/guides/prompting)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/prompting.md](https://developers.openai.com/api/docs/guides/prompting.md)
- 抓取时间：2026-06-27T05:54:05.201Z
- Checksum：`712f5a6791993c702d0c4188de3d19e9ddebd2b886dde1b1ca33400a1fc91ddf`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
**Prompting** 是向模型提供输入的过程。输出质量通常取决于你提示模型的方式是否足够好。

## 概览

Prompting 既是一门艺术，也是一门科学。OpenAI 提供了一些策略和 API 设计决策，帮助你构造强提示词，并从模型获得稳定的优质结果。我们鼓励你进行实验。

## 提示词工具与技术

- **[Prompt caching](/mirror/api/docs/guides/prompt-caching)**：最高可将延迟降低 80%，并将成本降低 75%
- **[Prompt engineering](/mirror/api/docs/guides/prompt-engineering)**：学习用于构造提示词的策略、技术和工具

## 优化你的提示词

- 将整体语气或角色指导放在 system message 中；将任务特定细节和示例保留在 user message 中。
- 将 few-shot 示例合并为简洁的 YAML 风格或项目符号块，让它们易于扫描和更新。
- 使用清晰的文件夹名称映射你的项目结构，让队友可以快速找到提示词。
- 每次发布时运行提示词测试和评估用例；尽早发现问题比在生产中修复问题成本更低。

## 应用中的提示词

将提示词视为应用代码。把提示词内容存储在具名模块中，用带类型的函数参数构建动态部分，并在与其所支持产品行为相同的 pull request 中审查提示词变更。

OpenAI 正在弃用 API 中的可复用 prompt objects。Prompt 创建将从
  2026 年 6 月 3 日开始被弱化，`v1/prompts` 计划于
  2026 年 11 月 30 日关闭。请查看[弃用 页面](/mirror/api/docs/deprecations#2026-06-03-reusable-prompts)了解当前
  时间线。

对于新工作，请不要创建可复用 prompt objects。请改为：

- 将每个生产提示词保存在代码管理、版本化的 helper 中，例如 `prompts/supportReply.ts`。
- 用带类型的函数参数或经过验证的输入对象替换提示词变量。
- 通过 `input` 和 `instructions` 将生成的 messages 直接传给 [Responses API](/mirror/api/docs/guides/text)。
- 用测试、代表性 fixtures 以及随部署流程运行的评估检查覆盖提示词变更。
- 使用 git history、PR review、release tags 和 feature flags 来审查、发布、比较并回滚提示词变更。

如果你已经在 API 请求中使用 prompt IDs 或 prompt versions，请按照[迁移指南](/mirror/api/docs/guides/prompting/migrate-from-prompt-object)将这些提示词迁移到代码中。

## 后续步骤

当你对自己的提示词有信心后，可以查看以下指南和资源。

[



    学习如何提示模型生成文本。

](https://developers.openai.com/api/docs/guides/text)

[



    了解 OpenAI 的 prompt engineering 工具与技术。

](https://developers.openai.com/api/docs/guides/prompt-engineering)

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
**Prompting** is the process of providing input to a model. The quality of your output often depends on how well you're able to prompt the model.

## Overview

Prompting is both an art and a science. OpenAI has some strategies and API design decisions to help you construct strong prompts and get consistently good results from a model. We encourage you to experiment.

## Prompting tools and techniques

- **[Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)**: Reduce latency by up to 80% and cost by up to 75%
- **[Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)**: Learn strategies, techniques, and tools to construct prompts

## Refine your prompt

- Put overall tone or role guidance in the system message; keep task-specific details and examples in user messages.
- Combine few-shot examples into a concise YAML-style or bulleted block so they’re easy to scan and update.
- Mirror your project structure with clear folder names so teammates can locate prompts quickly.
- Run your prompt tests and evaluation cases every time you publish; catching issues early is cheaper than fixing them in production.

## Prompts in your application

Treat prompts as application code. Store prompt content in named modules, build dynamic sections with typed function arguments, and review prompt changes in the same pull requests as the product behavior they support.

OpenAI is deprecating reusable prompt objects in the API. Prompt creation will
  be de-emphasized beginning June 3, 2026, and `v1/prompts` is scheduled to shut
  down on November 30, 2026. See the [deprecations
  page](https://developers.openai.com/api/docs/deprecations#2026-06-03-reusable-prompts) for the current
  timeline.

For new work, don't create reusable prompt objects. Instead:

- Keep each production prompt in a code-managed, versioned helper such as `prompts/supportReply.ts`.
- Replace prompt variables with typed function parameters or validated input objects.
- Pass generated messages directly to the [Responses API](https://developers.openai.com/api/docs/guides/text?api-mode=responses) through `input` and `instructions`.
- Cover prompt changes with tests, representative fixtures, and evaluation checks that run with your deployment process.
- Use git history, PR review, release tags, and feature flags to review, ship, compare, and roll back prompt changes.

If you already use prompt IDs or prompt versions in API requests, follow the [migration guide](https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object) to move those prompts into code.

## Next steps

When you feel confident in your prompts, you might want to check out the following guides and resources.

[

<span slot="icon">
      </span>
    Learn how to prompt a model to generate text.

](https://developers.openai.com/api/docs/guides/text)

[

<span slot="icon">
      </span>
    Learn about OpenAI's prompt engineering tools and techniques.

](https://developers.openai.com/api/docs/guides/prompt-engineering)
``````
:::
:::

