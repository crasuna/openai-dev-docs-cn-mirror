---
title: "Codex CLI"
description: "Pair with Codex in your terminal"
outline: deep
---

# Codex CLI

**文档集**：Codex  
**分组**：Codex — Cli  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/cli](https://developers.openai.com/codex/cli)
- Markdown 来源：[https://developers.openai.com/codex/cli.md](https://developers.openai.com/codex/cli.md)
- 抓取时间：2026-06-27T05:54:53.027Z
- Checksum：`1e4371e76897a943292f574e46d74eb909c93f5df13e7883856f5a627c7184d5`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex CLI 是 OpenAI 的编码 agent，你可以从本地终端运行它。它可以在所选目录中读取、修改并运行你机器上的代码。
它是[开源的](https://github.com/openai/codex)，并且使用 Rust 构建，以获得速度和效率。

ChatGPT Plus、Pro、Business、Edu 和 Enterprise 计划均包含 Codex。了解更多[包含内容](/mirror/codex/pricing)。

&lt;YouTubeEmbed
  title="Codex CLI overview"
  videoId="iqNzfK4_meQ"
  class="max-w-md"
/&gt;


## CLI 设置



Codex CLI 可在 macOS、Windows 和 Linux 上使用。在 Windows 上，可以使用 Windows sandbox 在 PowerShell 中原生运行 Codex；如果需要 Linux 原生环境，也可以使用 WSL2。有关设置详情，请参阅
  &lt;a href="/codex/windows"&gt;Windows 设置指南&lt;/a&gt;。

如果你刚开始使用 Codex，请阅读[最佳实践指南](/mirror/codex/learn/best-practices)。

---

## 使用 Codex CLI




### 以交互模式运行 Codex

运行 `codex` 以启动交互式终端 UI（TUI）会话。




### 控制模型和推理

使用 `/model` 在可用模型之间切换，或调整推理级别。




### 图像输入

附加截图或设计规格，让 Codex 在读取你的提示词时一并读取它们。




### 图像生成

直接在 CLI 中生成或编辑图像；当你希望 Codex 基于现有素材迭代时，可以附加参考图。





### 运行本地代码审查

在提交或推送改动前，让一个单独的 Codex agent 审查你的代码。





### 使用 subagents

使用 subagents 并行处理复杂任务。





### Web search

使用 Codex 搜索网页，为你的任务获取最新信息。





### Codex Cloud 任务

启动 Codex Cloud 任务、选择环境，并在不离开终端的情况下应用生成的 diff。





### 脚本化 Codex

使用 `exec` 命令编写脚本，自动化可重复的工作流。




### Model Context Protocol

通过 Model Context Protocol（MCP）让 Codex 访问额外的第三方工具和上下文。


  


### Approval modes

在 Codex 编辑或运行命令之前，选择与你舒适程度匹配的 approval mode。




:::

## English source

::: details 展开英文原文
::: v-pre
Codex CLI is OpenAI's coding agent that you can run locally from your terminal. It can read, change, and run code on your machine in the selected directory.
It's [open source](https://github.com/openai/codex) and built in Rust for speed and efficiency.

ChatGPT Plus, Pro, Business, Edu, and Enterprise plans include Codex. Learn more about [what's included](/mirror/codex/pricing).

&lt;YouTubeEmbed
  title="Codex CLI overview"
  videoId="iqNzfK4_meQ"
  class="max-w-md"
/&gt;


## CLI setup



The Codex CLI is available on macOS, Windows, and Linux. On Windows, run Codex
  natively in PowerShell with the Windows sandbox, or use WSL2 when you need a
  Linux-native environment. For setup details, see the 
  &lt;a href="/codex/windows"&gt;Windows setup guide&lt;/a&gt;.

If you're new to Codex, read the [best practices guide](/mirror/codex/learn/best-practices).

---

## Work with the Codex CLI




### Run Codex interactively

Run `codex` to start an interactive terminal UI (TUI) session.




### Control model and reasoning

Use `/model` to switch between available models or adjust reasoning levels.




### Image inputs

Attach screenshots or design specs so Codex reads them alongside your prompt.




### Image generation

Generate or edit images directly in the CLI, and attach references when you want Codex to iterate on an existing asset.





### Run local code review

Get your code reviewed by a separate Codex agent before you commit or push your changes.





### Use subagents

Use subagents to parallelize complex tasks.





### Web search

Use Codex to search the web and get up-to-date information for your task.





### Codex Cloud tasks

Launch a Codex Cloud task, choose environments, and apply the resulting diffs without leaving your terminal.





### Scripting Codex

Automate repeatable workflows by scripting Codex with the `exec` command.




### Model Context Protocol

Give Codex access to additional third-party tools and context with Model Context Protocol (MCP).


  


### Approval modes

Choose the approval mode that matches your comfort level before Codex edits or runs commands.




:::
:::

