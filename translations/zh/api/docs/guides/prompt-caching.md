---
status: needs-review
sourceId: "4c17902fd34f"
sourceChecksum: "4c17902fd34fbcb20ea25c852f2b34897bfaf6cbc8a7ccb30b592c6dd0bd5512"
sourceUrl: "https://developers.openai.com/api/docs/guides/prompt-caching"
translatedAt: "2026-06-27T10:01:07.242Z"
translator: codex-gpt-5.5-xhigh
---

# Prompt caching

模型 prompts 通常包含重复内容，例如 system prompts 和通用 instructions。OpenAI 会将 API 请求路由到最近处理过相同 prompt 的服务器，使其比从头处理 prompt 更便宜、更快。Prompt Caching 最多可将延迟降低 80%，并将输入 token 成本最多降低 90%。Prompt Caching 会自动作用于你的所有 API 请求（无需更改代码），且不会产生额外费用。Prompt Caching 已为所有近期[模型](https://developers.openai.com/api/docs/models)、gpt-4o 及更新模型启用。

本指南详细介绍 Prompt Caching 的工作方式，以便你优化 prompts，降低延迟和成本。

## 构建 prompts

只有 prompt 中完全匹配的前缀才可能命中缓存。若要获得缓存收益，请将 instructions 和 examples 等静态内容放在 prompt 开头，并将用户特定信息等可变内容放在末尾。这同样适用于图像和工具，它们在请求之间必须完全一致。

![Prompt Caching 可视化图](https://openaidevs.retool.com/api/file/8593d9bb-4edb-4eb6-bed9-62bfb98db5ee)

## 工作原理

缓存会自动为 1024 tokens 或更长的 prompts 启用。当你发起 API 请求时，会发生以下步骤：

1. **缓存路由**：

- 请求会根据 prompt 初始前缀的 hash 路由到某台机器。该 hash 通常使用前 256 tokens，但确切长度会因模型而异。
- 如果你提供 [`prompt_cache_key`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-prompt_cache_key) 参数，它会与前缀 hash 组合，使你能够影响路由并提升缓存命中率。当许多请求共享较长的通用前缀时，这尤其有益。
- 如果相同前缀和 `prompt_cache_key` 组合的请求超过某个速率（约每分钟 15 个请求），部分请求可能会溢出并路由到其他机器，从而降低缓存效果。

2. **缓存查找**：系统检查你的 prompt 初始部分（前缀）是否存在于所选机器的缓存中。
3. **缓存命中**：如果找到匹配前缀，系统会使用缓存结果。这会显著降低延迟并减少成本。
4. **缓存未命中**：如果没有找到匹配前缀，系统会处理你的完整 prompt，并随后在该机器上缓存前缀，以供未来请求使用。

## Prompt cache 保留

Prompt Caching 可以使用内存内或扩展保留策略。可用时，Extended Prompt Caching 旨在保留缓存更长时间，使后续请求更可能匹配缓存。

两种保留策略的 prompt cache 定价相同。

若要配置 prompt cache 保留策略，请在 `Responses.create` 请求上设置 `prompt_cache_retention` 参数（如果使用 Chat Completions，则在 `chat.completions.create` 上设置）。

### 内存内 prompt cache 保留

除了 `gpt-5.5`、`gpt-5.5-pro` 和所有未来模型之外，所有支持 Prompt Caching 的模型都支持内存内 prompt cache 保留。

使用内存内策略时，缓存前缀通常会在 5 到 10 分钟不活动期间保持活跃，最长可达一小时。内存内缓存前缀仅保存在易失性 GPU 内存中。

### 扩展 prompt cache 保留

以下模型支持扩展 prompt cache 保留：

- gpt-5.5
- gpt-5.5-pro
- gpt-5.4
- gpt-5.2
- gpt-5.1-codex-max
- gpt-5.1
- gpt-5.1-codex
- gpt-5.1-codex-mini
- gpt-5.1-chat-latest
- gpt-5
- gpt-5-codex
- gpt-4.1

扩展 prompt cache 保留会让缓存前缀保持活跃更长时间，最长可达 24 小时。Extended Prompt Caching 的工作方式是在内存已满时将 key/value tensors 卸载到 GPU 本地存储，从而显著增加可用于缓存的存储容量。

key/value tensors 是 prefill 期间由模型注意力层产生的中间表示。只有 key/value tensors 可能持久化到本地存储；原始客户内容（例如 prompt 文本）仅保留在内存中。

### 按请求配置

对于 `gpt-5.5`、`gpt-5.5-pro` 和未来模型，仅支持 `24h`。

对于同时支持 `in_memory` 和 `24h` 的较旧模型，默认值取决于你的组织的数据保留策略：

- 未启用 ZDR 的组织默认使用 `24h`。
- 启用 ZDR 的组织在未指定 `prompt_cache_retention` 时默认使用 `in_memory`。

```json
{
  "model": "gpt-5.5",
  "input": "Your prompt goes here...",
  "prompt_cache_retention": "24h"
}
```


## 要求

缓存适用于包含 1024 tokens 或更多内容的 prompts。

所有请求，包括少于 1024 tokens 的请求，都会在 `usage.prompt_tokens_details` 的 [Response object](https://developers.openai.com/api/docs/api-reference/responses/object) 或 [Chat object](https://developers.openai.com/api/docs/api-reference/chat/object) 中显示 `cached_tokens` 字段，指示 prompt tokens 中有多少命中了缓存。对于少于 1024 tokens 的请求，`cached_tokens` 将为零。

```json
"usage": {
  "prompt_tokens": 2006,
  "completion_tokens": 300,
  "total_tokens": 2306,
  "prompt_tokens_details": {
    "cached_tokens": 1920
  },
  "completion_tokens_details": {
    "reasoning_tokens": 0,
    "accepted_prediction_tokens": 0,
    "rejected_prediction_tokens": 0
  }
}
```

### 可以缓存什么

- **Messages:** 完整的 messages 数组，包含 system、user 和 assistant 交互。
- **Images:** 用户 messages 中包含的图像，可以是链接或 base64 编码数据，也可以发送多张图像。请确保 detail 参数设置一致，因为它会影响图像 tokenization。
- **Tool use:** messages 数组和可用 `tools` 列表都可以缓存，并会计入最低 1024 token 要求。
- **Structured outputs:** structured output schema 会作为 system message 的前缀，并可以缓存。

## 最佳实践

- 将 prompts 组织为：**静态或重复内容放在开头**，动态且用户特定的内容放在末尾。
- 对共享通用前缀的请求，始终一致使用 **[`prompt_cache_key`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-prompt_cache_key) 参数**。选择一种粒度，让每个唯一的前缀-`prompt_cache_key` 组合低于每分钟 15 个请求，以避免缓存溢出。
- **监控缓存性能指标**，包括缓存命中率、延迟和已缓存 tokens 占比，以优化策略。你可以像上方所示记录 usage 字段结果，或在 OpenAI Usage dashboard 中监控 cached token counts。
- 使用相同 prompt 前缀**保持稳定的请求流**，以尽量减少缓存驱逐并最大化缓存收益。

## 常见问题

1. **缓存如何维护数据隐私？**

   Prompt caches 不会在组织之间共享。只有同一组织的成员才能访问相同 prompts 的 caches。使用 Extended Prompt Caching 时，key/value tensors 的最长保留期限为 24 小时。

2. **Prompt Caching 是否影响输出 token 生成或 API 的最终响应？**

   Prompt Caching 不会影响输出 tokens 的生成，也不会影响 API 提供的最终响应。无论是否使用缓存，生成的输出都是相同的。这是因为只有 prompt 本身被缓存，而实际响应每次都会基于缓存的 prompt 重新计算。

3. **是否可以手动清除缓存？**

   当前不支持手动清除缓存。最近未遇到的 prompts 会自动从缓存中清除。典型缓存驱逐会在 5 到 10 分钟不活动后发生，不过在非高峰时段有时会持续到最长一小时。

4. **写入 Prompt Caching 是否需要额外付费？**

   不需要。缓存会自动发生，无需显式操作，也无需为使用缓存功能支付额外费用。

5. **缓存 prompts 是否计入 TPM 速率限制？**

   是的，因为缓存不会影响速率限制。

6. **Prompt Caching 是否适用于 Zero Data Retention 请求？**

   内存内 cache retention 不会将任何数据保存到磁盘。
   Extended prompt caching 可能会将 key/value tensors 存储在 GPU 本地存储中，并且 key-value tensors 派生自客户内容。此数据不会在缓存过期后保留，key-value tensors 会保留 1 到 2 小时（大多数用量），最长 24 小时。
   如果你的 project 启用了 Zero Data Retention，Extended prompt caching 请求不会被阻止。其他 Zero Data Retention 仍然适用，例如从 abuse logs 中排除客户内容，并阻止使用 `store=True`。
   有关 Zero Data Retention 的更多背景，请参阅 [Your data](https://developers.openai.com/api/docs/guides/your-data) 指南。

7. **Prompt Caching 是否适用于 Data Residency？**

   内存内 Prompt Caching 不会存储数据，因此不会影响 Data Residency。

   Extended caching 会在 GPU machines 上临时存储数据，并且在使用 Regional Inference 时只会保留在区域内。
