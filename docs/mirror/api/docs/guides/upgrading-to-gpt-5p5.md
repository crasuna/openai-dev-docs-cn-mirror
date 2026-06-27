---
title: "Upgrading to GPT-5.5"
description: "Guidance for upgrading OpenAI API model strings and directly related prompts to GPT-5.5."
outline: deep
---

# Upgrading to GPT-5.5

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/upgrading-to-gpt-5p5](https://developers.openai.com/api/docs/guides/upgrading-to-gpt-5p5)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/upgrading-to-gpt-5p5.md](https://developers.openai.com/api/docs/guides/upgrading-to-gpt-5p5.md)
- 抓取时间：2026-06-27T05:54:11.345Z
- Checksum：`afb55e3381def5c51cffcd8d290dc51c75e65599a5728faade51bfe4bbea8bf9`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
# 升级到 GPT-5.5

当用户明确要求将现有集成升级到 GPT-5.5 时，使用本指南。请将它与当前 OpenAI 文档查阅配合使用。默认目标字符串是 `gpt-5.5`。

## 升级姿态

以最小且安全的变更集进行升级：

- 先替换模型字符串
- 只更新与该模型用法直接相关的 prompt
- 不要自动升级可能被有意 pin 住的较旧或含糊模型用法，例如历史文档、示例、测试、eval baselines、比较代码，或低成本 fallback/routing paths。除非用户明确要求升级所有模型用法，否则保持这些位置不变，并将它们列为需要确认
- 尽可能优先采用仅 prompt 的升级
- 如果升级需要 API surface 变更、参数重写、工具重连线、provider 迁移或更广泛的代码编辑，请将其标记为 blocked，而不是扩大范围

## 升级工作流

1. 盘点当前模型用法。
   - 搜索模型字符串、client 调用和承载 prompt 的文件。
   - 包括内联 prompt、prompt 模板、YAML 或 JSON 配置、Markdown 文档，以及在明显关联到某个模型使用点时的已保存 prompt。
2. 将每个模型用法与其 prompt surface 配对。
   - 优先选择最近的 prompt surface：内联 system 或 developer 文本，其次是相邻 prompt 文件，再其次是共享模板。
   - 如果无法有把握地将 prompt 关联到模型用法，请说明这一点，不要猜测。
3. 对源模型系列进行分类。
   - 常见分组：GPT-5.4、GPT-5.3-Codex 或 GPT-5.2-Codex、较早的 GPT-5.x、GPT-4o 或 GPT-4.1、reasoning models（例如 o1、o3 或 o4-mini）、third-party model，或 mixed and unclear。
4. 决定升级类别。
   - `model string only`
   - `model string + light prompt rewrite`
   - `blocked without code changes`
5. 运行兼容性关卡。
   - 检查当前集成是否可以在没有 API surface 变更或实现变更的情况下接受 `gpt-5.5`。
   - 检查 structured outputs、tool schemas、function names 和 downstream parsers 是否可以保持不变。
   - 对于长时间运行的 Responses 或工具密集型 agents，检查当 host replay assistant items 或使用 preambles 时，`phase` 是否已经被保留或往返传递。
   - 如果兼容性依赖代码变更，返回 `blocked`。
   - 如果兼容性不明确，返回 `unknown`，不要即兴处理。
6. 在范围内应用升级。
   - 默认替换字符串：`gpt-5.5`。
   - 保持干预小且行为保持不变。
   - 除非有测量结果表明需要变更，否则从当前 reasoning effort 开始（如果可见）。
   - 对于范围内变更，更新模型字符串和直接相关的 prompt。
   - 对于 blocked 或 unknown 变更，不要编辑；报告 blocker 或不确定性。
7. 总结结果。
   - `Current model usage`
   - `Model-string updates`
   - `Reasoning-effort handling`
   - `Prompt updates`
   - `Structured output and formatting assessment`
   - 当 flow 使用工具、检索或终端操作时，提供 `Tool-use assessment`
   - 当 flow 长时间运行、会 replay 或工具密集时，提供 `Phase assessment`
   - `Compatibility check`
   - `Validation performed`

输出规则：

- 对每个使用点，说明起始 reasoning-effort 建议。
- 如果 repo 暴露了当前 reasoning 设置，除非当前 OpenAI 文档另有说明，否则建议首先保留它。
- 如果 repo 没有暴露当前设置，除非当前 OpenAI 文档要求，否则建议不要添加。

## 升级结果

### `model string only`

在以下情况下选择此项：

- 源模型是 GPT-5.4
- 现有 prompt 已经简短、明确且任务边界清晰
- workflow 不依赖严格输出格式、工具调用行为、批处理完整性，或升级后应验证的长周期执行
- 没有明显兼容性 blocker

默认操作：

- 将模型字符串替换为 `gpt-5.5`
- 保留当前 reasoning effort
- 保持 prompt 不变
- 在已有可用验证时，用现有测试、真实 spot checks 或现有 eval suite 验证行为

### `model string + light prompt rewrite`

在以下情况下选择此项：

- 任务需要更强的完整性、引用纪律、验证或依赖处理
- 升级后的模型如果不约束格式，可能会过于冗长、过于密集或难以浏览
- workflow 有严格输出形状要求，但缺少明确的格式契约、schema 或 parser validation
- workflow 是研究密集型，并且需要更强地处理稀疏或空检索结果
- workflow 面向编码、基于终端、工具密集或多 agent，但现有 API surface 和工具定义可以保持不变

默认操作：

- 将模型字符串替换为 `gpt-5.5`
- 第一轮保留当前 reasoning effort
- 只做观察到的 workflow 风险所需的最小 prompt edits
- 阅读 [GPT-5.5 prompting guide](/mirror/api/docs/guides/prompt-guidance)，以选择能够恢复或改进行为的最小 prompt 变更
- 避免与升级无关的广泛 prompt 清理
- 对于 research workflows，添加 prompting guide 中的 citation rules、retrieval budgets、missing-evidence behavior 和 validation guidance
- 对于依赖感知或工具密集型 workflows，添加 prerequisite checks、missing-context handling、explicit tool budgets、stop conditions 和 validation guidance
- 对于 coding 或 terminal workflows，添加 repo-specific constraints、acceptance criteria 和具体 validation commands
- 对于 multi-agent support 或 triage workflows，添加 task ownership、handoff、completeness 和 stopping criteria
- 对于带 preambles 或多个 assistant messages 的长时间运行 Responses agents，明确检查 `phase` 是否已经处理；如果添加或保留 `phase` 需要代码编辑，请将路径标记为 `blocked`
- 不要仅因为可见片段很少，就把编码或使用工具的 Responses workflow 归类为 `blocked`；除非 repo 清楚显示安全的 GPT-5.5 路径需要 host 侧代码变更，否则优先选择 `model string + light prompt rewrite`

### `blocked`

在以下情况下选择此项：

- 升级看起来需要 API surface 变更
- 升级看起来需要参数重写或 reasoning 设置变更，而这些变更没有在实现代码之外暴露
- 升级需要更改工具定义、工具 handler wiring 或 schema contracts
- 用户请求的是 tooling、IDE、plugin、shell 或 environment 迁移，而不是模型和 prompt 迁移
- 集成依赖 provider-specific APIs，若没有实现工作，无法映射到当前 OpenAI API surface
- 你无法有把握地识别与模型用法绑定的 prompt surface

默认操作：

- 不要即兴进行更广泛的升级
- 报告 blocker，并说明修复超出了本指南范围
- 如有帮助，描述最小的后续实现任务，用来解除迁移阻碍

## 兼容性清单

在应用或推荐 model-and-prompt-only 升级之前，检查：

1. 当前 host 是否可以在不更改 client code 或 API surface 的情况下接受 `gpt-5.5` 模型字符串？
2. 相关 prompt 是否可识别且可编辑？
3. host 是否依赖某些行为，而这些行为可能需要 API surface 变更、参数重写、provider 迁移或工具重连线？
4. 可能的修复是否只是 prompt-only，还是需要实现变更？
5. prompt surface 是否足够接近模型用法，使你可以做定向变更，而不是广泛清理？
6. 严格 structured outputs、schemas 或 downstream parsers 是否仍有明确契约？
7. 对于长时间运行的 Responses 或工具密集型 agents，如果 host 依赖 preambles、replayed assistant items 或多个 assistant messages，`phase` 是否已经被保留？
8. 延迟、token 或价格假设是否通过测试、真实 spot checks 或现有 eval suite 验证，而不是从一般模型定位推断？

如果第 1 项为否，第 3 到第 4 项指向实现工作，或第 7 项为否且修复需要代码变更，返回 `blocked`。

如果第 2 项为否，返回 `unknown`，除非用户可以指出 prompt 位置。

重要事项：

- 现有使用工具、agents 或多个使用点，本身并不是 blocker。
- 如果当前 host 可以保持相同的 API surface 和相同的工具定义，优先选择 `model string + light prompt rewrite`，而不是 `blocked`。
- 仅在确实需要实现变更的情况下保留 `blocked`，不要把只需要更强 prompt steering 的情况归为 blocked。
- 不要在没有任务级验证的情况下声称节省 token。

## 范围边界

本指南可以：

- 更新或推荐更新后的模型字符串
- 更新或推荐更新后的 prompt
- 检查代码和 prompt 文件，以了解这些变更应放在哪里
- 检查现有 Responses flows 是否已经保留 `phase`
- 标记兼容性 blocker
- 提出使用现有测试、真实 spot checks 或现有 eval suites 进行验证

本指南不得：

- 将 Chat Completions 代码迁移到 Responses
- 将 Responses 代码迁移到另一个 API surface
- 迁移 SDKs、APIs、IDE 配置、shell hooks、plugins 或 provider-specific tooling
- 重写参数形状
- 更改工具定义或工具调用处理
- 更改 structured-output wiring
- 在实现代码中添加或改造 `phase` handling
- 编辑业务逻辑、编排逻辑、SDK 用法、IDE 配置、shell hooks 或 plugin integration 行为，除了模型字符串替换和直接相关的 prompt edits

如果安全升级到 GPT-5.5 需要上述任一变更，请将路径标记为 blocked，并说明超出范围。

## 验证计划

- 在已有可用验证时，用现有测试、真实 spot checks 或现有 eval suite 验证每个升级后的使用点。
- 在有当前 GPT-5.4 baseline 时，与其比较。
- 检查任务成功率、retry count、tool-call count、total tokens、latency、output shape 和用户可见质量。
- 对于专门 workflow，验证最重要的契约，而不是只判断一般输出质量。
- 如果添加了 prompt edits，确认每个 block 都在发挥实际作用，而不是增加噪声。
- 如果 workflow 有下游影响，请在最终确定之前添加轻量验证 pass。

:::

## English source

::: details 展开英文原文
::: v-pre
# Upgrading to GPT-5.5

Use this guide when the user explicitly asks to upgrade an existing integration to GPT-5.5. Pair it with current OpenAI docs lookups. The default target string is `gpt-5.5`.

## Upgrade posture

Upgrade with the narrowest safe change set:

- replace the model string first
- update only the prompts that are directly tied to that model usage
- do not automatically upgrade older or ambiguous model usages that may be intentionally pinned, such as historical docs, examples, tests, eval baselines, comparison code, or low-cost fallback/routing paths. Unless the user explicitly asks to upgrade all model usage, leave those sites unchanged and list them as confirmation-needed
- prefer prompt-only upgrades when possible
- if the upgrade would require API-surface changes, parameter rewrites, tool rewiring, provider migration, or broader code edits, mark it as blocked instead of stretching the scope

## Upgrade workflow

1. Inventory current model usage.
   - Search for model strings, client calls, and prompt-bearing files.
   - Include inline prompts, prompt templates, YAML or JSON configs, Markdown docs, and saved prompts when they are clearly tied to a model usage site.
2. Pair each model usage with its prompt surface.
   - Prefer the closest prompt surface first: inline system or developer text, then adjacent prompt files, then shared templates.
   - If you cannot confidently tie a prompt to the model usage, say so instead of guessing.
3. Classify the source model family.
   - Common buckets: GPT-5.4, GPT-5.3-Codex or GPT-5.2-Codex, earlier GPT-5.x, GPT-4o or GPT-4.1, reasoning models such as o1 or o3 or o4-mini, third-party model, or mixed and unclear.
4. Decide the upgrade class.
   - `model string only`
   - `model string + light prompt rewrite`
   - `blocked without code changes`
5. Run the compatibility gate.
   - Check whether the current integration can accept `gpt-5.5` without API-surface changes or implementation changes.
   - Check whether structured outputs, tool schemas, function names, and downstream parsers can remain unchanged.
   - For long-running Responses or tool-heavy agents, check whether `phase` is already preserved or round-tripped when the host replays assistant items or uses preambles.
   - If compatibility depends on code changes, return `blocked`.
   - If compatibility is unclear, return `unknown` rather than improvising.
6. Apply the upgrade when it is in scope.
   - Default replacement string: `gpt-5.5`.
   - Keep the intervention small and behavior-preserving.
   - Start from the current reasoning effort when it is visible unless there is a measured reason to change it.
   - For in-scope changes, update the model string and directly related prompts.
   - For blocked or unknown changes, do not edit; report the blocker or uncertainty.
7. Summarize the result.
   - `Current model usage`
   - `Model-string updates`
   - `Reasoning-effort handling`
   - `Prompt updates`
   - `Structured output and formatting assessment`
   - `Tool-use assessment` when the flow uses tools, retrieval, or terminal actions
   - `Phase assessment` when the flow is long-running, replayed, or tool-heavy
   - `Compatibility check`
   - `Validation performed`

Output rule:

- For each usage site, state the starting reasoning-effort recommendation.
- If the repo exposes the current reasoning setting, recommend preserving it first unless current OpenAI docs say otherwise.
- If the repo does not expose the current setting, recommend not adding one unless current OpenAI docs require it.

## Upgrade outcomes

### `model string only`

Choose this when:

- the source model is GPT-5.4
- the existing prompts are already short, explicit, and task-bounded
- the workflow does not rely on strict output formats, tool-call behavior, batch completeness, or long-horizon execution that should be validated after the upgrade
- there are no obvious compatibility blockers

Default action:

- replace the model string with `gpt-5.5`
- preserve the current reasoning effort
- keep prompts unchanged
- validate behavior with existing tests, realistic spot checks, or an existing eval suite when one is already available

### `model string + light prompt rewrite`

Choose this when:

- the task needs stronger completeness, citation discipline, verification, or dependency handling
- the upgraded model becomes too verbose, too dense, or hard to scan unless formatting is constrained
- the workflow has strict output shape requirements and lacks an explicit format contract, schema, or parser validation
- the workflow is research-heavy and needs stronger handling of sparse or empty retrieval results
- the workflow is coding-oriented, terminal-based, tool-heavy, or multi-agent, but the existing API surface and tool definitions can remain unchanged

Default action:

- replace the model string with `gpt-5.5`
- preserve the current reasoning effort for the first pass
- make only the smallest prompt edits needed for the observed workflow risk
- read the [GPT-5.5 prompting guide](/mirror/api/docs/guides/prompt-guidance) to choose the smallest prompt changes that recover or improve behavior
- avoid broad prompt cleanup unrelated to the upgrade
- for research workflows, add citation rules, retrieval budgets, missing-evidence behavior, and validation guidance from the prompting guide
- for dependency-aware or tool-heavy workflows, add prerequisite checks, missing-context handling, explicit tool budgets, stop conditions, and validation guidance
- for coding or terminal workflows, add repo-specific constraints, acceptance criteria, and concrete validation commands
- for multi-agent support or triage workflows, add task ownership, handoff, completeness, and stopping criteria
- for long-running Responses agents with preambles or multiple assistant messages, explicitly review whether `phase` is already handled; if adding or preserving `phase` would require code edits, mark the path as `blocked`
- do not classify a coding or tool-using Responses workflow as `blocked` just because the visible snippet is minimal; prefer `model string + light prompt rewrite` unless the repo clearly shows that a safe GPT-5.5 path would require host-side code changes

### `blocked`

Choose this when:

- the upgrade appears to require API-surface changes
- the upgrade appears to require parameter rewrites or reasoning-setting changes that are not exposed outside implementation code
- the upgrade would require changing tool definitions, tool handler wiring, or schema contracts
- the user is asking for a tooling, IDE, plugin, shell, or environment migration rather than a model and prompt migration
- the integration depends on provider-specific APIs that do not map to the current OpenAI API surface without implementation work
- you cannot confidently identify the prompt surface tied to the model usage

Default action:

- do not improvise a broader upgrade
- report the blocker and explain that the fix is out of scope for this guide
- if useful, describe the smallest follow-up implementation task that would unblock the migration

## Compatibility checklist

Before applying or recommending a model-and-prompt-only upgrade, check:

1. Can the current host accept the `gpt-5.5` model string without changing client code or API surface?
2. Are the related prompts identifiable and editable?
3. Does the host depend on behavior that likely needs API-surface changes, parameter rewrites, provider migration, or tool rewiring?
4. Would the likely fix be prompt-only, or would it need implementation changes?
5. Is the prompt surface close enough to the model usage that you can make a targeted change instead of a broad cleanup?
6. Do strict structured outputs, schemas, or downstream parsers still have an explicit contract?
7. For long-running Responses or tool-heavy agents, is `phase` already preserved if the host relies on preambles, replayed assistant items, or multiple assistant messages?
8. Are latency, token, or price assumptions validated by tests, realistic spot checks, or an existing eval suite rather than inferred from general model positioning?

If item 1 is no, items 3 through 4 point to implementation work, or item 7 is no and the fix needs code changes, return `blocked`.

If item 2 is no, return `unknown` unless the user can point to the prompt location.

Important:

- Existing use of tools, agents, or multiple usage sites is not by itself a blocker.
- If the current host can keep the same API surface and the same tool definitions, prefer `model string + light prompt rewrite` over `blocked`.
- Reserve `blocked` for cases that truly require implementation changes, not cases that only need stronger prompt steering.
- Do not claim token savings without task-level validation.

## Scope boundaries

This guide may:

- update or recommend updated model strings
- update or recommend updated prompts
- inspect code and prompt files to understand where those changes belong
- inspect whether existing Responses flows already preserve `phase`
- flag compatibility blockers
- propose validation with existing tests, realistic spot checks, or existing eval suites

This guide may not:

- move Chat Completions code to Responses
- move Responses code to another API surface
- migrate SDKs, APIs, IDE configuration, shell hooks, plugins, or provider-specific tooling
- rewrite parameter shapes
- change tool definitions or tool-call handling
- change structured-output wiring
- add or retrofit `phase` handling in implementation code
- edit business logic, orchestration logic, SDK usage, IDE configuration, shell hooks, or plugin integration behavior except for model-string replacements and directly related prompt edits

If a safe GPT-5.5 upgrade requires any of those changes, mark the path as blocked and out of scope.

## Validation plan

- Validate each upgraded usage site with existing tests, realistic spot checks, or an existing eval suite when one is already available.
- Compare against the current GPT-5.4 baseline when available.
- Check task success, retry count, tool-call count, total tokens, latency, output shape, and user-visible quality.
- For specialized workflows, validate the contract that matters most instead of judging only general output quality.
- If prompt edits were added, confirm each block is doing real work instead of adding noise.
- If the workflow has downstream impact, add a lightweight verification pass before finalization.

:::
:::

