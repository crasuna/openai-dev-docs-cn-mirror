---
status: needs-review
sourceId: "91f8ce893d1a"
sourceChecksum: "91f8ce893d1a8765f7ecbaa3d82936c61ae2e2982535ece702279ab9adb506c5"
sourceUrl: "https://developers.openai.com/api/docs/guides/fine-tuning-best-practices"
translatedAt: "2026-06-27T17:43:53.3580579+08:00"
translator: codex-gpt-5.5-xhigh
---

# Fine-tuning 最佳实践

如果 fine-tuned model 的效果不够理想，请考虑对你的流程进行以下迭代。

OpenAI 正在逐步关闭 fine-tuning 平台。该平台已不再向新用户开放，
  但 fine-tuning 平台的现有用户在未来几个月内仍可以创建训练作业。
  <br />
  所有 fine-tuned models 都将继续可用于推理，直到其 base
  models 被[弃用](https://developers.openai.com/api/docs/deprecations)。完整时间表
  [在这里](https://developers.openai.com/api/docs/deprecations)。

### 迭代数据质量

下面是一些可以考虑用来提升训练数据集质量的方法：

- 收集针对剩余问题的示例。
  - 如果模型在某些方面仍然表现不好，请添加训练示例，直接向模型展示如何正确完成这些方面。
- 仔细检查现有示例中的问题。
  - 如果你的模型存在语法、逻辑或风格问题，请检查数据中是否也有同类问题。例如，如果模型现在说“我会帮你安排这次会议”（但它不应该这样说），就看看现有示例是否在教模型声称它能做其实不能做的新事情。
- 考虑数据的平衡性和多样性。
  - 如果数据中 60% 的 assistant 响应都说“我无法回答这个问题”，但在推理时只有 5% 的响应应该这样说，你很可能会得到过多拒答。
- 确保训练示例包含生成响应所需的全部信息。
  - 如果我们希望模型根据用户的个人特质称赞用户，而某个训练示例中的 assistant 称赞了前面对话中没有出现的特质，那么模型可能会学会幻觉信息。
- 查看训练示例中的一致程度和一致性。
  - 如果训练数据由多人创建，模型性能很可能会受到人员之间一致程度和一致性的限制。例如，在文本抽取任务中，如果人们只对 70% 的抽取片段达成一致，模型很可能也无法做得比这更好。
- 确保你的所有训练示例都采用与推理预期一致的相同格式。

### 迭代数据数量

当你对示例的质量和分布感到满意后，可以考虑扩大训练示例数量。这通常有助于模型更好地学习任务，尤其是在可能的“边界情况”方面。我们预计每次将训练示例数量翻倍时，都会带来类似幅度的改进。你可以通过以下方式粗略估计增加训练数据规模所带来的预期质量提升：

- 在当前数据集上进行 fine-tuning
- 在当前数据集的一半上进行 fine-tuning
- 观察两者之间的质量差距

一般来说，如果必须取舍，少量高质量数据通常比大量低质量数据更有效。

### 迭代超参数

超参数控制模型权重在训练过程中如何更新。几个常见选项包括：

- **Epochs**：一个 epoch 是模型训练期间对整个训练数据集进行的一次完整遍历。你通常会运行多个 epoch，让模型能够迭代式地细化其权重。
- **Learning rate multiplier**：调整模型已学习参数变化的大小。更大的 multiplier 可以加快训练速度，而更小的 multiplier 可能导致训练更慢但更稳定。
- **Batch size**：模型在更新权重之前，在一次前向和后向传播中处理的示例数量。更大的 batch 会减慢训练速度，但可能产生更稳定的结果。

我们建议一开始不要指定这些参数，让我们根据数据集大小为你选择默认值；如果观察到以下情况，再进行调整：

- 如果模型没有像预期那样遵循训练数据，请将 epoch 数量增加 1 或 2。
  - 这在只有一个理想 completion（或一小组相似的理想 completions）的任务中更常见。例如分类、实体抽取或结构化解析。这类任务通常可以根据参考答案计算最终准确率指标。
- 如果模型变得比预期更缺乏多样性，请将 epoch 数量减少 1 或 2。
  - 这在存在大量可能的优质 completions 的任务中更常见。
- 如果模型看起来没有收敛，请增加 learning rate multiplier。

你可以按如下方式设置超参数：

设置超参数

```javascript
const fineTune = await openai.fineTuning.jobs.create({
  training_file: "file-abc123",
  model: "gpt-4o-mini-2024-07-18",
  method: {
    type: "supervised",
    supervised: {
      hyperparameters: { n_epochs: 2 },
    },
  },
});
```

```python
from openai import OpenAI
client = OpenAI()

client.fine_tuning.jobs.create(
    training_file="file-abc123",
    model="gpt-4o-mini-2024-07-18",
    method={
        "type": "supervised",
        "supervised": {
            "hyperparameters": {"n_epochs": 2},
        },
    },
)
```


## 调整你的数据集

如果你没有看到强劲的 fine-tuning 结果，另一种选择是回过头来修订训练数据。以下是在收集要用于数据集的示例时可以采用的一些最佳实践。

### 训练数据集与测试数据集

收集示例后，将数据集拆分为训练部分和测试部分。训练集用于 fine-tuning 作业，测试集用于 [evals](https://developers.openai.com/api/docs/guides/evals)。

当你同时提交训练文件和测试文件来创建 fine-tuning 作业时，我们会在训练过程中提供两者的统计信息。这些统计信息会让你了解模型正在改进多少。尽早构建测试集有助于你在训练后通过与测试集基准比较来[评估模型](https://developers.openai.com/api/docs/guides/evals)。

### 为训练数据编写 prompt

取模型在 fine-tuning 之前表现最好的那组指令和 prompt，并将它们包含在每个训练示例中。这应该能让你获得最佳且最通用的结果，尤其是在训练示例相对较少（少于 100 个）的情况下。

你可能会想缩短每个示例中重复出现的指令或 prompt 以节省成本。如果没有重复的指令，可能需要更多训练示例才能得到好结果，因为模型必须完全通过示范来学习。

### 训练数据中的多轮聊天

若要在[多轮对话](https://developers.openai.com/api/docs/guides/conversation-state)上训练模型，请在训练数据每一行的 `messages` 数组中包含多个 `user` 和 `assistant` 消息。

使用可选的 `weight` 键（值设置为 0 或 1）可以禁用对特定 assistant 消息的 fine-tuning。下面是一些在聊天格式中控制 `weight` 的示例：

```jsonl
{"messages": [{"role": "system", "content": "Marv is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "What's the capital of France?"}, {"role": "assistant", "content": "Paris", "weight": 0}, {"role": "user", "content": "Can you be more sarcastic?"}, {"role": "assistant", "content": "Paris, as if everyone doesn't know that already.", "weight": 1}]}
{"messages": [{"role": "system", "content": "Marv is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "Who wrote 'Romeo and Juliet'?"}, {"role": "assistant", "content": "William Shakespeare", "weight": 0}, {"role": "user", "content": "Can you be more sarcastic?"}, {"role": "assistant", "content": "Oh, just some guy named William Shakespeare. Ever heard of him?", "weight": 1}]}
{"messages": [{"role": "system", "content": "Marv is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "How far is the Moon from Earth?"}, {"role": "assistant", "content": "384,400 kilometers", "weight": 0}, {"role": "user", "content": "Can you be more sarcastic?"}, {"role": "assistant", "content": "Around 384,400 kilometers. Give or take a few, like that really matters.", "weight": 1}]}
```

### Token 限制

Token 限制取决于模型。下面是最大允许上下文长度的概览：

| Model                     | Inference context length | Examples context length |
| ------------------------- | ------------------------ | ----------------------- |
| `gpt-4.1-2025-04-14`      | 128,000 tokens           | 65,536 tokens           |
| `gpt-4.1-mini-2025-04-14` | 128,000 tokens           | 65,536 tokens           |
| `gpt-4.1-nano-2025-04-14` | 128,000 tokens           | 65,536 tokens           |
| `gpt-4o-2024-08-06`       | 128,000 tokens           | 65,536 tokens           |
| `gpt-4o-mini-2024-07-18`  | 128,000 tokens           | 65,536 tokens           |

超过默认值的示例会被截断到最大上下文长度，这会从训练示例末尾移除 token。为确保整个训练示例都能放入上下文，请让消息内容中的总 token 数低于限制。

可以使用 [tokenizer tool](https://platform.openai.com/tokenizer) 或代码来计算 token 数，例如这个 [cookbook 示例](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken)。

上传数据前，你可能想检查格式和潜在 token 成本 - cookbook 中有一个示例展示了如何执行此操作。

<a
  href="https://cookbook.openai.com/examples/chat_finetuning_data_prep"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    了解 fine-tuning 数据格式


</a>
