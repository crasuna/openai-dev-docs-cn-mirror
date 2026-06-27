---
status: needs-review
sourceId: 7c677097e664
sourceChecksum: 7c677097e6640667fc315570604ba9190260d2d7afd3c5f4bec00c91717dd88c
sourceUrl: https://developers.openai.com/api/docs/guides/compaction
translatedAt: 2026-06-27T17:13:53.3182238+08:00
translator: codex-gpt-5.5-xhigh
---

# Compaction（压缩）

## 概览

为了支持长时间运行的交互，你可以使用 compaction 来减少上下文大小，同时保留后续轮次所需的状态。

随着对话增长，compaction 可以帮助你在质量、成本和延迟之间取得平衡。

## 服务端 compaction

你可以在 Responses create 请求（`POST /responses` 或 `client.responses.create`）中，通过设置带有 `compact_threshold` 的 `context_management` 来启用服务端 compaction。

- 当渲染后的 token 数量超过配置的阈值时，服务器会运行服务端 compaction。
- 在此模式下，不需要单独调用 `/responses/compact`。
- 响应流会包含加密的 compaction item。
- ZDR 说明：当你在 Responses create 请求中设置 `store=false` 时，服务端 compaction 对 ZDR 友好。

返回的 compaction item 会以更少的 token，把关键的先前状态和 reasoning 带入下一次运行。它是不透明的，并不适合人类解读。

对于无状态 input-array 链接，请像往常一样追加 output item。如果你使用 `previous_response_id`，每一轮只传入新的用户消息。在这两种情况下，compaction item 都会携带下一窗口所需的上下文。

延迟提示：把 output item 追加到先前 input item 后，你可以丢弃最近一个 compaction item 之前的 item，以缩小请求并降低长尾延迟。最新的 compaction item 会携带继续对话所需的上下文。如果你使用 `previous_response_id` 链接，请不要手动裁剪。

## 用户旅程

1. 像往常一样调用 `/responses`，但包含带有 `compact_threshold` 的 `context_management` 来启用服务端 compaction。
2. 随着响应流式返回，如果上下文大小超过阈值，服务器会触发一次 compaction pass，在同一个流中发出一个 compaction output item，并在继续推理前裁剪上下文。
3. 使用一种模式继续你的循环：无状态 input-array 链接（将 output，包括 compaction item，追加到下一次 input array）或 `previous_response_id` 链接（每一轮只传入新的用户消息，并继续携带该 ID）。

<a id="server-side-compaction-user-flow"></a>

## 示例用户流程

```python
conversation = [
    {
        "type": "message",
        "role": "user",
        "content": "Let's begin a long coding task.",
    }
]

while keep_going:
    response = client.responses.create(
        model="gpt-5.3-codex",
        input=conversation,
        store=False,
        context_management=[{"type": "compaction", "compact_threshold": 200000}],
    )

    conversation.extend(response.output)

    conversation.append(
        {
            "type": "message",
            "role": "user",
            "content": get_next_user_input(),
        }
    )
```


## 独立 compact endpoint

如需显式控制，请使用 [standalone compact endpoint](https://developers.openai.com/api/docs/api-reference/responses/compact)，在长时间运行的工作流中执行无状态 compaction。

此 endpoint 完全无状态，并且对 ZDR 友好。

你发送一个完整的上下文窗口（messages、tools 和其他 item），该 endpoint 会返回一个新的压缩上下文窗口，你可以把它传给下一次 `/responses` 调用。

返回的压缩窗口包含一个加密的 compaction item，它会用更少的 token 携带关键的先前状态和 reasoning。它是不透明的，并不适合人类解读。

注意：压缩后的窗口通常不止包含 compaction item。它也可以包含从上一个窗口保留下来的 item。

输出处理：不要裁剪 `/responses/compact` 的输出。返回的窗口就是规范的下一个上下文窗口，因此请原样传入下一次 `/responses` 调用。

### 独立 compaction 的用户旅程

1. 正常使用 `/responses`，发送包含用户消息、assistant 输出和工具交互的 input item。
2. 当你的上下文窗口变大时，调用 `/responses/compact` 生成新的压缩上下文窗口。发送给 `/responses/compact` 的窗口仍必须能放入模型的上下文窗口。
3. 对于后续 `/responses` 调用，传入返回的压缩窗口（包括 compaction item）作为 input，而不是完整 transcript。

<a id="standalone-compact-endpoint-user-flow"></a>

### 示例用户流程

```python
# Full window collected from prior turns
long_input_items_array = [...]

# 1) Compact the current window
compacted = client.responses.compact(
    model="gpt-5.5",
    input=long_input_items_array,
)

# 2) Start the next turn by appending a new user message
next_input = [
    *compacted.output,  # Use compact output as-is
    {
        "type": "message",
        "role": "user",
        "content": user_input_message(),
    },
]

next_response = client.responses.create(
    model="gpt-5.5",
    input=next_input,
    store=False,  # Keep the flow ZDR-friendly
)
```
