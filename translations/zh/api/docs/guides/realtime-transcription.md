---
status: needs-review
sourceId: "30cf2bae793d"
sourceChecksum: "30cf2bae793d888b5e0b5567efd45b09b0f18eba6302182f1e144da2c4b68c48"
sourceUrl: "https://developers.openai.com/api/docs/guides/realtime-transcription"
translatedAt: "2026-06-27T18:23:41.3718846+08:00"
translator: codex-gpt-5.5-xhigh
---

# Realtime 转录

当你的应用需要实时 speech-to-text 且不需要语音助手回复时，请使用实时转录。Realtime 转录会在音频到达时流式传输转录 delta，让用户在完整话语结束前就能看到文本。

如需最低延迟的流式转录路径，请使用 [`gpt-realtime-whisper`](https://developers.openai.com/api/docs/models/gpt-realtime-whisper)。对于离线文件或不需要流式 delta 的工作流，请使用 Audio API 中的标准 speech-to-text 模型。

## 选择转录模型

<table>
  <thead>
    <tr>
      <th>模型</th>
      <th>最适合</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="whitespace-nowrap">
        <a href="/api/docs/models/gpt-realtime-whisper">
          gpt-realtime-whisper
        </a>
      </td>
      <td>实时音频、转录 delta、可调延迟。</td>
      <td>原生流式传输，并专为 Realtime session 设计。</td>
    </tr>
    <tr>
      <td className="whitespace-nowrap">
        <a href="/api/docs/models/gpt-4o-transcribe">gpt-4o-transcribe</a>
      </td>
      <td>不需要流式传输时更高准确度的 speech-to-text。</td>
      <td>用于文件和请求-响应式转录工作流。</td>
    </tr>
    <tr>
      <td className="whitespace-nowrap">
        <a href="/api/docs/models/gpt-4o-mini-transcribe">
          gpt-4o-mini-transcribe
        </a>
      </td>
      <td>更低成本的转录。</td>
      <td>在成本比最高准确度更重要时使用。</td>
    </tr>
    <tr>
      <td className="whitespace-nowrap">
        <a href="/api/docs/models/whisper-1">whisper-1</a>
      </td>
      <td>现有 Whisper 集成。</td>
      <td>
        不像
        <code>gpt-realtime-whisper</code>
        那样原生流式传输。
      </td>
    </tr>
  </tbody>
</table>

`gpt-realtime-whisper` 是实时转录的一个替代选择，并不是对每一种转录模型的全面替代。在切换生产流量前，请根据你的音频、语言、词汇和延迟要求进行测试。

## 创建转录 session

Realtime 转录使用 `type: "transcription"` 的 session。你可以通过 [WebSocket](https://developers.openai.com/api/docs/guides/realtime-websocket) 连接服务器端音频管线，或通过 [WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc) 连接浏览器音频。

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

<a href="/api/docs/guides/realtime">
  

<span slot="icon">
      </span>
    比较语音 agent、翻译和转录 session。


</a>

<a href="/api/docs/guides/realtime-translation">
  

<span slot="icon">
      </span>
    使用专用 translation session 翻译实时语音。


</a>

<a href="/api/docs/guides/realtime-websocket">
  

<span slot="icon">
      </span>
    通过服务器端媒体管线流式传输原始音频。


</a>

<a href="/api/docs/guides/realtime-vad">
  

<span slot="icon">
      </span>
    为实时音频流配置 turn detection。


</a>
