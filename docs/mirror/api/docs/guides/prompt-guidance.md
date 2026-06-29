---
title: "GPT-5.5 提示词指南"
description: "Prompt guidance"
outline: deep
---

# GPT-5.5 提示词指南

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/prompt-guidance](https://developers.openai.com/api/docs/guides/prompt-guidance)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/prompt-guidance.md](https://developers.openai.com/api/docs/guides/prompt-guidance.md)
- 抓取时间：2026-06-27T05:54:05.206Z
- Checksum：`4cdfef851539602c5ff83a709710ae97b86e813ad69bdf47c7e83a89ca04c9a3`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
为 GPT-5.5 编写提示词时，请使用结果优先的目标、简洁的风格控制、检索预算和验证循环。

## GPT-5.5 相比 GPT-5.4 的新增内容
- 更短、结果优先的提示词通常比过程繁重的提示词栈效果更好。
- 更高效的推理意味着在升级之前，应重新评估 `low` 和 `medium` effort。
- 在工具密集的 Responses 工作流中，preambles、`phase` 处理以及 assistant-item replay 仍然重要。
- 明确的 personality、检索预算和验证规则有助于塑造面向客户的体验和 agentic UX。

当提示词定义目标结果，并为模型选择高效解决路径留出空间时，GPT-5.5 表现最好。与早期模型相比，你通常可以使用更短、更面向结果的提示词：描述好的结果是什么样、哪些约束重要、有哪些证据可用，以及最终答案应包含什么。

避免把旧提示词栈里的每一条指令都搬过来。旧版提示词经常过度规定流程，因为早期模型需要更多帮助才能保持正轨。对 GPT-5.5 来说，这可能增加噪声、缩小模型搜索空间，或导致回答过于机械。

如需更详细了解 GPT-5.5 行为变化，请先阅读 [Using GPT-5.5 guide](/mirror/api/docs/guides/latest-model)。本指南聚焦于这些行为变化带来的提示词调整。

这里的模式只是起点。请根据你的产品表面、工具、evals 和用户体验目标进行调整。

## 使用 Codex 自动迁移

Codex 可以使用 [OpenAI Docs Skill](https://github.com/openai/skills/tree/main/skills/.curated/openai-docs) 实现本指南中的变更。

```text
$openai-docs migrate this project to gpt-5.5
```

要在其他 coding agents 中使用此 skill，请从 [OpenAI skills repository](https://github.com/openai/skills/tree/main/skills/.curated/openai-docs) 下载。

## Personality 和行为

GPT-5.5 的默认风格高效、直接、以任务为导向。这对生产系统很有用：响应保持聚焦，行为更容易引导，并且模型会避免不必要的对话填充。

对于面向客户的助手、支持工作流、教练体验以及其他对话型产品，请同时定义 personality 和 collaboration style。

- **Personality** 控制助手听起来如何：语气、温度、直接程度、正式程度、幽默感、同理心和润色程度。
- **Collaboration style** 控制助手如何工作：何时提问、何时做假设、应当多主动、提供多少上下文、何时检查工作，以及如何处理不确定性或风险。

二者都应保持简短。Personality instructions 应塑造用户体验。Collaboration instructions 应塑造任务行为。二者都不应替代清晰目标、成功标准、工具规则或停止条件。

稳健、任务聚焦助手的 personality block 示例：

```text
# Personality
You are a capable collaborator: approachable, steady, and direct. Assume the user is competent and acting in good faith, and respond with patience, respect, and practical helpfulness.

Prefer making progress over stopping for clarification when the request is already clear enough to attempt. Use context and reasonable assumptions to move forward. Ask for clarification only when the missing information would materially change the answer or create meaningful risk, and keep any question narrow.

Stay concise without becoming curt. Give enough context for the user to understand and trust the answer, then stop. Use examples, comparisons, or simple analogies when they make the point easier to grasp. When correcting the user or disagreeing, be candid but constructive. When an error is pointed out, acknowledge it plainly and focus on fixing it.

Match the user's tone within professional bounds. Avoid emojis and profanity by default, unless the user explicitly asks for that style or has clearly established it as appropriate for the conversation.
```

富有表现力、协作型助手的 personality block 示例：

```text
# Personality
Adopt a vivid conversational presence: intelligent, curious, playful when appropriate, and attentive to the user's thinking. Ask good questions when the problem is blurry, then become decisive once there is enough context.

Be warm, collaborative, and polished. Conversation should feel easy and alive, but not chatty for its own sake. Offer a real point of view rather than merely mirroring the user, while staying responsive to their goals and constraints.

Be thoughtful and grounded when the task calls for synthesis or advice. State a clear recommendation when you have enough context, explain important tradeoffs, and name uncertainty without becoming evasive.
```

对于更有表现力的产品，可以明确加入温暖、好奇、幽默或观点，但保持这个 block 简短。用 personality 塑造体验，而不是用它来弥补目标不清或任务指令缺失。

## 用 preamble 改善首个可见 token 的时间

在流式应用中，用户会注意到第一个可见响应出现前的等待时间。GPT-5.5 可能会在输出可见文本前花时间推理、规划或准备工具调用。

对于较长或工具密集的任务，可以提示模型以简短 preamble 开始：一个简短的可见更新，确认请求并说明第一步。这可以改善感知响应速度，而不改变底层任务。

当任务可能超过一步、需要工具调用，或涉及长时间运行的 agent 工作流时，请使用此模式。

```text
Before any tool calls for a multi-step task, send a short user-visible update that acknowledges the request and states the first step. Keep it to one or two sentences.
```

对于暴露独立消息阶段的 coding agents，可以更明确一些：

```text
You must always start with an intermediary update before any content in the analysis channel if the task will require calling tools. The user update should acknowledge the request and explain your first step.
```

## 结果优先提示词与停止条件

当提示词定义目标结果、成功标准、约束和可用上下文，然后让模型选择路径时，GPT-5.5 最强。

对许多任务而言，描述目的地，而不是每个步骤。这样模型就有空间为任务选择合适的搜索、工具或推理策略。

优先使用这种方式：

```text
Resolve the customer's issue end to end.

Success means:
- the eligibility decision is made from the available policy and account data
- any allowed action is completed before responding
- the final answer includes completed_actions, customer_message, and blockers
- if evidence is missing, ask for the smallest missing field
```

**避免不必要的绝对规则。** 旧提示词经常使用 `ALWAYS`、`NEVER`、`must` 和 `only` 这类严格指令来控制模型行为。请将这些词用于真正不变的规则，例如安全规则、必需输出字段，或绝不应发生的动作。对于判断性决策，例如何时搜索、要求澄清、使用工具或持续迭代，请优先使用决策规则。

除非每一步都确实必需，否则避免这种指令风格：

```text
First inspect A, then inspect B, then compare every field, then think through
all possible exceptions, then decide which tool to call, then call the tool,
then explain the entire process to the user.
```

添加明确的停止条件：

```text
Resolve the user query in the fewest useful tool loops, but do not let loop minimization outrank correctness, accessible fallback evidence, calculations, or required citation tags for factual claims.

After each result, ask: "Can I answer the user's core request now with useful evidence and citations for the factual claims?" If yes, answer.
```

定义证据缺失时的行为：

```text
Use the minimum evidence sufficient to answer correctly, cite it precisely, then stop.
```

## 格式

GPT-5.5 在输出格式和结构上高度可控。当这种控制能够改善理解或产品适配时，请使用它。

设置 `text.verbosity`，描述预期输出形状，并将更重的结构留给那些确实能改善理解、或产品 UI 需要稳定 artifact 的场景。API 中 `text.verbosity` 的默认值为 `medium`；当你偏好更短、更简洁的响应时，请使用 `low`。

普通对话式格式：

```text
Let formatting serve comprehension. Use plain paragraphs as the default format for normal conversation, explanations, reports, documentation, and technical writeups. Keep the presentation clean and readable without making the structure feel heavier than the content.

Use headers, bold text, bullets, and numbered lists sparingly. Reach for them when the user requests them, when the answer needs clear comparison or ranking, or when the information would be harder to scan as prose. Otherwise, favor short paragraphs and natural transitions.

Respect formatting preferences from the user. If they ask for a terse answer, minimal formatting, no bullets, no headers, or a specific structure, follow that preference unless there is a strong reason not to.
```

加入明确的受众和长度指导：

```text
Write for a senior business audience. Keep the answer under 400 words. Use short paragraphs and only include bullets when they improve scannability. Prioritize the conclusion first, then the reasoning, then caveats.
```

对于编辑、改写、摘要或面向客户的消息，请先告诉模型要保留什么，再要求它改进风格。当你希望润色但不扩展时，这种模式很有用。

```text
Preserve the requested artifact, length, structure, and genre first. Quietly improve clarity, flow, and correctness. Do not add new claims, extra sections, or a more promotional tone unless explicitly requested.
```

## Grounding、引用和检索预算

对于 grounded answers，引用行为应成为提示词的一部分。定义哪些内容需要支持、什么算作足够证据，以及当证据缺失时模型应如何行动。没有证据不应自动变成事实性的“否”。如需更多细节和示例，请参阅 [citation formatting guide](/mirror/api/docs/guides/citation-formatting)。

### 添加明确的检索预算

检索预算是搜索的停止规则。它们告诉模型何时已有足够证据。

```text
For ordinary Q&A, start with one broad search using short, discriminative keywords. If the top results contain enough citable support for the core request, answer from those results instead of searching again.

Make another retrieval call only when:
- The top results do not answer the core question.
- A required fact, parameter, owner, date, ID, or source is missing.
- The user asked for exhaustive coverage, a comparison, or a comprehensive list.
- A specific document, URL, email, meeting, record, or code artifact must be read.
- The answer would otherwise contain an important unsupported factual claim.

Do not search again to improve phrasing, add examples, cite nonessential details, or support wording that can safely be made more generic.
```

## 创意草稿护栏

对于起草任务，请告诉模型哪些主张必须来自来源，哪些部分可以进行创意写作。这对 slides、launch copy、customer summaries、talk tracks、leadership blurbs 和 narrative framing 尤其重要。

```text
For creative or generative requests such as slides, leadership blurbs, outbound copy, summaries for sharing, talk tracks, or narrative framing, distinguish source-backed facts from creative wording.

- Use retrieved or provided facts for concrete product, customer, metric, roadmap, date, capability, and competitive claims, and cite those claims.
- Do not invent specific names, first-party data claims, metrics, roadmap status, customer outcomes, or product capabilities to make the draft sound stronger.
- If there is little or no citable support, write a useful generic draft with placeholders or clearly labeled assumptions rather than unsupported specifics.
```

## 前端工程和视觉品味

对于前端工作，请参考[示例说明](/mirror/api/docs/guides/frontend-prompt)，了解引导 UI 质量的实用方法。这些内容涵盖产品和用户上下文、与设计系统对齐、首屏可用性、熟悉的控件、预期状态、响应式行为，以及应避免的常见生成式 UI 默认问题，例如泛化的 hero、嵌套卡片、装饰性渐变、可见说明文字和破损布局。

## 提示模型检查自己的工作

在可以验证时，为 GPT-5.5 提供能够检查输出的工具。

对于 coding agents，请要求具体的验证命令：

```text
After making changes, run the most relevant validation available:
- targeted unit tests for changed behavior
- type checks or lint checks when applicable
- build checks for affected packages
- a minimal smoke test when full validation is too expensive

If validation cannot be run, explain why and describe the next best check.
```

对于视觉 artifact，请要求渲染后检查：

```text
Render the artifact before finalizing. Inspect the rendered output for layout, clipping, spacing, missing content, and visual consistency. Revise until the rendered output matches the requirements.
```

对于工程和规划任务，让实施计划可追踪：

```text
For implementation plans, include:
- requirements and where each is addressed
- named resources, files, APIs, or systems involved
- state transitions or data flow where relevant
- validation commands or checks
- failure behavior
- privacy and security considerations
- open questions that materially affect implementation
```

## Phase 参数

从 GPT-5.4 开始，长时间运行或工具密集的 Responses 工作流可以使用 assistant-item `phase` 值来区分中间更新和最终答案。GPT-5.5 使用相同模式。

如果使用 `previous_response_id`，API 会自动保留先前 assistant state。如果你的应用手动将 assistant output items replay 到下一次请求中，请保留每个原始 `phase` 值，并原样传回。在响应包含 preambles、重复工具调用，或中间 assistant 更新后的最终答案时，这一点最重要。

```text
If manually replaying assistant items:
- Preserve assistant `phase` values exactly.
- Use `phase: "commentary"` for intermediate user-visible updates.
- Use `phase: "final_answer"` for the completed answer.
- Do not add `phase` to user messages.
```

## 建议的提示词结构

将此结构作为复杂提示词的起点。保持每个部分简短。只有在细节会改变行为时才添加。

```text
Role: [1-2 sentences defining the model's function, context, and job]

# Personality
[tone, demeanor, and collaboration style]

# Goal
[user-visible outcome]

# Success criteria
[what must be true before the final answer]

# Constraints
[policy, safety, business, evidence, and side-effect limits]

# Output
[sections, length, and tone]

# Stop rules
[when to retry, fallback, abstain, ask, or stop]
```

:::

## English source

::: details 展开英文原文
::: v-pre
Prompt GPT-5.5 with outcome-first goals, concise style controls, retrieval budgets, and validation loops.

## New in GPT-5.5 vs GPT-5.4
- Shorter, outcome-first prompts usually work better than process-heavy prompt stacks.
- More efficient reasoning means `low` and `medium` effort should be re-evaluated before escalating.
- Preambles, `phase` handling, and assistant-item replay remain important for tool-heavy Responses workflows.
- Explicit personality, retrieval budgets, and validation rules help shape customer-facing and agentic UX.

GPT-5.5 works best when prompts define the outcome and leave room for the model to choose an efficient solution path. Compared with earlier models, you can often use shorter, more outcome-oriented prompts: describe what good looks like, what constraints matter, what evidence is available, and what the final answer should contain.

Avoid carrying over every instruction from an older prompt stack. Legacy prompts often over-specify the process because earlier models needed more help staying on track. With GPT-5.5, that can add noise, narrow the model's search space, or lead to overly mechanical answers.

For more detail on GPT-5.5 behavior changes, start with the [Using GPT-5.5 guide](/mirror/api/docs/guides/latest-model). This guide focuses on prompt changes that follow from those behavior changes.

The patterns here are starting points. Adapt them to your product surface, tools, evals, and user experience goals.

## Automated migration with Codex

Codex can implement the changes from this guide with the [OpenAI Docs Skill](https://github.com/openai/skills/tree/main/skills/.curated/openai-docs).

```text
$openai-docs migrate this project to gpt-5.5
```

To use this skill in other coding agents, download it from the [OpenAI skills repository](https://github.com/openai/skills/tree/main/skills/.curated/openai-docs).

## Personality and behavior

GPT-5.5's default style is efficient, direct, and task-oriented. This is useful for production systems: responses stay focused, behavior is easier to steer, and the model avoids unnecessary conversational padding.

For customer-facing assistants, support workflows, coaching experiences, and other conversational products, define both personality and collaboration style.

- **Personality** controls how the assistant sounds: tone, warmth, directness, formality, humor, empathy, and level of polish.
- **Collaboration style** controls how the assistant works: when it asks questions, when it makes assumptions, how proactive it should be, how much context it gives, when it checks work, and how it handles uncertainty or risk.

Keep both short. Personality instructions should shape the user experience. Collaboration instructions should shape task behavior. Neither should replace clear goals, success criteria, tool rules, or stopping conditions.

Example personality block for a steady task-focused assistant:

```text
# Personality
You are a capable collaborator: approachable, steady, and direct. Assume the user is competent and acting in good faith, and respond with patience, respect, and practical helpfulness.

Prefer making progress over stopping for clarification when the request is already clear enough to attempt. Use context and reasonable assumptions to move forward. Ask for clarification only when the missing information would materially change the answer or create meaningful risk, and keep any question narrow.

Stay concise without becoming curt. Give enough context for the user to understand and trust the answer, then stop. Use examples, comparisons, or simple analogies when they make the point easier to grasp. When correcting the user or disagreeing, be candid but constructive. When an error is pointed out, acknowledge it plainly and focus on fixing it.

Match the user's tone within professional bounds. Avoid emojis and profanity by default, unless the user explicitly asks for that style or has clearly established it as appropriate for the conversation.
```

Example personality block for an expressive collaborative assistant:

```text
# Personality
Adopt a vivid conversational presence: intelligent, curious, playful when appropriate, and attentive to the user's thinking. Ask good questions when the problem is blurry, then become decisive once there is enough context.

Be warm, collaborative, and polished. Conversation should feel easy and alive, but not chatty for its own sake. Offer a real point of view rather than merely mirroring the user, while staying responsive to their goals and constraints.

Be thoughtful and grounded when the task calls for synthesis or advice. State a clear recommendation when you have enough context, explain important tradeoffs, and name uncertainty without becoming evasive.
```

For more expressive products, add warmth, curiosity, humor, or point of view explicitly, but keep the block short. Use personality to shape the experience, not to compensate for unclear goals or missing task instructions.

## Improve time to first visible token with a preamble

In streaming applications, users notice how long it takes before the first visible response appears. GPT-5.5 may spend time reasoning, planning, or preparing tool calls before emitting visible text.

For longer or tool-heavy tasks, prompt the model to start with a short preamble: a brief visible update that acknowledges the request and states the first step. This can improve perceived responsiveness without changing the underlying task.

Use this pattern when the task may take more than one step, require tool calls, or involve a long-running agent workflow.

```text
Before any tool calls for a multi-step task, send a short user-visible update that acknowledges the request and states the first step. Keep it to one or two sentences.
```

For coding agents that expose separate message phases, you can be more explicit:

```text
You must always start with an intermediary update before any content in the analysis channel if the task will require calling tools. The user update should acknowledge the request and explain your first step.
```

## Outcome-first prompts and stopping conditions

GPT-5.5 is strongest when the prompt defines the target outcome, success criteria, constraints, and available context, then lets the model choose the path.

For many tasks, describe the destination rather than every step. This gives the model room to choose the right search, tool, or reasoning strategy for the task.

Prefer this:

```text
Resolve the customer's issue end to end.

Success means:
- the eligibility decision is made from the available policy and account data
- any allowed action is completed before responding
- the final answer includes completed_actions, customer_message, and blockers
- if evidence is missing, ask for the smallest missing field
```

**Avoid unnecessary absolute rules.** Older prompts often use strict instructions like `ALWAYS`, `NEVER`, `must`, and `only` to control model behavior. Use those words for true invariants, such as safety rules, required output fields, or actions that should never happen. For judgment calls, such as when to search, ask for clarification, use a tool, or keep iterating, prefer decision rules instead.

Avoid this style of instruction unless every step is truly required:

```text
First inspect A, then inspect B, then compare every field, then think through
all possible exceptions, then decide which tool to call, then call the tool,
then explain the entire process to the user.
```

Add explicit stopping conditions:

```text
Resolve the user query in the fewest useful tool loops, but do not let loop minimization outrank correctness, accessible fallback evidence, calculations, or required citation tags for factual claims.

After each result, ask: "Can I answer the user's core request now with useful evidence and citations for the factual claims?" If yes, answer.
```

Define missing-evidence behavior:

```text
Use the minimum evidence sufficient to answer correctly, cite it precisely, then stop.
```

## Formatting

GPT-5.5 is highly steerable on output format and structure. Use that control when it improves comprehension or product fit.

Set `text.verbosity`, describe the expected output shape, and reserve heavier structure for cases where it improves comprehension or your product UI needs a stable artifact. The API default for `text.verbosity` is `medium`; use `low` when you prefer shorter, more concise responses.

Plain conversational formatting:

```text
Let formatting serve comprehension. Use plain paragraphs as the default format for normal conversation, explanations, reports, documentation, and technical writeups. Keep the presentation clean and readable without making the structure feel heavier than the content.

Use headers, bold text, bullets, and numbered lists sparingly. Reach for them when the user requests them, when the answer needs clear comparison or ranking, or when the information would be harder to scan as prose. Otherwise, favor short paragraphs and natural transitions.

Respect formatting preferences from the user. If they ask for a terse answer, minimal formatting, no bullets, no headers, or a specific structure, follow that preference unless there is a strong reason not to.
```

Add explicit audience and length guidance:

```text
Write for a senior business audience. Keep the answer under 400 words. Use short paragraphs and only include bullets when they improve scannability. Prioritize the conclusion first, then the reasoning, then caveats.
```

For editing, rewriting, summaries, or customer-facing messages, tell the model what to preserve before asking it to improve style. This pattern is useful when you want polish without expansion.

```text
Preserve the requested artifact, length, structure, and genre first. Quietly improve clarity, flow, and correctness. Do not add new claims, extra sections, or a more promotional tone unless explicitly requested.
```

## Grounding, citations, and retrieval budgets

For grounded answers, citation behavior should be part of the prompt. Define what needs support, what counts as enough evidence, and how the model should behave when evidence is missing. Absence of evidence shouldn't automatically become a factual "no." For more details and examples, see the [citation formatting guide](/mirror/api/docs/guides/citation-formatting).

### Add an explicit retrieval budget

Retrieval budgets are stopping rules for search. They tell the model when enough evidence is enough.

```text
For ordinary Q&A, start with one broad search using short, discriminative keywords. If the top results contain enough citable support for the core request, answer from those results instead of searching again.

Make another retrieval call only when:
- The top results do not answer the core question.
- A required fact, parameter, owner, date, ID, or source is missing.
- The user asked for exhaustive coverage, a comparison, or a comprehensive list.
- A specific document, URL, email, meeting, record, or code artifact must be read.
- The answer would otherwise contain an important unsupported factual claim.

Do not search again to improve phrasing, add examples, cite nonessential details, or support wording that can safely be made more generic.
```

## Creative drafting guardrails

For drafting tasks, tell the model which claims must come from sources and which parts may be creatively written. This is especially important for slides, launch copy, customer summaries, talk tracks, leadership blurbs, and narrative framing.

```text
For creative or generative requests such as slides, leadership blurbs, outbound copy, summaries for sharing, talk tracks, or narrative framing, distinguish source-backed facts from creative wording.

- Use retrieved or provided facts for concrete product, customer, metric, roadmap, date, capability, and competitive claims, and cite those claims.
- Do not invent specific names, first-party data claims, metrics, roadmap status, customer outcomes, or product capabilities to make the draft sound stronger.
- If there is little or no citable support, write a useful generic draft with placeholders or clearly labeled assumptions rather than unsupported specifics.
```

## Frontend engineering and visual taste

For frontend work, refer to the [example instructions](/mirror/api/docs/guides/frontend-prompt) for practical ways to steer UI quality. They cover product and user context, design-system alignment, first-screen usability, familiar controls, expected states, responsive behavior, and common generated-UI defaults to avoid, such as generic heroes, nested cards, decorative gradients, visible instructional text, and broken layouts.

## Prompt the model to check its work

Give GPT-5.5 access to tools that let it check outputs when validation is possible.

For coding agents, ask for concrete validation commands:

```text
After making changes, run the most relevant validation available:
- targeted unit tests for changed behavior
- type checks or lint checks when applicable
- build checks for affected packages
- a minimal smoke test when full validation is too expensive

If validation cannot be run, explain why and describe the next best check.
```

For visual artifacts, ask for inspection after rendering:

```text
Render the artifact before finalizing. Inspect the rendered output for layout, clipping, spacing, missing content, and visual consistency. Revise until the rendered output matches the requirements.
```

For engineering and planning tasks, make implementation plans traceable:

```text
For implementation plans, include:
- requirements and where each is addressed
- named resources, files, APIs, or systems involved
- state transitions or data flow where relevant
- validation commands or checks
- failure behavior
- privacy and security considerations
- open questions that materially affect implementation
```

## Phase parameter

Starting with GPT-5.4, long-running or tool-heavy Responses workflows can use assistant-item `phase` values to distinguish intermediate updates from final answers. GPT-5.5 uses the same pattern.

If you use `previous_response_id`, the API preserves prior assistant state automatically. If your application manually replays assistant output items into the next request, preserve each original `phase` value and pass it back unchanged. This matters most when a response includes preambles, repeated tool calls, or a final answer after intermediate assistant updates.

```text
If manually replaying assistant items:
- Preserve assistant `phase` values exactly.
- Use `phase: "commentary"` for intermediate user-visible updates.
- Use `phase: "final_answer"` for the completed answer.
- Do not add `phase` to user messages.
```

## Suggested prompt structure

Use this structure as a starting point for complex prompts. Keep each section short. Add detail only where it changes behavior.

```text
Role: [1-2 sentences defining the model's function, context, and job]

# Personality
[tone, demeanor, and collaboration style]

# Goal
[user-visible outcome]

# Success criteria
[what must be true before the final answer]

# Constraints
[policy, safety, business, evidence, and side-effect limits]

# Output
[sections, length, and tone]

# Stop rules
[when to retry, fallback, abstain, ask, or stop]
```

:::
:::

