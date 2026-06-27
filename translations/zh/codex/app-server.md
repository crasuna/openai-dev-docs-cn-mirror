---
status: needs-review
sourceId: "86e536bad977"
sourceChecksum: "86e536bad97767b28b2e1e4593d283df9fa65f082e4e80369e1a34be3990b46a"
sourceUrl: "https://developers.openai.com/codex/app-server"
translatedAt: "2026-06-27T19:07:21.7838419+08:00"
translator: codex-gpt-5.5-xhigh
---

# Codex App Server

Codex app-server 是 Codex 用来驱动富客户端（例如 Codex VS Code extension）的接口。当你想在自己的产品中进行深度集成时使用它：认证、对话历史、approvals，以及流式 agent events。app-server 实现在 Codex GitHub 仓库中开源（[openai/codex/codex-rs/app-server](https://github.com/openai/codex/tree/main/codex-rs/app-server)）。完整的开源 Codex 组件列表参见 [Open Source](https://developers.openai.com/codex/open-source) 页面。

如果你是在自动化 jobs 或在 CI 中运行 Codex，请改用
  <a href="/codex/sdk">Codex SDK</a>。

## 协议

与 [MCP](https://modelcontextprotocol.io/) 类似，`codex app-server` 支持使用 JSON-RPC 2.0 messages 进行双向通信（线上省略 `"jsonrpc":"2.0"` header）。

支持的 transports：

- `stdio`（`--listen stdio://`，默认）：newline-delimited JSON（JSONL）。
- `websocket`（`--listen ws://IP:PORT`，experimental 且 unsupported）：每个 WebSocket text frame 承载一条 JSON-RPC message。
- Unix socket（`--listen unix://` 或 `--listen unix://PATH`）：使用标准 HTTP Upgrade handshake，通过 Codex 默认 app-server control socket 或自定义 Unix socket path 建立 WebSocket connections。
- `off`（`--listen off`）：不暴露本地 transport。

当你使用 `--listen ws://IP:PORT` 运行时，同一个 listener 也会提供基本 HTTP health probes：

- 当 listener 接受新连接后，`GET /readyz` 返回 `200 OK`。
- 当 request 不包含 `Origin` header 时，`GET /healthz` 返回 `200 OK`。
- 带有 `Origin` header 的 requests 会被以 `403 Forbidden` 拒绝。

WebSocket transport 是 experimental 且 unsupported。本地 listeners（例如 `ws://127.0.0.1:PORT`）适用于 localhost 和 SSH port-forwarding 工作流。非 loopback WebSocket listeners 在 rollout 期间当前默认允许未认证连接，因此在远程暴露之前请配置 WebSocket auth。

支持的 WebSocket auth flags：

- `--ws-auth capability-token --ws-token-file /absolute/path`
- `--ws-auth capability-token --ws-token-sha256 HEX`
- `--ws-auth signed-bearer-token --ws-shared-secret-file /absolute/path`

对于 signed bearer tokens，你还可以设置 `--ws-issuer`、`--ws-audience` 和 `--ws-max-clock-skew-seconds`。Clients 会在 WebSocket handshake 期间以 `Authorization: Bearer <token>` 呈现凭据，app-server 会在 JSON-RPC `initialize` 之前强制执行 auth。

请优先使用 `--ws-token-file`，而不是在命令行上传递原始 bearer tokens。只有当 client 把原始高熵 token 保存在单独的本地 secret store 中时，才使用 `--ws-token-sha256`；该 hash 只是 verifier，clients 仍需要原始 token。

在 WebSocket mode 中，app-server 使用 bounded queues。当 request ingress 已满时，server 会以 JSON-RPC error code `-32001` 和 message `"Server overloaded; retry later."` 拒绝新 requests。Clients 应使用指数增长的 delay 和 jitter 重试。

## Message schema

Requests 包含 `method`、`params` 和 `id`：

```json
{ "method": "thread/start", "id": 10, "params": { "model": "gpt-5.4" } }
```

Responses 会回显 `id`，并包含 `result` 或 `error`：

```json
{ "id": 10, "result": { "thread": { "id": "thr_123" } } }
```

```json
{ "id": 10, "error": { "code": 123, "message": "Something went wrong" } }
```

Notifications 会省略 `id`，只使用 `method` 和 `params`：

```json
{ "method": "turn/started", "params": { "turn": { "id": "turn_456" } } }
```

你可以从 CLI 生成 TypeScript schema 或 JSON Schema bundle。每个输出都特定于你运行的 Codex 版本，因此生成的 artifacts 会与该版本精确匹配：

```bash
codex app-server generate-ts --out ./schemas
codex app-server generate-json-schema --out ./schemas
```

## 开始使用

1. 使用 `codex app-server`（默认 stdio transport）、`codex app-server --listen ws://127.0.0.1:4500`（TCP WebSocket）或 `codex app-server --listen unix://`（默认 Unix socket）启动 server。
2. 通过所选 transport 连接 client，然后发送 `initialize`，随后发送 `initialized` notification。
3. 启动一个 thread 和一个 turn，然后继续从 active transport stream 读取 notifications。

示例（Node.js / TypeScript）：

```ts



const proc = spawn("codex", ["app-server"], {
  stdio: ["pipe", "pipe", "inherit"],
});
const rl = readline.createInterface({ input: proc.stdout });

const send = (message: unknown) => {
  proc.stdin.write(`${JSON.stringify(message)}\n`);
};

let threadId: string | null = null;

rl.on("line", (line) => {
  const msg = JSON.parse(line) as any;
  console.log("server:", msg);

  if (msg.id === 1 && msg.result?.thread?.id && !threadId) {
    threadId = msg.result.thread.id;
    send({
      method: "turn/start",
      id: 2,
      params: {
        threadId,
        input: [{ type: "text", text: "Summarize this repo." }],
      },
    });
  }
});

send({
  method: "initialize",
  id: 0,
  params: {
    clientInfo: {
      name: "my_product",
      title: "My Product",
      version: "0.1.0",
    },
  },
});
send({ method: "initialized", params: {} });
send({ method: "thread/start", id: 1, params: { model: "gpt-5.4" } });
```

## Core primitives

- **Thread**：用户和 Codex agent 之间的对话。Threads 包含 turns。
- **Turn**：一次用户请求及随后的 agent 工作。Turns 包含 items，并流式传输增量更新。
- **Item**：输入或输出的一个单元（用户消息、agent 消息、命令运行、文件改动、tool call 等）。

使用 thread APIs 创建、列出或归档对话。使用 turn APIs 驱动对话，并通过 turn notifications 流式传输进度。

## 生命周期概览

- **每个连接初始化一次**：打开 transport connection 后，立即发送带有 client metadata 的 `initialize` request，然后发出 `initialized`。server 会拒绝该连接上在此 handshake 之前的任何 request。
- **启动（或恢复）thread**：为新对话调用 `thread/start`，调用 `thread/resume` 继续已有对话，或调用 `thread/fork` 把历史分支到新的 thread id。
- **开始 turn**：使用目标 `threadId` 和用户输入调用 `turn/start`。可选字段可覆盖 model、personality、`cwd`、sandbox policy 等。
- **引导 active turn**：调用 `turn/steer`，把用户输入追加到当前正在进行的 turn，而不创建新 turn。
- **流式事件**：`turn/start` 后，持续读取 stdout 上的 notifications：`thread/archived`、`thread/unarchived`、`item/started`、`item/completed`、`item/agentMessage/delta`、tool progress 和其他更新。
- **结束 turn**：当模型完成，或在 `turn/interrupt` 取消后，server 会发出带有最终 status 的 `turn/completed`。

## Initialization

Clients 必须在每个 transport connection 上先发送一个 `initialize` request，然后以 `initialized` notification 确认，之后才能调用任何其他 method。初始化前发送的 requests 会收到 `Not initialized` error；同一连接上重复的 `initialize` calls 会返回 `Already initialized`。

server 会返回它将向上游服务展示的 user agent string，以及描述 runtime target 的 `platformFamily` 和 `platformOs` 值。设置 `clientInfo` 以标识你的 integration。

`initialize.params.capabilities` 也支持通过 `optOutNotificationMethods` 针对每个连接退出某些 notifications；它是一个 exact method names 列表，用于在该连接上抑制通知。匹配是精确的（没有 wildcards/prefixes）。未知 method names 会被接受并忽略。

**Important**：使用 `clientInfo.name` 为 OpenAI Compliance Logs Platform 标识你的 client。如果你正在开发面向企业使用的新 Codex integration，请联系 OpenAI，将其加入 known clients list。更多上下文参见 [Codex logs reference](https://chatgpt.com/admin/api-reference#tag/Logs:-Codex)。

示例（来自 Codex VS Code extension）：

```json
{
  "method": "initialize",
  "id": 0,
  "params": {
    "clientInfo": {
      "name": "codex_vscode",
      "title": "Codex VS Code Extension",
      "version": "0.1.0"
    }
  }
}
```

带 notification opt-out 的示例：

```json
{
  "method": "initialize",
  "id": 1,
  "params": {
    "clientInfo": {
      "name": "my_client",
      "title": "My Client",
      "version": "0.1.0"
    },
    "capabilities": {
      "experimentalApi": true,
      "optOutNotificationMethods": ["thread/started", "item/agentMessage/delta"]
    }
  }
}
```

## Experimental API opt-in

某些 app-server methods 和 fields 会有意通过 `experimentalApi` capability gated。

- 省略 `capabilities`（或把 `experimentalApi` 设为 `false`）可停留在 stable API surface 上，server 会拒绝 experimental methods/fields。
- 将 `capabilities.experimentalApi` 设为 `true` 可启用 experimental methods 和 fields。

```json
{
  "method": "initialize",
  "id": 1,
  "params": {
    "clientInfo": {
      "name": "my_client",
      "title": "My Client",
      "version": "0.1.0"
    },
    "capabilities": {
      "experimentalApi": true
    }
  }
}
```

如果 client 在未 opt in 的情况下发送 experimental method 或 field，app-server 会用以下内容拒绝：

`<descriptor> requires experimentalApi capability`

## API 概览

- `thread/start` - 创建新 thread；发出 `thread/started`，并自动为该 thread 订阅 turn/item events。
- `thread/resume` - 按 id 重新打开已有 thread，使后续 `turn/start` calls 追加到它。
- `thread/fork` - 通过复制已存储历史，把 thread fork 成新的 thread id；为新 thread 发出 `thread/started`。返回的 threads 在可用时包含 `forkedFromId`。
- `thread/read` - 按 id 读取已存储 thread，而不恢复它；设置 `includeTurns` 可返回完整 turn history。返回的 `thread` objects 包含 runtime `status`。
- `thread/list` - 对已存储 thread logs 分页；支持 cursor-based pagination，以及 `modelProviders`、`sourceKinds`、`archived`、`cwd`、`searchTerm` 和 experimental `parentThreadId` filters。返回的 `thread` objects 包含 runtime `status`。
- `thread/turns/list` - 对已存储 thread 的 turn history 分页，而不恢复它。`itemsView` 控制 turn items 是省略、摘要还是完全加载。
- `thread/turns/items/list` - 预留用于 paged turn-item loading；当前返回 unsupported。
- `thread/loaded/list` - 列出当前加载到内存中的 thread ids。
- `thread/name/set` - 为已加载 thread 或 persisted rollout 设置或更新面向用户的名称；发出 `thread/name/updated`。
- `thread/goal/set` - 为 thread 设置 goal；发出 `thread/goal/updated`。
- `thread/goal/get` - 读取 thread 的当前 goal。
- `thread/goal/clear` - 清除 thread 的 goal；发出 `thread/goal/cleared`。
- `thread/metadata/update` - patch SQLite-backed stored thread metadata；当前支持 persisted `gitInfo`。
- `thread/archive` - 把 thread 的 log file 移入 archived directory，并尝试归档尚未归档的 spawned descendant thread logs；成功时返回 `{}`，并为每个已归档 thread 发出 `thread/archived`。
- `thread/delete` - 永久删除 persisted active 或 archived thread 及任何 spawned descendant threads；成功时返回 `{}`，并为每个已删除 thread 发出 `thread/deleted`。
- `thread/unsubscribe` - 取消此连接对 thread turn/item events 的订阅。如果这是最后一个 subscriber，server 会在一段无 subscriber inactivity grace period 后 unload 该 thread，并发出 `thread/closed`。
- `thread/unarchive` - 把 archived thread rollout 恢复回 active sessions directory；返回 restored `thread` 并发出 `thread/unarchived`。
- `thread/status/changed` - 当已加载 thread 的 runtime `status` 改变时发出的 notification。
- `thread/compact/start` - 触发 thread 的 conversation history compaction；立即返回 `{}`，同时进度通过 `turn/*` 和 `item/*` notifications 流式传输。
- `thread/shellCommand` - 针对 thread 运行用户发起的 shell command。它在 sandbox 之外以 full access 运行，并且不继承 thread sandbox policy。
- `thread/backgroundTerminals/clean` - 停止某个 thread 的所有运行中 background terminals（experimental；需要 `capabilities.experimentalApi`）。
- `thread/backgroundTerminals/list` - 列出已加载 thread 的 running background terminals（experimental；需要 `capabilities.experimentalApi`）。
- `thread/backgroundTerminals/terminate` - 按 app-server `processId` 终止一个 running background terminal（experimental；需要 `capabilities.experimentalApi`）。
- `thread/rollback` - 从 in-memory context 中删除最近 N 个 turns，并持久化 rollback marker；返回更新后的 `thread`。
- `turn/start` - 向 thread 添加用户输入并开始 Codex generation；响应初始 `turn` 并流式传输 events。对于 `collaborationMode`，`settings.developer_instructions: null` 表示“使用所选 mode 的内置指令”。
- `thread/inject_items` - 把原始 Responses API items 追加到已加载 thread 的 model-visible history，而不启动 user turn。
- `turn/steer` - 把用户输入追加到 thread 当前 active in-flight turn；返回 accepted `turnId`。
- `turn/interrupt` - 请求取消 in-flight turn；成功为 `{}`，该 turn 以 `status: "interrupted"` 结束。
- `review/start` - 为 thread 启动 Codex reviewer；发出 `enteredReviewMode` 和 `exitedReviewMode` items。
- `command/exec` - 在 server sandbox 下运行单个 command，而不启动 thread/turn。
- `command/exec/write` - 向正在运行的 `command/exec` session 写入 `stdin` bytes 或关闭 `stdin`。
- `command/exec/resize` - 调整正在运行的 PTY-backed `command/exec` session 大小。
- `command/exec/terminate` - 停止正在运行的 `command/exec` session。
- `command/exec/outputDelta` (notify) - 为 streaming `command/exec` session 发出 base64-encoded stdout/stderr chunks。
- `process/spawn` - 在 Codex sandbox 之外启动显式 process session（experimental；需要 `capabilities.experimentalApi`）。
- `process/writeStdin` - 向正在运行的 `process/spawn` session 写入 stdin bytes 或关闭 stdin（experimental）。
- `process/resizePty` - 调整正在运行的 PTY-backed process session 大小（experimental）。
- `process/kill` - 终止正在运行的 process session（experimental）。
- `process/outputDelta` 和 `process/exited` (notify) - 用于 streaming process output 和 process exit status（experimental）。
- `model/list` - 列出可用模型（设置 `includeHidden: true` 可包含带 `hidden: true` 的条目），包括 effort options、可选 `upgrade` 和 `inputModalities`。
- `modelProvider/capabilities/read` - 读取 model/provider combinations 的 provider capability bounds（experimental；需要 `capabilities.experimentalApi`）。
- `experimentalFeature/list` - 列出 feature flags，包括 lifecycle stage metadata 和 cursor pagination。
- `experimentalFeature/enablement/set` - 为受支持 feature keys（例如 `apps` 和 `plugins`）patch in-memory runtime settings。
- `collaborationMode/list` - 列出 collaboration mode presets（experimental，无 pagination）。
- `skills/list` - 列出一个或多个 `cwd` values 的 skills（支持 `forceReload` 和可选 `perCwdExtraUserRoots`）。
- `skills/changed` (notify) - 当 watched local skill files 发生改变时发出。
- `marketplace/add` - 添加 remote plugin marketplace，并把它持久化到用户的 marketplace config。
- `marketplace/upgrade` - 刷新一个已配置 Git marketplace；省略 marketplace name 时刷新所有已配置 Git marketplaces。
- `plugin/list` - 列出 discovered plugin marketplaces 和 plugin state，包括 install/auth policy metadata、marketplace load errors、featured plugin ids，以及 local、Git 或 remote plugin source metadata。
- `plugin/read` - 按 marketplace path 或 remote marketplace name 和 plugin name 读取一个 plugin，包括 bundled skills、apps、MCP server names，以及 remote catalog 提供时的 remote plugin `shareUrl`。
- `plugin/install` - 从 marketplace path 或 remote marketplace name 安装 plugin。
- `plugin/uninstall` - 卸载已安装 plugin。
- `app/list` - 列出 available apps（connectors），包含 pagination 以及 accessibility/enabled metadata。
- `skills/config/write` - 按 path 启用或禁用 skills。
- `mcpServer/oauth/login` - 为已配置 MCP server 启动 OAuth login；返回 authorization URL，并在完成时发出 `mcpServer/oauthLogin/completed`。
- `tool/requestUserInput` - 用 1-3 个简短问题提示用户进行 tool call（experimental）；questions 可设置 `isOther` 用于 free-form option。
- `config/mcpServer/reload` - 从磁盘重新加载 MCP server configuration，并为 loaded threads 排队 refresh。
- `mcpServerStatus/list` - 列出 MCP servers、tools、resources 和 auth status（cursor + limit pagination）。使用 `detail: "full"` 获取完整数据，或使用 `detail: "toolsAndAuthOnly"` 省略 resources。
- `mcpServer/resource/read` - 通过已初始化 MCP server 读取单个 MCP resource。
- `mcpServer/tool/call` - 在 thread 配置的 MCP server 上调用 tool。
- `mcpServer/startupStatus/updated` (notify) - 当 loaded thread 的已配置 MCP server startup status 改变时发出。
- `windowsSandbox/setupStart` - 为 `elevated` 或 `unelevated` mode 启动 Windows sandbox setup；快速返回，之后发出 `windowsSandbox/setupCompleted`。
- `feedback/upload` - 提交 feedback report（classification + 可选 reason/logs + conversation id，以及可选 `extraLogFiles` attachments）。
- `config/read` - 在解析 configuration layering 后，从磁盘获取 effective configuration。
- `externalAgentConfig/detect` - 检测可迁移的 external-agent artifacts，带 `includeHome` 和可选 `cwds`；每个检测项包含 `cwd`（home 时为 `null`）。
- `externalAgentConfig/import` - 通过显式传入带 `cwd`（home 时为 `null`）的 `migrationItems` 应用所选 external-agent migration items。支持的 item types 包括 config、skills、`AGENTS.md`、plugins、MCP server config、subagents、hooks、commands 和 sessions；非空 imports 会在工作完成时发出 `externalAgentConfig/import/progress` 和 `externalAgentConfig/import/completed`。Plugin 和 session imports 可能异步完成。
- `config/value/write` - 向用户磁盘上的 `config.toml` 写入单个 configuration key/value。
- `config/batchWrite` - 原子化地把 configuration edits 应用到用户磁盘上的 `config.toml`。
- `configRequirements/read` - 从 `requirements.toml` 和/或 MDM 获取 requirements，包括 allow-lists、pinned `featureRequirements` 和 residency/network requirements（如果你没有设置则为 `null`）。
- `fs/readFile`、`fs/writeFile`、`fs/createDirectory`、`fs/getMetadata`、`fs/readDirectory`、`fs/remove`、`fs/copy`、`fs/watch`、`fs/unwatch` 和 `fs/changed` (notify) - 通过 app-server v2 filesystem API 对 absolute filesystem paths 执行操作。

Plugin summaries 包含 `source` union。Local plugins 返回 `{ "type": "local", "path": ... }`，Git-backed marketplace entries 返回 `{ "type": "git", "url": ..., "path": ..., "refName": ..., "sha": ... }`，remote catalog entries 返回 `{ "type": "remote" }`。对于 remote-only catalog entries，`PluginMarketplaceEntry.path` 可以为 `null`；读取或安装这些 plugins 时，请传入 `remoteMarketplaceName`，而不是 `marketplacePath`。

## Models

### List models (`model/list`)

在渲染 model 或 personality selectors 之前，调用 `model/list` 发现可用模型及其 capabilities。

```json
{ "method": "model/list", "id": 6, "params": { "limit": 20, "includeHidden": false } }
{ "id": 6, "result": {
  "data": [{
    "id": "gpt-5.4",
    "model": "gpt-5.4",
    "displayName": "GPT-5.4",
    "hidden": false,
    "defaultReasoningEffort": "medium",
    "supportedReasoningEfforts": [{
      "reasoningEffort": "low",
      "description": "Lower latency"
    }],
    "inputModalities": ["text", "image"],
    "supportsPersonality": true,
    "isDefault": true
  }],
  "nextCursor": null
} }
```

每个 model entry 可包含：

- `supportedReasoningEfforts` - 该模型支持的 effort options。
- `defaultReasoningEffort` - clients 的建议默认 effort。
- `upgrade` - 可选的推荐 upgrade model id，用于 clients 中的 migration prompts。
- `upgradeInfo` - 可选 upgrade metadata，用于 clients 中的 migration prompts。
- `hidden` - 该模型是否从默认 picker list 中隐藏。
- `inputModalities` - 该模型支持的输入类型（例如 `text`、`image`）。
- `supportsPersonality` - 该模型是否支持 personality-specific instructions，例如 `/personality`。
- `isDefault` - 该模型是否是推荐默认值。

默认情况下，`model/list` 只返回 picker-visible models。如果你需要完整列表，并希望在 client 端使用 `hidden` 过滤，请设置 `includeHidden: true`。

当缺少 `inputModalities` 时（较旧的 model catalogs），为向后兼容，请把它视为 `["text", "image"]`。

### List experimental features (`experimentalFeature/list`)

使用此 endpoint 发现带 metadata 和 lifecycle stage 的 feature flags：

```json
{ "method": "experimentalFeature/list", "id": 7, "params": { "limit": 20 } }
{ "id": 7, "result": {
  "data": [{
    "name": "unified_exec",
    "stage": "beta",
    "displayName": "Unified exec",
    "description": "Use the unified PTY-backed execution tool.",
    "announcement": "Beta rollout for improved command execution reliability.",
    "enabled": false,
    "defaultEnabled": false
  }],
  "nextCursor": null
} }
```

`stage` 可以是 `beta`、`underDevelopment`、`stable`、`deprecated` 或 `removed`。对于非 beta flags，`displayName`、`description` 和 `announcement` 可能为 `null`。

## Threads

- `thread/read` 会读取已存储 thread，而不订阅它；设置 `includeTurns` 可包含 turns。
- `thread/turns/list` 会对已存储 thread 的 turn history 分页，而不恢复它。使用 `itemsView` 选择是否省略、摘要或完全加载 turn items。
- `thread/list` 支持 cursor pagination，以及 `modelProviders`、`sourceKinds`、`archived`、`cwd`、`searchTerm` 和 experimental `parentThreadId` filtering。
- `thread/loaded/list` 返回当前在内存中的 thread IDs。
- `thread/archive` 会把 thread 的 persisted JSONL log 移入 archived directory，并尝试归档尚未归档的 spawned descendant thread logs。
- `thread/delete` 会永久删除 persisted active 或 archived thread 及其 spawned descendant threads。
- `thread/metadata/update` 会 patch stored thread metadata，当前包括 persisted `gitInfo`。
- `thread/unsubscribe` 会取消当前连接对 loaded thread 的订阅，并可能在 inactivity grace period 后触发 `thread/closed`。
- `thread/unarchive` 会把 archived thread rollout 恢复回 active sessions directory。
- `thread/compact/start` 会触发 compaction 并立即返回 `{}`。
- `thread/rollback` 会从 in-memory context 中删除最近 N 个 turns，并在 thread 的 persisted JSONL log 中记录 rollback marker。
- `thread/inject_items` 会把原始 Responses API items 追加到 loaded thread 的 model-visible history，而不启动 user turn。

### 启动或恢复 thread

当你需要新的 Codex conversation 时，启动一个 fresh thread。

```json
{ "method": "thread/start", "id": 10, "params": {
  "model": "gpt-5.4",
  "cwd": "/Users/me/project",
  "approvalPolicy": "never",
  "sandbox": "workspaceWrite",
  "personality": "friendly",
  "serviceName": "my_app_server_client"
} }
{ "id": 10, "result": {
  "thread": {
    "id": "thr_123",
    "sessionId": "thr_123",
    "preview": "",
    "ephemeral": false,
    "modelProvider": "openai",
    "createdAt": 1730910000
  }
} }
{ "method": "thread/started", "params": { "thread": { "id": "thr_123" } } }
```

`serviceName` 是可选的。当你希望 app-server 使用你的 integration service name 标记 thread-level metrics 时，请设置它。

`thread.sessionId` 标识当前 live session tree root。Root threads 会使用自己的 thread id 作为 session id；forked threads 会保留它们来源 root 的 session id。Clients 应从 `thread.sessionId` 读取 session id，而不是从 thread id 推导。

要继续已存储 session，请用你之前记录的 `thread.id` 调用 `thread/resume`。响应形状与 `thread/start` 相同。你也可以传入 `thread/start` 支持的相同配置覆盖，例如 `personality`：

```json
{ "method": "thread/resume", "id": 11, "params": {
  "threadId": "thr_123",
  "personality": "friendly"
} }
{ "id": 11, "result": { "thread": { "id": "thr_123", "name": "Bug bash notes", "ephemeral": false } } }
```

恢复 thread 本身不会更新 `thread.updatedAt`（或 rollout file 的 modified time）。当你启动 turn 时，timestamp 才会更新。

如果你在 config 中把已启用 MCP server 标记为 `required`，并且该 server 初始化失败，`thread/start` 和 `thread/resume` 会失败，而不是在缺少它的情况下继续。

`thread/start` 上的 `dynamicTools` 是 experimental field（需要 `capabilities.experimentalApi = true`）。Codex 会把这些 dynamic tools 持久化到 thread rollout metadata 中；当你在 `thread/resume` 时不提供新的 dynamic tools，它会恢复这些工具。

如果你用不同于 rollout 中记录的模型恢复 session，Codex 会发出 warning，并在下一个 turn 上应用一次性的 model-switch instruction。

### 管理 thread goal

使用 `thread/goal/set`、`thread/goal/get` 和 `thread/goal/clear` 管理与 TUI 中 `/goal` 暴露的同一 persisted goal state。

```json
{ "method": "thread/goal/set", "id": 13, "params": {
  "threadId": "thr_123",
  "objective": "Finish the migration and keep tests green",
  "status": "active",
  "tokenBudget": 40000
} }
{ "id": 13, "result": { "goal": {
  "threadId": "thr_123",
  "objective": "Finish the migration and keep tests green",
  "status": "active",
  "tokenBudget": 40000,
  "tokensUsed": 0,
  "timeUsedSeconds": 0
} } }
{ "method": "thread/goal/updated", "params": {
  "threadId": "thr_123",
  "goal": {
    "threadId": "thr_123",
    "objective": "Finish the migration and keep tests green",
    "status": "active",
    "tokenBudget": 40000,
    "tokensUsed": 0,
    "timeUsedSeconds": 0
  }
} }
```

Goal objectives 必须非空且最多 4,000 个字符。提供新的 objective 会替换 goal 并重置 usage accounting。提供当前 non-terminal objective，或省略 `objective`，会在保留 usage history 的同时更新 status 或 token budget。

要从已存储 session 分支，请用 `thread.id` 调用 `thread/fork`。这会创建新的 thread id，并为它发出 `thread/started` notification：

```json
{ "method": "thread/fork", "id": 12, "params": { "threadId": "thr_123" } }
{ "id": 12, "result": { "thread": { "id": "thr_456", "sessionId": "thr_123", "forkedFromId": "thr_123" } } }
{ "method": "thread/started", "params": { "thread": { "id": "thr_456" } } }
```

当已设置面向用户的 thread title 时，app-server 会在 `thread/list`、`thread/read`、`thread/resume`、`thread/unarchive` 和 `thread/rollback` responses 中 hydrate `thread.name`。在之后设置标题前，`thread/start` 和 `thread/fork` 可能会省略 `name`（或返回 `null`）。

### 读取已存储 thread（不恢复）

当你想获取已存储 thread data，但不想恢复 thread 或订阅其 events 时，使用 `thread/read`。

- `includeTurns` - 当为 `true` 时，response 包含 thread 的 turns；当为 `false` 或省略时，只获取 thread summary。
- 返回的 `thread` objects 包含 runtime `status`（`notLoaded`、`idle`、`systemError`，或带 `activeFlags` 的 `active`）。

```json
{ "method": "thread/read", "id": 19, "params": { "threadId": "thr_123", "includeTurns": true } }
{ "id": 19, "result": { "thread": { "id": "thr_123", "name": "Bug bash notes", "ephemeral": false, "status": { "type": "notLoaded" }, "turns": [] } } }
```

与 `thread/resume` 不同，`thread/read` 不会把 thread 加载到内存中，也不会发出 `thread/started`。

### 列出 thread turns

使用 `thread/turns/list` 对已存储 thread 的 turn history 分页，而不恢复它。结果默认按 newest-first 返回，因此 clients 可以用 `nextCursor` 获取更早 turns。response 还包含 `backwardsCursor`；把它作为 `cursor` 并配合 `sortDirection: "asc"` 传入，即可获取比前一页第一项更新的 turns。

`itemsView` 控制 response 包含多少 turn-item data：

- `notLoaded` 省略 items。
- `summary` 返回 summarized item data，并且在省略时作为默认值。
- `full` 返回完整 item data。

```json
{ "method": "thread/turns/list", "id": 20, "params": {
  "threadId": "thr_123",
  "limit": 50,
  "sortDirection": "desc",
  "itemsView": "summary"
} }
{ "id": 20, "result": {
  "data": [],
  "nextCursor": "older-turns-cursor-or-null",
  "backwardsCursor": "newer-turns-cursor-or-null"
} }
```

`thread/turns/items/list` 预留用于 paged turn-item loading，但当前 server 返回 unsupported-method error。

### 列出 threads（带 pagination 和 filters）

`thread/list` 让你可以渲染 history UI。结果默认按 `createdAt` newest-first 排序。Filters 会在 pagination 前应用。可传入以下任意组合：

- `cursor` - 来自之前 response 的 opaque string；第一页省略。
- `limit` - 如果未设置，server 默认为合理的 page size。
- `sortKey` - `created_at`（默认）、`updated_at` 或 `recency_at`。
- `sortDirection` - `desc`（默认）或 `asc`。
- `modelProviders` - 将结果限制到特定 providers；未设置、null 或空 array 会包含所有 providers。
- `sourceKinds` - 将结果限制到特定 thread sources。省略或为 `[]` 时，server 默认只包含 interactive sources：`cli` 和 `vscode`。
- `archived` - 当为 `true` 时，只列出 archived threads。当为 `false` 或省略时，列出 non-archived threads（默认）。
- `cwd` - 将结果限制到 session current working directory 与此路径精确匹配的 threads。
- `searchTerm` - 在 pagination 前搜索 stored thread summaries 和 metadata。
- `parentThreadId` - 将结果限制到给定 parent thread 的 direct child threads。此 filter 为 experimental，需要 `capabilities.experimentalApi = true`。

`sourceKinds` 接受以下值：

- `cli`
- `vscode`
- `exec`
- `appServer`
- `subAgent`
- `subAgentReview`
- `subAgentCompact`
- `subAgentThreadSpawn`
- `subAgentOther`
- `unknown`

示例：

```json
{ "method": "thread/list", "id": 20, "params": {
  "cursor": null,
  "limit": 25,
  "sortKey": "created_at"
} }
{ "id": 20, "result": {
  "data": [
    { "id": "thr_a", "preview": "Create a TUI", "ephemeral": false, "modelProvider": "openai", "createdAt": 1730831111, "updatedAt": 1730831111, "name": "TUI prototype", "status": { "type": "notLoaded" } },
    { "id": "thr_b", "preview": "Fix tests", "ephemeral": true, "modelProvider": "openai", "createdAt": 1730750000, "updatedAt": 1730750000, "status": { "type": "notLoaded" } }
  ],
  "nextCursor": "opaque-token-or-null"
} }
```

当 `nextCursor` 为 `null` 时，表示已经到达最后一页。

### 更新已存储 thread metadata

使用 `thread/metadata/update` patch 已存储 thread metadata，而不恢复 thread。当前支持 persisted `gitInfo`；省略的 fields 保持不变，显式 `null` 会清除已存储值。

```json
{ "method": "thread/metadata/update", "id": 21, "params": {
  "threadId": "thr_123",
  "gitInfo": { "branch": "feature/sidebar-pr" }
} }
{ "id": 21, "result": {
  "thread": {
    "id": "thr_123",
    "gitInfo": { "sha": null, "branch": "feature/sidebar-pr", "originUrl": null }
  }
} }
```

### 跟踪 thread status changes

每当 loaded thread 的 runtime status 改变时，都会发出 `thread/status/changed`。payload 包含 `threadId` 和新的 `status`。

```json
{
  "method": "thread/status/changed",
  "params": {
    "threadId": "thr_123",
    "status": { "type": "active", "activeFlags": ["waitingOnApproval"] }
  }
}
```

### 列出 loaded threads

`thread/loaded/list` 返回当前加载到内存中的 thread IDs。

```json
{ "method": "thread/loaded/list", "id": 21 }
{ "id": 21, "result": { "data": ["thr_123", "thr_456"] } }
```

### 取消订阅 loaded thread

`thread/unsubscribe` 会移除当前连接对某个 thread 的订阅。response status 是以下之一：

- `unsubscribed` 表示该连接已订阅，且现在已移除。
- `notSubscribed` 表示该连接没有订阅该 thread。
- `notLoaded` 表示该 thread 未加载。

如果这是最后一个 subscriber，server 会一直保持 thread loaded，直到它在 30 分钟内既没有 subscribers 也没有 thread activity。grace period 过期后，app-server 会 unload 该 thread，并发出到 `notLoaded` 的 `thread/status/changed` transition，以及 `thread/closed`。

```json
{ "method": "thread/unsubscribe", "id": 22, "params": { "threadId": "thr_123" } }
{ "id": 22, "result": { "status": "unsubscribed" } }
```

如果 thread 之后过期：

```json
{ "method": "thread/status/changed", "params": {
    "threadId": "thr_123",
    "status": { "type": "notLoaded" }
} }
{ "method": "thread/closed", "params": { "threadId": "thr_123" } }
```

### 归档 thread

使用 `thread/archive` 把 persisted thread log（以 JSONL file 存储在磁盘上）移入 archived sessions directory。归档 thread 也会尝试归档尚未归档的 spawned descendant threads。

```json
{ "method": "thread/archive", "id": 22, "params": { "threadId": "thr_b" } }
{ "id": 22, "result": {} }
{ "method": "thread/archived", "params": { "threadId": "thr_b" } }
{ "method": "thread/archived", "params": { "threadId": "thr_child" } }
```

除非你传入 `archived: true`，否则 archived threads 不会出现在未来的 `thread/list` calls 中。server 会为它实际归档的每个 thread 发出一个 `thread/archived` notification；如果某个 spawned descendant 无法归档，请求仍可能成功，但不会为该 descendant 发出 archived notification。

### 删除 thread

使用 `thread/delete` 永久删除 persisted active 或 archived thread 及其 spawned descendant threads。server 会在返回成功前移除现有 rollout files 和关联 metadata；缺失的 rollout files 会被视为已删除。Ephemeral root threads 不能被删除。

```json
{ "method": "thread/delete", "id": 23, "params": { "threadId": "thr_b" } }
{ "id": 23, "result": {} }
{ "method": "thread/deleted", "params": { "threadId": "thr_b" } }
{ "method": "thread/deleted", "params": { "threadId": "thr_child" } }
```

### 取消归档 thread

使用 `thread/unarchive` 把 archived thread rollout 移回 active sessions directory。

```json
{ "method": "thread/unarchive", "id": 24, "params": { "threadId": "thr_b" } }
{ "id": 24, "result": { "thread": { "id": "thr_b", "name": "Bug bash notes" } } }
{ "method": "thread/unarchived", "params": { "threadId": "thr_b" } }
```

### 触发 thread compaction

使用 `thread/compact/start` 触发 thread 的手动 history compaction。request 会立即以 `{}` 返回。

App-server 会在同一个 `threadId` 上以标准 `turn/*` 和 `item/*` notifications 发出进度，包括 `contextCompaction` item lifecycle（`item/started` 然后 `item/completed`）。

```json
{ "method": "thread/compact/start", "id": 25, "params": { "threadId": "thr_b" } }
{ "id": 25, "result": {} }
```

### 运行 thread shell command

对属于某个 thread 的用户发起 shell commands 使用 `thread/shellCommand`。request 会立即以 `{}` 返回，同时进度通过标准 `turn/*` 和 `item/*` notifications 流式传输。

此 API 在 sandbox 之外以 full access 运行，并且不继承 thread sandbox policy。Clients 应只为显式由用户发起的命令暴露它。

如果 thread 已有 active turn，该命令会作为该 turn 上的 auxiliary action 运行，其格式化输出会注入 turn 的 message stream。如果 thread idle，app-server 会为该 shell command 启动 standalone turn。

```json
{ "method": "thread/shellCommand", "id": 26, "params": { "threadId": "thr_b", "command": "git status --short" } }
{ "id": 26, "result": {} }
```

### 清理 background terminals

使用 `thread/backgroundTerminals/clean` 停止与某个 thread 关联的所有运行中 background terminals。此 method 为 experimental，需要 `capabilities.experimentalApi = true`。

```json
{ "method": "thread/backgroundTerminals/clean", "id": 27, "params": { "threadId": "thr_b" } }
{ "id": 27, "result": {} }
```

使用 `thread/backgroundTerminals/list` 检查 loaded thread 的 running background terminals。request 支持标准 `cursor` 和 `limit` pagination，返回的 `processId` 是 app-server process id。此 method 为 experimental，需要 `capabilities.experimentalApi = true`：

```json
{ "method": "thread/backgroundTerminals/list", "id": 28, "params": { "threadId": "thr_b" } }
{ "id": 28, "result": { "data": [
  {
    "itemId": "item_456",
    "processId": "42",
    "command": "python3 -m http.server",
    "cwd": "/workspace",
    "osPid": null,
    "cpuPercent": null,
    "rssKb": null
  }
], "nextCursor": null } }
```

使用 `thread/backgroundTerminals/terminate` 和该 `processId` 停止一个 background terminal。此 method 为 experimental，需要 `capabilities.experimentalApi = true`：

```json
{ "method": "thread/backgroundTerminals/terminate", "id": 29, "params": { "threadId": "thr_b", "processId": "42" } }
{ "id": 29, "result": { "terminated": true } }
```

### 回滚最近 turns

使用 `thread/rollback` 从 in-memory context 中移除最近 `numTurns` 个 entries，并在 rollout log 中持久化 rollback marker。返回的 `thread` 会包含 rollback 后填充的 `turns`。

```json
{ "method": "thread/rollback", "id": 30, "params": { "threadId": "thr_b", "numTurns": 1 } }
{ "id": 30, "result": { "thread": { "id": "thr_b", "name": "Bug bash notes", "ephemeral": false } } }
```

## Turns

`input` field 接受 item 列表：

- `{ "type": "text", "text": "Explain this diff" }`
- `{ "type": "image", "url": "https://.../design.png" }`
- `{ "type": "localImage", "path": "/tmp/screenshot.png" }`

你可以按 turn 覆盖 configuration settings（model、effort、personality、`cwd`、sandbox policy、summary）。指定后，这些设置会成为同一 thread 后续 turns 的默认值。`outputSchema` 只适用于当前 turn。对于 `sandboxPolicy.type = "externalSandbox"`，请把 `networkAccess` 设置为 `restricted` 或 `enabled`；对于 `workspaceWrite`，`networkAccess` 保持 boolean。

对于 `turn/start.collaborationMode`，`settings.developer_instructions: null` 表示“使用所选 mode 的内置指令”，而不是清除 mode instructions。

### Sandbox read access (`ReadOnlyAccess`)

`sandboxPolicy` 支持显式 read-access controls：

- `readOnly`：可选 `access`（默认 `{ "type": "fullAccess" }`，或 restricted roots）。
- `workspaceWrite`：可选 `readOnlyAccess`（默认 `{ "type": "fullAccess" }`，或 restricted roots）。

Restricted read access shape：

```json
{
  "type": "restricted",
  "includePlatformDefaults": true,
  "readableRoots": ["/Users/me/shared-read-only"]
}
```

在 macOS 上，`includePlatformDefaults: true` 会为 restricted-read sessions 追加精选的 platform-default Seatbelt policy。这会提升工具兼容性，而不会广泛允许整个 `/System`。

示例：

```json
{ "type": "readOnly", "access": { "type": "fullAccess" } }
```

```json
{
  "type": "workspaceWrite",
  "writableRoots": ["/Users/me/project"],
  "readOnlyAccess": {
    "type": "restricted",
    "includePlatformDefaults": true,
    "readableRoots": ["/Users/me/shared-read-only"]
  },
  "networkAccess": false
}
```

### 启动 turn

```json
{ "method": "turn/start", "id": 30, "params": {
  "threadId": "thr_123",
  "input": [ { "type": "text", "text": "Run tests" } ],
  "cwd": "/Users/me/project",
  "approvalPolicy": "unlessTrusted",
  "sandboxPolicy": {
    "type": "workspaceWrite",
    "writableRoots": ["/Users/me/project"],
    "networkAccess": true
  },
  "model": "gpt-5.4",
  "effort": "medium",
  "summary": "concise",
  "personality": "friendly",
  "outputSchema": {
    "type": "object",
    "properties": { "answer": { "type": "string" } },
    "required": ["answer"],
    "additionalProperties": false
  }
} }
{ "id": 30, "result": { "turn": { "id": "turn_456", "status": "inProgress", "items": [], "error": null } } }
```

### 向 thread 注入 items

使用 `thread/inject_items` 把预构建的 Responses API items 追加到 loaded thread 的 prompt history，而不启动 user turn。这些 items 会持久化到 rollout 中，并包含在后续 model requests 里。

```json
{ "method": "thread/inject_items", "id": 31, "params": {
  "threadId": "thr_123",
  "items": [
    {
      "type": "message",
      "role": "assistant",
      "content": [{ "type": "output_text", "text": "Previously computed context." }]
    }
  ]
} }
{ "id": 31, "result": {} }
```

### 引导 active turn

使用 `turn/steer` 向 active in-flight turn 追加更多用户输入。

- 包含 `expectedTurnId`；它必须匹配 active turn id。
- 如果 thread 上没有 active turn，request 会失败。
- `turn/steer` 不会发出新的 `turn/started` notification。
- `turn/steer` 不接受 turn-level overrides（`model`、`cwd`、`sandboxPolicy` 或 `outputSchema`）。

```json
{ "method": "turn/steer", "id": 32, "params": {
  "threadId": "thr_123",
  "input": [ { "type": "text", "text": "Actually focus on failing tests first." } ],
  "expectedTurnId": "turn_456"
} }
{ "id": 32, "result": { "turnId": "turn_456" } }
```

### 启动 turn（调用 skill）

通过在文本输入中包含 `$<skill-name>`，并在旁边添加 `skill` input item，显式调用 skill。

```json
{ "method": "turn/start", "id": 33, "params": {
  "threadId": "thr_123",
  "input": [
    { "type": "text", "text": "$skill-creator Add a new skill for triaging flaky CI and include step-by-step usage." },
    { "type": "skill", "name": "skill-creator", "path": "/Users/me/.codex/skills/skill-creator/SKILL.md" }
  ]
} }
{ "id": 33, "result": { "turn": { "id": "turn_457", "status": "inProgress", "items": [], "error": null } } }
```

### 中断 turn

```json
{ "method": "turn/interrupt", "id": 31, "params": { "threadId": "thr_123", "turnId": "turn_456" } }
{ "id": 31, "result": {} }
```

成功时，该 turn 会以 `status: "interrupted"` 结束。

## Review

`review/start` 会为某个 thread 运行 Codex reviewer，并流式传输 review items。Targets 包括：

- `uncommittedChanges`
- `baseBranch`（针对某个分支的 diff）
- `commit`（审查特定 commit）
- `custom`（free-form instructions）

使用 `delivery: "inline"`（默认）在现有 thread 上运行 review，或使用 `delivery: "detached"` fork 一个新的 review thread。

示例 request/response：

```json
{ "method": "review/start", "id": 40, "params": {
  "threadId": "thr_123",
  "delivery": "inline",
  "target": { "type": "commit", "sha": "1234567deadbeef", "title": "Polish tui colors" }
} }
{ "id": 40, "result": {
  "turn": {
    "id": "turn_900",
    "status": "inProgress",
    "items": [
      { "type": "userMessage", "id": "turn_900", "content": [ { "type": "text", "text": "Review commit 1234567: Polish tui colors" } ] }
    ],
    "error": null
  },
  "reviewThreadId": "thr_123"
} }
```

对于 detached review，使用 `"delivery": "detached"`。response 形状相同，但 `reviewThreadId` 会是新 review thread 的 id（不同于原始 `threadId`）。server 还会在流式传输 review turn 前为该新 thread 发出 `thread/started` notification。

Codex 会先流式传输常规 `turn/started` notification，随后是带 `enteredReviewMode` item 的 `item/started`：

```json
{
  "method": "item/started",
  "params": {
    "item": {
      "type": "enteredReviewMode",
      "id": "turn_900",
      "review": "current changes"
    }
  }
}
```

reviewer 完成后，server 会发出 `item/started` 和 `item/completed`，其中包含带最终 review text 的 `exitedReviewMode` item：

```json
{
  "method": "item/completed",
  "params": {
    "item": {
      "type": "exitedReviewMode",
      "id": "turn_900",
      "review": "Looks solid overall..."
    }
  }
}
```

使用此 notification 在你的 client 中渲染 reviewer output。

## Process execution

`process/*` 是一个 experimental、显式的 process-control API。它需要 `capabilities.experimentalApi = true`，并在 Codex sandbox 之外运行。只有当你的 client 有意暴露不带 sandbox 的本地 process control 时，才使用它。

使用 `process/spawn` 启动 process 并提供 `processHandle`，随后用该 handle 进行 stdin、resize 和 kill requests。Output 通过 `process/outputDelta` notifications 流式传输，completion 通过 `process/exited` 流式传输。

```json
{ "method": "process/spawn", "id": 48, "params": {
  "command": ["python3", "-m", "pytest", "-q"],
  "processHandle": "pytest-1",
  "cwd": "/Users/me/project",
  "tty": true
} }
{ "id": 48, "result": {} }
{ "method": "process/outputDelta", "params": {
  "processHandle": "pytest-1",
  "stream": "stdout",
  "deltaBase64": "Li4u"
} }
{ "method": "process/exited", "params": {
  "processHandle": "pytest-1",
  "exitCode": 0
} }
```

使用带 `deltaBase64`、`closeStdin` 或两者的 `process/writeStdin` 发送 input。使用 `process/resizePty` 处理 PTY resize events，使用 `process/kill` 终止运行中的 process。

## Command execution

`command/exec` 会在 server sandbox 下运行单个 command（`argv` array），而不创建 thread。

```json
{ "method": "command/exec", "id": 50, "params": {
  "command": ["ls", "-la"],
  "cwd": "/Users/me/project",
  "sandboxPolicy": { "type": "workspaceWrite" },
  "timeoutMs": 10000
} }
{ "id": 50, "result": { "exitCode": 0, "stdout": "...", "stderr": "" } }
```

如果你已经对 server process 做了 sandbox，并希望 Codex 跳过自己的 sandbox enforcement，请使用 `sandboxPolicy.type = "externalSandbox"`。对于 external sandbox mode，请把 `networkAccess` 设置为 `restricted`（默认）或 `enabled`。对于 `readOnly` 和 `workspaceWrite`，使用上面展示的相同可选 `access` / `readOnlyAccess` 结构。

说明：

- server 会拒绝空的 `command` arrays。
- `sandboxPolicy` 接受与 `turn/start` 相同的形状（例如 `dangerFullAccess`、`readOnly`、`workspaceWrite`、`externalSandbox`）。
- 省略时，`timeoutMs` 会回退到 server 默认值。
- 对 PTY-backed sessions 设置 `tty: true`；当你计划后续使用 `command/exec/write`、`command/exec/resize` 或 `command/exec/terminate` 时，请使用 `processId`。
- 设置 `streamStdoutStderr: true` 可在命令运行期间接收 `command/exec/outputDelta` notifications。

### 读取 admin requirements (`configRequirements/read`)

使用 `configRequirements/read` 检查从 `requirements.toml` 和/或 MDM 加载的 effective admin requirements。

```json
{ "method": "configRequirements/read", "id": 52, "params": {} }
{ "id": 52, "result": {
  "requirements": {
    "allowedApprovalPolicies": ["onRequest", "unlessTrusted"],
    "allowedSandboxModes": ["readOnly", "workspaceWrite"],
    "featureRequirements": {
      "personality": true,
      "unified_exec": false
    },
    "network": {
      "enabled": true,
      "allowedDomains": ["api.openai.com"],
      "allowUnixSockets": ["/tmp/example.sock"],
      "dangerouslyAllowAllUnixSockets": false
    }
  }
} }
```

当没有配置 requirements 时，`result.requirements` 为 `null`。有关受支持 keys 和 values 的详情，请参阅 [`requirements.toml`](https://developers.openai.com/codex/config-reference#requirementstoml) 文档。

### Windows sandbox setup (`windowsSandbox/setupStart`)

自定义 Windows clients 可以异步触发 sandbox setup，而不是在 startup checks 上阻塞。

```json
{ "method": "windowsSandbox/setupStart", "id": 53, "params": { "mode": "elevated" } }
{ "id": 53, "result": { "started": true } }
```

App-server 会在后台启动 setup，并在之后发出 completion notification：

```json
{
  "method": "windowsSandbox/setupCompleted",
  "params": { "mode": "elevated", "success": true, "error": null }
}
```

Modes：

- `elevated` - 运行 elevated Windows sandbox setup path。
- `unelevated` - 运行 legacy setup/preflight path。

## Filesystem

v2 filesystem APIs 作用于 absolute paths。当 client 需要在文件或目录变化后使 UI state 失效时，使用 `fs/watch`。

```json
{ "method": "fs/watch", "id": 54, "params": {
  "watchId": "0195ec6b-1d6f-7c2e-8c7a-56f2c4a8b9d1",
  "path": "/Users/me/project/.git/HEAD"
} }
{ "id": 54, "result": { "path": "/Users/me/project/.git/HEAD" } }
{ "method": "fs/changed", "params": {
  "watchId": "0195ec6b-1d6f-7c2e-8c7a-56f2c4a8b9d1",
  "changedPaths": ["/Users/me/project/.git/HEAD"]
} }
{ "method": "fs/unwatch", "id": 55, "params": {
  "watchId": "0195ec6b-1d6f-7c2e-8c7a-56f2c4a8b9d1"
} }
{ "id": 55, "result": {} }
```

Watching a file 会为该 file path 发出 `fs/changed`，包括通过 replace 或 rename operations 交付的更新。

## Events

Event notifications 是 server 发起的 stream，用于 thread lifecycles、turn lifecycles 以及其中的 items。启动或恢复 thread 后，请持续读取 active transport stream 中的 `thread/started`、`thread/archived`、`thread/unarchived`、`thread/closed`、`thread/status/changed`、`turn/*`、`item/*` 和 `serverRequest/resolved` notifications。

### Notification opt-out

Clients 可以通过在 `initialize.params.capabilities.optOutNotificationMethods` 中发送 exact method names，按连接抑制特定 notifications。

- 仅精确匹配：`item/agentMessage/delta` 只会抑制该 method。
- 未知 method names 会被忽略。
- 适用于当前 `thread/*`、`turn/*`、`item/*` 和相关 v2 notifications。
- 不适用于 requests、responses 或 errors。

### Fuzzy file search events（experimental）

Fuzzy file search session API 会发出 per-query notifications：

- `fuzzyFileSearch/sessionUpdated` - `{ sessionId, query, files }`，包含 active query 的当前匹配。
- `fuzzyFileSearch/sessionCompleted` - `{ sessionId }`，在该 query 的 indexing 和 matching 完成后发出。

### Windows sandbox setup events

- `windowsSandbox/setupCompleted` - 在 `windowsSandbox/setupStart` request 完成后发出 `{ mode, success, error }`。

### Turn events

- `turn/started` - 带有 turn id、空 `items` 和 `status: "inProgress"` 的 `{ turn }`。
- `turn/completed` - `{ turn }`，其中 `turn.status` 为 `completed`、`interrupted` 或 `failed`；failures 携带 `{ error: { message, codexErrorInfo?, additionalDetails? } }`。
- `turn/diff/updated` - `{ threadId, turnId, diff }`，包含该 turn 中每个 file change 的最新 aggregated unified diff。
- `turn/plan/updated` - 当 agent 共享或更改其计划时发出 `{ turnId, explanation?, plan }`；每个 `plan` entry 是 `{ step, status }`，其中 `status` 为 `pending`、`inProgress` 或 `completed`。
- `thread/tokenUsage/updated` - active thread 的 usage updates。

`turn/diff/updated` 和 `turn/plan/updated` 当前会包含空 `items` arrays，即使 item events 正在流式传输。请使用 `item/*` notifications 作为 turn items 的事实来源。

### Items

`ThreadItem` 是 turn responses 和 `item/*` notifications 中携带的 tagged union。常见 item types 包括：

- `userMessage` - `{id, content}`，其中 `content` 是用户输入列表（`text`、`image` 或 `localImage`）。
- `agentMessage` - `{id, text, phase?}`，包含累积的 agent reply。存在时，`phase` 使用 Responses API wire values（`commentary`、`final_answer`）。
- `plan` - `{id, text}`，包含 plan mode 中提出的计划文本。把 `item/completed` 的最终 `plan` item 视为权威。
- `reasoning` - `{id, summary, content}`，其中 `summary` 保存 streamed reasoning summaries，`content` 保存 raw reasoning blocks。
- `commandExecution` - `{id, command, cwd, status, commandActions, aggregatedOutput?, exitCode?, durationMs?}`。
- `fileChange` - `{id, changes, status}`，描述 proposed edits；`changes` 列表为 `{path, kind, diff}`。
- `mcpToolCall` - `{id, server, tool, status, arguments, result?, error?}`。
- `dynamicToolCall` - `{id, tool, arguments, status, contentItems?, success?, durationMs?}`，用于 client-executed dynamic tool invocations。
- `collabToolCall` - `{id, tool, status, senderThreadId, receiverThreadId?, newThreadId?, prompt?, agentStatus?}`。
- `webSearch` - `{id, query, action?}`，用于 agent 发出的 web search requests。
- `imageView` - `{id, path}`，当 agent 调用 image viewer tool 时发出。
- `enteredReviewMode` - `{id, review}`，reviewer 启动时发送。
- `exitedReviewMode` - `{id, review}`，reviewer 完成时发出。
- `contextCompaction` - `{id}`，当 Codex compact conversation history 时发出。

对于 `webSearch.action`，action `type` 可以是 `search`（`query?`、`queries?`）、`openPage`（`url?`）或 `findInPage`（`url?`、`pattern?`）。

app server 弃用 legacy `thread/compacted` notification；请改用 `contextCompaction` item。

所有 items 都会发出两个共享 lifecycle events：

- `item/started` - 当新的 work unit 开始时发出完整 `item`；`item.id` 与 deltas 使用的 `itemId` 匹配。
- `item/completed` - 在工作完成后发送最终 `item`；将其视为权威状态。

### Item deltas

- `item/agentMessage/delta` - 追加 agent message 的 streamed text。
- `item/plan/delta` - 流式传输 proposed plan text。最终 `plan` item 可能不完全等于拼接后的 deltas。
- `item/reasoning/summaryTextDelta` - 流式传输可读 reasoning summaries；当打开新 summary section 时，`summaryIndex` 会递增。
- `item/reasoning/summaryPartAdded` - 标记 reasoning summary sections 之间的边界。
- `item/reasoning/textDelta` - 流式传输 raw reasoning text（当模型支持时）。
- `item/commandExecution/outputDelta` - 为 command 流式传输 stdout/stderr；按顺序追加 deltas。
- `item/fileChange/outputDelta` - legacy `apply_patch` text output 的 deprecated compatibility notification。当前 app-server versions 不再发出它；请改用 `fileChange` items 和 `turn/diff/updated`。

## Errors

如果 turn 失败，server 会发出带 `{ error: { message, codexErrorInfo?, additionalDetails? } }` 的 `error` event，然后以 `status: "failed"` 结束该 turn。当可获得 upstream HTTP status 时，它会出现在 `codexErrorInfo.httpStatusCode` 中。

常见 `codexErrorInfo` values 包括：

- `ContextWindowExceeded`
- `UsageLimitExceeded`
- `HttpConnectionFailed`（4xx/5xx upstream errors）
- `ResponseStreamConnectionFailed`
- `ResponseStreamDisconnected`
- `ResponseTooManyFailedAttempts`
- `BadRequest`、`Unauthorized`、`SandboxError`、`InternalServerError`、`Other`

当可获得 upstream HTTP status 时，server 会在相关 `codexErrorInfo` variant 的 `httpStatusCode` 中转发它。

## Approvals

根据用户的 Codex settings，command execution 和 file changes 可能需要 approval。app-server 会向 client 发送 server-initiated JSON-RPC request，client 则以 decision payload 响应。

- Command execution decisions：`accept`、`acceptForSession`、`decline`、`cancel`，或 `{ "acceptWithExecpolicyAmendment": { "execpolicy_amendment": ["cmd", "..."] } }`。
- File change decisions：`accept`、`acceptForSession`、`decline`、`cancel`。

- Requests 包含 `threadId` 和 `turnId` - 使用它们将 UI state 限定到 active conversation。
- server 会恢复或拒绝该工作，并以 `item/completed` 结束 item。

### Command execution approvals

消息顺序：

1. `item/started` 显示 pending `commandExecution` item，其中带有 `command`、`cwd` 和其他 fields。
2. `item/commandExecution/requestApproval` 包含 `itemId`、`threadId`、`turnId`、可选 `reason`、可选 `command`、可选 `cwd`、可选 `commandActions`、可选 `proposedExecpolicyAmendment`、可选 `networkApprovalContext` 和可选 `availableDecisions`。当 `initialize.params.capabilities.experimentalApi = true` 时，payload 还可以包含 experimental `additionalPermissions`，用于描述请求的 per-command sandbox access。`additionalPermissions` 内的任何 filesystem paths 在线上都是 absolute。
3. Client 使用上述 command execution approval decisions 之一响应。
4. `serverRequest/resolved` 确认 pending request 已被回答或清除。
5. `item/completed` 返回最终 `commandExecution` item，其 `status` 为 completed | failed | declined。

当存在 `networkApprovalContext` 时，该提示用于 managed network access（而不是一般 shell-command approval）。当前 v2 schema 会暴露目标 `host` 和 `protocol`；clients 应渲染 network-specific prompt，而不要依赖 `command` 是对用户有意义的 shell command preview。

Codex 会按 destination（`host`、protocol 和 port）对并发 network approval prompts 分组。因此，app-server 可能发送一个 prompt，解锁到同一 destination 的多个 queued requests；同一 host 上的不同 ports 会分开处理。

### File change approvals

消息顺序：

1. `item/started` 发出 `fileChange` item，其中包含 proposed `changes` 和 `status: "inProgress"`。
2. `item/fileChange/requestApproval` 包含 `itemId`、`threadId`、`turnId`、可选 `reason` 和可选 `grantRoot`。
3. Client 使用上述 file change approval decisions 之一响应。
4. `serverRequest/resolved` 确认 pending request 已被回答或清除。
5. `item/completed` 返回最终 `fileChange` item，其 `status` 为 completed | failed | declined。

### `tool/requestUserInput`

当 client 响应 `item/tool/requestUserInput` 时，app-server 会发出带 `{ threadId, requestId }` 的 `serverRequest/resolved`。如果 pending request 在 client 回答前因 turn start、turn completion 或 turn interruption 被清除，server 会为该清理发出相同 notification。

Request params 包含 `autoResolutionMs`，它是 integer millisecond timeout 或 `null`。存在时，如果用户没有回答，host clients 可以在该间隔后自动 resolve prompt。

### Dynamic tool calls（experimental）

`thread/start` 上的 `dynamicTools` 以及相应的 `item/tool/call` request 或 response flow 是 experimental APIs。

Dynamic tool names 和 namespace names 必须遵循 Responses API naming constraints。避免使用内置 Codex tools 使用的 reserved namespace names。

当某个 dynamic tool 在 turn 期间被调用时，app-server 会发出：

1. `item/started`，其中 `item.type = "dynamicToolCall"`、`status = "inProgress"`，以及 `tool` 和 `arguments`。
2. `item/tool/call`，作为发送给 client 的 server request。
3. Client response payload，带返回的 content items。
4. `item/completed`，其中 `item.type = "dynamicToolCall"`、最终 `status`，以及任何返回的 `contentItems` 或 `success` value。

### MCP tool-call approvals（apps）

App（connector）tool calls 也可能需要 approval。当 app tool call 有副作用时，server 可能使用 `tool/requestUserInput` 和 **Accept**、**Decline**、**Cancel** 等选项请求 approval。Destructive tool annotations 总是触发 approval，即使该 tool 也声明了权限更低的 hints。如果用户 decline 或 cancel，相关 `mcpToolCall` item 会以 error 完成，而不是运行该 tool。

## Skills

通过在用户文本输入中包含 `$<skill-name>` 来调用 skill。添加 `skill` input item（推荐），这样 server 会注入完整 skill instructions，而不是依赖模型解析名称。

```json
{
  "method": "turn/start",
  "id": 101,
  "params": {
    "threadId": "thread-1",
    "input": [
      {
        "type": "text",
        "text": "$skill-creator Add a new skill for triaging flaky CI."
      },
      {
        "type": "skill",
        "name": "skill-creator",
        "path": "/Users/me/.codex/skills/skill-creator/SKILL.md"
      }
    ]
  }
}
```

如果省略 `skill` item，模型仍会解析 `$<skill-name>` marker 并尝试定位该 skill，这可能增加 latency。

示例：

```
$skill-creator Add a new skill for triaging flaky CI and include step-by-step usage.
```

使用 `skills/list` 获取可用 skills（可选按 `cwds` 限定，并带 `forceReload`）。你也可以包含 `perCwdExtraUserRoots`，为特定 `cwd` values 扫描额外 absolute paths 作为 `user` scope。app-server 会忽略 `cwd` 不在 `cwds` 中的条目。`skills/list` 可能复用每个 `cwd` 的 cached result；设置 `forceReload: true` 可从磁盘刷新。当存在时，server 会从 `SKILL.json` 读取 `interface` 和 `dependencies`。

```json
{ "method": "skills/list", "id": 25, "params": {
  "cwds": ["/Users/me/project", "/Users/me/other-project"],
  "forceReload": true,
  "perCwdExtraUserRoots": [
    {
      "cwd": "/Users/me/project",
      "extraUserRoots": ["/Users/me/shared-skills"]
    }
  ]
} }
{ "id": 25, "result": {
  "data": [{
    "cwd": "/Users/me/project",
    "skills": [
      {
        "name": "skill-creator",
        "description": "Create or update a Codex skill",
        "enabled": true,
        "interface": {
          "displayName": "Skill Creator",
          "shortDescription": "Create or update a Codex skill"
        },
        "dependencies": {
          "tools": [
            {
              "type": "env_var",
              "value": "GITHUB_TOKEN",
              "description": "GitHub API token"
            },
            {
              "type": "mcp",
              "value": "github",
              "transport": "streamable_http",
              "url": "https://example.com/mcp"
            }
          ]
        }
      }
    ],
    "errors": []
  }]
} }
```

当 watched local skill files 发生变化时，server 也会发出 `skills/changed` notifications。将它视为 invalidation signal，并在需要时用当前 params 重新运行 `skills/list`。

按 path 启用或禁用 skill：

```json
{
  "method": "skills/config/write",
  "id": 26,
  "params": {
    "path": "/Users/me/.codex/skills/skill-creator/SKILL.md",
    "enabled": false
  }
}
```

## Apps（connectors）

使用 `app/list` 获取可用 apps。在 CLI/TUI 中，`/apps` 是面向用户的 picker；在自定义 clients 中，请直接调用 `app/list`。每个 entry 同时包含 `isAccessible`（对用户可用）和 `isEnabled`（在 `config.toml` 中启用），因此 clients 可以区分安装/访问状态和本地启用状态。App entries 还可以包含可选 `branding`、`appMetadata` 和 `labels` fields。

```json
{ "method": "app/list", "id": 50, "params": {
  "cursor": null,
  "limit": 50,
  "threadId": "thread-1",
  "forceRefetch": false
} }
{ "id": 50, "result": {
  "data": [
    {
      "id": "demo-app",
      "name": "Demo App",
      "description": "Example connector for documentation.",
      "logoUrl": "https://example.com/demo-app.png",
      "logoUrlDark": null,
      "distributionChannel": null,
      "branding": null,
      "appMetadata": null,
      "labels": null,
      "installUrl": "https://chatgpt.com/apps/demo-app/demo-app",
      "isAccessible": true,
      "isEnabled": true
    }
  ],
  "nextCursor": null
} }
```

如果你提供 `threadId`，app feature gating（`features.apps`）会使用该 thread 的 config snapshot。省略时，app-server 使用最新的 global config。

`app/list` 会在 accessible apps 和 directory apps 都加载完成后返回。设置 `forceRefetch: true` 可绕过 app caches 并获取 fresh data。Cache entries 只会在 refresh 成功时被替换。

每当任一来源（accessible apps 或 directory apps）完成加载时，server 也会发出 `app/list/updated` notifications。每个 notification 都包含最新的 merged app list。

```json
{
  "method": "app/list/updated",
  "params": {
    "data": [
      {
        "id": "demo-app",
        "name": "Demo App",
        "description": "Example connector for documentation.",
        "logoUrl": "https://example.com/demo-app.png",
        "logoUrlDark": null,
        "distributionChannel": null,
        "branding": null,
        "appMetadata": null,
        "labels": null,
        "installUrl": "https://chatgpt.com/apps/demo-app/demo-app",
        "isAccessible": true,
        "isEnabled": true
      }
    ]
  }
}
```

通过在 text input 中插入 `$<app-slug>`，并添加带 `app://<id>` path 的 `mention` input item（推荐）来调用 app。

```json
{
  "method": "turn/start",
  "id": 51,
  "params": {
    "threadId": "thread-1",
    "input": [
      {
        "type": "text",
        "text": "$demo-app Pull the latest updates from the team."
      },
      {
        "type": "mention",
        "name": "Demo App",
        "path": "app://demo-app"
      }
    ]
  }
}
```

### App settings 的 Config RPC 示例

使用 `config/read`、`config/value/write` 和 `config/batchWrite` 检查或更新 `config.toml` 中的 app controls。

读取 effective app config shape（包括 `_default` 和 per-tool overrides）：

```json
{ "method": "config/read", "id": 60, "params": { "includeLayers": false } }
{ "id": 60, "result": {
  "config": {
    "apps": {
      "_default": {
        "enabled": true,
        "destructive_enabled": true,
        "open_world_enabled": true,
        "approvals_reviewer": "user",
        "default_tools_approval_mode": "auto"
      },
      "google_drive": {
        "enabled": true,
        "destructive_enabled": false,
        "approvals_reviewer": "auto_review",
        "default_tools_approval_mode": "prompt",
        "tools": {
          "files/delete": { "enabled": false, "approval_mode": "approve" }
        }
      }
    }
  }
} }
```

`apps._default.approvals_reviewer` 会为所有 apps 设置 reviewer，除非 per-app value 覆盖它。当两者都省略时，app 会继承 top-level `approvals_reviewer` value。`apps._default.default_tools_approval_mode` 会为没有 per-app 或 per-tool override 的 tools 设置 fallback approval mode。Managed approval-mode requirements 会覆盖 tool approval-mode settings。

更新单个 app setting：

```json
{
  "method": "config/value/write",
  "id": 61,
  "params": {
    "keyPath": "apps.google_drive.default_tools_approval_mode",
    "value": "prompt",
    "mergeStrategy": "replace"
  }
}
```

原子化应用多个 app edits：

```json
{
  "method": "config/batchWrite",
  "id": 62,
  "params": {
    "edits": [
      {
        "keyPath": "apps._default.destructive_enabled",
        "value": false,
        "mergeStrategy": "upsert"
      },
      {
        "keyPath": "apps.google_drive.tools.files/delete.approval_mode",
        "value": "approve",
        "mergeStrategy": "upsert"
      }
    ]
  }
}
```

### 检测并导入 external agent config

使用 `externalAgentConfig/detect` 发现可迁移的 external-agent artifacts，然后把所选 entries 传给 `externalAgentConfig/import`。

Detection 示例：

```json
{ "method": "externalAgentConfig/detect", "id": 63, "params": {
  "includeHome": true,
  "cwds": ["/Users/me/project"]
} }
{ "id": 63, "result": {
  "items": [
    {
      "itemType": "AGENTS_MD",
      "description": "Import /Users/me/project/CLAUDE.md to /Users/me/project/AGENTS.md.",
      "cwd": "/Users/me/project"
    },
    {
      "itemType": "SKILLS",
      "description": "Copy skill folders from /Users/me/.claude/skills to /Users/me/.agents/skills.",
      "cwd": null
    }
  ]
} }
```

Import 示例：

```json
{ "method": "externalAgentConfig/import", "id": 64, "params": {
  "migrationItems": [
    {
      "itemType": "AGENTS_MD",
      "description": "Import /Users/me/project/CLAUDE.md to /Users/me/project/AGENTS.md.",
      "cwd": "/Users/me/project"
    }
  ],
  "source": "claude-code"
} }
{ "id": 64, "result": { "importId": "8ae96ff3-3425-4f4c-8772-b6fd61502868" } }
```

可选的 top-level `source` import parameter 会标记产生所选 migration items 的产品。

server 会在 item types 完成时发出 `externalAgentConfig/import/progress`，并在所有 synchronous 和 background imports 完成后发出 `externalAgentConfig/import/completed`。这些 notifications 包含 response 中相同的 `importId`，以及带 per-type `successes` 和 `failures` 的 `itemTypeResults`。Completion 可能在 response 之后立即到达，也可能在后台 remote imports 完成后到达。

```json
{ "method": "externalAgentConfig/import/progress", "params": {
  "importId": "8ae96ff3-3425-4f4c-8772-b6fd61502868",
  "itemTypeResults": [
    {
      "itemType": "AGENTS_MD",
      "successes": [
        { "itemType": "AGENTS_MD", "cwd": "/Users/me/project", "source": null, "target": "/Users/me/project/AGENTS.md" }
      ],
      "failures": []
    }
  ]
} }
{ "method": "externalAgentConfig/import/completed", "params": {
  "importId": "8ae96ff3-3425-4f4c-8772-b6fd61502868",
  "itemTypeResults": [
    {
      "itemType": "AGENTS_MD",
      "successes": [
        { "itemType": "AGENTS_MD", "cwd": "/Users/me/project", "source": null, "target": "/Users/me/project/AGENTS.md" }
      ],
      "failures": []
    }
  ]
} }
```

读取之前已完成的 imports：

```json
{ "method": "externalAgentConfig/import/readHistories", "id": 65 }
{ "id": 65, "result": { "data": [
  {
    "importId": "8ae96ff3-3425-4f4c-8772-b6fd61502868",
    "completedAtMs": 1781784000000,
    "successes": [
      { "itemType": "AGENTS_MD", "cwd": "/Users/me/project", "source": null, "target": "/Users/me/project/AGENTS.md" }
    ],
    "failures": []
  }
] } }
```

支持的 `itemType` values 为 `AGENTS_MD`、`CONFIG`、`SKILLS`、`PLUGINS`、`MCP_SERVER_CONFIG`、`SUBAGENTS`、`HOOKS`、`COMMANDS` 和 `SESSIONS`。对于 `PLUGINS` items，`details.plugins` 会列出每个 `marketplaceName` 和 Codex 可以尝试迁移的 `pluginNames`。Detection 只返回仍有工作要做的 items。例如，当 `AGENTS.md` 已存在且非空时，Codex 会跳过 AGENTS migration；skill imports 不会覆盖现有 skill directories。

当从 `.claude/settings.json` 检测 plugins 时，Codex 会从 `extraKnownMarketplaces` 读取已配置 marketplace sources。如果 `enabledPlugins` 包含来自 `claude-plugins-official` 的 plugins，但缺少 marketplace source，Codex 会推断 `anthropics/claude-plugins-official` 为 source。

## Auth endpoints

JSON-RPC auth/account surface 暴露 request/response methods，以及 server-initiated notifications（无 `id`）。使用这些来确定 auth state、启动或取消登录、logout、检查 ChatGPT rate limits，并在 credits 耗尽或达到 usage limits 时通知 workspace owners。

### Authentication modes

Codex 支持这些 authentication modes。`account/updated.authMode` 会显示 active mode，并在可用时包含当前 ChatGPT `planType`。`account/read` 也会报告 account 和 plan details。

- **API key (`apikey`)** - caller 使用带 `type: "apiKey"` 的 OpenAI API key，Codex 会保存它用于 API requests。
- **ChatGPT managed (`chatgpt`)** - Codex 拥有 ChatGPT OAuth flow，持久化 tokens 并自动刷新。浏览器流程从 `type: "chatgpt"` 开始，device-code flow 从 `type: "chatgptDeviceCode"` 开始。
- **ChatGPT external tokens (`chatgptAuthTokens`)** - experimental，适用于已由 host apps 拥有用户 ChatGPT auth lifecycle 的场景。host app 会直接提供 `accessToken`、`chatgptAccountId` 和可选 `chatgptPlanType`，并且必须在被要求时刷新 token。
- **Amazon Bedrock** - `account/read` 会把 Bedrock accounts 报告为 `type: "amazonBedrock"`，并指明凭据来自 Codex-managed Bedrock API key（`credentialSource: "codexManaged"`）还是外部 AWS credential chain（`credentialSource: "awsManaged"`）。对于 Codex-managed Bedrock API keys，`account/updated.authMode` 使用 `bedrockApiKey`。

### API overview

- `account/read` - 获取当前 account info；可选择刷新 tokens。
- `account/login/start` - 开始登录（`apiKey`、`chatgpt`、`chatgptDeviceCode`，或 experimental `chatgptAuthTokens`）。
- `account/login/completed` (notify) - 登录尝试完成时发出（success 或 error）。
- `account/login/cancel` - 按 `loginId` 取消 pending managed ChatGPT login。
- `account/logout` - 登出；触发 `account/updated`。
- `account/updated` (notify) - 每当 auth mode 改变时发出（`authMode`：`apikey`、`chatgpt`、`chatgptAuthTokens`、`agentIdentity`、`personalAccessToken`、`bedrockApiKey` 或 `null`），并在可用时包含 `planType`。
- `account/chatgptAuthTokens/refresh` (server request) - 在 authorization error 后请求新的 externally managed ChatGPT tokens。
- `account/rateLimits/read` - 获取 ChatGPT rate limits。
- `account/rateLimits/updated` (notify) - 每当用户的 ChatGPT rate limits 改变时发出。
- `account/sendAddCreditsNudgeEmail` - 请求 ChatGPT 在 credits 耗尽或达到 usage limit 时向 workspace owner 发送电子邮件。
- `account/rateLimitResetCredit/consume` - 使用 caller 提供的 `idempotencyKey` value 消耗一个 earned rate-limit reset。
- `account/usage/read` - 获取 ChatGPT account token-activity summaries 和 daily buckets。
- `mcpServer/oauthLogin/completed` (notify) - 在 `mcpServer/oauth/login` flow 完成后发出；payload 包含 `{ name, success, error? }`。
- `mcpServer/startupStatus/updated` (notify) - 当 loaded thread 的已配置 MCP server startup status 改变时发出；payload 包含 `{ name, status, error }`。

### 1) 检查 auth state

Request：

```json
{ "method": "account/read", "id": 1, "params": { "refreshToken": false } }
```

Response 示例：

```json
{ "id": 1, "result": { "account": null, "requiresOpenaiAuth": false } }
```

```json
{ "id": 1, "result": { "account": null, "requiresOpenaiAuth": true } }
```

```json
{
  "id": 1,
  "result": { "account": { "type": "apiKey" }, "requiresOpenaiAuth": true }
}
```

```json
{
  "id": 1,
  "result": {
    "account": {
      "type": "amazonBedrock",
      "credentialSource": "codexManaged"
    },
    "requiresOpenaiAuth": false
  }
}
```

```json
{
  "id": 1,
  "result": {
    "account": {
      "type": "amazonBedrock",
      "credentialSource": "awsManaged"
    },
    "requiresOpenaiAuth": false
  }
}
```

```json
{
  "id": 1,
  "result": {
    "account": {
      "type": "chatgpt",
      "email": "user@example.com",
      "planType": "pro"
    },
    "requiresOpenaiAuth": true
  }
}
```

Field notes：

- `refreshToken`（boolean）：设置为 `true` 可在 managed ChatGPT mode 中强制刷新 token。在 external token mode（`chatgptAuthTokens`）中，app-server 会忽略此 flag。
- `requiresOpenaiAuth` 反映 active provider；当为 `false` 时，Codex 可以在没有 OpenAI credentials 的情况下运行。
- Amazon Bedrock 在使用 Codex 管理的 Bedrock API key 时报告 `credentialSource: "codexManaged"`。对于 external AWS credential path，则报告 `credentialSource: "awsManaged"`。这会标识所选 credential source；它不会验证 AWS credential chain 是否可以解析 credentials。

### 2) 使用 API key 登录

1. 发送：

   ```json
   {
     "method": "account/login/start",
     "id": 2,
     "params": { "type": "apiKey", "apiKey": "sk-..." }
   }
   ```

2. 预期：

   ```json
   { "id": 2, "result": { "type": "apiKey" } }
   ```

3. Notifications：

   ```json
   {
     "method": "account/login/completed",
     "params": { "loginId": null, "success": true, "error": null }
   }
   ```

   ```json
   {
     "method": "account/updated",
     "params": { "authMode": "apikey", "planType": null }
   }
   ```

### 3) 使用 ChatGPT 登录（browser flow）

1. 启动：

   ```json
   { "method": "account/login/start", "id": 3, "params": { "type": "chatgpt" } }
   ```

   ```json
   {
     "id": 3,
     "result": {
       "type": "chatgpt",
       "loginId": "<uuid>",
       "authUrl": "https://chatgpt.com/...&redirect_uri=http%3A%2F%2Flocalhost%3A<port>%2Fauth%2Fcallback"
     }
   }
   ```

2. 在浏览器中打开 `authUrl`；app-server 会托管本地 callback。
3. 等待 notifications：

   ```json
   {
     "method": "account/login/completed",
     "params": { "loginId": "<uuid>", "success": true, "error": null }
   }
   ```

   ```json
   {
     "method": "account/updated",
     "params": { "authMode": "chatgpt", "planType": "plus" }
   }
   ```

### 3b) 使用 ChatGPT 登录（device-code flow）

当你的 client 拥有登录仪式，或浏览器 callback 不稳定时，请使用此 flow。

1. 启动：

   ```json
   {
     "method": "account/login/start",
     "id": 4,
     "params": { "type": "chatgptDeviceCode" }
   }
   ```

   ```json
   {
     "id": 4,
     "result": {
       "type": "chatgptDeviceCode",
       "loginId": "<uuid>",
       "verificationUrl": "https://auth.openai.com/codex/device",
       "userCode": "ABCD-1234"
     }
   }
   ```

2. 向用户展示 `verificationUrl` 和 `userCode`；frontend 拥有该 UX。
3. 等待 notifications：

   ```json
   {
     "method": "account/login/completed",
     "params": { "loginId": "<uuid>", "success": true, "error": null }
   }
   ```

   ```json
   {
     "method": "account/updated",
     "params": { "authMode": "chatgpt", "planType": "plus" }
   }
   ```

### 3c) 使用 externally managed ChatGPT tokens（`chatgptAuthTokens`）登录

只有当 host application 拥有用户的 ChatGPT auth lifecycle 并直接提供 tokens 时，才使用此 experimental mode。Clients 在使用此 login type 之前，必须在 `initialize` 期间设置 `capabilities.experimentalApi = true`。

1. 发送：

   ```json
   {
     "method": "account/login/start",
     "id": 7,
     "params": {
       "type": "chatgptAuthTokens",
       "accessToken": "<jwt>",
       "chatgptAccountId": "org-123",
       "chatgptPlanType": "business"
     }
   }
   ```

2. 预期：

   ```json
   { "id": 7, "result": { "type": "chatgptAuthTokens" } }
   ```

3. Notifications：

   ```json
   {
     "method": "account/login/completed",
     "params": { "loginId": null, "success": true, "error": null }
   }
   ```

   ```json
   {
     "method": "account/updated",
     "params": { "authMode": "chatgptAuthTokens", "planType": "business" }
   }
   ```

当 server 收到 `401 Unauthorized` 时，它可能会向 host app 请求 refreshed tokens：

```json
{
  "method": "account/chatgptAuthTokens/refresh",
  "id": 8,
  "params": { "reason": "unauthorized", "previousAccountId": "org-123" }
}
{ "id": 8, "result": { "accessToken": "<jwt>", "chatgptAccountId": "org-123", "chatgptPlanType": "business" } }
```

server 会在成功刷新 response 后重试原始 request。Requests 会在约 10 秒后 timeout。

### 4) 取消 ChatGPT 登录

```json
{ "method": "account/login/cancel", "id": 4, "params": { "loginId": "<uuid>" } }
{ "method": "account/login/completed", "params": { "loginId": "<uuid>", "success": false, "error": "..." } }
```

### 5) Logout

```json
{ "method": "account/logout", "id": 5 }
{ "id": 5, "result": {} }
{ "method": "account/updated", "params": { "authMode": null, "planType": null } }
```

### 6) Rate limits（ChatGPT）

```json
{ "method": "account/rateLimits/read", "id": 6 }
{ "id": 6, "result": {
  "rateLimits": {
    "limitId": "codex",
    "limitName": null,
    "primary": { "usedPercent": 25, "windowDurationMins": 15, "resetsAt": 1730947200 },
    "secondary": null,
    "rateLimitReachedType": null
  },
  "rateLimitsByLimitId": {
    "codex": {
      "limitId": "codex",
      "limitName": null,
      "primary": { "usedPercent": 25, "windowDurationMins": 15, "resetsAt": 1730947200 },
      "secondary": null,
      "rateLimitReachedType": null
    },
    "codex_other": {
      "limitId": "codex_other",
      "limitName": "codex_other",
      "primary": { "usedPercent": 42, "windowDurationMins": 60, "resetsAt": 1730950800 },
      "secondary": null,
      "rateLimitReachedType": null
    }
  },
  "rateLimitResetCredits": { "availableCount": 2 }
} }
{ "method": "account/rateLimits/updated", "params": {
  "rateLimits": {
    "limitId": "codex",
    "primary": { "usedPercent": 31, "windowDurationMins": 15, "resetsAt": 1730948100 }
  }
} }
```

Field notes：

- `rateLimits` 是向后兼容的 single-bucket view。
- `rateLimitsByLimitId`（存在时）是按 metered `limit_id`（例如 `codex`）作为 key 的 multi-bucket view。
- `limitId` 是 metered bucket identifier。
- `limitName` 是 bucket 的可选 user-facing label。
- `usedPercent` 是 quota window 内的当前用量。
- `windowDurationMins` 是 quota window length。
- `resetsAt` 是下一次 reset 的 Unix timestamp（seconds）。
- 当 server 返回与 bucket 关联的 ChatGPT plan 时，会包含 `planType`。
- 当 server 返回剩余 workspace credit details 时，会包含 `credits`。
- `rateLimitReachedType` 标识达到某个限制时 server 分类的 limit state。
- 当 service 提供时，`rateLimitResetCredits` 包含可用 earned-reset count。消耗 reset 后，请获取 `account/rateLimits/read`。

### 7) Token usage（ChatGPT）

使用 `account/usage/read` 获取 ChatGPT token-activity summary fields 和可选 daily buckets。

```json
{ "method": "account/usage/read", "id": 7 }
{ "id": 7, "result": {
  "summary": {
    "lifetimeTokens": 1234567,
    "peakDailyTokens": 45678,
    "longestRunningTurnSec": 540,
    "currentStreakDays": 8,
    "longestStreakDays": 14
  },
  "dailyUsageBuckets": [
    { "startDate": "2026-06-18", "tokens": 12345 }
  ]
} }
```

Field notes：

- 当 service 未返回该 metric 时，`summary` values 可能为 `null`。
- `dailyUsageBuckets` 可能为 `null`；存在时，每个 bucket 包含 `startDate` 和 `tokens`。
- 该 endpoint 需要由 Codex services 支持的认证。ChatGPT、external ChatGPT tokens、agent identity 和 personal access token auth 可用；API-key-only 和 Bedrock auth 不可用。

### 8) Earned rate-limit resets（ChatGPT）

使用 `account/rateLimitResetCredit/consume` 消耗一个 earned reset。

```json
{ "method": "account/rateLimitResetCredit/consume", "id": 8, "params": { "idempotencyKey": "8ae96ff3-3425-4f4c-8772-b6fd61502868" } }
{ "id": 8, "result": { "outcome": "reset" } }
```

Field notes：

- `idempotencyKey` 必须非空。为每次逻辑 redemption attempt 使用一个 UUID，并在重试该 attempt 时复用同一值。
- `reset` 表示已消耗一个 credit。
- `alreadyRedeemed` 表示同一次 redemption 之前已完成。把它视为 idempotent success，并刷新 account limits。
- `nothingToReset` 表示没有符合条件的 rate-limit window 可以 reset。
- `noCredit` 表示 account 没有可用 earned reset credits。
- 消耗 reset 后，请获取 `account/rateLimits/read`，而不是从此 response 推断 updated windows。

### 9) 通知 workspace owner 有关限制

当 credits 耗尽或达到 usage limit 时，使用 `account/sendAddCreditsNudgeEmail` 请求 ChatGPT 向 workspace owner 发送电子邮件。

```json
{ "method": "account/sendAddCreditsNudgeEmail", "id": 9, "params": { "creditType": "credits" } }
{ "id": 9, "result": { "status": "sent" } }
```

当 workspace credits 耗尽时使用 `creditType: "credits"`，当达到 workspace usage limit 时使用 `creditType: "usage_limit"`。如果 owner 最近已收到通知，response status 为 `cooldown_active`。
