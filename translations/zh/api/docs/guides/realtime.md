---
status: needs-review
sourceId: "59748a917f32"
sourceChecksum: "59748a917f32d17c6133331cdd7f9e0da11ebdc37a04e6fe3ff2899221706f35"
sourceUrl: "https://developers.openai.com/api/docs/guides/realtime"
translatedAt: "2026-06-27T18:23:34.8670908+08:00"
translator: codex-gpt-5.5-xhigh
---

# Realtime 和音频

从你想构建的结果开始。Realtime sessions 最适合需要低延迟的实时音频。基于请求的音频 API 最适合文件、有边界的请求，或不需要实时 session 的语音生成。

## 常见用例

<div className="w-full max-w-full overflow-hidden">
  </div>

## 理解不同架构

<table>
  <thead>
    <tr>
      <th>目标</th>
      <th>模型或 API</th>
      <th>从这里开始</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>构建低延迟 voice agent</td>
      <td className="whitespace-nowrap">
        [`gpt-realtime-2`](https://developers.openai.com/api/docs/models/gpt-realtime-2)
      </td>
      <td>
        <a href="/api/docs/guides/voice-agents">Voice agents</a>
      </td>
    </tr>
    <tr>
      <td>将实时语音翻译成另一种语言</td>
      <td className="whitespace-nowrap">
        [`gpt-realtime-translate`](https://developers.openai.com/api/docs/models/gpt-realtime-translate)
      </td>
      <td>
        <a href="/api/docs/guides/realtime-translation">Realtime translation</a>
      </td>
    </tr>
    <tr>
      <td>将实时音频转写为流式文本</td>
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
      <td>转写文件或有边界的音频请求</td>
      <td>音频转写模型</td>
      <td>
        <a href="/api/docs/guides/speech-to-text">Speech to text</a>
      </td>
    </tr>
    <tr>
      <td>从文本生成语音</td>
      <td>语音生成模型</td>
      <td>
        <a href="/api/docs/guides/text-to-speech">Text to speech</a>
      </td>
    </tr>
    <tr>
      <td>向现有 Chat Completions 应用添加音频</td>
      <td>支持音频的 chat models</td>
      <td>
        <a href="/api/docs/guides/audio#add-audio-to-your-existing-application">
          Audio and speech
        </a>
      </td>
    </tr>
  </tbody>
</table>

## 选择 realtime session

Realtime sessions 会在你的应用发送音频、接收事件并更新 session state 时保持连接打开。

<table>
  <thead>
    <tr>
      <th>Session 类型</th>
      <th>适用场景</th>
      <th>Endpoint 或模式</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Voice-agent session</td>
      <td>
        模型应响应用户、调用 tools，并管理
        conversation state。
      </td>
      <td>
        位于 <code>/v1/realtime</code> 的 conversation session
      </td>
    </tr>
    <tr>
      <td>Translation session</td>
      <td>应用应在语音到达时持续翻译。</td>
      <td>
        位于 <code>/v1/realtime/translations</code> 的 continuous translation session
      </td>
    </tr>
    <tr>
      <td>Transcription session</td>
      <td>
        应用需要 streaming transcript deltas，而不需要模型生成的语音
        响应。
      </td>
      <td>发出 transcript deltas 的 transcription session</td>
    </tr>
  </tbody>
</table>

当你的应用需要一个响应用户的助手时，请使用 voice-agent session。当你的应用需要一个翻译说话者的 interpreter 时，请使用 translation session。当你的应用只需要从音频获得文本、而不需要模型生成响应时，请使用 transcription session。

### Voice-agent sessions

Voice-agent sessions 使用标准 Realtime API conversation lifecycle。客户端连接到 `/v1/realtime`，发送音频或文本，并监听模型响应、tool calls 和 session events。

对于大多数浏览器 voice agents，请从 [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents) 指南开始。它使用 Agents SDK 和 WebRTC 处理浏览器音频，并可以连接到服务端 tools。

Realtime 2 为 speech-to-speech 工作流增加了 reasoning。对于大多数生产 voice agents，请先将
  `reasoning.effort` 设为 `low`，然后根据延迟容忍度和任务复杂度进行调整。使用 [Realtime prompting
  guide](https://developers.openai.com/api/docs/guides/realtime-models-prompting) 来调优 reasoning、
  preambles、tool use、不清晰音频和精确实体捕捉。

### Translation sessions

Realtime translation 使用专用 translation endpoint，而不是标准 voice-agent endpoint。Translation sessions 是连续的：客户端将音频流式传入 session，服务将翻译后的音频和 transcript deltas 流式传出。

Translation sessions 不使用常规 assistant turn lifecycle。不要调用 `response.create`，也不要等待客户端提交 user turn 后再开始翻译。对于浏览器媒体，请使用 WebRTC。对于电话呼叫或 broadcast ingest 等服务端 media pipelines，请使用 WebSockets。

请参阅 [Realtime translation](https://developers.openai.com/api/docs/guides/realtime-translation)，了解专用 endpoint、session configuration 和 architecture patterns。

### Transcription sessions

你可以用多种方式转写音频。当你的应用需要来自流式音频的实时 transcript deltas 时，请使用 realtime transcription session。对于文件上传、基于请求的转写或聚焦 diarization 的工作流，请使用 [Speech to text](https://developers.openai.com/api/docs/guides/speech-to-text) 指南。

对于 realtime transcription，[`gpt-realtime-whisper`](https://developers.openai.com/api/docs/models/gpt-realtime-whisper) 让你可以控制延迟。较低的 delay settings 会更早产生 partial text，而较高的 delay settings 可以改善 transcript 质量。在选择生产默认值之前，请使用你的真实音频条件、目标语言、口音和领域词汇进行测试。

请参阅 [Realtime transcription](https://developers.openai.com/api/docs/guides/realtime-transcription)，了解 session configuration 和 event handling。

## 选择连接方法

根据你的应用在哪里采集和播放音频来选择 transport：

[

<span slot="icon">
      </span>
    用于直接采集或播放音频的浏览器和移动客户端。

](https://developers.openai.com/api/docs/guides/realtime-webrtc)

[

<span slot="icon">
      </span>
    当你的服务器已经从 media pipeline、call
    system 或 worker 接收原始音频时使用。

](https://developers.openai.com/api/docs/guides/realtime-websocket)

[

<span slot="icon">
      </span>
    用于电话语音 agents。在将 SIP 用于
    translation 或 transcription 前，请确认模型支持。

](https://developers.openai.com/api/docs/guides/realtime-sip)

## Safety identifiers

如果你的应用会识别单个最终用户，请在 Realtime API 请求中包含 [safety identifier](https://developers.openai.com/api/docs/guides/safety-best-practices#implement-safety-identifiers)。Safety identifiers 是推荐项，但不是必需项。它们帮助 OpenAI 监控和检测滥用，同时让 enforcement 可以针对单个用户，而不是你的整个组织。请使用稳定且保护隐私的值，例如哈希后的内部用户 ID。

对于 Realtime API 请求，请在 `OpenAI-Safety-Identifier` header 中发送该 identifier。使用 ephemeral tokens 时，请在创建 client secret 的服务端请求上设置该 header，以便 identifier 绑定到该 session。当从可信服务器通过 WebSocket 或 unified WebRTC interface 连接时，请在连接请求上设置该 header。

Safety identifiers 不会从 Responses API 请求或其他 sessions 继承。如果你在应用的其他位置使用 Responses API `safety_identifier` 参数，请在创建或连接每个 Realtime session 时单独传入同一个稳定值。

## 从 Beta 迁移到 GA

如果你仍有 beta Realtime 集成，请先迁移到 GA interface，再继续新工作。最重要的变化包括：

- 调用 GA interface 时移除 `OpenAI-Beta: realtime=v1` header。
- 使用 [`POST /v1/realtime/client_secrets`](https://developers.openai.com/api/docs/api-reference/realtime-sessions/create-realtime-client-secret) 为浏览器或移动客户端创建 ephemeral credentials。
- 建立 WebRTC sessions 时使用 `/v1/realtime/calls`。
- 为 GA interface 更新 session 和 event shapes。特别是设置 `session.type`，将输出音频配置移动到 `session.audio.output` 下，并使用较新的 response event names，例如 `response.output_text.delta`、`response.output_audio.delta` 和 `response.output_audio_transcript.delta`。
- 如果你要推进 speech-to-speech 应用，请从 [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents) 指南开始。如果你要推进 transcription 工作流，请使用 [Realtime transcription](https://developers.openai.com/api/docs/guides/realtime-transcription)。

请参阅 [Realtime client events reference](https://developers.openai.com/api/docs/api-reference/realtime_client_events)、[Realtime sessions reference](https://developers.openai.com/api/docs/api-reference/realtime-sessions) 和 [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents) 指南，了解当前 GA flow。

## 相关指南

- [Realtime prompting guide](https://developers.openai.com/api/docs/guides/realtime-models-prompting)：提示并调优 Realtime voice models。
- [Managing conversations](https://developers.openai.com/api/docs/guides/realtime-conversations)：使用 Realtime session lifecycle。
- [Realtime translation](https://developers.openai.com/api/docs/guides/realtime-translation)：使用专用 translation session 翻译实时语音。
- [Realtime transcription](https://developers.openai.com/api/docs/guides/realtime-transcription)：从音频流式传出实时 transcript deltas。
- [Realtime with tools](https://developers.openai.com/api/docs/guides/realtime-mcp)：将 function tools、MCP servers 和 connectors 连接到 Realtime session。
- [Webhooks and server-side controls](https://developers.openai.com/api/docs/guides/realtime-server-controls)：从你的服务器控制 Realtime sessions。
- [Managing costs](https://developers.openai.com/api/docs/guides/realtime-costs)：跟踪和优化 Realtime API 使用量。

使用 [Audio and speech](https://developers.openai.com/api/docs/guides/audio) 了解
  audio input、audio output、streaming、latency、transcripts 和 speech
  generation 背后的核心概念。当你准备选择实现
  路径时，请使用本概览。

