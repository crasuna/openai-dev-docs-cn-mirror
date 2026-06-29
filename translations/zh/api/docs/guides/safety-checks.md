---
status: needs-review
sourceId: "bb1659892593"
sourceChecksum: "bb165989259388f2343ba62c78f6a70afd5a17cbb4eecd2141e5d77271512727"
sourceUrl: "https://developers.openai.com/api/docs/guides/safety-checks"
translatedAt: "2026-06-27T18:24:42.5859087+08:00"
translator: codex-gpt-5.5-xhigh
---

# Safety checks 安全检查

我们会对模型以及模型的使用方式运行多种类型的评估。本指南介绍我们如何测试安全性，以及你可以做些什么来避免违规。

## 面向 GPT-5 及后续模型的 safety classifiers

随着 [GPT-5](https://developers.openai.com/api/docs/models/gpt-5) 的推出，我们增加了一些检查，用于发现并阻止访问危险信息。某些用户最终很可能会尝试把你的应用用于 OpenAI 政策之外的事情，尤其是在使用场景范围很广的应用中。

### Safety classifier 流程

1. 我们会把发往 GPT-5 的请求分类到不同风险阈值。
1. 如果你的 org 反复触达高阈值，OpenAI 会返回错误并发送警告邮件。
1. 如果请求在所述时间阈值（通常为七天）之后仍继续，OpenAI 会停止你的 org 对 GPT-5 的访问。请求将不再工作。

### 如何避免错误、延迟和封禁

如果你的 org 参与违反我们安全政策的可疑活动，我们可能会返回错误、限制模型访问，甚至封禁你的账号。以下安全措施可以帮助我们识别高风险请求来自何处，并封禁单个最终用户，而不是封禁你的整个 org。

- 对单个用户与模型交互的产品，[实现 safety identifiers](https://developers.openai.com/api/docs/guides/safety-best-practices#implement-safety-identifiers)。Safety identifiers 是推荐项，但不是必需项。
- 如果你的使用场景依赖于访问限制较少的服务版本，以便在生命科学领域开展有益应用，请阅读我们的[特殊访问计划](https://help.openai.com/en/articles/11826767-life-science-research-special-access-program)，了解你是否符合条件。

### 为单个用户实现 safety identifiers

`safety_identifier` 参数可在 [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) 和较旧的 [Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat/create) 中使用。Realtime API 通过 `OpenAI-Safety-Identifier` header 支持同一概念。要使用 safety identifiers，请在每个请求上为你的最终用户提供稳定 ID。请对用户电子邮件或内部用户 ID 进行哈希，以避免传递任何个人信息。

Safety identifiers 不会在 API 或 sessions 之间自动沿用。如果你的应用已经在 Responses API 请求中发送 `safety_identifier`，请在创建或连接每个 Realtime session 时单独传入同一个稳定值。



<div data-content-switcher-pane data-value="responses">
    <div class="hidden">Responses API</div>
    使用 Responses API 提供 safety identifier

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
model="gpt-5.4-mini",
input="This is a test",
safety_identifier="user_123456",
)
```

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
"model": "gpt-5.4-mini",
"input": "This is a test",
"safety_identifier": "user_123456"
}'
```

  </div>
  <div data-content-switcher-pane data-value="chat" hidden>
    <div class="hidden">Chat Completions API</div>
    使用 Chat Completions API 提供 safety identifier

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
model="gpt-5.4-mini",
messages=[
{"role": "user", "content": "This is a test"}
],
safety_identifier="user_123456"
)
```

```bash
curl https://api.openai.com/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
"model": "gpt-5.4-mini",
"messages": [
{"role": "user", "content": "This is a test"}
],
"safety_identifier": "user_123456"
}'
```

  </div>
  <div data-content-switcher-pane data-value="realtime" hidden>
    <div class="hidden">Realtime API</div>
    使用 Realtime API 提供 safety identifier

```bash
curl https://api.openai.com/v1/realtime/client_secrets \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "OpenAI-Safety-Identifier: user_123456" \
-d '{
"session": {
"type": "realtime",
"model": "gpt-realtime-2"
}
}'
```

  </div>



### 潜在后果

如果 OpenAI 监控系统识别出潜在滥用，我们可能采取不同级别的措施：

- **延迟 streaming responses**
  - 作为对可能违反政策的用户的一种初始、较低后果干预，OpenAI 可能会在返回完整响应前运行额外检查，从而延迟 streaming responses。
  - 如果检查通过，streaming 开始。如果检查失败，请求停止：不会出现任何 tokens，并且 streamed response 不会开始。
  - 为了提供更好的最终用户体验，请考虑在 streaming 被延迟的情况下添加 loading spinner。
- **封禁单个用户的模型访问**
  - 在高置信度 policy violation 中，关联的 `safety_identifier` 会被完全阻止访问 OpenAI 模型。
  - 对于同一个 identifier，safety identifier 在所有未来 GPT-5 请求中都会收到 `identifier blocked` 错误。OpenAI 目前无法解除对单个 identifier 的封禁。

为了让这些封禁有效，请确保你已设置控制措施，防止被封禁用户简单地开设新账号。提醒一下，来自你组织的反复 policy violations 可能导致你的整个组织失去访问权限。

### 我们为什么这样做

具体执行标准可能会随着真实世界使用情况变化或新模型发布而改变。目前，OpenAI 可能会限制或封禁具有风险或可疑生物、化学活动的 safety identifiers 的访问。请参阅[博客文章](https://openai.com/index/preparing-for-future-ai-capabilities-in-biology/)，了解我们如何处理生物学领域更高 AI 能力的更多信息。

## 其他类型的 safety checks

为帮助确保你使用 OpenAI API 和工具时的安全性，我们会对自己的模型（包括所有 fine-tuned models）以及 computer use tool 运行 safety checks。

了解更多：

- [Model evaluations hub](https://openai.com/safety/evaluations-hub)
- [Cyber Safety](https://developers.openai.com/codex/concepts/cyber-safety)
- [Fine-tuning safety](https://developers.openai.com/api/docs/guides/supervised-fine-tuning#safety-checks)
- [Safety checks in computer use](https://developers.openai.com/api/docs/guides/tools-computer-use#acknowledge-safety-checks)
