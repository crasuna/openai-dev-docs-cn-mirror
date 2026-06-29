# OpenAI Developers 文档非官方中文学习镜像站

这是一个非官方 OpenAI Developers 中文学习镜像站，已通过 GitHub Pages 公开部署。本站用于个人学习和中文阅读辅助，当前阶段已建立英文源文档缓存、中文译文覆盖层和本地搜索；没有中文译文覆盖的页面会显示英文原文。

::: warning 非官方说明
本站不是 OpenAI 官方网站，内容可能滞后、遗漏或存在翻译错误。学习、开发、上线和合规判断应以 OpenAI 官方英文文档为准。
:::

## 文档状态

| 指标 | 数量 |
| --- | ---: |
| 已索引页面 | 533 |
| 中文译文覆盖 | 533 |
| 人工复核完成 | 0 |
| 待人工复核 | 533 |
| 待补译 | 0 |
| 最近抓取 | 2026-06-27T05:55:15.688Z |

## 文档集

| 文档集 | 页面数 | 入口 |
| --- | ---: | --- |
| Ads 广告 | 15 | [浏览](/mirror/ads/api-overview) |
| API Reference 参考 | 226 | [浏览](/mirror/api/reference/administration/overview) |
| Apps SDK 应用 SDK | 26 | [浏览](/mirror/apps-sdk/app-submission-guidelines) |
| Codex 编码智能体 | 95 | [浏览](/mirror/codex/agent-approvals-security) |
| Commerce 商务 | 15 | [浏览](/mirror/commerce/guides/production) |
| OpenAI API 文档 | 154 | [浏览](/mirror/api/docs/guides/chatkit-actions) |
| Workspace Agents 工作区智能体 | 2 | [浏览](/mirror/workspace-agents/authentication) |

## 维护工作流

1. 运行 `pnpm fetch:docs` 更新官方英文源文档。
2. 运行 `pnpm build:pages` 重建镜像页面。
3. 在 `translations/zh/**.md` 添加或复核中文译文。
4. 运行 `pnpm translate:status` 查看中文化进度。
5. 运行 `pnpm check` 完整校验并构建站点。
