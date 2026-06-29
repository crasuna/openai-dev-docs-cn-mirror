---
status: needs-review
sourceId: "a7b7350182cd"
sourceChecksum: "a7b7350182cd4d0452d5e285cb9cdfd7199b602cb82d905d9c2ccd0e20a86faf"
sourceUrl: "https://developers.openai.com/api/docs/actions/actions-library"
translatedAt: "2026-06-27T17:44:20.0905341+08:00"
translator: codex-gpt-5.5-xhigh
---

# GPT Actions library 操作库

## 目的

虽然对 API 开发者来说，设置 GPT Actions 通常比从零开始使用这些 API 构建完整应用要少很多工作，但让 GPT Actions 正常运行仍然需要一些设置。GPT Actions library 旨在为围绕常见应用构建 GPT Actions 提供指导。

## 入门

如果你以前从未构建过 action，请先阅读[入门指南](https://developers.openai.com/api/docs/actions/getting-started)，以便更好地了解 actions 的工作方式。

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
