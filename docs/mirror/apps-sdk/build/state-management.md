---
title: "管理状态"
description: "How to manage business data, UI state, and cross-session state in ChatGPT apps using the Apps SDK and an MCP server."
outline: deep
---

# 管理状态

**文档集**：Apps SDK  
**分组**：Apps SDK — Build  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/build/state-management](https://developers.openai.com/apps-sdk/build/state-management)
- Markdown 来源：[https://developers.openai.com/apps-sdk/build/state-management.md](https://developers.openai.com/apps-sdk/build/state-management.md)
- 抓取时间：2026-06-27T05:54:45.756Z
- Checksum：`d9f715b1bdacbf141d786b41fe59f874f3314c2d57ca900bc4efe6d80d6ca53b`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 在 ChatGPT Apps 中管理状态

本指南说明在使用 Apps SDK 和 MCP server 构建应用时，如何为 ChatGPT 内部渲染的自定义 UI 组件管理状态。你将学习如何决定每一类状态应放在哪里，以及如何让状态跨渲染和对话持久存在。

这些模式能让你的 UI 保持 host-agnostic，这正是 MCP Apps “build once, run in many places” 方法能够成立的原因。

## 概览

ChatGPT app 中的状态分为三类：

| 状态类型 | 所有者 | 生命周期 | 示例 |
| --------------------------------- | ---------------------------------- | ------------------------------------ | --------------------------------------------- |
| **Business data（权威）** | MCP server 或后端服务 | 长期 | Tasks、tickets、documents |
| **UI state（临时）** | ChatGPT 内部的 widget instance | 仅限活跃 widget | Selected row、expanded panel、sort order |
| **Cross-session state（持久）** | 你的后端或 storage | 跨 session 和跨对话 | Saved filters、view mode、workspace selection |

把每一份状态放在合适位置，这样 UI 会保持一致，聊天也会匹配预期意图。

---

## UI 组件如何存在于 ChatGPT 内部

当你的应用返回自定义 UI 组件时，ChatGPT 会在与对话中特定消息绑定的 widget 内部渲染该组件。只要该消息存在于 thread 中，widget 就会持续存在。

**关键行为：**

- **Widgets are message-scoped:** 每个返回 widget 的响应都会创建一个全新 instance，并拥有自己的 UI state。
- **UI state sticks with the widget:** 当你重新打开或刷新同一条消息时，widget 会恢复其已保存状态（selected row、expanded panel 等）。
- **Server data drives the truth:** widget 只有在 tool call 完成时才会看到更新后的 business data，然后会把本地 UI state 重新应用到该 snapshot 之上。

### 心智模型

widget 的 UI 和数据层像这样协同工作：

```text
Server (MCP or backend)
│
├── Authoritative business data (source of truth)
│
▼
ChatGPT Widget
│
├── Ephemeral UI state (visual behavior)
│
└── Rendered view = authoritative data + UI state
```

这种分离让 UI 交互保持流畅，同时确保数据正确性。

---

## 1. Business State（权威）

Business data 是 **source of truth**。它应存在于你的 MCP server 或后端中，而不是 widget 内部。

当用户执行动作时：

1. UI 调用 server tool。
2. server 更新数据。
3. server 返回新的权威 snapshot。
4. widget 使用该 snapshot 重新渲染。

这可以防止 UI 与 server 之间出现分歧。

### 示例：从 MCP server 返回权威状态（Node.js）

```js



const tasks = new Map(); // replace with your DB or external service
let nextId = 1;

const taskListOutputSchema = {
  type: "object",
  properties: {
    type: { type: "string", const: "taskList" },
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          done: { type: "boolean" },
        },
        required: ["id", "title", "done"],
        additionalProperties: false,
      },
    },
  },
  required: ["type", "tasks"],
  additionalProperties: false,
};

const server = new Server({
  tools: {
    get_tasks: {
      description: "Return all tasks",
      inputSchema: jsonSchema.object({}),
      outputSchema: taskListOutputSchema,
      async run() {
        return {
          structuredContent: {
            type: "taskList",
            tasks: Array.from(tasks.values()),
          },
        };
      },
    },
    add_task: {
      description: "Add a new task",
      inputSchema: jsonSchema.object({ title: jsonSchema.string() }),
      outputSchema: taskListOutputSchema,
      async run({ title }) {
        const id = `task-${nextId++}`; // simple example id
        tasks.set(id, { id, title, done: false });

        // Always return updated authoritative state
        return this.tools.get_tasks.run({});
      },
    },
  },
});

server.start();
```

---

## 2. UI State（临时）

UI state 描述数据正在 **如何** 被查看，而不是数据本身。

当新的 server data 到达时，widgets 不会自动重新同步 UI state。相反，widget 会保留自己的 UI state，并在权威数据刷新时重新应用它。

使用你的 UI framework 的状态（React state、signals 等）把 UI state 存在 widget instance 内部。对于新 apps：

- 让 UI state 保持在 UI 本地。
- 当模型需要看到 UI state（selected filters、staged edits）时，调用 `ui/update-model-context`。

这能让你的核心 UI 逻辑跨 MCP Apps-compatible hosts 保持可移植。

**ChatGPT extension（可选）：** 如果你希望 ChatGPT 在 widget 生命周期内持久化 UI-only state，可以使用：

- `window.openai.widgetState` – 读取当前 widget-scoped state snapshot。
- `window.openai.setWidgetState(newState)` – 写入下一个 snapshot。此调用是同步的；持久化会在后台发生。

由于 host 会异步持久化 widget state，调用 `window.openai.setWidgetState` 时没有任何内容需要 `await`。把它当作更新本地 component state 一样处理，并在每次有意义的 UI-state change 后立即调用。

### 示例（React 组件）

此示例展示 ChatGPT widget-state persistence（可选）。如果你想在 React 中使用它，请将 `window.openai.widgetState` 和 `window.openai.setWidgetState` 包装到一个小 hook（例如 `useWidgetState`）中，并从你的项目导入。

```tsx


export function TaskList({ data }) {
  const [widgetState, setWidgetState] = useWidgetState(() => ({
    selectedId: null,
  }));

  const selectTask = (id) => {
    setWidgetState((prev) => ({ ...prev, selectedId: id }));
  };

  return (
    <ul>
      {data.tasks.map((task) => (
        <li
          key={task.id}
          style={{
            fontWeight: widgetState?.selectedId === task.id ? "bold" : "normal",
          }}
          onClick={() => selectTask(task.id)}
        >
          {task.title}
        </li>
      ))}
    </ul>
  );
}
```

### 示例（vanilla JS 组件）

```js
let tasks = [];
let widgetState = window.openai?.widgetState ?? { selectedId: null };

const updateFromToolResult = (toolResult) => {
  const nextTasks = toolResult?.structuredContent?.tasks;
  if (!nextTasks) return;
  tasks = nextTasks;
  renderTasks();
};

window.addEventListener(
  "message",
  (event) => {
    if (event.source !== window.parent) return;
    const message = event.data;
    if (!message || message.jsonrpc !== "2.0") return;
    if (message.method !== "ui/notifications/tool-result") return;
    updateFromToolResult(message.params);
  },
  { passive: true }
);

function selectTask(id) {
  widgetState = { ...widgetState, selectedId: id };
  window.openai?.setWidgetState?.(widgetState);
  renderTasks();
}

function renderTasks() {
  const list = document.querySelector("#task-list");
  list.innerHTML = tasks
    .map(
      (task) => `
        <li
          style="font-weight: ${widgetState.selectedId === task.id ? "bold" : "normal"}"
          onclick="selectTask('${task.id}')"
        >
          ${task.title}
        </li>
      `
    )
    .join("");
}

renderTasks();
```

### Widget state 中的 image IDs（model-visible images，ChatGPT 扩展）

如果你的 widget 处理图像，请使用结构化 widget state shape，并包含 `imageIds` array。host 会在后续轮次把这些 file IDs 暴露给模型，让模型可以对图像进行推理。

推荐 shape 为：

- `modelContent`：模型应看到的文本或 JSON。
- `privateContent`：模型不应看到的 UI-only state。
- `imageIds`：由 widget 上传、在 file library 可用时通过 `window.openai.selectFiles()` 选择、通过 tool input file params 收到，或由 tool file references 返回的 file IDs 列表。

```tsx
type StructuredWidgetState = {
  modelContent: string | Record<string, unknown> | null;
  privateContent: Record<string, unknown> | null;
  imageIds: string[];
};

const [state, setState] = useWidgetState<StructuredWidgetState>(null);

setState({
  modelContent: "Check out the latest updated image",
  privateContent: {
    currentView: "image-viewer",
    filters: ["crop", "sharpen"],
  },
  imageIds: ["file_123", "file_456"],
});
```

只有你通过 `window.openai.uploadFile` 上传、在可用时通过 `window.openai.selectFiles()` 选择、通过 file params 接收，或从 tool result file references 接收的 file IDs，才能包含在 `imageIds` 中。

---

## 3. 跨会话状态

必须跨对话、设备或 sessions 持久存在的 preferences 应存储在你的后端中。

Apps SDK 会自动处理 conversation state，但大多数现实世界 apps 也需要持久 storage。你可能会缓存已获取的数据、跟踪用户 preferences，或持久化在组件内创建的 artifacts。选择添加 storage layer 会带来额外能力，但也会增加复杂性。

## 使用你自己的后端

如果你已经运行 API，或需要多用户协作，请集成现有 storage layer。在此模型中：

- 通过 OAuth 认证用户（参见 [Authentication](/mirror/apps-sdk/build/auth)），这样你可以把 ChatGPT identities 映射到你的内部 accounts。
- 使用后端 APIs 获取和变更数据。保持低延迟；用户期待组件在几百毫秒内渲染。
- 返回足够的 structured content，让模型即使在组件加载失败时也能理解数据。

当你自行管理 storage 时，请规划：

- **Data residency and compliance** – 在传输 PII 或 regulated data 前，确保已建立相关 agreements。
- **Rate limits** – 保护你的 APIs，避免受到 model retries 或多个 active components 带来的 bursty traffic 冲击。
- **Versioning** – 在 stored objects 中包含 schema versions，以便在不破坏现有对话的情况下迁移它们。

### 示例：Widget 调用工具

此示例假设你有一个 JSON-RPC request/response helper（例如来自 [Quickstart](/mirror/apps-sdk/quickstart#build-a-web-component)），可以发送 `tools/call` requests。

```tsx


export function PreferencesForm({ userId, initialPreferences }) {
  const [formState, setFormState] = useState(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  async function savePreferences(next) {
    setIsSaving(true);
    setFormState(next);

    // Use the MCP Apps bridge (`tools/call`) to invoke tools from the UI.
    // Ensure the tool is visible to the UI (app) in its descriptor (see
    // `_meta.ui.visibility`).
    const result = await rpcRequest("tools/call", {
      name: "set_preferences",
      arguments: { userId, preferences: next },
    });

    const updated = result?.structuredContent?.preferences ?? next;
    setFormState(updated);
    setIsSaving(false);
  }

  return (
    <form>
      {/* form fields bound to formState */}
      <button
        type="button"
        disabled={isSaving}
        onClick={() => savePreferences(formState)}
      >
        {isSaving ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
```

### 示例：Server 处理工具（Node.js）

```js




// Helpers that call your existing backend API
async function readPreferences(userId) {
  const response = await request(
    `https://api.example.com/users/${userId}/preferences`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    }
  );
  if (response.statusCode === 404) return {};
  if (response.statusCode >= 400) throw new Error("Failed to load preferences");
  return await response.body.json();
}

async function writePreferences(userId, preferences) {
  const response = await request(
    `https://api.example.com/users/${userId}/preferences`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences),
    }
  );
  if (response.statusCode >= 400) throw new Error("Failed to save preferences");
  return await response.body.json();
}

const preferencesOutputSchema = {
  type: "object",
  properties: {
    type: { type: "string", const: "preferences" },
    preferences: { type: "object" },
  },
  required: ["type", "preferences"],
  additionalProperties: false,
};

const server = new Server({
  tools: {
    get_preferences: {
      inputSchema: jsonSchema.object({ userId: jsonSchema.string() }),
      outputSchema: preferencesOutputSchema,
      async run({ userId }) {
        const preferences = await readPreferences(userId);
        return { structuredContent: { type: "preferences", preferences } };
      },
    },
    set_preferences: {
      inputSchema: jsonSchema.object({
        userId: jsonSchema.string(),
        preferences: jsonSchema.object({}),
      }),
      outputSchema: preferencesOutputSchema,
      async run({ userId, preferences }) {
        const updated = await writePreferences(userId, preferences);
        return {
          structuredContent: { type: "preferences", preferences: updated },
        };
      },
    },
  },
});
```

---

## 总结

- 将 **business data** 存在 server 上。
- 将 **UI state** 存在 widget 内部（React state、signals 等）。当模型需要看到 UI state 时使用 `ui/update-model-context`，并且只有在需要 ChatGPT widget-state persistence（可选）时，才使用 `window.openai.widgetState` / `window.openai.setWidgetState`。
- 将 **cross-session state** 存在你控制的 backend storage 中。
- Widget state 仅对属于特定消息的 widget instance 持久存在。
- 避免把 `localStorage` 用于核心状态。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
## Managing State in ChatGPT Apps

This guide explains how to manage state for custom UI components rendered inside
ChatGPT when building an app using the Apps SDK and an MCP server. You’ll learn
how to decide where each piece of state belongs and how to persist it across
renders and conversations.

These patterns keep your UI host-agnostic, which is what enables the MCP Apps
“build once, run in many places” approach.

## Overview

State in a ChatGPT app falls into three categories:

| State type                        | Owned by                           | Lifetime                             | Examples                                      |
| --------------------------------- | ---------------------------------- | ------------------------------------ | --------------------------------------------- |
| **Business data (authoritative)** | MCP server or backend service      | Long-lived                           | Tasks, tickets, documents                     |
| **UI state (ephemeral)**          | The widget instance inside ChatGPT | Only for the active widget           | Selected row, expanded panel, sort order      |
| **Cross-session state (durable)** | Your backend or storage            | Cross-session and cross-conversation | Saved filters, view mode, workspace selection |

Place every piece of state where it belongs so the UI stays consistent and the chat matches the expected intent.

---

## How UI Components Live Inside ChatGPT

When your app returns a custom UI component, ChatGPT renders that component inside a widget that is tied to a specific message in the conversation. The widget persists as long as that message exists in the thread.

**Key behavior:**

- **Widgets are message-scoped:** Every response that returns a widget creates a fresh instance with its own UI state.
- **UI state sticks with the widget:** When you reopen or refresh the same message, the widget restores its saved state (selected row, expanded panel, etc.).
- **Server data drives the truth:** The widget only sees updated business data when a tool call completes, and then it reapplies its local UI state on top of that snapshot.

### Mental model

The widget’s UI and data layers work together like this:

```text
Server (MCP or backend)
│
├── Authoritative business data (source of truth)
│
▼
ChatGPT Widget
│
├── Ephemeral UI state (visual behavior)
│
└── Rendered view = authoritative data + UI state
```

This separation keeps UI interaction smooth while ensuring data correctness.

---

## 1. Business State (Authoritative)

Business data is the **source of truth**. It should live on your MCP server or
backend, not inside the widget.

When the user takes an action:

1. The UI calls a server tool.
2. The server updates data.
3. The server returns the new authoritative snapshot.
4. The widget re-renders using that snapshot.

This prevents divergence between UI and server.

### Example: Returning authoritative state from an MCP server (Node.js)

```js



const tasks = new Map(); // replace with your DB or external service
let nextId = 1;

const taskListOutputSchema = {
  type: "object",
  properties: {
    type: { type: "string", const: "taskList" },
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          done: { type: "boolean" },
        },
        required: ["id", "title", "done"],
        additionalProperties: false,
      },
    },
  },
  required: ["type", "tasks"],
  additionalProperties: false,
};

const server = new Server({
  tools: {
    get_tasks: {
      description: "Return all tasks",
      inputSchema: jsonSchema.object({}),
      outputSchema: taskListOutputSchema,
      async run() {
        return {
          structuredContent: {
            type: "taskList",
            tasks: Array.from(tasks.values()),
          },
        };
      },
    },
    add_task: {
      description: "Add a new task",
      inputSchema: jsonSchema.object({ title: jsonSchema.string() }),
      outputSchema: taskListOutputSchema,
      async run({ title }) {
        const id = `task-${nextId++}`; // simple example id
        tasks.set(id, { id, title, done: false });

        // Always return updated authoritative state
        return this.tools.get_tasks.run({});
      },
    },
  },
});

server.start();
```

---

## 2. UI State (Ephemeral)

UI state describes **how** data is being viewed, not the data itself.

Widgets do not automatically re-sync UI state when new server data arrives. Instead, the widget keeps its UI state and re-applies it when authoritative data is refreshed.

Store UI state inside the widget instance using your UI framework’s state (React
state, signals, etc.). For new apps:

- Keep UI state local to the UI.
- When the model should see UI state (selected filters, staged edits), call
  `ui/update-model-context`.

This keeps your core UI logic portable across MCP Apps-compatible hosts.

**ChatGPT extension (optional):** if you want ChatGPT to persist UI-only state
for the life of a widget, you can use:

- `window.openai.widgetState` – read the current widget-scoped state snapshot.
- `window.openai.setWidgetState(newState)` – write the next snapshot. The call
  is synchronous; persistence happens in the background.

Because the host persists widget state asynchronously, there is nothing to `await` when you call `window.openai.setWidgetState`. Treat it just like updating local component state and call it immediately after every meaningful UI-state change.

### Example (React component)

This example shows ChatGPT widget-state persistence (optional). If you want to
use it in React, wrap `window.openai.widgetState` and `window.openai.setWidgetState`
in a small hook (for example, `useWidgetState`) and import it from your project.

```tsx


export function TaskList({ data }) {
  const [widgetState, setWidgetState] = useWidgetState(() => ({
    selectedId: null,
  }));

  const selectTask = (id) => {
    setWidgetState((prev) => ({ ...prev, selectedId: id }));
  };

  return (
    <ul>
      {data.tasks.map((task) => (
        <li
          key={task.id}
          style={{
            fontWeight: widgetState?.selectedId === task.id ? "bold" : "normal",
          }}
          onClick={() => selectTask(task.id)}
        >
          {task.title}
        </li>
      ))}
    </ul>
  );
}
```

### Example (vanilla JS component)

```js
let tasks = [];
let widgetState = window.openai?.widgetState ?? { selectedId: null };

const updateFromToolResult = (toolResult) => {
  const nextTasks = toolResult?.structuredContent?.tasks;
  if (!nextTasks) return;
  tasks = nextTasks;
  renderTasks();
};

window.addEventListener(
  "message",
  (event) => {
    if (event.source !== window.parent) return;
    const message = event.data;
    if (!message || message.jsonrpc !== "2.0") return;
    if (message.method !== "ui/notifications/tool-result") return;
    updateFromToolResult(message.params);
  },
  { passive: true }
);

function selectTask(id) {
  widgetState = { ...widgetState, selectedId: id };
  window.openai?.setWidgetState?.(widgetState);
  renderTasks();
}

function renderTasks() {
  const list = document.querySelector("#task-list");
  list.innerHTML = tasks
    .map(
      (task) => `
        <li
          style="font-weight: ${widgetState.selectedId === task.id ? "bold" : "normal"}"
          onclick="selectTask('${task.id}')"
        >
          ${task.title}
        </li>
      `
    )
    .join("");
}

renderTasks();
```

### Image IDs in widget state (model-visible images, ChatGPT extension)

If your widget works with images, use the structured widget state shape and include an `imageIds` array. The host will expose these file IDs to the model on follow-up turns so the model can reason about the images.

The recommended shape is:

- `modelContent`: text or JSON the model should see.
- `privateContent`: UI-only state the model should not see.
- `imageIds`: list of file IDs uploaded by the widget, selected via `window.openai.selectFiles()` when the file library is available, received through tool input file params, or returned by tool file references.

```tsx
type StructuredWidgetState = {
  modelContent: string | Record<string, unknown> | null;
  privateContent: Record<string, unknown> | null;
  imageIds: string[];
};

const [state, setState] = useWidgetState<StructuredWidgetState>(null);

setState({
  modelContent: "Check out the latest updated image",
  privateContent: {
    currentView: "image-viewer",
    filters: ["crop", "sharpen"],
  },
  imageIds: ["file_123", "file_456"],
});
```

Only file IDs you uploaded with `window.openai.uploadFile`, selected with
`window.openai.selectFiles()` when available, received through file params, or
received from tool result file references can be included in `imageIds`.

---

## 3. Cross-session state

Preferences that must persist across conversations, devices, or sessions should be stored in your backend.

Apps SDK handles conversation state automatically, but most real-world apps also need durable storage. You might cache fetched data, keep track of user preferences, or persist artifacts created inside a component. Choosing to add a storage layer adds additional capabilities, but also complexity.

## Bring your own backend

If you already run an API or need multi-user collaboration, integrate with your existing storage layer. In this model:

- Authenticate the user via OAuth (see [Authentication](https://developers.openai.com/apps-sdk/build/auth)) so you can map ChatGPT identities to your internal accounts.
- Use your backend’s APIs to fetch and mutate data. Keep latency low; users expect components to render in a few hundred milliseconds.
- Return sufficient structured content so the model can understand the data even if the component fails to load.

When you roll your own storage, plan for:

- **Data residency and compliance** – ensure you have agreements in place before transferring PII or regulated data.
- **Rate limits** – protect your APIs against bursty traffic from model retries or multiple active components.
- **Versioning** – include schema versions in stored objects so you can migrate them without breaking existing conversations.

### Example: Widget invokes a tool

This example assumes you have a JSON-RPC request/response helper (for example,
from the [Quickstart](https://developers.openai.com/apps-sdk/quickstart#build-a-web-component)) that can send
`tools/call` requests.

```tsx


export function PreferencesForm({ userId, initialPreferences }) {
  const [formState, setFormState] = useState(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  async function savePreferences(next) {
    setIsSaving(true);
    setFormState(next);

    // Use the MCP Apps bridge (`tools/call`) to invoke tools from the UI.
    // Ensure the tool is visible to the UI (app) in its descriptor (see
    // `_meta.ui.visibility`).
    const result = await rpcRequest("tools/call", {
      name: "set_preferences",
      arguments: { userId, preferences: next },
    });

    const updated = result?.structuredContent?.preferences ?? next;
    setFormState(updated);
    setIsSaving(false);
  }

  return (
    <form>
      {/* form fields bound to formState */}
      <button
        type="button"
        disabled={isSaving}
        onClick={() => savePreferences(formState)}
      >
        {isSaving ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
```

### Example: Server handles the tool (Node.js)

```js




// Helpers that call your existing backend API
async function readPreferences(userId) {
  const response = await request(
    `https://api.example.com/users/${userId}/preferences`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    }
  );
  if (response.statusCode === 404) return {};
  if (response.statusCode >= 400) throw new Error("Failed to load preferences");
  return await response.body.json();
}

async function writePreferences(userId, preferences) {
  const response = await request(
    `https://api.example.com/users/${userId}/preferences`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences),
    }
  );
  if (response.statusCode >= 400) throw new Error("Failed to save preferences");
  return await response.body.json();
}

const preferencesOutputSchema = {
  type: "object",
  properties: {
    type: { type: "string", const: "preferences" },
    preferences: { type: "object" },
  },
  required: ["type", "preferences"],
  additionalProperties: false,
};

const server = new Server({
  tools: {
    get_preferences: {
      inputSchema: jsonSchema.object({ userId: jsonSchema.string() }),
      outputSchema: preferencesOutputSchema,
      async run({ userId }) {
        const preferences = await readPreferences(userId);
        return { structuredContent: { type: "preferences", preferences } };
      },
    },
    set_preferences: {
      inputSchema: jsonSchema.object({
        userId: jsonSchema.string(),
        preferences: jsonSchema.object({}),
      }),
      outputSchema: preferencesOutputSchema,
      async run({ userId, preferences }) {
        const updated = await writePreferences(userId, preferences);
        return {
          structuredContent: { type: "preferences", preferences: updated },
        };
      },
    },
  },
});
```

---

## Summary

- Store **business data** on the server.
- Store **UI state** inside the widget (React state, signals, etc.). Use `ui/update-model-context` when the model needs to see UI state, and use `window.openai.widgetState` / `window.openai.setWidgetState` only when you need ChatGPT widget-state persistence (optional).
- Store **cross-session state** in backend storage you control.
- Widget state persists only for the widget instance belonging to a specific message.
- Avoid using `localStorage` for core state.
``````
:::
:::

