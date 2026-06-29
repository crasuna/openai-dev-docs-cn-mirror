---
title: "SDKs 和 CLI"
description: "Discover official OpenAI SDKs, the OpenAI CLI, and the Agents SDK."
outline: deep
---

# SDKs 和 CLI

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/libraries](https://developers.openai.com/api/docs/libraries)
- Markdown 来源：[https://developers.openai.com/api/docs/libraries.md](https://developers.openai.com/api/docs/libraries.md)
- 抓取时间：2026-06-27T05:54:13.060Z
- Checksum：`27311421ed56ca1040795b96de845e51535dd27f134fbbaf4e9bfb390cc75647`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
本页介绍使用 [OpenAI API](https://developers.openai.com/api/docs/api-reference) 构建的主要方式：用于应用代码的官方 SDKs、适合 shell-native workflows 的 OpenAI CLI、用于编排的 Agents SDK，或你自己偏好的 HTTP client。

## 创建并导出 API key

开始之前，请[在 dashboard 中创建 API key](https://platform.openai.com/api-keys)，你将使用它来安全地[访问 API](https://developers.openai.com/api/docs/api-reference/authentication)。将 key 存放在安全位置，例如 [`.zshrc` 文件](https://www.freecodecamp.org/news/how-do-zsh-configuration-files-work/)或你电脑上的另一个文本文件。生成 API key 后，请在终端中将其导出为[环境变量](https://en.wikipedia.org/wiki/Environment_variable)。




macOS / Linux
    在 macOS 或 Linux 系统上导出环境变量

```bash
export OPENAI_API_KEY="your_api_key_here"
```



Windows
    在 PowerShell 中导出环境变量

```bash
setx OPENAI_API_KEY "your_api_key_here"
```





OpenAI SDKs 会被配置为自动从系统环境中读取你的 API key。

## 安装官方 SDK




JavaScript


Python


.NET


Java


Go


Ruby


CLI




## 使用 Agents SDK

对于直接 API 请求，请使用上面的官方 OpenAI SDKs。当你的应用需要面向代码优先的 agents、tools、handoffs、guardrails、tracing 或 sandbox execution 编排时，请使用 Agents SDK。


  



    使用 Agents SDK 构建你的第一个 agent。




- [OpenAI Agents SDK for TypeScript](https://github.com/openai/openai-agents-js)
- [OpenAI Agents SDK for Python](https://github.com/openai/openai-agents-python)

## Azure OpenAI libraries

Microsoft 的 Azure 团队维护了一些同时兼容 OpenAI API 和 Azure OpenAI services 的 libraries。阅读下面的 library 文档，了解如何将它们与 OpenAI API 一起使用。

- [Azure OpenAI client library for .NET](https://github.com/Azure/azure-sdk-for-net/tree/main/sdk/openai/Azure.AI.OpenAI)
- [Azure OpenAI client library for JavaScript](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/openai/openai)
- [Azure OpenAI client library for Java](https://github.com/Azure/azure-sdk-for-java/tree/main/sdk/openai/azure-ai-openai)
- [Azure OpenAI client library for Go](https://github.com/Azure/azure-sdk-for-go/tree/main/sdk/ai/azopenai)

---

## Community libraries

下面的 libraries 由更广泛的开发者社区构建和维护。你也可以 [watch 我们在 GitHub 上的 OpenAPI specification](https://github.com/openai/openai-openapi) 仓库，以便在我们更改 API 时及时获得更新。

请注意，OpenAI 不验证这些项目的正确性或安全性。**请自行承担使用风险！**

### Clojure

- [openai-clojure](https://github.com/wkok/openai-clojure) by [wkok](https://github.com/wkok)

### Dart/Flutter

- [openai](https://github.com/anasfik/openai) by [anasfik](https://github.com/anasfik)

### Delphi

- [DelphiOpenAI](https://github.com/HemulGM/DelphiOpenAI) by [HemulGM](https://github.com/HemulGM)

### Elixir

- [openai.ex](https://github.com/mgallo/openai.ex) by [mgallo](https://github.com/mgallo)

### Kotlin

- [openai-kotlin](https://github.com/Aallam/openai-kotlin) by [Mouaad Aallam](https://github.com/Aallam)

### PHP

- [orhanerday/open-ai](https://packagist.org/packages/orhanerday/open-ai) by [orhanerday](https://github.com/orhanerday)
- [openai-php client](https://github.com/openai-php/client) by [openai-php](https://github.com/openai-php)

### Rust

- [async-openai](https://github.com/64bit/async-openai) by [64bit](https://github.com/64bit)

### Scala

- [openai-scala-client](https://github.com/cequence-io/openai-scala-client) by [cequence-io](https://github.com/cequence-io)

### Swift

- [AIProxySwift](https://github.com/lzell/AIProxySwift) by [Lou Zell](https://github.com/lzell)
- [OpenAIKit](https://github.com/dylanshine/openai-kit) by [dylanshine](https://github.com/dylanshine)
- [OpenAI](https://github.com/MacPaw/OpenAI/) by [MacPaw](https://github.com/MacPaw)

### Unity

- [com.openai.unity](https://github.com/RageAgainstThePixel/com.openai.unity) by [RageAgainstThePixel](https://github.com/RageAgainstThePixel)

### Unreal Engine

- [OpenAI-Api-Unreal](https://github.com/KellanM/OpenAI-Api-Unreal) by [KellanM](https://github.com/KellanM)

## 其他 OpenAI repositories

- [tiktoken](https://github.com/openai/tiktoken) - 计算 tokens
- [simple-evals](https://github.com/openai/simple-evals) - 简单评估 library
- [mle-bench](https://github.com/openai/mle-bench) - 用于评估 machine learning engineer agents 的 library
- [gym](https://github.com/openai/gym) - reinforcement learning library
- [swarm](https://github.com/openai/swarm) - 教育性 orchestration repository

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
This page covers the main ways to build with the [OpenAI API](https://developers.openai.com/api/docs/api-reference): official SDKs for application code, the OpenAI CLI for shell-native workflows, the Agents SDK for orchestration, or your own preferred HTTP client.

## Create and export an API key

Before you begin, [create an API key in the dashboard](https://platform.openai.com/api-keys), which you'll use to securely [access the API](https://developers.openai.com/api/docs/api-reference/authentication). Store the key in a safe location, like a [`.zshrc` file](https://www.freecodecamp.org/news/how-do-zsh-configuration-files-work/) or another text file on your computer. Once you've generated an API key, export it as an [environment variable](https://en.wikipedia.org/wiki/Environment_variable) in your terminal.



<div data-content-switcher-pane data-value="macOS">
    <div class="hidden">macOS / Linux</div>
    Export an environment variable on macOS or Linux systems

```bash
export OPENAI_API_KEY="your_api_key_here"
```

  </div>
  <div data-content-switcher-pane data-value="windows" hidden>
    <div class="hidden">Windows</div>
    Export an environment variable in PowerShell

```bash
setx OPENAI_API_KEY "your_api_key_here"
```

  </div>



OpenAI SDKs are configured to automatically read your API key from the system environment.

## Install an official SDK



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
  <div data-content-switcher-pane data-value="ruby" hidden>
    <div class="hidden">Ruby</div>
    </div>
  <div data-content-switcher-pane data-value="cli" hidden>
    <div class="hidden">CLI</div>
    </div>



## Use the Agents SDK

Use the official OpenAI SDKs above for direct API requests. Use the Agents SDK
when your application needs code-first orchestration for agents, tools,
handoffs, guardrails, tracing, or sandbox execution.

<a href="/api/docs/guides/agents/quickstart">
  

<span slot="icon">
      </span>
    Build your first agent with the Agents SDK.


</a>

- [OpenAI Agents SDK for TypeScript](https://github.com/openai/openai-agents-js)
- [OpenAI Agents SDK for Python](https://github.com/openai/openai-agents-python)

## Azure OpenAI libraries

Microsoft's Azure team maintains libraries that are compatible with both the OpenAI API and Azure OpenAI services. Read the library documentation below to learn how you can use them with the OpenAI API.

- [Azure OpenAI client library for .NET](https://github.com/Azure/azure-sdk-for-net/tree/main/sdk/openai/Azure.AI.OpenAI)
- [Azure OpenAI client library for JavaScript](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/openai/openai)
- [Azure OpenAI client library for Java](https://github.com/Azure/azure-sdk-for-java/tree/main/sdk/openai/azure-ai-openai)
- [Azure OpenAI client library for Go](https://github.com/Azure/azure-sdk-for-go/tree/main/sdk/ai/azopenai)

---

## Community libraries

The libraries below are built and maintained by the broader developer community. You can also [watch our OpenAPI specification](https://github.com/openai/openai-openapi) repository on GitHub to get timely updates on when we make changes to our API.

Please note that OpenAI does not verify the correctness or security of these projects. **Use them at your own risk!**

### Clojure

- [openai-clojure](https://github.com/wkok/openai-clojure) by [wkok](https://github.com/wkok)

### Dart/Flutter

- [openai](https://github.com/anasfik/openai) by [anasfik](https://github.com/anasfik)

### Delphi

- [DelphiOpenAI](https://github.com/HemulGM/DelphiOpenAI) by [HemulGM](https://github.com/HemulGM)

### Elixir

- [openai.ex](https://github.com/mgallo/openai.ex) by [mgallo](https://github.com/mgallo)

### Kotlin

- [openai-kotlin](https://github.com/Aallam/openai-kotlin) by [Mouaad Aallam](https://github.com/Aallam)

### PHP

- [orhanerday/open-ai](https://packagist.org/packages/orhanerday/open-ai) by [orhanerday](https://github.com/orhanerday)
- [openai-php client](https://github.com/openai-php/client) by [openai-php](https://github.com/openai-php)

### Rust

- [async-openai](https://github.com/64bit/async-openai) by [64bit](https://github.com/64bit)

### Scala

- [openai-scala-client](https://github.com/cequence-io/openai-scala-client) by [cequence-io](https://github.com/cequence-io)

### Swift

- [AIProxySwift](https://github.com/lzell/AIProxySwift) by [Lou Zell](https://github.com/lzell)
- [OpenAIKit](https://github.com/dylanshine/openai-kit) by [dylanshine](https://github.com/dylanshine)
- [OpenAI](https://github.com/MacPaw/OpenAI/) by [MacPaw](https://github.com/MacPaw)

### Unity

- [com.openai.unity](https://github.com/RageAgainstThePixel/com.openai.unity) by [RageAgainstThePixel](https://github.com/RageAgainstThePixel)

### Unreal Engine

- [OpenAI-Api-Unreal](https://github.com/KellanM/OpenAI-Api-Unreal) by [KellanM](https://github.com/KellanM)

## Other OpenAI repositories

- [tiktoken](https://github.com/openai/tiktoken) - counting tokens
- [simple-evals](https://github.com/openai/simple-evals) - simple evaluation library
- [mle-bench](https://github.com/openai/mle-bench) - library to evaluate machine learning engineer agents
- [gym](https://github.com/openai/gym) - reinforcement learning library
- [swarm](https://github.com/openai/swarm) - educational orchestration repository
``````
:::
:::

