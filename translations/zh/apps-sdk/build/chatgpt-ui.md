---
status: needs-review
sourceId: "2b46d1ba2a52"
sourceChecksum: "2b46d1ba2a527fef6dd810a888e20259f94e45e8e420053ca8c85e282cd1529f"
sourceUrl: "https://developers.openai.com/apps-sdk/build/chatgpt-ui"
translatedAt: "2026-06-27T19:35:17.0701114+08:00"
translator: codex-gpt-5.5-xhigh
---

# 构建你的 ChatGPT UI

## 概览

UI components 会把 MCP server 返回的结构化工具结果转换为对人友好的 UI。你的组件运行在 ChatGPT 内的 iframe 中，通过 MCP Apps bridge（JSON-RPC over `postMessage`）与 host 通信，并与对话内联渲染。

这是为 ChatGPT Apps 构建、后来标准化为 MCP Apps 的 UI 架构，因此你可以构建一次，并让 UI 在兼容 MCP Apps 的 hosts 中运行。

ChatGPT 会继续支持 `window.openai`，用于 Apps SDK 兼容性和可选 ChatGPT extensions。

你也可以查看 [GitHub 上的 examples repository](https://github.com/openai/openai-apps-sdk-examples)。

### Component library

可以使用可选 UI kit [apps-sdk-ui](https://openai.github.io/apps-sdk-ui)，它提供与 ChatGPT 容器匹配的现成 buttons、cards、input controls 和 layout primitives。当你希望拥有一致样式而无需重建基础组件时，它可以节省时间。

## 使用 MCP Apps bridge（推荐）

ChatGPT 为 app interfaces 实现了开放的 MCP Apps standard。对于新 apps，默认使用该 bridge：

- Transport：JSON-RPC 2.0 over `postMessage`。
- Tool I/O：`ui/notifications/tool-input` 和 `ui/notifications/tool-result`。
- Tool calls：`tools/call`。
- Messaging + context：`ui/message` 和 `ui/update-model-context`。

如需 high-level overview 以及从 Apps SDK APIs 映射的指南，请参阅 [MCP Apps compatibility in ChatGPT](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt)。

### 接收工具输入和结果

ChatGPT 会以 JSON-RPC notifications 的形式把 tool inputs 和 results 发送到你的 iframe。例如，tool results 会作为 `ui/notifications/tool-result` 到达：

```json
{
  "jsonrpc": "2.0",
  "method": "ui/notifications/tool-result",
  "params": {
    "content": [],
    "structuredContent": { "tasks": [] }
  }
}
```

监听 notifications，并根据 `structuredContent` 重新渲染：

```ts
window.addEventListener(
  "message",
  (event) => {
    if (event.source !== window.parent) return;
    const message = event.data;
    if (!message || message.jsonrpc !== "2.0") return;
    if (message.method !== "ui/notifications/tool-result") return;

    const toolResult = message.params;
    const data = toolResult?.structuredContent;
    // Update UI from `data`.
  },
  { passive: true }
);
```

如果某个工具需要用户批准，不要假设首次渲染时 tool input 已经可用。ChatGPT 可能会等到用户批准调用后，才填充 `window.openai.toolInput` 并发送 `ui/notifications/tool-input`，因此 widgets 应订阅 lifecycle notification，并把缺失初始 input 视为正常状态。

### 从 UI 调用工具

若要直接从 UI 调用工具，请为 `tools/call` 发送 JSON-RPC request。确保该工具在 descriptor 中可供 UI（app）使用。默认情况下，tools 同时可供模型和 UI 使用；需要限制时使用 `_meta.ui.visibility`。

有关使用 `postMessage` 实现最小 request/response 的示例，请参阅 quickstart：[Quickstart](https://developers.openai.com/apps-sdk/quickstart#build-a-web-component)。

### 发送后续消息

使用 `ui/message` 请求 host 发布消息：

```ts
window.parent.postMessage(
  {
    jsonrpc: "2.0",
    method: "ui/message",
    params: {
      role: "user",
      content: [
        { type: "text", text: "Draft a tasting itinerary for my picks." },
      ],
    },
  },
  "*"
);
```

### 更新模型可见上下文

当 UI state 的变化需要被模型看到时，调用 `ui/update-model-context`：

```ts
// Requires a JSON-RPC request/response helper.
await rpcRequest("ui/update-model-context", {
  content: [{ type: "text", text: "User selected 3 items." }],
});
```

### 将数据处理与 UI 渲染分离

#### 解耦模式

如果你把 widget template 附加到每次 tool call，ChatGPT 可能会过于频繁地重新渲染你的 iframe。更好的模式是将 data-processing tools 与 render tools 分开：

- **Data tools** 获取、计算或变更数据，并只返回 tool results。
- **Render tools** 接收最终数据并返回 widget template。

这让模型可以先把智能应用到它获取的数据上，再选择向用户渲染 UI，从而更可能完成用户明确表达的具体目标。

当前 Apps SDK 设计已经支持这一点。

实践中，许多 apps 会使用这种拆分：

- **Search/fetch tools（data-first）：** 返回 IDs 加 metadata，不附加 widget template。
- **Render tools（例如 `render_listings_widget`）：** 接收已准备好的 IDs 列表并渲染 widget。

在 ChatGPT 中，只有 render tool 应包含 `_meta["openai/outputTemplate"]`。为了获得更广泛的 MCP Apps 兼容性，还应在 render tool 上设置 `_meta.ui.resourceUri`。

#### 解耦调用流程

推荐调用流程：

1. 模型调用 data tool（例如 `roll_dice`）。
2. 模型从 data tool 接收 `structuredContent`。
3. 模型用这些数据调用 render tool。
4. widget 使用最终、经过模型检查的上下文渲染一次。

#### 示例：房地产后续查询

假设你的 app 显示 listing cards 和 map，但后端 `search` 工具只支持宽泛 filters（city、price、beds、baths），无法按 school zone 过滤。

如果用户问：“Which of these are in the Richmond Primary School zone?”，解耦会有帮助：

1. `search` 宽泛运行，并返回 candidate listing IDs 和 metadata。
2. 模型针对后续问题精炼 candidate set。
3. 模型只用过滤后的 IDs 调用 `render_listings_widget`。
4. widget 渲染最终过滤后的集合。

最佳实践：

- 保持 data tools 可复用。返回完整的 `structuredContent` 以便链式调用。
- 保持 render tools 聚焦呈现。不要把 business logic 混入 render handler。
- 在 render tool description 中说明依赖关系（例如 “Always call `roll_dice` first”）。
- 让 reruns 保持有意图。允许 UI 为 “Re-roll” 等本地交互直接调用 data tools，而无需 remount widget。

#### 解耦示例

示例（解耦 dice tools）：

```ts



const TEMPLATE_URI = "ui://widget/dice.html";

const server = new McpServer(
  { name: "Decoupled dice", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// The widget only renders toolOutput.
// Re-roll calls the data tool directly to avoid remounting the widget.
const widgetHtml = `
  <div style="font-family: system-ui; padding: 8px;">
    <div style="font-size: 20px; margin-bottom: 6px;">
      Result: <span id="out">—</span>
    </div>
    <button id="reroll">Re-roll</button>
  </div>

  <script>
    const outputEl = document.getElementById("out");
    const rerollButton = document.getElementById("reroll");

    function render(result) {
      outputEl.textContent = String(result?.value ?? "—");
    }

    render(window.openai?.toolOutput);

    rerollButton.onclick = async () => {
      const current = window.openai?.toolOutput;
      const sides = current?.sides ?? window.openai?.toolInput?.sides ?? 6;
      const next = await window.openai?.callTool?.("roll_dice", { sides });
      if (next?.structuredContent) {
        render(next.structuredContent);
      }
    };

    window.addEventListener(
      "openai:set_globals",
      (event) => {
        render(event.detail?.globals?.toolOutput ?? window.openai?.toolOutput);
      },
      { passive: true }
    );
  </script>
`.trim();

server.registerResource("dice-widget", TEMPLATE_URI, {}, async () => ({
  contents: [
    {
      uri: TEMPLATE_URI,
      mimeType: "text/html;profile=mcp-app",
      text: widgetHtml,
      _meta: { ui: { prefersBorder: true } },
    },
  ],
}));

// 1) Data tool: no output template, returns chainable structuredContent.
server.registerTool(
  "roll_dice",
  {
    title: "Roll dice",
    description: "Roll an N-sided die and return { sides, value }.",
    inputSchema: { sides: z.number().int().min(2) },
    outputSchema: {
      sides: z.number().int().min(2),
      value: z.number().int().min(1),
    },
    _meta: {
      "openai/toolInvocation/invoking": "Rolling…",
      "openai/toolInvocation/invoked": "Rolled.",
    },
  },
  async ({ sides }) => {
    const value = 1 + Math.floor(Math.random() * sides);
    return {
      structuredContent: { sides, value },
      content: [{ type: "text", text: `Rolled ${value} on ${sides} sides.` }],
    };
  }
);

// 2) Render tool: owns the template and requires data from roll_dice.
server.registerTool(
  "render_dice_widget",
  {
    title: "Render dice widget",
    description:
      "Render the dice widget from roll data. First call roll_dice, then pass its sides and value to this tool.",
    inputSchema: {
      sides: z.number().int().min(2),
      value: z.number().int().min(1),
    },
    outputSchema: {
      sides: z.number().int().min(2),
      value: z.number().int().min(1),
    },
    _meta: {
      ui: { resourceUri: TEMPLATE_URI },
      "openai/outputTemplate": TEMPLATE_URI,
      "openai/toolInvocation/invoking": "Rendering…",
      "openai/toolInvocation/invoked": "Rendered.",
    },
  },
  async ({ sides, value }) => ({
    structuredContent: { sides, value },
    content: [
      {
        type: "text",
        text: `Showing a ${sides}-sided roll: ${value}.`,
      },
    ],
  })
);

export default server;
```

## 理解 `window.openai` API

ChatGPT 提供 `window.openai` 作为 Apps SDK compatibility layer，并提供一些 ChatGPT-only capabilities。OpenAI extensions 是可选的；当它们在 ChatGPT 中带来实质价值时使用，但不要依赖它们来实现 baseline MCP Apps compatibility。

完整 API reference 请参阅 [Apps SDK Reference](https://developers.openai.com/apps-sdk/reference#windowopenai-component-bridge)。

### `useOpenAiGlobal` helper

许多 Apps SDK projects 会把 `window.openai` access 包装在小 helper functions 中，让 views 保持可测试。这个示例 helper 会监听 host `openai:set_globals` events，并让 React components 订阅单个 global value：

```ts
export function useOpenAiGlobal<K extends keyof WebplusGlobals>(
  key: K
): WebplusGlobals[K] {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event: SetGlobalsEvent) => {
        const value = event.detail.globals[key];
        if (value === undefined) {
          return;
        }

        onChange();
      };

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true,
      });

      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    () => window.openai[key]
  );
}
```

### 从 widget 上传文件（ChatGPT extension）

使用 `window.openai.uploadFile(file, { library?: boolean })` 上传用户选择的文件并接收 `fileId`。如果还应把上传内容保存到用户的 ChatGPT file library（且该 library 对当前用户可用），请传入 `{ library: true }`。

```tsx
function FileUploadInput() {
  return (
    <input
      type="file"
      onChange={async (event) => {
        const file = event.currentTarget.files?.[0];
        if (!file || !window.openai?.uploadFile) {
          return;
        }

        const { fileId } = await window.openai.uploadFile(file, {
          library: true,
        });
        console.log("Uploaded fileId:", fileId);
      }}
    />
  );
}
```

### 复用 ChatGPT file library 中的文件（ChatGPT extension）

当用户应能够选择已上传到 ChatGPT 的文件、而不是再次上传时，使用 `window.openai.selectFiles()`。ChatGPT file library 并不对每个用户或环境都可用，因此在依赖该 helper 前请进行 feature-detect。返回的 file IDs 已为当前 app 授权。

```tsx
async function pickExistingFiles() {
  if (!window.openai?.selectFiles) {
    return [];
  }

  const files = await window.openai.selectFiles();
  console.log(files);
  // [{ fileId, fileName, mimeType }]
  return files;
}
```

Feature-detect `window.openai.selectFiles`，当当前环境或用户无法访问 library picker 时，fallback 到 `window.openai.uploadFile`。

### 在 widget 中下载文件（ChatGPT extension）

使用 `window.openai.getFileDownloadUrl({ fileId })` 获取临时 URL，用于 widget 上传、从 file library 选择、通过 tool input file param 接收，或从 tool result file reference 接收的文件。

```tsx
const { downloadUrl } = await window.openai.getFileDownloadUrl({ fileId });
imageElement.src = downloadUrl;
```

Tool file references 使用 snake case fields：

```json
{
  "download_url": "https://...",
  "file_id": "file_...",
  "mime_type": "image/png",
  "file_name": "input.png"
}
```

调用 `window.openai.getFileDownloadUrl({ fileId })` 时，请使用该 object 中的 `file_id` 作为 `fileId`。`download_url` 是临时的，应只用于当前操作。

### 关闭 widget（ChatGPT extension）

你可以通过两种方式关闭 widget：从 UI 调用 `window.openai.requestClose()`，或从 server 让 tool response 设置 `metadata.openai/closeWidget: true`，指示 host 在该响应到达时隐藏 widget：

```json
{
  "role": "tool",
  "tool_call_id": "abc123",
  "content": "...",
  "metadata": {
    "_meta": {
      "ui": {
        "csp": {
          "connectDomains": ["https://api.myapp.example.com"],
          "resourceDomains": ["https://persistent.oaistatic.com"],
          "frameDomains": ["https://widgets.example.com"]
        }
      }
    },
    "openai/closeWidget": true,
    "openai/widgetCSP": {
      "redirect_domains": ["https://checkout.example.com"]
    },
    "openai/widgetDomain": "https://myapp.example.com"
  }
}
```

注意：默认情况下，widgets 不能渲染 subframes。设置 `_meta.ui.csp.frameDomains` 会放宽这一限制，并允许你的 widget 嵌入来自这些 origins 的 iframes。使用 iframe embeds 的 apps 会面临更严格审核，除非 iframe content 是 use case 的核心，否则通常无法通过 broad distribution 审核。

如果你希望 `window.openai.openExternal` 把用户送到外部流程（例如 checkout），并启用返回同一对话的 return link，请把目标 origin 添加到 `openai/widgetCSP` 下的 `redirect_domains`。之后 ChatGPT 会跳过 safe-link modal，并向目标追加 `redirectUrl` query parameter，以便你把用户路由回 ChatGPT。

### Widget session ID

host 会在 tool response metadata 中以 `openai/widgetSessionId` 包含 per-widget identifier。使用它在同一 widget instance 保持 mounted 期间关联 tool calls 或 logs。

### 请求其他布局（ChatGPT extension）

如果 UI 需要更多空间，例如 maps、tables 或 embedded editors，请请求 host 更改容器。`window.openai.requestDisplayMode` 会协商 inline、PiP 或 fullscreen presentations。

```tsx
await window.openai?.requestDisplayMode({ mode: "fullscreen" });
// Note: on mobile, PiP may be coerced to fullscreen
```

### 打开 modal（ChatGPT extension）

使用 `window.openai.requestModal` 打开 host-controlled modal。你可以通过提供在 MCP server 上用 `registerResource` 注册的 template URI，传入同一 app 中的不同 UI template；也可以省略 `template` 来打开当前 template。

```tsx
await window.openai.requestModal({
  template: "ui://widget/checkout.html",
});
```

### 使用 host-backed navigation

Skybridge（sandbox runtime）会把 iframe 的 history 镜像到 ChatGPT 的 UI。使用标准 routing APIs，例如 React Router，host 会让 navigation controls 与你的 component 保持同步。

Router setup（React Router 的 `BrowserRouter`）：

```ts
export default function PizzaListRouter() {
  return (
    

<Routes>
        }>
          } />
        </Route>
      </Routes>


  );
}
```

Programmatic navigation：

```ts
const navigate = useNavigate();

function openDetails(placeId: string) {
  navigate(`place/${placeId}`, { replace: false });
}

function closeDetails() {
  navigate("..", { replace: true });
}
```

## 搭建 component project

现在你已经理解 MCP Apps bridge（以及可选 ChatGPT extensions），可以开始搭建 component project。

最佳实践是让 component code 与 server logic 分开。常见布局如下：

```
app/
  server/            # MCP server (Python or Node)
  web/               # Component bundle source
    package.json
    tsconfig.json
    src/component.tsx
    dist/component.js   # Build output
```

创建项目并安装 dependencies（推荐 Node 18+）：

```bash
cd app/web
npm init -y
npm install react@^18 react-dom@^18
npm install -D typescript esbuild
```

如果你的 component 需要 drag-and-drop、charts 或其他 libraries，请现在添加。保持 dependency set 精简，以降低 bundle size。

## 编写 React component

你的 entry file 应将 component 挂载到 `root` element，并基于通过 MCP Apps bridge 传递的最新 tool result（例如 `ui/notifications/tool-result`）渲染。

[examples page](https://developers.openai.com/apps-sdk/build/examples#pizzaz-list-source) 包含示例 apps，例如列出披萨餐厅的 "Pizza list" app。

### 探索 Pizzaz component gallery

[Apps SDK examples](https://developers.openai.com/apps-sdk/build/examples) 包含示例 components。在塑造自己的 UI 时，可以把它们当作蓝图：

- **Pizzaz List:** 带 favorites 和 call-to-action buttons 的 ranked card list。  
  ![Pizzaz list component 截图](https://developers.openai.com/images/apps-sdk/pizzaz-list.png)
- **Pizzaz Carousel:** Embla-powered horizontal scroller，展示 media-heavy layouts。  
  ![Pizzaz carousel component 截图](https://developers.openai.com/images/apps-sdk/pizzaz-carousel.png)
- **Pizzaz Map:** 具有 fullscreen inspector 和 host state sync 的 Mapbox integration。  
  ![Pizzaz map component 截图](https://developers.openai.com/images/apps-sdk/pizzaz-map.png)
- **Pizzaz Album:** 为单个地点 deep dives 构建的 stacked gallery view。  
  ![Pizzaz album component 截图](https://developers.openai.com/images/apps-sdk/pizzaz-album.png)
- **Pizzaz Video:** 带 overlays 和 fullscreen controls 的 scripted player。

每个示例都会展示如何 bundle assets、连接 host APIs，以及为真实对话组织状态。复制与你 use case 最接近的示例，并为你的 tool responses 调整 data layer。

### React helper hooks

订阅 `ui/notifications/tool-result` 的小 helper：

```tsx
type ToolResult = { structuredContent?: unknown } | null;

export function useToolResult() {
  const [toolResult, setToolResult] = useState<ToolResult>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      const message = event.data;
      if (!message || message.jsonrpc !== "2.0") return;
      if (message.method !== "ui/notifications/tool-result") return;
      setToolResult(message.params ?? null);
    };

    window.addEventListener("message", onMessage, { passive: true });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return toolResult;
}
```

从 `toolResult?.structuredContent` 渲染，并把它视为不可信输入。

## Widget localization

host 会把 locale 镜像到 `document.documentElement.lang`。使用该 locale 加载 translations 并格式化 dates/numbers。配合 `react-intl` 的常见模式：

```tsx




const messages: Record<string, Record<string, string>> = {
  "en-US": en,
  "es-ES": es,
};

export function App() {
  const locale = document.documentElement.lang || "en-US";
  return (
    

{/* Render UI with <FormattedMessage> or useIntl() */}


  );
}
```

## 为 iframe 打包

写完 React component 后，你可以把它构建成 server 可 inline 的单个 JavaScript module：

```json
// package.json
{
  "scripts": {
    "build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js"
  }
}
```

运行 `npm run build` 生成 `dist/component.js`。如果 esbuild 抱怨缺少 dependencies，请确认你已在 `web/` directory 中运行 `npm install`，并且 imports 与已安装 package names 匹配（例如 `@react-dnd/html5-backend` vs `react-dnd-html5-backend`）。

## 在 server response 中嵌入 component

有关如何在 MCP server response 中嵌入 component，请参阅 [Set up your server docs](https://developers.openai.com/apps-sdk/build/mcp-server)。

Component UI templates 是 production 的推荐路径。

开发期间，你可以在 React code 变化时重新构建 component bundle，并 hot-reload server。
