---
status: needs-review
sourceId: ec905d77ac0d
sourceChecksum: ec905d77ac0d63a9575fc78675358eca3a859d62802c1ac60d69473368df985a
sourceUrl: https://developers.openai.com/api/docs/guides/agents/define-agents
translatedAt: 2026-06-27T16:52:06+08:00
translator: codex-gpt-5.5-xhigh
---

# Agent 定义

agent 是基于 SDK 的工作流中的核心单元。它把模型、指令和可选的运行时行为打包在一起，例如工具、guardrails、MCP 服务器、handoffs 和结构化输出。

## agent 上应包含什么

将 agent 配置用于该专家本身固有的决策：

| 属性                                                                                                              | 用途                                                        | 继续阅读                                                                                 |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `name`                                                                                                            | 在 traces 和工具/handoff 界面中的人类可读身份               | 本页                                                                                     |
| `instructions`                                                                                                    | 该 agent 的任务、约束和风格                                 | 本页                                                                                     |
| `prompt`                                                                                                          | 用于基于 Responses 的运行的已存储 prompt 配置               | [模型和提供方](https://developers.openai.com/api/docs/guides/agents/models)              |
| `model` 和模型设置                                                                                                | 选择模型并调优行为                                          | [模型和提供方](https://developers.openai.com/api/docs/guides/agents/models)              |
| `tools`                                                                                                           | agent 可直接调用的能力                                      | [使用工具](https://developers.openai.com/api/docs/guides/tools#usage-in-the-agents-sdk)   |
| | 提示何时应将任务委派给另一个 agent                  | [编排和 handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)      |
| `handoffs`                                                                                                        | 委派给另一个 agent                                          | [编排和 handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)      |
| | 返回结构化输出而不是纯文本                           | 本页                                                                                     |
| Guardrails 和审批                                                                                                  | 验证、阻止和审核流程                                        | [Guardrails 和人工审核](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals) |
| MCP 服务器和托管 MCP 工具                                                                                         | 附加由 MCP 支持的能力                                       | [集成和可观测性](https://developers.openai.com/api/docs/guides/agents/integrations-observability#mcp) |

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

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/models"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      为这个 agent 选择模型、默认值和传输策略。


  </a>
  <a
    href="/api/docs/guides/tools#usage-in-the-agents-sdk"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      添加 agent 可直接调用的能力。


  </a>
  <a
    href="/api/docs/guides/agents/orchestration"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      当一个 agent 不再足够时，选择多个专家如何协作。


  </a>
  <a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      理解运行时循环、状态和流式传输行为。


  </a>
</div>
