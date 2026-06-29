---
status: needs-review
sourceId: "e901f7883b20"
sourceChecksum: "e901f7883b203763bb35b72f53147149d2fc84497d4418a7e9bf694260c0c7ef"
sourceUrl: "https://developers.openai.com/codex/skills"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# Agent Skills 代理技能

使用 agent skills 为 Codex 扩展特定任务能力。一个 skill 会打包 instructions、resources 和可选 scripts，让 Codex 能可靠地遵循某个工作流。Skills 建立在 [open agent skills standard](https://agentskills.io) 之上。

Skills 是可复用工作流的 authoring format。Plugins 是 Codex 中可复用 skills 和 apps 的可安装分发单元。使用 skills 设计工作流本身；当你希望其他 developers 安装它时，再将其打包成 [plugin](https://developers.openai.com/codex/plugins/build)。

Skills 可在 Codex CLI、IDE extension 和 Codex app 中使用。

Skills 使用 **progressive disclosure** 高效管理上下文：Codex 一开始只看到每个 skill 的 name、description 和 file path。只有当 Codex 决定使用某个 skill 时，才会加载完整的 `SKILL.md` instructions。

Codex 会在上下文中包含一个初始可用 skills 列表，以便为任务选择正确的 skill。为了避免挤占 prompt 的其余部分，该列表最多使用模型 context window 的 2%，当 context window 未知时最多使用 8,000 个字符。如果安装了很多 skills，Codex 会先缩短 skill descriptions。对于大型 skill sets，Codex 可能会从初始列表中省略某些 skills 并显示警告。

此预算只适用于初始 skills 列表。当 Codex 选择一个 skill 时，它仍会读取该 skill 的完整 SKILL.md instructions。

一个 skill 是一个目录，包含 `SKILL.md` 文件以及可选 scripts 和 references。`SKILL.md` 文件必须包含 `name` 和 `description`。

<FileTree
  class="mt-4"
  tree={[
    {
      name: "my-skill/",
      open: true,
      children: [
        {
          name: "SKILL.md",
          comment: "Required: instructions + metadata",
        },
        {
          name: "scripts/",
          comment: "Optional: executable code",
        },
        {
          name: "references/",
          comment: "Optional: documentation",
        },
        {
          name: "assets/",
          comment: "Optional: templates, resources",
        },
        {
          name: "agents/",
          open: true,
          children: [
            {
              name: "openai.yaml",
              comment: "Optional: appearance and dependencies",
            },
          ],
        },
      ],
    },

]}
/>

## Codex 如何使用 skills

Codex 可以通过两种方式激活 skills：

1. **显式调用：** 在你的 prompt 中直接包含该 skill。在 CLI/IDE 中，运行 `/skills` 或输入 `$` 来提及一个 skill。
2. **隐式调用：** 当你的任务与 skill 的 `description` 匹配时，Codex 可以选择该 skill。

由于隐式匹配依赖 `description`，请编写简洁、范围和边界清晰的 descriptions。将关键使用场景和触发词放在前面，这样即使 descriptions 被缩短，Codex 仍能匹配到该 skill。

## 创建 skill

如果你已经知道工作流，并且演示比描述更容易，请使用 [Record & Replay](https://developers.openai.com/codex/record-and-replay)。Codex 会录制工作流、检查步骤，并从演示中起草一个可复用 skill。

如果你想用文字描述该 skill，请使用内置 creator：

```text
$skill-creator
```

creator 会询问该 skill 做什么、什么时候应触发，以及它应保持 instruction-only 还是包含 scripts。Instruction-only 是默认值。

你也可以手动创建 skill，方法是创建一个包含 `SKILL.md` 文件的文件夹：

```md
---
name: skill-name
description: Explain exactly when this skill should and should not trigger.
---

Skill instructions for Codex to follow.
```

Codex 会自动检测 skill changes。如果某个更新没有出现，请重启 Codex。

## skills 保存在哪里

Codex 会从 repository、user、admin 和 system 位置读取 skills。对于 repositories，Codex 会从当前工作目录到 repository root 的每个目录中扫描 `.agents/skills`。如果两个 skills 使用相同的 `name`，Codex 不会合并它们；两者都可以出现在 skill selectors 中。

| Skill Scope | Location                                                                                                  | Suggested use                                                                                                                                                                                        |
| :---------- | :-------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPO`      | `$CWD/.agents/skills` <br /> 当前工作目录：你启动 Codex 的位置。                           | 如果你位于 repository 或 code environment 中，团队可以提交与工作文件夹相关的 skills。例如，只与某个 microservice 或 module 相关的 skills。                              |
| `REPO`      | `$CWD/../.agents/skills` <br /> 当你在 Git repository 内启动 Codex 时，CWD 上方的文件夹。         | 如果你位于包含嵌套文件夹的 repository 中，组织可以在 parent folder 中提交与共享区域相关的 skills。                                                                       |
| `REPO`      | `$REPO_ROOT/.agents/skills` <br /> 当你在 Git repository 内启动 Codex 时，最顶层 root folder。 | 如果你位于包含嵌套文件夹的 repository 中，组织可以提交与所有 repository 用户相关的 skills。这些 root skills 可供 repository 中任何 subfolder 使用。 |
| `USER`      | `$HOME/.agents/skills` <br /> 提交到用户个人文件夹中的任何 skills。                         | 用来整理适用于该用户、可应用于任何 repository 的 skills。                                                                                                           |
| `ADMIN`     | `/etc/codex/skills` <br /> 提交到机器或 container 中共享 system 位置的任何 skills。 | 用于 SDK scripts、automation，以及提交每个机器用户都可用的默认 admin skills。                                                                                     |
| `SYSTEM`    | 由 OpenAI 与 Codex 捆绑。                                                                             | 面向广泛受众的有用 skills，例如 skill-creator 和 plan skills。所有人在启动 Codex 时都可用。                                                                   |

Codex 支持 symlinked skill folders，并在扫描这些位置时跟随 symlink target。

这些位置用于 authoring 和本地发现。当你想在单个 repo 之外分发可复用 skills，或可选地将它们与 app integrations 捆绑时，请使用 [plugins](https://developers.openai.com/codex/plugins/build)。

## 用 plugins 分发 skills

直接使用 skill folders 最适合本地 authoring 和 repo-scoped workflows。如果你想分发可复用 skill、将两个或更多 skills 捆绑在一起，或把 skill 与 app integration 一起发布，请将它们打包成 [plugin](https://developers.openai.com/codex/plugins/build)。

Plugins 可以包含一个或多个 skills。它们也可以选择性地在单个 package 中捆绑 app mappings、MCP server configuration 和 presentation assets。

## 为本地使用安装 curated skills

要为你自己的本地 Codex setup 添加内置项之外的 curated skills，请使用 `$skill-installer`。例如，要安装 `$linear` skill：

```bash
$skill-installer linear
```

你也可以提示 installer 从其他 repositories 下载 skills。Codex 会自动检测新安装的 skills；如果某个没有出现，请重启 Codex。

将其用于本地设置和实验。对于你自己的 skills 的可复用分发，请优先使用 plugins。

## 启用或禁用 skills

使用 `~/.codex/config.toml` 中的 `[[skills.config]]` entries，可以在不删除 skill 的情况下禁用它：

```toml
[[skills.config]]
path = "/path/to/skill/SKILL.md"
enabled = false
```

更改 `~/.codex/config.toml` 后请重启 Codex。

## 可选 metadata

添加 `agents/openai.yaml` 可以在 [Codex app](https://developers.openai.com/codex/app) 中配置 UI metadata、设置 invocation policy，并声明 tool dependencies，从而获得更流畅的 skill 使用体验。

```yaml
interface:
  display_name: "Optional user-facing name"
  short_description: "Optional user-facing description"
  icon_small: "./assets/small-logo.svg"
  icon_large: "./assets/large-logo.png"
  brand_color: "#3B82F6"
  default_prompt: "Optional surrounding prompt to use the skill with"

policy:
  allow_implicit_invocation: false

dependencies:
  tools:
    - type: "mcp"
      value: "openaiDeveloperDocs"
      description: "OpenAI Docs MCP server"
      transport: "streamable_http"
      url: "https://developers.openai.com/mcp"
```

`allow_implicit_invocation`（默认：`true`）：当为 `false` 时，Codex 不会基于用户 prompt 隐式调用该 skill；显式 `$skill` 调用仍然有效。

## 最佳实践

- 保持每个 skill 聚焦于一项工作。
- 除非你需要确定性行为或外部工具，否则优先使用 instructions 而不是 scripts。
- 用命令式步骤编写，并明确 inputs 和 outputs。
- 针对 skill description 测试 prompts，以确认触发行为正确。

更多示例请参见 [github.com/openai/skills](https://github.com/openai/skills) 和 [agent skills specification](https://agentskills.io/specification)。

