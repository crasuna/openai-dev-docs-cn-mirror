---
title: "Compaction（压缩）"
description: "Manage long-running conversations with server-side and standalone compaction."
outline: deep
---

# Compaction（压缩）

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/compaction](https://developers.openai.com/api/docs/guides/compaction)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/compaction.md](https://developers.openai.com/api/docs/guides/compaction.md)
- 抓取时间：2026-06-27T05:54:00.295Z
- Checksum：`7c677097e6640667fc315570604ba9190260d2d7afd3c5f4bec00c91717dd88c`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
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

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

To support long-running interactions, you can use compaction to reduce context
size while preserving state needed for subsequent turns.

Compaction helps you balance quality, cost, and latency as conversations grow.

## Server-side compaction

You can enable server-side compaction in a Responses create request
(`POST /responses` or `client.responses.create`) by setting
`context_management` with `compact_threshold`.

- When the rendered token count crosses the configured threshold, the server
  runs server-side compaction.
- No separate `/responses/compact` call is required in this mode.
- The response stream includes the encrypted compaction item.
- ZDR note: server-side compaction is ZDR-friendly when you set `store=false`
  on your Responses create requests.

The returned compaction item carries forward key prior state and reasoning into
the next run using fewer tokens. It is opaque and not intended to be
human-interpretable.

For stateless input-array chaining, append output items as usual. If you are
using `previous_response_id`, pass only the new user message each turn. In both
cases, the compaction item carries context needed for the next window.

Latency tip: After appending output items to the previous input items, you can
drop items that came before the most recent compaction item to keep requests
smaller and reduce long-tail latency. The latest compaction item carries the
necessary context to continue the conversation. If you use
`previous_response_id` chaining, do not manually prune.

## User journey

1. Call `/responses` as usual, but include `context_management` with
   `compact_threshold` to enable server-side compaction.
2. As the response streams, if the context size crosses the threshold, the server
   triggers a compaction pass, emits a compaction output item in the same stream,
   and prunes context before continuing inference.
3. Continue your loop with one pattern: stateless input-array chaining (append
   output, including compaction items, to your next input array) or
   `previous_response_id` chaining (pass only the new user message each turn and
   carry that ID forward).



## Example user flow

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


## Standalone compact endpoint

For explicit control, use the
[standalone compact endpoint](https://developers.openai.com/api/docs/api-reference/responses/compact) for
stateless compaction in long-running workflows.

This endpoint is fully stateless and ZDR-friendly.

You send a full context window (messages, tools, and other items), and the
endpoint returns a new compacted context window you can pass to your next
`/responses` call.

The returned compacted window includes an encrypted compaction item that carries
forward key prior state and reasoning using fewer tokens. It is opaque and not
intended to be human-interpretable.

Note: the compacted window generally contains more than just the compaction
item. It can also include retained items from the previous window.

Output handling: do not prune `/responses/compact` output. The returned window
is the canonical next context window, so pass it into your next `/responses`
call as-is.

### User journey for standalone compaction

1. Use `/responses` normally, sending input items that include user messages,
   assistant outputs, and tool interactions.
2. When your context window grows large, call `/responses/compact` to generate a
   new compacted context window. The window you send to `/responses/compact`
   must still fit within your model's context window.
3. For subsequent `/responses` calls, pass the returned compacted window
   (including the compaction item) as input instead of the full transcript.



### Example user flow

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

:::
:::

