---
title: "Non-interactive mode"
description: "Use `codex exec` to run Codex in scripts and CI"
outline: deep
---

# Non-interactive mode

**文档集**：Codex  
**分组**：Codex — Noninteractive  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/noninteractive](https://developers.openai.com/codex/noninteractive)
- Markdown 来源：[https://developers.openai.com/codex/noninteractive.md](https://developers.openai.com/codex/noninteractive.md)
- 抓取时间：2026-06-27T05:55:03.176Z
- Checksum：`2bf6721391fec35734ce364006cb7369360b957d7a2d6ba8f55fc9079be6e696`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
非交互模式让你可以从脚本中运行 Codex（例如 continuous integration (CI) jobs），而无需打开交互式 TUI。
你通过 `codex exec` 调用它。

如需 flag 级别的详情，请参阅 [`codex exec`](/mirror/codex/cli/reference#codex-exec)。

## 何时使用 `codex exec`

当你希望 Codex 执行以下操作时，请使用 `codex exec`：

- 作为 pipeline 的一部分运行（CI、pre-merge checks、scheduled jobs）。
- 生成可 pipe 到其他工具的输出（例如生成 release notes 或 summaries）。
- 自然融入 CLI workflows：将命令输出串接到 Codex，再将 Codex 输出传给其他工具。
- 使用明确、预设的 sandbox 和 approval settings 运行。

## 基本用法

将任务 prompt 作为单个参数传入：

```bash
codex exec "summarize the repository structure and list the top 5 risky areas"
```

当 `codex exec` 运行时，Codex 会将进度流式输出到 `stderr`，并且只把最终 agent message 打印到 `stdout`。这使得重定向或 pipe 最终结果非常直接：

```bash
codex exec "generate release notes for the last 10 commits" | tee release-notes.md
```

当你不想把 session rollout files 持久化到磁盘时，请使用 `--ephemeral`：

```bash
codex exec --ephemeral "triage this repository and suggest next steps"
```

如果 stdin 被 pipe 进来，同时你也提供了 prompt 参数，Codex 会把 prompt 视为 instruction，把 piped content 视为额外上下文。

这让你可以轻松用一个命令生成输入，并直接交给 Codex：

```bash
curl -s https://jsonplaceholder.typicode.com/comments \
  | codex exec "format the top 20 items into a markdown table" \
  > table.md
```

如需更高级的 stdin piping 模式，请参阅 [Advanced stdin piping](/mirror/codex/noninteractive#advanced-stdin-piping)。

## 权限和安全

默认情况下，`codex exec` 在 read-only sandbox 中运行。在自动化中，请设置工作流所需的最小权限：

- 允许编辑：`codex exec --sandbox workspace-write "&lt;task&gt;"`
- 允许更宽访问：`codex exec --sandbox danger-full-access "&lt;task&gt;"`

仅在受控环境中使用 `danger-full-access`（例如隔离的 CI runner 或 container）。

Codex 保留 `codex exec --full-auto` 作为已弃用的兼容性 flag，并会打印 warning。新脚本中请优先使用显式 `--sandbox workspace-write` flag。

当你需要一次不加载 `$CODEX_HOME/config.toml` 的运行时，请使用 `--ignore-user-config`；当你需要在受控自动化环境中跳过用户和项目 execpolicy `.rules` 文件时，请使用 `--ignore-rules`。

如果你配置了启用且 `required = true` 的 MCP server，而它初始化失败，`codex exec` 会退出并报错，而不是在没有该 server 的情况下继续。

## 让输出可被机器读取

要在脚本中消费 Codex 输出，请使用 JSON Lines 输出：

```bash
codex exec --json "summarize the repo structure" | jq
```

启用 `--json` 后，`stdout` 会变成 JSON Lines (JSONL) 流，因此你可以捕获 Codex 运行期间发出的每个事件。事件类型包括 `thread.started`、`turn.started`、`turn.completed`、`turn.failed`、`item.*` 和 `error`。

Item 类型包括 agent messages、reasoning、command executions、file changes、MCP tool calls、web searches 和 plan updates。

示例 JSON 流（每行都是一个 JSON object）：

```jsonl
{"type":"thread.started","thread_id":"0199a213-81c0-7800-8aa1-bbab2a035a53"}
{"type":"turn.started"}
{"type":"item.started","item":{"id":"item_1","type":"command_execution","command":"bash -lc ls","status":"in_progress"}}
{"type":"item.completed","item":{"id":"item_3","type":"agent_message","text":"Repo contains docs, sdk, and examples directories."}}
{"type":"turn.completed","usage":{"input_tokens":24763,"cached_input_tokens":24448,"output_tokens":122,"reasoning_output_tokens":0}}
```

如果你只需要最终消息，请用 `-o &lt;path&gt;`/`--output-last-message &lt;path&gt;` 将其写入文件。这会把最终消息写入文件，并仍然将其打印到 `stdout`（详情请参阅 [`codex exec`](/mirror/codex/cli/reference#codex-exec)）。

## 用 schema 创建结构化输出

如果下游步骤需要结构化数据，请使用 `--output-schema` 请求符合 JSON Schema 的最终响应。
这对需要稳定字段的自动化工作流很有用（例如 job summaries、risk reports 或 release metadata）。

`schema.json`

```json
{
  "type": "object",
  "properties": {
    "project_name": { "type": "string" },
    "programming_languages": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["project_name", "programming_languages"],
  "additionalProperties": false
}
```

使用 schema 运行 Codex，并把最终 JSON response 写入磁盘：

```bash
codex exec "Extract project metadata" \
  --output-schema ./schema.json \
  -o ./project-metadata.json
```

示例最终输出（stdout）：

```json
{
  "project_name": "Codex CLI",
  "programming_languages": ["Rust", "TypeScript", "Shell"]
}
```

## 在自动化中认证

`codex exec` 默认复用已保存的 CLI authentication。在 CI 中，通常会显式提供 credentials：

### 使用 API key auth

对于 GitHub Actions，请使用 [Codex GitHub Action](/mirror/codex/github-action)，而不是自己安装和认证 CLI。该 action 旨在通过安装 Codex、启动 Responses API proxy，并以可配置的 safety strategy 运行 Codex，来减少 API key 暴露。

不要在 checkout 或运行 repository-controlled code 的 workflows 中，将 `OPENAI_API_KEY` 或 `CODEX_API_KEY` 设置为 job-level environment variable。Build scripts、tests、dependency lifecycle hooks，或同一 job 中被攻陷的 action 都可以读取这些环境变量。

对于其他自动化环境，请只为单次 `codex exec` 调用设置 `CODEX_API_KEY`，并确保同一 process environment 中没有运行不受信任的代码。

要为单次运行使用不同的 API key，请内联设置 `CODEX_API_KEY`：

```bash
CODEX_API_KEY=<api-key> codex exec --json "triage open bug reports"
```

`CODEX_API_KEY` 仅在 `codex exec` 中受支持。


如果你需要使用 Codex user account 而不是 API key 来运行 CI/CD jobs，请阅读此部分，例如 enterprise teams 在 trusted runners 上使用 ChatGPT-managed Codex access，或需要 ChatGPT/Codex rate limits 而不是 API key usage 的用户。

API keys 是自动化的正确默认选择，因为它们更易于 provision 和 rotate。仅当你确实需要以你的 Codex account 运行时，才使用此路径。

请像对待密码一样对待 `~/.codex/auth.json`：它包含 access tokens。不要提交它、粘贴到 tickets，或在聊天中分享。

不要将此工作流用于 public 或 open-source repositories。如果 runner 上无法使用 `codex login`，请通过 secure storage 预置 `auth.json`，在 runner 上运行 Codex 让 Codex 就地刷新它，并在运行之间持久化更新后的文件。

请参阅 [Maintain Codex account auth in CI/CD (advanced)](https://developers.openai.com/codex/auth/ci-cd-auth)。



## 恢复非交互式 session

如果你需要继续此前的运行（例如 two-stage pipeline），请使用 `resume` subcommand：

```bash
codex exec "review the change for race conditions"
codex exec resume --last "fix the race conditions you found"
```

你也可以使用 `codex exec resume &lt;SESSION_ID&gt;` 指定特定 session ID。

## 需要 Git repository

Codex 要求命令在 Git repository 内运行，以防止破坏性更改。如果你确定环境安全，可以用 `codex exec --skip-git-repo-check` 覆盖此检查。

## 常见自动化模式

### 示例：在 GitHub Actions 中自动修复 CI failures

对于 GitHub Actions workflows，请使用 [`openai/codex-action`](https://github.com/openai/codex-action)，而不是安装 Codex 并把 API key 传给 shell step。该 action 会为 OpenAI API key 启动安全 proxy。

你可以使用 Codex 在 CI workflow 失败时自动提出修复。模式如下：

1. 当你的 main CI workflow 以错误完成时，触发 follow-up workflow。
2. 以 repository read permissions only checkout 失败 commit。
3. 在 Codex 之前运行 setup commands，且不要把 OpenAI API key 暴露给这些步骤。
4. 运行 Codex GitHub Action。
5. 将 Codex 的本地更改保存为 patch artifact。
6. 在单独 job 中应用 patch 并打开 pull request。

下面的 Codex job 只有 `contents: read`。Codex 运行后，它只把 diff 序列化为 artifact。`open_pr` job 会获得 repository write permissions，但不会获得 `OPENAI_API_KEY`。

该示例假设是 Node.js 项目。请调整 setup 和 test commands 以匹配你的技术栈。

如需更深入的 security checklist，请参阅 [Codex GitHub Action security guidance](https://github.com/openai/codex-action/blob/main/docs/security.md)。

```yaml
name: Codex auto-fix on CI failure

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]

jobs:
  generate_fix:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
    outputs:
      has_patch: ${{ steps.diff.outputs.has_patch }}
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
          fetch-depth: 0
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then npm ci; fi

      - name: Run Codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt: |
            The CI workflow "${{ github.event.workflow_run.name }}" failed for commit
            ${{ github.event.workflow_run.head_sha }}.

            Run `npm test --silent` to reproduce the failure. Identify the minimal
            change needed to make the tests pass, implement only that change, and
            run `npm test --silent` again.

            Do not refactor unrelated files.

      - name: Create patch artifact
        id: diff
        run: |
          git add -N .
          git diff --binary HEAD > codex.patch
          if [ -s codex.patch ]; then
            echo "has_patch=true" >> "$GITHUB_OUTPUT"
          else
            echo "has_patch=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Upload patch artifact
        if: steps.diff.outputs.has_patch == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: codex-fix-patch
          path: codex.patch
          if-no-files-found: error

  open_pr:
    runs-on: ubuntu-latest
    needs: generate_fix
    if: needs.generate_fix.outputs.has_patch == 'true'
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
          fetch-depth: 0

      - uses: actions/download-artifact@v4
        with:
          name: codex-fix-patch

      - name: Apply Codex patch
        run: git apply --index codex.patch

      - name: Open pull request
        env:
          GH_TOKEN: ${{ github.token }}
          FAILED_HEAD_BRANCH: ${{ github.event.workflow_run.head_branch }}
          FAILED_HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
          RUN_ID: ${{ github.event.workflow_run.run_id }}
        run: |
          branch="codex/auto-fix-$RUN_ID"

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git switch -c "$branch"
          git commit -m "Auto-fix failing CI via Codex"
          git push origin "$branch"

          {
            echo "Codex generated this patch after CI failed for \`$FAILED_HEAD_SHA\`."
            echo
            echo "Review the changes before merging."
          } > pr-body.md

          gh pr create \
            --base "$FAILED_HEAD_BRANCH" \
            --head "$branch" \
            --title "Auto-fix failing CI via Codex" \
            --body-file pr-body.md
```

## Advanced stdin piping

当另一个命令为 Codex 产生输入时，请根据 instruction 应来自何处来选择 stdin pattern。当你已经知道 instruction，并希望将 piped output 作为上下文传入时，请使用 prompt-plus-stdin。当 stdin 应成为完整 prompt 时，请使用 `codex exec -`。

### 使用 prompt-plus-stdin

当另一个命令已经产生你希望 Codex 检查的数据时，prompt-plus-stdin 很有用。在此模式中，你自己编写 instruction，并将输出 pipe 进来作为上下文，这非常适合围绕 command output、logs 和 generated data 构建的 CLI workflows。

```bash
npm test 2>&1 \
  | codex exec "summarize the failing tests and propose the smallest likely fix" \
  | tee test-summary.md
```



### 总结 logs

```bash
tail -n 200 app.log \
  | codex exec "identify the likely root cause, cite the most important errors, and suggest the next three debugging steps" \
  > log-triage.md
```

### 检查 TLS 或 HTTP 问题

```bash
curl -vv https://api.example.com/health 2>&1 \
  | codex exec "explain the TLS or HTTP failure and suggest the most likely fix" \
  > tls-debug.md
```

### 准备适合 Slack 的 update

```bash
gh run view 123456 --log \
  | codex exec "write a concise Slack-ready update on the CI failure, including the likely cause and next step" \
  | pbcopy
```

### 从 CI logs 起草 pull request comment

```bash
gh run view 123456 --log \
  | codex exec "summarize the failure in 5 bullets for the pull request thread" \
  | gh pr comment 789 --body-file -
```



### 当 stdin 是 prompt 时使用 `codex exec -`

如果你省略 prompt 参数，Codex 会从 stdin 读取 prompt。当你想强制这种行为时，请使用 `codex exec -`。

当另一个命令或脚本正在动态生成整个 prompt 时，`-` sentinel 很有用。如果你把 prompts 存在文件中、用 shell scripts 组装 prompts，或把实时命令输出与 instructions 组合后再交给 Codex，这种方式很适合。

```bash
cat prompt.txt | codex exec -
```

```bash
printf "Summarize this error log in 3 bullets:\n\n%s\n" "$(tail -n 200 app.log)" \
  | codex exec -
```

```bash
generate_prompt.sh | codex exec - --json > result.jsonl
```

:::

## English source

::: details 展开英文原文
::: v-pre
Non-interactive mode lets you run Codex from scripts (for example, continuous integration (CI) jobs) without opening the interactive TUI.
You invoke it with `codex exec`.

For flag-level details, see [`codex exec`](/mirror/codex/cli/reference#codex-exec).

## When to use `codex exec`

Use `codex exec` when you want Codex to:

- Run as part of a pipeline (CI, pre-merge checks, scheduled jobs).
- Produce output you can pipe into other tools (for example, to generate release notes or summaries).
- Fit naturally into CLI workflows that chain command output into Codex and pass Codex output to other tools.
- Run with explicit, pre-set sandbox and approval settings.

## Basic usage

Pass a task prompt as a single argument:

```bash
codex exec "summarize the repository structure and list the top 5 risky areas"
```

While `codex exec` runs, Codex streams progress to `stderr` and prints only the final agent message to `stdout`. This makes it straightforward to redirect or pipe the final result:

```bash
codex exec "generate release notes for the last 10 commits" | tee release-notes.md
```

Use `--ephemeral` when you don't want to persist session rollout files to disk:

```bash
codex exec --ephemeral "triage this repository and suggest next steps"
```

If stdin is piped and you also provide a prompt argument, Codex treats the prompt as the instruction and the piped content as additional context.

This makes it easy to generate input with one command and hand it directly to Codex:

```bash
curl -s https://jsonplaceholder.typicode.com/comments \
  | codex exec "format the top 20 items into a markdown table" \
  > table.md
```

For more advanced stdin piping patterns, see [Advanced stdin piping](/mirror/codex/noninteractive#advanced-stdin-piping).

## Permissions and safety

By default, `codex exec` runs in a read-only sandbox. In automation, set the least permissions needed for the workflow:

- Allow edits: `codex exec --sandbox workspace-write "&lt;task&gt;"`
- Allow broader access: `codex exec --sandbox danger-full-access "&lt;task&gt;"`

Use `danger-full-access` only in a controlled environment (for example, an isolated CI runner or container).

Codex keeps `codex exec --full-auto` as a deprecated compatibility flag and prints a warning. Prefer the explicit `--sandbox workspace-write` flag in new scripts.

Use `--ignore-user-config` when you need a run that doesn't load `$CODEX_HOME/config.toml`, and `--ignore-rules` when you need to skip user and project execpolicy `.rules` files for a controlled automation environment.

If you configure an enabled MCP server with `required = true` and it fails to initialize, `codex exec` exits with an error instead of continuing without that server.

## Make output machine-readable

To consume Codex output in scripts, use JSON Lines output:

```bash
codex exec --json "summarize the repo structure" | jq
```

When you enable `--json`, `stdout` becomes a JSON Lines (JSONL) stream so you can capture every event Codex emits while it's running. Event types include `thread.started`, `turn.started`, `turn.completed`, `turn.failed`, `item.*`, and `error`.

Item types include agent messages, reasoning, command executions, file changes, MCP tool calls, web searches, and plan updates.

Sample JSON stream (each line is a JSON object):

```jsonl
{"type":"thread.started","thread_id":"0199a213-81c0-7800-8aa1-bbab2a035a53"}
{"type":"turn.started"}
{"type":"item.started","item":{"id":"item_1","type":"command_execution","command":"bash -lc ls","status":"in_progress"}}
{"type":"item.completed","item":{"id":"item_3","type":"agent_message","text":"Repo contains docs, sdk, and examples directories."}}
{"type":"turn.completed","usage":{"input_tokens":24763,"cached_input_tokens":24448,"output_tokens":122,"reasoning_output_tokens":0}}
```

If you only need the final message, write it to a file with `-o &lt;path&gt;`/`--output-last-message &lt;path&gt;`. This writes the final message to the file and still prints it to `stdout` (see [`codex exec`](/mirror/codex/cli/reference#codex-exec) for details).

## Create structured outputs with a schema

If you need structured data for downstream steps, use `--output-schema` to request a final response that conforms to a JSON Schema.
This is useful for automated workflows that need stable fields (for example, job summaries, risk reports, or release metadata).

`schema.json`

```json
{
  "type": "object",
  "properties": {
    "project_name": { "type": "string" },
    "programming_languages": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["project_name", "programming_languages"],
  "additionalProperties": false
}
```

Run Codex with the schema and write the final JSON response to disk:

```bash
codex exec "Extract project metadata" \
  --output-schema ./schema.json \
  -o ./project-metadata.json
```

Example final output (stdout):

```json
{
  "project_name": "Codex CLI",
  "programming_languages": ["Rust", "TypeScript", "Shell"]
}
```

## Authenticate in automation

`codex exec` reuses saved CLI authentication by default. In CI, it's common to provide credentials explicitly:

### Use API key auth

For GitHub Actions, use the [Codex GitHub Action](/mirror/codex/github-action) instead of installing and authenticating the CLI yourself. The action is designed to reduce API key exposure by installing Codex, starting a Responses API proxy, and running Codex with a configurable safety strategy.

Do not set `OPENAI_API_KEY` or `CODEX_API_KEY` as a job-level environment variable in workflows that check out or run repository-controlled code. Build scripts, tests, dependency lifecycle hooks, or a compromised action in the same job can read those environment variables.

For other automation environments, set `CODEX_API_KEY` only for the single `codex exec` invocation and make sure no untrusted code runs in the same process environment.

To use a different API key for a single run, set `CODEX_API_KEY` inline:

```bash
CODEX_API_KEY=<api-key> codex exec --json "triage open bug reports"
```

`CODEX_API_KEY` is only supported in `codex exec`.


Read this if you need to run CI/CD jobs with a Codex user account instead of an
API key, such as enterprise teams using ChatGPT-managed Codex access on trusted
runners or users who need ChatGPT/Codex rate limits instead of API key usage.

API keys are the right default for automation because they are simpler to
provision and rotate. Use this path only if you specifically need to run as
your Codex account.

Treat `~/.codex/auth.json` like a password: it contains access tokens. Don't
commit it, paste it into tickets, or share it in chat.

Do not use this workflow for public or open-source repositories. If `codex login`
is not an option on the runner, seed `auth.json` through secure storage, run
Codex on the runner so Codex refreshes it in place, and persist the updated file
between runs.

See [Maintain Codex account auth in CI/CD (advanced)](https://developers.openai.com/codex/auth/ci-cd-auth).



## Resume a non-interactive session

If you need to continue a previous run (for example, a two-stage pipeline), use the `resume` subcommand:

```bash
codex exec "review the change for race conditions"
codex exec resume --last "fix the race conditions you found"
```

You can also target a specific session ID with `codex exec resume &lt;SESSION_ID&gt;`.

## Git repository required

Codex requires commands to run inside a Git repository to prevent destructive changes. Override this check with `codex exec --skip-git-repo-check` if you're sure the environment is safe.

## Common automation patterns

### Example: Autofix CI failures in GitHub Actions

For GitHub Actions workflows, use [`openai/codex-action`](https://github.com/openai/codex-action) instead of installing Codex and passing the API key to a shell step. The action starts a secure proxy for the OpenAI API key.

You can use Codex to automatically propose fixes when a CI workflow fails. The pattern is:

1. Trigger a follow-up workflow when your main CI workflow completes with an error.
2. Check out the failing commit with repository read permissions only.
3. Run setup commands before Codex, without exposing your OpenAI API key to those steps.
4. Run the Codex GitHub Action.
5. Save Codex's local changes as a patch artifact.
6. In a separate job, apply the patch and open a pull request.

The Codex job below has only `contents: read`. After Codex runs, it only serializes the diff as an artifact. The `open_pr` job receives repository write permissions, but it does not receive `OPENAI_API_KEY`.

The example assumes a Node.js project. Adjust the setup and test commands to match your stack.

For a deeper security checklist, see the [Codex GitHub Action security guidance](https://github.com/openai/codex-action/blob/main/docs/security.md).

```yaml
name: Codex auto-fix on CI failure

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]

jobs:
  generate_fix:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
    outputs:
      has_patch: ${{ steps.diff.outputs.has_patch }}
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
          fetch-depth: 0
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then npm ci; fi

      - name: Run Codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt: |
            The CI workflow "${{ github.event.workflow_run.name }}" failed for commit
            ${{ github.event.workflow_run.head_sha }}.

            Run `npm test --silent` to reproduce the failure. Identify the minimal
            change needed to make the tests pass, implement only that change, and
            run `npm test --silent` again.

            Do not refactor unrelated files.

      - name: Create patch artifact
        id: diff
        run: |
          git add -N .
          git diff --binary HEAD > codex.patch
          if [ -s codex.patch ]; then
            echo "has_patch=true" >> "$GITHUB_OUTPUT"
          else
            echo "has_patch=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Upload patch artifact
        if: steps.diff.outputs.has_patch == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: codex-fix-patch
          path: codex.patch
          if-no-files-found: error

  open_pr:
    runs-on: ubuntu-latest
    needs: generate_fix
    if: needs.generate_fix.outputs.has_patch == 'true'
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
          fetch-depth: 0

      - uses: actions/download-artifact@v4
        with:
          name: codex-fix-patch

      - name: Apply Codex patch
        run: git apply --index codex.patch

      - name: Open pull request
        env:
          GH_TOKEN: ${{ github.token }}
          FAILED_HEAD_BRANCH: ${{ github.event.workflow_run.head_branch }}
          FAILED_HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
          RUN_ID: ${{ github.event.workflow_run.run_id }}
        run: |
          branch="codex/auto-fix-$RUN_ID"

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git switch -c "$branch"
          git commit -m "Auto-fix failing CI via Codex"
          git push origin "$branch"

          {
            echo "Codex generated this patch after CI failed for \`$FAILED_HEAD_SHA\`."
            echo
            echo "Review the changes before merging."
          } > pr-body.md

          gh pr create \
            --base "$FAILED_HEAD_BRANCH" \
            --head "$branch" \
            --title "Auto-fix failing CI via Codex" \
            --body-file pr-body.md
```

## Advanced stdin piping

When another command produces input for Codex, choose the stdin pattern based on where the instruction should come from. Use prompt-plus-stdin when you already know the instruction and want to pass piped output as context. Use `codex exec -` when stdin should become the full prompt.

### Use prompt-plus-stdin

Prompt-plus-stdin is useful when another command already produces the data you want Codex to inspect. In this mode, you write the instruction yourself and pipe in the output as context, which makes it a natural fit for CLI workflows built around command output, logs, and generated data.

```bash
npm test 2>&1 \
  | codex exec "summarize the failing tests and propose the smallest likely fix" \
  | tee test-summary.md
```



### Summarize logs

```bash
tail -n 200 app.log \
  | codex exec "identify the likely root cause, cite the most important errors, and suggest the next three debugging steps" \
  > log-triage.md
```

### Inspect TLS or HTTP issues

```bash
curl -vv https://api.example.com/health 2>&1 \
  | codex exec "explain the TLS or HTTP failure and suggest the most likely fix" \
  > tls-debug.md
```

### Prepare a Slack-ready update

```bash
gh run view 123456 --log \
  | codex exec "write a concise Slack-ready update on the CI failure, including the likely cause and next step" \
  | pbcopy
```

### Draft a pull request comment from CI logs

```bash
gh run view 123456 --log \
  | codex exec "summarize the failure in 5 bullets for the pull request thread" \
  | gh pr comment 789 --body-file -
```



### Use `codex exec -` when stdin is the prompt

If you omit the prompt argument, Codex reads the prompt from stdin. Use `codex exec -` when you want to force that behavior explicitly.

The `-` sentinel is useful when another command or script is generating the entire prompt dynamically. This is a good fit when you store prompts in files, assemble prompts with shell scripts, or combine live command output with instructions before handing the whole prompt to Codex.

```bash
cat prompt.txt | codex exec -
```

```bash
printf "Summarize this error log in 3 bullets:\n\n%s\n" "$(tail -n 200 app.log)" \
  | codex exec -
```

```bash
generate_prompt.sh | codex exec - --json > result.jsonl
```

:::
:::

