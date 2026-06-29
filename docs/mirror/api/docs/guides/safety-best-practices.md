---
title: "安全最佳实践"
description: "Learn how to implement safety measures like moderation, adversarial testing, human oversight, and prompt engineering to ensure responsible AI deployment."
outline: deep
---

# 安全最佳实践

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/safety-best-practices](https://developers.openai.com/api/docs/guides/safety-best-practices)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/safety-best-practices.md](https://developers.openai.com/api/docs/guides/safety-best-practices.md)
- 抓取时间：2026-06-27T05:54:08.266Z
- Checksum：`3855daf36fdff930fa2c2971d7eca3fb5555afcb10f57f69eddd4d951b7189e7`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
### 使用我们免费的 Moderation API

OpenAI 的 [Moderation API](/mirror/api/docs/guides/moderation) 可以免费使用，并可帮助降低 completions 中不安全内容出现的频率。或者，你也可以根据自己的使用场景开发定制的内容过滤系统。

如果你的应用使用 Responses API 或 Chat Completions 生成文本，也可以在[生成请求中请求 moderation scores](/mirror/api/docs/guides/moderation#moderate-generated-content)。

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

:::

## English source

::: details 展开英文原文
::: v-pre
### Use our free Moderation API

OpenAI's [Moderation API](/mirror/api/docs/guides/moderation) is free-to-use and can help reduce the frequency of unsafe content in your completions. Alternatively, you may wish to develop your own content filtration system tailored to your use case.

If your application generates text with the Responses API or Chat Completions,
you can also [request moderation scores in the generation request](/mirror/api/docs/guides/moderation#moderate-generated-content).

### Adversarial testing

We recommend “red-teaming” your application to ensure it's robust to adversarial input. Test your product over a wide range of inputs and user behaviors, both a representative set and those reflective of someone trying to ‘break' your application. Does it wander off topic? Can someone easily redirect the feature via prompt injections, e.g. “ignore the previous instructions and do this instead”?

### Human in the loop (HITL)

Wherever possible, we recommend having a human review outputs before they are used in practice. This is especially critical in high-stakes domains, and for code generation. Humans should be aware of the limitations of the system, and have access to any information needed to verify the outputs (for example, if the application summarizes notes, a human should have easy access to the original notes to refer back).

### Prompt engineering

“Prompt engineering” can help constrain the topic and tone of output text. This reduces the chance of producing undesired content, even if a user tries to produce it. Providing additional context to the model (such as by giving a few high-quality examples of desired behavior prior to the new input) can make it easier to steer model outputs in desired directions.

### “Know your customer” (KYC)

Users should generally need to register and log-in to access your service. Linking this service to an existing account, such as a Gmail, LinkedIn, or Facebook log-in, may help, though may not be appropriate for all use-cases. Requiring a credit card or ID card reduces risk further.

### Constrain user input and limit output tokens

Limiting the amount of text a user can input into the prompt helps avoid prompt injection. Limiting the number of output tokens helps reduce the chance of misuse.

Narrowing the ranges of inputs or outputs, especially drawn from trusted sources, reduces the extent of misuse possible within an application.

Allowing user inputs through validated dropdown fields (e.g., a list of movies on Wikipedia) can be more secure than allowing open-ended text inputs.

Returning outputs from a validated set of materials on the backend, where possible, can be safer than returning novel generated content (for instance, routing a customer query to the best-matching existing customer support article, rather than attempting to answer the query from-scratch).

### Allow users to report issues

Users should generally have an easily-available method for reporting improper functionality or other concerns about application behavior (listed email address, ticket submission method, etc). This method should be monitored by a human and responded to as appropriate.

### Understand and communicate limitations

From hallucinating inaccurate information, to offensive outputs, to bias, and much more, language models may not be suitable for every use case without significant modifications. Consider whether the model is fit for your purpose, and evaluate the performance of the API on a wide range of potential inputs in order to identify cases where the API's performance might drop. Consider your customer base and the range of inputs that they will be using, and ensure their expectations are calibrated appropriately.

**Safety and security are very important to us at OpenAI**.

If you notice any safety or security issues while developing with the API or anything else related to OpenAI, please submit it through our [Coordinated Vulnerability Disclosure Program](https://openai.com/security/disclosure/).

### Implement safety identifiers

Sending safety identifiers in your requests can help OpenAI monitor and detect abuse. This allows OpenAI to provide your team with more actionable feedback in the event that we detect any policy violations in your application.

Safety identifiers can also help your team respond to abuse faster. They create a stable way to trace activity back to an individual end user and reduce the chance that one user's misuse disrupts access for your broader organization.

A safety identifier should be a string that uniquely identifies each user. Hash the username or email address in order to avoid sending us any identifying information. If you offer a preview of your product to non-logged in users, you can send a session ID instead.

Safety identifiers are recommended for products where individual users interact
with a model, but they are not required. Include safety identifiers in your API
requests with the `safety_identifier` parameter:

Example: Providing a safety identifier

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


For Realtime API requests, provide the same stable, privacy-preserving identifier
with the `OpenAI-Safety-Identifier` header. When you create an ephemeral Realtime
client secret, include the header on the server-side request that creates the
secret so the identifier is bound to that session. For direct WebSocket or WebRTC
connection requests made from a trusted backend, include the header on the
connection request.

Safety identifiers do not carry over between APIs or sessions. If your
application already sends `safety_identifier` with Responses API requests, pass
the same stable value separately when you create or connect each Realtime
session.

### Revoke compromised API keys

If you believe an API key has been exposed, misused, or otherwise compromised,
revoke it promptly and replace it with a new key. Go to your [Security settings](https://platform.openai.com/settings/profile/security) to view all API
keys and revoke any compromised keys.

:::
:::

