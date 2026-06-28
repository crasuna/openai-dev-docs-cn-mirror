# AGENTS.md

本文件写给 Codex 和其他 coding agent。目标是让新的维护线程只依赖仓库文件就能安全接手本项目。

## 项目身份

- 本项目是 OpenAI Developers 文档的非官方中文学习镜像站。
- 线上站点：`https://crasuna.github.io/openai-dev-docs-cn-mirror/`
- GitHub 仓库：`https://github.com/crasuna/openai-dev-docs-cn-mirror`
- 公开页面必须始终说明：非官方、仅用于学习和中文阅读辅助、内容可能滞后、以 OpenAI 官方英文文档为准。

## 修改前检查

- 修改任何文件前，先运行 `git status --short`。
- 如果工作树中已有用户改动，只处理与当前任务有关的文件，不要回滚、覆盖或混入提交。
- 默认保持改动集中，不做无关重构。
- 默认不要修改 `scripts/**` 的业务逻辑；只有在维护文档引用的命令不存在、生成模板必须同步，或发现明显错误时才改。

## 内容目录约定

- `sources/en/**.md` 是 OpenAI 官方英文 Markdown 缓存。除非是在修复抓取、缓存或校验问题，不要直接修改正文。
- `translations/zh/**.md` 是中文译文覆盖层。机器生成的译文默认使用 `status: needs-review`，表示已有中文覆盖但尚未人工复核。
- `docs/**` 是生成的 VitePress 页面，但当前项目选择把生成页面纳入仓库。修改 `sources/**` 或 `translations/**` 后，应运行 `pnpm build:pages` 重新生成页面。
- `docs/.vitepress/dist/` 是构建产物，不提交。
- `node_modules/` 是依赖目录，不提交。
- `reports/*.md` 和 `reports/*.json` 是维护报告。运行检查后如果只有 `Generated at` 时间戳变化，尤其是 `reports/build-report.md` 或 `reports/translation-qa-report.md`，应恢复这些噪声变化，不要混入提交。
- 只提交稳定维护报告；不要提交 `reports/dev-server*`、`reports/dev-server/` 或 `reports/codex-manual-chunks/` 这类本地运行日志和翻译临时分块目录。

## 常用验证

- 完整检查优先使用 `pnpm check`。
- 提交前至少运行：
  - `pnpm check`
  - `git diff --check`
  - `git status --short`
- 如果 `pnpm check` 失败，先阅读本机输出和相关报告，再根据 `MAINTENANCE.md` 的故障排查路径定位。

## Git 和 GitHub

- 只暂存、提交本次 Codex 修改的文件。
- 不要把用户已有改动、无法确认归属的改动、`docs/.vitepress/dist/` 或 `node_modules/` 混入提交。
- 有指向 GitHub 的远程仓库时，完成验证后提交并推送。
- 提交信息应简洁具体，例如：`Document long-term maintenance workflow`。
- `git push` 如果因网络超时、连接重置、DNS、TLS 或 GitHub 临时不可访问失败，可以递增间隔重试。
- `git push` 如果明显因认证失败、权限不足、non-fast-forward、分支保护或远程拒绝失败，应停止重试并报告原因。

## 部署注意事项

- GitHub Pages workflow 位于 `.github/workflows/deploy.yml`。
- GitHub Pages 构建时使用 `VITEPRESS_BASE=/openai-dev-docs-cn-mirror/`，本地开发默认使用 `/`。
- 站点首页或 VitePress 内容变化推送后，应等待 Pages workflow 成功，再检查线上首页是否可访问。
