---
title: "Graders 评分器"
description: "Learn about graders used for evals and fine-tuning."
outline: deep
---

# Graders 评分器

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/graders](https://developers.openai.com/api/docs/guides/graders)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/graders.md](https://developers.openai.com/api/docs/guides/graders.md)
- 抓取时间：2026-06-27T05:54:02.843Z
- Checksum：`f672550f605c38db9509fa4e45f2a77385565cca5c45187dab1a07c23200028e`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Graders 是一种根据参考答案评估模型表现的方式。我们的 [graders API](https://developers.openai.com/api/docs/api-reference/graders) 可用于测试你的 graders、试验结果，并改进你的 fine-tuning 或 evaluation 框架，以获得你想要的结果。

OpenAI 正在弃用 evals 和 fine-tuning 工作流中使用的 graders。请参阅 [deprecations 页面](/mirror/api/docs/deprecations)，了解当前的过渡时间线。

## 概览

Graders 允许你将参考答案与对应的模型生成答案进行比较，并返回 0 到 1 范围内的分数。有时，给模型的答案部分得分会比只给二元的 0 或 1 更有帮助。

Graders 以 JSON 格式指定，并且有多种类型：

- [String check](/mirror/api/docs/guides/graders#string-check-graders)
- [Text similarity](/mirror/api/docs/guides/graders#text-similarity-graders)
- [Score model grader](/mirror/api/docs/guides/graders#score-model-graders)
- [Python code execution](/mirror/api/docs/guides/graders#python-graders)

在 reinforcement fine-tuning 中，你可以使用 [multigraders](/mirror/api/docs/guides/graders#multigraders) 嵌套并组合 graders。

使用本指南了解每种 grader 类型并查看入门示例。要构建 grader 并开始使用 reinforcement fine-tuning，请参阅 [RFT guide](/mirror/api/docs/guides/reinforcement-fine-tuning)。或者，要开始使用 evals，请参阅 [Evals guide](/mirror/api/docs/guides/evals)。

## 模板

某些 graders 的输入会使用模板语法，以便用同一份配置为多个示例评分。任何带有 `&#123;&#123; &#125;&#125;` 双花括号的字符串都会被替换为变量值。

`&#123;&#123;&#125;&#125;` 中的每个输入都必须包含一个 _namespace_ 和一个 _variable_，格式如下：`&#123;&#123; namespace.variable &#125;&#125;`。唯一支持的命名空间是 `item` 和 `sample`。

所有嵌套变量都可以使用类似 JSON path 的语法访问。

### Item namespace

对于 evals，item namespace 会填充来自输入数据源的变量；对于 fine-tuning，会填充每个 dataset item 中的变量。例如，如果某一行包含以下内容：

```json
{
  "reference_answer": "..."
}
```

可以在 grader 中通过 `&#123;&#123; item.reference_answer &#125;&#125;` 使用它。

### Sample namespace

sample namespace 会填充 evals 期间模型采样步骤中的变量，或 fine-tuning 步骤中的变量。它包含以下变量：

- `output_text`，字符串形式的模型输出内容。
- `output_json`，JSON 对象形式的模型输出内容；仅当 sample 中包含 `response_format` 时才有。
- `output_tools`，模型输出的 `tool_calls`，其结构与 [chat completions API](https://developers.openai.com/api/docs/api-reference/chat/object) 中的输出工具调用相同。
- `choices`，输出 choices，其结构与 [chat completions API](https://developers.openai.com/api/docs/api-reference/chat/object) 中的输出 choices 相同。
- `output_audio`，包含 Base64 编码的 `data` 和 `transcript` 的模型音频输出对象。

例如，要以字符串形式访问模型输出内容，可以在 grader 中使用 `&#123;&#123; sample.output_text &#125;&#125;`。

关于工具调用评分的细节

当训练模型改进 tool-calling 行为时，你需要编写 grader，让它基于 `sample.output_tools` 变量运行。该变量的内容与 `response.choices[0].message.tool_calls` 的内容相同（[参见 function calling 文档](/mirror/api/docs/guides/function-calling)）。

给工具调用评分的一种常见方式是使用两个 graders：一个检查被调用工具的名称，另一个检查被调用函数的参数。下面展示了一个执行这种检查的 grader 示例：

```json
{
  "type": "multi",
  "graders": {
    "function_name": {
      "name": "function_name",
      "type": "string_check",
      "input": "get_acceptors",
      "reference": "{{sample.output_tools[0].function.name}}",
      "operation": "eq"
    },
    "arguments": {
      "name": "arguments",
      "type": "string_check",
      "input": "{\"smiles\": \"{{item.smiles}}\"}",
      "reference": "{{sample.output_tools[0].function.arguments}}",
      "operation": "eq"
    }
  },
  "calculate_output": "0.5 * function_name + 0.5 * arguments"
}
```

这是一个 `multi` grader，它组合了两个简单的 `string_check` graders：第一个通过 `sample.output_tools[0].function.name` 变量检查被调用工具的名称，第二个通过 `sample.output_tools[0].function.arguments` 变量检查被调用函数的参数。`calculate_output` 字段用于把两个分数组合成一个分数。

如果函数参数只有细微错误，例如提交了 `1` 而不是浮点数 `1.0`，或州名使用缩写而不是完整拼写，`arguments` grader 容易给模型过低奖励。为避免这种情况，你可以使用 `text_similarity` grader 替代 `string_check` grader，或使用 `score_model` grader 让 LLM 检查语义相似度。

## String check grader

使用这些简单的字符串操作返回 0 或 1。String check graders 适合为直接的通过/失败答案打分，例如城市名称是否正确、yes/no 答案，或答案是否包含/以正确信息开头。

```json
{
    "type": "string_check",
    "name": string,
    "operation": "eq" | "ne" | "like" | "ilike",
    "input": string,
    "reference": string,
}
```

string-check-grader 支持的操作包括：

- `eq`：如果 input 与 reference 匹配（区分大小写）则返回 1，否则返回 0
- `neq`：如果 input 与 reference 不匹配（区分大小写）则返回 1，否则返回 0
- `like`：如果 input 包含 reference（区分大小写）则返回 1，否则返回 0
- `ilike`：如果 input 包含 reference（不区分大小写）则返回 1，否则返回 0

## Text similarity grader

当你要评估模型生成输出与参考答案有多接近，并使用不同 evaluation frameworks 给出分数时，请使用 text similarity graders。

这对开放式文本回答很有用。例如，如果你的 dataset 包含专家撰写的段落式参考答案，以数值形式查看模型生成答案与该内容的接近程度会很有帮助。

```json
{
    "type": "text_similarity",
    "name": string,
    "input": string,
    "reference": string,
    "pass_threshold": number,
    "evaluation_metric": "fuzzy_match" | "bleu" | "gleu" | "meteor" | "cosine" | "rouge_1" | "rouge_2" | "rouge_3" | "rouge_4" | "rouge_5" | "rouge_l"
}
```

`string-similarity-grader` 支持的操作包括：

- `fuzzy_match`：使用 `rapidfuzz` 在 input 和 reference 之间执行模糊字符串匹配
- `bleu`：计算 input 与 reference 之间的 BLEU 分数
- `gleu`：计算 input 与 reference 之间的 Google BLEU 分数
- `meteor`：计算 input 与 reference 之间的 METEOR 分数
- `cosine`：使用 `text-embedding-3-large` 计算嵌入后的 input 与 reference 之间的 Cosine similarity。仅适用于 evals。
- `rouge-*`：计算 input 与 reference 之间的 ROUGE 分数

## Model graders

一般而言，使用 model grader 意味着提示一个单独的模型来给你正在 fine-tune 的模型输出评分。你的两个模型会协同完成 reinforcement fine-tuning。_grader model_ 会评估 _training model_。

### Score model graders

Score model grader 会接收 input，并根据给定范围内的 prompt 返回一个数值分数。

```json
{
    "type": "score_model",
    "name": string,
    "input": Message[],
    "model": string,
    "pass_threshold": number,
    "range": number[],
    "sampling_params": {
        "seed": number,
        "top_p": number,
        "temperature": number,
        "max_completions_tokens": number,
        "reasoning_effort": "minimal" | "low" | "medium" | "high"
    }
}
```

其中每条 message 的形式如下：

```json
{
    "role": "system" | "developer" | "user" | "assistant",
    "content": str
}

```

要使用 score model grader，input 是一个 chat messages 列表，每条 message 都包含 `role` 和 `content`。grader 的输出会被截断到给定的 `range` 内，对于所有非数值输出，默认值为 0。
在每条 message 内，可以使用与其他常见 graders 相同的模板来引用 ground truth 或 model sample。

下面是一个完整可运行的代码示例：

```python
import os
import requests

# get the API key from environment
api_key = os.environ["OPENAI_API_KEY"]
headers = {"Authorization": f"Bearer {api_key}"}

# define a dummy grader for illustration purposes
grader = {
   "type": "score_model",
   "name": "my_score_model",
   "input": [
        {
            "role": "system",
            "content": "You are an expert grader. If the reference and model answer are exact matches, output a score of 1. If they are somewhat similar in meaning, output a score in 0.5. Otherwise, give a score of 0."
        },
        {
            "role": "user",
            "content": "Reference: {{ item.reference_answer }}. Model answer: {{ sample.output_text }}"
        }
   ],
   "pass_threshold": 0.5,
   "model": "o4-mini-2025-04-16",
   "range": [0, 1],
   "sampling_params": {
       "max_completions_tokens": 32768,
       "top_p": 1,
       "reasoning_effort": "medium"
   },
}

# validate the grader
payload = {"grader": grader}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/validate",
    json=payload,
    headers=headers
)
print("validate response:", response.text)

# run the grader with a test reference and sample
payload = {
  "grader": grader,
  "item": {
     "reference_answer": 1.0
  },
  "model_sample": "0.9"
}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/run",
    json=payload,
    headers=headers
)
print("run response:", response.text)
```


#### Score model grader outputs

在底层，`score_model` grader 会使用提供的 prompt 和 sampling parameters 查询所请求的模型，并要求模型以特定 response format 返回响应。所使用的 response format 如下：

```json
{
  "result": float,
  "steps": ReasoningStep[],
}
```

其中每个 reasoning step 的形式如下：

```json
{
    description: string,
    conclusion: string
}
```

这种格式不仅会向模型查询数值型 `result`（该查询的 reward value），还会给模型一些空间来思考评分背后的推理。当你编写 grader prompt 时，按名称明确引用这两个字段可能很有用（例如，“在推理步骤的 conclusion 中包含关于分子中存在的化学键类型的推理”，或“如果输入不满足条件 X，则在 `result` 字段中返回 -1.0”）。

### Model grader 约束

- `model` 参数只支持以下模型`
  - `gpt-4o-2024-08-06`
  - `gpt-4o-mini-2024-07-18`
  - `gpt-4.1-2025-04-14`
  - `gpt-4.1-mini-2025-04-14`
  - `gpt-4.1-nano-2025-04-14`
  - `o1-2024-12-17`
  - `o3-mini-2025-01-31`
  - `o3-2025-04-16`
  - `o4-mini-2025-04-16`
- reasoning models 不支持更改 `temperature`。
- non-reasoning models 不支持 `reasoning_effort`。

### 如何编写 grader prompts

编写 grader prompts 是一个迭代过程。迭代 model grader prompt 的最佳方式是创建一个 model grader eval。为此，你需要：

1. **Task prompts**：为期望任务编写极其详细的 prompts，包含分步骤指令和大量上下文中的具体示例。
1. **由模型或人类专家生成的答案**：提供大量高质量答案示例，既包括模型答案，也包括可信人类专家的答案。
1. **这些答案对应的 ground truth grades**：确定好的分数应是什么样。例如，你的人类专家评分应为 1。

然后，你可以自动评估 model grader 区分不同质量等级答案的效果。随着时间推移，当你发现 edge cases 并通过修改 prompt 修补它们时，把这些 edge cases 添加到 model grader eval 中。

例如，假设你从人类专家那里知道哪些答案最好：

```
answer_1 > answer_2 > answer_3
```

验证 model grader 的答案是否符合这一排序：

```
model_grader(answer_1, reference_answer) > model_grader(answer_2, reference_answer) > model_grader(answer_3, reference_answer)
```

### Grader hacking

正在训练的模型有时会学会利用 model graders 的弱点，也称为“grader hacking”或“reward hacking”。你可以通过检查模型在 model grader evals 和专家 human evals 上的表现来检测这种情况。已经 hack 了 grader 的模型会在 model grader evals 上得分很高，但在专家 human evaluations 上得分很低。随着时间推移，我们打算改进 API 中的可观测性，让训练期间更容易检测到这种情况。

## Python graders

这个 grader 允许你执行任意 python code 来给模型输出评分。grader 预期存在一个 grade function，它接收两个参数并输出一个 float value。任何其他结果（exception、无效 float value 等）都会被标记为 invalid，并返回 0 分。

```json
{
  "type": "python",
  "source": "def grade(sample, item):\n    return 1.0",
  "image_tag": "2025-05-08"
}
```

python source code 必须包含一个 grade function，它正好接收两个参数，并返回一个作为 grade 的 float value。

```python
from typing import Any

def grade(sample: dict[str, Any], item: dict[str, Any]) -> float:
    # your logic here
    return 1.0
```

提供给 grading function 的第一个参数将是一个字典，其中填充了训练期间模型输出，供你评分。只有在输出使用 `response_format` 时，`output_json` 才会被填充。

```json
{
    "choices": [...],
    "output_text": "...",
    "output_json": {},
    "output_tools": [...],
    "output_audio": {}
}
```

提供的第二个参数是一个填充了输入评分上下文的字典。对于 evals，这会包含来自数据源的 keys。对于 fine-tuning，这会包含每个训练数据行中的 keys。

```json
{
    "reference_answer": "...",
    "my_key": {...}
}
```

下面是一个可运行示例：

```python
import os
import requests

# get the API key from environment
api_key = os.environ["OPENAI_API_KEY"]
headers = {"Authorization": f"Bearer {api_key}"}

grading_function = """
from rapidfuzz import fuzz, utils

def grade(sample, item) -> float:
    output_text = sample["output_text"]
    reference_answer = item["reference_answer"]
    return fuzz.WRatio(output_text, reference_answer, processor=utils.default_process) / 100.0
"""

# define a dummy grader for illustration purposes
grader = {
    "type": "python",
    "source": grading_function
}

# validate the grader
payload = {"grader": grader}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/validate",
    json=payload,
    headers=headers
)
print("validate request_id:", response.headers["x-request-id"])
print("validate response:", response.text)

# run the grader with a test reference and sample
payload = {
  "grader": grader,
  "item": {
     "reference_answer": "fuzzy wuzzy had no hair"
  },
  "model_sample": "fuzzy wuzzy was a bear"
}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/run",
    json=payload,
    headers=headers
)
print("run request_id:", response.headers["x-request-id"])
print("run response:", response.text)
```


**Tip:**
如果你不想手动把 grading function 放进字符串中，也可以使用 `importlib` 和 `inspect` 从 Python 文件加载它。例如，如果你的 grader function 位于名为 `grader.py` 的文件中，可以这样做：

```python
import importlib
import inspect

grader_module = importlib.import_module("grader")
grader = {
    "type": "python",
    "source": inspect.getsource(grader_module)
}
```

这会自动把你的 `grader.py` 文件的整个 source code 用作 grader，这对较长的 graders 会很有帮助。

### 技术约束

- 你上传的代码必须小于 `256kB`，且没有网络访问权限。
- grading execution 本身限制为 2 分钟。
- 运行时会给你 2Gb 内存和 1Gb 磁盘空间可用。
- 存在 2 CPU cores 的限制，超过这个用量的任何使用都会导致 throttling

对于 image tag `2025-05-08`，执行时可使用以下第三方 packages：

```
numpy==2.2.4
scipy==1.15.2
sympy==1.13.3
pandas==2.2.3
rapidfuzz==3.10.1
scikit-learn==1.6.1
rouge-score==0.1.2
deepdiff==8.4.2
jsonschema==4.23.0
pydantic==2.10.6
pyyaml==6.0.2
nltk==3.9.1
sqlparse==0.5.3
rdkit==2024.9.6
scikit-bio==0.6.3
ast-grep-py==0.36.2
```

此外，还可使用以下 nltk corpora：

```
punkt
stopwords
wordnet
omw-1.4
names
```

## Multigraders

&gt; 目前，这个 grader 仅用于 Reinforcement fine-tuning

`multigrader` 对象会组合多个 graders 的输出以生成单个分数。Multigraders 的工作方式是计算其他 grader 对象字段上的 grades，并将这些子 grades 转换成整体 grade。当正确答案依赖多个条件同时为真时，这很有用，例如文本相似 _并且_ 答案包含某个特定字符串。

例如，假设你希望模型输出包含以下两个字段的 JSON：

```json
{
  "name": "John Doe",
  "email": "john.doe@gmail.com"
}
```

你会希望 grader 比较这两个字段，然后取它们的平均值。

你可以通过把多个 graders 组合成一个 object grader，然后定义一个公式，根据每个字段计算输出分数：

```json
{
  "type": "multi",
  "graders": {
    "name": {
      "name": "name_grader",
      "type": "text_similarity",
      "input": "{{sample.output_json.name}}",
      "reference": "{{item.name}}",
      "evaluation_metric": "fuzzy_match",
      "pass_threshold": 0.9
    },
    "email": {
      "name": "email_grader",
      "type": "string_check",
      "input": "{{sample.output_json.email}}",
      "reference": "{{item.email}}",
      "operation": "eq"
    }
  },
  "calculate_output": "(name + email) / 2"
}
```

在这个示例中，模型把 email 完全写对很重要（`string_check` 返回 0 或 1），但我们可以容忍 name 上的一些拼写错误（`text_similarity` 返回 0 到 1 的范围）。email 错误的 samples 会得 0 到 0.5 分，email 正确的 samples 会得 0.5 到 1.0 分。

你不能创建内部嵌套了另一个 multigrader 的 multigrader。

calculate output 字段会把输入 `graders` 的 keys 作为可用变量，并支持以下功能：

**Operators**

- `+` (addition)
- `-` (subtraction)
- `*` (multiplication)
- `/` (division)
- `^` (power)

**Functions**

- `min`
- `max`
- `abs`
- `floor`
- `ceil`
- `exp`
- `sqrt`
- `log`

## 限制与提示

设计和创建 graders 是一个迭代过程。从小处开始，进行试验，并持续修改以获得更好结果。

### 设计提示

要从 graders 中获得最大价值，请使用以下设计原则：

- **生成平滑分数，而不是通过/失败印章**。随着答案改进而逐渐变化的分数，可以帮助 optimizer 看出哪些变化重要。
- **防范 reward hacking**。当模型找到一条捷径，在没有真实能力的情况下获得高分时，就会发生这种情况。让你的 grading system 难以被钻空子。
- **避免偏斜数据**。如果 dataset 中某个标签大多数时候都会出现，模型就容易猜这个标签。请平衡数据集，或提高稀有情况的权重，让模型必须思考。
- **当代码不够用时，使用 LLM-as-a-judge**。对于丰富、开放式的答案，请让另一个语言模型评分。在构建 LLM graders 时，请让多个候选回复和 ground truths 经过你的 LLM judge，确保评分稳定并与偏好一致。在 prompt 中提供优秀、公平和较差答案的 few-shot examples。

:::

## English source

::: details 展开英文原文
::: v-pre
Graders are a way to evaluate your model's performance against reference answers. Our [graders API](https://developers.openai.com/api/docs/api-reference/graders) is a way to test your graders, experiment with results, and improve your fine-tuning or evaluation framework to get the results you want.

OpenAI is deprecating graders as part of the evals and fine-tuning workflows
  they support. See the [deprecations page](/mirror/api/docs/deprecations) for the
  current transition timelines.

## Overview

Graders let you compare reference answers to the corresponding model-generated answer and return a grade in the range from 0 to 1. It's sometimes helpful to give the model partial credit for an answer, rather than a binary 0 or 1.

Graders are specified in JSON format, and there are several types:

- [String check](/mirror/api/docs/guides/graders#string-check-graders)
- [Text similarity](/mirror/api/docs/guides/graders#text-similarity-graders)
- [Score model grader](/mirror/api/docs/guides/graders#score-model-graders)
- [Python code execution](/mirror/api/docs/guides/graders#python-graders)

In reinforcement fine-tuning, you can nest and combine graders by using [multigraders](/mirror/api/docs/guides/graders#multigraders).

Use this guide to learn about each grader type and see starter examples. To build a grader and get started with reinforcement fine-tuning, see the [RFT guide](/mirror/api/docs/guides/reinforcement-fine-tuning). Or to get started with evals, see the [Evals guide](/mirror/api/docs/guides/evals).

## Templating

The inputs to certain graders use a templating syntax to grade multiple examples with the same configuration. Any string with `&#123;&#123; &#125;&#125;` double curly braces will be substituted with the variable value.

Each input inside the `&#123;&#123;&#125;&#125;` must include a _namespace_ and a _variable_ with the following format `&#123;&#123; namespace.variable &#125;&#125;`. The only supported namespaces are `item` and `sample`.

All nested variables can be accessed with JSON path like syntax.

### Item namespace

The item namespace will be populated with variables from the input data source for evals, and from each dataset item for fine-tuning. For example, if a row contains the following

```json
{
  "reference_answer": "..."
}
```

This can be used within the grader as `&#123;&#123; item.reference_answer &#125;&#125;`.

### Sample namespace

The sample namespace will be populated with variables from the model sampling step during evals or during the fine-tuning step. The following variables are included

- `output_text`, the model output content as a string.
- `output_json`, the model output content as a JSON object, only if `response_format` is included in the sample.
- `output_tools`, the model output `tool_calls`, which have the same structure as output tool calls in the [chat completions API](https://developers.openai.com/api/docs/api-reference/chat/object).
- `choices`, the output choices, which has the same structure as output choices in the [chat completions API](https://developers.openai.com/api/docs/api-reference/chat/object).
- `output_audio`, the model audio output object containing Base64-encoded `data` and a `transcript`.

For example, to access the model output content as a string, `&#123;&#123; sample.output_text &#125;&#125;` can be used within the grader.

Details on grading tool calls

When training a model to improve tool-calling behavior, you will need to write your grader to operate over the `sample.output_tools` variable. The contents of this variable will be the same as the contents of the `response.choices[0].message.tool_calls` ([see function calling docs](/mirror/api/docs/guides/function-calling)).

A common way of grading tool calls is to use two graders, one that checks the name of the tool that is called and another that checks the arguments of the called function. An example of a grader that does this is shown below:

```json
{
  "type": "multi",
  "graders": {
    "function_name": {
      "name": "function_name",
      "type": "string_check",
      "input": "get_acceptors",
      "reference": "{{sample.output_tools[0].function.name}}",
      "operation": "eq"
    },
    "arguments": {
      "name": "arguments",
      "type": "string_check",
      "input": "{\"smiles\": \"{{item.smiles}}\"}",
      "reference": "{{sample.output_tools[0].function.arguments}}",
      "operation": "eq"
    }
  },
  "calculate_output": "0.5 * function_name + 0.5 * arguments"
}
```

This is a `multi` grader that combined two simple `string_check` graders, the first checks the name of the tool called via the `sample.output_tools[0].function.name` variable, and the second checks the arguments of the called function via the `sample.output_tools[0].function.arguments` variable. The `calculate_output` field is used to combine the two scores into a single score.

The `arguments` grader is prone to under-rewarding the model if the function arguments are subtly incorrect, like if `1` is submitted instead of the floating point `1.0`, or if a state name is given as an abbreviation instead of spelling it out. To avoid this, you can use a `text_similarity` grader instead of a `string_check` grader, or a `score_model` grader to have a LLM check for semantic similarity.

## String check grader

Use these simple string operations to return a 0 or 1. String check graders are good for scoring straightforward pass or fail answers—for example, the correct name of a city, a yes or no answer, or an answer containing or starting with the correct information.

```json
{
    "type": "string_check",
    "name": string,
    "operation": "eq" | "ne" | "like" | "ilike",
    "input": string,
    "reference": string,
}
```

Operations supported for string-check-grader are:

- `eq`: Returns 1 if the input matches the reference (case-sensitive), 0 otherwise
- `neq`: Returns 1 if the input does not match the reference (case-sensitive), 0 otherwise
- `like`: Returns 1 if the input contains the reference (case-sensitive), 0 otherwise
- `ilike`: Returns 1 if the input contains the reference (not case-sensitive), 0 otherwise

## Text similarity grader

Use text similarity graders when to evaluate how close the model-generated output is to the reference, scored with various evaluation frameworks.

This is useful for open-ended text responses. For example, if your dataset contains reference answers from experts in paragraph form, it's helpful to see how close your model-generated answer is to that content, in numerical form.

```json
{
    "type": "text_similarity",
    "name": string,
    "input": string,
    "reference": string,
    "pass_threshold": number,
    "evaluation_metric": "fuzzy_match" | "bleu" | "gleu" | "meteor" | "cosine" | "rouge_1" | "rouge_2" | "rouge_3" | "rouge_4" | "rouge_5" | "rouge_l"
}
```

Operations supported for `string-similarity-grader` are:

- `fuzzy_match`: Fuzzy string match between input and reference, using `rapidfuzz`
- `bleu`: Computes the BLEU score between input and reference
- `gleu`: Computes the Google BLEU score between input and reference
- `meteor`: Computes the METEOR score between input and reference
- `cosine`: Computes Cosine similarity between embedded input and reference, using `text-embedding-3-large`. Only available for evals.
- `rouge-*`: Computes the ROUGE score between input and reference

## Model graders

In general, using a model grader means prompting a separate model to grade the outputs of the model you're fine-tuning. Your two models work together to do reinforcement fine-tuning. The _grader model_ evaluates the _training model_.

### Score model graders

A score model grader will take the input and return a numeric score based on the prompt within the given range.

```json
{
    "type": "score_model",
    "name": string,
    "input": Message[],
    "model": string,
    "pass_threshold": number,
    "range": number[],
    "sampling_params": {
        "seed": number,
        "top_p": number,
        "temperature": number,
        "max_completions_tokens": number,
        "reasoning_effort": "minimal" | "low" | "medium" | "high"
    }
}
```

Where each message is of the following form:

```json
{
    "role": "system" | "developer" | "user" | "assistant",
    "content": str
}

```

To use a score model grader, the input is a list of chat messages, each containing a `role` and `content`. The output of the grader will be truncated to the given `range`, and default to 0 for all non-numeric outputs.
Within each message, the same templating can be used as with other common graders to reference the ground truth or model sample.

Here’s a full runnable code sample:

```python
import os
import requests

# get the API key from environment
api_key = os.environ["OPENAI_API_KEY"]
headers = {"Authorization": f"Bearer {api_key}"}

# define a dummy grader for illustration purposes
grader = {
   "type": "score_model",
   "name": "my_score_model",
   "input": [
        {
            "role": "system",
            "content": "You are an expert grader. If the reference and model answer are exact matches, output a score of 1. If they are somewhat similar in meaning, output a score in 0.5. Otherwise, give a score of 0."
        },
        {
            "role": "user",
            "content": "Reference: {{ item.reference_answer }}. Model answer: {{ sample.output_text }}"
        }
   ],
   "pass_threshold": 0.5,
   "model": "o4-mini-2025-04-16",
   "range": [0, 1],
   "sampling_params": {
       "max_completions_tokens": 32768,
       "top_p": 1,
       "reasoning_effort": "medium"
   },
}

# validate the grader
payload = {"grader": grader}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/validate",
    json=payload,
    headers=headers
)
print("validate response:", response.text)

# run the grader with a test reference and sample
payload = {
  "grader": grader,
  "item": {
     "reference_answer": 1.0
  },
  "model_sample": "0.9"
}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/run",
    json=payload,
    headers=headers
)
print("run response:", response.text)
```


#### Score model grader outputs

Under the hood, the `score_model` grader will query the requested model with the provided prompt and sampling parameters and will request a response in a specific response format. The response format that is used is provided below

```json
{
  "result": float,
  "steps": ReasoningStep[],
}
```

Where each reasoning step is of the form

```json
{
    description: string,
    conclusion: string
}
```

This format queries the model not just for the numeric `result` (the reward value for the query), but also provides the model some space to think through the reasoning behind the score. When you are writing your grader prompt, it may be useful to refer to these two fields by name explicitly (e.g. "include reasoning about the type of chemical bonds present in the molecule in the conclusion of your reasoning step", or "return a value of -1.0 in the `result` field if the inputs do not satisfy condition X").

### Model grader constraints

- Only the following models are supported for the `model` parameter`
  - `gpt-4o-2024-08-06`
  - `gpt-4o-mini-2024-07-18`
  - `gpt-4.1-2025-04-14`
  - `gpt-4.1-mini-2025-04-14`
  - `gpt-4.1-nano-2025-04-14`
  - `o1-2024-12-17`
  - `o3-mini-2025-01-31`
  - `o3-2025-04-16`
  - `o4-mini-2025-04-16`
- `temperature` changes not supported for reasoning models.
- `reasoning_effort` is not supported for non-reasoning models.

### How to write grader prompts

Writing grader prompts is an iterative process. The best way to iterate on a model grader prompt is to create a model grader eval. To do this, you need:

1. **Task prompts**: Write extremely detailed prompts for the desired task, with step-by-step instructions and many specific examples in context.
1. **Answers generated by a model or human expert**: Provide many high quality examples of answers, both from the model and trusted human experts.
1. **Corresponding ground truth grades for those answers**: Establish what a good grade looks like. For example, your human expert grades should be 1.

Then you can automatically evaluate how effectively the model grader distinguishes answers of different quality levels. Over time, add edge cases into your model grader eval as you discover and patch them with changes to the prompt.

For example, say you know from your human experts which answers are best:

```
answer_1 > answer_2 > answer_3
```

Verify that the model grader's answers match that:

```
model_grader(answer_1, reference_answer) > model_grader(answer_2, reference_answer) > model_grader(answer_3, reference_answer)
```

### Grader hacking

Models being trained sometimes learn to exploit weaknesses in model graders, also known as “grader hacking” or “reward hacking." You can detect this by checking the model's performance across model grader evals and expert human evals. A model that's hacked the grader will score highly on model grader evals but score poorly on expert human evaluations. Over time, we intend to improve observability in the API to make it easier to detect this during training.

## Python graders

This grader allows you to execute arbitrary python code to grade the model output. The grader expects a grade function to be present that takes in two arguments and outputs a float value. Any other result (exception, invalid float value, etc.) will be marked as invalid and return a 0 grade.

```json
{
  "type": "python",
  "source": "def grade(sample, item):\n    return 1.0",
  "image_tag": "2025-05-08"
}
```

The python source code must contain a grade function that takes in exactly two arguments and returns a float value as a grade.

```python
from typing import Any

def grade(sample: dict[str, Any], item: dict[str, Any]) -> float:
    # your logic here
    return 1.0
```

The first argument supplied to the grading function will be a dictionary populated with the model’s output during training for you to grade. `output_json` will only be populated if the output uses `response_format`.

```json
{
    "choices": [...],
    "output_text": "...",
    "output_json": {},
    "output_tools": [...],
    "output_audio": {}
}
```

The second argument supplied is a dictionary populated with input grading context. For evals, this will include keys from the data source. For fine-tuning this will include keys from each training data row.

```json
{
    "reference_answer": "...",
    "my_key": {...}
}
```

Here's a working example:

```python
import os
import requests

# get the API key from environment
api_key = os.environ["OPENAI_API_KEY"]
headers = {"Authorization": f"Bearer {api_key}"}

grading_function = """
from rapidfuzz import fuzz, utils

def grade(sample, item) -> float:
    output_text = sample["output_text"]
    reference_answer = item["reference_answer"]
    return fuzz.WRatio(output_text, reference_answer, processor=utils.default_process) / 100.0
"""

# define a dummy grader for illustration purposes
grader = {
    "type": "python",
    "source": grading_function
}

# validate the grader
payload = {"grader": grader}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/validate",
    json=payload,
    headers=headers
)
print("validate request_id:", response.headers["x-request-id"])
print("validate response:", response.text)

# run the grader with a test reference and sample
payload = {
  "grader": grader,
  "item": {
     "reference_answer": "fuzzy wuzzy had no hair"
  },
  "model_sample": "fuzzy wuzzy was a bear"
}
response = requests.post(
    "https://api.openai.com/v1/fine_tuning/alpha/graders/run",
    json=payload,
    headers=headers
)
print("run request_id:", response.headers["x-request-id"])
print("run response:", response.text)
```


**Tip:**
If you don't want to manually put your grading function in a string, you can also load it from a Python file using `importlib` and `inspect`. For example, if your grader function is in a file named `grader.py`, you can do:

```python
import importlib
import inspect

grader_module = importlib.import_module("grader")
grader = {
    "type": "python",
    "source": inspect.getsource(grader_module)
}
```

This will automatically use the entire source code of your `grader.py` file as the grader which can be helpful for longer graders.

### Technical constraints

- Your uploaded code must be less than `256kB` and will not have network access.
- The grading execution itself is limited to 2 minutes.
- At runtime you will be given a limit of 2Gb of memory and 1Gb of disk space to use.
- There's a limit of 2 CPU cores—any usage above this amount will result in throttling

The following third-party packages are available at execution time for the image tag `2025-05-08`

```
numpy==2.2.4
scipy==1.15.2
sympy==1.13.3
pandas==2.2.3
rapidfuzz==3.10.1
scikit-learn==1.6.1
rouge-score==0.1.2
deepdiff==8.4.2
jsonschema==4.23.0
pydantic==2.10.6
pyyaml==6.0.2
nltk==3.9.1
sqlparse==0.5.3
rdkit==2024.9.6
scikit-bio==0.6.3
ast-grep-py==0.36.2
```

Additionally the following nltk corpora are available:

```
punkt
stopwords
wordnet
omw-1.4
names
```

## Multigraders

&gt; Currently, this grader is only used for Reinforcement fine-tuning

A `multigrader` object combines the output of multiple graders to produce a single score. Multigraders work by computing grades over the fields of other grader objects and turning those sub-grades into an overall grade. This is useful when a correct answer depends on multiple things being true—for example, that the text is similar _and_ that the answer contains a specific string.

As an example, say you wanted the model to output JSON with the following two fields:

```json
{
  "name": "John Doe",
  "email": "john.doe@gmail.com"
}
```

You'd want your grader to compare the two fields and then take the average between them.

You can do this by combining multiple graders into an object grader, and then defining a formula to calculate the output score based on each field:

```json
{
  "type": "multi",
  "graders": {
    "name": {
      "name": "name_grader",
      "type": "text_similarity",
      "input": "{{sample.output_json.name}}",
      "reference": "{{item.name}}",
      "evaluation_metric": "fuzzy_match",
      "pass_threshold": 0.9
    },
    "email": {
      "name": "email_grader",
      "type": "string_check",
      "input": "{{sample.output_json.email}}",
      "reference": "{{item.email}}",
      "operation": "eq"
    }
  },
  "calculate_output": "(name + email) / 2"
}
```

In this example, it’s important for the model to get the email exactly right (`string_check` returns either 0 or 1) but we tolerate some misspellings on the name (`text_similarity` returns range from 0 to 1). Samples that get the email wrong will score between 0-0.5, and samples that get the email right will score between 0.5-1.0.

You cannot create a multigrader with a nested multigrader inside.

The calculate output field will have the keys of the input `graders` as possible variables and the following features are supported:

**Operators**

- `+` (addition)
- `-` (subtraction)
- `*` (multiplication)
- `/` (division)
- `^` (power)

**Functions**

- `min`
- `max`
- `abs`
- `floor`
- `ceil`
- `exp`
- `sqrt`
- `log`

## Limitations and tips

Designing and creating graders is an iterative process. Start small, experiment, and continue to make changes to get better results.

### Design tips

To get the most value from your graders, use these design principles:

- **Produce a smooth score, not a pass/fail stamp**. A score that shifts gradually as answers improve helps the optimizer see which changes matter.
- **Guard against reward hacking**. This happens when the model finds a shortcut that earns high scores without real skill. Make it hard to loophole your grading system.
- **Avoid skewed data**. Datasets in which one label shows up most of the time invite the model to guess that label. Balance the set or up‑weight rare cases so the model must think.
- **Use an LLM‑as‑a-judge when code falls short**. For rich, open‑ended answers, ask another language model to grade. When building LLM graders, run multiple candidate responses and ground truths through your LLM judge to ensure grading is stable and aligned with preference. Provide few-shot examples of great, fair, and poor answers in the prompt.

:::
:::

