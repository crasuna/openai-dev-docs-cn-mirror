---
status: needs-review
sourceId: "d88096a62861"
sourceChecksum: "d88096a62861581d1390578215c2b75deae935eae8c0fe39e37cc844259d9725"
sourceUrl: "https://developers.openai.com/api/docs/guides/agents/results"
translatedAt: "2026-06-27T18:24:42.5859087+08:00"
translator: codex-gpt-5.5-xhigh
---

# 结果和状态

当你运行一个 agent 时，结果不只是最终答案。它也是 handoff 边界、下一轮继续对话的表面，以及 run 因审核而暂停时可恢复的快照。

## 选择你需要的结果表面

大多数应用只需要一小组结果属性：

| 如果你需要                                           | 使用                                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 展示给用户的最终答案                                 | |
| 可在本地 replay 的历史                               | |
| 通常应负责下一轮的 specialist                        | |
| OpenAI 管理的 response chaining                      | |
| 待审批项和可恢复快照                                 | `interruptions` 加 |

这些是应该先学习的指南级表面。更丰富的 run items、原始模型响应和详细诊断仍然属于 SDK 文档和参考材料。

## 下一轮要携带什么

以匹配你的 continuation strategy 的方式使用结果：

- 如果你的应用拥有完整本地历史，请复用 。
- 如果你使用 session，请持续传入同一个 session，让 SDK 为你加载并持久化历史。
- 如果你使用 server-managed continuation，只传入新的用户输入并复用已存储的 ID，而不是 replay 完整 transcript。
- handoff 之后，如果该 specialist 应继续控制下一轮，请复用。

## 被中断的 run 返回状态，而不是最终答案

Approval flows 是结果有意不完整的主要情况。

- 可能
  保持为空，因为 run 实际上尚未完成。
- `interruptions` 告诉你哪些待处理 tool calls 需要决策。
- 是已保存的
  快照；在批准或拒绝这些 items 之后，你会把它传回 runtime。

当审核可能稍后发生，而不是在同一个请求中发生时，你序列化的也是同一个状态表面。

## 更丰富的 item 和诊断表面

SDK 还为需要高层表面之外信息的应用暴露更丰富的 run items 和诊断。这包括 item 级的 tool 与 handoff 记录、原始模型响应、guardrail 结果和 usage 详情。

这些信息对审计、自定义界面和深度调试很有用，但它们不需要成为大多数开发者在本站首先学习的内容。

## 下一步

了解哪些结果表面对你重要后，继续阅读说明这些表面如何生成或检查的指南。

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      将结果处理连接回 runtime loop 和 continuation
      strategy。


  </a>
  <a
    href="/api/docs/guides/agents/guardrails-approvals"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      了解暂停的 run 如何返回 interruptions 和可恢复状态。


  </a>
  <a
    href="/api/docs/guides/agents/integrations-observability"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      当你需要检查更丰富的 workflow 记录时使用 traces。


  </a>
</div>
