---
status: needs-review
sourceId: "4cc0827239c6"
sourceChecksum: "4cc0827239c67dabc95841709827e06e96b5af491857629a1a8f5fe0444c00a2"
sourceUrl: "https://developers.openai.com/codex/security/threat-model"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# 改进 threat model

了解什么是 threat model，以及编辑它如何改进 Codex Security 的建议。

## threat model 是什么

threat model 是对你的 repository 如何工作的简短安全摘要。在 Codex Security 中，你会以 `project overview` 的形式编辑它，系统会把它作为未来扫描、优先级排序和审查的扫描上下文。

Codex Security 会从代码创建第一版草稿。如果发现项看起来不准确，这就是应该首先编辑的内容。

有用的 threat model 会指出：

- entry points 和不受信任的 inputs
- trust boundaries 和 auth assumptions
- 敏感数据路径或特权操作
- 你的团队希望优先审查的区域

例如：

> Public API for account changes. Accepts JSON requests and file uploads. Uses an internal auth service for identity checks and writes billing changes through an internal service. Focus review on auth checks, upload parsing, and service-to-service trust boundaries.

这会为未来扫描和发现项优先级排序提供更好的起点。

## 改进并重新查看 threat model

如果你想改进结果，请先编辑 threat model。当发现项遗漏你关心的区域，或出现在你意料之外的位置时，可以使用它。threat model 会改变未来扫描上下文。

一些用户会把当前 threat model 复制到 Codex 中，根据他们希望更仔细审查的区域进行对话改进，然后把更新后的版本粘贴回 web UI。

### 在哪里编辑

要审查或更新 threat model，请前往 [Codex Security scans](https://chatgpt.com/codex/security/scans)，打开 repository，然后点击 **Edit**。

## 相关文档

- [Codex Security setup](https://developers.openai.com/codex/security/setup) 覆盖 repository 设置和发现项审查。
- [Codex Security](https://developers.openai.com/codex/security) 提供产品概览。
- [FAQ](https://developers.openai.com/codex/security/faq) 覆盖常见问题。

