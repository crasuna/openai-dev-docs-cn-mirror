---
status: needs-review
sourceId: ca9e26434a4b
sourceChecksum: ca9e26434a4b790306f78fefc74a3d108116fd7a25d6b61b980296675410ed4b
sourceUrl: https://developers.openai.com/api/docs/guides/agents
translatedAt: 2026-06-27T16:52:06+08:00
translator: codex-gpt-5.5-xhigh
---

# Agents SDK 智能体 SDK

agent 是能够规划、调用工具、跨专家协作，并保留足够状态以完成多步骤工作的应用。

- 当一次模型调用加上工具和应用自有逻辑就足够时，使用 [**Responses API**](https://developers.openai.com/api/reference/responses/overview)。
- 当你的应用负责拥有编排、工具执行、审批和状态时，使用 **Agents SDK** 页面。

## 运行你的第一个 agent

从 [Agents SDK quickstart](https://developers.openai.com/api/docs/guides/agents/quickstart) 开始，安装 SDK、定义一个 agent，并运行它。成功运行后，回到这里选择你的应用接下来需要的能力。

## 获取 Agents SDK

使用 GitHub 仓库获取更多示例、issues 和特定语言的参考详情。

<div class="not-prose mt-4 grid gap-3">
  <a
    href="https://github.com/openai/openai-agents-js"
    class="block no-underline hover:no-underline"
    target="_blank"
    rel="noopener noreferrer"
  >
    

<span slot="icon">
        </span>
      在 GitHub 上打开 TypeScript SDK 仓库。


  </a>
  <a
    href="https://github.com/openai/openai-agents-python"
    class="block no-underline hover:no-underline"
    target="_blank"
    rel="noopener noreferrer"
  >
    

<span slot="icon">
        </span>
      在 GitHub 上打开 Python SDK 仓库。


  </a>
</div>

## 选择你的起点

| 如果你想要                               | 从这里开始                                                                                                                                             | 原因                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| 构建代码优先的 agent 应用                | [快速开始](https://developers.openai.com/api/docs/guides/agents/quickstart)                                                                            | 这是获得可运行 SDK 集成的最短路径。                                                            |
| 干净地定义一个专家                       | [Agent 定义](https://developers.openai.com/api/docs/guides/agents/define-agents)                                                                       | 当你仍在塑造单个 agent 的契约时，从这里开始。                                                   |
| 选择模型、默认值和传输                   | [模型和提供方](https://developers.openai.com/api/docs/guides/agents/models)                                                                            | 当模型选择、提供方设置或传输策略会影响工作流时使用。                                           |
| 理解运行时循环和状态                     | [运行 agent](https://developers.openai.com/api/docs/guides/agents/running-agents)                                                                      | agent 循环、流式传输和延续策略都在这里。                                                        |
| 在基于容器的环境中运行工作               | [Sandbox agent](https://developers.openai.com/api/docs/guides/agents/sandboxes)                                                                        | 当 agent 需要文件、命令、包、快照、挂载或提供方链接时使用。                                    |
| 设计专家职责归属                         | [编排和 handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)                                                                  | 当你需要不止一个 agent，并且必须决定由谁拥有回复时使用。                                       |
| 添加验证或人工审核                       | [Guardrails 和人工审核](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)                                                     | 当工作流应在风险工作继续之前阻止或暂停时使用。                                                 |
| 理解一次运行返回什么                     | [结果和状态](https://developers.openai.com/api/docs/guides/agents/results)                                                                             | 本页解释 final output、可恢复状态和下一轮交互界面。                                            |
| 添加托管工具、函数工具或 MCP             | [使用工具](https://developers.openai.com/api/docs/guides/tools#usage-in-the-agents-sdk) 和 [集成和可观测性](https://developers.openai.com/api/docs/guides/agents/integrations-observability) | 工具语义位于平台工具文档中；SDK 专属的 MCP 和 tracing 位于这里。                                |
| 检查并改进运行                           | [集成和可观测性](https://developers.openai.com/api/docs/guides/agents/integrations-observability) 和 [评估 agent 工作流](https://developers.openai.com/api/docs/guides/agent-evals)      | 先使用 traces 进行调试，然后进入评估循环。                                                      |
| 构建语音优先的工作流                     | [语音 agent](https://developers.openai.com/api/docs/guides/voice-agents)                                                                               | 使用 SDK 的语音 pipeline 和 realtime agent 模式。                                               |

## 使用 SDK 构建

当你的服务器负责拥有编排、工具执行、状态和审批时，请使用 SDK 路线。当你需要以下能力时，这条路线最适合：

- TypeScript 或 Python 中的类型化应用代码
- 直接控制工具、MCP 服务器和运行时行为
- 自定义存储或服务器管理的对话策略
- 与现有产品逻辑或基础设施紧密集成

典型的 SDK 阅读顺序是：

- 从 [快速开始](https://developers.openai.com/api/docs/guides/agents/quickstart) 开始，让一次运行出现在屏幕上。
- 使用 [Agent 定义](https://developers.openai.com/api/docs/guides/agents/define-agents) 和 [模型和提供方](https://developers.openai.com/api/docs/guides/agents/models) 干净地塑造一个专家。
- 随着工作流变得更复杂，继续阅读 [运行 agent](https://developers.openai.com/api/docs/guides/agents/running-agents)、[编排和 handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration) 和 [Guardrails 和人工审核](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)。
- 当应用逻辑依赖 run 对象，或需要更深入地观察行为时，使用 [结果和状态](https://developers.openai.com/api/docs/guides/agents/results) 和 [集成和可观测性](https://developers.openai.com/api/docs/guides/agents/integrations-observability)。
