---
status: needs-review
sourceId: "9b37e0d60aa3"
sourceChecksum: "9b37e0d60aa39315f4219dc0f261b05dadbebc470373970fc7a499b760b3fedf"
sourceUrl: "https://developers.openai.com/api/docs/guides/speech-to-text"
translatedAt: "2026-06-27T10:24:24.269Z"
translator: codex-gpt-5.5-xhigh
---

# 语音转文本

Audio API 提供两个 speech to text 端点：

- `transcriptions`
- `translations`

过去，这两个端点都由我们的开源 [Whisper model](https://openai.com/blog/whisper/)（`whisper-1`）支持。现在，`transcriptions` 端点还支持更高质量的模型快照，但参数支持有限：

- `gpt-4o-mini-transcribe`
- `gpt-4o-transcribe`
- `gpt-4o-transcribe-diarize`

所有端点都可用于：

- 将音频转写为音频本身所使用的语言。
- 将音频翻译并转写为英文。

文件上传目前限制为 25 MB，并支持以下输入文件类型：`mp3`、`mp4`、`mpeg`、`mpga`、`m4a`、`wav` 和 `webm`。用于 diarization 的已知说话人参考片段在以 data URLs 形式提供时，也接受相同格式。

本指南适用于文件上传和有边界的音频请求。如果你的
  应用需要来自麦克风、通话或媒体流的实时 transcript deltas，
  请改用 [Realtime transcription](https://developers.openai.com/api/docs/guides/realtime-transcription)。

## Quickstart

### Transcriptions

Transcriptions API 接收你想要转写的音频文件，以及该音频转写结果所需的输出文件格式。所有模型都支持同一组输入格式。在输出方面：

- `whisper-1` 支持 `json`、`text`、`srt`、`verbose_json` 和 `vtt`。
- `gpt-4o-transcribe` 和 `gpt-4o-mini-transcribe` 支持 `json` 或纯 `text`。
- `gpt-4o-transcribe-diarize` 支持 `json`、`text` 和 `diarized_json`（会向响应添加 speaker segments）。

转写音频

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/audio.mp3"),
  model: "gpt-4o-transcribe",
});

console.log(transcription.text);
```

```python
from openai import OpenAI

client = OpenAI()
audio_file= open("/path/to/file/audio.mp3", "rb")

transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe", 
    file=audio_file
)

print(transcription.text)
```

```cli
openai audio:transcriptions create \
  --model gpt-4o-transcribe \
  --file /path/to/file/audio.mp3 \
  --raw-output \
  --transform text
```

```bash
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/audio.mp3 \
  --form model=gpt-4o-transcribe
```


默认情况下，响应类型会是 json，并包含原始文本。

```example-content
{
  "text": "Imagine the wildest idea that you've ever had, and you're curious about how it might scale to something that's a 100, a 1,000 times bigger.
....
}
```

Audio API 还允许你在请求中设置其他参数。例如，如果你想将 `response_format` 设置为 `text`，请求会如下所示：

其他选项

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/speech.mp3"),
  model: "gpt-4o-transcribe",
  response_format: "text",
});

console.log(transcription.text);
```

```python
from openai import OpenAI

client = OpenAI()
audio_file = open("/path/to/file/speech.mp3", "rb")

transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe", 
    file=audio_file, 
    response_format="text"
)

print(transcription.text)
```

```bash
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/speech.mp3 \
  --form model=gpt-4o-transcribe \
  --form response_format=text
```


[API Reference](https://developers.openai.com/api/docs/api-reference/audio) 包含完整的可用参数列表。

`gpt-4o-transcribe` 和 `gpt-4o-mini-transcribe` 支持 `json` 或 `text`
  响应，并允许 prompts 和 logprobs。`gpt-4o-transcribe-diarize` 添加
  speaker labels，但当音频超过 30 秒时需要 `chunking_strategy`
  （推荐 `"auto"`），并且不支持 prompts、logprobs 或
  `timestamp_granularities[]`。

### Speaker diarization

`gpt-4o-transcribe-diarize` 会生成 speaker-aware transcripts。请求 `diarized_json` response format 可接收包含 `speaker`、`start` 和 `end` 元数据的 segments 数组。设置 `chunking_strategy`（可以是 `"auto"` 或 Voice Activity Detection 配置），以便服务可以将音频拆分为 segments；当输入超过 30 秒时，这是必需的。

你可以选择提供最多四段短音频参考，配合 `known_speaker_names[]` 和 `known_speaker_references[]` 将 segments 映射到已知说话人。参考片段应为 2-10 秒，可使用主音频上传支持的任何输入格式；在使用 multipart form data 时，将它们编码为 [data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)。

对会议录音进行 diarize

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const agentRef = fs.readFileSync("agent.wav").toString("base64");

const transcript = await openai.audio.transcriptions.create({
  file: fs.createReadStream("meeting.wav"),
  model: "gpt-4o-transcribe-diarize",
  response_format: "diarized_json",
  chunking_strategy: "auto",
  extra_body: {
    known_speaker_names: ["agent"],
    known_speaker_references: ["data:audio/wav;base64," + agentRef],
  },
});

for (const segment of transcript.segments) {
  console.log(`${segment.speaker}: ${segment.text}`, segment.start, segment.end);
}
```

```python
import base64
from openai import OpenAI

client = OpenAI()

def to_data_url(path: str) -> str:
    with open(path, "rb") as fh:
        return "data:audio/wav;base64," + base64.b64encode(fh.read()).decode("utf-8")

with open("meeting.wav", "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="gpt-4o-transcribe-diarize",
        file=audio_file,
        response_format="diarized_json",
        chunking_strategy="auto",
        extra_body={
            "known_speaker_names": ["agent"],
            "known_speaker_references": [to_data_url("agent.wav")],
        },
    )

for segment in transcript.segments:
    print(segment.speaker, segment.text, segment.start, segment.end)
```

```bash
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/meeting.wav \
  --form model=gpt-4o-transcribe-diarize \
  --form response_format=diarized_json \
  --form chunking_strategy=auto \
  --form 'known_speaker_names[]=agent' \
  --form 'known_speaker_references[]=data:audio/wav;base64,AAA...'
```


当 `stream=true` 时，diarized responses 会在每个 segment 完成时发出 `transcript.text.segment` events。`transcript.text.delta` events 包含 `segment_id` 字段，但 diarized deltas 不会在每个 segment 最终确定之前流式传输部分 speaker assignments。

`gpt-4o-transcribe-diarize` 目前仅可通过
  `/v1/audio/transcriptions` 使用，尚不支持 Realtime API。

### Translations

Translations API 接收任何受支持语言的音频文件作为输入，并在必要时将音频转写为英文。这不同于我们的 /Transcriptions 端点，因为输出不是原始输入语言，而是被翻译成英文文本。此端点仅支持 `whisper-1` 模型。

翻译音频

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const translation = await openai.audio.translations.create({
  file: fs.createReadStream("/path/to/file/german.mp3"),
  model: "whisper-1",
});

console.log(translation.text);
```

```python
from openai import OpenAI

client = OpenAI()
audio_file = open("/path/to/file/german.mp3", "rb")

translation = client.audio.translations.create(
    model="whisper-1", 
    file=audio_file,
)

print(translation.text)
```

```bash
curl --request POST \
  --url https://api.openai.com/v1/audio/translations \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/german.mp3 \
  --form model=whisper-1 \
```


在这个例子中，输入音频是德语，输出文本看起来像这样：

```example-content
Hello, my name is Wolfgang and I come from Germany. Where are you heading today?
```

目前我们只支持翻译成英文。

## 支持的语言

我们目前通过 `transcriptions` 和 `translations` 端点[支持以下语言](https://github.com/openai/whisper#available-models-and-languages)：

南非荷兰语、阿拉伯语、亚美尼亚语、阿塞拜疆语、白俄罗斯语、波斯尼亚语、保加利亚语、加泰罗尼亚语、中文、克罗地亚语、捷克语、丹麦语、荷兰语、英语、爱沙尼亚语、芬兰语、法语、加利西亚语、德语、希腊语、希伯来语、印地语、匈牙利语、冰岛语、印度尼西亚语、意大利语、日语、卡纳达语、哈萨克语、韩语、拉脱维亚语、立陶宛语、马其顿语、马来语、马拉地语、毛利语、尼泊尔语、挪威语、波斯语、波兰语、葡萄牙语、罗马尼亚语、俄语、塞尔维亚语、斯洛伐克语、斯洛文尼亚语、西班牙语、斯瓦希里语、瑞典语、他加禄语、泰米尔语、泰语、土耳其语、乌克兰语、乌尔都语、越南语和威尔士语。

虽然底层模型是在 98 种语言上训练的，但我们只列出了[词错误率](https://en.wikipedia.org/wiki/Word_error_rate)（WER）低于 \<50% 的语言，这是 speech to text 模型准确性的行业标准基准。模型会为上面未列出的语言返回结果，但质量会较低。

我们对基于 GPT-4o 的模型支持一些 ISO 639-1 和 639-3 language codes。对于我们没有的 language codes，可以尝试在 prompt 中指定具体语言（例如，“Output in English”）。

## 时间戳

默认情况下，Transcriptions API 会以文本形式输出所提供音频的 transcript。[`timestamp_granularities[]` 参数](/api/docs/api-reference/audio/createTranscription#audio-createtranscription-timestamp_granularities)启用一种更结构化、带时间戳的 json 输出格式，可提供 segment 级、word 级或两者的时间戳。这为 transcripts 和视频编辑提供词级精度，可移除绑定到单个词的特定帧。

时间戳选项

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("audio.mp3"),
  model: "whisper-1",
  response_format: "verbose_json",
  timestamp_granularities: ["word"]
});

console.log(transcription.words);
```

```python
from openai import OpenAI

client = OpenAI()
audio_file = open("/path/to/file/speech.mp3", "rb")

transcription = client.audio.transcriptions.create(
  file=audio_file,
  model="whisper-1",
  response_format="verbose_json",
  timestamp_granularities=["word"]
)

print(transcription.words)
```

```bash
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@/path/to/file/audio.mp3" \
  -F "timestamp_granularities[]=word" \
  -F model="whisper-1" \
  -F response_format="verbose_json"
```


`timestamp_granularities[]` 参数仅受 `whisper-1` 支持。

## 更长输入

默认情况下，Transcriptions API 仅支持小于 25 MB 的文件。如果你的音频文件比这更大，则需要将其拆分为 25 MB 或更小的片段，或使用压缩音频格式。为获得最佳性能，我们建议你避免在句子中间拆分音频，因为这可能导致部分上下文丢失。

一种处理方式是使用 [PyDub 开源 Python package](https://github.com/jiaaro/pydub) 拆分音频：

```python
from pydub import AudioSegment

song = AudioSegment.from_mp3("good_morning.mp3")

# PyDub handles time in milliseconds
ten_minutes = 10 * 60 * 1000

first_10_minutes = song[:ten_minutes]

first_10_minutes.export("good_morning_10.mp3", format="mp3")
```

_OpenAI 不保证 PyDub 等第三方软件的可用性或安全性。_

## Prompting

你可以使用 [prompt](https://developers.openai.com/api/docs/api-reference/audio/createTranscription#audio/createTranscription-prompt) 来提升 Transcriptions API 生成 transcripts 的质量。

Prompting

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/speech.mp3"),
  model: "gpt-4o-transcribe",
  response_format: "text",
  prompt:"The following conversation is a lecture about the recent developments around OpenAI, GPT-4.5 and the future of AI.",
});

console.log(transcription.text);
```

```python
from openai import OpenAI

client = OpenAI()
audio_file = open("/path/to/file/speech.mp3", "rb")

transcription = client.audio.transcriptions.create(
  model="gpt-4o-transcribe", 
  file=audio_file, 
  response_format="text",
  prompt="The following conversation is a lecture about the recent developments around OpenAI, GPT-4.5 and the future of AI."
)

print(transcription.text)
```

```bash
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/speech.mp3 \
  --form model=gpt-4o-transcribe \
  --form prompt="The following conversation is a lecture about the recent developments around OpenAI, GPT-4.5 and the future of AI."
```


对于 `gpt-4o-transcribe` 和 `gpt-4o-mini-transcribe`，你可以使用 `prompt` 参数向模型提供额外上下文来提升转写质量，方式类似于你 prompt 其他 GPT-4o 模型。目前 `gpt-4o-transcribe-diarize` 不支持 prompting。

以下是一些示例，说明 prompting 如何在不同场景中提供帮助：

1.  Prompts 可以帮助纠正模型在音频中误识别的特定词语或缩写。例如，下面的 prompt 改善了 DALL·E 和 GPT-3 这两个词的转写；它们之前被写作 "GDP 3" 和 "DALI"："The transcript is about OpenAI which makes technology like DALL·E, GPT-3, and ChatGPT with the hope of one day building an AGI system that benefits all of humanity."
2.  为了保留被拆分为片段的文件上下文，请用前一个片段的 transcript prompt 模型。模型会使用来自前一个音频的相关信息，从而提升转写准确性。`whisper-1` 模型只考虑 prompt 最后的 224 tokens，并忽略更早内容。对于多语言输入，Whisper 使用自定义 tokenizer。对于纯英语输入，它使用标准 GPT-2 tokenizer。可在开源 [Whisper Python package](https://github.com/openai/whisper/blob/main/whisper/tokenizer.py#L361) 中找到这两种 tokenizers。
3.  有时模型会在 transcript 中跳过标点。为了防止这种情况，请使用包含标点的简单 prompt："Hello, welcome to my lecture."
4.  模型也可能省略音频中常见的 filler words。如果你想在 transcript 中保留 filler words，请使用包含它们的 prompt："Umm, let me think like, hmm... Okay, here's what I'm, like, thinking."
5.  有些语言可以用不同方式书写，例如简体中文或繁体中文。默认情况下，模型可能并不总是使用你希望的书写风格。你可以通过使用你偏好的书写风格来 prompt，从而改善这一点。

对于 `whisper-1`，模型会尝试匹配 prompt 的风格，因此如果 prompt 使用大小写和标点，模型更可能也使用它们。不过，当前 prompting 系统比我们的其他语言模型更有限，对生成文本的控制也有限。

你可以在[提升可靠性](#improving-reliability)部分找到更多关于改进 `whisper-1` transcriptions 的示例。



流式传输 transcriptions



根据你的用例，以及你是要转写已经完成的音频录制，还是处理持续音频流并使用 OpenAI 进行 turn detection，可以用两种方式流式传输 transcription。

### 流式传输已完成音频录制的 transcription

如果你有一段已经完成的音频录制，不论它是音频文件，还是你正在使用自己的 turn detection（例如 push-to-talk），你都可以使用我们的 Transcription API 并设置 `stream=True`，在模型完成转写某段音频后立即接收 [transcript events](https://developers.openai.com/api/docs/api-reference/audio/transcript-text-delta-event) 流。

流式传输 transcriptions

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const stream = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/speech.mp3"),
  model: "gpt-4o-mini-transcribe",
  response_format: "text",
  // highlight-start
  stream: true,
  // highlight-end
});

// highlight-start
for await (const event of stream) {
  console.log(event);
}
// highlight-end
```

```python
from openai import OpenAI

client = OpenAI()
audio_file = open("/path/to/file/speech.mp3", "rb")

stream = client.audio.transcriptions.create(
  model="gpt-4o-mini-transcribe", 
  file=audio_file, 
  response_format="text",
  # highlight-start
  stream=True
  # highlight-end
)

# highlight-start
for event in stream:
  print(event)
# highlight-end
```

```bash
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@example.wav \
  --form model=whisper-1 \
  # highlight-start
  --form stream=True
```


一旦模型完成对该部分音频的转写，你就会收到 `transcript.text.delta` events 流，随后在 transcription 完成时收到 `transcript.text.done` event，其中包含完整 transcript。使用 `response_format="diarized_json"` 时，每当 segment 最终确定，stream 也会发出带 speaker labels 的 `transcript.text.segment` events。

此外，你可以使用 `include[]` 参数在响应中包含 `logprobs`，以获取 transcription 中 tokens 的 log probabilities。这些信息有助于判断模型对 transcript 中特定部分的转写有多大信心。

`whisper-1` 不支持 streamed transcription。

### 流式传输持续音频录制的 transcription

对于来自麦克风、通话或媒体流的实时音频，请使用 [Realtime transcription](https://developers.openai.com/api/docs/guides/realtime-transcription) 指南，而不是上面的面向文件的 streaming path。该指南涵盖当前 transcription-session flow，以及使用 [`gpt-realtime-whisper`](https://developers.openai.com/api/docs/models/gpt-realtime-whisper) 的推荐 realtime path。

## 提升可靠性

使用 Whisper 时最常见的挑战之一，是模型经常无法识别不常见词语或缩写。下面是一些在这些情况下提升 Whisper 可靠性的不同技巧：

使用 prompt 参数

第一种方法是使用可选 prompt 参数传入正确拼写的字典。

由于 Whisper 并不是用 instruction-following 技术训练的，它的行为更像一个 base GPT model。请记住，Whisper 只考虑 prompt 的前 224 个 tokens。

Prompt 参数

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/speech.mp3"),
  model: "whisper-1",
  response_format: "text",
  prompt:"ZyntriQix, Digique Plus, CynapseFive, VortiQore V8, EchoNix Array, OrbitalLink Seven, DigiFractal Matrix, PULSE, RAPT, B.R.I.C.K., Q.U.A.R.T.Z., F.L.I.N.T.",
});

console.log(transcription.text);
```

```python
from openai import OpenAI

client = OpenAI()
audio_file = open("/path/to/file/speech.mp3", "rb")

transcription = client.audio.transcriptions.create(
  model="whisper-1", 
  file=audio_file, 
  response_format="text",
  prompt="ZyntriQix, Digique Plus, CynapseFive, VortiQore V8, EchoNix Array, OrbitalLink Seven, DigiFractal Matrix, PULSE, RAPT, B.R.I.C.K., Q.U.A.R.T.Z., F.L.I.N.T."
)

print(transcription.text)
```

```bash
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/speech.mp3 \
  --form model=whisper-1 \
  --form prompt="ZyntriQix, Digique Plus, CynapseFive, VortiQore V8, EchoNix Array, OrbitalLink Seven, DigiFractal Matrix, PULSE, RAPT, B.R.I.C.K., Q.U.A.R.T.Z., F.L.I.N.T."
```


虽然它会提升可靠性，但这种技术限制为 224 tokens，因此 SKU 列表需要相对较小，才适合作为可扩展解决方案。

使用 GPT-4 进行后处理

第二种方法涉及使用 GPT-4 或 GPT-3.5-Turbo 的后处理步骤。

我们首先通过 `system_prompt` 变量为 GPT-4 提供指令。类似于前面使用 prompt 参数的方式，我们可以定义公司和产品名称。

后处理

```javascript
const systemPrompt = `
You are a helpful assistant for the company ZyntriQix. Your task is 
to correct any spelling discrepancies in the transcribed text. Make 
sure that the names of the following products are spelled correctly: 
ZyntriQix, Digique Plus, CynapseFive, VortiQore V8, EchoNix Array, 
OrbitalLink Seven, DigiFractal Matrix, PULSE, RAPT, B.R.I.C.K., 
Q.U.A.R.T.Z., F.L.I.N.T. Only add necessary punctuation such as 
periods, commas, and capitalization, and use only the context provided.
`;

const transcript = await transcribe(audioFile);
const completion = await openai.chat.completions.create({
model: "gpt-4.1",
temperature: temperature,
messages: [
  {
    role: "system",
    content: systemPrompt
  },
  {
    role: "user",
    content: transcript
  }
],
store: true,
});

console.log(completion.choices[0].message.content);
```

```python
system_prompt = """
You are a helpful assistant for the company ZyntriQix. Your task is to correct 
any spelling discrepancies in the transcribed text. Make sure that the names of 
the following products are spelled correctly: ZyntriQix, Digique Plus, 
CynapseFive, VortiQore V8, EchoNix Array, OrbitalLink Seven, DigiFractal 
Matrix, PULSE, RAPT, B.R.I.C.K., Q.U.A.R.T.Z., F.L.I.N.T. Only add necessary 
punctuation such as periods, commas, and capitalization, and use only the 
context provided.
"""

def generate_corrected_transcript(temperature, system_prompt, audio_file):
  response = client.chat.completions.create(
      model="gpt-4.1",
      temperature=temperature,
      messages=[
          {
              "role": "system",
              "content": system_prompt
          },
          {
              "role": "user",
              "content": transcribe(audio_file, "")
          }
      ]
  )
  return completion.choices[0].message.content
corrected_text = generate_corrected_transcript(
  0, system_prompt, fake_company_filepath
)
```


如果你用自己的音频文件尝试此方法，会看到 GPT-4 能纠正 transcript 中许多拼写错误。由于它的上下文窗口更大，与使用 Whisper 的 prompt 参数相比，这种方法可能更可扩展。它也更可靠，因为 GPT-4 可以被指示和引导，而由于 Whisper 缺乏 instruction following，这些方式对 Whisper 不可用。
