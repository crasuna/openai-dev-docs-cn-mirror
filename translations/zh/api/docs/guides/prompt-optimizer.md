---
status: needs-review
sourceId: "dbf26b432a9c"
sourceChecksum: "dbf26b432a9c07ac88a5452ae693cd3c0caf6ae2e6d8ecc126af376b9d7b2c0b"
sourceUrl: "https://developers.openai.com/api/docs/guides/prompt-optimizer"
translatedAt: "2026-06-27T18:23:34.8670908+08:00"
translator: codex-gpt-5.5-xhigh
---

# 提示词优化器

[prompt optimizer](https://platform.openai.com/chat/edit?optimize=true) 是 dashboard 中的一个聊天界面，你输入提示词后，我们会根据当前最佳实践对其进行优化，然后返回给你。将 prompt optimizer 与 [datasets](https://developers.openai.com/api/docs/guides/evaluation-getting-started) 配合使用，是自动改进提示词的一种强大方式。

OpenAI 正在弃用作为 Evals
  平台一部分、由 dataset 支持的 prompt optimizer。对于现有用户，Evals 将于 2026 年 10 月 31 日变为只读，
  并计划于 2026 年 11 月 30 日关闭该平台。请查看
  [弃用页面](https://developers.openai.com/api/docs/deprecations#2026-06-03-evals-platform)了解
  当前时间线。

## 准备数据

1. 设置一个包含你想优化的提示词和评估数据集的 [dataset](https://developers.openai.com/api/docs/guides/evaluation-getting-started)。
1. 在你的 dataset 中创建至少三行带有响应的数据。
1. 对于每一行，创建至少一个 grader result 或人工 annotation。

prompt optimizer 可以使用 dataset 中的以下内容来改进你的提示词：

- Annotations（Good/Bad 以及你添加的其他自定义 annotation 列）
- 写在 **output_feedback** 中的文字 critique
- graders 的结果

为了获得有效结果，请添加包含 Good/Bad 评级_以及_详细、具体 critique 的 annotation。创建能够精确捕捉你期望提示词具备的属性的 [graders](https://developers.openai.com/api/docs/guides/evaluation-getting-started#adding-graders)。

## 优化你的提示词

准备好 dataset 后，创建一次优化。

1. 在提示词面板底部，点击 **Optimize**。这会为优化结果创建一个新标签页，并启动一个在后台运行的优化流程。
1. 优化后的提示词准备好后，查看并测试新提示词。
1. 重复。虽然单次优化运行可能达到你想要的结果，但你也可以尝试在新提示词上重复优化流程：生成输出、标注输出、运行 graders，然后优化。

提示词优化的效果取决于你的
  graders 质量。我们建议为每个
  期望输出属性构建定义范围较窄的 graders，尤其是那些你看到提示词失败的属性。

在生产中使用优化后的提示词前，始终进行评估和人工审阅。虽然 prompt optimizer 通常会严格提升提示词的有效性，但优化后的提示词也可能在特定输入上表现得比原始提示词更差。

## 后续步骤

如需更多灵感，请访问包含示例代码和第三方资源链接的 [OpenAI Cookbook](https://developers.openai.com/cookbook)，或进一步了解我们的 evals 工具：

<a
  href="https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    使用 evaluations 运转持续改进的飞轮。


</a>

<a href="/api/docs/guides/evals" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    与外部模型对比评估、通过 API 与 evals 交互，以及更多功能。


</a>

[

<span slot="icon">
      </span>
    构建复杂的 graders，以提升 evals 的有效性。

](https://developers.openai.com/api/docs/guides/graders)

[

<span slot="icon">
      </span>
    提升模型生成贴合你用例的响应的能力。

](https://developers.openai.com/api/docs/guides/fine-tuning)

