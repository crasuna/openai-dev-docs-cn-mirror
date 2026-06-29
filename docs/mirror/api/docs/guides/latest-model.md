---
title: "使用 GPT-5.5"
description: "Learn how to use and migrate to GPT-5.5, the latest model in the OpenAI API."
outline: deep
---

# 使用 GPT-5.5

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/latest-model](https://developers.openai.com/api/docs/guides/latest-model)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/latest-model.md](https://developers.openai.com/api/docs/guides/latest-model.md)
- 抓取时间：2026-06-27T05:54:03.475Z
- Checksum：`668b5faf9d05cbf1df51f31e05dd725ba831ef795f9349fa8e4c616aec1374ef`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 简介

GPT-5.5 提高了复杂生产工作流的基线能力。它非常适合编码用例、重度使用工具的 agent、有事实依据的助手、长上下文检索、从产品规格到计划的工作流，以及执行质量和回答润色度都很关键的面向客户工作流。

要充分发挥 GPT-5.5 的能力，请把它当作一个需要重新调优的新模型系列，而不是 `gpt-5.2` 或 `gpt-5.4` 的直接替代品。迁移时应从新的基线开始，而不是把旧 prompt 栈中的每条指令都搬过来。先使用能保留产品契约的最小 prompt，再结合代表性样例调优 reasoning effort、verbosity、工具描述和输出格式。

GPT-5.5 支持 GPT-5.4 已经可用的所有 API 功能，包括 [prompt caching](/mirror/api/docs/guides/prompt-caching)、[hosted tools](/mirror/api/docs/guides/tools#available-tools)、[tool search](/mirror/api/docs/guides/tools-tool-search)、[compaction](/mirror/api/docs/guides/compaction)，以及手动重放 assistant items 时的 `phase` 处理。

有关成功 prompting 模式的示例，请参阅 [GPT-5.5 Prompting Guide](/mirror/api/docs/guides/prompt-guidance)。

## 新变化

- **更高效的推理：** GPT-5.5 即使在相同 reasoning effort 下，也能用比以往模型更少的 reasoning tokens 达到强结果。这在复杂、重度使用工具或多步骤工作流中尤其有用，因为 token 节省会不断累积。
- **在 outcome-first prompt 下更强的任务执行能力：** GPT-5.5 更擅长从清晰目标出发、保留约束，并把产品意图转化为具体下一步。请描述预期结果、成功标准、允许的副作用、证据规则和输出形态。除非确切路径很重要，否则避免逐步过程指导。
- **更强且更精确的工具使用：** GPT-5.5 对大型工具面、多步骤服务工作流和长时间运行的 agent 任务尤其有用。它在工具选择和参数使用上通常更精确。
- **语气通常更润色，但也可能更直接：** GPT-5.5 往往能在更少 prompt 脚手架下生成更温暖、更易读的回答。

## 行为变化

1. **Reasoning effort 现在默认为 `medium`：** GPT-5.5 的默认 reasoning effort 是 `medium`。应把 `medium` 作为兼顾质量、可靠性、延迟和成本的推荐均衡起点。对于延迟敏感的工作流，如果工具使用、规划、搜索或多步骤决策仍然重要，请先评估 `low`，再考虑 `none`。仅在轻量语音轮次、快速信息检索、分类等不需要推理或多段工具调用的延迟关键任务中保留 `none`。只有当 evals 显示质量提升可衡量并足以证明额外延迟和成本合理时，才提高到 `high` 或 `xhigh`。有关推荐设置的更多细节，请参阅 [Reasoning models documentation](/mirror/api/docs/guides/reasoning)。

   更高的 reasoning effort 并不自动更好。如果任务存在相互冲突的指令、薄弱的停止标准或开放式工具访问，更高 effort 可能导致过度思考、不必要的搜索或输出质量退化。只有当 evals 显示质量提升可衡量时，才提高 effort。

2. **图像输入默认保留更多视觉细节：** GPT-5.5 更新了图像输入的默认处理方式，以保留更多视觉细节并提升 computer use 性能。当 `image_detail` 未设置或设为 `auto` 时，模型现在使用 `original` 行为，在不缩放的情况下保留最高 10,240,000 像素或 6,000 像素维度限制内的图像。对于 `high`，请直接指定该值；它会在不缩放的情况下保留最高 2,500,000 像素或 2,048 像素维度限制内的图像。`low` 现在更侧重上下文效率，并且会比以前的模型更积极地缩放超过 512 像素维度限制的图像。参阅 [Images and vision documentation](/mirror/api/docs/guides/images-vision)。

3. **改进的指令遵循：** GPT-5.5 会以更字面、更彻底的方式解释 prompt，使产品需要时可以使用具体、描述性的指令。请定义成功标准和停止规则，尤其是长时间运行、重度使用工具或取证型工作流。参阅 [Write outcome-first prompts](/mirror/api/docs/guides/prompt-guidance#outcome-first-prompts-and-stopping-conditions) 和 [Keep the right specificity](/mirror/api/docs/guides/prompt-guidance#formatting)。

4. **默认风格更简洁直接：** GPT-5.5 默认倾向于高效、直接、以任务为中心。这对许多生产工作流有用，但面向客户或对话式体验可能需要明确的人格、温暖感、理由和格式指导。请有意使用 `text.verbosity`：`medium` 是默认值，而 `low` 通常是简洁回答更好的起点。参阅 [GPT-5.5 prompting guide](/mirror/api/docs/guides/prompt-guidance)。

5. **编码工作流需要更强的编排：** GPT-5.5 更适合需要规划、工具使用、代码库导航、验证和多步骤执行的复杂编码任务。对于编码 agent，应明确复用、subagent 委派、测试预期、验收标准，以及何时继续、何时请求帮助。

## 迁移快速入门

### 使用 Codex 自动迁移

Codex 可以使用 [OpenAI Docs Skill](https://github.com/openai/skills/tree/main/skills/.curated/openai-docs) 应用本指南中的推荐变更。

```text
$openai-docs migrate this project to gpt-5.5
```

要在其他编码 agent 中使用此 skill，请从 [OpenAI skills repository](https://github.com/openai/skills/tree/main/skills/.curated/openai-docs) 下载。

### API 和模型参数

- 将模型 slug 更新为 `gpt-5.5`。
- 对任何推理、工具调用或多轮用例使用 Responses API。
- 调优 `reasoning.effort`。使用 `low` 获得高效推理，使用 `medium` 作为延迟/性能曲线上的均衡点，使用 `high` 处理需要困难推理且延迟不那么关键的复杂 agentic 任务，使用 `xhigh` 处理最困难的异步 agentic 任务，或测试模型智能边界的 evals。参阅 [Reasoning models documentation](/mirror/api/docs/guides/reasoning)。
- 要配置更简洁的回答，请将 `text.verbosity` 设为 `low`。在 GPT-5.5 上，这会比 GPT-5.4 的 `low` verbosity 产生按比例更简洁的回答。
- 对于重度使用工具或长时间运行的工作流，请确认你的应用正确处理 `phase`、preambles 和 assistant-item replay。
- 从准确性、token 消耗和端到端延迟方面与其他模型进行基准比较。

### Prompting

- 陈述预期结果和成功标准。
- 减少或移除详细的逐步过程指导。除非产品要求固定路径，否则让 GPT-5.5 自行选择路径。
- 尽可能从 prompt 中移除输出 schema 定义。改用 [Structured Outputs](/mirror/api/docs/guides/structured-outputs)。
- 针对缓存优化 prompt：[静态部分在前，动态部分在后](/mirror/api/docs/guides/prompt-caching)。
- 去掉当前日期。模型已经知道当前 UTC 日期。
- 根据 [Prompting GPT-5.5](/mirror/api/docs/guides/prompt-guidance) 中的指导审查并优化你的 prompt。

## 使用 reasoning models

这份指导适用于 GPT-5 系列模型，每当团队将工作负载迁移到 reasoning models 时都值得重新审视。GPT-5.5 延续了许多最早出现在早期模型中的能力；如果你正从更早的 GPT-5 模型、GPT-4.1 或 o3 等 reasoning model 迁移，这些能力仍值得回顾。

团队可能会忽略这些功能，因为它们一部分位于 API 配置和编排中，而不是 prompt 本身。Responses API、reasoning controls、verbosity、structured outputs、prompt caching、工具设计、hosted tools 和状态管理结合使用，可以帮助 reasoning models 在智能、可靠性、延迟和成本表现上发挥最佳效果。

- **Responses API：** GPT-5.5 最适合在 [Responses API](/mirror/api/docs/guides/migrate-to-responses) 中使用。使用 `previous_response_id` 处理多轮状态。对于无状态或 Zero Data Retention 流程，每轮传回相关的已返回 output items。详情参阅 [Passing context from the previous response](/mirror/api/docs/guides/conversation-state#passing-context-from-the-previous-response)。
- **Reasoning effort：** 使用 `reasoning.effort` 在 `low`、`medium`、`high` 或 `xhigh` 之间选择。默认值为 `medium`，但许多工作负载使用 `low` 就能表现良好。仅在低延迟比智能更重要的用例中保留 `none`。详细建议参阅 [Reasoning Models](/mirror/api/docs/guides/reasoning)。
- **Verbosity：** 使用 `text.verbosity` 控制输出长度。应把最终回答长度与推理质量分开看待；需要时指定字数预算、章节数量、表格宽度或仅 JSON 输出。
- **Structured Outputs：** 避免在 prompt 中描述预期输出 schema。使用 [Structured Outputs](/mirror/api/docs/guides/structured-outputs) 实现自动验证并提升准确性。
- **Prompt caching：** [Prompt caching](/mirror/api/docs/guides/prompt-caching) 会自动作用于符合条件的长 prompt，并可降低延迟和输入 token 成本。要最大化缓存命中率，请把稳定内容放在请求开头，把动态、用户特定的上下文放在靠后位置。对于具有公共前缀的重复流量，请一致使用 `prompt_cache_key`，并跟踪 `usage.prompt_tokens_details.cached_tokens`。
- **Tool calling：** GPT-5.5 支持与 GPT-5.4 相同的 tool-calling 模式，包括 function tools 和重度使用工具的 agent 工作流。请把大多数工具特定指导放在工具描述本身：工具做什么、何时使用、必需输入、副作用、重试安全性和常见错误模式。只有当工具特定上下文跨工具适用或会实质改变 agent 操作策略时，才把它加入系统指令。
- **Hosted tools 和 tool search：** 在适合工作流时优先使用 [OpenAI-hosted tools](/mirror/api/docs/guides/tools)，例如 web search、file search、code interpreter、image generation 和 computer use。Hosted tools 可以减少自定义编排负担，并使常见工具模式与 Responses API 和 Agents SDK 保持一致。需要调用自有系统、强制执行领域特定副作用或暴露内部业务工作流时，请使用自定义 function tools。对于大型工具目录，请考虑使用 [tool search](/mirror/api/docs/guides/tools-tool-search) 延迟工具定义，并只加载相关子集。
- **Tool preambles：** Preambles 可以改善聊天 UX，因为用户会在模型生成最终回答前看到一条初始且有用的状态更新。它们也让工具使用更易跟踪：模型可以先说明即将检查或执行什么，然后在工具结果到达后从同一 assistant 状态继续。
- **`phase` 处理：** 如果你的应用不使用 `previous_response_id`，而是通过每轮传回 output items 来手动管理 Responses 状态，请保留返回的 assistant output items 上的 `phase` 参数，并原样传回。使用 reasoning effort、preambles 或重复工具调用时这一点尤其重要。参阅 [Phase parameter](/mirror/api/docs/guides/reasoning#phase-parameter)。
- **Compaction：** 对于长时间运行的 agent，请有意使用 [conversation/state compaction](/mirror/api/docs/guides/compaction)。保留已完成动作、活跃假设、ID、工具结果、未解决阻塞项和下一个具体目标。
- **Agents SDK：** 对于新的 agentic 系统，请使用最新 [Agents SDK](/mirror/api/docs/guides/agents) 模式来处理工具编排、tracing、handoffs 和状态管理，而不是从头重建编排。
- **当前日期：** GPT-5.5 知道当前 UTC 日期。你不需要在系统指令中添加当前日期。仅当应用需要业务特定时区、政策生效日期、用户本地日期或其他非 UTC 参考点时，才添加明确日期或时区上下文。

:::

## English source

::: details 展开英文原文
::: v-pre
## Introduction

GPT-5.5 raises the baseline for complex production workflows. It’s a strong fit for coding use cases, tool-heavy agents, grounded assistants, long-context retrieval, product-spec-to-plan workflows, and customer-facing workflows where execution quality and response polish are critical.

To get the most out of GPT-5.5, treat it as a new model family to tune for, not a drop-in replacement for `gpt-5.2` or `gpt-5.4`. Begin migration with a fresh baseline instead of carrying over every instruction from an older prompt stack. Start with the smallest prompt that preserves the product contract, then tune reasoning effort, verbosity, tool descriptions, and output format against representative examples.

GPT-5.5 supports all API features that were already available with GPT-5.4, including [prompt caching](/mirror/api/docs/guides/prompt-caching), [hosted tools](/mirror/api/docs/guides/tools#available-tools), [tool search](/mirror/api/docs/guides/tools-tool-search), [compaction](/mirror/api/docs/guides/compaction), and `phase` handling for manually replayed assistant items.

See the [GPT-5.5 Prompting Guide](/mirror/api/docs/guides/prompt-guidance) for examples of successful prompting patterns.

## What's new

- **More efficient reasoning:** GPT-5.5 reaches strong results with fewer reasoning tokens than prior models, even at the same reasoning effort. This is especially useful in complex, tool-heavy, or multi-step workflows where token savings compound.
- **Stronger task execution with outcome-first prompts:** GPT-5.5 is better at working from a clear goal, preserving constraints, and turning product intent into concrete next steps. Describe the expected outcome, success criteria, allowed side effects, evidence rules, and output shape. Avoid step-by-step process guidance unless the exact path matters.
- **Stronger and more precise tool use:** GPT-5.5 is especially useful on large tool surfaces, multi-step service workflows, and long-running agent tasks. It tends to be more precise in tool selection and argument use.
- **Tone is often more polished, but can be more direct:** GPT-5.5 often produces warmer, more readable answers with less prompt scaffolding.

## Behavioral changes

1. **Reasoning effort now defaults to `medium`:** GPT-5.5 defaults to `medium` reasoning effort. Treat `medium` as the recommended balanced starting point for quality, reliability, latency, and cost. For latency-sensitive workflows, evaluate `low` before `none` when tool use, planning, search, or multi-step decision making still matters. Reserve `none` for latency-critical tasks that don't need reasoning or multi-chained tool calls, such as lightweight voice turns, fast information retrieval, and classification. Increase to `high` or `xhigh` only when evals show a measurable quality gain that justifies the extra latency and cost. See the [Reasoning models documentation](/mirror/api/docs/guides/reasoning) for more details on recommended settings.

   Higher reasoning effort isn't automatically better. If the task has conflicting instructions, weak stopping criteria, or open-ended tool access, higher effort can lead to overthinking, unnecessary searching, or output quality regressions. Increase effort only when evals show a measurable quality gain.

2. **Image inputs preserve more visual detail by default:** GPT-5.5 updates the default handling for image inputs to preserve more visual detail and improve computer use performance. When `image_detail` is unset or set to `auto`, the model now uses `original` behavior, preserving images without resizing up to 10,240,000 pixels or a 6,000-pixel dimension limit. For `high`, specify the value directly; it preserves images without resizing up to 2,500,000 pixels or a 2,048-pixel dimension limit. `low` now focuses on context efficiency and resizes images above a 512-pixel dimension limit more aggressively than previous models. See the [Images and vision documentation](/mirror/api/docs/guides/images-vision).

3. **Improved instruction following:** GPT-5.5 interprets prompts in a literal and thorough manner, enabling specific, descriptive instructions when the product requires them. Define success criteria and stopping rules, especially for long-running, tool-heavy, or evidence-gathering workflows. See [Write outcome-first prompts](/mirror/api/docs/guides/prompt-guidance#outcome-first-prompts-and-stopping-conditions) and [Keep the right specificity](/mirror/api/docs/guides/prompt-guidance#formatting).

4. **Default style is more concise and direct:** GPT-5.5 tends to be efficient, direct, and task-oriented by default. This is useful for many production workflows, but customer-facing or conversational experiences may need explicit personality, warmth, rationale, and formatting guidance. Use `text.verbosity` intentionally: `medium` is the default, and `low` is often a better starting point for concise responses. See the [GPT-5.5 prompting guide](/mirror/api/docs/guides/prompt-guidance).

5. **Coding workflows need stronger orchestration:** GPT-5.5 is better suited to complex coding tasks that require planning, tool use, codebase navigation, verification, and multi-step execution. For coding agents, be explicit about reuse, subagent delegation, test expectations, acceptance criteria, and when to continue versus ask for help.

## Migration quickstart

### Automated migration with Codex

Codex can apply the recommended changes in this guide with the [OpenAI Docs Skill](https://github.com/openai/skills/tree/main/skills/.curated/openai-docs).

```text
$openai-docs migrate this project to gpt-5.5
```

To use this skill in other coding agents, download it from the [OpenAI skills repository](https://github.com/openai/skills/tree/main/skills/.curated/openai-docs).

### API and model parameters

- Update the model slug to `gpt-5.5`.
- Use the Responses API for any reasoning, tool-calling, or multi-turn use case.
- Tune `reasoning.effort`. Use `low` for efficient reasoning, `medium` for a balanced point on the latency/performance curve, `high` for complex agentic tasks that require hard reasoning and where latency matters less, and `xhigh` for the hardest asynchronous agentic tasks or evals that test the bounds of model intelligence. See the [Reasoning models documentation](/mirror/api/docs/guides/reasoning).
- To configure for more concise responses, set `text.verbosity` to `low`. On GPT-5.5, this will result in proportionally more concise responses than `low` verbosity with GPT-5.4.
- For tool-heavy or long-running workflows, verify that your application handles `phase`, preambles, and assistant-item replay correctly.
- Benchmark against other models on accuracy, token consumption, and end-to-end latency.

### Prompting

- State the expected outcome and success criteria.
- Reduce or remove detailed step-by-step process guidance. Let GPT-5.5 choose the path unless the product requires that path.
- Remove output schema definitions from the prompt where possible. Use [Structured Outputs](/mirror/api/docs/guides/structured-outputs) instead.
- Optimize your prompt for caching: [static parts first, dynamic parts last](/mirror/api/docs/guides/prompt-caching).
- Drop the current date. The model is already aware of the current UTC date.
- Review and optimize your prompts based on the guidance in [Prompting GPT-5.5](/mirror/api/docs/guides/prompt-guidance).

## Using reasoning models

This guidance applies to GPT-5 series models and is worth revisiting whenever teams move workloads onto reasoning models. GPT-5.5 carries forward many capabilities that first appeared in earlier models, but they're still worth reviewing if you are moving from an earlier GPT-5 model, GPT-4.1, or a reasoning model such as o3.

Teams can overlook these features because they sit partly in API configuration and orchestration rather than in the prompt itself. Used together, the Responses API, reasoning controls, verbosity, structured outputs, prompt caching, tool design, hosted tools, and state management help reasoning models deliver their best intelligence, reliability, latency, and cost profile.

- **Responses API:** GPT-5.5 works best in the [Responses API](/mirror/api/docs/guides/migrate-to-responses). Use `previous_response_id` for multi-turn state handling. For stateless or Zero Data Retention flows, pass back the relevant returned output items each turn. See [Passing context from the previous response](/mirror/api/docs/guides/conversation-state#passing-context-from-the-previous-response) for details.
- **Reasoning effort:** Use `reasoning.effort` to choose between `low`, `medium`, `high`, or `xhigh`. The default is `medium`, but many workloads will perform well with `low`. Reserve `none` for use cases where low latency is more important than intelligence. See [Reasoning Models](/mirror/api/docs/guides/reasoning) for detailed recommendations.
- **Verbosity:** Use `text.verbosity` to control output length. Treat final answer length as separate from reasoning quality; specify word budgets, section counts, table widths, or JSON-only output where needed.
- **Structured Outputs:** Avoid describing the expected output schema in the prompt. Use [Structured Outputs](/mirror/api/docs/guides/structured-outputs) for automatic validation and increased accuracy.
- **Prompt caching:** [Prompt caching](/mirror/api/docs/guides/prompt-caching) works automatically for eligible long prompts and can reduce latency and input-token cost. To maximize cache hits, keep stable content at the beginning of the request. Put dynamic user-specific context near the end. For repeated traffic with common prefixes, use `prompt_cache_key` consistently and track `usage.prompt_tokens_details.cached_tokens`.
- **Tool calling:** GPT-5.5 supports the same tool-calling patterns as GPT-5.4, including function tools and tool-heavy agent workflows. Put most tool-specific guidance in the tool descriptions themselves: what the tool does, when to use it, required inputs, side effects, retry safety, and common error modes. Add tool-specific context to system instructions only when it applies across tools or materially changes the agent's operating policy.
- **Hosted tools and tool search:** Prefer [OpenAI-hosted tools](/mirror/api/docs/guides/tools) where they fit the workflow, such as web search, file search, code interpreter, image generation, and computer use. Hosted tools reduce custom orchestration burden and keep common tool patterns aligned with the Responses API and Agents SDK. Use custom function tools when you need to call your own systems, enforce domain-specific side effects, or expose internal business workflows. For large tool catalogs, consider using [tool search](/mirror/api/docs/guides/tools-tool-search) to defer tool definitions and load only the relevant subset.
- **Tool preambles:** Preambles can improve chat UX because the user sees an initial, useful status update before the model generates the final response. They also make tool use easier to follow: the model can state what it's about to check or do, then continue from that same assistant state after tool results arrive.
- **`phase` handling:** If your application manually manages Responses state by passing output items back each turn instead of using `previous_response_id`, preserve the `phase` parameter on returned assistant output items and pass it back unchanged. This is especially important when using reasoning effort, preambles, or repeated tool calls. See [Phase parameter](/mirror/api/docs/guides/reasoning#phase-parameter).
- **Compaction:** For long-running agents, use [conversation/state compaction](/mirror/api/docs/guides/compaction) intentionally. Preserve completed actions, active assumptions, IDs, tool outcomes, unresolved blockers, and the next concrete goal.
- **Agents SDK:** For new agentic systems, use the latest [Agents SDK](/mirror/api/docs/guides/agents) patterns for tool orchestration, tracing, handoffs, and state management rather than rebuilding orchestration from scratch.
- **Current date:** GPT-5.5 is aware of the current date in UTC. You don't need to add the current date to system instructions. Add explicit date or timezone context only when the application needs a business-specific timezone, policy-effective date, user-local date, or other non-UTC reference point.

:::
:::

