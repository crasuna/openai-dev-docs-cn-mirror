---
status: needs-review
sourceId: "ca9717997257"
sourceChecksum: "ca9717997257687a4184805a7948b2bc43ebf1b533c824d739b20788469994e9"
sourceUrl: "https://developers.openai.com/codex/integrations/github"
translatedAt: "2026-06-27T19:05:47.1891485+08:00"
translator: codex-gpt-5.5-xhigh
---

# GitHub 中的 Codex 代码审查

使用 Codex code review，可以在 GitHub pull requests 上获得另一轮高信号审查。Codex 会审查 pull request diff，遵循你的仓库指导，并发布一条标准 GitHub code review，重点关注严重问题。

<YouTubeEmbed
  title="Codex code review walkthrough"
  videoId="HwbSWVg5Ln4"
  class="max-w-md mr-auto"
/>
<br />

## 开始之前

请确保你已经具备：

- 为要审查的仓库设置好 [Codex cloud](https://developers.openai.com/codex/cloud)。
- 拥有访问 [Codex code review settings](https://chatgpt.com/codex/settings/code-review) 的权限。
- 如果希望 Codex 遵循仓库特定的 review 指导，请准备一个 `AGENTS.md` 文件。

## 设置 Codex code review

1. 设置 [Codex cloud](https://developers.openai.com/codex/cloud)。
2. 前往 [Codex settings](https://chatgpt.com/codex/settings/code-review)。
3. 为你的仓库打开 **Code review**。

<div class="not-prose max-w-3xl mr-auto">
  <img src="https://developers.openai.com/images/codex/code-review/code-review-settings.png"
    alt="显示 Code review 开关的 Codex settings"
    class="block h-auto w-full mx-0!"
  />
</div>
<br />

## 请求 Codex review

1. 在 pull request 评论中提及 `@codex review`。
2. 等待 Codex 做出反应（👀）并发布 review。

<div class="not-prose max-w-xl mr-auto">
  <img src="https://developers.openai.com/images/codex/code-review/review-trigger.png"
    alt="包含 @codex review 的 pull request 评论"
    class="block h-auto w-full mx-0!"
  />
</div>
<br />

Codex 会像团队成员一样在 pull request 上发布 review。在 GitHub 中，Codex 只标记 P0 和 P1 问题，因此 review comments 会聚焦于高优先级风险。

<div class="not-prose max-w-3xl mr-auto">
  <img src="https://developers.openai.com/images/codex/code-review/review-example.png"
    alt="pull request 上的 Codex code review 示例"
    class="block h-auto w-full mx-0!"
  />
</div>
<br />

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

如果你在评论中提及 `@codex` 且内容不是 `review`，Codex 会使用你的 pull request 作为上下文启动一个[云端任务](https://developers.openai.com/codex/cloud)。

```md
@codex fix the CI failures
```

## 排查 code review

如果 Codex 没有反应或没有发布 review：

- 确认你已在 [Codex settings](https://chatgpt.com/codex/settings/code-review) 中为该仓库打开 **Code review**。
- 确认该 pull request 属于已经设置 [Codex cloud](https://developers.openai.com/codex/cloud) 的仓库。
- 在 pull request 评论中使用准确触发词 `@codex review`。
- 对于自动 reviews，请检查你已打开 **Automatic reviews**，并且 pull request event 匹配你的 review trigger settings。
