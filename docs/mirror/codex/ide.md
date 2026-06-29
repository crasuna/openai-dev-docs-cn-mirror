---
title: "Codex IDE extension 扩展"
description: "Pair with Codex in your IDE"
outline: deep
---

# Codex IDE extension 扩展

**文档集**：Codex\
**分组**：IDE\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/ide](https://developers.openai.com/codex/ide)
- Markdown 来源：[https://developers.openai.com/codex/ide.md](https://developers.openai.com/codex/ide.md)
- 抓取时间：2026-06-27T05:55:00.098Z
- Checksum：`96180c1ffdae08ca61ddbdfe24bc3aa3d1ce6126e7b98c0b51086b7263a2d503`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex 是 OpenAI 的 coding agent，可以读取、编辑和运行代码。它能帮助你更快构建、修复 bug，并理解不熟悉的代码。借助 Codex VS Code extension，你可以在 IDE 中并排使用 Codex，或将任务委托给 Codex Cloud。

ChatGPT Plus、Pro、Business、Edu 和 Enterprise 方案均包含 Codex。进一步了解[包含的内容](/mirror/codex/pricing)。

&lt;YouTubeEmbed
  title="Codex IDE extension 概览"
  videoId="sd21Igx4HtA"
  class="max-w-md"
/&gt;


## 扩展设置

Codex IDE extension 可用于 Cursor 和 Windsurf 等 VS Code forks。

你可以从 [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt) 获取 Codex extension，或为你的 IDE 下载：

- [Download for Visual Studio Code](vscode:extension/openai.chatgpt)
- [Download for Cursor](cursor:extension/openai.chatgpt)
- [Download for Windsurf](windsurf:extension/openai.chatgpt)
- [Download for Visual Studio Code Insiders](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt)
- [Download for JetBrains IDEs](/mirror/codex/ide#jetbrains-ide-integration)

适用于 VS Code 兼容编辑器和 JetBrains IDEs 的 Codex IDE integrations 可在 macOS、Windows 和 Linux 上使用。在 Windows 上，可以使用 Windows sandbox 原生运行 Codex；当你需要 Linux 原生环境时，也可以使用 WSL2。设置详情请参见 &lt;a href="/codex/windows"&gt;Windows 设置指南&lt;/a&gt;。

安装后，你会在编辑器侧边栏中看到 Codex。
在 VS Code 中，Codex 默认在右侧边栏打开。
如果你使用 VS Code 且没有立即看到 Codex，请重启编辑器。

如果你使用 Cursor，activity bar 默认横向显示。折叠的项目可能会隐藏 Codex，因此你可以固定它并重新组织扩展顺序。


  &lt;img src="https://cdn.openai.com/devhub/docs/codex-extension.webp"
    alt="Codex extension"
    class="block h-auto w-full mx-0!"
  /&gt;


## JetBrains IDE integration

如果你想在 Rider、IntelliJ、PyCharm 或 WebStorm 等 JetBrains IDEs 中使用 Codex，请安装 JetBrains IDE integration。它支持使用 ChatGPT、API key 或 JetBrains AI subscription 登录。

&lt;CtaPillLink
  href="https://blog.jetbrains.com/ai/2026/01/codex-in-jetbrains-ides/"
  label="Install Codex for JetBrains IDEs"
  class="mt-6"
/&gt;

### 将 Codex 移到右侧边栏 &lt;a id="right-sidebar"&gt;&lt;/a&gt;

在 VS Code 中，Codex 会自动出现在右侧边栏。
如果你更希望它位于主（左）侧边栏，可以将 Codex 图标拖回左侧 activity bar。

在 Cursor 等 VS Code forks 中，你可能需要手动将 Codex 移到右侧边栏。
为此，你可能需要先临时更改 activity bar 方向：

1. 打开编辑器设置并搜索 `activity bar`（在 Workbench 设置中）。
2. 将方向更改为 `vertical`。
3. 重启编辑器。

![codex-workbench-setting](https://cdn.openai.com/devhub/docs/codex-workbench-setting.webp)

现在将 Codex 图标拖到右侧边栏（例如放在 Cursor chat 旁边）。Codex 会作为侧边栏中的另一个 tab 出现。

移动后，将 activity bar 方向重置为 `horizontal`，以恢复默认行为。
如果之后改变主意，你随时可以将 Codex 拖回主（左）侧边栏。

### 登录

安装扩展后，它会提示你使用 ChatGPT 账户或 API key 登录。你的 ChatGPT 方案包含 usage credits，因此无需额外设置即可使用 Codex。请在[定价页面](/mirror/codex/pricing)了解更多信息。

### 更新扩展

扩展会自动更新，但你也可以在 IDE 中打开扩展页面来检查更新。

### 设置键盘快捷键

Codex 包含可在 IDE 设置中绑定为键盘快捷键的命令（例如切换 Codex chat，或向 Codex context 添加项目）。

若要查看所有可用命令并将它们绑定为键盘快捷键，请在 Codex chat 中选择设置图标，然后选择 **Keyboard shortcuts**。
你也可以参考 [Codex IDE extension commands](/mirror/codex/ide/commands) 页面。
支持的斜杠命令列表请参见 [Codex IDE extension slash commands](/mirror/codex/ide/slash-commands)。
如果你刚开始使用 Codex，请阅读[最佳实践指南](/mirror/codex/learn/best-practices)。

---

## 使用 Codex IDE extension 工作




### 带编辑器上下文提示

使用打开的文件、选区和 `@file` 引用，可以用更短的 prompt 获得更相关的结果。




### 切换模型

使用默认模型，或切换到其他模型以发挥它们各自的优势。




### 调整推理强度

根据任务选择 `low`、`medium` 或 `high`，在速度和深度之间权衡。





### 图像生成

无需离开编辑器即可生成或编辑图像，并在需要迭代时使用参考素材。





### 选择审批模式

根据你希望 Codex 拥有的自主程度，在 `Chat`、`Agent` 和 `Agent (Full Access)` 之间切换。





### 委托到云端

将较长作业卸载到云端环境，然后无需离开 IDE 即可监控进度并审查结果。





### 跟进云端工作

预览云端变更、请求后续处理，并在本地应用产生的 diffs 来测试和完成。





### IDE extension 命令

浏览可从命令面板运行并可绑定到键盘快捷键的完整命令列表。




### 斜杠命令

使用斜杠命令控制 Codex 行为，并从 chat 中快速更改常用设置。





### 扩展设置

通过模型、审批和其他默认值的编辑器设置，让 Codex 适配你的工作流。




:::

## English source

::: details 展开英文原文
::: v-pre
Codex is OpenAI's coding agent that can read, edit, and run code. It helps you build faster, squash bugs, and understand unfamiliar code. With the Codex VS Code extension, you can use Codex side by side in your IDE or delegate tasks to Codex Cloud.

ChatGPT Plus, Pro, Business, Edu, and Enterprise plans include Codex. Learn more about [what's included](/mirror/codex/pricing).

&lt;YouTubeEmbed
  title="Codex IDE extension overview"
  videoId="sd21Igx4HtA"
  class="max-w-md"
/&gt;


## Extension setup

The Codex IDE extension works with VS Code forks like Cursor and Windsurf.

You can get the Codex extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt), or download it for your IDE:

- [Download for Visual Studio Code](vscode:extension/openai.chatgpt)
- [Download for Cursor](cursor:extension/openai.chatgpt)
- [Download for Windsurf](windsurf:extension/openai.chatgpt)
- [Download for Visual Studio Code Insiders](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt)
- [Download for JetBrains IDEs](/mirror/codex/ide#jetbrains-ide-integration)

Codex IDE integrations for VS Code-compatible editors and JetBrains IDEs are
  available on macOS, Windows, and Linux. On Windows, run Codex natively with
  the Windows sandbox, or use WSL2 when you need a Linux-native environment. For
  setup details, see the &lt;a href="/codex/windows"&gt;Windows setup guide&lt;/a&gt;.

After you install it, you'll find Codex in your editor sidebar.
In VS Code, Codex opens in the right sidebar by default.
If you're using VS Code, restart the editor if you don't see Codex right away.

If you're using Cursor, the activity bar displays horizontally by default. Collapsed items can hide Codex, so you can pin it and reorganize the order of the extensions.


  &lt;img src="https://cdn.openai.com/devhub/docs/codex-extension.webp"
    alt="Codex extension"
    class="block h-auto w-full mx-0!"
  /&gt;


## JetBrains IDE integration

If you want to use Codex in JetBrains IDEs like Rider, IntelliJ, PyCharm, or WebStorm, install the JetBrains IDE integration. It supports signing in with ChatGPT, an API key, or a JetBrains AI subscription.

&lt;CtaPillLink
  href="https://blog.jetbrains.com/ai/2026/01/codex-in-jetbrains-ides/"
  label="Install Codex for JetBrains IDEs"
  class="mt-6"
/&gt;

### Move Codex to the right sidebar &lt;a id="right-sidebar"&gt;&lt;/a&gt;

In VS Code, Codex appears in the right sidebar automatically.
If you prefer it in the primary (left) sidebar, drag the Codex icon back to the left activity bar.

In VS Code forks like Cursor, you may need to move Codex to the right sidebar manually.
To do that, you may need to temporarily change the activity bar orientation first:

1. Open your editor settings and search for `activity bar` (in Workbench settings).
2. Change the orientation to `vertical`.
3. Restart your editor.

![codex-workbench-setting](https://cdn.openai.com/devhub/docs/codex-workbench-setting.webp)

Now drag the Codex icon to the right sidebar (for example, next to your Cursor chat). Codex appears as another tab in the sidebar.

After you move it, reset the activity bar orientation to `horizontal` to restore the default behavior.
If you change your mind later, you can drag Codex back to the primary (left) sidebar at any time.

### Sign in

After you install the extension, it prompts you to sign in with your ChatGPT account or API key. Your ChatGPT plan includes usage credits, so you can use Codex without extra setup. Learn more on the [pricing page](/mirror/codex/pricing).

### Update the extension

The extension updates automatically, but you can also open the extension page in your IDE to check for updates.

### Set up keyboard shortcuts

Codex includes commands you can bind as keyboard shortcuts in your IDE settings (for example, toggle the Codex chat or add items to the Codex context).

To see all available commands and bind them as keyboard shortcuts, select the settings icon in the Codex chat and select **Keyboard shortcuts**.
You can also refer to the [Codex IDE extension commands](/mirror/codex/ide/commands) page.
For a list of supported slash commands, see [Codex IDE extension slash commands](/mirror/codex/ide/slash-commands).
If you're new to Codex, read the [best practices guide](/mirror/codex/learn/best-practices).

---

## Work with the Codex IDE extension




### Prompt with editor context

Use open files, selections, and `@file` references to get more relevant results with shorter prompts.




### Switch models

Use the default model or switch to other models to leverage their respective strengths.




### Adjust reasoning effort

Choose `low`, `medium`, or `high` to trade off speed and depth based on the task.





### Image generation

Generate or edit images without leaving your editor, and use reference assets when you need iteration.





### Choose an approval mode

Switch between `Chat`, `Agent`, and `Agent (Full Access)` depending on how much autonomy you want Codex to have.





### Delegate to the cloud

Offload longer jobs to a cloud environment, then monitor progress and review results without leaving your IDE.





### Follow up on cloud work

Preview cloud changes, ask for follow-ups, and apply the resulting diffs locally to test and finish.





### IDE extension commands

Browse the full list of commands you can run from the command palette and bind to keyboard shortcuts.




### Slash commands

Use slash commands to control how Codex behaves and quickly change common settings from chat.





### Extension settings

Tune Codex to your workflow with editor settings for models, approvals, and other defaults.




:::
:::

