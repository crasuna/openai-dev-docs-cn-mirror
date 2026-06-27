---
status: needs-review
sourceId: "fd0580004994"
sourceChecksum: "fd05800049945d3ba89b02e64fc724f515509c2225043278f38d987513e0544a"
sourceUrl: "https://developers.openai.com/codex/concepts/cyber-safety"
translatedAt: "2026-06-27T11:05:32.948Z"
translator: codex-gpt-5.5-xhigh
---

# 网络安全

[GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/) 是我们在 [Preparedness Framework](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf) 下首个按 High cybersecurity capability 对待的模型，这要求额外的安全防护。这些防护包括训练模型拒绝明显恶意的请求，例如窃取凭据。

除安全训练外，基于自动分类器的监控会检测可疑网络活动信号，并将高风险流量路由到网络能力较低的模型（GPT-5.2）。我们预计只有很小一部分流量会受到这些缓解措施影响，并正在努力细化我们的政策、分类器和产品内通知。

## 为什么这样做

最近几个月，我们看到模型在网络安全任务上的表现有了显著提升，这让开发者和安全专业人员都受益。随着我们的模型在漏洞发现等网络安全相关任务上不断进步，我们采取预防性方法：扩展保护和执行机制，在支持合法研究的同时减缓滥用。

网络能力天然具有双重用途。支撑重要防御工作的同一类知识和技术，包括渗透测试、漏洞研究、大规模扫描、恶意软件分析和威胁情报，也可能造成现实世界中的伤害。

这些能力和技术需要在可用于提升安全性的场景中可用，并且更易使用。我们的 [Trusted Access for Cyber](https://openai.com/index/trusted-access-for-cyber/) 试点让个人和组织可以继续使用模型处理潜在高风险的网络安全活动，而不受中断。

## 工作方式

从事网络安全相关工作，或从事可能被自动检测系统[误判](#false-positives)为类似活动的开发者和安全专业人员，其请求可能会被重新路由到 GPT-5.2 作为 fallback。我们预计只有很小一部分流量会受到缓解措施影响，并正在积极校准我们的政策和分类器。

Codex CLI 的最新 alpha 版本包含产品内消息提示，会在请求被重新路由时显示。未来几天内，所有 clients 都将支持此消息提示。

受缓解措施影响的账号可以通过加入下方的 [Trusted Access](#trusted-access-for-cyber) 项目来重新获得 GPT-5.3-Codex 访问权限。

我们认识到，加入 Trusted Access 可能并不适合所有人，因此随着我们扩展这些缓解措施并[加强](https://openai.com/index/strengthening-cyber-resilience/)网络韧性，我们计划在多数情况下从账号级安全检查转向请求级检查。

## Trusted Access for Cyber

我们正在试点 “trusted access”，让开发者在我们继续校准面向普遍可用性的政策和分类器时，保留高级能力。我们的目标是让极少数用户需要加入 [Trusted Access for Cyber](https://openai.com/index/trusted-access-for-cyber/)。

若要将模型用于潜在高风险网络安全工作：

- 用户可以在 [chatgpt.com/cyber](https://chatgpt.com/cyber) 验证身份
- Enterprises 可以通过其 OpenAI representative，为整个团队默认请求 [trusted access](https://openai.com/form/enterprise-trusted-access-for-cyber/)

可能需要访问网络能力更强或限制更宽松的模型，以加速合法防御工作的安全研究人员和团队，可以表达对我们[邀请制项目⁠](https://docs.google.com/forms/d/e/1FAIpQLSea_ptovrS3xZeZ9FoZFkKtEJFWGxNrZb1c52GW4BVjB2KVNA/viewform?usp=header)的兴趣。拥有 trusted access 的用户仍必须遵守我们的 [Usage Policies⁠](https://openai.com/policies/usage-policies/) 和 [Terms of Use⁠](https://openai.com/policies/row-terms-of-use/)。

## 误判

合法活动或非网络安全活动有时可能被标记。发生重新路由时，响应模型会显示在 API request logs 中，也会通过 CLI 的产品内通知显示，并且很快会覆盖所有界面。如果你遇到重新路由，并认为这是错误的，请通过 `/feedback` 报告误判。
