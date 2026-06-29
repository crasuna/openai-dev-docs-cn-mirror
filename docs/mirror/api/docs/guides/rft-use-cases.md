---
title: "Reinforcement fine-tuning 使用场景"
description: "Explore best practices and practical use cases for reinforcement fine-tuning (RFT) with OpenAI models."
outline: deep
---

# Reinforcement fine-tuning 使用场景

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/rft-use-cases](https://developers.openai.com/api/docs/guides/rft-use-cases)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/rft-use-cases.md](https://developers.openai.com/api/docs/guides/rft-use-cases.md)
- 抓取时间：2026-06-27T05:54:07.893Z
- Checksum：`5ac478f1164080e135035d7664c459b927b4ffc94201b2e3fd965d7e189ae0a6`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
[Reinforcement fine-tuning](/mirror/api/docs/guides/reinforcement-fine-tuning)（RFT）提供了一种方式，用来提升模型在特定任务上的表现。任务必须清晰，并且答案必须可验证。

OpenAI 正在逐步结束 fine-tuning 平台。该平台已不再向新用户开放，但 fine-tuning 平台的现有用户在接下来数月内仍可创建训练作业。

  所有 fine-tuned models 都会继续可用于推理，直到其基础模型被[弃用](/mirror/api/docs/deprecations)。完整时间线见[此处](/mirror/api/docs/deprecations)。

## 何时使用 reinforcement fine-tuning

Agentic workflows 的设计目标，是做出既正确又可验证的决策。RFT 可以提供显式评分标准，并使用基于代码或基于 LLM 的 grader 来衡量功能成功、事实准确性或策略合规性，从而提供帮助。

在早期用户中，已经出现了三个清晰的使用场景：

1. **把指令转化为可运行代码**：将开放式提示转换为结构化代码、配置或模板，并且这些产物必须通过确定性测试。
1. **把事实整理为干净格式**：从杂乱的非结构化文本中提取可验证事实和摘要，并返回 JSON 结构或其他基于 schema 的输出。
1. **正确应用复杂规则**：当提供的信息细微、数量大、分层或高风险时，做出精细标签或策略决策。

[准备好使用 reinforcement fine-tuning？跳转到指南 →](/mirror/api/docs/guides/reinforcement-fine-tuning)

### 1. 把指令转化为可运行代码

在这个使用场景中，模型会基于隐藏的领域约束进行推理，生成代码、查询或基础设施模板等结构化输出。输出必须满足多个正确性条件，而成功通常由确定性方式评分：产物要么可以编译、通过测试或满足显式 schema，要么不可以。

#### 为半导体设计连接验证 IP




使用场景


Prompt


Grader 代码


结果




#### 可用于生产的 API 代码片段，可编译并通过 AST 检查




使用场景


Grader 代码


结果




#### 在日程管理器中正确处理冲突和重复项




使用场景


结果




### 2. 把事实整理为干净格式

这些任务通常涉及细微区分，需要清晰的分类指南。要成功定义任务，需要领域专家通过共识制定显式且分层的标注方案。如果没有一致共识，评分信号会变得嘈杂，从而削弱 RFT 的效果。

#### 分配 ICD-10 医疗编码




使用场景


结果




#### 提取摘录以支持法律主张




使用场景


Prompt


Grader


结果




### 3. 正确应用复杂规则

这个使用场景涉及从非结构化输入中提取可验证事实或实体，并放入明确定义的 schema（例如 JSON 对象、条件代码、医疗编码、法律引用或财务指标）。

成功的提取任务通常会受益于精确、连续的评分方法，例如 span-level F1 分数、模糊文本匹配指标或数值准确性检查，用来评估提取信息与 ground truth 的一致程度。定义显式成功标准和详细评分标准。这样，模型就可以实现可靠、可重复的改进。

#### 税务分析中的专家级推理




使用场景


Grader 代码


结果




#### 执行细致的内容审核策略




使用场景


结果




#### 法律文档审查、比较与摘要




使用场景


结果




## Evals 是基础

**在实现 RFT 之前，我们强烈建议为你打算 fine-tune 的任务创建并运行一个 eval**。如果你打算 fine-tune 的模型得分处于可能得分的绝对最低值或绝对最高值，那么 RFT 对你没有帮助。

RFT 通过强化给定 prompt 的更好答案来工作。如果我们无法区分不同答案的质量（也就是说，如果它们都得到可能的最低分或最高分），就没有可学习的训练信号。不过，如果你的 eval 分数落在最低分和最高分之间的某个范围内，就有足够的数据可以使用。

有效的 eval 会揭示那些人类专家稳定一致、但当前前沿模型仍表现吃力的机会，从而呈现出 RFT 可以弥合的有价值差距。[开始使用 evals](/mirror/api/docs/guides/evals)。

## 如何从 RFT 获得更好的结果

要看到 fine-tuned model 的改进，主要有两个地方需要回顾并完善：确保任务定义良好，以及让评分方案更稳健。

### 重新定义或澄清任务

好的任务会给模型公平的学习机会，并让你能够量化改进。

- **从模型偶尔已经能解决的任务开始**。RFT 会采样许多答案，保留看起来最好的答案，并推动模型朝这些答案靠近。如果模型现在从来答不对，它就无法改进。
- **确保每个答案都可评分**。grader 必须能读取一个答案，并在没有人工介入的情况下给出分数。我们支持多种 [grader 类型](/mirror/api/docs/guides/graders)，包括自定义 Python grader 和 LLM judge。如果你无法用可用 grader 编写代码来判断答案，RFT 就不是合适工具。
- **消除对“正确”答案的疑问**。如果两个谨慎的人经常对解法有分歧，任务就太模糊。重写 prompt、添加上下文，或把任务拆成更清晰的部分，直到领域专家达成一致。
- **限制侥幸猜中**。如果任务是多选题，并且有一个明显最佳选项，模型就可能靠运气获胜。增加更多类别、要求短的开放式文本，或调整格式，让猜测付出代价。

### 强化你的 grader

清晰、稳健的评分方案对 RFT 至关重要。

- **生成平滑分数，而不是通过/失败戳记**。随着答案改进而逐渐变化的分数，能提供更好的训练信号。
- **防范 reward hacking**。当模型找到一种捷径，可以在没有真实能力的情况下获得高分时，就会发生这种情况。
- **避免偏斜数据**。如果数据集中某个标签出现频率过高，模型就会倾向于猜这个标签。平衡数据集，或提高稀有案例权重，让模型必须思考。
- **在代码不足以胜任时使用 LLM judge**。对于丰富的开放式答案，可以让一个[单独的 OpenAI 模型评分](/mirror/api/docs/guides/graders#model-graders)你的 fine-tuned model 的答案。确保你：
  - **评估 judge**：让多个候选回答和正确答案通过你的 LLM judge，确保返回的评分稳定且与偏好一致。
  - **提供 few-shot examples**。在 prompt 中包含优秀、一般和较差的答案，以提升 grader 的有效性。

进一步了解 [grader 类型](/mirror/api/docs/guides/graders)。

## 其他资源

如需更多灵感，请访问 [OpenAI Cookbook](https://developers.openai.com/cookbook)，其中包含示例代码和第三方资源链接；也可以进一步了解我们的模型和推理能力：

- [认识模型](https://developers.openai.com/api/docs/models)
- [Reinforcement fine-tuning 指南](/mirror/api/docs/guides/reinforcement-fine-tuning)
- [Graders](/mirror/api/docs/guides/graders)
- [模型优化概览](/mirror/api/docs/guides/model-optimization)

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
[Reinforcement fine-tuning](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning) (RFT) provides a way to improve your model's performance at specific tasks. The task must be clear and have verifiable answers.

OpenAI is winding down the fine-tuning platform. The platform is no longer
  accessible to new users, but existing users of the fine-tuning platform will
  be able to create training jobs for the coming months.
  <br />
  All fine-tuned models will remain available for inference until their base
  models are [deprecated](https://developers.openai.com/api/docs/deprecations). The full timeline is
  [here](https://developers.openai.com/api/docs/deprecations).

## When to use reinforcement fine-tuning

Agentic workflows are designed to make decisions that are both correct and verifiable. RFT can help by providing explicit rubrics and using code‑based or LLM‑based graders to measure functional success, factual accuracy, or policy compliance.

Across early users, three clear use cases have emerged:

1. **Turn instructions into working code**: Convert open-ended prompts into structured code, configs, or templates that must pass deterministic tests.
1. **Pull facts into a clean format**: Extract verifiable facts and summaries from messy, unstructured text and return JSON-structured or other schema-based outputs.
1. **Apply complex rules correctly**: Make fine-grained label or policy decisions when the information provided is nuanced, large in quantity, hierarchical, or high-stakes.

[Ready to use reinforcement fine-tuning? Skip to the guide →](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)

### 1. Turn instructions into working code

In this use case, models reason over hidden domain constraints to produce structured outputs like code, queries, or infrastructure templates. Outputs must satisfy multiple correctness conditions, and success is usually deterministically graded: the artifact either compiles, passes tests, or meets an explicit schema.

#### Wiring verification IPs for semiconductor design



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">Use case</div>
    </div>
  <div data-content-switcher-pane data-value="prompt" hidden>
    <div class="hidden">Prompt</div>
    </div>
  <div data-content-switcher-pane data-value="grader" hidden>
    <div class="hidden">Grader code</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">Results</div>
    </div>



#### Production-ready API snippets that compile and pass AST checks



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">Use case</div>
    </div>
  <div data-content-switcher-pane data-value="grader" hidden>
    <div class="hidden">Grader code</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">Results</div>
    </div>



#### Correct handling of conflicts and dupes in a schedule manager



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">Use case</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">Results</div>
    </div>



### 2. Pull facts into a clean format

These tasks typically involve subtle distinctions that demand clear classification guidelines. Successful framing requires explicit and hierarchical labeling schemes defined through consensus by domain experts. Without consistent agreement, grading signals become noisy, weakening RFT effectiveness.

#### Assigning ICD-10 medical codes



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">Use case</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">Results</div>
    </div>



#### Extracting excerpts to support legal claims



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">Use case</div>
    </div>
  <div data-content-switcher-pane data-value="prompt" hidden>
    <div class="hidden">Prompt</div>
    </div>
  <div data-content-switcher-pane data-value="grader" hidden>
    <div class="hidden">Grader</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">Results</div>
    </div>



### 3. Apply complex rules correctly

This use case involves pulling verifiable facts or entities from unstructured inputs into clearly defined schemas (e.g., JSON objects, condition codes, medical codes, legal citations, or financial metrics).

Successful extraction tasks typically benefit from precise, continuous grading methodologies—like span-level F1 scores, fuzzy text-matching metrics, or numeric accuracy checks—to evaluate how accurately the extracted information aligns with ground truth. Define explicit success criteria and detailed rubrics. Then, the model can achieve reliable, repeatable improvements.

#### Expert-level reasoning in tax analysis



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">Use case</div>
    </div>
  <div data-content-switcher-pane data-value="grader" hidden>
    <div class="hidden">Grader code</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">Results</div>
    </div>



#### Enforcement of nuanced content moderation policies



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">Use case</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">Results</div>
    </div>



#### Legal document reviews, comparisons, and summaries



<div data-content-switcher-pane data-value="use-case">
    <div class="hidden">Use case</div>
    </div>
  <div data-content-switcher-pane data-value="review" hidden>
    <div class="hidden">Results</div>
    </div>



## Evals are the foundation

**Before implementing RFT, we strongly recommended creating and running an eval for the task you intend to fine-tune on**. If the model you intend to fine-tune scores at either the absolute minimum or absolute maximum possible score, then RFT won’t be useful to you.

RFT works by reinforcing better answers to provided prompts. If we can’t distinguish the quality of different answers (i.e., if they all receive the minimum or maximum possible score), then there's no training signal to learn from. However, if your eval scores somewhere in the range between the minimum and maximum possible scores, there's enough data to work with.

An effective eval reveals opportunities where human experts consistently agree but current frontier models struggle, presenting a valuable gap for RFT to close. [Get started with evals](https://developers.openai.com/api/docs/guides/evals).

## How to get better results from RFT

To see improvements in your fine-tuned model, there are two main places to revisit and refine: making sure your task is well defined, and making your grading scheme more robust.

### Reframe or clarify your task

Good tasks give the model a fair chance to learn and let you quantify improvements.

- **Start with a task the model can already solve occasionally**. RFT works by sampling many answers, keeping what looks best, and nudging the model toward those answers. If the model never gets the answer correct today, it cannot improve.
- **Make sure each answer can be graded**. A grader must read an answer and produce a score without a person in the loop. We support multiple [grader types](https://developers.openai.com/api/docs/guides/graders), including custom Python graders and LLM judges. If you can't write code to judge the answer with an available grader, RFT is not the right tool.
- **Remove doubt about the “right” answer**. If two careful people often disagree on the solution, the task is too fuzzy. Rewrite the prompt, add context, or split the task into clearer parts until domain experts agree.
- **Limit lucky guesses**. If the task is multiple choice with one obvious best pick, the model can win by chance. Add more classes, ask for short open‑ended text, or tweak the format so guessing is costly.

### Strengthen your grader

Clear, robust grading schemes are essential for RFT.

- **Produce a smooth score, not a pass/fail stamp**. A score that shifts gradually as answers improve provides a better training signal.
- **Guard against reward hacking**. This happens when the model finds a shortcut that earns high scores without real skill.
- **Avoid skewed data**. Datasets in which one label shows up most of the time invite the model to guess that label. Balance the set or up‑weight rare cases so the model must think.
- **Use an LLM judge when code falls short**. For rich, open‑ended answers, have a [separate OpenAI model grade](https://developers.openai.com/api/docs/guides/graders#model-graders) your fine-tuned model's answers. Make sure you:
  - **Evaluate the judge**: Run multiple candidate responses and correct answers through your LLM judge to ensure the grade returned is stable and aligned with preference.
  - **Provide few-shot examples**. Include great, fair, and poor answers in the prompt to improve the grader's effectiveness.

Learn more about [grader types](https://developers.openai.com/api/docs/guides/graders).

## Other resources

For more inspiration, visit the [OpenAI Cookbook](https://developers.openai.com/cookbook), which contains example code and links to third-party resources, or learn more about our models and reasoning capabilities:

- [Meet the models](https://developers.openai.com/api/docs/models)
- [Reinforcement fine-tuning guide](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning)
- [Graders](https://developers.openai.com/api/docs/guides/graders)
- [Model optimization overview](https://developers.openai.com/api/docs/guides/model-optimization)
``````
:::
:::

