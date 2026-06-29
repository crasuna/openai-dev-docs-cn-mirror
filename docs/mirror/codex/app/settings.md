---
title: "Codex app 设置"
description: "Configure Codex app behavior and preferences"
outline: deep
---

# Codex app 设置

**文档集**：Codex<br>
**分组**：应用<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/app/settings](https://developers.openai.com/codex/app/settings)
- Markdown 来源：[https://developers.openai.com/codex/app/settings.md](https://developers.openai.com/codex/app/settings.md)
- 抓取时间：2026-06-27T05:55:15.687Z
- Checksum：`15be5bb6e77ae8abda1fa2ec67b20435404f48cec1828343a11746553b92bcf4`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用 settings panel 调整 Codex app 的行为、文件打开方式，以及它如何连接到 tools。从 app menu 打开 [**Settings**](codex://settings)，或按 &lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;,&lt;/kbd&gt;。

## General

选择文件在哪里打开、thread 中显示多少 command output，以及 terminal tabs 默认在哪里打开。你也可以要求使用 &lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;Enter&lt;/kbd&gt; 输入 multiline prompts，或在线程运行时防止睡眠。

## Profile

使用 **Profile** 查看 activity insights、lifetime tokens、peak tokens、streaks、你的最长 task，以及 token activity。你还可以更新 profile details，例如 picture、display name 和 username，并保存包含 usage highlights 的 profile card。Consumer ChatGPT plans 支持分享 profile cards。

Eligible users 还可以从 profile menu 发送 Codex invitations。在符合条件的 personal plan 上选择 **Invite a friend**，或在符合条件的 Business workspace 中选择 **Invite a coworker**。当前 rewards、limits 和 eligibility 见 [Invite friends and coworkers](/mirror/codex/pricing#invite-friends-and-coworkers)。

## Keyboard shortcuts

打开 **Keyboard Shortcuts** 以 review commands、更改 bindings，或将 custom shortcuts 重置为 defaults。使用 search field 按 command name 查找 shortcuts，或切换到 keystroke search 并按下 key combination，以查找使用它的 command。

## Notifications

选择 turn completion notifications 何时出现，以及 app 是否应提示 notification permissions。

## Agent configuration

app 中的 Codex agents 会继承与 IDE 和 CLI extension 相同的 configuration。使用 in-app controls 调整常见 settings，或编辑 `config.toml` 进行 advanced options。更多详情见 [Codex security](/mirror/codex/agent-approvals-security) 和 [config basics](/mirror/codex/config-basic)。

## Appearance

在 **Settings** 中，你可以通过选择 base theme、调整 accent、background 和 foreground colors，以及更改 UI 和 code fonts，来改变 Codex app appearance。你还可以与朋友分享 custom theme。

&lt;CodexScreenshot
  alt="Codex app Appearance settings，显示 theme selection、color controls 和 font options"
  lightSrc="/images/codex/app/theme-selection-light.webp"
  darkSrc="/images/codex/app/theme-selection-dark.webp"
  maxHeight="720px"
  class="mb-8"
/&gt;

### Codex pets



    Codex pets 是 app 的可选 animated companions。在 **Settings** 中，进入 **Appearance** 并选择 **Pets**，以选择 built-in pet 或从你的 local Codex home refresh custom pets。在 composer 中输入 `/pet`，在 **Settings &gt; Appearance** 中使用 **Wake Pet** 或 **Tuck Away Pet**，或按 &lt;kbd&gt;Cmd+K&lt;/kbd&gt; 或 &lt;kbd&gt;Ctrl+K&lt;/kbd&gt; 并运行相同 commands，以切换 floating overlay。

    overlay 会在你使用其他 apps 时保持 active Codex work 可见。它会显示 active thread，反映 Codex 正在运行、等待输入，还是 ready for review，并将该状态与简短 progress prompt 搭配，让你无需重新打开 thread 就能快速查看发生了什么变化。






要创建自己的 pet，请安装 `hatch-pet` skill：

```text
$skill-installer hatch-pet
```

从 command menu 重新加载 skills。按 &lt;kbd&gt;Cmd+K&lt;/kbd&gt; 或 &lt;kbd&gt;Ctrl+K&lt;/kbd&gt;，选择 **Force Reload Skills**，然后请求该 skill 创建 pet：

```text
$hatch-pet create a new pet inspired by my recent projects
```

## Git

使用 Git settings 标准化 branch naming，并选择 Codex 是否使用 force pushes。你还可以设置 Codex 用于生成 commit messages 和 pull request descriptions 的 prompts。

## Integrations & MCP

通过 MCP（Model Context Protocol）连接 external tools。启用 recommended servers 或添加你自己的 servers。如果 server 需要 OAuth，app 会启动 auth flow。这些 settings 也适用于 Codex CLI 和 IDE extension，因为 MCP configuration 位于 `config.toml` 中。详情见 [Model Context Protocol docs](/mirror/codex/mcp)。



## Browser

使用这些 settings 安装或启用 bundled Browser plugin、设置 [Codex Chrome extension](/mirror/codex/app/chrome-extension)，以及管理 allowed 和 blocked websites。除非你已经允许某个 website，否则 Codex 会在使用前询问。移除 blocked site 可让 Codex 在 browser 中使用它之前再次询问。

在 **Developer mode** 下，打开 **Enable full CDP access**，让 Codex 使用 Chrome DevTools Protocol 进行 performance profiling 和更深入的 browser debugging。如果你的组织禁用了 full CDP access，你无法在本地启用它。设置、风险、approval details 和 administrator requirement 见 [Developer mode](/mirror/codex/app/browser#developer-mode)。

Browser preview、comment 和 browser use workflows 见 [In-app browser](/mirror/codex/app/browser)。

## Computer Use

设置完成后，检查你的 Computer Use settings，以 review desktop-app access 和相关 preferences。在 macOS 上，通过更新 macOS Privacy & Security settings 中的 Screen Recording 或 Accessibility permissions，撤销 system-level access。

## Personalization

选择 **Friendly**、**Pragmatic** 或 **None** 作为你的默认 personality。使用 **None** 可禁用 personality instructions。你可以随时更新。

你也可以添加自己的 custom instructions。编辑 custom instructions 会更新你的 [`AGENTS.md` 中的 personal instructions](/mirror/codex/guides/agents-md)。

## Context-aware suggestions

使用 context-aware suggestions，在你启动或返回 Codex 时显示你可能想继续的 follow-ups 和 tasks。

## Memories

启用 Memories（如果可用），让 Codex 将 past threads 中有用的 context 带入 future work。设置、存储和 per-thread controls 见 [Memories](/mirror/codex/memories)。

## Archived threads

**Archived threads** section 会列出 archived chats，并显示 dates 和 project context。使用 **Unarchive** 恢复 thread。

:::

## English source

::: details 展开英文原文
::: v-pre
Use the settings panel to tune how the Codex app behaves, how it opens files,
and how it connects to tools. Open [**Settings**](codex://settings) from the app menu or
press &lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;,&lt;/kbd&gt;.

## General

Choose where files open, how much command output appears in threads, and where
terminal tabs open by default. You can also require &lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;Enter&lt;/kbd&gt;
for multiline prompts or prevent sleep while a thread runs.

## Profile

Use **Profile** to review activity insights, lifetime tokens, peak tokens,
streaks, your longest task, and token activity. You can also update your profile
details, such as your picture, display name, and username, and save a profile
card with usage highlights. Sharing profile cards is available on consumer
ChatGPT plans.

Eligible users can also send Codex invitations from the profile menu. Choose
**Invite a friend** on an eligible personal plan or **Invite a coworker** in an
eligible Business workspace. See
[Invite friends and coworkers](/mirror/codex/pricing#invite-friends-and-coworkers) for
current rewards, limits, and eligibility.

## Keyboard shortcuts

Open **Keyboard Shortcuts** to review commands, change bindings, or reset custom
shortcuts to their defaults. Use the search field to find shortcuts by command
name, or switch to keystroke search and press a key combination to find the
command that uses it.

## Notifications

Choose when turn completion notifications appear, and whether the app should prompt for
notification permissions.

## Agent configuration

Codex agents in the app inherit the same configuration as the IDE and CLI extension.
Use the in-app controls for common settings, or edit `config.toml` for advanced
options. See [Codex security](/mirror/codex/agent-approvals-security) and
[config basics](/mirror/codex/config-basic) for more detail.

## Appearance

In **Settings**, you can change the Codex app appearance by choosing a base theme,
adjusting accent, background, and foreground colors, and changing the UI and code
fonts. You can also share your custom theme with friends.

&lt;CodexScreenshot
  alt="Codex app Appearance settings showing theme selection, color controls, and font options"
  lightSrc="/images/codex/app/theme-selection-light.webp"
  darkSrc="/images/codex/app/theme-selection-dark.webp"
  maxHeight="720px"
  class="mb-8"
/&gt;

### Codex pets



    Codex pets are optional animated companions for the app. In **Settings**,
    go to **Appearance** and choose **Pets** to select a built-in pet or
    refresh custom pets from your local Codex home. Type `/pet` in the
    composer, use **Wake Pet** or **Tuck Away Pet** in **Settings &gt; Appearance**, or
    press &lt;kbd&gt;Cmd+K&lt;/kbd&gt; or &lt;kbd&gt;Ctrl+K&lt;/kbd&gt; and run the same commands to
    toggle the floating overlay.

    The overlay keeps active Codex work visible while you use other apps. It
    shows the active thread, reflects whether Codex is running, waiting for
    input, or ready for review, and pairs that state with a short progress
    prompt so you can glance at what changed without reopening the thread.






To create your own pet, install the `hatch-pet` skill:

```text
$skill-installer hatch-pet
```

Reload skills from the command menu. Press &lt;kbd&gt;Cmd+K&lt;/kbd&gt; or &lt;kbd&gt;Ctrl+K&lt;/kbd&gt;,
choose **Force Reload Skills**, then ask the skill to create a pet:

```text
$hatch-pet create a new pet inspired by my recent projects
```

## Git

Use Git settings to standardize branch naming and choose whether Codex uses force
pushes.
You can also set prompts that Codex uses to generate commit messages and pull request descriptions.

## Integrations & MCP

Connect external tools via MCP (Model Context Protocol). Enable recommended servers or
add your own. If a server requires OAuth, the app starts the auth flow. These settings
also apply to the Codex CLI and IDE extension because the MCP configuration lives in
`config.toml`. See the [Model Context Protocol docs](/mirror/codex/mcp) for details.



## Browser

Use these settings to install or enable the bundled Browser plugin, set up the
[Codex Chrome extension](/mirror/codex/app/chrome-extension), and manage allowed and
blocked websites. Codex asks before using a website unless you've allowed it.
Removing a blocked site lets Codex ask again before using it in the browser.

Under **Developer mode**, turn on **Enable full CDP access** to let Codex use
the Chrome DevTools Protocol for performance profiling and deeper browser
debugging. If your organization has disabled full CDP access, you can't enable
it locally. See [Developer mode](/mirror/codex/app/browser#developer-mode) for setup,
risk, approval details, and the administrator requirement.

See [In-app browser](/mirror/codex/app/browser) for browser preview, comment, and
browser use workflows.

## Computer Use

Check your Computer Use settings to review desktop-app access and related
preferences after setup. On macOS, revoke system-level access by updating Screen
Recording or Accessibility permissions in macOS Privacy & Security settings.

## Personalization

Choose **Friendly**, **Pragmatic**, or **None** as your default personality. Use
**None** to disable personality instructions. You can update this at any time.

You can also add your own custom instructions. Editing custom instructions updates your
[personal instructions in `AGENTS.md`](/mirror/codex/guides/agents-md).

## Context-aware suggestions

Use context-aware suggestions to surface follow-ups and tasks you may want to resume when you
start or return to Codex.

## Memories

Enable Memories, where available, to let Codex carry useful context from past
threads into future work. See [Memories](/mirror/codex/memories) for setup, storage,
and per-thread controls.

## Archived threads

The **Archived threads** section lists archived chats with dates and project
context. Use **Unarchive** to restore a thread.

:::
:::

