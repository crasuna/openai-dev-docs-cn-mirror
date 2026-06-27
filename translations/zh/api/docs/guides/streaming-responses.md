---
status: needs-review
sourceId: "c4bcb032749c"
sourceChecksum: "c4bcb032749c18edfdb1479345fa54fe30f91b8bb8fa590a253d47b0826dd679"
sourceUrl: "https://developers.openai.com/api/docs/guides/streaming-responses"
translatedAt: "2026-06-27T10:24:24.269Z"
translator: codex-gpt-5.5-xhigh
---

# 流式传输 API 响应

默认情况下，当你向 OpenAI API 发起请求时，我们会先生成模型的完整输出，然后通过单个 HTTP 响应一次性返回。在生成较长输出时，等待响应可能需要一些时间。流式响应让你可以在模型继续生成完整响应的同时，先开始打印或处理模型输出的开头部分。

本指南聚焦于通过 server-sent events (SSE) 进行 HTTP 流式传输（`stream=true`）。如果你需要使用 `previous_response_id` 进行增量输入的持久 WebSocket 传输，请参阅 [Responses API WebSocket 模式](https://developers.openai.com/api/docs/guides/websocket-mode)。

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

- [流式传输函数调用](https://developers.openai.com/api/docs/guides/function-calling#streaming)
- [流式传输结构化输出](https://developers.openai.com/api/docs/guides/structured-outputs#streaming)

## 审核风险

请注意，在生产应用中流式传输模型输出会让审核补全内容变得更困难，因为部分补全可能更难评估。这可能会影响获准用途。

如果你在生成请求中请求[审核分数](https://developers.openai.com/api/docs/guides/moderation#moderate-generated-content)，这些分数会在完整生成输出可用后到达。它们不会包含在部分输出增量中。
