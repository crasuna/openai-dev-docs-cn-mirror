---
title: "Prompt engineering"
description: "Learn strategies and tactics for better results using large language models in the OpenAI API."
outline: deep
---

# Prompt engineering

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/prompt-engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/prompt-engineering.md](https://developers.openai.com/api/docs/guides/prompt-engineering.md)
- 抓取时间：2026-06-27T05:54:04.618Z
- Checksum：`9aba57cd82cc8f07b0dc08a3c74c2040d7fcae1502b7238fe47e6963e46d3f57`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
借助 OpenAI API，你可以使用[大型语言模型](https://developers.openai.com/api/docs/models)从 prompt 生成文本，就像你使用 [ChatGPT](https://chatgpt.com) 一样。模型几乎可以生成任何类型的文本响应，例如代码、数学方程、结构化 JSON 数据或类人的散文。



下面是一个使用 [Responses API](https://developers.openai.com/api/docs/api-reference/responses) 的简单示例。

模型生成的内容数组位于 response 的 `output` 属性中。在这个简单示例中，我们只有一个 output，看起来像这样：

```json
[
  {
    "id": "msg_67b73f697ba4819183a15cc17d011509",
    "type": "message",
    "role": "assistant",
    "content": [
      {
        "type": "output_text",
        "text": "Under the soft glow of the moon, Luna the unicorn danced through fields of twinkling stardust, leaving trails of dreams for every child asleep.",
        "annotations": []
      }
    ]
  }
]
```

**`output` 数组通常不止一个条目！** 它可以包含 tool calls、由[推理模型](/mirror/api/docs/guides/reasoning)生成的 reasoning tokens 相关数据，以及其他条目。不能安全地假设模型文本输出一定出现在 `output[0].content[0].text`。

为了方便使用，我们的一些[官方 SDKs](/mirror/api/docs/libraries)会在模型响应上提供 `output_text` 属性，它会把模型的所有文本输出聚合为单个字符串。它可以作为访问模型文本输出的快捷方式。

除了纯文本，你还可以让模型以 JSON 格式返回结构化数据，此功能称为 [**Structured Outputs**](/mirror/api/docs/guides/structured-outputs)。





## 选择模型

通过 API 生成内容时，一个关键选择是使用哪个模型，也就是上方代码示例中的 `model` 参数。[你可以在这里找到可用模型的完整列表](https://developers.openai.com/api/docs/models)。选择用于文本生成的模型时，可以考虑以下几个因素。

- **[推理模型](/mirror/api/docs/guides/reasoning)** 会生成内部思维链来分析输入 prompt，并擅长理解复杂任务和多步骤规划。与 GPT models 相比，它们通常也更慢、使用成本更高。
- **GPT models** 速度快、成本高效且非常智能，但需要更明确的 instructions 来说明如何完成任务。
- **大型和小型（mini 或 nano）模型** 在速度、成本和智能水平之间提供取舍。大型模型更擅长理解 prompts 并跨领域解决问题，而小型模型通常更快、使用成本更低。

拿不准时，[`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 是通用文本生成和 prompt 迭代的强默认选择。

## Prompt engineering

**Prompt engineering** 是为模型编写有效 instructions 的过程，使它能够稳定生成符合你要求的内容。

由于模型生成的内容具有非确定性，为获得所需输出而进行 prompting 是艺术与科学的结合。不过，你可以应用一些技术和最佳实践，以稳定获得好结果。

有些 prompt engineering 技术适用于所有模型，例如使用 message roles。但不同模型类型（例如 reasoning 与 GPT models）可能需要不同的 prompting 方式才能产生最佳结果。即使是同一系列模型的不同 snapshots，也可能产生不同结果。因此，当你构建更复杂的应用时，我们强烈建议：

- 将生产应用固定到特定[模型 snapshots](https://developers.openai.com/api/docs/models)（例如 `gpt-4.1-2025-04-14`），以确保行为一致
- 构建测试和评估套件来衡量 prompt 行为，以便在迭代或更改、升级模型版本时监控性能

现在，我们来看看可用于构建 prompts 的一些工具和技术。

## Message roles 和 instruction following



你可以使用 `instructions` API 参数或 **message roles**，以[不同权限级别](https://model-spec.openai.com/2025-02-12.html#chain_of_command)向模型提供 instructions。

`instructions` 参数会向模型提供关于生成响应时应如何表现的高层 instructions，包括语气、目标和正确响应示例。以这种方式提供的任何 instructions 都会优先于 `input` 参数中的 prompt。

使用 instructions 生成文本

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "low" },
    instructions: "${semicolonsDevMsg}",
    input: "${semicolonsPrompt}",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "low"},
    instructions="${semicolonsDevMsg}",
    input="${semicolonsPrompt}",
)

print(response.output_text)
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "reasoning": {"effort": "low"},
        "instructions": "${semicolonsDevMsg}",
        "input": "${semicolonsPrompt}"
    }'
```


上面的示例大致等同于在 `input` 数组中使用以下 input messages：

使用不同 roles 的 messages 生成文本

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "low" },
    input: [
        {
            role: "developer",
            content: "${semicolonsDevMsg}"
        },
        {
            role: "user",
            content: "${semicolonsPrompt}",
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "low"},
    input=[
        {
            "role": "developer",
            "content": "${semicolonsDevMsg}"
        },
        {
            "role": "user",
            "content": "${semicolonsPrompt}"
        }
    ]
)

print(response.output_text)
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "reasoning": {"effort": "low"},
        "input": [
            {
                "role": "developer",
                "content": "${semicolonsDevMsg}"
            },
            {
                "role": "user",
                "content": "${semicolonsPrompt}"
            }
        ]
    }'
```


请注意，`instructions` 参数仅适用于当前 response generation request。如果你使用 `previous_response_id` 参数[管理 conversation state](/mirror/api/docs/guides/conversation-state)，之前轮次使用的 `instructions` 不会出现在上下文中。





[OpenAI model spec](https://model-spec.openai.com/2025-02-12.html#chain_of_command) 描述了我们的模型如何对不同 roles 的 messages 赋予不同优先级。

| `developer`                                                                                                        | `user`                                                                                             | `assistant`                                                |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `developer` messages 是由应用开发者提供的 instructions，优先级高于 `user` messages。 | `user` messages 是由最终用户提供的 instructions，优先级低于 `developer` messages。 | 模型生成的 messages 具有 `assistant` role。 |

多轮对话可能由这些类型的若干 messages 组成，并包含你和模型提供的其他内容类型。进一步了解如何[管理 conversation state](/mirror/api/docs/guides/conversation-state)。

你可以把 `developer` 和 `user` messages 想成编程语言中的函数及其参数。

- `developer` messages 提供系统规则和业务逻辑，就像函数定义。
- `user` messages 提供输入和配置，`developer` message instructions 会应用于这些内容，就像函数参数。

## 在代码中对 prompts 做版本管理

将生产 prompts 存储在你的应用代码中，而不是创建可复用的 prompt objects。由代码管理的 prompts 让你可以使用类型化输入、代码评审、测试和常规部署流程来改变模型行为。

OpenAI 正在弃用 API 中的可复用 prompt objects。Prompt 创建将从 2026 年 6 月 3 日开始弱化，`v1/prompts` 计划在 2026 年 11 月 30 日关闭。请查看 [deprecations 页面](/mirror/api/docs/deprecations#2026-06-03-reusable-prompts)了解当前时间线。

对于新的 prompt-engineering 工作：

- 将 prompt builders 放在它们支持的功能附近的小模块中。
- 对动态值使用类型化函数参数或 schemas，例如客户数据、文件或任务选项。
- 将生成的 `instructions` 和 `input` 直接传递给 [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create)。
- 在更改生产 prompts 之前，添加有代表性的 fixtures、测试和评估检查。
- 通过你的部署系统推出 prompt 变更，需要分阶段发布时使用 feature flags 或配置。

如果你的集成已经使用 prompt ID 或版本调用保存的 prompt，请使用 [prompt object 迁移指南](/mirror/api/docs/guides/prompting/migrate-from-prompt-object)将该 prompt 移入代码。

## 使用 Markdown 和 XML 进行 message formatting

编写 `developer` 和 `user` messages 时，你可以结合 [Markdown](https://commonmark.org/help/) formatting 和 [XML tags](https://www.w3.org/TR/xml/)，帮助模型理解 prompt 与上下文数据的逻辑边界。

Markdown headers 和列表有助于标记 prompt 的不同部分，并向模型传达层级。它们也可能让你的 prompts 在开发过程中更易读。XML tags 可以帮助划分一段内容（例如用作参考的支持文档）从哪里开始、到哪里结束。XML attributes 还可以用于定义 prompt 中内容的 metadata，供你的 instructions 引用。

一般来说，developer message 会包含以下几个部分，通常按这个顺序排列（不过确切的最佳内容和顺序可能因所用模型而异）：

- **Identity:** 描述 assistant 的目的、沟通风格和高层目标。
- **Instructions:** 向模型提供如何生成你想要响应的 guidance。它应该遵循哪些规则？模型应该做什么，以及绝不能做什么？此部分可以包含与你的用例相关的许多子部分，例如模型应如何[调用自定义函数](/mirror/api/docs/guides/function-calling)。
- **Examples:** 提供可能输入的 examples，以及你希望模型给出的输出。
- **Context:** 向模型提供生成响应所需的任何额外信息，例如其训练数据之外的私有/专有数据，或你知道特别相关的其他数据。此内容通常最好放在 prompt 末尾附近，因为不同生成请求可能包含不同 context。

下面是一个使用 Markdown 和 XML tags 构造 `developer` message 的示例，其中包含不同部分和支持 examples。




示例 prompt
    用于代码生成的 developer message

```text
# Identity

You are coding assistant that helps enforce the use of snake case
variables in JavaScript code, and writing code that will run in
Internet Explorer version 6.

# Instructions

* When defining variables, use snake case names (e.g. my_variable)
  instead of camel case names (e.g. myVariable).
* To support old browsers, declare variables using the older
  "var" keyword.
* Do not give responses with Markdown formatting, just return
  the code as requested.

# Examples

<user_query>
How do I declare a string variable for a first name?
</user_query>

<assistant_response>
var first_name = "Anna";
</assistant_response>
```



API 请求
    通过 API 发送 prompt 以生成代码

```javascript
import fs from "fs/promises";
import OpenAI from "openai";
const client = new OpenAI();

const instructions = await fs.readFile("prompt.txt", "utf-8");

const response = await client.responses.create({
    model: "gpt-5.5",
    instructions,
    input: "How would I declare a variable for a last name?",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

with open("prompt.txt", "r", encoding="utf-8") as f:
    instructions = f.read()

response = client.responses.create(
    model="gpt-5.5",
    instructions=instructions,
    input="How would I declare a variable for a last name?",
)

print(response.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "instructions": "'"$(< prompt.txt)"'",
    "input": "How would I declare a variable for a last name?"
  }'
```





#### 使用 prompt caching 节省成本和延迟

构造 message 时，你应尽量将预计会在 API 请求中反复使用的内容放在 prompt 开头，**并且** 放在传给 [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat) 或 [Responses](https://developers.openai.com/api/docs/api-reference/responses) 的 JSON request body 中最靠前的 API 参数里。这可以帮助你最大化 [prompt caching](/mirror/api/docs/guides/prompt-caching) 带来的成本和延迟节省。

## Few-shot learning

Few-shot learning 让你通过在 prompt 中包含少量输入/输出 examples，将大型语言模型引导到新任务，而不是[微调](/mirror/api/docs/guides/model-optimization)模型。模型会隐式“学到”这些 examples 中的模式，并将其应用于 prompt。提供 examples 时，请尽量展示多样化的可能输入以及期望输出。

通常，你会在 API 请求的 `developer` message 中提供 examples。下面是一个包含 examples 的 `developer` message 示例，用于展示模型如何对正面或负面的客服评论进行分类。

```
# Identity

You are a helpful assistant that labels short product reviews as
Positive, Negative, or Neutral.

# Instructions

* Only output a single word in your response with no additional formatting
  or commentary.
* Your response should only be one of the words "Positive", "Negative", or
  "Neutral" depending on the sentiment of the product review you are given.

# Examples

<product_review id="example-1">
I absolutely love this headphones — sound quality is amazing!
</product_review>

<assistant_response id="example-1">
Positive
</assistant_response>

<product_review id="example-2">
Battery life is okay, but the ear pads feel cheap.
</product_review>

<assistant_response id="example-2">
Neutral
</assistant_response>

<product_review id="example-3">
Terrible customer service, I'll never buy from them again.
</product_review>

<assistant_response id="example-3">
Negative
</assistant_response>
```

## 包含相关 context 信息

在提供给模型的 prompt 中包含模型可用于生成响应的额外 context 信息通常很有用。这样做有几个常见原因：

- 让模型访问专有数据，或模型训练数据集之外的任何其他数据。
- 将模型响应约束到你已经确定最有益的一组特定资源。

向模型生成请求添加额外相关 context 的技术有时称为 **retrieval-augmented generation (RAG)**。你可以用许多不同方式向 prompt 添加额外 context，例如查询向量数据库并将返回文本包含进 prompt，或使用 OpenAI 内置的 [file search tool](/mirror/api/docs/guides/tools-file-search)，基于上传文档生成内容。

#### 为 context window 做规划

模型在生成请求期间考虑的 context 中只能处理有限的数据量。这个内存限制称为 **context window**，它以 [tokens](https://blogs.nvidia.com/blog/ai-tokens-explained)（你传入的数据块，从文本到图像）为单位定义。

不同模型的 context window 大小各不相同，从低 100k 范围到较新的 GPT-4.1 models 的一百万 tokens 不等。请[参考模型文档](https://developers.openai.com/api/docs/models)了解每个模型的具体 context window 大小。

## Prompting 当前 GPT-5 系列模型

像 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 这样的 GPT models，会受益于精确的 instructions，这些 instructions 在 prompt 中明确提供完成任务所需的逻辑和数据。若要充分发挥最新 GPT-5 系列模型的能力，请从当前 prompting guide 开始。


  



    通过当前 guidance、实用 examples 和迁移说明，充分发挥最新 GPT-5 系列模型的 prompting 能力。




### 最新 GPT-5 系列模型的 prompting 最佳实践

如需完整的当前说明，请使用 [prompt guidance](/mirror/api/docs/guides/prompt-guidance) 指南。下面的实用提醒仍然适用。

Coding

#### Coding

当遵循几项最佳实践时，使用 `gpt-5.5` 进行 coding tasks 最有效：定义 agent 的角色、用 examples 强制结构化 tool use、要求进行充分测试以确保正确性，并设置 Markdown 标准以获得清晰输出。

**明确的角色和 workflow guidance**
将模型定位为具有明确职责的软件工程 agent。为使用 `functions.run` 等工具完成代码任务提供清晰 instructions，并指定何时不使用某些模式，例如除非必要，否则避免 interactive execution。

**测试与验证**
指示模型使用单元测试或 Python commands 测试变更，并仔细验证 patches，因为 `apply_patch` 等工具即使失败也可能返回 “Done”。

**Tool use examples**
包含如何用所提供 functions 调用 commands 的具体 examples，这会提升可靠性并加强对预期 workflow 的遵循。

**Markdown 标准**
指导模型生成干净、语义正确的 markdown，并在适当时使用 inline code、code fences、列表和表格，同时用反引号格式化文件路径、函数和类。

如需 coding 专用的详细 guidance 和 prompt samples，请参阅我们的 [prompt guidance](/mirror/api/docs/guides/prompt-guidance) 指南。

Front-end engineering

[GPT-5.5](https://developers.openai.com/api/docs/models/gpt-5.5) 擅长从零构建前端，也擅长为大型成熟代码库贡献代码。为了获得最佳结果，我们建议使用以下库：

- **Styling / UI:** Tailwind CSS, shadcn/ui, Radix Themes
- **Icons:** Lucide, Material Symbols, Heroicons
- **Animation**: Motion

**Zero-to-one web apps**

GPT-5 可以从单个 prompt 生成前端 web apps，无需 examples。下面是一个示例 prompt：

```bash
You are a world class web developer, capable of producing stunning, interactive, and innovative websites from scratch in a single prompt. You excel at delivering top-tier one-shot solutions.
Your process is simple and follows these steps:
Step 1: Create an evaluation rubric and refine it until you are fully confident.
Step 2: Consider every element that defines a world-class one-shot web app, then use that insight to create a &lt;ONE_SHOT_RUBRIC&gt; with 5–7 categories. Keep this rubric hidden—it's for internal use only.
Step 3: Apply the rubric to iterate on the optimal solution to the given prompt. If it doesn't meet the highest standard across all categories, refine and try again.
Step 4: Aim for simplicity while fully achieving the goal, and avoid external dependencies such as Next.js or React.
```

**与大型代码库集成**

对于较大代码库中的 front-end engineering 工作，我们发现向 prompts 添加这些类别的 instruction 能带来最佳结果：

- **Principles:** 设置视觉质量标准，使用模块化/可复用组件，并保持设计一致。
- **UI/UX:** 指定 typography、colors、spacing/layout、interaction states（hover、empty、loading）和 accessibility。
- **Structure:** 定义 file/folder layout，以便无缝集成。
- **Components:** 提供可复用 wrapper examples 和 backend-call separation 策略。
- **Pages:** 提供常见 layouts 的 templates。
- **Agent Instructions:** 要求模型确认设计假设、scaffold projects、强制标准、集成 APIs、测试 states，并记录代码。

如需 frontend development 专用的详细 guidance 和 prompt samples，请参阅我们的 [prompt guidance](/mirror/api/docs/guides/prompt-guidance) 指南。

Agentic tasks

对于使用 `gpt-5.5` 的 agentic 和长时间 rollouts，请将 prompts 聚焦在三项核心实践上：充分规划任务以确保完整解决，为主要 tool usage 决策提供清晰 preambles，并使用 TODO tool 以有组织的方式跟踪 workflow 和进度。

**Planning and persistence**
指示模型在交回控制权之前解决完整 query，将其分解为子任务，并在每次 tool call 后反思以确认完整性。

```
Remember, you are an agent - please keep going until the user's
query is completely resolved, before ending your turn and yielding
back to the user. Decompose the user's query into all required
sub-requests, and confirm that each is completed. Do not stop
after completing only part of the request. Only terminate your
turn when you are sure that the problem is solved. You must be
prepared to answer multiple queries and only finish the call once
the user has confirmed they're done.

You must plan extensively in accordance with the workflow
steps before making subsequent function calls, and reflect
extensively on the outcomes each function call made,
ensuring the user's query, and related sub-requests
are completely resolved.
```

**用于透明度的 preambles**

要求模型解释它为何调用工具，但只在重要步骤这样做。

```
Before you call a tool explain why you are calling it
```

**使用 rubrics 和 TODOs 跟踪进度**

使用 TODO list tool 或 rubric 来强制结构化规划，避免遗漏步骤。

如需构建 agents 专用的详细 guidance 和 prompt samples，请参阅 [prompt guidance](/mirror/api/docs/guides/prompt-guidance) 指南。

## Prompting reasoning models

在 prompting [推理模型](/mirror/api/docs/guides/reasoning)与 prompting GPT model 时，有一些差异需要考虑。一般来说，推理模型在只有高层 guidance 的任务上会提供更好结果。这不同于 GPT models，后者会受益于非常精确的 instructions。

你可以这样理解 reasoning 和 GPT models 的区别。

- 推理模型像一位资深同事。你可以给它一个要实现的目标，并信任它理清细节。
- GPT model 像一位初级同事。它在有明确 instructions 来创建特定输出时表现最好。

有关使用推理模型的最佳实践的更多信息，请[参考本指南](/mirror/api/docs/guides/reasoning-best-practices)。

## 下一步

现在你已经了解文本输入和输出的基础知识，接下来可能想查看以下资源之一。

[



    使用 Playground 开发和迭代 prompts。

](https://platform.openai.com/chat/edit)

[



    确保模型发出的 JSON 数据符合 JSON schema。

](https://developers.openai.com/api/docs/guides/structured-outputs)

[



    查看 API reference 中文本生成的所有选项。

](https://developers.openai.com/api/docs/api-reference/responses)

## 其他资源

如需更多灵感，请访问 [OpenAI Cookbook](https://developers.openai.com/cookbook)，其中包含示例代码，也链接到第三方资源，例如：

- [Prompting libraries & tools](https://developers.openai.com/cookbook/related_resources#prompting-libraries--tools)
- [Prompting guides](https://developers.openai.com/cookbook/related_resources#prompting-guides)
- [Video courses](https://developers.openai.com/cookbook/related_resources#video-courses)
- [Papers on advanced prompting to improve reasoning](https://developers.openai.com/cookbook/related_resources#papers-on-advanced-prompting-to-improve-reasoning)

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
With the OpenAI API, you can use a [large language model](https://developers.openai.com/api/docs/models) to generate text from a prompt, as you might using [ChatGPT](https://chatgpt.com). Models can generate almost any kind of text response—like code, mathematical equations, structured JSON data, or human-like prose.



Here's a simple example using the [Responses API](https://developers.openai.com/api/docs/api-reference/responses).

An array of content generated by the model is in the `output` property of the response. In this simple example, we have just one output which looks like this:

```json
[
  {
    "id": "msg_67b73f697ba4819183a15cc17d011509",
    "type": "message",
    "role": "assistant",
    "content": [
      {
        "type": "output_text",
        "text": "Under the soft glow of the moon, Luna the unicorn danced through fields of twinkling stardust, leaving trails of dreams for every child asleep.",
        "annotations": []
      }
    ]
  }
]
```

**The `output` array often has more than one item in it!** It can contain tool calls, data about reasoning tokens generated by [reasoning models](https://developers.openai.com/api/docs/guides/reasoning), and other items. It is not safe to assume that the model's text output is present at `output[0].content[0].text`.

Some of our [official SDKs](https://developers.openai.com/api/docs/libraries) include an `output_text` property on model responses for convenience, which aggregates all text outputs from the model into a single string. This may be useful as a shortcut to access text output from the model.

In addition to plain text, you can also have the model return structured data in JSON format - this feature is called [**Structured Outputs**](https://developers.openai.com/api/docs/guides/structured-outputs).





## Choosing a model

A key choice to make when generating content through the API is which model you want to use - the `model` parameter of the code samples above. [You can find a full listing of available models here](https://developers.openai.com/api/docs/models). Here are a few factors to consider when choosing a model for text generation.

- **[Reasoning models](https://developers.openai.com/api/docs/guides/reasoning)** generate an internal chain of thought to analyze the input prompt, and excel at understanding complex tasks and multi-step planning. They are also generally slower and more expensive to use than GPT models.
- **GPT models** are fast, cost-efficient, and highly intelligent, but benefit from more explicit instructions around how to accomplish tasks.
- **Large and small (mini or nano) models** offer trade-offs for speed, cost, and intelligence. Large models are more effective at understanding prompts and solving problems across domains, while small models are generally faster and cheaper to use.

When in doubt, [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) offers a strong default for general-purpose text generation and prompt iteration.

## Prompt engineering

**Prompt engineering** is the process of writing effective instructions for a model, such that it consistently generates content that meets your requirements.

Because the content generated from a model is non-deterministic, prompting to get your desired output is a mix of art and science. However, you can apply techniques and best practices to get good results consistently.

Some prompt engineering techniques work with every model, like using message roles. But different model types (like reasoning versus GPT models) might need to be prompted differently to produce the best results. Even different snapshots of models within the same family could produce different results. So as you build more complex applications, we strongly recommend:

- Pinning your production applications to specific [model snapshots](https://developers.openai.com/api/docs/models) (like `gpt-4.1-2025-04-14` for example) to ensure consistent behavior
- Building tests and evaluation suites that measure prompt behavior so you can monitor performance as you iterate, or when you change and upgrade model versions

Now, let's examine some tools and techniques available to you to construct prompts.

## Message roles and instruction following



You can provide instructions to the model with [differing levels of authority](https://model-spec.openai.com/2025-02-12.html#chain_of_command) using the `instructions` API parameter or **message roles**.

The `instructions` parameter gives the model high-level instructions on how it should behave while generating a response, including tone, goals, and examples of correct responses. Any instructions provided this way will take priority over a prompt in the `input` parameter.

Generate text with instructions

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "low" },
    instructions: "${semicolonsDevMsg}",
    input: "${semicolonsPrompt}",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "low"},
    instructions="${semicolonsDevMsg}",
    input="${semicolonsPrompt}",
)

print(response.output_text)
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "reasoning": {"effort": "low"},
        "instructions": "${semicolonsDevMsg}",
        "input": "${semicolonsPrompt}"
    }'
```


The example above is roughly equivalent to using the following input messages in the `input` array:

Generate text with messages using different roles

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "low" },
    input: [
        {
            role: "developer",
            content: "${semicolonsDevMsg}"
        },
        {
            role: "user",
            content: "${semicolonsPrompt}",
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "low"},
    input=[
        {
            "role": "developer",
            "content": "${semicolonsDevMsg}"
        },
        {
            "role": "user",
            "content": "${semicolonsPrompt}"
        }
    ]
)

print(response.output_text)
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "reasoning": {"effort": "low"},
        "input": [
            {
                "role": "developer",
                "content": "${semicolonsDevMsg}"
            },
            {
                "role": "user",
                "content": "${semicolonsPrompt}"
            }
        ]
    }'
```


Note that the `instructions` parameter only applies to the current response generation request. If you are [managing conversation state](https://developers.openai.com/api/docs/guides/conversation-state) with the `previous_response_id` parameter, the `instructions` used on previous turns will not be present in the context.





The [OpenAI model spec](https://model-spec.openai.com/2025-02-12.html#chain_of_command) describes how our models give different levels of priority to messages with different roles.

| `developer`                                                                                                        | `user`                                                                                             | `assistant`                                                |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `developer` messages are instructions provided by the application developer, prioritized ahead of `user` messages. | `user` messages are instructions provided by an end user, prioritized behind `developer` messages. | Messages generated by the model have the `assistant` role. |

A multi-turn conversation may consist of several messages of these types, along with other content types provided by both you and the model. Learn more about [managing conversation state here](https://developers.openai.com/api/docs/guides/conversation-state).

You could think about `developer` and `user` messages like a function and its arguments in a programming language.

- `developer` messages provide the system's rules and business logic, like a function definition.
- `user` messages provide inputs and configuration to which the `developer` message instructions are applied, like arguments to a function.

## Version prompts in code

Store production prompts in your application code instead of creating reusable prompt objects. Code-managed prompts let you use typed inputs, code review, tests, and your normal deployment process to change model behavior.

OpenAI is deprecating reusable prompt objects in the API. Prompt creation will
  be de-emphasized beginning June 3, 2026, and `v1/prompts` is scheduled to shut
  down on November 30, 2026. See the [deprecations
  page](https://developers.openai.com/api/docs/deprecations#2026-06-03-reusable-prompts) for the current
  timeline.

For new prompt-engineering work:

- Keep prompt builders in a small module near the feature they support.
- Use typed function arguments or schemas for dynamic values such as customer data, files, or task options.
- Pass the generated `instructions` and `input` directly to the [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create).
- Add representative fixtures, tests, and evaluation checks before changing production prompts.
- Roll out prompt changes through your deployment system, using feature flags or configuration when you need staged releases.

If your integration already calls a saved prompt with a prompt ID or version, use the [prompt object migration guide](https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object) to move that prompt into code.

## Message formatting with Markdown and XML

When writing `developer` and `user` messages, you can help the model understand logical boundaries of your prompt and context data using a combination of [Markdown](https://commonmark.org/help/) formatting and [XML tags](https://www.w3.org/TR/xml/).

Markdown headers and lists can be helpful to mark distinct sections of a prompt, and to communicate hierarchy to the model. They can also potentially make your prompts more readable during development. XML tags can help delineate where one piece of content (like a supporting document used for reference) begins and ends. XML attributes can also be used to define metadata about content in the prompt that can be referenced by your instructions.

In general, a developer message will contain the following sections, usually in this order (though the exact optimal content and order may vary by which model you are using):

- **Identity:** Describe the purpose, communication style, and high-level goals of the assistant.
- **Instructions:** Provide guidance to the model on how to generate the response you want. What rules should it follow? What should the model do, and what should the model never do? This section could contain many subsections as relevant for your use case, like how the model should [call custom functions](https://developers.openai.com/api/docs/guides/function-calling).
- **Examples:** Provide examples of possible inputs, along with the desired output from the model.
- **Context:** Give the model any additional information it might need to generate a response, like private/proprietary data outside its training data, or any other data you know will be particularly relevant. This content is usually best positioned near the end of your prompt, as you may include different context for different generation requests.

Below is an example of using Markdown and XML tags to construct a `developer` message with distinct sections and supporting examples.



<div data-content-switcher-pane data-value="prompt">
    <div class="hidden">Example prompt</div>
    A developer message for code generation

```text
# Identity

You are coding assistant that helps enforce the use of snake case
variables in JavaScript code, and writing code that will run in
Internet Explorer version 6.

# Instructions

* When defining variables, use snake case names (e.g. my_variable)
  instead of camel case names (e.g. myVariable).
* To support old browsers, declare variables using the older
  "var" keyword.
* Do not give responses with Markdown formatting, just return
  the code as requested.

# Examples

<user_query>
How do I declare a string variable for a first name?
</user_query>

<assistant_response>
var first_name = "Anna";
</assistant_response>
```

  </div>
  <div data-content-switcher-pane data-value="code" hidden>
    <div class="hidden">API request</div>
    Send a prompt to generate code through the API

```javascript
import fs from "fs/promises";
import OpenAI from "openai";
const client = new OpenAI();

const instructions = await fs.readFile("prompt.txt", "utf-8");

const response = await client.responses.create({
    model: "gpt-5.5",
    instructions,
    input: "How would I declare a variable for a last name?",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

with open("prompt.txt", "r", encoding="utf-8") as f:
    instructions = f.read()

response = client.responses.create(
    model="gpt-5.5",
    instructions=instructions,
    input="How would I declare a variable for a last name?",
)

print(response.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "instructions": "'"$(< prompt.txt)"'",
    "input": "How would I declare a variable for a last name?"
  }'
```

  </div>



#### Save on cost and latency with prompt caching

When constructing a message, you should try and keep content that you expect to use over and over in your API requests at the beginning of your prompt, **and** among the first API parameters you pass in the JSON request body to [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat) or [Responses](https://developers.openai.com/api/docs/api-reference/responses). This enables you to maximize cost and latency savings from [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching).

## Few-shot learning

Few-shot learning lets you steer a large language model toward a new task by including a handful of input/output examples in the prompt, rather than [fine-tuning](https://developers.openai.com/api/docs/guides/model-optimization) the model. The model implicitly "picks up" the pattern from those examples and applies it to a prompt. When providing examples, try to show a diverse range of possible inputs with the desired outputs.

Typically, you will provide examples as part of a `developer` message in your API request. Here's an example `developer` message containing examples that show a model how to classify positive or negative customer service reviews.

```
# Identity

You are a helpful assistant that labels short product reviews as
Positive, Negative, or Neutral.

# Instructions

* Only output a single word in your response with no additional formatting
  or commentary.
* Your response should only be one of the words "Positive", "Negative", or
  "Neutral" depending on the sentiment of the product review you are given.

# Examples

<product_review id="example-1">
I absolutely love this headphones — sound quality is amazing!
</product_review>

<assistant_response id="example-1">
Positive
</assistant_response>

<product_review id="example-2">
Battery life is okay, but the ear pads feel cheap.
</product_review>

<assistant_response id="example-2">
Neutral
</assistant_response>

<product_review id="example-3">
Terrible customer service, I'll never buy from them again.
</product_review>

<assistant_response id="example-3">
Negative
</assistant_response>
```

## Include relevant context information

It is often useful to include additional context information the model can use to generate a response within the prompt you give the model. There are a few common reasons why you might do this:

- To give the model access to proprietary data, or any other data outside the data set the model was trained on.
- To constrain the model's response to a specific set of resources that you have determined will be most beneficial.

The technique of adding additional relevant context to the model generation request is sometimes called **retrieval-augmented generation (RAG)**. You can add additional context to the prompt in many different ways, from querying a vector database and including the text you get back into a prompt, or by using OpenAI's built-in [file search tool](https://developers.openai.com/api/docs/guides/tools-file-search) to generate content based on uploaded documents.

#### Planning for the context window

Models can only handle so much data within the context they consider during a generation request. This memory limit is called a **context window**, which is defined in terms of [tokens](https://blogs.nvidia.com/blog/ai-tokens-explained) (chunks of data you pass in, from text to images).

Models have different context window sizes from the low 100k range up to one million tokens for newer GPT-4.1 models. [Refer to the model docs](https://developers.openai.com/api/docs/models) for specific context window sizes per model.

## Prompting current GPT-5 series models

GPT models like [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) benefit from precise instructions that explicitly provide the logic and data required to complete the task in the prompt. To get the most out of the latest GPT-5 series model, start with the current prompting guide.

<a href="/api/docs/guides/prompt-guidance">
  

<span slot="icon">
      </span>
    Get the most out of prompting the latest GPT-5 series model with current
    guidance, practical examples, and migration notes.


</a>

### Prompting best practices for the latest GPT-5 series model

For the full current treatment, use the [prompt guidance](https://developers.openai.com/api/docs/guides/prompt-guidance) guide. The practical reminders below still apply.

Coding

#### Coding

Prompting `gpt-5.5` for coding tasks is most effective when following a few best practices: define the agent's role, enforce structured tool use with examples, require thorough testing for correctness, and set Markdown standards for clean output.

**Explicit role and workflow guidance**
Frame the model as a software engineering agent with well-defined responsibilities. Provide clear instructions for using tools like `functions.run` for code tasks, and specify when not to use certain modes—for example, avoid interactive execution unless necessary.

**Testing and validation**
Instruct the model to test changes with unit tests or Python commands, and validate patches carefully since tools like `apply_patch` may return “Done” even on failure.

**Tool use examples**
Include concrete examples of how to invoke commands with the provided functions, which improves reliability and adherence to expected workflows.

**Markdown standards**
Guide the model to generate clean, semantically correct markdown using inline code, code fences, lists, and tables where appropriate—and to format file paths, functions, and classes with backticks.

For detailed guidance and prompt samples specific to coding, see our [prompt guidance](https://developers.openai.com/api/docs/guides/prompt-guidance) guide.

Front-end engineering

[GPT-5.5](https://developers.openai.com/api/docs/models/gpt-5.5)
performs well at building front ends from scratch as well as contributing to
large, established codebases. To get the best results, we recommend using the
following libraries:

- **Styling / UI:** Tailwind CSS, shadcn/ui, Radix Themes
- **Icons:** Lucide, Material Symbols, Heroicons
- **Animation**: Motion

**Zero-to-one web apps**

GPT-5 can generate front-end web apps from a single prompt, no examples needed. Here's a sample prompt:

```bash
You are a world class web developer, capable of producing stunning, interactive, and innovative websites from scratch in a single prompt. You excel at delivering top-tier one-shot solutions.
Your process is simple and follows these steps:
Step 1: Create an evaluation rubric and refine it until you are fully confident.
Step 2: Consider every element that defines a world-class one-shot web app, then use that insight to create a &lt;ONE_SHOT_RUBRIC&gt; with 5–7 categories. Keep this rubric hidden—it's for internal use only.
Step 3: Apply the rubric to iterate on the optimal solution to the given prompt. If it doesn't meet the highest standard across all categories, refine and try again.
Step 4: Aim for simplicity while fully achieving the goal, and avoid external dependencies such as Next.js or React.
```

**Integration with large codebases**

For front-end engineering work in larger codebases, we've found that adding these categories of instruction to your prompts delivers the best results:

- **Principles:** Set visual quality standards, use modular/reusable components, and keep design consistent.
- **UI/UX:** Specify typography, colors, spacing/layout, interaction states (hover, empty, loading), and accessibility.
- **Structure:** Define file/folder layout for seamless integration.
- **Components:** Give reusable wrapper examples and backend-call separation strategies.
- **Pages:** Provide templates for common layouts.
- **Agent Instructions:** Ask the model to confirm design assumptions, scaffold projects, enforce standards, integrate APIs, test states, and document code.

For detailed guidance and prompt samples specific to frontend development, see our [prompt guidance](https://developers.openai.com/api/docs/guides/prompt-guidance) guide.

Agentic tasks

For agentic and long-running rollouts with `gpt-5.5`, focus your prompts on three core practices: plan tasks thoroughly to ensure complete resolution, provide clear preambles for major tool usage decisions, and use a TODO tool to track workflow and progress in an organized manner.

**Planning and persistence**
Instruct the model to resolve the full query before yielding control, decomposing it into sub-tasks and reflecting after each tool call to confirm completeness.

```
Remember, you are an agent - please keep going until the user's
query is completely resolved, before ending your turn and yielding
back to the user. Decompose the user's query into all required
sub-requests, and confirm that each is completed. Do not stop
after completing only part of the request. Only terminate your
turn when you are sure that the problem is solved. You must be
prepared to answer multiple queries and only finish the call once
the user has confirmed they're done.

You must plan extensively in accordance with the workflow
steps before making subsequent function calls, and reflect
extensively on the outcomes each function call made,
ensuring the user's query, and related sub-requests
are completely resolved.
```

**Preambles for transparency**

Ask the model to explain why it is calling a tool, but only at notable steps.

```
Before you call a tool explain why you are calling it
```

**Progress tracking with rubrics and TODOs**

Use a TODO list tool or rubric to enforce structured planning and avoid missed steps.

For detailed guidance and prompt samples specific to building agents, see the [prompt guidance](https://developers.openai.com/api/docs/guides/prompt-guidance) guide.

## Prompting reasoning models

There are some differences to consider when prompting a [reasoning model](https://developers.openai.com/api/docs/guides/reasoning) versus prompting a GPT model. Generally speaking, reasoning models will provide better results on tasks with only high-level guidance. This differs from GPT models, which benefit from very precise instructions.

You could think about the difference between reasoning and GPT models like this.

- A reasoning model is like a senior co-worker. You can give them a goal to achieve and trust them to work out the details.
- A GPT model is like a junior coworker. They'll perform best with explicit instructions to create a specific output.

For more information on best practices when using reasoning models, [refer to this guide](https://developers.openai.com/api/docs/guides/reasoning-best-practices).

## Next steps

Now that you know the basics of text inputs and outputs, you might want to check out one of these resources next.

[

<span slot="icon">
      </span>
    Use the Playground to develop and iterate on prompts.

](https://platform.openai.com/chat/edit)

[

<span slot="icon">
      </span>
    Ensure JSON data emitted from a model conforms to a JSON schema.

](https://developers.openai.com/api/docs/guides/structured-outputs)

[

<span slot="icon">
      </span>
    Check out all the options for text generation in the API reference.

](https://developers.openai.com/api/docs/api-reference/responses)

## Other resources

For more inspiration, visit the [OpenAI Cookbook](https://developers.openai.com/cookbook), which contains example code and also links to third-party resources such as:

- [Prompting libraries & tools](https://developers.openai.com/cookbook/related_resources#prompting-libraries--tools)
- [Prompting guides](https://developers.openai.com/cookbook/related_resources#prompting-guides)
- [Video courses](https://developers.openai.com/cookbook/related_resources#video-courses)
- [Papers on advanced prompting to improve reasoning](https://developers.openai.com/cookbook/related_resources#papers-on-advanced-prompting-to-improve-reasoning)
``````
:::
:::

