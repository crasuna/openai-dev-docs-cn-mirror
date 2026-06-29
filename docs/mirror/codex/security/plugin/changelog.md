---
title: "Codex Security plugin 变更日志"
description: "Notable user-facing changes to the Codex Security plugin."
outline: deep
---

# Codex Security plugin 变更日志

**文档集**：Codex  
**分组**：Codex — Security  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/security/plugin/changelog](https://developers.openai.com/codex/security/plugin/changelog)
- Markdown 来源：[https://developers.openai.com/codex/security/plugin/changelog.md](https://developers.openai.com/codex/security/plugin/changelog.md)
- 抓取时间：2026-06-27T05:55:07.429Z
- Checksum：`f1a6f7ecfb7bb9f9c543ac23cfa62e72608417b5243966da981443bd8c07e7da`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
此 changelog 概述会影响你运行扫描、审查结果以及推动发现项进入修复的变化。

## 0.1.9（2026 年 6 月）

### 在 findings workspace 中审查扫描

- 在专用 workspace 中审查已完成的扫描，将发现项、覆盖范围、severity、confidence 和扫描 artifacts 汇总到一起。
- 筛选和排序发现项，包括按最高 confidence 排序，同时在刷新期间保留你的 workspace 状态。
- 打开发现项，在一处审查源码证据、验证详情、可达性、影响和修复指导。

### 用更少设置运行扫描

- 针对 Git repositories、单独文件夹或没有 Git history 的 codebases 运行标准扫描。深度扫描也可以针对特定文件夹。
- 明确取消活动扫描，在不再次出现 setup prompt 的情况下恢复被中断的扫描，并在启动并发深度扫描前收到警告。
- 遵循更清晰的设置和进度状态，进度摘要更紧凑，错误会保持可见直到你处理它们。

### 导出可移植、可验证的结果

- 使用一致的已完成扫描格式，其中包含 manifest、结构化发现项、覆盖数据，以及从同一个规范结果生成的 Markdown 报告。
- 将发现项导出为 JSON、CSV 或 SARIF，用于分析、归档，以及与其他安全工具集成。
- 改进扫描完成和文件系统处理，包括修复 Windows paths 和 scan locking 问题。

### 分流和跟踪现有发现项

- 根据当前 codebase 分流来自 scanners、advisories、bug bounty reports、GitHub、Jira、Linear 或 Codex Security 结果的现有发现项。triage 工作流会返回有证据支持的 verdict 和按优先级排序的 action queue。
- 将选定的已验证发现项跟踪到 Linear、Jira 或 GitHub issues，或在 repository 满足 advisory 要求时创建一个私有 draft GitHub Security Advisory。
- 在批准写入前审查重复检查、source context、destination visibility 和确切的拟议内容。Codex 会在创建或更新后读回结果以进行验证。

:::

## English source

::: details 展开英文原文
::: v-pre
This changelog highlights changes that affect how you run scans, review
results, and move findings toward remediation.

## 0.1.9 (June 2026)

### Review scans in the findings workspace

- Review completed scans in a dedicated workspace that brings findings,
  coverage, severity, confidence, and scan artifacts together.
- Filter and sort findings, including sorting by highest confidence, while
  preserving your workspace state during refreshes.
- Open a finding to review source evidence, validation details, reachability,
  impact, and remediation guidance in one place.

### Run scans with less setup

- Run standard scans against Git repositories, individual folders, or
  codebases without Git history. Deep scans can also target a specific folder.
- Cancel an active scan explicitly, resume an interrupted scan without another
  setup prompt, and receive a warning before starting concurrent deep scans.
- Follow clearer setup and progress states, with more compact progress
  summaries and errors that remain visible until you address them.

### Export portable, verifiable results

- Use a consistent completed-scan format with a manifest, structured findings,
  coverage data, and a Markdown report derived from the same canonical result.
- Export findings as JSON, CSV, or SARIF for analysis, archiving, and integration
  with other security tools.
- Improved scan completion and filesystem handling, including fixes for Windows
  paths and scan locking.

### Triage and track existing findings

- Triage existing findings from scanners, advisories, bug bounty reports,
  GitHub, Jira, Linear, or Codex Security results against the current codebase.
  The triage workflow returns an evidence-backed verdict and a prioritized
  action queue.
- Track selected validated findings in Linear, Jira, or GitHub issues, or create
  a private draft GitHub Security Advisory when the repository meets the
  advisory requirements.
- Review duplicate checks, source context, destination visibility, and the
  exact proposed content before approving a write. Codex reads the result back
  after creation or update to verify it.

:::
:::

