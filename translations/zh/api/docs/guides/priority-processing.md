---
status: needs-review
sourceId: "d8dbf3dd1bad"
sourceChecksum: "d8dbf3dd1bad9c68e449494c992ece542c9558f751ac36f1e9c395ee9faa3cc0"
sourceUrl: "https://developers.openai.com/api/docs/guides/priority-processing"
translatedAt: "2026-06-27T10:01:07.242Z"
translator: codex-gpt-5.5-xhigh
---

# Priority processing

与 Standard processing 相比，Priority processing 能提供显著更低且更稳定的延迟，同时保留按量付费的灵活性。

Priority processing 非常适合有稳定流量、面向用户、价值较高且延迟至关重要的应用。Priority processing 不应用于数据处理、评估或其他高度不稳定的流量。

## 配置 Priority processing

发送到 Responses 或 Completions 端点的请求，可以通过请求参数或 Project 设置配置为使用 Priority processing。

若要在请求级别选择使用 Priority processing，请在 Completions 或 Responses 请求中包含 [`service_tier=priority`](https://platform.openai.com/docs/api-reference/responses/create#responses-create-service_tier) 参数。

创建一个使用 priority processing 的 response

```bash
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": "What does 'fit check for my napalm era' mean?",
    "service_tier": "priority"
  }'
```

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5.5",
  input: "What does 'fit check for my napalm era' mean?",
  service_tier: "priority"
});

console.log(response);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="What does 'fit check for my napalm era' mean?",
    service_tier="priority"
)
print(response)
```


若要在 Project 级别选择使用，请进入 Settings 页面，在 Project 下选择 General 标签页，然后将 Project Service Tier 改为 Priority。在 Project 上完成配置后，未指定 `service_tier` 的请求将默认使用 Priority。请注意，该 Project 的请求会随时间逐步迁移到 Priority。

[Responses](https://platform.openai.com/docs/api-reference/responses/object#responses/object-service_tier) 或 [Completions](https://platform.openai.com/docs/api-reference/chat/object#chat/object-service_tier) response 对象中的 `service_tier` 字段会包含处理该请求时使用的 service tier。

## 速率限制和爬坡速率

**基准限制**

在速率限制计量中，Priority 消耗会像 Standard 一样处理。请使用你通常的重试和退避逻辑。对于某个给定模型，Standard 和 Priority processing 共用同一个速率限制。

**爬坡速率限制**

如果你的流量爬升过快，一些 Priority 请求可能会降级为 Standard，并按 Standard 费率计费。如果超过爬坡速率限制，response 将显示 `service_tier="default"`。目前，当你发送的流量至少达到 100 万 TPM，并且 15 分钟内 TPM 增幅超过 50% 时，爬坡速率限制可能适用。

为避免触发爬坡速率限制，我们建议：

- 更换模型或 snapshot 时逐步爬坡
- 使用 feature flags 在数小时内切换流量，而不是瞬间切换。
- 避免在 Priority 上运行大型 ETL 或 batch 作业

## 使用注意事项

- 每 token 成本会相对 standard 收取溢价，更多信息请参阅[定价](https://developers.openai.com/api/docs/pricing)。
- 对于 priority processing 请求，仍会应用 cache 折扣。
- Priority processing 也适用于多模态 / 图像输入请求。
- 可以在 dashboard 中使用 "group by service tier" 选项查看由 priority processing 处理的请求。
- 查看[定价页面](https://developers.openai.com/api/docs/pricing)，了解当前哪些模型支持 Priority processing。
- 暂不支持长上下文、微调模型和 embeddings。
