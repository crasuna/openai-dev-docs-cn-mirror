# Trigger workspace agent runs

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

See [Authenticate with Workspace Agent access tokens](https://developers.openai.com/workspace-agents/authentication)
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
