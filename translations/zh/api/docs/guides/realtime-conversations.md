---
status: needs-review
sourceId: "4e7f1dd8803a"
sourceChecksum: "4e7f1dd8803aa13a9d7583b137be3d82a8c726c717a699b936f18dcb62317b31"
sourceUrl: "https://developers.openai.com/api/docs/guides/realtime-conversations"
translatedAt: "2026-06-27T18:23:41.3718846+08:00"
translator: codex-gpt-5.5-xhigh
---

# Realtime 对话

通过 [WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc) 或 [WebSocket](https://developers.openai.com/api/docs/guides/realtime-websocket) 连接到 Realtime API 后，你可以调用 Realtime model（例如 [`gpt-realtime-2`](https://developers.openai.com/api/docs/models/gpt-realtime-2)）进行语音到语音对话。这样做需要你**发送客户端事件**来发起操作，并**监听服务器事件**来响应 Realtime API 执行的操作。

本指南会介绍使用音频和文本生成、图像输入、function calling 等模型能力所需的事件流，以及如何理解 Realtime Session 的状态。

如果你不需要与模型对话，也就是说你不
  期待任何 response，可以在[转录
  模式](https://developers.openai.com/api/docs/guides/realtime-transcription)下使用 Realtime API。

## Realtime 语音到语音 session

Realtime Session 是模型与已连接客户端之间的有状态交互。session 的关键组件包括：

- **Session** 对象，它控制交互参数，例如所用模型、用于生成输出的 voice，以及其他配置。
- **Conversation**，表示当前 session 期间生成的用户输入 Items 和模型输出 Items。
- **Responses**，即模型生成的音频或文本 Items，它们会被添加到 Conversation。

**Input audio buffer 和 WebSockets**

如果你使用 WebRTC，发送和接收模型音频所需的大部分媒体处理都会由 WebRTC APIs 辅助完成。

<br/>
如果你通过 WebSockets 处理音频，则需要手动与 **input audio buffer** 交互：通过带有 base64 编码音频的 JSON events 将音频发送到服务器。

所有这些组件共同构成 Realtime Session。你会使用客户端事件更新 session 状态，并监听服务器事件以响应 session 内部的状态变化。

![diagram realtime state](https://openaidevs.retool.com/api/file/11fe71d2-611e-4a26-a587-881719a90e56)

## Session 生命周期事件

通过 [WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc) 或 [WebSockets](https://developers.openai.com/api/docs/guides/realtime-websockets) 发起 session 后，服务器会发送 [`session.created`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/session/created) 事件，表示 session 已准备就绪。在客户端，你可以使用 [`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update) 事件更新当前 session 配置。大多数 session 属性都可以随时更新，唯一例外是模型用于音频输出的 `voice`：一旦模型在该 session 中已经用音频响应过一次，就不能再更新。Realtime session 的最长持续时间为 **60 分钟**。

下面的示例展示了如何用 `session.update` 客户端事件更新 session。关于如何通过这些通道发送客户端事件，请参阅 [WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc#sending-and-receiving-events) 或 [WebSocket](https://developers.openai.com/api/docs/guides/realtime-websocket#sending-and-receiving-events) 指南。

更新此 session 中模型使用的系统指令

```javascript
const event = {
  type: "session.update",
  session: {
      type: "realtime",
      model: "gpt-realtime-2",
      // Lock the output to audio (set to ["text"] if you want text without audio)
      output_modalities: ["audio"],
      audio: {
        input: {
          format: {
            type: "audio/pcm",
            rate: 24000,
          },
          turn_detection: {
            type: "semantic_vad"
          }
        },
        output: {
          format: {
            type: "audio/pcm",
          },
          voice: "marin",
        }
      },
      // Use a server-stored prompt by ID. Optionally pin a version and pass variables.
      prompt: {
        id: "pmpt_123",          // your stored prompt ID
        version: "89",           // optional: pin a specific version
        variables: {
          city: "Paris"          // example variable used by your prompt
        }
      },
      // You can still set direct session fields; these override prompt fields if they overlap:
      instructions: "Speak clearly and briefly. Confirm understanding before taking actions."
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
event = {
    "type": "session.update",
    session: {
      type: "realtime",
      model: "gpt-realtime-2",
      # Lock the output to audio (add "text" if you also want text)
      output_modalities: ["audio"],
      audio: {
        input: {
          format: {
            type: "audio/pcm",
            rate: 24000,
          },
          turn_detection: {
            type: "semantic_vad"
          }
        },
        output: {
          format: {
            type: "audio/pcmu",
          },
          voice: "marin",
        }
      },
      # Use a server-stored prompt by ID. Optionally pin a version and pass variables.
      prompt: {
        id: "pmpt_123",          // your stored prompt ID
        version: "89",           // optional: pin a specific version
        variables: {
          city: "Paris"          // example variable used by your prompt
        }
      },
      # You can still set direct session fields; these override prompt fields if they overlap:
      instructions: "Speak clearly and briefly. Confirm understanding before taking actions."
    }
}
ws.send(json.dumps(event))
```


session 更新后，服务器会发出 [`session.updated`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/session/updated) 事件，其中包含 session 的新状态。

<table>
  <tr>
    <th>相关客户端事件</th>
    <th>相关服务器事件</th>
  </tr>
  <tr>
    <td>
      [`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update)
    </td>
    <td>
      [`session.created`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/session/created)
      <div />
      [`session.updated`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/session/updated)
    </td>
  </tr>
</table>

## 文本输入和输出

要使用 Realtime model 生成文本，可以向当前 conversation 添加文本输入，要求模型生成 response，并监听服务器发送的事件以了解模型 response 的进度。为了生成文本，[session 必须配置](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update)为包含 `text` modality（默认即如此）。

使用 [`conversation.item.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/conversation/item/create) 客户端事件创建新的文本 conversation item。这类似于在 REST API 中发送 [Chat Completions 的用户消息（prompt）](https://developers.openai.com/api/docs/guides/text-generation)。

创建包含用户输入的 conversation item

```javascript
const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_text",
        text: "What Prince album sold the most copies?",
      }
    ]
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
event = {
    "type": "conversation.item.create",
    "item": {
        "type": "message",
        "role": "user",
        "content": [
            {
                "type": "input_text",
                "text": "What Prince album sold the most copies?",
            }
        ]
    }
}
ws.send(json.dumps(event))
```


将用户消息添加到 conversation 后，发送 [`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 事件来启动模型 response。如果当前 session 同时启用了音频和文本，模型会同时以音频和文本内容响应。如果你只想生成文本，可以在发送 `response.create` 客户端事件时指定，如下所示。

生成仅文本 response

```javascript
const event = {
  type: "response.create",
  response: {
    output_modalities: [ "text" ]
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
event = {
    "type": "response.create",
    "response": {
        "output_modalities": [ "text" ]
    }
}
ws.send(json.dumps(event))
```


response 完全结束时，服务器会发出 [`response.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/done) 事件。该事件会包含模型生成的完整文本，如下所示。

监听 response.done 以查看最终结果

```javascript
function handleEvent(e) {
  const serverEvent = JSON.parse(e.data);
  if (serverEvent.type === "response.done") {
    console.log(serverEvent.response.output[0]);
  }
}

// Listen for server messages (WebRTC)
dataChannel.addEventListener("message", handleEvent);

// Listen for server messages (WebSocket)
// ws.on("message", handleEvent);
```

```python
def on_message(ws, message):
    server_event = json.loads(message)
    if server_event.type == "response.done":
        print(server_event.response.output[0])
```


在模型 response 生成期间，服务器会在过程中发出许多生命周期事件。你可以监听这些事件，例如 [`response.output_text.delta`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_text/delta)，以便在 response 生成时向用户提供实时反馈。服务器发出的完整事件列表位于下方的**相关服务器事件**中。它们大致按发出顺序列出，并附带文本生成相关的客户端事件。

<table>
  <tr>
    <th>相关客户端事件</th>
    <th>相关服务器事件</th>
  </tr>
  <tr>
    <td>
      [`conversation.item.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/conversation/item/create)
      <div />
      [`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create)
    </td>
    <td>
      [`conversation.item.added`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/conversation/item/added)
      <div />
      [`conversation.item.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/conversation/item/done)
      <div />
      [`response.created`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/created)
      <div />
      [`response.output_item.added`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_item/added)
      <div />
      [`response.content_part.added`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/content_part/added)
      <div />
      [`response.output_text.delta`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_text/delta)
      <div />
      [`response.output_text.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_text/done)
      <div />
      [`response.content_part.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/content_part/done)
      <div />
      [`response.output_item.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_item/done)
      <div />
      [`response.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/done)
      <div />
      [`rate_limits.updated`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/rate_limits/updated)
    </td>
  </tr>
</table>

## 音频输入和输出

Realtime API 最强大的功能之一，是无需中间 text-to-speech 或 speech-to-text 步骤即可与模型进行语音到语音交互。这可以为语音界面降低延迟，并让模型围绕语音输入的语气和抑扬获得更多数据。

### Voice 选项

Realtime sessions 可以配置为在生成音频输出时使用若干内置 voices 之一。你可以在 session 创建时（或在 `response.create` 上）设置 `voice`，以控制模型的声音。当前 voice 选项包括 `alloy`、`ash`、`ballad`、`coral`、`echo`、`sage`、`shimmer`、`verse`、`marin` 和 `cedar`。一旦模型在 session 中发出了音频，就不能再为该 session 修改 `voice`。为了获得最佳质量，我们建议使用 `marin` 或 `cedar`。

### 使用 WebRTC 处理音频

如果你使用 WebRTC 连接到 Realtime API，Realtime API 会作为面向你客户端的 [peer connection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection)。模型的音频输出会作为 [remote media stream](hhttps://developer.mozilla.org/en-US/docs/Web/API/MediaStream) 传递给你的客户端。模型的音频输入则通过音频设备（[`getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)）采集，媒体流会作为 tracks 添加到 peer connection。

[WebRTC 连接指南](https://developers.openai.com/api/docs/guides/realtime-webrtc)中的示例代码展示了使用浏览器 APIs 配置本地和远程音频的基础示例：

```javascript
// Create a peer connection
const pc = new RTCPeerConnection();

// Set up to play remote audio from the model
const audioEl = document.createElement("audio");
audioEl.autoplay = true;
pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);

// Add local audio track for microphone input in the browser
const ms = await navigator.mediaDevices.getUserMedia({
  audio: true,
});
pc.addTrack(ms.getTracks()[0]);
```


上面的代码片段支持与 Realtime API 的简单交互，但你还能做得更多。有关不同类型用户界面的更多示例，请查看 [WebRTC samples](https://github.com/webrtc/samples) 仓库。这些示例的在线 demo 也可在[这里](https://webrtc.github.io/samples/)找到。

在浏览器中使用 [media captures and streams](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API) 可以实现诸如静音和取消麦克风静音、选择从哪个设备采集输入等功能。

### WebRTC 中音频的客户端和服务器事件

默认情况下，WebRTC 客户端在发送音频输入前不需要向 Realtime API 发送任何客户端事件。一旦本地 audio track 添加到 peer connection，你的用户就可以直接开始说话！

不过，当音频通过 peer connection 在客户端和服务器之间来回传输时，WebRTC 客户端仍会接收许多服务器发送的生命周期事件。示例包括：

- 当输入通过本地 media track 发送时，你会从服务器收到 [`input_audio_buffer.speech_started`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/input_audio_buffer/speech_started) 事件。
- 当本地音频输入停止时，你会收到 [`input_audio_buffer.speech_stopped`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/input_audio_buffer/speech_started) 事件。
- 你会收到[进行中的音频转录的 delta events](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_audio_transcript/delta)。
- 当模型完成转录并完成发送 response 时，你会收到 [`response.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/done) 事件。

操作用于媒体流的 WebRTC APIs 可能已经能给你所需的全部控制。不过，偶尔可能需要使用更底层的音频输入和输出接口。更多信息以及精细音频输入处理所需事件列表，请参阅下面的 WebSockets 部分。

### 使用 WebSockets 处理音频

通过 WebSocket 发送和接收音频时，为了从客户端发送媒体并从服务器接收媒体，你需要多做一些工作。下面的表格描述了 WebSocket session 中发送和接收 WebSocket 音频所需的事件流。

下面的事件按生命周期顺序给出，不过某些事件（例如 `delta` 事件）可能并发发生。

<table>
  <tr>
    <th>生命周期阶段</th>
    <th>客户端事件</th>
    <th>服务器事件</th>
  </tr>
  <tr>
    <td>Session 初始化</td>
    <td>
      [`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update)
    </td>
    <td>
      [`session.created`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/session/created)
      <div />
      [`session.updated`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/session/updated)
    </td>
  </tr>
  <tr>
    <td>用户音频输入</td>
    <td>
      [`conversation.item.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/conversation/item/create)
      <br />
      &nbsp;&nbsp;（发送完整音频消息）
      <div />
      [`input_audio_buffer.append`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/input_audio_buffer/append)
      <br />
      &nbsp;&nbsp;（以分块方式流式传输音频）
      <div />
      [`input_audio_buffer.commit`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/input_audio_buffer/commit)
      <br />
      &nbsp;&nbsp;（在 VAD 禁用时使用）
      <div />
      [`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create)
      <br />
      &nbsp;&nbsp;（在 VAD 禁用时使用）
    </td>
    <td>
      [`input_audio_buffer.speech_started`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/input_audio_buffer/speech_started)
      <div />
      [`input_audio_buffer.speech_stopped`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/input_audio_buffer/speech_stopped)
      <div />
      [`input_audio_buffer.committed`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/input_audio_buffer/committed)
    </td>
  </tr>
  <tr>
    <td>服务器音频输出</td>
    <td>
      [`input_audio_buffer.clear`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/input_audio_buffer/clear)
      <br />
      &nbsp;&nbsp;（在 VAD 禁用时使用）
    </td>
    <td>
      [`conversation.item.added`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/conversation/item/added)
      <div />
      [`conversation.item.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/conversation/item/done)
      <div />
      [`response.created`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/created)
      <div />
      [`response.output_item.created`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_item/created)
      <div />
      [`response.content_part.added`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/content_part/added)
      <div />
      [`response.output_audio.delta`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_audio/delta)
      <div />
      [`response.output_audio.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_audio/done)
      <div />
      [`response.output_audio_transcript.delta`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_audio_transcript/delta)
      <div />
      [`response.output_audio_transcript.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_audio_transcript/done)
      <div />
      [`response.output_text.delta`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_text/delta)
      <div />
      [`response.output_text.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_text/done)
      <div />
      [`response.content_part.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/content_part/done)
      <div />
      [`response.output_item.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_item/done)
      <div />
      [`response.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/done)
      <div />
      [`rate_limits.updated`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/rate_limits/updated)
    </td>
  </tr>
</table>

### 将音频输入流式传输到服务器

要将音频输入流式传输到服务器，可以使用 [`input_audio_buffer.append`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/input_audio_buffer/append) 客户端事件。该事件要求你通过 socket 向 Realtime API 发送 **Base64 编码的音频字节**分块。每个分块大小不能超过 15 MB。

输入分块的格式可以为整个 session 配置，也可以按 response 配置。

- Session：[`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update) 中的 `session.input_audio_format`
- Response：[`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 中的 `response.input_audio_format`

向 conversation 追加音频输入字节

```javascript
import fs from 'fs';
import decodeAudio from 'audio-decode';

// Converts Float32Array of audio data to PCM16 ArrayBuffer
function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

// Converts a Float32Array to base64-encoded PCM16 data
base64EncodeAudio(float32Array) {
  const arrayBuffer = floatTo16BitPCM(float32Array);
  let binary = '';
  let bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000; // 32KB chunk size
  for (let i = 0; i < bytes.length; i += chunkSize) {
    let chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

// Fills the audio buffer with the contents of three files,
// then asks the model to generate a response.
const files = [
  './path/to/sample1.wav',
  './path/to/sample2.wav',
  './path/to/sample3.wav'
];

for (const filename of files) {
  const audioFile = fs.readFileSync(filename);
  const audioBuffer = await decodeAudio(audioFile);
  const channelData = audioBuffer.getChannelData(0);
  const base64Chunk = base64EncodeAudio(channelData);
  ws.send(JSON.stringify({
    type: 'input_audio_buffer.append',
    audio: base64Chunk
  }));
});

ws.send(JSON.stringify({type: 'input_audio_buffer.commit'}));
ws.send(JSON.stringify({type: 'response.create'}));
```

```python
import base64
import json
import struct
import soundfile as sf
from websocket import create_connection

# ... create websocket-client named ws ...

def float_to_16bit_pcm(float32_array):
    clipped = [max(-1.0, min(1.0, x)) for x in float32_array]
    pcm16 = b''.join(struct.pack('<h', int(x * 32767)) for x in clipped)
    return pcm16

def base64_encode_audio(float32_array):
    pcm_bytes = float_to_16bit_pcm(float32_array)
    encoded = base64.b64encode(pcm_bytes).decode('ascii')
    return encoded

files = [
    './path/to/sample1.wav',
    './path/to/sample2.wav',
    './path/to/sample3.wav'
]

for filename in files:
    data, samplerate = sf.read(filename, dtype='float32')
    channel_data = data[:, 0] if data.ndim > 1 else data
    base64_chunk = base64_encode_audio(channel_data)

    # Send the client event
    event = {
        "type": "input_audio_buffer.append",
        "audio": base64_chunk
    }
    ws.send(json.dumps(event))
```


### 发送完整音频消息

也可以创建包含完整录音的 conversation messages。使用 [`conversation.item.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/conversation/item/create) 客户端事件，创建带有 `input_audio` 内容的消息。

创建完整音频输入 conversation items

```javascript
const fullAudio = "<a base64-encoded string of audio bytes>";

const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_audio",
        audio: fullAudio,
      },
    ],
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
fullAudio = "<a base64-encoded string of audio bytes>"

event = {
    "type": "conversation.item.create",
    "item": {
        "type": "message",
        "role": "user",
        "content": [
            {
                "type": "input_audio",
                "audio": fullAudio,
            }
        ],
    },
}

ws.send(json.dumps(event))
```


### 处理来自 WebSocket 的音频输出

**要在 Web 浏览器等客户端设备上播放输出音频，我们建议使用 WebRTC 而不是 WebSockets**。在不稳定网络条件下，WebRTC 向客户端设备发送媒体会更稳健。

但如果你要在服务器到服务器应用中通过 WebSocket 处理音频输出，则需要监听 [`response.output_audio.delta`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_audio/delta) 事件，其中包含模型输出的 Base64 编码音频数据分块。你需要缓冲这些分块并写入文件，或者可能立即将它们流式传输到另一个来源，例如[使用 Twilio 的电话通话](https://www.twilio.com/en-us/blog/twilio-openai-realtime-api-launch-integration)。

请注意，[`response.output_audio.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_audio/done) 和 [`response.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/done) 事件本身并不会实际包含音频数据，只包含音频内容转录。要获取实际字节，你需要监听 [`response.output_audio.delta`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/output_audio/delta) 事件。

输出分块的格式可以为整个 session 配置，也可以按 response 配置。

- Session：[`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update) 中的 `session.audio.output.format`
- Response：[`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 中的 `response.audio.output.format`

监听 response.output_audio.delta 事件

```javascript
function handleEvent(e) {
  const serverEvent = JSON.parse(e.data);
  if (serverEvent.type === "response.audio.delta") {
    // Access Base64-encoded audio chunks
    // console.log(serverEvent.delta);
  }
}

// Listen for server messages (WebSocket)
ws.on("message", handleEvent);
```

```python
def on_message(ws, message):
    server_event = json.loads(message)
    if server_event.type == "response.audio.delta":
        # Access Base64-encoded audio chunks:
        # print(server_event.delta)
```


## 图像输入

`gpt-realtime-2` 和 `gpt-realtime` 也支持图像输入。你可以在用户消息中将图像附加为 content part，模型可以在回应时结合图像中的内容。

向 conversation 添加图像

```javascript
const base64Image = "<a base64-encoded string of image bytes>";

const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_image",
        image_url: `data:image/{format};base64,${base64Image}`,
      },
    ],
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```


## Voice activity detection

默认情况下，Realtime sessions 启用 **voice activity detection (VAD)**，这意味着 API 会确定用户何时开始或停止说话，并自动响应。

阅读我们的 [voice activity detection](https://developers.openai.com/api/docs/guides/realtime-vad) 指南，进一步了解如何配置 VAD。

### 禁用 VAD

可以通过 [`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update) 客户端事件将 `turn_detection` 设置为 `null` 来禁用 VAD。这对于希望精细控制音频输入的界面很有用，例如 [push to talk](https://en.wikipedia.org/wiki/Push-to-talk) 界面。

禁用 VAD 后，客户端必须手动发出一些额外的客户端事件来触发音频 responses：

- 手动发送 [`input_audio_buffer.commit`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/input_audio_buffer/commit)，这会为 conversation 创建一个新的用户输入 item。
- 手动发送 [`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create)，以触发模型的音频 response。
- 在开始新的用户输入前发送 [`input_audio_buffer.clear`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/input_audio_buffer/clear)。

### 保留 VAD，但禁用自动 responses

如果你希望保持 VAD 模式启用，但只想保留手动决定何时生成 response 的能力，可以通过 [`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update) 客户端事件将 `turn_detection.interrupt_response` 和 `turn_detection.create_response` 设置为 `false`。这会保留 VAD 的所有行为，但不会自动创建新的 Responses。客户端可以用 [`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 事件手动触发它们。

这对于 moderation、input validation 或 RAG 模式很有用：你愿意用交互中略高一点的延迟换取对输入的控制。

## 在默认 conversation 之外创建 responses

默认情况下，session 期间生成的所有 responses 都会添加到 session 的 conversation state（即“默认 conversation”）。不过，你可能希望在 session 默认 conversation 的上下文之外生成模型 responses，或并发生成多个 responses。你也可能希望更精细地控制模型生成 response 时考虑哪些 conversation items（例如只考虑最近 N 轮）。

通过 [`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 客户端事件创建 response 时，将 `response.conversation` 字段设置为字符串 `none`，即可生成不会添加到默认 conversation state 的“out-of-band” responses。

创建 out-of-band response 时，你可能还希望有某种方式识别哪些服务器发送的事件属于该 response。你可以为模型 response 提供 `metadata`，帮助你识别哪个 response 正在为该客户端发送事件生成。

创建 out-of-band 模型 response

```javascript
const prompt = `
Analyze the conversation so far. If it is related to support, output
"support". If it is related to sales, output "sales".
`;

const event = {
  type: "response.create",
  response: {
    // Setting to "none" indicates the response is out of band
    // and will not be added to the default conversation
    conversation: "none",

    // Set metadata to help identify responses sent back from the model
    metadata: { topic: "classification" },

    // Set any other available response fields
    output_modalities: [ "text" ],
    instructions: prompt,
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
prompt = """
Analyze the conversation so far. If it is related to support, output
"support". If it is related to sales, output "sales".
"""

event = {
    "type": "response.create",
    "response": {
        # Setting to "none" indicates the response is out of band,
        # and will not be added to the default conversation
        "conversation": "none",

        # Set metadata to help identify responses sent back from the model
        "metadata": { "topic": "classification" },

        # Set any other available response fields
        "output_modalities": [ "text" ],
        "instructions": prompt,
    },
}

ws.send(json.dumps(event))
```


现在，当你监听 [`response.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/done) 服务器事件时，可以识别 out-of-band response 的结果。

创建 out-of-band 模型 response

```javascript
function handleEvent(e) {
  const serverEvent = JSON.parse(e.data);
  if (
    serverEvent.type === "response.done" &&
    serverEvent.response.metadata?.topic === "classification"
  ) {
    // this server event pertained to our OOB model response
    console.log(serverEvent.response.output[0]);
  }
}

// Listen for server messages (WebRTC)
dataChannel.addEventListener("message", handleEvent);

// Listen for server messages (WebSocket)
// ws.on("message", handleEvent);
```

```python
def on_message(ws, message):
    server_event = json.loads(message)
    topic = ""

    # See if metadata is present
    try:
        topic = server_event.response.metadata.topic
    except AttributeError:
        print("topic not set")

    if server_event.type == "response.done" and topic == "classification":
        # this server event pertained to our OOB model response
        print(server_event.response.output[0])
```


### 为 responses 创建自定义上下文

你也可以在默认/当前 conversation 之外构造一个自定义上下文，供模型用来生成 response。这可以通过 [`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 客户端事件上的 `input` 数组完成。你可以使用新的输入，或通过 ID 引用 conversation 中现有的 input items。

监听带自定义上下文的 out-of-band 模型 response

```javascript
const event = {
  type: "response.create",
  response: {
    conversation: "none",
    metadata: { topic: "pizza" },
    output_modalities: [ "text" ],

    // Create a custom input array for this request with whatever context
    // is appropriate
    input: [
      // potentially include existing conversation items:
      {
        type: "item_reference",
        id: "some_conversation_item_id"
      },
      {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Is it okay to put pineapple on pizza?",
          },
        ],
      },
    ],
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
event = {
    "type": "response.create",
    "response": {
        "conversation": "none",
        "metadata": { "topic": "pizza" },
        "output_modalities": [ "text" ],

        # Create a custom input array for this request with whatever
        # context is appropriate
        "input": [
            # potentially include existing conversation items:
            {
                "type": "item_reference",
                "id": "some_conversation_item_id"
            },

            # include new content as well
            {
                "type": "message",
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Is it okay to put pineapple on pizza?",
                    }
                ],
            }
        ],
    },
}

ws.send(json.dumps(event))
```


### 创建没有上下文的 responses

你还可以将 responses 插入默认 conversation，并忽略所有其他指令和上下文。方法是将 `input` 设置为空数组。

将无上下文模型 responses 插入默认 conversation

```javascript
const prompt = `
Say exactly the following:
I'm a little teapot, short and stout!
This is my handle, this is my spout!
`;

const event = {
  type: "response.create",
  response: {
    // An empty input array removes existing context
    input: [],
    instructions: prompt,
  },
};

// WebRTC data channel and WebSocket both have .send()
dataChannel.send(JSON.stringify(event));
```

```python
prompt = """
Say exactly the following:
I'm a little teapot, short and stout!
This is my handle, this is my spout!
"""

event = {
    "type": "response.create",
    "response": {
        # An empty input array removes all prior context
        "input": [],
        "instructions": prompt,
    },
}

ws.send(json.dumps(event))
```


## Function calling

Realtime models 也支持 **function calling**，它让你可以执行自定义代码来扩展模型能力。整体工作方式如下：

1. 在[更新 session](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update) 或[创建 response](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 时，你可以指定模型可调用的函数列表。
1. 如果模型在处理输入时确定应该进行 function call，它会向 conversation 添加表示 function call 参数的 items。
1. 当客户端检测到包含 function call arguments 的 conversation items 时，它会使用这些 arguments 执行自定义代码
1. 自定义代码执行完成后，客户端会创建新的 conversation items，其中包含 function call 的输出，并请求模型响应。

让我们通过添加一个可调用函数来看看实际工作方式，该函数会为模型用户提供今日星座运势。我们会展示需要发送的客户端事件对象形状，以及服务器随后会发出什么。

### 配置可调用函数

首先，我们必须根据用户输入为模型提供一组可调用函数。可用函数可以在 session 级别配置，也可以在单个 response 级别配置。

- Session：[`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update) 中的 `session.tools` 属性
- Response：[`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 中的 `response.tools` 属性

下面是一个 `session.update` 的客户端事件 payload 示例，它配置了一个星座运势生成函数，该函数接受单个参数（应生成运势的星座）：

[`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update)

```json
{
  "type": "session.update",
  "session": {
    "tools": [
      {
        "type": "function",
        "name": "generate_horoscope",
        "description": "Give today's horoscope for an astrological sign.",
        "parameters": {
          "type": "object",
          "properties": {
            "sign": {
              "type": "string",
              "description": "The sign for the horoscope.",
              "enum": [
                "Aries",
                "Taurus",
                "Gemini",
                "Cancer",
                "Leo",
                "Virgo",
                "Libra",
                "Scorpio",
                "Sagittarius",
                "Capricorn",
                "Aquarius",
                "Pisces"
              ]
            }
          },
          "required": ["sign"]
        }
      }
    ],
    "tool_choice": "auto"
  }
}
```

函数和参数的 `description` 字段会帮助模型选择是否调用该函数，以及每个参数中要包含哪些数据。如果模型收到的输入表明用户想了解自己的星座运势，它会调用此函数并传入 `sign` 参数。

### 检测模型何时想调用函数

基于模型输入，模型可能决定调用函数以生成最佳 response。假设我们的应用使用 [`conversation.item.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/conversation/item/create) 事件添加以下 conversation item，然后创建 response：

```json
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [
      {
        "type": "input_text",
        "text": "What is my horoscope? I am an aquarius."
      }
    ]
  }
}
```

随后用 [`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 客户端事件生成 response：

```json
{
  "type": "response.create"
}
```

模型不会立即返回文本或音频 response，而是会生成一个包含应传给开发者应用中某个函数的 arguments 的 response。你可以使用 [`response.function_call_arguments.delta`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/function_call_arguments/delta) 服务器事件监听 function call arguments 的实时更新，不过 `response.done` 也会包含我们调用函数所需的完整数据。

[`response.done`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/response/done)

```json
{
    "type": "response.done",
    "event_id": "event_AeqLA8iR6FK20L4XZs2P6",
    "response": {
        "object": "realtime.response",
        "id": "resp_AeqL8XwMUOri9OhcQJIu9",
        "status": "completed",
        "status_details": null,
        "output": [
            {
                "object": "realtime.item",
                "id": "item_AeqL8gmRWDn9bIsUM2T35",
                "type": "function_call",
                "status": "completed",
                "name": "generate_horoscope",
                "call_id": "call_sHlR7iaFwQ2YQOqm",
                "arguments": "{\"sign\":\"Aquarius\"}"
            }
        ],
        ...
    }
}
```

在服务器发出的 JSON 中，我们可以检测到模型想调用自定义函数：

| 属性                           | Function calling 用途                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `response.output[0].type`      | 设置为 `function_call` 时，表示该 response 包含某个具名 function call 的 arguments。                                    |
| `response.output[0].name`      | 要调用的已配置函数名称，在本例中为 `generate_horoscope`                                                                 |
| `response.output[0].arguments` | 包含函数 arguments 的 JSON 字符串。在本例中为 `"{\"sign\":\"Aquarius\"}"`。                                             |
| `response.output[0].call_id`   | 此 function call 的系统生成 ID - **你需要此 ID 将 function call result 传回模型**。                                     |

有了这些信息，我们可以在应用中执行代码来生成星座运势，然后把这些信息提供回模型，让它生成 response。

### 向模型提供 function call 的结果

收到模型带有 function call arguments 的 response 后，你的应用可以执行满足该 function call 的代码。这可以是你想要的任何东西，例如调用外部 APIs 或访问数据库。

准备好把自定义代码的结果交给模型后，可以通过 [`conversation.item.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/conversation/item/create) 客户端事件创建一个包含结果的新 conversation item。

```json
{
  "type": "conversation.item.create",
  "item": {
    "type": "function_call_output",
    "call_id": "call_sHlR7iaFwQ2YQOqm",
    "output": "{\"horoscope\": \"You will soon meet a new friend.\"}"
  }
}
```

- conversation item 类型为 `function_call_output`
- `item.call_id` 是我们在上面的 `response.done` 事件中拿到的同一个 ID
- `item.output` 是包含 function call 结果的 JSON 字符串

添加包含 function call 结果的 conversation item 后，我们再次从客户端发出 [`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 事件。这会触发模型使用 function call 数据生成 response。

```json
{
  "type": "response.create"
}
```

## 错误处理

每当 session 期间服务器遇到错误条件时，服务器都会发出 [`error`](https://developers.openai.com/api/docs/api-reference/realtime-server-events/error) 事件。有时，这些错误可以追溯到你的应用发出的某个客户端事件。

与 HTTP 请求和响应不同，在 HTTP 中 response 会隐式绑定到客户端的 request；而这里我们需要在客户端事件上使用 `event_id` 属性，以便知道其中哪个事件触发了服务器上的错误条件。下面的代码展示了这种技术，其中客户端尝试发出一个不受支持的事件类型。

```javascript
const event = {
  event_id: "my_awesome_event",
  type: "scooby.dooby.doo",
};

dataChannel.send(JSON.stringify(event));
```


这个从客户端发送的不成功事件会发出如下错误事件：

```json
{
  "type": "invalid_request_error",
  "code": "invalid_value",
  "message": "Invalid value: 'scooby.dooby.doo' ...",
  "param": "type",
  "event_id": "my_awesome_event"
}
```

## 打断和截断

在许多语音应用中，用户可以在模型说话时打断它。启用 VAD 时，Realtime API 会处理打断：它检测到用户语音，取消正在进行的 response，并启动新的 response。不过，在这种场景下，你会希望模型知道它在哪里被打断，这样它才能自然地继续对话（例如用户说“刚才最后一句是什么？”）。我们称之为**截断**模型的最后一个 response，即从 conversation 中移除模型最后一个 response 中未播放的部分。

在 WebRTC 和 SIP 连接中，服务器会管理输出音频的缓冲区，因此知道在给定时刻已经播放了多少音频。当用户打断时，服务器会自动截断未播放的音频。

使用 WebSocket 连接时，客户端管理音频播放，因此必须停止播放并处理截断。流程如下：

1. 客户端监控来自服务器的新 `input_audio_buffer.speech_started` 事件，这表示用户已经开始说话。服务器会自动取消任何正在进行的模型 response，并发出 `response.cancelled` 事件。
1. 当客户端检测到此事件时，应立即停止播放当前正在播放的任何模型音频。它应记录被打断前最后一个音频 response 已播放了多少。
1. 客户端应发送 [`conversation.item.truncate`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/conversation/item/truncate) 事件，从 conversation 中移除模型最后一个 response 的未播放部分。

示例如下：

```json
{
    "type": "conversation.item.truncate",
    "item_id": "item_1234", # this is the item ID of the model's last response
    "content_index": 0,
    "audio_end_ms": 1500 # truncate audio after 1.5 seconds
}
```

那是否也会截断 transcript？realtime model 没有足够信息来精确对齐 transcript 和 audio，因此 `conversation.item.truncate` 会在给定位置剪切音频，并移除未播放部分的文本 transcript。这解决了移除未播放音频的问题，但不会提供截断后的 transcript。

## Push-to-talk

Realtime API 默认使用 voice activity detection (VAD)，这意味着模型 responses 会由音频输入触发。你也可以通过禁用 VAD 并使用应用层 gate 控制何时将音频输入发送给模型，实现 push-to-talk 交互，例如按住空格键捕获音频，然后在松开时触发 response。对某些应用来说，这种方式效果出奇地好：它让用户掌控交互、避免 VAD 失败，并且因为不等待 VAD 超时，感觉很灵敏。

在 WebSockets 和 WebRTC 上实现 push-to-talk 略有不同。在 Realtime API WebSocket 连接中，所有事件都在同一个通道中发送，并保持相同顺序；而 WebRTC 连接有独立的音频通道和控制事件通道。

### WebSockets

要在 WebSocket 连接中实现 push-to-talk，客户端需要停止音频播放、处理打断，并启动新的 response。更详细的流程如下：

1. 通过在 [`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update) 事件中设置 `"turn_detection": null` 来关闭 VAD。
1. 按下时，在客户端开始录音。
   1. 如果模型有正在进行的 response，通过发送 [`response.cancel`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/cancel) 事件取消它。
   1. 如果模型有正在进行的输出播放，请立即停止播放，并发送 `conversation.item.truncate` 事件，从 conversation 中移除任何未播放音频。
1. 松开时，发送带有音频的 [`input_audio_buffer.append`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/input_audio_buffer/append) 消息，将新音频放入 input buffer。
1. 发送 [`input_audio_buffer.commit`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/input_audio_buffer/commit) 事件，这会提交写入 input buffer 的音频并启动输入转录（如果启用）。
1. 然后用 [`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 事件触发 response。

### WebRTC 和 SIP

使用 WebRTC 实现 push-to-talk 类似，但必须显式清除 input audio buffer。流程如下：

1. 通过在 [`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update) 事件中设置 `"turn_detection": null` 来关闭 VAD。
1. 按下时，发送 [`input_audio_buffer.clear`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/input_audio_buffer/clear) 事件，清除任何之前的音频输入。
   1. 如果模型有正在进行的 response，通过发送 [`response.cancel`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/cancel) 事件取消它。
   1. 如果模型有正在进行的输出播放，请发送 [`output_audio_buffer.clear`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/output_audio_buffer/clear) 事件清除未播放音频，这也会截断 conversation。
1. 松开时，发送 [`input_audio_buffer.commit`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/input_audio_buffer/commit) 事件，这会提交写入 input buffer 的音频并启动输入转录（如果启用）。
1. 然后用 [`response.create`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/response/create) 事件触发 response。
