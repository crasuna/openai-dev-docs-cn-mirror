---
status: needs-review
sourceId: "2255a1d04492"
sourceChecksum: "2255a1d04492e41d502c5fbc3ba951a27b8d3b913ad7c3603e8145a87842adaa"
sourceUrl: "https://developers.openai.com/codex/security"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# Codex Security 安全

<CtaPillLink
  href="https://chatgpt.com/plugins/share/676aca3811d54fa7bcdef5255236b3c4"
  label="在 Codex App 中安装 plugin"
  icon="external"
  class="my-8"
/>

如需第一次进行规范化的本地扫描，请从 [Codex Security plugin quickstart](https://developers.openai.com/codex/security/plugin) 开始。

### 探索 plugin 使用场景

- 对一个仓库或某个限定文件夹[运行安全扫描](https://developers.openai.com/codex/security/plugin/scans)。
- 当你需要更全面的扫描且可以等待更长时间完成时，[运行深度安全扫描](https://developers.openai.com/codex/security/plugin/deep-scans)。
- 在合并 pull request 或 branch 前[审查代码变更](https://developers.openai.com/codex/security/plugin/code-changes)。
- 当你有现有安全发现项需要审查时，[分流 backlog](https://developers.openai.com/codex/security/plugin/triage-backlog)。
- 对已批准的发现项使用有边界的 patch 来[修复并验证发现项](https://developers.openai.com/codex/security/plugin/fix-findings)。
- 将发现项作为可移植 artifact 或需要批准的跟踪目标来[导出或跟踪](https://developers.openai.com/codex/security/plugin/export-findings)。
- 查看 Codex Security plugin 的[最新变化](https://developers.openai.com/codex/security/plugin/changelog)。

该 plugin 在你的 Codex thread 中运行。Codex Security cloud 通过 Codex Web 扫描已连接的 GitHub repositories。有关 Codex sandboxing、approvals、网络控制和管理员设置，请参见 [Agent approvals & security](https://developers.openai.com/codex/agent-approvals-security)。

## Codex Security cloud

Codex Security cloud 目前处于 research preview。它会扫描已连接的 GitHub repositories，以寻找可能的安全问题。

它帮助团队：

1. **发现可能的漏洞**：使用 repo 专属 threat model 和真实代码上下文。
2. **降低噪声**：在你审查前验证发现项。
3. **推动发现项进入修复**：提供排序后的结果、证据和建议 patch 选项。

## Codex Security cloud 的工作方式

Codex Security 会逐 commit 扫描已连接的 repositories。它根据你的 repo 构建扫描上下文，在该上下文中检查可能的漏洞，并在隔离环境中验证高信号问题，然后再呈现给你。

你会得到一个聚焦于以下内容的工作流：

- repo 专属上下文，而不是通用签名
- 有助于减少误报的验证证据
- 可以在 GitHub 中审查的建议修复

## Codex Security cloud 访问权限和前提条件

Codex Security 面向 ChatGPT Enterprise、Edu、Business 和 Pro 用户开放。它通过 Codex Web 与已连接的 GitHub repositories 配合工作。如果你需要访问权限，或看不到某个 repository，请确认该 repository 可通过你的 Codex Web workspace 使用，或联系你的 OpenAI account team。

## 相关文档

- [Codex Security plugin quickstart](https://developers.openai.com/codex/security/plugin) 会带你完成安装和第一次本地扫描。
- [Codex Security cloud setup](https://developers.openai.com/codex/security/setup) 详细说明设置、扫描和发现项审查。
- [Improving the threat model](https://developers.openai.com/codex/security/threat-model) 解释如何调整范围、攻击面和 criticality 假设。
- [FAQ](https://developers.openai.com/codex/security/faq) 覆盖常见产品问题。

