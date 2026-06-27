---
status: needs-review
sourceId: "33fdb8ae290d"
sourceChecksum: "33fdb8ae290dddcb61743abf8596c5f4fa1fdd384890774dfd107c3f614e1848"
sourceUrl: "https://developers.openai.com/codex/guides/agents-md"
translatedAt: "2026-06-27T19:05:47.1891485+08:00"
translator: codex-gpt-5.5-xhigh
---

# 使用 AGENTS.md 编写自定义指令

Codex 在开始任何工作前会读取 `AGENTS.md` 文件。通过将全局指导与项目特定覆盖分层，你可以让每个任务从一致的预期开始，无论打开的是哪个仓库。

## Codex 如何发现指导

Codex 启动时会构建一条指令链（每次运行一次；在 TUI 中通常意味着每个已启动 session 一次）。发现过程遵循以下优先级顺序：

1. **全局作用域：** 在你的 Codex home 目录中（默认为 `~/.codex`，除非你设置了 `CODEX_HOME`），如果存在 `AGENTS.override.md`，Codex 会读取它。否则，Codex 读取 `AGENTS.md`。Codex 在这一层只使用第一个非空文件。
2. **项目作用域：** 从项目根目录开始（通常是 Git root），Codex 会向下遍历到当前工作目录。如果 Codex 找不到项目根目录，则只检查当前目录。在路径上的每个目录中，它会依次检查 `AGENTS.override.md`、`AGENTS.md`，再检查 `project_doc_fallback_filenames` 中的任何备用名称。Codex 每个目录最多包含一个文件。
3. **合并顺序：** Codex 从根目录向下拼接文件，并用空行连接。更靠近当前目录的文件会覆盖更早的指导，因为它们在合并后的 prompt 中出现得更靠后。

Codex 会跳过空文件，并在合并后的大小达到 `project_doc_max_bytes` 定义的限制（默认为 32 KiB）后停止添加文件。有关这些旋钮的详细信息，请参见[项目指令发现](https://developers.openai.com/codex/config-advanced#project-instructions-discovery)。当你遇到上限时，可以提高限制或把指令拆分到嵌套目录中。

## 创建全局指导

在你的 Codex home 目录中创建持久默认值，让每个仓库都继承你的工作约定。

1. 确保目录存在：

   ```bash
   mkdir -p ~/.codex
   ```

2. 使用可复用偏好创建 `~/.codex/AGENTS.md`：

   ```md
   # ~/.codex/AGENTS.md

   ## Working agreements

   - Always run `npm test` after modifying JavaScript files.
   - Prefer `pnpm` when installing dependencies.
   - Ask for confirmation before adding new production dependencies.
   ```

3. 在任意位置运行 Codex，确认它加载了该文件：

   ```bash
   codex --ask-for-approval never "Summarize the current instructions."
   ```

   预期结果：Codex 在提出工作之前，会引用 `~/.codex/AGENTS.md` 中的条目。

当你需要临时的全局覆盖、但不想删除基础文件时，请使用 `~/.codex/AGENTS.override.md`。移除该覆盖即可恢复共享指导。

## 分层项目指令

仓库级文件可以让 Codex 了解项目规范，同时仍继承你的全局默认值。

1. 在仓库根目录中添加一个覆盖基本设置的 `AGENTS.md`：

   ```md
   # AGENTS.md

   ## Repository expectations

   - Run `npm run lint` before opening a pull request.
   - Document public utilities in `docs/` when you change behavior.
   ```

2. 当特定团队需要不同规则时，在嵌套目录中添加覆盖。例如，在 `services/payments/` 内创建 `AGENTS.override.md`：

   ```md
   # services/payments/AGENTS.override.md

   ## Payments service rules

   - Use `make test-payments` instead of `npm test`.
   - Never rotate API keys without notifying the security channel.
   ```

3. 从 payments 目录启动 Codex：

   ```bash
   codex --cd services/payments --ask-for-approval never "List the instruction sources you loaded."
   ```

   预期结果：Codex 报告全局文件在前，仓库根目录的 `AGENTS.md` 第二，payments 覆盖最后。

Codex 会在到达当前目录后停止搜索，因此请将覆盖放在尽可能靠近专门工作的地方。

下面是添加全局文件和 payments 专用覆盖后的示例仓库：

<FileTree
  class="mt-4"
  tree={[
    {
      name: "AGENTS.md",
      comment: "Repository expectations",
      highlight: true,
    },
    {
      name: "services/",
      open: true,
      children: [
        {
          name: "payments/",
          open: true,
          children: [
            {
              name: "AGENTS.md",
              comment: "Ignored because an override exists",
            },
            {
              name: "AGENTS.override.md",
              comment: "Payments service rules",
              highlight: true,
            },
            { name: "README.md" },
          ],
        },
        {
          name: "search/",
          children: [{ name: "AGENTS.md" }, { name: "…", placeholder: true }],
        },
      ],
    },
  ]}
/>

## 自定义备用文件名

如果你的仓库已经使用了不同文件名（例如 `TEAM_GUIDE.md`），请将它添加到备用列表，让 Codex 像处理指令文件一样处理它。

1. 编辑你的 Codex 配置：

   ```toml
   # ~/.codex/config.toml
   project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
   project_doc_max_bytes = 65536
   ```

2. 重启 Codex，或运行新的命令，让更新后的配置加载。

现在 Codex 会按以下顺序检查每个目录：`AGENTS.override.md`、`AGENTS.md`、`TEAM_GUIDE.md`、`.agents.md`。不在此列表中的文件名会被指令发现忽略。更大的字节限制允许在截断前合并更多指导。

启用备用列表后，Codex 会将这些替代文件视为指令：

<FileTree
  class="mt-4"
  tree={[
    {
      name: "TEAM_GUIDE.md",
      comment: "Detected via fallback list",
      highlight: true,
    },
    {
      name: ".agents.md",
      comment: "Fallback file in root",
    },
    {
      name: "support/",
      open: true,
      children: [
        {
          name: "AGENTS.override.md",
          comment: "Overrides fallback guidance",
          highlight: true,
        },
        {
          name: "playbooks/",
          children: [{ name: "…", placeholder: true }],
        },
      ],
    },
  ]}
/>

当你想使用不同 profile（例如项目专用自动化用户）时，请设置 `CODEX_HOME` 环境变量：

```bash
CODEX_HOME=$(pwd)/.codex codex exec "List active instruction sources"
```

预期结果：输出列出相对于自定义 `.codex` 目录的文件。

## 验证你的设置

- 从仓库根目录运行 `codex --ask-for-approval never "Summarize the current instructions."`。Codex 应按优先级顺序回显来自全局和项目文件的指导。
- 使用 `codex --cd subdir --ask-for-approval never "Show which instruction files are active."` 确认嵌套覆盖会替换更宽泛的规则。
- 若要审计 Codex 加载了哪些指令文件，可以通过 `codex -c log_dir=./.codex-log` 主动启用明文 TUI 日志并检查 `./.codex-log/codex-tui.log`，或在启用了 session logging 时检查最近的 `session-*.jsonl` 文件。
- 如果指令看起来过期，请在目标目录重启 Codex。Codex 会在每次运行（以及每个 TUI session 开始时）重建指令链，因此没有需要手动清除的缓存。

## 排查发现问题

- **没有加载任何内容：** 确认你位于预期仓库中，且 `codex status` 报告的 workspace root 符合预期。确保指令文件有内容；Codex 会忽略空文件。
- **出现了错误指导：** 查找目录树更高处或 Codex home 下的 `AGENTS.override.md`。重命名或移除该覆盖即可回退到常规文件。
- **Codex 忽略备用名称：** 确认你在 `project_doc_fallback_filenames` 中列出的名称没有拼写错误，然后重启 Codex 让更新后的配置生效。
- **指令被截断：** 提高 `project_doc_max_bytes`，或将大型文件拆分到嵌套目录中，以保留关键指导。
- **Profile 混淆：** 启动 Codex 前运行 `echo $CODEX_HOME`。非默认值会让 Codex 指向与你编辑位置不同的 home 目录。

## 后续步骤

- 访问官方 [AGENTS.md](https://agents.md) 网站了解更多信息。
- 查看 [Prompting Codex](https://developers.openai.com/codex/prompting)，了解适合与持久指导配合使用的对话模式。
