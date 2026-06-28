# 维护指南

本指南写给人类维护者和新的 Codex 线程。它记录项目背景、常用命令、部署约束和故障排查路径，避免维护工作依赖旧聊天历史。

## 项目概览

- 项目性质：OpenAI Developers 文档的非官方中文学习镜像站。
- 本地路径：`C:\Users\24493\Documents\资料库\04_项目\openai开发者文档`
- GitHub 仓库：`https://github.com/crasuna/openai-dev-docs-cn-mirror`
- 线上站点：`https://crasuna.github.io/openai-dev-docs-cn-mirror/`
- 技术栈：pnpm、TypeScript、VitePress。
- 完整检查命令：`pnpm check`。

本站仅用于个人学习和中文阅读辅助。内容可能滞后或存在翻译问题，学习和开发决策应以 OpenAI 官方英文文档为准。

## 目录结构

- `sources/manifest.json`：官方文档索引、页面元数据、产品分组和翻译状态。
- `sources/en/**.md`：抓取缓存的官方英文 Markdown，不建议手工改正文。
- `translations/zh/**.md`：中文译文覆盖层。
- `translations/glossary.zh.json`：中文术语表。
- `translations/TRANSLATION_GUIDE.zh.md`：翻译批次和译文格式约定。
- `docs/**`：VitePress 页面。它们是生成页面，但当前项目选择纳入仓库。
- `docs/.vitepress/config.ts`：VitePress 配置。
- `docs/.vitepress/generated/**`：由 `pnpm build:pages` 生成的导航和侧边栏数据。
- `scripts/**`：抓取、生成页面、翻译计划、检查和报告脚本。
- `reports/**`：抓取、构建、翻译计划、翻译状态和 QA 报告。
- `.github/workflows/deploy.yml`：GitHub Pages 部署 workflow。

## 常用命令

安装依赖：

```powershell
pnpm install
```

本地开发：

```powershell
pnpm dev
```

默认开发地址是 `http://127.0.0.1:5173/`，本地开发默认使用根路径 `/`。

完整检查：

```powershell
pnpm check
```

`pnpm check` 会依次执行页面生成、翻译 QA、manifest 校验、本地链接校验、TypeScript 类型检查和 VitePress 构建。

构建静态站点：

```powershell
pnpm build
```

本地预览构建产物：

```powershell
pnpm preview
```

检查翻译进度：

```powershell
pnpm translate:status
pnpm translate:report
```

检查译文结构和链接：

```powershell
pnpm check:translations
```

## 更新官方文档源

从 OpenAI Developers Markdown 索引更新英文源缓存：

```powershell
pnpm fetch:docs
```

该命令会读取 `https://developers.openai.com/llms.txt`，更新 `sources/manifest.json`、`sources/en/**`、站点资源缓存和 `reports/update-report.md`。

更新源文档后重新生成 VitePress 页面：

```powershell
pnpm build:pages
```

随后运行完整检查：

```powershell
pnpm check
```

## 翻译状态

- `translated`：已有中文译文，并已标记为人工复核完成。
- `needs-review`：已有中文译文覆盖，但尚未人工复核。机器生成的中文译文默认属于该状态。
- `untranslated` 或缺省状态：没有中文译文覆盖，页面会显示英文原文。

当前首页中的“中文译文覆盖”包含 `translated` 和 `needs-review`。因此“人工复核完成 0、待人工复核 533”表示已有 533 个中文覆盖页面，但还没有页面完成人工复核。

## 报告文件和时间戳噪声

`pnpm check` 会运行 `pnpm build:pages` 和 `pnpm check:translations`，常见结果是以下文件只有 `Generated at` 时间戳变化：

- `reports/build-report.md`
- `reports/translation-qa-report.md`

如果这些报告只有时间戳变化，应恢复它们，不要提交。若报告内容出现实质变化，例如错误数量、页面数量、产品列表或 QA 结果变化，应阅读差异并在提交说明或最终输出中解释原因。

推荐检查方式：

```powershell
git diff -- reports/build-report.md reports/translation-qa-report.md
```

## 部署

部署由 GitHub Actions 自动完成：

- workflow：`.github/workflows/deploy.yml`
- 触发方式：推送到 `main` 或手动 `workflow_dispatch`
- 构建命令：`pnpm check`
- 发布目录：`docs/.vitepress/dist`

GitHub Pages 站点部署在仓库子路径 `/openai-dev-docs-cn-mirror/` 下，所以 workflow 构建时必须设置：

```powershell
VITEPRESS_BASE=/openai-dev-docs-cn-mirror/
```

本地开发不设置该变量，默认使用 `/`。如果线上资源、导航或页面链接出现 404，优先检查 `VITEPRESS_BASE` 是否缺失或写错。

仓库当前保持 public，是因为本项目按 GitHub Pages 免费部署路径公开发布。公开站点必须保留非官方和学习用途免责声明。

## 故障排查

GitHub Actions 失败：

- 先查看失败 step 的日志，确认是依赖安装、`pnpm check`、Pages artifact 上传还是部署失败。
- 本地运行同一个命令，优先复现 `pnpm check`。
- 若本地无法复现，再检查 Node、pnpm、lockfile 和 workflow action 版本。

Pages 首页 404：

- 确认仓库 Pages 设置使用 GitHub Actions 部署。
- 确认最新 workflow 的 deploy job 成功。
- 确认访问地址是 `https://crasuna.github.io/openai-dev-docs-cn-mirror/`。

资源路径或导航 404：

- 确认 `.github/workflows/deploy.yml` 中存在 `VITEPRESS_BASE=/openai-dev-docs-cn-mirror/`。
- 本地可用同样的环境变量构建复现：

```powershell
$env:VITEPRESS_BASE='/openai-dev-docs-cn-mirror/'; pnpm build
```

链接检查失败：

- 查看 `pnpm check:links` 输出。
- 优先确认链接是否应该指向镜像页面、官方页面或静态资源。
- 如果是官方文档结构变化，先运行 `pnpm fetch:docs` 和 `pnpm build:pages` 再复查。

翻译 QA 失败：

- 查看 `reports/translation-qa-report.md` 和命令输出。
- 常见原因是 frontmatter 缺失、Markdown 代码块不闭合、链接或图片格式损坏、表格结构不一致。
- 修复 `translations/zh/**` 后运行 `pnpm check:translations`，再运行 `pnpm check`。

报告只有时间戳变化：

- 确认差异是否只包含 `Generated at`。
- 若只有时间戳变化，恢复报告文件，不纳入提交。

## Codex 接手流程

新的 Codex 线程接手时应先阅读：

1. `AGENTS.md`
2. `README.md`
3. `MAINTENANCE.md`
4. `TODO.md`

开始修改前运行：

```powershell
git status --short
```

完成修改后运行：

```powershell
pnpm check
git diff --check
git status --short
```

只提交本次修改文件。有 GitHub 远程时，验证通过后提交并推送。
