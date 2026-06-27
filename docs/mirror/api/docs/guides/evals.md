---
title: "Working with evals"
description: "Learn how to test and improve AI model outputs through evaluations."
outline: deep
---

# Working with evals

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/evals](https://developers.openai.com/api/docs/guides/evals)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/evals.md](https://developers.openai.com/api/docs/guides/evals.md)
- 抓取时间：2026-06-27T05:54:01.858Z
- Checksum：`855bfa851c74eeace24b96da394008f511ae193f94b50b9e41282279e2f9d3dc`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Evaluations（通常称为 **evals**）会测试模型输出，确保它们满足你指定的风格和内容标准。编写 evals 来了解你的 LLM applications 是否符合预期，尤其是在升级或尝试新模型时，是构建可靠应用的重要组成部分。

在本指南中，我们会重点介绍**如何使用 [Evals API](https://developers.openai.com/api/docs/api-reference/evals) 以编程方式配置 evals**。如果你愿意，也可以在 [OpenAI dashboard](https://platform.openai.com/evaluations) 中配置 evals。

OpenAI 正在弃用 Evals platform。现有 evals content 会在过渡窗口期间继续可用。Evals 将于 2026 年 10 月 31 日对现有用户变为 read-only，并计划于 2026 年 11 月 30 日关闭。请参阅 [deprecations page](/mirror/api/docs/deprecations#2026-06-03-evals-platform) 了解当前 timeline。

如果你刚开始接触 evaluations，或希望在构建 eval 时有一个更迭代式的环境来实验，可以考虑改用 [Datasets](/mirror/api/docs/guides/evaluation-getting-started)。

概括来说，为你的 LLM application 构建和运行 evals 有三个步骤。

1. 将要完成的任务描述为 eval
1. 使用 test inputs（prompt 和 input data）运行 eval
1. 分析结果，然后迭代并改进 prompt

这个过程有点类似 behavior-driven development（BDD）：在实现和测试系统之前，先指定系统应如何表现。让我们看看如何使用 [Evals API](https://developers.openai.com/api/docs/api-reference/evals) 完成上述每个步骤。

## 为任务创建 eval

创建 eval 的第一步，是描述要由模型完成的任务。假设我们希望使用模型把 IT support tickets 的内容分类到三个类别之一：`Hardware`、`Software` 或 `Other`。

要实现这个用例，你可以使用 [Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat) 或 [Responses API](https://developers.openai.com/api/docs/api-reference/responses)。下面两个示例都把 [developer message](/mirror/api/docs/guides/text) 与包含 support ticket 文本的 user message 结合起来。


  对 IT support tickets 进行分类

```bash
curl https://api.openai.com/v1/responses \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "gpt-5.5",
        "input": [
            {
                "role": "developer",
                "content": "Categorize the following support ticket into one of Hardware, Software, or Other."
            },
            {
                "role": "user",
                "content": "My monitor wont turn on - help!"
            }
        ]
    }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const instructions = `
You are an expert in categorizing IT support tickets. Given the support
ticket below, categorize the request into one of "Hardware", "Software",
or "Other". Respond with only one of those words.
`;

const ticket = "My monitor won't turn on - help!";

const response = await client.responses.create({
    model: "gpt-5.5",
    input: [
        { role: "developer", content: instructions },
        { role: "user", content: ticket },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

instructions = """
You are an expert in categorizing IT support tickets. Given the support
ticket below, categorize the request into one of "Hardware", "Software",
or "Other". Respond with only one of those words.
"""

ticket = "My monitor won't turn on - help!"

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {"role": "developer", "content": instructions},
        {"role": "user", "content": ticket},
    ],
)

print(response.output_text)
```





让我们[通过 API](https://developers.openai.com/api/docs/api-reference/evals) 设置一个 eval 来测试这种行为。eval 需要两个关键组成部分：

- `data_source_config`：用于 eval 的 test data schema。
- `testing_criteria`：用于判断模型输出是否正确的 [graders](/mirror/api/docs/guides/graders)。

创建 eval

```bash
curl https://api.openai.com/v1/evals \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "IT Ticket Categorization",
        "data_source_config": {
            "type": "custom",
            "item_schema": {
                "type": "object",
                "properties": {
                    "ticket_text": { "type": "string" },
                    "correct_label": { "type": "string" }
                },
                "required": ["ticket_text", "correct_label"]
            },
            "include_sample_schema": true
        },
        "testing_criteria": [
            {
                "type": "string_check",
                "name": "Match output to human label",
                "input": "{{ sample.output_text }}",
                "operation": "eq",
                "reference": "{{ item.correct_label }}"
            }
        ]
    }'
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const evalObj = await openai.evals.create({
    name: "IT Ticket Categorization",
    data_source_config: {
        type: "custom",
        item_schema: {
            type: "object",
            properties: {
                ticket_text: { type: "string" },
                correct_label: { type: "string" }
            },
            required: ["ticket_text", "correct_label"],
        },
        include_sample_schema: true,
    },
    testing_criteria: [
        {
            type: "string_check",
            name: "Match output to human label",
            input: "{{ sample.output_text }}",
            operation: "eq",
            reference: "{{ item.correct_label }}",
        },
    ],
});

console.log(evalObj);
```

```python
from openai import OpenAI
client = OpenAI()

eval_obj = client.evals.create(
    name="IT Ticket Categorization",
    data_source_config={
        "type": "custom",
        "item_schema": {
            "type": "object",
            "properties": {
                "ticket_text": {"type": "string"},
                "correct_label": {"type": "string"},
            },
            "required": ["ticket_text", "correct_label"],
        },
        "include_sample_schema": True,
    },
    testing_criteria=[
        {
            "type": "string_check",
            "name": "Match output to human label",
            "input": "{{ sample.output_text }}",
            "operation": "eq",
            "reference": "{{ item.correct_label }}",
        }
    ],
)

print(eval_obj)
```


说明：data_source_config parameter

运行此 eval 需要一个 test data set，用来代表你期望 prompt 能处理的数据类型（本指南后面会进一步说明如何创建 test data set）。在我们的 `data_source_config` parameter 中，我们指定 data set 中的每个 **item** 都会符合一个包含两个 properties 的 [JSON schema](https://json-schema.org/)：

- `ticket_text`：包含 support ticket 内容的文本 string
- `correct_label`：模型应匹配的 “ground truth” output，由人工提供

由于我们会在 test criteria 中引用 **sample**（即模型基于我们的 prompt 生成的 output），因此还把 `include_sample_schema` 设置为 `true`。

```json
{
  "type": "custom",
  "item_schema": {
    "type": "object",
    "properties": {
      "ticket": { "type": "string" },
      "category": { "type": "string" }
    },
    "required": ["ticket", "category"]
  },
  "include_sample_schema": true
}
```

说明：testing_criteria parameter

在我们的 `testing_criteria` 中，我们定义如何判断模型针对 data set 中每个 item 的输出是否满足要求。在这个例子中，我们只希望模型基于输入 ticket 输出三个类别 strings 之一。它输出的 string 应与 test data 中人工标注的 `correct_label` field 完全匹配。因此，在这里我们会使用 `string_check` grader 来评估输出。

在 test configuration 中，我们会引入 template syntax，即下面的 `&#123;&#123;` 和 `&#125;&#125;` brackets。这是我们将动态内容插入此 eval 测试的方式。

- `&#123;&#123; item.correct_label &#125;&#125;` 指向 test data 中的 ground truth value。
- `&#123;&#123; sample.output_text &#125;&#125;` 指向我们将从模型生成、用于评估 prompt 的内容——我们会在实际启动 eval run 时展示如何做到这一点。

```json
{
  "type": "string_check",
  "name": "Category string match",
  "input": "{{ sample.output_text }}",
  "operation": "eq",
  "reference": "{{ item.category }}"
}
```

创建 eval 后，它会被分配一个 UUID。稍后启动 run 时，你需要使用该 UUID 来寻址它。

```json
{
  "object": "eval",
  "id": "eval_67e321d23b54819096e6bfe140161184",
  "data_source_config": {
    "type": "custom",
    "schema": { ... omitted for brevity... }
  },
  "testing_criteria": [
    {
      "name": "Match output to human label",
      "id": "Match output to human label-c4fdf789-2fa5-407f-8a41-a6f4f9afd482",
      "type": "string_check",
      "input": "{{ sample.output_text }}",
      "reference": "{{ item.correct_label }}",
      "operation": "eq"
    }
  ],
  "name": "IT Ticket Categorization",
  "created_at": 1742938578,
  "metadata": {}
}
```

现在我们已经创建了一个 eval，用于描述应用的期望行为。接下来，用一组 test data 测试一个 prompt。

## 使用 eval 测试 prompt

现在我们已经在 eval 中定义了希望应用如何表现，接下来构造一个 prompt，使其能够为具有代表性的 test data 样本可靠生成正确输出。

### 上传 test data

为 eval runs 提供 test data 有几种方式，但上传一个 [JSONL](https://jsonlines.org/) 文件可能很方便，该文件包含符合我们创建 eval 时所指定 schema 的数据。下面是一个符合我们所设 schema 的示例 JSONL 文件：

```json
{ "item": { "ticket_text": "My monitor won't turn on!", "correct_label": "Hardware" } }
{ "item": { "ticket_text": "I'm in vim and I can't quit!", "correct_label": "Software" } }
{ "item": { "ticket_text": "Best restaurants in Cleveland?", "correct_label": "Other" } }
```

这个 data set 同时包含 test inputs 和用于与模型输出比较的 ground truth labels。

接下来，把 test data file 上传到 OpenAI platform，以便稍后引用。你可以[在 dashboard 这里](https://platform.openai.com/storage/files)上传 files，也可以[通过 API 上传 files](https://developers.openai.com/api/docs/api-reference/files/create)。下面的 samples 假设你在保存了上述 sample JSON data 的目录中运行命令，并且文件名为 `tickets.jsonl`：

上传 test data file

```bash
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="evals" \
  -F file="@tickets.jsonl"
```

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const file = await openai.files.create({
    file: fs.createReadStream("tickets.jsonl"),
    purpose: "evals",
});

console.log(file);
```

```python
from openai import OpenAI
client = OpenAI()

file = client.files.create(
    file=open("tickets.jsonl", "rb"),
    purpose="evals"
)

print(file)
```


上传文件时，请记下 response payload 中唯一的 `id` property（如果你通过浏览器上传，也可以在 UI 中看到）——稍后需要引用该值：

```json
{
  "object": "file",
  "id": "file-CwHg45Fo7YXwkWRPUkLNHW",
  "purpose": "evals",
  "filename": "tickets.jsonl",
  "bytes": 208,
  "created_at": 1742834798,
  "expires_at": null,
  "status": "processed",
  "status_details": null
}
```

### 创建 eval run

准备好 test data 后，就可以评估 prompt，看看它相对于 test criteria 的表现如何。通过 API，可以通过[创建 eval run](https://developers.openai.com/api/docs/api-reference/evals/createRun) 来完成。

请确保将 `YOUR_EVAL_ID` 和 `YOUR_FILE_ID` 替换为你在上述步骤中创建的 eval configuration 和 test data files 的唯一 IDs。


  创建 eval run

```bash
curl https://api.openai.com/v1/evals/YOUR_EVAL_ID/runs \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Categorization text run",
        "data_source": {
            "type": "responses",
            "model": "gpt-5.5",
            "input_messages": {
                "type": "template",
                "template": [
                    {"role": "developer", "content": "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of Hardware, Software, or Other. Respond with only one of those words."},
                    {"role": "user", "content": "{{ item.ticket_text }}"}
                ]
            },
            "source": { "type": "file_id", "id": "YOUR_FILE_ID" }
        }
    }'
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const run = await openai.evals.runs.create("YOUR_EVAL_ID", {
    name: "Categorization text run",
    data_source: {
        type: "responses",
        model: "gpt-5.5",
        input_messages: {
            type: "template",
            template: [
                { role: "developer", content: "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of 'Hardware', 'Software', or 'Other'. Respond with only one of those words." },
                { role: "user", content: "{{ item.ticket_text }}" },
            ],
        },
        source: { type: "file_id", id: "YOUR_FILE_ID" },
    },
});

console.log(run);
```

```python
from openai import OpenAI
client = OpenAI()

run = client.evals.runs.create(
    "YOUR_EVAL_ID",
    name="Categorization text run",
    data_source={
        "type": "responses",
        "model": "gpt-5.5",
        "input_messages": {
            "type": "template",
            "template": [
                {"role": "developer", "content": "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of 'Hardware', 'Software', or 'Other'. Respond with only one of those words."},
                {"role": "user", "content": "{{ item.ticket_text }}"},
            ],
        },
        "source": {"type": "file_id", "id": "YOUR_FILE_ID"},
    },
)

print(run)
```





创建 run 时，我们使用 [Chat Completions](/mirror/api/docs/guides/text) messages array 或 [Responses](https://developers.openai.com/api/docs/api-reference/responses) input 设置 prompt。该 prompt 会用于对 data set 中每一行 test data 生成模型响应。我们可以使用双花括号语法，把动态变量 `item.ticket_text` 模板化插入；该变量来自当前 test data item。

如果 eval run 成功创建，你会收到类似如下的 API response：


```json
{
    "object": "eval.run",
    "id": "evalrun_67e44c73eb6481909f79a457749222c7",
    "eval_id": "eval_67e44c5becec81909704be0318146157",
    "report_url": "https://platform.openai.com/evaluation/evals/abc123",
    "status": "queued",
    "model": "gpt-4.1",
    "name": "Categorization text run",
    "created_at": 1743015028,
    "result_counts": { ... },
    "per_model_usage": null,
    "per_testing_criteria_results": null,
    "data_source": {
        "type": "responses",
        "source": {
            "type": "file_id",
            "id": "file-J7MoX9ToHXp2TutMEeYnwj"
        },
        "input_messages": {
            "type": "template",
            "template": [
                {
                    "type": "message",
                    "role": "developer",
                    "content": {
                        "type": "input_text",
                        "text": "You are an expert in...."
                    }
                },
                {
                    "type": "message",
                    "role": "user",
                    "content": {
                        "type": "input_text",
                        "text": "{{item.ticket_text}}"
                    }
                }
            ]
        },
        "model": "gpt-4.1",
        "sampling_params": null
    },
    "error": null,
    "metadata": {}
}
```




你的 eval run 现在已 queued，并会异步执行：它会处理 data set 中的每一行，按我们指定的 prompt 和 model 生成用于测试的 responses。

## 分析结果

要在 run 成功、失败或被取消时接收更新，请创建 webhook endpoint，并订阅 `eval.run.succeeded`、`eval.run.failed` 和 `eval.run.canceled` events。更多详情请参阅 [webhooks guide](/mirror/api/docs/guides/webhooks)。

根据 dataset 大小，eval run 可能需要一些时间才能完成。你可以在 dashboard 中查看当前状态，也可以[通过 API 获取 eval run 的当前状态](https://developers.openai.com/api/docs/api-reference/evals/getRun)：

检索 eval run 状态

```bash
curl https://api.openai.com/v1/evals/YOUR_EVAL_ID/runs/YOUR_RUN_ID \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json"
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const run = await openai.evals.runs.retrieve("YOUR_RUN_ID", {
    eval_id: "YOUR_EVAL_ID",
});
console.log(run);
```

```python
from openai import OpenAI
client = OpenAI()

run = client.evals.runs.retrieve("YOUR_EVAL_ID", "YOUR_RUN_ID")
print(run)
```


你需要 eval 和 eval run 的 UUID 才能获取其状态。执行后，你会看到类似这样的 eval run data：


```json
{
    "object": "eval.run",
    "id": "evalrun_67e44c73eb6481909f79a457749222c7",
    "eval_id": "eval_67e44c5becec81909704be0318146157",
    "report_url": "https://platform.openai.com/evaluation/evals/xxx",
    "status": "completed",
    "model": "gpt-4.1",
    "name": "Categorization text run",
    "created_at": 1743015028,
    "result_counts": {
        "total": 3,
        "errored": 0,
        "failed": 0,
        "passed": 3
    },
    "per_model_usage": [
        {
            "model_name": "gpt-4o-2024-08-06",
            "invocation_count": 3,
            "prompt_tokens": 166,
            "completion_tokens": 6,
            "total_tokens": 172,
            "cached_tokens": 0
        }
    ],
    "per_testing_criteria_results": [
        {
            "testing_criteria": "Match output to human label-40d67441-5000-4754-ab8c-181c125803ce",
            "passed": 3,
            "failed": 0
        }
    ],
    "data_source": {
        "type": "responses",
        "source": {
            "type": "file_id",
            "id": "file-J7MoX9ToHXp2TutMEeYnwj"
        },
        "input_messages": {
            "type": "template",
            "template": [
                {
                    "type": "message",
                    "role": "developer",
                    "content": {
                        "type": "input_text",
                        "text": "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of Hardware, Software, or Other. Respond with only one of those words."
                    }
                },
                {
                    "type": "message",
                    "role": "user",
                    "content": {
                        "type": "input_text",
                        "text": "{{item.ticket_text}}"
                    }
                }
            ]
        },
        "model": "gpt-4.1",
        "sampling_params": null
    },
    "error": null,
    "metadata": {}
}
```




API response 包含关于 test criteria results、生成模型 responses 的 API usage，以及 `report_url` property 的细粒度信息。`report_url` 会带你进入 dashboard 中的页面，以便可视化探索结果。

在这个简单测试中，模型可靠地为一个小型 test case sample 生成了我们想要的内容。现实中，你通常需要使用更多 criteria、不同 prompts 和不同 data sets 运行 eval。但上述流程为你构建 LLM apps 的稳健 evals 提供了全部所需工具！

## 后续步骤

现在你已经知道如何通过 API 和 dashboard 创建并运行 evals！在你继续改进模型结果时，下面还有一些可能有用的资源。

&lt;a
  href="https://cookbook.openai.com/examples/evaluation/use-cases/regression"
  target="_blank"
  rel="noreferrer"
&gt;
  



    在迭代 prompts 时跟踪其表现。




&lt;a
  href="https://cookbook.openai.com/examples/evaluation/use-cases/bulk-experimentation"
  target="_blank"
  rel="noreferrer"
&gt;
  



    一次比较许多不同 prompts 和 models 的结果。




&lt;a
  href="https://cookbook.openai.com/examples/evaluation/use-cases/completion-monitoring"
  target="_blank"
  rel="noreferrer"
&gt;
  



    检查 stored completions，以测试 prompt regressions。




[



    提升模型生成针对你的用例定制 responses 的能力。

](https://developers.openai.com/api/docs/guides/fine-tuning)
[



    了解如何将大型模型结果蒸馏为更小、更便宜、更快的模型。

](https://developers.openai.com/api/docs/guides/distillation)

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Evaluations (often called **evals**) test model outputs to ensure they meet style and content criteria that you specify. Writing evals to understand how your LLM applications are performing against your expectations, especially when upgrading or trying new models, is an essential component to building reliable applications.

In this guide, we will focus on **configuring evals programmatically using the [Evals API](https://developers.openai.com/api/docs/api-reference/evals)**. If you prefer, you can also configure evals [in the OpenAI dashboard](https://platform.openai.com/evaluations).

OpenAI is deprecating the Evals platform. Existing evals content remains
  available during the transition window. Evals will become read-only for
  existing users on October 31, 2026, and the platform is scheduled to shut down
  on November 30, 2026. See the [deprecations
  page](https://developers.openai.com/api/docs/deprecations#2026-06-03-evals-platform) for the current
  timeline.

If you're new to evaluations, or want a more iterative environment to
  experiment in as you build your eval, consider trying
  [Datasets](https://developers.openai.com/api/docs/guides/evaluation-getting-started) instead.

Broadly, there are three steps to build and run evals for your LLM application.

1. Describe the task to be done as an eval
1. Run your eval with test inputs (a prompt and input data)
1. Analyze the results, then iterate and improve on your prompt

This process is somewhat similar to behavior-driven development (BDD), where you begin by specifying how the system should behave before implementing and testing the system. Let's see how we would complete each of the steps above using the [Evals API](https://developers.openai.com/api/docs/api-reference/evals).

## Create an eval for a task

Creating an eval begins by describing a task to be done by a model. Let's say that we would like to use a model to classify the contents of IT support tickets into one of three categories: `Hardware`, `Software`, or `Other`.

To implement this use case, you can use either the [Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat) or the [Responses API](https://developers.openai.com/api/docs/api-reference/responses). Both examples below combine a [developer message](https://developers.openai.com/api/docs/guides/text) with a user message containing the text of a support ticket.


  Categorize IT support tickets

```bash
curl https://api.openai.com/v1/responses \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "gpt-5.5",
        "input": [
            {
                "role": "developer",
                "content": "Categorize the following support ticket into one of Hardware, Software, or Other."
            },
            {
                "role": "user",
                "content": "My monitor wont turn on - help!"
            }
        ]
    }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const instructions = `
You are an expert in categorizing IT support tickets. Given the support
ticket below, categorize the request into one of "Hardware", "Software",
or "Other". Respond with only one of those words.
`;

const ticket = "My monitor won't turn on - help!";

const response = await client.responses.create({
    model: "gpt-5.5",
    input: [
        { role: "developer", content: instructions },
        { role: "user", content: ticket },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

instructions = """
You are an expert in categorizing IT support tickets. Given the support
ticket below, categorize the request into one of "Hardware", "Software",
or "Other". Respond with only one of those words.
"""

ticket = "My monitor won't turn on - help!"

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {"role": "developer", "content": instructions},
        {"role": "user", "content": ticket},
    ],
)

print(response.output_text)
```





Let's set up an eval to test this behavior [via API](https://developers.openai.com/api/docs/api-reference/evals). An eval needs two key ingredients:

- `data_source_config`: A schema for the test data you will use along with the eval.
- `testing_criteria`: The [graders](https://developers.openai.com/api/docs/guides/graders) that determine if the model output is correct.

Create an eval

```bash
curl https://api.openai.com/v1/evals \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "IT Ticket Categorization",
        "data_source_config": {
            "type": "custom",
            "item_schema": {
                "type": "object",
                "properties": {
                    "ticket_text": { "type": "string" },
                    "correct_label": { "type": "string" }
                },
                "required": ["ticket_text", "correct_label"]
            },
            "include_sample_schema": true
        },
        "testing_criteria": [
            {
                "type": "string_check",
                "name": "Match output to human label",
                "input": "{{ sample.output_text }}",
                "operation": "eq",
                "reference": "{{ item.correct_label }}"
            }
        ]
    }'
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const evalObj = await openai.evals.create({
    name: "IT Ticket Categorization",
    data_source_config: {
        type: "custom",
        item_schema: {
            type: "object",
            properties: {
                ticket_text: { type: "string" },
                correct_label: { type: "string" }
            },
            required: ["ticket_text", "correct_label"],
        },
        include_sample_schema: true,
    },
    testing_criteria: [
        {
            type: "string_check",
            name: "Match output to human label",
            input: "{{ sample.output_text }}",
            operation: "eq",
            reference: "{{ item.correct_label }}",
        },
    ],
});

console.log(evalObj);
```

```python
from openai import OpenAI
client = OpenAI()

eval_obj = client.evals.create(
    name="IT Ticket Categorization",
    data_source_config={
        "type": "custom",
        "item_schema": {
            "type": "object",
            "properties": {
                "ticket_text": {"type": "string"},
                "correct_label": {"type": "string"},
            },
            "required": ["ticket_text", "correct_label"],
        },
        "include_sample_schema": True,
    },
    testing_criteria=[
        {
            "type": "string_check",
            "name": "Match output to human label",
            "input": "{{ sample.output_text }}",
            "operation": "eq",
            "reference": "{{ item.correct_label }}",
        }
    ],
)

print(eval_obj)
```


Explanation: data_source_config parameter

Running this eval will require a test data set that represents the type of data you expect your prompt to work with (more on creating the test data set later in this guide). In our `data_source_config` parameter, we specify that each **item** in the data set will conform to a [JSON schema](https://json-schema.org/) with two properties:

- `ticket_text`: a string of text with the contents of a support ticket
- `correct_label`: a "ground truth" output that the model should match, provided by a human

Since we will be referencing a **sample** in our test criteria (the output generated by a model given our prompt), we also set `include_sample_schema` to `true`.

```json
{
  "type": "custom",
  "item_schema": {
    "type": "object",
    "properties": {
      "ticket": { "type": "string" },
      "category": { "type": "string" }
    },
    "required": ["ticket", "category"]
  },
  "include_sample_schema": true
}
```

Explanation: testing_criteria parameter

In our `testing_criteria`, we define how we will conclude if the model output satisfies our requirements for each item in the data set. In this case, we just want the model to output one of three category strings based on the input ticket. The string it outputs should exactly match the human-labeled `correct_label` field in our test data. So in this case, we will want to use a `string_check` grader to evaluate the output.

In the test configuration, we will introduce template syntax, represented by the `{{` and `}}` brackets below. This is how we will insert dynamic content into the test for this eval.

- `{{ item.correct_label }}` refers to the ground truth value in our test data.
- `{{ sample.output_text }}` refers to the content we will generate from a model to evaluate our prompt - we'll show how to do that when we actually kick off the eval run.

```json
{
  "type": "string_check",
  "name": "Category string match",
  "input": "{{ sample.output_text }}",
  "operation": "eq",
  "reference": "{{ item.category }}"
}
```

After creating the eval, it will be assigned a UUID that you will need to address it later when kicking off a run.

```json
{
  "object": "eval",
  "id": "eval_67e321d23b54819096e6bfe140161184",
  "data_source_config": {
    "type": "custom",
    "schema": { ... omitted for brevity... }
  },
  "testing_criteria": [
    {
      "name": "Match output to human label",
      "id": "Match output to human label-c4fdf789-2fa5-407f-8a41-a6f4f9afd482",
      "type": "string_check",
      "input": "{{ sample.output_text }}",
      "reference": "{{ item.correct_label }}",
      "operation": "eq"
    }
  ],
  "name": "IT Ticket Categorization",
  "created_at": 1742938578,
  "metadata": {}
}
```

Now that we've created an eval that describes the desired behavior of our application, let's test a prompt with a set of test data.

## Test a prompt with your eval

Now that we have defined how we want our app to behave in an eval, let's construct a prompt that reliably generates the correct output for a representative sample of test data.

### Uploading test data

There are several ways to provide test data for eval runs, but it may be convenient to upload a [JSONL](https://jsonlines.org/) file that contains data in the schema we specified when we created our eval. A sample JSONL file that conforms to the schema we set up is below:

```json
{ "item": { "ticket_text": "My monitor won't turn on!", "correct_label": "Hardware" } }
{ "item": { "ticket_text": "I'm in vim and I can't quit!", "correct_label": "Software" } }
{ "item": { "ticket_text": "Best restaurants in Cleveland?", "correct_label": "Other" } }
```

This data set contains both test inputs and ground truth labels to compare model outputs against.

Next, let's upload our test data file to the OpenAI platform so we can reference it later. You can upload files [in the dashboard here](https://platform.openai.com/storage/files), but it's possible to [upload files via API](https://developers.openai.com/api/docs/api-reference/files/create) as well. The samples below assume you are running the command in a directory where you saved the sample JSON data above to a file called `tickets.jsonl`:

Upload a test data file

```bash
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="evals" \
  -F file="@tickets.jsonl"
```

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const file = await openai.files.create({
    file: fs.createReadStream("tickets.jsonl"),
    purpose: "evals",
});

console.log(file);
```

```python
from openai import OpenAI
client = OpenAI()

file = client.files.create(
    file=open("tickets.jsonl", "rb"),
    purpose="evals"
)

print(file)
```


When you upload the file, make note of the unique `id` property in the response payload (also available in the UI if you uploaded via the browser) - we will need to reference that value later:

```json
{
  "object": "file",
  "id": "file-CwHg45Fo7YXwkWRPUkLNHW",
  "purpose": "evals",
  "filename": "tickets.jsonl",
  "bytes": 208,
  "created_at": 1742834798,
  "expires_at": null,
  "status": "processed",
  "status_details": null
}
```

### Creating an eval run

With our test data in place, let's evaluate a prompt and see how it performs against our test criteria. Via API, we can do this by [creating an eval run](https://developers.openai.com/api/docs/api-reference/evals/createRun).

Make sure to replace `YOUR_EVAL_ID` and `YOUR_FILE_ID` with the unique IDs of the eval configuration and test data files you created in the steps above.


  Create an eval run

```bash
curl https://api.openai.com/v1/evals/YOUR_EVAL_ID/runs \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Categorization text run",
        "data_source": {
            "type": "responses",
            "model": "gpt-5.5",
            "input_messages": {
                "type": "template",
                "template": [
                    {"role": "developer", "content": "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of Hardware, Software, or Other. Respond with only one of those words."},
                    {"role": "user", "content": "{{ item.ticket_text }}"}
                ]
            },
            "source": { "type": "file_id", "id": "YOUR_FILE_ID" }
        }
    }'
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const run = await openai.evals.runs.create("YOUR_EVAL_ID", {
    name: "Categorization text run",
    data_source: {
        type: "responses",
        model: "gpt-5.5",
        input_messages: {
            type: "template",
            template: [
                { role: "developer", content: "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of 'Hardware', 'Software', or 'Other'. Respond with only one of those words." },
                { role: "user", content: "{{ item.ticket_text }}" },
            ],
        },
        source: { type: "file_id", id: "YOUR_FILE_ID" },
    },
});

console.log(run);
```

```python
from openai import OpenAI
client = OpenAI()

run = client.evals.runs.create(
    "YOUR_EVAL_ID",
    name="Categorization text run",
    data_source={
        "type": "responses",
        "model": "gpt-5.5",
        "input_messages": {
            "type": "template",
            "template": [
                {"role": "developer", "content": "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of 'Hardware', 'Software', or 'Other'. Respond with only one of those words."},
                {"role": "user", "content": "{{ item.ticket_text }}"},
            ],
        },
        "source": {"type": "file_id", "id": "YOUR_FILE_ID"},
    },
)

print(run)
```





When we create the run, we set up a prompt using either a [Chat Completions](https://developers.openai.com/api/docs/guides/text?api-mode=chat) messages array or a [Responses](https://developers.openai.com/api/docs/api-reference/responses) input. This prompt is used to generate a model response for every line of test data in your data set. We can use the double curly brace syntax to template in the dynamic variable `item.ticket_text`, which is drawn from the current test data item.

If the eval run is successfully created, you'll receive an API response that looks like this:


```json
{
    "object": "eval.run",
    "id": "evalrun_67e44c73eb6481909f79a457749222c7",
    "eval_id": "eval_67e44c5becec81909704be0318146157",
    "report_url": "https://platform.openai.com/evaluation/evals/abc123",
    "status": "queued",
    "model": "gpt-4.1",
    "name": "Categorization text run",
    "created_at": 1743015028,
    "result_counts": { ... },
    "per_model_usage": null,
    "per_testing_criteria_results": null,
    "data_source": {
        "type": "responses",
        "source": {
            "type": "file_id",
            "id": "file-J7MoX9ToHXp2TutMEeYnwj"
        },
        "input_messages": {
            "type": "template",
            "template": [
                {
                    "type": "message",
                    "role": "developer",
                    "content": {
                        "type": "input_text",
                        "text": "You are an expert in...."
                    }
                },
                {
                    "type": "message",
                    "role": "user",
                    "content": {
                        "type": "input_text",
                        "text": "{{item.ticket_text}}"
                    }
                }
            ]
        },
        "model": "gpt-4.1",
        "sampling_params": null
    },
    "error": null,
    "metadata": {}
}
```




Your eval run has now been queued, and it will execute asynchronously as it processes every row in your data set, generating responses for testing with the prompt and model we specified.

## Analyze the results

To receive updates when a run succeeds, fails, or is canceled, create a webhook endpoint and subscribe to the `eval.run.succeeded`, `eval.run.failed`, and `eval.run.canceled` events. See the [webhooks guide](https://developers.openai.com/api/docs/guides/webhooks) for more details.

Depending on the size of your dataset, the eval run may take some time to complete. You can view current status in the dashboard, but you can also [fetch the current status of an eval run via API](https://developers.openai.com/api/docs/api-reference/evals/getRun):

Retrieve eval run status

```bash
curl https://api.openai.com/v1/evals/YOUR_EVAL_ID/runs/YOUR_RUN_ID \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json"
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const run = await openai.evals.runs.retrieve("YOUR_RUN_ID", {
    eval_id: "YOUR_EVAL_ID",
});
console.log(run);
```

```python
from openai import OpenAI
client = OpenAI()

run = client.evals.runs.retrieve("YOUR_EVAL_ID", "YOUR_RUN_ID")
print(run)
```


You'll need the UUID of both your eval and eval run to fetch its status. When you do, you'll see eval run data that looks like this:


```json
{
    "object": "eval.run",
    "id": "evalrun_67e44c73eb6481909f79a457749222c7",
    "eval_id": "eval_67e44c5becec81909704be0318146157",
    "report_url": "https://platform.openai.com/evaluation/evals/xxx",
    "status": "completed",
    "model": "gpt-4.1",
    "name": "Categorization text run",
    "created_at": 1743015028,
    "result_counts": {
        "total": 3,
        "errored": 0,
        "failed": 0,
        "passed": 3
    },
    "per_model_usage": [
        {
            "model_name": "gpt-4o-2024-08-06",
            "invocation_count": 3,
            "prompt_tokens": 166,
            "completion_tokens": 6,
            "total_tokens": 172,
            "cached_tokens": 0
        }
    ],
    "per_testing_criteria_results": [
        {
            "testing_criteria": "Match output to human label-40d67441-5000-4754-ab8c-181c125803ce",
            "passed": 3,
            "failed": 0
        }
    ],
    "data_source": {
        "type": "responses",
        "source": {
            "type": "file_id",
            "id": "file-J7MoX9ToHXp2TutMEeYnwj"
        },
        "input_messages": {
            "type": "template",
            "template": [
                {
                    "type": "message",
                    "role": "developer",
                    "content": {
                        "type": "input_text",
                        "text": "You are an expert in categorizing IT support tickets. Given the support ticket below, categorize the request into one of Hardware, Software, or Other. Respond with only one of those words."
                    }
                },
                {
                    "type": "message",
                    "role": "user",
                    "content": {
                        "type": "input_text",
                        "text": "{{item.ticket_text}}"
                    }
                }
            ]
        },
        "model": "gpt-4.1",
        "sampling_params": null
    },
    "error": null,
    "metadata": {}
}
```




The API response contains granular information about test criteria results, API usage for generating model responses, and a `report_url` property that takes you to a page in the dashboard where you can explore the results visually.

In our simple test, the model reliably generated the content we wanted for a small test case sample. In reality, you will often have to run your eval with more criteria, different prompts, and different data sets. But the process above gives you all the tools you need to build robust evals for your LLM apps!

## Next steps

Now you know how to create and run evals via API, and using the dashboard! Here are a few other resources that may be useful to you as you continue to improve your model results.

<a
  href="https://cookbook.openai.com/examples/evaluation/use-cases/regression"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Keep tabs on the performance of your prompts as you iterate on them.


</a>

<a
  href="https://cookbook.openai.com/examples/evaluation/use-cases/bulk-experimentation"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Compare the results of many different prompts and models at once.


</a>

<a
  href="https://cookbook.openai.com/examples/evaluation/use-cases/completion-monitoring"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Examine stored completions to test for prompt regressions.


</a>

[

<span slot="icon">
      </span>
    Improve a model's ability to generate responses tailored to your use case.

](https://developers.openai.com/api/docs/guides/fine-tuning)
[

<span slot="icon">
      </span>
    Learn how to distill large model results to smaller, cheaper, and faster
    models.

](https://developers.openai.com/api/docs/guides/distillation)
``````
:::
:::

