---
status: needs-review
sourceId: "efc131859a7c"
sourceChecksum: "efc131859a7ce7c785b8eb54522aaf9f9a327db397d75eb537a33bd13e273154"
sourceUrl: "https://developers.openai.com/api/docs/guides/latency-optimization"
translatedAt: "2026-06-27T17:44:39.0189315+08:00"
translator: codex-gpt-5.5-xhigh
---

# 延迟优化

本指南介绍一组核心原则，你可以将它们应用到各种与 LLM 相关的用例中以改善延迟。这些技巧来自我们与大量客户和开发者一起构建生产应用的经验，因此无论你正在构建什么，从细粒度 workflow 到端到端 chatbot，它们都应适用。

虽然存在许多单独技巧，但我们会把它们归入 **七条原则**，用于代表改进延迟方法的高层分类。

最后，我们会通过一个[示例](#example)来看看它们如何应用。

### 七条原则

1. [更快地处理 tokens。](#process-tokens-faster)
2. [生成更少 tokens。](#generate-fewer-tokens)
3. [使用更少 input tokens。](#use-fewer-input-tokens)
4. [发起更少请求。](#make-fewer-requests)
5. [并行化。](#parallelize)
6. [让用户少等。](#make-your-users-wait-less)
7. [不要默认使用 LLM。](#don-t-default-to-an-llm)

## 更快地处理 tokens

**Inference speed** 可能是处理延迟时首先想到的事情（但你很快会看到，它远不是唯一因素）。它指的是 **LLM 处理 tokens 的实际速率**，通常用 TPM（tokens per minute）或 TPS（tokens per second）衡量。

影响 inference speed 的主要因素是 **model size**。较小的模型通常运行得更快（也更便宜），并且在正确使用时甚至可以胜过更大的模型。为了用较小模型保持高质量表现，你可以探索：

- 使用更长、[更详细的 prompt](https://developers.openai.com/api/docs/guides/prompt-engineering#tactic-specify-the-steps-required-to-complete-a-task)，
- 添加（更多）[few-shot examples](https://developers.openai.com/api/docs/guides/prompt-engineering#tactic-provide-examples)，或
- [fine-tuning](https://developers.openai.com/api/docs/guides/model-optimization) / distillation。

你还可以采用 inference optimizations，例如我们的 [**Predicted outputs**](https://developers.openai.com/api/docs/guides/predicted-outputs) 功能。Predicted outputs 允许你在提前知道大部分输出内容时显著降低 generation 的延迟，例如代码编辑任务。通过给模型提供 prediction，LLM 可以更多地关注实际变化，而更少关注保持不变的内容。



影响 inference speed 的其他因素包括你可用的
  <strong>compute</strong> 数量，以及你采用的任何额外
  <strong>inference optimizations</strong>。<br /> <br />
  大多数人无法直接影响这些因素，但如果你感兴趣，并且对自己的基础设施有一定控制权，
  <strong>更快的硬件</strong> 或
  <strong>以更低饱和度运行 engines</strong> 可能会带来适度的
  TPM 提升。如果你已经深入到细节层面，还有大量其他
  <a href="https://lilianweng.github.io/posts/2023-01-10-inference-optimization/">
    inference optimizations
  </a>
  略超出了本指南范围。



## 生成更少 tokens

使用 LLM 时，生成 tokens 几乎总是延迟最高的一步。作为一般启发式规则，**减少 50% 的 output tokens 可能会减少约 50% 的延迟**。减少输出大小的方式取决于输出类型：

如果你生成的是 **natural language**，只需 **要求模型更简洁**（“under 20 words” 或 “be very brief”）可能就有帮助。你也可以使用 few shot examples 和/或 fine-tuning 来教模型给出更短的响应。

如果你生成的是 **structured output**，请尽可能 **最小化输出语法**：缩短 function names、省略 named arguments、合并 parameters 等。

最后，虽然不常见，你也可以使用 `max_tokens` 或 `stop_tokens` 来提前结束 generation。

请始终记住：减少一个 output token，就是赢回一段（毫）秒！

## 使用更少 input tokens

尽管减少 input tokens 数量确实会降低延迟，但这通常不是显著因素。**减少 50% 的 prompt 可能只会带来 1-5% 的延迟改善**。除非你正在处理真正巨大的 context sizes（文档、图像），否则可能更应该把精力放在别处。

话虽如此，如果你_确实_在处理 massive contexts（或者你决心榨出最后一点性能，并且_已经_耗尽所有其他选项），可以使用以下技巧减少 input tokens：

- **Fine-tuning 模型**，以替代冗长 instructions / examples 的需求。
- **过滤 context input**，例如修剪 RAG results、清理 HTML 等。
- **最大化 shared prompt prefix**，把动态部分（例如 RAG results、history 等）放到 prompt 后面。这会让你的请求更适合 [KV cache](https://medium.com/@joaolages/kv-caching-explained-276520203249)（大多数 LLM providers 都使用它），也意味着每次请求需要处理的 input tokens 更少。

请查看我们的文档，了解 [prompt caching](https://developers.openai.com/api/docs/guides/prompt-engineering#prompt-caching) 如何工作。

## 发起更少请求

每次发起请求时，都会产生一些 round-trip latency；这些延迟会逐渐累积。

如果你有需要 LLM 顺序执行的步骤，与其每一步发起一次请求，不如考虑 **把它们放在一个 prompt 中，并在一个 response 中一次性得到所有结果**。这样可以避免额外的 round-trip latency，并且可能降低处理多个 responses 的复杂性。

一种实现方式是把这些步骤整理成 combined prompt 中的编号列表，然后要求模型以 JSON 中的 named fields 返回结果。这样你就可以轻松解析并引用每个结果！

## 并行化

在用 LLM 执行多个步骤时，并行化可能非常强大。

如果步骤 **并非_严格_顺序执行**，你可以 **把它们拆成 parallel calls**。两件衬衫和一件衬衫晾干所需时间一样长。

但如果步骤 **_确实_严格顺序执行**，你仍可能可以 **利用 speculative execution**。这对某个结果比其他结果更可能出现的分类步骤尤其有效（例如 moderation）。

1. 同时启动 step 1 和 step 2（例如 input moderation 和 story generation）
2. 验证 step 1 的结果
3. 如果结果不是预期结果，取消 step 2（必要时重试）

如果你对 step 1 的猜测是正确的，那么它本质上就以零额外延迟运行了！

## 让用户少等

**等待** 和 **看着进度发生** 之间有巨大差别，请确保用户体验到后者。以下是一些技巧：

- **Streaming**：最有效的单一方法，因为它把_等待_时间缩短到一秒或更少。（如果你在每条回复完成前都看不到任何内容，ChatGPT 的感觉会很不一样。）
- **Chunking**：如果输出在展示给用户前需要进一步处理（moderation、translation），请考虑 **分块处理**，而不是一次性处理全部。做法是 stream 到你的 backend，然后把处理后的 chunks 发送到 frontend。
- **展示步骤**：如果你正在执行多个步骤或使用 tools，请把这些信息展示给用户。你能展示的真实进度越多越好。
- **Loading states**：Spinners 和 progress bars 很有帮助。

请注意，虽然 **展示步骤和提供 loading states** 主要是心理层面的影响，**streaming 和 chunking** 在把 app + user 系统一起考虑时，确实会降低总体延迟：用户会更早读完响应。

## 不要默认使用 LLM

LLM 极其强大且通用，因此有时会被用于其实 **更快的经典方法** 更合适的场景。识别这些场景可能让你显著降低延迟。请考虑以下示例：

- **Hard-coding**：如果你的 **output** 高度受限，可能不需要 LLM 来生成。操作确认、拒绝消息和请求标准输入都非常适合 hard-code。（你甚至可以使用老办法，为每种情况准备几个变体。）
- **Pre-computing**：如果你的 **input** 受限（例如类别选择），你可以提前生成多个响应，并确保永远不会向同一用户展示同一个响应两次。
- **利用 UI**：汇总指标、报告或搜索结果，有时用经典的、定制的 UI components 表达会比 LLM 生成文本更好。
- **传统优化技术**：LLM 应用仍然是应用；binary search、caching、hash maps 和 runtime complexity 在 LLM 世界中_仍然_有用。

## 示例

现在来看一个示例应用，识别潜在的延迟优化，并提出一些解决方案！

我们将分析一个假想客服 bot 的 architecture 和 prompts，该 bot 受真实生产应用启发。[Architecture and prompts](#architecture-and-prompts) 部分会设定场景，[analysis and optimizations](#analysis-and-optimizations) 部分会逐步展示延迟优化过程。

你会注意到，这个示例并没有覆盖每一条原则，就像真实用例并不需要应用每一项技术一样。

### Architecture 和 prompts

下面是假想 **customer service bot** 的 **initial architecture**。我们将对它进行修改。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-0.png)

从高层看，diagram flow 描述了以下过程：

1. 用户在一段 ongoing conversation 中发送消息。
2. 最新消息被转化为 **self-contained query**（见 prompt 中的示例）。
3. 我们判断是否需要 **additional (retrieved) information** 来回复该 query。
4. 执行 **Retrieval**，生成 search results。
5. assistant 对用户 query 和 search results 进行 **reasoning**，并 **produces a response**。
6. response 被发送回用户。

下面是 diagram 每个部分使用的 prompts。虽然它们仍然只是简化的假设示例，但它们采用了你会在生产应用中看到的相同结构和措辞。

你看到像 "**[user input here]**" 这样的 placeholders 时，它们表示动态部分，会在运行时被实际数据替换。

Query contextualization prompt

Re-writes user query to be a self-contained search query.

```example-chat
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

```example-chat
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

```example-chat
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

#### 第 1 部分：查看 retrieval prompts

查看 architecture，首先引人注意的是 **连续的 GPT-4 calls**。这暗示着潜在低效，并且通常可以用单次 call 或 parallel calls 替代。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-2.png)

在这个案例中，由于 retrieval check 需要 contextualized query，让我们 **把它们合并到单个 prompt 中**，以[发起更少请求](#make-fewer-requests)。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-3.png)

Combined query contextualization and retrieval check prompt

**发生了什么变化？** 之前，我们有一个 prompt 用来重写 query，另一个 prompt 用来判断是否需要执行 retrieval lookup。现在，这个 combined prompt 会同时完成二者。具体来说，请注意 prompt 第一行更新后的 instruction，以及更新后的 output JSON：

```jsx
{
  query:"[contextualized query]",
  retrieval:"[true/false - whether retrieval is required]"
}
```

```example-chat
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
<br/>

实际上，添加 context 和判断是否 retrieve 都是非常直接且定义明确的任务，因此我们很可能可以改用 **更小、经过 fine-tuned 的模型**。切换到 GPT-3.5 可以让我们[更快地处理 tokens](#process-tokens-faster)。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-4.png)

#### 第 2 部分：分析 assistant prompt

现在把注意力转向 Assistant prompt。它在填充 JSON fields 时似乎发生了许多不同步骤，这可能表明存在[并行化](#parallelize)机会。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-5.png)

不过，我们先假设已经运行了一些测试，并发现拆分 JSON 中的 reasoning steps 会产生更差的 responses，因此需要探索不同解决方案。

**我们能否使用 fine-tuned GPT-3.5 而不是 GPT-4？** 也许可以，但通常来说，assistants 的开放式 responses 最好留给 GPT-4，以便它更好地处理更广泛的情况。话虽如此，观察 reasoning steps 本身，它们可能并不都需要 GPT-4 级别的 reasoning 才能生成。它们定义明确、范围有限，因此是 **fine-tuning 的良好潜在候选项**。

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

这开启了一个 trade-off 的可能性。我们是把它保留为 **完全由 GPT-4 生成的单个请求**，还是 **拆成两个顺序请求**，除最终 response 外都使用 GPT-3.5？这里存在原则冲突：第一个选项让我们可以[发起更少请求](#make-fewer-requests)，第二个选项则可能让我们[更快地处理 tokens](#1-process-tokens-faster)。

和许多优化 tradeoffs 一样，答案取决于细节。例如：

- `response` 与其他 fields 的 tokens 占比。
- 更快处理大多数字段带来的平均延迟下降。
- 做两个请求而非一个请求带来的平均延迟_增加_。

结论会因情况而异，做出判断的最佳方式是用生产示例测试。在这个案例中，我们假设测试表明，把 prompt 拆成两个以[更快地处理 tokens](#process-tokens-faster)是有利的。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-6.png)

**Note:** 我们会把 `response` 和 `enough_information_in_context` 放在第二个 prompt 中一起处理，以避免把 retrieved context 传给两个新 prompts。

Assistants prompt - reasoning

这个 prompt 会传给 GPT-3.5，并可以在 curated examples 上 fine-tune。

**发生了什么变化？** “enough_information_in_context” 和 “response” fields 被移除，retrieval results 不再加载到这个 prompt 中。

```example-chat
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

这个 prompt 将由 GPT-4 处理，并会接收 prior prompt 中确定的 reasoning steps，以及 retrieval 得到的结果。

**发生了什么变化？** 除了 “enough_information_in_context” 和 “response” 之外，所有 steps 都被移除。此外，我们之前作为 output 填写的 JSON 会被传入这个 prompt。

```example-chat
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

<br />

事实上，现在 reasoning prompt 不依赖 retrieved context，我们就可以[并行化](#parallelize)，让它与 retrieval prompts 同时发起。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-6b.png)

#### 第 3 部分：优化 structured output

让我们再看一眼 reasoning prompt。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-7b.png)

仔细看 reasoning JSON，你可能会注意到 field names 本身相当长。

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

通过缩短它们，并把解释移动到 comments 中，我们可以[生成更少 tokens](#generate-fewer-tokens)。

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

我们还可以更进一步，为 JSON fields 使用单个字符，或把所有内容放进数组，但这可能开始损害 response quality。再次强调，最好的判断方式是测试。

#### 示例收尾

让我们回顾为 customer service bot 示例实现的优化：

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-11b.png)

1. **合并** query contextualization 和 retrieval check 步骤，以[发起更少请求](#make-fewer-requests)。
2. 对新的 prompt，**切换到更小、经过 fine-tuned 的 GPT-3.5**，以[更快地处理 tokens](https://developers.openai.com/api/docs/guides/process-tokens-faster)。
3. 将 assistant prompt 拆成两个，再次为 reasoning **切换到更小、经过 fine-tuned 的 GPT-3.5**，以[更快地处理 tokens](#process-tokens-faster)。
4. [并行化](#parallelize) retrieval checks 和 reasoning steps。
5. **缩短 reasoning field names**，并将 comments 移到 prompt 中，以[生成更少 tokens](#generate-fewer-tokens)。
