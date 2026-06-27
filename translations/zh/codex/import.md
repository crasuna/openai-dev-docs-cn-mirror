---
status: needs-review
sourceId: "d5dc5b8056aa"
sourceChecksum: "d5dc5b8056aa4759c656bda05ef8b3e02efc7006e886029990522d7a9dbf6d86"
sourceUrl: "https://developers.openai.com/codex/import"
translatedAt: "2026-06-27T19:05:47.1891485+08:00"
translator: codex-gpt-5.5-xhigh
---

# 导入到 Codex

使用导入流程，可以把来自其他 agents 的指令、设置、skills、plugins、项目和最近聊天会话带入 Codex。Codex 会直接导入受支持的项目，并让你完成任何需要授权的已导入 plugins 或连接的设置。

导入不会更改或删除你现有的 agent 设置。

<div class="not-prose my-6 max-w-5xl">
  <CodexScreenshot
    alt="选择要从哪些其他 AI 应用导入"
    lightSrc="/images/codex/import/import-source.png"
    darkSrc="/images/codex/import/import-source.png"
    maxHeight="680px"
    variant="no-wallpaper"
    imageClass="rounded-xl"
  />
</div>

## 开始导入

<WorkflowSteps>

1. 在 Codex app 中打开 **Settings**。
2. 在 **General** 下找到 **Import other agent setup**。
3. 选择 **Import**。
4. 选择要从哪些 agents 导入，然后选择 **Continue**。
5. 在 **Select items to import** 上，选择 **Continue** 以导入全部内容，或选择 **Customize** 来选择具体项目。
6. 如果自定义导入，请选择要带入的项目，然后选择 **Confirm**。
7. 导入完成后，打开已导入的项目或 thread 继续工作。

</WorkflowSteps>

<div class="not-prose my-6 max-w-5xl">
  <CodexScreenshot
    alt="选择要导入 Codex 的设置和近期工作"
    lightSrc="/images/codex/import/import-overview.png"
    darkSrc="/images/codex/import/import-overview.png"
    maxHeight="680px"
    variant="no-wallpaper"
    imageClass="rounded-xl"
  />
</div>

## 导入的工作方式

Codex 会同时检查你的用户级设置和现有项目。用户级设置来自你机器上的文件。项目级设置来自你选择的仓库和文件夹中的文件。

导入时，Codex 会：

1. 检测受支持的设置和近期工作。
2. 导入你选择的项目。
3. 保持你现有的 agent 设置不变。
4. 检查已导入的 plugins 或连接是否仍需要设置。
5. 在需要后续操作时显示状态卡片。

## Codex 可以导入哪些内容

| 导入项目                            | Codex 目标位置                                                        |
| ----------------------------------- | --------------------------------------------------------------------- |
| 指令文件                            | [`AGENTS.md`](https://developers.openai.com/codex/guides/agents-md)   |
| `settings.json`                     | [`config.toml`](https://developers.openai.com/codex/config-basic)     |
| Skills                              | [Codex skills](https://developers.openai.com/codex/skills)            |
| Plugins                             | Codex plugins                                                         |
| 现有项目文件夹                      | 使用相同文件夹的 Codex projects                                       |
| 最近 30 天的聊天会话                | Codex threads                                                         |
| MCP server 配置                     | [Codex MCP 配置](https://developers.openai.com/codex/mcp)             |
| Hooks                               | [Codex hooks](https://developers.openai.com/codex/hooks)              |
| 斜杠命令                            | [Codex skills](https://developers.openai.com/codex/skills)            |
| Subagents                           | [Codex agents](https://developers.openai.com/codex/subagents)         |

<div class="not-prose my-6 max-w-5xl">
  <CodexScreenshot
    alt="选择要导入的指令、设置、skills、plugins、项目和聊天"
    lightSrc="/images/codex/import/import-instructions.png"
    darkSrc="/images/codex/import/import-instructions.png"
    maxHeight="680px"
    variant="no-wallpaper"
    imageClass="rounded-xl"
  />
</div>

## 导入后完成设置

导入完成后，Codex 会在左下角显示一张状态卡片。如果某个已导入的 plugin 或连接仍需要设置，卡片会指出这一点。

当 Codex 标记出需要处理的项目时，选择 **Finish** 并按照提示完成设置。

## 导入后要审查的内容

在依赖已导入设置之前，请先审查它们，尤其是：

- 已导入 skills 和 agents 中的工具限制或权限。
- 使用自定义认证、headers、环境变量或 transports 的 MCP server 设置。你可能需要重新登录。
- 行为在 Codex 中可能有所不同的 hooks。
- 需要手动后续操作的 plugins、marketplaces 或其他设置。
- 依赖参数、shell 插值或文件路径占位符的提示模板或命令式提示。

## 导入之后

导入完成后，打开你的某个已导入项目并从那里继续。如果你刚开始使用 Codex，请参见 [quickstart](https://developers.openai.com/codex/quickstart) 了解后续设置流程。
