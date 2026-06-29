---
title: "Realtime 转录"
description: "Learn how to transcribe live audio with realtime transcription sessions."
outline: deep
---

# Realtime 转录

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/realtime-transcription](https://developers.openai.com/api/docs/guides/realtime-transcription)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/realtime-transcription.md](https://developers.openai.com/api/docs/guides/realtime-transcription.md)
- 抓取时间：2026-06-27T05:54:06.668Z
- Checksum：`30cf2bae793d888b5e0b5567efd45b09b0f18eba6302182f1e144da2c4b68c48`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
当你的应用需要实时 speech-to-text 且不需要语音助手回复时，请使用实时转录。Realtime 转录会在音频到达时流式传输转录 delta，让用户在完整话语结束前就能看到文本。

如需最低延迟的流式转录路径，请使用 [`gpt-realtime-whisper`](https://developers.openai.com/api/docs/models/gpt-realtime-whisper)。对于离线文件或不需要流式 delta 的工作流，请使用 Audio API 中的标准 speech-to-text 模型。

## 选择转录模型




模型
最适合
说明






          gpt-realtime-whisper


实时音频、转录 delta、可调延迟。
原生流式传输，并专为 Realtime session 设计。



gpt-4o-transcribe

不需要流式传输时更高准确度的 speech-to-text。
用于文件和请求-响应式转录工作流。




          gpt-4o-mini-transcribe


更低成本的转录。
在成本比最高准确度更重要时使用。



whisper-1

现有 Whisper 集成。

        不像
gpt-realtime-whisper
        那样原生流式传输。





`gpt-realtime-whisper` 是实时转录的一个替代选择，并不是对每一种转录模型的全面替代。在切换生产流量前，请根据你的音频、语言、词汇和延迟要求进行测试。

## 创建转录 session

Realtime 转录使用 `type: "transcription"` 的 session。你可以通过 [WebSocket](/mirror/api/docs/guides/realtime-websocket) 连接服务器端音频管线，或通过 [WebRTC](/mirror/api/docs/guides/realtime-webrtc) 连接浏览器音频。

```json
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "format": {
          "type": "audio/pcm",
          "rate": 24000
        },
        "transcription": {
          "model": "gpt-realtime-whisper",
          "language": "en"
        }
      }
    }
  }
}
```


### Session 字段

- `type`：对于仅转录的 session，设置为 `transcription`。
- `audio.input.format`：追加到缓冲区的音频输入编码。发送 `audio/pcm` 时，请使用 24 kHz 单声道 PCM。
- `audio.input.transcription.model`：使用 `gpt-realtime-whisper` 进行流式转录。
- `audio.input.transcription.language`：可选的语言提示，例如 `en`。
- `audio.input.transcription.delay`：`gpt-realtime-whisper` 可选的延迟/准确度权衡。支持的值为 `minimal`、`low`、`medium`、`high` 和 `xhigh`。
- `audio.input.turn_detection`：支持该能力的模型可使用的可选 voice activity detection。对于 `gpt-realtime-whisper`，省略此字段或将其设置为 `null`，然后手动提交音频。

## 流式传输音频

使用 `input_audio_buffer.append` 发送音频分块：

```javascript
ws.send(
  JSON.stringify({
    type: "input_audio_buffer.append",
    audio: base64Pcm16,
  })
);
```


如果你禁用了 turn detection，请在希望开始转录时提交缓冲区：

```javascript
ws.send(
  JSON.stringify({
    type: "input_audio_buffer.commit",
  })
);
```


对于支持服务器 VAD 的模型，session 会在检测到轮次边界时自动提交音频。

## 处理转录事件

监听增量转录 delta 和完成事件：

```javascript
ws.on("message", (data) => {
  const event = JSON.parse(data);

  if (event.type === "conversation.item.input_audio_transcription.delta") {
    process.stdout.write(event.delta);
  }

  if (event.type === "conversation.item.input_audio_transcription.completed") {
    console.log("\nFinal transcript:", event.transcript);
  }
});
```


delta 事件包含新可用的转录文本：

```json
{
  "type": "conversation.item.input_audio_transcription.delta",
  "item_id": "item_003",
  "content_index": 0,
  "delta": "Hello,"
}
```

完成事件包含已提交 item 的最终转录：

```json
{
  "type": "conversation.item.input_audio_transcription.completed",
  "item_id": "item_003",
  "content_index": 0,
  "transcript": "Hello, how are you?"
}
```

不同语音轮次的完成事件之间不保证顺序。使用 `item_id` 将转录事件与已提交的输入 item 匹配。

## 调整延迟和准确度

流式转录会在延迟和转录质量之间取舍。较低的 delay 设置可以更早产出部分文本。较高的 delay 设置会让模型在输出文本前获得更多音频上下文，并可能改善词错误率。

先设置 `audio.input.transcription.delay`，并用真实音频测试。实用的起点包括：

- `minimal`：用于对延迟最敏感的交互；
- `low`：用于低延迟实时字幕；
- `medium`：用于延迟/准确度的均衡取舍；
- `high`：用于准确度比立即显示更重要的情况；
- `xhigh`：用于工作流可以容忍最大延迟以换取更多上下文的情况。

具体延迟毫秒数可能因模型配置而异，因此请使用有代表性的音频做基准测试，而不是假设每个级别都有固定时长。

不要只基于合成音频选择设置。请使用有代表性的麦克风、电话音频、口音、背景噪声、语码转换、领域词汇和长 session 进行测试。

## 引导词汇和领域术语

如果你的应用依赖精确的领域词汇，请包含语言提示，并且仅在所选模型支持时使用 prompt 或关键词引导。对于 GA Realtime sessions 中的 `gpt-realtime-whisper`，不支持 `prompt`。

在可使用 prompt 引导的地方，请使用简短关键词列表，而不是长篇说明。模型已经被指示执行转录，因此 prompt 应聚焦领域词汇、拼写或风格，而不是重复说明转录任务。

关键词风格示例：

```text
Keywords: metoprolol, atorvastatin, A1C, systolic, diastolic
```

在生产环境中，应将关键词引导视为辅助而非保证。继续人工评估姓名、数字、日期、药品名、产品名、艺人名和其他高价值实体。

## 处理置信度、时间戳和说话人分离

只请求你选择的模型和 endpoint 支持的可选字段。如果你的应用需要置信度评分、时间戳或说话人分离，请在发布前验证支持情况，并为不可用字段添加 fallback。

当 log probabilities 可用时，使用 `include` 请求它们：

```json
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "transcription": {
          "model": "gpt-realtime-whisper"
        }
      }
    },
    "include": ["item.input_audio_transcription.logprobs"]
  }
}
```


## 生产清单

- 在调优前选择目标延迟和准确度阈值。
- 使用真实生产音频测试，而不仅是干净样本。
- 测试每一种目标语言。
- 在 eval set 中包含数字、日期、货币、电子邮件地址、产品名和领域术语。
- 将空转录、截断转录和延迟转录与词错误率分开跟踪。
- 决定当后续 delta 修正早先文本时，你的 UI 应如何修订部分文本。
- 使用 `item_id` 对最终转录进行排序和调和。
- 为不支持的时间戳、说话人分离或置信度字段保留 fallback 路径。

## 相关指南


  



    比较语音 agent、翻译和转录 session。





  



    使用专用 translation session 翻译实时语音。





  



    通过服务器端媒体管线流式传输原始音频。





  



    为实时音频流配置 turn detection。




:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Use realtime transcription when your application needs live speech-to-text without a spoken assistant response. Realtime transcription sessions stream transcript deltas as audio arrives, so users can see text before the full utterance is complete.

For the lowest-latency streaming transcription path, use [`gpt-realtime-whisper`](https://developers.openai.com/api/docs/models/gpt-realtime-whisper). For offline files or workflows that don't need streaming deltas, use the standard speech-to-text models in the Audio API.

## Choose a transcription model

<table>
  <thead>
    <tr>
      <th>Model</th>
      <th>Best for</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="whitespace-nowrap">
        <a href="/api/docs/models/gpt-realtime-whisper">
          gpt-realtime-whisper
        </a>
      </td>
      <td>Live audio, transcript deltas, tunable latency.</td>
      <td>Natively streaming and designed for realtime sessions.</td>
    </tr>
    <tr>
      <td className="whitespace-nowrap">
        <a href="/api/docs/models/gpt-4o-transcribe">gpt-4o-transcribe</a>
      </td>
      <td>Higher-accuracy speech-to-text where streaming isn't required.</td>
      <td>Use for file and request-response transcription workflows.</td>
    </tr>
    <tr>
      <td className="whitespace-nowrap">
        <a href="/api/docs/models/gpt-4o-mini-transcribe">
          gpt-4o-mini-transcribe
        </a>
      </td>
      <td>Lower-cost transcription.</td>
      <td>Use when cost matters more than top accuracy.</td>
    </tr>
    <tr>
      <td className="whitespace-nowrap">
        <a href="/api/docs/models/whisper-1">whisper-1</a>
      </td>
      <td>Existing Whisper integrations.</td>
      <td>
        Not natively streaming in the same way as 
        <code>gpt-realtime-whisper</code>.
      </td>
    </tr>
  </tbody>
</table>

`gpt-realtime-whisper` is an alternative for live transcription, not a blanket replacement for every transcription model. Test it against your audio, languages, vocabulary, and latency requirements before switching production traffic.

## Create a transcription session

Realtime transcription uses a session with `type: "transcription"`. You can connect with [WebSocket](https://developers.openai.com/api/docs/guides/realtime-websocket) for server-side audio pipelines or [WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc) for browser audio.

```json
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "format": {
          "type": "audio/pcm",
          "rate": 24000
        },
        "transcription": {
          "model": "gpt-realtime-whisper",
          "language": "en"
        }
      }
    }
  }
}
```


### Session fields

- `type`: Set to `transcription` for transcription-only sessions.
- `audio.input.format`: Input encoding for audio appended to the buffer. Use 24 kHz mono PCM when sending `audio/pcm`.
- `audio.input.transcription.model`: Use `gpt-realtime-whisper` for streaming transcription.
- `audio.input.transcription.language`: Optional language hint such as `en`.
- `audio.input.transcription.delay`: Optional latency/accuracy tradeoff for `gpt-realtime-whisper`. Supported values are `minimal`, `low`, `medium`, `high`, and `xhigh`.
- `audio.input.turn_detection`: Optional voice activity detection for models that support it. For `gpt-realtime-whisper`, omit this field or set it to `null`, then commit audio manually.

## Stream audio

Send audio chunks with `input_audio_buffer.append`:

```javascript
ws.send(
  JSON.stringify({
    type: "input_audio_buffer.append",
    audio: base64Pcm16,
  })
);
```


If you disable turn detection, commit the buffer when you want transcription to begin:

```javascript
ws.send(
  JSON.stringify({
    type: "input_audio_buffer.commit",
  })
);
```


For models that support server VAD, the session commits audio automatically when it detects a turn boundary.

## Handle transcript events

Listen for incremental transcript deltas and completion events:

```javascript
ws.on("message", (data) => {
  const event = JSON.parse(data);

  if (event.type === "conversation.item.input_audio_transcription.delta") {
    process.stdout.write(event.delta);
  }

  if (event.type === "conversation.item.input_audio_transcription.completed") {
    console.log("\nFinal transcript:", event.transcript);
  }
});
```


A delta event contains newly available transcript text:

```json
{
  "type": "conversation.item.input_audio_transcription.delta",
  "item_id": "item_003",
  "content_index": 0,
  "delta": "Hello,"
}
```

A completion event contains the final transcript for the committed item:

```json
{
  "type": "conversation.item.input_audio_transcription.completed",
  "item_id": "item_003",
  "content_index": 0,
  "transcript": "Hello, how are you?"
}
```

Ordering between completion events from different speech turns isn't guaranteed. Use `item_id` to match transcription events to committed input items.

## Tune latency and accuracy

Streaming transcription trades latency for transcript quality. Lower delay settings can produce earlier partial text. Higher delay settings give the model more audio context before emitting text and can improve word error rate.

Start by setting `audio.input.transcription.delay` and testing against your real audio. Useful starting points are:

- `minimal` for the most latency-sensitive interactions;
- `low` for low-latency live captions;
- `medium` for a balanced latency/accuracy tradeoff;
- `high` when accuracy matters more than immediate display;
- `xhigh` when your workflow can tolerate the most delay for additional context.

The exact delay in milliseconds can vary by model configuration, so benchmark with representative audio instead of assuming a fixed timing per level.

Don't choose a setting from synthetic audio alone. Test with representative microphones, telephony audio, accents, background noise, code-switching, domain vocabulary, and long sessions.

## Guide vocabulary and domain terms

If your application depends on exact domain vocabulary, include a language hint and use prompt or keyword steering only when your selected model supports it. For `gpt-realtime-whisper` in GA Realtime sessions, `prompt` is not supported.

Where prompt steering is available, use short keyword lists rather than long instructions. The model is already instructed to transcribe, so focus prompts on domain vocabulary, spelling, or style rather than re-stating the transcription task.

Example keyword style:

```text
Keywords: metoprolol, atorvastatin, A1C, systolic, diastolic
```

For production, treat keyword steering as an aid rather than a guarantee. Continue to evaluate names, numbers, dates, medication names, product names, artist names, and other high-value entities manually.

## Handle confidence, timestamps, and diarization

Only request optional fields that your selected model and endpoint support. If your application needs confidence scoring, timestamps, or diarization, verify support before launch and add fallbacks for fields that aren't available.

When log probabilities are available, request them with `include`:

```json
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "transcription": {
          "model": "gpt-realtime-whisper"
        }
      }
    },
    "include": ["item.input_audio_transcription.logprobs"]
  }
}
```


## Production checklist

- Pick a target latency and accuracy threshold before tuning.
- Test against real production audio, not only clean samples.
- Test each target language.
- Include numbers, dates, currency, email addresses, product names, and domain terms in your eval set.
- Track empty, truncated, and delayed transcripts apart from word error rate.
- Decide how your UI should revise partial text when later deltas correct earlier text.
- Use `item_id` to order and reconcile final transcripts.
- Keep a fallback path for unsupported timestamps, diarization, or confidence fields.

## Related guides

<a href="/api/docs/guides/realtime">
  

<span slot="icon">
      </span>
    Compare voice-agent, translation, and transcription sessions.


</a>

<a href="/api/docs/guides/realtime-translation">
  

<span slot="icon">
      </span>
    Translate live speech with a dedicated translation session.


</a>

<a href="/api/docs/guides/realtime-websocket">
  

<span slot="icon">
      </span>
    Stream raw audio through a server-side media pipeline.


</a>

<a href="/api/docs/guides/realtime-vad">
  

<span slot="icon">
      </span>
    Configure turn detection for live audio streams.


</a>
``````
:::
:::

