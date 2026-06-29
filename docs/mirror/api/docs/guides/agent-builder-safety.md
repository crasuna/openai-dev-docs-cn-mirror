---
title: "构建 agents 时的安全"
description: "Minimize prompt injections and other risks when building agent workflows with OpenAI Agent Builder."
outline: deep
---

# 构建 agents 时的安全

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agent-builder-safety](https://developers.openai.com/api/docs/guides/agent-builder-safety)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agent-builder-safety.md](https://developers.openai.com/api/docs/guides/agent-builder-safety.md)
- 抓取时间：2026-06-27T05:53:57.775Z
- Checksum：`f274e21201a09d2a20169b42dd57c9332a04d7989bc62609b80426ff9230967b`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
在你使用 [Agent Builder](/mirror/api/docs/guides/agent-builder) 构建和部署 agents 时，理解风险非常重要。了解构建 multi-agent workflows 时的风险类型以及缓解方法。

OpenAI 正在弃用 Agent Builder。现有用户可以在过渡窗口期间继续使用它，该产品计划于 2026 年 11 月 30 日关闭。ChatKit 仍然可用。请查看[弃用页面](/mirror/api/docs/deprecations#2026-06-03-agent-builder)了解当前时间线。

## 风险类型

某些 agent workflow 模式更容易受到风险影响。在聊天 workflows 中，有两个重要考虑因素：保护用户输入，以及谨慎处理 MCP tool calling。

### Prompt injections

**Prompt injections** 是一种常见且危险的攻击类型。当不受信任的文本或数据进入 AI 系统，并且其中的恶意内容试图覆盖对 AI 的指令时，就会发生 prompt injection。Prompt injections 的最终目标各不相同，可能包括通过下游 tool calls 外泄私有数据、执行不一致的操作，或以非预期方式改变模型行为。例如，一个 prompt 可能会诱使数据查询 agent 发送原始客户记录，而不是预期摘要。请在 [Codex internet access docs](/mirror/codex/cloud/internet-access) 中查看上下文示例。

### 私有数据泄露

**私有数据泄露**，也就是 agent 意外共享私有数据，也是需要防范的风险。模型可能在没有攻击者参与的情况下，以非预期方式泄露私有数据。例如，模型发送给 MCP 的数据可能比用户预期或希望的更多。虽然 guardrails 可以提供更好的控制来限制上下文中包含的信息，但你无法完全控制模型选择与已连接 MCP 共享什么。

使用以下指导来减少攻击面并缓解这些风险。不过，_即使采用这些缓解措施_，agents 也不会完美，仍然可能犯错或被诱导；因此，重要的是理解这些风险，并谨慎决定给 agents 什么访问权限以及如何应用 agents。

## 不要在 developer messages 中使用不受信任的变量

因为 developer messages 的优先级高于 user 和 assistant messages，所以把不受信任的输入直接注入 developer messages，会给攻击者最高程度的控制。请通过 user messages 传递不受信任的输入，以限制其影响。这对于会把用户输入传递给敏感工具或特权上下文的 workflows 尤其重要。

## 使用 structured outputs 约束数据流

Prompt injections 通常依赖模型自由生成意外文本或命令，并让它们传播到下游。通过在节点之间定义 structured outputs（例如 enums、固定 schema、必填字段名），你可以消除攻击者可用来夹带指令或数据的 freeform channels。

## 用清晰指导和示例引导 agent

由于幻觉、误解、模糊用户输入等原因，Agent workflows 可能会做出你不想要的事情。例如，agent 可能会提供不应提供的退款，或删除不应删除的信息。缓解这种风险的最佳方式，是用良好的期望策略文档和清晰示例来强化 prompts。预判非预期场景并提供示例，让 agent 知道在这些情况下该怎么做。

## 使用 GPT-5 或 GPT-5-mini

这些模型在遵循 developer instructions 方面更自律，并且对 jailbreaks 和 indirect prompt injections 展现出更强韧性。请在 agent node 级别配置这些模型，以获得更有韧性的默认姿态，尤其适用于较高风险 workflows。

## 保持 tool approvals 开启

使用 MCP tools 时，请始终启用 tool approvals，让最终用户可以审核并确认每个操作，包括读取和写入。在 Agent Builder 中，请使用 [human approval](/mirror/api/docs/guides/node-reference#human-approval) node。

## 对用户输入使用 guardrails

使用内置 [guardrails](/mirror/api/docs/guides/node-reference#guardrails) 清理传入输入，以 redact personally identifiable information（PII）并检测 jailbreak attempts。虽然 Agent Builder 中的 guardrails nodes 单独使用并非万无一失，但它们是有效的第一道保护。

## 运行 trace graders 和 evals

如果你理解模型在做什么，就能更好地发现并防止错误。使用 [evals](/mirror/api/docs/guides/evaluation-getting-started) 来评估和改进表现。Trace grading 会为 agent trace 的特定部分（例如决策、tool calls 或 reasoning steps）提供分数和注释，用来评估 agent 哪里表现良好，哪里出了错。

## 组合使用技术

通过组合这些技术并强化关键步骤，你可以显著降低 prompt injection、恶意 tool use 或意外 agent 行为的风险。

设计 workflows 时，让不受信任的数据永远不要直接驱动 agent 行为。只从外部输入中提取特定 structured fields（例如 enums 或经过验证的 JSON），以限制 injection 风险在节点之间流动。使用 guardrails、tool confirmations，以及通过 user messages 传递的变量来验证输入。

当 agents 处理会影响 tool calls 的任意文本时，风险会上升。Structured outputs 和隔离可以大幅降低这种风险，_但不能完全消除_。

:::

## English source

::: details 展开英文原文
::: v-pre
As you build and deploy agents with [Agent Builder](/mirror/api/docs/guides/agent-builder), it's important to understand the risks. Learn about risk types and how to mitigate them when building multi-agent workflows.

OpenAI is deprecating Agent Builder. Existing users can continue using it
  during the transition window, and the product is scheduled to shut down on
  November 30, 2026. ChatKit remains available. See the [deprecations page](/mirror/api/docs/deprecations#2026-06-03-agent-builder) for the current
  timeline.

## Types of risk

Certain agent workflow patterns are more vulnerable to risk. In chat workflows, two important considerations are protecting user input and being careful about MCP tool calling.

### Prompt injections

**Prompt injections** are a common and dangerous type of attack. A prompt injection happens when untrusted text or data enters an AI system, and malicious contents in that text or data attempt to override instructions to the AI. The end goals of prompt injections vary but can include exfiltrating private data via downstream tool calls, taking misaligned actions, or otherwise changing model behavior in an unintended way. For example, a prompt might trick a data lookup agent into sending raw customer records instead of the intended summary. See an example in context in the [Codex internet access docs](/mirror/codex/cloud/internet-access).

### Private data leakage

**Private data leakage**, when an agent accidentally shares private data, is also a risk to guard against. It's possible for a model to leak private data in a way that's not intended, without an attacker behind it. For example, a model may send more data to an MCP than the user expected or intended. While guardrails provide better control to limit the information included in context, you don't have full control over what the model chooses to share with connected MCPs.

Use the following guidance to reduce the attack surface and mitigate these risks. However, _even with these mitigations_, agents won’t be perfect and can still make mistakes or be tricked; as a result, it's important to understand these risks and use caution in what access you give agents and how you apply agents.

## Don't use untrusted variables in developer messages

Because developer messages take precedence over user and assistant messages, injecting untrusted input directly into developer messages gives attackers the highest degree of control. Pass untrusted inputs through user messages to limit their influence. This is especially important for workflows where user inputs are passed to sensitive tools or privileged contexts.

## Use structured outputs to constrain data flow

Prompt injections often rely on the model freely generating unexpected text or commands that propagate downstream. By defining structured outputs between nodes (e.g., enums, fixed schemas, required field names), you eliminate freeform channels that attackers can exploit to smuggle instructions or data.

## Steer the agent with clear guidance and examples

Agent workflows may do something you don't want due to hallucination, misunderstanding, ambiguous user input, etc. For example, an agent may offer a refund it's not supposed to or delete information it shouldn't. The best way to mitigate this risk is to strengthen your prompts with good documentation of your desired policies and clear examples. Anticipate unintended scenarios and provide examples so the agent knows what to do in these cases.

## Use GPT-5 or GPT-5-mini

These models are more disciplined about following developer instructions and exhibit stronger robustness against jailbreaks and indirect prompt injections. Configure these models at the agent node level for a more resilient default posture, especially for higher-risk workflows.

## Keep tool approvals on

When using MCP tools, always enable tool approvals so end users can review and confirm every operation, including reads and writes. In Agent Builder, use the [human approval](/mirror/api/docs/guides/node-reference#human-approval) node.

## Use guardrails for user inputs

Sanitize incoming inputs using built-in [guardrails](/mirror/api/docs/guides/node-reference#guardrails) to redact personally identifiable information (PII) and detect jailbreak attempts. While the guardrails nodes in Agent Builder alone are not foolproof, they're an effective first wave of protection.

## Run trace graders and evals

If you understand what models are doing, you can better catch and prevent mistakes. Use [evals](/mirror/api/docs/guides/evaluation-getting-started) to evaluate and improve performance. Trace grading provides scores and annotations to specific parts of an agent's trace—such as decisions, tool calls, or reasoning steps—to assess where the agent performed well or made mistakes.

## Combine techniques

By combining these techniques and hardening critical steps, you can significantly reduce risks of prompt injection, malicious tool use, or unexpected agent behavior.

Design workflows so untrusted data never directly drives agent behavior. Extract only specific structured fields (e.g., enums or validated JSON) from external inputs to limit injection risk from flowing between nodes. Use guardrails, tool confirmations, and variables passed via user messages to validate inputs.

Risk rises when agents process arbitrary text that influences tool calls. Structured outputs and isolation greatly reduce, _but don’t fully remove_, this risk.

:::
:::

