---
title: "Windows 应用"
description: "Use the Codex app on Windows with native sandbox and PowerShell support"
outline: deep
---

# Windows 应用

**文档集**：Codex<br>
**分组**：应用<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/app/windows](https://developers.openai.com/codex/app/windows)
- Markdown 来源：[https://developers.openai.com/codex/app/windows.md](https://developers.openai.com/codex/app/windows.md)
- 抓取时间：2026-06-27T05:54:52.907Z
- Checksum：`ee3f5063cd32fa350e22b6a48f86f9557bbf7809549fb8eb668da4e81e376ad0`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
[Windows 版 Codex app](https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi) 为你提供一个界面，用于跨 projects 工作、运行并行 agent 线程，并审查结果。Windows app 支持核心 workflows，例如 worktrees、automations、Git 功能、应用内浏览器、artifact 预览、plugins 和 skills。它可以使用 PowerShell 和 [Windows sandbox](/mirror/codex/windows#windows-sandbox) 原生运行在 Windows 上，或者你可以配置它在 [Windows Subsystem for Linux 2 (WSL2)](/mirror/codex/app/windows#windows-subsystem-for-linux-wsl) 中运行。

&lt;CodexScreenshot
  alt="Windows 版 Codex app，显示 project sidebar、active thread 和 review pane"
  lightSrc="/images/codex/windows/codex-windows-light.webp"
  darkSrc="/images/codex/windows/codex-windows-dark.webp"
  variant="no-wallpaper"
  maxHeight="320px"
/&gt;

## 下载 Codex app

下载 Windows 版 [Codex app](https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi)。

然后按照 [quickstart](/mirror/codex/quickstart) 开始使用。

对于企业，管理员可以通过企业管理工具使用 Microsoft Store app distribution 部署 app。

如果你偏好命令行安装路径，或需要替代打开 Microsoft Store UI 的方式，请运行：

```powershell
winget install Codex -s msstore
```

## 原生 sandbox

当 agent 在 PowerShell 中运行时，Windows 上的 Codex app 支持原生 [Windows sandbox](/mirror/codex/windows#windows-sandbox)；当你在 [Windows Subsystem for Linux 2 (WSL2)](/mirror/codex/app/windows#windows-subsystem-for-linux-wsl) 中运行 agent 时，则使用 Linux sandboxing。要在任一模式中应用 sandbox 保护，请在向 Codex 发送 messages 前，在 Composer 中将 sandbox permissions 设置为 **Default permissions**。

以 full access 模式运行 Codex 意味着 Codex 不限于你的 project directory，并且可能执行非预期的破坏性操作，导致数据丢失。请保留 sandbox 边界，并使用 [rules](/mirror/codex/rules) 做定向例外；或者根据你的 [approval and security setup](/mirror/codex/agent-approvals-security)，将 [approval policy 设置为 never](/mirror/codex/agent-approvals-security#run-without-approval-prompts)，让 Codex 尝试在不请求提升权限的情况下解决问题。

## 为你的 dev setup 自定义





### 首选 editor

为 **Open** 选择默认 app，例如 Visual Studio、VS Code 或其他 editor。你可以按 project 覆盖该选择。如果你已经从某个 project 的 **Open** menu 选择了不同 app，该 project-specific 选择会优先。



&lt;CodexScreenshot
  alt="Codex app settings，显示 Windows 上的 default Open In app"
  lightSrc="/images/codex/windows/open-in-windows-light.webp"
  darkSrc="/images/codex/windows/open-in-windows-dark.webp"
  maxHeight={520}
  maxWidth={784}
/&gt;







### 集成 terminal

你也可以选择默认集成 terminal。根据你已安装的内容，选项包括：

- PowerShell
- Command Prompt
- Git Bash
- WSL

此更改只适用于新的 terminal sessions。如果你已经打开了 integrated terminal，请重启 app 或启动新 thread，然后再期待新的默认 terminal 出现。



&lt;CodexScreenshot
  alt="Codex app settings，显示 Windows 上的 integrated terminal selection"
  lightSrc="/images/codex/windows/integrated-shell-light.webp"
  darkSrc="/images/codex/windows/integrated-shell-dark.webp"
  maxHeight={520}
  maxWidth={788}
/&gt;



## Windows Subsystem for Linux (WSL)

默认情况下，Codex app 使用 Windows-native agent。这意味着 agent 会在 PowerShell 中运行命令。app 仍可通过在需要时使用 `wsl` CLI，处理位于 Windows Subsystem for Linux 2 (WSL2) 中的 projects。

如果你想从 WSL filesystem 添加 project，请点击 **Add new project** 或按 &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;O&lt;/kbd&gt;，然后在 File Explorer 窗口中输入 `\\wsl$\`。从那里选择 Linux distribution 和你想打开的 folder。

如果你计划继续使用 Windows-native agent，建议将 projects 存储在 Windows filesystem 上，并通过 `/mnt/&lt;drive&gt;/...` 从 WSL 访问它们。相比直接从 WSL filesystem 打开 projects，这种设置更可靠。

如果你希望 agent 本身在 WSL2 中运行，请打开 **[Settings](codex://settings)**，将 agent 从 Windows native 切换到 WSL，并**重启 app**。更改要到重启后才会生效。重启后，你的 projects 应保持在原位。

WSL1 支持到 Codex `0.114`。从 Codex `0.115` 开始，Linux sandbox 迁移到 `bubblewrap`，因此不再支持 WSL1。

&lt;CodexScreenshot
  alt="Codex app settings，显示包含 Windows native 和 WSL 选项的 agent selector"
  lightSrc="/images/codex/windows/wsl-select-light.webp"
  darkSrc="/images/codex/windows/wsl-select-dark.webp"
  maxHeight={520}
  maxWidth={786}
  class="mb-8"
/&gt;

你可以独立于 agent 配置 integrated terminal。terminal 选项见[为你的 dev setup 自定义](/mirror/codex/app/windows#customize-for-your-dev-setup)。你可以让 agent 保持在 WSL 中，同时在 terminal 中使用 PowerShell；也可以两者都使用 WSL，取决于你的 workflow。

## 有用的 developer tools

当已经安装一些常见 developer tools 时，Codex 工作效果最好：

- **Git**：为 Codex app 中的 review panel 提供支持，并让你检查或 revert changes。
- **Node.js**：agent 用于更高效执行 tasks 的常见 tool。
- **Python**：agent 用于更高效执行 tasks 的常见 tool。
- **.NET SDK**：当你想构建 native Windows apps 时很有用。
- **GitHub CLI**：为 Codex app 中的 GitHub-specific 功能提供支持。

使用默认 Windows package manager `winget` 安装它们，方法是将以下内容粘贴到 [integrated terminal](/mirror/codex/app/features#integrated-terminal)，或请求 Codex 安装：

```powershell
winget install --id Git.Git
winget install --id OpenJS.NodeJS.LTS
winget install --id Python.Python.3.14
winget install --id Microsoft.DotNet.SDK.10
winget install --id GitHub.cli
```

安装 GitHub CLI 后，运行 `gh auth login` 以在 app 中启用 GitHub features。

如果你需要不同的 Python 或 .NET version，请将 package IDs 改为你想要的 version。

## 故障排查和 FAQ

### 使用 elevated permissions 运行命令

如果你需要 Codex 以 elevated permissions 运行命令，请以 administrator 身份启动 Codex app 本身。安装后，打开 Start menu，找到 Codex，并选择 Run as administrator。Codex agent 会继承该权限级别。

### PowerShell execution policy 阻止 commands

如果你以前从未在 PowerShell 中使用过 Node.js 或 `npm` 等 tools，Codex agent 或 integrated terminal 可能遇到 execution policy errors。

如果 Codex 为你创建 PowerShell scripts，也可能发生这种情况。在这种情况下，PowerShell 运行它们前，你可能需要较不严格的 execution policy。

错误可能类似于：

```text
npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

常见修复是将 execution policy 设置为 `RemoteSigned`：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```

在更改 policy 前，请查看 Microsoft 的 [execution policy guide](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies)，了解详情和其他选项。

### Windows 上的 local environment scripts

如果你的 [local environment](/mirror/codex/app/local-environments) 使用 `npm` scripts 等跨平台 commands，你可以为每个平台保持一个共享 setup script 或一组 actions。

如果你需要 Windows-specific behavior，请创建 Windows-specific setup scripts 或 Windows-specific actions。

Actions 会在 integrated terminal 使用的 environment 中运行。参见[为你的 dev setup 自定义](/mirror/codex/app/windows#customize-for-your-dev-setup)。

Local setup scripts 会在 agent environment 中运行：如果 agent 使用 WSL，则在 WSL 中；否则在 PowerShell 中。

### 与 WSL 共享 config、auth 和 sessions

Windows app 使用与 Windows 上 native Codex 相同的 Codex home directory：`%USERPROFILE%\.codex`。

如果你也在 WSL 中运行 Codex CLI，该 CLI 默认使用 Linux home directory，因此不会自动与 Windows app 共享 configuration、cached auth 或 session history。

要共享它们，请使用以下方法之一：

- 在 file system 上同步 WSL `~/.codex` 和 `%USERPROFILE%\.codex`。
- 通过设置 `CODEX_HOME`，让 WSL 指向 Windows Codex home directory：

```bash
export CODEX_HOME=/mnt/c/Users/<windows-user>/.codex
```

如果你想在每个 shell 中都使用该设置，请将其添加到 WSL shell profile，例如 `~/.bashrc` 或 `~/.zshrc`。

### Git features 不可用

如果你没有在 Windows 上原生安装 Git，app 无法使用某些功能。请从 PowerShell 或 `cmd.exe` 使用 `winget install Git.Git` 安装。

### 从 `\\wsl$` 打开的 projects 无法检测到 Git

目前，如果你想将 Windows-native agent 与也可从 WSL 访问的 project 一起使用，最可靠的 workaround 是将 project 存储在 native Windows drive 上，并通过 `/mnt/&lt;drive&gt;/...` 从 WSL 访问。

### `Cmder` 未列在 open dialog 中

如果已安装 `Cmder` 但它没有显示在 Codex 的 open dialog 中，请将它添加到 Windows Start Menu：右键点击 `Cmder` 并选择 **Add to Start**，然后重启 Codex 或 reboot。

:::

## English source

::: details 展开英文原文
::: v-pre
The [Codex app for Windows](https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi) gives you one interface for
working across projects, running parallel agent threads, and reviewing results.
The Windows app supports core workflows such as worktrees, automations, Git
functionality, the in-app browser, artifact previews, plugins, and skills.
It runs natively on Windows using PowerShell and the
[Windows sandbox](/mirror/codex/windows#windows-sandbox), or you can configure it to
run in [Windows Subsystem for Linux 2 (WSL2)](/mirror/codex/app/windows#windows-subsystem-for-linux-wsl).

&lt;CodexScreenshot
  alt="Codex app for Windows showing a project sidebar, active thread, and review pane"
  lightSrc="/images/codex/windows/codex-windows-light.webp"
  darkSrc="/images/codex/windows/codex-windows-dark.webp"
  variant="no-wallpaper"
  maxHeight="320px"
/&gt;

## Download the Codex app

Download the [Codex app](https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi) for Windows.

Then follow the [quickstart](/mirror/codex/quickstart) to get started.

For enterprises, administrators can deploy the app with Microsoft Store app
distribution through enterprise management tools.

If you prefer a command-line install path, or need an alternative to opening
the Microsoft Store UI, run:

```powershell
winget install Codex -s msstore
```

## Native sandbox

The Codex app on Windows supports a native [Windows sandbox](/mirror/codex/windows#windows-sandbox) when the agent runs in PowerShell, and uses Linux sandboxing when you run the agent in [Windows Subsystem for Linux 2 (WSL2)](/mirror/codex/app/windows#windows-subsystem-for-linux-wsl). To apply sandbox protections in either mode, set sandbox permissions to **Default permissions** in the Composer before sending messages to Codex.

Running Codex in full access mode means Codex is not limited to your project
  directory and might perform unintentional destructive actions that can lead to
  data loss. Keep sandbox boundaries in place and use [rules](/mirror/codex/rules) for
  targeted exceptions, or set your [approval policy to never](/mirror/codex/agent-approvals-security#run-without-approval-prompts) to have
  Codex attempt to solve problems without asking for escalated permissions,
  based on your [approval and security setup](/mirror/codex/agent-approvals-security).

## Customize for your dev setup





### Preferred editor

Choose a default app for **Open**, such as Visual Studio, VS Code, or another
editor. You can override that choice per project. If you already picked a
different app from the **Open** menu for a project, that project-specific
choice takes precedence.



&lt;CodexScreenshot
  alt="Codex app settings showing the default Open In app on Windows"
  lightSrc="/images/codex/windows/open-in-windows-light.webp"
  darkSrc="/images/codex/windows/open-in-windows-dark.webp"
  maxHeight={520}
  maxWidth={784}
/&gt;







### Integrated terminal

You can also choose the default integrated terminal. Depending on what you have
installed, options include:

- PowerShell
- Command Prompt
- Git Bash
- WSL

This change applies only to new terminal sessions. If you already have an
integrated terminal open, restart the app or start a new thread before
expecting the new default terminal to appear.



&lt;CodexScreenshot
  alt="Codex app settings showing the integrated terminal selection on Windows"
  lightSrc="/images/codex/windows/integrated-shell-light.webp"
  darkSrc="/images/codex/windows/integrated-shell-dark.webp"
  maxHeight={520}
  maxWidth={788}
/&gt;



## Windows Subsystem for Linux (WSL)

By default, the Codex app uses the Windows-native agent. That means the agent
runs commands in PowerShell. The app can still work with projects that live in
Windows Subsystem for Linux 2 (WSL2) by using the `wsl` CLI when needed.

If you want to add a project from the WSL filesystem, click **Add new project**
or press &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;O&lt;/kbd&gt;, then type `\\wsl$\` into the File
Explorer window. From there, choose your Linux distribution and the folder you
want to open.

If you plan to keep using the Windows-native agent, prefer storing projects on
your Windows filesystem and accessing them from WSL through
`/mnt/&lt;drive&gt;/...`. This setup is more reliable than opening projects
directly from the WSL filesystem.

If you want the agent itself to run in WSL2, open **[Settings](codex://settings)**,
switch the agent from Windows native to WSL, and **restart the app**. The
change doesn't take effect until you restart. Your projects should remain in
place after restart.

WSL1 was supported through Codex `0.114`. Starting in Codex `0.115`, the Linux
sandbox moved to `bubblewrap`, so WSL1 is no longer supported.

&lt;CodexScreenshot
  alt="Codex app settings showing the agent selector with Windows native and WSL options"
  lightSrc="/images/codex/windows/wsl-select-light.webp"
  darkSrc="/images/codex/windows/wsl-select-dark.webp"
  maxHeight={520}
  maxWidth={786}
  class="mb-8"
/&gt;

You configure the integrated terminal independently from the agent. See
[Customize for your dev setup](/mirror/codex/app/windows#customize-for-your-dev-setup) for the
terminal options. You can keep the agent in WSL and still use PowerShell in the
terminal, or use WSL for both, depending on your workflow.

## Useful developer tools

Codex works best when a few common developer tools are already installed:

- **Git**: Powers the review panel in the Codex app and lets you inspect or
  revert changes.
- **Node.js**: A common tool that the agent uses to perform tasks more
  efficiently.
- **Python**: A common tool that the agent uses to perform tasks more
  efficiently.
- **.NET SDK**: Useful when you want to build native Windows apps.
- **GitHub CLI**: Powers GitHub-specific functionality in the Codex app.

Install them with the default Windows package manager `winget` by pasting this
into the [integrated terminal](/mirror/codex/app/features#integrated-terminal) or
asking Codex to install them:

```powershell
winget install --id Git.Git
winget install --id OpenJS.NodeJS.LTS
winget install --id Python.Python.3.14
winget install --id Microsoft.DotNet.SDK.10
winget install --id GitHub.cli
```

After installing GitHub CLI, run `gh auth login` to enable GitHub features in
the app.

If you need a different Python or .NET version, change the package IDs to the
version you want.

## Troubleshooting and FAQ

### Run commands with elevated permissions

If you need Codex to run commands with elevated permissions, start the Codex app
itself as an administrator. After installation, open the Start menu, find
Codex, and choose Run as administrator. The Codex agent inherits that
permission level.

### PowerShell execution policy blocks commands

If you have never used tools such as Node.js or `npm` in PowerShell before, the
Codex agent or integrated terminal may hit execution policy errors.

This can also happen if Codex creates PowerShell scripts for you. In that case,
you may need a less restrictive execution policy before PowerShell will run
them.

An error may look something like this:

```text
npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

A common fix is to set the execution policy to `RemoteSigned`:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```

For details and other options, check Microsoft's
[execution policy guide](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies)
before changing the policy.

### Local environment scripts on Windows

If your [local environment](/mirror/codex/app/local-environments) uses cross-platform
commands such as `npm` scripts, you can keep one shared setup script or
set of actions for every platform.

If you need Windows-specific behavior, create Windows-specific setup scripts or
Windows-specific actions.

Actions run in the environment used by your integrated terminal. See
[Customize for your dev setup](/mirror/codex/app/windows#customize-for-your-dev-setup).

Local setup scripts run in the agent environment: WSL if the agent uses WSL,
and PowerShell otherwise.

### Share config, auth, and sessions with WSL

The Windows app uses the same Codex home directory as native Codex on Windows:
`%USERPROFILE%\.codex`.

If you also run the Codex CLI inside WSL, the CLI uses the Linux home
directory by default, so it doesn't automatically share configuration, cached
auth, or session history with the Windows app.

To share them, use one of these approaches:

- Sync WSL `~/.codex` with `%USERPROFILE%\.codex` on your file system.
- Point WSL at the Windows Codex home directory by setting `CODEX_HOME`:

```bash
export CODEX_HOME=/mnt/c/Users/<windows-user>/.codex
```

If you want that setting in every shell, add it to your WSL shell profile, such
as `~/.bashrc` or `~/.zshrc`.

### Git features are unavailable

If you don't have Git installed natively on Windows, the app can't use some
features. Install it with `winget install Git.Git` from PowerShell or `cmd.exe`.

### Git isn't detected for projects opened from `\\wsl$`

For now, if you want to use the Windows-native agent with a project also
accessible from WSL, the most reliable workaround is to store the project
on the native Windows drive and access it in WSL through `/mnt/&lt;drive&gt;/...`.

### `Cmder` isn't listed in the open dialog

If `Cmder` is installed but doesn't show in Codex's open dialog, add it to the
Windows Start Menu: right-click `Cmder` and choose **Add to Start**, then
restart Codex or reboot.

:::
:::

