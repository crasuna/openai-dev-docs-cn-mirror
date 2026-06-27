---
status: needs-review
sourceId: "6bc3f12b0581"
sourceChecksum: "6bc3f12b058155cd3be34ea972d8aa4143b02ca977c0d5ebad1dc50cd2f1dd02"
sourceUrl: "https://developers.openai.com/apps-sdk/reference"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# Reference

<strong>构建一次，在多处运行。</strong> ChatGPT 实现了用于 UI 集成的 MCP
  Apps 标准，这一标准吸收了我们构建 ChatGPT
  Apps 时的经验。Apps SDK 支持会持续存在，我们没有弃用计划。默认请使用
  MCP Apps standard fields 和 `ui/*` bridge。
  <strong>OpenAI extensions 是可选的</strong>；当你需要 ChatGPT-specific capabilities 时，它们位于 `window.openai`
  中。

## MCP Apps UI bridge

UI 集成使用基于 `postMessage` 的 JSON-RPC 2.0，并配合 `ui/*` methods 和
notifications。

常见 messages：

| Category | MCP Apps method/notification | Purpose |
| ------------------ | ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Tool inputs | `ui/notifications/tool-input` | 触发 UI 的最新 tool input。对于 approval-gated tools，它可能在 iframe 首次挂载后才到达。 |
| Tool results | `ui/notifications/tool-result` | 最新 tool result（包含 `structuredContent`、`content`、`_meta`）。 |
| Tool calls | `tools/call` | 直接从 UI 调用 MCP tool。 |
| Follow-up messages | `ui/message` | 请求 host 发布一条消息。 |
| Model context | `ui/update-model-context` | 从 UI state 更新 model-visible context。 |

有关从 Apps SDK APIs 迁移的概览和映射指南，请参见
[MCP Apps compatibility in ChatGPT](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt)。

## `window.openai` component bridge

ChatGPT 提供 `window.openai`，作为 Apps SDK compatibility layer 以及一组可选的
ChatGPT extensions。

实现 walkthroughs 请参见 [build a ChatGPT UI](https://developers.openai.com/apps-sdk/build/chatgpt-ui)。

如果你的 tool 需要 confirmation，请将缺失初始 `toolInput` 视为预期行为。ChatGPT 不会在 approval 前把 approval-gated arguments 预加载到 widget globals；相反，一旦用户批准调用，host 会通过
`ui/notifications/tool-input` 交付它们。

### Capabilities

| Capability | What it does | Typical use |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| State & data | `window.openai.toolInput` | tool 被调用时提供的 arguments。对于 approval-gated tools，在 host 于 approval 后发送 `ui/notifications/tool-input` 之前，它可能保持 `null`。 |
| State & data | `window.openai.toolOutput` | 你的 `structuredContent`。保持字段简洁；模型会逐字读取它们。 |
| State & data | `window.openai.toolResponseMetadata` | 规范的 widget-only tool result metadata。在 ChatGPT 中，这包括 `status`、`call_tool_result` 和 `mcp_tool_result`，保留完整 MCP result envelope，包括隐藏的 `_meta`。 |
| State & data | `window.openai.widgetState` | 在 renders 之间持久化的 UI state 快照。 |
| State & data | `window.openai.setWidgetState(state)` | 同步存储新的快照；每次有意义的 UI interaction 后都应调用。 |
| Widget runtime APIs | `window.openai.callTool(name, args)` | 从 widget 调用另一个 MCP tool（镜像 model-initiated calls）。 |
| Widget runtime APIs | `window.openai.sendFollowUpMessage({ prompt, scrollToBottom })` | 请求 ChatGPT 发布一条由 component 编写的消息。`scrollToBottom` 是可选项，默认为 `true`，可设为 `false` 以阻止自动滚动。 |
| Widget runtime APIs | `window.openai.uploadFile(file, { library?: boolean })` | 上传用户选择的文件并接收 `fileId`。传入 `{ library: true }` 时，如果当前用户可用，也会将上传内容保存到用户的 ChatGPT file library。 |
| Widget runtime APIs | `window.openai.selectFiles()` | 打开 ChatGPT 的 file library picker，并以 `{ fileId, fileName, mimeType }[]` 返回 app-authorized files。请 feature-detect 此 helper，因为 file library 可能并非对所有用户可用。 |
| Widget runtime APIs | `window.openai.getFileDownloadUrl({ fileId })` | 为由 widget 上传、从 file library 选择、经 file params 传入或由 tool file references 返回的文件获取临时 download URL。 |
| Widget runtime APIs | `window.openai.requestDisplayMode(...)` | 请求 PiP/fullscreen modes。 |
| Widget runtime APIs | `window.openai.requestModal({ params, template })` | 生成由 ChatGPT 拥有的 modal。省略 `template` 可使用当前 template，或传入已注册的 template URI 以切换 modal content。 |
| Widget runtime APIs | `window.openai.requestClose()` | 请求 ChatGPT 关闭当前 widget。 |
| Widget runtime APIs | `window.openai.notifyIntrinsicHeight(...)` | 报告动态 widget heights，以避免 scroll clipping。 |
| Widget runtime APIs | `window.openai.openExternal({ href, redirectUrl })` | 在用户浏览器中打开经过审核的 external link。对于 allowlisted redirect targets，ChatGPT 默认附加 `?redirectUrl=...`；设为 `redirectUrl: false` 可跳过。 |
| Widget runtime APIs | `window.openai.setOpenInAppUrl({ href })` | 可选择覆盖 fullscreen “Open in &lt;App&gt;” 目标。如果未设置，ChatGPT 保持默认行为并打开 widget 当前 iframe path。 |
| Context | `window.openai.theme`, `window.openai.displayMode`, `window.openai.maxHeight`, `window.openai.safeArea`, `window.openai.view`, `window.openai.userAgent`, `window.openai.locale` | 你可以读取的 environment signals，也可以通过 `useOpenAiGlobal` 订阅，用于适配 visuals 和 copy。 |

### `useOpenAiGlobal` helper

许多 Apps SDK 项目会把 `window.openai` 访问包装在小型 helper functions 中，让 views 保持可测试。此示例 helper 会监听 host `openai:set_globals` events，并让 React components 订阅单个 global value：

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

## File APIs

ChatGPT 支持文件 upload/download helpers，作为可选的 `window.openai`
extensions。

| API | Purpose | Notes |
| ------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `window.openai.uploadFile(file, { library?: boolean })` | 上传用户选择的文件并接收 `fileId`。 | 传入 `{ library: true }` 时，如果当前用户可用，也会将上传内容保存到用户的 ChatGPT file library。 |
| `window.openai.selectFiles()` | 打开现有文件的 file library picker。 | 返回 `[{ fileId, fileName, mimeType }]`。请 feature-detect 此 helper，因为 file library 可能并非对所有用户可用。 |
| `window.openai.getFileDownloadUrl({ fileId })` | 请求文件的临时 download URL。 | 适用于由 widget 上传、从 file library 选择、经 file params 传入或由 tool file references 返回的文件。 |

ChatGPT file library 是可选的，可能并非对每位用户都可用。
当 helper 可用时，`window.openai.selectFiles()` 返回的文件已经获得当前 app 授权。请将返回的 `fileId` 用于
`window.openai.getFileDownloadUrl({ fileId })`，或用于使用 file params 的 tool input。

Tool file references 使用 snake case fields：

```json
{
  "download_url": "https://...",
  "file_id": "file_...",
  "mime_type": "image/png",
  "file_name": "input.png"
}
```

`download_url` 和 `file_id` 是必需的。`mime_type` 和 `file_name` 是
optional。当 widget 需要新的临时 download URL 时，请将 `file_id` 作为
`window.openai.getFileDownloadUrl({ fileId })` 的 `fileId` 值。

持久化 widget state 时，如果你希望模型在 follow-up turns 中看到 image IDs，请使用结构化 shape（`modelContent`, `privateContent`, `imageIds`）。

## Tool descriptor parameters

需要了解这些 fields 的更多背景？请查看 [Advanced section of the MCP server guide](https://developers.openai.com/apps-sdk/build/mcp-server#advanced)。

默认情况下，tool description 应包含[此处](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool)列出的 fields。

对任何返回 `structuredContent` 的 tool 声明 `outputSchema`。该 schema 应描述你的 tool 返回的确切 object，这样 clients 可以验证 results，模型也可以推理 follow-up tool calls。

### Tool descriptor 上的 `_meta` fields

在 tool descriptor 上使用这些 `_meta` fields。将 tool 链接到 UI template 时，优先使用 MCP Apps 标准 key `_meta.ui.resourceUri`。ChatGPT 支持 OpenAI-specific metadata，用于兼容性和可选 extensions。

| Key | Placement | Type | Limits | Purpose |
| ----------------------------------------- | :-------------: | ------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `_meta["securitySchemes"]` | Tool descriptor | array | None | 针对只读取 `_meta` 的 clients 的 back-compat mirror。 |
| `_meta.ui.resourceUri` | Tool descriptor | string (URI) | None | UI template 的标准 resource URI。 |
| `_meta.ui.visibility` | Tool descriptor | string[] | default `["model", "app"]` | 控制 tool 是否可供模型、UI（app）或两者使用。 |
| `_meta["openai/outputTemplate"]` | Tool descriptor | string (URI) | None | ChatGPT 中 `_meta.ui.resourceUri` 的 OpenAI-specific 可选/兼容别名。 |
| `_meta["openai/widgetAccessible"]` | Tool descriptor | boolean | default `false` | 现有 Apps SDK apps 使用的 OpenAI-specific compatibility field；优先使用 `_meta.ui.visibility` + `tools/call`。 |
| `_meta["openai/visibility"]` | Tool descriptor | string | `public` (default) or `private` | 现有 Apps SDK apps 使用的 OpenAI-specific compatibility field；优先使用 `_meta.ui.visibility`。 |
| `_meta["openai/toolInvocation/invoking"]` | Tool descriptor | string | ≤ 64 chars | tool 运行时的短 status text。 |
| `_meta["openai/toolInvocation/invoked"]` | Tool descriptor | string | ≤ 64 chars | tool 完成后的短 status text。 |
| `_meta["openai/fileParams"]` | Tool descriptor | string[] | None | 表示文件的顶层 input fields 列表。每个 field 会收到 `{ download_url, file_id, mime_type?, file_name? }`。 |

Example:

```ts



registerAppTool(
  server,
  "search",
  {
    title: "Public Search",
    description: "Search public documents.",
    inputSchema: { q: z.string() },
    outputSchema: {
      results: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          url: z.string(),
        })
      ),
    },
    securitySchemes: [
      { type: "noauth" },
      { type: "oauth2", scopes: ["search.read"] },
    ],
    _meta: {
      securitySchemes: [
        { type: "noauth" },
        { type: "oauth2", scopes: ["search.read"] },
      ],
      ui: { resourceUri: "ui://widget/story.html" },
      // Optional compatibility alias (ChatGPT only):
      // "openai/outputTemplate": "ui://widget/story.html",
      "openai/toolInvocation/invoking": "Searching…",
      "openai/toolInvocation/invoked": "Results ready",
    },
  },
  async ({ q }) => {
    const results = await performSearch(q);

    return {
      structuredContent: { results },
      content: [{ type: "text", text: `Found ${results.length} results.` }],
    };
  }
);
```

### Annotations

要将 tool 标记为 "read-only"，请在 tool descriptor 上使用以下 [annotation](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#annotations)：

| Key | Type | Required | Notes |
| ----------------- | ------- | :------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `readOnlyHint` | boolean | Required | 表示该 tool 只检索或计算信息，不会在 ChatGPT 外创建、更新、删除或发送数据。 |
| `destructiveHint` | boolean | Required | 声明该 tool 可能删除或覆盖用户数据，让 ChatGPT 知道需要先请求明确批准。 |
| `openWorldHint` | boolean | Required | 声明该 tool 会发布内容或触达当前用户账户之外的范围，提示 client 在请求批准前总结影响。 |
| `idempotentHint` | boolean | Optional | 声明使用相同 arguments 调用该 tool 不会对其环境产生额外影响。 |

这些 hints 只影响 ChatGPT 如何向用户描述 tool call；servers 仍必须强制执行自己的 authorization logic。

Example:

```ts


server.registerTool(
  "list_saved_recipes",
  {
    title: "List saved recipes",
    description: "Returns the user’s saved recipes without modifying them.",
    inputSchema: {},
    outputSchema: {
      recipes: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
        })
      ),
    },
    annotations: { readOnlyHint: true },
  },
  async () => ({
    structuredContent: { recipes: await fetchSavedRecipes() },
  })
);
```

需要了解这些 fields 的更多背景？请查看 [Advanced section of the MCP server guide](https://developers.openai.com/apps-sdk/build/mcp-server#advanced)。

## Component resource `_meta` fields

这些 resource settings 的更多细节位于 [Advanced section of the MCP server guide](https://developers.openai.com/apps-sdk/build/mcp-server#advanced)。

在提供 component 的 resource template（`registerResource`）上设置这些 keys。它们帮助 ChatGPT 描述和框定渲染后的 iframe，同时不会将 metadata 泄露给其他 clients。

| Key | Placement | Type | Purpose |
| ------------------------------------- | :---------------: | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_meta.ui.prefersBorder` | Resource contents | boolean | 提示在支持时 component 应渲染在带边框的 card 内。 |
| `_meta.ui.csp` | Resource contents | object | 标准 widget CSP fields 的首选 metadata surface：`connectDomains`、`resourceDomains`，以及可选的 `frameDomains`。 |
| `_meta.ui.domain` | Resource contents | string (origin) | hosted components 的专用 origin（app submission 必需；每个 app 必须唯一）。默认是 `https://web-sandbox.oaiusercontent.com`。 |
| `_meta["openai/widgetDescription"]` | Resource contents | string | component 加载时向模型展示的人类可读摘要，可减少冗余 assistant narration。 |
| `_meta["openai/widgetPrefersBorder"]` | Resource contents | boolean | ChatGPT 中 `_meta.ui.prefersBorder` 的 OpenAI-specific compatibility alias。 |
| `_meta["openai/widgetCSP"]` | Resource contents | object | 用于 widget CSP metadata 的 legacy ChatGPT compatibility key。标准 CSP fields 已由 `_meta.ui.csp` 取代，但 `redirect_domains` 仍是受信任 `openExternal` destinations 所必需的。 |
| `_meta["openai/widgetDomain"]` | Resource contents | string (origin) | ChatGPT 中 `_meta.ui.domain` 的 OpenAI-specific compatibility alias。 |

ChatGPT 支持 legacy `_meta["openai/widgetCSP"]` compatibility key，并使用以下 snake_case field names：

- `connect_domains`: `string[]`
- `resource_domains`: `string[]`
- `frame_domains?`: `string[]`
- `redirect_domains?`: `string[]`。这是 ChatGPT extension，用于 `window.openai.openExternal` redirect targets。

新 apps 通常优先使用标准 `_meta.ui.csp` object，它支持：

- `connectDomains`: `string[]`。widget 可以通过 fetch/XHR 联系的 domains。
- `resourceDomains`: `string[]`。static assets（images、fonts、scripts、styles）的 domains。
- `frameDomains?`: `string[]`。允许 iframe embeds 的 origins 可选列表。默认情况下，widgets 不能渲染 subframes；添加 `frameDomains` 表示选择启用 iframe，并触发更严格的 app review。

不过，`_meta.ui.csp` 不支持用于 `window.openai.openExternal(...)` links 的 `redirect_domains`。要 allowlist redirect targets，你仍必须设置 `_meta["openai/widgetCSP"].redirect_domains`。

## Tool results

[Advanced section of the MCP server guide](https://developers.openai.com/apps-sdk/build/mcp-server#advanced) 对这些 response fields 的组织方式提供了更多指导。

Tool results 可以包含以下 [fields](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result)。特别是：

| Key | Type | Required | Notes |
| ------------------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `structuredContent` | object | Optional | 向模型和 component 展示。提供 `outputSchema` 时，必须与声明的 `outputSchema` 匹配。 |
| `content` | string or `Content[]` | Optional | 向模型和 component 展示。 |
| `_meta` | object | Optional | 只交付给 component。对模型隐藏。 |

只有 `structuredContent` 和 `content` 会出现在 conversation transcript 中。host 会将 `_meta` 转发给 component，以便你在不向模型暴露数据的情况下水合 UI。

Host-provided tool result metadata：

| Key | Placement | Type | Purpose |
| --------------------------------- | :-----------------------------: | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| `_meta["openai/widgetSessionId"]` | Tool result `_meta` (from host) | string | 当前挂载 widget instance 的稳定 ID；在 widget unmount 前可用它关联 logs 和 tool calls。 |

Example:

```ts



registerAppTool(
  server,
  "get_zoo_animals",
  {
    title: "get_zoo_animals",
    inputSchema: { count: z.number().int().min(1).max(20).optional() },
    outputSchema: {
      animals: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          species: z.string(),
        })
      ),
    },
    _meta: { ui: { resourceUri: "ui://widget/widget.html" } },
  },
  async ({ count = 10 }) => {
    const animals = generateZooAnimals(count);

    return {
      structuredContent: { animals },
      content: [{ type: "text", text: `Here are ${animals.length} animals.` }],
      _meta: {
        allAnimalsById: Object.fromEntries(
          animals.map((animal) => [animal.id, animal])
        ),
      },
    };
  }
);
```

### Error tool result

要在 tool result 上返回 error，请使用以下 `_meta` key：

| Key | Purpose | Type | Notes |
| ------------------------------- | ------------ | ------------------ | -------------------------------------------------------- |
| `_meta["mcp/www_authenticate"]` | Error result | string or string[] | 触发 OAuth 的 RFC 7235 `WWW-Authenticate` challenges。 |

## Client 提供的 `_meta` fields

更广泛的 client-supplied hints 背景请参见 [Advanced section of the MCP server guide](https://developers.openai.com/apps-sdk/build/mcp-server#advanced)。

| Key | When provided | Type | Purpose |
| ------------------------------ | ----------------------- | --------------- | -------------------------------------------------------------------------------------------- |
| `_meta["openai/locale"]` | Initialize + tool calls | string (BCP 47) | 请求的 locale（较旧 clients 可能发送 `_meta["webplus/i18n"]`）。 |
| `_meta["openai/userAgent"]` | Tool calls | string | 可选、best-effort user agent hint，用于 analytics 或 formatting。 |
| `_meta["openai/userLocation"]` | Tool calls | object | 粗略 location hint（`city`, `region`, `country`, `timezone`, `longitude`, `latitude`）。 |
| `_meta["openai/subject"]` | Tool calls | string | 发送给 MCP servers 的 anonymized user id，用于 rate limiting 和 identification |
| `_meta["openai/session"]` | Tool calls | string | anonymized conversation id，用于在同一 ChatGPT session 内关联 tool calls。 |
| `_meta["openai/organization"]` | Tool calls | string | 当前 ChatGPT organization 关联的 anonymized organization id（如可用）。 |

Operation-phase `_meta["openai/userAgent"]` 和 `_meta["openai/userLocation"]` 只是 hints；servers 不应依赖它们进行 authorization decisions，并且必须容忍它们缺失。请将 `_meta["openai/userAgent"]` 视为可选的 best-effort metadata，而不是检测哪个 host surface 正在调用你的 server 的稳定方式。

Example:

```ts


server.registerTool(
  "recommend_cafe",
  {
    title: "Recommend a cafe",
    inputSchema: {},
    outputSchema: {
      cafes: z.array(
        z.object({
          name: z.string(),
          address: z.string(),
        })
      ),
    },
  },
  async (_args, { _meta }) => {
    const locale = _meta?.["openai/locale"] ?? "en";
    const location = _meta?.["openai/userLocation"]?.city;
    const cafes = await findNearbyCafes(location);

    return {
      content: [{ type: "text", text: formatIntro(locale, location) }],
      structuredContent: { cafes },
    };
  }
);
```
