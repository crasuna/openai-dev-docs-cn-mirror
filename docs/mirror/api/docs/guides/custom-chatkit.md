---
title: "ChatKit 高级集成"
description: "Use your own server with ChatKit to integrate agent workflows into your product with more customization."
outline: deep
---

# ChatKit 高级集成

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/custom-chatkit](https://developers.openai.com/api/docs/guides/custom-chatkit)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/custom-chatkit.md](https://developers.openai.com/api/docs/guides/custom-chatkit.md)
- 抓取时间：2026-06-27T05:54:00.822Z
- Checksum：`ee7eaad728669d3d9270c354425d9925123380f7c71eefb3b85e67aca864d050`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
当你需要完全控制能力，例如自定义身份验证、数据驻留、本地部署或定制的 agent 编排时，可以在自己的基础设施上运行 ChatKit。使用 OpenAI 的高级自托管选项来使用你自己的服务器和自定义 ChatKit。

Agent Builder 托管的 ChatKit 工作流正处于过渡窗口。对于新的
  ChatKit 应用，请基于你自己的服务端 agent 实现、ChatKit SDK
  和 Agents SDK 构建。请参阅 [ChatKit 过渡指南 →](/mirror/api/docs/guides/chatkit)

## 在自己的基础设施上运行 ChatKit

从较高层次看，高级 ChatKit 集成是构建自己的 ChatKit 服务器，并添加 widget 来搭建聊天界面的过程。你将使用 OpenAI API 和你的 ChatKit 服务器，构建由 OpenAI 模型驱动的自定义聊天体验。

![OpenAI 托管的 ChatKit](https://cdn.openai.com/API/docs/images/self-hosted.png)

## 设置你的 ChatKit 服务器

按照 [GitHub 上的服务器指南](https://github.com/openai/chatkit-python/blob/main/docs/server.md)学习如何处理传入请求、运行工具，以及
把结果流式传回客户端。下面的代码片段重点展示主要组件。

### 1. 安装服务器包

```bash
pip install openai-chatkit
```

### 2. 实现服务器类

`ChatKitServer` 驱动对话。重写 `respond`，以便在用户消息或客户端工具输出到达时流式传输事件。`stream_agent_response` 这类 helper 可以让连接 Agents SDK 变得简单。

```python
class MyChatKitServer(ChatKitServer):
    def __init__(self, data_store: Store, file_store: FileStore | None = None):
        super().__init__(data_store, file_store)

    assistant_agent = Agent[AgentContext](
        model="gpt-5.5",
        name="Assistant",
        instructions="You are a helpful assistant",
    )

    async def respond(
        self,
        thread: ThreadMetadata,
        input: UserMessageItem | ClientToolCallOutputItem,
        context: Any,
    ) -> AsyncIterator[Event]:
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )
        result = Runner.run_streamed(
            self.assistant_agent,
            await to_input_item(input, self.to_message_content),
            context=agent_context,
        )
        async for event in stream_agent_response(agent_context, result):
            yield event

    async def to_message_content(
        self, input: FilePart | ImagePart
    ) -> ResponseInputContentParam:
        raise NotImplementedError()
```


### 3. 暴露端点

使用你选择的框架把 HTTP 请求转发到服务器实例。例如，使用 FastAPI：

```python
app = FastAPI()
data_store = SQLiteStore()
file_store = DiskFileStore(data_store)
server = MyChatKitServer(data_store, file_store)

@app.post("/chatkit")
async def chatkit_endpoint(request: Request):
    result = await server.process(await request.body(), {})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    return Response(content=result.json, media_type="application/json")
```


### 4. 建立数据存储契约

实现 `chatkit.store.Store`，用你偏好的数据库持久化线程、消息和文件。默认示例使用 SQLite 进行本地开发。可以考虑把模型存储为 JSON blob，这样库更新时 schema 可以演进，而不需要迁移。

### 5. 提供文件存储契约

如果你支持上传，请提供 `FileStore` 实现。ChatKit 可使用直接上传（客户端把文件 POST 到你的端点）或两阶段上传（客户端请求签名 URL，然后上传到云存储）。暴露预览以支持内联缩略图，并在线程被移除时处理删除。

### 6. 从服务器触发客户端工具

客户端工具必须同时在客户端选项和你的 agent 上注册。使用 `ctx.context.client_tool_call` 从 Agents SDK 工具中把一次调用加入队列。

```python
@function_tool(description_override="Add an item to the user's todo list.")
async def add_to_todo_list(ctx: RunContextWrapper[AgentContext], item: str) -> None:
    ctx.context.client_tool_call = ClientToolCall(
        name="add_to_todo_list",
        arguments={"item": item},
    )

assistant_agent = Agent[AgentContext](
    model="gpt-5.5",
    name="Assistant",
    instructions="You are a helpful assistant",
    tools=[add_to_todo_list],
    tool_use_behavior=StopAtTools(stop_at_tool_names=[add_to_todo_list.name]),
)
```


### 7. 使用线程元数据和状态

使用 `thread.metadata` 存储服务端状态，例如上一次 Responses API run ID 或自定义标签。元数据不会暴露给客户端，但可在每次 `respond` 调用中使用。

### 8. 获取工具状态更新

长时间运行的工具可以通过 `ProgressUpdateEvent` 将进度流式传输到 UI。ChatKit 会用下一条 assistant 消息或 widget 输出来替换进度事件。

### 9. 使用服务器上下文

把自定义上下文对象传给 `server.process(body, context)`，以便在你的 store 和 file store 实现中强制执行权限或传播用户身份。

## 添加内联交互式 widget

widget 让 agent 可以在聊天界面内呈现丰富 UI。可将它们用于卡片、表单、文本块、列表和其他布局。`stream_widget` helper 可以立即渲染 widget，或在更新到达时流式传输更新。

```python
async def respond(
    self,
    thread: ThreadMetadata,
    input: UserMessageItem | ClientToolCallOutputItem,
    context: Any,
) -> AsyncIterator[Event]:
    widget = Card(
        children=[Text(
            id="description",
            value="Generated summary",
        )]
    )
    async for event in stream_widget(
        thread,
        widget,
        generate_id=lambda item_type: self.store.generate_item_id(item_type, thread, context),
    ):
        yield event
```


ChatKit 随附一整套 widget 节点（卡片、列表、表单、文本、按钮等）。请参阅 [GitHub 上的 widget 指南](https://github.com/openai/chatkit-python/blob/main/docs/widgets.md)，了解所有组件、props 和
流式传输指南。

请参阅 [Widget Builder](https://widgets.chatkit.studio/)，在交互式 UI 中探索和创建 widget。

## 使用操作

操作让 ChatKit UI 可以在不发送用户消息的情况下触发工作。将 `ActionConfig` 附加到任何支持它的 widget 节点；按钮、选择器和其他控件都可以流式传输新的线程项目，或就地更新 widget。当 widget 位于 `Form` 内部时，ChatKit 会把收集到的表单值包含在操作 payload 中。

在服务器端，在 `ChatKitServer` 上实现 `action` 方法来处理 payload，并可选择流式传输其他事件。你也可以通过设置 `handler="client"` 在客户端处理操作，在 JavaScript 中响应后再把后续工作转发给服务器。

请参阅 [GitHub 上的操作指南](https://github.com/openai/chatkit-python/blob/main/docs/actions.md)，了解串联操作、创建强类型 payload，以及协调客户端/服务器处理器等模式。

## 资源

使用以下资源和参考完成你的集成。

### 设计资源

- 下载 [OpenAI Sans Variable](https://drive.google.com/file/d/10-dMu1Oknxg3cNPHZOda9a1nEkSwSXE1/view?usp=sharing)。
- 复制该文件，并为你的产品自定义组件。

### 事件参考

ChatKit 会从 Web Component 发出 `CustomEvent` 实例。payload 形状如下：

```ts
type Events = {
  "chatkit.error": CustomEvent<{ error: Error }>;
  "chatkit.response.start": CustomEvent<void>;
  "chatkit.response.end": CustomEvent<void>;
  "chatkit.thread.change": CustomEvent<{ threadId: string | null }>;
  "chatkit.log": CustomEvent<{ name: string; data?: Record<string, unknown> }>;
};
```

### 选项参考

| 选项            | 类型                       | 说明                                                         | 默认值         |
| --------------- | -------------------------- | ------------------------------------------------------------ | -------------- |
| `apiURL`        | `string`                   | 实现 ChatKit 服务器协议的端点。                              | _必需_         |
| `fetch`         | `typeof fetch`             | 覆盖 fetch 调用（用于自定义 header 或 auth）。               | `window.fetch` |
| `theme`         | `"light" \| "dark"`        | UI 主题。                                                    | `"light"`      |
| `initialThread` | `string \| null`           | 挂载时打开的线程；`null` 显示新线程视图。                    | `null`         |
| `clientTools`   | `Record&lt;string, Function&gt;` | 暴露给模型的客户端执行工具。                                 |                |
| `header`        | `object \| boolean`        | Header 配置，或设为 `false` 以隐藏 header。                  | `true`         |
| `newThreadView` | `object`                   | 自定义问候文本和起始提示。                                   |                |
| `messages`      | `object`                   | 配置消息辅助能力（反馈、注释等）。                           |                |
| `composer`      | `object`                   | 控制附件、实体标签和 placeholder 文本。                      |                |
| `entities`      | `object`                   | 用于实体查找、点击处理和预览的回调。                         |                |

:::

## English source

::: details 展开英文原文
::: v-pre
When you need full control—custom authentication, data residency, on‑prem deployment, or bespoke agent orchestration—you can run ChatKit on your own infrastructure. Use OpenAI's advanced self‑hosted option to use your own server and customized ChatKit.

Agent Builder-hosted ChatKit workflows are in a transition window. For new
  ChatKit apps, build on your own server-side agent implementation with the
  ChatKit SDKs and the Agents SDK. See [ChatKit transition guidance →](/mirror/api/docs/guides/chatkit)

## Run ChatKit on your own infrastructure

At a high level, an advanced ChatKit integration is a process of building your own ChatKit server and adding widgets to build out your chat surface. You'll use OpenAI APIs and your ChatKit server to build a custom chat powered by OpenAI models.

![OpenAI-hosted ChatKit](https://cdn.openai.com/API/docs/images/self-hosted.png)

## Set up your ChatKit server

Follow the [server guide on GitHub](https://github.com/openai/chatkit-python/blob/main/docs/server.md) to learn how to handle incoming requests, run tools, and
stream results back to the client. The snippets below highlight the main components.

### 1. Install the server package

```bash
pip install openai-chatkit
```

### 2. Implement a server class

`ChatKitServer` drives the conversation. Override `respond` to stream events whenever a
user message or client tool output arrives. Helpers like `stream_agent_response` make it
simple to connect to the Agents SDK.

```python
class MyChatKitServer(ChatKitServer):
    def __init__(self, data_store: Store, file_store: FileStore | None = None):
        super().__init__(data_store, file_store)

    assistant_agent = Agent[AgentContext](
        model="gpt-5.5",
        name="Assistant",
        instructions="You are a helpful assistant",
    )

    async def respond(
        self,
        thread: ThreadMetadata,
        input: UserMessageItem | ClientToolCallOutputItem,
        context: Any,
    ) -> AsyncIterator[Event]:
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )
        result = Runner.run_streamed(
            self.assistant_agent,
            await to_input_item(input, self.to_message_content),
            context=agent_context,
        )
        async for event in stream_agent_response(agent_context, result):
            yield event

    async def to_message_content(
        self, input: FilePart | ImagePart
    ) -> ResponseInputContentParam:
        raise NotImplementedError()
```


### 3. Expose the endpoint

Use your framework of choice to forward HTTP requests to the server instance. For
example, with FastAPI:

```python
app = FastAPI()
data_store = SQLiteStore()
file_store = DiskFileStore(data_store)
server = MyChatKitServer(data_store, file_store)

@app.post("/chatkit")
async def chatkit_endpoint(request: Request):
    result = await server.process(await request.body(), {})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    return Response(content=result.json, media_type="application/json")
```


### 4. Establish data store contract

Implement `chatkit.store.Store` to persist threads, messages, and files using your
preferred database. The default example uses SQLite for local development. Consider
storing the models as JSON blobs so library updates can evolve the schema without
migrations.

### 5. Provide file store contract

Provide a `FileStore` implementation if you support uploads. ChatKit works with direct
uploads (the client POSTs the file to your endpoint) or two-phase uploads (the client
requests a signed URL, then uploads to cloud storage). Expose previews to support inline
thumbnails and handle deletions when threads are removed.

### 6. Trigger client tools from the server

Client tools must be registered both in the client options and on your agent. Use
`ctx.context.client_tool_call` to enqueue a call from an Agents SDK tool.

```python
@function_tool(description_override="Add an item to the user's todo list.")
async def add_to_todo_list(ctx: RunContextWrapper[AgentContext], item: str) -> None:
    ctx.context.client_tool_call = ClientToolCall(
        name="add_to_todo_list",
        arguments={"item": item},
    )

assistant_agent = Agent[AgentContext](
    model="gpt-5.5",
    name="Assistant",
    instructions="You are a helpful assistant",
    tools=[add_to_todo_list],
    tool_use_behavior=StopAtTools(stop_at_tool_names=[add_to_todo_list.name]),
)
```


### 7. Use thread metadata and state

Use `thread.metadata` to store server-side state such as the previous Responses API run
ID or custom labels. Metadata is not exposed to the client but is available in every
`respond` call.

### 8. Get tool status updates

Long-running tools can stream progress to the UI with `ProgressUpdateEvent`. ChatKit
replaces the progress event with the next assistant message or widget output.

### 9. Using server context

Pass a custom context object to `server.process(body, context)` to enforce permissions or
propagate user identity through your store and file store implementations.

## Add inline interactive widgets

Widgets let agents surface rich UI inside the chat surface. Use them for cards, forms,
text blocks, lists, and other layouts. The helper `stream_widget` can render a widget
immediately or stream updates as they arrive.

```python
async def respond(
    self,
    thread: ThreadMetadata,
    input: UserMessageItem | ClientToolCallOutputItem,
    context: Any,
) -> AsyncIterator[Event]:
    widget = Card(
        children=[Text(
            id="description",
            value="Generated summary",
        )]
    )
    async for event in stream_widget(
        thread,
        widget,
        generate_id=lambda item_type: self.store.generate_item_id(item_type, thread, context),
    ):
        yield event
```


ChatKit ships with a wide set of widget nodes (cards, lists, forms, text, buttons, and
more). See [widgets guide on GitHub](https://github.com/openai/chatkit-python/blob/main/docs/widgets.md) for all components, props, and
streaming guidance.

See the [Widget Builder](https://widgets.chatkit.studio/) to explore and create widgets in an interactive UI.

## Use actions

Actions let the ChatKit UI trigger work without sending a user message. Attach an
`ActionConfig` to any widget node that supports it—buttons, selects, and other controls
can stream new thread items or update widgets in place. When a widget lives inside a
`Form`, ChatKit includes the collected form values in the action payload.

On the server, implement the `action` method on `ChatKitServer` to process the payload
and optionally stream additional events. You can also handle actions on the client by
setting `handler="client"` and responding in JavaScript before forwarding follow-up
work to the server.

See the [actions guide on GitHub](https://github.com/openai/chatkit-python/blob/main/docs/actions.md) for patterns like chaining actions, creating
strongly typed payloads, and coordinating client/server handlers.

## Resources

Use the following resources and reference to complete your integration.

### Design resources

- Download [OpenAI Sans Variable](https://drive.google.com/file/d/10-dMu1Oknxg3cNPHZOda9a1nEkSwSXE1/view?usp=sharing).
- Duplicate the file and customize components for your product.

### Events reference

ChatKit emits `CustomEvent` instances from the Web Component. The payload shapes are:

```ts
type Events = {
  "chatkit.error": CustomEvent<{ error: Error }>;
  "chatkit.response.start": CustomEvent<void>;
  "chatkit.response.end": CustomEvent<void>;
  "chatkit.thread.change": CustomEvent<{ threadId: string | null }>;
  "chatkit.log": CustomEvent<{ name: string; data?: Record<string, unknown> }>;
};
```

### Options reference

| Option          | Type                       | Description                                                  | Default        |
| --------------- | -------------------------- | ------------------------------------------------------------ | -------------- |
| `apiURL`        | `string`                   | Endpoint that implements the ChatKit server protocol.        | _required_     |
| `fetch`         | `typeof fetch`             | Override fetch calls (for custom headers or auth).           | `window.fetch` |
| `theme`         | `"light" \| "dark"`        | UI theme.                                                    | `"light"`      |
| `initialThread` | `string \| null`           | Thread to open on mount; `null` shows the new thread view.   | `null`         |
| `clientTools`   | `Record&lt;string, Function&gt;` | Client-executed tools exposed to the model.                  |                |
| `header`        | `object \| boolean`        | Header configuration or `false` to hide the header.          | `true`         |
| `newThreadView` | `object`                   | Customize greeting text and starter prompts.                 |                |
| `messages`      | `object`                   | Configure message affordances (feedback, annotations, etc.). |                |
| `composer`      | `object`                   | Control attachments, entity tags, and placeholder text.      |                |
| `entities`      | `object`                   | Callbacks for entity lookup, click handling, and previews.   |                |

:::
:::

