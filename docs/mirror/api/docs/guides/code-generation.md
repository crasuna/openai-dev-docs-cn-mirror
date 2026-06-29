---
title: "代码生成"
description: "Learn how to use OpenAI models and Codex to generate code."
outline: deep
---

# 代码生成

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/code-generation](https://developers.openai.com/api/docs/guides/code-generation)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/code-generation.md](https://developers.openai.com/api/docs/guides/code-generation.md)
- 抓取时间：2026-06-27T05:54:00.102Z
- Checksum：`7712bcb789c4414ceeb18669ba7eafbf55fe604114876261535d93a14a885081`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
编写、审查、编辑代码，以及回答代码相关问题，是当今 OpenAI 模型的主要用例之一。本指南介绍如何使用 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 和 Codex 进行代码生成。

## 开始使用




## 使用 Codex

[**Codex**](/mirror/codex/overview) 是 OpenAI 面向软件开发的编码 agent。它可以帮助你编写、审查和调试代码。你可以通过多种界面与 Codex 交互：在 IDE 中、通过 CLI、在 Web 和移动端站点上，或在 CI/CD pipeline 中通过 SDK 使用。Codex 是在项目中获得 agentic 软件工程能力的最佳方式。

Codex 与 GPT-5 系列最新模型配合效果最好，例如 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5)。我们也提供一系列专门为 Codex 这类编码 agent 设计的模型，例如 [`gpt-5.3-codex`](https://developers.openai.com/api/docs/models/gpt-5.3-codex)，但对于大多数代码生成任务，我们建议使用最新的通用模型。

请参阅 [Codex docs](https://developers.openai.com/codex)，了解设置指南、参考资料、价格和更多信息。

## 与编码模型集成

对于大多数基于 API 的代码生成，请从 &lt;strong&gt;`gpt-5.5`&lt;/strong&gt; 开始。它同时擅长通用任务和编码，因此当你的应用需要在同一处编写代码、推理需求、查阅文档并处理更广泛的工作流时，它是一个很强的默认选择。

下面的示例展示了如何将 [Responses API](https://developers.openai.com/api/docs/api-reference/responses) 用于代码生成场景：

大多数编码任务的默认模型

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const result = await openai.responses.create({
  model: "gpt-5.5",
  input: "Find the null pointer exception: ...your code here...",
  reasoning: { effort: "high" },
});

console.log(result.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

result = client.responses.create(
    model="gpt-5.5",
    input="Find the null pointer exception: ...your code here...",
    reasoning={ "effort": "high" },
)

print(result.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": "Find the null pointer exception: ...your code here...",
    "reasoning": { "effort": "high" }
  }'
```


## 前端开发

GPT-5 系列模型在前端开发方面尤其强，特别是与 Codex 这类编码 agent harness 结合使用时。

下面的演示应用都是 one-shot 生成，也就是从单个 prompt 生成，没有手写代码。你可以用它们评估前端生成质量，以及面向 UI 密集型代码生成工作流的 prompt 模式。

## 下一步

- 访问 [Codex docs](https://developers.openai.com/codex)，了解你可以用 Codex 做什么、在你选择的任意界面中设置 Codex，或查找更多细节。
- 阅读 &lt;a href="/api/docs/guides/latest-model"&gt;使用 GPT-5.5&lt;/a&gt;，了解模型选择、功能和迁移指导。
- 查看 &lt;a href="/api/docs/guides/prompt-guidance"&gt;GPT-5.5 prompt guidance&lt;/a&gt;，了解适用于编码和 agentic 任务的提示模式。
- 在模型页面比较 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 和 [`gpt-5.3-codex`](https://developers.openai.com/api/docs/models/gpt-5.3-codex)。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Writing, reviewing, editing, and answering questions about code is one of the primary use cases for OpenAI models today. This guide walks through your options for code generation with [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) and Codex.

## Get started

<div className="mb-10 w-full max-w-full overflow-hidden">
  </div>

## Use Codex

[**Codex**](https://developers.openai.com/codex/overview) is OpenAI's coding agent for software development. It helps you write, review and debug code. Interact with Codex in a variety of interfaces: in your IDE, through the CLI, on web and mobile sites, or in your CI/CD pipelines with the SDK. Codex is the best way to get agentic software engineering on your projects.

Codex works best with the latest models from the GPT-5 family, such as [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5). We offer a range of models specifically designed to work with coding agents like Codex, such as [`gpt-5.3-codex`](https://developers.openai.com/api/docs/models/gpt-5.3-codex), but we recommend using the latest general-purpose model for most code generation tasks.

See the [Codex docs](https://developers.openai.com/codex) for setup guides, reference material, pricing, and more information.

## Integrate with coding models

For most API-based code generation, start with <strong>`gpt-5.5`</strong>. It handles both general-purpose work and coding, which makes it a strong default when your application needs to write code, reason about requirements, inspect docs, and handle broader workflows in one place.

This example shows how you can use the [Responses API](https://developers.openai.com/api/docs/api-reference/responses) for a code generation use case:

Default model for most coding tasks

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const result = await openai.responses.create({
  model: "gpt-5.5",
  input: "Find the null pointer exception: ...your code here...",
  reasoning: { effort: "high" },
});

console.log(result.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

result = client.responses.create(
    model="gpt-5.5",
    input="Find the null pointer exception: ...your code here...",
    reasoning={ "effort": "high" },
)

print(result.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": "Find the null pointer exception: ...your code here...",
    "reasoning": { "effort": "high" }
  }'
```


## Frontend development

Our models from the GPT-5 family are especially strong at frontend development, especially when combined with a coding agent harness such as Codex.

The demo applications below were one shot generations, i.e. generated from a single prompt without hand-written code. Use them to evaluate frontend generation quality and prompt patterns for UI-heavy code generation workflows.

## Next steps

- Visit the [Codex docs](https://developers.openai.com/codex) to learn what you can do with Codex, set up Codex in whichever interface you choose, or find more details.
- Read <a href="/api/docs/guides/latest-model">Using GPT-5.5</a> for model selection, features, and migration guidance.
- See <a href="/api/docs/guides/prompt-guidance">Prompt guidance for GPT-5.5</a> for prompting patterns that work well on coding and agentic tasks.
- Compare [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) and [`gpt-5.3-codex`](https://developers.openai.com/api/docs/models/gpt-5.3-codex) on the model pages.
``````
:::
:::

