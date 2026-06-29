---
title: "远程连接"
description: "Connect your phone or another device to a Codex host, or use projects on remote machines over SSH"
outline: deep
---

# 远程连接

**文档集**：Codex<br>
**分组**：远程连接<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/remote-connections](https://developers.openai.com/codex/remote-connections)
- Markdown 来源：[https://developers.openai.com/codex/remote-connections.md](https://developers.openai.com/codex/remote-connections.md)
- 抓取时间：2026-06-27T05:55:06.123Z
- Checksum：`42ae7a4917fbfe2babcd8575dbbb64492cf2b84d9697af6738ebd8fcf9679cea`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
远程连接让你可以从另一台设备或另一台机器使用 Codex。你可以在 ChatGPT mobile app 中使用 Codex，在已连接的 Mac 或 Windows device 上处理 Codex；也可以从另一台受支持的 Codex App device 继续工作；或者将 Codex App 连接到 SSH host 上的项目。

远程访问会使用已连接 host 的 projects、threads、files、credentials、permissions、plugins、Computer Use、browser setup 和本地 tools。

## 远程可以做什么

- 在 host 上的 projects 中启动新 threads，或继续已有 threads。
- 发送后续指令、回答问题，并引导正在进行的工作。
- 批准命令和其他动作。
- 审查 outputs、diffs、test results、terminal output 和 screenshots。
- 在 Codex 完成任务或需要你注意时收到通知。
- 在已连接 hosts 和 threads 之间切换。

下面几节介绍如何在 ChatGPT mobile app 中使用 Codex 来控制 Codex App host。若要将 Codex 连接到 SSH host 上的项目，请参见[连接到 SSH host](/mirror/codex/remote-connections#connect-to-an-ssh-host)。


  &lt;CodexScreenshot
    alt="Codex mobile setup screen alongside the ChatGPT mobile Codex project list"
    lightSrc="/images/codex/app/mobile-setup-light.webp"
    darkSrc="/images/codex/app/mobile-setup-dark.webp"
    variant="no-wallpaper"
    maxHeight="none"
    maxWidth="420px"
  /&gt;


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



1. 启动 Codex mobile setup。

   在 host 上打开 Codex，并在 sidebar 中选择 **Set up Codex mobile**。

2. 扫描 QR code。

   使用手机扫描 Codex 显示的 QR code。该 code 会打开 ChatGPT，以便你完成 mobile app 与 host 的连接。

3. 在 ChatGPT 中完成设置。

   ChatGPT 会打开 Codex mobile setup flow。确认使用同一个 ChatGPT account 和 workspace，然后完成任何必需的 multi-factor authentication、SSO 或 passkey 步骤。设置成功后，该 host 会出现在你手机上的 Codex 中。

4. 审查 host settings。

   在 host 上的 Codex 中，使用 **Settings &gt; Connections** 管理已连接设备。你也可以选择是否让电脑保持唤醒、启用 Computer Use，或安装 Chrome extension。




  &lt;CodexScreenshot
    alt="Connections settings showing devices that can control this host and remote access settings"
    lightSrc="/images/codex/app/mobile-control-this-mac-framed-light.webp"
    darkSrc="/images/codex/app/mobile-control-this-mac-framed-dark.webp"
    maxHeight="480px"
    class="p-3 sm:p-4"
    imageClass="rounded-xl"
  /&gt;


## 选择要连接的对象

从你日常已经使用 Codex 的 laptop 或 desktop 开始。当你需要持续访问或不同环境时，再添加 always-on computer 或 SSH host。

### &lt;span class="not-prose inline-flex items-center gap-3 align-middle"&gt;&lt;span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-secondary"&gt;&lt;Desktop width={17} height={17} /&gt;&lt;/span&gt;&lt;span&gt;你的 laptop 或 desktop&lt;/span&gt;&lt;/span&gt;

连接你日常已经运行 Codex 的 Mac 或 Windows PC。这样可以远程访问你已经使用的相同 projects、threads、credentials、plugins 和本地 setup。

如果那台电脑进入睡眠、失去网络访问或关闭 Codex，远程访问会停止，直到它再次可用。如果你把这台电脑用作 host device，请保持插电，并在可用时使用 host 的 connection settings 让它保持唤醒。

在 Mac laptop 上，远程访问可以在打开盖子并接通电源时保持可用。合上盖子时，还需要连接外接显示器。选择 **Sleep** 仍会停止远程访问。

在 Windows host 上，对于使用 [Computer Use](/mirror/codex/app/computer-use) 的任务，请保持 session unlocked 且可用。Windows 上的 Computer Use 会在 foreground 运行，因此当你把 host desktop 专门用于任务时，remote control 最适合用来启动或检查工作。

### &lt;span class="not-prose inline-flex items-center gap-3 align-middle"&gt;&lt;span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-secondary"&gt;&lt;Storage width={17} height={17} /&gt;&lt;/span&gt;&lt;span&gt;专用 always-on computer&lt;/span&gt;&lt;/span&gt;

当你希望 Codex 对较长时间运行的工作保持可达时，使用专用 always-on Mac 或 Windows PC。

在那台机器上安装 Codex 应使用的 projects、credentials、plugins、MCP servers 和 tools。

### &lt;span class="not-prose inline-flex items-center gap-3 align-middle"&gt;&lt;span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-secondary"&gt;&lt;Terminal width={17} height={17} /&gt;&lt;/span&gt;&lt;span&gt;远程开发环境&lt;/span&gt;&lt;/span&gt;

当项目已经位于远程环境中时，使用 SSH host 或托管远程开发环境。先将 Codex App host 连接到该环境；你的手机仍会连接到 Codex App host，而 Codex 会在远程环境中使用其 dependencies、security policies 和 compute resources 工作。

有关 SSH setup 详情，请参见[连接到 SSH host](/mirror/codex/remote-connections#connect-to-an-ssh-host)。

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

在 Mac 上的 Codex 中，使用 **Settings &gt; Connections &gt; Control other devices** 添加另一个 host。一台设备可以同时允许远程访问并控制另一台设备。你可以从 Mac 或 iOS/Android 上的 ChatGPT 控制 Windows hosts，但不能用 Windows 控制另一台电脑。例如，你可以从 Mac 或手机控制一台 Windows device，但不能用 Windows device 控制另一台 Windows device。


  &lt;CodexScreenshot
    alt="Connections settings showing another device available under Control other devices"
    lightSrc="/images/codex/app/mobile-control-other-devices-framed-light.webp"
    darkSrc="/images/codex/app/mobile-control-other-devices-framed-dark.webp"
    maxHeight="360px"
    class="p-3 sm:p-4"
    imageClass="rounded-xl"
  /&gt;


## 连接到 SSH host

在 Codex App 中，从 SSH host 添加远程 projects，并针对远程 filesystem 和 shell 运行 threads。Remote project threads 会在 remote host 上运行 commands、读取 files 并写入 changes。

请让 remote host 具备与你常规 SSH 访问相同的安全预期：可信 keys、least-privilege accounts，并且没有未经身份验证的 public listeners。



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

4. 在 Codex App 中打开 **Settings &gt; Connections**，添加或启用 SSH host，然后选择一个 remote project folder。



&lt;CodexScreenshot
  alt="Codex app settings showing SSH remote connections"
  lightSrc="/images/codex/app/remote-connections-light.webp"
  darkSrc="/images/codex/app/remote-connections-dark.webp"
  maxHeight="420px"
  class="p-3 sm:p-4"
  imageClass="rounded-xl"
/&gt;

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

- [Codex App](/mirror/codex/app)
- [Codex App features](/mirror/codex/app/features)
- [Codex App settings](/mirror/codex/app/settings)
- [Computer Use](/mirror/codex/app/computer-use)
- [Chrome extension](/mirror/codex/app/chrome-extension)
- [Command line options](/mirror/codex/cli/reference)
- [Authentication](/mirror/codex/auth)

:::

## English source

::: details 展开英文原文
::: v-pre
Remote connections let you use Codex from another device or another machine.
Use Codex in the ChatGPT mobile app to work with Codex on a connected Mac or
Windows device, continue work from another supported Codex App device, or connect
the Codex App to projects on an SSH host.

Remote access uses the connected host's projects, threads, files, credentials,
permissions, plugins, Computer Use, browser setup, and local tools.

## What you can do remotely

- Start new threads in projects on the host, or continue existing ones.
- Send follow-up instructions, answer questions, and steer active work.
- Approve commands and other actions.
- Review outputs, diffs, test results, terminal output, and screenshots.
- Get notified when Codex completes a task or needs your attention.
- Switch between connected hosts and threads.

The next sections cover using Codex in the ChatGPT mobile app to control a Codex
App host. To connect Codex to a project on an SSH host, see
[connect to an SSH host](/mirror/codex/remote-connections#connect-to-an-ssh-host).


  &lt;CodexScreenshot
    alt="Codex mobile setup screen alongside the ChatGPT mobile Codex project list"
    lightSrc="/images/codex/app/mobile-setup-light.webp"
    darkSrc="/images/codex/app/mobile-setup-dark.webp"
    variant="no-wallpaper"
    maxHeight="none"
    maxWidth="420px"
  /&gt;


## Before you set up mobile access

Codex mobile setup supports Codex App hosts on macOS and Windows. You can
  control a Windows host from ChatGPT on iOS or Android, or from a Mac running
  Codex. Windows can't currently control another computer from the Codex App.

Make sure you have:

- Codex access in the ChatGPT account and workspace you want to use.
- The latest ChatGPT mobile app on an iOS or Android device. If you don't see
  Codex in the ChatGPT mobile app, update ChatGPT first.
- The latest Codex App for macOS or Windows running on a host that's awake,
  online, and signed in to the same account and workspace. Mobile setup starts
  from the Codex App; you can't set it up from the Codex CLI or IDE Extension.
- Any required multi-factor authentication, SSO, or passkey configuration for
  that account or workspace.

If you use Codex through a ChatGPT workspace, your admin may need to enable
Remote Control access before you can connect from your phone.

## Set up mobile access

Start in the Codex App on the host you want to connect. The setup flow enables
remote access for that host, then shows a QR code you can scan from your phone.
The QR code pairs that phone with that host. Pair every phone or supported Codex
App device with every host you want it to control.

Existing connections used since June 8, 2026, remain paired. If you haven't
  used an existing connection since June 8, 2026, update both apps and pair the
  devices again.



1. Start Codex mobile setup.

   Open Codex on the host and select **Set up Codex mobile** in the
   sidebar.

2. Scan the QR code.

   Use your phone to scan the QR code shown by Codex. The code opens ChatGPT so
   you can finish connecting the mobile app to the host.

3. Finish setup in ChatGPT.

   ChatGPT opens the Codex mobile setup flow. Confirm the same ChatGPT account
   and workspace, then complete any required multi-factor authentication, SSO,
   or passkey steps. After setup succeeds, the host appears in Codex on your
   phone.

4. Review host settings.

   In Codex on the host, use **Settings &gt; Connections** to manage connected
   devices. You can also choose whether to keep the computer awake, enable
   Computer Use, or install the Chrome extension.




  &lt;CodexScreenshot
    alt="Connections settings showing devices that can control this host and remote access settings"
    lightSrc="/images/codex/app/mobile-control-this-mac-framed-light.webp"
    darkSrc="/images/codex/app/mobile-control-this-mac-framed-dark.webp"
    maxHeight="480px"
    class="p-3 sm:p-4"
    imageClass="rounded-xl"
  /&gt;


## Choose what to connect

Start with the laptop or desktop where you already use Codex. Add an always-on
computer or SSH host when you need continuous access or a different environment.

### &lt;span class="not-prose inline-flex items-center gap-3 align-middle"&gt;&lt;span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-secondary"&gt;&lt;Desktop width={17} height={17} /&gt;&lt;/span&gt;&lt;span&gt;Your laptop or desktop&lt;/span&gt;&lt;/span&gt;

Connect the Mac or Windows PC where you already run Codex day to day. This gives
remote access to the same projects, threads, credentials, plugins, and local
setup you already use.

If that computer sleeps, loses network access, or closes Codex, remote access
stops until it's available again. If you use this computer as your host device,
keep it plugged in and use the host's connection settings to keep it awake where
available.

On a Mac laptop, remote access can stay available with the lid open and power
connected. With the lid closed, connect an external display as well. Choosing
**Sleep** still stops remote access.

On a Windows host, keep the session unlocked and available for tasks that use
[Computer Use](/mirror/codex/app/computer-use). Computer use on Windows runs in the
foreground, so remote control is best for starting or checking work while you
dedicate the host desktop to the task.

### &lt;span class="not-prose inline-flex items-center gap-3 align-middle"&gt;&lt;span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-secondary"&gt;&lt;Storage width={17} height={17} /&gt;&lt;/span&gt;&lt;span&gt;A dedicated always-on computer&lt;/span&gt;&lt;/span&gt;

Use a dedicated always-on Mac or Windows PC when you want Codex to stay
reachable for longer-running work.

Install the projects, credentials, plugins, MCP servers, and tools Codex should
use on that machine.

### &lt;span class="not-prose inline-flex items-center gap-3 align-middle"&gt;&lt;span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-secondary"&gt;&lt;Terminal width={17} height={17} /&gt;&lt;/span&gt;&lt;span&gt;A remote development environment&lt;/span&gt;&lt;/span&gt;

Use an SSH host or managed remote development environment when the project
already lives in a remote environment. Connect the Codex App host to that
environment first; your phone still connects to the Codex App host, and Codex
works in the remote environment with its dependencies, security policies, and
compute resources.

For SSH setup details, see [connect to an SSH host](/mirror/codex/remote-connections#connect-to-an-ssh-host).

For browser or desktop tasks on an always-on computer or remote host, enable
  Computer Use and install the Chrome extension on that host.

## What comes from the connected host

Your phone sends prompts, approvals, and follow-up messages to Codex. The
connected host provides the environment Codex uses.

That means:

- Repository files and local documents come from the connected host.
- Shell commands run on that host or remote environment.
- Any plugin installed on that host is available when you use Codex remotely.
- MCP servers, skills, browser access, and Computer Use come from that host's
  configuration.
- Signed-in websites and desktop apps are available only when the host can
  access them.
- The sandboxing settings, security controls, and action approvals still apply
  to the connected session.

Codex uses a secure relay layer to keep trusted machines reachable across your
authorized ChatGPT devices without exposing them directly to the public
internet.

## Pick up work from another device

You can continue work from another signed-in Codex App device that supports
remote control. For example, if your laptop is unavailable, you can start
a thread from your phone on an always-on host, then later open Codex on your
laptop and continue that same thread there.

In Codex on a Mac, use **Settings &gt; Connections &gt; Control other devices** to add
the other host. A device can allow remote access and control another device at
the same time. You can control Windows hosts from a Mac or from ChatGPT on iOS
or Android, but you can't use Windows to control another computer. For example,
you can control a Windows device from your Mac or phone, but you can't use a
Windows device to control another Windows device.


  &lt;CodexScreenshot
    alt="Connections settings showing another device available under Control other devices"
    lightSrc="/images/codex/app/mobile-control-other-devices-framed-light.webp"
    darkSrc="/images/codex/app/mobile-control-other-devices-framed-dark.webp"
    maxHeight="360px"
    class="p-3 sm:p-4"
    imageClass="rounded-xl"
  /&gt;


## Connect to an SSH host

In the Codex App, add remote projects from an SSH host and run threads against
the remote filesystem and shell. Remote project threads run commands, read
files, and write changes on the remote host.

Keep the remote host configured with the same security expectations you use for
normal SSH access: trusted keys, least-privilege accounts, and no
unauthenticated public listeners.



1. Add the host to your SSH config so Codex can auto-discover it.

```text
   Host devbox
     HostName devbox.example.com
     User you
     IdentityFile ~/.ssh/id_ed25519
```

   Codex reads concrete host aliases from `~/.ssh/config`, resolves them with
   OpenSSH, and ignores pattern-only hosts.

2. Confirm you can SSH to the host from the machine running the Codex App.

```bash
   ssh devbox
```

3. Install and authenticate Codex on the remote host.

   The app starts the remote Codex app server through SSH, using the remote
   user's login shell. Make sure the `codex` command is available on the
   remote host's `PATH` in that shell.

4. In the Codex App, open **Settings &gt; Connections**, add or enable the SSH
   host, then choose a remote project folder.



&lt;CodexScreenshot
  alt="Codex app settings showing SSH remote connections"
  lightSrc="/images/codex/app/remote-connections-light.webp"
  darkSrc="/images/codex/app/remote-connections-dark.webp"
  maxHeight="420px"
  class="p-3 sm:p-4"
  imageClass="rounded-xl"
/&gt;

## Hand off a thread between hosts

Handoff moves an existing thread and its Git state between your local computer
and a connected remote host. Use it to start work locally, continue in a
worktree on a remote computer, and bring the thread back later.

Before you hand off a thread, connect the destination host and save a project
for the same Git repository on that host. If the project is a subdirectory of
the repository, save the same subdirectory on both hosts. Codex only shows
destinations with a matching saved project.

To hand off a thread:

1. Open the thread in the Codex App.
2. In the thread footer, select the current run location, then select the
   destination host. Select **This computer** when handing a remote thread back
   to your local computer.
3. Review the destination and branch, then select **Hand off**.

Codex creates or reuses a worktree on the destination host, transfers the
thread and Git state, and switches the thread to that host. If the thread is
running, handoff interrupts the current response before transferring it.

You can also ask Codex in another thread to hand off a named thread to a
connected host. Codex can't hand off the thread making the request, and handoff
to a Codex cloud environment isn't supported.

## Authentication and network exposure

Remote connections use SSH to start and manage the remote Codex app server.
Don't expose app-server transports directly on a shared or public network.

If you need to reach a remote machine outside your current network, use a VPN
or mesh networking tool instead of exposing the app server directly to the
internet.

## Troubleshooting

### You don't see the host on your phone

Confirm that the Codex App is running on the host, you've enabled **Allow other
devices to connect**, and both devices use the same ChatGPT account and
workspace. If you haven't used the connection since June 8, 2026, update both
apps and pair the devices again.

### Remote Control is off after you sign back in

Signing out of ChatGPT turns off **Remote Control**, but it doesn't remove your
existing device pairings. After you sign back in, turn on **Remote Control** to
restore the previous connection state.

If you see an error after you turn on **Remote Control** and select **Add**,
restart the Codex App on the host, then try again.

### The approval request doesn't appear

Open Codex in the ChatGPT mobile app. Confirm that the phone and host use the
same ChatGPT account and workspace, then scan the QR code again or restart setup
from the host. If you use a ChatGPT workspace, ask your admin to confirm that
they've enabled Remote Control access.

### The remote session disconnects

Check whether the host went to sleep, lost network access, or closed Codex.
Keep the host awake and connected while Codex works.

### Authentication blocks setup

Complete the account or workspace authentication prompt shown during setup. If
your organization requires SSO, multi-factor authentication, or a passkey,
finish that flow before trying again. If setup still fails, ask your workspace
admin to confirm that they've enabled Remote Control access.

## See also

- [Codex App](/mirror/codex/app)
- [Codex App features](/mirror/codex/app/features)
- [Codex App settings](/mirror/codex/app/settings)
- [Computer Use](/mirror/codex/app/computer-use)
- [Chrome extension](/mirror/codex/app/chrome-extension)
- [Command line options](/mirror/codex/cli/reference)
- [Authentication](/mirror/codex/auth)

:::
:::

