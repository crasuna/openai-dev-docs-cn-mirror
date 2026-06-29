---
title: "Sandbox 沙盒"
description: "How Codex uses sandboxes across the Codex app, IDE, and CLI"
outline: deep
---

# Sandbox 沙盒

**文档集**：Codex  
**分组**：Codex — Concepts  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/concepts/sandboxing](https://developers.openai.com/codex/concepts/sandboxing)
- Markdown 来源：[https://developers.openai.com/codex/concepts/sandboxing.md](https://developers.openai.com/codex/concepts/sandboxing.md)
- 抓取时间：2026-06-27T05:54:56.301Z
- Checksum：`9d3eea99ac263ab2d3d499bf74182a5b9e250369e765c7fc05e01040b41e9433`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Sandbox 是让 Codex 可以自主行动、但不默认获得你机器无限制访问权的边界。当 Codex 在
**Codex app**、**IDE extension** 或 **CLI** 中运行本地命令时，这些命令会在受约束的环境中运行，而不是默认以完全访问权限运行。

该环境定义了 Codex 可以自行做什么，例如它能修改哪些文件，以及命令是否可以使用网络。当 task 保持在这些边界内时，Codex 可以不暂停确认而继续推进。当它需要越过边界时，Codex 会退回到 approval flow。

Sandboxing 和 approvals 是协同工作的不同控制。Sandbox 定义技术边界。Approval policy 决定 Codex 何时必须停下来询问，才能跨越这些边界。

## Sandbox 做什么

Sandbox 适用于 spawned commands，而不仅仅适用于 Codex 内置的文件操作。如果 Codex 运行 `git`、package managers 或 test runners 等工具，这些命令会继承相同的 sandbox 边界。

Codex 在每个 OS 上使用平台原生 enforcement。macOS、Linux、WSL2 和原生 Windows 上的实现有所不同，但各个界面的理念相同：给 agent 一个有边界的工作位置，让常规 tasks 可以在清晰限制内自主运行。

## 为什么它重要

Sandbox 可以减少 approval fatigue。与其要求你确认每一个低风险命令，不如让 Codex 在你已经批准的边界内读取文件、进行编辑并运行常规项目命令。

它也为 agentic work 提供了更清晰的 trust model。你不只是信任 agent 的意图；你还信任 agent 正在强制限制内运行。这让你更容易让 Codex 独立工作，同时仍然知道它什么时候会停下来求助。

## 开始使用

当你使用默认 permissions mode 时，Codex 会自动应用 sandboxing。

### 前提条件

在 **macOS** 上，sandboxing 使用内置 Seatbelt framework 开箱即用。

在 **Windows** 上，当你在 PowerShell 中运行时，Codex 使用原生 [Windows sandbox](/mirror/codex/windows#windows-sandbox)；当你在 WSL2 中运行时，使用 Linux sandbox 实现。

在 **Linux 和 WSL2** 上，请先用你的 package manager 安装 `bubblewrap`：

&lt;Tabs
  id="codex-sandboxing-prerequisites"
  param="sandbox-os"
  tabs={[
    { id: "ubuntu-debian", label: "Ubuntu/Debian" },
    { id: "fedora", label: "Fedora" },
  ]}
&gt;


```bash
sudo apt install bubblewrap
```





```bash
sudo dnf install bubblewrap
```




Codex 使用它在 `PATH` 上找到的第一个 `bwrap` executable。如果没有可用的 `bwrap` executable，Codex 会退回到 bundled helper，但该 helper 需要支持创建 unprivileged user namespace。安装提供 `bwrap` 的 distribution package 能让此设置更可靠。

当缺少 `bwrap`，或 helper 无法创建所需 user namespace 时，Codex 会显示启动 warning。在限制此 AppArmor 设置的 distributions 上，优先加载 `bwrap` AppArmor profile，让 `bwrap` 无需全局禁用限制也能继续工作。

**Ubuntu AppArmor note:** 在 Ubuntu 25.04 上，从 Ubuntu package repository 安装 `bubblewrap` 应无需额外 AppArmor 设置即可工作。
  `bwrap-userns-restrict` profile 随 `apparmor` package 一起发布，位于
  `/etc/apparmor.d/bwrap-userns-restrict`。

在 Ubuntu 24.04 上，安装 `bubblewrap` 后，Codex 仍可能警告无法创建所需 user namespace。复制并加载额外 profile：

```bash
sudo apt update
sudo apt install apparmor-profiles apparmor-utils
sudo install -m 0644 \
  /usr/share/apparmor/extra-profiles/bwrap-userns-restrict \
  /etc/apparmor.d/bwrap-userns-restrict
sudo apparmor_parser -r /etc/apparmor.d/bwrap-userns-restrict
```

`apparmor_parser -r` 会把 profile 加载到 kernel 中，无需重启。你也可以重新加载所有 AppArmor profiles：

```bash
sudo systemctl reload apparmor.service
```

如果该 profile 不可用，或无法解决问题，可以用以下方式禁用 AppArmor unprivileged user namespace 限制：

```bash
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

## 如何控制它

大多数人会从产品里的 permissions controls 开始。

在 Codex app 和 IDE 中，你可以从 composer 或 chat input 下方的 permissions selector 中选择模式。该 selector 允许你依赖 Codex 的默认 permissions、切换到 full access，或使用你的自定义配置。



在 CLI 中，使用 [`/permissions`](/mirror/codex/cli/slash-commands#update-permissions-with-permissions)
在 session 期间切换模式。

## 配置 defaults

如果你希望 Codex 每次都以相同行为启动，请使用自定义配置。Codex 将这些 defaults 存储在本地设置文件 `config.toml` 中。[Config basics](/mirror/codex/config-basic) 解释了其工作方式，[Configuration reference](/mirror/codex/config-reference) 记录了 `sandbox_mode`、`approval_policy`、`approvals_reviewer` 和 `sandbox_workspace_write.writable_roots` 的确切 keys。使用这些设置来决定 Codex 默认获得多少自主性、它可以写入哪些目录、何时应暂停等待 approval，以及由谁 review 符合条件的 approval requests。

概括来说，常见 sandbox modes 是：

- `read-only`：Codex 可以检查文件，但未经 approval 不能编辑文件或运行命令。
- `workspace-write`：Codex 可以读取文件、在 workspace 内编辑，并在该边界内运行常规本地命令。这是本地工作的默认低摩擦模式。
- `danger-full-access`：Codex 运行时不受 sandbox 限制。这会移除文件系统和网络边界，只有在你希望 Codex 以完全访问权限行动时才应使用。

常见 approval policies 是：

- `untrusted`：Codex 会在运行不属于其 trusted set 的命令前询问。
- `on-request`：Codex 默认在 sandbox 内工作，需要越过边界时询问。
- `never`：Codex 不会因 approval prompts 而停下。

当 approvals 是交互式时，你还可以用 `approvals_reviewer` 选择由谁 review：

- `user`：approval prompts 显示给用户。这是默认值。
- `auto_review`：符合条件的 approval prompts 交给 reviewer agent（参见 [Auto-review](/mirror/codex/concepts/sandboxing/auto-review)）。

Full access 意味着同时使用 `sandbox_mode = "danger-full-access"` 和 `approval_policy = "never"`。相比之下，风险更低的本地自动化 preset 是同时使用 `sandbox_mode = "workspace-write"` 和 `approval_policy = "on-request"`，或对应的 CLI flags `--sandbox workspace-write --ask-for-approval on-request`。然后，你可以保留 `approvals_reviewer = "user"` 进行人工 approvals，或设置 `approvals_reviewer = "auto_review"` 进行自动 approval review。

如果你需要 Codex 跨多个目录工作，writable roots 可以扩展它能修改的位置，而不必完全移除 sandbox。如果你需要更宽或更窄的 trust boundary，请调整默认 sandbox mode 和 approval policy，而不是依赖一次性 exceptions。

当 workflow 需要特定 exception 时，使用 [rules](/mirror/codex/rules)。Rules 允许你在 sandbox 外允许、提示或禁止 command prefixes，这通常比大范围扩大访问权限更合适。有关 app 中 approvals 和 sandbox 行为的更高层概述，请参见 [Codex app features](/mirror/codex/app/features#approvals-and-sandboxing)；有关 IDE-specific settings 入口，请参见 [Codex IDE extension settings](/mirror/codex/ide/settings)。

Automatic review 在可用时不会改变 sandbox 边界。它是该边界处 approval requests 的一种可能 `approvals_reviewer`，例如 sandbox escalations、被阻止的网络访问，或仍需 approval 的 side-effecting tool calls。Sandbox 内已经允许的 actions 会运行而无需额外 review。有关 reviewer lifecycle、trigger types、denial semantics 和 configuration details，请参见 [Auto-review](/mirror/codex/concepts/sandboxing/auto-review)。

平台详情位于各平台专门文档中。有关原生 Windows setup、behavior 和 troubleshooting，请参见 [Windows](/mirror/codex/windows)。有关 sandboxing 和 approvals 的 admin requirements 以及 organization-level constraints，请参见 [Agent approvals & security](/mirror/codex/agent-approvals-security)。

:::

## English source

::: details 展开英文原文
::: v-pre
The sandbox is the boundary that lets Codex act autonomously without giving it
unrestricted access to your machine. When Codex runs local commands in the
**Codex app**, **IDE extension**, or **CLI**, those commands run inside a
constrained environment instead of running with full access by default.

That environment defines what Codex can do on its own, such as which files it
can modify and whether commands can use the network. When a task stays inside
those boundaries, Codex can keep moving without stopping for confirmation. When
it needs to go beyond them, Codex falls back to the approval flow.

Sandboxing and approvals are different controls that work together. The
  sandbox defines technical boundaries. The approval policy decides when Codex
  must stop and ask before crossing them.

## What the sandbox does

The sandbox applies to spawned commands, not just to Codex's built-in file
operations. If Codex runs tools like `git`, package managers, or test runners,
those commands inherit the same sandbox boundaries.

Codex uses platform-native enforcement on each OS. The implementation differs
between macOS, Linux, WSL2, and native Windows, but the idea is the same across
surfaces: give the agent a bounded place to work so routine tasks can run
autonomously inside clear limits.

## Why it matters

The sandbox reduces approval fatigue. Instead of asking you to confirm every
low-risk command, Codex can read files, make edits, and run routine project
commands within the boundary you already approved.

It also gives you a clearer trust model for agentic work. You aren't just
trusting the agent's intentions; you are trusting that the agent is operating
inside enforced limits. That makes it easier to let Codex work independently
while still knowing when it will stop and ask for help.

## Getting started

Codex applies sandboxing automatically when you use the default permissions
mode.

### Prerequisites

On **macOS**, sandboxing works out of the box using the built-in Seatbelt
framework.

On **Windows**, Codex uses the native [Windows sandbox](/mirror/codex/windows#windows-sandbox) when you run in PowerShell and the
Linux sandbox implementation when you run in WSL2.

On **Linux and WSL2**, install `bubblewrap` with your package manager first:

&lt;Tabs
  id="codex-sandboxing-prerequisites"
  param="sandbox-os"
  tabs={[
    { id: "ubuntu-debian", label: "Ubuntu/Debian" },
    { id: "fedora", label: "Fedora" },
  ]}
&gt;


```bash
sudo apt install bubblewrap
```





```bash
sudo dnf install bubblewrap
```




Codex uses the first `bwrap` executable it finds on `PATH`. If no `bwrap`
executable is available, Codex falls back to a bundled helper, but that helper
requires support for unprivileged user namespace creation. Installing the
distribution package that provides `bwrap` keeps this setup reliable.

Codex surfaces a startup warning when `bwrap` is missing or when the helper
can't create the needed user namespace. On distributions that restrict this
AppArmor setting, prefer loading the `bwrap` AppArmor profile so `bwrap` can
keep working without disabling the restriction globally.

**Ubuntu AppArmor note:** On Ubuntu 25.04, installing `bubblewrap` from
  Ubuntu's package repository should work without extra AppArmor setup. The
  `bwrap-userns-restrict` profile ships in the `apparmor` package at
  `/etc/apparmor.d/bwrap-userns-restrict`.

On Ubuntu 24.04, Codex may still warn that it can't create the needed user
namespace after `bubblewrap` is installed. Copy and load the extra profile:

```bash
sudo apt update
sudo apt install apparmor-profiles apparmor-utils
sudo install -m 0644 \
  /usr/share/apparmor/extra-profiles/bwrap-userns-restrict \
  /etc/apparmor.d/bwrap-userns-restrict
sudo apparmor_parser -r /etc/apparmor.d/bwrap-userns-restrict
```

`apparmor_parser -r` loads the profile into the kernel without a reboot. You
can also reload all AppArmor profiles:

```bash
sudo systemctl reload apparmor.service
```

If that profile is unavailable or does not resolve the issue, you can disable
the AppArmor unprivileged user namespace restriction with:

```bash
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

## How you control it

Most people start with the permissions controls in the product.

In the Codex app and IDE, you choose a mode from the permissions selector under
the composer or chat input. That selector lets you rely on Codex's default
permissions, switch to full access, or use your custom configuration.



In the CLI, use [`/permissions`](/mirror/codex/cli/slash-commands#update-permissions-with-permissions)
to switch modes during a session.

## Configure defaults

If you want Codex to start with the same behavior every time, use a custom
configuration. Codex stores those defaults in `config.toml`, its local settings
file. [Config basics](/mirror/codex/config-basic) explains how it works, and the
[Configuration reference](/mirror/codex/config-reference) documents the exact keys for
`sandbox_mode`, `approval_policy`, `approvals_reviewer`, and
`sandbox_workspace_write.writable_roots`. Use those settings to decide how much
autonomy Codex gets by default, which directories it can write to, when it
should pause for approval, and who reviews eligible approval requests.

At a high level, the common sandbox modes are:

- `read-only`: Codex can inspect files, but it can't edit files or run
  commands without approval.
- `workspace-write`: Codex can read files, edit within the workspace, and run
  routine local commands inside that boundary. This is the default low-friction
  mode for local work.
- `danger-full-access`: Codex runs without sandbox restrictions. This removes
  the filesystem and network boundaries and should be used only when you want
  Codex to act with full access.

The common approval policies are:

- `untrusted`: Codex asks before running commands that aren't in its trusted
  set.
- `on-request`: Codex works inside the sandbox by default and asks when it
  needs to go beyond that boundary.
- `never`: Codex doesn't stop for approval prompts.

When approvals are interactive, you can also choose who reviews them with
`approvals_reviewer`:

- `user`: approval prompts surface to the user. This is the default.
- `auto_review`: eligible approval prompts go to a reviewer agent (see
  [Auto-review](/mirror/codex/concepts/sandboxing/auto-review)).

Full access means using `sandbox_mode = "danger-full-access"` together with
`approval_policy = "never"`. By contrast, the lower-risk local automation
preset is `sandbox_mode = "workspace-write"` together with
`approval_policy = "on-request"`, or the matching CLI flags
`--sandbox workspace-write --ask-for-approval on-request`. You can then keep
`approvals_reviewer = "user"` for manual approvals or set
`approvals_reviewer = "auto_review"` for automatic approval review.

If you need Codex to work across more than one directory, writable roots let
you extend the places it can modify without removing the sandbox entirely. If
you need a broader or narrower trust boundary, adjust the default sandbox mode
and approval policy instead of relying on one-off exceptions.

When a workflow needs a specific exception, use [rules](/mirror/codex/rules). Rules
let you allow, prompt, or forbid command prefixes outside the sandbox, which is
often a better fit than broadly expanding access. For a higher-level overview
of approvals and sandbox behavior in the app, see
[Codex app features](/mirror/codex/app/features#approvals-and-sandboxing), and for the
IDE-specific settings entry points, see [Codex IDE extension settings](/mirror/codex/ide/settings).

Automatic review, when available, does not change the sandbox boundary. It is
one possible `approvals_reviewer` for approval requests at that boundary, such
as sandbox escalations, blocked network access, or side-effecting tool calls
that still need approval. Actions already allowed inside the sandbox run
without extra review. For the reviewer lifecycle, trigger types, denial
semantics, and configuration details, see
[Auto-review](/mirror/codex/concepts/sandboxing/auto-review).

Platform details live in the platform-specific docs. For native Windows setup,
behavior, and troubleshooting, see [Windows](/mirror/codex/windows). For admin
requirements and organization-level constraints on sandboxing and approvals, see
[Agent approvals & security](/mirror/codex/agent-approvals-security).

:::
:::

