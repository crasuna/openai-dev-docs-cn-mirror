---
title: "Codex Security 设置"
description: "Set up Codex Security, wait for initial findings, and improve results with threat model edits"
outline: deep
---

# Codex Security 设置

**文档集**：Codex 编码智能体<br>
**分组**：Codex — Security 安全<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/security/setup](https://developers.openai.com/codex/security/setup)
- Markdown 来源：[https://developers.openai.com/codex/security/setup.md](https://developers.openai.com/codex/security/setup.md)
- 抓取时间：2026-06-27T05:55:12.174Z
- Checksum：`528736050e7144aea5a9e3022d77cc0f76c6d0a813c3089aa35a194f2e0b3a3c`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
本页会带你在 Codex Security 中从初始访问走到已审查的发现项和修复 pull requests。

先确认你已经设置 Codex Cloud。如果还没有，请参见 [Codex Cloud](/mirror/codex/cloud) 开始使用。

## 1. 访问权限和环境

Codex Security 会扫描通过 [Codex Cloud](/mirror/codex/cloud) 连接的 GitHub repositories。

- 确认你的 workspace 具有 Codex Security 访问权限。
- 确认你想扫描的 repository 可在 Codex Cloud 中使用。

前往 [Codex environments](https://chatgpt.com/codex/settings/environments)，检查该 repository 是否已经有 environment。如果没有，请在继续前先在那里创建一个。

&lt;CtaPillLink
  href="https://chatgpt.com/codex/settings/environments"
  label="打开 environments"
  icon="external"
  class="my-8"
/&gt;


  &lt;img
    src={createEnvironment.src}
    alt="Codex environments"
    class="block h-auto w-full"
  /&gt;


## 2. 新建安全扫描

environment 存在后，前往 [Create a security scan](https://chatgpt.com/codex/security/scans/new)，选择你刚连接的 repository。

&lt;CtaPillLink
  href="https://chatgpt.com/codex/security/scans/new"
  label="创建安全扫描"
  icon="external"
  class="my-8"
/&gt;

Codex Security 会先从最新 commits 向后扫描 repositories。它会利用这一点，在新 commits 进入时构建并刷新扫描上下文。

要配置一个 repository：

1. 选择 GitHub organization。
2. 选择 repository。
3. 选择你想扫描的 branch。
4. 选择 environment。
5. 选择一个 **history window**。较长的窗口会提供更多上下文，但 backfill 需要更长时间。
6. 点击 **Create**。


  &lt;img
    src={createScan.src}
    alt="创建安全扫描"
    class="block h-auto w-full"
  /&gt;


## 3. 初始扫描可能需要一段时间

创建扫描后，Codex Security 会先在选定的 history window 中运行一次 commit-level security pass。
初始 backfill 可能需要几个小时，尤其是对于较大的 repositories 或较长的窗口。
如果发现项没有立刻显示，这是预期行为。请等待初始扫描完成，再创建工单或排查问题。

初始扫描设置是自动且全面的。这可能需要几个小时。如果第一批发现项延迟出现，请不必担心。

## 4. 审查扫描并改进威胁模型

&lt;CtaPillLink
  href="https://chatgpt.com/codex/security/scans"
  label="审查扫描"
  icon="external"
  class="my-8"
/&gt;


  &lt;img
    src={reviewThreatModel.src}
    alt="Codex Security 中的威胁模型编辑器"
    class="block h-auto w-full"
  /&gt;


初始扫描完成后，打开扫描并审查生成的威胁模型。
初始发现项出现后，更新威胁模型，让它与你的架构、信任边界和业务上下文匹配。
这有助于 Codex Security 为你的团队排序问题。

如果你希望扫描结果发生变化，可以用更新后的范围、优先级和假设编辑威胁模型。

初始发现项出现后，请重新查看该模型，让扫描 guidance 与当前优先级保持一致。
保持它的最新状态有助于 Codex Security 生成更好的建议。

关于威胁模型以及它们如何影响 criticality 和 triage 的更深入解释，请参见 [Improving the threat model](/mirror/codex/security/threat-model)。

## 5. 审查发现项并修复

初始 backfill 完成后，从 **Findings** view 审查发现项。

&lt;CtaPillLink
  href="https://chatgpt.com/codex/security/findings"
  label="打开 findings"
  icon="external"
  class="my-8"
/&gt;

你可以使用两个 view：

- **Recommended Findings**：repo 中最关键问题的动态 top 10 列表
- **All Findings**：跨 repository 发现项的可排序、可筛选表格

![Recommended findings view](https://developers.openai.com/codex/security/images/aardvark_recommended_findings.png)

点击一个发现项可打开其详情页，其中包括：

- 对问题的简明描述
- commit 详情和文件路径等关键 metadata
- 关于影响的上下文推理
- 相关代码摘录
- 可用时的 call-path 或 data-flow 上下文
- 验证步骤和验证输出

你可以审查每个发现项，并直接从发现项详情页创建 PR。

&lt;CtaPillLink
  href="https://chatgpt.com/codex/security/findings"
  label="审查发现项并创建 PR"
  icon="external"
  class="my-8"
/&gt;

## 相关文档

- [Codex Security](/mirror/codex/security) 提供产品概览。
- [FAQ](/mirror/codex/security/faq) 覆盖常见问题。
- [Improving the threat model](/mirror/codex/security/threat-model) 解释如何改进扫描上下文和发现项优先级。

:::

## English source

::: details 展开英文原文
::: v-pre
This page walks you from initial access to reviewed findings and remediation pull requests in Codex Security.

Confirm you've set up Codex Cloud first. If not, see [Codex Cloud](/mirror/codex/cloud) to get started.

## 1. Access and environment

Codex Security scans GitHub repositories connected through [Codex Cloud](/mirror/codex/cloud).

- Confirm your workspace has access to Codex Security.
- Confirm the repository you want to scan is available in Codex Cloud.

Go to [Codex environments](https://chatgpt.com/codex/settings/environments) and check whether the repository already has an environment. If it doesn't, create one there before continuing.

&lt;CtaPillLink
  href="https://chatgpt.com/codex/settings/environments"
  label="Open environments"
  icon="external"
  class="my-8"
/&gt;


  &lt;img
    src={createEnvironment.src}
    alt="Codex environments"
    class="block h-auto w-full"
  /&gt;


## 2. New security scan

After the environment exists, go to [Create a security scan](https://chatgpt.com/codex/security/scans/new) and choose the repository you just connected.

&lt;CtaPillLink
  href="https://chatgpt.com/codex/security/scans/new"
  label="Create a security scan"
  icon="external"
  class="my-8"
/&gt;

Codex Security scans repositories from newest commits backward first. It uses this to build and refresh scan context as new commits come in.

To configure a repository:

1. Select the GitHub organization.
2. Select the repository.
3. Select the branch you want to scan.
4. Select the environment.
5. Choose a **history window**. Longer windows provide more context, but backfill takes longer.
6. Click **Create**.


  &lt;img
    src={createScan.src}
    alt="Create a security scan"
    class="block h-auto w-full"
  /&gt;


## 3. Initial scans can take a while

When you create the scan, Codex Security first runs a commit-level security pass across the selected history window.
The initial backfill can take a few hours, especially for larger repositories or longer windows.
If findings aren't visible right away, this is expected. Wait for the initial scan to finish before opening a ticket or troubleshooting.

Initial scan setup is automatic and thorough. This can take a few hours. Don’t
  be alarmed if the first set of findings is delayed.

## 4. Review scans and improve the threat model

&lt;CtaPillLink
  href="https://chatgpt.com/codex/security/scans"
  label="Review scans"
  icon="external"
  class="my-8"
/&gt;


  &lt;img
    src={reviewThreatModel.src}
    alt="Threat model editor in Codex Security"
    class="block h-auto w-full"
  /&gt;


When the initial scan finishes, open the scan and review the threat model that was generated.
After initial findings appear, update the threat model so it matches your architecture, trust boundaries, and business context.
This helps Codex Security rank issues for your team.

If you want scan results to change, you can edit the threat model with your
  updated scope, priorities, and assumptions.

After initial findings appear, revisit the model so scan guidance stays aligned with current priorities.
Keeping it current helps Codex Security produce better suggestions.

For a deeper explanation of threat models and how they affect criticality and triage, see [Improving the threat model](/mirror/codex/security/threat-model).

## 5. Review findings and patch

After the initial backfill completes, review findings from the **Findings** view.

&lt;CtaPillLink
  href="https://chatgpt.com/codex/security/findings"
  label="Open findings"
  icon="external"
  class="my-8"
/&gt;

You can use two views:

- **Recommended Findings**: an evolving top 10 list of the most critical issues in the repo
- **All Findings**: a sortable, filterable table of findings across the repository

![Recommended findings view](https://developers.openai.com/codex/security/images/aardvark_recommended_findings.png)

Click a finding to open its detail page, which includes:

- a concise description of the issue
- key metadata such as commit details and file paths
- contextual reasoning about impact
- relevant code excerpts
- call-path or data-flow context when available
- validation steps and validation output

You can review each finding and create a PR directly from the finding detail page.

&lt;CtaPillLink
  href="https://chatgpt.com/codex/security/findings"
  label="Review findings and create a PR"
  icon="external"
  class="my-8"
/&gt;

## Related docs

- [Codex Security](/mirror/codex/security) gives the product overview.
- [FAQ](/mirror/codex/security/faq) covers common questions.
- [Improving the threat model](/mirror/codex/security/threat-model) explains how to improve scan context and finding prioritization.

:::
:::

