---
status: needs-review
sourceId: "bbf85a0ed997"
sourceChecksum: "bbf85a0ed997360f5021c08679956a5480fa40b76a8c2510048cc70ab20d8b62"
sourceUrl: "https://developers.openai.com/codex/subagents"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# Subagents 子代理

Codex 可以通过并行生成 specialized agents，然后在一个 response 中汇总结果，来运行 subagent workflows。这对于高度并行的复杂任务特别有帮助，例如 codebase exploration 或实现多步骤 feature plan。

借助 subagent workflows，你也可以根据任务定义具有不同 model configurations 和 instructions 的自定义 agents。

关于 subagent workflows 背后的概念和权衡，包括 context pollution、context rot 和 model-selection guidance，请参见 [Subagent concepts](https://developers.openai.com/codex/concepts/subagents)。

## 可用性

当前 Codex releases 默认启用 subagent workflows。

Subagent activity 目前会显示在 Codex app 和 CLI 中。IDE Extension 中的可见性即将推出。

Codex 只有在你明确要求时才会生成 subagents。因为每个 subagent 都会执行自己的 model 和 tool work，subagent workflows 比可比的 single-agent runs 消耗更多 tokens。

## 典型工作流

Codex 会处理跨 agents 的 orchestration，包括生成新的 subagents、路由 follow-up instructions、等待结果，以及关闭 agent threads。

当多个 agents 正在运行时，Codex 会等待所有请求的结果都可用，然后返回整合后的 response。

Codex 只有在你明确要求时才会生成新的 agent。

要实际体验，可以在你的项目上尝试以下 prompt：

```text
I would like to review the following points on the current PR (this branch vs main). Spawn one agent per point, wait for all of them, and summarize the result for each point.
1. Security issue
2. Code quality
3. Bugs
4. Race
5. Test flakiness
6. Maintainability of the code
```

## 管理 subagents

- 在 CLI 中使用 `/agent` 在 active agent threads 之间切换，并检查正在进行的 thread。
- 直接要求 Codex 引导正在运行的 subagent、停止它，或关闭已完成的 agent threads。

## Approvals 和 sandbox controls

Subagents 会继承你当前的 sandbox policy。

在 interactive CLI sessions 中，即使你正在查看 main thread，approval requests 也可能从 inactive agent threads 中出现。approval overlay 会显示 source thread label，你可以在 approve、reject 或回答请求前按 `o` 打开该 thread。

在 non-interactive flows 中，或每当某次运行无法显示新的 approval 时，需要新 approval 的 action 会失败，并且 Codex 会把错误返回给 parent workflow。

Codex 在生成 child 时，也会重新应用 parent turn 的 live runtime overrides。这包括你在 session 期间交互式设置的 sandbox 和 approval choices，例如 `/permissions` changes 或 `--yolo`，即使所选 custom agent file 设置了不同默认值也是如此。

你也可以为单独的 [custom agents](#custom-agents) 覆盖 sandbox configuration，例如明确标记某个 agent 以 read-only mode 工作。

## Custom agents

Codex 附带内置 agents：

- `default`：通用 fallback agent。
- `worker`：面向 implementation 和 fixes 的 execution-focused agent。
- `explorer`：偏重读取的 codebase exploration agent。

要定义自己的 custom agents，请在 `~/.codex/agents/` 下添加 standalone TOML files 作为个人 agents，或在 `.codex/agents/` 下添加 project-scoped agents。

每个文件定义一个 custom agent。Codex 会把这些文件作为 spawned sessions 的 configuration layers 加载，因此 custom agents 可以覆盖与普通 Codex session config 相同的 settings。这可能比专用 agent manifest 感觉更重，并且随着 authoring 和 sharing 的成熟，该格式可能演进。

每个 standalone custom agent file 必须定义：

- `name`
- `description`
- `developer_instructions`

可选字段（如 `nickname_candidates`、`model`、`model_reasoning_effort`、`sandbox_mode`、`mcp_servers` 和 `skills.config`）在省略时会从 parent session 继承。

### 全局 settings

全局 subagent settings 仍位于你的 [configuration](https://developers.openai.com/codex/config-basic#configuration-precedence) 中的 `[agents]` 下。

| Field                            | Type   | Required | Purpose                                                    |
| -------------------------------- | ------ | :------: | ---------------------------------------------------------- |
| `agents.max_threads`             | number |    No    | Concurrent open agent thread cap.                          |
| `agents.max_depth`               | number |    No    | Spawned agent nesting depth (root session starts at 0).    |
| `agents.job_max_runtime_seconds` | number |    No    | Default timeout per worker for `spawn_agents_on_csv` jobs. |

**Notes:**

- 当你未设置 `agents.max_threads` 时，它默认为 `6`。
- `agents.max_depth` 默认为 `1`，允许直接 child agent 生成，但阻止更深层嵌套。除非你明确需要 recursive delegation，否则请保留默认值。提高该值可能会把宽泛 delegation instructions 变成重复 fan-out，从而增加 token usage、latency 和 local resource consumption。`agents.max_threads` 仍会限制 concurrent open threads，但不会消除更深 recursion 带来的成本和可预测性风险。
- `agents.job_max_runtime_seconds` 是可选项。未设置时，`spawn_agents_on_csv` 会回退到其每次调用默认 timeout：每个 worker 1800 秒。
- 如果 custom agent name 与内置 agent（例如 `explorer`）匹配，你的 custom agent 优先。

### Custom agent file schema

| Field                    | Type     | Required | Purpose                                                         |
| ------------------------ | -------- | :------: | --------------------------------------------------------------- |
| `name`                   | string   |   Yes    | Agent name Codex uses when spawning or referring to this agent. |
| `description`            | string   |   Yes    | Human-facing guidance for when Codex should use this agent.     |
| `developer_instructions` | string   |   Yes    | Core instructions that define the agent's behavior.             |
| `nickname_candidates`    | string[] |    No    | Optional pool of display nicknames for spawned agents.          |

你也可以在 custom agent file 中包含其他受支持的 `config.toml` keys，例如 `model`、`model_reasoning_effort`、`sandbox_mode`、`mcp_servers` 和 `skills.config`。

Codex 会通过 `name` 字段识别 custom agent。让 filename 与 agent name 匹配是最简单的约定，但 `name` 字段才是 source of truth。

### Display nicknames

当你希望 Codex 为 spawned agents 分配更易读的 display names 时，使用 `nickname_candidates`。当你运行同一个 custom agent 的许多实例，并希望 UI 显示不同 labels，而不是重复同一个 agent name 时，这特别有帮助。

Nicknames 仅用于展示。Codex 仍通过 `name` 来识别和生成该 agent。

Nickname candidates 必须是非空且唯一的名称列表。每个 nickname 可以使用 ASCII letters、digits、spaces、hyphens 和 underscores。

示例：

```toml
name = "reviewer"
description = "PR reviewer focused on correctness, security, and missing tests."
developer_instructions = """
Review code like an owner.
Prioritize correctness, security, behavior regressions, and missing test coverage.
"""
nickname_candidates = ["Atlas", "Delta", "Echo"]
```

在实践中，Codex app 和 CLI 可以在 agent activity 出现的位置显示 nicknames，而底层 agent type 仍保持为 `reviewer`。

### 示例 custom agents

最好的 custom agents 范围窄且有明确倾向。给每个 agent 一个清晰 job、与该 job 匹配的 tool surface，以及能防止它漂移到相邻工作的 instructions。

#### 示例 1：PR review

这种模式把 review 分给三个聚焦的 custom agents：

- `pr_explorer` 映射 codebase 并收集证据。
- `reviewer` 查找 correctness、security 和 test risks。
- `docs_researcher` 通过专用 MCP server 检查 framework 或 API documentation。

Project config（`.codex/config.toml`）：

```toml
[agents]
max_threads = 6
max_depth = 1
```

`.codex/agents/pr-explorer.toml`：

```toml
name = "pr_explorer"
description = "Read-only codebase explorer for gathering evidence before changes are proposed."
model = "gpt-5.3-codex-spark"
model_reasoning_effort = "medium"
sandbox_mode = "read-only"
developer_instructions = """
Stay in exploration mode.
Trace the real execution path, cite files and symbols, and avoid proposing fixes unless the parent agent asks for them.
Prefer fast search and targeted file reads over broad scans.
"""
```

`.codex/agents/reviewer.toml`：

```toml
name = "reviewer"
description = "PR reviewer focused on correctness, security, and missing tests."
model = "gpt-5.4"
model_reasoning_effort = "high"
sandbox_mode = "read-only"
developer_instructions = """
Review code like an owner.
Prioritize correctness, security, behavior regressions, and missing test coverage.
Lead with concrete findings, include reproduction steps when possible, and avoid style-only comments unless they hide a real bug.
"""
```

`.codex/agents/docs-researcher.toml`：

```toml
name = "docs_researcher"
description = "Documentation specialist that uses the docs MCP server to verify APIs and framework behavior."
model = "gpt-5.4-mini"
model_reasoning_effort = "medium"
sandbox_mode = "read-only"
developer_instructions = """
Use the docs MCP server to confirm APIs, options, and version-specific behavior.
Return concise answers with links or exact references when available.
Do not make code changes.
"""

[mcp_servers.openaiDeveloperDocs]
url = "https://developers.openai.com/mcp"
```

这种设置适合类似这样的 prompts：

```text
Review this branch against main. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.
```

## 用 subagents 处理 CSV batches（experimental）

该工作流是 experimental，可能会随着 subagent support 演进而变化。当你有许多相似任务，并且每个 work item 可映射为一行时，使用 `spawn_agents_on_csv`。Codex 会读取 CSV、为每行生成一个 worker subagent、等待整个 batch 完成，并将组合结果导出为 CSV。

它适合重复 audits，例如：

- 每行审查一个 file、package 或 service
- 检查 incidents、PRs 或 migration targets 列表
- 为许多相似 inputs 生成结构化 summaries

该工具接受：

- `csv_path` 作为 source CSV
- `instruction` 作为 worker prompt template，使用 `{column_name}` placeholders
- `id_column`，当你希望从特定 column 获得稳定 item ids 时使用
- `output_schema`，当每个 worker 应返回具有固定 shape 的 JSON object 时使用
- `output_csv_path`、`max_concurrency` 和 `max_runtime_seconds` 用于 job control

每个 worker 必须且只能调用一次 `report_agent_job_result`。如果某个 worker 退出时没有报告结果，Codex 会在导出的 CSV 中将该行标记为 error。

示例 prompt：

```text
Create /tmp/components.csv with columns path,owner and one row per frontend component.

Then call spawn_agents_on_csv with:
- csv_path: /tmp/components.csv
- id_column: path
- instruction: "Review {path} owned by {owner}. Return JSON with keys path, risk, summary, and follow_up via report_agent_job_result."
- output_csv_path: /tmp/components-review.csv
- output_schema: an object with required string fields path, risk, summary, and follow_up
```

当你通过 `codex exec` 运行它时，Codex 会在 batch 运行期间在 `stderr` 上显示单行 progress update。导出的 CSV 包含原始 row data 以及 metadata，例如 `job_id`、`item_id`、`status`、`last_error` 和 `result_json`。

相关 runtime settings：

- `agents.max_threads` 限制 concurrent open agent threads 的数量。
- `agents.job_max_runtime_seconds` 设置 CSV fan-out jobs 的默认 per-worker timeout。每次调用的 `max_runtime_seconds` override 优先。
- `sqlite_home` 控制 Codex 存储 agent jobs 及其导出结果所用 SQLite-backed state 的位置。

#### 示例 2：Frontend integration debugging

这种模式适用于跨 application code 和运行中产品的 UI regressions、flaky browser flows 或 integration bugs。

Project config（`.codex/config.toml`）：

```toml
[agents]
max_threads = 6
max_depth = 1
```

`.codex/agents/code-mapper.toml`：

```toml
name = "code_mapper"
description = "Read-only codebase explorer for locating the relevant frontend and backend code paths."
model = "gpt-5.4-mini"
model_reasoning_effort = "medium"
sandbox_mode = "read-only"
developer_instructions = """
Map the code that owns the failing UI flow.
Identify entry points, state transitions, and likely files before the worker starts editing.
"""
```

`.codex/agents/browser-debugger.toml`：

```toml
name = "browser_debugger"
description = "UI debugger that uses browser tooling to reproduce issues and capture evidence."
model = "gpt-5.4"
model_reasoning_effort = "high"
sandbox_mode = "workspace-write"
developer_instructions = """
Reproduce the issue in the browser, capture exact steps, and report what the UI actually does.
Use browser tooling for screenshots, console output, and network evidence.
Do not edit application code.
"""

[mcp_servers.chrome_devtools]
url = "http://localhost:3000/mcp"
startup_timeout_sec = 20
```

`.codex/agents/ui-fixer.toml`：

```toml
name = "ui_fixer"
description = "Implementation-focused agent for small, targeted fixes after the issue is understood."
model = "gpt-5.3-codex-spark"
model_reasoning_effort = "medium"
developer_instructions = """
Own the fix once the issue is reproduced.
Make the smallest defensible change, keep unrelated files untouched, and validate only the behavior you changed.
"""

[[skills.config]]
path = "/Users/me/.agents/skills/docs-editor/SKILL.md"
enabled = false
```

这种设置适合类似这样的 prompts：

```text
Investigate why the settings modal fails to save. Have browser_debugger reproduce it, code_mapper trace the responsible code path, and ui_fixer implement the smallest fix once the failure mode is clear.
```

