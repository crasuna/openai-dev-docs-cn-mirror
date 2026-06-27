---
title: "Counting tokens"
description: "Use the Responses API to count input tokens for text, images, files, tools, and more—without estimation or tiktoken."
outline: deep
---

# Counting tokens

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/token-counting](https://developers.openai.com/api/docs/guides/token-counting)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/token-counting.md](https://developers.openai.com/api/docs/guides/token-counting.md)
- 抓取时间：2026-06-27T05:54:09.485Z
- Checksum：`61c8e9abe238a0f19d00ed9a44146b70a75ffe9824ac6b8012e3ef15e4a95a47`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Token 计数让你可以在把请求发送给模型之前，确定该请求会使用多少输入 token。它可用于：

- **优化 prompt**，使其适配上下文限制
- **估算成本**，在发起 API 调用前预估费用
- **根据大小路由请求**（例如，将较小的 prompt 发送给更快的模型）
- **避免图片和文件带来的意外情况**——不再依赖基于字符数的估算

[输入 token 计数端点](https://developers.openai.com/api/reference/python/resources/responses/subresources/input_tokens/methods/count)接受与 [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) 相同的输入格式。传入文本、消息、图片、文件、工具或对话，API 会返回模型将接收到的精确计数。

该计数包含用于表示请求结构的格式化 token，例如消息角色和边界。这些 token 可能不会出现在你本地分词的文本或字段中。

## 为什么使用 token counting API？

像 [tiktoken](https://github.com/openai/tiktoken) 这样的本地 tokenizer 可用于纯文本，但它们存在一些限制：

- **不支持图片和文件**——`characters / 4` 之类的估算并不准确
- **工具和 schema** 会增加 token，而这些 token 很难在本地统计
- **模型特定行为** 可能改变分词方式（例如 reasoning、caching）

Token counting API 会处理所有这些情况。使用你原本会发送给 `responses.create` 的同一 payload，并获得准确计数。然后将结果接入你的消息校验或成本估算流程。

## 统计基础消息中的 token

简单文本输入

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.input_tokens.count(
    model="gpt-5.5",
    input="Tell me a joke."
)
print(response.input_tokens)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5.5",
  input: "Tell me a joke.",
});

console.log(response.input_tokens);
```

```bash
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": "Tell me a joke."
  }'
```

```bash
openai responses:input-tokens count \
  --model gpt-5.5 \
  --input "Tell me a joke." \
  --raw-output \
  --transform input_tokens
```


## 统计对话中的 token

多轮对话

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.input_tokens.count(
    model="gpt-5.5",
    input=[
        {"role": "user", "content": "What is 2 + 2?"},
        {"role": "assistant", "content": "2 + 2 equals 4."},
        {"role": "user", "content": "What about 3 + 3?"},
    ],
)
print(response.input_tokens)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5.5",
  input: [
    { role: "user", content: "What is 2 + 2?" },
    { role: "assistant", content: "2 + 2 equals 4." },
    { role: "user", content: "What about 3 + 3?" },
  ],
});

console.log(response.input_tokens);
```

```bash
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": [
      {"role": "user", "content": "What is 2 + 2?"},
      {"role": "assistant", "content": "2 + 2 equals 4."},
      {"role": "user", "content": "What about 3 + 3?"}
    ]
  }'
```

```bash
openai responses:input-tokens count \
  --raw-output \
  --transform input_tokens <<'YAML'
model: gpt-5.5
input:
  - role: user
    content: What is 2 + 2?
  - role: assistant
    content: 2 + 2 equals 4.
  - role: user
    content: What about 3 + 3?
YAML
```


## 统计带 instructions 的 token

带系统 instructions 的输入

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.input_tokens.count(
    model="gpt-5.5",
    instructions="You are a helpful assistant that explains concepts simply.",
    input="Explain quantum computing in one sentence.",
)
print(response.input_tokens)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5.5",
  instructions:
    "You are a helpful assistant that explains concepts simply.",
  input: "Explain quantum computing in one sentence.",
});

console.log(response.input_tokens);
```

```bash
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "instructions": "You are a helpful assistant that explains concepts simply.",
    "input": "Explain quantum computing in one sentence."
  }'
```

```bash
openai responses:input-tokens count \
  --raw-output \
  --transform input_tokens <<'YAML'
model: gpt-5.5
instructions: You are a helpful assistant that explains concepts simply.
input: Explain quantum computing in one sentence.
YAML
```


## 统计包含图片的 token

图片会根据尺寸和 detail 级别消耗 token。Token counting API 会返回精确计数，无需猜测。

包含一张图片的输入

```python
from openai import OpenAI

client = OpenAI()

# Use file_id from uploaded file, or image_url for a URL
response = client.responses.input_tokens.count(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_image", "image_url": "https://example.com/chart.png"},
                {"type": "input_text", "text": "Summarize this chart."},
            ],
        }
    ],
)
print(response.input_tokens)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_image",
          image_url: "https://example.com/chart.png",
        },
        { type: "input_text", text: "Summarize this chart." },
      ],
    },
  ],
});

console.log(response.input_tokens);
```

```bash
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": [{
      "role": "user",
      "content": [
        {"type": "input_image", "image_url": "https://example.com/chart.png"},
        {"type": "input_text", "text": "Summarize this chart."}
      ]
    }]
  }'
```

```bash
openai responses:input-tokens count \
  --raw-output \
  --transform input_tokens <<'YAML'
model: gpt-5.5
input:
  - role: user
    content:
      - type: input_image
        image_url: https://example.com/chart.png
      - type: input_text
        text: Summarize this chart.
YAML
```


你可以使用 `file_id`（来自 [Files API](https://developers.openai.com/api/docs/api-reference/files)）或 `image_url`（URL 或 base64 data URL）。详情请参阅[图片与视觉](/mirror/api/docs/guides/images-vision)。

## 统计包含 tools 的 token

工具定义（function schema、MCP server 等）会向上下文添加 token。请将它们与你的输入一起统计：

包含 function tools 的输入

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.input_tokens.count(
    model="gpt-5.5",
    tools=[
        {
            "type": "function",
            "name": "get_weather",
            "description": "Get the current weather in a location",
            "parameters": {
                "type": "object",
                "properties": {"location": {"type": "string"}},
                "required": ["location"],
            },
        }
    ],
    input="What is the weather in San Francisco?",
)
print(response.input_tokens)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5.5",
  tools: [
    {
      type: "function",
      name: "get_weather",
      description: "Get the current weather in a location",
      parameters: {
        type: "object",
        properties: { location: { type: "string" } },
        required: ["location"],
      },
    },
  ],
  input: "What is the weather in San Francisco?",
});

console.log(response.input_tokens);
```

```bash
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "tools": [{
      "type": "function",
      "name": "get_weather",
      "description": "Get the current weather in a location",
      "parameters": {
        "type": "object",
        "properties": {"location": {"type": "string"}},
        "required": ["location"]
      }
    }],
    "input": "What is the weather in San Francisco?"
  }'
```

```bash
openai responses:input-tokens count \
  --raw-output \
  --transform input_tokens <<'YAML'
model: gpt-5.5
tools:
  - type: function
    name: get_weather
    description: Get the current weather in a location
    parameters:
      type: object
      properties:
        location:
          type: string
      required:
        - location
input: What is the weather in San Francisco?
YAML
```


## 统计包含文件的 token

支持[文件输入](https://developers.openai.com/api/docs/guides/pdf-files)，目前支持 PDF。像使用 `responses.create` 时一样传入 `file_id`、`file_url` 或 `file_data`。Token 计数会反映模型完整处理后的输入。

## 理解输出 token 计数

报告的输出 token 用量包含模型生成的所有 token，而不仅是响应中可见的文本。Responses API 将这个总数报告为 `output_tokens`，而 Chat Completions API 将其报告为 `completion_tokens`。

包括 GPT-5 模型在内的一些模型会生成用于格式化或分隔响应 channel、tool call 和其他消息结构的 token。这些格式化 token 不会出现在消息内容或 `logprobs` 中，也不一定会在 usage 中单独逐项列出。因此，报告的输出或 completion token 计数可能高于可见 token 数，或高于 `logprobs` 中包含的 token 数，即使报告的 `reasoning_tokens` 值为 `0` 也是如此。

`max_output_tokens` 和 `max_completion_tokens` 参数会限制模型生成的所有 token，包括不可见 token。不可见 token 的数量会因模型和响应形态而异，因此不要假设报告用量与可见输出之间存在固定差值。当你需要特定数量的可见输出时，请为这些限制留出余量。

## API 参考

如需查看完整参数和响应形态，请参阅 [Count input tokens API reference](https://developers.openai.com/api/reference/python/resources/responses/subresources/input_tokens/methods/count)。该端点是：

```
POST /v1/responses/input_tokens
```

响应包含 `input_tokens`（integer）和 `object: "response.input_tokens"`。

:::

## English source

::: details 展开英文原文
::: v-pre
Token counting lets you determine how many input tokens a request will use before you send it to the model. Use it to:

- **Optimize prompts** to fit within context limits
- **Estimate costs** before making API calls
- **Route requests** based on size (e.g., smaller prompts to faster models)
- **Avoid surprises** with images and files—no more character-based estimation

The [input token count endpoint](https://developers.openai.com/api/reference/python/resources/responses/subresources/input_tokens/methods/count) accepts the same input format as the [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create). Pass text, messages, images, files, tools, or conversations—the API returns the exact count the model will receive.

The count includes formatting tokens used to represent request structure, such as message roles and boundaries. These tokens might not appear in the text or fields you tokenize locally.

## Why use the token counting API?

Local tokenizers like [tiktoken](https://github.com/openai/tiktoken) work for plain text, but they have limitations:

- **Images and files** are not supported—estimates like `characters / 4` are inaccurate
- **Tools and schemas** add tokens that are hard to count locally
- **Model-specific behavior** can change tokenization (e.g., reasoning, caching)

The token counting API handles all of these. Use the same payload you would send to `responses.create` and get an accurate count. Then plug the result into your message validation or cost estimation flow.

## Count tokens in basic messages

Simple text input

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.input_tokens.count(
    model="gpt-5.5",
    input="Tell me a joke."
)
print(response.input_tokens)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5.5",
  input: "Tell me a joke.",
});

console.log(response.input_tokens);
```

```bash
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": "Tell me a joke."
  }'
```

```bash
openai responses:input-tokens count \
  --model gpt-5.5 \
  --input "Tell me a joke." \
  --raw-output \
  --transform input_tokens
```


## Count tokens in conversations

Multi-turn conversation

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.input_tokens.count(
    model="gpt-5.5",
    input=[
        {"role": "user", "content": "What is 2 + 2?"},
        {"role": "assistant", "content": "2 + 2 equals 4."},
        {"role": "user", "content": "What about 3 + 3?"},
    ],
)
print(response.input_tokens)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5.5",
  input: [
    { role: "user", content: "What is 2 + 2?" },
    { role: "assistant", content: "2 + 2 equals 4." },
    { role: "user", content: "What about 3 + 3?" },
  ],
});

console.log(response.input_tokens);
```

```bash
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": [
      {"role": "user", "content": "What is 2 + 2?"},
      {"role": "assistant", "content": "2 + 2 equals 4."},
      {"role": "user", "content": "What about 3 + 3?"}
    ]
  }'
```

```bash
openai responses:input-tokens count \
  --raw-output \
  --transform input_tokens <<'YAML'
model: gpt-5.5
input:
  - role: user
    content: What is 2 + 2?
  - role: assistant
    content: 2 + 2 equals 4.
  - role: user
    content: What about 3 + 3?
YAML
```


## Count tokens with instructions

Input with system instructions

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.input_tokens.count(
    model="gpt-5.5",
    instructions="You are a helpful assistant that explains concepts simply.",
    input="Explain quantum computing in one sentence.",
)
print(response.input_tokens)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5.5",
  instructions:
    "You are a helpful assistant that explains concepts simply.",
  input: "Explain quantum computing in one sentence.",
});

console.log(response.input_tokens);
```

```bash
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "instructions": "You are a helpful assistant that explains concepts simply.",
    "input": "Explain quantum computing in one sentence."
  }'
```

```bash
openai responses:input-tokens count \
  --raw-output \
  --transform input_tokens <<'YAML'
model: gpt-5.5
instructions: You are a helpful assistant that explains concepts simply.
input: Explain quantum computing in one sentence.
YAML
```


## Count tokens with images

Images consume tokens based on size and detail level. The token counting API returns the exact count—no guesswork.

Input with an image

```python
from openai import OpenAI

client = OpenAI()

# Use file_id from uploaded file, or image_url for a URL
response = client.responses.input_tokens.count(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_image", "image_url": "https://example.com/chart.png"},
                {"type": "input_text", "text": "Summarize this chart."},
            ],
        }
    ],
)
print(response.input_tokens)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_image",
          image_url: "https://example.com/chart.png",
        },
        { type: "input_text", text: "Summarize this chart." },
      ],
    },
  ],
});

console.log(response.input_tokens);
```

```bash
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": [{
      "role": "user",
      "content": [
        {"type": "input_image", "image_url": "https://example.com/chart.png"},
        {"type": "input_text", "text": "Summarize this chart."}
      ]
    }]
  }'
```

```bash
openai responses:input-tokens count \
  --raw-output \
  --transform input_tokens <<'YAML'
model: gpt-5.5
input:
  - role: user
    content:
      - type: input_image
        image_url: https://example.com/chart.png
      - type: input_text
        text: Summarize this chart.
YAML
```


You can use `file_id` (from the [Files API](https://developers.openai.com/api/docs/api-reference/files)) or `image_url` (a URL or base64 data URL). See [images and vision](/mirror/api/docs/guides/images-vision) for details.

## Count tokens with tools

Tool definitions (function schemas, MCP servers, etc.) add tokens to the context. Count them together with your input:

Input with function tools

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.input_tokens.count(
    model="gpt-5.5",
    tools=[
        {
            "type": "function",
            "name": "get_weather",
            "description": "Get the current weather in a location",
            "parameters": {
                "type": "object",
                "properties": {"location": {"type": "string"}},
                "required": ["location"],
            },
        }
    ],
    input="What is the weather in San Francisco?",
)
print(response.input_tokens)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.input_tokens.count({
  model: "gpt-5.5",
  tools: [
    {
      type: "function",
      name: "get_weather",
      description: "Get the current weather in a location",
      parameters: {
        type: "object",
        properties: { location: { type: "string" } },
        required: ["location"],
      },
    },
  ],
  input: "What is the weather in San Francisco?",
});

console.log(response.input_tokens);
```

```bash
curl https://api.openai.com/v1/responses/input_tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "tools": [{
      "type": "function",
      "name": "get_weather",
      "description": "Get the current weather in a location",
      "parameters": {
        "type": "object",
        "properties": {"location": {"type": "string"}},
        "required": ["location"]
      }
    }],
    "input": "What is the weather in San Francisco?"
  }'
```

```bash
openai responses:input-tokens count \
  --raw-output \
  --transform input_tokens <<'YAML'
model: gpt-5.5
tools:
  - type: function
    name: get_weather
    description: Get the current weather in a location
    parameters:
      type: object
      properties:
        location:
          type: string
      required:
        - location
input: What is the weather in San Francisco?
YAML
```


## Count tokens with files

[File inputs](https://developers.openai.com/api/docs/guides/pdf-files)—currently PDFs—are supported. Pass `file_id`, `file_url`, or `file_data` as you would for `responses.create`. The token count reflects the model’s full processed input.

## Understand output token counts

Reported output token usage includes all tokens generated by the model, not only the text visible in a response. The Responses API reports this total as `output_tokens`, while the Chat Completions API reports it as `completion_tokens`.

Some models, including GPT-5 models, generate tokens used to format or delimit response channels, tool calls, and other message structure. These formatting tokens don't appear in message content or `logprobs`, and they aren't necessarily itemized separately in usage. As a result, the reported output or completion token count can be higher than the number of visible tokens or tokens included in `logprobs`, even when the reported `reasoning_tokens` value is `0`.

The `max_output_tokens` and `max_completion_tokens` parameters limit all tokens generated by the model, including non-visible tokens. The number of non-visible tokens varies by model and response shape, so don't assume a fixed difference between reported usage and visible output. Leave headroom in these limits when you need a specific amount of visible output.

## API reference

For full parameters and response shape, see the [Count input tokens API reference](https://developers.openai.com/api/reference/python/resources/responses/subresources/input_tokens/methods/count). The endpoint is:

```
POST /v1/responses/input_tokens
```

The response includes `input_tokens` (integer) and `object: "response.input_tokens"`.

:::
:::

