---
title: "Model optimization"
description: "Ensure quality model outputs with evals and fine-tuning in the OpenAI platform."
outline: deep
---

# Model optimization

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/model-optimization](https://developers.openai.com/api/docs/guides/model-optimization)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/model-optimization.md](https://developers.openai.com/api/docs/guides/model-optimization.md)
- 抓取时间：2026-06-27T05:54:03.738Z
- Checksum：`363add57854da99d1392bdd5475e07dcabde958b19176788a092014448c88d58`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
LLM 输出具有非确定性，模型行为也会在不同模型快照和系列之间变化。开发者必须持续衡量和调优 LLM 应用的性能，以确保获得最佳结果。本指南将介绍一些技术，以及你可以使用的 OpenAI 平台工具，用于确保模型输出高质量内容。

本指南涵盖正在迁移到 legacy documentation 的 evals 和 fine-tuning 工作流。请查看 [deprecations page](/mirror/api/docs/deprecations) 了解受影响平台界面的当前时间线。




## 模型优化工作流

优化模型输出需要结合 **evals**、**prompt engineering** 和 **fine-tuning**，形成一个反馈飞轮，为 fine-tuning 带来更好的 prompts 和更好的训练数据。优化过程通常类似下面这样。

1. 编写可衡量模型输出的 [evals](/mirror/api/docs/guides/evals)，建立性能和准确性的基线。
1. [Prompt the model](/mirror/api/docs/guides/text) 以获得输出，同时提供相关上下文数据和 instructions。
1. 对于某些用例，可能需要针对特定任务 [fine-tune](/mirror/api/docs/guides/model-optimization#fine-tune-a-model) 模型。
1. 使用代表真实世界输入的测试数据运行 evals。衡量你的 prompt 和 fine-tuned model 的性能。
1. 根据 eval feedback 调整你的 prompt 或 fine-tuning dataset。
1. 持续重复这个循环，以改进模型结果。

下面概览主要步骤，以及如何使用 OpenAI 平台完成这些步骤。

## 构建 evals

在 OpenAI 平台中，你可以通过 API 或在 [dashboard](https://platform.openai.com/evaluations) 中[构建并运行 evals](/mirror/api/docs/guides/evals)。你甚至可以考虑在开始编写 prompts 之前先编写 evals，采用类似行为驱动开发（BDD）的方法。

用你预期在生产环境中会看到的测试输入运行 evals。使用几种可用 [graders](/mirror/api/docs/guides/graders) 之一，对照你的测试数据集衡量 prompt 的结果。

[



    对你的模型输出运行测试，确保获得正确结果。

](https://developers.openai.com/api/docs/guides/evals)

## 编写有效 prompts

有了 evals 之后，你可以有效迭代 [prompts](/mirror/api/docs/guides/text)。对于你的用例，prompt engineering 过程可能已经足以获得出色结果。不同模型可能需要不同的 prompting techniques，但有几项最佳实践可以普遍应用，以获得更好结果。

- **包含相关上下文** - 在你的 instructions 中，包含模型生成回复时需要用到、但训练数据之外的文本或图像内容。这可能包括来自私有数据库的数据，或当前的实时信息。
- **提供清晰 instructions** - 你的 prompt 应包含清晰目标，说明你想要什么类型的输出。新工作请从 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) 开始，并使用 [reasoning model guidance](/mirror/api/docs/guides/reasoning) 调整 outcome-level instructions、reasoning effort 和 verbosity。
- **提供示例输出** - 给模型一些针对给定 prompt 的正确输出示例（这个过程称为 few-shot learning）。模型可以从这些示例外推出它应如何回应其他 prompts。

[



    学习为模型编写优质 prompts 的基础知识。

](https://developers.openai.com/api/docs/guides/text)

## Fine-tune 模型

OpenAI 正在逐步结束 fine-tuning 平台。该平台不再向新用户开放，但 fine-tuning 平台的现有用户在接下来数月内仍可创建训练任务。

  所有 fine-tuned models 都会继续可用于 inference，直到其 base models 被[弃用](/mirror/api/docs/deprecations)。完整时间线在[这里](/mirror/api/docs/deprecations)。

OpenAI 模型已经经过预训练，能够处理广泛的主题和任务。Fine-tuning 让你可以采用一个 OpenAI base model，提供你预期应用中会出现的输入和输出类型，并得到一个擅长你将使用任务的模型。

Fine-tuning 可能是一个耗时过程，但它也可以让模型稳定地以某种方式格式化回复，或处理新颖输入。你可以将 fine-tuning 与 [prompt engineering](/mirror/api/docs/guides/text) 结合使用，相比只做 prompting，还能获得更多收益：

- 你可以提供比单个请求 context window 所能容纳更多的示例输入和输出，让模型能够处理更广泛的 prompts。
- 你可以使用更短的 prompts，包含更少示例和上下文数据，这可以在规模化时节省 token 成本，并可能降低延迟。
- 你可以基于专有或敏感数据进行训练，而不必在每个请求中通过示例包含这些数据。
- 你可以训练一个更小、更便宜、更快的模型，让它擅长某个使用大型模型并不具备成本效益的特定任务。

请访问我们的 [pricing page](https://openai.com/api/pricing)，了解 fine-tuned model training 和 usage 的计费方式。

### Fine-tuning 方法

这些是当前 OpenAI 平台支持的 fine-tuning 方法。

### Fine-tuning 的工作方式

在 OpenAI 平台中，你可以在 [dashboard](https://platform.openai.com/finetune) 中或[通过 API](https://developers.openai.com/api/docs/api-reference/fine-tuning) 创建 fine-tuned models。fine-tuning 过程大致如下：

1. 收集一组示例数据集作为训练数据
1. 将该数据集以 JSONL 格式上传到 OpenAI
1. 根据你的目标，使用上述方法之一创建 fine-tuning job，这会开始 fine-tuning 训练过程
1. 在 RFT 的情况下，你还需要定义一个 grader 来为模型行为评分
1. 评估结果

从 [supervised fine-tuning](/mirror/api/docs/guides/supervised-fine-tuning)、[vision fine-tuning](/mirror/api/docs/guides/vision-fine-tuning)、[direct preference optimization](/mirror/api/docs/guides/direct-preference-optimization) 或 [reinforcement fine-tuning](/mirror/api/docs/guides/reinforcement-fine-tuning) 开始。

## 向专家学习

模型优化是一个复杂主题，有时更像艺术而非科学。请观看下面 OpenAI 团队成员关于模型优化技术的视频。




Cost/accuracy/latency
    &lt;iframe
      width="100%"
      height="400"
      src="https://www.youtube.com/embed/Bx6sUDRMx-8?si=i3Tl8qEjlCdOtyiU"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    &gt;&lt;/iframe&gt;


Distillation
    &lt;iframe
      width="100%"
      height="400"
      src="https://www.youtube.com/embed/CqWpJFK-hOo?si=7ztgDp1inte0vnw7"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    &gt;&lt;/iframe&gt;


Optimizing LLM Performance
    &lt;iframe
      width="100%"
      height="400"
      src="https://www.youtube-nocookie.com/embed/ahnGLM-RC1Y?si=cPQngClssVG_R2_q"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    &gt;&lt;/iframe&gt;


:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
LLM output is non-deterministic, and model behavior changes between model snapshots and families. Developers must constantly measure and tune the performance of LLM applications to ensure they're getting the best results. In this guide, we explore the techniques and OpenAI platform tools you can use to ensure high quality outputs from the model.

This guide covers evals and fine-tuning workflows that are being moved into
  legacy documentation. See the [deprecations page](https://developers.openai.com/api/docs/deprecations) for
  the current timelines for the affected platform surfaces.

<div className="my-4 w-full max-w-full overflow-hidden">
  </div>

## Model optimization workflow

Optimizing model output requires a combination of **evals**, **prompt engineering**, and **fine-tuning**, creating a flywheel of feedback that leads to better prompts and better training data for fine-tuning. The optimization process usually goes something like this.

1. Write [evals](https://developers.openai.com/api/docs/guides/evals) that measure model output, establishing a baseline for performance and accuracy.
1. [Prompt the model](https://developers.openai.com/api/docs/guides/text) for output, providing relevant context data and instructions.
1. For some use cases, it may be desirable to [fine-tune](#fine-tune-a-model) a model for a specific task.
1. Run evals using test data that is representative of real world inputs. Measure the performance of your prompt and fine-tuned model.
1. Tweak your prompt or fine-tuning dataset based on eval feedback.
1. Repeat the loop continuously to improve your model results.

Here's an overview of the major steps, and how to do them using the OpenAI platform.

## Build evals

In the OpenAI platform, you can [build and run evals](https://developers.openai.com/api/docs/guides/evals) either via API or in the [dashboard](https://platform.openai.com/evaluations). You might even consider writing evals _before_ you start writing prompts, taking an approach akin to behavior-driven development (BDD).

Run your evals against test inputs like you expect to see in production. Using one of several available [graders](https://developers.openai.com/api/docs/guides/graders), measure the results of a prompt against your test data set.

[

<span slot="icon">
      </span>
    Run tests on your model outputs to ensure you're getting the right results.

](https://developers.openai.com/api/docs/guides/evals)

## Write effective prompts

With evals in place, you can effectively iterate on [prompts](https://developers.openai.com/api/docs/guides/text). The prompt engineering process may be all you need in order to get great results for your use case. Different models may require different prompting techniques, but there are several best practices you can apply across the board to get better results.

- **Include relevant context** - in your instructions, include text or image content that the model will need to generate a response from outside its training data. This could include data from private databases or current, up-to-the-minute information.
- **Provide clear instructions** - your prompt should contain clear goals about what kind of output you want. Start with [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5) for new work, and use [reasoning model guidance](https://developers.openai.com/api/docs/guides/reasoning) to tune outcome-level instructions, reasoning effort, and verbosity.
- **Provide example outputs** - give the model a few examples of correct output for a given prompt (a process called few-shot learning). The model can extrapolate from these examples how it should respond for other prompts.

[

<span slot="icon">
      </span>
    Learn the basics of writing good prompts for the model.

](https://developers.openai.com/api/docs/guides/text)

## Fine-tune a model

OpenAI is winding down the fine-tuning platform. The platform is no longer
  accessible to new users, but existing users of the fine-tuning platform will
  be able to create training jobs for the coming months.
  <br />
  All fine-tuned models will remain available for inference until their base
  models are [deprecated](https://developers.openai.com/api/docs/deprecations). The full timeline is
  [here](https://developers.openai.com/api/docs/deprecations).

OpenAI models are already pre-trained to perform across a broad range of subjects and tasks. Fine-tuning lets you take an OpenAI base model, provide the kinds of inputs and outputs you expect in your application, and get a model that excels in the tasks you'll use it for.

Fine-tuning can be a time-consuming process, but it can also enable a model to consistently format responses in a certain way or handle novel inputs. You can use fine-tuning with [prompt engineering](https://developers.openai.com/api/docs/guides/text) to realize a few more benefits over prompting alone:

- You can provide more example inputs and outputs than could fit within the context window of a single request, enabling the model handle a wider variety of prompts.
- You can use shorter prompts with fewer examples and context data, which saves on token costs at scale and can be lower latency.
- You can train on proprietary or sensitive data without having to include it via examples in every request.
- You can train a smaller, cheaper, faster model to excel at a particular task where a larger model is not cost-effective.

Visit our [pricing page](https://openai.com/api/pricing) to learn more about how fine-tuned model training and usage are billed.

### Fine-tuning methods

These are the fine-tuning methods supported in the OpenAI platform today.

### How fine-tuning works

In the OpenAI platform, you can create fine-tuned models either in the [dashboard](https://platform.openai.com/finetune) or [with the API](https://developers.openai.com/api/docs/api-reference/fine-tuning). This is the general shape of the fine-tuning process:

1. Collect a dataset of examples to use as training data
1. Upload that dataset to OpenAI, formatted in JSONL
1. Create a fine-tuning job using one of the methods above, depending on your goals—this begins the fine-tuning training process
1. In the case of RFT, you'll also define a grader to score the model's behavior
1. Evaluate the results

Get started with [supervised fine-tuning](https://developers.openai.com/api/docs/guides/supervised-fine-tuning), [vision fine-tuning](https://developers.openai.com/api/docs/guides/vision-fine-tuning), [direct preference optimization](https://developers.openai.com/api/docs/guides/direct-preference-optimization), or [reinforcement fine-tuning](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning).

## Learn from experts

Model optimization is a complex topic, and sometimes more art than science. Check out the videos below from members of the OpenAI team on model optimization techniques.



<div data-content-switcher-pane data-value="cost">
    <div class="hidden">Cost/accuracy/latency</div>
    <iframe
      width="100%"
      height="400"
      src="https://www.youtube.com/embed/Bx6sUDRMx-8?si=i3Tl8qEjlCdOtyiU"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    ></iframe>
  </div>
  <div data-content-switcher-pane data-value="distillation" hidden>
    <div class="hidden">Distillation</div>
    <iframe
      width="100%"
      height="400"
      src="https://www.youtube.com/embed/CqWpJFK-hOo?si=7ztgDp1inte0vnw7"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    ></iframe>
  </div>
  <div data-content-switcher-pane data-value="techniques" hidden>
    <div class="hidden">Optimizing LLM Performance</div>
    <iframe
      width="100%"
      height="400"
      src="https://www.youtube-nocookie.com/embed/ahnGLM-RC1Y?si=cPQngClssVG_R2_q"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    ></iframe>
  </div>
``````
:::
:::

