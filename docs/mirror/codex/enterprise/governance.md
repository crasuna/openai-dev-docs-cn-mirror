---
title: "治理"
description: "Governance guidance for managing Codex in your organization"
outline: deep
---

# 治理

**文档集**：Codex 编码智能体<br>
**分组**：Codex — 企业<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/enterprise/governance](https://developers.openai.com/codex/enterprise/governance)
- Markdown 来源：[https://developers.openai.com/codex/enterprise/governance.md](https://developers.openai.com/codex/enterprise/governance.md)
- 抓取时间：2026-06-27T05:54:57.703Z
- Checksum：`4f6d83de7c590dc75c7423cf8d82b152fafc2ec0d89cad49a6604a2fcd2c9d8b`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
# 治理和可观测性

Codex 为企业团队提供采用情况和影响的可见性，以及安全与合规计划所需的可审计性。请使用自助仪表盘进行日常跟踪，使用 Analytics API 进行程序化报告，并使用 Compliance API 将详细日志导出到你的治理栈中。

## 跟踪 Codex 使用情况的方式

可根据你的需求，通过三种方式监控 Codex 使用情况：

- **Analytics Dashboard**：快速查看采用情况、使用情况和代码审查影响。
- **Analytics API**：将结构化每日指标拉取到你的数据仓库或 BI 工具中。
- **Compliance API**：导出详细活动日志，用于审计、监控和调查。

## Analytics Dashboard


  &lt;img src="https://developers.openai.com/images/codex/enterprise/analytics-dashboard.png"
    alt="显示按模型统计的 credit 和 token 使用情况的 Codex 分析仪表盘"
    class="block w-full mx-auto rounded-lg !border-0"
  /&gt;


### 仪表盘视图

&lt;a href="https://admin.openai.com/analytics/codex" target="_blank" rel="noopener noreferrer"&gt;分析仪表盘&lt;/a&gt;允许 ChatGPT workspace 管理员和分析查看者跟踪 Codex 采用情况、使用情况和 Code Review 反馈。使用数据最多可能滞后 12 小时。

Codex 为每日和每周视图提供日期范围控件。关键图表包括：

- 按产品界面统计的活跃用户，包括 CLI、IDE 扩展、cloud、desktop 和 Code Review
- Workspace 和个人使用情况明细，包括按产品界面或模型统计的 credit 和 token 使用情况
- 按 client 统计的 thread 和 turn 产品活动
- 用户排名表，包含 client 筛选器以及 credits、threads、turns、text tokens 和 current streak 等排序选项
- Code Review 活动，包括已审查 PR、按优先级划分的问题、评论、回复、回应和反馈情绪
- 当你的 workspace 拥有相关功能时的 skill 调用、agent identity 使用情况和访问令牌使用情况

### 数据导出

管理员还可以以 CSV 或 JSON 格式导出 Codex 分析数据。Codex 提供以下导出选项：

- Workspace 使用情况，包括按界面统计的每日活跃用户、threads、turns 和 credits
- 每用户使用情况，包括跨界面的每日 threads、turns 和 credits，并在允许时包含可选 email 地址
- Code Review 明细，包括每日评论、回应、回复和优先级级别发现

## Analytics API

当你想自动化报告、构建内部仪表盘，或将 Codex 指标与你现有的工程数据结合时，请使用 [Analytics API](https://chatgpt.com/codex/cloud/settings/apireference)。

### 它衡量什么

企业 Analytics API 会返回 workspace 的每日或每周 UTC 桶。它支持 workspace 级和每用户使用情况、按 client 的明细、Code Review 吞吐量、Code Review 评论优先级，以及用户对 Code Review 评论的互动情况。

### 端点

基础 URL 为 `https://api.chatgpt.com/v1/analytics/codex`。所有端点都会返回分页的 `page` 对象，其中包含 `has_more` 和 `next_page`。

使用 `start_time` 表示报告窗口开始处的包含式 Unix 时间戳，`end_time` 表示报告窗口结束处的排除式 Unix 时间戳，`group_by` 表示 `day` 或 `week` 桶，`limit` 表示页面大小，`page` 用于从上一响应继续。请求最多可回看 90 天。

#### 使用情况

`GET /workspaces/{workspace_id}/usage`

- 返回每日或每周桶中的 threads、turns、credits 和每 client 使用情况总计。
- 省略 `group` 可返回每用户行。
- 设置 `group=workspace` 可返回 workspace 范围行。
- 包含 text input、cached input 和 output token 字段。

#### Code review 活动

`GET /workspaces/{workspace_id}/code_reviews`

- 返回 Codex 完成的 pull request 审查。
- 返回 Codex 生成的总评论数。
- 按 P0、P1 和 P2 优先级拆分评论。

#### 用户对 code review 的互动

`GET /workspaces/{workspace_id}/code_review_responses`

- 返回对 Codex 评论的回复和回应。
- 将回应拆分为正向、负向和其他回应。
- 统计收到回应、回复或任一互动形式的评论。

### 工作方式

Analytics 使用时间窗口，并支持按 day 或 week 分组。结果按时间排序，并通过基于游标的分页返回。请使用作用域为 `codex.enterprise.analytics.read` 的 API key。

### 常见使用场景

- 工程可观测性仪表盘
- 面向领导层更新的采用情况报告
- 使用治理和成本监控

## Compliance API

当你需要用于安全、法律和治理工作流的可审计记录时，请使用 [Compliance API](https://chatgpt.com/admin/api-reference)。

### 它衡量什么

Compliance API 为企业提供导出 Codex 活动日志和元数据的方式，以便你将这些数据连接到现有的审计、监控和安全工作流中。它面向 eDiscovery、DLP、SIEM 或其他合规系统等工具而设计。

对于通过 ChatGPT 认证的 Codex 使用，Compliance API 导出会提供 Codex 活动的审计记录，并可用于调查和合规工作流。这些审计日志最多保留 30 天。通过 API key 认证的 Codex 使用遵循你的 API 组织设置，不包含在 Compliance API 导出中。

### 可以导出什么

#### 活动日志

- 发送给 Codex 的提示词文本
- Codex 生成的响应
- Workspace、用户、时间戳和模型等标识符
- Token 使用情况和相关请求元数据

#### 用于审计和调查的元数据

使用记录元数据来回答类似问题：

- 谁运行了任务
- 谁创建或撤销了访问令牌
- 何时运行
- 使用了哪个模型
- 处理了多少内容

#### 常见使用场景

- 安全调查
- 合规报告
- 策略执行审计
- 将事件路由到 SIEM 和 eDiscovery 管道

### 它不提供什么

- 生成的代码行数（这有些像带噪声的生产力替代指标，并可能激励错误行为）
- 建议接受率（几乎是 100%，因为用户通常会先接受更改）
- 代码质量或性能 KPI

## 推荐模式

多数企业会组合使用：

1. **Analytics Dashboard** 用于自助监控和快速解答
2. **Analytics API** 用于自动化报告和 BI 集成
3. **Compliance API** 用于审计导出和调查

:::

## English source

::: details 展开英文原文
::: v-pre
# Governance and Observability

Codex gives enterprise teams visibility into adoption and impact, plus the auditability needed for security and compliance programs. Use the self-serve dashboard for day-to-day tracking, the Analytics API for programmatic reporting, and the Compliance API to export detailed logs into your governance stack.

## Ways to track Codex usage

There are three ways to monitor Codex usage, depending on what you need:

- **Analytics Dashboard**: quick visibility into adoption, usage, and code review impact.
- **Analytics API**: pull structured daily metrics into your data warehouse or BI tools.
- **Compliance API**: exports detailed activity logs for audit, monitoring, and investigations.

## Analytics Dashboard


  &lt;img src="https://developers.openai.com/images/codex/enterprise/analytics-dashboard.png"
    alt="Codex analytics dashboard showing credit and token usage by model"
    class="block w-full mx-auto rounded-lg !border-0"
  /&gt;


### Dashboard views

The &lt;a href="https://admin.openai.com/analytics/codex" target="_blank" rel="noopener noreferrer"&gt;analytics dashboard&lt;/a&gt; allows ChatGPT workspace administrators and analytics viewers to track Codex adoption, usage, and Code Review feedback. Usage data can lag by up to 12 hours.

Codex provides date-range controls for daily and weekly views. Key charts include:

- Active users by product surface, including CLI, IDE extension, cloud, desktop, and Code Review
- Workspace and personal usage breakdowns, including credit and token usage by product surface or model
- Product activity for threads and turns by client
- User ranking table, with filters for client and sort options such as credits, threads, turns, text tokens, and current streak
- Code Review activity, including PRs reviewed, issues by priority, comments, replies, reactions, and feedback sentiment
- Skill invocations, agent identity usage, and access token usage when your workspace has those features

### Data export

Administrators can also export Codex analytics data in CSV or JSON format. Codex provides the following export options:

- Workspace usage, including daily active users, threads, turns, and credits by surface
- Usage per user, including daily threads, turns, and credits across surfaces, with optional email addresses when allowed
- Code Review details, including daily comments, reactions, replies, and priority-level findings

## Analytics API

Use the [Analytics API](https://chatgpt.com/codex/cloud/settings/apireference) when you want to automate reporting, build internal dashboards, or join Codex metrics with your existing engineering data.

### What it measures

The enterprise Analytics API returns daily or weekly UTC buckets for a workspace. It supports workspace-level and per-user usage, per-client breakdowns, Code Review throughput, Code Review comment priority, and user engagement with Code Review comments.

### Endpoints

The base URL is `https://api.chatgpt.com/v1/analytics/codex`. All endpoints return paginated `page` objects with `has_more` and `next_page`.

Use `start_time` for the inclusive Unix timestamp at the beginning of the reporting window, `end_time` for the exclusive Unix timestamp at the end of the reporting window, `group_by` for `day` or `week` buckets, `limit` for page size, and `page` to continue from a previous response. Requests can look back up to 90 days.

#### Usage

`GET /workspaces/{workspace_id}/usage`

- Returns totals for threads, turns, credits, and per-client usage in daily or weekly buckets.
- Omit `group` to return per-user rows.
- Set `group=workspace` to return workspace-wide rows.
- Includes text input, cached input, and output token fields.

#### Code review activity

`GET /workspaces/{workspace_id}/code_reviews`

- Returns pull request reviews completed by Codex.
- Returns total comments generated by Codex.
- Breaks comments down by P0, P1, and P2 priority.

#### User engagement with code review

`GET /workspaces/{workspace_id}/code_review_responses`

- Returns replies and reactions to Codex comments.
- Breaks reactions down into positive, negative, and other reactions.
- Counts comments that received reactions, replies, or either form of engagement.

### How it works

Analytics uses time windows and supports day or week grouping. Results are time-ordered and returned in pages with cursor-based pagination. Use an API key scoped to `codex.enterprise.analytics.read`.

### Common use cases

- Engineering observability dashboards
- Adoption reporting for leadership updates
- Usage governance and cost monitoring

## Compliance API

Use the [Compliance API](https://chatgpt.com/admin/api-reference) when you need auditable records for security, legal, and governance workflows.

### What it measures

The Compliance API gives enterprises a way to export logs and metadata for Codex activity so you can connect that data to your existing audit, monitoring, and security workflows. It is designed for use with tools like eDiscovery, DLP, SIEM, or other compliance systems.

For Codex usage authenticated through ChatGPT, Compliance API exports provide audit records for Codex activity and can be used in investigations and compliance workflows. These audit logs are retained for up to 30 days. API-key-authenticated Codex usage follows your API organization settings and is not included in Compliance API exports.

### What you can export

#### Activity logs

- Prompt text sent to Codex
- Responses Codex generated
- Identifiers such as workspace, user, timestamp, and model
- Token usage and related request metadata

#### Metadata for audit and investigation

Use record metadata to answer questions like:

- Who ran a task
- Who created or revoked an access token
- When it ran
- Which model was used
- How much content was processed

#### Common use cases

- Security investigations
- Compliance reporting
- Policy enforcement audits
- Routing events into SIEM and eDiscovery pipelines

### What it does not provide

- Lines of code generated (a bit of a noisy proxy for productivity and can incentivize the wrong behavior)
- Acceptance rate of suggestions (almost 100% since users usually accept the change first)
- Code quality or performance KPIs

## Recommended pattern

Most enterprises use a combination of:

1. **Analytics Dashboard** for self-serve monitoring and quick answers
2. **Analytics API** for automated reporting and BI integration
3. **Compliance API** for audit exports and investigations

:::
:::

