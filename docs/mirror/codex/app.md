---
title: "Codex app 应用"
description: "Your Codex command center"
outline: deep
---

# Codex app 应用

**文档集**：Codex<br>
**分组**：应用<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/app](https://developers.openai.com/codex/app)
- Markdown 来源：[https://developers.openai.com/codex/app.md](https://developers.openai.com/codex/app.md)
- 抓取时间：2026-06-27T05:54:49.604Z
- Checksum：`7b8e9f5312684268c19b127d4960f5d1a53bddf26a88d45117497e988a199cd0`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex app 是一个专注的 desktop experience，用于并行处理 Codex threads，并内置 worktree support、automations 和 Git functionality。

ChatGPT Plus、Pro、Business、Edu 和 Enterprise plans 包含 Codex。进一步了解[包含哪些内容](/mirror/codex/pricing)。


  &lt;CodexScreenshot
    slot="windows"
    alt="Windows 版 Codex app，显示 project sidebar、active thread 和 review pane"
    lightSrc="/images/codex/windows/codex-windows-light.webp"
    darkSrc="/images/codex/windows/codex-windows-dark.webp"
    variant="no-wallpaper"
    maxHeight="300px"
  /&gt;
  &lt;CodexScreenshot
    alt="Codex app 窗口，显示 project sidebar、active thread 和 review pane"
    lightSrc="/images/codex/app/app-screenshot-light.webp"
    darkSrc="/images/codex/app/app-screenshot-dark.webp"
    variant="no-wallpaper"
    maxHeight="300px"
  /&gt;


## 入门

Codex app 可用于 macOS 和 Windows。

大多数 Codex app 功能在两个平台上都可用。相关文档会说明 platform-specific exceptions。


1. 下载并安装 Codex app

    下载 macOS 或 Windows 版 Codex app。如果你使用的是 Intel-based Mac，请选择 Intel build。




      [获取 Linux 通知](https://openai.com/form/codex-app/)


2. 打开 Codex 并登录

   下载并安装 Codex app 后，打开它，并使用你的 ChatGPT account 或 OpenAI API key 登录。

   如果你使用 OpenAI API key 登录，[某些功能可能不可用](/mirror/codex/pricing#feature-availability)。

3. 选择 project

   选择你希望 Codex 在其中工作的 project folder。

如果你以前用过 Codex app、CLI 或 IDE Extension，将会看到你曾经处理过的 past projects。

4. 发送第一条消息

   选择 project 后，确保已选中 **Local**，让 Codex 在你的机器上工作，然后向 Codex 发送第一条消息。

   你可以询问 Codex 与该 project 或你的电脑总体相关的任何问题。下面是一些示例：


     &lt;ExampleTask
       client:load
       id="intro"
       prompt="告诉我这个 project 的情况"
       iconName="brain"
     /&gt;
     &lt;ExampleTask
       client:load
       id="snake-game"
       shortDescription="在这个 repo 中构建一个经典 Snake game。"
       prompt={[
         "在这个 repo 中构建一个经典 Snake game。",
         "",
         "Scope & constraints:",
         "- 只实现经典 Snake loop：grid movement、growing snake、food spawn、score、game-over、restart。",
         "- 复用现有 project tooling/frameworks；除非确有必要，不要添加新 dependencies。",
         "- UI 保持 minimal，并与 repo 的现有 styles 一致（不要引入新的 design systems，不要添加额外 animations）。",
         "",
         "Implementation plan:",
         "1) Inspect repo，找到添加一个小型 interactive game 的合适位置（existing pages/routes/components）。",
         "2) 使用 deterministic、testable logic 实现 game state（snake positions、direction、food、score、tick timer）。",
         "3) Render：simple grid + snake + food；支持 keyboard controls（arrow keys/WASD），如果 repo 中存在 mobile，则支持 on-screen controls。",
         "4) 如果 repo 有 test runner，为核心 game logic 添加 basic tests（movement、collisions、growth、food placement）。",
         "",
         "Deliverables:",
         "- 一小组文件/变更，名称清晰。",
         "- 简短 run instructions（如何启动 dev server + 导航到哪里）。",
         "- 一份 brief checklist，说明要手动验证的内容（controls、pause/restart、boundaries）。",
       ].join("\n")}
       iconName="gamepad"
     /&gt;
     &lt;ExampleTask
       client:load
       id="fix-bugs"
       shortDescription="用最小且高置信度的改动，在我的 codebase 中查找并修复 bugs。"
       prompt={[
         "用最小且高置信度的改动，在我的 codebase 中查找并修复 bugs。",
         "",
         "Method (grounded + disciplined):",
         "1) Reproduce：运行 tests/lint/build（或遵循现有 repo scripts）。如果我提供了 error，请复现该确切 failure。",
         "2) Localize：识别涉及的最小文件/行集合（stack traces、failing tests、logs）。",
         "3) Fix：实现解决问题的最小改动，不做 refactors 或 unrelated cleanup。",
         "4) Prove：添加/更新一个 focused test（或 tight repro），使其在修复前失败、修复后通过。",
         "",
         "Constraints:",
         "- 不要编造 errors，也不要假装运行了无法运行的 commands。",
         "- 不要 scope drift：不添加新功能、不做 UI embellishments、不做 style overhauls。",
         "- 如果信息缺失，请说明你能从 repo 确认什么，以及仍未知什么。",
         "",
         "Output:",
         "- Summary（最多 3-6 句）：什么坏了、原因是什么，以及如何修复。",
         "- 然后不超过 5 个 bullets：What changed、Where (paths)、Evidence (tests/logs)、Risks、Next steps。",
       ].join("\n")}
       iconName="search"
     /&gt;


   如果需要更多灵感，请探索 [Codex use cases](https://developers.openai.com/codex/use-cases)。
   如果你是 Codex 新用户，请阅读 [best practices guide](/mirror/codex/learn/best-practices)。



---

## 使用 Codex app 工作




### 跨 projects 多任务处理

并排运行 project threads，并在它们之间快速切换。




### Worktrees

使用内置 Git worktree support 隔离并行代码更改。




### 远程连接

使用 ChatGPT mobile app 在 connected host 上启动、引导、批准和 review Codex 工作。




### Computer use

让 Codex 使用 macOS apps 执行 GUI tasks、browser flows 和 native app testing。




### Appshots

将最前方的 Mac app window 连同截图和可用文本发送给 Codex。




### Review 并发布更改

Inspect diffs、address PR feedback、stage files、commit 和 push。




### Terminal 和 actions

在每个 thread 中运行 commands，并启动可重复的 project actions。




### In-app browser

打开 rendered pages、留下 comments，或让 Codex 操作本地 browser flows。




### Chrome extension

添加 Chrome plugin，让 Codex 可以使用 Chrome 处理 signed-in browser tasks，同时由你管理 website approvals。




### 图像生成

在处理周边 code 和 assets 时，在 thread 中生成或编辑图像。




### Automations

安排 recurring tasks，或唤醒同一个 thread 以进行 ongoing checks。




### Skills

在 app、CLI 和 IDE Extension 中复用 instructions 和 workflows。




### Sidebar 和 artifacts

跟踪 plans、sources、task summaries 和 generated file previews。




### Plugins

连接 apps、skills 和 MCP servers，以扩展 Codex 可以完成的事。




### Sites

使用 Sites plugin 构建并部署托管 websites、web apps 和 games。




### IDE Extension sync

在 app 和 IDE sessions 之间共享 Auto Context 和 active threads。




---

需要帮助？请访问[故障排除指南](/mirror/codex/app/troubleshooting)。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
The Codex app is a focused desktop experience for working on Codex threads in parallel, with built-in worktree support, automations, and Git functionality.

ChatGPT Plus, Pro, Business, Edu, and Enterprise plans include Codex. Learn more about [what's included](https://developers.openai.com/codex/pricing).

<PlatformSpecificContent>
  <CodexScreenshot
    slot="windows"
    alt="Codex app for Windows showing a project sidebar, active thread, and review pane"
    lightSrc="/images/codex/windows/codex-windows-light.webp"
    darkSrc="/images/codex/windows/codex-windows-dark.webp"
    variant="no-wallpaper"
    maxHeight="300px"
  />
  <CodexScreenshot
    alt="Codex app window with a project sidebar, active thread, and review pane"
    lightSrc="/images/codex/app/app-screenshot-light.webp"
    darkSrc="/images/codex/app/app-screenshot-dark.webp"
    variant="no-wallpaper"
    maxHeight="300px"
  />
</PlatformSpecificContent>

## Getting started

The Codex app is available on macOS and Windows.

Most Codex app features are available on both platforms. The relevant docs
describe platform-specific exceptions.

<WorkflowSteps variant="headings">
1. Download and install the Codex app

    Download the Codex app for macOS or Windows. Choose the Intel build if you're using an Intel-based Mac.

    <CodexAppDownloadCta client:load className="mb-4" />

    <div class="text-sm">
      [Get notified for Linux](https://openai.com/form/codex-app/)
    </div>

2. Open Codex and sign in

   Once you downloaded and installed the Codex app, open it and sign in with your ChatGPT account or an OpenAI API key.

   If you sign in with an OpenAI API key, [some functionality might not be available](https://developers.openai.com/codex/pricing#feature-availability).

3. Select a project

   Choose a project folder that you want Codex to work in.

If you used the Codex app, CLI, or IDE Extension before you'll see past projects that you worked on.

4. Send your first message

   After choosing the project, make sure **Local** is selected to have Codex work on your machine and send your first message to Codex.

   You can ask Codex anything about the project or your computer in general. Here are some examples:

   <ExampleGallery>
     <ExampleTask
       client:load
       id="intro"
       prompt="Tell me about this project"
       iconName="brain"
     />
     <ExampleTask
       client:load
       id="snake-game"
       shortDescription="Build a classic Snake game in this repo."
       prompt={[
         "Build a classic Snake game in this repo.",
         "",
         "Scope & constraints:",
         "- Implement ONLY the classic Snake loop: grid movement, growing snake, food spawn, score, game-over, restart.",
         "- Reuse existing project tooling/frameworks; do NOT add new dependencies unless truly required.",
         "- Keep UI minimal and consistent with the repo’s existing styles (no new design systems, no extra animations).",
         "",
         "Implementation plan:",
         "1) Inspect the repo to find the right place to add a small interactive game (existing pages/routes/components).",
         "2) Implement game state (snake positions, direction, food, score, tick timer) with deterministic, testable logic.",
         "3) Render: simple grid + snake + food; support keyboard controls (arrow keys/WASD) and on-screen controls if mobile is present in the repo.",
         "4) Add basic tests for the core game logic (movement, collisions, growth, food placement) if the repo has a test runner.",
         "",
         "Deliverables:",
         "- A small set of files/changes with clear names.",
         "- Short run instructions (how to start dev server + where to navigate).",
         "- A brief checklist of what to manually verify (controls, pause/restart, boundaries).",
       ].join("\n")}
       iconName="gamepad"
     />
     <ExampleTask
       client:load
       id="fix-bugs"
       shortDescription="Find and fix bugs in my codebase with minimal, high-confidence changes."
       prompt={[
         "Find and fix bugs in my codebase with minimal, high-confidence changes.",
         "",
         "Method (grounded + disciplined):",
         "1) Reproduce: run tests/lint/build (or follow the existing repo scripts). If I provided an error, reproduce that exact failure.",
         "2) Localize: identify the smallest set of files/lines involved (stack traces, failing tests, logs).",
         "3) Fix: implement the minimal change that resolves the issue without refactors or unrelated cleanup.",
         "4) Prove: add/update a focused test (or a tight repro) that fails before and passes after.",
         "",
         "Constraints:",
         "- Do NOT invent errors or pretend to run commands you cannot run.",
         "- No scope drift: no new features, no UI embellishments, no style overhauls.",
         "- If information is missing, state what you can confirm from the repo and what remains unknown.",
         "",
         "Output:",
         "- Summary (3–6 sentences max): what was broken, why, and the fix.",
         "- Then ≤5 bullets: What changed, Where (paths), Evidence (tests/logs), Risks, Next steps.",
       ].join("\n")}
       iconName="search"
     />
   </ExampleGallery>

   If you need more inspiration, explore [Codex use cases](https://developers.openai.com/codex/use-cases).
   If you're new to Codex, read the [best practices guide](https://developers.openai.com/codex/learn/best-practices).

</WorkflowSteps>

---

## Work with the Codex app

<BentoContainer class="mt-6">
  <BentoContent href="/codex/app/features#multitask-across-projects">

### Multitask across projects

Run project threads side by side and switch between them quickly.

  </BentoContent>
  <BentoContent href="/codex/app/worktrees">

### Worktrees

Keep parallel code changes isolated with built-in Git worktree support.

  </BentoContent>
  <BentoContent href="/codex/remote-connections">

### Remote connections

Use the ChatGPT mobile app to start, steer, approve, and review Codex work on a
connected host.

  </BentoContent>
  <BentoContent href="/codex/app/computer-use">

### Computer use

Let Codex use macOS apps for GUI tasks, browser flows, and native app testing.

  </BentoContent>
  <BentoContent href="/codex/appshots">

### Appshots

Send the frontmost Mac app window to Codex with a screenshot and available text.

  </BentoContent>
  <BentoContent href="/codex/app/review">

### Review and ship changes

Inspect diffs, address PR feedback, stage files, commit, and push.

  </BentoContent>
  <BentoContent href="/codex/app/features#integrated-terminal">

### Terminal and actions

Run commands in each thread and launch repeatable project actions.

  </BentoContent>
  <BentoContent href="/codex/app/browser">

### In-app browser

Open rendered pages, leave comments, or let Codex operate local browser flows.

  </BentoContent>
  <BentoContent href="/codex/app/chrome-extension">

### Chrome extension

Add the Chrome plugin so Codex can use Chrome for signed-in browser tasks while you manage website approvals.

  </BentoContent>
  <BentoContent href="/codex/app/features#image-generation">

### Image generation

Generate or edit images in a thread while you work on the surrounding code and assets.

  </BentoContent>
  <BentoContent href="/codex/app/automations">

### Automations

Schedule recurring tasks, or wake up the same thread for ongoing checks.

  </BentoContent>
  <BentoContent href="/codex/app/features#skills-support">

### Skills

Reuse instructions and workflows across the app, CLI, and IDE Extension.

  </BentoContent>
  <BentoContent href="/codex/app/features#richer-outputs-and-artifacts">

### Sidebar and artifacts

Follow plans, sources, task summaries, and generated file previews.

  </BentoContent>
  <BentoContent href="/codex/plugins">

### Plugins

Connect apps, skills, and MCP servers to extend what Codex can do.

  </BentoContent>
  <BentoContent href="/codex/sites">

### Sites

Build and deploy hosted websites, web apps, and games with the Sites plugin.

  </BentoContent>
  <BentoContent href="/codex/app/features#sync-with-the-ide-extension">

### IDE Extension sync

Share Auto Context and active threads across app and IDE sessions.

  </BentoContent>
</BentoContainer>

---

Need help? Visit the [troubleshooting guide](https://developers.openai.com/codex/app/troubleshooting).
``````
:::
:::

