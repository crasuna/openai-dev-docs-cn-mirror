---
status: needs-review
sourceId: "90c65ed261b9"
sourceChecksum: "90c65ed261b95965ec8e4779d70a2c7729331aa6fb9600ee3cfdcc747797fe7d"
sourceUrl: "https://developers.openai.com/api/docs/guides/tools-shell"
translatedAt: "2026-06-27T10:24:24.269Z"
translator: codex-gpt-5.5-xhigh
---

# Shell 工具

Shell tool 赋予模型在完整终端环境中工作的能力。我们支持用于本地执行的 shell，也支持通过 Responses API 进行 hosted execution。

Shell tool 让模型可以通过以下任一方式运行命令：

- 由 OpenAI 管理的 hosted shell containers。
- 由你托管并自行执行的 [local shell runtime](#local-shell-mode)。

Shell 可通过 [Responses API](https://developers.openai.com/api/docs/guides/responses-vs-chat-completions) 使用。它不能通过 Chat Completions API 使用。

运行任意 shell 命令可能很危险。始终应对执行进行沙箱隔离，
  尽可能应用 allowlists 或 denylists，并记录工具活动以便
  审计。

## Hosted shell quickstart

Hosted shell 是一种原生且精简的选项，适用于需要更丰富、确定性处理的任务，从运行计算到处理多媒体都可以。

当你希望 OpenAI 为请求配置并管理 container 时，请使用 `container_auto`。

使用 container_auto 的 Shell tool

```bash
curl -L 'https://api.openai.com/v1/responses' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "tools": [
      { "type": "shell", "environment": { "type": "container_auto" } }
    ],
    "input": [
      {
        "type": "message",
        "role": "user",
        "content": [
          { "type": "input_text", "text": "Execute: ls -lah /mnt/data && python --version && node --version" }
        ]
      }
    ],
    "tool_choice": "auto"
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  tools: [{ type: "shell", environment: { type: "container_auto" } }],
  input: [
    {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: "Execute: ls -lah /mnt/data && python --version && node --version",
        },
      ],
    },
  ],
  tool_choice: "auto",
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[{"type": "shell", "environment": {"type": "container_auto"}}],
    input=[
        {
            "type": "message",
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "Execute: ls -lah /mnt/data && python --version && node --version",
                }
            ],
        }
    ],
    tool_choice="auto",
)

print(response.output_text)
```


## Hosted runtime 详情

- Runtime 目前基于 `Debian 12`，并且可能随时间变化。
- 默认工作目录是 `/mnt/data`。
- `/mnt/data` 始终存在，并且是支持用户下载 artifacts 的路径。
- Hosted shell 不支持 interactive TTY sessions。
- Hosted shell commands 不会以 `sudo` 运行。
- 当 workflow 需要时，你可以在 container 内运行 services。

当前预装语言包括：

- Python `3.11`
- Node.js `22.16`
- Java `17.0`
- PHP `8.2`
- Ruby `3.1`
- Go `1.23`

## 跨请求复用 container

如果你需要为迭代式 workflows 提供长时间运行的环境，请创建一个 container，然后在后续 Responses API 调用中引用它。

### 1. 创建 container

创建可复用 container

```bash
curl -L 'https://api.openai.com/v1/containers' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "name": "analysis-container",
    "memory_limit": "1g",
    "expires_after": { "anchor": "last_active_at", "minutes": 20 }
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const container = await client.containers.create({
  name: "analysis-container",
  memory_limit: "1g",
  expires_after: { anchor: "last_active_at", minutes: 20 },
});

console.log(container.id);
```

```python
from openai import OpenAI

client = OpenAI()

container = client.containers.create(
    name="analysis-container",
    memory_limit="1g",
    expires_after={"anchor": "last_active_at", "minutes": 20},
)

print(container.id)
```


### 2. 在 Responses 中引用 container

使用 container_reference 的 shell

```bash
curl -L 'https://api.openai.com/v1/responses' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "tools": [
      {
        "type": "shell",
        "environment": {
          "type": "container_reference",
          "container_id": "cntr_08f3d96c87a585390069118b594f7481a088b16cda7d9415fe"
        }
      }
    ],
    "input": "List files in the container and show disk usage."
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    {
      type: "shell",
      environment: {
        type: "container_reference",
        container_id: "cntr_08f3d96c87a585390069118b594f7481a088b16cda7d9415fe",
      },
    },
  ],
  input: "List files in the container and show disk usage.",
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[
        {
            "type": "shell",
            "environment": {
                "type": "container_reference",
                "container_id": "cntr_08f3d96c87a585390069118b594f7481a088b16cda7d9415fe",
            },
        }
    ],
    input="List files in the container and show disk usage.",
)

print(response.output_text)
```


## 附加 skills

Skills 是可复用、版本化的 bundles，可以挂载到 hosted shell environments 中。这会定义可用 skills，并且在 shell 执行时，由模型决定是否调用它们。

请使用 [Skills guide](https://developers.openai.com/api/docs/guides/tools-skills) 了解上传和版本控制详情。

创建附加 skills 的 container

```bash
curl -L 'https://api.openai.com/v1/containers' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "name": "skill-container",
    "skills": [
      { "type": "skill_reference", "skill_id": "skill_4db6f1a2c9e73508b41f9da06e2c7b5f" },
      { "type": "skill_reference", "skill_id": "openai-spreadsheets", "version": "latest" }
    ]
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const container = await client.containers.create({
  name: "skill-container",
  skills: [
    { type: "skill_reference", skill_id: "skill_4db6f1a2c9e73508b41f9da06e2c7b5f" },
    { type: "skill_reference", skill_id: "openai-spreadsheets", version: "latest" },
  ],
});

console.log(container.id);
```

```python
from openai import OpenAI

client = OpenAI()

container = client.containers.create(
    name="skill-container",
    skills=[
        {"type": "skill_reference", "skill_id": "skill_4db6f1a2c9e73508b41f9da06e2c7b5f"},
        {"type": "skill_reference", "skill_id": "openai-spreadsheets", "version": "latest"},
    ],
)

print(container.id)
```


## 网络访问

Hosted containers 默认没有出站网络访问。

要启用它：

1. Admin 必须在 dashboard 中配置你的 org allow list。
2. 你必须在请求中的 container environment 上显式设置 `network_policy`。

带 network allowlist 的 Shell tool

```bash
curl -L 'https://api.openai.com/v1/responses' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "tool_choice": "required",
    "tools": [
      {
        "type": "shell",
        "environment": {
          "type": "container_auto",
          "network_policy": {
            "type": "allowlist",
            "allowed_domains": ["pypi.org", "files.pythonhosted.org", "github.com"]
          }
        }
      }
    ],
    "input": [
      {
        "role": "user",
        "content": "In the container, pip install httpx beautifulsoup4, fetch release pages, and write /mnt/data/release_digest.md."
      }
    ]
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  tool_choice: "required",
  tools: [
    {
      type: "shell",
      environment: {
        type: "container_auto",
        network_policy: {
          type: "allowlist",
          allowed_domains: ["pypi.org", "files.pythonhosted.org", "github.com"],
        },
      },
    },
  ],
  input: [
    {
      role: "user",
      content:
        "In the container, pip install httpx beautifulsoup4, fetch release pages, and write /mnt/data/release_digest.md.",
    },
  ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tool_choice="required",
    tools=[
        {
            "type": "shell",
            "environment": {
                "type": "container_auto",
                "network_policy": {
                    "type": "allowlist",
                    "allowed_domains": ["pypi.org", "files.pythonhosted.org", "github.com"],
                },
            },
        }
    ],
    input=[
        {
            "role": "user",
            "content": "In the container, pip install httpx beautifulsoup4, fetch release pages, and write /mnt/data/release_digest.md.",
        }
    ],
)

print(response.output_text)
```


Allowlisting domains 会引入安全风险，例如由 prompt
  injection 驱动的数据外泄。只 allowlist 你信任且
  攻击者无法用来接收外泄数据的 domains。使用此工具前，请仔细阅读下面的 [Risks
  and safety](#risks-and-safety) 部分。

## Network policy 优先级

当存在多个控制项时：

- 你的 org allow list 定义完整的 `allowed_domains` 集合。
- Request-level `network_policy` 会进一步限制访问。
- 如果 `allowed_domains` 包含 org allow list 之外的 domains，请求会失败。

## 数据保留与 container 生命周期

Hosted Shell 和 Code Interpreter 使用的 hosted containers 在活跃期间，可能会将临时应用状态写入 container filesystem（由 ephemeral block storage 支持）。Container data 会在 container 过期或被显式删除时删除。

关于数据控制的更多详情，请参阅 [ZDR and data residency](https://developers.openai.com/api/docs/guides/your-data)。

### 下载 artifacts

Hosted shell 可以生成可下载文件。使用与 code interpreter 相同的 container/files APIs 来检索写入 `/mnt/data` 下的 artifacts。

### 其他数据控制

如果你想在 hosted lifecycle 内保持内容和文件短暂存在，可以在请求中 inline files，并在 container 中挂载 inline skills。

使用 inline files 和 inline skills

```bash
INLINE_ZIP=$(base64 -i ./csv_insights.zip)
REPORT_CSV=$(base64 -i ./report.csv)

CONTAINER_ID=$(
  curl -sL 'https://api.openai.com/v1/containers' \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
      "name": "inline-skill-container",
      "skills": [
        {
          "type": "inline",
          "name": "csv-insights",
          "description": "Summarize CSV files and produce a markdown report.",
          "source": {
            "type": "base64",
            "media_type": "application/zip",
            "data": "'"$INLINE_ZIP"'"
          }
        }
      ]
    }' | jq -r '.id'
)

curl -L 'https://api.openai.com/v1/responses' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "tools": [
      {
        "type": "shell",
        "environment": {
          "type": "container_reference",
          "container_id": "'"$CONTAINER_ID"'"
        }
      }
    ],
    "input": [
      {
        "role": "user",
        "content": [
          {
            "type": "input_file",
            "filename": "report.csv",
            "file_data": "data:text/csv;base64,'"${REPORT_CSV}"'"
          },
          {
            "type": "input_text",
            "text": "Use the csv-insights skill to summarize report.csv."
          }
        ]
      }
    ]
  }'
```

```javascript
import fs from "fs";
import OpenAI from "openai";

const client = new OpenAI();

const inlineZip = fs.readFileSync("csv_insights.zip").toString("base64");
const reportCsv = fs.readFileSync("report.csv").toString("base64");

const container = await client.containers.create({
  name: "inline-skill-container",
  skills: [
    {
      type: "inline",
      name: "csv-insights",
      description: "Summarize CSV files and produce a markdown report.",
      source: {
        type: "base64",
        media_type: "application/zip",
        data: inlineZip,
      },
    },
  ],
});

const response = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    {
      type: "shell",
      environment: {
        type: "container_reference",
        container_id: container.id,
      },
    },
  ],
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_file",
          filename: "report.csv",
          file_data: `data:text/csv;base64,${reportCsv}`,
        },
        {
          type: "input_text",
          text: "Use the csv-insights skill to summarize report.csv.",
        },
      ],
    },
  ],
});

console.log(response.output_text);
```

```python
import base64
from openai import OpenAI

client = OpenAI()

with open("csv_insights.zip", "rb") as f:
    inline_zip = base64.b64encode(f.read()).decode("utf-8")

with open("report.csv", "rb") as f:
    base64_string = base64.b64encode(f.read()).decode("utf-8")

container = client.containers.create(
    name="inline-skill-container",
    skills=[
        {
            "type": "inline",
            "name": "csv-insights",
            "description": "Summarize CSV files and produce a markdown report.",
            "source": {
                "type": "base64",
                "media_type": "application/zip",
                "data": inline_zip,
            },
        }
    ],
)

response = client.responses.create(
    model="gpt-5.5",
    tools=[
        {
            "type": "shell",
            "environment": {
                "type": "container_reference",
                "container_id": container.id,
            },
        }
    ],
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_file",
                    "filename": "report.csv",
                    "file_data": f"data:text/csv;base64,{base64_string}",
                },
                {
                    "type": "input_text",
                    "text": "Use the csv-insights skill to summarize report.csv.",
                },
            ],
        }
    ],
)

print(response.output_text)
```


对于后续请求，请使用 `container_reference` 传入同一个 `container_id`。只要 container 处于活跃状态，mounted skills 和现有 container files 就会保持可用。

### 主动删除 container

你可以在工作完成后显式删除 container，而不是等待 inactivity expiration。

删除 container

```bash
curl -L -X DELETE 'https://api.openai.com/v1/containers/container_id' \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const deleted = await client.containers.delete("container_id");

console.log(deleted);
```

```python
from openai import OpenAI

client = OpenAI()

deleted = client.containers.delete("container_id")

print(deleted)
```


## Domain secrets

当 `allowed_domains` 列表中的 domain 需要私有 authorization headers（例如 `Authorization: Bearer <token>`）时，请使用 `domain_secrets`。

每个 secret entry 包含：

- Target domain
- Friendly secret name
- Secret value

运行时：

- 模型和 runtime 会看到 placeholder names（例如 `$API_KEY`），而不是原始凭据。
- Auth-translation sidecar 只会对 approved destinations 应用原始 secret values。
- 原始 secret values 不会保留在 API servers 上，也不会出现在模型可见上下文中。

这让 assistant 可以调用受保护服务，同时降低泄露风险。

带 domain_secrets 的 Shell tool

```bash
curl -L 'https://api.openai.com/v1/responses' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": [
      {
        "role": "user",
        "content": "Use curl to call https://httpbin.org/headers with header Authorization: Bearer $API_KEY. Tell me what you see in the final text response."
      }
    ],
    "tool_choice": "required",
    "tools": [
      {
        "type": "shell",
        "environment": {
          "type": "container_auto",
          "network_policy": {
            "type": "allowlist",
            "allowed_domains": ["httpbin.org"],
            "domain_secrets": [
              {
                "domain": "httpbin.org",
                "name": "API_KEY",
                "value": "debug-secret-123"
              }
            ]
          }
        }
      }
    ]
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content:
        "Use curl to call https://httpbin.org/headers with header Authorization: Bearer $API_KEY. Tell me what you see in the final text response.",
    },
  ],
  tool_choice: "required",
  tools: [
    {
      type: "shell",
      environment: {
        type: "container_auto",
        network_policy: {
          type: "allowlist",
          allowed_domains: ["httpbin.org"],
          domain_secrets: [
            {
              domain: "httpbin.org",
              name: "API_KEY",
              value: "debug-secret-123",
            },
          ],
        },
      },
    },
  ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": "Use curl to call https://httpbin.org/headers with header Authorization: Bearer $API_KEY. Tell me what you see in the final text response.",
        }
    ],
    tool_choice="required",
    tools=[
        {
            "type": "shell",
            "environment": {
                "type": "container_auto",
                "network_policy": {
                    "type": "allowlist",
                    "allowed_domains": ["httpbin.org"],
                    "domain_secrets": [
                        {
                            "domain": "httpbin.org",
                            "name": "API_KEY",
                            "value": "debug-secret-123",
                        }
                    ],
                },
            },
        }
    ],
)

print(response.output_text)
```


## Multi-turn workflows

要在同一 hosted environment 中继续工作，请复用 container 并传入 `previous_response_id`。

继续 shell workflow

```bash
curl -L 'https://api.openai.com/v1/responses' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "previous_response_id": "resp_2a8e5c9174d63b0f18a4c572de9f64a1b3c76d508e12f9ab47",
    "tools": [
      {
        "type": "shell",
        "environment": {
          "type": "container_reference",
          "container_id": "cntr_f19c2b51e4a06793d82d54a7be0fc9154d3361ab28ce7f6041"
        }
      }
    ],
    "input": "Read /mnt/data/top5.csv and report the top candidate."
  }'
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  previous_response_id: "resp_2a8e5c9174d63b0f18a4c572de9f64a1b3c76d508e12f9ab47",
  tools: [
    {
      type: "shell",
      environment: {
        type: "container_reference",
        container_id: "cntr_f19c2b51e4a06793d82d54a7be0fc9154d3361ab28ce7f6041",
      },
    },
  ],
  input: "Read /mnt/data/top5.csv and report the top candidate.",
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    previous_response_id="resp_2a8e5c9174d63b0f18a4c572de9f64a1b3c76d508e12f9ab47",
    tools=[
        {
            "type": "shell",
            "environment": {
                "type": "container_reference",
                "container_id": "cntr_f19c2b51e4a06793d82d54a7be0fc9154d3361ab28ce7f6041",
            },
        }
    ],
    input="Read /mnt/data/top5.csv and report the top candidate.",
)

print(response.output_text)
```


## Responses 中的 Shell output

Hosted shell 和 local shell 使用相同的 output item types。Shell runs 表示为成对的 output items：

- `shell_call`：模型请求的命令。
- `shell_call_output`：命令输出和退出结果。

示例 shell_call item

```json
{
  "type": "shell_call",
  "call_id": "call_9d14ac6f2b73485e91c0f4da6e1b27c8",
  "action": {
    "commands": ["ls -l"],
    "timeout_ms": 120000,
    "max_output_length": 4096
  },
  "status": "in_progress"
}
```


## Local shell mode

你也可以在自己的 local runtime 中运行 shell commands，方法是执行 `shell_call` actions，并将 `shell_call_output` 发回模型。

当你需要完全控制 execution environment、filesystem access 或现有内部 tooling 时，请使用此模式。

Local shell request

```bash
curl -L 'https://api.openai.com/v1/responses' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "instructions": "The local bash shell environment is on Mac.",
    "input": "find me the largest pdf file in ~/Documents",
    "tools": [{ "type": "shell", "environment": { "type": "local" } }]
  }'
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    instructions="The local bash shell environment is on Mac.",
    input="find me the largest pdf file in ~/Documents",
    tools=[{"type": "shell", "environment": {"type": "local"}}],
)

print(response)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    instructions: "The local bash shell environment is on Mac.",
    input: "find me the largest pdf file in ~/Documents",
    tools: [{ type: "shell", environment: { type: "local" } }],
});

console.log(response);
```


当你收到 `shell_call` output items 时：

- 在你的 runtime 中执行请求的 commands。
- 捕获 `stdout`、`stderr` 和 outcome。
- 在下一个请求中以 `shell_call_output` 返回结果。

Local shell executor 示例

```python
@dataclass
class CmdResult:
    stdout: str
    stderr: str
    exit_code: int | None
    timed_out: bool

class ShellExecutor:
    def __init__(self, default_timeout: float = 60):
        self.default_timeout = default_timeout

    def run(self, cmd: str, timeout: float | None = None) -> CmdResult:
        t = timeout or self.default_timeout
        p = subprocess.Popen(
            cmd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        try:
            out, err = p.communicate(timeout=t)
            return CmdResult(out, err, p.returncode, False)
        except subprocess.TimeoutExpired:
            p.kill()
            out, err = p.communicate()
            return CmdResult(out, err, p.returncode, True)
```

```javascript
import { exec } from "node:child_process/promises";

class ShellExecutor {
    constructor(defaultTimeoutMs = 60_000) {
        this.defaultTimeoutMs = defaultTimeoutMs;
    }

    async run(cmd, timeoutMs) {
        const timeout = timeoutMs ?? this.defaultTimeoutMs;

        try {
            const { stdout, stderr } = await exec(cmd, { timeout });
            return { stdout, stderr, exitCode: 0, timedOut: false };
        } catch (error) {
            const timedOut = Boolean(error?.killed) && error?.signal === "SIGTERM";
            const exitCode = timedOut ? null : error?.code ?? null;
            return {
                stdout: error?.stdout ?? "",
                stderr: error?.stderr ?? String(error),
                exitCode,
                timedOut,
            };
        }
    }
}
```


示例 shell_call_output payload

```json
{
  "type": "shell_call_output",
  "call_id": "call_3ef1b8c79a4d6520f9e3ab7d41c68f25",
  "max_output_length": 4096,
  "output": [
    {
      "stdout": "...",
      "stderr": "...",
      "outcome": {
        "type": "exit",
        "exit_code": 0
      }
    },
    {
      "stdout": "...",
      "stderr": "...",
      "outcome": {
        "type": "timeout"
      }
    }
  ]
}
```


有关旧版迁移详情，请参阅较早的 [Local shell guide](https://developers.openai.com/api/docs/guides/tools-local-shell)。

## 将 local shell 与 Agents SDK 一起使用

如果你正在使用 [Agents SDK](https://developers.openai.com/api/docs/guides/tools#usage-in-the-agents-sdk)，可以将自己的 shell executor implementation 传给 shell tool helper。

将 local shell 与 Agents SDK 一起使用

```javascript
import {
  Agent,
  run,
  withTrace,
  Shell,
  ShellAction,
  ShellResult,
  shellTool,
} from "@openai/agents";

class LocalShell implements Shell {
  async run(action: ShellAction): Promise<ShellResult> {
    return {
      output: [
        {
          stdout: "Shell is not available. Needs to be implemented first.",
          stderr: "",
          outcome: {
            type: "exit",
            exitCode: 1,
          },
        },
      ],
      maxOutputLength: action.maxOutputLength,
    };
  }
}

const shell = new LocalShell();

const agent = new Agent({
  name: "Shell Assistant",
  model: "gpt-5.5",
  instructions:
    "You can execute shell commands to inspect the repository. Keep responses concise and include command output when helpful.",
  tools: [
    shellTool({
      shell,
      needsApproval: true,
      onApproval: async (_ctx, _approvalItem) => {
        return { approve: true };
      },
    }),
  ],
});

await withTrace("shell-tool-example", async () => {
  const result = await run(agent, "Show the Node.js version.");
  console.log(`\nFinal response:\n${result.finalOutput}`);
});
```

```python
from agents import (
    Agent,
    Runner,
    ShellCallOutcome,
    ShellCommandOutput,
    ShellCommandRequest,
    ShellResult,
    ShellTool,
)


class LocalShell:
    async def __call__(self, request: ShellCommandRequest) -> ShellResult:
        action = request.data.action
        return ShellResult(
            output=[
                ShellCommandOutput(
                    command="(not executed)",
                    stdout="Shell is not available. Needs to be implemented first.",
                    stderr="",
                    outcome=ShellCallOutcome(type="exit", exit_code=1),
                )
            ],
            max_output_length=action.max_output_length,
        )


shell_tool = ShellTool(
    executor=LocalShell(),
    needs_approval=True,
    on_approval=lambda _ctx, _approval_item: {"approve": True},
)

agent = Agent(
    name="Shell Assistant",
    model="gpt-5.5",
    instructions="You can execute shell commands to inspect the repository. Keep responses concise and include command output when helpful.",
    tools=[shell_tool],
)


async def main():
    result = await Runner.run(agent, input="Show the Node.js version.")
    print(f"\nFinal response:\n{result.final_output}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
```


你可以在 SDK repositories 中找到可运行示例。

<a href="https://github.com/openai/openai-agents-js/blob/main/examples/tools/shell.ts" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    Agents SDK 中 shell tool 的 TypeScript 示例。


</a>

<a href="https://github.com/openai/openai-agents-python/blob/main/examples/tools/shell.py" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    Agents SDK 中 shell tool 的 Python 示例。


</a>

## 处理常见错误

- 如果命令超过 execution timeout，请返回 timeout outcome，并包含捕获到的部分输出。
- 如果 `shell_call` 中存在 `max_output_length`，请在 `shell_call_output` 中包含它。
- 不要依赖 interactive commands；shell tool execution 应该是非交互式的。
- 保留非零退出输出，以便模型可以推理恢复步骤。

## 风险和安全

在 Containers API 中启用网络访问是一项强大能力，并且会引入有意义的安全和数据治理风险。默认情况下，网络访问未启用。启用后，出站访问应严格限制在任务所需的受信任 domains 内。

启用网络的 containers 可以与第三方服务和 package registries 交互。这会带来包括数据泄露、由 prompt-injection 驱动的工具误用，以及意外访问超出预期边界的风险。当 policies 过宽、静态或执行不一致时，这些风险会增加。

#### 理解来自网络检索内容的 prompt injection 风险

任何通过网络获取的外部内容都可能包含隐藏指令，意图操纵模型行为。请将不受信任的网络内容视为潜在对抗性内容，并对可能修改数据或系统的操作要求额外谨慎。

#### 只连接到受信任目标

只允许你信任并主动维护的 domains。谨慎对待会代理到其他服务的 intermediaries 和 aggregators，并在将它们添加到 allowed domains list 前审查其数据处理和保留实践。

#### 在请求执行前后建立审查

审查 Responses API response 中提供的 shell tool command 和 execution output。捕获每个 session 的 requested hosts 和实际 outbound destinations。定期审查日志，以验证访问模式符合预期、检测漂移并识别可疑行为。

#### 验证数据驻留和保留要求

[OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data) 适用于 OpenAI 边界内。然而，通过网络连接传输到第三方服务的数据受其数据保留政策约束。请确保外部 endpoints 符合你的 residency、retention 和 compliance requirements。
