---
title: "设计组件"
description: "Plan and design UI components that users can interact with."
outline: deep
---

# 设计组件

**文档集**：Apps SDK 应用 SDK<br>
**分组**：Apps SDK — 规划<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/plan/components](https://developers.openai.com/apps-sdk/plan/components)
- Markdown 来源：[https://developers.openai.com/apps-sdk/plan/components.md](https://developers.openai.com/apps-sdk/plan/components.md)
- 抓取时间：2026-06-27T05:54:49.111Z
- Checksum：`a3fddf9ee40f2d3117e32ebe18bbe4cafd9e5829405c445e3cbe8e29da22f1ca`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 为什么组件很重要

UI 组件是 connector 中用户可见的一半。它们让用户能够内联查看或编辑数据，在需要时切换到 fullscreen，并让输入的提示与 UI 动作之间的上下文保持同步。尽早规划它们，可以确保你的 MCP server 从第一天起就返回正确的结构化数据和组件元数据。

由于 ChatGPT 实现了 MCP Apps UI 标准，设计良好的组件和数据契约可以在兼容 MCP Apps 的 host 之间移植。

## 探索示例组件

我们在 [openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples) 发布了可复用示例，便于你在构建自己的组件前了解常见模式。Pizzaz gallery 覆盖了我们目前提供的每一种默认界面形态：

### List

渲染动态集合，并处理空状态。[查看代码](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-list)。

![Screenshot of the Pizzaz list component](/openai-assets/developers.openai.com/images/apps-sdk/pizzaz-list.png)

### Map

绘制地理数据，支持标记聚类和详情面板。[查看代码](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz)。

![Screenshot of the Pizzaz map component](/openai-assets/developers.openai.com/images/apps-sdk/pizzaz-map.png)

### Album

展示媒体网格，并支持 fullscreen 过渡。[查看代码](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-albums)。

![Screenshot of the Pizzaz album component](/openai-assets/developers.openai.com/images/apps-sdk/pizzaz-album.png)

### Carousel

通过滑动手势突出精选内容。[查看代码](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-carousel)。

![Screenshot of the Pizzaz carousel component](/openai-assets/developers.openai.com/images/apps-sdk/pizzaz-carousel.png)

### Shop

演示带结账入口的产品浏览。[查看代码](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-shop)。

![Screenshot of the Pizzaz shop component in grid view](/openai-assets/developers.openai.com/images/apps-sdk/pizzaz-shop-view.png)
![Screenshot of the Pizzaz shop component in modal view](/openai-assets/developers.openai.com/images/apps-sdk/pizzaz-shop-modal.png)

## 明确用户交互

对每个使用场景，决定用户需要看到和操作什么：

- **查看器 vs. 编辑器** - 组件是只读的（chart、dashboard），还是应该支持编辑和写回（forms、kanban boards）？
- **一次性 vs. 多轮** - 用户会在一次调用中完成任务，还是需要随着迭代在多个轮次之间持久化状态？
- **Inline vs. fullscreen** - 有些任务适合默认 inline card，而另一些任务会受益于 fullscreen 或 picture-in-picture 模式。实现前先勾勒这些状态。

写下你需要的字段、交互入口和空状态，以便与设计伙伴和审核者验证。

## 映射数据需求

组件应在工具响应中收到所需的一切。规划时：

- **结构化内容** - 定义组件将解析的 JSON payload。
- **初始组件状态** - 从通过 MCP Apps bridge 传递的最新 `structuredContent` 渲染（例如 `ui/notifications/tool-result`）。在 UI 发起的工具调用（`tools/call`）上，从返回的工具结果渲染。为了让模型与 UI 状态同步，请使用 `ui/update-model-context`。
- **认证上下文** - 记录组件是否应显示已链接账号信息，或模型是否必须先提示用户连接。

通过 MCP 响应传递这些数据，比稍后添加临时 API 更简单。

## 为响应式布局而设计

组件在桌面端和移动端上都运行于 iframe 内。请规划：

- **自适应断点** - 设置 max width，并设计能在小屏上优雅折叠的布局。
- **可访问的颜色和动效** - 尊重系统深色模式（匹配 color-scheme），并为键盘导航提供焦点状态。
- **Launcher 过渡** - 如果用户从 launcher 打开你的组件，或展开到 fullscreen，请确保导航元素仍然可见。

预先记录 CSS 变量、字体栈和图标风格，使它们在组件之间保持一致。

## 定义状态契约

因为组件和聊天界面共享对话状态，请明确哪些内容存储在哪里：

- **组件状态** - 使用 `ui/update-model-context` 存储模型可见的 UI 状态。如果希望 ChatGPT 在 widget 重新渲染之间持久化仅 UI 可见的状态（可选），也可以使用 `window.openai.setWidgetState`（选中记录、滚动位置、暂存表单数据）。
- **服务器状态** - 在你的后端或内置存储层中存储权威数据。决定在后续工具调用后如何将服务器变更合并回组件状态。
- **模型消息** - 思考组件应通过 `ui/message` 发送哪些人类可读更新，让 transcript 保持有意义。

尽早捕获这张状态图，可以防止之后出现难以调试的同步问题。

## 规划遥测和调试钩子

没有 instrumentation 时，inline 体验最难调试。提前决定你将如何：

- 为组件加载、按钮点击和验证错误发出分析事件。
- 将工具调用 ID 与组件遥测一起记录，以便端到端追踪问题。
- 在组件加载失败时提供 fallback（例如显示结构化 JSON 并提示用户重试）。

这些计划就绪后，你就可以进入 [Build a ChatGPT UI](/mirror/apps-sdk/build/chatgpt-ui) 中的实现细节。

:::

## English source

::: details 展开英文原文
::: v-pre
## Why components matter

UI components are the human-visible half of your connector. They let users view or edit data inline, switch to fullscreen when needed, and keep context synchronized between typed prompts and UI actions. Planning them early ensures your MCP server returns the right structured data and component metadata from day one.

Because ChatGPT implements the MCP Apps UI standard, a well-designed component
and data contract can be portable across MCP Apps-compatible hosts.

## Explore sample components

We publish reusable examples in [openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples) so you can see common patterns before you build your own. The pizzaz gallery covers every default surface we provide today:

### List

Renders dynamic collections with empty-state handling. [View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-list).

![Screenshot of the Pizzaz list component](/openai-assets/developers.openai.com/images/apps-sdk/pizzaz-list.png)

### Map

Plots geo data with marker clustering and detail panes. [View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz).

![Screenshot of the Pizzaz map component](/openai-assets/developers.openai.com/images/apps-sdk/pizzaz-map.png)

### Album

Showcases media grids with fullscreen transitions. [View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-albums).

![Screenshot of the Pizzaz album component](/openai-assets/developers.openai.com/images/apps-sdk/pizzaz-album.png)

### Carousel

Highlights featured content with swipe gestures. [View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-carousel).

![Screenshot of the Pizzaz carousel component](/openai-assets/developers.openai.com/images/apps-sdk/pizzaz-carousel.png)

### Shop

Demonstrates product browsing with checkout affordances. [View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-shop).

![Screenshot of the Pizzaz shop component in grid view](/openai-assets/developers.openai.com/images/apps-sdk/pizzaz-shop-view.png)
![Screenshot of the Pizzaz shop component in modal view](/openai-assets/developers.openai.com/images/apps-sdk/pizzaz-shop-modal.png)

## Clarify the user interaction

For each use case, decide what the user needs to see and manipulate:

- **Viewer vs. editor** – is the component read-only (a chart, a dashboard) or should it support editing and writebacks (forms, kanban boards)?
- **Single-shot vs. multiturn** – will the user accomplish the task in one invocation, or should state persist across turns as they iterate?
- **Inline vs. fullscreen** – some tasks are comfortable in the default inline card, while others benefit from fullscreen or picture-in-picture modes. Sketch these states before you implement.

Write down the fields, affordances, and empty states you need so you can validate them with design partners and reviewers.

## Map data requirements

Components should receive everything they need in the tool response. When planning:

- **Structured content** – define the JSON payload that the component will parse.
- **Initial component state** – render from the latest `structuredContent` delivered over the MCP Apps bridge (for example, `ui/notifications/tool-result`). On UI-initiated tool calls (`tools/call`), render from the returned tool result. To keep the model in sync with UI state, use `ui/update-model-context`.
- **Auth context** – note whether the component should display linked-account information, or whether the model must prompt the user to connect first.

Feeding this data through the MCP response is simpler than adding ad-hoc APIs later.

## Design for responsive layouts

Components run inside an iframe on both desktop and mobile. Plan for:

- **Adaptive breakpoints** – set a max width and design layouts that collapse gracefully on small screens.
- **Accessible color and motion** – respect system dark mode (match color-scheme) and provide focus states for keyboard navigation.
- **Launcher transitions** – if the user opens your component from the launcher or expands to fullscreen, make sure navigation elements stay visible.

Document CSS variables, font stacks, and iconography up front so they are consistent across components.

## Define the state contract

Because components and the chat surface share conversation state, be explicit about what is stored where:

- **Component state** – use `ui/update-model-context` for model-visible UI state. If you want ChatGPT to persist UI-only state across widget re-renders (optional), you can also use `window.openai.setWidgetState` (selected record, scroll position, staged form data).
- **Server state** – store authoritative data in your backend or the built-in storage layer. Decide how to merge server changes back into component state after follow-up tool calls.
- **Model messages** – think about what human-readable updates the component should send back via `ui/message` so the transcript stays meaningful.

Capturing this state diagram early prevents hard-to-debug sync issues later.

## Plan telemetry and debugging hooks

Inline experiences are hardest to debug without instrumentation. Decide in advance how you will:

- Emit analytics events for component loads, button clicks, and validation errors.
- Log tool-call IDs alongside component telemetry so you can trace issues end to end.
- Provide fallbacks when the component fails to load (e.g., show the structured JSON and prompt the user to retry).

Once these plans are in place you are ready to move on to the implementation details in [Build a ChatGPT UI](/mirror/apps-sdk/build/chatgpt-ui).

:::
:::

