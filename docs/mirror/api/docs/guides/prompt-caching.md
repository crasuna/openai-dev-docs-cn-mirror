---
title: "Prompt caching 提示词缓存"
description: "Learn how prompt caching reduces latency and cost for long prompts in OpenAI's API."
outline: deep
---

# Prompt caching 提示词缓存

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/prompt-caching](https://developers.openai.com/api/docs/guides/prompt-caching)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/prompt-caching.md](https://developers.openai.com/api/docs/guides/prompt-caching.md)
- 抓取时间：2026-06-27T05:54:04.476Z
- Checksum：`4c17902fd34fbcb20ea25c852f2b34897bfaf6cbc8a7ccb30b592c6dd0bd5512`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
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
   有关 Zero Data Retention 的更多背景，请参阅 [Your data](/mirror/api/docs/guides/your-data) 指南。

7. **Prompt Caching 是否适用于 Data Residency？**

   内存内 Prompt Caching 不会存储数据，因此不会影响 Data Residency。

   Extended caching 会在 GPU machines 上临时存储数据，并且在使用 Regional Inference 时只会保留在区域内。

:::

## English source

::: details 展开英文原文
::: v-pre
Model prompts often contain repetitive content, like system prompts and common instructions. OpenAI routes API requests to servers that recently processed the same prompt, making it cheaper and faster than processing a prompt from scratch. Prompt Caching can reduce latency by up to 80% and input token costs by up to 90%. Prompt Caching works automatically on all your API requests (no code changes required) and has no additional fees associated with it. Prompt Caching is enabled for all recent [models](https://developers.openai.com/api/docs/models), gpt-4o and newer.

This guide describes how Prompt Caching works in detail, so that you can optimize your prompts for lower latency and cost.

## Structuring prompts

Cache hits are only possible for exact prefix matches within a prompt. To realize caching benefits, place static content like instructions and examples at the beginning of your prompt, and put variable content, such as user-specific information, at the end. This also applies to images and tools, which must be identical between requests.

![Prompt Caching visualization](https://openaidevs.retool.com/api/file/8593d9bb-4edb-4eb6-bed9-62bfb98db5ee)

## How it works

Caching is enabled automatically for prompts that are 1024 tokens or longer. When you make an API request, the following steps occur:

1. **Cache Routing**:

- Requests are routed to a machine based on a hash of the initial prefix of the prompt. The hash typically uses the first 256 tokens, though the exact length varies depending on the model.
- If you provide the [`prompt_cache_key`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-prompt_cache_key) parameter, it is combined with the prefix hash, allowing you to influence routing and improve cache hit rates. This is especially beneficial when many requests share long, common prefixes.
- If requests for the same prefix and `prompt_cache_key` combination exceed a certain rate (approximately 15 requests per minute), some may overflow and get routed to additional machines, reducing cache effectiveness.

2. **Cache Lookup**: The system checks if the initial portion (prefix) of your prompt exists in the cache on the selected machine.
3. **Cache Hit**: If a matching prefix is found, the system uses the cached result. This significantly decreases latency and reduces costs.
4. **Cache Miss**: If no matching prefix is found, the system processes your full prompt, caching the prefix afterward on that machine for future requests.

## Prompt cache retention

Prompt Caching can either use in-memory or extended retention policies. When available, Extended Prompt Caching aims to retain the cache for longer, so that subsequent requests are more likely to match the cache.

Prompt cache pricing is the same for both retention policies.

To configure the prompt cache retention policy, set the `prompt_cache_retention` parameter on your `Responses.create` request (or `chat.completions.create` if using Chat Completions).

### In-memory prompt cache retention

In-memory prompt cache retention is available for all models that support Prompt Caching, except for `gpt-5.5`, `gpt-5.5-pro`, and all future models.

When using the in-memory policy, cached prefixes generally remain active for 5 to 10 minutes of inactivity, up to a maximum of one hour. In-memory cached prefixes are only held within volatile GPU memory.

### Extended prompt cache retention

Extended prompt cache retention is available for the following models:

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

Extended prompt cache retention keeps cached prefixes active for longer, up to a maximum of 24 hours. Extended Prompt Caching works by offloading the key/value tensors to GPU-local storage when memory is full, significantly increasing the storage capacity available for caching.

key/value tensors are the intermediate representation from the model's attention layers produced during prefill. Only the key/value tensors may be persisted in local storage; the original customer content, such as prompt text, is only retained in memory.

### Configure per request

For `gpt-5.5`, `gpt-5.5-pro`, and future models, only `24h` is supported.

For older models that support both `in_memory` and `24h`, the default depends on your organization's data retention policy:

- Organizations without ZDR enabled default to `24h`.
- Organizations with ZDR enabled default to `in_memory` when `prompt_cache_retention` is not specified.

```json
{
  "model": "gpt-5.5",
  "input": "Your prompt goes here...",
  "prompt_cache_retention": "24h"
}
```


## Requirements

Caching is available for prompts containing 1024 tokens or more.

All requests, including those with fewer than 1024 tokens, will display a `cached_tokens` field of the `usage.prompt_tokens_details` [Response object](https://developers.openai.com/api/docs/api-reference/responses/object) or [Chat object](https://developers.openai.com/api/docs/api-reference/chat/object) indicating how many of the prompt tokens were a cache hit. For requests under 1024 tokens, `cached_tokens` will be zero.

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

### What can be cached

- **Messages:** The complete messages array, encompassing system, user, and assistant interactions.
- **Images:** Images included in user messages, either as links or as base64-encoded data, as well as multiple images can be sent. Ensure the detail parameter is set identically, as it impacts image tokenization.
- **Tool use:** Both the messages array and the list of available `tools` can be cached, contributing to the minimum 1024 token requirement.
- **Structured outputs:** The structured output schema serves as a prefix to the system message and can be cached.

## Best practices

- Structure prompts with **static or repeated content at the beginning** and dynamic, user-specific content at the end.
- Use the **[`prompt_cache_key`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-prompt_cache_key) parameter** consistently across requests that share common prefixes. Select a granularity that keeps each unique prefix-`prompt_cache_key` combination below 15 requests per minute to avoid cache overflow.
- **Monitor your cache performance metrics**, including cache hit rates, latency, and the proportion of tokens cached, to refine your strategy. You can monitor your cached token counts by logging the usage field results as shown above, or in the OpenAI Usage dashboard.
- **Maintain a steady stream of requests** with identical prompt prefixes to minimize cache evictions and maximize caching benefits.

## Frequently asked questions

1. **How is data privacy maintained for caches?**

   Prompt caches are not shared between organizations. Only members of the same organization can access caches of identical prompts. When using Extended Prompt Caching, key/value tensors have a maximum retention period of 24 hours.

2. **Does Prompt Caching affect output token generation or the final response of the API?**

   Prompt Caching does not influence the generation of output tokens or the final response provided by the API. Regardless of whether caching is used, the output generated will be identical. This is because only the prompt itself is cached, while the actual response is computed anew each time based on the cached prompt.

3. **Is there a way to manually clear the cache?**

   Manual cache clearing is not currently available. Prompts that have not been encountered recently are automatically cleared from the cache. Typical cache evictions occur after 5-10 minutes of inactivity, though sometimes lasting up to a maximum of one hour during off-peak periods.

4. **Will I be expected to pay extra for writing to Prompt Caching?**

   No. Caching happens automatically, with no explicit action needed or extra cost paid to use the caching feature.

5. **Do cached prompts contribute to TPM rate limits?**

   Yes, as caching does not affect rate limits.

6. **Does Prompt Caching work on Zero Data Retention requests?**

   In-memory cache retention does not save any data to disk.
   Extended prompt caching may store key/value tensors in GPU-local storage, and the key-value tensors are derived from customer content. This data is not retained beyond cache expiration -- the key-value tensors are retained for 1-2 hours (most usage) and at most 24 hours.
   Extended prompt caching requests are not blocked if Zero Data Retention is enabled for your project. Other Zero Data Retention still applies, such as excluding customer content from abuse logs and preventing use of `store=True`.
   See the [Your data](/mirror/api/docs/guides/your-data) guide for more context on Zero Data Retention.

7. **Does Prompt Caching work with Data Residency?**

   In-memory Prompt Caching does not store data and so does not impact Data Residency.

   Extended caching temporarily stores data on GPU machines and will only be kept in-region when using Regional Inference.

:::
:::

