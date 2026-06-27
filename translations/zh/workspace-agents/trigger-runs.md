---
status: needs-review
sourceId: "81b6ee5ca442"
sourceChecksum: "81b6ee5ca44278ed7a8fd0a3bd08e312e85eec8e4747822e56fb783d661d03a7"
sourceUrl: "https://developers.openai.com/workspace-agents/trigger-runs"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# 触发 workspace agent runs

使用 Workspace Agents API 通过 API 以编程方式触发已发布的 ChatGPT workspace agent。

此 endpoint 旨在集成到这样的 workflows：外部系统需要在 ChatGPT UI 以及已提供的第三方 triggers 之外触发 agent。

## Endpoint

```text
POST https://api.chatgpt.com/v1/workspace_agents/{id}/trigger
```

`id` 是已发布 API channel 的稳定 public API trigger identifier，格式为 `agtch_XXX`。

## Authentication

使用 Workspace Agent access token 进行认证：

```bash
Authorization: Bearer $AGENT_ACCESS_TOKEN
```

如何配置 token，请参阅[使用 Workspace Agent access tokens 进行认证](https://developers.openai.com/workspace-agents/authentication)。

## Request body

```json
{
  "conversation_key": "email_thread_abc",
  "input": "Summarize the customer escalation and recommend a response."
}
```

### Fields

| Field              | Type   | Required | Description |
| ------------------ | ------ | -------- | ----------- |
| `input`            | string | Yes      | 作为 trigger input 传给 agent 的消息文本。 |
| `conversation_key` | string | No       | 调用方定义的稳定标识符，用于跨多个 trigger events 延续同一个 agent conversation。 |

为了安全重试同一个 trigger event，请发送可选的 `Idempotency-Key` header。只有在重试同一 event 时才复用同一个 key。对同一 API trigger 使用相同 idempotency key 的请求会返回原始 accepted outcome，而不是排入第二个 trigger event。

## Response

API 会持久地将 trigger event 排入队列，并返回无响应体的 `202 Accepted`。它不会返回 public run ID，并且当前无法通过 API 检索 agent response。检索 agent responses 的支持即将推出。

## Example

```bash
curl -i https://api.chatgpt.com/v1/workspace_agents/agtch_complaints_123/trigger \
  -X POST \
  -H "Authorization: Bearer $AGENT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_key": "email_thread_abc",
    "input": "Summarize the newest escalation and recommend next steps."
  }'
```

Expected response:

```text
HTTP/1.1 202 Accepted
```

## Errors

| Status             | When returned |
| ------------------ | ------------- |
| `401 Unauthorized` | bearer credential 缺失、已过期、已撤销或无效。 |
| `403 Forbidden`    | token 有效，但没有权限触发所请求的 workspace agent。 |
| `404 Not Found`    | `id` 不存在，或对调用方 workspace 不可见。 |
| `409 Conflict`     | 由于 channel 或 agent 不处于可运行状态，trigger 无法被接受。 |
