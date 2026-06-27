---
status: needs-review
sourceId: "16ba9978f371"
sourceChecksum: "16ba9978f3710af7c98b6a41dea3fef6fba2acb41da1c9b17ec1e709307edf64"
sourceUrl: "https://developers.openai.com/api/docs/guides/supervised-fine-tuning"
translatedAt: "2026-06-27T10:24:24.269Z"
translator: codex-gpt-5.5-xhigh
---

# 监督式微调

监督式微调（SFT）让你可以使用特定用例的示例训练 OpenAI 模型。结果是一个定制模型，能够更可靠地产生你想要的风格和内容。

OpenAI 正在逐步停止 fine-tuning platform。该平台已不再向新用户开放，但 fine-tuning platform 的现有用户在未来几个月内仍可创建 training jobs。
  <br />
  所有 fine-tuned models 都将在其 base models 被[弃用](https://developers.openai.com/api/docs/deprecations)之前继续可用于推理。完整时间线在
  [这里](https://developers.openai.com/api/docs/deprecations)。

<br />

<table>
<tbody>
<tr>
<th>工作原理</th>
<th>最适合</th>
<th>搭配使用</th>
</tr>

<tr>
<td>
提供 prompt 的正确响应示例，以引导模型行为。

通常使用人工生成的 "ground truth" 响应来向模型展示它应该如何回应。

</td>
<td>
- 分类
- 细微差别较多的翻译
- 以特定格式生成内容
- 修正指令遵循失败
</td>
<td>
`gpt-4.1-2025-04-14`
`gpt-4.1-mini-2025-04-14`
`gpt-4.1-nano-2025-04-14`
</td>
</tr>

</tbody>
</table>

## 概览

监督式微调有四个主要部分：

1. 构建训练数据集，用来定义什么是“好”
1. 上传包含示例 prompts 和期望模型输出的训练数据集
1. 使用你的训练数据为 base model 创建 fine-tuning job
1. 使用 fine-tuned model 评估结果

**先做好 evals！** 只有在设置 evals 之后才投入 fine-tuning。
  你需要一种可靠的方法来判断 fine-tuned model 是否比 base model 表现更好。
  <br />
  [设置 evals →](https://developers.openai.com/api/docs/guides/evals)

## 构建你的数据集

构建一个稳健、有代表性的数据集，以便从 fine-tuned model 获得有用结果。使用以下技巧和注意事项。

### 示例数量要合适

- 可用于 fine-tuning 的最少示例数是 10
- 我们看到，在 50-100 个示例上 fine-tuning 会带来改进，但适合你的数量差异很大，并取决于用例
- 我们建议从 50 个精心构建的 demonstrations 开始，并[评估结果](https://developers.openai.com/api/docs/guides/evals)

如果 50 个优质示例能提升性能，可以尝试添加更多示例来观察进一步结果。如果 50 个示例没有影响，请在添加训练数据前重新思考你的任务或 prompt。

### 什么样的示例才是好示例

- 尽可能贴近你在应用中预期出现的任何 prompts 和 outputs
- 具体、清晰的问题和答案
- 使用历史数据、专家数据、日志数据，或[其他类型的已收集数据](https://developers.openai.com/api/docs/guides/evals)

### 格式化你的数据

- 使用 [JSONL format](https://jsonlines.org/)，训练数据文件的每一行都是一个完整 JSON 结构
- 使用 [chat completions format](https://developers.openai.com/api/docs/api-reference/fine-tuning/chat-input)
- 你的文件必须至少有 10 行



<div data-content-switcher-pane data-value="jsonl">
    <div class="hidden">JSONL format 示例文件</div>
    </div>
  <div data-content-switcher-pane data-value="json" hidden>
    <div class="hidden">对应的 JSON 数据</div>
    </div>



### 从更大模型蒸馏

为较小模型构建训练数据集的一种方法，是蒸馏大型模型的结果，为监督式微调创建训练数据。这种技术的一般流程是：

- 为较大模型（例如 `gpt-4.1`）调优 prompt，直到它在你的 eval 标准下获得出色表现。
- 使用任何方便的技术捕获模型生成的结果。请注意，[Responses API](https://developers.openai.com/api/docs/api-reference/responses) 默认存储模型响应 30 天。
- 使用符合你标准的大模型捕获响应，并借助上面描述的工具和技术生成数据集。
- 使用你从大模型创建的数据集调优较小模型（例如 `gpt-4.1-mini`）。

这种技术可以让你训练一个小模型，使它在特定任务上表现得类似于更大、更昂贵的模型。

## 上传训练数据

将你的示例数据集上传到 OpenAI。我们会用它更新模型权重，并生成类似于你数据中所包含内容的输出。

除了文本补全之外，你还可以训练模型更有效地生成[结构化 JSON 输出](https://developers.openai.com/api/docs/guides/structured-outputs)或[函数调用](https://developers.openai.com/api/docs/guides/function-calling)。



<div data-content-switcher-pane data-value="ui">
    <div class="hidden">通过点击按钮上传你的数据</div>
    </div>
  <div data-content-switcher-pane data-value="api" hidden>
    <div class="hidden">调用 API 上传你的数据</div>
    </div>



## 创建 fine-tuning job

上传测试数据后，[创建 fine-tuning job](https://developers.openai.com/api/docs/api-reference/fine-tuning/create)，使用你提供的训练数据定制 base model。创建 fine-tuning job 时，你必须指定：

- 用于 fine-tuning 的 base model（`model`）。它可以是 OpenAI model ID，也可以是先前 fine-tuned model 的 ID。请在[模型文档](https://developers.openai.com/api/docs/models)中查看哪些模型支持 fine-tuning。
- training file（`training_file`）ID。这是你在上一步上传的文件。
- fine-tuning method（`method`）。它指定你想用哪种 fine-tuning method 定制模型。监督式微调是默认值。



<div data-content-switcher-pane data-value="ui">
    <div class="hidden">通过点击按钮上传你的数据</div>
    </div>
  <div data-content-switcher-pane data-value="api" hidden>
    <div class="hidden">调用 API 上传你的数据</div>
    </div>



## 评估结果

使用下面的方法检查 fine-tuned model 的表现。根据需要调整 prompts、数据和 fine-tuning job，直到得到你想要的结果。fine-tuning 的最佳方式是持续迭代。

### 与 evals 对比

若要查看 fine-tuned model 是否比原始 base model 表现更好，请[使用 evals](https://developers.openai.com/api/docs/guides/evals)。在运行 fine-tuning job 前，从第 1 步收集的同一训练数据集中划出一部分数据。使用这部分 holdout data 进行 evals 时，它会作为对照组。请确保训练数据和 holdout data 在用户输入类型和模型响应方面具有大致相同的多样性。

[了解更多关于运行 evals 的信息](https://developers.openai.com/api/docs/guides/evals)。

### 监控状态

在 dashboard 中检查 fine-tuning job 的状态，或通过 API 轮询 job ID。



<div data-content-switcher-pane data-value="ui">
    <div class="hidden">在 UI 中监控</div>
    </div>
  <div data-content-switcher-pane data-value="api" hidden>
    <div class="hidden">使用 API calls 监控</div>
    </div>



### 尝试使用你的 fine-tuned model

通过实际使用新优化的模型来评估它！当 fine-tuned model 完成训练后，可以在 [Responses](https://developers.openai.com/api/docs/api-reference/responses) 或 [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat) API 中使用它的 ID，就像使用 OpenAI base model 一样。



<div data-content-switcher-pane data-value="ui">
    <div class="hidden">在 Playground 中使用你的模型</div>
    </div>
  <div data-content-switcher-pane data-value="api" hidden>
    <div class="hidden">通过 API call 使用你的模型</div>
    </div>



### 需要时使用 checkpoints

Checkpoints 是你可以使用的模型。我们会在每个训练 epoch 结束时为你创建完整模型 checkpoint。在 fine-tuned model 早期有所改进、但随后记住数据集而不是学习可泛化知识（称为 \_overfitting）的情况下，它们很有用。Checkpoints 提供定制模型在流程不同时间点的版本。



<div data-content-switcher-pane data-value="ui">
    <div class="hidden">在 dashboard 中查找 checkpoints</div>
    </div>
  <div data-content-switcher-pane data-value="api" hidden>
    <div class="hidden">查询 API 获取 checkpoints</div>
    </div>



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

<span slot="icon">
      </span>
    学习使用图像输入进行计算机视觉 fine-tuning。

](https://developers.openai.com/api/docs/guides/vision-fine-tuning)

[

<span slot="icon">
      </span>
    使用 direct preference optimization (DPO) 微调模型。

](https://developers.openai.com/api/docs/guides/direct-preference-optimization)

[

<span slot="icon">
      </span>
    通过为输出评分来微调 reasoning model。

](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)
