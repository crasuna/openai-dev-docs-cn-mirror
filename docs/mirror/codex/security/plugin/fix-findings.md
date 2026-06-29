---
title: "修复并验证安全发现项"
description: "Turn accepted findings into minimal patches with focused regression evidence."
outline: deep
---

# 修复并验证安全发现项

**文档集**：Codex 编码智能体<br>
**分组**：Codex — Security 安全<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/security/plugin/fix-findings](https://developers.openai.com/codex/security/plugin/fix-findings)
- Markdown 来源：[https://developers.openai.com/codex/security/plugin/fix-findings.md](https://developers.openai.com/codex/security/plugin/fix-findings.md)
- 抓取时间：2026-06-27T05:55:08.036Z
- Checksum：`d0a3cd0615c16a9c3c70c25007c6514df1bcff0e0408cdef606f86213b0b8811`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex Security 可以帮助你把已接受发现项的 backlog 转化为经过测试的代码变更。你可以在 findings workspace UI 中修复发现项，也可以从 prompt、command line 或 CI/CD 调用 remediation 工作流。无论哪种方式，Codex 都会验证问题、提出聚焦的 patch、添加回归覆盖，并验证合法行为仍然正常工作。

先修复一个已接受发现项，以便评估 patch 和验证质量。当该工作流达到你的标准后，再通过把每个发现项放入单独任务或 CI/CD job 的方式，扩展到更多已接受发现项。保持每个修复都有明确范围，可以让代码变更和证据更容易审查。

## 在 UI 中修复发现项

在 findings workspace 中打开一个已接受发现项，生成、审查、应用并验证它的 patch。



1. 生成聚焦的 patch

   打开发现项，选择 **Patch** tab，然后选择 **Generate patch**。Codex 会在可行时验证或复现问题，并写入 patch artifact，而不会修改选定的 checkout。

2. 审查建议 diff

   阅读每个变更过的 source 和 regression-test 文件。当你想在 editor 中查看完整 patch 时，使用 **Open diff in editor**。拒绝宽泛重构、无关清理，或会削弱其他安全控制的变更。

3. 在本地应用 patch

   只有在 diff 可接受后才选择 **Apply patch locally**。Codex 会把确切生成的 patch 应用到 working tree，并记录该状态。继续前请审查 working-tree diff。

4. 验证修复

   选择 **Verify fix**。Codex 会重新运行原始 reproducer 或最强可用 exploit check、聚焦的 regression coverage、legitimate-behavior checks、附近 bypass checks，以及相关 repository tests。

5. 有意地关闭发现项

   验证不会自动关闭发现项。请审查 commands、results 和剩余 proof gap，然后用准确原因关闭发现项，或保持打开以继续处理。





    &lt;img
      src={fixFindingPatch.src}
      alt="针对已接受发现项的 Codex Security 建议 patch"
      className="block h-auto w-full"
    /&gt;


    在本地应用 patch 前，审查建议的 source 和 test 变更。



## 从 CLI 修复发现项

当你已经从扫描、ticket、advisory、disclosure、安全评估或内部审查中获得发现项时，可以使用 Codex CLI：

下面的命令假设 Codex Security 已安装在 `codex exec` 使用的 `CODEX_HOME` 中。全新的 CI runner 默认没有安装 marketplace plugins。

```text
Use $codex-security:fix-finding to fix finding <finding-id> from <report-path>. Validate the issue, make the smallest safe change, add focused regression coverage, and verify that the issue no longer reproduces.
```

请包含已知 source、sink、attacker input、impact、expected invariant、reproducer、affected files 和 validation command。Codex 可以检查 repository 以补充缺失的技术细节，但在猜测产品策略或预期 security invariant 前应先询问。

对于自动化运行，请先 checkout 代码、提供 finding report，并在该 `CODEX_HOME` 中配置 plugin，然后把 prompt 传给 `codex exec`：

```bash
codex exec 'Use $codex-security:fix-finding to fix finding <finding-id> from <report-path>. Validate the issue, make the smallest safe change, add focused regression coverage, and verify that the issue no longer reproduces.'
```

## 在 CI/CD 中扫描并修复发现项

在调用这些 skills 前，请在 runner 的 `CODEX_HOME` 中配置 Codex Security。下面的命令会使用已安装的 plugin；它本身不会安装 plugin。

在 CI/CD 中，使用一次 Codex run 扫描 diff，并为它发现的每个发现项生成修复。该 job 不需要 finding IDs 或 report paths 作为输入。Codex 会在同一次运行中把扫描得到的发现项带入 remediation。

all-in-one run 应该：

1. 解析变更的 base 和 head revisions。
2. 针对该 diff 运行 `$codex-security:security-diff-scan`。
3. 对扫描返回的每个发现项调用 `$codex-security:fix-finding`。
4. 生成聚焦 patches 和 regression coverage，然后验证每个修复。
5. 返回扫描结果、patches、tests、verification commands，以及任何无法修复的发现项。

例如：

```bash
codex exec 'Use $codex-security:security-diff-scan to review changes from <base-revision> to HEAD. For every finding returned by the scan, use $codex-security:fix-finding to generate and verify a minimal fix. Continue until every finding has either a verified fix or an explicit explanation of why it could not be fixed. Return the scan results, patches, tests, verification commands, and remaining failures.'
```

验证后，通过你的常规 code-review 和 release process 合并 patch。若要在 remediation 前把发现项交接给另一个团队，请参见 [Export or track findings](/mirror/codex/security/plugin/export-findings)。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Codex Security helps you turn a backlog of accepted findings into tested code
changes. You can fix findings in the findings workspace UI or invoke the
remediation workflow from a prompt, the command line, or CI/CD. In each case,
Codex validates the issue, proposes a focused patch, adds regression coverage,
and verifies that legitimate behavior still works.

Start by fixing one accepted finding so you can evaluate the patch and
verification quality. Once the workflow meets your standards, scale it across
more accepted findings by processing each finding in a separate task or CI/CD
job. Keeping each fix scoped makes the code changes and evidence easier to
review.

## Fix a finding in the UI

Open an accepted finding in the findings workspace to generate, review, apply,
and verify its patch.

<WorkflowSteps variant="headings">

1. Generate a focused patch

   Open the finding, select the **Patch** tab, and select **Generate patch**.
   Codex validates or reproduces the issue when feasible and writes a patch
   artifact without modifying the selected checkout.

2. Review the proposed diff

   Read every changed source and regression-test file. Use **Open diff in
   editor** when you want the full patch in the editor. Reject broad refactors,
   unrelated cleanup, or changes that weaken another security control.

3. Apply the patch locally

   Select **Apply patch locally** only after the diff is acceptable. Codex
   applies the exact generated patch to the working tree and records that state.
   Review the working-tree diff before continuing.

4. Verify the fix

   Select **Verify fix**. Codex reruns the original reproducer or strongest
   available exploit check, focused regression coverage, legitimate-behavior
   checks, nearby bypass checks, and relevant repository tests.

5. Close the finding deliberately

   Verification doesn't automatically close a finding. Review the commands,
   results, and remaining proof gap, then close the finding with an accurate
   reason or keep it open for more work.

</WorkflowSteps>

<figure className="not-prose my-8">
  <div className="overflow-hidden rounded-xl border border-subtle bg-surface">
    <img
      src={fixFindingPatch.src}
      alt="Codex Security proposed patch for an accepted finding"
      className="block h-auto w-full"
    />
  </div>
  <figcaption className="mt-3 text-sm text-secondary">
    Review the proposed source and test changes before applying the patch
    locally.
  </figcaption>
</figure>

## Fix a finding from the CLI

Use the Codex CLI when you already have a finding from a scan, ticket, advisory,
disclosure, security assessment, or internal review:

The commands below assume Codex Security is already installed in the
`CODEX_HOME` used by `codex exec`. A fresh CI runner doesn't have marketplace
plugins installed by default.

```text
Use $codex-security:fix-finding to fix finding <finding-id> from <report-path>. Validate the issue, make the smallest safe change, add focused regression coverage, and verify that the issue no longer reproduces.
```

Include the known source, sink, attacker input, impact, expected invariant,
reproducer, affected files, and validation command. Codex can inspect the
repository for missing technical details, but it should ask before guessing a
product policy or intended security invariant.

For an automated run, pass the prompt to `codex exec` after checking out the
code, making the finding report available, and provisioning the plugin in that
`CODEX_HOME`:

```bash
codex exec 'Use $codex-security:fix-finding to fix finding <finding-id> from <report-path>. Validate the issue, make the smallest safe change, add focused regression coverage, and verify that the issue no longer reproduces.'
```

## Scan and fix findings in CI/CD

Provision Codex Security in the runner's `CODEX_HOME` before invoking these
skills. The command below uses the installed plugin; it doesn't install the
plugin itself.

In CI/CD, use one Codex run to scan the diff and generate fixes for every
finding it discovers. The job doesn't need finding IDs or report paths as
inputs. Codex carries the findings from the scan into remediation within the
same run.

The all-in-one run should:

1. Resolve the base and head revisions for the change.
2. Run `$codex-security:security-diff-scan` against that diff.
3. Invoke `$codex-security:fix-finding` for every finding returned by the scan.
4. Generate focused patches and regression coverage, then verify each fix.
5. Return the scan results, patches, tests, verification commands, and any
   finding it couldn't fix.

For example:

```bash
codex exec 'Use $codex-security:security-diff-scan to review changes from <base-revision> to HEAD. For every finding returned by the scan, use $codex-security:fix-finding to generate and verify a minimal fix. Continue until every finding has either a verified fix or an explicit explanation of why it could not be fixed. Return the scan results, patches, tests, verification commands, and remaining failures.'
```

After verification, merge the patch through your normal code-review and release
process. To hand findings to another team before remediation, see [Export or
track findings](https://developers.openai.com/codex/security/plugin/export-findings).
``````
:::
:::

