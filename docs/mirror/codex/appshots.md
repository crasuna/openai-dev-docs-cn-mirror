---
title: "Appshots"
description: "Give Codex context from any Mac app"
outline: deep
---

# Appshots

**文档集**：Codex  
**分组**：Codex — Appshots  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/appshots](https://developers.openai.com/codex/appshots)
- Markdown 来源：[https://developers.openai.com/codex/appshots.md](https://developers.openai.com/codex/appshots.md)
- 抓取时间：2026-06-27T05:54:52.549Z
- Checksum：`0c94b5a50ffb1eca38b3c51900f182bdf0ed715a517e229f3452db277361b662`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Appshots 让你可以把最前方的应用窗口发送到 Codex thread。当你正在电脑上的另一个应用中工作，并希望向 Codex 提供当前上下文，让它帮助你完成任务时，可以使用 Appshots。

Appshots 可在 macOS 上的 Codex app 中使用。按下两个 Command 键，或按下你自定义的 Appshots 热键，即可截取一个 appshot。

## Appshots 会捕获什么

一个 appshot 只会捕获最前方窗口。它可以包含：

- 可见窗口的图像。
- 该窗口中可用的文本，包括可见文本，以及应用在可见滚动区域之外提供的文本。

把 appshot 添加到 thread 后，它的行为类似 Codex 附件。与手动附加的文件或图片一样，Codex 会把 appshots 本地存储在 session 文件中。

## 何时使用 appshots

当 Codex 需要先获得某个 Mac 应用中的上下文才能行动时，请使用 appshots。

示例：

- 分享一个 API 参考页面，并让 Codex 编写使用它的脚本。
- 分享一封邮件或日历视图，并让 Codex 起草下一步。
- 分享图像编辑器、设计或预览窗口，并让 Codex 修改相关素材或代码。
- 分享错误、设置面板或应用状态，这些内容展示出来比描述更容易。

## 截取 appshot

1. 在 Mac 上打开 Codex app。
2. 打开你想分享的应用和窗口。
3. 按下两个 Command 键，或按下你在 Codex 设置中配置的自定义热键。
4. 如果 Codex 询问，请允许 macOS 权限。
5. 让 Codex 基于该 appshot 执行任务。

默认情况下，Codex 会为 appshot 启动一个新 thread。如果你在过去 60 秒内与某个 Codex thread 互动过，Codex 会改为把 appshot 添加到那个最近的 thread。连续截取 appshots 会把它们添加到同一个 thread。

你可以在 Codex 设置中更改 Appshots 热键。

## 权限与安全

Codex 在截取 appshots 之前可能会请求权限：

- **Screen & System Audio Recording** 允许 Codex 捕获最前方窗口的图像。
- **Accessibility** 允许 Codex 读取最前方窗口中可用的文本。

截取 appshot 会与 Codex 共享捕获的图像和可用文本。除非任务需要这些内容，否则请避免对敏感内容截取 appshots。

请像审查与 Codex 分享截图和文档一样审查 appshots。

## 限制和故障排查

Appshots 是 Codex app 的功能。请从 macOS 上的 Codex app 创建它们。如果你在 CLI 中恢复一个已经包含 appshot 的 thread，该附件会成为 thread 历史的一部分，但 CLI 无法创建新的 appshot。

对于某些应用和网站，包括 Google Docs、Gmail、Google Sheets 和 Google Slides，Codex 可能只会收到可见截图，而收不到完整文档或屏幕外文本。如果你安装了匹配的 plugin，Codex 可以使用该 plugin 访问相关应用内容，并帮助处理你的请求。

如果 appshots 无法工作：

1. 打开 **System Settings &gt; Privacy & Security**。
2. 检查 Codex Computer Use 的 **Screen & System Audio Recording** 和 **Accessibility**。
3. 重启 Codex 并重试。

:::

## English source

::: details 展开英文原文
::: v-pre
Appshots let you send the frontmost app window to a Codex thread. Use them when
you're actively working in another app on your computer and want to provide
Codex with your current context so it can help you with the task.

Appshots are available in the Codex app on macOS. Press both Command keys, or
  your custom Appshots hotkey, to take one.

## What appshots capture

An appshot captures the frontmost window only. It can include:

- An image of the visible window.
- Available text from that window, including visible text and text the app makes
  available outside the visible scroll area.

After you add an appshot to a thread, it behaves like a Codex attachment. Codex
stores appshots locally in the session file, like files or images you attach
manually.

## When to use appshots

Use appshots when Codex needs context from a Mac app before it can act.

Examples:

- Share an API reference page and ask Codex to write a script that uses it.
- Share an email or calendar view and ask Codex to draft the next step.
- Share an image editor, design, or preview window and ask Codex to revise the
  related assets or code.
- Share an error, settings panel, or app state that's easier to show than
  describe.

## Take an appshot

1. Open the Codex app on your Mac.
2. Open the app and window you want to share.
3. Press both Command keys, or the custom hotkey you configured in Codex
   settings.
4. Allow macOS permissions if Codex asks.
5. Ask Codex to perform a task with the appshot.

By default, Codex starts a new thread for the appshot. If you interacted with a
Codex thread in the last 60 seconds, Codex adds the appshot to that recent
thread instead. Taking consecutive appshots adds them to the same thread.

You can change the Appshots hotkey in Codex settings.

## Permissions and safety

Codex may ask for permissions before it can take appshots:

- **Screen & System Audio Recording** lets Codex capture an image of the
  frontmost window.
- **Accessibility** lets Codex read available text from the frontmost window.

Taking an appshot shares the captured image and available text with Codex.
Avoid taking appshots of sensitive content unless the task requires that
content.

Review appshots the same way you would review sharing screenshots and documents
with Codex.

## Limits and troubleshooting

Appshots are a Codex app feature. Create them from the Codex app on macOS. If
you resume a thread in the CLI that already contains an appshot, the attachment
is part of the thread history, but the CLI can't create a new appshot.

For some apps and websites, including Google Docs, Gmail, Google Sheets, and
Google Slides, Codex may receive only the visible screenshot and may not receive
the full document or off-screen text. If you have the matching plugin installed,
Codex can use that plugin to access the relevant app content and help with your
request.

If appshots don't work:

1. Open **System Settings &gt; Privacy & Security**.
2. Check **Screen & System Audio Recording** and **Accessibility** for Codex
   Computer Use.
3. Restart Codex and try again.

:::
:::

