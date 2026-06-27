---
status: needs-review
sourceId: "1832877ab44e"
sourceChecksum: "1832877ab44e6dd43b01fe5aea0f61c77ee54a36249db6d996732653e1748776"
sourceUrl: "https://developers.openai.com/apps-sdk/guides/optimize-metadata"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# 优化 Metadata

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
