---
status: needs-review
sourceId: "712f5a679199"
sourceChecksum: "712f5a6791993c702d0c4188de3d19e9ddebd2b886dde1b1ca33400a1fc91ddf"
sourceUrl: "https://developers.openai.com/api/docs/guides/prompting"
translatedAt: "2026-06-27T18:23:34.8670908+08:00"
translator: codex-gpt-5.5-xhigh
---

# 提示词

**Prompting** 是向模型提供输入的过程。输出质量通常取决于你提示模型的方式是否足够好。

## 概览

Prompting 既是一门艺术，也是一门科学。OpenAI 提供了一些策略和 API 设计决策，帮助你构造强提示词，并从模型获得稳定的优质结果。我们鼓励你进行实验。

## 提示词工具与技术

- **[Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)**：最高可将延迟降低 80%，并将成本降低 75%
- **[Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)**：学习用于构造提示词的策略、技术和工具

## 优化你的提示词

- 将整体语气或角色指导放在 system message 中；将任务特定细节和示例保留在 user message 中。
- 将 few-shot 示例合并为简洁的 YAML 风格或项目符号块，让它们易于扫描和更新。
- 使用清晰的文件夹名称映射你的项目结构，让队友可以快速找到提示词。
- 每次发布时运行提示词测试和评估用例；尽早发现问题比在生产中修复问题成本更低。

## 应用中的提示词

将提示词视为应用代码。把提示词内容存储在具名模块中，用带类型的函数参数构建动态部分，并在与其所支持产品行为相同的 pull request 中审查提示词变更。

OpenAI 正在弃用 API 中的可复用 prompt objects。Prompt 创建将从
  2026 年 6 月 3 日开始被弱化，`v1/prompts` 计划于
  2026 年 11 月 30 日关闭。请查看[弃用
  页面](https://developers.openai.com/api/docs/deprecations#2026-06-03-reusable-prompts)了解当前
  时间线。

对于新工作，请不要创建可复用 prompt objects。请改为：

- 将每个生产提示词保存在代码管理、版本化的 helper 中，例如 `prompts/supportReply.ts`。
- 用带类型的函数参数或经过验证的输入对象替换提示词变量。
- 通过 `input` 和 `instructions` 将生成的 messages 直接传给 [Responses API](https://developers.openai.com/api/docs/guides/text?api-mode=responses)。
- 用测试、代表性 fixtures 以及随部署流程运行的评估检查覆盖提示词变更。
- 使用 git history、PR review、release tags 和 feature flags 来审查、发布、比较并回滚提示词变更。

如果你已经在 API 请求中使用 prompt IDs 或 prompt versions，请按照[迁移指南](https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object)将这些提示词迁移到代码中。

## 后续步骤

当你对自己的提示词有信心后，可以查看以下指南和资源。

[

<span slot="icon">
      </span>
    学习如何提示模型生成文本。

](https://developers.openai.com/api/docs/guides/text)

[

<span slot="icon">
      </span>
    了解 OpenAI 的 prompt engineering 工具与技术。

](https://developers.openai.com/api/docs/guides/prompt-engineering)

