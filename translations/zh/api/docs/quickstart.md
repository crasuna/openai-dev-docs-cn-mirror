---
status: needs-review
sourceId: "7816cc1ae762"
sourceChecksum: "7816cc1ae7620265596a7e9791a7aa44ac66a6b27cadf2fecab39c18992ed775"
sourceUrl: "https://developers.openai.com/api/docs/quickstart"
translatedAt: "2026-06-27T09:29:03.914Z"
translator: codex-gpt-5.5-xhigh
---

# 开发者快速入门

OpenAI API 提供了一个简单接口，可使用先进 AI [模型](https://developers.openai.com/api/docs/models)进行文本生成、自然语言处理、计算机视觉等任务。先创建 API Key 并运行你的第一次 API 调用，即可开始使用。探索如何生成文本、分析图像、构建 agents，以及更多能力。

## 创建并导出 API key



StatsigClient.logEvent("quickstart_create_api_key_click", null, null)
  }
>
  创建 API Key


<p></p>
开始之前，请先在 dashboard 中创建一个 API key，你将使用它来安全地[访问 API](https://developers.openai.com/api/docs/api-reference/authentication)。请把该 key 存放在安全位置，例如 [`.zshrc`
文件](https://www.freecodecamp.org/news/how-do-zsh-configuration-files-work/)或你电脑上的另一个文本文件。生成 API key 后，请在终端中将它导出为[环境变量](https://en.wikipedia.org/wiki/Environment_variable)。



<div data-content-switcher-pane data-value="macOS">
    <div class="hidden">macOS / Linux</div>
    </div>
  <div data-content-switcher-pane data-value="windows" hidden>
    <div class="hidden">Windows</div>
    </div>



OpenAI SDK 会被配置为自动从系统环境读取你的 API key。

## 安装 OpenAI SDK 并运行一次 API 调用



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
    开始使用 Responses API 构建。


</a>

[

<span slot="icon">
      </span>
    进一步了解 prompting、message roles，以及如何构建对话式应用。

](https://developers.openai.com/api/docs/guides/text)

## 添加额度以继续构建



StatsigClient.logEvent("quickstart_add_credits_billing_click", null, null)
  }
>
  前往 billing


{/* prettier-ignore */}
<div className="mt-2">恭喜你运行了一个免费的测试 API 请求！开始使用更高的限制构建真实应用，并使用<a href="/api/docs/models" target="_blank">我们的模型</a>生成文本、音频、图像、视频等内容。</div>

<div className="mt-2">
  探索旨在帮助你更快发布的工具和文档：
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
    构建并测试对话式 prompts，然后将它们嵌入你的应用。


</a>
[

<span slot="icon">
      </span>
    使用 Agents SDK 构建、运行并观察 agent 工作流。

](https://developers.openai.com/api/docs/guides/agents)

## 分析图像和文件

将图像 URL、上传的文件或 PDF 文档直接发送给模型，以提取文本、分类内容或检测视觉元素。



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
    学习如何使用图像输入，并从图像中提取含义。

](https://developers.openai.com/api/docs/guides/images)

[

<span slot="icon">
      </span>
    学习如何使用文件输入，并从文档中提取含义。

](https://developers.openai.com/api/docs/guides/file-inputs)

## 使用工具扩展模型

通过附加[工具](https://developers.openai.com/api/docs/guides/tools)，让模型访问外部数据和函数。使用 web search 或 file search 等内置工具，或定义你自己的工具，用于调用 API、运行代码，或与第三方系统集成。



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
    了解 web search 和 file search 等强大的内置工具。

](https://developers.openai.com/api/docs/guides/tools)

[

<span slot="icon">
      </span>
    学习如何让模型调用你自己的自定义代码。

](https://developers.openai.com/api/docs/guides/function-calling)

## 流式传输响应并构建 realtime 应用

使用 server-sent [streaming events](https://developers.openai.com/api/docs/guides/streaming-responses) 在结果生成时展示结果，或使用 [Realtime API](https://developers.openai.com/api/docs/guides/realtime) 构建交互式语音和多模态应用。

[

<span slot="icon">
      </span>
    使用 server-sent events，快速向用户流式传输模型响应。

](https://developers.openai.com/api/docs/guides/streaming-responses)

[

<span slot="icon">
      </span>
    使用 WebRTC 或 WebSockets 构建超高速语音到语音 AI 应用。

](https://developers.openai.com/api/docs/guides/realtime)

## 构建 agents

使用 OpenAI platform 构建能够代表用户采取行动的 [agents](https://developers.openai.com/api/docs/guides/agents)，例如[控制计算机](https://developers.openai.com/api/docs/guides/tools-computer-use)。使用 [Agents SDK](https://developers.openai.com/api/docs/guides/agents) 在后端创建编排逻辑。

[

<span slot="icon">
      </span>
    学习如何使用 OpenAI platform 构建强大、有能力的 AI agents。

](https://developers.openai.com/api/docs/guides/agents)
