---
status: needs-review
sourceId: "02f090f050c5"
sourceChecksum: "02f090f050c5ed117a3cd0244d021719245c70d4a4cfe4713ccbab1395c9bba6"
sourceUrl: "https://developers.openai.com/api/docs/guides/direct-preference-optimization"
translatedAt: "2026-06-27T17:29:03.6672446+08:00"
translator: codex-gpt-5.5-xhigh
---

# Direct preference optimization 直接偏好优化

[Direct Preference Optimization](https://arxiv.org/abs/2305.18290) (DPO) fine-tuning 允许你基于 prompt 和成对 response 来 fine-tune 模型。这种方法使模型能够从更主观的人类偏好中学习，优化出更可能被偏好的输出。DPO 目前仅支持文本输入和输出。

OpenAI 正在逐步关闭 fine-tuning platform。该平台不再向新用户开放，但 fine-tuning platform 的现有用户仍可在接下来数月内创建 training job。
  <br />
  所有 fine-tuned model 都将继续可用于推理，直到其 base model 被[弃用](https://developers.openai.com/api/docs/deprecations)。完整时间线见[此处](https://developers.openai.com/api/docs/deprecations)。

<br />

<table>
<tbody>
<tr>
<th>工作方式</th>
<th>最适合</th>
<th>搭配使用</th>
</tr>

<tr>
<td>
为一个 prompt 同时提供正确和不正确的示例 response。标明正确 response，帮助模型表现得更好。
</td>
<td>
- 总结文本，聚焦正确的重点
- 生成具备正确语气和风格的 chat message
</td>
<td>
`gpt-4.1-2025-04-14`
`gpt-4.1-mini-2025-04-14`
`gpt-4.1-nano-2025-04-14`
</td>
</tr>
</tbody>
</table>

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

上传训练数据并使用通过 DPO fine-tuned 的模型，遵循[这里描述的相同流程](https://developers.openai.com/api/docs/guides/model-optimization)。

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

目前，OpenAI 提供 [supervised fine-tuning (SFT)](https://developers.openai.com/api/docs/guides/supervised-fine-tuning) 作为 fine-tuning job 的默认方法。先对你的 preferred response（或其子集）执行 SFT，然后再运行另一个 DPO job，可以显著增强模型对齐和性能。通过先在期望 response 上 fine-tune 模型，它可以更好地识别正确模式，为 DPO 进一步优化行为提供坚实基础。

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

<span slot="icon">
      </span>
    通过为样本输入提供正确输出来 fine-tune 模型。

](https://developers.openai.com/api/docs/guides/supervised-fine-tuning)

[

<span slot="icon">
      </span>
    学习如何基于图像输入为计算机视觉进行 fine-tune。

](https://developers.openai.com/api/docs/guides/vision-fine-tuning)

[

<span slot="icon">
      </span>
    通过为推理模型输出评分来 fine-tune 推理模型。

](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)
