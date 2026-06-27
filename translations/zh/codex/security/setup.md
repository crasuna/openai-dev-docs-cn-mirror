---
status: needs-review
sourceId: "528736050e71"
sourceChecksum: "528736050e7144aea5a9e3022d77cc0f76c6d0a813c3089aa35a194f2e0b3a3c"
sourceUrl: "https://developers.openai.com/codex/security/setup"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# Codex Security setup

本页会带你在 Codex Security 中从初始访问走到已审查的发现项和修复 pull requests。

先确认你已经设置 Codex Cloud。如果还没有，请参见 [Codex Cloud](https://developers.openai.com/codex/cloud) 开始使用。

## 1. 访问权限和环境

Codex Security 会扫描通过 [Codex Cloud](https://developers.openai.com/codex/cloud) 连接的 GitHub repositories。

- 确认你的 workspace 具有 Codex Security 访问权限。
- 确认你想扫描的 repository 可在 Codex Cloud 中使用。

前往 [Codex environments](https://chatgpt.com/codex/settings/environments)，检查该 repository 是否已经有 environment。如果没有，请在继续前先在那里创建一个。

<CtaPillLink
  href="https://chatgpt.com/codex/settings/environments"
  label="打开 environments"
  icon="external"
  class="my-8"
/>

<div class="not-prose my-8 max-w-6xl overflow-hidden rounded-xl border border-subtle bg-surface">
  <img
    src={createEnvironment.src}
    alt="Codex environments"
    class="block h-auto w-full"
  />
</div>

## 2. 新建安全扫描

environment 存在后，前往 [Create a security scan](https://chatgpt.com/codex/security/scans/new)，选择你刚连接的 repository。

<CtaPillLink
  href="https://chatgpt.com/codex/security/scans/new"
  label="创建安全扫描"
  icon="external"
  class="my-8"
/>

Codex Security 会先从最新 commits 向后扫描 repositories。它会利用这一点，在新 commits 进入时构建并刷新扫描上下文。

要配置一个 repository：

1. 选择 GitHub organization。
2. 选择 repository。
3. 选择你想扫描的 branch。
4. 选择 environment。
5. 选择一个 **history window**。较长的窗口会提供更多上下文，但 backfill 需要更长时间。
6. 点击 **Create**。

<div class="not-prose my-8 max-w-6xl overflow-hidden rounded-xl border border-subtle bg-surface">
  <img
    src={createScan.src}
    alt="创建安全扫描"
    class="block h-auto w-full"
  />
</div>

## 3. 初始扫描可能需要一段时间

创建扫描后，Codex Security 会先在选定的 history window 中运行一次 commit-level security pass。
初始 backfill 可能需要几个小时，尤其是对于较大的 repositories 或较长的窗口。
如果发现项没有立刻显示，这是预期行为。请等待初始扫描完成，再创建工单或排查问题。

初始扫描设置是自动且全面的。这可能需要几个小时。如果第一批发现项延迟出现，请不必担心。

## 4. 审查扫描并改进 threat model

<CtaPillLink
  href="https://chatgpt.com/codex/security/scans"
  label="审查扫描"
  icon="external"
  class="my-8"
/>

<div class="not-prose my-8 max-w-6xl overflow-hidden rounded-xl border border-subtle bg-surface">
  <img
    src={reviewThreatModel.src}
    alt="Codex Security 中的 Threat model editor"
    class="block h-auto w-full"
  />
</div>

初始扫描完成后，打开扫描并审查生成的 threat model。
初始发现项出现后，更新 threat model，让它与你的架构、信任边界和业务上下文匹配。
这有助于 Codex Security 为你的团队排序问题。

如果你希望扫描结果发生变化，可以用更新后的范围、优先级和假设编辑 threat model。

初始发现项出现后，请重新查看该模型，让扫描 guidance 与当前优先级保持一致。
保持它的最新状态有助于 Codex Security 生成更好的建议。

关于 threat models 以及它们如何影响 criticality 和 triage 的更深入解释，请参见 [Improving the threat model](https://developers.openai.com/codex/security/threat-model)。

## 5. 审查发现项并修复

初始 backfill 完成后，从 **Findings** view 审查发现项。

<CtaPillLink
  href="https://chatgpt.com/codex/security/findings"
  label="打开 findings"
  icon="external"
  class="my-8"
/>

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

<CtaPillLink
  href="https://chatgpt.com/codex/security/findings"
  label="审查发现项并创建 PR"
  icon="external"
  class="my-8"
/>

## 相关文档

- [Codex Security](https://developers.openai.com/codex/security) 提供产品概览。
- [FAQ](https://developers.openai.com/codex/security/faq) 覆盖常见问题。
- [Improving the threat model](https://developers.openai.com/codex/security/threat-model) 解释如何改进扫描上下文和发现项优先级。

