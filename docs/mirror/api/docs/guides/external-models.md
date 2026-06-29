---
title: "评估 external model"
description: "Learn how to run evals on non-OpenAI models, using the OpenAI platform."
outline: deep
---

# 评估 external model

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/external-models](https://developers.openai.com/api/docs/guides/external-models)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/external-models.md](https://developers.openai.com/api/docs/guides/external-models.md)
- 抓取时间：2026-06-27T05:54:02.050Z
- Checksum：`fc1fe6d34aa3e745400199d6deae85c3a9960e9a5a463e52dec55645e7d27eb7`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
模型选择是一个重要杠杆，可帮助开发者改进 AI 应用。在 OpenAI Platform 上使用 Evaluations 时，除了评估 OpenAI 的原生模型，你还可以评估多种 external model。

我们支持访问 **third-party models**（无需 API key）以及访问 **custom endpoints**（需要 API key）。

OpenAI 正在弃用 Evals platform。现有 evals 内容会在过渡窗口期间继续可用。对于现有用户，Evals 将在 2026 年 10 月 31 日变为只读，并计划在 2026 年 11 月 30 日关闭该平台。有关当前时间线，请参阅 [deprecations page](/mirror/api/docs/deprecations#2026-06-03-evals-platform)。

## Third-party models

若要使用 third-party models，必须满足以下条件：

- 你的 OpenAI organization 必须位于 [usage tier 1](https://developers.openai.com/api/docs/guides/rate-limits/usage-tiers#usage-tiers) 或更高级别。
- 你的 OpenAI organization 的 admin 必须通过 [Settings &gt; Organization &gt; General](https://platform.openai.com/settings/organization/general) 启用此功能。要启用该功能，admin 必须接受显示的使用免责声明。

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

若要使用此功能，你的 OpenAI organization 的 admin 必须通过 [Settings &gt; Organization &gt; General](https://platform.openai.com/settings/organization/general) 启用 “Enable custom providers for evaluations” 设置。要启用该功能，admin 必须接受显示的使用免责声明。请注意，对 external model 发起的调用会把数据传递给第三方，并且相比对 OpenAI 模型的调用，适用不同条款且安全保证较弱。

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

&lt;a
  href="/api/docs/guides/evaluation-getting-started"
  target="_blank"
  rel="noreferrer"
&gt;
  



    使用 Datasets 快速构建 evals 并迭代 prompt。





  



    针对 external model 进行评估，通过 API 与 evals 交互，以及更多能力。




:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Model selection is an important lever that enables builders to improve their AI applications. When using Evaluations on the OpenAI Platform, in addition to evaluating OpenAI’s native models, you can also evaluate a variety of external models.

We support accessing **third-party models** (no API key required) and accessing **custom endpoints** (API key required).

OpenAI is deprecating the Evals platform. Existing evals content remains
  available during the transition window. Evals will become read-only for
  existing users on October 31, 2026, and the platform is scheduled to shut down
  on November 30, 2026. See the [deprecations
  page](https://developers.openai.com/api/docs/deprecations#2026-06-03-evals-platform) for the current
  timeline.

## Third-party models

In order to use third-party models, the following must be true:

- Your OpenAI organization must be in [usage tier 1](https://developers.openai.com/api/docs/guides/rate-limits/usage-tiers#usage-tiers) or higher.
- An admin for your OpenAI organization must enable this feature via [Settings > Organization > General](https://platform.openai.com/settings/organization/general). To enable this feature, the admin must accept the usage disclaimer shown.

Calls made to external models pass data to third parties and are subject to
  different terms and weaker safety guarantees than calls to OpenAI models.

### Billing and usage limits

OpenAI currently covers inference costs on third-party models, subject to the following monthly limit based on your organization’s usage tier.

| Usage tier | Monthly spend limit (USD) |
| ---------- | ------------------------- |
| Tier 1     | $5                        |
| Tier 2     | $25                       |
| Tier 3     | $50                       |
| Tier 4     | $100                      |
| Tier 5     | $200                      |

We serve these models via our partner, OpenRouter. In the future, third-party models will be charged as part of your regular OpenAI billing cycle, at [OpenRouter list prices](https://openrouter.ai/models).

### Available third-party models

We provide access to the following external model providers:

- Google
- Anthropic (hosted on AWS Bedrock)
- Together
- Fireworks

## Custom endpoints

You can configure a fully custom model endpoint and run evals against it on the OpenAI Platform. This is typically a provider whom we do not natively support, a model you host yourself, or a custom proxy that you use for making inference calls.

In order to use this feature, an admin for your OpenAI organization must enable the “Enable custom providers for evaluations” setting via [Settings > Organization > General](https://platform.openai.com/settings/organization/general). To enable this feature, the admin must accept the usage disclaimer shown. Note that calls made to external models pass data to third parties, and are subject to different terms and weaker safety guarantees than calls to OpenAI models.

Once you are eligible to use custom providers, you can set up a provider under the **Evaluations** tab under [Settings](https://platform.openai.com/settings/). Note that custom providers are configured on a per-project basis. To connect your custom endpoint, you will need:

- An endpoint compatible with [OpenAI’s chat completions endpoint](https://developers.openai.com/api/docs/api-reference/chat/create)
- An API key

Name your endpoint, provide an endpoint URL, and specify your API key. We require that you use an `https://` endpoint, and we encrypt your keys for security. Specify any model names (slugs) you wish to evaluate. You can click the **Verify** button to ensure that your models are set up correctly. This will make a test call containing minimal input to each of your model slugs, and will indicate any failures.

## Run evals with external models

Once you have configured an external model, you can use it for evals on the by selecting it from the model picker in your [dataset](https://platform.openai.com/evaluation) or your [evaluation](https://platform.openai.com/evaluation?tab=evals). Note that tool calls are currently not supported.

| Model type  |           Datasets            |             Evals             |
| ----------- | :---------------------------: | :---------------------------: |
| Third-party | | |
| Custom      |                               | |

## Next steps

For more inspiration, visit the [OpenAI Cookbook](https://developers.openai.com/cookbook), which contains example code and links to third-party resources, or learn more about our tools for evals:

<a
  href="/api/docs/guides/evaluation-getting-started"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Uses Datasets to quickly build evals and iterate on prompts.


</a>

<a href="/api/docs/guides/evals" target="_blank" rel="noreferrer">
  

<span slot="icon">
      </span>
    Evaluate against external models, interact with evals via API, and more.


</a>
``````
:::
:::

