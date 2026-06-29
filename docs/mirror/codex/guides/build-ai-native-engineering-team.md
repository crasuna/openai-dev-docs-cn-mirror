---
title: "构建 AI-Native 工程团队"
description: "How coding agents speed up the software development lifecycle"
outline: deep
---

# 构建 AI-Native 工程团队

**文档集**：Codex<br>
**分组**：指南<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/guides/build-ai-native-engineering-team](https://developers.openai.com/codex/guides/build-ai-native-engineering-team)
- Markdown 来源：[https://developers.openai.com/codex/guides/build-ai-native-engineering-team.md](https://developers.openai.com/codex/guides/build-ai-native-engineering-team.md)
- 抓取时间：2026-06-27T05:55:00.009Z
- Checksum：`4190b9b7b3780072c8bdbda909795a0180f1da280e7f307a37314e95fdc54c42`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 引言

AI models 正在迅速扩展它们可以执行的任务范围，并对工程产生重大影响。前沿系统现在可以维持数小时级推理：截至 2025 年 8 月，METR 发现领先模型可以完成 **2 小时 17 分钟** 的连续工作，并以大约 **50% 置信度** 产出正确答案。

这种能力正在快速提升，任务长度大约每七个月翻一番。仅仅几年前，模型只能处理大约 30 秒的推理，这足以给出小型代码建议。如今，随着模型可以维持更长的推理链，整个软件开发生命周期都有可能纳入 AI assistance 的范围，使 coding agents 能够有效参与规划、设计、开发、测试、代码审查和部署。

![][image1]在本指南中，我们将分享真实示例，概述 AI agents 如何为软件开发生命周期做出贡献，并给出工程领导者今天可以采取哪些实际措施来开始构建 AI-native 团队和流程。

## AI Coding：从 Autocomplete 到 Agents

AI coding tools 已经远远超出最初作为 autocomplete assistants 的形态。早期工具处理的是快速任务，例如建议下一行代码或补全函数模板。随着模型获得更强的推理能力，开发者开始通过 IDE 中的 chat interfaces 与 agents 互动，用于 pair programming 和代码探索。

今天的 coding agents 可以生成整个文件、搭建新项目，并将设计转换为代码。它们可以推理调试或重构等多步骤问题，agent 执行也正从单个开发者机器转移到基于云的 multi-agent environments。这正在改变开发者的工作方式，使他们花更少时间在 IDE 中与 agent 一起生成代码，转而花更多时间委托整个 workflows。

| 能力                              | 它带来的可能性                                                                                                                                                    |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **跨系统统一上下文**              | 单个模型可以读取代码、配置和 telemetry，在以前需要独立工具的各层之间提供一致推理。                                                                                |
| **结构化工具执行**                | 模型现在可以直接调用 compilers、test runners 和 scanners，产出可验证结果，而不是静态建议。                                                                        |
| **持久项目记忆**                  | 长上下文窗口和 compaction 等技术让模型可以从提案到部署跟进一个 feature，记住之前的设计选择和约束。                                                               |
| **评估循环**                      | 模型输出可以自动根据 benchmarks 测试，例如 unit tests、latency targets 或 style guides，因此改进建立在可衡量质量之上。                                           |

在 OpenAI，我们已经亲眼见证了这一点。开发周期已经加速，过去需要数周的工作现在可以在数天内交付。团队能更轻松地跨 domains 移动，更快上手不熟悉的项目，并在组织中以更高敏捷性和自主性运行。从记录新代码和暴露相关测试，到维护依赖和清理 feature flags，许多常规且耗时的任务现在已经完全委托给 Codex。

然而，工程的一些方面并没有改变。代码的真正 ownership，尤其是对于新的或模糊的问题，仍然在工程师手中；某些挑战也超出了当前模型的能力。但借助 Codex 这样的 coding agents，工程师现在可以把更多时间投入复杂且新颖的挑战，专注于设计、架构和系统级推理，而不是调试或机械实现。

在以下 sections 中，我们会拆解 SDLC 的每个阶段如何随 coding agents 改变，并概述你的团队可以采取哪些具体步骤，开始作为 AI-native engineering org 运作。

## 1. 规划

组织中的团队通常依赖工程师来判断某个 feature 是否可行、构建需要多长时间，以及会涉及哪些系统或团队。尽管任何人都可以起草 specification，但形成准确计划通常需要深入了解代码库，并与工程进行多轮迭代，以发现 requirements、澄清边界情况，并就技术上现实可行的内容达成一致。

### Coding agents 如何帮助

AI coding agents 在规划和范围界定期间，为团队提供即时的、具备代码意识的 insights。例如，团队可以构建 workflows，将 coding agents 连接到 issue-tracking systems，以读取 feature specification、与代码库交叉引用，然后标记歧义、将工作拆分为子组件，或估算难度。

Coding agents 还可以立即追踪 code paths，显示某个 feature 涉及哪些 services。过去这项工作往往需要手动在大型代码库中挖掘数小时或数天。

### 工程师转而做什么

团队会把更多时间用于核心 feature 工作，因为 agents 会暴露过去需要通过产品对齐和范围界定会议才能获得的上下文。关键实现细节、依赖和边界情况会预先识别，从而减少会议并加快决策。

| 委托                                                                                                                                                                                                                  | 审查                                                                                                                                                                                                                                      | 拥有                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI agents 可以对可行性和架构分析进行第一轮处理。它们读取 specification，将其映射到代码库，识别依赖，并暴露需要澄清的歧义或边界情况。                                                                             | 团队审查 agent 的发现，以验证准确性、评估完整性，并确保估算反映真实技术约束。Story point 分配、工作量评估和识别非显而易见风险仍然需要人类判断。                              | 战略决策，例如优先级、长期方向、排序和取舍，仍由人类主导。团队可以要求 agent 提供选项或下一步，但规划和产品方向的最终责任仍由组织承担。                                                       |

### 入门检查清单

- 识别需要在 features 和 source code 之间对齐的常见流程。常见领域包括 feature scoping 和 ticket creation。
- 从实现基础 workflows 开始，例如标记和去重 issues 或 feature requests。
- 考虑更高级 workflows，例如根据初始 feature description 向 ticket 添加 sub-tasks。或者在 ticket 到达特定阶段时启动 agent run，用更多细节补充描述。



## 2. 设计

设计阶段常常被基础设置工作拖慢。团队会花大量时间连接 boilerplate、集成 design systems，并细化 UI components 或 flows。Mockups 与实现之间的不一致会造成返工和漫长反馈周期，而探索替代方案或适应变化需求的带宽有限，也会延迟设计验证。

### Coding agents 如何帮助

AI coding tools 可以通过搭建 boilerplate code、构建项目结构，并即时实现 design tokens 或 style guides，大幅加速 prototyping。工程师可以用自然语言描述所需 features 或 UI layouts，并收到符合团队 conventions 的 prototype code 或 component stubs。

它们可以将 designs 直接转换为代码、建议 accessibility improvements，甚至分析代码库中的 user flows 或 edge cases。这使团队能够在数小时而非数天内迭代多个 prototypes，并在早期以高保真方式 prototyping，为决策提供更清晰的基础，并让 customer testing 更早进入流程。

### 工程师转而做什么

随着 agents 处理常规设置和转换任务，团队可以把注意力转向更高杠杆的工作。工程师专注于细化核心逻辑、建立可扩展的架构模式，并确保 components 符合质量和可靠性标准。设计师可以花更多时间评估 user flows 和探索替代概念。协作重心从实现开销转向改进底层产品体验。

| 委托                                                                                                                                                                             | 审查                                                                                                                                                                       | 拥有                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Agents 通过搭建项目、生成 boilerplate code、将 mockups 转换为 components，以及应用 design tokens 或 style guides，处理初始实现工作。                                           | 团队审查 agent 输出，确保 components 遵循设计 conventions，符合质量和 accessibility standards，并能正确集成到现有系统。                                                   | 团队拥有整体 design system、UX patterns、架构决策，以及用户体验的最终方向。                                                         |

### 入门检查清单

- 使用同时接受文本和图像输入的 multi-modal coding agent
- 通过 MCP 将设计工具与 coding agents 集成
- 通过 MCP 以编程方式暴露 component libraries，并将它们与你的 coding model 集成
- 构建 workflows，将 designs → components → components implementation 映射起来
- 使用 typed languages（例如 Typescript）为 agent 定义有效 props 和 subcomponents


## 3. 构建

构建阶段是团队最容易感到摩擦的地方，也是 coding agents 影响最清晰的地方。工程师花大量时间将 specs 转换为代码结构、连接 services、在代码库中重复 patterns，并填写 boilerplate；即便是小 features，也可能需要数小时忙碌工作。

随着系统增长，这种摩擦会叠加。大型 monorepos 会积累 patterns、conventions 和历史惯例，拖慢贡献者速度。工程师花在重新发现做某件事的「正确方式」上的时间，可能与实现 feature 本身一样多。在 specs、code search、build errors、test failures 和 dependency management 之间不断切换上下文，会增加认知负担，而长时间运行任务中的打断也会破坏 flow 并进一步延迟交付。

### Coding agents 如何帮助

在 IDE 和 CLI 中运行的 coding agents 通过处理更大规模、多步骤实现任务，加速构建阶段。它们不只是产出下一个函数或文件，而是可以在一次协调运行中端到端产出完整 features：data models、APIs、UI components、tests 和 documentation。借助横跨整个代码库的持续推理，它们可以处理过去需要工程师手动追踪 code paths 才能做出的决策。

对于长时间运行的任务，agents 可以：

- 根据书面 spec 起草完整 feature implementations。
- 在数十个文件中搜索和修改代码，同时保持一致性。
- 生成符合 conventions 的 boilerplate，例如 error handling、telemetry、security wrappers 或 style patterns。
- 在 build errors 出现时修复它们，而不是暂停等待人工干预。
- 将 tests 与 implementation 作为单个 workflow 的一部分一并编写。
- 产出遵循内部 guidelines、并包含 PR messages 的 diff-ready changesets。

实践中，这会把大量机械性的「构建工作」从工程师转移给 agents。Agent 成为第一轮实现者；工程师成为审查者、编辑者和方向来源。

### 工程师转而做什么

当 agents 能够可靠执行多步骤构建任务时，工程师会把注意力转向更高阶工作：

- 在实现前澄清产品行为、边界情况和 specs。
- 审查 AI-generated code 的架构影响，而不是执行机械 wiring。
- 细化需要深度 domain reasoning 的 business logic 和 performance-critical paths。
- 设计指导 agent-generated code 的 patterns、guardrails 和 conventions。
- 与 PMs 和 design 协作迭代 feature intent，而不是 boilerplate。

工程师不再只是把 feature spec「翻译」成代码，而是专注于正确性、一致性、可维护性和长期质量，这些仍是人类上下文最重要的领域。

| 委托                                                                                                                                                                                                                                                   | 审查                                                                                                                                                                                                                             | 拥有                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agents 为定义清晰的 features 起草第一轮 implementation pass，包括 scaffolding、CRUD logic、wiring、refactors 和 tests。随着长时间推理能力提升，这会越来越多地覆盖完整端到端 builds，而不是孤立 snippets。                                      | 工程师评估设计选择、性能、安全、迁移风险和 domain alignment，同时纠正 agent 可能漏掉的细微问题。他们塑造并细化 AI-generated code，而不是执行机械工作。              | 工程师保留需要深度系统直觉的工作 ownership：新 abstractions、cross-cutting architectural changes、模糊产品需求和长期可维护性取舍。随着 agents 承担更长任务，工程从逐行实现转向迭代式监督。                                                       |

示例：

Cloudwalk 的工程师、PMs、设计师和 operators 每天使用 Codex 将 specs 转化为可运行代码，无论他们需要的是脚本、新 fraud rule，还是数分钟内交付的完整 microservice。它从构建阶段移除忙碌工作，让每位员工都能以惊人的速度实现想法。

### 入门检查清单

- 从 well specified tasks 开始
- 让 agent 通过 MCP 使用 planning tool，或通过编写并提交到代码库的 PLAN.md 文件来规划
- 检查 agent 尝试执行的命令是否成功
- 迭代 AGENTS.md 文件，解锁诸如运行 tests 和 linters 以接收反馈的 agentic loops


## 4. 测试

开发者经常难以确保足够的 test coverage，因为编写和维护全面测试需要时间、上下文切换，以及对边界情况的深入理解。团队经常在快速推进与编写彻底测试之间取舍。当期限逼近时，test coverage 往往最先受影响。

即使已经编写 tests，随着代码演进保持它们更新也会带来持续摩擦。Tests 可能变得脆弱、失败原因不清，并且随着底层产品变化而需要自身的大规模重构。高质量 tests 让团队能够更快、更有信心地交付。

### Coding agents 如何帮助

AI coding tools 可以用几种有力方式帮助开发者编写更好的 tests。首先，它们可以在读取 requirements document 和 feature code logic 后建议 test cases。模型在建议 edge cases 和 failure modes 方面可能出人意料地擅长，尤其是在开发者已经深度聚焦 feature、需要第二意见时。

此外，随着代码演进，模型可以帮助 tests 保持最新，减少重构摩擦并避免 stale tests 变得 flaky。通过处理 test writing 的基本实现细节并暴露 edge cases，coding agents 加速了测试开发流程。

### 工程师转而做什么

用 AI tools 编写 tests 并不意味着开发者不再需要思考测试。事实上，随着 agents 移除生成代码的障碍，tests 作为应用功能 source of truth 的作用会越来越重要。由于 agents 可以运行 test suite 并根据输出迭代，定义高质量 tests 通常是允许 agent 构建 feature 的第一步。

相反，开发者会更专注于观察 test coverage 中的高层 patterns，并在模型识别 test cases 的基础上补充和质疑。让 test writing 更快，可以让开发者更快交付 features，也能承担更有雄心的 features。

| 委托                                                                                                                                                                                                                                                                          | 审查                                                                                                                                                                                                                                                                                                                                            | 拥有                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 工程师会委托模型根据 feature specifications 生成 test cases 的初稿。他们也会使用模型先生成 tests。让模型在与 feature implementation 分开的 session 中生成 tests 往往很有帮助。                              | 工程师仍必须彻底审查 model-generated tests，确保模型没有走捷径或实现 stubbed tests。工程师还要确保 tests 可由 agents 运行；agent 具备合适的运行权限，并且 agent 对它可以运行的不同 test suites 有上下文意识。      | 工程师拥有让 test coverage 与 feature specifications 和 user experience expectations 对齐的责任。对抗性思维、映射 edge cases 的创造力，以及对 tests intent 的关注仍然是关键技能。                                  |

### 入门检查清单

- 引导模型把 tests 作为单独步骤实现，并验证新 tests 在进入 feature implementation 前会失败。
- 在你的 AGENTS.md 文件中设置 test coverage guidelines
- 给 agent 提供它可以调用的 code coverage tools 的具体示例，以理解 test coverage


## 5. 审查

平均而言，开发者每周花 2-5 小时进行代码审查。团队经常需要在投入大量时间进行深入审查，和对看起来很小的变更进行「足够好」的快速审查之间做选择。当这种优先级判断失准时，bug 会进入生产环境，给用户造成问题并带来大量返工。

### Coding agents 如何帮助

Coding agents 让 code review process 可以扩展，使每个 PR 都能获得一致的基线关注。不同于传统 static analysis tools（依赖 pattern matching 和 rule-based checks），AI reviewers 可以实际执行部分代码、解释 runtime behavior，并跨文件和 services 追踪逻辑。不过，要发挥效果，模型必须专门训练来识别 P0 和 P1 级 bugs，并调优为提供简洁、高信号反馈；过于冗长的 responses 和嘈杂 lint warnings 一样容易被忽略。

### 工程师转而做什么

在 OpenAI，我们发现 AI code review 让工程师更有信心，相信自己不会把重大 bugs 发到生产环境。Code review 经常会捕获贡献者可以在拉入另一位工程师前修正的问题。Code review 不一定让 pull request process 更快，尤其是当它发现有意义的 bugs 时，但它确实可以防止缺陷和故障。

### 委托 vs 审查 vs 拥有

即使有 AI code review，工程师仍负责确保代码准备好交付。实际上，这意味着阅读并理解变更的影响。工程师将初始 code review 委托给 agent，但拥有最终 review 和 merge process。

| 委托                                                                                                                                                    | 审查                                                                                                                                                                                                                           | 拥有                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 工程师将初始 coding review 委托给 agents。这可能在 pull request 被标记为 ready for review by a teammate 之前发生多次。                                  | 工程师仍然审查 pull requests，但更强调架构对齐：是否实现了 composable patterns，是否使用了正确 conventions，功能是否匹配 requirements。                             | 工程师最终拥有部署到生产环境的代码；他们必须确保它可靠运行并满足预期 requirements。                                                              |

示例：

Sansan 使用 Codex review 检查 race conditions 和 database relations，这些是人类经常忽略的问题。Codex 也已经能够捕获不当 hard-coding，甚至能预判未来 scalability concerns。

### 入门检查清单

- 精选由工程师完成的 gold-standard PRs 示例，包括 code changes 和留下的 comments。将其保存为 evaluation set，用于衡量不同工具。
- 选择专门针对 code review 训练的 model 的产品。我们发现 generalized models 往往吹毛求疵，signal-to-noise ratio 较低。
- 定义团队如何衡量 reviews 是否高质量。我们建议跟踪 PR comment reactions，作为标记好坏 reviews 的低摩擦方式。
- 从小处开始，但一旦对 review 结果建立信心，就快速 rollout。


## 6. 文档

大多数工程团队都知道自己的文档落后了，但发现补齐成本很高。关键知识通常掌握在个人手中，而不是被捕获到可搜索知识库中；现有 docs 也会很快过期，因为更新它们会把工程师从产品工作中拉走。即便团队运行 documentation sprints，结果通常也是一次性工作，系统一演进就开始衰减。

### Coding agents 如何帮助

Coding agents 非常擅长通过阅读代码库来总结功能。它们不仅可以写出代码库某些部分的工作方式，还可以用 mermaid 等语法生成 system diagrams。随着开发者使用 agents 构建 features，他们也可以简单地通过 prompting model 来更新 documentation。借助 AGENTS.md，按需更新 documentation 的指令可以随每个 prompt 自动包含，从而提升一致性。

由于 coding agents 可以通过 SDKs 以编程方式运行，它们也可以纳入 release workflows。例如，我们可以要求 coding agent 审查将纳入 release 的 commits，并总结关键变更。结果是，documentation 成为交付 pipeline 的内建部分：更快产出、更易保持最新，并且不再依赖某个人「找时间」。

### 工程师转而做什么

工程师从手写每一篇 doc 转向塑造和监督系统。他们决定 docs 如何组织，补充决策背后的重要「为什么」，为 agents 设置清晰标准和 templates，并审查关键或面向客户的内容。他们的工作变成确保 documentation 结构清晰、准确，并连接到交付流程，而不是亲自完成所有文字输入。

| 委托                                                                                                                                                                                                    | 审查                                                                                                                                                                                | 拥有                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 将低风险、重复性工作完全交给 Codex，例如 files 和 modules 的 first-pass summaries、inputs 和 outputs 的基本说明、dependency lists，以及 pull-request changes 的短摘要。                              | 工程师在发布前审查和编辑由 Codex 起草的重要 docs，例如 core services overviews、public API and SDK docs、runbooks 和 architecture pages。                                           | 工程师仍负责整体 documentation strategy 和 structure、agent 遵循的 standards 和 templates，以及所有涉及 legal、regulatory 或 brand risk 的 external-facing 或 safety-critical documentation。                              |

### 入门检查清单

- 通过 prompting coding agent 试验 documentation generation
- 将 documentation guidelines 纳入你的 AGENTS.md
- 识别可以自动生成 documentation 的 workflows（例如 release cycles）
- 审查生成内容的质量、正确性和重点


## 7. 部署和维护

理解 application logging 对软件可靠性至关重要。在 incident 期间，软件工程师会参考 logging tools、code deploys 和 infrastructure changes 来确定 root cause。这个过程经常出人意料地手动，需要开发者在不同系统之间来回切换，在 incidents 等高压情况下耗费关键分钟。

### Coding agents 如何帮助

借助 AI coding tools，你可以通过 MCP servers 提供对 logging tools 的访问，同时提供代码库上下文。这让开发者拥有单一 workflow：他们可以提示模型查看某个 endpoint 的 errors，然后模型可以使用该上下文遍历代码库，寻找相关 bugs 或 performance issues。由于 coding agents 也可以使用 command line tools，它们可以查看 git history，以识别可能导致 log traces 中问题的具体变更。

### 工程师转而做什么

通过自动化 log analysis 和 incident triage 中繁琐的部分，AI 让工程师能够专注于更高层次的排障和系统改进。工程师不必手动关联 logs、commits 和 infrastructure changes，而可以专注于验证 AI-generated root causes、设计 resilient fixes，并制定预防措施。这种转变减少了 reactive firefighting 上的时间，让团队把更多精力投入 proactive reliability engineering 和架构改进。

| 委托                                                                                                                                                      | 审查                                                                                                                                                                      | 拥有                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 许多运维任务可以委托给 agents，例如解析 logs、暴露 anomalous metrics、识别可疑 code changes，甚至提出 hotfixes。                                      | 工程师审查并细化 AI-generated diagnostics，确认准确性，并批准 remediation steps。他们确保 fixes 符合可靠性、安全和合规标准。                                              | 关键决策仍由工程师承担，尤其是 novel incidents、敏感生产变更，或 model confidence 较低的情形。人类仍负责判断和最终批准。                                                                                       |

示例：

Virgin Atlantic 使用 Codex 加强团队部署和维护系统的方式。Codex VS Code Extension 为工程师提供一个统一位置，通过 Azure DevOps MCP 和 Databricks Managed MCPs 调查 logs、跨 code 和 data 追踪问题，并审查变更。通过在 IDE 中统一这种 operational context，Codex 加速 root cause discovery，减少手动 triage，并帮助团队专注于验证 fixes 和改进系统可靠性。

### 入门检查清单

- 将 AI tools 连接到 logging 和 deployment systems：将 Codex CLI 或类似工具与你的 MCP servers 和 log aggregators 集成。
- 定义访问范围和权限：确保 agents 可以访问相关 logs、code repositories 和 deployment histories，同时保持 security best practices。
- 配置 prompt templates：为常见 operational queries 创建可复用 prompts，例如 “Investigate errors for endpoint X” 或 “Analyze log spikes post-deploy.”
- 测试 workflow：运行模拟 incident scenarios，确保 AI 能暴露正确上下文、准确追踪代码，并提出可操作 diagnostics。
- 迭代和改进：从真实 incidents 收集反馈，调优 prompt strategies，并随着系统和流程演进扩展 agent capabilities。


## 结论

Coding agents 正在通过承担过去拖慢工程团队的机械性、多步骤工作，改变软件开发生命周期。借助持续推理、统一代码库上下文和执行真实工具的能力，这些 agents 现在可以处理从 scoping 和 prototyping 到 implementation、testing、review，甚至 operational triage 的任务。工程师仍牢牢掌控 architecture、product intent 和 quality，但 coding agents 越来越成为 SDLC 每个阶段的第一轮实现者和持续协作者。

这种转变不需要激进改造；随着 coding agents 变得更有能力、更可靠，小而有针对性的 workflows 会快速复合增益。从范围清晰的 tasks 开始、投资 guardrails，并迭代扩展 agent responsibility 的团队，会在速度、一致性和开发者专注度上看到有意义的提升。

如果你正在探索 coding agents 如何加速你的组织，或正在准备首次部署，请联系 OpenAI。我们会帮助你把 coding agents 转化为真正的杠杆，设计覆盖 planning、design、build、test、review 和 operations 的端到端 workflows，并帮助你的团队采用 production-ready patterns，让 AI-native engineering 成为现实。

[image1]: https://developers.openai.com/images/codex/guides/build-ai-native-engineering-team.png

:::

## English source

::: details 展开英文原文
::: v-pre
## Introduction

AI models are rapidly expanding the range of tasks they can perform, with significant implications for engineering. Frontier systems now sustain multi-hour reasoning: as of August 2025, METR found that leading models could complete **2 hours and 17 minutes** of continuous work with roughly **50% confidence** of producing a correct answer.

This capability is improving quickly, with task length doubling about every seven months. Only a few years ago, models could manage about 30 seconds of reasoning – enough for small code suggestions. Today, as models sustain longer chains of reasoning, the entire software development lifecycle is potentially in scope for AI assistance, enabling coding agents to contribute effectively to planning, design, development, testing, code reviews, and deployment.

![][image1]In this guide, we’ll share real examples that outline how AI agents are contributing to the software development lifecycle with practical guidance on what engineering leaders can do today to start building AI-native teams and processes.

## AI Coding: From Autocomplete to Agents

AI coding tools have progressed far beyond their origins as autocomplete assistants. Early tools handled quick tasks such as suggesting the next line of code or filling in function templates. As models gained stronger reasoning abilities, developers began interacting with agents through chat interfaces in IDEs for pair programming and code exploration.

Today’s coding agents can generate entire files, scaffold new projects, and translate designs into code. They can reason through multi-step problems such as debugging or refactoring, with agent execution also now shifting from an individual developer’s machine to cloud-based, multi-agent environments. This is changing how developers work, allowing them to spend less time generating code with the agent inside the IDE and more time delegating entire workflows.

| Capability                         | What It Enables                                                                                                                                                        |
| :--------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unified context across systems** | A single model can read code, configuration, and telemetry, providing consistent reasoning across layers that previously required separate tooling.                    |
| **Structured tool execution**      | Models can now call compilers, test runners, and scanners directly, producing verifiable results rather than static suggestions.                                       |
| **Persistent project memory**      | Long context windows and techniques like compaction allow models to follow a feature from proposal to deployment, remembering previous design choices and constraints. |
| **Evaluation loops**               | Model outputs can be tested automatically against benchmarks—unit tests, latency targets, or style guides—so improvements are grounded in measurable quality.          |

At OpenAI, we have witnessed this firsthand. Development cycles have accelerated, with work that once required weeks now being delivered in days. Teams move more easily across domains, onboard faster to unfamiliar projects, and operate with greater agility and autonomy across the organization. Many routine and time-consuming tasks, from documenting new code and surfacing relevant tests, maintaining dependencies and cleaning up feature flags are now delegated to Codex entirely.

However, some aspects of engineering remain unchanged. True ownership of code—especially for new or ambiguous problems—still rests with engineers, and certain challenges exceed the capabilities of current models. But with coding agents like Codex, engineers can now spend more time on complex and novel challenges, focusing on design, architecture, and system-level reasoning rather than debugging or rote implementation.

In the following sections, we break down how each phase of the SDLC changes with coding agents — and outline the concrete steps your team can take to start operating as an AI-native engineering org.

## 1. Plan

Teams across an organization often depend on engineers to determine whether a feature is feasible, how long it will take to build, and which systems or teams will be involved. While anyone can draft a specification, forming an accurate plan typically requires deep codebase awareness and multiple rounds of iteration with engineering to uncover requirements, clarify edge cases, and align on what is technically realistic.

### How coding agents help

AI coding agents give teams immediate, code-aware insights during planning and scoping. For example, teams may build workflows that connect coding agents to their issue-tracking systems to read a feature specification, cross-reference it against the codebase, and then flag ambiguities, break the work into subcomponents, or estimate difficulty.

Coding agents can also instantly trace code paths to show which services are involved in a feature — work that previously required hours or days of manual digging through a large codebase.

### What engineers do instead

Teams spend more time on core feature work because agents surface the context that previously required meetings for product alignment and scoping. Key implementation details, dependencies, and edge cases are identified up front, enabling faster decisions with fewer meetings.

| Delegate                                                                                                                                                                                                              | Review                                                                                                                                                                                                                                       | Own                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AI agents can take the first pass at feasibility and architectural analysis. They read a specification, map it to the codebase, identify dependencies, and surface ambiguities or edge cases that need clarification. | Teams review the agent’s findings to validate accuracy, assess completeness, and ensure estimates reflect real technical constraints. Story point assignment, effort sizing, and identifying non-obvious risks still require human judgment. | Strategic decisions — such as prioritization, long-term direction, sequencing, and tradeoffs — remain human-led. Teams may ask the agent for options or next steps, but final responsibility for planning and product direction stays with the organization. |

### Getting started checklist

- Identify common processes that require alignment between features and source code. Common areas include feature scoping and ticket creation.
- Begin by implementing basic workflows, for example tagging and deduplicating issues or feature requests.
- Consider more advanced workflows, like adding sub-tasks to a ticket based on an initial feature description. Or kick off an agent run when a ticket reaches a specific stage to supplement the description with more details.



## 2. Design

The design phase is often slowed by foundational setup work. Teams spend significant time wiring up boilerplate, integrating design systems, and refining UI components or flows. Misalignment between mockups and implementation can create rework and long feedback cycles, and limited bandwidth to explore alternatives or adapt to changing requirements delays design validation.

### How coding agents help

AI coding tools dramatically accelerate prototyping by scaffolding boilerplate code, building project structures, and instantly implementing design tokens or style guides. Engineers can describe desired features or UI layouts in natural language and receive prototype code or component stubs that match the team’s conventions.

They can convert designs directly into code, suggest accessibility improvements, and even analyze the codebase for user flows or edge cases. This makes it possible to iterate on multiple prototypes in hours instead of days, and to prototype in high fidelity early, giving teams a clearer basis for decision-making and enabling customer testing far sooner in the process.

### What engineers do instead

With routine setup and translation tasks handled by agents, teams can redirect their attention to higher-leverage work. Engineers focus on refining core logic, establishing scalable architectural patterns, and ensuring components meet quality and reliability standards. Designers can spend more time evaluating user flows and exploring alternative concepts. The collaborative effort shifts from implementation overhead to improving the underlying product experience.

| Delegate                                                                                                                                                                             | Review                                                                                                                                                                       | Own                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Agents handle the initial implementation work by scaffolding projects, generating boilerplate code, translating mockups into components, and applying design tokens or style guides. | The team reviews the agent’s output to ensure components follow design conventions, meet quality and accessibility standards, and integrate correctly with existing systems. | The team owns the overarching design system, UX patterns, architectural decisions, and the final direction of the user experience. |

### Getting started checklist

- Use a multi-modal coding agent that accepts both text and image input
- Integrate design tools via MCP with coding agents
- Programmatically expose component libraries with MCP, and integrate them with your coding model
- Build workflows that map designs → components → implementation of components
- Utilize typed languages (e.g. Typescript) to define valid props and subcomponents for the agent


## 3. Build

The build phase is where teams feel the most friction, and where coding agents have the clearest impact. Engineers spend substantial time translating specs into code structures, wiring services together, duplicating patterns across the codebase, and filling in boilerplate, with even small features requiring hours of busy-work.

As systems grow, this friction compounds. Large monorepos accumulate patterns, conventions, and historical quirks that slow contributors down. Engineers can spend as much time rediscovering the “right way” to do something as implementing the feature itself. Constant context switching between specs, code search, build errors, test failures, and dependency management adds cognitive load — and interruptions during long-running tasks break flow and delay delivery further.

### How coding agents help

Coding agents running in the IDE and CLI accelerate the build phase by handling larger, multi-step implementation tasks. Rather than producing just the next function or file, they can produce full features end-to-end — data models, APIs, UI components, tests, and documentation — in a single coordinated run. With sustained reasoning across the entire codebase, they handle decisions that once required engineers to manually trace code paths.

With long-running tasks, agents can:

- Draft entire feature implementations based on a written spec.
- Search and modify code across dozens of files while maintaining consistency.
- Generate boilerplate that matches conventions: error handling, telemetry, security wrappers, or style patterns.
- Fix build errors as they appear rather than pausing for human intervention.
- Write tests alongside implementation as part of a single workflow.
- Produce diff-ready changesets that follow internal guidelines and include PR messages.

In practice, this shifts much of the mechanical “build work” from engineers to agents. The agent becomes the first-pass implementer; the engineer becomes the reviewer, editor, and source of direction.

### What engineers do instead

When agents can reliably execute multi-step build tasks, engineers shift their attention to higher-order work:

- Clarifying product behavior, edge cases, and specs before implementation.
- Reviewing architectural implications of AI-generated code instead of performing rote wiring.
- Refining business logic and performance-critical paths that require deep domain reasoning.
- Designing patterns, guardrails, and conventions that guide agent-generated code.
- Collaborating with PMs and design to iterate on feature intent, not boilerplate.

Instead of “translating” a feature spec into code, engineers concentrate on correctness, coherence, maintainability, and long-term quality, areas where human context still matters most.

| Delegate                                                                                                                                                                                                                                           | Review                                                                                                                                                                                                                              | Own                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agents draft the first implementation pass for well-specified features — scaffolding, CRUD logic, wiring, refactors, and tests. As long-running reasoning improves, this increasingly covers full end-to-end builds rather than isolated snippets. | Engineers assess design choices, performance, security, migration risk, and domain alignment while correcting subtle issues the agent may miss. They shape and refine AI-generated code rather than performing the mechanical work. | Engineers retain ownership of work requiring deep system intuition: new abstractions, cross-cutting architectural changes, ambiguous product requirements, and long-term maintainability trade-offs. As agents take on longer tasks, engineering shifts from line-by-line implementation to iterative oversight. |

Example:

Engineers, PMs, designers, and operators at Cloudwalk use Codex daily to turn specs into working code whether they need a script, a new fraud rule, or a full microservice delivered in minutes. It removes the busy work from the build phase and gives every employee the power to implement ideas at remarkable speed.

### Getting started checklist

- Start with well specified tasks
- Have the agent use a planning tool via MCP, or by writing a PLAN.md file that is committed to the codebase
- Check that the commands the agent attempts to execute are succeeding
- Iterate on an AGENTS.md file that unlocks agentic loops like running tests and linters to receive feedback


## 4. Test

Developers often struggle to ensure adequate test coverage because writing and maintaining comprehensive tests takes time, requires context switching, and deep understanding of edge cases. Teams frequently face trade-offs between moving fast and writing thorough tests. When deadlines loom, test coverage is often the first thing to suffer.

Even when tests are written, keeping them updated as code evolves introduces ongoing friction. Tests can become brittle, fail for unclear reasons, and can require their own major refactors as the underlying product changes. High quality tests let teams ship faster with more confidence.

### How coding agents help

AI coding tools can help developers author better tests in several powerful ways. First, they can suggest test cases based on reading a requirements document and the logic of the feature code. Models can be surprisingly good at suggesting edge cases and failure modes that may be easy for a developer to overlook, especially when they have been deeply focused on the feature and need a second opinion.

In addition, models can help tests up to date as code evolves, reducing the friction of refactoring and avoiding stale tests that become flaky. By handling the basic implementation details of test writing and surfacing edge cases, coding agents accelerate the process of developing tests.

### What engineers do instead

Writing tests with AI tools doesn’t remove the need for developers to think about testing. In fact, as agents remove barriers to generating code, tests serve a more and more important function as a source of truth for application functionality. Since agents can run the test suite and iterate based on the output, defining high quality tests is often the first step to allowing an agent to build a feature.

Instead, developers focus more on seeing the high level patterns in test coverage, building on and challenging the model’s identification of test cases. Making test writing faster allows developers to ship features more quickly and also take on more ambitious features.

| Delegate                                                                                                                                                                                                                                                                          | Review                                                                                                                                                                                                                                                                                                                                           | Own                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engineers will delegate the initial pass at generating test cases based on feature specifications. They’ll also use the model to take a first pass at generating tests. It can be helpful to have the model generate tests in a separate session from the feature implementation. | Engineers must still thoroughly review model-generated tests to ensure that the model did not take shortcuts or implement stubbed tests. Engineers also ensure that tests are runnable by their agents; that the agent has the appropriate permissions to run, and that the agent has context awareness of the different test suites it can run. | Engineers own aligning test coverage with feature specifications and user experience expectations. Adversarial thinking, creativity in mapping edge cases, and focus on intent of the tests remain critical skills. |

### Getting started checklist

- Guide the model to implement tests as a separate step, and validate that new tests fail before moving to feature implementation.
- Set guidelines for test coverage in your AGENTS.md file
- Give the agent specific examples of code coverage tools it can call to understand test coverage


## 5. Review

On average, developers spend 2–5 hours per week conducting code reviews. Teams often face a choice between investing significant time in a deep review or doing a quick “good enough” pass for changes that seem small. When this prioritization is off, bugs slip into production, causing issues for users and creating substantial rework.

### How coding agents help

Coding agents allow the code review process to scale so every PR receives a consistent baseline of attention. Unlike traditional static analysis tools (which rely on pattern matching and rule-based checks) AI reviewers can actually execute parts of the code, interpret runtime behavior, and trace logic across files and services. To be effective, however, models must be trained specifically to identify P0 and P1-level bugs, and tuned to provide concise, high-signal feedback; overly verbose responses are ignored just as easily as noisy lint warnings.

### What engineers do instead

At OpenAI, we find that AI code review gives engineers more confidence that they are not shipping major bugs into production. Frequently, code review will catch issues that the contributor can correct before pulling in another engineer. Code review doesn’t necessarily make the pull request process faster, especially if it finds meaningful bugs – but it does prevent defects and outages.

### Delegate vs review vs own

Even with AI code review, engineers are still responsible for ensuring that the code is ready to ship. Practically, this means reading and understanding the implications of the change. Engineers delegate the initial code review to an agent, but own the final review and merge process.

| Delegate                                                                                                                                                    | Review                                                                                                                                                                                                                       | Own                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Engineers delegate the initial coding review to agents. This may happen multiple times before the pull request is marked as ready for review by a teammate. | Engineers still review pull requests, but with more of an emphasis on architectural alignment; are composable patterns being implemented, are the correct conventions being used, does the functionality match requirements. | Engineers ultimately own the code that is deployed to production; they must ensure it functions reliably and fulfills the intended requirements. |

Example:

Sansan uses Codex review for race conditions and database relations, which are issues humans often overlook. Codex has also been able to catch improper hard-coding and even anticipates future scalability concerns.

### Getting started checklist

- Curate examples of gold-standard PRs that have been conducted by engineers including both the code changes and comments left. Save this as an evaluation set to measure different tools.
- Select a product that has a model specifically trained on code review. We’ve found that generalized models often nitpick and provide a low signal to noise ratio.
- Define how your team will measure whether reviews are high quality. We recommend tracking PR comment reactions as a low-friction way to mark good and bad reviews.
- Start small but rollout quickly once you gain confidence in the results of reviews.


## 6. Document

Most engineering teams know their documentation is behind, but find catching up costly. Critical knowledge is often held by individuals rather than captured in searchable knowledge bases, and existing docs quickly go stale because updating them pulls engineers away from product work. And even when teams run documentation sprints, the result is usually a one-off effort that decays as soon as the system evolves.

### How coding agents help

Coding agents are highly capable of summarizing functionality based on reading codebases. Not only can they write about how parts of the codebase work, but they can also generate system diagrams in syntaxes like mermaid. As developers build features with agents, they can also update documentation simply by prompting the model. With AGENTS.md, instructions to update documentation as needed can be automatically included with every prompt for more consistency.

Since coding agents can be run programmatically through SDKs, they can also be incorporated into release workflows. For example, we can ask a coding agent to review commits being included in the release and summarize key changes. The result is that documentation becomes a built-in part of the delivery pipeline: faster to produce, easier to keep current, and no longer dependent on someone “finding the time.”

### What engineers do instead

Engineers move from writing every doc by hand to shaping and supervising the system. They decide how docs are organized, add the important “why” behind decisions, set clear standards and templates for agents to follow, and review the critical or customer-facing pieces. Their job becomes making sure documentation is structured, accurate, and wired into the delivery process rather than doing all the typing themselves.

| Delegate                                                                                                                                                                                                   | Review                                                                                                                                                                              | Own                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fully hand off low-risk, repetitive work to Codex like first-pass summaries of files and modules, basic descriptions of inputs and outputs, dependency lists, and short summaries of pull-request changes. | Engineers review and edit important docs drafted by Codex like overviews of core services, public API and SDK docs, runbooks, and architecture pages, before anything is published. | Engineers remain responsible for overall documentation strategy and structure, standards and templates the agent follows, and all external-facing or safety-critical documentation involving legal, regulatory, or brand risk. |

### Getting started checklist

- Experiment with documentation generation by prompting the coding agent
- Incorporate documentation guidelines into your AGENTS.md
- Identify workflows (e.g. release cycles) where documentation can be automatically generated
- Review generated content for quality, correctness, and focus


## 7. Deploy and Maintain

Understanding application logging is critical to software reliability. During an incident, software engineers will reference logging tools, code deploys, and infrastructure changes to identify a root cause. This process is often surprisingly manual and requires developers to tab back and forth between different systems, costing critical minutes in high pressure situations like incidents.

### How coding agents help

With AI coding tools, you can provide access to your logging tools via MCP servers in addition to the context of your codebase. This allows developers to have a single workflow where they can prompt the model to look at errors for a specific endpoint, and then the model can use that context to traverse the codebase and find relevant bugs or performance issues. Since coding agents can also use command line tools, they can look at the git history to identify specific changes that might result in issues captured in log traces.

### What engineers do instead

By automating the tedious aspects of log analysis and incident triage, AI enables engineers to concentrate on higher-level troubleshooting and system improvement. Rather than manually correlating logs, commits, and infrastructure changes, engineers can focus on validating AI-generated root causes, designing resilient fixes, and developing preventative measures.This shift reduces time spent on reactive firefighting, allowing teams to invest more energy in proactive reliability engineering and architectural improvements.

| Delegate                                                                                                                                                      | Review                                                                                                                                                                      | Own                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Many operational tasks can be delegated to agents — parsing logs, surfacing anomalous metrics, identifying suspect code changes, and even proposing hotfixes. | Engineers vet and refine AI-generated diagnostics, confirm accuracy, and approve remediation steps. They ensure fixes meet reliability, security, and compliance standards. | Critical decisions stay with engineers, especially for novel incidents, sensitive production changes, or situations where model confidence is low. Humans remain responsible for judgment and final sign-off. |

Example:

Virgin Atlantic uses Codex to strengthen how teams deploy and maintain their systems. The Codex VS Code Extension gives engineers a single place to investigate logs, trace issues across code and data, and review changes through Azure DevOps MCP and Databricks Managed MCPs. By unifying this operational context inside the IDE, Codex speeds up root cause discovery, reduces manual triage, and helps teams focus on validating fixes and improving system reliability.

### Getting started checklist

- Connect AI tools to logging and deployment systems: Integrate Codex CLI or similar with your MCP servers and log aggregators.
- Define access scopes and permissions: Ensure agents can access relevant logs, code repositories, and deployment histories, while maintaining security best practices.
- Configure prompt templates: Create reusable prompts for common operational queries, such as “Investigate errors for endpoint X” or “Analyze log spikes post-deploy.”
- Test the workflow: Run simulated incident scenarios to ensure the AI surfaces correct context, traces code accurately, and proposes actionable diagnostics.
- Iterate and improve: Collect feedback from real incidents, tune prompt strategies, and expand agent capabilities as your systems and processes evolve.


## Conclusion

Coding agents are transforming the software development lifecycle by taking on the mechanical, multi-step work that has traditionally slowed engineering teams down. With sustained reasoning, unified codebase context, and the ability to execute real tools, these agents now handle tasks ranging from scoping and prototyping to implementation, testing, review, and even operational triage. Engineers stay firmly in control of architecture, product intent, and quality — but coding agents increasingly serve as the first-pass implementer and continuous collaborator across every phase of the SDLC.

This shift doesn’t require a radical overhaul; small, targeted workflows compound quickly as coding agents become more capable and reliable. Teams that start with well-scoped tasks, invest in guardrails, and iteratively expand agent responsibility see meaningful gains in speed, consistency, and developer focus.

If you’re exploring how coding agents can accelerate your organization or preparing for your first deployment, reach out to OpenAI. We’re here to help you turn coding agents into real leverage—designing end-to-end workflows across planning, design, build, test, review, and operations, and helping your team adopt production-ready patterns that make AI-native engineering a reality.

[image1]: https://developers.openai.com/images/codex/guides/build-ai-native-engineering-team.png

:::
:::

