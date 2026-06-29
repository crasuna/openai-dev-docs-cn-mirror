---
status: needs-review
sourceId: "8db6c46df7dd"
sourceChecksum: "8db6c46df7dd476c3575e57e5972b168bae4e16730f8c20145e2de942e6e24f5"
sourceUrl: "https://developers.openai.com/codex/concepts/subagents"
translatedAt: "2026-06-27T11:05:32.948Z"
translator: codex-gpt-5.5-xhigh
---

# Subagents 子代理

Codex 可以通过并行启动专门的 agents 来运行 subagent workflows，让它们并发探索、处理或分析工作。

本页解释核心概念和权衡。有关 setup、agent 配置和示例，请参见 [Subagents](https://developers.openai.com/codex/subagents)。

## 为什么 subagent workflows 有帮助

即使有大型 context windows，模型也有局限。如果你把充满噪声的中间输出（例如探索笔记、测试日志、堆栈跟踪和命令输出）大量塞进主对话（你定义需求、约束和决策的地方），session 可能会随着时间推移变得不那么可靠。

这通常被描述为：

- **Context pollution**：有用信息被嘈杂的中间输出掩埋。
- **Context rot**：随着对话填满相关性较低的细节，性能下降。

背景信息请参见 Chroma 关于 [context rot](https://research.trychroma.com/context-rot) 的文章。

Subagent workflows 通过把嘈杂工作移出主线程来提供帮助：

- 让 **main agent** 专注于需求、决策和最终输出。
- 并行运行专门的 **subagents**，用于探索、测试或日志分析。
- 从 subagents 返回 **summaries**，而不是原始中间输出。

当工作可以独立并行运行时，它们也能节省时间；通过把问题拆成有边界的小块，它们让更大形态的 tasks 更容易处理。例如，Codex 可以把一个包含数百万 tokens 的文档分析拆成更小的问题，并向主线程返回提炼后的结论。

作为起点，请把 parallel agents 用于读取较多的 tasks，例如探索、测试、triage 和摘要。对并行写入较多的 workflows 要更谨慎，因为多个 agents 同时编辑代码可能产生冲突并增加协调开销。

## 核心术语

Codex 在 subagent workflows 中使用几个相关术语：

- **Subagent workflow**：Codex 运行 parallel agents 并合并其结果的 workflow。
- **Subagent**：Codex 启动来处理特定 task 的委派 agent。
- **Agent thread**：agent 的 CLI thread，你可以用 `/agent` 查看并切换。

## 触发 subagent workflows

Codex 不会自动启动 subagents，并且只有在你明确要求 subagents 或 parallel agent work 时才应使用 subagents。

在实践中，手动触发意味着使用直接指令，例如 “spawn two agents”、“delegate this work in parallel” 或 “use one agent per point”。与类似的单 agent 运行相比，subagent workflows 会消耗更多 tokens，因为每个 subagent 都会执行自己的模型和工具工作。

一个好的 subagent prompt 应说明如何拆分工作、Codex 是否应等所有 agents 完成后再继续，以及需要返回什么 summary 或输出。

```text
Review this branch with parallel subagents. Spawn one subagent for security risks, one for test gaps, and one for maintainability. Wait for all three, then summarize the findings by category with file references.
```

## 选择模型和 reasoning

不同 agents 需要不同的模型和 reasoning 设置。

如果你没有固定模型或 `model_reasoning_effort`，Codex 可以为 task 选择一个在智能、速度和价格之间平衡的设置。它可能会偏向 `gpt-5.4-mini` 来做快速扫描，或为更需要推理的工作选择更高 effort 的 `gpt-5.5` 配置。当你需要更细粒度控制时，可以在 prompt 中引导该选择，或直接在 agent 文件中设置 `model` 和 `model_reasoning_effort`。

对于 Codex 中的大多数 tasks，从
  `gpt-5.5` 开始。需要更快、更低成本的轻量 subagent work 时，使用
  `gpt-5.4-mini`。如果你有 ChatGPT Pro，并且希望近乎即时地进行纯文本迭代，`gpt-5.3-codex-spark` 仍以 research preview 形式可用。

### 模型选择

- **`gpt-5.5`**：对要求较高的 agents，从这里开始。它最适合需要规划、工具使用、验证，并在较大 context 中持续推进的模糊多步骤工作。
- **`gpt-5.4`**：当 workflow 固定到 GPT-5.4 时使用。它结合了强大的编码、推理、工具使用和更广泛的 workflows 能力。
- **`gpt-5.4-mini`**：用于更看重速度和效率而非深度的 agents，例如探索、读密集型扫描、大文件 review 或处理支撑文档。它很适合返回提炼结果给 main agent 的 parallel workers。
- **`gpt-5.3-codex-spark`**：如果你有 ChatGPT Pro，在延迟比更广能力更重要时，可以使用这个 research preview model 进行近乎即时的纯文本迭代。

### Reasoning effort (`model_reasoning_effort`)

- **`high`**：当 agent 需要追踪复杂逻辑、检查假设或处理边界情况时使用（例如 reviewer 或偏安全的 agents）。
- **`medium`**：适合大多数 agents 的均衡默认值。
- **`low`**：当 task 很直接且速度最重要时使用。

更高的 reasoning effort 会增加响应时间和 token 用量，但可以提升复杂工作的质量。详情请参见 [Models](https://developers.openai.com/codex/models)、[Config basics](https://developers.openai.com/codex/config-basic) 和 [Configuration Reference](https://developers.openai.com/codex/config-reference)。
