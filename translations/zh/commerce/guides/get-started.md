---
status: needs-review
sourceId: "5c898008f7ea"
sourceChecksum: "5c898008f7ea13b231adc39e843e3ffea3d1ed4ba714fac661ae21915a391f4e"
sourceUrl: "https://developers.openai.com/commerce/guides/get-started"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# 快速开始

在 ChatGPT 中 onboarding product feeds 目前仅向已获批准的合作伙伴开放。要申请访问权限，请填写此表单
  <a
    href="https://chatgpt.com/merchants"
    target="_blank"
    rel="noopener noreferrer"
  >
    申请访问权限
  </a>

## 概览

通过与 OpenAI 共享结构化 product feed 来开始你的 ACP 集成。Product feeds 为 ChatGPT 提供所需的 catalog data，使其能够索引你的产品、理解核心 attributes，并在购物体验中呈现准确的产品信息。

当你想要以下能力时，请从 product feeds 开始：

- 让你的 catalog 可被 ChatGPT 理解。
- 共享最新 product data，包括 titles、descriptions、images、price 和 availability。
- 基于有文档说明的 schema 和 delivery model 建立清晰集成路径。

你可以在 [agenticcommerce.dev](https://agenticcommerce.dev) 和 [GitHub](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol) 了解更多 Agentic Commerce Protocol 信息。

## 集成路径

使用以下顺序建立你的 ACP 集成：

1. **决定** 使用哪种集成方式：[file upload](https://developers.openai.com/commerce/specs/file-upload/overview) 或 [API](https://developers.openai.com/commerce/specs/api/overview)。
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

查看集成 [best practices](https://developers.openai.com/commerce/guides/best-practices) 以获取指导。
