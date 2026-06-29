---
title: "快速开始"
description: "Start using Codex in your IDE, CLI, or the cloud"
outline: deep
---

# 快速开始

**文档集**：Codex 编码智能体<br>
**分组**：Codex — 快速开始<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/quickstart](https://developers.openai.com/codex/quickstart)
- Markdown 来源：[https://developers.openai.com/codex/quickstart.md](https://developers.openai.com/codex/quickstart.md)
- 抓取时间：2026-06-27T05:55:06.540Z
- Checksum：`459281f19389096b9a8f1ceac37ca7c84e9b610dc834bc86eaa1a7b09f1a91b4`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
每个 ChatGPT plan 都包含 Codex。

你也可以使用 OpenAI API key 登录，通过 API credits 使用 Codex。

## 设置

&lt;script
  is:inline
  data-astro-rerun
  set:html={String.raw`
(() =&gt; {
  const platform =
    (navigator.userAgentData?.platform || navigator.platform || "").toLowerCase();
  const isDesktopAppPlatform =
    platform.includes("mac") ||
    platform.includes("win") ||
    /macintosh|mac os x|windows|win64|win32/i.test(navigator.userAgent || "");
  if (!isDesktopAppPlatform) return;

  const shouldPreferApp = () =&gt; {
    try {
      const url = new URL(window.location.href);
      return !url.searchParams.get("setup");
    } catch {
      return true;
    }
  };

  if (!shouldPreferApp()) return;

  window.__tabsPreferred = window.__tabsPreferred || {};
  window.__tabsPreferred.setup = "app";
})();
`}
/&gt;

&lt;Tabs
  id="codex-quickstart-setup"
  param="setup"
  defaultTab="ide"
  size="3xl"
  block={true}
  blockThreshold={170}
  tabs={[
    {
      id: "app",
      label: "App",
      subtitle: "推荐",
    },
    { id: "ide", label: "IDE extension", subtitle: "在 IDE 中使用 Codex" },
    { id: "cli", label: "CLI", subtitle: "在终端中使用 Codex" },
    { id: "cloud", label: "Cloud", subtitle: "在浏览器中使用 Codex" },
  ]}
&gt;

Codex app 可在 macOS 和 Windows 上使用。

大多数 Codex app 功能在两个平台上都可用。平台特定的例外会在相关文档中说明。


1. 下载并安装 Codex app

    下载适用于 macOS 或 Windows 的 Codex app。如果你使用的是基于 Intel 的 Mac，请选择 Intel build。




      [获取 Linux 通知](https://openai.com/form/codex-app/)


2. 打开 Codex 并登录

   下载并安装 Codex app 后，打开它并使用你的 ChatGPT account 或 OpenAI API key 登录。

   如果你使用 OpenAI API key 登录，[某些功能可能不可用](/mirror/codex/pricing#feature-availability)。

3. 选择项目

   选择一个你希望 Codex 在其中工作的项目文件夹。

    如果你之前使用过 Codex app、CLI 或 IDE Extension，会看到你过去处理过的项目。

4. 发送第一条消息

   选择项目后，确保已选择 **Local**，让 Codex 在你的机器上工作，然后向 Codex 发送第一条消息。

   你可以向 Codex 询问关于该项目或你的电脑的一般问题。以下是一些示例：


     &lt;ExampleTask
       client:load
       id="intro"
       prompt="介绍一下这个项目"
       iconName="brain"
     /&gt;
     &lt;ExampleTask
       client:load
       id="snake-game"
       shortDescription="在这个 repo 中构建一个经典 Snake 游戏。"
       prompt={[
         "在这个 repo 中构建一个经典 Snake 游戏。",
         "",
         "范围和约束：",
         "- 只实现经典 Snake 循环：网格移动、蛇身增长、食物生成、分数、游戏结束、重新开始。",
         "- 复用现有项目工具和框架；除非确实需要，否则不要添加新依赖。",
         "- 保持 UI 最小化，并与 repo 现有样式一致（不要新设计系统，不要额外动画）。",
         "",
         "实施计划：",
         "1) 检查 repo，找到添加小型交互游戏的合适位置（现有页面、routes 或 components）。",
         "2) 使用确定性、可测试的逻辑实现游戏状态（蛇的位置、方向、食物、分数、tick timer）。",
         "3) 渲染：简单网格 + 蛇 + 食物；支持键盘控制（方向键/WASD），如果 repo 中存在移动端，则支持屏幕控制。",
         "4) 如果 repo 有 test runner，为核心游戏逻辑添加基本测试（移动、碰撞、增长、食物放置）。",
         "",
         "交付物：",
         "- 一小组命名清晰的文件/变更。",
         "- 简短运行说明（如何启动 dev server + 访问哪里）。",
         "- 一份需要手动验证的简短清单（控制、暂停/重启、边界）。",
       ].join("\n")}
       iconName="gamepad"
     /&gt;
     &lt;ExampleTask
       client:load
       id="fix-bugs"
       shortDescription="用最小且高置信度的变更查找并修复我的 codebase 中的 bug。"
       prompt={[
         "用最小且高置信度的变更查找并修复我的 codebase 中的 bug。",
         "",
         "方法（基于证据且保持纪律）：",
         "1) 复现：运行 tests/lint/build（或遵循现有 repo scripts）。如果我提供了错误，请复现那个确切失败。",
         "2) 定位：识别涉及的最小文件/行集合（stack traces、failing tests、logs）。",
         "3) 修复：实现解决问题的最小变更，不做重构或无关清理。",
         "4) 证明：添加/更新一个聚焦的 test（或紧凑 repro），让它修复前失败、修复后通过。",
         "",
         "约束：",
         "- 不要编造错误，也不要假装运行了你无法运行的命令。",
         "- 不要偏离范围：不要新功能，不要 UI 装饰，不要样式大改。",
         "- 如果信息缺失，请说明你能从 repo 确认什么，以及仍然未知什么。",
         "",
         "输出：",
         "- 摘要（最多 3-6 句）：什么坏了、原因是什么、如何修复。",
         "- 然后用不超过 5 个要点说明：变更内容、位置（paths）、证据（tests/logs）、风险、下一步。",
       ].join("\n")}
       iconName="search"
     /&gt;


   如果你需要更多灵感，请浏览 [Codex use cases](https://developers.openai.com/codex/use-cases)。
   如果你刚开始使用 Codex，请阅读 [best practices guide](/mirror/codex/learn/best-practices)。







为你的 IDE 安装 Codex extension。


1. 安装 Codex extension

    为你的 editor 下载：

    - [Download for Visual Studio Code](vscode:extension/openai.chatgpt)
    - [Download for Cursor](cursor:extension/openai.chatgpt)
    - [Download for Windsurf](windsurf:extension/openai.chatgpt)
    - [Download for Visual Studio Code Insiders](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt)

2. 打开 Codex panel

    安装后，Codex extension 会与其他 extensions 一起出现在 sidebar 中。它可能隐藏在折叠区域里。如果你愿意，也可以把 Codex panel 移到 editor 的右侧。

3. 登录并开始第一个任务

    使用你的 ChatGPT account 或 API key 登录即可开始。

    Codex 默认以 Agent mode 启动，这让它可以读取文件、运行命令，并在你的项目目录中写入变更。
    

     &lt;ExampleTask
       client:load
       id="intro"
       prompt="介绍一下这个项目"
       iconName="brain"
     /&gt;
     &lt;ExampleTask
       client:load
       id="snake-game"
       shortDescription="在这个 repo 中构建一个经典 Snake 游戏。"
       prompt={[
         "在这个 repo 中构建一个经典 Snake 游戏。",
         "",
         "范围和约束：",
         "- 只实现经典 Snake 循环：网格移动、蛇身增长、食物生成、分数、游戏结束、重新开始。",
         "- 复用现有项目工具和框架；除非确实需要，否则不要添加新依赖。",
         "- 保持 UI 最小化，并与 repo 现有样式一致（不要新设计系统，不要额外动画）。",
         "",
         "实施计划：",
         "1) 检查 repo，找到添加小型交互游戏的合适位置（现有页面、routes 或 components）。",
         "2) 使用确定性、可测试的逻辑实现游戏状态（蛇的位置、方向、食物、分数、tick timer）。",
         "3) 渲染：简单网格 + 蛇 + 食物；支持键盘控制（方向键/WASD），如果 repo 中存在移动端，则支持屏幕控制。",
         "4) 如果 repo 有 test runner，为核心游戏逻辑添加基本测试（移动、碰撞、增长、食物放置）。",
         "",
         "交付物：",
         "- 一小组命名清晰的文件/变更。",
         "- 简短运行说明（如何启动 dev server + 访问哪里）。",
         "- 一份需要手动验证的简短清单（控制、暂停/重启、边界）。",
       ].join("\n")}
       iconName="gamepad"
     /&gt;
     &lt;ExampleTask
       client:load
       id="fix-bugs"
       shortDescription="用最小且高置信度的变更查找并修复我的 codebase 中的 bug。"
       prompt={[
         "用最小且高置信度的变更查找并修复我的 codebase 中的 bug。",
         "",
         "方法（基于证据且保持纪律）：",
         "1) 复现：运行 tests/lint/build（或遵循现有 repo scripts）。如果我提供了错误，请复现那个确切失败。",
         "2) 定位：识别涉及的最小文件/行集合（stack traces、failing tests、logs）。",
         "3) 修复：实现解决问题的最小变更，不做重构或无关清理。",
         "4) 证明：添加/更新一个聚焦的 test（或紧凑 repro），让它修复前失败、修复后通过。",
         "",
         "约束：",
         "- 不要编造错误，也不要假装运行了你无法运行的命令。",
         "- 不要偏离范围：不要新功能，不要 UI 装饰，不要样式大改。",
         "- 如果信息缺失，请说明你能从 repo 确认什么，以及仍然未知什么。",
         "",
         "输出：",
         "- 摘要（最多 3-6 句）：什么坏了、原因是什么、如何修复。",
         "- 然后用不超过 5 个要点说明：变更内容、位置（paths）、证据（tests/logs）、风险、下一步。",
       ].join("\n")}
       iconName="search"
     /&gt;


4. 使用 Git checkpoints

    Codex 可以修改你的 codebase，因此建议在每个任务前后创建 Git checkpoints，这样需要时可以轻松 revert 变更。
    如果你刚开始使用 Codex，请阅读 [best practices guide](/mirror/codex/learn/best-practices)。
    







Codex CLI 支持 macOS、Windows 和 Linux。


1. 安装 Codex CLI

    在 macOS 或 Linux 上，使用 standalone installer：

```bash
    curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

    在 Windows 上，运行：

```powershell
    powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"
```

    对于 unattended installs，请在运行下载 installer 的 shell 上设置 `CODEX_NON_INTERACTIVE=1`。详情参见 [Environment variables](/mirror/codex/environment-variables#installer-variables)。

```bash
    curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh
```

```powershell
    $env:CODEX_NON_INTERACTIVE=1; irm https://chatgpt.com/codex/install.ps1 | iex
```

    你也可以用 npm 或 Homebrew 安装 Codex CLI：

```bash
    npm install -g @openai/codex
```

```bash
    brew install --cask codex
```

2. 运行 `codex` 并登录

    在终端中运行 `codex` 开始使用。系统会提示你使用 ChatGPT account 或 API key 登录。

3. 让 Codex 在当前目录中工作

    认证后，你可以要求 Codex 在当前目录中执行任务。


     &lt;ExampleTask
       client:load
       id="intro"
       prompt="介绍一下这个项目"
       iconName="brain"
     /&gt;
     &lt;ExampleTask
       client:load
       id="snake-game"
       shortDescription="在这个 repo 中构建一个经典 Snake 游戏。"
       prompt={[
         "在这个 repo 中构建一个经典 Snake 游戏。",
         "",
         "范围和约束：",
         "- 只实现经典 Snake 循环：网格移动、蛇身增长、食物生成、分数、游戏结束、重新开始。",
         "- 复用现有项目工具和框架；除非确实需要，否则不要添加新依赖。",
         "- 保持 UI 最小化，并与 repo 现有样式一致（不要新设计系统，不要额外动画）。",
         "",
         "实施计划：",
         "1) 检查 repo，找到添加小型交互游戏的合适位置（现有页面、routes 或 components）。",
         "2) 使用确定性、可测试的逻辑实现游戏状态（蛇的位置、方向、食物、分数、tick timer）。",
         "3) 渲染：简单网格 + 蛇 + 食物；支持键盘控制（方向键/WASD），如果 repo 中存在移动端，则支持屏幕控制。",
         "4) 如果 repo 有 test runner，为核心游戏逻辑添加基本测试（移动、碰撞、增长、食物放置）。",
         "",
         "交付物：",
         "- 一小组命名清晰的文件/变更。",
         "- 简短运行说明（如何启动 dev server + 访问哪里）。",
         "- 一份需要手动验证的简短清单（控制、暂停/重启、边界）。",
       ].join("\n")}
       iconName="gamepad"
     /&gt;
     &lt;ExampleTask
       client:load
       id="fix-bugs"
       shortDescription="用最小且高置信度的变更查找并修复我的 codebase 中的 bug。"
       prompt={[
         "用最小且高置信度的变更查找并修复我的 codebase 中的 bug。",
         "",
         "方法（基于证据且保持纪律）：",
         "1) 复现：运行 tests/lint/build（或遵循现有 repo scripts）。如果我提供了错误，请复现那个确切失败。",
         "2) 定位：识别涉及的最小文件/行集合（stack traces、failing tests、logs）。",
         "3) 修复：实现解决问题的最小变更，不做重构或无关清理。",
         "4) 证明：添加/更新一个聚焦的 test（或紧凑 repro），让它修复前失败、修复后通过。",
         "",
         "约束：",
         "- 不要编造错误，也不要假装运行了你无法运行的命令。",
         "- 不要偏离范围：不要新功能，不要 UI 装饰，不要样式大改。",
         "- 如果信息缺失，请说明你能从 repo 确认什么，以及仍然未知什么。",
         "",
         "输出：",
         "- 摘要（最多 3-6 句）：什么坏了、原因是什么、如何修复。",
         "- 然后用不超过 5 个要点说明：变更内容、位置（paths）、证据（tests/logs）、风险、下一步。",
       ].join("\n")}
       iconName="search"
     /&gt;


4. 使用 Git checkpoints

    Codex 可以修改你的 codebase，因此建议在每个任务前后创建 Git checkpoints，这样需要时可以轻松 revert 变更。
    如果你刚开始使用 Codex，请阅读 [best practices guide](/mirror/codex/learn/best-practices)。







在 [chatgpt.com/codex](https://chatgpt.com/codex) 的 cloud 中使用 Codex。


1. 在浏览器中打开 Codex

    前往 [chatgpt.com/codex](https://chatgpt.com/codex)。你也可以通过在 GitHub pull request comment 中标记 `@codex` 来把任务委派给 Codex（需要登录 ChatGPT）。

2. 设置 environment

    开始第一个任务前，请为 Codex 设置一个 environment。在 [chatgpt.com/codex](https://chatgpt.com/codex/settings/environments) 打开 environment settings，并按照步骤连接 GitHub repository。

3. 启动任务并监控进度

    environment 准备好后，从 [Codex interface](https://chatgpt.com/codex) 启动编码任务。你可以通过查看 logs 实时监控进度，也可以让任务在后台运行。


     &lt;ExampleTask
       client:load
       id="intro"
       prompt="介绍一下这个项目"
       iconName="brain"
     /&gt;
     &lt;ExampleTask
       client:load
       id="architecture-failure-modes"
       shortDescription="解释我的应用架构的主要 failure modes。"
       prompt={[
         "解释我的应用架构的主要 failure modes。",
         "",
         "方法：",
         "- 从 repo 证据推导架构（services、DBs、queues、network calls、critical paths）。",
         "- 识别现实的 failure modes（availability、data loss、latency、scaling、consistency、security、dependency outages）。",
         "",
         "输出：",
         "- 1 个简短 overview 段落。",
         "- 然后不超过 5 个要点：Failure mode、Trigger、Symptoms、Detection、Mitigation。",
         "- 如果缺少关键架构细节，请说明哪些是推断、哪些是已确认。",
       ].join("\n")}
       iconName="brain"
     /&gt;
     &lt;ExampleTask
       client:load
       id="fix-bugs"
       shortDescription="用最小且高置信度的变更查找并修复我的 codebase 中的 bug。"
       prompt={[
         "用最小且高置信度的变更查找并修复我的 codebase 中的 bug。",
         "",
         "方法（基于证据且保持纪律）：",
         "1) 复现：运行 tests/lint/build（或遵循现有 repo scripts）。如果我提供了错误，请复现那个确切失败。",
         "2) 定位：识别涉及的最小文件/行集合（stack traces、failing tests、logs）。",
         "3) 修复：实现解决问题的最小变更，不做重构或无关清理。",
         "4) 证明：添加/更新一个聚焦的 test（或紧凑 repro），让它修复前失败、修复后通过。",
         "",
         "约束：",
         "- 不要编造错误，也不要假装运行了你无法运行的命令。",
         "- 不要偏离范围：不要新功能，不要 UI 装饰，不要样式大改。",
         "- 如果信息缺失，请说明你能从 repo 确认什么，以及仍然未知什么。",
         "",
         "输出：",
         "- 摘要（最多 3-6 句）：什么坏了、原因是什么、如何修复。",
         "- 然后用不超过 5 个要点说明：变更内容、位置（paths）、证据（tests/logs）、风险、下一步。",
       ].join("\n")}
       iconName="search"
     /&gt;


4. 审查变更并创建 pull request

    任务完成后，在 diff view 中审查建议变更。你可以继续迭代结果，或直接在你的 GitHub repository 中创建 pull request。

    Codex 也会提供变更预览。你可以按原样接受 PR，或在本地 checkout branch 来测试变更：

```bash
    git fetch
    git checkout <branch-name>
```









## 下一步

[&lt;IconItem title="进一步了解 Codex app" className="mt-2"&gt; &lt;span slot="icon"&gt;


    使用 Codex app 处理你的本地项目。
  &lt;/IconItem&gt;](https://developers.openai.com/codex/app)

[&lt;IconItem title="迁移到 Codex" className="mt-2"&gt; &lt;span slot="icon"&gt;


    将受支持的 instruction files、MCP server configuration、skills 和
    subagents 迁移到 Codex。
  &lt;/IconItem&gt;](https://developers.openai.com/codex/migrate)

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Every ChatGPT plan includes Codex.

You can also use Codex with API credits by signing in with an OpenAI API key.

## Setup

<script
  is:inline
  data-astro-rerun
  set:html={String.raw`
(() => {
  const platform =
    (navigator.userAgentData?.platform || navigator.platform || "").toLowerCase();
  const isDesktopAppPlatform =
    platform.includes("mac") ||
    platform.includes("win") ||
    /macintosh|mac os x|windows|win64|win32/i.test(navigator.userAgent || "");
  if (!isDesktopAppPlatform) return;

  const shouldPreferApp = () => {
    try {
      const url = new URL(window.location.href);
      return !url.searchParams.get("setup");
    } catch {
      return true;
    }
  };

  if (!shouldPreferApp()) return;

  window.__tabsPreferred = window.__tabsPreferred || {};
  window.__tabsPreferred.setup = "app";
})();
`}
/>

<Tabs
  id="codex-quickstart-setup"
  param="setup"
  defaultTab="ide"
  size="3xl"
  block={true}
  blockThreshold={170}
  tabs={[
    {
      id: "app",
      label: "App",
      subtitle: "Recommended",
    },
    { id: "ide", label: "IDE extension", subtitle: "Codex in your IDE" },
    { id: "cli", label: "CLI", subtitle: "Codex in your terminal" },
    { id: "cloud", label: "Cloud", subtitle: "Codex in your browser" },
  ]}
>
  <div slot="app">
The Codex app is available on macOS and Windows.

Most Codex app features are available on both platforms. Platform-specific
exceptions are noted in the relevant docs.

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


  </div>

  <div slot="ide">
Install the Codex extension for your IDE.

<WorkflowSteps variant="headings">
1. Install the Codex extension

    Download it for your editor:

    - [Download for Visual Studio Code](vscode:extension/openai.chatgpt)
    - [Download for Cursor](cursor:extension/openai.chatgpt)
    - [Download for Windsurf](windsurf:extension/openai.chatgpt)
    - [Download for Visual Studio Code Insiders](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt)

2. Open the Codex panel

    Once installed, the Codex extension appears in the sidebar alongside your other extensions. It may be hidden in the collapsed section. You can move the Codex panel to the right side of the editor if you prefer.

3. Sign in and start your first task

    Sign in with your ChatGPT account or an API key to get started.

    Codex starts in Agent mode by default, which lets it read files, run commands, and write changes in your project directory.
    
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

4. Use Git checkpoints

    Codex can modify your codebase, so consider creating Git checkpoints before and after each task so you can easily revert changes if needed.
    If you're new to Codex, read the [best practices guide](https://developers.openai.com/codex/learn/best-practices).
    
    <CtaPillLink href="/codex/ide" label="Learn more about the Codex IDE extension" class="mt-8" />
</WorkflowSteps>


  </div>

  <div slot="cli">
The Codex CLI is supported on macOS, Windows, and Linux.

<WorkflowSteps variant="headings">
1. Install the Codex CLI

    On macOS or Linux, use the standalone installer:

    ```bash
    curl -fsSL https://chatgpt.com/codex/install.sh | sh
    ```

    On Windows, run:

    ```powershell
    powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"
    ```

    For unattended installs, set `CODEX_NON_INTERACTIVE=1` on the shell that
    runs the downloaded installer. See
    [Environment variables](https://developers.openai.com/codex/environment-variables#installer-variables)
    for details.

    ```bash
    curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh
    ```

    ```powershell
    $env:CODEX_NON_INTERACTIVE=1; irm https://chatgpt.com/codex/install.ps1 | iex
    ```

    You can also install Codex CLI with npm or Homebrew:

    ```bash
    npm install -g @openai/codex
    ```

    ```bash
    brew install --cask codex
    ```

2. Run `codex` and sign in

    Run `codex` in your terminal to get started. You'll be prompted to sign in with your ChatGPT account or an API key.

3. Ask Codex to work in your current directory

    Once authenticated, you can ask Codex to perform tasks in the current directory.

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

4. Use Git checkpoints

    Codex can modify your codebase, so consider creating Git checkpoints before and after each task so you can easily revert changes if needed.
    If you're new to Codex, read the [best practices guide](https://developers.openai.com/codex/learn/best-practices).
</WorkflowSteps>

    <CtaPillLink href="/codex/cli" label="Learn more about the Codex CLI" class="mt-8" />

  </div>

  <div slot="cloud">
Use Codex in the cloud at [chatgpt.com/codex](https://chatgpt.com/codex).

<WorkflowSteps variant="headings">
1. Open Codex in your browser

    Go to [chatgpt.com/codex](https://chatgpt.com/codex). You can also delegate a task to Codex by tagging `@codex` in a GitHub pull request comment (requires signing in to ChatGPT).

2. Set up an environment

    Before starting your first task, set up an environment for Codex. Open the environment settings at [chatgpt.com/codex](https://chatgpt.com/codex/settings/environments) and follow the steps to connect a GitHub repository.

3. Launch a task and monitor progress

    Once your environment is ready, launch coding tasks from the [Codex interface](https://chatgpt.com/codex). You can monitor progress in real time by viewing logs, or let tasks run in the background.

    <ExampleGallery>
     <ExampleTask
       client:load
       id="intro"
       prompt="Tell me about this project"
       iconName="brain"
     />
     <ExampleTask
       client:load
       id="architecture-failure-modes"
       shortDescription="Explain the top failure modes of my application's architecture."
       prompt={[
         "Explain the top failure modes of my application's architecture.",
         "",
         "Approach:",
         "- Derive the architecture from repo evidence (services, DBs, queues, network calls, critical paths).",
         "- Identify realistic failure modes (availability, data loss, latency, scaling, consistency, security, dependency outages).",
         "",
         "Output:",
         "- 1 short overview paragraph.",
         "- Then ≤5 bullets: Failure mode, Trigger, Symptoms, Detection, Mitigation.",
         "- If key architecture details are missing, state what you inferred vs. what you confirmed.",
       ].join("\n")}
       iconName="brain"
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

4. Review changes and create a pull request

    When a task completes, review the proposed changes in the diff view. You can iterate on the results or create a pull request directly in your GitHub repository.

    Codex also provides a preview of the changes. You can accept the PR as is, or check out the branch locally to test the changes:

    ```bash
    git fetch
    git checkout <branch-name>
    ```

    <CtaPillLink href="/codex/cloud" label="Learn more about Codex cloud" class="mt-8" />
</WorkflowSteps>

  </div>
</Tabs>

<div class="h-6" aria-hidden="true"></div>

## Next steps

[<IconItem title="Learn more about the Codex app" className="mt-2">
    <span slot="icon">
      <OpenBook />
    </span>
    Use the Codex app to work with your local projects.
  </IconItem>](https://developers.openai.com/codex/app)

[<IconItem title="Migrate to Codex" className="mt-2">
    <span slot="icon">
      <CompareArrows />
    </span>
    Move supported instruction files, MCP server configuration, skills, and
    subagents into Codex.
  </IconItem>](https://developers.openai.com/codex/migrate)
``````
:::
:::

