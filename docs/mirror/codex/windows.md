---
title: "Windows 支持"
description: "Tips for running Codex on Windows"
outline: deep
---

# Windows 支持

**文档集**：Codex\
**分组**：Windows\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/windows](https://developers.openai.com/codex/windows)
- Markdown 来源：[https://developers.openai.com/codex/windows.md](https://developers.openai.com/codex/windows.md)
- 抓取时间：2026-06-27T05:55:10.071Z
- Checksum：`ab8a6a5054f1f651c60ae64fae90607db5617d5e748f7b927c6ce281648e2f2c`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
在 Windows 上，可以通过原生 [Codex app](/mirror/codex/app/windows)、[CLI](/mirror/codex/cli) 或 [IDE 扩展](/mirror/codex/ide) 使用 Codex。

Windows 上的 Codex app 支持核心工作流，例如并行 agent 线程、worktrees、automations、Git 功能、应用内浏览器、artifact 预览、plugins 和 skills。


  &lt;CodexCallout
    href="/codex/app/windows"
    title="在 Windows 上使用 Codex app"
    description="使用原生 Windows app 跨项目工作、运行并行 agent 线程，并在一处审查结果。"
    iconSrc="/images/codex/codex-banner-icon.webp"
  /&gt;


根据使用界面和你的设置，Codex 可以在 Windows 上以三种实际方式运行：

- 原生运行在 Windows 上，使用更强的 `elevated` sandbox，
- 原生运行在 Windows 上，使用 fallback `unelevated` sandbox，
- 或在 [Windows Subsystem for Linux 2](https://learn.microsoft.com/en-us/windows/wsl/install)（WSL2）中运行，使用 Linux sandbox 实现。

## Windows sandbox

当你在 Windows 上原生运行 Codex 时，agent 模式会使用 Windows sandbox，阻止在工作文件夹之外写入文件系统，并在没有你明确批准的情况下阻止网络访问。

原生 Windows sandbox 支持包含两种可在 `config.toml` 中配置的模式：

```toml
[windows]
sandbox = "elevated" # or "unelevated"
```

`elevated` 是首选原生 Windows sandbox。它使用专用低权限 sandbox 用户、文件系统权限边界、防火墙规则，以及在 sandbox 中运行命令所需的本地策略变更。

`unelevated` 是回退用的原生 Windows sandbox。它使用从当前用户派生的受限 Windows token 运行命令，应用基于 ACL 的文件系统边界，并使用环境级离线控制，而不是专用 offline-user 防火墙规则。它比 `elevated` 弱，但当管理员批准的设置被本地或企业策略阻止时仍然有用。

如果两种模式都可用，请使用 `elevated`。如果默认原生 sandbox 在你的环境中无法工作，请在排查设置的同时使用 `unelevated` 作为回退方案。

企业管理员可以通过 [`requirements.toml`](/mirror/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml) 约束 Codex 可使用哪些原生 sandbox 实现：

```toml
[windows]
allowed_sandbox_implementations = ["elevated"]
```

此示例要求使用 `elevated` sandbox，并阻止用户回退到 `unelevated`。若要允许任一种实现，请包含两个值；未选择模式时，Codex 会优先使用 `elevated`。受支持值请参见 [`requirements.toml` reference](/mirror/codex/config-reference#requirementstoml)。

默认情况下，两种 sandbox 模式也会使用 private desktop，以获得更强的 UI 隔离。仅当你出于兼容性需要旧的 `Winsta0\\Default` 行为时，才设置 `windows.sandbox_private_desktop = false`。

### Sandbox permissions

以 full access 模式运行 Codex 意味着 Codex 不受限于你的项目目录，并且可能执行无意的破坏性动作，导致数据丢失。为了更安全地自动化，请保留 sandbox 边界，并为特定例外使用 [rules](/mirror/codex/rules)；或者将你的 [approval policy 设置为 never](/mirror/codex/agent-approvals-security#run-without-approval-prompts)，让 Codex 在不请求升级权限的情况下尝试解决问题，具体取决于你的 [approval and security setup](/mirror/codex/agent-approvals-security)。

### Windows version matrix

| Windows 版本                     | 支持级别        | 说明                                                                                                                                                                                  |
| -------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows 11                       | 推荐            | Codex on Windows 的最佳基线。如果你要标准化企业部署，请使用它。                                                                                                      |
| 最新且完全更新的 Windows 10      | 尽力支持        | 可以工作，但可靠性不如 Windows 11。对于 Windows 10，Codex 依赖现代控制台支持，包括 ConPTY。实践中要求 Windows 10 版本 1809 或更新版本。 |
| 较旧的 Windows 10 builds         | 不推荐          | 更可能缺少所需控制台组件（例如 ConPTY），也更可能在企业设置中失败。                                                                          |

其他环境假设：

- `winget` 应可用。如果缺失，请先更新 Windows 或安装 Windows Package Manager，再设置 Codex。
- 推荐的原生 sandbox 依赖管理员批准的设置。
- 某些企业托管设备会阻止所需设置步骤，即使 OS 版本本身可接受。

### 授予 sandbox 读取访问权限

当某个命令因为 Windows sandbox 无法读取目录而失败时，使用：

```text
/sandbox-add-read-dir C:\absolute\directory\path
```

该 path 必须是现有的绝对目录。命令成功后，后续在 sandbox 中运行的命令可以在当前 session 期间读取该目录。

默认使用原生 Windows sandbox。原生 Windows sandbox 提供最佳性能和最高速度，同时保持相同安全性。当你需要 Windows 上的 Linux 原生环境，工作流已经位于 WSL2 中，或两种原生 Windows sandbox 模式都不能满足需求时，选择 WSL2。

## Windows Subsystem for Linux

如果选择 WSL2，Codex 会在 Linux 环境内运行，而不是使用原生 Windows sandbox。如果你需要 Windows 上的 Linux 原生工具，或者你的仓库和开发工作流已经位于 WSL2 中，或两种原生 Windows sandbox 模式都不适用于你的环境，这会很有用。

WSL1 在 Codex `0.114` 之前受支持。从 Codex `0.115` 开始，Linux sandbox 迁移到 `bubblewrap`，因此不再支持 WSL1。

### 从 WSL 内启动 VS Code

分步说明请参见[官方 VS Code WSL tutorial](https://code.visualstudio.com/docs/remote/wsl-tutorial)。

#### 前提条件

- 已安装 WSL 的 Windows。要安装 WSL，请以 administrator 身份打开 PowerShell，然后运行 `wsl --install`（Ubuntu 是常见选择）。
- 已安装 [WSL 扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) 的 VS Code。

#### 从 WSL 终端打开 VS Code

```bash
# From your WSL shell
cd ~/code/your-project
code .
```

这会打开 WSL remote 窗口，在需要时安装 VS Code Server，并确保集成终端在 Linux 中运行。

#### 确认你已连接到 WSL

- 查看显示 `WSL: &lt;distro&gt;` 的绿色状态栏。
- 集成终端应显示 Linux 路径（例如 `/home/...`），而不是 `C:\`。
- 你可以用以下命令验证：

```bash
  echo $WSL_DISTRO_NAME
```

  这会打印你的发行版名称。

如果你没有在状态栏中看到 “WSL: ...”，按 `Ctrl+Shift+P`，选择 `WSL: Reopen Folder in WSL`，并将仓库放在 `/home/...` 下（而不是 `C:\`）以获得最佳性能。

如果 Windows app 或项目选择器没有显示你的 WSL 仓库，请在文件选择器或 Explorer 中输入 &lt;code&gt;\\wsl$&lt;/code&gt;，然后进入你的发行版 home 目录。

### 在 WSL 中使用 Codex CLI

从提升权限的 PowerShell 或 Windows Terminal 运行这些命令：

```powershell
# Install default Linux distribution (like Ubuntu)
wsl --install

# Start a shell inside Windows Subsystem for Linux
wsl
```

然后从你的 WSL shell 运行这些命令：

```bash
# Install and run Codex in WSL
curl -fsSL https://chatgpt.com/codex/install.sh | sh
codex
```

### 在 WSL 中处理代码

- 在 &lt;code&gt;/mnt/c/...&lt;/code&gt; 这类 Windows 挂载路径下工作，可能比在 Windows 原生路径中更慢。请将仓库放在你的 Linux home 目录下（例如 &lt;code&gt;~/code/my-app&lt;/code&gt;），以获得更快 I/O，并减少符号链接和权限问题：
```bash
  mkdir -p ~/code && cd ~/code
  git clone https://github.com/your/repo.git
  cd repo
```
- 如果你需要从 Windows 访问文件，它们位于 Explorer 中的 &lt;code&gt;\\wsl$\Ubuntu\home\&lt;user&gt;&lt;/code&gt;。

## 故障排查和 FAQ

如果你正在排查一台托管 Windows 机器，请从原生 sandbox 模式、Windows 版本，以及 Codex 显示的任何策略错误开始。大多数原生 Windows 支持问题来自 sandbox 设置、登录权限或文件系统权限，而不是编辑器本身。

我的原生 sandbox 设置失败

如果 Codex 无法完成 `elevated` sandbox 设置，最常见原因包括：

- Windows UAC 或管理员提示被拒绝，
- 机器不允许创建本地 user 或 group，
- 机器不允许更改防火墙规则，
- 机器阻止 sandbox 用户所需的登录权限，
- 或另一项企业策略阻止了设置流程的某个部分。

可以尝试：

1. 再次尝试 `elevated` sandbox 设置，并在你的环境允许时批准管理员提示。
2. 如果公司 laptop 阻止了此操作，请询问 IT team，该机器是否允许针对本地 user/group 创建、防火墙配置和所需 sandbox-user 登录权限的管理员批准设置。
3. 如果默认设置仍然失败，请使用 `unelevated` sandbox，这样你可以在问题调查期间继续工作。

Codex 将我切换到了 unelevated sandbox

这意味着 Codex 无法在你的机器上完成更强的 `elevated` sandbox 设置。

- Codex 仍可以在 sandboxed 模式中运行。
- 它仍会应用基于 ACL 的文件系统边界，但不会使用 `elevated` 的独立 sandbox-user 边界，网络隔离也更弱。
- 这是一个有用的回退方案，但不是首选的长期企业配置。

如果你使用托管企业 laptop，最佳长期修复通常是让 IT team 协助你使 `elevated` sandbox 正常工作。

我看到 Windows error 1385

如果 sandboxed 命令失败并显示 error `1385`，说明 Windows 正在拒绝 sandbox 用户启动命令所需的登录类型。

实践中，这通常意味着 Codex 已成功创建 sandbox 用户，但 Windows policy 仍阻止这些用户启动 sandboxed 命令。

应对方式：

1. 询问 IT team，该设备策略是否向 Codex 创建的 sandbox 用户授予了所需登录权限。
2. 如果问题只影响某些机器或团队，请比较组策略或 OU 差异。
3. 如果需要立即继续工作，请在策略问题调查期间使用 `unelevated` sandbox。
4. 发送 `CODEX_HOME/.sandbox/sandbox.log`，并附上你的 Windows 版本和失败的简短描述。

Codex 警告某些 folders 可由 Everyone 写入

Codex 可能会警告某些 folders 可由 `Everyone` 写入。

如果看到此警告，说明这些 folders 上的 Windows 权限过宽，sandbox 无法完全保护它们。

应对方式：

1. 审查 Codex 在警告中列出的 folders。
2. 如果在你的环境中合适，请移除这些 folders 上的 `Everyone` 写入访问权限。
3. 更正权限后，重启 Codex 或重新运行 sandbox 设置。

如果你不确定如何更改这些权限，请向 IT team 寻求帮助。

Sandboxed 命令无法访问网络

一些 Codex tasks 会根据正在使用的权限模式，故意在没有出站网络访问的情况下运行。

如果某个 task 因无法访问网络而失败：

1. 检查该 task 是否本应在网络已禁用的情况下运行。
2. 如果你预期应有网络访问，请重启 Codex 并重试。
3. 如果问题持续出现，请收集 sandbox log，让团队检查该机器是否处于部分可用或损坏的 sandbox 状态。

Sandboxing 以前可以工作，但后来失效了

这可能发生在：

- 移动 repo 或 workspace，
- 更改机器 permissions，
- 更改 Windows 策略，
- 或其他系统配置变更之后。

可以尝试：

1. 重启 Codex。
2. 再次尝试 `elevated` sandbox 设置。
3. 如果仍无法修复，请使用 `unelevated` sandbox 作为临时回退方案。
4. 收集 sandbox log 以供审查。

我需要向 OpenAI 发送诊断信息

如果问题仍然存在，请发送：

- `CODEX_HOME/.sandbox/sandbox.log`

同时包含以下信息也会有帮助：

- 对你当时尝试执行内容的简短描述，
- `elevated` sandbox 是否失败，或是否使用了 `unelevated` sandbox，
- app 中显示的任何错误消息，
- 你是否看到 `1385` 或其他 Windows 或 PowerShell error，
- 以及你使用的是 Windows 11 还是 Windows 10。

不要发送：

- `CODEX_HOME/.sandbox-secrets/` 的内容

IDE 扩展已安装但没有响应

你的系统可能缺少 C++ development tools，而某些 native dependencies 需要它们：

- Visual Studio Build Tools（C++ workload）
- Microsoft Visual C++ Redistributable（x64）
- 使用 `winget` 时，运行 `winget install --id Microsoft.VisualStudio.2022.BuildTools -e`

安装后请完全重启 VS Code。

大型仓库在 WSL 中感觉很慢

- 确保你不是在 &lt;code&gt;/mnt/c&lt;/code&gt; 下工作。将 repository 移到 WSL 中（例如 &lt;code&gt;~/code/...&lt;/code&gt;）。
- 如果需要，请增加 WSL 的 memory 和 CPU；将 WSL 更新到最新版本：
```powershell
  wsl --update
  wsl --shutdown
```

VS Code 在 WSL 中找不到 codex

验证 binary 存在并且位于 WSL 内的 PATH 上：

```bash
which codex || echo "codex not found"
```

如果找不到 binary，请按照上方[说明](/mirror/codex/windows#use-codex-cli-with-wsl)安装它。

:::

## English source

::: details 展开英文原文
::: v-pre
Use Codex on Windows with the native [Codex app](/mirror/codex/app/windows), the
[CLI](/mirror/codex/cli), or the [IDE extension](/mirror/codex/ide).

The Codex app on Windows supports core workflows such as parallel agent threads,
worktrees, automations, Git functionality, the in-app browser, artifact previews,
plugins, and skills.


  &lt;CodexCallout
    href="/codex/app/windows"
    title="Use the Codex app on Windows"
    description="Work across projects, run parallel agent threads, and review results in one place with the native Windows app."
    iconSrc="/images/codex/codex-banner-icon.webp"
  /&gt;


Depending on the surface and your setup, Codex can run on Windows in three
practical ways:

- natively on Windows with the stronger `elevated` sandbox,
- natively on Windows with the fallback `unelevated` sandbox,
- or inside [Windows Subsystem for Linux 2](https://learn.microsoft.com/en-us/windows/wsl/install) (WSL2), which uses the Linux sandbox implementation.

## Windows sandbox

When you run Codex natively on Windows, agent mode uses a Windows sandbox to
block filesystem writes outside the working folder and prevent network access
without your explicit approval.

Native Windows sandbox support includes two modes that you can configure in
`config.toml`:

```toml
[windows]
sandbox = "elevated" # or "unelevated"
```

`elevated` is the preferred native Windows sandbox. It uses dedicated
lower-privilege sandbox users, filesystem permission boundaries, firewall
rules, and local policy changes needed for commands that run in the sandbox.

`unelevated` is the fallback native Windows sandbox. It runs commands with a
restricted Windows token derived from your current user, applies ACL-based
filesystem boundaries, and uses environment-level offline controls instead of
the dedicated offline-user firewall rule. It's weaker than `elevated`, but it
is still useful when administrator-approved setup is blocked by local or
enterprise policy.

If both modes are available, use `elevated`. If the default native sandbox
doesn't work in your environment, use `unelevated` as a fallback while you
troubleshoot the setup.

Enterprise administrators can constrain which native sandbox implementations
Codex can use through [`requirements.toml`](/mirror/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml):

```toml
[windows]
allowed_sandbox_implementations = ["elevated"]
```

This example requires the `elevated` sandbox and prevents users from falling
back to `unelevated`. To permit either implementation, include both values;
Codex prefers `elevated` when no mode is selected. See the
[`requirements.toml` reference](/mirror/codex/config-reference#requirementstoml) for
the supported values.

By default, both sandbox modes also use a private desktop for stronger UI
isolation. Set `windows.sandbox_private_desktop = false` only if you need the
older `Winsta0\\Default` behavior for compatibility.

### Sandbox permissions

Running Codex in full access mode means Codex is not limited to your project
  directory and might perform unintentional destructive actions that can lead to
  data loss. For safer automation, keep sandbox boundaries in place and use
  [rules](/mirror/codex/rules) for specific exceptions, or set your [approval policy to never](/mirror/codex/agent-approvals-security#run-without-approval-prompts) to have
  Codex attempt to solve problems without asking for escalated permissions,
  based on your [approval and security setup](/mirror/codex/agent-approvals-security).

### Windows version matrix

| Windows version                  | Support level   | Notes                                                                                                                                                                                 |
| -------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows 11                       | Recommended     | Best baseline for Codex on Windows. Use this if you are standardizing an enterprise deployment.                                                                                       |
| Recent, fully updated Windows 10 | Best effort     | Can work, but is less reliable than Windows 11. For Windows 10, Codex depends on modern console support, including ConPTY. In practice, Windows 10 version 1809 or newer is required. |
| Older Windows 10 builds          | Not recommended | More likely to miss required console components such as ConPTY and more likely to fail in enterprise setups.                                                                          |

Additional environment assumptions:

- `winget` should be available. If it's missing, update Windows or install
  the Windows Package Manager before setting up Codex.
- The recommended native sandbox depends on administrator-approved setup.
- Some enterprise-managed devices block the required setup steps even when the
  OS version itself is acceptable.

### Grant sandbox read access

When a command fails because the Windows sandbox can't read a directory, use:

```text
/sandbox-add-read-dir C:\absolute\directory\path
```

The path must be an existing absolute directory. After the command succeeds, later commands that run in the sandbox can read that directory during the current session.

Use the native Windows sandbox by default. The native Windows sandbox offers the best performance and highest speeds while keeping the same security. Choose WSL2 when you
need a Linux-native environment on Windows, when your workflow already lives in
WSL2, or when neither native Windows sandbox mode meets your needs.

## Windows Subsystem for Linux

If you choose WSL2, Codex runs inside the Linux environment instead of using the
native Windows sandbox. This is useful if you need Linux-native tooling on
Windows, if your repositories and developer workflow already live in WSL2, or
if neither native Windows sandbox mode works for your environment.

WSL1 was supported through Codex `0.114`. Starting in Codex `0.115`, the Linux
sandbox moved to `bubblewrap`, so WSL1 is no longer supported.

### Launch VS Code from inside WSL

For step-by-step instructions, see the [official VS Code WSL tutorial](https://code.visualstudio.com/docs/remote/wsl-tutorial).

#### Prerequisites

- Windows with WSL installed. To install WSL, open PowerShell as an administrator, then run `wsl --install` (Ubuntu is a common choice).
- VS Code with the [WSL extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) installed.

#### Open VS Code from a WSL terminal

```bash
# From your WSL shell
cd ~/code/your-project
code .
```

This opens a WSL remote window, installs the VS Code Server if needed, and ensures integrated terminals run in Linux.

#### Confirm you're connected to WSL

- Look for the green status bar that shows `WSL: &lt;distro&gt;`.
- Integrated terminals should display Linux paths (such as `/home/...`) instead of `C:\`.
- You can verify with:

```bash
  echo $WSL_DISTRO_NAME
```

  This prints your distribution name.

If you don't see "WSL: ..." in the status bar, press `Ctrl+Shift+P`, pick
  `WSL: Reopen Folder in WSL`, and keep your repository under `/home/...` (not
  `C:\`) for best performance.

If the Windows app or project picker does not show your WSL repository, type
  &lt;code&gt;\\wsl$&lt;/code&gt; into the file picker or Explorer, then navigate to your
  distro's home directory.

### Use Codex CLI with WSL

Run these commands from an elevated PowerShell or Windows Terminal:

```powershell
# Install default Linux distribution (like Ubuntu)
wsl --install

# Start a shell inside Windows Subsystem for Linux
wsl
```

Then run these commands from your WSL shell:

```bash
# Install and run Codex in WSL
curl -fsSL https://chatgpt.com/codex/install.sh | sh
codex
```

### Working on code inside WSL

- Working in Windows-mounted paths like &lt;code&gt;/mnt/c/...&lt;/code&gt; can be slower than working in Windows-native paths. Keep your repositories under your Linux home directory (like &lt;code&gt;~/code/my-app&lt;/code&gt;) for faster I/O and fewer symlink and permission issues:
```bash
  mkdir -p ~/code && cd ~/code
  git clone https://github.com/your/repo.git
  cd repo
```
- If you need Windows access to files, they're under &lt;code&gt;\\wsl$\Ubuntu\home\&lt;user&gt;&lt;/code&gt; in Explorer.

## Troubleshooting and FAQ

If you are troubleshooting a managed Windows machine, start with the native
sandbox mode, Windows version, and any policy error shown by Codex. Most native
Windows support issues come from sandbox setup, logon rights, or filesystem
permissions rather than from the editor itself.

My native sandbox setup failed

If Codex cannot complete the `elevated` sandbox setup, the most common causes
are:

- the Windows UAC or administrator prompt was declined,
- the machine does not allow local user or group creation,
- the machine does not allow firewall rule changes,
- the machine blocks the logon rights needed by the sandbox users,
- or another enterprise policy blocks part of the setup flow.

What to try:

1. Try the `elevated` sandbox setup again and approve the administrator prompt
   if your environment allows it.
2. If your company laptop blocks this, ask your IT team whether the machine
   allows administrator-approved setup for local user/group creation, firewall
   configuration, and the required sandbox-user logon rights.
3. If the default setup still fails, use the `unelevated` sandbox so you can
   continue working while the issue is investigated.

Codex switched me to the unelevated sandbox

This means Codex could not finish the stronger `elevated` sandbox setup on your
machine.

- Codex can still run in a sandboxed mode.
- It still applies ACL-based filesystem boundaries, but it does not use the
  separate sandbox-user boundary from `elevated` and has weaker network
  isolation.
- This is a useful fallback, but not the preferred long-term enterprise
  configuration.

If you are on a managed enterprise laptop, the best long-term fix is usually to
get the `elevated` sandbox working with help from your IT team.

I see Windows error 1385

If sandboxed commands fail with error `1385`, Windows is denying the logon type
the sandbox user needs in order to start the command.

In practice, this usually means Codex created the sandbox users successfully,
but Windows policy is still preventing those users from launching sandboxed
commands.

What to do:

1. Ask your IT team whether the device policy grants the required logon rights
   to the Codex-created sandbox users.
2. Compare group policy or OU differences if the issue affects only some
   machines or teams.
3. If you need to keep working immediately, use the `unelevated` sandbox while
   the policy issue is investigated.
4. Send `CODEX_HOME/.sandbox/sandbox.log` along with your Windows version and a
   short description of the failure.

Codex warns that some folders are writable by Everyone

Codex may warn that some folders are writable by `Everyone`.

If you see this warning, Windows permissions on those folders are too broad for
the sandbox to fully protect them.

What to do:

1. Review the folders Codex lists in the warning.
2. Remove `Everyone` write access from those folders if that is appropriate in
   your environment.
3. Restart Codex or re-run the sandbox setup after those permissions are
   corrected.

If you are not sure how to change those permissions, ask your IT team for help.

Sandboxed commands cannot reach the network

Some Codex tasks are intentionally run without outbound network access,
depending on the permissions mode in use.

If a task fails because it cannot reach the network:

1. Check whether the task was supposed to run with network disabled.
2. If you expected network access, restart Codex and try again.
3. If the issue keeps happening, collect the sandbox log so the team can check
   whether the machine is in a partial or broken sandbox state.

Sandboxing worked before and then stopped

This can happen after:

- moving a repo or workspace,
- changing machine permissions,
- changing Windows policies,
- or other system configuration changes.

What to try:

1. Restart Codex.
2. Try the `elevated` sandbox setup again.
3. If that does not fix it, use the `unelevated` sandbox as a temporary
   fallback.
4. Collect the sandbox log for review.

I need to send diagnostics to OpenAI

If you still have problems, send:

- `CODEX_HOME/.sandbox/sandbox.log`

It is also helpful to include:

- a short description of what you were trying to do,
- whether the `elevated` sandbox failed or the `unelevated` sandbox was used,
- any error message shown in the app,
- whether you saw `1385` or another Windows or PowerShell error,
- and whether you are on Windows 11 or Windows 10.

Do not send:

- the contents of `CODEX_HOME/.sandbox-secrets/`

The IDE extension is installed but unresponsive

Your system may be missing C++ development tools, which some native dependencies require:

- Visual Studio Build Tools (C++ workload)
- Microsoft Visual C++ Redistributable (x64)
- With `winget`, run `winget install --id Microsoft.VisualStudio.2022.BuildTools -e`

Then fully restart VS Code after installation.

Large repositories feel slow in WSL

- Make sure you're not working under &lt;code&gt;/mnt/c&lt;/code&gt;. Move the repository to WSL (for example, &lt;code&gt;~/code/...&lt;/code&gt;).
- Increase memory and CPU for WSL if needed; update WSL to the latest version:
```powershell
  wsl --update
  wsl --shutdown
```

VS Code in WSL cannot find codex

Verify the binary exists and is on PATH inside WSL:

```bash
which codex || echo "codex not found"
```

If the binary isn't found, install it by [following the instructions](/mirror/codex/windows#use-codex-cli-with-wsl) above.

:::
:::

