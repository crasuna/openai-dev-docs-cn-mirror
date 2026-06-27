---
status: needs-review
sourceId: "dc8eb31a0233"
sourceChecksum: "dc8eb31a023331ddb93aa095a0b272aea5e49dc9462870227e9a2a500ce71beb"
sourceUrl: "https://developers.openai.com/api/docs/guides/realtime-models-prompting"
translatedAt: "2026-06-27T18:23:55.4970917+08:00"
translator: codex-gpt-5.5-xhigh
---

# 使用 realtime 模型

`gpt-realtime-2` 是我们面向低延迟 speech-to-speech 应用的先进 reasoning voice model。与早期 realtime 模型相比，它可以在开口前思考、更可靠地遵循指令、使用更大的上下文窗口，并更精确地调用工具。

要利用这些提升，请更有意图地设计 prompts。清楚定义 assistant 的职责、决策点、tool-calling 行为和 guardrails：它应该做什么、何时做，以及应该避免什么。

从简单开始。不要一开始就过度提示。先使用最小 prompt，运行
  evaluations，然后只针对测试中失败的行为添加指令。

## 选择模型

<table>
  <thead>
    <tr>
      <th>Model</th>
      <th>何时使用</th>
      <th>Prompting 重点</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style={{ whiteSpace: "nowrap" }}>
        <a href="/api/docs/models/gpt-realtime-2">
          <code>gpt-realtime-2</code>
        </a>
      </td>
      <td>
        你需要最强的 realtime reasoning、工具使用和指令
        遵循能力。
      </td>
      <td>
        调优 reasoning effort、preambles、工具策略、精确实体捕获
        和长会话状态。
      </td>
    </tr>
    <tr>
      <td style={{ whiteSpace: "nowrap" }}>
        <a href="/api/docs/models/gpt-realtime-1.5">
          <code>gpt-realtime-1.5</code>
        </a>
      </td>
      <td>你需要快速、可靠的非 reasoning speech-to-speech 模型。</td>
      <td>
        遵循核心 realtime prompt 结构，并测试延迟敏感
        行为。
      </td>
    </tr>
  </tbody>
</table>



<div data-content-switcher-pane data-value="gpt-realtime-2">
## Realtime 2.0 Prompting Guide

    <p>
      当语音 agent 需要更强的
      reasoning、工具选择、精确实体处理或长会话状态时，请使用 <code>gpt-realtime-2</code>。
      从 <code>reasoning.effort: "low"</code> 开始，测试默认 preamble
      行为，并在写入动作前定义清晰的确认边界。
    </p>

## Realtime 2 中的变化

应把 Realtime 2 当作 reasoning voice agent 来提示，而不是当作基础语音 bot。

| 变化 | 对 prompts 意味着什么 |
| --- | --- |
| Reasoning | 允许模型在说话或调用工具前，为复杂任务进行内部推理。使用 preambles 避免尴尬沉默或不必要的填充语。 |
| Prompt 精度更重要 | 用清晰的触发、动作和例外规则替代“be helpful”这类宽泛指导：何时行动、做什么、何时不做。 |
| 指令冲突代价更高 | 除非确实需要，否则移除重叠的 `always`、`never`、`only` 和 `must` 规则。规则竞争时定义优先级。 |
| 工具行为更可引导 | 指定 assistant 何时应立即行动、询问缺失信息、确认高精度细节、失败后重试或升级。 |
| Preambles 是一等行为 | 模型可能会在更长 reasoning 或 tool-use flow 前说出简短更新。引导 preambles 应何时出现、应多短，以及何时跳过。 |
| 扩展的上下文窗口 | `gpt-realtime-2` 将 realtime context window 从 32k tokens 扩展到 128k tokens，因此更适合长会话和更大的 system prompts。 |

Preambles 不是隐藏的 chain-of-thought。它们是简短的口头更新，例如
  "I'll check that order now." 不要要求模型透露私有推理。

## 推荐 prompt 结构

使用简短、带标签的章节。模型应能快速找到相关指令。

```text
# Role and Objective

# Personality and Tone

# Language

# Reasoning

# Message Channels

# Preambles

# Verbosity

# Tools

# Unclear Audio

# Entity Capture

# Long Context Behavior

# Escalation
```

并非每个用例都需要每个章节。添加与你产品相关的章节。

## 设置 reasoning effort

`gpt-realtime-2` 可以用更深的 reasoning 换取延迟。请使用仍能为工作流提供足够智能的最低 reasoning level。

大多数生产语音 agents 从 `low` 开始。根据任务复杂度、延迟容忍度和失败成本上下调优。

| Effort | 何时使用 | 示例 |
| --- | --- | --- |
| `minimal` | 最低延迟最重要，且任务简单。 | 智能家居命令、计时器、简单日历检查。 |
| `low` | 你需要响应速度加基础 reasoning。 | 客户支持、订单查询、简单政策问题。 |
| `medium` | assistant 必须推理多步骤任务。 | 技术支持、诊断、复杂路由。 |
| `high` | 更深 reasoning 能显著提升成功率。 | 高精度工作流、升级决策、带约束的任务。 |
| `xhigh` | 最大 reasoning 值得增加延迟和成本。 | 复杂规划、关键分流、高风险工具编排。 |

除了 API 设置，也要引导模型何时以及以多大程度 reasoning。

```text
## Reasoning

- For direct answers, simple lookups, and short confirmations, respond quickly and do not reason.
- For multi-step tasks, tool decisions, troubleshooting, or escalation, reason before acting.
- Do not perform extended reasoning when the user's audio is unclear; ask for clarification instead.
```

## 有意使用 preambles

Preambles 是简短的口头更新，在语音 agent 推理、查找内容或调用工具时让它保持响应感。用得好时，它们会让用户放心，知道 assistant 正在工作。用得不好时，它们会变成填充语并增加感知延迟。

`gpt-realtime-2` 默认会生成 preambles。请先测试默认行为。如果它不符合你的产品体验，再显式调优。

![Preamble generation and playback timeline](https://developers.openai.com/images/platform/guides/realtime-2-preambles.png)

```text
## Preambles

Use short preambles only when they help the user understand that work is happening.

### When to use a preamble

Use a preamble when:

- you are about to call a tool that may take noticeable time;
- you need to reason through a multi-step request;
- you are checking records, availability, account state, or policy details;
- you are preparing an escalation or handoff;
- silence would make the assistant feel unresponsive.

When a preamble is needed, output it immediately before substantive reasoning or tool use.

### When to not use a preamble

Do not use a preamble when:

- the answer is direct and can be given immediately;
- the user is only confirming, correcting, or declining something;
- the audio is unclear and you need clarification;
- the latest audio is silence, background noise, hold music, TV audio, or side conversation;
- the tool call is lightweight and the user would not benefit from an update.

### Preamble style

When using a preamble:

- keep it natural, calm, and concise;
- vary the wording across turns;
- describe the action, not the internal reasoning;
- avoid filler.

Avoid phrases like:

- "Let me think..."
- "Hmm..."
- "One moment while I process that..."
- "I am now going to access the tool..."

### Preamble length

Use one short sentence.

Do not exceed two short sentences unless the user needs an explanation before a high-impact action.

### Prefer

- "I'll check that order now."
- "I'll look up your appointment details."
- "I'll verify that before we make any changes."
- "I'll check the policy and then give you the next step."
- "I'll pull that up so we can make sure it's the right account."

### Avoid

- "Let me think about that for a second."
- "Please wait while I process your request."
- "I'm going to use my tools now."
- "Interesting question. I will reason through this carefully."
```

## 控制响应长度

当 prompt 为每种任务类型指定应给出多少细节时，`gpt-realtime-2` 最能遵循长度指导。不要只告诉模型“be concise”，而要在上下文中定义简洁意味着什么：直接回答、工具结果、故障排除、对比和升级可能各自需要不同的响应长度。

```text
## Verbosity

- Direct answers: Use 1-2 short sentences.
- Clarifying questions: Ask one question at a time.
- Tool results: Summarize the result first, then give only the next useful action.
- Product or option comparisons: Include key differences, tradeoffs, and who each option fits.
- Troubleshooting: Give one step at a time unless the user asks for the full procedure.
- Escalations: Briefly explain why escalation is needed and what will happen next.
```

示例：

> User: Which plan should I choose?

> Assistant: If you want the lowest cost, choose Basic. If you need team permissions and shared billing, choose Pro. If compliance review or admin controls matter, choose Enterprise.

## 设计工具行为

`gpt-realtime-2` 在 tool calling 上更强，但工具行为仍取决于 prompt 和 tool-spec 设计。如果 prompt 没有定义何时行动、询问、确认或恢复，assistant 可能会过早调用工具、提出不必要的问题，或重复失败调用。

### 设置 tool-call eagerness

高 eagerness 适合只读、低风险动作。低 eagerness 更适合会修改数据、触发外部影响或依赖精确标识符的工具。

| 工具类型 | 默认行为 |
| --- | --- |
| 只读、低风险查询 | 当意图和必需字段清楚时调用。 |
| 带精确标识符的只读操作 | 查询前确认标识符。 |
| 用户可见的通信 | 发送前先草拟或总结。 |
| 账号变更 | 调用前确认。 |
| 购买、取消、付款 | 调用前确认金额、目标和后果。 |
| 不可逆或高影响动作 | 显式确认，并在适当时提供升级。 |

当你同时有读和写动作时，使用这个均衡默认值。请根据你的用例定制。

```text
## Tools

Use only the tools explicitly provided in the current tool list. Do not invent, assume, simulate, or rename tools.

For read-only tools:

- Call the tool when the user's intent is clear and all required fields are available.
- Do not ask for confirmation unless the lookup depends on a high-precision identifier or there is meaningful risk of using the wrong record.
- Ask a clarification question only if a required field is missing, ambiguous, or conflicting.

For write tools or external actions:

- Summarize the intended action before calling the tool.
- Include the key consequence, such as what will be changed, sent, canceled, ordered, or charged.
- Ask for confirmation.
- Do not call the tool until the user clearly confirms.

For exact identifiers:

- Treat order IDs, tracking numbers, account numbers, confirmation codes, phone numbers, and email addresses as high precision.
- Normalize only when the field type is clear.
- Confirm the final value before account-specific lookups, validation, or write actions.

After tool calls:

- Only say an action was completed after the tool call succeeds.
- If the tool fails, explain the failure briefly, avoid raw errors, and give the user a clear next step.
```

高风险示例：

> User: Charge my card for the remaining balance.

不好：

> Assistant: I've charged your card.

好：

> Assistant: To confirm, you want me to charge the card on file $248.16 for the remaining balance. Should I proceed?

### 从工具失败中恢复

工具失败是对话的一部分。良好的恢复应解释发生了什么，并给用户清晰的下一步。

不要把每次失败都同等对待。恢复行为应取决于工具类型、失败模式和用户影响。有些失败应通过静默重试处理。其他失败则需要请用户澄清、修正标识符、确认新动作，或选择替代路径。

```text
## Tool Failures

If a tool call fails:

1. Briefly explain what failed in user-friendly language.
2. Do not blame the user or expose raw tool errors.
3. If the failure may be due to an exact identifier, read back the value used and ask the user to correct it.
4. If the failure may be temporary, offer to retry once.
5. If the same failure happens repeatedly, offer an alternate path or escalation.

Do not repeatedly call the same tool with the same arguments after failure.

Do not ask for a different identifier until you have first checked whether the captured value was correct.
```

不好：

> Assistant: Something went wrong.

好：

> Assistant: I couldn't find a match for O R D dash 3 1 2 5 B 2 3. Did I get any part of that wrong?

### 保持工具可用性同步

Realtime 模型很乐于帮助。如果 prompt 提到实际不可用的工具，或工具列表与 prompt 不匹配，模型可能会发明工具名称，或假装已经完成动作。

例如，如果 prompt 引用了 `lookup_order`，但提供的工具名是 `search_orders`，模型可能会调用错误名称或模拟该动作。

```text
## Tool Availability

Use only the tools that are explicitly provided in the current tool list.

Do not invent, assume, or simulate tools. If a tool is mentioned in the instructions but is not present in the tool list, treat it as unavailable.

If the user requests an action that requires an unavailable tool:

1. Do not pretend to complete the action.
2. Briefly explain that the tool is not available.
3. Offer the closest supported next step.

Only say an action was completed after the relevant tool call succeeds.
```

使用附录中的 prompt audit meta prompt 审查生产 prompts
  中的矛盾、缺失工具和脆弱指令。

## 处理静音和背景音频

语音 agents 默认倾向于响应。在生产中，它们经常会听到不应获得口头响应的音频，例如静音、背景噪声、等待音乐、电视音频或旁边对话。

当 assistant 应保持安静并继续监听时，使用 no-op wait tool。该工具给模型一个有效的非说话动作，而不是让它说出 “I'm here” 或 “I didn't catch that” 之类的话。

工具设计：

```json
{
  "name": "wait_for_user",
  "description": "Call this when the latest audio does not need a spoken response, such as silence, background noise, hold music, TV audio, side conversation, or speech not addressed to the assistant. This tool helps end the turn without a spoken reply.",
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```

将它与 prompt 指令配对：

```text
## Handling Silence and Background Noise

If the latest audio is silence, background noise, hold music, TV audio, side conversation, or speech not addressed to you, call `wait_for_user`.

Do not respond conversationally after calling this tool.

Do not say "I'm here," "I didn't catch that," "Take your time," or "Let me know when you're ready."

Resume normal responses only when the user clearly addresses you or asks for help.
```

这用于非面向 assistant 的音频，而不是不清晰的用户请求。如果用户明显在和 assistant 说话，但内容无法理解，请改为请求澄清。

## 有意使用 message channels

`gpt-realtime-2` 可以在 commentary channel 生成用户可见的中间消息，并在 final channel 生成最终面向用户的响应。当行为取决于出现位置时，请使用 channel-specific 指令。

| Channel | 用户可见？ | 用途 |
| --- | --- | --- |
| `commentary` | 是 | Preambles 和工具调用。 |
| `final` | 是 | 最终面向用户的消息。 |

例如，工具调用发生在 commentary channel。如果你希望 assistant 在工具使用前、过程中或之后说些什么，请结合 commentary channel 指定该行为。

```text
Before calling tools in the commentary channel, briefly tell the user what you are doing.
```

`gpt-realtime-2` 可以在单轮中发出多个 response phases。在 API 输出中，这一区分由 `response.done` event 表示，其中包含一个 `phase` 值，指示内容是 commentary 还是 final answer。

你可以在应用中使用此字段以不同方式处理每个 phase。例如，commentary 可以作为简短中间更新播放或显示，而 `final_answer` 可保留给 assistant 的完整响应。

```text
response.output[0].phase: "commentary"
response.output[1].phase: "final_answer"
```

响应 phases 示例

User prompt：

> "I'm stuck on this AP Bio question [QUESTION]."

缩短的 API response：

```json
{
  "type": "response.done",
  "response": {
    "output": [
      {
        "phase": "commentary",
        "content": [
          {
            "type": "output_audio",
            "transcript": "Let's zero in on the enzyme's shape and binding, since that's the key idea here."
          }
        ]
      },
      {
        "phase": "final_answer",
        "content": [
          {
            "type": "output_audio",
            "transcript": "What changes at the active site at high temperature?"
          }
        ]
      }
    ]
  }
}
```

## 处理不清晰音频

模型只应基于它有信心理解的音频行动。如果音频不清晰，模型应提出简短澄清问题，而不是猜测。

不要让模型推断缺失词语、调用工具、捕获实体、生成 preambles，或花费隐藏 reasoning 时间尝试重构用户可能说了什么。

```text
## Unclear Audio

- Only respond to clear audio or text.
- If the user's audio is not clear, ask for clarification using a short English phrase such as "Sorry, could you repeat that clearly?"
- Don't repeat the same unclear-audio clarification twice.
- Treat audio as unclear if it is ambiguous, noisy, silent, unintelligible, partially cut off, or if you are unsure of the exact words the user said.
- Do not guess what the user meant from unclear audio.
- Do not reason when the audio is unclear.
- Do not provide a preamble or call tools in the commentary channel when the audio is unclear.
```

示例：

> User audio: "Check order three one-" [cut off]

不好：

> Assistant: I'll check order 31 now.

好：

> Assistant: I heard only part of the order number. Could you repeat it digit by digit?

## 捕获精确实体

许多 realtime 工作流依赖精确值：order IDs、tracking numbers、email addresses、confirmation codes、account numbers、claim numbers、ticket IDs、support references 和 phone numbers。

语音让这件事变难。用户说话很快、用不同方式分组数字、拼读部分值、使用填充词、中途纠正自己，或发出听起来相似的字符。一个错误数字就可能导致查询失败或检索到错误账号。

应保守地捕获实体。一次收集一个值，只规范化清楚的内容，在工具调用前确认高精度值，并让每次纠正都可恢复。

### 一次收集一个实体

当工作流需要多个值时，一次收集一个。这可以防止字段混在一起，尤其是在语音对话中。

```text
## Entity Collection Order

Collect required values one at a time.

- Ask for only the next missing value.
- Do not ask for multiple values in the same turn.
- Before asking, check whether the value was already provided earlier in the conversation or the session.
- If a possible value already exists, confirm it with the user before using it.

Example:

"I see tracking number ABC-54321 from earlier. Should I use that one, or do you have a different tracking number?"

Do not call tools until the current value has been collected, validated, and confirmed.
```

### 处理逐字符拼读

当用户逐个字符拼读 IDs、codes、names 或 email addresses 时使用此规则。口头形式是输入，而不是最终值。

```text
## Spelled-Out Characters

When a user dictates an ID, code, or email character by character, treat the spoken sequence as one compact value. Preserve explicitly spoken separators like dash, dot, underscore, slash, or plus; otherwise do not add spaces or separators.

Examples:

- "A B C one two three" -> "ABC123"
- "B C dash nine eight seven" -> "BC-987"
- "J O H N at example dot com" -> "john@example.com"

Do not insert spaces between spelled-out characters unless the user explicitly says the value contains spaces.
```

### 谨慎规范化口头数字

对于数字标识符，用户可能会逐位说、分组说，或使用自然数字短语。如果字段预期是一个连续数值，请将清晰的数字语音转换为数字。

```text
## Spoken Number Handling

Convert spoken numbers into digits when collecting numeric identifiers.

Examples:

- "one two three four" -> "1234"
- "one twenty three" -> "123"
- "one nineteen" -> "119"
- "ninety nine eleven" -> "9911"
- "nine thousand nine hundred eleven" -> "9911"

If multiple interpretations are plausible, ask the user to clarify before using the value.

Example:

"I heard either 119 or 1-19. Could you repeat the number digit by digit?"
```

### 工具调用前确认精确标识符

Order IDs、tracking numbers、account numbers、claim numbers、confirmation codes 和类似标识符都是高精度字段。使用它们调用工具前请先确认。

对于数字标识符，请逐位读回该值。把值作为完整数字读出可能会掩盖错误。

示例：

> Assistant: Just to confirm, I heard 8... 3... 5... 2... 1. Is that right?

如果用户纠正某个字符或数字，请在调用工具前重复完整纠正后的值。

示例：

> Assistant: Got it. I have 8... 3... 5... 7... 1. Is that correct?

```text
## Exact Identifier Confirmation

Before calling tools with high-precision identifiers:

- Confirm the final normalized value with the user.
- Read numeric identifiers back digit by digit.
- Do not use guessed, partial, or ambiguous values.
- If the user corrects the value, repeat the full corrected value before calling the tool.
```

### 逐字符确认 emails

Email addresses 是重要值。Dots、dashes、underscores、重复字母以及发音相近的名字，都可能导致账号查询失败或把消息发送到错误地址。

请让用户拼读 email address：

> Assistant: Could you spell the email address character by character so I can make sure I have it exactly right?

读回时，确认最终地址的精确值：

> Assistant: Just to confirm, that is c-h-e-n at example dot com, right?

```text
## Email Confirmation

Email addresses must be captured exactly.

If the user says the email naturally without spelling it out, ask them to repeat it character by character.

Example:

"Could you spell the email address character by character so I can make sure I have it exactly right?"

When reading an email back, confirm the exact final email address.

Example:

"Just to confirm, that is c-h-e-n at example dot com, right?"
```

### 实体收集工作流

实体收集工作流示例

当任务需要精确值才能调用任何工具时，请使用这个完整工作流。

```text
## Entity Collection Workflow

When a workflow requires an exact value, collect and confirm it before using it in any tool call.

Exact values include order IDs, tracking numbers, confirmation codes, account numbers, claim numbers, ticket IDs, support references, email addresses, phone numbers, and similar identifiers.

Follow this workflow:

1. Collect the next required value.

- Ask for only one missing value at a time.
- Do not ask for multiple exact values in the same turn.
- Before asking, check whether the value was already provided earlier in the conversation or session.

2. Normalize only what is clear.

- Convert clearly spoken digits or spelled-out characters into the expected format.
- Preserve explicit separators such as dashes, dots, underscores, slashes, and plus signs.
- Do not guess, infer, repair, or fill in unclear characters.
- If the value could be interpreted in more than one way, ask the user to repeat or clarify it.

3. Confirm the final value.

- Read back the normalized value before using it.
- For numeric identifiers, confirm digit by digit.
- For email addresses, confirm character by character when precision matters.
- Wait for a clear confirmation from the user.

4. Call the tool only after confirmation.

- Do not call lookup, account, messaging, payment, booking, or update tools with guessed, partial, ambiguous, or unconfirmed values.

5. Recover safely from corrections.

- If the user corrects any part of the value, update the value, repeat the full corrected value, and ask for confirmation again.
- Do not use the corrected value in a tool call until the user confirms the full final value.

Examples:

User: My order ID is ORD-3125B23.

Assistant: Just to confirm, I heard O-R-D dash 3-1-2-5-B-2-3. Is that right?

User: It is 83521 - actually, the fourth digit is 7.

Assistant: Got it. I have 8... 3... 5... 7... 1. Is that correct?

User: My email is chen@example.com.

Assistant: Could you spell that email address character by character so I can make sure I have it exactly right?

Never call tools with guessed, partial, ambiguous, or unconfirmed exact values.
```

## 避免字面指令陷阱

`gpt-realtime-2` 比早期 realtime 模型更字面地遵循指令。在旧模型上运行良好的 prompts 可能需要调优。

使用精确语言。模型可能会优先遵循指令的确切措辞，而不是你原本想要的更广泛行为。宽泛或僵硬的规则可能会以令人意外的方式主导 assistant 行为，尤其是在多条规则重叠时。

谨慎使用 `must`、`only`、`never` 和 `always` 这类约束词。只有在行为确实必须如此时使用它们，而不是把它们当作一般强调。过度使用硬约束可能会让 assistant 变得僵硬、过度谨慎，或无法处理合理例外。

优先使用精确范围：

```text
For write actions that modify user data, ask for confirmation before calling the tool.
```

避免宽泛范围：

```text
Always ask for confirmation before doing anything.
```

宽泛版本可能会导致在无害的只读查询前也进行不必要确认，例如检查订单状态、检索可用性或读取账号信息。

### 字面解释示例

字面解释陷阱示例

这个 prompt 范围太窄：

```text
When a confirmation code is provided, repeat it verbatim and wait for a clear yes.
```

用户消息：

> My order ID is ORD-3125B23.

可能失败：

模型可能不会应用该规则，因为用户提供的是 order ID，而不是 confirmation code。对开发者来说，意图很清楚，但指令范围太窄。

更安全的改写：

```text
When the user provides an exact identifier, including confirmation codes, order IDs, ticket IDs, reset PINs, claim numbers, tracking numbers, or account numbers, repeat the captured value and wait for confirmation before using it in a tool call.
```

一般 prompting 建议：

- 优先使用显式指令，而不是隐含意图。
- 除非行为确实必须僵硬，否则避免不必要的约束词。
- 尽量减少相互矛盾的指导。
- 谨慎处理分层或相互竞争的优先级指令。
- 逐步测试 prompts。小的措辞变化可能产生很大行为影响。
- 从早期 realtime 模型迁移时，应预期一些 prompts 需要重构才能获得最佳结果。

## 分别控制语言和口音

语言和口音应分开控制。

用户的口音并不等同于其预期语言。用户可能带着 Hindi、Spanish、French 或 Mandarin 口音说英语，但仍期望英文回答。

避免以下宽泛语言指令：

```text
Mirror the user.
Respond naturally in the user's language.
Switch languages when appropriate.
Sound local.
Adapt to the user's accent.
```

这些指令过于宽泛。模型可能会把口音、填充词、backchannels 或孤立外语词解释为切换语言的理由。

### 英语语言策略

```text
## Language

English is the default response language.

- Do not infer language from accent alone.
- Ignore short filler sounds, backchannels, and isolated foreign words for language detection.
- Only switch languages if the user explicitly asks or provides a substantive utterance in another language.
- If language confidence is low, ask a short clarification instead of guessing.
- Keep preambles, spoken bridges, tool-related messages, and final answers in the same language.
- Accent adaptation must not change the response language.
```

### 多语言策略

```text
## Language

Default to English unless the user clearly uses another language.

Switch languages only when:

- the user explicitly asks to use another language;
- the user provides a substantive utterance in another language. A substantive utterance means the user gives a complete request, question, or correction in another language, not just a greeting, name, address, filler word, or borrowed phrase.

Do not switch languages based on:

- accent;
- pronunciation;
- filler words;
- short backchannels;
- names;
- addresses;
- isolated foreign words.

If uncertain, ask:

"Would you like me to continue in English or [LANGUAGE]?"
```

### 口音控制

`gpt-realtime-2` 可以更强地遵循口音指令，但模糊的口音 prompts 可能导致漂移或意外切换语言。

当口音控制 prompts 指定以下内容时，效果最佳：

- 目标口音；
- 哪些特征应保持稳定；
- 预期的节奏、重音和韵律；
- 口音适配是否应影响语言选择。

不要这样写：

```text
Sound Australian.
```

应使用：

```text
## Accent

Speak English with a light Australian accent.

- Keep the accent stable from the first word to the last.
- Use natural Australian vowel shaping, but keep speech easy to understand.
- Do not exaggerate the accent.
- Do not change response language based on the user's accent.
```

### Custom voices

当标准 voices 不能可靠满足品牌、口音或角色要求时，请使用 [Custom Voices](https://developers.openai.com/blog/updates-audio-models#custom-voices)。

Prompting 可以引导口音、语速和表达方式，但无法完全替代 voice design。对于需要一致品牌 voice identity 或口音保真度的用例，请考虑 [Custom Voices](https://developers.openai.com/blog/updates-audio-models#custom-voices)。

Custom Voices 仅向获批准客户开放。请联系你的 account team 获取访问权限。

## 在长会话中维护状态

`gpt-realtime-2` 将 realtime context window 从 32k tokens 扩展到 128k tokens，因此更适合长会话。对于密集的双向对话，128k tokens 最好大致理解为 1-2 小时的密集原始音频上下文。这会因工具使用、内部 reasoning、注入记录和其他会话细节而不同。

对于长上下文用例，当模型能分辨哪些信息是当前的、哪些是背景、如果来源冲突应忽略哪些信息时，`gpt-realtime-2` 表现最佳。不要依赖模型从原始 transcript 或大型上下文转储中推断来源优先级。请使用结构。

当以大量上下文启动会话时，例如检索到的记录、先前对话历史、政策、摘要、账号备注或背景文档，请使用结构化模式。

长会话上下文模板示例

```text
## Context

### Current State

- **Current task:** [current task]
- **Latest known state:** [current value]
- **Next safe step:** [what the assistant should do next]

### Authoritative Sources

- **Fact or record:** [fact or record]
- **Source:** [tool result / active policy / verified record]
- **Status:** current
- **Retrieved:** [date/time or this turn]

### Historical or Background Sources

- **Older fact or record:** [older fact or record]
- **Source:** [prior conversation / older record / summary]
- **Status:** stale or background
- **Note:** Do not use for current decisions if it conflicts with a current source.

### Relevant Policy or Rules

- [decision rule or constraint]

### Other Context

- [potentially useful but non-authoritative background]
```

## 从早期 realtime 模型迁移

从早期 realtime 模型迁移时，请把 prompt 当作行为表面，而不仅仅是要移植的文本。

1. 使用 Codex 或强 reasoning 模型，围绕最新 Realtime prompting guidance 重构 prompt。包含此 prompting guide 的链接，使迁移以最佳实践为依据。
2. 将 reasoning effort 设为 `low`，而不是使用默认值。只有对需要更深规划的工作流才提高。
3. 审计工具名称、参数、enums、JSON schemas 和其他设置，确保它们匹配预期实现。
4. 移除陈旧示例。为 happy paths、ambiguity、interruptions、tool calls 和 fallback behavior 添加简短示例。
5. 比较迁移前后的代表性对话。根据现有 eval 检查 regressions，并记录有意的行为变化。
6. 运行最终一致性检查。确认 prompt 清晰区分硬性要求、默认值、工具规则、安全规则和 fallback behavior。
7. 运行 evals，检查代表性失败，并迭代 prompt，直到目标行为可靠。

  </div>
  <div data-content-switcher-pane data-value="gpt-realtime-1.5" hidden>

## Realtime 1.5 Prompting Guide

`gpt-realtime-1.5` 是 Realtime API 中的 speech-to-speech 模型。同样的 `gpt-realtime` prompting guidance 适用于该模型。

Speech-to-speech 系统对于将语音作为核心 AI 界面至关重要。`gpt-realtime-1.5` 支持稳健、可用的 realtime voice agents，可以大规模处理任务关键型工作流。

与早期 realtime preview 模型相比，`gpt-realtime-1.5` 具有更强的指令遵循、更可靠的工具调用、更好的语音质量，以及整体更顺滑的体验。这些提升让从链式方法迁移到真正 realtime 体验变得可行，可以降低延迟，并生成听起来更自然、更有表现力的响应。

Realtime 模型受益于一些并不直接适用于基于文本模型的 prompting 技巧。本 prompting guide 先给出建议的 prompt skeleton，然后逐部分讲解实用技巧、可复制的小模式，以及可改编到你用例中的示例。

## 通用提示

- **持续迭代**：小的措辞变化可能决定行为成败。
  - 示例：对于不清晰音频指令，我们将 “inaudible” 换成 “unintelligible”，改进了嘈杂输入处理。
- **优先使用项目符号而不是段落**：清晰、简短的项目符号优于长段落。
- **用示例引导**：模型会紧密遵循示例短语。
- **保持精确**：歧义或冲突指令会导致类似 GPT-5 的性能下降。
- **控制语言**：如果看到不想要的语言切换，请将输出固定到目标语言。
- **减少重复**：添加 Variety 规则以减少机械化措辞。
- **使用大写文本强调**：将关键规则大写可以让它们更突出，模型也更容易遵循。
- **将非文本规则转换为文本**：不要写 "IF x > 3 THEN ESCALATE"，而要写 "IF MORE THAN THREE FAILURES THEN ESCALATE"。

## Prompt 结构

组织 prompt 能让模型更容易理解上下文，并在多轮中保持一致。它也让你更容易迭代和修改有问题的章节。

- **作用**：在 system prompt 中使用清晰、带标签的章节，让模型可以找到并遵循它们。每个章节保持聚焦，只处理一件事。
- **如何改编**：添加领域特定章节（例如 Compliance、Brand Policy）。移除不需要的章节（例如，如果没有发音问题，就移除 Reference Pronunciations）。

示例

```
# Role & Objective        — who you are and what “success” means
# Personality & Tone      — the voice and style to maintain
# Context                 — retrieved context, relevant info
# Reference Pronunciations — phonetic guides for tricky words
# Tools                   — names, usage rules, and preambles
# Instructions / Rules    — do’s, don’ts, and approach
# Conversation Flow       — states, goals, and transitions
# Safety & Escalation     — fallback and handoff logic
```

## Role and Objective

本节定义 agent 是谁，以及什么算“完成”。示例展示了两个不同身份，以说明当角色和目标足够明确时，模型会多严格地遵循它们。

- **何时使用**：模型没有承担你需要的人格、角色或任务范围。
- **作用**：固定 voice agent 的身份，使其响应受该角色描述约束。
- **如何改编**：根据你的用例修改角色。

#### 示例（模型采用特定口音）

```
# Role & Objective
You are a Quebecois French-speaking customer service bot. Your task is to answer the user's question.
```

早期 realtime preview：

<div className="my-6">
  </div>

`gpt-realtime-1.5`：

<div className="my-6">
  </div>

#### 示例（模型扮演角色）

```
# Role & Objective
You are a high-energy game-show host guiding the caller to guess a secret number from 1 to 100 to win 1,000,000$.
```

早期 realtime preview：

<div className="my-6">
  </div>

`gpt-realtime-1.5`：

<div className="my-6">
  </div>

与早期 realtime preview 模型相比，`gpt-realtime-1.5` 能更可靠地扮演指定角色。

## Personality and Tone

当模仿特定人格或语气时，`gpt-realtime-1.5` 能很好地遵循指令。你可以根据用例预期来定制语音体验和表达方式。

- **何时使用**：响应感觉平淡、过于冗长，或跨轮不一致。
- **作用**：设置声音、简洁度和节奏，让回复听起来自然且一致。
- **如何改编**：调节温暖度/正式度和默认长度。对于受监管领域，优先采用中性精确风格。添加与你用例相关的其他子章节。

#### 示例

```
# Personality & Tone
## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
2–3 sentences per turn.
```

#### 示例（多情绪）

```
# Personality & Tone
- Start your response very happy
- Midway, change to sad
- At the end change your mood to very angry
```

`gpt-realtime-1.5`：

<div className="my-6">
  </div>

模型能够遵循复杂指令，并在整个音频响应中切换三种情绪。

### 语速指令

在 Realtime API 中，`speed` 参数改变的是播放速率，而不是模型如何组织语音。要让语音真正听起来更快，请添加可以引导节奏的指令。

- **何时使用**：用户想要更快的说话声音；仅靠播放速度（speed 参数）无法修正说话风格。
- **作用**：独立于客户端播放速度，调节说话风格（简洁度、语流）。
- **如何改编**：修改语速指令以满足用例要求。

#### 示例

```
# Personality & Tone
## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
- 2–3 sentences per turn.

## Pacing
- Deliver your audio response fast, but do not sound rushed.
- Do not modify the content of your response, only increase speaking speed for the same response.
```

早期 realtime preview：

<div className="my-6">
  </div>

`gpt-realtime-1.5`：

<div className="my-6">
  </div>

通过显式节奏指令，`gpt-realtime-1.5` 可以产生明显更快的节奏，同时听起来不会太匆忙。

### 语言约束

语言约束确保模型始终以预期语言回应，即使在背景噪声或多语言输入等具有挑战的条件下也是如此。

- **何时使用**：防止在多语言或嘈杂环境中意外切换语言。
- **作用**：将输出锁定到所选语言，防止意外语言变化。
- **如何改编**：将 “English” 替换为你的目标语言；或根据用例添加更复杂指令。

#### 示例（固定到一种语言）

```
# Personality & Tone
## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
- 2–3 sentences per turn.

## Language
- The conversation will be only in English.
- Do not respond in any other language even if the user asks.
- If the user speaks another language, politely explain that support is limited to English.
```

这些是在使用 `gpt-realtime-1.5` 应用该指令后的响应。

![lang constraint en](https://developers.openai.com/cookbook/assets/images/lang_constraint_en.png)

#### 示例（模型教授语言）

```
# Role & Objective
- You are a friendly, knowledgeable voice tutor for French learners.
- Your goal is to help the user improve their French speaking and listening skills through engaging conversation and clear explanations.
- Balance immersive French practice with supportive English guidance to ensure understanding and progress.

# Personality & Tone
## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
- 2–3 sentences per turn.

## Language
### Explanations
Use English when explaining grammar, vocabulary, or cultural context.

### Conversation
Speak in French when conducting practice, giving examples, or engaging in dialogue.
```

这些是在使用 `gpt-realtime-1.5` 应用该指令后的响应。

![multi language](https://developers.openai.com/cookbook/assets/images/multi-language.png)

模型能够根据自定义指令在一种语言和另一种语言之间进行 code-switch。

### 减少重复

Realtime 模型可以紧密遵循示例短语以保持品牌一致，但也可能过度使用它们，使响应听起来机械或重复。添加重复规则有助于保持多样性，同时保留清晰度和品牌声音。

- **何时使用**：输出在多轮或多会话中重复相同开头、填充语或句式。
- **作用**：添加多样性约束，减少重复短语，推动同义表达和替代句式，同时保留必需术语。
- **如何改编**：调节严格程度（例如“每 N 轮不要重复使用同一个开头超过一次”），将必须保留的短语（法律/合规/品牌）加入白名单，并在一致性重要的地方允许更紧凑措辞。

#### 示例

```
# Personality & Tone
## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
- 2–3 sentences per turn.

## Language
- The conversation will be only in English.
- Do not respond in any other language even if the user asks.
- If the user speaks another language, politely explain that support is limited to English.

## Variety
- Do not repeat the same sentence twice.
- Vary your responses so they don't sound robotic.
```

这些是在使用 `gpt-realtime-1.5` 应用指令**之前**的响应。模型重复相同确认：`Got it`。

![repeat before](https://developers.openai.com/cookbook/assets/images/repeat_before.png)

这些是在使用 `gpt-realtime-1.5` 应用指令**之后**的响应。

![repeat after](https://developers.openai.com/cookbook/assets/images/repeat_after.png)

现在模型能够变化其响应和确认方式，听起来不再机械。

## Reference Pronunciations

本节说明如何确保模型在口语交互中正确发音重要单词、数字、名称和术语。

- **何时使用**：品牌名、技术术语或地点常被误读。
- **作用**：通过音标提示提升信任和清晰度。
- **如何改编**：保持短列表；在听到错误时更新。

#### 示例

```
# Reference Pronunciations
When voicing these words, use the respective pronunciations:
- Pronounce “SQL” as “sequel.”
- Pronounce “PostgreSQL” as “post-gress.”
- Pronounce “Kyiv” as “KEE-iv.”
- Pronounce "Huawei" as “HWAH-way”
```

早期 realtime preview：

<div className="my-6">
  </div>

`gpt-realtime-1.5`：

<div className="my-6">
  </div>

通过参考发音指令，`gpt-realtime-1.5` 可以正确地将 SQL 发音为 "sequel."。

### 字母数字发音

Realtime S2S 在读回关键信息（phone、credit card、order IDs）时可能会模糊或合并数字/字母。显式的逐字符确认可以防止误听，并推动更清晰的合成语音。

- **何时使用**：如果模型难以捕获或读回电话号码、卡号、2FA codes、order IDs、serials、addresses、unit numbers 或混合字母数字字符串。
- **作用**：强制模型逐字符朗读并使用分隔符，然后与用户确认，并在纠正后重新确认。可选地为字母使用音标消歧（例如 “A as in Alpha”）。

#### 示例（通用指令章节）

```
# Instructions/Rules
- When reading numbers or codes, speak each character separately, separated by hyphens (e.g., 4-1-5).
- Repeat EXACTLY the provided number; do not omit any digits.
```

_提示：如果你在遵循 conversation flow prompting strategy，可以指定哪个 conversation state 需要应用 alpha-numeric pronunciations 指令。_

#### 示例（conversation state 中的指令）

_（取自 [openai-realtime-agents](https://github.com/openai/openai-realtime-agents/blob/main/src/app/agentConfigs/customerServiceRetail/authentication.ts) prompt 的 conversation flow）_

```txt
{
    "id": "3_get_and_verify_phone",
    "description": "Request phone number and verify by repeating it back.",
    "instructions": [
      "Politely request the user’s phone number.",
      "Once provided, confirm it by repeating each digit and ask if it’s correct.",
      "If the user corrects you, confirm AGAIN to make sure you understand.",
    ],
    "examples": [
      "I'll need some more information to access your account if that's okay. May I have your phone number, please?",
      "You said 0-2-1-5-5-5-1-2-3-4, correct?",
      "You said 4-5-6-7-8-9-0-1-2-3, correct?"
    ],
    "transitions": [{
      "next_step": "4_authentication_DOB",
      "condition": "Once phone number is confirmed"
    }]
}
```

这些是在使用 `gpt-realtime-1.5` 应用指令**之前**的响应。

> Sure! The number is 55119765423. Let me know if you need anything else!

这些是在使用 `gpt-realtime-1.5` 应用指令**之后**的响应。

> Sure! The number is: 5-5-1-1-1-9-7-6-5-4-2-3. Please let me know if you need anything else!

## Instructions

本节涵盖 prompt 指导，用于指示模型解决任务、应用最佳实践，并修复可能的问题。

或许并不令人意外，我们推荐与 [GPT-4.1 for best results](https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide) 类似的 prompting 模式。

### 指令遵循

与 GPT-4.1 和 GPT-5 一样，如果指令相互冲突、有歧义或不清晰，`gpt-realtime-1.5` 表现会更差。

- **何时使用**：输出偏离规则、跳过阶段或误用工具。
- **作用**：使用 LLM 在发布前指出歧义、冲突和缺失定义。

#### **Instructions Quality Prompt（可在 ChatGPT 或 API 中使用）**

使用下面的 prompt，通过 GPT-5 识别你可以修复的 prompt 问题区域。

```
## Role & Objective
You are a **Prompt-Critique Expert**.
Examine a user-supplied LLM prompt and surface any weaknesses following the instructions below.


## Instructions
Review the prompt that is meant for an LLM to follow and identify the following issues:
- Ambiguity: Could any wording be interpreted in more than one way?
- Lacking Definitions: Are there any class labels, terms, or concepts that are not defined that might be misinterpreted by an LLM?
- Conflicting, missing, or vague instructions: Are directions incomplete or contradictory?
- Unstated assumptions: Does the prompt assume the model has to be able to do something that is not explicitly stated?


## Do **NOT** list issues of the following types:
- Invent new instructions, tool calls, or external information. You do not know what tools need to be added that are missing.
- Issues that you are unsure about.


## Output Format
"""
# Issues
- Numbered list; include brief quote snippets.

# Improvements
- Numbered list; provide the revised lines you would change and how you would change them.

# Revised Prompt
- Revised prompt where you have applied all your improvements surgically with minimal edits to the original prompt
"""
```

#### **Prompt Optimization Meta Prompt（可在 ChatGPT 或 API 中使用）**

这个 meta-prompt 可帮助你围绕特定失败模式改进基础 system prompt。提供当前 prompt 并描述你看到的问题后，模型（GPT-5）会建议更精炼的变体，以收紧约束并减少问题。

```
Here's my current prompt to an LLM:
[BEGIN OF CURRENT PROMPT]
{CURRENT_PROMPT}
[END OF CURRENT PROMPT]

But I see this issue happening from the LLM:
[BEGIN OF ISSUE]
{ISSUE}
[END OF ISSUE]
Can you provide some variants of the prompt so that the model can better understand the constraints to alleviate the issue?
```

### 无音频或不清晰音频

有时模型以为自己听到了什么并尝试回应。你可以添加自定义指令，告诉模型在听到不清晰音频或用户输入时如何表现。请根据你的用例修改期望行为。例如，你可能希望模型重复同一个问题，而不是请求澄清。

- **何时使用**：背景噪声、部分词语或静音触发了不需要的回复。
- **作用**：阻止虚假响应，并创建优雅澄清。
- **如何改编**：根据用例选择请求澄清还是重复上一个问题。

#### 示例（咳嗽和不清晰音频）

```
# Instructions/Rules
...


## Unclear audio
- Always respond in the same language the user is speaking in, if unintelligible.
- Only respond to clear audio or text.
- If the user's audio is not clear (e.g. ambiguous input/background noise/silent/unintelligible) or if you did not fully hear or understand the user, ask for clarification using {preferred_language} phrases.
```

这些是在使用 `gpt-realtime-1.5` 应用指令**之后**的响应。

<div className="my-6">
  </div>

在这个示例中，模型在我的（非常）大声咳嗽和不清晰音频之后请求澄清。

### 背景音乐或声音

有时，模型可能会在语音生成期间产生意外的背景音乐、哼唱、节奏噪声或类似声音的 artifacts。这些 artifacts 可能降低清晰度、分散用户注意力，或让 assistant 显得不够专业。以下指令有助于防止或显著减少这些情况。

- **何时使用**：当你观察到 Realtime 音频响应中出现意外音乐元素或音效时使用。
- **作用**：引导模型避免生成这些不需要的音频 artifacts。
- **如何改编**：调整指令，尝试显式抑制你遇到的特定声音模式。

#### 示例

```
# Instructions/Rules
...
- Do not include any sound effects or onomatopoeic expressions in your responses.
```

## Tools

使用本节告诉模型如何使用你的函数和工具。明确说明何时调用工具、何时不调用、要收集哪些 arguments、调用运行时说什么，以及如何处理错误或部分结果。

### 工具选择

`gpt-realtime-1.5` 会严格遵循指令。不过，如果你的指令与模型可访问内容冲突，例如在 prompt 中提到但没有传入 tools list 的工具，可能会导致糟糕响应。

- **何时使用**：Prompts 提到实际上不可用的工具。
- **作用**：审查可用工具和 system prompt，确保二者一致。

#### 示例

```
# Tools
## lookup_account(email_or_phone)
...


## check_outage(address)
...
```

我们需要确保相同工具可用，并且**描述之间不相互矛盾**：

```json
[
{
    "name": "lookup_account",
    "description": "Retrieve a customer account using either an email or phone number to enable verification and account-specific actions.",
    "parameters": {
      ...
  },
{
    "name": "check_outage",
    "description": "Check for network outages affecting a given service address and return status and ETA if applicable.",
    "parameters": {
      ...
  }
]
```

### Tool call preambles

某些用例可以从 Realtime 模型在调用工具的同时提供音频响应中受益。这会带来更好的用户体验，掩盖延迟。你可以修改示例短语以适配自己的用例。

- **何时使用**：用户需要在工具调用同时获得即时确认；有助于掩盖延迟。
- **作用**：在工具调用前添加简短、一致的 preamble。

#### 示例

```
# Tools
- Before any tool call, say one short line like “I’m checking that now.” Then call the tool immediately.
```

这些是在使用 `gpt-realtime-1.5` 应用指令后的响应。

![tool proactive](https://developers.openai.com/cookbook/assets/images/tool_proactive.png)

使用该指令后，模型会在工具调用的同时输出音频响应 "I'm checking that right now"。

#### Tool call preambles + 示例短语

如果你想更细致地控制模型在调用工具同时输出什么类型短语，可以在工具 spec description 中添加示例短语。

#### 示例

```python
tools = [
  {
    "name": "lookup_account",
    "description": "Retrieve a customer account using either an email or phone number to enable verification and account-specific actions.

Preamble sample phrases:
- For security, I’ll pull up your account using the email on file.
- Let me look up your account by {email} now.
- I’m fetching the account linked to {phone} to verify access.
- One moment—I’m opening your account details."
    "parameters": {
      "..."
    }
  },
  {
    "name": "check_outage",
    "description": "Check for network outages affecting a given service address and return status and ETA if applicable.

Preamble sample phrases:
- I’ll check for any outages at {service_address} right now.
- Let me look up network status for your area.
- I’m checking whether there’s an active outage impacting your address.
- One sec—verifying service status and any posted ETA.",
    "parameters": {
      "..."
    }
  }
]

```

### 不经确认的工具调用

有时模型可能会在工具调用前请求确认。对于某些用例，这可能导致终端用户体验很差，因为模型不够主动。

- **何时使用**：agent 在明显的工具调用前请求许可。
- **作用**：移除不必要的确认循环。

#### 示例

```
# Tools
- When calling a tool, do not ask for any user confirmation. Be proactive
```

这些是在使用 `gpt-realtime-1.5` 应用指令**之后**的响应。

![tool no confirm](https://developers.openai.com/cookbook/assets/images/tool_no_confirm.png)

在该示例中，你会注意到 realtime 模型没有生成任何响应音频；它直接调用了相应工具。

_提示：如果你注意到模型过快跳到工具调用，尝试软化措辞。例如，将 “proactive” 这类强词换成更温和的表达，可以帮助引导模型采取更平静、不那么急切的方法。_

### 工具调用性能

随着用例变得更复杂、可用工具数量增加，显式引导模型何时使用每个工具以及同样重要的何时不使用，就变得关键。清晰的使用规则不仅能提高工具调用准确性，也能帮助模型在正确时间选择正确工具。

- **何时使用**：模型在工具调用性能上遇到困难，需要显式指令减少误用。
- **作用**：添加关于何时“use/avoid”每个工具的指令。你也可以添加工具调用序列指令（调用 Tool call A 后，可以调用 Tool call B 或 C）。

#### 示例

```
# Tools
- When you call any tools, you must output at the same time a response letting the user know that you are calling the tool.

## lookup_account(email_or_phone)
Use when: verifying identity or viewing plan/outage flags.
Do NOT use when: the user is clearly anonymous and only asks general questions.


## check_outage(address)
Use when: user reports connectivity issues or slow speeds.
Do NOT use when: question is billing-only.


## refund_credit(account_id, minutes)
Use when: confirmed outage > 240 minutes in the past 7 days.
Do NOT use when: outage is unconfirmed; route to Diagnose → check_outage first.


## schedule_technician(account_id, window)
Use when: repeated failures after reboot and outage status = false.
Do NOT use when: outage status = true (send status + ETA instead).


## escalate_to_human(account_id, reason)
Use when: user seems very frustrated, abuse/harassment, repeated failures, billing disputes >$50, or user requests escalation.
```

_提示：如果某个工具调用可能不可预测地失败，请添加清晰的失败处理指令，让模型优雅响应。_

### 工具级行为

你可以针对特定工具微调模型行为，而不是应用一个全局规则。例如，你可能希望 READ tools 被主动调用，而 WRITE tools 需要显式确认。

- **何时使用**：关于主动性、确认或 preambles 的全局指令并不适合每个工具。
- **作用**：添加 per-tool behavior rules，定义模型应立即调用工具、先确认，还是在调用前说出 preamble。

#### 示例

```
# TOOLS
- For the tools marked PROACTIVE: do not ask for confirmation from the user and do not output a preamble.
- For the tools marked as CONFIRMATION FIRST: always ask for confirmation to the user.
- For the tools marked as PREAMBLES: Before any tool call, say one short line like “I’m checking that now.” Then call the tool immediately.


## lookup_account(email_or_phone) — PROACTIVE
Use when: verifying identity or accessing billing.
Do NOT use when: caller refuses to identify after second request.


## check_outage(address) — PREAMBLES
Use when: caller reports failed connection or speed lower than 10 Mbps.
Do NOT use when: purely billing OR when internet speed is above 10 Mbps.
If either condition applies, inform the customer you cannot assist and hang up.


## refund_credit(account_id, minutes) — CONFIRMATION FIRST
Use when: confirmed outage > 240 minutes in the past 7 days (credit 60 minutes).
Do NOT use when: outage unconfirmed.
Confirmation phrase: “I can issue a credit for this outage—would you like me to go ahead?”


## schedule_technician(account_id, window) — CONFIRMATION FIRST
Use when: reboot + line checks fail AND outage=false.
Windows: “10am–12pm ET” or “2pm–4pm ET”.
Confirmation phrase: “I can schedule a technician to visit—should I book that for you?”


## escalate_to_human(account_id, reason) — PREAMBLES
Use when: harassment, threats, self-harm, repeated failure, billing disputes > $50, caller is frustrated, or caller requests escalation.
Preamble: “Let me connect you to a senior agent who can assist further.”
```

### 工具输出格式

某些工具输出，尤其是必须逐字重复的长字符串，对模型来说可能属于分布外内容。训练期间，工具输出通常看起来像带命名字段的 JSON objects。如果你的工具返回原始字符串，同时单独要求模型“repeat exactly”，模型可能更容易改写、截断，或混入自己的 preamble。

一个实用修复方式是让工具输出看起来像普通工具结果，并让逐字要求对机器明确。

- **何时使用：** 工具返回**长或复杂结构化内容**（多句说明、handoff packets、IDs/links、policy summaries、多步骤程序等），并且你观察到**截断、改写、字段丢失、重新排序，或模型混入自己的 preamble/commentary**。

- **作用：** 将工具输出包装在一个**小而明确的 JSON envelope** 中（例如 `response_text` 加上 `require_repeat_verbatim`、`format` 或 `content_type` 等 flags），让响应看起来更**符合分布**，且预期实现行为对机器**清晰**。

- **如何改编：** 保持 schema **最小且稳定**。在你的 **Tools instructions** 以及 **tool definition** 旁边清楚记录预期工具输出形态（例如，“If `require_repeat_verbatim` is true, output exactly `response_text` and nothing else”，或 “Render `response_text` as-is; do not add, omit, or reorder fields from the tool output.”）。

#### 示例

#### 示例：raw string（更容易出错）

工具返回：

```python
I just sent you an email with the verification link. Please open it and click “Confirm”.
```

模型有时会说：

- “I’ve emailed you a verification link…”（改写）

- 丢掉最后一句（截断）

- 添加额外 commentary（“Can I help with anything else?”）

#### 示例：wrapped JSON（更符合分布、更可靠）

工具返回：

```json
{
  "response_text": "I just sent you an email with the verification link. Please open it and click “Confirm”.",
  "require_repeat_verbatim": true
}
```

因为这看起来像典型工具结果（JSON object），模型通常更容易：

- 识别“权威”内容是什么（response_text）

- 理解实现约束（require_repeat_verbatim）

- 干净地复现工具输出，不截断也不添加额外 commentary

### Rephrase Supervisor Tool（Responder-Thinker 架构）

在许多语音设置中，realtime 模型充当 responder（对用户说话），而更强的文本模型充当 thinker（做规划、政策查询、SOP 完成）。文本回复不会自动适合语音，因此 responder 必须在生成音频前，把 thinker 的文本改写为 audio-friendly response。

- **何时使用**：responder 收到 thinker response 后，口头输出听起来机械、太长或别扭。
- **作用**：添加清晰指令，引导 responder 将 thinker 文本改写为简短、自然、speech-first 的回复。
- **如何改编**：调整措辞风格、开头语和简洁度限制，使其匹配你的用例预期。

#### 示例

```
# Tools
## Supervisor Tool
Name: getNextResponseFromSupervisor(relevantContextFromLastUserMessage: string)


When to call:
- Any request outside the allow list.
- Any factual, policy, account, or process question.
- Any action that might require internal lookups or system changes.


When not to call:
- Simple greetings and basic chitchat.
- Requests to repeat or clarify.
- Collecting parameters for later Supervisor use:
  - phone_number for account help (getUserAccountInfo)
  - zip_code for store lookup (findNearestStore)
  - topic or keyword for policy lookup (lookupPolicyDocument)


Usage rules and preamble:
1) Say a neutral filler phrase to the user, then immediately call the tool. Approved fillers: “One moment.”, “Let me check.”, “Just a second.”, “Give me a moment.”, “Let me see.”, “Let me look into that.” Fillers must not imply success or failure.
2) Do not mention the “Supervisor” when responding with filler phrase.
3) relevantContextFromLastUserMessage is a one-line summary of the latest user message; use an empty string if nothing salient.
4) After the tool returns, apply Rephrase Supervisor and send your reply.


### Rephrase Supervisor
- Start with a brief conversational opener using active language, then flow into the answer (for example: “Thanks for waiting—”, “Just finished checking that.”, “I’ve got that pulled up now.”).
- Keep it short: no more than 2 sentences.
- Use this template: opener + one-sentence gist + up to 3 key details + a quick confirmation or choice (for example: “Does that match what you expected?”, “Want me to review options?”).
- Read numbers for speech: money naturally (“$45.20” → “forty-five dollars and twenty cents”), phone numbers 3-3-4, addresses with individual digits, dates/times plainly (“August twelfth”, “three-thirty p.m.”).
```

下面是没有改写指令的示例：

> Assistant: Your current credit card balance is positive at 32,323,232 AUD.

下面是带改写指令的同一示例：

> Assistant: Just finished checking that—your credit card balance is thirty-two million three hundred twenty-three thousand two hundred thirty-two dollars in your favor. Your last payment was processed on August first. Does that match what you expected?

### 常见工具

`gpt-realtime-1.5` 已经过训练，可以有效使用以下常见工具。如果你的用例需要类似行为，请让名称、签名和描述接近这些工具，以最大化可靠性并使其更符合分布。

下面是模型训练过的一些重要常见工具：

#### 示例

```
# answer(question: string)
Description: Call this when the customer asks a question that you don't have an answer to or asks to perform an action.


# escalate_to_human()
Description: Call this when a customer asks for escalation, or to talk to someone else, or expresses dissatisfaction with the call.


# finish_session()
Description: Call this when a customer says they're done with the session or doesn't want to continue. If it's ambiguous, confirm with the customer before calling.
```

## Conversation Flow

本节说明如何将对话结构化为清晰、目标驱动的阶段，让模型确切知道每一步该做什么。它定义每个阶段的目的、推进阶段的指令，以及转到下一阶段的具体“exit criteria”。这可以防止模型停滞、跳过步骤或提前跳转，并确保对话从问候到解决都保持有组织。

同样，通过将 prompt 组织成各种 conversation states，你也更容易识别错误模式并更有效地迭代。

- **何时使用**：如果对话感觉混乱、在达到目标前停滞，或模型难以有效完成目标。
- **作用**：将交互拆分为带有清晰目标、指令和 exit criteria 的阶段。
- **如何改编**：重命名阶段以匹配你的工作流；修改每个阶段的指令以遵循预期行为；让 “Exit when” 具体且最小化。

#### 示例

```
# Conversation Flow
## 1) Greeting
Goal: Set tone and invite the reason for calling.
How to respond:
- Identify as NorthLoop Internet Support.
- Keep the opener brief and invite the caller’s goal.
- Confirm that customer is a Northloop customer
Exit to Discovery: Caller states they are a Northloop customer and mentions an initial goal or symptom.


## 2) Discover
Goal: Classify the issue and capture minimal details.
How to respond:
- Determine billing vs connectivity with one targeted question.
- For connectivity: collect the service address.
- For billing/account: collect email or phone used on the account.
Exit when: Intent and address (for connectivity) or email/phone (for billing) are known.


## 3) Verify
Goal: Confirm identity and retrieve the account.
How to respond:
- Once you have email or phone, call lookup_account(email_or_phone).
- If lookup fails, try the alternate identifier once; otherwise proceed with general guidance or offer escalation if account actions are required.
Exit when: Account ID is returned.


## 4) Diagnose
Goal: Decide outage vs local issue.
How to respond:
- For connectivity, call check_outage(address).
- If outage=true, skip local steps; move to Resolve with outage context.
- If outage=false, guide a short reboot/cabling check; confirm each step’s result before continuing.
Exit when: Root cause known.


## 5) Resolve
Goal: Apply fix, credit, or appointment.
How to respond:
- If confirmed outage > 240 minutes in the last 7 days, call refund_credit(account_id, 60).
- If outage=false and issue persists after basic checks, offer “10am–12pm ET” or “2pm–4pm ET” and call schedule_technician(account_id, chosen window).
- If the local fix worked, state the result and next steps briefly.
Exit when: A fix/credit/appointment has been applied and acknowledged by the caller.


## 6) Confirm/Close
Goal: Confirm outcome and end cleanly.
How to respond:
- Restate the result and any next step (e.g., stabilization window or tech ETA).
- Invite final questions; close politely if none.
Exit when: Caller declines more help.
```

### Sample Phrases

Sample phrases 可作为模型的“anchor examples”。它们展示你希望模型遵循的风格、简洁度和语气，但不会把模型锁定到一种僵硬回答。

- **何时使用**：响应缺少品牌风格或不够一致。
- **作用**：提供模型可变化使用的示例短语，以保持自然且简短。
- **如何改编**：替换为符合品牌的示例；保留“do not always use”警告。

#### 示例

```
# Sample Phrases
- Below are sample examples that you should use for inspiration. DO NOT ALWAYS USE THESE EXAMPLES, VARY YOUR RESPONSES.

Acknowledgements: “On it.” “One moment.” “Good question.”
Clarifiers: “Do you want A or B?” “What’s the deadline?”
Bridges: “Here’s the quick plan.” “Let’s keep it simple.”
Empathy (brief): “That’s frustrating—let’s fix it.”
Closers: “Anything else before we wrap?” “Happy to help next time.”
```

_注意：如果你的语音系统最终一直只重复 sample phrases，导致更机械的语音体验，请尝试添加 Variety 约束。我们见过这能修复该问题。_

### Conversation flow + Sample Phrases

在不同 conversation flow states 中添加 sample phrases 是一个有用模式，可以教模型什么是好响应：

#### 示例

```
# Conversation Flow
## 1) Greeting
Goal: Set tone and invite the reason for calling.
How to respond:
- Identify as NorthLoop Internet Support.
- Keep the opener brief and invite the caller’s goal.
Sample phrases (do not always repeat the same phrases, vary your responses):
- “Thanks for calling NorthLoop Internet—how can I help today?”
- “You’ve reached NorthLoop Support. What’s going on with your service?”
- “Hi there—tell me what you’d like help with.”
Exit when: Caller states an initial goal or symptom.


## 2) Discover
Goal: Classify the issue and capture minimal details.
How to respond:
- Determine billing vs connectivity with one targeted question.
- For connectivity: collect the service address.
- For billing/account: collect email or phone used on the account.
Sample phrases (do not always repeat the same phrases, vary your responses):
- “Is this about your bill or your internet speed?”
- “What address are you using for the connection?”
- “What’s the email or phone number on the account?”
Exit when: Intent and address (for connectivity) or email/phone (for billing) are known.


## 3) Verify
Goal: Confirm identity and retrieve the account.
How to respond:
- Once you have email or phone, call lookup_account(email_or_phone).
- If lookup fails, try the alternate identifier once; otherwise proceed with general guidance or offer escalation if account actions are required.
Sample phrases:
- “Thanks—looking up your account now.”
- “If that doesn’t pull up, what’s the other contact—email or phone?”
- “Found your account. I’ll take care of this.”
Exit when: Account ID is returned.


## 4) Diagnose
Goal: Decide outage vs local issue.
How to respond:
- For connectivity, call check_outage(address).
- If outage=true, skip local steps; move to Resolve with outage context.
- If outage=false, guide a short reboot/cabling check; confirm each step’s result before continuing.
Sample phrases (do not always repeat the same phrases, vary your responses):
- “I’m running a quick outage check for your area.”
- “No outage reported—let’s try a fast modem reboot.”
- “Please confirm the modem lights: is the internet light solid or blinking?”
Exit when: Root cause known.


## 5) Resolve
Goal: Apply fix, credit, or appointment.
How to respond:
- If confirmed outage > 240 minutes in the last 7 days, call refund_credit(account_id, 60).
- If outage=false and issue persists after basic checks, offer “10am–12pm ET” or “2pm–4pm ET” and call schedule_technician(account_id, chosen window).
- If the local fix worked, state the result and next steps briefly.
Sample phrases (do not always repeat the same phrases, vary your responses):
- “There’s been an extended outage—adding a 60-minute bill credit now.”
- “No outage—let’s book a technician. I can do 10am–12pm ET or 2pm–4pm ET.”
- “Credit applied—you’ll see it on your next bill.”
Exit when: A fix/credit/appointment has been applied and acknowledged by the caller.


## 6) Confirm/Close
Goal: Confirm outcome and end cleanly.
How to respond:
- Restate the result and any next step (e.g., stabilization window or tech ETA).
- Invite final questions; close politely if none.
Sample phrases (do not always repeat the same phrases, vary your responses):
- “We’re all set: [credit applied / appointment booked / service restored].”
- “You should see stable speeds within a few minutes.”
- “Your technician window is 10am–12pm ET.”
Exit when: Caller declines more help.

```

### 高级 Conversation Flow

随着用例变得更复杂，你需要一种既可扩展又能保持模型有效的结构。关键是在可维护性与简单性之间取得平衡：太多僵硬状态可能让模型过载，损害性能，并让对话感觉机械。

更好的方法是设计能够降低模型感知复杂度的 flows。通过以结构化但灵活的方式处理状态，你可以让模型更容易保持专注和响应性，从而改善用户体验。

管理复杂场景的两种常见模式是：

1. Conversation Flow as State Machine
2. Dynamic Conversation Flow via session.updates

#### Conversation Flow as State Machine

将对话定义为编码 states 和 transitions 的 JSON 结构。这样便于推理覆盖范围、识别边缘情况，并随时间追踪变更。由于它以代码形式存储，你可以在 flow 演进时对它进行版本管理、diff 和扩展。State machine 还让你能精细控制对话究竟如何以及何时从一种状态转到另一种状态。

#### 示例

```json
# Conversation States
[
  {
    "id": "1_greeting",
    "description": "Begin each conversation with a warm, friendly greeting, identifying the service and offering help.",
    "instructions": [
        "Use the company name 'Snowy Peak Boards' and provide a warm welcome.",
        "Let them know upfront that for any account-specific assistance, you’ll need some verification details."
    ],
    "examples": [
      "Hello, this is Snowy Peak Boards. Thanks for reaching out! How can I help you today?"
    ],
    "transitions": [{
      "next_step": "2_get_first_name",
      "condition": "Once greeting is complete."
    }, {
      "next_step": "3_get_and_verify_phone",
      "condition": "If the user provides their first name."
    }]
  },
  {
    "id": "2_get_first_name",
    "description": "Ask for the user’s name (first name only).",
    "instructions": [
      "Politely ask, 'Who do I have the pleasure of speaking with?'",
      "Do NOT verify or spell back the name; just accept it."
    ],
    "examples": [
      "Who do I have the pleasure of speaking with?"
    ],
    "transitions": [{
      "next_step": "3_get_and_verify_phone",
      "condition": "Once name is obtained, OR name is already provided."
    }]
  },
  {
    "id": "3_get_and_verify_phone",
    "description": "Request phone number and verify by repeating it back.",
    "instructions": [
      "Politely request the user’s phone number.",
      "Once provided, confirm it by repeating each digit and ask if it’s correct.",
      "If the user corrects you, confirm AGAIN to make sure you understand.",
    ],
    "examples": [
      "I'll need some more information to access your account if that's okay. May I have your phone number, please?",
      "You said 0-2-1-5-5-5-1-2-3-4, correct?",
      "You said 4-5-6-7-8-9-0-1-2-3, correct?"
    ],
    "transitions": [{
      "next_step": "4_authentication_DOB",
      "condition": "Once phone number is confirmed"
    }]
  },
...
```

#### Dynamic Conversation Flow

在这种模式中，对话会根据当前状态实时更新 system prompt 和 tool list。你不会一次性把所有可能规则和工具暴露给模型，而是只提供当前对话阶段相关的内容。

当某个 state 的结束条件满足时，你使用 session.update 转换状态，将 prompt 和 tools 替换为下一阶段需要的内容。

这种方法降低模型认知负担，让它更容易处理复杂任务，而不会被不必要上下文分散注意力。

#### 示例

```python
from typing import Dict, List, Literal

State = Literal["verify", "resolve"]

# Allowed transitions
TRANSITIONS: Dict[State, List[State]] = {
    "verify": ["resolve"],
    "resolve": []  # terminal
}

def build_state_change_tool(current: State) -> dict:
    allowed = TRANSITIONS[current]
    readable = ", ".join(allowed) if allowed else "no further states (terminal)"
    return {
        "type": "function",
        "name": "set_conversation_state",
        "description": (
            f"Switch the conversation phase. Current: '{current}'. "
            f"You may switch only to: {readable}. "
            "Call this AFTER exit criteria are satisfied."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "next_state": {"type": "string", "enum": allowed}
            },
            "required": ["next_state"]
        }
    }

# Minimal business tools per state
TOOLS_BY_STATE: Dict[State, List[dict]] = {
    "verify": [{
        "type": "function",
        "name": "lookup_account",
        "description": "Fetch account by email or phone.",
        "parameters": {
            "type": "object",
            "properties": {"email_or_phone": {"type": "string"}},
            "required": ["email_or_phone"]
        }
    }],
    "resolve": [{
        "type": "function",
        "name": "schedule_technician",
        "description": "Book a technician visit.",
        "parameters": {
            "type": "object",
            "properties": {
                "account_id": {"type": "string"},
                "window": {"type": "string", "enum": ["10-12 ET", "14-16 ET"]}
            },
            "required": ["account_id", "window"]
        }
    }]
}

# Short, phase-specific instructions
INSTRUCTIONS_BY_STATE: Dict[State, str] = {
    "verify": (
        "# Role & Objective\n"
        "Verify identity to access the account.\n\n"
        "# Conversation (Verify)\n"
        "- Ask for the email or phone on the account.\n"
        "- Read back digits one-by-one (e.g., '4-1-5… Is that correct?').\n"
        "Exit when: Account ID is returned.\n"
        "When exit is satisfied: call set_conversation_state(next_state=\"resolve\")."
    ),
    "resolve": (
        "# Role & Objective\n"
        "Apply a fix by booking a technician.\n\n"
        "# Conversation (Resolve)\n"
        "- Offer two windows: '10–12 ET' or '2–4 ET'.\n"
        "- Book the chosen window.\n"
        "Exit when: Appointment is confirmed.\n"
        "When exit is satisfied: end the call politely."
    )
}

def build_session_update(state: State) -> dict:
    """Return the JSON payload for a Realtime `session.update` event."""
    return {
        "type": "session.update",
        "session": {
            "instructions": INSTRUCTIONS_BY_STATE[state],
            "tools": TOOLS_BY_STATE[state] + [build_state_change_tool(state)]
        }
    }
```

## Safety & Escalation

对于 Realtime voice agents，拥有可靠升级到人工的方式通常很重要。在本节中，你应根据自己的用例修改关于何时升级的指令。

- **何时使用**：模型难以判断何时应正确升级到人工或 fallback system。
- **作用**：定义快速、可靠的升级以及应说什么。
- **如何改编**：插入你自己的阈值以及模型必须说的话。

#### 示例

```
# Safety & Escalation
When to escalate (no extra troubleshooting):
- Safety risk (self-harm, threats, harassment)
- User explicitly asks for a human
- Severe dissatisfaction (e.g., “extremely frustrated,” repeated complaints, profanity)
- **2** failed tool attempts on the same task **or** **3** consecutive no-match/no-input events
- Out-of-scope or restricted (e.g., real-time news, financial/legal/medical advice)

What to say at the same time as calling the escalate_to_human tool (MANDATORY):
- “Thanks for your patience—I’m connecting you with a specialist now.”
- Then call the tool: `escalate_to_human`

Examples that would require escalation:
- “This is the third time the reset didn’t work. Just get me a person.”
- “I am extremely frustrated!”
```

第一个示例展示了使用该指令时 `gpt-4o-realtime-preview-2025-06-03` 的对话响应。

![escalate 06](https://developers.openai.com/cookbook/assets/images/escalate_06.png)

第二个示例展示了使用该指令时 `gpt-realtime-1.5` 的对话响应。

![escalate 07](https://developers.openai.com/cookbook/assets/images/escalate_07.png)

`gpt-realtime-1.5` 能够更可靠地遵循指令并升级到人工。

  </div>



## 后续步骤

- 查看较早的 [Realtime prompting guide](https://developers.openai.com/cookbook/examples/realtime_prompting_guide)，了解更多 `gpt-realtime-1.5` 示例。
- 查看 [Realtime eval guide](https://developers.openai.com/cookbook/examples/realtime_eval_guide)，测试代表性的 voice-agent 行为。
- 了解如何通过 [WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)、[WebSocket](https://developers.openai.com/api/docs/guides/realtime-websocket) 或 [SIP](https://developers.openai.com/api/docs/guides/realtime-sip) 连接。
- 了解 [Realtime conversation lifecycle](https://developers.openai.com/api/docs/guides/realtime-conversations)。
- 查看 [Realtime costs](https://developers.openai.com/api/docs/guides/realtime-costs)。
