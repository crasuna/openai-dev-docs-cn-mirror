---
status: needs-review
sourceId: "ed1ece57fded"
sourceChecksum: "ed1ece57fdedc925ead6e0180353715587edf618a92f12aa1d1f1d07f7ffb0fb"
sourceUrl: "https://developers.openai.com/api/docs/guides/text"
translatedAt: "2026-06-27T10:24:24.269Z"
translator: codex-gpt-5.5-xhigh
---

# 文本生成

借助 OpenAI API，你可以使用[大语言模型](https://developers.openai.com/api/docs/models)根据 prompt 生成文本，就像使用 [ChatGPT](https://chatgpt.com) 一样。模型几乎可以生成任何类型的文本响应，例如代码、数学公式、结构化 JSON 数据，或类似人类的散文。

对于此类文本生成调用，请使用 [Responses API](https://developers.openai.com/api/docs/api-reference/responses) 直接请求模型。

模型生成的内容数组位于响应的 `output` 属性中。在这个简单示例中，我们只有一个输出，看起来像这样：

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

**`output` 数组经常包含不止一个 item！** 它可以包含工具调用、由 [reasoning models](https://developers.openai.com/api/docs/guides/reasoning) 生成的 reasoning tokens 相关数据，以及其他 items。不能安全地假设模型文本输出一定存在于 `output[0].content[0].text`。

我们的一些[官方 SDK](https://developers.openai.com/api/docs/libraries) 为方便起见，在模型响应上包含 `output_text` 属性，该属性会把模型的所有文本输出聚合为单个字符串。这可以作为访问模型文本输出的快捷方式。

除了纯文本之外，你还可以让模型以 JSON 格式返回结构化数据。这项功能称为 [**Structured Outputs**](https://developers.openai.com/api/docs/guides/structured-outputs)。

## Prompt engineering

**Prompt engineering** 是为模型编写有效指令的过程，使模型能够稳定生成符合你要求的内容。

由于模型生成的内容具有非确定性，通过 prompting 获得期望输出既是艺术也是科学。不过，你可以应用一些技术和最佳实践，以稳定获得良好结果。

有些 prompt engineering 技术适用于每个模型，例如使用 message roles。但不同模型可能需要以不同方式 prompting 才能产生最佳结果。即便是同一系列中的不同模型快照，也可能产生不同结果。因此，当你构建更复杂的应用时，我们强烈建议：

- 将生产应用 pin 到特定[模型快照](https://developers.openai.com/api/docs/models)（例如 `gpt-5.5-2026-04-23`），以确保行为一致
- 构建用于衡量 prompt 行为的测试和 evaluation suites，这样你就可以在迭代或更改、升级模型版本时监控性能

现在，让我们看看可用于构建 prompt 的一些工具和技术。

## 选择模型和 API

OpenAI 有许多不同的[模型](https://developers.openai.com/api/docs/models)和若干 API 可供选择。[Reasoning models](https://developers.openai.com/api/docs/guides/reasoning)，例如 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5)，与 chat models 的行为不同，并且对不同 prompt 的响应更好。一个重要提示是，reasoning models 与 Responses API 搭配使用时表现更好，且展现出更高智能。

如果你正在构建任何文本生成应用，我们建议使用 Responses API，而不是较旧的 Chat Completions API。如果你正在使用 reasoning model，[迁移到 Responses](https://developers.openai.com/api/docs/guides/migrate-to-responses) 尤其有用。

## Message roles 与指令遵循

你可以结合 `instructions` API 参数和 **message roles**，以[不同权限级别](https://model-spec.openai.com/2025-02-12.html#chain_of_command)向模型提供指令。

`instructions` 参数为模型提供关于生成响应时应如何表现的高层指令，包括语气、目标和正确响应示例。以这种方式提供的任何指令都会优先于 `input` 参数中的 prompt。

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


上面的示例大致等同于在 `input` 数组中使用以下输入消息：

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


请注意，`instructions` 参数只适用于当前响应生成请求。如果你使用 `previous_response_id` 参数[管理对话状态](https://developers.openai.com/api/docs/guides/conversation-state)，先前轮次使用的 `instructions` 不会出现在上下文中。

[OpenAI model spec](https://model-spec.openai.com/2025-02-12.html#chain_of_command) 描述了我们的模型如何为不同 roles 的 messages 赋予不同优先级。

<table>
  <thead>
    <tr>
      <th>developer</th>
      <th>user</th>
      <th>assistant</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        `developer` messages 是应用开发者提供的指令，其优先级高于 user messages。
      </td>
      <td>
        `user` messages 是 end user 提供的指令，其优先级低于 developer messages。
      </td>
      <td>
        模型生成的消息具有 <code>assistant</code> role。
      </td>
    </tr>
  </tbody>
</table>

多轮对话可能由这些类型的多条消息组成，也可能包含你和模型提供的其他内容类型。请在[这里](https://developers.openai.com/api/docs/guides/conversation-state)了解更多关于管理对话状态的信息。

你可以把 `developer` 和 `user` messages 想象成编程语言中的函数及其参数。

- `developer` messages 提供系统规则和业务逻辑，就像函数定义。
- `user` messages 提供输入和配置，`developer` message 指令会应用到这些输入和配置上，就像函数的参数。

## 在代码中版本化 prompts

将生产 prompt 存储在应用代码中，而不是创建可复用 prompt objects。由代码管理的 prompts 让你可以使用类型化输入、代码审查、测试和常规部署流程来更改模型行为。

OpenAI 正在弃用 API 中的可复用 prompt objects。Prompt creation 将从 2026 年 6 月 3 日起弱化，`v1/prompts` 计划于 2026 年 11 月 30 日关闭。请查看 [deprecations
  page](https://developers.openai.com/api/docs/deprecations#2026-06-03-reusable-prompts) 了解当前时间线。

对于新的文本生成工作：

- 将 prompt builders 放在靠近其所支持功能的小模块中。
- 对动态值（例如客户数据、文件或任务选项）使用类型化函数参数或 schemas。
- 将生成的 `instructions` 和 `input` 直接传给 [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create)。
- 在更改生产 prompt 前，添加有代表性的 fixtures、tests 和 evaluation checks。
- 通过你的部署系统推出 prompt 变更，在需要分阶段发布时使用 feature flags 或配置。

如果你的集成已经使用 prompt ID 或版本调用 saved prompt，请使用 [prompt object migration guide](https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object) 将该 prompt 移入代码。

## 后续步骤

现在你已经了解文本输入和输出的基础知识，接下来可能想查看以下资源之一。

[

<span slot="icon">
      </span>
    使用 Playground 开发和迭代 prompts。

](https://platform.openai.com/chat/edit)

[

<span slot="icon">
      </span>
    确保模型发出的 JSON 数据符合 JSON schema。

](https://developers.openai.com/api/docs/guides/structured-outputs)

[

<span slot="icon">
      </span>
    查看 API reference 中用于文本生成的全部选项。

](https://developers.openai.com/api/docs/api-reference/responses)
