---
title: "语音活动检测（VAD）"
description: "Learn about automatic voice activity detection in the Realtime API."
outline: deep
---

# 语音活动检测（VAD）

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/realtime-vad](https://developers.openai.com/api/docs/guides/realtime-vad)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/realtime-vad.md](https://developers.openai.com/api/docs/guides/realtime-vad.md)
- 抓取时间：2026-06-27T05:54:06.808Z
- Checksum：`d03d7051c9800e5c5739a4871563a5124e810e9a9fef9ebafff283cc01df91df`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
语音活动检测（VAD）是 Realtime API 中可用的一项功能，可自动检测用户何时开始或停止说话。
它在 [speech-to-speech](/mirror/api/docs/guides/realtime-conversations) Realtime 会话中默认启用，但它是可选的，也可以关闭。
在 [transcription](/mirror/api/docs/guides/realtime-transcription) Realtime 会话中，turn detection 支持取决于转录模型。支持 VAD 的模型默认使用 `server_vad`，而 `gpt-realtime-whisper` 要求省略 turn detection 或将其设为 `null`。

## 概览

启用 VAD 后，音频会自动分块，Realtime API 会发送事件来指示用户何时开始或停止说话：

- `input_audio_buffer.speech_started`：语音轮次开始
- `input_audio_buffer.speech_stopped`：语音轮次结束

你可以使用这些事件在应用中处理语音轮次。例如，可以用它们管理对话状态，或按块处理转录文本。

你可以通过 [`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update) client event 设置 `session.audio.input.turn_detection` 来配置 VAD。

VAD 有两种模式：

- `server_vad`：根据静音时段自动切分音频。
- `semantic_vad`：当模型根据用户所说的话判断其已经完成表达时切分音频。

对于支持 VAD 的会话和模型，默认值是 `server_vad`。

继续阅读以了解不同模式的更多信息。

## Server VAD

Server VAD 是 speech-to-speech 会话的默认模式，也是支持 turn detection 的转录模型上 transcription 会话的默认模式。它使用静音时段自动切分音频。

你可以调整以下属性来微调 VAD 设置：

- `threshold`：激活阈值（0 到 1）。更高的阈值需要更大的音量才能激活模型，因此在嘈杂环境中可能表现更好。
- `prefix_padding_ms`：在 VAD 检测到语音之前要包含的音频量（毫秒）。
- `silence_duration_ms`：用于检测语音停止的静音持续时间（毫秒）。值越短，轮次检测越快。

下面是一个 VAD 配置示例：

```json
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "audio": {
      "input": {
        "turn_detection": {
          "type": "server_vad",
          "threshold": 0.5,
          "prefix_padding_ms": 300,
          "silence_duration_ms": 500,
          "create_response": true, // only in conversation mode
          "interrupt_response": true // only in conversation mode
        }
      }
    }
  }
}
```

在 transcription 会话中使用相同的 `session.audio.input.turn_detection` 字段。对于 `gpt-realtime-whisper`，请省略 turn detection 或将其设为 `null`。

`create_response` 和 `interrupt_response` 字段仅用于 speech-to-speech 对话。在 transcription 会话中，VAD 只控制音频如何分块。

## Semantic VAD

Semantic VAD 是一种新模式，它使用语义分类器，根据用户说出的词语检测其是否已经说完。
该分类器会根据用户完成说话的概率为输入音频打分。当概率较低时，模型会等待超时；当概率较高时，就不需要等待。
例如，用户音频以 “ummm...” 拖尾时，会比明确陈述产生更长的超时。

使用此模式时，在 speech-to-speech 对话中模型不太可能打断用户；在转录中，也不太可能在用户说完之前切分 transcript。

可以通过将 `session.audio.input.turn_detection.type` 设为 `semantic_vad` 来启用 Semantic VAD。

它可以这样配置：

```json
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "audio": {
      "input": {
        "turn_detection": {
          "type": "semantic_vad",
          "eagerness": "low" | "medium" | "high" | "auto", // optional
          "create_response": true, // only in conversation mode
          "interrupt_response": true, // only in conversation mode
        }
      }
    }
  }
}
```

同一个 `session.audio.input.turn_detection` 字段也适用于 transcription 会话。`create_response` 和 `interrupt_response` 字段仅用于对话。

可选的 `eagerness` 属性用于控制模型多急于打断用户，从而调节最大等待超时。在 transcription 模式中，即使模型不回复，它也会影响音频如何分块。

- `auto` 是默认值，等同于 `medium`。
- `low` 会让用户有更多时间说话。
- `high` 会尽可能快地切分音频。

如果你希望模型在对话模式中更频繁地响应，或在 transcription 模式中更快返回转录事件，可以将 `eagerness` 设为 `high`。

相反，如果你希望在对话模式中让用户不被打断地说话，或希望在 transcription 模式中获得更大的 transcript 分块，可以将 `eagerness` 设为 `low`。

:::

## English source

::: details 展开英文原文
::: v-pre
Voice activity detection (VAD) is a feature available in the Realtime API allowing to automatically detect when the user has started or stopped speaking.
It is enabled by default in [speech-to-speech](/mirror/api/docs/guides/realtime-conversations) Realtime sessions, but is optional and can be turned off.
In [transcription](/mirror/api/docs/guides/realtime-transcription) Realtime sessions, turn detection support depends on the transcription model. Models that support VAD default to `server_vad`, while `gpt-realtime-whisper` requires turn detection to be omitted or set to `null`.

## Overview

When VAD is enabled, the audio is chunked automatically and the Realtime API sends events to indicate when the user has started or stopped speaking:

- `input_audio_buffer.speech_started`: The start of a speech turn
- `input_audio_buffer.speech_stopped`: The end of a speech turn

You can use these events to handle speech turns in your application. For example, you can use them to manage conversation state or process transcripts in chunks.

You can configure VAD with the [`session.update`](https://developers.openai.com/api/docs/api-reference/realtime-client-events/session/update) client event by setting `session.audio.input.turn_detection`.

There are two modes for VAD:

- `server_vad`: Automatically chunks the audio based on periods of silence.
- `semantic_vad`: Chunks the audio when the model believes based on the words said by the user that they have completed their utterance.

For sessions and models that support VAD, the default value is `server_vad`.

Read below to learn more about the different modes.

## Server VAD

Server VAD is the default mode for speech-to-speech sessions, and for transcription sessions on models that support turn detection. It uses periods of silence to automatically chunk the audio.

You can adjust the following properties to fine-tune the VAD settings:

- `threshold`: Activation threshold (0 to 1). A higher threshold will require louder audio to activate the model, and thus might perform better in noisy environments.
- `prefix_padding_ms`: Amount of audio (in milliseconds) to include before the VAD detected speech.
- `silence_duration_ms`: Duration of silence (in milliseconds) to detect speech stop. With shorter values turns will be detected more quickly.

Here is an example VAD configuration:

```json
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "audio": {
      "input": {
        "turn_detection": {
          "type": "server_vad",
          "threshold": 0.5,
          "prefix_padding_ms": 300,
          "silence_duration_ms": 500,
          "create_response": true, // only in conversation mode
          "interrupt_response": true // only in conversation mode
        }
      }
    }
  }
}
```

Use the same `session.audio.input.turn_detection` field in transcription sessions. For `gpt-realtime-whisper`, omit turn detection or set it to `null`.

The `create_response` and `interrupt_response` fields are only used in speech-to-speech conversations. In transcription sessions, VAD only controls how audio is chunked.

## Semantic VAD

Semantic VAD is a new mode that uses a semantic classifier to detect when the user has finished speaking, based on the words they have uttered.
This classifier scores the input audio based on the probability that the user is done speaking. When the probability is low, the model will wait for a timeout, whereas when it is high, there is no need to wait.
For example, user audio that trails off with an "ummm..." would result in a longer timeout than a definitive statement.

With this mode, the model is less likely to interrupt the user during a speech-to-speech conversation, or chunk a transcript before the user is done speaking.

Semantic VAD can be activated by setting `session.audio.input.turn_detection.type` to `semantic_vad`.

It can be configured like this:

```json
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "audio": {
      "input": {
        "turn_detection": {
          "type": "semantic_vad",
          "eagerness": "low" | "medium" | "high" | "auto", // optional
          "create_response": true, // only in conversation mode
          "interrupt_response": true, // only in conversation mode
        }
      }
    }
  }
}
```

The same `session.audio.input.turn_detection` field applies in transcription sessions. The `create_response` and `interrupt_response` fields are conversation-only.

The optional `eagerness` property is a way to control how eager the model is to interrupt the user, tuning the maximum wait timeout. In transcription mode, even if the model doesn't reply, it affects how the audio is chunked.

- `auto` is the default value, and is equivalent to `medium`.
- `low` will let the user take their time to speak.
- `high` will chunk the audio as soon as possible.

If you want the model to respond more often in conversation mode, or to return transcription events faster in transcription mode, you can set `eagerness` to `high`.

On the other hand, if you want to let the user speak uninterrupted in conversation mode, or if you would like larger transcript chunks in transcription mode, you can set `eagerness` to `low`.

:::
:::

