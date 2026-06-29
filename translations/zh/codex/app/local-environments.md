---
status: needs-review
sourceId: "7524e5e92695"
sourceChecksum: "7524e5e9269577decfcc52303fb0a68bbcae4257cf272efe35fb05e44aa68a3d"
sourceUrl: "https://developers.openai.com/codex/app/local-environments"
translatedAt: "2026-06-27T11:05:57.267Z"
translator: codex-gpt-5.5-xhigh
---

# Local environments 本地环境

Local environments 让你可以为 worktrees 配置 setup steps，并为 project 配置 common actions。

你通过 [Codex app settings](codex://settings) pane 配置 local environments。你可以将生成的文件提交到 project 的 Git repository，与他人共享。

Codex 会将此配置存储在 project root 的 `.codex` folder 中。如果你的 repository 包含多个 project，请打开包含共享 `.codex` folder 的 project directory。

## Setup scripts

由于 worktrees 与本地 tasks 运行在不同目录中，你的 project 可能尚未完全设置，可能缺少 dependencies 或没有提交到 repository 的 files。Codex 在新 thread 开始时创建新 worktree，setup scripts 会自动运行。

使用此 script 运行配置 environment 所需的任何 command，例如安装 dependencies 或运行 build process。

例如，对于 TypeScript project，你可能希望使用 setup script 安装 dependencies 并执行初始 build：

```bash
npm install
npm run build
```

如果你的 setup 是 platform-specific 的，请为 macOS、Windows 或 Linux 定义 setup scripts，以覆盖默认值。

## Actions

<section class="feature-grid">

<div>
使用 actions 定义常见 tasks，例如启动 app 的 development server 或运行 test suite。这些 actions 会显示在 Codex app top bar 中，便于快速访问。actions 会在 app 的 [integrated terminal](https://developers.openai.com/codex/app/features#integrated-terminal) 中运行。

Actions 可帮助你避免重复输入常见 actions，例如触发 project build 或启动 development server。对于一次性的快速 debugging，可以直接使用 integrated terminal。

</div>

<CodexScreenshot
  alt="Codex app settings 中显示的 project actions list"
  lightSrc="/images/codex/app/actions-light.webp"
  darkSrc="/images/codex/app/actions-dark.webp"
  maxHeight="400px"
  class="mb-4 lg:mb-0"
/>

</section>

例如，对于 Node.js project，你可能会创建一个包含以下 script 的 "Run" action：

```bash
npm start
```

如果你的 action commands 是 platform-specific 的，请为 macOS、Windows 和 Linux 定义 platform-specific scripts。

要标识你的 actions，请为每个 action 选择关联 icon。
