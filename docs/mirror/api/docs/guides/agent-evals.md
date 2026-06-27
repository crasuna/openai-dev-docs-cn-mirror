---
title: "Evaluate agent workflows"
description: "Learn how to evaluate agent workflows with traces, graders, datasets, and evaluation runs on the OpenAI platform."
outline: deep
---

# Evaluate agent workflows

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agent-evals](https://developers.openai.com/api/docs/guides/agent-evals)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agent-evals.md](https://developers.openai.com/api/docs/guides/agent-evals.md)
- 抓取时间：2026-06-27T05:53:57.993Z
- Checksum：`8d9a49d30c4d22a7356d4760b96a23d66a77f979c92410deabf51fc50509c989`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
OpenAI Platform 提供了一套评估工具，帮助你确保 agent 的表现一致且准确。

请将本页作为决策入口，用来选择对 agent 工作流最重要的评估界面。

## 仍在调试行为时，从 trace 开始

Trace grading 是识别工作流级问题最快的方式。一个 trace 会捕获单次运行的端到端记录，包括模型调用、工具调用、guardrails 和 handoff。grader 允许你用结构化标准为这些 trace 打分，从而大规模发现回归和失败模式。

当你想回答以下问题时，请使用 trace grading：

- agent 是否选择了正确的工具？
- handoff 是否在应该发生的时候发生了？
- 工作流是否违反了指令或安全策略？
- prompt 或路由变更是否改善了端到端行为？

### Trace-grading 工作流

1. 在 dashboard 中打开 **Logs** &gt; **Traces**。
2. 检查一个有代表性的工作流 trace，它可以来自基于 SDK 的应用，也可以在过渡窗口期间来自现有的 Agent Builder 工作流。
3. 创建一个 grader，并针对所选 trace 运行它。
4. 使用结果来优化 prompt、工具界面、路由逻辑或 guardrails。

对于 code-first 的 SDK 工作流，请先从 [Integrations and observability](/mirror/api/docs/guides/agents/integrations-observability#tracing) 入手，在正式定义 grader 之前获得高信号 trace。

## 需要可重复性时，转向 dataset 和 eval run

一旦你知道“好”的表现是什么样，就可以从单个 trace 转向可重复的 dataset 和 eval run。当你想对变更做基准测试、比较 prompt，或长期运行更大规模的评估时，这就是正确的下一步。

如果你需要针对 external model 的评估、evaluation APIs 或更大规模的 batch evaluation 等高级能力，请将 [Evals](/mirror/api/docs/guides/evals) 与 dataset 搭配使用。

## 相关评估界面

&lt;a
  href="/api/docs/guides/evaluation-getting-started"
  target="_blank"
  rel="noreferrer"
&gt;
  



    使用 evaluations 运行持续改进的 flywheel。





  



    针对 external model 进行评估，通过 API 与 evals 交互，以及更多能力。





  



    使用你的 dataset 自动改进 prompt。




&lt;a
  href="https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel"
  target="_blank"
  rel="noreferrer"
&gt;
  



    使用 evaluations 运行持续改进的 flywheel。




:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
The OpenAI Platform offers a suite of evaluation tools to help you ensure your agents perform consistently and accurately.

Use this page as the decision point for the evaluation surfaces that matter most for agent workflows.

## Start with traces when you are still debugging behavior

Trace grading is the fastest way to identify workflow-level issues. A trace captures the end-to-end record of model calls, tool calls, guardrails, and handoffs for one run. Graders let you score those traces with structured criteria so you can find regressions and failure modes at scale.

Use trace grading when you want to answer questions like:

- Did the agent pick the right tool?
- Did a handoff happen when it should have?
- Did the workflow violate an instruction or safety policy?
- Did a prompt or routing change improve the end-to-end behavior?

### Trace-grading workflow

1. Open **Logs** > **Traces** in the dashboard.
2. Inspect a representative workflow trace from an SDK-based app, or from an existing Agent Builder workflow during the transition window.
3. Create a grader and run it against the selected traces.
4. Use the results to refine prompts, tool surfaces, routing logic, or guardrails.

For code-first SDK workflows, start with [Integrations and observability](https://developers.openai.com/api/docs/guides/agents/integrations-observability#tracing) to get high-signal traces before you formalize graders.

## Move to datasets and eval runs when you need repeatability

Once you know what “good” looks like, move from individual traces to repeatable datasets and eval runs. This is the right step when you want to benchmark changes, compare prompts, or run larger-scale evaluations over time.

If you need advanced features such as evaluation against external models, evaluation APIs, or larger-scale batch evaluation, use [Evals](https://developers.openai.com/api/docs/guides/evals) alongside datasets.

## Related evaluation surfaces

<a
  href="/api/docs/guides/evaluation-getting-started"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Operate a flywheel of continuous improvement using evaluations.


</a>

<a href="/api/docs/guides/evals" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    Evaluate against external models, interact with evals via API, and more.


</a>

<a href="/api/docs/guides/prompt-optimizer" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    Use your dataset to automatically improve your prompts.


</a>

<a
  href="https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Operate a flywheel of continuous improvement using evaluations.


</a>
``````
:::
:::

