# TODO

本文件记录后续维护 backlog。面向新 Codex 线程时，优先从高优先级任务开始，并在修改前阅读 `AGENTS.md` 和 `MAINTENANCE.md`。

## 已完成基线

- [x] P0: 完善公开免责声明和长期维护说明。
- [x] P0: 沉淀 Codex 维护规则，避免新线程依赖旧聊天历史。
- [x] P0: 明确报告时间戳噪声处理方式。

## 后续任务

- [ ] P1: 增加自动同步官方文档的 GitHub Actions workflow，并明确人工确认和失败回滚策略。
- [ ] P1: 扩充 `translations/glossary.zh.json`，形成稳定的 OpenAI Developers 中文术语表。
- [ ] P1: 建立翻译质量抽检流程，定期从 `needs-review` 页面中抽样复核并记录结果。
- [ ] P2: 优化首页和目录体验，让文档集入口、翻译状态和官方源链接更容易浏览。
- [ ] P2: 增加 GitHub Actions 和依赖更新自动化，例如定期检查 action 版本、Node/pnpm 版本和 VitePress 更新。
