---
status: needs-review
sourceId: "20f274ce684f"
sourceChecksum: "20f274ce684f810c85ff4517c889bc2f2bb722b2a54f3bb4c66810b6dd83c2e8"
sourceUrl: "https://developers.openai.com/codex/security/plugin/scans"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# 运行 Codex Security 扫描

第一次审查以及大多数常规 repository 或 component 评估，都可以使用 Codex Security scan。它会完整运行一次扫描工作流。

当你对结果满意后，可以运行[深度扫描](https://developers.openai.com/codex/security/plugin/deep-scans)进行更全面的评估。深度扫描耗时更长，但更彻底。

## 选择扫描区域

当你需要广泛覆盖，并且 repository 是一个合理的审查单位时，扫描整个 repository：

```text
Use $codex-security:security-scan to scan this repository for security vulnerabilities.
```

当 monorepo 太大，或某个服务、package 或 component 有清晰 owner 和安全边界时，扫描一个文件夹：

```text
Use $codex-security:security-scan to scan this repository for security vulnerabilities, focusing on the services/billing component.
```

对于大型 monorepo，请先从一个有意义的产品或服务边界开始。

## 配置扫描

<WorkflowSteps>

1. 确认 **Scan type** 是 `Codebase`，并保持 **Deep scan** 关闭。
2. 确认 **Codebase**、**Current branch** 和 **Last commit**。
3. 将 **Scan area** 设为 `Entire codebase`，或输入一个 repository-relative folder。
4. 只有当 threat-model guidance 会改变审查时才添加它。有用的 guidance 会指明 attacker-controlled inputs、trust boundaries、sensitive actions，或要优先处理的具体区域。
5. 选择 **Start scan**。

</WorkflowSteps>

`AGENTS.md` 中的 repository-specific guidance 也可以建立产品 surfaces、trust boundaries、支持的 validation commands，以及 out-of-scope areas。扫描前，相比通用 planning step，更应优先使用具体 repository context。

## 等待各阶段完成

扫描会按顺序运行这些阶段：

1. **Threat modeling** 识别 assets、entry points、trust boundaries 和 security invariants。
2. **Finding discovery** 审查请求的代码，寻找可信的 broken controls 和 source-to-sink paths。
3. **Validation** 测试或以其他方式检查每个 candidate，并记录 evidence 或 proof gaps。
4. **Attack-path analysis** 评估实际可达性、影响和 severity。
5. **Finalization** 验证结构化扫描 contract 并生成 `report.md`。

扫描运行时，Codex 会报告阶段和覆盖进度。不要根据早期 candidates 判断结果，也不要因为某个阶段比另一个阶段耗时更久就停止扫描。

## 审查已完成扫描

按这个顺序审查结果：

1. 确认 target、revision 和 scan area。
2. 阅读 reviewed surfaces，以及每个明确 deferred 或 follow-up area。
3. 对每个发现项，检查 root control 或 sink、attacker-controlled input、validation method、remaining uncertainty、realistic reachability、severity rationale 和 proposed remediation。
4. 对于 evidence 不支持所声称 path 或 impact 的发现项，将其 dismiss。
5. 在开始修复前，先选择一个已接受发现项。

<div className="not-prose my-8 grid gap-6">
  <figure>
    <div className="overflow-hidden rounded-xl border border-subtle bg-surface">
      <img
        src={findingsWorkspace.src}
        alt="OWASP Juice Shop 的已完成 Codex Security findings workspace"
        className="block h-auto w-full"
      />
    </div>
    <figcaption className="mt-3 text-sm text-secondary">
      已完成的 workspace 会在列出发现项前，总结 scan status、coverage、
      severity 和 artifacts。
    </figcaption>
  </figure>

  <figure>
    <div className="overflow-hidden rounded-xl border border-subtle bg-surface">
      <img
        src={findingAttackPath.src}
        alt="OWASP Juice Shop 的 Codex Security 发现项证据和 attack-path analysis"
        className="block h-auto w-full"
      />
    </div>
    <figcaption className="mt-3 text-sm text-secondary">
      发现项会把相关 source 与其 entry point、reachability、likelihood、
      impact，以及任何限制或反证连接起来。
    </figcaption>
  </figure>
</div>

## 使用结果

使用 findings workspace 进行常规审查。它会呈现发现项、覆盖范围和 follow-up areas，而不需要你检查原始 JSON。当你需要用于分享或归档的完整可移植审查时，打开 `report.md`。

在 workspace 背后，每次扫描都会保留 `scan-manifest.json`、`findings.json` 和 `coverage.json`，用于自动化和集成。通常你不需要自己打开这些文件。

findings workspace 也可以创建可移植的 JSON、CSV 和 SARIF 文件。参见 [Export or track findings](https://developers.openai.com/codex/security/plugin/export-findings)。

## 下一步

在有人接受一个发现项后，使用 [Fix and verify a finding](https://developers.openai.com/codex/security/plugin/fix-findings) 生成并审查一个有边界的 patch。不要要求 Codex 在一个任务中修复扫描得到的每个发现项。

