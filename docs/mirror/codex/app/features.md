---
title: "Codex app features"
description: "What you can do with the Codex app"
outline: deep
---

# Codex app features

**文档集**：Codex  
**分组**：Codex — App  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/app/features](https://developers.openai.com/codex/app/features)
- Markdown 来源：[https://developers.openai.com/codex/app/features.md](https://developers.openai.com/codex/app/features.md)
- 抓取时间：2026-06-27T05:54:51.784Z
- Checksum：`76b6bff2ee8cfb1afe18cd78e6dea206bb7e83992c95dd2804c3bc4c6eb186f9`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex app 是一个专注的 desktop experience，用于并行处理 Codex threads，并内置 worktree support、automations 和 Git functionality。

大多数 Codex app 功能在 macOS 和 Windows 上都可用。以下 sections 会标明 platform-specific exceptions。

&lt;YouTubeEmbed
  title="Introducing the Codex app"
  videoId="HFM3se4lNiw"
  class="max-w-md"
/&gt;

---





## 跨 projects 多任务处理

使用一个 Codex app window 跨 projects 运行任务。为每个 codebase 添加 project，并按需在它们之间切换。

当你的 Codex desktop app 中可用时，你可以请求 Codex 管理本地 projects 或 worktrees 中的 threads。例如，请它查找相关 thread、继续现有 thread，或 pin 或 archive thread。要创建单独的 background thread，请明确提出该请求：`Create a separate background thread in a worktree for this project to update the tests.`

如果你使用过 [Codex CLI](/mirror/codex/cli)，project 就像在特定目录中启动 session。

如果你在包含两个或更多 apps 或 packages 的单个 repository 中工作，请将不同 projects 拆分为单独的 app projects，这样 [sandbox](/mirror/codex/agent-approvals-security) 只包含该 project 的文件。



&lt;CodexScreenshot
  alt="Codex app 在 sidebar 中显示多个 projects，并在 main pane 中显示 threads"
  lightSrc="/images/codex/app/multitask-light.webp"
  darkSrc="/images/codex/app/multitask-dark.webp"
  maxHeight="400px"
/&gt;







## Skills support

Codex app 支持与 CLI 和 IDE Extension 相同的 [agent skills](/mirror/codex/skills)。你也可以点击 sidebar 中的 Skills，查看和探索团队在不同 projects 中创建的新 skills。



&lt;CodexScreenshot
  alt="Codex app 中显示 available skills 的 skills picker"
  lightSrc="/images/codex/app/skill-selector-light.webp"
  darkSrc="/images/codex/app/skill-selector-dark.webp"
  maxHeight="400px"
/&gt;







## Automations

你还可以将 skills 与 [automations](/mirror/codex/app/automations) 结合，执行 routine tasks，例如评估 telemetry 中的 errors 并提交 fixes，或创建关于近期 codebase changes 的 reports。对于应保留在一个 thread 中的 ongoing work，请使用 [thread automation](/mirror/codex/app/automations#thread-automations)。



&lt;CodexScreenshot
  alt="包含 schedule 和 prompt 字段的 automation 创建表单"
  lightSrc="/images/codex/app/create-automation-light.webp"
  darkSrc="/images/codex/app/create-automation-dark.webp"
  maxHeight="400px"
/&gt;







## Modes

每个 thread 都会在选定 mode 中运行。启动 thread 时，你可以选择：

- **Local**：直接在当前 project directory 中工作。
- **Worktree**：在 Git worktree 中隔离更改。[进一步了解](/mirror/codex/app/worktrees)。
- **Cloud**：在配置的 cloud environment 中远程运行。

**Local** 和 **Worktree** threads 都会在你的电脑上运行。

完整 glossary 和 concepts 请探索 [concepts section](/mirror/codex/prompting)。



&lt;CodexScreenshot
  alt="包含 Local、Worktree 和 Cloud mode 选项的新 thread composer"
  lightSrc="/images/codex/app/modes-light.webp"
  darkSrc="/images/codex/app/modes-dark.webp"
  maxHeight="400px"
/&gt;







## 内置 Git tools

Codex app 直接在 app 内提供常见 Git 功能。

diff pane 会显示你在本地 project 或 worktree checkout 中的 changes 的 Git diff。你还可以添加 inline comments 让 Codex 处理，并 stage 或 revert 特定 chunks 或整个 files。

你还可以直接在 Codex app 中为 local 和 worktree tasks commit、push，并创建 pull requests。

更高级的 Git tasks 请使用 [integrated terminal](/mirror/codex/app/features#integrated-terminal)。



&lt;CodexScreenshot
  alt="包含 commit message 字段的 Git diff 和 commit panel"
  lightSrc="/images/codex/app/git-commit-light.webp"
  darkSrc="/images/codex/app/git-commit-dark.webp"
  maxHeight="400px"
/&gt;







## Worktree support

创建新 thread 时，请选择 **Local** 或 **Worktree**。**Local** 会直接在你的 project 中工作。**Worktree** 会创建新的 [Git worktree](https://git-scm.com/docs/git-worktree)，让更改与你的常规 project 保持隔离。

当你想试验新想法而不触碰当前工作，或想让 Codex 在同一 project 中并排运行独立任务时，请使用 **Worktree**。

对于 Git repositories，Automations 会在 dedicated background worktrees 中运行；对于非版本控制项目，则直接在 project directory 中运行。

[进一步了解如何在 Codex app 中使用 worktrees。](/mirror/codex/app/worktrees)



&lt;CodexScreenshot
  alt="显示 branch actions 和 worktree details 的 worktree thread view"
  lightSrc="/images/codex/app/worktree-light.webp"
  darkSrc="/images/codex/app/worktree-dark.webp"
  maxHeight="400px"
/&gt;







## Integrated terminal

每个 thread 都包含一个内置 terminal，其 scope 限于当前 project 或 worktree。使用 app 右上角的 terminal icon 或按 &lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;J&lt;/kbd&gt; 切换它。

使用 terminal 验证 changes、运行 scripts，并在不离开 app 的情况下执行 Git operations。Codex 也可以读取当前 terminal output，因此它可以检查正在运行的 development server 的状态，或在与你一起工作时回看 failed build。

常见任务包括：

- `git status`
- `git pull --rebase`
- `pnpm test` 或 `npm test`
- `pnpm run lint` 或类似 project commands

如果你定期运行某个 task，可以在 [local environment](/mirror/codex/app/local-environments) 中定义 **action**，为 Codex app window 顶部添加 shortcut button。

请注意，&lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;K&lt;/kbd&gt; 会打开 Codex app 中的 command palette。它不会清空 terminal。要清空 terminal，请使用 &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;L&lt;/kbd&gt;。



&lt;CodexScreenshot
  alt="在 Codex thread 下方打开的 integrated terminal drawer"
  lightSrc="/images/codex/app/integrated-terminal-light.webp"
  darkSrc="/images/codex/app/integrated-terminal-dark.webp"
  maxHeight="400px"
/&gt;







## Native Windows sandbox

在 Windows 上，Codex 可以原生运行于 PowerShell，并使用 native Windows sandbox，而不要求 WSL 或 virtual machine。这让你可以留在 Windows-native workflows 中，同时保持有界权限。

[进一步了解 Windows setup 和 sandboxing](/mirror/codex/app/windows)。



&lt;CodexScreenshot
  alt="Codex app Windows sandbox setup prompt，位于 message composer 上方"
  lightSrc="/images/codex/windows/windows-sandbox-setup.webp"
  darkSrc="/images/codex/windows/windows-sandbox-setup.webp"
  maxHeight="400px"
/&gt;







## 语音听写

用你的声音 prompt Codex。当 composer 可见时，按住 &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;M&lt;/kbd&gt; 并开始说话。你的语音会被转写。编辑转写后的 prompt，或点击 send 让 Codex 开始工作。



&lt;CodexScreenshot
  alt="composer 中带有转写 prompt 的 voice dictation indicator"
  lightSrc="/images/codex/app/voice-dictation-light.webp"
  darkSrc="/images/codex/app/voice-dictation-dark.webp"
  maxHeight="400px"
/&gt;







## Floating pop-out window

将 active conversation thread 弹出到单独窗口，并移动到你正在工作的地方。这非常适合 front-end work，你可以在快速迭代时把 thread 放在 browser、editor 或 design preview 附近。

当你希望它在整个 workflow 中保持可见时，也可以切换 pop-out window，使其保持在最前。



&lt;CodexScreenshot
  alt="light mode 下的 pop-out window preview"
  lightSrc="/images/codex/app/popover-light.webp"
  darkSrc="/images/codex/app/popover-dark.webp"
  maxHeight="400px"
/&gt;







## In-app browser

使用 [in-app browser](/mirror/codex/app/browser) 预览、review 并 comment local development servers、file-backed previews，以及不需要 sign-in 的 public pages，以便在迭代 web app 时使用。

In-app browser 不支持 authentication flows、signed-in pages、你的常规 browser profile、cookies、extensions 或 existing tabs。

使用 browser comments 标记页面上的特定 elements 或 areas，然后请求 Codex 处理该 feedback。

当你希望 Codex 直接操作页面时，请为 local development servers 和 file-backed pages 使用 [browser use](/mirror/codex/app/browser#browser-use)。你可以从 settings 管理 Browser plugin、allowed websites 和 blocked websites。



&lt;CodexScreenshot
  alt="Codex app 在 local web app preview 上显示 browser comment"
  lightSrc="/images/codex/app/in-app-browser-light.webp"
  darkSrc="/images/codex/app/in-app-browser-dark.webp"
  maxHeight="400px"
  variant="no-wallpaper"
/&gt;







## Computer use

[Computer use](/mirror/codex/app/computer-use) 帮助 Codex 通过看、点击和输入来操作 macOS 或 Windows app。这适用于测试 desktop apps、检查 browser 或 simulator flows、处理 plugins 无法提供的数据源、更改 app settings，以及复现 GUI-only bugs。

由于 computer use 可能影响 project workspace 外部的 app 和 system state，请保持 tasks narrow，并在继续前 review permission prompts。



&lt;CodexScreenshot
  alt="Codex app 请求使用 Calculator 进行 computer use 的权限"
  lightSrc="/images/codex/app/computer-use-approval-light.webp"
  darkSrc="/images/codex/app/computer-use-approval-dark.webp"
  maxHeight="400px"
  variant="no-wallpaper"
/&gt;











## 处理非代码 artifacts

当 task 生成非代码 artifacts 时，sidebar 可以预览 PDF files、spreadsheets、documents 和 presentations。请向 Codex 提供 source data、expected file type、structure，以及你关心的 review criteria。

对于 spreadsheets 和 presentations，请描述重要的 sheets、columns、charts、slide sections 和 checks。请求 Codex 说明它把输出保存在哪里，以及如何检查结果。

使用 task sidebar 跟踪 Codex 在线程运行时的动作。它可以显示 agent 的 plan、sources、generated artifacts 和 task summary，便于你引导工作、检查 generated files，并决定是否需要再来一轮。



&lt;CodexScreenshot
  alt="Codex app 在 artifact viewer 中显示 generated presentation"
  lightSrc="/images/codex/app/artifact-viewer-light.webp"
  darkSrc="/images/codex/app/artifact-viewer-dark.webp"
  maxHeight="420px"
  variant="no-wallpaper"
/&gt;



---

## 与 IDE extension 同步

如果你的 editor 中安装了 [Codex IDE Extension](/mirror/codex/ide)，当 Codex app 和 IDE Extension 位于同一 project 中时，它们会自动同步。

同步时，你会在 Codex app composer 中看到 **IDE context** 选项。启用 "Auto context" 后，Codex app 会跟踪你正在查看的 files，因此你可以间接引用它们（例如，"What's this file about?"）。你还可以在 IDE Extension 中看到 Codex app 内运行的 threads，反之亦然。

如果你不确定 app 是否包含 context，请将其关闭，并再次询问同一问题以比较结果。

## Thread automations

Automations 也可以附着到单个 thread。这些 thread automations 是 recurring wake-up calls，会保留 thread context，让 Codex 可以检查 long-running work、轮询 source 获取新信息，或继续 follow-up loop。它们适合应按计划不断回到同一 conversation 的 heartbeat-style automations。

当下一次 run 依赖当前 conversation 时，请使用 thread automation。当你希望 Codex 为一个或多个 projects 启动全新的 recurring task 时，请使用 standalone 或 project [automation](/mirror/codex/app/automations)。

## Approvals 与 sandboxing

你的 approval 和 sandbox settings 会约束 Codex actions。

- Approvals 决定 Codex 在运行 command 前何时暂停以请求权限。
- Sandbox 控制 Codex 可以使用哪些 directories 和 network access。

当你看到类似 “approve once” 或 “approve for this session” 的 prompts 时，你是在为 tool execution 授予不同 scopes 的权限。如果你不确定，请批准最窄的选项并继续迭代。

默认情况下，Codex 将工作 scope 限定在当前 project。在大多数情况下，这是合适的约束。

如果你的 task 需要跨多个 repository 或 directory 工作，请优先打开单独的 projects 或使用 worktrees，而不是请求 Codex 在 project root 外漫游。

如果你的 workspace 中提供 [automatic review](/mirror/codex/agent-approvals-security#automatic-approval-reviews)，你可以从 permissions selector 中选择它。它保持相同的 sandbox boundary，但会通过配置的 review policy 路由符合条件的 approval requests，而不是等待你。

高层概览请参阅 [sandboxing](/mirror/codex/concepts/sandboxing)。配置详情请参阅 [agent approvals & security documentation](/mirror/codex/agent-approvals-security)。

## MCP support

Codex app、CLI 和 IDE Extension 共享 [Model Context Protocol (MCP)](/mirror/codex/mcp) settings。如果你已经在其中一个中配置了 MCP servers，它们会自动被其他端采用。要配置新 servers，请打开 app settings 中的 MCP section，并启用推荐 server 或向配置中添加新 server。

## Web search

Codex 附带 first-party web search tool。对于 Codex app 中的本地 tasks，Codex 默认启用 web search，并从 web search cache 提供结果。如果你将 sandbox 配置为 [full access](/mirror/codex/agent-approvals-security)，web search 默认使用 live results。请参阅 [Config basics](/mirror/codex/config-basic)，以禁用 web search 或切换到获取最新数据的 live results。

## 图像生成

请求 Codex 直接在线程中生成或编辑图像。这适用于你想与代码一起创建的 UI assets、banners、backgrounds、illustrations、sprite sheets 和 placeholders。当你希望 Codex 转换或扩展现有 asset 时，请添加 reference image。

你可以用自然语言请求，或在 prompt 中包含 `$imagegen` 以显式调用 image generation skill。

内置图像生成使用 `gpt-image-2`，计入你的常规 Codex usage limits，并且平均消耗 included limits 的速度比不带图像生成的类似 turns 快 3-5 倍，具体取决于 image quality 和 size。详情请参阅 [Pricing](/mirror/codex/pricing#image-generation-usage-limits)。prompting tips 和 model details 请参阅 [image generation guide](/mirror/api/docs/guides/image-generation)。

对于更大批量的 image generation，请在 environment variables 中设置 `OPENAI_API_KEY`，并请求 Codex 通过 API 生成图像，这样会适用 API pricing。

## Image input

你可以将图像拖放到 prompt composer 中，以将其作为 context 包含进来。拖放图像时按住 `Shift`，可将图像添加到 context。

你也可以请求 Codex 查看系统上的图像。通过给 Codex 工具来截取你正在处理的 app 的 screenshots，Codex 可以验证它正在做的工作。



## Chats

Chats 是当 task 不需要特定 project folder 或 Git repository 时可以启动的 threads。它们适用于 research、triage、planning、plugin-heavy workflows，以及其他 Codex 应使用 connected tools 而不是编辑 codebase 的 conversations。

Chats 使用 Codex-managed `threads` directory 作为工作位置，该目录位于你的 Codex home 下。默认情况下，该位置是 `~/.codex/threads`。

## Memories

[Memories](/mirror/codex/memories)（如果可用）让 Codex 将 past tasks 中有用的 context 带入 future threads。它们最适合 stable preferences、project conventions、recurring work patterns，以及否则需要重复说明的 known pitfalls。

## Notifications

默认情况下，当 task 完成或需要 approval 且 app 在后台时，Codex app 会发送 notifications。

在 Codex app settings 中，你可以选择 never send notifications，或即使 app 在前台也 always send them。

## 让电脑保持唤醒

由于你的 tasks 可能需要一段时间才能完成，你可以在 app settings 中启用 "Prevent sleep while running" toggle，让 Codex app 防止电脑进入睡眠。

## 另见

- [Settings](/mirror/codex/app/settings)
- [Automations](/mirror/codex/app/automations)
- [In-app browser](/mirror/codex/app/browser)
- [Computer use](/mirror/codex/app/computer-use)
- [Review pane](/mirror/codex/app/review)
- [Local environments](/mirror/codex/app/local-environments)
- [Worktrees](/mirror/codex/app/worktrees)

:::

## English source

::: details 展开英文原文
::: v-pre
The Codex app is a focused desktop experience for working on Codex threads in parallel,
with built-in worktree support, automations, and Git functionality.

Most Codex app features are available on both macOS and Windows.
The sections below note platform-specific exceptions.

&lt;YouTubeEmbed
  title="Introducing the Codex app"
  videoId="HFM3se4lNiw"
  class="max-w-md"
/&gt;

---





## Multitask across projects

Use one Codex app window to run tasks across projects. Add a project for each
codebase and switch between them as needed.

When available in your Codex desktop app, you can ask Codex to manage threads
in your local projects or worktrees. For example, ask it to find a related
thread, continue an existing thread, or pin or archive a thread. To create a
separate background thread, make that request explicit: `Create a separate
background thread in a worktree for this project to update the tests.`

If you've used the [Codex CLI](/mirror/codex/cli), a project is like starting a
session in a specific directory.

If you work in a single repository with two or more apps or packages, split
distinct projects into separate app projects so the [sandbox](/mirror/codex/agent-approvals-security)
only includes the files for that project.



&lt;CodexScreenshot
  alt="Codex app showing multiple projects in the sidebar and threads in the main pane"
  lightSrc="/images/codex/app/multitask-light.webp"
  darkSrc="/images/codex/app/multitask-dark.webp"
  maxHeight="400px"
/&gt;







## Skills support

The Codex app supports the same [agent skills](/mirror/codex/skills) as the CLI and
IDE Extension. You can also view and explore new skills that your team has
created across your different projects by clicking Skills in the sidebar.



&lt;CodexScreenshot
  alt="Skills picker showing available skills in the Codex app"
  lightSrc="/images/codex/app/skill-selector-light.webp"
  darkSrc="/images/codex/app/skill-selector-dark.webp"
  maxHeight="400px"
/&gt;







## Automations

You can also combine skills with [automations](/mirror/codex/app/automations) to perform routine tasks
such as evaluating errors in your telemetry and submitting fixes or creating reports on recent
codebase changes. For ongoing work that should stay in one thread, use a
[thread automation](/mirror/codex/app/automations#thread-automations).



&lt;CodexScreenshot
  alt="Automation creation form with schedule and prompt fields"
  lightSrc="/images/codex/app/create-automation-light.webp"
  darkSrc="/images/codex/app/create-automation-dark.webp"
  maxHeight="400px"
/&gt;







## Modes

Each thread runs in a selected mode. When starting a thread, you can choose:

- **Local**: work directly in your current project directory.
- **Worktree**: isolate changes in a Git worktree. [Learn more](/mirror/codex/app/worktrees).
- **Cloud**: run remotely in a configured cloud environment.

Both **Local** and **Worktree** threads will run on your computer.

For the full glossary and concepts, explore the [concepts section](/mirror/codex/prompting).



&lt;CodexScreenshot
  alt="New thread composer with Local, Worktree, and Cloud mode options"
  lightSrc="/images/codex/app/modes-light.webp"
  darkSrc="/images/codex/app/modes-dark.webp"
  maxHeight="400px"
/&gt;







## Built-in Git tools

The Codex app provides common Git features directly within the app.

The diff pane shows a Git diff of your changes in your local project or worktree checkout. You
can also add inline comments for Codex to address and stage or revert specific chunks or entire files.

You can also commit, push, and create pull requests for local and worktree tasks directly from
within the Codex app.

For more advanced Git tasks, use the [integrated terminal](/mirror/codex/app/features#integrated-terminal).



&lt;CodexScreenshot
  alt="Git diff and commit panel with a commit message field"
  lightSrc="/images/codex/app/git-commit-light.webp"
  darkSrc="/images/codex/app/git-commit-dark.webp"
  maxHeight="400px"
/&gt;







## Worktree support

When you create a new thread, choose **Local** or **Worktree**. **Local** works
directly within your project. **Worktree** creates a new [Git worktree](https://git-scm.com/docs/git-worktree) so changes stay isolated from your regular project.

Use **Worktree** when you want to try a new idea without touching your current
work, or when you want Codex to run independent tasks side by side in the same
project.

Automations run in dedicated background worktrees for Git repositories, and directly in the project directory for non-version-controlled projects.

[Learn more about using worktrees in the Codex app.](/mirror/codex/app/worktrees)



&lt;CodexScreenshot
  alt="Worktree thread view showing branch actions and worktree details"
  lightSrc="/images/codex/app/worktree-light.webp"
  darkSrc="/images/codex/app/worktree-dark.webp"
  maxHeight="400px"
/&gt;







## Integrated terminal

Each thread includes a built-in terminal scoped to the current project or
worktree. Toggle it using the terminal icon in the top right of the app or by
pressing &lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;J&lt;/kbd&gt;.

Use the terminal to validate changes, run scripts, and perform Git operations
without leaving the app. Codex can also read the current terminal output, so
it can check the status of a running development server or refer back to a
failed build while it works with you.

Common tasks include:

- `git status`
- `git pull --rebase`
- `pnpm test` or `npm test`
- `pnpm run lint` or similar project commands

If you run a task regularly, you can define an **action** inside your [local environment](/mirror/codex/app/local-environments) to add a shortcut button to the top of your Codex app window.

Note that &lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;K&lt;/kbd&gt; opens the command palette in the Codex
app. It doesn't clear the terminal. To clear the terminal use &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;L&lt;/kbd&gt;.



&lt;CodexScreenshot
  alt="Integrated terminal drawer open beneath a Codex thread"
  lightSrc="/images/codex/app/integrated-terminal-light.webp"
  darkSrc="/images/codex/app/integrated-terminal-dark.webp"
  maxHeight="400px"
/&gt;







## Native Windows sandbox

On Windows, Codex can run natively in PowerShell with a native Windows sandbox
instead of requiring WSL or a virtual machine. This lets you stay in
Windows-native workflows while keeping bounded permissions in place.

[Learn more about Windows setup and sandboxing](/mirror/codex/app/windows).



&lt;CodexScreenshot
  alt="Codex app Windows sandbox setup prompt above the message composer"
  lightSrc="/images/codex/windows/windows-sandbox-setup.webp"
  darkSrc="/images/codex/windows/windows-sandbox-setup.webp"
  maxHeight="400px"
/&gt;







## Voice dictation

Use your voice to prompt Codex. Hold &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;M&lt;/kbd&gt; while the composer is visible and start talking. Your voice will be transcribed. Edit the transcribed prompt or hit send to have Codex start work.



&lt;CodexScreenshot
  alt="Voice dictation indicator in the composer with a transcribed prompt"
  lightSrc="/images/codex/app/voice-dictation-light.webp"
  darkSrc="/images/codex/app/voice-dictation-dark.webp"
  maxHeight="400px"
/&gt;







## Floating pop-out window

Pop out an active conversation thread into a separate window and move it to where
you are actively working. This is ideal for front-end work, where you can keep
the thread near your browser, editor, or design preview while iterating quickly.

You can also toggle the pop-out window to stay on top when you want it to remain
visible across your workflow.



&lt;CodexScreenshot
  alt="Pop-out window preview in light mode"
  lightSrc="/images/codex/app/popover-light.webp"
  darkSrc="/images/codex/app/popover-dark.webp"
  maxHeight="400px"
/&gt;







## In-app browser

Use the [in-app browser](/mirror/codex/app/browser) to preview, review, and comment on
local development servers, file-backed previews, and public pages that don't
require sign-in while you iterate on a web app.

The in-app browser doesn't support authentication flows, signed-in pages, your
regular browser profile, cookies, extensions, or existing tabs.

Use browser comments to mark specific elements or areas on a page, then ask
Codex to address that feedback.

When you want Codex to operate the page directly, use
[browser use](/mirror/codex/app/browser#browser-use) for local development servers and
file-backed pages. You can manage the Browser plugin, allowed websites, and
blocked websites from settings.



&lt;CodexScreenshot
  alt="Codex app showing a browser comment on a local web app preview"
  lightSrc="/images/codex/app/in-app-browser-light.webp"
  darkSrc="/images/codex/app/in-app-browser-dark.webp"
  maxHeight="400px"
  variant="no-wallpaper"
/&gt;







## Computer use

[Computer use](/mirror/codex/app/computer-use) helps Codex operate a macOS or Windows
app by seeing, clicking, and typing. This is useful for testing desktop apps,
checking browser or simulator flows, working with data sources that aren't
available as plugins, changing app settings, and reproducing GUI-only bugs.

Because computer use can affect app and system state outside your project
workspace, keep tasks narrow and review permission prompts before continuing.



&lt;CodexScreenshot
  alt="Codex app asking for permission to use Calculator with computer use"
  lightSrc="/images/codex/app/computer-use-approval-light.webp"
  darkSrc="/images/codex/app/computer-use-approval-dark.webp"
  maxHeight="400px"
  variant="no-wallpaper"
/&gt;











## Work with non-code artifacts

When a task produces non-code artifacts, the sidebar can preview PDF files,
spreadsheets, documents, and presentations. Give Codex the source data, expected
file type, structure, and review criteria you care about.

For spreadsheets and presentations, describe the sheets, columns, charts, slide
sections, and checks that matter. Ask Codex to explain where it saved the output
and how it checked the result.

Use the task sidebar to follow what Codex is doing while a thread runs. It can
surface the agent's plan, sources, generated artifacts, and task summary so you
can steer the work, inspect generated files, and decide what needs another pass.



&lt;CodexScreenshot
  alt="Codex app showing a generated presentation in the artifact viewer"
  lightSrc="/images/codex/app/artifact-viewer-light.webp"
  darkSrc="/images/codex/app/artifact-viewer-dark.webp"
  maxHeight="420px"
  variant="no-wallpaper"
/&gt;



---

## Sync with the IDE extension

If you have the [Codex IDE Extension](/mirror/codex/ide) installed in your editor,
your Codex app and IDE Extension automatically sync when both are in the same
project.

When they sync, you see an **IDE context** option in the Codex app composer. With "Auto context"
enabled, the Codex app tracks the files you're viewing, so you can reference them indirectly (for
example, "What's this file about?"). You can also see threads running in the Codex app inside the
IDE Extension, and vice versa.

If you're unsure whether the app includes context, toggle it off and ask the
same question again to compare results.

## Thread automations

Automations can also attach to a single thread. These thread automations are
recurring wake-up calls that preserve the thread's context so Codex can check
on long-running work, poll a source for new information, or continue a follow-up
loop. Use them for heartbeat-style automations that should keep returning to the
same conversation on a schedule.

Use a thread automation when the next run depends on the current conversation.
Use a standalone or project [automation](/mirror/codex/app/automations) when you want
Codex to start a fresh recurring task for one or more projects.

## Approvals and sandboxing

Your approval and sandbox settings constrain Codex actions.

- Approvals determine when Codex pauses for permission before running a command.
- The sandbox controls which directories and network access Codex can use.

When you see prompts like “approve once” or “approve for this session,” you are
granting different scopes of permission for tool execution. If you are unsure,
approve the narrowest option and continue iterating.

By default, Codex scopes work to the current project. In most cases, that's the
right constraint.

If your task requires work across more than one repository or directory, prefer
opening separate projects or using worktrees rather than asking Codex to roam
outside the project root.

If [automatic review](/mirror/codex/agent-approvals-security#automatic-approval-reviews)
is available in your workspace, you can choose it from the permissions selector.
It keeps the same sandbox boundary but routes eligible approval requests through
the configured review policy instead of waiting for you.

For a high-level overview, see [sandboxing](/mirror/codex/concepts/sandboxing). For
configuration details, see the
[agent approvals & security documentation](/mirror/codex/agent-approvals-security).

## MCP support

The Codex app, CLI, and IDE Extension share [Model Context Protocol (MCP)](/mirror/codex/mcp) settings.
If you've already configured MCP servers in one, they're automatically adopted by the others. To
configure new servers, open the MCP section in the app's settings and either enable a recommended
server or add a new server to your configuration.

## Web search

Codex ships with a first-party web search tool. For local tasks in the Codex app, Codex
enables web search by default and serves results from a web search cache. If you configure your
sandbox for [full access](/mirror/codex/agent-approvals-security), web search defaults to live results. See
[Config basics](/mirror/codex/config-basic) to disable web search or switch to live results that fetch the
most recent data.

## Image generation

Ask Codex to generate or edit images directly in a thread. This is useful for UI assets, banners, backgrounds, illustrations, sprite sheets, and placeholders you want to create alongside code. Add a reference image when you want Codex to transform or extend an existing asset.

You can ask in natural language or explicitly invoke the image generation skill by including `$imagegen` in your prompt.

Built-in image generation uses `gpt-image-2`, counts toward your general Codex usage limits, and uses included limits 3-5x faster on average than similar turns without image generation, depending on image quality and size. For details, see [Pricing](/mirror/codex/pricing#image-generation-usage-limits). For prompting tips and model details, see the [image generation guide](/mirror/api/docs/guides/image-generation).

For larger batches of image generation, set `OPENAI_API_KEY` in your environment variables and ask Codex to generate images through the API so API pricing applies instead.

## Image input

You can drag and drop images into the prompt composer to include them as context. Hold down `Shift`
while dropping an image to add the image to the context.

You can also ask Codex to view images on your system. By giving Codex tools to take screenshots of
the app you are working on, Codex can verify the work it's doing.



## Chats

Chats are threads you can start when the task doesn't need a specific project
folder or Git repository. Use them for research, triage, planning,
plugin-heavy workflows, and other conversations where Codex should use connected
tools instead of editing a codebase.

Chats use a Codex-managed `threads` directory under your Codex home as their
working location. By default, that location is `~/.codex/threads`.

## Memories

[Memories](/mirror/codex/memories), where available, let Codex carry useful context
from past tasks into future threads. They're most useful for stable preferences,
project conventions, recurring work patterns, and known pitfalls that would
otherwise need to repeat.

## Notifications

By default, the Codex app sends notifications when a task completes or needs approval while the app
is in the background.

In the Codex app settings, you can choose to never send notifications or always send them, even
when the app is in focus.

## Keep your computer awake

Since your tasks might take a while to complete, you can have the Codex app prevent your computer
from going to sleep by enabling the "Prevent sleep while running" toggle in the app's settings.

## See also

- [Settings](/mirror/codex/app/settings)
- [Automations](/mirror/codex/app/automations)
- [In-app browser](/mirror/codex/app/browser)
- [Computer use](/mirror/codex/app/computer-use)
- [Review pane](/mirror/codex/app/review)
- [Local environments](/mirror/codex/app/local-environments)
- [Worktrees](/mirror/codex/app/worktrees)

:::
:::

