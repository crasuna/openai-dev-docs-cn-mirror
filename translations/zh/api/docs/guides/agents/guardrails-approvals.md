---
status: needs-review
sourceId: "a3f0638495d8"
sourceChecksum: "a3f0638495d8cb353feb9aafd7bce70d5030d021b217eb2c3c97e58bc749b346"
sourceUrl: "https://developers.openai.com/api/docs/guides/agents/guardrails-approvals"
translatedAt: "2026-06-27T17:45:12.7147584+08:00"
translator: codex-gpt-5.5-xhigh
---

# Guardrails 和人工审核

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

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      了解 interruptions 和 resumptions 如何融入运行时循环。


  </a>
  <a
    href="/api/docs/guides/agents/results"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      了解暂停运行会向你的应用返回哪些结果界面。


  </a>
  <a
    href="/api/docs/guides/tools#usage-in-the-agents-sdk"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      判断哪些工具界面需要在副作用发生前进行验证或审批。


  </a>
</div>
