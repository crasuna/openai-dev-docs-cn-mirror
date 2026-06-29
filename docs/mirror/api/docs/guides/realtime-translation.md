---
title: "Realtime 翻译"
description: "Learn how to build live speech translation with Realtime translation sessions."
outline: deep
---

# Realtime 翻译

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/realtime-translation](https://developers.openai.com/api/docs/guides/realtime-translation)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/realtime-translation.md](https://developers.openai.com/api/docs/guides/realtime-translation.md)
- 抓取时间：2026-06-27T05:54:06.685Z
- Checksum：`e0a1400d438d7eca8a5c8ca6d37a817a6686d0199a3a3bb5c73e3ce363258204`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Realtime 翻译让你可以将源音频流式传入专用 translation session，并在说话人仍在讲话时接收翻译后的音频以及转录 delta。它适用于实时口译、多语言通话、广播、会议、课程和视频房间。

当你的应用应翻译真人讲话内容时，请使用 [`gpt-realtime-translate`](https://developers.openai.com/api/docs/models/gpt-realtime-translate)。如果你需要一个能回答问题、调用工具并管理对话的助手，请改用 [`gpt-realtime-2`](https://developers.openai.com/api/docs/models/gpt-realtime-2) 和标准 Realtime session。

## Translation session 有何不同

Realtime translation session 使用不同于语音 agent session 的架构：

| 语音 agent session                       | Translation session                              |
| ---------------------------------------- | ------------------------------------------------ |
| 连接到 `/v1/realtime`。                  | 连接到 `/v1/realtime/translations`。             |
| 模型充当助手。                           | 模型充当口译员。                                |
| 使用 conversation 和 response 生命周期。 | 从传入音频连续流式处理。                        |
| 可以调用工具并生成助手轮次。             | 生成翻译后的音频和转录 delta。                  |
| 你可以调用 `response.create`。           | 你不调用 `response.create`。                    |

翻译从音频流本身开始。持续追加音频，包括短语之间的静音，并在输出事件到达时处理它们。

## 选择传输方式

当浏览器捕获或播放音频时使用 WebRTC。WebRTC 将源音频作为 media track 发送，并将翻译语音作为 remote audio track 接收，因此你不需要手动重采样或播放 PCM 分块。

当你的服务器已经接收原始音频时使用 WebSockets，例如 Twilio Media Streams、SIP 媒体、广播 ingest 或媒体 worker。使用 WebSockets 时，发送 base64 编码的 24 kHz PCM16 音频，并自行播放返回的音频 delta。

## 创建浏览器 WebRTC session

对于浏览器应用，请在服务器上创建短期 client secret。不要在浏览器中暴露你的标准 API key。

创建 translation client secret

```javascript
app.post("/session", async (req, res) => {
  const language = req.body.targetLanguage ?? "es";

  const response = await fetch(
    "https://api.openai.com/v1/realtime/translations/client_secrets",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": "hashed-user-id",
      },
      body: JSON.stringify({
        session: {
          model: "gpt-realtime-translate",
          audio: {
            output: { language },
          },
        },
      }),
    }
  );

  res.status(response.status).json(await response.json());
});
```


在浏览器中，捕获音频、创建 peer connection，并将 SDP offer 发送到 translation calls endpoint：

连接浏览器 translation call

```javascript
const { value: clientSecret } = await fetch("/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ targetLanguage: "es" }),
}).then((response) => response.json());

const sourceStream = await navigator.mediaDevices.getUserMedia({
  audio: true,
});

const pc = new RTCPeerConnection();
pc.addTrack(sourceStream.getAudioTracks()[0], sourceStream);

const translatedAudio = new Audio();
translatedAudio.autoplay = true;
pc.ontrack = ({ streams }) => {
  translatedAudio.srcObject = streams[0];
};

const events = pc.createDataChannel("oai-events");
events.onmessage = ({ data }) => {
  const event = JSON.parse(data);
  if (event.type === "session.output_transcript.delta") {
    subtitles.textContent += event.delta;
  }
};

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const sdpResponse = await fetch(
  "https://api.openai.com/v1/realtime/translations/calls",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clientSecret}`,
      "Content-Type": "application/sdp",
    },
    body: offer.sdp,
  }
);

if (!sdpResponse.ok) {
  throw new Error(await sdpResponse.text());
}

await pc.setRemoteDescription({
  type: "answer",
  sdp: await sdpResponse.text(),
});
```


## 创建 WebSocket session

连接到专用 translation endpoint，并在 URL 中选择模型：

运行此示例前，请为 Node.js 安装 `ws` 包，或为 Python 安装 `websocket-client` 包。

连接到 translation session

```javascript
import WebSocket from "ws";

const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime/translations?model=gpt-realtime-translate",
  {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Safety-Identifier": "hashed-user-id",
    },
  }
);
```

```python
import os
import websocket

ws = websocket.WebSocket()
ws.connect(
    "wss://api.openai.com/v1/realtime/translations?model=gpt-realtime-translate",
    header=[
        f"Authorization: Bearer {os.environ['OPENAI_API_KEY']}",
        "OpenAI-Safety-Identifier: hashed-user-id",
    ],
)
```


socket 打开后配置目标语言：

配置目标语言

```javascript
ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "session.update",
      session: {
        audio: {
          output: {
            language: "es",
          },
        },
      },
    })
  );
});
```

```python
import json

ws.send(
    json.dumps(
        {
            "type": "session.update",
            "session": {
                "audio": {
                    "output": {
                        "language": "es",
                    },
                },
            },
        }
    )
)
```


然后持续追加音频：

追加源音频

```javascript
ws.send(
  JSON.stringify({
    type: "session.input_audio_buffer.append",
    audio: base64Pcm16,
  })
);
```

```python
ws.send(
    json.dumps(
        {
            "type": "session.input_audio_buffer.append",
            "audio": base64_pcm16,
        }
    )
)
```


监听翻译后的音频和转录：

监听翻译后的音频和转录

```javascript
ws.on("message", (data) => {
  const event = JSON.parse(data);

  if (event.type === "session.output_audio.delta") {
    playPcm16(event.delta);
  }

  if (event.type === "session.output_transcript.delta") {
    process.stdout.write(event.delta);
  }

  if (event.type === "session.input_transcript.delta") {
    updateSourceTranscript(event.delta);
  }
});
```

```python
while True:
    event = json.loads(ws.recv())

    if event["type"] == "session.output_audio.delta":
        play_pcm16(event["delta"])

    if event["type"] == "session.output_transcript.delta":
        print(event["delta"], end="", flush=True)

    if event["type"] == "session.input_transcript.delta":
        update_source_transcript(event["delta"])
```


## 关闭 WebSocket session

当源流结束时，请先发送 [`session.close`](https://developers.openai.com/api/reference/resources/realtime/translation-client-events#session-close) 事件，再关闭 WebSocket。该事件会告诉服务刷新待处理的输入音频、发出所有剩余的翻译音频和转录输出，然后发送 `session.closed` 事件。`session.close` 事件仅支持 translation session。

发送 `session.close` 后，请停止追加音频，并继续在正常接收循环中读取事件，直到收到 `session.closed`。立即关闭 socket 可能会丢失仍在从 session 排出的翻译输出。

关闭 translation session

```javascript
let translationSessionClosing = false;

function closeTranslationSession() {
  if (translationSessionClosing) {
    return;
  }

  translationSessionClosing = true;
  ws.send(
    JSON.stringify({
      type: "session.close",
    })
  );
}

ws.on("message", (data) => {
  const event = JSON.parse(data);

  if (event.type === "session.output_audio.delta") {
    playPcm16(event.delta);
  }

  if (event.type === "session.output_transcript.delta") {
    process.stdout.write(event.delta);
  }

  if (event.type === "session.input_transcript.delta") {
    updateSourceTranscript(event.delta);
  }

  if (event.type === "session.closed") {
    ws.close();
  }
});

// Call this when the source stream ends.
closeTranslationSession();
```

```python
translation_session_closing = False


def close_translation_session():
    global translation_session_closing
    if translation_session_closing:
        return

    translation_session_closing = True
    ws.send(json.dumps({"type": "session.close"}))


# Call this when the source stream ends.
close_translation_session()

while True:
    event = json.loads(ws.recv())

    if event["type"] == "session.output_audio.delta":
        play_pcm16(event["delta"])

    if event["type"] == "session.output_transcript.delta":
        print(event["delta"], end="", flush=True)

    if event["type"] == "session.input_transcript.delta":
        update_source_transcript(event["delta"])

    if event["type"] == "session.closed":
        ws.close()
        break
```


## 构建伴听式翻译

当一个源说话人或源流需要为观众提供翻译音频时，请使用伴听式翻译。示例包括直播、会议演讲、网络研讨会、财报电话会、讲座和视频。

典型架构是：

```text
source audio -> translation session -> translated audio + subtitles
```

为每一种目标语言创建一个 translation session。如果同一个英语源需要西班牙语和法语输出，请创建一个英语到西班牙语 session 和一个英语到法语 session。

对于浏览器伴听应用，请使用 `getDisplayMedia()` 捕获标签页音频，通过 WebRTC 发送，并播放远程翻译音频 track。对于生产广播，请在服务器媒体 worker 中运行翻译，并将翻译音频 track 或字幕发布给听众。

## 构建会话式翻译

当两个或更多参与者跨语言交谈时，请使用会话式翻译。示例包括支持电话、销售电话、辅导和视频房间。

保持参与者音频 track 分离。将说话人混合到一个流中，会让说话人身份、说话人字幕和重叠语音更难处理。

对于两人通话，每个方向创建一个 translation session：

```text
Caller A audio -> translate into Caller B language -> play to Caller B
Caller B audio -> translate into Caller A language -> play to Caller A
```

对于群组房间，session 数量取决于活跃说话人和目标语言：

```text
translation sessions ~= active source speaker tracks x distinct target languages
```

对于小房间，每位听众可以为自己想翻译的远端说话人创建浏览器端 translation sidecar。对于更大的房间，请使用服务器端参与者或媒体 worker：它订阅每个源说话人一次，为每种目标语言创建一个 translation session，并重新发布翻译 track。

## 测试质量和延迟

使用真实音频和双语审查测试翻译。自动化指标会有帮助，但无法发现用户注意到的每一种错误。

测试：

- 语言对质量；
- 姓名、数字、日期、货币和电话号码；
- 领域专用术语；
- 语码转换和混合语言对话；
- 口音、快速语音和重叠语音；
- 首段翻译音频延迟；
- 话语结束延迟；
- 字幕时序；
- voice 一致性；
- 重连行为。

如果你的用例依赖精确姓名或领域术语，请在发布前构建 golden set，并人工审查失败案例。

## 生产清单

- 浏览器媒体使用 WebRTC，服务器媒体使用 WebSockets。
- 使用专用 `/v1/realtime/translations` endpoint。
- 连续流式传输音频，包括短语之间的静音。
- 使用 `session.close`，并等待 `session.closed` 后再关闭 WebSocket session。
- 为会话式翻译保持说话人 track 分离。
- 每种输出语言使用一个 session。
- 在有用时同时渲染源转录和目标转录。
- 提供原始音频、翻译音频、字幕、静音和音量控件。
- 呈现正在重连、延迟和不可用状态。
- 将延迟与翻译质量分开跟踪。

## 相关指南


  



    比较语音 agent、翻译和转录 session。





  



    将浏览器媒体连接到 realtime session。





  



    通过服务器端媒体管线流式传输原始音频。





  



    从实时音频流式传输转录 delta。




:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Realtime translation lets you stream source audio into a dedicated translation session and receive translated audio plus transcript deltas while the speaker is still talking. Use it for live interpretation, multilingual calls, broadcasts, meetings, lessons, and video rooms.

Use [`gpt-realtime-translate`](https://developers.openai.com/api/docs/models/gpt-realtime-translate) when your application should translate what a human says. If you need an assistant that answers questions, calls tools, and manages a conversation, use [`gpt-realtime-2`](https://developers.openai.com/api/docs/models/gpt-realtime-2) with a standard Realtime session instead.

## How translation sessions differ

Realtime translation sessions use a different architecture from voice-agent sessions:

| Voice-agent session                         | Translation session                              |
| ------------------------------------------- | ------------------------------------------------ |
| Connects to `/v1/realtime`.                 | Connects to `/v1/realtime/translations`.         |
| The model acts as an assistant.             | The model acts as an interpreter.                |
| Uses a conversation and response lifecycle. | Streams continuously from incoming audio.        |
| May call tools and produce assistant turns. | Produces translated audio and transcript deltas. |
| You can call `response.create`.             | You don't call `response.create`.                |

Translation starts from the audio stream itself. Keep appending audio, including silence between phrases, and handle output events as they arrive.

## Choose a transport

Use WebRTC when the browser captures or plays audio. WebRTC sends source audio as a media track and receives translated speech as a remote audio track, so you don't need to manually resample or play PCM chunks.

Use WebSockets when your server already receives raw audio, such as Twilio Media Streams, SIP media, broadcast ingest, or a media worker. With WebSockets, send base64-encoded 24 kHz PCM16 audio and play returned audio deltas yourself.

## Create a browser WebRTC session

For browser apps, create a short-lived client secret on your server. Don't expose your standard API key in the browser.

Create a translation client secret

```javascript
app.post("/session", async (req, res) => {
  const language = req.body.targetLanguage ?? "es";

  const response = await fetch(
    "https://api.openai.com/v1/realtime/translations/client_secrets",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": "hashed-user-id",
      },
      body: JSON.stringify({
        session: {
          model: "gpt-realtime-translate",
          audio: {
            output: { language },
          },
        },
      }),
    }
  );

  res.status(response.status).json(await response.json());
});
```


In the browser, capture audio, create a peer connection, and post the SDP offer to the translation calls endpoint:

Connect a browser translation call

```javascript
const { value: clientSecret } = await fetch("/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ targetLanguage: "es" }),
}).then((response) => response.json());

const sourceStream = await navigator.mediaDevices.getUserMedia({
  audio: true,
});

const pc = new RTCPeerConnection();
pc.addTrack(sourceStream.getAudioTracks()[0], sourceStream);

const translatedAudio = new Audio();
translatedAudio.autoplay = true;
pc.ontrack = ({ streams }) => {
  translatedAudio.srcObject = streams[0];
};

const events = pc.createDataChannel("oai-events");
events.onmessage = ({ data }) => {
  const event = JSON.parse(data);
  if (event.type === "session.output_transcript.delta") {
    subtitles.textContent += event.delta;
  }
};

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const sdpResponse = await fetch(
  "https://api.openai.com/v1/realtime/translations/calls",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clientSecret}`,
      "Content-Type": "application/sdp",
    },
    body: offer.sdp,
  }
);

if (!sdpResponse.ok) {
  throw new Error(await sdpResponse.text());
}

await pc.setRemoteDescription({
  type: "answer",
  sdp: await sdpResponse.text(),
});
```


## Create a WebSocket session

Connect to the dedicated translation endpoint and select the model in the URL:

Install the `ws` package for Node.js or the `websocket-client` package for Python before running this example.

Connect to a translation session

```javascript
import WebSocket from "ws";

const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime/translations?model=gpt-realtime-translate",
  {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Safety-Identifier": "hashed-user-id",
    },
  }
);
```

```python
import os
import websocket

ws = websocket.WebSocket()
ws.connect(
    "wss://api.openai.com/v1/realtime/translations?model=gpt-realtime-translate",
    header=[
        f"Authorization: Bearer {os.environ['OPENAI_API_KEY']}",
        "OpenAI-Safety-Identifier: hashed-user-id",
    ],
)
```


Configure the target language after the socket opens:

Configure the target language

```javascript
ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "session.update",
      session: {
        audio: {
          output: {
            language: "es",
          },
        },
      },
    })
  );
});
```

```python
import json

ws.send(
    json.dumps(
        {
            "type": "session.update",
            "session": {
                "audio": {
                    "output": {
                        "language": "es",
                    },
                },
            },
        }
    )
)
```


Then append audio continuously:

Append source audio

```javascript
ws.send(
  JSON.stringify({
    type: "session.input_audio_buffer.append",
    audio: base64Pcm16,
  })
);
```

```python
ws.send(
    json.dumps(
        {
            "type": "session.input_audio_buffer.append",
            "audio": base64_pcm16,
        }
    )
)
```


Listen for translated audio and transcripts:

Listen for translated audio and transcripts

```javascript
ws.on("message", (data) => {
  const event = JSON.parse(data);

  if (event.type === "session.output_audio.delta") {
    playPcm16(event.delta);
  }

  if (event.type === "session.output_transcript.delta") {
    process.stdout.write(event.delta);
  }

  if (event.type === "session.input_transcript.delta") {
    updateSourceTranscript(event.delta);
  }
});
```

```python
while True:
    event = json.loads(ws.recv())

    if event["type"] == "session.output_audio.delta":
        play_pcm16(event["delta"])

    if event["type"] == "session.output_transcript.delta":
        print(event["delta"], end="", flush=True)

    if event["type"] == "session.input_transcript.delta":
        update_source_transcript(event["delta"])
```


## Close a WebSocket session

When your source stream ends, send a [`session.close`](https://developers.openai.com/api/reference/resources/realtime/translation-client-events#session-close) event before closing the WebSocket. The event tells the service to flush pending input audio, emit any remaining translated audio and transcript output, and then send a `session.closed` event. The `session.close` event is only supported for translation sessions.

After you send `session.close`, stop appending audio and continue reading events in your normal receive loop until you receive `session.closed`. Closing the socket immediately can drop translated output still draining from the session.

Close a translation session

```javascript
let translationSessionClosing = false;

function closeTranslationSession() {
  if (translationSessionClosing) {
    return;
  }

  translationSessionClosing = true;
  ws.send(
    JSON.stringify({
      type: "session.close",
    })
  );
}

ws.on("message", (data) => {
  const event = JSON.parse(data);

  if (event.type === "session.output_audio.delta") {
    playPcm16(event.delta);
  }

  if (event.type === "session.output_transcript.delta") {
    process.stdout.write(event.delta);
  }

  if (event.type === "session.input_transcript.delta") {
    updateSourceTranscript(event.delta);
  }

  if (event.type === "session.closed") {
    ws.close();
  }
});

// Call this when the source stream ends.
closeTranslationSession();
```

```python
translation_session_closing = False


def close_translation_session():
    global translation_session_closing
    if translation_session_closing:
        return

    translation_session_closing = True
    ws.send(json.dumps({"type": "session.close"}))


# Call this when the source stream ends.
close_translation_session()

while True:
    event = json.loads(ws.recv())

    if event["type"] == "session.output_audio.delta":
        play_pcm16(event["delta"])

    if event["type"] == "session.output_transcript.delta":
        print(event["delta"], end="", flush=True)

    if event["type"] == "session.input_transcript.delta":
        update_source_transcript(event["delta"])

    if event["type"] == "session.closed":
        ws.close()
        break
```


## Build listen-along translation

Use listen-along translation when one source speaker or stream needs translated audio for an audience. Examples include livestreams, conference talks, webinars, earnings calls, lectures, and videos.

The typical architecture is:

```text
source audio -> translation session -> translated audio + subtitles
```

Create one translation session for each target language. If the same English source needs Spanish and French output, create one English-to-Spanish session and one English-to-French session.

For browser listen-along apps, capture tab audio with `getDisplayMedia()`, send it over WebRTC, and play the remote translated audio track. For production broadcasts, run translation in a server media worker and publish translated audio tracks or captions to listeners.

## Build conversational translation

Use conversational translation when two or more participants speak across languages. Examples include support calls, sales calls, tutoring, and video rooms.

Keep participant audio tracks separate. Mixing speakers into one stream makes speaker identity, speaker captions, and overlapping speech more difficult to handle.

For a two-person call, create one translation session per direction:

```text
Caller A audio -> translate into Caller B language -> play to Caller B
Caller B audio -> translate into Caller A language -> play to Caller A
```

For group rooms, session count depends on active speakers and target languages:

```text
translation sessions ~= active source speaker tracks x distinct target languages
```

For small rooms, each listener can create browser-side translation sidecars for the remote speakers they want translated. For larger rooms, use a server-side participant or media worker that subscribes to each source speaker once, creates one translation session per target language, and republishes translated tracks.

## Test quality and latency

Test translation with real audio and bilingual review. Automated metrics can help, but they won't catch every error users notice.

Test:

- language-pair quality;
- names, numbers, dates, currency, and phone numbers;
- domain-specific terminology;
- code-switching and mixed-language conversation;
- accents, fast speech, and overlapping speech;
- first translated audio latency;
- end-of-utterance latency;
- subtitle timing;
- voice consistency;
- reconnect behavior.

If your use case depends on exact names or domain terms, build a golden set before launch and review failures manually.

## Production checklist

- Choose WebRTC for browser media and WebSockets for server media.
- Use the dedicated `/v1/realtime/translations` endpoint.
- Stream audio continuously, including silence between phrases.
- Use `session.close` and wait for `session.closed` before closing a WebSocket session.
- Keep speaker tracks separate for conversational translation.
- Use one session per output language.
- Render both source and target transcripts when useful.
- Expose controls for original audio, translated audio, subtitles, mute, and volume.
- Surface reconnecting, delayed, and unavailable states.
- Track latency apart from translation quality.

## Related guides

<a href="/api/docs/guides/realtime">
  

<span slot="icon">
      </span>
    Compare voice-agent, translation, and transcription sessions.


</a>

<a href="/api/docs/guides/realtime-webrtc">
  

<span slot="icon">
      </span>
    Connect browser media to a realtime session.


</a>

<a href="/api/docs/guides/realtime-websocket">
  

<span slot="icon">
      </span>
    Stream raw audio through a server-side media pipeline.


</a>

<a href="/api/docs/guides/realtime-transcription">
  

<span slot="icon">
      </span>
    Stream transcript deltas from live audio.


</a>
``````
:::
:::

