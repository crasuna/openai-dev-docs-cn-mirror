---
status: needs-review
sourceId: "790e23bd78bf"
sourceChecksum: "790e23bd78bffa294d4a058240c012385d599f7aeb9a0d4944e870d5cc06e5ce"
sourceUrl: "https://developers.openai.com/codex/learn/best-practices"
translatedAt: "2026-06-27T19:06:51.2133192+08:00"
translator: codex-gpt-5.5-xhigh
---

# 最佳实践

如果你刚开始使用 Codex 或一般意义上的编码 agents，本指南会帮助你更快获得更好结果。它涵盖让 Codex 在 [CLI](https://developers.openai.com/codex/cli)、[IDE extension](https://developers.openai.com/codex/ide) 和 [Codex app](https://developers.openai.com/codex/app) 中更有效的核心习惯，包括 prompting、planning、validation、MCP、skills 和 automations。

当你少把 Codex 当作一次性 assistant，而多把它当作会随时间配置和改进的 teammate 时，它效果最好。

一种有用的理解方式是：从正确的任务上下文开始，使用 `AGENTS.md` 存放持久指导，配置 Codex 以匹配你的工作流，用 MCP 连接外部系统，把重复工作变成 skills，并自动化稳定工作流。

## 强力的第一步：上下文和 prompts

即使你的 prompt 并不完美，Codex 也已经足够强大，可以产生有用结果。你通常可以用最少设置把一个难题交给它，仍然获得不错的结果。清晰的 [prompting](https://developers.openai.com/codex/prompting) 并不是获得价值的必要条件，但它确实会让结果更可靠，尤其是在更大的代码库或更高风险任务中。

如果你在大型或复杂 repository 中工作，最大的提效点是给 Codex 正确的任务上下文，并清楚组织你想完成的内容。

一个好的默认 prompt 应包含四件事：

- **目标：** 你想修改或构建什么？
- **上下文：** 哪些文件、文件夹、文档、示例或错误与此任务相关？你可以 @ mention 某些文件作为上下文。
- **约束：** Codex 应遵循哪些标准、架构、安全要求或约定？
- **完成标准：** 任务完成前应满足什么，例如测试通过、行为发生变化，或 bug 不再复现？

这有助于 Codex 保持范围、减少假设，并产出更容易审查的工作。

根据任务难度选择 reasoning level，并测试哪种设置最适合你的工作流。不同用户和任务最适合的设置不同。

- Low 用于更快、范围清晰的任务
- Medium 或 High 用于更复杂的更改或调试
- Extra High 用于较长、agentic、推理密集型任务

为了更快提供上下文，可以尝试在 Codex app 中使用语音听写，说出你希望 Codex 做什么，而不是打字。

## 对困难任务先制定计划

如果任务复杂、模糊或难以描述清楚，请让 Codex 在开始编码前先计划。

以下几种方法效果很好：

**使用 Plan mode：** 对大多数用户而言，这是最简单也最有效的选项。Plan mode 让 Codex 在实现前收集上下文、提出澄清问题，并构建更强的计划。可用 `/plan` 或 <kbd>Shift</kbd>+<kbd>Tab</kbd> 切换。

**让 Codex 采访你：** 如果你大致知道自己想要什么，但不确定如何描述清楚，请先让 Codex 向你提问。告诉它挑战你的假设，并在写代码前把模糊想法变成具体内容。

**使用 PLANS.md 模板：** 对于更高级的工作流，你可以配置 Codex 对更长时间运行或多步骤工作遵循 `PLANS.md` 或 execution-plan template。更多详情请参阅 [execution plans guide](https://developers.openai.com/cookbook/articles/codex_exec_plans)。

## 用 `AGENTS.md` 让指导可复用

一旦某种 prompting 模式奏效，下一步就是停止手动重复它。这就是 [AGENTS.md](https://developers.openai.com/codex/guides/agents-md) 的用途。

可以把 `AGENTS.md` 视为面向 agents 的开放格式 README。它会自动加载到上下文中，也是编码你和团队希望 Codex 在 repository 中如何工作的最佳位置。

好的 `AGENTS.md` 会涵盖：

- repo layout 和重要目录
- 如何运行项目
- Build、test 和 lint 命令
- Engineering conventions 和 PR expectations
- Constraints 和 do-not rules
- 完成意味着什么，以及如何验证工作

CLI 中的 `/init` slash command 是在当前目录搭建 starter `AGENTS.md` 的 quick-start command。它是很好的起点，但你应编辑结果，使其符合团队实际构建、测试、审查和发布代码的方式。

你可以在不同层级创建 `AGENTS.md` 文件：位于 `~/.codex` 的 global `AGENTS.md` 用于个人默认值，repo-level 文件用于共享标准，subdirectories 中更具体的文件用于本地规则。如果离当前目录更近的位置存在更具体文件，则该指导优先。

保持实用。简短且准确的 `AGENTS.md` 比充满模糊规则的长文件更有用。从基础开始，然后只在发现重复错误后添加新规则。

如果 `AGENTS.md` 开始变得过大，请保持主文件简洁，并引用面向 planning、code review 或 architecture 等任务的专用 markdown 文件。

当 Codex 第二次犯同样错误时，请让它做一次 retrospective 并更新 `AGENTS.md`。这样指导会保持实用，并基于真实摩擦。

## 配置 Codex 以保持一致

Configuration 是让 Codex 在不同 sessions 和 surfaces 中表现更一致的主要方式之一。例如，你可以为 model choice、reasoning effort、sandbox mode、approval policy、profiles 和 MCP setup 设置默认值。

一个好的起始模式是：

- 将个人默认值放在 `~/.codex/config.toml` 中（Codex app 中的 Settings → Configuration → Open config.toml）
- 将 repo-specific behavior 放在 `.codex/config.toml` 中
- 仅在一次性场景中使用 command-line overrides（如果你使用 CLI）

[`config.toml`](https://developers.openai.com/codex/config-basic) 是定义持久偏好的地方，例如 MCP servers、multi-agent setup 和 feature flags。Profile-specific overrides 位于单独的 `$CODEX_HOME/profile-name.config.toml` 文件中。

Codex 附带 operating level sandboxing，并有两个你可以控制的关键旋钮。Approval mode 决定 Codex 何时请求你允许运行命令，sandbox mode 决定 Codex 是否可以在目录中读写，以及 agent 可以访问哪些文件。

如果你刚开始使用 coding agents，请从默认权限开始。默认情况下保持 approval 和 sandboxing 严格；只有在需求明确后，才为 trusted repos 或特定工作流放宽权限。

请注意，CLI、IDE 和 Codex app 都共享相同的配置层。可在 [sample configuration](https://developers.openai.com/codex/config-sample) 页面了解更多。

尽早按你的真实环境配置 Codex。许多质量问题其实是设置问题，例如错误的工作目录、缺少写入权限、错误的模型默认值，或缺少工具和 connectors。

## 用测试和审查提升可靠性

不要止步于要求 Codex 做出更改。请在需要时要求它创建测试、运行相关检查、确认结果，并在你接受前审查工作。

Codex 可以为你完成这个循环，但前提是它知道什么是“好”。这些指导可以来自 prompt，也可以来自 `AGENTS.md`。

这可以包括：

- 为更改编写或更新测试
- 运行正确的测试套件
- 检查 lint、formatting 或 type checks
- 确认最终行为符合请求
- 审查 diff，寻找 bugs、regressions 或 risky patterns

在 Codex app 中切换 diff panel，可以直接在本地[审查更改](https://developers.openai.com/codex/app/review)。点击特定行可以提供反馈，该反馈会作为上下文进入下一轮 Codex。

这里一个有用选项是 slash command `/review`，它提供几种代码审查方式：

- 针对 base branch 进行 PR-style review
- 审查 uncommitted changes
- 审查 commit
- 使用 custom review instructions

如果你和团队有 `code_review.md` 文件，并从 `AGENTS.md` 引用它，Codex 也可以在审查期间遵循该指导。对于希望 review behavior 在 repositories 和 contributors 之间保持一致的团队，这是一个强模式。

Codex 不应只是生成代码。通过正确 instructions，它还可以帮助**测试、检查和审查**代码。

如果你使用 GitHub Cloud，可以设置 Codex 对你的 PR 运行 [code reviews](https://developers.openai.com/codex/integrations/github)。在 OpenAI，Codex 会审查 100% 的 PR。你可以启用自动审查，或让 Codex 在你 @Codex 时被动审查。

## 用 MCPs 获取外部上下文

当 Codex 需要的上下文位于 repo 之外时，请使用 MCPs。它让 Codex 连接到你已经使用的工具和系统，这样你不必反复把实时信息复制粘贴到 prompts 中。

[Model Context Protocol](https://developers.openai.com/codex/mcp)，即 MCP，是一个把 Codex 连接到外部工具和系统的开放标准。

在以下情况下使用 MCP：

- 所需上下文位于 repo 之外
- 数据频繁变化
- 你希望 Codex 使用工具，而不是依赖粘贴的 instructions
- 你需要跨用户或项目的可重复 integration

Codex 支持带 OAuth 的 STDIO 和 Streamable HTTP servers。

在 Codex App 中，前往 Settings → MCP servers 查看 custom 和 recommended servers。通常 Codex 可以帮助你安装所需 servers。你只需要提出请求即可。你也可以在 CLI 中使用 `codex mcp add` 命令，带上名称、URL 和其他详情来添加自定义 servers。

只在工具能解锁真实工作流时添加工具。不要一开始就接入你使用的所有工具。从一两个明确能移除你已经经常手动执行循环的工具开始，然后再扩展。

## 将可重复工作变成 skills

一旦某个工作流变得可重复，就不要继续依赖长 prompts 或反复来回沟通。使用 [Skill](https://developers.openai.com/codex/skills) 将 instructions、context 和 supporting logic 打包到 SKILL.md 文件中，让 Codex 一致地应用它们。Skills 可在 CLI、IDE extension 和 Codex app 中使用。

让每个 skill 聚焦于一个工作。从 2 到 3 个具体用例开始，定义清晰输入和输出，并编写 description，说明 skill 做什么以及何时使用。包含用户实际会说的 trigger phrases 类型。

不要试图一开始就覆盖每个边界情况。先从一个代表性任务开始，让它顺利工作，然后把该工作流变成 skill，并从那里继续改进。只有在 scripts 或额外 assets 能提升可靠性时才包含它们。

一个好经验法则是：如果你不断复用同一个 prompt，或不断纠正同一个工作流，它可能就应该变成 skill。

Skills 对以下 recurring jobs 尤其有用：

- Log triage
- Release note drafting
- 按 checklist 进行 PR review
- Migration planning
- Telemetry 或 incident summaries
- 标准 debugging flows

`$skill-creator` skill 是搭建第一个 skill 版本的最佳起点。迭代期间先保持第一版本地化。准备广泛共享时，将其打包成 [plugin](https://developers.openai.com/codex/plugins/build)。Skill 最重要的部分之一是 description。它应该说明 skill 做什么以及何时使用。

Personal skills 存储在 `$HOME/.agents/skills`，shared team skills 可以提交到 repository 内的 `.agents/skills`。这对新 teammate onboarding 尤其有帮助。

## 用 automations 处理重复工作

一旦工作流稳定，你可以安排 Codex 在后台为你运行它。在 Codex app 中，[automations](https://developers.openai.com/codex/app/automations) 让你选择 project、prompt、cadence 和 recurring task 的 execution environment。

当某个任务对你来说变得重复时，可以在 Codex app 的 Automations tab 中创建 automation。你可以选择它在哪个 project 中运行、运行的 prompt（可以调用 skills），以及运行 cadence。你还可以选择 automation 是在专用 git worktree 中运行，还是在你的本地环境中运行。了解更多 [git worktrees](https://developers.openai.com/codex/app/worktrees)。

好的候选项包括：

- 总结最近 commits
- 扫描可能的 bugs
- 起草 release notes
- 检查 CI failures
- 生成 standup summaries
- 按计划运行可重复 analysis workflows

一个有用规则是：skills 定义方法，automations 定义时间表。如果工作流仍需要大量引导，请先把它变成 skill。一旦它可预测，automation 就会成为倍增器。

将 automations 用于 reflection 和 maintenance，而不仅是 execution。审查最近 sessions，总结重复摩擦，并随时间改进 prompts、instructions 或 workflow setup。

## 用 session controls 组织 long-running work

Codex sessions 不只是 chat history。它们是会随时间积累上下文、决策和操作的工作 threads，因此良好管理它们会显著影响质量。

Codex app UI 让 thread management 最容易，因为你可以 pin threads 并创建 worktrees。如果你使用 CLI，以下 [slash commands](https://developers.openai.com/codex/cli/slash-commands) 尤其有用：

- `/experimental` 用于切换 experimental features 并添加到 `config.toml`
- `/resume` 用于恢复已保存 conversation
- `/fork` 用于在保留原始 transcript 的同时创建新 thread
- `/compact` 用于在线程变长且你想要 earlier context 的 summary 版本时使用。请注意，Codex 也会自动为你 compact conversations
- `/agent` 用于在运行 parallel agents 时在 active agent thread 之间切换
- `/theme` 用于选择 syntax highlighting theme
- `/apps` 用于直接在 Codex 中使用 ChatGPT apps
- `/status` 用于检查当前 session state

每个 coherent unit of work 保持一个 thread。如果工作仍属于同一个问题，留在同一个 thread 通常更好，因为它会保留 reasoning trail。只有当工作真正分支时才 fork。

使用 Codex 的 [subagent](https://developers.openai.com/codex/concepts/subagents) 工作流，将有边界的工作从主线程卸载出去。让 main agent 专注于核心问题，并使用 subagents 处理 exploration、tests 或 triage 等任务。

## 常见错误

首次使用 Codex 时，请避免以下常见错误：

- 用持久规则让 prompt 超载，而不是把它们移入 `AGENTS.md` 或 skill
- 没有让 agent 看到自己的工作，例如没有说明如何最好地运行 build 和 test 命令
- 在多步骤和复杂任务上跳过 planning
- 在理解工作流前就授予 Codex 对你电脑的完全权限
- 在不使用 git worktrees 的情况下，让 live threads 处理相同文件
- 在 recurring task 尚未能手动可靠运行前，就把它变成 automation
- 把 Codex 当作必须逐步盯着看的东西，而不是把它与你自己的工作并行使用
- 每个 project 使用一个 thread，而不是每个 task 使用一个 thread。这会导致上下文膨胀，并随着时间推移让结果变差
