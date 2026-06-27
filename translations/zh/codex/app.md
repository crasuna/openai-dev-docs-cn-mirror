---
status: needs-review
sourceId: "7b8e9f531268"
sourceChecksum: "7b8e9f5312684268c19b127d4960f5d1a53bddf26a88d45117497e988a199cd0"
sourceUrl: "https://developers.openai.com/codex/app"
translatedAt: "2026-06-27T11:05:57.267Z"
translator: codex-gpt-5.5-xhigh
---

# Codex app

Codex app 是一个专注的 desktop experience，用于并行处理 Codex threads，并内置 worktree support、automations 和 Git functionality。

ChatGPT Plus、Pro、Business、Edu 和 Enterprise plans 包含 Codex。进一步了解[包含哪些内容](https://developers.openai.com/codex/pricing)。

<PlatformSpecificContent>
  <CodexScreenshot
    slot="windows"
    alt="Windows 版 Codex app，显示 project sidebar、active thread 和 review pane"
    lightSrc="/images/codex/windows/codex-windows-light.webp"
    darkSrc="/images/codex/windows/codex-windows-dark.webp"
    variant="no-wallpaper"
    maxHeight="300px"
  />
  <CodexScreenshot
    alt="Codex app 窗口，显示 project sidebar、active thread 和 review pane"
    lightSrc="/images/codex/app/app-screenshot-light.webp"
    darkSrc="/images/codex/app/app-screenshot-dark.webp"
    variant="no-wallpaper"
    maxHeight="300px"
  />
</PlatformSpecificContent>

## 入门

Codex app 可用于 macOS 和 Windows。

大多数 Codex app 功能在两个平台上都可用。相关文档会说明 platform-specific exceptions。

<WorkflowSteps variant="headings">
1. 下载并安装 Codex app

    下载 macOS 或 Windows 版 Codex app。如果你使用的是 Intel-based Mac，请选择 Intel build。

    <CodexAppDownloadCta client:load className="mb-4" />

    <div class="text-sm">
      [获取 Linux 通知](https://openai.com/form/codex-app/)
    </div>

2. 打开 Codex 并登录

   下载并安装 Codex app 后，打开它，并使用你的 ChatGPT account 或 OpenAI API key 登录。

   如果你使用 OpenAI API key 登录，[某些功能可能不可用](https://developers.openai.com/codex/pricing#feature-availability)。

3. 选择 project

   选择你希望 Codex 在其中工作的 project folder。

如果你以前用过 Codex app、CLI 或 IDE Extension，将会看到你曾经处理过的 past projects。

4. 发送第一条消息

   选择 project 后，确保已选中 **Local**，让 Codex 在你的机器上工作，然后向 Codex 发送第一条消息。

   你可以询问 Codex 与该 project 或你的电脑总体相关的任何问题。下面是一些示例：

   <ExampleGallery>
     <ExampleTask
       client:load
       id="intro"
       prompt="告诉我这个 project 的情况"
       iconName="brain"
     />
     <ExampleTask
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
     />
     <ExampleTask
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
     />
   </ExampleGallery>

   如果需要更多灵感，请探索 [Codex use cases](https://developers.openai.com/codex/use-cases)。
   如果你是 Codex 新用户，请阅读 [best practices guide](https://developers.openai.com/codex/learn/best-practices)。

</WorkflowSteps>

---

## 使用 Codex app 工作

<BentoContainer class="mt-6">
  <BentoContent href="/codex/app/features#multitask-across-projects">

### 跨 projects 多任务处理

并排运行 project threads，并在它们之间快速切换。

  </BentoContent>
  <BentoContent href="/codex/app/worktrees">

### Worktrees

使用内置 Git worktree support 隔离并行代码更改。

  </BentoContent>
  <BentoContent href="/codex/remote-connections">

### 远程连接

使用 ChatGPT mobile app 在 connected host 上启动、引导、批准和 review Codex 工作。

  </BentoContent>
  <BentoContent href="/codex/app/computer-use">

### Computer use

让 Codex 使用 macOS apps 执行 GUI tasks、browser flows 和 native app testing。

  </BentoContent>
  <BentoContent href="/codex/appshots">

### Appshots

将最前方的 Mac app window 连同截图和可用文本发送给 Codex。

  </BentoContent>
  <BentoContent href="/codex/app/review">

### Review 并发布更改

Inspect diffs、address PR feedback、stage files、commit 和 push。

  </BentoContent>
  <BentoContent href="/codex/app/features#integrated-terminal">

### Terminal 和 actions

在每个 thread 中运行 commands，并启动可重复的 project actions。

  </BentoContent>
  <BentoContent href="/codex/app/browser">

### In-app browser

打开 rendered pages、留下 comments，或让 Codex 操作本地 browser flows。

  </BentoContent>
  <BentoContent href="/codex/app/chrome-extension">

### Chrome extension

添加 Chrome plugin，让 Codex 可以使用 Chrome 处理 signed-in browser tasks，同时由你管理 website approvals。

  </BentoContent>
  <BentoContent href="/codex/app/features#image-generation">

### 图像生成

在处理周边 code 和 assets 时，在 thread 中生成或编辑图像。

  </BentoContent>
  <BentoContent href="/codex/app/automations">

### Automations

安排 recurring tasks，或唤醒同一个 thread 以进行 ongoing checks。

  </BentoContent>
  <BentoContent href="/codex/app/features#skills-support">

### Skills

在 app、CLI 和 IDE Extension 中复用 instructions 和 workflows。

  </BentoContent>
  <BentoContent href="/codex/app/features#richer-outputs-and-artifacts">

### Sidebar 和 artifacts

跟踪 plans、sources、task summaries 和 generated file previews。

  </BentoContent>
  <BentoContent href="/codex/plugins">

### Plugins

连接 apps、skills 和 MCP servers，以扩展 Codex 可以完成的事。

  </BentoContent>
  <BentoContent href="/codex/sites">

### Sites

使用 Sites plugin 构建并部署托管 websites、web apps 和 games。

  </BentoContent>
  <BentoContent href="/codex/app/features#sync-with-the-ide-extension">

### IDE Extension sync

在 app 和 IDE sessions 之间共享 Auto Context 和 active threads。

  </BentoContent>
</BentoContainer>

---

需要帮助？请访问[故障排除指南](https://developers.openai.com/codex/app/troubleshooting)。
