---
title: "Guardrails and human review"
description: "Learn how to use guardrails and human review in the OpenAI Agents SDK for safer, more controlled workflows."
outline: deep
---

# Guardrails and human review

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agents/guardrails-approvals](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agents/guardrails-approvals.md](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals.md)
- 抓取时间：2026-06-27T05:53:58.218Z
- Checksum：`a3f0638495d8cb353feb9aafd7bce70d5030d021b217eb2c3c97e58bc749b346`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用 guardrails 进行自动检查，使用人工审核作出审批决策。二者共同定义一次运行应当继续、暂停还是停止。

- **Guardrails** 会自动验证输入、输出或工具行为。
- **Human review** 会暂停运行，让人员或策略能够批准或拒绝敏感操作。

## 选择合适的控制方式

| 使用场景                                                                 | 从这里开始                         |
| ------------------------------------------------------------------------ | ---------------------------------- |
| 在主模型运行之前阻止不允许的用户请求                                     | Input guardrails                   |
| 在最终输出离开系统之前验证或遮盖它                                       | Output guardrails                  |
| 检查 function tool 调用前后的参数或结果                                  | Tool guardrails                    |
| 在取消、编辑、shell 命令或敏感 MCP 操作等副作用发生前暂停                | Human-in-the-loop approvals        |

## 添加阻断式 guardrail

当你希望在工作流中昂贵或会产生副作用的部分启动之前运行一个快速验证步骤时，请使用 input guardrails。

使用 input guardrail 阻止请求

```typescript
import {
  Agent,
  InputGuardrailTripwireTriggered,
  run,
} from "@openai/agents";
import { z } from "zod";

const guardrailAgent = new Agent({
  name: "Homework check",
  instructions: "Detect whether the user is asking for math homework help.",
  outputType: z.object({
    isMathHomework: z.boolean(),
    reasoning: z.string(),
  }),
});

const agent = new Agent({
  name: "Customer support",
  instructions: "Help customers with support questions.",
  inputGuardrails: [
    {
      name: "Math homework guardrail",
      runInParallel: false,
      async execute({ input, context }) {
        const result = await run(guardrailAgent, input, { context });
        return {
          outputInfo: result.finalOutput,
          tripwireTriggered: result.finalOutput?.isMathHomework === true,
        };
      },
    },
  ],
});

try {
  await run(agent, "Can you solve 2x + 3 = 11 for me?");
} catch (error) {
  if (error instanceof InputGuardrailTripwireTriggered) {
    console.log("Guardrail blocked the request.");
  }
}
```

```python
import asyncio

from pydantic import BaseModel

from agents import (
    Agent,
    GuardrailFunctionOutput,
    InputGuardrailTripwireTriggered,
    RunContextWrapper,
    Runner,
    TResponseInputItem,
    input_guardrail,
)


class MathHomeworkOutput(BaseModel):
    is_math_homework: bool
    reasoning: str


guardrail_agent = Agent(
    name="Homework check",
    instructions="Detect whether the user is asking for math homework help.",
    output_type=MathHomeworkOutput,
)


@input_guardrail
async def math_guardrail(
    ctx: RunContextWrapper[None],
    agent: Agent,
    input: str | list[TResponseInputItem],
) -> GuardrailFunctionOutput:
    result = await Runner.run(guardrail_agent, input, context=ctx.context)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=result.final_output.is_math_homework,
    )


agent = Agent(
    name="Customer support",
    instructions="Help customers with support questions.",
    input_guardrails=[math_guardrail],
)


async def main() -> None:
    try:
        await Runner.run(agent, "Can you solve 2x + 3 = 11 for me?")
    except InputGuardrailTripwireTriggered:
        print("Guardrail blocked the request.")


if __name__ == "__main__":
    asyncio.run(main())
```


当启动主 agent 的成本或风险过高时，请使用阻断式执行。当更低延迟比避免推测性工作更重要时，请使用并行 guardrails。

## 暂停以进行人工审核

Approvals 是工具调用的 human-in-the-loop 路径。模型仍然可以判断需要执行某个操作，但运行会暂停，直到你批准或拒绝它。

在敏感操作之前暂停以等待审批

```typescript
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const cancelOrder = tool({
  name: "cancel_order",
  description: "Cancel a customer order.",
  parameters: z.object({ orderId: z.number() }),
  needsApproval: true,
  async execute({ orderId }) {
    return `Cancelled order ${orderId}`;
  },
});

const agent = new Agent({
  name: "Support agent",
  instructions: "Handle support requests and ask for approval when needed.",
  tools: [cancelOrder],
});

let result = await run(agent, "Cancel order 123.");

if (result.interruptions?.length) {
  const state = result.state;
  for (const interruption of result.interruptions) {
    state.approve(interruption);
  }
  result = await run(agent, state);
}

console.log(result.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner, function_tool


@function_tool(needs_approval=True)
async def cancel_order(order_id: int) -> str:
    return f"Cancelled order {order_id}"


agent = Agent(
    name="Support agent",
    instructions="Handle support requests and ask for approval when needed.",
    tools=[cancel_order],
)


async def main() -> None:
    result = await Runner.run(agent, "Cancel order 123.")

    if result.interruptions:
        state = result.to_state()
        for interruption in result.interruptions:
            state.approve(interruption)
        result = await Runner.run(agent, state)

    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


即使需要审批的工具位于工作流更深处，例如在 handoff 之后或嵌套调用内部，同样的 interruption 模式也适用。

## 审批生命周期

当某个工具调用需要审核时，SDK 每次都会遵循相同模式：

1. 运行记录一个 approval interruption，而不是执行工具。
2. 结果返回 `interruptions` 以及可恢复的 `state`。
3. 你的应用批准或拒绝待处理项。
4. 你从 `state` 恢复同一次运行，而不是启动新的用户回合。

如果审核可能需要一些时间，请序列化 `state`、存储它，并稍后恢复。这仍然是同一次运行。

## 工作流边界很重要

Agent 级 guardrails 并不会到处运行：

- Input guardrails 只会为链中的第一个 agent 运行。
- Output guardrails 只会为生成最终输出的 agent 运行。
- Tool guardrails 会在它们所附加的 function tools 上运行。

如果你需要在 manager-style 工作流中的每一次自定义工具调用周围做检查，不要只依赖 agent 级 input 或 output guardrails。请把验证放在创建副作用的工具旁边。

## Streaming 和延迟审核使用相同的状态模型

Streaming 不会创建一套单独的审批系统。如果一次 streamed run 暂停，请等待它稳定下来，检查 `interruptions`，处理 approvals，然后从同一个 `state` 恢复。如果审核稍后才发生，请存储序列化后的 state，并在决策到达时继续同一次运行。

## 后续步骤

控制边界清楚之后，请继续阅读覆盖其周围运行时或工具界面的指南。


  &lt;a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  &gt;
    



      了解 interruptions 和 resumptions 如何融入运行时循环。



  &lt;a
    href="/api/docs/guides/agents/results"
    class="block no-underline hover:no-underline"
  &gt;
    



      了解暂停运行会向你的应用返回哪些结果界面。



  &lt;a
    href="/api/docs/guides/tools#usage-in-the-agents-sdk"
    class="block no-underline hover:no-underline"
  &gt;
    



      判断哪些工具界面需要在副作用发生前进行验证或审批。





:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Use guardrails for automatic checks and human review for approval decisions. Together, they define when a run should continue, pause, or stop.

- **Guardrails** validate input, output, or tool behavior automatically.
- **Human review** pauses the run so a person or policy can approve or reject a sensitive action.

## Choose the right control

| Use case                                                                                      | Start with                  |
| --------------------------------------------------------------------------------------------- | --------------------------- |
| Block disallowed user requests before the main model runs                                     | Input guardrails            |
| Validate or redact the final output before it leaves the system                               | Output guardrails           |
| Check arguments or results around a function tool call                                        | Tool guardrails             |
| Pause before side effects like cancellations, edits, shell commands, or sensitive MCP actions | Human-in-the-loop approvals |

## Add a blocking guardrail

Use input guardrails when you want a fast validation step to run before the expensive or side-effecting part of the workflow starts.

Block a request with an input guardrail

```typescript
import {
  Agent,
  InputGuardrailTripwireTriggered,
  run,
} from "@openai/agents";
import { z } from "zod";

const guardrailAgent = new Agent({
  name: "Homework check",
  instructions: "Detect whether the user is asking for math homework help.",
  outputType: z.object({
    isMathHomework: z.boolean(),
    reasoning: z.string(),
  }),
});

const agent = new Agent({
  name: "Customer support",
  instructions: "Help customers with support questions.",
  inputGuardrails: [
    {
      name: "Math homework guardrail",
      runInParallel: false,
      async execute({ input, context }) {
        const result = await run(guardrailAgent, input, { context });
        return {
          outputInfo: result.finalOutput,
          tripwireTriggered: result.finalOutput?.isMathHomework === true,
        };
      },
    },
  ],
});

try {
  await run(agent, "Can you solve 2x + 3 = 11 for me?");
} catch (error) {
  if (error instanceof InputGuardrailTripwireTriggered) {
    console.log("Guardrail blocked the request.");
  }
}
```

```python
import asyncio

from pydantic import BaseModel

from agents import (
    Agent,
    GuardrailFunctionOutput,
    InputGuardrailTripwireTriggered,
    RunContextWrapper,
    Runner,
    TResponseInputItem,
    input_guardrail,
)


class MathHomeworkOutput(BaseModel):
    is_math_homework: bool
    reasoning: str


guardrail_agent = Agent(
    name="Homework check",
    instructions="Detect whether the user is asking for math homework help.",
    output_type=MathHomeworkOutput,
)


@input_guardrail
async def math_guardrail(
    ctx: RunContextWrapper[None],
    agent: Agent,
    input: str | list[TResponseInputItem],
) -> GuardrailFunctionOutput:
    result = await Runner.run(guardrail_agent, input, context=ctx.context)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=result.final_output.is_math_homework,
    )


agent = Agent(
    name="Customer support",
    instructions="Help customers with support questions.",
    input_guardrails=[math_guardrail],
)


async def main() -> None:
    try:
        await Runner.run(agent, "Can you solve 2x + 3 = 11 for me?")
    except InputGuardrailTripwireTriggered:
        print("Guardrail blocked the request.")


if __name__ == "__main__":
    asyncio.run(main())
```


Use blocking execution when the cost or risk of starting the main agent is too high. Use parallel guardrails when lower latency matters more than avoiding speculative work.

## Pause for human review

Approvals are the human-in-the-loop path for tool calls. The model can still decide that an action is needed, but the run pauses until you approve or reject it.

Pause for approval before a sensitive action

```typescript
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const cancelOrder = tool({
  name: "cancel_order",
  description: "Cancel a customer order.",
  parameters: z.object({ orderId: z.number() }),
  needsApproval: true,
  async execute({ orderId }) {
    return `Cancelled order ${orderId}`;
  },
});

const agent = new Agent({
  name: "Support agent",
  instructions: "Handle support requests and ask for approval when needed.",
  tools: [cancelOrder],
});

let result = await run(agent, "Cancel order 123.");

if (result.interruptions?.length) {
  const state = result.state;
  for (const interruption of result.interruptions) {
    state.approve(interruption);
  }
  result = await run(agent, state);
}

console.log(result.finalOutput);
```

```python
import asyncio

from agents import Agent, Runner, function_tool


@function_tool(needs_approval=True)
async def cancel_order(order_id: int) -> str:
    return f"Cancelled order {order_id}"


agent = Agent(
    name="Support agent",
    instructions="Handle support requests and ask for approval when needed.",
    tools=[cancel_order],
)


async def main() -> None:
    result = await Runner.run(agent, "Cancel order 123.")

    if result.interruptions:
        state = result.to_state()
        for interruption in result.interruptions:
            state.approve(interruption)
        result = await Runner.run(agent, state)

    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


This same interruption pattern applies even when the approving tool lives deeper in the workflow, such as after a handoff or inside a nested call.

## Approval lifecycle

When a tool call needs review, the SDK follows the same pattern every time:

1. The run records an approval interruption instead of executing the tool.
2. The result returns `interruptions` plus a resumable `state`.
3. Your application approves or rejects the pending items.
4. You resume the same run from `state` instead of starting a new user turn.

If the review might take time, serialize `state`, store it, and resume later. That's still the same run.

## Workflow boundaries matter

Agent-level guardrails don't run everywhere:

- Input guardrails run only for the first agent in the chain.
- Output guardrails run only for the agent that produces the final output.
- Tool guardrails run on the function tools they're attached to.

If you need checks around every custom tool call in a manager-style workflow, don't rely only on agent-level input or output guardrails. Put validation next to the tool that creates the side effect.

## Streaming and delayed review use the same state model

Streaming doesn't create a separate approval system. If a streamed run pauses, wait for it to settle, inspect `interruptions`, resolve the approvals, and resume from the same `state`. If the review happens later, store the serialized state and continue the same run when the decision arrives.

## Next steps

Once the control boundaries are clear, continue with the guide that covers the runtime or tool surface around them.

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      See how interruptions and resumptions fit into the runtime loop.


  </a>
  <a
    href="/api/docs/guides/agents/results"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Learn which result surfaces paused runs return to your application.


  </a>
  <a
    href="/api/docs/guides/tools#usage-in-the-agents-sdk"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Decide which tool surfaces need validation or approval before side effects
      happen.


  </a>
</div>
``````
:::
:::

