# OpenAI 开发者文档本地中文镜像

这是一个非官方、本地学习用的 OpenAI Developers 文档镜像。当前阶段已建立英文源文档缓存、中文译文覆盖层和本地搜索；没有中文译文的页面会直接显示英文原文。

::: warning 使用说明
本地页面保留官方源链接、抓取时间和内容校验值。学习和开发时请以官方页面为最终依据；公开部署前请重新确认 OpenAI 当前条款、品牌规范和文档授权范围。
:::

## 文档状态

| 指标 | 数量 |
| --- | ---: |
| 已索引页面 | 533 |
| 已翻译 | 0 |
| 待复核译文 | 533 |
| 待翻译 | 0 |
| 最近抓取 | 2026-06-27T05:55:15.688Z |

## 文档集

| 文档集 | 页面数 | 入口 |
| --- | ---: | --- |
| Ads | 15 | [浏览](/mirror/ads/api-overview) |
| API Reference | 226 | [浏览](/mirror/api/reference/administration/overview) |
| Apps SDK | 26 | [浏览](/mirror/apps-sdk/app-submission-guidelines) |
| Codex | 95 | [浏览](/mirror/codex/agent-approvals-security) |
| Commerce | 15 | [浏览](/mirror/commerce/guides/production) |
| OpenAI API Docs | 154 | [浏览](/mirror/api/docs/guides/chatkit-actions) |
| Workspace Agents | 2 | [浏览](/mirror/workspace-agents/authentication) |

## 本地工作流

1. 运行 `pnpm fetch:docs` 更新官方英文源文档。
2. 运行 `pnpm build:pages` 重建本地镜像页面。
3. 在 `translations/zh/**.md` 添加中文译文。
4. 运行 `pnpm translate:status` 查看中文化进度。
5. 运行 `pnpm check` 完整校验并构建站点。
