---
title: "Reasoning 最佳实践"
description: "Explore best practices for using o-series reasoning models, like o1 and o3-mini, vs. GPT models—including use cases, how to choose a model, and prompting guidance."
outline: deep
---

# Reasoning 最佳实践

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/reasoning-best-practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/reasoning-best-practices.md](https://developers.openai.com/api/docs/guides/reasoning-best-practices.md)
- 抓取时间：2026-06-27T05:54:07.472Z
- Checksum：`d301b262fa947ee722f2953f57a359ce7bea335b3317deb6ee4ad02789a3e806`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
OpenAI 提供两类模型：[reasoning models](https://developers.openai.com/api/docs/models#o4-mini)（例如 o3 和 o4-mini）以及 [GPT models](https://developers.openai.com/api/docs/models#gpt-4.1)（例如 GPT-4.1）。这些模型家族的行为不同。

本指南涵盖：

1. 我们的 reasoning models 与非 reasoning GPT models 之间的区别
1. 何时使用我们的 reasoning models
1. 如何有效提示 reasoning models

进一步阅读 [reasoning models](/mirror/api/docs/guides/reasoning) 以及它们的工作方式。

## Reasoning models vs. GPT models

与 GPT models 相比，我们的 o-series models 擅长不同任务，也需要不同 prompts。一个模型家族并不比另一个更好，它们只是不同。

我们训练 o-series models（“规划者”）在复杂任务上思考得更久、更深入，使它们擅长制定策略、规划复杂问题的解决方案，并基于大量模糊信息做决策。这些模型也能以很高的准确度和精度执行任务，因此非常适合原本需要人类专家的领域，例如数学、科学、工程、金融服务和法律服务。

另一方面，我们延迟更低、成本效率更高的 GPT models（“执行者”）专为直接执行而设计。应用可以使用 o-series models 规划解决问题的策略，再使用 GPT models 执行具体任务，尤其是在速度和成本比完美准确度更重要时。

### 如何选择

对你的用例来说，最重要的是什么？

- **速度和成本** → GPT models 更快，通常成本也更低
- **执行定义明确的任务** → GPT models 能很好处理明确规定的任务
- **准确度和可靠性** → o-series models 是可靠的决策者
- **复杂问题求解** → o-series models 能处理模糊性和复杂性

如果完成任务时速度和成本最重要，并且你的用例由直接、定义明确的任务组成，那么我们的 GPT models 最适合你。不过，如果准确度和可靠性最重要，并且你需要解决非常复杂的多步骤问题，我们的 o-series models 可能更适合你。

大多数 AI 工作流会组合使用两类模型：o-series 用于 agentic 规划和决策，GPT series 用于任务执行。

![GPT models pair well with o-series models](https://cdn.openai.com/API/docs/images/customer-service-example.png)



_我们的 GPT-4o 和 GPT-4o mini 模型会根据客户信息分诊订单详情，识别订单问题和退货政策，然后将所有这些数据点输入 o3-mini，由它基于政策对退货可行性做出最终决策。_



## 何时使用我们的 reasoning models

下面是我们从客户和 OpenAI 内部观察到的一些成功使用模式。这不是对所有可能用例的全面回顾，而是一些用于测试 o-series models 的实用指导。

[准备好使用 reasoning model 了吗？跳到 quickstart →](/mirror/api/docs/guides/reasoning)

### 1. 处理模糊任务

Reasoning models 特别擅长在信息有限或信息碎片化的情况下，通过简单 prompt 理解用户意图并处理指令中的缺口。事实上，reasoning models 常常会先提出澄清问题，而不是做没有根据的猜测或试图填补信息空白。

&gt; “o1 的 reasoning 能力使我们的多 agent 平台 Matrix 在处理复杂文档时，能够生成全面、格式良好且细节丰富的回复。例如，o1 让 Matrix 仅凭一个基础 prompt，就能轻松识别信用协议中 restricted payments capacity 下可用的篮子。以往没有任何模型达到同样表现。与其他模型相比，o1 在密集 Credit Agreements 的复杂 prompts 上有 52% 产出了更强结果。”
&gt;
&gt; —[Hebbia](https://www.hebbia.com/)，面向法律和金融的 AI 知识平台公司

### 2. 大海捞针

当你传入大量非结构化信息时，reasoning models 非常擅长理解问题，并只抽取回答问题所需的最相关信息。

&gt; "为了分析一家公司的收购案，o1 审查了数十份公司文档，例如合同和租约，以发现任何可能影响交易的棘手条件。模型的任务是标记关键条款，在这个过程中，它在脚注中识别出一项关键的“change of control”条款：如果公司被出售，它必须立即偿还 7500 万美元贷款。o1 对细节的极致关注，使我们的 AI agents 能够通过识别任务关键型信息来支持金融专业人士。"
&gt;
&gt; —[Endex](https://endex.ai/)，AI 金融智能平台

### 3. 在大型数据集中发现关系和细微差别

我们发现，reasoning models 特别擅长对包含数百页密集、非结构化信息的复杂文档进行推理，例如法律合同、财务报表和保险理赔。模型尤其擅长在文档之间建立对应关系，并基于数据中隐含的事实做出决策。

&gt; “税务研究需要综合多份文档，产出最终且连贯的答案。我们把 GPT-4o 换成 o1 后发现，o1 更擅长推理文档之间的相互作用，以得出任何单一文档中都不明显的逻辑结论。因此，切换到 o1 后，我们看到端到端性能提升了 4 倍，令人难以置信。”
&gt;
&gt; —[Blue J](https://www.bluej.com/)，税务研究 AI 平台

Reasoning models 也擅长对细致的政策和规则进行推理，并将其应用于手头任务，从而得出合理结论。

&gt; "在金融分析中，分析师经常处理围绕股东权益的复杂场景，并需要理解相关法律细节。我们用一个具有挑战性但很常见的问题测试了来自不同提供商的大约 10 个模型：融资如何影响现有股东，尤其是当他们行使反稀释特权时？这需要推理 pre-money 和 post-money valuations，并处理循环稀释循环，这件事即使顶尖金融分析师也要花 20 到 30 分钟才能弄清楚。我们发现 o1 和 o3-mini 可以完美完成！这些模型甚至生成了一张清晰的计算表，展示对一名 10 万美元股东的影响。"
&gt;
&gt; –[BlueFlame AI](https://www.blueflame.ai/)，投资管理 AI 平台

### 4. 多步骤 agentic 规划

Reasoning models 对 agentic 规划和策略制定至关重要。我们看到，当 reasoning model 被用作“规划者”时效果很好：它产出详细的多步骤问题解决方案，然后根据高智能或低延迟哪个更重要，为每一步选择并分配合适的 GPT model（“执行者”）。

&gt; “我们在 agent 基础设施中使用 o1 作为规划者，让它编排工作流中的其他模型以完成多步骤任务。我们发现 o1 非常擅长选择数据类型并把大问题拆成更小的部分，使其他模型能够专注于执行。”
&gt;
&gt; —[Argon AI](https://argon-ai.com/)，制药行业 AI 知识平台

&gt; “o1 为 Lindy 的许多 agentic 工作流提供支持，Lindy 是我们的工作 AI 助手。该模型使用 function calling 从你的日历或电子邮件中提取信息，然后可以自动帮助你安排会议、发送邮件并管理日常任务中的其他部分。我们把所有过去会出问题的 agentic 步骤都切换到 o1，看到我们的 agents 几乎一夜之间变得无懈可击！”
&gt;
&gt; —[Lindy.AI](http://Lindy.AI)，工作 AI 助手

### 5. 视觉推理

截至今天，o1 是唯一支持视觉能力的 reasoning model。它与 GPT-4o 的区别在于，o1 能理解最具挑战性的视觉内容，例如结构模糊的图表和表格，或图像质量较差的照片。

&gt; “我们为数百万在线商品自动化风险和合规审查，包括奢侈珠宝仿品、濒危物种和受控物质。GPT-4o 在我们最难的图像分类任务上达到 50% 准确率。o1 在不修改任何 pipeline 的情况下取得了令人印象深刻的 88% 准确率。”
&gt;
&gt; —[SafetyKit](https://www.safetykit.com/)，AI 驱动的风险与合规平台

在我们自己的内部测试中，我们看到 o1 可以从高度详细的建筑图纸中识别 fixtures 和 materials，并生成全面的 bill of materials。我们观察到的一个最令人惊讶的点是，o1 可以跨不同图像建立对应关系：它会读取一页建筑图纸上的 legend，并在没有明确指令的情况下正确应用到另一页。下面可以看到，对于 4x4 PT 木柱，o1 根据 legend 识别出 "PT" 表示 pressure treated。

![o-series models correctly read architectural drawing details](https://cdn.openai.com/API/docs/images/architectural-drawing-example.png)

### 6. 审查、调试和改进代码质量

Reasoning models 在审查和改进大量代码方面特别有效；鉴于这些模型延迟更高，它们常常适合在后台运行代码审查。

&gt; “我们在 GitHub 和 GitLab 等平台上提供自动化 AI Code Reviews。虽然代码审查流程本身并不是延迟敏感型任务，但它确实需要理解跨多个文件的代码 diff。这正是 o1 的强项，它能可靠地检测到代码库中可能被人工审查者漏掉的细微更改。切换到 o-series models 后，我们把产品转化率提升了 3 倍。”
&gt;
&gt; —[CodeRabbit](https://www.coderabbit.ai/)，AI 代码审查初创公司

虽然 GPT-4o 和 GPT-4o mini 由于延迟更低，可能更适合编写代码，但我们也看到 o3-mini 在稍微不那么延迟敏感的用例中，在代码产出上表现突出。

&gt; “o3-mini 持续产出高质量、结论明确的代码，并且在问题定义良好时，经常能得出正确解决方案，即使面对非常有挑战性的编码任务也一样。其他模型可能只适用于小规模、快速代码迭代，而 o3-mini 擅长规划和执行复杂的软件设计系统。”
&gt;
&gt; —[Windsurf](https://codeium.com/)，由 Codeium 构建的协作式 agentic AI IDE

### 7. 对其他模型回复进行评估和基准测试

我们还看到 reasoning models 在对其他模型回复进行基准测试和评估方面表现很好。数据验证对于确保数据集质量和可靠性很重要，尤其是在医疗等敏感领域。传统验证方法使用预定义规则和模式，但 o1 和 o3-mini 这样的高级模型可以理解上下文并对数据进行推理，从而提供更灵活、更智能的验证方法。

&gt; "许多客户在 Braintrust 的 eval 流程中使用 LLM-as-a-judge。例如，医疗公司可能使用像 gpt-4o 这样的 workhorse model 总结患者问题，然后用 o1 评估总结质量。Braintrust 的一位客户看到一个 judge 的 F1 分数从使用 4o 时的 0.12 提升到使用 o1 时的 0.74！在这些用例中，他们发现 o1 的 reasoning 能够在最困难、最复杂的评分任务中发现 completions 的细微差异，带来了根本性改变。"
&gt;
&gt; —[Braintrust](https://www.braintrust.dev/)，AI evals 平台

## 如何有效提示 reasoning models

这些模型在直接明了的 prompts 下表现最好。一些 prompt engineering 技术，例如指示模型 "think step by step"，可能不会提升性能（有时还会妨碍性能）。请参阅下面的最佳实践，或[从 prompt examples 开始](https://developers.openai.com/api/docs/guides/reasoning/advice-on-prompting#prompt-examples)。

- **Developer messages are the new system messages**：从 `o1-2024-12-17` 开始，reasoning models 支持 developer messages 而不是 system messages，以便与 [model spec](https://cdn.openai.com/spec/model-spec-2024-05-08.html#follow-the-chain-of-command) 中描述的 chain of command 行为保持一致。
- **保持 prompts 简单直接**：这些模型擅长理解并回应简短、清晰的指令。
- **避免 chain-of-thought prompts**：由于这些模型会在内部执行 reasoning，提示它们 "think step by step" 或 "explain your reasoning" 是不必要的。
- **使用分隔符提高清晰度**：使用 markdown、XML 标签和章节标题等分隔符，清晰标示输入中的不同部分，帮助模型恰当地解释各个部分。
- **先尝试 zero shot，再在需要时使用 few shot**：Reasoning models 通常不需要 few-shot examples 就能产生良好结果，因此请先尝试不带示例地编写 prompt。如果你对期望输出有更复杂的要求，在 prompt 中加入少量输入和期望输出示例可能会有帮助。只要确保示例与 prompt 指令高度一致，因为二者之间的不一致可能导致较差结果。
- **提供具体准则**：如果你希望明确约束模型回复（例如“提出预算低于 500 美元的解决方案”），请在 prompt 中明确写出这些约束。
- **非常具体地说明最终目标**：在指令中，尽量为成功回复给出非常具体的参数，并鼓励模型持续 reasoning 和迭代，直到匹配你的成功标准。
- **Markdown formatting**：从 `o1-2024-12-17` 开始，API 中的 reasoning models 会避免生成带 markdown formatting 的回复。若要向模型表明你希望回复使用 markdown formatting，请在 developer message 的第一行包含字符串 `Formatting re-enabled`。

## 如何保持低成本和高准确度

随着 `o3` 和 `o4-mini` 模型推出，Responses API 中持久化 reasoning items 的处理方式发生了变化。此前（对于 `o1`、`o3-mini`、`o1-mini` 和 `o1-preview`），reasoning items 在后续 API 请求中总是会被忽略，即使它们被包含在请求的 input items 中。对于 `o3` 和 `o4-mini`，一些与 function calls 相邻的 reasoning items 会被纳入模型上下文，以帮助在使用最少 reasoning tokens 的同时提升模型性能。

为了在这一变化下获得最佳结果，我们建议使用 [Responses API](https://developers.openai.com/api/docs/api-reference/responses)，将 `store` 参数设置为 `true`，并传入之前请求中的所有 reasoning items（可以使用 `previous_response_id`，也可以取旧请求的所有 output items 并作为 input items 传给新请求）。OpenAI 会自动将任何相关 reasoning items 纳入模型上下文，并忽略无关项。在更高级的用例中，如果你想更精细地管理哪些内容进入模型上下文，我们建议你至少包含最新 function call 与前一条 user message 之间的所有 reasoning items。这样做可以确保当你回复 function call 时，模型不必重新开始 reasoning，从而获得更好的 function-calling 性能和更低的总体 token 用量。

如果你使用 Chat Completions API，reasoning items 永远不会包含在模型上下文中。这是因为 Chat Completions 是无状态 API。这会导致在涉及大量 function calls 的复杂 agentic 场景中，模型性能略有下降，并使用更多 reasoning tokens。在不涉及复杂多 function calling 的情况下，无论使用哪个 API，性能都不应下降。

## 其他资源

如需更多灵感，请访问 [OpenAI Cookbook](https://developers.openai.com/cookbook)，其中包含示例代码和第三方资源链接；也可以进一步了解我们的模型和 reasoning 能力：

- [Meet the models](https://developers.openai.com/api/docs/models)
- [Reasoning guide](/mirror/api/docs/guides/reasoning)
- [How to use reasoning for validation](https://developers.openai.com/cookbook/examples/o1/using_reasoning_for_data_validation)
- [Video course: Reasoning with o1](https://www.deeplearning.ai/short-courses/reasoning-with-o1/)
- [Papers on advanced prompting to improve reasoning](https://developers.openai.com/cookbook/related_resources#papers-on-advanced-prompting-to-improve-reasoning)

:::

## English source

::: details 展开英文原文
::: v-pre
OpenAI offers two types of models: [reasoning models](https://developers.openai.com/api/docs/models#o4-mini) (o3 and o4-mini, for example) and [GPT models](https://developers.openai.com/api/docs/models#gpt-4.1) (like GPT-4.1). These model families behave differently.

This guide covers:

1. The difference between our reasoning and non-reasoning GPT models
1. When to use our reasoning models
1. How to prompt reasoning models effectively

Read more about [reasoning models](/mirror/api/docs/guides/reasoning) and how they work.

## Reasoning models vs. GPT models

Compared to GPT models, our o-series models excel at different tasks and require different prompts. One model family isn't better than the other—they're just different.

We trained our o-series models (“the planners”) to think longer and harder about complex tasks, making them effective at strategizing, planning solutions to complex problems, and making decisions based on large volumes of ambiguous information. These models can also execute tasks with high accuracy and precision, making them ideal for domains that would otherwise require a human expert—like math, science, engineering, financial services, and legal services.

On the other hand, our lower-latency, more cost-efficient GPT models (“the workhorses”) are designed for straightforward execution. An application might use o-series models to plan out the strategy to solve a problem, and use GPT models to execute specific tasks, particularly when speed and cost are more important than perfect accuracy.

### How to choose

What's most important for your use case?

- **Speed and cost** → GPT models are faster and tend to cost less
- **Executing well defined tasks** → GPT models handle explicitly defined tasks well
- **Accuracy and reliability** → o-series models are reliable decision makers
- **Complex problem-solving** → o-series models work through ambiguity and complexity

If speed and cost are the most important factors when completing your tasks _and_ your use case is made up of straightforward, well defined tasks, then our GPT models are the best fit for you. However, if accuracy and reliability are the most important factors _and_ you have a very complex, multistep problem to solve, our o-series models are likely right for you.

Most AI workflows will use a combination of both models—o-series for agentic planning and decision-making, GPT series for task execution.

![GPT models pair well with o-series models](https://cdn.openai.com/API/docs/images/customer-service-example.png)



_Our GPT-4o and GPT-4o mini models triage order details with customer information, identify the order issues and the return policy, and then feed all of these data points into o3-mini to make the final decision about the viability of the return based on policy._



## When to use our reasoning models

Here are a few patterns of successful usage that we’ve observed from customers and internally at OpenAI. This isn't a comprehensive review of all possible use cases but, rather, some practical guidance for testing our o-series models.

[Ready to use a reasoning model? Skip to the quickstart →](/mirror/api/docs/guides/reasoning)

### 1. Navigating ambiguous tasks

Reasoning models are particularly good at taking limited information or disparate pieces of information and with a simple prompt, understanding the user’s intent and handling any gaps in the instructions. In fact, reasoning models will often ask clarifying questions before making uneducated guesses or attempting to fill information gaps.

&gt; “o1’s reasoning capabilities enable our multi-agent platform Matrix to produce exhaustive, well-formatted, and detailed responses when processing complex documents. For example, o1 enabled Matrix to easily identify baskets available under the restricted payments capacity in a credit agreement, with a basic prompt. No former models are as performant. o1 yielded stronger results on 52% of complex prompts on dense Credit Agreements compared to other models.”
&gt;
&gt; —[Hebbia](https://www.hebbia.com/), AI knowledge platform company for legal and finance

### 2. Finding a needle in a haystack

When you’re passing large amounts of unstructured information, reasoning models are great at understanding and pulling out only the most relevant information to answer a question.

&gt; "To analyze a company's acquisition, o1 reviewed dozens of company documents—like contracts and leases—to find any tricky conditions that might affect the deal. The model was tasked with flagging key terms and in doing so, identified a crucial "change of control" provision in the footnotes: if the company was sold, it would have to pay off a $75 million loan immediately. o1's extreme attention to detail enables our AI agents to support finance professionals by identifying mission-critical information."
&gt;
&gt; —[Endex](https://endex.ai/), AI financial intelligence platform

### 3. Finding relationships and nuance across a large dataset

We’ve found that reasoning models are particularly good at reasoning over complex documents that have hundreds of pages of dense, unstructured information—things like legal contracts, financial statements, and insurance claims. The models are particularly strong at drawing parallels between documents and making decisions based on unspoken truths represented in the data.

&gt; “Tax research requires synthesizing multiple documents to produce a final, cogent answer. We swapped GPT-4o for o1 and found that o1 was much better at reasoning over the interplay between documents to reach logical conclusions that were not evident in any one single document. As a result, we saw a 4x improvement in end-to-end performance by switching to o1—incredible.”
&gt;
&gt; —[Blue J](https://www.bluej.com/), AI platform for tax research

Reasoning models are also skilled at reasoning over nuanced policies and rules, and applying them to the task at hand in order to reach a reasonable conclusion.

&gt; "In financial analyses, analysts often tackle complex scenarios around shareholder equity and need to understand the relevant legal intricacies. We tested about 10 models from different providers with a challenging but common question: how does a fundraise affect existing shareholders, especially when they exercise their anti-dilution privileges? This required reasoning through pre- and post-money valuations and dealing with circular dilution loops—something top financial analysts would spend 20-30 minutes to figure out. We found that o1 and o3-mini can do this flawlessly! The models even produced a clear calculation table showing the impact on a $100k shareholder."
&gt;
&gt; –[BlueFlame AI](https://www.blueflame.ai/), AI platform for investment management

### 4. Multistep agentic planning

Reasoning models are critical to agentic planning and strategy development. We’ve seen success when a reasoning model is used as “the planner,” producing a detailed, multistep solution to a problem and then selecting and assigning the right GPT model (“the doer”) for each step, based on whether high intelligence or low latency is most important.

&gt; “We use o1 as the planner in our agent infrastructure, letting it orchestrate other models in the workflow to complete a multistep task. We find o1 is really good at selecting data types and breaking down big questions into smaller chunks, enabling other models to focus on execution.”
&gt;
&gt; —[Argon AI](https://argon-ai.com/), AI knowledge platform for the pharmaceutical industry

&gt; “o1 powers many of our agentic workflows at Lindy, our AI assistant for work. The model uses function calling to pull information from your calendar or email and then can automatically help you schedule meetings, send emails, and manage other parts of your day-to-day tasks. We switched all of our agentic steps that used to cause issues to o1 and observing our agents becoming basically flawless overnight!”
&gt;
&gt; —[Lindy.AI](http://Lindy.AI), AI assistant for work

### 5. Visual reasoning

As of today, o1 is the only reasoning model that supports vision capabilities. What sets it apart from GPT-4o is that o1 can grasp even the most challenging visuals, like charts and tables with ambiguous structure or photos with poor image quality.

&gt; “We automate risk and compliance reviews for millions of products online, including luxury jewelry dupes, endangered species, and controlled substances. GPT-4o reached 50% accuracy on our hardest image classification tasks. o1 achieved an impressive 88% accuracy without any modifications to our pipeline.”
&gt;
&gt; —[SafetyKit](https://www.safetykit.com/), AI-powered risk and compliance platform

From our own internal testing, we’ve seen that o1 can identify fixtures and materials from highly detailed architectural drawings to generate a comprehensive bill of materials. One of the most surprising things we observed was that o1 can draw parallels across different images by taking a legend on one page of the architectural drawings and correctly applying it across another page without explicit instructions. Below you can see that, for the 4x4 PT wood posts, o1 recognized that "PT" stands for pressure treated based on the legend.

![o-series models correctly read architectural drawing details](https://cdn.openai.com/API/docs/images/architectural-drawing-example.png)

### 6. Reviewing, debugging, and improving code quality

Reasoning models are particularly effective at reviewing and improving large amounts of code, often running code reviews in the background given the models’ higher latency.

&gt; “We deliver automated AI Code Reviews on platforms like GitHub and GitLab. While code review process is not inherently latency-sensitive, it does require understanding the code diffs across multiple files. This is where o1 really shines—it's able to reliably detect minor changes to a codebase that could be missed by a human reviewer. We were able to increase product conversion rates by 3x after switching to o-series models.”
&gt;
&gt; —[CodeRabbit](https://www.coderabbit.ai/), AI code review startup

While GPT-4o and GPT-4o mini may be better designed for writing code with their lower latency, we’ve also seen o3-mini spike on code production for use cases that are slightly less latency-sensitive.

&gt; “o3-mini consistently produces high-quality, conclusive code, and very frequently arrives at the correct solution when the problem is well-defined, even for very challenging coding tasks. While other models may only be useful for small-scale, quick code iterations, o3-mini excels at planning and executing complex software design systems.”
&gt;
&gt; —[Windsurf](https://codeium.com/), collaborative agentic AI-powered IDE, built by Codeium

### 7. Evaluation and benchmarking for other model responses

We’ve also seen reasoning models do well in benchmarking and evaluating other model responses. Data validation is important for ensuring dataset quality and reliability, especially in sensitive fields like healthcare. Traditional validation methods use predefined rules and patterns, but advanced models like o1 and o3-mini can understand context and reason about data for a more flexible and intelligent approach to validation.

&gt; "Many customers use LLM-as-a-judge as part of their eval process in Braintrust. For example, a healthcare company might summarize patient questions using a workhorse model like gpt-4o, then assess the summary quality with o1. One Braintrust customer saw the F1 score of a judge go from 0.12 with 4o to 0.74 with o1! In these use cases, they’ve found o1’s reasoning to be a game-changer in finding nuanced differences in completions, for the hardest and most complex grading tasks."
&gt;
&gt; —[Braintrust](https://www.braintrust.dev/), AI evals platform

## How to prompt reasoning models effectively

These models perform best with straightforward prompts. Some prompt engineering techniques, like instructing the model to "think step by step," may not enhance performance (and can sometimes hinder it). See best practices below, or [get started with prompt examples](https://developers.openai.com/api/docs/guides/reasoning/advice-on-prompting#prompt-examples).

- **Developer messages are the new system messages**: Starting with `o1-2024-12-17`, reasoning models support developer messages rather than system messages, to align with the chain of command behavior described in the [model spec](https://cdn.openai.com/spec/model-spec-2024-05-08.html#follow-the-chain-of-command).
- **Keep prompts simple and direct**: The models excel at understanding and responding to brief, clear instructions.
- **Avoid chain-of-thought prompts**: Since these models perform reasoning internally, prompting them to "think step by step" or "explain your reasoning" is unnecessary.
- **Use delimiters for clarity**: Use delimiters like markdown, XML tags, and section titles to clearly indicate distinct parts of the input, helping the model interpret different sections appropriately.
- **Try zero shot first, then few shot if needed**: Reasoning models often don't need few-shot examples to produce good results, so try to write prompts without examples first. If you have more complex requirements for your desired output, it may help to include a few examples of inputs and desired outputs in your prompt. Just ensure that the examples align very closely with your prompt instructions, as discrepancies between the two may produce poor results.
- **Provide specific guidelines**: If there are ways you explicitly want to constrain the model's response (like "propose a solution with a budget under $500"), explicitly outline those constraints in the prompt.
- **Be very specific about your end goal**: In your instructions, try to give very specific parameters for a successful response, and encourage the model to keep reasoning and iterating until it matches your success criteria.
- **Markdown formatting**: Starting with `o1-2024-12-17`, reasoning models in the API will avoid generating responses with markdown formatting. To signal to the model when you do want markdown formatting in the response, include the string `Formatting re-enabled` on the first line of your developer message.

## How to keep costs low and accuracy high

With the introduction of `o3` and `o4-mini` models, persisted reasoning items in the Responses API are treated differently. Previously (for `o1`, `o3-mini`, `o1-mini` and `o1-preview`), reasoning items were always ignored in follow‑up API requests, even if they were included in the input items of the requests. With `o3` and `o4-mini`, some reasoning items adjacent to function calls are included in the model’s context to help improve model performance while using the least amount of reasoning tokens.

For the best results with this change, we recommend using the [Responses API](https://developers.openai.com/api/docs/api-reference/responses) with the `store` parameter set to `true`, and passing in all reasoning items from previous requests (either using `previous_response_id`, or by taking all the output items from an older request and passing them in as input items for a new one). OpenAI will automatically include any relevant reasoning items in the model's context and ignore any irrelevant ones. In more advanced use‑cases where you’d like to manage what goes into the model's context more precisely, we recommend that you at least include all reasoning items between the latest function call and the previous user message. Doing this will ensure that the model doesn’t have to restart its reasoning when you respond to a function call, resulting in better function‑calling performance and lower overall token usage.

If you’re using the Chat Completions API, reasoning items are never included in the context of the model. This is because Chat Completions is a stateless API. This will result in slightly degraded model performance and greater reasoning token usage in complex agentic cases involving many function calls. In instances where complex multiple function calling is not involved, there should be no degradation in performance regardless of the API being used.

## Other resources

For more inspiration, visit the [OpenAI Cookbook](https://developers.openai.com/cookbook), which contains example code and links to third-party resources, or learn more about our models and reasoning capabilities:

- [Meet the models](https://developers.openai.com/api/docs/models)
- [Reasoning guide](/mirror/api/docs/guides/reasoning)
- [How to use reasoning for validation](https://developers.openai.com/cookbook/examples/o1/using_reasoning_for_data_validation)
- [Video course: Reasoning with o1](https://www.deeplearning.ai/short-courses/reasoning-with-o1/)
- [Papers on advanced prompting to improve reasoning](https://developers.openai.com/cookbook/related_resources#papers-on-advanced-prompting-to-improve-reasoning)

:::
:::

