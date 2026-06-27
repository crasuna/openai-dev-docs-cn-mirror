---
status: needs-review
sourceId: "238d0328ce79"
sourceChecksum: "238d0328ce7987d9d8702744cc18d7e8272e258061db323cedbac00038406676"
sourceUrl: "https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object"
translatedAt: "2026-06-27T18:00:55+08:00"
translator: codex-gpt-5.5-xhigh
---

# 从 prompt objects 迁移

OpenAI 正在弃用 API 中可复用的 prompt objects。从 2026 年 6 月 3 日开始，prompt 创建将不再被重点支持，`v1/prompts` 计划于 2026 年 11 月 30 日关闭。请查看 [deprecations page](https://developers.openai.com/api/docs/deprecations#2026-06-03-reusable-prompts) 了解当前时间线。

要从 OpenAI API 平台中的 **Prompts** 迁移出来，请将 prompt 内容从托管的 `prompt` 对象移到你的应用代码中。这样你可以更好地控制审查、测试、部署和版本管理。

## 迁移前：使用 Prompt Object

使用 prompt object

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  prompt: {
    prompt_id: "pmpt_123",
    version: "1",
    variables: {
      customer_name: "Acme",
      issue: "billing question",
    },
  },
});
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    prompt={
        "prompt_id": "pmpt_123",
        "version": "1",
        "variables": {
            "customer_name": "Acme",
            "issue": "billing question",
        },
    }
)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "prompt": {
      "prompt_id": "pmpt_123",
      "version": "1",
      "variables": {
        "customer_name": "Acme",
        "issue": "billing question"
      }
    }
  }'
```


## 迁移后：在代码中内联 prompt

在代码中内联 prompt

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "system",
      content:
        "You are a helpful support assistant. Be concise, accurate, and friendly.",
    },
    {
      role: "user",
      content:
        "Customer name: Acme. Issue: billing question. Write a response to the customer.",
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
    input=[
        {
            "role": "system",
            "content": "You are a helpful support assistant. Be concise, accurate, and friendly.",
        },
        {
            "role": "user",
            "content": "Customer name: Acme. Issue: billing question. Write a response to the customer.",
        },
    ],
)

print(response.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": [
      {
        "role": "system",
        "content": "You are a helpful support assistant. Be concise, accurate, and friendly."
      },
      {
        "role": "user",
        "content": "Customer name: Acme. Issue: billing question. Write a response to the customer."
      }
    ]
  }'
```


## 使用 Codex 迁移

使用 [OpenAI Developers plugin](https://developers.openai.com/learn/developers-codex-plugin) 和 [OpenAI Docs skill](https://github.com/openai/skills/tree/main/skills/.curated/openai-docs) 自动完成迁移，并加速使用 OpenAI API 构建。

```text
$openai-docs update this project to store prompts in code instead of using a prompts object
```

## 会发生什么变化

不再从 API 请求中引用保存的 prompt object，而是将 prompt 文本存放在代码库中，并在 Responses API 调用中把生成的 messages 直接作为 `input` 传入。

- **将 prompt 内容移入源代码**，让 prompt 变更经过与产品逻辑相同的审查和发布流程。
- **用函数参数替换 prompt variables**，让动态值在你的应用中显式且具备类型。
- **通过 `input` 传递 messages**，在 Responses API 调用中替代使用 `prompt` 对象。
- **将版本管理移到你的 repo**，使用 git commits、PR review，以及 tests 或 evals。
- **将静态内容放在前面、动态内容放在后面**，以保留 prompt caching 的收益，因为缓存命中取决于完全匹配的前缀。

## 示例

使用辅助函数构建 prompts

```javascript
import OpenAI from "openai";

const client = new OpenAI();

function buildSupportPrompt({ customerName, issue }) {
  return [
    {
      role: "system",
      content:
        "You are a helpful support assistant. Be concise, accurate, and friendly. Do not invent policy details.",
    },
    {
      role: "user",
      content: `Customer name: ${customerName}. Issue: ${issue}. Write a response to the customer.`,
    },
  ];
}

const response = await client.responses.create({
  model: "gpt-5.5",
  input: buildSupportPrompt({
    customerName: "Acme",
    issue: "billing question",
  }),
});
```

```python
from openai import OpenAI

client = OpenAI()

def build_support_prompt(customer_name, issue):
    return [
        {
            "role": "system",
            "content": "You are a helpful support assistant. Be concise, accurate, and friendly. Do not invent policy details.",
        },
        {
            "role": "user",
            "content": f"Customer name: {customer_name}. Issue: {issue}. Write a response to the customer.",
        },
    ]

response = client.responses.create(
    model="gpt-5.5",
    input=build_support_prompt(
        customer_name="Acme",
        issue="billing question",
    ),
)
```


## 你会获得什么

你将获得更严格的工程控制：prompts 与产品代码放在一起，变更通过 PR 流转，tests 和 evals 可以在 CI 中运行，发布或实验也可以通过你自己的配置或 feature flags 管理。

不要把 prompts 零散地内联到整个代码库。创建一个小型 `prompts/` 模块，将每个 prompt 保持为具名 builder function，并添加轻量级 eval fixtures，让 prompt 变更像产品逻辑一样接受审查。
