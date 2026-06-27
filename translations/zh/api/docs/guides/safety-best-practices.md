---
status: needs-review
sourceId: "3855daf36fdf"
sourceChecksum: "3855daf36fdff930fa2c2971d7eca3fb5555afcb10f57f69eddd4d951b7189e7"
sourceUrl: "https://developers.openai.com/api/docs/guides/safety-best-practices"
translatedAt: "2026-06-27T18:24:42.5859087+08:00"
translator: codex-gpt-5.5-xhigh
---

# 安全最佳实践

### 使用我们免费的 Moderation API

OpenAI 的 [Moderation API](https://developers.openai.com/api/docs/guides/moderation) 可以免费使用，并可帮助降低 completions 中不安全内容出现的频率。或者，你也可以根据自己的使用场景开发定制的内容过滤系统。

如果你的应用使用 Responses API 或 Chat Completions 生成文本，也可以在[生成请求中请求 moderation scores](https://developers.openai.com/api/docs/guides/moderation#moderate-generated-content)。

### 对抗性测试

我们建议对你的应用进行“red-teaming”，以确保它能抵抗对抗性输入。请使用广泛的输入和用户行为来测试你的产品，既包括有代表性的集合，也包括反映有人试图“破坏”应用的行为。它是否会偏离主题？别人是否可以通过 prompt injections 轻易重定向该功能，例如“ignore the previous instructions and do this instead”？

### Human in the loop（HITL）

只要可能，我们建议在人类审核输出之后再实际使用输出。这在高风险领域和代码生成中尤其关键。人类应该了解系统限制，并能够访问验证输出所需的任何信息（例如，如果应用总结笔记，人类应该能方便地访问原始笔记以便回查）。

### Prompt engineering

“Prompt engineering” 可以帮助约束输出文本的主题和语气。即使用户试图生成不希望出现的内容，这也能降低产生不良内容的概率。向模型提供额外上下文（例如，在新输入之前给出几个高质量的期望行为示例）可以更容易地把模型输出引导到期望方向。

### “Know your customer”（KYC）

通常应要求用户注册并登录后才能访问你的服务。将此服务关联到现有账号，例如 Gmail、LinkedIn 或 Facebook 登录，可能会有帮助，但并不适合所有使用场景。要求信用卡或身份证件可以进一步降低风险。

### 约束用户输入并限制输出 tokens

限制用户可输入到 prompt 的文本量，有助于避免 prompt injection。限制输出 tokens 数量，有助于降低滥用概率。

缩小输入或输出范围，尤其是从可信来源抽取输入或输出，可以减少应用中可能发生的滥用程度。

让用户通过经过验证的下拉字段提供输入（例如 Wikipedia 上的电影列表），可能比允许开放式文本输入更安全。

在可能的情况下，从后端经过验证的一组材料中返回输出，可能比返回新生成内容更安全（例如，把客户查询路由到最匹配的现有客户支持文章，而不是尝试从头回答查询）。

### 允许用户报告问题

通常应为用户提供一种易于获得的方法，用来报告不当功能或有关应用行为的其他问题（列出的电子邮件地址、工单提交方法等）。这种方法应由人类监控，并按需回应。

### 理解并沟通限制

从幻觉生成不准确信息，到冒犯性输出、偏见，以及更多问题，语言模型如果没有重大修改，可能并不适合每个使用场景。请考虑模型是否适合你的目的，并在广泛的潜在输入上评估 API 表现，以识别 API 表现可能下降的情况。考虑你的客户群体和他们会使用的输入范围，并确保他们的预期得到恰当校准。

**安全和安保对 OpenAI 非常重要**。

如果你在使用 API 或与 OpenAI 相关的任何其他内容进行开发时发现任何安全或安保问题，请通过我们的 [Coordinated Vulnerability Disclosure Program](https://openai.com/security/disclosure/) 提交。

### 实现 safety identifiers

在请求中发送 safety identifiers 可以帮助 OpenAI 监控并检测滥用。这使 OpenAI 能在检测到你的应用存在任何 policy violations 时，向你的团队提供更可操作的反馈。

Safety identifiers 也可以帮助你的团队更快响应滥用。它们提供了一种稳定方式，可将活动追溯到单个最终用户，并降低某个用户的滥用影响你更广泛组织访问的概率。

Safety identifier 应是一个能唯一标识每个用户的字符串。请对用户名或电子邮件地址进行哈希，以避免向我们发送任何识别信息。如果你向未登录用户提供产品预览，可以改为发送 session ID。

Safety identifiers 建议用于单个用户与模型交互的产品，但不是必需的。请使用 `safety_identifier` 参数在 API 请求中包含 safety identifiers：

示例：提供 safety identifier

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
model="gpt-5.5",
messages=[
{"role": "user", "content": "This is a test"}
],
max_completion_tokens=5,
safety_identifier="user_123456"
)
```

```bash
curl https://api.openai.com/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
"model": "gpt-5.5",
"messages": [
{"role": "user", "content": "This is a test"}
],
"max_completion_tokens": 5,
"safety_identifier": "user123456"
}'
```


对于 Realtime API 请求，请使用 `OpenAI-Safety-Identifier` header 提供同一个稳定、保护隐私的 identifier。创建临时 Realtime client secret 时，请在创建该 secret 的服务器端请求中包含该 header，这样 identifier 会绑定到该 session。对于从可信后端发起的直接 WebSocket 或 WebRTC 连接请求，请在连接请求中包含该 header。

Safety identifiers 不会在 API 或 sessions 之间自动沿用。如果你的应用已经在 Responses API 请求中发送 `safety_identifier`，请在创建或连接每个 Realtime session 时单独传入同一个稳定值。

### 撤销泄露的 API keys

如果你认为某个 API key 已暴露、被滥用或以其他方式遭到泄露，请及时撤销并替换为新的 key。前往你的[安全设置](https://platform.openai.com/settings/profile/security)查看所有 API keys，并撤销任何已泄露的 keys。
