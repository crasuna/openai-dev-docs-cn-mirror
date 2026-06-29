---
title: "提示词生成"
description: "Learn how to generate prompts, functions, and schemas in the OpenAI API's Playground."
outline: deep
---

# 提示词生成

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/prompt-generation](https://developers.openai.com/api/docs/guides/prompt-generation)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/prompt-generation.md](https://developers.openai.com/api/docs/guides/prompt-generation.md)
- 抓取时间：2026-06-27T05:54:04.811Z
- Checksum：`56edda1e46f9605a04b16f85847e8da10d0810b9d5c0ea1db24cdef4f709b9cd`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
[Playground](https://platform.openai.com/chat/edit) 中的 **Generate** 按钮可以让你仅凭任务描述生成提示词、[函数](/mirror/api/docs/guides/function-calling)和 [schema](/mirror/api/docs/guides/structured-outputs#supported-schemas)。本指南会逐步说明它的工作方式。

## 概览

从零创建提示词和 schema 可能很耗时，因此生成它们可以帮助你快速起步。Generate 按钮使用两种主要方法：

1. **提示词：** 我们使用融合最佳实践的 **meta-prompt** 来生成或改进提示词。
1. **Schema：** 我们使用能够生成有效 JSON 和函数语法的 **meta-schema**。

虽然我们目前使用 meta prompt 和 schema，但未来可能会整合更高级的技术，例如 [DSPy](https://arxiv.org/abs/2310.03714) 和 ["Gradient Descent"](https://arxiv.org/abs/2305.03495)。

## 提示词

**meta-prompt** 会指示模型基于你的任务描述创建一个好的提示词，或改进已有提示词。Playground 中的 meta-prompt 来自我们的[提示工程](/mirror/api/docs/guides/prompt-engineering)最佳实践以及与用户合作的真实经验。

我们会针对不同输出类型使用特定的 meta-prompt，例如音频，以确保生成的提示词符合预期格式。

### Meta-prompt




Text-out


Audio-out




### 提示词编辑

编辑提示词时，我们会使用一个略作修改的 meta-prompt。直接编辑通常很容易应用，但对于更开放的修订，识别必要改动可能具有挑战。为了解决这一点，我们会在响应开头包含一个 **reasoning section**。这个部分会通过评估现有提示词的清晰度、chain-of-thought 顺序、整体结构、具体性以及其他因素，帮助引导模型判断需要哪些改动。reasoning section 会提出改进建议，然后在最终响应中被解析移除。




Text-out


Audio-out




## Schema

[Structured Outputs](/mirror/api/docs/guides/structured-outputs) schema 和函数 schema 本身就是 JSON 对象，因此我们利用 Structured Outputs 来生成它们。
这需要为期望输出定义一个 schema，而在这个场景中，期望输出本身也是一个 schema。为此，我们使用自描述 schema，也就是 **meta-schema**。

因为函数 schema 中的 `parameters` 字段本身也是一个 schema，所以我们使用同一个 meta-schema 来生成函数。

### 定义受约束的 meta-schema

[Structured Outputs](/mirror/api/docs/guides/structured-outputs) 支持两种模式：`strict=true` 和 `strict=false`。两种模式都使用同一个经过训练、能够遵循所提供 schema 的模型，但只有“strict mode”会通过受约束采样保证完全遵循。

我们的目标是使用 strict mode 本身为 strict mode 生成 schema。然而，[JSON Schema Specification](https://json-schema.org/specification#meta-schemas) 提供的官方 meta-schema 依赖一些 strict mode [目前尚不支持](/mirror/api/docs/guides/structured-outputs#some-type-specific-keywords-are-not-yet-supported)的特性。这会带来同时影响输入和输出 schema 的挑战。

1. **输入 schema：** 我们不能在输入 schema 中使用[不支持的特性](/mirror/api/docs/guides/structured-outputs#some-type-specific-keywords-are-not-yet-supported)来描述输出 schema。
2. **输出 schema：** 生成的 schema 不能包含[不支持的特性](/mirror/api/docs/guides/structured-outputs#some-type-specific-keywords-are-not-yet-supported)。

由于我们需要在输出 schema 中生成新的键，输入 meta-schema 必须使用 `additionalProperties`。这意味着我们目前不能使用 strict mode 来生成 schema。不过，我们仍然希望生成的 schema 符合 strict mode 的约束。

为克服这一限制，我们定义了一个 **pseudo-meta-schema**，也就是使用 strict mode 不支持的特性来描述 strict mode 所支持特性的 meta-schema。实质上，这种方法在定义 meta-schema 时走出 strict mode，同时仍确保生成的 schema 遵循 strict mode 的约束。



构造受约束的 meta-schema 是一项有挑战的工作，因此我们利用模型来提供帮助。

我们先向 JSON mode 中的 `o1-preview` 和 `gpt-4o` 提供了目标描述，并附上 Structured Outputs 文档。
经过几轮迭代后，我们得到了第一个可用的 meta-schema。

随后，我们使用带 Structured Outputs 的 `gpt-4o`，并提供_那个初始 schema_、任务描述和文档，以生成更好的候选。每次迭代中，我们都用更好的 schema 来生成下一个，直到最终由人工仔细审阅。

最后，在清理输出后，我们使用一组针对 schema 和函数的 eval 来验证这些 schema。



### 输出清理

Strict mode 保证完全遵循 schema。不过，由于我们在生成期间不能使用它，因此需要在生成后验证并转换输出。

生成 schema 后，我们会执行以下步骤：

1. 为所有对象**将 `additionalProperties` 设为 `false`**。
1. **将所有属性标记为必需**。
1. **对于 structured output schema**，将其包装在 [`json_schema`](/mirror/api/docs/guides/structured-outputs#how-to-use?context=without_parse) 对象中。
1. **对于函数**，将其包装在 [`function`](/mirror/api/docs/guides/function-calling#step-3-pass-your-function-definitions-as-available-tools-to-the-model-along-with-the-messages) 对象中。

Realtime API 的
  [function](/mirror/api/docs/guides/realtime-conversations#function-calling) 对象
  与 Chat Completions API 略有不同，但使用相同的 schema。

### Meta-schema

每个 meta-schema 都有一个对应的提示词，其中包含 few-shot 示例。结合 Structured Outputs 的可靠性，即使不使用 strict mode，我们也能够生成 schema。




Structured output schema


Function schema


:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
The **Generate** button in the [Playground](https://platform.openai.com/chat/edit) lets you generate prompts, [functions](https://developers.openai.com/api/docs/guides/function-calling), and [schemas](https://developers.openai.com/api/docs/guides/structured-outputs#supported-schemas) from just a description of your task. This guide will walk through exactly how it works.

## Overview

Creating prompts and schemas from scratch can be time-consuming, so generating them can help you get started quickly. The Generate button uses two main approaches:

1. **Prompts:** We use **meta-prompts** that incorporate best practices to generate or improve prompts.
1. **Schemas:** We use **meta-schemas** that produce valid JSON and function syntax.

While we currently use meta prompts and schemas, we may integrate more advanced techniques in the future like [DSPy](https://arxiv.org/abs/2310.03714) and ["Gradient Descent"](https://arxiv.org/abs/2305.03495).

## Prompts

A **meta-prompt** instructs the model to create a good prompt based on your task description or improve an existing one. The meta-prompts in the Playground draw from our [prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) best practices and real-world experience with users.

We use specific meta-prompts for different output types, like audio, to ensure the generated prompts meet the expected format.

### Meta-prompts



<div data-content-switcher-pane data-value="text-out">
    <div class="hidden">Text-out</div>
    </div>
  <div data-content-switcher-pane data-value="audio-out" hidden>
    <div class="hidden">Audio-out</div>
    </div>



### Prompt edits

To edit prompts, we use a slightly modified meta-prompt. While direct edits are straightforward to apply, identifying necessary changes for more open-ended revisions can be challenging. To address this, we include a **reasoning section** at the beginning of the response. This section helps guide the model in determining what changes are needed by evaluating the existing prompt's clarity, chain-of-thought ordering, overall structure, and specificity, among other factors. The reasoning section makes suggestions for improvements and is then parsed out from the final response.



<div data-content-switcher-pane data-value="text-out">
    <div class="hidden">Text-out</div>
    </div>
  <div data-content-switcher-pane data-value="audio-out" hidden>
    <div class="hidden">Audio-out</div>
    </div>



## Schemas

[Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) schemas and function schemas are themselves JSON objects, so we leverage Structured Outputs to generate them.
This requires defining a schema for the desired output, which in this case is itself a schema. To do this, we use a self-describing schema – a **meta-schema**.

Because the `parameters` field in a function schema is itself a schema, we use the same meta-schema to generate functions.

### Defining a constrained meta-schema

[Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) supports two modes: `strict=true` and `strict=false`. Both modes use the same model trained to follow the provided schema, but only "strict mode" guarantees perfect adherence through constrained sampling.

Our goal is to generate schemas for strict mode using strict mode itself. However, the official meta-schemas provided by the [JSON Schema Specification](https://json-schema.org/specification#meta-schemas) rely on features [not currently supported](https://developers.openai.com/api/docs/guides/structured-outputs#some-type-specific-keywords-are-not-yet-supported) in strict mode. This poses challenges that affect both input and output schemas.

1. **Input schema:** We can't use [unsupported features](https://developers.openai.com/api/docs/guides/structured-outputs#some-type-specific-keywords-are-not-yet-supported) in the input schema to describe the output schema.
2. **Output schema:** The generated schema must not include [unsupported features](https://developers.openai.com/api/docs/guides/structured-outputs#some-type-specific-keywords-are-not-yet-supported).

Because we need to generate new keys in the output schema, the input meta-schema must use `additionalProperties`. This means we can't currently use strict mode to generate schemas. However, we still want the generated schema to conform to strict mode constraints.

To overcome this limitation, we define a **pseudo-meta-schema** — a meta-schema that uses features not supported in strict mode to describe only the features that are supported in strict mode. Essentially, this approach steps outside strict mode for the meta-schema definition while still ensuring that the generated schemas adhere to strict mode constraints.



Constructing a constrained meta-schema is a challenging task, so we leveraged our models to help.

We began by giving `o1-preview` and `gpt-4o` in JSON mode a description of our goal using the Structured Outputs documentation.
After a few iterations, we developed our first functional meta-schema.

We then used `gpt-4o` with Structured Outputs and provided _that initial schema_ along with our task description and documentation, to generate better candidates. With each iteration we used a better schema to generate the next, until we finally reviewed it carefully by hand.

Finally, after cleaning the output, we validated the schemas against a set of evals for schemas and functions.



### Output cleaning

Strict mode guarantees perfect schema adherence. Because we can't use it during generation, however, we need to validate and transform the output after generating it.

After generating a schema, we perform the following steps:

1. **Set `additionalProperties` to `false`** for all objects.
1. **Mark all properties as required**.
1. **For structured output schemas**, wrap them in [`json_schema`](https://developers.openai.com/api/docs/guides/structured-outputs#how-to-use?context=without_parse) object.
1. **For functions**, wrap them in a [`function`](https://developers.openai.com/api/docs/guides/function-calling#step-3-pass-your-function-definitions-as-available-tools-to-the-model-along-with-the-messages) object.

The Realtime API
  [function](https://developers.openai.com/api/docs/guides/realtime-conversations#function-calling) object
  differs slightly from the Chat Completions API, but uses the same schema.

### Meta-schemas

Each meta-schema has a corresponding prompt which includes few-shot examples. When combined with the reliability of Structured Outputs — even without strict mode — we were able to generate schemas.



<div data-content-switcher-pane data-value="structured-output">
    <div class="hidden">Structured output schema</div>
    </div>
  <div data-content-switcher-pane data-value="function" hidden>
    <div class="hidden">Function schema</div>
    </div>
``````
:::
:::

