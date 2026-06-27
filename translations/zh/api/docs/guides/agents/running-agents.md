---
status: needs-review
sourceId: "71f959d96ee4"
sourceChecksum: "71f959d96ee4c51081275eb6e3155008380c2bd93e98a39588b890cdb812ec5a"
sourceUrl: "https://developers.openai.com/api/docs/guides/agents/running-agents"
translatedAt: "2026-06-27T18:24:42.5859087+08:00"
translator: codex-gpt-5.5-xhigh
---

# 运行 agents

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

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/results"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      了解你的应用应把哪些结果表面带入下一轮。


  </a>
  <a
    href="/api/docs/guides/agents/orchestration"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      决定多个 specialists 如何在同一个 runtime loop 中运行。


  </a>
  <a
    href="/api/docs/guides/agents/guardrails-approvals"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      添加 validation 和 approval pauses，同时不破坏 turn continuity。


  </a>
</div>
