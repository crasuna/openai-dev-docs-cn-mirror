---
status: needs-review
sourceId: "ad648c6a5a2a"
sourceChecksum: "ad648c6a5a2ae9d53e38e9638eadefc511bdd69f2feb8836e78f1f8c4ff684a0"
sourceUrl: "https://developers.openai.com/codex/ide/commands"
translatedAt: "2026-06-27T19:05:47.1891485+08:00"
translator: codex-gpt-5.5-xhigh
---

# Codex IDE extension 命令

使用这些命令可以从 VS Code 命令面板控制 Codex。你也可以为它们绑定键盘快捷键。

## 分配键位绑定

若要为 Codex 命令分配或更改键位绑定：

1. 打开命令面板（macOS 上为 **Cmd+Shift+P**，Windows/Linux 上为 **Ctrl+Shift+P**）。
2. 运行 **Preferences: Open Keyboard Shortcuts**。
3. 搜索 `Codex` 或命令 ID（例如 `chatgpt.newChat`）。
4. 选择铅笔图标，然后输入你想要的快捷键。

## 扩展命令

| 命令                      | 默认键位绑定                               | 说明                                           |
| ------------------------- | ------------------------------------------ | ---------------------------------------------- |
| `chatgpt.addToThread`     | -                                          | 将选中的文本范围作为上下文添加到当前 thread    |
| `chatgpt.addFileToThread` | -                                          | 将整个文件作为上下文添加到当前 thread          |
| `chatgpt.newChat`         | macOS: `Cmd+N`<br/>Windows/Linux: `Ctrl+N` | 创建新 thread                                  |
| `chatgpt.implementTodo`   | -                                          | 请求 Codex 处理选中的 TODO 注释                |
| `chatgpt.newCodexPanel`   | -                                          | 创建新的 Codex 面板                            |
| `chatgpt.openSidebar`     | -                                          | 打开 Codex 侧边栏面板                          |
