---
status: needs-review
sourceId: "528b38daa180"
sourceChecksum: "528b38daa1808f4b2540b75c18a83d5ca588841f84c9ccde3cf444671cfae621"
sourceUrl: "https://developers.openai.com/api/docs/guides/tools-local-shell"
translatedAt: "2026-06-27T17:44:39.0189315+08:00"
translator: codex-gpt-5.5-xhigh
---

# Local shell 本地 Shell

local shell tool 已过时。对于新的用例，请改用 GPT-5.1 的
  [`shell`](https://developers.openai.com/api/docs/guides/tools-shell) tool。[了解更多](https://developers.openai.com/api/docs/guides/tools-shell)。

Local shell 是一种 tool，允许 agents 在你或用户提供的机器上本地运行 shell commands。它设计用于配合 [Codex CLI](https://github.com/openai/codex) 和 [`codex-mini-latest`](https://developers.openai.com/api/docs/models/codex-mini-latest) 使用。Commands 会在你自己的 runtime 中执行，**你可以完全控制实际运行哪些 commands**；API 只返回指令，但不会在 OpenAI 基础设施上执行这些指令。

Local shell 可通过 [Responses API](https://developers.openai.com/api/docs/guides/responses-vs-chat-completions) 与 [`codex-mini-latest`](https://developers.openai.com/api/docs/models/codex-mini-latest) 一起使用。它不适用于其他模型，也不能通过 Chat Completions API 使用。

运行任意 shell commands 可能很危险。在将 command 转发给系统 shell 之前，请务必对执行进行 sandboxing，或添加严格的 allow- / deny-lists。
<br />

参考实现请见 [Codex CLI](https://github.com/openai/codex)。

## 工作原理

local shell tool 使 agents 能够在一个可访问终端的连续 loop 中运行。

它会发送 shell commands，由你的代码在本地机器上执行这些 commands，然后把输出返回给模型。这个 loop 允许模型在无需用户额外干预的情况下完成 build-test-run loop。

作为你的代码的一部分，你需要实现一个 loop，监听 `local_shell_call` output items，并执行其中包含的 commands。我们强烈建议对这些 commands 的执行进行 sandboxing，以防执行任何意外 commands。



集成 local shell tool



以下是你需要遵循的高级步骤，用于在应用中集成 computer use tool：

1. **向模型发送请求**：
   将 `local_shell` tool 作为可用 tools 的一部分包含在内。

2. **接收模型响应**：
   检查响应中是否有任何 `local_shell_call` items。
   这个 tool call 包含类似 `exec` 的 action，以及要执行的 command。

3. **执行请求的 action**：
   在 computer 或 container 环境中通过代码执行对应 action。

4. **返回 action output**：
   执行 action 后，将 command output 和 status code 等 metadata 返回给模型。

5. **重复**：
   将更新后的状态作为 `local_shell_call_output` 发送新的请求，并重复此 loop，直到模型停止请求 actions，或你决定停止。

## 示例 workflow

下面是一个最小（Python）示例，展示 request/response loop。为简洁起见，省略了错误处理和安全检查；**不要在没有额外防护措施的生产环境中执行不受信任的 commands**。

```python
import os
import shlex
import subprocess
from openai import OpenAI

client = OpenAI()

# 1) Create the initial response request with the tool enabled
response = client.responses.create(
    model="codex-mini-latest",
    tools=[{"type": "local_shell"}],
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "List files in the current directory"},
            ],
        }
    ],
)

while True:
    # 2) Look for a local_shell_call in the model's output items
    shell_calls = []
    for item in response.output:
        item_type = getattr(item, "type", None)
        if item_type == "local_shell_call":
            shell_calls.append(item)
        elif item_type == "tool_call" and getattr(item, "tool_name", None) == "local_shell":
            shell_calls.append(item)
    if not shell_calls:
        # No more commands — the assistant is done.
        break

    call = shell_calls[0]
    args = getattr(call, "action", None) or getattr(call, "arguments", None)

    # 3) Execute the command locally (here we just trust the command!)
    #    The command is already split into argv tokens.
    def _get(obj, key, default=None):
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    timeout_ms = _get(args, "timeout_ms")
    command = _get(args, "command")
    if not command:
        break
    if isinstance(command, str):
        command = shlex.split(command)
    completed = subprocess.run(
        command,
        cwd=_get(args, "working_directory") or os.getcwd(),
        env={**os.environ, **(_get(args, "env") or {})},
        capture_output=True,
        text=True,
        timeout=(timeout_ms / 1000) if timeout_ms else None,
    )

    output_item = {
        "type": "local_shell_call_output",
        "call_id": getattr(call, "call_id", None),
        "output": completed.stdout + completed.stderr,
    }

    # 4) Send the output back to the model to continue the conversation
    response = client.responses.create(
        model="codex-mini-latest",
        tools=[{"type": "local_shell"}],
        previous_response_id=response.id,
        input=[output_item],
    )

# Print the assistant's final answer
print(response.output_text)
```


## 最佳实践

- 对执行进行 **sandbox 或 containerize**。可考虑使用 Docker、firejail 或 jailed user account。
- **施加资源限制**（时间、内存、网络）。模型提供的 `timeout_ms` 只是提示，你应该强制执行自己的限制。
- 对高风险 commands（例如 `rm`、`curl`、network utilities）进行 **过滤或仔细审查**。
- **记录每条 command 及其 output**，以便审计和调试。

### 错误处理

如果 command 在你这一侧失败（非零 exit code、timeout 等），你仍然可以发送 `local_shell_call_output`；请在 `output` 字段中包含错误消息。

模型可以选择恢复，或尝试执行不同的 command。如果你发送的数据格式错误（例如缺少 `call_id`），API 会返回标准的 `400` validation error。
