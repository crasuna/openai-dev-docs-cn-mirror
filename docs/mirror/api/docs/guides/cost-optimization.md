---
title: "成本优化"
description: "Lower your OpenAI model costs by trying our tools and strategies."
outline: deep
---

# 成本优化

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/cost-optimization](https://developers.openai.com/api/docs/guides/cost-optimization)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/cost-optimization.md](https://developers.openai.com/api/docs/guides/cost-optimization.md)
- 抓取时间：2026-06-27T05:54:00.673Z
- Checksum：`d08087141b29ca6a9e5668287686e9310242fbb95b96dd9277242b9f78917da3`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用 OpenAI 模型时，有几种降低成本的方法。成本和延迟通常相互关联；减少 token 和请求通常会带来更快的处理速度。OpenAI 的 Batch API 和 flex processing 也是降低成本的其他方式。

## 成本与延迟

若要降低延迟和成本，请考虑以下策略：

- **减少请求**：限制完成任务所需的请求数量。
- **最小化 token**：减少输入 token 数量，并优化模型输出，使其更短。
- **选择更小的模型**：使用能够在降低成本和延迟的同时保持准确性的模型。

如需深入了解这些策略，请参阅我们的[延迟优化](/mirror/api/docs/guides/latency-optimization)指南。

## Batch API

异步处理作业。Batch API 提供了一组简单明了的端点，你可以将一组请求收集到单个文件中，启动批处理作业来执行这些请求，在底层请求执行期间查询该批次的状态，并在批次完成后最终取回汇总结果。

[开始使用 Batch API →](/mirror/api/docs/guides/batch)

## Flex processing

对于 Chat Completions 或 Responses 请求，可以用更慢的响应时间和偶尔的资源不可用来换取显著更低的成本。适合非生产或优先级较低的任务，例如模型评估、数据增强或异步工作负载。

[开始使用 flex processing →](/mirror/api/docs/guides/flex-processing)

:::

## English source

::: details 展开英文原文
::: v-pre
There are several ways to reduce costs when using OpenAI models. Cost and latency are typically interconnected; reducing tokens and requests generally leads to faster processing. OpenAI's Batch API and flex processing are additional ways to lower costs.

## Cost and latency

To reduce latency and cost, consider the following strategies:

- **Reduce requests**: Limit the number of necessary requests to complete tasks.
- **Minimize tokens**: Lower the number of input tokens and optimize for shorter model outputs.
- **Select a smaller model**: Use models that balance reduced costs and latency with maintained accuracy.

To dive deeper into these, please refer to our guide on [latency optimization](/mirror/api/docs/guides/latency-optimization).

## Batch API

Process jobs asynchronously. The Batch API offers a straightforward set of endpoints that allow you to collect a set of requests into a single file, kick off a batch processing job to execute these requests, query for the status of that batch while the underlying requests execute, and eventually retrieve the collected results when the batch is complete.

[Get started with the Batch API →](/mirror/api/docs/guides/batch)

## Flex processing

Get significantly lower costs for Chat Completions or Responses requests in exchange for slower response times and occasional resource unavailability. Ieal for non-production or lower-priority tasks such as model evaluations, data enrichment, or asynchronous workloads.

[Get started with flex processing →](/mirror/api/docs/guides/flex-processing)

:::
:::

