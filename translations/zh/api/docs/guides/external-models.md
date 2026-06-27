---
status: needs-review
sourceId: "fc1fe6d34aa3"
sourceChecksum: "fc1fe6d34aa3e745400199d6deae85c3a9960e9a5a463e52dec55645e7d27eb7"
sourceUrl: "https://developers.openai.com/api/docs/guides/external-models"
translatedAt: "2026-06-27T17:29:03.6672446+08:00"
translator: codex-gpt-5.5-xhigh
---

# 评估 external model

模型选择是一个重要杠杆，可帮助开发者改进 AI 应用。在 OpenAI Platform 上使用 Evaluations 时，除了评估 OpenAI 的原生模型，你还可以评估多种 external model。

我们支持访问 **third-party models**（无需 API key）以及访问 **custom endpoints**（需要 API key）。

OpenAI 正在弃用 Evals platform。现有 evals 内容会在过渡窗口期间继续可用。对于现有用户，Evals 将在 2026 年 10 月 31 日变为只读，并计划在 2026 年 11 月 30 日关闭该平台。有关当前时间线，请参阅 [deprecations page](https://developers.openai.com/api/docs/deprecations#2026-06-03-evals-platform)。

## Third-party models

若要使用 third-party models，必须满足以下条件：

- 你的 OpenAI organization 必须位于 [usage tier 1](https://developers.openai.com/api/docs/guides/rate-limits/usage-tiers#usage-tiers) 或更高级别。
- 你的 OpenAI organization 的 admin 必须通过 [Settings > Organization > General](https://platform.openai.com/settings/organization/general) 启用此功能。要启用该功能，admin 必须接受显示的使用免责声明。

对 external model 发起的调用会把数据传递给第三方，并且相比对 OpenAI 模型的调用，适用不同条款且安全保证较弱。

### 计费和使用限制

OpenAI 目前承担 third-party models 的推理成本，但会根据你的 organization usage tier 受到以下月度限制。

| Usage tier | 月度支出限制（USD） |
| ---------- | ------------------- |
| Tier 1     | $5                  |
| Tier 2     | $25                 |
| Tier 3     | $50                 |
| Tier 4     | $100                |
| Tier 5     | $200                |

我们通过合作伙伴 OpenRouter 提供这些模型。未来，third-party models 将按 [OpenRouter list prices](https://openrouter.ai/models) 作为你常规 OpenAI billing cycle 的一部分收费。

### 可用的 third-party models

我们提供对以下 external model provider 的访问：

- Google
- Anthropic（托管在 AWS Bedrock 上）
- Together
- Fireworks

## Custom endpoints

你可以配置一个完全自定义的模型 endpoint，并在 OpenAI Platform 上针对它运行 evals。这通常适用于我们未原生支持的 provider、你自己托管的模型，或你用于发起推理调用的自定义代理。

若要使用此功能，你的 OpenAI organization 的 admin 必须通过 [Settings > Organization > General](https://platform.openai.com/settings/organization/general) 启用 “Enable custom providers for evaluations” 设置。要启用该功能，admin 必须接受显示的使用免责声明。请注意，对 external model 发起的调用会把数据传递给第三方，并且相比对 OpenAI 模型的调用，适用不同条款且安全保证较弱。

具备使用 custom provider 的资格后，你可以在 [Settings](https://platform.openai.com/settings/) 下的 **Evaluations** 选项卡中设置 provider。请注意，custom provider 按 project 配置。要连接你的 custom endpoint，你将需要：

- 与 [OpenAI’s chat completions endpoint](https://developers.openai.com/api/docs/api-reference/chat/create) 兼容的 endpoint
- 一个 API key

为你的 endpoint 命名，提供 endpoint URL，并指定你的 API key。我们要求你使用 `https://` endpoint，并且会加密你的 key 以保障安全。指定你希望评估的任何 model name（slug）。你可以点击 **Verify** 按钮，确保模型设置正确。这会向你的每个 model slug 发起一次包含最小输入的测试调用，并指出任何失败。

## 使用 external model 运行 evals

配置好 external model 后，你可以在 [dataset](https://platform.openai.com/evaluation) 或 [evaluation](https://platform.openai.com/evaluation?tab=evals) 的 model picker 中选择它，用于 evals。请注意，目前不支持 tool call。

| 模型类型    |           Datasets            |             Evals             |
| ----------- | :---------------------------: | :---------------------------: |
| Third-party | | |
| Custom      |                               | |

## 后续步骤

如需更多灵感，请访问 [OpenAI Cookbook](https://developers.openai.com/cookbook)，其中包含示例代码以及指向第三方资源的链接；你也可以进一步了解我们的 evals 工具：

<a
  href="/api/docs/guides/evaluation-getting-started"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    使用 Datasets 快速构建 evals 并迭代 prompt。


</a>

<a href="/api/docs/guides/evals" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    针对 external model 进行评估，通过 API 与 evals 交互，以及更多能力。


</a>
