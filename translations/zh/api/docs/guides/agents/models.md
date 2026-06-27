---
status: needs-review
sourceId: "41e8d6e8f666"
sourceChecksum: "41e8d6e8f666f04c14dcf8e2dcb0aace57248b8a58f6ca6f94c071c4cde48060"
sourceUrl: "https://developers.openai.com/api/docs/guides/agents/models"
translatedAt: "2026-06-27T18:00:55+08:00"
translator: codex-gpt-5.5-xhigh
---

# Models 和 providers

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


对于大多数新的 SDK 工作流，请从 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 开始，只有在延迟或成本足够重要、能证明切换合理时，才迁移到较小变体。有关当前模型选择建议，请使用平台范围的 <a href="/api/docs/guides/latest-model">Using GPT-5.5</a> 指南。

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
- 通过 WebRTC 或 WebSocket 的 live audio sessions 用于低延迟语音或图像交互。该路径请使用 [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents) 和 [live audio API guide](https://developers.openai.com/api/docs/guides/realtime)。

确切的 provider 配置、provider 生命周期管理和 transport helper APIs 仍然是特定语言相关内容。请将这些细节保留在 SDK 文档中，而不要在这里重复。

## Model settings、prompts 和功能支持

模型选择只是运行时契约的一部分。

- 用于调优 reasoning effort、verbosity 和 tool behavior 等内容。
- 当你希望由已存储的 prompt configuration 控制 run，而不是在代码中嵌入完整 system prompt 时，请使用 `prompt`。
- 一些 SDK 功能依赖 OpenAI Responses path，而不是较旧的兼容性界面，因此当你需要高级 tool-loading 或 transport features 时，请查看 SDK 文档。

当模型契约是该 specialist 的内在组成部分时，请将它保留在 agent definition 附近。只有当一组 agents 应共享相同运行时选择时，才将它移到 workflow-level default。

## 后续步骤

运行时契约明确后，请继续阅读与工作流其余设计相匹配的指南。

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/define-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      让模型选择与每个 specialist 的职责保持一致。


  </a>
  <a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      了解 transport 和模型选择如何影响 runtime loop。


  </a>
  <a
    href="/api/docs/guides/external-models"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      当 mixed-model stack 很重要时，比较更广泛的 provider options。


  </a>
</div>
