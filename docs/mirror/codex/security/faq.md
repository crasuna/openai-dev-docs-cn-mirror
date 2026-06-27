---
title: "FAQ"
description: "Common questions about Codex Security"
outline: deep
---

# FAQ

**文档集**：Codex  
**分组**：Codex — Security  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/security/faq](https://developers.openai.com/codex/security/faq)
- Markdown 来源：[https://developers.openai.com/codex/security/faq.md](https://developers.openai.com/codex/security/faq.md)
- 抓取时间：2026-06-27T05:55:06.816Z
- Checksum：`8f2dfe15ce21cb25b274710ab88e66893596c12a7cac8958f43794e1c3916609`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 入门

### Codex Security 是什么？

软件安全仍然是工程中最困难、也最重要的问题之一。Codex Security 是一个由 LLM 驱动的安全分析工具包，会检查源代码，并返回带有建议 patch 的结构化、已排序漏洞发现项。它帮助开发者和安全团队大规模发现并修复安全问题。

### 它为什么重要？

软件是现代产业和社会的基础，而漏洞会造成系统性风险。Codex Security 通过持续识别可能的问题、在可行时验证它们并提出修复，支持 defender-first 工作流。这有助于团队在不拖慢开发的情况下提升安全性。

### Codex Security 解决什么业务问题？

Codex Security 缩短了从疑似问题到带有证据和建议 patch 的已确认、可复现发现项之间的路径。与单独使用传统扫描器相比，这可以降低 triage 负担并减少误报。

### Codex Security 如何工作？

Codex Security 会在短暂存在的隔离容器中运行分析，并临时 clone 目标 repository。它执行代码级分析，并返回结构化发现项，其中包含描述、文件和位置、criticality、根因，以及建议修复。

对于包含验证步骤的发现项，系统会在同一个 sandbox 中执行建议命令或测试，记录成功或失败、exit codes、stdout、stderr、测试结果，以及任何生成的 diffs 或 artifacts，并将该输出作为证据附加以供审查。

### 它会取代 SAST 吗？

不会。Codex Security 是对 SAST 的补充。它增加了基于 LLM 的语义推理和自动验证，而现有 SAST 工具仍然提供广泛的确定性覆盖。

## 功能

### 分析 pipeline 是什么？

Codex Security 遵循分阶段 pipeline：

1. **Analysis** 为 repository 构建 threat model。
2. **Commit scanning** 审查已合并 commits 和 repository history，以寻找可能的问题。
3. **Validation** 尝试在 sandbox 中复现可能的漏洞，以减少误报。
4. **Patching** 与 Codex 集成，提出 reviewers 在打开 PR 前可以检查的 patches。

它会与 GitHub、Codex 和标准 review 工作流中的工程师协同工作。

### 支持哪些语言？

Codex Security 与语言无关。实践中，性能取决于模型对 repository 所用语言和框架的推理能力。

### 扫描完成后我会得到什么输出？

你会得到按 criticality、validation status 排序的发现项，并在可用时得到建议 patch。发现项还可以包含 crash output、复现证据、call-path context 和相关 annotations。

### 客户代码如何隔离？

每个分析和验证 job 都在带有 session-scoped tools 的短暂 Codex container 中运行。Artifacts 会被提取出来用于审查，job 完成后该 container 会被销毁。

### Codex Security 会自动应用 patches 吗？

不会。建议 patch 是推荐修复。用户可以审查它，并从 findings UI 将其作为 PR 推送到 GitHub，但 Codex Security 不会自动把变更应用到 repository。

### 扫描前项目需要能构建吗？

不需要。Codex Security 可以在没有编译步骤的情况下，根据 repository 和 commit context 生成发现项。在 auto-validation 期间，如果构建项目有助于复现问题，它可能会尝试在 container 内构建项目。有关环境设置详情，请参见 [Codex cloud environments](/mirror/codex/cloud/environments)。

### Codex Security 如何减少误报并避免破坏性 patches？

Codex Security 使用两个阶段。首先，模型对可能的问题排序。然后，auto-validation 会尝试在干净 container 中复现每个问题。成功复现的发现项会被标记为 validated，这有助于在人工审查前减少误报。

### 初始扫描需要多久？之后会发生什么？

初始扫描时间取决于 repository 大小、构建时间，以及进入验证的发现项数量。对于一些 repositories，扫描可能需要数小时。对于更大的 repositories，可能需要数天。之后的扫描通常更快，因为它们聚焦于新的 commits 和增量变更。

### threat model 是什么？

threat model 是扫描时用于 repository 的安全上下文。它把简明项目概览与攻击面详情结合起来，例如 entry points、trust boundaries、auth assumptions 和 risky components。更多详情请参见 [Improving the threat model](/mirror/codex/security/threat-model)。

### threat model 如何生成？

Codex Security 会提示模型总结 repository 架构和安全 entry points、分类 repository 类型、运行专用 extractors，并将结果合并成 scan 全程使用的 project overview 或 threat model artifact。

### 它会取代人工安全审查吗？

不会。Codex Security 可以加速审查并帮助排序发现项，但不能取代代码级验证、可利用性检查或人工威胁评估。

### 我可以编辑 threat model 吗？

可以。Codex Security 会创建初始 threat model，你可以随着架构、风险和业务上下文变化而更新它。有关编辑工作流，请参见 [Improving the threat model](/mirror/codex/security/threat-model)。

### 使用 threat modeling 前需要配置扫描吗？

需要。Threat-model guidance 与你如何扫描以及扫描什么绑定，因此你需要先配置 repository。参见 [Codex Security setup](/mirror/codex/security/setup)。

### 建议 patch 包含什么？

当可以为发现项生成修复时，建议 patch 会包含最小可操作 diff，并带有 filename 和 line context。

### patch 会直接修改我的 PR branch 吗？

不会。该工作流会生成 diff、patch file 或 suggested change，供 maintainers 和 reviewers 在应用前检查。

## 验证

### auto-validation 是什么？

Auto-validation 是尝试在隔离 container 中复现疑似问题的阶段。它会记录复现是否成功，并捕获 logs、commands 和相关 artifacts 作为证据。

### 如果验证失败会怎样？

该发现项会保持 unvalidated。Logs 和 reports 仍会记录尝试过的内容，以便工程师重试、进一步调查，或调整复现步骤。

:::

## English source

::: details 展开英文原文
::: v-pre
## Getting started

### What is Codex Security?

Software security remains one of the hardest and most important problems in engineering. Codex Security is an LLM-driven security analysis toolkit that inspects source code and returns structured, ranked vulnerability findings with proposed patches. It helps developers and security teams discover and fix security issues at scale.

### Why does it matter?

Software is foundational to modern industry and society, and vulnerabilities create systemic risk. Codex Security supports a defender-first workflow by continuously identifying likely issues, validating them when possible, and proposing fixes. That helps teams improve security without slowing development.

### What business problem does Codex Security solve?

Codex Security shortens the path from a suspected issue to a confirmed, reproducible finding with evidence and a proposed patch. That reduces triage load and cuts false positives compared with traditional scanners alone.

### How does Codex Security work?

Codex Security runs analysis in an ephemeral, isolated container and temporarily clones the target repository. It performs code-level analysis and returns structured findings with a description, file and location, criticality, root cause, and a suggested remediation.

For findings that include verification steps, the system executes proposed commands or tests in the same sandbox, records success or failure, exit codes, stdout, stderr, test results, and any generated diffs or artifacts, and attaches that output as evidence for review.

### Does it replace SAST?

No. Codex Security complements SAST. It adds semantic, LLM-based reasoning and automated validation, while existing SAST tools still provide broad deterministic coverage.

## Features

### What is the analysis pipeline?

Codex Security follows a staged pipeline:

1. **Analysis** builds a threat model for the repository.
2. **Commit scanning** reviews merged commits and repository history for likely issues.
3. **Validation** tries to reproduce likely vulnerabilities in a sandbox to reduce false positives.
4. **Patching** integrates with Codex to propose patches that reviewers can inspect before opening a PR.

It works alongside engineers in GitHub, Codex, and standard review workflows.

### What languages are supported?

Codex Security is language-agnostic. In practice, performance depends on the model's reasoning ability for the language and framework used by the repository.

### What outputs do I get after the scan completes?

You get ranked findings with criticality, validation status, and a proposed patch when one is available. Findings can also include crash output, reproduction evidence, call-path context, and related annotations.

### How is customer code isolated?

Each analysis and validation job runs in an ephemeral Codex container with session-scoped tools. Artifacts are extracted for review, and the container is torn down after the job completes.

### Does Codex Security auto-apply patches?

No. The proposed patch is a recommended remediation. Users can review it and push it as a PR to GitHub from the findings UI, but Codex Security does not auto-apply changes to the repository.

### Does the project need to be built for scanning?

No. Codex Security can produce findings from repository and commit context without a compile step. During auto-validation, it may try to build the project inside the container if that helps reproduce the issue. For environment setup details, see [Codex cloud environments](/mirror/codex/cloud/environments).

### How does Codex Security reduce false positives and avoid broken patches?

Codex Security uses two stages. First, the model ranks likely issues. Then auto-validation tries to reproduce each issue in a clean container. Findings that successfully reproduce are marked as validated, which helps reduce false positives before human review.

### How long do initial scans take, and what happens after that?

Initial scan time depends on repository size, build time, and how many findings proceed to validation. For some repositories, scans can take several hours. For larger repositories, they can take multiple days. Later scans are usually faster because they focus on new commits and incremental changes.

### What is a threat model?

A threat model is the scan-time security context for a repository. It combines a concise project overview with attack-surface details such as entry points, trust boundaries, auth assumptions, and risky components. For more detail, see [Improving the threat model](/mirror/codex/security/threat-model).

### How is a threat model generated?

Codex Security prompts the model to summarize the repository architecture and security entry points, classify the repository type, run specialized extractors, and merge the results into a project overview or threat model artifact used throughout the scan.

### Does it replace manual security review?

No. Codex Security accelerates review and helps rank findings, but it does not replace code-level validation, exploitability checks, or human threat assessment.

### Can I edit the threat model?

Yes. Codex Security creates the initial threat model, and you can update it as the architecture, risks, and business context change. For the editing workflow, see [Improving the threat model](/mirror/codex/security/threat-model).

### Do I need to configure a scan before using threat modeling?

Yes. Threat-model guidance is tied to how and what you scan, so you need to configure the repository first. See [Codex Security setup](/mirror/codex/security/setup).

### What does the proposed patch contain?

The proposed patch contains a minimal actionable diff with filename and line context when a remediation can be generated for the finding.

### Does the patch directly modify my PR branch?

No. The workflow generates a diff, patch file, or suggested change for maintainers and reviewers to inspect before applying.

## Validation

### What is auto-validation?

Auto-validation is the phase that tries to reproduce a suspected issue in an isolated container. It records whether reproduction succeeded or failed and captures logs, commands, and related artifacts as evidence.

### What happens if validation fails?

The finding remains unvalidated. Logs and reports still capture what was attempted so engineers can retry, investigate further, or adjust the reproduction steps.

:::
:::

