---
title: "语音 agents"
description: "Learn how to build voice agents with the OpenAI Agents SDK, choose the right architecture, and connect voice workflows to the rest of the agent stack."
outline: deep
---

# 语音 agents

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/voice-agents](https://developers.openai.com/api/docs/guides/voice-agents)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/voice-agents.md](https://developers.openai.com/api/docs/guides/voice-agents.md)
- 抓取时间：2026-06-27T05:54:11.770Z
- Checksum：`1c610b5d04ed5c5ed81e242974d50f2d87e2052ac790df12c6ab4a337c1b7d39`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
语音 agents 会把相同的 agent 概念转化为口语化、低延迟的交互。关键设计选择是决定模型应直接处理实时音频，还是由你的应用显式串联语音转文本、文本推理和文本转语音。

## 选择合适的架构

| 架构 | 最适合 | 原因 |
| --- | --- | --- |
| 使用实时音频会话的 speech-to-speech | 自然、低延迟的对话 | 模型直接处理实时音频输入和输出 |
| 链式语音流水线 | 可预测的工作流，或扩展现有文本 agent | 你的应用对转录、文本推理和语音输出保持显式控制 |

语音工作流是 SDK-first 的能力面。如果你正在迁移相关 Agent Builder 项目，请参阅 [Migrate from Agent Builder](/mirror/api/docs/guides/agent-builder/migrate-from-agent-builder) 了解当前迁移路径。

## 推荐起点

下面的示例刻意展示不同架构，而不是匹配语言标签。TypeScript 和 Python 库目前暴露的语音 helper 不同：

- 在 TypeScript 中，构建基于浏览器的语音助手最快路径是使用 `RealtimeAgent` 和 `RealtimeSession`。
- 在 Python 中，将现有文本 agent 扩展为语音的最简单路径是链式 `VoicePipeline`。



## 构建 speech-to-speech 语音 agent

当交互需要有对话感且即时响应时，使用实时音频 API 路径。这是需要 barge-in、低首段音频延迟、自然轮次交替和 realtime 工具使用的语音 agents 的最佳起点。

常见浏览器流程如下：

1. 你的应用服务器为实时音频会话创建临时 client secret。
2. 你的前端创建 `RealtimeSession`。
3. 会话在浏览器中通过 WebRTC 连接，或在服务器上通过 WebSocket 连接。
4. agent 在该会话内处理音频轮次、工具、中断和 handoffs。

启动 realtime 语音会话

```typescript
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";

const agent = new RealtimeAgent({
  name: "Assistant",
  instructions: "You are a helpful voice assistant.",
});

const session = new RealtimeSession(agent, {
  model: "gpt-realtime-2",
});

await session.connect({
  apiKey: "ek_...(ephemeral key from your server)",
});
```


之后，可以像给文本 agent 附加工具、handoffs 和 guardrails 一样，把它们附加到 `RealtimeAgent`。把音频传输相关事项放在 session 层，把业务逻辑放在 agent 定义中。

需要更底层控制时，请从传输文档开始：

- [Realtime and audio overview](/mirror/api/docs/guides/realtime)
- [Live audio API with WebRTC](/mirror/api/docs/guides/realtime-webrtc)
- [Live audio API with WebSocket](/mirror/api/docs/guides/realtime-websocket)

## 构建链式语音工作流

当你希望更强地控制中间文本、复用现有文本 agent，或从非语音工作流获得更简单的扩展路径时，请使用链式路径。在这种设计中，你的应用显式管理：

1. speech-to-text
2. agent 工作流本身
3. text-to-speech

这通常更适合支持流程、重审批流程，或你希望在每个阶段之间保留持久 transcript 和确定性逻辑的场景。

运行链式语音流水线

```python
import asyncio
import numpy as np

from agents import Agent, function_tool
from agents.voice import AudioInput, SingleAgentVoiceWorkflow, VoicePipeline


@function_tool
def get_weather(city: str) -> str:
    """Get the weather for a given city."""
    return f"The weather in {city} is sunny."


agent = Agent(
    name="Assistant",
    instructions="You are a helpful voice assistant.",
    model="gpt-5.5",
    tools=[get_weather],
)


async def main() -> None:
    pipeline = VoicePipeline(workflow=SingleAgentVoiceWorkflow(agent))
    audio_input = AudioInput(buffer=np.zeros(24000 * 3, dtype=np.int16))
    result = await pipeline.run(audio_input)
    async for event in result.stream():
        if event.type == "voice_stream_event_audio":
            print("Received audio bytes", len(event.data))


if __name__ == "__main__":
    asyncio.run(main())
```


当每个阶段都需要可见或可替换时，请使用此路径。例如，你可以存储 transcript，在文本 agent 回复前运行政策检查，调用内部系统，然后仅在工作流达到已批准答案后生成语音。

## 语音 agents 仍使用相同的核心 agent 构建块

语音能力面改变的是传输和音频循环，但核心工作流决策相同：

- 当语音 agent 需要外部能力时，使用 [Using tools](/mirror/api/docs/guides/tools#usage-in-the-agents-sdk)。
- 当口语工作流需要 streaming、continuation 或持久状态时，使用 [Running agents](/mirror/api/docs/guides/agents/running-agents)。
- 当口语工作流在多个 specialist 之间分支时，使用 [Orchestration and handoffs](/mirror/api/docs/guides/agents/orchestration)。
- 当口语工作流需要安全检查或审批时，使用 [Guardrails and human review](/mirror/api/docs/guides/agents/guardrails-approvals)。
- 当你需要 MCP 支持的能力，或想检查语音工作流的行为时，使用 [Integrations and observability](/mirror/api/docs/guides/agents/integrations-observability)。

实用规则是：先选择音频架构，然后像设计文本工作流一样设计其余 agent 工作流。

## 后续步骤


  



    为你的用例选择合适的 realtime 或音频指南。





  



    使用 Realtime 会话生命周期和事件模型。





  



    将浏览器和移动端音频直接连接到 Realtime 会话。





  



    调优 reasoning、preambles、工具、实体捕获和语音行为。




:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Voice agents turn the same agent concepts into spoken, low-latency interactions. The key design choice is deciding whether the model should work directly with live audio or whether your application should explicitly chain speech-to-text, text reasoning, and text-to-speech.

## Choose the right architecture

| Architecture                              | Best for                                                  | Why                                                                                   |
| ----------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Speech-to-speech with live audio sessions | Natural, low-latency conversations                        | The model handles live audio input and output directly                                |
| Chained voice pipeline                    | Predictable workflows or extending an existing text agent | Your app keeps explicit control over transcription, text reasoning, and speech output |

Voice workflows are an SDK-first surface. If you're migrating a related Agent Builder project, see [Migrate from Agent Builder](https://developers.openai.com/api/docs/guides/agent-builder/migrate-from-agent-builder) for the current transition path.

## Recommended starting points

The examples below are intentionally different architectures, not matching language tabs. The TypeScript and Python libraries expose different voice helpers today:

- In TypeScript, the fastest path to a browser-based voice assistant is a `RealtimeAgent` and `RealtimeSession`.
- In Python, the simplest path to extending an existing text agent into voice is a chained `VoicePipeline`.

<span id="speech-to-speech-realtime-architecture"></span>

## Build a speech-to-speech voice agent

Use the live audio API path when the interaction should feel conversational and immediate. This is the best starting point for voice agents that need barge-in, low first-audio latency, natural turn taking, and realtime tool use.

The usual browser flow is:

1. Your application server creates an ephemeral client secret for the live audio session.
2. Your frontend creates a `RealtimeSession`.
3. The session connects over WebRTC in the browser or WebSocket on the server.
4. The agent handles audio turns, tools, interruptions, and handoffs inside that session.

Start a realtime voice session

```typescript
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";

const agent = new RealtimeAgent({
  name: "Assistant",
  instructions: "You are a helpful voice assistant.",
});

const session = new RealtimeSession(agent, {
  model: "gpt-realtime-2",
});

await session.connect({
  apiKey: "ek_...(ephemeral key from your server)",
});
```


From there, attach tools, handoffs, and guardrails to the `RealtimeAgent` the same way you would attach them to a text agent. Keep audio transport concerns in the session layer, and keep business logic in the agent definition.

Start with the transport docs when you need lower-level control:

- [Realtime and audio overview](https://developers.openai.com/api/docs/guides/realtime)
- [Live audio API with WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)
- [Live audio API with WebSocket](https://developers.openai.com/api/docs/guides/realtime-websocket)

## Build a chained voice workflow

Use the chained path when you want stronger control over intermediate text, existing text-agent reuse, or a simpler extension path from a non-voice workflow. In that design, your application explicitly manages:

1. speech-to-text
2. the agent workflow itself
3. text-to-speech

This is often the better fit for support flows, approval-heavy flows, or cases where you want durable transcripts and deterministic logic between each stage.

Run a chained voice pipeline

```python
import asyncio
import numpy as np

from agents import Agent, function_tool
from agents.voice import AudioInput, SingleAgentVoiceWorkflow, VoicePipeline


@function_tool
def get_weather(city: str) -> str:
    """Get the weather for a given city."""
    return f"The weather in {city} is sunny."


agent = Agent(
    name="Assistant",
    instructions="You are a helpful voice assistant.",
    model="gpt-5.5",
    tools=[get_weather],
)


async def main() -> None:
    pipeline = VoicePipeline(workflow=SingleAgentVoiceWorkflow(agent))
    audio_input = AudioInput(buffer=np.zeros(24000 * 3, dtype=np.int16))
    result = await pipeline.run(audio_input)
    async for event in result.stream():
        if event.type == "voice_stream_event_audio":
            print("Received audio bytes", len(event.data))


if __name__ == "__main__":
    asyncio.run(main())
```


Use this path when each stage needs to be visible or replaceable. For example, you might store the transcript, run policy checks before the text agent responds, call internal systems, then generate speech only after the workflow reaches an approved answer.

## Voice agents still use the same core agent building blocks

The voice surface changes the transport and audio loop, but the core workflow decisions are the same:

- Use [Using tools](https://developers.openai.com/api/docs/guides/tools#usage-in-the-agents-sdk) when the voice agent needs external capabilities.
- Use [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents) when spoken workflows need streaming, continuation, or durable state.
- Use [Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration) when spoken workflows branch across specialists.
- Use [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals) when spoken workflows need safety checks or approvals.
- Use [Integrations and observability](https://developers.openai.com/api/docs/guides/agents/integrations-observability) when you need MCP-backed capabilities or want to inspect how the voice workflow behaved.

The practical rule is: choose the audio architecture first, then design the rest of the agent workflow the same way you would for text.

## Next steps

<a href="/api/docs/guides/realtime">
  

<span slot="icon">
      </span>
    Choose the right realtime or audio guide for your use case.


</a>

<a href="/api/docs/guides/realtime-conversations">
  

<span slot="icon">
      </span>
    Work with the Realtime session lifecycle and event model.


</a>

<a href="/api/docs/guides/realtime-webrtc">
  

<span slot="icon">
      </span>
    Connect browser and mobile audio directly to a Realtime session.


</a>

<a href="/api/docs/guides/realtime-models-prompting">
  

<span slot="icon">
      </span>
    Tune reasoning, preambles, tools, entity capture, and voice behavior.


</a>
``````
:::
:::

