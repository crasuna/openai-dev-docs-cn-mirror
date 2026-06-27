---
title: "Local environments"
description: "Configure common actions and setup scripts for worktrees"
outline: deep
---

# Local environments

**文档集**：Codex  
**分组**：Codex — App  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/app/local-environments](https://developers.openai.com/codex/app/local-environments)
- Markdown 来源：[https://developers.openai.com/codex/app/local-environments.md](https://developers.openai.com/codex/app/local-environments.md)
- 抓取时间：2026-06-27T05:54:50.887Z
- Checksum：`7524e5e9269577decfcc52303fb0a68bbcae4257cf272efe35fb05e44aa68a3d`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Local environments 让你可以为 worktrees 配置 setup steps，并为 project 配置 common actions。

你通过 [Codex app settings](codex://settings) pane 配置 local environments。你可以将生成的文件提交到 project 的 Git repository，与他人共享。

Codex 会将此配置存储在 project root 的 `.codex` folder 中。如果你的 repository 包含多个 project，请打开包含共享 `.codex` folder 的 project directory。

## Setup scripts

由于 worktrees 与本地 tasks 运行在不同目录中，你的 project 可能尚未完全设置，可能缺少 dependencies 或没有提交到 repository 的 files。Codex 在新 thread 开始时创建新 worktree，setup scripts 会自动运行。

使用此 script 运行配置 environment 所需的任何 command，例如安装 dependencies 或运行 build process。

例如，对于 TypeScript project，你可能希望使用 setup script 安装 dependencies 并执行初始 build：

```bash
npm install
npm run build
```

如果你的 setup 是 platform-specific 的，请为 macOS、Windows 或 Linux 定义 setup scripts，以覆盖默认值。

## Actions




使用 actions 定义常见 tasks，例如启动 app 的 development server 或运行 test suite。这些 actions 会显示在 Codex app top bar 中，便于快速访问。actions 会在 app 的 [integrated terminal](/mirror/codex/app/features#integrated-terminal) 中运行。

Actions 可帮助你避免重复输入常见 actions，例如触发 project build 或启动 development server。对于一次性的快速 debugging，可以直接使用 integrated terminal。



&lt;CodexScreenshot
  alt="Codex app settings 中显示的 project actions list"
  lightSrc="/images/codex/app/actions-light.webp"
  darkSrc="/images/codex/app/actions-dark.webp"
  maxHeight="400px"
  class="mb-4 lg:mb-0"
/&gt;



例如，对于 Node.js project，你可能会创建一个包含以下 script 的 "Run" action：

```bash
npm start
```

如果你的 action commands 是 platform-specific 的，请为 macOS、Windows 和 Linux 定义 platform-specific scripts。

要标识你的 actions，请为每个 action 选择关联 icon。

:::

## English source

::: details 展开英文原文
::: v-pre
Local environments let you configure setup steps for worktrees as well as common actions for a project.

You configure your local environments through the [Codex app settings](codex://settings) pane. You can check the generated file into your project's Git repository to share with others.

Codex stores this configuration inside the `.codex` folder at the root of your
project. If your repository contains more than one project, open the project
directory that contains the shared `.codex` folder.

## Setup scripts

Since worktrees run in different directories than your local tasks, your project might not be fully set up and might be missing dependencies or files that aren't checked into your repository. Setup scripts run automatically when Codex creates a new worktree at the start of a new thread.

Use this script to run any command required to configure your environment, such as installing dependencies or running a build process.

For example, for a TypeScript project you might want to install the dependencies and do an initial build using a setup script:

```bash
npm install
npm run build
```

If your setup is platform-specific, define setup scripts for macOS, Windows, or Linux to override the default.

## Actions




Use actions to define common tasks like starting your app's development server or running your test suite. These actions appear in the Codex app top bar for quick access. The actions will be run within the app's [integrated terminal](/mirror/codex/app/features#integrated-terminal).

Actions are helpful to keep you from typing common actions like triggering a build for your project or starting a development server. For one-off quick debugging you can use the integrated terminal directly.



&lt;CodexScreenshot
  alt="Project actions list shown in Codex app settings"
  lightSrc="/images/codex/app/actions-light.webp"
  darkSrc="/images/codex/app/actions-dark.webp"
  maxHeight="400px"
  class="mb-4 lg:mb-0"
/&gt;



For example, for a Node.js project you might create a "Run" action that contains the following script:

```bash
npm start
```

If the commands for your action are platform-specific, define platform-specific scripts for macOS, Windows, and Linux.

To identify your actions, choose an icon associated with each action.

:::
:::

