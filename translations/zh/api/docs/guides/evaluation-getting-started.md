---
status: needs-review
sourceId: "9c8bda87e9a6"
sourceChecksum: "9c8bda87e9a6b81314dd56738f544df2705f5ead7638ff75d9ac20b386e9fa3c"
sourceUrl: "https://developers.openai.com/api/docs/guides/evaluation-getting-started"
translatedAt: "2026-06-27T17:44:20.0905341+08:00"
translator: codex-gpt-5.5-xhigh
---

# 数据集入门

Evaluations（通常称为 **evals**）会测试模型输出，确保它们符合你指定的风格和内容标准。编写 evals 是构建可靠应用的重要组成部分。[Datasets](https://platform.openai.com/evaluation/datasets) 是 OpenAI platform 的一项功能，可让你快速开始使用 evals 并测试 prompts。

OpenAI 正在弃用 Evals platform。现有 evals 内容会在过渡窗口期间继续可用。对于现有用户，Evals 将在 2026 年 10 月 31 日变为只读，并计划于 2026 年 11 月 30 日关闭。请查看 [deprecations page](https://developers.openai.com/api/docs/deprecations#2026-06-03-evals-platform) 了解当前时间线。

如果你需要高级功能，例如对外部模型进行评估、希望通过 API 与 eval runs 交互，或希望更大规模地运行评估，请考虑改用 [Evals](https://developers.openai.com/api/docs/guides/evals)。

## 创建数据集

首先，在 dashboard 中创建数据集。

1. 在 [evaluation page](https://platform.openai.com/evaluation) 上，导航到 **Datasets** 标签页。
1. 点击右上角的 **Create** 按钮开始。
1. 在输入字段中为你的数据集添加名称。本指南中，我们将数据集命名为 “Investment memo generation."
1. 添加数据。要从头构建数据集，请点击 **Create**，并通过我们的可视化界面开始添加数据。如果你已经有保存的 prompt 或包含数据的 CSV，请上传它。

<video
  src="https://openaiassets.blob.core.windows.net/$web/platform-docs/evals/dataset-creation.mp4"
  controls
  style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }}
>
  你的浏览器不支持 video 标签。
</video>

我们建议将数据集用作动态空间，随着时间推移扩展你的评估数据集。当你发现需要监控的边缘案例或盲点时，请使用 dashboard 界面将它们添加进去。

### 上传 CSV

我们有一个简单的 CSV，其中包含公司名称，以及这些公司过去几个季度收入的实际值。

<video
  src="https://openaiassets.blob.core.windows.net/$web/platform-docs/evals/csv-upload.mp4"
  controls
  style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }}
>
  你的浏览器不支持 video 标签。
</video>

CSV 中的列可供你的 prompt 和 graders 访问。例如，我们的 CSV 包含输入列（`company`）以及供 graders 用作参考的 ground truth 列（`correct_revenue`、`correct_income`）。

### 使用可视化数据界面

打开数据集后，你可以在 **Data** 标签页中操作数据。点击单元格即可编辑其内容。添加一行可加入更多数据。你也可以在每行右侧边缘的溢出菜单中删除或复制行。

要保存更改，请点击右上角的 **Save** 按钮。

## 构建 prompt

datasets dashboard 中的标签页让多个 prompts 可以与同一份数据交互。

1. 要添加新的 prompt，请点击 **Add prompt**。

   Datasets 设计为与你的 OpenAI [prompts](https://developers.openai.com/api/docs/guides/prompt-engineering#reusable-prompts) 一起使用。如果你已经在 OpenAI platform 上保存了 prompt，你将能够从下拉菜单中选择它，并在此界面中进行更改。要保存 prompt 更改，请点击 **Save**。

   我们的 prompts 使用版本系统，因此你可以安全地进行更新。点击 **Save** 会创建 prompt 的新版本，你可以在 OpenAI platform 的任何位置引用或使用它。

1. 在 prompt 面板中，使用提供的字段和设置来控制 inference call：

- 点击右上角的滑块图标，以控制模型 [`temperature`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-temperature) 和 [`top_p`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-top_p)。
- 添加 tools，为你的 inference call 授予访问网页、使用 MCP 或完成其他 tool-call actions 的能力。
- 添加变量。prompt 和你的 [graders](#adding-graders) 都可以引用这些变量。
- 直接输入你的 system message，或点击铅笔图标，让模型根据你提供的基本说明帮你生成 prompt。

在我们的示例中，我们会添加 [web search](https://developers.openai.com/api/docs/guides/tools-web-search) tool，让模型调用可以从互联网拉取财务数据。在变量列表中，我们会添加 `company`，以便 prompt 可以引用数据集中的 company 列。对于 prompt，我们会通过告诉模型 “generate a financial report." 来生成一个 prompt。

## 生成并标注输出

设置好数据和 prompt 后，你就可以生成输出了。模型的输出会让你了解模型如何使用你提供的 prompt 和 tools 执行任务。然后你会标注这些输出，使模型能够随着时间推移提升表现。

<video
  src="https://openaiassets.blob.core.windows.net/$web/platform-docs/evals/generate-outputs-and-annotate.mp4"
  controls
  style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }}
>
  你的浏览器不支持 video 标签。
</video>

1. 在右上角，点击 **Generate output**。

   你会看到数据集中出现一个新的特殊 **output** 列，并开始填充结果。此列包含在数据集每一行上运行 prompt 后得到的结果。

1. 生成的输出准备好后，对它们进行标注。点击 **output**、**rating** 或 **output_feedback** 列，打开标注视图。

   你可以标注得少一些，也可以标注得多一些。Datasets 设计为适配任意程度和类型的标注，但你能提供的信息质量越高，结果就越好。

### 标注的作用

Annotations 是评估和改进模型输出的关键部分。好的 annotation：

- 作为期望模型行为的 ground truth，即使对于非常具体的案例也是如此，包括风格和语气等主观元素
- 提供信息密集的上下文，使自动 prompt 改进（通过我们的 prompt optimizer）成为可能
- 帮助诊断 prompt 缺陷，尤其是在细微或低频案例中
- 帮助确保 graders 与你的意图保持一致

你可以标注得少一些，也可以标注得多一些。Datasets 设计为适配任意程度和类型的标注，但你能提供的信息质量越高，结果就越好。此外，如果你不是数据集内容方面的专家，我们建议由主题专家执行标注，这是将其专业知识纳入优化流程的最有价值方式。探索[我们的 cookbook](https://developers.openai.com/cookbook/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel)，了解我们在使用 evals 提高 prompt 韧性方面发现的最有效做法。

### 标注起点

以下是几种可用于开始的 annotation 类型：

- Good/Bad 评分，表示你对输出的判断
- **output_feedback** 部分中的文本评价
- 你在右上角 **Columns** 下拉菜单中添加的自定义 annotation 类别

### 纳入专家标注

如果你不是数据集内容方面的专家，请让主题专家执行标注。这是将专业知识纳入优化流程的最佳方式。探索[我们的 cookbook](https://developers.openai.com/cookbook/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel)了解更多。

## 添加 graders

虽然 annotations 是将人工反馈纳入评估流程的最有效方式，但 graders 可让你大规模运行评估。Graders 是自动化评估器，可根据其类型产生多种输入。

| **Type**                  | **Details**                                  | **Use case**                                      |
| ------------------------- | -------------------------------------------- | ------------------------------------------------- |
| **String check**          | 使用精确字符串匹配将模型输出与参考进行比较 | 检查你的响应是否与 ground truth 列完全匹配       |
| **Text similarity**       | 使用 embeddings 计算模型输出与参考之间的语义相似度 | 在不需要精确匹配时，检查你的响应与 ground truth 参考有多接近 |
| **Score model grader**    | 使用 LLM 分配数值分数                       | 用数值尺度衡量友好程度等主观属性                 |
| **Label model grader**    | 使用 LLM 选择分类标签                       | 根据固定标签（如 "concise" 或 "verbose"）对响应分类 |
| **Python code execution** | 运行自定义 Python 代码以编程方式计算结果    | 检查输出是否少于 50 个词                         |

<video
  src="https://openaiassets.blob.core.windows.net/$web/platform-docs/evals/graders.mp4"
  controls
  style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }}
>
  你的浏览器不支持 video 标签。
</video>

1. 在右上角，导航到 Grade > **New grader**。
1. 从下拉菜单中选择 grader 类型，并填写表单来组成你的 grader。
1. 引用数据集中的列，用于对照 ground truth values 进行检查。
1. 创建 grader。
1. 添加至少一个 grader 后，使用 **Grade** 下拉菜单在你的数据集上运行特定 graders 或所有 graders。运行完成后，你会在数据集中看到每个 grader 专用列里的 pass/fail 评级。

保存数据集后，graders 会在你更改数据集和 prompt 时持续存在，因此它们非常适合快速评估 prompt 或模型参数更改是否带来改进，或添加边缘案例是否暴露 prompt 的不足。datasets dashboard 支持多个标签页，可同时跟踪多个 prompt 变体的自动 graders 结果。

了解更多关于我们的 [graders](https://developers.openai.com/api/docs/guides/graders) 的信息。

## 后续步骤

Datasets 非常适合快速迭代。当你准备好跟踪一段时间内的表现或大规模运行时，请将数据集导出到 [Eval](https://developers.openai.com/api/docs/guides/evals)。Evals 异步运行，支持更大的数据量，并允许你跨版本监控表现。

如需更多灵感，请访问 [OpenAI Cookbook](https://developers.openai.com/cookbook/topic/evals)，其中包含示例代码和第三方资源链接；也可以了解更多关于我们的评估工具的信息：

<a
  href="https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    使用 evaluations 运行持续改进的 flywheel。


</a>

<a href="/api/docs/guides/evals" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    对外部模型进行评估、通过 API 与 evals 交互，以及更多。


</a>

<a href="/api/docs/guides/prompt-optimizer" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    使用你的 dataset 自动改进 prompts。


</a>

[

<span slot="icon">
      </span>
    构建复杂的 graders，以提升 evals 的有效性。

](https://developers.openai.com/api/docs/guides/graders)
