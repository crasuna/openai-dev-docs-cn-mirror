---
status: needs-review
sourceId: "465e705db8e0"
sourceChecksum: "465e705db8e05a68f00132cfdc4e9d7ebbd66a926f37e40c919ace738aa11e6c"
sourceUrl: "https://developers.openai.com/commerce/guides/production"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# 生产环境中的 Agentic commerce

## Testing and launch certification

上线前，请在 sandbox environment 中完成并记录以下测试。

每一项都应通过 request/response logs 进行端到端演示。

### Session creation and address handling

- **创建带 shipping address 和不带 shipping address 的 checkout session。**
  - 验证在提供有效地址后会返回 shipping options 和 tax totals。
  - 确认 `API-Version` header 存在，并且匹配受支持版本。

### Shipping option updates

- **更新所选 shipping option。**
  - 确保选项变更时会正确重新计算 order totals。

### Payment tokenization

- **创建 delegated payment token。**
  - 使用有效的 `payment_method` object、`allowance`、`billing_address`、`risk_signals` 和 `metadata` 发送 `POST /agentic_commerce/delegate_payment` request。
  - 包含所有必需 headers。
  - 验证 canonical JSON serialization 和正确的 detached signature generation。

### Order completion

- **使用 tokenized payment 完成订单。**
  - 确认 response 包含处于 `completed` 状态的最终 order object。
  - 验证返回字段，并确保 `HTTP 201 Created` status。

### Order updates

- **发送 order events。**
  - 验证 `order_created` 以及后续 `order_updated` webhooks 都已发送，并带有有效 HMAC signature。

### Error scenarios

- **演示 recoverable error handling。**
  - 触发并记录每个错误条件，同时使用合适的 HTTP status：
    - `missing`（例如省略 required field → `invalid_request / 400`）
    - `out_of_stock`（模拟库存失败）
    - `payment_declined`（模拟 issuer decline）

### Idempotency

- **验证 idempotency safety。**
  - 使用相同 Idempotency-Key 重复 create 和 complete 调用，以确认：
    - 安全的重复 requests 返回相同结果。
    - 参数不匹配返回 `idempotency_conflict with HTTP 409`。

### Documentation and links

- **检查 legal 和 UX links。**
  - 确保 Terms of Service 和 Privacy Policy links 存在且可用。

### IP egress ranges

- **Allowlist OpenAI 的 IP addresses**
  - OpenAI 将从[已发布 IP ranges](https://developers.openai.com/api/docs/guides/ip-addresses)之一调用你的 action。

## Security and compliance

安全是 Agentic Commerce Protocol 和 Instant Checkout 的最高优先事项。我们的 [security practices](https://www.openai.com/security) 与 [trust and compliance portal](https://trust.openai.com/) 提供了最全面、最新的文档。供参考，这里是我们的 [Privacy Policy](https://openai.com/privacy/) 和 [Terms of Use](https://openai.com/api/policies/terms/)。

**TLS and HTTPS**

发送给你的所有流量都必须在端口 443 上使用 TLS 1.2 或更高版本，并配备有效的公共证书。

**PCI Scope**

Product Feed Spec 和 Agentic Checkout Spec 被有意保持在 PCI scope 之外，并且不会传输 cardholder data。使用你的 PSP 的 Delegated Payment Spec 实现，可能避免你的 PCI scope 发生变化。但是，使用你的 PSP 的 forwarding APIs，或直接集成 OpenAI 的 Delegated Payment endpoints，都涉及处理 cardholder data (CHD)，并且很可能处于 PCI scope 内。我们计划在保持对不符合条件卡片向后兼容的同时，随着支持成熟完全迁移到 network tokens。

直接集成 Delegated Payment Spec 涉及直接处理 cardholder data (CHD)，并可能影响你的 PCI scope。请与你的 PSP 核对，并咨询你的 Qualified Security Assessor (QSA) 或其他 PCI compliance advisor，以确定对你特定 PCI DSS 义务的影响。OpenAI 可能要求你提供 attestation of compliance (AOC)，然后才启用 production access。

## FAQs

**在 agentic checkout flow 中，谁是 merchant of record？**

实际销售商品并直接向客户收款的商家是 merchant of record。OpenAI 和其他受信任 payment service providers 不是 merchant of record。客户会在信用卡账单上看到 Merchant 名称，就像他们直接从 merchant website 购买一样。

**谁管理 chargebacks 和 refunds？**

商家负责。你的平台负责处理 refunds 和 chargebacks，因为你是作为 merchant of record 直接从客户处接受付款。

当 refund 或 chargeback status 变化时，请使用 `ORDER_UPDATE` webhook 通知 ChatGPT（或任何集成 partner），以便 order state 保持同步。

**我们需要支持 multiple shipments 吗？**

目前，该协议建模的是每个 checkout session 一个 shipping address 和一个 selected shipping option。未来，该协议可能支持 multiple shipments。

如果你的系统支持 split shipments，请将其合并为一个 buyer-visible selection，并返回 shipping 和 tax 的汇总 totals。
