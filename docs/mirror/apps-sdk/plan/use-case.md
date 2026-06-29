---
title: "研究使用场景"
description: "Identify and prioritize Apps SDK use cases."
outline: deep
---

# 研究使用场景

**文档集**：Apps SDK\
**分组**：规划\
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
## 为什么从使用场景开始

每个成功的 Apps SDK 应用都始于对用户想完成什么的清晰理解。ChatGPT 中的发现由模型驱动：当你的工具元数据、描述和过往使用与用户的提示和记忆对齐时，assistant 会选择你的应用。只有当你已经映射出模型应识别的任务以及你能交付的结果时，这才有效。

使用本页捕获你的假设，用提示对其进行压力测试，并在定义工具或构建组件之前让团队对范围达成一致。

## 收集输入

从定性和定量研究开始：

- **用户访谈和支持请求** - 捕获用户当下依赖的待办任务、术语和数据源。
- **提示抽样** - 列出应该路由到你的应用的直接请求（例如 “show my Jira board”）和间接意图（“what am I blocked on for the launch?”）。
- **系统约束** - 记录任何会影响后续工具设计的合规要求、离线数据或速率限制。

为每个场景记录用户画像、他们在什么上下文下转向 ChatGPT，以及用一句话描述的成功标准。

## 定义评估提示

有一组可迭代的黄金集时，决策边界调优会更容易。对每个使用场景：

1. **编写至少五个直接提示**，明确引用你的数据、产品名，或你预期用户会说的动词。
2. **起草五个间接提示**，其中用户陈述目标但不点名工具（“I need to keep our launch tasks organized”）。
3. **添加负向提示**，这些提示不应触发你的应用，以便衡量精确率。

稍后在 [优化元数据](/mirror/apps-sdk/guides/optimize-metadata) 中使用这些提示，对召回率和精确率做爬坡优化，而不会过拟合到单个请求。

## 确定最小可喜功能范围

对每个使用场景，决定：

- **哪些信息必须内联可见**，才能回答问题或让用户采取行动。
- **哪些动作需要写入权限**，以及它们是否应在 developer mode 中通过确认保护。
- **哪些状态需要在轮次之间持久化**，例如筛选条件、选中行或草稿内容。

根据用户影响和实现成本对使用场景排序。常见模式是先发布一个带高可信组件的 P0 场景，然后在发现数据确认参与度后扩展到 P1 场景。

## 将使用场景转化为工具设计

一旦某个场景进入范围，请起草工具契约：

- Inputs：模型可以安全提供的参数。保持明确，在取值受限时使用枚举，并记录默认值。
- Outputs：你将返回的结构化内容。除了 UI 渲染内容之外，还要添加模型可推理的字段（IDs、timestamps、status）。
- Component intent：你是否需要只读查看器、编辑器，或多轮工作区。这会影响后续的 [组件规划](/mirror/apps-sdk/plan/components) 和存储模型。

在投入实现前，请与利益相关方审查这些草案，尤其是法务或合规团队。许多集成在投入生产前需要 PII 审查或数据处理协议。

## 为迭代做准备

即使规划扎实，也要预期在第一次内部试用后修订提示和元数据。在排期中留出时间：

- 每周轮流运行黄金提示集，并记录工具选择准确率。
- 在 ChatGPT developer mode 中收集早期测试者的定性反馈。
- 捕获分析数据（工具调用、组件交互），以便衡量采用情况。

应用上线后，这些研究产物会成为路线图、变更日志和成功指标的骨架。

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

