---
title: "数据集入门"
description: "Learn how to get started with evals using datasets."
outline: deep
---

# 数据集入门

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/evaluation-getting-started](https://developers.openai.com/api/docs/guides/evaluation-getting-started)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/evaluation-getting-started.md](https://developers.openai.com/api/docs/guides/evaluation-getting-started.md)
- 抓取时间：2026-06-27T05:54:02.152Z
- Checksum：`9c8bda87e9a6b81314dd56738f544df2705f5ead7638ff75d9ac20b386e9fa3c`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Evaluations（通常称为 **evals**）会测试模型输出，确保它们符合你指定的风格和内容标准。编写 evals 是构建可靠应用的重要组成部分。[Datasets](https://platform.openai.com/evaluation/datasets) 是 OpenAI platform 的一项功能，可让你快速开始使用 evals 并测试 prompts。

OpenAI 正在弃用 Evals platform。现有 evals 内容会在过渡窗口期间继续可用。对于现有用户，Evals 将在 2026 年 10 月 31 日变为只读，并计划于 2026 年 11 月 30 日关闭。请查看 [deprecations page](/mirror/api/docs/deprecations#2026-06-03-evals-platform) 了解当前时间线。

如果你需要高级功能，例如对外部模型进行评估、希望通过 API 与 eval runs 交互，或希望更大规模地运行评估，请考虑改用 [Evals](/mirror/api/docs/guides/evals)。

## 创建数据集

首先，在 dashboard 中创建数据集。

1. 在 [evaluation page](https://platform.openai.com/evaluation) 上，导航到 **Datasets** 标签页。
1. 点击右上角的 **Create** 按钮开始。
1. 在输入字段中为你的数据集添加名称。本指南中，我们将数据集命名为 “Investment memo generation."
1. 添加数据。要从头构建数据集，请点击 **Create**，并通过我们的可视化界面开始添加数据。如果你已经有保存的 prompt 或包含数据的 CSV，请上传它。

&lt;video
  src="https://openaiassets.blob.core.windows.net/$web/platform-docs/evals/dataset-creation.mp4"
  controls
  style=&#123;&#123; maxWidth: "100%", height: "auto", marginBottom: "20px" &#125;&#125;
&gt;
  你的浏览器不支持 video 标签。


我们建议将数据集用作动态空间，随着时间推移扩展你的评估数据集。当你发现需要监控的边缘案例或盲点时，请使用 dashboard 界面将它们添加进去。

### 上传 CSV

我们有一个简单的 CSV，其中包含公司名称，以及这些公司过去几个季度收入的实际值。

&lt;video
  src="https://openaiassets.blob.core.windows.net/$web/platform-docs/evals/csv-upload.mp4"
  controls
  style=&#123;&#123; maxWidth: "100%", height: "auto", marginBottom: "20px" &#125;&#125;
&gt;
  你的浏览器不支持 video 标签。


CSV 中的列可供你的 prompt 和 graders 访问。例如，我们的 CSV 包含输入列（`company`）以及供 graders 用作参考的 ground truth 列（`correct_revenue`、`correct_income`）。

### 使用可视化数据界面

打开数据集后，你可以在 **Data** 标签页中操作数据。点击单元格即可编辑其内容。添加一行可加入更多数据。你也可以在每行右侧边缘的溢出菜单中删除或复制行。

要保存更改，请点击右上角的 **Save** 按钮。

## 构建 prompt

datasets dashboard 中的标签页让多个 prompts 可以与同一份数据交互。

1. 要添加新的 prompt，请点击 **Add prompt**。

   Datasets 设计为与你的 OpenAI [prompts](/mirror/api/docs/guides/prompt-engineering#reusable-prompts) 一起使用。如果你已经在 OpenAI platform 上保存了 prompt，你将能够从下拉菜单中选择它，并在此界面中进行更改。要保存 prompt 更改，请点击 **Save**。

   我们的 prompts 使用版本系统，因此你可以安全地进行更新。点击 **Save** 会创建 prompt 的新版本，你可以在 OpenAI platform 的任何位置引用或使用它。

1. 在 prompt 面板中，使用提供的字段和设置来控制 inference call：

- 点击右上角的滑块图标，以控制模型 [`temperature`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-temperature) 和 [`top_p`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-top_p)。
- 添加 tools，为你的 inference call 授予访问网页、使用 MCP 或完成其他 tool-call actions 的能力。
- 添加变量。prompt 和你的 [graders](/mirror/api/docs/guides/evaluation-getting-started#adding-graders) 都可以引用这些变量。
- 直接输入你的 system message，或点击铅笔图标，让模型根据你提供的基本说明帮你生成 prompt。

在我们的示例中，我们会添加 [web search](/mirror/api/docs/guides/tools-web-search) tool，让模型调用可以从互联网拉取财务数据。在变量列表中，我们会添加 `company`，以便 prompt 可以引用数据集中的 company 列。对于 prompt，我们会通过告诉模型 “generate a financial report." 来生成一个 prompt。

## 生成并标注输出

设置好数据和 prompt 后，你就可以生成输出了。模型的输出会让你了解模型如何使用你提供的 prompt 和 tools 执行任务。然后你会标注这些输出，使模型能够随着时间推移提升表现。

&lt;video
  src="https://openaiassets.blob.core.windows.net/$web/platform-docs/evals/generate-outputs-and-annotate.mp4"
  controls
  style=&#123;&#123; maxWidth: "100%", height: "auto", marginBottom: "20px" &#125;&#125;
&gt;
  你的浏览器不支持 video 标签。


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

&lt;video
  src="https://openaiassets.blob.core.windows.net/$web/platform-docs/evals/graders.mp4"
  controls
  style=&#123;&#123; maxWidth: "100%", height: "auto", marginBottom: "20px" &#125;&#125;
&gt;
  你的浏览器不支持 video 标签。


1. 在右上角，导航到 Grade &gt; **New grader**。
1. 从下拉菜单中选择 grader 类型，并填写表单来组成你的 grader。
1. 引用数据集中的列，用于对照 ground truth values 进行检查。
1. 创建 grader。
1. 添加至少一个 grader 后，使用 **Grade** 下拉菜单在你的数据集上运行特定 graders 或所有 graders。运行完成后，你会在数据集中看到每个 grader 专用列里的 pass/fail 评级。

保存数据集后，graders 会在你更改数据集和 prompt 时持续存在，因此它们非常适合快速评估 prompt 或模型参数更改是否带来改进，或添加边缘案例是否暴露 prompt 的不足。datasets dashboard 支持多个标签页，可同时跟踪多个 prompt 变体的自动 graders 结果。

了解更多关于我们的 [graders](/mirror/api/docs/guides/graders) 的信息。

## 后续步骤

Datasets 非常适合快速迭代。当你准备好跟踪一段时间内的表现或大规模运行时，请将数据集导出到 [Eval](/mirror/api/docs/guides/evals)。Evals 异步运行，支持更大的数据量，并允许你跨版本监控表现。

如需更多灵感，请访问 [OpenAI Cookbook](https://developers.openai.com/cookbook/topic/evals)，其中包含示例代码和第三方资源链接；也可以了解更多关于我们的评估工具的信息：

&lt;a
  href="https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel"
  target="_blank"
  rel="noreferrer"
&gt;
  



    使用 evaluations 运行持续改进的 flywheel。





  



    对外部模型进行评估、通过 API 与 evals 交互，以及更多。





  



    使用你的 dataset 自动改进 prompts。




[



    构建复杂的 graders，以提升 evals 的有效性。

](https://developers.openai.com/api/docs/guides/graders)

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Evaluations (often called **evals**) test model outputs to ensure they meet your specified style and content criteria. Writing evals is an essential part of building reliable applications. [Datasets](https://platform.openai.com/evaluation/datasets), a feature of the OpenAI platform, provide a quick way to get started with evals and test prompts.

OpenAI is deprecating the Evals platform. Existing evals content remains
  available during the transition window. Evals will become read-only for
  existing users on October 31, 2026, and the platform is scheduled to shut down
  on November 30, 2026. See the [deprecations
  page](https://developers.openai.com/api/docs/deprecations#2026-06-03-evals-platform) for the current
  timeline.

If you need advanced features such as evaluation against external models, want
  to interact with your eval runs via API, or want to run evaluations on a
  larger scale, consider using [Evals](https://developers.openai.com/api/docs/guides/evals) instead.

## Create a dataset

First, create a dataset in the dashboard.

1. On the [evaluation page](https://platform.openai.com/evaluation), navigate to the **Datasets** tab.
1. Click the **Create** button in the top right to get started.
1. Add a name for your dataset in the input field. In this guide, we'll name our dataset “Investment memo generation."
1. Add data. To build your dataset from scratch, click **Create** and start adding data through our visual interface. If you already have a saved prompt or a CSV with data, upload it.

<video
  src="https://openaiassets.blob.core.windows.net/$web/platform-docs/evals/dataset-creation.mp4"
  controls
  style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }}
>
  Your browser does not support the video tag.
</video>

We recommend using your dataset as a dynamic space, expanding your set of evaluation data over time. As you identify edge cases or blind spots that need monitoring, add them using the dashboard interface.

### Uploading a CSV

We have a simple CSV containing company names and actual values for their revenue from past quarters.

<video
  src="https://openaiassets.blob.core.windows.net/$web/platform-docs/evals/csv-upload.mp4"
  controls
  style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }}
>
  Your browser does not support the video tag.
</video>

The columns in your CSV are accessible to both your prompt and graders. For example, our CSV contains input columns (`company`) and ground truth columns (`correct_revenue`, `correct_income`) for our graders to use as reference.

### Using the visual data interface

After opening your dataset, you can manipulate your data in the **Data** tab. Click a cell to edit its contents. Add a row to add more data. You can also delete or duplicate rows in the overflow menu at the right edge of each row.

To save your changes, click **Save** button in the top right.

## Build a prompt

The tabs in the datasets dashboard let multiple prompts interact with the same data.

1. To add a new prompt, click **Add prompt**.

   Datasets are designed to be used with your OpenAI [prompts](https://developers.openai.com/api/docs/guides/prompt-engineering#reusable-prompts). If you’ve saved a prompt on the OpenAI platform, you’ll be able to select it from the dropdown and make changes in this interface. To save your prompt changes, click **Save**.

   Our prompts use a versioning system so you can safely make updates.
     Clicking **Save** creates a new version of your prompt, which you can refer
     to or use anywhere in the OpenAI platform.

1. In the prompt panel, use the provided fields and settings to control the inference call:

- Click the slider icon in the top right to control model [`temperature`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-temperature) and [`top_p`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-top_p).
- Add tools to grant your inference call the ability to access the web, use an MCP, or complete other tool-call actions.
- Add variables. The prompt and your [graders](#adding-graders) can both refer to these variables.
- Type your system message directly, or click the pencil icon to have a model help generate a prompt for you, based on basic instructions you provide.

In our example, we'll add the [web search](https://developers.openai.com/api/docs/guides/tools-web-search) tool so our model call can pull financial data from the internet. In our variables list, we'll add `company` so our prompt can reference the company column in our dataset. And for the prompt, we’ll generate one by telling the model to “generate a financial report."

## Generate and annotate outputs

With your data and prompt set up, you’re ready to generate outputs. The model's output gives you a sense of how the model performs your task with the prompt and tools you provided. You'll then annotate the outputs so the model can improve its performance over time.

<video
  src="https://openaiassets.blob.core.windows.net/$web/platform-docs/evals/generate-outputs-and-annotate.mp4"
  controls
  style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }}
>
  Your browser does not support the video tag.
</video>

1. In the top right, click **Generate output**.

   You’ll see a new special **output** column in the dataset begin to populate with results. This column contains the results from running your prompt on each row in your dataset.

1. Once your generated outputs are ready, annotate them. Open the annotation view by clicking the **output**, **rating**, or **output_feedback** column.

   Annotate as little or as much as you want. Datasets are designed to work with any degree and type of annotation, but the higher quality of information you can provide, the better your results will be.

### What annotation does

Annotations are a key part of evaluating and improving model output. A good annotation:

- Serves as ground truth for desired model behavior, even for highly specific cases—including subjective elements, like style and tone
- Provides information-dense context enabling automatic prompt improvement (via our prompt optimizer)
- Enables diagnosing prompt shortcomings, particularly in subtle or infrequent cases
- Helps ensure that graders are aligned with your intent

You can choose to annotate as little or as much as you want. Datasets are designed to work with any degree and type of annotation, but the higher quality of information you can provide, the better your results will be. Additionally, if you’re not an expert on the contents of your dataset, we recommend that a subject matter expert performs the annotation — this is the most valuable way for their expertise to be incorporated into your optimization process. Explore [our cookbook](https://developers.openai.com/cookbook/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel) to learn more about what we have found to be most effective in using evals to improve our prompt resilience.

### Annotation starting points

Here are a few types of annotations you can use to get started:

- A Good/Bad rating, indicating your judgment of the output
- A text critique in the **output_feedback** section
- Custom annotation categories that you added in the **Columns** dropdown in the top right

### Incorporate expert annotations

If you’re not an expert on the contents of your dataset, have a subject matter expert perform the annotation. This is the best way to incorporate expertise into the optimization process. Explore [our cookbook](https://developers.openai.com/cookbook/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel) to learn more.

## Add graders

While annotations are the most effective way to incorporate human feedback into your evaluation process, graders let you run evaluations at scale. Graders are automated assessments that can produce a variety of inputs depending on their type.

| **Type**                  | **Details**                                                                       | **Use case**                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **String check**          | Compares model output to the reference using exact string matching                | Check whether your response exactly matches a ground truth column                                  |
| **Text similarity**       | Uses embeddings to compute semantic similarity between model output and reference | Check how close your response is to your ground truth reference, when exact matching is not needed |
| **Score model grader**    | Uses an LLM to assign a numeric score                                             | Measure subjective properties such as friendliness on a numeric scale                              |
| **Label model grader**    | Uses an LLM to select a categorical label                                         | Categorize your response based on fix labels, such as "concise" or "verbose"                       |
| **Python code execution** | Runs custom Python code to compute a result programmatically                      | Check whether the output contains fewer than 50 words                                              |

<video
  src="https://openaiassets.blob.core.windows.net/$web/platform-docs/evals/graders.mp4"
  controls
  style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }}
>
  Your browser does not support the video tag.
</video>

1. In the top right, navigate to Grade > **New grader**.
1. From the dropdown, choose your grader type, and fill out the form to compose your grader.
1. Reference the columns from your dataset to check against ground truth values.
1. Create the grader.
1. Once you’ve added at least one grader, use the **Grade** dropdown menu to run specific graders or all graders on your dataset. When a run is complete, you’ll see pass/fail ratings in your dataset in a dedicated column for each grader.

After saving your dataset, graders persist as you make changes to your dataset and prompt, making them a great way to quickly assess whether a prompt or model parameter change leads to improvements, or whether adding edge cases reveals shortcomings in your prompt. The datasets dashboard supports multiple tabs for simultaneously tracking results from automated graders across multiple variants of a prompt.

Learn more about our [graders](https://developers.openai.com/api/docs/guides/graders).

## Next steps

Datasets are great for rapid iteration. When you're ready to track performance over time or run at scale, export your dataset to an [Eval](https://developers.openai.com/api/docs/guides/evals). Evals run asynchronously, support larger data volumes, and let you monitor performance across versions.

For more inspiration, visit the [OpenAI Cookbook](https://developers.openai.com/cookbook/topic/evals), which contains example code and links to third-party resources, or learn more about our evaluation tools:

<a
  href="https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Operate a flywheel of continuous improvement using evaluations.


</a>

<a href="/api/docs/guides/evals" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    Evaluate against external models, interact with evals via API, and more.


</a>

<a href="/api/docs/guides/prompt-optimizer" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    Use your dataset to automatically improve your prompts.


</a>

[

<span slot="icon">
      </span>
    Build sophisticated graders to improve the effectiveness of your evals.

](https://developers.openai.com/api/docs/guides/graders)
``````
:::
:::

