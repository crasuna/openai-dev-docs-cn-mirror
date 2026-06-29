---
status: needs-review
sourceId: "f8be2b01b5cd"
sourceChecksum: "f8be2b01b5cd68ac18d1bca2bd461cadf63504d52050c0689006288c4323a69f"
sourceUrl: "https://developers.openai.com/codex/app/worktrees"
translatedAt: "2026-06-27T19:07:21.7838419+08:00"
translator: codex-gpt-5.5-xhigh
---

# Worktrees 工作树

在 Codex app 中，worktree 让 Codex 可以在同一个项目里运行多个互相独立的任务，而不会彼此干扰。对于 Git 仓库，[automations](https://developers.openai.com/codex/app/automations) 会在专用的后台 worktree 上运行，因此不会与你正在进行的工作冲突。在未使用版本控制的项目中，automations 会直接在项目目录中运行。你也可以手动在某个 worktree 上启动 thread，并使用 Handoff 在 Local 和 Worktree 之间移动 thread。

## 什么是 worktree

Worktree 只适用于属于 Git 仓库的项目，因为它们底层使用的是 [Git worktrees](https://git-scm.com/docs/git-worktree)。worktree 允许你创建仓库的第二份副本（“checkout”）。每个 worktree 都有仓库中每个文件的独立副本，但它们共享同一份关于提交、分支等内容的元数据（`.git` 文件夹）。这让你可以并行 checkout 并处理多个分支。

## 术语

- **Local checkout**：你创建的仓库。在 Codex app 中有时简称为 **Local**。
- **Worktree**：在 Codex app 中从你的 local checkout 创建出来的 [Git worktree](https://git-scm.com/docs/git-worktree)。
- **Handoff**：在 Local 和 Worktree 之间移动 thread 的流程。Codex 会处理安全移动工作所需的 Git 操作。

## 为什么使用 worktree

1. 与 Codex 并行工作，同时不扰动你当前的 Local 设置。
2. 在你专注于前台工作时，把后台工作排队运行。
3. 等你准备好更直接地检查、测试或协作时，再把 thread 移入 Local。

## 开始使用

Worktree 需要 Git 仓库。请确保你选择的项目位于 Git 仓库中。

<WorkflowSteps variant="headings">

1.  选择 "Worktree"

    在新 thread 视图中，在 composer 下方选择 **Worktree**。
    也可以选择一个 [local environment](https://developers.openai.com/codex/app/local-environments)，用于为 worktree 运行设置脚本。

2.  选择起始分支

    在 composer 下方，选择 worktree 要基于的 Git 分支。它可以是你的 `main` / `master` 分支、某个功能分支，或当前带有未暂存本地改动的分支。

3.  提交你的提示词

    提交任务后，Codex 会基于你选择的分支创建一个 Git worktree。默认情况下，Codex 会在 ["detached HEAD"](https://git-scm.com/docs/git-checkout#_detached_head) 中工作。

4.  选择继续工作的地方

    准备好后，你可以继续直接在 worktree 上工作，也可以把 thread hand off 到你的 local checkout。向 Local 交接或从 Local 交接都会移动你的 thread _和_ 代码，这样你就可以在另一个 checkout 中继续。

</WorkflowSteps>

## 在 Local 和 Worktree 之间工作

Worktree 的外观和感觉很像你的 local checkout。区别在于它们在你的流程中所处的位置。你可以把 Local 理解为前台，把 Worktree 理解为后台。Handoff 让你可以在两者之间移动 thread。

在底层，Handoff 会处理在两个 checkout 之间安全移动工作所需的 Git 操作。这一点很重要，因为 **Git 只允许一个分支在同一时间被 checkout 到一个地方**。如果你在某个 worktree 上 checkout 了一个分支，你就 **不能** 同时在 local checkout 中 checkout 它，反之亦然。

实践中有两条常见路径：

1. [只在 worktree 上工作](#option-1-working-on-the-worktree)。当你可以直接在 worktree 上验证改动时，这条路径最合适，例如你已经通过 [local environment setup script](https://developers.openai.com/codex/app/local-environments) 安装好了依赖和工具。
2. [把 thread hand off 到 Local](#option-2-handing-a-thread-off-to-local)。当你想把 thread 带到前台时使用这条路径，例如你想在常用 IDE 中检查改动，或者你的应用只能运行一个实例。

### 选项 1：在 worktree 上工作

<div class="feature-grid">

<div>

如果你想带着改动完全留在 worktree 上，请使用 thread 头部的 **Create branch here** 按钮，把 worktree 转成一个分支。

从这里开始，你可以提交改动、把分支推送到远程仓库，并在 GitHub 上打开 pull request。

你可以使用头部的 "Open" 按钮在 worktree 中打开 IDE，使用集成终端，或在 worktree 目录中完成其他任何需要的操作。

</div>

<CodexScreenshot
  alt="带有分支控件和 worktree 详情的 Worktree thread 视图"
  lightSrc="/images/codex/app/worktree-light.webp"
  darkSrc="/images/codex/app/worktree-dark.webp"
  maxHeight="400px"
  class="mb-4 lg:mb-0"
/>

</div>

请记住，如果你在某个 worktree 上创建了分支，就不能在任何其他 worktree 中 checkout 该分支，包括你的 local checkout。

### 选项 2：把 thread hand off 到 Local

<div class="feature-grid">

<div>

如果你想把 thread 带到前台，请在 thread 头部点击 **Hand off**，并把它移动到 **Local**。

当你想在常用 IDE 窗口中阅读改动、运行现有开发服务器，或在日常使用的同一环境中验证工作时，这条路径很合适。

Codex 会处理在 worktree 和 local checkout 之间安全移动 thread 所需的 Git 步骤。

每个 thread 都会长期保留同一个关联的 worktree。如果你之后再把 thread 交回 worktree，Codex 会把它送回同一个后台环境，让你从离开的地方继续。

</div>

<CodexScreenshot
  alt="把 thread 从 worktree 移动到 Local 的 Handoff 对话框"
  lightSrc="/images/codex/app/handoff-light.webp"
  darkSrc="/images/codex/app/handoff-dark.webp"
  maxHeight="400px"
  class="mb-4 lg:mb-0"
/>

</div>

你也可以反向操作。如果你已经在 Local 中工作，并想腾出前台，可以使用 **Hand off** 把 thread 移到 worktree。当你希望 Codex 在后台继续工作，而自己把注意力切回本地其他事情时，这会很有用。

由于 Handoff 使用 Git 操作，任何属于 `.gitignore` 文件的文件都不会随 thread 移动，除非 Codex 使用 `.worktreeinclude` 把它们复制到本地托管 worktree 中。

## 高级细节

### Codex 管理的 worktree 和永久 worktree

默认情况下，thread 使用由 Codex 管理的 worktree。这类 worktree 设计为轻量、可丢弃。Codex 管理的 worktree 通常专用于一个 thread；如果你之后把该 thread 交回 worktree，Codex 会把它返回到同一个 worktree。

如果你想要长期存在的环境，请从侧边栏中项目的三点菜单创建一个永久 worktree。这会把新的永久 worktree 创建为独立项目。永久 worktree 不会被自动删除，你可以从同一个 worktree 启动多个 thread。

### Codex 如何为你管理 worktree

Codex 会在 `$CODEX_HOME/worktrees` 中创建 worktree。起始提交会是你启动 thread 时所选分支的 `HEAD` 提交。如果你选择了带有本地改动的分支，未提交的改动也会应用到 worktree。该 worktree _不会_ 作为分支 checkout。它会处于 [detached HEAD](https://git-scm.com/docs/git-checkout#_detached_head) 状态。这让 Codex 可以创建多个 worktree，而不会污染你的分支。

### 将被忽略的本地文件复制到托管 worktree

本地 Codex 管理的 worktree 从 Git checkout 开始，因此已跟踪文件已经存在。如果你的仓库忽略了新 worktree 所需的本地设置文件，请在仓库根目录添加 `.worktreeinclude` 文件，并列出 Codex 创建托管 worktree 时要复制的被忽略路径或 `.gitignore` 风格模式。

此功能适用于 Git 有意忽略的文件，例如 `.env`、`.env.local` 或 `config/secrets.json`。Codex 只会复制匹配 `.worktreeinclude` 的被忽略文件；它不会复制 Git 未跟踪的其他本地文件。不要列出已跟踪文件。

Codex 会自动把被忽略的 `AGENTS.override.md` 复制到本地托管 worktree 中，因此你不需要在 `.worktreeinclude` 中列出它。

```text
# .worktreeinclude
.env
.env.local
config/secrets.json
```

Codex 会跳过源符号链接，也不会覆盖新 checkout 中已存在的文件。此行为适用于本地 Codex app 管理的 worktree，不适用于远程 worktree 或你自己从命令行创建的 Git worktree。

### 分支限制

假设 Codex 在某个 worktree 上完成了一些工作，而你选择使用 **Create branch here** 在它上面创建 `feature/a` 分支。现在，你想在 local checkout 上试用它。如果你尝试 checkout 该分支，会得到以下错误：

```
fatal: 'feature/a' is already used by worktree at '<WORKTREE_PATH>'
```

要解决这个问题，你需要在该 worktree 上 checkout 到另一个分支，而不是 `feature/a`。

如果你计划在本地 checkout 该分支，请使用 Handoff 把 thread 移入 Local，而不是试图在两个地方同时 checkout 同一个分支。

<ToggleSection title="为什么存在这个限制">
Git 会阻止同一分支在同一时间被多个 worktree checkout，因为一个分支代表单个可变引用（`refs/heads/<name>`），其含义是某个工作树“当前 checkout 的状态”。

当某个分支被 checkout 时，Git 会把它的 HEAD 视为由该 worktree 拥有，并期望提交、reset、rebase 和 merge 等操作以明确、串行的方式推进该引用。如果允许多个 worktree 同时 checkout 同一分支，就会造成歧义和竞态条件：到底哪个 worktree 的操作应该更新分支引用？这可能导致提交丢失、索引不一致或冲突解决不清楚。

通过强制一个分支只能对应一个 worktree，Git 可以保证每个分支都有单一权威工作副本，同时仍允许其他 worktree 通过 detached HEAD 或单独分支安全地引用同一批提交。

</ToggleSection>

### Worktree 清理

Worktree 可能占用大量磁盘空间。每个 worktree 都有自己的一组仓库文件、依赖、构建缓存等。因此，Codex app 会尝试把 worktree 数量保持在合理限制内。

默认情况下，Codex 会保留你最近的 15 个 Codex 管理的 worktree。你可以在设置中更改此限制，或关闭自动删除，以便自行管理磁盘使用量。

Codex 会尽量避免删除仍然重要的 worktree。Codex 管理的 worktree 在以下情况下不会被自动删除：

- 有置顶对话与它关联
- thread 仍在进行中
- 该 worktree 是永久 worktree

Codex 管理的 worktree 会在以下情况下自动删除：

- 你归档了关联的 thread
- Codex 需要删除较旧的 worktree 以保持在你配置的限制内

在删除 Codex 管理的 worktree 之前，Codex 会保存其上的工作快照。如果你在 worktree 被删除后打开某个对话，会看到恢复它的选项。

## 常见问题

<ToggleSection title="我能控制 worktree 创建在哪里吗？">
  目前不行。Codex 会在 `$CODEX_HOME/worktrees` 下创建 worktree，这样它才能一致地管理它们。
</ToggleSection>

<ToggleSection title="我能在 Local 和 Worktree 之间移动 thread 吗？">
  可以。使用 thread 头部的 **Hand off** 在你的 local checkout 和某个 worktree 之间移动 thread。Codex 会处理在环境之间安全移动 thread 所需的 Git 操作。如果你之后把 thread 交回 worktree，Codex 会把它返回到同一个关联 worktree。
</ToggleSection>

<ToggleSection title="如果 worktree 被删除，thread 会怎样？">
  即使底层 worktree 目录被删除，thread 仍可保留在你的历史记录中。对于 Codex 管理的 worktree，Codex 会在删除 worktree 前保存快照，并在你重新打开关联 thread 时提供恢复选项。永久 worktree 不会在你归档其 thread 时被自动删除。
</ToggleSection>
