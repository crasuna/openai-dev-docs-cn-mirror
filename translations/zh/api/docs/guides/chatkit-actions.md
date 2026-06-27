---
status: needs-review
sourceId: bdf05438bb50
sourceChecksum: bdf05438bb505dbf7a83c162007cfdf453701fc984c1ec6ebaa9588f4991aaf5
sourceUrl: https://developers.openai.com/api/docs/guides/chatkit-actions
translatedAt: 2026-06-27T16:52:06+08:00
translator: codex-gpt-5.5-xhigh
---

# ChatKit 中的操作

操作是一种让 ChatKit SDK 前端在用户不提交消息的情况下触发流式响应的方式。它们也可以用来触发 ChatKit SDK 之外的副作用。

## 触发操作

### 响应用户与 widget 的交互

可以通过把 `ActionConfig` 附加到任何支持它的 widget 节点来触发操作。例如，你可以响应 Button 上的点击事件。当用户点击这个按钮时，操作会发送到你的服务器；在那里你可以更新 widget、运行推理、流式传输新的线程项目，等等。

```python
Button(
    label="Example",
    onClickAction=ActionConfig(
      type="example",
      payload={"id": 123},
    )
)
```

你的前端也可以使用 `sendAction()` 以命令式方式发送操作。当你需要 ChatKit 响应发生在 ChatKit 之外的交互时，这通常最有用；当你需要在客户端和服务器端都做出响应时，也可以用它串联操作（下面会进一步说明）。

```tsx
await chatKit.sendAction({
  type: "example",
  payload: { id: 123 },
});
```

## 处理操作

### 在服务器端

默认情况下，操作会发送到你的服务器。你可以通过在 `ChatKitServer` 上实现 `action` 方法，在服务器端处理操作。

```python
class MyChatKitServer(ChatKitServer[RequestContext])
    async def action(
        self,
        thread: ThreadMetadata,
        action: Action[str, Any],
        sender: WidgetItem | None,
        context: RequestContext,
    ) -> AsyncIterator[Event]:
        if action.type == "example":
          await do_thing(action.payload['id'])

          # often you'll want to add a HiddenContextItem so the model
          # can see that the user did something
          await self.store.add_thread_item(
              thread.id,
              HiddenContextItem(
                  id="item_123",
                  created_at=datetime.now(),
                  content=(
                      "<USER_ACTION>The user did a thing</USER_ACTION>"
                  ),
              ),
              context,
          )

          # then you might want to run inference to stream a response
          # back to the user.
          async for e in self.generate(context, thread):
              yield e
```

**注意：** 与任何客户端/服务器交互一样，操作及其 payload 都由客户端发送，因此应当把它们视为不可信数据。

### 客户端

有时你会想在客户端集成中处理操作。为此，需要通过在 `ActionConfig` 中添加 `handler="client"`，指定该操作应发送给你的客户端操作处理器。

```python
Button(
    label="Example",
    onClickAction=ActionConfig(
      type="example",
      payload={"id": 123},
      handler="client"
    )
)
```

随后，当操作被触发时，它会传给你在实例化 ChatKit 时提供的回调。

```ts
async function handleWidgetAction(action: {type: string, Record<string, unknown>}) {
  if (action.type === "example") {
    const res = await doSomething(action)

    // You can fire off actions to your server from here as well.
    // e.g. if you want to stream new thread items or update a widget.
    await chatKit.sendAction({
      type: "example_complete",
      payload: res
    })
  }
}

chatKit.setOptions({
  // other options...
  widgets: { onAction: handleWidgetAction }
})
```

## 强类型操作

默认情况下，`Action` 和 `ActionConfig` 不是强类型的。不过，我们在 `Action` 上暴露了一个 `create` helper，方便你从一组强类型操作生成 `ActionConfig`。

```python

class ExamplePayload(BaseModel)
    id: int

ExampleAction = Action[Literal["example"], ExamplePayload]
OtherAction = Action[Literal["other"], None]

AppAction = Annotated[
  ExampleAction
  | OtherAction,
  Field(discriminator="type"),
]

ActionAdapter: TypeAdapter[AppAction] = TypeAdapter(AppAction)

def parse_app_action(action: Action[str, Any]): AppAction
  return ActionAdapter.model_validate(action)

# Usage in a widget
# Action provides a create helper which makes it easy to generate
# ActionConfigs from strongly typed actions.
Button(
    label="Example",
    onClickAction=ExampleAction.create(ExamplePayload(id=123))
)

# usage in action handler
class MyChatKitServer(ChatKitServer[RequestContext])
    async def action(
        self,
        thread: ThreadMetadata,
        action: Action[str, Any],
        sender: WidgetItem | None,
        context: RequestContext,
    ) -> AsyncIterator[Event]:
        # add custom error handling if needed
        app_action = parse_app_action(action)
        if (app_action.type == "example"):
            await do_thing(app_action.payload.id)
```

## 使用 widget 和操作创建自定义表单

当接收用户输入的 widget 节点挂载在 `Form` 内部时，这些字段的值会包含在所有源自该 `Form` 内部的操作的 `payload` 中。

表单值会按它们的 `name` 作为键放入 `payload`，例如：

- `Select(name="title")` → `action.payload.title`
- `Select(name="todo.title")` → `action.payload.todo.title`

```python
Form(
	direction="col",
	validation="native"
  onSubmitAction=ActionConfig(
	  type="update_todo",
	  payload={"id": todo.id}
  ),
  children=[
    Title(value="Edit Todo"),

    Text(value="Title", color="secondary", size="sm"),
    Text(
      value=todo.title,
      editable=EditableProps(name="title", required=True),
    )

    Text(value="Description", color="secondary", size="sm"),
    Text(
      value=todo.description,
      editable=EditableProps(name="description"),
    ),

    Button(label="Save", type="submit")
  ]
)

class MyChatKitServer(ChatKitServer[RequestContext])
    async def action(
        self,
        thread: ThreadMetadata,
        action: Action[str, Any],
        sender: WidgetItem | None,
        context: RequestContext,
    ) -> AsyncIterator[Event]:
        if (action.type == "update_todo"):
          id = action.payload['id']
          # Any action that originates from within the Form will
          # include title and description
          title = action.payload['title']
          description = action.payload['description']

	        # ...

```

### 验证

`Form` 使用基础的原生表单验证；它会对配置了 `required` 和 `pattern` 的字段执行这些约束，并在表单中存在任何无效字段时阻止提交。

未来我们可能会加入新的验证模式，提供更好的 UX、更具表达力的验证、自定义错误显示等。在此之前，widget 并不是承载带有复杂验证规则的复杂表单的理想媒介。如果你有这类需求，更好的模式是使用客户端操作处理来触发模态框，在其中显示自定义表单，然后通过 `sendAction` 把结果传回 ChatKit。

### 将 `Card` 作为 `Form` 处理

你可以把 `asForm=True` 传给 `Card`，它就会像 `Form` 一样运行验证，并把收集到的字段传给 Card 的 `confirm` 操作。

### Payload 键冲突

如果表单值的名称与 payload 上某个现有的预定义键发生命名冲突，该表单值会被忽略。这很可能是一个 bug，因此当我们发现这种情况时，会发出一个 `error` 事件。

## 控制 widget 中的加载状态交互

使用 `ActionConfig.loadingBehavior` 控制操作如何在 widget 中触发不同的加载状态。

```python
Button(
    label="This make take a while...",
    onClickAction=ActionConfig(
      type="long_running_action_that_should_block_other_ui_interactions",
      loadingBehavior="container"
    )
)
```

| 值          | 行为                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| `auto`      | 操作会根据自身的使用方式自适应。(_默认_)                                                     |
| `self`      | 操作会在绑定该操作的 widget 节点上触发加载状态。                                             |
| `container` | 操作会在整个 widget 容器上触发加载状态。这会让 widget 轻微淡出并变为不可交互。               |
| `none`      | 不显示加载状态                                                                               |

### 使用 `auto` 行为

通常，我们建议使用默认的 `auto`。`auto` 会根据操作绑定的位置触发加载状态，例如：

- `Button.onClickAction` → `self`
- `Select.onChangeAction` → `none`
- `Card.confirm.action` → `container`
