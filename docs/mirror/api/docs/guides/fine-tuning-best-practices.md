---
title: "Fine-tuning 最佳实践"
description: "Improve results with practical tips for fine-tuning."
outline: deep
---

# Fine-tuning 最佳实践

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/fine-tuning-best-practices](https://developers.openai.com/api/docs/guides/fine-tuning-best-practices)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/fine-tuning-best-practices.md](https://developers.openai.com/api/docs/guides/fine-tuning-best-practices.md)
- 抓取时间：2026-06-27T05:54:02.335Z
- Checksum：`91f8ce893d1a8765f7ecbaa3d82936c61ae2e2982535ece702279ab9adb506c5`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
如果 fine-tuned model 的效果不够理想，请考虑对你的流程进行以下迭代。

OpenAI 正在逐步关闭 fine-tuning 平台。该平台已不再向新用户开放，
  但 fine-tuning 平台的现有用户在未来几个月内仍可以创建训练作业。

  所有 fine-tuned models 都将继续可用于推理，直到其 base
  models 被[弃用](/mirror/api/docs/deprecations)。完整时间表
  [在这里](/mirror/api/docs/deprecations)。

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

收集示例后，将数据集拆分为训练部分和测试部分。训练集用于 fine-tuning 作业，测试集用于 [evals](/mirror/api/docs/guides/evals)。

当你同时提交训练文件和测试文件来创建 fine-tuning 作业时，我们会在训练过程中提供两者的统计信息。这些统计信息会让你了解模型正在改进多少。尽早构建测试集有助于你在训练后通过与测试集基准比较来[评估模型](/mirror/api/docs/guides/evals)。

### 为训练数据编写 prompt

取模型在 fine-tuning 之前表现最好的那组指令和 prompt，并将它们包含在每个训练示例中。这应该能让你获得最佳且最通用的结果，尤其是在训练示例相对较少（少于 100 个）的情况下。

你可能会想缩短每个示例中重复出现的指令或 prompt 以节省成本。如果没有重复的指令，可能需要更多训练示例才能得到好结果，因为模型必须完全通过示范来学习。

### 训练数据中的多轮聊天

若要在[多轮对话](/mirror/api/docs/guides/conversation-state)上训练模型，请在训练数据每一行的 `messages` 数组中包含多个 `user` 和 `assistant` 消息。

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

&lt;a
  href="https://cookbook.openai.com/examples/chat_finetuning_data_prep"
  target="_blank"
  rel="noreferrer"
&gt;
  



    了解 fine-tuning 数据格式




:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
If you're not getting strong results with a fine-tuned model, consider the following iterations on your process.

OpenAI is winding down the fine-tuning platform. The platform is no longer
  accessible to new users, but existing users of the fine-tuning platform will
  be able to create training jobs for the coming months.
  <br />
  All fine-tuned models will remain available for inference until their base
  models are [deprecated](https://developers.openai.com/api/docs/deprecations). The full timeline is
  [here](https://developers.openai.com/api/docs/deprecations).

### Iterating on data quality

Below are a few ways to consider improving the quality of your training data set:

- Collect examples to target remaining issues.
  - If the model still isn't good at certain aspects, add training examples that directly show the model how to do these aspects correctly.
- Scrutinize existing examples for issues.
  - If your model has grammar, logic, or style issues, check if your data has any of the same issues. For instance, if the model now says "I will schedule this meeting for you" (when it shouldn't), see if existing examples teach the model to say it can do new things that it can't do
- Consider the balance and diversity of data.
  - If 60% of the assistant responses in the data says "I cannot answer this", but at inference time only 5% of responses should say that, you will likely get an overabundance of refusals.
- Make sure your training examples contain all of the information needed for the response.
  - If we want the model to compliment a user based on their personal traits and a training example includes assistant compliments for traits not found in the preceding conversation, the model may learn to hallucinate information.
- Look at the agreement and consistency in the training examples.
  - If multiple people created the training data, it's likely that model performance will be limited by the level of agreement and consistency between people. For instance, in a text extraction task, if people only agreed on 70% of extracted snippets, the model would likely not be able to do better than this.
- Make sure your all of your training examples are in the same format, as expected for inference.

### Iterating on data quantity

Once you're satisfied with the quality and distribution of the examples, you can consider scaling up the number of training examples. This tends to help the model learn the task better, especially around possible "edge cases". We expect a similar amount of improvement every time you double the number of training examples. You can loosely estimate the expected quality gain from increasing the training data size by:

- Fine-tuning on your current dataset
- Fine-tuning on half of your current dataset
- Observing the quality gap between the two

In general, if you have to make a tradeoff, a smaller amount of high-quality data is generally more effective than a larger amount of low-quality data.

### Iterating on hyperparameters

Hyperparameters control how the model's weights are updated during the training process. A few common options are:

- **Epochs**: An epoch is a single complete pass through your entire training dataset during model training. You will typically run multiple epochs so the model can iteratively refine its weights.
- **Learning rate multiplier**: Adjusts the size of changes made to the model's learned parameters. A larger multiplier can speed up training, while a smaller one can lean to slower but more stable training.
- **Batch size**: The number of examples the model processes in one forward and backward pass before updating its weights. Larger batches slow down training, but may produce more stable results.

We recommend initially training without specifying any of these, allowing us to pick a default for you based on dataset size, then adjusting if you observe the following:

- If the model doesn't follow the training data as much as expected, increase the number of epochs by 1 or 2.
  - This is more common for tasks for which there is a single ideal completion (or a small set of ideal completions which are similar). Some examples include classification, entity extraction, or structured parsing. These are often tasks for which you can compute a final accuracy metric against a reference answer.
- If the model becomes less diverse than expected, decrease the number of epochs by 1 or 2.
  - This is more common for tasks for which there are a wide range of possible good completions.
- If the model doesn't appear to be converging, increase the learning rate multiplier.

You can set the hyperparameters as shown below:

Setting hyperparameters

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


## Adjust your dataset

Another option if you're not seeing strong fine-tuning results is to go back and revise your training data. Here are a few best practices as you collect examples to use in your dataset.

### Training vs. testing datasets

After collecting your examples, split the dataset into training and test portions. The training set is for fine-tuning jobs, and the test set is for [evals](https://developers.openai.com/api/docs/guides/evals).

When you submit a fine-tuning job with both training and test files, we'll provide statistics on both during the course of training. These statistics give you signal on how much the model's improving. Constructing a test set early on helps you [evaluate the model after training](https://developers.openai.com/api/docs/guides/evals) by comparing with the test set benchmark.

### Crafting prompts for training data

Take the set of instructions and prompts that worked best for the model prior to fine-tuning, and include them in every training example. This should let you reach the best and most general results, especially if you have relatively few (under 100) training examples.

You may be tempted to shorten the instructions or prompts repeated in every example to save costs. Without repeated instructions, it may take more training examples to arrive at good results, as the model has to learn entirely through demonstration.

### Multi-turn chat in training data

To train the model on [multi-turn conversations](https://developers.openai.com/api/docs/guides/conversation-state), include multiple `user` and `assistant` messages in the `messages` array for each line of your training data.

Use the optional `weight` key (value set to either 0 or 1) to disable fine-tuning on specific assistant messages. Here are some examples of controlling `weight` in a chat format:

```jsonl
{"messages": [{"role": "system", "content": "Marv is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "What's the capital of France?"}, {"role": "assistant", "content": "Paris", "weight": 0}, {"role": "user", "content": "Can you be more sarcastic?"}, {"role": "assistant", "content": "Paris, as if everyone doesn't know that already.", "weight": 1}]}
{"messages": [{"role": "system", "content": "Marv is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "Who wrote 'Romeo and Juliet'?"}, {"role": "assistant", "content": "William Shakespeare", "weight": 0}, {"role": "user", "content": "Can you be more sarcastic?"}, {"role": "assistant", "content": "Oh, just some guy named William Shakespeare. Ever heard of him?", "weight": 1}]}
{"messages": [{"role": "system", "content": "Marv is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "How far is the Moon from Earth?"}, {"role": "assistant", "content": "384,400 kilometers", "weight": 0}, {"role": "user", "content": "Can you be more sarcastic?"}, {"role": "assistant", "content": "Around 384,400 kilometers. Give or take a few, like that really matters.", "weight": 1}]}
```

### Token limits

Token limits depend on model. Here's an overview of the maximum allowed context lengths:

| Model                     | Inference context length | Examples context length |
| ------------------------- | ------------------------ | ----------------------- |
| `gpt-4.1-2025-04-14`      | 128,000 tokens           | 65,536 tokens           |
| `gpt-4.1-mini-2025-04-14` | 128,000 tokens           | 65,536 tokens           |
| `gpt-4.1-nano-2025-04-14` | 128,000 tokens           | 65,536 tokens           |
| `gpt-4o-2024-08-06`       | 128,000 tokens           | 65,536 tokens           |
| `gpt-4o-mini-2024-07-18`  | 128,000 tokens           | 65,536 tokens           |

Examples longer than the default are truncated to the maximum context length, which removes tokens from the end of the training example. To make sure your entire training example fits in context, keep the total token counts in the message contents under the limit.

Compute token counts with [the tokenizer tool](https://platform.openai.com/tokenizer) or by using code, as in this [cookbook example](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken).

Before uploading your data, you may want to check formatting and potential token costs - an example of how to do this can be found in the cookbook.

<a
  href="https://cookbook.openai.com/examples/chat_finetuning_data_prep"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Learn about fine-tuning data formatting


</a>
``````
:::
:::

