---
title: "Sandbox Agents 沙盒智能体"
description: "Learn how sandboxes fit into Agents SDK workflows, when to use them, and how orchestration stays separate from execution."
outline: deep
---

# Sandbox Agents 沙盒智能体

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/agents/sandboxes](https://developers.openai.com/api/docs/guides/agents/sandboxes)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/agents/sandboxes.md](https://developers.openai.com/api/docs/guides/agents/sandboxes.md)
- 抓取时间：2026-06-27T05:53:59.377Z
- Checksum：`e17d681f5e9d76cf386d1521572df6790a059c2da5161a3af02c8fa22d3a8b45`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Sandbox 为 agent 提供隔离的类 Unix 执行环境，其中包含 filesystem、shell、已安装 packages、mounted data、exposed ports、snapshots，以及对外部系统的受控访问。

当模型需要这类 workspace 却只收到 prompt context 时，Agent workflows 会变得脆弱。大型文档集、生成的 artifacts、commands、previews 和可恢复工作，都需要一个 agent 可以检查和更改的环境。

Sandbox agents 可在 TypeScript 和 Python Agents SDKs 中使用。它们目前处于 beta 阶段，因此 API 细节、默认值和受支持能力可能会变化。

当 agent 需要操作文件、运行命令、mount data room、生成 artifacts、暴露服务，或之后继续 stateful work 时，请使用 sandboxes。

关键区别在于 harness 和 compute 之间的边界。harness 是围绕模型的 control plane：它拥有 agent loop、model calls、tool routing、handoffs、approvals、tracing、recovery 和 run state。compute 是 sandbox execution plane，模型指挥的工作会在其中读写文件、运行命令、安装依赖、使用 mounted storage、暴露 ports，并 snapshot state。

保持这些边界分离，可以让你的应用把敏感的 control plane 工作保留在可信基础设施中，同时让 sandbox 专注于 provider-specific execution。sandbox 可以用狭窄 credentials 和 mounts 针对文件运行代码；harness 可以把 auth、billing、audit logs、human review 和 recovery state 保留在任何单个 container 之外。




      对于 prototypes，把 harness 放在 sandbox 内运行可能很方便，
      但这会把 orchestration 和 model-directed execution 放在同一个 compute
      boundary 中。





      harness 可以在你的基础设施中运行，而 sandbox 负责
      provider-specific、stateful execution。




## 何时使用 sandbox

当 agent 的答案依赖 sandbox workspace 中完成的工作，而不只是基于 prompt context 推理时，请使用 sandbox。

常见痛点包括：

- 任务需要一个文档目录，而不是单个 prompt。
- agent 应写入文件，供你的应用稍后检查。
- agent 需要 commands、packages 或 scripts 才能完成工作。
- workflow 会生成 Markdown、CSV、JSONL、screenshots 或 generated websites 等 artifacts。
- service、notebook 或 report preview 需要在 exposed port 上运行。
- 工作会暂停以供 human review，然后在同一 workspace 中恢复。

如果你的 workflow 只需要简短模型响应，并且不需要持久 workspace，请直接调用 [Responses API](/mirror/api/reference/responses/overview)，或使用不带 sandbox 的基础 Agents SDK runtime。

如果 shell access 只是偶尔使用的一个 tool，请从 [Using tools](/mirror/api/docs/guides/tools#usage-in-the-agents-sdk) 中的 hosted shell tool 开始。当 workspace isolation、sandbox provider 选择或可恢复 filesystem state 是产品设计的一部分时，请使用 sandbox agents。

## Sandboxes 添加了什么

`SandboxAgent` 仍然是 `Agent`。它保留常规 agent surface，包括 `instructions`、`prompt`、`tools`、`handoffs`、MCP servers、model settings、structured output、guardrails 和 hooks。改变的是 execution boundary：runner 会针对一个 live sandbox session 准备 agent，而该 session 拥有 files、commands、ports 和 provider-specific isolation。

| 组成部分           | 它拥有的内容                                                     | 设计问题                                                                                       |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `SandboxAgent`     | agent 定义加 sandbox defaults                                    | 这个 agent 应该做什么？哪些 sandbox defaults 应随它一起携带？                                  |
| `Manifest`         | fresh-session workspace contract                                 | workspace 起始时应包含哪些 files、directories、repos、mounts、environment、users 或 groups？     |
| Capabilities       | 附加到 agent 的 sandbox-native behavior                          | 这个 agent 需要哪些 sandbox tools、instructions 或 runtime behavior？                           |
| Sandbox client     | provider integration                                             | live workspace 应在哪里运行：Unix-local、Docker，还是 hosted provider？                         |
| Sandbox session    | live execution environment                                       | commands 在哪里运行、files 在哪里改变、ports 在哪里打开、provider state 在哪里存在？             |
| Sandbox run config | per-run sandbox session source、client options 和 fresh inputs    | 这次 run 应该注入、恢复，还是创建 sandbox session？                                             |
| Saved state        | `RunState`、serialized session state 和 snapshots                | 后续 runs 应如何重新连接到工作，或 seed 新 workspace？                                          |

Sandbox-specific defaults 属于 `SandboxAgent`。Per-run sandbox-session choices 属于 run 的 sandbox configuration。

Sandbox agents 也不会改变 turn 的含义。turn 仍然是 model step，而不是单个 shell command 或 sandbox action。有些工作可能会留在 sandbox execution layer 内部。只有当 agent runtime 在 sandbox work 发生后需要另一个模型响应时，它才会消耗另一个 turn。

## 创建 workspace

`Manifest` 描述 fresh sandbox workspace 所需的起始内容和布局。请用它表示 agent 应看到的 files、repos、input artifacts、helper files、mounts、output directories 和 environment setup。

把 manifest 视为 fresh-session contract，而不是每个 live sandbox 的完整事实来源。某次 run 的有效 workspace 也可以来自 reused live sandbox session、serialized sandbox session state，或 run time 选择的 snapshot。

Manifest entry paths 是 workspace-relative。它们不能是 absolute paths，也不能用 `..` 逃离 workspace，这能让 workspace contract 在 local、Docker 和 hosted clients 之间保持可移植。

| Manifest input                                                                 | 用途                                                                                  |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `File`, `Dir`                                                                  | 小型 synthetic inputs、helper files 或 output directories。                            |
| Local file or directory                                                        | 要 materialize 到 sandbox 中的 host files 或 directories。                             |
| Git repo                                                                       | 要 fetch 到 workspace 中的 repository。                                                |
| `S3Mount`, `GCSMount`, `R2Mount`, `AzureBlobMount`, `BoxMount`, `S3FilesMount` | 让 sandbox 内部可用的 external storage。                                               |
| `environment`                                                                  | sandbox 启动时需要的 environment variables。                                           |
| `users` and `groups`                                                           | 对支持 account provisioning 的 providers，提供 sandbox-local OS accounts 和 groups。   |

良好的 manifest 设计意味着：

- 将 repos、input artifacts 和 output directories 放入 manifest。
- 将较长任务 specs 和 repo-local instructions 放入 workspace files，例如 `repo/task.md` 或 `AGENTS.md`。
- 在 instructions 中使用 relative workspace paths，例如 `repo/task.md` 或 `output/report.md`。
- 将 mounted storage 限定为 agent 应读写的 inputs。
- 将 mount entries 视为 ephemeral workspace entries：snapshot 和 persistence flows 会跳过 mounted remote storage，而不是把它复制到 saved workspace contents 中。

### Mount files 和 storage

有用数据通常已经存在于别处。与其把大型文档粘贴到 context，不如把它们 mount 到 sandbox，让 agent 处理 files。

示例：

- Mount 一个 due-diligence data room，并让 agent 生成带引用的 summary。
- Mount 一个 support export，并让 agent 将问题聚类成 report。
- Mount generated artifacts，以便另一个系统可以 review 它们。

Provider integrations 会暴露自己的 mount helpers、credential handling 和 persistence behavior。保持应用 contract 相同：只 mount agent 应使用的 inputs，告诉 agent 从哪里读取和写入，并在使用生成的 artifacts 之前检查它们。

### 处理 secrets 和 credentials

将 sandbox credentials 视为 runtime configuration，而不是 prompt content。agent 可能需要访问 credentials 以用于 package managers、storage mounts 或 provider APIs，但这些 credentials 不应出现在 user prompts、agent instructions、task files、committed manifests 或 generated artifacts 中。

请使用以下规则：

- 对 hosted sandbox providers，优先使用 provider-native secret systems。
- 将 cloud storage credentials 限定到需要它们的 mount 或 provider option。
- 对 sandbox process 启动时需要的 values 使用 `Manifest.environment`，并在你想重新构建而不是持久化它们时，将 sensitive 或 generated entries 标记为 ephemeral。
- 避免保存 secrets、generated mount config、local tokens，或不应在 run 后保留的 files。
- 在将 artifacts 移出 sandbox 之前 review 它们，尤其是当 agent 可以读取 private documents 或 mounted storage 时。

SDK 支持 manifest environment values 和 provider-specific mount credentials。通用 secret-store integration 是 provider-specific 的，因此本页聚焦于 contract：你的 runtime 或 sandbox provider 应该注入 credentials，而不是把它们作为 instructions 教给模型。

## 赋予 agent capabilities

Capabilities 会把 sandbox-native behavior 附加到 `SandboxAgent`。它们可以在 run 开始前塑造 workspace，追加 sandbox-specific instructions，暴露绑定到 live sandbox session 的 tools，并为该 agent 调整 model behavior 或 input handling。

| Capability                              | 添加时机                                                     | 备注                                                                                 |
| --------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `Shell`                                 | agent 需要 shell access。                                    | 添加 command execution，并在 sandbox client 支持时添加 interactive input。           |
| `Filesystem`                            | agent 需要编辑 files 或检查 local images。                   | 添加 `apply_patch` 和 `view_image`；patch paths 是 workspace-root-relative。          |
| `Skills`                                | 你希望在 sandbox 中进行 skill discovery 和 materialization。 | 优先用它，而不是手动 mount `.agents` 或 `.agents/skills`。                            |
| [`Memory`](/mirror/api/docs/guides/agents/sandboxes#persist-memory-across-runs) | 后续 runs 应读取或生成 memory artifacts。                    | 需要 `Shell`；live memory updates 还需要 `Filesystem`。                               |
| `Compaction`                            | 长时间运行 flows 需要 context trimming。                     | 在 compaction items 后调整 model behavior 和 input handling。                         |

默认情况下，`SandboxAgent` 包含 filesystem、shell 和 compaction capabilities。如果你传入 `capabilities` list，它会替换默认 list，因此请包含 agent 仍需要的任何默认 capabilities。

当内置 capabilities 适用时，请优先使用它们。只有当你需要内置能力无法覆盖的 sandbox-specific tool 或 instruction surface 时，才编写 custom capability。

### 加载 skills

有些任务需要可重复的 instructions、scripts、references 或 assets，且这些内容需要在 agent 启动前可用。使用 `Skills` capability，让 agent 可以在 run 期间发现这些 working context。

加载 skills

```typescript
import {
  Capabilities,
  SandboxAgent,
  gitRepo,
  skills,
} from "@openai/agents/sandbox";

const agent = new SandboxAgent({
  name: "Tax prep assistant",
  instructions: "Use the mounted skill before preparing the return.",
  capabilities: [
    ...Capabilities.default(),
    skills({
      from: gitRepo({
        repo: "owner/tax-prep-skills",
        ref: "main",
      }),
    }),
  ],
});
```

```python
from agents.sandbox import SandboxAgent
from agents.sandbox.capabilities import Capabilities, Skills
from agents.sandbox.entries import GitRepo

agent = SandboxAgent(
    name="Tax prep assistant",
    instructions="Use the mounted skill before preparing the return.",
    capabilities=Capabilities.default() + [
        Skills(from_=GitRepo(repo="owner/tax-prep-skills", ref="main")),
    ],
)
```


根据你希望如何 materialize skill source 来选择：

- 当你希望模型先发现 index、再只加载所需内容时，对较大的 local skill directories 使用 lazy local directory source。
- 对小型 local bundle 使用 local directory source，以便提前 stage。
- 当 skills bundle 有自己的 release cadence，或许多 sandboxes 使用它时，使用 Git repo source。

### 暴露 previews 和 ports

有时 artifact 不是文件，而是正在运行的 process。当 agent 创建 local app、notebook、report server、browser preview 或其他你需要在 sandbox 外检查的 service 时，请使用 exposed port。

Port setup 是 provider-specific 的，但 product contract 相同：agent 在 sandbox 内启动 service，sandbox client 暴露 port，你的应用共享或检查生成的 preview URL。

## 运行 sandbox agent

最短的有用 sandbox loop 是：

1. 构建描述 workspace 的 `Manifest`。
2. 创建带有模型所需 capabilities 的 `SandboxAgent`。
3. 为工作应运行的环境选择 sandbox client。
4. 使用 per-run sandbox configuration 运行 agent。
5. 检查、复制、恢复或 snapshot 对你的应用重要的 artifacts。

本地开发在 macOS 或 Linux 上先从 Unix-local 开始。它提供最小本地循环，因为 runner 可以从 agent 的 default manifest 创建 temporary workspace，并在 run 之后清理。

运行 Unix-local sandbox agent

```typescript
import { run } from "@openai/agents";
import {
  Manifest,
  SandboxAgent,
  file,
  shell,
} from "@openai/agents/sandbox";
import { UnixLocalSandboxClient } from "@openai/agents/sandbox/local";

const manifest = new Manifest({
  entries: {
    "account_brief.md": file({
      content:
        "# Northwind Health\n\n" +
        "- Segment: Mid-market healthcare analytics provider.\n" +
        "- Renewal date: 2026-04-15.\n",
    }),
    "implementation_risks.md": file({
      content:
        "# Delivery risks\n\n" +
        "- Security questionnaire is not complete.\n" +
        "- Procurement requires final legal language by April 1.\n",
    }),
  },
});

const agent = new SandboxAgent({
  name: "Renewal Packet Analyst",
  model: "gpt-5.5",
  instructions:
    "Review the workspace before answering. Keep the response concise, " +
    "business-focused, and cite the file names that support each conclusion.",
  defaultManifest: manifest,
  capabilities: [shell()],
});

const result = await run(
  agent,
  "Summarize the renewal blockers and recommend the next two actions.",
  {
    sandbox: {
      client: new UnixLocalSandboxClient(),
    },
  },
);

console.log(result.finalOutput);
```

```python
import asyncio

from agents import Runner
from agents.run import RunConfig
from agents.sandbox import Manifest, SandboxAgent, SandboxRunConfig
from agents.sandbox.capabilities import Shell
from agents.sandbox.entries import File
from agents.sandbox.sandboxes.unix_local import UnixLocalSandboxClient

manifest = Manifest(
    entries={
        "account_brief.md": File(
            content=(
                b"# Northwind Health\n\n"
                b"- Segment: Mid-market healthcare analytics provider.\n"
                b"- Renewal date: 2026-04-15.\n"
            )
        ),
        "implementation_risks.md": File(
            content=(
                b"# Delivery risks\n\n"
                b"- Security questionnaire is not complete.\n"
                b"- Procurement requires final legal language by April 1.\n"
            )
        ),
    }
)

agent = SandboxAgent(
    name="Renewal Packet Analyst",
    model="gpt-5.5",
    instructions=(
        "Review the workspace before answering. Keep the response concise, "
        "business-focused, and cite the file names that support each conclusion."
    ),
    default_manifest=manifest,
    capabilities=[Shell()],
)


async def main():
    result = await Runner.run(
        agent,
        "Summarize the renewal blockers and recommend the next two actions.",
        run_config=RunConfig(
            sandbox=SandboxRunConfig(client=UnixLocalSandboxClient()),
            workflow_name="Unix-local sandbox review",
        ),
    )
    print(result.final_output)


asyncio.run(main())
```


完整本地示例见 TypeScript [sandbox agent quickstart][sdk-js-example-basic] 和 Python [`unix_local_runner.py`][sdk-example-unix-local-runner]。

### 切换 providers

Provider 是 run configuration 的一部分，而不是 agent definition 的一部分。保持 `SandboxAgent`、manifest 和 capabilities 稳定，然后为你想要的环境替换 sandbox client 和 provider options。

这个示例使用 Docker 进行本地 container isolation。Hosted providers 遵循相同模式，只是使用自己的 client classes 和 options。

切换到 Docker

```typescript
import { run } from "@openai/agents";
import { SandboxAgent } from "@openai/agents/sandbox";
import { DockerSandboxClient } from "@openai/agents/sandbox/local";

const agent = new SandboxAgent({
  name: "Workspace reviewer",
  model: "gpt-5.5",
  instructions: "Inspect the sandbox workspace before answering.",
});

const result = await run(agent, "Inspect the workspace.", {
  sandbox: {
    client: new DockerSandboxClient({
      image: "node:22-bookworm-slim",
    }),
  },
});

console.log(result.finalOutput);
```

```python
from docker import from_env as docker_from_env

from agents import Runner
from agents.run import RunConfig
from agents.sandbox import SandboxRunConfig
from agents.sandbox.config import DEFAULT_PYTHON_SANDBOX_IMAGE
from agents.sandbox.sandboxes.docker import DockerSandboxClient, DockerSandboxClientOptions

docker_run_config = RunConfig(
    sandbox=SandboxRunConfig(
        client=DockerSandboxClient(docker_from_env()),
        options=DockerSandboxClientOptions(image=DEFAULT_PYTHON_SANDBOX_IMAGE),
    ),
    workflow_name="Docker sandbox review",
)

result = await Runner.run(
    agent,
    "Summarize the renewal blockers and recommend the next two actions.",
    run_config=docker_run_config,
)
```


可运行示例见 TypeScript [sandbox clients guide][sdk-js-sandbox-clients] 和 [basic example][sdk-js-example-basic]，以及 SDK repository 中用于 provider selection 的 Python [`basic.py`][sdk-example-basic]、用于 Docker 的 [`docker_runner.py`][sdk-example-docker-runner]，以及用于 data-room flow 的 [`main.py`][sdk-example-dataroom-qa]。

### Advanced patterns

基础 loop 可用后，当 agent 需要 sandbox workspace 而不是更多 prompt context 时，sandboxes 就会变得有用。这些示例是 workflow patterns，而不是独立 APIs：同一个 harness 可以 route、pause、resume 和 trace workflow，同时每个 sandbox 让 execution 靠近它所需的 files、tools 和 ports。

| Example                                                | Description                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| [Data room Q&A][sdk-example-dataroom-qa]               | 基于 mounted data room 回答问题。                             |
| [Data room table extraction][sdk-example-dataroom]     | 从 mounted data room 中提取表格。                             |
| [Repository code review][sdk-example-repo-code-review] | Clone 一个 repo，检查它，并生成 code review artifacts。        |
| [Vision website clone][sdk-example-vision-clone]       | 使用 Vision API 和 screenshot feedback clone 一个网站。        |
| [Sandbox resume][sdk-example-sandbox-resume]           | 在预先存在的 sandbox 中恢复工作。                             |

## 恢复或 seed 未来工作

有用的 agent 工作通常会超出单个请求的生命周期。用户 review artifact、某个 step 需要 approval，或者下一步取决于稍后发生的事件。

请区分三个 state concepts：

| State surface | 恢复内容                                                                                  | 使用时机                                                                       |
| ------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `RunState`    | harness-side state，例如 model items、tool state、approvals 和 active agent position。     | runner 应该跨 pauses 继续推进 workflow。                                       |
| Session state | client 可以重新连接的 serialized sandbox session。                                         | 你的 app 或 job system 直接存储 provider session state。                       |
| `snapshot`    | 用于 seed fresh sandbox session 的 saved workspace contents。                              | 新 run 应从 saved files 和 artifacts 开始，而不是从 empty workspace 开始。      |

在实践中，runner 会按以下顺序解析 sandbox session：

1. 如果你传入 live sandbox session，runner 会直接复用该 session。
2. 否则，如果 run 正在从 `RunState` 恢复，runner 会从存储的 sandbox session state 恢复。
3. 否则，如果你传入显式 serialized sandbox state，runner 会从该 state 恢复。
4. 否则，runner 会创建 fresh sandbox session。对于该 fresh session，如果提供 per-run manifest，就使用它；否则使用 agent 的 default manifest。

Sandbox resume 示例会序列化已停止的 session state，通过同一 client 恢复它，然后把 resumed session 传回下一次 run：

序列化并恢复 sandbox state

```typescript
import { run } from "@openai/agents";
import { Manifest, SandboxAgent } from "@openai/agents/sandbox";
import { UnixLocalSandboxClient } from "@openai/agents/sandbox/local";

const manifest = new Manifest();
const client = new UnixLocalSandboxClient({
  snapshot: { type: "local", baseDir: "/tmp/my-sandbox-snapshots" },
});
const agent = new SandboxAgent({
  name: "Workspace builder",
  model: "gpt-5.5",
  instructions: "Inspect the sandbox workspace before answering.",
});

const session = await client.create({ manifest });
let conversation: any[] = [];
let frozenSessionState;

try {
  const firstResult = await run(agent, "Build the first version of the app.", {
    maxTurns: 20,
    sandbox: { session },
  });

  conversation = firstResult.history;
  frozenSessionState = await client.serializeSessionState?.(session.state);
} finally {
  await session.close?.();
}

if (!frozenSessionState || !client.deserializeSessionState || !client.resume) {
  throw new Error("Sandbox client does not support session resume.");
}

const resumedSession = await client.resume(
  await client.deserializeSessionState(frozenSessionState),
);

try {
  conversation.push({
    role: "user",
    content: "Continue from the existing workspace and add tests.",
  });

  await run(agent, conversation, {
    maxTurns: 20,
    sandbox: { session: resumedSession },
  });
} finally {
  await resumedSession.close?.();
}
```

```python
async with session:
    first_result = await Runner.run(
        agent,
        "Build the first version of the app.",
        max_turns=20,
        run_config=RunConfig(
            sandbox=SandboxRunConfig(session=session),
            workflow_name="Sandbox resume example",
        ),
    )

conversation = first_result.to_input_list()
frozen_session_state = client.deserialize_session_state(
    client.serialize_session_state(session.state)
)

conversation.append(
    {
        "role": "user",
        "content": "Continue from the existing workspace and add tests.",
    }
)

resumed_session = await client.resume(frozen_session_state)
try:
    async with resumed_session:
        second_result = await Runner.run(
            agent,
            conversation,
            max_turns=20,
            run_config=RunConfig(
                sandbox=SandboxRunConfig(session=resumed_session),
                workflow_name="Sandbox resume example",
            ),
        )
finally:
    await client.delete(resumed_session)
```


Fresh-session inputs（例如 `manifest` 和 `snapshot`）只在 runner 创建新 sandbox session 时适用。如果你注入 live `session`，capability processing 可以添加兼容的 non-mount entries，但不能改变 root、environment、users 或 groups；不能移除现有 entries；不能替换 entry types；也不能在已经运行的 sandbox 上添加或更改 mount entries。

这种划分让 harness 可以恢复 agent loop，同时让 sandbox provider 恢复或重新创建 workspace。这些路径的当前示例代码位于 TypeScript [resume session state example][sdk-js-example-resume] 和 Python [`main.py`][sdk-example-sandbox-resume] 以及 [`sandbox_agent_with_remote_snapshot.py`][sdk-example-remote-snapshot]。

## 跨 runs 持久化 memory

Sandbox memory 让未来的 sandbox-agent runs 可以从先前 runs 中学习。它不同于 SDK-managed conversational `Session` memory：sessions 会保留 message history，而 sandbox memory 会把先前 workspace runs 中有用的经验提炼为 agent 之后可读取的 files。

当你希望 agent 继承 user preferences、corrections、project-specific lessons 或 task summaries，而不 replay 每一个 previous turn 时，请使用 memory。Resume 和 snapshots 保留 workspace state；memory 保留关于 workspace 中发生工作的可复用指导。

启用 sandbox memory

```typescript
import {
  Manifest,
  SandboxAgent,
  filesystem,
  memory,
  shell,
} from "@openai/agents/sandbox";

const manifest = new Manifest();

const agent = new SandboxAgent({
  name: "Memory-enabled reviewer",
  instructions:
    "Inspect the workspace and retain useful lessons for follow-up runs.",
  defaultManifest: manifest,
  capabilities: [memory(), filesystem(), shell()],
});
```

```python
from agents.sandbox.capabilities import Filesystem, Memory, Shell

agent = SandboxAgent(
    name="Memory-enabled reviewer",
    instructions="Inspect the workspace and retain useful lessons for follow-up runs.",
    default_manifest=manifest,
    capabilities=[Memory(), Filesystem(), Shell()],
)
```


Memory 默认启用读取和生成。Memory reads 需要 shell access，这样 agent 可以搜索并打开 memory files。默认情况下，live memory updates 也需要 filesystem access，这样 agent 可以修复 stale memory，或在用户要求时更新 memory。

Memory reads 使用 progressive disclosure。SDK 会在 run 开始时注入 `memory_summary.md`，当 prior work 看起来相关时，agent 会搜索 `MEMORY.md`，并且只有在需要更多细节时才打开 rollout summaries。

| Memory mode          | 使用时机                                                        |
| -------------------- | --------------------------------------------------------------- |
| Default read/write   | agent 应读取现有 memory 并生成新 memory。                       |
| Read-only memory     | agent 应读取 memory，但 run 后不生成新 memory。                 |
| Generate-only memory | run 应生成 memory，而不使用现有 memory。                        |
| Read config          | 你需要禁用 live updates。                                       |
| Generate config      | 你需要调整 generation，例如 extra prompt。                      |
| Layout config        | agents 在同一个 sandbox workspace 中需要 isolated memory layouts。 |

默认情况下，memory artifacts 位于 sandbox workspace：

```text
workspace/
  sessions/
    <rollout-id>.jsonl
  memories/
    memory_summary.md
    MEMORY.md
    raw_memories.md
    phase_two_selection.json
    raw_memories/
      <rollout-id>.md
    rollout_summaries/
      <rollout-id>_<slug>.md
    skills/
```

Runtime 会在 sandbox session 期间追加 run segments。session 关闭时，memory generation 首先提取 conversation summaries 和 raw memories，然后将这些 raw memories 整合到 `MEMORY.md` 和 `memory_summary.md` 中。要在后续 run 中复用 memory，请通过保持同一个 live sandbox session、从 session state 恢复、从 snapshot 启动，或 mount 持久 storage（例如 S3），来保留配置的 memory directories。

对于 multi-turn sandbox chats，请将稳定的 SDK session 与同一个 live sandbox session 一起使用。Memory 会按 explicit conversation ID、SDK session ID、run group ID，最后是 generated per-run ID 的顺序对 runs 分组。sandbox session ID 标识 live workspace；它不是 memory conversation ID。

可运行示例见 TypeScript [memory guide][sdk-js-sandbox-memory]，以及 Python [`memory.py`][sdk-example-memory]（local snapshot flow）、[`memory_s3.py`][sdk-example-memory-s3]（S3-backed memory storage），和 [`memory_multi_agent_multiturn.py`][sdk-example-memory-multi-agent]（跨 agents 的独立 memory layouts）。

## 组合 sandbox agents

Sandbox agents 可以与 SDK 的其余部分组合。

当 non-sandbox intake agent 应只把 workflow 中 workspace-heavy 的部分委派给 sandbox agent 时，请使用 handoff。顶层 run 会继续，但 sandbox agent 会成为下一轮的 active agent。

当 outer orchestrator 应把一个或多个 sandbox agents 作为 nested tools 调用时，请把 agents 作为 tools 使用。每个 sandbox tool-agent 都可以拥有自己的 sandbox run configuration、sandbox client、manifest 和 provider options。

示例见 [`handoffs.py`][sdk-example-handoffs] 和 [`sandbox_agents_as_tools.py`][sdk-example-agents-as-tools]。

## Sandbox providers

请从 Unix-local 开始进行快速本地迭代；如果你想要本地 container isolation，则使用 Docker。当任务需要 managed execution、provider-specific isolation、scaling、previews、storage mounts、snapshots，或应位于 application server 外部的 credentials 时，再迁移到 hosted provider。

使用 provider docs 了解 provider-specific setup、credentials、isolation、storage、previews 和 persistence behavior。

| Provider   | SDK client                | Documentation and examples                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blaxel     | `BlaxelSandboxClient`     | &lt;a href="https://docs.blaxel.ai/Sandboxes/Overview"&gt;Sandbox overview&lt;/a&gt;                                                                                                                                                                                                                                                                                                                                                   |
| Cloudflare | `CloudflareSandboxClient` | &lt;a href="https://developers.cloudflare.com/sandbox/"&gt;Sandbox documentation&lt;/a&gt;&lt;br /&gt;&lt;a href="https://docs.cloudflare.com/sandbox/tutorials/openai-agents/"&gt;OpenAI Agents tutorial&lt;/a&gt;&lt;br /&gt;&lt;a href="https://github.com/cloudflare/sandbox-sdk/tree/main/bridge/examples"&gt;Sandbox Bridge examples&lt;/a&gt;                                                                                                                       |
| Daytona    | `DaytonaSandboxClient`    | &lt;a href="https://www.daytona.io/docs/en/sandboxes/"&gt;Sandbox documentation&lt;/a&gt;&lt;br /&gt;&lt;a href="https://www.daytona.io/docs/en/guides/openai-agents/openai-agents-sdk-with-sandboxes"&gt;OpenAI Agents SDK guide&lt;/a&gt;                                                                                                                                                                                                              |
| Docker     | `DockerSandboxClient`     | &lt;a href="https://docs.docker.com/"&gt;Docker documentation&lt;/a&gt;&lt;br /&gt;&lt;a href="https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/docker-client.ts"&gt;TypeScript Docker SDK example&lt;/a&gt;&lt;br /&gt;&lt;a href="https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/docker/docker_runner.py"&gt;Python Docker SDK example&lt;/a&gt;                                                             |
| E2B        | `E2BSandboxClient`        | &lt;a href="https://e2b.dev/docs"&gt;Sandbox documentation&lt;/a&gt;&lt;br /&gt;&lt;a href="https://e2b.dev/docs/agents/openai-agents-sdk"&gt;OpenAI Agents SDK guide&lt;/a&gt;&lt;br /&gt;&lt;a href="https://e2b.dev/blog/e2b-is-now-in-agents-sdk"&gt;Launch blog&lt;/a&gt;                                                                                                                                                                                             |
| Modal      | `ModalSandboxClient`      | &lt;a href="https://modal.com/docs/guide/sandboxes"&gt;Sandbox guide&lt;/a&gt;&lt;br /&gt;&lt;a href="https://modal.com/blog/building-with-modal-and-the-openai-agent-sdk"&gt;Integration blog&lt;/a&gt;&lt;br /&gt;&lt;a href="https://github.com/modal-labs/openai-agents-python-example"&gt;Example repo&lt;/a&gt;&lt;br /&gt;&lt;a href="https://github.com/modal-labs/openai-agents-python-example?tab=readme-ov-file#modal-extension-reference"&gt;Modal extension reference&lt;/a&gt; |
| Runloop    | `RunloopSandboxClient`    | &lt;a href="https://docs.runloop.ai/docs/devboxes/overview"&gt;Devbox overview&lt;/a&gt;&lt;br /&gt;&lt;a href="https://docs.runloop.ai/docs/devboxes/tunnels"&gt;Tunnels&lt;/a&gt;                                                                                                                                                                                                                                                                      |
| Unix-local | `UnixLocalSandboxClient`  | &lt;a href="https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/basic.ts"&gt;TypeScript local SDK example&lt;/a&gt;&lt;br /&gt;&lt;a href="https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/unix_local_runner.py"&gt;Python local SDK example&lt;/a&gt;                                                                                                                                           |
| Vercel     | `VercelSandboxClient`     | &lt;a href="https://vercel.com/docs/vercel-sandbox"&gt;Sandbox documentation&lt;/a&gt;&lt;br /&gt;&lt;a href="https://vercel.com/kb/guide/building-an-agent-with-openai-agents-sdk-and-vercel-sandbox"&gt;OpenAI Agents SDK guide&lt;/a&gt;&lt;br /&gt;&lt;a href="https://vercel.com/templates/template/openai-agents-sdk-with-fastapi"&gt;FastAPI template&lt;/a&gt;&lt;br /&gt;&lt;a href="https://github.com/vercel-labs/openai-agents-fastapi-starter"&gt;Sample app&lt;/a&gt;          |

[sdk-example-agents-as-tools]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/sandbox_agents_as_tools.py
[sdk-example-basic]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/basic.py
[sdk-example-dataroom]: https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/dataroom_metric_extract
[sdk-example-dataroom-qa]: https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/dataroom_qa
[sdk-example-docker-runner]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/docker/docker_runner.py
[sdk-example-handoffs]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/handoffs.py
[sdk-example-memory]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/memory.py
[sdk-example-memory-multi-agent]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/memory_multi_agent_multiturn.py
[sdk-example-memory-s3]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/memory_s3.py
[sdk-example-remote-snapshot]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/sandbox_agent_with_remote_snapshot.py
[sdk-example-repo-code-review]: https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/repo_code_review
[sdk-example-sandbox-resume]: https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/sandbox_resume
[sdk-example-unix-local-runner]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/unix_local_runner.py
[sdk-example-vision-clone]: https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/vision_website_clone
[sdk-js-example-basic]: https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/basic.ts
[sdk-js-example-resume]: https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/resume-session-state.ts
[sdk-js-sandbox-clients]: https://openai.github.io/openai-agents-js/guides/sandbox-agents/clients
[sdk-js-sandbox-memory]: https://openai.github.io/openai-agents-js/guides/sandbox-agents/memory

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
A sandbox gives an agent an isolated, Unix-like execution environment with a
filesystem, shell, installed packages, mounted data, exposed ports, snapshots,
and controlled access to external systems.

Agent workflows get brittle when the model needs that kind of workspace but
only receives prompt context. Large document sets, generated artifacts,
commands, previews, and resumable work all need an environment the agent can
inspect and change.

Sandbox agents are available in the TypeScript and Python Agents SDKs. They
  are in beta, so API details, defaults, and supported capabilities may change.

Use sandboxes when the agent needs to manipulate files, run commands, mount a
data room, produce artifacts, expose a service, or continue stateful work
later.

The key split is the boundary between the harness and compute. The harness is
the control plane around the model: it owns the agent loop, model calls, tool
routing, handoffs, approvals, tracing, recovery, and run state. Compute is the
sandbox execution plane where model-directed work reads and writes files, runs
commands, installs dependencies, uses mounted storage, exposes ports, and
snapshots state.

Keeping those boundaries separate lets your application keep sensitive control
plane work in trusted infrastructure while the sandbox stays focused on
provider-specific execution. The sandbox can run code against files with narrow
credentials and mounts; the harness can keep auth, billing, audit logs, human
review, and recovery state outside any one container.

<div className="not-prose my-8 grid gap-4 lg:grid-cols-2">
  <figure>
    <figcaption className="mt-3 text-sm text-gray-600 dark:text-gray-400">
      Running the harness inside the sandbox can be convenient for prototypes,
      but it puts orchestration and model-directed execution in the same compute
      boundary.
    </figcaption>
  </figure>

  <figure>
    <figcaption className="mt-3 text-sm text-gray-600 dark:text-gray-400">
      The harness can run in your infrastructure while the sandbox handles
      provider-specific, stateful execution.
    </figcaption>
  </figure>
</div>

## When to use a sandbox

Use a sandbox when the agent's answer depends on work done in a sandbox
workspace, not just reasoning over prompt context.

Common pain points include:

- The task needs a directory of documents, not a single prompt.
- The agent should write files that your application can inspect later.
- The agent needs commands, packages, or scripts to complete the work.
- The workflow produces artifacts such as Markdown, CSV, JSONL, screenshots, or generated websites.
- A service, notebook, or report preview needs to run on an exposed port.
- Work pauses for human review and then resumes in the same workspace.

If your workflow only needs a short model response and no persistent workspace,
call the [Responses API](https://developers.openai.com/api/reference/responses/overview) directly or use the
basic Agents SDK runtime without a sandbox.

If shell access is only one occasional tool, start with the hosted shell tool in
[Using tools](https://developers.openai.com/api/docs/guides/tools#usage-in-the-agents-sdk). Use sandbox
agents when workspace isolation, sandbox provider choice, or resumable
filesystem state is part of the product design.

## What sandboxes add

`SandboxAgent` is still an `Agent`. It keeps the usual agent surface, including
`instructions`, `prompt`, `tools`, `handoffs`, MCP servers, model settings,
structured output, guardrails, and hooks. What changes is the execution boundary:
the runner prepares the agent against a live sandbox session that owns files,
commands, ports, and provider-specific isolation.

| Piece              | What it owns                                                     | Design question                                                                                   |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `SandboxAgent`     | The agent definition plus sandbox defaults                       | What should this agent do, and which sandbox defaults travel with it?                             |
| `Manifest`         | The fresh-session workspace contract                             | What files, directories, repos, mounts, environment, users, or groups start out in the workspace? |
| Capabilities       | Sandbox-native behavior attached to the agent                    | Which sandbox tools, instructions, or runtime behavior does this agent need?                      |
| Sandbox client     | The provider integration                                         | Where should the live workspace run: Unix-local, Docker, or a hosted provider?                    |
| Sandbox session    | The live execution environment                                   | Where do commands run, files change, ports open, and provider state live?                         |
| Sandbox run config | Per-run sandbox session source, client options, and fresh inputs | Should this run inject, resume, or create the sandbox session?                                    |
| Saved state        | `RunState`, serialized session state, and snapshots              | How should later runs reconnect to work or seed a new workspace?                                  |

Sandbox-specific defaults belong on `SandboxAgent`. Per-run sandbox-session
choices belong in the run's sandbox configuration.

Sandbox agents also don't change what a turn means. A turn is still a model
step, not a single shell command or sandbox action. Some work may stay inside
the sandbox execution layer. The agent runtime consumes another turn only when
it needs another model response after sandbox work has happened.

## Create the workspace

`Manifest` describes the desired starting contents and layout for a fresh
sandbox workspace. Use it for the files, repos, input artifacts, helper files,
mounts, output directories, and environment setup the agent should see.

Treat the manifest as a fresh-session contract, not the full source of truth for
every live sandbox. The effective workspace for a run can instead come from a
reused live sandbox session, serialized sandbox session state, or a snapshot
chosen at run time.

Manifest entry paths are workspace-relative. They can't be absolute paths or
escape the workspace with `..`, which keeps the workspace contract portable
across local, Docker, and hosted clients.

| Manifest input                                                                 | Use it for                                                                            |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `File`, `Dir`                                                                  | Small synthetic inputs, helper files, or output directories.                          |
| Local file or directory                                                        | Host files or directories to materialize into the sandbox.                            |
| Git repo                                                                       | A repository to fetch into the workspace.                                             |
| `S3Mount`, `GCSMount`, `R2Mount`, `AzureBlobMount`, `BoxMount`, `S3FilesMount` | External storage to make available inside the sandbox.                                |
| `environment`                                                                  | Environment variables the sandbox needs when it starts.                               |
| `users` and `groups`                                                           | Sandbox-local OS accounts and groups for providers that support account provisioning. |

Good manifest design means:

- Put repos, input artifacts, and output directories in the manifest.
- Put longer task specs and repo-local instructions in workspace files such as `repo/task.md` or `AGENTS.md`.
- Use relative workspace paths in instructions, for example `repo/task.md` or `output/report.md`.
- Keep mounted storage scoped to the inputs the agent should read or write.
- Treat mount entries as ephemeral workspace entries: snapshot and persistence flows skip mounted remote storage instead of copying it into saved workspace contents.

### Mount files and storage

Useful data often already lives somewhere else. Instead of pasting large
documents into context, mount them into the sandbox and let the agent work with
files.

Examples:

- Mount a due-diligence data room and ask the agent to produce a cited summary.
- Mount a support export and ask the agent to cluster issues into a report.
- Mount generated artifacts so another system can review them.

Provider integrations expose their own mount helpers, credential handling, and
persistence behavior. Keep the application contract the same: mount only the
inputs the agent should use, tell the agent where to read and write, and check
generated artifacts before using them.

### Handle secrets and credentials

Treat sandbox credentials as runtime configuration, not prompt content. The
agent may need access to credentials for package managers, storage mounts, or
provider APIs, but those credentials shouldn't appear in user prompts,
agent instructions, task files, committed manifests, or generated artifacts.

Use these rules:

- Prefer provider-native secret systems for hosted sandbox providers.
- Keep cloud storage credentials scoped to the mount or provider option that needs them.
- Use `Manifest.environment` for values the sandbox process needs at startup, and mark sensitive or generated entries as ephemeral when you want to rebuild them instead of persisting them.
- Avoid saving secrets, generated mount config, local tokens, or files that shouldn't survive the run.
- Review artifacts before moving them out of the sandbox, especially when the agent can read private documents or mounted storage.

The SDK supports manifest environment values and provider-specific mount
credentials. General secret-store integration is provider-specific, so keep this
page focused on the contract: your runtime or sandbox provider should inject
credentials instead of teaching them to the model as instructions.

## Give the agent capabilities

Capabilities attach sandbox-native behavior to a `SandboxAgent`. They can shape
the workspace before a run starts, append sandbox-specific instructions, expose
tools that bind to the live sandbox session, and adjust model behavior or input
handling for that agent.

| Capability                              | Add it when                                                  | Notes                                                                                |
| --------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `Shell`                                 | The agent needs shell access.                                | Adds command execution and, when supported by the sandbox client, interactive input. |
| `Filesystem`                            | The agent needs to edit files or inspect local images.       | Adds `apply_patch` and `view_image`; patch paths are workspace-root-relative.        |
| `Skills`                                | You want skill discovery and materialization in the sandbox. | Prefer this over manually mounting `.agents` or `.agents/skills`.                    |
| [`Memory`](#persist-memory-across-runs) | Follow-on runs should read or generate memory artifacts.     | Requires `Shell`; live memory updates also require `Filesystem`.                     |
| `Compaction`                            | Long-running flows need context trimming.                    | Adjusts model behavior and input handling after compaction items.                    |

By default, a `SandboxAgent` includes filesystem, shell, and compaction
capabilities. If you pass a `capabilities` list, it replaces the default list,
so include any default capabilities the agent still needs.

Prefer built-in capabilities when they fit. Write a custom capability only when
you need a sandbox-specific tool or instruction surface that the built-ins don't
cover.

### Load skills

Some tasks need repeatable instructions, scripts, references, or assets before
the agent starts. Use the `Skills` capability so the agent can discover that
working context during the run.

Load skills

```typescript
import {
  Capabilities,
  SandboxAgent,
  gitRepo,
  skills,
} from "@openai/agents/sandbox";

const agent = new SandboxAgent({
  name: "Tax prep assistant",
  instructions: "Use the mounted skill before preparing the return.",
  capabilities: [
    ...Capabilities.default(),
    skills({
      from: gitRepo({
        repo: "owner/tax-prep-skills",
        ref: "main",
      }),
    }),
  ],
});
```

```python
from agents.sandbox import SandboxAgent
from agents.sandbox.capabilities import Capabilities, Skills
from agents.sandbox.entries import GitRepo

agent = SandboxAgent(
    name="Tax prep assistant",
    instructions="Use the mounted skill before preparing the return.",
    capabilities=Capabilities.default() + [
        Skills(from_=GitRepo(repo="owner/tax-prep-skills", ref="main")),
    ],
)
```


Choose the skill source based on how you want it materialized:

- Use a lazy local directory source for larger local skill directories when you want the model to discover the index first and load only what it needs.
- Use a local directory source for a small local bundle to stage up front.
- Use a Git repo source when the skills bundle has its own release cadence or many sandboxes use it.

### Expose previews and ports

Sometimes the artifact isn't a file; it's a running process. Use an exposed
port when the agent creates a local app, notebook, report server, browser
preview, or other service that you need to inspect outside the sandbox.

Port setup is provider-specific, but the product contract is the same: the
agent starts the service inside the sandbox, the sandbox client exposes the
port, and your application shares or inspects the resulting preview URL.

## Run a sandbox agent

The shortest useful sandbox loop is:

1. Build a `Manifest` that describes the workspace.
2. Create a `SandboxAgent` with the capabilities the model needs.
3. Choose a sandbox client for the environment where work should run.
4. Run the agent with the per-run sandbox configuration.
5. Inspect, copy, resume, or snapshot the artifacts that matter to your application.

Start with Unix-local for local development on macOS or Linux. It gives you the
smallest local loop because the runner can create a temporary workspace from the
agent's default manifest and clean it up after the run.

Run a Unix-local sandbox agent

```typescript
import { run } from "@openai/agents";
import {
  Manifest,
  SandboxAgent,
  file,
  shell,
} from "@openai/agents/sandbox";
import { UnixLocalSandboxClient } from "@openai/agents/sandbox/local";

const manifest = new Manifest({
  entries: {
    "account_brief.md": file({
      content:
        "# Northwind Health\n\n" +
        "- Segment: Mid-market healthcare analytics provider.\n" +
        "- Renewal date: 2026-04-15.\n",
    }),
    "implementation_risks.md": file({
      content:
        "# Delivery risks\n\n" +
        "- Security questionnaire is not complete.\n" +
        "- Procurement requires final legal language by April 1.\n",
    }),
  },
});

const agent = new SandboxAgent({
  name: "Renewal Packet Analyst",
  model: "gpt-5.5",
  instructions:
    "Review the workspace before answering. Keep the response concise, " +
    "business-focused, and cite the file names that support each conclusion.",
  defaultManifest: manifest,
  capabilities: [shell()],
});

const result = await run(
  agent,
  "Summarize the renewal blockers and recommend the next two actions.",
  {
    sandbox: {
      client: new UnixLocalSandboxClient(),
    },
  },
);

console.log(result.finalOutput);
```

```python
import asyncio

from agents import Runner
from agents.run import RunConfig
from agents.sandbox import Manifest, SandboxAgent, SandboxRunConfig
from agents.sandbox.capabilities import Shell
from agents.sandbox.entries import File
from agents.sandbox.sandboxes.unix_local import UnixLocalSandboxClient

manifest = Manifest(
    entries={
        "account_brief.md": File(
            content=(
                b"# Northwind Health\n\n"
                b"- Segment: Mid-market healthcare analytics provider.\n"
                b"- Renewal date: 2026-04-15.\n"
            )
        ),
        "implementation_risks.md": File(
            content=(
                b"# Delivery risks\n\n"
                b"- Security questionnaire is not complete.\n"
                b"- Procurement requires final legal language by April 1.\n"
            )
        ),
    }
)

agent = SandboxAgent(
    name="Renewal Packet Analyst",
    model="gpt-5.5",
    instructions=(
        "Review the workspace before answering. Keep the response concise, "
        "business-focused, and cite the file names that support each conclusion."
    ),
    default_manifest=manifest,
    capabilities=[Shell()],
)


async def main():
    result = await Runner.run(
        agent,
        "Summarize the renewal blockers and recommend the next two actions.",
        run_config=RunConfig(
            sandbox=SandboxRunConfig(client=UnixLocalSandboxClient()),
            workflow_name="Unix-local sandbox review",
        ),
    )
    print(result.final_output)


asyncio.run(main())
```


For complete local examples, see the TypeScript [sandbox agent quickstart][sdk-js-example-basic] and Python [`unix_local_runner.py`][sdk-example-unix-local-runner].

### Switch providers

The provider is part of the run configuration, not the agent definition. Keep
the `SandboxAgent`, manifest, and capabilities stable, then swap the sandbox
client and provider options for the environment you want.

This example uses Docker for local container isolation. Hosted providers follow
the same pattern with their own client classes and options.

Switch to Docker

```typescript
import { run } from "@openai/agents";
import { SandboxAgent } from "@openai/agents/sandbox";
import { DockerSandboxClient } from "@openai/agents/sandbox/local";

const agent = new SandboxAgent({
  name: "Workspace reviewer",
  model: "gpt-5.5",
  instructions: "Inspect the sandbox workspace before answering.",
});

const result = await run(agent, "Inspect the workspace.", {
  sandbox: {
    client: new DockerSandboxClient({
      image: "node:22-bookworm-slim",
    }),
  },
});

console.log(result.finalOutput);
```

```python
from docker import from_env as docker_from_env

from agents import Runner
from agents.run import RunConfig
from agents.sandbox import SandboxRunConfig
from agents.sandbox.config import DEFAULT_PYTHON_SANDBOX_IMAGE
from agents.sandbox.sandboxes.docker import DockerSandboxClient, DockerSandboxClientOptions

docker_run_config = RunConfig(
    sandbox=SandboxRunConfig(
        client=DockerSandboxClient(docker_from_env()),
        options=DockerSandboxClientOptions(image=DEFAULT_PYTHON_SANDBOX_IMAGE),
    ),
    workflow_name="Docker sandbox review",
)

result = await Runner.run(
    agent,
    "Summarize the renewal blockers and recommend the next two actions.",
    run_config=docker_run_config,
)
```


For runnable examples, see the TypeScript [sandbox clients guide][sdk-js-sandbox-clients] and [basic example][sdk-js-example-basic], plus Python [`basic.py`][sdk-example-basic] for provider selection, [`docker_runner.py`][sdk-example-docker-runner] for Docker, and [`main.py`][sdk-example-dataroom-qa] for a data-room flow in the SDK repository.

### Advanced patterns

Once the basic loop works, sandboxes become useful for workflows where the
agent needs a sandbox workspace instead of more prompt context. These
examples are workflow patterns, not separate APIs: the same harness can route, pause,
resume, and trace the workflow while each sandbox keeps execution close to the
files, tools, and ports it needs.

| Example                                                | Description                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| [Data room Q&A][sdk-example-dataroom-qa]               | Answer questions over a mounted data room.                    |
| [Data room table extraction][sdk-example-dataroom]     | Extract a table from a mounted data room.                     |
| [Repository code review][sdk-example-repo-code-review] | Clone a repo, inspect it, and produce code review artifacts.  |
| [Vision website clone][sdk-example-vision-clone]       | Clone a website using the Vision API and screenshot feedback. |
| [Sandbox resume][sdk-example-sandbox-resume]           | Resume work in a pre-existing sandbox.                        |

## Resume or seed future work

Useful agent work often outlives one request. A user reviews an artifact, a
step needs approval, or the next step depends on a later event.

Keep three state concepts separate:

| State surface | Restores                                                                                  | Use when                                                                       |
| ------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `RunState`    | Harness-side state such as model items, tool state, approvals, and active agent position. | The runner should carry the workflow forward across pauses.                    |
| Session state | A serialized sandbox session that a client can reconnect to.                              | Your app or job system stores provider session state directly.                 |
| `snapshot`    | Saved workspace contents used to seed a fresh sandbox session.                            | A new run should start from saved files and artifacts, not an empty workspace. |

In practice, the runner resolves the sandbox session in this order:

1. If you pass a live sandbox session, the runner reuses that session directly.
2. Otherwise, if the run is resuming from `RunState`, the runner resumes from the stored sandbox session state.
3. Otherwise, if you pass explicit serialized sandbox state, the runner resumes from that state.
4. Otherwise, the runner creates a fresh sandbox session. For that fresh session, it uses the per-run manifest when provided, or the agent's default manifest if not.

The sandbox resume example serializes the stopped session state, resumes it
through the same client, and then passes the resumed session back into the next
run:

Serialize and resume sandbox state

```typescript
import { run } from "@openai/agents";
import { Manifest, SandboxAgent } from "@openai/agents/sandbox";
import { UnixLocalSandboxClient } from "@openai/agents/sandbox/local";

const manifest = new Manifest();
const client = new UnixLocalSandboxClient({
  snapshot: { type: "local", baseDir: "/tmp/my-sandbox-snapshots" },
});
const agent = new SandboxAgent({
  name: "Workspace builder",
  model: "gpt-5.5",
  instructions: "Inspect the sandbox workspace before answering.",
});

const session = await client.create({ manifest });
let conversation: any[] = [];
let frozenSessionState;

try {
  const firstResult = await run(agent, "Build the first version of the app.", {
    maxTurns: 20,
    sandbox: { session },
  });

  conversation = firstResult.history;
  frozenSessionState = await client.serializeSessionState?.(session.state);
} finally {
  await session.close?.();
}

if (!frozenSessionState || !client.deserializeSessionState || !client.resume) {
  throw new Error("Sandbox client does not support session resume.");
}

const resumedSession = await client.resume(
  await client.deserializeSessionState(frozenSessionState),
);

try {
  conversation.push({
    role: "user",
    content: "Continue from the existing workspace and add tests.",
  });

  await run(agent, conversation, {
    maxTurns: 20,
    sandbox: { session: resumedSession },
  });
} finally {
  await resumedSession.close?.();
}
```

```python
async with session:
    first_result = await Runner.run(
        agent,
        "Build the first version of the app.",
        max_turns=20,
        run_config=RunConfig(
            sandbox=SandboxRunConfig(session=session),
            workflow_name="Sandbox resume example",
        ),
    )

conversation = first_result.to_input_list()
frozen_session_state = client.deserialize_session_state(
    client.serialize_session_state(session.state)
)

conversation.append(
    {
        "role": "user",
        "content": "Continue from the existing workspace and add tests.",
    }
)

resumed_session = await client.resume(frozen_session_state)
try:
    async with resumed_session:
        second_result = await Runner.run(
            agent,
            conversation,
            max_turns=20,
            run_config=RunConfig(
                sandbox=SandboxRunConfig(session=resumed_session),
                workflow_name="Sandbox resume example",
            ),
        )
finally:
    await client.delete(resumed_session)
```


Fresh-session inputs such as `manifest` and `snapshot` only apply when the
runner creates a new sandbox session. If you inject a live `session`, capability
processing can add compatible non-mount entries, but it can't change root,
environment, users, or groups; remove existing entries; replace entry types; or
add or change mount entries on the already-running sandbox.

This split lets the harness resume the agent loop while the sandbox provider
restores or recreates the workspace. Current sample code for these paths lives
in the TypeScript [resume session state example][sdk-js-example-resume] and
Python [`main.py`][sdk-example-sandbox-resume] and
[`sandbox_agent_with_remote_snapshot.py`][sdk-example-remote-snapshot].

## Persist memory across runs

Sandbox memory lets future sandbox-agent runs learn from prior runs. It's
separate from SDK-managed conversational `Session` memory: sessions preserve
message history, while sandbox memory distills useful lessons from prior
workspace runs into files the agent can read later.

Use memory when the agent should carry forward user preferences, corrections,
project-specific lessons, or task summaries without replaying every previous
turn. Resume and snapshots preserve workspace state; memory preserves reusable
guidance about work that happened in the workspace.

Enable sandbox memory

```typescript
import {
  Manifest,
  SandboxAgent,
  filesystem,
  memory,
  shell,
} from "@openai/agents/sandbox";

const manifest = new Manifest();

const agent = new SandboxAgent({
  name: "Memory-enabled reviewer",
  instructions:
    "Inspect the workspace and retain useful lessons for follow-up runs.",
  defaultManifest: manifest,
  capabilities: [memory(), filesystem(), shell()],
});
```

```python
from agents.sandbox.capabilities import Filesystem, Memory, Shell

agent = SandboxAgent(
    name="Memory-enabled reviewer",
    instructions="Inspect the workspace and retain useful lessons for follow-up runs.",
    default_manifest=manifest,
    capabilities=[Memory(), Filesystem(), Shell()],
)
```


Memory enables both reads and generation by default. Memory reads require shell
access so the agent can search and open memory files. By default, live memory
updates also require filesystem access, so the agent can repair stale memory or
update memory when the user asks.

Memory reads use progressive disclosure. The SDK injects `memory_summary.md` at
the start of a run, the agent searches `MEMORY.md` when prior work looks
relevant, and it opens rollout summaries only when it needs more detail.

| Memory mode          | Use it when                                                             |
| -------------------- | ----------------------------------------------------------------------- |
| Default read/write   | The agent should read existing memory and generate new memory.          |
| Read-only memory     | The agent should read memory but not generate new memory after the run. |
| Generate-only memory | The run should generate memory without using existing memory.           |
| Read config          | You need to disable live updates.                                       |
| Generate config      | You need to tune generation, such as the extra prompt.                  |
| Layout config        | Agents need isolated memory layouts in the same sandbox workspace.      |

By default, memory artifacts live in the sandbox workspace:

```text
workspace/
  sessions/
    <rollout-id>.jsonl
  memories/
    memory_summary.md
    MEMORY.md
    raw_memories.md
    phase_two_selection.json
    raw_memories/
      <rollout-id>.md
    rollout_summaries/
      <rollout-id>_<slug>.md
    skills/
```

The runtime appends run segments during the sandbox session. When the session
closes, memory generation first extracts conversation summaries and raw
memories, then consolidates those raw memories into `MEMORY.md` and
`memory_summary.md`. To reuse memory in a later run, preserve the configured
memory directories by keeping the same live sandbox session, resuming from
session state, starting from a snapshot, or mounting persistent storage such as
S3.

For multi-turn sandbox chats, use a stable SDK session together with the same
live sandbox session. Memory groups runs by the explicit conversation ID, then
the SDK session ID, then the run group ID, and finally a generated per-run ID.
The sandbox session ID identifies the live workspace; it's not the memory
conversation ID.

For runnable examples, see the TypeScript [memory guide][sdk-js-sandbox-memory],
plus Python [`memory.py`][sdk-example-memory] for a local snapshot flow,
[`memory_s3.py`][sdk-example-memory-s3] for S3-backed memory storage, and
[`memory_multi_agent_multiturn.py`][sdk-example-memory-multi-agent] for separate
memory layouts across agents.

## Compose sandbox agents

Sandbox agents compose with the rest of the SDK.

Use a handoff when a non-sandbox intake agent should delegate only the
workspace-heavy part of a workflow to a sandbox agent. The top-level run
continues, but the sandbox agent becomes the active agent for the next turn.

Use agents as tools when an outer orchestrator should call one or more sandbox
agents as nested tools. Each sandbox tool-agent can have its own sandbox run
configuration, sandbox client, manifest, and provider options.

For examples, see [`handoffs.py`][sdk-example-handoffs] and
[`sandbox_agents_as_tools.py`][sdk-example-agents-as-tools].

## Sandbox providers

Start with Unix-local for fast local iteration or Docker when you want local
container isolation. Move to a hosted provider when the task needs managed
execution, provider-specific isolation, scaling, previews, storage mounts,
snapshots, or credentials that should live outside your application server.

Use provider docs for provider-specific setup, credentials, isolation, storage,
previews, and persistence behavior.

| Provider   | SDK client                | Documentation and examples                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blaxel     | `BlaxelSandboxClient`     | <a href="https://docs.blaxel.ai/Sandboxes/Overview">Sandbox overview</a>                                                                                                                                                                                                                                                                                                                                                   |
| Cloudflare | `CloudflareSandboxClient` | <a href="https://developers.cloudflare.com/sandbox/">Sandbox documentation</a><br /><a href="https://docs.cloudflare.com/sandbox/tutorials/openai-agents/">OpenAI Agents tutorial</a><br /><a href="https://github.com/cloudflare/sandbox-sdk/tree/main/bridge/examples">Sandbox Bridge examples</a>                                                                                                                       |
| Daytona    | `DaytonaSandboxClient`    | <a href="https://www.daytona.io/docs/en/sandboxes/">Sandbox documentation</a><br /><a href="https://www.daytona.io/docs/en/guides/openai-agents/openai-agents-sdk-with-sandboxes">OpenAI Agents SDK guide</a>                                                                                                                                                                                                              |
| Docker     | `DockerSandboxClient`     | <a href="https://docs.docker.com/">Docker documentation</a><br /><a href="https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/docker-client.ts">TypeScript Docker SDK example</a><br /><a href="https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/docker/docker_runner.py">Python Docker SDK example</a>                                                             |
| E2B        | `E2BSandboxClient`        | <a href="https://e2b.dev/docs">Sandbox documentation</a><br /><a href="https://e2b.dev/docs/agents/openai-agents-sdk">OpenAI Agents SDK guide</a><br /><a href="https://e2b.dev/blog/e2b-is-now-in-agents-sdk">Launch blog</a>                                                                                                                                                                                             |
| Modal      | `ModalSandboxClient`      | <a href="https://modal.com/docs/guide/sandboxes">Sandbox guide</a><br /><a href="https://modal.com/blog/building-with-modal-and-the-openai-agent-sdk">Integration blog</a><br /><a href="https://github.com/modal-labs/openai-agents-python-example">Example repo</a><br /><a href="https://github.com/modal-labs/openai-agents-python-example?tab=readme-ov-file#modal-extension-reference">Modal extension reference</a> |
| Runloop    | `RunloopSandboxClient`    | <a href="https://docs.runloop.ai/docs/devboxes/overview">Devbox overview</a><br /><a href="https://docs.runloop.ai/docs/devboxes/tunnels">Tunnels</a>                                                                                                                                                                                                                                                                      |
| Unix-local | `UnixLocalSandboxClient`  | <a href="https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/basic.ts">TypeScript local SDK example</a><br /><a href="https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/unix_local_runner.py">Python local SDK example</a>                                                                                                                                           |
| Vercel     | `VercelSandboxClient`     | <a href="https://vercel.com/docs/vercel-sandbox">Sandbox documentation</a><br /><a href="https://vercel.com/kb/guide/building-an-agent-with-openai-agents-sdk-and-vercel-sandbox">OpenAI Agents SDK guide</a><br /><a href="https://vercel.com/templates/template/openai-agents-sdk-with-fastapi">FastAPI template</a><br /><a href="https://github.com/vercel-labs/openai-agents-fastapi-starter">Sample app</a>          |

[sdk-example-agents-as-tools]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/sandbox_agents_as_tools.py
[sdk-example-basic]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/basic.py
[sdk-example-dataroom]: https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/dataroom_metric_extract
[sdk-example-dataroom-qa]: https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/dataroom_qa
[sdk-example-docker-runner]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/docker/docker_runner.py
[sdk-example-handoffs]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/handoffs.py
[sdk-example-memory]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/memory.py
[sdk-example-memory-multi-agent]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/memory_multi_agent_multiturn.py
[sdk-example-memory-s3]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/memory_s3.py
[sdk-example-remote-snapshot]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/sandbox_agent_with_remote_snapshot.py
[sdk-example-repo-code-review]: https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/repo_code_review
[sdk-example-sandbox-resume]: https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/sandbox_resume
[sdk-example-unix-local-runner]: https://github.com/openai/openai-agents-python/blob/main/examples/sandbox/unix_local_runner.py
[sdk-example-vision-clone]: https://github.com/openai/openai-agents-python/tree/main/examples/sandbox/tutorials/vision_website_clone
[sdk-js-example-basic]: https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/basic.ts
[sdk-js-example-resume]: https://github.com/openai/openai-agents-js/blob/main/examples/docs/sandbox-agents/resume-session-state.ts
[sdk-js-sandbox-clients]: https://openai.github.io/openai-agents-js/guides/sandbox-agents/clients
[sdk-js-sandbox-memory]: https://openai.github.io/openai-agents-js/guides/sandbox-agents/memory
``````
:::
:::

