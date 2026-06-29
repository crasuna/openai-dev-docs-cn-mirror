---
title: "模型选择"
description: "Learn how to choose the right model by balancing accuracy, latency, and cost for optimal performance."
outline: deep
---

# 模型选择

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/model-selection](https://developers.openai.com/api/docs/guides/model-selection)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/model-selection.md](https://developers.openai.com/api/docs/guides/model-selection.md)
- 抓取时间：2026-06-27T05:54:03.735Z
- Checksum：`9ac42ae86875629d372dee1f42d5045e8892ca1f02e6b09b29eb5760bd3d47e5`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
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

有关这里的更多方法和工具，请参阅我们的 [Accuracy Optimization Guide](/mirror/api/docs/guides/optimizing-llm-accuracy)。

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

要深入了解这些内容，请参阅我们的 [latency optimization](/mirror/api/docs/guides/latency-optimization) 指南。

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
| 1   | gpt-4o zero-shot                        | 84.5%    |                 | $1.72  |             | &lt; 1s         |                |
| 2   | gpt-4o few-shot (n=5)                   | 91.5%    | ✓               | $11.92 |             | &lt; 1s         | ✓              |
| 3   | gpt-4o-mini fine-tuned w/ 1000 examples | 91.5%    | ✓               | $0.21  | ✓           | &lt; 1s         | ✓              |

## 结论

通过从 `gpt-4o` 切换到经过 fine-tuning 的 `gpt-4o-mini`，我们只用了 1,000 个标注示例，就以不到 2% 的成本实现了**等效性能**。

这个过程很重要 - 你通常不能直接跳到 fine-tuning，因为你并不知道 fine-tuning 是否是满足你优化需求的正确工具，或者你还没有足够的标注示例。先从 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 开始建立准确性目标，然后在成本和延迟重要时测试较小模型或 fine-tuned models。

:::

## English source

::: details 展开英文原文
::: v-pre
Choosing the right model, whether [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) or a smaller option like [`gpt-5.4-mini`](https://developers.openai.com/api/docs/models/gpt-5.4-mini), requires balancing **accuracy**, **latency**, and **cost**. This guide explains key principles to help you make informed decisions, along with a practical example.

## Core principles

The principles for model selection are simple:

- **Optimize for accuracy first:** Optimize for accuracy until you hit your accuracy target.
- **Optimize for cost and latency second:** Then aim to maintain accuracy with the cheapest, fastest model possible.

### 1. Focus on accuracy first

Begin by setting a clear accuracy goal for your use case, where you're clear on the accuracy that would be "good enough" for this use case to go to production. You can accomplish this through:

- **Setting a clear accuracy target:** Identify what your target accuracy statistic is going to be.
  - For example, 90% of customer service calls need to be triaged correctly at the first interaction.
- **Developing an evaluation dataset:** Create a dataset that allows you to measure the model's performance against these goals.
  - To extend the example above, capture 100 interaction examples where we have what the user asked for, what the LLM triaged them to, what the correct triage should be, and whether this was correct or not.
- **Using the most powerful model to optimize:** Start with the most capable model available to achieve your accuracy targets. Log all responses so we can use them for distillation of a smaller model.
  - Use retrieval-augmented generation to optimize for accuracy
  - Use fine-tuning to optimize for consistency and behavior

During this process, collect prompt and completion pairs for use in evaluations, few-shot learning, or fine-tuning. This practice, known as **prompt baking**, helps you produce high-quality examples for future use.

For more methods and tools here, see our [Accuracy Optimization Guide](/mirror/api/docs/guides/optimizing-llm-accuracy).

#### Setting a realistic accuracy target

Calculate a realistic accuracy target by evaluating the financial impact of model decisions. For example, in a fake news classification scenario:

- **Correctly classified news:** If the model classifies it correctly, it saves you the cost of a human reviewing it - let's assume **$50**.
- **Incorrectly classified news:** If it falsely classifies a safe article or misses a fake news article, it may trigger a review process and possible complaint, which might cost us **$300**.

Our news classification example would need **85.8%** accuracy to cover costs, so targeting 90% or more ensures an overall return on investment. Use these calculations to set an effective accuracy target based on your specific cost structures.

### 2. Optimize cost and latency

Cost and latency are considered secondary because if the model can’t hit your accuracy target then these concerns are moot. However, once you’ve got a model that works for your use case, you can take one of two approaches:

- **Compare with a smaller model zero- or few-shot:** Swap out the model for a smaller, cheaper one and test whether it maintains accuracy at the lower cost and latency point.
- **Model distillation:** Fine-tune a smaller model using the data gathered during accuracy optimization.

Cost and latency are typically interconnected; reducing tokens and requests generally leads to faster processing.

The main strategies to consider here are:

- **Reduce requests:** Limit the number of necessary requests to complete tasks.
- **Minimize tokens:** Lower the number of input tokens and optimize for shorter model outputs.
- **Select a smaller model:** Use models that balance reduced costs and latency with maintained accuracy.

To dive deeper into these, please refer to our guide on [latency optimization](/mirror/api/docs/guides/latency-optimization).

#### Exceptions to the rule

Clear exceptions exist for these principles. If your use case is extremely cost or latency sensitive, establish thresholds for these metrics before beginning your testing, then remove the models that exceed those from consideration. Once benchmarks are set, these guidelines will help you refine model accuracy within your constraints.

## Practical example

To demonstrate these principles, we'll develop a fake news classifier with the following target metrics. The experiment below uses historical GPT-4o-family results to show the workflow; for current evaluations, start with [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) and compare against smaller or fine-tuned models.

- **Accuracy:** Achieve 90% correct classification
- **Cost:** Spend less than $5 per 1,000 articles
- **Latency:** Maintain processing time under 2 seconds per article

### Experiments

We ran three experiments to reach our goal:

1. **Zero-shot:** Used `GPT-4o` with a basic prompt for 1,000 records, but missed the accuracy target.
2. **Few-shot learning:** Included 5 few-shot examples, meeting the accuracy target but exceeding cost due to more prompt tokens.
3. **Fine-tuned model:** Fine-tuned `GPT-4o-mini` with 1,000 labeled examples, meeting all targets with similar latency and accuracy but significantly lower costs.

| ID  | Method                                  | Accuracy | Accuracy target | Cost   | Cost target | Avg. latency | Latency target |
| --- | --------------------------------------- | -------- | --------------- | ------ | ----------- | ------------ | -------------- |
| 1   | gpt-4o zero-shot                        | 84.5%    |                 | $1.72  |             | &lt; 1s         |                |
| 2   | gpt-4o few-shot (n=5)                   | 91.5%    | ✓               | $11.92 |             | &lt; 1s         | ✓              |
| 3   | gpt-4o-mini fine-tuned w/ 1000 examples | 91.5%    | ✓               | $0.21  | ✓           | &lt; 1s         | ✓              |

## Conclusion

By switching from `gpt-4o` to `gpt-4o-mini` with fine-tuning, we achieved **equivalent performance for less than 2%** of the cost, using only 1,000 labeled examples.

This process is important - you often can’t jump right to fine-tuning because you don’t know whether fine-tuning is the right tool for the optimization you need, or you don’t have enough labeled examples. Start with [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) to establish your accuracy target, then test smaller or fine-tuned models when cost and latency matter.

:::
:::

