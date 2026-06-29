---
title: "Agents SDK 智能体 SDK"
description: "Learn how the OpenAI Agents SDK fits together and which docs to read next."
outline: deep
---

# Agents SDK 智能体 SDK

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agents](https://developers.openai.com/api/docs/guides/agents)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agents.md](https://developers.openai.com/api/docs/guides/agents.md)
- 抓取时间：2026-06-27T05:53:58.201Z
- Checksum：`ca9e26434a4b790306f78fefc74a3d108116fd7a25d6b61b980296675410ed4b`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
agent 是能够规划、调用工具、跨专家协作，并保留足够状态以完成多步骤工作的应用。

- 当一次模型调用加上工具和应用自有逻辑就足够时，使用 [**Responses API**](/mirror/api/reference/responses/overview)。
- 当你的应用负责拥有编排、工具执行、审批和状态时，使用 **Agents SDK** 页面。

## 运行你的第一个 agent

从 [Agents SDK quickstart](/mirror/api/docs/guides/agents/quickstart) 开始，安装 SDK、定义一个 agent，并运行它。成功运行后，回到这里选择你的应用接下来需要的能力。

## 获取 Agents SDK

使用 GitHub 仓库获取更多示例、issues 和特定语言的参考详情。


  &lt;a
    href="https://github.com/openai/openai-agents-js"
    class="block no-underline hover:no-underline"
    target="_blank"
    rel="noopener noreferrer"
  &gt;
    



      在 GitHub 上打开 TypeScript SDK 仓库。



  &lt;a
    href="https://github.com/openai/openai-agents-python"
    class="block no-underline hover:no-underline"
    target="_blank"
    rel="noopener noreferrer"
  &gt;
    



      在 GitHub 上打开 Python SDK 仓库。





## 选择你的起点

| 如果你想要                               | 从这里开始                                                                                                                                             | 原因                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| 构建代码优先的 agent 应用                | [快速开始](/mirror/api/docs/guides/agents/quickstart)                                                                            | 这是获得可运行 SDK 集成的最短路径。                                                            |
| 干净地定义一个专家                       | [Agent 定义](/mirror/api/docs/guides/agents/define-agents)                                                                       | 当你仍在塑造单个 agent 的契约时，从这里开始。                                                   |
| 选择模型、默认值和传输                   | [模型和提供方](/mirror/api/docs/guides/agents/models)                                                                            | 当模型选择、提供方设置或传输策略会影响工作流时使用。                                           |
| 理解运行时循环和状态                     | [运行 agent](/mirror/api/docs/guides/agents/running-agents)                                                                      | agent 循环、流式传输和延续策略都在这里。                                                        |
| 在基于容器的环境中运行工作               | [Sandbox agent](/mirror/api/docs/guides/agents/sandboxes)                                                                        | 当 agent 需要文件、命令、包、快照、挂载或提供方链接时使用。                                    |
| 设计专家职责归属                         | [编排和 handoffs](/mirror/api/docs/guides/agents/orchestration)                                                                  | 当你需要不止一个 agent，并且必须决定由谁拥有回复时使用。                                       |
| 添加验证或人工审核                       | [Guardrails 和人工审核](/mirror/api/docs/guides/agents/guardrails-approvals)                                                     | 当工作流应在风险工作继续之前阻止或暂停时使用。                                                 |
| 理解一次运行返回什么                     | [结果和状态](/mirror/api/docs/guides/agents/results)                                                                             | 本页解释 final output、可恢复状态和下一轮交互界面。                                            |
| 添加托管工具、函数工具或 MCP             | [使用工具](/mirror/api/docs/guides/tools#usage-in-the-agents-sdk) 和 [集成和可观测性](/mirror/api/docs/guides/agents/integrations-observability) | 工具语义位于平台工具文档中；SDK 专属的 MCP 和 tracing 位于这里。                                |
| 检查并改进运行                           | [集成和可观测性](/mirror/api/docs/guides/agents/integrations-observability) 和 [评估 agent 工作流](/mirror/api/docs/guides/agent-evals)      | 先使用 traces 进行调试，然后进入评估循环。                                                      |
| 构建语音优先的工作流                     | [语音 agent](/mirror/api/docs/guides/voice-agents)                                                                               | 使用 SDK 的语音 pipeline 和 realtime agent 模式。                                               |

## 使用 SDK 构建

当你的服务器负责拥有编排、工具执行、状态和审批时，请使用 SDK 路线。当你需要以下能力时，这条路线最适合：

- TypeScript 或 Python 中的类型化应用代码
- 直接控制工具、MCP 服务器和运行时行为
- 自定义存储或服务器管理的对话策略
- 与现有产品逻辑或基础设施紧密集成

典型的 SDK 阅读顺序是：

- 从 [快速开始](/mirror/api/docs/guides/agents/quickstart) 开始，让一次运行出现在屏幕上。
- 使用 [Agent 定义](/mirror/api/docs/guides/agents/define-agents) 和 [模型和提供方](/mirror/api/docs/guides/agents/models) 干净地塑造一个专家。
- 随着工作流变得更复杂，继续阅读 [运行 agent](/mirror/api/docs/guides/agents/running-agents)、[编排和 handoffs](/mirror/api/docs/guides/agents/orchestration) 和 [Guardrails 和人工审核](/mirror/api/docs/guides/agents/guardrails-approvals)。
- 当应用逻辑依赖 run 对象，或需要更深入地观察行为时，使用 [结果和状态](/mirror/api/docs/guides/agents/results) 和 [集成和可观测性](/mirror/api/docs/guides/agents/integrations-observability)。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Agents are applications that plan, call tools, collaborate across specialists, and keep enough state to complete multi-step work.

- Use the [**Responses API**](https://developers.openai.com/api/reference/responses/overview) when one model call plus tools and application-owned logic is enough.
- Use the **Agents SDK** pages when your application owns orchestration, tool execution, approvals, and state.

## Get your first agent running

Start with the [Agents SDK quickstart](https://developers.openai.com/api/docs/guides/agents/quickstart) to install the SDK, define one agent, and run it. Once that works, return here to choose the next capability your application needs.

## Get the Agents SDK

Use the GitHub repositories for more examples, issues, and language-specific reference details.

<div class="not-prose mt-4 grid gap-3">
  <a
    href="https://github.com/openai/openai-agents-js"
    class="block no-underline hover:no-underline"
    target="_blank"
    rel="noopener noreferrer"
  >
    

<span slot="icon">
        </span>
      Open the TypeScript SDK repository on GitHub.


  </a>
  <a
    href="https://github.com/openai/openai-agents-python"
    class="block no-underline hover:no-underline"
    target="_blank"
    rel="noopener noreferrer"
  >
    

<span slot="icon">
        </span>
      Open the Python SDK repository on GitHub.


  </a>
</div>

## Choose your starting point

| If you want to                           | Start here                                                                                                                                             | Why                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Build a code-first agent app             | [Quickstart](https://developers.openai.com/api/docs/guides/agents/quickstart)                                                                                                       | This is the shortest path to a working SDK integration.                                        |
| Define one specialist cleanly            | [Agent definitions](https://developers.openai.com/api/docs/guides/agents/define-agents)                                                                                             | Start here when you are still shaping the contract for a single agent.                         |
| Choose models, defaults, and transport   | [Models and providers](https://developers.openai.com/api/docs/guides/agents/models)                                                                                                 | Use this when model choice, provider setup, or transport strategy affects the workflow.        |
| Understand the runtime loop and state    | [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents)                                                                                               | This is where the agent loop, streaming, and continuation strategies live.                     |
| Run work in a container-based environment | [Sandbox agents](https://developers.openai.com/api/docs/guides/agents/sandboxes)                                                                                                    | Use this when the agent needs files, commands, packages, snapshots, mounts, or provider links. |
| Design specialist ownership              | [Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)                                                                                    | Use this when you need more than one agent and must decide who owns the reply.                 |
| Add validation or human review           | [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)                                                                            | Use this when the workflow should block or pause before risky work continues.                  |
| Understand what a run returns            | [Results and state](https://developers.openai.com/api/docs/guides/agents/results)                                                                                                   | This page explains final output, resumable state, and next-turn surfaces.                      |
| Add hosted tools, function tools, or MCP | [Using tools](https://developers.openai.com/api/docs/guides/tools#usage-in-the-agents-sdk) and [Integrations and observability](https://developers.openai.com/api/docs/guides/agents/integrations-observability) | Tool semantics live in the platform tools docs; SDK-specific MCP and tracing live here.        |
| Inspect and improve runs                 | [Integrations and observability](https://developers.openai.com/api/docs/guides/agents/integrations-observability) and [evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals)      | Use traces for debugging first, then move into evaluation loops.                               |
| Build a voice-first workflow             | [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents)                                                                                                          | Use the SDK's voice pipeline and realtime agent patterns.                                      |

## Build with the SDK

Use the SDK track when your server owns orchestration, tool execution, state, and approvals. That path is the best fit when you want:

- typed application code in TypeScript or Python
- direct control over tools, MCP servers, and runtime behavior
- custom storage or server-managed conversation strategies
- tight integration with existing product logic or infrastructure

A typical SDK reading order is:

- Start with [Quickstart](https://developers.openai.com/api/docs/guides/agents/quickstart) to get one working run on screen.
- Use [Agent definitions](https://developers.openai.com/api/docs/guides/agents/define-agents) and [Models and providers](https://developers.openai.com/api/docs/guides/agents/models) to shape one specialist cleanly.
- Continue to [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents), [Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration), and [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals) as the workflow grows more complex.
- Use [Results and state](https://developers.openai.com/api/docs/guides/agents/results) and [Integrations and observability](https://developers.openai.com/api/docs/guides/agents/integrations-observability) when application logic depends on the run object or deeper visibility into behavior.
``````
:::
:::

