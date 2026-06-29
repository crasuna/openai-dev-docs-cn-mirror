---
title: "Realtime 和音频"
description: "Learn which realtime and audio guide to use for each speech application."
outline: deep
---

# Realtime 和音频

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/realtime](https://developers.openai.com/api/docs/guides/realtime)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/realtime.md](https://developers.openai.com/api/docs/guides/realtime.md)
- 抓取时间：2026-06-27T05:54:05.983Z
- Checksum：`59748a917f32d17c6133331cdd7f9e0da11ebdc37a04e6fe3ff2899221706f35`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
从你想构建的结果开始。Realtime sessions 最适合需要低延迟的实时音频。基于请求的音频 API 最适合文件、有边界的请求，或不需要实时 session 的语音生成。

## 常见用例




## 理解不同架构




目标
模型或 API
从这里开始




构建低延迟 voice agent

        [`gpt-realtime-2`](https://developers.openai.com/api/docs/models/gpt-realtime-2)


Voice agents



将实时语音翻译成另一种语言

        [`gpt-realtime-translate`](https://developers.openai.com/api/docs/models/gpt-realtime-translate)


Realtime translation



将实时音频转写为流式文本

        [`gpt-realtime-whisper`](https://developers.openai.com/api/docs/models/gpt-realtime-whisper)



          Realtime transcription




转写文件或有边界的音频请求
音频转写模型

Speech to text



从文本生成语音
语音生成模型

Text to speech



向现有 Chat Completions 应用添加音频
支持音频的 chat models


          Audio and speech






## 选择 realtime session

Realtime sessions 会在你的应用发送音频、接收事件并更新 session state 时保持连接打开。




Session 类型
适用场景
Endpoint 或模式




Voice-agent session

        模型应响应用户、调用 tools，并管理
        conversation state。


        位于 &lt;code&gt;/v1/realtime&lt;/code&gt; 的 conversation session



Translation session
应用应在语音到达时持续翻译。

        位于 &lt;code&gt;/v1/realtime/translations&lt;/code&gt; 的 continuous translation session



Transcription session

        应用需要 streaming transcript deltas，而不需要模型生成的语音
        响应。

发出 transcript deltas 的 transcription session




当你的应用需要一个响应用户的助手时，请使用 voice-agent session。当你的应用需要一个翻译说话者的 interpreter 时，请使用 translation session。当你的应用只需要从音频获得文本、而不需要模型生成响应时，请使用 transcription session。

### Voice-agent sessions

Voice-agent sessions 使用标准 Realtime API conversation lifecycle。客户端连接到 `/v1/realtime`，发送音频或文本，并监听模型响应、tool calls 和 session events。

对于大多数浏览器 voice agents，请从 [Voice agents](/mirror/api/docs/guides/voice-agents) 指南开始。它使用 Agents SDK 和 WebRTC 处理浏览器音频，并可以连接到服务端 tools。

Realtime 2 为 speech-to-speech 工作流增加了 reasoning。对于大多数生产 voice agents，请先将
  `reasoning.effort` 设为 `low`，然后根据延迟容忍度和任务复杂度进行调整。使用 [Realtime prompting guide](/mirror/api/docs/guides/realtime-models-prompting) 来调优 reasoning、
  preambles、tool use、不清晰音频和精确实体捕捉。

### Translation sessions

Realtime translation 使用专用 translation endpoint，而不是标准 voice-agent endpoint。Translation sessions 是连续的：客户端将音频流式传入 session，服务将翻译后的音频和 transcript deltas 流式传出。

Translation sessions 不使用常规 assistant turn lifecycle。不要调用 `response.create`，也不要等待客户端提交 user turn 后再开始翻译。对于浏览器媒体，请使用 WebRTC。对于电话呼叫或 broadcast ingest 等服务端 media pipelines，请使用 WebSockets。

请参阅 [Realtime translation](/mirror/api/docs/guides/realtime-translation)，了解专用 endpoint、session configuration 和 architecture patterns。

### Transcription sessions

你可以用多种方式转写音频。当你的应用需要来自流式音频的实时 transcript deltas 时，请使用 realtime transcription session。对于文件上传、基于请求的转写或聚焦 diarization 的工作流，请使用 [Speech to text](/mirror/api/docs/guides/speech-to-text) 指南。

对于 realtime transcription，[`gpt-realtime-whisper`](https://developers.openai.com/api/docs/models/gpt-realtime-whisper) 让你可以控制延迟。较低的 delay settings 会更早产生 partial text，而较高的 delay settings 可以改善 transcript 质量。在选择生产默认值之前，请使用你的真实音频条件、目标语言、口音和领域词汇进行测试。

请参阅 [Realtime transcription](/mirror/api/docs/guides/realtime-transcription)，了解 session configuration 和 event handling。

## 选择连接方法

根据你的应用在哪里采集和播放音频来选择 transport：

[



    用于直接采集或播放音频的浏览器和移动客户端。

](https://developers.openai.com/api/docs/guides/realtime-webrtc)

[



    当你的服务器已经从 media pipeline、call
    system 或 worker 接收原始音频时使用。

](https://developers.openai.com/api/docs/guides/realtime-websocket)

[



    用于电话语音 agents。在将 SIP 用于
    translation 或 transcription 前，请确认模型支持。

](https://developers.openai.com/api/docs/guides/realtime-sip)

## Safety identifiers

如果你的应用会识别单个最终用户，请在 Realtime API 请求中包含 [safety identifier](/mirror/api/docs/guides/safety-best-practices#implement-safety-identifiers)。Safety identifiers 是推荐项，但不是必需项。它们帮助 OpenAI 监控和检测滥用，同时让 enforcement 可以针对单个用户，而不是你的整个组织。请使用稳定且保护隐私的值，例如哈希后的内部用户 ID。

对于 Realtime API 请求，请在 `OpenAI-Safety-Identifier` header 中发送该 identifier。使用 ephemeral tokens 时，请在创建 client secret 的服务端请求上设置该 header，以便 identifier 绑定到该 session。当从可信服务器通过 WebSocket 或 unified WebRTC interface 连接时，请在连接请求上设置该 header。

Safety identifiers 不会从 Responses API 请求或其他 sessions 继承。如果你在应用的其他位置使用 Responses API `safety_identifier` 参数，请在创建或连接每个 Realtime session 时单独传入同一个稳定值。

## 从 Beta 迁移到 GA

如果你仍有 beta Realtime 集成，请先迁移到 GA interface，再继续新工作。最重要的变化包括：

- 调用 GA interface 时移除 `OpenAI-Beta: realtime=v1` header。
- 使用 [`POST /v1/realtime/client_secrets`](https://developers.openai.com/api/docs/api-reference/realtime-sessions/create-realtime-client-secret) 为浏览器或移动客户端创建 ephemeral credentials。
- 建立 WebRTC sessions 时使用 `/v1/realtime/calls`。
- 为 GA interface 更新 session 和 event shapes。特别是设置 `session.type`，将输出音频配置移动到 `session.audio.output` 下，并使用较新的 response event names，例如 `response.output_text.delta`、`response.output_audio.delta` 和 `response.output_audio_transcript.delta`。
- 如果你要推进 speech-to-speech 应用，请从 [Voice agents](/mirror/api/docs/guides/voice-agents) 指南开始。如果你要推进 transcription 工作流，请使用 [Realtime transcription](/mirror/api/docs/guides/realtime-transcription)。

请参阅 [Realtime client events reference](https://developers.openai.com/api/docs/api-reference/realtime_client_events)、[Realtime sessions reference](https://developers.openai.com/api/docs/api-reference/realtime-sessions) 和 [Voice agents](/mirror/api/docs/guides/voice-agents) 指南，了解当前 GA flow。

## 相关指南

- [Realtime prompting guide](/mirror/api/docs/guides/realtime-models-prompting)：提示并调优 Realtime voice models。
- [Managing conversations](/mirror/api/docs/guides/realtime-conversations)：使用 Realtime session lifecycle。
- [Realtime translation](/mirror/api/docs/guides/realtime-translation)：使用专用 translation session 翻译实时语音。
- [Realtime transcription](/mirror/api/docs/guides/realtime-transcription)：从音频流式传出实时 transcript deltas。
- [Realtime with tools](/mirror/api/docs/guides/realtime-mcp)：将 function tools、MCP servers 和 connectors 连接到 Realtime session。
- [Webhooks and server-side controls](/mirror/api/docs/guides/realtime-server-controls)：从你的服务器控制 Realtime sessions。
- [Managing costs](/mirror/api/docs/guides/realtime-costs)：跟踪和优化 Realtime API 使用量。

使用 [Audio and speech](/mirror/api/docs/guides/audio) 了解
  audio input、audio output、streaming、latency、transcripts 和 speech
  generation 背后的核心概念。当你准备选择实现
  路径时，请使用本概览。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Start with the outcome you want to build. Realtime sessions are best for live audio that needs low latency. Request-based audio APIs are best for files, bounded requests, or generated speech that doesn't need a live session.

## Common use cases

<div className="w-full max-w-full overflow-hidden">
  </div>

## Understand different architectures

<table>
  <thead>
    <tr>
      <th>Goal</th>
      <th>Model or API</th>
      <th>Start here</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Build a low-latency voice agent</td>
      <td className="whitespace-nowrap">
        [`gpt-realtime-2`](https://developers.openai.com/api/docs/models/gpt-realtime-2)
      </td>
      <td>
        <a href="/api/docs/guides/voice-agents">Voice agents</a>
      </td>
    </tr>
    <tr>
      <td>Translate live speech into another language</td>
      <td className="whitespace-nowrap">
        [`gpt-realtime-translate`](https://developers.openai.com/api/docs/models/gpt-realtime-translate)
      </td>
      <td>
        <a href="/api/docs/guides/realtime-translation">Realtime translation</a>
      </td>
    </tr>
    <tr>
      <td>Transcribe live audio into streaming text</td>
      <td className="whitespace-nowrap">
        [`gpt-realtime-whisper`](https://developers.openai.com/api/docs/models/gpt-realtime-whisper)
      </td>
      <td>
        <a href="/api/docs/guides/realtime-transcription">
          Realtime transcription
        </a>
      </td>
    </tr>
    <tr>
      <td>Transcribe files or bounded audio requests</td>
      <td>Audio transcription models</td>
      <td>
        <a href="/api/docs/guides/speech-to-text">Speech to text</a>
      </td>
    </tr>
    <tr>
      <td>Generate speech from text</td>
      <td>Speech generation models</td>
      <td>
        <a href="/api/docs/guides/text-to-speech">Text to speech</a>
      </td>
    </tr>
    <tr>
      <td>Add audio to an existing Chat Completions app</td>
      <td>Audio-capable chat models</td>
      <td>
        <a href="/api/docs/guides/audio#add-audio-to-your-existing-application">
          Audio and speech
        </a>
      </td>
    </tr>
  </tbody>
</table>

## Choose a realtime session

Realtime sessions keep a connection open while your application sends audio, receives events, and updates session state.

<table>
  <thead>
    <tr>
      <th>Session type</th>
      <th>Use when</th>
      <th>Endpoint or pattern</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Voice-agent session</td>
      <td>
        The model should respond to the user, call tools, and manage
        conversation state.
      </td>
      <td>
        Conversation session on <code>/v1/realtime</code>
      </td>
    </tr>
    <tr>
      <td>Translation session</td>
      <td>The app should continuously translate speech as it arrives.</td>
      <td>
        Continuous translation session on <code>/v1/realtime/translations</code>
      </td>
    </tr>
    <tr>
      <td>Transcription session</td>
      <td>
        The app needs streaming transcript deltas without model-generated spoken
        responses.
      </td>
      <td>Transcription session that emits transcript deltas</td>
    </tr>
  </tbody>
</table>

Use a voice-agent session when your application needs an assistant that responds to the user. Use a translation session when your application needs an interpreter that translates the speaker. Use a transcription session when your application needs text from audio without model-generated responses.

### Voice-agent sessions

Voice-agent sessions use the standard Realtime API conversation lifecycle. The client connects to `/v1/realtime`, sends audio or text, and listens for model responses, tool calls, and session events.

For most browser voice agents, start with the [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents) guide. It uses the Agents SDK with WebRTC for browser audio and can connect to server-side tools.

Realtime 2 adds reasoning to speech-to-speech workflows. Start with
  `reasoning.effort` set to `low` for most production voice agents, then adjust
  based on latency tolerance and task complexity. Use the [Realtime prompting
  guide](https://developers.openai.com/api/docs/guides/realtime-models-prompting) to tune reasoning,
  preambles, tool use, unclear audio, and exact entity capture.

### Translation sessions

Realtime translation uses a dedicated translation endpoint instead of the standard voice-agent endpoint. Translation sessions are continuous: the client streams audio into the session, and the service streams translated audio and transcript deltas out.

Translation sessions don't use the normal assistant turn lifecycle. Don't call `response.create`, and don't wait for the client to commit a user turn before translation begins. For browser media, use WebRTC. For server media pipelines such as phone calls or broadcast ingest, use WebSockets.

See [Realtime translation](https://developers.openai.com/api/docs/guides/realtime-translation) for the dedicated endpoint, session configuration, and architecture patterns.

### Transcription sessions

You can transcribe audio in more than one way. Use a realtime transcription session when your application needs live transcript deltas from streaming audio. Use the [Speech to text](https://developers.openai.com/api/docs/guides/speech-to-text) guide for file uploads, request-based transcription, or diarization-focused workflows.

For realtime transcription, [`gpt-realtime-whisper`](https://developers.openai.com/api/docs/models/gpt-realtime-whisper) gives you controllable latency. Lower delay settings produce earlier partial text, while higher delay settings can improve transcript quality. Test with your real audio conditions, target languages, accents, and domain vocabulary before choosing a production default.

See [Realtime transcription](https://developers.openai.com/api/docs/guides/realtime-transcription) for session configuration and event handling.

## Choose a connection method

Choose the transport based on where your application captures and plays audio:

[

<span slot="icon">
      </span>
    Use for browser and mobile clients that capture or play audio directly.

](https://developers.openai.com/api/docs/guides/realtime-webrtc)

[

<span slot="icon">
      </span>
    Use when your server already receives raw audio from a media pipeline, call
    system, or worker.

](https://developers.openai.com/api/docs/guides/realtime-websocket)

[

<span slot="icon">
      </span>
    Use for telephony voice agents. Confirm model support before using SIP for
    translation or transcription.

](https://developers.openai.com/api/docs/guides/realtime-sip)

## Safety identifiers

If your application identifies individual end users, include a [safety identifier](https://developers.openai.com/api/docs/guides/safety-best-practices#implement-safety-identifiers) with Realtime API requests. Safety identifiers are recommended but not required. They help OpenAI monitor and detect abuse while allowing enforcement to target an individual user rather than your entire organization. Use a stable, privacy-preserving value, such as a hashed internal user ID.

For Realtime API requests, send the identifier in the `OpenAI-Safety-Identifier` header. When using ephemeral tokens, set the header on the server-side request that creates the client secret so the identifier is bound to that session. When connecting from a trusted server with WebSocket or the unified WebRTC interface, set the header on the connection request.

Safety identifiers do not carry over from Responses API requests or from other sessions. If you use the Responses API `safety_identifier` parameter elsewhere in your application, pass the same stable value separately when you create or connect each Realtime session.

## Beta to GA migration

If you still have a beta Realtime integration, migrate it to the GA interface before moving forward with new work. The most important changes are:

- Remove the `OpenAI-Beta: realtime=v1` header when calling the GA interface.
- Use [`POST /v1/realtime/client_secrets`](https://developers.openai.com/api/docs/api-reference/realtime-sessions/create-realtime-client-secret) to create ephemeral credentials for browser or mobile clients.
- Use `/v1/realtime/calls` when establishing WebRTC sessions.
- Update session and event shapes for the GA interface. In particular, set `session.type`, move output audio configuration under `session.audio.output`, and use the newer response event names like `response.output_text.delta`, `response.output_audio.delta`, and `response.output_audio_transcript.delta`.
- If you are moving a speech-to-speech app forward, start from the [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents) guide. If you are moving a transcription workflow forward, use [Realtime transcription](https://developers.openai.com/api/docs/guides/realtime-transcription).

See the [Realtime client events reference](https://developers.openai.com/api/docs/api-reference/realtime_client_events), [Realtime sessions reference](https://developers.openai.com/api/docs/api-reference/realtime-sessions), and [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents) guide for the current GA flow.

## Related guides

- [Realtime prompting guide](https://developers.openai.com/api/docs/guides/realtime-models-prompting): Prompt and tune Realtime voice models.
- [Managing conversations](https://developers.openai.com/api/docs/guides/realtime-conversations): Work with the Realtime session lifecycle.
- [Realtime translation](https://developers.openai.com/api/docs/guides/realtime-translation): Translate live speech with a dedicated translation session.
- [Realtime transcription](https://developers.openai.com/api/docs/guides/realtime-transcription): Stream live transcript deltas from audio.
- [Realtime with tools](https://developers.openai.com/api/docs/guides/realtime-mcp): Connect function tools, MCP servers, and connectors to a Realtime session.
- [Webhooks and server-side controls](https://developers.openai.com/api/docs/guides/realtime-server-controls): Control Realtime sessions from your server.
- [Managing costs](https://developers.openai.com/api/docs/guides/realtime-costs): Track and optimize Realtime API usage.

Use [Audio and speech](https://developers.openai.com/api/docs/guides/audio) for the core concepts behind
  audio input, audio output, streaming, latency, transcripts, and speech
  generation. Use this overview when you are ready to choose an implementation
  path.
``````
:::
:::

