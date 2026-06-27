---
status: needs-review
sourceId: "492bb9140411"
sourceChecksum: "492bb914041140fcdd0609b6f9975ee05d49b336b59fa1c574bc42f3a97ed320"
sourceUrl: "https://developers.openai.com/api/docs/concepts"
translatedAt: "2026-06-27T17:44:39.0189315+08:00"
translator: codex-gpt-5.5-xhigh
---

# 核心概念

在 OpenAI，保护用户数据是我们使命的基础。我们不会使用通过 API 传入的输入和输出训练我们的模型。可在我们的
  <a href="https://openai.com/api-data-privacy">API data privacy page</a>
  了解更多。

## 文本生成模型

OpenAI 的文本生成模型（通常称为 generative pre-trained transformers，简称为 “GPT” 模型），例如 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 和 [`gpt-5.4-mini`](https://developers.openai.com/api/docs/models/gpt-5.4-mini)，已经过训练，能够理解自然语言和形式语言。这些模型可以根据输入生成文本输出。这些模型的输入也称为 “prompts”。设计 prompt 本质上就是你“编程”模型的方式，通常是通过提供说明或一些示例，告诉模型如何成功完成任务。GPT 模型可用于多种任务，包括内容或代码生成、总结、对话、创意写作等。可阅读我们的入门级 [text generation guide](https://developers.openai.com/api/docs/guides/text-generation) 和 [prompt engineering guide](https://developers.openai.com/api/docs/guides/prompt-engineering) 了解更多。

## Embeddings

Embedding 是一段数据（例如某些文本）的向量表示，旨在保留其内容和/或含义的某些方面。以某种方式相似的数据块，其 embeddings 往往会比无关数据更接近。OpenAI 提供文本 embedding 模型，该模型以文本字符串作为输入，并生成 embedding 向量作为输出。Embeddings 可用于搜索、聚类、推荐、异常检测、分类等。可在我们的 [embeddings guide](https://developers.openai.com/api/docs/guides/embeddings) 中阅读更多关于 embeddings 的内容。

## Tokens

文本生成和 embeddings 模型会以称为 tokens 的片段来处理文本。Tokens 表示常见的字符序列。例如，字符串 " tokenization" 会被分解为 " token" 和 "ization"，而像 " the" 这样短且常见的词会表示为单个 token。请注意，在一个句子中，每个词的第一个 token 通常以空格字符开头。可以试用我们的 [tokenizer tool](https://platform.openai.com/tokenizer) 来测试特定字符串，并查看它们如何被转换为 tokens。作为粗略经验法则，对于英文文本，1 个 token 约等于 4 个字符或 0.75 个词。

需要记住的一个限制是：对于文本生成模型，prompt 与生成输出合计不能超过该模型的最大上下文长度。对于 embeddings 模型（它们不输出 tokens），输入必须短于模型的最大上下文长度。每个文本生成和 embeddings 模型的最大上下文长度可在 [model index](https://developers.openai.com/api/docs/models) 中找到。
