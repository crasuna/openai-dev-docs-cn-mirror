---
status: needs-review
sourceId: "9ac42ae86875"
sourceChecksum: "9ac42ae86875629d372dee1f42d5045e8892ca1f02e6b09b29eb5760bd3d47e5"
sourceUrl: "https://developers.openai.com/api/docs/guides/model-selection"
translatedAt: "2026-06-27T18:00:55+08:00"
translator: codex-gpt-5.5-xhigh
---

# 模型选择

选择合适的模型，无论是 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5)，还是像 [`gpt-5.4-mini`](https://developers.openai.com/api/docs/models/gpt-5.4-mini) 这样的较小选项，都需要平衡**准确性**、**延迟**和**成本**。本指南解释一些关键原则，帮助你做出明智决策，并提供一个实用示例。

## 核心原则

模型选择的原则很简单：

- **首先优化准确性：** 持续优化准确性，直到达到你的准确性目标。
- **其次优化成本和延迟：** 然后努力用尽可能便宜、最快的模型维持准确性。

### 1. 首先关注准确性

首先为你的用例设定清晰的准确性目标，明确这个用例进入生产环境所需的“足够好”的准确性。你可以通过以下方式做到：

- **设定清晰的准确性目标：** 确定你的目标准确性统计指标。
  - 例如，90% 的客服来电需要在第一次交互时被正确分诊。
- **开发评估数据集：** 创建一个数据集，用于根据这些目标衡量模型性能。
  - 延续上面的示例，收集 100 个交互示例，其中包含用户提出的请求、LLM 将其分诊到的类别、正确分诊应是什么，以及该分诊是否正确。
- **使用最强大的模型进行优化：** 从可用的最强模型开始，以达成你的准确性目标。记录所有 responses，以便后续用于较小模型的 distillation。
  - 使用 retrieval-augmented generation 来优化准确性
  - 使用 fine-tuning 来优化一致性和行为

在此过程中，收集 prompt 和 completion pairs，用于 evaluations、few-shot learning 或 fine-tuning。这种实践称为 **prompt baking**，有助于你生成高质量示例供未来使用。

有关这里的更多方法和工具，请参阅我们的 [Accuracy Optimization Guide](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy)。

#### 设定现实的准确性目标

通过评估模型决策的财务影响来计算现实的准确性目标。例如，在一个假新闻分类场景中：

- **正确分类新闻：** 如果模型正确分类，它会为你节省人工审核成本，假设为 **$50**。
- **错误分类新闻：** 如果它错误地将安全文章归类，或漏掉假新闻文章，可能会触发审核流程和可能的投诉，这可能花费我们 **$300**。

我们的新闻分类示例需要 **85.8%** 的准确性才能覆盖成本，因此以 90% 或更高为目标可以确保整体投资回报。请使用这些计算，根据你的具体成本结构设定有效的准确性目标。

### 2. 优化成本和延迟

成本和延迟被视为次要因素，因为如果模型无法达到你的准确性目标，这些关注点就没有意义。不过，一旦你有了适用于用例的模型，就可以采用以下两种方法之一：

- **与较小模型进行 zero-shot 或 few-shot 比较：** 将模型替换为更小、更便宜的模型，并测试它是否能在更低成本和延迟点上保持准确性。
- **Model distillation：** 使用准确性优化期间收集的数据，对较小模型进行 fine-tune。

成本和延迟通常相互关联；减少 tokens 和 requests 通常会带来更快处理速度。

这里需要考虑的主要策略包括：

- **减少 requests：** 限制完成任务所需的必要请求数量。
- **最小化 tokens：** 降低 input tokens 数量，并优化更短的模型输出。
- **选择较小模型：** 使用在降低成本和延迟的同时保持准确性的模型。

要深入了解这些内容，请参阅我们的 [latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization) 指南。

#### 规则的例外

这些原则存在明显例外。如果你的用例对成本或延迟极其敏感，请在开始测试之前为这些指标建立阈值，然后将超过阈值的模型从考虑范围中移除。一旦设定了 benchmarks，这些指南将帮助你在约束条件内优化模型准确性。

## 实用示例

为了演示这些原则，我们将开发一个假新闻分类器，并设定以下目标指标。下面的实验使用历史 GPT-4o-family 结果来展示工作流；对于当前 evaluations，请从 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 开始，并与较小模型或 fine-tuned models 比较。

- **准确性：** 达到 90% 正确分类
- **成本：** 每 1,000 篇文章花费少于 $5
- **延迟：** 每篇文章处理时间保持在 2 秒以内

### 实验

我们运行了三个实验来达成目标：

1. **Zero-shot：** 使用 `GPT-4o` 和基础 prompt 处理 1,000 条记录，但未达到准确性目标。
2. **Few-shot learning：** 包含 5 个 few-shot examples，达到了准确性目标，但由于 prompt tokens 增加而超出成本。
3. **Fine-tuned model：** 使用 1,000 个标注示例 fine-tune `GPT-4o-mini`，在延迟和准确性相似的情况下达成所有目标，且成本显著更低。

| ID  | Method                                  | Accuracy | Accuracy target | Cost   | Cost target | Avg. latency | Latency target |
| --- | --------------------------------------- | -------- | --------------- | ------ | ----------- | ------------ | -------------- |
| 1   | gpt-4o zero-shot                        | 84.5%    |                 | $1.72  |             | < 1s         |                |
| 2   | gpt-4o few-shot (n=5)                   | 91.5%    | ✓               | $11.92 |             | < 1s         | ✓              |
| 3   | gpt-4o-mini fine-tuned w/ 1000 examples | 91.5%    | ✓               | $0.21  | ✓           | < 1s         | ✓              |

## 结论

通过从 `gpt-4o` 切换到经过 fine-tuning 的 `gpt-4o-mini`，我们只用了 1,000 个标注示例，就以不到 2% 的成本实现了**等效性能**。

这个过程很重要 - 你通常不能直接跳到 fine-tuning，因为你并不知道 fine-tuning 是否是满足你优化需求的正确工具，或者你还没有足够的标注示例。先从 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 开始建立准确性目标，然后在成本和延迟重要时测试较小模型或 fine-tuned models。
