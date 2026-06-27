---
title: "Triage a backlog"
description: "Review existing security findings against a repository and order follow-up work."
outline: deep
---

# Triage a backlog

**文档集**：Codex  
**分组**：Codex — Security  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/security/plugin/triage-backlog](https://developers.openai.com/codex/security/plugin/triage-backlog)
- Markdown 来源：[https://developers.openai.com/codex/security/plugin/triage-backlog.md](https://developers.openai.com/codex/security/plugin/triage-backlog.md)
- 抓取时间：2026-06-27T05:55:08.382Z
- Checksum：`2556b32d479b050739622f6a993f82914fb996028ba5ed4b8407542eefb88c09`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用 `$codex-security:triage-finding` 根据当前 repository 审查现有安全发现项。该工作流执行只读静态分析：Codex 会把每个发现项视为未经证明的 claim，并在不执行代码的情况下检查 repository evidence。

请从一个作用域为你想评估的 repository 的 Codex project 中运行该工作流。Codex 必须能够读取该 repository 的 source code。Jira、Linear 和 GitHub connectors 可以提供 finding data，但不能取代对 source code 的访问。

在底层，Codex 会从被引用的代码或版本信息开始。它会追踪声称的 attacker-controlled source、相关 security controls、dangerous sink 和 reachable path。它还会检查 product surface 和 trust boundary、寻找 counterevidence，并记录 proof gaps。然后，Codex 会为每个发现项返回一个 verdict，并对需要 action 或进一步 review 的发现项排序。

这不同于 `$codex-security:validation`，后者可以构建或运行代码、创建聚焦的 test 或 proof of concept，或操作真实 interface 来复现或反驳发现项。使用 triage 对现有 backlog 进行分类和优先级排序。当 runtime evidence 可以解决静态证据无法确定的发现项时，使用 validation。

Backlog triage 从现有发现项开始。若要在 repository 中搜索新的漏洞，请[运行安全扫描](/mirror/codex/security/plugin/scans)。Triage 不会修改 repository，也不会实现修复。

## 选择要分流的发现项

你可以从这些来源提供一个发现项或一组发现项：

| 来源                     | 要提供什么                                                                                                                                                                                                                                                                                                                                                                                                                                           | 要求                                                                                                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 粘贴或本地发现项         | SARIF results、CVE 或 GHSA、advisory、scanner ticket、bug bounty report、Codex Security finding artifact，或普通语言漏洞 claim。                                                                                                                                                                                                                                                                                                                     | 不需要 connector。                                                                                                                                                                             |
| Jira 或 Linear           | 确切的 security 或 vulnerability issue URLs 或 identifiers、Jira JQL，或 Linear team、project 或 search phrase。Codex 会在 triage 前检索选定 issue content。                                                                                                                                                                                                                                                                                         | [Jira through Atlassian Rovo](codex://plugins/plugin_connector_692de805e3ec8191834719067174a384) 或 [Linear](codex://plugins/plugin_asdk_app_69a089a326dc8191b32a3f2553f5be2c)，并具有 read access。 |
| GitHub                   | 一个 repository 和一个 finding source：code scanning、`Dependabot` vulnerabilities and malware、security advisories and private vulnerability reports，或 all sources。如果你没有指定 repository，Codex 会在可用时使用附加到当前 Codex project 的 GitHub repository。默认 GitHub sources 不包含 GitHub Issues；当你想分流 GitHub Issues 时，请提供特定 issue 或明确要求 GitHub Issues。 | [GitHub](codex://plugins/plugin_connector_1p_1a69035c238881919c4190932b2df699)，并具有对选定 repository 和 finding type 的访问权限。                                                            |

Codex 会按输入顺序为每个提供的发现项保留一个结果，因此每个 source finding 都保持可追踪。它不会合并或丢弃看起来像重复项的发现项。

## 运行只读 triage

对于粘贴的发现项或本地 artifacts，发送类似这样的 prompt：

```text
Use $codex-security:triage-finding to triage these existing security findings against this repository:

[Paste the findings or provide the artifact path.]
```

对于 Jira 或 Linear issues，请标识 issue set，并保持 source system 只读：

```text
Use $codex-security:triage-finding to import and triage the security findings from [Jira or Linear issue URLs, identifiers, or query] against this repository.
Do not change the source issues.
```

对于 GitHub findings，请命名 repository 和 source：

```text
Use $codex-security:triage-finding to import and triage [code scanning, Dependabot vulnerabilities and malware, security advisories and private vulnerability reports, or all] from [owner/repository] against this repository.
```

要使用附加到当前 Codex project 的 GitHub repository，只指定 finding source：

```text
Use $codex-security:triage-finding to import and triage [code scanning, Dependabot vulnerabilities and malware, security advisories and private vulnerability reports, or all] from GitHub against this repository. Use the GitHub repository attached to the current Codex project.
```

工作流按这个顺序进行：



1. 收集并整理发现项

   Codex 会检索任何请求的 issue 或 GitHub content，保留 source identifiers 和 references，并为每个输入创建一个 triage item。它会先构建完整 item list，再分配 verdicts。

2. 确认 repository context

   Codex 会在可用时解析当前 repository 和 revision。存在 `SECURITY.md` 时，它会读取该文件，使 supported versions、trusted inputs、product boundaries 和 out-of-scope surfaces 纳入评估。

3. 检查静态证据

   对每个发现项，Codex 会追踪声称的 attacker-controlled source、相关 security control、vulnerable sink、reachable path 和受支持的 security boundary。它会记录支持 claim 的证据、反对 claim 的证据，以及 proof gaps。

4. 分配 verdicts 和 ranks

   Codex 会为每个发现项分配 verdict 和 confidence。它会在单独队列中按 exploitability 对 `confirmed` 和 `needs_review` 发现项排序。



## 审查结果

| Verdict          | 含义                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `confirmed`      | Repository evidence 显示，在所述前提条件下 vulnerable path 可达，并跨越受支持的 security boundary。                                              |
| `not_actionable` | Repository evidence 排除了该 claim，例如显示版本不受影响、路径不可达、有有效 guard，或属于未发布 surface。                                      |
| `needs_review`   | Repository evidence 不足以做出判断，因为所需信息缺失、含糊、依赖运行时、依赖环境或依赖策略。                                                     |

Exploitability ranks 使用从 `1` 开始的正整数，并在每个 verdict queue 内独立排序。这会让 remediation priorities 与 unresolved review work 分离。Rank `1` 是该结果集中最可利用的 `confirmed` 发现项，或最高优先级的 `needs_review` 发现项。该 rank 不是 scanner severity score，并且 `not_actionable` 发现项不会排序。

对每个发现项，请审查：

- verdict 和 rank 的 rationale
- supporting evidence 和反对 claim 的证据
- open questions 和剩余 proof gaps
- affected location 和 component
- product surface 和 source trust level
- recommended next step
- 当发现项为 `confirmed` 时的 [`$codex-security:fix-finding`](/mirror/codex/security/plugin/fix-findings) handoff

当每个提供的发现项都有一个结果、Codex 保留其 source identifier，并且任何不确定性都被明确写出时，triage 就完成了。Jira、Linear 和其他 backlog records 会保持不变，除非你在审查 triage 结果后要求 Codex 写回。

## 下一步

- `confirmed`：在有人接受该发现项进入 remediation 后，使用 [`$codex-security:fix-finding`](/mirror/codex/security/plugin/fix-findings) 修复并验证它。Triage 会准备一个可直接作为 prompt 使用的 handoff，但不会自动调用该 skill。
- `needs_review`：如果运行代码可以解决 proof gap，请使用 `$codex-security:validation` 执行有边界的动态验证。传入来自 triage 结果的 finding claim、affected locations、preconditions、static evidence 和 proof gaps：

```text
  Use $codex-security:validation to dynamically validate finding [triage item ID or source ID] from the backlog triage result. Use the strongest realistic, bounded method, record exactly what was tested, and preserve any remaining proof gaps.
```

  与 triage 不同，validation 可以构建或运行代码、创建聚焦的 test 或 proof of concept，或操作真实 interface。请在批准前审查拟议命令，并保持 [Codex approval and security policies](/mirror/codex/agent-approvals-security) 生效。

- `needs_review`：如果发现项依赖产品策略或部署上下文，请在更改代码前回答列出的 open questions。
- `not_actionable`：将证据与你的 triage record 保存在一起。Codex 不会自动关闭或更新 source ticket。
- 若要查找所提供 backlog 之外的漏洞，请[运行安全扫描](/mirror/codex/security/plugin/scans)。

:::

## English source

::: details 展开英文原文
::: v-pre
Use `$codex-security:triage-finding` to review existing security findings
against the current repository. This workflow performs a read-only static
analysis: Codex treats each finding as an unproven claim and inspects repository
evidence without executing the code.

Run this workflow from a Codex project scoped to the repository you want to
assess. Codex must be able to read the repository's source code. Jira, Linear,
and GitHub connectors provide finding data, but they don't replace access to
the source code.

Under the hood, Codex starts from the cited code or version information. It
traces the claimed attacker-controlled source, relevant security controls,
dangerous sink, and reachable path. It also checks the product surface and trust
boundary, looks for counterevidence, and records proof gaps. Codex then returns
one verdict per finding and ranks the findings that need action or further
review.

This differs from `$codex-security:validation`, which can build or run code,
create a focused test or proof of concept, or exercise a real interface to
reproduce or disprove a finding. Use triage to classify and prioritize an
existing backlog. Use validation when runtime evidence could resolve a finding
that static evidence leaves uncertain.

Backlog triage starts from existing findings. To search the repository for new
  vulnerabilities, [run a security scan](/mirror/codex/security/plugin/scans). Triage
  doesn't modify the repository or implement fixes.

## Choose the findings to triage

You can supply one finding or a collection from these sources:

| Source                   | What to provide                                                                                                                                                                                                                                                                                                                                                                                                                                        | Requirements                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pasted or local findings | SARIF results, a CVE or GHSA, an advisory, a scanner ticket, a bug bounty report, a Codex Security finding artifact, or a plain-language vulnerability claim.                                                                                                                                                                                                                                                                                          | No connector required.                                                                                                                                                                           |
| Jira or Linear           | Exact security or vulnerability issue URLs or identifiers, Jira JQL, or a Linear team, project, or search phrase. Codex retrieves the selected issue content before triage.                                                                                                                                                                                                                                                                            | [Jira through Atlassian Rovo](codex://plugins/plugin_connector_692de805e3ec8191834719067174a384) or [Linear](codex://plugins/plugin_asdk_app_69a089a326dc8191b32a3f2553f5be2c) with read access. |
| GitHub                   | A repository and one finding source: code scanning, `Dependabot` vulnerabilities and malware, security advisories and private vulnerability reports, or all sources. If you don't specify a repository, Codex uses the GitHub repository attached to the current Codex project when available. GitHub Issues aren't included in the default GitHub sources; provide a specific issue or ask for GitHub Issues explicitly when you want to triage them. | [GitHub](codex://plugins/plugin_connector_1p_1a69035c238881919c4190932b2df699) with access to the selected repository and finding type.                                                          |

Codex keeps one result for every supplied finding, in input order, so each
source finding stays traceable. It doesn't merge or drop findings that look
like duplicates.

## Run read-only triage

For pasted findings or local artifacts, send a prompt like:

```text
Use $codex-security:triage-finding to triage these existing security findings against this repository:

[Paste the findings or provide the artifact path.]
```

For Jira or Linear issues, identify the issue set and keep the source system
read-only:

```text
Use $codex-security:triage-finding to import and triage the security findings from [Jira or Linear issue URLs, identifiers, or query] against this repository.
Do not change the source issues.
```

For GitHub findings, name the repository and source:

```text
Use $codex-security:triage-finding to import and triage [code scanning, Dependabot vulnerabilities and malware, security advisories and private vulnerability reports, or all] from [owner/repository] against this repository.
```

To use the GitHub repository attached to the current Codex project, specify
only the finding source:

```text
Use $codex-security:triage-finding to import and triage [code scanning, Dependabot vulnerabilities and malware, security advisories and private vulnerability reports, or all] from GitHub against this repository. Use the GitHub repository attached to the current Codex project.
```

The workflow proceeds in this order:



1. Collect and organize the findings

   Codex retrieves any requested issue or GitHub content, preserves source
   identifiers and references, and creates one triage item per input. It builds
   the complete item list before assigning verdicts.

2. Confirm the repository context

   Codex resolves the current repository and revision when available. It reads
   `SECURITY.md` when present so supported versions, trusted inputs, product
   boundaries, and out-of-scope surfaces inform the assessment.

3. Inspect the static evidence

   For each finding, Codex traces the claimed attacker-controlled source,
   relevant security control, vulnerable sink, reachable path, and supported
   security boundary. It records supporting evidence, evidence against the
   claim, and proof gaps.

4. Assign verdicts and ranks

   Codex assigns a verdict and confidence to every finding. It ranks
   `confirmed` and `needs_review` findings by exploitability in separate queues.



## Review the results

| Verdict          | What it means                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `confirmed`      | Repository evidence shows that the vulnerable path is reachable under the stated preconditions and crosses a supported security boundary.                     |
| `not_actionable` | Repository evidence rules out the claim, such as by showing an unaffected version, unreachable path, effective guard, or non-shipped surface.                 |
| `needs_review`   | Repository evidence isn't enough to decide because required information is missing, ambiguous, runtime-dependent, environment-dependent, or policy-dependent. |

Exploitability ranks use positive integers starting at `1`, independently
  within each verdict queue. This keeps remediation priorities separate from
  unresolved review work. Rank `1` is the most exploitable `confirmed` finding
  or the highest-priority `needs_review` finding in that result set. The rank
  isn't a scanner severity score, and `not_actionable` findings aren't ranked.

For each finding, review:

- the rationale for the verdict and rank
- supporting evidence and evidence against the claim
- open questions and remaining proof gaps
- the affected location and component
- the product surface and source trust level
- the recommended next step
- the [`$codex-security:fix-finding`](/mirror/codex/security/plugin/fix-findings)
  handoff, when the finding is `confirmed`

Triage is complete when every supplied finding has one result, Codex preserves
its source identifier, and any uncertainty is explicit. Jira, Linear, and other
backlog records remain unchanged unless you ask Codex to write back after
reviewing the triage results.

## Next steps

- `confirmed`: After a person accepts the finding for remediation, use
  [`$codex-security:fix-finding`](/mirror/codex/security/plugin/fix-findings) to fix and
  verify it. Triage prepares a prompt-ready handoff but doesn't invoke the skill
  automatically.
- `needs_review`: If running code can resolve the proof gap, use
  `$codex-security:validation` to perform bounded dynamic validation. Pass
  the finding claim, affected locations, preconditions, static evidence, and
  proof gaps from the triage result:

```text
  Use $codex-security:validation to dynamically validate finding [triage item ID or source ID] from the backlog triage result. Use the strongest realistic, bounded method, record exactly what was tested, and preserve any remaining proof gaps.
```

  Unlike triage, validation may build or run code, create a focused test or
  proof of concept, or exercise a real interface. Review the proposed commands
  before approving them and keep [Codex approval and security policies](/mirror/codex/agent-approvals-security) in place.

- `needs_review`: If the finding depends on product policy or deployment
  context, answer the listed open questions before changing code.
- `not_actionable`: Keep the evidence with your triage record. Codex doesn't
  automatically close or update the source ticket.
- To look for vulnerabilities beyond the supplied backlog, [run a security scan](/mirror/codex/security/plugin/scans).

:::
:::

