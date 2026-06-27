---
status: needs-review
sourceId: "b91b7cc125f1"
sourceChecksum: "b91b7cc125f1159f659057bc9b8b4614bc587d4d20397dccd8874107bf4ce100"
sourceUrl: "https://developers.openai.com/api/docs/guides/websocket-mode"
translatedAt: "2026-06-27T18:23:48.7352177+08:00"
translator: codex-gpt-5.5-xhigh
---

# WebSocket 模式

Responses API 支持一种面向长时间运行、工具调用密集型工作流的 WebSocket 模式。在这种模式下，你会保持一个到 `/v1/responses` 的持久连接，并在每一轮继续时只发送新的 input items 加上 `previous_response_id`。

WebSocket 模式同时兼容 Zero Data Retention（ZDR）和 `store=false`。

## 为什么使用 WebSocket 模式

当工作流涉及许多模型-工具往返时（例如 agentic coding，或包含重复工具调用的编排循环），WebSocket 模式最有用。

由于连接会保持打开，而且每一轮只发送增量输入，WebSocket 模式可以降低每轮 continuation 的开销，并改善长链路中的端到端延迟。对于包含 20 次以上工具调用的 rollout，我们观察到端到端执行速度最高可提升约 40%。

## 连接并创建响应

在 WebSocket 模式下，每一轮都从客户端发送一个 `response.create` 事件开始。其 payload 与常规的 [Responses create body](https://developers.openai.com/api/reference/resources/responses/methods/create) 相同，只是不会使用 `stream` 和 `background` 等特定于传输方式的字段。

```python
from websocket import create_connection
import json
import os

ws = create_connection(
    "wss://api.openai.com/v1/responses",
    header=[
        f"Authorization: Bearer {os.environ['OPENAI_API_KEY']}",
    ],
)

ws.send(
    json.dumps(
        {
            "type": "response.create",
            "model": "gpt-5.5",
            "store": False,
            "input": [
                {
                    "type": "message",
                    "role": "user",
                    "content": [{"type": "input_text", "text": "Find fizz_buzz()"}],
                }
            ],
            "tools": [],
        }
    )
)
```


客户端可以选择通过发送带有 `generate: false` 的 `response.create` 来预热请求状态。当你已经知道即将在下一轮发送的 tools、instructions 和/或自定义 messages 时，这很有用。`generate: false` 不会返回模型输出，但会准备请求状态，让下一次生成轮次可以更快开始。预热请求会返回一个 response ID，你可以通过 `previous_response_id` 从它继续，包括在响应链的后续轮次中继续。下一节说明如何使用 `previous_response_id` 和增量输入继续会话。

## 使用增量输入继续

要继续一次运行，请再发送一个 `response.create`，其中包含：

- `previous_response_id` 设置为先前的 response ID。
- `input` 只包含新的 items（例如工具输出和下一条用户消息）。

```python
ws.send(
    json.dumps(
        {
            "type": "response.create",
            "model": "gpt-5.5",
            "store": False,
            "previous_response_id": "resp_123",
            "input": [
                {
                    "type": "function_call_output",
                    "call_id": "call_123",
                    "output": "tool result",
                },
                {
                    "type": "message",
                    "role": "user",
                    "content": [{"type": "input_text", "text": "Now optimize it."}],
                },
            ],
            "tools": [],
        }
    )
)
```


## continuation 如何工作

WebSocket 模式使用与 HTTP 模式相同的 `previous_response_id` 链接语义，但在活跃 socket 上增加了一条延迟更低的 continuation 路径。

在一个活跃的 WebSocket 连接上，服务会在连接本地的内存缓存中保留一个 previous-response 状态（最近的响应）。从这个最近响应继续会很快，因为服务可以复用连接本地状态。由于 previous-response 状态只保存在内存中，并不会写入磁盘，你可以用一种兼容 `store=false` 和 Zero Data Retention（ZDR）的方式使用 WebSocket 模式。

如果某个 `previous_response_id` 不在内存缓存中，其行为取决于你是否存储响应：

- 使用 `store=true` 时，服务可能会在可用时从持久化状态中恢复较旧的 response ID。continuation 仍可工作，但通常会失去内存带来的延迟优势。
- 使用 `store=false`（包括 ZDR）时，没有持久化 fallback。如果该 ID 未缓存，请求会返回 `previous_response_not_found`。

如果某一轮失败（`4xx` 或 `5xx`），服务会从连接本地缓存中逐出被引用的 `previous_response_id`。这可以防止为失败的 continuation 复用过期的缓存状态。

## Compaction 与创建新响应

如果你正在使用 compaction，有两种不同的 continuation 模式：

### 服务端 compaction（`context_management`）

当你启用服务端 compaction（带 `compact_threshold` 的 `context_management`）时，compaction 会在正常 `/responses` 生成期间发生。在 WebSocket 模式下，你仍然以通常的方式继续：发送下一条 `response.create`，并带上最新的 `previous_response_id` 和仅包含新增 input items 的输入。

### 独立 `/responses/compact`

独立的 [`/responses/compact` endpoint](https://developers.openai.com/api/docs/api-reference/responses/compact) 会返回一个新的压缩后 input window，而不是 response ID。compaction 之后，请在你的 WebSocket 连接上使用压缩后的 window 作为 `input`（再加上下一个 user/tool items）来创建新响应。

通过省略 `previous_response_id` 或将其设置为 `null` 来开始一条新链。原样传入返回的压缩输出；不要裁剪返回的 window。

```python
# Compact your current window (HTTP call)
compacted = client.responses.compact(
    model="gpt-5.5",
    input=long_input_items_array,
)

# Start a new response on the WebSocket using the compacted window
ws.send(
    json.dumps(
        {
            "type": "response.create",
            "model": "gpt-5.5",
            "store": False,
            "input": [
                *compacted.output,
                {
                    "type": "message",
                    "role": "user",
                    "content": [{"type": "input_text", "text": "Continue from here."}],
                },
            ],
            "tools": [],
        }
    )
)
```


## 连接行为与限制

- 服务器事件和顺序与现有 Responses streaming event model 保持一致。
- 单个 WebSocket 连接可以接收多个 `response.create` message，但会按顺序运行它们（一次只处理一个 in-flight response）。
- 目前不支持 multiplexing。如果需要并行运行，请使用多个连接。
- 连接时长限制为 60 分钟。达到限制时请重新连接。

## 重新连接与恢复

当连接关闭（或达到 60 分钟限制）时，打开一个新的 WebSocket 连接，并使用以下模式之一继续：

1. 如果你的先前响应已持久化（`store=true`）且你有有效的 response ID，请使用 `previous_response_id` 和新的 input items 继续。
2. 如果你无法继续该链（例如 `store=false`/ZDR 或 `previous_response_not_found`），请将 `previous_response_id` 设置为 `null`（或省略它）并发送下一轮所需的完整输入上下文，从而开始一个新响应。
3. 如果你使用 `/responses/compact` 压缩了上下文，请将返回的压缩 window 作为该新响应的基础 `input`，然后追加最新的 user/tool items。

## 需要处理的错误

`previous_response_not_found`

```json
{
  "type": "error",
  "status": 400,
  "error": {
    "code": "previous_response_not_found",
    "message": "Previous response with id 'resp_abc' not found.",
    "param": "previous_response_id"
  }
}
```

`websocket_connection_limit_reached`

```json
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "code": "websocket_connection_limit_reached",
    "message": "Responses websocket connection limit reached (60 minutes). Create a new websocket connection to continue."
  },
  "status": 400
}
```

## 相关指南

- [Conversation state](https://developers.openai.com/api/docs/guides/conversation-state)
- [Streaming API responses](https://developers.openai.com/api/docs/guides/streaming-responses)
- [Responses streaming events reference](https://developers.openai.com/api/docs/api-reference/responses-streaming)
