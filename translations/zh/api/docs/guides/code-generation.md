---
status: needs-review
sourceId: 7712bcb789c4
sourceChecksum: 7712bcb789c4414ceeb18669ba7eafbf55fe604114876261535d93a14a885081
sourceUrl: https://developers.openai.com/api/docs/guides/code-generation
translatedAt: 2026-06-27T17:13:53.3182238+08:00
translator: codex-gpt-5.5-xhigh
---

# 代码生成

编写、审查、编辑代码，以及回答代码相关问题，是当今 OpenAI 模型的主要用例之一。本指南介绍如何使用 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 和 Codex 进行代码生成。

## 开始使用

<div className="mb-10 w-full max-w-full overflow-hidden">
  </div>

## 使用 Codex

[**Codex**](https://developers.openai.com/codex/overview) 是 OpenAI 面向软件开发的编码 agent。它可以帮助你编写、审查和调试代码。你可以通过多种界面与 Codex 交互：在 IDE 中、通过 CLI、在 Web 和移动端站点上，或在 CI/CD pipeline 中通过 SDK 使用。Codex 是在项目中获得 agentic 软件工程能力的最佳方式。

Codex 与 GPT-5 系列最新模型配合效果最好，例如 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5)。我们也提供一系列专门为 Codex 这类编码 agent 设计的模型，例如 [`gpt-5.3-codex`](https://developers.openai.com/api/docs/models/gpt-5.3-codex)，但对于大多数代码生成任务，我们建议使用最新的通用模型。

请参阅 [Codex docs](https://developers.openai.com/codex)，了解设置指南、参考资料、价格和更多信息。

## 与编码模型集成

对于大多数基于 API 的代码生成，请从 <strong>`gpt-5.5`</strong> 开始。它同时擅长通用任务和编码，因此当你的应用需要在同一处编写代码、推理需求、查阅文档并处理更广泛的工作流时，它是一个很强的默认选择。

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
- 阅读 <a href="/api/docs/guides/latest-model">使用 GPT-5.5</a>，了解模型选择、功能和迁移指导。
- 查看 <a href="/api/docs/guides/prompt-guidance">GPT-5.5 prompt guidance</a>，了解适用于编码和 agentic 任务的提示模式。
- 在模型页面比较 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 和 [`gpt-5.3-codex`](https://developers.openai.com/api/docs/models/gpt-5.3-codex)。
