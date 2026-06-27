---
title: "Rules"
description: "Control which commands Codex can run outside the sandbox"
outline: deep
---

# Rules

**文档集**：Codex  
**分组**：Codex — Rules  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/rules](https://developers.openai.com/codex/rules)
- Markdown 来源：[https://developers.openai.com/codex/rules.md](https://developers.openai.com/codex/rules.md)
- 抓取时间：2026-06-27T05:55:05.974Z
- Checksum：`a4888d1e807734d4761ad0c0a55eba8b8b16d057d21de488b4c18f2668d598e0`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用 rules 控制 Codex 可以在 sandbox 之外运行哪些命令。

Rules 仍处于实验阶段，未来可能变化。

## 创建 rules 文件

1. 在某个活动配置层旁边的 `rules/` 文件夹下创建一个 `.rules` 文件（例如 `~/.codex/rules/default.rules`）。
2. 添加一条 rule。这个示例会在允许 `gh pr view` 在 sandbox 之外运行之前先提示。

```python
   # Prompt before running commands with the prefix `gh pr view` outside the sandbox.
   prefix_rule(
       # The prefix to match.
       pattern = ["gh", "pr", "view"],

       # The action to take when Codex requests to run a matching command.
       decision = "prompt",

       # Optional rationale for why this rule exists.
       justification = "Viewing PRs is allowed with approval",

       # `match` and `not_match` are optional "inline unit tests" where you can
       # provide examples of commands that should (or should not) match this rule.
       match = [
           "gh pr view 7888",
           "gh pr view --repo openai/codex",
           "gh pr view 7888 --json title,body,comments",
       ],
       not_match = [
           # Does not match because the `pattern` must be an exact prefix.
           "gh pr --repo openai/codex view 7888",
       ],
   )
```

3. 重启 Codex。

Codex 会在启动时扫描每个活动配置层下的 `rules/`，包括 [Team Config](/mirror/codex/enterprise/admin-setup#team-config) 位置和位于 `~/.codex/rules/` 的用户层。只有当项目 `.codex/` 层被信任时，才会加载 `&lt;repo&gt;/.codex/rules/` 下的项目本地 rules。

当你在 TUI 中把命令加入允许列表时，Codex 会写入用户层的 `~/.codex/rules/default.rules`，这样未来运行时就可以跳过提示。

启用 Smart approvals（默认）时，Codex 可能会在升级权限请求期间为你建议一条 `prefix_rule`。接受之前，请仔细检查建议的前缀。

管理员也可以通过 [`requirements.toml`](/mirror/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml) 强制执行限制性的 `prefix_rule` 条目。

## 理解 rule 字段

`prefix_rule()` 支持这些字段：

- `pattern` **（必需）**：一个非空列表，用来定义要匹配的命令前缀。每个元素可以是：
  - 字面量字符串（例如 `"pr"`）。
  - 字面量并集（例如 `["view", "list"]`），用于匹配该参数位置上的多个备选值。
- `decision` **（默认为 `"allow"`）**：rule 匹配时采取的动作。当多条 rule 匹配时，Codex 会应用最严格的 decision（`forbidden` &gt; `prompt` &gt; `allow`）。
  - `allow`：不提示，直接在 sandbox 之外运行命令。
  - `prompt`：每次匹配调用前都提示。
  - `forbidden`：不提示，直接阻止请求。
- `justification` **（可选）**：一个非空、面向人的 rule 原因。Codex 可能会在批准提示或拒绝消息中显示它。使用 `forbidden` 时，如果合适，请在 justification 中包含推荐替代方案（例如 `"Use \`rg\` instead of \`grep\`."`）。
- `match` 和 `not_match` **（默认为 `[]`）**：Codex 加载 rules 时会验证的示例。使用它们可以在 rule 生效前发现错误。

当 Codex 考虑运行某个命令时，它会把该命令的参数列表与 `pattern` 比较。在内部，Codex 会把命令视为参数列表（类似 `execvp(3)` 接收到的内容）。

## Shell 包装器和复合命令

有些工具会把多个 shell 命令包装进一次调用，例如：

```text
["bash", "-lc", "git add . && rm -rf /"]
```

由于这类命令可能把多个动作隐藏在一个字符串中，Codex 会特殊处理 `bash -lc`、`bash -c` 以及对应的 `zsh` / `sh` 形式。

### Codex 可以安全拆分脚本时

如果 shell 脚本是一个线性命令链，并且只由以下内容组成：

- 普通词元（没有变量展开、没有 `VAR=...`、`$FOO`、`*` 等）
- 通过安全操作符连接（`&&`、`||`、`;` 或 `|`）

那么 Codex 会解析它（使用 tree-sitter），并在应用你的 rules 之前将其拆分成单独的命令。

上面的脚本会被视为两个独立命令：

- `["git", "add", "."]`
- `["rm", "-rf", "/"]`

然后 Codex 会根据你的 rules 分别评估每个命令，并采用最严格的结果。

即使你允许 `pattern=["git", "add"]`，Codex 也不会自动允许 `git add . && rm -rf /`，因为其中的 `rm -rf /` 部分会被单独评估，并阻止整个调用被自动允许。

这可以防止危险命令夹带在安全命令旁边被绕过。

### Codex 不会拆分脚本时

如果脚本使用了更高级的 shell 特性，例如：

- 重定向（`&gt;`、`&gt;&gt;`、`&lt;`）
- 替换（`$(...)`、`...`）
- 环境变量（`FOO=bar`）
- 通配符模式（`*`、`?`）
- 控制流（`if`、`for`、带赋值的 `&&` 等）

那么 Codex 不会尝试解释或拆分它。

在这些情况下，整个调用会被视为：

```text
["bash", "-lc", "<full script>"]
```

并且你的 rules 会应用到这 **单个** 调用上。

通过这种处理方式，能安全拆分时你会得到按命令评估的安全性；不能安全拆分时则采用保守行为。

## 测试 rule 文件

使用 `codex execpolicy check` 测试你的 rules 如何应用到某个命令：

```shell
codex execpolicy check --pretty \
  --rules ~/.codex/rules/default.rules \
  -- gh pr view 7888 --json title,body,comments
```

该命令会输出 JSON，显示最严格的 decision 以及所有匹配的 rules，包括匹配 rules 中的任何 `justification` 值。使用多个 `--rules` 标志可以组合多个文件，添加 `--pretty` 可以格式化输出。

## 理解 rules 语言

`.rules` 文件格式使用 `Starlark`（参见[语言规范](https://github.com/bazelbuild/starlark/blob/master/spec.md)）。它的语法类似 Python，但设计目标是可安全运行：rules 引擎可以在没有副作用的情况下运行它（例如不会触碰文件系统）。

:::

## English source

::: details 展开英文原文
::: v-pre
Use rules to control which commands Codex can run outside the sandbox.

Rules are experimental and may change.

## Create a rules file

1. Create a `.rules` file under a `rules/` folder next to an active config layer (for example, `~/.codex/rules/default.rules`).
2. Add a rule. This example prompts before allowing `gh pr view` to run outside the sandbox.

```python
   # Prompt before running commands with the prefix `gh pr view` outside the sandbox.
   prefix_rule(
       # The prefix to match.
       pattern = ["gh", "pr", "view"],

       # The action to take when Codex requests to run a matching command.
       decision = "prompt",

       # Optional rationale for why this rule exists.
       justification = "Viewing PRs is allowed with approval",

       # `match` and `not_match` are optional "inline unit tests" where you can
       # provide examples of commands that should (or should not) match this rule.
       match = [
           "gh pr view 7888",
           "gh pr view --repo openai/codex",
           "gh pr view 7888 --json title,body,comments",
       ],
       not_match = [
           # Does not match because the `pattern` must be an exact prefix.
           "gh pr --repo openai/codex view 7888",
       ],
   )
```

3. Restart Codex.

Codex scans `rules/` under every active config layer at startup, including [Team Config](/mirror/codex/enterprise/admin-setup#team-config) locations and the user layer at `~/.codex/rules/`. Project-local rules under `&lt;repo&gt;/.codex/rules/` load only when the project `.codex/` layer is trusted.

When you add a command to the allow list in the TUI, Codex writes to the user layer at `~/.codex/rules/default.rules` so future runs can skip the prompt.

When Smart approvals are enabled (the default), Codex may propose a
`prefix_rule` for you during escalation requests. Review the suggested prefix
carefully before accepting it.

Admins can also enforce restrictive `prefix_rule` entries from
[`requirements.toml`](/mirror/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml).

## Understand rule fields

`prefix_rule()` supports these fields:

- `pattern` **(required)**: A non-empty list that defines the command prefix to match. Each element is either:
  - A literal string (for example, `"pr"`).
  - A union of literals (for example, `["view", "list"]`) to match alternatives at that argument position.
- `decision` **(defaults to `"allow"`)**: The action to take when the rule matches. Codex applies the most restrictive decision when more than one rule matches (`forbidden` &gt; `prompt` &gt; `allow`).
  - `allow`: Run the command outside the sandbox without prompting.
  - `prompt`: Prompt before each matching invocation.
  - `forbidden`: Block the request without prompting.
- `justification` **(optional)**: A non-empty, human-readable reason for the rule. Codex may surface it in approval prompts or rejection messages. When you use `forbidden`, include a recommended alternative in the justification when appropriate (for example, `"Use \`rg\` instead of \`grep\`."`).
- `match` and `not_match` **(defaults to `[]`)**: Examples that Codex validates when it loads your rules. Use these to catch mistakes before a rule takes effect.

When Codex considers a command to run, it compares the command's argument list to `pattern`. Internally, Codex treats the command as a list of arguments (like what `execvp(3)` receives).

## Shell wrappers and compound commands

Some tools wrap several shell commands into a single invocation, for example:

```text
["bash", "-lc", "git add . && rm -rf /"]
```

Because this kind of command can hide multiple actions inside one string, Codex treats `bash -lc`, `bash -c`, and their `zsh` / `sh` equivalents specially.

### When Codex can safely split the script

If the shell script is a linear chain of commands made only of:

- plain words (no variable expansion, no `VAR=...`, `$FOO`, `*`, etc.)
- joined by safe operators (`&&`, `||`, `;`, or `|`)

then Codex parses it (using tree-sitter) and splits it into individual commands before applying your rules.

The script above is treated as two separate commands:

- `["git", "add", "."]`
- `["rm", "-rf", "/"]`

Codex then evaluates each command against your rules, and the most restrictive result wins.

Even if you allow `pattern=["git", "add"]`, Codex won't auto allow `git add . && rm -rf /`, because the `rm -rf /` portion is evaluated separately and prevents the whole invocation from being auto allowed.

This prevents dangerous commands from being smuggled in alongside safe ones.

### When Codex does not split the script

If the script uses more advanced shell features, such as:

- redirection (`&gt;`, `&gt;&gt;`, `&lt;`)
- substitutions (`$(...)`, `...`)
- environment variables (`FOO=bar`)
- wildcard patterns (`*`, `?`)
- control flow (`if`, `for`, `&&` with assignments, etc.)

then Codex doesn't try to interpret or split it.

In those cases, the entire invocation is treated as:

```text
["bash", "-lc", "<full script>"]
```

and your rules are applied to that **single** invocation.

With this handling, you get the security of per-command evaluation when it's safe to do so, and conservative behavior when it isn't.

## Test a rule file

Use `codex execpolicy check` to test how your rules apply to a command:

```shell
codex execpolicy check --pretty \
  --rules ~/.codex/rules/default.rules \
  -- gh pr view 7888 --json title,body,comments
```

The command emits JSON showing the strictest decision and any matching rules, including any `justification` values from matched rules. Use more than one `--rules` flag to combine files, and add `--pretty` to format the output.

## Understand the rules language

The `.rules` file format uses `Starlark` (see the [language spec](https://github.com/bazelbuild/starlark/blob/master/spec.md)). Its syntax is like Python, but it's designed to be safe to run: the rules engine can run it without side effects (for example, touching the filesystem).

:::
:::

