---
title: "高级配置"
description: "More advanced configuration options for Codex local clients"
outline: deep
---

# 高级配置

**文档集**：Codex\
**分组**：高级配置\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/config-advanced](https://developers.openai.com/codex/config-advanced)
- Markdown 来源：[https://developers.openai.com/codex/config-advanced.md](https://developers.openai.com/codex/config-advanced.md)
- 抓取时间：2026-06-27T05:54:55.462Z
- Checksum：`b5df4e0abd53ed1dfc0dedb4c06641fe4b921a0d5ebbfbf5e97285496ec3af64`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
当你需要对 providers、policies 和 integrations 进行更多控制时，使用这些选项。快速入门请参见 [Config basics](/mirror/codex/config-basic)。

有关 project guidance、reusable capabilities、custom slash commands、subagent workflows 和 integrations 的背景，请参见 [Customization](/mirror/codex/concepts/customization)。有关 configuration keys，请参见 [Configuration Reference](/mirror/codex/config-reference)。

## Profiles

Profiles 让你可以保存命名 configuration layers，并从 CLI 在它们之间切换。当你传入 `--profile profile-name` 时，Codex 会加载
`~/.codex/config.toml`，然后叠加
`~/.codex/profile-name.config.toml`。
Profile names 可以包含字母、数字、连字符和下划线。

为每个 profile 创建单独的 TOML 文件。在 profile 文件中使用 top-level config keys；不要把它们嵌套在 `[profiles.profile-name]` 下。

```toml
# ~/.codex/deep-review.config.toml
model = "gpt-5.5"
model_reasoning_effort = "xhigh"
approval_policy = "on-request"
model_catalog_json = "/Users/me/.codex/model-catalogs/deep-review.json"
```

```shell
codex --profile deep-review
codex exec --profile deep-review "review this change"
```

因为 profile 文件是位于 base user config 之上、project 和 CLI config 之下的一层，它只需要包含与 base config 不同的值。Profile files 也可以覆盖 `model_catalog_json`；当两个文件都设置它时，Codex 使用 profile 值。

在 Codex 0.134.0 及更高版本中，`--profile` 不再从 `config.toml` 读取 `[profiles.profile-name]`，也不再支持 top-level `profile = "profile-name"` selector。请把 legacy profile settings 移到
`~/.codex/profile-name.config.toml`，然后从 `config.toml` 中删除匹配的
`[profiles.profile-name]` table 和 `profile = "profile-name"` selector。

## 来自 CLI 的一次性 overrides

除了编辑 `~/.codex/config.toml`，你也可以从 CLI 为单次运行覆盖配置：

- 当存在专用 flags 时优先使用它们（例如 `--model`）。
- 当你需要覆盖任意 key 时，使用 `-c` / `--config`。

示例：

```shell
# Dedicated flag
codex --model gpt-5.4

# Generic key/value override (value is TOML, not JSON)
codex --config model='"gpt-5.4"'
codex --config sandbox_workspace_write.network_access=true
codex --config 'shell_environment_policy.include_only=["PATH","HOME"]'
```

注意：

- Keys 可以使用 dot notation 来设置 nested values（例如 `mcp_servers.context7.enabled=false`）。
- `--config` values 会按 TOML 解析。拿不准时，请 quote 该值，避免 shell 按空格拆分。
- 如果值无法按 TOML 解析，Codex 会把它当作 string。

## Config 和 state 位置

Codex 将本地 state 存储在 `CODEX_HOME` 下（默认是 `~/.codex`）。

你可能会在那里看到的常见文件：

- `config.toml`（你的 local configuration）
- `auth.json`（如果你使用 file-based credential storage）或你的 OS keychain/keyring
- `history.jsonl`（如果启用了 history persistence）
- 其他 per-user state，例如 logs 和 caches

有关 authentication details（包括 credential storage modes），请参见 [Authentication](/mirror/codex/auth)。有关 configuration keys 的完整列表，请参见 [Configuration Reference](/mirror/codex/config-reference)。

有关 checked into repos 或 system paths 的 shared defaults、rules 和 skills，请参见 [Team Config](/mirror/codex/enterprise/admin-setup#team-config)。

如果你只是需要把内置 OpenAI provider 指向 LLM proxy、router 或启用了 data-residency 的 project，请在 `config.toml` 中设置 `openai_base_url`，而不是定义新的 provider。这会更改内置 `openai` provider 的 base URL，而无需单独的 `model_providers.&lt;id&gt;` entry。

```toml
openai_base_url = "https://us.api.openai.com/v1"
```

## Project config files (`.codex/config.toml`)

除了 user config，Codex 还会读取 repo 内 `.codex/config.toml` 文件中的 project-scoped overrides。Codex 会从 project root 走到当前 working directory，并加载它找到的每个 `.codex/config.toml`。如果多个文件定义同一个 key，最接近当前 working directory 的文件胜出。

出于安全原因，Codex 只在 project 被 trust 时加载 project-scoped config files。如果 project 不受信任，Codex 会忽略 project `.codex/` layers，包括 `.codex/config.toml`、project-local hooks 和 project-local rules。User 和 system layers 仍然分开并继续加载。

Project config 中的 relative paths（例如 `model_instructions_file`）会相对于包含该 `config.toml` 的 `.codex/` folder 解析。

Project config files 不能覆盖那些会重定向 credentials、改变 host-owned app request metadata、更改 provider auth、选择 config profiles，或运行 machine-local notification/telemetry commands 的设置。Codex 会忽略 project-local `.codex/config.toml` 中的以下 keys，并在看到它们时打印 startup warning：`openai_base_url`、`chatgpt_base_url`、`apps_mcp_product_sku`、`model_provider`、`model_providers`、`notify`、`profile`、`profiles`、`experimental_realtime_ws_base_url` 和 `otel`。请在 user-level `~/.codex/config.toml` 中设置 provider、notification 和 telemetry keys；使用 `--profile profile-name` 和 `~/.codex/profile-name.config.toml` 选择 config profiles。

## Hooks

Codex 也可以从 `hooks.json` 文件，或从位于 active config layers 旁边的 `config.toml` 文件中的 inline `[hooks]` tables 加载 lifecycle hooks。

实践中，四个最有用的位置是：

- `~/.codex/hooks.json`
- `~/.codex/config.toml`
- `&lt;repo&gt;/.codex/hooks.json`
- `&lt;repo&gt;/.codex/config.toml`

Project-local hooks 只有在 project `.codex/` layer 受信任时才会加载。
User-level hooks 独立于 project trust。

Inline TOML hooks 使用与 `hooks.json` 相同的 event structure：

```toml
[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py"'
timeout = 30
statusMessage = "Checking Bash command"
```

如果单个 layer 同时包含 `hooks.json` 和 inline `[hooks]`，Codex 会同时加载并发出 warning。每个 layer 优先使用一种表示方式。

有关当前 event list、input fields、output behavior 和 limitations，请参见
[Hooks](/mirror/codex/hooks)。

## Agent roles（`config.toml` 中的 `[agents]`）

有关 subagent role configuration（`config.toml` 中的 `[agents]`），请参见 [Subagents](/mirror/codex/subagents)。

## Project root detection

Codex 会通过从 working directory 向上遍历直到 project root，来发现 project configuration（例如 `.codex/` layers 和 `AGENTS.md`）。

默认情况下，Codex 将包含 `.git` 的目录视为 project root。要自定义此行为，请在 `config.toml` 中设置 `project_root_markers`：

```toml
# Treat a directory as the project root when it contains any of these markers.
project_root_markers = [".git", ".hg", ".sl"]
```

设置 `project_root_markers = []` 可跳过向父目录搜索，并把当前 working directory 视为 project root。

## Custom model providers

Model provider 定义 Codex 如何连接到模型（base URL、wire API、authentication 和可选 HTTP headers）。Custom providers 不能复用保留的内置 provider IDs：`openai`、`ollama` 和 `lmstudio`。

定义额外 providers，并让 `model_provider` 指向它们：

```toml
model = "gpt-5.4"
model_provider = "proxy"

[model_providers.proxy]
name = "OpenAI using LLM proxy"
base_url = "http://proxy.example.com"
env_key = "OPENAI_API_KEY"

[model_providers.local_ollama]
name = "Ollama"
base_url = "http://localhost:11434/v1"

[model_providers.mistral]
name = "Mistral"
base_url = "https://api.mistral.ai/v1"
env_key = "MISTRAL_API_KEY"
```

需要时添加 request headers：

```toml
[model_providers.example]
http_headers = { "X-Example-Header" = "example-value" }
env_http_headers = { "X-Example-Features" = "EXAMPLE_FEATURES" }
```

当 provider 需要 Codex 从外部 credential helper 获取 bearer tokens 时，使用 command-backed authentication：

```toml
[model_providers.proxy]
name = "OpenAI using LLM proxy"
base_url = "https://proxy.example.com/v1"
wire_api = "responses"

[model_providers.proxy.auth]
command = "/usr/local/bin/fetch-codex-token"
args = ["--audience", "codex"]
timeout_ms = 5000
refresh_interval_ms = 300000
```

Auth command 不接收 `stdin`，并且必须把 token 打印到 stdout。Codex 会 trim 周围空白，把空 token 视为 error，并在 `refresh_interval_ms` 主动刷新；设置 `refresh_interval_ms = 0` 可仅在 authentication retry 之后刷新。不要把 `[model_providers.&lt;id&gt;.auth]` 与 `env_key`、`experimental_bearer_token` 或 `requires_openai_auth` 组合使用。

### Amazon Bedrock provider

Codex 包含内置 `amazon-bedrock` model provider。直接把它设置为
`model_provider`；与 custom providers 不同，这个内置 provider 只支持嵌套的 AWS profile 和 region overrides。

```toml
model_provider = "amazon-bedrock"
model = "<bedrock-model-id>"

[model_providers.amazon-bedrock.aws]
profile = "default"
region = "eu-central-1"
```

如果省略 `profile`，Codex 会使用标准 AWS credential chain。将
`region` 设置为应处理 requests 的受支持 Bedrock region。

有关完整 setup flow、authentication options、supported models 和 feature availability，请参见 [Use Codex with Amazon Bedrock](/mirror/codex/amazon-bedrock)。

## OSS mode（local providers）

当你传入 `--oss` 时，Codex 可以针对本地 “open source” provider 运行（例如 Ollama 或 LM Studio）。如果传入 `--oss` 但未指定 provider，Codex 会使用 `oss_provider` 作为默认值。

```toml
# Default local provider used with `--oss`
oss_provider = "ollama" # or "lmstudio"
```

## Azure provider 和 per-provider tuning

```toml
[model_providers.azure]
name = "Azure"
base_url = "https://YOUR_PROJECT_NAME.openai.azure.com/openai"
env_key = "AZURE_OPENAI_API_KEY"
query_params = { api-version = "2025-04-01-preview" }
wire_api = "responses"
request_max_retries = 4
stream_max_retries = 10
stream_idle_timeout_ms = 300000
```

要更改内置 OpenAI provider 的 base URL，请使用 `openai_base_url`；不要创建 `[model_providers.openai]`，因为你不能覆盖内置 provider IDs。

## 使用 data residency 的 ChatGPT customers

启用了 [data residency](https://help.openai.com/en/articles/9903489-data-residency-and-inference-residency-for-chatgpt) 的 projects 可以创建一个 model provider，使用[正确前缀](https://platform.openai.com/docs/guides/your-data#which-models-and-features-are-eligible-for-data-residency)更新 base_url。

```toml
model_provider = "openaidr"
[model_providers.openaidr]
name = "OpenAI Data Residency"
base_url = "https://us.api.openai.com/v1" # Replace 'us' with domain prefix
```

## Model reasoning、verbosity 和 limits

```toml
model_reasoning_summary = "none"          # Disable summaries
model_verbosity = "low"                   # Shorten responses
model_supports_reasoning_summaries = true # Force reasoning
model_context_window = 128000             # Context window size
```

`model_verbosity` 只适用于使用 Responses API 的 providers。Chat Completions providers 会忽略该设置。

## Approval policies 和 sandbox modes

选择 approval strictness（影响 Codex 何时暂停）和 sandbox level（影响文件/网络访问）。

在编辑 `config.toml` 时需要留意的 operational details，请参见 [Common sandbox and approval combinations](/mirror/codex/agent-approvals-security#common-sandbox-and-approval-combinations)、[Protected paths in writable roots](/mirror/codex/agent-approvals-security#protected-paths-in-writable-roots) 和 [Network access](/mirror/codex/agent-approvals-security#network-access)。

有关一起配置 filesystem 和 network access 的 beta permission profiles，请参见 [Permissions](/mirror/codex/permissions)。

你也可以使用 granular approval policy（`approval_policy = { granular = { ... } }`）来允许或 auto-reject 单个 prompt categories。当你希望某些情况保持正常 interactive approvals，但希望另一些情况（例如 `request_permissions` 或 skill-script prompts）自动 fail closed 时，这很有用。

设置 `approvals_reviewer = "auto_review"` 可将符合条件的 interactive approval requests 路由到 automatic review。这改变的是 reviewer，而不是 sandbox 边界。

使用 `[auto_review].policy` 配置本地 reviewer policy instructions。Managed
`guardian_policy_config` 优先。

```toml
approval_policy = "untrusted"   # Other options: on-request, never, or { granular = { ... } }
approvals_reviewer = "user"     # Or "auto_review" for automatic review
sandbox_mode = "workspace-write"
allow_login_shell = false       # Optional hardening: disallow login shells for shell tools

# Example granular approval policy:
# approval_policy = { granular = {
#   sandbox_approval = true,
#   rules = true,
#   mcp_elicitations = true,
#   request_permissions = false,
#   skill_approval = false
# } }

[sandbox_workspace_write]
exclude_tmpdir_env_var = false  # Allow $TMPDIR
exclude_slash_tmp = false       # Allow /tmp
writable_roots = ["/Users/YOU/.pyenv/shims"]
network_access = false          # Opt in to outbound network

[auto_review]
policy = """
Use your organization's automatic review policy.
"""
```

### Named permission profiles

有关 built-in profiles、custom profile syntax，以及完整 filesystem 和 network configuration model，请参见 [Permissions](/mirror/codex/permissions)。

有关完整 key list 和 requirements constraints，请参见
[Configuration Reference](/mirror/codex/config-reference) 和
[Managed configuration](/mirror/codex/enterprise/managed-configuration)。

在 workspace-write mode 中，某些 environments 会让 `.git/` 和 `.codex/`
  保持 read-only，即使 workspace 的其他部分可写。这就是为什么
  `git commit` 等 commands 仍可能需要 approval，才能在 sandbox 外运行。如果你希望 Codex 跳过特定 commands（例如在 sandbox 外阻止 `git
  commit`），请使用
  &lt;a href="/codex/rules"&gt;rules&lt;/a&gt;。

完全禁用 sandboxing（仅在你的 environment 已经隔离 processes 时使用）：

```toml
sandbox_mode = "danger-full-access"
```

## Shell environment policy

`shell_environment_policy` 控制 Codex 会把哪些环境变量传递给它启动的任何 subprocess（例如模型提出的 tool-command）。从 clean start（`inherit = "none"`）或 trimmed set（`inherit = "core"`）开始，然后叠加 excludes、includes 和 overrides，以避免泄露 secrets，同时仍提供 tasks 所需的 paths、keys 或 flags。

```toml
[shell_environment_policy]
inherit = "none"
set = { PATH = "/usr/bin", MY_FLAG = "1" }
ignore_default_excludes = false
exclude = ["AWS_*", "AZURE_*"]
include_only = ["PATH", "HOME"]
```

Patterns 是大小写不敏感的 globs（`*`、`?`、`[A-Z]`）；`ignore_default_excludes = false` 会在你的 includes/excludes 运行前保留自动 KEY/SECRET/TOKEN filter。

## MCP servers

配置详情请参见专门的 [MCP documentation](/mirror/codex/mcp)。

## Observability 和 telemetry

启用 OpenTelemetry（OTel）log export 来跟踪 Codex runs（API requests、SSE/events、prompts、tool approvals/results）。默认禁用；通过 `[otel]` 选择加入：

```toml
[otel]
environment = "staging"   # defaults to "dev"
exporter = "none"         # set to otlp-http or otlp-grpc to send events
log_user_prompt = false   # redact user prompts unless explicitly enabled
```

选择 exporter：

```toml
[otel]
exporter = { otlp-http = {
  endpoint = "https://otel.example.com/v1/logs",
  protocol = "binary",
  headers = { "x-otlp-api-key" = "${OTLP_TOKEN}" }
}}
```

```toml
[otel]
exporter = { otlp-grpc = {
  endpoint = "https://otel.example.com:4317",
  headers = { "x-otlp-meta" = "abc123" }
}}
```

如果 `exporter = "none"`，Codex 会记录 events 但不发送任何内容。Exporters 会异步批处理并在 shutdown 时 flush。Event metadata 包括 service name、CLI version、env tag、conversation id、model、sandbox/approval settings，以及 per-event fields（参见 [Config Reference](/mirror/codex/config-reference)）。

### 会发出什么

Codex 会为 runs 和 tool usage 发出 structured log events。代表性 event types 包括：

- `codex.conversation_starts`（model、reasoning settings、sandbox/approval policy）
- `codex.api_request`（attempt、status/success、duration 和 error details）
- `codex.sse_event`（stream event kind、success/failure、duration，以及 `response.completed` 上的 token counts）
- `codex.websocket_request` 和 `codex.websocket_event`（request duration，以及 per-message kind/success/error）
- `codex.user_prompt`（length；除非显式启用，否则 content 会被 redacted）
- `codex.tool_decision`（approved/denied，以及 decision 来自 config 还是 user）
- `codex.tool_result`（duration、success、output snippet）

### 发出的 OTel metrics

当 OTel metrics pipeline 启用时，Codex 会为 API、stream 和 tool activity 发出 counters 和 duration histograms。

下面的每个 metric 还包含默认 metadata tags：`auth_mode`、`originator`、`session_source`、`model` 和 `app.version`。

| Metric                                | Type      | Fields              | Description                                                       |
| ------------------------------------- | --------- | ------------------- | ----------------------------------------------------------------- |
| `codex.api_request`                   | counter   | `status`, `success` | 按 HTTP status 和 success/failure 统计的 API request count。             |
| `codex.api_request.duration_ms`       | histogram | `status`, `success` | API request duration，以 milliseconds 计。                             |
| `codex.sse_event`                     | counter   | `kind`, `success`   | 按 event kind 和 success/failure 统计的 SSE event count。                |
| `codex.sse_event.duration_ms`         | histogram | `kind`, `success`   | SSE event processing duration，以 milliseconds 计。                    |
| `codex.websocket.request`             | counter   | `success`           | 按 success/failure 统计的 WebSocket request count。                       |
| `codex.websocket.request.duration_ms` | histogram | `success`           | WebSocket request duration，以 milliseconds 计。                       |
| `codex.websocket.event`               | counter   | `kind`, `success`   | 按 type 和 success/failure 统计的 WebSocket message/event count。        |
| `codex.websocket.event.duration_ms`   | histogram | `kind`, `success`   | WebSocket message/event processing duration，以 milliseconds 计。      |
| `codex.tool.call`                     | counter   | `tool`, `success`   | 按 tool name 和 success/failure 统计的 tool invocation count。           |
| `codex.tool.call.duration_ms`         | histogram | `tool`, `success`   | 按 tool name 和 outcome 统计的 tool execution duration，以 milliseconds 计。 |

有关 telemetry 的更多安全和隐私指导，请参见 [Security](/mirror/codex/agent-approvals-security#monitoring-and-telemetry)。

### Metrics

默认情况下，Codex 会定期向 OpenAI 发送少量匿名 usage 和 health data。这有助于检测 Codex 是否无法正常工作，并显示哪些 features 和 configuration options 正在被使用，让 Codex team 能专注于最重要的内容。这些 metrics 不包含任何 personally identifiable information（PII）。Metrics collection 独立于 OTel log/trace export。

如果你想在一台机器上的所有 Codex surfaces 中完全禁用 metrics collection，请在 config 中设置 analytics flag：

```toml
[analytics]
enabled = false
```

每个 metric 都包含自己的 fields，以及下面的 default context fields。

#### Default context fields（适用于每个 event/metric）

- `auth_mode`：`swic` | `api` | `unknown`。
- `model`：所用模型的名称。
- `app.version`：Codex version。

#### Metrics catalog

每个 metric 都包含 required fields，以及上面的 default context fields。下面的 metric names 省略 `codex.` prefix。
大多数 metric names 集中在 `codex-rs/otel/src/metrics/names.rs`；这里也包含从该文件外部发出的 feature-specific metrics。
如果某个 metric 包含 `tool` field，它反映的是所使用的 internal tool（例如 `apply_patch` 或 `shell`），不包含 `codex` 正试图应用的实际 shell command 或 patch。

#### Runtime 和 model transport

| Metric                                          | Type      | Fields               | Description                                                  |
| ----------------------------------------------- | --------- | -------------------- | ------------------------------------------------------------ |
| `api_request`                                   | counter   | `status`, `success`  | 按 HTTP status 和 success/failure 统计的 API request count。        |
| `api_request.duration_ms`                       | histogram | `status`, `success`  | API request duration，以 milliseconds 计。                        |
| `sse_event`                                     | counter   | `kind`, `success`    | 按 event kind 和 success/failure 统计的 SSE event count。           |
| `sse_event.duration_ms`                         | histogram | `kind`, `success`    | SSE event processing duration，以 milliseconds 计。               |
| `websocket.request`                             | counter   | `success`            | 按 success/failure 统计的 WebSocket request count。                  |
| `websocket.request.duration_ms`                 | histogram | `success`            | WebSocket request duration，以 milliseconds 计。                  |
| `websocket.event`                               | counter   | `kind`, `success`    | 按 type 和 success/failure 统计的 WebSocket message/event count。   |
| `websocket.event.duration_ms`                   | histogram | `kind`, `success`    | WebSocket message/event processing duration，以 milliseconds 计。 |
| `responses_api_overhead.duration_ms`            | histogram |                      | 来自 WebSocket responses 的 Responses API overhead timing。      |
| `responses_api_inference_time.duration_ms`      | histogram |                      | 来自 WebSocket responses 的 Responses API inference timing。     |
| `responses_api_engine_iapi_ttft.duration_ms`    | histogram |                      | Responses API engine IAPI time-to-first-token timing。        |
| `responses_api_engine_service_ttft.duration_ms` | histogram |                      | Responses API engine service time-to-first-token timing。     |
| `responses_api_engine_iapi_tbt.duration_ms`     | histogram |                      | Responses API engine IAPI time-between-token timing。         |
| `responses_api_engine_service_tbt.duration_ms`  | histogram |                      | Responses API engine service time-between-token timing。      |
| `transport.fallback_to_http`                    | counter   | `from_wire_api`      | WebSocket-to-HTTP fallback count。                            |
| `remote_models.fetch_update.duration_ms`        | histogram |                      | 获取 remote model definitions 的耗时。                      |
| `remote_models.load_cache.duration_ms`          | histogram |                      | 加载 remote model cache 的耗时。                         |
| `startup_prewarm.duration_ms`                   | histogram | `status`             | 按 outcome 统计的 startup prewarm duration。                         |
| `startup_prewarm.age_at_first_turn_ms`          | histogram | `status`             | 第一个 real turn 解析 startup prewarm 时的 age。    |
| `cloud_requirements.fetch.duration_ms`          | histogram |                      | Workspace-managed cloud requirements fetch duration。         |
| `cloud_requirements.fetch_attempt`              | counter   | 见说明             | Workspace-managed cloud requirements fetch attempts。         |
| `cloud_requirements.fetch_final`                | counter   | 见说明             | Final workspace-managed cloud requirements fetch outcome。    |
| `cloud_requirements.load`                       | counter   | `trigger`, `outcome` | Workspace-managed cloud requirements load outcome。           |

`cloud_requirements.fetch_attempt` metric 包含 `trigger`、`attempt`、`outcome` 和 `status_code` fields。`cloud_requirements.fetch_final` metric 包含 `trigger`、`outcome`、`reason`、`attempt_count` 和 `status_code` fields。

#### Turn 和 tool activity

| Metric                                 | Type      | Fields                                                                    | Description                                                                                                      |
| -------------------------------------- | --------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `turn.e2e_duration_ms`                 | histogram |                                                                           | 完整 turn 的 end-to-end time。                                                                                 |
| `turn.ttft.duration_ms`                | histogram |                                                                           | turn 的 time to first token。                                                                                  |
| `turn.ttfm.duration_ms`                | histogram |                                                                           | turn 的 time to first model output item。                                                                      |
| `turn.network_proxy`                   | counter   | `active`, `tmp_mem_enabled`                                               | managed network proxy 在该 turn 中是否 active。                                                       |
| `turn.memory`                          | counter   | `read_allowed`, `feature_enabled`, `config_use_memories`, `has_citations` | Per-turn memory read availability 和 memory citation usage。                                                     |
| `turn.tool.call`                       | histogram | `tmp_mem_enabled`                                                         | turn 中的 tool call 数量。                                                                                |
| `turn.token_usage`                     | histogram | `token_type`, `tmp_mem_enabled`                                           | 按 token type 统计的 per-turn token usage（`total`、`input`、`cached_input`、`output` 或 `reasoning_output`）。          |
| `tool.call`                            | counter   | `tool`, `success`                                                         | 按 tool name 和 success/failure 统计的 tool invocation count。                                                          |
| `tool.call.duration_ms`                | histogram | `tool`, `success`                                                         | 按 tool name 和 outcome 统计的 tool execution duration，以 milliseconds 计。                                                |
| `tool.unified_exec`                    | counter   | `tty`                                                                     | 按 TTY mode 统计的 Unified exec tool calls。                                                                             |
| `approval.requested`                   | counter   | `tool`, `approved`                                                        | Tool approval request result（`approved`、`approved_with_amendment`、`approved_for_session`、`denied`、`abort`）。 |
| `mcp.call`                             | counter   | 见说明                                                                  | MCP tool invocation result。                                                                                      |
| `mcp.call.duration_ms`                 | histogram | 见说明                                                                  | MCP tool invocation duration。                                                                                    |
| `mcp.tools.list.duration_ms`           | histogram | `cache`                                                                   | MCP tool-list duration，包括 cache hit/miss state。                                                          |
| `mcp.tools.fetch_uncached.duration_ms` | histogram |                                                                           | 未命中 cache 的 MCP tool fetches duration。                                                                |
| `mcp.tools.cache_write.duration_ms`    | histogram |                                                                           | Codex Apps MCP tool-cache writes 的耗时。                                                                    |
| `hooks.run`                            | counter   | `hook_name`, `source`, `status`                                           | 按 hook name、source 和 status 统计的 hook run count。                                                                 |
| `hooks.run.duration_ms`                | histogram | `hook_name`, `source`, `status`                                           | Hook run duration，以 milliseconds 计。                                                                               |

`mcp.call` 和 `mcp.call.duration_ms` metrics 包含 `status`；普通 tool-call emissions 还会包含 `tool`，以及可用时的 `connector_id` 和 `connector_name`。Blocked Codex Apps MCP calls 可能只带 `status` 发出 `mcp.call`。

#### Threads、tasks 和 features

| Metric                            | Type      | Fields                | Description                                                                      |
| --------------------------------- | --------- | --------------------- | -------------------------------------------------------------------------------- |
| `feature.state`                   | counter   | `feature`, `value`    | 与 defaults 不同的 feature values（每个 non-default 发出一行）。         |
| `status_line`                     | counter   |                       | Session 启动时配置了 status line。                                   |
| `model_warning`                   | counter   |                       | 发送给 model 的 warning。                                                       |
| `thread.started`                  | counter   | `is_git`              | 创建的新 thread，并标注 working directory 是否在 Git repo 中。    |
| `conversation.turn.count`         | counter   |                       | 每个 thread 的 user/assistant turns 数，在 thread 结束时记录。              |
| `thread.fork`                     | counter   | `source`              | 通过 fork existing thread 创建的新 thread。                                |
| `thread.rename`                   | counter   |                       | Thread 被重命名。                                                                  |
| `thread.side`                     | counter   | `source`              | 创建了 side conversation。                                                       |
| `thread.skills.enabled_total`     | histogram |                       | 新 thread 启用的 skills 数量。                                       |
| `thread.skills.kept_total`        | histogram |                       | Prompt rendering 后保留的 enabled skills 数量。                            |
| `thread.skills.truncated`         | histogram |                       | Skill rendering 是否截断 enabled skills list（`1` 或 `0`）。          |
| `task.compact`                    | counter   | `type`                | compactions 数量，按 type（`remote` 或 `local`）统计，包括 manual 和 auto。 |
| `task.review`                     | counter   |                       | review 触发次数。                                                     |
| `task.undo`                       | counter   |                       | undo actions 触发次数。                                                |
| `task.user_shell`                 | counter   |                       | user shell actions 数量（例如 TUI 中的 `!`）。                       |
| `shell_snapshot`                  | counter   | 见说明              | shell snapshot 是否成功。                                       |
| `shell_snapshot.duration_ms`      | histogram | `success`             | shell snapshot 耗时。                                                   |
| `skill.injected`                  | counter   | `status`, `skill`     | 按 skill 统计的 skill injection outcomes。                                               |
| `plugins.startup_sync`            | counter   | `transport`, `status` | Curated plugin startup sync attempts。                                            |
| `plugins.startup_sync.final`      | counter   | `transport`, `status` | Final curated plugin startup sync outcome。                                       |
| `multi_agent.spawn`               | counter   | `role`                | 按 role 统计的 agent spawns。                                                            |
| `multi_agent.resume`              | counter   |                       | Agent resumes。                                                                  |
| `multi_agent.nickname_pool_reset` | counter   |                       | Agent nickname pool resets。                                                      |

`shell_snapshot` metric 包含 `success`，失败时还包含 `failure_reason`。

#### Memory 和 local state

| Metric                         | Type      | Fields                    | Description                                               |
| ------------------------------ | --------- | ------------------------- | --------------------------------------------------------- |
| `memory.phase1`                | counter   | `status`                  | 按 status 统计的 memory phase 1 job counts。                      |
| `memory.phase1.e2e_ms`         | histogram |                           | Memory phase 1 的 end-to-end duration。                   |
| `memory.phase1.output`         | counter   |                           | Memory phase 1 outputs written。                           |
| `memory.phase1.token_usage`    | histogram | `token_type`              | 按 token type 统计的 memory phase 1 token usage。                 |
| `memory.phase2`                | counter   | `status`                  | 按 status 统计的 memory phase 2 job counts。                      |
| `memory.phase2.e2e_ms`         | histogram |                           | Memory phase 2 的 end-to-end duration。                   |
| `memory.phase2.input`          | counter   |                           | Memory phase 2 input count。                               |
| `memory.phase2.token_usage`    | histogram | `token_type`              | 按 token type 统计的 memory phase 2 token usage。                 |
| `memories.usage`               | counter   | `kind`, `tool`, `success` | 按 kind、tool 和 success/failure 统计的 memory usage。          |
| `external_agent_config.detect` | counter   | 见说明                  | 按 migration item type 统计的 external agent config detections。  |
| `external_agent_config.import` | counter   | 见说明                  | 按 migration item type 统计的 external agent config imports。     |
| `db.backfill`                  | counter   | `status`                  | Initial state DB backfill results（`upserted`、`failed`）。 |
| `db.backfill.duration_ms`      | histogram | `status`                  | Initial state DB backfill 的耗时。                |
| `db.error`                     | counter   | `stage`                   | State DB operations 期间的 errors。                        |

`external_agent_config.detect` 和 `external_agent_config.import` metrics 包含 `migration_type`；skills migrations 还包含 `skills_count`。

#### Windows sandbox

| Metric                                           | Type      | Fields                                    | Description                                           |
| ------------------------------------------------ | --------- | ----------------------------------------- | ----------------------------------------------------- |
| `windows_sandbox.setup_success`                  | counter   | `originator`, `mode`                      | Windows sandbox setup successes。                      |
| `windows_sandbox.setup_failure`                  | counter   | `originator`, `mode`                      | Windows sandbox setup failures。                       |
| `windows_sandbox.setup_duration_ms`              | histogram | `result`, `originator`, `mode`            | Windows sandbox setup duration。                       |
| `windows_sandbox.elevated_setup_success`         | counter   |                                           | Elevated Windows sandbox setup successes。             |
| `windows_sandbox.elevated_setup_failure`         | counter   | 见说明                                  | Elevated Windows sandbox setup failures。              |
| `windows_sandbox.elevated_setup_canceled`        | counter   | 见说明                                  | Canceled elevated Windows sandbox setup attempts。     |
| `windows_sandbox.elevated_setup_duration_ms`     | histogram | `result`                                  | Elevated Windows sandbox setup duration。              |
| `windows_sandbox.elevated_prompt_shown`          | counter   |                                           | Elevated sandbox setup prompt shown。                  |
| `windows_sandbox.elevated_prompt_accept`         | counter   |                                           | Elevated sandbox setup prompt accepted。               |
| `windows_sandbox.elevated_prompt_use_legacy`     | counter   |                                           | 用户从 elevated prompt 中选择了 legacy sandbox。   |
| `windows_sandbox.elevated_prompt_quit`           | counter   |                                           | 用户从 elevated prompt 退出。                   |
| `windows_sandbox.fallback_prompt_shown`          | counter   |                                           | Fallback sandbox prompt shown。                        |
| `windows_sandbox.fallback_retry_elevated`        | counter   |                                           | 用户从 fallback prompt 重试 elevated setup。 |
| `windows_sandbox.fallback_use_legacy`            | counter   |                                           | 用户从 fallback prompt 选择 legacy sandbox。   |
| `windows_sandbox.fallback_prompt_quit`           | counter   |                                           | 用户从 fallback prompt 退出。                   |
| `windows_sandbox.legacy_setup_preflight_failed`  | counter   | 见说明                                  | Legacy Windows sandbox setup preflight failure。       |
| `windows_sandbox.setup_elevated_sandbox_command` | counter   |                                           | Elevated sandbox setup command invoked。               |
| `windows_sandbox.createprocessasuserw_failed`    | counter   | `error_code`, `path_kind`, `exe`, `level` | Windows `CreateProcessAsUserW` failures。              |

当 Windows setup failure details 可用时，elevated setup failure metrics 包含 `code` 和 `message`，并且从 shared setup path 发出时可能包含 `originator`。从 shared setup path 发出时，`windows_sandbox.legacy_setup_preflight_failed` metric 包含 `originator`，但 fallback-prompt preflight failures 可能不包含任何 fields。

### Feedback controls

默认情况下，Codex 允许用户从 `/feedback` 发送 feedback。要在一台机器上的所有 Codex surfaces 中禁用 feedback collection，请更新你的 config：

```toml
[feedback]
enabled = false
```

禁用后，`/feedback` 会显示 disabled message，Codex 会拒绝 feedback submissions。

### 隐藏或显示 reasoning events

如果你想减少嘈杂的 “reasoning” 输出（例如在 CI logs 中），可以抑制它：

```toml
hide_agent_reasoning = true
```

如果你想在 model 发出 raw reasoning content 时显示它：

```toml
show_raw_agent_reasoning = true
```

只有在你的 workflow 可以接受时才启用 raw reasoning。某些 models/providers（例如 `gpt-oss`）不会发出 raw reasoning；在这种情况下，该设置没有可见效果。

## Notifications

使用 `notify` 在 Codex 发出支持的 events（目前只有 `agent-turn-complete`）时触发外部程序。这适用于 desktop toasts、chat webhooks、CI updates，或内置 TUI notifications 未覆盖的任何 side-channel alerting。

```toml
notify = ["python3", "/path/to/notify.py"]
```

响应 `agent-turn-complete` 的示例 `notify.py`（已截断）：

```python
#!/usr/bin/env python3
import json, subprocess, sys

def main() -> int:
    notification = json.loads(sys.argv[1])
    if notification.get("type") != "agent-turn-complete":
        return 0
    title = f"Codex: {notification.get('last-assistant-message', 'Turn Complete!')}"
    message = " ".join(notification.get("input-messages", []))
    subprocess.check_output([
        "terminal-notifier",
        "-title", title,
        "-message", message,
        "-group", "codex-" + notification.get("thread-id", ""),
        "-activate", "com.googlecode.iterm2",
    ])
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

该 script 接收单个 JSON argument。常见 fields 包括：

- `type`（目前为 `agent-turn-complete`）
- `thread-id`（session identifier）
- `turn-id`（turn identifier）
- `cwd`（working directory）
- `input-messages`（导致该 turn 的 user messages）
- `last-assistant-message`（last assistant message text）

把 script 放在磁盘上的某个位置，并让 `notify` 指向它。

#### `notify` vs `tui.notifications`

- `notify` 运行外部程序（适合 webhooks、desktop notifiers、CI hooks）。
- `tui.notifications` 内置于 TUI，可选择按 event type 过滤（例如 `agent-turn-complete` 和 `approval-requested`）。
- `tui.notification_method` 控制 TUI 如何发出 terminal notifications（`auto`、`osc9` 或 `bel`）。
- `tui.notification_condition` 控制 TUI notifications 是否只在 terminal `unfocused` 时触发，或 `always` 触发。

在 `auto` mode 中，Codex 优先使用 OSC 9 notifications（某些 terminals 会把它解释为 desktop notification 的 terminal escape sequence），否则回退到 BEL（`\x07`）。

请参见 [Configuration Reference](/mirror/codex/config-reference) 获取确切 keys。

## History persistence

默认情况下，Codex 会把 local session transcripts 保存在 `CODEX_HOME` 下（例如 `~/.codex/history.jsonl`）。要禁用 local history persistence：

```toml
[history]
persistence = "none"
```

要限制 history file size，请设置 `history.max_bytes`。当文件超过上限时，Codex 会丢弃最旧的 entries 并 compact 该文件，同时保留最新 records。

```toml
[history]
max_bytes = 104857600 # 100 MiB
```

## Clickable citations

如果你使用支持它的 terminal/editor integration，Codex 可以把 file citations 渲染为 clickable links。配置 `file_opener` 来选择 Codex 使用的 URI scheme：

```toml
file_opener = "vscode" # or cursor, windsurf, vscode-insiders, none
```

示例：像 `/home/user/project/main.py:42` 这样的 citation 可以被重写为 clickable `vscode://file/...:42` link。

## Project instructions discovery

Codex 会读取 `AGENTS.md`（以及相关文件），并在 session 的第一个 turn 中包含有限的 project guidance。两个 knobs 控制其工作方式：

- `project_doc_max_bytes`：从每个 `AGENTS.md` 文件读取多少内容
- `project_doc_fallback_filenames`：当某一目录层级缺少 `AGENTS.md` 时尝试的额外 filenames

详细 walkthrough 请参见 [Custom instructions with AGENTS.md](/mirror/codex/guides/agents-md)。

## TUI options

不带 subcommand 运行 `codex` 会启动 interactive terminal UI（TUI）。Codex 在 `[tui]` 下暴露一些 TUI-specific configuration，包括：

- `tui.notifications`：启用/禁用 notifications（或限制为特定 types）
- `tui.notification_method`：为 terminal notifications 选择 `auto`、`osc9` 或 `bel`
- `tui.notification_condition`：选择 notifications 触发时机为 `unfocused` 或 `always`
- `tui.animations`：启用/禁用 ASCII animations 和 shimmer effects
- `tui.alternate_screen`：控制 alternate screen usage（设置为 `never` 可保留 terminal scrollback）
- `tui.show_tooltips`：显示或隐藏 welcome screen 上的 onboarding tooltips

`tui.notification_method` 默认为 `auto`。在 `auto` mode 中，当 terminal 看起来支持 OSC 9 notifications（某些 terminals 会把它解释为 desktop notification 的 terminal escape sequence）时，Codex 会优先使用它，否则回退到 BEL（`\x07`）。

请参见 [Configuration Reference](/mirror/codex/config-reference) 获取完整 key list。

:::

## English source

::: details 展开英文原文
::: v-pre
Use these options when you need more control over providers, policies, and integrations. For a quick start, see [Config basics](/mirror/codex/config-basic).

For background on project guidance, reusable capabilities, custom slash commands, subagent workflows, and integrations, see [Customization](/mirror/codex/concepts/customization). For configuration keys, see [Configuration Reference](/mirror/codex/config-reference).

## Profiles

Profiles let you save named configuration layers and switch between them from
the CLI. When you pass `--profile profile-name`, Codex loads
`~/.codex/config.toml`, then overlays `~/.codex/profile-name.config.toml`.
Profile names can contain letters, numbers, hyphens, and underscores.

Create a separate TOML file for each profile. Use top-level config keys in the
profile file; don't nest them under `[profiles.profile-name]`.

```toml
# ~/.codex/deep-review.config.toml
model = "gpt-5.5"
model_reasoning_effort = "xhigh"
approval_policy = "on-request"
model_catalog_json = "/Users/me/.codex/model-catalogs/deep-review.json"
```

```shell
codex --profile deep-review
codex exec --profile deep-review "review this change"
```

Because the profile file is a layer above your base user config and below
project and CLI config, it only needs the values that differ from your base
config. Profile files can also override `model_catalog_json`; Codex uses the
profile value when both files set it.

In Codex 0.134.0 and later, `--profile` no longer reads `[profiles.profile-name]`
from `config.toml`, and the top-level `profile = "profile-name"` selector is no
longer supported. Move legacy profile settings into
`~/.codex/profile-name.config.toml`, then remove the matching
`[profiles.profile-name]` table and `profile = "profile-name"` selector from
`config.toml`.

## One-off overrides from the CLI

In addition to editing `~/.codex/config.toml`, you can override configuration for a single run from the CLI:

- Prefer dedicated flags when they exist (for example, `--model`).
- Use `-c` / `--config` when you need to override an arbitrary key.

Examples:

```shell
# Dedicated flag
codex --model gpt-5.4

# Generic key/value override (value is TOML, not JSON)
codex --config model='"gpt-5.4"'
codex --config sandbox_workspace_write.network_access=true
codex --config 'shell_environment_policy.include_only=["PATH","HOME"]'
```

Notes:

- Keys can use dot notation to set nested values (for example, `mcp_servers.context7.enabled=false`).
- `--config` values are parsed as TOML. When in doubt, quote the value so your shell doesn't split it on spaces.
- If the value can't be parsed as TOML, Codex treats it as a string.

## Config and state locations

Codex stores its local state under `CODEX_HOME` (defaults to `~/.codex`).

Common files you may see there:

- `config.toml` (your local configuration)
- `auth.json` (if you use file-based credential storage) or your OS keychain/keyring
- `history.jsonl` (if history persistence is enabled)
- Other per-user state such as logs and caches

For authentication details (including credential storage modes), see [Authentication](/mirror/codex/auth). For the full list of configuration keys, see [Configuration Reference](/mirror/codex/config-reference).

For shared defaults, rules, and skills checked into repos or system paths, see [Team Config](/mirror/codex/enterprise/admin-setup#team-config).

If you just need to point the built-in OpenAI provider at an LLM proxy, router, or data-residency enabled project, set `openai_base_url` in `config.toml` instead of defining a new provider. This changes the base URL for the built-in `openai` provider without requiring a separate `model_providers.&lt;id&gt;` entry.

```toml
openai_base_url = "https://us.api.openai.com/v1"
```

## Project config files (`.codex/config.toml`)

In addition to your user config, Codex reads project-scoped overrides from `.codex/config.toml` files inside your repo. Codex walks from the project root to your current working directory and loads every `.codex/config.toml` it finds. If multiple files define the same key, the closest file to your working directory wins.

For security, Codex loads project-scoped config files only when the project is trusted. If the project is untrusted, Codex ignores project `.codex/` layers, including `.codex/config.toml`, project-local hooks, and project-local rules. User and system layers remain separate and still load.

Relative paths inside a project config (for example, `model_instructions_file`) are resolved relative to the `.codex/` folder that contains the `config.toml`.

Project config files can't override settings that redirect credentials, alter
host-owned app request metadata, change provider auth, select config profiles,
or run machine-local notification/telemetry commands. Codex ignores the
following keys in project-local `.codex/config.toml` and prints a startup
warning when it sees them: `openai_base_url`, `chatgpt_base_url`,
`apps_mcp_product_sku`, `model_provider`, `model_providers`, `notify`,
`profile`, `profiles`, `experimental_realtime_ws_base_url`, and `otel`. Set
provider, notification, and telemetry keys in your user-level
`~/.codex/config.toml`; select config profiles with `--profile profile-name`
and `~/.codex/profile-name.config.toml`.

## Hooks

Codex can also load lifecycle hooks from either `hooks.json` files or inline
`[hooks]` tables in `config.toml` files that sit next to active config layers.

In practice, the four most useful locations are:

- `~/.codex/hooks.json`
- `~/.codex/config.toml`
- `&lt;repo&gt;/.codex/hooks.json`
- `&lt;repo&gt;/.codex/config.toml`

Project-local hooks load only when the project `.codex/` layer is trusted.
User-level hooks remain independent of project trust.

Inline TOML hooks use the same event structure as `hooks.json`:

```toml
[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py"'
timeout = 30
statusMessage = "Checking Bash command"
```

If a single layer contains both `hooks.json` and inline `[hooks]`, Codex loads
both and warns. Prefer one representation per layer.

For the current event list, input fields, output behavior, and limitations, see
[Hooks](/mirror/codex/hooks).

## Agent roles (`[agents]` in `config.toml`)

For subagent role configuration (`[agents]` in `config.toml`), see [Subagents](/mirror/codex/subagents).

## Project root detection

Codex discovers project configuration (for example, `.codex/` layers and `AGENTS.md`) by walking up from the working directory until it reaches a project root.

By default, Codex treats a directory containing `.git` as the project root. To customize this behavior, set `project_root_markers` in `config.toml`:

```toml
# Treat a directory as the project root when it contains any of these markers.
project_root_markers = [".git", ".hg", ".sl"]
```

Set `project_root_markers = []` to skip searching parent directories and treat the current working directory as the project root.

## Custom model providers

A model provider defines how Codex connects to a model (base URL, wire API, authentication, and optional HTTP headers). Custom providers can't reuse the reserved built-in provider IDs: `openai`, `ollama`, and `lmstudio`.

Define additional providers and point `model_provider` at them:

```toml
model = "gpt-5.4"
model_provider = "proxy"

[model_providers.proxy]
name = "OpenAI using LLM proxy"
base_url = "http://proxy.example.com"
env_key = "OPENAI_API_KEY"

[model_providers.local_ollama]
name = "Ollama"
base_url = "http://localhost:11434/v1"

[model_providers.mistral]
name = "Mistral"
base_url = "https://api.mistral.ai/v1"
env_key = "MISTRAL_API_KEY"
```

Add request headers when needed:

```toml
[model_providers.example]
http_headers = { "X-Example-Header" = "example-value" }
env_http_headers = { "X-Example-Features" = "EXAMPLE_FEATURES" }
```

Use command-backed authentication when a provider needs Codex to fetch bearer tokens from an external credential helper:

```toml
[model_providers.proxy]
name = "OpenAI using LLM proxy"
base_url = "https://proxy.example.com/v1"
wire_api = "responses"

[model_providers.proxy.auth]
command = "/usr/local/bin/fetch-codex-token"
args = ["--audience", "codex"]
timeout_ms = 5000
refresh_interval_ms = 300000
```

The auth command receives no `stdin` and must print the token to stdout. Codex trims surrounding whitespace, treats an empty token as an error, and refreshes proactively at `refresh_interval_ms`; set `refresh_interval_ms = 0` to refresh only after an authentication retry. Don't combine `[model_providers.&lt;id&gt;.auth]` with `env_key`, `experimental_bearer_token`, or `requires_openai_auth`.

### Amazon Bedrock provider

Codex includes a built-in `amazon-bedrock` model provider. Set it directly as
`model_provider`; unlike custom providers, this built-in provider supports only
the nested AWS profile and region overrides.

```toml
model_provider = "amazon-bedrock"
model = "<bedrock-model-id>"

[model_providers.amazon-bedrock.aws]
profile = "default"
region = "eu-central-1"
```

If you omit `profile`, Codex uses the standard AWS credential chain. Set
`region` to the supported Bedrock region that should handle requests.

For the full setup flow, authentication options, supported models, and feature
availability, see [Use Codex with Amazon Bedrock](/mirror/codex/amazon-bedrock).

## OSS mode (local providers)

Codex can run against a local "open source" provider (for example, Ollama or LM Studio) when you pass `--oss`. If you pass `--oss` without specifying a provider, Codex uses `oss_provider` as the default.

```toml
# Default local provider used with `--oss`
oss_provider = "ollama" # or "lmstudio"
```

## Azure provider and per-provider tuning

```toml
[model_providers.azure]
name = "Azure"
base_url = "https://YOUR_PROJECT_NAME.openai.azure.com/openai"
env_key = "AZURE_OPENAI_API_KEY"
query_params = { api-version = "2025-04-01-preview" }
wire_api = "responses"
request_max_retries = 4
stream_max_retries = 10
stream_idle_timeout_ms = 300000
```

To change the base URL for the built-in OpenAI provider, use `openai_base_url`; don't create `[model_providers.openai]`, because you can't override built-in provider IDs.

## ChatGPT customers using data residency

Projects created with [data residency](https://help.openai.com/en/articles/9903489-data-residency-and-inference-residency-for-chatgpt) enabled can create a model provider to update the base_url with the [correct prefix](https://platform.openai.com/docs/guides/your-data#which-models-and-features-are-eligible-for-data-residency).

```toml
model_provider = "openaidr"
[model_providers.openaidr]
name = "OpenAI Data Residency"
base_url = "https://us.api.openai.com/v1" # Replace 'us' with domain prefix
```

## Model reasoning, verbosity, and limits

```toml
model_reasoning_summary = "none"          # Disable summaries
model_verbosity = "low"                   # Shorten responses
model_supports_reasoning_summaries = true # Force reasoning
model_context_window = 128000             # Context window size
```

`model_verbosity` applies only to providers using the Responses API. Chat Completions providers will ignore the setting.

## Approval policies and sandbox modes

Pick approval strictness (affects when Codex pauses) and sandbox level (affects file/network access).

For operational details to keep in mind while editing `config.toml`, see [Common sandbox and approval combinations](/mirror/codex/agent-approvals-security#common-sandbox-and-approval-combinations), [Protected paths in writable roots](/mirror/codex/agent-approvals-security#protected-paths-in-writable-roots), and [Network access](/mirror/codex/agent-approvals-security#network-access).

For beta permission profiles that configure filesystem and network access together, see [Permissions](/mirror/codex/permissions).

You can also use a granular approval policy (`approval_policy = { granular = { ... } }`) to allow or auto-reject individual prompt categories. This is useful when you want normal interactive approvals for some cases but want others, such as `request_permissions` or skill-script prompts, to fail closed automatically.

Set `approvals_reviewer = "auto_review"` to route eligible interactive approval
requests through automatic review. This changes the reviewer, not the sandbox
boundary.

Use `[auto_review].policy` for local reviewer policy instructions. Managed
`guardian_policy_config` takes precedence.

```toml
approval_policy = "untrusted"   # Other options: on-request, never, or { granular = { ... } }
approvals_reviewer = "user"     # Or "auto_review" for automatic review
sandbox_mode = "workspace-write"
allow_login_shell = false       # Optional hardening: disallow login shells for shell tools

# Example granular approval policy:
# approval_policy = { granular = {
#   sandbox_approval = true,
#   rules = true,
#   mcp_elicitations = true,
#   request_permissions = false,
#   skill_approval = false
# } }

[sandbox_workspace_write]
exclude_tmpdir_env_var = false  # Allow $TMPDIR
exclude_slash_tmp = false       # Allow /tmp
writable_roots = ["/Users/YOU/.pyenv/shims"]
network_access = false          # Opt in to outbound network

[auto_review]
policy = """
Use your organization's automatic review policy.
"""
```

### Named permission profiles

For built-in profiles, custom profile syntax, and the full filesystem and
network configuration model, see [Permissions](/mirror/codex/permissions).

For the complete key list and requirements constraints, see
[Configuration Reference](/mirror/codex/config-reference) and
[Managed configuration](/mirror/codex/enterprise/managed-configuration).

In workspace-write mode, some environments keep `.git/` and `.codex/`
  read-only even when the rest of the workspace is writable. This is why
  commands like `git commit` may still require approval to run outside the
  sandbox. If you want Codex to skip specific commands (for example, block `git
  commit` outside the sandbox), use
  &lt;a href="/codex/rules"&gt;rules&lt;/a&gt;.

Disable sandboxing entirely (use only if your environment already isolates processes):

```toml
sandbox_mode = "danger-full-access"
```

## Shell environment policy

`shell_environment_policy` controls which environment variables Codex passes to any subprocess it launches (for example, when running a tool-command the model proposes). Start from a clean start (`inherit = "none"`) or a trimmed set (`inherit = "core"`), then layer on excludes, includes, and overrides to avoid leaking secrets while still providing the paths, keys, or flags your tasks need.

```toml
[shell_environment_policy]
inherit = "none"
set = { PATH = "/usr/bin", MY_FLAG = "1" }
ignore_default_excludes = false
exclude = ["AWS_*", "AZURE_*"]
include_only = ["PATH", "HOME"]
```

Patterns are case-insensitive globs (`*`, `?`, `[A-Z]`); `ignore_default_excludes = false` keeps the automatic KEY/SECRET/TOKEN filter before your includes/excludes run.

## MCP servers

See the dedicated [MCP documentation](/mirror/codex/mcp) for configuration details.

## Observability and telemetry

Enable OpenTelemetry (OTel) log export to track Codex runs (API requests, SSE/events, prompts, tool approvals/results). Disabled by default; opt in via `[otel]`:

```toml
[otel]
environment = "staging"   # defaults to "dev"
exporter = "none"         # set to otlp-http or otlp-grpc to send events
log_user_prompt = false   # redact user prompts unless explicitly enabled
```

Choose an exporter:

```toml
[otel]
exporter = { otlp-http = {
  endpoint = "https://otel.example.com/v1/logs",
  protocol = "binary",
  headers = { "x-otlp-api-key" = "${OTLP_TOKEN}" }
}}
```

```toml
[otel]
exporter = { otlp-grpc = {
  endpoint = "https://otel.example.com:4317",
  headers = { "x-otlp-meta" = "abc123" }
}}
```

If `exporter = "none"` Codex records events but sends nothing. Exporters batch asynchronously and flush on shutdown. Event metadata includes service name, CLI version, env tag, conversation id, model, sandbox/approval settings, and per-event fields (see [Config Reference](/mirror/codex/config-reference)).

### What gets emitted

Codex emits structured log events for runs and tool usage. Representative event types include:

- `codex.conversation_starts` (model, reasoning settings, sandbox/approval policy)
- `codex.api_request` (attempt, status/success, duration, and error details)
- `codex.sse_event` (stream event kind, success/failure, duration, plus token counts on `response.completed`)
- `codex.websocket_request` and `codex.websocket_event` (request duration plus per-message kind/success/error)
- `codex.user_prompt` (length; content redacted unless explicitly enabled)
- `codex.tool_decision` (approved/denied and whether the decision came from config vs user)
- `codex.tool_result` (duration, success, output snippet)

### OTel metrics emitted

When the OTel metrics pipeline is enabled, Codex emits counters and duration histograms for API, stream, and tool activity.

Each metric below also includes default metadata tags: `auth_mode`, `originator`, `session_source`, `model`, and `app.version`.

| Metric                                | Type      | Fields              | Description                                                       |
| ------------------------------------- | --------- | ------------------- | ----------------------------------------------------------------- |
| `codex.api_request`                   | counter   | `status`, `success` | API request count by HTTP status and success/failure.             |
| `codex.api_request.duration_ms`       | histogram | `status`, `success` | API request duration in milliseconds.                             |
| `codex.sse_event`                     | counter   | `kind`, `success`   | SSE event count by event kind and success/failure.                |
| `codex.sse_event.duration_ms`         | histogram | `kind`, `success`   | SSE event processing duration in milliseconds.                    |
| `codex.websocket.request`             | counter   | `success`           | WebSocket request count by success/failure.                       |
| `codex.websocket.request.duration_ms` | histogram | `success`           | WebSocket request duration in milliseconds.                       |
| `codex.websocket.event`               | counter   | `kind`, `success`   | WebSocket message/event count by type and success/failure.        |
| `codex.websocket.event.duration_ms`   | histogram | `kind`, `success`   | WebSocket message/event processing duration in milliseconds.      |
| `codex.tool.call`                     | counter   | `tool`, `success`   | Tool invocation count by tool name and success/failure.           |
| `codex.tool.call.duration_ms`         | histogram | `tool`, `success`   | Tool execution duration in milliseconds by tool name and outcome. |

For more security and privacy guidance around telemetry, see [Security](/mirror/codex/agent-approvals-security#monitoring-and-telemetry).

### Metrics

By default, Codex periodically sends a small amount of anonymous usage and health data back to OpenAI. This helps detect when Codex isn't working correctly and shows what features and configuration options are being used, so the Codex team can focus on what matters most. These metrics don't contain any personally identifiable information (PII). Metrics collection is independent of OTel log/trace export.

If you want to disable metrics collection entirely across Codex surfaces on a machine, set the analytics flag in your config:

```toml
[analytics]
enabled = false
```

Each metric includes its own fields plus the default context fields below.

#### Default context fields (applies to every event/metric)

- `auth_mode`: `swic` | `api` | `unknown`.
- `model`: name of the model used.
- `app.version`: Codex version.

#### Metrics catalog

Each metric includes the required fields plus the default context fields above. Metric names below omit the `codex.` prefix.
Most metric names are centralized in `codex-rs/otel/src/metrics/names.rs`; feature-specific metrics emitted outside that file are included here too.
If a metric includes the `tool` field, it reflects the internal tool used (for example, `apply_patch` or `shell`) and doesn't contain the actual shell command or patch `codex` is trying to apply.

#### Runtime and model transport

| Metric                                          | Type      | Fields               | Description                                                  |
| ----------------------------------------------- | --------- | -------------------- | ------------------------------------------------------------ |
| `api_request`                                   | counter   | `status`, `success`  | API request count by HTTP status and success/failure.        |
| `api_request.duration_ms`                       | histogram | `status`, `success`  | API request duration in milliseconds.                        |
| `sse_event`                                     | counter   | `kind`, `success`    | SSE event count by event kind and success/failure.           |
| `sse_event.duration_ms`                         | histogram | `kind`, `success`    | SSE event processing duration in milliseconds.               |
| `websocket.request`                             | counter   | `success`            | WebSocket request count by success/failure.                  |
| `websocket.request.duration_ms`                 | histogram | `success`            | WebSocket request duration in milliseconds.                  |
| `websocket.event`                               | counter   | `kind`, `success`    | WebSocket message/event count by type and success/failure.   |
| `websocket.event.duration_ms`                   | histogram | `kind`, `success`    | WebSocket message/event processing duration in milliseconds. |
| `responses_api_overhead.duration_ms`            | histogram |                      | Responses API overhead timing from WebSocket responses.      |
| `responses_api_inference_time.duration_ms`      | histogram |                      | Responses API inference timing from WebSocket responses.     |
| `responses_api_engine_iapi_ttft.duration_ms`    | histogram |                      | Responses API engine IAPI time-to-first-token timing.        |
| `responses_api_engine_service_ttft.duration_ms` | histogram |                      | Responses API engine service time-to-first-token timing.     |
| `responses_api_engine_iapi_tbt.duration_ms`     | histogram |                      | Responses API engine IAPI time-between-token timing.         |
| `responses_api_engine_service_tbt.duration_ms`  | histogram |                      | Responses API engine service time-between-token timing.      |
| `transport.fallback_to_http`                    | counter   | `from_wire_api`      | WebSocket-to-HTTP fallback count.                            |
| `remote_models.fetch_update.duration_ms`        | histogram |                      | Time to fetch remote model definitions.                      |
| `remote_models.load_cache.duration_ms`          | histogram |                      | Time to load the remote model cache.                         |
| `startup_prewarm.duration_ms`                   | histogram | `status`             | Startup prewarm duration by outcome.                         |
| `startup_prewarm.age_at_first_turn_ms`          | histogram | `status`             | Startup prewarm age when the first real turn resolves it.    |
| `cloud_requirements.fetch.duration_ms`          | histogram |                      | Workspace-managed cloud requirements fetch duration.         |
| `cloud_requirements.fetch_attempt`              | counter   | See note             | Workspace-managed cloud requirements fetch attempts.         |
| `cloud_requirements.fetch_final`                | counter   | See note             | Final workspace-managed cloud requirements fetch outcome.    |
| `cloud_requirements.load`                       | counter   | `trigger`, `outcome` | Workspace-managed cloud requirements load outcome.           |

The `cloud_requirements.fetch_attempt` metric includes `trigger`, `attempt`, `outcome`, and `status_code` fields. The `cloud_requirements.fetch_final` metric includes `trigger`, `outcome`, `reason`, `attempt_count`, and `status_code` fields.

#### Turn and tool activity

| Metric                                 | Type      | Fields                                                                    | Description                                                                                                      |
| -------------------------------------- | --------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `turn.e2e_duration_ms`                 | histogram |                                                                           | End-to-end time for a full turn.                                                                                 |
| `turn.ttft.duration_ms`                | histogram |                                                                           | Time to first token for a turn.                                                                                  |
| `turn.ttfm.duration_ms`                | histogram |                                                                           | Time to first model output item for a turn.                                                                      |
| `turn.network_proxy`                   | counter   | `active`, `tmp_mem_enabled`                                               | Whether the managed network proxy was active for the turn.                                                       |
| `turn.memory`                          | counter   | `read_allowed`, `feature_enabled`, `config_use_memories`, `has_citations` | Per-turn memory read availability and memory citation usage.                                                     |
| `turn.tool.call`                       | histogram | `tmp_mem_enabled`                                                         | Number of tool calls in the turn.                                                                                |
| `turn.token_usage`                     | histogram | `token_type`, `tmp_mem_enabled`                                           | Per-turn token usage by token type (`total`, `input`, `cached_input`, `output`, or `reasoning_output`).          |
| `tool.call`                            | counter   | `tool`, `success`                                                         | Tool invocation count by tool name and success/failure.                                                          |
| `tool.call.duration_ms`                | histogram | `tool`, `success`                                                         | Tool execution duration in milliseconds by tool name and outcome.                                                |
| `tool.unified_exec`                    | counter   | `tty`                                                                     | Unified exec tool calls by TTY mode.                                                                             |
| `approval.requested`                   | counter   | `tool`, `approved`                                                        | Tool approval request result (`approved`, `approved_with_amendment`, `approved_for_session`, `denied`, `abort`). |
| `mcp.call`                             | counter   | See note                                                                  | MCP tool invocation result.                                                                                      |
| `mcp.call.duration_ms`                 | histogram | See note                                                                  | MCP tool invocation duration.                                                                                    |
| `mcp.tools.list.duration_ms`           | histogram | `cache`                                                                   | MCP tool-list duration, including cache hit/miss state.                                                          |
| `mcp.tools.fetch_uncached.duration_ms` | histogram |                                                                           | Duration of MCP tool fetches that miss the cache.                                                                |
| `mcp.tools.cache_write.duration_ms`    | histogram |                                                                           | Duration of Codex Apps MCP tool-cache writes.                                                                    |
| `hooks.run`                            | counter   | `hook_name`, `source`, `status`                                           | Hook run count by hook name, source, and status.                                                                 |
| `hooks.run.duration_ms`                | histogram | `hook_name`, `source`, `status`                                           | Hook run duration in milliseconds.                                                                               |

The `mcp.call` and `mcp.call.duration_ms` metrics include `status`; normal tool-call emissions also include `tool`, plus `connector_id` and `connector_name` when available. Blocked Codex Apps MCP calls may emit `mcp.call` with only `status`.

#### Threads, tasks, and features

| Metric                            | Type      | Fields                | Description                                                                      |
| --------------------------------- | --------- | --------------------- | -------------------------------------------------------------------------------- |
| `feature.state`                   | counter   | `feature`, `value`    | Feature values that differ from defaults (emit one row per non-default).         |
| `status_line`                     | counter   |                       | Session started with a configured status line.                                   |
| `model_warning`                   | counter   |                       | Warning sent to the model.                                                       |
| `thread.started`                  | counter   | `is_git`              | New thread created, tagged by whether the working directory is in a Git repo.    |
| `conversation.turn.count`         | counter   |                       | User/assistant turns per thread, recorded at the end of the thread.              |
| `thread.fork`                     | counter   | `source`              | New thread created by forking an existing thread.                                |
| `thread.rename`                   | counter   |                       | Thread renamed.                                                                  |
| `thread.side`                     | counter   | `source`              | Side conversation created.                                                       |
| `thread.skills.enabled_total`     | histogram |                       | Number of skills enabled for a new thread.                                       |
| `thread.skills.kept_total`        | histogram |                       | Number of enabled skills kept after prompt rendering.                            |
| `thread.skills.truncated`         | histogram |                       | Whether skill rendering truncated the enabled skills list (`1` or `0`).          |
| `task.compact`                    | counter   | `type`                | Number of compactions per type (`remote` or `local`), including manual and auto. |
| `task.review`                     | counter   |                       | Number of reviews triggered.                                                     |
| `task.undo`                       | counter   |                       | Number of undo actions triggered.                                                |
| `task.user_shell`                 | counter   |                       | Number of user shell actions (`!` in the TUI for example).                       |
| `shell_snapshot`                  | counter   | See note              | Whether taking a shell snapshot succeeded.                                       |
| `shell_snapshot.duration_ms`      | histogram | `success`             | Time to take a shell snapshot.                                                   |
| `skill.injected`                  | counter   | `status`, `skill`     | Skill injection outcomes by skill.                                               |
| `plugins.startup_sync`            | counter   | `transport`, `status` | Curated plugin startup sync attempts.                                            |
| `plugins.startup_sync.final`      | counter   | `transport`, `status` | Final curated plugin startup sync outcome.                                       |
| `multi_agent.spawn`               | counter   | `role`                | Agent spawns by role.                                                            |
| `multi_agent.resume`              | counter   |                       | Agent resumes.                                                                   |
| `multi_agent.nickname_pool_reset` | counter   |                       | Agent nickname pool resets.                                                      |

The `shell_snapshot` metric includes `success` and, on failures, `failure_reason`.

#### Memory and local state

| Metric                         | Type      | Fields                    | Description                                               |
| ------------------------------ | --------- | ------------------------- | --------------------------------------------------------- |
| `memory.phase1`                | counter   | `status`                  | Memory phase 1 job counts by status.                      |
| `memory.phase1.e2e_ms`         | histogram |                           | End-to-end duration for memory phase 1.                   |
| `memory.phase1.output`         | counter   |                           | Memory phase 1 outputs written.                           |
| `memory.phase1.token_usage`    | histogram | `token_type`              | Memory phase 1 token usage by token type.                 |
| `memory.phase2`                | counter   | `status`                  | Memory phase 2 job counts by status.                      |
| `memory.phase2.e2e_ms`         | histogram |                           | End-to-end duration for memory phase 2.                   |
| `memory.phase2.input`          | counter   |                           | Memory phase 2 input count.                               |
| `memory.phase2.token_usage`    | histogram | `token_type`              | Memory phase 2 token usage by token type.                 |
| `memories.usage`               | counter   | `kind`, `tool`, `success` | Memory usage by kind, tool, and success/failure.          |
| `external_agent_config.detect` | counter   | See note                  | External agent config detections by migration item type.  |
| `external_agent_config.import` | counter   | See note                  | External agent config imports by migration item type.     |
| `db.backfill`                  | counter   | `status`                  | Initial state DB backfill results (`upserted`, `failed`). |
| `db.backfill.duration_ms`      | histogram | `status`                  | Duration of the initial state DB backfill.                |
| `db.error`                     | counter   | `stage`                   | Errors during state DB operations.                        |

The `external_agent_config.detect` and `external_agent_config.import` metrics include `migration_type`; skills migrations also include `skills_count`.

#### Windows sandbox

| Metric                                           | Type      | Fields                                    | Description                                           |
| ------------------------------------------------ | --------- | ----------------------------------------- | ----------------------------------------------------- |
| `windows_sandbox.setup_success`                  | counter   | `originator`, `mode`                      | Windows sandbox setup successes.                      |
| `windows_sandbox.setup_failure`                  | counter   | `originator`, `mode`                      | Windows sandbox setup failures.                       |
| `windows_sandbox.setup_duration_ms`              | histogram | `result`, `originator`, `mode`            | Windows sandbox setup duration.                       |
| `windows_sandbox.elevated_setup_success`         | counter   |                                           | Elevated Windows sandbox setup successes.             |
| `windows_sandbox.elevated_setup_failure`         | counter   | See note                                  | Elevated Windows sandbox setup failures.              |
| `windows_sandbox.elevated_setup_canceled`        | counter   | See note                                  | Canceled elevated Windows sandbox setup attempts.     |
| `windows_sandbox.elevated_setup_duration_ms`     | histogram | `result`                                  | Elevated Windows sandbox setup duration.              |
| `windows_sandbox.elevated_prompt_shown`          | counter   |                                           | Elevated sandbox setup prompt shown.                  |
| `windows_sandbox.elevated_prompt_accept`         | counter   |                                           | Elevated sandbox setup prompt accepted.               |
| `windows_sandbox.elevated_prompt_use_legacy`     | counter   |                                           | User chose legacy sandbox from the elevated prompt.   |
| `windows_sandbox.elevated_prompt_quit`           | counter   |                                           | User quit from the elevated prompt.                   |
| `windows_sandbox.fallback_prompt_shown`          | counter   |                                           | Fallback sandbox prompt shown.                        |
| `windows_sandbox.fallback_retry_elevated`        | counter   |                                           | User retried elevated setup from the fallback prompt. |
| `windows_sandbox.fallback_use_legacy`            | counter   |                                           | User chose legacy sandbox from the fallback prompt.   |
| `windows_sandbox.fallback_prompt_quit`           | counter   |                                           | User quit from the fallback prompt.                   |
| `windows_sandbox.legacy_setup_preflight_failed`  | counter   | See note                                  | Legacy Windows sandbox setup preflight failure.       |
| `windows_sandbox.setup_elevated_sandbox_command` | counter   |                                           | Elevated sandbox setup command invoked.               |
| `windows_sandbox.createprocessasuserw_failed`    | counter   | `error_code`, `path_kind`, `exe`, `level` | Windows `CreateProcessAsUserW` failures.              |

The elevated setup failure metrics include `code` and `message` when Windows setup failure details are available, and may include `originator` when emitted from the shared setup path. The `windows_sandbox.legacy_setup_preflight_failed` metric includes `originator` when emitted from the shared setup path, but fallback-prompt preflight failures may not include any fields.

### Feedback controls

By default, Codex lets users send feedback from `/feedback`. To disable feedback collection across Codex surfaces on a machine, update your config:

```toml
[feedback]
enabled = false
```

When disabled, `/feedback` shows a disabled message and Codex rejects feedback submissions.

### Hide or surface reasoning events

If you want to reduce noisy "reasoning" output (for example in CI logs), you can suppress it:

```toml
hide_agent_reasoning = true
```

If you want to surface raw reasoning content when a model emits it:

```toml
show_raw_agent_reasoning = true
```

Enable raw reasoning only if it's acceptable for your workflow. Some models/providers (like `gpt-oss`) don't emit raw reasoning; in that case, this setting has no visible effect.

## Notifications

Use `notify` to trigger an external program whenever Codex emits supported events (currently only `agent-turn-complete`). This is handy for desktop toasts, chat webhooks, CI updates, or any side-channel alerting that the built-in TUI notifications don't cover.

```toml
notify = ["python3", "/path/to/notify.py"]
```

Example `notify.py` (truncated) that reacts to `agent-turn-complete`:

```python
#!/usr/bin/env python3
import json, subprocess, sys

def main() -> int:
    notification = json.loads(sys.argv[1])
    if notification.get("type") != "agent-turn-complete":
        return 0
    title = f"Codex: {notification.get('last-assistant-message', 'Turn Complete!')}"
    message = " ".join(notification.get("input-messages", []))
    subprocess.check_output([
        "terminal-notifier",
        "-title", title,
        "-message", message,
        "-group", "codex-" + notification.get("thread-id", ""),
        "-activate", "com.googlecode.iterm2",
    ])
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

The script receives a single JSON argument. Common fields include:

- `type` (currently `agent-turn-complete`)
- `thread-id` (session identifier)
- `turn-id` (turn identifier)
- `cwd` (working directory)
- `input-messages` (user messages that led to the turn)
- `last-assistant-message` (last assistant message text)

Place the script somewhere on disk and point `notify` to it.

#### `notify` vs `tui.notifications`

- `notify` runs an external program (good for webhooks, desktop notifiers, CI hooks).
- `tui.notifications` is built in to the TUI and can optionally filter by event type (for example, `agent-turn-complete` and `approval-requested`).
- `tui.notification_method` controls how the TUI emits terminal notifications (`auto`, `osc9`, or `bel`).
- `tui.notification_condition` controls whether TUI notifications fire only when
  the terminal is `unfocused` or `always`.

In `auto` mode, Codex prefers OSC 9 notifications (a terminal escape sequence some terminals interpret as a desktop notification) and falls back to BEL (`\x07`) otherwise.

See [Configuration Reference](/mirror/codex/config-reference) for the exact keys.

## History persistence

By default, Codex saves local session transcripts under `CODEX_HOME` (for example, `~/.codex/history.jsonl`). To disable local history persistence:

```toml
[history]
persistence = "none"
```

To cap the history file size, set `history.max_bytes`. When the file exceeds the cap, Codex drops the oldest entries and compacts the file while keeping the newest records.

```toml
[history]
max_bytes = 104857600 # 100 MiB
```

## Clickable citations

If you use a terminal/editor integration that supports it, Codex can render file citations as clickable links. Configure `file_opener` to pick the URI scheme Codex uses:

```toml
file_opener = "vscode" # or cursor, windsurf, vscode-insiders, none
```

Example: a citation like `/home/user/project/main.py:42` can be rewritten into a clickable `vscode://file/...:42` link.

## Project instructions discovery

Codex reads `AGENTS.md` (and related files) and includes a limited amount of project guidance in the first turn of a session. Two knobs control how this works:

- `project_doc_max_bytes`: how much to read from each `AGENTS.md` file
- `project_doc_fallback_filenames`: additional filenames to try when `AGENTS.md` is missing at a directory level

For a detailed walkthrough, see [Custom instructions with AGENTS.md](/mirror/codex/guides/agents-md).

## TUI options

Running `codex` with no subcommand launches the interactive terminal UI (TUI). Codex exposes some TUI-specific configuration under `[tui]`, including:

- `tui.notifications`: enable/disable notifications (or restrict to specific types)
- `tui.notification_method`: choose `auto`, `osc9`, or `bel` for terminal notifications
- `tui.notification_condition`: choose `unfocused` or `always` for when
  notifications fire
- `tui.animations`: enable/disable ASCII animations and shimmer effects
- `tui.alternate_screen`: control alternate screen usage (set to `never` to keep terminal scrollback)
- `tui.show_tooltips`: show or hide onboarding tooltips on the welcome screen

`tui.notification_method` defaults to `auto`. In `auto` mode, Codex prefers OSC 9 notifications (a terminal escape sequence some terminals interpret as a desktop notification) when the terminal appears to support them, and falls back to BEL (`\x07`) otherwise.

See [Configuration Reference](/mirror/codex/config-reference) for the full key list.

:::
:::

