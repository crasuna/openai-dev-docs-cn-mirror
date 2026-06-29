---
status: needs-review
sourceId: "8135e1bee34e"
sourceChecksum: "8135e1bee34e68f714fcba3c1ff64c4836174422b57e882df7eea3f4e27b756f"
sourceUrl: "https://developers.openai.com/commerce/guides/best-practices"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# 最佳实践

在 ChatGPT 中 onboarding product feeds 目前仅向已获批准的合作伙伴开放。要申请访问权限，请填写此表单
  <a
    href="https://chatgpt.com/merchants"
    target="_blank"
    rel="noopener noreferrer"
  >
    申请访问权限
  </a>

## 内容质量

### 编写事实性的描述

- 使用简洁、事实性的文案，帮助用户理解产品。
- 纯文本和项目符号样式文本都可以接受。

### 有意识地使用可选字段

- `description.html`、`description.markdown`、`categories.taxonomy` 和 `seller.links` 等 optional fields 可以提升回答质量，但 ingestion 并不要求它们。
- 如果某个 optional field 需要脆弱的 transform，请先省略它，直到 data quality 稳定。

### 保持 URL 值有效并已编码

- 确保 `url`、`media.url` 和 seller link URLs 有效且已编码。
- 对空格和不安全字符进行编码（例如，空格使用 `%20`）。

<div class="not-prose my-10 h-2 rounded-md border border-subtle bg-surface-secondary"></div>

## 卖家与政策

### 保持 attribution 和 policy links 一致

- 将 `seller.name` 设置为用户在 listing context 中应看到的卖家。
- 在 `seller.links` 中使用持久、公开的 URLs。
- 在整个 catalog 中一致复用受支持的 `Link.type` values。

<div class="not-prose my-10 h-2 rounded-md border border-subtle bg-surface-secondary"></div>

## Variants（变体）

### 在 row level 建模 variants

- 为父产品使用稳定的 product `id`，并为每个可购买选项使用唯一的 variant `id`。
- 当 `title`、`url`、`description`、`media`、`availability` 和 `price` 的值因 variant 而异时，请让这些值保持 variant-specific。
- 使用面向用户的 option dimensions 填充 `variant_options`，例如颜色或尺码。
- 只有当 assets 适用于每个 variant 时，才使用 product-level `media`。

<div class="not-prose my-10 h-2 rounded-md border border-subtle bg-surface-secondary"></div>

## Attribution（归因）

### 明确跟踪发布后的效果

- 当你需要针对 feed 的点击跟踪时，请向 `url` 添加 feed attribution parameters（例如 `utm_medium=feed`）。
- 在 snapshots 之间保持内部 tracking parameters 一致。
