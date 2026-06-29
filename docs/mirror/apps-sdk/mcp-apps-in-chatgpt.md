---
title: "ChatGPT 中的 MCP Apps 兼容性"
description: "Build portable MCP Apps UIs that run in ChatGPT"
outline: deep
---

# ChatGPT 中的 MCP Apps 兼容性

**文档集**：Apps SDK\
**分组**：ChatGPT 中的 MCP 应用\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt)
- Markdown 来源：[https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt.md](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt.md)
- 抓取时间：2026-06-27T05:54:48.306Z
- Checksum：`ffb13d7e73d464b9743557192ad1fcdef0ba308235c4fd76f99cfd75147b9cb0`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

ChatGPT 支持用于嵌入式 app UI 的 [**MCP Apps**](https://modelcontextprotocol.io/docs/extensions/apps) 开放标准。

MCP Apps UI 在 iframe 内运行，并通过标准 bridge（基于 `postMessage` 的 `ui/*` JSON-RPC）与 host 通信。ChatGPT 实现了相同的 iframe 和 bridge 模型，因此你可以构建一次 UI，并在 ChatGPT 以及其他兼容 MCP Apps 的 host 中运行。

现有 Apps SDK APIs 仍然受支持，新的实验性能力会先在 Apps SDK 中发布。OpenAI 基于 ChatGPT Apps 的经验帮助塑造了 MCP Apps 标准；新的能力会在形态和功能验证后进入 MCP spec。

默认请使用 MCP Apps 标准 key 和 bridge 进行构建。只有在需要 ChatGPT-specific capability 时才使用 `window.openai`。

## 推荐方法

对于新的 apps（以及现有 apps 中的新 UI surfaces），请从 MCP Apps 标准开始：

1. **声明你的 UI**，使用 `_meta.ui.resourceUri`。
2. **使用标准 host bridge**（基于 `postMessage` 的 `ui/*` JSON-RPC）进行初始化、notification 和 host interaction。

可选：

3. 只有当你需要 shared spec 未覆盖的能力时，才通过 `window.openai` **叠加 ChatGPT 扩展**。

### MCP Apps host 桥接（`ui/*`）

MCP Apps 定义了标准 iframe bridge：

- **Transport:** 基于 `window.postMessage` 的 JSON-RPC 2.0 message
- **Namespace:** 用于 UIs ↔ host interaction 的 `ui/*` method 和 notification
- **Tool calls:** 使用 MCP tool surface（例如 `tools/call`），而不是 host-specific UI globals

## 这与 Apps SDK 的关系

Apps SDK 是构建和分发 ChatGPT Apps 的受支持方式。ChatGPT 也实现了 MCP Apps UI 标准，因此你的 UI 可以跨兼容 MCP Apps 的 hosts 运行。

实践中：

- 当存在等价能力时，使用 MCP Apps standard keys 和 bridge methods（`_meta.ui.resourceUri`, `ui/*`）。
- 只有在需要 ChatGPT-specific capabilities 时才使用 OpenAI extensions。

这类似于 web platform：vendor-specific APIs 可以帮助早期发布，但一旦标准存在，文档就应该以标准形式为主。这关乎可移植性，而不是弃用。

## 通过 `window.openai` 使用可选 ChatGPT 扩展

有些能力是 ChatGPT 特有的。使用它们时，请把它们视为可选 extensions：它们在 ChatGPT 中增加能力，同时不妨碍你的 UI 在其他 MCP Apps hosts 中运行。

示例包括：

- Instant Checkout (`window.openai.requestCheckout`)
- File handling (`window.openai.uploadFile`, `window.openai.selectFiles`, `window.openai.getFileDownloadUrl`)
- Host modals (`window.openai.requestModal`)

## 迁移和映射指南

本节将常见 Apps SDK 模式映射到 MCP Apps 标准等价形式。

### 工具元数据

| 目标 | MCP Apps standard | ChatGPT compatibility alias |
| ---------------------------- | ---------------------- | -------------------------------- |
| 将 tool 链接到 UI resource | `_meta.ui.resourceUri` | `_meta["openai/outputTemplate"]` |

### Host 桥接

| 目标 | MCP Apps standard | ChatGPT extension（可选） |
| ------------------------------- | ----------------------------------------------- | ----------------------------------- |
| 接收 tool input | `ui/initialize` + `ui/notifications/tool-input` | `window.openai.toolInput` |
| 接收 tool results | `ui/notifications/tool-result` | `window.openai.toolOutput` |
| 从 UI 调用 tool | `tools/call` | `window.openai.callTool` |
| 发送 follow-up message | `ui/message` | `window.openai.sendFollowUpMessage` |
| 更新 model-visible UI context | `ui/update-model-context` | `window.openai.setWidgetState` |

围绕 MCP Apps 标准构建以获得可移植性，然后在能改善 ChatGPT 体验的地方叠加 ChatGPT extensions。

### 扩展最佳实践

- 调用 extension 前先做 **feature-detect**。
- extension 不可用时 **gracefully degrade**。
- **避免按产品名分支。** 优先使用能力检测和渐进增强，而不是假设特定 host surface。

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

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

ChatGPT supports the [**MCP Apps**](https://modelcontextprotocol.io/docs/extensions/apps) open standard for embedded app UIs.

MCP Apps UIs run inside an iframe and communicate with the host over a standard bridge (`ui/*` JSON-RPC over `postMessage`). ChatGPT implements this same iframe-and-bridge model, so you can build your UI once and run it in ChatGPT and other MCP Apps–compatible hosts.

Existing Apps SDK APIs remain supported, and new, experimental capabilities ship
first in the Apps SDK. OpenAI helped shape the MCP Apps standard from ChatGPT
Apps, and new capabilities move into the MCP spec after shape and functionality
validation.

Build with the MCP Apps standard keys and bridge by default. Use `window.openai` when you need ChatGPT-specific capabilities.

## Recommended approach

For new apps (and new UI surfaces inside existing apps), start with the MCP Apps standard:

1. **Declare your UI** using `_meta.ui.resourceUri`.
2. **Use the standard host bridge** (`ui/*` JSON-RPC over `postMessage`) for initialization, notifications, and host interaction.

Optional:

3. **Layer on ChatGPT extensions** via `window.openai` only when you need capabilities that aren’t covered by the shared spec.

### MCP Apps host bridge (`ui/*`)

MCP Apps defines a standard iframe bridge:

- **Transport:** JSON-RPC 2.0 messages over `window.postMessage`
- **Namespace:** `ui/*` methods and notifications for UIs ↔ host interaction
- **Tool calls:** use the MCP tool surface (for example, `tools/call`) rather than host-specific UI globals

## How this relates to the Apps SDK

The Apps SDK is a supported way to build and distribute ChatGPT Apps. ChatGPT also implements the MCP Apps UI standard, so your UI can run across MCP Apps-compatible hosts.

In practice:

- Use MCP Apps standard keys and bridge methods (`_meta.ui.resourceUri`, `ui/*`) when there’s an equivalent.
- Use OpenAI extensions only when you need ChatGPT-specific capabilities.

This is similar to the web platform: vendor-specific APIs can help ship early,
but once a standard exists, documentation should lead with the standard form.
That’s about portability, not deprecation.

## Optional ChatGPT extensions via `window.openai`

Some capabilities are specific to ChatGPT. When you use them, treat them as optional extensions that add power in ChatGPT—without preventing your UI from running in other MCP Apps hosts.

Examples include:

- Instant Checkout (`window.openai.requestCheckout`)
- File handling (`window.openai.uploadFile`, `window.openai.selectFiles`, `window.openai.getFileDownloadUrl`)
- Host modals (`window.openai.requestModal`)

## Migration and mapping guide

This section maps common Apps SDK patterns to MCP Apps standard equivalents.

### Tool metadata

| Goal                         | MCP Apps standard      | ChatGPT compatibility alias      |
| ---------------------------- | ---------------------- | -------------------------------- |
| Link a tool to a UI resource | `_meta.ui.resourceUri` | `_meta["openai/outputTemplate"]` |

### Host bridge

| Goal                            | MCP Apps standard                               | ChatGPT extension (optional)        |
| ------------------------------- | ----------------------------------------------- | ----------------------------------- |
| Receive tool input              | `ui/initialize` + `ui/notifications/tool-input` | `window.openai.toolInput`           |
| Receive tool results            | `ui/notifications/tool-result`                  | `window.openai.toolOutput`          |
| Call a tool from the UI         | `tools/call`                                    | `window.openai.callTool`            |
| Send a follow-up message        | `ui/message`                                    | `window.openai.sendFollowUpMessage` |
| Update model-visible UI context | `ui/update-model-context`                       | `window.openai.setWidgetState`      |

Build around the MCP Apps standard for portability, then layer on ChatGPT extensions where they improve the ChatGPT experience.

### Extension best practices

- **Feature-detect** before calling an extension.
- **Gracefully degrade** when the extension isn’t available.
- **Avoid product-name branching.** Prefer capability detection and progressive enhancement instead of assuming a specific host surface.

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

:::
:::

