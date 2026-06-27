---
status: needs-review
sourceId: bd8e6c3d6cd4
sourceChecksum: bd8e6c3d6cd4702858909b63ccf358e8d87f4cceb574c9011c7cd4845732158a
sourceUrl: https://developers.openai.com/api/docs/guides/audio
translatedAt: 2026-06-27T16:52:09.8881258+08:00
translator: codex-gpt-5.5-xhigh
---

# 音频与语音

音频模型可以理解语音输入、生成语音输出，或在同一次交互中同时完成两者。本指南解释 OpenAI 音频文档中使用的术语。当你准备选择实现路径时，请从 [Realtime and audio overview](https://developers.openai.com/api/docs/guides/realtime) 开始。

## 音频模态

音频应用会组合以下一种或多种模态：

| 模态        | 含义                                      | 常见用例                                  |
| --------------- | -------------------------------------------- | ------------------------------------------------- |
| 音频输入     | 模型从用户或应用接收声音。 | Voice agents、转录、翻译。         |
| 音频输出    | 模型或 API 返回语音音频。       | Voice agents、文本转语音、语音响应。   |
| 文本转录 | 语音变成文本。                         | 字幕、通话分析、搜索、记录。         |
| 文本提示     | 文本控制模型说什么或做什么。   | 语音生成、脚本化语音流程、prompts。 |

## 常见语音任务

**Speech to text** 将语音转换为文本。可将其用于字幕、笔记、转录稿、分析、搜索和可访问性。转录可以是面向文件的基于请求模式，也可以是面向实时音频的流式模式。

**Text to speech** 将文本转换为语音音频。可将其用于旁白、assistants、可访问性和生成的语音响应。语音生成可以在模型生成时流式返回音频。

**Speech to speech** 让模型在一个低延迟会话中聆听、推理并说话。当 assistant 需要响应、调用工具或维护会话状态时，可将其用于对话式 voice agents。

**Speech translation** 监听一种语言的语音，并以另一种语言返回翻译后的语音或转录输出。当翻译应在音频抵达时持续开始时，请使用专用的 realtime translation session。

## 流式传输与延迟

流式传输意味着客户端和服务会在交互仍处于活跃状态时交换部分输入或输出。当用户期望即时反馈时，例如实时字幕、通话、voice agents 和翻译，流式传输非常有用。

更低延迟需要 realtime 连接、更谨慎的音频处理，以及能够发出部分事件的 session 模型。Request-based APIs 更适合文件上传和非交互式工作，也更简单，但它们不支持相同的实时交互模式。

## Request-based APIs 和 realtime sessions

OpenAI 支持两大类音频架构：

| 架构                | 适用场景                                             | 示例                                                                                                                                                       |
| --------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Request-based audio APIs    | 你有文件、文本输入或有边界的请求。 | [Speech to text](https://developers.openai.com/api/docs/guides/speech-to-text)、[text to speech](https://developers.openai.com/api/docs/guides/text-to-speech)。                                                          |
| Realtime sessions           | 音频是实时的，且应用需要低延迟事件。  | [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents)、[translation](https://developers.openai.com/api/docs/guides/realtime-translation)、[transcription](https://developers.openai.com/api/docs/guides/realtime-transcription)。 |
| Multimodal chat completions | 你正在为现有聊天流程扩展音频能力。  | [音频输入或输出](#add-audio-to-your-existing-application)。                                                                                              |

有关构建路径指导，请参阅 [Realtime and audio overview](https://developers.openai.com/api/docs/guides/realtime)。

## 将音频添加到你的现有应用 {#add-audio-to-your-existing-application}

诸如 [`gpt-realtime-2`](https://developers.openai.com/api/docs/models/gpt-realtime-2) 和 [`gpt-audio-1.5`](https://developers.openai.com/api/docs/models/gpt-audio-1.5) 这样的模型是原生多模态模型，意味着它们可以理解并生成作为输入和输出的音频与文本。

对于浏览器中的实时 speech-to-speech 交互，请从 JavaScript SDK 中的 realtime session 开始：

启动 realtime voice session

```javascript
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";

const agent = new RealtimeAgent({
  name: "Assistant",
  instructions: "You are a helpful voice assistant.",
});

const session = new RealtimeSession(agent, {
  model: "gpt-realtime-2",
});

await session.connect({
  apiKey: "ek_...(ephemeral key from your server)",
});
```


此示例使用 JavaScript，因为浏览器 voice agents 会从客户端通过 WebRTC 连接。对于 Python 语音工作流，请使用 [Voice agents guide](https://developers.openai.com/api/docs/guides/voice-agents)，其中介绍了链式语音 pipelines。

如果你已经有一个使用 [Chat Completions endpoint](https://developers.openai.com/api/docs/api-reference/chat/) 的基于文本的 LLM 应用，可能会想添加音频能力。例如，如果你的聊天应用支持文本输入，你可以添加音频输入和输出：在 `modalities` 数组中包含 `audio`，并使用音频模型，例如 [`gpt-audio-1.5`](https://developers.openai.com/api/docs/models/gpt-audio-1.5)。

[Responses API](https://developers.openai.com/api/docs/api-reference/responses) 文档目前描述的是
  文本和图像输入搭配文本输出。对于这种 audio-chat 模式，请使用带音频能力模型的 Chat
  Completions。



<div data-content-switcher-pane data-value="audio-out">
    <div class="hidden">来自模型的音频输出</div>
    创建对提示词的类人音频响应

```javascript
import { writeFileSync } from "node:fs";
import OpenAI from "openai";

const openai = new OpenAI();

// Generate an audio response to the given prompt
const response = await openai.chat.completions.create({
  model: "gpt-audio-1.5",
  modalities: ["text", "audio"],
  audio: { voice: "alloy", format: "wav" },
  messages: [
    {
      role: "user",
      content: "Is a golden retriever a good family dog?"
    }
  ],
  store: true,
});

// Inspect returned data
console.log(response.choices[0]);

// Write audio data to a file
writeFileSync(
  "dog.wav",
  Buffer.from(response.choices[0].message.audio.data, 'base64'),
  { encoding: "utf-8" }
);
```

```python
import base64
from openai import OpenAI

client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-audio-1.5",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[
        {
            "role": "user",
            "content": "Is a golden retriever a good family dog?"
        }
    ]
)

print(completion.choices[0])

wav_bytes = base64.b64decode(completion.choices[0].message.audio.data)
with open("dog.wav", "wb") as f:
    f.write(wav_bytes)
```

```bash
curl "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
      "model": "gpt-audio-1.5",
      "modalities": ["text", "audio"],
      "audio": { "voice": "alloy", "format": "wav" },
      "messages": [
        {
          "role": "user",
          "content": "Is a golden retriever a good family dog?"
        }
      ]
    }'
```

  </div>
  <div data-content-switcher-pane data-value="audio-in" hidden>
    <div class="hidden">传给模型的音频输入</div>
    使用音频输入来提示模型

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

// Fetch an audio file and convert it to a base64 string
const url = "https://cdn.openai.com/API/docs/audio/alloy.wav";
const audioResponse = await fetch(url);
const buffer = await audioResponse.arrayBuffer();
const base64str = Buffer.from(buffer).toString("base64");

const response = await openai.chat.completions.create({
  model: "gpt-audio-1.5",
  modalities: ["text", "audio"],
  audio: { voice: "alloy", format: "wav" },
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "What is in this recording?" },
        { type: "input_audio", input_audio: { data: base64str, format: "wav" }}
      ]
    }
  ],
  store: true,
});

console.log(response.choices[0]);
```

```python
import base64
import requests
from openai import OpenAI

client = OpenAI()

# Fetch the audio file and convert it to a base64 encoded string
url = "https://cdn.openai.com/API/docs/audio/alloy.wav"
response = requests.get(url)
response.raise_for_status()
wav_data = response.content
encoded_string = base64.b64encode(wav_data).decode('utf-8')

completion = client.chat.completions.create(
    model="gpt-audio-1.5",
    modalities=["text", "audio"],
    audio={"voice": "alloy", "format": "wav"},
    messages=[
        {
            "role": "user",
            "content": [
                { 
                    "type": "text",
                    "text": "What is in this recording?"
                },
                {
                    "type": "input_audio",
                    "input_audio": {
                        "data": encoded_string,
                        "format": "wav"
                    }
                }
            ]
        },
    ]
)

print(completion.choices[0].message)
```

```bash
curl "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
      "model": "gpt-audio-1.5",
      "modalities": ["text", "audio"],
      "audio": { "voice": "alloy", "format": "wav" },
      "messages": [
        {
          "role": "user",
          "content": [
            { "type": "text", "text": "What is in this recording?" },
            { 
              "type": "input_audio", 
              "input_audio": { 
                "data": "<base64 bytes here>", 
                "format": "wav" 
              }
            }
          ]
        }
      ]
    }'
```

  </div>
