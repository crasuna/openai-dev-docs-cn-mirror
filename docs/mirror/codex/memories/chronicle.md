---
title: "Chronicle"
description: "Build Codex memories from recent screen context."
outline: deep
---

# Chronicle

**文档集**：Codex  
**分组**：Codex — Memories  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/memories/chronicle](https://developers.openai.com/codex/memories/chronicle)
- Markdown 来源：[https://developers.openai.com/codex/memories/chronicle.md](https://developers.openai.com/codex/memories/chronicle.md)
- 抓取时间：2026-06-27T05:55:03.557Z
- Checksum：`63facce8dcc8c030749a7a9aa9a2df41de7788ea02a118c5fbb60dd80da72112`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Chronicle 处于 **opt-in research preview**。它仅面向 macOS 上的 ChatGPT Pro 订阅者开放。启用前，请阅读 [Privacy and Security](/mirror/codex/memories/chronicle#privacy-and-security) 部分了解详情并理解当前风险。

Chronicle 会用来自你屏幕的上下文增强 Codex memories。当你提示 Codex 时，这些 memories 可以帮助它理解你一直在做什么，减少你重新说明上下文的需要。

Chronicle 在 macOS 的 Codex app 中以 opt-in research preview 形式提供。它需要 macOS Screen Recording 和 Accessibility 权限。启用前，请注意 Chronicle 会快速消耗 rate limits，增加 prompt injection 风险，并把 memories 以未加密形式存储在你的设备上。

## Chronicle 如何提供帮助

我们设计 Chronicle 是为了减少你在使用 Codex 时必须反复说明的上下文。通过使用最近的屏幕上下文来改进 memory building，Chronicle 可以帮助 Codex 理解你指的是什么、识别应使用的正确来源，并了解你依赖的工具和工作流。





### 使用屏幕上的内容

有了 Chronicle，Codex 可以理解你当前正在查看的内容，从而节省时间并减少上下文切换。











### 补齐缺失上下文

无需精心编写上下文并从零开始。Chronicle 让 Codex 能够补齐你上下文中的空白。











### 记住工具和工作流

无需向 Codex 解释应使用哪些工具来完成你的工作。Codex 会随着你的工作进行学习，从长远看为你节省时间。







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

你也可以控制是否在特定线程中使用 memories。[了解更多](/mirror/codex/memories#control-memories-per-thread)。

## Rate limits

Chronicle 的工作方式是在后台运行沙盒化 agents，根据捕获的屏幕图像生成 memories。这些 agents 目前会快速消耗 rate limits。

## 隐私和安全

Chronicle 使用屏幕截图，其中可能包含你屏幕上可见的敏感信息。它不会访问你的麦克风或系统音频。未经他人同意，不要使用 Chronicle 记录会议或与他人的通信。查看你不希望被 memories 记住的内容时，请暂停 Chronicle。

### Chronicle 在哪里存储我的数据？

屏幕截图是临时的，只会暂时保存在你的电脑上。Chronicle 运行时，临时屏幕截图文件可能出现在 `$TMPDIR/chronicle/screen_recording/` 下。Chronicle 运行时，超过 6 小时的屏幕截图会被删除。

Chronicle 生成的 memories 与其他 Codex memories 一样：是你可以在需要时阅读和修改的未加密 markdown 文件。你也可以要求 Codex 搜索它们。如果你想让 Codex 忘记某些内容，可以删除文件夹中的相应文件，或选择性编辑 markdown 文件以移除你想删除的信息。你不应手动添加新信息。生成的 Chronicle memories 会本地存储在你电脑上的 `$CODEX_HOME/memories_extensions/chronicle/` 下（通常是 `~/.codex/memories_extensions/chronicle`）。


  &lt;Alert
    client:load
    color="danger"
    variant="soft"
    description="你的屏幕截图和 memories 所在的两个目录都可能包含敏感信息。请确保不要与他人分享这些内容，并注意你电脑上的其他程序也可以访问这些文件。"
  /&gt;


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
3. 打开 **Settings &gt; Personalization** 并检查 Chronicle 状态。

### 用哪个模型生成 Chronicle memories？

Chronicle 使用与你其他 [Memories](/mirror/codex/memories) 相同的模型。如果你没有配置特定模型，它会使用你的默认 Codex 模型。要选择特定模型，请在[配置](/mirror/codex/config-basic)中更新 `consolidation_model`。

```toml
[memories]
consolidation_model = "gpt-5.4-mini"
```

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Chronicle is in an **opt-in research preview**. It is only available for
  ChatGPT Pro subscribers on macOS. Please review the [Privacy and
  Security](#privacy-and-security) section for details and to understand the
  current risks before enabling.

Chronicle augments Codex memories with context from your screen. When you prompt
Codex, those memories can help it understand what you’ve been working on with
less need for you to restate context.

Chronicle is available as an opt-in research preview in the Codex app on macOS.
It requires macOS Screen Recording and Accessibility permissions. Before
enabling, be aware that Chronicle uses rate limits quickly, increases risk of
prompt injection, and stores memories unencrypted on your device.

## How Chronicle helps

We’ve designed Chronicle to reduce the amount of context you have to restate
when you work with Codex. By using recent screen context to improve memory
building, Chronicle can help Codex understand what you’re referring to, identify
the right source to use, and pick up on the tools and workflows you rely on.

<section class="feature-grid mt-4">

<div>

### Use what’s on screen

With Chronicle Codex can understand what you are currently looking at, saving
you time and context switching.

</div>

<ChronicleThreadDemo client:load scenario="screen" />

</section>

<section class="feature-grid inverse">

<div>

### Fill in missing context

No need to carefully craft your context and start from zero. Chronicle lets
Codex fill in the gaps in your context.

</div>

<ChronicleThreadDemo client:load scenario="project" />

</section>

<section class="feature-grid">

<div>

### Remember tools and workflows

No need to explain to Codex which tools to use to perform your work. Codex
learns as you work to save you time in the long run.

</div>

<ChronicleThreadDemo client:load scenario="tools" />

</section>

In these cases, Codex uses Chronicle to provide additional context. When another
source is better for the job, such as reading the specific file, Slack thread,
Google Doc, dashboard, or pull request, Codex uses Chronicle to identify the
source and then use that source directly.

## Enable Chronicle

1. Open Settings in the Codex app.
2. Go to **Personalization** and make sure **Memories** is enabled.
3. Turn on **Chronicle** below the Memories setting.
4. Review the consent dialog and choose **Continue**.
5. Grant macOS Screen Recording and Accessibility permissions when prompted.
6. When setup completes, choose **Try it out** or start a new thread.

If macOS reports that Screen Recording or Accessibility permission is denied,
open System Settings &gt; Privacy & Security &gt; Screen Recording or
Accessibility and enable Codex. If a permission is restricted by macOS or your
organization, Chronicle will start after the restriction is removed and Codex
receives the required permission.

## Pause or disable Chronicle at any time

You control when Chronicle generates memories using screen context. Use the
Codex menu bar icon to choose **Pause Chronicle** or **Resume Chronicle**. Pause
Chronicle before meetings or when viewing sensitive content that you do not want
Codex to use as context. To disable Chronicle, return to **Settings &gt;
Personalization &gt; Memories** and turn off **Chronicle**.

You can also control whether memories are used in a given thread. [Learn
more](https://developers.openai.com/codex/memories#control-memories-per-thread).

## Rate limits

Chronicle works by running sandboxed agents in the background to generate
memories from captured screen images. These agents currently consume rate limits
quickly.

## Privacy and security

Chronicle uses screen captures, which can include sensitive information visible
on your screen. It does not have access to your microphone or system audio.
Don’t use Chronicle to record meetings or communications with others without
their consent. Pause Chronicle when viewing content you do not want remembered
in memories.

### Where does Chronicle store my data?

Screen captures are ephemeral and will only be saved temporarily on your
computer. Temporary screen capture files may appear under
`$TMPDIR/chronicle/screen_recording/` while Chronicle is running. Screen captures
that are older than 6 hours will be deleted while Chronicle is running.

The memories that Chronicle generates are just like other Codex memories:
unencrypted markdown files that you can read and modify if needed. You can also
ask Codex to search them. If you want to have Codex forget something you can
delete the respective file inside the folder or selectively edit the markdown
files to remove the information you’d like to remove. You should not manually
add new information. The generated Chronicle memories are stored locally on your
computer under `$CODEX_HOME/memories_extensions/chronicle/` (typically
`~/.codex/memories_extensions/chronicle`).

<div className="not-prose my-4">
  <Alert
    client:load
    color="danger"
    variant="soft"
    description="Both directories for your screen captures and memories might contain sensitive information. Make sure you do not share content with others, and be aware that other programs on your computer can also access these files."
  />
</div>

### What data gets shared with OpenAI?

Chronicle captures screen context locally, then periodically uses Codex to
summarize recent activity into memories. To generate those memories, Chronicle
starts an ephemeral Codex session with access to this screen context. That
session may process selected screenshot frames, OCR text extracted from
screenshots, timing information, and local file paths for the relevant time
window.

Screen captures used for memory generation are stored temporarily on your device. They are processed on our
servers to generate memories, which are then stored locally on device. We do not
store the screenshots on our servers after processing unless required by law,
and do not use them for training.

The generated memories are Markdown files stored locally under
`$CODEX_HOME/memories_extensions/chronicle/`. When Codex uses memories in a
future session, relevant memory contents may be included as context for that
session, and may be used to improve our models if allowed in your ChatGPT
settings. [Learn more](https://help.openai.com/en/articles/7730893-data-controls-faq).

## Prompt injection risk

Using Chronicle increases risk to prompt injection attacks from screen content.
For instance, if you browse a site with malicious agent instructions, Codex may
follow those instructions.

## Troubleshooting

### How do I enable Chronicle?

If you do not see the Chronicle setting, make sure you are using a Codex app
build that includes Chronicle and that you have Memories enabled inside Settings
&gt; Personalization.

Chronicle is currently only available for ChatGPT Pro subscribers on macOS.

If setup does not complete:

1. Confirm that Codex has Screen Recording and Accessibility permissions.
2. Quit and reopen the Codex app.
3. Open **Settings > Personalization** and check the Chronicle status.

### Which model is used for generating the Chronicle memories?

Chronicle uses the same model as your other [Memories](https://developers.openai.com/codex/memories). If you
did not configure a specific model it uses your default Codex model. To choose a
specific model, update the `consolidation_model` in your
[configuration](https://developers.openai.com/codex/config-basic).

```toml
[memories]
consolidation_model = "gpt-5.4-mini"
```
``````
:::
:::

