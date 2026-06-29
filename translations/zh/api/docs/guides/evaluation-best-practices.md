---
status: needs-review
sourceId: "693a016bd7e9"
sourceChecksum: "693a016bd7e98161ccc911ddf27bec2480bf3a54fa805f1ec2e70d29835b1939"
sourceUrl: "https://developers.openai.com/api/docs/guides/evaluation-best-practices"
translatedAt: "2026-06-27T17:29:03.6672446+08:00"
translator: codex-gpt-5.5-xhigh
---

# Evaluation best practices 评估最佳实践

生成式 AI 具有可变性。模型有时会对相同输入产生不同输出，这使传统软件测试方法不足以应对 AI 架构。Evaluations（**evals**）是一种在这种可变性存在时测试 AI 系统的方式。

本指南提供设计 evals 的高层指导。要开始使用 [Evals API](https://developers.openai.com/api/docs/api-reference/evals)，请参阅[评估模型性能](https://developers.openai.com/api/docs/guides/evals)。

OpenAI 正在弃用 Evals platform。现有 evals 内容会在过渡窗口期间继续可用。对于现有用户，Evals 将在 2026 年 10 月 31 日变为只读，并计划在 2026 年 11 月 30 日关闭该平台。有关当前时间线，请参阅 [deprecations page](https://developers.openai.com/api/docs/deprecations#2026-06-03-evals-platform)。

## 什么是 evals？

Evals 是用于衡量模型性能的结构化测试。尽管 AI 系统具有非确定性，它们也能帮助确保准确性、性能和可靠性。它们也是少数能够_改进_基于 LLM 的应用性能的方法之一（通过 [fine-tuning](https://developers.openai.com/api/docs/guides/model-optimization)）。

### Evals 的类型

当你看到 “evals” 这个词时，它可能指代几种东西：

- 用于孤立比较模型的行业 benchmark，例如 [MMLU](https://github.com/openai/evals/blob/main/examples/mmlu.ipynb)，以及 [HuggingFace's leaderboard](https://huggingface.co/collections/open-llm-leaderboard/the-big-benchmarks-collection-64faca6335a7fc7d4ffe974a) 上列出的 benchmark
- 标准数值分数，例如 [ROUGE](https://aclanthology.org/W04-1013/)、[BERTScore](https://arxiv.org/abs/1904.09675)，你可以在为自己的用例设计 evals 时使用
- 你为了衡量 LLM 应用性能而实现的具体测试

本指南讨论第三种类型：设计你自己的 evals。

### 如何阅读 evals

你经常会看到 0 到 1 之间的 eval 数值分数。但 evals 不只是分数。请将指标与人的判断结合起来，确保你回答的是正确的问题。

**Evals tips**
<br/>
- 采用 eval-driven development：尽早且经常评估。在每个阶段编写范围明确的测试。
- 设计 task-specific evals：让测试反映真实世界分布中的模型能力。
- 记录一切：开发过程中进行日志记录，这样你就可以从日志中挖掘好的 eval case。
- 尽可能自动化：以允许自动评分的方式组织评估。
- 这是一个过程，而不是终点：Evaluation 是一个持续过程。
- 维持一致性：使用人工反馈校准自动评分。

**Anti-patterns**

<br/>
- 过于通用的指标：只依赖 perplexity 或 BLEU score 等学术指标。
- 有偏设计：创建不能忠实复现生产流量模式的 eval dataset。
- 凭感觉的 evals：把“看起来能工作”作为评估策略，或等到上线前才开始实现任何 evals。
- 忽视人工反馈：没有用 human evals 校准你的自动化指标。

## 设计你的 eval 流程

一个 eval workflow 有几个重要组成部分：

1. **定义 eval objective**。eval 的 success criteria 是什么？
1. **收集 dataset**。哪些数据能帮助你围绕目标进行评估？考虑 synthetic eval data、domain-specific eval data、purchased eval data、human-curated eval data、production data 和 historical data。
1. **定义 eval metrics**。你将如何检查是否满足 success criteria？
1. **运行并比较 evals**。为你的任务或系统迭代并改进模型性能。
1. **持续评估**。设置 continuous evaluation (CE)，在每次变更时运行 evals，监控应用以发现新的非确定性案例，并随时间扩大 eval set。

我们来看几个示例。

### 示例：总结 transcript

要测试基于 LLM 的应用总结 transcript 的能力，你的 eval 设计可能是：

1. **定义 eval objective**<br/>
   模型应该能够在相关性和准确性上与 reference summary 竞争。
1. **收集 dataset**<br/>
   混合使用 production data（从用户对生成 summary 的反馈中收集）和由 domain expert（writer）创建的 dataset，以确定什么是“好”的 summary。
1. **定义 eval metrics**<br/>
   在一个留出的 1000 个 reference transcript -> summary 集合上，implementation 应达到至少 0.40 的 ROUGE-L score，并使用 G-Eval 达到至少 80% 的 coherence score。
1. **运行并比较 evals**<br/>
   使用 [Evals API](https://developers.openai.com/api/docs/guides/evals) 在 OpenAI dashboard 中创建并运行 evals。
1. **持续评估**<br/>
   设置 continuous evaluation (CE)，在每次变更时运行 evals，监控应用以发现新的非确定性案例，并随时间扩大 eval set。

LLM 更擅长在选项之间进行区分。因此，评估应聚焦于成对比较、分类，或按特定标准评分等任务，而不是开放式生成。让评估方法与 LLM 在比较方面的优势保持一致，会让对 LLM 输出或模型比较的评估更可靠。

### 示例：基于 docs 的 Q&A

要测试基于 LLM 的应用围绕 docs 做 Q&A 的能力，你的 eval 设计可能是：

1. **定义 eval objective**<br/>
   模型应该能够提供精确答案，在需要时回忆上下文以推理用户 prompt，并给出满足用户需求的答案。
1. **收集 dataset**<br/>
   混合使用 production data（从用户对问题答案的满意度中收集）、由 domain expert 创建的问题的硬编码正确答案，以及 logs 中的 historical data。
1. **定义 eval metrics**<br/>
   Context recall 至少 0.85，context precision 超过 0.7，并且获得正面评分的答案达到 70+%。
1. **运行并比较 evals**<br/>
   使用 [Evals API](https://developers.openai.com/api/docs/guides/evals) 在 OpenAI dashboard 中创建并运行 evals。
1. **持续评估**<br/>
   设置 continuous evaluation (CE)，在每次变更时运行 evals，监控应用以发现新的非确定性案例，并随时间扩大 eval set。

创建 eval dataset 时，[`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 对收集 eval example 和 edge case 很有用。可考虑使用它帮助你在各种场景下生成多样化的 test data。确保 test data 包含典型 case、edge case 和 adversarial case。请使用人工专家标注者。

## 识别哪里需要 evals

当你从简单架构转向更复杂架构时，复杂性会增加。以下是四种常见架构模式：

- [Single-turn model interactions](#single-turn-model-interactions)
- [Workflows](#workflow-architectures)
- [Single-agent](#single-agent-architectures)
- [Multi-agent](#multi-agent-architectures)

阅读下面每种架构，识别非确定性进入系统的位置。那就是你需要实现 evals 的地方。

### Single-turn model interactions

在这种架构中，用户向模型提供输入，模型处理这些输入（以及任何提供的 developer prompt），生成相应输出。

#### 示例

举例来说，考虑一个在线零售场景。你的 system prompt 指示模型将**客户的问题分类**为以下之一：

- `order_status`
- `return_policy`
- `technical_issue`
- `cancel_order`
- `other`

为了确保一致且高效的用户体验，模型应该**只返回与用户意图匹配的标签**。假设客户问：“What's the status of my order?”

<table>
  <tr>
    <th>引入的非确定性</th>
    <th>对应的评估区域</th>
    <th>示例 eval questions</th>
  </tr>
  <tr>
    <td>developer 和 user 提供的输入</td>
    <td>
      **Instruction following**：模型是否准确理解并按照所提供的指令行动？
      <br />
      <br />
      **Instruction following**：模型是否会优先遵循 system prompt，而不是冲突的 user prompt？
    </td>
    <td>
      模型是否持续专注于 triage task，还是会被用户的问题带偏？
    </td>
  </tr>
  <tr>
    <td>模型生成的输出</td>
    <td>
      **Functional correctness**：模型输出是否准确、相关且足够完整，能够完成预期任务或目标？
    </td>
    <td>
      模型对意图的判断是否正确匹配预期意图？
    </td>
  </tr>
</table>

### Workflow architectures

当你尝试解决更复杂的问题时，可能会从 single-turn model interaction 转向把多个模型调用串联起来的 multistep workflow。Workflow 不会引入新的非确定性元素，但它们包含多个底层模型交互，你可以分别评估这些交互。

#### 示例

沿用前面的例子，客户询问自己的订单状态。Workflow architecture 会 triage 客户请求，并通过逐步流程路由：

1. 提取 Order ID
1. 查询订单详情
1. 将订单详情提供给模型以生成最终 response

此 workflow 中的每一步都有自己的 system prompt，模型必须遵循，并将所有获取到的数据放入友好的输出中。

<table>
  <tr>
    <th>引入的非确定性</th>
    <th>对应的评估区域</th>
    <th>示例 eval questions</th>
  </tr>
  <tr>
    <td>developer 和 user 提供的输入</td>
    <td>
      **Instruction following**：模型是否准确理解并按照所提供的指令行动？
      <br />
      <br />
      **Instruction following**：模型是否会优先遵循 system prompt，而不是冲突的 user prompt？
    </td>
    <td>
      模型是否持续专注于 triage task，还是会被用户的问题带偏？
      <br />
      <br /> 模型是否遵循指令，尝试提取 Order ID？
      <br />
      <br />
      最终 response 是否包含 order status、estimated arrival date 和 tracking number？
    </td>
  </tr>
  <tr>
    <td>模型生成的输出</td>
    <td>
      **Functional correctness**：模型输出是否准确、相关且足够完整，能够完成预期任务或目标？
    </td>
    <td>
      模型对意图的判断是否正确匹配预期意图？
      <br />
      <br />
      最终 response 是否具有正确的 order status、estimated arrival date 和 tracking number？
    </td>
  </tr>
</table>

### Single-agent architectures

与 workflows 不同，agent 会解决需要灵活决策的非结构化问题。agent 拥有指令和一组工具，并动态选择要使用的工具。这引入了新的非确定性机会。

工具是由 developer 定义、模型可以执行的代码块。它可以从小型 helper function 到对现有服务的 API 调用不等。例如，`check_order_status(order_id)` 可以是一个工具，它接受参数 `order_id` 并调用 API 来检查订单状态。

#### 示例

让我们改造客户服务示例，使用单个 agent。该 agent 可以访问三个不同工具：

- Order lookup tool
- Password reset tool
- Product FAQ tool

当客户询问订单状态时，agent 会动态决定是调用工具还是回复客户。例如，如果客户问 “What is my order status?”，agent 现在可以继续追问客户的 order ID。这有助于创造更自然的用户体验。

<table>
  <tr>
    <th>非确定性</th>
    <th>对应的评估区域</th>
    <th>示例 eval questions</th>
  </tr>
  <tr>
    <td>developer 和 user 提供的输入</td>
    <td>
      **Instruction following**：模型是否准确理解并按照所提供的指令行动？
      <br />
      <br />
      **Instruction following**：模型是否会优先遵循 system prompt，而不是冲突的 user prompt？
    </td>
    <td>
      模型是否持续专注于 triage task，还是会被用户的问题带偏？
      <br />
      <br />
      模型是否遵循指令，尝试提取 Order ID？
    </td>
  </tr>
  <tr>
    <td>模型生成的输出</td>
    <td>
      **Functional correctness**：模型输出是否准确、相关且足够完整，能够完成预期任务或目标？
    </td>
    <td>
      模型对意图的判断是否正确匹配预期意图？
    </td>
  </tr>
  <tr>
    <td>模型选择的工具</td>
    <td>
      **Tool selection**：测试 agent 是否能够选择正确工具来使用的 evaluations。
      <br />
      <br />
      **Data precision**：验证 agent 是否使用正确 arguments 调用工具的 evaluations。通常这些 arguments 会从 conversation history 中提取，因此目标是验证这次提取是否正确。
    </td>
    <td>
      当用户询问订单状态时，模型是否正确建议调用 order lookup tool？
      <br />
      <br />
      模型是否正确提取用户提供的 order ID 并传给 lookup tool？
    </td>
  </tr>
</table>

### Multi-agent architectures

随着你向 single-agent architecture 添加工具和任务，模型可能难以遵循指令或选择正确工具来调用。Multi-agent architectures 通过创建多个专注于不同领域的 distinct agents 来提供帮助。多个 agent 之间的 triaging 和 handoff 引入了新的非确定性机会。

是否使用 multi-agent architecture 应由你的 evals 驱动。一开始就采用 multi-agent architecture 会增加不必要的复杂性，可能减慢你的生产上线速度。

#### 示例

将 single-agent 示例拆分为 multi-agent architecture 后，我们会有四个 distinct agents：

1. Triage agent
1. Order agent
1. Account management agent
1. Sales agent

当客户询问订单状态时，triage agent 可能会将对话 hand off 给 order agent 来查询订单。如果客户改变话题，开始询问某个产品，order agent 应将控制权交还给 triage agent，后者再 hand off 给 sales agent 来获取产品信息。

<table>
  <tr>
    <th>非确定性</th>
    <th>对应的评估区域</th>
    <th>示例 eval questions</th>
  </tr>
  <tr>
    <td>developer 和 user 提供的输入</td>
    <td>**Instruction following**：模型是否准确理解并按照所提供的指令行动？<br/><br/>**Instruction following**：模型是否会优先遵循 system prompt，而不是冲突的 user prompt？</td>
    <td>模型是否持续专注于 triage task，还是会被用户的问题带偏？<br/><br/>假设 `lookup_order` 调用已返回，order agent 是否返回 tracking number 和 delivery date（不一定必须正确）？</td>
  </tr>
  <tr>
    <td>模型生成的输出</td>
    <td>**Functional correctness**：模型输出是否准确、相关且足够完整，能够完成预期任务或目标？</td>
    <td>模型对意图的判断是否正确匹配预期意图？<br/><br/>假设 `lookup_order` 调用已返回，order agent 是否在 response 中提供正确的 tracking number 和 delivery date？<br/><br/>order agent 是否遵循 system instructions，在处理退货前询问客户请求退货的原因？</td>
  </tr>
  <tr>
    <td>模型选择的工具</td>
    <td>**Tool selection**：测试 agent 是否能够选择正确工具来使用的 evaluations。<br/><br/>**Data precision**：验证 agent 是否使用正确 arguments 调用工具的 evaluations。通常这些 arguments 会从 conversation history 中提取，因此目标是验证这次提取是否正确。</td>
    <td>order agent 是否正确调用 lookup order tool？<br/><br/>order agent 是否正确调用 `refund_order` tool？<br/><br/>order agent 是否使用正确的 order ID 调用 lookup order tool？<br/><br/>account agent 是否使用正确的 account ID 正确调用 `reset_password` tool？</td>
  </tr>

  <tr>
    <td>Agent handoff</td>
    <td>**Agent handoff accuracy**：测试每个 agent 是否能恰当地识别 triaging 到另一个 agent 的决策边界的 evaluations</td>
    <td>当用户询问订单状态时，triage agent 是否正确传递给 order agent？<br/><br/>当用户改变主题，谈论最新产品时，order agent 是否把控制权交还给 triage agent？</td>
  </tr>
</table>

## 创建并组合不同类型的 evaluator

在设计自己的 evals 时，有几种具体 evaluator 类型可供选择。另一种理解方式是：你希望 evaluator 扮演什么角色。

### Metric-based evals

Quantitative evals 提供可用于筛选和排序结果的数值分数。它们为自动化回归测试提供有用 benchmark。

- **Examples**：Exact match、string match、ROUGE/BLEU scoring、function call accuracy、executable evals（执行以评估功能或行为，例如 text2sql）
- **Challenges**：可能没有针对具体用例定制，可能遗漏细微差别

### Human evals

Human judgment evals 提供最高质量，但速度慢且成本高。

- **Examples**：快速浏览系统输出，判断它们看起来更好还是更差；创建随机化、盲测测试，让员工、contractor 或外包标注机构判断系统输出质量（例如，对一小组可能输出排序，或给每个输出打 1-5 分）
- **Challenges**：人类专家之间存在分歧，成本高，速度慢
- **Recommendations**：
  - 进行多轮详细人工审核以优化 scorecard
  - 通过提供不同分数级别的示例（例如 10 分制中的 1、3 和 8 分）实施 “show rather than tell” 策略
  - 除数值分数外，还包含 pass/fail threshold
  - 汇总多位 reviewer 的一种简单方式是采用 consensus votes

### LLM-as-a-judge 和 model graders

使用模型判断输出比人工评估运行成本更低，也更容易扩展。当你需要强大的 LLM judge 时，请从 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 开始，然后在针对成本或延迟优化前，先验证它与人工标签的一致性。

- **Examples**：
  - Pairwise comparison：向 judge model 呈现两个 response，并要求它根据具体标准判断哪一个更好
  - Single answer grading：judge model 单独评估一个 response，根据预定义质量指标分配分数或评级
  - Reference-guided grading：向 judge model 提供参考答案或 “gold standard” answer，它会将其用作 benchmark 来评估给定 response
- **Challenges**：Position bias（response 顺序）、verbosity bias（偏好更长 response）
- **Recommendations**：
  - 使用 pairwise comparison 或 pass/fail 以获得更高可靠性
  - 如果可以，请使用能力最强的模型进行 grading。从 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 开始，然后验证专门的 reasoning model 是否更适合你的 rubric 或 reference-answer set
  - 控制 response length，因为 LLM 通常会偏向更长的 response
  - 加入 reasoning 和 chain-of-thought，因为先进行 reasoning 再评分会提升 eval 性能
  - 一旦 LLM judge 达到更快、更便宜，并且始终与人工注释一致的程度，就可以扩大规模
  - 在保持任务完整性的同时，组织问题以允许自动 grading；一种常见方法是将问题重新格式化为 multiple choice formats
  - 确保 eval rubrics 清晰且详细

没有任何策略是完美的。LLM-as-Judge 的质量会随问题上下文变化，而使用专家人工标注者提供 ground-truth labels 成本高且耗时。

## 处理 edge cases

虽然你的 evaluations 应覆盖每种架构的主要 happy-path 场景，真实世界 AI 系统经常遇到会挑战系统性能的 edge case。评估这些 edge cases 对确保可靠性和良好用户体验很重要。

我们看到这些 edge cases 落在几个类别中：

### 输入可变性

因为用户向模型提供输入，我们的系统必须足够灵活，能够处理用户可能交互的不同方式，例如：

- 非英语或多语言输入
- 输入文本之外的格式（例如 XML、JSON、Markdown、CSV）
- 输入 modality（例如图像）

你的 instruction following 和 functional correctness evals 需要容纳用户可能尝试的输入。

### 上下文复杂性

许多基于 LLM 的应用失败，是因为对请求上下文理解不足。这个上下文可能来自用户，也可能来自过去 conversation history 中的噪声。

示例包括：

- 单个请求中的多个问题或意图
- Typo 和拼写错误
- 上下文极少的短请求（例如用户只说：“returns”）
- 长上下文或长时间运行的对话
- 返回具有模糊 property name 的数据的 tool call（例如 `"on: 123"`，其中 "on" 是订单号）
- 多个 tool call，有时会导致 arguments 不正确
- 多次 agent handoff，有时会导致循环 handoff

### 个性化和定制

虽然 AI 通过适应用户特定请求来改善 UX，但这种灵活性会引入许多 edge case。请为你希望明确支持和阻止的用例定义 evals：

- 试图让模型做不同事情的 jailbreak attempts
- 格式化请求（例如，格式化为 JSON，或使用 bullet points）
- 用户 prompt 与 system prompt 冲突的情况

## 使用 evals 改进性能

当你的 evals 成熟到能够持续衡量性能时，请转向使用 evals data 改进应用性能。

了解更多关于 [reinforcement fine-tuning](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning) 的信息，以创建 data flywheel。

## 其他资源

如需更多灵感，请访问 [OpenAI Cookbook](https://developers.openai.com/cookbook)，其中包含示例代码以及指向第三方资源的链接；你也可以进一步了解我们的 evals 工具：

- [Evaluating model performance](https://developers.openai.com/api/docs/guides/evals)
- [How to evaluate a summarization task](https://developers.openai.com/cookbook/examples/evaluation/how_to_eval_abstractive_summarization)
- [Fine-tuning](https://developers.openai.com/api/docs/guides/model-optimization)
- [Graders](https://developers.openai.com/api/docs/guides/graders)
- [Evals API reference](https://developers.openai.com/api/docs/api-reference/evals)
