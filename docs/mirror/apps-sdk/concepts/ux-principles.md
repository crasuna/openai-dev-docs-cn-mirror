---
title: "UX 原则"
description: "Principles for building great ChatGPT apps."
outline: deep
---

# UX 原则

**文档集**：Apps SDK\
**分组**：概念\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/concepts/ux-principles](https://developers.openai.com/apps-sdk/concepts/ux-principles)
- Markdown 来源：[https://developers.openai.com/apps-sdk/concepts/ux-principles.md](https://developers.openai.com/apps-sdk/concepts/ux-principles.md)
- 抓取时间：2026-06-27T05:54:46.101Z
- Checksum：`a5c9cbcf2cc494e6b645411acbf97481ca7ab30a15e919284ce9c98ace79e0d0`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

创建出色的 ChatGPT 应用，关键在于提供一种聚焦、对话式、并且感觉原生于 ChatGPT 的体验。

目标是设计出一致且有用的体验，同时以真正有价值的方式扩展你在 ChatGPT 对话中可以完成的事情。

好的例子包括叫车、点餐、查询可用性或跟踪配送。这些任务具有对话性、有时间边界，并且很容易用带有明确 call to action 的视觉摘要来呈现。差的例子包括复制网站中的长篇内容、要求复杂的多步骤工作流，或把空间用于广告或无关消息。

请使用下面的 UX 原则指导你的开发。

## 出色应用 UX 的原则

一个应用至少应因为它存在于 ChatGPT 中而把某件事做得 _更好_：

- **Conversational leverage** - 自然语言、thread context 和多轮指导可以解锁传统 UI 无法实现的工作流。
- **Native fit** - 应用感觉嵌入在 ChatGPT 中，模型和你的工具之间可以顺畅交接。
- **Composability** - 动作是小型、可复用的构建块，模型可以把它们与其他应用组合起来完成更丰富的任务。

如果你无法清楚描述在 ChatGPT 中运行带来的明确收益，请在准备分发应用前继续迭代。

另一方面，你的应用还应通过提供新的信息、新的操作，或更好的信息呈现方式来 _改善 ChatGPT 中的用户体验_。

下面是一些你应遵循的原则，帮助确保你的应用非常适合 ChatGPT。

### 1. 提取，而不是移植

聚焦用户使用你产品时最核心的任务。不要镜像你的完整网站或原生应用，而是识别几个可以提取为工具的原子动作。每个工具都应只暴露模型自信推进下一步所需的最小输入和输出。

### 2. 为对话式入口设计

预期用户会带着具体任务、模糊意图，或在对话中途到达。
你的应用应支持：

- 开放式提示（例如 "Help me plan a team offsite"）。
- 直接命令（例如 "Book the conference room Thursday at 3pm"）。
- 首次使用 onboarding（教新用户如何通过 ChatGPT 参与）。

### 3. 为 ChatGPT 环境设计

ChatGPT 提供对话界面。请有选择地使用你的 UI 来澄清动作、采集输入或呈现结构化结果。跳过不会推进当前任务的装饰性组件，并依靠对话来承载相关历史、确认和后续跟进。

### 4. 为对话优化，而不是为导航优化

模型会处理状态管理和路由。你的应用提供：

- 明确、声明式、带有良好类型参数的动作。
- 让聊天继续向前推进的简洁响应（表格、列表或短段落，而不是 dashboards）。
- 有帮助的后续建议，让模型可以让用户保持在流程中。

### 5. 拥抱生态系统时刻

突出你的应用在 ChatGPT 中独有的价值：

- 接受丰富的自然语言，而不是表单字段。
- 利用从对话中提取的相关上下文进行个性化。
- （可选）在能节省用户时间或认知负担时，与其他应用组合。

## 发布前检查清单

在通过当前审核流程提交应用前，请回答这些 yes/no 问题。“no” 表示在更广泛分发前，你的应用还有改进机会。

不过请注意，我们会逐个评估每个应用，并且对所有这些问题回答 "yes" 并不保证你的应用会被选中分发：它只是帮助你的应用更适合 ChatGPT 的基线。

若要了解发布应用的严格要求，请参阅 [App Submission Guidelines](/mirror/apps-sdk/app-submission-guidelines)。

- **Conversational value** - 至少一项主要能力是否依赖 ChatGPT 的优势（自然语言、对话上下文、多轮对话）？
- **Beyond base ChatGPT** - 应用是否提供了用户没有它就无法获得的新知识、动作或呈现方式（例如专有数据、专门 UI 或引导流程）？
- **Atomic, model-friendly actions** - 工具是否不可再分、自包含，并且以显式输入和输出定义，使模型无需澄清问题即可调用？
- **Helpful UI only** - 如果把每个自定义 widget 都替换成纯文本，用户体验是否会明显变差？
- **End-to-end in-chat completion** - 用户能否不离开 ChatGPT、不来回切换外部标签页，就完成至少一个有意义的任务？
- **Performance & responsiveness** - 应用响应速度是否足以维持聊天节奏？
- **Discoverability** - 是否容易想象出模型会自信选择此应用的提示？
- **Platform fit** - 应用是否利用了核心平台行为（rich prompts、prior context、multi-tool composition、multimodality 或 memory）？

此外，请确保避免：

- 显示更适合网站或应用的 **长篇或静态内容**。
- 要求超出 inline 或 fullscreen display modes 的 **复杂多步骤工作流**。
- 把空间用于 **广告、追加销售或无关消息**。
- 在可能被他人看到的卡片中直接显示 **敏感或私密信息**。
- **重复 ChatGPT 的系统功能**（例如重新创建输入 composer）。

### 后续步骤

确认你的应用拥有出色 UX 后，你可以按照我们在 [UI guidelines](/mirror/apps-sdk/concepts/ui-guidelines) 中的建议打磨应用 UI。

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

Creating a great ChatGPT app is about delivering a focused, conversational experience that feels native to ChatGPT.

The goal is to design experiences that feel consistent and useful while extending what you can do in ChatGPT conversations in ways that add real value.

Good examples include booking a ride, ordering food, checking availability, or tracking a delivery. These are tasks that are conversational, time bound, and easy to summarize visually with a clear call to action. Poor examples include replicating long form content from a website, requiring complex multi step workflows, or using the space for ads or irrelevant messaging.

Use the UX principles below to guide your development.

## Principles for great app UX

An app should do at least one thing _better_ because it lives in ChatGPT:

- **Conversational leverage** – natural language, thread context, and multi-turn guidance unlock workflows that traditional UI cannot.
- **Native fit** – the app feels embedded in ChatGPT, with seamless hand-offs between the model and your tools.
- **Composability** – actions are small, reusable building blocks that the model can mix with other apps to complete richer tasks.

If you cannot describe the clear benefit of running inside ChatGPT, keep iterating before preparing your app for distribution.

On the other hand, your app should also _improve the user experience_ in ChatGPT by either providing something new to know, new to do, or a better way to show information.

Below are a few principles you should follow to help ensure your app is a great fit for ChatGPT.

### 1. Extract, don’t port

Focus on the core jobs users use your product for. Instead of mirroring your full website or native app, identify a few atomic actions that can be extracted as tools. Each tool should expose the minimum inputs and outputs needed for the model to take the next step confidently.

### 2. Design for conversational entry

Expect users to arrive mid-conversation, with a specific task in mind, or with fuzzy intent.
Your app should support:

- Open-ended prompts (e.g. "Help me plan a team offsite").
- Direct commands (e.g. "Book the conference room Thursday at 3pm").
- First-run onboarding (teach new users how to engage through ChatGPT).

### 3. Design for the ChatGPT environment

ChatGPT provides the conversational surface. Use your UI selectively to clarify actions, capture inputs, or present structured results. Skip ornamental components that do not advance the current task, and lean on the conversation for relevant history, confirmation, and follow-up.

### 4. Optimize for conversation, not navigation

The model handles state management and routing. Your app supplies:

- Clear, declarative actions with well-typed parameters.
- Concise responses that keep the chat moving (tables, lists, or short paragraphs instead of dashboards).
- Helpful follow-up suggestions so the model can keep the user in flow.

### 5. Embrace the ecosystem moment

Highlight what is unique about your app inside ChatGPT:

- Accept rich natural language instead of form fields.
- Personalize with relevant context gleaned from the conversation.
- (Optional) Compose with other apps when it saves the user time or cognitive load.

## Checklist before publishing

Answer these yes/no questions before you submit your app through the current review flow. A “no” signals an opportunity to improve your app before broader distribution.

However, please note that we will evaluate each app on a case-by-case basis, and that answering "yes" to all of these questions does not guarantee that your app will be selected for distribution: it's only a baseline to help your app be a great fit for ChatGPT.

To learn about strict requirements for publishing your app, see the [App Submission Guidelines](/mirror/apps-sdk/app-submission-guidelines).

- **Conversational value** – Does at least one primary capability rely on ChatGPT’s strengths (natural language, conversation context, multi-turn dialog)?
- **Beyond base ChatGPT** – Does the app provide new knowledge, actions, or presentation that users cannot achieve without it (e.g., proprietary data, specialized UI, or a guided flow)?
- **Atomic, model-friendly actions** – Are tools indivisible, self-contained, and defined with explicit inputs and outputs so the model can invoke them without clarifying questions?
- **Helpful UI only** – Would replacing every custom widget with plain text meaningfully degrade the user experience?
- **End-to-end in-chat completion** – Can users finish at least one meaningful task without leaving ChatGPT or juggling external tabs?
- **Performance & responsiveness** – Does the app respond quickly enough to maintain the rhythm of a chat?
- **Discoverability** – Is it easy to imagine prompts where the model would select this app confidently?
- **Platform fit** – Does the app take advantage of core platform behaviors (rich prompts, prior context, multi-tool composition, multimodality, or memory)?

Additionally, ensure that you avoid:

- Displaying **long-form or static content** better suited for a website or app.
- Requiring **complex multi-step workflows** that exceed the inline or fullscreen display modes.
- Using the space for **ads, upsells, or irrelevant messaging**.
- Surfacing **sensitive or private information** directly in a card where others might see it.
- **Duplicating ChatGPT’s system functions** (for example, recreating the input composer).

### Next steps

Once you have made sure your app has great UX, you can polish your app's UI by following our recommendations in the [UI guidelines](/mirror/apps-sdk/concepts/ui-guidelines).

:::
:::

