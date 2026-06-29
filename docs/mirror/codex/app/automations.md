---
title: "Automations 自动化"
description: "Schedule recurring Codex tasks"
outline: deep
---

# Automations 自动化

**文档集**：Codex  
**分组**：Codex — App  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/app/automations](https://developers.openai.com/codex/app/automations)
- Markdown 来源：[https://developers.openai.com/codex/app/automations.md](https://developers.openai.com/codex/app/automations.md)
- 抓取时间：2026-06-27T05:54:50.271Z
- Checksum：`a2b4118551abe0dd861486b40c238ac168b3909529dd665be7079b1b8b8305c8`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre




在后台自动执行重复任务。Codex 会将发现添加到 inbox，或者在没有可报告内容时自动归档任务。你可以将 automations 与 [skills](/mirror/codex/skills) 结合，用于更复杂的任务。

对于 project-scoped automations，运行本地 Codex app 的机器必须处于开机状态，Codex 必须正在运行，并且 automation 计划运行时，所选 project 仍必须在磁盘上可用。

在 Git repositories 中，你可以选择让 automation 在本地 project 中运行，或在新的 [worktree](/mirror/codex/app/worktrees) 上运行。两种选项都会在后台运行。Worktrees 会将 automation changes 与未完成的本地工作隔离；而在本地 project 中运行可能会修改你仍在处理的文件。在非版本控制项目中，automations 会直接在 project directory 中运行。

你也可以让 model 和 reasoning effort 保持默认设置，或在想要更精细控制 automation 运行方式时显式选择它们。



&lt;CodexScreenshot
  alt="包含 schedule 和 prompt 字段的 automation 创建表单"
  lightSrc="/images/codex/app/codex-automations-light.webp"
  darkSrc="/images/codex/app/codex-automations-dark.webp"
  maxHeight="400px"
/&gt;



## 管理任务

在 Codex app sidebar 的 automations pane 中查找所有 automations 及其 runs。

"Triage" section 充当你的 inbox。带有 findings 的 automation runs 会显示在那里，你可以筛选 inbox，以显示所有 automation runs 或仅显示 unread ones。

Standalone automations 会按计划启动全新的 runs，并在 Triage 中报告结果。当每次 run 都应独立，或某个 automation 应跨一个或多个 projects 运行时，请使用它们。如果需要自定义节奏，请选择 custom schedule 并输入 cron syntax。

对于 Git repositories，每个 automation 都可以在你的本地 project 中运行，或在专用后台 [worktree](/mirror/codex/app/features#worktree-support) 上运行。当你想将 automation changes 与未完成的本地工作隔离时，请使用 worktrees。当你希望 automation 直接在主 checkout 中工作时，请使用 local mode，同时记住它可能更改你正在主动编辑的文件。在非版本控制项目中，automations 会直接在 project directory 中运行。同一个 automation 可以在多个 project 上运行。

Automations 使用你的默认 sandbox settings。在 read-only mode 中，如果 tool calls 需要修改文件、访问网络或使用你电脑上的 apps，就会失败。启用 full access 时，background automations 具有更高风险。你可以在 [Settings](/mirror/codex/app/settings) 中调整 sandbox settings，并使用 [rules](/mirror/codex/rules) 选择性 allowlist commands。

Automations 可以使用 Codex 可用的相同 plugins 和 skills。为保持 automations 易于维护并可在团队间共享，请使用 [skills](/mirror/codex/skills) 定义 action，并提供 tools 和 context。你可以在 automation 中使用 `$skill-name` 显式触发 skill。

## 请求 Codex 创建或更新 automations

你可以从普通 Codex thread 创建和更新 automations。描述任务、schedule，以及 automation 应保持附着在当前 thread，还是启动全新的 runs。Codex 可以起草 automation prompt、选择合适的 automation type，并在 scope 或 cadence 变化时更新它。

例如，请 Codex 在此 thread 中提醒你直到 deployment 完成，或请它创建一个 standalone automation，按重复 schedule 检查某个 project。

Skills 也可以创建或更新 automations。例如，一个用于 babysitting pull request 的 skill 可以设置 recurring automation，使用 GitHub plugin 检查 PR status，并修复新的 review feedback。

## Thread automations

Thread automations 是附着在当前 thread 上的 heartbeat-style recurring wake-up calls。当你希望 Codex 按计划不断回到同一 conversation 时，请使用它们。

当 scheduled work 应保留 thread context，而不是每次都从新 prompt 开始时，请使用 thread automation。

Thread automations 可以使用基于分钟的 intervals 来进行活跃 follow-up loops，也可以在需要特定时间 check-in 时使用 daily 和 weekly schedules。

Thread automations 适用于：

- 检查 long-running command，直到它完成
- 轮询 Slack、GitHub 或其他 connected source，并且结果应保留在同一 thread 中
- 提醒 Codex 以固定 cadence 继续 review loop
- 运行使用 plugins 的 skill-driven workflow，例如检查 PR status 并处理新 feedback
- 让 chat 聚焦在持续进行的 research 或 triage task 上

当每次 run 都应独立、需要跨多个 project 运行，或 findings 应作为单独 automation runs 显示在 Triage 中时，请使用 standalone 或 project automation。

创建 thread automation 时，请让 prompt 具备持久性。它应描述每次 thread 唤醒时 Codex 应做什么、如何判断是否有重要内容需要报告，以及何时停止或向你请求输入。

## 测试 automations

在安排 automation 之前，先在普通 thread 中手动测试 prompt。这有助于确认：

- prompt 清晰且 scope 正确。
- 所选或默认 model、reasoning effort 和 tools 的行为符合预期。
- 生成的 diff 可 review。

开始安排 runs 后，请 review 前几次输出，并根据需要调整 prompt 或 cadence。

## Automations 的 worktree 清理

如果你为 Git repositories 选择 worktrees，频繁的 schedules 可能会随时间创建许多 worktrees。归档不再需要的 automation runs，并避免 pin runs，除非你打算保留它们的 worktrees。

## 权限和安全模型

Automations 会无人值守运行，并使用你的默认 sandbox settings。

- 如果你的 sandbox mode 是 **read-only**，当 tool calls 需要修改文件、访问网络或使用你电脑上的 apps 时会失败。请考虑将 sandbox settings 更新为 workspace write。
- 如果你的 sandbox mode 是 **workspace-write**，当 tool calls 需要修改 workspace 外的文件、访问网络或使用你电脑上的 apps 时会失败。你可以使用 [rules](/mirror/codex/rules) 选择性 allowlist commands，以便在 sandbox 外运行。
- 如果你的 sandbox mode 是 **full access**，background automations 具有更高风险，因为 Codex 可能会更改文件、运行命令并访问网络，而不会询问。请考虑将 sandbox settings 更新为 workspace write，并使用 [rules](/mirror/codex/rules) 选择性定义 agent 可以用 full access 运行哪些 commands。

如果你处于 managed environment 中，admins 可以使用 admin-enforced requirements 限制这些行为。例如，他们可以禁止 `approval_policy = "never"`，或约束允许的 sandbox modes。参见 [Admin-enforced requirements (`requirements.toml`)](/mirror/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml)。

当你的 organization policy 允许时，Automations 会使用 `approval_policy = "never"`。如果 admin requirements 禁止 `approval_policy = "never"`，automations 会回退到你所选 mode 的 approval behavior。

## 示例

### 自动创建新 skills

```markdown
Scan all of the `~/.codex/sessions` files from the past day and if there have been any issues using particular skills, update the skills to be more helpful. Personal skills only, no repo skills.

If there’s anything we’ve been doing often and struggle with that we should save as a skill to speed up future work, let’s do it.

Definitely don't feel like you need to update any- only if there's a good reason!

Let me know if you make any.
```

### 让你随时了解 project 最新情况

```markdown
Look at the latest remote origin/master or origin/main . Then produce an exec briefing for the last 24 hours of commits that touch <DIRECTORY>

Formatting + structure:

- Use rich Markdown (H1 workstream sections, italics for the subtitle, horizontal rules as needed).
- Preamble can read something like “Here’s the last 24h brief for <directory>:”
- Subtitle should read: “Narrative walkthrough with owners; grouped by workstream.”
- Group by workstream rather than listing each commit. Workstream titles should be H1.
- Write a short narrative per workstream that explains the changes in plain language.
- Use bullet points and bolding when it makes things more readable
- Feel free to make bullets per person, but bold their name

Content requirements:

- Include PR links inline (e.g., [#123](...)) without a “PRs:” label.
- Do NOT include commit hashes or a “Key commits” section.
- It’s fine if multiple PRs appear under one workstream, but avoid per‑commit bullet lists.

Scope rules:

- Only include changes within the current cwd (or main checkout equivalent)
- Only include the last 24h of commits.
- Use `gh` to fetch PR titles and descriptions if it helps.
  Also feel free to pull PR reviews and comments
```

### 将 automations 与 skills 结合来修复自己的 bugs

创建一个新 skill，尝试修复由你自己的 commits 引入的 bug，方式是创建新的 `$recent-code-bugfix` 并[将它存储在你的 personal skills 中](/mirror/codex/skills#where-to-save-skills)。

```markdown
---
name: recent-code-bugfix
description: Find and fix a bug introduced by the current author within the last week in the current working directory. Use when a user wants a proactive bugfix from their recent changes, when the prompt is empty, or when asked to triage/fix issues caused by their recent commits. Root cause must map directly to the author’s own changes.
---

# Recent Code Bugfix

## Overview

Find a bug introduced by the current author in the last week, implement a fix, and verify it when possible. Operate in the current working directory, assume the code is local, and ensure the root cause is tied directly to the author’s own edits.

## Workflow

### 1) Establish the recent-change scope

Use Git to identify the author and changed files from the last week.

- Determine the author from `git config user.name`/`user.email`. If unavailable, use the current user’s name from the environment or ask once.
- Use `git log --since=1.week --author=<author>` to list recent commits and files. Focus on files touched by those commits.
- If the user’s prompt is empty, proceed directly with this default scope.

### 2) Find a concrete failure tied to recent changes

Prioritize defects that are directly attributable to the author’s edits.

- Look for recent failures (tests, lint, runtime errors) if logs or CI outputs are available locally.
- If no failures are provided, run the smallest relevant verification (single test, file-level lint, or targeted repro) that touches the edited files.
- Confirm the root cause is directly connected to the author’s changes, not unrelated legacy issues. If only unrelated failures are found, stop and report that no qualifying bug was detected.

### 3) Implement the fix

Make a minimal fix that aligns with project conventions.

- Update only the files needed to resolve the issue.
- Avoid adding extra defensive checks or unrelated refactors.
- Keep changes consistent with local style and tests.

### 4) Verify

Attempt verification when possible.

- Prefer the smallest validation step (targeted test, focused lint, or direct repro command).
- If verification cannot be run, state what would be run and why it wasn’t executed.

### 5) Report

Summarize the root cause, the fix, and the verification performed. Make it explicit how the root cause ties to the author’s recent changes.
```

之后，创建一个新 automation：

```markdown
Check my commits from the last 24h and submit a $recent-code-bugfix.
```

:::

## English source

::: details 展开英文原文
::: v-pre




Automate recurring tasks in the background. Codex adds findings to the inbox, or automatically archives the task if there's nothing to report. You can combine automations with [skills](/mirror/codex/skills) for more complex tasks.

For project-scoped automations, the machine running the local Codex app must be
powered on, Codex must be running, and the selected project must still be
available on disk when the automation is scheduled to run.

In Git repositories, you can choose whether an automation runs in your local
project or on a new [worktree](/mirror/codex/app/worktrees). Both options run in the
background. Worktrees keep automation changes separate from unfinished local
work, while running in your local project can modify files you are still
working on. In non-version-controlled projects, automations run directly in the
project directory.

You can also leave the model and reasoning effort on their default settings, or
choose them explicitly if you want more control over how the automation runs.



&lt;CodexScreenshot
  alt="Automation creation form with schedule and prompt fields"
  lightSrc="/images/codex/app/codex-automations-light.webp"
  darkSrc="/images/codex/app/codex-automations-dark.webp"
  maxHeight="400px"
/&gt;



## Managing tasks

Find all automations and their runs in the automations pane inside your Codex app sidebar.

The "Triage" section acts as your inbox. Automation runs with findings show up there, and you can filter your inbox to show all automation runs or only unread ones.

Standalone automations start fresh runs on a schedule and report results in
Triage. Use them when each run should be independent or when one automation
should run across one or more projects. If you need a custom cadence, choose a
custom schedule and enter cron syntax.

For Git repositories, each automation can run either in your local project or
on a dedicated background [worktree](/mirror/codex/app/features#worktree-support). Use
worktrees when you want to isolate automation changes from unfinished local
work. Use local mode when you want the automation to work directly in your main
checkout, keeping in mind that it can change files you are actively editing.
In non-version-controlled projects, automations run directly in the project
directory. You can have the same automation run on more than one project.

Automations use your default sandbox settings. In read-only mode, tool calls fail if they require modifying files, network access, or working with apps on your computer. With full access enabled, background automations carry elevated risk. You can adjust sandbox settings in [Settings](/mirror/codex/app/settings) and selectively allowlist commands with [rules](/mirror/codex/rules).

Automations can use the same plugins and skills available to Codex. To keep
automations maintainable and shareable across teams, use [skills](/mirror/codex/skills)
to define the action and provide tools and context. You can explicitly trigger a
skill as part of an automation by using `$skill-name` inside your automation.

## Ask Codex to create or update automations

You can create and update automations from a regular Codex thread. Describe the
task, the schedule, and whether the automation should stay attached to the
current thread or start fresh runs. Codex can draft the automation prompt, choose
the right automation type, and update it when the scope or cadence changes.

For example, ask Codex to remind you in this thread while a deployment finishes,
or ask it to create a standalone automation that checks a project on a recurring
schedule.

Skills can also create or update automations. For example, a skill for
babysitting a pull request could set up a recurring automation that checks the
PR status with the GitHub plugin and fixes new review feedback.

## Thread automations

Thread automations are heartbeat-style recurring wake-up calls attached to the
current thread. Use them when you want Codex to keep returning to the same
conversation on a schedule.

Use a thread automation when the scheduled work should preserve the thread's
context instead of starting from a new prompt each time.

Thread automations can use minute-based intervals for active follow-up loops,
or daily and weekly schedules when you need a check-in at a specific time.

Thread automations are useful for:

- checking a long-running command until it finishes
- polling Slack, GitHub, or another connected source when the results should
  stay in the same thread
- reminding Codex to continue a review loop at a fixed cadence
- running a skill-driven workflow that uses plugins, such as checking PR status
  and addressing new feedback
- keeping a chat focused on an ongoing research or triage task

Use a standalone or project automation when each run should be independent,
when it should run across more than one project, or when findings should appear
as separate automation runs in Triage.

When you create a thread automation, make the prompt durable. It should
describe what Codex should do each time the thread wakes up, how to decide
whether there is anything important to report, and when to stop or ask you for
input.

## Test automations

Before you schedule an automation, test the prompt manually in a regular thread
first. This helps you confirm:

- The prompt is clear and scoped correctly.
- The selected or default model, reasoning effort, and tools behave as expected.
- The resulting diff is reviewable.

When you start scheduling runs, review the first few outputs and adjust the
prompt or cadence as needed.

## Worktree cleanup for automations

If you choose worktrees for Git repositories, frequent schedules can create
many worktrees over time. Archive automation runs you no longer need, and avoid
pinning runs unless you intend to keep their worktrees.

## Permissions and security model

Automations run unattended and use your default sandbox settings.

- If your sandbox mode is **read-only**, tool calls fail if they require
  modifying files, accessing network, or working with apps on your computer.
  Consider updating sandbox settings to workspace write.
- If your sandbox mode is **workspace-write**, tool calls fail if they require
  modifying files outside the workspace, accessing network, or working with apps
  on your computer. You can selectively allowlist commands to run outside the
  sandbox using [rules](/mirror/codex/rules).
- If your sandbox mode is **full access**, background automations carry
  elevated risk, as Codex may change files, run commands, and access network
  without asking. Consider updating sandbox settings to workspace write, and
  using [rules](/mirror/codex/rules) to selectively define which commands the agent
  can run with full access.

If you are in a managed environment, admins can restrict these behaviors using
admin-enforced requirements. For example, they can disallow `approval_policy =
"never"` or constrain allowed sandbox modes. See
[Admin-enforced requirements (`requirements.toml`)](/mirror/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml).

Automations use `approval_policy = "never"` when your organization policy
allows it. If admin requirements disallow `approval_policy = "never"`,
automations fall back to the approval behavior of your selected mode.

## Examples

### Automatically create new skills

```markdown
Scan all of the `~/.codex/sessions` files from the past day and if there have been any issues using particular skills, update the skills to be more helpful. Personal skills only, no repo skills.

If there’s anything we’ve been doing often and struggle with that we should save as a skill to speed up future work, let’s do it.

Definitely don't feel like you need to update any- only if there's a good reason!

Let me know if you make any.
```

### Stay up-to-date with your project

```markdown
Look at the latest remote origin/master or origin/main . Then produce an exec briefing for the last 24 hours of commits that touch <DIRECTORY>

Formatting + structure:

- Use rich Markdown (H1 workstream sections, italics for the subtitle, horizontal rules as needed).
- Preamble can read something like “Here’s the last 24h brief for <directory>:”
- Subtitle should read: “Narrative walkthrough with owners; grouped by workstream.”
- Group by workstream rather than listing each commit. Workstream titles should be H1.
- Write a short narrative per workstream that explains the changes in plain language.
- Use bullet points and bolding when it makes things more readable
- Feel free to make bullets per person, but bold their name

Content requirements:

- Include PR links inline (e.g., [#123](...)) without a “PRs:” label.
- Do NOT include commit hashes or a “Key commits” section.
- It’s fine if multiple PRs appear under one workstream, but avoid per‑commit bullet lists.

Scope rules:

- Only include changes within the current cwd (or main checkout equivalent)
- Only include the last 24h of commits.
- Use `gh` to fetch PR titles and descriptions if it helps.
  Also feel free to pull PR reviews and comments
```

### Combining automations with skills to fix your own bugs

Create a new skill that tries to fix a bug introduced by your own commits by creating a new `$recent-code-bugfix` and [store it in your personal skills](/mirror/codex/skills#where-to-save-skills).

```markdown
---
name: recent-code-bugfix
description: Find and fix a bug introduced by the current author within the last week in the current working directory. Use when a user wants a proactive bugfix from their recent changes, when the prompt is empty, or when asked to triage/fix issues caused by their recent commits. Root cause must map directly to the author’s own changes.
---

# Recent Code Bugfix

## Overview

Find a bug introduced by the current author in the last week, implement a fix, and verify it when possible. Operate in the current working directory, assume the code is local, and ensure the root cause is tied directly to the author’s own edits.

## Workflow

### 1) Establish the recent-change scope

Use Git to identify the author and changed files from the last week.

- Determine the author from `git config user.name`/`user.email`. If unavailable, use the current user’s name from the environment or ask once.
- Use `git log --since=1.week --author=<author>` to list recent commits and files. Focus on files touched by those commits.
- If the user’s prompt is empty, proceed directly with this default scope.

### 2) Find a concrete failure tied to recent changes

Prioritize defects that are directly attributable to the author’s edits.

- Look for recent failures (tests, lint, runtime errors) if logs or CI outputs are available locally.
- If no failures are provided, run the smallest relevant verification (single test, file-level lint, or targeted repro) that touches the edited files.
- Confirm the root cause is directly connected to the author’s changes, not unrelated legacy issues. If only unrelated failures are found, stop and report that no qualifying bug was detected.

### 3) Implement the fix

Make a minimal fix that aligns with project conventions.

- Update only the files needed to resolve the issue.
- Avoid adding extra defensive checks or unrelated refactors.
- Keep changes consistent with local style and tests.

### 4) Verify

Attempt verification when possible.

- Prefer the smallest validation step (targeted test, focused lint, or direct repro command).
- If verification cannot be run, state what would be run and why it wasn’t executed.

### 5) Report

Summarize the root cause, the fix, and the verification performed. Make it explicit how the root cause ties to the author’s recent changes.
```

Afterward, create a new automation:

```markdown
Check my commits from the last 24h and submit a $recent-code-bugfix.
```

:::
:::

