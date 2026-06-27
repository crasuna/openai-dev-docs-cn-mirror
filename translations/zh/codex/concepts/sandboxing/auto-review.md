---
status: needs-review
sourceId: "bc8b92c32ea1"
sourceChecksum: "bc8b92c32ea178b6b97f3a7afcb2e7c45222d1cfb4b75b33e3b38b6acf878cd9"
sourceUrl: "https://developers.openai.com/codex/concepts/sandboxing/auto-review"
translatedAt: "2026-06-27T11:05:32.948Z"
translator: codex-gpt-5.5-xhigh
---

# Auto-review

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
该 policy 可以按 enterprise 使用 `guardian_policy_config` 自定义，或按用户使用本地 [`[auto_review].policy`](/codex/config-advanced#approval-policies-and-sandbox-modes) 自定义。

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
[Managed configuration](https://developers.openai.com/codex/enterprise/managed-configuration#configure-automatic-review-policy)。

默认 reviewer policy 位于开源 Codex repository：
[core/src/guardian/policy.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md)。
Enterprises 可以用 managed requirements 中的
`guardian_policy_config` 替换其 tenant-specific section。个人用户也可以在其 `config.toml` 中设置本地
[`[auto_review].policy`](/codex/config-advanced#approval-policies-and-sandbox-modes)，但 managed requirements 优先级更高：

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
  [`writable_roots`](https://developers.openai.com/codex/config-advanced#approval-policies-and-sandbox-modes)。
- 添加窄范围的 [prefix rules](https://developers.openai.com/codex/rules)。优先使用精确 command prefixes，例如 `["cargo", "test"]` 或 `["pnpm", "run", "lint"]`，而不是 `["python"]` 或 `["curl"]` 这类宽泛 patterns。宽泛 rules 常常会抹掉 Auto-review 本意要守住的边界。

Auto-review session transcripts 默认保留在 `~/.codex/sessions` 下，因此你可以在改变 policy 或 permissions 之前，让 Codex 分析那里的历史 traffic。

## 限制

Auto-review 改善了长时间 agentic work 的默认运行点，但它不是确定性的安全保证。

- 它只评估请求跨越边界的 actions。
- 它仍可能犯错，尤其是在对抗性或不寻常的 context 中。
- 它应该补充而不是取代良好的 sandbox 设计、监控和组织特定 policy。

关于研究动机和已发布的评估结果，请参见
[Alignment Research 关于 Auto-review 的文章](https://alignment.openai.com/auto-review/)。
