---
title: "故障排除"
description: "FAQ and fixes for common Codex app issues"
outline: deep
---

# 故障排除

**文档集**：Codex\
**分组**：应用\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/app/troubleshooting](https://developers.openai.com/codex/app/troubleshooting)
- Markdown 来源：[https://developers.openai.com/codex/app/troubleshooting.md](https://developers.openai.com/codex/app/troubleshooting.md)
- 抓取时间：2026-06-27T05:54:52.323Z
- Checksum：`197ce2811a279bc0a7b4dad25fb092d1adae472ae3f4556387798753057221c0`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 常见问题

### Side panel 中出现了 Codex 没有编辑的 files

如果你的 project 位于 Git repository 中，review panel 会根据 project 的 Git state 自动显示 changes，包括并非 Codex 做出的 changes。

在 review pane 中，你可以在 staged changes 和尚未 staged 的 changes 之间切换，并将你的 branch 与 main 比较。

如果你只想查看上一次 Codex turn 的 changes，请将 diff pane 切换到 "Last turn changes" view。

[进一步了解如何使用 review pane](/mirror/codex/app/review)。

### 从 sidebar 移除 project

要从 sidebar 移除 project，请 hover project name，点击三个点并选择 "Remove."。要恢复它，请使用 **Threads** 旁边的 **Add new project** button 或使用

Cmd</kbd>+<kbd>O

重新添加 project。

### 查找 archived threads

Archived threads 可在 [Settings](codex://settings) 中找到。取消归档 thread 后，它会重新出现在 sidebar 的原始位置。

### sidebar 中只显示部分 threads

Sidebar 允许根据 project state 筛选 threads。如果缺少 threads，请点击 **Threads** label 旁边的 filter icon，并切换到 Chronological。如果仍然看不到 thread，请打开 [Settings](codex://settings)，并检查 archived chats 或 archived threads section。

### Code 无法在 worktree 上运行

Worktrees 会在不同目录中创建，并默认继承已提交到 Git 的 files。取决于你如何管理 project 的 dependencies 和 tooling，你可能需要使用 [local environment](/mirror/codex/app/local-environments) 在 worktree 上运行 setup scripts，或使用 [`.worktreeinclude`](/mirror/codex/app/worktrees#copy-ignored-local-files-into-managed-worktrees) 复制 ignored setup files。或者，你可以在常规本地 project 中 check out changes。更多信息请参阅 [worktrees documentation](/mirror/codex/app/worktrees)。

### App 没有识别 teammate 共享的 local environment

Local environment configuration 必须位于 project root 的 `.codex` folder 中。如果你在包含多个 project 的 monorepo 中工作，请确保你在包含 `.codex` folder 的目录中打开 project。

### Codex 要求访问 Apple Music

根据你的 task，Codex 可能需要导航 file system。macOS 上的某些 directories，包括 Music、Downloads 或 Desktop，需要用户额外 approval。如果 Codex 需要读取你的 home directory，macOS 会提示你批准访问这些 folders。

### Automations 创建了许多 worktrees

频繁的 automations 会随时间创建许多 worktrees。归档不再需要的 automation runs，并避免 pinning runs，除非你打算保留它们的 worktrees。

### 选择错误 target 后恢复 prompt

如果你意外使用错误 target（**Local**、**Worktree** 或 **Cloud**）启动了 thread，可以取消当前 run，并通过在 composer 中按上箭头键恢复之前的 prompt。

### 功能在 Codex CLI 中可用，但在 Codex app 中不可用

Codex app 和 Codex CLI 使用相同的底层 Codex agent 和 configuration，但它们在任何时候可能依赖不同版本的 agent，且一些 experimental features 可能会先进入 Codex CLI。

要获取系统上的 Codex CLI 版本，请运行：

```bash
codex --version
```

要获取 Codex app bundled 的 Codex 版本，请运行：

```bash
/Applications/Codex.app/Contents/Resources/codex --version
```

## Feedback 和 logs

在 message composer 中输入 &lt;kbd&gt;/&lt;/kbd&gt;，向团队提供 feedback。如果你在现有 conversation 中触发 feedback，可以选择将现有 session 连同 feedback 一起分享。提交 feedback 后，你会收到一个 session ID，可以与团队共享。

报告 issue：

1. 在 Codex GitHub repo 上查找 [existing issues](https://github.com/openai/codex/issues)。
2. [打开新的 GitHub issue](https://github.com/openai/codex/issues/new?template=2-bug-report.yml&steps=Uploaded%20thread%3A%20019c0d37-d2b6-74c0-918f-0e64af9b6e14)。

更多 logs 可在以下位置获得：

- App logs（macOS）：`~/Library/Logs/com.openai.codex/YYYY/MM/DD`
- Session transcripts：`$CODEX_HOME/sessions`（默认：`~/.codex/sessions`）
- Archived sessions：`$CODEX_HOME/archived_sessions`（默认：`~/.codex/archived_sessions`）

如果你分享 logs，请先 review 它们，确认其中不包含 sensitive information。

## Stuck states 和 recovery patterns

如果 thread 看起来 stuck：

1. 检查 Codex 是否正在等待 approval。
2. 打开 terminal 并运行 `git status` 这样的 basic command。
3. 用更小、更聚焦的 prompt 启动新 thread。

如果你误取消 worktree creation 并丢失 prompt，请在 composer 中按上箭头键恢复。

## Terminal issues

**Terminal 看起来 stuck**

1. 关闭 terminal panel。
2. 使用 &lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;J&lt;/kbd&gt; 重新打开它。
3. 重新运行 `pwd` 或 `git status` 这样的 basic command。

如果 commands 的行为与预期不同，请先在 terminal 中验证当前 directory 和 branch。

如果它持续 stuck，请等到 active Codex threads 完成后重启 app。

**Fonts 无法正确渲染**

Codex 会在 review pane、integrated terminal，以及 app 内显示的任何其他 code 中使用同一种 font。你可以在 [Settings](codex://settings) pane 中将其配置为 **Code font**。

:::

## English source

::: details 展开英文原文
::: v-pre
## Frequently Asked Questions

### Files appear in the side panel that Codex didn't edit

If your project is inside a Git repository, the review panel automatically
shows changes based on your project's Git state, including changes that Codex
didn't make.

In the review pane, you can switch between staged changes and changes not yet
staged, and compare your branch with main.

If you want to see only the changes of your last Codex turn, switch the diff
pane to the "Last turn changes" view.

[Learn more about how to use the review pane](/mirror/codex/app/review).

### Remove a project from the sidebar

To remove a project from the sidebar, hover over the name of your project, click
the three dots and choose "Remove." To restore it, re-add the
project using the **Add new project** button next to **Threads** or using

&lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;O&lt;/kbd&gt;.

### Find archived threads

Archived threads can be found in the [Settings](codex://settings). When you
unarchive a thread it will reappear in the original location of your sidebar.

### Only some threads appear in the sidebar

The sidebar allows filtering of threads depending on the state of a project. If
you're missing threads, click the filter icon next to the **Threads** label and
switch to Chronological. If you still don't see the thread, open
[Settings](codex://settings) and check the archived chats or archived threads
section.

### Code doesn't run on a worktree

Worktrees are created in a different directory and inherit files checked into
Git by default. Depending on how you manage dependencies and tooling for your
project, you might have to run setup scripts on your worktree using a
[local environment](/mirror/codex/app/local-environments) or copy ignored setup files
with [`.worktreeinclude`](/mirror/codex/app/worktrees#copy-ignored-local-files-into-managed-worktrees).
Alternatively, you can check out the changes in your regular local project. See
the [worktrees documentation](/mirror/codex/app/worktrees) to learn more.

### App doesn't pick up a teammate's shared local environment

The local environment configuration must be inside the `.codex` folder at the
root of your project. If you are working in a monorepo with more than one
project, make sure you open the project in the directory that contains the
`.codex` folder.

### Codex asks to access Apple Music

Depending on your task, Codex may need to navigate the file system. Certain
directories on macOS, including Music, Downloads, or Desktop, require
additional approval from the user. If Codex needs to read your home directory,
macOS prompts you to approve access to those folders.

### Automations create many worktrees

Frequent automations can create many worktrees over time. Archive automation
runs you no longer need and avoid pinning runs unless you intend to keep their
worktrees.

### Recover a prompt after selecting the wrong target

If you started a thread with the wrong target (**Local**, **Worktree**, or **Cloud**) by accident, you can cancel the current run and recover your previous prompt by pressing the up arrow key in the composer.

### Feature is working in the Codex CLI but not in the Codex app

The Codex app and Codex CLI use the same underlying Codex agent and configuration but might rely on different versions of the agent at any time and some experimental features might land in the Codex CLI first.

To get the version of the Codex CLI on your system run:

```bash
codex --version
```

To get the version of Codex bundled with your Codex app run:

```bash
/Applications/Codex.app/Contents/Resources/codex --version
```

## Feedback and logs

Type &lt;kbd&gt;/&lt;/kbd&gt; into the message composer to provide feedback for the team. If
you trigger feedback in an existing conversation, you can choose to share the
existing session along with your feedback. After submitting your feedback,
you'll receive a session ID that you can share with the team.

To report an issue:

1. Find [existing issues](https://github.com/openai/codex/issues) on the Codex GitHub repo.
2. [Open a new GitHub issue](https://github.com/openai/codex/issues/new?template=2-bug-report.yml&steps=Uploaded%20thread%3A%20019c0d37-d2b6-74c0-918f-0e64af9b6e14)

More logs are available in the following locations:

- App logs (macOS): `~/Library/Logs/com.openai.codex/YYYY/MM/DD`
- Session transcripts: `$CODEX_HOME/sessions` (default: `~/.codex/sessions`)
- Archived sessions: `$CODEX_HOME/archived_sessions` (default: `~/.codex/archived_sessions`)

If you share logs, review them first to confirm they don't contain sensitive
information.

## Stuck states and recovery patterns

If a thread appears stuck:

1. Check whether Codex is waiting for an approval.
2. Open the terminal and run a basic command like `git status`.
3. Start a new thread with a smaller, more focused prompt.

If you cancel worktree creation by mistake and lose your prompt, press the up
arrow key in the composer to recover it.

## Terminal issues

**Terminal appears stuck**

1. Close the terminal panel.
2. Reopen it with &lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;J&lt;/kbd&gt;.
3. Re-run a basic command like `pwd` or `git status`.

If commands behave differently than expected, validate the current directory and
branch in the terminal first.

If it continues to be stuck, wait until your active Codex threads are completed and restart the app.

**Fonts aren't rendering correctly**

Codex uses the same font for the review pane, integrated terminal and any other code displayed inside the app. You can configure the font inside the [Settings](codex://settings) pane as **Code font**.

:::
:::

