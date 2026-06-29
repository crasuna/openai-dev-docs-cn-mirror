---
title: "最佳实践"
description: "Getting started with Codex and proven practices for better results"
outline: deep
---

# 最佳实践

**文档集**：Codex  
**分组**：Codex — Learn  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/learn/best-practices](https://developers.openai.com/codex/learn/best-practices)
- Markdown 来源：[https://developers.openai.com/codex/learn/best-practices.md](https://developers.openai.com/codex/learn/best-practices.md)
- 抓取时间：2026-06-27T05:55:02.056Z
- Checksum：`790e23bd78bffa294d4a058240c012385d599f7aeb9a0d4944e870d5cc06e5ce`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
如果你刚开始使用 Codex 或一般意义上的编码 agents，本指南会帮助你更快获得更好结果。它涵盖让 Codex 在 [CLI](/mirror/codex/cli)、[IDE extension](/mirror/codex/ide) 和 [Codex app](/mirror/codex/app) 中更有效的核心习惯，包括 prompting、planning、validation、MCP、skills 和 automations。

当你少把 Codex 当作一次性 assistant，而多把它当作会随时间配置和改进的 teammate 时，它效果最好。

一种有用的理解方式是：从正确的任务上下文开始，使用 `AGENTS.md` 存放持久指导，配置 Codex 以匹配你的工作流，用 MCP 连接外部系统，把重复工作变成 skills，并自动化稳定工作流。

## 强力的第一步：上下文和 prompts

即使你的 prompt 并不完美，Codex 也已经足够强大，可以产生有用结果。你通常可以用最少设置把一个难题交给它，仍然获得不错的结果。清晰的 [prompting](/mirror/codex/prompting) 并不是获得价值的必要条件，但它确实会让结果更可靠，尤其是在更大的代码库或更高风险任务中。

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

**使用 Plan mode：** 对大多数用户而言，这是最简单也最有效的选项。Plan mode 让 Codex 在实现前收集上下文、提出澄清问题，并构建更强的计划。可用 `/plan` 或 &lt;kbd&gt;Shift&lt;/kbd&gt;+&lt;kbd&gt;Tab&lt;/kbd&gt; 切换。

**让 Codex 采访你：** 如果你大致知道自己想要什么，但不确定如何描述清楚，请先让 Codex 向你提问。告诉它挑战你的假设，并在写代码前把模糊想法变成具体内容。

**使用 PLANS.md 模板：** 对于更高级的工作流，你可以配置 Codex 对更长时间运行或多步骤工作遵循 `PLANS.md` 或 execution-plan template。更多详情请参阅 [execution plans guide](https://developers.openai.com/cookbook/articles/codex_exec_plans)。

## 用 `AGENTS.md` 让指导可复用

一旦某种 prompting 模式奏效，下一步就是停止手动重复它。这就是 [AGENTS.md](/mirror/codex/guides/agents-md) 的用途。

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

[`config.toml`](/mirror/codex/config-basic) 是定义持久偏好的地方，例如 MCP servers、multi-agent setup 和 feature flags。Profile-specific overrides 位于单独的 `$CODEX_HOME/profile-name.config.toml` 文件中。

Codex 附带 operating level sandboxing，并有两个你可以控制的关键旋钮。Approval mode 决定 Codex 何时请求你允许运行命令，sandbox mode 决定 Codex 是否可以在目录中读写，以及 agent 可以访问哪些文件。

如果你刚开始使用 coding agents，请从默认权限开始。默认情况下保持 approval 和 sandboxing 严格；只有在需求明确后，才为 trusted repos 或特定工作流放宽权限。

请注意，CLI、IDE 和 Codex app 都共享相同的配置层。可在 [sample configuration](/mirror/codex/config-sample) 页面了解更多。

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

在 Codex app 中切换 diff panel，可以直接在本地[审查更改](/mirror/codex/app/review)。点击特定行可以提供反馈，该反馈会作为上下文进入下一轮 Codex。

这里一个有用选项是 slash command `/review`，它提供几种代码审查方式：

- 针对 base branch 进行 PR-style review
- 审查 uncommitted changes
- 审查 commit
- 使用 custom review instructions

如果你和团队有 `code_review.md` 文件，并从 `AGENTS.md` 引用它，Codex 也可以在审查期间遵循该指导。对于希望 review behavior 在 repositories 和 contributors 之间保持一致的团队，这是一个强模式。

Codex 不应只是生成代码。通过正确 instructions，它还可以帮助**测试、检查和审查**代码。

如果你使用 GitHub Cloud，可以设置 Codex 对你的 PR 运行 [code reviews](/mirror/codex/integrations/github)。在 OpenAI，Codex 会审查 100% 的 PR。你可以启用自动审查，或让 Codex 在你 @Codex 时被动审查。

## 用 MCPs 获取外部上下文

当 Codex 需要的上下文位于 repo 之外时，请使用 MCPs。它让 Codex 连接到你已经使用的工具和系统，这样你不必反复把实时信息复制粘贴到 prompts 中。

[Model Context Protocol](/mirror/codex/mcp)，即 MCP，是一个把 Codex 连接到外部工具和系统的开放标准。

在以下情况下使用 MCP：

- 所需上下文位于 repo 之外
- 数据频繁变化
- 你希望 Codex 使用工具，而不是依赖粘贴的 instructions
- 你需要跨用户或项目的可重复 integration

Codex 支持带 OAuth 的 STDIO 和 Streamable HTTP servers。

在 Codex App 中，前往 Settings → MCP servers 查看 custom 和 recommended servers。通常 Codex 可以帮助你安装所需 servers。你只需要提出请求即可。你也可以在 CLI 中使用 `codex mcp add` 命令，带上名称、URL 和其他详情来添加自定义 servers。

只在工具能解锁真实工作流时添加工具。不要一开始就接入你使用的所有工具。从一两个明确能移除你已经经常手动执行循环的工具开始，然后再扩展。

## 将可重复工作变成 skills

一旦某个工作流变得可重复，就不要继续依赖长 prompts 或反复来回沟通。使用 [Skill](/mirror/codex/skills) 将 instructions、context 和 supporting logic 打包到 SKILL.md 文件中，让 Codex 一致地应用它们。Skills 可在 CLI、IDE extension 和 Codex app 中使用。

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

`$skill-creator` skill 是搭建第一个 skill 版本的最佳起点。迭代期间先保持第一版本地化。准备广泛共享时，将其打包成 [plugin](/mirror/codex/plugins/build)。Skill 最重要的部分之一是 description。它应该说明 skill 做什么以及何时使用。

Personal skills 存储在 `$HOME/.agents/skills`，shared team skills 可以提交到 repository 内的 `.agents/skills`。这对新 teammate onboarding 尤其有帮助。

## 用 automations 处理重复工作

一旦工作流稳定，你可以安排 Codex 在后台为你运行它。在 Codex app 中，[automations](/mirror/codex/app/automations) 让你选择 project、prompt、cadence 和 recurring task 的 execution environment。

当某个任务对你来说变得重复时，可以在 Codex app 的 Automations tab 中创建 automation。你可以选择它在哪个 project 中运行、运行的 prompt（可以调用 skills），以及运行 cadence。你还可以选择 automation 是在专用 git worktree 中运行，还是在你的本地环境中运行。了解更多 [git worktrees](/mirror/codex/app/worktrees)。

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

Codex app UI 让 thread management 最容易，因为你可以 pin threads 并创建 worktrees。如果你使用 CLI，以下 [slash commands](/mirror/codex/cli/slash-commands) 尤其有用：

- `/experimental` 用于切换 experimental features 并添加到 `config.toml`
- `/resume` 用于恢复已保存 conversation
- `/fork` 用于在保留原始 transcript 的同时创建新 thread
- `/compact` 用于在线程变长且你想要 earlier context 的 summary 版本时使用。请注意，Codex 也会自动为你 compact conversations
- `/agent` 用于在运行 parallel agents 时在 active agent thread 之间切换
- `/theme` 用于选择 syntax highlighting theme
- `/apps` 用于直接在 Codex 中使用 ChatGPT apps
- `/status` 用于检查当前 session state

每个 coherent unit of work 保持一个 thread。如果工作仍属于同一个问题，留在同一个 thread 通常更好，因为它会保留 reasoning trail。只有当工作真正分支时才 fork。

使用 Codex 的 [subagent](/mirror/codex/concepts/subagents) 工作流，将有边界的工作从主线程卸载出去。让 main agent 专注于核心问题，并使用 subagents 处理 exploration、tests 或 triage 等任务。

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

:::

## English source

::: details 展开英文原文
::: v-pre
If you’re new to Codex or coding agents in general, this guide will help you get better results faster. It covers the core habits that make Codex more effective across the [CLI](/mirror/codex/cli), [IDE extension](/mirror/codex/ide), and the [Codex app](/mirror/codex/app), from prompting and planning to validation, MCP, skills, and automations.

Codex works best when you treat it less like a one-off assistant and more like a teammate you configure and improve over time.

A useful way to think about this: start with the right task context, use `AGENTS.md` for durable guidance, configure Codex to match your workflow, connect external systems with MCP, turn repeated work into skills, and automate stable workflows.

## Strong first use: Context and prompts

Codex is already strong enough to be useful even when your prompt isn't perfect. You can often hand it a hard problem with minimal setup and still get a strong result. Clear [prompting](/mirror/codex/prompting) isn't required to get value, but it does make results more reliable, especially in larger codebases or higher-stakes tasks.

If you work in a large or complex repository, the biggest unlock is giving Codex the right task context and a clear structure for what you want done.

A good default is to include four things in your prompt:

- **Goal:** What are you trying to change or build?
- **Context:** Which files, folders, docs, examples, or errors matter for this task? You can @ mention certain files as context.
- **Constraints:** What standards, architecture, safety requirements, or conventions should Codex follow?
- **Done when:** What should be true before the task is complete, such as tests passing, behavior changing, or a bug no longer reproducing?

This helps Codex stay scoped, make fewer assumptions, and produce work that's easier to review.

Choose a reasoning level based on how hard the task is and test what works best for your workflow. Different users and tasks work best with different settings.

- Low for faster, well-scoped tasks
- Medium or High for more complex changes or debugging
- Extra High for long, agentic, reasoning-heavy tasks

To provide context faster, try using speech dictation inside the Codex app to
  dictate what you want Codex to do rather than typing it.

## Plan first for difficult tasks

If the task is complex, ambiguous, or hard to describe well, ask Codex to plan before it starts coding.

A few approaches work well:

**Use Plan mode:** For most users, this is the easiest and most effective option. Plan mode lets Codex gather context, ask clarifying questions, and build a stronger plan before implementation. Toggle with `/plan` or &lt;kbd&gt;Shift&lt;/kbd&gt;+&lt;kbd&gt;Tab&lt;/kbd&gt;.

**Ask Codex to interview you:** If you have a rough idea of what you want but aren't sure how to describe it well, ask Codex to question you first. Tell it to challenge your assumptions and turn the fuzzy idea into something concrete before writing code.

**Use a PLANS.md template:** For more advanced workflows, you can configure Codex to follow a `PLANS.md` or execution-plan template for longer-running or multi-step work. For more detail, see the [execution plans guide](https://developers.openai.com/cookbook/articles/codex_exec_plans).

## Make guidance reusable with `AGENTS.md`

Once a prompting pattern works, the next step is to stop repeating it manually. That's where [AGENTS.md](/mirror/codex/guides/agents-md) comes in.

Think of `AGENTS.md` as an open-format README for agents. It loads into context automatically and is the best place to encode how you and your team want Codex to work in a repository.

A good `AGENTS.md` covers:

- repo layout and important directories
- How to run the project
- Build, test, and lint commands
- Engineering conventions and PR expectations
- Constraints and do-not rules
- What done means and how to verify work

The `/init` slash command in the CLI is the quick-start command to scaffold a starter `AGENTS.md` in the current directory. It's a great starting point, but you should edit the result to match how your team actually builds, tests, reviews, and ships code.

You can create `AGENTS.md` files at different levels: a global `AGENTS.md` for personal defaults that sits in `~/.codex`, a repo-level file for shared standards, and more specific files in subdirectories for local rules. If there’s a more specific file closer to your current directory, that guidance wins.

Keep it practical. A short, accurate `AGENTS.md` is more useful than a long file full of vague rules. Start with the basics, then add new rules only after you notice repeated mistakes.

If `AGENTS.md` starts getting too large, keep the main file concise and reference task-specific markdown files for things like planning, code review, or architecture.

When Codex makes the same mistake twice, ask it for a retrospective and update
  `AGENTS.md`. Guidance stays practical and based on real friction.

## Configure Codex for consistency

Configuration is one of the main ways to make Codex behave more consistently across sessions and surfaces. For example, you can set defaults for model choice, reasoning effort, sandbox mode, approval policy, profiles, and MCP setup.

A good starting pattern is:

- Keep personal defaults in `~/.codex/config.toml` (Settings → Configuration → Open config.toml from the Codex app)
- Keep repo-specific behavior in `.codex/config.toml`
- Use command-line overrides only for one-off situations (if you use the CLI)

[`config.toml`](/mirror/codex/config-basic) is where you define durable preferences such as MCP servers, multi-agent setup, and feature flags. Profile-specific overrides live in separate `$CODEX_HOME/profile-name.config.toml` files.

Codex ships with operating level sandboxing and has two key knobs that you can control. Approval mode determines when Codex asks for your permission to run a command and sandbox mode determines if Codex can read or write in the directory and what files the agent can access.

If you're new to coding agents, start with the default permissions. Keep approval and sandboxing tight by default, then loosen permissions only for trusted repos or specific workflows once the need is clear.

Note that the CLI, IDE, and Codex app all share the same configuration layers. Learn more on the [sample configuration](/mirror/codex/config-sample) page.

Configure Codex for your real environment early. Many quality issues are
  really setup issues, like the wrong working directory, missing write access,
  wrong model defaults, or missing tools and connectors.

## Improve reliability with testing and review

Don't stop at asking Codex to make a change. Ask it to create tests when needed, run the relevant checks, confirm the result, and review the work before you accept it.

Codex can do this loop for you, but only if it knows what “good” looks like. That guidance can come from either the prompt or `AGENTS.md`.

That can include:

- Writing or updating tests for the change
- Running the right test suites
- Checking lint, formatting, or type checks
- Confirming the final behavior matches the request
- Reviewing the diff for bugs, regressions, or risky patterns

Toggle the diff panel in the Codex app to directly [review changes](/mirror/codex/app/review) locally. Click on a specific row to provide
  feedback that gets fed as context to the next Codex turn.

A useful option here is the slash command `/review`, which gives you a few ways to review code:

- Review against a base branch for PR-style review
- Review uncommitted changes
- Review a commit
- Use custom review instructions

If you and your team have a `code_review.md` file and reference it from `AGENTS.md`, Codex can follow that guidance during review as well. This is a strong pattern for teams that want review behavior to stay consistent across repositories and contributors.

Codex shouldn't just generate code. With the right instructions, it can also help **test it, check it, and review it**.

If you use GitHub Cloud, you can set up Codex to run [code reviews for your PRs](/mirror/codex/integrations/github). At OpenAI, Codex reviews 100% of PRs. You can enable automatic reviews or have Codex reactively review when you @Codex.

## Use MCPs for external context

Use MCPs when the context Codex needs lives outside the repo. It lets Codex connect to the tools and systems you already use, so you don't have to keep copying and pasting live information into prompts.

[Model Context Protocol](/mirror/codex/mcp), or MCP, is an open standard for connecting Codex to external tools and systems.

Use MCP when:

- The needed context lives outside the repo
- The data changes frequently
- You want Codex to use a tool rather than rely on pasted instructions
- You need a repeatable integration across users or projects

Codex supports both STDIO and Streamable HTTP servers with OAuth.

In the Codex App, head to Settings → MCP servers to see custom and recommended servers. Often, Codex can help you install the needed servers. All you need to do is ask. You can also use the `codex mcp add` command in the CLI to add your custom servers with a name, URL, and other details.

Add tools only when they unlock a real workflow. Do not start by wiring in
  every tool you use. Start with one or two tools that clearly remove a manual
  loop you already do often, then expand from there.

## Turn repeatable work into skills

Once a workflow becomes repeatable, stop relying on long prompts or repeated back-and-forth. Use a [Skill](/mirror/codex/skills) to package the instructions in a SKILL.md file, context, and supporting logic Codex should apply consistently. Skills work across the CLI, IDE extension, and Codex app.

Keep each skill scoped to one job. Start with 2 to 3 concrete use cases, define clear inputs and outputs, and write the description so it says what the skill does and when to use it. Include the kinds of trigger phrases a user would actually say.

Don't try to cover every edge case up front. Start with one representative task, get it working well, then turn that workflow into a skill and improve from there. Include scripts or extra assets only when they improve reliability.

A good rule of thumb: if you keep reusing the same prompt or correcting the same workflow, it should probably become a skill.

Skills are especially useful for recurring jobs like:

- Log triage
- Release note drafting
- PR review against a checklist
- Migration planning
- Telemetry or incident summaries
- Standard debugging flows

The `$skill-creator` skill is the best place to start to scaffold the first version of a skill. Keep the first version local while you iterate. When it's ready to share broadly, package it as a [plugin](/mirror/codex/plugins/build). One of the most important parts of a skill is the description. It should say what the skill does and when to use it.

Personal skills are stored in `$HOME/.agents/skills`, and shared team skills
  can be checked into `.agents/skills` inside a repository. This is especially
  helpful for onboarding new teammates.

## Use automations for repeated work

Once a workflow is stable, you can schedule Codex to run it in the background for you. In the Codex app, [automations](/mirror/codex/app/automations) let you choose the project, prompt, cadence, and execution environment for a recurring task.

Once a task becomes repetitive for you, you can create an automation in the Automations tab on the Codex app. You can choose which project it runs in, the prompt it runs (you can invoke skills), and the cadence it will run. You can also choose whether the automation runs in a dedicated git worktree or in your local environment. Learn more about [git worktrees](/mirror/codex/app/worktrees).

Good candidates include:

- Summarizing recent commits
- Scanning for likely bugs
- Drafting release notes
- Checking CI failures
- Producing standup summaries
- Running repeatable analysis workflows on a schedule

A useful rule is that skills define the method, automations define the schedule. If a workflow still needs a lot of steering, turn it into a skill first. Once it's predictable, automation becomes a force multiplier.

Use automations for reflection and maintenance, not just execution. Review
  recent sessions, summarize repeated friction, and improve prompts,
  instructions, or workflow setup over time.

## Organize long-running work with session controls

Codex sessions aren't just chat history. They're working threads that accumulate context, decisions, and actions over time, so managing them well has a big impact on quality.

The Codex app UI makes thread management easiest because you can pin threads and create worktrees. If you are using the CLI, these [slash commands](/mirror/codex/cli/slash-commands) are especially useful:

- `/experimental` to toggle experimental features and add to your `config.toml`
- `/resume` to resume a saved conversation
- `/fork` to create a new thread while preserving the original transcript
- `/compact` when the thread is getting long and you want a summarized version of earlier context. Note that Codex does automatically compact conversations for you
- `/agent` when you are running parallel agents and want to switch between the active agent thread
- `/theme` to choose a syntax highlighting theme
- `/apps` to use ChatGPT apps directly in Codex
- `/status` to inspect the current session state

Keep one thread per coherent unit of work. If the work is still part of the same problem, staying in the same thread is often better because it preserves the reasoning trail. Fork only when the work truly branches.

Use Codex’s [subagent](/mirror/codex/concepts/subagents) workflows to offload bounded
  work from the main thread. Keep the main agent focused on the core problem,
  and use subagents for tasks like exploration, tests, or triage.

## Common mistakes

A few common mistakes to avoid when first using Codex:

- Overloading the prompt with durable rules instead of moving them into `AGENTS.md` or a skill
- Not letting the agent see its work by not giving details on how to best run build and test commands
- Skipping planning on multi-step and complex tasks
- Giving Codex full permission to your computer before you understand the workflow
- Running live threads on the same files without using git worktrees
- Turning a recurring task into an automation before it's reliable manually
- Treating Codex like something you have to watch step by step instead of using it in parallel with your own work
- Using one thread per project instead of one thread per task. This leads to bloated context and worse results over time

:::
:::

