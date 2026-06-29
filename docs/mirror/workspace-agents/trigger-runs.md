---
title: "触发 Workspace Agent 运行"
description: "Kick off ChatGPT workspace agents from backend systems or automations."
outline: deep
---

# 触发 Workspace Agent 运行

**文档集**：工作区智能体\
**分组**：触发运行\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/workspace-agents/trigger-runs](https://developers.openai.com/workspace-agents/trigger-runs)
- Markdown 来源：[https://developers.openai.com/workspace-agents/trigger-runs.md](https://developers.openai.com/workspace-agents/trigger-runs.md)
- 抓取时间：2026-06-27T05:55:13.821Z
- Checksum：`81b6ee5ca44278ed7a8fd0a3bd08e312e85eec8e4747822e56fb783d661d03a7`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用 Workspace Agents API 通过 API 以编程方式触发已发布的 ChatGPT workspace agent。

此 endpoint 旨在集成到这样的 workflows：外部系统需要在 ChatGPT UI 以及已提供的第三方 triggers 之外触发 agent。

## Endpoint（端点）

```text
POST https://api.chatgpt.com/v1/workspace_agents/{id}/trigger
```

`id` 是已发布 API channel 的稳定 public API trigger identifier，格式为 `agtch_XXX`。

## Authentication（认证）

使用 Workspace Agent access token 进行认证：

```bash
Authorization: Bearer $AGENT_ACCESS_TOKEN
```

如何配置 token，请参阅[使用 Workspace Agent access tokens 进行认证](/mirror/workspace-agents/authentication)。

## Request body（请求体）

```json
{
  "conversation_key": "email_thread_abc",
  "input": "Summarize the customer escalation and recommend a response."
}
```

### Fields（字段）

| 字段               | 类型   | 是否必填 | 说明 |
| ------------------ | ------ | -------- | ----------- |
| `input`            | string | 是 | 作为 trigger input 传给 agent 的消息文本。 |
| `conversation_key` | string | 否 | 调用方定义的稳定标识符，用于跨多个 trigger events 延续同一个 agent conversation。 |

为了安全重试同一个 trigger event，请发送可选的 `Idempotency-Key` header。只有在重试同一 event 时才复用同一个 key。对同一 API trigger 使用相同 idempotency key 的请求会返回原始 accepted outcome，而不是排入第二个 trigger event。

## Response（响应）

API 会持久地将 trigger event 排入队列，并返回无响应体的 `202 Accepted`。它不会返回 public run ID，并且当前无法通过 API 检索 agent response。检索 agent responses 的支持即将推出。

## Example（示例）

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

预期响应：

```text
HTTP/1.1 202 Accepted
```

## Errors（错误）

| 状态               | 返回时机 |
| ------------------ | ------------- |
| `401 Unauthorized` | bearer credential 缺失、已过期、已撤销或无效。 |
| `403 Forbidden`    | token 有效，但没有权限触发所请求的 workspace agent。 |
| `404 Not Found`    | `id` 不存在，或对调用方 workspace 不可见。 |
| `409 Conflict`     | 由于 channel 或 agent 不处于可运行状态，trigger 无法被接受。 |

:::

## English source

::: details 展开英文原文
::: v-pre
Use the Workspace Agents API to programmatically trigger a published ChatGPT
workspace agent through API.

This endpoint is designed to integrate with workflows where an external system
needs to trigger an agent outside of the ChatGPT UI and third party
triggers offered.

## Endpoint

```text
POST https://api.chatgpt.com/v1/workspace_agents/{id}/trigger
```

`id` is the stable public API trigger identifier for the published API channel,
in a `agtch_XXX` format.

## Authentication

Authenticate with a Workspace Agent access token:

```bash
Authorization: Bearer $AGENT_ACCESS_TOKEN
```

See [Authenticate with Workspace Agent access tokens](/mirror/workspace-agents/authentication)
for how to provision a token.

## Request body

```json
{
  "conversation_key": "email_thread_abc",
  "input": "Summarize the customer escalation and recommend a response."
}
```

### Fields

| Field              | Type   | Required | Description                                                                                                 |
| ------------------ | ------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| `input`            | string | Yes      | Message text passed to the agent as trigger input.                                                          |
| `conversation_key` | string | No       | Caller-defined stable identifier for continuing the same agent conversation across multiple trigger events. |

To safely retry the same trigger event, send an optional `Idempotency-Key`
header. Reuse the same key only when retrying the same event. Requests to the
same API trigger with the same idempotency key return the original accepted
outcome instead of enqueueing a second trigger event.

## Response

The API durably queues the trigger event and returns `202 Accepted` with no
response body. It does not return a public run ID, and the agent response cannot
currently be retrieved through the API. Support for retrieving agent responses
is coming soon.

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

| Status             | When returned                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `401 Unauthorized` | The bearer credential is missing, expired, revoked, or invalid.                            |
| `403 Forbidden`    | The token is valid but does not have permission to trigger the requested workspace agent.  |
| `404 Not Found`    | The `id` does not exist or is not visible to the caller's workspace.                       |
| `409 Conflict`     | The trigger could not be accepted because the channel or agent is not in a runnable state. |

:::
:::

