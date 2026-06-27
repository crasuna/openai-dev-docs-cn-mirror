---
status: needs-review
sourceId: "197ce2811a27"
sourceChecksum: "197ce2811a279bc0a7b4dad25fb092d1adae472ae3f4556387798753057221c0"
sourceUrl: "https://developers.openai.com/codex/app/troubleshooting"
translatedAt: "2026-06-27T11:05:57.267Z"
translator: codex-gpt-5.5-xhigh
---

# 故障排除

## 常见问题

### Side panel 中出现了 Codex 没有编辑的 files

如果你的 project 位于 Git repository 中，review panel 会根据 project 的 Git state 自动显示 changes，包括并非 Codex 做出的 changes。

在 review pane 中，你可以在 staged changes 和尚未 staged 的 changes 之间切换，并将你的 branch 与 main 比较。

如果你只想查看上一次 Codex turn 的 changes，请将 diff pane 切换到 "Last turn changes" view。

[进一步了解如何使用 review pane](https://developers.openai.com/codex/app/review)。

### 从 sidebar 移除 project

要从 sidebar 移除 project，请 hover project name，点击三个点并选择 "Remove."。要恢复它，请使用 **Threads** 旁边的 **Add new project** button 或使用

<kbd>Cmd</kbd>+<kbd>O</kbd>

重新添加 project。

### 查找 archived threads

Archived threads 可在 [Settings](codex://settings) 中找到。取消归档 thread 后，它会重新出现在 sidebar 的原始位置。

### sidebar 中只显示部分 threads

Sidebar 允许根据 project state 筛选 threads。如果缺少 threads，请点击 **Threads** label 旁边的 filter icon，并切换到 Chronological。如果仍然看不到 thread，请打开 [Settings](codex://settings)，并检查 archived chats 或 archived threads section。

### Code 无法在 worktree 上运行

Worktrees 会在不同目录中创建，并默认继承已提交到 Git 的 files。取决于你如何管理 project 的 dependencies 和 tooling，你可能需要使用 [local environment](https://developers.openai.com/codex/app/local-environments) 在 worktree 上运行 setup scripts，或使用 [`.worktreeinclude`](https://developers.openai.com/codex/app/worktrees#copy-ignored-local-files-into-managed-worktrees) 复制 ignored setup files。或者，你可以在常规本地 project 中 check out changes。更多信息请参阅 [worktrees documentation](https://developers.openai.com/codex/app/worktrees)。

### App 没有识别 teammate 共享的 local environment

Local environment configuration 必须位于 project root 的 `.codex` folder 中。如果你在包含多个 project 的 monorepo 中工作，请确保你在包含 `.codex` folder 的目录中打开 project。

### Codex 要求访问 Apple Music

根据你的 task，Codex 可能需要导航 file system。macOS 上的某些 directories，包括 Music、Downloads 或 Desktop，需要用户额外 approval。如果 Codex 需要读取你的 home directory，macOS 会提示你批准访问这些 folders。

### Automations 创建了许多 worktrees

频繁的 automations 会随时间创建许多 worktrees。归档不再需要的 automation runs，并避免 pinning runs，除非你打算保留它们的 worktrees。

### 选择错误 target 后恢复 prompt

如果你意外使用错误 target（**Local**、**Worktree** 或 **Cloud**）启动了 thread，可以取消当前 run，并通过在 composer 中按上箭头键恢复之前的 prompt。

### 功能在 Codex CLI 中可用，但在 Codex app 中不可用

Codex app 和 Codex CLI 使用相同的底层 Codex agent 和 configuration，但它们在任何时候可能依赖不同版本的 agent，且一些 experimental features 可能会先进入 Codex CLI。

要获取系统上的 Codex CLI 版本，请运行：

```bash
codex --version
```

要获取 Codex app bundled 的 Codex 版本，请运行：

```bash
/Applications/Codex.app/Contents/Resources/codex --version
```

## Feedback 和 logs

在 message composer 中输入 <kbd>/</kbd>，向团队提供 feedback。如果你在现有 conversation 中触发 feedback，可以选择将现有 session 连同 feedback 一起分享。提交 feedback 后，你会收到一个 session ID，可以与团队共享。

报告 issue：

1. 在 Codex GitHub repo 上查找 [existing issues](https://github.com/openai/codex/issues)。
2. [打开新的 GitHub issue](https://github.com/openai/codex/issues/new?template=2-bug-report.yml&steps=Uploaded%20thread%3A%20019c0d37-d2b6-74c0-918f-0e64af9b6e14)。

更多 logs 可在以下位置获得：

- App logs（macOS）：`~/Library/Logs/com.openai.codex/YYYY/MM/DD`
- Session transcripts：`$CODEX_HOME/sessions`（默认：`~/.codex/sessions`）
- Archived sessions：`$CODEX_HOME/archived_sessions`（默认：`~/.codex/archived_sessions`）

如果你分享 logs，请先 review 它们，确认其中不包含 sensitive information。

## Stuck states 和 recovery patterns

如果 thread 看起来 stuck：

1. 检查 Codex 是否正在等待 approval。
2. 打开 terminal 并运行 `git status` 这样的 basic command。
3. 用更小、更聚焦的 prompt 启动新 thread。

如果你误取消 worktree creation 并丢失 prompt，请在 composer 中按上箭头键恢复。

## Terminal issues

**Terminal 看起来 stuck**

1. 关闭 terminal panel。
2. 使用 <kbd>Cmd</kbd>+<kbd>J</kbd> 重新打开它。
3. 重新运行 `pwd` 或 `git status` 这样的 basic command。

如果 commands 的行为与预期不同，请先在 terminal 中验证当前 directory 和 branch。

如果它持续 stuck，请等到 active Codex threads 完成后重启 app。

**Fonts 无法正确渲染**

Codex 会在 review pane、integrated terminal，以及 app 内显示的任何其他 code 中使用同一种 font。你可以在 [Settings](codex://settings) pane 中将其配置为 **Code font**。
