---
title: "Direct preference optimization 直接偏好优化"
description: "Fine-tune models for subjective decision-making by comparing model outputs."
outline: deep
---

# Direct preference optimization 直接偏好优化

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/direct-preference-optimization](https://developers.openai.com/api/docs/guides/direct-preference-optimization)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/direct-preference-optimization.md](https://developers.openai.com/api/docs/guides/direct-preference-optimization.md)
- 抓取时间：2026-06-27T05:54:01.364Z
- Checksum：`02f090f050c5ed117a3cd0244d021719245c70d4a4cfe4713ccbab1395c9bba6`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
[Direct Preference Optimization](https://arxiv.org/abs/2305.18290) (DPO) fine-tuning 允许你基于 prompt 和成对 response 来 fine-tune 模型。这种方法使模型能够从更主观的人类偏好中学习，优化出更可能被偏好的输出。DPO 目前仅支持文本输入和输出。

OpenAI 正在逐步关闭 fine-tuning platform。该平台不再向新用户开放，但 fine-tuning platform 的现有用户仍可在接下来数月内创建 training job。

  所有 fine-tuned model 都将继续可用于推理，直到其 base model 被[弃用](/mirror/api/docs/deprecations)。完整时间线见[此处](/mirror/api/docs/deprecations)。






工作方式
最适合
搭配使用




为一个 prompt 同时提供正确和不正确的示例 response。标明正确 response，帮助模型表现得更好。


- 总结文本，聚焦正确的重点
- 生成具备正确语气和风格的 chat message


`gpt-4.1-2025-04-14`
`gpt-4.1-mini-2025-04-14`
`gpt-4.1-nano-2025-04-14`





## 数据格式

dataset 中的每个 example 都应包含：

- 一个 prompt，例如一条用户消息。
- 一个 preferred output（理想的 assistant response）。
- 一个 non-preferred output（欠佳的 assistant response）。

数据应采用 JSONL format，其中每一行都按以下结构[表示一个 example](https://developers.openai.com/api/docs/api-reference/fine-tuning/preference-input)：

```json
{
  "input": {
    "messages": [
      {
        "role": "user",
        "content": "Hello, can you tell me how cold San Francisco is today?"
      }
    ],
    "tools": [],
    "parallel_tool_calls": true
  },
  "preferred_output": [
    {
      "role": "assistant",
      "content": "Today in San Francisco, it is not quite cold as expected. Morning clouds will give away to sunshine, with a high near 68°F (20°C) and a low around 57°F (14°C)."
    }
  ],
  "non_preferred_output": [
    {
      "role": "assistant",
      "content": "It is not particularly cold in San Francisco today."
    }
  ]
}
```

目前，我们只基于每个 example 的单轮对话进行训练，其中 preferred 和 non-preferred message 必须是最后一条 assistant message。

## 创建 DPO fine-tune job

上传训练数据并使用通过 DPO fine-tuned 的模型，遵循[这里描述的相同流程](/mirror/api/docs/guides/model-optimization)。

要创建 DPO fine-tune job，请使用 [fine-tuning job creation endpoint](https://developers.openai.com/api/docs/api-reference/fine-tuning/create) 中的 `method` 字段；你可以在其中指定 `type` 以及任何相关的 `hyperparameters`。对于 DPO：

- 将 `type` 参数设置为 `dpo`
- 可选地设置 `hyperparameters` 属性，加入你想配置的任何选项。

`beta` hyperparameter 是一个只适用于 DPO 的新选项。它是 `0` 到 `2` 之间的浮点数，用来控制新模型在多大程度上严格遵循先前行为，而不是与所提供的偏好对齐。较高的数值会更保守（偏向先前行为），较低的数值会更激进（更常偏向新提供的偏好）。

你也可以将该值设置为 `auto`（默认值），以使用平台配置的值。

下面的示例展示了如何使用 OpenAI SDK 配置 DPO fine-tuning job。

使用 DPO 创建 fine-tuning job

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const job = await openai.fineTuning.jobs.create({
  training_file: "file-all-about-the-weather",
  model: "gpt-4o-2024-08-06",
  method: {
    type: "dpo",
    dpo: {
      hyperparameters: { beta: 0.1 },
    },
  },
});
```

```python
from openai import OpenAI

client = OpenAI()

job = client.fine_tuning.jobs.create(
    training_file="file-all-about-the-weather",
    model="gpt-4o-2024-08-06",
    method={
        "type": "dpo",
        "dpo": {
            "hyperparameters": {"beta": 0.1},
        },
    },
)
```


## 将 SFT 与 DPO 结合使用

目前，OpenAI 提供 [supervised fine-tuning (SFT)](/mirror/api/docs/guides/supervised-fine-tuning) 作为 fine-tuning job 的默认方法。先对你的 preferred response（或其子集）执行 SFT，然后再运行另一个 DPO job，可以显著增强模型对齐和性能。通过先在期望 response 上 fine-tune 模型，它可以更好地识别正确模式，为 DPO 进一步优化行为提供坚实基础。

推荐工作流如下：

1. 使用 SFT 基于你的 preferred response 子集 fine-tune base model。重点确保数据质量以及对任务的代表性。
2. 将 SFT fine-tuned model 作为起点，并应用 DPO 基于偏好比较来调整模型。

## 安全检查

在投入生产前，请查看并遵循以下安全信息。

我们如何评估安全性

fine-tuning job 完成后，我们会在 13 个不同的安全类别上评估所得模型的行为。每个类别都代表一个关键领域，如果 AI 输出未得到适当控制，可能会在该领域造成伤害。

| 名称                  | 描述                                                                                                                                                                                                                                 |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| advice                | 违反我们政策的建议或指导。                                                                                                                                                                                                           |
| harassment/threatening | 还包含针对任何目标的暴力或严重伤害的 harassment 内容。                                                                                                                                                                                |
| hate                  | 基于种族、性别、民族、宗教、国籍、性取向、残障状态或 caste 表达、煽动或宣扬仇恨的内容。针对非受保护群体（例如 chess players）的仇恨内容属于 harassment。                                                                             |
| hate/threatening      | 还包含基于种族、性别、民族、宗教、国籍、性取向、残障状态或 caste 对目标群体实施暴力或严重伤害的仇恨内容。                                                                                                                          |
| highly-sensitive      | 违反我们政策的高度敏感数据。                                                                                                                                                                                                         |
| illicit               | 就如何实施非法行为给出建议或说明的内容。像 "how to shoplift" 这样的短语会符合此类别。                                                                                                                                                |
| propaganda            | 对违反我们政策的意识形态的赞扬或协助。                                                                                                                                                                                               |
| self-harm/instructions | 鼓励执行自我伤害行为（例如自杀、自残和饮食障碍），或提供如何实施此类行为的说明或建议的内容。                                                                                                                                          |
| self-harm/intent      | 说话者表示他们正在或打算实施自我伤害行为（例如自杀、自残和饮食障碍）的内容。                                                                                                                                                         |
| sensitive             | 违反我们政策的敏感数据。                                                                                                                                                                                                             |
| sexual/minors         | 包含未满 18 岁个人的 sexual 内容。                                                                                                                                                                                                   |
| sexual                | 旨在引起性兴奋的内容，例如对性活动的描述，或推广性服务的内容（不包括性教育和健康）。                                                                                                                                                 |
| violence              | 描绘死亡、暴力或身体伤害的内容。                                                                                                                                                                                                     |

每个类别都有预定义的通过阈值；如果某个类别中失败的被评估 example 过多，OpenAI 会阻止 fine-tuned model 部署。如果你的 fine-tuned model 未通过安全检查，OpenAI 会在 fine-tuning job 中发送消息，说明哪些类别未达到所需阈值。你可以在 fine-tuning job 的 moderation checks 部分查看结果。

如何通过安全检查

除了查看 fine-tuning job object 中任何失败的安全检查外，你还可以通过查询 [fine-tuning API events endpoint](https://platform.openai.com/docs/api-reference/fine-tuning/list-events) 获取哪些类别失败的详细信息。查找 `moderation_checks` 类型的 event，以了解类别结果和执行情况。这些信息可以帮助你缩小需要重新训练和改进的目标类别范围。[model spec](https://cdn.openai.com/spec/model-spec-2024-05-08.html#overview) 包含规则和示例，可帮助识别需要额外训练数据的领域。

虽然这些评估覆盖了广泛的安全类别，你仍应自行评估 fine-tuned model，确保它适合你的用例。

## 后续步骤

现在你已经了解 DPO 的基础知识，也可以探索这些其他方法。

[



    通过为样本输入提供正确输出来 fine-tune 模型。

](https://developers.openai.com/api/docs/guides/supervised-fine-tuning)

[



    学习如何基于图像输入为计算机视觉进行 fine-tune。

](https://developers.openai.com/api/docs/guides/vision-fine-tuning)

[



    通过为推理模型输出评分来 fine-tune 推理模型。

](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
[Direct Preference Optimization](https://arxiv.org/abs/2305.18290) (DPO) fine-tuning allows you to fine-tune models based on prompts and pairs of responses. This approach enables the model to learn from more subjective human preferences, optimizing for outputs that are more likely to be favored. DPO is currently only supported for text inputs and outputs.

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
Provide both a correct and incorrect example response for a prompt. Indicate the correct response to help the model perform better.
</td>
<td>
- Summarizing text, focusing on the right things
- Generating chat messages with the right tone and style
</td>
<td>
`gpt-4.1-2025-04-14`
`gpt-4.1-mini-2025-04-14`
`gpt-4.1-nano-2025-04-14`
</td>
</tr>
</tbody>
</table>

## Data format

Each example in your dataset should contain:

- A prompt, like a user message.
- A preferred output (an ideal assistant response).
- A non-preferred output (a suboptimal assistant response).

The data should be formatted in JSONL format, with each line [representing an example](https://developers.openai.com/api/docs/api-reference/fine-tuning/preference-input) in the following structure:

```json
{
  "input": {
    "messages": [
      {
        "role": "user",
        "content": "Hello, can you tell me how cold San Francisco is today?"
      }
    ],
    "tools": [],
    "parallel_tool_calls": true
  },
  "preferred_output": [
    {
      "role": "assistant",
      "content": "Today in San Francisco, it is not quite cold as expected. Morning clouds will give away to sunshine, with a high near 68°F (20°C) and a low around 57°F (14°C)."
    }
  ],
  "non_preferred_output": [
    {
      "role": "assistant",
      "content": "It is not particularly cold in San Francisco today."
    }
  ]
}
```

Currently, we only train on one-turn conversations for each example, where the preferred and non-preferred messages need to be the last assistant message.

## Create a DPO fine-tune job

Uploading training data and using a model fine-tuned with DPO follows the [same flow described here](https://developers.openai.com/api/docs/guides/model-optimization).

To create a DPO fine-tune job, use the `method` field in the [fine-tuning job creation endpoint](https://developers.openai.com/api/docs/api-reference/fine-tuning/create), where you can specify `type` as well as any associated `hyperparameters`. For DPO:

- set the `type` parameter to `dpo`
- optionally set the `hyperparameters` property with any options you'd like to configure.

The `beta` hyperparameter is a new option that is only available for DPO. It's a floating point number between `0` and `2` that controls how strictly the new model will adhere to its previous behavior, versus aligning with the provided preferences. A high number will be more conservative (favoring previous behavior), and a lower number will be more aggressive (favor the newly provided preferences more often).

You can also set this value to `auto` (the default) to use a value configured by the platform.

The example below shows how to configure a DPO fine-tuning job using the OpenAI SDK.

Create a fine-tuning job with DPO

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const job = await openai.fineTuning.jobs.create({
  training_file: "file-all-about-the-weather",
  model: "gpt-4o-2024-08-06",
  method: {
    type: "dpo",
    dpo: {
      hyperparameters: { beta: 0.1 },
    },
  },
});
```

```python
from openai import OpenAI

client = OpenAI()

job = client.fine_tuning.jobs.create(
    training_file="file-all-about-the-weather",
    model="gpt-4o-2024-08-06",
    method={
        "type": "dpo",
        "dpo": {
            "hyperparameters": {"beta": 0.1},
        },
    },
)
```


## Use SFT and DPO together

Currently, OpenAI offers [supervised fine-tuning (SFT)](https://developers.openai.com/api/docs/guides/supervised-fine-tuning) as the default method for fine-tuning jobs. Performing SFT on your preferred responses (or a subset) before running another DPO job afterwards can significantly enhance model alignment and performance. By first fine-tuning the model on the desired responses, it can better identify correct patterns, providing a strong foundation for DPO to refine behavior.

A recommended workflow is as follows:

1. Fine-tune the base model with SFT using a subset of your preferred responses. Focus on ensuring the data quality and representativeness of the tasks.
2. Use the SFT fine-tuned model as the starting point, and apply DPO to adjust the model based on preference comparisons.

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

In addition to reviewing any failed safety checks in the fine-tuning job object, you can retrieve details about which categories failed by querying the [fine-tuning API events endpoint](https://platform.openai.com/docs/api-reference/fine-tuning/list-events). Look for events of type `moderation_checks` for details about category results and enforcement. This information can help you narrow down which categories to target for retraining and improvement. The [model spec](https://cdn.openai.com/spec/model-spec-2024-05-08.html#overview) has rules and examples that can help identify areas for additional training data.

While these evaluations cover a broad range of safety categories, conduct your own evaluations of the fine-tuned model to ensure it's appropriate for your use case.

## Next steps

Now that you know the basics of DPO, explore these other methods as well.

[

<span slot="icon">
      </span>
    Fine-tune a model by providing correct outputs for sample inputs.

](https://developers.openai.com/api/docs/guides/supervised-fine-tuning)

[

<span slot="icon">
      </span>
    Learn to fine-tune for computer vision with image inputs.

](https://developers.openai.com/api/docs/guides/vision-fine-tuning)

[

<span slot="icon">
      </span>
    Fine-tune a reasoning model by grading its outputs.

](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)
``````
:::
:::

