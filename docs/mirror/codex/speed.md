---
title: "速度"
description: "Increase speed without sacrificing intelligence"
outline: deep
---

# 速度

**文档集**：Codex\
**分组**：速度\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/speed](https://developers.openai.com/codex/speed)
- Markdown 来源：[https://developers.openai.com/codex/speed.md](https://developers.openai.com/codex/speed.md)
- 抓取时间：2026-06-27T05:55:09.389Z
- Checksum：`d8d29f978e73fa10f586f1ba3a17e2d3e3bd609100a9c0dd678bf649cc725f19`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## Fast mode

Codex 提供了提升模型速度的能力，但会消耗更多 credits。

Fast mode 会将受支持模型的速度提升 1.5 倍，并以高于 Standard mode 的速率消耗 credits。它目前支持 GPT-5.5 和 GPT-5.4；GPT-5.5 的 credits 消耗为 Standard rate 的 2.5 倍，GPT-5.4 为 Standard rate 的 2 倍。

在 CLI 中使用 `/fast on`、`/fast off` 或 `/fast status` 来更改或查看当前设置。你也可以在 `config.toml` 中通过 `service_tier = "fast"` 加上 `[features].fast_mode = true` 持久化默认值。当你使用 ChatGPT 登录时，Fast mode 可在 Codex IDE extension、Codex CLI 和 Codex app 中使用。使用 API key 时，Codex 会改用标准 API pricing，并且不能使用 Fast mode credits。

&lt;VideoPlayer
  src="/videos/codex/fast-mode-demo.mp4"
  class="[&_video]:mx-auto [&_video]:max-h-[400px] [&_video]:max-w-full [&_video]:w-auto"
/&gt;

## Codex-Spark

GPT-5.3-Codex-Spark 是一个独立的快速、能力较弱的 Codex model，针对近乎即时的实时编码迭代进行了优化。与以更高 credit rate 加速受支持模型的 fast mode 不同，Codex-Spark 是它自己的模型选项，并且有自己的使用限制。

在 research preview 期间，Codex-Spark 仅向 ChatGPT Pro subscribers 开放。

:::

## English source

::: details 展开英文原文
::: v-pre
## Fast mode

Codex offers the ability to increase the speed of the model for increased
credit consumption.

Fast mode increases supported model speed by 1.5x and consumes credits at a
higher rate than Standard mode. It currently supports GPT-5.5 and GPT-5.4,
consuming credits at 2.5x the Standard rate for GPT-5.5 and 2x the Standard
rate for GPT-5.4.

Use `/fast on`, `/fast off`, or `/fast status` in the CLI to change or inspect
the current setting. You can also persist the default with `service_tier =
"fast"` plus `[features].fast_mode = true` in `config.toml`. Fast mode is
available in the Codex IDE extension, Codex CLI, and the Codex app when you
sign in with ChatGPT. With an API key, Codex uses standard API pricing instead
and you can't use Fast mode credits.

&lt;VideoPlayer
  src="/videos/codex/fast-mode-demo.mp4"
  class="[&_video]:mx-auto [&_video]:max-h-[400px] [&_video]:max-w-full [&_video]:w-auto"
/&gt;

## Codex-Spark

GPT-5.3-Codex-Spark is a separate fast, less-capable Codex model optimized for
near-instant, real-time coding iteration. Unlike fast mode, which speeds up a
supported model at a higher credit rate, Codex-Spark is its own model choice
and has its own usage limits.

During research preview Codex-Spark is only available for ChatGPT Pro subscribers.

:::
:::

