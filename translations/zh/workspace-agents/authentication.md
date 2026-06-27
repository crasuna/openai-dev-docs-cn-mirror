---
status: needs-review
sourceId: "fbb81b939706"
sourceChecksum: "fbb81b9397061d0e2ddb54d3b884ef5522179af0598fe202b9d8c381d8d47cd5"
sourceUrl: "https://developers.openai.com/workspace-agents/authentication"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# 使用 Workspace Agent access tokens 进行认证

Workspace Agents API 调用使用 Workspace Agent access tokens 进行认证。这些 tokens 通过 ChatGPT admin access-token flow 配置，并限定 scope 为 workspace 使用。

## 配置 token

在用户可以创建 Workspace Agent access token 之前，workspace admin 必须启用 Workspace agents，并在 Admin > Permissions & roles 中打开 **Allow users to create personal access tokens**。

1. 在 ChatGPT 中，打开 Admin > Access tokens。
2. 创建 access token，并选择 **Workspace Agents** scope。
3. 复制 token，并将其存储在你的 secrets manager 中。

在 api.chatgpt.com 上将该 token 用作 bearer credential：

```bash
curl https://api.chatgpt.com/v1/workspace_agents/agtch_complaints_123/trigger \
  -H "Authorization: Bearer $AGENT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input":"Summarize the newest escalation."}'
```

## 此 token 可以访问什么

Workspace Agent access tokens 的 scope 仅限 Workspace Agents API operations。
