---
status: needs-review
sourceId: "6329efd80a0a"
sourceChecksum: "6329efd80a0a80ff0abe00e7d7cc6e1dd35db75e2800706d80f564286d7e1edc"
sourceUrl: "https://developers.openai.com/api/docs/guides/migrate-to-responses"
translatedAt: "2026-06-27T18:00:55+08:00"
translator: codex-gpt-5.5-xhigh
---

# 迁移到 Responses API

[Responses API](https://developers.openai.com/api/docs/api-reference/responses) 是我们新的 API 原语，它是 [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat) 的演进版本，为你的集成带来更高的简洁性和强大的 agentic 原语。

**虽然 Chat Completions 仍受支持，但所有新项目都推荐使用 Responses。**

## 关于 Responses API

Responses API 是一个统一接口，可用于构建强大的类 agent 应用。它包含：

- 内置工具，例如 [web search](https://developers.openai.com/api/docs/guides/tools-web-search)、[file search](https://developers.openai.com/api/docs/guides/tools-file-search)、[computer use](https://developers.openai.com/api/docs/guides/tools-computer-use)、[code interpreter](https://developers.openai.com/api/docs/guides/tools-code-interpreter) 和 [remote MCPs](https://developers.openai.com/api/docs/guides/tools-remote-mcp)。
- 无缝的多轮交互，允许你传入之前的 responses，以获得准确性更高的推理结果。
- 对文本和图像的原生多模态支持。

## Responses 的优势

相比 Chat Completions，Responses API 有多项优势：

- **更好的性能**：与 Chat Completions 相比，通过 Responses 使用 GPT-5 等 reasoning models 会带来更高的模型智能。我们的内部 evals 显示，在相同 prompt 和设置下，SWE-bench 提升了 3%。
- **默认 agentic**：Responses API 是一个 agentic loop，允许模型在一次 API 请求范围内调用多个工具，例如 `web_search`、`image_generation`、`file_search`、`code_interpreter`、remote MCP servers，以及你自己的自定义函数。
- **更低成本**：由于缓存利用率提升，可带来更低成本（内部测试中相较 Chat Completions 提升 40% 到 80%）。
- **有状态上下文**：使用 `store: true` 在轮次之间保持状态，跨轮次保留 reasoning 和 tool context。
- **灵活输入**：传入字符串作为 input，或传入 messages 列表；使用 instructions 提供系统级指导。
- **加密 reasoning**：选择不使用有状态能力，同时仍然受益于高级 reasoning。
- **面向未来**：已为即将推出的模型做好准备。

<div className="roles-table">

| 能力                | Chat Completions API | Responses API |
| ------------------- | -------------------- | ------------- |
| 文本生成            | | |
| 音频                | | 即将推出      |
| 视觉                | | |
| Structured Outputs  | | |
| Function calling    | | |
| Web search          | | |
| File search         | | |
| Computer use        | | |
| Code interpreter    | | |
| MCP                 | | |
| Image generation    | | |
| Reasoning summaries | | |

</div>

### 示例

了解 Responses API 在特定场景中与 Chat Completions API 的差异。

#### Messages 与 Items

这两个 API 都让从我们的模型生成输出变得简单。Chat completions 调用的输入和结果都是 _Messages_ 数组，而 Responses API 使用 _Items_。Item 是多种类型的联合，表示模型动作的各种可能性。`message` 是一种 Item 类型，`function_call` 或 `function_call_output` 也是。不同于 Chat Completions Message 将许多关注点粘合在一个对象中，Items 彼此独立，更能表示模型上下文的基本单位。

此外，Chat Completions 可以使用 `n` 参数以 `choices` 的形式返回多个并行生成结果。在 Responses 中，我们移除了这个参数，只保留一个生成结果。

当你从 Responses API 获得 response 时，字段会略有不同。你收到的不是 `message`，而是带有自身 `id` 的类型化 `response` 对象。Responses 默认会被存储。Chat completions 对新账号默认会被存储。要在使用任一 API 时禁用存储，请设置 `store: false`。

你从这些 API 收到的对象会略有不同。在 Chat Completions 中，你会收到一个 `choices` 数组，其中每个元素都包含一个 `message`。在 Responses 中，你会收到一个标记为 `output` 的 Items 数组。

### 其他差异

- Responses 默认会被存储。Chat completions 对新账号默认会被存储。要在任一 API 中禁用存储，请设置 `store: false`。
- [Reasoning](https://developers.openai.com/api/docs/guides/reasoning) models 在 Responses API 中拥有更丰富的体验，并支持[改进后的工具使用](https://developers.openai.com/api/docs/guides/reasoning#keeping-reasoning-items-in-context)。从 GPT-5.4 开始，在 Chat Completions 中使用 `reasoning: none` 时不支持 tool calling。
- Structured Outputs 的 API 形状不同。在 Responses 中，请使用 `text.format`，而不是 `response_format`。在 [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) 指南中了解更多。
- function-calling API 的形状不同，包括请求中的 function config，以及 response 中返回的 function calls。请在 [function calling guide](https://developers.openai.com/api/docs/guides/function-calling) 中查看完整差异。
- Responses SDK 有 `output_text` 辅助属性，Chat Completions SDK 没有。
- 在 Chat Completions 中，对话状态必须手动管理。Responses API 兼容用于持久对话的 [Conversations API](https://developers.openai.com/api/docs/guides/conversation-state?api-mode=responses#using-the-conversations-api)，也可以传入 `previous_response_id` 来轻松串联 Responses。

## 从 Chat Completions 迁移

可以把迁移看作三个相关变更：将请求发送到 `/v1/responses`，从类型化的 `output` 数组读取输出，并选择你的应用如何在轮次之间携带状态。

### 1. 更新生成端点

首先，将你的生成端点从 `post /v1/chat/completions` 更新为 `post /v1/responses`。

如果你没有使用 functions 或多模态输入，简单的 message 输入可以在两个 API 之间兼容：

复用简单的 message 输入

```bash
INPUT='[
  { "role": "system", "content": "You are a helpful assistant." },
  { "role": "user", "content": "Hello!" }
]'

curl -s https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{
    \"model\": \"gpt-5.5\",
    \"messages\": $INPUT
  }"

curl -s https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{
    \"model\": \"gpt-5.5\",
    \"input\": $INPUT
  }"
```

```javascript
const context = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello!' }
];

const completion = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages: context
});

const response = await client.responses.create({
  model: "gpt-5.5",
  input: context
});
```

```python
context = [
  { "role": "system", "content": "You are a helpful assistant." },
  { "role": "user", "content": "Hello!" }
]

completion = client.chat.completions.create(
  model="gpt-5.5",
  messages=context
)

response = client.responses.create(
  model="gpt-5.5",
  input=context
)
```




<div data-content-switcher-pane data-value="chat-completions">
    <div class="hidden">Chat Completions</div>
    使用 Chat Completions 时，你会创建一个 `messages` 数组，并从
    `completion.choices[0].message.content` 读取模型文本。
    从模型生成文本

```javascript
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages: [
    { 'role': 'system', 'content': 'You are a helpful assistant.' },
    { 'role': 'user', 'content': 'Hello!' }
  ]
});
console.log(completion.choices[0].message.content);
```

```python
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-5.5",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ]
)
print(completion.choices[0].message.content)
```

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
      "model": "gpt-5.5",
      "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
      ]
  }'
```


  </div>
  <div data-content-switcher-pane data-value="responses" hidden>
    <div class="hidden">Responses</div>
    使用 Responses 时，你可以在顶层分离 `instructions` 和 `input`，
    并从 `response.output_text` 读取生成的文本。
    从模型生成文本

```javascript
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.responses.create({
  model: 'gpt-5.5',
  instructions: 'You are a helpful assistant.',
  input: 'Hello!'
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    instructions="You are a helpful assistant.",
    input="Hello!"
)
print(response.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
      "model": "gpt-5.5",
      "instructions": "You are a helpful assistant.",
      "input": "Hello!"
  }'
```


  </div>



### 2. 将 Messages 映射为 Items

Chat Completions 使用 `messages` 同时作为输入和输出。Responses 使用由类型化 Items 组成的 `input` 和 `output` 数组。`message` 是一种 Item 类型，其他 Item 还包括 `reasoning`、`function_call` 和 `function_call_output`。

| Chat Completions 概念       | Responses 映射                                                                 |
| --------------------------- | ------------------------------------------------------------------------------ |
| `messages[]`                | `input`，可以是字符串，也可以是 input Items 数组                               |
| System 或 developer guidance | 顶层 `instructions`，或在需要保留现有 transcript 时使用兼容的 message Items    |
| User message                | 带有 `role: "user"` 的 input message Item                                      |
| Assistant message           | `response.output` 中的 output message Item；如果你手动管理状态，请在 `input` 中传回 |
| Tool 或 function call       | 一个 `function_call` output Item                                               |
| Tool 或 function result     | 一个通过 `call_id` 与调用关联的 `function_call_output` input Item              |
| 使用 `n` 生成多个结果       | Responses 中不可用；如需多个候选输出，请发起单独请求                          |

当你只需要最终文本时，请使用 SDK 的 `output_text` 辅助属性。当你的流程使用 reasoning、tools 或多模态输出时，请遍历 `response.output`，并按每个 Item 的 `type` 进行处理。

### 3. 更新多轮对话

如果你的应用中有多轮对话，请更新你的上下文逻辑。Responses 提供三种常见状态管理选项：

- 当你希望 OpenAI 管理之前的 response context 时，使用 `previous_response_id`。每次请求都重新发送稳定的 `instructions`，因为 `previous_response_id` 不会继承前一个 response 的顶层 `instructions`。
- 当你需要自己管理或裁剪上下文时，将之前的 `output` Items 传回下一次请求。
- 当你需要一个持久对话对象时，使用 [Conversations API](https://developers.openai.com/api/docs/guides/conversation-state?api-mode=responses#using-the-conversations-api)。



<div data-content-switcher-pane data-value="chat-completions">
    <div class="hidden">Chat Completions</div>
    在 Chat Completions 中，你会存储 transcript，并在每次请求时发送累积后的
    `messages` 数组。
    多轮对话

```javascript
let messages = [
    { 'role': 'system', 'content': 'You are a helpful assistant.' },
    { 'role': 'user', 'content': 'What is the capital of France?' }
  ];
const res1 = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages
});

messages = messages.concat([res1.choices[0].message]);
messages.push({ 'role': 'user', 'content': 'And its population?' });

const res2 = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages
});
```

```python
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is the capital of France?"}
]
res1 = client.chat.completions.create(model="gpt-5.5", messages=messages)

messages += [res1.choices[0].message]
messages += [{"role": "user", "content": "And its population?"}]

res2 = client.chat.completions.create(model="gpt-5.5", messages=messages)
```


  </div>
  <div data-content-switcher-pane data-value="responses" hidden>
    <div class="hidden">Responses</div>
    使用 Responses 时，你可以手动将一个 response 的 outputs 传入另一个 response 的
    input。
    多轮对话

```python
context = [
    { "role": "user", "content": "What is the capital of France?" }
]
res1 = client.responses.create(
    model="gpt-5.5",
    input=context,
)

# Append the first response's output to context
context += res1.output

# Add the next user message
context += [
    { "role": "user", "content": "And its population?" }
]

res2 = client.responses.create(
    model="gpt-5.5",
    input=context,
)
```

```javascript
let context = [
  { role: "user", content: "What is the capital of France?" }
];

const res1 = await client.responses.create({
  model: "gpt-5.5",
  input: context,
});

// Append the first response’s output to context
context = context.concat(res1.output);

// Add the next user message
context.push({ role: "user", content: "And its population?" });

const res2 = await client.responses.create({
  model: "gpt-5.5",
  input: context,
});
```

    你也可以使用 `previous_response_id` 来引用上一个 response，
    并创建 response chains 或 forks。
    多轮对话

```javascript
const res1 = await client.responses.create({
  model: 'gpt-5.5',
  input: 'What is the capital of France?',
  store: true
});

const res2 = await client.responses.create({
  model: 'gpt-5.5',
  input: 'And its population?',
  previous_response_id: res1.id,
  store: true
});
```

```python
res1 = client.responses.create(
    model="gpt-5.5",
    input="What is the capital of France?",
    store=True
)

res2 = client.responses.create(
    model="gpt-5.5",
    input="And its population?",
    previous_response_id=res1.id,
    store=True
)
```


  </div>



即使使用 `previous_response_id`，response 链中所有之前的 input tokens 也都会作为 API 中的 input tokens 计费。

### 4. 决定何时使用有状态能力

Responses 默认会被存储。Chat Completions 对新账号默认会被存储。要在任一 API 中禁用存储，请设置 `store: false`。

某些组织（例如有 Zero Data Retention（ZDR）要求的组织）由于合规或数据保留政策，不能以有状态方式使用 Responses API。为支持这些情况，OpenAI 提供加密 reasoning items，让你可以保持工作流无状态，同时仍然受益于 reasoning items。

要禁用有状态能力，但仍利用 reasoning：

- 在 [store field](https://developers.openai.com/api/docs/api-reference/responses/create#responses_create-store) 中设置 `store: false`。
- 将 `["reasoning.encrypted_content"]` 添加到 [include field](https://developers.openai.com/api/docs/api-reference/responses/create#responses_create-include)。

随后，API 会返回 reasoning tokens 的加密版本，你可以像常规 reasoning items 一样，在未来请求中将其传回。
对于 ZDR 组织，OpenAI 会自动强制执行 `store: false`。当请求包含 `encrypted_content` 时，它会在内存中解密，用于生成下一个 response，然后被安全丢弃。任何新的 reasoning tokens 都会立即加密并返回给你，确保不会持久化任何中间状态。

### 5. 更新 function definitions 和 outputs

Chat Completions 与 Responses 在 functions 定义方式上有两个较小但值得注意的差异。

1. 在 Chat Completions 中，function definitions 是外部标记的。在 Responses 中，它们是内部标记的。
2. 在 Chat Completions 中，functions 默认是非 strict 的。在 Responses 中，省略 `strict` 会尝试 strict mode；如果 schema 无法变得兼容，Responses 会回退到非 strict 的 best-effort function calling，并返回带有 `strict: false` 的已解析 tool。要在 Responses 中显式保持非 strict 行为，请设置 `strict: false`。

右侧的 Responses API function 示例在功能上等同于左侧的 Chat Completions 示例。

#### 遵循 function-calling 最佳实践

在 Responses 中，tool calls 及其 outputs 是两种不同类型的 Items，并使用 `call_id` 进行关联。有关 Responses 中 function calling 工作方式的更多细节，请参阅 [function calling docs](https://developers.openai.com/api/docs/guides/function-calling#function-tool-example)。

### 6. 更新 Structured Outputs 定义

在 Responses API 中，Structured Outputs 定义已从 `response_format` 移到 `text.format`：



<div data-content-switcher-pane data-value="chat-completions">
    <div class="hidden">Chat Completions</div>
    Structured Outputs

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
  "model": "gpt-5.5",
  "messages": [
    {
      "role": "user",
      "content": "Jane, 54 years old"
    }
  ],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "person",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "age": {
            "type": "number",
            "minimum": 0,
            "maximum": 130
          }
        },
        "required": [
          "name",
          "age"
        ],
        "additionalProperties": false
      }
    }
  },
  "reasoning_effort": "medium"
}'
```

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
  model="gpt-5.5",
  messages=[
    {
      "role": "user",
      "content": "Jane, 54 years old",
    }
  ],
  response_format={
    "type": "json_schema",
    "json_schema": {
      "name": "person",
      "strict": True,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "age": {
            "type": "number",
            "minimum": 0,
            "maximum": 130
          }
        },
        "required": [
          "name",
          "age"
        ],
        "additionalProperties": False
      }
    }
  },
  reasoning_effort="medium"
)
```

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-5.5",
  messages: [
    {
      "role": "user",
      "content": "Jane, 54 years old",
    }
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "person",
      strict: true,
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1
          },
          age: {
            type: "number",
            minimum: 0,
            maximum: 130
          }
        },
        required: [
          "name",
          "age"
        ],
        additionalProperties: false
      }
    }
  },
  reasoning_effort: "medium"
});
```

  </div>
  <div data-content-switcher-pane data-value="responses" hidden>
    <div class="hidden">Responses</div>
    Structured Outputs

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
  "model": "gpt-5.5",
  "input": "Jane, 54 years old",
  "text": {
    "format": {
      "type": "json_schema",
      "name": "person",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "age": {
            "type": "number",
            "minimum": 0,
            "maximum": 130
          }
        },
        "required": [
          "name",
          "age"
        ],
        "additionalProperties": false
      }
    }
  }
}'
```

```python
response = client.responses.create(
  model="gpt-5.5",
  input="Jane, 54 years old", 
  text={
    "format": {
      "type": "json_schema",
      "name": "person",
      "strict": True,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "age": {
            "type": "number",
            "minimum": 0,
            "maximum": 130
          }
        },
        "required": [
          "name",
          "age"
        ],
        "additionalProperties": False
      }
    }
  }
)
```

```javascript
const response = await openai.responses.create({
  model: "gpt-5.5",
  input: "Jane, 54 years old",
  text: {
    format: {
      type: "json_schema",
      name: "person",
      strict: true,
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1
          },
          age: {
            type: "number",
            minimum: 0,
            maximum: 130
          }
        },
        required: [
          "name",
          "age"
        ],
        additionalProperties: false
      }
    },
  }
});
```

  </div>



### 7. 更新 streaming consumers

Chat Completions streaming 返回带有 `delta` 字段的增量 chunks。Responses streaming 使用类型化的 server-sent events。请更新 stream consumers，让它们根据每个 event 的 `type` 分支处理，并处理你的 UI 或编排层需要的 events。

对于 text streaming，请监听以下 events：

- `response.created`
- `response.output_text.delta`
- `response.completed`
- `error`

Function-calling streams 也可以发出 `response.function_call_arguments.delta` 和 `response.function_call_arguments.done` 等 events。请参阅 [streaming Responses guide](https://developers.openai.com/api/docs/guides/streaming-responses?api-mode=responses) 和 [Responses streaming events reference](https://developers.openai.com/api/docs/api-reference/responses-streaming)。

### 8. 升级到原生工具

如果你的应用有可受益于 OpenAI 原生 [tools](https://developers.openai.com/api/docs/guides/tools) 的用例，你可以更新你的 tool calls，直接使用 OpenAI 的工具。



<div data-content-switcher-pane data-value="chat-completions">
    <div class="hidden">Chat Completions</div>
    使用 Chat Completions 时，你无法原生使用 OpenAI 托管的工具，
    必须编写自己的工具集成。
    Web search tool

```javascript
async function web_search(query) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(`https://api.example.com/search?q=${query}`);
  const data = await res.json();
  return data.results;
}

const completion = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Who is the current president of France?' }
  ],
  functions: [
    {
      name: 'web_search',
      description: 'Search the web for information',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query']
      }
    }
  ]
});
```

```python
import requests

def web_search(query):
    r = requests.get(f"https://api.example.com/search?q={query}")
    return r.json().get("results", [])

completion = client.chat.completions.create(
    model="gpt-5.5",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Who is the current president of France?"}
    ],
    functions=[
        {
            "name": "web_search",
            "description": "Search the web for information",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"]
            }
        }
    ]
)
```

```bash
curl https://api.example.com/search \
  -G \
  --data-urlencode "q=your+search+term" \
  --data-urlencode "key=$SEARCH_API_KEY"\
```

  </div>
  <div data-content-switcher-pane data-value="responses" hidden>
    <div class="hidden">Responses</div>
    使用 Responses 时，你可以指定希望模型使用的工具。
    Web search tool

```javascript
const answer = await client.responses.create({
  model: 'gpt-5.5',
  input: 'Who is the current president of France?',
  tools: [{ type: 'web_search' }]
});

console.log(answer.output_text);
```

```python
answer = client.responses.create(
    model="gpt-5.5",
    input="Who is the current president of France?",
    tools=[{"type": "web_search"}]
)

print(answer.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": "Who is the current president of France?",
    "tools": [{"type": "web_search"}]
  }'
```


  </div>



### 9. 检查常见迁移错误

将代码从 Chat Completions 迁移到 Responses 时，请注意以下问题：

- 读取 `choices[0].message.content`，而不是 `response.output_text` 或 `response.output`。
- 将每个 `output` 条目都当作 message。Reasoning、tool 和 function calls 是独立的 Item 类型。
- 手动将上下文携带到下一个 response 时，丢弃 reasoning、function call 或 function call output Items。
- 发送 function result 时没有匹配的 `call_id`。
- 在 Responses 请求中使用 `response_format`，而不是 `text.format`。
- 复用 Chat Completions streaming chunk handlers，却没有处理类型化的 Responses events。
- 假设 `previous_response_id` 会免除之前上下文的计费。response 链中的之前 input tokens 仍会作为 input tokens 计费。

## 渐进式发布清单

Chat Completions 仍受支持，因此你可以一次迁移一个用户流程。

- [ ] 从简单的文本生成流程开始。
- [ ] 更新 endpoint、request body 和 output handling。
- [ ] 决定该流程使用 `previous_response_id`、手动 Item replay，还是 Conversations API。
- [ ] 如果该流程是无状态的或属于 ZDR，请添加 `store: false`，并在 reasoning context 必须跨轮次继续时包含 encrypted reasoning items。
- [ ] 迁移 function definitions，并验证 function call outputs 包含正确的 `call_id`。
- [ ] 将 Structured Outputs schemas 从 `response_format` 移到 `text.format`。
- [ ] 更新 streaming consumers，以处理类型化的 Responses events。
- [ ] 在适合工作流的地方，用 OpenAI 托管工具替换自定义编排。
- [ ] 在将更多流量路由到 Responses 之前，比较行为、延迟、token 使用量和错误。

我们建议随着时间推移，将所有流程迁移到 Responses API，以利用最新的 OpenAI 功能和改进。

## Assistants API

根据开发者对 [Assistants API](https://developers.openai.com/api/docs/api-reference/assistants) beta 的反馈，我们已将关键改进融入 Responses API，使其更灵活、更快速且更易用。Responses API 代表了在 OpenAI 上构建 agents 的未来方向。

现在，Responses API 中有了类似 Assistant 和类似 Thread 的对象。请在 [migration guide](https://developers.openai.com/api/docs/guides/assistants/migration) 中了解更多。截至 2025 年 8 月 26 日，我们正在弃用 Assistants API，其 sunset date 为 2026 年 8 月 26 日。
