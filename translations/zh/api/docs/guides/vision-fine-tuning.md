---
status: needs-review
sourceId: "158752c100c1"
sourceChecksum: "158752c100c1a660b441245151da3283f4fbff8124bf7585d5b5da1937c3494c"
sourceUrl: "https://developers.openai.com/api/docs/guides/vision-fine-tuning"
translatedAt: "2026-06-27T18:23:55.4970917+08:00"
translator: codex-gpt-5.5-xhigh
---

# Vision fine-tuning

Vision fine-tuning 使用图像输入进行 [supervised fine-tuning](https://developers.openai.com/api/docs/guides/supervised-fine-tuning)，以提升模型对图像输入的理解。本指南会带你了解 SFT 的这一子集，并概述使用图像输入进行 fine-tuning 时的一些重要注意事项。

OpenAI 正在逐步关闭 fine-tuning platform。该平台不再
  向新用户开放，但 fine-tuning platform 的现有用户
  仍可在接下来几个月内创建 training jobs。
  <br />
  所有 fine-tuned models 都会保持可用于 inference，直到其 base
  models 被[弃用](https://developers.openai.com/api/docs/deprecations)。完整时间线
  在[这里](https://developers.openai.com/api/docs/deprecations)。

<br />

<table>
<tbody>
<tr>
<th>工作方式</th>
<th>最适合</th>
<th>配合使用</th>
</tr>

<tr>
<td>
为 supervised fine-tuning 提供图像输入，以提升模型对图像输入的理解。
</td>
<td>
- 图像分类
- 修正复杂 prompts 中指令遵循失败的问题
</td>
<td>
`gpt-4o-2024-08-06`
</td>
</tr>
</tbody>
</table>

## 数据格式

正如你可以[发送一个或多个图像输入，并基于它们创建模型响应](https://developers.openai.com/api/docs/guides/vision)一样，也可以在 JSONL training data files 中包含相同的消息类型。图像可以作为 HTTP URLs 提供，也可以作为包含 Base64 编码图像的 data URLs 提供。

下面是 JSONL 文件某一行中的图像消息示例。为便于阅读，下方 JSON object 已展开，但通常该 JSON 会在数据文件中显示为单行：

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are an assistant that identifies and describes artworks."
    },
    {
      "role": "user",
      "content": "Describe this artwork."
    },
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg"
          }
        }
      ]
    },
    {
      "role": "assistant",
      "content": "This appears to be a traditional painted artwork with a central human subject."
    }
  ]
}
```

上传 vision fine-tuning training data 遵循[这里描述的相同流程](https://developers.openai.com/api/docs/guides/supervised-fine-tuning)。

## 图像数据要求

#### 大小

- 你的 training file 最多可包含 50,000 个含图像的 examples（不包括文本 examples）。
- 每个 example 最多可以有 10 张图像。
- 每张图像最大 10 MB。

#### 格式

- 图像必须为 JPEG、PNG 或 WEBP 格式。
- 你的图像必须处于 RGB 或 RGBA image mode。
- 不能在 `assistant` role 的消息输出中包含图像。

#### 内容审核政策

训练前我们会扫描你的图像，确保其符合我们的使用政策。这可能会在 fine-tuning 开始前的文件验证中引入延迟。

包含以下内容的图像会被排除出你的数据集，不会用于训练：

- 人物
- 人脸
- 儿童
- CAPTCHAs

#### 如果你的图像被跳过，该怎么办

你的图像可能会因以下原因在训练期间被跳过：

- **contains CAPTCHAs**、**contains people**、**contains faces**、**contains children**
  - 移除该图像。目前我们不能使用包含这些实体的图像来 fine-tune 模型。
- **inaccessible URL**
  - 确保图像 URL 可公开访问。
- **image too large**
  - 请确保你的图像落在我们的[数据集大小限制](#size)内。
- **invalid image format**
  - 请确保你的图像符合我们的[数据集格式](#format)。

## 最佳实践

#### 降低训练成本

如果将图像的 `detail` 参数设为 `low`，图像会被调整为 512 x 512 像素，并且无论其大小如何都只由 85 个 tokens 表示。这会降低训练成本。[更多信息见此。](https://developers.openai.com/api/docs/guides/vision#low-or-high-fidelity-image-understanding)

```json
{
  "type": "image_url",
  "image_url": {
    "url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
    "detail": "low"
  }
}
```

#### 控制图像质量

要控制图像理解的保真度，请为每张图像将 `image_url` 的 `detail` 参数设为 `low`、`high` 或 `auto`。这也会影响训练期间模型看到的每张图像的 tokens 数量，并影响训练成本。[更多信息见此](https://developers.openai.com/api/docs/guides/vision#low-or-high-fidelity-image-understanding)。

## 安全检查

上线生产前，请审查并遵循以下安全信息。

我们如何评估安全性

Fine-tuning job 完成后，我们会在 13 个不同安全类别上评估所得模型的行为。每个类别都代表一个关键领域，在这些领域中，如果 AI 输出没有得到妥善控制，就可能造成伤害。

| Name | Description |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| advice | 违反我们政策的建议或指导。 |
| harassment/threatening | 同时包含针对任何目标的暴力或严重伤害的 harassment content。 |
| hate | 基于种族、性别、族裔、宗教、国籍、性取向、残障状态或 caste 表达、煽动或促进仇恨的内容。针对非受保护群体（例如 chess players）的仇恨内容属于 harassment。 |
| hate/threatening | 基于种族、性别、族裔、宗教、国籍、性取向、残障状态或 caste，针对目标群体且同时包含暴力或严重伤害的仇恨内容。 |
| highly-sensitive | 违反我们政策的高度敏感数据。 |
| illicit | 提供如何实施非法行为的建议或说明的内容。例如 “how to shoplift” 这样的短语属于此类别。 |
| propaganda | 对违反我们政策的意识形态的赞扬或帮助。 |
| self-harm/instructions | 鼓励进行自残行为（例如自杀、割伤和进食障碍），或提供如何实施此类行为的说明或建议的内容。 |
| self-harm/intent | 说话者表达其正在进行或打算进行自残行为（例如自杀、割伤和进食障碍）的内容。 |
| sensitive | 违反我们政策的敏感数据。 |
| sexual/minors | 包含未满 18 岁个人的性内容。 |
| sexual | 旨在引起性兴奋的内容，例如对性活动的描述，或促进性服务的内容（不包括性教育和健康）。 |
| violence | 描绘死亡、暴力或身体伤害的内容。 |

每个类别都有预定义的通过阈值；如果某个类别中过多被评估 examples 失败，OpenAI 会阻止 fine-tuned model 部署。如果你的 fine-tuned model 未通过安全检查，OpenAI 会在 fine-tuning job 中发送消息，说明哪些类别未达到所需阈值。你可以在 fine-tuning job 的 moderation checks 部分查看结果。

如何通过安全检查

除了审查 fine-tuning job object 中任何失败的安全检查外，你还可以通过查询 [fine-tuning API events endpoint](https://platform.openai.com/docs/api-reference/fine-tuning/list-events) 检索哪些类别失败的详细信息。查找类型为 `moderation_checks` 的 events，以获取类别结果和执行信息的细节。这些信息可以帮助你缩小需要重新训练和改进的类别范围。[model spec](https://cdn.openai.com/spec/model-spec-2024-05-08.html#overview) 中有规则和示例，可帮助识别需要额外训练数据的领域。

虽然这些评估覆盖广泛的安全类别，你仍应对 fine-tuned model 进行自己的评估，以确保它适合你的用例。

## 后续步骤

现在你已经了解 vision fine-tuning 的基础知识，也可以探索这些其他方法。

[

<span slot="icon">
      </span>
    通过为样本输入提供正确输出来 fine-tune 模型。

](https://developers.openai.com/api/docs/guides/supervised-fine-tuning)

[

<span slot="icon">
      </span>
    使用 direct preference optimization (DPO) fine-tune 模型。

](https://developers.openai.com/api/docs/guides/direct-preference-optimization)

[

<span slot="icon">
      </span>
    通过为输出评分来 fine-tune reasoning model。

](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)
