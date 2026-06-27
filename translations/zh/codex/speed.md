---
status: needs-review
sourceId: "d8d29f978e73"
sourceChecksum: "d8d29f978e73fa10f586f1ba3a17e2d3e3bd609100a9c0dd678bf649cc725f19"
sourceUrl: "https://developers.openai.com/codex/speed"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# 速度

## Fast mode

Codex 提供了提升模型速度的能力，但会消耗更多 credits。

Fast mode 会将受支持模型的速度提升 1.5 倍，并以高于 Standard mode 的速率消耗 credits。它目前支持 GPT-5.5 和 GPT-5.4；GPT-5.5 的 credits 消耗为 Standard rate 的 2.5 倍，GPT-5.4 为 Standard rate 的 2 倍。

在 CLI 中使用 `/fast on`、`/fast off` 或 `/fast status` 来更改或查看当前设置。你也可以在 `config.toml` 中通过 `service_tier = "fast"` 加上 `[features].fast_mode = true` 持久化默认值。当你使用 ChatGPT 登录时，Fast mode 可在 Codex IDE extension、Codex CLI 和 Codex app 中使用。使用 API key 时，Codex 会改用标准 API pricing，并且不能使用 Fast mode credits。

<VideoPlayer
  src="/videos/codex/fast-mode-demo.mp4"
  class="[&_video]:mx-auto [&_video]:max-h-[400px] [&_video]:max-w-full [&_video]:w-auto"
/>

## Codex-Spark

GPT-5.3-Codex-Spark 是一个独立的快速、能力较弱的 Codex model，针对近乎即时的实时编码迭代进行了优化。与以更高 credit rate 加速受支持模型的 fast mode 不同，Codex-Spark 是它自己的模型选项，并且有自己的使用限制。

在 research preview 期间，Codex-Spark 仅向 ChatGPT Pro subscribers 开放。

