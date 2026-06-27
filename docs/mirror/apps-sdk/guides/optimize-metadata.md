---
title: "Optimize Metadata"
description: "Improve discovery and behavior with rich metadata."
outline: deep
---

# Optimize Metadata

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
## 为什么 metadata 很重要

ChatGPT 会根据你提供的 metadata 决定何时调用你的 connector。精心编写的 names、descriptions 和 parameter docs 可以提高相关 prompt 的召回率，并减少意外触发。请像对待产品文案一样对待 metadata，它需要迭代、测试和分析。

## 收集 golden prompt set

在调整 metadata 之前，请先整理一个带标签的数据集：

- **Direct prompts** - 用户明确提到你的产品或数据源。
- **Indirect prompts** - 用户描述想要的结果，但没有点名你的工具。
- **Negative prompts** - 应该由内置工具或其他 connectors 处理请求的情况。

为每个 prompt 记录预期行为（调用你的工具、什么都不做，或使用替代方案）。你会在回归测试中复用这组数据。

## 编写能引导模型的 metadata

对每个工具：

- **Name** - 将领域与动作配对（`calendar.create_event`）。
- **Description** - 以“Use this when...”开头，并指出不应使用的场景（"Do not use for reminders"）。
- **Parameter docs** - 描述每个参数，包含示例，并对受限取值使用 enums。
- **Read-only hint** - 对只检索或计算信息、绝不会在 ChatGPT 外创建、更新、删除或发送数据的工具标注 `readOnlyHint: true`。
- 对于非 read-only 的工具：
  - **Destructive hint** - 对不会删除或覆盖用户数据的工具标注 `destructiveHint: false`。
  - **Open-world hint** - 对不会发布内容、也不会触达用户账户之外范围的工具标注 `openWorldHint: false`。

## 在 developer mode 中评估

1. 在 ChatGPT developer mode 中链接你的 connector。
2. 逐条运行 golden prompt set 并记录结果：选中了哪个工具、传入了哪些 arguments，以及组件是否渲染。
3. 对每个 prompt 跟踪 precision（是否运行了正确工具？）和 recall（该运行工具时是否运行了？）。

如果模型选择了错误的工具，请修改 descriptions，强调预期场景或缩小工具范围。

## 有条理地迭代

- 每次只改一个 metadata field，这样你才能归因改进效果。
- 保留带 timestamp 和测试结果的 revision 日志。
- 与 reviewers 共享 diffs，以便在部署前发现含糊文案。

每次修订后都重复评估。在追求边际召回提升之前，先确保 negative prompts 上有较高 precision。

## Production monitoring

connector 上线后：

- 每周查看 tool-call analytics。“wrong tool”确认数量激增通常表示 metadata drift。
- 收集用户反馈，并更新 descriptions 以覆盖常见误解。
- 定期安排 prompt replays，尤其是在添加新工具或更改 structured fields 之后。

将 metadata 视为持续演进的资产。你在措辞和评估上越有意识，discovery 和 invocation 就越容易。

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

