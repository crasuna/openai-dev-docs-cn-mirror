---
title: "Models and providers"
description: "Learn how to choose models, set defaults, and think about providers and transport in the OpenAI Agents SDK."
outline: deep
---

# Models and providers

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agents/models](https://developers.openai.com/api/docs/guides/agents/models)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agents/models.md](https://developers.openai.com/api/docs/guides/agents/models.md)
- 抓取时间：2026-06-27T05:53:58.506Z
- Checksum：`41e8d6e8f666f04c14dcf8e2dcb0aace57248b8a58f6ca6f94c071c4cde48060`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
每次 SDK run 最终都会解析出一个 model 和一个 transport。大多数应用应保持这一设置简单明了：显式选择模型，默认使用标准 OpenAI 路径，只有当工作流确实需要时，才使用 provider 或 transport overrides。

## 从显式模型选择开始

在生产环境中，相比使用 SDK 版本恰好附带的运行时默认值，更推荐显式选择模型。

- 当某个专门 agent 始终需要不同的质量、延迟或成本配置时，在该 agent 上设置 `model`。
- 当一个工作流应同时覆盖多个 agents 时，设置 run-level default。
- 当你希望为省略 `model` 的 agents 提供进程级 fallback 时，设置 `OPENAI_DEFAULT_MODEL`。

按 agent 和 run 设置模型

```typescript
import { Agent, Runner } from "@openai/agents";

const fastAgent = new Agent({
  name: "Fast support agent",
  instructions: "Handle routine support questions.",
  model: "gpt-5.4-mini",
});

const generalAgent = new Agent({
  name: "General support agent",
  instructions: "Handle support questions carefully.",
});

const runner = new Runner({
  model: "gpt-5.5",
});

await runner.run(fastAgent, "Summarize ticket 123.");
const result = await runner.run(
  generalAgent,
  "Investigate the billing issue on account 456.",
);

console.log(result.finalOutput);
```

```python
import asyncio

from agents import Agent, RunConfig, Runner

fast_agent = Agent(
    name="Fast support agent",
    instructions="Handle routine support questions.",
    model="gpt-5.4-mini",
)

general_agent = Agent(
    name="General support agent",
    instructions="Handle support questions carefully.",
)


async def main() -> None:
    await Runner.run(fast_agent, "Summarize ticket 123.")

    result = await Runner.run(
        general_agent,
        "Investigate the billing issue on account 456.",
        run_config=RunConfig(model="gpt-5.5"),
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


对于大多数新的 SDK 工作流，请从 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 开始，只有在延迟或成本足够重要、能证明切换合理时，才迁移到较小变体。有关当前模型选择建议，请使用平台范围的 &lt;a href="/api/docs/guides/latest-model"&gt;Using GPT-5.5&lt;/a&gt; 指南。

## 选择最简单的默认策略

| 如果你需要                                     | 从这里开始                | 原因                                                                 |
| ---------------------------------------------- | ------------------------- | -------------------------------------------------------------------- |
| 每个 specialist 一个显式模型                   | 在每个 agent 上设置 `model` | 工作流在代码和 traces 中都保持可读                                  |
| 整个进程一个 fallback                          | `OPENAI_DEFAULT_MODEL`    | 省略 `model` 的 agents 仍能可预测地解析                              |
| 一个 workflow-level override                   | Run-level default         | 你可以为脚本、worker 或环境切换模型，而不用编辑每个 agent            |
| 同一工作流中使用不同模型大小                   | 混合使用 per-agent models | 快速 triage agent 和较慢的 deep specialist 可以清晰地共存            |

如果你的团队在意确切默认值，请不要依赖 SDK fallback。请自行设置。

## Providers 和 transport

| 需求                                                    | 从这里开始                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| 在 OpenAI 上运行标准 SDK runs                           | 默认 OpenAI provider path                                         |
| 通过 socket 多次重复进行 Responses model round trips    | SDK 中的 Responses WebSocket transport                            |
| Non-OpenAI models 或 mixed-provider stack               | 各语言 SDK 文档中的 provider 或 adapter surface                   |

有两个区别很重要：

- Responses WebSocket transport 仍使用普通 text-and-tools agent loop。它与 voice session path 是分开的。
- 通过 WebRTC 或 WebSocket 的 live audio sessions 用于低延迟语音或图像交互。该路径请使用 [Voice agents](/mirror/api/docs/guides/voice-agents) 和 [live audio API guide](/mirror/api/docs/guides/realtime)。

确切的 provider 配置、provider 生命周期管理和 transport helper APIs 仍然是特定语言相关内容。请将这些细节保留在 SDK 文档中，而不要在这里重复。

## Model settings、prompts 和功能支持

模型选择只是运行时契约的一部分。

- 用于调优 reasoning effort、verbosity 和 tool behavior 等内容。
- 当你希望由已存储的 prompt configuration 控制 run，而不是在代码中嵌入完整 system prompt 时，请使用 `prompt`。
- 一些 SDK 功能依赖 OpenAI Responses path，而不是较旧的兼容性界面，因此当你需要高级 tool-loading 或 transport features 时，请查看 SDK 文档。

当模型契约是该 specialist 的内在组成部分时，请将它保留在 agent definition 附近。只有当一组 agents 应共享相同运行时选择时，才将它移到 workflow-level default。

## 后续步骤

运行时契约明确后，请继续阅读与工作流其余设计相匹配的指南。


  &lt;a
    href="/api/docs/guides/agents/define-agents"
    class="block no-underline hover:no-underline"
  &gt;
    



      让模型选择与每个 specialist 的职责保持一致。



  &lt;a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  &gt;
    



      了解 transport 和模型选择如何影响 runtime loop。



  &lt;a
    href="/api/docs/guides/external-models"
    class="block no-underline hover:no-underline"
  &gt;
    



      当 mixed-model stack 很重要时，比较更广泛的 provider options。





:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Every SDK run eventually resolves a model and a transport. Most applications should keep that setup straightforward: choose models explicitly, use the standard OpenAI path by default, and reach for provider or transport overrides only when the workflow actually needs them.

## Start with explicit model selection

In production, prefer explicit model choice over whichever runtime default your SDK release happens to ship with.

- Set `model` on an agent when that specialist consistently needs a different quality, latency, or cost profile.
- Set a run-level default when one workflow should override several agents at once.
- Set `OPENAI_DEFAULT_MODEL` when you want a process-wide fallback for agents that omit `model`.

Set models per agent and per run

```typescript
import { Agent, Runner } from "@openai/agents";

const fastAgent = new Agent({
  name: "Fast support agent",
  instructions: "Handle routine support questions.",
  model: "gpt-5.4-mini",
});

const generalAgent = new Agent({
  name: "General support agent",
  instructions: "Handle support questions carefully.",
});

const runner = new Runner({
  model: "gpt-5.5",
});

await runner.run(fastAgent, "Summarize ticket 123.");
const result = await runner.run(
  generalAgent,
  "Investigate the billing issue on account 456.",
);

console.log(result.finalOutput);
```

```python
import asyncio

from agents import Agent, RunConfig, Runner

fast_agent = Agent(
    name="Fast support agent",
    instructions="Handle routine support questions.",
    model="gpt-5.4-mini",
)

general_agent = Agent(
    name="General support agent",
    instructions="Handle support questions carefully.",
)


async def main() -> None:
    await Runner.run(fast_agent, "Summarize ticket 123.")

    result = await Runner.run(
        general_agent,
        "Investigate the billing issue on account 456.",
        run_config=RunConfig(model="gpt-5.5"),
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```


For most new SDK workflows, start with [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) and move to a smaller variant only when latency or cost matters enough to justify it. Use the platform-wide <a href="/api/docs/guides/latest-model">Using GPT-5.5</a> guide for current model-selection advice.

## Choose the simplest default strategy

| If you need                                    | Start with                | Why                                                                                  |
| ---------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------ |
| One explicit model per specialist              | Set `model` on each agent | The workflow stays readable in code and traces                                       |
| One fallback across a whole process            | `OPENAI_DEFAULT_MODEL`    | Agents that omit `model` still resolve predictably                                   |
| One workflow-level override                    | A run-level default       | You can swap models for a script, worker, or environment without editing every agent |
| Different model sizes across the same workflow | Mix per-agent models      | A fast triage agent and a slower deep specialist can coexist cleanly                 |

If your team cares about the exact default, don't rely on the SDK fallback. Set it yourself.

## Providers and transport

| Need                                                    | Start with                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| Standard SDK runs on OpenAI                             | The default OpenAI provider path                                  |
| Many repeated Responses model round trips over a socket | Responses WebSocket transport in the SDK                          |
| Non-OpenAI models or a mixed-provider stack             | The provider or adapter surface in the language-specific SDK docs |

Two distinctions matter:

- The Responses WebSocket transport still uses the normal text-and-tools agent loop. It's separate from the voice session path.
- Live audio sessions over WebRTC or WebSocket are for low-latency voice or image interactions. Use [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents) and the [live audio API guide](https://developers.openai.com/api/docs/guides/realtime) for that path.

Exact provider configuration, provider lifecycle management, and transport helper APIs remain language-specific material. Keep those details in the SDK docs instead of duplicating them here.

## Model settings, prompts, and feature support

Model choice is only part of the runtime contract.

- Use for tuning such as reasoning effort, verbosity, and tool behavior.
- Use `prompt` when you want a stored prompt configuration to control the run instead of embedding the full system prompt in code.
- Some SDK features depend on the OpenAI Responses path rather than older compatibility surfaces, so check the SDK docs when you need advanced tool-loading or transport features.

Keep the model contract close to the agent definition when it's intrinsic to that specialist. Move it to a workflow-level default only when a group of agents should share the same runtime choice.

## Next steps

Once the runtime contract is clear, continue with the guide that matches the rest of the workflow design.

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/define-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Keep model choices aligned with the responsibilities of each specialist.


  </a>
  <a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      See how transport and model choices affect the runtime loop.


  </a>
  <a
    href="/api/docs/guides/external-models"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Compare broader provider options when a mixed-model stack matters.


  </a>
</div>
``````
:::
:::

