---
status: needs-review
sourceId: "f3d5c326b54c"
sourceChecksum: "f3d5c326b54cda83e07347b205d12a7c707ad0e0627cf1f459f077b116e5e025"
sourceUrl: "https://developers.openai.com/codex/ide/slash-commands"
translatedAt: "2026-06-27T19:05:47.1891485+08:00"
translator: codex-gpt-5.5-xhigh
---

# Codex IDE extension 斜杠命令

斜杠命令让你无需离开聊天输入框即可控制 Codex。使用它们可以检查状态、在本地和云端模式之间切换，或发送反馈。

## 使用斜杠命令

1. 在 Codex 聊天输入框中输入 `/`。
2. 从列表中选择一个命令，或继续输入以筛选（例如 `/status`）。
3. 按 **Enter**。

## 可用斜杠命令

| 斜杠命令             | 说明                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| `/auto-context`      | 打开或关闭 Auto Context，以自动包含最近文件和 IDE 上下文。                             |
| `/cloud`             | 切换到云端模式以远程运行任务（需要云端访问权限）。                                     |
| `/cloud-environment` | 选择要使用的云端环境（仅在云端模式中可用）。                                           |
| `/feedback`          | 打开反馈对话框以提交反馈，并可选择包含日志。                                           |
| `/goal`              | 为 Codex 设置一个要持续推进的持久目标。                                                |
| `/local`             | 切换到本地模式，在你的工作区中运行任务。                                               |
| `/review`            | 启动代码审查模式，用于审查未提交更改或与基准分支比较。                                 |
| `/status`            | 显示 thread ID、上下文使用量和速率限制。                                               |

如果 `/goal` 没有出现在斜杠命令列表中，请在 `config.toml` 中启用 `features.goals`：

```toml
[features]
goals = true
```

你也可以从 CLI 运行 `codex features enable goals`，或请求 Codex 运行它。
