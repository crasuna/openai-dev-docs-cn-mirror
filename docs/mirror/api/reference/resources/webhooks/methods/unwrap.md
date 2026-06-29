---
title: "Webhooks — 解包"
description: "Unwrap"
outline: deep
---

# Webhooks — 解包

**文档集**：API 参考<br>
**分组**：参考<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/reference/resources/webhooks/methods/unwrap](https://developers.openai.com/api/reference/resources/webhooks/methods/unwrap)
- Markdown 来源：[https://developers.openai.com/api/reference/resources/webhooks/methods/unwrap.md](https://developers.openai.com/api/reference/resources/webhooks/methods/unwrap.md)
- 抓取时间：2026-06-27T05:54:44.190Z
- Checksum：`7db7733215205f5179089ff530c523d40cc9c7843e8efa67194443b31e8837b9`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Unwrap 是官方 SDK 中提供的便捷 helper，可在一次调用中验证 webhook 签名并解析 JSON payload。使用 `client.webhooks.unwrap(body, headers, options?)` 可在一次调用中验证签名并解析 JSON payload。端到端 webhook 示例见 [Webhooks 指南](/mirror/api/docs/guides/webhooks)。

## 支持的 SDK

此 helper 可在官方 SDK 中使用，包括：

- [JavaScript / TypeScript](https://developers.openai.com/api/reference/typescript/resources/webhooks/methods/unwrap)
- [Python](https://developers.openai.com/api/reference/python/resources/webhooks/methods/unwrap)
- [Ruby](https://developers.openai.com/api/reference/ruby/resources/webhooks/methods/unwrap)
- [Go](https://developers.openai.com/api/reference/go/resources/webhooks/methods/unwrap)

:::

## English source

::: details 展开英文原文
::: v-pre
Unwrap is a convenience helper available in the official SDKs to verify a webhook signature and parse the JSON payload in a single call. Use `client.webhooks.unwrap(body, headers, options?)` to verify the signature and parse the JSON payload in one call. For end-to-end webhook examples, see the [Webhooks guide](/mirror/api/docs/guides/webhooks).

## Supported SDKs

This helper is available in official SDKs, including:

- [JavaScript / TypeScript](https://developers.openai.com/api/reference/typescript/resources/webhooks/methods/unwrap)
- [Python](https://developers.openai.com/api/reference/python/resources/webhooks/methods/unwrap)
- [Ruby](https://developers.openai.com/api/reference/ruby/resources/webhooks/methods/unwrap)
- [Go](https://developers.openai.com/api/reference/go/resources/webhooks/methods/unwrap)

:::
:::

