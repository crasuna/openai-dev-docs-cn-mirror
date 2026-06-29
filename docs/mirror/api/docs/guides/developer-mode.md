---
title: "ChatGPT Developer mode 开发者模式"
description: "Full MCP client access for apps and tools."
outline: deep
---

# ChatGPT Developer mode 开发者模式

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/developer-mode](https://developers.openai.com/api/docs/guides/developer-mode)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/developer-mode.md](https://developers.openai.com/api/docs/guides/developer-mode.md)
- 抓取时间：2026-06-27T05:54:01.361Z
- Checksum：`a98ecfdcaaaa5e731ae399b705aa26897e8627b6ec90932390c543be7232d74c`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre

  &lt;a
    href="https://help.openai.com/en/articles/20001062"
    class="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold leading-none uppercase tracking-[0.02em] no-underline transition-colors hover:opacity-90"
    style="background-color: var(--color-background-warning-soft); color: var(--color-text-warning-outline); border-color: var(--color-border-warning-outline);"
  &gt;
    &lt;span
      aria-hidden="true"
      class="h-4 w-4 shrink-0 bg-current"
      style="-webkit-mask: url('/images/codex/exclamation-shield.svg') no-repeat center / contain; mask: url('/images/codex/exclamation-shield.svg') no-repeat center / contain;"
    &gt;&lt;/span&gt;
    风险升高



## 什么是 ChatGPT developer mode

ChatGPT developer mode 为所有 tools 提供完整的 Model Context Protocol (MCP) client 支持，包括读取和写入。它功能强大但也很危险，面向理解如何安全配置和测试 apps 的开发者。使用 developer mode 时，请留意 [prompt injections and other risks](/mirror/api/docs/mcp)、可能破坏数据的写入 action 上的模型错误，以及试图窃取信息的恶意 MCP。

## 如何使用

- **资格：** 在网页版中面向 Pro、Plus、Business、Enterprise 和 Education 账户开放。
- **启用 developer mode：** 前往 [**Settings → Apps**](https://chatgpt.com/#settings/Connectors) → [**Advanced settings → Developer mode**](https://chatgpt.com/#settings/Connectors/Advanced)。
- **从 MCPs 创建 Apps：**
  - 打开 [ChatGPT Apps settings](https://chatgpt.com/#settings/Connectors)。
  - 点击 **Advanced settings** 旁边的 “Create app”，并为你的远程 MCP server 创建一个 app。之后在对话中，它会出现在 composer 的 “Developer Mode” tool 中。只有当你处于 Developer mode 时，“Create app” 按钮才会显示。
    - 支持的 MCP 协议：SSE 和 streaming HTTP。
    - 支持的身份验证：OAuth、No Authentication 和 Mixed Authentication
      - 对于 OAuth，如果提供了静态凭据，则会使用这些凭据。否则，当 authorization server 宣告支持且 connector creator 选择 CIMD 时，ChatGPT 可以使用 Client ID Metadata Documents。CIMD 支持 public-client token exchange (`none`) 和 signed client assertion token exchange (`private_key_jwt`)。在配置后，ChatGPT 也可以使用 DCR。
      - Mixed authentication 支持 OAuth 和 No Authentication。这意味着 initialize 和 list tools API 不使用 auth，而 tools 会根据其 tool metadata 上设置的 security schemes 使用 OAuth 或不使用 auth。
  - 已创建的 apps 会显示在 app settings 的 “Drafts” 下。
- **管理 tools：** 在 app settings 中，每个 app 都有一个详情页。使用该页面打开或关闭 tools，并刷新 apps 以从 MCP server 拉取新的 tools、descriptions 和 server instructions。
- **在对话中使用 apps：** 从 Plus 菜单选择 **Developer mode**，并为对话选择 apps。你可能需要尝试不同的提示技巧来调用正确的 tools。例如：
  - 明确说明："Use the \"Acme CRM\" app's \"update_record\" tool to …"。必要时，包含 server label 和 tool name。
  - 禁止替代选项以避免歧义："Do not use built-in browsing or other tools; only use the Acme CRM connector."
  - 消除相似 tools 的歧义："Prefer `Calendar.create_event` for meetings; do not use `Reminders.create_task` for scheduling."
  - 指定输入形状和调用顺序："First call `Repo.read_file` with `{ path: "…" }`. Then call `Repo.write_file` with the modified content. Do not call other tools."
  - 如果多个 apps 存在重叠，请预先声明偏好（例如："Use `CompanyDB` for authoritative data; use other sources only if `CompanyDB` returns no results"）。
  - Developer mode 不要求必须有 `search`/`fetch` tools。你的 connector 暴露的任何 tools（包括写入 actions）都可以使用，具体受 confirmation settings 约束。
  - 更多指导请参阅 [Using tools](/mirror/api/docs/guides/tools) 和 [Prompting](/mirror/api/docs/guides/prompting)。
  - 用更好的 tool descriptions 改进 tool selection：在你的 MCP server 中，编写以 action 为导向的 tool names 和 descriptions，其中包含 “Use this when…” 指引，说明不适用场景/边缘情况，并添加参数描述（以及 enums），帮助模型在相似 tools 中选择正确工具，并在不合适时避免使用内置 tools。
  - 添加用于跨 tool 指引的 server instructions：使用 MCP [`instructions` field](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#initialization) 提供 server-wide guidance，例如必需的 tool sequence、共享 rate limits，或 tools 之间的关系。请让前 512 个字符自成一体。

  示例：

```
  Schedule a 30‑minute meeting tomorrow at 3pm PT with
  alice@example.com and bob@example.com using "Calendar.create_event".
  Do not use any other scheduling tools.
```

```
  Create a pull request using "GitHub.open_pull_request" from branch
  "feat-retry" into "main" with title "Add retry logic" and body "…".
  Do not push directly to main.
```

- **审阅并确认 tool calls：**
  - 检查 JSON tool payloads，验证正确性并调试问题。对于每个 tool call，你可以使用小箭头展开和折叠 tool call details。tool input 和 output 的完整 JSON 内容都可查看。
  - 写入 actions 默认需要确认。请仔细审阅即将发送给写入 action 的 tool input，确保行为符合预期。错误的写入 actions 可能会无意中破坏、修改或共享数据！
  - 只读检测：我们遵循 `readOnlyHint` tool annotation（参见 [MCP tool annotations](https://modelcontextprotocol.io/legacy/concepts/tools#available-tool-annotations)）。没有此 hint 的 tools 会被视为写入 actions。
  - 你可以选择记住某个 tool 在一次对话中的 approve 或 deny 决定，这意味着该选择会应用于该对话的剩余部分。因此，只有在你了解并信任底层应用能够在没有你批准的情况下继续执行后续写入 actions 时，才应允许某个 tool 记住 approve 选择。新的对话会再次请求确认。刷新同一对话后，后续轮次也会再次请求确认。

:::

## English source

::: details 展开英文原文
::: v-pre

  &lt;a
    href="https://help.openai.com/en/articles/20001062"
    class="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold leading-none uppercase tracking-[0.02em] no-underline transition-colors hover:opacity-90"
    style="background-color: var(--color-background-warning-soft); color: var(--color-text-warning-outline); border-color: var(--color-border-warning-outline);"
  &gt;
    &lt;span
      aria-hidden="true"
      class="h-4 w-4 shrink-0 bg-current"
      style="-webkit-mask: url('/images/codex/exclamation-shield.svg') no-repeat center / contain; mask: url('/images/codex/exclamation-shield.svg') no-repeat center / contain;"
    &gt;&lt;/span&gt;
    Elevated risk



## What is ChatGPT developer mode

ChatGPT developer mode provides full Model Context Protocol (MCP) client support for all tools, both read and write. It's powerful but dangerous, and is intended for developers who understand how to safely configure and test apps. When using developer mode, watch for [prompt injections and other risks](/mirror/api/docs/mcp), model mistakes on write actions that could destroy data, and malicious MCPs that attempt to steal information.

## How to use

- **Eligibility:** Available to Pro, Plus, Business, Enterprise, and Education accounts on the web.
- **Enable developer mode:** Go to [**Settings → Apps**](https://chatgpt.com/#settings/Connectors) → [**Advanced settings → Developer mode**](https://chatgpt.com/#settings/Connectors/Advanced).
- **Create Apps from MCPs:**
  - Open [ChatGPT Apps settings](https://chatgpt.com/#settings/Connectors).
  - Click on "Create app" next to **Advanced settings** and create an app for your remote MCP server. It will appear in the composer's "Developer Mode" tool later during conversations. The "Create app" button will only show if you are in Developer mode.
    - Supported MCP protocols: SSE and streaming HTTP.
    - Authentication supported: OAuth, No Authentication, and Mixed Authentication
      - For OAuth, if static credentials are provided, then they will be used. Otherwise, ChatGPT can use Client ID Metadata Documents when the authorization server advertises support and the connector creator chooses CIMD. CIMD supports public-client token exchange (`none`) and signed client assertion token exchange (`private_key_jwt`). ChatGPT can also use DCR when configured.
      - Mixed authentication supports OAuth and No Authentication. This means the initialize and list tools APIs use no auth, and tools use OAuth or no auth based on the security schemes set on their tool metadata.
  - Created apps will show under "Drafts" in the app settings.
- **Manage tools:** In app settings there is a details page per app. Use that to toggle tools on or off and refresh apps to pull new tools, descriptions, and server instructions from the MCP server.
- **Use apps in conversations:** Choose **Developer mode** from the Plus menu and select the apps for the conversation. You may need to explore different prompting techniques to call the correct tools. For example:
  - Be explicit: "Use the \"Acme CRM\" app's \"update_record\" tool to …". When needed, include the server label and tool name.
  - Disallow alternatives to avoid ambiguity: "Do not use built-in browsing or other tools; only use the Acme CRM connector."
  - Disambiguate similar tools: "Prefer `Calendar.create_event` for meetings; do not use `Reminders.create_task` for scheduling."
  - Specify input shape and sequencing: "First call `Repo.read_file` with `{ path: "…" }`. Then call `Repo.write_file` with the modified content. Do not call other tools."
  - If multiple apps overlap, state preferences up front (e.g., "Use `CompanyDB` for authoritative data; use other sources only if `CompanyDB` returns no results").
  - Developer mode does not require `search`/`fetch` tools. Any tools your connector exposes (including write actions) are available, subject to confirmation settings.
  - See more guidance in [Using tools](/mirror/api/docs/guides/tools) and [Prompting](/mirror/api/docs/guides/prompting).
  - Improve tool selection with better tool descriptions: In your MCP server, write action-oriented tool names and descriptions that include "Use this when…" guidance, note disallowed/edge cases, and add parameter descriptions (and enums) to help the model choose the right tool among similar ones and avoid built-in tools when inappropriate.
  - Add server instructions for cross-tool guidance: Use the MCP [`instructions` field](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#initialization) for server-wide guidance such as required tool sequences, shared rate limits, or relationships between tools. Keep the first 512 characters self-contained.

  Examples:

```
  Schedule a 30‑minute meeting tomorrow at 3pm PT with
  alice@example.com and bob@example.com using "Calendar.create_event".
  Do not use any other scheduling tools.
```

```
  Create a pull request using "GitHub.open_pull_request" from branch
  "feat-retry" into "main" with title "Add retry logic" and body "…".
  Do not push directly to main.
```

- **Reviewing and confirming tool calls:**
  - Inspect JSON tool payloads verify correctness and debug problems. For each tool call, you can use the carat to expand and collapse the tool call details. Full JSON contents of the tool input and output are available.
  - Write actions by default require confirmation. Carefully review the tool input which will be sent to a write action to ensure the behavior is as desired. Incorrect write actions can inadvertently destroy, alter, or share data!
  - Read-only detection: We respect the `readOnlyHint` tool annotation (see [MCP tool annotations](https://modelcontextprotocol.io/legacy/concepts/tools#available-tool-annotations)). Tools without this hint are treated as write actions.
  - You can choose to remember the approve or deny choice for a given tool for a conversation, which means it will apply that choice for the rest of that conversation. Because of this, you should only allow a tool to remember the approve choice if you know and trust the underlying application to make further write actions without your approval. New conversations will prompt for confirmation again. Refreshing the same conversation will also prompt for confirmation again on subsequent turns.

:::
:::

