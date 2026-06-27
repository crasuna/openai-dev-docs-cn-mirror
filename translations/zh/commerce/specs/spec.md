---
status: needs-review
sourceId: "34d8baa8d7c2"
sourceChecksum: "34d8baa8d7c21e33d22d69268e0aa92168bf6656a9ba11ca669ed6e8703977ff"
sourceUrl: "https://developers.openai.com/commerce/specs/spec"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# Product Feed Spec

## Feed Reference

为了让你的产品能在 ChatGPT 中被发现，商家需要提供结构化 product feed file，供 OpenAI 摄取并索引。此 specification 定义了用于 file uploads 的 product schema：field names、data types、constraints，以及实现准确 discovery、pricing、availability 和 seller context 所需的 example values。

下面的每个表格都会按 schema object 对 fields 分组，并标明 field 是 Required 还是 Optional，同时给出 validation rules，帮助你的 engineering team 构建并维护合规的 upload file。

提供所有 required fields 可确保你的产品正确显示，而 optional fields 会丰富 relevance 和 user trust。
