---
title: "网络安全检查"
description: "Cybersecurity checks"
outline: deep
---

# 网络安全检查

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/safety-checks/cybersecurity](https://developers.openai.com/api/docs/guides/safety-checks/cybersecurity)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/safety-checks/cybersecurity.md](https://developers.openai.com/api/docs/guides/safety-checks/cybersecurity.md)
- 抓取时间：2026-06-27T05:54:08.274Z
- Checksum：`f0029d1d8bce200bc216d733fb728d786b6de2998e5a00fdeafc8f1f38588454`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
GPT-5.3-Codex 及更新模型（包括 GPT-5.4 和 GPT-5.5）在我们的 [Preparedness Framework](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf) 下被归类为具有 High Cybersecurity Capability。因此，当这些模型通过 API 使用时，会适用额外的自动化防护措施。请注意，API 中适用的防护措施不同于 Codex 中使用的防护措施。你可以在[这里](/mirror/codex/concepts/cyber-safety)了解更多关于 Codex 防护措施的信息。

这些防护措施会监测潜在可疑网络安全活动的信号。如果达到某些阈值，在活动接受审查期间，对模型的访问可能会被临时限制。由于这些系统仍在校准中，合法的安全研究或防御性工作有时也可能被标记。我们预计只有一小部分流量会受到影响，并且会继续优化整体 API 体验。

## 非 ZDR 组织的防护措施

如果我们的系统在你的流量中检测到潜在可疑网络安全活动，并且该活动超过已定义阈值，则对这些模型的访问可能会被临时撤销。在这种情况下，API 请求将返回错误，错误代码为 `cyber_policy`。

如果你的组织尚未实现按用户提供的 [safety_identifier](/mirror/api/docs/guides/safety-best-practices#implement-safety-identifiers)，则**整个组织**的访问可能会被临时撤销。如果你的组织为每个最终用户提供唯一的 [safety_identifier](/mirror/api/docs/guides/safety-best-practices#implement-safety-identifiers)，则访问可能会针对**具体受影响用户**而不是整个组织被临时撤销（在人工审核和警告之后）。提供 safety identifier 有助于最大限度减少对你平台上其他用户的干扰。

## ZDR 组织的防护措施

该流程与上文所述的[非 Zero Data Retention（ZDR）](/mirror/api/docs/guides/your-data#data-retention-controls-for-abuse-monitoring) 组织大体相似；不过，对于使用 ZDR 的组织，还会额外应用请求级缓解措施。

如果某个请求被归类为潜在可疑请求，你可能会收到错误代码为 `cyber_policy` 的 API 错误。对于流式请求，这些错误可能会在其他流式事件中间返回。

与非 ZDR 组织一样，如果达到某些可疑网络活动阈值，则特定 `safety_identifier` 或整个组织的访问可能会受到限制。

## 申诉

如果你认为你的访问被错误限制，并且需要在 7 天期限结束前恢复，请[联系支持](https://help.openai.com/en/articles/6614161-how-can-i-contact-support)。

:::

## English source

::: details 展开英文原文
::: v-pre
GPT-5.3-Codex and newer models, including GPT-5.4 and GPT-5.5, are classified as having High Cybersecurity Capability under our [Preparedness Framework](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf). As a result, additional automated safeguards apply when these models are used via the API. Please note that the safeguards applied in the API differ from those used in Codex. You can learn more about the Codex safeguards [here](/mirror/codex/concepts/cyber-safety).

These safeguards monitor for signals of potentially suspicious cybersecurity activity. If certain thresholds are met, access to the model may be temporarily limited while activity is reviewed. Because these systems are still being calibrated, legitimate security research or defensive work may occasionally be flagged. We expect only a small portion of traffic to be impacted, and we’re continuing to refine the overall API experience.

## Safeguard actions for non-ZDR Organizations

If our systems detect potentially suspicious cybersecurity activity within your traffic that exceeds defined thresholds, access to these models may be temporarily revoked. In this case, API requests will return an error with the error code `cyber_policy`.

If your organization has not implemented a per-user [safety_identifier](/mirror/api/docs/guides/safety-best-practices#implement-safety-identifiers), access may be temporarily revoked for the **entire organization**. If your organization provides a unique [safety_identifier](/mirror/api/docs/guides/safety-best-practices#implement-safety-identifiers) per end user, access may be temporarily revoked for the **specific affected user** rather than the entire organization (after human review and warnings). Providing safety identifiers helps minimize disruption to other users on your platform.

## Safeguard actions for ZDR Organizations

The process is largely similar for [non-Zero Data Retention (ZDR)](/mirror/api/docs/guides/your-data#data-retention-controls-for-abuse-monitoring) organizations as described above; however, for organizations using ZDR, request-level mitigations are additionally applied.

If a request is classified as potentially suspicious you may receive an API error with the error code `cyber_policy`. For streaming requests, these errors may be returned in the midst of other streaming events.

As with non-ZDR organizations, if certain thresholds of suspicious cyber activity are met, access may be limited for the specific safety_identifier or for the whole organization.

## Appeals

If you believe your access has been incorrectly limited and need it restored before the 7-day period ends, please [contact support](https://help.openai.com/en/articles/6614161-how-can-i-contact-support).

:::
:::

