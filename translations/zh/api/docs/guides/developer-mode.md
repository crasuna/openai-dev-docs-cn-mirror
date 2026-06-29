---
status: needs-review
sourceId: "a98ecfdcaaaa"
sourceChecksum: "a98ecfdcaaaa5e731ae399b705aa26897e8627b6ec90932390c543be7232d74c"
sourceUrl: "https://developers.openai.com/api/docs/guides/developer-mode"
translatedAt: "2026-06-27T08:52:13.975Z"
translator: codex-gpt-5.5-xhigh
---

# ChatGPT Developer mode 开发者模式

<div class="not-prose mt-2 mb-6">
  <a
    href="https://help.openai.com/en/articles/20001062"
    class="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold leading-none uppercase tracking-[0.02em] no-underline transition-colors hover:opacity-90"
    style="background-color: var(--color-background-warning-soft); color: var(--color-text-warning-outline); border-color: var(--color-border-warning-outline);"
  >
    <span
      aria-hidden="true"
      class="h-4 w-4 shrink-0 bg-current"
      style="-webkit-mask: url('/images/codex/exclamation-shield.svg') no-repeat center / contain; mask: url('/images/codex/exclamation-shield.svg') no-repeat center / contain;"
    ></span>
    风险升高
  </a>
</div>

## 什么是 ChatGPT developer mode

ChatGPT developer mode 为所有 tools 提供完整的 Model Context Protocol (MCP) client 支持，包括读取和写入。它功能强大但也很危险，面向理解如何安全配置和测试 apps 的开发者。使用 developer mode 时，请留意 [prompt injections and other risks](https://developers.openai.com/api/docs/mcp)、可能破坏数据的写入 action 上的模型错误，以及试图窃取信息的恶意 MCP。

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
  - 更多指导请参阅 [Using tools](https://developers.openai.com/api/docs/guides/tools) 和 [Prompting](https://developers.openai.com/api/docs/guides/prompting)。
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
