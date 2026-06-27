# OpenAI 文档中文翻译规范

本文件用于本地中文镜像站的人工/模型辅助翻译批次。翻译执行必须使用 Codex/GPT-5.5 自身语言能力，不调用外部翻译工具、翻译网站或第三方翻译 API。

## 执行配置

- 模型：`gpt-5.5`
- 子代理推理强度：`xhigh`
- 默认状态：`needs-review`
- 译者标记：`codex-gpt-5.5-xhigh`

## Frontmatter

每个 `translations/zh/**.md` 文件必须以 YAML frontmatter 开头：

```yaml
---
status: needs-review
sourceId: "<manifest doc id>"
sourceChecksum: "<manifest checksum>"
sourceUrl: "<official source URL>"
translatedAt: "<ISO timestamp>"
translator: codex-gpt-5.5-xhigh
---
```

## 内容规则

- 中文优先，面向学习者自然表达，但不得改变官方文档含义。
- 保留 Markdown 结构、标题层级、列表、表格、图片、链接和告警块。
- 保留代码块内容；除非注释是自然语言说明且翻译不会改变示例行为，否则不要翻译代码块内文本。
- API endpoint、参数名、字段名、文件路径、包名、命令、模型 slug、环境变量名不翻译。
- 产品名和固定术语默认保留英文，例如 `Responses API`、`Agents SDK`、`Realtime API`、`Apps SDK`、`Batch API`、`MCP`、`ChatKit`。
- 首次出现的生僻概念可采用“中文术语（English term）”形式，后续保持一致。
- 安全、认证、计费、限制、隐私、数据保留相关内容保持保守直译，不添加官方源文档之外的解释。

## 批次规则

- 每个 worker 只写自己负责的 `translations/zh/**.md` 文件。
- 不修改 `sources/en/**`、`docs/**`、`scripts/**`、`package.json` 或其他 worker 负责的译文。
- 如目标译文文件来自中止批次且不完整，应完整替换为当前 `gpt-5.5-xhigh` 版本。
- 完成后运行 `pnpm check:translations`；如失败，只修复自己批次文件。

## 校验目标

- `sourceChecksum` 与 `sources/manifest.json` 当前 checksum 一致。
- 代码围栏数量和闭合状态与源文档一致。
- 链接、图片、表格数量不应明显减少。
- 页面可通过 `pnpm build:pages` 生成，并在本地站点中显示中文译文与折叠英文源。
