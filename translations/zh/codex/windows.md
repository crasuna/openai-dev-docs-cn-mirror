---
status: needs-review
sourceId: "ab8a6a5054f1"
sourceChecksum: "ab8a6a5054f1f651c60ae64fae90607db5617d5e748f7b927c6ce281648e2f2c"
sourceUrl: "https://developers.openai.com/codex/windows"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# Windows

在 Windows 上，可以通过原生 [Codex app](https://developers.openai.com/codex/app/windows)、[CLI](https://developers.openai.com/codex/cli) 或 [IDE extension](https://developers.openai.com/codex/ide) 使用 Codex。

Windows 上的 Codex app 支持核心工作流，例如 parallel agent threads、worktrees、automations、Git functionality、in-app browser、artifact previews、plugins 和 skills。

<div class="mb-8">
  <CodexCallout
    href="/codex/app/windows"
    title="在 Windows 上使用 Codex app"
    description="使用原生 Windows app 跨项目工作、运行并行 agent threads，并在一处审查结果。"
    iconSrc="/images/codex/codex-banner-icon.webp"
  />
</div>

根据使用界面和你的设置，Codex 可以在 Windows 上以三种实际方式运行：

- 原生运行在 Windows 上，使用更强的 `elevated` sandbox，
- 原生运行在 Windows 上，使用 fallback `unelevated` sandbox，
- 或在 [Windows Subsystem for Linux 2](https://learn.microsoft.com/en-us/windows/wsl/install)（WSL2）中运行，使用 Linux sandbox implementation。

## Windows sandbox

当你在 Windows 上原生运行 Codex 时，agent mode 会使用 Windows sandbox，阻止在工作文件夹之外写入文件系统，并在没有你明确批准的情况下阻止网络访问。

原生 Windows sandbox support 包含两种可在 `config.toml` 中配置的模式：

```toml
[windows]
sandbox = "elevated" # or "unelevated"
```

`elevated` 是首选原生 Windows sandbox。它使用专用低权限 sandbox users、文件系统权限边界、firewall rules，以及在 sandbox 中运行 commands 所需的 local policy changes。

`unelevated` 是 fallback 原生 Windows sandbox。它使用从当前用户派生的受限 Windows token 运行 commands，应用基于 ACL 的文件系统边界，并使用 environment-level offline controls，而不是专用 offline-user firewall rule。它比 `elevated` 弱，但当 administrator-approved setup 被本地或企业策略阻止时仍然有用。

如果两种模式都可用，请使用 `elevated`。如果默认原生 sandbox 在你的环境中无法工作，请在排查设置的同时使用 `unelevated` 作为 fallback。

Enterprise administrators 可以通过 [`requirements.toml`](https://developers.openai.com/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml) 约束 Codex 可使用哪些原生 sandbox implementations：

```toml
[windows]
allowed_sandbox_implementations = ["elevated"]
```

此示例要求使用 `elevated` sandbox，并阻止 users fallback 到 `unelevated`。若要允许任一种 implementation，请包含两个值；未选择模式时，Codex 会优先使用 `elevated`。受支持值请参见 [`requirements.toml` reference](https://developers.openai.com/codex/config-reference#requirementstoml)。

默认情况下，两种 sandbox 模式也会使用 private desktop，以获得更强的 UI isolation。仅当你出于兼容性需要旧的 `Winsta0\\Default` 行为时，才设置 `windows.sandbox_private_desktop = false`。

### Sandbox permissions

以 full access mode 运行 Codex 意味着 Codex 不受限于你的 project directory，并且可能执行无意的破坏性动作，导致数据丢失。为了更安全的 automation，请保留 sandbox boundaries，并为特定例外使用 [rules](https://developers.openai.com/codex/rules)；或者将你的 [approval policy 设置为 never](https://developers.openai.com/codex/agent-approvals-security#run-without-approval-prompts)，让 Codex 在不请求升级权限的情况下尝试解决问题，具体取决于你的 [approval and security setup](https://developers.openai.com/codex/agent-approvals-security)。

### Windows version matrix

| Windows version                  | Support level   | Notes                                                                                                                                                                                 |
| -------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows 11                       | Recommended     | Codex on Windows 的最佳基线。如果你要标准化 enterprise deployment，请使用它。                                                                                       |
| Recent, fully updated Windows 10 | Best effort     | 可以工作，但可靠性不如 Windows 11。对于 Windows 10，Codex 依赖现代 console support，包括 ConPTY。实践中要求 Windows 10 version 1809 或更新版本。 |
| Older Windows 10 builds          | Not recommended | 更可能缺少所需 console components（例如 ConPTY），也更可能在 enterprise setups 中失败。                                                                          |

其他环境假设：

- `winget` 应可用。如果缺失，请先更新 Windows 或安装 Windows Package Manager，再设置 Codex。
- 推荐的原生 sandbox 依赖 administrator-approved setup。
- 某些 enterprise-managed devices 会阻止所需 setup steps，即使 OS version 本身可接受。

### 授予 sandbox 读取访问权限

当某个命令因为 Windows sandbox 无法读取目录而失败时，使用：

```text
/sandbox-add-read-dir C:\absolute\directory\path
```

该 path 必须是现有 absolute directory。命令成功后，后续在 sandbox 中运行的 commands 可以在当前 session 期间读取该 directory。

默认使用原生 Windows sandbox。原生 Windows sandbox 提供最佳性能和最高速度，同时保持相同安全性。当你需要 Windows 上的 Linux-native environment，工作流已经位于 WSL2 中，或两种原生 Windows sandbox 模式都不能满足需求时，选择 WSL2。

## Windows Subsystem for Linux

如果选择 WSL2，Codex 会在 Linux environment 内运行，而不是使用原生 Windows sandbox。如果你需要 Windows 上的 Linux-native tooling、repositories 和 developer workflow 已经位于 WSL2 中，或两种原生 Windows sandbox 模式都不适用于你的环境，这会很有用。

WSL1 在 Codex `0.114` 之前受支持。从 Codex `0.115` 开始，Linux sandbox 迁移到 `bubblewrap`，因此不再支持 WSL1。

### 从 WSL 内启动 VS Code

分步说明请参见[官方 VS Code WSL tutorial](https://code.visualstudio.com/docs/remote/wsl-tutorial)。

#### 前提条件

- 已安装 WSL 的 Windows。要安装 WSL，请以 administrator 身份打开 PowerShell，然后运行 `wsl --install`（Ubuntu 是常见选择）。
- 已安装 [WSL extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) 的 VS Code。

#### 从 WSL terminal 打开 VS Code

```bash
# From your WSL shell
cd ~/code/your-project
code .
```

这会打开 WSL remote window，在需要时安装 VS Code Server，并确保 integrated terminals 在 Linux 中运行。

#### 确认你已连接到 WSL

- 查看显示 `WSL: <distro>` 的绿色 status bar。
- Integrated terminals 应显示 Linux paths（例如 `/home/...`），而不是 `C:\`。
- 你可以用以下命令验证：

  ```bash
  echo $WSL_DISTRO_NAME
  ```

  这会打印你的 distribution name。

如果你没有在 status bar 中看到 “WSL: ...”，按 `Ctrl+Shift+P`，选择 `WSL: Reopen Folder in WSL`，并将 repository 放在 `/home/...` 下（而不是 `C:\`）以获得最佳性能。

如果 Windows app 或 project picker 没有显示你的 WSL repository，请在 file picker 或 Explorer 中输入 <code>\\wsl$</code>，然后进入你的 distro 的 home directory。

### 在 WSL 中使用 Codex CLI

从 elevated PowerShell 或 Windows Terminal 运行这些命令：

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

- 在 <code>/mnt/c/...</code> 这类 Windows-mounted paths 下工作，可能比在 Windows-native paths 中更慢。请将 repositories 放在你的 Linux home directory 下（例如 <code>~/code/my-app</code>），以获得更快 I/O，并减少 symlink 和 permission issues：
  ```bash
  mkdir -p ~/code && cd ~/code
  git clone https://github.com/your/repo.git
  cd repo
  ```
- 如果你需要从 Windows 访问文件，它们位于 Explorer 中的 <code>\\wsl$\Ubuntu\home\&lt;user&gt;</code>。

## 故障排查和 FAQ

如果你正在排查一台 managed Windows machine，请从原生 sandbox mode、Windows version，以及 Codex 显示的任何 policy error 开始。大多数原生 Windows support 问题来自 sandbox setup、logon rights 或 filesystem permissions，而不是 editor 本身。

My native sandbox setup failed

如果 Codex 无法完成 `elevated` sandbox setup，最常见原因包括：

- Windows UAC 或 administrator prompt 被拒绝，
- 机器不允许创建本地 user 或 group，
- 机器不允许更改 firewall rule，
- 机器阻止 sandbox users 所需的 logon rights，
- 或另一项 enterprise policy 阻止了 setup flow 的某个部分。

可以尝试：

1. 再次尝试 `elevated` sandbox setup，并在你的环境允许时批准 administrator prompt。
2. 如果公司 laptop 阻止了此操作，请询问 IT team，该机器是否允许针对 local user/group creation、firewall configuration 和所需 sandbox-user logon rights 的 administrator-approved setup。
3. 如果默认 setup 仍然失败，请使用 `unelevated` sandbox，这样你可以在问题调查期间继续工作。

Codex switched me to the unelevated sandbox

这意味着 Codex 无法在你的机器上完成更强的 `elevated` sandbox setup。

- Codex 仍可以在 sandboxed mode 中运行。
- 它仍会应用基于 ACL 的 filesystem boundaries，但不会使用 `elevated` 的独立 sandbox-user boundary，network isolation 也更弱。
- 这是一个有用的 fallback，但不是首选的长期 enterprise configuration。

如果你使用 managed enterprise laptop，最佳长期修复通常是让 IT team 协助你使 `elevated` sandbox 正常工作。

I see Windows error 1385

如果 sandboxed commands 失败并显示 error `1385`，说明 Windows 正在拒绝 sandbox user 启动 command 所需的 logon type。

实践中，这通常意味着 Codex 已成功创建 sandbox users，但 Windows policy 仍阻止这些 users 启动 sandboxed commands。

应对方式：

1. 询问 IT team，该 device policy 是否向 Codex-created sandbox users 授予了所需 logon rights。
2. 如果问题只影响某些 machines 或 teams，请比较 group policy 或 OU differences。
3. 如果需要立即继续工作，请在 policy issue 调查期间使用 `unelevated` sandbox。
4. 发送 `CODEX_HOME/.sandbox/sandbox.log`，并附上你的 Windows version 和失败的简短描述。

Codex warns that some folders are writable by Everyone

Codex 可能会警告某些 folders 可由 `Everyone` 写入。

如果看到此警告，说明这些 folders 上的 Windows permissions 过宽，sandbox 无法完全保护它们。

应对方式：

1. 审查 Codex 在警告中列出的 folders。
2. 如果在你的环境中合适，请移除这些 folders 上的 `Everyone` write access。
3. 更正权限后，重启 Codex 或重新运行 sandbox setup。

如果你不确定如何更改这些 permissions，请向 IT team 寻求帮助。

Sandboxed commands cannot reach the network

一些 Codex tasks 会根据正在使用的 permissions mode，故意在没有 outbound network access 的情况下运行。

如果某个 task 因无法访问网络而失败：

1. 检查该 task 是否本应在 network disabled 的情况下运行。
2. 如果你预期应有 network access，请重启 Codex 并重试。
3. 如果问题持续出现，请收集 sandbox log，让团队检查该机器是否处于 partial 或 broken sandbox state。

Sandboxing worked before and then stopped

这可能发生在：

- 移动 repo 或 workspace，
- 更改机器 permissions，
- 更改 Windows policies，
- 或其他 system configuration changes 之后。

可以尝试：

1. 重启 Codex。
2. 再次尝试 `elevated` sandbox setup。
3. 如果仍无法修复，请使用 `unelevated` sandbox 作为临时 fallback。
4. 收集 sandbox log 以供审查。

I need to send diagnostics to OpenAI

如果问题仍然存在，请发送：

- `CODEX_HOME/.sandbox/sandbox.log`

同时包含以下信息也会有帮助：

- 对你当时尝试执行内容的简短描述，
- `elevated` sandbox 是否失败，或是否使用了 `unelevated` sandbox，
- app 中显示的任何 error message，
- 你是否看到 `1385` 或其他 Windows 或 PowerShell error，
- 以及你使用的是 Windows 11 还是 Windows 10。

不要发送：

- `CODEX_HOME/.sandbox-secrets/` 的内容

The IDE extension is installed but unresponsive

你的系统可能缺少 C++ development tools，而某些 native dependencies 需要它们：

- Visual Studio Build Tools（C++ workload）
- Microsoft Visual C++ Redistributable（x64）
- 使用 `winget` 时，运行 `winget install --id Microsoft.VisualStudio.2022.BuildTools -e`

安装后请完全重启 VS Code。

Large repositories feel slow in WSL

- 确保你不是在 <code>/mnt/c</code> 下工作。将 repository 移到 WSL 中（例如 <code>~/code/...</code>）。
- 如果需要，请增加 WSL 的 memory 和 CPU；将 WSL 更新到最新版本：
  ```powershell
  wsl --update
  wsl --shutdown
  ```

VS Code in WSL cannot find codex

验证 binary 存在并且位于 WSL 内的 PATH 上：

```bash
which codex || echo "codex not found"
```

如果找不到 binary，请按照上方[说明](#use-codex-cli-with-wsl)安装它。

