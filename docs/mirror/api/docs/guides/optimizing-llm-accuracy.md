---
title: "优化 LLM 准确率"
description: "Learn strategies to enhance the accuracy of large language models using techniques like prompt engineering, retrieval-augmented generation, and fine-tuning."
outline: deep
---

# 优化 LLM 准确率

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy.md](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy.md)
- 抓取时间：2026-06-27T05:54:04.180Z
- Checksum：`288eef564ba924fc7b0c2a06dc9e3eff60293a6c4669881bfc1ce040ddb127fe`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
### 使用 LLM 时如何最大化正确性和一致行为

优化 LLM 很难。

我们与许多 start-ups 和 enterprises 的开发者合作过，而优化之所以总是很难，归根结底通常是这些原因：

- 不知道**如何开始**优化准确率
- 不知道**什么时候使用什么**优化方法
- 不知道怎样的准确率水平才**足够好**，可以用于生产环境

本文给出一个心智模型，用来思考如何针对准确率和行为优化 LLM。我们会探讨 prompt engineering、retrieval-augmented generation (RAG) 和 fine-tuning 等方法。我们还会强调每种技术如何使用、何时使用，并分享几个常见陷阱。

阅读时，重要的是在脑中把这些原则与你具体用例中的“准确率”含义联系起来。这听起来也许显而易见，但让人类需要修正一段糟糕文案，与把本应退款 100 美元的客户退款 1000 美元，两者之间存在差异。进入任何关于 LLM 准确率的讨论时，你都应该大致知道 LLM 的一次失败会让你付出多少成本，以及一次成功能帮你节省或赚取多少收益。我们会在结尾回到这一点，讨论生产环境中怎样的准确率才“足够好”。

## LLM 优化背景

许多关于优化的“how-to”指南会把它描绘成一个简单的线性流程：先从 prompt engineering 开始，然后转向 retrieval-augmented generation，最后 fine-tuning。然而，实际情况往往不是这样。这些都是用于解决不同问题的杠杆；要朝正确方向优化，你需要拉动正确的杠杆。

把 LLM 优化框定为一个矩阵会更有用：

![Accuracy mental model diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-01.png)

典型的 LLM 任务会从左下角的 prompt engineering 开始，在那里我们测试、学习并评估，以获得 baseline。审查这些 baseline 示例并判断它们为什么不正确之后，我们可以拉动其中一个杠杆：

- **Context optimization：**当 1）模型缺少上下文知识，因为它不在训练集中，2）模型知识已经过时，或 3）模型需要了解专有信息时，你需要针对 context 进行优化。这个轴最大化的是**响应准确率**。
- **LLM optimization：**当 1）模型产生的结果不一致且格式错误，2）语气或说话风格不正确，或 3）推理没有被稳定遵循时，你需要优化 LLM。这个轴最大化的是**行为一致性**。

在现实中，这会变成一系列优化步骤：我们评估，提出如何优化的假设，应用它，再评估，然后重新判断下一步。下面是一个相当典型的优化流程示例：

![Accuracy mental model journey diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-02.png)

在这个例子中，我们执行以下操作：

- 从一个 prompt 开始，然后评估其性能
- 添加静态 few-shot 示例，这应该会改善结果一致性
- 添加一个 retrieval 步骤，让 few-shot 示例根据问题动态引入，这通过确保每个输入都有相关 context 来提升性能
- 准备一个包含 50+ 个示例的数据集，并 fine-tune 一个模型以提高一致性
- 调整 retrieval，并添加 fact-checking 步骤以发现 hallucinations，从而达到更高准确率
- 用包含增强 RAG 输入的新训练示例重新训练 fine-tuned model

对于困难的业务问题，这是一条相当典型的优化 pipeline。它帮助我们判断是需要更多相关 context，还是需要模型提供更一致的行为。一旦做出这个判断，我们就知道第一步该拉动哪个优化杠杆。

现在我们有了心智模型，接下来深入了解如何在这些领域采取行动。我们从左下角的 Prompt Engineering 开始。

### Prompt engineering

Prompt engineering 通常是最佳起点\*\*。对于 summarization、translation 和 code generation 等用例，它往往是唯一需要的方法，因为 zero-shot 方法就能达到生产级别的准确率和一致性。

这是因为它迫使你定义“准确率”对你的用例意味着什么。你从最基础的层面开始，也就是提供一个输入，因此你需要能够判断输出是否符合预期。如果结果不是你想要的，那么其中的**原因**会告诉你应该用什么来推动进一步优化。

为此，你应该始终从一个简单 prompt 和心中的 expected output 开始，然后通过添加 **context**、**instructions** 或 **examples** 来优化 prompt，直到它给出你想要的结果。

#### 优化

为了优化你的 prompts，我主要会依赖 OpenAI API 文档中 [Prompt Engineering guide](/mirror/api/docs/guides/prompt-engineering) 的策略。每种策略都会帮助你调优 Context、LLM，或两者：

| 策略                                  | Context optimization | LLM optimization |
| ----------------------------------------- | :------------------: | :--------------: |
| 写出清晰的 instructions                  |                      |        X         |
| 将复杂任务拆成更简单的 subtasks |          X           |        X         |
| 给 GPTs 时间去“思考”                 |                      |        X         |
| 系统性测试变更               |          X           |        X         |
| 提供参考文本                    |          X           |                  |
| 使用外部工具                        |          X           |                  |

这些策略可能有点难以可视化，因此我们会通过一个实用示例来逐一测试它们。让我们使用 gpt-4-turbo 来纠正冰岛语句子，看看它如何发挥作用。

用于语言纠错的 prompt engineering

[Icelandic Errors Corpus](https://repository.clarin.is/repository/xmlui/handle/20.500.12537/105) 包含带错误的冰岛语句子及其纠正版本。我们会使用 baseline GPT-4 模型尝试解决这个任务，然后应用不同的优化技术，看看如何提升模型性能。

给定一个冰岛语句子，我们希望模型返回该句子的纠正版本。我们会使用 BLEU score 来衡量翻译的相对质量。



| system                                                                                                                                           | user                                                        | ground_truth                                               | assistant                                                  | BLEU |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---- |
| The following sentences contain Icelandic sentences which may include errors. Please correct these errors using as few word changes as possible. | Sörvistölur eru nær hálsi og skartgripir kvenna á brjótsti. | Sörvistölur eru nær hálsi og skartgripir kvenna á brjósti. | Sörvistölur eru nær hálsi og skartgripir kvenna á brjósti. | 1.0  |



我们对 GPT-4 进行第一次尝试，不提供任何 examples，它表现还不错，得到 62 的 BLEU score。
现在我们会添加一些 few-shot 示例，看看是否能通过展示而不是告知，让模型学会我们想要的风格。
示例如下：

```text
SYSTEM: The following sentences contain Icelandic sentences which may include errors. Please correct these errors using as few word changes as possible.

# Examples
USER: "Stofnendurnir séu margir og eru fulltrúar hennar frá Englandi, Grikklandi, Rússlandi, Svíþjóð og fleiri löndum Evrópu."
ASSISTANT: "Hann segir að stofnendur leynireglunnar séu margir og að fulltrúar hennar séu frá Englandi, Grikklandi, Rússlandi, Svíþjóð og fleiri löndum Evrópu."

USER: "Helsta fæða bjúgorma eru hægfara lífverur sem eru á sama búsvæði og bjúgormarnir, oft smærri ormar eins og burstormar (fræðiheiti: Polychatete)."
ASSISTANT: "Helsta fæða bjúgorma eru hægfara lífverur sem eru á sama búsvæði og bjúgormarnir, oft smærri ormar eins og burstaormar (fræðiheiti: Polychatete)."

USER: "Sörvistölur eru nær hálsi og skartgripir kvenna á brjótsti."
ASSISTANT: "Sörvistölur eru nær hálsi og skartgripir kvenna á brjósti."

USER: [input user query here]
```

整体翻译质量更好，BLEU score 提升到 **70（+8%）**。这很不错，也说明向模型提供任务 examples 有助于它学习。

这告诉我们，需要优化的是模型的**行为**。它已经具备解决问题所需的知识，因此提供更多 examples 可能就是我们需要的优化方式。

我们稍后会在本文中回到这个用例，测试更高级的优化方法如何与它配合。

我们已经看到，prompt engineering 是一个很好的起点，并且通过合适的调优方法，我们可以把性能推进得相当远。

然而，prompt engineering 最大的问题是它往往不容易 scale。我们要么需要馈入动态 context，让模型能处理比单纯向 context 添加内容更宽泛的问题；要么需要比 few-shot examples 所能达到的更一致的行为。



Long-context models 让 prompt engineering 能进一步 scale。不过，请注意，模型在非常大的 prompts 和复杂 instructions 中可能难以维持注意力，因此你应该始终将 long context models 与不同 context sizes 下的 evaluation 搭配使用，以确保不会陷入 [**lost in the middle**](https://arxiv.org/abs/2307.03172)。“Lost in the middle”是一个术语，用来描述 LLM 无法在任意时刻对给它的所有 tokens 都投入同等注意力。这可能导致它看似随机地漏掉信息。这并不意味着你不应该使用 long context，但你需要将它与充分的 evaluation 配套。一位 open-source contributor Greg Kamradt 做了一个有用的 evaluation，叫做 [**Needle in A Haystack (NITA)**](https://github.com/gkamradt/LLMTest_NeedleInAHaystack)，它把一段信息隐藏在 long-context documents 的不同深度，并评估 retrieval 质量。这展示了 long-context 的问题：它承诺一种简单得多的 retrieval process，你可以把所有内容都塞进 context，但代价是准确率。



那么，prompt engineering 到底能走多远？答案是：这取决于情况，而你做决定的方式就是 evaluations。

### Evaluation

这就是为什么**一个好的 prompt，加上一组评估问题和 ground truth answers**，是这一阶段最好的输出。如果我们有一组 20+ 的问题和答案，并且已经深入查看失败细节，对失败原因有了假设，那么我们就有了合适的 baseline，可以继续采用更高级的优化方法。

在进入更复杂的优化方法之前，也值得考虑如何自动化这项 evaluation，以加快迭代速度。我们看到一些常见做法在这里很有效：

- 使用 [ROUGE](https://aclanthology.org/W04-1013/) 或 [BERTScore](https://arxiv.org/abs/1904.09675) 等方法提供一种粗略判断。这与人类 reviewers 的相关性并不特别强，但可以快速有效地衡量一次迭代对模型输出改变了多少。
- 按照 G-Eval paper 中概述的方式，使用 [GPT-4](https://arxiv.org/pdf/2303.16634.pdf) 作为 evaluator：你向 LLM 提供 scorecard，让它尽可能客观地评估输出。

如果你想更深入了解这些方法，请查看[这个 cookbook](https://developers.openai.com/cookbook/examples/evaluation/how_to_eval_abstractive_summarization)，其中会带你在实践中走一遍全部方法。

## 理解工具

所以，你已经完成了 prompt engineering，有了 eval set，但你的模型仍没有做到你需要的事情。最重要的下一步，是诊断它在哪里失败，以及哪种工具最适合改进它。

下面是一个用于诊断的基本框架：

![Classifying memory problem diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-03.png)

你可以把每个失败的 evaluation question 看作 **in-context** 或 **learned** memory problem。打个比方，想象你在参加考试。有两种方式可以确保你答对：

- 你过去 6 个月一直上课，反复看到很多关于某个概念如何运作的示例。这是 **learned** memory。在 LLM 中，你通过展示 prompt 示例和你期望的 response，并让模型从这些示例中学习来解决它。
- 你带着教材，可以查找回答问题所需的正确信息。这是 **in-context** memory。在 LLM 中，我们通过把相关信息塞进 context window 来解决它，可以是通过 prompt engineering 的静态方式，也可以是通过 RAG 的工业化方式。

这两种优化方法是**可叠加的，而不是互斥的**。它们可以堆叠使用，有些用例会要求你同时使用它们才能获得最佳性能。

假设我们面对的是短期记忆问题，那么我们会使用 RAG 来解决。

### Retrieval-augmented generation (RAG)

RAG 是在 **G**enerating answer 之前，**R**etrieving content 来 **A**ugment your LLM's prompt 的过程。它用于让模型**访问 domain-specific context** 以解决任务。

RAG 是提高 LLM 准确率和一致性的极有价值的工具。OpenAI 许多最大规模客户部署只使用 prompt engineering 和 RAG 就完成了。

![RAG diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-04.png)

在这个例子中，我们嵌入了一个统计知识库。当用户提问时，我们会嵌入该问题，并从知识库中检索最相关的内容。然后把这些内容呈现给模型，由模型回答问题。

RAG 应用引入了一个需要优化的新轴：retrieval。为了让 RAG 工作，我们需要向模型提供正确的 context，然后评估模型是否正确回答。我在这里用一个网格来组织这些内容，以展示一种思考 RAG evaluation 的简单方式：

![RAG evaluation diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-05.png)

你的 RAG 应用可能在两个领域出问题：

| 领域      | 问题                                                                                                                                                                               | 解决方式                                                                                                                                                                                                                                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Retrieval | 你可能提供错误 context，导致模型根本无法回答；或者你可能提供太多无关 context，淹没真正的信息并造成 hallucinations。 | 优化 retrieval，这可以包括：&lt;br/&gt;- 调整 search，使其返回正确结果。&lt;br/&gt;- 调整 search，使其包含更少噪声。&lt;br/&gt;- 在每个 retrieved result 中提供更多信息。&lt;br/&gt;这些只是示例，因为调优 RAG 性能本身已经成为一个行业，LlamaIndex 和 LangChain 等库提供了许多调优方法。 |
| LLM       | 模型也可能拿到了正确 context，却用错方式处理它。                                                                                                              | 通过改进模型使用的 instructions 和 method 来进行 prompt engineering；如果给它展示 examples 能提高准确率，则加入 fine-tuning                                                                                                                                                                                                                                  |

这里需要带走的关键点是：原则仍与开头的心智模型相同。你通过 evaluation 找出出了什么问题，然后采取一个优化步骤来修复它。RAG 的唯一不同之处在于，你现在还需要考虑 retrieval 轴。

RAG 很有用，但它只解决 in-context learning 问题。对于许多用例，问题会是确保 LLM 能学会某项任务，从而可以一致、可靠地执行它。对于这个问题，我们转向 fine-tuning。

### Fine-tuning

为了解决 learned memory problem，许多开发者会在较小的、domain-specific dataset 上继续训练 LLM，以针对特定任务优化它。这个过程称为 **fine-tuning**。

Fine-tuning 通常出于以下两个原因之一：

- **提高特定任务上的模型准确率：**在 task-specific data 上训练模型，通过向它展示许多正确执行该任务的示例，来解决 learned memory problem。
- **提高模型效率：**用更少 tokens 或更小模型达到相同准确率。

Fine-tuning 过程从准备训练示例数据集开始。这是最关键的一步，因为你的 fine-tuning examples 必须准确代表模型在真实世界中会看到的内容。

许多客户使用一种称为 **prompt baking** 的流程：在 pilot 期间广泛记录 prompt inputs 和 outputs。这些日志可以被剪裁成一个包含现实示例的有效 training set。

![Fine-tuning process diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-06.png)

一旦你有了这组干净数据，就可以通过执行一次 **training** run 来训练 fine-tuned model。根据你用于训练的平台或框架，你可能可以像调优其他机器学习模型一样，在这里调优 hyperparameters。我们始终建议保留一个 hold-out set，用于训练后的 **evaluation**，以检测 overfitting。关于如何构建良好 training set 的提示，可以查看我们 Fine-tuning 文档中的[指导](https://developers.openai.com/api/docs/guides/fine-tuning#analyzing-your-fine-tuned-model)。训练完成后，新的 fine-tuned model 即可用于 inference。

对于 fine-tuning 优化，我们会聚焦在 OpenAI model customization offerings 中观察到的 best practices，但这些原则也应该适用于其他 providers 和 OSS offerings。这里需要遵循的关键实践包括：

- **从 prompt-engineering 开始：**从 prompt engineering 阶段获得一个扎实的 evaluation set，并将其用作 baseline。这样在你对 base prompt 有信心之前，可以保持低投入方法。
- **从小处开始，关注质量：**在 foundation model 之上进行 fine-tuning 时，training data 质量比数量更重要。从 50+ 个示例开始，evaluate，然后在尚未达到准确率需求，且导致错误答案的问题来自 consistency/behavior 而不是 context 时，再扩大 training set size。
- **确保 examples 具有代表性：**我们看到的最常见陷阱之一是非代表性的 training data，也就是用于 fine-tuning 的 examples 在 formatting 或 form 上与 LLM 在生产环境中看到的内容存在微妙差异。例如，如果你有一个 RAG application，请用包含 RAG 示例的内容 fine-tune 模型，这样它就不是 zero-shot 地学习如何使用 context。

### 上述全部方法

这些技术可以彼此叠加。如果你的早期 evals 显示 context 和 behavior 都有问题，那么你的生产解决方案最终很可能会使用 fine-tuning + RAG。这没问题，这些方法可以叠加，以平衡两种方式的弱点。一些主要好处包括：

- 使用 fine-tuning 来**最小化** prompt engineering 所使用的 tokens，因为你用大量训练示例替换 instructions 和 few-shot examples，把一致行为刻进模型。
- 使用广泛 fine-tuning 来**教授复杂行为**
- 使用 RAG 来**注入 context**、更新的内容或你的用例所需的任何其他 specialized context

使用这些工具改进语言翻译

我们会继续基于上面使用过的冰岛语纠错示例进行构建。我们将测试以下方法：

- 我们最初的假设是，这是一个 behavior optimization problem，因此第一步会 fine-tune 一个模型。这里我们会同时尝试 gpt-3.5-turbo 和 gpt-4。
- 我们也会尝试 RAG。在这个场景中，我们的假设是相关示例可能提供额外 context，帮助模型解决问题，但这是一个置信度较低的优化方向。

#### Fine-tuning

为了针对我们的用例 fine-tune，我们会使用包含 1000 个示例的数据集，这些示例类似于上面的 few-shot examples：

```text
# One training example
SYSTEM: The following sentences contain Icelandic sentences which may include errors. Please correct these errors using as few word changes as possible.
USER: "Hið sameinaða fyrirtæki verður einn af stærstu bílaframleiðendum í heiminum."
ASSISTANT: "Hið sameinaða fyrirtæki verður einn af stærstu bílaframleiðendum heims."
```

我们使用这 1000 个示例来训练 gpt-3.5-turbo 和 gpt-4 fine-tuned models，并在 validation set 上重新运行 evaluation。这证实了我们的假设：两者都带来了有意义的性能提升，甚至 3.5 模型也比 few-shot gpt-4 高 8 分：

| 运行 | 方法                                      | Bleu Score |
| --- | ------------------------------------------- | ---------- |
| 1   | zero-shot 的 gpt-4                        | 62         |
| 2   | 带 3 个 few-shot examples 的 gpt-4              | 70         |
| 3   | 使用 1000 个 examples fine-tuned 的 gpt-3.5-turbo | 78         |
| 4   | 使用 1000 个 examples fine-tuned 的 gpt-4         | 87         |

很好，这开始看起来像是适合我们用例的 production level accuracy。不过，让我们测试一下能否通过向 prompt 添加一些相关 RAG examples 用于 in-context learning，再从 pipeline 中挤出一点性能。

#### RAG + Fine-tuning

我们的最终优化会添加 1000 个来自 training 和 validation sets 之外的 examples，将它们 embed 并放入 vector database。然后我们使用 gpt-4 fine-tuned model 再运行一次测试，结果可能有些出人意料：

![Icelandic case study diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-07.png)
_每种调优方法的 Bleu Score（满分 100）_

RAG 实际上**降低**了准确率，从 GPT-4 fine-tuned model 的表现下降 4 分到 83。

这说明了一个要点：要为正确的工作使用正确的优化工具。每种工具都提供收益和风险，而我们通过 evaluations 和 iterative changes 来管理它们。我们在 evals 中看到的行为，以及我们对这个问题的了解，都告诉我们这是一个 behavior optimization problem，额外 context 不一定会帮助模型。实践也证明了这一点：当模型已经通过 fine-tuning 有效学会任务时，RAG 实际上通过给它额外噪声而干扰了模型。

现在我们有了一个应该接近 production-ready 的模型。如果想进一步优化，可以考虑更多样、更大量的训练示例。

现在你应该已经理解 RAG 和 fine-tuning，以及它们各自适用的时机。关于这些工具，你最后还应该理解的是：一旦引入它们，我们在迭代速度上就会有一个 trade-off：

- 对于 RAG，你既需要调优 retrieval，也需要调优 LLM behavior
- 对于 fine-tuning，当你做额外调优时，需要重新运行 fine-tuning process，并管理 training 和 validation sets。

这两者都可能是耗时且复杂的过程。随着你的 LLM application 变得更复杂，它们可能引入 regression issues。如果你只能从本文带走一点，那就是在转向更复杂的 RAG 或 fine-tuning 之前，先尽可能从基础方法中榨出准确率。让你的 accuracy target 成为目标，而不是因为 RAG + FT 被认为最复杂就贸然采用它们。

## 多少准确率对生产来说“足够好”

对于 LLM，调优准确率可能是一场永无止境的战斗。使用现成方法，它们不太可能达到 99.999% 的准确率。本节讨论的是如何决定准确率什么时候足够：你如何对把 LLM 放入生产环境感到放心，以及如何管理你发布的解决方案的风险。

我发现同时从**业务**和**技术**语境思考这件事很有帮助。我会描述管理两者的高层方法，并使用一个 customer service help-desk 用例来说明我们如何在两个方面管理风险。

### 业务

对业务来说，在经历了 rules-based 或传统 machine learning systems 乃至人类所带来的相对确定性之后，信任 LLM 可能很难。一个失败开放且不可预测的系统，是一个很难处理的问题。

我见过一种在 customer service 用例中成功的方法。对此，我们做了以下事情：

首先，我们识别主要成功和失败情形，并为它们分配估计成本。这让我们能够清楚表达该解决方案根据 pilot performance 可能节省或造成的成本。

- 例如，一个原本由人类解决的 case 被 AI 解决，可能节省 &lt;strong&gt;$20&lt;/strong&gt;。
- 某个不该升级给人类的 case 被升级，可能花费 **$40**
- 最坏情况下，客户对 AI 非常沮丧而 churn，造成 **$1000** 成本。我们假设这种情况发生在 5% 的 cases 中。



| 事件                   | 价值 | Case 数量 | 总价值 |
| ----------------------- | ----- | --------------- | ----------- |
| AI success              | +20   | 815             | $16,300     |
| AI failure（escalation） | -40   | 175.75          | $7,030      |
| AI failure（churn）      | -1000 | 9.25            | $9,250      |
| **结果**              |       |                 | **+20**     |
| **Break-even accuracy** |       |                 | **81.5%**   |



我们做的另一件事，是衡量该流程相关的 empirical stats，这些指标会帮助我们衡量解决方案的宏观影响。仍以 customer service 为例，这些可以包括：

- 纯人工 interactions 与 AI interactions 的 CSAT score
- 对 human vs. AI 的 retrospectively reviewed cases 的 decision accuracy
- human vs. AI 的 time to resolution

在 customer service 示例中，这帮助我们在几轮 pilots 获得清晰数据后做出两个关键决策：

1. 即使我们的 LLM 解决方案升级给人类的频率高于预期，它相对于现有方案仍然节省了巨大的运营成本。这意味着即便准确率只有 85%，也可能是可以接受的，只要那 15% 主要是早期升级。
2. 在 failure 成本非常高的地方，例如 fraud case 被错误解决，我们决定由人类主导，AI 作为 assistant。在这种情况下，decision accuracy stat 帮助我们做出判断：我们对 full autonomy 并不放心。

### 技术

在技术侧，这件事更清晰：既然业务已经明确他们期望的价值，以及可能出错的成本，你的角色就是构建一个能优雅处理失败、且不会破坏用户体验的解决方案。

让我们再用一次 customer service 示例来说明，并假设我们有一个在判断 intent 上达到 85% 准确率的模型。作为技术团队，下面是几种可以最小化错误的 15% 影响的方法：

- 我们可以通过 prompt engineering 让模型在不够确定时向客户请求更多信息。这样我们的 first-time accuracy 可能会下降，但在有 2 次机会判断 intent 时，我们可能会更准确。
- 我们可以给 second-line assistant 一个选项，把流程传回 intent determination 阶段，再次为 UX 提供自愈方式，代价是增加一些用户延迟。
- 我们可以通过 prompt engineering 让模型在 intent 不清楚时 hand off 给人类。这在短期会减少一些运营节省，但长期可能抵消 customer churn risk。

这些决策随后会进入我们的 UX：为了更高准确率而变慢，或者增加更多人工介入。这些又会进入上文业务部分覆盖的成本模型。

现在你有了一种方法，可以拆解设置 accuracy target 所涉及的业务和技术决策，并让它们建立在业务现实之上。

## 继续前进

这是一个高层心智模型，用于思考如何最大化 LLM 准确率、可以使用哪些工具来实现它，以及如何判断生产环境中“足够好”的界线。你现在拥有了持续走向生产所需的框架和工具。如果你想从其他人用这些方法取得的成果中获得启发，可以看看我们的 customer stories，其中 [Morgan Stanley](https://openai.com/customer-stories/morgan-stanley) 和 [Klarna](https://openai.com/customer-stories/klarna) 等用例展示了借助这些技术可以实现什么。

祝你好运，我们很期待看到你构建出的东西！

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
### How to maximize correctness and consistent behavior when working with LLMs

Optimizing LLMs is hard.

We've worked with many developers across both start-ups and enterprises, and the reason optimization is hard consistently boils down to these reasons:

- Knowing **how to start** optimizing accuracy
- **When to use what** optimization method
- What level of accuracy is **good enough** for production

This paper gives a mental model for how to optimize LLMs for accuracy and behavior. We’ll explore methods like prompt engineering, retrieval-augmented generation (RAG) and fine-tuning. We’ll also highlight how and when to use each technique, and share a few pitfalls.

As you read through, it's important to mentally relate these principles to what accuracy means for your specific use case. This may seem obvious, but there is a difference between producing a bad copy that a human needs to fix vs. refunding a customer $1000 rather than $100. You should enter any discussion on LLM accuracy with a rough picture of how much a failure by the LLM costs you, and how much a success saves or earns you - this will be revisited at the end, where we cover how much accuracy is “good enough” for production.

## LLM optimization context

Many “how-to” guides on optimization paint it as a simple linear flow - you start with prompt engineering, then you move on to retrieval-augmented generation, then fine-tuning. However, this is often not the case - these are all levers that solve different things, and to optimize in the right direction you need to pull the right lever.

It is useful to frame LLM optimization as more of a matrix:

![Accuracy mental model diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-01.png)

The typical LLM task will start in the bottom left corner with prompt engineering, where we test, learn, and evaluate to get a baseline. Once we’ve reviewed those baseline examples and assessed why they are incorrect, we can pull one of our levers:

- **Context optimization:** You need to optimize for context when 1) the model lacks contextual knowledge because it wasn’t in its training set, 2) its knowledge is out of date, or 3) it requires knowledge of proprietary information. This axis maximizes **response accuracy**.
- **LLM optimization:** You need to optimize the LLM when 1) the model is producing inconsistent results with incorrect formatting, 2) the tone or style of speech is not correct, or 3) the reasoning is not being followed consistently. This axis maximizes **consistency of behavior**.

In reality this turns into a series of optimization steps, where we evaluate, make a hypothesis on how to optimize, apply it, evaluate, and re-assess for the next step. Here’s an example of a fairly typical optimization flow:

![Accuracy mental model journey diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-02.png)

In this example, we do the following:

- Begin with a prompt, then evaluate its performance
- Add static few-shot examples, which should improve consistency of results
- Add a retrieval step so the few-shot examples are brought in dynamically based on the question - this boosts performance by ensuring relevant context for each input
- Prepare a dataset of 50+ examples and fine-tune a model to increase consistency
- Tune the retrieval and add a fact-checking step to find hallucinations to achieve higher accuracy
- Re-train the fine-tuned model on the new training examples which include our enhanced RAG inputs

This is a fairly typical optimization pipeline for a tough business problem - it helps us decide whether we need more relevant context or if we need more consistent behavior from the model. Once we make that decision, we know which lever to pull as our first step toward optimization.

Now that we have a mental model, let’s dive into the methods for taking action on all of these areas. We’ll start in the bottom-left corner with Prompt Engineering.

### Prompt engineering

Prompt engineering is typically the best place to start\*\*. It is often the only method needed for use cases like summarization, translation, and code generation where a zero-shot approach can reach production levels of accuracy and consistency.

This is because it forces you to define what accuracy means for your use case - you start at the most basic level by providing an input, so you need to be able to judge whether or not the output matches your expectations. If it is not what you want, then the reasons **why** will show you what to use to drive further optimizations.

To achieve this, you should always start with a simple prompt and an expected output in mind, and then optimize the prompt by adding **context**, **instructions**, or **examples** until it gives you what you want.

#### Optimization

To optimize your prompts, I’ll mostly lean on strategies from the [Prompt Engineering guide](https://developers.openai.com/api/docs/guides/prompt-engineering) in the OpenAI API documentation. Each strategy helps you tune Context, the LLM, or both:

| Strategy                                  | Context optimization | LLM optimization |
| ----------------------------------------- | :------------------: | :--------------: |
| Write clear instructions                  |                      |        X         |
| Split complex tasks into simpler subtasks |          X           |        X         |
| Give GPTs time to "think"                 |                      |        X         |
| Test changes systematically               |          X           |        X         |
| Provide reference text                    |          X           |                  |
| Use external tools                        |          X           |                  |

These can be a little difficult to visualize, so we’ll run through an example where we test these out with a practical example. Let’s use gpt-4-turbo to correct Icelandic sentences to see how this can work.

Prompt engineering for language corrections 

The [Icelandic Errors Corpus](https://repository.clarin.is/repository/xmlui/handle/20.500.12537/105) contains combinations of an Icelandic sentence with errors, and the corrected version of that sentence. We’ll use the baseline GPT-4 model to try to solve this task, and then apply different optimization techniques to see how we can improve the model’s performance.

Given an Icelandic sentence, we want the model to return a corrected version of the sentence. We’ll use Bleu score to measure the relative quality of the translation.

<div className="icelandic-zero-shot-table">

| system                                                                                                                                           | user                                                        | ground_truth                                               | assistant                                                  | BLEU |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---- |
| The following sentences contain Icelandic sentences which may include errors. Please correct these errors using as few word changes as possible. | Sörvistölur eru nær hálsi og skartgripir kvenna á brjótsti. | Sörvistölur eru nær hálsi og skartgripir kvenna á brjósti. | Sörvistölur eru nær hálsi og skartgripir kvenna á brjósti. | 1.0  |

</div>

We perform a first attempt with GPT-4 with no examples, and it performs decently, getting a BLEU score of 62.
We’ll now add some few-shot examples and see whether we can teach the model the style we’re looking for by showing rather than telling.
An example looks like this:

```example-chat
SYSTEM: The following sentences contain Icelandic sentences which may include errors. Please correct these errors using as few word changes as possible.

# Examples
USER: "Stofnendurnir séu margir og eru fulltrúar hennar frá Englandi, Grikklandi, Rússlandi, Svíþjóð og fleiri löndum Evrópu."
ASSISTANT: "Hann segir að stofnendur leynireglunnar séu margir og að fulltrúar hennar séu frá Englandi, Grikklandi, Rússlandi, Svíþjóð og fleiri löndum Evrópu."

USER: "Helsta fæða bjúgorma eru hægfara lífverur sem eru á sama búsvæði og bjúgormarnir, oft smærri ormar eins og burstormar (fræðiheiti: Polychatete)."
ASSISTANT: "Helsta fæða bjúgorma eru hægfara lífverur sem eru á sama búsvæði og bjúgormarnir, oft smærri ormar eins og burstaormar (fræðiheiti: Polychatete)."

USER: "Sörvistölur eru nær hálsi og skartgripir kvenna á brjótsti."
ASSISTANT: "Sörvistölur eru nær hálsi og skartgripir kvenna á brjósti."

USER: [input user query here]
```

The overall translation quality is better, showing an improvement to a Bleu score of **70 (+8%)**. This is pretty good, and shows us that giving the model examples of the task is helping it to learn.

This tells us that it is the **behavior** of the model that we need to optimize - it already has the knowledge that it needs to solve the problem, so providing many more examples may be the optimization we need.

We’ll revisit this later in the paper to test how our more advanced optimization methods play with this use case.

We’ve seen that prompt engineering is a great place to start, and that with the right tuning methods we can push the performance pretty far.

However, the biggest issue with prompt engineering is that it often doesn’t scale - we either need dynamic context to be fed to allow the model to deal with a wider range of problems than we can deal with through adding content to the context, or we need more consistent behavior than we can achieve with few-shot examples.



Long-context models allow prompt engineering to scale further - however,
  beware that models can struggle to maintain attention across very large
  prompts with complex instructions, and so you should always pair long context
  models with evaluation at different context sizes to ensure you don’t get
  [**lost in the middle**](https://arxiv.org/abs/2307.03172). "Lost in the
  middle" is a term that addresses how an LLM can't pay equal attention to all
  the tokens given to it at any one time. This can result in it missing
  information seemingly randomly. This doesn't mean you shouldn't use long
  context, but you need to pair it with thorough evaluation. One open-source
  contributor, Greg Kamradt, made a useful evaluation called [**Needle in A
  Haystack (NITA)**](https://github.com/gkamradt/LLMTest_NeedleInAHaystack)
  which hid a piece of information at varying depths in long-context documents
  and evaluated the retrieval quality. This illustrates the problem with
  long-context - it promises a much simpler retrieval process where you can dump
  everything in context, but at a cost in accuracy.



So how far can you really take prompt engineering? The answer is that it depends, and the way you make your decision is through evaluations.

### Evaluation

This is why **a good prompt with an evaluation set of questions and ground truth answers** is the best output from this stage. If we have a set of 20+ questions and answers, and we have looked into the details of the failures and have a hypothesis of why they’re occurring, then we’ve got the right baseline to take on more advanced optimization methods.

Before you move on to more sophisticated optimization methods, it's also worth considering how to automate this evaluation to speed up your iterations. Some common practices we’ve seen be effective here are:

- Using approaches like [ROUGE](https://aclanthology.org/W04-1013/) or [BERTScore](https://arxiv.org/abs/1904.09675) to provide a finger-in-the-air judgment. This doesn’t correlate that closely with human reviewers, but can give a quick and effective measure of how much an iteration changed your model outputs.
- Using [GPT-4](https://arxiv.org/pdf/2303.16634.pdf) as an evaluator as outlined in the G-Eval paper, where you provide the LLM a scorecard to assess the output as objectively as possible.

If you want to dive deeper on these, check out [this cookbook](https://developers.openai.com/cookbook/examples/evaluation/how_to_eval_abstractive_summarization) which takes you through all of them in practice.

## Understanding the tools

So you’ve done prompt engineering, you’ve got an eval set, and your model is still not doing what you need it to do. The most important next step is to diagnose where it is failing, and what tool works best to improve it.

Here is a basic framework for doing so:

![Classifying memory problem diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-03.png)

You can think of framing each failed evaluation question as an **in-context** or **learned** memory problem. As an analogy, imagine writing an exam. There are two ways you can ensure you get the right answer:

- You attend class for the last 6 months, where you see many repeated examples of how a particular concept works. This is **learned** memory - you solve this with LLMs by showing examples of the prompt and the response you expect, and the model learning from those.
- You have the textbook with you, and can look up the right information to answer the question with. This is **in-context** memory - we solve this in LLMs by stuffing relevant information into the context window, either in a static way using prompt engineering, or in an industrial way using RAG.

These two optimization methods are **additive, not exclusive** - they stack, and some use cases will require you to use them together to use optimal performance.

Let’s assume that we’re facing a short-term memory problem - for this we’ll use RAG to solve it.

### Retrieval-augmented generation (RAG)

RAG is the process of **R**etrieving content to **A**ugment your LLM’s prompt before **G**enerating an answer. It is used to give the model **access to domain-specific context** to solve a task.

RAG is an incredibly valuable tool for increasing the accuracy and consistency of an LLM - many of our largest customer deployments at OpenAI were done using only prompt engineering and RAG.

![RAG diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-04.png)

In this example we have embedded a knowledge base of statistics. When our user asks a question, we embed that question and retrieve the most relevant content from our knowledge base. This is presented to the model, which answers the question.

RAG applications introduce a new axis we need to optimize against, which is retrieval. For our RAG to work, we need to give the right context to the model, and then assess whether the model is answering correctly. I’ll frame these in a grid here to show a simple way to think about evaluation with RAG:

![RAG evaluation diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-05.png)

You have two areas your RAG application can break down:

| Area      | Problem                                                                                                                                                                               | Resolution                                                                                                                                                                                                                                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Retrieval | You can supply the wrong context, so the model can’t possibly answer, or you can supply too much irrelevant context, which drowns out the real information and causes hallucinations. | Optimizing your retrieval, which can include:<br/>- Tuning the search to return the right results.<br/>- Tuning the search to include less noise.<br/>- Providing more information in each retrieved result<br/>These are just examples, as tuning RAG performance is an industry into itself, with libraries like LlamaIndex and LangChain giving many approaches to tuning here. |
| LLM       | The model can also get the right context and do the wrong thing with it.                                                                                                              | Prompt engineering by improving the instructions and method the model uses, and, if showing it examples increases accuracy, adding in fine-tuning                                                                                                                                                                                                                                  |

The key thing to take away here is that the principle remains the same from our mental model at the beginning - you evaluate to find out what has gone wrong, and take an optimization step to fix it. The only difference with RAG is you now have the retrieval axis to consider.

While useful, RAG only solves our in-context learning issues - for many use cases, the issue will be ensuring the LLM can learn a task so it can perform it consistently and reliably. For this problem we turn to fine-tuning.

### Fine-tuning

To solve a learned memory problem, many developers will continue the training process of the LLM on a smaller, domain-specific dataset to optimize it for the specific task. This process is known as **fine-tuning**.

Fine-tuning is typically performed for one of two reasons:

- **To improve model accuracy on a specific task:** Training the model on task-specific data to solve a learned memory problem by showing it many examples of that task being performed correctly.
- **To improve model efficiency:** Achieve the same accuracy for less tokens or by using a smaller model.

The fine-tuning process begins by preparing a dataset of training examples - this is the most critical step, as your fine-tuning examples must exactly represent what the model will see in the real world.

Many customers use a process known as **prompt baking**, where you extensively
  log your prompt inputs and outputs during a pilot. These logs can be pruned
  into an effective training set with realistic examples.

![Fine-tuning process diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-06.png)

Once you have this clean set, you can train a fine-tuned model by performing a **training** run - depending on the platform or framework you’re using for training you may have hyperparameters you can tune here, similar to any other machine learning model. We always recommend maintaining a hold-out set to use for **evaluation** following training to detect overfitting. For tips on how to construct a good training set you can check out the [guidance](https://developers.openai.com/api/docs/guides/fine-tuning#analyzing-your-fine-tuned-model) in our Fine-tuning documentation. Once training is completed, the new, fine-tuned model is available for inference.

For optimizing fine-tuning we’ll focus on best practices we observe with OpenAI’s model customization offerings, but these principles should hold true with other providers and OSS offerings. The key practices to observe here are:

- **Start with prompt-engineering:** Have a solid evaluation set from prompt engineering which you can use as a baseline. This allows a low-investment approach until you’re confident in your base prompt.
- **Start small, focus on quality:** Quality of training data is more important than quantity when fine-tuning on top of a foundation model. Start with 50+ examples, evaluate, and then dial your training set size up if you haven’t yet hit your accuracy needs, and if the issues causing incorrect answers are due to consistency/behavior and not context.
- **Ensure your examples are representative:** One of the most common pitfalls we see is non-representative training data, where the examples used for fine-tuning differ subtly in formatting or form from what the LLM sees in production. For example, if you have a RAG application, fine-tune the model with RAG examples in it so it isn’t learning how to use the context zero-shot.

### All of the above

These techniques stack on top of each other - if your early evals show issues with both context and behavior, then it's likely you may end up with fine-tuning + RAG in your production solution. This is ok - these stack to balance the weaknesses of both approaches. Some of the main benefits are:

- Using fine-tuning to **minimize the tokens** used for prompt engineering, as you replace instructions and few-shot examples with many training examples to ingrain consistent behaviour in the model.
- **Teaching complex behavior** using extensive fine-tuning
- Using RAG to **inject context**, more recent content or any other specialized context required for your use cases

Using these tools to improve language translation

We’ll continue building on the Icelandic correction example we used above. We’ll test out the following approaches:

- Our original hypothesis was that this was a behavior optimization problem, so our first step will be to fine-tune a model. We’ll try both gpt-3.5-turbo and gpt-4 here.
- We’ll also try RAG - in this instance our hypothesis is that relevant examples might give additional context which could help the model solve the problem, but this is a lower confidence optimization.

#### Fine-tuning

To fine-tune for our use-case we’ll use a dataset of 1000 examples similar to our few-shot examples above:

```example-chat
# One training example
SYSTEM: The following sentences contain Icelandic sentences which may include errors. Please correct these errors using as few word changes as possible.
USER: "Hið sameinaða fyrirtæki verður einn af stærstu bílaframleiðendum í heiminum."
ASSISTANT: "Hið sameinaða fyrirtæki verður einn af stærstu bílaframleiðendum heims."
```

We use these 1000 examples to train both gpt-3.5-turbo and gpt-4 fine-tuned models, and rerun our evaluation on our validation set. This confirmed our hypothesis - we got a meaningful bump in performance with both, with even the 3.5 model outperforming few-shot gpt-4 by 8 points:

| Run | Method                                      | Bleu Score |
| --- | ------------------------------------------- | ---------- |
| 1   | gpt-4 with zero-shot                        | 62         |
| 2   | gpt-4 with 3 few-shot examples              | 70         |
| 3   | gpt-3.5-turbo fine-tuned with 1000 examples | 78         |
| 4   | gpt-4 fine-tuned with 1000 examples         | 87         |

Great, this is starting to look like production level accuracy for our use case. However, let's test whether we can squeeze a little more performance out of our pipeline by adding some relevant RAG examples to the prompt for in-context learning.

#### RAG + Fine-tuning

Our final optimization adds 1000 examples from outside of the training and validation sets which are embedded and placed in a vector database. We then run a further test with our gpt-4 fine-tuned model, with some perhaps surprising results:

![Icelandic case study diagram](https://cdn.openai.com/API/docs/images/diagram-optimizing-accuracy-07.png)
_Bleu Score per tuning method (out of 100)_

RAG actually **decreased** accuracy, dropping four points from our GPT-4 fine-tuned model to 83.

This illustrates the point that you use the right optimization tool for the right job - each offers benefits and risks that we manage with evaluations and iterative changes. The behavior we witnessed in our evals and from what we know about this question told us that this is a behavior optimization problem where additional context will not necessarily help the model. This was borne out in practice - RAG actually confounded the model by giving it extra noise when it had already learned the task effectively through fine-tuning.

We now have a model that should be close to production-ready, and if we want to optimize further we can consider a wider diversity and quantity of training examples.

Now you should have an appreciation for RAG and fine-tuning, and when each is appropriate. The last thing you should appreciate with these tools is that once you introduce them there is a trade-off here in our speed to iterate:

- For RAG you need to tune the retrieval as well as LLM behavior
- With fine-tuning you need to rerun the fine-tuning process and manage your training and validation sets when you do additional tuning.

Both of these can be time-consuming and complex processes, which can introduce regression issues as your LLM application becomes more complex. If you take away one thing from this paper, let it be to squeeze as much accuracy out of basic methods as you can before reaching for more complex RAG or fine-tuning - let your accuracy target be the objective, not jumping for RAG + FT because they are perceived as the most sophisticated.

## How much accuracy is “good enough” for production

Tuning for accuracy can be a never-ending battle with LLMs - they are unlikely to get to 99.999% accuracy using off-the-shelf methods. This section is all about deciding when is enough for accuracy - how do you get comfortable putting an LLM in production, and how do you manage the risk of the solution you put out there.

I find it helpful to think of this in both a **business** and **technical** context. I’m going to describe the high level approaches to managing both, and use a customer service help-desk use case to illustrate how we manage our risk in both cases.

### Business

For the business it can be hard to trust LLMs after the comparative certainties of rules-based or traditional machine learning systems, or indeed humans! A system where failures are open-ended and unpredictable is a difficult circle to square.

An approach I’ve seen be successful here was for a customer service use case - for this, we did the following:

First we identify the primary success and failure cases, and assign an estimated cost to them. This gives us a clear articulation of what the solution is likely to save or cost based on pilot performance.

- For example, a case getting solved by an AI where it was previously solved by a human may save <strong>$20</strong>.
- Someone getting escalated to a human when they shouldn’t might cost **$40**
- In the worst case scenario, a customer gets so frustrated with the AI they churn, costing us **$1000**. We assume this happens in 5% of cases.

<center>

| Event                   | Value | Number of cases | Total value |
| ----------------------- | ----- | --------------- | ----------- |
| AI success              | +20   | 815             | $16,300     |
| AI failure (escalation) | -40   | 175.75          | $7,030      |
| AI failure (churn)      | -1000 | 9.25            | $9,250      |
| **Result**              |       |                 | **+20**     |
| **Break-even accuracy** |       |                 | **81.5%**   |

</center>

The other thing we did is to measure the empirical stats around the process which will help us measure the macro impact of the solution. Again using customer service, these could be:

- The CSAT score for purely human interactions vs. AI ones
- The decision accuracy for retrospectively reviewed cases for human vs. AI
- The time to resolution for human vs. AI

In the customer service example, this helped us make two key decisions following a few pilots to get clear data:

1. Even if our LLM solution escalated to humans more than we wanted, it still made an enormous operational cost saving over the existing solution. This meant that an accuracy of even 85% could be ok, if those 15% were primarily early escalations.
2. Where the cost of failure was very high, such as a fraud case being incorrectly resolved, we decided the human would drive and the AI would function as an assistant. In this case, the decision accuracy stat helped us make the call that we weren’t comfortable with full autonomy.

### Technical

On the technical side it is more clear - now that the business is clear on the value they expect and the cost of what can go wrong, your role is to build a solution that handles failures gracefully in a way that doesn’t disrupt the user experience.

Let’s use the customer service example one more time to illustrate this, and we’ll assume we’ve got a model that is 85% accurate in determining intent. As a technical team, here are a few ways we can minimize the impact of the incorrect 15%:

- We can prompt engineer the model to prompt the customer for more information if it isn’t confident, so our first-time accuracy may drop but we may be more accurate given 2 shots to determine intent.
- We can give the second-line assistant the option to pass back to the intent determination stage, again giving the UX a way of self-healing at the cost of some additional user latency.
- We can prompt engineer the model to hand off to a human if the intent is unclear, which costs us some operational savings in the short-term but may offset customer churn risk in the long term.

Those decisions then feed into our UX, which gets slower at the cost of higher accuracy, or more human interventions, which feed into the cost model covered in the business section above.

You now have an approach to breaking down the business and technical decisions involved in setting an accuracy target that is grounded in business reality.

## Taking this forward

This is a high level mental model for thinking about maximizing accuracy for LLMs, the tools you can use to achieve it, and the approach for deciding where enough is enough for production. You have the framework and tools you need to get to production consistently, and if you want to be inspired by what others have achieved with these methods then look no further than our customer stories, where use cases like [Morgan Stanley](https://openai.com/customer-stories/morgan-stanley) and [Klarna](https://openai.com/customer-stories/klarna) show what you can achieve by leveraging these techniques.

Best of luck, and we’re excited to see what you build with this!
``````
:::
:::

