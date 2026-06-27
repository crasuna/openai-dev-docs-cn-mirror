---
status: needs-review
sourceId: "67435bd23603"
sourceChecksum: "67435bd236033aaf5deb8f99bb22434b067b987894a73a4560494e08cfa14e52"
sourceUrl: "https://developers.openai.com/api/docs/guides/agents/quickstart"
translatedAt: "2026-06-27T18:23:34.8670908+08:00"
translator: codex-gpt-5.5-xhigh
---

# 快速入门

当你想用最短路径构建一个可工作的、基于 SDK 的 agent 时，请使用本页。下面的示例在 TypeScript 和 Python 中使用相同的高层概念：定义一个 agent，运行它，然后随着工作流增长添加 tools 和 specialist agents。

## 安装 SDK

创建一个项目，安装 SDK，并设置你的 API key。



创建 API Key


<p></p>

```bash
# TypeScript
npm install @openai/agents zod

# Python
pip install openai-agents

export OPENAI_API_KEY=sk-...
```

## 创建并运行你的第一个 agent

从一个聚焦的 agent 和一次 turn 开始。SDK 会处理模型调用，并返回一个结果对象，其中包含最终输出和 run history。

创建并运行 agent

```typescript
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "History tutor",
  instructions:
    "You answer history questions clearly and concisely.",
  model: "gpt-5.5",
});

const result = await run(agent, "When did the Roman Empire fall?");
console.log(result.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner

agent = Agent(
    name="History tutor",
    instructions="You answer history questions clearly and concisely.",
    model="gpt-5.5",
)


async def main() -> None:
    result = await Runner.run(agent, "When did the Roman Empire fall?")
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


你应该会在终端中看到一条简洁回答。这个循环跑通后，保持相同形状并逐步添加能力，而不是一开始就设计庞大的 multi-agent 架构。

## 将状态带入下一轮

第一次 run 的结果也会帮助你决定第二轮应该使用什么作为状态。

| 如果你想要                                           | 从这里开始                                                                                                                               |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 在你的应用中保留完整 history             | |
| 让 SDK 为你加载和保存 history             | 一个 session                                                                                                                                |
| 让 OpenAI 管理 continuation state                  | 一个 server-managed continuation ID                                                                                                         |
| 恢复一个因 approval 或 interruption 暂停的 run | ，并配合使用 `interruptions` |

在 handoffs 之后，如果该 specialist 应继续保持控制，请在下一轮复用。

## 给 agent 一个 tool

你添加的第一个能力通常是 function tool，或托管的 OpenAI tool，例如 web search 或 file search。

添加 function tool

```typescript
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const historyFunFact = tool({
  name: "history_fun_fact",
  description: "Return a short history fact.",
  parameters: z.object({}),
  async execute() {
    return "Sharks are older than trees.";
  },
});

const agent = new Agent({
  name: "History tutor",
  instructions:
    "Answer history questions clearly. Use history_fun_fact when it helps.",
  tools: [historyFunFact],
});

const result = await run(
  agent,
  "Tell me something surprising about ancient life on Earth.",
);

console.log(result.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner, function_tool


@function_tool
def history_fun_fact() -> str:
    """Return a short history fact."""
    return "Sharks are older than trees."


agent = Agent(
    name="History tutor",
    instructions="Answer history questions clearly. Use history_fun_fact when it helps.",
    tools=[history_fun_fact],
)


async def main() -> None:
    result = await Runner.run(
        agent,
        "Tell me something surprising about ancient life on Earth.",
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


当你需要 hosted tools、tool search 或 agents-as-tools 时，请使用通用的 [Using tools](https://developers.openai.com/api/docs/guides/tools#usage-in-the-agents-sdk) 指南。

## 添加 specialist agents

一个常见的下一步是把工作流拆分成 specialists，并让 router 通过 handoffs 委派给它们。

路由到 specialist agents

```typescript
import { Agent, run } from "@openai/agents";

const historyTutor = new Agent({
  name: "History tutor",
  instructions: "Answer history questions clearly and concisely.",
});

const mathTutor = new Agent({
  name: "Math tutor",
  instructions: "Explain math step by step and include worked examples.",
});

const triageAgent = Agent.create({
  name: "Homework triage",
  instructions: "Route each homework question to the right specialist.",
  handoffs: [historyTutor, mathTutor],
});

const result = await run(
  triageAgent,
  "Who was the first president of the United States?",
);

console.log(result.finalOutput);
console.log(result.lastAgent?.name);
```

```python
import asyncio

from agents import Agent, Runner

history_tutor = Agent(
    name="History tutor",
    handoff_description="Specialist for history questions.",
    instructions="Answer history questions clearly and concisely.",
)

math_tutor = Agent(
    name="Math tutor",
    handoff_description="Specialist for math questions.",
    instructions="Explain math step by step and include worked examples.",
)

triage_agent = Agent(
    name="Homework triage",
    instructions="Route each homework question to the right specialist.",
    handoffs=[history_tutor, math_tutor],
)


async def main() -> None:
    result = await Runner.run(
        triage_agent,
        "Who was the first president of the United States?",
    )
    print(result.final_output)
    print(result.last_agent.name)


if __name__ == "__main__":
    asyncio.run(main())
```


## 尽早检查 traces

常规的服务端 SDK 路径包含 tracing。第一次 run 成功后，请立即打开 [Traces dashboard](https://platform.openai.com/traces)，在开始调优提示词前检查模型调用、tool calls、handoffs 和 guardrails。

## 后续步骤

第一次 run 跑通后，请继续阅读与你想添加的下一项能力匹配的指南。

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/define-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      在扩展工作流之前，先清晰塑造一个 specialist。


  </a>
  <a
    href="/api/docs/guides/tools#usage-in-the-agents-sdk"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      添加 hosted tools、function tools 和 agents-as-tools。


  </a>
  <a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      学习 agent loop、streaming 和 continuation 策略。


  </a>
  <a
    href="/api/docs/guides/agents/orchestration"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      判断何时应由 specialists 接管对话。


  </a>
</div>

