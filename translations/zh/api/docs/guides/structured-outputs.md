---
status: needs-review
sourceId: "6f63b0cf92b7"
sourceChecksum: "6f63b0cf92b7c7bd0122b955bacc16e9347ab52d265d3324449f6dc8f98f6143"
sourceUrl: "https://developers.openai.com/api/docs/guides/structured-outputs"
translatedAt: "2026-06-27T10:24:24.269Z"
translator: codex-gpt-5.5-xhigh
---

# 结构化模型输出

JSON 是全球应用程序交换数据时最常用的格式之一。

Structured Outputs 是一项功能，可确保模型始终生成符合你提供的 [JSON Schema](https://json-schema.org/overview/what-is-jsonschema) 的响应，因此你无需担心模型遗漏必需键，或幻觉出无效的 enum 值。

Structured Outputs 的一些好处包括：

1. **可靠的类型安全：**无需验证或重试格式不正确的响应
1. **明确的拒绝：**现在可以通过程序检测基于安全原因的模型拒绝
1. **更简单的 prompting：**无需措辞强硬的 prompt 也能实现一致格式

除了在 REST API 中支持 JSON Schema 之外，OpenAI 的 [Python](https://github.com/openai/openai-python/blob/main/helpers.md#structured-outputs-parsing-helpers) 和 [JavaScript](https://github.com/openai/openai-node/blob/master/helpers.md#structured-outputs-parsing-helpers) SDK 也分别让你可以轻松使用 [Pydantic](https://docs.pydantic.dev/latest/) 和 [Zod](https://zod.dev/) 定义对象 schema。下面你可以看到如何从非结构化文本中提取信息，并让结果符合代码中定义的 schema。

### 支持的模型

Structured Outputs 可在我们的[最新大语言模型](https://developers.openai.com/api/docs/models)中使用，从 GPT-4o 开始。对于新项目，请从 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 开始。较旧的模型（例如 `gpt-4-turbo` 及更早模型）可以改用 [JSON mode](#json-mode)。




  

何时通过 function calling 使用 Structured Outputs，以及何时通过 
    <span className="monospace">text.format</span> 使用




Structured Outputs 在 OpenAI API 中有两种形式：

1. 使用 [function calling](https://developers.openai.com/api/docs/guides/function-calling) 时
2. 使用 `json_schema` response format 时

当你正在构建一个把模型与你应用功能连接起来的应用时，function calling 很有用。

例如，你可以让模型访问用于查询数据库的函数，从而构建一个可以帮助用户处理订单的 AI assistant；也可以让模型访问能够与 UI 交互的函数。

相反，通过 `response_format` 使用 Structured Outputs 更适合这样的场景：你想指定一个结构化 schema，用于模型回复用户时的输出，而不是模型调用工具时的输出。

例如，如果你正在构建数学辅导应用，你可能希望 assistant 使用特定 JSON Schema 回复用户，这样你就可以生成一个 UI，以不同方式展示模型输出的不同部分。

简单来说：




  - 如果你要把模型连接到你的系统中的工具、函数、数据等，那么应使用 function calling - 如果你想在模型回复用户时结构化模型输出，那么应使用结构化
  `text.format`





  本指南余下部分将聚焦于 Responses API 中的非 function calling 用例。若要了解如何结合 function calling 使用 Structured Outputs，请查看
    [Function Calling](https://developers.openai.com/api/docs/guides/function-calling#function-calling-with-structured-outputs)
    指南。


### Structured Outputs 与 JSON mode

Structured Outputs 是 [JSON mode](#json-mode) 的演进。两者都能确保生成有效 JSON，但只有 Structured Outputs 能确保遵循 schema。Responses API、Chat Completions API、Assistants API、Fine-tuning API 和 Batch API 都支持 Structured Outputs 和 JSON mode。

我们建议在可行时始终使用 Structured Outputs，而不是 JSON mode。

不过，使用 `response_format: {type: "json_schema", ...}` 的 Structured Outputs 只在 `gpt-4o-mini`、`gpt-4o-mini-2024-07-18`、`gpt-4o-2024-08-06` 及后续模型快照中受支持。




|                                            | Structured Outputs                                                                                                             | JSON Mode                                  |
|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| **输出有效 JSON**                     | Yes                                                                                                                            | Yes                                        |
| **遵循 schema**                      | Yes（见[支持的 schemas](#supported-schemas)）                                               | No                                         |
| **兼容模型**                      | `gpt-4o-mini`、`gpt-4o-2024-08-06` 及后续模型                                                                                  | `gpt-3.5-turbo`、`gpt-4-*`、`gpt-4o-*` 以及兼容的 GPT-5 模型 |
| **启用方式**                               | `text: { format: { type: "json_schema", "strict": true, "schema": ... } }`                                       | `text: { format: { type: "json_object" } }` |


## 示例



<div data-content-switcher-pane data-value="chain-of-thought">
    <div class="hidden">思维链</div>
    </div>
  <div data-content-switcher-pane data-value="structured-data" hidden>
    <div class="hidden">结构化数据提取</div>
    </div>
  <div data-content-switcher-pane data-value="ui-generation" hidden>
    <div class="hidden">UI 生成</div>
    </div>
  <div data-content-switcher-pane data-value="moderation" hidden>
    <div class="hidden">审核</div>
    </div>








如何通过 <span className="monospace">text.format</span> 使用 Structured Outputs


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

Structured Outputs 仍可能包含错误。如果你看到错误，请尝试调整指令、在 system instructions 中提供示例，或将任务拆分成更简单的子任务。有关如何调整输入的更多指导，请参阅 [prompt engineering 指南](https://developers.openai.com/api/docs/guides/prompt-engineering)。

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
