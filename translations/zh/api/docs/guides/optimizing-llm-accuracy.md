---
status: needs-review
sourceId: "288eef564ba9"
sourceChecksum: "288eef564ba924fc7b0c2a06dc9e3eff60293a6c4669881bfc1ce040ddb127fe"
sourceUrl: "https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy"
translatedAt: "2026-06-27T18:00:38.1935616+08:00"
translator: codex-gpt-5.5-xhigh
---

# 优化 LLM 准确率

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

为了优化你的 prompts，我主要会依赖 OpenAI API 文档中 [Prompt Engineering guide](https://developers.openai.com/api/docs/guides/prompt-engineering) 的策略。每种策略都会帮助你调优 Context、LLM，或两者：

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

<div className="icelandic-zero-shot-table">

| system                                                                                                                                           | user                                                        | ground_truth                                               | assistant                                                  | BLEU |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---- |
| The following sentences contain Icelandic sentences which may include errors. Please correct these errors using as few word changes as possible. | Sörvistölur eru nær hálsi og skartgripir kvenna á brjótsti. | Sörvistölur eru nær hálsi og skartgripir kvenna á brjósti. | Sörvistölur eru nær hálsi og skartgripir kvenna á brjósti. | 1.0  |

</div>

我们对 GPT-4 进行第一次尝试，不提供任何 examples，它表现还不错，得到 62 的 BLEU score。
现在我们会添加一些 few-shot 示例，看看是否能通过展示而不是告知，让模型学会我们想要的风格。
示例如下：

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
| Retrieval | 你可能提供错误 context，导致模型根本无法回答；或者你可能提供太多无关 context，淹没真正的信息并造成 hallucinations。 | 优化 retrieval，这可以包括：<br/>- 调整 search，使其返回正确结果。<br/>- 调整 search，使其包含更少噪声。<br/>- 在每个 retrieved result 中提供更多信息。<br/>这些只是示例，因为调优 RAG 性能本身已经成为一个行业，LlamaIndex 和 LangChain 等库提供了许多调优方法。 |
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

```example-chat
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

- 例如，一个原本由人类解决的 case 被 AI 解决，可能节省 <strong>$20</strong>。
- 某个不该升级给人类的 case 被升级，可能花费 **$40**
- 最坏情况下，客户对 AI 非常沮丧而 churn，造成 **$1000** 成本。我们假设这种情况发生在 5% 的 cases 中。

<center>

| 事件                   | 价值 | Case 数量 | 总价值 |
| ----------------------- | ----- | --------------- | ----------- |
| AI success              | +20   | 815             | $16,300     |
| AI failure（escalation） | -40   | 175.75          | $7,030      |
| AI failure（churn）      | -1000 | 9.25            | $9,250      |
| **结果**              |       |                 | **+20**     |
| **Break-even accuracy** |       |                 | **81.5%**   |

</center>

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
