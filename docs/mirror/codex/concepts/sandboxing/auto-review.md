---
title: "Auto-review"
description: "How Codex routes sandbox-boundary approvals through a reviewer agent"
outline: deep
---

# Auto-review

**文档集**：Codex  
**分组**：Codex — Concepts  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/concepts/sandboxing/auto-review](https://developers.openai.com/codex/concepts/sandboxing/auto-review)
- Markdown 来源：[https://developers.openai.com/codex/concepts/sandboxing/auto-review.md](https://developers.openai.com/codex/concepts/sandboxing/auto-review.md)
- 抓取时间：2026-06-27T05:54:55.154Z
- Checksum：`bc8b92c32ea178b6b97f3a7afcb2e7c45222d1cfb4b75b33e3b38b6acf878cd9`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Auto-review 用一个独立的 reviewer agent 取代 sandbox 边界处的人工 approval。主 Codex agent 仍然运行在同一个 sandbox 内，使用同样的 approval policy，以及同样的网络和文件系统限制。区别在于由谁来审核符合条件的 escalation requests。

Auto-review 只在 approvals 是交互式时适用。实践中，这意味着
  `approval_policy = "on-request"`，或仍会显示相关 prompt 类别的 granular approval policy。使用 `approval_policy = "never"` 时，没有需要 review 的内容。

## Auto-review 如何工作

概括来说，流程如下：

1. 主 agent 在 `read-only` 或 `workspace-write` 内工作。
2. 当它需要跨越 sandbox 边界时，会请求 approval。
3. 如果 `approvals_reviewer = "auto_review"`，Codex 会把该 approval request 路由到一个独立的 reviewer agent，而不是停下来等待人工。
4. Reviewer 决定该 action 是否应运行，并返回理由。
5. 如果 action 被批准，执行继续。如果被拒绝，主 agent 会被指示寻找实质上更安全的路径，或停止并询问用户。

Auto-review 是 reviewer 的替换，不是权限授予。它不会扩展
`writable_roots`、启用网络访问，也不会削弱 protected paths。它只改变 Codex 如何处理已经需要 approval 的 actions。

## 何时触发

Auto-review 会评估本来会暂停等待人工的 approval requests。这些包括：

- 请求 escalated sandbox permissions 的 shell 或 exec tool calls。
- 被当前 sandbox 或 policy 阻止的网络请求。
- 允许的 writable roots 之外的文件编辑。
- 根据 tool annotations 或配置的 approval mode 需要 approval 的 MCP 或 app tool calls。
- Browser Use 访问新的 website 或 domain。

Auto-review 不会针对 sandbox 中已经允许的常规 actions 运行。如果某个 command 可以在当前 `sandbox_mode` 下运行，或某个 tool call 保持在允许的 policy 范围内，主 agent 会继续执行而无需 review。

Computer Use 是一个单独情况。Computer Use 的 app approvals 仍会直接显示给用户，因此 Auto-review 不会替代这些 app 级 prompts。

## Auto-review 会阻止什么

概括来说，Auto-review 旨在阻止以下 actions：

- 将私有数据、secrets 或 credentials 发送到不可信目的地
- 探测 credentials、tokens、cookies 或 session material
- 广泛或持久地削弱安全性
- 具有重大不可逆损害风险的破坏性 actions

确切 policy 位于开源 Codex repository：
[policy_template.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy_template.md)
和
[policy.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md)。
该 policy 可以按 enterprise 使用 `guardian_policy_config` 自定义，或按用户使用本地 [`[auto_review].policy`](https://developers.openai.com/codex/config-advanced#approval-policies-and-sandbox-modes) 自定义。

## Reviewer 会看到什么

Reviewer 本身也是一个 Codex agent，但职责比主 agent 更窄：判断某个特定的跨边界 action 是否应运行。

Reviewer 会看到一个紧凑 transcript 和确切的 approval request。通常包括 user messages、显示给用户的 assistant updates、相关 tool calls 和 tool outputs，以及当前提议 approval 的 action。它也可以执行 read-only checks 来收集缺失 context，但很少这样做。

隐藏的 assistant reasoning 不会包含在内。Auto-review 看到的是保留的 conversation items 和 tool evidence，而不是私有 chain-of-thought。

## 拒绝和失败行为

显式拒绝不会像普通 sandbox error 一样处理。Codex 会把 review rationale 返回给主 agent，并添加更强的指令：

- 不要通过 workaround、indirect execution 或 policy circumvention 来追求同一结果。
- 只有存在实质上更安全的替代方案时才继续。
- 否则，停止并询问用户。

Codex 还会按 turn 应用 rejection circuit breaker。在当前开源实现中，Auto-review 会在同一 turn 中连续 `3` 次拒绝，或最近 `50` 次 reviews 的滚动窗口内有 `10` 次拒绝后，中断该 turn。

任何非拒绝结果都会重置连续拒绝计数器。当 breaker 触发时，Codex 会发出 warning，并以 interrupt 中止当前 turn，而不是让 agent 继续循环尝试更多 escalation。

Timeouts 会与显式拒绝分开呈现，主 agent 会被告知仅凭 timeout 并不能证明该 action 不安全。

对于被拒绝的 actions，也有显式 override 路径。在当前开源 TUI 中，运行 `/approve` 打开 **Auto-review Denials** picker，然后选择一个最近被拒绝的 action，为一次 retry 批准它。Codex 每个 thread 最多记录 10 个最近的 denials。该 approval 范围很窄：它只适用于确切被拒绝的 action，不适用于未来类似 actions；它只记录为同一 context 中的一次 retry；并且 retry 仍会经过 Auto-review。底层实现中，Codex 会为该确切 action 注入一个 developer-scoped approval marker。Reviewer 随后会把这个显式 user override 作为 context 看到，但它仍会遵循 policy，如果 policy 认为用户不能覆盖这一类拒绝，它仍可再次拒绝。

## 配置

有关 setup 详情，请参见
[Managed configuration](/mirror/codex/enterprise/managed-configuration#configure-automatic-review-policy)。

默认 reviewer policy 位于开源 Codex repository：
[core/src/guardian/policy.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md)。
Enterprises 可以用 managed requirements 中的
`guardian_policy_config` 替换其 tenant-specific section。个人用户也可以在其 `config.toml` 中设置本地
[`[auto_review].policy`](https://developers.openai.com/codex/config-advanced#approval-policies-and-sandbox-modes)，但 managed requirements 优先级更高：

```toml
[auto_review]
policy = """
YOUR POLICY GOES HERE
"""
```

要自定义 policy，请先复制完整默认 policy 文本，然后根据你的个人风险画像迭代。

## 在不削弱安全性的情况下降低 review 量

当 sandbox 已经覆盖常见的安全 workflows 时，Auto-review 效果最好。如果太多普通 actions 都需要 review，请先修复边界，而不是教 reviewer 永远批准嘈杂的 escalations。

实践中，影响最大的改动是：

- 为你有意使用的 scratch directories 或相邻 repos 添加狭窄的
  [`writable_roots`](/mirror/codex/config-advanced#approval-policies-and-sandbox-modes)。
- 添加窄范围的 [prefix rules](/mirror/codex/rules)。优先使用精确 command prefixes，例如 `["cargo", "test"]` 或 `["pnpm", "run", "lint"]`，而不是 `["python"]` 或 `["curl"]` 这类宽泛 patterns。宽泛 rules 常常会抹掉 Auto-review 本意要守住的边界。

Auto-review session transcripts 默认保留在 `~/.codex/sessions` 下，因此你可以在改变 policy 或 permissions 之前，让 Codex 分析那里的历史 traffic。

## 限制

Auto-review 改善了长时间 agentic work 的默认运行点，但它不是确定性的安全保证。

- 它只评估请求跨越边界的 actions。
- 它仍可能犯错，尤其是在对抗性或不寻常的 context 中。
- 它应该补充而不是取代良好的 sandbox 设计、监控和组织特定 policy。

关于研究动机和已发布的评估结果，请参见
[Alignment Research 关于 Auto-review 的文章](https://alignment.openai.com/auto-review/)。

:::

## English source

::: details 展开英文原文
::: v-pre
Auto-review replaces manual approval at the sandbox boundary with a separate
reviewer agent. The main Codex agent still runs inside the same sandbox, with
the same approval policy and the same network and filesystem limits. The
difference is who reviews eligible escalation requests.

Auto-review only applies when approvals are interactive. In practice, that
  means `approval_policy = "on-request"` or a granular approval policy that
  still surfaces the relevant prompt category. With `approval_policy = "never"`,
  there is nothing to review.

## How auto-review works

At a high level, the flow is:

1. The main agent works inside `read-only` or `workspace-write`.
2. When it needs to cross the sandbox boundary, it requests approval.
3. If `approvals_reviewer = "auto_review"`, Codex routes that approval request
   to a separate reviewer agent instead of stopping for a person.
4. The reviewer decides whether the action should run and returns a rationale.
5. If the action is approved, execution continues. If it is denied, the main
   agent is instructed to find a materially safer path or stop and ask the
   user.

Auto-review is a reviewer swap, not a permission grant. It does not expand
`writable_roots`, enable network access, or weaken protected paths. It only
changes how Codex handles actions that already need approval.

## When it triggers

Auto-review evaluates approval requests that would otherwise pause for a human.
These include:

- Shell or exec tool calls that request escalated sandbox permissions.
- Network requests blocked by the current sandbox or policy.
- File edits outside the allowed writable roots.
- MCP or app tool calls that require approval based on their tool annotations
  or configured approval mode.
- Browser Use access to a new website or domain.

Auto-review does not run for routine actions already allowed inside the
sandbox. If a command can run under the active `sandbox_mode`, or a tool call
stays within the allowed policy, the main agent continues without review.

Computer Use is a separate case. App approvals for Computer Use still surface
directly to the user, so Auto-review does not replace those app-level prompts.

## What auto-review blocks

At a high level, Auto-review is designed to block actions such as:

- sending private data, secrets, or credentials to untrusted destinations
- probing for credentials, tokens, cookies, or session material
- broad or persistent security weakening
- destructive actions with significant risk of irreversible damage

The exact policy lives in the open-source Codex repository:
[policy_template.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy_template.md)
and
[policy.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md).
That policy can be customized per enterprise with `guardian_policy_config` or
per user with local [`[auto_review].policy`](https://developers.openai.com/codex/config-advanced#approval-policies-and-sandbox-modes).

## What the reviewer sees

The reviewer is itself a Codex agent with a narrower job than the main agent:
decide whether a specific boundary-crossing action should run.

The reviewer sees a compact transcript plus the exact approval request. That
typically includes user messages, surfaced assistant updates, relevant tool
calls and tool outputs, and the action now being proposed for approval. It can
also perform read-only checks to gather missing context, but it does so rarely.

Hidden assistant reasoning is not included. Auto-review sees retained
conversation items and tool evidence, not private chain-of-thought.

## Denials and failure behavior

An explicit denial is not treated like an ordinary sandbox error. Codex returns
the review rationale to the main agent and adds a stronger instruction:

- Do not pursue the same outcome via workaround, indirect execution, or policy
  circumvention.
- Continue only with a materially safer alternative.
- Otherwise, stop and ask the user.

Codex also applies a rejection circuit breaker per turn. In the current
open-source implementation, Auto-review interrupts the turn after `3`
consecutive denials or `10` denials within a rolling window of the last `50`
reviews in the same turn.

Any non-denial resets the consecutive-denial counter. When the breaker trips,
Codex emits a warning and aborts the current turn with an interrupt rather than
letting the agent loop on more escalation attempts.

Timeouts are surfaced separately from explicit denials, and the main agent is
informed that a timeout alone is not proof that the action is unsafe.

There is also an explicit override path for denied actions. In the current
open-source TUI, run `/approve` to open the **Auto-review Denials** picker, then
select one recent denied action to approve for one retry. Codex records up to 10
recent denials per thread. That approval is narrow: it applies to the exact
denied action, not similar future actions; it is recorded for one retry in the
same context; and the retry still goes through Auto-review. Under the hood,
Codex injects a developer-scoped approval marker for that exact action. The
reviewer then sees that explicit user override as context, but it still follows
policy and can deny again if policy says the user cannot overwrite that class of
denial.

## Configuration

For setup details, see
[Managed configuration](/mirror/codex/enterprise/managed-configuration#configure-automatic-review-policy).

The default reviewer policy is in the open-source Codex repository:
[core/src/guardian/policy.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md).
Enterprises can replace its tenant-specific section with
`guardian_policy_config` in managed requirements. Individual users can also set
a local
[`[auto_review].policy`](https://developers.openai.com/codex/config-advanced#approval-policies-and-sandbox-modes)
in their `config.toml`, but managed requirements take precedence:

```toml
[auto_review]
policy = """
YOUR POLICY GOES HERE
"""
```

To customize the policy, copy the whole default policy wording first, then
iterate based on your individual risk profile.

## Reduce review volume without weakening security

Auto-review works best when the sandbox already covers your common safe
workflows. If too many mundane actions need review, fix the boundary first
instead of teaching the reviewer to approve noisy escalations forever.

In practice, the highest-leverage changes are:

- Add narrow
  [`writable_roots`](/mirror/codex/config-advanced#approval-policies-and-sandbox-modes)
  for scratch directories or neighboring repos you intentionally use.
- Add narrowly scoped [prefix rules](/mirror/codex/rules). Prefer precise command
  prefixes such as `["cargo", "test"]` or `["pnpm", "run", "lint"]` over broad
  patterns such as `["python"]` or `["curl"]`. Broad rules often erase the very
  boundary Auto-review is meant to guard.

Auto-review session transcripts are retained under `~/.codex/sessions` by
default, so you can ask Codex to analyze past traffic there before changing
policy or permissions.

## Limits

Auto-review improves the default operating point for long-running agentic work,
but it is not a deterministic security guarantee.

- It only evaluates actions that ask to cross a boundary.
- It can still make mistakes, especially in adversarial or unusual contexts.
- It should complement, not replace, good sandbox design, monitoring, and
  organization-specific policy.

For the research rationale and published evaluation results, see the
[Alignment Research post on Auto-review](https://alignment.openai.com/auto-review/).

:::
:::

