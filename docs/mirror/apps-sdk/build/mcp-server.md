---
title: "构建你的 MCP server"
description: "Wire tools, templates, and the widget runtime that powers ChatGPT Apps."
outline: deep
---

# 构建你的 MCP server

**文档集**：Apps SDK\
**分组**：构建\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/build/mcp-server](https://developers.openai.com/apps-sdk/build/mcp-server)
- Markdown 来源：[https://developers.openai.com/apps-sdk/build/mcp-server.md](https://developers.openai.com/apps-sdk/build/mcp-server.md)
- 抓取时间：2026-06-27T05:54:46.503Z
- Checksum：`bb626cfd264bd61ac082c71c50b8fbd0ec4da8c3daef50148c68fbcaa92bd527`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
读完本指南后，你将知道如何把后端 MCP server 连接到 ChatGPT、定义 tools、注册 UI templates，并使用 widget runtime 把所有部分串联起来。你将为一个 ChatGPT App 构建可工作的基础：它会返回结构化数据、渲染交互式 widget，并让 model、server 和 UI 保持同步。如果你更想直接进入实现，可以跳到末尾的 [示例](/mirror/apps-sdk/build/mcp-server#example)。

使用 [OpenAI Docs MCP server](https://developers.openai.com/learn/docs-mcp)，在你的 editor 中更快构建。

## 概览

### MCP server 为你的应用做什么

ChatGPT Apps 有三个组件：

- **你的 MCP server** 定义 tools、提供可选 server instructions、强制 auth、返回数据，并把每个 tool 指向 UI bundle。
- **widget/UI bundle** 在 ChatGPT 的 iframe 中渲染，并通过 MCP Apps UI bridge（JSON-RPC over `postMessage`）与 host 通信。
- **模型** 决定何时调用 tools，并使用你返回的 structured data 叙述体验。

扎实的 server implementation 会保持这些边界清晰，这样你就可以独立迭代 UI 和数据。请记住：你构建 MCP server 并定义 tools，但 ChatGPT 的模型会根据你提供的 metadata 选择何时调用它们。

### 开始之前

先决条件：

- 熟悉 TypeScript 或 Python，以及 web bundler（Vite、esbuild 等）。
- MCP server 可通过 HTTP 访问（从本地开始也可以）。
- 已构建的 UI bundle，导出 root script（React 或 vanilla）。

示例 project layout：

```
your-chatgpt-app/
├─ server/
│  └─ src/index.ts          # MCP server + tool handlers
├─ web/
│  ├─ src/component.tsx     # React widget
│  └─ dist/app.{js,css}  # Bundled assets referenced by the server
└─ package.json
```

## 架构流程

1. 用户提示让 ChatGPT 调用你的某个 MCP tools。
2. 你的 server 运行 handler、获取权威数据，并返回 `structuredContent`、`_meta` 和 UI metadata。
3. ChatGPT 加载 tool descriptor 中链接的 HTML template（作为 `text/html;profile=mcp-app` 提供），并通过 MCP Apps bridge（例如 `ui/notifications/tool-result`）把 tool inputs/results 传递给 iframe。
4. widget 基于 tool results 渲染，可以用 `tools/call` 再次调用 tools，并可在需要时使用 ChatGPT-only extensions。
5. 模型读取 `structuredContent` 来叙述发生了什么，因此请保持其紧凑且幂等；ChatGPT 可能会重试 tool calls。

```
User prompt
   ↓
ChatGPT model ──► MCP tool call ──► Your server ──► Tool response (`structuredContent`, `_meta`, `content`)
   │                                                   │
   └───── renders narration ◄──── widget iframe ◄──────┘
                              (HTML template + MCP Apps bridge)
```

## 使用 MCP Apps UI bridge

ChatGPT 支持开放 MCP Apps standard 进行 UI 通信：

- JSON-RPC 2.0 messages over `postMessage`。
- 用于 host↔iframe UI communication 的 `ui/*` methods 和 notifications。
- 通过 `tools/call` 进行 MCP tool calls。

先从 MCP Apps bridge 开始，让你的 UI 可跨 hosts 移植，然后在需要 ChatGPT-specific capabilities 时添加 ChatGPT extensions。如需更深入 walkthrough 和 mapping guide，请参阅 [MCP Apps compatibility in ChatGPT](/mirror/apps-sdk/mcp-apps-in-chatgpt)。

## 理解 `window.openai` widget runtime

`window.openai` 是 Apps SDK compatibility layer，也是可选 ChatGPT extensions 的承载位置。对于新 apps，默认使用 MCP Apps bridge，并把 `window.openai` 视作提供 ChatGPT 独有附加能力的 API。

独有能力包括：

- **File handling（ChatGPT extension）：** `uploadFile`、`selectFiles` 和 `getFileDownloadUrl` 覆盖文件上传、选择和下载。
- **Host surfaces（ChatGPT extension）：** `requestModal` 打开 host-owned modal。
- **Commerce（ChatGPT extension）：** `requestCheckout` 打开 Instant Checkout（启用时）。

完整 `window.openai` reference 请参阅 [ChatGPT UI guide](/mirror/apps-sdk/build/chatgpt-ui#understand-the-windowopenai-api)。

当你需要 host-controlled overlay 时使用 `requestModal`，例如打开 checkout 或 detail view，并把它锚定到 “Add to cart” 按钮，让购物者无需强制 inline widget 调整大小即可查看选项。若要在 modal 中显示不同 UI template，请传入你已注册的 template URI（例如通过 `registerAppResource`）。

当这些 APIs 能实质改善你的 ChatGPT 体验时使用它们，但请让核心 UI bridge 建立在 MCP Apps standard 之上。实现模式请参阅 [Build your ChatGPT UI](/mirror/apps-sdk/build/chatgpt-ui)。

## 选择 SDK

Apps SDK 可与任何 MCP implementation 搭配使用，但官方 SDKs 是最快的入门方式。它们提供 tool/schema helpers、HTTP server scaffolding、resource registration utilities 和端到端 type safety，让你可以专注 business logic：

- **Python SDK** – 使用 FastMCP 或 FastAPI 快速迭代。Repo：[`modelcontextprotocol/python-sdk`](https://github.com/modelcontextprotocol/python-sdk)。
- **TypeScript SDK** – 当你的 stack 已经是 Node/React 时很理想。Repo：[`modelcontextprotocol/typescript-sdk`](https://github.com/modelcontextprotocol/typescript-sdk)，以 `@modelcontextprotocol/sdk` 发布。Docs 位于 [modelcontextprotocol.io](https://modelcontextprotocol.io/)。

安装与你后端语言匹配的 SDK，然后按照下面步骤继续。

```bash
# TypeScript / Node
npm install @modelcontextprotocol/sdk @modelcontextprotocol/ext-apps zod

# Python
pip install mcp
```

## 构建你的 MCP server

### 添加 server instructions 以提供跨工具指导

MCP servers 可以在 initialization 期间返回 [`instructions` field](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#initialization)。ChatGPT 和 Codex 会在决定如何与你的 server 协作时，将这些 instructions 与你的 tool metadata 一起使用。

使用 server instructions 提供适用于多个 tools 的指导，例如必需 tool sequences、shared rate limits，或工具之间的关系。保持指导简洁，并把最重要的细节放在前面；对于 ChatGPT 和 Codex，前 512 个字符应自包含。不要用 server instructions 重复每个 tool description，也不要改变模型 personality。

```ts


const server = new McpServer(
  { name: "kanban-server", version: "1.0.0" },
  {
    instructions:
      "Before updating a task, call list_tasks to validate the task ID. For bulk edits, process at most 10 tasks per request.",
  }
);
```

### Step 1 – 注册 component template

每个 UI bundle 都作为 MCP resource 暴露，使用 MCP Apps UI MIME type（`text/html;profile=mcp-app`）。如果你使用 `@modelcontextprotocol/ext-apps/server`，优先使用 `RESOURCE_MIME_TYPE`，而不是硬编码字符串。

注册 template，并包含用于 borders、domains 和 CSP rules 的 metadata：

```ts
// Registers the Kanban widget HTML entry point served to ChatGPT.




const server = new McpServer({ name: "kanban-server", version: "1.0.0" });
const HTML = readFileSync("web/dist/kanban.js", "utf8");
const CSS = readFileSync("web/dist/kanban.css", "utf8");

registerAppResource(
  server,
  "kanban-widget",
  "ui://widget/kanban-board.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/kanban-board.html",
        mimeType: RESOURCE_MIME_TYPE,
        text: `
<div id="kanban-root"></div>
<style>${CSS}</style>
<script type="module">${HTML}</script>
        `.trim(),
        _meta: {
          ui: {
            prefersBorder: true,
            domain: "https://myapp.example.com",
            csp: {
              connectDomains: ["https://api.myapp.example.com"], // example API domain
              resourceDomains: ["https://*.oaistatic.com"], // example CDN allowlist
              // Optional: allow embedding specific iframe origins.
              frameDomains: ["https://*.example-embed.com"],
            },
          },
        },
      },
    ],
  })
);
```

如果你需要在 widget 内部嵌入 iframes，请使用 `_meta.ui.csp.frameDomains` 声明 origins allowlist。未设置 `frameDomains` 时，subframes 默认被阻止。由于 iframe content 更难供我们检查，启用 subframes 的 widgets 会受到额外审查，并且可能无法获准 directory distribution。

**最佳实践：** 当你以 breaking way 更改 widget 的 HTML/JS/CSS 时，请给 template 一个新 URI（或使用新文件名），这样 ChatGPT 总会加载更新后的 bundle，而不是缓存版本。

请把 URI 视作你的 cache key。当你更新 markup 或 bundle 时，请 version 该 URI，并更新所有对它的引用（例如 `registerAppResource` URI、tool descriptor 中的 `_meta.ui.resourceUri`，以及 template list 中的 `contents[].uri`）。ChatGPT 会把 `_meta["openai/outputTemplate"]` 作为 OpenAI-specific compatibility alias 处理。

```ts
// Old
contents: [{ uri: "ui://widget/kanban-board.html" /* ... */ }];
// New
contents: [{ uri: "ui://widget/kanban-board-v2.html" /* ... */ }];
```

如果你频繁发布更新，请保持简短、一致的 versioning scheme，这样你可以 roll forward（或 back）而不复用同一个 URI。

### Step 2 – 描述工具

Tools 是模型推理所依据的 contract。为每个用户意图定义一个 tool（例如 `list_tasks`、`update_task`）。每个 descriptor 应包含：

- Machine-readable name 和 human-readable title。
- 参数 schema。使用下面展示的 Node helper 时，请使用 Zod raw shapes 或 Standard Schema；其他 SDKs 可能暴露 JSON Schema 或 dataclasses。
- 返回的 `structuredContent` schema（`outputSchema`），让 clients 和 models 知道 tool result 的形状。
- 指向 template URI 的 `_meta.ui.resourceUri`。
- 可选的 `_meta.ui.visibility`，用于控制工具可由模型、UI 或两者调用。
- 可选 ChatGPT extensions（例如工具运行时的短状态文本）。

_模型会检查这些 descriptors，以决定某个工具何时适合用户请求，因此请把 names、descriptions 和 schemas 视为 UX 的一部分。_

请把 handlers 设计为 **idempotent**，因为模型可能会重试调用。

```ts
// Example app that exposes a kanban-board tool with schema, metadata, and handler.



registerAppTool(
  server,
  "kanban-board",
  {
    title: "Show Kanban Board",
    inputSchema: { workspace: z.string() },
    outputSchema: {
      columns: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          tasks: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              status: z.string(),
            })
          ),
        })
      ),
    },
    _meta: {
      ui: { resourceUri: "ui://widget/kanban-board.html" },
      // ChatGPT extension (optional):
      // "openai/toolInvocation/invoking": "Preparing the board…",
      // "openai/toolInvocation/invoked": "Board ready.",
    },
  },
  async ({ workspace }) => {
    const board = await loadBoard(workspace);
    return {
      structuredContent: board.summary,
      content: [{ type: "text", text: `Showing board ${workspace}` }],
      _meta: board.details,
    };
  }
);
```

#### 记忆和工具调用

Memory 由用户控制，并由模型中介：模型在选择或参数化 tool call 时决定是否以及如何使用它。默认情况下，apps 的 memories 处于关闭状态。用户可以为 app 启用或禁用 memory。Apps 不会收到单独的 memory feed；它们只能看到模型包含在 tool inputs 中的内容。当 memory 关闭时，请求会在没有 memory 的模型上下文中重新评估。

&lt;img src="https://developers.openai.com/images/apps-sdk/memories.png"
  alt="ChatGPT 中的 Memory settings"
  class="w-full max-w-xl mx-auto rounded-lg"
/&gt;

**最佳实践**

- 保持 tool inputs 显式，并使正确性所需字段成为必填；不要依赖 memory 提供关键字段。
- 把 memory 当作 hint，而不是 authority；当用户偏好对你的 user flow 很重要且可能有 side effects 时，请确认这些偏好。
- 当缺少上下文时，提供 safe defaults 或询问后续问题。
- 让 tools 能抵御 retries、re-evaluation 或 missing memories。
- 对于写入或破坏性动作，请在当前轮次重新确认 intent 和关键参数。

### Step 3 – 返回结构化数据和 metadata

每个 tool response 都可以包含三个同级 payloads：

- **`structuredContent`** – widget 使用且模型会读取的简洁 JSON。只包含模型应看到的内容。
- **`content`** – 用于模型响应的可选叙述（Markdown 或 plaintext）。
- **`_meta`** – 仅供 widget 使用的大型或敏感数据。`_meta` 永远不会到达模型。

```ts
// Returns concise structuredContent for the model plus rich _meta for the widget.
async function loadKanbanBoard(workspace: string) {
  const tasks = await db.fetchTasks(workspace);
  return {
    structuredContent: {
      columns: ["todo", "in-progress", "done"].map((status) => ({
        id: status,
        title: status.replace("-", " "),
        tasks: tasks.filter((task) => task.status === status).slice(0, 5),
      })),
    },
    content: [
      {
        type: "text",
        text: "Here's the latest snapshot. Drag cards in the widget to update status.",
      },
    ],
    _meta: {
      tasksById: Object.fromEntries(tasks.map((task) => [task.id, task])),
      lastSyncedAt: new Date().toISOString(),
    },
  };
}
```

widget 会通过 MCP Apps bridge（例如 `ui/notifications/tool-result`）接收这些 payloads，而模型只会看到 `structuredContent` 和 `content`。

### Step 4 – 本地运行

1. 构建你的 UI bundle（在 `web/` 内运行 `npm run build`）。
2. 启动 MCP server（Node、Python 等）。
3. 尽早并经常使用 [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) 调用 `http://localhost:&lt;port&gt;/mcp`、列出 roots，并验证你的 widget 是否正确渲染。Inspector 会镜像 ChatGPT 的 widget runtime，并在部署前捕获问题。

对于 TypeScript project，通常如下：

```bash
npm run build       # compile server + widget
node dist/index.js  # start the compiled MCP server
```

### Step 5 – 暴露 HTTPS endpoint

ChatGPT 要求 HTTPS。开发期间，请使用 ngrok（或类似工具）tunnel localhost：

```bash
ngrok http <port>
# Forwarding: https://<subdomain>.ngrok.app -> http://127.0.0.1:<port>
```

在 ChatGPT developer mode 中创建 connector 时使用 ngrok URL。对于 production，请部署到低延迟 HTTPS host（Cloudflare Workers、Fly.io、Vercel、AWS 等）。



## 示例

下面是精简的 TypeScript server 和 vanilla widget。完整项目请参考公开的 [Apps SDK examples](https://github.com/openai/openai-apps-sdk-examples)。

```ts
// server/src/index.ts




const server = new McpServer({ name: "hello-world", version: "1.0.0" });

registerAppResource(
  server,
  "hello",
  "ui://widget/hello.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/hello.html",
        mimeType: RESOURCE_MIME_TYPE,
        text: `
<div id="root"></div>
<script type="module" src="https://example.com/hello-widget.js"></script>
      `.trim(),
      },
    ],
  })
);

registerAppTool(
  server,
  "hello_widget",
  {
    title: "Show hello widget",
    inputSchema: { name: z.string() },
    outputSchema: { message: z.string() },
    _meta: { ui: { resourceUri: "ui://widget/hello.html" } },
  },
  async ({ name }) => ({
    structuredContent: { message: `Hello ${name}!` },
    content: [{ type: "text", text: `Greeting ${name}` }],
    _meta: {},
  })
);
```

```js
// hello-widget.js
const root = document.getElementById("root");
root.textContent = "Loading…";

const update = (toolResult) => {
  const message = toolResult?.structuredContent?.message ?? "Hi!";
  root.textContent = message;
};

window.addEventListener(
  "message",
  (event) => {
    if (event.source !== window.parent) return;
    const message = event.data;
    if (!message || message.jsonrpc !== "2.0") return;
    if (message.method !== "ui/notifications/tool-result") return;
    update(message.params);
  },
  { passive: true }
);
```

## 故障排查

- **Widget doesn’t render** – 确保 template resource 返回 `mimeType: "text/html;profile=mcp-app"`，且 bundled JS/CSS URLs 能在 sandbox 内解析。
- **No `ui/*` messages arrive** – host 只会为 `text/html;profile=mcp-app` resources 启用 MCP Apps bridge；请仔细检查 MIME type，并确认 widget 已加载且没有 CSP violations。
- **CSP or CORS failures** – 使用 `_meta.ui.csp` 允许你获取内容的确切 domains；sandbox 会阻止其他一切。
- **Stale bundles keep loading** – 每当部署 breaking changes 时，cache-bust template URIs 或 file names。
- **Structured payloads are huge** – 将 `structuredContent` 裁剪到模型真正需要的内容；过大的 payloads 会降低模型性能并减慢渲染。



## 高级能力

### 组件发起的工具调用

使用 `tools/call` 直接从 UI 调用 tools。默认情况下，tools 同时可供模型和 UI 使用。使用 `_meta.ui.visibility` 限制工具可用位置。

```json
"_meta": {
  "ui": {
    "resourceUri": "ui://widget/kanban-board.html",
    "visibility": ["model", "app"]
  }
}
```

#### 工具可见性

若要让工具可从 UI 调用但对模型隐藏，请将 `_meta.ui.visibility` 设为 `["app"]`。这会让工具通过 `tools/call` 对 widget 可用，同时不影响模型的 tool selection。

```json
"_meta": {
  "ui": {
    "resourceUri": "ui://widget/kanban-board.html",
    "visibility": ["app"]
  }
}
```

### 工具注解和 elicitation

MCP tools 必须包含描述工具 _potential impact_ 的 [`tool annotations`](https://modelcontextprotocol.io/legacy/concepts/tools#tool-annotations)。这些 hints 是 tool definitions 的必需项。

我们关注三个 hints：

- `readOnlyHint`：对于只检索或计算信息，且不会在 ChatGPT 外部创建、更新、删除或发送数据的 tools（search、lookups、previews），设为 `true`。
- `openWorldHint`：对于只影响有边界目标的 tools（例如在你自己的产品中“按 id 更新 task”），设为 `false`。对于可以写入任意 URLs/files/resources 的 tools，保持 `true`。
- `destructiveHint`：对于可以删除、覆盖或具有不可逆 side effects 的 tools，设为 `true`。

`openWorldHint` 和 `destructiveHint` 只与 writes 相关（也就是当 `readOnlyHint=false` 时）。

准确设置这些 hints，确保工具影响被正确描述。

如果你省略这些 hints（或将其保留为 `null`），请将其视为 validation error，并更新 tool definition 以包含它们。

示例 tool descriptor：

```json
{
  "name": "update_task",
  "title": "Update task",
  "annotations": {
    "readOnlyHint": false,
    "openWorldHint": false,
    "destructiveHint": false
  }
}
```

### 文件处理

**ChatGPT extension（可选）：** 如果你的工具接受用户提供的文件，请使用 `_meta["openai/fileParams"]` 声明 file parameters。该值是应被视为文件的 top-level input schema fields 列表。不支持嵌套 file fields。

File params 描述 file handling 的输入侧：它们告诉 ChatGPT 哪些 tool arguments 包含 runtime 应授权并以 file references 传递的文件。

每个已声明 file param 会收到如下形状的 object：

```json
{
  "download_url": "https://...",
  "file_id": "file_...",
  "mime_type": "image/png",
  "file_name": "input.png"
}
```

`download_url` 和 `file_id` 是必需项。`mime_type` 和 `file_name` 是可选项。`download_url` 是临时的，只应在处理当前 tool call 时使用。如果 file reference 来自 widget upload、selected file 或另一个 tool result，请在需要从 ChatGPT 请求新的 download URL 时使用 `file_id`。

示例：

```ts



const imageFileSchema = z.object({
  download_url: z.string(),
  file_id: z.string(),
  mime_type: z.string().optional(),
  file_name: z.string().optional(),
});

registerAppTool(
  server,
  "process_image",
  {
    title: "process_image",
    description: "Processes an image",
    inputSchema: {
      imageToProcess: imageFileSchema,
    },
    outputSchema: {
      download_url: z.string(),
      file_id: z.string(),
      mime_type: z.string().optional(),
      file_name: z.string().optional(),
    },
    _meta: {
      ui: { resourceUri: "ui://widget/widget.html" },
      "openai/fileParams": ["imageToProcess"],
    },
  },
  async ({ imageToProcess }) => {
    return {
      content: [],
      structuredContent: {
        download_url: imageToProcess.download_url,
        file_id: imageToProcess.file_id,
        mime_type: imageToProcess.mime_type,
        file_name: imageToProcess.file_name,
      },
    };
  }
);
```

若要从 tool 返回可下载文件，请在 `structuredContent` 中包含 file reference，通常位于 `file_uri` 等字段下：

```json
{
  "structuredContent": {
    "file_uri": {
      "download_url": "https://...",
      "file_id": "file_...",
      "mime_type": "application/pdf",
      "file_name": "report.pdf"
    }
  }
}
```

这是 file handling 的输出侧。你的 tool 应返回 file reference，而不是 inline binary data 或 base64 content，当结果是可下载文件时尤其如此。ChatGPT 可以使用返回的 `file_id` 为 widget 提供新的临时 download URL。

ChatGPT 还支持作为 MCP [`resource_link`](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#resource-links) content 返回的可下载文件。对于应作为下载暴露给用户的 file outputs，请使用此方式。对于直接 web downloads，请按 MCP 定义返回 [`https://`](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#https) resource URI。ChatGPT 会在为用户下载该文件前引发用户批准。

### 内容安全策略（CSP）

在 widget resource 上设置 `_meta.ui.csp`，让 sandbox 知道应为 `connect-src`、`img-src`、`frame-src` 等允许哪些 domains。这是 broad distribution 前的必需项。

```json
"_meta": {
  "ui": {
    "csp": {
      "connectDomains": ["https://api.example.com"],
      "resourceDomains": ["https://persistent.oaistatic.com"],
      "frameDomains": ["https://*.example-embed.com"]
    }
  }
}
```

- `connectDomains` – 你的 widget 可以 fetch 的 hosts。
- `resourceDomains` – images、fonts、scripts 等 static assets 的 hosts。
- `frameDomains` – 可选；你的 widget 可以作为 iframes 嵌入的 hosts。没有 `frameDomains` 的 widgets 不能渲染 subframes。

如果你想使用 `window.openai.openExternal(...)` 而不看到 safe-link warning，请使用 `openai/widgetCSP` 下的 `redirect_domains` 字段。

注意：不鼓励使用 `frameDomains`，且只应在嵌入 iframes 是你体验核心时使用（例如 code editor 或 notebook environment）。声明 `frameDomains` 的 apps 在审核时会受到更高审查，并且很可能被拒绝或延后广泛分发。

### Widget domain

在 widget resource template（`registerAppResource` template）上设置 `_meta.ui.domain`。这是 app submission 的必需项，并且每个 app 必须唯一。ChatGPT 会在 `&lt;domain&gt;.web-sandbox.oaiusercontent.com` 下渲染 widget，这也会启用 fullscreen punch-out button。

```json
"_meta": {
  "ui": {
    "csp": {
      "connectDomains": ["https://api.example.com"],
      "resourceDomains": ["https://persistent.oaistatic.com"]
    },
    "domain": "https://myapp.example.com"
  }
}
```

### 组件描述

**ChatGPT extension（可选）：** 在 widget resource 上设置 `_meta["openai/widgetDescription"]`，让 widget 描述自己，从而减少 widget 下方的冗余文本。

```json
"_meta": {
  "ui": {
    "csp": {
      "connectDomains": ["https://api.example.com"],
      "resourceDomains": ["https://persistent.oaistatic.com"]
    },
    "domain": "https://myapp.example.com"
  },
  "openai/widgetDescription": "Shows an interactive zoo directory rendered by get_zoo_animals."
}
```

### 本地化内容

ChatGPT 会在 client request 中通过 `_meta["openai/locale"]`（以及 legacy key `_meta["webplus/i18n"]`）发送请求的 locale。使用 RFC 4647 matching 选择最接近的 supported locale，在响应中回显它，并相应格式化 numbers/dates。

### Client context hint

ChatGPT 也可能在 client request metadata 中发送 `_meta["openai/userAgent"]` 和 `_meta["openai/userLocation"]` 等 hints。这些对调整 analytics 或 formatting 可能有帮助，但 **绝不要** 依赖它们进行 authorization。请将 `_meta["openai/userAgent"]` 视为可选、best-effort metadata，而不是检测哪个 host surface 正在调用 server 的稳定方式。

当 templates、tools 和 widget runtime 都连接好后，优化 app 的最快方式就是使用 ChatGPT 本身：在真实对话中调用你的 tools、观察 logs，并用 browser devtools 调试 widget。一切看起来正常后，把 MCP server 放到 HTTPS 后面，你的 app 就为用户准备好了。

## Company knowledge 兼容性

[ChatGPT 中的 Company knowledge](https://openai.com/index/introducing-company-knowledge/)（Business、Enterprise 和 Edu）可以调用你 app 中任何 **read-only** tool。它会偏向 `search`/`fetch`，且只有实现了 `search` 和 `fetch` tool input signatures 的 apps 会被纳入 company knowledge sources。这些也是 connectors 和 deep research 所需的相同 tool shapes（参见 [MCP docs](https://platform.openai.com/docs/mcp)）。

实际中，你应：

- 严格按照 MCP schema 实现 [search](https://platform.openai.com/docs/mcp#search-tool) 和 [fetch](https://platform.openai.com/docs/mcp#fetch-tool) input schemas。Company knowledge compatibility 只检查 input parameters。
- 使用 `readOnlyHint: true` 标记其他 read-only tools，让 ChatGPT 能安全调用它们。

若要 opt in，请使用 MCP schema 实现 `search` 和 `fetch`。对于 citations，将 `url` 设置为可由用户打开的 absolute HTTP 或 HTTPS URL，用于引用资源。把 provider-internal document identifiers 和 opaque lookup keys 放在 `id` 中，而不是 `url` 中。如果没有用户可打开的 URL，请让 `url` 为空；ChatGPT 会把结果保留为普通 tool output，而不是创建 citation。关于 eligibility、admin enablement 和 availability details，请参阅 [ChatGPT 中的 Company knowledge](https://help.openai.com/en/articles/12628342/) 以及 [Building MCP servers](https://platform.openai.com/docs/mcp) 中的 MCP tool schema。

虽然 compatibility checks 关注 input schema，但你仍应为 [search](https://platform.openai.com/docs/mcp#search-tool) 和 [fetch](https://platform.openai.com/docs/mcp#fetch-tool) 返回推荐 result shapes，以便 ChatGPT 能可靠引用 sources。`text` fields 是 tool response 中的 JSON-encoded strings。

**Search result shape（MCP wrapping 前的 tool payload）：**

```json
{
  "results": [
    {
      "id": "doc-1",
      "title": "Human-readable title",
      "url": "https://example.com"
    }
  ]
}
```

字段：

- `results` - search results 数组。
- `results[].id` - document 或 item 的唯一 ID。
- `results[].title` - human-readable title。
- `results[].url` - 用于 citation、可由用户打开的 absolute HTTP 或 HTTPS URL。

在 MCP 中，将此 JSON 作为 `structuredContent` 返回，并在 `content` 中包含同一个值的 JSON string 以获得兼容性：

**Search tool response wrapper：**

```json
{
  "structuredContent": {
    "results": [
      {
        "id": "doc-1",
        "title": "Human-readable title",
        "url": "https://example.com"
      }
    ]
  },
  "content": [
    {
      "type": "text",
      "text": "{\"results\":[{\"id\":\"doc-1\",\"title\":\"Human-readable title\",\"url\":\"https://example.com\"}]}"
    }
  ]
}
```

**Fetch result shape（MCP wrapping 前的 tool payload）：**

```json
{
  "id": "doc-1",
  "title": "Human-readable title",
  "text": "Full text of the document",
  "url": "https://example.com",
  "metadata": { "source": "optional key/value pairs" }
}
```

字段：

- `id` - document 或 item 的唯一 ID。
- `title` - human-readable title。
- `text` - document 或 item 的全文。
- `url` - 用于 citation、可由用户打开的 absolute HTTP 或 HTTPS URL。
- `metadata` - 关于结果的可选 key/value pairs。

对于 `fetch`，以相同方式返回 document JSON：

**Fetch tool response wrapper：**

```json
{
  "structuredContent": {
    "id": "doc-1",
    "title": "Human-readable title",
    "text": "Full text of the document",
    "url": "https://example.com",
    "metadata": { "source": "optional key/value pairs" }
  },
  "content": [
    {
      "type": "text",
      "text": "{\"id\":\"doc-1\",\"title\":\"Human-readable title\",\"text\":\"Full text of the document\",\"url\":\"https://example.com\",\"metadata\":{\"source\":\"optional key/value pairs\"}}"
    }
  ]
}
```

下面是一个最小 TypeScript 示例，展示 `search` 和 `fetch` tools：

```ts



const server = new McpServer({ name: "acme-knowledge", version: "1.0.0" });

const searchOutputSchema = {
  results: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      url: z.httpUrl().or(z.literal("")),
    })
  ),
};

const fetchOutputSchema = {
  id: z.string(),
  title: z.string(),
  text: z.string(),
  url: z.httpUrl().or(z.literal("")),
  metadata: z.record(z.string(), z.string()).optional(),
};

server.registerTool(
  "search",
  {
    title: "Search knowledge",
    inputSchema: { query: z.string() },
    outputSchema: searchOutputSchema,
    annotations: { readOnlyHint: true },
  },
  async ({ query }) => {
    const structuredContent = {
      results: [{ id: "doc-1", title: "Overview", url: "https://example.com" }],
    };

    return {
      structuredContent,
      content: [{ type: "text", text: JSON.stringify(structuredContent) }],
    };
  }
);

server.registerTool(
  "fetch",
  {
    title: "Fetch document",
    inputSchema: { id: z.string() },
    outputSchema: fetchOutputSchema,
    annotations: { readOnlyHint: true },
  },
  async ({ id }) => {
    const structuredContent = {
      id,
      title: "Overview",
      text: "Full text...",
      url: "https://example.com",
      metadata: { source: "acme" },
    };

    return {
      structuredContent,
      content: [{ type: "text", text: JSON.stringify(structuredContent) }],
    };
  }
);
```

## 安全提醒

- 将 `structuredContent`、`content`、`_meta` 和 widget state 都视为用户可见，绝不要嵌入 API keys、tokens 或 secrets。
- 不要依赖 `_meta["openai/userAgent"]`、`_meta["openai/locale"]` 或其他 hints 进行 authorization；请在你的 MCP server 和 backing APIs 内强制 auth。
- 避免暴露 admin-only 或 destructive tools，除非 server 会验证调用者的 identity 和 intent。

:::

## English source

::: details 展开英文原文
::: v-pre
By the end of this guide, you’ll know how to connect your backend MCP server to ChatGPT, define tools, register UI templates, and tie everything together using the widget runtime. You’ll build a working foundation for a ChatGPT App that returns structured data, renders an interactive widget, and keeps your model, server, and UI in sync. If you prefer to dive straight into the implementation, you can skip ahead to the [example](/mirror/apps-sdk/build/mcp-server#example) at the end.

Build faster with the [OpenAI Docs MCP server](https://developers.openai.com/learn/docs-mcp) in your
  editor.

## Overview

### What an MCP server does for your app

ChatGPT Apps have three components:

- **Your MCP server** defines tools, provides optional server instructions, enforces auth, returns data, and points each tool to a UI bundle.
- **The widget/UI bundle** renders inside ChatGPT’s iframe and communicates with the host through the MCP Apps UI bridge (JSON-RPC over `postMessage`).
- **The model** decides when to call tools and narrates the experience using the structured data you return.

A solid server implementation keeps those boundaries clean so you can iterate on UI and data independently. Remember: you build the MCP server and define the tools, but ChatGPT’s model chooses when to call them based on the metadata you provide.

### Before you begin

Prerequisites:

- Comfortable with TypeScript or Python and a web bundler (Vite, esbuild, etc.).
- MCP server reachable over HTTP (local is fine to start).
- Built UI bundle that exports a root script (React or vanilla).

Example project layout:

```
your-chatgpt-app/
├─ server/
│  └─ src/index.ts          # MCP server + tool handlers
├─ web/
│  ├─ src/component.tsx     # React widget
│  └─ dist/app.{js,css}  # Bundled assets referenced by the server
└─ package.json
```

## Architecture flow

1. A user prompt causes ChatGPT to call one of your MCP tools.
2. Your server runs the handler, fetches authoritative data, and returns `structuredContent`, `_meta`, and UI metadata.
3. ChatGPT loads the HTML template linked in the tool descriptor (served as `text/html;profile=mcp-app`) and delivers tool inputs/results to the iframe over the MCP Apps bridge (for example, `ui/notifications/tool-result`).
4. The widget renders from tool results, can call tools again with `tools/call`, and can optionally use ChatGPT-only extensions when needed.
5. The model reads `structuredContent` to narrate what happened, so keep it tight and idempotent—ChatGPT may retry tool calls.

```
User prompt
   ↓
ChatGPT model ──► MCP tool call ──► Your server ──► Tool response (`structuredContent`, `_meta`, `content`)
   │                                                   │
   └───── renders narration ◄──── widget iframe ◄──────┘
                              (HTML template + MCP Apps bridge)
```

## Use the MCP Apps UI bridge

ChatGPT supports the open MCP Apps standard for UI communication:

- JSON-RPC 2.0 messages over `postMessage`.
- `ui/*` methods and notifications for host↔iframe UI communication.
- MCP tool calls through `tools/call`.

Start with the MCP Apps bridge to keep your UI portable across hosts, then add
ChatGPT extensions when you need ChatGPT-specific capabilities. For a deeper
walkthrough and a mapping guide, see
[MCP Apps compatibility in ChatGPT](/mirror/apps-sdk/mcp-apps-in-chatgpt).

## Understand the `window.openai` widget runtime

`window.openai` is an Apps SDK compatibility layer and a home for optional
ChatGPT extensions. For new apps, use the MCP Apps bridge by default and treat
`window.openai` as an API for additional capabilities unique to ChatGPT.

Unique capabilities include:

- **File handling (ChatGPT extension):** `uploadFile`, `selectFiles`, and `getFileDownloadUrl` cover file uploads, selection, and downloads.
- **Host surfaces (ChatGPT extension):** `requestModal` opens a host-owned modal.
- **Commerce (ChatGPT extension):** `requestCheckout` opens Instant Checkout (when enabled).

For the full `window.openai` reference, see the [ChatGPT UI guide](/mirror/apps-sdk/build/chatgpt-ui#understand-the-windowopenai-api).

Use `requestModal` when you need a host-controlled overlay—for example, open a checkout or detail view anchored to an “Add to cart” button so shoppers can review options without forcing the inline widget to resize. To show a different UI template in the modal, pass the template URI you registered (for example, via `registerAppResource`).

Use these APIs when they materially improve your ChatGPT experience, but keep
your core UI bridge built on the MCP Apps standard. For implementation patterns, see
[Build your ChatGPT UI](/mirror/apps-sdk/build/chatgpt-ui).

## Pick an SDK

Apps SDK works with any MCP implementation, but the official SDKs are the quickest way to get started. They ship tool/schema helpers, HTTP server scaffolding, resource registration utilities, and end-to-end type safety so you can stay focused on business logic:

- **Python SDK** – Iterate quickly with FastMCP or FastAPI. Repo: [`modelcontextprotocol/python-sdk`](https://github.com/modelcontextprotocol/python-sdk).
- **TypeScript SDK** – Ideal when your stack is already Node/React. Repo: [`modelcontextprotocol/typescript-sdk`](https://github.com/modelcontextprotocol/typescript-sdk), published as `@modelcontextprotocol/sdk`. Docs live on [modelcontextprotocol.io](https://modelcontextprotocol.io/).

Install whichever SDK matches your backend language, then follow the steps below.

```bash
# TypeScript / Node
npm install @modelcontextprotocol/sdk @modelcontextprotocol/ext-apps zod

# Python
pip install mcp
```

## Build your MCP server

### Add server instructions for cross-tool guidance

MCP servers can return an [`instructions` field](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#initialization) during initialization. ChatGPT and Codex use these instructions alongside your tool metadata when deciding how to work with your server.

Use server instructions for guidance that applies across tools, such as required tool sequences, shared rate limits, or relationships between tools. Keep the guidance concise and put the most important details first; for ChatGPT and Codex, the first 512 characters should be self-contained. Don't use server instructions to repeat every tool description or change the model's personality.

```ts


const server = new McpServer(
  { name: "kanban-server", version: "1.0.0" },
  {
    instructions:
      "Before updating a task, call list_tasks to validate the task ID. For bulk edits, process at most 10 tasks per request.",
  }
);
```

### Step 1 – Register a component template

Each UI bundle is exposed as an MCP resource with the MCP Apps UI MIME type (`text/html;profile=mcp-app`). If you use `@modelcontextprotocol/ext-apps/server`, prefer `RESOURCE_MIME_TYPE` instead of hardcoding the string.

Register the template and include metadata for borders, domains, and CSP rules:

```ts
// Registers the Kanban widget HTML entry point served to ChatGPT.




const server = new McpServer({ name: "kanban-server", version: "1.0.0" });
const HTML = readFileSync("web/dist/kanban.js", "utf8");
const CSS = readFileSync("web/dist/kanban.css", "utf8");

registerAppResource(
  server,
  "kanban-widget",
  "ui://widget/kanban-board.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/kanban-board.html",
        mimeType: RESOURCE_MIME_TYPE,
        text: `
<div id="kanban-root"></div>
<style>${CSS}</style>
<script type="module">${HTML}</script>
        `.trim(),
        _meta: {
          ui: {
            prefersBorder: true,
            domain: "https://myapp.example.com",
            csp: {
              connectDomains: ["https://api.myapp.example.com"], // example API domain
              resourceDomains: ["https://*.oaistatic.com"], // example CDN allowlist
              // Optional: allow embedding specific iframe origins.
              frameDomains: ["https://*.example-embed.com"],
            },
          },
        },
      },
    ],
  })
);
```

If you need to embed iframes inside your widget, use `_meta.ui.csp.frameDomains` to declare an allowlist of origins. Without `frameDomains` set, subframes are blocked by default. Because iframe content is harder for us to inspect, widgets that enable subframes are reviewed with extra scrutiny and may not be approved for directory distribution.

**Best practice:** When you change your widget’s HTML/JS/CSS in a breaking way, give the template a new URI (or use a new file name) so ChatGPT always loads the updated bundle instead of a cached one.

Treat the URI as your cache key. When you update the markup or bundle, version
the URI and update every reference to it (for example, the `registerAppResource`
URI, `_meta.ui.resourceUri` in your tool descriptor, and the `contents[].uri`
in your template list). ChatGPT honors `_meta["openai/outputTemplate"]`
as an OpenAI-specific compatibility alias.

```ts
// Old
contents: [{ uri: "ui://widget/kanban-board.html" /* ... */ }];
// New
contents: [{ uri: "ui://widget/kanban-board-v2.html" /* ... */ }];
```

If you ship updates frequently, keep a short, consistent versioning scheme so you can roll forward (or back) without reusing the same URI.

### Step 2 – Describe tools

Tools are the contract the model reasons about. Define one tool per user intent (e.g., `list_tasks`, `update_task`). Each descriptor should include:

- Machine-readable name and human-readable title.
- Schema for arguments. With the Node helper shown below, use Zod raw shapes or
  Standard Schema; other SDKs may expose JSON Schema or dataclasses.
- Schema for returned `structuredContent` (`outputSchema`) so clients and
  models know the shape of the tool result.
- `_meta.ui.resourceUri` pointing to the template URI.
- Optional `_meta.ui.visibility` to control whether the tool is callable by the model, the UI, or both.
- Optional ChatGPT extensions (like short status text while a tool runs).

_The model inspects these descriptors to decide when a tool fits the user’s request, so treat names, descriptions, and schemas as part of your UX._

Design handlers to be **idempotent**—the model may retry calls.

```ts
// Example app that exposes a kanban-board tool with schema, metadata, and handler.



registerAppTool(
  server,
  "kanban-board",
  {
    title: "Show Kanban Board",
    inputSchema: { workspace: z.string() },
    outputSchema: {
      columns: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          tasks: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              status: z.string(),
            })
          ),
        })
      ),
    },
    _meta: {
      ui: { resourceUri: "ui://widget/kanban-board.html" },
      // ChatGPT extension (optional):
      // "openai/toolInvocation/invoking": "Preparing the board…",
      // "openai/toolInvocation/invoked": "Board ready.",
    },
  },
  async ({ workspace }) => {
    const board = await loadBoard(workspace);
    return {
      structuredContent: board.summary,
      content: [{ type: "text", text: `Showing board ${workspace}` }],
      _meta: board.details,
    };
  }
);
```

#### Memory and tool calls

Memory is user-controlled and model-mediated: the model decides if and how to use it when selecting or parameterizing a tool call. By default, memories are turned off with apps. Users can enable or disable memory for an app. Apps do not receive a separate memory feed; they only see whatever the model includes in tool inputs. When memory is off, a request is re-evaluated without memory in the model context.

&lt;img src="https://developers.openai.com/images/apps-sdk/memories.png"
  alt="Memory settings in ChatGPT"
  class="w-full max-w-xl mx-auto rounded-lg"
/&gt;

**Best practices**

- Keep tool inputs explicit and required for correctness; do not rely on memory for critical fields.
- Treat memory as a hint, not authority; confirm user preferences when it is important to your user flow and may have side effects.
- Provide safe defaults or ask a follow-up question when context is missing.
- Make tools resilient to retries, re-evaluation, or missing memories.
- For write or destructive actions, re-confirm intent and key parameters in the current turn.

### Step 3 – Return structured data and metadata

Every tool response can include three sibling payloads:

- **`structuredContent`** – concise JSON the widget uses _and_ the model reads. Include only what the model should see.
- **`content`** – optional narration (Markdown or plaintext) for the model’s response.
- **`_meta`** – large or sensitive data exclusively for the widget. `_meta` never reaches the model.

```ts
// Returns concise structuredContent for the model plus rich _meta for the widget.
async function loadKanbanBoard(workspace: string) {
  const tasks = await db.fetchTasks(workspace);
  return {
    structuredContent: {
      columns: ["todo", "in-progress", "done"].map((status) => ({
        id: status,
        title: status.replace("-", " "),
        tasks: tasks.filter((task) => task.status === status).slice(0, 5),
      })),
    },
    content: [
      {
        type: "text",
        text: "Here's the latest snapshot. Drag cards in the widget to update status.",
      },
    ],
    _meta: {
      tasksById: Object.fromEntries(tasks.map((task) => [task.id, task])),
      lastSyncedAt: new Date().toISOString(),
    },
  };
}
```

The widget receives those payloads over the MCP Apps bridge (for example,
`ui/notifications/tool-result`), while the model only sees `structuredContent`
and `content`.

### Step 4 – Run locally

1. Build your UI bundle (`npm run build` inside `web/`).
2. Start the MCP server (Node, Python, etc.).
3. Use [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) early and often to call `http://localhost:&lt;port&gt;/mcp`, list roots, and verify your widget renders correctly. Inspector mirrors ChatGPT’s widget runtime and catches issues before deployment.

For a TypeScript project, that usually looks like:

```bash
npm run build       # compile server + widget
node dist/index.js  # start the compiled MCP server
```

### Step 5 – Expose an HTTPS endpoint

ChatGPT requires HTTPS. During development, tunnel localhost with ngrok (or similar):

```bash
ngrok http <port>
# Forwarding: https://<subdomain>.ngrok.app -> http://127.0.0.1:<port>
```

Use the ngrok URL when creating a connector in ChatGPT developer mode. For production, deploy to a low-latency HTTPS host (Cloudflare Workers, Fly.io, Vercel, AWS, etc.).

## Example

Here’s a stripped-down TypeScript server plus vanilla widget. For full projects, reference the public [Apps SDK examples](https://github.com/openai/openai-apps-sdk-examples).

```ts
// server/src/index.ts




const server = new McpServer({ name: "hello-world", version: "1.0.0" });

registerAppResource(
  server,
  "hello",
  "ui://widget/hello.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/hello.html",
        mimeType: RESOURCE_MIME_TYPE,
        text: `
<div id="root"></div>
<script type="module" src="https://example.com/hello-widget.js"></script>
      `.trim(),
      },
    ],
  })
);

registerAppTool(
  server,
  "hello_widget",
  {
    title: "Show hello widget",
    inputSchema: { name: z.string() },
    outputSchema: { message: z.string() },
    _meta: { ui: { resourceUri: "ui://widget/hello.html" } },
  },
  async ({ name }) => ({
    structuredContent: { message: `Hello ${name}!` },
    content: [{ type: "text", text: `Greeting ${name}` }],
    _meta: {},
  })
);
```

```js
// hello-widget.js
const root = document.getElementById("root");
root.textContent = "Loading…";

const update = (toolResult) => {
  const message = toolResult?.structuredContent?.message ?? "Hi!";
  root.textContent = message;
};

window.addEventListener(
  "message",
  (event) => {
    if (event.source !== window.parent) return;
    const message = event.data;
    if (!message || message.jsonrpc !== "2.0") return;
    if (message.method !== "ui/notifications/tool-result") return;
    update(message.params);
  },
  { passive: true }
);
```

## Troubleshooting

- **Widget doesn’t render** – Ensure the template resource returns `mimeType: "text/html;profile=mcp-app"` and that the bundled JS/CSS URLs resolve inside the sandbox.
- **No `ui/*` messages arrive** – The host only enables the MCP Apps bridge for `text/html;profile=mcp-app` resources; double-check the MIME type and that the widget loaded without CSP violations.
- **CSP or CORS failures** – Use `_meta.ui.csp` to allow the exact domains you fetch from; the sandbox blocks everything else.
- **Stale bundles keep loading** – Cache-bust template URIs or file names whenever you deploy breaking changes.
- **Structured payloads are huge** – Trim `structuredContent` to what the model truly needs; oversized payloads degrade model performance and slow rendering.



## Advanced capabilities

### Component-initiated tool calls

Use `tools/call` to invoke tools directly from your UI. By default, tools are
available to both the model and the UI. Use `_meta.ui.visibility` to restrict
where a tool is available.

```json
"_meta": {
  "ui": {
    "resourceUri": "ui://widget/kanban-board.html",
    "visibility": ["model", "app"]
  }
}
```

#### Tool visibility

To make a tool callable from your UI but hidden from the model, set
`_meta.ui.visibility` to `["app"]`. This keeps the tool available to the widget
via `tools/call` without influencing tool selection by the model.

```json
"_meta": {
  "ui": {
    "resourceUri": "ui://widget/kanban-board.html",
    "visibility": ["app"]
  }
}
```

### Tool annotations and elicitation

MCP tools must include [`tool annotations`](https://modelcontextprotocol.io/legacy/concepts/tools#tool-annotations) that describe the tool’s _potential impact_. These hints are required for tool definitions.

The three hints we look at are:

- `readOnlyHint`: Set to `true` for tools that only retrieve or compute information and do not create, update, delete, or send data outside of ChatGPT (search, lookups, previews).
- `openWorldHint`: Set to `false` for tools that only affect a bounded target (for example, “update a task by id” in your own product). Leave `true` for tools that can write to arbitrary URLs/files/resources.
- `destructiveHint`: Set to `true` for tools that can delete, overwrite, or have irreversible side effects.

`openWorldHint` and `destructiveHint` are only relevant for writes (that is,
when `readOnlyHint=false`).

Set these hints accurately so the tool’s impact is correctly described.

If you omit these hints (or leave them as `null`), treat it as a validation
error and update the tool definition to include them.

Example tool descriptor:

```json
{
  "name": "update_task",
  "title": "Update task",
  "annotations": {
    "readOnlyHint": false,
    "openWorldHint": false,
    "destructiveHint": false
  }
}
```

### File handling

**ChatGPT extension (optional):** If your tool accepts user-provided files,
declare file parameters with `_meta["openai/fileParams"]`. The value is a list
of top-level input schema fields that should be treated as files. Nested file
fields are not supported.

File params describe the input side of file handling: they tell ChatGPT which
tool arguments contain files that the runtime should authorize and pass through
as file references.

Each declared file param receives an object with this shape:

```json
{
  "download_url": "https://...",
  "file_id": "file_...",
  "mime_type": "image/png",
  "file_name": "input.png"
}
```

`download_url` and `file_id` are required. `mime_type` and `file_name` are
optional. The `download_url` is temporary and should be used only while handling
the current tool call. If the file reference came from a widget upload, selected
file, or another tool result, use `file_id` when you need to request a fresh
download URL from ChatGPT.

Example:

```ts



const imageFileSchema = z.object({
  download_url: z.string(),
  file_id: z.string(),
  mime_type: z.string().optional(),
  file_name: z.string().optional(),
});

registerAppTool(
  server,
  "process_image",
  {
    title: "process_image",
    description: "Processes an image",
    inputSchema: {
      imageToProcess: imageFileSchema,
    },
    outputSchema: {
      download_url: z.string(),
      file_id: z.string(),
      mime_type: z.string().optional(),
      file_name: z.string().optional(),
    },
    _meta: {
      ui: { resourceUri: "ui://widget/widget.html" },
      "openai/fileParams": ["imageToProcess"],
    },
  },
  async ({ imageToProcess }) => {
    return {
      content: [],
      structuredContent: {
        download_url: imageToProcess.download_url,
        file_id: imageToProcess.file_id,
        mime_type: imageToProcess.mime_type,
        file_name: imageToProcess.file_name,
      },
    };
  }
);
```

To return downloadable files from a tool, include a file reference in
`structuredContent`, usually under a field such as `file_uri`:

```json
{
  "structuredContent": {
    "file_uri": {
      "download_url": "https://...",
      "file_id": "file_...",
      "mime_type": "application/pdf",
      "file_name": "report.pdf"
    }
  }
}
```

This is the output side of file handling. Your tool should return a file
reference instead of inline binary data or base64 content when the result is a
downloadable file. ChatGPT can use the returned `file_id` to provide the widget
with a fresh temporary download URL.

ChatGPT also supports downloadable files returned as MCP
[`resource_link`](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#resource-links)
content. Use this for file outputs that should be exposed to the user as
downloads. For direct web downloads, return an
[`https://`](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#https)
resource URI as defined by MCP. ChatGPT elicits user approval before it
downloads that file for the user.

### Content security policy (CSP)

Set `_meta.ui.csp` on the widget resource so the sandbox knows which domains to
allow for `connect-src`, `img-src`, `frame-src`, etc. This is required before
broad distribution.

```json
"_meta": {
  "ui": {
    "csp": {
      "connectDomains": ["https://api.example.com"],
      "resourceDomains": ["https://persistent.oaistatic.com"],
      "frameDomains": ["https://*.example-embed.com"]
    }
  }
}
```

- `connectDomains` – hosts your widget can fetch from.
- `resourceDomains` – hosts for static assets like images, fonts, and scripts.
- `frameDomains` – optional; hosts your widget may embed as iframes. Widgets without `frameDomains` cannot render subframes.

If you want to use `window.openai.openExternal(...)` without seeing a safe-link
warning, use the field `redirect_domains` under `openai/widgetCSP`.

Caution: Using `frameDomains` is discouraged and should only be done when embedding iframes is core to your experience (for example, a code editor or notebook environment). Apps that declare `frameDomains` are subject to higher scrutiny at review time and are likely to be rejected or held back from broad distribution.

### Widget domains

Set `_meta.ui.domain` on the widget resource template (the `registerAppResource`
template). This is required for app submission and must be unique per app.
ChatGPT renders the widget under `&lt;domain&gt;.web-sandbox.oaiusercontent.com`, which
also enables the fullscreen punch-out button.

```json
"_meta": {
  "ui": {
    "csp": {
      "connectDomains": ["https://api.example.com"],
      "resourceDomains": ["https://persistent.oaistatic.com"]
    },
    "domain": "https://myapp.example.com"
  }
}
```

### Component descriptions

**ChatGPT extension (optional):** Set `_meta["openai/widgetDescription"]` on the
widget resource to let the widget describe itself, reducing redundant text
beneath the widget.

```json
"_meta": {
  "ui": {
    "csp": {
      "connectDomains": ["https://api.example.com"],
      "resourceDomains": ["https://persistent.oaistatic.com"]
    },
    "domain": "https://myapp.example.com"
  },
  "openai/widgetDescription": "Shows an interactive zoo directory rendered by get_zoo_animals."
}
```

### Localized content

ChatGPT sends the requested locale in `_meta["openai/locale"]` (with `_meta["webplus/i18n"]` as a legacy key) in the client request. Use RFC 4647 matching to select the closest supported locale, echo it back in your responses, and format numbers/dates accordingly.

### Client context hints

ChatGPT may also send hints in the client request metadata like `_meta["openai/userAgent"]` and `_meta["openai/userLocation"]`. These can be helpful for tailoring analytics or formatting, but **never** rely on them for authorization. Treat `_meta["openai/userAgent"]` as optional, best-effort metadata, not as a stable way to detect which host surface is calling your server.

Once your templates, tools, and widget runtime are wired up, the fastest way to refine your app is to use ChatGPT itself: call your tools in a real conversation, watch your logs, and debug the widget with browser devtools. When everything looks good, put your MCP server behind HTTPS and your app is ready for users.

## Company knowledge compatibility

[Company knowledge in ChatGPT](https://openai.com/index/introducing-company-knowledge/) (Business, Enterprise, and Edu) can call any **read-only** tool in your app. It biases toward `search`/`fetch`, and only apps that implement the `search` and `fetch` tool input signatures are included as company knowledge sources. These are the same tool shapes required for connectors and deep research (see the [MCP docs](https://platform.openai.com/docs/mcp)).

In practice, you should:

- Implement [search](https://platform.openai.com/docs/mcp#search-tool) and [fetch](https://platform.openai.com/docs/mcp#fetch-tool) input schemas exactly to the MCP schema. Company knowledge compatibility checks the input parameters only.
- Mark other read-only tools with `readOnlyHint: true` so ChatGPT can safely call them.

To opt in, implement `search` and `fetch` using the MCP schema. For citations, set `url` to an absolute, user-openable HTTP or HTTPS URL for the cited resource. Keep provider-internal document identifiers and opaque lookup keys in `id`, not `url`. If no user-openable URL exists, leave `url` empty; ChatGPT keeps the result as ordinary tool output instead of creating a citation. For eligibility, admin enablement, and availability details, see [Company knowledge in ChatGPT](https://help.openai.com/en/articles/12628342/) and the MCP tool schema in [Building MCP servers](https://platform.openai.com/docs/mcp).

While compatibility checks focus on the input schema, you should still return the recommended result shapes for [search](https://platform.openai.com/docs/mcp#search-tool) and [fetch](https://platform.openai.com/docs/mcp#fetch-tool) so ChatGPT can cite sources reliably. The `text` fields are JSON-encoded strings in your tool response.

**Search result shape (tool payload before MCP wrapping):**

```json
{
  "results": [
    {
      "id": "doc-1",
      "title": "Human-readable title",
      "url": "https://example.com"
    }
  ]
}
```

Fields:

- `results` - array of search results.
- `results[].id` - unique ID for the document or item.
- `results[].title` - human-readable title.
- `results[].url` - absolute, user-openable HTTP or HTTPS URL for citation.

In MCP, return this JSON as `structuredContent` and include the same value as a
JSON string in `content` for compatibility:

**Search tool response wrapper:**

```json
{
  "structuredContent": {
    "results": [
      {
        "id": "doc-1",
        "title": "Human-readable title",
        "url": "https://example.com"
      }
    ]
  },
  "content": [
    {
      "type": "text",
      "text": "{\"results\":[{\"id\":\"doc-1\",\"title\":\"Human-readable title\",\"url\":\"https://example.com\"}]}"
    }
  ]
}
```

**Fetch result shape (tool payload before MCP wrapping):**

```json
{
  "id": "doc-1",
  "title": "Human-readable title",
  "text": "Full text of the document",
  "url": "https://example.com",
  "metadata": { "source": "optional key/value pairs" }
}
```

Fields:

- `id` - unique ID for the document or item.
- `title` - human-readable title.
- `text` - full text of the document or item.
- `url` - absolute, user-openable HTTP or HTTPS URL for citation.
- `metadata` - optional key/value pairs about the result.

For `fetch`, return the document JSON the same way:

**Fetch tool response wrapper:**

```json
{
  "structuredContent": {
    "id": "doc-1",
    "title": "Human-readable title",
    "text": "Full text of the document",
    "url": "https://example.com",
    "metadata": { "source": "optional key/value pairs" }
  },
  "content": [
    {
      "type": "text",
      "text": "{\"id\":\"doc-1\",\"title\":\"Human-readable title\",\"text\":\"Full text of the document\",\"url\":\"https://example.com\",\"metadata\":{\"source\":\"optional key/value pairs\"}}"
    }
  ]
}
```

Here is a minimal TypeScript example showing the `search` and `fetch` tools:

```ts



const server = new McpServer({ name: "acme-knowledge", version: "1.0.0" });

const searchOutputSchema = {
  results: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      url: z.httpUrl().or(z.literal("")),
    })
  ),
};

const fetchOutputSchema = {
  id: z.string(),
  title: z.string(),
  text: z.string(),
  url: z.httpUrl().or(z.literal("")),
  metadata: z.record(z.string(), z.string()).optional(),
};

server.registerTool(
  "search",
  {
    title: "Search knowledge",
    inputSchema: { query: z.string() },
    outputSchema: searchOutputSchema,
    annotations: { readOnlyHint: true },
  },
  async ({ query }) => {
    const structuredContent = {
      results: [{ id: "doc-1", title: "Overview", url: "https://example.com" }],
    };

    return {
      structuredContent,
      content: [{ type: "text", text: JSON.stringify(structuredContent) }],
    };
  }
);

server.registerTool(
  "fetch",
  {
    title: "Fetch document",
    inputSchema: { id: z.string() },
    outputSchema: fetchOutputSchema,
    annotations: { readOnlyHint: true },
  },
  async ({ id }) => {
    const structuredContent = {
      id,
      title: "Overview",
      text: "Full text...",
      url: "https://example.com",
      metadata: { source: "acme" },
    };

    return {
      structuredContent,
      content: [{ type: "text", text: JSON.stringify(structuredContent) }],
    };
  }
);
```

## Security reminders

- Treat `structuredContent`, `content`, `_meta`, and widget state as user-visible—never embed API keys, tokens, or secrets.
- Do not rely on `_meta["openai/userAgent"]`, `_meta["openai/locale"]`, or other hints for authorization; enforce auth inside your MCP server and backing APIs.
- Avoid exposing admin-only or destructive tools unless the server verifies the caller’s identity and intent.

:::
:::

