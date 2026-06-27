---
status: needs-review
sourceId: "ffb13d7e73d4"
sourceChecksum: "ffb13d7e73d464b9743557192ad1fcdef0ba308235c4fd76f99cfd75147b9cb0"
sourceUrl: "https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# ChatGPT 中的 MCP Apps 兼容性

## Overview

ChatGPT 支持用于嵌入式 app UI 的 [**MCP Apps**](https://modelcontextprotocol.io/docs/extensions/apps) 开放标准。

MCP Apps UI 在 iframe 内运行，并通过标准 bridge（基于 `postMessage` 的 `ui/*` JSON-RPC）与 host 通信。ChatGPT 实现了相同的 iframe-and-bridge 模型，因此你可以构建一次 UI，并在 ChatGPT 以及其他兼容 MCP Apps 的 hosts 中运行。

现有 Apps SDK APIs 仍然受支持，新的实验性能力会先在 Apps SDK 中发布。OpenAI 基于 ChatGPT Apps 的经验帮助塑造了 MCP Apps 标准；新的能力会在形态和功能验证后进入 MCP spec。

默认请使用 MCP Apps 标准 keys 和 bridge 进行构建。只有在需要 ChatGPT-specific capabilities 时才使用 `window.openai`。

## Recommended approach

对于新的 apps（以及现有 apps 中的新 UI surfaces），请从 MCP Apps 标准开始：

1. **声明你的 UI**，使用 `_meta.ui.resourceUri`。
2. **使用标准 host bridge**（基于 `postMessage` 的 `ui/*` JSON-RPC）进行初始化、notifications 和 host interaction。

可选：

3. 只有当你需要 shared spec 未覆盖的能力时，才通过 `window.openai` **叠加 ChatGPT extensions**。

### MCP Apps host bridge (`ui/*`)

MCP Apps 定义了标准 iframe bridge：

- **Transport:** 基于 `window.postMessage` 的 JSON-RPC 2.0 messages
- **Namespace:** 用于 UIs ↔ host interaction 的 `ui/*` methods 和 notifications
- **Tool calls:** 使用 MCP tool surface（例如 `tools/call`），而不是 host-specific UI globals

## 这与 Apps SDK 的关系

Apps SDK 是构建和分发 ChatGPT Apps 的受支持方式。ChatGPT 也实现了 MCP Apps UI 标准，因此你的 UI 可以跨兼容 MCP Apps 的 hosts 运行。

实践中：

- 当存在等价能力时，使用 MCP Apps standard keys 和 bridge methods（`_meta.ui.resourceUri`, `ui/*`）。
- 只有在需要 ChatGPT-specific capabilities 时才使用 OpenAI extensions。

这类似于 web platform：vendor-specific APIs 可以帮助早期发布，但一旦标准存在，文档就应该以标准形式为主。这关乎可移植性，而不是弃用。

## Optional ChatGPT extensions via `window.openai`

有些能力是 ChatGPT 特有的。使用它们时，请把它们视为可选 extensions：它们在 ChatGPT 中增加能力，同时不妨碍你的 UI 在其他 MCP Apps hosts 中运行。

示例包括：

- Instant Checkout (`window.openai.requestCheckout`)
- File handling (`window.openai.uploadFile`, `window.openai.selectFiles`, `window.openai.getFileDownloadUrl`)
- Host modals (`window.openai.requestModal`)

## Migration and mapping guide

本节将常见 Apps SDK patterns 映射到 MCP Apps standard equivalents。

### Tool metadata

| 目标 | MCP Apps standard | ChatGPT compatibility alias |
| ---------------------------- | ---------------------- | -------------------------------- |
| 将 tool 链接到 UI resource | `_meta.ui.resourceUri` | `_meta["openai/outputTemplate"]` |

### Host bridge

| 目标 | MCP Apps standard | ChatGPT extension（可选） |
| ------------------------------- | ----------------------------------------------- | ----------------------------------- |
| 接收 tool input | `ui/initialize` + `ui/notifications/tool-input` | `window.openai.toolInput` |
| 接收 tool results | `ui/notifications/tool-result` | `window.openai.toolOutput` |
| 从 UI 调用 tool | `tools/call` | `window.openai.callTool` |
| 发送 follow-up message | `ui/message` | `window.openai.sendFollowUpMessage` |
| 更新 model-visible UI context | `ui/update-model-context` | `window.openai.setWidgetState` |

围绕 MCP Apps 标准构建以获得可移植性，然后在能改善 ChatGPT 体验的地方叠加 ChatGPT extensions。

### Extension best practices

- 调用 extension 前先做 **feature-detect**。
- extension 不可用时 **gracefully degrade**。
- **避免按产品名分支。** 优先使用 capability detection 和 progressive enhancement，而不是假设特定 host surface。

```js
const openai = typeof window !== "undefined" ? window.openai : undefined;

if (openai?.requestModal) {
  await openai.requestModal({
    /* ... */
  });
} else {
  // Fallback behavior for hosts without this extension.
}
```
