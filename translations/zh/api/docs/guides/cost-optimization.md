---
status: needs-review
sourceId: d08087141b29
sourceChecksum: d08087141b29ca6a9e5668287686e9310242fbb95b96dd9277242b9f78917da3
sourceUrl: https://developers.openai.com/api/docs/guides/cost-optimization
translatedAt: 2026-06-27T17:15:06+08:00
translator: codex-gpt-5.5-xhigh
---

# 成本优化

使用 OpenAI 模型时，有几种降低成本的方法。成本和延迟通常相互关联；减少 token 和请求通常会带来更快的处理速度。OpenAI 的 Batch API 和 flex processing 也是降低成本的其他方式。

## 成本与延迟

若要降低延迟和成本，请考虑以下策略：

- **减少请求**：限制完成任务所需的请求数量。
- **最小化 token**：减少输入 token 数量，并优化模型输出，使其更短。
- **选择更小的模型**：使用能够在降低成本和延迟的同时保持准确性的模型。

如需深入了解这些策略，请参阅我们的[延迟优化](https://developers.openai.com/api/docs/guides/latency-optimization)指南。

## Batch API

异步处理作业。Batch API 提供了一组简单明了的端点，你可以将一组请求收集到单个文件中，启动批处理作业来执行这些请求，在底层请求执行期间查询该批次的状态，并在批次完成后最终取回汇总结果。

[开始使用 Batch API →](https://developers.openai.com/api/docs/guides/batch)

## Flex processing

对于 Chat Completions 或 Responses 请求，可以用更慢的响应时间和偶尔的资源不可用来换取显著更低的成本。适合非生产或优先级较低的任务，例如模型评估、数据增强或异步工作负载。

[开始使用 flex processing →](https://developers.openai.com/api/docs/guides/flex-processing)
