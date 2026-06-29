---
title: "GitHub 中的 Codex 代码审查"
description: "Set up Codex code review for GitHub pull requests, request reviews with @codex review, enable automatic reviews, and customize review guidelines."
outline: deep
---

# GitHub 中的 Codex 代码审查

**文档集**：Codex<br>
**分组**：集成<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/integrations/github](https://developers.openai.com/codex/integrations/github)
- Markdown 来源：[https://developers.openai.com/codex/integrations/github.md](https://developers.openai.com/codex/integrations/github.md)
- 抓取时间：2026-06-27T05:55:00.635Z
- Checksum：`ca9717997257687a4184805a7948b2bc43ebf1b533c824d739b20788469994e9`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用 Codex code review，可以在 GitHub pull requests 上获得另一轮高信号审查。Codex 会审查 pull request diff，遵循你的仓库指导，并发布一条标准 GitHub code review，重点关注严重问题。

&lt;YouTubeEmbed
  title="Codex code review walkthrough"
  videoId="HwbSWVg5Ln4"
  class="max-w-md mr-auto"
/&gt;


## 开始之前

请确保你已经具备：

- 为要审查的仓库设置好 [Codex cloud](/mirror/codex/cloud)。
- 拥有访问 [Codex code review settings](https://chatgpt.com/codex/settings/code-review) 的权限。
- 如果希望 Codex 遵循仓库特定的 review 指导，请准备一个 `AGENTS.md` 文件。

## 设置 Codex code review

1. 设置 [Codex cloud](/mirror/codex/cloud)。
2. 前往 [Codex settings](https://chatgpt.com/codex/settings/code-review)。
3. 为你的仓库打开 **Code review**。


  &lt;img src="https://developers.openai.com/images/codex/code-review/code-review-settings.png"
    alt="显示 Code review 开关的 Codex settings"
    class="block h-auto w-full mx-0!"
  /&gt;



## 请求 Codex review

1. 在 pull request 评论中提及 `@codex review`。
2. 等待 Codex 做出反应（👀）并发布 review。


  &lt;img src="https://developers.openai.com/images/codex/code-review/review-trigger.png"
    alt="包含 @codex review 的 pull request 评论"
    class="block h-auto w-full mx-0!"
  /&gt;



Codex 会像团队成员一样在 pull request 上发布 review。在 GitHub 中，Codex 只标记 P0 和 P1 问题，因此 review comments 会聚焦于高优先级风险。


  &lt;img src="https://developers.openai.com/images/codex/code-review/review-example.png"
    alt="pull request 上的 Codex code review 示例"
    class="block h-auto w-full mx-0!"
  /&gt;



## 启用自动 reviews

如果希望 Codex 自动审查每个 pull request，请在 [Codex settings](https://chatgpt.com/codex/settings/code-review) 中打开 **Automatic reviews**。
Codex 会在有人打开新的 PR 进行 review 时发布 review，无需 `@codex review` 评论。

## 自定义 Codex 审查内容

Codex 会在你的仓库中搜索 `AGENTS.md` 文件，并遵循你包含的任何 **Review guidelines**。

若要为仓库设置指导，请添加或更新顶层 `AGENTS.md`，并包含如下 section：

```md
## Review guidelines

- Don't log PII.
- Verify that authentication middleware wraps every route.
```

Codex 会对每个已更改文件应用距离它最近的 `AGENTS.md` 中的指导。当特定 packages 需要额外审查时，你可以在更深的目录树中放置更具体的指令。

对于一次性重点，请将它添加到 pull request 评论中：

`@codex review for security regressions`

如果你希望 Codex 标记文档中的拼写错误，请在 `AGENTS.md` 中添加指导（例如，“Treat typos in docs as P1.”）。

## 处理 review findings

Codex 发布 review 后，你可以在同一个 pull request 中留下另一条评论，请它修复问题：

```md
@codex fix the P1 issue
```

Codex 会以该 pull request 为上下文启动一个云端任务，并且在拥有权限时可以将修复推回分支。

## 给 Codex 其他任务

如果你在评论中提及 `@codex` 且内容不是 `review`，Codex 会使用你的 pull request 作为上下文启动一个[云端任务](/mirror/codex/cloud)。

```md
@codex fix the CI failures
```

## 排查 code review

如果 Codex 没有反应或没有发布 review：

- 确认你已在 [Codex settings](https://chatgpt.com/codex/settings/code-review) 中为该仓库打开 **Code review**。
- 确认该 pull request 属于已经设置 [Codex cloud](/mirror/codex/cloud) 的仓库。
- 在 pull request 评论中使用准确触发词 `@codex review`。
- 对于自动 reviews，请检查你已打开 **Automatic reviews**，并且 pull request event 匹配你的 review trigger settings。

:::

## English source

::: details 展开英文原文
::: v-pre
Use Codex code review to get another high-signal review pass on GitHub pull
requests. Codex reviews the pull request diff, follows your repository guidance,
and posts a standard GitHub code review focused on serious issues.

&lt;YouTubeEmbed
  title="Codex code review walkthrough"
  videoId="HwbSWVg5Ln4"
  class="max-w-md mr-auto"
/&gt;


## Before you start

Make sure you have:

- [Codex cloud](/mirror/codex/cloud) set up for the repository you want to review.
- Access to [Codex code review settings](https://chatgpt.com/codex/settings/code-review).
- An `AGENTS.md` file if you want Codex to follow repository-specific review guidance.

## Set up Codex code review

1. Set up [Codex cloud](/mirror/codex/cloud).
2. Go to [Codex settings](https://chatgpt.com/codex/settings/code-review).
3. Turn on **Code review** for your repository.


  &lt;img src="https://developers.openai.com/images/codex/code-review/code-review-settings.png"
    alt="Codex settings showing the Code review toggle"
    class="block h-auto w-full mx-0!"
  /&gt;



## Request a Codex review

1. In a pull request comment, mention `@codex review`.
2. Wait for Codex to react (👀) and post a review.


  &lt;img src="https://developers.openai.com/images/codex/code-review/review-trigger.png"
    alt="A pull request comment with @codex review"
    class="block h-auto w-full mx-0!"
  /&gt;



Codex posts a review on the pull request, just like a teammate would. In
GitHub, Codex flags only P0 and P1 issues so review comments stay focused on
high-priority risks.


  &lt;img src="https://developers.openai.com/images/codex/code-review/review-example.png"
    alt="Example Codex code review on a pull request"
    class="block h-auto w-full mx-0!"
  /&gt;



## Enable automatic reviews

If you want Codex to review every pull request automatically, turn on
**Automatic reviews** in [Codex settings](https://chatgpt.com/codex/settings/code-review).
Codex will post a review whenever someone opens a new PR for review, without
needing an `@codex review` comment.

## Customize what Codex reviews

Codex searches your repository for `AGENTS.md` files and follows any **Review guidelines** you include.

To set guidelines for a repository, add or update a top-level `AGENTS.md` with a section like this:

```md
## Review guidelines

- Don't log PII.
- Verify that authentication middleware wraps every route.
```

Codex applies guidance from the closest `AGENTS.md` to each changed file. You can place more specific instructions deeper in the tree when particular packages need extra scrutiny.

For a one-off focus, add it to your pull request comment:

`@codex review for security regressions`

If you want Codex to flag typos in documentation, add guidance in `AGENTS.md`
(for example, “Treat typos in docs as P1.”).

## Act on review findings

After Codex posts a review, you can ask it to fix issues in the same pull
request by leaving another comment:

```md
@codex fix the P1 issue
```

Codex starts a cloud task with the pull request as context and can push a fix
back to the branch when it has permission to do so.

## Give Codex other tasks

If you mention `@codex` in a comment with anything other than `review`, Codex starts a [cloud task](/mirror/codex/cloud) using your pull request as context.

```md
@codex fix the CI failures
```

## Troubleshoot code review

If Codex doesn't react or post a review:

- Confirm you turned on **Code review** for the repository in [Codex settings](https://chatgpt.com/codex/settings/code-review).
- Confirm the pull request belongs to a repository with [Codex cloud](/mirror/codex/cloud) set up.
- Use the exact trigger `@codex review` in a pull request comment.
- For automatic reviews, check that you turned on **Automatic reviews** and that
  the pull request event matches your review trigger settings.

:::
:::

