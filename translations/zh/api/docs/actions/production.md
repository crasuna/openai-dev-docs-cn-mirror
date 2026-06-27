---
status: needs-review
sourceId: "3e4ff5944507"
sourceChecksum: "3e4ff59445079241ab578fb0e57690599f887bc87bb0923421a1f2b41b563fe5"
sourceUrl: "https://developers.openai.com/api/docs/actions/production"
translatedAt: "2026-06-27T10:01:07.242Z"
translator: codex-gpt-5.5-xhigh
---

# GPT Actions 的生产说明

## 速率限制

请考虑在你暴露的 API 端点上实现速率限制。ChatGPT 会遵守 429 响应码，并且在短时间内收到一定数量的 429 或 500 后，动态退避向你的 action 发送请求。

## 超时

在 actions 体验中进行 API 调用时，如果超过以下阈值，就会发生超时：

- API 调用往返 45 秒

## 使用 TLS 和 HTTPS

流向你的 action 的所有流量都必须在端口 443 上使用 TLS 1.2 或更高版本，并使用有效的公共证书。

## IP egress 范围

ChatGPT 会从一个[已发布的 IP 范围](https://developers.openai.com/api/docs/guides/ip-addresses)调用你的 action。你可能希望显式 allowlist 这些 IP 地址。

## 多种身份验证 schema

定义 action 时，你可以混合使用单一身份验证类型（OAuth 或 API key）以及不需要身份验证的端点。

你可以在我们的 [actions 身份验证页面](https://developers.openai.com/api/docs/actions/authentication)了解更多 action 身份验证信息。

## OpenAPI specification 限制

请记住你的 OpenAPI specification 中的以下限制，这些限制可能会变更：

- API specification 中每个 API 端点 description/summary 字段最多 300 个字符
- API specification 中每个 API 参数 description 字段最多 700 个字符

## 其他限制

使用 actions 构建时，需要注意一些限制：

- 不支持自定义 headers
- 除 Google、Microsoft 和 Adobe OAuth domains 外，OAuth 流中使用的所有 domains 都必须与主要端点使用的 domain 相同
- 请求和响应 payload 各自必须少于 100,000 个字符
- 请求会在 45 秒后超时
- 请求和响应只能包含文本（不能包含图像或视频）

## Consequential flag

在 OpenAPI specification 中，你现在可以将某些端点设置为 "consequential"，如下所示：

```yaml
paths:
  /todo:
    get:
      operationId: getTODOs
      description: Fetches items in a TODO list from the API.
      security: []
    post:
      operationId: updateTODOs
      description: Mutates the TODO list.
      x-openai-isConsequential: true
```

consequential action 的一个好例子是代表用户预订并支付酒店房间。

- 如果 `x-openai-isConsequential` 字段为 `true`，ChatGPT 会将该操作视为“运行前必须始终提示用户确认”，并且不会显示“always allow”按钮（两者都是 GPTs 的功能，旨在让 builders 和用户更好地控制 actions）。
- 如果 `x-openai-isConsequential` 字段为 `false`，ChatGPT 会显示 "always allow button"。
- 如果该字段不存在，ChatGPT 默认将所有 GET 操作设为 `false`，将所有其他操作设为 `true`。

## 提供示例的最佳实践

以下是在编写 GPT instructions 和 schema 中的 descriptions，以及设计 API responses 时应遵循的一些最佳实践：

1. 你的 descriptions 不应鼓励 GPT 在用户尚未请求你的 action 所属服务类别时使用该 action。

   _反面示例_：

   > 每当用户提到任何类型的任务时，都询问他们是否想使用 TODO action 向 todo list 添加内容。

   _正面示例_：

   > TODO list 可以添加、移除和查看用户的 TODOs。

2. 你的 descriptions 不应规定 GPT 使用 action 的特定触发条件。ChatGPT 被设计为在适当时自动使用你的 action。

   _反面示例_：

   > 当用户提到一项任务时，回复“你想让我把它添加到你的 TODO list 吗？说 'yes' 继续。”

   _正面示例_：

   > [不需要针对此事编写 instructions]

3. 来自 API 的 action responses 应返回原始数据，而不是自然语言响应，除非自然语言响应是必要的。GPT 会使用返回的数据提供自己的自然语言响应。

   _反面示例_：

   > 我找到了你的 todo list！你有 2 个 todos：买杂货和遛狗。如果你愿意，我还可以添加更多 todos！

   _正面示例_：

   > \{ "todos": [ "get groceries", "walk the dog" ] }

## GPT Action 数据如何使用

GPT Actions 将 ChatGPT 连接到外部应用。如果用户与 GPT 的 custom action 交互，ChatGPT 可能会将他们对话的一部分发送到该 action 的端点。

如果你有问题或遇到其他限制，可以加入 [OpenAI developer forum](https://community.openai.com) 上的讨论。
