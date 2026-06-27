---
status: needs-review
sourceId: "afb55e3381de"
sourceChecksum: "afb55e3381def5c51cffcd8d290dc51c75e65599a5728faade51bfe4bbea8bf9"
sourceUrl: "https://developers.openai.com/api/docs/guides/upgrading-to-gpt-5p5"
translatedAt: "2026-06-27T10:24:24.269Z"
translator: codex-gpt-5.5-xhigh
---

# 升级到 GPT-5.5

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
- 阅读 [GPT-5.5 prompting guide](https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5)，以选择能够恢复或改进行为的最小 prompt 变更
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
