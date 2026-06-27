---
status: needs-review
sourceId: "51eea278cc11"
sourceChecksum: "51eea278cc117f0b254a3654be0d4856fdcb96356c9ec712e610242d4b9d32ac"
sourceUrl: "https://developers.openai.com/codex/integrations/linear"
translatedAt: "2026-06-27T19:05:47.1891485+08:00"
translator: codex-gpt-5.5-xhigh
---

# 在 Linear 中使用 Codex

在 Linear 中使用 Codex，可以从 issues 委托工作。将 issue 分配给 Codex，或在评论中提及 `@Codex`，Codex 会创建云端任务并回复进度和结果。

Linear 中的 Codex 可用于付费方案（参见[定价](https://developers.openai.com/codex/pricing)）。

如果你使用 Enterprise 方案，请让你的 ChatGPT workspace admin 在 [workspace settings](https://chatgpt.com/admin/settings) 中打开 Codex cloud tasks，并在 [connector settings](https://chatgpt.com/admin/ca) 中启用 **Codex for Linear**。

## 设置 Linear integration

1. 在 [Codex](https://chatgpt.com/codex) 中连接 GitHub，并为希望 Codex 工作的仓库创建一个[环境](https://developers.openai.com/codex/cloud/environments)，以设置 [Codex cloud tasks](https://developers.openai.com/codex/cloud)。
2. 前往 [Codex settings](https://chatgpt.com/codex/settings/connectors)，并为你的 workspace 安装 **Codex for Linear**。
3. 在 Linear issue 的评论 thread 中提及 `@Codex`，以链接你的 Linear account。

## 将工作委托给 Codex

你可以通过两种方式委托：

### 将 issue 分配给 Codex

安装 integration 后，你可以像把 issues 分配给队友一样分配给 Codex。Codex 会开始工作，并将更新发回 issue。

<div class="not-prose max-w-3xl mr-auto my-4">
  <img src="https://developers.openai.com/images/codex/integrations/linear-assign-codex-light.webp"
    alt="在 Linear issue 中将 Codex 指派给 issue（浅色模式）"
    class="block h-auto w-full rounded-lg border border-default my-0 dark:hidden"
  />
  <img src="https://developers.openai.com/images/codex/integrations/linear-assign-codex-dark.webp"
    alt="在 Linear issue 中将 Codex 指派给 issue（深色模式）"
    class="hidden h-auto w-full rounded-lg border border-default my-0 dark:block"
  />
</div>

### 在评论中提及 `@Codex`

你也可以在评论 threads 中提及 `@Codex` 来委托工作或提问。Codex 回复后，你可以在同一个 thread 中继续跟进同一 session。

<div class="not-prose max-w-3xl mr-auto my-4">
  <img src="https://developers.openai.com/images/codex/integrations/linear-comment-light.webp"
    alt="在 Linear issue 评论中提及 Codex（浅色模式）"
    class="block h-auto w-full rounded-lg border border-default my-0 dark:hidden"
  />
  <img src="https://developers.openai.com/images/codex/integrations/linear-comment-dark.webp"
    alt="在 Linear issue 评论中提及 Codex（深色模式）"
    class="hidden h-auto w-full rounded-lg border border-default my-0 dark:block"
  />
</div>

Codex 开始处理 issue 后，会[选择一个环境和 repo](#how-codex-chooses-an-environment-and-repo) 来工作。
若要固定特定 repo，请在评论中包含它，例如：`@Codex fix this in openai/codex`。

跟踪进度：

- 打开 issue 上的 **Activity** 查看进度更新。
- 打开任务链接以查看更详细的进展。

任务完成后，Codex 会发布摘要和已完成任务的链接，便于你创建 pull request。

### Codex 如何选择环境和 repo <a id="how-codex-chooses-an-environment-and-repo"></a>

- Linear 会根据 issue 上下文建议一个仓库。Codex 会选择最匹配该建议的环境。如果请求含糊，它会回退到你最近使用过的环境。
- 任务会针对该环境 repo map 中列出的第一个仓库的默认分支运行。如果你需要不同默认值或更多仓库，请在 Codex 中更新 repo map。
- 如果没有可用的合适环境或仓库，Codex 会在 Linear 中回复如何修复问题的说明，然后你可以重试。

## 自动将 issues 分配给 Codex

你可以使用 triage rules 自动将 issues 分配给 Codex：

1. 在 Linear 中，前往 **Settings**。
2. 在 **Your teams** 下选择你的 team。
3. 在 workflow settings 中打开 **Triage** 并启用它。
4. 在 **Triage rules** 中创建一条规则，并选择 **Delegate** > **Codex**（以及你想设置的任何其他属性）。

Linear 会自动将进入 triage 的新 issues 分配给 Codex。
使用 triage rules 时，Codex 会使用 issue 创建者的账户运行任务。

<div class="not-prose max-w-3xl mr-auto my-4">
  <img src="https://developers.openai.com/images/codex/integrations/linear-triage-rule-light.webp"
    alt='示例 triage rule 的截图，将所有内容分配给 Codex，并在 "Triage" 状态中打标签（浅色模式）'
    class="block h-auto w-full rounded-lg border border-default my-0 dark:hidden"
  />
  <img src="https://developers.openai.com/images/codex/integrations/linear-triage-rule-dark.webp"
    alt='示例 triage rule 的截图，将所有内容分配给 Codex，并在 "Triage" 状态中打标签（深色模式）'
    class="hidden h-auto w-full rounded-lg border border-default my-0 dark:block"
  />
</div>

## 数据使用、隐私和安全

当你提及 `@Codex` 或将 issue 分配给它时，Codex 会接收你的 issue 内容，以理解你的请求并创建任务。
数据处理遵循 OpenAI 的[隐私政策](https://openai.com/privacy)、[使用条款](https://openai.com/terms/)和其他适用[政策](https://openai.com/policies)。
有关安全的更多信息，请参见 [Codex 安全文档](https://developers.openai.com/codex/agent-approvals-security)。

Codex 使用 large language models，可能会出错。请始终审查答案和 diffs。

## 提示和排查

- **缺少连接**：如果 Codex 无法确认你的 Linear 连接，它会在 issue 中回复一个链接，用于连接你的账户。
- **环境选择不符合预期**：在 thread 中回复你想使用的环境（例如 `@Codex please run this in openai/codex`）。
- **代码位置错误**：在 issue 中添加更多上下文，或在你的 `@Codex` 评论中给出显式指令。
- **更多帮助**：参见 [OpenAI Help Center](https://help.openai.com/)。

## 为本地任务连接 Linear（MCP）

如果你使用 Codex app、CLI 或 IDE Extension，并希望 Codex 在本地访问 Linear issues，请配置 Codex 使用 Linear Model Context Protocol (MCP) server。

若要了解更多，请[查看 Linear MCP 文档](https://linear.app/integrations/codex-mcp)。

无论你使用 IDE extension 还是 CLI，MCP server 的设置步骤都相同，因为两者共享同一配置。

### 使用 CLI（推荐）

如果你安装了 CLI，请运行：

```bash
codex mcp add linear --url https://mcp.linear.app/mcp
```

这会提示你使用 Linear account 登录，并将它连接到 Codex。

### 手动配置

1. 在编辑器中打开 `~/.codex/config.toml`。
2. 添加以下内容：

```toml
[mcp_servers.linear]
url = "https://mcp.linear.app/mcp"
```

3. 运行 `codex mcp login linear` 登录。
