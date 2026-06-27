---
title: "GPT Actions library"
description: "Learn how to build and integrate GPT Actions for common applications using OpenAI's guidance."
outline: deep
---

# GPT Actions library

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/actions/actions-library](https://developers.openai.com/api/docs/actions/actions-library)
- Markdown 来源：[https://developers.openai.com/api/docs/actions/actions-library.md](https://developers.openai.com/api/docs/actions/actions-library.md)
- 抓取时间：2026-06-27T05:53:55.257Z
- Checksum：`a7b7350182cd4d0452d5e285cb9cdfd7199b602cb82d905d9c2ccd0e20a86faf`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 目的

虽然对 API 开发者来说，设置 GPT Actions 通常比从零开始使用这些 API 构建完整应用要少很多工作，但让 GPT Actions 正常运行仍然需要一些设置。GPT Actions library 旨在为围绕常见应用构建 GPT Actions 提供指导。

## 入门

如果你以前从未构建过 action，请先阅读[入门指南](/mirror/api/docs/actions/getting-started)，以便更好地了解 actions 的工作方式。

一般来说，本指南面向熟悉并能自如调用 API 的人。需要调试帮助时，可以尝试向 ChatGPT 说明你的问题，并附上截图。

## 如何访问

[OpenAI Cookbook](https://developers.openai.com/cookbook) 提供了第三方应用和中间件应用的[目录](https://developers.openai.com/cookbook/topic/chatgpt)。

### 第三方 Actions cookbook

GPT Actions 可以直接与 HTTP 服务集成。直接利用 SaaS API 的 GPT Actions 会直接向 SaaS 提供方认证并请求资源，例如 [Google Drive](https://developers.openai.com/cookbook/examples/chatgpt/gpt_actions_library/gpt_action_google_drive) 或 [Snowflake](https://developers.openai.com/cookbook/examples/chatgpt/gpt_actions_library/gpt_action_snowflake_direct)。

### Middleware Actions cookbook

GPT Actions 可以受益于中间件。中间件允许进行预处理、数据格式化、数据过滤，甚至连接到未通过 HTTP 暴露的端点（例如数据库）。已有多个 middleware cookbooks 描述示例实现路径，例如 [Azure](https://developers.openai.com/cookbook/examples/chatgpt/gpt_actions_library/gpt_middleware_azure_function)、[GCP](https://developers.openai.com/cookbook/examples/chatgpt/gpt_actions_library/gpt_middleware_google_cloud_function) 和 [AWS](https://developers.openai.com/cookbook/examples/chatgpt/gpt_actions_library/gpt_middleware_aws_function)。

## 给我们反馈

是否有你希望我们优先支持的集成？我们的集成中是否存在错误？请在 cookbook 页面对应的 github 上提交 PR 或 issue，我们会查看。

## 贡献到我们的 library

如果你有兴趣贡献到我们的 library，请遵循以下指南，然后在 github 中提交 PR 供我们审核。通常，请遵循类似[这个 GPT Action 示例](https://developers.openai.com/cookbook/examples/chatgpt/gpt_actions_library/gpt_action_bigquery)的模板。

指南 - 包含以下部分：

- Application Information - 描述第三方应用，并包含应用网站和 API 文档链接
- Custom GPT Instructions - 包含要放入 Custom GPT 的确切说明
- OpenAPI Schema - 包含要放入 GPT Action 的确切 OpenAPI schema
- Authentication Instructions - 对于 OAuth，包含确切的一组项目（authorization URL、token URL、scope 等）；同时包含如何在应用中填写 callback URL 的说明（以及任何其他步骤）
- FAQ and Troubleshooting - 用户可能遇到哪些常见陷阱？在此写出它们和解决方法

## 免责声明

这个 action library 旨在作为与第三方交互的指南，而 OpenAI 无法控制这些第三方。这些第三方可能更改其 API 设置或配置，OpenAI 无法保证这些 Actions 永久有效。请将它们视为起点。

本指南面向开发者以及能够自如编写 API 调用的人。非技术用户很可能会觉得这些步骤具有挑战性。

:::

## English source

::: details 展开英文原文
::: v-pre
## Purpose

While GPT Actions should be significantly less work for an API developer to set up than an entire application using those APIs from scratch, there’s still some set up required to get GPT Actions up and running. A Library of GPT Actions is meant to provide guidance for building GPT Actions on common applications.

## Getting started

If you’ve never built an action before, start by reading the [getting started guide](/mirror/api/docs/actions/getting-started) first to understand better how actions work.

Generally, this guide is meant for people with familiarity and comfort with calling API calls. For debugging help, try to explain your issues to ChatGPT - and include screenshots.

## How to access

[The OpenAI Cookbook](https://developers.openai.com/cookbook) has a [directory](https://developers.openai.com/cookbook/topic/chatgpt) of 3rd party applications and middleware application.

### 3rd party Actions cookbook

GPT Actions can integrate with HTTP services directly. GPT Actions leveraging SaaS API directly will authenticate and request resources directly from SaaS providers, such as [Google Drive](https://developers.openai.com/cookbook/examples/chatgpt/gpt_actions_library/gpt_action_google_drive) or [Snowflake](https://developers.openai.com/cookbook/examples/chatgpt/gpt_actions_library/gpt_action_snowflake_direct).

### Middleware Actions cookbook

GPT Actions can benefit from having a middleware. It allows pre-processing, data formatting, data filtering or even connection to endpoints not exposed through HTTP (e.g: databases). Multiple middleware cookbooks are available describing an example implementation path, such as [Azure](https://developers.openai.com/cookbook/examples/chatgpt/gpt_actions_library/gpt_middleware_azure_function), [GCP](https://developers.openai.com/cookbook/examples/chatgpt/gpt_actions_library/gpt_middleware_google_cloud_function) and [AWS](https://developers.openai.com/cookbook/examples/chatgpt/gpt_actions_library/gpt_middleware_aws_function).

## Give us feedback

Are there integrations that you’d like us to prioritize? Are there errors in our integrations? File a PR or issue on the cookbook page's github, and we’ll take a look.

## Contribute to our library

If you’re interested in contributing to our library, please follow the below guidelines, then submit a PR in github for us to review. In general, follow the template similar to [this example GPT Action](https://developers.openai.com/cookbook/examples/chatgpt/gpt_actions_library/gpt_action_bigquery).

Guidelines - include the following sections:

- Application Information - describe the 3rd party application, and include a link to app website and API docs
- Custom GPT Instructions - include the exact instructions to be included in a Custom GPT
- OpenAPI Schema - include the exact OpenAPI schema to be included in the GPT Action
- Authentication Instructions - for OAuth, include the exact set of items (authorization URL, token URL, scope, etc.); also include instructions on how to write the callback URL in the application (as well as any other steps)
- FAQ and Troubleshooting - what are common pitfalls that users may encounter? Write them here and workarounds

## Disclaimers

This action library is meant to be a guide for interacting with 3rd parties that OpenAI have no control over. These 3rd parties may change their API settings or configurations, and OpenAI cannot guarantee these Actions will work in perpetuity. Please see them as a starting point.

This guide is meant for developers and people with comfort writing API calls. Non-technical users will likely find these steps challenging.

:::
:::

