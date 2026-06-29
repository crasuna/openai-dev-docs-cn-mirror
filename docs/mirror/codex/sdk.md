---
title: "Codex SDK 软件开发工具包"
description: "Programmatically control local Codex agents"
outline: deep
---

# Codex SDK 软件开发工具包

**文档集**：Codex\
**分组**：SDK\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/sdk](https://developers.openai.com/codex/sdk)
- Markdown 来源：[https://developers.openai.com/codex/sdk.md](https://developers.openai.com/codex/sdk.md)
- 抓取时间：2026-06-27T05:55:06.916Z
- Checksum：`6a04d743c1cc5a87f079a752f1d8975fb20136d0cd6fe44db4cbc04a11f5a760`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
如果你通过 Codex CLI、IDE extension 或 Codex Web 使用 Codex，也可以用编程方式控制它。

在你需要以下能力时使用 SDK：

- 在 CI/CD pipeline 中控制 Codex
- 创建你自己的 agent，让它可以与 Codex 交互来执行复杂工程任务
- 把 Codex 构建进你自己的内部工具和工作流
- 在你自己的应用中集成 Codex

## TypeScript library

TypeScript library 提供了一种从应用内部控制 Codex 的方式，比非交互模式更完整、更灵活。

请在服务端使用该 library；它要求 Node.js 18 或更高版本。

### 安装

要开始使用，请用 `npm` 安装 Codex SDK：

```bash
npm install @openai/codex-sdk
```

### 用法

使用 Codex 启动一个 thread，并用你的 prompt 运行它。

```ts


const codex = new Codex();
const thread = codex.startThread();
const result = await thread.run(
  "Make a plan to diagnose and fix the CI failures"
);

console.log(result);
```

再次调用 `run()` 可以在同一个 thread 上继续，或者提供 thread ID 来恢复过去的 thread。

```ts
// running the same thread
const result = await thread.run("Implement the plan");

console.log(result);

// resuming past thread

const threadId = "<thread-id>";
const thread2 = codex.resumeThread(threadId);
const result2 = await thread2.run("Pick up where you left off");

console.log(result2);
```

更多细节请查看 [TypeScript repo](https://github.com/openai/codex/tree/main/sdk/typescript)。

## Python library

Python SDK 通过 JSON-RPC 控制本地 Codex app-server。它要求 Python 3.10 或更高版本。已发布的 SDK build 包含固定版本的 Codex CLI runtime 依赖。

### 安装

运行以下命令安装 SDK：

```bash
pip install openai-codex
```

已发布的 SDK build 会自动使用其固定的 runtime。只有当你明确希望针对某个特定的本地 Codex 可执行文件运行时，才传入 `CodexConfig(codex_bin=...)`。

在 Python SDK 处于 beta 期间，`pip install openai-codex` 会选择最新发布的 beta build。等稳定版 SDK 发布后，使用 `pip install --pre openai-codex` 来选择较新的 prerelease build。

### 用法

启动 Codex、创建 thread，并运行一个 prompt：

```python
from openai_codex import Codex, Sandbox

with Codex() as codex:
    thread = codex.thread_start(
        model="gpt-5.4",
        sandbox=Sandbox.workspace_write,
    )
    result = thread.run("Make a plan to diagnose and fix the CI failures")
    print(result.final_response)
```

当你的应用已经是异步应用时，使用 `AsyncCodex`：

```python
import asyncio

from openai_codex import AsyncCodex


async def main() -> None:
    async with AsyncCodex() as codex:
        thread = await codex.thread_start(model="gpt-5.4")
        result = await thread.run("Implement the plan")
        print(result.final_response)


asyncio.run(main())
```

### Sandbox presets

创建 thread 或为后续 turn 更改其文件系统访问权限时，可以使用相同的 `Sandbox` presets：

```python
from openai_codex import Codex, Sandbox

with Codex() as codex:
    thread = codex.thread_start(sandbox=Sandbox.workspace_write)
    thread.run("Make the requested change.")
    review = thread.run("Review the diff only.", sandbox=Sandbox.read_only)
```

可用 presets：

- `Sandbox.read_only`：读取文件，但不允许写入。
- `Sandbox.workspace_write`：读取文件，并在 workspace 和已配置的可写根目录内写入。
- `Sandbox.full_access`：在没有文件系统访问限制的情况下运行。

省略 `sandbox=` 时，app-server 会使用其配置的默认值。传给 `run(...)` 或 `turn(...)` 的 sandbox 会应用到该 turn 以及该 thread 上的后续 turn。

更多细节请查看 [Python repo](https://github.com/openai/codex/tree/main/sdk/python)。

:::

## English source

::: details 展开英文原文
::: v-pre
If you use Codex through the Codex CLI, the IDE extension, or Codex Web, you can also control it programmatically.

Use the SDK when you need to:

- Control Codex as part of your CI/CD pipeline
- Create your own agent that can engage with Codex to perform complex engineering tasks
- Build Codex into your own internal tools and workflows
- Integrate Codex within your own application

## TypeScript library

The TypeScript library provides a way to control Codex from within your application that's more comprehensive and flexible than non-interactive mode.

Use the library server-side; it requires Node.js 18 or later.

### Installation

To get started, install the Codex SDK using `npm`:

```bash
npm install @openai/codex-sdk
```

### Usage

Start a thread with Codex and run it with your prompt.

```ts


const codex = new Codex();
const thread = codex.startThread();
const result = await thread.run(
  "Make a plan to diagnose and fix the CI failures"
);

console.log(result);
```

Call `run()` again to continue on the same thread, or resume a past thread by providing a thread ID.

```ts
// running the same thread
const result = await thread.run("Implement the plan");

console.log(result);

// resuming past thread

const threadId = "<thread-id>";
const thread2 = codex.resumeThread(threadId);
const result2 = await thread2.run("Pick up where you left off");

console.log(result2);
```

For more details, check out the [TypeScript repo](https://github.com/openai/codex/tree/main/sdk/typescript).

## Python library

The Python SDK controls the local Codex app-server over JSON-RPC. It requires Python 3.10 or later. Published SDK builds include a pinned Codex CLI runtime dependency.

### Installation

To install the SDK run:

```bash
pip install openai-codex
```

Published SDK builds automatically use their pinned runtime. Pass `CodexConfig(codex_bin=...)` only when you intentionally want to run against a specific local Codex executable.

While the Python SDK is in beta, `pip install openai-codex` selects the latest
published beta build. After a stable SDK release exists, use
`pip install --pre openai-codex` to opt in to newer prerelease builds.

### Usage

Start Codex, create a thread, and run a prompt:

```python
from openai_codex import Codex, Sandbox

with Codex() as codex:
    thread = codex.thread_start(
        model="gpt-5.4",
        sandbox=Sandbox.workspace_write,
    )
    result = thread.run("Make a plan to diagnose and fix the CI failures")
    print(result.final_response)
```

Use `AsyncCodex` when your application is already asynchronous:

```python
import asyncio

from openai_codex import AsyncCodex


async def main() -> None:
    async with AsyncCodex() as codex:
        thread = await codex.thread_start(model="gpt-5.4")
        result = await thread.run("Implement the plan")
        print(result.final_response)


asyncio.run(main())
```

### Sandbox presets

Use the same `Sandbox` presets when creating a thread or changing its filesystem
access for a later turn:

```python
from openai_codex import Codex, Sandbox

with Codex() as codex:
    thread = codex.thread_start(sandbox=Sandbox.workspace_write)
    thread.run("Make the requested change.")
    review = thread.run("Review the diff only.", sandbox=Sandbox.read_only)
```

Available presets:

- `Sandbox.read_only`: Read files without allowing writes.
- `Sandbox.workspace_write`: Read files and write inside the workspace and configured writable roots.
- `Sandbox.full_access`: Run without filesystem access restrictions.

When you omit `sandbox=`, app-server uses its configured default. A sandbox
passed to `run(...)` or `turn(...)` applies to that turn and later turns
on the thread.

For more details, check out the [Python repo](https://github.com/openai/codex/tree/main/sdk/python).

:::
:::

