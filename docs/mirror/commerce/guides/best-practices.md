---
title: "最佳实践"
description: "Operational guidance for high-quality integrations."
outline: deep
---

# 最佳实践

**文档集**：Commerce 商务<br>
**分组**：Agentic Commerce — 指南<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/commerce/guides/best-practices](https://developers.openai.com/commerce/guides/best-practices)
- Markdown 来源：[https://developers.openai.com/commerce/guides/best-practices.md](https://developers.openai.com/commerce/guides/best-practices.md)
- 抓取时间：2026-06-27T05:55:10.532Z
- Checksum：`8135e1bee34e68f714fcba3c1ff64c4836174422b57e882df7eea3f4e27b756f`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
在 ChatGPT 中 onboarding product feeds 目前仅向已获批准的合作伙伴开放。要申请访问权限，请填写此表单
  &lt;a
    href="https://chatgpt.com/merchants"
    target="_blank"
    rel="noopener noreferrer"
  &gt;
    申请访问权限


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



## 卖家与政策

### 保持 attribution 和 policy links 一致

- 将 `seller.name` 设置为用户在 listing context 中应看到的卖家。
- 在 `seller.links` 中使用持久、公开的 URLs。
- 在整个 catalog 中一致复用受支持的 `Link.type` values。



## Variants（变体）

### 在 row level 建模 variants

- 为父产品使用稳定的 product `id`，并为每个可购买选项使用唯一的 variant `id`。
- 当 `title`、`url`、`description`、`media`、`availability` 和 `price` 的值因 variant 而异时，请让这些值保持 variant-specific。
- 使用面向用户的 option dimensions 填充 `variant_options`，例如颜色或尺码。
- 只有当 assets 适用于每个 variant 时，才使用 product-level `media`。



## Attribution（归因）

### 明确跟踪发布后的效果

- 当你需要针对 feed 的点击跟踪时，请向 `url` 添加 feed attribution parameters（例如 `utm_medium=feed`）。
- 在 snapshots 之间保持内部 tracking parameters 一致。

:::

## English source

::: details 展开英文原文
::: v-pre
Onboarding product feeds in ChatGPT is currently available to approved
  partners. To apply for access, fill out this form 
  &lt;a
    href="https://chatgpt.com/merchants"
    target="_blank"
    rel="noopener noreferrer"
  &gt;
    here


## Content quality

### Write factual descriptions

- Use concise, factual copy that helps users understand products.
- Plain text and bullet-style text are both acceptable.

### Use optional fields intentionally

- Optional fields like `description.html`, `description.markdown`, `categories.taxonomy`, and `seller.links` can improve answer quality but are not required for ingestion.
- If an optional field requires brittle transforms, omit it until data quality is stable.

### Keep URL values valid and encoded

- Ensure `url`, `media.url`, and seller link URLs are valid and encoded.
- Encode spaces and unsafe characters (for example, use `%20` for spaces).



## Seller and policy

### Keep attribution and policy links consistent

- Set `seller.name` to the seller users should see in listing context.
- Use durable, public URLs in `seller.links`.
- Reuse supported `Link.type` values consistently across your catalog.



## Variants

### Model variants at row level

- Use a stable product `id` for the parent product and a unique variant `id` for each purchasable option.
- Keep `title`, `url`, `description`, `media`, `availability`, and `price` variant-specific when those values differ by variant.
- Populate `variant_options` with the user-facing option dimensions, such as color or size.
- Use product-level `media` only when the assets apply across every variant.



## Attribution

### Track post-launch performance explicitly

- Add feed attribution parameters to `url` (for example `utm_medium=feed`) when you need feed-specific click tracking.
- Keep your internal tracking parameters consistent across snapshots.

:::
:::

