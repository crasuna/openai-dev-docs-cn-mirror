---
title: "快速开始"
description: "Build and connect your first app to ChatGPT."
outline: deep
---

# 快速开始

**文档集**：Apps SDK  
**分组**：Apps SDK — Quickstart  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/quickstart](https://developers.openai.com/apps-sdk/quickstart)
- Markdown 来源：[https://developers.openai.com/apps-sdk/quickstart.md](https://developers.openai.com/apps-sdk/quickstart.md)
- 抓取时间：2026-06-27T05:54:49.764Z
- Checksum：`eaef24b383c953cb095bd477662bd6b2e68faa6d8c6daae2615c711c9d0054a7`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 介绍

使用 Apps SDK 构建的应用通过 [Model Context Protocol (MCP)](/mirror/apps-sdk/concepts/mcp-server) 连接到 ChatGPT。要使用 Apps SDK 为 ChatGPT 构建应用，你需要：

1. 一个 Model Context Protocol (MCP) server（必需），用于定义你的应用能力（工具）并将其暴露给 ChatGPT。
2. （可选）一个使用你所选框架构建的 web component；如果你需要 UI，它会在 ChatGPT 内的 iframe 中渲染。

ChatGPT 实现了开放的 MCP Apps UI 标准，因此你可以构建一次 UI，并在兼容 MCP Apps 的 hosts 中运行。

在本快速开始中，我们将构建一个简单的待办清单应用，它包含在单个 HTML 文件中，将标记、CSS 和 JavaScript 放在一起。

要查看使用 React 的更高级示例，请参见 [GitHub 上的示例仓库](https://github.com/openai/openai-apps-sdk-examples)。

## 构建 Web 组件

此步骤是可选的。如果你只需要 tools 而不需要 ChatGPT UI，请跳到
  [构建 MCP 服务器](/mirror/apps-sdk/quickstart#%E6%9E%84%E5%BB%BA-mcp-%E6%9C%8D%E5%8A%A1%E5%99%A8)，并且不要注册 UI 资源。

我们先在新目录中创建一个名为 `public/todo-widget.html` 的文件，它将作为 Apps SDK 在 ChatGPT 中渲染的 UI。
此文件将包含会在 ChatGPT 界面中渲染的 Web 组件。

添加以下内容：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Todo list</title>
    <style>
      :root {
        color: #0b0b0f;
        font-family:
          "Inter",
          system-ui,
          -apple-system,
          sans-serif;
      }

      html,
      body {
        width: 100%;
        min-height: 100%;
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 16px;
        background: #f6f8fb;
      }

      main {
        width: 100%;
        max-width: 360px;
        min-height: 260px;
        margin: 0 auto;
        background: #fff;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
      }

      h2 {
        margin: 0 0 16px;
        font-size: 1.25rem;
      }

      form {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      form input {
        flex: 1;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid #cad3e0;
        font-size: 0.95rem;
      }

      form button {
        border: none;
        border-radius: 10px;
        background: #111bf5;
        color: white;
        font-weight: 600;
        padding: 0 16px;
        cursor: pointer;
      }

      form button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      input[type="checkbox"] {
        accent-color: #111bf5;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      li {
        background: #f2f4fb;
        border-radius: 12px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      li span {
        flex: 1;
      }

      li[data-completed="true"] span {
        text-decoration: line-through;
        color: #6c768a;
      }

      li[data-busy="true"] {
        opacity: 0.7;
      }
    </style>
  </head>
  <body>
    <main>
      <h2>Todo list</h2>
      <form id="add-form" autocomplete="off">
        <input id="todo-input" name="title" placeholder="Add a task" />
        <button type="submit">Add</button>
      </form>
      <ul id="todo-list"></ul>
    </main>

    <script type="module">
      const listEl = document.querySelector("#todo-list");
      const formEl = document.querySelector("#add-form");
      const inputEl = document.querySelector("#todo-input");
      const addButtonEl = formEl.querySelector('button[type="submit"]');
      const addButtonText = addButtonEl.textContent;

      let tasks = [];
      let isAdding = false;
      const busyTodoIds = new Set();

      const render = () => {
        listEl.innerHTML = "";
        tasks.forEach((task) => {
          const li = document.createElement("li");
          li.dataset.id = task.id;
          li.dataset.completed = String(Boolean(task.completed));
          li.dataset.busy = String(busyTodoIds.has(task.id));

          const label = document.createElement("label");
          label.style.display = "flex";
          label.style.alignItems = "center";
          label.style.gap = "10px";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = Boolean(task.completed);
          checkbox.disabled = busyTodoIds.has(task.id);

          const span = document.createElement("span");
          span.textContent = task.title;

          label.appendChild(checkbox);
          label.appendChild(span);
          li.appendChild(label);
          listEl.appendChild(li);
        });
      };

      const updateFromResponse = (response) => {
        if (response?.structuredContent?.tasks) {
          tasks = response.structuredContent.tasks;
          render();
        }
      };

      // MCP Apps standard bridge: JSON-RPC messages over postMessage.
      //
      // - Initialize the bridge with `ui/initialize`.
      // - Confirm readiness with `ui/notifications/initialized`.
      // - Call tools with `tools/call`.
      // - Listen for `ui/notifications/tool-result` to react to model-initiated tool calls.
      let rpcId = 0;
      const pendingRequests = new Map();

      const rpcNotify = (method, params) => {
        window.parent.postMessage({ jsonrpc: "2.0", method, params }, "*");
      };

      const rpcRequest = (method, params) =>
        new Promise((resolve, reject) => {
          const id = ++rpcId;
          pendingRequests.set(id, { resolve, reject });
          window.parent.postMessage(
            { jsonrpc: "2.0", id, method, params },
            "*"
          );
        });

      window.addEventListener(
        "message",
        (event) => {
          if (event.source !== window.parent) return;
          const message = event.data;
          if (!message || message.jsonrpc !== "2.0") return;

          // Responses
          if (typeof message.id === "number") {
            const pending = pendingRequests.get(message.id);
            if (!pending) return;
            pendingRequests.delete(message.id);

            if (message.error) {
              pending.reject(message.error);
              return;
            }

            pending.resolve(message.result);
            return;
          }

          // Notifications
          if (typeof message.method !== "string") return;
          if (message.method === "ui/notifications/tool-result") {
            updateFromResponse(message.params);
          }
        },
        { passive: true }
      );

      const initializeBridge = async () => {
        const appInfo = { name: "todo-widget", version: "0.1.0" };
        const appCapabilities = {};
        const protocolVersion = "2026-01-26";

        try {
          await rpcRequest("ui/initialize", {
            appInfo,
            appCapabilities,
            protocolVersion,
          });
          rpcNotify("ui/notifications/initialized", {});
        } catch (error) {
          console.error("Failed to initialize the MCP Apps bridge:", error);
          throw error;
        }
      };

      const bridgeReady = initializeBridge();

      const callTodoTool = async (name, payload) => {
        await bridgeReady;
        const response = await rpcRequest("tools/call", {
          name,
          arguments: payload,
        });
        updateFromResponse(response);
      };

      formEl.addEventListener("submit", async (event) => {
        event.preventDefault();
        const title = inputEl.value.trim();
        if (!title || isAdding) return;

        isAdding = true;
        addButtonEl.disabled = true;
        addButtonEl.textContent = "Adding…";

        try {
          await callTodoTool("add_todo", { title });
          inputEl.value = "";
        } catch (error) {
          console.error("Failed to add todo:", error);
        } finally {
          isAdding = false;
          addButtonEl.disabled = false;
          addButtonEl.textContent = addButtonText;
        }
      });

      listEl.addEventListener("change", async (event) => {
        const checkbox = event.target;
        if (!checkbox.matches('input[type="checkbox"]')) return;
        const id = checkbox.closest("li")?.dataset.id;
        if (!id) return;

        if (!checkbox.checked) {
          checkbox.checked = true;
          return;
        }

        if (busyTodoIds.has(id)) return;
        busyTodoIds.add(id);
        checkbox.disabled = true;
        const rowEl = checkbox.closest("li");
        if (rowEl) rowEl.dataset.busy = "true";

        try {
          await callTodoTool("complete_todo", { id });
        } catch (error) {
          console.error("Failed to complete todo:", error);
        } finally {
          busyTodoIds.delete(id);
          render();
        }
      });

      render();
    </script>
  </body>
</html>
```

### 在 Web 组件中使用 Apps SDK

对于新的应用，请使用 MCP Apps host bridge：基于 `postMessage` 的 JSON-RPC，并配合 `ui/*` notification 和 method，例如 `tools/call`。

ChatGPT 会继续支持 Apps SDK compatibility 和可选的 ChatGPT extensions。
详情请参见 [MCP Apps compatibility in ChatGPT](/mirror/apps-sdk/mcp-apps-in-chatgpt)。

## 构建 MCP 服务器

安装官方 Python 或 Node MCP SDK，以创建 server 并暴露 `/mcp` endpoint。

在本快速开始中，我们将使用 [Node SDK](https://github.com/modelcontextprotocol/typescript-sdk)。

如果你使用 Python，请参考我们的 [GitHub 示例仓库](https://github.com/openai/openai-apps-sdk-examples)，查看使用 Python SDK 的 MCP 服务器示例。

安装 Node SDK、MCP Apps helpers 和 Zod：

```bash
npm install @modelcontextprotocol/sdk @modelcontextprotocol/ext-apps zod
```

### 带 Apps SDK 资源的 MCP 服务器

为你的 component bundle 注册 resource，并注册模型可调用的工具（例如 `add_todo` 和 `complete_todo`），以便 ChatGPT 驱动 UI。

创建名为 `server.js` 的文件，并粘贴下面使用 Node SDK 的示例：

```js






const todoHtml = readFileSync("public/todo-widget.html", "utf8");

const addTodoInputSchema = {
  title: z.string().min(1),
};

const completeTodoInputSchema = {
  id: z.string().min(1),
};

const todoOutputSchema = {
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean(),
    })
  ),
};

let todos = [];
let nextId = 1;

const replyWithTodos = (message) => ({
  content: message ? [{ type: "text", text: message }] : [],
  structuredContent: { tasks: todos },
});

function createTodoServer() {
  const server = new McpServer({ name: "todo-app", version: "0.1.0" });

  registerAppResource(
    server,
    "todo-widget",
    "ui://widget/todo.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/todo.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: todoHtml,
        },
      ],
    })
  );

  registerAppTool(
    server,
    "add_todo",
    {
      title: "Add todo",
      description: "Creates a todo item with the given title.",
      inputSchema: addTodoInputSchema,
      outputSchema: todoOutputSchema,
      _meta: {
        ui: { resourceUri: "ui://widget/todo.html" },
      },
    },
    async (args) => {
      const title = args?.title?.trim?.() ?? "";
      if (!title) return replyWithTodos("Missing title.");
      const todo = { id: `todo-${nextId++}`, title, completed: false };
      todos = [...todos, todo];
      return replyWithTodos(`Added "${todo.title}".`);
    }
  );

  registerAppTool(
    server,
    "complete_todo",
    {
      title: "Complete todo",
      description: "Marks a todo as done by id.",
      inputSchema: completeTodoInputSchema,
      outputSchema: todoOutputSchema,
      _meta: {
        ui: { resourceUri: "ui://widget/todo.html" },
      },
    },
    async (args) => {
      const id = args?.id;
      if (!id) return replyWithTodos("Missing todo id.");
      const todo = todos.find((task) => task.id === id);
      if (!todo) {
        return replyWithTodos(`Todo ${id} was not found.`);
      }

      todos = todos.map((task) =>
        task.id === id ? { ...task, completed: true } : task
      );

      return replyWithTodos(`Completed "${todo.title}".`);
    }
  );

  return server;
}

const port = Number(process.env.PORT ?? 8787);
const MCP_PATH = "/mcp";

const httpServer = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/plain" }).end("Todo MCP server");
    return;
  }

  const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
  if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

    const server = createTodoServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
      enableJsonResponse: true,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.writeHead(500).end("Internal server error");
      }
    }
    return;
  }

  res.writeHead(404).end("Not Found");
});

httpServer.listen(port, () => {
  console.log(
    `Todo MCP server listening on http://localhost:${port}${MCP_PATH}`
  );
});
```

此 snippet 还会响应 `GET /` 以用于 health check，为 `/mcp` 以及 `/mcp/actions` 等嵌套路由处理 CORS preflight，并对你尚未使用的 OAuth discovery route 返回 `404 Not Found`。这样在你不使用认证进行迭代时，ChatGPT 的 connector wizard 就不会显示 502 错误。

## 本地运行

如果你使用 React 这样的 web framework，请将组件构建为 static assets，以便 HTML template 可以内联它们。
通常，你可以运行 `npm run build` 这样的构建命令，生成包含编译后 assets 的 `dist` directory。

在本快速开始中，由于我们使用原生 HTML，因此不需要构建步骤。

请从包含 `server.js`（或 `server.ts`）的目录启动位于 `http://localhost:&lt;port&gt;/mcp` 的 MCP server。

确保你的 `package.json` 文件中有 `"type": "module"`：

```json
{
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.20.2",
    "@modelcontextprotocol/ext-apps": "^1.0.1",
    "zod": "^3.25.76"
  }
}
```

然后用以下命令运行 server：

```bash
node server.js
```

server 准备就绪后，应打印 `Todo MCP server listening on http://localhost:8787/mcp`。

### 使用 MCP Inspector 测试

你可以使用 [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) 在本地测试 server。

```bash
npx @modelcontextprotocol/inspector@latest --server-url http://localhost:8787/mcp --transport http
```

这会打开一个带 MCP Inspector 界面的浏览器窗口。你可以用它测试服务器并查看工具响应。

![MCP Inspector](/openai-assets/developers.openai.com/images/apps-sdk/mcp_inspector.png)

### 将你的 server 暴露到公网

为了让 ChatGPT 在开发期间访问你的 server，你需要将其暴露到公共互联网。你可以使用 [ngrok](https://ngrok.com/) 这样的工具，为本地 server 打开 tunnel。

```bash
ngrok http <port>
```

这会提供一个类似 `https://&lt;subdomain&gt;.ngrok.app` 的 public URL，你可以用它从 ChatGPT 访问你的 server。

添加 connector 时，请提供带 `/mcp` path 的 public URL（例如 `https://&lt;subdomain&gt;.ngrok.app/mcp`）。

## 将你的应用添加到 ChatGPT

一旦你的 MCP server 和 web component 已经在本地正常工作，你可以通过以下步骤将 app 添加到 ChatGPT：

1. 在 ChatGPT 的 **Settings → Apps & Connectors → Advanced settings** 下启用 [developer mode](https://platform.openai.com/docs/guides/developer-mode)。
2. 点击 **Create** 按钮，在 **Settings → Connectors** 下添加 connector，并粘贴来自 tunnel 或 deployment 的 HTTPS + `/mcp` URL（例如 `https://&lt;subdomain&gt;.ngrok.app/mcp`）。
3. 命名 connector，提供简短描述，然后点击 **Create**。


  &lt;img src="https://developers.openai.com/images/apps-sdk/new_connector.jpg"
    alt="Add your connector to ChatGPT"
  /&gt;


4. 打开新 chat，从 **More** menu（点击 **+** 按钮后可访问）添加你的 connector，并提示模型（例如，“Add a new task to read my book”）。ChatGPT 会 stream 工具 payload，以便你确认输入和输出。

![Add your connector to a conversation](/openai-assets/developers.openai.com/images/apps-sdk/developer_mode_more.jpg)

## 后续步骤

从这里开始，你可以继续迭代 UI/UX、prompts、tool metadata 和整体体验。

每次更改 MCP server（工具、metadata 等）后，请刷新 connector。你可以在选择 connector 后，点击 **Settings →
  Connectors** 中的 **Refresh** 按钮完成刷新。

准备提交时，请查看 [ChatGPT 应用提交指南](/mirror/apps-sdk/app-submission-guidelines) 并[研究你的使用场景](/mirror/apps-sdk/plan/use-case)。如果你正在构建 UI，也可以查看 [设计指南](https://developers.openai.com/apps-sdk/concepts/design-guidelines)。

掌握基础后，你可以利用 Apps SDK primitive [构建 ChatGPT UI](/mirror/apps-sdk/build/chatgpt-ui)、在需要时[认证用户](/mirror/apps-sdk/build/auth)，并[持久化状态](https://developers.openai.com/apps-sdk/build/storage)。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
## Introduction

Apps built with the Apps SDK use the [Model Context Protocol (MCP)](https://developers.openai.com/apps-sdk/concepts/mcp-server) to connect to ChatGPT. To build an app for ChatGPT with the Apps SDK, you need:

1. A Model Context Protocol (MCP) server (required) that defines your app's capabilities (tools) and exposes them to ChatGPT.
2. (Optional) A web component built with the framework of your choice, rendered in an iframe inside ChatGPT if you want a UI.

ChatGPT implements the open MCP Apps UI standard so you can build your UI once
and run it across MCP Apps-compatible hosts.

In this quickstart, we'll build a simple to-do list app, contained in a single HTML file that keeps the markup, CSS, and JavaScript together.

To see more advanced examples using React, see the [examples repository on GitHub](https://github.com/openai/openai-apps-sdk-examples).

## Build a web component

This step is optional. If you only need tools and no ChatGPT UI, skip to
  [Build an MCP server](#build-an-mcp-server) and do not register a UI resource.

Let's start by creating a file called `public/todo-widget.html` in a new directory that will be the UI rendered by the Apps SDK in ChatGPT.
This file will contain the web component that will be rendered in the ChatGPT interface.

Add the following content:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Todo list</title>
    <style>
      :root {
        color: #0b0b0f;
        font-family:
          "Inter",
          system-ui,
          -apple-system,
          sans-serif;
      }

      html,
      body {
        width: 100%;
        min-height: 100%;
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 16px;
        background: #f6f8fb;
      }

      main {
        width: 100%;
        max-width: 360px;
        min-height: 260px;
        margin: 0 auto;
        background: #fff;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
      }

      h2 {
        margin: 0 0 16px;
        font-size: 1.25rem;
      }

      form {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      form input {
        flex: 1;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid #cad3e0;
        font-size: 0.95rem;
      }

      form button {
        border: none;
        border-radius: 10px;
        background: #111bf5;
        color: white;
        font-weight: 600;
        padding: 0 16px;
        cursor: pointer;
      }

      form button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      input[type="checkbox"] {
        accent-color: #111bf5;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      li {
        background: #f2f4fb;
        border-radius: 12px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      li span {
        flex: 1;
      }

      li[data-completed="true"] span {
        text-decoration: line-through;
        color: #6c768a;
      }

      li[data-busy="true"] {
        opacity: 0.7;
      }
    </style>
  </head>
  <body>
    <main>
      <h2>Todo list</h2>
      <form id="add-form" autocomplete="off">
        <input id="todo-input" name="title" placeholder="Add a task" />
        <button type="submit">Add</button>
      </form>
      <ul id="todo-list"></ul>
    </main>

    <script type="module">
      const listEl = document.querySelector("#todo-list");
      const formEl = document.querySelector("#add-form");
      const inputEl = document.querySelector("#todo-input");
      const addButtonEl = formEl.querySelector('button[type="submit"]');
      const addButtonText = addButtonEl.textContent;

      let tasks = [];
      let isAdding = false;
      const busyTodoIds = new Set();

      const render = () => {
        listEl.innerHTML = "";
        tasks.forEach((task) => {
          const li = document.createElement("li");
          li.dataset.id = task.id;
          li.dataset.completed = String(Boolean(task.completed));
          li.dataset.busy = String(busyTodoIds.has(task.id));

          const label = document.createElement("label");
          label.style.display = "flex";
          label.style.alignItems = "center";
          label.style.gap = "10px";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = Boolean(task.completed);
          checkbox.disabled = busyTodoIds.has(task.id);

          const span = document.createElement("span");
          span.textContent = task.title;

          label.appendChild(checkbox);
          label.appendChild(span);
          li.appendChild(label);
          listEl.appendChild(li);
        });
      };

      const updateFromResponse = (response) => {
        if (response?.structuredContent?.tasks) {
          tasks = response.structuredContent.tasks;
          render();
        }
      };

      // MCP Apps standard bridge: JSON-RPC messages over postMessage.
      //
      // - Initialize the bridge with `ui/initialize`.
      // - Confirm readiness with `ui/notifications/initialized`.
      // - Call tools with `tools/call`.
      // - Listen for `ui/notifications/tool-result` to react to model-initiated tool calls.
      let rpcId = 0;
      const pendingRequests = new Map();

      const rpcNotify = (method, params) => {
        window.parent.postMessage({ jsonrpc: "2.0", method, params }, "*");
      };

      const rpcRequest = (method, params) =>
        new Promise((resolve, reject) => {
          const id = ++rpcId;
          pendingRequests.set(id, { resolve, reject });
          window.parent.postMessage(
            { jsonrpc: "2.0", id, method, params },
            "*"
          );
        });

      window.addEventListener(
        "message",
        (event) => {
          if (event.source !== window.parent) return;
          const message = event.data;
          if (!message || message.jsonrpc !== "2.0") return;

          // Responses
          if (typeof message.id === "number") {
            const pending = pendingRequests.get(message.id);
            if (!pending) return;
            pendingRequests.delete(message.id);

            if (message.error) {
              pending.reject(message.error);
              return;
            }

            pending.resolve(message.result);
            return;
          }

          // Notifications
          if (typeof message.method !== "string") return;
          if (message.method === "ui/notifications/tool-result") {
            updateFromResponse(message.params);
          }
        },
        { passive: true }
      );

      const initializeBridge = async () => {
        const appInfo = { name: "todo-widget", version: "0.1.0" };
        const appCapabilities = {};
        const protocolVersion = "2026-01-26";

        try {
          await rpcRequest("ui/initialize", {
            appInfo,
            appCapabilities,
            protocolVersion,
          });
          rpcNotify("ui/notifications/initialized", {});
        } catch (error) {
          console.error("Failed to initialize the MCP Apps bridge:", error);
          throw error;
        }
      };

      const bridgeReady = initializeBridge();

      const callTodoTool = async (name, payload) => {
        await bridgeReady;
        const response = await rpcRequest("tools/call", {
          name,
          arguments: payload,
        });
        updateFromResponse(response);
      };

      formEl.addEventListener("submit", async (event) => {
        event.preventDefault();
        const title = inputEl.value.trim();
        if (!title || isAdding) return;

        isAdding = true;
        addButtonEl.disabled = true;
        addButtonEl.textContent = "Adding…";

        try {
          await callTodoTool("add_todo", { title });
          inputEl.value = "";
        } catch (error) {
          console.error("Failed to add todo:", error);
        } finally {
          isAdding = false;
          addButtonEl.disabled = false;
          addButtonEl.textContent = addButtonText;
        }
      });

      listEl.addEventListener("change", async (event) => {
        const checkbox = event.target;
        if (!checkbox.matches('input[type="checkbox"]')) return;
        const id = checkbox.closest("li")?.dataset.id;
        if (!id) return;

        if (!checkbox.checked) {
          checkbox.checked = true;
          return;
        }

        if (busyTodoIds.has(id)) return;
        busyTodoIds.add(id);
        checkbox.disabled = true;
        const rowEl = checkbox.closest("li");
        if (rowEl) rowEl.dataset.busy = "true";

        try {
          await callTodoTool("complete_todo", { id });
        } catch (error) {
          console.error("Failed to complete todo:", error);
        } finally {
          busyTodoIds.delete(id);
          render();
        }
      });

      render();
    </script>
  </body>
</html>
```

### Using the Apps SDK in your web component

For new apps, use the MCP Apps host bridge: JSON-RPC over `postMessage`
with `ui/*` notifications and methods such as `tools/call`.

ChatGPT continues to support Apps SDK compatibility and optional ChatGPT
extensions.
For details, see [MCP Apps compatibility in ChatGPT](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt).

## Build an MCP server

Install the official Python or Node MCP SDK to create a server and expose a `/mcp` endpoint.

In this quickstart, we'll use the [Node SDK](https://github.com/modelcontextprotocol/typescript-sdk).

If you're using Python, refer to our [examples repository on GitHub](https://github.com/openai/openai-apps-sdk-examples) to see an example MCP server with the Python SDK.

Install the Node SDK, MCP Apps helpers, and Zod with:

```bash
npm install @modelcontextprotocol/sdk @modelcontextprotocol/ext-apps zod
```

### MCP server with Apps SDK resources

Register a resource for your component bundle and the tools the model can call (e.g. `add_todo` and `complete_todo`) so ChatGPT can drive the UI.

Create a file named `server.js` and paste the following example that uses the Node SDK:

```js







const todoHtml = readFileSync("public/todo-widget.html", "utf8");

const addTodoInputSchema = {
  title: z.string().min(1),
};

const completeTodoInputSchema = {
  id: z.string().min(1),
};

const todoOutputSchema = {
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean(),
    })
  ),
};

let todos = [];
let nextId = 1;

const replyWithTodos = (message) => ({
  content: message ? [{ type: "text", text: message }] : [],
  structuredContent: { tasks: todos },
});

function createTodoServer() {
  const server = new McpServer({ name: "todo-app", version: "0.1.0" });

  registerAppResource(
    server,
    "todo-widget",
    "ui://widget/todo.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/todo.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: todoHtml,
        },
      ],
    })
  );

  registerAppTool(
    server,
    "add_todo",
    {
      title: "Add todo",
      description: "Creates a todo item with the given title.",
      inputSchema: addTodoInputSchema,
      outputSchema: todoOutputSchema,
      _meta: {
        ui: { resourceUri: "ui://widget/todo.html" },
      },
    },
    async (args) => {
      const title = args?.title?.trim?.() ?? "";
      if (!title) return replyWithTodos("Missing title.");
      const todo = { id: `todo-${nextId++}`, title, completed: false };
      todos = [...todos, todo];
      return replyWithTodos(`Added "${todo.title}".`);
    }
  );

  registerAppTool(
    server,
    "complete_todo",
    {
      title: "Complete todo",
      description: "Marks a todo as done by id.",
      inputSchema: completeTodoInputSchema,
      outputSchema: todoOutputSchema,
      _meta: {
        ui: { resourceUri: "ui://widget/todo.html" },
      },
    },
    async (args) => {
      const id = args?.id;
      if (!id) return replyWithTodos("Missing todo id.");
      const todo = todos.find((task) => task.id === id);
      if (!todo) {
        return replyWithTodos(`Todo ${id} was not found.`);
      }

      todos = todos.map((task) =>
        task.id === id ? { ...task, completed: true } : task
      );

      return replyWithTodos(`Completed "${todo.title}".`);
    }
  );

  return server;
}

const port = Number(process.env.PORT ?? 8787);
const MCP_PATH = "/mcp";

const httpServer = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/plain" }).end("Todo MCP server");
    return;
  }

  const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
  if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

    const server = createTodoServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
      enableJsonResponse: true,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.writeHead(500).end("Internal server error");
      }
    }
    return;
  }

  res.writeHead(404).end("Not Found");
});

httpServer.listen(port, () => {
  console.log(
    `Todo MCP server listening on http://localhost:${port}${MCP_PATH}`
  );
});
```

This snippet also responds to `GET /` for health checks, handles CORS preflight for `/mcp` and nested routes like `/mcp/actions`, and returns `404 Not Found` for OAuth discovery routes you are not using yet. That keeps ChatGPT’s connector wizard from surfacing 502 errors while you iterate without authentication.

## Run locally

If you're using a web framework like React, build your component into static assets so the HTML template can inline them.
Usually, you can run a build command such as `npm run build` to produce a `dist` directory with your compiled assets.

In this quickstart, since we're using vanilla HTML, no build step is required.

Start the MCP server on `http://localhost:<port>/mcp` from the directory that contains `server.js` (or `server.ts`).

Make sure you have `"type": "module"` in your `package.json` file:

```json
{
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.20.2",
    "@modelcontextprotocol/ext-apps": "^1.0.1",
    "zod": "^3.25.76"
  }
}
```

Then run the server with the following command:

```bash
node server.js
```

The server should print `Todo MCP server listening on http://localhost:8787/mcp` once it is ready.

### Test with MCP Inspector

You can use the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) to test your server locally.

```bash
npx @modelcontextprotocol/inspector@latest --server-url http://localhost:8787/mcp --transport http
```

This will open a browser window with the MCP Inspector interface. You can use this to test your server and see the tool responses.

![MCP Inspector](https://developers.openai.com/images/apps-sdk/mcp_inspector.png)

### Expose your server to the public internet

For ChatGPT to access your server during development, you need to expose it to the public internet. You can use a tool such as [ngrok](https://ngrok.com/) to open a tunnel to your local server.

```bash
ngrok http <port>
```

This will give you a public URL like `https://<subdomain>.ngrok.app` that you can use to access your server from ChatGPT.

When you add your connector, provide the public URL with the `/mcp` path (e.g. `https://<subdomain>.ngrok.app/mcp`).

## Add your app to ChatGPT

Once you have your MCP server and web component working locally, you can add your app to ChatGPT with the following steps:

1. Enable [developer mode](https://platform.openai.com/docs/guides/developer-mode) under **Settings → Apps & Connectors → Advanced settings** in ChatGPT.
2. Click the **Create** button to add a connector under **Settings → Connectors** and paste the HTTPS + `/mcp` URL from your tunnel or deployment (e.g. `https://<subdomain>.ngrok.app/mcp`).
3. Name the connector, provide a short description and click **Create**.

<div style={{ width: "50%", margin: "0 auto", display: "block" }}>
  <img src="https://developers.openai.com/images/apps-sdk/new_connector.jpg"
    alt="Add your connector to ChatGPT"
  />
</div>

4. Open a new chat, add your connector from the **More** menu (accessible after clicking the **+** button), and prompt the model (e.g., “Add a new task to read my book”). ChatGPT will stream tool payloads so you can confirm inputs and outputs.

![Add your connector to a conversation](https://developers.openai.com/images/apps-sdk/developer_mode_more.jpg)

## Next steps

From there, you can iterate on the UI/UX, prompts, tool metadata, and the overall experience.

Refresh the connector after each change to the MCP server (tools, metadata,
  etc.) You can do this by clicking the **Refresh** button in **Settings →
  Connectors** after selecting your connector.

When you're preparing for submission, review the [ChatGPT app submission guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines) and [research your use case](https://developers.openai.com/apps-sdk/plan/use-case). If you're building a UI, you can also review the [design guidelines](https://developers.openai.com/apps-sdk/concepts/design-guidelines).

Once you understand the basics, you can leverage the Apps SDK to [build a ChatGPT UI](https://developers.openai.com/apps-sdk/build/chatgpt-ui) using the Apps SDK primitives, [authenticate users](https://developers.openai.com/apps-sdk/build/auth) if needed, and [persist state](https://developers.openai.com/apps-sdk/build/storage).
``````
:::
:::

