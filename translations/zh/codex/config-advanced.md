---
status: needs-review
sourceId: "b5df4e0abd53"
sourceChecksum: "b5df4e0abd53ed1dfc0dedb4c06641fe4b921a0d5ebbfbf5e97285496ec3af64"
sourceUrl: "https://developers.openai.com/codex/config-advanced"
translatedAt: "2026-06-27T11:05:32.948Z"
translator: codex-gpt-5.5-xhigh
---

# 高级配置

当你需要对 providers、policies 和 integrations 进行更多控制时，使用这些选项。快速入门请参见 [Config basics](https://developers.openai.com/codex/config-basic)。

有关 project guidance、reusable capabilities、custom slash commands、subagent workflows 和 integrations 的背景，请参见 [Customization](https://developers.openai.com/codex/concepts/customization)。有关 configuration keys，请参见 [Configuration Reference](https://developers.openai.com/codex/config-reference)。

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

有关 authentication details（包括 credential storage modes），请参见 [Authentication](https://developers.openai.com/codex/auth)。有关 configuration keys 的完整列表，请参见 [Configuration Reference](https://developers.openai.com/codex/config-reference)。

有关 checked into repos 或 system paths 的 shared defaults、rules 和 skills，请参见 [Team Config](https://developers.openai.com/codex/enterprise/admin-setup#team-config)。

如果你只是需要把内置 OpenAI provider 指向 LLM proxy、router 或启用了 data-residency 的 project，请在 `config.toml` 中设置 `openai_base_url`，而不是定义新的 provider。这会更改内置 `openai` provider 的 base URL，而无需单独的 `model_providers.<id>` entry。

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
- `<repo>/.codex/hooks.json`
- `<repo>/.codex/config.toml`

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
[Hooks](https://developers.openai.com/codex/hooks)。

## Agent roles（`config.toml` 中的 `[agents]`）

有关 subagent role configuration（`config.toml` 中的 `[agents]`），请参见 [Subagents](https://developers.openai.com/codex/subagents)。

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

Auth command 不接收 `stdin`，并且必须把 token 打印到 stdout。Codex 会 trim 周围空白，把空 token 视为 error，并在 `refresh_interval_ms` 主动刷新；设置 `refresh_interval_ms = 0` 可仅在 authentication retry 之后刷新。不要把 `[model_providers.<id>.auth]` 与 `env_key`、`experimental_bearer_token` 或 `requires_openai_auth` 组合使用。

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

有关完整 setup flow、authentication options、supported models 和 feature availability，请参见 [Use Codex with Amazon Bedrock](https://developers.openai.com/codex/amazon-bedrock)。

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

在编辑 `config.toml` 时需要留意的 operational details，请参见 [Common sandbox and approval combinations](https://developers.openai.com/codex/agent-approvals-security#common-sandbox-and-approval-combinations)、[Protected paths in writable roots](https://developers.openai.com/codex/agent-approvals-security#protected-paths-in-writable-roots) 和 [Network access](https://developers.openai.com/codex/agent-approvals-security#network-access)。

有关一起配置 filesystem 和 network access 的 beta permission profiles，请参见 [Permissions](https://developers.openai.com/codex/permissions)。

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

有关 built-in profiles、custom profile syntax，以及完整 filesystem 和 network configuration model，请参见 [Permissions](https://developers.openai.com/codex/permissions)。

有关完整 key list 和 requirements constraints，请参见
[Configuration Reference](https://developers.openai.com/codex/config-reference) 和
[Managed configuration](https://developers.openai.com/codex/enterprise/managed-configuration)。

在 workspace-write mode 中，某些 environments 会让 `.git/` 和 `.codex/`
  保持 read-only，即使 workspace 的其他部分可写。这就是为什么
  `git commit` 等 commands 仍可能需要 approval，才能在 sandbox 外运行。如果你希望 Codex 跳过特定 commands（例如在 sandbox 外阻止 `git
  commit`），请使用
  <a href="/codex/rules">rules</a>。

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

配置详情请参见专门的 [MCP documentation](https://developers.openai.com/codex/mcp)。

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

如果 `exporter = "none"`，Codex 会记录 events 但不发送任何内容。Exporters 会异步批处理并在 shutdown 时 flush。Event metadata 包括 service name、CLI version、env tag、conversation id、model、sandbox/approval settings，以及 per-event fields（参见 [Config Reference](https://developers.openai.com/codex/config-reference)）。

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

有关 telemetry 的更多安全和隐私指导，请参见 [Security](https://developers.openai.com/codex/agent-approvals-security#monitoring-and-telemetry)。

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

请参见 [Configuration Reference](https://developers.openai.com/codex/config-reference) 获取确切 keys。

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

详细 walkthrough 请参见 [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md)。

## TUI options

不带 subcommand 运行 `codex` 会启动 interactive terminal UI（TUI）。Codex 在 `[tui]` 下暴露一些 TUI-specific configuration，包括：

- `tui.notifications`：启用/禁用 notifications（或限制为特定 types）
- `tui.notification_method`：为 terminal notifications 选择 `auto`、`osc9` 或 `bel`
- `tui.notification_condition`：选择 notifications 触发时机为 `unfocused` 或 `always`
- `tui.animations`：启用/禁用 ASCII animations 和 shimmer effects
- `tui.alternate_screen`：控制 alternate screen usage（设置为 `never` 可保留 terminal scrollback）
- `tui.show_tooltips`：显示或隐藏 welcome screen 上的 onboarding tooltips

`tui.notification_method` 默认为 `auto`。在 `auto` mode 中，当 terminal 看起来支持 OSC 9 notifications（某些 terminals 会把它解释为 desktop notification 的 terminal escape sequence）时，Codex 会优先使用它，否则回退到 BEL（`\x07`）。

请参见 [Configuration Reference](https://developers.openai.com/codex/config-reference) 获取完整 key list。
