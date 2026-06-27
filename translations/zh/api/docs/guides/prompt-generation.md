---
status: needs-review
sourceId: "56edda1e46f9"
sourceChecksum: "56edda1e46f9605a04b16f85847e8da10d0810b9d5c0ea1db24cdef4f709b9cd"
sourceUrl: "https://developers.openai.com/api/docs/guides/prompt-generation"
translatedAt: "2026-06-27T18:23:34.8670908+08:00"
translator: codex-gpt-5.5-xhigh
---

# 提示词生成

[Playground](https://platform.openai.com/chat/edit) 中的 **Generate** 按钮可以让你仅凭任务描述生成提示词、[函数](https://developers.openai.com/api/docs/guides/function-calling)和 [schema](https://developers.openai.com/api/docs/guides/structured-outputs#supported-schemas)。本指南会逐步说明它的工作方式。

## 概览

从零创建提示词和 schema 可能很耗时，因此生成它们可以帮助你快速起步。Generate 按钮使用两种主要方法：

1. **提示词：** 我们使用融合最佳实践的 **meta-prompt** 来生成或改进提示词。
1. **Schema：** 我们使用能够生成有效 JSON 和函数语法的 **meta-schema**。

虽然我们目前使用 meta prompt 和 schema，但未来可能会整合更高级的技术，例如 [DSPy](https://arxiv.org/abs/2310.03714) 和 ["Gradient Descent"](https://arxiv.org/abs/2305.03495)。

## 提示词

**meta-prompt** 会指示模型基于你的任务描述创建一个好的提示词，或改进已有提示词。Playground 中的 meta-prompt 来自我们的[提示工程](https://developers.openai.com/api/docs/guides/prompt-engineering)最佳实践以及与用户合作的真实经验。

我们会针对不同输出类型使用特定的 meta-prompt，例如音频，以确保生成的提示词符合预期格式。

### Meta-prompt



<div data-content-switcher-pane data-value="text-out">
    <div class="hidden">Text-out</div>
    </div>
  <div data-content-switcher-pane data-value="audio-out" hidden>
    <div class="hidden">Audio-out</div>
    </div>



### 提示词编辑

编辑提示词时，我们会使用一个略作修改的 meta-prompt。直接编辑通常很容易应用，但对于更开放的修订，识别必要改动可能具有挑战。为了解决这一点，我们会在响应开头包含一个 **reasoning section**。这个部分会通过评估现有提示词的清晰度、chain-of-thought 顺序、整体结构、具体性以及其他因素，帮助引导模型判断需要哪些改动。reasoning section 会提出改进建议，然后在最终响应中被解析移除。



<div data-content-switcher-pane data-value="text-out">
    <div class="hidden">Text-out</div>
    </div>
  <div data-content-switcher-pane data-value="audio-out" hidden>
    <div class="hidden">Audio-out</div>
    </div>



## Schema

[Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) schema 和函数 schema 本身就是 JSON 对象，因此我们利用 Structured Outputs 来生成它们。
这需要为期望输出定义一个 schema，而在这个场景中，期望输出本身也是一个 schema。为此，我们使用自描述 schema，也就是 **meta-schema**。

因为函数 schema 中的 `parameters` 字段本身也是一个 schema，所以我们使用同一个 meta-schema 来生成函数。

### 定义受约束的 meta-schema

[Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) 支持两种模式：`strict=true` 和 `strict=false`。两种模式都使用同一个经过训练、能够遵循所提供 schema 的模型，但只有“strict mode”会通过受约束采样保证完全遵循。

我们的目标是使用 strict mode 本身为 strict mode 生成 schema。然而，[JSON Schema Specification](https://json-schema.org/specification#meta-schemas) 提供的官方 meta-schema 依赖一些 strict mode [目前尚不支持](https://developers.openai.com/api/docs/guides/structured-outputs#some-type-specific-keywords-are-not-yet-supported)的特性。这会带来同时影响输入和输出 schema 的挑战。

1. **输入 schema：** 我们不能在输入 schema 中使用[不支持的特性](https://developers.openai.com/api/docs/guides/structured-outputs#some-type-specific-keywords-are-not-yet-supported)来描述输出 schema。
2. **输出 schema：** 生成的 schema 不能包含[不支持的特性](https://developers.openai.com/api/docs/guides/structured-outputs#some-type-specific-keywords-are-not-yet-supported)。

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
1. **对于 structured output schema**，将其包装在 [`json_schema`](https://developers.openai.com/api/docs/guides/structured-outputs#how-to-use?context=without_parse) 对象中。
1. **对于函数**，将其包装在 [`function`](https://developers.openai.com/api/docs/guides/function-calling#step-3-pass-your-function-definitions-as-available-tools-to-the-model-along-with-the-messages) 对象中。

Realtime API 的
  [function](https://developers.openai.com/api/docs/guides/realtime-conversations#function-calling) 对象
  与 Chat Completions API 略有不同，但使用相同的 schema。

### Meta-schema

每个 meta-schema 都有一个对应的提示词，其中包含 few-shot 示例。结合 Structured Outputs 的可靠性，即使不使用 strict mode，我们也能够生成 schema。



<div data-content-switcher-pane data-value="structured-output">
    <div class="hidden">Structured output schema</div>
    </div>
  <div data-content-switcher-pane data-value="function" hidden>
    <div class="hidden">Function schema</div>
    </div>

