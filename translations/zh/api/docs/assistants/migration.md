---
status: needs-review
sourceId: fe5b9b2c1738
sourceChecksum: fe5b9b2c1738a8eafc66c7e93589d1b21074827466e9190a91b167a1e13d8ec1
sourceUrl: https://developers.openai.com/api/docs/assistants/migration
translatedAt: 2026-06-27T16:52:09.8881258+08:00
translator: codex-gpt-5.5-xhigh
---

# Assistants 迁移指南

<br />

我们正在从 Assistants API 迁移到新的 [Responses API](https://developers.openai.com/api/docs/guides/responses-vs-chat-completions)，以获得更简单、更灵活的心智模型。

Responses 更简单：发送 input items，并取回 output items。使用 Responses API，你还可以获得更好的性能，以及 [deep research](https://developers.openai.com/api/docs/guides/deep-research)、[MCP](https://developers.openai.com/api/docs/guides/tools-remote-mcp) 和 [computer use](https://developers.openai.com/api/docs/guides/tools-computer-use) 等新功能。此变化还让你可以管理 conversations，而不必传回 `previous_response_id`。

### 有哪些变化？

<table>
  <thead>
    <tr>
      <th>之前</th>
      <th>现在</th>
      <th>原因</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`Assistants`</td>
      <td>`Prompts`</td>
      <td>
        Prompts 保存配置（模型、工具、指令），并且更容易
        版本化和更新
      </td>
    </tr>
    <tr>
      <td>`Threads`</td>
      <td>`Conversations`</td>
      <td>items 流，而不只是 messages</td>
    </tr>
    <tr>
      <td>`Runs`</td>
      <td>`Responses`</td>
      <td>
        Responses 发送 input items 或使用 conversation 对象，并接收
        output items；tool call 循环由你显式管理
      </td>
    </tr>
    <tr>
      <td>`Run steps`</td>
      <td>`Items`</td>
      <td>
        泛化后的对象，可以是 messages、tool calls、outputs 等
      </td>
    </tr>
  </tbody>
</table>

## 从 assistants 到 prompts

Assistants 曾是持久化的 API 对象，将模型选择、指令和工具声明打包在一起，并完全通过 API 创建和管理。它们的替代方案 prompts 只能在 dashboard 中创建，你可以在开发产品时对其进行版本化。

### 为什么这有帮助

- **可移植性和版本控制**：你可以对 prompt 规格进行快照、审阅、diff 和回滚。你也可以为 prompt 建立版本，因此代码只需指向最新版本。
- **关注点分离**：你的应用代码现在负责编排（历史裁剪、工具循环、重试），而 prompt 专注于高级行为和约束（系统指导、工具可用性、结构化输出 schema、temperature 默认值）。
- **Realtime 兼容性**：通过 Realtime API 连接时，可以复用同一个 prompt 配置，从而在聊天、流式传输和低延迟交互式会话之间获得单一行为定义。
- **工具和输出一致性**：使用 prompts 时，你启动的每个 Responses 或 Realtime 会话都会继承一致的契约，因为 prompts 封装了工具 schema 和结构化输出预期。

### 实用迁移步骤

1. 识别每个现有 Assistant 的 _instruction + tool_ 组合。
2. 在 dashboard 中，将该组合重新创建为一个命名 prompt。
3. 将 prompt ID（或其导出的规格）存入源代码控制，以便应用代码可以引用稳定标识符。
4. 在 rollout 期间，通过切换 prompt ID 运行 A/B 测试，无需以编程方式创建或删除 assistant 对象。

可以把 prompt 看作一个**带版本的行为配置文件**，可插入 Responses 或 Realtime API。

---

## 从 threads 到 conversations

Thread 是存储在服务器端的一组 messages。Threads _只能_ 存储 messages。Conversations 存储 items，items 可以包含 messages、tool calls、tool outputs 和其他数据。

### 请求示例

### 响应示例

---

## 从 runs 到 responses

Runs 是针对 threads 执行的异步过程。请参见下面的示例。Responses 更简单：提供一组要执行的 input items，并取回 output items 列表。

Responses 可以单独使用，但你也可以将它们与 prompt 和 conversation 对象配合使用，用于存储上下文和配置。

### 请求示例

### 响应示例

<CodeComparison
  client:load
  snippets={[
    {
      language: "python",
      code: `
{
  "id": "run_FKIpcs5ECSwuCmehBqsqkORj",
  "assistant_id": "asst_8fVY45hU3IM6creFkVi5MBKB",
  "cancelled_at": null,
  "completed_at": 1752857327,
  "created_at": 1752857322,
  "expires_at": null,
  "failed_at": null,
  "incomplete_details": null,
  "instructions": null,
  "last_error": null,
  "max_completion_tokens": null,
  "max_prompt_tokens": null,
  "metadata": {},
  "model": "gpt-4.1",
  "object": "thread.run",
  "parallel_tool_calls": true,
  "required_action": null,
  "response_format": "auto",
  "started_at": 1752857324,
  "status": "completed",
  "thread_id": "thread_CrXtCzcyEQbkAcXuNmVSKFs1",
  "tool_choice": "auto",
  "tools": [],
  "truncation_strategy": {
    "type": "auto",
    "last_messages": null
  },
  "usage": {
    "completion_tokens": 130,
    "prompt_tokens": 34,
    "total_tokens": 164,
    "prompt_token_details": {
      "cached_tokens": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0
    }
  },
  "temperature": 1.0,
  "top_p": 1.0,
  "tool_resources": {},
  "reasoning_effort": null
}
`,
      title: "Run object",
    },
    {
      language: "python",
      code: `
{
  "id": "resp_687a7b53036c819baad6012d58b39bcb074adcd9e24850fc",
  "created_at": 1752857427,
  "conversation": {
    "id": "conv_689667905b048191b4740501625afd940c7533ace33a2dab"
  },
  "error": null,
  "incomplete_details": null,
  "instructions": null,
  "metadata": {},
  "model": "gpt-5.5",
  "object": "response",
  "output": [
    {
      "id": "msg_687a7b542948819ba79e77e14791ef83074adcd9e24850fc",
      "content": [
        {
          "annotations": [],
          "text": "The \\"5 Ds of Dodgeball\\" are a humorous set of rules made famous by the 2004 comedy film **\\"Dodgeball: A True Underdog Story.\\"** In the movie, dodgeball coach Patches O’Houlihan teaches these basics to his team. The **5 Ds** are:\n\n1. **Dodge**\n2. **Duck**\n3. **Dip**\n4. **Dive**\n5. **Dodge** (yes, dodge is listed twice for emphasis!)\n\nIn summary:  \n> **“If you can dodge a wrench, you can dodge a ball!”**\n\nThese 5 Ds are not official competitive rules, but have become a fun and memorable pop culture reference for the sport of dodgeball.",
          "type": "output_text",
          "logprobs": []
        }
      ],
      "role": "assistant",
      "status": "completed",
      "type": "message"
    }
  ],
  "parallel_tool_calls": true,
  "temperature": 1.0,
  "tool_choice": "auto",
  "tools": [],
  "top_p": 1.0,
  "background": false,
  "max_output_tokens": null,
  "previous_response_id": null,
  "reasoning": {
    "effort": null,
    "generate_summary": null,
    "summary": null
  },
  "service_tier": "scale",
  "status": "completed",
  "text": {
    "format": {
      "type": "text"
    }
  },
  "truncation": "disabled",
  "usage": {
    "input_tokens": 17,
    "input_tokens_details": {
      "cached_tokens": 0
    },
    "output_tokens": 150,
    "output_tokens_details": {
      "reasoning_tokens": 0
    },
    "total_tokens": 167
  },
  "user": null,
  "max_tool_calls": null,
  "store": true,
  "top_logprobs": 0
}
`,
      title: "Response object",
    },
  ]}
/>

---

## 迁移你的集成

按照下面的迁移步骤，从 Assistants API 迁移到 Responses API，并且不丢失任何功能支持。

### 1. 从 assistants 创建 prompts

1. 识别你的应用中最重要的 assistant 对象。
1. 在 dashboard 中找到它们，并点击 `Create prompt`。

这会基于每个现有 assistant 对象创建一个 prompt 对象。

Reusable prompt 对象也正在被弃用。如果你使用这条迁移
  路径，请在长期集成中采用
  prompt 对象之前，查看 [prompts deprecation
  timeline](https://developers.openai.com/api/docs/deprecations#2026-06-03-reusable-prompts)。

### 2. 将新的用户聊天迁移到 conversations 和 responses

我们不会提供用于将 Threads 迁移到 Conversations 的自动化工具。相反，我们建议把新的用户 threads 迁移到 conversations，并在必要时回填旧的 threads。

下面是一个你可以如何回填 thread 的示例：

```python
thread_id = "thread_EIpHrTAVe0OzoLQg3TXfvrkG"

for page in openai.beta.threads.messages.list(thread_id=thread_id, order="asc").iter_pages():
    messages += page.data

items = []
for m in messages:
    item = {"role": m.role}
    item_content = []

    for content in m.content:
        match content.type:
            case "text":
                item_content_type = "input_text" if m.role == "user" else "output_text"
                item_content += [{"type": item_content_type, "text": content.text.value}]
            case "image_url":
                item_content + [
                    {
                        "type": "input_image",
                        "image_url": content.image_url.url,
                        "detail": content.image_url.detail,
                    }
                ]

    item |= {"content": item_content}
    items.append(item)

# create a conversation with your converted items
conversation = openai.conversations.create(items=items)
```


## 完整示例对比

下面有几个同时使用 Assistants API 和 Responses API 的简单集成示例，帮助你了解它们的对比。

### 用户聊天应用



<div data-content-switcher-pane data-value="assistants">
    <div class="hidden">Assistants API</div>
    ```python
thread = openai.threads.create()

    @app.post("/messages")
    async def message(message: Message):
        openai.beta.threads.messages.create(
            role="user",
            content=message.content
        )

        run = openai.beta.threads.runs.create(
            assistant_id=os.getenv("ASSISTANT_ID"),
            thread_id=thread.id
        )
        while run.status in ("queued", "in_progress"):
            await asyncio.sleep(1)
            run = openai.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)

        messages = openai.beta.threads.messages.list(
            order="desc", limit=1, thread_id=thread.id
        )

        return { "content": messages[-1].content }
```


  </div>
  <div data-content-switcher-pane data-value="responses" hidden>
    <div class="hidden">Responses API</div>
    ```python
conversation = openai.conversations.create()

    @app.post("/messages")
    async def message(message: Message):
        response = openai.responses.create(
            prompt={ "id": os.getenv("PROMPT_ID") },
            input=[{ "role": "user", "content": message.content }]
        )

        return { "content": response.output_text }
```


  </div>
