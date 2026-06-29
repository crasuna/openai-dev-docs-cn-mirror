---
title: "延迟优化"
description: "Improve latency across a wide variety of LLM-related use cases."
outline: deep
---

# 延迟优化

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/latency-optimization](https://developers.openai.com/api/docs/guides/latency-optimization)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/latency-optimization.md](https://developers.openai.com/api/docs/guides/latency-optimization.md)
- 抓取时间：2026-06-27T05:54:03.328Z
- Checksum：`efc131859a7ce7c785b8eb54522aaf9f9a327db397d75eb537a33bd13e273154`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
本指南介绍一组核心原则，你可以将它们应用到各种与 LLM 相关的用例中以改善延迟。这些技巧来自我们与大量客户和开发者一起构建生产应用的经验，因此无论你正在构建什么，从细粒度工作流到端到端聊天机器人，它们都应适用。

虽然存在许多单独技巧，但我们会把它们归入 **七条原则**，用于代表改进延迟方法的高层分类。

最后，我们会通过一个[示例](/mirror/api/docs/guides/latency-optimization#example)来看看它们如何应用。

### 七条原则

1. [更快地处理 tokens。](/mirror/api/docs/guides/latency-optimization#process-tokens-faster)
2. [生成更少 tokens。](/mirror/api/docs/guides/latency-optimization#generate-fewer-tokens)
3. [使用更少 input tokens。](/mirror/api/docs/guides/latency-optimization#use-fewer-input-tokens)
4. [发起更少请求。](/mirror/api/docs/guides/latency-optimization#make-fewer-requests)
5. [并行化。](/mirror/api/docs/guides/latency-optimization#parallelize)
6. [让用户少等。](/mirror/api/docs/guides/latency-optimization#make-your-users-wait-less)
7. [不要默认使用 LLM。](/mirror/api/docs/guides/latency-optimization#don-t-default-to-an-llm)

## 更快地处理 tokens

**推理速度（inference speed）** 可能是处理延迟时首先想到的事情（但你很快会看到，它远不是唯一因素）。它指的是 **LLM 处理 token 的实际速率**，通常用 TPM（每分钟 token 数）或 TPS（每秒 token 数）衡量。

影响推理速度的主要因素是 **模型大小**。较小的模型通常运行得更快（也更便宜），并且在正确使用时甚至可以胜过更大的模型。为了用较小模型保持高质量表现，你可以探索：

- 使用更长、[更详细的 prompt](/mirror/api/docs/guides/prompt-engineering#tactic-specify-the-steps-required-to-complete-a-task)，
- 添加（更多）[few-shot examples](/mirror/api/docs/guides/prompt-engineering#tactic-provide-examples)，或
- [fine-tuning](/mirror/api/docs/guides/model-optimization) / distillation。

你还可以采用推理优化，例如我们的 [**Predicted outputs**](/mirror/api/docs/guides/predicted-outputs) 功能。Predicted outputs 允许你在提前知道大部分输出内容时显著降低生成延迟，例如代码编辑任务。通过给模型提供预测内容，LLM 可以更多地关注实际变化，而更少关注保持不变的内容。



影响推理速度的其他因素包括你可用的
  &lt;strong&gt;计算资源&lt;/strong&gt; 数量，以及你采用的任何额外
  &lt;strong&gt;推理优化&lt;/strong&gt;。&lt;br /&gt; &lt;br /&gt;
  大多数人无法直接影响这些因素，但如果你感兴趣，并且对自己的基础设施有一定控制权，
  &lt;strong&gt;更快的硬件&lt;/strong&gt; 或
  &lt;strong&gt;以更低饱和度运行引擎&lt;/strong&gt; 可能会带来适度的
  TPM 提升。如果你已经深入到细节层面，还有大量其他

    推理优化

  略超出了本指南范围。



## 生成更少 tokens

使用 LLM 时，生成 token 几乎总是延迟最高的一步。作为一般启发式规则，**减少 50% 的输出 token 可能会减少约 50% 的延迟**。减少输出大小的方式取决于输出类型：

如果你生成的是 **自然语言**，只需 **要求模型更简洁**（“under 20 words” 或 “be very brief”）可能就有帮助。你也可以使用 few-shot examples 和/或 fine-tuning 来教模型给出更短的响应。

如果你生成的是 **结构化输出**，请尽可能 **最小化输出语法**：缩短函数名、省略具名参数、合并参数等。

最后，虽然不常见，你也可以使用 `max_tokens` 或 `stop_tokens` 来提前结束生成。

请始终记住：减少一个 output token，就是赢回一段（毫）秒！

## 使用更少 input tokens

尽管减少输入 token 数量确实会降低延迟，但这通常不是显著因素。**减少 50% 的 prompt 可能只会带来 1-5% 的延迟改善**。除非你正在处理真正巨大的上下文（文档、图像），否则可能更应该把精力放在别处。

话虽如此，如果你_确实_在处理超大上下文（或者你决心榨出最后一点性能，并且_已经_耗尽所有其他选项），可以使用以下技巧减少输入 token：

- **Fine-tuning 模型**，以替代冗长 instructions / examples 的需求。
- **过滤上下文输入**，例如修剪 RAG 结果、清理 HTML 等。
- **最大化共享 prompt 前缀**，把动态部分（例如 RAG 结果、历史记录等）放到 prompt 后面。这会让你的请求更适合 [KV cache](https://medium.com/@joaolages/kv-caching-explained-276520203249)（大多数 LLM 提供商都使用它），也意味着每次请求需要处理的输入 token 更少。

请查看我们的文档，了解 [prompt caching](/mirror/api/docs/guides/prompt-engineering#prompt-caching) 如何工作。

## 发起更少请求

每次发起请求时，都会产生一些往返延迟；这些延迟会逐渐累积。

如果你有需要 LLM 顺序执行的步骤，与其每一步发起一次请求，不如考虑 **把它们放在一个 prompt 中，并在一个响应中一次性得到所有结果**。这样可以避免额外的往返延迟，并且可能降低处理多个响应的复杂性。

一种实现方式是把这些步骤整理成组合 prompt 中的编号列表，然后要求模型以 JSON 中的具名字段返回结果。这样你就可以轻松解析并引用每个结果！

## 并行化

在用 LLM 执行多个步骤时，并行化可能非常强大。

如果步骤 **并非_严格_顺序执行**，你可以 **把它们拆成并行调用**。两件衬衫和一件衬衫晾干所需时间一样长。

但如果步骤 **_确实_严格顺序执行**，你仍可能可以 **利用推测执行（speculative execution）**。这对某个结果比其他结果更可能出现的分类步骤尤其有效（例如 moderation）。

1. 同时启动第 1 步和第 2 步（例如输入审核和故事生成）
2. 验证第 1 步的结果
3. 如果结果不是预期结果，取消第 2 步（必要时重试）

如果你对第 1 步的猜测是正确的，那么它本质上就以零额外延迟运行了！

## 让用户少等

**等待** 和 **看着进度发生** 之间有巨大差别，请确保用户体验到后者。以下是一些技巧：

- **流式传输（Streaming）**：最有效的单一方法，因为它把_等待_时间缩短到一秒或更少。（如果你在每条回复完成前都看不到任何内容，ChatGPT 的感觉会很不一样。）
- **分块（Chunking）**：如果输出在展示给用户前需要进一步处理（moderation、translation），请考虑 **分块处理**，而不是一次性处理全部。做法是流式传输到你的后端，然后把处理后的 chunks 发送到前端。
- **展示步骤**：如果你正在执行多个步骤或使用工具，请把这些信息展示给用户。你能展示的真实进度越多越好。
- **加载状态**：Spinners 和进度条很有帮助。

请注意，虽然 **展示步骤和提供加载状态** 主要是心理层面的影响，**流式传输和分块** 在把应用 + 用户系统一起考虑时，确实会降低总体延迟：用户会更早读完响应。

## 不要默认使用 LLM

LLM 极其强大且通用，因此有时会被用于其实 **更快的经典方法** 更合适的场景。识别这些场景可能让你显著降低延迟。请考虑以下示例：

- **硬编码（Hard-coding）**：如果你的 **输出** 高度受限，可能不需要 LLM 来生成。操作确认、拒绝消息和请求标准输入都非常适合硬编码。（你甚至可以使用老办法，为每种情况准备几个变体。）
- **预计算（Pre-computing）**：如果你的 **输入** 受限（例如类别选择），你可以提前生成多个响应，并确保永远不会向同一用户展示同一个响应两次。
- **利用 UI**：汇总指标、报告或搜索结果，有时用经典的、定制的 UI 组件表达会比 LLM 生成文本更好。
- **传统优化技术**：LLM 应用仍然是应用；二分搜索、缓存、哈希表和运行时复杂度在 LLM 世界中_仍然_有用。

## 示例

现在来看一个示例应用，识别潜在的延迟优化，并提出一些解决方案！

我们将分析一个假想客服机器人（bot）的架构和 prompt，该 bot 受真实生产应用启发。[架构和 prompts](/mirror/api/docs/guides/latency-optimization#architecture-and-prompts) 部分会设定场景，[分析与优化](/mirror/api/docs/guides/latency-optimization#analysis-and-optimizations) 部分会逐步展示延迟优化过程。

你会注意到，这个示例并没有覆盖每一条原则，就像真实用例并不需要应用每一项技术一样。

### 架构和 prompts

下面是假想 **客服机器人** 的 **初始架构**。我们将对它进行修改。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-0.png)

从高层看，图中的流程描述了以下过程：

1. 用户在一段进行中的对话中发送消息。
2. 最新消息被转化为 **自包含查询**（见 prompt 中的示例）。
3. 我们判断是否需要 **额外的检索信息** 来回复该查询。
4. 执行 **检索**，生成搜索结果。
5. assistant 对用户查询和搜索结果进行 **推理**，并 **生成响应**。
6. 响应被发送回用户。

下面是 diagram 每个部分使用的 prompts。虽然它们仍然只是简化的假设示例，但它们采用了你会在生产应用中看到的相同结构和措辞。

你看到像 "**[user input here]**" 这样的占位符时，它们表示动态部分，会在运行时被实际数据替换。

查询上下文化 prompt

将用户查询改写为自包含的搜索查询。

```text
SYSTEM: Given the previous conversation, re-write the last user query so it contains
all necessary context.

# Example
History: [{user: "What is your return policy?"},{assistant: "..."}]
User Query: "How long does it cover?"
Response: "How long does the return policy cover?"

# Conversation
[last 3 messages of conversation]

# User Query
[last user query]

USER: [JSON-formatted input conversation here]
```

检索检查 prompt

判断一个查询是否需要执行检索才能回复。

```text
SYSTEM: Given a user query, determine whether it requires doing a realtime lookup to
respond to.

# Examples
User Query: "How can I return this item after 30 days?"
Response: "true"

User Query: "Thank you!"
Response: "false"

USER: [input user query here]
```

Assistant prompt（助手提示词）

给定用户对话和相关检索信息后，填充 JSON 字段，让模型按预定义步骤推理并生成最终响应。

```text
SYSTEM: You are a helpful customer service bot.

Use the result JSON to reason about each user query - use the retrieved context.

# Example

User: "My computer screen is cracked! I want it fixed now!!!"

Assistant Response:
{
  "message_is_conversation_continuation": "True",
  "number_of_messages_in_conversation_so_far": "1",
  "user_sentiment": "Aggravated",
  "query_type": "Hardware Issue",
  "response_tone": "Validating and solution-oriented",
  "response_requirements": "Propose options for repair or replacement.",
  "user_requesting_to_talk_to_human": "False",
  "enough_information_in_context": "True",
  "response": "..."
}

USER: # Relevant Information
` ` `
[retrieved context]
` ` `

USER: [input user query here]
```

### 分析与优化

#### 第 1 部分：查看检索 prompts

查看架构，首先引人注意的是 **连续的 GPT-4 调用**。这暗示着潜在低效，并且通常可以用单次调用或并行调用替代。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-2.png)

在这个案例中，由于检索检查需要上下文化后的查询，让我们 **把它们合并到单个 prompt 中**，以[发起更少请求](/mirror/api/docs/guides/latency-optimization#make-fewer-requests)。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-3.png)

合并查询上下文化和检索检查的 prompt

**发生了什么变化？** 之前，我们有一个 prompt 用来重写查询，另一个 prompt 用来判断是否需要执行检索查找。现在，这个组合 prompt 会同时完成二者。具体来说，请注意 prompt 第一行更新后的指令，以及更新后的输出 JSON：

```jsx
{
  query:"[contextualized query]",
  retrieval:"[true/false - whether retrieval is required]"
}
```

```text
SYSTEM: Given the previous conversation, re-write the last user query so it contains
all necessary context. Then, determine whether the full request requires doing a
realtime lookup to respond to.

Respond in the following form:
{
  query:"[contextualized query]",
  retrieval:"[true/false - whether retrieval is required]"
}

# Examples

History: [{user: "What is your return policy?"},{assistant: "..."}]
User Query: "How long does it cover?"
Response: {query: "How long does the return policy cover?", retrieval: "true"}

History: [{user: "How can I return this item after 30 days?"},{assistant: "..."}]
User Query: "Thank you!"
Response: {query: "Thank you!", retrieval: "false"}

# Conversation
[last 3 messages of conversation]

# User Query
[last user query]

USER: [JSON-formatted input conversation here]
```


实际上，添加上下文和判断是否需要检索都是非常直接且定义明确的任务，因此我们很可能可以改用 **更小、经过 fine-tuned 的模型**。切换到 GPT-3.5 可以让我们[更快地处理 tokens](/mirror/api/docs/guides/latency-optimization#process-tokens-faster)。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-4.png)

#### 第 2 部分：分析 assistant prompt

现在把注意力转向 Assistant prompt。它在填充 JSON 字段时似乎发生了许多不同步骤，这可能表明存在[并行化](/mirror/api/docs/guides/latency-optimization#parallelize)机会。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-5.png)

不过，我们先假设已经运行了一些测试，并发现拆分 JSON 中的推理步骤会产生更差的响应，因此需要探索不同解决方案。

**我们能否使用 fine-tuned GPT-3.5 而不是 GPT-4？** 也许可以，但通常来说，assistants 的开放式响应最好留给 GPT-4，以便它更好地处理更广泛的情况。话虽如此，观察推理步骤本身，它们可能并不都需要 GPT-4 级别的推理才能生成。它们定义明确、范围有限，因此是 **fine-tuning 的良好潜在候选项**。

```jsx
{
  "message_is_conversation_continuation": "True", // <-
  "number_of_messages_in_conversation_so_far": "1", // <-
  "user_sentiment": "Aggravated", // <-
  "query_type": "Hardware Issue", // <-
  "response_tone": "Validating and solution-oriented", // <-
  "response_requirements": "Propose options for repair or replacement.", // <-
  "user_requesting_to_talk_to_human": "False", // <-
  "enough_information_in_context": "True", // <-
  "response": "..." // X -- benefits from GPT-4
}
```

这开启了一个取舍的可能性。我们是把它保留为 **完全由 GPT-4 生成的单个请求**，还是 **拆成两个顺序请求**，除最终响应外都使用 GPT-3.5？这里存在原则冲突：第一个选项让我们可以[发起更少请求](/mirror/api/docs/guides/latency-optimization#make-fewer-requests)，第二个选项则可能让我们[更快地处理 tokens](/mirror/api/docs/guides/latency-optimization#1-process-tokens-faster)。

和许多优化取舍一样，答案取决于细节。例如：

- `response` 与其他字段的 token 占比。
- 更快处理大多数字段带来的平均延迟下降。
- 做两个请求而非一个请求带来的平均延迟_增加_。

结论会因情况而异，做出判断的最佳方式是用生产示例测试。在这个案例中，我们假设测试表明，把 prompt 拆成两个以[更快地处理 tokens](/mirror/api/docs/guides/latency-optimization#process-tokens-faster)是有利的。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-6.png)

**注意：** 我们会把 `response` 和 `enough_information_in_context` 放在第二个 prompt 中一起处理，以避免把检索上下文传给两个新 prompt。

Assistants prompt - reasoning（推理）

这个 prompt 会传给 GPT-3.5，并可以在精选示例上 fine-tune。

**发生了什么变化？** “enough_information_in_context” 和 “response” 字段被移除，检索结果不再加载到这个 prompt 中。

```text
SYSTEM: You are a helpful customer service bot.

Based on the previous conversation, respond in a JSON to determine the required
fields.

# Example

User: "My freaking computer screen is cracked!"

Assistant Response:
{
  "message_is_conversation_continuation": "True",
  "number_of_messages_in_conversation_so_far": "1",
  "user_sentiment": "Aggravated",
  "query_type": "Hardware Issue",
  "response_tone": "Validating and solution-oriented",
  "response_requirements": "Propose options for repair or replacement.",
  "user_requesting_to_talk_to_human": "False",
}
```
Assistants prompt - response（响应）

这个 prompt 将由 GPT-4 处理，并会接收前一个 prompt 中确定的推理步骤，以及检索得到的结果。

**发生了什么变化？** 除了 “enough_information_in_context” 和 “response” 之外，所有步骤都被移除。此外，我们之前作为输出填写的 JSON 会被传入这个 prompt。

```text
SYSTEM: You are a helpful customer service bot.

Use the retrieved context, as well as these pre-classified fields, to respond to
the user's query.

# Reasoning Fields
` ` `
[reasoning json determined in previous GPT-3.5 call]
` ` `

# Example

User: "My freaking computer screen is cracked!"

Assistant Response:
{
  "enough_information_in_context": "True",
  "response": "..."
}

USER: # Relevant Information
` ` `
[retrieved context]
` ` `
```



事实上，现在推理 prompt 不依赖检索上下文，我们就可以[并行化](/mirror/api/docs/guides/latency-optimization#parallelize)，让它与检索 prompts 同时发起。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-6b.png)

#### 第 3 部分：优化结构化输出

让我们再看一眼推理 prompt。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-7b.png)

仔细看推理 JSON，你可能会注意到字段名本身相当长。

```jsx
{
  "message_is_conversation_continuation": "True", // <-
  "number_of_messages_in_conversation_so_far": "1", // <-
  "user_sentiment": "Aggravated", // <-
  "query_type": "Hardware Issue", // <-
  "response_tone": "Validating and solution-oriented", // <-
  "response_requirements": "Propose options for repair or replacement.", // <-
  "user_requesting_to_talk_to_human": "False", // <-
}
```

通过缩短它们，并把解释移动到注释中，我们可以[生成更少 tokens](/mirror/api/docs/guides/latency-optimization#generate-fewer-tokens)。

```jsx
{
  "cont": "True", // whether last message is a continuation
  "n_msg": "1", // number of messages in the continued conversation
  "tone_in": "Aggravated", // sentiment of user query
  "type": "Hardware Issue", // type of the user query
  "tone_out": "Validating and solution-oriented", // desired tone for response
  "reqs": "Propose options for repair or replacement.", // response requirements
  "human": "False", // whether user is expressing want to talk to human
}
```

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-8b.png)

这个小改动移除了 19 个 output tokens。对于 GPT-3.5，这可能只带来几毫秒改善，但对于 GPT-4，这可能节省多达一秒。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/token-counts-latency-customer-service-large.png)

不过你也可以想象，对于更大的模型输出，这会产生相当显著的影响。

我们还可以更进一步，为 JSON 字段使用单个字符，或把所有内容放进数组，但这可能开始损害响应质量。再次强调，最好的判断方式是测试。

#### 示例收尾

让我们回顾为客服机器人示例实现的优化：

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-11b.png)

1. **合并**查询上下文化和检索检查步骤，以[发起更少请求](/mirror/api/docs/guides/latency-optimization#make-fewer-requests)。
2. 对新的 prompt，**切换到更小、经过 fine-tuned 的 GPT-3.5**，以[更快地处理 tokens](https://developers.openai.com/api/docs/guides/process-tokens-faster)。
3. 将 assistant prompt 拆成两个，再次为 reasoning **切换到更小、经过 fine-tuned 的 GPT-3.5**，以[更快地处理 tokens](/mirror/api/docs/guides/latency-optimization#process-tokens-faster)。
4. [并行化](/mirror/api/docs/guides/latency-optimization#parallelize)检索检查和推理步骤。
5. **缩短推理字段名**，并将注释移到 prompt 中，以[生成更少 tokens](/mirror/api/docs/guides/latency-optimization#generate-fewer-tokens)。

:::

## English source

::: details 展开英文原文
::: v-pre
This guide covers the core set of principles you can apply to improve latency across a wide variety of LLM-related use cases. These techniques come from working with a wide range of customers and developers on production applications, so they should apply regardless of what you're building – from a granular workflow to an end-to-end chatbot.

While there's many individual techniques, we'll be grouping them into **seven principles** meant to represent a high-level taxonomy of approaches for improving latency.

At the end, we'll walk through an [example](/mirror/api/docs/guides/latency-optimization#example) to see how they can be applied.

### Seven principles

1. [Process tokens faster.](/mirror/api/docs/guides/latency-optimization#process-tokens-faster)
2. [Generate fewer tokens.](/mirror/api/docs/guides/latency-optimization#generate-fewer-tokens)
3. [Use fewer input tokens.](/mirror/api/docs/guides/latency-optimization#use-fewer-input-tokens)
4. [Make fewer requests.](/mirror/api/docs/guides/latency-optimization#make-fewer-requests)
5. [Parallelize.](/mirror/api/docs/guides/latency-optimization#parallelize)
6. [Make your users wait less.](/mirror/api/docs/guides/latency-optimization#make-your-users-wait-less)
7. [Don't default to an LLM.](/mirror/api/docs/guides/latency-optimization#don-t-default-to-an-llm)

## Process tokens faster

**Inference speed** is probably the first thing that comes to mind when addressing latency (but as you'll see soon, it's far from the only one). This refers to the actual **rate at which the LLM processes tokens**, and is often measured in TPM (tokens per minute) or TPS (tokens per second).

The main factor that influences inference speed is **model size** – smaller models usually run faster (and cheaper), and when used correctly can even outperform larger models. To maintain high quality performance with smaller models you can explore:

- using a longer, [more detailed prompt](/mirror/api/docs/guides/prompt-engineering#tactic-specify-the-steps-required-to-complete-a-task),
- adding (more) [few-shot examples](/mirror/api/docs/guides/prompt-engineering#tactic-provide-examples), or
- [fine-tuning](/mirror/api/docs/guides/model-optimization) / distillation.

You can also employ inference optimizations like our [**Predicted outputs**](/mirror/api/docs/guides/predicted-outputs) feature. Predicted outputs let you significantly reduce latency of a generation when you know most of the output ahead of time, such as code editing tasks. By giving the model a prediction, the LLM can focus more on the actual changes, and less on the content that will remain the same.



Other factors that affect inference speed are the amount of 
  &lt;strong&gt;compute&lt;/strong&gt; you have available and any additional 
  &lt;strong&gt;inference optimizations&lt;/strong&gt; you employ. &lt;br /&gt; &lt;br /&gt;
  Most people can't influence these factors directly, but if you're curious, and
  have some control over your infra, &lt;strong&gt;faster hardware&lt;/strong&gt; or 
  &lt;strong&gt;running engines at a lower saturation&lt;/strong&gt; may give you a modest
  TPM boost. And if you're down in the trenches, there's a myriad of other 

    inference optimizations

  that are a bit beyond the scope of this guide.



## Generate fewer tokens

Generating tokens is almost always the highest latency step when using an LLM: as a general heuristic, **cutting 50% of your output tokens may cut ~50% your latency**. The way you reduce your output size will depend on output type:

If you're generating **natural language**, simply **asking the model to be more concise** ("under 20 words" or "be very brief") may help. You can also use few shot examples and/or fine-tuning to teach the model shorter responses.

If you're generating **structured output**, try to **minimize your output syntax** where possible: shorten function names, omit named arguments, coalesce parameters, etc.

Finally, while not common, you can also use `max_tokens` or `stop_tokens` to end your generation early.

Always remember: an output token cut is a (milli)second earned!

## Use fewer input tokens

While reducing the number of input tokens does result in lower latency, this is not usually a significant factor – **cutting 50% of your prompt may only result in a 1-5% latency improvement**. Unless you're working with truly massive context sizes (documents, images), you may want to spend your efforts elsewhere.

That being said, if you _are_ working with massive contexts (or you're set on squeezing every last bit of performance _and_ you've exhausted all other options) you can use the following techniques to reduce your input tokens:

- **Fine-tuning the model**, to replace the need for lengthy instructions / examples.
- **Filtering context input**, like pruning RAG results, cleaning HTML, etc.
- **Maximize shared prompt prefix**, by putting dynamic portions (e.g. RAG results, history, etc) later in the prompt. This makes your request more [KV cache](https://medium.com/@joaolages/kv-caching-explained-276520203249)-friendly (which most LLM providers use) and means fewer input tokens are processed on each request.

Check out our docs to learn more about how [prompt caching](/mirror/api/docs/guides/prompt-engineering#prompt-caching) works.

## Make fewer requests

Each time you make a request you incur some round-trip latency – this can start to add up.

If you have sequential steps for the LLM to perform, instead of firing off one request per step consider **putting them in a single prompt and getting them all in a single response**. You'll avoid the additional round-trip latency, and potentially also reduce complexity of processing multiple responses.

An approach to doing this is by collecting your steps in an enumerated list in the combined prompt, and then requesting the model to return the results in named fields in a JSON. This way you can easily parse out and reference each result!

## Parallelize

Parallelization can be very powerful when performing multiple steps with an LLM.

If the steps **are _not_ strictly sequential**, you can **split them out into parallel calls**. Two shirts take just as long to dry as one.

If the steps **_are_ strictly sequential**, however, you might still be able to **leverage speculative execution**. This is particularly effective for classification steps where one outcome is more likely than the others (e.g. moderation).

1. Start step 1 & step 2 simultaneously (e.g. input moderation & story generation)
2. Verify the result of step 1
3. If result was not the expected, cancel step 2 (and retry if necessary)

If your guess for step 1 is right, then you essentially got to run it with zero added latency!

## Make your users wait less

There's a huge difference between **waiting** and **watching progress happen** – make sure your users experience the latter. Here are a few techniques:

- **Streaming**: The single most effective approach, as it cuts the _waiting_ time to a second or less. (ChatGPT would feel pretty different if you saw nothing until each response was done.)
- **Chunking**: If your output needs further processing before being shown to the user (moderation, translation) consider **processing it in chunks** instead of all at once. Do this by streaming to your backend, then sending processed chunks to your frontend.
- **Show your steps**: If you're taking multiple steps or using tools, surface this to the user. The more real progress you can show, the better.
- **Loading states**: Spinners and progress bars go a long way.

Note that while **showing your steps & having loading states** have a mostly
psychological effect, **streaming & chunking** genuinely do reduce overall
latency once you consider the app + user system: the user will finish reading a response
sooner.

## Don't default to an LLM

LLMs are extremely powerful and versatile, and are therefore sometimes used in cases where a **faster classical method** would be more appropriate. Identifying such cases may allow you to cut your latency significantly. Consider the following examples:

- **Hard-coding:** If your **output** is highly constrained, you may not need an LLM to generate it. Action confirmations, refusal messages, and requests for standard input are all great candidates to be hard-coded. (You can even use the age-old method of coming up with a few variations for each.)
- **Pre-computing:** If your **input** is constrained (e.g. category selection) you can generate multiple responses in advance, and just make sure you never show the same one to a user twice.
- **Leveraging UI:** Summarized metrics, reports, or search results are sometimes better conveyed with classical, bespoke UI components rather than LLM-generated text.
- **Traditional optimization techniques:** An LLM application is still an application; binary search, caching, hash maps, and runtime complexity are all _still_ useful in a world of LLMs.

## Example

Let's now look at a sample application, identify potential latency optimizations, and propose some solutions!

We'll be analyzing the architecture and prompts of a hypothetical customer service bot inspired by real production applications. The [architecture and prompts](/mirror/api/docs/guides/latency-optimization#architecture-and-prompts) section sets the stage, and the [analysis and optimizations](/mirror/api/docs/guides/latency-optimization#analysis-and-optimizations) section will walk through the latency optimization process.

You'll notice this example doesn't cover every single principle, much like
  real-world use cases don't require applying every technique.

### Architecture and prompts

The following is the **initial architecture** for a hypothetical **customer service bot**. This is what we'll be making changes to.

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-0.png)

At a high level, the diagram flow describes the following process:

1. A user sends a message as part of an ongoing conversation.
2. The last message is turned into a **self-contained query** (see examples in prompt).
3. We determine whether or not **additional (retrieved) information is required** to respond to that query.
4. **Retrieval** is performed, producing search results.
5. The assistant **reasons** about the user's query and search results, and **produces a response**.
6. The response is sent back to the user.

Below are the prompts used in each part of the diagram. While they are still only hypothetical and simplified, they are written with the same structure and wording that you would find in a production application.

Places where you see placeholders like "**[user input here]**" represent
  dynamic portions, that would be replaced by actual data at runtime.

Query contextualization prompt

Re-writes user query to be a self-contained search query.

```text
SYSTEM: Given the previous conversation, re-write the last user query so it contains
all necessary context.

# Example
History: [{user: "What is your return policy?"},{assistant: "..."}]
User Query: "How long does it cover?"
Response: "How long does the return policy cover?"

# Conversation
[last 3 messages of conversation]

# User Query
[last user query]

USER: [JSON-formatted input conversation here]
```

Retrieval check prompt

Determines whether a query requires performing retrieval to respond.

```text
SYSTEM: Given a user query, determine whether it requires doing a realtime lookup to
respond to.

# Examples
User Query: "How can I return this item after 30 days?"
Response: "true"

User Query: "Thank you!"
Response: "false"

USER: [input user query here]
```

Assistant prompt

Fills the fields of a JSON to reason through a pre-defined set of steps to produce a final response given a user conversation and relevant retrieved information.

```text
SYSTEM: You are a helpful customer service bot.

Use the result JSON to reason about each user query - use the retrieved context.

# Example

User: "My computer screen is cracked! I want it fixed now!!!"

Assistant Response:
{
  "message_is_conversation_continuation": "True",
  "number_of_messages_in_conversation_so_far": "1",
  "user_sentiment": "Aggravated",
  "query_type": "Hardware Issue",
  "response_tone": "Validating and solution-oriented",
  "response_requirements": "Propose options for repair or replacement.",
  "user_requesting_to_talk_to_human": "False",
  "enough_information_in_context": "True",
  "response": "..."
}

USER: # Relevant Information
` ` `
[retrieved context]
` ` `

USER: [input user query here]
```

### Analysis and optimizations

#### Part 1: Looking at retrieval prompts

Looking at the architecture, the first thing that stands out is the **consecutive GPT-4 calls** - these hint at a potential inefficiency, and can often be replaced by a single call or parallel calls.

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-2.png)

In this case, since the check for retrieval requires the contextualized query, let's **combine them into a single prompt** to [make fewer requests](/mirror/api/docs/guides/latency-optimization#make-fewer-requests).

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-3.png)

Combined query contextualization and retrieval check prompt

**What changed?** Before, we had one prompt to re-write the query and one to determine whether this requires doing a retrieval lookup. Now, this combined prompt does both. Specifically, notice the updated instruction in the first line of the prompt, and the updated output JSON:

```jsx
{
  query:"[contextualized query]",
  retrieval:"[true/false - whether retrieval is required]"
}
```

```text
SYSTEM: Given the previous conversation, re-write the last user query so it contains
all necessary context. Then, determine whether the full request requires doing a
realtime lookup to respond to.

Respond in the following form:
{
  query:"[contextualized query]",
  retrieval:"[true/false - whether retrieval is required]"
}

# Examples

History: [{user: "What is your return policy?"},{assistant: "..."}]
User Query: "How long does it cover?"
Response: {query: "How long does the return policy cover?", retrieval: "true"}

History: [{user: "How can I return this item after 30 days?"},{assistant: "..."}]
User Query: "Thank you!"
Response: {query: "Thank you!", retrieval: "false"}

# Conversation
[last 3 messages of conversation]

# User Query
[last user query]

USER: [JSON-formatted input conversation here]
```


Actually, adding context and determining whether to retrieve are very straightforward and well defined tasks, so we can likely use a **smaller, fine-tuned model** instead. Switching to GPT-3.5 will let us [process tokens faster](/mirror/api/docs/guides/latency-optimization#process-tokens-faster).

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-4.png)

#### Part 2: Analyzing the assistant prompt

Let's now direct our attention to the Assistant prompt. There seem to be many distinct steps happening as it fills the JSON fields – this could indicate an opportunity to [parallelize](/mirror/api/docs/guides/latency-optimization#parallelize).

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-5.png)

However, let's pretend we have run some tests and discovered that splitting the reasoning steps in the JSON produces worse responses, so we need to explore different solutions.

**Could we use a fine-tuned GPT-3.5 instead of GPT-4?** Maybe – but in general, open-ended responses from assistants are best left to GPT-4 so it can better handle a greater range of cases. That being said, looking at the reasoning steps themselves, they may not all require GPT-4 level reasoning to produce. The well defined, limited scope nature makes them and **good potential candidates for fine-tuning**.

```jsx
{
  "message_is_conversation_continuation": "True", // <-
  "number_of_messages_in_conversation_so_far": "1", // <-
  "user_sentiment": "Aggravated", // <-
  "query_type": "Hardware Issue", // <-
  "response_tone": "Validating and solution-oriented", // <-
  "response_requirements": "Propose options for repair or replacement.", // <-
  "user_requesting_to_talk_to_human": "False", // <-
  "enough_information_in_context": "True", // <-
  "response": "..." // X -- benefits from GPT-4
}
```

This opens up the possibility of a trade-off. Do we keep this as a **single request entirely generated by GPT-4**, or **split it into two sequential requests** and use GPT-3.5 for all but the final response? We have a case of conflicting principles: the first option lets us [make fewer requests](/mirror/api/docs/guides/latency-optimization#make-fewer-requests), but the second may let us [process tokens faster](/mirror/api/docs/guides/latency-optimization#1-process-tokens-faster).

As with many optimization tradeoffs, the answer will depend on the details. For example:

- The proportion of tokens in the `response` vs the other fields.
- The average latency decrease from processing most fields faster.
- The average latency _increase_ from doing two requests instead of one.

The conclusion will vary by case, and the best way to make the determiation is by testing this with production examples. In this case let's pretend the tests indicated it's favorable to split the prompt in two to [process tokens faster](/mirror/api/docs/guides/latency-optimization#process-tokens-faster).

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-6.png)

**Note:** We'll be grouping `response` and `enough_information_in_context` together in the second prompt to avoid passing the retrieved context to both new prompts.

Assistants prompt - reasoning

This prompt will be passed to GPT-3.5 and can be fine-tuned on curated examples.

**What changed?** The "enough_information_in_context" and "response" fields were removed, and the retrieval results are no longer loaded into this prompt.

```text
SYSTEM: You are a helpful customer service bot.

Based on the previous conversation, respond in a JSON to determine the required
fields.

# Example

User: "My freaking computer screen is cracked!"

Assistant Response:
{
  "message_is_conversation_continuation": "True",
  "number_of_messages_in_conversation_so_far": "1",
  "user_sentiment": "Aggravated",
  "query_type": "Hardware Issue",
  "response_tone": "Validating and solution-oriented",
  "response_requirements": "Propose options for repair or replacement.",
  "user_requesting_to_talk_to_human": "False",
}
```
Assistants prompt - response

This prompt will be processed by GPT-4 and will receive the reasoning steps determined in the prior prompt, as well as the results from retrieval.

**What changed?** All steps were removed except for "enough_information_in_context" and "response". Additionally, the JSON we were previously filling in as output will be passed in to this prompt.

```text
SYSTEM: You are a helpful customer service bot.

Use the retrieved context, as well as these pre-classified fields, to respond to
the user's query.

# Reasoning Fields
` ` `
[reasoning json determined in previous GPT-3.5 call]
` ` `

# Example

User: "My freaking computer screen is cracked!"

Assistant Response:
{
  "enough_information_in_context": "True",
  "response": "..."
}

USER: # Relevant Information
` ` `
[retrieved context]
` ` `
```



In fact, now that the reasoning prompt does not depend on the retrieved context we can [parallelize](/mirror/api/docs/guides/latency-optimization#parallelize) and fire it off at the same time as the retrieval prompts.

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-6b.png)

#### Part 3: Optimizing the structured output

Let's take another look at the reasoning prompt.

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-7b.png)

Taking a closer look at the reasoning JSON you may notice the field names themselves are quite long.

```jsx
{
  "message_is_conversation_continuation": "True", // <-
  "number_of_messages_in_conversation_so_far": "1", // <-
  "user_sentiment": "Aggravated", // <-
  "query_type": "Hardware Issue", // <-
  "response_tone": "Validating and solution-oriented", // <-
  "response_requirements": "Propose options for repair or replacement.", // <-
  "user_requesting_to_talk_to_human": "False", // <-
}
```

By making them shorter and moving explanations to the comments we can [generate fewer tokens](/mirror/api/docs/guides/latency-optimization#generate-fewer-tokens).

```jsx
{
  "cont": "True", // whether last message is a continuation
  "n_msg": "1", // number of messages in the continued conversation
  "tone_in": "Aggravated", // sentiment of user query
  "type": "Hardware Issue", // type of the user query
  "tone_out": "Validating and solution-oriented", // desired tone for response
  "reqs": "Propose options for repair or replacement.", // response requirements
  "human": "False", // whether user is expressing want to talk to human
}
```

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-8b.png)

This small change removed 19 output tokens. While with GPT-3.5 this may only result in a few millisecond improvement, with GPT-4 this could shave off up to a second.

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/token-counts-latency-customer-service-large.png)

You might imagine, however, how this can have quite a significant impact for larger model outputs.

We could go further and use single characters for the JSON fields, or put everything in an array, but this may start to hurt our response quality. The best way to know, once again, is through testing.

#### Example wrap-up

Let's review the optimizations we implemented for the customer service bot example:

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-11b.png)

1. **Combined** query contextualization and retrieval check steps to [make fewer requests](/mirror/api/docs/guides/latency-optimization#make-fewer-requests).
2. For the new prompt, **switched to a smaller, fine-tuned GPT-3.5** to [process tokens faster](https://developers.openai.com/api/docs/guides/process-tokens-faster).
3. Split the assistant prompt in two, **switching to a smaller, fine-tuned GPT-3.5** for the reasoning, again to [process tokens faster](/mirror/api/docs/guides/latency-optimization#process-tokens-faster).
4. [Parallelized](/mirror/api/docs/guides/latency-optimization#parallelize) the retrieval checks and the reasoning steps.
5. **Shortened reasoning field names** and moved comments into the prompt, to [generate fewer tokens](/mirror/api/docs/guides/latency-optimization#generate-fewer-tokens).

:::
:::

