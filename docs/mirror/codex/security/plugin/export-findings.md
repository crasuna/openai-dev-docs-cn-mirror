---
title: "导出并跟踪安全发现项"
description: "Create portable findings artifacts or prepare approval-gated issues and draft advisories from a completed scan."
outline: deep
---

# 导出并跟踪安全发现项

**文档集**：Codex 编码智能体<br>
**分组**：Codex — Security 安全<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/security/plugin/export-findings](https://developers.openai.com/codex/security/plugin/export-findings)
- Markdown 来源：[https://developers.openai.com/codex/security/plugin/export-findings.md](https://developers.openai.com/codex/security/plugin/export-findings.md)
- 抓取时间：2026-06-27T05:55:08.108Z
- Checksum：`49cb55bc9787de5cde931881f9391f22a837035169a7068a60f9429d8c7ab20f`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
将已完成的 Codex Security 扫描作为两类交接的来源：

- **Export** 会创建可移植的 JSON、CSV 或 SARIF 文件。
- **Track findings** 会将选定发现项准备成 Linear、GitHub 或 Jira issues，或一个私有 draft GitHub Security Advisory，检查重复项，并在写入前等待你的批准。

这些工作流不会更改已封存的扫描 bundle。

## 导出可移植 artifact

打开已完成的 findings workspace，选择 **Export**，然后选择格式：

| 格式  | 用途                                                              |
| ----- | ----------------------------------------------------------------- |
| JSON  | 为工具和脚本保留已封存的结构化发现项。                            |
| CSV   | 在电子表格中审查发现项和当前本地 triage 状态。                    |
| SARIF | 将发现项发送到支持 SARIF interchange format 的工具。              |

选择 **Export findings** 并使用返回的 artifact path。当另一个工具需要完整扫描上下文，而不仅是 findings-only projection 时，请将原始 `scan-manifest.json`、`findings.json` 和 `coverage.json` 保持在一起。



    &lt;img
      src={exportFindingsFormats.src}
      alt="带有 JSON、CSV 和 SARIF 格式选项的导出发现项对话框"
      className="block h-auto w-full"
    /&gt;


    将已完成的发现项导出为 JSON、CSV 或 SARIF，用于下游审查和工具处理。



## 跟踪选定发现项

`$codex-security:track-findings` 工作流接受来自一个已封存扫描的一个已验证发现项，或最多 25 个明确选定发现项组成的 batch，用于 issue tracking。Draft GitHub Security Advisories 只接受一个发现项。一次运行使用一个 provider 和一个 destination。

对于 Linear，发送类似这样的 prompt：

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] for the Linear team [team] and project [project, if
any]. Check for duplicates and show me the exact issue title, body, metadata,
and destination. Do not create or update anything until I approve that payload.
```

对于 GitHub issues，发送：

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] for GitHub repository [owner/repository]. Check open
and closed issues for duplicates and show me the exact issue title, body,
metadata, repository visibility, and authenticated transport. Do not create or
update anything until I approve that payload.
```

对于 Jira，发送：

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] for Jira project [project key] as [issue type].
Check for duplicates and show me the exact issue summary, description,
metadata, and destination. Do not create or update anything until I approve
that payload.
```

Jira tracking 需要 Codex 中的原生 Atlassian Rovo app。复用 issue 需要 read access；创建或更新 issue 需要 read 和 write access。

对于私有 draft GitHub Security Advisory，发送：

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] as a private draft GitHub Security Advisory in
[owner/repository]. Verify the sealed source revision, repository, affected
paths, package metadata, and duplicate state. Show me the exact advisory
payload, authenticated GitHub CLI identity, and disclosure warnings. Do not
create anything until I approve that payload.
```

Draft advisories 要求来自已封存 `git_revision` 扫描的一个发现项、已验证的公开规范源 repository，以及 administrator access。该工作流不会 batch、update、publish 或 close advisories。当来源不满足这些要求时，请使用已批准的私有 issue destination。

## 审查拟议写入



1. 确认 finding ID 和 fingerprint 来自预期的已封存扫描。
2. 确认 provider、确切的 Linear team、GitHub repository、Jira project 或 advisory repository，以及实时 destination visibility。
3. 审查重复项结果：`create`、`reuse`、`update` 或 `blocked`。
4. 阅读完整的拟议 title、body、source locations 和 provider metadata。移除 destination 不应暴露的 exploit detail 或内部证据。
5. 只批准该确切 payload。destination、visibility、finding set 或 body 如有变化，都需要新的 preview。



敏感发现项应进入私有 destination。在内部或公开 GitHub repository 中创建 issue 需要明确的可见性警告，并批准完整内容。请把 draft advisory description 视为最终会公开，并在批准前移除凭据、私有证据和不必要的 exploit details。

&lt;VideoPlayer
  src="/videos/codex/security/issue-preview-before-approval.mp4"
  poster="/videos/codex/security/issue-preview-before-approval-poster.webp"
/&gt;

## 验证被跟踪的条目

批准后，Codex 会重新验证已封存来源、destination、access 和重复项状态。它会串行处理 batch，并在遇到第一个不确定结果时停止。只有在 Codex 读回确切 issue 并验证其绑定 identifiers 和内容之后，create、update 或 reuse 才算完成。

请把返回的 canonical issue 或 advisory URL 与你的 triage record 保存在一起。当 owner 接受该条目进入修复时，继续使用 [Fix and verify a finding](/mirror/codex/security/plugin/fix-findings)。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Use a completed Codex Security scan as the source for two different handoffs:

- **Export** creates a portable JSON, CSV, or SARIF file.
- **Track findings** prepares selected findings as Linear, GitHub, or Jira issues
  or one private draft GitHub Security Advisory, checks for duplicates, and
  waits for your approval before writing.

These workflows don't change the sealed scan bundle.

## Export a portable artifact

Open the completed findings workspace, select **Export**, and choose a format:

| Format | Use it for                                                        |
| ------ | ----------------------------------------------------------------- |
| JSON   | Preserve the sealed structured findings for tools and scripts.    |
| CSV    | Review findings and current local triage state in a spreadsheet.  |
| SARIF  | Send findings to tools that support the SARIF interchange format. |

Select **Export findings** and use the returned artifact path. Keep the
original `scan-manifest.json`, `findings.json`, and `coverage.json` together
when another tool needs the complete scan context rather than a findings-only
projection.

<figure className="not-prose my-8">
  <div className="overflow-hidden rounded-xl border border-subtle bg-surface">
    <img
      src={exportFindingsFormats.src}
      alt="Export findings dialog with JSON, CSV, and SARIF format options"
      className="block h-auto w-full"
    />
  </div>
  <figcaption className="mt-3 text-sm text-secondary">
    Export completed findings as JSON, CSV, or SARIF for downstream review and
    tooling.
  </figcaption>
</figure>

## Track selected findings

The `$codex-security:track-findings` workflow accepts one validated finding or
an explicitly selected batch of up to 25 findings from one sealed scan for
issue tracking. Draft GitHub Security Advisories accept one finding only. One
run uses one provider and one destination.

For Linear, send a prompt like:

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] for the Linear team [team] and project [project, if
any]. Check for duplicates and show me the exact issue title, body, metadata,
and destination. Do not create or update anything until I approve that payload.
```

For GitHub issues, send:

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] for GitHub repository [owner/repository]. Check open
and closed issues for duplicates and show me the exact issue title, body,
metadata, repository visibility, and authenticated transport. Do not create or
update anything until I approve that payload.
```

For Jira, send:

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] for Jira project [project key] as [issue type].
Check for duplicates and show me the exact issue summary, description,
metadata, and destination. Do not create or update anything until I approve
that payload.
```

Jira tracking requires the native Atlassian Rovo app in Codex. Reusing an issue
requires read access; creating or updating one requires read and write access.

For a private draft GitHub Security Advisory, send:

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] as a private draft GitHub Security Advisory in
[owner/repository]. Verify the sealed source revision, repository, affected
paths, package metadata, and duplicate state. Show me the exact advisory
payload, authenticated GitHub CLI identity, and disclosure warnings. Do not
create anything until I approve that payload.
```

Draft advisories require one finding from a sealed `git_revision` scan, the
  verified public canonical source repository, and administrator access. The
  workflow doesn't batch, update, publish, or close advisories. Use an approved
  private issue destination when the source doesn't meet those requirements.

## Review the proposed write

<WorkflowSteps>

1. Confirm the finding ID and fingerprint came from the intended sealed scan.
2. Confirm the provider, exact Linear team, GitHub repository, Jira project, or
   advisory repository, and the live destination visibility.
3. Review the duplicate outcome: `create`, `reuse`, `update`, or `blocked`.
4. Read the complete proposed title, body, source locations, and provider
   metadata. Remove exploit detail or internal evidence that the destination
   shouldn't expose.
5. Approve only that exact payload. A changed destination, visibility, finding
   set, or body requires a new preview.

</WorkflowSteps>

Sensitive findings should go to a private destination. Creating an issue in an
internal or public GitHub repository requires an explicit visibility warning
and approval of the complete content. Treat a draft advisory description as
eventually public and remove credentials, private evidence, and unnecessary
exploit details before approval.

<VideoPlayer
  src="/videos/codex/security/issue-preview-before-approval.mp4"
  poster="/videos/codex/security/issue-preview-before-approval-poster.webp"
/>

## Verify the tracked item

After approval, Codex revalidates the sealed source, destination, access, and
duplicate state. It processes a batch serially and stops on the first uncertain
result. A create, update, or reuse is complete only after Codex reads the exact
issue back and verifies its binding identifiers and content.

Keep the returned canonical issue or advisory URL with your triage record.
Continue with [Fix and verify a finding](https://developers.openai.com/codex/security/plugin/fix-findings)
when the owner accepts the item for remediation.
``````
:::
:::

