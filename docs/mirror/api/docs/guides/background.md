---
title: "Background mode"
description: "Run long running tasks asynchronously in the background."
outline: deep
---

# Background mode

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/background](https://developers.openai.com/api/docs/guides/background)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/background.md](https://developers.openai.com/api/docs/guides/background.md)
- 抓取时间：2026-06-27T05:53:59.386Z
- Checksum：`1d7cd2bc2a2d66fea71f18aa7c0e5cb074a041f9ba20263aae7d9694dd867a1b`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
像 [Codex](https://openai.com/index/introducing-codex/) 和 [Deep Research](https://openai.com/index/introducing-deep-research/) 这样的 agents 表明，reasoning models 可能需要几分钟才能解决复杂问题。Background mode 让你可以在 GPT-5.2 和 GPT-5.2 Pro 等模型上可靠地执行长时间运行的任务，而不必担心超时或其他连接问题。

Background mode 会异步启动这些任务，开发者可以随时间轮询 response 对象来检查状态。要在后台开始生成 response，请发起 API 请求，并将 `background` 设置为 `true`：

由于 background mode 会将 response 数据存储约 10 分钟以支持
  轮询，因此它不兼容 Zero Data Retention (ZDR)。出于历史原因，来自 ZDR
  projects 的请求在 `background=true` 时仍会被接受，但
  使用它会破坏 ZDR 保证。Modified Abuse Monitoring (MAM) projects 可以
  安全地依赖 background mode。

在后台生成 response

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
  "model": "gpt-5.5",
  "input": "Write a very long novel about otters in space.",
  "background": true
}'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5.5",
  input: "Write a very long novel about otters in space.",
  background: true,
});

console.log(resp.status);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
  model="gpt-5.5",
  input="Write a very long novel about otters in space.",
  background=True,
)

print(resp.status)
```


## 轮询 background responses

要检查后台请求的状态，请使用 Responses 的 GET endpoint。当请求处于 queued 或 in_progress 状态时持续轮询。当它离开这些状态时，就已达到最终（terminal）状态。

检索正在后台执行的 response

```bash
curl https://api.openai.com/v1/responses/resp_123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

let resp = await client.responses.create({
model: "gpt-5.5",
input: "Write a very long novel about otters in space.",
background: true,
});

while (resp.status === "queued" || resp.status === "in_progress") {
console.log("Current status: " + resp.status);
await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds
resp = await client.responses.retrieve(resp.id);
}

console.log("Final status: " + resp.status + "\nOutput:\n" + resp.output_text);
```

```python
from openai import OpenAI
from time import sleep

client = OpenAI()

resp = client.responses.create(
  model="gpt-5.5",
  input="Write a very long novel about otters in space.",
  background=True,
)

while resp.status in {"queued", "in_progress"}:
  print(f"Current status: {resp.status}")
  sleep(2)
  resp = client.responses.retrieve(resp.id)

print(f"Final status: {resp.status}\nOutput:\n{resp.output_text}")
```


## 取消 background response

你也可以像这样取消正在执行的 response：

取消正在进行的 response

```bash
curl -X POST https://api.openai.com/v1/responses/resp_123/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.cancel("resp_123");

console.log(resp.status);
```

```python
from openai import OpenAI
client = OpenAI()

resp = client.responses.cancel("resp_123")

print(resp.status)
```


重复取消是幂等的，后续调用只会返回最终的 `Response` 对象。

## 流式传输 background response

你可以创建一个后台 Response，并立即开始从中流式接收事件。如果你预期客户端可能会断开流，并希望之后可以选择恢复，这会很有用。为此，请创建同时将 `background` 和 `stream` 设置为 `true` 的 Response。你需要跟踪一个“cursor”，对应于你在每个 streaming event 中收到的 `sequence_number`。

目前，你从后台 response 收到首个 token 的时间
  高于同步 response。我们正在努力在接下来几周内缩小
  这一延迟差距。

生成并流式传输 background response

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
  "model": "gpt-5.5",
  "input": "Write a very long novel about otters in space.",
  "background": true,
  "stream": true
}'

// To resume:
curl "https://api.openai.com/v1/responses/resp_123?stream=true&starting_after=42" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY"
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const stream = await client.responses.create({
  model: "gpt-5.5",
  input: "Write a very long novel about otters in space.",
  background: true,
  stream: true,
});

let cursor = null;
for await (const event of stream) {
  console.log(event);
  cursor = event.sequence_number;
}

// If the connection drops, you can resume streaming from the last cursor (SDK support coming soon):
// const resumedStream = await client.responses.stream(resp.id, { starting_after: cursor });
// for await (const event of resumedStream) { ... }
```

```python
from openai import OpenAI

client = OpenAI()

# Fire off an async response but also start streaming immediately
stream = client.responses.create(
  model="gpt-5.5",
  input="Write a very long novel about otters in space.",
  background=True,
  stream=True,
)

cursor = None
for event in stream:
  print(event)
  cursor = event.sequence_number

# If your connection drops, the response continues running and you can reconnect:
# SDK support for resuming the stream is coming soon.
# for event in client.responses.stream(resp.id, starting_after=cursor):
#     print(event)
```


## 限制

1. Background sampling 需要 `store=true`；stateless requests 会被拒绝。
2. 要取消同步 response，请终止连接。
3. 只有在创建 background response 时设置了 `stream=true`，你才能从它启动新的 stream。

:::

## English source

::: details 展开英文原文
::: v-pre
Agents like [Codex](https://openai.com/index/introducing-codex/) and [Deep Research](https://openai.com/index/introducing-deep-research/) show that reasoning models can take several minutes to solve complex problems. Background mode enables you to execute long-running tasks on models like GPT-5.2 and GPT-5.2 Pro reliably, without having to worry about timeouts or other connectivity issues.

Background mode kicks off these tasks asynchronously, and developers can poll response objects to check status over time. To start response generation in the background, make an API request with `background` set to `true`:

Because background mode stores response data for roughly 10 minutes to enable
  polling, it is not Zero Data Retention (ZDR) compatible. Requests from ZDR
  projects are still accepted with `background=true` for legacy reasons, but
  using it breaks ZDR guarantees. Modified Abuse Monitoring (MAM) projects can
  safely rely on background mode.

Generate a response in the background

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
  "model": "gpt-5.5",
  "input": "Write a very long novel about otters in space.",
  "background": true
}'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5.5",
  input: "Write a very long novel about otters in space.",
  background: true,
});

console.log(resp.status);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
  model="gpt-5.5",
  input="Write a very long novel about otters in space.",
  background=True,
)

print(resp.status)
```


## Polling background responses

To check the status of background requests, use the GET endpoint for Responses. Keep polling while the request is in the queued or in_progress state. When it leaves these states, it has reached a final (terminal) state.

Retrieve a response executing in the background

```bash
curl https://api.openai.com/v1/responses/resp_123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

let resp = await client.responses.create({
model: "gpt-5.5",
input: "Write a very long novel about otters in space.",
background: true,
});

while (resp.status === "queued" || resp.status === "in_progress") {
console.log("Current status: " + resp.status);
await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds
resp = await client.responses.retrieve(resp.id);
}

console.log("Final status: " + resp.status + "\nOutput:\n" + resp.output_text);
```

```python
from openai import OpenAI
from time import sleep

client = OpenAI()

resp = client.responses.create(
  model="gpt-5.5",
  input="Write a very long novel about otters in space.",
  background=True,
)

while resp.status in {"queued", "in_progress"}:
  print(f"Current status: {resp.status}")
  sleep(2)
  resp = client.responses.retrieve(resp.id)

print(f"Final status: {resp.status}\nOutput:\n{resp.output_text}")
```


## Cancelling a background response

You can also cancel an in-flight response like this:

Cancel an ongoing response

```bash
curl -X POST https://api.openai.com/v1/responses/resp_123/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.cancel("resp_123");

console.log(resp.status);
```

```python
from openai import OpenAI
client = OpenAI()

resp = client.responses.cancel("resp_123")

print(resp.status)
```


Cancelling twice is idempotent - subsequent calls simply return the final `Response` object.

## Streaming a background response

You can create a background Response and start streaming events from it right away. This may be helpful if you expect the client to drop the stream and want the option of picking it back up later. To do this, create a Response with both `background` and `stream` set to `true`. You will want to keep track of a "cursor" corresponding to the `sequence_number` you receive in each streaming event.

Currently, the time to first token you receive from a background response is
  higher than what you receive from a synchronous one. We are working to reduce
  this latency gap in the coming weeks.

Generate and stream a background response

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
  "model": "gpt-5.5",
  "input": "Write a very long novel about otters in space.",
  "background": true,
  "stream": true
}'

// To resume:
curl "https://api.openai.com/v1/responses/resp_123?stream=true&starting_after=42" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY"
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const stream = await client.responses.create({
  model: "gpt-5.5",
  input: "Write a very long novel about otters in space.",
  background: true,
  stream: true,
});

let cursor = null;
for await (const event of stream) {
  console.log(event);
  cursor = event.sequence_number;
}

// If the connection drops, you can resume streaming from the last cursor (SDK support coming soon):
// const resumedStream = await client.responses.stream(resp.id, { starting_after: cursor });
// for await (const event of resumedStream) { ... }
```

```python
from openai import OpenAI

client = OpenAI()

# Fire off an async response but also start streaming immediately
stream = client.responses.create(
  model="gpt-5.5",
  input="Write a very long novel about otters in space.",
  background=True,
  stream=True,
)

cursor = None
for event in stream:
  print(event)
  cursor = event.sequence_number

# If your connection drops, the response continues running and you can reconnect:
# SDK support for resuming the stream is coming soon.
# for event in client.responses.stream(resp.id, starting_after=cursor):
#     print(event)
```


## Limits

1. Background sampling requires `store=true`; stateless requests are rejected.
2. To cancel a synchronous response, terminate the connection
3. You can only start a new stream from a background response if you created it with `stream=true`.

:::
:::

