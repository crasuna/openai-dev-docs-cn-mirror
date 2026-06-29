---
status: needs-review
sourceId: "8763b1eff142"
sourceChecksum: "8763b1eff14253bc5263c78286310d6f25f6850d7ab4b9f449dd10311492756f"
sourceUrl: "https://developers.openai.com/codex/app/commands"
translatedAt: "2026-06-27T11:05:57.267Z"
translator: codex-gpt-5.5-xhigh
---

# Codex app 命令

使用这些 commands 和 keyboard shortcuts 在 Codex app 中导航。

## Keyboard shortcuts

|             | Action             | macOS shortcut                                                                    |
| ----------- | ------------------ | --------------------------------------------------------------------------------- |
| **General** |                    |                                                                                   |
|             | Command menu       | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> 或 <kbd>Cmd</kbd> + <kbd>K</kbd> |
|             | Settings           | <kbd>Cmd</kbd> + <kbd>,</kbd>                                                     |
|             | Keyboard shortcuts | <kbd>Cmd</kbd> + <kbd>/</kbd>                                                     |
|             | Open folder        | <kbd>Cmd</kbd> + <kbd>O</kbd>                                                     |
|             | Navigate back      | <kbd>Cmd</kbd> + <kbd>[</kbd>                                                     |
|             | Navigate forward   | <kbd>Cmd</kbd> + <kbd>]</kbd>                                                     |
|             | Increase font size | <kbd>Cmd</kbd> + <kbd>+</kbd> 或 <kbd>Cmd</kbd> + <kbd>=</kbd>                    |
|             | Decrease font size | <kbd>Cmd</kbd> + <kbd>-</kbd> 或 <kbd>Cmd</kbd> + <kbd>\_</kbd>                   |
|             | Toggle sidebar     | <kbd>Cmd</kbd> + <kbd>B</kbd>                                                     |
|             | Toggle diff panel  | <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>B</kbd>                                 |
|             | Toggle terminal    | <kbd>Cmd</kbd> + <kbd>J</kbd>                                                     |
|             | Clear the terminal | <kbd>Ctrl</kbd> + <kbd>L</kbd>                                                    |
| **Thread**  |                    |                                                                                   |
|             | New thread         | <kbd>Cmd</kbd> + <kbd>N</kbd> 或 <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> |
|             | Search threads     | <kbd>Cmd</kbd> + <kbd>G</kbd>                                                     |
|             | Find in thread     | <kbd>Cmd</kbd> + <kbd>F</kbd>                                                     |
|             | Previous thread    | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>[</kbd>                                  |
|             | Next thread        | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>]</kbd>                                  |
|             | Dictation          | <kbd>Ctrl</kbd> + <kbd>M</kbd>                                                    |

要查找、自定义或重置 shortcuts，请打开 **Settings > Keyboard Shortcuts**。你可以按 command name 搜索，或将搜索字段切换到 keystroke mode，然后按下想要查找的 shortcut。

## 搜索 past threads 并在 thread 中查找

使用 thread search（<kbd>Cmd</kbd>/<kbd>Ctrl</kbd> + <kbd>G</kbd>）重新打开 past conversation。当你的 Codex desktop app 中提供 expanded matching 时，它还可以匹配 conversation content 和 Git branch names，因此你可以搜索 thread 中的一句话，或搜索 `fix/login-redirect` 这样的 branch。

打开 thread 后，使用 **Find in thread**（<kbd>Cmd</kbd> + <kbd>F</kbd>）在当前 conversation 中查找文本。它不会跨其他 threads 搜索。

## Slash commands

Slash commands 让你无需离开 thread composer 就能控制 Codex。可用 commands 会根据你的 environment 和 access 而变化。

### 使用 slash command

1. 在 thread composer 中输入 `/`。
2. 从列表中选择 command，或继续输入以筛选（例如 `/status`）。

你也可以在 thread composer 中输入 `$` 来显式调用 skills。参见 [Skills](https://developers.openai.com/codex/skills)。

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

<CodexScreenshot
  alt="composer 上方的 Codex app goal progress controls"
  lightSrc="/images/codex/app/goal-dialog-light.webp"
  darkSrc="/images/codex/app/goal-dialog-dark.webp"
  class="mb-6"
/>

当 goal 处于 active 状态时，app 会在 composer 上方显示进度。使用该 progress row 中的 buttons 暂停或恢复 goal、编辑 goal text，或清除 goal，而不是输入另一个 slash command。goal 运行时，你仍可以通过 follow-up messages 继续引导 Codex。

关于编写有效 goals 的指南，请参阅 [Goal mode](https://developers.openai.com/codex/prompting#goal-mode)。

## Deep links

Codex app 会注册 `codex://` URL scheme，因此 links 可以直接打开 app 的特定部分。向 URL 添加 query string values 前，请先进行 encode。

### 支持的 links

创建 links 时请使用这些 canonical forms。下面各 sections 按 link type 列出完整参考。

| Deep link                                                                   | Opens                                                            |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `codex://threads/new`                                                       | 新的 local thread。                                              |
| `codex://new?<query>`                                                       | 至少带有一个 new-thread query parameter 的新 local thread。 |
| `codex://threads/<thread-id>`                                               | 一个 local thread。`<thread-id>` 必须是该 thread 的 session UUID。 |
| `codex://settings`                                                          | Settings。                                                        |
| `codex://settings/connections/<connection-type>`                            | Computer、device 或 SSH connection settings。                    |
| `codex://settings/connections/ssh/add?name=<ssh-config-host>`               | 从你的 SSH config 向 Codex 添加 host。                       |
| `codex://skills`                                                            | Skills。                                                          |
| `codex://automations`                                                       | 打开 create flow 的 Automations。                           |
| `codex://plugins/install/<plugin-name>?marketplace=<marketplace-name>`      | 来自已知 marketplace 的 plugin install flow。          |
| `codex://plugins/<plugin-id>`                                               | Plugin detail page。                                            |
| `codex://plugins/<plugin-name>?marketplacePath=<absolute-marketplace-path>` | 来自 local marketplace 的 local plugin detail page。             |
| `codex://pets/install?name=<pet-name>&imageUrl=<https-image-url>`           | pet install flow。                                            |

### Threads

当你需要打开现有 local thread 或启动新 thread 时，请使用这些 links。

| Deep link                     | Opens                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `codex://threads/<thread-id>` | 一个 local thread。`<thread-id>` 必须是该 thread 的 session UUID。                                               |
| `codex://threads/new`         | 新的 local thread。                                                                                            |
| `codex://threads/new?<query>` | 带 optional query parameters 的新 local thread。                                                             |
| `codex://new?<query>`         | 新的 local thread。至少包含 `prompt`、`path` 或 `originUrl` 之一；否则 link 不会执行任何操作。 |

对于 `codex://threads/new` 或 `codex://new`，可根据需要添加以下 query parameters；你可以在同一 URL 中组合它们。

| Query parameter              | Required | What it does                                                                                                                                                    |
| ---------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prompt=<text>`              | No       | 设置初始 composer text。                                                                                                                                 |
| `path=<absolute-path>`       | No       | 在 local workspace 中打开新 thread。`path` 必须是 local directory 的 absolute path。有效时，Codex 会将该目录用作 active workspace。 |
| `originUrl=<git-remote-url>` | No       | 通过 Git remote URL 匹配你当前 workspace roots 之一。如果同时存在 `path`，Codex 会先解析 `path`。                                          |

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
| `codex://settings/connections/ssh/add?name=<ssh-config-host>` | 将命名 host alias 添加为 Codex-managed connection，然后打开 SSH connection settings。 |

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

Plugin links 根据你是从 marketplace 安装、打开 plugin，还是使用 local `marketplace.json` 而有不同形式。Plugin 基础知识见 [Plugins](https://developers.openai.com/codex/plugins)。local 或 repo marketplace 设置见 [Build plugins](https://developers.openai.com/codex/plugins/build#build-your-own-curated-plugin-list)。

#### Plugin install

使用此形式打开 Codex 已知 marketplace 中某个 plugin 的 install flow。

| Deep link                                                              | Opens                                           |
| ---------------------------------------------------------------------- | ----------------------------------------------- |
| `codex://plugins/install/<plugin-name>?marketplace=<marketplace-name>` | plugin detail 或 install flow。 |

| Query parameter                  | Required | What it does                                                                    |
| -------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `marketplace=<marketplace-name>` | Yes      | 标识 marketplace。对于 OpenAI-curated plugin，请使用 `openai-curated`。 |

install link 只接受 `marketplace` query parameter。如果 Codex 找不到请求的 marketplace 或 plugin，它会改为打开 Plugins page。

#### Plugin detail

| Deep link                     | Opens                 |
| ----------------------------- | --------------------- |
| `codex://plugins/<plugin-id>` | Plugin detail page。 |

`<plugin-id>` 必须标识该 plugin。对于 OpenAI-curated plugin，请使用 `<plugin-name>@openai-curated` 形式。

Codex-generated plugin links 还可以包含这些 query parameters。手动编写 link 时请省略两者。

| Query parameter    | Required | What it does                                                                                                                                    |
| ------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `hostId=<host-id>` | No       | 标识拥有 plugin context 的 Codex host，例如 `local` 或你配置的 remote connections 之一。Codex 会提供这些 IDs。 |
| `source=manage`    | No       | 保留 app 的 plugin-management entry point。它不是 admin-only。                                                                         |

示例：[打开 OpenAI Developers plugin](codex://plugins/openai-developers@openai-curated)

#### Local plugin

local 或 repo marketplace 设置见 [Build plugins](https://developers.openai.com/codex/plugins/build#build-your-own-curated-plugin-list)。

| Deep link                                                                   | Opens                                                |
| --------------------------------------------------------------------------- | ---------------------------------------------------- |
| `codex://plugins/<plugin-name>?marketplacePath=<absolute-marketplace-path>` | 来自 local marketplace 的 local plugin detail page。 |

| Query parameter                               | Required | What it does                                                                                               |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `marketplacePath=<absolute-marketplace-path>` | Yes      | 指向 local `marketplace.json` 的 absolute path，例如 `/Users/alex/.agents/plugins/marketplace.json`。 |
| `mode=share`                                  | No       | 打开该 local plugin 的 share flow。                                                                |

### Pets

当该功能启用时，使用这些 links 打开 pet install flow。

| Deep link                                                         | Opens                 |
| ----------------------------------------------------------------- | --------------------- |
| `codex://pets/install?name=<pet-name>&imageUrl=<https-image-url>` | pet install flow。 |

| Query parameter              | Required | What it does                                      |
| ---------------------------- | -------- | ------------------------------------------------- |
| `name=<pet-name>`            | Yes      | 设置 pet name。                                |
| `imageUrl=<https-image-url>` | Yes      | 设置 pet image URL。`imageUrl` 必须是 HTTPS。 |
| `description=<text>`         | No       | 设置可选的 pet description。                |

## 另见

- [Features](https://developers.openai.com/codex/app/features)
- [Settings](https://developers.openai.com/codex/app/settings)
