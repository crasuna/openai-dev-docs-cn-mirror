---
title: "开发者快速入门"
description: "Learn how to use the OpenAI API to generate human-like responses to natural language prompts, analyze images with computer vision, use powerful built-in tools, and more."
outline: deep
---

# 开发者快速入门

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/quickstart](https://developers.openai.com/api/docs/quickstart)
- Markdown 来源：[https://developers.openai.com/api/docs/quickstart.md](https://developers.openai.com/api/docs/quickstart.md)
- 抓取时间：2026-06-27T05:54:13.514Z
- Checksum：`7816cc1ae7620265596a7e9791a7aa44ac66a6b27cadf2fecab39c18992ed775`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
OpenAI API 提供了一个简单接口，可使用先进 AI [模型](https://developers.openai.com/api/docs/models)进行文本生成、自然语言处理、计算机视觉等任务。先创建 API Key 并运行你的第一次 API 调用，即可开始使用。探索如何生成文本、分析图像、构建 agents，以及更多能力。

## 创建并导出 API key



StatsigClient.logEvent("quickstart_create_api_key_click", null, null)
  }
&gt;
  创建 API Key



开始之前，请先在 dashboard 中创建一个 API key，你将使用它来安全地[访问 API](https://developers.openai.com/api/docs/api-reference/authentication)。请把该 key 存放在安全位置，例如 [`.zshrc` 文件](https://www.freecodecamp.org/news/how-do-zsh-configuration-files-work/)或你电脑上的另一个文本文件。生成 API key 后，请在终端中将它导出为[环境变量](https://en.wikipedia.org/wiki/Environment_variable)。




macOS / Linux


Windows




OpenAI SDK 会被配置为自动从系统环境读取你的 API key。

## 安装 OpenAI SDK 并运行一次 API 调用




JavaScript


Python


.NET


Java


Go



&lt;a
  href="https://github.com/openai/openai-responses-starter-app"
  target="_blank"
  rel="noreferrer"
&gt;
  



    开始使用 Responses API 构建。




[



    进一步了解 prompting、message roles，以及如何构建对话式应用。

](https://developers.openai.com/api/docs/guides/text)

## 添加额度以继续构建



StatsigClient.logEvent("quickstart_add_credits_billing_click", null, null)
  }
&gt;
  前往 billing



恭喜你运行了一个免费的测试 API 请求！开始使用更高的限制构建真实应用，并使用<a href="/api/docs/models" target="_blank">我们的模型</a>生成文本、音频、图像、视频等内容。


  探索旨在帮助你更快发布的工具和文档：

&lt;a
  href="https://platform.openai.com/chat"
  target="_blank"
  rel="noreferrer"
  onClick={() =&gt;
    StatsigClient.logEvent(
      "quickstart_add_credits_chat_playground_click",
      null,
      null
    )
  }
&gt;
  



    构建并测试对话式 prompts，然后将它们嵌入你的应用。



[



    使用 Agents SDK 构建、运行并观察 agent 工作流。

](https://developers.openai.com/api/docs/guides/agents)

## 分析图像和文件

将图像 URL、上传的文件或 PDF 文档直接发送给模型，以提取文本、分类内容或检测视觉元素。




Image URL


File URL


Upload file




[



    学习如何使用图像输入，并从图像中提取含义。

](https://developers.openai.com/api/docs/guides/images)

[



    学习如何使用文件输入，并从文档中提取含义。

](https://developers.openai.com/api/docs/guides/file-inputs)

## 使用工具扩展模型

通过附加[工具](/mirror/api/docs/guides/tools)，让模型访问外部数据和函数。使用 web search 或 file search 等内置工具，或定义你自己的工具，用于调用 API、运行代码，或与第三方系统集成。




Web search


File search


Code Interpreter


Function calling


Remote MCP




[



    了解 web search 和 file search 等强大的内置工具。

](https://developers.openai.com/api/docs/guides/tools)

[



    学习如何让模型调用你自己的自定义代码。

](https://developers.openai.com/api/docs/guides/function-calling)

## 流式传输响应并构建 realtime 应用

使用 server-sent [streaming events](/mirror/api/docs/guides/streaming-responses) 在结果生成时展示结果，或使用 [Realtime API](/mirror/api/docs/guides/realtime) 构建交互式语音和多模态应用。

[



    使用 server-sent events，快速向用户流式传输模型响应。

](https://developers.openai.com/api/docs/guides/streaming-responses)

[



    使用 WebRTC 或 WebSockets 构建超高速语音到语音 AI 应用。

](https://developers.openai.com/api/docs/guides/realtime)

## 构建 agents

使用 OpenAI platform 构建能够代表用户采取行动的 [agents](/mirror/api/docs/guides/agents)，例如[控制计算机](/mirror/api/docs/guides/tools-computer-use)。使用 [Agents SDK](/mirror/api/docs/guides/agents) 在后端创建编排逻辑。

[



    学习如何使用 OpenAI platform 构建强大、有能力的 AI agents。

](https://developers.openai.com/api/docs/guides/agents)

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
The OpenAI API provides a simple interface to state-of-the-art AI [models](https://developers.openai.com/api/docs/models) for text generation, natural language processing, computer vision, and more. Get started by creating an API Key and running your first API call. Discover how to generate text, analyze images, build agents, and more.

## Create and export an API key



StatsigClient.logEvent("quickstart_create_api_key_click", null, null)
  }
>
  Create an API Key


<p></p>
Before you begin, create an API key in the dashboard, which you'll use to
securely [access the API](https://developers.openai.com/api/docs/api-reference/authentication). Store the key
in a safe location, like a [`.zshrc`
file](https://www.freecodecamp.org/news/how-do-zsh-configuration-files-work/) or
another text file on your computer. Once you've generated an API key, export it
as an [environment variable](https://en.wikipedia.org/wiki/Environment_variable)
in your terminal.



<div data-content-switcher-pane data-value="macOS">
    <div class="hidden">macOS / Linux</div>
    </div>
  <div data-content-switcher-pane data-value="windows" hidden>
    <div class="hidden">Windows</div>
    </div>



OpenAI SDKs are configured to automatically read your API key from the system environment.

## Install the OpenAI SDK and Run an API Call



<div data-content-switcher-pane data-value="javascript">
    <div class="hidden">JavaScript</div>
    </div>
  <div data-content-switcher-pane data-value="python" hidden>
    <div class="hidden">Python</div>
    </div>
  <div data-content-switcher-pane data-value="csharp" hidden>
    <div class="hidden">.NET</div>
    </div>
  <div data-content-switcher-pane data-value="java" hidden>
    <div class="hidden">Java</div>
    </div>
  <div data-content-switcher-pane data-value="golang" hidden>
    <div class="hidden">Go</div>
    </div>


<a
  href="https://github.com/openai/openai-responses-starter-app"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Start building with the Responses API.


</a>

[

<span slot="icon">
      </span>
    Learn more about prompting, message roles, and building conversational apps.

](https://developers.openai.com/api/docs/guides/text)

## Add credits to keep building



StatsigClient.logEvent("quickstart_add_credits_billing_click", null, null)
  }
>
  Go to billing


{/* prettier-ignore */}
<div className="mt-2">Congrats on running a free test API request! Start building real applications with higher limits and use <a href="/api/docs/models" target="_blank">our models</a> to generate text, audio, images, videos and more.</div>

<div className="mt-2">
  Explore tools and docs designed to help you ship faster:
</div>
<a
  href="https://platform.openai.com/chat"
  target="_blank"
  rel="noreferrer"
  onClick={() =>
    StatsigClient.logEvent(
      "quickstart_add_credits_chat_playground_click",
      null,
      null
    )
  }
>
  

<span slot="icon">
      </span>
    Build & test conversational prompts and embed them in your app.


</a>
[

<span slot="icon">
      </span>
    Use the Agents SDK to build, run, and observe agent workflows.

](https://developers.openai.com/api/docs/guides/agents)

## Analyze images and files

Send image URLs, uploaded files, or PDF documents directly to the model to extract text, classify content, or detect visual elements.



<div data-content-switcher-pane data-value="image-url">
    <div class="hidden">Image URL</div>
    </div>
  <div data-content-switcher-pane data-value="file-url" hidden>
    <div class="hidden">File URL</div>
    </div>
  <div data-content-switcher-pane data-value="file-upload" hidden>
    <div class="hidden">Upload file</div>
    </div>



[

<span slot="icon">
      </span>
    Learn to use image inputs to the model and extract meaning from images.

](https://developers.openai.com/api/docs/guides/images)

[

<span slot="icon">
      </span>
    Learn to use file inputs to the model and extract meaning from documents.

](https://developers.openai.com/api/docs/guides/file-inputs)

## Extend the model with tools

Give the model access to external data and functions by attaching [tools](https://developers.openai.com/api/docs/guides/tools). Use built-in tools like web search or file search, or define your own for calling APIs, running code, or integrating with third-party systems.



<div data-content-switcher-pane data-value="web-search">
    <div class="hidden">Web search</div>
    </div>
  <div data-content-switcher-pane data-value="file-search" hidden>
    <div class="hidden">File search</div>
    </div>
  <div data-content-switcher-pane data-value="code-interpreter" hidden>
    <div class="hidden">Code Interpreter</div>
    </div>
  <div data-content-switcher-pane data-value="function-calling" hidden>
    <div class="hidden">Function calling</div>
    </div>
  <div data-content-switcher-pane data-value="remote-mcp" hidden>
    <div class="hidden">Remote MCP</div>
    </div>



[

<span slot="icon">
      </span>
    Learn about powerful built-in tools like web search and file search.

](https://developers.openai.com/api/docs/guides/tools)

[

<span slot="icon">
      </span>
    Learn to enable the model to call your own custom code.

](https://developers.openai.com/api/docs/guides/function-calling)

## Stream responses and build realtime apps

Use server‑sent [streaming events](https://developers.openai.com/api/docs/guides/streaming-responses) to show results as they’re generated, or the [Realtime API](https://developers.openai.com/api/docs/guides/realtime) for interactive voice and multimodal apps.

[

<span slot="icon">
      </span>
    Use server-sent events to stream model responses to users fast.

](https://developers.openai.com/api/docs/guides/streaming-responses)

[

<span slot="icon">
      </span>
    Use WebRTC or WebSockets for super fast speech-to-speech AI apps.

](https://developers.openai.com/api/docs/guides/realtime)

## Build agents

Use the OpenAI platform to build [agents](https://developers.openai.com/api/docs/guides/agents) capable of taking action—like [controlling computers](https://developers.openai.com/api/docs/guides/tools-computer-use)—on behalf of your users. Use the [Agents SDK](https://developers.openai.com/api/docs/guides/agents) to create orchestration logic on the backend.

[

<span slot="icon">
      </span>
    Learn how to use the OpenAI platform to build powerful, capable AI agents.

](https://developers.openai.com/api/docs/guides/agents)
``````
:::
:::

