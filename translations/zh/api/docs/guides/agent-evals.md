---
status: needs-review
sourceId: "8d9a49d30c4d"
sourceChecksum: "8d9a49d30c4d22a7356d4760b96a23d66a77f979c92410deabf51fc50509c989"
sourceUrl: "https://developers.openai.com/api/docs/guides/agent-evals"
translatedAt: "2026-06-27T17:29:03.6672446+08:00"
translator: codex-gpt-5.5-xhigh
---

# 评估 agent 工作流

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

1. 在 dashboard 中打开 **Logs** > **Traces**。
2. 检查一个有代表性的工作流 trace，它可以来自基于 SDK 的应用，也可以在过渡窗口期间来自现有的 Agent Builder 工作流。
3. 创建一个 grader，并针对所选 trace 运行它。
4. 使用结果来优化 prompt、工具界面、路由逻辑或 guardrails。

对于 code-first 的 SDK 工作流，请先从 [Integrations and observability](https://developers.openai.com/api/docs/guides/agents/integrations-observability#tracing) 入手，在正式定义 grader 之前获得高信号 trace。

## 需要可重复性时，转向 dataset 和 eval run

一旦你知道“好”的表现是什么样，就可以从单个 trace 转向可重复的 dataset 和 eval run。当你想对变更做基准测试、比较 prompt，或长期运行更大规模的评估时，这就是正确的下一步。

如果你需要针对 external model 的评估、evaluation APIs 或更大规模的 batch evaluation 等高级能力，请将 [Evals](https://developers.openai.com/api/docs/guides/evals) 与 dataset 搭配使用。

## 相关评估界面

<a
  href="/api/docs/guides/evaluation-getting-started"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    使用 evaluations 运行持续改进的 flywheel。


</a>

<a href="/api/docs/guides/evals" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    针对 external model 进行评估，通过 API 与 evals 交互，以及更多能力。


</a>

<a href="/api/docs/guides/prompt-optimizer" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    使用你的 dataset 自动改进 prompt。


</a>

<a
  href="https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    使用 evaluations 运行持续改进的 flywheel。


</a>
