---
status: needs-review
sourceId: "37de43b52034"
sourceChecksum: "37de43b52034e50ba203c33f6031194f4103db5d55378b55db934ca2a56eeee0"
sourceUrl: "https://developers.openai.com/api/docs/guides/upgrading-to-gpt-5p4"
translatedAt: "2026-06-27T10:24:24.269Z"
translator: codex-gpt-5.5-xhigh
---

# 升级到 GPT-5.4

# 升级到 GPT-5.4

当用户明确要求将现有集成升级到 GPT-5.4 时，使用本指南。请将它与当前 OpenAI 文档查阅配合使用。默认目标字符串是 `gpt-5.4`。

## 升级姿态

以最小且安全的变更集进行升级：

- 先替换模型字符串
- 只更新与该模型用法直接相关的 prompt
- 尽可能优先采用仅 prompt 的升级
- 如果升级需要 API surface 变更、参数重写、工具重连线或更广泛的代码编辑，请将其标记为 blocked，而不是扩大范围

## 升级工作流

1. 盘点当前模型用法。
   - 搜索模型字符串、client 调用和承载 prompt 的文件。
   - 包括内联 prompt、prompt 模板、YAML 或 JSON 配置、Markdown 文档，以及在明显关联到某个模型使用点时的已保存 prompt。
2. 将每个模型用法与其 prompt surface 配对。
   - 优先选择最近的 prompt surface：内联 system 或 developer 文本，其次是相邻 prompt 文件，再其次是共享模板。
   - 如果无法有把握地将 prompt 关联到模型用法，请说明这一点，不要猜测。
3. 对源模型系列进行分类。
   - 常见分组：`gpt-4o` 或 `gpt-4.1`、`o1` 或 `o3` 或 `o4-mini`、早期 `gpt-5`、较新的 `gpt-5.x`，或 mixed and unclear。
4. 决定升级类别。
   - `model string only`
   - `model string + light prompt rewrite`
   - `blocked without code changes`
5. 运行无代码兼容性关卡。
   - 检查当前集成是否可以在没有 API surface 变更或实现变更的情况下接受 `gpt-5.4`。
   - 对于长时间运行的 Responses 或工具密集型 agents，检查当 host replay assistant items 或使用 preambles 时，`phase` 是否已经被保留或往返传递。
   - 如果兼容性依赖代码变更，返回 `blocked`。
   - 如果兼容性不明确，返回 `unknown`，不要即兴处理。
6. 推荐升级。
   - 默认替换字符串：`gpt-5.4`
   - 保持干预小且行为保持不变。
7. 提供结构化建议。
   - `Current model usage`
   - `Recommended model-string updates`
   - `Starting reasoning recommendation`
   - `Prompt updates`
   - 当流程长时间运行、会 replay 或工具密集时，提供 `Phase assessment`
   - `No-code compatibility check`
   - `Validation plan`
   - `Launch-day refresh items`

输出规则：

- 始终为每个使用点输出起始 `reasoning_effort_recommendation`。
- 如果 repo 暴露了当前 reasoning 设置，除非源指南另有说明，否则首先保留它。
- 如果 repo 没有暴露当前设置，使用源系列的起始映射，而不是返回 `null`。

## 升级结果

### `model string only`

在以下情况下选择此项：

- 现有 prompt 已经简短、明确且任务边界清晰
- workflow 并不强烈依赖研究密集、工具密集、多 agent、批处理或完整性敏感，也不是长周期任务
- 没有明显兼容性阻碍

默认操作：

- 将模型字符串替换为 `gpt-5.4`
- 保持 prompt 不变
- 使用现有 evals 或 spot checks 验证行为

### `model string + light prompt rewrite`

在以下情况下选择此项：

- 旧 prompt 是在补偿较弱的指令遵循能力
- workflow 需要比默认工具使用行为可能提供的更强持续性
- 任务需要更强的完整性、引用纪律或验证
- 升级后的模型如果不另行指示，可能会过于冗长或不够完整
- workflow 是研究密集型，并且需要更强地处理稀疏或空检索结果
- workflow 面向编码、工具密集或多 agent，但现有 API surface 和工具定义可以保持不变

默认操作：

- 将模型字符串替换为 `gpt-5.4`
- 添加一两个有针对性的 prompt blocks
- 阅读 [GPT-5.4 的 Prompt guidance](https://developers.openai.com/api/docs/guides/prompt-guidance)，以选择能够恢复旧行为的最小 prompt 变更
- 避免与升级无关的广泛 prompt 清理
- 对于研究 workflow，默认使用 `research_mode` + `citation_rules` + `empty_result_handling`；当 host 已使用检索工具时，添加 `tool_persistence_rules`
- 对于依赖感知或工具密集型 workflow，默认使用 `tool_persistence_rules` + `dependency_checks` + `verification_loop`；仅在检索步骤真正独立时添加 `parallel_tool_calling`
- 对于编码或终端 workflow，默认使用 `terminal_tool_hygiene` + `verification_loop`
- 对于多 agent 支持或分诊 workflow，至少默认使用 `tool_persistence_rules`、`completeness_contract` 或 `verification_loop` 中的一项
- 对于带 preambles 或多个 assistant messages 的长时间运行 Responses agents，明确检查 `phase` 是否已经处理；如果添加或保留 `phase` 需要代码编辑，请将路径标记为 `blocked`
- 不要仅因为可见片段很少，就把编码或使用工具的 Responses workflow 归类为 `blocked`；除非 repo 清楚显示安全的 GPT-5.4 路径需要 host 侧代码变更，否则优先选择 `model string + light prompt rewrite`

### `blocked`

在以下情况下选择此项：

- 升级看起来需要 API surface 变更
- 升级看起来需要参数重写或 reasoning 设置变更，而这些变更没有在实现代码之外暴露
- 升级需要更改工具定义、工具 handler wiring 或 schema contracts
- 你无法有把握地识别与模型用法绑定的 prompt surface

默认操作：

- 不要即兴进行更广泛的升级
- 报告 blocker，并说明修复超出了本指南范围

## 无代码兼容性清单

在推荐无代码升级之前，检查：

1. 当前 host 是否可以在不更改 client code 或 API surface 的情况下接受 `gpt-5.4` 模型字符串？
2. 相关 prompt 是否可识别且可编辑？
3. host 是否依赖某些行为，而这些行为可能需要 API surface 变更、参数重写或工具重连线？
4. 可能的修复是否只是 prompt-only，还是需要实现变更？
5. prompt surface 是否足够接近模型用法，使你可以做定向变更，而不是广泛清理？
6. 对于长时间运行的 Responses 或工具密集型 agents，如果 host 依赖 preambles、replayed assistant items 或多个 assistant messages，`phase` 是否已经被保留？

如果第 1 项为否，第 3 到第 4 项指向实现工作，或第 6 项为否且修复需要代码变更，返回 `blocked`。

如果第 2 项为否，返回 `unknown`，除非用户可以指出 prompt 位置。

重要事项：

- 现有使用工具、agents 或多个使用点，本身并不是 blocker。
- 如果当前 host 可以保持相同的 API surface 和相同的工具定义，优先选择 `model string + light prompt rewrite`，而不是 `blocked`。
- 仅在确实需要实现变更的情况下保留 `blocked`，不要把只需要更强 prompt steering 的情况归为 blocked。

## 范围边界

本指南可以：

- 更新或推荐更新后的模型字符串
- 更新或推荐更新后的 prompt
- 检查代码和 prompt 文件，以了解这些变更应放在哪里
- 检查现有 Responses flows 是否已经保留 `phase`
- 标记兼容性 blocker

本指南不得：

- 将 Chat Completions 代码迁移到 Responses
- 将 Responses 代码迁移到另一个 API surface
- 重写参数形状
- 更改工具定义或工具调用处理
- 更改 structured-output wiring
- 在实现代码中添加或改造 `phase` handling
- 编辑业务逻辑、编排逻辑或 SDK 用法，除了字面模型字符串替换

如果安全升级到 GPT-5.4 需要上述任一变更，请将路径标记为 blocked，并说明超出范围。

## 验证计划

- 使用现有 evals 或真实 spot checks 验证每个升级后的使用点。
- 检查升级后的模型是否仍然符合预期延迟、输出形状和质量。
- 如果添加了 prompt edits，确认每个 block 都在发挥实际作用，而不是增加噪声。
- 如果 workflow 有下游影响，请在最终确定之前添加轻量验证 pass。

## 发布日刷新事项

当最终 GPT-5.4 指南发生变化时：

1. 在适当位置用最终 GPT-5.4 指南替换 release-candidate assumptions。
2. 重新检查默认目标字符串是否应对所有源系列保持为 `gpt-5.4`。
3. 重新检查任何语义可能已改变的 prompt-block 建议。
4. 根据最终模型行为重新检查 research、citation 和 compatibility 指南。
5. 重新运行相同的升级场景，并确认 blocked 与 viable 的边界仍然成立。
