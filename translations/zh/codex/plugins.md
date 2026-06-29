---
status: needs-review
sourceId: "8b912d939a4b"
sourceChecksum: "8b912d939a4b846b421f354067985f4d748857ae20ed8fa789cad958f80e6ec1"
sourceUrl: "https://developers.openai.com/codex/plugins"
translatedAt: "2026-06-27T19:06:51.2133192+08:00"
translator: codex-gpt-5.5-xhigh
---

# Plugins 插件

## 概览

Plugins 会把 skills、app 集成和 MCP servers 打包成 Codex 可复用的工作流。

扩展 Codex 能做的事，例如：

- 安装 Codex Security plugin，扫描已授权代码并确认可信的漏洞发现项。
- 安装 Gmail plugin，让 Codex 读取和管理 Gmail。
- 安装 Google Drive plugin，在 Drive、Docs、Sheets 和 Slides 中工作。
- 安装 Slack plugin，总结频道或起草回复。
- 安装 [Sites](https://developers.openai.com/codex/sites)，创建并部署托管网站、Web 应用和游戏。

一个 plugin 可以包含：

- **Skills：** 用于特定工作类型的可复用指令。Codex 可以在需要时加载它们，以便遵循正确步骤，并使用任务所需的参考资料或辅助脚本。
- **Apps：** 到 GitHub、Slack 或 Google Drive 等工具的连接，使 Codex 可以从这些工具读取信息并在其中执行操作。
- **MCP servers：** 让 Codex 访问更多工具或共享信息的服务，这些信息通常来自本地项目之外的系统。

你可以通过 marketplace 来源（例如项目或团队的仓库 marketplace）发布 plugins 来共享它们。请参阅 [Build plugins](https://developers.openai.com/codex/plugins/build)，了解 marketplace 设置、打包和分发指南。

## 使用和安装 plugins

### Codex app 中的 Plugin Directory

在 Codex app 中打开 **Plugins**，浏览并安装精选 plugins。

<CodexScreenshot
  alt="Codex Plugins page"
  lightSrc="/images/codex/plugins/directory.webp"
  darkSrc="/images/codex/plugins/directory-dark.webp"
/>

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

<CodexScreenshot
  alt="Plugins list in Codex CLI"
  lightSrc="/images/codex/plugins/cli_light.png"
  darkSrc="/images/codex/plugins/codex-plugin-cli.png"
/>

CLI plugin browser 会按 marketplace 对 plugins 分组。使用 marketplace 标签页切换来源，打开 plugin 查看详细信息，安装或卸载 marketplace 条目，并在已安装 plugin 上按 <kbd>Space</kbd> 切换其启用状态。

### 安装并使用 plugin

打开 plugin directory 后：

<WorkflowSteps>

1. 搜索或浏览 plugin，然后打开其详情。
2. 选择安装按钮。在 app 中，选择加号按钮或 **Add to Codex**。在 CLI 中，选择 `Install plugin`。
3. 如果 plugin 需要外部 app，请在提示时连接它。有些 plugins 会在安装期间要求你认证。另一些会等到你第一次使用时再认证。
4. 安装完成后，启动新线程并请求 Codex 使用该 plugin。

</WorkflowSteps>

安装 plugin 后，你可以直接在 prompt window 中使用它：

<CodexScreenshot
  alt="Codex Plugins page"
  lightSrc="/images/codex/plugins/plugin-github-invoke.png"
  darkSrc="/images/codex/plugins/plugin-github-invoke-dark.png"
/>

<div class="not-prose mt-4 grid gap-4 md:grid-cols-2">
  <div class="rounded-xl border border-subtle bg-surface px-5 py-4">
    <p class="text-sm font-semibold text-default">直接描述任务</p>
    <p class="mt-2 text-sm text-secondary">
      请求你想要的结果，例如“总结今天未读的 Gmail threads”
      或“从 Google Drive 拉取最新发布说明”。
    </p>
    <p class="mt-3 text-sm text-secondary">
      当你希望 Codex 为任务选择合适的已安装工具时使用这种方式。
    </p>
  </div>

  <div class="rounded-xl border border-subtle bg-surface px-5 py-4">
    <p class="text-sm font-semibold text-default">选择特定 plugin</p>
    <p class="mt-2 text-sm text-secondary">
      输入 <code>@</code> 来显式调用 plugin 或其打包的某个 skill。
    </p>
    <p class="mt-3 text-sm text-secondary">
      当你想明确指定 Codex 应使用哪个 plugin 或 skill 时使用这种方式。请参阅 <a href="/codex/app/commands">Codex app commands</a> 和 
      <a href="/codex/skills">Skills</a>。
    </p>
  </div>
</div>

### 权限和数据共享如何工作

安装 plugin 会让其工作流在 Codex 中可用，但你现有的[approval settings](https://developers.openai.com/codex/agent-approvals-security) 仍然适用。任何已连接的外部服务仍受其自身身份验证、隐私和数据共享政策约束。

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

如果你想创建、测试或分发自己的 plugin，请参阅 [Build plugins](https://developers.openai.com/codex/plugins/build)。该页面涵盖本地脚手架、手动 marketplace 设置、workspace 共享、plugin manifests 和打包指南。

## Plugin guides

- [Record & Replay](https://developers.openai.com/codex/record-and-replay)：向 Codex 展示一次工作流，并将其变成可复用 skill。
- [Codex Security plugin quickstart](https://developers.openai.com/codex/security/plugin)：安装 plugin，扫描已授权代码并审查结果。
