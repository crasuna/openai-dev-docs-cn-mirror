---
status: needs-review
sourceId: "ccd3bd4369f7"
sourceChecksum: "ccd3bd4369f7af0910fabab6e362e8abab1d23ee43241b89ee5797892eba45d0"
sourceUrl: "https://developers.openai.com/api/docs/guides/realtime-costs"
translatedAt: "2026-06-27T18:00:58.7410056+08:00"
translator: codex-gpt-5.5-xhigh
---

# 管理成本

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

Realtime API 支持 [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)，它会自动应用，并且可以显著降低多轮会话中的 input tokens 成本。当某个 Response 的 input tokens 与先前 Response 中的 tokens 匹配时，就会应用缓存，但这是 best-effort 的，并不保证一定命中。

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
