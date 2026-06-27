---
status: needs-review
sourceId: "63facce8dcc8"
sourceChecksum: "63facce8dcc8c030749a7a9aa9a2df41de7788ea02a118c5fbb60dd80da72112"
sourceUrl: "https://developers.openai.com/codex/memories/chronicle"
translatedAt: "2026-06-27T19:06:51.2133192+08:00"
translator: codex-gpt-5.5-xhigh
---

# Chronicle

Chronicle 处于 **opt-in research preview**。它仅面向 macOS 上的 ChatGPT Pro 订阅者开放。启用前，请阅读 [Privacy and Security](#privacy-and-security) 部分了解详情并理解当前风险。

Chronicle 会用来自你屏幕的上下文增强 Codex memories。当你提示 Codex 时，这些 memories 可以帮助它理解你一直在做什么，减少你重新说明上下文的需要。

Chronicle 在 macOS 的 Codex app 中以 opt-in research preview 形式提供。它需要 macOS Screen Recording 和 Accessibility 权限。启用前，请注意 Chronicle 会快速消耗 rate limits，增加 prompt injection 风险，并把 memories 以未加密形式存储在你的设备上。

## Chronicle 如何提供帮助

我们设计 Chronicle 是为了减少你在使用 Codex 时必须反复说明的上下文。通过使用最近的屏幕上下文来改进 memory building，Chronicle 可以帮助 Codex 理解你指的是什么、识别应使用的正确来源，并了解你依赖的工具和工作流。

<section class="feature-grid mt-4">

<div>

### 使用屏幕上的内容

有了 Chronicle，Codex 可以理解你当前正在查看的内容，从而节省时间并减少上下文切换。

</div>

<ChronicleThreadDemo client:load scenario="screen" />

</section>

<section class="feature-grid inverse">

<div>

### 补齐缺失上下文

无需精心编写上下文并从零开始。Chronicle 让 Codex 能够补齐你上下文中的空白。

</div>

<ChronicleThreadDemo client:load scenario="project" />

</section>

<section class="feature-grid">

<div>

### 记住工具和工作流

无需向 Codex 解释应使用哪些工具来完成你的工作。Codex 会随着你的工作进行学习，从长远看为你节省时间。

</div>

<ChronicleThreadDemo client:load scenario="tools" />

</section>

在这些情况下，Codex 会使用 Chronicle 提供额外上下文。当另一个来源更适合完成任务时，例如读取特定文件、Slack thread、Google Doc、dashboard 或 pull request，Codex 会使用 Chronicle 识别来源，然后直接使用该来源。

## 启用 Chronicle

1. 在 Codex app 中打开 Settings。
2. 前往 **Personalization**，并确保 **Memories** 已启用。
3. 在 Memories 设置下方开启 **Chronicle**。
4. 查看 consent dialog 并选择 **Continue**。
5. 在提示时授予 macOS Screen Recording 和 Accessibility 权限。
6. 设置完成后，选择 **Try it out** 或启动一个新线程。

如果 macOS 报告 Screen Recording 或 Accessibility 权限被拒绝，请打开 System Settings &gt; Privacy & Security &gt; Screen Recording 或 Accessibility 并启用 Codex。如果某项权限受到 macOS 或你的组织限制，Chronicle 会在限制移除且 Codex 获得所需权限后启动。

## 随时暂停或禁用 Chronicle

你可以控制 Chronicle 何时使用屏幕上下文生成 memories。使用 Codex 菜单栏图标选择 **Pause Chronicle** 或 **Resume Chronicle**。在开会或查看你不希望 Codex 作为上下文使用的敏感内容之前，请暂停 Chronicle。要禁用 Chronicle，请返回 **Settings &gt; Personalization &gt; Memories** 并关闭 **Chronicle**。

你也可以控制是否在特定线程中使用 memories。[了解更多](https://developers.openai.com/codex/memories#control-memories-per-thread)。

## Rate limits

Chronicle 的工作方式是在后台运行沙盒化 agents，根据捕获的屏幕图像生成 memories。这些 agents 目前会快速消耗 rate limits。

## 隐私和安全 {#privacy-and-security}

Chronicle 使用屏幕截图，其中可能包含你屏幕上可见的敏感信息。它不会访问你的麦克风或系统音频。未经他人同意，不要使用 Chronicle 记录会议或与他人的通信。查看你不希望被 memories 记住的内容时，请暂停 Chronicle。

### Chronicle 在哪里存储我的数据？

屏幕截图是临时的，只会暂时保存在你的电脑上。Chronicle 运行时，临时屏幕截图文件可能出现在 `$TMPDIR/chronicle/screen_recording/` 下。Chronicle 运行时，超过 6 小时的屏幕截图会被删除。

Chronicle 生成的 memories 与其他 Codex memories 一样：是你可以在需要时阅读和修改的未加密 markdown 文件。你也可以要求 Codex 搜索它们。如果你想让 Codex 忘记某些内容，可以删除文件夹中的相应文件，或选择性编辑 markdown 文件以移除你想删除的信息。你不应手动添加新信息。生成的 Chronicle memories 会本地存储在你电脑上的 `$CODEX_HOME/memories_extensions/chronicle/` 下（通常是 `~/.codex/memories_extensions/chronicle`）。

<div className="not-prose my-4">
  <Alert
    client:load
    color="danger"
    variant="soft"
    description="你的屏幕截图和 memories 所在的两个目录都可能包含敏感信息。请确保不要与他人分享这些内容，并注意你电脑上的其他程序也可以访问这些文件。"
  />
</div>

### 哪些数据会与 OpenAI 共享？

Chronicle 会在本地捕获屏幕上下文，然后周期性使用 Codex 将最近活动总结为 memories。为了生成这些 memories，Chronicle 会启动一个临时 Codex session，并让它访问此屏幕上下文。该 session 可能处理所选 screenshot frames、从 screenshots 中提取的 OCR text、timing information，以及相关时间窗口内的 local file paths。

用于 memory generation 的屏幕截图会临时存储在你的设备上。它们会在我们的服务器上被处理以生成 memories，随后 memories 会本地存储在设备上。除非法律要求，否则我们不会在处理后把 screenshots 存储在服务器上，也不会将它们用于训练。

生成的 memories 是本地存储在 `$CODEX_HOME/memories_extensions/chronicle/` 下的 Markdown 文件。当 Codex 在未来 session 中使用 memories 时，相关 memory 内容可能会作为该 session 的上下文被包含，并且如果你的 ChatGPT 设置允许，可能会被用于改进我们的模型。[了解更多](https://help.openai.com/en/articles/7730893-data-controls-faq)。

## Prompt injection 风险

使用 Chronicle 会增加来自屏幕内容的 prompt injection attacks 风险。例如，如果你浏览包含恶意 agent instructions 的网站，Codex 可能会遵循这些指令。

## 故障排查

### 如何启用 Chronicle？

如果你没有看到 Chronicle 设置，请确认你使用的 Codex app build 包含 Chronicle，并且你已在 Settings &gt; Personalization 中启用 Memories。

Chronicle 目前仅面向 macOS 上的 ChatGPT Pro 订阅者开放。

如果设置未完成：

1. 确认 Codex 拥有 Screen Recording 和 Accessibility 权限。
2. 退出并重新打开 Codex app。
3. 打开 **Settings > Personalization** 并检查 Chronicle 状态。

### 用哪个模型生成 Chronicle memories？

Chronicle 使用与你其他 [Memories](https://developers.openai.com/codex/memories) 相同的模型。如果你没有配置特定模型，它会使用你的默认 Codex 模型。要选择特定模型，请在[配置](https://developers.openai.com/codex/config-basic)中更新 `consolidation_model`。

```toml
[memories]
consolidation_model = "gpt-5.4-mini"
```
