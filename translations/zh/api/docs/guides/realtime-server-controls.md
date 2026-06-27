---
status: needs-review
sourceId: "441766a2896c"
sourceChecksum: "441766a2896cbd615bdbaf848211d14d18138d2763b68ff502fd7c32f6613b19"
sourceUrl: "https://developers.openai.com/api/docs/guides/realtime-server-controls"
translatedAt: "2026-06-27T18:23:48.7352177+08:00"
translator: codex-gpt-5.5-xhigh
---

# Webhooks 和服务端控制

Realtime API 允许客户端通过 WebRTC 或 SIP 直接连接到 API 服务器。不过，你很可能希望工具使用和其他业务逻辑位于你的应用服务器上，以便让这些逻辑保持私密，并且不依赖具体客户端。

通过“sideband”控制通道连接，可以把工具使用、业务逻辑和其他细节安全地保留在服务端。我们现在为 SIP 和 WebRTC 连接都提供 sideband 选项。

sideband 连接意味着同一个 Realtime 会话有两个活跃连接：一个来自用户客户端，另一个来自你的应用服务器。服务器连接可用于监控会话、更新指令，以及响应工具调用。

## 使用 WebRTC

1. 当你[建立对等连接](https://developers.openai.com/api/docs/guides/realtime-webrtc)时，会从 Realtime API 获取并接收一个 SDP 响应，用于配置连接。如果你使用的是 WebRTC 指南中的示例代码，它大致如下：

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


3. 然后，在服务器上，你可以像使用典型的 Realtime API WebSocket 连接一样，[监听事件并配置会话](https://developers.openai.com/api/docs/guides/realtime-conversations)。使用该 call ID 和如下 URL：
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
