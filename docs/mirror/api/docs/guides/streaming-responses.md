---
title: "流式传输 API 响应"
description: "Learn how to stream model responses from the OpenAI API using server-sent events."
outline: deep
---

# 流式传输 API 响应

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/streaming-responses](https://developers.openai.com/api/docs/guides/streaming-responses)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/streaming-responses.md](https://developers.openai.com/api/docs/guides/streaming-responses.md)
- 抓取时间：2026-06-27T05:54:08.920Z
- Checksum：`c4bcb032749c18edfdb1479345fa54fe30f91b8bb8fa590a253d47b0826dd679`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
默认情况下，当你向 OpenAI API 发起请求时，我们会先生成模型的完整输出，然后通过单个 HTTP 响应一次性返回。在生成较长输出时，等待响应可能需要一些时间。流式响应让你可以在模型继续生成完整响应的同时，先开始打印或处理模型输出的开头部分。

本指南聚焦于通过 server-sent events (SSE) 进行 HTTP 流式传输（`stream=true`）。如果你需要使用 `previous_response_id` 进行增量输入的持久 WebSocket 传输，请参阅 [Responses API WebSocket 模式](/mirror/api/docs/guides/websocket-mode)。

## 启用流式传输


要开始流式传输响应，请在对 Responses 端点的请求中设置 `stream=True`：

Responses API 使用语义事件进行流式传输。每个事件都有预定义 schema 的类型，因此你可以监听自己关心的事件。

如需查看完整事件类型列表，请参阅[流式传输 API 参考](https://developers.openai.com/api/docs/api-reference/responses-streaming)。下面是一些示例：

```python
type StreamingEvent =
	| ResponseCreatedEvent
	| ResponseInProgressEvent
	| ResponseFailedEvent
	| ResponseCompletedEvent
	| ResponseOutputItemAdded
	| ResponseOutputItemDone
	| ResponseContentPartAdded
	| ResponseContentPartDone
	| ResponseOutputTextDelta
	| ResponseOutputTextAnnotationAdded
	| ResponseTextDone
	| ResponseRefusalDelta
	| ResponseRefusalDone
	| ResponseFunctionCallArgumentsDelta
	| ResponseFunctionCallArgumentsDone
	| ResponseFileSearchCallInProgress
	| ResponseFileSearchCallSearching
	| ResponseFileSearchCallCompleted
	| ResponseCodeInterpreterInProgress
	| ResponseCodeInterpreterCallCodeDelta
	| ResponseCodeInterpreterCallCodeDone
	| ResponseCodeInterpreterCallInterpreting
	| ResponseCodeInterpreterCallCompleted
	| Error
```





## 读取响应



如果你使用我们的 SDK，每个事件都是一个带类型的实例。你也可以使用事件的 `type` 属性来识别单个事件。

有些关键生命周期事件只会发出一次，而另一些会在响应生成过程中发出多次。流式传输文本时常见的监听事件包括：

```
- `response.created`
- `response.output_text.delta`
- `response.completed`
- `error`
```

如需查看可以监听的完整事件列表，请参阅[流式传输 API 参考](https://developers.openai.com/api/docs/api-reference/responses-streaming)。





## 高级用例

对于更高级的用例，例如流式传输工具调用，请查看以下专门指南：

- [流式传输函数调用](/mirror/api/docs/guides/function-calling#streaming)
- [流式传输结构化输出](/mirror/api/docs/guides/structured-outputs#streaming)

## 审核风险

请注意，在生产应用中流式传输模型输出会让审核补全内容变得更困难，因为部分补全可能更难评估。这可能会影响获准用途。

如果你在生成请求中请求[审核分数](/mirror/api/docs/guides/moderation#moderate-generated-content)，这些分数会在完整生成输出可用后到达。它们不会包含在部分输出增量中。

:::

## English source

::: details 展开英文原文
::: v-pre
By default, when you make a request to the OpenAI API, we generate the model's entire output before sending it back in a single HTTP response. When generating long outputs, waiting for a response can take time. Streaming responses lets you start printing or processing the beginning of the model's output while it continues generating the full response.

This guide focuses on HTTP streaming (`stream=true`) over server-sent events (SSE). For persistent WebSocket transport with incremental inputs via `previous_response_id`, see [the Responses API WebSocket mode](/mirror/api/docs/guides/websocket-mode).

## Enable streaming


To start streaming responses, set `stream=True` in your request to the Responses endpoint:

The Responses API uses semantic events for streaming. Each event is typed with a predefined schema, so you can listen for events you care about.

For a full list of event types, see the [API reference for streaming](https://developers.openai.com/api/docs/api-reference/responses-streaming). Here are a few examples:

```python
type StreamingEvent =
	| ResponseCreatedEvent
	| ResponseInProgressEvent
	| ResponseFailedEvent
	| ResponseCompletedEvent
	| ResponseOutputItemAdded
	| ResponseOutputItemDone
	| ResponseContentPartAdded
	| ResponseContentPartDone
	| ResponseOutputTextDelta
	| ResponseOutputTextAnnotationAdded
	| ResponseTextDone
	| ResponseRefusalDelta
	| ResponseRefusalDone
	| ResponseFunctionCallArgumentsDelta
	| ResponseFunctionCallArgumentsDone
	| ResponseFileSearchCallInProgress
	| ResponseFileSearchCallSearching
	| ResponseFileSearchCallCompleted
	| ResponseCodeInterpreterInProgress
	| ResponseCodeInterpreterCallCodeDelta
	| ResponseCodeInterpreterCallCodeDone
	| ResponseCodeInterpreterCallInterpreting
	| ResponseCodeInterpreterCallCompleted
	| Error
```





## Read the responses



If you're using our SDK, every event is a typed instance. You can also identity individual events using the `type` property of the event.

Some key lifecycle events are emitted only once, while others are emitted multiple times as the response is generated. Common events to listen for when streaming text are:

```
- `response.created`
- `response.output_text.delta`
- `response.completed`
- `error`
```

For a full list of events you can listen for, see the [API reference for streaming](https://developers.openai.com/api/docs/api-reference/responses-streaming).





## Advanced use cases

For more advanced use cases, like streaming tool calls, check out the following dedicated guides:

- [Streaming function calls](/mirror/api/docs/guides/function-calling#streaming)
- [Streaming structured output](/mirror/api/docs/guides/structured-outputs#streaming)

## Moderation risk

Note that streaming the model's output in a production application makes it more difficult to moderate the content of the completions, as partial completions may be more difficult to evaluate. This may have implications for approved usage.

If you request [moderation scores with a generation request](/mirror/api/docs/guides/moderation#moderate-generated-content), the scores arrive after the full generated output is available. They aren't included with partial output deltas.

:::
:::

