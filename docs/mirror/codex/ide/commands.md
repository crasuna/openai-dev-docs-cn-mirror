---
title: "Codex IDE extension 命令"
description: "Reference for Codex IDE extension commands and keyboard shortcuts"
outline: deep
---

# Codex IDE extension 命令

**文档集**：Codex<br>
**分组**：IDE<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/ide/commands](https://developers.openai.com/codex/ide/commands)
- Markdown 来源：[https://developers.openai.com/codex/ide/commands.md](https://developers.openai.com/codex/ide/commands.md)
- 抓取时间：2026-06-27T05:54:59.212Z
- Checksum：`ad648c6a5a2ae9d53e38e9638eadefc511bdd69f2feb8836e78f1f8c4ff684a0`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用这些命令可以从 VS Code 命令面板控制 Codex。你也可以为它们绑定键盘快捷键。

## 分配键位绑定

若要为 Codex 命令分配或更改键位绑定：

1. 打开命令面板（macOS 上为 **Cmd+Shift+P**，Windows/Linux 上为 **Ctrl+Shift+P**）。
2. 运行 **Preferences: Open Keyboard Shortcuts**。
3. 搜索 `Codex` 或命令 ID（例如 `chatgpt.newChat`）。
4. 选择铅笔图标，然后输入你想要的快捷键。

## 扩展命令

| 命令                      | 默认键位绑定                               | 说明                                           |
| ------------------------- | ------------------------------------------ | ---------------------------------------------- |
| `chatgpt.addToThread`     | -                                          | 将选中的文本范围作为上下文添加到当前 thread    |
| `chatgpt.addFileToThread` | -                                          | 将整个文件作为上下文添加到当前 thread          |
| `chatgpt.newChat`         | macOS: `Cmd+N`&lt;br/&gt;Windows/Linux: `Ctrl+N` | 创建新 thread                                  |
| `chatgpt.implementTodo`   | -                                          | 请求 Codex 处理选中的 TODO 注释                |
| `chatgpt.newCodexPanel`   | -                                          | 创建新的 Codex 面板                            |
| `chatgpt.openSidebar`     | -                                          | 打开 Codex 侧边栏面板                          |

:::

## English source

::: details 展开英文原文
::: v-pre
Use these commands to control Codex from the VS Code Command Palette. You can also bind them to keyboard shortcuts.

## Assign a key binding

To assign or change a key binding for a Codex command:

1. Open the Command Palette (**Cmd+Shift+P** on macOS or **Ctrl+Shift+P** on Windows/Linux).
2. Run **Preferences: Open Keyboard Shortcuts**.
3. Search for `Codex` or the command ID (for example, `chatgpt.newChat`).
4. Select the pencil icon, then enter the shortcut you want.

## Extension commands

| Command                   | Default key binding                        | Description                                               |
| ------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| `chatgpt.addToThread`     | -                                          | Add selected text range as context for the current thread |
| `chatgpt.addFileToThread` | -                                          | Add the entire file as context for the current thread     |
| `chatgpt.newChat`         | macOS: `Cmd+N`&lt;br/&gt;Windows/Linux: `Ctrl+N` | Create a new thread                                       |
| `chatgpt.implementTodo`   | -                                          | Ask Codex to address the selected TODO comment            |
| `chatgpt.newCodexPanel`   | -                                          | Create a new Codex panel                                  |
| `chatgpt.openSidebar`     | -                                          | Opens the Codex sidebar panel                             |

:::
:::

