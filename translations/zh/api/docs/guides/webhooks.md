---
status: needs-review
sourceId: "28ec2a5da63e"
sourceChecksum: "28ec2a5da63e4d61ac03c3391f8628d4118271b179b63cfbd9d09ff26a7c4232"
sourceUrl: "https://developers.openai.com/api/docs/guides/webhooks"
translatedAt: "2026-06-27T18:23:48.7352177+08:00"
translator: codex-gpt-5.5-xhigh
---

# Webhooks 网络钩子

OpenAI [webhooks](http://chatgpt.com/?q=eli5+what+is+a+webhook?) 让你可以接收 API 中事件的实时通知，例如 batch 完成、background response 生成，或 fine-tuning job 结束。Webhooks 会投递到你控制的 HTTP endpoint，并遵循 [Standard Webhooks specification](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md)。完整的 webhook events 列表可在 [API reference](https://developers.openai.com/api/docs/api-reference/webhook-events) 中找到。

[

<span slot="icon">
      </span>
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


要查看此类 webhook 的实际运行效果，你可以在 OpenAI dashboard 中设置一个订阅 `response.completed` 的 webhook endpoint，然后发起一个 API request 来[在 background mode 中生成响应](https://developers.openai.com/api/docs/guides/background)。

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

<img src="https://cdn.openai.com/API/images/webhook_config.png"
  alt="webhook endpoint edit dialog"
  width="450"
  style={{ margin: "16px 0" }}
/>

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
