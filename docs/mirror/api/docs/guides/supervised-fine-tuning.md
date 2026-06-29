---
title: "监督式微调"
description: "Fine-tune models with example inputs and known good outputs for better results and efficiency."
outline: deep
---

# 监督式微调

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/supervised-fine-tuning](https://developers.openai.com/api/docs/guides/supervised-fine-tuning)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/supervised-fine-tuning.md](https://developers.openai.com/api/docs/guides/supervised-fine-tuning.md)
- 抓取时间：2026-06-27T05:54:09.372Z
- Checksum：`16ba9978f3710af7c98b6a41dea3fef6fba2acb41da1c9b17ec1e709307edf64`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
监督式微调（SFT）让你可以使用特定用例的示例训练 OpenAI 模型。结果是一个定制模型，能够更可靠地产生你想要的风格和内容。

OpenAI 正在逐步停止 fine-tuning platform。该平台已不再向新用户开放，但 fine-tuning platform 的现有用户在未来几个月内仍可创建 training jobs。

  所有 fine-tuned models 都将在其 base models 被[弃用](/mirror/api/docs/deprecations)之前继续可用于推理。完整时间线在
  [这里](/mirror/api/docs/deprecations)。






工作原理
最适合
搭配使用




提供 prompt 的正确响应示例，以引导模型行为。

通常使用人工生成的 "ground truth" 响应来向模型展示它应该如何回应。



- 分类
- 细微差别较多的翻译
- 以特定格式生成内容
- 修正指令遵循失败


`gpt-4.1-2025-04-14`
`gpt-4.1-mini-2025-04-14`
`gpt-4.1-nano-2025-04-14`






## 概览

监督式微调有四个主要部分：

1. 构建训练数据集，用来定义什么是“好”
1. 上传包含示例 prompts 和期望模型输出的训练数据集
1. 使用你的训练数据为 base model 创建 fine-tuning job
1. 使用 fine-tuned model 评估结果

**先做好 evals！** 只有在设置 evals 之后才投入 fine-tuning。
  你需要一种可靠的方法来判断 fine-tuned model 是否比 base model 表现更好。

  [设置 evals →](/mirror/api/docs/guides/evals)

## 构建你的数据集

构建一个稳健、有代表性的数据集，以便从 fine-tuned model 获得有用结果。使用以下技巧和注意事项。

### 示例数量要合适

- 可用于 fine-tuning 的最少示例数是 10
- 我们看到，在 50-100 个示例上 fine-tuning 会带来改进，但适合你的数量差异很大，并取决于用例
- 我们建议从 50 个精心构建的 demonstrations 开始，并[评估结果](/mirror/api/docs/guides/evals)

如果 50 个优质示例能提升性能，可以尝试添加更多示例来观察进一步结果。如果 50 个示例没有影响，请在添加训练数据前重新思考你的任务或 prompt。

### 什么样的示例才是好示例

- 尽可能贴近你在应用中预期出现的任何 prompts 和 outputs
- 具体、清晰的问题和答案
- 使用历史数据、专家数据、日志数据，或[其他类型的已收集数据](/mirror/api/docs/guides/evals)

### 格式化你的数据

- 使用 [JSONL format](https://jsonlines.org/)，训练数据文件的每一行都是一个完整 JSON 结构
- 使用 [chat completions format](https://developers.openai.com/api/docs/api-reference/fine-tuning/chat-input)
- 你的文件必须至少有 10 行




JSONL format 示例文件


对应的 JSON 数据




### 从更大模型蒸馏

为较小模型构建训练数据集的一种方法，是蒸馏大型模型的结果，为监督式微调创建训练数据。这种技术的一般流程是：

- 为较大模型（例如 `gpt-4.1`）调优 prompt，直到它在你的 eval 标准下获得出色表现。
- 使用任何方便的技术捕获模型生成的结果。请注意，[Responses API](https://developers.openai.com/api/docs/api-reference/responses) 默认存储模型响应 30 天。
- 使用符合你标准的大模型捕获响应，并借助上面描述的工具和技术生成数据集。
- 使用你从大模型创建的数据集调优较小模型（例如 `gpt-4.1-mini`）。

这种技术可以让你训练一个小模型，使它在特定任务上表现得类似于更大、更昂贵的模型。

## 上传训练数据

将你的示例数据集上传到 OpenAI。我们会用它更新模型权重，并生成类似于你数据中所包含内容的输出。

除了文本补全之外，你还可以训练模型更有效地生成[结构化 JSON 输出](/mirror/api/docs/guides/structured-outputs)或[函数调用](/mirror/api/docs/guides/function-calling)。




通过点击按钮上传你的数据


调用 API 上传你的数据




## 创建 fine-tuning job

上传测试数据后，[创建 fine-tuning job](https://developers.openai.com/api/docs/api-reference/fine-tuning/create)，使用你提供的训练数据定制 base model。创建 fine-tuning job 时，你必须指定：

- 用于 fine-tuning 的 base model（`model`）。它可以是 OpenAI model ID，也可以是先前 fine-tuned model 的 ID。请在[模型文档](https://developers.openai.com/api/docs/models)中查看哪些模型支持 fine-tuning。
- training file（`training_file`）ID。这是你在上一步上传的文件。
- fine-tuning method（`method`）。它指定你想用哪种 fine-tuning method 定制模型。监督式微调是默认值。




通过点击按钮上传你的数据


调用 API 上传你的数据




## 评估结果

使用下面的方法检查 fine-tuned model 的表现。根据需要调整 prompts、数据和 fine-tuning job，直到得到你想要的结果。fine-tuning 的最佳方式是持续迭代。

### 与 evals 对比

若要查看 fine-tuned model 是否比原始 base model 表现更好，请[使用 evals](/mirror/api/docs/guides/evals)。在运行 fine-tuning job 前，从第 1 步收集的同一训练数据集中划出一部分数据。使用这部分 holdout data 进行 evals 时，它会作为对照组。请确保训练数据和 holdout data 在用户输入类型和模型响应方面具有大致相同的多样性。

[了解更多关于运行 evals 的信息](/mirror/api/docs/guides/evals)。

### 监控状态

在 dashboard 中检查 fine-tuning job 的状态，或通过 API 轮询 job ID。




在 UI 中监控


使用 API calls 监控




### 尝试使用你的 fine-tuned model

通过实际使用新优化的模型来评估它！当 fine-tuned model 完成训练后，可以在 [Responses](https://developers.openai.com/api/docs/api-reference/responses) 或 [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat) API 中使用它的 ID，就像使用 OpenAI base model 一样。




在 Playground 中使用你的模型


通过 API call 使用你的模型




### 需要时使用 checkpoints

Checkpoints 是你可以使用的模型。我们会在每个训练 epoch 结束时为你创建完整模型 checkpoint。在 fine-tuned model 早期有所改进、但随后记住数据集而不是学习可泛化知识（称为 \_overfitting）的情况下，它们很有用。Checkpoints 提供定制模型在流程不同时间点的版本。




在 dashboard 中查找 checkpoints


查询 API 获取 checkpoints




目前，仅保存并可使用 job 最后三个 epochs 的 checkpoints。

## 安全检查

在投入生产之前，请查看并遵循以下安全信息。

我们如何评估安全性

fine-tuning job 完成后，我们会评估所得模型在 13 个不同安全类别上的行为。每个类别代表一个关键领域，如果 AI 输出未得到适当控制，就可能在这些领域造成伤害。

| Name                   | Description                                                                                                                                                                                                                                    |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| advice                 | 违反我们政策的建议或指导。                                                                                                                                                                                                 |
| harassment/threatening | 同时包含针对任何目标的暴力或严重伤害的骚扰内容。                                                                                                                                                             |
| hate                   | 基于种族、性别、族裔、宗教、国籍、性取向、残障状态或 caste 表达、煽动或宣扬仇恨的内容。针对非受保护群体（例如棋手）的仇恨内容属于骚扰。 |
| hate/threatening       | 同时包含基于种族、性别、族裔、宗教、国籍、性取向、残障状态或 caste 针对目标群体的暴力或严重伤害的仇恨内容。                                               |
| highly-sensitive       | 违反我们政策的高度敏感数据。                                                                                                                                                                                              |
| illicit                | 就如何实施非法行为提供建议或说明的内容。例如 "how to shoplift" 这样的短语就属于此类别。                                                                                                               |
| propaganda             | 对违反我们政策的意识形态的赞扬或协助。                                                                                                                                                                                  |
| self-harm/instructions | 鼓励实施自残行为（例如自杀、自残和进食障碍），或就如何实施此类行为提供说明或建议的内容。                                                                         |
| self-harm/intent       | 说话者表达自己正在或打算实施自残行为（例如自杀、自残和进食障碍）的内容。                                                                                           |
| sensitive              | 违反我们政策的敏感数据。                                                                                                                                                                                                     |
| sexual/minors          | 包含未满 18 岁个人的性内容。                                                                                                                                                                          |
| sexual                 | 旨在唤起性兴奋的内容，例如对性行为的描述，或推广性服务的内容（不包括性教育和健康）。                                                                                |
| violence               | 描绘死亡、暴力或身体伤害的内容。                                                                                                                                                                                      |

每个类别都有预定义的通过阈值；如果某个类别中太多已评估示例失败，OpenAI 会阻止 fine-tuned model 部署。如果你的 fine-tuned model 未通过安全检查，OpenAI 会在 fine-tuning job 中发送消息，说明哪些类别未达到所需阈值。你可以在 fine-tuning job 的 moderation checks 部分查看结果。

如何通过安全检查

除了查看 fine-tuning job object 中任何失败的安全检查之外，你还可以通过查询 [fine-tuning API events endpoint](https://developers.openai.com/api/docs/api-reference/fine-tuning/list-events)，获取哪些类别失败的详细信息。查找类型为 `moderation_checks` 的 events，以了解类别结果和 enforcement 详情。这些信息可以帮助你缩小需要重新训练和改进的类别范围。[model spec](https://cdn.openai.com/spec/model-spec-2024-05-08.html#overview) 中的规则和示例可以帮助识别需要额外训练数据的领域。

虽然这些评估覆盖了广泛的安全类别，但你仍应对 fine-tuned model 进行自己的评估，以确保它适合你的用例。

## 后续步骤

现在你已经了解监督式微调的基础知识，也可以探索以下其他方法。

[



    学习使用图像输入进行计算机视觉 fine-tuning。

](https://developers.openai.com/api/docs/guides/vision-fine-tuning)

[



    使用 direct preference optimization (DPO) 微调模型。

](https://developers.openai.com/api/docs/guides/direct-preference-optimization)

[



    通过为输出评分来微调 reasoning model。

](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Supervised fine-tuning (SFT) lets you train an OpenAI model with examples for your specific use case. The result is a customized model that more reliably produces your desired style and content.

OpenAI is winding down the fine-tuning platform. The platform is no longer
  accessible to new users, but existing users of the fine-tuning platform will
  be able to create training jobs for the coming months.
  <br />
  All fine-tuned models will remain available for inference until their base
  models are [deprecated](https://developers.openai.com/api/docs/deprecations). The full timeline is
  [here](https://developers.openai.com/api/docs/deprecations).

<br />

<table>
<tbody>
<tr>
<th>How it works</th>
<th>Best for</th>
<th>Use with</th>
</tr>

<tr>
<td>
Provide examples of correct responses to prompts to guide the model's behavior.

Often uses human-generated "ground truth" responses to show the model how it should respond.

</td>
<td>
- Classification
- Nuanced translation
- Generating content in a specific format
- Correcting instruction-following failures
</td>
<td>
`gpt-4.1-2025-04-14`
`gpt-4.1-mini-2025-04-14`
`gpt-4.1-nano-2025-04-14`
</td>
</tr>

</tbody>
</table>

## Overview

Supervised fine-tuning has four major parts:

1. Build your training dataset to determine what "good" looks like
1. Upload a training dataset containing example prompts and desired model output
1. Create a fine-tuning job for a base model using your training data
1. Evaluate your results using the fine-tuned model

**Good evals first!** Only invest in fine-tuning after setting up evals. You
  need a reliable way to determine whether your fine-tuned model is performing
  better than a base model.
  <br />
  [Set up evals →](https://developers.openai.com/api/docs/guides/evals)

## Build your dataset

Build a robust, representative dataset to get useful results from a fine-tuned model. Use the following techniques and considerations.

### Right number of examples

- The minimum number of examples you can provide for fine-tuning is 10
- We see improvements from fine-tuning on 50–100 examples, but the right number for you varies greatly and depends on the use case
- We recommend starting with 50 well-crafted demonstrations and [evaluating the results](https://developers.openai.com/api/docs/guides/evals)

If performance improves with 50 good examples, try adding examples to see further results. If 50 examples have no impact, rethink your task or prompt before adding training data.

### What makes a good example

- Whatever prompts and outputs you expect in your application, as realistic as possible
- Specific, clear questions and answers
- Use historical data, expert data, logged data, or [other types of collected data](https://developers.openai.com/api/docs/guides/evals)

### Formatting your data

- Use [JSONL format](https://jsonlines.org/), with one complete JSON structure on every line of the training data file
- Use the [chat completions format](https://developers.openai.com/api/docs/api-reference/fine-tuning/chat-input)
- Your file must have at least 10 lines



<div data-content-switcher-pane data-value="jsonl">
    <div class="hidden">JSONL format example file</div>
    </div>
  <div data-content-switcher-pane data-value="json" hidden>
    <div class="hidden">Corresponding JSON data</div>
    </div>



### Distilling from a larger model

One way to build a training data set for a smaller model is to distill the results of a large model to create training data for supervised fine tuning. The general flow of this technique is:

- Tune a prompt for a larger model (like `gpt-4.1`) until you get great performance against your eval criteria.
- Capture results generated from your model using whatever technique is convenient - note that the [Responses API](https://developers.openai.com/api/docs/api-reference/responses) stores model responses for 30 days by default.
- Use the captured responses from the large model that fit your criteria to generate a dataset using the tools and techniques described above.
- Tune a smaller model (like `gpt-4.1-mini`) using the dataset you created from the large model.

This technique can enable you to train a small model to perform similarly on a specific task to a larger, more costly model.

## Upload training data

Upload your dataset of examples to OpenAI. We use it to update the model's weights and produce outputs like the ones included in your data.

In addition to text completions, you can train the model to more effectively generate [structured JSON output](https://developers.openai.com/api/docs/guides/structured-outputs) or [function calls](https://developers.openai.com/api/docs/guides/function-calling).



<div data-content-switcher-pane data-value="ui">
    <div class="hidden">Upload your data with button clicks</div>
    </div>
  <div data-content-switcher-pane data-value="api" hidden>
    <div class="hidden">Call the API to upload your data</div>
    </div>



## Create a fine-tuning job

With your test data uploaded, [create a fine-tuning job](https://developers.openai.com/api/docs/api-reference/fine-tuning/create) to customize a base model using the training data you provide. When creating a fine-tuning job, you must specify:

- A base model (`model`) to use for fine-tuning. This can be either an OpenAI model ID or the ID of a previously fine-tuned model. See which models support fine-tuning in the [model docs](https://developers.openai.com/api/docs/models).
- A training file (`training_file`) ID. This is the file you uploaded in the previous step.
- A fine-tuning method (`method`). This specifies which fine-tuning method you want to use to customize the model. Supervised fine-tuning is the default.



<div data-content-switcher-pane data-value="ui">
    <div class="hidden">Upload your data with button clicks</div>
    </div>
  <div data-content-switcher-pane data-value="api" hidden>
    <div class="hidden">Call the API to upload your data</div>
    </div>



## Evaluate the result

Use the approaches below to check how your fine-tuned model performs. Adjust your prompts, data, and fine-tuning job as needed until you get the results you want. The best way to fine-tune is to continue iterating.

### Compare to evals

To see if your fine-tuned model performs better than the original base model, [use evals](https://developers.openai.com/api/docs/guides/evals). Before running your fine-tuning job, carve out data from the same training dataset you collected in step 1. This holdout data acts as a control group when you use it for evals. Make sure the training and holdout data have roughly the same diversity of user input types and model responses.

[Learn more about running evals](https://developers.openai.com/api/docs/guides/evals).

### Monitor the status

Check the status of a fine-tuning job in the dashboard or by polling the job ID in the API.



<div data-content-switcher-pane data-value="ui">
    <div class="hidden">Monitor in the UI</div>
    </div>
  <div data-content-switcher-pane data-value="api" hidden>
    <div class="hidden">Monitor with API calls</div>
    </div>



### Try using your fine-tuned model

Evaluate your newly optimized model by using it! When the fine-tuned model finishes training, use its ID in either the [Responses](https://developers.openai.com/api/docs/api-reference/responses) or [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat) API, just as you would an OpenAI base model.



<div data-content-switcher-pane data-value="ui">
    <div class="hidden">Use your model in the Playground</div>
    </div>
  <div data-content-switcher-pane data-value="api" hidden>
    <div class="hidden">Use your model with an API call</div>
    </div>



### Use checkpoints if needed

Checkpoints are models you can use. We create a full model checkpoint for you at the end of each training epoch. They're useful in cases where your fine-tuned model improves early on but then memorizes the dataset instead of learning generalizable knowledge—called \_overfitting. Checkpoints provide versions of your customized model from various moments in the process.



<div data-content-switcher-pane data-value="ui">
    <div class="hidden">Find checkpoints in the dashboard</div>
    </div>
  <div data-content-switcher-pane data-value="api" hidden>
    <div class="hidden">Query the API for checkpoints</div>
    </div>



Currently, only the checkpoints for the last three epochs of the job are saved and available for use.

## Safety checks

Before launching in production, review and follow the following safety information.

How we assess for safety

Once a fine-tuning job is completed, we assess the resulting model’s behavior across 13 distinct safety categories. Each category represents a critical area where AI outputs could potentially cause harm if not properly controlled.

| Name                   | Description                                                                                                                                                                                                                                    |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| advice                 | Advice or guidance that violates our policies.                                                                                                                                                                                                 |
| harassment/threatening | Harassment content that also includes violence or serious harm towards any target.                                                                                                                                                             |
| hate                   | Content that expresses, incites, or promotes hate based on race, gender, ethnicity, religion, nationality, sexual orientation, disability status, or caste. Hateful content aimed at non-protected groups (e.g., chess players) is harassment. |
| hate/threatening       | Hateful content that also includes violence or serious harm towards the targeted group based on race, gender, ethnicity, religion, nationality, sexual orientation, disability status, or caste.                                               |
| highly-sensitive       | Highly sensitive data that violates our policies.                                                                                                                                                                                              |
| illicit                | Content that gives advice or instruction on how to commit illicit acts. A phrase like "how to shoplift" would fit this category.                                                                                                               |
| propaganda             | Praise or assistance for ideology that violates our policies.                                                                                                                                                                                  |
| self-harm/instructions | Content that encourages performing acts of self-harm, such as suicide, cutting, and eating disorders, or that gives instructions or advice on how to commit such acts.                                                                         |
| self-harm/intent       | Content where the speaker expresses that they are engaging or intend to engage in acts of self-harm, such as suicide, cutting, and eating disorders.                                                                                           |
| sensitive              | Sensitive data that violates our policies.                                                                                                                                                                                                     |
| sexual/minors          | Sexual content that includes an individual who is under 18 years old.                                                                                                                                                                          |
| sexual                 | Content meant to arouse sexual excitement, such as the description of sexual activity, or that promotes sexual services (excluding sex education and wellness).                                                                                |
| violence               | Content that depicts death, violence, or physical injury.                                                                                                                                                                                      |

Each category has a predefined pass threshold; if too many evaluated examples in a given category fail, OpenAI blocks the fine-tuned model from deployment. If your fine-tuned model does not pass the safety checks, OpenAI sends a message in the fine-tuning job explaining which categories don't meet the required thresholds. You can view the results in the moderation checks section of the fine-tuning job.

How to pass safety checks

In addition to reviewing any failed safety checks in the fine-tuning job object, you can retrieve details about which categories failed by querying the [fine-tuning API events endpoint](https://developers.openai.com/api/docs/api-reference/fine-tuning/list-events). Look for events of type `moderation_checks` for details about category results and enforcement. This information can help you narrow down which categories to target for retraining and improvement. The [model spec](https://cdn.openai.com/spec/model-spec-2024-05-08.html#overview) has rules and examples that can help identify areas for additional training data.

While these evaluations cover a broad range of safety categories, conduct your own evaluations of the fine-tuned model to ensure it's appropriate for your use case.

## Next steps

Now that you know the basics of supervised fine-tuning, explore these other methods as well.

[

<span slot="icon">
      </span>
    Learn to fine-tune for computer vision with image inputs.

](https://developers.openai.com/api/docs/guides/vision-fine-tuning)

[

<span slot="icon">
      </span>
    Fine-tune a model using direct preference optimization (DPO).

](https://developers.openai.com/api/docs/guides/direct-preference-optimization)

[

<span slot="icon">
      </span>
    Fine-tune a reasoning model by grading its outputs.

](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)
``````
:::
:::

