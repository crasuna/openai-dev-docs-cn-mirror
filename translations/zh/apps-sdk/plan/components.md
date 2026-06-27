---
status: needs-review
sourceId: "a3fddf9ee40f"
sourceChecksum: "a3fddf9ee40f2d3117e32ebe18bbe4cafd9e5829405c445e3cbe8e29da22f1ca"
sourceUrl: "https://developers.openai.com/apps-sdk/plan/components"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# 设计 Components

## 为什么 components 很重要

UI components 是 connector 中用户可见的一半。它们让用户能够内联查看或编辑数据，在需要时切换到 fullscreen，并让 typed prompts 与 UI actions 之间的 context 保持同步。尽早规划它们，可以确保你的 MCP server 从第一天起就返回正确的 structured data 和 component metadata。

由于 ChatGPT 实现了 MCP Apps UI 标准，设计良好的 component 和 data contract 可以在兼容 MCP Apps 的 hosts 之间移植。

## 探索 sample components

我们在 [openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples) 发布了可复用示例，便于你在构建自己的组件前了解常见模式。pizzaz gallery 覆盖了我们目前提供的每一种默认 surface：

### List

渲染动态集合，并处理 empty-state。[View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-list)。

![Screenshot of the Pizzaz list component](https://developers.openai.com/images/apps-sdk/pizzaz-list.png)

### Map

绘制 geo data，支持 marker clustering 和 detail panes。[View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz)。

![Screenshot of the Pizzaz map component](https://developers.openai.com/images/apps-sdk/pizzaz-map.png)

### Album

展示 media grids，并支持 fullscreen transitions。[View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-albums)。

![Screenshot of the Pizzaz album component](https://developers.openai.com/images/apps-sdk/pizzaz-album.png)

### Carousel

通过 swipe gestures 突出 featured content。[View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-carousel)。

![Screenshot of the Pizzaz carousel component](https://developers.openai.com/images/apps-sdk/pizzaz-carousel.png)

### Shop

演示带 checkout affordances 的产品浏览。[View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-shop)。

![Screenshot of the Pizzaz shop component in grid view](https://developers.openai.com/images/apps-sdk/pizzaz-shop-view.png)
![Screenshot of the Pizzaz shop component in modal view](https://developers.openai.com/images/apps-sdk/pizzaz-shop-modal.png)

## Clarify the user interaction

对每个 use case，决定用户需要看到和操作什么：

- **Viewer vs. editor** - component 是 read-only（chart、dashboard），还是应该支持 editing 和 writebacks（forms、kanban boards）？
- **Single-shot vs. multiturn** - 用户会在一次 invocation 中完成任务，还是需要随着迭代在多个 turns 之间持久化 state？
- **Inline vs. fullscreen** - 有些任务适合默认 inline card，而另一些任务会受益于 fullscreen 或 picture-in-picture modes。实现前先勾勒这些状态。

写下你需要的 fields、affordances 和 empty states，以便与 design partners 和 reviewers 验证。

## Map data requirements

Components 应在 tool response 中收到所需的一切。规划时：

- **Structured content** - 定义 component 将解析的 JSON payload。
- **Initial component state** - 从通过 MCP Apps bridge 传递的最新 `structuredContent` 渲染（例如 `ui/notifications/tool-result`）。在 UI-initiated tool calls（`tools/call`）上，从返回的 tool result 渲染。为了让模型与 UI state 同步，请使用 `ui/update-model-context`。
- **Auth context** - 记录 component 是否应显示 linked-account information，或模型是否必须先提示用户连接。

通过 MCP response 传递这些数据，比稍后添加 ad-hoc APIs 更简单。

## Design for responsive layouts

Components 在 desktop 和 mobile 上都运行于 iframe 内。请规划：

- **Adaptive breakpoints** - 设置 max width，并设计能在小屏上优雅折叠的 layouts。
- **Accessible color and motion** - 尊重 system dark mode（匹配 color-scheme），并为 keyboard navigation 提供 focus states。
- **Launcher transitions** - 如果用户从 launcher 打开你的 component，或展开到 fullscreen，请确保 navigation elements 仍然可见。

预先记录 CSS variables、font stacks 和 iconography，使它们在 components 之间保持一致。

## Define the state contract

因为 components 和 chat surface 共享 conversation state，请明确哪些内容存储在哪里：

- **Component state** - 使用 `ui/update-model-context` 存储 model-visible UI state。如果希望 ChatGPT 在 widget re-renders 之间持久化 UI-only state（可选），也可以使用 `window.openai.setWidgetState`（selected record、scroll position、staged form data）。
- **Server state** - 在你的 backend 或 built-in storage layer 中存储 authoritative data。决定在 follow-up tool calls 后如何将 server changes 合并回 component state。
- **Model messages** - 思考 component 应通过 `ui/message` 发送哪些 human-readable updates，让 transcript 保持有意义。

尽早捕获这张 state diagram，可以防止之后出现难以调试的同步问题。

## Plan telemetry and debugging hooks

没有 instrumentation 时，inline experiences 最难调试。提前决定你将如何：

- 为 component loads、button clicks 和 validation errors 发出 analytics events。
- 将 tool-call IDs 与 component telemetry 一起记录，以便端到端追踪问题。
- 在 component 加载失败时提供 fallbacks（例如显示 structured JSON 并提示用户重试）。

这些计划就绪后，你就可以进入 [Build a ChatGPT UI](https://developers.openai.com/apps-sdk/build/chatgpt-ui) 中的实现细节。
