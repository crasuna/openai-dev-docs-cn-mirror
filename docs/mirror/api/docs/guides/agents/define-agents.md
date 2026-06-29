---
title: "Agent 定义"
description: "Learn how to define an agent's instructions, model, tools, and local context in the OpenAI Agents SDK."
outline: deep
---

# Agent 定义

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agents/define-agents](https://developers.openai.com/api/docs/guides/agents/define-agents)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agents/define-agents.md](https://developers.openai.com/api/docs/guides/agents/define-agents.md)
- 抓取时间：2026-06-27T05:53:58.160Z
- Checksum：`ec905d77ac0d63a9575fc78675358eca3a859d62802c1ac60d69473368df985a`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
agent 是基于 SDK 的工作流中的核心单元。它把模型、指令和可选的运行时行为打包在一起，例如工具、guardrails、MCP 服务器、handoffs 和结构化输出。

## agent 上应包含什么

将 agent 配置用于该专家本身固有的决策：

| 属性                                                                                                              | 用途                                                        | 继续阅读                                                                                 |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `name`                                                                                                            | 在 traces 和工具/handoff 界面中的人类可读身份               | 本页                                                                                     |
| `instructions`                                                                                                    | 该 agent 的任务、约束和风格                                 | 本页                                                                                     |
| `prompt`                                                                                                          | 用于基于 Responses 的运行的已存储 prompt 配置               | [模型和提供方](/mirror/api/docs/guides/agents/models)              |
| `model` 和模型设置                                                                                                | 选择模型并调优行为                                          | [模型和提供方](/mirror/api/docs/guides/agents/models)              |
| `tools`                                                                                                           | agent 可直接调用的能力                                      | [使用工具](/mirror/api/docs/guides/tools#usage-in-the-agents-sdk)   |
| | 提示何时应将任务委派给另一个 agent                  | [编排和 handoffs](/mirror/api/docs/guides/agents/orchestration)      |
| `handoffs`                                                                                                        | 委派给另一个 agent                                          | [编排和 handoffs](/mirror/api/docs/guides/agents/orchestration)      |
| | 返回结构化输出而不是纯文本                           | 本页                                                                                     |
| Guardrails 和审批                                                                                                  | 验证、阻止和审核流程                                        | [Guardrails 和人工审核](/mirror/api/docs/guides/agents/guardrails-approvals) |
| MCP 服务器和托管 MCP 工具                                                                                         | 附加由 MCP 支持的能力                                       | [集成和可观测性](/mirror/api/docs/guides/agents/integrations-observability#mcp) |

## 从一个聚焦的 agent 开始

定义能够承担明确任务的最小 agent。只有当你需要独立职责、不同指令、不同工具界面或不同审批策略时，才添加更多 agent。

定义单个 agent

```typescript
import { Agent, tool } from "@openai/agents";
import { z } from "zod";

const getWeather = tool({
  name: "get_weather",
  description: "Return the weather for a given city.",
  parameters: z.object({ city: z.string() }),
  async execute({ city }) {
    return `The weather in ${city} is sunny.`;
  },
});

const agent = new Agent({
  name: "Weather bot",
  instructions: "You are a helpful weather bot.",
  model: "gpt-5.5",
  tools: [getWeather],
});
```

```python
from agents import Agent, function_tool


@function_tool
def get_weather(city: str) -> str:
    """Return the weather for a given city."""
    return f"The weather in {city} is sunny."


agent = Agent(
    name="Weather bot",
    instructions="You are a helpful weather bot.",
    model="gpt-5.5",
    tools=[get_weather],
)
```


## 塑造指令、handoffs 和输出

有三个配置选择值得格外关注：

- 从静态 `instructions` 开始。当指导内容依赖当前用户、租户或运行时上下文时，改用动态 instructions 回调，而不是在调用点拼接字符串。
- 保持简短而具体，以便路由 agent 知道何时选择这个专家。
- 当下游代码需要类型化数据而不是自由形式文本时使用。

返回结构化输出

```typescript
import { Agent, run } from "@openai/agents";
import { z } from "zod";

const calendarEvent = z.object({
  name: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
});

const agent = new Agent({
  name: "Calendar extractor",
  instructions: "Extract calendar events from text.",
  outputType: calendarEvent,
});

const result = await run(
  agent,
  "Dinner with Priya and Sam on Friday.",
);

console.log(result.finalOutput);
```

```python
import asyncio

from pydantic import BaseModel

from agents import Agent, Runner


class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]


agent = Agent(
    name="Calendar extractor",
    instructions="Extract calendar events from text.",
    output_type=CalendarEvent,
)


async def main() -> None:
    result = await Runner.run(
        agent,
        "Dinner with Priya and Sam on Friday.",
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


当你想引用 Responses API 中已存储的 prompt 配置，而不是把整个 system prompt 嵌入代码时，请使用 `prompt`。

## 将本地上下文与模型上下文分开

SDK 允许你把应用状态和依赖传入一次运行，而不把它们发送给模型。可将此用于已认证用户信息、数据库客户端、logger 和 helper 函数等数据。

将本地上下文传给工具

```typescript
import { Agent, RunContext, run, tool } from "@openai/agents";
import { z } from "zod";

interface UserInfo {
  name: string;
  uid: number;
}

const fetchUserAge = tool({
  name: "fetch_user_age",
  description: "Return the age of the current user.",
  parameters: z.object({}),
  async execute(_args, runContext?: RunContext<UserInfo>) {
    return `User ${runContext?.context.name} is 47 years old`;
  },
});

const agent = new Agent<UserInfo>({
  name: "Assistant",
  tools: [fetchUserAge],
});

const result = await run(agent, "What is the age of the user?", {
  context: { name: "John", uid: 123 },
});

console.log(result.finalOutput);
```

```python
import asyncio
from dataclasses import dataclass

from agents import Agent, RunContextWrapper, Runner, function_tool


@dataclass
class UserInfo:
    name: str
    uid: int


@function_tool
async def fetch_user_age(wrapper: RunContextWrapper[UserInfo]) -> str:
    """Fetch the age of the current user."""
    return f"The user {wrapper.context.name} is 47 years old."


agent = Agent[UserInfo](
    name="Assistant",
    tools=[fetch_user_age],
)


async def main() -> None:
    result = await Runner.run(
        agent,
        "What is the age of the user?",
        context=UserInfo(name="John", uid=123),
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


重要边界是：

- 对话历史是模型能看到的内容。
- 运行上下文是你的代码能看到的内容。

如果模型需要某个事实，请把它放在 instructions、input、retrieval 或工具中。如果只有你的运行时需要它，请把它保留在本地上下文中。

## 何时将一个 agent 拆分为多个

当一个专家不应独自拥有完整回复，或独立能力之间存在实质差异时，请拆分 agent。常见原因包括：

- 某个专家需要不同的工具或 MCP 界面。
- 某个专家需要不同的审批策略或 guardrail。
- 工作流的某个分支需要不同的模型或输出风格。
- 你希望在 traces 中显式看到路由，而不是使用一个大型 prompt。

## 后续步骤

一旦干净地定义了一个专家，请继续阅读与你下一个设计问题相匹配的指南。


  &lt;a
    href="/api/docs/guides/agents/models"
    class="block no-underline hover:no-underline"
  &gt;
    



      为这个 agent 选择模型、默认值和传输策略。



  &lt;a
    href="/api/docs/guides/tools#usage-in-the-agents-sdk"
    class="block no-underline hover:no-underline"
  &gt;
    



      添加 agent 可直接调用的能力。



  &lt;a
    href="/api/docs/guides/agents/orchestration"
    class="block no-underline hover:no-underline"
  &gt;
    



      当一个 agent 不再足够时，选择多个专家如何协作。



  &lt;a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  &gt;
    



      理解运行时循环、状态和流式传输行为。





:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
An agent is the core unit of an SDK-based workflow. It packages a model, instructions, and optional runtime behavior such as tools, guardrails, MCP servers, handoffs, and structured outputs.

## What belongs on an agent

Use agent configuration for decisions that are intrinsic to that specialist:

| Property                                                                                                          | Use it for                                                  | Read next                                                                                |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `name`                                                                                                            | Human-readable identity in traces and tool/handoff surfaces | This page                                                                                |
| `instructions`                                                                                                    | The job, constraints, and style for that agent              | This page                                                                                |
| `prompt`                                                                                                          | Stored prompt configuration for Responses-based runs        | [Models and providers](https://developers.openai.com/api/docs/guides/agents/models)                                   |
| `model` and model settings                                                                                        | Choosing the model and tuning behavior                      | [Models and providers](https://developers.openai.com/api/docs/guides/agents/models)                                   |
| `tools`                                                                                                           | Capabilities the agent can call directly                    | [Using tools](https://developers.openai.com/api/docs/guides/tools#usage-in-the-agents-sdk)                            |
| | Hinting when another agent should delegate here             | [Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)                      |
| `handoffs`                                                                                                        | Delegating to another agent                                 | [Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)                      |
| | Returning structured output instead of plain text           | This page                                                                                |
| Guardrails and approvals                                                                                          | Validation, blocking, and review flows                      | [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)              |
| MCP servers and hosted MCP tools                                                                                  | Attaching MCP-backed capabilities                           | [Integrations and observability](https://developers.openai.com/api/docs/guides/agents/integrations-observability#mcp) |

## Start with one focused agent

Define the smallest agent that can own a clear task. Add more agents only when you need separate ownership, different instructions, different tool surfaces, or different approval policies.

Define a single agent

```typescript
import { Agent, tool } from "@openai/agents";
import { z } from "zod";

const getWeather = tool({
  name: "get_weather",
  description: "Return the weather for a given city.",
  parameters: z.object({ city: z.string() }),
  async execute({ city }) {
    return `The weather in ${city} is sunny.`;
  },
});

const agent = new Agent({
  name: "Weather bot",
  instructions: "You are a helpful weather bot.",
  model: "gpt-5.5",
  tools: [getWeather],
});
```

```python
from agents import Agent, function_tool


@function_tool
def get_weather(city: str) -> str:
    """Return the weather for a given city."""
    return f"The weather in {city} is sunny."


agent = Agent(
    name="Weather bot",
    instructions="You are a helpful weather bot.",
    model="gpt-5.5",
    tools=[get_weather],
)
```


## Shape instructions, handoffs, and outputs

Three configuration choices deserve extra care:

- Start with static `instructions`. When the guidance depends on the current user, tenant, or runtime context, switch to a dynamic instructions callback instead of stitching strings together at the call site.
- Keep short and concrete so routing agents know when to pick this specialist.
- Use when downstream code needs typed data rather than free-form prose.

Return structured output

```typescript
import { Agent, run } from "@openai/agents";
import { z } from "zod";

const calendarEvent = z.object({
  name: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
});

const agent = new Agent({
  name: "Calendar extractor",
  instructions: "Extract calendar events from text.",
  outputType: calendarEvent,
});

const result = await run(
  agent,
  "Dinner with Priya and Sam on Friday.",
);

console.log(result.finalOutput);
```

```python
import asyncio

from pydantic import BaseModel

from agents import Agent, Runner


class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]


agent = Agent(
    name="Calendar extractor",
    instructions="Extract calendar events from text.",
    output_type=CalendarEvent,
)


async def main() -> None:
    result = await Runner.run(
        agent,
        "Dinner with Priya and Sam on Friday.",
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


Use `prompt` when you want to reference a stored prompt configuration from the Responses API instead of embedding the entire system prompt in code.

## Keep local context separate from model context

The SDK lets you pass application state and dependencies into a run without sending them to the model. Use this for data like authenticated user info, database clients, loggers, and helper functions.

Pass local context to tools

```typescript
import { Agent, RunContext, run, tool } from "@openai/agents";
import { z } from "zod";

interface UserInfo {
  name: string;
  uid: number;
}

const fetchUserAge = tool({
  name: "fetch_user_age",
  description: "Return the age of the current user.",
  parameters: z.object({}),
  async execute(_args, runContext?: RunContext<UserInfo>) {
    return `User ${runContext?.context.name} is 47 years old`;
  },
});

const agent = new Agent<UserInfo>({
  name: "Assistant",
  tools: [fetchUserAge],
});

const result = await run(agent, "What is the age of the user?", {
  context: { name: "John", uid: 123 },
});

console.log(result.finalOutput);
```

```python
import asyncio
from dataclasses import dataclass

from agents import Agent, RunContextWrapper, Runner, function_tool


@dataclass
class UserInfo:
    name: str
    uid: int


@function_tool
async def fetch_user_age(wrapper: RunContextWrapper[UserInfo]) -> str:
    """Fetch the age of the current user."""
    return f"The user {wrapper.context.name} is 47 years old."


agent = Agent[UserInfo](
    name="Assistant",
    tools=[fetch_user_age],
)


async def main() -> None:
    result = await Runner.run(
        agent,
        "What is the age of the user?",
        context=UserInfo(name="John", uid=123),
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


The important boundary is:

- Conversation history is what the model sees.
- Run context is what your code sees.

If the model needs a fact, put it in instructions, input, retrieval, or a tool. If only your runtime needs it, keep it in local context.

## When to split one agent into several

Split an agent when one specialist shouldn't own the full reply or when separate capabilities are materially different. Common reasons are:

- A specialist needs a different tool or MCP surface.
- A specialist needs a different approval policy or guardrail.
- One branch of the workflow needs a different model or output style.
- You want explicit routing in traces rather than a single large prompt.

## Next steps

Once one specialist is defined cleanly, move to the guide that matches the next design question.

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/models"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Choose models, defaults, and transport strategy for this agent.


  </a>
  <a
    href="/api/docs/guides/tools#usage-in-the-agents-sdk"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Add capabilities the agent can call directly.


  </a>
  <a
    href="/api/docs/guides/agents/orchestration"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Choose how specialists collaborate once one agent is no longer enough.


  </a>
  <a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Understand the runtime loop, state, and streaming behavior.


  </a>
</div>
``````
:::
:::

