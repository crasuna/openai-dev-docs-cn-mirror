# OpenAI Developers 文档非官方中文学习镜像站

这是一个面向个人学习和中文阅读辅助的非官方 OpenAI Developers 文档镜像站项目。它从 OpenAI Developers 官方 Markdown 索引抓取英文源文档，生成 VitePress 文档站，并在 `translations/zh` 中维护中文译文覆盖层。

- 线上站点：`https://crasuna.github.io/openai-dev-docs-cn-mirror/`
- GitHub 仓库：`https://github.com/crasuna/openai-dev-docs-cn-mirror`
- 仓库状态：public。当前按 GitHub Pages 免费部署路径公开发布。

## 免责声明

本项目不是 OpenAI 官方网站，也不代表 OpenAI。内容仅用于个人学习和中文阅读辅助，可能滞后、遗漏或存在翻译错误。学习、开发、上线和合规判断应始终以 OpenAI 官方英文文档为准。

## 快速开始

```powershell
pnpm install
pnpm dev
```

默认开发服务器会运行在 `http://127.0.0.1:5173/`。

如果需要更新官方英文源并重新生成页面：

```powershell
pnpm fetch:docs
pnpm build:pages
pnpm check
```

## 常用命令

- `pnpm fetch:docs`：从 `https://developers.openai.com/llms.txt` 发现并抓取官方 Markdown 文档。
- `pnpm build:pages`：根据 `sources/manifest.json`、`sources/en`、`translations/zh` 生成 VitePress 页面。
- `pnpm translate:plan`：按需生成本地翻译批次计划和队列，默认只排未翻译页面并限制单批页数；需要复核待审页面时使用 `-- --include-needs-review`。
- `pnpm translate:report`：生成翻译进度、产品线覆盖和 `codex-gpt-5.5-xhigh` 标记合规报告。
- `pnpm translate:status`：查看中文翻译完成情况。
- `pnpm check:translations`：检查中文译文 frontmatter、Markdown 结构、代码块、链接、图片和表格是否明显损坏。
- `pnpm check`：生成页面、校验 manifest、校验本地链接、类型检查并构建站点。
- `pnpm build`：构建静态站点。
- `pnpm preview`：本地预览构建产物。

## 内容约定

- `sources/en/**.md` 是官方英文 Markdown 缓存，不建议手工改写正文。
- `translations/zh/**.md` 是中文译文覆盖层；机器生成的中文译文默认使用 `status: needs-review`，表示已有中文覆盖但仍待人工复核。
- 没有中文译文覆盖时，站点显示英文原文并标记为待翻译。
- 翻译批次遵循 `translations/TRANSLATION_GUIDE.zh.md`：使用 GPT-5.5、子代理推理强度 `xhigh`，不调用外部翻译工具或第三方翻译 API。
- `docs/**.md` 是生成页面，当前项目选择纳入仓库；运行 `pnpm build:pages` 会重建。
- `docs/.vitepress/dist/` 和 `node_modules/` 不提交。
- `reports/update-report.md` 记录最近一次抓取的新增、更新、失败和翻译复核情况。
- `reports/translation-qa-report.md` 记录译文 QA 结果；`reports/translation-plan.md` 和 `reports/translation-queue.json` 是按需生成的本地翻译队列，不提交。

## 维护说明

- 维护流程、部署说明和故障排查见 `MAINTENANCE.md`。
- Codex 和 coding agent 的仓库维护规则见 `AGENTS.md`。
- 后续任务列表见 `TODO.md`。
