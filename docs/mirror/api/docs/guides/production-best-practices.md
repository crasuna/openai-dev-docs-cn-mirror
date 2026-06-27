---
title: "Production best practices"
description: "Explore best practices for transitioning your AI projects from prototype to production, including scaling, security, and cost management."
outline: deep
---

# Production best practices

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/production-best-practices](https://developers.openai.com/api/docs/guides/production-best-practices)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/production-best-practices.md](https://developers.openai.com/api/docs/guides/production-best-practices.md)
- 抓取时间：2026-06-27T05:54:04.474Z
- Checksum：`1c479ec763f6d857aa384aa20d9b398b46143302af16e147ea284da301841b52`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
本指南提供一套全面的最佳实践，帮助你从原型过渡到生产。无论你是经验丰富的机器学习工程师，还是刚开始投入其中的爱好者，本指南都应能提供你在生产环境中成功使用平台所需的工具：从保护 API 访问，到设计能够处理高流量的稳健架构。你可以使用本指南，帮助自己尽可能顺畅、高效地制定应用部署计划。

如果你想进一步探索进入生产阶段的最佳实践，请查看我们的 Developer Day 演讲：

&lt;iframe
  width="100%"
  height="315"
  src="https://www.youtube-nocookie.com/embed/XGJNo8TpuVA?si=mvYm3Un23iHnlXcg"
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowFullScreen
&gt;&lt;/iframe&gt;

## 设置你的组织

当你[登录](https://platform.openai.com/login) OpenAI 账户后，可以在[组织设置](https://platform.openai.com/settings/organization/general)中找到组织名称和 ID。组织名称是在用户界面中显示的组织标签。组织 ID 是组织的唯一标识符，可用于 API 请求。

属于多个组织的用户可以[传递一个 header](https://developers.openai.com/api/docs/api-reference/requesting-organization)，以指定某个 API 请求使用哪个组织。这些 API 请求产生的用量将计入指定组织的额度。如果未提供 header，则会向[默认组织](https://platform.openai.com/settings/organization/api-keys)计费。你可以在[用户设置](https://platform.openai.com/settings/organization/api-keys)中更改默认组织。

你可以从 [Team 页面](https://platform.openai.com/settings/organization/team)邀请新成员加入组织。成员可以是 **readers** 或 **owners**。

Readers：

- 可以发起 API 请求。
- 可以查看基本组织信息。
- 除非另有说明，可以在组织中创建、更新和删除资源（例如 Assistants）。

Owners：

- 拥有 readers 的所有权限。
- 可以修改 billing 信息。
- 可以管理组织中的成员。

### 管理 billing 限制

输入 billing 信息后，你将获得每月 $100 的已批准用量限制，该限制由 OpenAI 设置。随着你在平台上的用量增加并从一个[用量层级](/mirror/api/docs/guides/rate-limits#usage-tiers)进入另一个层级，你的额度限制会自动提高。你可以在账户设置中的 [limits](https://platform.openai.com/settings/organization/limits) 页面查看当前用量限制。

如果你希望在用量超过某个美元金额时收到通知，可以通过 [usage limits](https://platform.openai.com/settings/organization/limits) 页面设置通知阈值。

### API keys

OpenAI API 使用 API keys 进行身份验证。访问你的 [API keys](https://platform.openai.com/settings/organization/api-keys) 页面，获取将在请求中使用的 API key。

这是一种相对直接的访问控制方式，但你必须谨慎保护这些 keys。避免在代码或公共仓库中暴露 API keys；应将它们存放在安全位置。你应使用环境变量或密钥管理服务向应用暴露 keys，这样就不需要把它们硬编码到代码库中。更多信息请阅读我们的 [API key 安全最佳实践](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)。

启用跟踪后，可以在 [Usage 页面](https://platform.openai.com/usage)监控 API key 用量。如果你使用的是 2023 年 12 月 20 日之前生成的 API key，默认不会启用跟踪。你可以在 [API key 管理 dashboard](https://platform.openai.com/api-keys)中启用后续跟踪。2023 年 12 月 20 日之后生成的所有 API keys 都已启用跟踪。此前未跟踪的任何用量将在 dashboard 中显示为 `Untracked`。

### Staging projects

随着规模扩大，你可能希望为 staging 和 production 环境创建独立的 projects。你可以在 dashboard 中创建这些 projects，以隔离开发和测试工作，避免意外影响线上应用。你还可以限制用户对 production project 的访问，并为每个 project 设置自定义速率和支出限制。

## 扩展你的解决方案架构

在设计使用我们 API 的生产应用或服务时，考虑如何扩展以满足流量需求非常重要。无论你选择哪家云服务提供商，都需要考虑几个关键方面：

- **水平扩展**：你可能希望横向扩展应用，以容纳来自多个来源的请求。这可能涉及部署额外的服务器或容器来分担负载。如果选择这种扩展方式，请确保你的架构设计能够处理多个节点，并且具备在节点之间平衡负载的机制。
- **垂直扩展**：另一种选择是纵向扩展应用，也就是增强单个节点可用的资源。这会涉及升级服务器能力，以处理额外负载。如果选择这种扩展方式，请确保你的应用设计能够利用这些额外资源。
- **缓存**：通过存储经常访问的数据，你可以改善响应时间，而无需反复调用我们的 API。你的应用需要被设计为尽可能使用缓存数据，并在添加新信息时使缓存失效。你可以用几种不同方式实现这一点。例如，可以根据最适合应用的方式，将数据存储在数据库、文件系统或内存缓存中。
- **负载均衡**：最后，考虑使用负载均衡技术，确保请求均匀分布到可用服务器上。这可能涉及在服务器前使用负载均衡器，或使用 DNS round-robin。平衡负载有助于提升性能并减少瓶颈。

### 管理速率限制

使用我们的 API 时，理解并规划[速率限制](/mirror/api/docs/guides/rate-limits)非常重要。

## 改善延迟

请查看我们最新的[延迟优化](/mirror/api/docs/guides/latency-optimization)指南。

延迟是指请求被处理并返回响应所需的时间。在本节中，我们将讨论影响文本生成模型延迟的一些因素，并提供降低延迟的建议。

completion 请求的延迟主要受两个因素影响：模型和生成的 token 数。completion 请求的生命周期如下：



大部分延迟通常来自 token 生成步骤。

&gt; **直觉**：Prompt tokens 对 completion 调用只会增加很少的延迟。生成 completion tokens 所需的时间要长得多，因为 tokens 是逐个生成的。较长的生成长度会因为每个 token 都需要生成而累积延迟。

### 影响延迟的常见因素和可能的缓解技术

了解延迟基础后，我们来看看可能影响延迟的各类因素，下面大致按影响程度从高到低排列。

#### 模型

我们的 API 提供复杂度和通用性各不相同的模型。能力最强的模型，例如 `gpt-5.5`，可以生成更复杂、更多样的 completions，但处理查询也需要更长时间。
`gpt-5.4-mini` 和 `gpt-5.4-nano` 等模型可以生成更快、更便宜的 Responses；当你希望在复杂任务上有更多余量时，`gpt-5.5` 是更强的默认选择。你可以选择最适合用例的模型，并权衡速度、成本和质量。

#### Completion tokens 数量

请求大量生成 tokens completions 可能会导致延迟增加：

- **降低 max tokens**：对于 token 生成数量相近的请求，`max_tokens` 参数较低的请求会产生更低延迟。
- **包含 stop sequences**：为避免生成不需要的 tokens，请添加 stop sequence。例如，你可以使用 stop sequences 生成包含特定数量条目的列表。在这种情况下，使用 `11.` 作为 stop sequence，可以生成只有 10 个条目的列表，因为 completion 会在到达 `11.` 时停止。请阅读我们的 [stop sequences 帮助文章](https://help.openai.com/en/articles/5072263-how-do-i-use-stop-sequences)，了解更多相关背景。
- **生成更少的 completions**：尽可能降低 `n` 和 `best_of` 的值，其中 `n` 表示每个 prompt 生成多少个 completions，`best_of` 用于表示每个 token 对数概率最高的结果。

如果 `n` 和 `best_of` 都等于 1（默认值），则生成 tokens 的数量最多等于 `max_tokens`。

如果 `n`（返回的 completions 数量）或 `best_of`（为参与选择而生成的 completions 数量）设置为 `&gt; 1`，每个请求都会创建多个输出。此时，你可以将生成 tokens 数量视为 `[ max_tokens * max (n, best_of) ]`。

#### Streaming

在请求中设置 `stream: true` 会使模型在 tokens 可用后立即开始返回，而不是等待完整 token 序列生成完毕。它不会改变获得全部 tokens 的总时间，但会缩短应用的首个 token 时间，适用于希望展示部分进度或准备停止生成的场景。这可以带来更好的用户体验和 UX 改进，因此值得尝试 streaming。

#### Batching

取决于你的用例，batching &lt;em&gt;可能有帮助&lt;/em&gt;。如果你向同一个端点发送多个请求，可以将 [prompts 批量合并](/mirror/api/docs/guides/rate-limits#batching-requests)到同一个请求中发送。这会减少需要发出的请求数量。prompt 参数最多可容纳 20 个唯一 prompts。我们建议你测试这种方法，看看它是否有帮助。在某些情况下，你可能最终会增加生成 tokens 数量，从而放慢响应时间。

## 管理成本

若要监控成本，你可以在账户中设置[通知阈值](https://platform.openai.com/settings/organization/limits)，当用量超过某个阈值时收到电子邮件提醒。使用 [usage tracking dashboard](https://platform.openai.com/settings/organization/usage) 监控当前和过去 billing 周期内的 token 用量。

### 文本生成

将原型迁移到生产时，其中一个挑战是为运行应用相关成本做预算。OpenAI 提供[按量付费定价模型](https://openai.com/api/pricing/)，按每 1,000 tokens 计价（大约等于 750 个单词）。若要估算成本，你需要预测 token 使用量。请考虑流量水平、用户与你的应用交互的频率，以及你将处理的数据量等因素。

**一种有用的成本降低思考框架，是把成本视为 token 数量与每 token 成本的函数。** 使用这个框架有两条潜在的降本路径。首先，你可以通过在某些任务中切换到更小的模型来降低每 token 成本。或者，你可以尝试减少所需的 token 数量。实现方式有几种，例如使用更短的 prompts、[微调](/mirror/api/docs/guides/model-optimization)模型，或缓存常见用户查询，避免重复处理。

你可以尝试我们的交互式 [tokenizer 工具](https://platform.openai.com/tokenizer)来帮助估算成本。API 和 playground 也会在响应中返回 token 计数。一旦你已经用我们能力最强的模型跑通，就可以看看其他模型是否能以更低延迟和成本产生相同结果。更多信息请参阅我们的 [token 用量帮助文章](https://help.openai.com/en/articles/6614209-how-do-i-check-my-token-usage)。

## MLOps 策略

当你将原型迁移到生产时，可能需要考虑制定 MLOps 策略。MLOps（machine learning operations）指管理机器学习模型端到端生命周期的过程，包括你可能使用我们 API 微调的任何模型。设计 MLOps 策略时需要考虑多个方面，包括：

- 数据和模型管理：管理用于训练或微调模型的数据，并跟踪版本和变更。
- 模型监控：随时间跟踪模型性能，并检测任何潜在问题或退化。
- 模型再训练：确保模型随着数据变化或需求演进保持最新，并根据需要重新训练或微调。
- 模型部署：自动化将模型及相关工件部署到生产的过程。

仔细思考应用的这些方面，将有助于确保模型随时间保持相关性并表现良好。

## 安全与合规

当你将原型迁移到生产时，需要评估并处理可能适用于应用的任何安全和合规要求。这会涉及检查你正在处理的数据、理解我们的 API 如何处理数据，以及确定必须遵守哪些法规。我们的[安全实践](https://www.openai.com/security)和[信任与合规门户](https://trust.openai.com/)提供最全面、最新的文档。供参考，这里还有我们的[隐私政策](https://openai.com/privacy/)和[使用条款](https://openai.com/api/policies/terms/)。

一些需要考虑的常见方面包括数据存储、数据传输和数据保留。你可能还需要尽可能实现数据隐私保护，例如加密或匿名化。此外，你应遵循安全编码最佳实践，例如输入清理和适当的错误处理。

### 安全最佳实践

使用我们的 API 创建应用时，请考虑我们的[安全最佳实践](/mirror/api/docs/guides/safety-best-practices)，以确保应用安全且成功。这些建议强调了充分测试产品、主动处理潜在问题，以及限制误用机会的重要性。

## 业务考虑

当使用 AI 的项目从原型走向生产时，重要的是思考如何用 AI 构建优秀产品，以及这如何回到你的核心业务。我们当然没有所有答案，但一个很好的起点是我们的 Developer Day 演讲，在其中我们与一些客户深入探讨了这一主题：

&lt;iframe
  width="100%"
  height="315"
  src="https://www.youtube-nocookie.com/embed/knHW-p31R0c?si=g0ddoMoUykjclH4k"
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowFullScreen
&gt;&lt;/iframe&gt;

:::

## English source

::: details 展开英文原文
::: v-pre
This guide provides a comprehensive set of best practices to help you transition from prototype to production. Whether you are a seasoned machine learning engineer or a recent enthusiast, this guide should provide you with the tools you need to successfully put the platform to work in a production setting: from securing access to our API to designing a robust architecture that can handle high traffic volumes. Use this guide to help develop a plan for deploying your application as smoothly and effectively as possible.

If you want to explore best practices for going into production further, please check out our Developer Day talk:

&lt;iframe
  width="100%"
  height="315"
  src="https://www.youtube-nocookie.com/embed/XGJNo8TpuVA?si=mvYm3Un23iHnlXcg"
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowFullScreen
&gt;&lt;/iframe&gt;

## Setting up your organization

Once you [log in](https://platform.openai.com/login) to your OpenAI account, you can find your organization name and ID in your [organization settings](https://platform.openai.com/settings/organization/general). The organization name is the label for your organization, shown in user interfaces. The organization ID is the unique identifier for your organization which can be used in API requests.

Users who belong to multiple organizations can [pass a header](https://developers.openai.com/api/docs/api-reference/requesting-organization) to specify which organization is used for an API request. Usage from these API requests will count against the specified organization's quota. If no header is provided, the [default organization](https://platform.openai.com/settings/organization/api-keys) will be billed. You can change your default organization in your [user settings](https://platform.openai.com/settings/organization/api-keys).

You can invite new members to your organization from the [Team page](https://platform.openai.com/settings/organization/team). Members can be **readers** or **owners**.

Readers:

- Can make API requests.
- Can view basic organization information.
- Can create, update, and delete resources (like Assistants) in the organization, unless otherwise noted.

Owners:

- Have all the permissions of readers.
- Can modify billing information.
- Can manage members within the organization.

### Managing billing limits

Once you’ve entered your billing information, you will have an approved usage limit of $100 per month, which is set by OpenAI. Your quota limit will automatically increase as your usage on your platform increases and you move from one [usage tier](/mirror/api/docs/guides/rate-limits#usage-tiers) to another. You can review your current usage limit in the [limits](https://platform.openai.com/settings/organization/limits) page in your account settings.

If you’d like to be notified when your usage exceeds a certain dollar amount, you can set a notification threshold through the [usage limits](https://platform.openai.com/settings/organization/limits) page.

### API keys

The OpenAI API uses API keys for authentication. Visit your [API keys](https://platform.openai.com/settings/organization/api-keys) page to retrieve the API key you'll use in your requests.

This is a relatively straightforward way to control access, but you must be vigilant about securing these keys. Avoid exposing the API keys in your code or in public repositories; instead, store them in a secure location. You should expose your keys to your application using environment variables or secret management service, so that you don't need to hard-code them in your codebase. Read more in our [Best practices for API key safety](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety).

API key usage can be monitored on the [Usage page](https://platform.openai.com/usage) once tracking is enabled. If you are using an API key generated prior to Dec 20, 2023 tracking will not be enabled by default. You can enable tracking going forward on the [API key management dashboard](https://platform.openai.com/api-keys). All API keys generated past Dec 20, 2023 have tracking enabled. Any previous untracked usage will be displayed as `Untracked` in the dashboard.

### Staging projects

As you scale, you may want to create separate projects for your staging and production environments. You can create these projects in the dashboard, allowing you to isolate your development and testing work, so you don't accidentally disrupt your live application. You can also limit user access to your production project, and set custom rate and spend limits per project.

## Scaling your solution architecture

When designing your application or service for production that uses our API, it's important to consider how you will scale to meet traffic demands. There are a few key areas you will need to consider regardless of the cloud service provider of your choice:

- **Horizontal scaling**: You may want to scale your application out horizontally to accommodate requests to your application that come from multiple sources. This could involve deploying additional servers or containers to distribute the load. If you opt for this type of scaling, make sure that your architecture is designed to handle multiple nodes and that you have mechanisms in place to balance the load between them.
- **Vertical scaling**: Another option is to scale your application up vertically, meaning you can beef up the resources available to a single node. This would involve upgrading your server's capabilities to handle the additional load. If you opt for this type of scaling, make sure your application is designed to take advantage of these additional resources.
- **Caching**: By storing frequently accessed data, you can improve response times without needing to make repeated calls to our API. Your application will need to be designed to use cached data whenever possible and invalidate the cache when new information is added. There are a few different ways you could do this. For example, you could store data in a database, filesystem, or in-memory cache, depending on what makes the most sense for your application.
- **Load balancing**: Finally, consider load-balancing techniques to ensure requests are distributed evenly across your available servers. This could involve using a load balancer in front of your servers or using DNS round-robin. Balancing the load will help improve performance and reduce bottlenecks.

### Managing rate limits

When using our API, it's important to understand and plan for [rate limits](/mirror/api/docs/guides/rate-limits).

## Improving latencies

Check out our most up-to-date guide on [latency optimization](/mirror/api/docs/guides/latency-optimization).

Latency is the time it takes for a request to be processed and a response to be returned. In this section, we will discuss some factors that influence the latency of our text generation models and provide suggestions on how to reduce it.

The latency of a completion request is mostly influenced by two factors: the model and the number of tokens generated. The life cycle of a completion request looks like this:



The bulk of the latency typically arises from the token generation step.

&gt; **Intuition**: Prompt tokens add very little latency to completion calls. Time to generate completion tokens is much longer, as tokens are generated one at a time. Longer generation lengths will accumulate latency due to generation required for each token.

### Common factors affecting latency and possible mitigation techniques

Now that we have looked at the basics of latency, let’s take a look at various factors that can affect latency, broadly ordered from most impactful to least impactful.

#### Model

Our API offers different models with varying levels of complexity and generality. The most capable models, such as `gpt-5.5`, can generate more complex and diverse completions, but they also take longer to process your query.
Models such as `gpt-5.4-mini` and `gpt-5.4-nano` can generate faster and cheaper Responses, while `gpt-5.5` is a stronger default when you want more headroom on complex tasks. You can choose the model that best suits your use case and the trade-off between speed, cost, and quality.

#### Number of completion tokens

Requesting a large amount of generated tokens completions can lead to increased latencies:

- **Lower max tokens**: for requests with a similar token generation count, those that have a lower `max_tokens` parameter incur less latency.
- **Include stop sequences**: to prevent generating unneeded tokens, add a stop sequence. For example, you can use stop sequences to generate a list with a specific number of items. In this case, by using `11.` as a stop sequence, you can generate a list with only 10 items, since the completion will stop when `11.` is reached. [Read our help article on stop sequences](https://help.openai.com/en/articles/5072263-how-do-i-use-stop-sequences) for more context on how you can do this.
- **Generate fewer completions**: lower the values of `n` and `best_of` when possible where `n` refers to how many completions to generate for each prompt and `best_of` is used to represent the result with the highest log probability per token.

If `n` and `best_of` both equal 1 (which is the default), the number of generated tokens will be at most, equal to `max_tokens`.

If `n` (the number of completions returned) or `best_of` (the number of completions generated for consideration) are set to `&gt; 1`, each request will create multiple outputs. Here, you can consider the number of generated tokens as `[ max_tokens * max (n, best_of) ]`

#### Streaming

Setting `stream: true` in a request makes the model start returning tokens as soon as they are available, instead of waiting for the full sequence of tokens to be generated. It does not change the time to get all the tokens, but it reduces the time for first token for an application where we want to show partial progress or are going to stop generations. This can be a better user experience and a UX improvement so it’s worth experimenting with streaming.

#### Batching

Depending on your use case, batching &lt;em&gt;may help&lt;/em&gt;. If you are sending multiple requests to the same endpoint, you can [batch the prompts](/mirror/api/docs/guides/rate-limits#batching-requests) to be sent in the same request. This will reduce the number of requests you need to make. The prompt parameter can hold up to 20 unique prompts. We advise you to test out this method and see if it helps. In some cases, you may end up increasing the number of generated tokens which will slow the response time.

## Managing costs

To monitor your costs, you can set a [notification threshold](https://platform.openai.com/settings/organization/limits) in your account to receive an email alert once you pass a certain usage threshold. Use the [usage tracking dashboard](https://platform.openai.com/settings/organization/usage) to monitor your token usage during the current and past billing cycles.

### Text generation

One of the challenges of moving your prototype into production is budgeting for the costs associated with running your application. OpenAI offers a [pay-as-you-go pricing model](https://openai.com/api/pricing/), with prices per 1,000 tokens (roughly equal to 750 words). To estimate your costs, you will need to project the token utilization. Consider factors such as traffic levels, the frequency with which users will interact with your application, and the amount of data you will be processing.

**One useful framework for thinking about reducing costs is to consider costs as a function of the number of tokens and the cost per token.** There are two potential avenues for reducing costs using this framework. First, you could work to reduce the cost per token by switching to smaller models for some tasks in order to reduce costs. Alternatively, you could try to reduce the number of tokens required. There are a few ways you could do this, such as by using shorter prompts, [fine-tuning](/mirror/api/docs/guides/model-optimization) models, or caching common user queries so that they don't need to be processed repeatedly.

You can experiment with our interactive [tokenizer tool](https://platform.openai.com/tokenizer) to help you estimate costs. The API and playground also returns token counts as part of the response. Once you’ve got things working with our most capable model, you can see if the other models can produce the same results with lower latency and costs. Learn more in our [token usage help article](https://help.openai.com/en/articles/6614209-how-do-i-check-my-token-usage).

## MLOps strategy

As you move your prototype into production, you may want to consider developing an MLOps strategy. MLOps (machine learning operations) refers to the process of managing the end-to-end life cycle of your machine learning models, including any models you may be fine-tuning using our API. There are a number of areas to consider when designing your MLOps strategy. These include

- Data and model management: managing the data used to train or fine-tune your model and tracking versions and changes.
- Model monitoring: tracking your model's performance over time and detecting any potential issues or degradation.
- Model retraining: ensuring your model stays up to date with changes in data or evolving requirements and retraining or fine-tuning it as needed.
- Model deployment: automating the process of deploying your model and related artifacts into production.

Thinking through these aspects of your application will help ensure your model stays relevant and performs well over time.

## Security and compliance

As you move your prototype into production, you will need to assess and address any security and compliance requirements that may apply to your application. This will involve examining the data you are handling, understanding how our API processes data, and determining what regulations you must adhere to. Our [security practices](https://www.openai.com/security) and [trust and compliance portal](https://trust.openai.com/) provide our most comprehensive and up-to-date documentation. For reference, here is our [Privacy Policy](https://openai.com/privacy/) and [Terms of Use](https://openai.com/api/policies/terms/).

Some common areas you'll need to consider include data storage, data transmission, and data retention. You might also need to implement data privacy protections, such as encryption or anonymization where possible. In addition, you should follow best practices for secure coding, such as input sanitization and proper error handling.

### Safety best practices

When creating your application with our API, consider our [safety best practices](/mirror/api/docs/guides/safety-best-practices) to ensure your application is safe and successful. These recommendations highlight the importance of testing the product extensively, being proactive about addressing potential issues, and limiting opportunities for misuse.

## Business considerations

As projects using AI move from prototype to production, it is important to consider how to build a great product with AI and how that ties back to your core business. We certainly don't have all the answers but a great starting place is a talk from our Developer Day where we dive into this with some of our customers:

&lt;iframe
  width="100%"
  height="315"
  src="https://www.youtube-nocookie.com/embed/knHW-p31R0c?si=g0ddoMoUykjclH4k"
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowFullScreen
&gt;&lt;/iframe&gt;

:::
:::

