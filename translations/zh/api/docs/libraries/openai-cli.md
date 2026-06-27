---
status: needs-review
sourceId: "d659dfb8cec8"
sourceChecksum: "d659dfb8cec8e92261ee2fc724c2f8fb020743ef55d9edd88b8f1ec8d9f9acef"
sourceUrl: "https://developers.openai.com/api/docs/libraries/openai-cli"
translatedAt: "2026-06-27T18:00:38.1935616+08:00"
translator: codex-gpt-5.5-xhigh
---

# OpenAI CLI

使用 `openai` 命令行工具，直接从终端与 OpenAI API 交互。

## 安装

使用 Homebrew 安装 CLI：

```bash
brew install openai/tools/openai
```

或者使用 Go 1.25 或更高版本安装：

```bash
go install 'github.com/openai/openai-cli/cmd/openai@latest'
```

较早版本的 Python SDK 也会安装一个旧版 `openai` 命令。如果你已经安装过那个包，并且你看到的命令行为与本指南不一致，你的 shell 可能仍在解析到旧的二进制文件。全新的 CLI 安装不受影响。

## 身份验证

CLI 会从 `OPENAI_API_KEY` 读取你的 API key：

命令：

```bash
export OPENAI_API_KEY="sk-..."
```

如果你还没有 API key，请[在 dashboard 中创建一个](https://platform.openai.com/api-keys)。

对于 Admin API endpoint，请改为设置 `OPENAI_ADMIN_KEY`。SDK 层会根据被调用的 endpoint 选择 admin key 或默认 API key。

如需指向不同的 API host，请设置 `OPENAI_BASE_URL`。

## 使用场景

当工作天然属于终端时，请使用 CLI：

- 生成图片或语音等本地产物。
- 将结构化数据提取为 JSONL，供后续 shell 步骤使用。
- 在云端使用带文件、computer use 和当前 web 上下文的 Responses。
- 使用 Admin APIs 创建项目和 API keys。

你可以直接用它处理一次性的终端请求，也可以在 agent 需要对文件和生成产物执行可重复批处理时，从脚本中调用它。

## CLI 与 Codex subagents 的取舍

对于你希望检查并重新运行的可重复 API 工作，请使用 CLI，例如批量提取、文件转换、产物生成，或有意选择模型。对于仍需要判断力的工作，请使用 subagents，例如探索代码、比较假设、调试或审查变更。

## 全局标志

这些选项适用于所有命令：

| 标志          | 用途                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| `--format`    | 以 `auto`、`json`、`jsonl`、`pretty`、`raw`、`yaml` 或 `explore` 打印响应。                           |
| `--transform` | 在打印前使用 GJSON path 提取或重塑响应数据。                                          |
| `--debug`     | 将请求和响应详情打印到 stderr。Authorization 会被遮蔽；共享日志前请检查 headers。 |

本指南聚焦 CLI 模式。对于任何 API 系列的最新参数和响应形状，请使用实时 [API reference](https://developers.openai.com/api/reference)。

当你需要将 CLI 指向其他兼容 endpoint 时，也可以更改 base URL，例如某个支持不同模型集合或仅支持 API surface 子集的部署。

## Responses

使用 Responses 进行文本生成、结构化提取、web search、文件理解，以及可重复的 Codex 编写批处理脚本。

### 发送你的第一个请求

命令：

```bash
openai responses create \
  --model gpt-5.5 \
  --input "Say hello in one sentence."
```


输出：

```json
{
  "id": "resp_...",
  "object": "response",
  "status": "completed",
  "model": "gpt-5.5-...",
  "output": [
    {
      "type": "message",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "Hello!"
        }
      ]
    }
  ],
  "usage": {
    "input_tokens": 12,
    "output_tokens": 6,
    "total_tokens": 18
  },
  "...": "additional response fields omitted"
}
```

默认情况下，CLI 会打印完整的 API 响应对象。本页示例保留 `id`、`status`、`model`、`output` 和 `usage` 等代表性字段，并省略其余部分。

Responses 输出可能包含非 message 项，例如位于 assistant message 之前的 reasoning 项。当你需要 assistant 文本时，请按类型选择 message 项，而不是假定它始终是 `output[0]`：

```bash
--transform 'output.#(type=="message").content.0.text'
```

### 将本地文件添加到 prompt

对于简单的本地文件，可以使用命令替换内联构建 prompt：

```bash
openai responses create \
  --model gpt-5.5 \
  --input "Summarize this note in one sentence.

<note>
$(cat ./note.md)
</note>" \
  --format yaml \
  --transform 'output.#(type=="message").content.0.text'
```


输出：

```text
The note says the launch checklist is ready except for final support ownership.
```

### 传递请求体

短的标量输入请使用 flags。对于多行 prompts、tools、files 或嵌套请求体，请使用 YAML heredoc。heredoc 可以包含你原本会作为 flags 传入的相同请求字段。

请小心看起来像 YAML 的字符串值，尤其是包含 `:` 或 `{}` 的 prompts。在 flags 上，生成的解析器可能会把这些值解释为结构化 YAML，而不是纯文本。如果某个 prompt 开始看起来像配置，请改为把它放在 YAML body 的 `input: |` 下：

命令：

```bash
openai responses create \
  --format yaml \
  --transform 'output.#(type=="message").content.0.text' <<'YAML'
model: gpt-5.5
instructions: Return exactly one sentence.
max_output_tokens: 120
input: |
  Summarize this release note in one sentence.

  <release_note>
  Fixed the image generation example and added CLI installation guidance.
  </release_note>
YAML
```


输出：

```text
The release note updates the CLI docs with corrected image generation and installation guidance.
```

当 prompt 本身需要 shell 组装时，请构建 YAML body 并通过管道传给命令：

```bash
{
  printf 'input: |\n'
  printf '  Summarize this note in one sentence.\n\n'
  printf '  <note>\n'
  sed 's/^/  /' ./note.md
  printf '  </note>\n'
} | openai responses create \
  --model gpt-5.5 \
  --format yaml \
  --transform 'output.#(type=="message").content.0.text'
```


### 将结构化数据写入 JSON

当下游脚本需要稳定 JSON 时，请使用 structured outputs。将可复用 schemas 保存到磁盘：

保存为 `schema.json`：

```json
{
  "type": "json_schema",
  "name": "fact",
  "strict": true,
  "schema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "person": { "type": "string" },
      "topic": { "type": "string" }
    },
    "required": ["person", "topic"]
  }
}
```

命令：

```bash
openai responses create \
  --model gpt-5.5 \
  --instructions "Extract the person and topic from the input." \
  --input "Ada Lovelace wrote notes about the Analytical Engine." \
  --text.format "$(cat ./schema.json)" \
  --format yaml \
  --transform 'output.#(type=="message").content.0.text'
```


输出：

```json
{ "person": "Ada Lovelace", "topic": "notes about the Analytical Engine" }
```

### 将结构化记录写入 JSONL

当一个输入可能产生多条记录时，让模型返回数组，并将其展平为 JSONL，这样后续 shell 步骤就可以逐行处理每条记录：

保存为 `records-schema.json`：

```json
{
  "type": "json_schema",
  "name": "items",
  "strict": true,
  "schema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "title": { "type": "string" },
            "summary": { "type": "string" },
            "evidence": { "type": "string" }
          },
          "required": ["title", "summary", "evidence"]
        }
      }
    },
    "required": ["items"]
  }
}
```

命令：

```bash
: > records.jsonl

for file in notes/*.md; do
  extracted="$(
    openai responses create \
      --model gpt-5.5 \
      --text.format "$(cat ./records-schema.json)" \
      --raw-output \
      --transform 'output.#(type=="message").content.0.text' <<YAML
input: |
  <note path="$file">
$(sed 's/^/  /' "$file")
  </note>
YAML
  )"

  jq -r --arg source "$file" \
    '.items[]? + {source: $source} | @json' \
    <<<"$extracted" >> records.jsonl
done
```


这样可以让模型响应保持结构化，同时为后续 shell 步骤生成每行一个 JSON 对象的输出。

### Web search

Responses 可以从同一个 YAML 请求体调用 hosted tools：

命令：

```bash
openai responses create \
  --model gpt-5.5 \
  --format yaml \
  --transform 'output.#(type=="message").content.0.text' <<'YAML'
tools:
  - type: web_search
input: |
  Research the latest material news for AAPL.
  Return three concise bullets and cite sources in the text.
YAML
```


输出：

```text
- Apple announced ...
- Analysts highlighted ...
- The company said ...
```

### 文件输入

对于已上传的文件（例如 PDF），请先创建文件、捕获其 ID，然后以 `input_file.file_id` 传入：

命令：

```bash
FILE_ID=$(
  openai files create \
    --file ./brief.pdf \
    --purpose user_data \
    --format yaml \
    --transform id
)

openai responses create \
  --model gpt-5.5 \
  --format yaml \
  --transform 'output.#(type=="message").content.0.text' <<YAML
input:
  - role: user
    content:
      - type: input_text
        text: Summarize this brief and list three risks.
      - type: input_file
        file_id: ${FILE_ID}
YAML
```


输出：

```text
- The brief proposes ...
- Risks: migration timing, unclear rollback criteria, and unresolved support ownership.
```

最近生成的构建会把本地文件 flags 作为 multipart file parts 发送，并带有 filename 和 content type 元数据。如果本地上传命令因 `UploadFile` 类型错误而失败，请更新 CLI 后重试。

## Images

### 生成图片

生成图片、提取 base64 payload，并将其解码为普通 asset 文件：

命令：

```bash
openai images generate \
  --model gpt-image-2 \
  --prompt "A simple product-style render of a translucent green cube on a neutral background." \
  --format yaml \
  --transform 'data.0.b64_json' | base64 --decode > hero.png
printf 'wrote hero.png\n'
```


输出：

```text
wrote hero.png
```

当前限制：image commands 还没有原生 `--output` 支持，因此 image generation 仍需要提取 `b64_json` 并自行解码。

对于 `gpt-image-2`，请省略 `--input-fidelity`；image inputs 始终以 high fidelity 处理。不要将 `--background transparent` 与 `gpt-image-2` 一起使用。只要请求的分辨率满足 Image API size 约束，该模型还支持比早期 GPT Image 模型更宽的 `--size` 值范围。

### 编辑图片

Image editing 在 edit request 成功后使用相同的 base64 提取模式：

命令：

```bash
openai images edit \
  --model gpt-image-2 \
  --image ./hero.png \
  --prompt "Turn the cube bright green." \
  --format yaml \
  --transform 'data.0.b64_json' | base64 --decode > hero-edited.png
printf 'wrote hero-edited.png\n'
```


输出：

```text
wrote hero-edited.png
```

如果本地 image edit upload 因 `UploadFile` 类型错误而失败，请更新 CLI 后重试。

## Speech

使用 speech API 在本地创建 MP3：

命令：

```bash
openai audio:speech create \
  --model gpt-4o-mini-tts \
  --voice marin \
  --input "The OpenAI CLI can call the API from ordinary shell scripts." \
  --output speech.mp3
```


输出：

```text
Wrote output to: speech.mp3
```

使用你机器上可用的任意本地音频工具播放。在 macOS 上：

```bash
afplay speech.mp3
```

使用 `--instructions` 塑造朗读方式，使用 `--input` 提供要朗读的文字。Instructions 很适合表达节奏、能量、温度、正式程度、强调或受众等提示：

```bash
openai audio:speech create \
  --model gpt-4o-mini-tts \
  --voice marin \
  --instructions "Whisper very quickly, like a hurried stage cue, while staying clear and intelligible." \
  --input "The launch checklist is ready. Please send final feedback by Friday at noon." \
  --output reminder.mp3
```


## Transcription

为 shell pipelines 打印纯 transcript 文本：

命令：

```bash
openai audio:transcriptions create \
  --model gpt-4o-transcribe \
  --file ./speech.mp3 \
  --transform text \
  --raw-output
```


输出：

```text
The OpenAI CLI can call the API from ordinary shell scripts.
```

使用与你所需产物匹配的 response format：

| 需求                        | 命令形状                                                        |
| --------------------------- | -------------------------------------------------------------------- |
| 纯 transcript 文本       | `--model gpt-4o-transcribe --transform text --raw-output`            |
| 字幕文件              | `--model whisper-1 --response-format srt` 或 `--response-format vtt` |
| Segment 或 word timestamps  | `--model whisper-1 --response-format verbose_json`                   |
| Speaker-labeled diarization | `--model gpt-4o-transcribe-diarize --response-format diarized_json`  |

对于 word-level timing，请请求 verbose transcription 形状：

命令：

```bash
openai audio:transcriptions create \
  --model whisper-1 \
  --file ./speech.mp3 \
  --response-format verbose_json \
  --timestamp-granularity word \
  --format json
```


输出：

```json
{
  "task": "transcribe",
  "language": "english",
  "duration": 6,
  "text": "The OpenAI CLI can call the API from ordinary shell scripts.",
  "words": [
    { "word": "The", "start": 0, "end": 0.42 },
    { "word": "OpenAI", "start": 0.42, "end": 1.22 }
  ],
  "...": "additional response fields omitted"
}
```

对于 speaker-labeled 输出，请使用 diarization model 并请求 `diarized_json`：

命令：

```bash
openai audio:transcriptions create \
  --model gpt-4o-transcribe-diarize \
  --file ./speech.mp3 \
  --response-format diarized_json \
  --format json
```


输出：

```json
{
  "text": "The OpenAI CLI can call the API from ordinary shell scripts.",
  "segments": [
    {
      "type": "transcript.text.segment",
      "id": "seg_0",
      "start": 0.05,
      "end": 5.25,
      "text": " The OpenAI CLI can call the API from ordinary shell scripts.",
      "speaker": "A"
    }
  ],
  "...": "additional response fields omitted"
}
```

`whisper-1` 支持 `json`、`text`、`srt`、`verbose_json` 和 `vtt`。`diarized_json` 是携带 `segments[].speaker` 的格式；使用同一个 diarization model 和普通 `json` 时，响应包含 transcript 文本，但不包含 speaker labels。

## Admin APIs

使用 Admin APIs 完成组织管理、credential provisioning、合规和 usage-monitoring 工作流。设置 `OPENAI_ADMIN_KEY`，然后调用生成的 `admin:organization:*` 命令。

要为新机器 provision credential，请[创建项目](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/projects/methods/create)，在该项目内[创建 service account](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/projects/subresources/service_accounts/methods/create)，并使用返回的 API key。

### 创建项目、service account 和 API key

在该项目中创建 service account 会返回该 service account 的未遮蔽 API key。

命令：

```bash
# Create the project that will own this app or agent and save the response.
openai admin:organization:projects create \
  --name "automation project" \
  --format json > project.json
PROJECT_ID="$(jq -r '.id' project.json)"

# Create a service account inside the project and save the full response.
openai admin:organization:projects:service-accounts create \
  --project-id "$PROJECT_ID" \
  --name "automation bot" \
  --format json > service-account.json

# Extract the returned API key into an env file for the workload to use.
jq -r '.api_key.value | "OPENAI_API_KEY=\(.)"' \
  service-account.json > .env
```


输出：

```json
{
  "object": "organization.project.service_account",
  "id": "svc_acct_...",
  "name": "automation bot",
  "role": "member",
  "api_key": {
    "id": "key_...",
    "value": "sk-..."
  }
}
```

这会把 project response 写入 `project.json`，将其 ID 解析到下一个命令中，把 service-account response 写入 `service-account.json`，并把返回的 credential 作为 `OPENAI_API_KEY=...` 写入 `.env`。请将这两个 JSON 文件都视为 secrets，并在仓库中使用此模式之前，将 `project.json`、`service-account.json` 和 `.env` 添加到 `.gitignore`。

对于其余 surface，请参阅 [Admin APIs guide](https://developers.openai.com/api/docs/guides/admin-apis) 和当前的 [Administration API reference](https://developers.openai.com/api/reference/administration/overview)。请谨慎向未经审查的 actors 授予 admin keys 访问权限。
