---
title: "Review"
description: "Review and iterate with Codex on changes inside the app"
outline: deep
---

# Review

**文档集**：Codex  
**分组**：Codex — App  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/app/review](https://developers.openai.com/codex/app/review)
- Markdown 来源：[https://developers.openai.com/codex/app/review.md](https://developers.openai.com/codex/app/review.md)
- 抓取时间：2026-06-27T05:54:51.485Z
- Checksum：`07f788e403dc85bca54f48a997d8e74b7f1bf79a96d3d73b31aa8586ac60aa35`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Review pane 可帮助你理解 Codex 更改了什么、提供有针对性的 feedback，并决定保留什么。

它只适用于位于 Git repository 中的 projects。如果你的 project 还不是 Git repository，review pane 会提示你创建一个。

## 它显示哪些 changes

Review pane 反映你的 Git repository 状态，而不仅仅是 Codex 编辑的内容。这意味着它会显示：

- Codex 做出的 changes
- 你自己做出的 changes
- repo 中任何其他 uncommitted changes

默认情况下，review pane 关注 **uncommitted changes**。你也可以将 scope 切换为：

- **All branch changes**（与 base branch 比较的 diff）
- **Last turn changes**（仅最近一次 assistant turn）

在本地工作时，你也可以在 **Unstaged** 和 **Staged** changes 之间切换。

## 导航 review pane

- 点击 file name 通常会在你选择的 editor 中打开该文件。你可以在 [settings](/mirror/codex/app/settings) 中选择 default editor。
- 点击 file name background 会展开或折叠 diff。
- 按住 &lt;kbd&gt;Cmd&lt;/kbd&gt; 点击单行，会在你选择的 editor 中打开该行。
- 如果你满意某个 change，可以 [stage the changes or revert changes](/mirror/codex/app/review#staging-and-reverting-files) 中你不喜欢的部分。

## 用于 feedback 的 inline comments

Inline comments 让你可以将 feedback 直接附加到 diff 中的特定行。这通常是引导 Codex 找到正确修复的最快方式。

要留下 inline comment：

1. 打开 review pane。
2. 将鼠标悬停在要 comment 的 line 上。
3. 点击出现的 **+** button。
4. 写下你的 feedback 并提交。
5. 完成 feedback 后，向 thread 发送一条消息。

由于 comments 是 line-specific 的，Codex 可以比面对 general instruction 时更精确地响应。

Codex 会将 inline comments 视为 review guidance。留下 comments 后，发送一条 follow-up message 明确你的意图，例如 “Address the inline comments and keep the scope minimal.”

## Code review results

如果你使用 `/review` 运行 code review，comments 会直接 inline 显示在 review pane 中。

&lt;CodexScreenshot
  alt="review pane 中显示的 inline code review comments"
  lightSrc="/images/codex/app/inline-code-review-light.webp"
  darkSrc="/images/codex/app/inline-code-review-dark.webp"
  maxHeight="400px"
/&gt;

## Pull request reviews

当 Codex 对你的 repository 拥有 GitHub access，并且当前 project 位于 pull request branch 上时，Codex app 可以帮助你在不离开 app 的情况下处理 pull request feedback。sidebar 会显示 pull request context 和 reviewers 的 feedback，review pane 会在 diff 旁显示 comments，因此你可以在同一个 thread 中请求 Codex 处理 issues。

安装 GitHub CLI（`gh`）并使用 `gh auth login` 认证，让 Codex 可以加载 pull request context、review comments 和 changed files。如果 `gh` 缺失或未认证，pull request details 可能不会出现在 sidebar 或 review pane 中。

当你希望将完整 fix loop 保持在一个地方时，请使用此流程：

1. 在 pull request branch 上打开 review pane。
2. Review pull request context、comments 和 changed files。
3. 请求 Codex 修复你希望处理的特定 comments。
4. 在 review pane 中 inspect 生成的 diff。
5. 准备好后，stage、commit 并 push changes 到 PR branch。

对于 GitHub-triggered reviews，请参阅 [Use Codex in GitHub](/mirror/codex/integrations/github)。

## Staging 和 reverting files

Review pane 包含 Git actions，让你可以在 commit 前塑造 diff。

你可以在以下 levels 上 stage、unstage 或 revert changes：

- **Entire diff**：使用 review header 中的 action buttons（例如 "Stage all" 或 "Revert all"）
- **Per file**：stage、unstage 或 revert 单个 file
- **Per hunk**：stage、unstage 或 revert 单个 hunk

当你想接受部分工作时使用 staging；当你想丢弃它时使用 revert。

### Staged 和 unstaged states

Git 可以在同一个 file 中同时表示 staged 和 unstaged changes。发生这种情况时，pane 可能看起来像是在 staged 和 unstaged views 中显示了“同一个 file 两次”。这是正常的 Git 行为。

:::

## English source

::: details 展开英文原文
::: v-pre
The review pane helps you understand what Codex changed, give targeted feedback, and decide what to keep.

It only works for projects that live inside a Git repository. If your project
isn't a Git repository yet, the review pane will prompt you to create one.

## What changes it shows

The review pane reflects the state of your Git repository, not just what Codex
edited. That means it will show:

- Changes made by Codex
- Changes you made yourself
- Any other uncommitted changes in the repo

By default, the review pane focuses on **uncommitted changes**. You can also
switch the scope to:

- **All branch changes** (diff against your base branch)
- **Last turn changes** (just the most recent assistant turn)

When working locally, you can also toggle between **Unstaged** and **Staged**
changes.

## Navigating the review pane

- Clicking a file name typically opens that file in your chosen editor. You can choose the default editor in [settings](/mirror/codex/app/settings).
- Clicking the file name background expands or collapses the diff.
- Clicking a single line while holding &lt;kbd&gt;Cmd&lt;/kbd&gt; pressed will open the line in your chosen editor.
- If you are happy with a change you can [stage the changes or revert changes](/mirror/codex/app/review#staging-and-reverting-files) you don't like.

## Inline comments for feedback

Inline comments let you attach feedback directly to specific lines in the diff.
This is often the fastest way to guide Codex to the right fix.

To leave an inline comment:

1. Open the review pane.
2. Hover the line you want to comment on.
3. Click the **+** button that appears.
4. Write your feedback and submit it.
5. After you finish leaving feedback, send a message back to the thread.

Because comments are line-specific, Codex can respond more precisely than with a
general instruction.

Codex treats inline comments as review guidance. After leaving comments, send a
follow-up message that makes your intent explicit, for example “Address the
inline comments and keep the scope minimal.”

## Code review results

If you use `/review` to run a code review, comments will show up directly
inline in the review pane.

&lt;CodexScreenshot
  alt="Inline code review comments displayed in the review pane"
  lightSrc="/images/codex/app/inline-code-review-light.webp"
  darkSrc="/images/codex/app/inline-code-review-dark.webp"
  maxHeight="400px"
/&gt;

## Pull request reviews

When Codex has GitHub access for your repository and the current project is on
the pull request branch, the Codex app can help you work through pull request
feedback without leaving the app. The sidebar shows pull request context and
feedback from reviewers, and the review pane shows comments alongside the diff
so you can ask Codex to address issues in the same thread.

Install the GitHub CLI (`gh`) and authenticate it with `gh auth login` so Codex
can load pull request context, review comments, and changed files. If `gh` is
missing or unauthenticated, pull request details may not appear in the sidebar
or review pane.

Use this flow when you want to keep the full fix loop in one place:

1. Open the review pane on the pull request branch.
2. Review the pull request context, comments, and changed files.
3. Ask Codex to fix the specific comments you want handled.
4. Inspect the resulting diff in the review pane.
5. Stage, commit, and push the changes to the PR branch when you are ready.

For GitHub-triggered reviews, see [Use Codex in GitHub](/mirror/codex/integrations/github).

## Staging and reverting files

The review pane includes Git actions so you can shape the diff before you
commit.

You can stage, unstage, or revert changes at these levels:

- **Entire diff**: use the action buttons in the review header (for example,
  "Stage all" or "Revert all")
- **Per file**: stage, unstage, or revert an individual file
- **Per hunk**: stage, unstage, or revert a single hunk

Use staging when you want to accept part of the work, and revert when you want
to discard it.

### Staged and unstaged states

Git can represent both staged and unstaged changes in the same file. When that
happens, it can look like the pane is showing “the same file twice” across
staged and unstaged views. That's normal Git behavior.

:::
:::

