---
title: "运行 agents"
description: "Learn how to run agents, stream output, and choose the right conversation-state strategy in the OpenAI Agents SDK."
outline: deep
---

# 运行 agents

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agents/running-agents](https://developers.openai.com/api/docs/guides/agents/running-agents)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agents/running-agents.md](https://developers.openai.com/api/docs/guides/agents/running-agents.md)
- 抓取时间：2026-06-27T05:53:59.072Z
- Checksum：`71f959d96ee4c51081275eb6e3155008380c2bd93e98a39588b890cdb812ec5a`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
定义 agent 只是设置步骤。runtime 层面的问题是：单次 run 做什么、下一轮如何继续，以及 workflow 在因审批或工具工作而暂停时如何表现。

## Agent loop

一次 SDK run 就是一个应用层面的 turn。runner 会持续循环，直到到达真正的停止点：

1. 使用准备好的输入调用当前 agent 的模型。
2. 检查模型输出。
3. 如果模型产生了 tool calls，执行它们并继续。
4. 如果模型 handoff 给另一个 specialist，切换 agent 并继续。
5. 如果模型产生最终答案，且不再有工具工作，则返回结果。

这个 loop 是 SDK 背后的核心概念。tools、handoffs、approvals 和 streaming 都是在它之上构建的，而不是替代它。

## 选择一种对话策略

有四种常见方式可以把状态带入下一轮：

| 策略                                                                                                               | 状态所在位置              | 最适合                                                               | 下一轮传入什么                                 |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| | 你的应用                  | 小型聊天循环和最大控制                                             | 可 replay 的历史                              |
| `session`                                                                                                          | 你的存储加 SDK            | 持久化聊天状态、可恢复 run，以及你控制的存储                         | 同一个 session                                |
| `conversationId`                                                                                                   | OpenAI Conversations API  | 跨 worker 或服务共享的 server-managed state                          | 同一个 conversation ID，并且只传入新一轮      |
| | OpenAI Responses API      | 从一个 response 到下一个 response 的最轻量 server-managed continuation | 上一个 response ID，并且只传入新一轮          |

在大多数应用中，每个对话选择一种策略。混合本地 replay 与 server-managed state 可能会重复上下文，除非你有意协调这两层。

使用 sessions 持久化多轮状态

```typescript
import { Agent, MemorySession, run } from "@openai/agents";

const agent = new Agent({
  name: "Tour guide",
  instructions: "Answer with compact travel facts.",
});

const session = new MemorySession();

const firstTurn = await run(
  agent,
  "What city is the Golden Gate Bridge in?",
  { session },
);
console.log(firstTurn.finalOutput);

const secondTurn = await run(agent, "What state is it in?", { session });
console.log(secondTurn.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner, SQLiteSession

agent = Agent(
    name="Tour guide",
    instructions="Answer with compact travel facts.",
)

session = SQLiteSession("conversation_123")


async def main() -> None:
    first_turn = await Runner.run(
        agent,
        "What city is the Golden Gate Bridge in?",
        session=session,
    )
    print(first_turn.final_output)

    second_turn = await Runner.run(
        agent,
        "What state is it in?",
        session=session,
    )
    print(second_turn.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


当你需要 durable memory、可恢复 approval flows，或应用控制的存储时，sessions 是最佳默认选择。

使用 server-managed state 继续

```typescript
import { Agent, run } from "@openai/agents";
import OpenAI from "openai";

const agent = new Agent({
  name: "Assistant",
  instructions: "Reply very concisely.",
});

const client = new OpenAI();
const { id: conversationId } = await client.conversations.create({});

const first = await run(agent, "What city is the Golden Gate Bridge in?", {
  conversationId,
});
console.log(first.finalOutput);

const second = await run(agent, "What state is it in?", {
  conversationId,
});
console.log(second.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    instructions="Reply very concisely.",
)


async def main() -> None:
    first = await Runner.run(
        agent,
        "What city is the Golden Gate Bridge in?",
    )
    print(first.final_output)

    second = await Runner.run(
        agent,
        "What state is it in?",
        previous_response_id=first.last_response_id,
    )
    print(second.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


当多个系统应该共享同一个命名对话时，使用 `conversationId`。当你想要成本最低的 response-to-response continuation 选项时，使用。

## 增量式 stream runs

Streaming 使用相同的 agent loop 和相同的状态策略。唯一的区别是，你会在 run 仍在进行时消费事件。

在文本到达时 stream 一个 run

```typescript
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Planet guide",
  instructions: "Answer with short facts.",
});

const stream = await run(agent, "Give me three short facts about Saturn.", {
  stream: true,
});

for await (const event of stream) {
  if (
    event.type === "raw_model_stream_event" &&
    event.data.type === "response.output_text.delta"
  ) {
    process.stdout.write(event.data.delta);
  }
}

await stream.completed;
console.log("\nFinal:", stream.finalOutput);
```

```python
import asyncio

from openai.types.responses import ResponseTextDeltaEvent

from agents import Agent, Runner

agent = Agent(
    name="Planet guide",
    instructions="Answer with short facts.",
)


async def main() -> None:
    stream = Runner.run_streamed(
        agent,
        "Give me three short facts about Saturn.",
    )

    async for event in stream.stream_events():
        if (
            event.type == "raw_response_event"
            and isinstance(event.data, ResponseTextDeltaEvent)
        ):
            print(event.data.delta, end="", flush=True)

    print(f"\nFinal: {stream.final_output}")


if __name__ == "__main__":
    asyncio.run(main())
```


有三条实用规则很重要：

- 等待 stream 完成后，再把 run 视为已稳定。
- 如果 run 因审批而暂停，请解析 `interruptions` 并从 `state` 恢复，而不是启动一个新的用户 turn。
- 如果你在 turn 中途取消 stream，之后如果想继续同一个 turn，请从 `state` 恢复未完成的 turn。

## 有意处理暂停和失败

有两大类非 happy path 结果很重要：

- **Runtime 或 validation failures**，例如 max-turn 限制、guardrail 异常或 tool errors。
- **预期内的暂停**，例如 human approval requests，此时 run 是被有意中断的，之后应从相同 state 恢复。

把 approvals 视为暂停的 run，而不是新的 turns。这个区分可以保持 turn count、history 和 server-managed continuation IDs 的一致性。

## 下一步

理解 runtime loop 后，继续阅读与你要设计的下一个 workflow 边界相匹配的指南。


  &lt;a
    href="/api/docs/guides/agents/results"
    class="block no-underline hover:no-underline"
  &gt;
    



      了解你的应用应把哪些结果表面带入下一轮。



  &lt;a
    href="/api/docs/guides/agents/orchestration"
    class="block no-underline hover:no-underline"
  &gt;
    



      决定多个 specialists 如何在同一个 runtime loop 中运行。



  &lt;a
    href="/api/docs/guides/agents/guardrails-approvals"
    class="block no-underline hover:no-underline"
  &gt;
    



      添加 validation 和 approval pauses，同时不破坏 turn continuity。





:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Defining an agent is only the setup step. The runtime questions are what a single run does, how the next turn continues, and how the workflow behaves when it pauses for approvals or tool work.

## The agent loop

One SDK run is one application-level turn. The runner keeps looping until it reaches a real stopping point:

1. Call the current agent's model with the prepared input.
2. Inspect the model output.
3. If the model produced tool calls, execute them and continue.
4. If the model handed off to another specialist, switch agents and continue.
5. If the model produced a final answer with no more tool work, return a result.

That loop is the core concept behind the SDK. Tools, handoffs, approvals, and streaming all build on top of it rather than replacing it.

## Choose one conversation strategy

There are four common ways to carry state into the next turn:

| Strategy                                                                                                           | Where state lives         | Best for                                                               | What you pass on the next turn                 |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| | Your application          | Small chat loops and maximum control                                   | The replay-ready history                       |
| `session`                                                                                                          | Your storage plus the SDK | Persistent chat state, resumable runs, and storage you control         | The same session                               |
| `conversationId`                                                                                                   | OpenAI Conversations API  | Shared server-managed state across workers or services                 | The same conversation ID and only the new turn |
| | OpenAI Responses API      | The lightest server-managed continuation from one response to the next | The last response ID and only the new turn     |

In most applications, pick one strategy per conversation. Mixing local replay with server-managed state can duplicate context unless you are deliberately reconciling both layers.

Persist multi-turn state with sessions

```typescript
import { Agent, MemorySession, run } from "@openai/agents";

const agent = new Agent({
  name: "Tour guide",
  instructions: "Answer with compact travel facts.",
});

const session = new MemorySession();

const firstTurn = await run(
  agent,
  "What city is the Golden Gate Bridge in?",
  { session },
);
console.log(firstTurn.finalOutput);

const secondTurn = await run(agent, "What state is it in?", { session });
console.log(secondTurn.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner, SQLiteSession

agent = Agent(
    name="Tour guide",
    instructions="Answer with compact travel facts.",
)

session = SQLiteSession("conversation_123")


async def main() -> None:
    first_turn = await Runner.run(
        agent,
        "What city is the Golden Gate Bridge in?",
        session=session,
    )
    print(first_turn.final_output)

    second_turn = await Runner.run(
        agent,
        "What state is it in?",
        session=session,
    )
    print(second_turn.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


Sessions are the best default when you want durable memory, resumable approval flows, or storage that your application controls.

Continue with server-managed state

```typescript
import { Agent, run } from "@openai/agents";
import OpenAI from "openai";

const agent = new Agent({
  name: "Assistant",
  instructions: "Reply very concisely.",
});

const client = new OpenAI();
const { id: conversationId } = await client.conversations.create({});

const first = await run(agent, "What city is the Golden Gate Bridge in?", {
  conversationId,
});
console.log(first.finalOutput);

const second = await run(agent, "What state is it in?", {
  conversationId,
});
console.log(second.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    instructions="Reply very concisely.",
)


async def main() -> None:
    first = await Runner.run(
        agent,
        "What city is the Golden Gate Bridge in?",
    )
    print(first.final_output)

    second = await Runner.run(
        agent,
        "What state is it in?",
        previous_response_id=first.last_response_id,
    )
    print(second.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


Use `conversationId` when multiple systems should share one named conversation. Use when you want the cheapest response-to-response continuation option.

## Stream runs incrementally

Streaming uses the same agent loop and the same state strategies. The only difference is that you consume events while the run is still happening.

Stream a run as text arrives

```typescript
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Planet guide",
  instructions: "Answer with short facts.",
});

const stream = await run(agent, "Give me three short facts about Saturn.", {
  stream: true,
});

for await (const event of stream) {
  if (
    event.type === "raw_model_stream_event" &&
    event.data.type === "response.output_text.delta"
  ) {
    process.stdout.write(event.data.delta);
  }
}

await stream.completed;
console.log("\nFinal:", stream.finalOutput);
```

```python
import asyncio

from openai.types.responses import ResponseTextDeltaEvent

from agents import Agent, Runner

agent = Agent(
    name="Planet guide",
    instructions="Answer with short facts.",
)


async def main() -> None:
    stream = Runner.run_streamed(
        agent,
        "Give me three short facts about Saturn.",
    )

    async for event in stream.stream_events():
        if (
            event.type == "raw_response_event"
            and isinstance(event.data, ResponseTextDeltaEvent)
        ):
            print(event.data.delta, end="", flush=True)

    print(f"\nFinal: {stream.final_output}")


if __name__ == "__main__":
    asyncio.run(main())
```


Three practical rules matter:

- Wait for the stream to finish before treating the run as settled.
- If the run pauses for approval, resolve `interruptions` and resume from `state` rather than starting a fresh user turn.
- If you cancel a stream mid-turn, resume the unfinished turn from `state` if you want the same turn to continue later.

## Handle pauses and failures deliberately

Two broad classes of non-happy-path outcomes matter:

- **Runtime or validation failures** such as max-turn limits, guardrail exceptions, or tool errors.
- **Expected pauses** such as human approval requests, where the run is intentionally interrupted and should later resume from the same state.

Treat approvals as paused runs, not as new turns. That distinction keeps turn counts, history, and server-managed continuation IDs consistent.

## Next steps

Once the runtime loop is clear, move to the guide that matches the next workflow boundary you need to design.

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/results"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Learn which result surfaces your application should carry into the next
      turn.


  </a>
  <a
    href="/api/docs/guides/agents/orchestration"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Decide how multiple specialists behave inside the same runtime loop.


  </a>
  <a
    href="/api/docs/guides/agents/guardrails-approvals"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Add validation and approval pauses without breaking turn continuity.


  </a>
</div>
``````
:::
:::

