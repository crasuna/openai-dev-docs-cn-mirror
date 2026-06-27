---
title: "Authenticate with Workspace Agent access tokens"
description: "Provision and use bearer credentials for the Workspace Agents API."
outline: deep
---

# Authenticate with Workspace Agent access tokens

**文档集**：Workspace Agents  
**分组**：Workspace Agents — Authentication  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/workspace-agents/authentication](https://developers.openai.com/workspace-agents/authentication)
- Markdown 来源：[https://developers.openai.com/workspace-agents/authentication.md](https://developers.openai.com/workspace-agents/authentication.md)
- 抓取时间：2026-06-27T05:55:13.698Z
- Checksum：`fbb81b9397061d0e2ddb54d3b884ef5522179af0598fe202b9d8c381d8d47cd5`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Workspace Agents API 调用使用 Workspace Agent access tokens 进行认证。这些 tokens 通过 ChatGPT admin access-token flow 配置，并限定 scope 为 workspace 使用。

## 配置 token

在用户可以创建 Workspace Agent access token 之前，workspace admin 必须启用 Workspace agents，并在 Admin &gt; Permissions & roles 中打开 **Allow users to create personal access tokens**。

1. 在 ChatGPT 中，打开 Admin &gt; Access tokens。
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

:::

## English source

::: details 展开英文原文
::: v-pre
Workspace Agents API calls authenticate with Workspace Agent access tokens.
These tokens are provisioned from the ChatGPT admin access-token flow and are
scoped for workspace use.

## Provision a token

Before a user can create a Workspace Agent access token, a workspace admin must
enable Workspace agents and turn on **Allow users to create personal access
tokens** in Admin &gt; Permissions & roles.

1. In ChatGPT, open Admin &gt; Access tokens.
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

:::
:::

