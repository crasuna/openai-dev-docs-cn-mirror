---
status: needs-review
sourceId: "124a3326b025"
sourceChecksum: "124a3326b025f1402ac2182b6378bf204c426f09f0a14a1020017beac6b68dd6"
sourceUrl: "https://developers.openai.com/codex/security/plugin"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# Codex Security plugin 快速入门

Codex Security 是面向 Codex 的安全审查 plugin，可扫描你的代码以寻找漏洞、验证可信的发现项，并在可审查的 workspace 中呈现证据和修复指导。使用它可以在代码进入生产环境之前，查找你拥有或已获授权评估的代码中的安全问题。

本快速入门会带你完成一次推荐的首次运行：在 Codex app 中对本地 repository 执行一次普通的只读扫描。

本页介绍在本地 Codex thread 中运行的 plugin。若要在 Codex web 中扫描已连接的 GitHub repository，请参见 [Codex Security cloud setup](https://developers.openai.com/codex/security/setup)。

## 安装 plugin

在 Codex app 中打开你想评估的 repository，然后安装 Codex Security：

<div className="not-prose my-6">
  <ButtonLink
    href="codex://plugins/install/codex-security?marketplace=openai-curated"
    color="primary"
    variant="solid"
    size="lg"
    pill
  >
    安装 Codex Security plugin
  </ButtonLink>
</div>

安装后，在该 repository 中启动一个新 thread。Codex 会在线程启动时加载 plugins，所以不要继续使用已经打开的 thread。

## 运行第一次扫描

为了获得最佳扫描质量，请使用 `gpt-5.5`，并将 reasoning effort 设为 `high` 或 `xhigh`。

<VideoPlayer
  src="/videos/codex/security/scan-setup-to-findings.mp4"
  poster="/videos/codex/security/scan-setup-to-findings-poster.webp"
/>

<WorkflowSteps variant="headings">

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

   <figure className="not-prose my-6">
     <div className="overflow-hidden rounded-xl border border-subtle bg-surface">
       <img
         src={scanSetup.src}
         alt="配置为扫描整个 codebase 的 Codex Security setup workspace"
         className="block h-auto w-full"
       />
     </div>
     <figcaption className="mt-3 text-sm text-secondary">
       在开始扫描前配置扫描目标、扫描区域、branch，以及可选的威胁模型
       guidance。
     </figcaption>
   </figure>

3. 等待扫描完成

   扫描可能需要一些时间。保持 thread 运行，直到 workspace 报告完成。如果 Codex 识别出配置限制，请在允许它更新配置之前，审查具体限制和建议变更。

4. 审查结果

   使用 UI 浏览发现项，或打开生成的报告以进行完整、可移植的审查。

   <figure className="not-prose my-6">
     <div className="overflow-hidden rounded-xl border border-subtle bg-surface">
       <img
         src={findingsWorkspace.src}
         alt="OWASP Juice Shop 的已完成 Codex Security findings workspace"
         className="block h-auto w-full"
       />
     </div>
     <figcaption className="mt-3 text-sm text-secondary">
       按 severity、category、directory、patch status 和 review status
       浏览发现项。
     </figcaption>
   </figure>

</WorkflowSteps>

## 扫描会创建什么

每次完成的扫描都会打开一个 findings workspace。使用它可以审查发现项和覆盖范围，而无需检查原始 artifacts。扫描还会创建：

- `report.md`，用于分享或归档的完整可移植报告。
- `scan-manifest.json`、`findings.json` 和 `coverage.json` 中的结构化扫描数据，用于自动化和集成。通常你不需要自己打开这些文件。

## 选择下一步工作流

- 当你想用默认工作流扫描一个 repository 或一个文件夹时，[运行标准扫描或限定范围扫描](https://developers.openai.com/codex/security/plugin/scans)。
- 当你需要更全面的扫描并且可以等待更长时间完成时，[运行深度扫描](https://developers.openai.com/codex/security/plugin/deep-scans)。
- 当目标是 pull request、commit、branch 范围或 working-tree patch 时，[审查代码变更](https://developers.openai.com/codex/security/plugin/code-changes)。
- 当你有现有安全发现项需要审查时，[分流 backlog](https://developers.openai.com/codex/security/plugin/triage-backlog)。
- 当你接受一个发现项并准备修复时，[修复并验证发现项](https://developers.openai.com/codex/security/plugin/fix-findings)。
- 当你需要 JSON、CSV、SARIF、需要批准的 Linear/GitHub/Jira issue，或私有 draft GitHub Security Advisory 时，[导出或跟踪发现项](https://developers.openai.com/codex/security/plugin/export-findings)。

## 从 Codex CLI 安装

要从 CLI 安装同一个 plugin，请在 repository 中启动 Codex 并打开 plugin browser：

```text
codex
/plugins
```

搜索 **Codex Security**，选择 `Install plugin`，然后启动一个新 thread。之后使用同一个首次扫描 prompt。
