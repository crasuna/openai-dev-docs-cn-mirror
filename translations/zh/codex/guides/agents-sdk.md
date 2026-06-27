---
status: needs-review
sourceId: "55631b340b66"
sourceChecksum: "55631b340b6623e915cc0c0d7c2d57860238f6ae7f6100970b548bec2debca63"
sourceUrl: "https://developers.openai.com/codex/guides/agents-sdk"
translatedAt: "2026-06-27T19:05:47.1891485+08:00"
translator: codex-gpt-5.5-xhigh
---

# 将 Codex 与 Agents SDK 结合使用

# 将 Codex 作为 MCP server 运行

你可以将 Codex 作为 MCP server 运行，并从其他 MCP clients 连接它（例如，使用 [OpenAI Agents SDK MCP integration](https://developers.openai.com/api/docs/guides/agents/integrations-observability#mcp) 构建的 agent）。

若要将 Codex 启动为 MCP server，可以使用以下命令：

```bash
codex mcp-server
```

你可以使用 [Model Context Protocol Inspector](https://modelcontextprotocol.io/legacy/tools/inspector) 启动 Codex MCP server：

```bash
npx @modelcontextprotocol/inspector codex mcp-server
```

发送 `tools/list` 请求可以看到两个 tools：

**`codex`**：运行 Codex session。接受与 Codex `Config` struct 匹配的配置参数。`codex` tool 接受这些属性：

| 属性                    | 类型      | 说明                                                                                                            |
| ----------------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| **`prompt`**（必需）    | `string`  | 用于启动 Codex 对话的初始 user prompt。                                                                         |
| `approval-policy`       | `string`  | 模型生成 shell commands 时使用的 approval policy：`untrusted`、`on-request` 和 `never`。                        |
| `base-instructions`     | `string`  | 用来替代默认指令的一组指令。                                                                                    |
| `config`                | `object`  | 覆盖 `$CODEX_HOME/config.toml` 中内容的单项配置设置。                                                           |
| `cwd`                   | `string`  | session 的工作目录。如果是相对路径，会相对于 server process 的当前目录解析。                                    |
| `include-plan-tool`     | `boolean` | 是否在对话中包含 plan tool。                                                                                    |
| `model`                 | `string`  | 可选的模型名称覆盖（例如 `o3`、`o4-mini`）。                                                                    |
| `profile`               | `string`  | 配置 profile 名称；Codex 会加载 `$CODEX_HOME/profile-name.config.toml` 来指定默认选项。                         |
| `sandbox`               | `string`  | Sandbox mode：`read-only`、`workspace-write` 或 `danger-full-access`。                                          |

**`codex-reply`**：通过提供 thread ID 和 prompt 继续 Codex session。`codex-reply` tool 接受这些属性：

| 属性                            | 类型   | 说明                                                |
| ------------------------------- | ------ | --------------------------------------------------- |
| **`prompt`**（必需）            | string | 用于继续 Codex 对话的下一个 user prompt。           |
| **`threadId`**（必需）          | string | 要继续的 thread 的 ID。                             |
| `conversationId`（deprecated）  | string | `threadId` 的已弃用别名（为兼容性保留）。           |

使用 `tools/call` 响应中 `structuredContent.threadId` 的 `threadId`。Approval prompts（exec/patch）也会在其 `params` payload 中包含 `threadId`。

响应 payload 示例：

```json
{
  "structuredContent": {
    "threadId": "019bbb20-bff6-7130-83aa-bf45ab33250e",
    "content": "`ls -lah` (or `ls -alh`) — long listing, includes dotfiles, human-readable sizes."
  },
  "content": [
    {
      "type": "text",
      "text": "`ls -lah` (or `ls -alh`) — long listing, includes dotfiles, human-readable sizes."
    }
  ]
}
```

请注意，现代 MCP clients 通常只会将 `"structuredContent"` 报告为 tool call 的结果（如果存在），不过 Codex MCP server 也会返回 `"content"`，以便兼容较旧的 MCP clients。

# 创建 multi-agent workflows

Codex CLI 能做的远不止运行临时任务。通过将 CLI 暴露为 [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server，并用 OpenAI Agents SDK 编排它，你可以创建确定性、可审查的 workflows，从单个 agent 扩展到完整的软件交付 pipeline。

本指南会演示与 [OpenAI Cookbook](https://github.com/openai/openai-cookbook/blob/main/examples/codex/codex_mcp_agents_sdk/building_consistent_workflows_codex_cli_agents_sdk.ipynb) 中展示的相同 workflow。你将：

- 将 Codex CLI 作为长期运行的 MCP server 启动，
- 构建一个聚焦的 single-agent workflow，产出可玩的浏览器游戏，以及
- 编排一个 multi-agent 团队，具备 hand-offs、guardrails 和之后可审查的完整 traces。

开始之前，请确保你具备：

- 本地已安装 [Codex CLI](https://developers.openai.com/codex/cli)，因此 `codex` 命令可用。
- Python 3.10+ 和 `pip`。
- 如果你想运行上面的 MCP Inspector 示例，需要 Node.js 18+。
- 本地已存储 OpenAI API key。你可以在 [OpenAI dashboard](https://platform.openai.com/account/api-keys) 创建或管理 keys。

为本指南创建一个工作目录，并将你的 API key 添加到 `.env` 文件：

```bash
mkdir codex-workflows
cd codex-workflows
printf "OPENAI_API_KEY=sk-..." > .env
```

## 安装依赖

Agents SDK 负责跨 Codex、hand-offs 和 traces 的编排。安装最新 SDK packages：

```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade openai openai-agents python-dotenv
```

激活 virtual environment 可以让 SDK dependencies 与系统其余部分隔离。

## 将 Codex CLI 初始化为 MCP server

首先将 Codex CLI 转换为 Agents SDK 可以调用的 MCP server。该 server 暴露两个 tools（`codex()` 用于开始对话，`codex-reply()` 用于继续对话），并让 Codex 在多个 agent turns 之间保持运行。

创建名为 `codex_mcp.py` 的文件，并添加以下内容：

```python
import asyncio

from agents import Agent, Runner
from agents.mcp import MCPServerStdio


async def main() -> None:
    async with MCPServerStdio(
        name="Codex CLI",
        params={
            "command": "codex",
            "args": ["mcp-server"],
        },
        client_session_timeout_seconds=360000,
    ) as codex_mcp_server:
        print("Codex MCP server started.")
        # More logic coming in the next sections.
        return


if __name__ == "__main__":
    asyncio.run(main())
```

运行一次脚本，验证 Codex 能成功启动：

```bash
python codex_mcp.py
```

脚本会在打印 `Codex MCP server started.` 后退出。在后续 sections 中，你会在更丰富的 workflows 内复用同一个 MCP server。

## 构建 single-agent workflow

先从一个范围明确的示例开始，它使用 Codex MCP 交付一个小型浏览器游戏。该 workflow 依赖两个 agents：

1. **Game Designer**：为游戏编写 brief。
2. **Game Developer**：通过调用 Codex MCP 实现游戏。

使用以下代码更新 `codex_mcp.py`。它保留上面的 MCP server 设置，并添加两个 agents。

```python
import asyncio
import os

from dotenv import load_dotenv

from agents import Agent, Runner, set_default_openai_api
from agents.mcp import MCPServerStdio

load_dotenv(override=True)
set_default_openai_api(os.getenv("OPENAI_API_KEY"))


async def main() -> None:
    async with MCPServerStdio(
        name="Codex CLI",
        params={
            "command": "codex",
            "args": ["mcp-server"],
        },
        client_session_timeout_seconds=360000,
    ) as codex_mcp_server:
        developer_agent = Agent(
            name="Game Developer",
            instructions=(
                "You are an expert in building simple games using basic html + css + javascript with no dependencies. "
                "Save your work in a file called index.html in the current directory. "
                "Always call codex with \"approval-policy\": \"never\" and \"sandbox\": \"workspace-write\"."
            ),
            mcp_servers=[codex_mcp_server],
        )

        designer_agent = Agent(
            name="Game Designer",
            instructions=(
                "You are an indie game connoisseur. Come up with an idea for a single page html + css + javascript game that a developer could build in about 50 lines of code. "
                "Format your request as a 3 sentence design brief for a game developer and call the Game Developer coder with your idea."
            ),
            model="gpt-5",
            handoffs=[developer_agent],
        )

        await Runner.run(designer_agent, "Implement a fun new game!")


if __name__ == "__main__":
    asyncio.run(main())
```

执行脚本：

```bash
python codex_mcp.py
```

Codex 会读取 designer 的 brief，创建 `index.html` 文件，并将完整游戏写入磁盘。在浏览器中打开生成的文件即可游玩。每次运行都会生成不同设计，拥有独特玩法变化和 polish。

## 扩展为 multi-agent workflow

现在把 single-agent 设置转换成一个经编排、可追踪的 workflow。该系统添加：

- **Project Manager**：创建共享 requirements，协调 hand-offs，并执行 guardrails。
- **Designer**、**Frontend Developer**、**Server Developer** 和 **Tester**：每个角色都有 scoped instructions 和 output folders。

创建名为 `multi_agent_workflow.py` 的新文件：

```python
import asyncio
import os

from dotenv import load_dotenv

from agents import (
    Agent,
    ModelSettings,
    Runner,
    WebSearchTool,
    set_default_openai_api,
)
from agents.extensions.handoff_prompt import RECOMMENDED_PROMPT_PREFIX
from agents.mcp import MCPServerStdio
from openai.types.shared import Reasoning

load_dotenv(override=True)
set_default_openai_api(os.getenv("OPENAI_API_KEY"))


async def main() -> None:
    async with MCPServerStdio(
        name="Codex CLI",
        params={"command": "codex", "args": ["mcp"]},
        client_session_timeout_seconds=360000,
    ) as codex_mcp_server:
        designer_agent = Agent(
            name="Designer",
            instructions=(
                f"""{RECOMMENDED_PROMPT_PREFIX}"""
                "You are the Designer.\n"
                "Your only source of truth is AGENT_TASKS.md and REQUIREMENTS.md from the Project Manager.\n"
                "Do not assume anything that is not written there.\n\n"
                "You may use the internet for additional guidance or research."
                "Deliverables (write to /design):\n"
                "- design_spec.md – a single page describing the UI/UX layout, main screens, and key visual notes as requested in AGENT_TASKS.md.\n"
                "- wireframe.md – a simple text or ASCII wireframe if specified.\n\n"
                "Keep the output short and implementation-friendly.\n"
                "When complete, handoff to the Project Manager with transfer_to_project_manager."
                "When creating files, call Codex MCP with {\"approval-policy\":\"never\",\"sandbox\":\"workspace-write\"}."
            ),
            model="gpt-5",
            tools=[WebSearchTool()],
            mcp_servers=[codex_mcp_server],
        )

        frontend_developer_agent = Agent(
            name="Frontend Developer",
            instructions=(
                f"""{RECOMMENDED_PROMPT_PREFIX}"""
                "You are the Frontend Developer.\n"
                "Read AGENT_TASKS.md and design_spec.md. Implement exactly what is described there.\n\n"
                "Deliverables (write to /frontend):\n"
                "- index.html – main page structure\n"
                "- styles.css or inline styles if specified\n"
                "- main.js or game.js if specified\n\n"
                "Follow the Designer’s DOM structure and any integration points given by the Project Manager.\n"
                "Do not add features or branding beyond the provided documents.\n\n"
                "When complete, handoff to the Project Manager with transfer_to_project_manager_agent."
                "When creating files, call Codex MCP with {\"approval-policy\":\"never\",\"sandbox\":\"workspace-write\"}."
            ),
            model="gpt-5",
            mcp_servers=[codex_mcp_server],
        )

        backend_developer_agent = Agent(
            name="Backend Developer",
            instructions=(
                f"""{RECOMMENDED_PROMPT_PREFIX}"""
                "You are the Backend Developer.\n"
                "Read AGENT_TASKS.md and REQUIREMENTS.md. Implement the backend endpoints described there.\n\n"
                "Deliverables (write to /backend):\n"
                "- package.json – include a start script if requested\n"
                "- server.js – implement the API endpoints and logic exactly as specified\n\n"
                "Keep the code as simple and readable as possible. No external database.\n\n"
                "When complete, handoff to the Project Manager with transfer_to_project_manager_agent."
                "When creating files, call Codex MCP with {\"approval-policy\":\"never\",\"sandbox\":\"workspace-write\"}."
            ),
            model="gpt-5",
            mcp_servers=[codex_mcp_server],
        )

        tester_agent = Agent(
            name="Tester",
            instructions=(
                f"""{RECOMMENDED_PROMPT_PREFIX}"""
                "You are the Tester.\n"
                "Read AGENT_TASKS.md and TEST.md. Verify that the outputs of the other roles meet the acceptance criteria.\n\n"
                "Deliverables (write to /tests):\n"
                "- TEST_PLAN.md – bullet list of manual checks or automated steps as requested\n"
                "- test.sh or a simple automated script if specified\n\n"
                "Keep it minimal and easy to run.\n\n"
                "When complete, handoff to the Project Manager with transfer_to_project_manager."
                "When creating files, call Codex MCP with {\"approval-policy\":\"never\",\"sandbox\":\"workspace-write\"}."
            ),
            model="gpt-5",
            mcp_servers=[codex_mcp_server],
        )

        project_manager_agent = Agent(
            name="Project Manager",
            instructions=(
                f"""{RECOMMENDED_PROMPT_PREFIX}"""
                """
                You are the Project Manager.

                Objective:
                Convert the input task list into three project-root files the team will execute against.

                Deliverables (write in project root):
                - REQUIREMENTS.md: concise summary of product goals, target users, key features, and constraints.
                - TEST.md: tasks with [Owner] tags (Designer, Frontend, Backend, Tester) and clear acceptance criteria.
                - AGENT_TASKS.md: one section per role containing:
                  - Project name
                  - Required deliverables (exact file names and purpose)
                  - Key technical notes and constraints

                Process:
                - Resolve ambiguities with minimal, reasonable assumptions. Be specific so each role can act without guessing.
                - Create files using Codex MCP with {"approval-policy":"never","sandbox":"workspace-write"}.
                - Do not create folders. Only create REQUIREMENTS.md, TEST.md, AGENT_TASKS.md.

                Handoffs (gated by required files):
                1) After the three files above are created, hand off to the Designer with transfer_to_designer_agent and include REQUIREMENTS.md and AGENT_TASKS.md.
                2) Wait for the Designer to produce /design/design_spec.md. Verify that file exists before proceeding.
                3) When design_spec.md exists, hand off in parallel to both:
                   - Frontend Developer with transfer_to_frontend_developer_agent (provide design_spec.md, REQUIREMENTS.md, AGENT_TASKS.md).
                   - Backend Developer with transfer_to_backend_developer_agent (provide REQUIREMENTS.md, AGENT_TASKS.md).
                4) Wait for Frontend to produce /frontend/index.html and Backend to produce /backend/server.js. Verify both files exist.
                5) When both exist, hand off to the Tester with transfer_to_tester_agent and provide all prior artifacts and outputs.
                6) Do not advance to the next handoff until the required files for that step are present. If something is missing, request the owning agent to supply it and re-check.

                PM Responsibilities:
                - Coordinate all roles, track file completion, and enforce the above gating checks.
                - Do NOT respond with status updates. Just handoff to the next agent until the project is complete.
                """
            ),
            model="gpt-5",
            model_settings=ModelSettings(
                reasoning=Reasoning(effort="medium"),
            ),
            handoffs=[designer_agent, frontend_developer_agent, backend_developer_agent, tester_agent],
            mcp_servers=[codex_mcp_server],
        )

        designer_agent.handoffs = [project_manager_agent]
        frontend_developer_agent.handoffs = [project_manager_agent]
        backend_developer_agent.handoffs = [project_manager_agent]
        tester_agent.handoffs = [project_manager_agent]

        task_list = """
Goal: Build a tiny browser game to showcase a multi-agent workflow.

High-level requirements:
- Single-screen game called "Bug Busters".
- Player clicks a moving bug to earn points.
- Game ends after 20 seconds and shows final score.
- Optional: submit score to a simple backend and display a top-10 leaderboard.

Roles:
- Designer: create a one-page UI/UX spec and basic wireframe.
- Frontend Developer: implement the page and game logic.
- Backend Developer: implement a minimal API (GET /health, GET/POST /scores).
- Tester: write a quick test plan and a simple script to verify core routes.

Constraints:
- No external database—memory storage is fine.
- Keep everything readable for beginners; no frameworks required.
- All outputs should be small files saved in clearly named folders.
"""

        result = await Runner.run(project_manager_agent, task_list, max_turns=30)
        print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
```

运行脚本并观察生成的文件：

```bash
python multi_agent_workflow.py
ls -R
```

Project manager agent 会写入 `REQUIREMENTS.md`、`TEST.md` 和 `AGENT_TASKS.md`，然后在 designer、frontend、server 和 tester agents 之间协调 hand-offs。每个 agent 都会先在自己的文件夹中写入 scoped artifacts，然后再把控制权交回 project manager。

## 追踪 workflow

Codex 会自动记录 traces，捕获每个 prompt、tool call 和 hand-off。Multi-agent run 完成后，打开 [Traces dashboard](https://platform.openai.com/trace) 检查执行时间线。

高层 trace 会突出显示 project manager 如何在继续前验证 hand-offs。点击单个 steps 可以查看 prompts、Codex MCP calls、写入的文件和执行时长。这些细节让审计每个 hand-off、理解 workflow 如何逐 turn 演进变得直接。
这些 traces 让调试 workflow 问题、审计 agent behavior 和长期衡量 performance 变得直接，而且不需要额外 instrumentation。
