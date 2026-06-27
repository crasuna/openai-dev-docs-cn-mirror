---
status: needs-review
sourceId: "f0029d1d8bce"
sourceChecksum: "f0029d1d8bce200bc216d733fb728d786b6de2998e5a00fdeafc8f1f38588454"
sourceUrl: "https://developers.openai.com/api/docs/guides/safety-checks/cybersecurity"
translatedAt: "2026-06-27T17:28:33+08:00"
translator: codex-gpt-5.5-xhigh
---

# 网络安全检查

GPT-5.3-Codex 及更新模型（包括 GPT-5.4 和 GPT-5.5）在我们的 [Preparedness Framework](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf) 下被归类为具有 High Cybersecurity Capability。因此，当这些模型通过 API 使用时，会适用额外的自动化防护措施。请注意，API 中适用的防护措施不同于 Codex 中使用的防护措施。你可以在[这里](https://developers.openai.com/codex/concepts/cyber-safety/)了解更多关于 Codex 防护措施的信息。

这些防护措施会监测潜在可疑网络安全活动的信号。如果达到某些阈值，在活动接受审查期间，对模型的访问可能会被临时限制。由于这些系统仍在校准中，合法的安全研究或防御性工作有时也可能被标记。我们预计只有一小部分流量会受到影响，并且会继续优化整体 API 体验。

## 非 ZDR 组织的防护措施

如果我们的系统在你的流量中检测到潜在可疑网络安全活动，并且该活动超过已定义阈值，则对这些模型的访问可能会被临时撤销。在这种情况下，API 请求将返回错误，错误代码为 `cyber_policy`。

如果你的组织尚未实现按用户提供的 [safety_identifier](https://developers.openai.com/api/docs/guides/safety-best-practices#implement-safety-identifiers)，则**整个组织**的访问可能会被临时撤销。如果你的组织为每个最终用户提供唯一的 [safety_identifier](https://developers.openai.com/api/docs/guides/safety-best-practices#implement-safety-identifiers)，则访问可能会针对**具体受影响用户**而不是整个组织被临时撤销（在人工审核和警告之后）。提供 safety identifier 有助于最大限度减少对你平台上其他用户的干扰。

## ZDR 组织的防护措施

该流程与上文所述的[非 Zero Data Retention（ZDR）](https://developers.openai.com/api/docs/guides/your-data/#data-retention-controls-for-abuse-monitoring) 组织大体相似；不过，对于使用 ZDR 的组织，还会额外应用请求级缓解措施。

如果某个请求被归类为潜在可疑请求，你可能会收到错误代码为 `cyber_policy` 的 API 错误。对于流式请求，这些错误可能会在其他流式事件中间返回。

与非 ZDR 组织一样，如果达到某些可疑网络活动阈值，则特定 `safety_identifier` 或整个组织的访问可能会受到限制。

## 申诉

如果你认为你的访问被错误限制，并且需要在 7 天期限结束前恢复，请[联系支持](https://help.openai.com/en/articles/6614161-how-can-i-contact-support)。
