---
title: "结构化模型输出"
description: "Understand how to ensure model responses follow specific JSON Schema you define."
outline: deep
---

# 结构化模型输出

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/structured-outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/structured-outputs.md](https://developers.openai.com/api/docs/guides/structured-outputs.md)
- 抓取时间：2026-06-27T05:54:09.254Z
- Checksum：`6f63b0cf92b7c7bd0122b955bacc16e9347ab52d265d3324449f6dc8f98f6143`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
JSON 是全球应用程序交换数据时最常用的格式之一。

Structured Outputs 是一项功能，可确保模型始终生成符合你提供的 [JSON Schema](https://json-schema.org/overview/what-is-jsonschema) 的响应，因此你无需担心模型遗漏必需键，或幻觉出无效的 enum 值。

Structured Outputs 的一些好处包括：

1. **可靠的类型安全：**无需验证或重试格式不正确的响应
1. **明确的拒绝：**现在可以通过程序检测基于安全原因的模型拒绝
1. **更简单的 prompting：**无需措辞强硬的 prompt 也能实现一致格式

除了在 REST API 中支持 JSON Schema 之外，OpenAI 的 [Python](https://github.com/openai/openai-python/blob/main/helpers.md#structured-outputs-parsing-helpers) 和 [JavaScript](https://github.com/openai/openai-node/blob/master/helpers.md#structured-outputs-parsing-helpers) SDK 也分别让你可以轻松使用 [Pydantic](https://docs.pydantic.dev/latest/) 和 [Zod](https://zod.dev/) 定义对象 schema。下面你可以看到如何从非结构化文本中提取信息，并让结果符合代码中定义的 schema。

### 支持的模型

Structured Outputs 可在我们的[最新大语言模型](https://developers.openai.com/api/docs/models)中使用，从 GPT-4o 开始。对于新项目，请从 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 开始。较旧的模型（例如 `gpt-4-turbo` 及更早模型）可以改用 [JSON mode](/mirror/api/docs/guides/structured-outputs#json-mode)。




  

何时通过 function calling 使用 Structured Outputs，以及何时通过 
    &lt;span className="monospace"&gt;text.format&lt;/span&gt; 使用




Structured Outputs 在 OpenAI API 中有两种形式：

1. 使用 [function calling](/mirror/api/docs/guides/function-calling) 时
2. 使用 `json_schema` response format 时

当你正在构建一个把模型与你应用功能连接起来的应用时，function calling 很有用。

例如，你可以让模型访问用于查询数据库的函数，从而构建一个可以帮助用户处理订单的 AI assistant；也可以让模型访问能够与 UI 交互的函数。

相反，通过 `response_format` 使用 Structured Outputs 更适合这样的场景：你想指定一个结构化 schema，用于模型回复用户时的输出，而不是模型调用工具时的输出。

例如，如果你正在构建数学辅导应用，你可能希望 assistant 使用特定 JSON Schema 回复用户，这样你就可以生成一个 UI，以不同方式展示模型输出的不同部分。

简单来说：




  - 如果你要把模型连接到你的系统中的工具、函数、数据等，那么应使用 function calling - 如果你想在模型回复用户时结构化模型输出，那么应使用结构化
  `text.format`





  本指南余下部分将聚焦于 Responses API 中的非 function calling 用例。若要了解如何结合 function calling 使用 Structured Outputs，请查看
    [Function Calling](/mirror/api/docs/guides/function-calling#function-calling-with-structured-outputs)
    指南。


### Structured Outputs 与 JSON mode

Structured Outputs 是 [JSON mode](/mirror/api/docs/guides/structured-outputs#json-mode) 的演进。两者都能确保生成有效 JSON，但只有 Structured Outputs 能确保遵循 schema。Responses API、Chat Completions API、Assistants API、Fine-tuning API 和 Batch API 都支持 Structured Outputs 和 JSON mode。

我们建议在可行时始终使用 Structured Outputs，而不是 JSON mode。

不过，使用 `response_format: {type: "json_schema", ...}` 的 Structured Outputs 只在 `gpt-4o-mini`、`gpt-4o-mini-2024-07-18`、`gpt-4o-2024-08-06` 及后续模型快照中受支持。




|                                            | Structured Outputs                                                                                                             | JSON Mode                                  |
|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| **输出有效 JSON**                     | Yes                                                                                                                            | Yes                                        |
| **遵循 schema**                      | Yes（见[支持的 schemas](/mirror/api/docs/guides/structured-outputs#supported-schemas)）                                               | No                                         |
| **兼容模型**                      | `gpt-4o-mini`、`gpt-4o-2024-08-06` 及后续模型                                                                                  | `gpt-3.5-turbo`、`gpt-4-*`、`gpt-4o-*` 以及兼容的 GPT-5 模型 |
| **启用方式**                               | `text: { format: { type: "json_schema", "strict": true, "schema": ... } }`                                       | `text: { format: { type: "json_object" } }` |


## 示例




思维链


结构化数据提取


UI 生成


审核









如何通过 &lt;span className="monospace"&gt;text.format&lt;/span&gt; 使用 Structured Outputs


Structured Outputs 中的拒绝



当对用户生成的输入使用 Structured Outputs 时，OpenAI 模型有时可能会出于安全原因拒绝完成请求。由于拒绝不一定遵循你在 `response_format` 中提供的 schema，API 响应会包含一个名为 `refusal` 的新字段，用于表示模型拒绝完成该请求。

当你的输出对象中出现 `refusal` 属性时，你可以在 UI 中呈现拒绝内容，或在消费该响应的代码中加入条件逻辑来处理请求被拒绝的情况。




  来自拒绝的 API 响应大致如下：




  提示和最佳实践



#### 处理用户生成的输入

如果你的应用使用用户生成的输入，请确保 prompt 中包含说明，解释当输入无法产生有效响应时应如何处理。

模型会始终尝试遵循提供的 schema；如果输入与 schema 完全无关，这可能导致幻觉。

你可以在 prompt 中加入说明，指定如果模型检测到输入与任务不兼容，你希望返回空参数，或返回某个特定句子。

#### 处理错误

Structured Outputs 仍可能包含错误。如果你看到错误，请尝试调整指令、在 system instructions 中提供示例，或将任务拆分成更简单的子任务。有关如何调整输入的更多指导，请参阅 [prompt engineering 指南](/mirror/api/docs/guides/prompt-engineering)。

#### 避免 JSON schema 分歧

为防止 JSON Schema 与你的编程语言中的对应类型发生分歧，我们强烈建议使用原生 Pydantic/zod SDK 支持。

如果你更喜欢直接指定 JSON schema，可以添加 CI 规则，在 JSON schema 或底层数据对象被编辑时发出标记；也可以添加一个 CI 步骤，根据类型定义自动生成 JSON Schema（或反向生成）。

## 流式传输

## 支持的 schemas

## JSON mode

JSON mode 是 Structured Outputs 功能的更基础版本。虽然
  JSON mode 可确保模型输出是有效 JSON，但 Structured Outputs 会可靠地
  将模型输出匹配到你指定的 schema。若你的用例支持，我们建议使用
  Structured Outputs。

启用 JSON mode 后，模型的输出会被确保为有效 JSON，但有一些边缘情况需要你检测并妥善处理。




要在 Responses API 中启用 JSON mode，可以将 `text.format` 设置为 `{ "type": "json_object" }`。如果你使用 function calling，JSON mode 会始终开启。


重要说明：

- 使用 JSON mode 时，你必须始终通过对话中的某条消息指示模型生成 JSON，例如通过 system message。如果你没有包含生成 JSON 的明确指令，模型可能会生成无休止的空白流，请求可能会一直运行到达到 token 限制。为了帮助确保你不会忘记，如果上下文中某处没有出现字符串 "JSON"，API 会抛出错误。
- JSON mode 不保证输出匹配任何特定 schema，只保证它是有效且可无错误解析的。你应该使用 Structured Outputs 来确保它匹配你的 schema；如果这不可行，则应使用验证库，并可能配合重试，以确保输出匹配你的目标 schema。
- 你的应用必须检测并处理可能导致模型输出不是完整 JSON 对象的边缘情况（见下文）

处理边缘情况

## 资源

若要进一步了解 Structured Outputs，我们推荐浏览以下资源：

- 查看我们关于 Structured Outputs 的[入门 cookbook](https://developers.openai.com/cookbook/examples/structured_outputs_intro)
- 学习如何使用 Structured Outputs [构建 multi-agent systems](https://developers.openai.com/cookbook/examples/structured_outputs_multi_agent)

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
JSON is one of the most widely used formats in the world for applications to exchange data.

Structured Outputs is a feature that ensures the model will always generate responses that adhere to your supplied [JSON Schema](https://json-schema.org/overview/what-is-jsonschema), so you don't need to worry about the model omitting a required key, or hallucinating an invalid enum value.

Some benefits of Structured Outputs include:

1. **Reliable type-safety:** No need to validate or retry incorrectly formatted responses
1. **Explicit refusals:** Safety-based model refusals are now programmatically detectable
1. **Simpler prompting:** No need for strongly worded prompts to achieve consistent formatting

In addition to supporting JSON Schema in the REST API, the OpenAI SDKs for [Python](https://github.com/openai/openai-python/blob/main/helpers.md#structured-outputs-parsing-helpers) and [JavaScript](https://github.com/openai/openai-node/blob/master/helpers.md#structured-outputs-parsing-helpers) also make it easy to define object schemas using [Pydantic](https://docs.pydantic.dev/latest/) and [Zod](https://zod.dev/) respectively. Below, you can see how to extract information from unstructured text that conforms to a schema defined in code.

### Supported models

Structured Outputs is available in our [latest large language models](https://developers.openai.com/api/docs/models), starting with GPT-4o. For new projects, start with [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5). Older models like `gpt-4-turbo` and earlier may use [JSON mode](#json-mode) instead.




  

When to use Structured Outputs via function calling vs via 
    <span className="monospace">text.format</span>




Structured Outputs is available in two forms in the OpenAI API:

1. When using [function calling](https://developers.openai.com/api/docs/guides/function-calling)
2. When using a `json_schema` response format

Function calling is useful when you are building an application that bridges the models and functionality of your application.

For example, you can give the model access to functions that query a database in order to build an AI assistant that can help users with their orders, or functions that can interact with the UI.

Conversely, Structured Outputs via `response_format` are more suitable when you want to indicate a structured schema for use when the model responds to the user, rather than when the model calls a tool.

For example, if you are building a math tutoring application, you might want the assistant to respond to your user using a specific JSON Schema so that you can generate a UI that displays different parts of the model's output in distinct ways.

Put simply:




  - If you are connecting the model to tools, functions, data, etc. in your
  system, then you should use function calling - If you want to structure the
  model's output when it responds to the user, then you should use a structured
  `text.format`





  The remainder of this guide will focus on non-function calling use cases in
    the Responses API. To learn more about how to use Structured Outputs with
    function calling, check out the 
    [Function Calling](https://developers.openai.com/api/docs/guides/function-calling#function-calling-with-structured-outputs) 
    guide.


### Structured Outputs vs JSON mode

Structured Outputs is the evolution of [JSON mode](#json-mode). While both ensure valid JSON is produced, only Structured Outputs ensure schema adherence. Both Structured Outputs and JSON mode are supported in the Responses API, Chat Completions API, Assistants API, Fine-tuning API and Batch API.

We recommend always using Structured Outputs instead of JSON mode when possible.

However, Structured Outputs with `response_format: {type: "json_schema", ...}` is only supported with the `gpt-4o-mini`, `gpt-4o-mini-2024-07-18`, and `gpt-4o-2024-08-06` model snapshots and later.




|                                            | Structured Outputs                                                                                                             | JSON Mode                                  |
|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| **Outputs valid JSON**                     | Yes                                                                                                                            | Yes                                        |
| **Adheres to schema**                      | Yes (see [supported schemas](#supported-schemas))                                               | No                                         |
| **Compatible models**                      | `gpt-4o-mini`, `gpt-4o-2024-08-06`, and later                                                                                  | `gpt-3.5-turbo`, `gpt-4-*`, `gpt-4o-*`, and compatible GPT-5 models |
| **Enabling**                               | `text: { format: { type: "json_schema", "strict": true, "schema": ... } }`                                       | `text: { format: { type: "json_object" } }` |


## Examples



<div data-content-switcher-pane data-value="chain-of-thought">
    <div class="hidden">Chain of thought</div>
    </div>
  <div data-content-switcher-pane data-value="structured-data" hidden>
    <div class="hidden">Structured data extraction</div>
    </div>
  <div data-content-switcher-pane data-value="ui-generation" hidden>
    <div class="hidden">UI generation</div>
    </div>
  <div data-content-switcher-pane data-value="moderation" hidden>
    <div class="hidden">Moderation</div>
    </div>








How to use Structured Outputs with <span className="monospace">text.format</span>


Refusals with Structured Outputs



When using Structured Outputs with user-generated input, OpenAI models may occasionally refuse to fulfill the request for safety reasons. Since a refusal does not necessarily follow the schema you have supplied in `response_format`, the API response will include a new field called `refusal` to indicate that the model refused to fulfill the request.

When the `refusal` property appears in your output object, you might present the refusal in your UI, or include conditional logic in code that consumes the response to handle the case of a refused request.




  The API response from a refusal will look something like this:




  Tips and best practices



#### Handling user-generated input

If your application is using user-generated input, make sure your prompt includes instructions on how to handle situations where the input cannot result in a valid response.

The model will always try to adhere to the provided schema, which can result in hallucinations if the input is completely unrelated to the schema.

You could include language in your prompt to specify that you want to return empty parameters, or a specific sentence, if the model detects that the input is incompatible with the task.

#### Handling mistakes

Structured Outputs can still contain mistakes. If you see mistakes, try adjusting your instructions, providing examples in the system instructions, or splitting tasks into simpler subtasks. Refer to the [prompt engineering guide](https://developers.openai.com/api/docs/guides/prompt-engineering) for more guidance on how to tweak your inputs.

#### Avoid JSON schema divergence

To prevent your JSON Schema and corresponding types in your programming language from diverging, we strongly recommend using the native Pydantic/zod sdk support.

If you prefer to specify the JSON schema directly, you could add CI rules that flag when either the JSON schema or underlying data objects are edited, or add a CI step that auto-generates the JSON Schema from type definitions (or vice-versa).

## Streaming

## Supported schemas

## JSON mode

JSON mode is a more basic version of the Structured Outputs feature. While
  JSON mode ensures that model output is valid JSON, Structured Outputs reliably
  matches the model's output to the schema you specify. We recommend you use
  Structured Outputs if it is supported for your use case.

When JSON mode is turned on, the model's output is ensured to be valid JSON, except for in some edge cases that you should detect and handle appropriately.




To turn on JSON mode with the Responses API you can set the `text.format` to `{ "type": "json_object" }`. If you are using function calling, JSON mode is always turned on.


Important notes:

- When using JSON mode, you must always instruct the model to produce JSON via some message in the conversation, for example via your system message. If you don't include an explicit instruction to generate JSON, the model may generate an unending stream of whitespace and the request may run continually until it reaches the token limit. To help ensure you don't forget, the API will throw an error if the string "JSON" does not appear somewhere in the context.
- JSON mode will not guarantee the output matches any specific schema, only that it is valid and parses without errors. You should use Structured Outputs to ensure it matches your schema, or if that is not possible, you should use a validation library and potentially retries to ensure that the output matches your desired schema.
- Your application must detect and handle the edge cases that can result in the model output not being a complete JSON object (see below)

Handling edge cases

## Resources

To learn more about Structured Outputs, we recommend browsing the following resources:

- Check out our [introductory cookbook](https://developers.openai.com/cookbook/examples/structured_outputs_intro) on Structured Outputs
- Learn [how to build multi-agent systems](https://developers.openai.com/cookbook/examples/structured_outputs_multi_agent) with Structured Outputs
``````
:::
:::

