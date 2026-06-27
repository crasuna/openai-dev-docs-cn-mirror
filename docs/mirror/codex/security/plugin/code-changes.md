---
title: "Review code changes for security"
description: "Review pull requests and local changes for security regressions manually or in CI/CD."
outline: deep
---

# Review code changes for security

**文档集**：Codex  
**分组**：Codex — Security  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/security/plugin/code-changes](https://developers.openai.com/codex/security/plugin/code-changes)
- Markdown 来源：[https://developers.openai.com/codex/security/plugin/code-changes.md](https://developers.openai.com/codex/security/plugin/code-changes.md)
- 抓取时间：2026-06-27T05:55:08.394Z
- Checksum：`da57fec212953b02228c73bf8f6bc20fea5a665213ab6258f508000577c1c2ac`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
当你需要了解一个由 Git 支持的变更集引入了哪些回归风险时，使用安全变更审查。该工作流会审查每个变更过的 source-like 文件和直接支持代码，而不会把任务变成通用 repository audit。

如果你想扫描完整 repository，而不是特定变更，请参见 [Run a security scan](/mirror/codex/security/plugin/scans)。

## 运行手动审查

对于未提交变更，发送：

```text
Use $codex-security:security-diff-scan to review my current uncommitted changes for security regressions.
```

对于 commit 或 branch 范围，请在需要时标识两端：

```text
Use $codex-security:security-diff-scan to review the changes from origin/main to HEAD for security regressions. Focus on authentication, authorization, input handling, filesystem access, network requests, and secrets.
```

当 base 和 head revisions 在本地 checkout 中可用时，你也可以指定 pull request。

## 在 setup 中确认变更



1. 确认 **Scan type** 是 `Changes`。
2. 确认 checked-out **Codebase**、**Current branch** 和 **Last commit**。
3. 在 **Changes to review** 下选择：
   - 当前 working tree 选择 `Uncommitted changes`。
   - 单 commit 审查选择最新 commit。
   - branch 或 pull-request 范围选择 base 和 head revision。
4. 确认 summary 描述的是你想审查的变更。
5. 选择 **Start scan**。



该工作流不会 checkout 另一个 branch，也不会更改选定的 working tree。如果请求的 revision 在本地不可用，请在审查前 fetch 它，或提供本地可用的 base 和 head。

## 处理发现项

审查结果后，[修复并验证已接受发现项](/mirror/codex/security/plugin/fix-findings)，或[导出并跟踪发现项](/mirror/codex/security/plugin/export-findings)。

## 在 CI/CD 中自动化审查

当 runner 可以无交互调用 Codex CLI 时，在 CI 中运行同一个 `$codex-security:security-diff-scan` skill。runner 必须已经在 `codex exec` 使用的 `CODEX_HOME` 中安装 Codex Security。全新的 runner 默认没有安装 marketplace plugins，并且 `openai/codex-action` 不会安装该 plugin。

运行扫描前：

1. 在 runner 的 `CODEX_HOME` 中配置 Codex Security。
2. checkout 准确的 base 和 head revisions 以及它们的 Git history。
3. 将 runner 的平台临时目录（例如 `TMPDIR`）设置为可写 artifact 位置。diff-scan 工作流会审查 checkout 而不更改它，但会把已封存扫描 bundle 和最终报告写到 repository 之外。
4. 从 advisory results 开始。在把 job 设为 required check 前，先审查扫描质量和运行时间。

然后显式调用 plugin：

```bash
export CODEX_HOME=/path/to/provisioned-codex-home
export TMPDIR=/path/to/writable/temp

codex exec \
  --sandbox workspace-write \
  --output-last-message "$TMPDIR/codex-security-review.md" \
  'Use $codex-security:security-diff-scan to review changes from <base-revision> to <head-revision> for security regressions. Do not modify the checkout. Return the final report path, findings summary, reviewed surfaces, deferred coverage, and open questions.'
```

归档生成的 scan bundle 和最终报告，然后通过你的 CI/CD system 发布 Markdown summary。如果使用 `openai/codex-action`，请把它的 `codex-home` input 指向同一个已配置目录，并传入上面的 skill prompt。该 action 可以安装并运行 Codex CLI，但 plugin provisioning 是单独的前提条件。

关于 API-key handling、sandbox controls、fork protections 和 GitHub Actions workflow，请参见 [Codex GitHub Action guide](/mirror/codex/github-action)。

:::

## English source

::: details 展开英文原文
::: v-pre
Use a security change review when you need evidence about regressions introduced
by one Git-backed change set. The workflow reviews every changed source-like
file and directly supporting code without turning the task into a general
repository audit.

If you want to scan a full repository instead of a specific change, see [Run a security scan](/mirror/codex/security/plugin/scans).

## Run a manual review

For uncommitted changes, send:

```text
Use $codex-security:security-diff-scan to review my current uncommitted changes for security regressions.
```

For a commit or branch range, identify both ends when needed:

```text
Use $codex-security:security-diff-scan to review the changes from origin/main to HEAD for security regressions. Focus on authentication, authorization, input handling, filesystem access, network requests, and secrets.
```

You can also name a pull request when its base and head revisions are available
in the local checkout.

## Confirm the change in setup



1. Confirm **Scan type** is `Changes`.
2. Confirm the checked-out **Codebase**, **Current branch**, and **Last commit**.
3. Under **Changes to review**, choose:
   - `Uncommitted changes` for the current working tree.
   - The latest commit for a single-commit review.
   - A base and head revision for a branch or pull-request range.
4. Confirm that the summary describes the change you intended to review.
5. Select **Start scan**.



The workflow doesn't check out another branch or change the selected working
tree. If a requested revision isn't available locally, fetch it before the
review or provide a locally available base and head.

## Act on findings

After reviewing the results, [fix and verify an accepted finding](/mirror/codex/security/plugin/fix-findings) or [export and track findings](/mirror/codex/security/plugin/export-findings).

## Automate reviews in CI/CD

Run the same `$codex-security:security-diff-scan` skill from CI when the runner
can invoke the Codex CLI without interaction. The runner must already have
Codex Security installed in the `CODEX_HOME` used by `codex exec`. A fresh
runner doesn't have marketplace plugins installed by default, and
`openai/codex-action` doesn't install the plugin.

Before running the scan:

1. Provision Codex Security in the runner's `CODEX_HOME`.
2. Check out the exact base and head revisions with their Git history.
3. Set the runner's platform temporary directory, such as `TMPDIR`, to a
   writable artifact location. The diff-scan workflow reviews the checkout
   without changing it, but it writes its sealed scan bundle and final report
   outside the repository.
4. Start with advisory results. Review scan quality and runtime before making
   the job a required check.

Then invoke the plugin explicitly:

```bash
export CODEX_HOME=/path/to/provisioned-codex-home
export TMPDIR=/path/to/writable/temp

codex exec \
  --sandbox workspace-write \
  --output-last-message "$TMPDIR/codex-security-review.md" \
  'Use $codex-security:security-diff-scan to review changes from <base-revision> to <head-revision> for security regressions. Do not modify the checkout. Return the final report path, findings summary, reviewed surfaces, deferred coverage, and open questions.'
```

Archive the generated scan bundle and final report, then publish the Markdown
summary through your CI/CD system. If you use `openai/codex-action`, point its
`codex-home` input at the same provisioned directory and pass the skill prompt
above. The action can install and run the Codex CLI, but plugin provisioning is
a separate prerequisite.

For API-key handling, sandbox controls, fork protections, and a GitHub Actions
workflow, see the [Codex GitHub Action guide](/mirror/codex/github-action).

:::
:::

