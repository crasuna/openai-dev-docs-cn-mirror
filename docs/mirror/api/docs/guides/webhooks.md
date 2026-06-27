---
title: "Webhooks"
description: "Use webhooks to receive real-time updates from the OpenAI API."
outline: deep
---

# Webhooks

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/webhooks](https://developers.openai.com/api/docs/guides/webhooks)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/webhooks.md](https://developers.openai.com/api/docs/guides/webhooks.md)
- 抓取时间：2026-06-27T05:54:11.744Z
- Checksum：`28ec2a5da63e4d61ac03c3391f8628d4118271b179b63cfbd9d09ff26a7c4232`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
OpenAI [webhooks](http://chatgpt.com/?q=eli5+what+is+a+webhook?) 让你可以接收 API 中事件的实时通知，例如 batch 完成、background response 生成，或 fine-tuning job 结束。Webhooks 会投递到你控制的 HTTP endpoint，并遵循 [Standard Webhooks specification](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md)。完整的 webhook events 列表可在 [API reference](https://developers.openai.com/api/docs/api-reference/webhook-events) 中找到。

[



    查看完整 webhook events 列表。

](https://developers.openai.com/api/docs/api-reference/webhook-events)

下面是一些简单服务器示例，它们可以接收来自 OpenAI 的 webhooks，具体示例针对 [`response.completed`](https://developers.openai.com/api/docs/api-reference/webhook-events/response/completed) event。

Webhooks server

```python
import os
from openai import OpenAI, InvalidWebhookSignatureError
from flask import Flask, request, Response

app = Flask(__name__)
client = OpenAI(webhook_secret=os.environ["OPENAI_WEBHOOK_SECRET"])

@app.route("/webhook", methods=["POST"])
def webhook():
    try:
        # with webhook_secret set above, unwrap will raise an error if the signature is invalid
        event = client.webhooks.unwrap(request.data, request.headers)

        if event.type == "response.completed":
            response_id = event.data.id
            response = client.responses.retrieve(response_id)
            print("Response output:", response.output_text)

        return Response(status=200)
    except InvalidWebhookSignatureError as e:
        print("Invalid signature", e)
        return Response("Invalid signature", status=400)

if __name__ == "__main__":
    app.run(port=8000)
```

```javascript
import OpenAI from "openai";
import express from "express";

const app = express();
const client = new OpenAI({ webhookSecret: process.env.OPENAI_WEBHOOK_SECRET });

// Don't use express.json() because signature verification needs the raw text body
app.use(express.text({ type: "application/json" }));

app.post("/webhook", async (req, res) => {
  try {
    const event = await client.webhooks.unwrap(req.body, req.headers);

    if (event.type === "response.completed") {
      const response_id = event.data.id;
      const response = await client.responses.retrieve(response_id);
      const output_text = response.output
        .filter((item) => item.type === "message")
        .flatMap((item) => item.content)
        .filter((contentItem) => contentItem.type === "output_text")
        .map((contentItem) => contentItem.text)
        .join("");

      console.log("Response output:", output_text);
    }
    res.status(200).send();
  } catch (error) {
    if (error instanceof OpenAI.InvalidWebhookSignatureError) {
      console.error("Invalid signature", error);
      res.status(400).send("Invalid signature");
    } else {
      throw error;
    }
  }
});

app.listen(8000, () => {
  console.log("Webhook server is running on port 8000");
});
```


要查看此类 webhook 的实际运行效果，你可以在 OpenAI dashboard 中设置一个订阅 `response.completed` 的 webhook endpoint，然后发起一个 API request 来[在 background mode 中生成响应](/mirror/api/docs/guides/background)。

你也可以在 [webhook settings page](https://platform.openai.com/settings/project/webhooks) 使用 sample data 触发测试 events。

生成 background response

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


在本指南中，你将了解如何在 dashboard 中创建 webhook endpoints、设置服务端代码来处理它们，并验证入站请求确实来自 OpenAI。

## 创建 webhook endpoints

要开始在服务器上接收 webhook requests，请登录 dashboard 并[打开 webhook settings page](https://platform.openai.com/settings/project/webhooks)。Webhooks 按 project 配置。

点击 “Create” 按钮创建新的 webhook endpoint。你将配置三件事：

- endpoint 的名称（仅供你自己参考）。
- 你控制的服务器的 public URL。
- 要订阅的一个或多个 event types。当它们发生时，OpenAI 会向指定 URL 发送 HTTP POST request。

&lt;img src="https://cdn.openai.com/API/images/webhook_config.png"
  alt="webhook endpoint edit dialog"
  width="450"
  style=&#123;&#123; margin: "16px 0" &#125;&#125;
/&gt;

创建新的 webhook 后，你会收到一个 signing secret，用于在服务端验证传入的 webhook requests。请保存此值以备后用，因为之后你将无法再次查看它。

创建 webhook endpoint 后，下一步是设置一个服务端 endpoint 来处理这些传入的 event payloads。

## 在服务器上处理 webhook requests

当你订阅的事件发生时，你的 webhook URL 会收到类似这样的 HTTP POST request：

```
POST https://yourserver.com/webhook
user-agent: OpenAI/1.0 (+https://platform.openai.com/docs/webhooks)
content-type: application/json
webhook-id: wh_685342e6c53c8190a1be43f081506c52
webhook-timestamp: 1750287078
webhook-signature: v1,K5oZfzN95Z9UVu1EsfQmfVNQhnkZ2pj9o9NDN/H/pI4=
{
  "object": "event",
  "id": "evt_685343a1381c819085d44c354e1b330e",
  "type": "response.completed",
  "created_at": 1750287018,
  "data": { "id": "resp_abc123" }
}
```

你的 endpoint 应快速响应该传入 HTTP request，并返回成功的（`2xx`）status code，表示已成功接收。为避免超时，我们建议把任何非简单处理转交给 background worker，以便 endpoint 可以立即响应。
如果 endpoint 没有返回成功的（`2xx`）status code，或在几秒内没有响应，webhook request 将会重试。OpenAI 会使用指数退避持续尝试投递，最长 72 小时。请注意，`3xx` redirects 不会被跟随；它们会被视为失败，你应更新 endpoint 以使用最终目标 URL。

在少数情况下，由于内部系统问题，OpenAI 可能会投递同一个 webhook event 的重复副本。你可以使用 `webhook-id` header 作为 idempotency key 来去重。

### 本地测试 webhooks

测试 webhooks 需要一个可从公共互联网访问的 URL。这可能让开发变得棘手，因为你的本地开发环境通常不会向公众开放。以下几个选项可能有帮助：

- [ngrok](https://ngrok.com/)，它可以把你的 localhost server 暴露到 public URL 上
- Cloud development environments，例如 [Replit](https://replit.com/)、[GitHub Codespaces](https://github.com/features/codespaces)、[Cloudflare Workers](https://workers.cloudflare.com/) 或 [v0 from Vercel](https://v0.dev/)。

## 验证 webhook signatures

虽然你可以在不进行任何验证的情况下接收 OpenAI 的 webhook events 并处理结果，但你应该验证传入请求来自 OpenAI，尤其是当你的 webhook 会在 backend 执行任何操作时。webhook requests 附带的 headers 中包含一些信息，可结合 webhook secret key 用于验证 webhook 确实源自 OpenAI。

当你在 OpenAI dashboard 中创建 webhook endpoint 时，会获得一个 signing secret。你应将它作为环境变量提供给服务器：

```
export OPENAI_WEBHOOK_SECRET="<your secret here>"
```

验证 webhook signatures 最简单的方式，是使用官方 OpenAI SDK helpers 的 `unwrap()` method：

使用 OpenAI SDK 进行 signature verification

```python
client = OpenAI()
webhook_secret = os.environ["OPENAI_WEBHOOK_SECRET"]

# will raise if the signature is invalid
event = client.webhooks.unwrap(request.data, request.headers, secret=webhook_secret)
```

```javascript
const client = new OpenAI();
const webhook_secret = process.env.OPENAI_WEBHOOK_SECRET;

// will throw if the signature is invalid
const event = client.webhooks.unwrap(req.body, req.headers, { secret: webhook_secret });
```


也可以使用 [Standard Webhooks libraries](https://github.com/standard-webhooks/standard-webhooks/tree/main?tab=readme-ov-file#reference-implementations) 验证 signatures：

使用 Standard Webhooks libraries 进行 signature verification

```rust
use standardwebhooks::Webhook;

let webhook_secret = std::env::var("OPENAI_WEBHOOK_SECRET").expect("OPENAI_WEBHOOK_SECRET not set");
let wh = Webhook::new(webhook_secret);
wh.verify(webhook_payload, webhook_headers).expect("Webhook verification failed");
```

```php
$webhook_secret = getenv("OPENAI_WEBHOOK_SECRET");
$wh = new \StandardWebhooks\Webhook($webhook_secret);
$wh->verify($webhook_payload, $webhook_headers);
```


或者，如果需要，你可以按照 [Standard Webhooks spec 中的说明](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#verifying-webhook-authenticity)自行实现 signature verification。

如果你遗失或意外暴露了 signing secret，可以通过[轮换 signing secret](https://platform.openai.com/settings/project/webhooks)来生成新的 secret。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
OpenAI [webhooks](http://chatgpt.com/?q=eli5+what+is+a+webhook?) allow you to receive real-time notifications about events in the API, such as when a batch completes, a background response is generated, or a fine-tuning job finishes. Webhooks are delivered to an HTTP endpoint you control, following the [Standard Webhooks specification](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md). The full list of webhook events can be found in the [API reference](https://developers.openai.com/api/docs/api-reference/webhook-events).

[

<span slot="icon">
      </span>
    View the full list of webhook events.

](https://developers.openai.com/api/docs/api-reference/webhook-events)

Below are examples of simple servers capable of ingesting webhooks from OpenAI, specifically for the [`response.completed`](https://developers.openai.com/api/docs/api-reference/webhook-events/response/completed) event.

Webhooks server

```python
import os
from openai import OpenAI, InvalidWebhookSignatureError
from flask import Flask, request, Response

app = Flask(__name__)
client = OpenAI(webhook_secret=os.environ["OPENAI_WEBHOOK_SECRET"])

@app.route("/webhook", methods=["POST"])
def webhook():
    try:
        # with webhook_secret set above, unwrap will raise an error if the signature is invalid
        event = client.webhooks.unwrap(request.data, request.headers)

        if event.type == "response.completed":
            response_id = event.data.id
            response = client.responses.retrieve(response_id)
            print("Response output:", response.output_text)

        return Response(status=200)
    except InvalidWebhookSignatureError as e:
        print("Invalid signature", e)
        return Response("Invalid signature", status=400)

if __name__ == "__main__":
    app.run(port=8000)
```

```javascript
import OpenAI from "openai";
import express from "express";

const app = express();
const client = new OpenAI({ webhookSecret: process.env.OPENAI_WEBHOOK_SECRET });

// Don't use express.json() because signature verification needs the raw text body
app.use(express.text({ type: "application/json" }));

app.post("/webhook", async (req, res) => {
  try {
    const event = await client.webhooks.unwrap(req.body, req.headers);

    if (event.type === "response.completed") {
      const response_id = event.data.id;
      const response = await client.responses.retrieve(response_id);
      const output_text = response.output
        .filter((item) => item.type === "message")
        .flatMap((item) => item.content)
        .filter((contentItem) => contentItem.type === "output_text")
        .map((contentItem) => contentItem.text)
        .join("");

      console.log("Response output:", output_text);
    }
    res.status(200).send();
  } catch (error) {
    if (error instanceof OpenAI.InvalidWebhookSignatureError) {
      console.error("Invalid signature", error);
      res.status(400).send("Invalid signature");
    } else {
      throw error;
    }
  }
});

app.listen(8000, () => {
  console.log("Webhook server is running on port 8000");
});
```


To see a webhook like this one in action, you can set up a webhook endpoint in the OpenAI dashboard subscribed to `response.completed`, and then make an API request to [generate a response in background mode](https://developers.openai.com/api/docs/guides/background).

You can also trigger test events with sample data from the [webhook settings page](https://platform.openai.com/settings/project/webhooks).

Generate a background response

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


In this guide, you will learn how to create webook endpoints in the dashboard, set up server-side code to handle them, and verify that inbound requests originated from OpenAI.

## Creating webhook endpoints

To start receiving webhook requests on your server, log in to the dashboard and [open the webhook settings page](https://platform.openai.com/settings/project/webhooks). Webhooks are configured per-project.

Click the "Create" button to create a new webhook endpoint. You will configure three things:

- A name for the endpoint (just for your reference).
- A public URL to a server you control.
- One or more event types to subscribe to. When they occur, OpenAI will send an HTTP POST request to the URL specified.

<img src="https://cdn.openai.com/API/images/webhook_config.png"
  alt="webhook endpoint edit dialog"
  width="450"
  style={{ margin: "16px 0" }}
/>

After creating a new webhook, you'll receive a signing secret to use for server-side verification of incoming webhook requests. Save this value for later, since you won't be able to view it again.

With your webhook endpoint created, you'll next set up a server-side endpoint to handle those incoming event payloads.

## Handling webhook requests on a server

When an event happens that you're subscribed to, your webhook URL will receive an HTTP POST request like this:

```
POST https://yourserver.com/webhook
user-agent: OpenAI/1.0 (+https://platform.openai.com/docs/webhooks)
content-type: application/json
webhook-id: wh_685342e6c53c8190a1be43f081506c52
webhook-timestamp: 1750287078
webhook-signature: v1,K5oZfzN95Z9UVu1EsfQmfVNQhnkZ2pj9o9NDN/H/pI4=
{
  "object": "event",
  "id": "evt_685343a1381c819085d44c354e1b330e",
  "type": "response.completed",
  "created_at": 1750287018,
  "data": { "id": "resp_abc123" }
}
```

Your endpoint should respond quickly to these incoming HTTP requests with a successful (`2xx`) status code, indicating successful receipt. To avoid timeouts, we recommend offloading any non-trivial processing to a background worker so that the endpoint can respond immediately.
If the endpoint doesn't return a successful (`2xx`) status code, or doesn't respond within a few seconds, the webhook request will be retried. OpenAI will continue to attempt delivery for up to 72 hours with exponential backoff. Note that `3xx` redirects will not be followed; they are treated as failures and your endpoint should be updated to use the final destination URL.

In rare cases, due to internal system issues, OpenAI may deliver duplicate copies of the same webhook event. You can use the `webhook-id` header as an idempotency key to deduplicate.

### Testing webhooks locally

Testing webhooks requires a URL that is available on the public Internet. This can make development tricky, since your local development environment likely isn't open to the public. A few options that may help:

- [ngrok](https://ngrok.com/) which can expose your localhost server on a public URL
- Cloud development environments like [Replit](https://replit.com/), [GitHub Codespaces](https://github.com/features/codespaces), [Cloudflare Workers](https://workers.cloudflare.com/), or [v0 from Vercel](https://v0.dev/).

## Verifying webhook signatures

While you can receive webhook events from OpenAI and process the results without any verification, you should verify that incoming requests are coming from OpenAI, especially if your webhook will take any kind of action on the backend. The headers sent along with webhook requests contain information that can be used in combination with a webhook secret key to verify that the webhook originated from OpenAI.

When you create a webhook endpoint in the OpenAI dashboard, you'll be given a signing secret that you should make available on your server as an environment variable:

```
export OPENAI_WEBHOOK_SECRET="<your secret here>"
```

The simplest way to verify webhook signatures is by using the `unwrap()` method of the official OpenAI SDK helpers:

Signature verification with the OpenAI SDK

```python
client = OpenAI()
webhook_secret = os.environ["OPENAI_WEBHOOK_SECRET"]

# will raise if the signature is invalid
event = client.webhooks.unwrap(request.data, request.headers, secret=webhook_secret)
```

```javascript
const client = new OpenAI();
const webhook_secret = process.env.OPENAI_WEBHOOK_SECRET;

// will throw if the signature is invalid
const event = client.webhooks.unwrap(req.body, req.headers, { secret: webhook_secret });
```


Signatures can also be verified with the [Standard Webhooks libraries](https://github.com/standard-webhooks/standard-webhooks/tree/main?tab=readme-ov-file#reference-implementations):

Signature verification with Standard Webhooks libraries

```rust
use standardwebhooks::Webhook;

let webhook_secret = std::env::var("OPENAI_WEBHOOK_SECRET").expect("OPENAI_WEBHOOK_SECRET not set");
let wh = Webhook::new(webhook_secret);
wh.verify(webhook_payload, webhook_headers).expect("Webhook verification failed");
```

```php
$webhook_secret = getenv("OPENAI_WEBHOOK_SECRET");
$wh = new \StandardWebhooks\Webhook($webhook_secret);
$wh->verify($webhook_payload, $webhook_headers);
```


Alternatively, if needed, you can implement your own signature verification [as described in the Standard Webhooks spec](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md#verifying-webhook-authenticity)

If you misplace or accidentally expose your signing secret, you can generate a new one by [rotating the signing secret](https://platform.openai.com/settings/project/webhooks).
``````
:::
:::

