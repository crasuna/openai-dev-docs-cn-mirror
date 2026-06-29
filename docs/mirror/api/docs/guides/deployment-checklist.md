---
title: "API 部署检查清单"
description: "Review commonly underused Responses API design choices that improve deployment quality, speed, cost, and reliability."
outline: deep
---

# API 部署检查清单

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/deployment-checklist](https://developers.openai.com/api/docs/guides/deployment-checklist)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/deployment-checklist.md](https://developers.openai.com/api/docs/guides/deployment-checklist.md)
- 抓取时间：2026-06-27T05:54:01.038Z
- Checksum：`fc806aaefad204d0aaad499f994f5addf6992f4b875e5fe65f3d1519258dd138`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
| 内容                                                                                  | 预期影响                     |
| ------------------------------------------------------------------------------------- | ---------------------------- |
| [使用 Responses API](/mirror/api/docs/guides/deployment-checklist#use-the-responses-api)                                          | 质量、成本、延迟、可靠性     |
| [设置 `reasoning.effort`](/mirror/api/docs/guides/deployment-checklist#set-up-reasoningeffort)                                    | 质量、成本、延迟             |
| [设置 `text.verbosity`](/mirror/api/docs/guides/deployment-checklist#set-up-textverbosity)                                        | 质量、成本、延迟             |
| [设置 assistant 的 `phase` 参数](/mirror/api/docs/guides/deployment-checklist#set-up-the-assistant-phase-parameter)               | 质量、成本                   |
| [使用 `tool_search`](/mirror/api/docs/guides/deployment-checklist#use-tool_search)                                                | 成本、延迟                   |
| [利用内置工具](/mirror/api/docs/guides/deployment-checklist#leverage-built-in-tools)                                              | 质量                         |
| [利用 compaction](/mirror/api/docs/guides/deployment-checklist#leverage-compaction)                                               | 成本                         |
| [使用 `prompt_cache_key`](/mirror/api/docs/guides/deployment-checklist#use-prompt_cache_key)                                      | 延迟、成本                   |
| [使用 `reasoning.encrypted_content`](/mirror/api/docs/guides/deployment-checklist#use-reasoningencrypted_content)                 | 质量、延迟                   |
| [使用 `background=True`](/mirror/api/docs/guides/deployment-checklist#use-backgroundtrue)                                         | 可恢复性                     |
| [使用 WebSocket 模式](/mirror/api/docs/guides/deployment-checklist#use-websocket-mode)                                            | 延迟                         |

## 使用 Responses API

**始终从**
[Responses API](/mirror/api/docs/guides/migrate-to-responses)
**开始**。它是 OpenAI 的旗舰 API，也是访问最新模型行为、内置工具、有状态工作流和 agent 功能的最佳入口。

## 设置 `reasoning.effort`

使用 `reasoning.effort` 决定模型在回答前应投入多少思考。

对于 `gpt-5.5`，支持的取值为 `none`、`low`、`medium`、`high` 和 `xhigh`。默认值为 `medium`。较低 effort 更快，并消耗更少推理 token。较高 effort 会给模型更多时间用于规划、调试、综合信息以及权衡多步骤取舍。合适的值取决于**任务**，而不只是模型。

当工作主要是抽取、路由、分类或简单改写时，使用 `low`。当模型需要诊断问题、比较方案、编写计划或推理代码时，使用 `medium` 或 `high`。仅在你的评测表明额外延迟值得付出时，才保留 `xhigh`。

为任务调节 reasoning effort

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = [
  "Our CI job started failing after a dependency bump.",
  "",
  "Error:",
  "TypeError: Timeout.__init__() got an unexpected keyword argument 'connect'",
  "",
  "Identify the likeliest root cause and the smallest safe fix.",
].join("\n");

const response = await openai.responses.create({
  model: "gpt-5.5",
  reasoning: { effort: "high" },
  input: prompt,
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
Our CI job started failing after a dependency bump.

Error:
TypeError: Timeout.__init__() got an unexpected keyword argument 'connect'

Identify the likeliest root cause and the smallest safe fix.
"""

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "high"},
    input=prompt,
)

print(response.output_text)
```


## 设置 `text.verbosity`

`text.verbosity` 是在简洁性与完整性之间取得平衡的主要控制项。当产品需要快速、紧凑的回答时，使用较低 verbosity；当响应需要更丰富的解释、更清晰的结构或完整上下文时，使用较高 verbosity。较低 verbosity 意味着更少的输出 token，因此模型生成内容更少，返回也更快。

对于编码任务，`medium` 和 `high` 往往会产出更长、更有组织、结构更清晰的结果。`low` 会让答案更紧凑、更精简。

为紧凑输出设置较低 verbosity

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const incident = [
  "Summarize this incident for the next on-call engineer.",
  "- checkout latency spiked from 220 ms to 4.8 s",
  "- only us-east-1 was affected",
  "- rollback is complete",
  "- likely trigger: cache stampede after deploy",
].join("\n");

const response = await openai.responses.create({
  model: "gpt-5.5",
  text: { verbosity: "low" },
  input: incident,
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    text={"verbosity": "low"},
    input="""
    Summarize this incident for the next on-call engineer.
    - checkout latency spiked from 220 ms to 4.8 s
    - only us-east-1 was affected
    - rollback is complete
    - likely trigger: cache stampede after deploy
    """,
)

print(response.output_text)
```


## 设置 assistant 的 `phase` 参数

`phase` 是 conversation history 中 assistant 消息上的标签。它告诉模型，之前某条 assistant 消息是中间工作 commentary，还是最终答案。对于进度更新、工具调用前说明以及其他过程性消息，使用 `phase: "commentary"`。对于完成后的响应，使用 `phase: "final_answer"`。

assistant 可能会说类似下面的话：

Assistant commentary 消息

```json
{
  "role": "assistant",
  "phase": "commentary",
  "content": "I'm checking the logs and comparing them to the last successful deploy."
}
```


这不是答案，而是一条进度说明。稍后，assistant 可能会说：

Assistant final answer 消息

```json
{
  "role": "assistant",
  "phase": "final_answer",
  "content": "The deploy failed because the migration referenced a column that does not exist in production."
}
```


这在长时间运行或大量使用工具的工作流中很有用，因为 assistant 可能会在完成之前产出可见的进度更新。当你把这段历史再次发送给模型时，请保留 assistant 消息上的 `phase`，这样模型就能区分哪些消息是进度更新，哪条消息是最终结果。

在后续请求中，请为 `gpt-5.3-codex` 及之后的新模型**保留并重新发送 assistant 消息上的 `phase`**。这有助于解决过早停止问题，确保 agent 持续运行直到得到最终答案。

## 使用 `tool_search`

不要在每个请求中加载完整工具目录，而是添加 `{"type": "tool_search"}`，并用 `defer_loading: true` 标记昂贵的工具定义。这样模型就可以在运行时加载自己需要的子集。请求开始时，模型只会看到搜索工具的名称和描述。如果模型判断自己需要某个延迟加载的工具，它会运行 tool search，随后才把延迟工具定义加载进上下文。只有在那之后，模型才会调用这些工具。这可以节省 token，并保持缓存性能。

有两种模式：

- **托管 tool search**：这是更简单的选项。适用于你已经知道请求可能使用哪些工具的场景。
- **客户端执行的 tool search**：适用于你的应用必须自行决定有哪些工具可用的场景，例如基于用户的租户、项目、权限或内部注册表。

**优先从托管 tool search 开始**，除非你的应用确实需要自己控制发现流程。

按用户意图对工具分组。可以时使用命名空间或 MCP server。相比一长串扁平的函数列表，让模型在少数几个清晰分组之间选择会更容易。我们建议每个命名空间保持在大约 10 个函数以内，以获得最佳 token 效率和模型性能。

命名空间描述应简短且有区分度。把详细说明放在延迟加载的工具定义内部。避免创建一个包罗万象的巨大命名空间。

将托管 tool search 与延迟工具一起使用

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const billingLookupInvoice = {
  type: "function",
  name: "billing.lookup_invoice",
  description: "Look up invoice state, taxes, credits, and payment attempts.",
  parameters: {
    type: "object",
    properties: {
      invoice_id: { type: "string" },
    },
    required: ["invoice_id"],
    additionalProperties: false,
  },
  strict: true,
  defer_loading: true,
};

const crmGetAccount = {
  type: "function",
  name: "crm.get_account",
  description: "Fetch account owner, plan, health, and payment history.",
  parameters: {
    type: "object",
    properties: {
      account_id: { type: "string" },
    },
    required: ["account_id"],
    additionalProperties: false,
  },
  strict: true,
  defer_loading: true,
};

const response = await openai.responses.create({
  model: "gpt-5.5",
  input:
    "Find the right billing tool and explain why invoice INV-1043 still " +
    "shows overdue after a payment yesterday.",
  tools: [
    { type: "tool_search" },
    billingLookupInvoice,
    crmGetAccount,
  ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

billing_lookup_invoice = {
    "type": "function",
    "name": "billing.lookup_invoice",
    "description": "Look up invoice state, taxes, credits, and payment attempts.",
    "parameters": {
        "type": "object",
        "properties": {
            "invoice_id": {"type": "string"},
        },
        "required": ["invoice_id"],
        "additionalProperties": False,
    },
    "strict": True,
    "defer_loading": True,
}

crm_get_account = {
    "type": "function",
    "name": "crm.get_account",
    "description": "Fetch account owner, plan, health, and payment history.",
    "parameters": {
        "type": "object",
        "properties": {
            "account_id": {"type": "string"},
        },
        "required": ["account_id"],
        "additionalProperties": False,
    },
    "strict": True,
    "defer_loading": True,
}

response = client.responses.create(
    model="gpt-5.5",
    input=(
        "Find the right billing tool and explain why invoice INV-1043 still "
        "shows overdue after a payment yesterday."
    ),
    tools=[
        {"type": "tool_search"},
        billing_lookup_invoice,
        crm_get_account,
    ],
)

print(response.output_text)
```


## 利用内置工具

[内置工具](/mirror/api/docs/guides/tools)是 API 的原生能力。你无需自己构建每一种工具，而是可以让模型访问已经能在 Responses API 内部工作的工具。模型随后可以自行决定何时使用它们。

OpenAI 会持续添加更多原生工具，因此当内置工具适合你的工作流时，应优先从内置工具开始。只有在原生选项无法覆盖任务时，再构建自定义工具。当前的内置工具和相关工具选项包括：

- **Web search**：搜索网页，获取最新信息
- **File search**：搜索已上传文件或 vector store
- **Code interpreter**：运行 Python，用于分析、数学、图表和文件处理
- **Shell**：在托管容器或你自己的运行时中运行 shell 命令
- **Computer use**：通过截图、点击、输入和滚动操作 UI
- **Image generation**：生成或编辑图片
- **MCP/connectors**：将模型连接到外部服务和工具
- **Skills**：附加可复用的指令包和工作流文件
- **Apply patch**：进行结构化代码编辑

还有一个与模型质量相关的理由支持优先使用内置工具。内置工具位于我们后训练的分布内，这意味着模型围绕这些工具形状、行为和输出进行训练和评估。相比新工具，使用内置工具时，OpenAI 模型支持更好的工具选择、更干净的执行和更少的失败。

## 利用 compaction

[Compaction](/mirror/api/docs/guides/compaction) 是一种上下文工程工具：它决定模型在多轮对话中携带哪些信息向前推进。在长时间运行的 agent 中，问题不只是“我会不会撞到上下文限制？”还包括旧消息、工具日志、重试和过时细节会挤占模型真正需要的状态。

Compaction 提供了一种受控方式来减少上下文大小，同时保留后续轮次所需的状态。在完成一个有意义的里程碑后，例如完成一个调试阶段或缩小根因范围，你可以压缩之前的窗口，并从压缩后的输出继续。这能让模型保持敏锐，因为下一轮会围绕重要状态构建，而不是围绕每一段中间推理、失败命令和已经过时的推理分支。

利用 compaction 有两种方式：

- **让服务器处理**：如果你使用 `previous_response_id`，开启带有 `compact_threshold` 的 `context_management`。当对话变得过大时，服务器会自动压缩。你只需要持续发送最新的用户消息。
- **自己处理**：如果你自己管理完整的 input 数组，调用 `client.responses.compact()`。它会返回一个更小的上下文窗口。将返回的输出直接用于下一次 `responses.create()` 调用。

**不要编辑压缩后的输出。**它不是面向人的摘要，而是帮助模型继续的机器状态。请原样向前传递，然后添加下一条用户消息。

从压缩后的 response 状态继续

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

// Full window collected from a long debugging session:
// user messages, assistant outputs, tool calls, and tool outputs.
const longWindow = sessionItems;

const compacted = await openai.responses.compact({
  model: "gpt-5.5",
  input: longWindow,
});

const nextResponse = await openai.responses.create({
  model: "gpt-5.5",
  store: false,
  input: [
    ...compacted.output, // Use compact output as-is.
    {
      type: "message",
      role: "user",
      content:
        "We found the bad cache invalidation path. Write the fix plan " +
        "and the verification checklist.",
    },
  ],
});

console.log(nextResponse.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

# Full window collected from a long debugging session:
# user messages, assistant outputs, tool calls, and tool outputs.
long_window = session_items

compacted = client.responses.compact(
    model="gpt-5.5",
    input=long_window,
)

next_response = client.responses.create(
    model="gpt-5.5",
    store=False,
    input=[
        *compacted.output,  # Use compact output as-is.
        {
            "type": "message",
            "role": "user",
            "content": (
                "We found the bad cache invalidation path. Write the fix plan "
                "and the verification checklist."
            ),
        },
    ],
)

print(next_response.output_text)
```


## 使用 `prompt_cache_key`

当请求复用同一段长前缀时，[Prompt caching](/mirror/api/docs/guides/prompt-caching) 会自动降低延迟和成本。对于高流量工作流，请为共享同一稳定前缀的请求一致设置 [`prompt_cache_key`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-prompt_cache_key)。

缓存 key 会与 prompt 前缀哈希结合，因此它有助于把相似请求路由到同一个缓存，而不改变模型输入。请为真正共享的前缀保持 key 稳定，并选择合适的粒度，避免把过多流量发送到同一个前缀与 key 组合。如果一个前缀和 `prompt_cache_key` 组合每分钟超过约 15 个请求，请求可能会溢出到额外机器，从而降低缓存效果。

将相关请求路由到同一个 prompt cache

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const instructions = [
  "You are the support agent for Acme.",
  "Follow the Acme support policy and escalation rubric.",
  "Use the same tone, safety rules, and tool plan for each ticket.",
].join("\n");

const response = await openai.responses.create({
  model: "gpt-5.5",
  prompt_cache_key: "tenant-acme-support-agent",
  instructions,
  input: "Summarize the current escalation for the on-call lead.",
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

instructions = """
You are the support agent for Acme.
Follow the Acme support policy and escalation rubric.
Use the same tone, safety rules, and tool plan for each ticket.
"""

response = client.responses.create(
    model="gpt-5.5",
    prompt_cache_key="tenant-acme-support-agent",
    instructions=instructions,
    input="Summarize the current escalation for the on-call lead.",
)

print(response.output_text)
```


## 使用 `reasoning.encrypted_content`

始终往返传递 reasoning item。这允许模型基于自己先前的推理继续工作，从而帮助模型。如果你的 [Zero Data Retention (ZDR)](/mirror/api/docs/guides/your-data#zero-data-retention) 要求不允许存储响应数据，那么 `reasoning.encrypted_content` 就很重要。`reasoning.encrypted_content` 为你提供无状态交接。

把 `reasoning.encrypted_content` 添加到 `include` 中，响应输出中的 reasoning item 就会包含加密推理内容，可在下一次请求中传回。你的应用不需要理解这个值。它只需要完全按返回内容保留 reasoning item，并在下一轮发送回去，这样模型就可以用它继续工作流。

在无状态轮次之间传递加密 reasoning

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const first = await openai.responses.create({
  model: "gpt-5.5",
  store: false,
  reasoning: { effort: "medium" },
  include: ["reasoning.encrypted_content"],
  input: "Investigate why invoice INV-1043 has mismatched tax totals.",
});

const second = await openai.responses.create({
  model: "gpt-5.5",
  store: false,
  reasoning: { effort: "medium" },
  include: ["reasoning.encrypted_content"],
  input: [
    ...first.output,
    {
      role: "user",
      content: "Now write the customer-facing explanation in plain English.",
    },
  ],
});

console.log(second.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

first = client.responses.create(
    model="gpt-5.5",
    store=False,
    reasoning={"effort": "medium"},
    include=["reasoning.encrypted_content"],
    input="Investigate why invoice INV-1043 has mismatched tax totals.",
)

second = client.responses.create(
    model="gpt-5.5",
    store=False,
    reasoning={"effort": "medium"},
    include=["reasoning.encrypted_content"],
    input=[
        *first.output,
        {
            "role": "user",
            "content": "Now write the customer-facing explanation in plain English.",
        },
    ],
)

print(second.output_text)
```


## 使用 `background=True`

对于可能耗时较长的请求，使用 [`background=True`](/mirror/api/docs/guides/background)。API 不会一直保持客户端连接打开，而是启动一个作业并返回 ID。你的应用可以轮询该作业，直到它完成、失败或被取消。它适用于大型分析、长时间工具运行，或需要状态与重试行为的工作。

`background=True` **要求 `store=True`**。

运行并轮询后台 response

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

let job = await openai.responses.create({
  model: "gpt-5.5",
  background: true,
  store: true,
  input: "Analyze this large log bundle and cluster the primary failure modes.",
  tools: [
    {
      type: "code_interpreter",
      container: {
        type: "auto",
        file_ids: [logBundleFileId],
      },
    },
  ],
});

while (["queued", "in_progress"].includes(job.status)) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  job = await openai.responses.retrieve(job.id);
}

console.log(job.output_text);
```

```python
from openai import OpenAI
import time

client = OpenAI()

job = client.responses.create(
    model="gpt-5.5",
    background=True,
    store=True,
    input="Analyze this large log bundle and cluster the primary failure modes.",
    tools=[
        {
            "type": "code_interpreter",
            "container": {
                "type": "auto",
                "file_ids": [log_bundle_file_id],
            },
        }
    ],
)

while job.status in {"queued", "in_progress"}:
    time.sleep(2)
    job = client.responses.retrieve(job.id)

print(job.output_text)
```


你可以把它与 `stream=True` 结合，用于获取进度事件，但第一个事件可能比普通请求需要更长时间。

从 UI 视角看，后台模式表示：“这正在运行；这是状态；结果准备好后会出现在这里。”

注意：`background=True` 与 [Zero Data Retention](/mirror/api/docs/guides/your-data#zero-data-retention) 不兼容。

## 使用 WebSocket 模式

[WebSocket 模式](/mirror/api/docs/guides/websocket-mode) 专为长时间运行、工具调用密集的工作流而构建。在这种模式下，你保持一个持久连接，并只发送新的 input item 加 `previous_response_id` 来继续。对于包含 20 次或更多工具调用的 rollout，这种方法端到端大约快 40%。

**工作方式**：第一条消息看起来会像普通的 Responses 请求：model、instructions、tools 和 user input。服务器会流式返回事件。如果模型请求工具，你的应用运行该工具。然后，你无需发送新的 HTTP 请求，而是在同一个 socket 上发送另一条 `response.create` 事件，带上之前的 `previous_response_id` 和新 item。延迟收益就来自这里。在普通 HTTP 中，每次后续交互都是一次新请求。在 WebSocket 模式中，连接保持打开，最近一次 response 状态也在该连接的内存中保持热状态。当下一轮从该 response 继续时，后端需要做的准备工作更少。

如果你的工作流是一次请求、一次回答，那么**继续使用 HTTP**。如果你的工作流表现得像长时间运行的 agent，可以尝试 WebSocket 模式。

单个 WebSocket 连接一次处理一个正在运行的 response，因此并行工作需要多个连接。连接当前最长为 60 分钟。Continuation 使用与 HTTP 模式相同的 `previous_response_id` 语义，并为最近的 response 提供连接本地缓存。

注意：WebSocket 模式适用于 ZDR，因为你的数据不会存储到磁盘，只会保存在内存中。

默认 Python 示例使用 `websocket-client`（`pip install websocket-client`）。JavaScript 示例使用 `ws`（`npm install ws`）。

启动 Responses API WebSocket 会话

```javascript
import OpenAI from "openai";
import WebSocket from "ws";

const openai = new OpenAI();

const ws = new WebSocket("wss://api.openai.com/v1/responses", {
  headers: {
    Authorization: "Bearer " + openai.apiKey,
  },
});

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "response.create",
      model: "gpt-5.5",
      store: false,
      input: [
        {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Find the flaky test in this run, call the tools you need, " +
                "and keep going until you can explain the root cause.",
            },
          ],
        },
      ],
      tools: [testLogTool, codeSearchTool],
    })
  );
});

ws.on("message", (data) => {
  const firstEvent = JSON.parse(data.toString());
  console.log(firstEvent.type);
});
```

```python
from openai import OpenAI
from websocket import create_connection
import json

client = OpenAI()

ws = create_connection(
    "wss://api.openai.com/v1/responses",
    header=[f"Authorization: Bearer {client.api_key}"],
)

# Same request body you would send to client.responses.create(...).
ws.send(
    json.dumps(
        {
            "type": "response.create",
            "model": "gpt-5.5",
            "store": False,
            "input": [
                {
                    "type": "message",
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "Find the flaky test in this run, call the tools "
                                "you need, and keep going until you can explain "
                                "the root cause."
                            ),
                        }
                    ],
                }
            ],
            "tools": [test_log_tool, code_search_tool],
        }
    )
)

first_event = json.loads(ws.recv())
print(first_event["type"])
```


## 最终要点

Responses API 是构建更智能、更强大 OpenAI 应用的基础。它真正的优势在于，让开发者可以从一次性 prompt 转向持久、会使用工具、具备上下文意识的工作流，并能够适应任务复杂度。按照本指南操作，可以在真实部署中看到更高性能。

:::

## English source

::: details 展开英文原文
::: v-pre
| Contents                                                                        | Expected impact                     |
| ------------------------------------------------------------------------------- | ----------------------------------- |
| [Use the Responses API](/mirror/api/docs/guides/deployment-checklist#use-the-responses-api)                                 | Quality, cost, latency, reliability |
| [Set up `reasoning.effort`](/mirror/api/docs/guides/deployment-checklist#set-up-reasoningeffort)                            | Quality, cost, latency              |
| [Set up `text.verbosity`](/mirror/api/docs/guides/deployment-checklist#set-up-textverbosity)                                | Quality, cost, latency              |
| [Set up the assistant `phase` parameter](/mirror/api/docs/guides/deployment-checklist#set-up-the-assistant-phase-parameter) | Quality, cost                       |
| [Use `tool_search`](/mirror/api/docs/guides/deployment-checklist#use-tool_search)                                           | Cost, latency                       |
| [Leverage built-in tools](/mirror/api/docs/guides/deployment-checklist#leverage-built-in-tools)                             | Quality                             |
| [Leverage compaction](/mirror/api/docs/guides/deployment-checklist#leverage-compaction)                                     | Cost                                |
| [Use `prompt_cache_key`](/mirror/api/docs/guides/deployment-checklist#use-prompt_cache_key)                                 | Latency, cost                       |
| [Use `reasoning.encrypted_content`](/mirror/api/docs/guides/deployment-checklist#use-reasoningencrypted_content)            | Quality, latency                    |
| [Use `background=True`](/mirror/api/docs/guides/deployment-checklist#use-backgroundtrue)                                    | Resumability                        |
| [Use WebSocket mode](/mirror/api/docs/guides/deployment-checklist#use-websocket-mode)                                       | Latency                             |

## Use the Responses API

**Always start** with the
[Responses API](/mirror/api/docs/guides/migrate-to-responses). It is OpenAI's flagship
API and the best place to access the newest model behavior, built-in tools,
stateful workflows, and agent features.

## Set up `reasoning.effort`

Use `reasoning.effort` to decide how much thinking the model should do before it
answers.

For `gpt-5.5`, the supported values are `none`, `low`, `medium`, `high`, and
`xhigh`. The default is `medium`. Lower effort is faster and uses fewer
reasoning tokens. Higher effort gives the model more time for planning,
debugging, synthesis, and multi-step tradeoffs. The right value depends on the
**task**, not just the model.

Use `low` when the job is mostly extraction, routing, classification, or a
simple rewrite. Use `medium` or `high` when the model needs to diagnose a
problem, compare options, write a plan, or reason through code. Reserve `xhigh`
for cases where your evals show the extra latency is worth it.

Tune reasoning effort for the task

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = [
  "Our CI job started failing after a dependency bump.",
  "",
  "Error:",
  "TypeError: Timeout.__init__() got an unexpected keyword argument 'connect'",
  "",
  "Identify the likeliest root cause and the smallest safe fix.",
].join("\n");

const response = await openai.responses.create({
  model: "gpt-5.5",
  reasoning: { effort: "high" },
  input: prompt,
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
Our CI job started failing after a dependency bump.

Error:
TypeError: Timeout.__init__() got an unexpected keyword argument 'connect'

Identify the likeliest root cause and the smallest safe fix.
"""

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "high"},
    input=prompt,
)

print(response.output_text)
```


## Set up `text.verbosity`

`text.verbosity` is the main lever for balancing brevity against completeness.
Use lower verbosity when the product needs a quick, compact answer, and higher
verbosity when the response needs richer explanation, clearer structure, or
complete context. Lower verbosity means fewer output tokens, so the model
generates less and returns output faster.

For coding, `medium` and `high` tend to produce longer, more organized output
with clearer structure. `low` keeps the answer tighter and more minimal.

Set lower verbosity for compact output

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const incident = [
  "Summarize this incident for the next on-call engineer.",
  "- checkout latency spiked from 220 ms to 4.8 s",
  "- only us-east-1 was affected",
  "- rollback is complete",
  "- likely trigger: cache stampede after deploy",
].join("\n");

const response = await openai.responses.create({
  model: "gpt-5.5",
  text: { verbosity: "low" },
  input: incident,
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    text={"verbosity": "low"},
    input="""
    Summarize this incident for the next on-call engineer.
    - checkout latency spiked from 220 ms to 4.8 s
    - only us-east-1 was affected
    - rollback is complete
    - likely trigger: cache stampede after deploy
    """,
)

print(response.output_text)
```


## Set up the assistant `phase` parameter

`phase` is a label on assistant messages in the conversation history. It
indicates to the model whether a prior assistant message was an intermediate
working commentary or the final answer. Use `phase: "commentary"` for progress
updates, pre-tool-call notes, and other in-between messages. Use
`phase: "final_answer"` for the completed response.

The assistant might say something like:

Assistant commentary message

```json
{
  "role": "assistant",
  "phase": "commentary",
  "content": "I'm checking the logs and comparing them to the last successful deploy."
}
```


That is not the answer. It is a progress note. Later, the assistant might say:

Assistant final answer message

```json
{
  "role": "assistant",
  "phase": "final_answer",
  "content": "The deploy failed because the migration referenced a column that does not exist in production."
}
```


This is useful in long-running or tool-heavy workflows where the assistant may
produce visible progress updates before it finishes. When you send that history
back to the model, preserve `phase` on assistant messages so the model can tell
which messages are progress updates and which message is the final result.

**Preserve and resend `phase`** on assistant messages on follow-up requests for
new models like `gpt-5.3-codex` and later. It helps address early stopping,
ensuring the agent runs until it reaches the final answer.

## Use `tool_search`

Instead of loading the full tool catalog into every request, add
`{"type": "tool_search"}` and mark expensive tool definitions with
`defer_loading: true`. The model can then load the subset it needs at runtime.
At request start, the model only sees the search tool name and description. If
the model decides it needs a deferred tool, it runs tool search, and only then
are the deferred tool definitions loaded into context. Only then will the model
call them. This saves tokens and preserves cache performance.

There are two modes:

- **Hosted tool search** is the simpler option. Use it when you already know
  which tools could be available for the request.
- **Client-executed tool search** is for cases where your app has to decide what
  tools are available, like based on the user's tenant, project, permissions, or
  internal registry.

**Start with hosted tool search** unless your app really needs to control
discovery itself.

Group your tools by user intent. Use namespaces or MCP servers when you can. It
is easier for the model to choose between a few clear groups than a long flat
list of functions. We recommend keeping each namespace under about 10 functions
for optimal token efficiency and model performance.

Keep namespace descriptions short and discriminative. Put the detailed
instructions inside the deferred tool definitions. Avoid making one giant
namespace for everything.

Use hosted tool search with deferred tools

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const billingLookupInvoice = {
  type: "function",
  name: "billing.lookup_invoice",
  description: "Look up invoice state, taxes, credits, and payment attempts.",
  parameters: {
    type: "object",
    properties: {
      invoice_id: { type: "string" },
    },
    required: ["invoice_id"],
    additionalProperties: false,
  },
  strict: true,
  defer_loading: true,
};

const crmGetAccount = {
  type: "function",
  name: "crm.get_account",
  description: "Fetch account owner, plan, health, and payment history.",
  parameters: {
    type: "object",
    properties: {
      account_id: { type: "string" },
    },
    required: ["account_id"],
    additionalProperties: false,
  },
  strict: true,
  defer_loading: true,
};

const response = await openai.responses.create({
  model: "gpt-5.5",
  input:
    "Find the right billing tool and explain why invoice INV-1043 still " +
    "shows overdue after a payment yesterday.",
  tools: [
    { type: "tool_search" },
    billingLookupInvoice,
    crmGetAccount,
  ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

billing_lookup_invoice = {
    "type": "function",
    "name": "billing.lookup_invoice",
    "description": "Look up invoice state, taxes, credits, and payment attempts.",
    "parameters": {
        "type": "object",
        "properties": {
            "invoice_id": {"type": "string"},
        },
        "required": ["invoice_id"],
        "additionalProperties": False,
    },
    "strict": True,
    "defer_loading": True,
}

crm_get_account = {
    "type": "function",
    "name": "crm.get_account",
    "description": "Fetch account owner, plan, health, and payment history.",
    "parameters": {
        "type": "object",
        "properties": {
            "account_id": {"type": "string"},
        },
        "required": ["account_id"],
        "additionalProperties": False,
    },
    "strict": True,
    "defer_loading": True,
}

response = client.responses.create(
    model="gpt-5.5",
    input=(
        "Find the right billing tool and explain why invoice INV-1043 still "
        "shows overdue after a payment yesterday."
    ),
    tools=[
        {"type": "tool_search"},
        billing_lookup_invoice,
        crm_get_account,
    ],
)

print(response.output_text)
```


## Leverage built-in tools

[Built-in tools](/mirror/api/docs/guides/tools) are the API's native capabilities.
Instead of building every tool yourself, you can give the model access to tools
that already work inside the Responses API. The model can then decide when to
use them.

OpenAI keeps adding more native tools, so start with built-in tools when they
fit your workflow. Build custom tools when native options do not cover the task.
Current built-in tools and related tool options include:

- **Web search**: Search the web for up-to-date information
- **File search**: Search uploaded files or vector stores
- **Code interpreter**: Run Python for analysis, math, charts, and file
  processing
- **Shell**: Run shell commands in a hosted container or your own runtime
- **Computer use**: Operate a UI through screenshots, clicks, typing, and
  scrolling
- **Image generation**: Generate or edit images
- **MCP/connectors**: Connect the model to external services and tools
- **Skills**: Attach reusable instruction bundles and workflow files
- **Apply patch**: Make structured code edits

There is also a model-quality reason to prefer them. Built-in tools are
in-distribution for our post-training, meaning that the models are trained and
evaluated around these tool shapes, behaviors, and outputs. With built-in tools,
OpenAI models support better tool selection, cleaner execution, and fewer
failures than with new tools.

## Leverage compaction

[Compaction](/mirror/api/docs/guides/compaction) is a context engineering tool: it
decides what information the model carries forward across many turns. In
long-running agents, the problem is not just, "Will I hit the context limit?" It
is that old messages, tool logs, retries, and stale details crowd out the state
the model needs.

Compaction gives you a controlled way to reduce context size while preserving
state needed for subsequent turns. After a meaningful milestone, like finishing
a debugging phase or narrowing a root cause, you can compact the prior window
and continue from the compacted output. This keeps the model sharp because the
next turn is built around the important state, not every intermediate reasoning,
failed command, and obsolete branch of reasoning.

There are two ways to leverage compaction:

- **Let the server handle it**: if you use `previous_response_id`, turn on
  `context_management` with a `compact_threshold`. The server will automatically
  compact the conversation when it gets too large. You keep sending only the
  newest user message.
- **Do it yourself**: if you manage the full input array yourself, call
  `client.responses.compact()`. It gives back a smaller context window. Use that
  returned output directly in the next `responses.create()` call.

**Do not edit the compacted output.** It is not a human summary, but the machine
state that helps the model continue. Pass it forward as-is, then add the next
user message.

Continue from compacted response state

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

// Full window collected from a long debugging session:
// user messages, assistant outputs, tool calls, and tool outputs.
const longWindow = sessionItems;

const compacted = await openai.responses.compact({
  model: "gpt-5.5",
  input: longWindow,
});

const nextResponse = await openai.responses.create({
  model: "gpt-5.5",
  store: false,
  input: [
    ...compacted.output, // Use compact output as-is.
    {
      type: "message",
      role: "user",
      content:
        "We found the bad cache invalidation path. Write the fix plan " +
        "and the verification checklist.",
    },
  ],
});

console.log(nextResponse.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

# Full window collected from a long debugging session:
# user messages, assistant outputs, tool calls, and tool outputs.
long_window = session_items

compacted = client.responses.compact(
    model="gpt-5.5",
    input=long_window,
)

next_response = client.responses.create(
    model="gpt-5.5",
    store=False,
    input=[
        *compacted.output,  # Use compact output as-is.
        {
            "type": "message",
            "role": "user",
            "content": (
                "We found the bad cache invalidation path. Write the fix plan "
                "and the verification checklist."
            ),
        },
    ],
)

print(next_response.output_text)
```


## Use `prompt_cache_key`

[Prompt caching](/mirror/api/docs/guides/prompt-caching) automatically reduces latency
and cost when requests reuse the same long prefix. For high-volume workflows,
set
[`prompt_cache_key`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-prompt_cache_key)
consistently for requests that share the same stable prefix.

The cache key is combined with the prompt prefix hash, so it helps route similar
requests to the same cache without changing the model input. Keep the key stable
for genuinely shared prefixes, and choose a granularity that avoids sending too
much traffic to one prefix-key pair. If one prefix and `prompt_cache_key`
combination exceeds about 15 requests per minute, requests may overflow to
additional machines and reduce cache effectiveness.

Route related requests to the same prompt cache

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const instructions = [
  "You are the support agent for Acme.",
  "Follow the Acme support policy and escalation rubric.",
  "Use the same tone, safety rules, and tool plan for each ticket.",
].join("\n");

const response = await openai.responses.create({
  model: "gpt-5.5",
  prompt_cache_key: "tenant-acme-support-agent",
  instructions,
  input: "Summarize the current escalation for the on-call lead.",
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

instructions = """
You are the support agent for Acme.
Follow the Acme support policy and escalation rubric.
Use the same tone, safety rules, and tool plan for each ticket.
"""

response = client.responses.create(
    model="gpt-5.5",
    prompt_cache_key="tenant-acme-support-agent",
    instructions=instructions,
    input="Summarize the current escalation for the on-call lead.",
)

print(response.output_text)
```


## Use `reasoning.encrypted_content`

Always round-trip reasoning items. This helps the model by allowing it to work
from its prior reasoning. If your [Zero Data Retention (ZDR)](/mirror/api/docs/guides/your-data#zero-data-retention) requirements do not allow
storing response data, this is where `reasoning.encrypted_content` is important.
`reasoning.encrypted_content` gives you a stateless handoff.

Add `reasoning.encrypted_content` to `include`, and reasoning items in the
response output will include encrypted reasoning content that can be passed back
into the next request. Your app does not need to understand that value. It just
keeps the reasoning item exactly as returned and sends it back during the next
turn, so the model can use it to continue the workflow.

Pass encrypted reasoning between stateless turns

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const first = await openai.responses.create({
  model: "gpt-5.5",
  store: false,
  reasoning: { effort: "medium" },
  include: ["reasoning.encrypted_content"],
  input: "Investigate why invoice INV-1043 has mismatched tax totals.",
});

const second = await openai.responses.create({
  model: "gpt-5.5",
  store: false,
  reasoning: { effort: "medium" },
  include: ["reasoning.encrypted_content"],
  input: [
    ...first.output,
    {
      role: "user",
      content: "Now write the customer-facing explanation in plain English.",
    },
  ],
});

console.log(second.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

first = client.responses.create(
    model="gpt-5.5",
    store=False,
    reasoning={"effort": "medium"},
    include=["reasoning.encrypted_content"],
    input="Investigate why invoice INV-1043 has mismatched tax totals.",
)

second = client.responses.create(
    model="gpt-5.5",
    store=False,
    reasoning={"effort": "medium"},
    include=["reasoning.encrypted_content"],
    input=[
        *first.output,
        {
            "role": "user",
            "content": "Now write the customer-facing explanation in plain English.",
        },
    ],
)

print(second.output_text)
```


## Use `background=True`

Use [`background=True`](/mirror/api/docs/guides/background) for requests that may take
a long time. Instead of keeping the client connection open, the API starts a job
and returns an ID. Your app can poll that job until it finishes, fails, or is
canceled. Use it for large analyses, long tool runs, or work that needs status
and retry behavior.

`background=True` **requires `store=True`**.

Run and poll a background response

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

let job = await openai.responses.create({
  model: "gpt-5.5",
  background: true,
  store: true,
  input: "Analyze this large log bundle and cluster the primary failure modes.",
  tools: [
    {
      type: "code_interpreter",
      container: {
        type: "auto",
        file_ids: [logBundleFileId],
      },
    },
  ],
});

while (["queued", "in_progress"].includes(job.status)) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  job = await openai.responses.retrieve(job.id);
}

console.log(job.output_text);
```

```python
from openai import OpenAI
import time

client = OpenAI()

job = client.responses.create(
    model="gpt-5.5",
    background=True,
    store=True,
    input="Analyze this large log bundle and cluster the primary failure modes.",
    tools=[
        {
            "type": "code_interpreter",
            "container": {
                "type": "auto",
                "file_ids": [log_bundle_file_id],
            },
        }
    ],
)

while job.status in {"queued", "in_progress"}:
    time.sleep(2)
    job = client.responses.retrieve(job.id)

print(job.output_text)
```


You can combine it with `stream=True` for progress events, but the first event
may take longer than a normal request.

From the UI perspective, background mode indicates, "This is running; here is
the status; the result will appear here when it's ready."

Note: `background=True` is not compatible with [Zero Data Retention](/mirror/api/docs/guides/your-data#zero-data-retention).

## Use WebSocket mode

[WebSocket mode](/mirror/api/docs/guides/websocket-mode) is built for long-running,
tool-call-heavy workflows where you keep a persistent connection open and
continue by sending only new input items plus `previous_response_id`. For
rollouts with 20 or more tool calls, this approach is roughly 40% faster
end-to-end.

**How this works**: The first message will look like a normal Responses request:
model, instructions, tools, and user input. The server streams events back. If
the model asks for a tool, your app runs the tool. Then, instead of sending a new
HTTP request, you send another `response.create` event on the same socket with
the prior `previous_response_id` and the new item. That is where the latency win
comes from. In plain HTTP, every follow-up is a fresh request. In WebSocket mode,
the connection stays open and the most recent response state stays warm in
memory on that connection. When the next turn continues from that response, the
backend has to do less setup work.

If your workflow is one request, one answer, then **keep HTTP**. If your
workflow behaves like a long-running agent, try WebSocket mode.

A single WebSocket connection handles one in-flight response at a time, so
parallel work needs multiple connections. Connections currently top out at 60
minutes. Continuation uses the same `previous_response_id` semantics as HTTP
mode, with a connection-local cache for the most recent response.

Note: WebSocket mode works with ZDR because your data is not stored to disk,
only stored in memory.

The default Python sample uses `websocket-client` (`pip install
websocket-client`). The JavaScript sample uses `ws` (`npm install ws`).

Start a Responses API WebSocket session

```javascript
import OpenAI from "openai";
import WebSocket from "ws";

const openai = new OpenAI();

const ws = new WebSocket("wss://api.openai.com/v1/responses", {
  headers: {
    Authorization: "Bearer " + openai.apiKey,
  },
});

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "response.create",
      model: "gpt-5.5",
      store: false,
      input: [
        {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Find the flaky test in this run, call the tools you need, " +
                "and keep going until you can explain the root cause.",
            },
          ],
        },
      ],
      tools: [testLogTool, codeSearchTool],
    })
  );
});

ws.on("message", (data) => {
  const firstEvent = JSON.parse(data.toString());
  console.log(firstEvent.type);
});
```

```python
from openai import OpenAI
from websocket import create_connection
import json

client = OpenAI()

ws = create_connection(
    "wss://api.openai.com/v1/responses",
    header=[f"Authorization: Bearer {client.api_key}"],
)

# Same request body you would send to client.responses.create(...).
ws.send(
    json.dumps(
        {
            "type": "response.create",
            "model": "gpt-5.5",
            "store": False,
            "input": [
                {
                    "type": "message",
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "Find the flaky test in this run, call the tools "
                                "you need, and keep going until you can explain "
                                "the root cause."
                            ),
                        }
                    ],
                }
            ],
            "tools": [test_log_tool, code_search_tool],
        }
    )
)

first_event = json.loads(ws.recv())
print(first_event["type"])
```


## Final takeaway

Responses API is the foundation for building smarter, more capable OpenAI
applications. The real advantage is that it lets developers move from one-off
prompts to durable, tool-using, context-aware workflows that can adapt to the
complexity of the task. Follow this guide to see higher performance in real
deployments.

:::
:::

