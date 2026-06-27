---
title: "Results and state"
description: "Learn which result surfaces matter most in the OpenAI Agents SDK and how they connect to resumable workflow state."
outline: deep
---

# Results and state

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agents/results](https://developers.openai.com/api/docs/guides/agents/results)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agents/results.md](https://developers.openai.com/api/docs/guides/agents/results.md)
- 抓取时间：2026-06-27T05:53:58.798Z
- Checksum：`d88096a62861581d1390578215c2b75deae935eae8c0fe39e37cc844259d9725`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
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


  &lt;a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  &gt;
    



      将结果处理连接回 runtime loop 和 continuation
      strategy。



  &lt;a
    href="/api/docs/guides/agents/guardrails-approvals"
    class="block no-underline hover:no-underline"
  &gt;
    



      了解暂停的 run 如何返回 interruptions 和可恢复状态。



  &lt;a
    href="/api/docs/guides/agents/integrations-observability"
    class="block no-underline hover:no-underline"
  &gt;
    



      当你需要检查更丰富的 workflow 记录时使用 traces。





:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
When you run an agent, the result is more than just the final answer. It's also the handoff boundary, the next-turn continuation surface, and the resumable snapshot when a run pauses for review.

## Choose the result surface you need

Most applications only need a small set of result properties:

| If you need                                          | Use                                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| The final answer to show the user                    | |
| Local replay-ready history                           | |
| The specialist that should usually own the next turn | |
| OpenAI-managed response chaining                     | |
| Pending approvals and a resumable snapshot           | `interruptions` plus |

Those are the guide-level surfaces to learn first. Richer run items, raw model responses, and detailed diagnostics still belong in the SDK docs and reference material.

## What to carry into the next turn

Use the result in a way that matches your continuation strategy:

- If your application owns full local history, reuse .
- If you are using a session, keep passing the same session and let the SDK load and persist history for you.
- If you are using server-managed continuation, pass only the new user input and reuse the stored ID instead of replaying the full transcript.
- After handoffs, reuse when that specialist should stay in control for the next turn.

## Interrupted runs return state, not a final answer

Approval flows are the main case where a result is intentionally incomplete.

- can
  stay empty because the run hasn't actually finished.
- `interruptions` tells you which pending tool calls need a decision.
- is the saved
  snapshot you pass back into the runtime after approving or rejecting those
  items.

That same state surface is what you serialize when a review might happen later rather than in the same request.

## Richer item and diagnostics surfaces

The SDK also exposes richer run items and diagnostics for applications that need more than the high-level surfaces above. That includes item-level tool and handoff records, raw model responses, guardrail results, and usage details.

Those are useful for audits, custom interfaces, and deep debugging, but they don't need to be the first thing most developers learn on this site.

## Next steps

Once you know which result surfaces matter, continue with the guide that explains how those surfaces get produced or inspected.

<div class="not-prose mt-4 grid gap-3">
  <a
    href="/api/docs/guides/agents/running-agents"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Connect result handling back to the runtime loop and continuation
      strategy.


  </a>
  <a
    href="/api/docs/guides/agents/guardrails-approvals"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      See how paused runs return interruptions and resumable state.


  </a>
  <a
    href="/api/docs/guides/agents/integrations-observability"
    class="block no-underline hover:no-underline"
  >
    

<span slot="icon">
        </span>
      Use traces when you need to inspect the richer workflow record.


  </a>
</div>
``````
:::
:::

