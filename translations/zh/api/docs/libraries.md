---
status: needs-review
sourceId: "27311421ed56"
sourceChecksum: "27311421ed56ca1040795b96de845e51535dd27f134fbbaf4e9bfb390cc75647"
sourceUrl: "https://developers.openai.com/api/docs/libraries"
translatedAt: "2026-06-27T18:24:42.5859087+08:00"
translator: codex-gpt-5.5-xhigh
---

# SDKs 和 CLI

本页介绍使用 [OpenAI API](https://developers.openai.com/api/docs/api-reference) 构建的主要方式：用于应用代码的官方 SDKs、适合 shell-native workflows 的 OpenAI CLI、用于编排的 Agents SDK，或你自己偏好的 HTTP client。

## 创建并导出 API key

开始之前，请[在 dashboard 中创建 API key](https://platform.openai.com/api-keys)，你将使用它来安全地[访问 API](https://developers.openai.com/api/docs/api-reference/authentication)。将 key 存放在安全位置，例如 [`.zshrc` 文件](https://www.freecodecamp.org/news/how-do-zsh-configuration-files-work/)或你电脑上的另一个文本文件。生成 API key 后，请在终端中将其导出为[环境变量](https://en.wikipedia.org/wiki/Environment_variable)。



<div data-content-switcher-pane data-value="macOS">
    <div class="hidden">macOS / Linux</div>
    在 macOS 或 Linux 系统上导出环境变量

```bash
export OPENAI_API_KEY="your_api_key_here"
```

  </div>
  <div data-content-switcher-pane data-value="windows" hidden>
    <div class="hidden">Windows</div>
    在 PowerShell 中导出环境变量

```bash
setx OPENAI_API_KEY "your_api_key_here"
```

  </div>



OpenAI SDKs 会被配置为自动从系统环境中读取你的 API key。

## 安装官方 SDK



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



## 使用 Agents SDK

对于直接 API 请求，请使用上面的官方 OpenAI SDKs。当你的应用需要面向代码优先的 agents、tools、handoffs、guardrails、tracing 或 sandbox execution 编排时，请使用 Agents SDK。

<a href="/api/docs/guides/agents/quickstart">
  

<span slot="icon">
      </span>
    使用 Agents SDK 构建你的第一个 agent。


</a>

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
