---
status: needs-review
sourceId: "42ae7a4917fb"
sourceChecksum: "42ae7a4917fbfe2babcd8575dbbb64492cf2b84d9697af6738ebd8fcf9679cea"
sourceUrl: "https://developers.openai.com/codex/remote-connections"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# 远程连接

远程连接让你可以从另一台设备或另一台机器使用 Codex。你可以在 ChatGPT mobile app 中使用 Codex，在已连接的 Mac 或 Windows device 上处理 Codex；也可以从另一台受支持的 Codex App device 继续工作；或者将 Codex App 连接到 SSH host 上的项目。

远程访问会使用已连接 host 的 projects、threads、files、credentials、permissions、plugins、Computer Use、browser setup 和本地 tools。

## 远程可以做什么

- 在 host 上的 projects 中启动新 threads，或继续已有 threads。
- 发送后续指令、回答问题，并引导正在进行的工作。
- 批准命令和其他动作。
- 审查 outputs、diffs、test results、terminal output 和 screenshots。
- 在 Codex 完成任务或需要你注意时收到通知。
- 在已连接 hosts 和 threads 之间切换。

下面几节介绍如何在 ChatGPT mobile app 中使用 Codex 来控制 Codex App host。若要将 Codex 连接到 SSH host 上的项目，请参见[连接到 SSH host](#connect-to-an-ssh-host)。

<div class="not-prose my-6 max-w-4xl rounded-xl bg-[url('/images/codex/codex-wallpaper-1.webp')] bg-cover bg-center p-4 md:p-8">
  <CodexScreenshot
    alt="Codex mobile setup screen alongside the ChatGPT mobile Codex project list"
    lightSrc="/images/codex/app/mobile-setup-light.webp"
    darkSrc="/images/codex/app/mobile-setup-dark.webp"
    variant="no-wallpaper"
    maxHeight="none"
    maxWidth="420px"
  />
</div>

## 设置移动访问之前

Codex mobile setup 支持 macOS 和 Windows 上的 Codex App hosts。你可以从 iOS 或 Android 上的 ChatGPT 控制 Windows host，也可以从运行 Codex 的 Mac 控制 Windows host。Windows 目前不能从 Codex App 控制另一台电脑。

请确认你具备：

- 你想使用的 ChatGPT account 和 workspace 中的 Codex 访问权限。
- iOS 或 Android 设备上的最新版 ChatGPT mobile app。如果你在 ChatGPT mobile app 中看不到 Codex，请先更新 ChatGPT。
- 运行在保持唤醒、在线，并登录同一 account 和 workspace 的 host 上的最新版 Codex App for macOS or Windows。Mobile setup 从 Codex App 开始；你无法从 Codex CLI 或 IDE Extension 设置它。
- 该 account 或 workspace 所需的任何 multi-factor authentication、SSO 或 passkey 配置。

如果你通过 ChatGPT workspace 使用 Codex，管理员可能需要先启用 Remote Control access，你才能从手机连接。

## 设置移动访问

从你想连接的 host 上的 Codex App 开始。设置流程会为该 host 启用远程访问，然后显示一个可用手机扫描的 QR code。该 QR code 会将那台手机与该 host 配对。请将每部手机或受支持的 Codex App device 与它需要控制的每个 host 配对。

自 2026 年 6 月 8 日以来使用过的现有连接会保持配对。如果某个现有连接自 2026 年 6 月 8 日以来未使用过，请更新两个 apps 并重新配对设备。

<WorkflowSteps variant="headings">

1. 启动 Codex mobile setup。

   在 host 上打开 Codex，并在 sidebar 中选择 **Set up Codex mobile**。

2. 扫描 QR code。

   使用手机扫描 Codex 显示的 QR code。该 code 会打开 ChatGPT，以便你完成 mobile app 与 host 的连接。

3. 在 ChatGPT 中完成设置。

   ChatGPT 会打开 Codex mobile setup flow。确认使用同一个 ChatGPT account 和 workspace，然后完成任何必需的 multi-factor authentication、SSO 或 passkey 步骤。设置成功后，该 host 会出现在你手机上的 Codex 中。

4. 审查 host settings。

   在 host 上的 Codex 中，使用 **Settings > Connections** 管理已连接设备。你也可以选择是否让电脑保持唤醒、启用 Computer Use，或安装 Chrome extension。

</WorkflowSteps>

<div class="not-prose my-6 max-w-4xl">
  <CodexScreenshot
    alt="Connections settings showing devices that can control this host and remote access settings"
    lightSrc="/images/codex/app/mobile-control-this-mac-framed-light.webp"
    darkSrc="/images/codex/app/mobile-control-this-mac-framed-dark.webp"
    maxHeight="480px"
    class="p-3 sm:p-4"
    imageClass="rounded-xl"
  />
</div>

## 选择要连接的对象

从你日常已经使用 Codex 的 laptop 或 desktop 开始。当你需要持续访问或不同环境时，再添加 always-on computer 或 SSH host。

### <span class="not-prose inline-flex items-center gap-3 align-middle"><span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-secondary"><Desktop width={17} height={17} /></span><span>你的 laptop 或 desktop</span></span>

连接你日常已经运行 Codex 的 Mac 或 Windows PC。这样可以远程访问你已经使用的相同 projects、threads、credentials、plugins 和本地 setup。

如果那台电脑进入睡眠、失去网络访问或关闭 Codex，远程访问会停止，直到它再次可用。如果你把这台电脑用作 host device，请保持插电，并在可用时使用 host 的 connection settings 让它保持唤醒。

在 Mac laptop 上，远程访问可以在打开盖子并接通电源时保持可用。合上盖子时，还需要连接外接显示器。选择 **Sleep** 仍会停止远程访问。

在 Windows host 上，对于使用 [Computer Use](https://developers.openai.com/codex/app/computer-use) 的任务，请保持 session unlocked 且可用。Windows 上的 Computer Use 会在 foreground 运行，因此当你把 host desktop 专门用于任务时，remote control 最适合用来启动或检查工作。

### <span class="not-prose inline-flex items-center gap-3 align-middle"><span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-secondary"><Storage width={17} height={17} /></span><span>专用 always-on computer</span></span>

当你希望 Codex 对较长时间运行的工作保持可达时，使用专用 always-on Mac 或 Windows PC。

在那台机器上安装 Codex 应使用的 projects、credentials、plugins、MCP servers 和 tools。

### <span class="not-prose inline-flex items-center gap-3 align-middle"><span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-secondary"><Terminal width={17} height={17} /></span><span>远程开发环境</span></span>

当项目已经位于远程环境中时，使用 SSH host 或托管远程开发环境。先将 Codex App host 连接到该环境；你的手机仍会连接到 Codex App host，而 Codex 会在远程环境中使用其 dependencies、security policies 和 compute resources 工作。

有关 SSH setup 详情，请参见[连接到 SSH host](#connect-to-an-ssh-host)。

对于 always-on computer 或 remote host 上的浏览器或桌面任务，请启用 Computer Use，并在该 host 上安装 Chrome extension。

## 来自已连接 host 的内容

你的手机会向 Codex 发送 prompts、approvals 和 follow-up messages。已连接 host 会提供 Codex 使用的环境。

这意味着：

- Repository files 和本地 documents 来自已连接 host。
- Shell commands 在该 host 或远程环境上运行。
- 该 host 上安装的任何 plugin，在你远程使用 Codex 时都可用。
- MCP servers、skills、browser access 和 Computer Use 来自该 host 的配置。
- 已登录的网站和 desktop apps 只有在 host 可以访问它们时才可用。
- Sandboxing settings、security controls 和 action approvals 仍然适用于已连接 session。

Codex 使用安全 relay layer，让受信任机器可通过你已授权的 ChatGPT devices 访问，而无需将它们直接暴露到 public internet。

## 从另一台设备接续工作

你可以从另一台支持 remote control 的已登录 Codex App device 继续工作。例如，如果你的 laptop 不可用，你可以从手机在 always-on host 上启动一个 thread，稍后再在 laptop 上打开 Codex，并在那里继续同一个 thread。

在 Mac 上的 Codex 中，使用 **Settings > Connections > Control other devices** 添加另一个 host。一台设备可以同时允许远程访问并控制另一台设备。你可以从 Mac 或 iOS/Android 上的 ChatGPT 控制 Windows hosts，但不能用 Windows 控制另一台电脑。例如，你可以从 Mac 或手机控制一台 Windows device，但不能用 Windows device 控制另一台 Windows device。

<div class="not-prose my-6 max-w-4xl">
  <CodexScreenshot
    alt="Connections settings showing another device available under Control other devices"
    lightSrc="/images/codex/app/mobile-control-other-devices-framed-light.webp"
    darkSrc="/images/codex/app/mobile-control-other-devices-framed-dark.webp"
    maxHeight="360px"
    class="p-3 sm:p-4"
    imageClass="rounded-xl"
  />
</div>

## 连接到 SSH host

在 Codex App 中，从 SSH host 添加远程 projects，并针对远程 filesystem 和 shell 运行 threads。Remote project threads 会在 remote host 上运行 commands、读取 files 并写入 changes。

请让 remote host 具备与你常规 SSH 访问相同的安全预期：可信 keys、least-privilege accounts，并且没有未经身份验证的 public listeners。

<WorkflowSteps variant="headings">

1. 将 host 添加到你的 SSH config，让 Codex 可以自动发现它。

   ```text
   Host devbox
     HostName devbox.example.com
     User you
     IdentityFile ~/.ssh/id_ed25519
   ```

   Codex 会从 `~/.ssh/config` 读取具体 host aliases，使用 OpenSSH 解析它们，并忽略仅由 pattern 组成的 hosts。

2. 确认你可以从运行 Codex App 的机器 SSH 到该 host。

   ```bash
   ssh devbox
   ```

3. 在 remote host 上安装并认证 Codex。

   app 会通过 SSH 启动 remote Codex app server，使用 remote user 的 login shell。请确保在该 shell 中，remote host 的 `PATH` 可以找到 `codex` 命令。

4. 在 Codex App 中打开 **Settings > Connections**，添加或启用 SSH host，然后选择一个 remote project folder。

</WorkflowSteps>

<CodexScreenshot
  alt="Codex app settings showing SSH remote connections"
  lightSrc="/images/codex/app/remote-connections-light.webp"
  darkSrc="/images/codex/app/remote-connections-dark.webp"
  maxHeight="420px"
  class="p-3 sm:p-4"
  imageClass="rounded-xl"
/>

## 在 hosts 之间 hand off thread

Handoff 会在你的本地电脑和已连接 remote host 之间移动现有 thread 及其 Git state。使用它可以先在本地开始工作，再在远程电脑上的 worktree 中继续，之后再把 thread 带回来。

在 hand off thread 前，请连接目标 host，并在该 host 上为同一个 Git repository 保存一个 project。如果 project 是 repository 的子目录，请在两个 hosts 上保存同一个子目录。Codex 只会显示具有匹配 saved project 的 destinations。

要 hand off thread：

1. 在 Codex App 中打开该 thread。
2. 在 thread footer 中，选择当前 run location，然后选择 destination host。将远程 thread 交回本地电脑时，选择 **This computer**。
3. 审查 destination 和 branch，然后选择 **Hand off**。

Codex 会在 destination host 上创建或复用 worktree，传输 thread 和 Git state，并将 thread 切换到该 host。如果 thread 正在运行，handoff 会在传输前中断当前 response。

你也可以在另一个 thread 中要求 Codex 将指定名称的 thread hand off 到已连接 host。Codex 无法 hand off 发出请求的 thread，也不支持 handoff 到 Codex cloud environment。

## 身份认证和网络暴露

远程连接使用 SSH 启动并管理 remote Codex app server。不要在共享网络或 public network 上直接暴露 app-server transports。

如果你需要访问当前网络之外的远程机器，请使用 VPN 或 mesh networking tool，而不是将 app server 直接暴露到 internet。

## 故障排查

### 你在手机上看不到 host

确认 Codex App 正在 host 上运行，你已启用 **Allow other devices to connect**，并且两台设备使用同一个 ChatGPT account 和 workspace。如果你自 2026 年 6 月 8 日以来未使用过该连接，请更新两个 apps 并重新配对设备。

### 重新登录后 Remote Control 关闭

退出 ChatGPT 会关闭 **Remote Control**，但不会移除你现有的设备配对。重新登录后，打开 **Remote Control** 以恢复之前的连接状态。

如果你打开 **Remote Control** 并选择 **Add** 后看到错误，请重启 host 上的 Codex App，然后重试。

### approval request 没有出现

在 ChatGPT mobile app 中打开 Codex。确认手机和 host 使用同一个 ChatGPT account 和 workspace，然后重新扫描 QR code，或从 host 重新开始 setup。如果你使用 ChatGPT workspace，请让管理员确认已启用 Remote Control access。

### 远程 session 断开

检查 host 是否进入睡眠、失去网络访问，或关闭了 Codex。让 host 在 Codex 工作期间保持唤醒和连接。

### 身份认证阻止 setup

完成 setup 期间显示的 account 或 workspace authentication prompt。如果你的组织要求 SSO、multi-factor authentication 或 passkey，请先完成该流程再重试。如果 setup 仍然失败，请让 workspace admin 确认已启用 Remote Control access。

## 另请参见

- [Codex App](https://developers.openai.com/codex/app)
- [Codex App features](https://developers.openai.com/codex/app/features)
- [Codex App settings](https://developers.openai.com/codex/app/settings)
- [Computer Use](https://developers.openai.com/codex/app/computer-use)
- [Chrome extension](https://developers.openai.com/codex/app/chrome-extension)
- [Command line options](https://developers.openai.com/codex/cli/reference)
- [Authentication](https://developers.openai.com/codex/auth)

