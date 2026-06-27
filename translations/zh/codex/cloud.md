---
status: needs-review
sourceId: "a5312416fe79"
sourceChecksum: "a5312416fe792799e049c34d5b646f9efbb089d4604a394a20377f788563870d"
sourceUrl: "https://developers.openai.com/codex/cloud"
translatedAt: "2026-06-27T11:05:32.948Z"
translator: codex-gpt-5.5-xhigh
---

# Codex web

Codex 是 OpenAI 的 coding agent，可以读取、编辑并运行代码。它能帮助你更快构建、修复 bug，并理解不熟悉的代码。借助 Codex cloud，Codex 可以使用自己的 cloud environment 在后台处理 tasks（包括并行处理）。

## Codex web 设置

前往 [Codex](https://chatgpt.com/codex) 并连接你的 GitHub 账号。这样 Codex 就能处理你 repositories 中的代码，并基于它的工作创建 pull requests。

你的 Plus、Pro、Business、Edu 或 Enterprise 方案包含 Codex。进一步了解[包含哪些内容](https://developers.openai.com/codex/pricing)。某些 Enterprise workspaces 可能需要先完成 [admin setup](https://developers.openai.com/codex/enterprise/admin-setup)，然后你才能访问 Codex。

---

## 使用 Codex web

<BentoContainer>
  <BentoContent href="/codex/prompting#prompts">

### 了解 prompting

编写更清晰的 prompts，添加约束，并选择合适的细节层级，以获得更好的结果。

  </BentoContent>
  <BentoContent href="/codex/workflows">

### 常见 workflows

从经过验证的模式开始，委派 tasks、审查变更，并把结果转成 PRs。

  </BentoContent>
  <BentoContent href="/codex/cloud/environments">

### 配置 environments

选择 repo、setup 步骤，以及 Codex 在 cloud 中运行 tasks 时应使用的工具。

  </BentoContent>
  <BentoContent href="/codex/ide/features#cloud-delegation">

### 从 IDE extension 委派工作

从你的编辑器启动 cloud task，然后监控进度并在本地应用生成的 diffs。

  </BentoContent>
  <BentoContent href="/codex/integrations/github">

### 从 GitHub 委派

在 issues 和 pull requests 中标记 `@codex`，即可直接从 GitHub 启动 tasks 并提出变更。

  </BentoContent>
  <BentoContent href="/codex/cloud/internet-access">

### 控制互联网访问

决定 Codex 是否可以从 cloud environments 访问公共互联网，以及何时启用它。

  </BentoContent>
</BentoContainer>
