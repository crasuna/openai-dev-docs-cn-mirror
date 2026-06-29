---
title: "文本转语音"
description: "Learn how to turn text into lifelike spoken audio with the OpenAI API."
outline: deep
---

# 文本转语音

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/text-to-speech](https://developers.openai.com/api/docs/guides/text-to-speech)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/text-to-speech.md](https://developers.openai.com/api/docs/guides/text-to-speech.md)
- 抓取时间：2026-06-27T05:54:09.339Z
- Checksum：`fe7bc5d679d21c092a2ca5032d8e2811a0d44f1041f3949ada013e66c30b086e`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Audio API 提供一个基于我们的 [GPT-4o mini TTS（text-to-speech）模型](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts)的 [`speech`](https://developers.openai.com/api/docs/api-reference/audio/createSpeech) 端点。它内置 11 种声音，可用于：

- 朗读书面博客文章
- 生成多种语言的语音音频
- 使用流式传输提供实时音频输出

下面是 `alloy` voice 的示例：

我们的[使用政策](https://openai.com/policies/usage-policies)要求你
  向最终用户清楚披露，他们听到的 TTS voice 是 AI 生成的，而不是人类声音。

## Quickstart

`speech` 端点接受三个关键输入：

1. 你正在使用的[模型](https://developers.openai.com/api/docs/api-reference/audio/createSpeech#audio-createspeech-model)
1. 要转换为音频的[文本](https://developers.openai.com/api/docs/api-reference/audio/createSpeech#audio-createspeech-input)
1. 用于朗读输出的 [voice](https://developers.openai.com/api/docs/api-reference/audio/createSpeech#audio-createspeech-voice)

下面是一个简单请求示例：

从输入文本生成语音音频

```javascript
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI();
const speechFile = path.resolve("./speech.mp3");

const mp3 = await openai.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "coral",
  input: "Today is a wonderful day to build something people love!",
  instructions: "Speak in a cheerful and positive tone.",
});

const buffer = Buffer.from(await mp3.arrayBuffer());
await fs.promises.writeFile(speechFile, buffer);
```

```python
from pathlib import Path
from openai import OpenAI

client = OpenAI()
speech_file_path = Path(__file__).parent / "speech.mp3"

with client.audio.speech.with_streaming_response.create(
    model="gpt-4o-mini-tts",
    voice="coral",
    input="Today is a wonderful day to build something people love!",
    instructions="Speak in a cheerful and positive tone.",
) as response:
    response.stream_to_file(speech_file_path)
```

```bash
curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini-tts",
    "input": "Today is a wonderful day to build something people love!",
    "voice": "coral",
    "instructions": "Speak in a cheerful and positive tone."
  }' \
  --output speech.mp3
```

```bash
openai audio:speech create \
  --model gpt-4o-mini-tts \
  --voice coral \
  --instructions "Speak in a cheerful and positive tone." \
  --input "Today is a wonderful day to build something people love!" \
  --output speech.mp3
```


默认情况下，该端点会输出语音音频的 MP3，但你可以将其配置为输出任何[支持的格式](/mirror/api/docs/guides/text-to-speech#supported-output-formats)。

### Text-to-speech 模型

对于智能实时应用，请使用 `gpt-4o-mini-tts` 模型，这是我们最新且最可靠的 text-to-speech 模型。你可以通过 prompt 控制语音的各个方面，包括：

- 口音
- 情绪范围
- 语调
- 模仿效果
- 语速
- 语气
- 耳语

我们的其他 text-to-speech 模型是 `tts-1` 和 `tts-1-hd`。`tts-1` 模型延迟更低，但质量低于 `tts-1-hd` 模型。

### Voice 选项

TTS 端点提供 13 种内置 voices，用于控制文本如何渲染为语音。**请在 [OpenAI.fm](https://openai.fm) 中聆听并试用这些 voices，这是我们用于尝试 OpenAI API 最新 text-to-speech 模型的交互式演示**。Voices 目前针对英语优化。

- `alloy`
- `ash`
- `ballad`
- `coral`
- `echo`
- `fable`
- `nova`
- `onyx`
- `sage`
- `shimmer`
- `verse`
- `marin`
- `cedar`

为了获得最佳质量，我们建议使用 `marin` 或 `cedar`。

Voice 可用性取决于模型。`tts-1` 和 `tts-1-hd` 模型支持较小集合：`alloy`、`ash`、`coral`、`echo`、`fable`、`onyx`、`nova`、`sage` 和 `shimmer`。

如果你正在使用 [Realtime API](/mirror/api/docs/guides/realtime)，请注意可用 voices 集合略有不同。请参阅 [realtime conversations guide](/mirror/api/docs/guides/realtime-conversations#voice-options) 了解当前 realtime voices。

### 流式传输实时音频

Speech API 支持使用 [chunk transfer encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding) 进行实时音频流式传输。这意味着音频可以在完整文件生成并可访问之前开始播放。

将输入文本生成的语音音频直接流式传输到扬声器

```javascript
import OpenAI from "openai";
import { playAudio } from "openai/helpers/audio";

const openai = new OpenAI();

const response = await openai.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "coral",
  input: "Today is a wonderful day to build something people love!",
  instructions: "Speak in a cheerful and positive tone.",
  response_format: "wav",
});

await playAudio(response);
```

```python
import asyncio

from openai import AsyncOpenAI
from openai.helpers import LocalAudioPlayer

openai = AsyncOpenAI()

async def main() -> None:
    async with openai.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="coral",
        input="Today is a wonderful day to build something people love!",
        instructions="Speak in a cheerful and positive tone.",
        response_format="pcm",
    ) as response:
        await LocalAudioPlayer().play(response)

if __name__ == "__main__":
    asyncio.run(main())
```

```bash
curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini-tts",
    "input": "Today is a wonderful day to build something people love!",
    "voice": "coral",
    "instructions": "Speak in a cheerful and positive tone.",
    "response_format": "wav"
  }' | ffplay -i -
```


为获得最快响应时间，我们建议使用 `wav` 或 `pcm` 作为 response format。

## 支持的输出格式

默认 response format 是 `mp3`，但也可以使用其他格式，例如 `opus` 和 `wav`。

- **MP3**：通用用例的默认 response format。
- **Opus**：用于互联网流式传输和通信，低延迟。
- **AAC**：用于数字音频压缩，YouTube、Android、iOS 偏好使用。
- **FLAC**：用于无损音频压缩，音频爱好者常用于归档。
- **WAV**：未压缩 WAV 音频，适合低延迟应用，可避免解码开销。
- **PCM**：类似 WAV，但包含 24kHz（16-bit signed, low-endian）的原始采样，没有 header。

## 支持的语言

TTS 模型通常在语言支持方面遵循 Whisper 模型。Whisper [支持以下语言](https://github.com/openai/whisper#available-models-and-languages)，尽管 voices 针对英语优化，但表现良好：

南非荷兰语、阿拉伯语、亚美尼亚语、阿塞拜疆语、白俄罗斯语、波斯尼亚语、保加利亚语、加泰罗尼亚语、中文、克罗地亚语、捷克语、丹麦语、荷兰语、英语、爱沙尼亚语、芬兰语、法语、加利西亚语、德语、希腊语、希伯来语、印地语、匈牙利语、冰岛语、印度尼西亚语、意大利语、日语、卡纳达语、哈萨克语、韩语、拉脱维亚语、立陶宛语、马其顿语、马来语、马拉地语、毛利语、尼泊尔语、挪威语、波斯语、波兰语、葡萄牙语、罗马尼亚语、俄语、塞尔维亚语、斯洛伐克语、斯洛文尼亚语、西班牙语、斯瓦希里语、瑞典语、他加禄语、泰米尔语、泰语、土耳其语、乌克兰语、乌尔都语、越南语和威尔士语。

你可以通过提供所选语言的输入文本来生成这些语言的语音音频。

## Custom voices

Custom voices 让你可以为 agent 或应用创建独特声音。这些 voices 可用于通过 [Text to Speech API](https://developers.openai.com/api/docs/api-reference/audio/createSpeech)、[Realtime API](https://developers.openai.com/api/docs/api-reference/realtime) 或[带音频输出的 Chat Completions API](/mirror/api/docs/guides/audio) 输出音频。

要创建 custom voice，你需要提供一段短音频参考样本，模型会尝试复刻该声音。

Custom voices 仅面向符合条件的客户开放。请联系[销售 团队](https://openai.com/contact-sales/)了解更多信息。为你的
  organization 启用后，你将可以在 Audio 下访问
  [Voices](https://platform.openai.com/audio/voices) tab。

#### 创建 voice

目前，voices 必须通过 API request 创建。请参阅 API reference 了解完整 API operations。

创建 voice 需要两段独立录音：

1. **Consent recording** — 此录音捕获 voice actor 对创建其声音肖像表示同意。该 actor 必须朗读下面提供的同意短语之一。
2. **Sample recording** — 模型将尝试遵循的实际音频样本。该 voice 必须与 consent recording 匹配。

**创建高质量 voice 的提示**

Custom voice 的质量高度取决于你提供样本的质量。优化录音质量会带来很大差异。

- 在安静、回声极少的空间中录制。
- 使用专业 XLR 麦克风。
- 与麦克风保持约 7-8 英寸距离，中间放置防喷罩，并保持该距离一致。
- 模型会精确复制你给出的内容：语气、节奏、能量、停顿、习惯。因此请录制你真正想要的声音。在整个录音中保持能量、风格和口音一致。
- 音频样本中的细微变化可能导致生成 voice 的质量差异，值得尝试多个示例以找到最佳匹配。

**要求和限制**

- 每个 organization 最多可创建 20 个 voices。
- 音频样本必须为 30 秒或更短。
- 音频样本必须是以下类型之一：`mpeg`、`wav`、`ogg`、`aac`、`flac`、`webm` 或 `mp4`。

有关其他使用条款，请参阅 Text-to-Speech Supplemental Agreement。

**创建 voice consent**

同意录音必须只包含以下短语之一。任何偏离脚本的情况都会导致失败。

| Language | Phrase                                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `de`     | Ich bin der Eigentümer dieser Stimme und bin damit einverstanden, dass OpenAI diese Stimme zur Erstellung eines synthetischen Stimmmodells verwendet. |
| `en`     | I am the owner of this voice and I consent to OpenAI using this voice to create a synthetic voice model.                                              |
| `es`     | Soy el propietario de esta voz y doy mi consentimiento para que OpenAI la utilice para crear un modelo de voz sintética.                              |
| `fr`     | Je suis le propriétaire de cette voix et j'autorise OpenAI à utiliser cette voix pour créer un modèle de voix synthétique.                            |
| `hi`     | मैं इस आवाज का मालिक हूं और मैं सिंथेटिक आवाज मॉडल बनाने के लिए OpenAI को इस आवाज का उपयोग करने की सहमति देता हूं                                     |
| `id`     | Saya adalah pemilik suara ini dan saya memberikan persetujuan kepada OpenAI untuk menggunakan suara ini guna membuat model suara sintetis.            |
| `it`     | Sono il proprietario di questa voce e acconsento che OpenAI la utilizzi per creare un modello di voce sintetica.                                      |
| `ja`     | 私はこの音声の所有者であり、OpenAIがこの音声を使用して音声合成 モデルを作成することを承認します。                                                     |
| `ko`     | 나는 이 음성의 소유자이며 OpenAI가 이 음성을 사용하여 음성 합성 모델을 생성할 것을 허용합니다.                                                        |
| `nl`     | Ik ben de eigenaar van deze stem en ik geef OpenAI toestemming om deze stem te gebruiken om een synthetisch stemmodel te maken.                       |
| `pl`     | Jestem właścicielem tego głosu i wyrażam zgodę na wykorzystanie go przez OpenAI w celu utworzenia syntetycznego modelu głosu.                         |
| `pt`     | Eu sou o proprietário desta voz e autorizo o OpenAI a usá-la para criar um modelo de voz sintética.                                                   |
| `ru`     | Я являюсь владельцем этого голоса и даю согласие OpenAI на использование этого голоса для создания модели синтетического голоса.                      |
| `uk`     | Я є власником цього голосу і даю згоду OpenAI використовувати цей голос для створення синтетичної голосової моделі.                                   |
| `vi`     | Tôi là chủ sở hữu giọng nói này và tôi đồng ý cho OpenAI sử dụng giọng nói này để tạo mô hình giọng nói tổng hợp.                                     |
| `zh`     | 我是此声音的拥有者并授权OpenAI使用此声音创建语音合成模型                                                                                              |

然后通过 API 上传录音。成功上传会返回 consent recording ID，你稍后会引用它。请注意，如果同一个 voice actor 进行多次尝试，该 consent 可以用于多个不同 voice creations。

```bash
curl https://api.openai.com/v1/audio/voice_consents \
  -X POST \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "name=test_consent" \
  -F "language=en" \
  -F "recording=@$HOME/tmp/voice_consent/consent_recording.wav;type=audio/x-wav"
```


**创建 voice**

接下来，你将通过引用 consent recording ID 并提供 voice sample 来创建实际 voice。

```bash
curl https://api.openai.com/v1/audio/voices \
  -X POST \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "name=test_voice" \
  -F "audio_sample=@$HOME/tmp/voice_consent/audio_sample_recording.wav;type=audio/x-wav" \
  -F "consent=cons_123abc"
```


如果成功，创建的 voice 会列在 [Audio tab](https://platform.openai.com/audio/voices) 下。

#### 在语音生成中使用 voice

Speech generation 会照常工作。只需在[创建 speech](https://developers.openai.com/api/docs/api-reference/audio/createSpeech)时，或在启动 [realtime session](https://developers.openai.com/api/docs/api-reference/realtime/create-call#realtime_create_call-session-audio-output-voice) 时，在 `voice` 参数中指定 voice 的 ID。

**Text to speech 示例**

```bash
curl https://api.openai.com/v1/audio/speech \
  -X POST \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini-tts",
    "voice": {
      "id": "voice_123abc"
    },
    "input": "Maple est le meilleur golden retriever du monde entier.",
    "language": "fr",
    "format": "wav"
  }' \
  --output sample.wav
```


**Realtime API 示例**

```javascript
const sessionConfig = JSON.stringify({
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    audio: {
      output: {
        voice: { id: "voice_123abc" },
      },
    },
  },
});
```

## 相关指南


  



    为 voice agents、translation、transcription 和
    speech generation 选择正确路径。





  



    查看 audio modalities、speech tasks、streaming 和 request-based APIs。




:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
The Audio API provides a [`speech`](https://developers.openai.com/api/docs/api-reference/audio/createSpeech) endpoint based on our [GPT-4o mini TTS (text-to-speech) model](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts). It comes with 11 built-in voices and can be used to:

- Narrate a written blog post
- Produce spoken audio in multiple languages
- Give realtime audio output using streaming

Here's an example of the `alloy` voice:

Our [usage policies](https://openai.com/policies/usage-policies) require you
  to provide a clear disclosure to end users that the TTS voice they are hearing
  is AI-generated and not a human voice.

## Quickstart

The `speech` endpoint takes three key inputs:

1. The [model](https://developers.openai.com/api/docs/api-reference/audio/createSpeech#audio-createspeech-model) you're using
1. The [text](https://developers.openai.com/api/docs/api-reference/audio/createSpeech#audio-createspeech-input) to be turned into audio
1. The [voice](https://developers.openai.com/api/docs/api-reference/audio/createSpeech#audio-createspeech-voice) that will speak the output

Here's a simple request example:

Generate spoken audio from input text

```javascript
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI();
const speechFile = path.resolve("./speech.mp3");

const mp3 = await openai.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "coral",
  input: "Today is a wonderful day to build something people love!",
  instructions: "Speak in a cheerful and positive tone.",
});

const buffer = Buffer.from(await mp3.arrayBuffer());
await fs.promises.writeFile(speechFile, buffer);
```

```python
from pathlib import Path
from openai import OpenAI

client = OpenAI()
speech_file_path = Path(__file__).parent / "speech.mp3"

with client.audio.speech.with_streaming_response.create(
    model="gpt-4o-mini-tts",
    voice="coral",
    input="Today is a wonderful day to build something people love!",
    instructions="Speak in a cheerful and positive tone.",
) as response:
    response.stream_to_file(speech_file_path)
```

```bash
curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini-tts",
    "input": "Today is a wonderful day to build something people love!",
    "voice": "coral",
    "instructions": "Speak in a cheerful and positive tone."
  }' \
  --output speech.mp3
```

```cli
openai audio:speech create \
  --model gpt-4o-mini-tts \
  --voice coral \
  --instructions "Speak in a cheerful and positive tone." \
  --input "Today is a wonderful day to build something people love!" \
  --output speech.mp3
```


By default, the endpoint outputs an MP3 of the spoken audio, but you can configure it to output any [supported format](#supported-output-formats).

### Text-to-speech models

For intelligent realtime applications, use the `gpt-4o-mini-tts` model, our newest and most reliable text-to-speech model. You can prompt the model to control aspects of speech, including:

- Accent
- Emotional range
- Intonation
- Impressions
- Speed of speech
- Tone
- Whispering

Our other text-to-speech models are `tts-1` and `tts-1-hd`. The `tts-1` model provides lower latency, but at a lower quality than the `tts-1-hd` model.

### Voice options

The TTS endpoint provides 13 built‑in voices to control how speech is rendered from text. **Hear and play with these voices in [OpenAI.fm](https://openai.fm), our interactive demo for trying the latest text-to-speech model in the OpenAI API**. Voices are currently optimized for English.

- `alloy`
- `ash`
- `ballad`
- `coral`
- `echo`
- `fable`
- `nova`
- `onyx`
- `sage`
- `shimmer`
- `verse`
- `marin`
- `cedar`

For best quality, we recommend using `marin` or `cedar`.

Voice availability depends on the model. The `tts-1` and `tts-1-hd` models support a smaller set: `alloy`, `ash`, `coral`, `echo`, `fable`, `onyx`, `nova`, `sage`, and `shimmer`.

If you're using the [Realtime API](https://developers.openai.com/api/docs/guides/realtime), note that the set of available voices is slightly different—see the [realtime conversations guide](https://developers.openai.com/api/docs/guides/realtime-conversations#voice-options) for current realtime voices.

### Streaming realtime audio

The Speech API provides support for realtime audio streaming using [chunk transfer encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding). This means the audio can be played before the full file is generated and made accessible.

Stream spoken audio from input text directly to your speakers

```javascript
import OpenAI from "openai";
import { playAudio } from "openai/helpers/audio";

const openai = new OpenAI();

const response = await openai.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "coral",
  input: "Today is a wonderful day to build something people love!",
  instructions: "Speak in a cheerful and positive tone.",
  response_format: "wav",
});

await playAudio(response);
```

```python
import asyncio

from openai import AsyncOpenAI
from openai.helpers import LocalAudioPlayer

openai = AsyncOpenAI()

async def main() -> None:
    async with openai.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="coral",
        input="Today is a wonderful day to build something people love!",
        instructions="Speak in a cheerful and positive tone.",
        response_format="pcm",
    ) as response:
        await LocalAudioPlayer().play(response)

if __name__ == "__main__":
    asyncio.run(main())
```

```bash
curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini-tts",
    "input": "Today is a wonderful day to build something people love!",
    "voice": "coral",
    "instructions": "Speak in a cheerful and positive tone.",
    "response_format": "wav"
  }' | ffplay -i -
```


For the fastest response times, we recommend using `wav` or `pcm` as the response format.

## Supported output formats

The default response format is `mp3`, but other formats like `opus` and `wav` are available.

- **MP3**: The default response format for general use cases.
- **Opus**: For internet streaming and communication, low latency.
- **AAC**: For digital audio compression, preferred by YouTube, Android, iOS.
- **FLAC**: For lossless audio compression, favored by audio enthusiasts for archiving.
- **WAV**: Uncompressed WAV audio, suitable for low-latency applications to avoid decoding overhead.
- **PCM**: Similar to WAV but contains the raw samples in 24kHz (16-bit signed, low-endian), without the header.

## Supported languages

The TTS model generally follows the Whisper model in terms of language support. Whisper [supports the following languages](https://github.com/openai/whisper#available-models-and-languages) and performs well, despite voices being optimized for English:

Afrikaans, Arabic, Armenian, Azerbaijani, Belarusian, Bosnian, Bulgarian, Catalan, Chinese, Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, Galician, German, Greek, Hebrew, Hindi, Hungarian, Icelandic, Indonesian, Italian, Japanese, Kannada, Kazakh, Korean, Latvian, Lithuanian, Macedonian, Malay, Marathi, Maori, Nepali, Norwegian, Persian, Polish, Portuguese, Romanian, Russian, Serbian, Slovak, Slovenian, Spanish, Swahili, Swedish, Tagalog, Tamil, Thai, Turkish, Ukrainian, Urdu, Vietnamese, and Welsh.

You can generate spoken audio in these languages by providing input text in the language of your choice.

## Custom voices

Custom voices enable you to create a unique voice for your agent or application. These voices can be used for audio output with the [Text to Speech API](https://developers.openai.com/api/docs/api-reference/audio/createSpeech), the [Realtime API](https://developers.openai.com/api/docs/api-reference/realtime), or the [Chat Completions API with audio output](https://developers.openai.com/api/docs/guides/audio).

To create a custom voice, you’ll provide a short sample audio reference that the model will seek to replicate.

Custom voices are limited to eligible customers. Contact our [sales
  team](https://openai.com/contact-sales/) to learn more. Once enabled for your
  organization, you’ll have access to the
  [Voices](https://platform.openai.com/audio/voices) tab under Audio.

#### Creating a voice

Currently, voices must be created through an API request. See the API reference for the full set of API operations.

Creating a voice requires two separate audio recordings:

1. **Consent recording** — this recording captures the voice actor providing consent to create a likeness of their voice. The actor must read one of the consent phrases provided below.
2. **Sample recording** — the actual audio sample that the model will try to adhere to. The voice must match the consent recording.

**Tips for creating a high-quality voice**

The quality of your custom voice is highly dependent on the quality of the sample you provide. Optimizing the recording quality can make a big difference.

- Record in a quiet space with minimal echo.
- Use a professional XLR microphone.
- Stay about 7–8 inches from the mic with a pop filter in between, and keep that distance consistent.
- The model copies exactly what you give it—tone, cadence, energy, pauses, habits—so record the exact voice you want. Be consistent in energy, style, and accent throughout.
- Small variations in the audio sample can result in quality differences with the generated voice, it's worth trying multiple examples to find the best fit.

**Requirements and limitations**

- At most 20 voices can be created per organization.
- The audio samples must be 30 seconds or less.
- The audio samples must be one of the following types: `mpeg`, `wav`, `ogg`, `aac`, `flac`, `webm`, or `mp4`.

Refer to the Text-to-Speech Supplemental Agreement for additional terms of use.

**Creating a voice consent**

The consent audio recording must only include one of the following phrases. Any divergence from the script will lead to a failure.

| Language | Phrase                                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `de`     | Ich bin der Eigentümer dieser Stimme und bin damit einverstanden, dass OpenAI diese Stimme zur Erstellung eines synthetischen Stimmmodells verwendet. |
| `en`     | I am the owner of this voice and I consent to OpenAI using this voice to create a synthetic voice model.                                              |
| `es`     | Soy el propietario de esta voz y doy mi consentimiento para que OpenAI la utilice para crear un modelo de voz sintética.                              |
| `fr`     | Je suis le propriétaire de cette voix et j'autorise OpenAI à utiliser cette voix pour créer un modèle de voix synthétique.                            |
| `hi`     | मैं इस आवाज का मालिक हूं और मैं सिंथेटिक आवाज मॉडल बनाने के लिए OpenAI को इस आवाज का उपयोग करने की सहमति देता हूं                                     |
| `id`     | Saya adalah pemilik suara ini dan saya memberikan persetujuan kepada OpenAI untuk menggunakan suara ini guna membuat model suara sintetis.            |
| `it`     | Sono il proprietario di questa voce e acconsento che OpenAI la utilizzi per creare un modello di voce sintetica.                                      |
| `ja`     | 私はこの音声の所有者であり、OpenAIがこの音声を使用して音声合成 モデルを作成することを承認します。                                                     |
| `ko`     | 나는 이 음성의 소유자이며 OpenAI가 이 음성을 사용하여 음성 합성 모델을 생성할 것을 허용합니다.                                                        |
| `nl`     | Ik ben de eigenaar van deze stem en ik geef OpenAI toestemming om deze stem te gebruiken om een synthetisch stemmodel te maken.                       |
| `pl`     | Jestem właścicielem tego głosu i wyrażam zgodę na wykorzystanie go przez OpenAI w celu utworzenia syntetycznego modelu głosu.                         |
| `pt`     | Eu sou o proprietário desta voz e autorizo o OpenAI a usá-la para criar um modelo de voz sintética.                                                   |
| `ru`     | Я являюсь владельцем этого голоса и даю согласие OpenAI на использование этого голоса для создания модели синтетического голоса.                      |
| `uk`     | Я є власником цього голосу і даю згоду OpenAI використовувати цей голос для створення синтетичної голосової моделі.                                   |
| `vi`     | Tôi là chủ sở hữu giọng nói này và tôi đồng ý cho OpenAI sử dụng giọng nói này để tạo mô hình giọng nói tổng hợp.                                     |
| `zh`     | 我是此声音的拥有者并授权OpenAI使用此声音创建语音合成模型                                                                                              |

Then upload the recording via the API. A successful upload will return the consent recording ID that you’ll reference later. Note the consent can be used for multiple different voice creations if the same voice actor is making multiple attempts.

```bash
curl https://api.openai.com/v1/audio/voice_consents \
  -X POST \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "name=test_consent" \
  -F "language=en" \
  -F "recording=@$HOME/tmp/voice_consent/consent_recording.wav;type=audio/x-wav"
```


**Creating a voice**

Next, you’ll create the actual voice by referencing the consent recording ID, and providing the voice sample.

```bash
curl https://api.openai.com/v1/audio/voices \
  -X POST \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "name=test_voice" \
  -F "audio_sample=@$HOME/tmp/voice_consent/audio_sample_recording.wav;type=audio/x-wav" \
  -F "consent=cons_123abc"
```


If successful, the created voice will be listed under the [Audio tab](https://platform.openai.com/audio/voices).

#### Using a voice during speech generation

Speech generation will work as usual. Simply specify the ID of the voice in the `voice` parameter when [creating speech](https://developers.openai.com/api/docs/api-reference/audio/createSpeech), or when initiating a [realtime session](https://developers.openai.com/api/docs/api-reference/realtime/create-call#realtime_create_call-session-audio-output-voice).

**Text to speech example**

```bash
curl https://api.openai.com/v1/audio/speech \
  -X POST \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini-tts",
    "voice": {
      "id": "voice_123abc"
    },
    "input": "Maple est le meilleur golden retriever du monde entier.",
    "language": "fr",
    "format": "wav"
  }' \
  --output sample.wav
```


**Realtime API example**

```javascript
const sessionConfig = JSON.stringify({
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    audio: {
      output: {
        voice: { id: "voice_123abc" },
      },
    },
  },
});
```

## Related guides

<a href="/api/docs/guides/realtime">
  

<span slot="icon">
      </span>
    Choose the right path for voice agents, translation, transcription, and
    speech generation.


</a>

<a href="/api/docs/guides/audio">
  

<span slot="icon">
      </span>
    Review audio modalities, speech tasks, streaming, and request-based APIs.


</a>
``````
:::
:::

