---
title: "使用 WebSocket 的 Realtime API"
description: "Learn how to connect to the Realtime API using WebSocket in a server-to-server application."
outline: deep
---

# 使用 WebSocket 的 Realtime API

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/realtime-websocket](https://developers.openai.com/api/docs/guides/realtime-websocket)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/realtime-websocket.md](https://developers.openai.com/api/docs/guides/realtime-websocket.md)
- 抓取时间：2026-06-27T05:54:07.221Z
- Checksum：`26b73d159588e458e98b80235012ab52f3ec8754aa90ef8bf936a90dff4e1423`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
[WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) 是一种被广泛支持的实时数据传输 API，也是服务器到服务器应用连接 OpenAI Realtime API 的理想选择。对于浏览器和移动客户端，我们建议通过 [WebRTC](/mirror/api/docs/guides/realtime-webrtc) 连接。

在与 Realtime 的服务器到服务器集成中，你的后端系统将通过 WebSocket 直接连接到 Realtime API。你可以使用[标准 API key](https://platform.openai.com/settings/organization/api-keys) 对该连接进行认证，因为 token 只会存在于你的安全后端服务器上。

![connect directly to realtime API](https://openaidevs.retool.com/api/file/464d4334-c467-4862-901b-d0c6847f003a)

## 通过 WebSocket 连接

下面是几个通过 WebSocket 连接到 Realtime API 的示例。除了使用下面的 WebSocket URL，你还需要使用 OpenAI API key 传递认证 header。如果你的应用分配 [safety identifiers](/mirror/api/docs/guides/safety-best-practices#implement-safety-identifiers)，请在 `OpenAI-Safety-Identifier` header 中传入最终用户的稳定、保护隐私的 identifier。

可以像 [WebRTC connection guide](/mirror/api/docs/guides/realtime-webrtc) 中所示，在浏览器中使用 ephemeral API token 通过 WebSocket 连接，但如果你是从浏览器或移动应用这样的客户端连接，在大多数情况下 WebRTC 会是更稳健的方案。




ws module (Node.js)
    使用 ws module (Node.js) 连接

```javascript
import WebSocket from "ws";

const url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-2";
const ws = new WebSocket(url, {
  headers: {
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    "OpenAI-Safety-Identifier": "hashed-user-id",
  },
});

ws.on("open", function open() {
  console.log("Connected to server.");
});

ws.on("message", function incoming(message) {
  console.log(JSON.parse(message.toString()));
});
```



websocket-client (Python)
    使用 websocket-client (Python) 连接

```python
# example requires websocket-client library:
# pip install websocket-client

import os
import json
import websocket

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-2"
headers = [
    "Authorization: Bearer " + OPENAI_API_KEY,
    "OpenAI-Safety-Identifier: hashed-user-id",
]


def on_open(ws):
    print("Connected to server.")


def on_message(ws, message):
    data = json.loads(message)
    print("Received event:", json.dumps(data, indent=2))


ws = websocket.WebSocketApp(
    url,
    header=headers,
    on_open=on_open,
    on_message=on_message,
)

ws.run_forever()
```



WebSocket (browsers)
    使用标准 WebSocket (browsers) 连接

```javascript
/*
Note that in client-side environments like web browsers, we recommend
using WebRTC instead. It is possible, however, to use the standard
WebSocket interface in browser-like environments like Deno and
Cloudflare Workers.
*/

const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime?model=gpt-realtime-2",
  [
    "realtime",
    // Auth
    "openai-insecure-api-key." + OPENAI_API_KEY,
    // Optional
    "openai-organization." + OPENAI_ORG_ID,
    "openai-project." + OPENAI_PROJECT_ID,
  ]
);

ws.on("open", function open() {
  console.log("Connected to server.");
});

ws.on("message", function incoming(message) {
  console.log(message.data);
});
```





## 发送和接收事件

Realtime API sessions 由你作为开发者发出的[客户端发送事件](https://developers.openai.com/api/docs/api-reference/realtime_client_events/session)，以及 Realtime API 创建、用于指示 session lifecycle events 的[服务端发送事件](https://developers.openai.com/api/docs/api-reference/realtime_server_events/error)共同管理。

在 WebSocket 上，你会以文本字符串的形式发送和接收 JSON 序列化事件，如下面这个 Node.js 示例所示（同样原则适用于其他 WebSocket libraries）：

```javascript
import WebSocket from "ws";

const url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-2";
const ws = new WebSocket(url, {
  headers: {
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    "OpenAI-Safety-Identifier": "hashed-user-id",
  },
});

ws.on("open", function open() {
  console.log("Connected to server.");

  // Send client events over the WebSocket once connected
  ws.send(
    JSON.stringify({
      type: "session.update",
      session: {
        type: "realtime",
        instructions: "Be extra nice today!",
      },
    })
  );
});

// Listen for and parse server events
ws.on("message", function incoming(message) {
  console.log(JSON.parse(message.toString()));
});
```


WebSocket interface 可能是可用于与 Realtime model 交互的最底层 interface，在这里你需要负责通过 socket connection 发送和处理 Base64-encoded audio chunks。

要了解如何通过 Websockets 发送和接收音频，请参阅 [Realtime conversations guide](/mirror/api/docs/guides/realtime-conversations#handling-audio-with-websockets)。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
[WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) are a broadly supported API for realtime data transfer, and a great choice for connecting to the OpenAI Realtime API in server-to-server applications. For browser and mobile clients, we recommend connecting via [WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc).

In a server-to-server integration with Realtime, your backend system will connect via WebSocket directly to the Realtime API. You can use a [standard API key](https://platform.openai.com/settings/organization/api-keys) to authenticate this connection, since the token will only be available on your secure backend server.

![connect directly to realtime API](https://openaidevs.retool.com/api/file/464d4334-c467-4862-901b-d0c6847f003a)

## Connect via WebSocket

Below are several examples of connecting via WebSocket to the Realtime API. In addition to using the WebSocket URL below, you will also need to pass an authentication header using your OpenAI API key. If your application assigns [safety identifiers](https://developers.openai.com/api/docs/guides/safety-best-practices#implement-safety-identifiers), pass the stable, privacy-preserving identifier for the end user in the `OpenAI-Safety-Identifier` header.

It is possible to use WebSocket in browsers with an ephemeral API token as shown in the [WebRTC connection guide](https://developers.openai.com/api/docs/guides/realtime-webrtc), but if you are connecting from a client like a browser or mobile app, WebRTC will be a more robust solution in most cases.



<div data-content-switcher-pane data-value="ws">
    <div class="hidden">ws module (Node.js)</div>
    Connect using the ws module (Node.js)

```javascript
import WebSocket from "ws";

const url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-2";
const ws = new WebSocket(url, {
  headers: {
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    "OpenAI-Safety-Identifier": "hashed-user-id",
  },
});

ws.on("open", function open() {
  console.log("Connected to server.");
});

ws.on("message", function incoming(message) {
  console.log(JSON.parse(message.toString()));
});
```

  </div>
  <div data-content-switcher-pane data-value="python" hidden>
    <div class="hidden">websocket-client (Python)</div>
    Connect with websocket-client (Python)

```python
# example requires websocket-client library:
# pip install websocket-client

import os
import json
import websocket

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-2"
headers = [
    "Authorization: Bearer " + OPENAI_API_KEY,
    "OpenAI-Safety-Identifier: hashed-user-id",
]


def on_open(ws):
    print("Connected to server.")


def on_message(ws, message):
    data = json.loads(message)
    print("Received event:", json.dumps(data, indent=2))


ws = websocket.WebSocketApp(
    url,
    header=headers,
    on_open=on_open,
    on_message=on_message,
)

ws.run_forever()
```

  </div>
  <div data-content-switcher-pane data-value="websocket" hidden>
    <div class="hidden">WebSocket (browsers)</div>
    Connect with standard WebSocket (browsers)

```javascript
/*
Note that in client-side environments like web browsers, we recommend
using WebRTC instead. It is possible, however, to use the standard
WebSocket interface in browser-like environments like Deno and
Cloudflare Workers.
*/

const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime?model=gpt-realtime-2",
  [
    "realtime",
    // Auth
    "openai-insecure-api-key." + OPENAI_API_KEY,
    // Optional
    "openai-organization." + OPENAI_ORG_ID,
    "openai-project." + OPENAI_PROJECT_ID,
  ]
);

ws.on("open", function open() {
  console.log("Connected to server.");
});

ws.on("message", function incoming(message) {
  console.log(message.data);
});
```

  </div>



## Sending and receiving events

Realtime API sessions are managed using a combination of [client-sent events](https://developers.openai.com/api/docs/api-reference/realtime_client_events/session) emitted by you as the developer, and [server-sent events](https://developers.openai.com/api/docs/api-reference/realtime_server_events/error) created by the Realtime API to indicate session lifecycle events.

Over a WebSocket, you will both send and receive JSON-serialized events as strings of text, as in this Node.js example below (the same principles apply for other WebSocket libraries):

```javascript
import WebSocket from "ws";

const url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-2";
const ws = new WebSocket(url, {
  headers: {
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    "OpenAI-Safety-Identifier": "hashed-user-id",
  },
});

ws.on("open", function open() {
  console.log("Connected to server.");

  // Send client events over the WebSocket once connected
  ws.send(
    JSON.stringify({
      type: "session.update",
      session: {
        type: "realtime",
        instructions: "Be extra nice today!",
      },
    })
  );
});

// Listen for and parse server events
ws.on("message", function incoming(message) {
  console.log(JSON.parse(message.toString()));
});
```


The WebSocket interface is perhaps the lowest-level interface available to interact with a Realtime model, where you will be responsible for both sending and processing Base64-encoded audio chunks over the socket connection.

To learn how to send and receive audio over Websockets, refer to the [Realtime conversations guide](https://developers.openai.com/api/docs/guides/realtime-conversations#handling-audio-with-websockets).
``````
:::
:::

