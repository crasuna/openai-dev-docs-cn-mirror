---
status: needs-review
sourceId: ee7eaad72866
sourceChecksum: ee7eaad728669d3d9270c354425d9925123380f7c71eefb3b85e67aca864d050
sourceUrl: https://developers.openai.com/api/docs/guides/custom-chatkit
translatedAt: 2026-06-27T16:52:06+08:00
translator: codex-gpt-5.5-xhigh
---

# ChatKit 高级集成

当你需要完全控制能力，例如自定义身份验证、数据驻留、本地部署或定制的 agent 编排时，可以在自己的基础设施上运行 ChatKit。使用 OpenAI 的高级自托管选项来使用你自己的服务器和自定义 ChatKit。

Agent Builder 托管的 ChatKit 工作流正处于过渡窗口。对于新的
  ChatKit 应用，请基于你自己的服务端 agent 实现、ChatKit SDK
  和 Agents SDK 构建。请参阅 [ChatKit 过渡指南
  →](https://developers.openai.com/api/docs/guides/chatkit)

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
| `clientTools`   | `Record<string, Function>` | 暴露给模型的客户端执行工具。                                 |                |
| `header`        | `object \| boolean`        | Header 配置，或设为 `false` 以隐藏 header。                  | `true`         |
| `newThreadView` | `object`                   | 自定义问候文本和起始提示。                                   |                |
| `messages`      | `object`                   | 配置消息辅助能力（反馈、注释等）。                           |                |
| `composer`      | `object`                   | 控制附件、实体标签和 placeholder 文本。                      |                |
| `entities`      | `object`                   | 用于实体查找、点击处理和预览的回调。                         |                |
