# Authenticate with Workspace Agent access tokens

Workspace Agents API calls authenticate with Workspace Agent access tokens.
These tokens are provisioned from the ChatGPT admin access-token flow and are
scoped for workspace use.

## Provision a token

Before a user can create a Workspace Agent access token, a workspace admin must
enable Workspace agents and turn on **Allow users to create personal access
tokens** in Admin > Permissions & roles.

1. In ChatGPT, open Admin > Access tokens.
2. Create an access token and select the **Workspace Agents** scope.
3. Copy the token and store it in your secrets manager.

Use the token as a bearer credential on api.chatgpt.com:

```bash
curl https://api.chatgpt.com/v1/workspace_agents/agtch_complaints_123/trigger \
  -H "Authorization: Bearer $AGENT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input":"Summarize the newest escalation."}'
```

## What this token can access

Workspace Agent access tokens are scoped to Workspace Agents API operations
only.
