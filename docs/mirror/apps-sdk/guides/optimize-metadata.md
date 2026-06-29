---
title: "优化元数据"
description: "Improve discovery and behavior with rich metadata."
outline: deep
---

# 优化元数据

**文档集**：Apps SDK  
**分组**：Apps SDK — Guides  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/guides/optimize-metadata](https://developers.openai.com/apps-sdk/guides/optimize-metadata)
- Markdown 来源：[https://developers.openai.com/apps-sdk/guides/optimize-metadata.md](https://developers.openai.com/apps-sdk/guides/optimize-metadata.md)
- 抓取时间：2026-06-27T05:54:47.984Z
- Checksum：`1832877ab44e6dd43b01fe5aea0f61c77ee54a36249db6d996732653e1748776`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 为什么元数据很重要

ChatGPT 会根据你提供的元数据决定何时调用你的 connector。精心编写的名称、描述和参数文档可以提高相关提示的召回率，并减少意外触发。请像对待产品文案一样对待元数据，它需要迭代、测试和分析。

## 收集黄金提示集

在调整元数据之前，请先整理一个带标签的数据集：

- **直接提示** - 用户明确提到你的产品或数据源。
- **间接提示** - 用户描述想要的结果，但没有点名你的工具。
- **负向提示** - 应该由内置工具或其他 connector 处理请求的情况。

为每个提示记录预期行为（调用你的工具、什么都不做，或使用替代方案）。你会在回归测试中复用这组数据。

## 编写能引导模型的元数据

对每个工具：

- **名称** - 将领域与动作配对（`calendar.create_event`）。
- **描述** - 以“Use this when...”开头，并指出不应使用的场景（"Do not use for reminders"）。
- **参数文档** - 描述每个参数，包含示例，并对受限取值使用枚举。
- **只读提示** - 对只检索或计算信息、绝不会在 ChatGPT 外创建、更新、删除或发送数据的工具标注 `readOnlyHint: true`。
- 对于非 read-only 的工具：
  - **破坏性提示** - 对不会删除或覆盖用户数据的工具标注 `destructiveHint: false`。
  - **开放世界提示** - 对不会发布内容、也不会触达用户账户之外范围的工具标注 `openWorldHint: false`。

## 在 developer mode 中评估

1. 在 ChatGPT developer mode 中链接你的 connector。
2. 逐条运行黄金提示集并记录结果：选中了哪个工具、传入了哪些参数，以及组件是否渲染。
3. 对每个提示跟踪精确率（是否运行了正确工具？）和召回率（该运行工具时是否运行了？）。

如果模型选择了错误的工具，请修改描述，强调预期场景或缩小工具范围。

## 有条理地迭代

- 每次只改一个元数据字段，这样你才能归因改进效果。
- 保留带时间戳和测试结果的修订日志。
- 与 reviewers 共享 diffs，以便在部署前发现含糊文案。

每次修订后都重复评估。在追求边际召回提升之前，先确保负向提示上有较高精确率。

## 生产监控

connector 上线后：

- 每周查看工具调用分析数据。“wrong tool”确认数量激增通常表示元数据漂移。
- 收集用户反馈，并更新描述以覆盖常见误解。
- 定期安排提示重放，尤其是在添加新工具或更改结构化字段之后。

将元数据视为持续演进的资产。你在措辞和评估上越有意识，发现和调用就越容易。

:::

## English source

::: details 展开英文原文
::: v-pre
## Why metadata matters

ChatGPT decides when to call your connector based on the metadata you provide. Well-crafted names, descriptions, and parameter docs increase recall on relevant prompts and reduce accidental activations. Treat metadata like product copy—it needs iteration, testing, and analytics.

## Gather a golden prompt set

Before you tune metadata, assemble a labelled dataset:

- **Direct prompts** – users explicitly name your product or data source.
- **Indirect prompts** – users describe the outcome they want without naming your tool.
- **Negative prompts** – cases where built-in tools or other connectors should handle the request.

Document the expected behaviour for each prompt (call your tool, do nothing, or use an alternative). You will reuse this set during regression testing.

## Draft metadata that guides the model

For each tool:

- **Name** – pair the domain with the action (`calendar.create_event`).
- **Description** – start with “Use this when…” and call out disallowed cases ("Do not use for reminders").
- **Parameter docs** – describe each argument, include examples, and use enums for constrained values.
- **Read-only hint** – annotate `readOnlyHint: true` on tools that only retrieve or compute information and never create, update, delete, or send data outside of ChatGPT.
- For tools that are not read-only:
  - **Destructive hint** - annotate `destructiveHint: false` on tools that do not delete or overwrite user data.
  - **Open-world hint** - annotate `openWorldHint: false` on tools that do not publish content or reach outside the user's account.

## Evaluate in developer mode

1. Link your connector in ChatGPT developer mode.
2. Run through the golden prompt set and record the outcome: which tool was selected, what arguments were passed, and whether the component rendered.
3. For each prompt, track precision (did the right tool run?) and recall (did the tool run when it should?).

If the model picks the wrong tool, revise the descriptions to emphasise the intended scenario or narrow the tool’s scope.

## Iterate methodically

- Change one metadata field at a time so you can attribute improvements.
- Keep a log of revisions with timestamps and test results.
- Share diffs with reviewers to catch ambiguous copy before you deploy it.

After each revision, repeat the evaluation. Aim for high precision on negative prompts before chasing marginal recall improvements.

## Production monitoring

Once your connector is live:

- Review tool-call analytics weekly. Spikes in “wrong tool” confirmations usually indicate metadata drift.
- Capture user feedback and update descriptions to cover common misconceptions.
- Schedule periodic prompt replays, especially after adding new tools or changing structured fields.

Treat metadata as a living asset. The more intentional you are with wording and evaluation, the easier discovery and invocation become.

:::
:::

