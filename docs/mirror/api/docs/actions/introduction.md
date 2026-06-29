---
title: "GPT Actions 概览"
description: "Learn about GPT Actions for customizing ChatGPT and interacting with external applications via APIs."
outline: deep
---

# GPT Actions 概览

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/actions/introduction](https://developers.openai.com/api/docs/actions/introduction)
- Markdown 来源：[https://developers.openai.com/api/docs/actions/introduction.md](https://developers.openai.com/api/docs/actions/introduction.md)
- 抓取时间：2026-06-27T05:53:55.994Z
- Checksum：`2d8e7bc2e1c625a6ebac240efb76ab7f9b9e99fed5ac9b8a2b4f5cc41e64c6a7`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
GPT Actions 存储在 [Custom GPTs](https://openai.com/blog/introducing-gpts) 中。Custom GPTs 让用户能够通过提供说明、附加文档作为知识，以及连接第三方服务，针对特定用例自定义 ChatGPT。

GPT Actions 让 ChatGPT 用户能够仅使用自然语言，通过 ChatGPT 外部的 RESTful API 调用与外部应用交互。它们会把自然语言文本转换成 API 调用所需的 json schema。GPT Actions 通常用于向 ChatGPT 进行[数据检索](/mirror/api/docs/actions/data-retrieval)（例如查询 Data Warehouse），或在另一个应用中执行操作（例如提交 JIRA 工单）。

## GPT Actions 的工作方式

GPT Actions 的核心是利用 [Function Calling](/mirror/api/docs/guides/function-calling) 来执行 API 调用。

类似于 ChatGPT 的 Data Analysis 能力（生成 Python 代码并执行），它们利用 Function Calling 来：(1) 判断哪个 API 调用与用户的问题相关，以及 (2) 生成该 API 调用所需的 json 输入。最后，GPT Action 会使用该 json 输入执行 API 调用。

开发者甚至可以指定 action 的认证机制，Custom GPT 会使用第三方应用的认证来执行 API 调用。GPT Actions 会向最终用户隐藏 API 调用的复杂性：用户只需用自然语言提问，ChatGPT 也会以自然语言提供输出。

## GPT Actions 的力量

API 支持**互操作性**，让你的组织能够访问其他应用。不过，让用户从第三方 API 访问正确的信息，可能需要开发者投入大量额外工作。

GPT Actions 提供了一种可行替代方案：开发者现在只需描述 API 调用的 schema、配置认证，并向 GPT 添加一些说明，ChatGPT 就可以在用户的自然语言问题和 API 层之间搭建桥梁。

## 简化示例

[入门指南](/mirror/api/docs/actions/getting-started)会通过 [weather.gov](https://developers.openai.com/api/docs/actions/weather.gov) 的两个 API 调用示例来生成天气预报：

- /points/\{latitude},\{longitude} 输入经纬度坐标，并输出 forecast office (wfo) 以及 x-y 坐标
- /gridpoints/\{office}/\{gridX},\{gridY}/forecast 输入 wfo,x,y 坐标，并输出天气预报

一旦开发者在 GPT Action 中编码了填充这两个 API 调用所需的 json schema，用户就可以直接问：“这个周末去 Washington DC 旅行我应该带什么？”然后 GPT Action 会确定该地点的经纬度，按顺序执行两个 API 调用，并基于收到的周末天气预报给出打包清单。

在此示例中，GPT Actions 会向 api.weather.gov 提供两个 API 输入：

/points API 调用：

```json
{
  "latitude": 38.9072,
  "longitude": -77.0369
}
```

/forecast API 调用：

```json
{
  "wfo": "LWX",
  "x": 97,
  "y": 71
}
```

## 开始构建

查看[入门指南](/mirror/api/docs/actions/getting-started)，深入了解这个天气示例；也可以查看我们的 [actions library](/mirror/api/docs/actions/actions-library)，获取最常见第三方应用的预构建 GPT Actions 示例。

## 其他信息

- 熟悉我们的 [GPT policies](https://openai.com/policies/usage-policies#:~:text=or%20educational%20purposes.-,Building%20with%20ChatGPT,-Shared%20GPTs%20allow)
- 查看 [GPT data privacy FAQs](https://help.openai.com/en/articles/8554402-gpts-data-privacy-faqs)
- 在[常见 GPT 问题](https://help.openai.com/en/articles/8554407-gpts-faq)中查找答案

:::

## English source

::: details 展开英文原文
::: v-pre
GPT Actions are stored in [Custom GPTs](https://openai.com/blog/introducing-gpts), which enable users to customize ChatGPT for specific use cases by providing instructions, attaching documents as knowledge, and connecting to 3rd party services.

GPT Actions empower ChatGPT users to interact with external applications via RESTful APIs calls outside of ChatGPT simply by using natural language. They convert natural language text into the json schema required for an API call. GPT Actions are usually either used to do [data retrieval](/mirror/api/docs/actions/data-retrieval) to ChatGPT (e.g. query a Data Warehouse) or take action in another application (e.g. file a JIRA ticket).

## How GPT Actions work

At their core, GPT Actions leverage [Function Calling](/mirror/api/docs/guides/function-calling) to execute API calls.

Similar to ChatGPT's Data Analysis capability (which generates Python code and then executes it), they leverage Function Calling to (1) decide which API call is relevant to the user's question and (2) generate the json input necessary for the API call. Then finally, the GPT Action executes the API call using that json input.

Developers can even specify the authentication mechanism of an action, and the Custom GPT will execute the API call using the third party app’s authentication. GPT Actions obfuscates the complexity of the API call to the end user: they simply ask a question in natural language, and ChatGPT provides the output in natural language as well.

## The Power of GPT Actions

APIs allow for **interoperability** to enable your organization to access other applications. However, enabling users to access the right information from 3rd-party APIs can require significant overhead from developers.

GPT Actions provide a viable alternative: developers can now simply describe the schema of an API call, configure authentication, and add in some instructions to the GPT, and ChatGPT provides the bridge between the user's natural language questions and the API layer.

## Simplified example

The [getting started guide](/mirror/api/docs/actions/getting-started) walks through an example using two API calls from [weather.gov](https://developers.openai.com/api/docs/actions/weather.gov) to generate a forecast:

- /points/\{latitude},\{longitude} inputs lat-long coordinates and outputs forecast office (wfo) and x-y coordinates
- /gridpoints/\{office}/\{gridX},\{gridY}/forecast inputs wfo,x,y coordinates and outputs a forecast

Once a developer has encoded the json schema required to populate both of those API calls in a GPT Action, a user can simply ask "What I should pack on a trip to Washington DC this weekend?" The GPT Action will then figure out the lat-long of that location, execute both API calls in order, and respond with a packing list based on the weekend forecast it receives back.

In this example, GPT Actions will supply api.weather.gov with two API inputs:

/points API call:

```json
{
  "latitude": 38.9072,
  "longitude": -77.0369
}
```

/forecast API call:

```json
{
  "wfo": "LWX",
  "x": 97,
  "y": 71
}
```

## Get started on building

Check out the [getting started guide](/mirror/api/docs/actions/getting-started) for a deeper dive on this weather example and our [actions library](/mirror/api/docs/actions/actions-library) for pre-built example GPT Actions of the most common 3rd party apps.

## Additional information

- Familiarize yourself with our [GPT policies](https://openai.com/policies/usage-policies#:~:text=or%20educational%20purposes.-,Building%20with%20ChatGPT,-Shared%20GPTs%20allow)
- Check out the [GPT data privacy FAQs](https://help.openai.com/en/articles/8554402-gpts-data-privacy-faqs)
- Find answers to [common GPT questions](https://help.openai.com/en/articles/8554407-gpts-faq)

:::
:::

