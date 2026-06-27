---
status: needs-review
sourceId: "855bfa851c74"
sourceChecksum: "855bfa851c74eeace24b96da394008f511ae193f94b50b9e41282279e2f9d3dc"
sourceUrl: "https://developers.openai.com/api/docs/guides/evals"
translatedAt: "2026-06-27T18:23:48.7352177+08:00"
translator: codex-gpt-5.5-xhigh
---

# 使用 evals

Evaluations（通常称为 **evals**）会测试模型输出，确保它们满足你指定的风格和内容标准。编写 evals 来了解你的 LLM applications 是否符合预期，尤其是在升级或尝试新模型时，是构建可靠应用的重要组成部分。

在本指南中，我们会重点介绍**如何使用 [Evals API](https://developers.openai.com/api/docs/api-reference/evals) 以编程方式配置 evals**。如果你愿意，也可以在 [OpenAI dashboard](https://platform.openai.com/evaluations) 中配置 evals。

OpenAI 正在弃用 Evals platform。现有 evals content 会在过渡窗口期间继续可用。Evals 将于 2026 年 10 月 31 日对现有用户变为 read-only，并计划于 2026 年 11 月 30 日关闭。请参阅 [deprecations page](https://developers.openai.com/api/docs/deprecations#2026-06-03-evals-platform) 了解当前 timeline。

如果你刚开始接触 evaluations，或希望在构建 eval 时有一个更迭代式的环境来实验，可以考虑改用 [Datasets](https://developers.openai.com/api/docs/guides/evaluation-getting-started)。

概括来说，为你的 LLM application 构建和运行 evals 有三个步骤。

1. 将要完成的任务描述为 eval
1. 使用 test inputs（prompt 和 input data）运行 eval
1. 分析结果，然后迭代并改进 prompt

这个过程有点类似 behavior-driven development（BDD）：在实现和测试系统之前，先指定系统应如何表现。让我们看看如何使用 [Evals API](https://developers.openai.com/api/docs/api-reference/evals) 完成上述每个步骤。

## 为任务创建 eval

创建 eval 的第一步，是描述要由模型完成的任务。假设我们希望使用模型把 IT support tickets 的内容分类到三个类别之一：`Hardware`、`Software` 或 `Other`。

要实现这个用例，你可以使用 [Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat) 或 [Responses API](https://developers.openai.com/api/docs/api-reference/responses)。下面两个示例都把 [developer message](https://developers.openai.com/api/docs/guides/text) 与包含 support ticket 文本的 user message 结合起来。


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
- `testing_criteria`：用于判断模型输出是否正确的 [graders](https://developers.openai.com/api/docs/guides/graders)。

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

在 test configuration 中，我们会引入 template syntax，即下面的 `{{` 和 `}}` brackets。这是我们将动态内容插入此 eval 测试的方式。

- `{{ item.correct_label }}` 指向 test data 中的 ground truth value。
- `{{ sample.output_text }}` 指向我们将从模型生成、用于评估 prompt 的内容——我们会在实际启动 eval run 时展示如何做到这一点。

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





创建 run 时，我们使用 [Chat Completions](https://developers.openai.com/api/docs/guides/text?api-mode=chat) messages array 或 [Responses](https://developers.openai.com/api/docs/api-reference/responses) input 设置 prompt。该 prompt 会用于对 data set 中每一行 test data 生成模型响应。我们可以使用双花括号语法，把动态变量 `item.ticket_text` 模板化插入；该变量来自当前 test data item。

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

要在 run 成功、失败或被取消时接收更新，请创建 webhook endpoint，并订阅 `eval.run.succeeded`、`eval.run.failed` 和 `eval.run.canceled` events。更多详情请参阅 [webhooks guide](https://developers.openai.com/api/docs/guides/webhooks)。

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

<a
  href="https://cookbook.openai.com/examples/evaluation/use-cases/regression"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    在迭代 prompts 时跟踪其表现。


</a>

<a
  href="https://cookbook.openai.com/examples/evaluation/use-cases/bulk-experimentation"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    一次比较许多不同 prompts 和 models 的结果。


</a>

<a
  href="https://cookbook.openai.com/examples/evaluation/use-cases/completion-monitoring"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    检查 stored completions，以测试 prompt regressions。


</a>

[

<span slot="icon">
      </span>
    提升模型生成针对你的用例定制 responses 的能力。

](https://developers.openai.com/api/docs/guides/fine-tuning)
[

<span slot="icon">
      </span>
    了解如何将大型模型结果蒸馏为更小、更便宜、更快的模型。

](https://developers.openai.com/api/docs/guides/distillation)
