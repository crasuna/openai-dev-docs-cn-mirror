---
title: "Apply Patch"
description: "Allow models to propose structured diffs that your integration applies."
outline: deep
---

# Apply Patch

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/tools-apply-patch](https://developers.openai.com/api/docs/guides/tools-apply-patch)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/tools-apply-patch.md](https://developers.openai.com/api/docs/guides/tools-apply-patch.md)
- 抓取时间：2026-06-27T05:54:09.768Z
- Checksum：`94af4baa00f50e8aa7bc1e39a0472ee06ae8c2be7b97205abb90a507016797b6`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
`apply_patch` 工具让 GPT-5.1 能够使用结构化 diff 在你的代码库中创建、更新和删除文件。模型不只是建议修改，而是发出由你的应用负责应用并回报结果的 patch 操作，从而支持迭代式、多步骤的代码编辑工作流。

## 何时使用

以下是一些适合使用 apply_patch 的常见场景：

- **多文件重构**：一次性跨多个文件重命名符号、抽取 helper，或重组模块。
- **Bug 修复**：让模型既诊断问题，又发出精确 patch。
- **测试与文档生成**：在代码变更旁边创建新的测试文件、fixture 和文档。
- **迁移与机械性编辑**：应用重复、结构化的更新，例如 API 迁移、类型注解、格式修复等。

如果你能用文本描述你的 repo 和期望的变更，apply_patch 通常就能生成对应的 diff。

## 在 Responses API 中使用 apply patch 工具

从高层看，在 Responses API 中使用 `apply_patch` 的流程如下：

1. **带上 `apply_patch` 工具调用 Responses API**
   - 在 `input` 中向模型提供可用文件的上下文（或摘要），也可以给模型用于探索文件系统的工具。
   - 使用 `tools=[{"type": "apply_patch"}]` 启用该工具。
2. **让模型返回一个或多个 patch 操作**
   - Response 输出包含一个或多个 `apply_patch_call` 对象。
   - 每个调用描述一次文件操作：创建、更新或删除。
3. **在你的环境中应用 patch**
   - 运行一个 patch harness 或脚本，用来：
     - 解读每个 `apply_patch_call` 中的 `operation` diff。
     - 将 patch 应用到你的工作目录或 repo。
     - 记录每个 patch 是否成功，以及任何日志或错误消息。
4. **把 patch 结果回报给模型**
   - 再次调用 Responses API，可以使用 `previous_response_id`，也可以把 conversation item 传回 `input`。
   - 为每个 `call_id` 包含一条 `apply_patch_call_output` 事件，其中带有 `status` 和可选的 `output` 字符串。
   - 保持 `tools=[{"type": "apply_patch"}]`，这样模型在需要时可以继续编辑。
5. **让模型继续或解释变更**
   - 模型可能会继续发出更多 `apply_patch_call` 操作，或者
   - 提供面向人的解释，说明它改了什么以及为什么。

## 示例：使用 Apply Patch Tool 重命名函数

**步骤 1：要求模型规划并发出 patch**

要求模型规划并发出 patch

```python
from openai import OpenAI

client = OpenAI()

# For brevity, we are including file context in the example input.
# Most agentic use cases should instead equip the model with tools
# for exploring file system state.
RESPONSE_INPUT = """
The user has the following files:
<BEGIN_FILES>
===== lib/fib.py
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

===== run.py
from lib.fib import fib

def main():
  print(fib(42))
<END_FILES>

You are a helpful coding assistant that should assist the user with whatever they
ask.

User query:
Help me rename the fib() function to fibonacci()
"""

response = client.responses.create(
    model="gpt-5.5",
    input=RESPONSE_INPUT,
    tools=[{"type": "apply_patch"}],
)

# response.output may contain multiple apply_patch_call entries, e.g.:
# - update lib/fib.py
# - update run.py
patch_calls = [
    item for item in response.output
    if item["type"] == "apply_patch_call"
]
```


**`apply_patch_call` 对象示例**

apply_patch_call 对象示例

```json
{
    "id": "apc_08f3d96c87a585390069118b594f7481a088b16cda7d9415fe",
    "type": "apply_patch_call",
    "status": "completed",
    "call_id": "call_Rjsqzz96C5xzPb0jUWJFRTNW",
    "operation": {
        "type": "update_file",
        "diff": "
@@
-def fib(n):
+def fibonacci(n):
    if n <= 1:
        return n
-    return fib(n-1) + fib(n-2)                                                  +    return fibonacci(n-1) + fibonacci(n-2),
",
        "path": "lib/fib.py"
    }
}
```


**步骤 2：应用 patch 并把结果发回**

应用 patch 并返回结果

```python
from apply_patch_harness import apply_operation  # your implementation

results = []
for call in patch_calls:
    op = call["operation"]
    success, maybe_log_output = apply_operation(op)

    results.append({
        "type": "apply_patch_call_output",
        "call_id": call["call_id"],
        "status": "completed" if success else "failed",
        "output": maybe_log_output,
    })

followup = client.responses.create(
    model="gpt-5.5",
    previous_response_id=response.id,
    input=results,
    tools=[{"type": "apply_patch"}],
)
```


如果某个 patch 失败（例如文件不存在），请将 `status` 设为 `"failed"`，并包含有帮助的 `output` 字符串，让模型能够恢复：

报告失败的 apply_patch 调用

```json
{
  "type": "apply_patch_call_output",
  "call_id": "call_cNWm41dB3RyQcLNOVTIPBWZU",
  "status": "failed",
  "output": "Could not apply patch to lib/foo.py — file not found on disk"
}
```


## Apply patch 操作

| 操作类型      | 用途                       | 负载                                                          |
| ------------- | -------------------------- | ------------------------------------------------------------- |
| `create_file` | 在 `path` 创建新文件。     | `diff` 是表示完整文件内容的 V4A diff。                       |
| `update_file` | 修改 `path` 处的现有文件。 | `diff` 是带有添加、删除或替换的 V4A diff。                   |
| `delete_file` | 移除 `path` 处的文件。     | 没有 `diff`；完整删除该文件。                                |

你的 patch harness 负责解读 V4A diff 格式并应用变更。参考实现可见 [Python Agents SDK](https://github.com/openai/openai-agents-python/blob/main/src/agents/apply_diff.py) 或 [TypeScript Agents SDK](https://github.com/openai/openai-agents-js/blob/main/packages/agents-core/src/utils/applyDiff.ts) 代码。

## 实现 patch harness

使用 `apply_patch` 工具时，你不需要提供 input schema；模型知道如何构造 `operation` 对象。你的工作是：

1. **从 Response 中解析操作**
   - 扫描 Response，找出 `type: "apply_patch_call"` 的 item。
   - 对每个调用，检查 `operation.type`、`operation.path` 以及任何可能的 `diff`。
2. **应用文件操作**
   - 对于 `create_file` 和 `update_file`，将 V4A diff 应用到文件系统或内存工作区。
   - 对于 `delete_file`，移除 `path` 处的文件。
   - 记录每个操作是否成功，以及任何日志或错误消息。
3. **返回 `apply_patch_call_output` 事件**
   - 对每个 `call_id`，恰好发出一条 `apply_patch_call_output` 事件，其中包含：
     - 如果操作成功应用，设置 `status: "completed"`。
     - 如果遇到错误，设置 `status: "failed"`，并包含一段简短、面向人的 `output` 字符串。

### 安全性与健壮性

- **路径验证**：防止目录遍历，并把编辑限制在允许的目录内。
- **备份**：在应用 patch 前，考虑备份文件（或在临时副本中工作）。
- **错误处理**：当 patch 无法应用时，始终返回带有说明性 `output` 字符串的 `failed` 状态。
- **原子性**：决定你想要“全有或全无”语义（如果任何 patch 失败则回滚），还是逐文件记录成功/失败。

## 使用 Agents SDK 调用 apply patch 工具

另一种方式是使用 [Agents SDK](/mirror/api/docs/guides/tools#usage-in-the-agents-sdk) 来调用 apply patch 工具。你仍然需要实现处理实际文件操作的 harness，但可以使用 `applyDiff` 函数来处理 diff。

通过 Agents SDK 使用 apply patch 工具

```javascript
import { applyDiff, Agent, run, applyPatchTool, Editor } from "@openai/agents";

class WorkspaceEditor implements Editor {
  async createFile(operation) {
    // convert the diff to the file content
    const content = applyDiff("", operation.diff, "create");
    // write the file content to the file system
    return { status: "completed", output: `Created ${operation.path}` };
  }

  async updateFile(operation) {
    // read the file content from the file system
    const current = "";
    // convert the diff to the new file content
    const newContent = applyDiff(current, operation.diff);
    // write the updated file content to the file system
    return { status: "completed", output: `Updated ${operation.path}` };
  }

  async deleteFile(operation) {
    // delete the file from the file system
    return { status: "completed", output: `Deleted ${operation.path}` };
  }
}

const editor = new WorkspaceEditor();

const agent = new Agent({
  name: "Patch Assistant",
  model: "gpt-5.5",
  instructions: "You can edit files inside the /tmp directory using the apply_patch tool.",
  tools: [
    applyPatchTool({
      editor,
      // could also be a function for you to determine if approval is needed
      needsApproval: true,
      onApproval: async (_ctx, _approvalItem) => {
        // create your own approval logic
        return { approve: true };
      },
    }),
  ],
});

const result = await run(
  agent,
  "Create tasks.md with a shopping checklist of 5 entries."
);

console.log(`\nFinal response:\n${result.finalOutput}`);
```

```python
from agents import Agent, ApplyPatchTool, Runner, apply_diff


class WorkspaceEditor:
    async def create_file(self, operation):
        # convert the diff to the file content
        content = apply_diff("", operation.diff, create=True)
        # write the file content to the file system
        return {"status": "completed", "output": f"Created {operation.path}"}

    async def update_file(self, operation):
        # read the file content from the file system
        current = ""
        # convert the diff to the new file content
        new_content = apply_diff(current, operation.diff)
        # write the updated file content to the file system
        return {"status": "completed", "output": f"Updated {operation.path}"}

    async def delete_file(self, operation):
        # delete the file from the file system
        return {"status": "completed", "output": f"Deleted {operation.path}"}


editor = WorkspaceEditor()

agent = Agent(
    name="Patch Assistant",
    model="gpt-5.5",
    instructions="You can edit files inside the /tmp directory using the apply_patch tool.",
    tools=[
        ApplyPatchTool(
            editor=editor,
            # could also be a function for you to determine if approval is needed
            needs_approval=True,
            # Implement your own approval logic
            on_approval=lambda _ctx, _approval_item: {"approve": True},
        ),
    ],
)


async def main():
    result = await Runner.run(
        agent,
        input="Create tasks.md with a shopping checklist of 5 entries.",
    )

    print(f"\nFinal response:\n{result.final_output}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
```


你可以在 GitHub 上找到完整可运行示例。

&lt;a
  href="https://github.com/openai/openai-agents-js/blob/main/examples/tools/applyPatch.ts"
  target="_blank"
  rel="noreferrer"
&gt;
  



    在 TypeScript 中通过 Agents SDK 使用 apply patch 工具的示例




&lt;a
  href="https://github.com/openai/openai-agents-python/blob/main/examples/tools/apply_patch.py"
  target="_blank"
  rel="noreferrer"
&gt;
  



    在 Python 中通过 Agents SDK 使用 apply patch 工具的示例




## 处理常见错误

使用 `status: "failed"` 加上一条清晰的 `output` 消息，帮助模型恢复。




File not found
    文件不存在错误

```json
{
  "type": "apply_patch_call_output",
  "call_id": "call_abc",
  "status": "failed",
  "output": "Error: File not found at path 'lib/baz.py'"
}
```



Patch conflict
    Patch 冲突错误

```json
{
  "type": "apply_patch_call_output",
  "call_id": "call_abc",
  "status": "failed",
  "output": "Error: Invalid Context:\n@@ def fib(n):"
}
```





随后模型可以基于这些错误消息调整后续 diff，例如在你的 prompt 中重新读取文件，或简化变更。

## 最佳实践

- **提供清晰的文件上下文**
  - 调用 Responses API 时，请包含文件的内联快照（如示例所示），或者给模型用于探索文件系统的工具。
- **考虑与 `shell` 工具结合使用**
  - 与 `shell` 工具结合时，模型可以探索文件系统目录、读取文件并 grep 关键字，从而支持 agentic 的文件发现和编辑。
- **鼓励小而聚焦的 diff**
  - 在系统指令中引导模型生成最小、目标明确的编辑，而不是大规模重写。
- **确保变更能干净应用**
  - 完成一系列 patch 后，运行测试或 linter，并在下一次 `input` 中分享失败信息，让模型可以修复。

## 使用说明





API 可用性
支持的模型





      [Responses](https://developers.openai.com/api/docs/api-reference/responses)


      [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat)


      [Assistants](https://developers.openai.com/api/docs/api-reference/assistants)



    [GPT-5.5](https://developers.openai.com/api/docs/models/gpt-5.5)

    [GPT-5.4](https://developers.openai.com/api/docs/models/gpt-5.4)

    [GPT-5.2](https://developers.openai.com/api/docs/models/gpt-5.2)

    [GPT-5.1](https://developers.openai.com/api/docs/models/gpt-5.1)






:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
The `apply_patch` tool lets GPT-5.1 create, update, and delete files in your codebase using structured diffs. Instead of just suggesting edits, the model emits patch operations that your application applies and then reports back on, enabling iterative, multi-step code editing workflows.

## When to use

Some common scenarios where you would use apply_patch:

- **Multi-file refactors** – Rename symbols, extract helpers, or reorganize modules across many files at once.
- **Bug fixes** – Have the model both diagnose issues and emit precise patches.
- **Tests & docs generation** – Create new test files, fixtures, and documentation alongside code changes.
- **Migrations & mechanical edits** – Apply repetitive, structured updates (API migrations, type annotations, formatting fixes, etc.).

If you can describe your repo and desired change in text, apply_patch can usually generate the corresponding diffs.

## Use apply patch tool with Responses API

At a high level, using `apply_patch` with the Responses API looks like this:

1. **Call the Responses API with the `apply_patch` tool**
   - Provide the model with context about available files (or a summary) in your `input`, or give the model tools for exploring your file system.
   - Enable the tool with `tools=[{"type": "apply_patch"}]`.
2. **Let the model return one or more patch operations**
   - The Response output includes one or more `apply_patch_call` objects.
   - Each call describes a single file operation: create, update, or delete.
3. **Apply patches in your environment**
   - Run a patch harness or script that:
     - Interprets the `operation` diff for each `apply_patch_call`.
     - Applies the patch to your working directory or repo.
     - Records whether each patch succeeded and any logs or error messages.
4. **Report patch results back to the model**
   - Call the Responses API again, either with `previous_response_id` or by passing back your conversation items into `input`.
   - Include an `apply_patch_call_output` event for each `call_id`, with a `status` and optional `output` string.
   - Keep `tools=[{"type": "apply_patch"}]` so the model can continue editing if needed.
5. **Let the model continue or explain changes**
   - The model may issue more `apply_patch_call` operations, or
   - Provide a human-facing explanation of what it changed and why.

## Example: Renaming a function with Apply Patch Tool

**Step 1: Ask the model to plan and emit patches**

Ask the model to plan and emit patches

```python
from openai import OpenAI

client = OpenAI()

# For brevity, we are including file context in the example input.
# Most agentic use cases should instead equip the model with tools
# for exploring file system state.
RESPONSE_INPUT = """
The user has the following files:
<BEGIN_FILES>
===== lib/fib.py
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

===== run.py
from lib.fib import fib

def main():
  print(fib(42))
<END_FILES>

You are a helpful coding assistant that should assist the user with whatever they
ask.

User query:
Help me rename the fib() function to fibonacci()
"""

response = client.responses.create(
    model="gpt-5.5",
    input=RESPONSE_INPUT,
    tools=[{"type": "apply_patch"}],
)

# response.output may contain multiple apply_patch_call entries, e.g.:
# - update lib/fib.py
# - update run.py
patch_calls = [
    item for item in response.output
    if item["type"] == "apply_patch_call"
]
```


**Example `apply_patch_call` object**

Example apply_patch_call object

```json
{
    "id": "apc_08f3d96c87a585390069118b594f7481a088b16cda7d9415fe",
    "type": "apply_patch_call",
    "status": "completed",
    "call_id": "call_Rjsqzz96C5xzPb0jUWJFRTNW",
    "operation": {
        "type": "update_file",
        "diff": "
@@
-def fib(n):
+def fibonacci(n):
    if n <= 1:
        return n
-    return fib(n-1) + fib(n-2)                                                  +    return fibonacci(n-1) + fibonacci(n-2),
",
        "path": "lib/fib.py"
    }
}
```


**Step 2: Apply the patch and send results back**

Apply the patch and return results

```python
from apply_patch_harness import apply_operation  # your implementation

results = []
for call in patch_calls:
    op = call["operation"]
    success, maybe_log_output = apply_operation(op)

    results.append({
        "type": "apply_patch_call_output",
        "call_id": call["call_id"],
        "status": "completed" if success else "failed",
        "output": maybe_log_output,
    })

followup = client.responses.create(
    model="gpt-5.5",
    previous_response_id=response.id,
    input=results,
    tools=[{"type": "apply_patch"}],
)
```


If a patch fails (for example, file not found), set `status: "failed"` and include a helpful `output` string so the model can recover:

Report a failed apply_patch call

```json
{
  "type": "apply_patch_call_output",
  "call_id": "call_cNWm41dB3RyQcLNOVTIPBWZU",
  "status": "failed",
  "output": "Could not apply patch to lib/foo.py — file not found on disk"
}
```


## Apply patch operations

| Operation Type | Purpose                            | Payload                                                          |
| -------------- | ---------------------------------- | ---------------------------------------------------------------- |
| `create_file`  | Create a new file at `path`.       | `diff` is a V4A diff representing the full file contents.        |
| `update_file`  | Modify an existing file at `path`. | `diff` is a V4A diff with additions, deletions, or replacements. |
| `delete_file`  | Remove a file at `path`.           | No `diff`; delete the file entirely.                             |

Your patch harness is responsible for interpreting the V4A diff format and applying changes. For reference implementations, see the [Python Agents SDK](https://github.com/openai/openai-agents-python/blob/main/src/agents/apply_diff.py) or [TypeScript Agents SDK](https://github.com/openai/openai-agents-js/blob/main/packages/agents-core/src/utils/applyDiff.ts) code.

## Implementing the patch harness

When using the `apply_patch` tool, you don’t provide an input schema; the model knows how to construct `operation` objects. Your job is to:

1. **Parse operations from the Response**
   - Scan the Response for items with `type: "apply_patch_call"`.
   - For each call, inspect `operation.type`, `operation.path`, and any potential `diff`.
2. **Apply file operations**
   - For `create_file` and `update_file`, apply the V4A diff to the file system or in-memory workspace.
   - For `delete_file`, remove the file at `path`.
   - Record whether each operation succeeded and any logs or error messages.
3. **Return `apply_patch_call_output` events**
   - For each `call_id`, emit exactly one `apply_patch_call_output` event with:
     - `status: "completed"` if the operation was applied successfully.
     - `status: "failed"` if you encountered an error (include a short human-readable `output` string).

### Safety and robustness

- **Path validation**: Prevent directory traversal and restrict edits to allowed directories.
- **Backups**: Consider backing up files (or working in a scratch copy) before applying patches.
- **Error handling**: Always return a `failed` status with an informative `output` string when patches cannot be applied.
- **Atomicity**: Decide whether you want “all-or-nothing” semantics (rollback if any patch fails) or per-file success/failure.

## Use the apply patch tool with the Agents SDK

Alternatively, you can use the [Agents SDK](https://developers.openai.com/api/docs/guides/tools#usage-in-the-agents-sdk) to use the apply patch tool. You'll still have to implement the harness that handles the actual file operations but you can use the `applyDiff` function to handle the diff processing.

Use the apply patch tool with the Agents SDK

```javascript
import { applyDiff, Agent, run, applyPatchTool, Editor } from "@openai/agents";

class WorkspaceEditor implements Editor {
  async createFile(operation) {
    // convert the diff to the file content
    const content = applyDiff("", operation.diff, "create");
    // write the file content to the file system
    return { status: "completed", output: `Created ${operation.path}` };
  }

  async updateFile(operation) {
    // read the file content from the file system
    const current = "";
    // convert the diff to the new file content
    const newContent = applyDiff(current, operation.diff);
    // write the updated file content to the file system
    return { status: "completed", output: `Updated ${operation.path}` };
  }

  async deleteFile(operation) {
    // delete the file from the file system
    return { status: "completed", output: `Deleted ${operation.path}` };
  }
}

const editor = new WorkspaceEditor();

const agent = new Agent({
  name: "Patch Assistant",
  model: "gpt-5.5",
  instructions: "You can edit files inside the /tmp directory using the apply_patch tool.",
  tools: [
    applyPatchTool({
      editor,
      // could also be a function for you to determine if approval is needed
      needsApproval: true,
      onApproval: async (_ctx, _approvalItem) => {
        // create your own approval logic
        return { approve: true };
      },
    }),
  ],
});

const result = await run(
  agent,
  "Create tasks.md with a shopping checklist of 5 entries."
);

console.log(`\nFinal response:\n${result.finalOutput}`);
```

```python
from agents import Agent, ApplyPatchTool, Runner, apply_diff


class WorkspaceEditor:
    async def create_file(self, operation):
        # convert the diff to the file content
        content = apply_diff("", operation.diff, create=True)
        # write the file content to the file system
        return {"status": "completed", "output": f"Created {operation.path}"}

    async def update_file(self, operation):
        # read the file content from the file system
        current = ""
        # convert the diff to the new file content
        new_content = apply_diff(current, operation.diff)
        # write the updated file content to the file system
        return {"status": "completed", "output": f"Updated {operation.path}"}

    async def delete_file(self, operation):
        # delete the file from the file system
        return {"status": "completed", "output": f"Deleted {operation.path}"}


editor = WorkspaceEditor()

agent = Agent(
    name="Patch Assistant",
    model="gpt-5.5",
    instructions="You can edit files inside the /tmp directory using the apply_patch tool.",
    tools=[
        ApplyPatchTool(
            editor=editor,
            # could also be a function for you to determine if approval is needed
            needs_approval=True,
            # Implement your own approval logic
            on_approval=lambda _ctx, _approval_item: {"approve": True},
        ),
    ],
)


async def main():
    result = await Runner.run(
        agent,
        input="Create tasks.md with a shopping checklist of 5 entries.",
    )

    print(f"\nFinal response:\n{result.final_output}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
```


You can find full working examples on GitHub.

<a
  href="https://github.com/openai/openai-agents-js/blob/main/examples/tools/applyPatch.ts"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Example of how to use the apply patch tool with the Agents SDK in TypeScript


</a>

<a
  href="https://github.com/openai/openai-agents-python/blob/main/examples/tools/apply_patch.py"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Example of how to use the apply patch tool with the Agents SDK in Python


</a>

## Handling common errors

Use `status: "failed"` plus a clear `output` message to help the model recover.



<div data-content-switcher-pane data-value="file-missing">
    <div class="hidden">File not found</div>
    File not found error

```json
{
  "type": "apply_patch_call_output",
  "call_id": "call_abc",
  "status": "failed",
  "output": "Error: File not found at path 'lib/baz.py'"
}
```

  </div>
  <div data-content-switcher-pane data-value="patch-conflict" hidden>
    <div class="hidden">Patch conflict</div>
    Patch conflict error

```json
{
  "type": "apply_patch_call_output",
  "call_id": "call_abc",
  "status": "failed",
  "output": "Error: Invalid Context:\n@@ def fib(n):"
}
```

  </div>



The model can then adjust future diffs (for example, by re-reading a file in your prompt or simplifying a change) based on these error messages.

## Best practices

- **Give clear file context**
  - When you call the Responses API, include either an inline snapshot of your files (as in the example), or give the model tools for exploring your filesystem (like the `shell` tool).
- **Consider using with the `shell` tool**
  - When used in conjunction with the `shell` tool, the model can explore file system directories, read files, and grep for keywords, enabling agentic file discovery and editing.
- **Encourage small, focused diffs**
  - In your system instructions, nudge the model toward minimal, targeted edits rather than huge rewrites.
- **Make sure changes apply cleanly**
  - After a series of patches, run your tests or linters and share failures back in the next `input` so the model can fix them.

## Usage notes

<table>
<tbody>

<tr>
  <th>API Availability</th>
  <th>Supported models</th>
</tr>

<tr>
  <td>
    <div className="mb-1 flex items-center gap-2">
      [Responses](https://developers.openai.com/api/docs/api-reference/responses)
    </div>
    <div className="mb-1 flex items-center gap-2">
      [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat)
    </div>
    <div className="mb-1 flex items-center gap-2">
      [Assistants](https://developers.openai.com/api/docs/api-reference/assistants)
    </div>
  </td>
  <td style={{ maxWidth: "150px" }}>
    [GPT-5.5](https://developers.openai.com/api/docs/models/gpt-5.5)
    <br />
    [GPT-5.4](https://developers.openai.com/api/docs/models/gpt-5.4)
    <br />
    [GPT-5.2](https://developers.openai.com/api/docs/models/gpt-5.2)
    <br />
    [GPT-5.1](https://developers.openai.com/api/docs/models/gpt-5.1)
  </td>
</tr>

</tbody>
</table>
``````
:::
:::

