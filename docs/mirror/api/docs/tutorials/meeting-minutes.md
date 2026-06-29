---
title: "会议纪要"
description: "Create an automated meeting minutes generator with Whisper and a GPT model."
outline: deep
---

# 会议纪要

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/tutorials/meeting-minutes](https://developers.openai.com/api/docs/tutorials/meeting-minutes)
- Markdown 来源：[https://developers.openai.com/api/docs/tutorials/meeting-minutes.md](https://developers.openai.com/api/docs/tutorials/meeting-minutes.md)
- 抓取时间：2026-06-27T05:54:14.023Z
- Checksum：`4ec8b9bef0adee1026b900f6be8c2777fa14f234ba3c35b1ca3b951bae87249f`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
在本教程中，我们将利用 OpenAI 的 Whisper 和 GPT 模型来开发一个自动会议纪要生成器。该应用会转录会议音频，提供讨论摘要，提取要点和行动项，并执行情感分析。

## 开始使用

本教程假设你对 Python 有基本了解，并拥有一个 [OpenAI API key](https://platform.openai.com/settings/organization/api-keys)。你可以使用本教程提供的音频文件，也可以使用自己的音频文件。

此外，你需要安装 [python-docx](https://python-docx.readthedocs.io/en/latest/) 和 [OpenAI](/mirror/api/docs/libraries) 库。可以使用以下命令创建新的 Python 环境并安装所需 package：

```bash
python -m venv env

source env/bin/activate

pip install openai
pip install python-docx
```

## 使用 Whisper 转录音频






      转录会议音频的第一步，是将会议音频文件传给我们的
      &lt;a href="/api/docs/api-reference/audio"&gt;/v1/audio API&lt;/a&gt;。Whisper 是
      支撑 audio API 的模型，能够将口语转换为书面文本。开始时，我们会避免传入

        prompt

      或

        temperature

      （用于控制模型输出的可选参数），并使用默认值。




下载示例音频








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

`abstract_summary_extraction` 函数接收转录文本，并将其总结为简洁的摘要段落，目标是在避免不必要细节或偏题内容的同时保留最重要的观点。实现这一过程的主要机制是如下所示的 system message。通过通常称为 prompt engineering 的过程，有许多不同方式可以达到类似结果。你可以阅读我们的 [prompt engineering guide](/mirror/api/docs/guides/prompt-engineering)，其中提供了关于如何最有效完成此事的深入建议。

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

`action_item_extraction` 函数会识别会议期间达成一致或提及需要完成的任务、分派事项或行动。这些可以是分配给特定个人的任务，也可以是小组决定采取的一般行动。虽然本教程未涵盖这一点，但 Chat Completions API 提供了 [function calling capability](/mirror/api/docs/guides/function-calling)，可让你构建自动在任务管理软件中创建任务并将其分配给相关人员的能力。

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






      生成会议纪要后，将其保存为易读、便于分发的格式会很有帮助。这类报告的一种常见格式是 Microsoft Word。Python docx 库是一个常用的开源库，用于创建 Word 文档。如果你想构建端到端的会议纪要应用，可以考虑移除此导出步骤，改为将摘要作为电子邮件 followup 内联发送。






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

现在你已经完成了基础会议纪要处理设置，可以考虑使用 [prompt engineering](/mirror/api/docs/guides/prompt-engineering) 优化性能，或者使用原生 [function calling](/mirror/api/docs/guides/function-calling) 构建端到端系统。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
In this tutorial, we'll harness the power of OpenAI's Whisper and GPT models to develop an automated meeting minutes generator. The application transcribes audio from a meeting, provides a summary of the discussion, extracts key points and action items, and performs a sentiment analysis.

## Getting started

This tutorial assumes a basic understanding of Python and an [OpenAI API key](https://platform.openai.com/settings/organization/api-keys). You can use the audio file provided with this tutorial or your own.

Additionally, you will need to install the [python-docx](https://python-docx.readthedocs.io/en/latest/) and [OpenAI](https://developers.openai.com/api/docs/libraries) libraries. You can create a new Python environment and install the required packages with the following commands:

```bash
python -m venv env

source env/bin/activate

pip install openai
pip install python-docx
```

## Transcribing audio with Whisper

<div className="sandbox-preview">
  <div className="sandbox-screenshot-small">
    </div>
  <div className="preview-info">
    <div className="description">
      The first step in transcribing the audio from a meeting is to pass the
      audio file of the meeting into our 
      <a href="/api/docs/api-reference/audio">/v1/audio API</a>. Whisper, the
      model that powers the audio API, is capable of converting spoken language
      into written text. To start, we will avoid passing a 
      <a href="/api/docs/api-reference/audio/createTranscription#audio/createTranscription-prompt">
        prompt
      </a> 
      or 
      <a href="/api/docs/api-reference/audio/createTranscription#audio/createTranscription-temperature-4">
        temperature
      </a> 
      (optional parameters to control the model's output) and stick with the
      default values.
    </div>
    <div className="actions">
      

Download sample audio


    </div>
  </div>
</div>

<br />

Next, we import the required packages and define a function that uses the Whisper model to take in the audio file and
transcribe it:

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


In this function, `audio_file_path` is the path to the audio file you want to transcribe. The function opens this file and passes it to the Whisper ASR model (`whisper-1`) for transcription. The result is returned as raw text. It’s important to note that the `openai.Audio.transcribe` function requires the actual audio file to be passed in, not just the path to the file locally or on a remote server. This means that if you are running this code on a server where you might not also be storing your audio files, you will need to have a preprocessing step that first downloads the audio files onto that device.

## Summarizing and analyzing the transcript with a GPT model

Having obtained the transcript, we now pass it to a GPT model via the [Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat/create). The snippets below use a tested model to generate a summary, extract key points, action items, and perform sentiment analysis. For new projects, start with [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5).

This tutorial uses distinct functions for each task we want the model to perform. This is not the most efficient way to do this task - you can put these instructions into one function, however, splitting them up can lead to higher quality summarization.

To split the tasks up, we define the `meeting_minutes` function which will serve as the main function of this application:

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


In this function, `transcription` is the text we obtained from Whisper. The transcription can be passed to the four other functions, each designed to perform a specific task: `abstract_summary_extraction` generates a summary of the meeting, `key_points_extraction` extracts the main points, `action_item_extraction` identifies the action items, and `sentiment_analysis performs` a sentiment analysis. If there are other capabilities you want, you can add those in as well using the same framework shown above.

Here is how each of these functions works:

### Summary extraction

The `abstract_summary_extraction` function takes the transcription and summarizes it into a concise abstract paragraph with the aim to retain the most important points while avoiding unnecessary details or tangential points. The main mechanism to enable this process is the system message as shown below. There are many different possible ways of achieving similar results through the process commonly referred to as prompt engineering. You can read our [prompt engineering guide](https://developers.openai.com/api/docs/guides/prompt-engineering) which gives in depth advice on how to do this most effectively.

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


### Key points extraction

The `key_points_extraction` function identifies and lists the main points discussed in the meeting. These points should represent the most important ideas, findings, or topics crucial to the essence of the discussion. Again, the main mechanism for controlling the way these points are identified is the system message. You might want to give some additional context here around the way your project or company runs such as “We are a company that sells race cars to consumers. We do XYZ with the goal of XYZ”. This additional context could dramatically improve the models ability to extract information that is relevant.

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


### Action item extraction

The `action_item_extraction` function identifies tasks, assignments, or actions agreed upon or mentioned during the meeting. These could be tasks assigned to specific individuals or general actions the group decided to take. While not covered in this tutorial, the Chat Completions API provides a [function calling capability](https://developers.openai.com/api/docs/guides/function-calling) which would allow you to build in the ability to automatically create tasks in your task management software and assign it to the relevant person.

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


### Sentiment analysis

The `sentiment_analysis` function analyzes the overall sentiment of the discussion. It considers the tone, the emotions conveyed by the language used, and the context in which words and phrases are used. For less complicated tasks, it may also be worthwhile to try [`gpt-5.4-mini`](https://developers.openai.com/api/docs/models/gpt-5.4-mini) to see if you can get a similar level of performance at lower cost and latency. It might also be useful to experiment with taking the results of the `sentiment_analysis` function and passing it to the other functions to see how having the sentiment of the conversation impacts the other attributes.

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


## Exporting meeting minutes

<div className="sandbox-preview">
  <div className="sandbox-screenshot-small">
    </div>
  <div className="preview-info">
    <div className="description">
      Once we've generated the meeting minutes, it's beneficial to save them
      into a readable format that can be easily distributed. One common format
      for such reports is Microsoft Word. The Python docx library is a popular
      open source library for creating Word documents. If you wanted to build an
      end-to-end meeting minute application, you might consider removing this
      export step in favor of sending the summary inline as an email followup.
    </div>
  </div>
</div>

<br></br>

To handle the exporting process, define a function `save_as_docx` that converts the raw text to a Word document:

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


In this function, minutes is a dictionary containing the abstract summary, key points, action items, and sentiment analysis from the meeting. Filename is the name of the Word document file to be created. The function creates a new Word document, adds headings and content for each part of the minutes, and then saves the document to the current working directory.

Finally, you can put it all together and generate the meeting minutes from an audio file:

```python
audio_file_path = "Earningscall.wav"
transcription = transcribe_audio(audio_file_path)
minutes = meeting_minutes(transcription)
print(minutes)

save_as_docx(minutes, 'meeting_minutes.docx')
```


This code will transcribe the audio file `Earningscall.wav`, generates the meeting minutes, prints them, and then saves them into a Word document called `meeting_minutes.docx`.

Now that you have the basic meeting minutes processing setup, consider trying to optimize the performance with [prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) or build an end-to-end system with native [function calling](https://developers.openai.com/api/docs/guides/function-calling).
``````
:::
:::

