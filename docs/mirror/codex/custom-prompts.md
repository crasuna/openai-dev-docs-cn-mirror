---
title: "自定义提示词"
description: "Deprecated. Use skills for reusable prompts"
outline: deep
---

# 自定义提示词

**文档集**：Codex<br>
**分组**：自定义提示<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/custom-prompts](https://developers.openai.com/codex/custom-prompts)
- Markdown 来源：[https://developers.openai.com/codex/custom-prompts.md](https://developers.openai.com/codex/custom-prompts.md)
- 抓取时间：2026-06-27T05:54:56.822Z
- Checksum：`1456adde32c0cfeb9aaec5c5c4413f52fb546bbefc854554c7b600c1110fe70c`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
自定义提示词已弃用。请使用 [skills](/mirror/codex/skills)，用于 Codex 可以显式或隐式调用的可复用指令。

自定义提示词（已弃用）可将 Markdown 文件变成可复用提示词，并可在 Codex CLI 和 Codex IDE 扩展中作为斜杠命令调用。

自定义提示词需要显式调用，并存放在你的本地 Codex 主目录中（例如 `~/.codex`），因此不会通过你的仓库共享。如果你想共享一个提示词（或希望 Codex 隐式调用它），请[使用 skills](/mirror/codex/skills)。

1. 创建 prompts 目录：

```bash
   mkdir -p ~/.codex/prompts
```

2. 创建包含可复用指导的 `~/.codex/prompts/draftpr.md`：

```markdown
   ---
   description: Prep a branch, commit, and open a draft PR
   argument-hint: [FILES=<paths>] [PR_TITLE="<title>"]
   ---

   Create a branch named `dev/<feature_name>` for this work.
   If files are specified, stage them first: $FILES.
   Commit the staged changes with a clear message.
   Open a draft PR on the same branch. Use $PR_TITLE when supplied; otherwise write a concise summary yourself.
```

3. 重启 Codex，使其加载新提示词（重启你的 CLI 会话；如果你使用 IDE 扩展，也请重新加载该扩展）。

预期结果：在斜杠命令菜单中输入 `/prompts:draftpr` 时，会显示你的自定义命令，其中包含 front matter 中的描述，并提示文件和 PR 标题是可选参数。

## 添加元数据和参数

Codex 会在下一次会话启动时读取提示词元数据并解析占位符。

- **描述：** 显示在弹窗中的命令名称下方。请在 YAML front matter 中通过 `description:` 设置。
- **参数提示：** 使用 `argument-hint: KEY=&lt;value&gt;` 记录预期参数。
- **位置占位符：** `$1` 到 `$9` 会根据你在命令后提供的空格分隔参数展开。`$ARGUMENTS` 包含所有这些参数。
- **命名占位符：** 使用类似 `$FILE` 或 `$TICKET_ID` 的大写名称，并以 `KEY=value` 形式提供值。包含空格的值请加引号（例如 `FOCUS="loading state"`）。
- **字面量美元符号：** 写入 `$$` 可在展开后的提示词中输出单个 `$`。

编辑提示词文件后，请重启 Codex 或打开新聊天，以便加载更新。Codex 会忽略 prompts 目录中的非 Markdown 文件。

## 调用和管理自定义命令

1. 在 Codex（CLI 或 IDE 扩展）中输入 `/` 打开斜杠命令菜单。
2. 输入 `prompts:` 或提示词名称，例如 `/prompts:draftpr`。
3. 提供必需参数：

```text
   /prompts:draftpr FILES="src/pages/index.astro src/lib/api.ts" PR_TITLE="Add hero animation"
```

4. 按 Enter 发送展开后的指令（不需要某个参数时可以省略）。

预期结果：Codex 会展开 `draftpr.md` 的内容，用你提供的参数替换占位符，然后将结果作为消息发送。

通过编辑或删除 `~/.codex/prompts/` 下的文件来管理提示词。Codex 只扫描该文件夹顶层的 Markdown 文件，因此请将每个自定义提示词直接放在 `~/.codex/prompts/` 下，而不是放在子目录中。

:::

## English source

::: details 展开英文原文
::: v-pre
Custom prompts are deprecated. Use [skills](/mirror/codex/skills) for reusable
  instructions that Codex can invoke explicitly or implicitly.

Custom prompts (deprecated) let you turn Markdown files into reusable prompts that you can invoke as slash commands in both the Codex CLI and the Codex IDE extension.

Custom prompts require explicit invocation and live in your local Codex home directory (for example, `~/.codex`), so they're not shared through your repository. If you want to share a prompt (or want Codex to implicitly invoke it), [use skills](/mirror/codex/skills).

1. Create the prompts directory:

```bash
   mkdir -p ~/.codex/prompts
```

2. Create `~/.codex/prompts/draftpr.md` with reusable guidance:

```markdown
   ---
   description: Prep a branch, commit, and open a draft PR
   argument-hint: [FILES=<paths>] [PR_TITLE="<title>"]
   ---

   Create a branch named `dev/<feature_name>` for this work.
   If files are specified, stage them first: $FILES.
   Commit the staged changes with a clear message.
   Open a draft PR on the same branch. Use $PR_TITLE when supplied; otherwise write a concise summary yourself.
```

3. Restart Codex so it loads the new prompt (restart your CLI session, and reload the IDE extension if you are using it).

Expected: Typing `/prompts:draftpr` in the slash command menu shows your custom command with the description from the front matter and hints that files and a PR title are optional.

## Add metadata and arguments

Codex reads prompt metadata and resolves placeholders the next time the session starts.

- **Description:** Shown under the command name in the popup. Set it in YAML front matter as `description:`.
- **Argument hint:** Document expected parameters with `argument-hint: KEY=&lt;value&gt;`.
- **Positional placeholders:** `$1` through `$9` expand from space-separated arguments you provide after the command. `$ARGUMENTS` includes them all.
- **Named placeholders:** Use uppercase names like `$FILE` or `$TICKET_ID` and supply values as `KEY=value`. Quote values with spaces (for example, `FOCUS="loading state"`).
- **Literal dollar signs:** Write `$$` to emit a single `$` in the expanded prompt.

After editing prompt files, restart Codex or open a new chat so the updates load. Codex ignores non-Markdown files in the prompts directory.

## Invoke and manage custom commands

1. In Codex (CLI or IDE extension), type `/` to open the slash command menu.
2. Enter `prompts:` or the prompt name, for example `/prompts:draftpr`.
3. Supply required arguments:

```text
   /prompts:draftpr FILES="src/pages/index.astro src/lib/api.ts" PR_TITLE="Add hero animation"
```

4. Press Enter to send the expanded instructions (skip either argument when you don't need it).

Expected: Codex expands the content of `draftpr.md`, replacing placeholders with the arguments you supplied, then sends the result as a message.

Manage prompts by editing or deleting files under `~/.codex/prompts/`. Codex scans only the top-level Markdown files in that folder, so place each custom prompt directly under `~/.codex/prompts/` rather than in subdirectories.

:::
:::

