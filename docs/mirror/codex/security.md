---
title: "Codex Security 安全"
description: "Find and remediate vulnerabilities with the Codex Security plugin or Codex Security cloud."
outline: deep
---

# Codex Security 安全

**文档集**：Codex\
**分组**：安全\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/security](https://developers.openai.com/codex/security)
- Markdown 来源：[https://developers.openai.com/codex/security.md](https://developers.openai.com/codex/security.md)
- 抓取时间：2026-06-27T05:55:07.606Z
- Checksum：`2255a1d04492e41d502c5fbc3ba951a27b8d3b913ad7c3603e8145a87842adaa`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
&lt;CtaPillLink
  href="https://chatgpt.com/plugins/share/676aca3811d54fa7bcdef5255236b3c4"
  label="在 Codex App 中安装 plugin"
  icon="external"
  class="my-8"
/&gt;

如需第一次进行规范化的本地扫描，请从 [Codex Security plugin quickstart](/mirror/codex/security/plugin) 开始。

### 探索 plugin 使用场景

- 对一个仓库或某个限定文件夹[运行安全扫描](/mirror/codex/security/plugin/scans)。
- 当你需要更全面的扫描且可以等待更长时间完成时，[运行深度安全扫描](/mirror/codex/security/plugin/deep-scans)。
- 在合并 pull request 或 branch 前[审查代码变更](/mirror/codex/security/plugin/code-changes)。
- 当你有现有安全发现项需要审查时，[分流 backlog](/mirror/codex/security/plugin/triage-backlog)。
- 对已批准的发现项使用有边界的 patch 来[修复并验证发现项](/mirror/codex/security/plugin/fix-findings)。
- 将发现项作为可移植 artifact 或需要批准的跟踪目标来[导出或跟踪](/mirror/codex/security/plugin/export-findings)。
- 查看 Codex Security plugin 的[最新变化](/mirror/codex/security/plugin/changelog)。

该 plugin 在你的 Codex thread 中运行。Codex Security cloud 通过 Codex Web 扫描已连接的 GitHub repositories。有关 Codex sandboxing、approvals、网络控制和管理员设置，请参见 [Agent approvals & security](/mirror/codex/agent-approvals-security)。

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

- [Codex Security plugin quickstart](/mirror/codex/security/plugin) 会带你完成安装和第一次本地扫描。
- [Codex Security cloud setup](/mirror/codex/security/setup) 详细说明设置、扫描和发现项审查。
- [Improving the threat model](/mirror/codex/security/threat-model) 解释如何调整范围、攻击面和 criticality 假设。
- [FAQ](/mirror/codex/security/faq) 覆盖常见产品问题。

:::

## English source

::: details 展开英文原文
::: v-pre
&lt;CtaPillLink
  href="https://chatgpt.com/plugins/share/676aca3811d54fa7bcdef5255236b3c4"
  label="Install plugin in Codex App"
  icon="external"
  class="my-8"
/&gt;

For a prescriptive first local scan, start with the [Codex Security plugin quickstart](/mirror/codex/security/plugin).

### Explore plugin use cases

- [Run a security scan](/mirror/codex/security/plugin/scans) for a repository or one scoped folder.
- [Run a deep security scan](/mirror/codex/security/plugin/deep-scans) when you need a more comprehensive scan and can wait longer for it to finish.
- [Review code changes](/mirror/codex/security/plugin/code-changes) before you merge a pull request or branch.
- [Triage a backlog](/mirror/codex/security/plugin/triage-backlog) when you have existing security findings to review.
- [Fix and verify findings](/mirror/codex/security/plugin/fix-findings) with bounded patches for approved findings.
- [Export or track findings](/mirror/codex/security/plugin/export-findings) as portable artifacts or approval-gated tracking destinations.
- [See what's new](/mirror/codex/security/plugin/changelog) in the Codex Security plugin.

The plugin runs in your Codex thread. Codex Security cloud scans connected
  GitHub repositories through Codex Web. For Codex sandboxing, approvals,
  network controls, and admin settings, see [Agent approvals & security](/mirror/codex/agent-approvals-security).

## Codex Security cloud

Codex Security cloud is currently in research preview. It scans connected
GitHub repositories for likely security issues.

It helps teams:

1. **Find likely vulnerabilities** by using a repo-specific threat model and real code context.
2. **Reduce noise** by validating findings before you review them.
3. **Move findings toward fixes** with ranked results, evidence, and suggested patch options.

## How Codex Security cloud works

Codex Security scans connected repositories commit by commit.
It builds scan context from your repo, checks likely vulnerabilities against that context, and validates high-signal issues in an isolated environment before surfacing them.

You get a workflow focused on:

- repo-specific context instead of generic signatures
- validation evidence that helps reduce false positives
- suggested fixes you can review in GitHub

## Codex Security cloud access and prerequisites

Codex Security is available for ChatGPT Enterprise, Edu, Business, and Pro users. It works with connected GitHub repositories through Codex Web. If you need access or a repository isn't visible, confirm the repository is available through your Codex Web workspace or contact your OpenAI account team.

## Related docs

- [Codex Security plugin quickstart](/mirror/codex/security/plugin) walks through installation and a first local scan.
- [Codex Security cloud setup](/mirror/codex/security/setup) details setup, scanning, and findings review.
- [Improving the threat model](/mirror/codex/security/threat-model) explains how to tune scope, attack surface, and criticality assumptions.
- [FAQ](/mirror/codex/security/faq) covers common product questions.

:::
:::

