---
status: needs-review
sourceId: "6f4dfe7a127d"
sourceChecksum: "6f4dfe7a127da0253714033242d6b7bc4a26b2ad1e56261123468d6758e413ab"
sourceUrl: "https://developers.openai.com/codex/security/plugin/deep-scans"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# 运行深度安全扫描

深度扫描比标准扫描更慢，但更彻底。当你希望减少变异性并进行更全面搜索时，请使用它。

先从[标准扫描](https://developers.openai.com/codex/security/plugin/scans)开始。当你对结果满意后，再运行深度扫描进行更彻底的评估。

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

<WorkflowSteps>

1. 确认 **Scan type** 是 `Codebase`，并且 **Deep scan** 已开启。
2. 确认 **Codebase** 是你想扫描的 repository 或确切文件夹。
3. 只有针对具体攻击向量、敏感应用区域，或代码无法揭示的 repository context，才添加 threat-model guidance。
4. 选择 **Start scan**。
5. 审查 capability preflight。如果它提出配置变更，请审查确切变更，并且只有在它符合你的环境时才让 Codex 应用它。如果 Codex 告诉你需要重启，请启动一个新 thread。

</WorkflowSteps>

<VideoPlayer
  src="/videos/codex/security/deep-scan-progress.mp4"
  poster="/videos/codex/security/deep-scan-progress-poster.webp"
/>

## 审查结果

深度扫描使用与标准扫描相同的 findings workspace 和生成的 `report.md`。请先审查 coverage summary，再看发现项。深度扫描会更广泛地搜索代码，但任何 deferred surface 或 proof gap 仍会限制结论。对于你接受的发现项，继续使用 [Fix and verify a finding](https://developers.openai.com/codex/security/plugin/fix-findings)。

若要审查 pull request、commit、branch 范围或本地 patch，请使用 [Review code changes](https://developers.openai.com/codex/security/plugin/code-changes)。深度扫描永远不能替代专注于 diff 的工作流。

