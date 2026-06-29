---
title: "运行深度安全扫描"
description: "Run a slower, more thorough review of a repository or scoped folder."
outline: deep
---

# 运行深度安全扫描

**文档集**：Codex  
**分组**：Codex — Security  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/security/plugin/deep-scans](https://developers.openai.com/codex/security/plugin/deep-scans)
- Markdown 来源：[https://developers.openai.com/codex/security/plugin/deep-scans.md](https://developers.openai.com/codex/security/plugin/deep-scans.md)
- 抓取时间：2026-06-27T05:55:07.495Z
- Checksum：`6f4dfe7a127da0253714033242d6b7bc4a26b2ad1e56261123468d6758e413ab`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
深度扫描比标准扫描更慢，但更彻底。当你希望减少变异性并进行更全面搜索时，请使用它。

先从[标准扫描](/mirror/codex/security/plugin/scans)开始。当你对结果满意后，再运行深度扫描进行更彻底的评估。

## 在标准扫描和深度扫描之间选择

|                         | 标准扫描                                           | 深度扫描                                      |
| ----------------------- | -------------------------------------------------- | --------------------------------------------- |
| 最适合                  | 首次运行以及常规 repository 或文件夹审查           | 标准扫描之后更彻底的审查                      |
| 变异性                  | 标准                                               | 更低                                          |
| 范围                    | Repository 或明确文件夹                            | Repository 或明确文件夹                       |
| 运行时间和资源          | 更低                                               | 更高                                          |
| Pull requests 和 diffs  | 使用变更审查工作流                                 | 不支持；改用变更审查工作流                    |

## 开始深度扫描

对于 repository-wide 审查，发送：

```text
Use $codex-security:deep-security-scan to run a deep security scan of this repository.
```

对于 monorepo 中的一个 component，请明确指定文件夹：

```text
Use $codex-security:deep-security-scan to run a deep security scan of /absolute/path/to/repository/services/payments.
```

在 Codex app 中，scoped deep scan 会把选定文件夹解析为 **Codebase**，并将其 scan area 显示为整个选定目标。

## 确认 setup 和 preflight



1. 确认 **Scan type** 是 `Codebase`，并且 **Deep scan** 已开启。
2. 确认 **Codebase** 是你想扫描的 repository 或确切文件夹。
3. 只有针对具体攻击向量、敏感应用区域，或代码无法揭示的 repository context，才添加 threat-model guidance。
4. 选择 **Start scan**。
5. 审查 capability preflight。如果它提出配置变更，请审查确切变更，并且只有在它符合你的环境时才让 Codex 应用它。如果 Codex 告诉你需要重启，请启动一个新 thread。



&lt;VideoPlayer
  src="/videos/codex/security/deep-scan-progress.mp4"
  poster="/videos/codex/security/deep-scan-progress-poster.webp"
/&gt;

## 审查结果

深度扫描使用与标准扫描相同的 findings workspace 和生成的 `report.md`。请先审查 coverage summary，再看发现项。深度扫描会更广泛地搜索代码，但任何 deferred surface 或 proof gap 仍会限制结论。对于你接受的发现项，继续使用 [Fix and verify a finding](/mirror/codex/security/plugin/fix-findings)。

若要审查 pull request、commit、branch 范围或本地 patch，请使用 [Review code changes](/mirror/codex/security/plugin/code-changes)。深度扫描永远不能替代专注于 diff 的工作流。

:::

## English source

::: details 展开英文原文
::: v-pre
A deep scan is slower but more thorough than a standard scan. Use it when you
want to reduce variability and search more comprehensively.

Start with a [standard scan](/mirror/codex/security/plugin/scans). Once you're
satisfied with the results, run a deep scan for a more thorough assessment.

## Choose between standard and deep scans

|                         | Standard scan                                      | Deep scan                                             |
| ----------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| Best for                | First runs and routine repository or folder review | More thorough reviews after a standard scan           |
| Variability             | Standard                                           | Reduced                                               |
| Scope                   | Repository or explicit folder                      | Repository or explicit folder                         |
| Runtime and resources   | Lower                                              | Higher                                                |
| Pull requests and diffs | Use the change-review workflow                     | Not supported; use the change-review workflow instead |

## Start the deep scan

For a repository-wide review, send:

```text
Use $codex-security:deep-security-scan to run a deep security scan of this repository.
```

For one component in a monorepo, identify the folder explicitly:

```text
Use $codex-security:deep-security-scan to run a deep security scan of /absolute/path/to/repository/services/payments.
```

In the Codex app, a scoped deep scan resolves the selected folder as the
**Codebase** and shows its scan area as the entire selected target.

## Confirm setup and preflight



1. Confirm **Scan type** is `Codebase` and **Deep scan** is on.
2. Confirm that **Codebase** is the repository or exact folder you intended to
   scan.
3. Add threat-model guidance only for concrete attack vectors, sensitive
   application areas, or repository context that the code can't reveal.
4. Select **Start scan**.
5. Review the capability preflight. If it proposes a configuration change,
   review the exact change and let Codex apply it only if it matches your
   environment. Start a new thread if Codex tells you a restart is required.



&lt;VideoPlayer
  src="/videos/codex/security/deep-scan-progress.mp4"
  poster="/videos/codex/security/deep-scan-progress-poster.webp"
/&gt;

## Review the result

Deep scans use the same findings workspace and generated `report.md` as standard
scans. Review the coverage summary before the findings. A deep scan searches
the code more extensively, but any deferred surface or proof gap still limits
the conclusion. For a finding you accept, continue with [Fix and verify a finding](/mirror/codex/security/plugin/fix-findings).

To review a pull request, commit, branch range, or local patch, use [Review code changes](/mirror/codex/security/plugin/code-changes). A deep scan never substitutes
for the diff-focused workflow.

:::
:::

