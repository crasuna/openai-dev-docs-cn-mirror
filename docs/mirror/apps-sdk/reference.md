---
title: "参考"
description: "Schema and API fields for tools, resources, and components."
outline: deep
---

# 参考

**文档集**：Apps SDK  
**分组**：Documentation sets  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/reference](https://developers.openai.com/apps-sdk/reference)
- Markdown 来源：[https://developers.openai.com/apps-sdk/reference.md](https://developers.openai.com/apps-sdk/reference.md)
- 抓取时间：2026-06-27T05:54:49.318Z
- Checksum：`6bc3f12b058155cd3be34ea972d8aa4143b02ca977c0d5ebad1dc50cd2f1dd02`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
&lt;strong&gt;构建一次，在多处运行。&lt;/strong&gt; ChatGPT 实现了用于 UI 集成的 MCP
  Apps 标准，这一标准吸收了我们构建 ChatGPT
  Apps 时的经验。Apps SDK 支持会持续存在，我们没有弃用计划。默认请使用
  MCP Apps standard fields 和 `ui/*` bridge。
  &lt;strong&gt;OpenAI extensions 是可选的&lt;/strong&gt;；当你需要 ChatGPT-specific capabilities 时，它们位于 `window.openai`
  中。

## MCP Apps UI 桥接

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
[MCP Apps compatibility in ChatGPT](/mirror/apps-sdk/mcp-apps-in-chatgpt)。

## `window.openai` 组件桥接

ChatGPT 提供 `window.openai`，作为 Apps SDK compatibility layer 以及一组可选的
ChatGPT extensions。

实现演练请参见 [构建 ChatGPT UI](/mirror/apps-sdk/build/chatgpt-ui)。

如果你的 tool 需要 confirmation，请将缺失初始 `toolInput` 视为预期行为。ChatGPT 不会在 approval 前把 approval-gated arguments 预加载到 widget globals；相反，一旦用户批准调用，host 会通过
`ui/notifications/tool-input` 交付它们。

### 能力

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

### `useOpenAiGlobal` 辅助函数

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

## 文件 API

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

## 工具描述符参数

需要了解这些字段的更多背景？请查看 [MCP 服务器指南的高级部分](/mirror/apps-sdk/build/mcp-server#advanced)。

默认情况下，工具描述应包含[此处](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool)列出的字段。

对任何返回 `structuredContent` 的 tool 声明 `outputSchema`。该 schema 应描述你的 tool 返回的确切 object，这样 clients 可以验证 results，模型也可以推理 follow-up tool calls。

### 工具描述符上的 `_meta` 字段

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

### 注解

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

需要了解这些 fields 的更多背景？请查看 [Advanced section of the MCP server guide](/mirror/apps-sdk/build/mcp-server#advanced)。

## 组件资源 `_meta` 字段

这些资源设置的更多细节位于 [MCP 服务器指南的高级部分](/mirror/apps-sdk/build/mcp-server#advanced)。

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

## 工具结果

[MCP 服务器指南的高级部分](/mirror/apps-sdk/build/mcp-server#advanced) 对这些响应字段的组织方式提供了更多指导。

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

### 错误工具结果

要在 tool result 上返回 error，请使用以下 `_meta` key：

| Key | Purpose | Type | Notes |
| ------------------------------- | ------------ | ------------------ | -------------------------------------------------------- |
| `_meta["mcp/www_authenticate"]` | Error result | string or string[] | 触发 OAuth 的 RFC 7235 `WWW-Authenticate` challenges。 |

## 客户端提供的 `_meta` 字段

更广泛的客户端提示背景请参见 [MCP 服务器指南的高级部分](/mirror/apps-sdk/build/mcp-server#advanced)。

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

:::

## English source

::: details 展开英文原文
::: v-pre
&lt;strong&gt;Build once, run in many places.&lt;/strong&gt; ChatGPT implements the MCP
  Apps standard for UI integration, informed by what we learned building ChatGPT
  Apps. Apps SDK support is here to stay—we have no plans to deprecate it. Use
  MCP Apps standard fields and the `ui/*` bridge by default.
  &lt;strong&gt;OpenAI extensions are optional&lt;/strong&gt; and live in `window.openai`
  when you want ChatGPT-specific capabilities.

## MCP Apps UI bridge

UI integrations use JSON-RPC 2.0 over `postMessage` with `ui/*` methods and
notifications.

Common messages:

| Category           | MCP Apps method/notification   | Purpose                                                                                                         |
| ------------------ | ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Tool inputs        | `ui/notifications/tool-input`  | Latest tool input that invoked the UI. For approval-gated tools, this may arrive after the iframe first mounts. |
| Tool results       | `ui/notifications/tool-result` | Latest tool result (includes `structuredContent`, `content`, `_meta`).                                          |
| Tool calls         | `tools/call`                   | Call an MCP tool directly from the UI.                                                                          |
| Follow-up messages | `ui/message`                   | Ask the host to post a message.                                                                                 |
| Model context      | `ui/update-model-context`      | Update model-visible context from UI state.                                                                     |

For an overview and a mapping guide from Apps SDK APIs, see
[MCP Apps compatibility in ChatGPT](/mirror/apps-sdk/mcp-apps-in-chatgpt).

## `window.openai` component bridge

ChatGPT provides `window.openai` as an Apps SDK compatibility layer and a set of
optional ChatGPT extensions.

See [build a ChatGPT UI](/mirror/apps-sdk/build/chatgpt-ui) for implementation walkthroughs.

If your tool requires confirmation, treat missing initial `toolInput` as
expected. ChatGPT does not preload approval-gated arguments into widget globals
before approval; instead, the host delivers them through
`ui/notifications/tool-input` once the user approves the call.

### Capabilities

| Capability          | What it does                                                                                                                                                                     | Typical use                                                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| State & data        | `window.openai.toolInput`                                                                                                                                                        | Arguments supplied when the tool was invoked. For approval-gated tools, this may remain `null` until the host sends `ui/notifications/tool-input` after approval.                                |
| State & data        | `window.openai.toolOutput`                                                                                                                                                       | Your `structuredContent`. Keep fields concise; the model reads them verbatim.                                                                                                                    |
| State & data        | `window.openai.toolResponseMetadata`                                                                                                                                             | Canonical widget-only tool result metadata. In ChatGPT this includes `status`, `call_tool_result`, and `mcp_tool_result`, preserving the full MCP result envelope, including hidden `_meta`.     |
| State & data        | `window.openai.widgetState`                                                                                                                                                      | Snapshot of UI state persisted between renders.                                                                                                                                                  |
| State & data        | `window.openai.setWidgetState(state)`                                                                                                                                            | Stores a new snapshot synchronously; call it after every meaningful UI interaction.                                                                                                              |
| Widget runtime APIs | `window.openai.callTool(name, args)`                                                                                                                                             | Invoke another MCP tool from the widget (mirrors model-initiated calls).                                                                                                                         |
| Widget runtime APIs | `window.openai.sendFollowUpMessage({ prompt, scrollToBottom })`                                                                                                                  | Ask ChatGPT to post a message authored by the component. `scrollToBottom` is optional, defaults to `true`, and can be set to `false` to prevent auto-scroll.                                     |
| Widget runtime APIs | `window.openai.uploadFile(file, { library?: boolean })`                                                                                                                          | Upload a user-selected file and receive a `fileId`. Pass `{ library: true }` to also save the upload in the user's ChatGPT file library when that library is available.                          |
| Widget runtime APIs | `window.openai.selectFiles()`                                                                                                                                                    | Open ChatGPT's file library picker and return app-authorized files as `{ fileId, fileName, mimeType }[]`. Feature-detect this helper because the file library may not be available to all users. |
| Widget runtime APIs | `window.openai.getFileDownloadUrl({ fileId })`                                                                                                                                   | Retrieve a temporary download URL for a file uploaded by the widget, selected from the file library, passed via file params, or returned by tool file references.                                |
| Widget runtime APIs | `window.openai.requestDisplayMode(...)`                                                                                                                                          | Request PiP/fullscreen modes.                                                                                                                                                                    |
| Widget runtime APIs | `window.openai.requestModal({ params, template })`                                                                                                                               | Spawn a modal owned by ChatGPT. Omit `template` to use the current template, or pass a registered template URI to switch modal content.                                                          |
| Widget runtime APIs | `window.openai.requestClose()`                                                                                                                                                   | Ask ChatGPT to close the current widget.                                                                                                                                                         |
| Widget runtime APIs | `window.openai.notifyIntrinsicHeight(...)`                                                                                                                                       | Report dynamic widget heights to avoid scroll clipping.                                                                                                                                          |
| Widget runtime APIs | `window.openai.openExternal({ href, redirectUrl })`                                                                                                                              | Open a vetted external link in the user's browser. For allowlisted redirect targets, ChatGPT appends `?redirectUrl=...` by default; set `redirectUrl: false` to skip it.                         |
| Widget runtime APIs | `window.openai.setOpenInAppUrl({ href })`                                                                                                                                        | Optionally override the fullscreen "Open in &lt;App&gt;" target. If unset, ChatGPT keeps the default behavior and opens the widget's current iframe path.                                        |
| Context             | `window.openai.theme`, `window.openai.displayMode`, `window.openai.maxHeight`, `window.openai.safeArea`, `window.openai.view`, `window.openai.userAgent`, `window.openai.locale` | Environment signals you can read—or subscribe to via `useOpenAiGlobal`—to adapt visuals and copy.                                                                                                |

### `useOpenAiGlobal` helper

Many Apps SDK projects wrap `window.openai` access in small helper functions so views remain testable. This example helper listens for host `openai:set_globals` events and lets React components subscribe to a single global value:

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

ChatGPT supports file upload/download helpers as optional `window.openai`
extensions.

| API                                                     | Purpose                                             | Notes                                                                                                                                   |
| ------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `window.openai.uploadFile(file, { library?: boolean })` | Upload a user-selected file and receive a `fileId`. | Pass `{ library: true }` to also save the upload in the user's ChatGPT file library when that library is available to the current user. |
| `window.openai.selectFiles()`                           | Open the file library picker for existing files.    | Returns `[{ fileId, fileName, mimeType }]`. Feature-detect this helper because the file library may not be available to all users.      |
| `window.openai.getFileDownloadUrl({ fileId })`          | Request a temporary download URL for a file.        | Works for files uploaded by the widget, selected from the file library, passed via file params, or returned by tool file references.    |

The ChatGPT file library is optional and may not be available to every user.
Files returned from `window.openai.selectFiles()` are already authorized for
the current app when the helper is available. Use the returned `fileId` with
`window.openai.getFileDownloadUrl({ fileId })` or in a tool input that uses
file params.

Tool file references use snake case fields:

```json
{
  "download_url": "https://...",
  "file_id": "file_...",
  "mime_type": "image/png",
  "file_name": "input.png"
}
```

`download_url` and `file_id` are required. `mime_type` and `file_name` are
optional. Use `file_id` as the `fileId` value for
`window.openai.getFileDownloadUrl({ fileId })` when a widget needs a fresh
temporary download URL.

When persisting widget state, use the structured shape (`modelContent`, `privateContent`, `imageIds`) if you want the model to see image IDs during follow-up turns.

## Tool descriptor parameters

Need more background on these fields? Check the [Advanced section of the MCP server guide](/mirror/apps-sdk/build/mcp-server#advanced).

By default, a tool description should include the fields listed [here](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool).

Declare `outputSchema` for any tool that returns `structuredContent`. The
schema should describe the exact object your tool returns so clients can
validate results and the model can reason about follow-up tool calls.

### `_meta` fields on tool descriptor

Use these `_meta` fields on the tool descriptor. Prefer the MCP Apps standard
key `_meta.ui.resourceUri` for linking a tool to a UI template. ChatGPT supports
OpenAI-specific metadata for compatibility and optional extensions.

| Key                                       |    Placement    | Type         | Limits                          | Purpose                                                                                                                       |
| ----------------------------------------- | :-------------: | ------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `_meta["securitySchemes"]`                | Tool descriptor | array        | None                            | Back-compat mirror for clients that only read `_meta`.                                                                        |
| `_meta.ui.resourceUri`                    | Tool descriptor | string (URI) | None                            | Standard resource URI for the UI template.                                                                                    |
| `_meta.ui.visibility`                     | Tool descriptor | string[]     | default `["model", "app"]`      | Controls whether a tool is available to the model, the UI (app), or both.                                                     |
| `_meta["openai/outputTemplate"]`          | Tool descriptor | string (URI) | None                            | OpenAI-specific optional/compatibility alias for `_meta.ui.resourceUri` in ChatGPT.                                           |
| `_meta["openai/widgetAccessible"]`        | Tool descriptor | boolean      | default `false`                 | OpenAI-specific compatibility field used by existing Apps SDK apps; prefer `_meta.ui.visibility` + `tools/call`.              |
| `_meta["openai/visibility"]`              | Tool descriptor | string       | `public` (default) or `private` | OpenAI-specific compatibility field used by existing Apps SDK apps; prefer `_meta.ui.visibility`.                             |
| `_meta["openai/toolInvocation/invoking"]` | Tool descriptor | string       | ≤ 64 chars                      | Short status text while the tool runs.                                                                                        |
| `_meta["openai/toolInvocation/invoked"]`  | Tool descriptor | string       | ≤ 64 chars                      | Short status text after the tool completes.                                                                                   |
| `_meta["openai/fileParams"]`              | Tool descriptor | string[]     | None                            | List of top-level input fields that represent files. Each field receives `{ download_url, file_id, mime_type?, file_name? }`. |

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

To label a tool as "read-only," please use the following [annotation](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#annotations) on the tool descriptor:

| Key               | Type    | Required | Notes                                                                                                                                                           |
| ----------------- | ------- | :------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `readOnlyHint`    | boolean | Required | Signal that the tool only retrieves or computes information and doesn't create, update, delete, or send data outside of ChatGPT.                                |
| `destructiveHint` | boolean | Required | Declare that the tool may delete or overwrite user data so ChatGPT knows to elicit explicit approval first.                                                     |
| `openWorldHint`   | boolean | Required | Declare that the tool publishes content or reaches outside the current user’s account, prompting the client to summarize the impact before asking for approval. |
| `idempotentHint`  | boolean | Optional | Declare that calling the tool with the same arguments has no extra effect on its environment.                                                                   |

These hints only influence how ChatGPT frames the tool call to the user; servers must still enforce their own authorization logic.

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

Need more background on these fields? Check the [Advanced section of the MCP server guide](/mirror/apps-sdk/build/mcp-server#advanced).

## Component resource `_meta` fields

More detail on these resource settings lives in the [Advanced section of the MCP server guide](/mirror/apps-sdk/build/mcp-server#advanced).

Set these keys on the resource template that serves your component (`registerResource`). They help ChatGPT describe and frame the rendered iframe without leaking metadata to other clients.

| Key                                   |     Placement     | Type            | Purpose                                                                                                                                                                                           |
| ------------------------------------- | :---------------: | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_meta.ui.prefersBorder`              | Resource contents | boolean         | Hint that the component should render inside a bordered card when supported.                                                                                                                      |
| `_meta.ui.csp`                        | Resource contents | object          | Preferred metadata surface for standard widget CSP fields: `connectDomains`, `resourceDomains`, and optional `frameDomains`.                                                                      |
| `_meta.ui.domain`                     | Resource contents | string (origin) | Dedicated origin for hosted components (required for app submission; must be unique per app). Defaults to `https://web-sandbox.oaiusercontent.com`.                                               |
| `_meta["openai/widgetDescription"]`   | Resource contents | string          | Human-readable summary surfaced to the model when the component loads, reducing redundant assistant narration.                                                                                    |
| `_meta["openai/widgetPrefersBorder"]` | Resource contents | boolean         | OpenAI-specific compatibility alias for `_meta.ui.prefersBorder` in ChatGPT.                                                                                                                      |
| `_meta["openai/widgetCSP"]`           | Resource contents | object          | Legacy ChatGPT compatibility key for widget CSP metadata. Standard CSP fields are superseded by `_meta.ui.csp`, but `redirect_domains` is still required for trusted `openExternal` destinations. |
| `_meta["openai/widgetDomain"]`        | Resource contents | string (origin) | OpenAI-specific compatibility alias for `_meta.ui.domain` in ChatGPT.                                                                                                                             |

ChatGPT supports the legacy `_meta["openai/widgetCSP"]` compatibility key with the following snake_case field names:

- `connect_domains`: `string[]`
- `resource_domains`: `string[]`
- `frame_domains?`: `string[]`
- `redirect_domains?`: `string[]`. ChatGPT extension for `window.openai.openExternal` redirect targets.

The standard `_meta.ui.csp` object is generally preferred for new apps and supports:

- `connectDomains`: `string[]`. Domains the widget may contact via fetch/XHR.
- `resourceDomains`: `string[]`. Domains for static assets (images, fonts, scripts, styles).
- `frameDomains?`: `string[]`. Optional list of origins allowed for iframe embeds. By default, widgets can't render subframes; adding `frameDomains` opts in to iframe usage and triggers stricter app review.

However, `_meta.ui.csp` does not support `redirect_domains` for `window.openai.openExternal(...)` links. To allowlist redirect targets, you must still set `_meta["openai/widgetCSP"].redirect_domains`.

## Tool results

The [Advanced section of the MCP server guide](/mirror/apps-sdk/build/mcp-server#advanced) provides more guidance on shaping these response fields.

Tool results can contain the following [fields](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result). Notably:

| Key                 | Type                  | Required | Notes                                                                                           |
| ------------------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `structuredContent` | object                | Optional | Surfaced to the model and the component. Must match the declared `outputSchema`, when provided. |
| `content`           | string or `Content[]` | Optional | Surfaced to the model and the component.                                                        |
| `_meta`             | object                | Optional | Delivered only to the component. Hidden from the model.                                         |

Only `structuredContent` and `content` appear in the conversation transcript. The host forwards `_meta` to the component so you can hydrate UI without exposing the data to the model.

Host-provided tool result metadata:

| Key                               |            Placement            | Type   | Purpose                                                                                                                 |
| --------------------------------- | :-----------------------------: | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| `_meta["openai/widgetSessionId"]` | Tool result `_meta` (from host) | string | Stable ID for the currently mounted widget instance; use it to correlate logs and tool calls until the widget unmounts. |

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

To return an error on the tool result, use the following `_meta` key:

| Key                             | Purpose      | Type               | Notes                                                    |
| ------------------------------- | ------------ | ------------------ | -------------------------------------------------------- |
| `_meta["mcp/www_authenticate"]` | Error result | string or string[] | RFC 7235 `WWW-Authenticate` challenges to trigger OAuth. |

## `_meta` fields the client provides

See the [Advanced section of the MCP server guide](/mirror/apps-sdk/build/mcp-server#advanced) for broader context on these client-supplied hints.

| Key                            | When provided           | Type            | Purpose                                                                                      |
| ------------------------------ | ----------------------- | --------------- | -------------------------------------------------------------------------------------------- |
| `_meta["openai/locale"]`       | Initialize + tool calls | string (BCP 47) | Requested locale (older clients may send `_meta["webplus/i18n"]`).                           |
| `_meta["openai/userAgent"]`    | Tool calls              | string          | Optional, best-effort user agent hint for analytics or formatting.                           |
| `_meta["openai/userLocation"]` | Tool calls              | object          | Coarse location hint (`city`, `region`, `country`, `timezone`, `longitude`, `latitude`).     |
| `_meta["openai/subject"]`      | Tool calls              | string          | Anonymized user id sent to MCP servers for the purposes of rate limiting and identification  |
| `_meta["openai/session"]`      | Tool calls              | string          | Anonymized conversation id for correlating tool calls within the same ChatGPT session.       |
| `_meta["openai/organization"]` | Tool calls              | string          | Anonymized organization id associated with the current ChatGPT organization, when available. |

Operation-phase `_meta["openai/userAgent"]` and `_meta["openai/userLocation"]` are hints only; servers should never rely on them for authorization decisions and must tolerate their absence. Treat `_meta["openai/userAgent"]` as optional, best-effort metadata rather than a stable way to detect which host surface is calling your server.

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

:::
:::

