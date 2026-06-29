---
title: "对话状态"
description: "Learn how to manage conversation state during a model interaction with the OpenAI API."
outline: deep
---

# 对话状态

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/conversation-state](https://developers.openai.com/api/docs/guides/conversation-state)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/conversation-state.md](https://developers.openai.com/api/docs/guides/conversation-state.md)
- 抓取时间：2026-06-27T05:54:00.826Z
- Checksum：`d049941d85ca8f526c85072051aab458131f04854f6483202ea1a6b84ce4411d`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
OpenAI 提供了几种管理对话状态的方式；这对于在对话中的多条消息或多个轮次之间保留信息非常重要。


  排查 GPT-5.5 将中间更新当作最终答案处理的情况时，请确认你的集成正确保留了 assistant 消息的 `phase` 字段。详情请参阅 [Phase parameter](/mirror/api/docs/guides/reasoning#phase-parameter)。


## 手动管理对话状态

虽然每个文本生成请求都是独立且无状态的，但你仍然可以通过将额外消息作为参数传给文本生成请求来实现**多轮对话**。请看一个 knock-knock 笑话：



  手动构造历史对话

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: [
        { role: "user", content: "knock knock." },
        { role: "assistant", content: "Who's there?" },
        { role: "user", content: "Orange." },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {"role": "user", "content": "knock knock."},
        {"role": "assistant", "content": "Who's there?"},
        {"role": "user", "content": "Orange."},
    ],
)

print(response.output_text)
```



通过交替使用 `user` 和 `assistant` 消息，你可以在一次发给模型的请求中捕获对话的先前状态。

若要在生成的响应之间手动共享上下文，请将模型上一次响应的输出作为输入包含进去，并把该输入追加到下一次请求中。

在下面的示例中，我们先要求模型讲一个笑话，然后请求它再讲一个。用这种方式把先前响应追加到新请求中，有助于确保对话感觉自然，并保留先前交互的上下文。




  使用 Responses API 手动管理对话状态。

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

let history = [
    {
        role: "user",
        content: "tell me a joke",
    },
];

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: history,
    store: true,
});

console.log(response.output_text);

// Add all response output items, including reasoning items, to the history
history = [...history, ...response.output];

history.push({
    role: "user",
    content: "tell me another",
});

const secondResponse = await openai.responses.create({
    model: "gpt-5.5",
    input: history,
    store: true,
});

console.log(secondResponse.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

history = [
    {
        "role": "user",
        "content": "tell me a joke"
    }
]

response = client.responses.create(
    model="gpt-5.5",
    input=history,
    store=False,
    include=["reasoning.encrypted_content"],
)

print(response.output_text)

# Add all response output items, including encrypted reasoning items, to the conversation
history += response.output

history.append({ "role": "user", "content": "tell me another" })

second_response = client.responses.create(
    model="gpt-5.5",
    input=history,
    store=False,
    include=["reasoning.encrypted_content"],
)

print(second_response.output_text)
```



## 用于对话状态的 OpenAI API

我们的 API 可以更轻松地自动管理对话状态，因此你不必在对话的每一轮都手动传递输入。





### 使用 Conversations API

[Conversations API](https://developers.openai.com/api/docs/api-reference/conversations/create) 与 [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) 配合使用，将对话状态持久化为一个长期存在的对象，并拥有自己的持久标识符。创建 conversation 对象后，你可以跨会话、设备或作业继续使用它。

Conversations 会存储 items，这些 items 可以是消息、工具调用、工具输出以及其他数据。

  创建 conversation

```python
conversation = openai.conversations.create()
```


在多轮交互中，你可以把 `conversation` 传入后续 responses，以便持久化状态并在后续 responses 之间共享上下文，而不必把多个 response items 串接在一起。

  使用 Conversations 和 Responses APIs 管理对话状态

```python
response = openai.responses.create(
  model="gpt-5.5",
  input=[{"role": "user", "content": "What are the 5 Ds of dodgeball?"}],
  conversation="conv_689667905b048191b4740501625afd940c7533ace33a2dab"
)
```


### 传递上一条响应中的上下文

另一种管理对话状态的方式，是通过 `previous_response_id` 参数在生成的响应之间共享上下文。此参数让你可以串接 responses，并创建线程式对话。

  通过传递上一条 response ID 在轮次之间串接 responses

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "tell me a joke",
    store: true,
});

console.log(response.output_text);

const secondResponse = await openai.responses.create({
    model: "gpt-5.5",
    previous_response_id: response.id,
    input: [{"role": "user", "content": "explain why this is funny."}],
    store: true,
});

console.log(secondResponse.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="tell me a joke",
)
print(response.output_text)

second_response = client.responses.create(
    model="gpt-5.5",
    previous_response_id=response.id,
    input=[{"role": "user", "content": "explain why this is funny."}],
)
print(second_response.output_text)
```


在下面的示例中，我们要求模型讲一个笑话。随后，我们单独要求模型解释为什么它好笑，而模型拥有给出良好响应所需的全部上下文。


  使用 Responses API 手动管理对话状态

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "tell me a joke",
    store: true,
});

console.log(response.output_text);

const secondResponse = await openai.responses.create({
    model: "gpt-5.5",
    previous_response_id: response.id,
    input: [{"role": "user", "content": "explain why this is funny."}],
    store: true,
});

console.log(secondResponse.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="tell me a joke",
)
print(response.output_text)

second_response = client.responses.create(
    model="gpt-5.5",
    previous_response_id=response.id,
    input=[{"role": "user", "content": "explain why this is funny."}],
)
print(second_response.output_text)
```


#### WebSocket 模式下的 `previous_response_id`

如果你使用 [Responses API WebSocket 模式](/mirror/api/docs/guides/websocket-mode)，continuation 使用与 HTTP 模式相同的 `previous_response_id` 语义，但会通过持久 socket 和重复的 `response.create` 事件来进行。

连接本地缓存目前会在内存中保留最近的一条 previous response，用于低延迟 continuation。如果无法解析未缓存的 ID，请发送一个新的轮次，将 `previous_response_id` 设为 `null`，并传入完整输入上下文。


  模型响应的数据保留

Response 对象默认保存 30 天。可在 dashboard 的
      [logs](https://platform.openai.com/logs?api=responses) 页面查看，或
      通过 API [retrieved](https://developers.openai.com/api/docs/api-reference/responses/get)。
      你可以在创建 Response 时将 &lt;code&gt;store&lt;/code&gt; 设为 &lt;code&gt;false&lt;/code&gt;
      来停用此行为。

      Conversation 对象及其中的 items 不受 30 天 TTL 约束。任何附加到 conversation 的 response，其 items 都会被持久化，且没有 30 天 TTL。

      未经你的明确同意，OpenAI 不会使用通过 API 发送的数据来训练我们的模型，[了解更多](/mirror/api/docs/guides/your-data)。



即使使用 `previous_response_id`，链中 responses 的所有先前输入 token 仍会在 API 中按输入 token 计费。



## 管理上下文窗口

理解上下文窗口有助于你成功创建线程式对话，并管理模型交互之间的状态。

**上下文窗口**是单次请求中可以使用的最大 token 数。这个最大 token 数包含输入、输出和推理 token。若要了解模型的上下文窗口，请参阅[模型详情](https://developers.openai.com/api/docs/models)。

### 管理文本生成的上下文

随着输入变得更复杂，或者你在对话中包含更多轮次，你需要同时考虑**输出 token** 和**上下文窗口**限制。模型输入和输出都按 [**tokens**](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them) 计量；tokens 会从输入中解析出来，用于分析其内容和意图，并被组合起来渲染逻辑输出。模型在文本生成请求的生命周期内对 token 使用量有上限。

- **输出 token** 是模型响应 prompt 时生成的 token。每个模型都有不同的[输出 token 限制](https://developers.openai.com/api/docs/models)。例如，`gpt-4o-2024-08-06` 最多可以生成 16,384 个输出 token。
- **上下文窗口**描述了可同时用于输入和输出 token（以及某些模型中的[推理 token](/mirror/api/docs/guides/reasoning)）的 token 总量。请比较我们各个模型的[上下文窗口限制](https://developers.openai.com/api/docs/models)。例如，`gpt-4o-2024-08-06` 的总上下文窗口为 128k token。

如果你创建了非常大的 prompt，通常是因为为模型包含了额外上下文、数据或示例，就有可能超出分配给某个模型的上下文窗口，从而导致输出被截断。

使用基于 [tiktoken library](https://github.com/openai/tiktoken) 构建的 [tokenizer tool](https://platform.openai.com/tokenizer)，查看某段文本字符串中有多少 token。



例如，当向 [Responses API](https://developers.openai.com/api/docs/api-reference/responses) 发起 API 请求，并使用启用了推理的模型（如 [o1 model](/mirror/api/docs/guides/reasoning)）时，以下 token 数会计入上下文窗口总量：

- 输入 token（你在 [Responses API](https://developers.openai.com/api/docs/api-reference/responses) 的 `input` 数组中包含的输入）
- 输出 token（响应你的 prompt 而生成的 token）
- 推理 token（模型用于规划响应）


超出上下文窗口限制生成的 token 可能会在 API 响应中被截断。

![context window visualization](https://cdn.openai.com/API/docs/images/context-window.png)

你可以使用 [tokenizer tool](https://platform.openai.com/tokenizer) 估算消息会使用多少 token。



### 压缩

详细的压缩指南现在位于
[Compaction](/mirror/api/docs/guides/compaction)。

- 对于带有 `context_management` 和 `compact_threshold` 的 `/responses`，请参阅
  [Server-side compaction](/mirror/api/docs/guides/compaction#server-side-compaction)。
- 对于显式压缩控制，请参阅
  [Standalone compact endpoint](/mirror/api/docs/guides/compaction#standalone-compact-endpoint)
  和 [`/responses/compact` API reference](https://developers.openai.com/api/docs/api-reference/responses/compact)。

## 后续步骤

如需更具体的示例和用例，请访问 [OpenAI Cookbook](https://developers.openai.com/cookbook)，或进一步了解如何使用 API 扩展模型能力：

-   [使用 Structured Outputs 接收 JSON 响应](/mirror/api/docs/guides/structured-outputs)
-   [通过 function calling 扩展模型](/mirror/api/docs/guides/function-calling)
-   [为实时响应启用 streaming](/mirror/api/docs/guides/streaming-responses)
-   [构建使用计算机的 agent](/mirror/api/docs/guides/tools-computer-use)

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
OpenAI provides a few ways to manage conversation state, which is important for preserving information across multiple messages or turns in a conversation.


  When troubleshooting cases where GPT-5.5 treats an intermediate update as
    the final answer, verify your integration preserves the assistant message
    `phase` field correctly. See [Phase
    parameter](https://developers.openai.com/api/docs/guides/reasoning#phase-parameter) for details.


## Manually manage conversation state

While each text generation request is independent and stateless, you can still implement **multi-turn conversations** by providing additional messages as parameters to your text generation request. Consider a knock-knock joke:



  Manually construct a past conversation

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: [
        { role: "user", content: "knock knock." },
        { role: "assistant", content: "Who's there?" },
        { role: "user", content: "Orange." },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {"role": "user", "content": "knock knock."},
        {"role": "assistant", "content": "Who's there?"},
        {"role": "user", "content": "Orange."},
    ],
)

print(response.output_text)
```



By using alternating `user` and `assistant` messages, you capture the previous state of a conversation in one request to the model.

To manually share context across generated responses, include the model's previous response output as input, and append that input to your next request.

In the following example, we ask the model to tell a joke, followed by a request for another joke. Appending previous responses to new requests in this way helps ensure conversations feel natural and retain the context of previous interactions.




  Manually manage conversation state with the Responses API.

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

let history = [
    {
        role: "user",
        content: "tell me a joke",
    },
];

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: history,
    store: true,
});

console.log(response.output_text);

// Add all response output items, including reasoning items, to the history
history = [...history, ...response.output];

history.push({
    role: "user",
    content: "tell me another",
});

const secondResponse = await openai.responses.create({
    model: "gpt-5.5",
    input: history,
    store: true,
});

console.log(secondResponse.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

history = [
    {
        "role": "user",
        "content": "tell me a joke"
    }
]

response = client.responses.create(
    model="gpt-5.5",
    input=history,
    store=False,
    include=["reasoning.encrypted_content"],
)

print(response.output_text)

# Add all response output items, including encrypted reasoning items, to the conversation
history += response.output

history.append({ "role": "user", "content": "tell me another" })

second_response = client.responses.create(
    model="gpt-5.5",
    input=history,
    store=False,
    include=["reasoning.encrypted_content"],
)

print(second_response.output_text)
```



## OpenAI APIs for conversation state

Our APIs make it easier to manage conversation state automatically, so you don't have to pass inputs manually with each turn of a conversation.





### Using the Conversations API

The [Conversations API](https://developers.openai.com/api/docs/api-reference/conversations/create) works with the [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) to persist conversation state as a long-running object with its own durable identifier. After creating a conversation object, you can keep using it across sessions, devices, or jobs.

Conversations store items, which can be messages, tool calls, tool outputs, and other data.

  Create a conversation

```python
conversation = openai.conversations.create()
```


In a multi-turn interaction, you can pass the `conversation` into subsequent responses to persist state and share context across subsequent responses, rather than having to chain multiple response items together.

  Manage conversation state with Conversations and Responses APIs

```python
response = openai.responses.create(
  model="gpt-5.5",
  input=[{"role": "user", "content": "What are the 5 Ds of dodgeball?"}],
  conversation="conv_689667905b048191b4740501625afd940c7533ace33a2dab"
)
```


### Passing context from the previous response

Another way to manage conversation state is to share context across generated responses with the `previous_response_id` parameter. This parameter lets you chain responses and create a threaded conversation.

  Chain responses across turns by passing the previous response ID

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "tell me a joke",
    store: true,
});

console.log(response.output_text);

const secondResponse = await openai.responses.create({
    model: "gpt-5.5",
    previous_response_id: response.id,
    input: [{"role": "user", "content": "explain why this is funny."}],
    store: true,
});

console.log(secondResponse.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="tell me a joke",
)
print(response.output_text)

second_response = client.responses.create(
    model="gpt-5.5",
    previous_response_id=response.id,
    input=[{"role": "user", "content": "explain why this is funny."}],
)
print(second_response.output_text)
```


In the following example, we ask the model to tell a joke. Separately, we ask the model to explain why it's funny, and the model has all necessary context to deliver a good response.


  Manually manage conversation state with the Responses API

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "tell me a joke",
    store: true,
});

console.log(response.output_text);

const secondResponse = await openai.responses.create({
    model: "gpt-5.5",
    previous_response_id: response.id,
    input: [{"role": "user", "content": "explain why this is funny."}],
    store: true,
});

console.log(secondResponse.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="tell me a joke",
)
print(response.output_text)

second_response = client.responses.create(
    model="gpt-5.5",
    previous_response_id=response.id,
    input=[{"role": "user", "content": "explain why this is funny."}],
)
print(second_response.output_text)
```


#### `previous_response_id` in WebSocket mode

If you are using [the Responses API WebSocket mode](https://developers.openai.com/api/docs/guides/websocket-mode), continuation uses the same `previous_response_id` semantics as HTTP mode, but over a persistent socket with repeated `response.create` events.

The connection-local cache currently keeps the most recent previous response in memory for low-latency continuation. If an uncached ID cannot be resolved, send a new turn with `previous_response_id` set to `null` and pass full input context.

<div style={{ margin: "-16px 0 10px 0" }}>
  Data retention for model responses

Response objects are saved for 30 days by default. They can be viewed in the dashboard 
      [logs](https://platform.openai.com/logs?api=responses) page or 
      [retrieved](https://developers.openai.com/api/docs/api-reference/responses/get) via the API. 
      You can disable this behavior by setting <code>store</code> to <code>false</code>
      when creating a Response.

      Conversation objects and items in them are not subject to the 30 day TTL. Any response attached to a conversation will have its items persisted with no 30 day TTL.

      OpenAI does not use data sent via API to train our models without your explicit consent—[learn more](https://developers.openai.com/api/docs/guides/your-data).
</div>


Even when using `previous_response_id`, all previous input tokens for responses in the chain are billed as input tokens in the API.



## Managing the context window

Understanding context windows will help you successfully create threaded conversations and manage state across model interactions.

The **context window** is the maximum number of tokens that can be used in a single request. This max tokens number includes input, output, and reasoning tokens. To learn your model's context window, see [model details](https://developers.openai.com/api/docs/models).

### Managing context for text generation

As your inputs become more complex, or you include more turns in a conversation, you'll need to consider both **output token** and **context window** limits. Model inputs and outputs are metered in [**tokens**](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them), which are parsed from inputs to analyze their content and intent and assembled to render logical outputs. Models have limits on token usage during the lifecycle of a text generation request.

- **Output tokens** are the tokens generated by a model in response to a prompt. Each model has different [limits for output tokens](https://developers.openai.com/api/docs/models). For example, `gpt-4o-2024-08-06` can generate a maximum of 16,384 output tokens.
- A **context window** describes the total tokens that can be used for both input and output tokens (and for some models, [reasoning tokens](https://developers.openai.com/api/docs/guides/reasoning)). Compare the [context window limits](https://developers.openai.com/api/docs/models) of our models. For example, `gpt-4o-2024-08-06` has a total context window of 128k tokens.

If you create a very large prompt—often by including extra context, data, or examples for the model—you run the risk of exceeding the allocated context window for a model, which might result in truncated outputs.

Use the [tokenizer tool](https://platform.openai.com/tokenizer), built with the [tiktoken library](https://github.com/openai/tiktoken), to see how many tokens are in a particular string of text.



For example, when making an API request to the [Responses API](https://developers.openai.com/api/docs/api-reference/responses) with a reasoning enabled model, like the [o1 model](https://developers.openai.com/api/docs/guides/reasoning), the following token counts will apply toward the context window total:

- Input tokens (inputs you include in the `input` array for the [Responses API](https://developers.openai.com/api/docs/api-reference/responses))
- Output tokens (tokens generated in response to your prompt) 
- Reasoning tokens (used by the model to plan a response)


Tokens generated in excess of the context window limit may be truncated in API responses.

![context window visualization](https://cdn.openai.com/API/docs/images/context-window.png)

You can estimate the number of tokens your messages will use with the [tokenizer tool](https://platform.openai.com/tokenizer).

<a id="compaction-advanced"></a>

### Compaction

Detailed compaction guidance now lives in
[Compaction](https://developers.openai.com/api/docs/guides/compaction).

- For `/responses` with `context_management` and `compact_threshold`, see
  [Server-side compaction](https://developers.openai.com/api/docs/guides/compaction#server-side-compaction).
- For explicit compaction control, see
  [Standalone compact endpoint](https://developers.openai.com/api/docs/guides/compaction#standalone-compact-endpoint)
  and the [`/responses/compact` API reference](https://developers.openai.com/api/docs/api-reference/responses/compact).

## Next steps

For more specific examples and use cases, visit the [OpenAI Cookbook](https://developers.openai.com/cookbook), or learn more about using the APIs to extend model capabilities:

-   [Receive JSON responses with Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
-   [Extend the models with function calling](https://developers.openai.com/api/docs/guides/function-calling)
-   [Enable streaming for real-time responses](https://developers.openai.com/api/docs/guides/streaming-responses)
-   [Build a computer-using agent](https://developers.openai.com/api/docs/guides/tools-computer-use)
``````
:::
:::

