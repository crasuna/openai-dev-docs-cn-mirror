---
title: "Research use cases"
description: "Identify and prioritize Apps SDK use cases."
outline: deep
---

# Research use cases

**文档集**：Apps SDK  
**分组**：Apps SDK — Plan  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/plan/use-case](https://developers.openai.com/apps-sdk/plan/use-case)
- Markdown 来源：[https://developers.openai.com/apps-sdk/plan/use-case.md](https://developers.openai.com/apps-sdk/plan/use-case.md)
- 抓取时间：2026-06-27T05:54:48.993Z
- Checksum：`2dcd4eb138d0d20cdebdda0c403026a130edd6484b8d4224934b4114866e0210`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 为什么从 use cases 开始

每个成功的 Apps SDK app 都始于对用户想完成什么的清晰理解。ChatGPT 中的 discovery 由模型驱动：当你的 tool metadata、descriptions 和过往使用与用户的 prompt 和 memories 对齐时，assistant 会选择你的 app。只有当你已经映射出模型应识别的任务以及你能交付的结果时，这才有效。

使用本页捕获你的假设，用 prompts 对其进行压力测试，并在定义 tools 或构建 components 之前让团队对范围达成一致。

## Gather inputs

从定性和定量研究开始：

- **User interviews and support requests** - 捕获用户当下依赖的 jobs-to-be-done、terminology 和 data sources。
- **Prompt sampling** - 列出应该路由到你的 app 的 direct asks（例如 “show my Jira board”）和 indirect intents（“what am I blocked on for the launch?”）。
- **System constraints** - 记录任何会影响后续 tool design 的 compliance requirements、offline data 或 rate limits。

为每个场景记录 user persona、他们在什么 context 下转向 ChatGPT，以及用一句话描述的成功标准。

## Define evaluation prompts

有一组 golden set 可迭代时，decision boundary tuning 会更容易。对每个 use case：

1. **编写至少五个 direct prompts**，明确引用你的数据、产品名，或你预期用户会说的动词。
2. **起草五个 indirect prompts**，其中用户陈述目标但不点名工具（“I need to keep our launch tasks organized”）。
3. **添加 negative prompts**，这些 prompt 不应触发你的 app，以便衡量 precision。

稍后在 [Optimize metadata](/mirror/apps-sdk/guides/optimize-metadata) 中使用这些 prompts，对 recall 和 precision 做 hill-climb，而不会过拟合到单个请求。

## Scope the minimum lovable feature

对每个 use case，决定：

- **哪些信息必须内联可见**，才能回答问题或让用户采取行动。
- **哪些 actions 需要 write access**，以及它们是否应在 developer mode 中通过 confirmation 保护。
- **哪些 state 需要在 turns 之间持久化**，例如 filters、selected rows 或 draft content。

根据 user impact 和 implementation effort 对 use cases 排序。常见模式是先发布一个带高可信 component 的 P0 场景，然后在 discovery data 确认 engagement 后扩展到 P1 场景。

## Translate use cases into tooling

一旦某个场景进入范围，请起草 tool contract：

- Inputs：模型可以安全提供的 parameters。保持明确，在取值受限时使用 enums，并记录 defaults。
- Outputs：你将返回的 structured content。除了 UI 渲染内容之外，还要添加模型可推理的 fields（IDs、timestamps、status）。
- Component intent：你是否需要 read-only viewer、editor，或 multiturn workspace。这会影响后续的 [component planning](/mirror/apps-sdk/plan/components) 和 storage model。

在投入实现前，请与 stakeholders 审查这些草案，尤其是 legal 或 compliance teams。许多集成在投入生产前需要 PII reviews 或 data processing agreements。

## Prepare for iteration

即使规划扎实，也要预期在第一次 dogfood 后修订 prompts 和 metadata。在排期中留出时间：

- 每周轮流运行 golden prompt set，并记录 tool selection accuracy。
- 在 ChatGPT developer mode 中收集 early testers 的定性反馈。
- 捕获 analytics（tool calls、component interactions），以便衡量 adoption。

app 上线后，这些 research artifacts 会成为 roadmap、changelog 和 success metrics 的骨架。

:::

## English source

::: details 展开英文原文
::: v-pre
## Why start with use cases

Every successful Apps SDK app starts with a crisp understanding of what the user is trying to accomplish. Discovery in ChatGPT is model-driven: the assistant chooses your app when your tool metadata, descriptions, and past usage align with the user’s prompt and memories. That only works if you have already mapped the tasks the model should recognize and the outcomes you can deliver.

Use this page to capture your hypotheses, pressure-test them with prompts, and align your team on scope before you define tools or build components.

## Gather inputs

Begin with qualitative and quantitative research:

- **User interviews and support requests** – capture the jobs-to-be-done, terminology, and data sources users rely on today.
- **Prompt sampling** – list direct asks (e.g., “show my Jira board”) and indirect intents (“what am I blocked on for the launch?”) that should route to your app.
- **System constraints** – note any compliance requirements, offline data, or rate limits that will influence tool design later.

Document the user persona, the context they are in when they reach for ChatGPT, and what success looks like in a single sentence for each scenario.

## Define evaluation prompts

Decision boundary tuning is easier when you have a golden set to iterate against. For each use case:

1. **Author at least five direct prompts** that explicitly reference your data, product name, or verbs you expect the user to say.
2. **Draft five indirect prompts** where the user states a goal but not the tool (“I need to keep our launch tasks organized”).
3. **Add negative prompts** that should _not_ trigger your app so you can measure precision.

Use these prompts later in [Optimize metadata](/mirror/apps-sdk/guides/optimize-metadata) to hill-climb on recall and precision without overfitting to a single request.

## Scope the minimum lovable feature

For each use case decide:

- **What information must be visible inline** to answer the question or let the user act.
- **Which actions require write access** and whether they should be gated behind confirmation in developer mode.
- **What state needs to persist** between turns—for example, filters, selected rows, or draft content.

Rank the use cases based on user impact and implementation effort. A common pattern is to ship one P0 scenario with a high-confidence component, then expand to P1 scenarios once discovery data confirms engagement.

## Translate use cases into tooling

Once a scenario is in scope, draft the tool contract:

- Inputs: the parameters the model can safely provide. Keep them explicit, use enums when the set is constrained, and document defaults.
- Outputs: the structured content you will return. Add fields the model can reason about (IDs, timestamps, status) in addition to what your UI renders.
- Component intent: whether you need a read-only viewer, an editor, or a multiturn workspace. This influences the [component planning](/mirror/apps-sdk/plan/components) and storage model later.

Review these drafts with stakeholders—especially legal or compliance teams—before you invest in implementation. Many integrations require PII reviews or data processing agreements before they can ship to production.

## Prepare for iteration

Even with solid planning, expect to revise prompts and metadata after your first dogfood. Build time into your schedule for:

- Rotating through the golden prompt set weekly and logging tool selection accuracy.
- Collecting qualitative feedback from early testers in ChatGPT developer mode.
- Capturing analytics (tool calls, component interactions) so you can measure adoption.

These research artifacts become the backbone for your roadmap, changelog, and success metrics once the app is live.

:::
:::

