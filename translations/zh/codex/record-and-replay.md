---
status: needs-review
sourceId: "d93f775603d2"
sourceChecksum: "d93f775603d2c2ea686bbcc806c4134749bfc7b08bf58bcbbf078b5b88863037"
sourceUrl: "https://developers.openai.com/codex/record-and-replay"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# 录制与回放

Record & Replay 可在 macOS 上使用。初始可用范围不包括欧洲经济区、英国和瑞士。Computer Use 也必须可用并已启用。

Record & Replay 让你可以在 Mac 上演示一个工作流，并将其转换为可复用的 skill。当工作流具有重复性、依赖你的个人偏好，或者用演示比用 prompt 描述更容易时，可以使用它。

例如，你可以录制自己如何提交费用、预订停车位、创建配置正确的 issue、发布视频，或下载周期性报表。Codex 可以把这种模式打包成一个 skill，之后你可以通过 Computer Use、浏览器操作、已连接的插件，或它们的组合来再次使用。

## 开始之前

选择一个你已经知道如何完成的工作流。Record & Replay 在步骤稳定、成功标准清晰时效果最好。

## 开始录制

<WorkflowSteps>

1. 在 Codex app 中打开 **Plugins**。
2. 打开 **+** 菜单。
3. 选择 **Record a skill**。
4. 查看建议的 prompt，给 Codex 提供任何有帮助的上下文，然后提交。
5. 当 Codex 请求录制你的操作权限时，在你准备好演示工作流后批准该请求。
6. 在 Mac 上执行该工作流。
7. 完成后，从菜单栏或浮层停止录制，或者告诉 Codex 你已经完成。

</WorkflowSteps>

录制期间，Codex 会观察学习该工作流所需的操作和窗口内容。录制会持续到你停止为止。让录制聚焦在你希望 Codex 学会的任务上。

停止录制后，Codex 会检查捕获到的工作流并起草一个 skill。该 skill 会说明什么时候使用这个工作流、它需要哪些输入、要遵循哪些步骤，以及如何验证结果。你也可以继续要求 Codex 进一步改进这个 skill。

## 回放工作流

开启一个新线程，并要求 Codex 使用生成的 skill。提供本次不同的值，例如要上传的文件、要创建的 issue，或报表的日期范围。

Codex 会把这个 skill 作为该任务的可复用上下文。然后，它可以使用当前环境中可用的工具完成工作流，包括 Computer Use、浏览器操作和已安装的插件。

## 改善录制效果的建议

- 保持演示简短且完整。
- 在开始录制前，告诉 Codex 你的目标，以及每次使用 skill 时可能变化的具体输入。
- 使用真实的输入，但避免包含密钥和敏感数据。
- 录制后改进 skill，明确那些重要但隐藏的偏好，例如命名约定、字段默认值或决策点。
- 在工作流完成时停止录制，不要继续做无关的清理。

## 什么时候应构建另一个 plugin

Record & Replay 是一种从演示工作流快速创建 skill 的方式。如果你想向团队分发一个独立、稳定的软件包，捆绑多个 skill，包含 app 集成，添加 MCP servers，或管理安装元数据，请把该工作流打包成自己的 plugin。参见 [Build plugins](https://developers.openai.com/codex/plugins/build)。

## 故障排查

### 我看不到 Record & Replay

如果你的组织使用 `requirements.toml` 管理 Codex，`[features].computer_use` 要求也会控制 Record & Replay。设置 `computer_use = false` 会让这两个功能都不可用。

