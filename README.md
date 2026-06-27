# OpenAI 开发者文档本地中文镜像

这是一个面向个人学习的非官方本地镜像站工程。它从 OpenAI Developers 官方 Markdown 索引抓取英文源文档，生成本地 VitePress 文档站，并为中文译文保留覆盖层。

## 快速开始

```powershell
pnpm install
pnpm fetch:docs
pnpm build:pages
pnpm dev
```

默认开发服务器会运行在 `http://127.0.0.1:5173/`。

## 常用命令

- `pnpm fetch:docs`：从 `https://developers.openai.com/llms.txt` 发现并抓取官方 Markdown 文档。
- `pnpm build:pages`：根据 `sources/manifest.json`、`sources/en`、`translations/zh` 生成 VitePress 页面。
- `pnpm translate:plan`：生成可恢复的翻译批次计划和队列报告，默认只排未翻译页面并限制单批页数；需要重译待复核页面时使用 `-- --include-needs-review`。
- `pnpm translate:report`：生成翻译进度、产品线覆盖和 `codex-gpt-5.5-xhigh` 标记合规报告。
- `pnpm translate:status`：查看中文翻译完成情况。
- `pnpm check:translations`：检查中文译文 frontmatter、Markdown 结构、代码块、链接、图片和表格是否明显损坏。
- `pnpm check`：生成页面、校验 manifest、校验本地链接、类型检查并构建站点。
- `pnpm build`：构建静态站点。
- `pnpm preview`：本地预览构建产物。

## 内容约定

- `sources/en/**.md` 是官方英文 Markdown 缓存，不建议手工改写正文。
- `translations/zh/**.md` 是中文译文覆盖层；没有译文时站点显示英文原文并标记为待翻译。
- 机器生成的中文译文默认使用 `status: needs-review`，表示可用于学习但仍建议人工复核。
- 翻译批次遵循 `translations/TRANSLATION_GUIDE.zh.md`：使用 GPT-5.5、子代理推理强度 `xhigh`，不调用外部翻译工具或第三方翻译 API。
- `docs/**.md` 是生成产物，运行 `pnpm build:pages` 会重建。
- `reports/update-report.md` 会记录最近一次抓取的新增、更新、失败和翻译复核情况。
- `reports/translation-plan.md`、`reports/translation-queue.json` 和 `reports/translation-qa-report.md` 记录翻译批次、队列和 QA 结果。

## 免责声明

本站点仅用于本机学习，不是 OpenAI 官方网站。每个页面都会保留官方源链接、抓取时间和内容校验值。公开分享或部署前，请重新确认 OpenAI 当前条款、品牌规范和文档授权范围。
