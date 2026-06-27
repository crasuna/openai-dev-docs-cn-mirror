---
status: needs-review
sourceId: "ee3f5063cd32"
sourceChecksum: "ee3f5063cd32fa350e22b6a48f86f9557bbf7809549fb8eb668da4e81e376ad0"
sourceUrl: "https://developers.openai.com/codex/app/windows"
translatedAt: "2026-06-27T11:05:57.267Z"
translator: codex-gpt-5.5-xhigh
---

# Windows

[Windows 版 Codex app](https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi) 为你提供一个 interface，用于跨 projects 工作、运行并行 agent threads，并 review results。Windows app 支持核心 workflows，例如 worktrees、automations、Git functionality、in-app browser、artifact previews、plugins 和 skills。它可以使用 PowerShell 和 [Windows sandbox](https://developers.openai.com/codex/windows#windows-sandbox) 原生运行在 Windows 上，或者你可以配置它在 [Windows Subsystem for Linux 2 (WSL2)](#windows-subsystem-for-linux-wsl) 中运行。

<CodexScreenshot
  alt="Windows 版 Codex app，显示 project sidebar、active thread 和 review pane"
  lightSrc="/images/codex/windows/codex-windows-light.webp"
  darkSrc="/images/codex/windows/codex-windows-dark.webp"
  variant="no-wallpaper"
  maxHeight="320px"
/>

## 下载 Codex app

下载 Windows 版 [Codex app](https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi)。

然后按照 [quickstart](https://developers.openai.com/codex/quickstart?setup=app) 开始使用。

对于 enterprises，administrators 可以通过 enterprise management tools 使用 Microsoft Store app distribution 部署 app。

如果你偏好 command-line install path，或需要替代打开 Microsoft Store UI 的方式，请运行：

```powershell
winget install Codex -s msstore
```

## Native sandbox

当 agent 在 PowerShell 中运行时，Windows 上的 Codex app 支持 native [Windows sandbox](https://developers.openai.com/codex/windows#windows-sandbox)；当你在 [Windows Subsystem for Linux 2 (WSL2)](#windows-subsystem-for-linux-wsl) 中运行 agent 时，则使用 Linux sandboxing。要在任一 mode 中应用 sandbox protections，请在向 Codex 发送 messages 前，在 Composer 中将 sandbox permissions 设置为 **Default permissions**。

以 full access mode 运行 Codex 意味着 Codex 不限于你的 project directory，并且可能执行非预期的破坏性操作，导致 data loss。请保留 sandbox boundaries，并使用 [rules](https://developers.openai.com/codex/rules) 做 targeted exceptions；或者根据你的 [approval and security setup](https://developers.openai.com/codex/agent-approvals-security)，将 [approval policy 设置为 never](https://developers.openai.com/codex/agent-approvals-security#run-without-approval-prompts)，让 Codex 尝试在不请求 escalated permissions 的情况下解决问题。

## 为你的 dev setup 自定义

<section class="feature-grid">

<div>

### Preferred editor

为 **Open** 选择 default app，例如 Visual Studio、VS Code 或其他 editor。你可以按 project 覆盖该选择。如果你已经从某个 project 的 **Open** menu 选择了不同 app，该 project-specific choice 会优先。

</div>

<CodexScreenshot
  alt="Codex app settings，显示 Windows 上的 default Open In app"
  lightSrc="/images/codex/windows/open-in-windows-light.webp"
  darkSrc="/images/codex/windows/open-in-windows-dark.webp"
  maxHeight={520}
  maxWidth={784}
/>

</section>

<section class="feature-grid inverse">

<div>

### Integrated terminal

你也可以选择默认 integrated terminal。根据你已安装的内容，选项包括：

- PowerShell
- Command Prompt
- Git Bash
- WSL

此更改只适用于新的 terminal sessions。如果你已经打开了 integrated terminal，请重启 app 或启动新 thread，然后再期待新的 default terminal 出现。

</div>

<CodexScreenshot
  alt="Codex app settings，显示 Windows 上的 integrated terminal selection"
  lightSrc="/images/codex/windows/integrated-shell-light.webp"
  darkSrc="/images/codex/windows/integrated-shell-dark.webp"
  maxHeight={520}
  maxWidth={788}
/>

</section>

## Windows Subsystem for Linux (WSL)

默认情况下，Codex app 使用 Windows-native agent。这意味着 agent 会在 PowerShell 中运行 commands。app 仍可通过在需要时使用 `wsl` CLI，处理位于 Windows Subsystem for Linux 2 (WSL2) 中的 projects。

如果你想从 WSL filesystem 添加 project，请点击 **Add new project** 或按 <kbd>Ctrl</kbd>+<kbd>O</kbd>，然后在 File Explorer window 中输入 `\\wsl$\`。从那里选择 Linux distribution 和你想打开的 folder。

如果你计划继续使用 Windows-native agent，建议将 projects 存储在 Windows filesystem 上，并通过 `/mnt/<drive>/...` 从 WSL 访问它们。相比直接从 WSL filesystem 打开 projects，这种设置更可靠。

如果你希望 agent 本身在 WSL2 中运行，请打开 **[Settings](codex://settings)**，将 agent 从 Windows native 切换到 WSL，并**重启 app**。更改要到重启后才会生效。重启后，你的 projects 应保持在原位。

WSL1 支持到 Codex `0.114`。从 Codex `0.115` 开始，Linux sandbox 迁移到 `bubblewrap`，因此不再支持 WSL1。

<CodexScreenshot
  alt="Codex app settings，显示包含 Windows native 和 WSL 选项的 agent selector"
  lightSrc="/images/codex/windows/wsl-select-light.webp"
  darkSrc="/images/codex/windows/wsl-select-dark.webp"
  maxHeight={520}
  maxWidth={786}
  class="mb-8"
/>

你可以独立于 agent 配置 integrated terminal。terminal 选项见[为你的 dev setup 自定义](#customize-for-your-dev-setup)。你可以让 agent 保持在 WSL 中，同时在 terminal 中使用 PowerShell；也可以两者都使用 WSL，取决于你的 workflow。

## 有用的 developer tools

当已经安装一些常见 developer tools 时，Codex 工作效果最好：

- **Git**：为 Codex app 中的 review panel 提供支持，并让你 inspect 或 revert changes。
- **Node.js**：agent 用于更高效执行 tasks 的常见 tool。
- **Python**：agent 用于更高效执行 tasks 的常见 tool。
- **.NET SDK**：当你想构建 native Windows apps 时很有用。
- **GitHub CLI**：为 Codex app 中的 GitHub-specific functionality 提供支持。

使用默认 Windows package manager `winget` 安装它们，方法是将以下内容粘贴到 [integrated terminal](https://developers.openai.com/codex/app/features#integrated-terminal)，或请求 Codex 安装：

```powershell
winget install --id Git.Git
winget install --id OpenJS.NodeJS.LTS
winget install --id Python.Python.3.14
winget install --id Microsoft.DotNet.SDK.10
winget install --id GitHub.cli
```

安装 GitHub CLI 后，运行 `gh auth login` 以在 app 中启用 GitHub features。

如果你需要不同的 Python 或 .NET version，请将 package IDs 改为你想要的 version。

## Troubleshooting 和 FAQ

### 使用 elevated permissions 运行 commands

如果你需要 Codex 以 elevated permissions 运行 commands，请以 administrator 身份启动 Codex app 本身。安装后，打开 Start menu，找到 Codex，并选择 Run as administrator。Codex agent 会继承该 permission level。

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

如果你的 [local environment](https://developers.openai.com/codex/app/local-environments) 使用 `npm` scripts 等 cross-platform commands，你可以为每个平台保持一个共享 setup script 或一组 actions。

如果你需要 Windows-specific behavior，请创建 Windows-specific setup scripts 或 Windows-specific actions。

Actions 会在 integrated terminal 使用的 environment 中运行。参见[为你的 dev setup 自定义](#customize-for-your-dev-setup)。

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

目前，如果你想将 Windows-native agent 与也可从 WSL 访问的 project 一起使用，最可靠的 workaround 是将 project 存储在 native Windows drive 上，并通过 `/mnt/<drive>/...` 从 WSL 访问。

### `Cmder` 未列在 open dialog 中

如果已安装 `Cmder` 但它没有显示在 Codex 的 open dialog 中，请将它添加到 Windows Start Menu：右键点击 `Cmder` 并选择 **Add to Start**，然后重启 Codex 或 reboot。
