---
title: "Webhooks 和服务端控制"
description: "Learn how to use webhooks and server-side controls with the Realtime API."
outline: deep
---

# Webhooks 和服务端控制

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/realtime-server-controls](https://developers.openai.com/api/docs/guides/realtime-server-controls)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/realtime-server-controls.md](https://developers.openai.com/api/docs/guides/realtime-server-controls.md)
- 抓取时间：2026-06-27T05:54:06.489Z
- Checksum：`441766a2896cbd615bdbaf848211d14d18138d2763b68ff502fd7c32f6613b19`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Realtime API 允许客户端通过 WebRTC 或 SIP 直接连接到 API 服务器。不过，你很可能希望工具使用和其他业务逻辑位于你的应用服务器上，以便让这些逻辑保持私密，并且不依赖具体客户端。

通过“sideband”控制通道连接，可以把工具使用、业务逻辑和其他细节安全地保留在服务端。我们现在为 SIP 和 WebRTC 连接都提供 sideband 选项。

sideband 连接意味着同一个 Realtime 会话有两个活跃连接：一个来自用户客户端，另一个来自你的应用服务器。服务器连接可用于监控会话、更新指令，以及响应工具调用。

## 使用 WebRTC

1. 当你[建立对等连接](/mirror/api/docs/guides/realtime-webrtc)时，会从 Realtime API 获取并接收一个 SDP 响应，用于配置连接。如果你使用的是 WebRTC 指南中的示例代码，它大致如下：

```javascript
const baseUrl = "https://api.openai.com/v1/realtime/calls";
const sdpResponse = await fetch(baseUrl, {
  method: "POST",
  body: offer.sdp,
  headers: {
    Authorization: `Bearer ${EPHEMERAL_KEY}`,
    "Content-Type": "application/sdp",
  },
});
```


2. fetch 响应会包含一个 `Location` header，其中有一个唯一 call ID，可在服务器上用它建立到同一个 Realtime 会话的 WebSocket 连接。

```javascript
// Location: /v1/realtime/calls/rtc_123456
const location = sdpResponse.headers.get("Location");
const callId = location?.split("/").pop();
console.log(callId);
```


3. 然后，在服务器上，你可以像使用典型的 Realtime API WebSocket 连接一样，[监听事件并配置会话](/mirror/api/docs/guides/realtime-conversations)。使用该 call ID 和如下 URL：
   `wss://api.openai.com/v1/realtime?call_id=rtc_xxxxx`，如下所示：

```javascript
import WebSocket from "ws";
const callId = "rtc_u1_9c6574da8b8a41a18da9308f4ad974ce";

// Connect to a WebSocket for the in-progress call
const url = "wss://api.openai.com/v1/realtime?call_id=" + callId;
const ws = new WebSocket(url, {
  headers: {
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
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


这样，你就可以在服务器上添加工具、监控会话并执行业务逻辑，而不需要在客户端配置这些动作。

## 使用 SIP

1. 用户通过 SIP 以电话方式连接到 OpenAI。
2. OpenAI 会向你的应用服务器 webhook URL 发送一个 webhook，通知你的应用会话状态。webhook 大致如下：

```json
POST https://my_website.com/webhook_endpoint
user-agent: OpenAI/1.0 (+https://platform.openai.com/docs/webhooks)
content-type: application/json
webhook-id: wh_685342e6c53c8190a1be43f081506c52 # unique id for idempotency
webhook-timestamp: 1750287078 # timestamp of delivery attempt
webhook-signature: v1,K5oZfzN95Z9UVu1EsfQmfVNQhnkZ2pj9o9NDN/H/pI4= # signature to verify authenticity from OpenAI

{
  "object": "event",
  "id": "evt_685343a1381c819085d44c354e1b330e",
  "type": "realtime.call.incoming",
  "created_at": 1750287018, // Unix timestamp
  "data": {
    "call_id": "some_unique_id",
    "sip_headers": [
      { "name": "From", "value": "sip:+142555512112@sip.example.com" },
      { "name": "To", "value": "sip:+18005551212@sip.example.com" },
      { "name": "Call-ID", "value": "03782086-4ce9-44bf-8b0d-4e303d2cc590"}
    ]
  }
}

```

3. 应用服务器会使用 webhook 中提供的 `call_id` 值，通过类似这样的 URL 打开到 Realtime API 的 WebSocket 连接：`wss://api.openai.com/v1/realtime?call_id={callId}`。该 WebSocket 连接会在 SIP 通话的生命周期内保持存在。

随后，可以使用这个 WebSocket 连接收发事件来控制通话，就像会话是通过 WebSocket 连接启动的一样。这包括监控通话、动态更新指令，以及响应工具调用。

:::

## English source

::: details 展开英文原文
::: v-pre
The Realtime API allows clients to connect directly to the API server via WebRTC or SIP. However, you'll most likely want tool use and other business logic to reside on your application server to keep this logic private and client-agnostic.

Keep tool use, business logic, and other details secure on the server side by connecting over a “sideband” control channel. We now have sideband options for both SIP and WebRTC connections.

A sideband connection means there are two active connections to the same Realtime session: one from the user's client and one from your application server. The server connection can be used to monitor the session, update instructions, and respond to tool calls.

## With WebRTC

1. When [establishing a peer connection](/mirror/api/docs/guides/realtime-webrtc) you fetch and receive an SDP response from the Realtime API to configure the connection. If you used the sample code from the WebRTC guide, that looks something like this:

```javascript
const baseUrl = "https://api.openai.com/v1/realtime/calls";
const sdpResponse = await fetch(baseUrl, {
  method: "POST",
  body: offer.sdp,
  headers: {
    Authorization: `Bearer ${EPHEMERAL_KEY}`,
    "Content-Type": "application/sdp",
  },
});
```


2. The fetch response will contain a `Location` header that has a unique call ID that can be used on the server to establish a WebSocket connection to that same Realtime session.

```javascript
// Location: /v1/realtime/calls/rtc_123456
const location = sdpResponse.headers.get("Location");
const callId = location?.split("/").pop();
console.log(callId);
```


3. On a server, you can then [listen for events and configure the session](/mirror/api/docs/guides/realtime-conversations) just as you would from a typical Realtime API WebSocket connection, using that call ID with the URL
   `wss://api.openai.com/v1/realtime?call_id=rtc_xxxxx`, as shown below:

```javascript
import WebSocket from "ws";
const callId = "rtc_u1_9c6574da8b8a41a18da9308f4ad974ce";

// Connect to a WebSocket for the in-progress call
const url = "wss://api.openai.com/v1/realtime?call_id=" + callId;
const ws = new WebSocket(url, {
  headers: {
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
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


In this way, you are able to add tools, monitor sessions, and carry out business logic on the server instead of needing to configure those actions on the client.

## With SIP

1. A user connects to OpenAI via phone over SIP.
2. OpenAI sends a webhook to your application’s server webhook URL, notifying your app of the state of the session. The webhook will look something like:

```json
POST https://my_website.com/webhook_endpoint
user-agent: OpenAI/1.0 (+https://platform.openai.com/docs/webhooks)
content-type: application/json
webhook-id: wh_685342e6c53c8190a1be43f081506c52 # unique id for idempotency
webhook-timestamp: 1750287078 # timestamp of delivery attempt
webhook-signature: v1,K5oZfzN95Z9UVu1EsfQmfVNQhnkZ2pj9o9NDN/H/pI4= # signature to verify authenticity from OpenAI

{
  "object": "event",
  "id": "evt_685343a1381c819085d44c354e1b330e",
  "type": "realtime.call.incoming",
  "created_at": 1750287018, // Unix timestamp
  "data": {
    "call_id": "some_unique_id",
    "sip_headers": [
      { "name": "From", "value": "sip:+142555512112@sip.example.com" },
      { "name": "To", "value": "sip:+18005551212@sip.example.com" },
      { "name": "Call-ID", "value": "03782086-4ce9-44bf-8b0d-4e303d2cc590"}
    ]
  }
}

```

3. The application server opens a WebSocket connection to the Realtime API using the `call_id` value provided in the webhook, via a URL like this: `wss://api.openai.com/v1/realtime?call_id={callId}`. The WebSocket connection will live for the life of the SIP call.

The WebSocket connection can then be used to send and receive events to control the call, just as you would if the session was initiated with a WebSocket connection. This includes monitoring the call, updating instructions dynamically, and responding to tool calls.

:::
:::

