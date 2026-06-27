---
title: "Trace grading"
description: "Use trace grading to create datasets, configure graders, and track evaluation runs for your models."
outline: deep
---

# Trace grading

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/trace-grading](https://developers.openai.com/api/docs/guides/trace-grading)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/trace-grading.md](https://developers.openai.com/api/docs/guides/trace-grading.md)
- 抓取时间：2026-06-27T05:54:10.969Z
- Checksum：`b88e361944bc861c17cdd9211aed3bfc1bad6a754f2caf4b2ddff5ee567ff53d`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Trace grading 是为 agent 的 trace（也就是决策、工具调用和推理步骤的端到端日志）分配结构化分数或标签的过程，用于评估正确性、质量或是否符合预期。这些标注有助于识别 agent 哪里做得好、哪里出错，从而有针对性地改进编排或行为。

Trace evals 使用这些已评分的 trace，在大量示例上系统性评估 agent 性能，帮助你对变更进行基准测试、识别回归，或验证改进。不同于黑盒评估，trace evals 提供更多数据，帮助你更好地理解 agent 为什么成功或失败。

同时使用这两项功能来跟踪、分析并优化多组 agent 的性能。

## 开始使用 traces

1. 在 dashboard 中，前往 Logs &gt; [Traces](https://platform.openai.com/logs?api=traces)。
1. 选择一个 workflow。你会看到来自基于 SDK 的应用的 traces，以及在过渡窗口期内来自现有 [Agent Builder](/mirror/api/docs/guides/agent-builder) workflows 的 traces。
1. 选择一个 trace 来检查你的 workflow。
1. 创建一个 grader，并运行它以根据 grader 标准评估你的 agents 的性能。

Trace grading 是大规模识别错误的宝贵工具，而这对于在 AI 应用中构建韧性至关重要。请在我们的 [cookbook](https://developers.openai.com/cookbook/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel) 中了解我们推荐的流程。

## 使用 runs 评估 traces

1. 选择 **Grade all**。这会带你进入 evaluation dashboard。
1. 在 evaluation dashboard 中，添加并编辑测试标准。
1. 添加一个 run 来评估输出。你可以配置 run 选项，例如模型、日期范围和工具调用，以便在 eval 中获得更具体的结果。

在[这里](/mirror/api/docs/guides/evals)了解更多关于如何使用 evals 的信息。

:::

## English source

::: details 展开英文原文
::: v-pre
Trace grading is the process of assigning structured scores or labels to an agent's trace—the end-to-end log of decisions, tool calls, and reasoning steps—to assess correctness, quality, or adherence to expectations. These annotations help identify where the agent did well or made mistakes, enabling targeted improvements in orchestration or behavior.

Trace evals use those graded traces to systematically evaluate agent performance across many examples, helping to benchmark changes, identify regressions, or validate improvements. Unlike black-box evaluations, trace evals provide more data to better understand why an agent succeeds or fails.

Use both features to track, analyze, and optimize the performance of groups of agents.

## Get started with traces

1. In the dashboard, navigate to Logs &gt; [Traces](https://platform.openai.com/logs?api=traces).
1. Select a workflow. You'll see traces from SDK-based apps, and from existing [Agent Builder](/mirror/api/docs/guides/agent-builder) workflows during the transition window.
1. Select a trace to inspect your workflow.
1. Create a grader, and run it to grade your agents' performance against grader criteria.

Trace grading is a valuable tool for error identification at scale, which is critical for building resilience into your AI applications. Learn more about our recommended process in our [cookbook](https://developers.openai.com/cookbook/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel).

## Evaluate traces with runs

1. Select **Grade all**. This takes you to the evaluation dashboard.
1. In the evaluation dashboard, add and edit test criteria.
1. Add a run to evaluate outputs. You can configure run options like model, date range, and tool calls to get more specificity in your eval.

Learn more about how you can use evals [here](/mirror/api/docs/guides/evals).

:::
:::

