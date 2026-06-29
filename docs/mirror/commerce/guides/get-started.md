---
title: "快速开始"
description: "Start your ACP integration by sharing a structured product feed."
outline: deep
---

# 快速开始

**文档集**：Commerce  
**分组**：Agentic Commerce — Guides  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/commerce/guides/get-started](https://developers.openai.com/commerce/guides/get-started)
- Markdown 来源：[https://developers.openai.com/commerce/guides/get-started.md](https://developers.openai.com/commerce/guides/get-started.md)
- 抓取时间：2026-06-27T05:55:10.732Z
- Checksum：`5c898008f7ea13b231adc39e843e3ffea3d1ed4ba714fac661ae21915a391f4e`
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


## 概览

通过与 OpenAI 共享结构化 product feed 来开始你的 ACP 集成。Product feeds 为 ChatGPT 提供所需的 catalog data，使其能够索引你的产品、理解核心 attributes，并在购物体验中呈现准确的产品信息。

当你想要以下能力时，请从 product feeds 开始：

- 让你的 catalog 可被 ChatGPT 理解。
- 共享最新 product data，包括 titles、descriptions、images、price 和 availability。
- 基于有文档说明的 schema 和 delivery model 建立清晰集成路径。

你可以在 [agenticcommerce.dev](https://agenticcommerce.dev) 和 [GitHub](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol) 了解更多 Agentic Commerce Protocol 信息。

## 集成路径

使用以下顺序建立你的 ACP 集成：

1. **决定** 使用哪种集成方式：[file upload](/mirror/commerce/specs/file-upload/overview) 或 [API](/mirror/commerce/specs/api/overview)。
   - 通常建议每天通过 file upload 提供一次完整 feed，然后通过 API 在一天内发送更新。
   - 如果你的 feed 很小，可以通过 API 同时提供完整 feed 和定期更新。
   - Promotions data 只能通过 API 提供。
2. **审查** 所选集成方式的 specs，并确认 required fields、canonical field names 和 validation rules。
3. **验证** 每条 record 的 required fields。
4. **上传** 通过所选集成方式提交 feed data。
5. **保持** feed 基于集成方式持续更新：
   - 对于 file upload，请按固定节奏使用最新 snapshot 覆盖同一文件或 shard set。
   - 对于 API，请通过 API upsert products。

## 禁售产品政策

为了让 ChatGPT 对所有人都保持安全，我们只允许合法、安全且适合一般受众的产品和服务。禁止产品包括但不限于涉及成人内容、年龄限制产品（例如酒精、尼古丁、赌博）、有害或危险材料、武器、仅限处方药物、未经许可的金融产品、受法律限制的商品、非法活动或欺骗性做法的产品。

商家有责任确保其产品和内容不违反这些限制或任何适用法律。如果违反这些政策，OpenAI 可能采取纠正措施，例如移除产品或禁止卖家在 ChatGPT 中展示。

## 最佳实践

查看集成 [best practices](/mirror/commerce/guides/best-practices) 以获取指导。

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


## Overview

Start your ACP integration by sharing a structured product feed with OpenAI. Product feeds give ChatGPT the catalog data it needs to index your products, understand core attributes, and present accurate product information in shopping experiences.

Start with product feeds when you want to:

- Make your catalog understandable to ChatGPT.
- Share up-to-date product data, including titles, descriptions, images, price, and availability.
- Establish a clear integration path based on a documented schema and delivery model.

You can learn more about the Agentic Commerce Protocol at [agenticcommerce.dev](https://agenticcommerce.dev) and on [GitHub](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol).

## Integration path

Use this sequence to stand up your integration with ACP:

1. **Decide** which integration method to use: [file upload](/mirror/commerce/specs/file-upload/overview) or [API](/mirror/commerce/specs/api/overview).
   - It is generally recommended to provide the entire feed once a day via file upload, and then send updates throughout the day via the API.
   - If your feed is small, you can provide both the entire feed and regular updates via the API.
   - Promotions data can only be provided via the API.
2. **Review** the specs for the chosen integration method, and confirm the required fields, canonical field names, and validation rules.
3. **Validate** required fields for every record.
4. **Upload** feed data through the chosen integration method.
5. **Keep** the feed current based on the integration method:
   - For file upload, overwrite the same file or shard set with your latest snapshot on a regular cadence.
   - For the API, upsert products through the API.

## Prohibited products policy

To keep ChatGPT a safe place for everyone, we only allow products and services that are legal, safe, and appropriate for a general audience. Prohibited products include, but are not limited to, those that involve adult content, age-restricted products (for example, alcohol, nicotine, gambling), harmful or dangerous materials, weapons, prescription-only medications, unlicensed financial products, legally restricted goods, illegal activities, or deceptive practices.

Merchants are responsible for ensuring their products and content do not violate these restrictions or any applicable law. OpenAI may take corrective actions such as removing a product or banning a seller from being surfaced in ChatGPT if these policies are violated.

## Best practices

Review integration [best practices](/mirror/commerce/guides/best-practices) for guidance.

:::
:::

