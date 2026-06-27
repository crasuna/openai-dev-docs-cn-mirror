---
status: needs-review
sourceId: "f672550f605c"
sourceChecksum: "f672550f605c38db9509fa4e45f2a77385565cca5c45187dab1a07c23200028e"
sourceUrl: "https://developers.openai.com/api/docs/guides/graders"
translatedAt: "2026-06-27T17:45:12.7147584+08:00"
translator: codex-gpt-5.5-xhigh
---

# Graders

Graders 是一种根据参考答案评估模型表现的方式。我们的 [graders API](https://developers.openai.com/api/docs/api-reference/graders) 可用于测试你的 graders、试验结果，并改进你的 fine-tuning 或 evaluation 框架，以获得你想要的结果。

OpenAI 正在弃用 evals 和 fine-tuning 工作流中使用的 graders。请参阅 [deprecations 页面](https://developers.openai.com/api/docs/deprecations)，了解当前的过渡时间线。

## 概览

Graders 允许你将参考答案与对应的模型生成答案进行比较，并返回 0 到 1 范围内的分数。有时，给模型的答案部分得分会比只给二元的 0 或 1 更有帮助。

Graders 以 JSON 格式指定，并且有多种类型：

- [String check](#string-check-graders)
- [Text similarity](#text-similarity-graders)
- [Score model grader](#score-model-graders)
- [Python code execution](#python-graders)

在 reinforcement fine-tuning 中，你可以使用 [multigraders](#multigraders) 嵌套并组合 graders。

使用本指南了解每种 grader 类型并查看入门示例。要构建 grader 并开始使用 reinforcement fine-tuning，请参阅 [RFT guide](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)。或者，要开始使用 evals，请参阅 [Evals guide](https://developers.openai.com/api/docs/guides/evals)。

## 模板

某些 graders 的输入会使用模板语法，以便用同一份配置为多个示例评分。任何带有 `{{ }}` 双花括号的字符串都会被替换为变量值。

`{{}}` 中的每个输入都必须包含一个 _namespace_ 和一个 _variable_，格式如下：`{{ namespace.variable }}`。唯一支持的命名空间是 `item` 和 `sample`。

所有嵌套变量都可以使用类似 JSON path 的语法访问。

### Item namespace

对于 evals，item namespace 会填充来自输入数据源的变量；对于 fine-tuning，会填充每个 dataset item 中的变量。例如，如果某一行包含以下内容：

```json
{
  "reference_answer": "..."
}
```

可以在 grader 中通过 `{{ item.reference_answer }}` 使用它。

### Sample namespace

sample namespace 会填充 evals 期间模型采样步骤中的变量，或 fine-tuning 步骤中的变量。它包含以下变量：

- `output_text`，字符串形式的模型输出内容。
- `output_json`，JSON 对象形式的模型输出内容；仅当 sample 中包含 `response_format` 时才有。
- `output_tools`，模型输出的 `tool_calls`，其结构与 [chat completions API](https://developers.openai.com/api/docs/api-reference/chat/object) 中的输出工具调用相同。
- `choices`，输出 choices，其结构与 [chat completions API](https://developers.openai.com/api/docs/api-reference/chat/object) 中的输出 choices 相同。
- `output_audio`，包含 Base64 编码的 `data` 和 `transcript` 的模型音频输出对象。

例如，要以字符串形式访问模型输出内容，可以在 grader 中使用 `{{ sample.output_text }}`。

关于工具调用评分的细节

当训练模型改进 tool-calling 行为时，你需要编写 grader，让它基于 `sample.output_tools` 变量运行。该变量的内容与 `response.choices[0].message.tool_calls` 的内容相同（[参见 function calling 文档](https://developers.openai.com/api/docs/guides/function-calling?api-mode=chat)）。

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

> 目前，这个 grader 仅用于 Reinforcement fine-tuning

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
