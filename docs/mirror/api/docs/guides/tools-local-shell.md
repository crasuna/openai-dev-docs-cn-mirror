---
title: "Local shell 本地 Shell"
description: "Enable agents to run commands in a local shell."
outline: deep
---

# Local shell 本地 Shell

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/tools-local-shell](https://developers.openai.com/api/docs/guides/tools-local-shell)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/tools-local-shell.md](https://developers.openai.com/api/docs/guides/tools-local-shell.md)
- 抓取时间：2026-06-27T05:54:10.341Z
- Checksum：`528b38daa1808f4b2540b75c18a83d5ca588841f84c9ccde3cf444671cfae621`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
local shell tool 已过时。对于新的用例，请改用 GPT-5.1 的
  [`shell`](/mirror/api/docs/guides/tools-shell) tool。[了解更多](/mirror/api/docs/guides/tools-shell)。

Local shell 是一种 tool，允许 agents 在你或用户提供的机器上本地运行 shell commands。它设计用于配合 [Codex CLI](https://github.com/openai/codex) 和 [`codex-mini-latest`](https://developers.openai.com/api/docs/models/codex-mini-latest) 使用。Commands 会在你自己的 runtime 中执行，**你可以完全控制实际运行哪些 commands**；API 只返回指令，但不会在 OpenAI 基础设施上执行这些指令。

Local shell 可通过 [Responses API](https://developers.openai.com/api/docs/guides/responses-vs-chat-completions) 与 [`codex-mini-latest`](https://developers.openai.com/api/docs/models/codex-mini-latest) 一起使用。它不适用于其他模型，也不能通过 Chat Completions API 使用。

运行任意 shell commands 可能很危险。在将 command 转发给系统 shell 之前，请务必对执行进行 sandboxing，或添加严格的 allow- / deny-lists。


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

:::

## English source

::: details 展开英文原文
::: v-pre
The local shell tool is outdated. For new use cases, use the
  [`shell`](/mirror/api/docs/guides/tools-shell) tool with GPT-5.1 instead. [Learn more](/mirror/api/docs/guides/tools-shell).

Local shell is a tool that allows agents to run shell commands locally on a machine you or the user provides. It's designed to work with [Codex CLI](https://github.com/openai/codex) and [`codex-mini-latest`](https://developers.openai.com/api/docs/models/codex-mini-latest). Commands are executed inside your own runtime, **you are fully in control of which commands actually run** —the API only returns the instructions, but does not execute them on OpenAI infrastructure.

Local shell is available through the [Responses API](https://developers.openai.com/api/docs/guides/responses-vs-chat-completions) for use with [`codex-mini-latest`](https://developers.openai.com/api/docs/models/codex-mini-latest). It is not available on other models, or via the Chat Completions API.

Running arbitrary shell commands can be dangerous.  Always sandbox execution
or add strict allow- / deny-lists before forwarding a command to the system
shell.


See [Codex CLI](https://github.com/openai/codex) for reference implementation.

## How it works

The local shell tool enables agents to run in a continuous loop with access to a terminal.

It sends shell commands, which your code executes on a local machine and then returns the output back to the model. This loop allows the model to complete the build-test-run loop without additional intervention by a user.

As part of your code, you'll need to implement a loop that listens for `local_shell_call` output items and executes the commands they contain. We strongly recommend sandboxing the execution of these commands to prevent any unexpected commands from being executed.



Integrating the local shell tool



These are the high-level steps you need to follow to integrate the computer use tool in your application:

1. **Send a request to the model**:
   Include the `local_shell` tool as part of the available tools.

2. **Receive a response from the model**:
   Check if the response has any `local_shell_call` items.
   This tool call contains an action like `exec` with a command to execute.

3. **Execute the requested action**:
   Execute through code the corresponding action in the computer or container environment.

4. **Return the action output**:
   After executing the action, return the command output and metadata like status code to the model.

5. **Repeat**:
   Send a new request with the updated state as a `local_shell_call_output`, and repeat this loop until the model stops requesting actions or you decide to stop.

## Example workflow

Below is a minimal (Python) example showing the request/response loop. For
brevity, error handling and security checks are omitted—**do not execute
untrusted commands in production without additional safeguards**.

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


## Best practices

- **Sandbox or containerize** execution. Consider using Docker, firejail, or a
  jailed user account.
- **Impose resource limits** (time, memory, network). The `timeout_ms`
  provided by the model is only a hint—you should enforce your own limits.
- **Filter or scrutinize** high-risk commands (e.g. `rm`, `curl`, network
  utilities).
- **Log every command and its output** for auditability and debugging.

### Error handling

If the command fails on your side (non-zero exit code, timeout, etc.) you can still send a `local_shell_call_output`; include the error message in the `output` field.

The model can choose to recover or try executing a different command. If you send malformed data (e.g. missing `call_id`) the API returns a standard `400` validation error.

:::
:::

