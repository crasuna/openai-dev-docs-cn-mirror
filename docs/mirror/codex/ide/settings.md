---
title: "Codex IDE extension 设置"
description: "Reference for Codex IDE extension settings"
outline: deep
---

# Codex IDE extension 设置

**文档集**：Codex 编码智能体<br>
**分组**：Codex — IDE<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/ide/settings](https://developers.openai.com/codex/ide/settings)
- Markdown 来源：[https://developers.openai.com/codex/ide/settings.md](https://developers.openai.com/codex/ide/settings.md)
- 抓取时间：2026-06-27T05:54:59.860Z
- Checksum：`419803c4d5e36cd78e7e8fcf193d22b8328c909c1e4d507857417dbf25b95b28`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用这些设置自定义 Codex IDE extension。

## 更改设置

若要更改设置，请执行以下步骤：

1. 打开编辑器设置。
2. 搜索 `Codex` 或设置名称。
3. 更新该值。

Codex IDE extension 使用 Codex CLI。某些行为，例如默认模型、审批和沙盒设置，请在共享的 `~/.codex/config.toml` 文件中配置，而不是在编辑器设置中配置。参见[配置基础](/mirror/codex/config-basic)。

该扩展还会在 Codex 对话界面中遵循 VS Code 内置的聊天字体设置。

## 设置参考

| 设置                                         | 说明                                                                                                                                                                                                                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chat.fontSize`                              | 控制 Codex 侧边栏中的聊天文本，包括对话内容和输入框。                                                                                                                                                                                                                                     |
| `chat.editor.fontSize`                       | 控制 Codex 对话中以代码形式渲染的内容，包括代码片段和 diff。                                                                                                                                                                                                                              |
| `chatgpt.cliExecutable`                      | 仅用于开发：Codex CLI 可执行文件的路径。除非你正在主动开发 Codex CLI，否则不需要设置此项。如果手动设置此项，扩展的部分功能可能无法按预期工作。                                                                                                                                           |
| `chatgpt.commentCodeLensEnabled`             | 在待办注释上方显示 CodeLens，方便你用 Codex 完成它们。                                                                                                                                                                                                                                    |
| `chatgpt.localeOverride`                     | Codex UI 的首选语言。留空则自动检测。                                                                                                                                                                                                                                                     |
| `chatgpt.openOnStartup`                      | 扩展启动完成时聚焦 Codex 侧边栏。                                                                                                                                                                                                                                                         |
| `chatgpt.runCodexInWindowsSubsystemForLinux` | 仅限 Windows：当 Windows Subsystem for Linux (WSL) 可用时，在 WSL 中运行 Codex。当你的仓库和工具链位于 WSL2 中，或需要 Linux 原生工具链时，请使用此项。否则，Codex 可以在 Windows 上使用 Windows 沙盒原生运行。更改此设置会重新加载 VS Code 以应用变更。 |

:::

## English source

::: details 展开英文原文
::: v-pre
Use these settings to customize the Codex IDE extension.

## Change a setting

To change a setting, follow these steps:

1. Open your editor settings.
2. Search for `Codex` or the setting name.
3. Update the value.

The Codex IDE extension uses the Codex CLI. Configure some behavior, such as the default model, approvals, and sandbox settings, in the shared `~/.codex/config.toml` file instead of in editor settings. See [Config basics](/mirror/codex/config-basic).

The extension also honors VS Code's built-in chat font settings for Codex conversation surfaces.

## Settings reference

| Setting                                      | Description                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chat.fontSize`                              | Controls chat text in the Codex sidebar, including conversation content and the composer.                                                                                                                                                                                                                             |
| `chat.editor.fontSize`                       | Controls code-rendered content in Codex conversations, including code snippets and diffs.                                                                                                                                                                                                                             |
| `chatgpt.cliExecutable`                      | Development only: Path to the Codex CLI executable. You don't need to set this unless you're actively developing the Codex CLI. If you set this manually, parts of the extension might not work as expected.                                                                                                          |
| `chatgpt.commentCodeLensEnabled`             | Show CodeLens above to-do comments so you can complete them with Codex.                                                                                                                                                                                                                                               |
| `chatgpt.localeOverride`                     | Preferred language for the Codex UI. Leave empty to detect automatically.                                                                                                                                                                                                                                             |
| `chatgpt.openOnStartup`                      | Focus the Codex sidebar when the extension finishes starting.                                                                                                                                                                                                                                                         |
| `chatgpt.runCodexInWindowsSubsystemForLinux` | Windows only: Run Codex in WSL when Windows Subsystem for Linux (WSL) is available. Use this when your repositories and tooling live in WSL2 or when you need Linux-native tooling. Otherwise, Codex can run natively on Windows with the Windows sandbox. Changing this setting reloads VS Code to apply the change. |

:::
:::

