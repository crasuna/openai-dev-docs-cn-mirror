---
title: "Product Feed Spec（商品 Feed 规范）"
description: "Provide a structured product feed so ChatGPT accurately indexes and displays your products with up-to-date price and availability."
outline: deep
---

# Product Feed Spec（商品 Feed 规范）

**文档集**：Commerce 商务<br>
**分组**：Agentic Commerce — 规范<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/commerce/specs/spec](https://developers.openai.com/commerce/specs/spec)
- Markdown 来源：[https://developers.openai.com/commerce/specs/spec.md](https://developers.openai.com/commerce/specs/spec.md)
- 抓取时间：2026-06-27T05:55:13.515Z
- Checksum：`34d8baa8d7c21e33d22d69268e0aa92168bf6656a9ba11ca669ed6e8703977ff`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## Feed 参考

为了让你的产品能在 ChatGPT 中被发现，商家需要提供结构化 product feed file，供 OpenAI 摄取并索引。此 specification 定义了用于 file uploads 的 product schema：field names、data types、constraints，以及实现准确 discovery、pricing、availability 和 seller context 所需的 example values。

下面的每个表格都会按 schema object 对 fields 分组，并标明 field 是必填还是可选，同时给出 validation rules，帮助你的工程团队构建并维护合规的 upload file。

提供所有 required fields 可确保你的产品正确显示，而 optional fields 会丰富 relevance 和 user trust。

:::

## English source

::: details 展开英文原文
::: v-pre
## Feed Reference

To make your products discoverable inside ChatGPT, merchants provide a
structured product feed file that OpenAI ingests and indexes. This
specification defines the product schema for file uploads: field names, data
types, constraints, and example values needed for accurate discovery, pricing,
availability, and seller context.

Each table below groups fields by schema object and indicates whether a field
is Required or Optional, along with validation rules to help your engineering
team build and maintain a compliant upload file.

Supplying all required fields ensures your products can be displayed correctly,
while optional fields enrich relevance and user trust.

:::
:::

