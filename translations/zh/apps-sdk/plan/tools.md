---
status: needs-review
sourceId: "91b11ca82255"
sourceChecksum: "91b11ca8225508e609c787a95bd1bb9be449aa6621aea906f9a19572b52beb8c"
sourceUrl: "https://developers.openai.com/apps-sdk/plan/tools"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# 定义 Tools

## Tool-first thinking

在 Apps SDK 中，tools 是你的 MCP server 与模型之间的 contract。它们描述 connector 能做什么、如何调用它，以及会返回什么数据。良好的 tool design 能让 discovery 更准确、invocation 更可靠，并让下游 UX 更可预测。

在接触 SDK 之前，使用下面的清单将你的 use cases 转化为边界清晰的 tools。

## 起草 tool surface area

从你在 [use case research](https://developers.openai.com/apps-sdk/plan/use-case) 中定义的 user journey 开始：

- **每个 tool 只做一件事** - 让每个 tool 聚焦单个读或写动作（"fetch_board", "create_ticket"），而不是包罗万象的 endpoint。这有助于模型在备选方案之间做决定。
- **明确 inputs** - 现在就定义 `inputSchema` 的 shape，包括 parameter names、data types 和 enums。记录 defaults 和 nullable fields，让模型知道哪些内容是可选的。
- **可预测 outputs** - 枚举你将返回的 structured fields，在 `outputSchema` 中声明它们，并包含机器可读 identifiers，供模型在 follow-up calls 中复用。

如果你同时需要 read 和 write 行为，请创建独立 tools，这样 ChatGPT 才能对写入操作遵循 confirmation flows。

## 将数据处理与 UI 渲染分开

如果一个 workflow 既需要可复用数据又需要 widget，请把它规划为两个 tools，而不是一个 overloaded tool：

- **Data tools** 返回完整的 `structuredContent`，用于 model reasoning 和 follow-up calls，不附带 UI template。
- **Render tools** 接收准备好的数据，附加 component template，并专注于 presentation。

模型应先调用 data tool，使用返回的 `structuredContent`，然后用准备好的数据调用 render tool，使 widget 只以最终、经过模型检查的 context 渲染一次。请在 render tool description 中声明这种依赖关系。

对于需要 fresh data 的本地 UI interactions，让 widget 直接调用 data tool，而不是重新挂载自己。完整实现模式请参见 [Build your ChatGPT UI](https://developers.openai.com/apps-sdk/build/chatgpt-ui#separate-data-processing-from-ui-rendering)。

## Capture metadata for discovery

Discovery 几乎完全由 metadata 驱动。对每个 tool，起草：

- **Name** - 动作导向，并且在你的 connector 内唯一（`kanban.move_task`）。
- **Description** - 以 "Use this when..." 开头的一两句话，让模型确切知道何时选择该 tool。
- **Parameter annotations** - 描述每个 argument，并指出安全范围或枚举。这个 context 可以在用户 prompt 含糊时避免 malformed calls。
- **Global metadata** - 确认你已准备好用于 directory 和 launcher 的 app-level name、icon 和 descriptions。

稍后，将这些内容接入 MCP server，并使用 [Optimize metadata](https://developers.openai.com/apps-sdk/guides/optimize-metadata) workflow 进行迭代。

## Model-side guardrails

思考 tool 链接后模型应该如何行为：

- **Prelinked vs. link-required** - 如果你的 app 可以匿名工作，请将 tools 标记为无需 auth 即可用。否则，请确保你的 connector 通过 [Authentication](https://developers.openai.com/apps-sdk/build/auth) 中描述的 onboarding flow 强制链接。
- **Read-only hints** - 设置 [`readOnlyHint` annotation](https://modelcontextprotocol.io/specification/2025-11-25/schema#toolannotations)，以指定不能修改状态的 tools。
- **Destructive hints** - 设置 [`destructiveHint` annotation](https://modelcontextprotocol.io/specification/2025-11-25/schema#toolannotations)，以指定哪些 tools 会删除或覆盖用户数据。
- **Open-world hints** - 设置 [`openWorldHint` annotation](https://modelcontextprotocol.io/specification/2025-11-25/schema#toolannotations)，以指定哪些 tools 会发布内容或触达用户账户之外的范围。

- **Result components** - 决定每个 tool 应该渲染 component、只返回 JSON，还是两者都做。在 tool descriptor 上设置 `_meta.ui.resourceUri` 来声明 UI template，使相同 UI 能跨 MCP Apps hosts 运行（ChatGPT 会将 `_meta["openai/outputTemplate"]` 作为可选兼容别名处理）。

## Golden prompt rehearsal

实现之前，请用之前收集的 prompt list 对你的 tool set 做 sanity-check：

1. 对每个 direct prompt，确认你恰好有一个明确响应该请求的 tool。
2. 对 indirect prompts，确保 tool descriptions 为模型提供足够 context，让它选择你的 connector 而不是内置替代方案。
3. 对 negative prompts，验证你的 metadata 会让 tool 保持隐藏，除非用户明确 opt in（例如点名你的产品）。

现在就记录任何缺口或歧义并调整计划。在发布前更改 metadata 的成本远低于之后重构代码。

## Handoff to implementation

当你准备实现时，请将以下内容整理成 handoff document：

- Tool name、description、`inputSchema` 和 `outputSchema`。
- 该 tool 是否应返回 component；如果是，由哪个 UI component 渲染。
- Auth requirements、rate limits 和 error handling expectations。
- 应该成功的 test prompts（以及应该失败的 prompts）。

将这份计划带入 [Set up your server](https://developers.openai.com/apps-sdk/build/mcp-server) guide，用你选择的 MCP SDK 将其转化为代码。
