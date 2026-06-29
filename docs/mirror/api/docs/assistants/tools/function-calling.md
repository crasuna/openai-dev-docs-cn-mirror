---
title: "Assistants Function Calling 函数调用"
description: "Use function calling to extend assistants with your own tools."
outline: deep
---

# Assistants Function Calling 函数调用

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/assistants/tools/function-calling](https://developers.openai.com/api/docs/assistants/tools/function-calling)
- Markdown 来源：[https://developers.openai.com/api/docs/assistants/tools/function-calling.md](https://developers.openai.com/api/docs/assistants/tools/function-calling.md)
- 抓取时间：2026-06-27T05:53:56.808Z
- Checksum：`60868301a5a160d2b3abce017272df4926452cdd612dd609ef2bf41d41e6d95b`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

与 Chat Completions API 类似，Assistants API 支持 function calling。Function calling 允许你向 Assistants API 描述函数，并让它智能地返回需要调用的函数及其参数。

## 快速开始

在这个示例中，我们将创建一个天气 assistant，并定义两个函数
`get_current_temperature` 和 `get_rain_probability`，作为 Assistant 可以调用的工具。
根据用户查询，如果使用我们在 2023 年 11 月 6 日或之后发布的
最新模型，模型会调用 parallel function calling。
在使用 parallel function calling 的示例中，我们会询问 Assistant 旧金山今天的天气
以及下雨概率。我们还展示了如何使用流式传输输出 Assistant 的响应。

随着 Structured Outputs 的发布，你现在可以在 Assistants API 中使用 function calling 时使用参数 `strict:
  true`。有关更多信息，请参阅 [Function calling 指南](/mirror/api/docs/guides/function-calling#function-calling-with-structured-outputs)。
  请注意，Assistants API 在使用视觉能力时不支持 Structured Outputs。

### 第 1 步：定义函数

创建 assistant 时，你首先要在 assistant 的 `tools` 参数下定义函数。

```python
from openai import OpenAI
client = OpenAI()

assistant = client.beta.assistants.create(
instructions="You are a weather bot. Use the provided functions to answer questions.",
model="gpt-4o",
tools=[
{
"type": "function",
"function": {
"name": "get_current_temperature",
"description": "Get the current temperature for a specific location",
"parameters": {
"type": "object",
"properties": {
"location": {
"type": "string",
"description": "The city and state, e.g., San Francisco, CA"
},
"unit": {
"type": "string",
"enum": ["Celsius", "Fahrenheit"],
"description": "The temperature unit to use. Infer this from the user's location."
}
},
"required": ["location", "unit"]
}
}
},
{
"type": "function",
"function": {
"name": "get_rain_probability",
"description": "Get the probability of rain for a specific location",
"parameters": {
"type": "object",
"properties": {
"location": {
"type": "string",
"description": "The city and state, e.g., San Francisco, CA"
}
},
"required": ["location"]
}
}
}
]
)
```

```javascript
const assistant = await client.beta.assistants.create({
model: "gpt-4o",
instructions:
"You are a weather bot. Use the provided functions to answer questions.",
tools: [
{
type: "function",
function: {
name: "getCurrentTemperature",
description: "Get the current temperature for a specific location",
parameters: {
type: "object",
properties: {
location: {
type: "string",
description: "The city and state, e.g., San Francisco, CA",
},
unit: {
type: "string",
enum: ["Celsius", "Fahrenheit"],
description:
"The temperature unit to use. Infer this from the user's location.",
},
},
required: ["location", "unit"],
},
},
},
{
type: "function",
function: {
name: "getRainProbability",
description: "Get the probability of rain for a specific location",
parameters: {
type: "object",
properties: {
location: {
type: "string",
description: "The city and state, e.g., San Francisco, CA",
},
},
required: ["location"],
},
},
},
],
});
```


### 第 2 步：创建 Thread 并添加 Messages

当用户开始对话时创建一个 Thread，并在用户提问时向该 Thread 添加 Messages。

```python
thread = client.beta.threads.create()
message = client.beta.threads.messages.create(
  thread_id=thread.id,
  role="user",
  content="What's the weather in San Francisco today and the likelihood it'll rain?",
)
```

```javascript
const thread = await client.beta.threads.create();
const message = client.beta.threads.messages.create(thread.id, {
  role: "user",
  content: "What's the weather in San Francisco today and the likelihood it'll rain?",
});
```


### 第 3 步：发起 Run

当你在包含会触发一个或多个函数的用户 Message 的 Thread 上发起 Run 时，
该 Run 会进入 `pending` 状态。处理后，run 会进入 `requires_action` 状态；你可以
通过检查 Run 的 `status` 来验证这一点。这表示你需要运行工具并将其输出提交给
Assistant，才能继续执行 Run。在我们的例子中，会看到两个 `tool_calls`，这表明
用户查询触发了 parallel function calling。

请注意，runs 会在创建后十分钟过期。请务必在 10 分钟内提交
  tool outputs。

你会在 `required_action` 中看到两个 `tool_calls`，这表明用户查询触发了 parallel function calling。

```json
{
  "id": "run_qJL1kI9xxWlfE0z1yfL0fGg9",
  ...
  "status": "requires_action",
  "required_action": {
    "submit_tool_outputs": {
      "tool_calls": [
        {
          "id": "call_FthC9qRpsL5kBpwwyw6c7j4k",
          "function": {
            "arguments": "{"location": "San Francisco, CA"}",
            "name": "get_rain_probability"
          },
          "type": "function"
        },
        {
          "id": "call_RpEDoB8O0FTL9JoKTuCVFOyR",
          "function": {
            "arguments": "{"location": "San Francisco, CA", "unit": "Fahrenheit"}",
            "name": "get_current_temperature"
          },
          "type": "function"
        }
      ]
    },
    ...
    "type": "submit_tool_outputs"
  }
}
```

这里为便于阅读截断了 Run 对象


你发起 Run 和提交 `tool_calls` 的方式会因是否使用流式传输而不同，
不过在这两种情况下，都需要同时提交所有 `tool_calls`。
然后，你可以通过提交已调用函数的工具输出完成 Run。
传入 `required_action` 对象中引用的每个 `tool_call_id`，以便将输出与每个函数调用匹配。




使用流式传输


不使用流式传输




### 使用 Structured Outputs

当你通过提供 `strict: true` 启用 [Structured Outputs](/mirror/api/docs/guides/structured-outputs) 时，OpenAI API 会在你的第一次请求中预处理你提供的 schema，然后使用该 artifact 约束模型遵循你的 schema。

```python
from openai import OpenAI
client = OpenAI()

assistant = client.beta.assistants.create(
instructions="You are a weather bot. Use the provided functions to answer questions.",
model="gpt-4o-2024-08-06",
tools=[
{
"type": "function",
"function": {
"name": "get_current_temperature",
"description": "Get the current temperature for a specific location",
"parameters": {
"type": "object",
"properties": {
"location": {
"type": "string",
"description": "The city and state, e.g., San Francisco, CA"
},
"unit": {
"type": "string",
"enum": ["Celsius", "Fahrenheit"],
"description": "The temperature unit to use. Infer this from the user's location."
}
},
"required": ["location", "unit"],
// highlight-start
"additionalProperties": False
// highlight-end
},
// highlight-start
"strict": True
// highlight-end
}
},
{
"type": "function",
"function": {
"name": "get_rain_probability",
"description": "Get the probability of rain for a specific location",
"parameters": {
"type": "object",
"properties": {
"location": {
"type": "string",
"description": "The city and state, e.g., San Francisco, CA"
}
},
"required": ["location"],
// highlight-start
"additionalProperties": False
// highlight-end
},
// highlight-start
"strict": True
// highlight-end
}
}
]
)
```

```javascript
const assistant = await client.beta.assistants.create({
model: "gpt-4o-2024-08-06",
instructions:
"You are a weather bot. Use the provided functions to answer questions.",
tools: [
{
type: "function",
function: {
name: "getCurrentTemperature",
description: "Get the current temperature for a specific location",
parameters: {
type: "object",
properties: {
location: {
type: "string",
description: "The city and state, e.g., San Francisco, CA",
},
unit: {
type: "string",
enum: ["Celsius", "Fahrenheit"],
description:
"The temperature unit to use. Infer this from the user's location.",
},
},
required: ["location", "unit"],
// highlight-start
additionalProperties: false
// highlight-end
},
// highlight-start
strict: true
// highlight-end
},
},
{
type: "function",
function: {
name: "getRainProbability",
description: "Get the probability of rain for a specific location",
parameters: {
type: "object",
properties: {
location: {
type: "string",
description: "The city and state, e.g., San Francisco, CA",
},
},
required: ["location"],
// highlight-start
additionalProperties: false
// highlight-end
},
// highlight-start
strict: true
// highlight-end
},
},
],
});
```

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
## Overview

Similar to the Chat Completions API, the Assistants API supports function calling. Function calling allows you to describe functions to the Assistants API and have it intelligently return the functions that need to be called along with their arguments.

## Quickstart

In this example, we'll create a weather assistant and define two functions,
`get_current_temperature` and `get_rain_probability`, as tools that the Assistant can call.
Depending on the user query, the model will invoke parallel function calling if using our
latest models released on or after Nov 6, 2023.
In our example that uses parallel function calling, we will ask the Assistant what the weather in
San Francisco is like today and the chances of rain. We also show how to output the Assistant's response with streaming.

With the launch of Structured Outputs, you can now use the parameter `strict:
  true` when using function calling with the Assistants API. For more
  information, refer to the [Function calling
  guide](https://developers.openai.com/api/docs/guides/function-calling#function-calling-with-structured-outputs).
  Please note that Structured Outputs are not supported in the Assistants API
  when using vision.

### Step 1: Define functions

When creating your assistant, you will first define the functions under the `tools` param of the assistant.

```python
from openai import OpenAI
client = OpenAI()

assistant = client.beta.assistants.create(
instructions="You are a weather bot. Use the provided functions to answer questions.",
model="gpt-4o",
tools=[
{
"type": "function",
"function": {
"name": "get_current_temperature",
"description": "Get the current temperature for a specific location",
"parameters": {
"type": "object",
"properties": {
"location": {
"type": "string",
"description": "The city and state, e.g., San Francisco, CA"
},
"unit": {
"type": "string",
"enum": ["Celsius", "Fahrenheit"],
"description": "The temperature unit to use. Infer this from the user's location."
}
},
"required": ["location", "unit"]
}
}
},
{
"type": "function",
"function": {
"name": "get_rain_probability",
"description": "Get the probability of rain for a specific location",
"parameters": {
"type": "object",
"properties": {
"location": {
"type": "string",
"description": "The city and state, e.g., San Francisco, CA"
}
},
"required": ["location"]
}
}
}
]
)
```

```javascript
const assistant = await client.beta.assistants.create({
model: "gpt-4o",
instructions:
"You are a weather bot. Use the provided functions to answer questions.",
tools: [
{
type: "function",
function: {
name: "getCurrentTemperature",
description: "Get the current temperature for a specific location",
parameters: {
type: "object",
properties: {
location: {
type: "string",
description: "The city and state, e.g., San Francisco, CA",
},
unit: {
type: "string",
enum: ["Celsius", "Fahrenheit"],
description:
"The temperature unit to use. Infer this from the user's location.",
},
},
required: ["location", "unit"],
},
},
},
{
type: "function",
function: {
name: "getRainProbability",
description: "Get the probability of rain for a specific location",
parameters: {
type: "object",
properties: {
location: {
type: "string",
description: "The city and state, e.g., San Francisco, CA",
},
},
required: ["location"],
},
},
},
],
});
```


### Step 2: Create a Thread and add Messages

Create a Thread when a user starts a conversation and add Messages to the Thread as the user asks questions.

```python
thread = client.beta.threads.create()
message = client.beta.threads.messages.create(
  thread_id=thread.id,
  role="user",
  content="What's the weather in San Francisco today and the likelihood it'll rain?",
)
```

```javascript
const thread = await client.beta.threads.create();
const message = client.beta.threads.messages.create(thread.id, {
  role: "user",
  content: "What's the weather in San Francisco today and the likelihood it'll rain?",
});
```


### Step 3: Initiate a Run

When you initiate a Run on a Thread containing a user Message that triggers one or more functions,
the Run will enter a `pending` status. After it processes, the run will enter a `requires_action` state which you can
verify by checking the Run’s `status`. This indicates that you need to run tools and submit their outputs to the
Assistant to continue Run execution. In our case, we will see two `tool_calls`, which indicates that the
user query resulted in parallel function calling.

Note that a runs expire ten minutes after creation. Be sure to submit your
  tool outputs before the 10 min mark.

You will see two `tool_calls` within `required_action`, which indicates the user query triggered parallel function calling.

```json
{
  "id": "run_qJL1kI9xxWlfE0z1yfL0fGg9",
  ...
  "status": "requires_action",
  "required_action": {
    "submit_tool_outputs": {
      "tool_calls": [
        {
          "id": "call_FthC9qRpsL5kBpwwyw6c7j4k",
          "function": {
            "arguments": "{"location": "San Francisco, CA"}",
            "name": "get_rain_probability"
          },
          "type": "function"
        },
        {
          "id": "call_RpEDoB8O0FTL9JoKTuCVFOyR",
          "function": {
            "arguments": "{"location": "San Francisco, CA", "unit": "Fahrenheit"}",
            "name": "get_current_temperature"
          },
          "type": "function"
        }
      ]
    },
    ...
    "type": "submit_tool_outputs"
  }
}
```

<figcaption>Run object truncated here for readability</figcaption>
<br />

How you initiate a Run and submit `tool_calls` will differ depending on whether you are using streaming or not,
although in both cases all `tool_calls` need to be submitted at the same time.
You can then complete the Run by submitting the tool outputs from the functions you called.
Pass each `tool_call_id` referenced in the `required_action` object to match outputs to each function call.



<div data-content-switcher-pane data-value="streaming">
    <div class="hidden">With streaming</div>
    </div>
  <div data-content-switcher-pane data-value="without-streaming" hidden>
    <div class="hidden">Without streaming</div>
    </div>



### Using Structured Outputs

When you enable [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) by supplying `strict: true`, the OpenAI API will pre-process your supplied schema on your first request, and then use this artifact to constrain the model to your schema.

```python
from openai import OpenAI
client = OpenAI()

assistant = client.beta.assistants.create(
instructions="You are a weather bot. Use the provided functions to answer questions.",
model="gpt-4o-2024-08-06",
tools=[
{
"type": "function",
"function": {
"name": "get_current_temperature",
"description": "Get the current temperature for a specific location",
"parameters": {
"type": "object",
"properties": {
"location": {
"type": "string",
"description": "The city and state, e.g., San Francisco, CA"
},
"unit": {
"type": "string",
"enum": ["Celsius", "Fahrenheit"],
"description": "The temperature unit to use. Infer this from the user's location."
}
},
"required": ["location", "unit"],
// highlight-start
"additionalProperties": False
// highlight-end
},
// highlight-start
"strict": True
// highlight-end
}
},
{
"type": "function",
"function": {
"name": "get_rain_probability",
"description": "Get the probability of rain for a specific location",
"parameters": {
"type": "object",
"properties": {
"location": {
"type": "string",
"description": "The city and state, e.g., San Francisco, CA"
}
},
"required": ["location"],
// highlight-start
"additionalProperties": False
// highlight-end
},
// highlight-start
"strict": True
// highlight-end
}
}
]
)
```

```javascript
const assistant = await client.beta.assistants.create({
model: "gpt-4o-2024-08-06",
instructions:
"You are a weather bot. Use the provided functions to answer questions.",
tools: [
{
type: "function",
function: {
name: "getCurrentTemperature",
description: "Get the current temperature for a specific location",
parameters: {
type: "object",
properties: {
location: {
type: "string",
description: "The city and state, e.g., San Francisco, CA",
},
unit: {
type: "string",
enum: ["Celsius", "Fahrenheit"],
description:
"The temperature unit to use. Infer this from the user's location.",
},
},
required: ["location", "unit"],
// highlight-start
additionalProperties: false
// highlight-end
},
// highlight-start
strict: true
// highlight-end
},
},
{
type: "function",
function: {
name: "getRainProbability",
description: "Get the probability of rain for a specific location",
parameters: {
type: "object",
properties: {
location: {
type: "string",
description: "The city and state, e.g., San Francisco, CA",
},
},
required: ["location"],
// highlight-start
additionalProperties: false
// highlight-end
},
// highlight-start
strict: true
// highlight-end
},
},
],
});
```
``````
:::
:::

