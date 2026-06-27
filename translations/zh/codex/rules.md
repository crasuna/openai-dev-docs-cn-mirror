---
status: needs-review
sourceId: "a4888d1e8077"
sourceChecksum: "a4888d1e807734d4761ad0c0a55eba8b8b16d057d21de488b4c18f2668d598e0"
sourceUrl: "https://developers.openai.com/codex/rules"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# Rules

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

Codex 会在启动时扫描每个活动配置层下的 `rules/`，包括 [Team Config](https://developers.openai.com/codex/enterprise/admin-setup#team-config) 位置和位于 `~/.codex/rules/` 的用户层。只有当项目 `.codex/` 层被信任时，才会加载 `<repo>/.codex/rules/` 下的项目本地 rules。

当你在 TUI 中把命令加入允许列表时，Codex 会写入用户层的 `~/.codex/rules/default.rules`，这样未来运行时就可以跳过提示。

启用 Smart approvals（默认）时，Codex 可能会在升级权限请求期间为你建议一条 `prefix_rule`。接受之前，请仔细检查建议的前缀。

管理员也可以通过 [`requirements.toml`](https://developers.openai.com/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml) 强制执行限制性的 `prefix_rule` 条目。

## 理解 rule 字段

`prefix_rule()` 支持这些字段：

- `pattern` **（必需）**：一个非空列表，用来定义要匹配的命令前缀。每个元素可以是：
  - 字面量字符串（例如 `"pr"`）。
  - 字面量并集（例如 `["view", "list"]`），用于匹配该参数位置上的多个备选值。
- `decision` **（默认为 `"allow"`）**：rule 匹配时采取的动作。当多条 rule 匹配时，Codex 会应用最严格的 decision（`forbidden` > `prompt` > `allow`）。
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

- 重定向（`>`、`>>`、`<`）
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

