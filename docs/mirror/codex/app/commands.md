---
title: "Codex app 命令"
description: "Reference for Codex app commands and keyboard shortcuts"
outline: deep
---

# Codex app 命令

**文档集**：Codex 编码智能体<br>
**分组**：Codex — 应用<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/app/commands](https://developers.openai.com/codex/app/commands)
- Markdown 来源：[https://developers.openai.com/codex/app/commands.md](https://developers.openai.com/codex/app/commands.md)
- 抓取时间：2026-06-27T05:54:51.516Z
- Checksum：`8763b1eff14253bc5263c78286310d6f25f6850d7ab4b9f449dd10311492756f`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用这些 commands 和 keyboard shortcuts 在 Codex app 中导航。

## Keyboard shortcuts

|             | Action             | macOS shortcut                                                                    |
| ----------- | ------------------ | --------------------------------------------------------------------------------- |
| **General** |                    |                                                                                   |
|             | Command menu       | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;Shift&lt;/kbd&gt; + &lt;kbd&gt;P&lt;/kbd&gt; 或 &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;K&lt;/kbd&gt; |
|             | Settings           | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;,&lt;/kbd&gt;                                                     |
|             | Keyboard shortcuts | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;/&lt;/kbd&gt;                                                     |
|             | Open folder        | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;O&lt;/kbd&gt;                                                     |
|             | Navigate back      | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;[&lt;/kbd&gt;                                                     |
|             | Navigate forward   | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;]&lt;/kbd&gt;                                                     |
|             | Increase font size | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;+&lt;/kbd&gt; 或 &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;=&lt;/kbd&gt;                    |
|             | Decrease font size | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;-&lt;/kbd&gt; 或 &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;\_&lt;/kbd&gt;                   |
|             | Toggle sidebar     | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;B&lt;/kbd&gt;                                                     |
|             | Toggle diff panel  | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;Option&lt;/kbd&gt; + &lt;kbd&gt;B&lt;/kbd&gt;                                 |
|             | Toggle terminal    | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;J&lt;/kbd&gt;                                                     |
|             | Clear the terminal | &lt;kbd&gt;Ctrl&lt;/kbd&gt; + &lt;kbd&gt;L&lt;/kbd&gt;                                                    |
| **Thread**  |                    |                                                                                   |
|             | New thread         | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;N&lt;/kbd&gt; 或 &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;Shift&lt;/kbd&gt; + &lt;kbd&gt;O&lt;/kbd&gt; |
|             | Search threads     | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;G&lt;/kbd&gt;                                                     |
|             | Find in thread     | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;F&lt;/kbd&gt;                                                     |
|             | Previous thread    | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;Shift&lt;/kbd&gt; + &lt;kbd&gt;[&lt;/kbd&gt;                                  |
|             | Next thread        | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;Shift&lt;/kbd&gt; + &lt;kbd&gt;]&lt;/kbd&gt;                                  |
|             | Dictation          | &lt;kbd&gt;Ctrl&lt;/kbd&gt; + &lt;kbd&gt;M&lt;/kbd&gt;                                                    |

要查找、自定义或重置 shortcuts，请打开 **Settings &gt; Keyboard Shortcuts**。你可以按 command name 搜索，或将搜索字段切换到 keystroke mode，然后按下想要查找的 shortcut。

## 搜索 past threads 并在 thread 中查找

使用 thread search（&lt;kbd&gt;Cmd&lt;/kbd&gt;/&lt;kbd&gt;Ctrl&lt;/kbd&gt; + &lt;kbd&gt;G&lt;/kbd&gt;）重新打开 past conversation。当你的 Codex desktop app 中提供 expanded matching 时，它还可以匹配 conversation content 和 Git branch names，因此你可以搜索 thread 中的一句话，或搜索 `fix/login-redirect` 这样的 branch。

打开 thread 后，使用 **Find in thread**（&lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;F&lt;/kbd&gt;）在当前 conversation 中查找文本。它不会跨其他 threads 搜索。

## Slash commands

Slash commands 让你无需离开 thread composer 就能控制 Codex。可用 commands 会根据你的 environment 和 access 而变化。

### 使用 slash command

1. 在 thread composer 中输入 `/`。
2. 从列表中选择 command，或继续输入以筛选（例如 `/status`）。

你也可以在 thread composer 中输入 `$` 来显式调用 skills。参见 [Skills](/mirror/codex/skills)。

已启用的 skills 也会出现在 slash command list 中。

### 可用 slash commands

| Slash command | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| `/feedback`   | 打开 feedback dialog 以提交 feedback，并可选择包含 logs。               |
| `/goal`       | 设置一个 Codex 要持续推进的 persistent goal；先使用 `/plan` 来塑造它。         |
| `/init`       | 为当前 project 生成 `AGENTS.md` scaffold。                              |
| `/mcp`        | 打开 MCP status 以查看 connected servers。                                             |
| `/plan`       | 切换 plan mode，用于 multi-step planning。                                              |
| `/review`     | 启动 code review mode，用于 review uncommitted changes 或与 base branch 比较。 |
| `/status`     | 显示 thread ID、context usage 和 rate limits。                                    |

### 使用 `/goal` 设置或管理 goal

在 app composer 中使用 `/goal` 启动 Goal mode。goal 是一个 persistent objective，Codex 会朝它工作，直到任务完成、暂停或需要更多输入。要先与 Codex 一起定义 goal，请从 `/plan` 开始，然后用 `/goal` 设置 refined goal。

如果 `/goal` 未出现在 slash command list 中，请在 `config.toml` 中启用 `features.goals`：

```toml
[features]
goals = true
```

你也可以从 CLI 运行 `codex features enable goals`，或请求 Codex 运行它。

&lt;CodexScreenshot
  alt="composer 上方的 Codex app goal progress controls"
  lightSrc="/images/codex/app/goal-dialog-light.webp"
  darkSrc="/images/codex/app/goal-dialog-dark.webp"
  class="mb-6"
/&gt;

当 goal 处于 active 状态时，app 会在 composer 上方显示进度。使用该 progress row 中的 buttons 暂停或恢复 goal、编辑 goal text，或清除 goal，而不是输入另一个 slash command。goal 运行时，你仍可以通过 follow-up messages 继续引导 Codex。

关于编写有效 goals 的指南，请参阅 [Goal mode](/mirror/codex/prompting#goal-mode)。

## Deep links

Codex app 会注册 `codex://` URL scheme，因此 links 可以直接打开 app 的特定部分。向 URL 添加 query string values 前，请先进行 encode。

### 支持的 links

创建 links 时请使用这些 canonical forms。下面各 sections 按 link type 列出完整参考。

| Deep link                                                                   | Opens                                                            |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `codex://threads/new`                                                       | 新的 local thread。                                              |
| `codex://new?&lt;query&gt;`                                                       | 至少带有一个 new-thread query parameter 的新 local thread。 |
| `codex://threads/&lt;thread-id&gt;`                                               | 一个 local thread。`&lt;thread-id&gt;` 必须是该 thread 的 session UUID。 |
| `codex://settings`                                                          | Settings。                                                        |
| `codex://settings/connections/&lt;connection-type&gt;`                            | Computer、device 或 SSH connection settings。                    |
| `codex://settings/connections/ssh/add?name=&lt;ssh-config-host&gt;`               | 从你的 SSH config 向 Codex 添加 host。                       |
| `codex://skills`                                                            | Skills。                                                          |
| `codex://automations`                                                       | 打开 create flow 的 Automations。                           |
| `codex://plugins/install/&lt;plugin-name&gt;?marketplace=&lt;marketplace-name&gt;`      | 来自已知 marketplace 的 plugin install flow。          |
| `codex://plugins/&lt;plugin-id&gt;`                                               | Plugin detail page。                                            |
| `codex://plugins/&lt;plugin-name&gt;?marketplacePath=&lt;absolute-marketplace-path&gt;` | 来自 local marketplace 的 local plugin detail page。             |
| `codex://pets/install?name=&lt;pet-name&gt;&imageUrl=&lt;https-image-url&gt;`           | pet install flow。                                            |

### Threads

当你需要打开现有 local thread 或启动新 thread 时，请使用这些 links。

| Deep link                     | Opens                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `codex://threads/&lt;thread-id&gt;` | 一个 local thread。`&lt;thread-id&gt;` 必须是该 thread 的 session UUID。                                               |
| `codex://threads/new`         | 新的 local thread。                                                                                            |
| `codex://threads/new?&lt;query&gt;` | 带 optional query parameters 的新 local thread。                                                             |
| `codex://new?&lt;query&gt;`         | 新的 local thread。至少包含 `prompt`、`path` 或 `originUrl` 之一；否则 link 不会执行任何操作。 |

对于 `codex://threads/new` 或 `codex://new`，可根据需要添加以下 query parameters；你可以在同一 URL 中组合它们。

| Query parameter              | Required | What it does                                                                                                                                                    |
| ---------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prompt=&lt;text&gt;`              | No       | 设置初始 composer text。                                                                                                                                 |
| `path=&lt;absolute-path&gt;`       | No       | 在 local workspace 中打开新 thread。`path` 必须是 local directory 的 absolute path。有效时，Codex 会将该目录用作 active workspace。 |
| `originUrl=&lt;git-remote-url&gt;` | No       | 通过 Git remote URL 匹配你当前 workspace roots 之一。如果同时存在 `path`，Codex 会先解析 `path`。                                          |

示例：[展示一些关于我如何使用 Codex 的有趣统计](codex://threads/new?prompt=Show%20me%20some%20fun%20stats%20about%20how%20I%27ve%20been%20using%20Codex)

### Settings

当你需要打开 Settings 或特定 settings page 时，请使用这些 links。

| Deep link                                                     | Opens                                                                                        |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `codex://settings`                                            | Settings。                                                                                    |
| `codex://settings/browser-use`                                | Browser settings。                                                                            |
| `codex://settings/computer-use/google-chrome`                 | computer use 的 Google Chrome settings。                                                     |
| `codex://settings/connections`                                | Remote connections settings。                                                                 |
| `codex://settings/connections/computer`                       | 从其他 device 控制这台 Mac 或 PC 的 settings。                                 |
| `codex://settings/connections/devices`                        | 控制其他 devices 的 settings。                                                      |
| `codex://settings/connections/ssh`                            | SSH connection settings。                                                                     |
| `codex://settings/connections/ssh/add?name=&lt;ssh-config-host&gt;` | 将命名 host alias 添加为 Codex-managed connection，然后打开 SSH connection settings。 |

`name` 值必须匹配 `~/.ssh/config` 中的 host alias。该 link 会为添加的 host 禁用 automatic connection。如果 Codex 找不到命名 host，它会打开 SSH connection settings 并显示 error。

不受支持的 `codex://settings/...` paths 会打开主 Settings page。

### Skills

当你需要打开 Skills 时，请使用这些 links。

| Deep link        | Opens   |
| ---------------- | ------- |
| `codex://skills` | Skills。 |

### Automations

当你需要打开 Automations 时，请使用这些 links。

| Deep link             | Opens                                  |
| --------------------- | -------------------------------------- |
| `codex://automations` | 打开 create flow 的 Automations。 |

### Plugins

Plugin links 根据你是从 marketplace 安装、打开 plugin，还是使用 local `marketplace.json` 而有不同形式。Plugin 基础知识见 [Plugins](/mirror/codex/plugins)。local 或 repo marketplace 设置见 [Build plugins](/mirror/codex/plugins/build#build-your-own-curated-plugin-list)。

#### Plugin install

使用此形式打开 Codex 已知 marketplace 中某个 plugin 的 install flow。

| Deep link                                                              | Opens                                           |
| ---------------------------------------------------------------------- | ----------------------------------------------- |
| `codex://plugins/install/&lt;plugin-name&gt;?marketplace=&lt;marketplace-name&gt;` | plugin detail 或 install flow。 |

| Query parameter                  | Required | What it does                                                                    |
| -------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `marketplace=&lt;marketplace-name&gt;` | Yes      | 标识 marketplace。对于 OpenAI-curated plugin，请使用 `openai-curated`。 |

install link 只接受 `marketplace` query parameter。如果 Codex 找不到请求的 marketplace 或 plugin，它会改为打开 Plugins page。

#### Plugin detail

| Deep link                     | Opens                 |
| ----------------------------- | --------------------- |
| `codex://plugins/&lt;plugin-id&gt;` | Plugin detail page。 |

`&lt;plugin-id&gt;` 必须标识该 plugin。对于 OpenAI-curated plugin，请使用 `&lt;plugin-name&gt;@openai-curated` 形式。

Codex-generated plugin links 还可以包含这些 query parameters。手动编写 link 时请省略两者。

| Query parameter    | Required | What it does                                                                                                                                    |
| ------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `hostId=&lt;host-id&gt;` | No       | 标识拥有 plugin context 的 Codex host，例如 `local` 或你配置的 remote connections 之一。Codex 会提供这些 IDs。 |
| `source=manage`    | No       | 保留 app 的 plugin-management entry point。它不是 admin-only。                                                                         |

示例：[打开 OpenAI Developers plugin](codex://plugins/openai-developers@openai-curated)

#### Local plugin

local 或 repo marketplace 设置见 [Build plugins](/mirror/codex/plugins/build#build-your-own-curated-plugin-list)。

| Deep link                                                                   | Opens                                                |
| --------------------------------------------------------------------------- | ---------------------------------------------------- |
| `codex://plugins/&lt;plugin-name&gt;?marketplacePath=&lt;absolute-marketplace-path&gt;` | 来自 local marketplace 的 local plugin detail page。 |

| Query parameter                               | Required | What it does                                                                                               |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `marketplacePath=&lt;absolute-marketplace-path&gt;` | Yes      | 指向 local `marketplace.json` 的 absolute path，例如 `/Users/alex/.agents/plugins/marketplace.json`。 |
| `mode=share`                                  | No       | 打开该 local plugin 的 share flow。                                                                |

### Pets

当该功能启用时，使用这些 links 打开 pet install flow。

| Deep link                                                         | Opens                 |
| ----------------------------------------------------------------- | --------------------- |
| `codex://pets/install?name=&lt;pet-name&gt;&imageUrl=&lt;https-image-url&gt;` | pet install flow。 |

| Query parameter              | Required | What it does                                      |
| ---------------------------- | -------- | ------------------------------------------------- |
| `name=&lt;pet-name&gt;`            | Yes      | 设置 pet name。                                |
| `imageUrl=&lt;https-image-url&gt;` | Yes      | 设置 pet image URL。`imageUrl` 必须是 HTTPS。 |
| `description=&lt;text&gt;`         | No       | 设置可选的 pet description。                |

## 另见

- [Features](/mirror/codex/app/features)
- [Settings](/mirror/codex/app/settings)

:::

## English source

::: details 展开英文原文
::: v-pre
Use these commands and keyboard shortcuts to navigate the Codex app.

## Keyboard shortcuts

|             | Action             | macOS shortcut                                                                    |
| ----------- | ------------------ | --------------------------------------------------------------------------------- |
| **General** |                    |                                                                                   |
|             | Command menu       | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;Shift&lt;/kbd&gt; + &lt;kbd&gt;P&lt;/kbd&gt; or &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;K&lt;/kbd&gt; |
|             | Settings           | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;,&lt;/kbd&gt;                                                     |
|             | Keyboard shortcuts | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;/&lt;/kbd&gt;                                                     |
|             | Open folder        | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;O&lt;/kbd&gt;                                                     |
|             | Navigate back      | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;[&lt;/kbd&gt;                                                     |
|             | Navigate forward   | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;]&lt;/kbd&gt;                                                     |
|             | Increase font size | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;+&lt;/kbd&gt; or &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;=&lt;/kbd&gt;                    |
|             | Decrease font size | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;-&lt;/kbd&gt; or &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;\_&lt;/kbd&gt;                   |
|             | Toggle sidebar     | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;B&lt;/kbd&gt;                                                     |
|             | Toggle diff panel  | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;Option&lt;/kbd&gt; + &lt;kbd&gt;B&lt;/kbd&gt;                                 |
|             | Toggle terminal    | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;J&lt;/kbd&gt;                                                     |
|             | Clear the terminal | &lt;kbd&gt;Ctrl&lt;/kbd&gt; + &lt;kbd&gt;L&lt;/kbd&gt;                                                    |
| **Thread**  |                    |                                                                                   |
|             | New thread         | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;N&lt;/kbd&gt; or &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;Shift&lt;/kbd&gt; + &lt;kbd&gt;O&lt;/kbd&gt; |
|             | Search threads     | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;G&lt;/kbd&gt;                                                     |
|             | Find in thread     | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;F&lt;/kbd&gt;                                                     |
|             | Previous thread    | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;Shift&lt;/kbd&gt; + &lt;kbd&gt;[&lt;/kbd&gt;                                  |
|             | Next thread        | &lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;Shift&lt;/kbd&gt; + &lt;kbd&gt;]&lt;/kbd&gt;                                  |
|             | Dictation          | &lt;kbd&gt;Ctrl&lt;/kbd&gt; + &lt;kbd&gt;M&lt;/kbd&gt;                                                    |

To find, customize, or reset shortcuts, open **Settings &gt; Keyboard Shortcuts**.
You can search by command name or switch the search field into keystroke mode
and press the shortcut you want to find.

## Search past threads and find in a thread

Use thread search (&lt;kbd&gt;Cmd&lt;/kbd&gt;/&lt;kbd&gt;Ctrl&lt;/kbd&gt; + &lt;kbd&gt;G&lt;/kbd&gt;) to reopen a
past conversation. When expanded matching is available in your Codex desktop
app, it can also match conversation content and Git branch names, so you can
search for a phrase from the thread or a branch such as `fix/login-redirect`.

Use **Find in thread** (&lt;kbd&gt;Cmd&lt;/kbd&gt; + &lt;kbd&gt;F&lt;/kbd&gt;) after opening a thread
to find text within that current conversation. It doesn't search across other
threads.

## Slash commands

Slash commands let you control Codex without leaving the thread composer. Available commands vary based on your environment and access.

### Use a slash command

1. In the thread composer, type `/`.
2. Select a command from the list, or keep typing to filter (for example, `/status`).

You can also explicitly invoke skills by typing `$` in the thread composer. See [Skills](/mirror/codex/skills).

Enabled skills also appear in the slash command list.

### Available slash commands

| Slash command | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| `/feedback`   | Open the feedback dialog to submit feedback and optionally include logs.               |
| `/goal`       | Set a persistent goal for Codex to work toward; use `/plan` first to shape it.         |
| `/init`       | Generate an `AGENTS.md` scaffold for the current project.                              |
| `/mcp`        | Open MCP status to view connected servers.                                             |
| `/plan`       | Toggle plan mode for multi-step planning.                                              |
| `/review`     | Start code review mode to review uncommitted changes or compare against a base branch. |
| `/status`     | Show the thread ID, context usage, and rate limits.                                    |

### Set or manage a goal with `/goal`

Use `/goal` in the app composer to start Goal mode. A goal is a persistent
objective that Codex works toward until it finishes the task, pauses, or needs
more input. To define the goal with Codex first, start with `/plan`, then set
the refined goal with `/goal`.

If `/goal` doesn't appear in the slash command list, enable `features.goals`
in `config.toml`:

```toml
[features]
goals = true
```

You can also run `codex features enable goals` from the CLI or ask Codex to run it.

&lt;CodexScreenshot
  alt="Codex app goal progress controls above the composer"
  lightSrc="/images/codex/app/goal-dialog-light.webp"
  darkSrc="/images/codex/app/goal-dialog-dark.webp"
  class="mb-6"
/&gt;

When a goal is active, the app shows its progress above the composer. Use the
buttons in that progress row to pause or resume the goal, edit the goal text, or
clear the goal instead of typing another slash command. You can keep steering
Codex with follow-up messages while the goal runs.

For guidance on writing effective goals, see [Goal mode](/mirror/codex/prompting#goal-mode).

## Deep links

The Codex app registers the `codex://` URL scheme so links can open specific parts of the app directly. Encode query string values before adding them to a URL.

### Supported links

Use these canonical forms when you create links. The sections below list the full reference by link type.

| Deep link                                                                   | Opens                                                            |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `codex://threads/new`                                                       | A new local thread.                                              |
| `codex://new?&lt;query&gt;`                                                       | A new local thread with at least one new-thread query parameter. |
| `codex://threads/&lt;thread-id&gt;`                                               | A local thread. `&lt;thread-id&gt;` must be the thread's session UUID. |
| `codex://settings`                                                          | Settings.                                                        |
| `codex://settings/connections/&lt;connection-type&gt;`                            | Computer, device, or SSH connection settings.                    |
| `codex://settings/connections/ssh/add?name=&lt;ssh-config-host&gt;`               | Adds a host from your SSH config to Codex.                       |
| `codex://skills`                                                            | Skills.                                                          |
| `codex://automations`                                                       | Automations with the create flow open.                           |
| `codex://plugins/install/&lt;plugin-name&gt;?marketplace=&lt;marketplace-name&gt;`      | The install flow for a plugin from a known marketplace.          |
| `codex://plugins/&lt;plugin-id&gt;`                                               | A plugin detail page.                                            |
| `codex://plugins/&lt;plugin-name&gt;?marketplacePath=&lt;absolute-marketplace-path&gt;` | A local plugin detail page from a local marketplace.             |
| `codex://pets/install?name=&lt;pet-name&gt;&imageUrl=&lt;https-image-url&gt;`           | The pet install flow.                                            |

### Threads

Use these links when you need to open an existing local thread or start a new one.

| Deep link                     | Opens                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `codex://threads/&lt;thread-id&gt;` | A local thread. `&lt;thread-id&gt;` must be the thread's session UUID.                                               |
| `codex://threads/new`         | A new local thread.                                                                                            |
| `codex://threads/new?&lt;query&gt;` | A new local thread with optional query parameters.                                                             |
| `codex://new?&lt;query&gt;`         | A new local thread. Include at least one of `prompt`, `path`, or `originUrl`; otherwise the link does nothing. |

For `codex://threads/new` or `codex://new`, add any of these query parameters as needed; you can combine them in the same URL.

| Query parameter              | Required | What it does                                                                                                                                                    |
| ---------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prompt=&lt;text&gt;`              | No       | Sets the initial composer text.                                                                                                                                 |
| `path=&lt;absolute-path&gt;`       | No       | Opens the new thread in a local workspace. `path` must be an absolute path to a local directory. When valid, Codex uses that directory as the active workspace. |
| `originUrl=&lt;git-remote-url&gt;` | No       | Matches one of your current workspace roots by Git remote URL. If `path` is also present, Codex resolves `path` first.                                          |

Example: [Show me some fun stats about how I've been using Codex](codex://threads/new?prompt=Show%20me%20some%20fun%20stats%20about%20how%20I%27ve%20been%20using%20Codex)

### Settings

Use these links when you need to open Settings or a specific settings page.

| Deep link                                                     | Opens                                                                                        |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `codex://settings`                                            | Settings.                                                                                    |
| `codex://settings/browser-use`                                | Browser settings.                                                                            |
| `codex://settings/computer-use/google-chrome`                 | Google Chrome settings for computer use.                                                     |
| `codex://settings/connections`                                | Remote connections settings.                                                                 |
| `codex://settings/connections/computer`                       | Settings for controlling this Mac or PC from another device.                                 |
| `codex://settings/connections/devices`                        | Settings for controlling other devices.                                                      |
| `codex://settings/connections/ssh`                            | SSH connection settings.                                                                     |
| `codex://settings/connections/ssh/add?name=&lt;ssh-config-host&gt;` | Adds the named host alias as a Codex-managed connection, then opens SSH connection settings. |

The `name` value must match a host alias in `~/.ssh/config`. The link disables
automatic connection for the added host. If Codex can't find the named host, it
opens SSH connection settings and shows an error.

Unsupported `codex://settings/...` paths open the main Settings page.

### Skills

Use these links when you need to open Skills.

| Deep link        | Opens   |
| ---------------- | ------- |
| `codex://skills` | Skills. |

### Automations

Use these links when you need to open Automations.

| Deep link             | Opens                                  |
| --------------------- | -------------------------------------- |
| `codex://automations` | Automations with the create flow open. |

### Plugins

Plugin links use different forms depending on whether you are installing from a marketplace, opening a plugin, or working from a local `marketplace.json`. For plugin basics, see [Plugins](/mirror/codex/plugins). For local or repo marketplace setup, see [Build plugins](/mirror/codex/plugins/build#build-your-own-curated-plugin-list).

#### Plugin install

Use this form to open the install flow for a plugin from a marketplace that Codex already knows about.

| Deep link                                                              | Opens                                           |
| ---------------------------------------------------------------------- | ----------------------------------------------- |
| `codex://plugins/install/&lt;plugin-name&gt;?marketplace=&lt;marketplace-name&gt;` | The plugin detail or install flow for a plugin. |

| Query parameter                  | Required | What it does                                                                    |
| -------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `marketplace=&lt;marketplace-name&gt;` | Yes      | Identifies the marketplace. For an OpenAI-curated plugin, use `openai-curated`. |

The install link accepts only the `marketplace` query parameter. If Codex can't find the requested marketplace or plugin, it opens the Plugins page instead.

#### Plugin detail

| Deep link                     | Opens                 |
| ----------------------------- | --------------------- |
| `codex://plugins/&lt;plugin-id&gt;` | A plugin detail page. |

`&lt;plugin-id&gt;` must identify the plugin. For an OpenAI-curated plugin, use the form `&lt;plugin-name&gt;@openai-curated`.

Codex-generated plugin links can also include these query parameters. Omit both when you write a link manually.

| Query parameter    | Required | What it does                                                                                                                                    |
| ------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `hostId=&lt;host-id&gt;` | No       | Identifies the Codex host that owns the plugin context, such as `local` or one of your configured remote connections. Codex provides these IDs. |
| `source=manage`    | No       | Preserves the app's plugin-management entry point. It's not admin-only.                                                                         |

Example: [Open the OpenAI Developers plugin](codex://plugins/openai-developers@openai-curated)

#### Local plugin

For local or repo marketplace setup, see [Build plugins](/mirror/codex/plugins/build#build-your-own-curated-plugin-list).

| Deep link                                                                   | Opens                                                |
| --------------------------------------------------------------------------- | ---------------------------------------------------- |
| `codex://plugins/&lt;plugin-name&gt;?marketplacePath=&lt;absolute-marketplace-path&gt;` | A local plugin detail page from a local marketplace. |

| Query parameter                               | Required | What it does                                                                                               |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `marketplacePath=&lt;absolute-marketplace-path&gt;` | Yes      | Absolute path to the local `marketplace.json`, for example `/Users/alex/.agents/plugins/marketplace.json`. |
| `mode=share`                                  | No       | Opens the share flow for that local plugin.                                                                |

### Pets

Use these links to open the pet install flow when that feature is enabled.

| Deep link                                                         | Opens                 |
| ----------------------------------------------------------------- | --------------------- |
| `codex://pets/install?name=&lt;pet-name&gt;&imageUrl=&lt;https-image-url&gt;` | The pet install flow. |

| Query parameter              | Required | What it does                                      |
| ---------------------------- | -------- | ------------------------------------------------- |
| `name=&lt;pet-name&gt;`            | Yes      | Sets the pet name.                                |
| `imageUrl=&lt;https-image-url&gt;` | Yes      | Sets the pet image URL. `imageUrl` must be HTTPS. |
| `description=&lt;text&gt;`         | No       | Sets the optional pet description.                |

## See also

- [Features](/mirror/codex/app/features)
- [Settings](/mirror/codex/app/settings)

:::
:::

