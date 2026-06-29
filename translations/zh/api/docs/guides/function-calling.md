---
status: needs-review
sourceId: "c0cce811a20b"
sourceChecksum: "c0cce811a20b39cc8a9bd4c479e376459df370d4b41c8080f0869c321ecf46a6"
sourceUrl: "https://developers.openai.com/api/docs/guides/function-calling"
translatedAt: "2026-06-27T17:44:20.0905341+08:00"
translator: codex-gpt-5.5-xhigh
---

# Function calling 函数调用

**Function calling**（也称为 **tool calling**）提供了一种强大且灵活的方式，让 OpenAI 模型能够对接外部系统，并访问其训练数据之外的数据。本指南展示如何将模型连接到你的应用提供的数据和操作。我们会演示如何使用 function tools（由 JSON schema 定义），以及使用可处理自由形式文本输入和输出的 custom tools。

如果你的应用有很多函数或很大的 schemas，可以将 function calling 与 [tool search](https://developers.openai.com/api/docs/guides/tools-tool-search) 搭配使用，延迟加载不常用的 tools，并只在模型需要时加载它们。只有 `gpt-5.4` 及后续模型支持 `tool_search`。

## 工作原理

先从理解 tool calling 的几个关键术语开始。在我们对 tool calling 建立共同词汇后，会用一些实际示例展示具体做法。

Tools - 我们赋予模型的功能

**function** 或 **tool** 在抽象意义上指的是我们告知模型它可以访问的一段功能。当模型为 prompt 生成响应时，它可能会判断，为了遵循 prompt 的说明，需要使用某个 tool 提供的数据或功能。

你可以让模型访问以下 tools：

- 获取某个地点今天的天气
- 访问给定用户 ID 的账户详情
- 为丢失的订单发起退款

或者任何你希望模型在响应 prompt 时能够知道或执行的其他事情。

当我们带着 prompt 向模型发起 API 请求时，可以包含一份模型可考虑使用的 tools 列表。例如，如果我们希望模型能够回答世界某处当前天气的问题，可以让它访问一个 `get_weather` tool，该 tool 接受 `location` 作为参数。

Tool calls - 模型发出的使用 tools 的请求

**function call** 或 **tool call** 指的是我们可能从模型获得的一种特殊响应：模型检查 prompt 后，判断为了遵循 prompt 中的说明，需要调用我们提供给它的某个 tool。

如果模型在 API 请求中收到类似 “what is the weather in Paris?” 的 prompt，它可能会响应一个针对 `get_weather` tool 的 tool call，并将 `Paris` 作为 `location` 参数。

Tool call outputs - 我们为模型生成的输出

**function call output** 或 **tool call output** 指的是 tool 使用模型 tool call 的输入生成的响应。tool call output 可以是结构化 JSON，也可以是纯文本，并且应包含对某个具体模型 tool call 的引用（后续示例中通过 `call_id` 引用）。
为了完成我们的天气示例：

- 模型可以访问一个 `get_weather` **tool**，该 tool 接受 `location` 作为参数。
- 响应类似 “what's the weather in Paris?” 的 prompt 时，模型返回一个 **tool call**，其中包含值为 `Paris` 的 `location` 参数
- **tool call output** 可能返回一个 JSON 对象（例如 `{"temperature": "25", "unit": "C"}`，表示当前温度为 25 度）、[Image contents](https://developers.openai.com/api/docs/guides/images) 或 [File contents](https://developers.openai.com/api/docs/guides/file-inputs)。

然后，我们将 tool definition、原始 prompt、模型的 tool call 以及 tool call output 全部发送回模型，最终收到类似下面的文本响应：

```
The weather in Paris today is 25C.
```

Functions 与 tools

- function 是一种特定类型的 tool，由 JSON schema 定义。function definition 允许模型向你的应用传递数据，你的代码可以在其中访问数据，或执行模型建议的操作。
- 除了 function tools，还有 custom tools（本指南会介绍），它们使用自由文本输入和输出。
- 还有一些属于 OpenAI platform 的 [built-in tools](https://developers.openai.com/api/docs/guides/tools)。这些 tools 让模型能够[搜索网页](https://developers.openai.com/api/docs/guides/tools-web-search)、[执行代码](https://developers.openai.com/api/docs/guides/tools-code-interpreter)、访问 [MCP server](https://developers.openai.com/api/docs/guides/tools-remote-mcp) 的功能，等等。

### Tool calling 流程

Tool calling 是你的应用与模型之间通过 OpenAI API 进行的多步骤对话。tool calling 流程有五个高层步骤：

1. 带着模型可调用的 tools 向模型发起请求
1. 从模型接收 tool call
1. 在应用侧使用 tool call 的输入执行代码
1. 带着 tool output 向模型发起第二次请求
1. 从模型接收最终响应（或更多 tool calls）

![Function Calling Diagram Steps](https://cdn.openai.com/API/docs/images/function-calling-diagram-steps.png)

## Function tool 示例

让我们看看 `get_horoscope` function 的端到端 tool calling 流程，该 function 会为某个星座获取每日星座运势。



  请注意，对于 GPT-5 或 o4-mini 等 reasoning models，模型响应中随 tool calls 返回的任何 reasoning items，也必须与 tool call outputs 一起传回。

## 定义 functions

Functions 通常在每个 API 请求的 `tools` 参数中声明。借助 [tool search](https://developers.openai.com/api/docs/guides/tools-tool-search)，你的应用也可以在交互后续阶段加载 deferred functions。无论哪种方式，每个可调用 function 都使用相同的 schema 形状。function definition 具有以下属性：

| Field         | Description                                                                     |
| ------------- | ------------------------------------------------------------------------------- |
| `type`        | 应始终为 `function`                                                            |
| `name`        | function 的名称（例如 `get_weather`）                                          |
| `description` | 关于何时以及如何使用该 function 的细节                                        |
| `parameters`  | 定义 function 输入参数的 [JSON schema](https://json-schema.org/)               |
| `strict`      | 是否对 function call 强制执行 strict mode                                      |

下面是一个 `get_weather` function 的 function definition 示例

```json
{
  "type": "function",
  "name": "get_weather",
  "description": "Retrieves current weather for the given location.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City and country e.g. Bogotá, Colombia"
      },
      "units": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Units the temperature will be returned in."
      }
    },
    "required": ["location", "units"],
    "additionalProperties": false
  },
  "strict": true
}
```

由于 `parameters` 由 [JSON schema](https://json-schema.org/) 定义，你可以利用它许多丰富特性，例如属性类型、枚举、描述、嵌套对象，以及递归对象。

## 定义 namespaces

使用 namespaces 按领域对相关 tools 进行分组，例如 `crm`、`billing` 或 `shipping`。Namespaces 有助于组织相似 tools；当模型必须在服务于不同系统或目的的 tools 之间做选择时尤其有用，例如一个用于 CRM 的 search tool 和另一个用于支持工单系统的 search tool。

```json
{
  "type": "namespace",
  "name": "crm",
  "description": "CRM tools for customer lookup and order management.",
  "tools": [
    {
      "type": "function",
      "name": "get_customer_profile",
      "description": "Fetch a customer profile by customer ID.",
      "parameters": {
        "type": "object",
        "properties": {
          "customer_id": { "type": "string" }
        },
        "required": ["customer_id"],
        "additionalProperties": false
      }
    },
    {
      "type": "function",
      "name": "list_open_orders",
      "description": "List open orders for a customer ID.",
      "defer_loading": true,
      "parameters": {
        "type": "object",
        "properties": {
          "customer_id": { "type": "string" }
        },
        "required": ["customer_id"],
        "additionalProperties": false
      }
    }
  ]
}
```

## Tool search

如果你需要让模型访问一个大型 tools 生态，可以用 `tool_search` 延迟加载其中部分或全部 tools。`tool_search` tool 让模型能够搜索相关 tools、将它们添加到模型上下文，然后使用它们。只有 `gpt-5.4` 及后续模型支持它。阅读 [tool search guide](https://developers.openai.com/api/docs/guides/tools-tool-search) 了解更多。



### 定义 functions 的最佳实践

1. **编写清晰且详细的 function 名称、参数描述和说明。**
   - **明确描述 function 和每个参数的用途**（以及格式），并说明输出代表什么。
   - **使用 system prompt 描述何时使用（以及何时不使用）每个 function。** 通常，要告诉模型_确切_应该做什么。
   - **包含示例和边缘案例**，尤其用于修正反复出现的失败。（**注意：**添加示例可能会损害 [reasoning models](https://developers.openai.com/api/docs/guides/reasoning) 的表现。）
   - **对于 deferred tools，请在 function description 中放入详细指导，并让 namespace description 保持简洁。** namespace 帮助模型选择要加载什么；function description 帮助模型正确使用已加载的 tool。

1. **应用软件工程最佳实践。**
   - **让 functions 明显且直观**。（[principle of least surprise](https://en.wikipedia.org/wiki/Principle_of_least_astonishment)）
   - **使用 enums** 和对象结构，让无效状态无法表示。（例如 `toggle_light(on: bool, off: bool)` 允许无效调用）
   - **通过实习生测试。** 一个实习生/人类只凭你给模型的内容，能否正确使用该 function？（如果不能，他们会问你什么问题？把答案加入 prompt。）

1. **尽可能用代码分担模型负担。**
   - **不要让模型填充你已经知道的参数。** 例如，如果你已经基于之前菜单拥有 `order_id`，就不要设置 `order_id` 参数；而是使用无参数的 `submit_refund()`，并通过代码传递 `order_id`。
   - **合并总是按顺序调用的 functions。** 例如，如果你总是在 `query_location()` 之后调用 `mark_location()`，就把标记逻辑移动到查询 function call 中。

1. **为了提高准确性，保持初始可用 functions 数量较少。**
   - **使用不同数量的 functions 评估你的表现。**
   - **目标是在一个 turn 开始时可用的 functions 少于 20 个**，不过这只是软性建议。
   - **使用 tool search** 来延迟加载 tool surface 中规模较大或不常用的部分，而不是一开始就暴露所有内容。

1. **利用 OpenAI 资源。**
   - 在 [Playground](https://platform.openai.com/playground) 中**生成并迭代 function schemas**。
   - 对于大量 functions 或困难任务，**考虑使用 [fine-tuning](https://developers.openai.com/api/docs/guides/fine-tuning) 来提高 function calling 准确性**。（[cookbook](https://developers.openai.com/cookbook/examples/fine_tuning_for_function_calling)）

### Token Usage

在底层，functions 会以模型经过训练能够理解的语法注入 system message。这意味着可调用 function definitions 会计入模型的上下文限制，并作为输入 tokens 计费。如果你遇到 token 限制，我们建议限制预先加载的 functions 数量、尽可能缩短描述，或使用 [tool search](https://developers.openai.com/api/docs/guides/tools-tool-search)，让 deferred tools 仅在需要时加载。

如果你在 tools specification 中定义了很多 functions，也可以使用 [fine-tuning](https://developers.openai.com/api/docs/guides/fine-tuning#fine-tuning-examples) 来减少使用的 tokens 数量。

## 处理 function calls

当模型调用 function 时，你必须执行它并返回结果。由于模型响应可以包含零个、一个或多个 calls，最佳实践是假设会有多个。



response `output` 数组包含一个条目，其 `type` 的值为 `function_call`。每个条目都有 `call_id`（稍后用于提交 function 结果）、`name` 和 JSON 编码的 `arguments`。

如果你使用 [tool search](https://developers.openai.com/api/docs/guides/tools-tool-search)，也可能会在 `function_call` 之前看到 `tool_search_call` 和 `tool_search_output` items。一旦 function 加载完成，就可以用这里展示的相同方式处理 function call。

在上面的示例中，我们有一个假想的 `call_function` 来路由每个 call。下面是一种可能的实现：

### 格式化结果

你在 `function_call_output` message 中传入的结果通常应为字符串，格式由你决定（JSON、错误码、纯文本等）。模型会按需解释该字符串。

对于返回图片或文件的 functions，你可以传递一个[图片或文件对象数组](https://developers.openai.com/api/docs/api-reference/responses/create#responses_create-input-input_item_list-item-function_tool_call_output-output)，而不是字符串。

如果你的 function 没有返回值（例如 `send_email`），只需返回一个表示成功或失败的字符串。（例如 `"success"`）

### 将结果纳入响应



将结果追加到 `input` 后，你可以把它们发回给模型，以获取最终响应。

## 其他配置

### Tool choice

默认情况下，模型会决定何时以及使用多少 tools。你可以用 `tool_choice` 参数强制特定行为。

1. **Auto:**（_默认_）调用零个、一个或多个 functions。`tool_choice: "auto"`
1. **Required:** 调用一个或多个 functions。
   `tool_choice: "required"`
1. **Forced Function:** 只调用一个特定 function。
   `tool_choice: {"type": "function", "name": "get_weather"}`
1. **Allowed tools:** 将模型可进行的 tool calls 限制为模型可用 tools 的一个子集。

**何时使用 allowed_tools**

如果你希望在多个模型请求之间只让部分 tools 可用，但又不修改传入的 tools 列表，以便最大化从 [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) 中获得的节省，那么可能需要配置 `allowed_tools` 列表。

```json
"tool_choice": {
    "type": "allowed_tools",
    "mode": "auto",
    "tools": [
        { "type": "function", "name": "get_weather" },
        { "type": "function", "name": "search_docs" }
    ]
  }
}
```

你也可以将 `tool_choice` 设置为 `"none"`，以模拟不传入 functions 的行为。

使用 tool search 时，`tool_choice` 仍然适用于当前 turn 中可调用的 tools。最常见的用途是在加载一部分 tools 后，希望将模型限制在该子集内。

### 并行 function calling

使用 [built-in
  tools](https://developers.openai.com/api/docs/guides/tools) 时，无法进行并行 function calling。

模型可能会选择在单个 turn 中调用多个 functions。你可以通过将 `parallel_tool_calls` 设置为 `false` 来防止这种情况，这会确保正好调用零个或一个 tool。

**注意：**目前，如果你使用 fine tuned model，并且模型在一个 turn 中调用多个 functions，那么这些 calls 的 [strict mode](#strict-mode) 将被禁用。

**关于 `gpt-4.1-nano-2025-04-14` 的注意事项：**如果启用了 parallel tool calls，这个 `gpt-4.1-nano` snapshot 有时可能会对同一个 tool 包含多个 tool calls。使用这个 nano snapshot 时，建议禁用该功能。

### Strict mode

将 `strict` 设置为 `true` 可确保 function calls 可靠遵循 function schema，而不是尽力而为。我们建议始终启用 strict mode。

在底层，strict mode 通过利用我们的 [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) 功能工作，因此会引入几个要求：

1. 每个 `parameters` 对象中的 `additionalProperties` 必须设置为 `false`。
1. `properties` 中的所有字段都必须标记为 `required`。

你可以通过将 `null` 添加为 `type` 选项来表示可选字段（见下方示例）。

如果你发送 `strict: true`，而 schema 不满足上述要求，请求将被拒绝，并返回缺失约束的详细信息。如果你省略 `strict`，默认行为取决于 API：Responses 请求会在可能时尝试将你的 schema 规范化为 strict mode；如果 schema 无法变得兼容 strict mode，则会回退到非 strict、best-effort function calling。发生回退时，response tool 会显示 `strict: false`。Chat Completions 请求默认仍为非 strict。要在 Responses 中退出 strict mode 并保持非 strict、best-effort function calling，请显式设置 `strict: false`。





<div data-content-switcher-pane data-value="enabled">
    <div class="hidden">Strict mode enabled</div>
    </div>
  <div data-content-switcher-pane data-value="disabled" hidden>
    <div class="hidden">Strict mode disabled</div>
    </div>





在 [playground](https://platform.openai.com/playground) 中生成的所有 schemas 都已启用 strict mode。

虽然我们建议你启用 strict mode，但它有一些限制：

1. JSON schema 的某些特性不受支持。（参见 [supported schemas](https://developers.openai.com/api/docs/guides/structured-outputs?context=with_parse#supported-schemas)。）

特别对于 fine tuned models：

1. Schemas 会在第一次请求时经历额外处理（随后被缓存）。如果你的 schemas 在不同请求之间变化，这可能导致更高延迟。
2. Schemas 会为了性能而缓存，且不符合 [zero data retention](https://developers.openai.com/api/docs/models#how-we-use-your-data) 条件。

## Streaming



Streaming 可用于呈现进度：在模型填充参数时显示调用的是哪个 function，甚至实时显示参数。

Streaming function calls 与流式传输普通 responses 非常相似：你将 `stream` 设置为 `true`，并获取不同的 `event` objects。

不过，你不是把 chunks 聚合成一个 `content` 字符串，而是把 chunks 聚合成一个编码后的 `arguments` JSON 对象。

当模型调用一个或多个 functions 时，会为每个 function call 发送一个 `response.output_item.added` 类型的 event，其中包含以下字段：

| Field          | Description                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `response_id`  | function call 所属 response 的 id                                                                            |
| `output_index` | response 中 output item 的索引。这表示 response 中的单个 function calls。                                    |
| `item`         | 正在进行的 function call item，其中包含 `name`、`arguments` 和 `id` 字段                                     |

之后，你会收到一系列 `response.function_call_arguments.delta` 类型的 events，其中包含 `arguments` 字段的 `delta`。这些 events 包含以下字段：

| Field          | Description                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `response_id`  | function call 所属 response 的 id                                                                            |
| `item_id`      | delta 所属 function call item 的 id                                                                          |
| `output_index` | response 中 output item 的索引。这表示 response 中的单个 function calls。                                    |
| `delta`        | `arguments` 字段的 delta。                                                                                   |

下面的代码片段演示如何将 `delta`s 聚合成最终的 `tool_call` 对象。

当模型完成 functions 调用后，会发送一个 `response.function_call_arguments.done` 类型的 event。该 event 包含完整的 function call，包括以下字段：

| Field          | Description                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `response_id`  | function call 所属 response 的 id                                                                            |
| `output_index` | response 中 output item 的索引。这表示 response 中的单个 function calls。                                    |
| `item`         | function call item，其中包含 `name`、`arguments` 和 `id` 字段。                                              |



## Custom tools

Custom tools 的工作方式与 JSON schema 驱动的 function tools 大体相同。但它不是向模型提供关于你的 tool 需要什么输入的明确说明，而是允许模型向你的 tool 传回任意字符串作为输入。这对于避免不必要地把响应包裹进 JSON，或对响应应用自定义 grammar 很有用（下文会详细说明）。

下面的代码示例展示如何创建一个 custom tool，该 tool 期望接收一段包含 Python 代码的文本字符串作为响应。

和之前一样，`output` 数组将包含模型生成的 tool call。不同的是，这一次 tool call input 以纯文本形式给出。

```json
[
  {
    "id": "rs_6890e972fa7c819ca8bc561526b989170694874912ae0ea6",
    "type": "reasoning",
    "content": [],
    "summary": []
  },
  {
    "id": "ctc_6890e975e86c819c9338825b3e1994810694874912ae0ea6",
    "type": "custom_tool_call",
    "status": "completed",
    "call_id": "call_aGiFQkRWSWAIsMQ19fKqxUgb",
    "input": "print(\"hello world\")",
    "name": "code_exec"
  }
]
```

### Context-free grammars

[context-free grammar](https://en.wikipedia.org/wiki/Context-free_grammar)（CFG）是一组规则，用于定义如何以给定格式生成有效文本。对于 custom tools，你可以提供一个 CFG 来约束模型为 custom tool 生成的文本输入。

配置 custom tool 时，可以使用 `grammar` 参数提供自定义 CFG。目前，我们在定义 grammars 时支持两种 CFG 语法：`lark` 和 `regex`。

#### Lark CFG

tool 的输出随后应符合你定义的 Lark CFG：

```json
[
  {
    "id": "rs_6890ed2b6374819dbbff5353e6664ef103f4db9848be4829",
    "type": "reasoning",
    "content": [],
    "summary": []
  },
  {
    "id": "ctc_6890ed2f32e8819daa62bef772b8c15503f4db9848be4829",
    "type": "custom_tool_call",
    "status": "completed",
    "call_id": "call_pmlLjmvG33KJdyVdC4MVdk5N",
    "input": "4 + 4",
    "name": "math_exp"
  }
]
```

Grammars 使用 [Lark](https://lark-parser.readthedocs.io/en/stable/index.html) 的一种变体来指定。模型采样使用 [LLGuidance](https://github.com/guidance-ai/llguidance/blob/main/docs/syntax.md) 进行约束。Lark 的某些特性不受支持：

- lexer regexes 中的 lookarounds
- lexer regexes 中的 lazy modifiers（`*?`、`+?`、`??`）
- terminals 的 priorities
- Templates
- Imports（内置 `%import` common 除外）
- `%declare`s

我们建议使用 [Lark IDE](https://www.lark-parser.org/ide/) 试验 custom grammars。

### 保持 grammars 简单

尽量让你的 grammar 保持简单。如果 grammar 过于复杂，OpenAI API 可能会返回错误，因此在 API 中使用之前，你应确保所需 grammar 兼容。

Lark grammars 可能很难做到完美。虽然简单 grammars 最可靠，但复杂 grammars 往往需要对 grammar definition 本身、prompt 和 tool description 进行迭代，以确保模型不会进入分布外状态。

### 正确与错误模式

正确（单个、有边界的 terminal）：

```
start: SENTENCE
SENTENCE: /[A-Za-z, ]*(the hero|a dragon|an old man|the princess)[A-Za-z, ]*(fought|saved|found|lost)[A-Za-z, ]*(a treasure|the kingdom|a secret|his way)[A-Za-z, ]*\./
```

不要这样做（跨 rules/terminals 拆分）。这会试图让 rules 在 terminals 之间划分自由文本。lexer 会贪婪匹配自由文本片段，你会失去控制：

```
start: sentence
sentence: /[A-Za-z, ]+/ subject /[A-Za-z, ]+/ verb /[A-Za-z, ]+/ object /[A-Za-z, ]+/
```

小写 rules 不会影响 terminals 如何从输入中切分，只有 terminal definitions 才会影响。当你需要“锚点之间的自由文本”时，把它做成一个巨大的 regex terminal，让 lexer 按你想要的结构准确匹配一次。

### Terminals 与 rules

Lark 使用 terminals 表示 lexer tokens（按惯例为 `UPPERCASE`），使用 rules 表示 parser productions（按惯例为 `lowercase`）。要留在受支持子集内并避免意外，最实用的方法是保持 grammar 简单且明确，并在 terminals 与 rules 之间清晰分工。

terminals 使用的 regex 语法是 [Rust regex crate syntax](https://docs.rs/regex/latest/regex/#syntax)，而不是 Python 的 `re` [module](https://docs.python.org/3/library/re.html)。

### 关键理念和最佳实践

**Lexer 在 parser 之前运行**

Terminals 会先由 lexer 匹配（贪婪 / 最长匹配优先），之后才应用任何 CFG rule 逻辑。如果你试图通过把 terminal 拆到多个 rules 中来“塑造”它，lexer 不会受这些 rules 引导；只有 terminal regexes 能引导 lexer。

**当你从自由形式跨度中切出文本时，优先使用一个 terminal**

如果你需要识别嵌入任意文本中的 pattern（例如锚点之间带有“任何内容”的自然语言），请把它表达为单个 terminal。不要尝试将自由文本 terminals 与 parser rules 交错；贪婪 lexer 不会尊重你的预期边界，并且模型很可能会进入分布外状态。

**使用 rules 组合离散 tokens**

当你要把清晰分隔的 terminals（数字、关键字、标点）组合成更大结构时，rules 很理想。它们不适合约束两个 terminals 之间的“那些内容”。

**保持 terminals 简单、有边界且自包含**

优先使用显式字符类和有边界的 quantifiers（`{0,10}`，不要到处使用无边界的 `*`）。如果你需要“任意文本直到句号”，优先使用类似 `/[^.\n]{0,10}*\./`，而不是 `/.+\./`，以避免失控增长。

**使用 rules 组合 tokens，而不是引导 regex 内部**

良好的 rule 用法示例：

```
start: expr
NUMBER: /[0-9]+/
PLUS: "+"
MINUS: "-"
expr: term (("+"|"-") term)*
term: NUMBER
```

**显式处理 whitespace**

不要依赖开放式 `%ignore` 指令。使用无边界 ignore 指令可能会导致 grammar 过于复杂，和/或导致模型进入分布外状态。优先在允许 whitespace 的位置穿插显式 terminals。

### 故障排查

- 如果 API 因 grammar 过于复杂而拒绝它，请简化 rules 和 terminals，并移除无边界 `%ignore`s。
- 如果 custom tools 被调用时带有意外 tokens，请确认 terminals 没有重叠；检查贪婪 lexer。
- 当模型漂移到“out-of-distribution”（表现为模型生成过长或重复输出；它在语法上有效，但语义上错误）时：
  - 收紧 grammar。
  - 迭代 prompt（添加 few-shot examples）和 tool description（解释 grammar，并指示模型推理并遵循它）。
  - 尝试更高的 reasoning effort（例如从 medium 提升到 high）。

#### Regex CFG

tool 的输出随后应符合你定义的 Regex CFG：

```json
[
  {
    "id": "rs_6894f7a3dd4c81a1823a723a00bfa8710d7962f622d1c260",
    "type": "reasoning",
    "content": [],
    "summary": []
  },
  {
    "id": "ctc_6894f7ad7fb881a1bffa1f377393b1a40d7962f622d1c260",
    "type": "custom_tool_call",
    "status": "completed",
    "call_id": "call_8m4XCnYvEmFlzHgDHbaOCFlK",
    "input": "August 7th 2025 at 10AM",
    "name": "timestamp"
  }
]
```

与 Lark 语法一样，regexes 使用 [Rust regex crate syntax](https://docs.rs/regex/latest/regex/#syntax)，而不是 Python 的 `re` [module](https://docs.python.org/3/library/re.html)。

Regex 的某些特性不受支持：

- Lookarounds
- Lazy modifiers（`*?`、`+?`、`??`）

### 关键理念和最佳实践

**Pattern 必须在一行内**

如果你需要匹配输入中的换行，请使用转义序列 `\n`。不要使用允许 patterns 跨多行的 verbose/extended mode。

**将 regex 作为普通 pattern 字符串提供**

不要把 pattern 放在 `//` 中。
