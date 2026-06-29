---
title: "Plugins 插件"
description: "Use plugins in Codex to add reusable workflows with skills and app integrations"
outline: deep
---

# Plugins 插件

**文档集**：Codex 编码智能体<br>
**分组**：Codex — Plugins 插件<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/plugins](https://developers.openai.com/codex/plugins)
- Markdown 来源：[https://developers.openai.com/codex/plugins.md](https://developers.openai.com/codex/plugins.md)
- 抓取时间：2026-06-27T05:55:04.139Z
- Checksum：`8b912d939a4b846b421f354067985f4d748857ae20ed8fa789cad958f80e6ec1`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

Plugins 会把 skills、app 集成和 MCP servers 打包成 Codex 可复用的工作流。

扩展 Codex 能做的事，例如：

- 安装 Codex Security plugin，扫描已授权代码并确认可信的漏洞发现项。
- 安装 Gmail plugin，让 Codex 读取和管理 Gmail。
- 安装 Google Drive plugin，在 Drive、Docs、Sheets 和 Slides 中工作。
- 安装 Slack plugin，总结频道或起草回复。
- 安装 [Sites](/mirror/codex/sites)，创建并部署托管网站、Web 应用和游戏。

一个 plugin 可以包含：

- **Skills：** 用于特定工作类型的可复用指令。Codex 可以在需要时加载它们，以便遵循正确步骤，并使用任务所需的参考资料或辅助脚本。
- **Apps：** 到 GitHub、Slack 或 Google Drive 等工具的连接，使 Codex 可以从这些工具读取信息并在其中执行操作。
- **MCP servers：** 让 Codex 访问更多工具或共享信息的服务，这些信息通常来自本地项目之外的系统。

你可以通过 marketplace 来源（例如项目或团队的仓库 marketplace）发布 plugins 来共享它们。请参阅 [Build plugins](/mirror/codex/plugins/build)，了解 marketplace 设置、打包和分发指南。

## 使用和安装 plugins

### Codex app 中的 Plugin Directory

在 Codex app 中打开 **Plugins**，浏览并安装精选 plugins。

&lt;CodexScreenshot
  alt="Codex Plugins page"
  lightSrc="/images/codex/plugins/directory.webp"
  darkSrc="/images/codex/plugins/directory-dark.webp"
/&gt;

Plugin directory 会将 plugins 分组为以下类别：

- **Curated by OpenAI：** 对所有 Codex 用户可用的精选 plugins。
- **Shared with you：** 由你 ChatGPT workspace 中其他成员共享的 plugins。
- **Created by you：** 你创建或添加到自己 workspace 的 plugins。

### CLI 中的 Plugin directory

在 Codex CLI 中，运行以下命令打开 plugins 列表：

```text
codex
/plugins
```

&lt;CodexScreenshot
  alt="Plugins list in Codex CLI"
  lightSrc="/images/codex/plugins/cli_light.png"
  darkSrc="/images/codex/plugins/codex-plugin-cli.png"
/&gt;

CLI plugin browser 会按 marketplace 对 plugins 分组。使用 marketplace 标签页切换来源，打开 plugin 查看详细信息，安装或卸载 marketplace 条目，并在已安装 plugin 上按 &lt;kbd&gt;Space&lt;/kbd&gt; 切换其启用状态。

### 安装并使用 plugin

打开 plugin directory 后：



1. 搜索或浏览 plugin，然后打开其详情。
2. 选择安装按钮。在 app 中，选择加号按钮或 **Add to Codex**。在 CLI 中，选择 `Install plugin`。
3. 如果 plugin 需要外部 app，请在提示时连接它。有些 plugins 会在安装期间要求你认证。另一些会等到你第一次使用时再认证。
4. 安装完成后，启动新线程并请求 Codex 使用该 plugin。



安装 plugin 后，你可以直接在 prompt window 中使用它：

&lt;CodexScreenshot
  alt="Codex Plugins page"
  lightSrc="/images/codex/plugins/plugin-github-invoke.png"
  darkSrc="/images/codex/plugins/plugin-github-invoke-dark.png"
/&gt;



直接描述任务

      请求你想要的结果，例如“总结今天未读的 Gmail threads”
      或“从 Google Drive 拉取最新发布说明”。


      当你希望 Codex 为任务选择合适的已安装工具时使用这种方式。




选择特定 plugin

      输入 &lt;code&gt;@&lt;/code&gt; 来显式调用 plugin 或其打包的某个 skill。


      当你想明确指定 Codex 应使用哪个 plugin 或 skill 时使用这种方式。请参阅 &lt;a href="/codex/app/commands"&gt;Codex app commands&lt;/a&gt; 和 
      &lt;a href="/codex/skills"&gt;Skills&lt;/a&gt;。




### 权限和数据共享如何工作

安装 plugin 会让其工作流在 Codex 中可用，但你现有的[approval settings](/mirror/codex/agent-approvals-security) 仍然适用。任何已连接的外部服务仍受其自身身份验证、隐私和数据共享政策约束。

- 安装 plugin 后，打包随附的 skills 会立即可用。
- 如果 plugin 包含 apps，Codex 可能会在设置期间或你第一次使用它们时，提示你在 ChatGPT 中安装或登录这些 apps。
- 如果 plugin 包含 MCP servers，它们可能需要额外设置或认证后才能使用。
- 当 Codex 通过打包随附的 app 发送数据时，该 app 的服务条款和隐私政策适用。

### 移除或关闭 plugin

要移除 plugin，请从 plugin browser 重新打开它并选择 **Uninstall plugin**。

卸载 plugin 会从 Codex 中移除 plugin 包，但打包随附的 apps 会保持安装状态，直到你在 ChatGPT 中管理它们。

如果你想保留已安装 plugin 但将其关闭，请在 `~/.codex/config.toml` 中将其条目设置为 `enabled = false`，然后重启 Codex：

```toml
[plugins."gmail@openai-curated"]
enabled = false
```

## 构建你自己的 plugin

如果你想创建、测试或分发自己的 plugin，请参阅 [Build plugins](/mirror/codex/plugins/build)。该页面涵盖本地脚手架、手动 marketplace 设置、workspace 共享、plugin manifests 和打包指南。

## Plugin guides

- [Record & Replay](/mirror/codex/record-and-replay)：向 Codex 展示一次工作流，并将其变成可复用 skill。
- [Codex Security plugin quickstart](/mirror/codex/security/plugin)：安装 plugin，扫描已授权代码并审查结果。

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

Plugins bundle skills, app integrations, and MCP servers into reusable
workflows for Codex.

Extend what Codex can do, for example:

- Install the Codex Security plugin to scan authorized code and confirm
  plausible vulnerability findings.
- Install the Gmail plugin to let Codex read and manage Gmail.
- Install the Google Drive plugin to work across Drive, Docs, Sheets, and
  Slides.
- Install the Slack plugin to summarize channels or draft replies.
- Install [Sites](/mirror/codex/sites) to create and deploy hosted websites,
  web apps, and games.

A plugin can contain:

- **Skills:** reusable instructions for specific kinds of work. Codex can load
  them when needed so it follows the right steps and uses the right references
  or helper scripts for a task.
- **Apps:** connections to tools like GitHub, Slack, or Google Drive, so
  Codex can read information from those tools and take actions in them.
- **MCP servers:** services that give Codex access to more tools or shared
  information, often from systems outside your local project.

You can share plugins by publishing them through a marketplace source, such as a
repo marketplace for a project or team. See [Build plugins](/mirror/codex/plugins/build)
for marketplace setup, packaging, and distribution guidance.

## Use and install plugins

### Plugin Directory in the Codex app

Open **Plugins** in the Codex app to browse and install curated plugins.

&lt;CodexScreenshot
  alt="Codex Plugins page"
  lightSrc="/images/codex/plugins/directory.webp"
  darkSrc="/images/codex/plugins/directory-dark.webp"
/&gt;

The plugin directory groups plugins into categories:

- **Curated by OpenAI:** highlighted plugins available to all Codex users.
- **Shared with you:** plugins shared by other members of your ChatGPT
  workspace.
- **Created by you:** plugins you created or added to your own workspace.

### Plugin directory in the CLI

In Codex CLI, run the following command to open the plugins list:

```text
codex
/plugins
```

&lt;CodexScreenshot
  alt="Plugins list in Codex CLI"
  lightSrc="/images/codex/plugins/cli_light.png"
  darkSrc="/images/codex/plugins/codex-plugin-cli.png"
/&gt;

The CLI plugin browser groups plugins by marketplace. Use the marketplace tabs
to switch sources, open a plugin to inspect details, install or uninstall
marketplace entries, and press &lt;kbd&gt;Space&lt;/kbd&gt; on an installed plugin to toggle
its enabled state.

### Install and use a plugin

Once you open the plugin directory:



1. Search or browse for a plugin, then open its details.
2. Select the install button. In the app, select the plus button or
   **Add to Codex**. In the CLI, select `Install plugin`.
3. If the plugin needs an external app, connect it when prompted. Some plugins
   ask you to authenticate during install. Others wait until the first time you
   use them.
4. After installation, start a new thread and ask Codex to use the plugin.



After you install a plugin, you can use it directly in the prompt window:

&lt;CodexScreenshot
  alt="Codex Plugins page"
  lightSrc="/images/codex/plugins/plugin-github-invoke.png"
  darkSrc="/images/codex/plugins/plugin-github-invoke-dark.png"
/&gt;



Describe the task directly

      Ask for the outcome you want, such as "Summarize unread Gmail threads
      from today" or "Pull the latest launch notes from Google Drive."


      Use this when you want Codex to choose the right installed tools for the
      task.




Choose a specific plugin

      Type &lt;code&gt;@&lt;/code&gt; to invoke the plugin or one of its bundled skills
      explicitly.


      Use this when you want to be specific about which plugin or skill Codex
      should use. See &lt;a href="/codex/app/commands"&gt;Codex app commands&lt;/a&gt; and 
      &lt;a href="/codex/skills"&gt;Skills&lt;/a&gt;.




### How permissions and data sharing work

Installing a plugin makes its workflows available in Codex, but your existing
[approval settings](/mirror/codex/agent-approvals-security) still apply. Any
connected external services remain subject to their own authentication,
privacy, and data-sharing policies.

- Bundled skills are available as soon as you install the plugin.
- If a plugin includes apps, Codex may prompt you to install or sign in to
  those apps in ChatGPT during setup or the first time you use them.
- If a plugin includes MCP servers, they may require extra setup or
  authentication before you can use them.
- When Codex sends data through a bundled app, that app's terms and privacy
  policy apply.

### Remove or turn off a plugin

To remove a plugin, reopen it from the plugin browser and select
**Uninstall plugin**.

Uninstalling a plugin removes the plugin bundle from Codex, but bundled apps
stay installed until you manage them in ChatGPT.

If you want to keep a plugin installed but turn it off, set its entry in
`~/.codex/config.toml` to `enabled = false`, then restart Codex:

```toml
[plugins."gmail@openai-curated"]
enabled = false
```

## Build your own plugin

If you want to create, test, or distribute your own plugin, see
[Build plugins](/mirror/codex/plugins/build). That page covers local scaffolding,
manual marketplace setup, workspace sharing, plugin manifests, and packaging
guidance.

## Plugin guides

- [Record & Replay](/mirror/codex/record-and-replay): Show Codex a workflow
  once and turn it into a reusable skill.
- [Codex Security plugin quickstart](/mirror/codex/security/plugin): Install the
  plugin, scan authorized code, and review the result.

:::
:::

