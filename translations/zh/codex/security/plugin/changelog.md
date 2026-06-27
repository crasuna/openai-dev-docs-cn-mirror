---
status: needs-review
sourceId: "f1a6f7ecfb7b"
sourceChecksum: "f1a6f7ecfb7bb9f9c543ac23cfa62e72608417b5243966da981443bd8c07e7da"
sourceUrl: "https://developers.openai.com/codex/security/plugin/changelog"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# Codex Security plugin changelog

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

