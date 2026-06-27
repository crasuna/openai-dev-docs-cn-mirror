---
status: needs-review
sourceId: "4984669cb118"
sourceChecksum: "4984669cb1185c2405d485dc029ab0e9aafd6c18059e3ee64a4ba4db0b06a2c6"
sourceUrl: "https://developers.openai.com/codex/concepts/customization"
translatedAt: "2026-06-27T11:05:32.948Z"
translator: codex-gpt-5.5-xhigh
---

# 自定义

Customization 是让 Codex 按照你的团队工作方式运作的方法。

在 Codex 中，customization 来自几个协同工作的层：

- **项目指导（`AGENTS.md`）**，用于持久指令
- **[Memories](https://developers.openai.com/codex/memories)**，用于保存从先前工作中学到的有用 context
- **Skills**，用于可复用 workflows 和领域专业知识
- **[MCP](https://developers.openai.com/codex/mcp)**，用于访问外部工具和共享系统
- **[Subagents](https://developers.openai.com/codex/concepts/subagents)**，用于把工作委派给专门的 subagents

这些能力相互补充，而不是相互竞争。`AGENTS.md` 塑造行为，memories 让本地 context 延续下去，skills 打包可重复流程，而 [MCP](https://developers.openai.com/codex/mcp) 将 Codex 连接到本地 workspace 之外的系统。

## AGENTS 指导

`AGENTS.md` 为 Codex 提供持久的项目指导，它随 repository 一起存在，并在 agent 开始工作前生效。保持它简短。

把它用于你希望 Codex 在 repo 中每次都遵循的规则，例如：

- Build 和 test 命令
- Review 期望
- repo-specific conventions
- 目录特定指令

当 agent 对你的 codebase 做出错误假设时，在 `AGENTS.md` 中更正它们，并要求 agent 更新 `AGENTS.md`，让修复持久化。把它视为一个反馈循环。

**更新 `AGENTS.md`：** 一开始只写真正重要的指令。把反复出现的 review feedback 固化下来，把指导放在最接近其适用范围的目录中，并在你纠正某件事时告诉 agent 更新 `AGENTS.md`，这样未来 sessions 会继承该修复。

### 何时更新 `AGENTS.md`

- **Repeated mistakes**：如果 agent 反复犯同一个错误，添加一条规则。
- **Too much reading**：如果它找到了正确文件但读了太多文档，添加 routing guidance（优先读哪些目录/文件）。
- **Recurring PR feedback**：如果你不止一次留下相同 feedback，把它固化。
- **In GitHub**：在 pull request comment 中，用请求标记 `@codex`（例如 `@codex add this to AGENTS.md`）来把更新委派给 cloud task。
- **Automate drift checks**：使用 [automations](https://developers.openai.com/codex/app/automations) 运行 recurring checks（例如每天），查找指导缺口并建议向 `AGENTS.md` 添加什么。

将 `AGENTS.md` 与强制执行这些规则的基础设施配对：pre-commit hooks、linters 和 type checkers 会在你看到问题之前捕获它们，让系统更擅长预防反复出现的错误。

Codex 可以从多个位置加载指导：Codex home 目录中的全局文件（面向你这个开发者），以及团队可 check in 的 repo-specific 文件。越接近工作目录的文件优先级越高。
使用全局文件来塑造 Codex 与你的沟通方式（例如 review style、verbosity 和 defaults），并让 repo 文件专注于团队和 codebase 规则。

<FileTree
  class="mt-4"
  tree={[
    {
      name: "~/.codex/",
      open: true,
      children: [
        { name: "AGENTS.md", comment: "全局（面向你这个开发者）" },
      ],
    },
    {
      name: "repo-root/",
      open: true,
      children: [
        { name: "AGENTS.md", comment: "repo-specific（面向你的团队）" },
      ],
    },
  ]}
/>

[使用 AGENTS.md 自定义指令](https://developers.openai.com/codex/guides/agents-md)

## Skills

Skills 为 Codex 提供可复用能力，用于可重复 workflows。
对于可复用 workflows，skills 通常是最合适的选择，因为它们支持更丰富的指令、scripts 和 references，同时仍能跨 tasks 复用。
Skills 会被加载并对 agent 可见（至少其 metadata 可见），因此 Codex 可以隐式发现并选择它们。这让丰富 workflows 可以保持可用，而不会一开始就撑大 context。

使用 skill folders 在本地编写和迭代 workflows。如果某个 workflow 已经有 plugin，请先安装它以复用经过验证的设置。当你想跨团队分发自己的 workflow，或把它与 app integrations 打包在一起时，请把它打包为 [plugin](https://developers.openai.com/codex/plugins/build)。Skills 仍然是 authoring format；plugins 是可安装的分发单元。

一个 skill 通常是一个 `SKILL.md` 文件，加上可选 scripts、references 和 assets。

<FileTree
  class="mt-4"
  tree={[
    {
      name: "my-skill/",
      open: true,
      children: [
        { name: "SKILL.md", comment: "必需：instructions + metadata" },
        { name: "scripts/", comment: "可选：executable code" },
        { name: "references/", comment: "可选：documentation" },
        { name: "assets/", comment: "可选：templates, resources" },
      ],
    },
  ]}
/>

skill 目录可以包含一个 `scripts/` 文件夹，里面放 Codex 在 workflow 中调用的 CLI scripts（例如 seed data 或 run validations）。当 workflow 需要外部系统（issue trackers、design tools、docs servers）时，将 skill 与 [MCP](https://developers.openai.com/codex/mcp) 配对。

示例 `SKILL.md`：

```md
---
name: commit
description: Stage and commit changes in semantic groups. Use when the user wants to commit, organize commits, or clean up a branch before pushing.
---

1. Do not run `git add .`. Stage files in logical groups by purpose.
2. Group into separate commits: feat → test → docs → refactor → chore.
3. Write concise commit messages that match the change scope.
4. Keep each commit focused and reviewable.
```

Skills 可用于：

- 可重复 workflows（release steps、review routines、docs updates）
- Team-specific expertise
- 需要 examples、references 或 helper scripts 的 procedures

Skills 可以是全局的（位于你的用户目录，面向你这个开发者），也可以是 repo-specific 的（checked into `.agents/skills`，面向你的团队）。当 workflow 适用于该项目时，把 repo skills 放在 `.agents/skills`；把你希望跨所有 repos 使用的 skills 放在用户目录中。

| Layer  | Global                 | Repo                                           |
| :----- | :--------------------- | :--------------------------------------------- |
| AGENTS | `~/.codex/AGENTS.md`   | repo root 或嵌套目录中的 `AGENTS.md` |
| Skills | `$HOME/.agents/skills` | repo 中的 `.agents/skills`                       |

Codex 对 skills 使用 progressive disclosure：

- 从 metadata（`name`、`description`）开始用于 discovery
- 只有选中某个 skill 时才加载 `SKILL.md`
- 只有需要时才读取 references 或运行 scripts

Skills 可以显式调用；当 task 匹配 skill description 时，Codex 也可以隐式选择它们。清晰的 skill descriptions 能提高触发可靠性。

[Agent Skills](https://developers.openai.com/codex/skills)

## MCP

MCP（Model Context Protocol）是把 Codex 连接到外部工具和 context providers 的标准方式。
它对远程托管系统尤其有用，例如 Figma、Linear、GitHub，或你的团队依赖的内部知识服务。

当 Codex 需要本地 repo 外的能力时使用 MCP，例如 issue trackers、design tools、browsers 或共享文档系统。

一种理解方式是：

- **Host**：Codex
- **Client**：Codex 内部的 MCP connection
- **Server**：外部工具或 context provider

MCP servers 可以暴露：

- **Tools**（actions）
- **Resources**（readable data）
- **Prompts**（reusable prompt templates）

这种分离有助于你推理 trust 和 capability boundaries。有些 servers 主要提供 context，而另一些会暴露强大的 actions。

实践中，MCP 通常在与 skills 配对时最有用：

- skill 定义 workflow，并指定要使用的 MCP tools

[Model Context Protocol](https://developers.openai.com/codex/mcp)

## Subagents

你可以创建具有不同角色的 agents，并提示它们以不同方式使用工具。例如，一个 agent 可能运行特定 testing commands 和 configurations，而另一个 agent 拥有可以获取 production logs 进行 debugging 的 MCP servers。每个 subagent 都保持专注，并使用适合自己工作的工具。

[Subagent concepts](https://developers.openai.com/codex/concepts/subagents)

## Skills + MCP together

Skills 加 MCP 是所有内容汇合之处：skills 定义可重复 workflows，MCP 将它们连接到外部工具和系统。
如果某个 skill 依赖 MCP，请在 `agents/openai.yaml` 中声明该依赖，让 Codex 可以自动安装并连接它（参见 [Agent Skills](https://developers.openai.com/codex/skills)）。

## 下一步

按以下顺序构建：

1. [使用 AGENTS.md 自定义指令](https://developers.openai.com/codex/guides/agents-md)，让 Codex 遵循你的 repo conventions。添加 pre-commit hooks 和 linters 来强制执行这些规则。
2. 当已有可复用 workflow 时，安装 [plugin](https://developers.openai.com/codex/plugins)。否则，创建 [skill](https://developers.openai.com/codex/skills)，并在想要共享时把它打包为 plugin。
3. 当 workflows 需要外部系统（Linear、GitHub、docs servers、design tools）时使用 [MCP](https://developers.openai.com/codex/mcp)。
4. 当你准备把嘈杂或专门的 tasks 委派给 subagents 时，使用 [Subagents](https://developers.openai.com/codex/subagents)。
