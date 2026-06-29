---
title: "使用 SIP 的 Realtime API"
description: "Learn how to connect to the Realtime API using SIP."
outline: deep
---

# 使用 SIP 的 Realtime API

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/realtime-sip](https://developers.openai.com/api/docs/guides/realtime-sip)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/realtime-sip.md](https://developers.openai.com/api/docs/guides/realtime-sip.md)
- 抓取时间：2026-06-27T05:54:06.652Z
- Checksum：`ae0f46a3228c458b19a54a91cb902693c4cdff01d6ba146b2cc3e4d28be2998d`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
[SIP](https://en.wikipedia.org/wiki/Session_Initiation_Protocol) 是一种
用于通过互联网拨打电话的协议。借助 SIP 和
Realtime API，你可以将传入电话呼叫定向到 API。

## 概览

如果你想将电话号码连接到 Realtime API，
请使用 SIP trunking provider（例如 Twilio）。这是一种将电话呼叫
转换为 IP 流量的服务。向 SIP trunking
provider 购买电话号码后，请按照下面的说明操作。

首先，请通过 **platform.openai.com** [settings](https://platform.openai.com/settings) &gt; Project &gt; **Webhooks** 为传入呼叫创建一个 [webhook](/mirror/api/docs/guides/webhooks)。
然后，使用你为其配置 webhook 的 project ID，
将你的 SIP trunk 指向 OpenAI SIP endpoint，例如 `sip:$PROJECT_ID@sip.api.openai.com;transport=tls`。
要查找 `$PROJECT_ID`，请访问 [settings](https://platform.openai.com/settings) &gt; Project &gt; **General**。该页面会显示 project ID，
它将带有 `proj_` 前缀。

当 OpenAI 收到与你的项目关联的 SIP 流量时，
你的 webhook 会被触发。触发的事件将是
[`realtime.call.incoming`](https://developers.openai.com/api/docs/api-reference/webhook-events/realtime/call/incoming) 事件，
如下例所示：

```
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

从这个 webhook 中，你可以使用 webhook 中的 `call_id` 值接受或拒绝呼叫。
接受呼叫时，你将为 Realtime API session 提供所需配置
（instructions、voice 等）。
建立后，你可以照常设置 WebSocket 并监控 session。用于
接受、拒绝、监控、refer 和 hangup 呼叫的 API 记录如下。

## 接受呼叫

使用 [Accept call endpoint](https://developers.openai.com/api/docs/api-reference/realtime-calls/accept-call)
批准入站呼叫，并配置将接听它的 realtime session。
发送与你在
[`create client secret`](https://developers.openai.com/api/docs/api-reference/realtime-sessions/create-realtime-client-secret)
请求中相同的参数，也就是确保在将呼叫桥接到模型前设置 realtime model、voice、tools 或 instructions。

```bash
curl -X POST "https://api.openai.com/v1/realtime/calls/$CALL_ID/accept" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "type": "realtime",
        "model": "gpt-realtime-2",
        "instructions": "You are Alex, a friendly concierge for Example Corp."
      }'
```


请求路径必须包含
[`realtime.call.incoming`](https://developers.openai.com/api/docs/api-reference/webhook-events/realtime/call/incoming)
webhook 中的 `call_id`，且每个请求都需要上面显示的 `Authorization` header。当 SIP leg 开始振铃并且 realtime session
正在建立时，endpoint 会返回 `200 OK`。

## 拒绝呼叫

当你不想处理传入呼叫时（例如来自不支持的国家/地区代码），使用 [Reject call endpoint](https://developers.openai.com/api/docs/api-reference/realtime-calls/reject-call)
拒绝 invite。在 JSON
body 中提供 `call_id` path parameter
以及可选的 SIP `status_code`（例如 `486` 表示“busy”），以控制发回给运营商的响应。

```bash
curl -X POST "https://api.openai.com/v1/realtime/calls/$CALL_ID/reject" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status_code": 486}'
```


如果未提供 status code，API 默认使用 `603 Decline`。在 OpenAI 发送 SIP
响应后，成功请求会以 `200 OK` 响应。

## 监控呼叫事件

接受呼叫后，打开到同一 session 的 WebSocket 连接，以
流式传输事件并发出 realtime commands。请注意，使用 `call_id` 参数连接到现有
呼叫时，`model` argument 不会被使用（因为它已经通过 `accept` endpoint 配置）。

### WebSocket request

`GET wss://api.openai.com/v1/realtime?call_id={call_id}`

### Query parameters

| Parameter | Type   | Description                                           |
| --------- | ------ | ----------------------------------------------------- |
| `call_id` | string | 来自 `realtime.call.incoming` webhook 的 identifier。 |

### Headers

- `Authorization: Bearer YOUR_API_KEY`

这个 WebSocket 的行为与其他任何 Realtime API 连接完全相同。发送
[`response.create`](https://developers.openai.com/api/docs/api-reference/realtime_client_events/response/create)
和其他 client events 来控制呼叫，并监听 server events 来
跟踪进度。更多信息请参阅 [Webhooks and server-side controls](/mirror/api/docs/guides/realtime-server-controls)。

```javascript
import WebSocket from "ws";

const callId = "rtc_u1_9c6574da8b8a41a18da9308f4ad974ce";
const ws = new WebSocket(`wss://api.openai.com/v1/realtime?call_id=${callId}`, {
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
});

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "response.create",
    })
  );
});
```


## 重定向呼叫

使用
[Refer call endpoint](https://developers.openai.com/api/docs/api-reference/realtime-calls/refer-call) 转移正在进行的呼叫。提供
`call_id` 以及应放入 SIP `Refer-To`
header 的 `target_uri`（例如 `tel:+14155550123` 或 `sip:agent@example.com`）。

```bash
curl -X POST "https://api.openai.com/v1/realtime/calls/$CALL_ID/refer" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"target_uri": "tel:+14155550123"}'
```


OpenAI 会在 REFER 中继到你的 SIP provider 后返回 `200 OK`。下游系统会为呼叫者处理剩余的 call flow。

## 挂断呼叫

当你的应用应断开呼叫者连接时，使用 [Hang up endpoint](https://developers.openai.com/api/docs/api-reference/realtime-calls/hangup-call)
结束 session。此 endpoint 可用于
终止 SIP 和 WebRTC realtime sessions。

```bash
curl -X POST "https://api.openai.com/v1/realtime/calls/$CALL_ID/hangup" \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```


当 API 开始拆除呼叫时，会以 `200 OK` 响应。

## 专用 SIP IP ranges

如果你需要 allowlist OpenAI SIP 流量。`sip.api.openai.com` 会进行 GeoIP routing，你
将连接到最近的区域。

- `13.79.45.80/28` for `northeurope`
- `23.98.140.64/28` for `southcentralus`
- `40.67.149.176/28` for `eastus2`
- `40.83.204.240/28` for `westus`

## Python 示例

下面是一个 `realtime.call.incoming` handler 示例。它接受呼叫，然后记录来自
Realtime API 的所有事件。




Python
    Python

```python
from flask import Flask, request, Response, jsonify, make_response
from openai import OpenAI, InvalidWebhookSignatureError
import asyncio
import json
import os
import requests
import time
import threading
import websockets

app = Flask(__name__)
client = OpenAI(
    webhook_secret=os.environ["OPENAI_WEBHOOK_SECRET"]
)

AUTH_HEADER = {
    "Authorization": "Bearer " + os.getenv("OPENAI_API_KEY")
}

call_accept = {
    "type": "realtime",
    "instructions": "You are a support agent.",
    "model": "gpt-realtime-2",
}

response_create = {
    "type": "response.create",
    "response": {
        "instructions": (
            "Say to the user 'Thank you for calling, how can I help you'"
        )
    },
}


async def websocket_task(call_id):
    try:
        async with websockets.connect(
            "wss://api.openai.com/v1/realtime?call_id=" + call_id,
            additional_headers=AUTH_HEADER,
        ) as websocket:
            await websocket.send(json.dumps(response_create))

            while True:
                response = await websocket.recv()
                print(f"Received from WebSocket: {response}")
    except Exception as e:
        print(f"WebSocket error: {e}")


@app.route("/", methods=["POST"])
def webhook():
    try:
        event = client.webhooks.unwrap(request.data, request.headers)

        if event.type == "realtime.call.incoming":
            requests.post(
                "https://api.openai.com/v1/realtime/calls/"
                + event.data.call_id
                + "/accept",
                headers={**AUTH_HEADER, "Content-Type": "application/json"},
                json=call_accept,
            )
            threading.Thread(
                target=lambda: asyncio.run(
                    websocket_task(event.data.call_id)
                ),
                daemon=True,
            ).start()
            return Response(status=200)
    except InvalidWebhookSignatureError as e:
        print("Invalid signature", e)
        return Response("Invalid signature", status=400)


if __name__ == "__main__":
    app.run(port=8000)
```





## 后续步骤

现在你已经通过 SIP 连接，请使用左侧导航或点击进入这些页面，开始构建你的 realtime application。

- [Realtime prompting guide](/mirror/api/docs/guides/realtime-models-prompting)
- [Managing conversations](/mirror/api/docs/guides/realtime-conversations)
- [Webhooks and server-side controls](/mirror/api/docs/guides/realtime-server-controls)
- [Managing costs](/mirror/api/docs/guides/realtime-costs)
- [Realtime transcription](/mirror/api/docs/guides/realtime-transcription)

### 其他资源

- [JavaScript demo](https://hello-realtime.val.run/)
- [将 Realtime SIP Connector 连接到 Twilio Elastic SIP Trunking](https://www.twilio.com/en-us/blog/developers/tutorials/product/openai-realtime-api-elastic-sip-trunking)

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
[SIP](https://en.wikipedia.org/wiki/Session_Initiation_Protocol) is a
protocol used to make phone calls over the internet. With SIP and the
Realtime API you can direct incoming phone calls to the API.

## Overview

If you want to connect a phone number to the Realtime API,
use a SIP trunking provider (e.g., Twilio). This is a service that converts your phone call
to IP traffic. After you purchase a phone number from your SIP trunking
provider, follow the instructions below.

Start by creating a [webhook](https://developers.openai.com/api/docs/guides/webhooks) for incoming calls, through your **platform.openai.com** [settings](https://platform.openai.com/settings) > Project > **Webhooks**.
Then, point your SIP trunk at the OpenAI SIP endpoint, using the project ID
for which you configured the webhook, e.g., `sip:$PROJECT_ID@sip.api.openai.com;transport=tls`.
To find your `$PROJECT_ID`, visit [settings](https://platform.openai.com/settings) > Project > **General**. That page will display the project ID, which
will have a `proj_` prefix.

When OpenAI receives SIP traffic associated with your project,
your webhook will be fired. The event fired will be a
[`realtime.call.incoming`](https://developers.openai.com/api/docs/api-reference/webhook-events/realtime/call/incoming) event,
like the example below:

```
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

From this webhook, you can accept or reject the call, using the `call_id` value from the webhook.
When accepting the call, you'll provide the needed configuration
(instructions, voice, etc) for the Realtime API session.
Once established, you can set up a WebSocket and monitor the session as usual. The APIs to
accept, reject, monitor, refer, and hangup the call are documented below.

## Accept the call

Use the [Accept call endpoint](https://developers.openai.com/api/docs/api-reference/realtime-calls/accept-call) to
approve the inbound call and configure the realtime session that will answer it.
Send the same parameters you would send in a
[`create client secret`](https://developers.openai.com/api/docs/api-reference/realtime-sessions/create-realtime-client-secret)
request, i.e., ensure the realtime model, voice, tools, or instructions are set before bridging the
call to the model.

```bash
curl -X POST "https://api.openai.com/v1/realtime/calls/$CALL_ID/accept" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "type": "realtime",
        "model": "gpt-realtime-2",
        "instructions": "You are Alex, a friendly concierge for Example Corp."
      }'
```


The request path must include the `call_id` from the
[`realtime.call.incoming`](https://developers.openai.com/api/docs/api-reference/webhook-events/realtime/call/incoming)
webhook, and every request requires the `Authorization` header shown above. The
endpoint returns `200 OK` once the SIP leg is ringing and the realtime session
is being established.

## Reject the call

Use the [Reject call endpoint](https://developers.openai.com/api/docs/api-reference/realtime-calls/reject-call) to
decline an invite when you do not want to handle the incoming call, (e.g., from
an unsupported country code.) Supply the `call_id` path parameter
and an optional SIP `status_code` (e.g., `486` to indicate "busy") in the JSON
body to control the response sent back to the carrier.

```bash
curl -X POST "https://api.openai.com/v1/realtime/calls/$CALL_ID/reject" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status_code": 486}'
```


If no status code is supplied the API uses `603 Decline` by default. A
successful request responds with `200 OK` after OpenAI delivers the SIP
response.

## Monitor call events

After you accept a call, open a WebSocket connection to the same session to
stream events and issue realtime commands. Note that when connecting to an existing
call using the `call_id` parameter, the `model` argument is not used (as it has already been configured
via the `accept` endpoint).

### WebSocket request

`GET wss://api.openai.com/v1/realtime?call_id={call_id}`

### Query parameters

| Parameter | Type   | Description                                           |
| --------- | ------ | ----------------------------------------------------- |
| `call_id` | string | Identifier from the `realtime.call.incoming` webhook. |

### Headers

- `Authorization: Bearer YOUR_API_KEY`

The WebSocket behaves exactly like any other Realtime API connection. Send
[`response.create`](https://developers.openai.com/api/docs/api-reference/realtime_client_events/response/create),
and other client events to control the call, and listen for server events to
track progress. See [Webhooks and server-side controls](https://developers.openai.com/api/docs/guides/realtime-server-controls)
for more information.

```javascript
import WebSocket from "ws";

const callId = "rtc_u1_9c6574da8b8a41a18da9308f4ad974ce";
const ws = new WebSocket(`wss://api.openai.com/v1/realtime?call_id=${callId}`, {
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
});

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "response.create",
    })
  );
});
```


## Redirect the call

Transfer an active call using the
[Refer call endpoint](https://developers.openai.com/api/docs/api-reference/realtime-calls/refer-call). Provide the
`call_id` as well as the `target_uri` that should be placed in the SIP `Refer-To`
header (for example `tel:+14155550123` or `sip:agent@example.com`).

```bash
curl -X POST "https://api.openai.com/v1/realtime/calls/$CALL_ID/refer" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"target_uri": "tel:+14155550123"}'
```


OpenAI returns `200 OK` once the REFER is relayed to your SIP provider. The
downstream system handles the rest of the call flow for the caller.

## Hang up the call

End the session with the [Hang up endpoint](https://developers.openai.com/api/docs/api-reference/realtime-calls/hangup-call)
when your application should disconnect the caller. This endpoint can be used to
terminate both SIP and WebRTC realtime sessions.

```bash
curl -X POST "https://api.openai.com/v1/realtime/calls/$CALL_ID/hangup" \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```


The API responds with `200 OK` when it starts tearing down the call.

## Dedicated SIP IP ranges

If you need to allowlist OpenAI SIP traffic. `sip.api.openai.com` does GeoIP routing, you
will be connected to the closest region.

- `13.79.45.80/28` for `northeurope`
- `23.98.140.64/28` for `southcentralus`
- `40.67.149.176/28` for `eastus2`
- `40.83.204.240/28` for `westus`

## Python example

The following is an example of a `realtime.call.incoming` handler. It accepts the call and then logs all the events from
the Realtime API.



<div data-content-switcher-pane data-value="python">
    <div class="hidden">Python</div>
    Python

```python
from flask import Flask, request, Response, jsonify, make_response
from openai import OpenAI, InvalidWebhookSignatureError
import asyncio
import json
import os
import requests
import time
import threading
import websockets

app = Flask(__name__)
client = OpenAI(
    webhook_secret=os.environ["OPENAI_WEBHOOK_SECRET"]
)

AUTH_HEADER = {
    "Authorization": "Bearer " + os.getenv("OPENAI_API_KEY")
}

call_accept = {
    "type": "realtime",
    "instructions": "You are a support agent.",
    "model": "gpt-realtime-2",
}

response_create = {
    "type": "response.create",
    "response": {
        "instructions": (
            "Say to the user 'Thank you for calling, how can I help you'"
        )
    },
}


async def websocket_task(call_id):
    try:
        async with websockets.connect(
            "wss://api.openai.com/v1/realtime?call_id=" + call_id,
            additional_headers=AUTH_HEADER,
        ) as websocket:
            await websocket.send(json.dumps(response_create))

            while True:
                response = await websocket.recv()
                print(f"Received from WebSocket: {response}")
    except Exception as e:
        print(f"WebSocket error: {e}")


@app.route("/", methods=["POST"])
def webhook():
    try:
        event = client.webhooks.unwrap(request.data, request.headers)

        if event.type == "realtime.call.incoming":
            requests.post(
                "https://api.openai.com/v1/realtime/calls/"
                + event.data.call_id
                + "/accept",
                headers={**AUTH_HEADER, "Content-Type": "application/json"},
                json=call_accept,
            )
            threading.Thread(
                target=lambda: asyncio.run(
                    websocket_task(event.data.call_id)
                ),
                daemon=True,
            ).start()
            return Response(status=200)
    except InvalidWebhookSignatureError as e:
        print("Invalid signature", e)
        return Response("Invalid signature", status=400)


if __name__ == "__main__":
    app.run(port=8000)
```

  </div>



## Next steps

Now that you've connected over SIP, use the left navigation or click into these pages to start building your realtime application.

- [Realtime prompting guide](https://developers.openai.com/api/docs/guides/realtime-models-prompting)
- [Managing conversations](https://developers.openai.com/api/docs/guides/realtime-conversations)
- [Webhooks and server-side controls](https://developers.openai.com/api/docs/guides/realtime-server-controls)
- [Managing costs](https://developers.openai.com/api/docs/guides/realtime-costs)
- [Realtime transcription](https://developers.openai.com/api/docs/guides/realtime-transcription)

### Additional Resources

- [JavaScript demo](https://hello-realtime.val.run/)
- [Connect the Realtime SIP Connector to Twilio Elastic SIP Trunking](https://www.twilio.com/en-us/blog/developers/tutorials/product/openai-realtime-api-elastic-sip-trunking)
``````
:::
:::

