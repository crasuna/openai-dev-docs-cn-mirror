---
status: needs-review
sourceId: "ab8a6a5054f1"
sourceChecksum: "ab8a6a5054f1f651c60ae64fae90607db5617d5e748f7b927c6ce281648e2f2c"
sourceUrl: "https://developers.openai.com/codex/windows"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# Windows 支持

在 Windows 上，可以通过原生 [Codex app](https://developers.openai.com/codex/app/windows)、[CLI](https://developers.openai.com/codex/cli) 或 [IDE 扩展](https://developers.openai.com/codex/ide) 使用 Codex。

Windows 上的 Codex app 支持核心工作流，例如并行 agent 线程、worktrees、automations、Git 功能、应用内浏览器、artifact 预览、plugins 和 skills。

<div class="mb-8">
  <CodexCallout
    href="/codex/app/windows"
    title="在 Windows 上使用 Codex app"
    description="使用原生 Windows app 跨项目工作、运行并行 agent 线程，并在一处审查结果。"
    iconSrc="/images/codex/codex-banner-icon.webp"
  />
</div>

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

企业管理员可以通过 [`requirements.toml`](https://developers.openai.com/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml) 约束 Codex 可使用哪些原生 sandbox 实现：

```toml
[windows]
allowed_sandbox_implementations = ["elevated"]
```

此示例要求使用 `elevated` sandbox，并阻止用户回退到 `unelevated`。若要允许任一种实现，请包含两个值；未选择模式时，Codex 会优先使用 `elevated`。受支持值请参见 [`requirements.toml` reference](https://developers.openai.com/codex/config-reference#requirementstoml)。

默认情况下，两种 sandbox 模式也会使用 private desktop，以获得更强的 UI 隔离。仅当你出于兼容性需要旧的 `Winsta0\\Default` 行为时，才设置 `windows.sandbox_private_desktop = false`。

### Sandbox permissions

以 full access 模式运行 Codex 意味着 Codex 不受限于你的项目目录，并且可能执行无意的破坏性动作，导致数据丢失。为了更安全地自动化，请保留 sandbox 边界，并为特定例外使用 [rules](https://developers.openai.com/codex/rules)；或者将你的 [approval policy 设置为 never](https://developers.openai.com/codex/agent-approvals-security#run-without-approval-prompts)，让 Codex 在不请求升级权限的情况下尝试解决问题，具体取决于你的 [approval and security setup](https://developers.openai.com/codex/agent-approvals-security)。

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

- 查看显示 `WSL: <distro>` 的绿色状态栏。
- 集成终端应显示 Linux 路径（例如 `/home/...`），而不是 `C:\`。
- 你可以用以下命令验证：

  ```bash
  echo $WSL_DISTRO_NAME
  ```

  这会打印你的发行版名称。

如果你没有在状态栏中看到 “WSL: ...”，按 `Ctrl+Shift+P`，选择 `WSL: Reopen Folder in WSL`，并将仓库放在 `/home/...` 下（而不是 `C:\`）以获得最佳性能。

如果 Windows app 或项目选择器没有显示你的 WSL 仓库，请在文件选择器或 Explorer 中输入 <code>\\wsl$</code>，然后进入你的发行版 home 目录。

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

- 在 <code>/mnt/c/...</code> 这类 Windows 挂载路径下工作，可能比在 Windows 原生路径中更慢。请将仓库放在你的 Linux home 目录下（例如 <code>~/code/my-app</code>），以获得更快 I/O，并减少符号链接和权限问题：
  ```bash
  mkdir -p ~/code && cd ~/code
  git clone https://github.com/your/repo.git
  cd repo
  ```
- 如果你需要从 Windows 访问文件，它们位于 Explorer 中的 <code>\\wsl$\Ubuntu\home\&lt;user&gt;</code>。

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

- 确保你不是在 <code>/mnt/c</code> 下工作。将 repository 移到 WSL 中（例如 <code>~/code/...</code>）。
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

如果找不到 binary，请按照上方[说明](#use-codex-cli-with-wsl)安装它。
