---
title: "管理成本"
description: "Learn how to monitor and optimize your costs when using the Realtime API."
outline: deep
---

# 管理成本

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/realtime-costs](https://developers.openai.com/api/docs/guides/realtime-costs)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/realtime-costs.md](https://developers.openai.com/api/docs/guides/realtime-costs.md)
- 抓取时间：2026-06-27T05:54:05.907Z
- Checksum：`ccd3bd4369f7af0910fabab6e362e8abab1d23ee43241b89ee5797892eba45d0`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
本文说明 Realtime API 的计费方式，并提供优化成本的策略。语音代理会话会在 text、audio 和 image 模态中累积 input 和 output tokens。流式翻译和流式转录会话按音频时长计费。价格因模型而异，具体价格列在模型页面中（例如 [`gpt-realtime-2`](https://developers.openai.com/api/docs/models/gpt-realtime-2)、[`gpt-realtime-translate`](https://developers.openai.com/api/docs/models/gpt-realtime-translate)、[`gpt-realtime-whisper`](https://developers.openai.com/api/docs/models/gpt-realtime-whisper) 和 [`gpt-realtime`](https://developers.openai.com/api/docs/models/gpt-realtime)）。

对话式 Realtime API 会话由一系列 _turns_ 组成，在每个 turn 中，用户添加输入并触发一个 _Response_ 来生成模型输出。服务器维护一个 _Conversation_，它是由一组 _Items_ 组成的列表，会成为下一轮的输入。当返回 Response 时，输出会自动添加到 Conversation 中。

翻译和转录会话使用不同的流式架构。客户端持续流式传输音频，并在源音频到达时接收翻译后的音频、转录增量或转录事件。这些会话不使用常规 Response 生命周期，因此应使用按时长计费的费率来估算和监控，而不是使用每个 Response 的 token 用量。

## 每个 Response 的成本

Realtime API 成本会在创建 Response 时累积，并根据 input 和 output token 数量计费（输入转录成本除外，见下文）。目前不会对网络带宽或连接收费。如果开启了语音活动检测（VAD），Response 可以手动创建，也可以自动创建。VAD 会有效过滤空白输入音频，因此空音频不会计为 input tokens，除非客户端手动将其添加为 conversation input。

每个 Response 都会把整个 conversation 发送给模型。某个 turn 的输出会作为 Items 添加到服务器端 Conversation 中，并成为后续 turn 的输入，因此会话越往后，turn 的成本通常越高。

可以使用我们的 [tokenization tools](https://platform.openai.com/tokenizer) 估算文本 token 成本。用户消息中的 audio tokens 按每 100 ms 音频 1 个 token 计算，而 assistant 消息中的 audio tokens 按每 50ms 音频 1 个 token 计算。请注意，token 数量除了消息内容之外还包括特殊 tokens，这会在计数中表现为小幅差异；例如，内容含 10 个 text tokens 的用户消息可能会计为 12 个 tokens。

### 示例

下面用一个简单示例说明多轮 Realtime API 会话中的 token 成本。

在 conversation 的第一轮中，我们添加了 100 tokens 的 instructions，以及一条 20 audio tokens 的用户消息（例如由 VAD 根据用户说话自动添加），input tokens 总计 120。创建 Response 后会生成一条 assistant output message（20 audio、10 text tokens）。

然后我们用另一条用户音频消息创建第二轮。第 2 轮的 tokens 会是什么样？此时 Conversation 包含初始 instructions、第一条用户消息、第一轮输出的 assistant message，以及第二条用户消息（25 audio tokens）。这一轮会有 110 text 和 64 audio tokens 作为输入，另外还会有另一条 assistant output message 的 output tokens。

![tokens on successive conversation turns](https://cdn.openai.com/API/docs/images/realtime-costs-turns.png)

第一轮中的消息很可能会在第 2 轮被缓存，从而降低输入成本。关于缓存的更多信息见下文。

Response 使用的 tokens 可以从 `response.done` 事件中读取，该事件如下所示。

```json
{
  "type": "response.done",
  "response": {
    ...
    "usage": {
      "total_tokens": 253,
      "input_tokens": 132,
      "output_tokens": 121,
      "input_token_details": {
        "text_tokens": 119,
        "audio_tokens": 13,
        "image_tokens": 0,
        "cached_tokens": 64,
        "cached_tokens_details": {
          "text_tokens": 64,
          "audio_tokens": 0,
          "image_tokens": 0
        }
      },
      "output_token_details": {
        "text_tokens": 30,
        "audio_tokens": 91
      }
    }
  }
}
```

## 输入转录成本

除了对话式 Responses 之外，如果启用了输入转录，Realtime API 也会对其计费。输入转录使用与 speech2speech 模型不同的模型，例如 [`whisper-1`](https://developers.openai.com/api/docs/models/whisper-1) 或 [`gpt-4o-transcribe`](https://developers.openai.com/api/docs/models/gpt-4o-transcribe)，因此会按不同的 rate card 计费。转录会在音频写入 input audio buffer 并提交时执行，提交可以手动完成，也可以由 VAD 完成。

输入转录 token 数量可以从 `conversation.item.input_audio_transcription.completed` 事件中读取，如下例所示。

```json
{
  "type": "conversation.item.input_audio_transcription.completed",
  ...
  "transcript": "Hi, can you hear me?",
  "usage": {
    "type": "tokens",
    "total_tokens": 26,
    "input_tokens": 17,
    "input_token_details": {
      "text_tokens": 0,
      "audio_tokens": 17
    },
    "output_tokens": 9
  }
}
```

## 缓存

Realtime API 支持 [prompt caching](/mirror/api/docs/guides/prompt-caching)，它会自动应用，并且可以显著降低多轮会话中的 input tokens 成本。当某个 Response 的 input tokens 与先前 Response 中的 tokens 匹配时，就会应用缓存，但这是 best-effort 的，并不保证一定命中。

最大化缓存率的最佳策略是保持会话历史静态。移除或更改 conversation 中的内容会在变更点之前“打破”缓存，因为输入不再像之前那样匹配。请注意，instructions 和工具定义位于 conversation 开头，因此在会话中途更改它们会降低后续 turn 的缓存率。

## 截断

当 conversation 中的 token 数量超过模型的输入 token 上限时，conversation 会被截断，也就是 messages（从最旧的开始）会从 Response 输入中被丢弃。一个 32k context 模型如果最大 output tokens 为 4,096，则在发生截断前，context 中最多只能包含 28,224 tokens。

客户端可以设置一个小于模型最大值的 token window，这是控制 token 用量和成本的好方法。它由 `token_limits.post_instructions` 配置控制（如果你按下方所示使用 `retention_ratio` 类型配置截断）。顾名思义，它控制某个 Response 的最大 input tokens 数量，但不包括 instruction tokens。将 `post_instructions` 设置为 1,000 表示超过 1,000 input token 限制的 items 不会为了某个 Response 发送给模型。

截断会在 conversation 接近开头的位置打破缓存；如果每个 turn 都发生截断，则缓存率会很低。为缓解这个问题，客户端可以配置截断，让它丢弃比必要数量更多的 messages，从而在下次需要截断前留出更多余量。这可以通过 `session.truncation.retention_ratio` 设置控制。服务器默认值为 `1.0`，表示截断只会移除必要的 items。值为 `0.8` 表示一次截断会保留最大值的 80%，额外丢弃 20%。

如果你希望降低每个会话的 Realtime API 成本（在给定模型下），我们建议减少 token 数量限制，并将 `retention_ratio` 设置为小于 1，如下例所示。请记住，这里可能存在权衡：成本更低，但模型在给定 turn 中的记忆更少。

```json
{
  "event": "session.update",
  "session": {
    "truncation": {
      "type": "retention_ratio",
      "retention_ratio": 0.8,
      "token_limits": {
        "post_instructions": 8000
      }
    }
  }
}
```

也可以完全禁用截断，如下所示。禁用后，如果 Conversation 太长而无法创建 Response，将返回错误。如果你打算手动管理 Conversation 大小，这可能会有用。

```json
{
  "event": "session.update",
  "session": {
    "truncation": "disabled"
  }
}
```

## 其他优化策略

### 使用 mini 模型

Realtime speech2speech 模型有“normal”尺寸和 mini 尺寸，mini 显著更便宜。这里的取舍通常与指令遵循和 function calling 的智能表现有关，mini 模型在这些方面不会同样有效。我们建议先用较大的模型测试应用，完善应用和 prompt，然后再尝试使用 mini 模型进行优化。

### 编辑 Conversation

虽然服务器会自动发生截断，但另一种成本管理策略是手动编辑 Conversation。该 API 的一项原则是允许客户端完全控制服务器端 Conversation，让客户端可以按需添加和移除 items。

```json
{
  "type": "conversation.item.delete",
  "item_id": "item_CCXLecNJVIVR2HUy3ABLj"
}
```

清理旧 messages 是降低 input token 大小和成本的好方法。这可能会移除重要内容，但一种常见策略是用摘要替换这些旧 messages。可以使用上面的 `conversation.item.delete` message 从 Conversation 中删除 items，也可以使用 `conversation.item.create` message 添加 items。

## 估算成本

鉴于 Realtime API token 用量的复杂性，提前估算成本可能很困难。一个好方法是使用 Realtime Playground，配合你计划使用的 prompts 和 functions，在一个样本会话中测量 token 用量。会话的 token 用量可以在 Realtime Playground 的 Logs 标签页中，在 session id 旁边找到。

![showing tokens in the playground](https://cdn.openai.com/API/docs/images/realtime-playground-tokens.png)

:::

## English source

::: details 展开英文原文
::: v-pre
This document describes how Realtime API billing works and offers strategies for optimizing costs. Voice-agent sessions accrue input and output tokens across text, audio, and image modalities. Streaming translation and streaming transcription sessions are billed by audio duration. Prices vary per model, with prices listed on the model pages (for example, [`gpt-realtime-2`](https://developers.openai.com/api/docs/models/gpt-realtime-2), [`gpt-realtime-translate`](https://developers.openai.com/api/docs/models/gpt-realtime-translate), [`gpt-realtime-whisper`](https://developers.openai.com/api/docs/models/gpt-realtime-whisper), and [`gpt-realtime`](https://developers.openai.com/api/docs/models/gpt-realtime)).

Conversational Realtime API sessions are a series of _turns_, where the user adds input that triggers a _Response_ to produce the model output. The server maintains a _Conversation_, which is a list of _Items_ that form the input for the next turn. When a Response is returned, the output is automatically added to the Conversation.

Translation and transcription sessions use a different streaming architecture. The client streams audio continuously and receives translated audio, transcript deltas, or transcript events as the source audio arrives. These sessions don't use the normal Response lifecycle, so estimate and monitor them with their duration-based rates instead of per-Response token usage.

## Per-Response costs

Realtime API costs are accrued when a Response is created, and is charged based on the numbers of input and output tokens (except for input transcription costs, see below). There is no cost currently for network bandwidth or connections. A Response can be created manually or automatically if voice activity detection (VAD) is turned on. VAD will effectively filter out empty input audio, so empty audio doesn't count as input tokens unless the client manually adds it as conversation input.

The entire conversation is sent to the model for each Response. The output from a turn will be added as Items to the server Conversation and become the input to subsequent turns, thus turns later in the session will be more expensive.

Text token costs can be estimated using our [tokenization tools](https://platform.openai.com/tokenizer). Audio tokens in user messages are 1 token per 100 ms of audio, while audio tokens in assistant messages are 1 token per 50ms of audio. Note that token counts include special tokens aside from the content of a message which will surface as small variations in these counts, for example a user message with 10 text tokens of content may count as 12 tokens.

### Example

Here’s a simple example to illustrate token costs over a multi-turn Realtime API session.

For the first turn in the conversation we’ve added 100 tokens of instructions, a user message of 20 audio tokens (for example added by VAD based on the user speaking), for a total of 120 input tokens. Creating a Response generates an assistant output message (20 audio, 10 text tokens).

Then we create a second turn with another user audio message. What will the tokens for turn 2 look like? The Conversation at this point includes the initial instructions, first user message, the output assistant message from the first turn, plus the second user message (25 audio tokens). This turn will have 110 text and 64 audio tokens for input, plus the output tokens of another assistant output message.

![tokens on successive conversation turns](https://cdn.openai.com/API/docs/images/realtime-costs-turns.png)

The messages from the first turn are likely to be cached for turn 2, which reduces the input cost. See below for more information on caching.

The tokens used for a Response can be read from the `response.done` event, which looks like the following.

```json
{
  "type": "response.done",
  "response": {
    ...
    "usage": {
      "total_tokens": 253,
      "input_tokens": 132,
      "output_tokens": 121,
      "input_token_details": {
        "text_tokens": 119,
        "audio_tokens": 13,
        "image_tokens": 0,
        "cached_tokens": 64,
        "cached_tokens_details": {
          "text_tokens": 64,
          "audio_tokens": 0,
          "image_tokens": 0
        }
      },
      "output_token_details": {
        "text_tokens": 30,
        "audio_tokens": 91
      }
    }
  }
}
```

## Input transcription costs

Aside from conversational Responses, the Realtime API bills for input transcriptions, if enabled. Input transcription uses a different model than the speech2speech model, such as [`whisper-1`](https://developers.openai.com/api/docs/models/whisper-1) or [`gpt-4o-transcribe`](https://developers.openai.com/api/docs/models/gpt-4o-transcribe), and thus are billed from a different rate card. Transcription is performed when audio is written to the input audio buffer and then committed, either manually or by VAD.

Input transcription token counts can be read from the `conversation.item.input_audio_transcription.completed` event, as in the following example.

```json
{
  "type": "conversation.item.input_audio_transcription.completed",
  ...
  "transcript": "Hi, can you hear me?",
  "usage": {
    "type": "tokens",
    "total_tokens": 26,
    "input_tokens": 17,
    "input_token_details": {
      "text_tokens": 0,
      "audio_tokens": 17
    },
    "output_tokens": 9
  }
}
```

## Caching

Realtime API supports [prompt caching](/mirror/api/docs/guides/prompt-caching), which is applied automatically and can dramatically reduce the costs of input tokens during multi-turn sessions. Caching applies when the input tokens of a Response match tokens from a previous Response, though this is best-effort and not guaranteed.

The best strategy for maximizing cache rate is keep a session’s history static. Removing or changing content in the conversation will “bust” the cache up to the point of the change — the input no longer matches as much as before. Note that instructions and tool definitions are at the beginning of a conversation, thus changing these mid-session will reduce the cache rate for subsequent turns.

## Truncation

When the number of tokens in a conversation exceeds the model's input token limit the conversation be truncated, meaning messages (starting from the oldest) will be dropped from the Response input. A 32k context model with 4,096 max output tokens can only include 28,224 tokens in the context before truncation occurs.

Clients can set a smaller token window than the model’s maximum, which is a good way to control token usage and cost. This is controlled with the `token_limits.post_instructions` configuration (if you configure truncation with a `retention_ratio` type as shown below). As the name indicates, this controls the maximum number of input tokens for a Response, except for the instruction tokens. Setting `post_instructions` to 1,000 means that items over the 1,000 input token limit won't be sent to the model for a Response.

Truncation busts the cache near the beginning of the conversation, and if truncation occurs on every turn then cache rate will be very low. To mitigate this issue clients can configure truncation to drop more messages than necessary, which will extend the headroom before another truncation is needed. This can be controlled with the `session.truncation.retention_ratio` setting. The server defaults to a value of `1.0` , meaning truncation will remove only the items necessary. A value of `0.8` means a truncation would retain 80% of the maximum, dropping an additional 20%.

If you’re attempting to reduce Realtime API cost per session (for a given model), we recommend reducing limiting the number of tokens and setting a `retention_ratio` less than 1, as in the following example. Remember that there may be a tradeoff here in terms of lower cost but lower model memory for a given turn.

```json
{
  "event": "session.update",
  "session": {
    "truncation": {
      "type": "retention_ratio",
      "retention_ratio": 0.8,
      "token_limits": {
        "post_instructions": 8000
      }
    }
  }
}
```

Truncation can also be completely disabled, as shown below. When disabled an error will be returned if the Conversation is too long to create a Response. This may be useful if you intend to manage the Conversation size manually.

```json
{
  "event": "session.update",
  "session": {
    "truncation": "disabled"
  }
}
```

## Other optimization strategies

### Using a mini model

The Realtime speech2speech models come in a “normal” size and a mini size, which is significantly cheaper. The tradeoff here tends to be intelligence related to instruction following and function calling, which won't be as effective in the mini model. We recommend first testing applications with the larger model, refining your application and prompt, then attempting to optimize using the mini model.

### Editing the Conversation

While truncation will occur automatically on the server, another cost management strategy is to manually edit the Conversation. A principle of the API is to allow full client control of the server-side Conversation, allowing the client to add and remove items at will.

```json
{
  "type": "conversation.item.delete",
  "item_id": "item_CCXLecNJVIVR2HUy3ABLj"
}
```

Clearing out old messages is a good way to reduce input token sizes and cost. This might remove important content, but a common strategy is to replace these old messages with a summary. Items can be deleted from the Conversation with a `conversation.item.delete` message as above, and can be added with a `conversation.item.create` message.

## Estimating costs

Given the complexity in Realtime API token usage it can be difficult to estimate your costs ahead of time. A good approach is to use the Realtime Playground with your intended prompts and functions, and measure the token usage over a sample session. The token usage for a session can be found under the Logs tab in the Realtime Playground next to the session id.

![showing tokens in the playground](https://cdn.openai.com/API/docs/images/realtime-playground-tokens.png)

:::
:::

