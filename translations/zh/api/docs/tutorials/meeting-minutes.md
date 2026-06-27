---
status: needs-review
sourceId: "4ec8b9bef0ad"
sourceChecksum: "4ec8b9bef0adee1026b900f6be8c2777fa14f234ba3c35b1ca3b951bae87249f"
sourceUrl: "https://developers.openai.com/api/docs/tutorials/meeting-minutes"
translatedAt: "2026-06-27T18:00:58.7410056+08:00"
translator: codex-gpt-5.5-xhigh
---

# 会议纪要

在本教程中，我们将利用 OpenAI 的 Whisper 和 GPT 模型来开发一个自动会议纪要生成器。该应用会转录会议音频，提供讨论摘要，提取要点和行动项，并执行情感分析。

## 开始使用

本教程假设你对 Python 有基本了解，并拥有一个 [OpenAI API key](https://platform.openai.com/settings/organization/api-keys)。你可以使用本教程提供的音频文件，也可以使用自己的音频文件。

此外，你需要安装 [python-docx](https://python-docx.readthedocs.io/en/latest/) 和 [OpenAI](https://developers.openai.com/api/docs/libraries) 库。可以使用以下命令创建新的 Python 环境并安装所需 package：

```bash
python -m venv env

source env/bin/activate

pip install openai
pip install python-docx
```

## 使用 Whisper 转录音频

<div className="sandbox-preview">
  <div className="sandbox-screenshot-small">
    </div>
  <div className="preview-info">
    <div className="description">
      转录会议音频的第一步，是将会议音频文件传给我们的
      <a href="/api/docs/api-reference/audio">/v1/audio API</a>。Whisper 是
      支撑 audio API 的模型，能够将口语转换为书面文本。开始时，我们会避免传入
      <a href="/api/docs/api-reference/audio/createTranscription#audio/createTranscription-prompt">
        prompt
      </a>
      或
      <a href="/api/docs/api-reference/audio/createTranscription#audio/createTranscription-temperature-4">
        temperature
      </a>
      （用于控制模型输出的可选参数），并使用默认值。
    </div>
    <div className="actions">


下载示例音频


    </div>
  </div>
</div>

<br />

接下来，我们导入所需 package，并定义一个函数，该函数使用 Whisper 模型接收音频文件并进行转录：

```python
from openai import OpenAI

client = OpenAI(
    # defaults to os.environ.get("OPENAI_API_KEY")
    # api_key="My API Key",
)
from docx import Document

def transcribe_audio(audio_file_path):
    with open(audio_file_path, 'rb') as audio_file:
        transcription = client.audio.transcriptions.create("whisper-1", audio_file)
    return transcription['text']
```


在这个函数中，`audio_file_path` 是你想要转录的音频文件路径。函数会打开该文件，并将其传给 Whisper ASR 模型（`whisper-1`）进行转录。结果会以原始文本形式返回。需要注意的是，`openai.Audio.transcribe` 函数要求传入实际音频文件，而不仅仅是本地路径或远程服务器上的文件路径。这意味着，如果你在服务器上运行这段代码，而音频文件并未也存储在该服务器上，则需要有一个预处理步骤，先将音频文件下载到该设备。

## 使用 GPT 模型总结并分析转录文本

获得转录文本后，我们现在通过 [Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat/create) 将其传给 GPT 模型。下面的代码片段使用经过测试的模型来生成摘要、提取要点、提取行动项并执行情感分析。对于新项目，请从 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 开始。

本教程针对希望模型执行的每项任务使用单独的函数。这不是完成该任务最高效的方式，你可以把这些 instructions 放入一个函数中；不过，将它们拆开可能会带来更高质量的总结结果。

为拆分这些任务，我们定义 `meeting_minutes` 函数，它将作为此应用的主函数：

```python
def meeting_minutes(transcription):
    abstract_summary = abstract_summary_extraction(transcription)
    key_points = key_points_extraction(transcription)
    action_items = action_item_extraction(transcription)
    sentiment = sentiment_analysis(transcription)
    return {
        'abstract_summary': abstract_summary,
        'key_points': key_points,
        'action_items': action_items,
        'sentiment': sentiment
    }
```


在这个函数中，`transcription` 是我们从 Whisper 获得的文本。转录文本可以传给另外四个函数，每个函数都用于执行一项特定任务：`abstract_summary_extraction` 生成会议摘要，`key_points_extraction` 提取主要观点，`action_item_extraction` 识别行动项，`sentiment_analysis performs` 执行情感分析。如果你还需要其他能力，也可以使用上面展示的同一框架添加。

以下是每个函数的工作方式：

### 摘要提取

`abstract_summary_extraction` 函数接收转录文本，并将其总结为简洁的摘要段落，目标是在避免不必要细节或偏题内容的同时保留最重要的观点。实现这一过程的主要机制是如下所示的 system message。通过通常称为 prompt engineering 的过程，有许多不同方式可以达到类似结果。你可以阅读我们的 [prompt engineering guide](https://developers.openai.com/api/docs/guides/prompt-engineering)，其中提供了关于如何最有效完成此事的深入建议。

```python
def abstract_summary_extraction(transcription):
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {
                "role": "system",
                "content": "You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the following text and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points."
            },
            {
                "role": "user",
                "content": transcription
            }
        ]
    )
    return completion.choices[0].message.content
```


### 要点提取

`key_points_extraction` 函数会识别并列出会议中讨论的主要观点。这些观点应代表对讨论本质至关重要的最重要想法、发现或主题。同样，控制这些观点识别方式的主要机制是 system message。你可能希望在这里围绕你的项目或公司的运作方式提供一些额外上下文，例如“我们是一家向消费者销售赛车的公司。我们做 XYZ，目标是 XYZ”。这些额外上下文可能会显著提升模型提取相关信息的能力。

```python
def key_points_extraction(transcription):
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {
                "role": "system",
                "content": "You are a proficient AI with a specialty in distilling information into key points. Based on the following text, identify and list the main points that were discussed or brought up. These should be the most important ideas, findings, or topics that are crucial to the essence of the discussion. Your goal is to provide a list that someone could read to quickly understand what was talked about."
            },
            {
                "role": "user",
                "content": transcription
            }
        ]
    )
    return completion.choices[0].message.content
```


### 行动项提取

`action_item_extraction` 函数会识别会议期间达成一致或提及需要完成的任务、分派事项或行动。这些可以是分配给特定个人的任务，也可以是小组决定采取的一般行动。虽然本教程未涵盖这一点，但 Chat Completions API 提供了 [function calling capability](https://developers.openai.com/api/docs/guides/function-calling)，可让你构建自动在任务管理软件中创建任务并将其分配给相关人员的能力。

```python
def action_item_extraction(transcription):
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {
                "role": "system",
                "content": "You are an AI expert in analyzing conversations and extracting action items. Please review the text and identify any tasks, assignments, or actions that were agreed upon or mentioned as needing to be done. These could be tasks assigned to specific individuals, or general actions that the group has decided to take. Please list these action items clearly and concisely."
            },
            {
                "role": "user",
                "content": transcription
            }
        ]
    )
    return completion.choices[0].message.content
```


### 情感分析

`sentiment_analysis` 函数会分析讨论的整体情感。它会考虑语气、所用语言传达的情绪，以及词语和短语被使用时的上下文。对于较简单的任务，也值得尝试 [`gpt-5.4-mini`](https://developers.openai.com/api/docs/models/gpt-5.4-mini)，看看是否能以更低的成本和延迟获得类似性能。尝试将 `sentiment_analysis` 函数的结果传给其他函数，观察 conversation 的情感如何影响其他属性，也可能会有帮助。

```python
def sentiment_analysis(transcription):
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {
                "role": "system",
                "content": "As an AI with expertise in language and emotion analysis, your task is to analyze the sentiment of the following text. Please consider the overall tone of the discussion, the emotion conveyed by the language used, and the context in which words and phrases are used. Indicate whether the sentiment is generally positive, negative, or neutral, and provide brief explanations for your analysis where possible."
            },
            {
                "role": "user",
                "content": transcription
            }
        ]
    )
    return completion.choices[0].message.content
```


## 导出会议纪要

<div className="sandbox-preview">
  <div className="sandbox-screenshot-small">
    </div>
  <div className="preview-info">
    <div className="description">
      生成会议纪要后，将其保存为易读、便于分发的格式会很有帮助。这类报告的一种常见格式是 Microsoft Word。Python docx 库是一个常用的开源库，用于创建 Word 文档。如果你想构建端到端的会议纪要应用，可以考虑移除此导出步骤，改为将摘要作为电子邮件 followup 内联发送。
    </div>
  </div>
</div>

<br></br>

为处理导出流程，定义一个 `save_as_docx` 函数，将原始文本转换为 Word 文档：

```python
def save_as_docx(minutes, filename):
    doc = Document()
    for key, value in minutes.items():
        # Replace underscores with spaces and capitalize each word for the heading
        heading = ' '.join(word.capitalize() for word in key.split('_'))
        doc.add_heading(heading, level=1)
        doc.add_paragraph(value)
        # Add a line break between sections
        doc.add_paragraph()
    doc.save(filename)
```


在这个函数中，minutes 是一个字典，包含会议的摘要、要点、行动项和情感分析。Filename 是要创建的 Word 文档文件名。该函数会创建一个新的 Word 文档，为纪要的每一部分添加标题和内容，然后将文档保存到当前工作目录。

最后，你可以把所有内容组合起来，从音频文件生成会议纪要：

```python
audio_file_path = "Earningscall.wav"
transcription = transcribe_audio(audio_file_path)
minutes = meeting_minutes(transcription)
print(minutes)

save_as_docx(minutes, 'meeting_minutes.docx')
```


这段代码会转录音频文件 `Earningscall.wav`，生成会议纪要，将其打印出来，然后保存为名为 `meeting_minutes.docx` 的 Word 文档。

现在你已经完成了基础会议纪要处理设置，可以考虑使用 [prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) 优化性能，或者使用原生 [function calling](https://developers.openai.com/api/docs/guides/function-calling) 构建端到端系统。
