---
status: needs-review
sourceId: "5ac478f11640"
sourceChecksum: "5ac478f1164080e135035d7664c459b927b4ffc94201b2e3fd965d7e189ae0a6"
sourceUrl: "https://developers.openai.com/api/docs/guides/rft-use-cases"
translatedAt: "2026-06-27T18:24:42.5859087+08:00"
translator: codex-gpt-5.5-xhigh
---

# Reinforcement fine-tuning 使用场景

[Reinforcement fine-tuning](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)（RFT）提供了一种方式，用来提升模型在特定任务上的表现。任务必须清晰，并且答案必须可验证。

OpenAI 正在逐步结束 fine-tuning 平台。该平台已不再向新用户开放，但 fine-tuning 平台的现有用户在接下来数月内仍可创建训练作业。
  <br />
  所有 fine-tuned models 都会继续可用于推理，直到其基础模型被[弃用](https://developers.openai.com/api/docs/deprecations)。完整时间线见[此处](https://developers.openai.com/api/docs/deprecations)。

## 何时使用 reinforcement fine-tuning

Agentic workflows 的设计目标，是做出既正确又可验证的决策。RFT 可以提供显式评分标准，并使用基于代码或基于 LLM 的 grader 来衡量功能成功、事实准确性或策略合规性，从而提供帮助。

在早期用户中，已经出现了三个清晰的使用场景：

1. **把指令转化为可运行代码**：将开放式提示转换为结构化代码、配置或模板，并且这些产物必须通过确定性测试。
1. **把事实整理为干净格式**：从杂乱的非结构化文本中提取可验证事实和摘要，并返回 JSON 结构或其他基于 schema 的输出。
1. **正确应用复杂规则**：当提供的信息细微、数量大、分层或高风险时，做出精细标签或策略决策。

[准备好使用 reinforcement fine-tuning？跳转到指南 →](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)

### 1. 把指令转化为可运行代码

在这个使用场景中，模型会基于隐藏的领域约束进行推理，生成代码、查询或基础设施模板等结构化输出。输出必须满足多个正确性条件，而成功通常由确定性方式评分：产物要么可以编译、通过测试或满足显式 schema，要么不可以。

#### 为半导体设计连接验证 IP



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">使用场景</div>
    </div>
  <div data-content-switcher-pane data-value="prompt" hidden>
    <div class="hidden">Prompt</div>
    </div>
  <div data-content-switcher-pane data-value="grader" hidden>
    <div class="hidden">Grader 代码</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">结果</div>
    </div>



#### 可用于生产的 API 代码片段，可编译并通过 AST 检查



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">使用场景</div>
    </div>
  <div data-content-switcher-pane data-value="grader" hidden>
    <div class="hidden">Grader 代码</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">结果</div>
    </div>



#### 在日程管理器中正确处理冲突和重复项



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">使用场景</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">结果</div>
    </div>



### 2. 把事实整理为干净格式

这些任务通常涉及细微区分，需要清晰的分类指南。要成功定义任务，需要领域专家通过共识制定显式且分层的标注方案。如果没有一致共识，评分信号会变得嘈杂，从而削弱 RFT 的效果。

#### 分配 ICD-10 医疗编码



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">使用场景</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">结果</div>
    </div>



#### 提取摘录以支持法律主张



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">使用场景</div>
    </div>
  <div data-content-switcher-pane data-value="prompt" hidden>
    <div class="hidden">Prompt</div>
    </div>
  <div data-content-switcher-pane data-value="grader" hidden>
    <div class="hidden">Grader</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">结果</div>
    </div>



### 3. 正确应用复杂规则

这个使用场景涉及从非结构化输入中提取可验证事实或实体，并放入明确定义的 schema（例如 JSON 对象、条件代码、医疗编码、法律引用或财务指标）。

成功的提取任务通常会受益于精确、连续的评分方法，例如 span-level F1 分数、模糊文本匹配指标或数值准确性检查，用来评估提取信息与 ground truth 的一致程度。定义显式成功标准和详细评分标准。这样，模型就可以实现可靠、可重复的改进。

#### 税务分析中的专家级推理



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">使用场景</div>
    </div>
  <div data-content-switcher-pane data-value="grader" hidden>
    <div class="hidden">Grader 代码</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">结果</div>
    </div>



#### 执行细致的内容审核策略



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">使用场景</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">结果</div>
    </div>



#### 法律文档审查、比较与摘要



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">使用场景</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">结果</div>
    </div>



## Evals 是基础

**在实现 RFT 之前，我们强烈建议为你打算 fine-tune 的任务创建并运行一个 eval**。如果你打算 fine-tune 的模型得分处于可能得分的绝对最低值或绝对最高值，那么 RFT 对你没有帮助。

RFT 通过强化给定 prompt 的更好答案来工作。如果我们无法区分不同答案的质量（也就是说，如果它们都得到可能的最低分或最高分），就没有可学习的训练信号。不过，如果你的 eval 分数落在最低分和最高分之间的某个范围内，就有足够的数据可以使用。

有效的 eval 会揭示那些人类专家稳定一致、但当前前沿模型仍表现吃力的机会，从而呈现出 RFT 可以弥合的有价值差距。[开始使用 evals](https://developers.openai.com/api/docs/guides/evals)。

## 如何从 RFT 获得更好的结果

要看到 fine-tuned model 的改进，主要有两个地方需要回顾并完善：确保任务定义良好，以及让评分方案更稳健。

### 重新定义或澄清任务

好的任务会给模型公平的学习机会，并让你能够量化改进。

- **从模型偶尔已经能解决的任务开始**。RFT 会采样许多答案，保留看起来最好的答案，并推动模型朝这些答案靠近。如果模型现在从来答不对，它就无法改进。
- **确保每个答案都可评分**。grader 必须能读取一个答案，并在没有人工介入的情况下给出分数。我们支持多种 [grader 类型](https://developers.openai.com/api/docs/guides/graders)，包括自定义 Python grader 和 LLM judge。如果你无法用可用 grader 编写代码来判断答案，RFT 就不是合适工具。
- **消除对“正确”答案的疑问**。如果两个谨慎的人经常对解法有分歧，任务就太模糊。重写 prompt、添加上下文，或把任务拆成更清晰的部分，直到领域专家达成一致。
- **限制侥幸猜中**。如果任务是多选题，并且有一个明显最佳选项，模型就可能靠运气获胜。增加更多类别、要求短的开放式文本，或调整格式，让猜测付出代价。

### 强化你的 grader

清晰、稳健的评分方案对 RFT 至关重要。

- **生成平滑分数，而不是通过/失败戳记**。随着答案改进而逐渐变化的分数，能提供更好的训练信号。
- **防范 reward hacking**。当模型找到一种捷径，可以在没有真实能力的情况下获得高分时，就会发生这种情况。
- **避免偏斜数据**。如果数据集中某个标签出现频率过高，模型就会倾向于猜这个标签。平衡数据集，或提高稀有案例权重，让模型必须思考。
- **在代码不足以胜任时使用 LLM judge**。对于丰富的开放式答案，可以让一个[单独的 OpenAI 模型评分](https://developers.openai.com/api/docs/guides/graders#model-graders)你的 fine-tuned model 的答案。确保你：
  - **评估 judge**：让多个候选回答和正确答案通过你的 LLM judge，确保返回的评分稳定且与偏好一致。
  - **提供 few-shot examples**。在 prompt 中包含优秀、一般和较差的答案，以提升 grader 的有效性。

进一步了解 [grader 类型](https://developers.openai.com/api/docs/guides/graders)。

## 其他资源

如需更多灵感，请访问 [OpenAI Cookbook](https://developers.openai.com/cookbook)，其中包含示例代码和第三方资源链接；也可以进一步了解我们的模型和推理能力：

- [认识模型](https://developers.openai.com/api/docs/models)
- [Reinforcement fine-tuning 指南](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)
- [Graders](https://developers.openai.com/api/docs/guides/graders)
- [模型优化概览](https://developers.openai.com/api/docs/guides/model-optimization)
