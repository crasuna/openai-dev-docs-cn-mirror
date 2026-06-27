---
status: needs-review
sourceId: "4036a936a988"
sourceChecksum: "4036a936a98855e2d256e4c87665f5e1b2b42c2c1aa094f69fee0e48f4f151f1"
sourceUrl: "https://developers.openai.com/api/docs/guides/tools-skills"
translatedAt: "2026-06-27T10:24:24.269Z"
translator: codex-gpt-5.5-xhigh
---

# Skills

Agent Skills 让你可以在 hosted 和 local shell environments 中上传并复用版本化的文件 bundle。

我们支持两种形态的 Skills：local execution 和 hosted、
  container-based execution。若要在你自己的机器上运行代码，请使用
  [shell tool](https://developers.openai.com/api/docs/guides/tools-shell) 的 local
  execution mode。

## 什么是 skill

Skill 是由一组文件和 `SKILL.md` manifest（front matter + instructions）组成的版本化 bundle。Skills 是模块化指令，可用于将流程和约定编码化，从公司风格指南到多步骤 workflow 都可以。

Skills 兼容开放的 [Agent Skills standard](https://agentskills.io/home)。

Example SKILL.md

```markdown
---
name: basic-math
description: Add or multiply numbers.
---

Use this skill when you need a quick sum or product of numbers.
```


## 创建 skill

你可以将目录作为 multipart form data 上传，也可以上传包含单个顶层文件夹的 `.zip`。

### 选项 1：目录上传（multipart）

上传多个 `files[]` parts。每个 part 都包含单个顶层文件夹内的路径。

创建 skill（multipart）

```bash
curl -X POST 'https://api.openai.com/v1/skills' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F 'files[]=@./basic_math/SKILL.md;filename=basic_math/SKILL.md;type=text/markdown' \
  -F 'files[]=@./basic_math/calculate.py;filename=basic_math/calculate.py;type=text/plain'
```


### 选项 2：Zip 上传

压缩顶层文件夹并上传该 zip 文件。

创建 skill（zip）

```bash
curl -X POST 'https://api.openai.com/v1/skills' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F 'files=@./basic_math.zip;type=application/zip'
```


## 在 hosted shell 中使用 skills

若要在 hosted shell environment 中挂载 skills，请在调用 shell tool 时通过 `tools[].environment.skills` 附加它们。

在 hosted shell 中使用 skills

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
          "type": "container_auto",
          "skills": [
            { "type": "skill_reference", "skill_id": "<skill_id>" },
            { "type": "skill_reference", "skill_id": "<skill_id>", "version": 2 }
          ]
        }
      }
    ],
    "input": "Use the skills to add 144 and 377, then compute triangle area with base 9 height 13."
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
        type: "container_auto",
        skills: [
          { type: "skill_reference", skill_id: "<skill_id>" },
          { type: "skill_reference", skill_id: "<skill_id>", version: 2 },
        ],
      },
    },
  ],
  input: "Use the skills to add 144 and 377, then compute triangle area with base 9 height 13.",
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
                "type": "container_auto",
                "skills": [
                    {"type": "skill_reference", "skill_id": "<skill_id>"},
                    {"type": "skill_reference", "skill_id": "<skill_id>", "version": 2},
                ],
            },
        }
    ],
    input="Use the skills to add 144 and 377, then compute triangle area with base 9 height 13.",
)

print(response.output_text)
```


### Prompting 行为

Skill 一旦挂载，模型就可以决定何时使用它。如果你想要更确定的行为，可以在适当时明确指示模型 "use the `<skill name>` skill"。

## 在 local shell mode 中使用 skills

Skills 也可以与 local shell mode 一起使用，但 local shell 和 hosted shell 不接受相同的 skill attachment formats。

- Hosted shell 支持上传的 `skill_reference` attachments，包括 curated skills 和显式版本。
- Local shell 不支持 `skill_reference` attachments。相反，应从你控制的 runtime 中的本地文件路径提供 skill files。

请使用 [Shell guide](https://developers.openai.com/api/docs/guides/tools-shell) 了解 local shell execution 详情。

在 local shell mode 中使用 skills

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
          "type": "local",
          "skills": [
            {
              "name": "csv-insights",
              "description": "Summarize CSV files and produce a markdown report.",
              "path": "<path-to-skill-folder>"
            }
          ]
        }
      }
    ],
    "input": "Use the csv-insights skill and run locally to summarize today\'s CSV reports in this repo."
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
        type: "local",
        skills: [
          {
            name: "csv-insights",
            description: "Summarize CSV files and produce a markdown report.",
            path: "<path-to-skill-folder>",
          },
        ],
      },
    },
  ],
  input: "Use the csv-insights skill and run locally to summarize today's CSV reports in this repo.",
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
                "type": "local",
                "skills": [
                    {
                        "name": "csv-insights",
                        "description": "Summarize CSV files and produce a markdown report.",
                        "path": "<path-to-skill-folder>",
                    }
                ],
            },
        }
    ],
    input="Use the csv-insights skill and run locally to summarize today's CSV reports in this repo.",
)

print(response.output_text)
```


## 用户 prompt 中的 Skills

当工具可用 skills 时，平台会将每个 skill 的 `name`、`description` 和 `path` 添加到用户 prompt 上下文中，让模型知道该 skill 存在。

模型会根据这些元数据决定是否调用 skill。如果模型调用了 skill，它会使用 `path` 从 `SKILL.md` 读取完整 Markdown 指令。

Skill instructions 是用户 prompt 输入（不是 system prompt 输入），因此它们与其他用户提供的指令具有相同优先级。若要显式控制，你仍然可以指示模型 "use the `<skill name>` skill"。

## 限制和验证

- `SKILL.md` 文件匹配不区分大小写。
- 一个 skill bundle 中只允许一个 `skill.md`/`SKILL.md` 文件。
- Skill front matter 验证遵循 [agent skills specification](https://agentskills.io/specification#name-field)。
- 最大 zip 上传大小为 `50 MB`。
- 每个 skill version 的最大文件数为 `500`。
- 最大未压缩文件大小为 `25 MB`。

## 网络访问安全

检查任何与 Responses API 一起使用的 Skill 非常重要。Skills
  会引入安全风险，例如由 prompt injection 驱动的数据外泄。
  在使用此工具之前，请仔细阅读下面的 [Risks and safety](#risks-and-safety) 部分。

## 版本控制和管理

### 版本指针

- 未提供版本时使用 `default_version`。
- `latest_version` 跟踪最新上传。
- `skill_reference.version` 接受整数或 `"latest"`。

### 创建新版本

创建新的 skill version

```bash
curl -X POST 'https://api.openai.com/v1/skills/<skill_id>/versions' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F 'files=@./geometry.zip;type=application/zip'
```


### 设置默认版本

设置 skill 的默认版本

```bash
curl -X POST 'https://api.openai.com/v1/skills/<skill_id>' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"default_version": 2}'
```


### 删除规则

- 不能删除 default version；请先设置另一个 default。
- 删除最后剩余的 version 会删除该 skill。
- 删除 skill 会级联移除所有 versions。

## Curated skills

OpenAI 维护了一组可按 id 引用的 first-party skills（例如 `openai-spreadsheets`）。

引用 curated skill

```json
{ "type": "skill_reference", "skill_id": "openai-spreadsheets", "version": "latest" }
```


## Inline skills

如果你不想创建 hosted skill，可以在 environment 的 `skills` 数组中 inline 一个 zip bundle（base64）。

Inline 一个 skill bundle

```bash
INLINE_ZIP=$(base64 -i ./basic_math.zip)

curl -L 'https://api.openai.com/v1/containers' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "name": "inline-skill-container",
    "skills": [
      {
        "type": "inline",
        "name": "basic_math",
        "description": "Add or multiply numbers.",
        "source": {
          "type": "base64",
          "media_type": "application/zip",
          "data": "'"$INLINE_ZIP"'"
        }
      }
    ]
  }'
```


## 风险和安全

检查任何与 Responses API 一起使用的 Skill 非常重要。Skills 会引入安全风险，例如由 prompt injection 驱动的数据外泄。

对于与网络访问结合使用的 Skills，请仔细阅读[网络相关的 Risks and safety 部分](https://developers.openai.com/api/docs/guides/tools-shell#risks-and-safety)。

#### 将 Skills 视为特权代码和指令

Skill 内容可以影响规划、工具使用和命令执行。在开发者验证之前，任何 Skill 都应被视为潜在不可信输入来审查。

### 不要向最终用户暴露开放 Skills repository

避免让消费者最终用户可以自由浏览、选择或附加开放 catalog 中任意 Skills 的产品设计。这会显著增加以下风险：

- 通过恶意 SKILL.md 指令进行 prompt-injection 和 policy bypass。
- 由未经审查的自动化触发数据外泄或破坏性操作。

#### 在开发者层面集成 Skills

Skills 应由开发者检查并集成，然后只通过有边界的产品体验暴露给最终用户。实践中：

- 将 Skills 映射到特定产品 workflows/use cases。
- 防止最终用户控制任意 Skill selection。
- 对写入或高影响操作设置显式 approval 和 policy checks。

#### 对敏感操作要求批准

对于可能执行写入或高影响操作的 workflows，请在执行前要求显式批准。

#### 验证数据驻留和保留要求

我们支持两种形态的 Skills：local execution 和 hosted container-based execution。Hosted skills 遵循与 hosted shell 相同的 container lifecycle：mounted skills 和 container files 会在 container 活跃期间保持可用，并在 container 过期或删除时被丢弃。如果你希望执行完全留在自己管理的基础设施上，请使用 local shell mode。请阅读更多关于我们[数据控制](https://developers.openai.com/api/docs/guides/your-data)的信息。
