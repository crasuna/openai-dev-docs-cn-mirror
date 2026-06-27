---
status: needs-review
sourceId: "b8cb0da2b042"
sourceChecksum: "b8cb0da2b042fb8c46d7cc8760a06717b1a52a8998842048a4cae88dca4c6936"
sourceUrl: "https://developers.openai.com/api/docs/guides/flex-processing"
translatedAt: "2026-06-27T17:43:53.3580579+08:00"
translator: codex-gpt-5.5-xhigh
---

# Flex processing

Flex processing 可以为 [Responses](https://developers.openai.com/api/docs/api-reference/responses) 或 [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat) 请求降低成本，代价是响应时间更慢，并且偶尔会遇到资源不可用。它非常适合非生产环境或优先级较低的任务，例如模型评估、数据补充和异步工作负载。

Token 按 [Batch API 费率](https://developers.openai.com/api/docs/guides/batch)[计费](https://developers.openai.com/api/docs/pricing)，并可通过 [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) 获得额外折扣。

Flex processing 目前处于 beta 阶段，可用模型有限。受支持的模型
  列在[定价页面](https://developers.openai.com/api/docs/pricing?latest-pricing=flex)上。

## API 用法

要使用 Flex processing，请在 API 请求中将 `service_tier` 参数设置为 `flex`：


  Flex processing 示例

```javascript
import OpenAI from "openai";
const client = new OpenAI({
    timeout: 15 * 1000 * 60, // Increase default timeout to 15 minutes
});

const response = await client.responses.create({
    model: "gpt-5.5",
    instructions: "List and describe all the metaphors used in this book.",
    input: "<very long text of book here>",
    service_tier: "flex",
}, { timeout: 15 * 1000 * 60 });

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI(
    # increase default timeout to 15 minutes (from 10 minutes)
    timeout=900.0
)

# you can override the max timeout per request as well
response = client.with_options(timeout=900.0).responses.create(
    model="gpt-5.5",
    instructions="List and describe all the metaphors used in this book.",
    input="<very long text of book here>",
    service_tier="flex",
)

print(response.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "instructions": "List and describe all the metaphors used in this book.",
    "input": "<very long text of book here>",
    "service_tier": "flex"
  }'
```





#### API 请求超时

由于 Flex processing 的处理速度较慢，请求更容易超时。处理超时时，请考虑以下事项：

- **默认超时**：使用官方 OpenAI SDK 发起 API 请求时，默认超时为 **10 分钟**。对于很长的 prompt 或复杂任务，你可能需要增加此超时时间。
- **配置超时**：每个 SDK 都会提供一个参数来增加此超时时间。在上面的代码示例中，Python 和 JavaScript SDK 使用的是 `timeout`。
- **自动重试**：OpenAI SDK 会自动重试返回 `408 Request Timeout` 错误码的请求两次，然后才抛出异常。

## 资源不可用错误

Flex processing 有时可能没有足够资源来处理你的请求，从而返回 `429 Resource Unavailable` 错误码。**发生这种情况时，你不会被收费。**

请考虑实现以下策略来处理资源不可用错误：

- **使用指数退避重试请求**：对于能够容忍延迟、并且目标是尽可能降低成本的工作负载，实现指数退避很合适，因为当更多容量可用时，你的请求最终可能完成。有关实现细节，请参阅[这篇 cookbook](https://developers.openai.com/cookbook/examples/how_to_handle_rate_limits?utm_source=chatgpt.com#retrying-with-exponential-backoff)。

- **使用标准处理重试请求**：收到资源不可用错误时，如果为了确保用例成功完成而偶尔支付更高成本是可以接受的，请实现一种使用标准处理的重试策略。为此，请在重试请求中将 `service_tier` 设置为 `auto`，或者移除 `service_tier` 参数，以使用项目的默认模式。
