---
title: "Predicted Outputs 预测输出"
description: "Understand how to reduce latency for model responses where much of the response is known ahead of time."
outline: deep
---

# Predicted Outputs 预测输出

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/predicted-outputs](https://developers.openai.com/api/docs/guides/predicted-outputs)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/predicted-outputs.md](https://developers.openai.com/api/docs/guides/predicted-outputs.md)
- 抓取时间：2026-06-27T05:54:04.262Z
- Checksum：`3ce8641a58c274b3eab8567f6cfe70ba3828c3b36827bfe87693ef48813aa1f1`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
当许多输出 tokens 已经提前已知时，**Predicted Outputs** 可帮助你加速来自 [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat/create) 的 API 响应。最常见的情况是，你正在重新生成只做了少量修改的文本或代码文件。你可以使用 [Chat Completions 中的 `prediction` 请求参数](https://developers.openai.com/api/docs/api-reference/chat/create#chat-create-prediction)来提供预测内容。

Predicted Outputs 目前可与最新的 `gpt-4o`、`gpt-4o-mini`、`gpt-4.1`、`gpt-4.1-mini` 和 `gpt-4.1-nano` 模型一起使用。继续阅读，了解如何使用 Predicted Outputs 降低应用中的延迟。

## 代码重构示例

Predicted Outputs 对重新生成只做少量修改的文本文档和代码文件尤其有用。假设你想让 [GPT-4o model](https://developers.openai.com/api/docs/models#gpt-4o) 重构一段 TypeScript 代码，并将 `User` class 的 `username` property 改为 `email`：

```typescript
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
```

除了上面的第 4 行之外，文件的大部分内容都不会改变。如果使用代码文件当前文本作为 prediction，你就能以更低延迟重新生成整个文件。对于较大的文件，这些节省的时间会很快累积。

下面的示例使用 SDK 中的 `prediction` 参数，预测模型的最终输出将与原始代码文件非常相似，并把原始代码文件作为 prediction text。

使用 Predicted Output 重构 TypeScript class

```javascript
import OpenAI from "openai";

const code = `
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
`.trim();

const openai = new OpenAI();

const refactorPrompt = `
Replace the "username" property with an "email" property. Respond only 
with code, and with no markdown formatting.
`;

const completion = await openai.chat.completions.create({
  model: "gpt-4.1",
  messages: [
    {
      role: "user",
      content: refactorPrompt
    },
    {
      role: "user",
      content: code
    }
  ],
  store: true,
  prediction: {
    type: "content",
    content: code
  }
});

// Inspect returned data
console.log(completion);
console.log(completion.choices[0].message.content);
```

```python
from openai import OpenAI

code = """
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
"""

refactor_prompt = """
Replace the "username" property with an "email" property. Respond only 
with code, and with no markdown formatting.
"""

client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {
            "role": "user",
            "content": refactor_prompt
        },
        {
            "role": "user",
            "content": code
        }
    ],
    prediction={
        "type": "content",
        "content": code
    }
)

print(completion)
print(completion.choices[0].message.content)
```

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4.1",
    "messages": [
      {
        "role": "user",
        "content": "Replace the username property with an email property. Respond only with code, and with no markdown formatting."
      },
      {
        "role": "user",
        "content": "$CODE_CONTENT_HERE"
      }
    ],
    "prediction": {
        "type": "content",
        "content": "$CODE_CONTENT_HERE"
    }
  }'
```


除了重构后的代码，模型响应还会包含类似下面的数据：

```javascript
{
  id: 'chatcmpl-xxx',
  object: 'chat.completion',
  created: 1730918466,
  model: 'gpt-4o-2024-08-06',
  choices: [ /* ...actual text response here... */],
  usage: {
    prompt_tokens: 81,
    completion_tokens: 39,
    total_tokens: 120,
    prompt_tokens_details: { cached_tokens: 0, audio_tokens: 0 },
    completion_tokens_details: {
      reasoning_tokens: 0,
      audio_tokens: 0,
      accepted_prediction_tokens: 18,
      rejected_prediction_tokens: 10
    }
  },
  system_fingerprint: 'fp_159d8341cc'
}
```

请注意 `usage` 对象中的 `accepted_prediction_tokens` 和 `rejected_prediction_tokens`。在这个例子中，prediction 中有 18 个 tokens 被用于加速响应，而 10 个 tokens 被拒绝。

请注意，任何被拒绝的 tokens 仍会像 API 生成的其他 completion tokens 一样计费，因此 Predicted Outputs 可能会提高你的请求成本。

## Streaming 示例

在你为 API 响应使用 streaming 时，Predicted Outputs 带来的延迟收益会更大。下面仍然是相同的代码重构用例，但这次在 OpenAI SDKs 中使用 streaming。

带 streaming 的 Predicted Outputs

```javascript
import OpenAI from "openai";

const code = `
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
`.trim();

const openai = new OpenAI();

const refactorPrompt = `
Replace the "username" property with an "email" property. Respond only 
with code, and with no markdown formatting.
`;

const completion = await openai.chat.completions.create({
  model: "gpt-4.1",
  messages: [
    {
      role: "user",
      content: refactorPrompt
    },
    {
      role: "user",
      content: code
    }
  ],
  store: true,
  prediction: {
    type: "content",
    content: code
  },
  stream: true
});

// Inspect returned data
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
```

```python
from openai import OpenAI

code = """
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
"""

refactor_prompt = """
Replace the "username" property with an "email" property. Respond only 
with code, and with no markdown formatting.
"""

client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {
            "role": "user",
            "content": refactor_prompt
        },
        {
            "role": "user",
            "content": code
        }
    ],
    prediction={
        "type": "content",
        "content": code
    },
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```


## 预测文本在响应中的位置

在提供 prediction text 时，你的 prediction 可以出现在生成响应中的任何位置，并且仍然为响应带来延迟降低。假设你的 prediction text 是下面这个简单的 [Hono](https://hono.dev/) server：

```typescript




const app = new Hono();

app.get("/api", (c) => {
  return c.text("Hello Hono!");
});

// You will need to build the client code first `pnpm run ui:build`
app.use(
  "/*",
  serveStatic({
    rewriteRequestPath: (path) => `./dist${path}`,
  })
);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

你可以用类似下面的 prompt 让模型重新生成该文件：

```
Add a get route to this application that responds with
the text "hello world". Generate the entire application
file again with this route added, and with no other
markdown formatting.
```

对该 prompt 的响应可能类似下面这样：

```typescript




const app = new Hono();

app.get("/api", (c) => {
  return c.text("Hello Hono!");
});

app.get("/hello", (c) => {
  return c.text("hello world");
});

// You will need to build the client code first `pnpm run ui:build`
app.use(
  "/*",
  serveStatic({
    rewriteRequestPath: (path) => `./dist${path}`,
  })
);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

即使 prediction text 同时出现在响应中新增内容的前后，你仍会在响应中看到 accepted prediction tokens：

```javascript
{
  id: 'chatcmpl-xxx',
  object: 'chat.completion',
  created: 1731014771,
  model: 'gpt-4o-2024-08-06',
  choices: [ /* completion here... */],
  usage: {
    prompt_tokens: 203,
    completion_tokens: 159,
    total_tokens: 362,
    prompt_tokens_details: { cached_tokens: 0, audio_tokens: 0 },
    completion_tokens_details: {
      reasoning_tokens: 0,
      audio_tokens: 0,
      accepted_prediction_tokens: 60,
      rejected_prediction_tokens: 0
    }
  },
  system_fingerprint: 'fp_9ee9e968ea'
}
```

这一次，没有 rejected prediction tokens，因为我们预测的整个文件内容都用于最终响应。不错！🔥

## 限制

使用 Predicted Outputs 时，你应该考虑以下因素和限制。

- Predicted Outputs 仅支持 GPT-4o、GPT-4o-mini、GPT-4.1、GPT-4.1-mini 和 GPT-4.1-nano 系列模型。
- 提供 prediction 时，任何不属于最终 completion 的 tokens 仍会按 completion token 费率收费。请查看 `usage` 对象的 [`rejected_prediction_tokens` property](https://developers.openai.com/api/docs/api-reference/chat/object#chat/object-usage)，了解有多少 tokens 未在最终响应中使用。
- 使用 Predicted Outputs 时，不支持以下 [API parameters](https://developers.openai.com/api/docs/api-reference/chat/create)：
  - `n`：不支持大于 1 的值
  - `logprobs`：不支持
  - `presence_penalty`：不支持大于 0 的值
  - `frequency_penalty`：不支持大于 0 的值
  - `audio`：Predicted Outputs 与 [audio inputs and outputs](/mirror/api/docs/guides/audio) 不兼容
  - `modalities`：仅支持 `text` modalities
  - `max_completion_tokens`：不支持
  - `tools`：Function calling 目前不支持与 Predicted Outputs 一起使用

:::

## English source

::: details 展开英文原文
::: v-pre
**Predicted Outputs** enable you to speed up API responses from [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat/create) when many of the output tokens are known ahead of time. This is most common when you are regenerating a text or code file with minor modifications. You can provide your prediction using the [`prediction` request parameter in Chat Completions](https://developers.openai.com/api/docs/api-reference/chat/create#chat-create-prediction).

Predicted Outputs are available today using the latest `gpt-4o`, `gpt-4o-mini`, `gpt-4.1`, `gpt-4.1-mini`, and `gpt-4.1-nano` models. Read on to learn how to use Predicted Outputs to reduce latency in your applications.

## Code refactoring example

Predicted Outputs are particularly useful for regenerating text documents and code files with small modifications. Let's say you want the [GPT-4o model](https://developers.openai.com/api/docs/models#gpt-4o) to refactor a piece of TypeScript code, and convert the `username` property of the `User` class to be `email` instead:

```typescript
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
```

Most of the file will be unchanged, except for line 4 above. If you use the current text of the code file as your prediction, you can regenerate the entire file with lower latency. These time savings add up quickly for larger files.

Below is an example of using the `prediction` parameter in our SDKs to predict that the final output of the model will be very similar to our original code file, which we use as the prediction text.

Refactor a TypeScript class with a Predicted Output

```javascript
import OpenAI from "openai";

const code = `
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
`.trim();

const openai = new OpenAI();

const refactorPrompt = `
Replace the "username" property with an "email" property. Respond only 
with code, and with no markdown formatting.
`;

const completion = await openai.chat.completions.create({
  model: "gpt-4.1",
  messages: [
    {
      role: "user",
      content: refactorPrompt
    },
    {
      role: "user",
      content: code
    }
  ],
  store: true,
  prediction: {
    type: "content",
    content: code
  }
});

// Inspect returned data
console.log(completion);
console.log(completion.choices[0].message.content);
```

```python
from openai import OpenAI

code = """
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
"""

refactor_prompt = """
Replace the "username" property with an "email" property. Respond only 
with code, and with no markdown formatting.
"""

client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {
            "role": "user",
            "content": refactor_prompt
        },
        {
            "role": "user",
            "content": code
        }
    ],
    prediction={
        "type": "content",
        "content": code
    }
)

print(completion)
print(completion.choices[0].message.content)
```

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4.1",
    "messages": [
      {
        "role": "user",
        "content": "Replace the username property with an email property. Respond only with code, and with no markdown formatting."
      },
      {
        "role": "user",
        "content": "$CODE_CONTENT_HERE"
      }
    ],
    "prediction": {
        "type": "content",
        "content": "$CODE_CONTENT_HERE"
    }
  }'
```


In addition to the refactored code, the model response will contain data that looks something like this:

```javascript
{
  id: 'chatcmpl-xxx',
  object: 'chat.completion',
  created: 1730918466,
  model: 'gpt-4o-2024-08-06',
  choices: [ /* ...actual text response here... */],
  usage: {
    prompt_tokens: 81,
    completion_tokens: 39,
    total_tokens: 120,
    prompt_tokens_details: { cached_tokens: 0, audio_tokens: 0 },
    completion_tokens_details: {
      reasoning_tokens: 0,
      audio_tokens: 0,
      accepted_prediction_tokens: 18,
      rejected_prediction_tokens: 10
    }
  },
  system_fingerprint: 'fp_159d8341cc'
}
```

Note both the `accepted_prediction_tokens` and `rejected_prediction_tokens` in the `usage` object. In this example, 18 tokens from the prediction were used to speed up the response, while 10 were rejected.

Note that any rejected tokens are still billed like other completion tokens
  generated by the API, so Predicted Outputs can introduce higher costs for your
  requests.

## Streaming example

The latency gains of Predicted Outputs are even greater when you use streaming for API responses. Here is an example of the same code refactoring use case, but using streaming in the OpenAI SDKs instead.

Predicted Outputs with streaming

```javascript
import OpenAI from "openai";

const code = `
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
`.trim();

const openai = new OpenAI();

const refactorPrompt = `
Replace the "username" property with an "email" property. Respond only 
with code, and with no markdown formatting.
`;

const completion = await openai.chat.completions.create({
  model: "gpt-4.1",
  messages: [
    {
      role: "user",
      content: refactorPrompt
    },
    {
      role: "user",
      content: code
    }
  ],
  store: true,
  prediction: {
    type: "content",
    content: code
  },
  stream: true
});

// Inspect returned data
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
```

```python
from openai import OpenAI

code = """
class User {
  firstName: string = "";
  lastName: string = "";
  username: string = "";
}

export default User;
"""

refactor_prompt = """
Replace the "username" property with an "email" property. Respond only 
with code, and with no markdown formatting.
"""

client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {
            "role": "user",
            "content": refactor_prompt
        },
        {
            "role": "user",
            "content": code
        }
    ],
    prediction={
        "type": "content",
        "content": code
    },
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```


## Position of predicted text in response

When providing prediction text, your prediction can appear anywhere within the generated response, and still provide latency reduction for the response. Let's say your predicted text is the simple [Hono](https://hono.dev/) server shown below:

```typescript




const app = new Hono();

app.get("/api", (c) => {
  return c.text("Hello Hono!");
});

// You will need to build the client code first `pnpm run ui:build`
app.use(
  "/*",
  serveStatic({
    rewriteRequestPath: (path) => `./dist${path}`,
  })
);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

You could prompt the model to regenerate the file with a prompt like:

```
Add a get route to this application that responds with
the text "hello world". Generate the entire application
file again with this route added, and with no other
markdown formatting.
```

The response to the prompt might look something like this:

```typescript




const app = new Hono();

app.get("/api", (c) => {
  return c.text("Hello Hono!");
});

app.get("/hello", (c) => {
  return c.text("hello world");
});

// You will need to build the client code first `pnpm run ui:build`
app.use(
  "/*",
  serveStatic({
    rewriteRequestPath: (path) => `./dist${path}`,
  })
);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

You would still see accepted prediction tokens in the response, even though the prediction text appeared both before and after the new content added to the response:

```javascript
{
  id: 'chatcmpl-xxx',
  object: 'chat.completion',
  created: 1731014771,
  model: 'gpt-4o-2024-08-06',
  choices: [ /* completion here... */],
  usage: {
    prompt_tokens: 203,
    completion_tokens: 159,
    total_tokens: 362,
    prompt_tokens_details: { cached_tokens: 0, audio_tokens: 0 },
    completion_tokens_details: {
      reasoning_tokens: 0,
      audio_tokens: 0,
      accepted_prediction_tokens: 60,
      rejected_prediction_tokens: 0
    }
  },
  system_fingerprint: 'fp_9ee9e968ea'
}
```

This time, there were no rejected prediction tokens, because the entire content of the file we predicted was used in the final response. Nice! 🔥

## Limitations

When using Predicted Outputs, you should consider the following factors and limitations.

- Predicted Outputs are only supported with the GPT-4o, GPT-4o-mini, GPT-4.1, GPT-4.1-mini, and GPT-4.1-nano series of models.
- When providing a prediction, any tokens provided that are not part of the final completion are still charged at completion token rates. See the [`rejected_prediction_tokens` property of the `usage` object](https://developers.openai.com/api/docs/api-reference/chat/object#chat/object-usage) to see how many tokens are not used in the final response.
- The following [API parameters](https://developers.openai.com/api/docs/api-reference/chat/create) are not supported when using Predicted Outputs:
  - `n`: values higher than 1 are not supported
  - `logprobs`: not supported
  - `presence_penalty`: values greater than 0 are not supported
  - `frequency_penalty`: values greater than 0 are not supported
  - `audio`: Predicted Outputs are not compatible with [audio inputs and outputs](/mirror/api/docs/guides/audio)
  - `modalities`: Only `text` modalities are supported
  - `max_completion_tokens`: not supported
  - `tools`: Function calling is not currently supported with Predicted Outputs

:::
:::

