---
status: needs-review
sourceId: "ff8df6fc9b11"
sourceChecksum: "ff8df6fc9b11056a39e6e5c522d5e9f70796ba99e7e388a524d7df09217c61da"
sourceUrl: "https://developers.openai.com/codex/github-action"
translatedAt: "2026-06-27T19:05:47.1891485+08:00"
translator: codex-gpt-5.5-xhigh
---

# Codex GitHub Action

使用 Codex GitHub Action（`openai/codex-action@v1`）可以在 CI/CD 作业中运行 Codex、应用补丁，或从 GitHub Actions workflow 发布 review。
该 action 会安装 Codex CLI，在你提供 API key 时启动 Responses API proxy，并按你指定的权限运行 `codex exec`。

当你想要实现以下目标时，可以使用该 action：

- 在不自行管理 CLI 的情况下，自动化 Codex 对 pull requests 或 releases 的反馈。
- 将 Codex 驱动的质量检查作为 CI pipeline 的一部分，用于把关变更。
- 从 workflow 文件运行可重复的 Codex 任务（代码审查、release 准备、迁移）。

CI 示例请参见[非交互模式](https://developers.openai.com/codex/noninteractive)，并可在 [openai/codex-action 仓库](https://github.com/openai/codex-action)中查看源码。

## 前提条件

- 将你的 OpenAI key 存储为 GitHub secret（例如 `OPENAI_API_KEY`），并在 workflow 中引用它。
- 在 Linux 或 macOS runner 上运行作业。对于 Windows，请设置 `safety-strategy: unsafe`。
- 在调用 action 之前 checkout 你的代码，以便 Codex 可以读取仓库内容。
- 决定要运行哪些 prompts。你可以通过 `prompt` 提供内联文本，或通过 `prompt-file` 指向仓库中提交的文件。

## 示例 workflow

下面的示例 workflow 会审查新的 pull requests，捕获 Codex 的响应，并将其发布回 PR。

```yaml
name: Codex pull request review
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  codex:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    outputs:
      final_message: ${{ steps.run_codex.outputs.final-message }}
    steps:
      - uses: actions/checkout@v5
        with:
          ref: refs/pull/${{ github.event.pull_request.number }}/merge
          fetch-depth: 0
          persist-credentials: false

      - name: Run Codex
        id: run_codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt-file: .github/codex/prompts/review.md
          output-file: codex-output.md

  post_feedback:
    runs-on: ubuntu-latest
    needs: codex
    if: needs.codex.outputs.final_message != ''
    permissions:
      issues: write
      pull-requests: write
    steps:
      - name: Post Codex feedback
        uses: actions/github-script@v7
        with:
          github-token: ${{ github.token }}
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              body: process.env.CODEX_FINAL_MESSAGE,
            });
        env:
          CODEX_FINAL_MESSAGE: ${{ needs.codex.outputs.final_message }}
```

将 `.github/codex/prompts/review.md` 替换为你自己的 prompt 文件，或使用 `prompt` input 提供内联文本。该示例还会将最终 Codex 消息写入 `codex-output.md`，便于之后检查或上传 artifact。

## 配置 `codex exec`

通过设置映射到 `codex exec` 选项的 action inputs，可以微调 Codex 的运行方式：

- `prompt` 或 `prompt-file`（二选一）：内联指令，或指向包含任务的 Markdown/text 的仓库路径。可以考虑将 prompts 存储在 `.github/codex/prompts/` 中。
- `codex-args`：额外 CLI flags。提供 JSON array（例如 `["--ephemeral"]`）或 shell 字符串（`--profile ci`）来配置 sessions、profiles 或 MCP 设置。
- `model` 和 `effort`：选择你想要的 Codex agent 配置；留空则使用默认值。
- `sandbox`：将 sandbox mode（`workspace-write`、`read-only`、`danger-full-access`）匹配到 Codex 在运行期间需要的权限。
- `output-file`：将最终 Codex 消息保存到磁盘，便于后续步骤上传或 diff。
- `codex-version`：固定特定 CLI release。留空则使用最新发布版本。
- `codex-home`：如果你想跨步骤复用配置文件或 MCP 设置，请指向共享的 Codex home 目录。

## 管理权限

除非你限制，否则 Codex 在 GitHub-hosted runners 上拥有广泛访问权限。使用这些 inputs 控制暴露面：

- `safety-strategy`（默认 `drop-sudo`）会在运行 Codex 前移除 `sudo`。这对该作业不可逆，并会保护内存中的 secrets。在 Windows 上必须设置 `safety-strategy: unsafe`。
- `unprivileged-user` 将 `safety-strategy: unprivileged-user` 与 `codex-user` 配对，以特定账户运行 Codex。确保该用户可以读写仓库 checkout（参见 [`unprivileged-user` 示例](https://github.com/openai/codex-action/blob/main/examples/unprivileged-user.yml)中的 ownership 修复）。
- `read-only` 会阻止 Codex 更改文件或使用网络，但它仍以提升后的权限运行。不要只依赖 `read-only` 来保护 secrets。
- `sandbox` 会在 Codex 自身内部限制文件系统和网络访问。选择仍能完成任务的最窄选项。
- `allow-users` 和 `allow-bots` 限制谁可以触发 workflow。默认情况下，只有拥有写入权限的用户可以运行该 action；明确列出额外受信任账户，或将该字段留空以使用默认行为。

## 捕获输出

该 action 会通过 `final-message` output 发出最后一条 Codex 消息。可以将它映射为 job output（如上所示），或在后续步骤中直接处理。如果你想从 runner 收集完整 transcript，可以将 `output-file` 与 uploaded artifacts 功能结合使用。需要结构化数据时，通过 `codex-args` 传递 `--output-schema` 以强制 JSON 形状。

## 安全检查清单

- 限制谁可以启动 workflow。优先使用受信任事件或显式审批，而不是允许所有人针对你的仓库运行 Codex。
- 清理来自 pull requests、commit messages 或 issue bodies 的 prompt inputs，以避免 prompt injection。在将 HTML comments 或隐藏文本提供给 Codex 前先审查它们。
- 通过保持 `safety-strategy` 为 `drop-sudo`，或将 Codex 移动到非特权用户，保护你的 `OPENAI_API_KEY`。切勿在多租户 runners 上将 action 保持在 `unsafe` 模式。
- 将 Codex 作为作业中的最后一步运行，避免后续步骤继承任何意外的状态变更。
- 如果怀疑 proxy 日志或 action 输出暴露了 secret material，请立即轮换 keys。

## 排查问题

- **你同时设置了 prompt 和 prompt-file**：移除重复 input，确保只提供一个来源。
- **responses-api-proxy 没有写入 server info**：确认 API key 存在且有效；proxy 只有在提供 `openai-api-key` 时才会启动。
- **预期 `sudo` 被移除，但 `sudo` 成功了**：确保没有更早的步骤恢复了 `sudo`，且 runner OS 是 Linux 或 macOS。用全新的 job 重新运行。
- **`drop-sudo` 后出现权限错误**：在 action 运行前授予写入权限（例如使用 `chmod -R g+rwX "$GITHUB_WORKSPACE"`，或采用 unprivileged-user 模式）。
- **未授权触发被阻止**：如果你需要允许默认写入协作者之外的服务账户，请调整 `allow-users` 或 `allow-bots` inputs。
