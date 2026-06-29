---
status: needs-review
sourceId: "91b11ca82255"
sourceChecksum: "91b11ca8225508e609c787a95bd1bb9be449aa6621aea906f9a19572b52beb8c"
sourceUrl: "https://developers.openai.com/apps-sdk/plan/tools"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# 定义工具

## 工具优先思维

在 Apps SDK 中，工具是你的 MCP server 与模型之间的契约。它们描述 connector 能做什么、如何调用它，以及会返回什么数据。良好的工具设计能让发现更准确、调用更可靠，并让下游 UX 更可预测。

在接触 SDK 之前，使用下面的清单将你的使用场景转化为边界清晰的工具。

## 起草工具能力面

从你在 [使用场景研究](https://developers.openai.com/apps-sdk/plan/use-case) 中定义的用户旅程开始：

- **每个工具只做一件事** - 让每个工具聚焦单个读或写动作（"fetch_board", "create_ticket"），而不是包罗万象的 endpoint。这有助于模型在备选方案之间做决定。
- **明确输入** - 现在就定义 `inputSchema` 的 shape，包括参数名、数据类型和枚举。记录默认值和可空字段，让模型知道哪些内容是可选的。
- **可预测输出** - 枚举你将返回的结构化字段，在 `outputSchema` 中声明它们，并包含机器可读标识符，供模型在后续调用中复用。

如果你同时需要读取和写入行为，请创建独立工具，这样 ChatGPT 才能对写入操作遵循确认流程。

## 将数据处理与 UI 渲染分开

如果一个工作流既需要可复用数据又需要 widget，请把它规划为两个工具，而不是一个职责过重的工具：

- **数据工具** 返回完整的 `structuredContent`，用于模型推理和后续调用，不附带 UI template。
- **渲染工具** 接收准备好的数据，附加组件 template，并专注于呈现。

模型应先调用数据工具，使用返回的 `structuredContent`，然后用准备好的数据调用渲染工具，使 widget 只以最终、经过模型检查的上下文渲染一次。请在渲染工具描述中声明这种依赖关系。

对于需要新鲜数据的本地 UI 交互，让 widget 直接调用数据工具，而不是重新挂载自己。完整实现模式请参见 [构建你的 ChatGPT UI](https://developers.openai.com/apps-sdk/build/chatgpt-ui#separate-data-processing-from-ui-rendering)。

## 捕获用于发现的元数据

发现几乎完全由元数据驱动。对每个工具，起草：

- **名称** - 动作导向，并且在你的 connector 内唯一（`kanban.move_task`）。
- **描述** - 以 "Use this when..." 开头的一两句话，让模型确切知道何时选择该工具。
- **参数注解** - 描述每个 argument，并指出安全范围或枚举。这个上下文可以在用户提示含糊时避免格式错误的调用。
- **全局元数据** - 确认你已准备好用于目录和 launcher 的应用级名称、图标和描述。

稍后，将这些内容接入 MCP server，并使用 [优化元数据](https://developers.openai.com/apps-sdk/guides/optimize-metadata) 工作流进行迭代。

## 模型侧防护

思考 tool 链接后模型应该如何行为：

- **已预先链接 vs. 需要链接** - 如果你的应用可以匿名工作，请将工具标记为无需认证即可用。否则，请确保你的 connector 通过 [认证](https://developers.openai.com/apps-sdk/build/auth) 中描述的引导流程强制链接。
- **只读提示** - 设置 [`readOnlyHint` 注解](https://modelcontextprotocol.io/specification/2025-11-25/schema#toolannotations)，以指定不能修改状态的工具。
- **破坏性提示** - 设置 [`destructiveHint` 注解](https://modelcontextprotocol.io/specification/2025-11-25/schema#toolannotations)，以指定哪些工具会删除或覆盖用户数据。
- **开放世界提示** - 设置 [`openWorldHint` 注解](https://modelcontextprotocol.io/specification/2025-11-25/schema#toolannotations)，以指定哪些工具会发布内容或触达用户账户之外的范围。

- **结果组件** - 决定每个工具应该渲染组件、只返回 JSON，还是两者都做。在工具描述符上设置 `_meta.ui.resourceUri` 来声明 UI template，使相同 UI 能跨 MCP Apps host 运行（ChatGPT 会将 `_meta["openai/outputTemplate"]` 作为可选兼容别名处理）。

## 黄金提示演练

实现之前，请用之前收集的提示列表对你的工具集做合理性检查：

1. 对每个直接提示，确认你恰好有一个明确响应该请求的工具。
2. 对间接提示，确保工具描述为模型提供足够上下文，让它选择你的 connector 而不是内置替代方案。
3. 对负向提示，验证你的元数据会让工具保持隐藏，除非用户明确选择启用（例如点名你的产品）。

现在就记录任何缺口或歧义并调整计划。在发布前更改元数据的成本远低于之后重构代码。

## 交接到实现

当你准备实现时，请将以下内容整理成交接文档：

- 工具名称、描述、`inputSchema` 和 `outputSchema`。
- 该工具是否应返回组件；如果是，由哪个 UI 组件渲染。
- 认证要求、速率限制和错误处理预期。
- 应该成功的测试提示（以及应该失败的提示）。

将这份计划带入 [设置你的服务器](https://developers.openai.com/apps-sdk/build/mcp-server) 指南，用你选择的 MCP SDK 将其转化为代码。
