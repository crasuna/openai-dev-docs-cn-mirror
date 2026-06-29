---
title: "Reasoning models 推理模型"
description: "Learn how to use OpenAI reasoning models in the Responses API, choose a reasoning effort, manage reasoning tokens, and keep reasoning state across turns."
outline: deep
---

# Reasoning models 推理模型

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/reasoning](https://developers.openai.com/api/docs/guides/reasoning)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/reasoning.md](https://developers.openai.com/api/docs/guides/reasoning.md)
- 抓取时间：2026-06-27T05:54:07.465Z
- Checksum：`e92a55116aecb4a79bc50b92dab3c0ab635f3dd8acca1eab1cbe6603f3f3e414`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
像 [GPT-5.5](https://developers.openai.com/api/docs/models/gpt-5.5) 这样的 **reasoning models** 会在生成回复前使用内部 reasoning tokens。这有助于模型规划、有效使用工具、检查替代方案、从模糊性中恢复，并解决更困难的多步骤任务。Reasoning models 特别适合复杂问题求解、编码、科学推理和多步骤 agentic 工作流。它们也是 [Codex CLI](https://github.com/openai/codex)（我们的轻量级 coding agent）的最佳模型。

对于大多数 reasoning 工作负载，请从 `gpt-5.5` 开始。如果你需要最高智能的 API 选项来处理更具挑战性、可以容忍更高延迟的问题，请使用 [`gpt-5.5-pro`](https://developers.openai.com/api/docs/models/gpt-5.5-pro)。如需更低成本，请考虑 `gpt-5.4`；如需更低成本和更低延迟，请考虑 `gpt-5.4-mini`。

**Reasoning models 与 [Responses API](/mirror/api/docs/guides/migrate-to-responses) 配合效果更好**。虽然 Chat Completions API
  仍受支持，但使用 Responses 可以获得更好的模型智能和性能。

## 开始使用 reasoning

调用 [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create)，并指定你的 reasoning model 和 reasoning effort：

在 Responses API 中使用 reasoning model

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = `
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
`;

const response = await openai.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "low" },
    input: [
        {
            role: "user",
            content: prompt,
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
"""

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "low"},
    input=[
        {
            "role": "user", 
            "content": prompt
        }
    ]
)

print(response.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": {"effort": "low"},
    "input": [
      {
        "role": "user",
        "content": "Write a bash script that takes a matrix represented as a string with format \"[1,2],[3,4],[5,6]\" and prints the transpose in the same format."
      }
    ]
  }'
```


## Reasoning effort

`reasoning.effort` 参数会引导模型在执行任务时投入多少思考。

支持的值取决于模型，可能包括 `none`、`minimal`、`low`、`medium`、`high` 和 `xhigh`。较低 effort 偏向速度和更低 token 用量；较高 effort 下，模型会更完整地思考，以提供更高质量回复。模型也会在不同 reasoning efforts 下自适应 reasoning：简单任务使用更少 tokens，复杂任务则思考更深入。

默认值同样取决于模型，而不是全局统一。`gpt-5.5` 默认使用 `medium` reasoning effort。这是 `gpt-5.5` 在质量、可靠性和性能之间取得完整平衡的最佳起点。

| Effort   | 最适合...                                                                                                                                                                                                                                                                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `none`   | 对延迟极其敏感，且不受任何 reasoning 或多链路 tool calls 影响的任务。对于 `gpt-5.5` 的延迟敏感用例，我们建议先尝试 `low`，如果需要再切换到 `none`。&lt;br /&gt;&lt;br /&gt;常见用例包括语音、快速信息检索和分类。                                                                                           |
| `low`    | 高效 reasoning，并只增加适度延迟。适合需要 tool-use、规划、搜索或多步骤决策，同时优化速度和成本的用例。&lt;br /&gt;&lt;br /&gt;常见用例包括数据分析、起草、执行导向的编码，以及客户支持/聊天助手工作流。                                                                                                    |
| `medium` | 当质量和可靠性很重要，并且任务涉及规划、复杂 reasoning 和判断时使用。它是大多数工作负载的默认配置，也是延迟、性能和成本 pareto curve 上的均衡点。&lt;br /&gt;&lt;br /&gt;常见用例包括 agentic coding、研究、处理 spreadsheets & slides，以及委派长周期工作。                                                   |
| `high`   | 困难 reasoning、复杂调试、深度规划，以及质量和智能比延迟更重要的高价值任务。推荐用于复杂工作流和 agentic 任务。&lt;br /&gt;&lt;br /&gt;常见用例包括 agentic coding、长周期研究和知识工作。请根据任务复杂度同时评估 `medium` 和 `high`。                                                                       |
| `xhigh`  | 深度研究、异步工作流，以及需要很长 rollout 的 agentic 任务。只有当你的 evals 显示其收益明确足以证明额外延迟和成本合理时才使用。&lt;br /&gt;&lt;br /&gt;常见用例包括安全和代码审查、企业生产力、更深入的研究任务，以及有挑战性的编码工作流。                                                                 |

对于延迟敏感应用，如果希望更快看到首个可见 token，可以要求模型在继续深入 reasoning 前生成一个简短 preamble。

有些模型只支持这些值的一个子集，因此在选择设置前，请查看相关[模型页面](https://developers.openai.com/api/docs/models)。

## Reasoning 如何工作

Reasoning models 在输入和输出 tokens 之外引入 **reasoning tokens**。模型使用这些 reasoning tokens 来“思考”，拆解 prompt 并考虑生成回复的多种方法。像 gpt-5.5 和 gpt-5.4 这样的 reasoning models 支持 interleaved thinking，也就是模型能够在思考前后以及思考之间生成可见 output tokens，并能在 tool calls 之间思考。

下面是用户和助手之间多步骤对话的示例。每一步的 input 和 output tokens 会被带入后续上下文，而 reasoning tokens 会被丢弃。

![Reasoning tokens aren't retained in context](https://cdn.openai.com/API/docs/images/context-window.png)

虽然 reasoning tokens 无法通过 API 看到，但它们仍会占用
  模型 context window 中的空间，并按 [output tokens](https://openai.com/api/pricing) 计费。

### 管理 context window

创建 responses 时，务必确保 context window 中有足够空间容纳 reasoning tokens。根据问题复杂度，模型可能会生成从几百到数万不等的 reasoning tokens。使用的 reasoning tokens 的确切数量可在 [response object 的 usage object](https://developers.openai.com/api/docs/api-reference/responses/object) 中的 `output_tokens_details` 下看到：

```json
{
  "usage": {
    "input_tokens": 75,
    "input_tokens_details": {
      "cached_tokens": 0
    },
    "output_tokens": 1186,
    "output_tokens_details": {
      "reasoning_tokens": 1024
    },
    "total_tokens": 1261
  }
}
```

Context window 长度可在[模型参考页面](https://developers.openai.com/api/docs/models)找到，并且会因模型 snapshot 不同而异。

### 控制成本

要管理 reasoning models 的成本，可以使用
[`max_output_tokens`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-max_output_tokens)
参数限制模型生成的 token 总数，包括 reasoning tokens、可见 output tokens 和不可见 formatting tokens。关于 generated tokens 如何反映在 usage 和 output limits 中，请参阅 [output token counts](/mirror/api/docs/guides/token-counting#understand-output-token-counts)。

### 为 reasoning 分配空间

如果 generated tokens 达到 context window 限制或你设置的 `max_output_tokens` 值，你会收到一个 `status` 为 `incomplete` 的 response，并且 `incomplete_details` 中的 `reason` 设置为 `max_output_tokens`。这可能发生在任何可见 output tokens 生成之前，这意味着你可能会为 input 和 reasoning tokens 产生费用，却收不到可见回复。

为避免这种情况，请确保 context window 中有足够空间，或将 `max_output_tokens` 值调高。OpenAI 建议，在你刚开始试用这些模型时，至少为 reasoning 和 outputs 预留 25,000 tokens。随着你熟悉 prompts 所需的 reasoning tokens 数量，可以相应调整该缓冲区。

处理 incomplete responses

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = `
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
`;

const response = await openai.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "medium" },
    input: [
        {
            role: "user",
            content: prompt,
        },
    ],
    max_output_tokens: 300,
});

if (
    response.status === "incomplete" &&
    response.incomplete_details.reason === "max_output_tokens"
) {
    console.log("Ran out of tokens");
    if (response.output_text?.length > 0) {
        console.log("Partial output:", response.output_text);
    } else {
        console.log("Ran out of tokens during reasoning");
    }
}
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
"""

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "medium"},
    input=[
        {
            "role": "user", 
            "content": prompt
        }
    ],
    max_output_tokens=300,
)

if response.status == "incomplete" and response.incomplete_details.reason == "max_output_tokens":
    print("Ran out of tokens")
    if response.output_text:
        print("Partial output:", response.output_text)
    else: 
        print("Ran out of tokens during reasoning")
```


### 将 reasoning items 保留在上下文中

在 [Responses API](https://developers.openai.com/api/docs/api-reference/responses) 中使用 reasoning model 进行 [function calling](/mirror/api/docs/guides/function-calling) 时，我们强烈建议你把上一次 function call 返回的任何 reasoning items 传回去（同时传回你的函数输出）。如果模型连续调用多个函数，你应传回自上一条 `user` message 以来的所有 reasoning items、function call items 和 function call output items。这样可以让模型继续其 reasoning 过程，以最节省 token 的方式产出更好结果。

最简单的方法是把之前 response 中的所有 reasoning items 传入下一个请求。我们的系统会智能地忽略与你的 functions 无关的 reasoning items，并只保留上下文中相关的 items。你可以使用 `previous_response_id` 参数传递之前 responses 中的 reasoning items，也可以手动将过往 response 中的所有 [output](https://developers.openai.com/api/docs/api-reference/responses/object#responses/object-output) items 作为新请求的 [input](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-input) 传入。

对于你可能会在传给下一个 response 之前截断和优化部分 context window 的高级用例，只需确保最后一条 user message 和你的 function call output 之间的所有 items 原样传入下一个 response。这样可以确保模型拥有所需的全部上下文。

请查看[本指南](/mirror/api/docs/guides/conversation-state)，了解更多手动 context management 信息。

### 加密 reasoning items

在无状态模式下使用 Responses API 时（`store` 设置为 `false`，或组织已加入 zero data retention 时），你仍必须使用上述技术在 conversation turns 之间保留 reasoning items。但为了让 reasoning items 能随后的 API 请求一起发送，你的每个 API 请求都必须在 API 请求的 `include` 参数中包含 `reasoning.encrypted_content`，如下所示：

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": {"effort": "medium"},
    "input": "What is the weather like today?",
    "tools": [ ... function config here ... ],
    "include": [ "reasoning.encrypted_content" ]
  }'
```


`output` 数组中的任何 reasoning items 现在都会有一个 `encrypted_content` 属性，其中包含可随未来 conversation turns 传递的加密 reasoning tokens。

## Reasoning summaries

虽然我们不会暴露模型发出的原始 reasoning tokens，但你可以使用 `summary` 参数查看模型 reasoning 的摘要。请参阅我们的[模型文档](https://developers.openai.com/api/docs/models)，确认哪些 reasoning models 支持 summaries。

不同模型支持不同的 reasoning summary 设置。例如，我们的 computer use model 支持 `concise` summarizer，而 o4-mini 支持 `detailed`。要访问某个模型可用的最详细 summarizer，请将此参数值设置为 `auto`。对今天的大多数 reasoning models 来说，`auto` 等价于 `detailed`，但未来可能会有更细粒度的设置。

Reasoning summary output 是 `reasoning` [output item](https://developers.openai.com/api/docs/api-reference/responses/object#responses/object-output) 中 `summary` 数组的一部分。除非你明确选择包含 reasoning summaries，否则不会包含该输出。

下面的示例展示如何发起包含 reasoning summary 的 API 请求。

在 API response 中包含 reasoning summary

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5.5",
  input: "What is the capital of France?",
  reasoning: {
    effort: "low",
    summary: "auto",
  },
});

console.log(response.output);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="What is the capital of France?",
    reasoning={
        "effort": "low",
        "summary": "auto"
    }
)

print(response.output)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": "What is the capital of France?",
    "reasoning": {
        "effort": "low",
        "summary": "auto"
    }
  }'
```


此 API 请求会返回一个 output array，其中同时包含 assistant message 和用于生成该回复的模型 reasoning summary。

```json
[
  {
    "id": "rs_6876cf02e0bc8192b74af0fb64b715ff06fa2fcced15a5ac",
    "type": "reasoning",
    "summary": [
      {
        "type": "summary_text",
        "text": "**Answering a simple question**\n\nI\u2019m looking at a straightforward question: the capital of France is Paris. It\u2019s a well-known fact, and I want to keep it brief and to the point. Paris is known for its history, art, and culture, so it might be nice to add just a hint of that charm. But mostly, I\u2019ll aim to focus on delivering a clear and direct answer, ensuring the user gets what they\u2019re looking for without any extra fluff."
      }
    ]
  },
  {
    "id": "msg_6876cf054f58819284ecc1058131305506fa2fcced15a5ac",
    "type": "message",
    "status": "completed",
    "content": [
      {
        "type": "output_text",
        "annotations": [],
        "logprobs": [],
        "text": "The capital of France is Paris."
      }
    ],
    "role": "assistant"
  }
]
```

在对我们最新的 reasoning models 使用 summarizers 之前，你可能需要
  完成[组织 验证](https://help.openai.com/en/articles/10910291-api-organization-verification)，
  以确保安全部署。可在 [platform settings page](https://platform.openai.com/settings/organization/general) 开始验证。

## `phase` 参数

对于 Responses API 中使用 GPT-5.5 和 GPT-5.4 的长时间运行或重工具调用流程，请使用 assistant message `phase` 字段，避免过早停止和其他异常行为。
`phase` 在 API 层面是可选的，但 OpenAI 建议使用它。对中间 assistant updates 使用 `phase: "commentary"`，例如 tool calls 前的 preambles；对完成答案使用 `phase: "final_answer"`。不要向 user messages 添加 `phase`。
使用 `previous_response_id` 通常是最简单的路径，因为 prior assistant state 会被保留。如果你手动重放 assistant history，请保留每个原始 `phase` 值。
缺失或被丢弃的 `phase` 可能导致这些工作流中的 preambles 被当作 final answers。关于特定模型的 prompt 指导，请参阅 [Prompting GPT-5.5](/mirror/api/docs/guides/prompt-guidance#phase-parameter)。

### 往返 assistant phase 值

往返 assistant phase 值

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "assistant",
      phase: "commentary",
      content:
        "I’ll inspect the logs and then summarize root cause and remediation.",
    },
    {
      role: "assistant",
      phase: "final_answer",
      content: "Root cause: cache invalidation race.",
    },
    {
      role: "user",
      content: "Great—now give me a rollout-safe fix plan.",
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
            "role": "assistant",
            "phase": "commentary",
            "content": "I’ll inspect the logs and then summarize root cause and remediation.",
        },
        {
            "role": "assistant",
            "phase": "final_answer",
            "content": "Root cause: cache invalidation race.",
        },
        {
            "role": "user",
            "content": "Great—now give me a rollout-safe fix plan.",
        },
    ],
)

print(response.output_text)
```


## Prompt 建议

提示 reasoning model 时，需要考虑一些差异。具备 reasoning 能力的 GPT-5 models 通常在你给出清晰目标、强约束和明确输出契约时表现最好，而不需要规定每个中间步骤。

- 给模型任务、约束和期望输出格式。
- 将 `reasoning.effort` 视为调优旋钮，而不是恢复质量的主要方式。
- 对于 agentic 或研究密集型工作流，定义什么算完成，以及模型应如何验证自己的工作。

关于使用 reasoning models 的最佳实践，请[参阅本指南](/mirror/api/docs/guides/reasoning-best-practices)。

### Prompt examples




Coding (refactoring)


Coding (planning)


STEM Research




## 用例示例

可以在 [the cookbook](https://developers.openai.com/cookbook) 中找到一些在真实用例中使用 reasoning models 的示例。

&lt;a
  href="https://cookbook.openai.com/examples/o1/using_reasoning_for_data_validation"
  target="_blank"
  rel="noreferrer"
&gt;
  



    评估合成医疗数据集中的差异。




&lt;a
  href="https://cookbook.openai.com/examples/o1/using_reasoning_for_routine_generation"
  target="_blank"
  rel="noreferrer"
&gt;
  



    使用帮助中心文章生成 agent 可以执行的操作。




:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
**Reasoning models** like [GPT-5.5](https://developers.openai.com/api/docs/models/gpt-5.5) use internal reasoning tokens before producing a response. This helps the model plan, use tools effectively, inspect alternatives, recover from ambiguity, and solve harder multi-step tasks. Reasoning models work especially well for complex problem solving, coding, scientific reasoning, and multi-step agentic workflows. They're also the best models for [Codex CLI](https://github.com/openai/codex), our lightweight coding agent.

Start with `gpt-5.5` for most reasoning workloads. If you need the highest-intelligence API option for more challenging problems that can tolerate more latency, use [`gpt-5.5-pro`](https://developers.openai.com/api/docs/models/gpt-5.5-pro). For lower cost, consider `gpt-5.4` and for lower cost and latency, consider `gpt-5.4-mini`.

**Reasoning models work better with the [Responses
  API](https://developers.openai.com/api/docs/guides/migrate-to-responses)**. While the Chat Completions API
  is still supported, you'll get improved model intelligence and performance by
  using Responses.

## Get started with reasoning

Call the [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create) and specify your reasoning model and reasoning effort:

Using a reasoning model in the Responses API

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = `
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
`;

const response = await openai.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "low" },
    input: [
        {
            role: "user",
            content: prompt,
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
"""

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "low"},
    input=[
        {
            "role": "user", 
            "content": prompt
        }
    ]
)

print(response.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": {"effort": "low"},
    "input": [
      {
        "role": "user",
        "content": "Write a bash script that takes a matrix represented as a string with format \"[1,2],[3,4],[5,6]\" and prints the transpose in the same format."
      }
    ]
  }'
```


## Reasoning effort

The `reasoning.effort` parameter guides the model on how much to think when performing a task.

Supported values are model-dependent and can include `none`, `minimal`, `low`, `medium`, `high`, and `xhigh`. Lower effort favors speed and lower token usage, while at higher effort the model thinks more completely to provide higher quality responses. The models also reason adaptively across reasoning efforts, using fewer tokens for simpler tasks and thinking harder for complex tasks.

Defaults are also model-dependent rather than universal. `gpt-5.5` defaults to `medium` reasoning effort. This is the best starting point for `gpt-5.5`’s full balance of quality, reliability and performance.

| Effort   | Best for...                                                                                                                                                                                                                                                                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `none`   | Latency-critical tasks that do not benefit from any reasoning or multi-chained tool calls. For latency-sensitive use cases with `gpt-5.5`, we recommend trying `low` to begin with and then moving to `none` if required.<br /><br />Common use cases include voice, fast information retrieval, and classification.                                                 |
| `low`    | Efficient reasoning with a modest latency increase. Ideal for use cases requiring tool-use, planning, search, or multi-step decision making, while optimizing for speed and cost.<br /><br />Common use cases include data analysis, drafting, execution-oriented coding, and customer support / chat assistant workflows.                                           |
| `medium` | When quality and reliability matter, and the task involves planning, complex reasoning, and judgement. Default configuration for most workloads, and a well-balanced point on the pareto curve of latency, performance and cost.<br /><br />Common use cases include agentic coding, research, working with spreadsheets & slides, and delegating long-horizon work. |
| `high`   | Hard reasoning, complex debugging, deep planning, and high-value tasks where quality and intelligence matters more than latency. Recommended for complex workflows and agentic tasks.<br /><br />Common use cases include agentic coding, long-horizon research, and knowledge work. Depending on the complexity of the task, evaluate both `medium` and `high`.     |
| `xhigh`  | Deep research, asynchronous workflows and agentic tasks that require very long rollouts. Only use when your evals show a clear benefit that justifies the extra latency and cost.<br /><br />Common use cases include security and code review, enterprise productivity, deeper research tasks, and challenging coding workflows.                                    |

For faster time to first visible token in latency-sensitive applications, ask the model to generate a short preamble before continuing with deeper reasoning.

Some models support only a subset of these values, so check the relevant [model page](https://developers.openai.com/api/docs/models) before choosing a setting.

## How reasoning works

Reasoning models introduce **reasoning tokens** in addition to input and output tokens. The models use these reasoning tokens to "think," breaking down the prompt and considering multiple approaches to generating a response. Our reasoning models like gpt-5.5 and gpt-5.4 support interleaved thinking, where the model is able to generate visible output tokens before and in between thinking, and is able to think in between tool calls.

Here is an example of a multi-step conversation between a user and an assistant. Input and output tokens from each step are carried over, while reasoning tokens are discarded.

![Reasoning tokens aren't retained in context](https://cdn.openai.com/API/docs/images/context-window.png)

While reasoning tokens are not visible via the API, they still occupy space in
  the model's context window and are billed as [output
  tokens](https://openai.com/api/pricing).

### Managing the context window

It's important to ensure there's enough space in the context window for reasoning tokens when creating responses. Depending on the problem's complexity, the models may generate anywhere from a few hundred to tens of thousands of reasoning tokens. The exact number of reasoning tokens used is visible in the [usage object of the response object](https://developers.openai.com/api/docs/api-reference/responses/object), under `output_tokens_details`:

```json
{
  "usage": {
    "input_tokens": 75,
    "input_tokens_details": {
      "cached_tokens": 0
    },
    "output_tokens": 1186,
    "output_tokens_details": {
      "reasoning_tokens": 1024
    },
    "total_tokens": 1261
  }
}
```

Context window lengths are found on the [model reference page](https://developers.openai.com/api/docs/models), and will differ across model snapshots.

### Controlling costs

To manage costs with reasoning models, you can limit the total number of tokens the
model generates, including reasoning tokens, visible output tokens, and non-visible
formatting tokens, by using the
[`max_output_tokens`](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-max_output_tokens)
parameter. See [output token counts](https://developers.openai.com/api/docs/guides/token-counting#understand-output-token-counts) for details about how generated tokens are reflected in usage and output limits.

### Allocating space for reasoning

If the generated tokens reach the context window limit or the `max_output_tokens` value you've set, you'll receive a response with a `status` of `incomplete` and `incomplete_details` with `reason` set to `max_output_tokens`. This might occur before any visible output tokens are produced, meaning you could incur costs for input and reasoning tokens without receiving a visible response.

To prevent this, ensure there's sufficient space in the context window or adjust the `max_output_tokens` value to a higher number. OpenAI recommends reserving at least 25,000 tokens for reasoning and outputs when you start experimenting with these models. As you become familiar with the number of reasoning tokens your prompts require, you can adjust this buffer accordingly.

Handling incomplete responses

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = `
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
`;

const response = await openai.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "medium" },
    input: [
        {
            role: "user",
            content: prompt,
        },
    ],
    max_output_tokens: 300,
});

if (
    response.status === "incomplete" &&
    response.incomplete_details.reason === "max_output_tokens"
) {
    console.log("Ran out of tokens");
    if (response.output_text?.length > 0) {
        console.log("Partial output:", response.output_text);
    } else {
        console.log("Ran out of tokens during reasoning");
    }
}
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
"""

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "medium"},
    input=[
        {
            "role": "user", 
            "content": prompt
        }
    ],
    max_output_tokens=300,
)

if response.status == "incomplete" and response.incomplete_details.reason == "max_output_tokens":
    print("Ran out of tokens")
    if response.output_text:
        print("Partial output:", response.output_text)
    else: 
        print("Ran out of tokens during reasoning")
```


### Keeping reasoning items in context

When doing [function calling](https://developers.openai.com/api/docs/guides/function-calling) with a reasoning model in the [Responses API](https://developers.openai.com/api/docs/api-reference/responses), we highly recommend you pass back any reasoning items returned with the last function call (in addition to the output of your function). If the model calls multiple functions consecutively, you should pass back all reasoning items, function call items, and function call output items, since the last `user` message. This allows the model to continue its reasoning process to produce better results in the most token-efficient manner.

The simplest way to do this is to pass in all reasoning items from a previous response into the next one. Our systems will smartly ignore any reasoning items that aren't relevant to your functions, and only retain those in context that are relevant. You can pass reasoning items from previous responses either using the `previous_response_id` parameter, or by manually passing in all the [output](https://developers.openai.com/api/docs/api-reference/responses/object#responses/object-output) items from a past response into the [input](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-input) of a new one.

For advanced use cases where you might be truncating and optimizing parts of the context window before passing them on to the next response, just ensure all items between the last user message and your function call output are passed into the next response untouched. This will ensure that the model has all the context it needs.

Check out [this guide](https://developers.openai.com/api/docs/guides/conversation-state) to learn more about manual context management.

### Encrypted reasoning items

When using the Responses API in a stateless mode (either with `store` set to `false`, or when an organization is enrolled in zero data retention), you must still retain reasoning items across conversation turns using the techniques described above. But in order to have reasoning items that can be sent with subsequent API requests, each of your API requests must have `reasoning.encrypted_content` in the `include` parameter of API requests, like so:

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": {"effort": "medium"},
    "input": "What is the weather like today?",
    "tools": [ ... function config here ... ],
    "include": [ "reasoning.encrypted_content" ]
  }'
```


Any reasoning items in the `output` array will now have an `encrypted_content` property, which will contain encrypted reasoning tokens that can be passed along with future conversation turns.

## Reasoning summaries

While we don't expose the raw reasoning tokens emitted by the model, you can view a summary of the model's reasoning using the `summary` parameter. See our [model documentation](https://developers.openai.com/api/docs/models) to check which reasoning models support summaries.

Different models support different reasoning summary settings. For example, our computer use model supports the `concise` summarizer, while o4-mini supports `detailed`. To access the most detailed summarizer available for a model, set the value of this parameter to `auto`. `auto` will be equivalent to `detailed` for most reasoning models today, but there may be more granular settings in the future.

Reasoning summary output is part of the `summary` array in the `reasoning` [output item](https://developers.openai.com/api/docs/api-reference/responses/object#responses/object-output). This output will not be included unless you explicitly opt in to including reasoning summaries.

The example below shows how to make an API request that includes a reasoning summary.

Include a reasoning summary with the API response

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5.5",
  input: "What is the capital of France?",
  reasoning: {
    effort: "low",
    summary: "auto",
  },
});

console.log(response.output);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="What is the capital of France?",
    reasoning={
        "effort": "low",
        "summary": "auto"
    }
)

print(response.output)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": "What is the capital of France?",
    "reasoning": {
        "effort": "low",
        "summary": "auto"
    }
  }'
```


This API request will return an output array with both an assistant message and a summary of the model's reasoning in generating that response.

```json
[
  {
    "id": "rs_6876cf02e0bc8192b74af0fb64b715ff06fa2fcced15a5ac",
    "type": "reasoning",
    "summary": [
      {
        "type": "summary_text",
        "text": "**Answering a simple question**\n\nI\u2019m looking at a straightforward question: the capital of France is Paris. It\u2019s a well-known fact, and I want to keep it brief and to the point. Paris is known for its history, art, and culture, so it might be nice to add just a hint of that charm. But mostly, I\u2019ll aim to focus on delivering a clear and direct answer, ensuring the user gets what they\u2019re looking for without any extra fluff."
      }
    ]
  },
  {
    "id": "msg_6876cf054f58819284ecc1058131305506fa2fcced15a5ac",
    "type": "message",
    "status": "completed",
    "content": [
      {
        "type": "output_text",
        "annotations": [],
        "logprobs": [],
        "text": "The capital of France is Paris."
      }
    ],
    "role": "assistant"
  }
]
```

Before using summarizers with our latest reasoning models, you may need to
  complete [organization
  verification](https://help.openai.com/en/articles/10910291-api-organization-verification)
  to ensure safe deployment. Get started with verification on the [platform
  settings page](https://platform.openai.com/settings/organization/general).

## `phase` parameter

For long-running or tool-heavy flows with GPT-5.5 and GPT-5.4 in the Responses API, use the assistant message `phase` field to avoid early stopping and other misbehavior.
`phase` is optional at the API level, but OpenAI recommends using it. Use `phase: "commentary"` for intermediate assistant updates, such as preambles before tool calls, and `phase: "final_answer"` for the completed answer. Don't add `phase` to user messages.
Using `previous_response_id` is usually the simplest path because prior assistant state is preserved. If you replay assistant history manually, preserve each original `phase` value.
Missing or dropped `phase` can cause preambles to be treated as final answers in those workflows. For model-specific prompt guidance, see [Prompting GPT-5.5](https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5#phase-parameter).

### Round-trip assistant phase values

Round-trip assistant phase values

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "assistant",
      phase: "commentary",
      content:
        "I’ll inspect the logs and then summarize root cause and remediation.",
    },
    {
      role: "assistant",
      phase: "final_answer",
      content: "Root cause: cache invalidation race.",
    },
    {
      role: "user",
      content: "Great—now give me a rollout-safe fix plan.",
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
            "role": "assistant",
            "phase": "commentary",
            "content": "I’ll inspect the logs and then summarize root cause and remediation.",
        },
        {
            "role": "assistant",
            "phase": "final_answer",
            "content": "Root cause: cache invalidation race.",
        },
        {
            "role": "user",
            "content": "Great—now give me a rollout-safe fix plan.",
        },
    ],
)

print(response.output_text)
```


## Advice on prompting

There are some differences to consider when prompting a reasoning model. Reasoning-capable GPT-5 models usually work best when you give them a clear goal, strong constraints, and an explicit output contract without prescribing every intermediate step.

- Give the model the task, constraints, and desired output format.
- Treat `reasoning.effort` as a tuning knob, not the primary way to recover quality.
- For agentic or research-heavy workflows, define what counts as done and how the model should verify its work.

For more information on best practices when using reasoning models, [refer to this guide](https://developers.openai.com/api/docs/guides/reasoning-best-practices).

### Prompt examples



<div data-content-switcher-pane data-value="refactoring">
    <div class="hidden">Coding (refactoring)</div>
    </div>
  <div data-content-switcher-pane data-value="planning" hidden>
    <div class="hidden">Coding (planning)</div>
    </div>
  <div data-content-switcher-pane data-value="research" hidden>
    <div class="hidden">STEM Research</div>
    </div>



## Use case examples

Some examples of using reasoning models for real-world use cases can be found in [the cookbook](https://developers.openai.com/cookbook).

<a
  href="https://cookbook.openai.com/examples/o1/using_reasoning_for_data_validation"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Evaluate a synthetic medical data set for discrepancies.


</a>

<a
  href="https://cookbook.openai.com/examples/o1/using_reasoning_for_routine_generation"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Use help center articles to generate actions that an agent could perform.


</a>
``````
:::
:::

