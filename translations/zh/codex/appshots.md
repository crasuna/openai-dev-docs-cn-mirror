---
status: needs-review
sourceId: "0c94b5a50ffb"
sourceChecksum: "0c94b5a50ffb1eca38b3c51900f182bdf0ed715a517e229f3452db277361b662"
sourceUrl: "https://developers.openai.com/codex/appshots"
translatedAt: "2026-06-27T19:07:21.7838419+08:00"
translator: codex-gpt-5.5-xhigh
---

# Appshots

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

1. 打开 **System Settings > Privacy & Security**。
2. 检查 Codex Computer Use 的 **Screen & System Audio Recording** 和 **Accessibility**。
3. 重启 Codex 并重试。
