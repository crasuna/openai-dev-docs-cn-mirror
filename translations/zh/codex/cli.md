---
status: needs-review
sourceId: "1e4371e76897"
sourceChecksum: "1e4371e76897a943292f574e46d74eb909c93f5df13e7883856f5a627c7184d5"
sourceUrl: "https://developers.openai.com/codex/cli"
translatedAt: "2026-06-27T19:07:21.7838419+08:00"
translator: codex-gpt-5.5-xhigh
---

# Codex CLI 命令行

Codex CLI 是 OpenAI 的编码 agent，你可以从本地终端运行它。它可以在所选目录中读取、修改并运行你机器上的代码。
它是[开源的](https://github.com/openai/codex)，并且使用 Rust 构建，以获得速度和效率。

ChatGPT Plus、Pro、Business、Edu 和 Enterprise 计划均包含 Codex。了解更多[包含内容](https://developers.openai.com/codex/pricing)。

<YouTubeEmbed
  title="Codex CLI overview"
  videoId="iqNzfK4_meQ"
  class="max-w-md"
/>
<br />

## CLI 设置

<CliSetupSteps client:load />

Codex CLI 可在 macOS、Windows 和 Linux 上使用。在 Windows 上，可以使用 Windows sandbox 在 PowerShell 中原生运行 Codex；如果需要 Linux 原生环境，也可以使用 WSL2。有关设置详情，请参阅
  <a href="/codex/windows">Windows 设置指南</a>。

如果你刚开始使用 Codex，请阅读[最佳实践指南](https://developers.openai.com/codex/learn/best-practices)。

---

## 使用 Codex CLI

<BentoContainer>
  <BentoContent href="/codex/cli/features#running-in-interactive-mode">

### 以交互模式运行 Codex

运行 `codex` 以启动交互式终端 UI（TUI）会话。

  </BentoContent>
  <BentoContent href="/codex/cli/features#models-and-reasoning">

### 控制模型和推理

使用 `/model` 在可用模型之间切换，或调整推理级别。

  </BentoContent>
  <BentoContent href="/codex/cli/features#image-inputs">

### 图像输入

附加截图或设计规格，让 Codex 在读取你的提示词时一并读取它们。

  </BentoContent>
  <BentoContent href="/codex/cli/features#image-generation">

### 图像生成

直接在 CLI 中生成或编辑图像；当你希望 Codex 基于现有素材迭代时，可以附加参考图。

  </BentoContent>

  <BentoContent href="/codex/cli/features#running-local-code-review">

### 运行本地代码审查

在提交或推送改动前，让一个单独的 Codex agent 审查你的代码。

  </BentoContent>

  <BentoContent href="/codex/subagents">

### 使用 subagents

使用 subagents 并行处理复杂任务。

  </BentoContent>

  <BentoContent href="/codex/cli/features#web-search">

### Web search

使用 Codex 搜索网页，为你的任务获取最新信息。

  </BentoContent>

  <BentoContent href="/codex/cli/features#working-with-codex-cloud">

### Codex Cloud 任务

启动 Codex Cloud 任务、选择环境，并在不离开终端的情况下应用生成的 diff。

  </BentoContent>

  <BentoContent href="/codex/noninteractive">

### 脚本化 Codex

使用 `exec` 命令编写脚本，自动化可重复的工作流。

  </BentoContent>
  <BentoContent href="/codex/mcp">

### Model Context Protocol

通过 Model Context Protocol（MCP）让 Codex 访问额外的第三方工具和上下文。

  </BentoContent>
  
  <BentoContent href="/codex/cli/features#approval-modes">

### Approval modes

在 Codex 编辑或运行命令之前，选择与你舒适程度匹配的 approval mode。

  </BentoContent>
</BentoContainer>
