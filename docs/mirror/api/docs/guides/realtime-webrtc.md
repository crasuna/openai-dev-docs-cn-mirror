---
title: "使用 WebRTC 的 Realtime API"
description: "Learn how to connect to the Realtime API using WebRTC."
outline: deep
---

# 使用 WebRTC 的 Realtime API

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/realtime-webrtc](https://developers.openai.com/api/docs/guides/realtime-webrtc)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/realtime-webrtc.md](https://developers.openai.com/api/docs/guides/realtime-webrtc.md)
- 抓取时间：2026-06-27T05:54:06.973Z
- Checksum：`b9d64da5d3c6bf21e2c791876b7f4ad71f82ee4d594a4d99a7f1949dc91f4304`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
[WebRTC](https://webrtc.org/) 是一组强大的标准接口，用于构建实时应用。OpenAI Realtime API 支持通过 WebRTC peer connection 连接到 realtime models。

对于基于浏览器的 speech-to-speech 语音应用，我们建议从 [Voice agents](/mirror/api/docs/guides/voice-agents) 开始，它涵盖了 Agents SDK 用于管理 Realtime sessions 的更高层 helpers 和 API。WebRTC interface 强大且灵活，但比 Agents SDK 更底层。

当从客户端（例如 web browser 或
  mobile device）连接到 Realtime model 时，我们建议使用 WebRTC，而不是 WebSockets，以获得更
  稳定的性能。

如需关于在 WebRTC 上构建用户界面的更多指导，请[参考 MDN 文档](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)。

## 概览

Realtime API 支持从浏览器连接到 Realtime API 的两种机制：使用 ephemeral API keys（[通过 OpenAI REST API 生成](https://developers.openai.com/api/docs/api-reference/realtime-sessions)），或使用新的 unified interface。通常来说，使用 unified interface 更简单，但会让你的应用服务器处在 session 初始化的关键路径上。

### 使用 unified interface 连接

使用 unified interface 初始化 WebRTC 连接的流程如下（假设客户端是 web browser）：

1. 浏览器使用来自其 WebRTC peer connection 的 SDP data，向开发者控制的服务器发出请求。
2. 服务器将该 SDP 与其 session configuration 合并为 multipart form，并发送给 OpenAI Realtime API，使用其[标准 API key](https://platform.openai.com/settings/organization/api-keys) 进行认证。

#### 通过 unified interface 创建 session

要通过 unified interface 创建 realtime API session，你需要构建一个小型服务端应用（或集成到现有应用中），向 `/v1/realtime/calls` 发出请求。你将在后端服务器上使用[标准 API key](https://platform.openai.com/settings/organization/api-keys) 对该请求进行认证。

下面是一个简单的 Node.js [express](https://expressjs.com/) 服务器示例，它创建 realtime API session：

```javascript
import express from "express";

const app = express();

// Parse raw SDP payloads posted from the browser
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

const sessionConfig = JSON.stringify({
  type: "realtime",
  model: "gpt-realtime-2",
  audio: { output: { voice: "marin" } },
});

// An endpoint which creates a Realtime API session.
app.post("/session", async (req, res) => {
  const fd = new FormData();
  fd.set("sdp", req.body);
  fd.set("session", sessionConfig);

  try {
    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Safety-Identifier": "hashed-user-id",
      },
      body: fd,
    });
    // Send back the SDP we received from the OpenAI REST API
    const sdp = await r.text();
    res.send(sdp);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(3000);
```


如果你的应用为每个最终用户分配 [safety identifier](/mirror/api/docs/guides/safety-best-practices#implement-safety-identifiers)，请在这个
服务端请求中将其作为 `OpenAI-Safety-Identifier` header 包含进去。请使用稳定、保护隐私的值，例如哈希后的
内部用户 ID。该 header 应由可信后端设置，而不是由
浏览器设置。

#### 连接到服务器

在浏览器中，你可以使用标准 WebRTC APIs，通过你的应用服务器连接到 Realtime API。客户端会将自己的 SDP data 直接 POST 到你的服务器。

```javascript
// Create a peer connection
const pc = new RTCPeerConnection();

// Set up to play remote audio from the model
audioElement.current = document.createElement("audio");
audioElement.current.autoplay = true;
pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

// Add local audio track for microphone input in the browser
const ms = await navigator.mediaDevices.getUserMedia({
  audio: true,
});
pc.addTrack(ms.getTracks()[0]);

// Set up data channel for sending and receiving events
const dc = pc.createDataChannel("oai-events");

// Start the session using the Session Description Protocol (SDP)
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const sdpResponse = await fetch("/session", {
  method: "POST",
  body: offer.sdp,
  headers: {
    "Content-Type": "application/sdp",
  },
});

const answer = {
  type: "answer",
  sdp: await sdpResponse.text(),
};
await pc.setRemoteDescription(answer);
```


### 使用 ephemeral token 连接

使用 ephemeral API key 初始化 WebRTC 连接的流程如下（假设客户端是 web browser）：

1. 浏览器向开发者控制的服务器发出请求，以 mint 一个 ephemeral API key。
1. 开发者的服务器使用[标准 API key](https://platform.openai.com/settings/organization/api-keys) 向 [OpenAI REST API](https://developers.openai.com/api/docs/api-reference/realtime-sessions) 请求 ephemeral key，并将这个新 key 返回给浏览器。
1. 浏览器使用 ephemeral key，将一个 session 作为 [WebRTC peer connection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection) 直接向 OpenAI Realtime API 认证。

![connect to realtime via WebRTC](https://openaidevs.retool.com/api/file/55b47800-9aaf-48b9-90d5-793ab227ddd3)

#### 创建 ephemeral token

要创建可在客户端使用的 ephemeral token，你需要构建一个小型服务端应用（或集成到现有应用中），向 [OpenAI REST API](https://developers.openai.com/api/docs/api-reference/realtime-sessions) 发出请求以获取 ephemeral key。你将在后端服务器上使用[标准 API key](https://platform.openai.com/settings/organization/api-keys) 对该请求进行认证。

下面是一个简单的 Node.js [express](https://expressjs.com/) 服务器示例，它使用 REST API mint 一个 ephemeral API key：

```javascript
import express from "express";

const app = express();

const sessionConfig = JSON.stringify({
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    audio: {
      output: {
        voice: "marin",
      },
    },
  },
});

// An endpoint which would work with the client code above - it returns
// the contents of a REST API request to this protected endpoint
app.get("/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Safety-Identifier": "hashed-user-id",
        },
        body: sessionConfig,
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(3000);
```


你可以在任何能够发送和接收 HTTP 请求的平台上创建这样的 server endpoint。请确保 **标准 OpenAI API keys 只在服务器上使用，不要在浏览器中使用。**

使用 ephemeral tokens 时，请在创建 client secret 的服务端
请求上设置 `OpenAI-Safety-Identifier`。Realtime API 会将 identifier 绑定到
生成的 ephemeral token，因此浏览器稍后使用该 token 连接时不需要发送 safety
identifier。

#### 连接到服务器

在浏览器中，你可以使用标准 WebRTC APIs，借助 ephemeral token 连接到 Realtime API。客户端首先从你的 server endpoint 获取 token，然后将其 SDP data（带 ephemeral token）POST 到 Realtime API。

```javascript
// Get a session token for OpenAI Realtime API
const tokenResponse = await fetch("/token");
const data = await tokenResponse.json();
const EPHEMERAL_KEY = data.value;

// Create a peer connection
const pc = new RTCPeerConnection();

// Set up to play remote audio from the model
audioElement.current = document.createElement("audio");
audioElement.current.autoplay = true;
pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

// Add local audio track for microphone input in the browser
const ms = await navigator.mediaDevices.getUserMedia({
  audio: true,
});
pc.addTrack(ms.getTracks()[0]);

// Set up data channel for sending and receiving events
const dc = pc.createDataChannel("oai-events");

// Start the session using the Session Description Protocol (SDP)
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
  method: "POST",
  body: offer.sdp,
  headers: {
    Authorization: `Bearer ${EPHEMERAL_KEY}`,
    "Content-Type": "application/sdp",
  },
});

const answer = {
  type: "answer",
  sdp: await sdpResponse.text(),
};
await pc.setRemoteDescription(answer);
```


## 发送和接收事件

Realtime API sessions 由你作为开发者发出的[客户端发送事件](https://developers.openai.com/api/docs/api-reference/realtime_client_events/session)，以及 Realtime API 创建、用于指示 session lifecycle events 的[服务端发送事件](https://developers.openai.com/api/docs/api-reference/realtime_server_events/error)共同管理。

通过 WebRTC 连接到 Realtime model 时，你不需要像使用 [WebSockets](/mirror/api/docs/guides/realtime-websocket) 那样以同样细粒度处理来自模型的音频事件。如果按上面方式配置，WebRTC peer connection object 会为你完成这些工作。

要发送和接收其他 client 和 server events，可以使用 WebRTC peer connection 的 [data channel](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels)。

```javascript
// This is the data channel set up in the browser code above...
const dc = pc.createDataChannel("oai-events");

// Listen for server events
dc.addEventListener("message", (e) => {
  const event = JSON.parse(e.data);
  console.log(event);
});

// Send client events
const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_text",
        text: "hello there!",
      },
    ],
  },
};
dc.send(JSON.stringify(event));
```


要进一步了解如何管理 Realtime conversations，请参阅 [Realtime conversations guide](/mirror/api/docs/guides/realtime-conversations)。

&lt;a
  href="https://github.com/openai/openai-realtime-console/"
  target="_blank"
  rel="noreferrer"
&gt;
  



    在这个轻量示例应用中查看 WebRTC Realtime API。




:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
[WebRTC](https://webrtc.org/) is a powerful set of standard interfaces for building real-time applications. The OpenAI Realtime API supports connecting to realtime models through a WebRTC peer connection.

For browser-based speech-to-speech voice applications, we recommend starting with [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents), which covers the Agents SDK's higher-level helpers and APIs for managing Realtime sessions. The WebRTC interface is powerful and flexible, but lower level than the Agents SDK.

When connecting to a Realtime model from the client (like a web browser or
  mobile device), we recommend using WebRTC rather than WebSockets for more
  consistent performance.

For more guidance on building user interfaces on top of WebRTC, [refer to the docs on MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API).

## Overview

The Realtime API supports two mechanisms for connecting to the Realtime API from the browser, either using ephemeral API keys ([generated via the OpenAI REST API](https://developers.openai.com/api/docs/api-reference/realtime-sessions)), or via the new unified interface. Generally, using the unified interface is simpler, but puts your application server in the critical path for session initialization.

### Connecting using the unified interface

The process for initializing a WebRTC connection using the unified interface is as follows (assuming a web browser client):

1. The browser makes a request to a developer-controlled server using the SDP data from its WebRTC peer connection.
2. The server combines that SDP with its session configuration in a multipart form and sends that to the OpenAI Realtime API, authenticating it with its [standard API key](https://platform.openai.com/settings/organization/api-keys).

#### Creating a session via the unified interface

To create a realtime API session via the unified interface, you will need to build a small server-side application (or integrate with an existing one) to make an request to `/v1/realtime/calls`. You will use a [standard API key](https://platform.openai.com/settings/organization/api-keys) to authenticate this request on your backend server.

Below is an example of a simple Node.js [express](https://expressjs.com/) server which creates a realtime API session:

```javascript
import express from "express";

const app = express();

// Parse raw SDP payloads posted from the browser
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

const sessionConfig = JSON.stringify({
  type: "realtime",
  model: "gpt-realtime-2",
  audio: { output: { voice: "marin" } },
});

// An endpoint which creates a Realtime API session.
app.post("/session", async (req, res) => {
  const fd = new FormData();
  fd.set("sdp", req.body);
  fd.set("session", sessionConfig);

  try {
    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Safety-Identifier": "hashed-user-id",
      },
      body: fd,
    });
    // Send back the SDP we received from the OpenAI REST API
    const sdp = await r.text();
    res.send(sdp);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(3000);
```


If your application assigns a [safety identifier](https://developers.openai.com/api/docs/guides/safety-best-practices#implement-safety-identifiers)
for each end user, include it as the `OpenAI-Safety-Identifier` header in this
server-side request. Use a stable, privacy-preserving value, such as a hashed
internal user ID. The header should be set by your trusted backend, not by the
browser.

#### Connecting to the server

In the browser, you can use standard WebRTC APIs to connect to the Realtime API via your application server. The client directly POSTs its SDP data to your server.

```javascript
// Create a peer connection
const pc = new RTCPeerConnection();

// Set up to play remote audio from the model
audioElement.current = document.createElement("audio");
audioElement.current.autoplay = true;
pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

// Add local audio track for microphone input in the browser
const ms = await navigator.mediaDevices.getUserMedia({
  audio: true,
});
pc.addTrack(ms.getTracks()[0]);

// Set up data channel for sending and receiving events
const dc = pc.createDataChannel("oai-events");

// Start the session using the Session Description Protocol (SDP)
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const sdpResponse = await fetch("/session", {
  method: "POST",
  body: offer.sdp,
  headers: {
    "Content-Type": "application/sdp",
  },
});

const answer = {
  type: "answer",
  sdp: await sdpResponse.text(),
};
await pc.setRemoteDescription(answer);
```


### Connecting using an ephemeral token

The process for initializing a WebRTC connection using an ephemeral API key is as follows (assuming a web browser client):

1. The browser makes a request to a developer-controlled server to mint an ephemeral API key.
1. The developer's server uses a [standard API key](https://platform.openai.com/settings/organization/api-keys) to request an ephemeral key from the [OpenAI REST API](https://developers.openai.com/api/docs/api-reference/realtime-sessions), and returns that new key to the browser.
1. The browser uses the ephemeral key to authenticate a session directly with the OpenAI Realtime API as a [WebRTC peer connection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection).

![connect to realtime via WebRTC](https://openaidevs.retool.com/api/file/55b47800-9aaf-48b9-90d5-793ab227ddd3)

#### Creating an ephemeral token

To create an ephemeral token to use on the client-side, you will need to build a small server-side application (or integrate with an existing one) to make an [OpenAI REST API](https://developers.openai.com/api/docs/api-reference/realtime-sessions) request for an ephemeral key. You will use a [standard API key](https://platform.openai.com/settings/organization/api-keys) to authenticate this request on your backend server.

Below is an example of a simple Node.js [express](https://expressjs.com/) server which mints an ephemeral API key using the REST API:

```javascript
import express from "express";

const app = express();

const sessionConfig = JSON.stringify({
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    audio: {
      output: {
        voice: "marin",
      },
    },
  },
});

// An endpoint which would work with the client code above - it returns
// the contents of a REST API request to this protected endpoint
app.get("/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Safety-Identifier": "hashed-user-id",
        },
        body: sessionConfig,
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(3000);
```


You can create a server endpoint like this one on any platform that can send and receive HTTP requests. Just ensure that **you only use standard OpenAI API keys on the server, not in the browser.**

When using ephemeral tokens, set `OpenAI-Safety-Identifier` on the server-side
request that creates the client secret. The Realtime API binds the identifier to
the resulting ephemeral token, so the browser does not need to send the safety
identifier when it later connects with that token.

#### Connecting to the server

In the browser, you can use standard WebRTC APIs to connect to the Realtime API with an ephemeral token. The client first fetches a token from your server endpoint, and then POSTs its SDP data (with the ephemeral token) to the Realtime API.

```javascript
// Get a session token for OpenAI Realtime API
const tokenResponse = await fetch("/token");
const data = await tokenResponse.json();
const EPHEMERAL_KEY = data.value;

// Create a peer connection
const pc = new RTCPeerConnection();

// Set up to play remote audio from the model
audioElement.current = document.createElement("audio");
audioElement.current.autoplay = true;
pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

// Add local audio track for microphone input in the browser
const ms = await navigator.mediaDevices.getUserMedia({
  audio: true,
});
pc.addTrack(ms.getTracks()[0]);

// Set up data channel for sending and receiving events
const dc = pc.createDataChannel("oai-events");

// Start the session using the Session Description Protocol (SDP)
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
  method: "POST",
  body: offer.sdp,
  headers: {
    Authorization: `Bearer ${EPHEMERAL_KEY}`,
    "Content-Type": "application/sdp",
  },
});

const answer = {
  type: "answer",
  sdp: await sdpResponse.text(),
};
await pc.setRemoteDescription(answer);
```


## Sending and receiving events

Realtime API sessions are managed using a combination of [client-sent events](https://developers.openai.com/api/docs/api-reference/realtime_client_events/session) emitted by you as the developer, and [server-sent events](https://developers.openai.com/api/docs/api-reference/realtime_server_events/error) created by the Realtime API to indicate session lifecycle events.

When connecting to a Realtime model via WebRTC, you don't have to handle audio events from the model in the same granular way you must with [WebSockets](https://developers.openai.com/api/docs/guides/realtime-websocket). The WebRTC peer connection object, if configured as above, will do all that work for you.

To send and receive other client and server events, you can use the WebRTC peer connection's [data channel](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels).

```javascript
// This is the data channel set up in the browser code above...
const dc = pc.createDataChannel("oai-events");

// Listen for server events
dc.addEventListener("message", (e) => {
  const event = JSON.parse(e.data);
  console.log(event);
});

// Send client events
const event = {
  type: "conversation.item.create",
  item: {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_text",
        text: "hello there!",
      },
    ],
  },
};
dc.send(JSON.stringify(event));
```


To learn more about managing Realtime conversations, refer to the [Realtime conversations guide](https://developers.openai.com/api/docs/guides/realtime-conversations).

<a
  href="https://github.com/openai/openai-realtime-console/"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Check out the WebRTC Realtime API in this light weight example app.


</a>
``````
:::
:::

