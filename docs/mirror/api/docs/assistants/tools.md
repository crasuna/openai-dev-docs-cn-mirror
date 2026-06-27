---
title: "Assistants API tools"
description: "Learn about the tools available for OpenAI Assistants, including file search, code interpreter, and function calling."
outline: deep
---

# Assistants API tools

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/assistants/tools](https://developers.openai.com/api/docs/assistants/tools)
- Markdown 来源：[https://developers.openai.com/api/docs/assistants/tools.md](https://developers.openai.com/api/docs/assistants/tools.md)
- 抓取时间：2026-06-27T05:53:56.616Z
- Checksum：`0e7422db0187b688ad02250de2cbcfa754467fea1d0166824eb2be452bef4a7b`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

使用 Assistants API 创建的 Assistant 可以配备工具，使其能够执行更复杂的任务，或与你的应用交互。
我们为 assistant 提供内置工具，但你也可以通过 Function Calling 定义自己的工具来扩展它们的能力。

Assistants API 目前支持以下工具：






    用于处理并搜索文件的内置 RAG 工具








    编写和运行 Python 代码，处理文件和多种数据








    使用你自己的自定义函数与你的应用交互




## 后续步骤

- 查看用于[提交工具输出](https://developers.openai.com/api/docs/api-reference/runs/submitToolOutputs)的 API reference
- 使用我们的 [Quickstart app](https://github.com/openai/openai-assistants-quickstart) 构建一个使用工具的 assistant

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
## Overview

Assistants created using the Assistants API can be equipped with tools that allow them to perform more complex tasks or interact with your application.
We provide built-in tools for assistants, but you can also define your own tools to extend their capabilities using Function Calling.

The Assistants API currently supports the following tools:



<IconItem title="File Search" className="mt-2">
    <span slot="icon">
      </span>
    Built-in RAG tool to process and search through files
  </IconItem>




<IconItem title="Code Interpreter" className="mt-2">
    <span slot="icon">
      </span>
    Write and run python code, process files and diverse data
  </IconItem>




<IconItem title="Function Calling" className="mt-2">
    <span slot="icon">
      </span>
    Use your own custom functions to interact with your application
  </IconItem>



## Next steps

- See the API reference to [submit tool outputs](https://developers.openai.com/api/docs/api-reference/runs/submitToolOutputs)
- Build a tool-using assistant with our [Quickstart app](https://github.com/openai/openai-assistants-quickstart)
``````
:::
:::

