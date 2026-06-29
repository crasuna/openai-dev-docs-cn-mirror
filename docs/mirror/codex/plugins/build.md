---
title: "构建 plugins"
description: "Create, test, and distribute plugins for Codex"
outline: deep
---

# 构建 plugins

**文档集**：Codex\
**分组**：插件\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/plugins/build](https://developers.openai.com/codex/plugins/build)
- Markdown 来源：[https://developers.openai.com/codex/plugins/build.md](https://developers.openai.com/codex/plugins/build.md)
- 抓取时间：2026-06-27T05:55:04.556Z
- Checksum：`4ee6b01fbb21c65367ea8e9a14c76030c71748f77fd65535bdcbb973f6eb5684`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
本页面面向 plugin authors。如果你想在 Codex 中浏览、安装和使用 plugins，请参阅 [Plugins](/mirror/codex/plugins)。如果你仍在迭代一个 repo 或一个个人工作流，请从 local skill 开始。当你希望跨团队共享该工作流、打包 app integrations 或 MCP config、封装 lifecycle hooks，或发布稳定 package 时，再构建 plugin。

## 使用 `@plugin-creator` 创建 plugin

最快的设置方式是使用内置的 `@plugin-creator` skill。

&lt;CodexScreenshot
  alt="plugin-creator skill in Codex"
  lightSrc="/images/codex/plugins/plugin-creator.png"
  darkSrc="/images/codex/plugins/plugin-creator-dark.png"
/&gt;

它会搭建必需的 `.codex-plugin/plugin.json` manifest，也可以生成用于测试的 local marketplace entry。如果你已经有 plugin folder，仍然可以使用 `@plugin-creator` 将其接入 local marketplace。

&lt;CodexScreenshot
  alt="how to invoke the plugin-creator skill"
  lightSrc="/images/codex/plugins/plugin-creator-invoke.png"
  darkSrc="/images/codex/plugins/plugin-creator-invoke-dark.png"
/&gt;

### 构建你自己的 curated plugin list

Marketplace 是 plugins 的 JSON catalog。`@plugin-creator` 可以为单个 plugin 生成一个 marketplace，而你可以继续向同一个 marketplace 添加 entries，为 repo、team 或 personal workflow 构建自己的 curated list。

在 Codex 中，每个 marketplace 都会在 plugin directory 中作为可选择的 source 出现。将 `$REPO_ROOT/.agents/plugins/marketplace.json` 用于 repo-scoped list，或将 `~/.agents/plugins/marketplace.json` 用于 personal list。在 `plugins[]` 下为每个 plugin 添加一个 entry，让每个 `source.path` 指向 plugin folder，路径相对于 marketplace root 并以 `./` 开头，同时将 `interface.displayName` 设置为你希望 Codex 在 marketplace picker 中显示的标签。然后重启 Codex。之后，打开 plugin directory，选择你的 marketplace，浏览或安装该 curated list 中的 plugins。

你不需要为每个 plugin 创建单独的 marketplace。一个 marketplace 可以在测试时只暴露单个 plugin，然后随着你添加更多 plugins，增长为更大的 curated catalog。

&lt;CodexScreenshot
  alt="custom local marketplace in the plugin directory"
  lightSrc="/images/codex/plugins/codex-local-plugin-light.png"
  darkSrc="/images/codex/plugins/codex-local-plugin.png"
/&gt;

### 从 CLI 添加 marketplace

当你希望 Codex 为你安装并跟踪 marketplace source，而不是手动编辑 `config.toml` 时，请使用 `codex plugin marketplace add`。

```bash
codex plugin marketplace add owner/repo
codex plugin marketplace add owner/repo --ref main
codex plugin marketplace add https://github.com/example/plugins.git --sparse .agents/plugins
codex plugin marketplace add ./local-marketplace-root
```

Marketplace sources 可以是 GitHub shorthand（`owner/repo` 或 `owner/repo@ref`）、HTTP 或 HTTPS Git URLs、SSH Git URLs，或 local marketplace root directories。使用 `--ref` 固定 Git ref，并重复 `--sparse PATH` 为 Git-backed marketplace repos 使用 sparse checkout。`--sparse` 仅对 Git marketplace sources 有效。

要检查、刷新或移除已配置 marketplaces：

```bash
codex plugin marketplace list
codex plugin marketplace upgrade
codex plugin marketplace upgrade marketplace-name
codex plugin marketplace remove marketplace-name
```

`codex plugin marketplace list` 会打印 Codex 正在考虑的每个 marketplace 及其解析出的 root path，包括 local default marketplaces 和 configured marketplace snapshots。

### 手动创建 plugin

从打包一个 skill 的最小 plugin 开始。

1. 创建带有 `.codex-plugin/plugin.json` manifest 的 plugin folder。

```bash
mkdir -p my-first-plugin/.codex-plugin
```

`my-first-plugin/.codex-plugin/plugin.json`

```json
{
  "name": "my-first-plugin",
  "version": "1.0.0",
  "description": "Reusable greeting workflow",
  "skills": "./skills/"
}
```

使用稳定的 kebab-case plugin `name`。Codex 会将其用作 plugin identifier 和 component namespace。

2. 在 `skills/&lt;skill-name&gt;/SKILL.md` 下添加 skill。

```bash
mkdir -p my-first-plugin/skills/hello
```

`my-first-plugin/skills/hello/SKILL.md`

```md
---
name: hello
description: Greet the user with a friendly message.
---

Greet the user warmly and ask how you can help.
```

3. 将 plugin 添加到 marketplace。使用 `@plugin-creator` 生成一个，或按照[构建你自己的 curated plugin list](/mirror/codex/plugins/build#build-your-own-curated-plugin-list) 将 plugin 手动接入 Codex。

从这里开始，你可以根据需要添加 MCP config、app integrations 或 marketplace metadata。

### 手动安装 local plugin

根据应由谁访问该 plugin 或 curated list，使用 repo marketplace 或 personal marketplace。

&lt;Tabs
  id="codex-plugins-local-install"
  param="install-scope"
  defaultTab="workspace"
  tabs={[
    {
      id: "workspace",
      label: "Repo",
    },
    {
      id: "global",
      label: "Personal",
    },
  ]}
&gt;

    在 `$REPO_ROOT/.agents/plugins/marketplace.json` 添加 marketplace file，并将 plugins 存储在 `$REPO_ROOT/plugins/` 下。

    **Repo marketplace 示例**

    Step 1: 将 plugin folder 复制到 `$REPO_ROOT/plugins/my-plugin`。

```bash
mkdir -p ./plugins
cp -R /absolute/path/to/my-plugin ./plugins/my-plugin
```

    Step 2: 添加或更新 `$REPO_ROOT/.agents/plugins/marketplace.json`，使 `source.path` 指向该 plugin directory，路径以 `./` 开头并相对于 marketplace root：

```json
{
  "name": "local-repo",
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "local",
        "path": "./plugins/my-plugin"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

    Step 3: 重启 Codex 并验证 plugin 出现。




    在 `~/.agents/plugins/marketplace.json` 添加 marketplace file，并将 plugins 存储在 `~/.codex/plugins/` 下。

    **Personal marketplace 示例**

    Step 1: 将 plugin folder 复制到 `~/.codex/plugins/my-plugin`。

```bash
mkdir -p ~/.codex/plugins
cp -R /absolute/path/to/my-plugin ~/.codex/plugins/my-plugin
```

    Step 2: 添加或更新 `~/.agents/plugins/marketplace.json`，使 plugin entry 的 `source.path` 指向该目录。

    Step 3: 重启 Codex 并验证 plugin 出现。




Marketplace file 指向 plugin location，因此这些目录只是示例，而不是固定要求。Codex 会相对于 marketplace root 解析 `source.path`，而不是相对于 `.agents/plugins/` folder。请参阅 [Marketplace metadata](/mirror/codex/plugins/build#marketplace-metadata) 了解文件格式。

更改 plugin 后，请更新 marketplace entry 指向的 plugin directory，并重启 Codex，以便 local install 获取新文件。

### 与你的 workspace 共享 local plugin

创建 plugin 并将其添加到 Codex 后，可以从 Codex app 与 ChatGPT workspace 的其他成员共享它。

1. 在 Codex app 中打开 **Plugins**。
2. 前往 **Created by you** 并打开 plugin details page。
3. 选择 **Share**。
4. 添加 workspace members 或 workspace groups，或复制 share link。
5. 选择谁有访问权限，然后发送 invitation 或 link。

你分享的对象可以在 plugin directory 的 **Shared with you** 下找到该 plugin。将 local plugin 与你的 workspace 共享不会把它发布到 public Plugin Directory。Shared plugins 会保留在你的 workspace 和 organization boundary 内；未登录该 workspace 的账号无法访问它们。当某个 team 或 role 应共享相同 plugin access 时，请使用 groups。当你想要 repo 或 CLI distribution 时，请使用 marketplace；当你希望指定 teammates 从 Codex app 安装 plugin 时，请使用 workspace sharing。

Workspace admins 可以通过向 `requirements.toml` 添加 `features.plugin_sharing = false`，从 cloud-managed requirements 中禁用 plugin sharing：

```toml
features.plugin_sharing = false
```

### Marketplace metadata

如果你维护 repo marketplace，请在 `$REPO_ROOT/.agents/plugins/marketplace.json` 中定义它。对于 personal marketplace，请使用 `~/.agents/plugins/marketplace.json`。Marketplace file 控制 Codex-facing catalogs 中的 plugin ordering 和 install policies。它可以在测试时代表一个 plugin，也可以代表你希望 Codex 在同一个 marketplace name 下展示的一组 curated plugins。在将 plugin 添加到 marketplace 之前，请确保它的 `version`、publisher metadata 和 install-surface copy 已准备好给其他开发者查看。

```json
{
  "name": "local-example-plugins",
  "interface": {
    "displayName": "Local Example Plugins"
  },
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "local",
        "path": "./plugins/my-plugin"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    },
    {
      "name": "research-helper",
      "source": {
        "source": "local",
        "path": "./plugins/research-helper"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

- 使用顶层 `name` 标识 marketplace。
- 使用 `interface.displayName` 作为 Codex 中显示的 marketplace 标题。
- 在 `plugins` 下为每个 plugin 添加一个对象，构建 Codex 会在该 marketplace 标题下展示的 curated list。
- 将每个 plugin entry 的 `source.path` 指向你希望 Codex 加载的 plugin directory。对于 repo installs，它通常位于 `./plugins/` 下。对于 personal installs，常见模式是 `./.codex/plugins/&lt;plugin-name&gt;`。
- 保持 `source.path` 相对于 marketplace root，以 `./` 开头，并留在该 root 内。
- 对于 local entries，`source` 也可以是普通字符串路径，例如 `"./plugins/my-plugin"`。
- 始终在每个 plugin entry 上包含 `policy.installation`、`policy.authentication` 和 `category`。
- 使用 `AVAILABLE`、`INSTALLED_BY_DEFAULT` 或 `NOT_AVAILABLE` 等 `policy.installation` 值。
- 使用 `policy.authentication` 决定 auth 是在安装时发生，还是在首次使用时发生。

Marketplace 控制 Codex 从哪里加载 plugin。如果你的 plugin 位于这些示例目录之外，local `source.path` 也可以指向其他位置。Marketplace file 可以位于你开发 plugin 的 repo，也可以位于单独的 marketplace repo，并且一个 marketplace file 可以指向一个或多个 plugins。

Marketplace entries 也可以指向 Git-backed plugin sources。当 plugin 位于 repository root 时使用 `"source": "url"`；当 plugin 位于 subdirectory 时使用 `"source": "git-subdir"`：

```json
{
  "name": "remote-helper",
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/example/codex-plugins.git",
    "path": "./plugins/remote-helper",
    "ref": "main"
  },
  "policy": {
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL"
  },
  "category": "Productivity"
}
```

Git-backed entries 可以使用 `ref` 或 `sha` selectors。如果 Codex 无法解析 marketplace entry 的 source，它会跳过该 plugin entry，而不是让整个 marketplace 失败。

### Codex 如何使用 marketplaces

Plugin marketplace 是 Codex 可以读取和安装的 plugins 的 JSON catalog。

Codex 可以从以下位置读取 marketplace files：

- 支撑官方 Plugin Directory 的 curated marketplace
- 位于 `$REPO_ROOT/.agents/plugins/marketplace.json` 的 repo marketplace
- 位于 `$REPO_ROOT/.claude-plugin/marketplace.json` 的 legacy-compatible marketplace
- 位于 `~/.agents/plugins/marketplace.json` 的 personal marketplace

你可以安装通过 marketplace 暴露的任何 plugin。Codex 会将 plugins 安装到 `~/.codex/plugins/cache/$MARKETPLACE_NAME/$PLUGIN_NAME/$VERSION/`。对于 local plugins，`$VERSION` 是 `local`，Codex 会从该 cache path 加载已安装副本，而不是直接从 marketplace entry 加载。

你可以单独启用或禁用每个 plugin。Codex 会把每个 plugin 的开启或关闭状态存储在 `~/.codex/config.toml` 中。

## 打包和分发 plugins

### Plugin 结构

每个 plugin 都有一个位于 `.codex-plugin/plugin.json` 的 manifest。它还可以包含 `skills/` directory、用于 lifecycle hooks 的 `hooks/` directory、指向一个或多个 apps 或 connectors 的 `.app.json` 文件、配置 MCP servers 的 `.mcp.json` 文件，以及用于在支持的 surfaces 上展示 plugin 的 assets。

&lt;FileTree
  class="mt-4"
  tree={[
    {
      name: "my-plugin/",
      open: true,
      children: [
        {
          name: ".codex-plugin/",
          open: true,
          children: [
            {
              name: "plugin.json",
              comment: "Required: plugin manifest",
            },
          ],
        },
        {
          name: "skills/",
          open: true,
          children: [
            {
              name: "my-skill/",
              open: true,
              children: [
                {
                  name: "SKILL.md",
                  comment: "Optional: skill instructions",
                },
              ],
            },
          ],
        },
        {
          name: "hooks/",
          open: true,
          children: [
            {
              name: "hooks.json",
              comment: "Optional: lifecycle hooks",
            },
          ],
        },
        {
          name: ".app.json",
          comment: "Optional: app or connector mappings",
        },
        {
          name: ".mcp.json",
          comment: "Optional: MCP server configuration",
        },
        {
          name: "assets/",
          comment: "Optional: icons, logos, screenshots",
        },
      ],
    },
  ]}
/&gt;

`.codex-plugin/` 中只应放 `plugin.json`。请将 `skills/`、`hooks/`、`assets/`、`.mcp.json` 和 `.app.json` 保持在 plugin root。

Published plugins 通常使用比 quick-start scaffolds 中最小示例更丰富的 manifest。Manifest 有三个作用：

- 标识 plugin。
- 指向 bundled components，例如 skills、apps、MCP servers 或 hooks。
- 提供 install-surface metadata，例如 descriptions、icons 和 legal links。

下面是一个完整 manifest 示例：

```json
{
  "name": "my-plugin",
  "version": "0.1.0",
  "description": "Bundle reusable skills and app integrations.",
  "author": {
    "name": "Your team",
    "email": "team@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://example.com/plugins/my-plugin",
  "repository": "https://github.com/example/my-plugin",
  "license": "MIT",
  "keywords": ["research", "crm"],
  "skills": "./skills/",
  "mcpServers": "./.mcp.json",
  "apps": "./.app.json",
  "hooks": "./hooks/hooks.json",
  "interface": {
    "displayName": "My Plugin",
    "shortDescription": "Reusable skills and apps",
    "longDescription": "Distribute skills and app integrations together.",
    "developerName": "Your team",
    "category": "Productivity",
    "capabilities": ["Read", "Write"],
    "websiteURL": "https://example.com",
    "privacyPolicyURL": "https://example.com/privacy",
    "termsOfServiceURL": "https://example.com/terms",
    "defaultPrompt": [
      "Use My Plugin to summarize new CRM notes.",
      "Use My Plugin to triage new customer follow-ups."
    ],
    "brandColor": "#10A37F",
    "composerIcon": "./assets/icon.png",
    "logo": "./assets/logo.png",
    "screenshots": ["./assets/screenshot-1.png"]
  }
}
```

`.codex-plugin/plugin.json` 是必需 entry point。其他 manifest fields 是可选的，但 published plugins 通常会使用它们。

### Manifest 字段

使用 top-level fields 定义 package metadata，并指向 bundled components：

- `name`、`version` 和 `description` 标识 plugin。
- `author`、`homepage`、`repository`、`license` 和 `keywords` 提供 publisher 和 discovery metadata。
- `skills`、`mcpServers`、`apps` 和 `hooks` 指向相对于 plugin root 的 bundled components。
- `interface` 控制 install surfaces 如何呈现 plugin。

使用 `interface` object 配置 install-surface metadata：

- `displayName`、`shortDescription` 和 `longDescription` 控制标题和 descriptive copy。
- `developerName`、`category` 和 `capabilities` 添加 publisher 和 capability metadata。
- `websiteURL`、`privacyPolicyURL` 和 `termsOfServiceURL` 提供 external links。
- `defaultPrompt`、`brandColor`、`composerIcon`、`logo` 和 `screenshots` 控制 starter prompts 和 visual presentation。

### 路径规则

- 保持 manifest paths 相对于 plugin root，并以 `./` 开头。
- 尽可能将 `composerIcon`、`logo` 和 `screenshots` 等 visual assets 存储在 `./assets/` 下。
- 对 bundled skill folders 使用 `skills`，对 `.app.json` 使用 `apps`，对 `.mcp.json` 使用 `mcpServers`，对 lifecycle hooks 使用 `hooks`。
- Enabled plugins 可以在 skills、MCP servers 和 apps 之外包含 lifecycle hooks。
- 如果你的 plugin 将 hooks 存储在 `./hooks/hooks.json`，则不需要在 `.codex-plugin/plugin.json` 中添加 `hooks` entry；Codex 会自动检查该默认文件。

### Bundled MCP servers 和 lifecycle hooks

`mcpServers` 可以指向一个 `.mcp.json` 文件，该文件包含 direct server map 或 wrapped `mcp_servers` object。

Direct server map：

```json
{
  "docs": {
    "command": "docs-mcp",
    "args": ["--stdio"]
  }
}
```

Wrapped server map：

```json
{
  "mcp_servers": {
    "docs": {
      "command": "docs-mcp",
      "args": ["--stdio"]
    }
  }
}
```

安装后，用户可以从 Codex config 启用或禁用 bundled MCP server，并调整 tool approval policy，而无需编辑 plugin。使用 `plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;` 配置 plugin-scoped MCP server policy：

```toml
[plugins."my-plugin".mcp_servers.docs]
enabled = true
default_tools_approval_mode = "prompt"
enabled_tools = ["search"]

[plugins."my-plugin".mcp_servers.docs.tools.search]
approval_mode = "approve"
```

当你的 plugin 启用时，Codex 可以将你的 plugin 中的 lifecycle hooks 与 user、project 和 managed hooks 一起加载。

安装或启用 plugin 不会自动信任它的 hooks。Plugin-bundled hooks 是 non-managed hooks，因此 Codex 会跳过它们，直到用户审查并信任当前 hook definition。

默认 plugin hook file 是 `hooks/hooks.json`：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${PLUGIN_ROOT}/hooks/session_start.py",
            "statusMessage": "Loading plugin context"
          }
        ]
      }
    ]
  }
}
```

如果你在 `.codex-plugin/plugin.json` 中定义 `hooks`，Codex 会使用该 manifest entry，而不是默认的 `hooks/hooks.json`。Manifest field 可以是单个 path、paths array、inline hooks object，或 inline hooks objects array。

```json
{
  "name": "repo-policy",
  "hooks": ["./hooks/session.json", "./hooks/tools.json"]
}
```

Hook paths 遵循与 `skills`、`apps` 和 `mcpServers` 相同的 manifest path rules：以 `./` 开头、相对于 plugin root 解析，并留在 plugin root 内。

Plugin hook commands 会接收 Codex-specific environment variables `PLUGIN_ROOT` 和 `PLUGIN_DATA`。`PLUGIN_ROOT` 指向已安装的 plugin root，`PLUGIN_DATA` 指向 plugin 的 writable data directory。为兼容现有 plugin hooks，Codex 也会设置 `CLAUDE_PLUGIN_ROOT` 和 `CLAUDE_PLUGIN_DATA`。

Plugin hooks 使用与 regular hooks 相同的 event schema。请参阅 [Hooks](/mirror/codex/hooks)，了解 supported events、inputs、outputs、trust review 和 current limitations。

### 发布官方 public plugins

向官方 Plugin Directory 添加 plugins 的功能即将推出。

Self-serve plugin publishing 和 management 即将推出。

:::

## English source

::: details 展开英文原文
::: v-pre
This page is for plugin authors. If you want to browse, install, and use
plugins in Codex, see [Plugins](/mirror/codex/plugins). If you are still iterating on
one repo or one personal workflow, start with a local skill. Build a plugin
when you want to share that workflow across teams, bundle app integrations or
MCP config, package lifecycle hooks, or publish a stable package.

## Create a plugin with `@plugin-creator`

For the fastest setup, use the built-in `@plugin-creator` skill.

&lt;CodexScreenshot
  alt="plugin-creator skill in Codex"
  lightSrc="/images/codex/plugins/plugin-creator.png"
  darkSrc="/images/codex/plugins/plugin-creator-dark.png"
/&gt;

It scaffolds the required `.codex-plugin/plugin.json` manifest and can also
generate a local marketplace entry for testing. If you already have a plugin
folder, you can still use `@plugin-creator` to wire it into a local
marketplace.

&lt;CodexScreenshot
  alt="how to invoke the plugin-creator skill"
  lightSrc="/images/codex/plugins/plugin-creator-invoke.png"
  darkSrc="/images/codex/plugins/plugin-creator-invoke-dark.png"
/&gt;

### Build your own curated plugin list

A marketplace is a JSON catalog of plugins. `@plugin-creator` can generate one
for a single plugin, and you can keep adding entries to that same marketplace
to build your own curated list for a repo, team, or personal workflow.

In Codex, each marketplace appears as a selectable source in the plugin
directory. Use `$REPO_ROOT/.agents/plugins/marketplace.json` for a repo-scoped
list or `~/.agents/plugins/marketplace.json` for a personal list. Add one
entry per plugin under `plugins[]`, point each `source.path` at the plugin
folder with a `./`-prefixed path relative to the marketplace root, and set
`interface.displayName` to the label you want Codex to show in the marketplace
picker. Then restart Codex. After that, open the plugin directory, choose your
marketplace, and browse or install the plugins in that curated list.

You don't need a separate marketplace per plugin. One marketplace can expose a
single plugin while you are testing, then grow into a larger curated catalog as
you add more plugins.

&lt;CodexScreenshot
  alt="custom local marketplace in the plugin directory"
  lightSrc="/images/codex/plugins/codex-local-plugin-light.png"
  darkSrc="/images/codex/plugins/codex-local-plugin.png"
/&gt;

### Add a marketplace from the CLI

Use `codex plugin marketplace add` when you want Codex to install and track a
marketplace source for you instead of editing `config.toml` by hand.

```bash
codex plugin marketplace add owner/repo
codex plugin marketplace add owner/repo --ref main
codex plugin marketplace add https://github.com/example/plugins.git --sparse .agents/plugins
codex plugin marketplace add ./local-marketplace-root
```

Marketplace sources can be GitHub shorthand (`owner/repo` or
`owner/repo@ref`), HTTP or HTTPS Git URLs, SSH Git URLs, or local marketplace root
directories. Use `--ref` to pin a Git ref, and repeat `--sparse PATH` to use a
sparse checkout for Git-backed marketplace repos. `--sparse` is valid only for
Git marketplace sources.

To inspect, refresh, or remove configured marketplaces:

```bash
codex plugin marketplace list
codex plugin marketplace upgrade
codex plugin marketplace upgrade marketplace-name
codex plugin marketplace remove marketplace-name
```

`codex plugin marketplace list` prints each marketplace Codex is considering
and the root path it resolves from, including local default marketplaces and
configured marketplace snapshots.

### Create a plugin manually

Start with a minimal plugin that packages one skill.

1. Create a plugin folder with a manifest at `.codex-plugin/plugin.json`.

```bash
mkdir -p my-first-plugin/.codex-plugin
```

`my-first-plugin/.codex-plugin/plugin.json`

```json
{
  "name": "my-first-plugin",
  "version": "1.0.0",
  "description": "Reusable greeting workflow",
  "skills": "./skills/"
}
```

Use a stable plugin `name` in kebab-case. Codex uses it as the plugin
identifier and component namespace.

2. Add a skill under `skills/&lt;skill-name&gt;/SKILL.md`.

```bash
mkdir -p my-first-plugin/skills/hello
```

`my-first-plugin/skills/hello/SKILL.md`

```md
---
name: hello
description: Greet the user with a friendly message.
---

Greet the user warmly and ask how you can help.
```

3. Add the plugin to a marketplace. Use `@plugin-creator` to generate one, or
   follow [Build your own curated plugin list](/mirror/codex/plugins/build#build-your-own-curated-plugin-list)
   to wire the plugin into Codex manually.

From there, you can add MCP config, app integrations, or marketplace metadata
as needed.

### Install a local plugin manually

Use a repo marketplace or a personal marketplace, depending on who should be
able to access the plugin or curated list.

&lt;Tabs
  id="codex-plugins-local-install"
  param="install-scope"
  defaultTab="workspace"
  tabs={[
    {
      id: "workspace",
      label: "Repo",
    },
    {
      id: "global",
      label: "Personal",
    },
  ]}
&gt;

    Add a marketplace file at `$REPO_ROOT/.agents/plugins/marketplace.json`
    and store your plugins under `$REPO_ROOT/plugins/`.

    **Repo marketplace example**

    Step 1: Copy the plugin folder into `$REPO_ROOT/plugins/my-plugin`.

```bash
mkdir -p ./plugins
cp -R /absolute/path/to/my-plugin ./plugins/my-plugin
```

    Step 2: Add or update `$REPO_ROOT/.agents/plugins/marketplace.json` so
    that `source.path` points to that plugin directory with a `./`-prefixed
    relative path:

```json
{
  "name": "local-repo",
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "local",
        "path": "./plugins/my-plugin"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

    Step 3: Restart Codex and verify that the plugin appears.




    Add a marketplace file at `~/.agents/plugins/marketplace.json` and store
    your plugins under `~/.codex/plugins/`.

    **Personal marketplace example**

    Step 1: Copy the plugin folder into `~/.codex/plugins/my-plugin`.

```bash
mkdir -p ~/.codex/plugins
cp -R /absolute/path/to/my-plugin ~/.codex/plugins/my-plugin
```

    Step 2: Add or update `~/.agents/plugins/marketplace.json` so that the
    plugin entry's `source.path` points to that directory.

    Step 3: Restart Codex and verify that the plugin appears.




The marketplace file points to the plugin location, so those directories are
examples rather than fixed requirements. Codex resolves `source.path` relative
to the marketplace root, not relative to the `.agents/plugins/` folder. See
[Marketplace metadata](/mirror/codex/plugins/build#marketplace-metadata) for the file format.

After you change the plugin, update the plugin directory that your marketplace
entry points to and restart Codex so the local install picks up the new files.

### Share a local plugin with your workspace

After you create a plugin and add it to Codex, you can share it with other
members of your ChatGPT workspace from the Codex app.

1. Open **Plugins** in the Codex app.
2. Go to **Created by you** and open the plugin details page.
3. Select **Share**.
4. Add workspace members or workspace groups, or copy a share link.
5. Choose who has access, then send the invitation or link.

People you share with can find the plugin under **Shared with you** in the
plugin directory. Sharing a local plugin with your workspace doesn't publish
it to the public Plugin Directory. Shared plugins stay within your workspace
and organization boundary; accounts that aren't signed in to that workspace
can't access them. Use groups when a team or role should share the same plugin
access. Use a marketplace when you want repo or CLI distribution, and use
workspace sharing when you want selected teammates to install a plugin from the
Codex app.

Workspace admins can disable plugin sharing from cloud-managed requirements by
adding `features.plugin_sharing = false` to `requirements.toml`:

```toml
features.plugin_sharing = false
```

### Marketplace metadata

If you maintain a repo marketplace, define it in
`$REPO_ROOT/.agents/plugins/marketplace.json`. For a personal marketplace, use
`~/.agents/plugins/marketplace.json`. A marketplace file controls plugin
ordering and install policies in Codex-facing catalogs. It can represent one
plugin while you are testing or a curated list of plugins that you want Codex
to show together under one marketplace name. Before you add a plugin to a
marketplace, make sure its `version`, publisher metadata, and install-surface
copy are ready for other developers to see.

```json
{
  "name": "local-example-plugins",
  "interface": {
    "displayName": "Local Example Plugins"
  },
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "local",
        "path": "./plugins/my-plugin"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    },
    {
      "name": "research-helper",
      "source": {
        "source": "local",
        "path": "./plugins/research-helper"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

- Use top-level `name` to identify the marketplace.
- Use `interface.displayName` for the marketplace title shown in Codex.
- Add one object per plugin under `plugins` to build a curated list that Codex
  shows under that marketplace title.
- Point each plugin entry's `source.path` at the plugin directory you want
  Codex to load. For repo installs, that often lives under `./plugins/`. For
  personal installs, a common pattern is `./.codex/plugins/&lt;plugin-name&gt;`.
- Keep `source.path` relative to the marketplace root, start it with `./`, and
  keep it inside that root.
- For local entries, `source` can also be a plain string path such as
  `"./plugins/my-plugin"`.
- Always include `policy.installation`, `policy.authentication`, and
  `category` on each plugin entry.
- Use `policy.installation` values such as `AVAILABLE`,
  `INSTALLED_BY_DEFAULT`, or `NOT_AVAILABLE`.
- Use `policy.authentication` to decide whether auth happens on install or
  first use.

The marketplace controls where Codex loads the plugin from. A local
`source.path` can point somewhere else if your plugin lives outside those
example directories. A marketplace file can live in the repo where you are
developing the plugin or in a separate marketplace repo, and one marketplace
file can point to one plugin or many.

Marketplace entries can also point at Git-backed plugin sources. Use
`"source": "url"` when the plugin lives at the repository root, or
`"source": "git-subdir"` when the plugin lives in a subdirectory:

```json
{
  "name": "remote-helper",
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/example/codex-plugins.git",
    "path": "./plugins/remote-helper",
    "ref": "main"
  },
  "policy": {
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL"
  },
  "category": "Productivity"
}
```

Git-backed entries may use `ref` or `sha` selectors. If Codex can't resolve a
marketplace entry's source, it skips that plugin entry instead of failing the
whole marketplace.

### How Codex uses marketplaces

A plugin marketplace is a JSON catalog of plugins that Codex can read and
install.

Codex can read marketplace files from:

- the curated marketplace that powers the official Plugin Directory
- a repo marketplace at `$REPO_ROOT/.agents/plugins/marketplace.json`
- a legacy-compatible marketplace at `$REPO_ROOT/.claude-plugin/marketplace.json`
- a personal marketplace at `~/.agents/plugins/marketplace.json`

You can install any plugin exposed through a marketplace. Codex installs
plugins into
`~/.codex/plugins/cache/$MARKETPLACE_NAME/$PLUGIN_NAME/$VERSION/`. For local
plugins, `$VERSION` is `local`, and Codex loads the installed copy from that
cache path rather than directly from the marketplace entry.

You can enable or disable each plugin individually. Codex stores each plugin's
on or off state in `~/.codex/config.toml`.

## Package and distribute plugins

### Plugin structure

Every plugin has a manifest at `.codex-plugin/plugin.json`. It can also include
a `skills/` directory, a `hooks/` directory for lifecycle hooks, an `.app.json`
file that points at one or more apps or connectors, an `.mcp.json` file that
configures MCP servers, and assets used to present the plugin across supported
surfaces.

&lt;FileTree
  class="mt-4"
  tree={[
    {
      name: "my-plugin/",
      open: true,
      children: [
        {
          name: ".codex-plugin/",
          open: true,
          children: [
            {
              name: "plugin.json",
              comment: "Required: plugin manifest",
            },
          ],
        },
        {
          name: "skills/",
          open: true,
          children: [
            {
              name: "my-skill/",
              open: true,
              children: [
                {
                  name: "SKILL.md",
                  comment: "Optional: skill instructions",
                },
              ],
            },
          ],
        },
        {
          name: "hooks/",
          open: true,
          children: [
            {
              name: "hooks.json",
              comment: "Optional: lifecycle hooks",
            },
          ],
        },
        {
          name: ".app.json",
          comment: "Optional: app or connector mappings",
        },
        {
          name: ".mcp.json",
          comment: "Optional: MCP server configuration",
        },
        {
          name: "assets/",
          comment: "Optional: icons, logos, screenshots",
        },
      ],
    },
  ]}
/&gt;

Only `plugin.json` belongs in `.codex-plugin/`. Keep `skills/`, `hooks/`,
`assets/`, `.mcp.json`, and `.app.json` at the plugin root.

Published plugins typically use a richer manifest than the minimal example that
appears in quick-start scaffolds. The manifest has three jobs:

- Identify the plugin.
- Point to bundled components such as skills, apps, MCP servers, or hooks.
- Provide install-surface metadata such as descriptions, icons, and legal
  links.

Here's a complete manifest example:

```json
{
  "name": "my-plugin",
  "version": "0.1.0",
  "description": "Bundle reusable skills and app integrations.",
  "author": {
    "name": "Your team",
    "email": "team@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://example.com/plugins/my-plugin",
  "repository": "https://github.com/example/my-plugin",
  "license": "MIT",
  "keywords": ["research", "crm"],
  "skills": "./skills/",
  "mcpServers": "./.mcp.json",
  "apps": "./.app.json",
  "hooks": "./hooks/hooks.json",
  "interface": {
    "displayName": "My Plugin",
    "shortDescription": "Reusable skills and apps",
    "longDescription": "Distribute skills and app integrations together.",
    "developerName": "Your team",
    "category": "Productivity",
    "capabilities": ["Read", "Write"],
    "websiteURL": "https://example.com",
    "privacyPolicyURL": "https://example.com/privacy",
    "termsOfServiceURL": "https://example.com/terms",
    "defaultPrompt": [
      "Use My Plugin to summarize new CRM notes.",
      "Use My Plugin to triage new customer follow-ups."
    ],
    "brandColor": "#10A37F",
    "composerIcon": "./assets/icon.png",
    "logo": "./assets/logo.png",
    "screenshots": ["./assets/screenshot-1.png"]
  }
}
```

`.codex-plugin/plugin.json` is the required entry point. The other manifest
fields are optional, but published plugins commonly use them.

### Manifest fields

Use the top-level fields to define package metadata and point to bundled
components:

- `name`, `version`, and `description` identify the plugin.
- `author`, `homepage`, `repository`, `license`, and `keywords` provide
  publisher and discovery metadata.
- `skills`, `mcpServers`, `apps`, and `hooks` point to bundled components
  relative to the plugin root.
- `interface` controls how install surfaces present the plugin.

Use the `interface` object for install-surface metadata:

- `displayName`, `shortDescription`, and `longDescription` control the title
  and descriptive copy.
- `developerName`, `category`, and `capabilities` add publisher and capability
  metadata.
- `websiteURL`, `privacyPolicyURL`, and `termsOfServiceURL` provide external
  links.
- `defaultPrompt`, `brandColor`, `composerIcon`, `logo`, and `screenshots`
  control starter prompts and visual presentation.

### Path rules

- Keep manifest paths relative to the plugin root and start them with `./`.
- Store visual assets such as `composerIcon`, `logo`, and `screenshots` under
  `./assets/` when possible.
- Use `skills` for bundled skill folders, `apps` for `.app.json`,
  `mcpServers` for `.mcp.json`, and `hooks` for lifecycle hooks.
- Enabled plugins can include lifecycle hooks alongside skills, MCP servers, and
  apps.
- If your plugin stores hooks at `./hooks/hooks.json`, you do not need a
  `hooks` entry in `.codex-plugin/plugin.json`; Codex checks that default file
  automatically.

### Bundled MCP servers and lifecycle hooks

`mcpServers` can point to an `.mcp.json` file that contains either a direct
server map or a wrapped `mcp_servers` object.

Direct server map:

```json
{
  "docs": {
    "command": "docs-mcp",
    "args": ["--stdio"]
  }
}
```

Wrapped server map:

```json
{
  "mcp_servers": {
    "docs": {
      "command": "docs-mcp",
      "args": ["--stdio"]
    }
  }
}
```

After installation, users can enable or disable a bundled MCP server and tune
tool approval policy from their Codex config without editing the plugin. Use
`plugins.&lt;plugin&gt;.mcp_servers.&lt;server&gt;` for plugin-scoped MCP server policy:

```toml
[plugins."my-plugin".mcp_servers.docs]
enabled = true
default_tools_approval_mode = "prompt"
enabled_tools = ["search"]

[plugins."my-plugin".mcp_servers.docs.tools.search]
approval_mode = "approve"
```

When your plugin is enabled, Codex can load lifecycle hooks from your plugin
alongside user, project, and managed hooks.

Installing or enabling a plugin doesn't automatically trust its hooks.
Plugin-bundled hooks are non-managed hooks, so Codex skips them until the user
reviews and trusts the current hook definition.

The default plugin hook file is `hooks/hooks.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${PLUGIN_ROOT}/hooks/session_start.py",
            "statusMessage": "Loading plugin context"
          }
        ]
      }
    ]
  }
}
```

If you define `hooks` in `.codex-plugin/plugin.json`, Codex uses that manifest
entry instead of the default `hooks/hooks.json`. The manifest field can be a
single path, an array of paths, an inline hooks object, or an array of inline
hooks objects.

```json
{
  "name": "repo-policy",
  "hooks": ["./hooks/session.json", "./hooks/tools.json"]
}
```

Hook paths follow the same manifest path rules as `skills`, `apps`, and
`mcpServers`: start with `./`, resolve relative to the plugin root, and stay
inside the plugin root.

Plugin hook commands receive the Codex-specific environment variables
`PLUGIN_ROOT` and `PLUGIN_DATA`. `PLUGIN_ROOT` points to the installed plugin
root, and `PLUGIN_DATA` points to the plugin's writable data directory. Codex
also sets `CLAUDE_PLUGIN_ROOT` and `CLAUDE_PLUGIN_DATA` for compatibility with
existing plugin hooks.

Plugin hooks use the same event schema as regular hooks. See
[Hooks](/mirror/codex/hooks) for supported events, inputs, outputs, trust review, and
current limitations.

### Publish official public plugins

Adding plugins to the official Plugin Directory is coming soon.

Self-serve plugin publishing and management are coming soon.

:::
:::

