---
title: "商品"
description: "Provide a structured product feed so ChatGPT accurately indexes and displays your products with up-to-date price and availability."
outline: deep
---

# 商品

**文档集**：Commerce 商务<br>
**分组**：Agentic Commerce — 规范<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/commerce/specs/file-upload/products](https://developers.openai.com/commerce/specs/file-upload/products)
- Markdown 来源：[https://developers.openai.com/commerce/specs/file-upload/products.md](https://developers.openai.com/commerce/specs/file-upload/products.md)
- 抓取时间：2026-06-27T05:55:12.720Z
- Checksum：`63bed99a517300713290a0a448c968d71a60024df7da9200f14749a67cae66b0`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre


Feed 参考

        为了让你的商品可以在 ChatGPT 中被发现，商家需要提供一个结构化的
        product feed 文件，供 OpenAI 摄取并建立索引。本规范定义了文件上传所用的商品
        schema：字段名称、数据类型、约束，以及实现准确发现、定价、可售性和卖家上下文所需的示例值。


        下方每个表格都会按 schema object 对字段分组，并说明字段是必填还是可选，
        同时提供校验规则，帮助你的工程团队构建和维护合规的上传文件。


        提供所有必填字段可确保你的商品能正确展示；可选字段则可以增强相关性和用户信任。




:::

## English source

::: details 展开英文原文
::: v-pre


Feed Reference

        To make your products discoverable inside ChatGPT, merchants provide a
        structured product feed file that OpenAI ingests and indexes. This
        specification defines the product schema for file uploads: field names,
        data types, constraints, and example values needed for accurate
        discovery, pricing, availability, and seller context.


        Each table below groups fields by schema object and indicates whether a
        field is Required or Optional, along with validation rules to help your
        engineering team build and maintain a compliant upload file.


        Supplying all required fields ensures your products can be displayed
        correctly, while optional fields enrich relevance and user trust.




:::
:::

