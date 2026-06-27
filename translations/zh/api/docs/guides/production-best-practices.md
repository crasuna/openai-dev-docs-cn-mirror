---
status: needs-review
sourceId: "1c479ec763f6"
sourceChecksum: "1c479ec763f6d857aa384aa20d9b398b46143302af16e147ea284da301841b52"
sourceUrl: "https://developers.openai.com/api/docs/guides/production-best-practices"
translatedAt: "2026-06-27T10:01:07.242Z"
translator: codex-gpt-5.5-xhigh
---

# 生产最佳实践

本指南提供一套全面的最佳实践，帮助你从原型过渡到生产。无论你是经验丰富的机器学习工程师，还是刚开始投入其中的爱好者，本指南都应能提供你在生产环境中成功使用平台所需的工具：从保护 API 访问，到设计能够处理高流量的稳健架构。你可以使用本指南，帮助自己尽可能顺畅、高效地制定应用部署计划。

如果你想进一步探索进入生产阶段的最佳实践，请查看我们的 Developer Day 演讲：

<iframe
  width="100%"
  height="315"
  src="https://www.youtube-nocookie.com/embed/XGJNo8TpuVA?si=mvYm3Un23iHnlXcg"
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowFullScreen
></iframe>

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

输入 billing 信息后，你将获得每月 $100 的已批准用量限制，该限制由 OpenAI 设置。随着你在平台上的用量增加并从一个[用量层级](https://developers.openai.com/api/docs/guides/rate-limits#usage-tiers)进入另一个层级，你的额度限制会自动提高。你可以在账户设置中的 [limits](https://platform.openai.com/settings/organization/limits) 页面查看当前用量限制。

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

使用我们的 API 时，理解并规划[速率限制](https://developers.openai.com/api/docs/guides/rate-limits)非常重要。

## 改善延迟

请查看我们最新的[延迟优化](https://developers.openai.com/api/docs/guides/latency-optimization)指南。

延迟是指请求被处理并返回响应所需的时间。在本节中，我们将讨论影响文本生成模型延迟的一些因素，并提供降低延迟的建议。

completion 请求的延迟主要受两个因素影响：模型和生成的 token 数。completion 请求的生命周期如下：

<br />

大部分延迟通常来自 token 生成步骤。

> **直觉**：Prompt tokens 对 completion 调用只会增加很少的延迟。生成 completion tokens 所需的时间要长得多，因为 tokens 是逐个生成的。较长的生成长度会因为每个 token 都需要生成而累积延迟。

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

如果 `n`（返回的 completions 数量）或 `best_of`（为参与选择而生成的 completions 数量）设置为 `> 1`，每个请求都会创建多个输出。此时，你可以将生成 tokens 数量视为 `[ max_tokens * max (n, best_of) ]`。

#### Streaming

在请求中设置 `stream: true` 会使模型在 tokens 可用后立即开始返回，而不是等待完整 token 序列生成完毕。它不会改变获得全部 tokens 的总时间，但会缩短应用的首个 token 时间，适用于希望展示部分进度或准备停止生成的场景。这可以带来更好的用户体验和 UX 改进，因此值得尝试 streaming。

#### Batching

取决于你的用例，batching <em>可能有帮助</em>。如果你向同一个端点发送多个请求，可以将 [prompts 批量合并](https://developers.openai.com/api/docs/guides/rate-limits#batching-requests)到同一个请求中发送。这会减少需要发出的请求数量。prompt 参数最多可容纳 20 个唯一 prompts。我们建议你测试这种方法，看看它是否有帮助。在某些情况下，你可能最终会增加生成 tokens 数量，从而放慢响应时间。

## 管理成本

若要监控成本，你可以在账户中设置[通知阈值](https://platform.openai.com/settings/organization/limits)，当用量超过某个阈值时收到电子邮件提醒。使用 [usage tracking dashboard](https://platform.openai.com/settings/organization/usage) 监控当前和过去 billing 周期内的 token 用量。

### 文本生成

将原型迁移到生产时，其中一个挑战是为运行应用相关成本做预算。OpenAI 提供[按量付费定价模型](https://openai.com/api/pricing/)，按每 1,000 tokens 计价（大约等于 750 个单词）。若要估算成本，你需要预测 token 使用量。请考虑流量水平、用户与你的应用交互的频率，以及你将处理的数据量等因素。

**一种有用的成本降低思考框架，是把成本视为 token 数量与每 token 成本的函数。** 使用这个框架有两条潜在的降本路径。首先，你可以通过在某些任务中切换到更小的模型来降低每 token 成本。或者，你可以尝试减少所需的 token 数量。实现方式有几种，例如使用更短的 prompts、[微调](https://developers.openai.com/api/docs/guides/model-optimization)模型，或缓存常见用户查询，避免重复处理。

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

使用我们的 API 创建应用时，请考虑我们的[安全最佳实践](https://developers.openai.com/api/docs/guides/safety-best-practices)，以确保应用安全且成功。这些建议强调了充分测试产品、主动处理潜在问题，以及限制误用机会的重要性。

## 业务考虑

当使用 AI 的项目从原型走向生产时，重要的是思考如何用 AI 构建优秀产品，以及这如何回到你的核心业务。我们当然没有所有答案，但一个很好的起点是我们的 Developer Day 演讲，在其中我们与一些客户深入探讨了这一主题：

<iframe
  width="100%"
  height="315"
  src="https://www.youtube-nocookie.com/embed/knHW-p31R0c?si=g0ddoMoUykjclH4k"
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowFullScreen
></iframe>
