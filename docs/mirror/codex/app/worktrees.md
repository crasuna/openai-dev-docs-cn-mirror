---
title: "Worktrees 工作树"
description: "Leverage Git worktrees within the Codex app to let Codex work in parallel"
outline: deep
---

# Worktrees 工作树

**文档集**：Codex  
**分组**：Codex — App  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/app/worktrees](https://developers.openai.com/codex/app/worktrees)
- Markdown 来源：[https://developers.openai.com/codex/app/worktrees.md](https://developers.openai.com/codex/app/worktrees.md)
- 抓取时间：2026-06-27T05:54:52.442Z
- Checksum：`f8be2b01b5cd68ac18d1bca2bd461cadf63504d52050c0689006288c4323a69f`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
在 Codex app 中，worktree 让 Codex 可以在同一个项目里运行多个互相独立的任务，而不会彼此干扰。对于 Git 仓库，[automations](/mirror/codex/app/automations) 会在专用的后台 worktree 上运行，因此不会与你正在进行的工作冲突。在未使用版本控制的项目中，automations 会直接在项目目录中运行。你也可以手动在某个 worktree 上启动 thread，并使用 Handoff 在 Local 和 Worktree 之间移动 thread。

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



1.  选择 "Worktree"

    在新 thread 视图中，在 composer 下方选择 **Worktree**。
    也可以选择一个 [local environment](/mirror/codex/app/local-environments)，用于为 worktree 运行设置脚本。

2.  选择起始分支

    在 composer 下方，选择 worktree 要基于的 Git 分支。它可以是你的 `main` / `master` 分支、某个功能分支，或当前带有未暂存本地改动的分支。

3.  提交你的提示词

    提交任务后，Codex 会基于你选择的分支创建一个 Git worktree。默认情况下，Codex 会在 ["detached HEAD"](https://git-scm.com/docs/git-checkout#_detached_head) 中工作。

4.  选择继续工作的地方

    准备好后，你可以继续直接在 worktree 上工作，也可以把 thread hand off 到你的 local checkout。向 Local 交接或从 Local 交接都会移动你的 thread _和_ 代码，这样你就可以在另一个 checkout 中继续。



## 在 Local 和 Worktree 之间工作

Worktree 的外观和感觉很像你的 local checkout。区别在于它们在你的流程中所处的位置。你可以把 Local 理解为前台，把 Worktree 理解为后台。Handoff 让你可以在两者之间移动 thread。

在底层，Handoff 会处理在两个 checkout 之间安全移动工作所需的 Git 操作。这一点很重要，因为 **Git 只允许一个分支在同一时间被 checkout 到一个地方**。如果你在某个 worktree 上 checkout 了一个分支，你就 **不能** 同时在 local checkout 中 checkout 它，反之亦然。

实践中有两条常见路径：

1. [只在 worktree 上工作](/mirror/codex/app/worktrees#option-1-working-on-the-worktree)。当你可以直接在 worktree 上验证改动时，这条路径最合适，例如你已经通过 [local environment setup script](/mirror/codex/app/local-environments) 安装好了依赖和工具。
2. [把 thread hand off 到 Local](/mirror/codex/app/worktrees#option-2-handing-a-thread-off-to-local)。当你想把 thread 带到前台时使用这条路径，例如你想在常用 IDE 中检查改动，或者你的应用只能运行一个实例。

### 选项 1：在 worktree 上工作





如果你想带着改动完全留在 worktree 上，请使用 thread 头部的 **Create branch here** 按钮，把 worktree 转成一个分支。

从这里开始，你可以提交改动、把分支推送到远程仓库，并在 GitHub 上打开 pull request。

你可以使用头部的 "Open" 按钮在 worktree 中打开 IDE，使用集成终端，或在 worktree 目录中完成其他任何需要的操作。



&lt;CodexScreenshot
  alt="带有分支控件和 worktree 详情的 Worktree thread 视图"
  lightSrc="/images/codex/app/worktree-light.webp"
  darkSrc="/images/codex/app/worktree-dark.webp"
  maxHeight="400px"
  class="mb-4 lg:mb-0"
/&gt;



请记住，如果你在某个 worktree 上创建了分支，就不能在任何其他 worktree 中 checkout 该分支，包括你的 local checkout。

### 选项 2：把 thread hand off 到 Local





如果你想把 thread 带到前台，请在 thread 头部点击 **Hand off**，并把它移动到 **Local**。

当你想在常用 IDE 窗口中阅读改动、运行现有开发服务器，或在日常使用的同一环境中验证工作时，这条路径很合适。

Codex 会处理在 worktree 和 local checkout 之间安全移动 thread 所需的 Git 步骤。

每个 thread 都会长期保留同一个关联的 worktree。如果你之后再把 thread 交回 worktree，Codex 会把它送回同一个后台环境，让你从离开的地方继续。



&lt;CodexScreenshot
  alt="把 thread 从 worktree 移动到 Local 的 Handoff 对话框"
  lightSrc="/images/codex/app/handoff-light.webp"
  darkSrc="/images/codex/app/handoff-dark.webp"
  maxHeight="400px"
  class="mb-4 lg:mb-0"
/&gt;



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


Git 会阻止同一分支在同一时间被多个 worktree checkout，因为一个分支代表单个可变引用（`refs/heads/&lt;name&gt;`），其含义是某个工作树“当前 checkout 的状态”。

当某个分支被 checkout 时，Git 会把它的 HEAD 视为由该 worktree 拥有，并期望提交、reset、rebase 和 merge 等操作以明确、串行的方式推进该引用。如果允许多个 worktree 同时 checkout 同一分支，就会造成歧义和竞态条件：到底哪个 worktree 的操作应该更新分支引用？这可能导致提交丢失、索引不一致或冲突解决不清楚。

通过强制一个分支只能对应一个 worktree，Git 可以保证每个分支都有单一权威工作副本，同时仍允许其他 worktree 通过 detached HEAD 或单独分支安全地引用同一批提交。



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


  目前不行。Codex 会在 `$CODEX_HOME/worktrees` 下创建 worktree，这样它才能一致地管理它们。



  可以。使用 thread 头部的 **Hand off** 在你的 local checkout 和某个 worktree 之间移动 thread。Codex 会处理在环境之间安全移动 thread 所需的 Git 操作。如果你之后把 thread 交回 worktree，Codex 会把它返回到同一个关联 worktree。



  即使底层 worktree 目录被删除，thread 仍可保留在你的历史记录中。对于 Codex 管理的 worktree，Codex 会在删除 worktree 前保存快照，并在你重新打开关联 thread 时提供恢复选项。永久 worktree 不会在你归档其 thread 时被自动删除。


:::

## English source

::: details 展开英文原文
::: v-pre
In the Codex app, worktrees let Codex run multiple independent tasks in the same project without interfering with each other. For Git repositories, [automations](/mirror/codex/app/automations) run on dedicated background worktrees so they don't conflict with your ongoing work. In non-version-controlled projects, automations run directly in the project directory. You can also start threads on a worktree manually, and use Handoff to move a thread between Local and Worktree.

## What's a worktree

Worktrees only work in projects that are part of a Git repository since they use [Git worktrees](https://git-scm.com/docs/git-worktree) under the hood. A worktree allows you to create a second copy ("checkout") of your repository. Each worktree has its own copy of every file in your repo but they all share the same metadata (`.git` folder) about commits, branches, etc. This allows you to check out and work on multiple branches in parallel.

## Terminology

- **Local checkout**: The repository that you created. Sometimes just referred to as **Local** in the Codex app.
- **Worktree**: A [Git worktree](https://git-scm.com/docs/git-worktree) that was created from your local checkout in the Codex app.
- **Handoff**: The flow that moves a thread between Local and Worktree. Codex handles the Git operations required to move your work safely between them.

## Why use a worktree

1. Work in parallel with Codex without disturbing your current Local setup.
2. Queue up background work while you stay focused on the foreground.
3. Move a thread into Local later when you're ready to inspect, test, or collaborate more directly.

## Getting started

Worktrees require a Git repository. Make sure the project you selected lives in one.



1.  Select "Worktree"

    In the new thread view, select **Worktree** under the composer.
    Optionally, choose a [local environment](/mirror/codex/app/local-environments) to run setup scripts for the worktree.

2.  Select the starting branch

    Below the composer, choose the Git branch to base the worktree on. This can be your `main` / `master` branch, a feature branch, or your current branch with unstaged local changes.

3.  Submit your prompt

    Submit your task and Codex will create a Git worktree based on the branch you selected. By default, Codex works in a ["detached HEAD"](https://git-scm.com/docs/git-checkout#_detached_head).

4.  Choose where to keep working

    When you're ready, you can either keep working directly on the worktree or hand the thread off to your local checkout. Handing off to or from local will move your thread _and_ code so you can continue in the other checkout.



## Working between Local and Worktree

Worktrees look and feel much like your local checkout. The difference is where they fit into your flow. You can think of Local as the foreground and Worktree as the background. Handoff lets you move a thread between them.

Under the hood, Handoff handles the Git operations required to move work between two checkouts safely. This matters because **Git only allows a branch to be checked out in one place at a time**. If you check out a branch on a worktree, you **can't** check it out in your local checkout at the same time, and vice versa.

In practice, there are two common paths:

1. [Work exclusively on the worktree](/mirror/codex/app/worktrees#option-1-working-on-the-worktree). This path works best when you can verify changes directly on the worktree, for example because you have dependencies and tools installed using a [local environment setup script](/mirror/codex/app/local-environments).
2. [Hand the thread off to Local](/mirror/codex/app/worktrees#option-2-handing-a-thread-off-to-local). Use this when you want to bring the thread into the foreground, for example because you want to inspect changes in your usual IDE or can run only one instance of your app.

### Option 1: Working on the worktree





If you want to stay exclusively on the worktree with your changes, turn your worktree into a branch using the **Create branch here** button in the header of your thread.

From here you can commit your changes, push your branch to your remote repository, and open a pull request on GitHub.

You can open your IDE to the worktree using the "Open" button in the header, use the integrated terminal, or anything else that you need to do from the worktree directory.



&lt;CodexScreenshot
  alt="Worktree thread view with branch controls and worktree details"
  lightSrc="/images/codex/app/worktree-light.webp"
  darkSrc="/images/codex/app/worktree-dark.webp"
  maxHeight="400px"
  class="mb-4 lg:mb-0"
/&gt;



Remember, if you create a branch on a worktree, you can't check it out in any other worktree, including your local checkout.

### Option 2: Handing a thread off to Local





If you want to bring a thread into the foreground, click **Hand off** in the header of your thread and move it to **Local**.

This path works well when you want to read the changes in your usual IDE window, run your existing development server, or validate the work in the same environment you already use day to day.

Codex handles the Git steps required to move the thread safely between the worktree and your local checkout.

Each thread keeps the same associated worktree over time. If you hand the thread back to a worktree later, Codex returns it to that same background environment so you can pick up where you left off.



&lt;CodexScreenshot
  alt="Handoff dialog moving a thread from a worktree to Local"
  lightSrc="/images/codex/app/handoff-light.webp"
  darkSrc="/images/codex/app/handoff-dark.webp"
  maxHeight="400px"
  class="mb-4 lg:mb-0"
/&gt;



You can also go the other direction. If you're already working in Local and want to free up the foreground, use **Hand off** to move the thread to a worktree. This is useful when you want Codex to keep working in the background while you switch your attention back to something else locally.

Since Handoff uses Git operations, any files that are part of your `.gitignore` file won't move with the thread unless Codex copies them into a local managed worktree with `.worktreeinclude`.

## Advanced details

### Codex-managed and permanent worktrees

By default, threads use a Codex-managed worktree. These are meant to feel lightweight and disposable. A Codex-managed worktree is typically dedicated to one thread, and Codex returns that thread to the same worktree if you hand it back there later.

If you want a long-lived environment, create a permanent worktree from the three-dot menu on a project in the sidebar. This creates a new permanent worktree as its own project. Permanent worktrees aren't automatically deleted, and you can start multiple threads from the same worktree.

### How Codex manages worktrees for you

Codex creates worktrees in `$CODEX_HOME/worktrees`. The starting commit will be the `HEAD` commit of the branch selected when you start your thread. If you chose a branch with local changes, the uncommitted changes will be applied to the worktree as well. The worktree will _not_ be checked out as a branch. It will be in a [detached HEAD](https://git-scm.com/docs/git-checkout#_detached_head) state. This lets Codex create several worktrees without polluting your branches.

### Copy ignored local files into managed worktrees

Local Codex-managed worktrees start from a Git checkout, so tracked files are already present. If your repository ignores local setup files that a new worktree needs, add a `.worktreeinclude` file to the repository root and list the ignored paths or `.gitignore`-style patterns to copy when Codex creates a managed worktree.

Use this for files Git intentionally ignores, such as `.env`, `.env.local`, or `config/secrets.json`. Codex only copies ignored files that match `.worktreeinclude`; it doesn't copy other local files that Git doesn't track. Don't list tracked files.

Codex automatically copies an ignored `AGENTS.override.md` into local managed worktrees, so you don't need to list it in `.worktreeinclude`.

```text
# .worktreeinclude
.env
.env.local
config/secrets.json
```

Codex skips source symlinks and won't overwrite files that already exist in the new checkout. This behavior applies to local Codex app managed worktrees, not remote worktrees or Git worktrees you create yourself from the command line.

### Branch limitations

Suppose Codex finishes some work on a worktree and you choose to create a `feature/a` branch on it using **Create branch here**. Now, you want to try it on your local checkout. If you tried to check out the branch, you would get the following error:

```
fatal: 'feature/a' is already used by worktree at '<WORKTREE_PATH>'
```

To resolve this, you would need to check out another branch instead of `feature/a` on the worktree.

If you plan on checking out the branch locally, use Handoff to move the thread into Local instead of trying to keep the same branch checked out in both places at once.


Git prevents the same branch from being checked out in more than one worktree at a time because a branch represents a single mutable reference (`refs/heads/&lt;name&gt;`) whose meaning is “the current checked-out state” of a working tree.

When a branch is checked out, Git treats its HEAD as owned by that worktree and expects operations like commits, resets, rebases, and merges to advance that reference in a well-defined, serialized way. Allowing multiple worktrees to simultaneously check out the same branch would create ambiguity and race conditions around which worktree’s operations update the branch reference, potentially leading to lost commits, inconsistent indexes, or unclear conflict resolution.

By enforcing a one-branch-per-worktree rule, Git guarantees that each branch has a single authoritative working copy, while still allowing other worktrees to safely reference the same commits via detached HEADs or separate branches.



### Worktree cleanup

Worktrees can take up a lot of disk space. Each one has its own set of repository files, dependencies, build caches, etc. As a result, the Codex app tries to keep the number of worktrees to a reasonable limit.

By default, Codex keeps your most recent 15 Codex-managed worktrees. You can change this limit or turn off automatic deletion in settings if you prefer to manage disk usage yourself.

Codex tries to avoid deleting worktrees that are still important. Codex-managed worktrees won't be deleted automatically if:

- A pinned conversation is tied to it
- The thread is still in progress
- The worktree is a permanent worktree

Codex-managed worktrees are deleted automatically when:

- You archive the associated thread
- Codex needs to delete older worktrees to stay within your configured limit

Before deleting a Codex-managed worktree, Codex saves a snapshot of the work on it. If you open a conversation after its worktree was deleted, you'll see the option to restore it.

## Frequently asked questions


  Not today. Codex creates worktrees under `$CODEX_HOME/worktrees` so it can
  manage them consistently.



  Yes. Use **Hand off** in the thread header to move a thread between your local
  checkout and a worktree. Codex handles the Git operations needed to move the
  thread safely between environments. If you hand a thread back to a worktree
  later, Codex returns it to the same associated worktree.



  Threads can remain in your history even if the underlying worktree directory
  is deleted. For Codex-managed worktrees, Codex saves a snapshot before
  deleting the worktree and offers to restore it if you reopen the associated
  thread. Permanent worktrees are not automatically deleted when you archive
  their threads.


:::
:::

