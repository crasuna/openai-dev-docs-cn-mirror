---
title: "Codex Security plugin 快速入门"
description: "Install the Codex Security plugin, run your first read-only scan, and review the result in Codex."
outline: deep
---

# Codex Security plugin 快速入门

**文档集**：Codex<br>
**分组**：安全<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/security/plugin](https://developers.openai.com/codex/security/plugin)
- Markdown 来源：[https://developers.openai.com/codex/security/plugin.md](https://developers.openai.com/codex/security/plugin.md)
- 抓取时间：2026-06-27T05:55:07.182Z
- Checksum：`124a3326b025f1402ac2182b6378bf204c426f09f0a14a1020017beac6b68dd6`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex Security 是面向 Codex 的安全审查 plugin，可扫描你的代码以寻找漏洞、验证可信的发现项，并在可审查的 workspace 中呈现证据和修复指导。使用它可以在代码进入生产环境之前，查找你拥有或已获授权评估的代码中的安全问题。

本快速入门会带你完成一次推荐的首次运行：在 Codex app 中对本地 repository 执行一次普通的只读扫描。

本页介绍在本地 Codex thread 中运行的 plugin。若要在 Codex web 中扫描已连接的 GitHub repository，请参见 [Codex Security cloud setup](/mirror/codex/security/setup)。

## 安装 plugin

在 Codex app 中打开你想评估的 repository，然后安装 Codex Security：


  &lt;ButtonLink
    href="codex://plugins/install/codex-security?marketplace=openai-curated"
    color="primary"
    variant="solid"
    size="lg"
    pill
  &gt;
    安装 Codex Security plugin



安装后，在该 repository 中启动一个新 thread。Codex 会在线程启动时加载 plugins，所以不要继续使用已经打开的 thread。

## 运行第一次扫描

为了获得最佳扫描质量，请使用 `gpt-5.5`，并将 reasoning effort 设为 `high` 或 `xhigh`。

&lt;VideoPlayer
  src="/videos/codex/security/scan-setup-to-findings.mp4"
  poster="/videos/codex/security/scan-setup-to-findings-poster.webp"
/&gt;



1. 请求普通扫描

   在新 thread 中发送这个 prompt：

```text
   Run a Codex Security scan on this repository.
```

2. 确认设置

   Codex 会在开始前打开一个 setup workspace。首次运行时，请使用这些设置：
   - **Scan type:** `Codebase`
   - **Deep scan:** Off
   - **Scan area:** `Entire codebase`
   - **Threat model scoping guidance:** 除非你已经知道某个需要优先处理的具体攻击向量或应用区域，否则保持为空。

   确认 **Codebase**、**Current branch** 和 **Last commit** 标识的是你想扫描的 repository。然后选择 **Start scan**。



       &lt;img
         src={scanSetup.src}
         alt="配置为扫描整个 codebase 的 Codex Security setup workspace"
         className="block h-auto w-full"
       /&gt;


       在开始扫描前配置扫描目标、扫描区域、branch，以及可选的威胁模型
       guidance。



3. 等待扫描完成

   扫描可能需要一些时间。保持 thread 运行，直到 workspace 报告完成。如果 Codex 识别出配置限制，请在允许它更新配置之前，审查具体限制和建议变更。

4. 审查结果

   使用 UI 浏览发现项，或打开生成的报告以进行完整、可移植的审查。



       &lt;img
         src={findingsWorkspace.src}
         alt="OWASP Juice Shop 的已完成 Codex Security findings workspace"
         className="block h-auto w-full"
       /&gt;


       按 severity、category、directory、patch status 和 review status
       浏览发现项。





## 扫描会创建什么

每次完成的扫描都会打开一个 findings workspace。使用它可以审查发现项和覆盖范围，而无需检查原始 artifacts。扫描还会创建：

- `report.md`，用于分享或归档的完整可移植报告。
- `scan-manifest.json`、`findings.json` 和 `coverage.json` 中的结构化扫描数据，用于自动化和集成。通常你不需要自己打开这些文件。

## 选择下一步工作流

- 当你想用默认工作流扫描一个 repository 或一个文件夹时，[运行标准扫描或限定范围扫描](/mirror/codex/security/plugin/scans)。
- 当你需要更全面的扫描并且可以等待更长时间完成时，[运行深度扫描](/mirror/codex/security/plugin/deep-scans)。
- 当目标是 pull request、commit、branch 范围或 working-tree patch 时，[审查代码变更](/mirror/codex/security/plugin/code-changes)。
- 当你有现有安全发现项需要审查时，[分流 backlog](/mirror/codex/security/plugin/triage-backlog)。
- 当你接受一个发现项并准备修复时，[修复并验证发现项](/mirror/codex/security/plugin/fix-findings)。
- 当你需要 JSON、CSV、SARIF、需要批准的 Linear/GitHub/Jira issue，或私有 draft GitHub Security Advisory 时，[导出或跟踪发现项](/mirror/codex/security/plugin/export-findings)。

## 从 Codex CLI 安装

要从 CLI 安装同一个 plugin，请在 repository 中启动 Codex 并打开 plugin browser：

```text
codex
/plugins
```

搜索 **Codex Security**，选择 `Install plugin`，然后启动一个新 thread。之后使用同一个首次扫描 prompt。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Codex Security is a security-review plugin for Codex that scans your code for
vulnerabilities, validates plausible findings, and presents evidence and
remediation guidance in a reviewable workspace. Use it to find security issues
in code you own or have authorization to assess before they reach production.

This quickstart takes you through one recommended first run: an ordinary,
read-only scan of a local repository in the Codex app.

This page covers the plugin that runs in a local Codex thread. To scan a
  connected GitHub repository in Codex web, see [Codex Security cloud
  setup](https://developers.openai.com/codex/security/setup).

## Install the plugin

Open the repository you want to assess in the Codex app, then install Codex
Security:

<div className="not-prose my-6">
  <ButtonLink
    href="codex://plugins/install/codex-security?marketplace=openai-curated"
    color="primary"
    variant="solid"
    size="lg"
    pill
  >
    Install the Codex Security plugin
  </ButtonLink>
</div>

After installation, start a new thread in that repository. Codex loads plugins
when the thread starts, so don't continue in a thread that was already open.

## Run your first scan

For the best scan quality, use `gpt-5.5`
with `high` or `xhigh` reasoning effort.

<VideoPlayer
  src="/videos/codex/security/scan-setup-to-findings.mp4"
  poster="/videos/codex/security/scan-setup-to-findings-poster.webp"
/>

<WorkflowSteps variant="headings">

1. Ask for an ordinary scan

   Send this prompt in the new thread:

   ```text
   Run a Codex Security scan on this repository.
   ```

2. Confirm the setup

   Codex opens a setup workspace before it starts. For your first run, use these
   settings:
   - **Scan type:** `Codebase`
   - **Deep scan:** Off
   - **Scan area:** `Entire codebase`
   - **Threat model scoping guidance:** Leave blank unless you already know a
     specific attack vector or application area that deserves priority.

   Confirm that **Codebase**, **Current branch**, and **Last commit** identify
   the repository you intended to scan. Then select **Start scan**.

   <figure className="not-prose my-6">
     <div className="overflow-hidden rounded-xl border border-subtle bg-surface">
       <img
         src={scanSetup.src}
         alt="Codex Security setup workspace configured to scan an entire codebase"
         className="block h-auto w-full"
       />
     </div>
     <figcaption className="mt-3 text-sm text-secondary">
       Configure the scan target, scan area, branch, and optional threat model
       guidance before starting the scan.
     </figcaption>
   </figure>

3. Let the scan finish

   The scan can take time. Keep the thread running until the workspace reports
   completion. If Codex identifies a configuration limitation, review the exact
   limitation and proposed change before allowing it to update your
   configuration.

4. Review the result

   Use the UI to browse findings or open the generated report for a complete,
   portable review.

   <figure className="not-prose my-6">
     <div className="overflow-hidden rounded-xl border border-subtle bg-surface">
       <img
         src={findingsWorkspace.src}
         alt="Completed Codex Security findings workspace for OWASP Juice Shop"
         className="block h-auto w-full"
       />
     </div>
     <figcaption className="mt-3 text-sm text-secondary">
       Browse findings by severity, category, directory, patch status, and
       review status.
     </figcaption>
   </figure>

</WorkflowSteps>

## What the scan creates

Every completed scan opens a findings workspace. Use it to review findings and
coverage without inspecting raw artifacts. The scan also creates:

- `report.md`, a complete portable report for sharing or archiving.
- Structured scan data in `scan-manifest.json`, `findings.json`, and
  `coverage.json` for automation and integrations. You normally don't need to
  open these files yourself.

## Choose your next workflow

- [Run a standard or scoped scan](https://developers.openai.com/codex/security/plugin/scans) when you want
  to scan a repository or one folder with the default workflow.
- [Run a deep scan](https://developers.openai.com/codex/security/plugin/deep-scans) when you need a more
  comprehensive scan and can wait longer for it to finish.
- [Review code changes](https://developers.openai.com/codex/security/plugin/code-changes) when the target is
  a pull request, commit, branch range, or working-tree patch.
- [Triage a backlog](https://developers.openai.com/codex/security/plugin/triage-backlog) when you have
  existing security findings to review.
- [Fix and verify a finding](https://developers.openai.com/codex/security/plugin/fix-findings) after you
  accept one finding for remediation.
- [Export or track findings](https://developers.openai.com/codex/security/plugin/export-findings) when you
  need JSON, CSV, SARIF, an approval-gated Linear, GitHub, or Jira issue, or a
  private draft GitHub Security Advisory.

## Install from Codex CLI

To install the same plugin from the CLI, start Codex in the repository and open
the plugin browser:

```text
codex
/plugins
```

Search for **Codex Security**, select `Install plugin`, and start a new thread.
Then use the same first-scan prompt.
``````
:::
:::

