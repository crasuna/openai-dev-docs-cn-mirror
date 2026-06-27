---
title: "Rate limits"
description: "Rate limits are restrictions that our API imposes on the number of times a user or client can access our services within a specified period of time."
outline: deep
---

# Rate limits

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/rate-limits](https://developers.openai.com/api/docs/guides/rate-limits)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/rate-limits.md](https://developers.openai.com/api/docs/guides/rate-limits.md)
- 抓取时间：2026-06-27T05:54:05.309Z
- Checksum：`63b5fd609b35f11a19d38428a7ca0cc06d89614cf05dfbe2a17607d214f50772`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
速率限制是我们的 API 对用户或客户端在指定时间段内
访问我们服务次数所施加的限制。

## 为什么会有速率限制？

速率限制是 API 的常见做法，设置它们有几个不同原因：

- **它们有助于防止 API 被滥用或误用。** 例如，恶意行为者可能用请求淹没 API，试图使其过载或造成服务中断。通过设置速率限制，OpenAI 可以防止这类活动。
- **速率限制有助于确保每个人都能公平访问 API。** 如果某个人或组织发出过多请求，可能会拖慢所有人的 API 使用体验。通过限制单个用户可发出的请求数量，OpenAI 可以确保尽可能多的人有机会使用 API，而不遭遇明显变慢。
- **速率限制可以帮助 OpenAI 管理基础设施上的总体负载。** 如果 API 请求量大幅增加，可能会给服务器造成压力并引发性能问题。通过设置速率限制，OpenAI 可以帮助所有用户维持顺畅且一致的体验。

请完整阅读本文，以便更好理解
  OpenAI 的速率限制系统如何工作。我们包含了代码示例和处理常见问题的可能
  解决方案。我们还在下面的 usage tiers 部分介绍你的
  速率限制如何自动提升。

## 这些速率限制如何工作？

速率限制使用 **RPM**（requests per minute）、**RPD**（requests per day）、**TPM**（tokens per minute）、**TPD**（tokens per day）、**IPM**（images per minute）以及部分 streaming audio models 的 audio minutes per minute 等指标。取决于哪项先达到上限，任何选项都可能触发速率限制。例如，你可能向 ChatCompletions endpoint 发送 20 个请求，每个请求只有 100 个 tokens，这会用完你的限制（如果你的 RPM 为 20），即使你没有在这 20 个请求中发送 150k tokens（如果你的 TPM 限制为 150k）。

[Batch API](https://developers.openai.com/api/docs/api-reference/batch/create) 队列限制基于指定模型排队中的输入 token 总数计算。待处理 batch jobs 中的 tokens 会计入你的队列限制。一旦 batch job 完成，其 tokens 就不再计入该模型的限制。

其他值得注意的重要事项：

- 速率限制定义在[组织级别](/mirror/api/docs/guides/production-best-practices)和项目级别，而不是用户级别。
- 速率限制会随所使用的[模型](https://developers.openai.com/api/docs/models)而变化。
- 对于 GPT-5.5 这样的长上下文模型，长上下文请求有单独的速率限制。你可以在 [developer console](https://platform.openai.com/settings/organization/limits) 中查看这些速率限制。
- 组织每月可在 API 上花费的总金额也有限制。这些也称为“usage limits”。
- 某些模型家族共享速率限制。你的 [organizations limit page](https://platform.openai.com/settings/organization/limits) 中列在同一个“shared limit”下的任何模型会彼此共享速率限制。例如，如果列出的 shared TPM 是 3.5M，那么对该“shared limit”列表中任何模型的所有调用都会计入这 3.5M。
- Vector store ingestion 也会按 vector store ID 进行速率限制。`/vector_stores/{vector_store_id}/files` 和 `/vector_stores/{vector_store_id}/file_batches` 对每个 vector store 共享每分钟 300 个请求的限制。对于更大的 ingests，请优先使用 `/vector_stores/{vector_store_id}/file_batches`。

## Usage tiers

你可以在账户设置的 [limits](https://platform.openai.com/settings/organization/limits) 部分查看组织的速率和使用限制。随着你在我们的 API 上的支出增加，我们会自动将你升级到下一 usage tier。这通常会提高大多数模型的速率限制。

| Tier        | Qualification                                                         | Usage limits     |
| ----------- | --------------------------------------------------------------------- | ---------------- |
| Free        | 用户必须位于[允许地区](/mirror/api/docs/supported-countries) | $100 / month     |
| Tier&nbsp;1 | 已支付 $5                                                               | $100 / month     |
| Tier&nbsp;2 | 已支付 $50                                                              | $500 / month     |
| Tier&nbsp;3 | 已支付 $100                                                             | $1,000 / month   |
| Tier&nbsp;4 | 已支付 $250                                                             | $5,000 / month   |
| Tier&nbsp;5 | 已支付 $1,000                                                           | $200,000 / month |

要查看每个模型速率限制的高层摘要，请访问 [models page](https://developers.openai.com/api/docs/models)。

### Headers 中的速率限制

除了可以在你的[账户页面](https://platform.openai.com/settings/organization/limits)查看速率限制外，你还可以在 HTTP 响应 headers 中查看有关速率限制的重要信息，例如剩余 requests、tokens 和其他 metadata。

你可以预期看到以下 header fields：

| Field                                | Sample Value | Description                                                                                     |
| ------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------- |
| x-ratelimit-limit-requests           | 60           | 在耗尽速率限制前允许的最大请求数量。             |
| x-ratelimit-limit-tokens             | 150000       | 在耗尽速率限制前允许的最大 token 数量。               |
| x-ratelimit-remaining-requests       | 59           | 在耗尽速率限制前仍允许的请求数量。           |
| x-ratelimit-remaining-tokens         | 149984       | 在耗尽速率限制前仍允许的 token 数量。             |
| x-ratelimit-reset-requests           | 1s           | 基于请求的速率限制重置到初始状态前的时间。                  |
| x-ratelimit-reset-tokens             | 6m0s         | 基于 token 的速率限制重置到初始状态前的时间。                    |
| x-ratelimit-limit-project-tokens     | 60000        | 项目的 token 限制。                                                                |
| x-ratelimit-remaining-project-tokens | 57000        | 在耗尽项目范围 token 速率限制前仍允许的 token 数量。 |
| x-ratelimit-reset-project-tokens     | 3s           | 项目范围 token 速率限制重置到初始状态前的时间。                 |

当项目范围的 token 限制适用时，Project-token headers 可能会出现。

### Fine-tuning 速率限制

你组织的 fine-tuning 速率限制也可以[在 dashboard 中找到](https://platform.openai.com/settings/organization/limits)，也可以通过 API 获取：

## 错误缓解

### 我可以采取哪些步骤来缓解这个问题？

OpenAI Cookbook 中有一个 [Python notebook](https://developers.openai.com/cookbook/examples/how_to_handle_rate_limits)，解释如何避免 rate limit errors；还有一个示例 [Python script](https://github.com/openai/openai-cookbook/blob/main/examples/api_request_parallel_processor.py)，用于在 batch processing API requests 时保持在速率限制之下。

在提供程序化访问、批量处理功能和自动社交媒体发布时，你也应谨慎行事；考虑只为可信客户启用这些功能。

为了防止自动化和高容量误用，请为单个用户在指定时间范围内（日、周或月）设置使用限制。考虑为超过限制的用户实施硬上限或人工审核流程。

#### 使用指数退避重试

避免 rate limit errors 的一个简单方法，是使用随机指数退避自动重试请求。使用指数退避重试意味着在遇到 rate limit error 时短暂 sleep，然后重试失败的请求。如果请求仍然失败，则增加 sleep 时长并重复该流程。这个过程会持续到请求成功或达到最大重试次数。
这种方法有很多好处：

- 自动重试意味着你可以从 rate limit errors 中恢复，而不会崩溃或丢失数据
- 指数退避意味着第一次重试可以很快尝试，同时如果前几次重试失败，仍能受益于更长延迟
- 为延迟添加随机 jitter 有助于避免所有重试同时发生。

请注意，失败的请求也会计入你的每分钟限制，因此持续重新发送同一个请求并不可行。

下面是几个使用指数退避的 **Python** 示例解决方案。

示例 1：使用 Tenacity library

Tenacity 是一个 Apache 2.0 许可的 Python 通用 retrying library，用于简化为几乎任何内容添加重试行为的任务。
要为你的请求添加指数退避，可以使用 `tenacity.retry` decorator。下面的示例使用 `tenacity.wait_random_exponential` 函数为请求添加随机指数退避。

请注意，Tenacity library 是第三方工具，OpenAI 不对
其可靠性或安全性作任何保证。

示例 2：使用 backoff library

另一个为 backoff 和 retry 提供函数 decorators 的 Python library 是 [backoff](https://pypi.org/project/backoff/)：

与 Tenacity 一样，backoff library 是第三方工具，OpenAI 不对其可靠性或安全性作任何保证。

示例 3：手动实现 backoff

如果你不想使用第三方 libraries，可以按照此示例实现自己的 backoff 逻辑：
同样，OpenAI 不对该解决方案的安全性或效率作任何保证，但它可以作为你自己解决方案的良好起点。

#### 将 `max_tokens` 降低到与你的 completions 大小匹配

你的速率限制按 `max_tokens` 与基于请求字符数估算的 token 数二者中的较大值计算。请尽量将 `max_tokens` 值设置得尽可能接近预期响应大小。

#### 批处理请求

如果你的用例不需要即时响应，可以使用 [Batch API](/mirror/api/docs/guides/batch) 更轻松地提交和执行大量请求，而不影响同步请求速率限制。

对于_确实_需要同步响应的用例，OpenAI API 对 **requests per minute** 和 **tokens per minute** 有单独限制。

如果你触及的是 requests per minute 限制，但 tokens per minute 仍有可用容量，可以通过在每个请求中批处理多个任务来提高吞吐量。这会让你每分钟处理更多 tokens，尤其是在使用我们较小的模型时。

发送一批 prompts 与正常 API 调用完全相同，只是你向 prompt 参数传入字符串列表，而不是单个字符串。[在 Batch API guide 中了解更多](/mirror/api/docs/guides/batch)。

:::

## English source

::: details 展开英文原文
::: v-pre
Rate limits are restrictions that our API imposes on the number of times a user or client can
access our services within a specified period of time.

## Why do we have rate limits?

Rate limits are a common practice for APIs, and they're put in place for a few different reasons:

- **They help protect against abuse or misuse of the API.** For example, a malicious actor could flood the API with requests in an attempt to overload it or cause disruptions in service. By setting rate limits, OpenAI can prevent this kind of activity.
- **Rate limits help ensure that everyone has fair access to the API.** If one person or organization makes an excessive number of requests, it could bog down the API for everyone else. By throttling the number of requests that a single user can make, OpenAI ensures that the most number of people have an opportunity to use the API without experiencing slowdowns.
- **Rate limits can help OpenAI manage the aggregate load on its infrastructure.** If requests to the API increase dramatically, it could tax the servers and cause performance issues. By setting rate limits, OpenAI can help maintain a smooth and consistent experience for all users.

Please work through this document in its entirety to better understand how
  OpenAI’s rate limit system works. We include code examples and possible
  solutions to handle common issues. We also include details around how your
  rate limits are automatically increased in the usage tiers section below.

## How do these rate limits work?

Rate limits use metrics such as **RPM** (requests per minute), **RPD** (requests per day), **TPM** (tokens per minute), **TPD** (tokens per day), **IPM** (images per minute), and audio minutes per minute for some streaming audio models. Rate limits can be hit across any of the options depending on what occurs first. For example, you might send 20 requests with only 100 tokens to the ChatCompletions endpoint and that would fill your limit (if your RPM was 20), even if you didn't send 150k tokens (if your TPM limit was 150k) within those 20 requests.

[Batch API](https://developers.openai.com/api/docs/api-reference/batch/create) queue limits are calculated based on the total number of input tokens queued for a given model. Tokens from pending batch jobs are counted against your queue limit. Once a batch job is completed, its tokens are no longer counted against that model's limit.

Other important things worth noting:

- Rate limits are defined at the [organization level](/mirror/api/docs/guides/production-best-practices) and at the project level, not user level.
- Rate limits vary by the [model](https://developers.openai.com/api/docs/models) being used.
- For long context models like GPT-5.5, there is a separate rate limit for long context requests. You can view these rate limits in [developer console](https://platform.openai.com/settings/organization/limits).
- Limits are also placed on the total amount an organization can spend on the API each month. These are also known as "usage limits".
- Some model families have shared rate limits. Any models listed under a "shared limit" in your [organizations limit page](https://platform.openai.com/settings/organization/limits) share a rate limit between them. For example, if the listed shared TPM is 3.5M, all calls to any model in the given "shared limit" list will count towards that 3.5M.
- Vector store ingestion is also rate limited per vector store ID. `/vector_stores/{vector_store_id}/files` and `/vector_stores/{vector_store_id}/file_batches` share a limit of 300 requests per minute for each vector store. For larger ingests, prefer `/vector_stores/{vector_store_id}/file_batches`.

## Usage tiers

You can view the rate and usage limits for your organization under the [limits](https://platform.openai.com/settings/organization/limits) section of your account settings. As your spend on our API goes up, we automatically graduate you to the next usage tier. This usually results in an increase in rate limits across most models.

| Tier        | Qualification                                                         | Usage limits     |
| ----------- | --------------------------------------------------------------------- | ---------------- |
| Free        | User must be in an [allowed geography](/mirror/api/docs/supported-countries) | $100 / month     |
| Tier&nbsp;1 | $5 paid                                                               | $100 / month     |
| Tier&nbsp;2 | $50 paid                                                              | $500 / month     |
| Tier&nbsp;3 | $100 paid                                                             | $1,000 / month   |
| Tier&nbsp;4 | $250 paid                                                             | $5,000 / month   |
| Tier&nbsp;5 | $1,000 paid                                                           | $200,000 / month |

To view a high-level summary of rate limits per model, visit the [models page](https://developers.openai.com/api/docs/models).

### Rate limits in headers

In addition to seeing your rate limit on your [account page](https://platform.openai.com/settings/organization/limits), you can also view important information about your rate limits such as the remaining requests, tokens, and other metadata in the headers of the HTTP response.

You can expect to see the following header fields:

| Field                                | Sample Value | Description                                                                                     |
| ------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------- |
| x-ratelimit-limit-requests           | 60           | The maximum number of requests that are permitted before exhausting the rate limit.             |
| x-ratelimit-limit-tokens             | 150000       | The maximum number of tokens that are permitted before exhausting the rate limit.               |
| x-ratelimit-remaining-requests       | 59           | The remaining number of requests that are permitted before exhausting the rate limit.           |
| x-ratelimit-remaining-tokens         | 149984       | The remaining number of tokens that are permitted before exhausting the rate limit.             |
| x-ratelimit-reset-requests           | 1s           | The time until the rate limit (based on requests) resets to its initial state.                  |
| x-ratelimit-reset-tokens             | 6m0s         | The time until the rate limit (based on tokens) resets to its initial state.                    |
| x-ratelimit-limit-project-tokens     | 60000        | The token limit for the project.                                                                |
| x-ratelimit-remaining-project-tokens | 57000        | The remaining number of tokens permitted before exhausting the project-scoped token rate limit. |
| x-ratelimit-reset-project-tokens     | 3s           | The time until the project-scoped token rate limit resets to its initial state.                 |

Project-token headers may be present when a project-scoped token limit applies.

### Fine-tuning rate limits

The fine-tuning rate limits for your organization can be [found in the dashboard as well](https://platform.openai.com/settings/organization/limits), and can also be retrieved via API:

## Error mitigation

### What are some steps I can take to mitigate this?

The OpenAI Cookbook has a [Python notebook](https://developers.openai.com/cookbook/examples/how_to_handle_rate_limits) that explains how to avoid rate limit errors, as well an example [Python script](https://github.com/openai/openai-cookbook/blob/main/examples/api_request_parallel_processor.py) for staying under rate limits while batch processing API requests.

You should also exercise caution when providing programmatic access, bulk processing features, and automated social media posting - consider only enabling these for trusted customers.

To protect against automated and high-volume misuse, set a usage limit for individual users within a specified time frame (daily, weekly, or monthly). Consider implementing a hard cap or a manual review process for users who exceed the limit.

#### Retrying with exponential backoff

One easy way to avoid rate limit errors is to automatically retry requests with a random exponential backoff. Retrying with exponential backoff means performing a short sleep when a rate limit error is hit, then retrying the unsuccessful request. If the request is still unsuccessful, the sleep length is increased and the process is repeated. This continues until the request is successful or until a maximum number of retries is reached.
This approach has many benefits:

- Automatic retries means you can recover from rate limit errors without crashes or missing data
- Exponential backoff means that your first retries can be tried quickly, while still benefiting from longer delays if your first few retries fail
- Adding random jitter to the delay helps retries from all hitting at the same time.

Note that unsuccessful requests contribute to your per-minute limit, so continuously resending a request won’t work.

Below are a few example solutions **for Python** that use exponential backoff.

Example 1: Using the Tenacity library

Tenacity is an Apache 2.0 licensed general-purpose retrying library, written in Python, to simplify the task of adding retry behavior to just about anything.
To add exponential backoff to your requests, you can use the `tenacity.retry` decorator. The below example uses the `tenacity.wait_random_exponential` function to add random exponential backoff to a request.

Note that the Tenacity library is a third-party tool, and OpenAI makes no guarantees about
its reliability or security.

Example 2: Using the backoff library

Another python library that provides function decorators for backoff and retry is [backoff](https://pypi.org/project/backoff/):

Like Tenacity, the backoff library is a third-party tool, and OpenAI makes no guarantees about its reliability or security.

Example 3: Manual backoff implementation

If you don't want to use third-party libraries, you can implement your own backoff logic following this example:
Again, OpenAI makes no guarantees on the security or efficiency of this solution but it can be a good starting place for your own solution.

#### Reduce the `max_tokens` to match the size of your completions

Your rate limit is calculated as the maximum of `max_tokens` and the estimated number of tokens based on the character count of your request. Try to set the `max_tokens` value as close to your expected response size as possible.

#### Batching requests

If your use case does not require immediate responses, you can use the [Batch API](/mirror/api/docs/guides/batch) to more easily submit and execute large collections of requests without impacting your synchronous request rate limits.

For use cases that _do_ requires synchronous responses, the OpenAI API has separate limits for **requests per minute** and **tokens per minute**.

If you're hitting the limit on requests per minute but have available capacity on tokens per minute, you can increase your throughput by batching multiple tasks into each request. This will allow you to process more tokens per minute, especially with our smaller models.

Sending in a batch of prompts works exactly the same as a normal API call, except you pass in a list of strings to the prompt parameter instead of a single string. [Learn more in the Batch API guide](/mirror/api/docs/guides/batch).

:::
:::

