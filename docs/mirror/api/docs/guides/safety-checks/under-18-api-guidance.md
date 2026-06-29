---
title: "未满 18 岁 API 指引"
description: "Under 18 API Guidance"
outline: deep
---

# 未满 18 岁 API 指引

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance.md](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance.md)
- 抓取时间：2026-06-27T05:54:08.283Z
- Checksum：`8ee0b7dc2d55b5f7983afcc44db80286a7446cf01caac41cc3cdd00d7db1c892`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
年轻人在网络内外都有独特需求，因此开发者在使用我们的 API 服务未成年人（未满 18 岁者）时，应实施额外保护措施。这些措施是对我们的[使用政策](https://openai.com/policies/usage-policies/)以及[条款和条件](https://openai.com/policies/services-agreement/)要求的补充。

**监管标准**

服务未成年人的组织必须遵守所有适用的儿童保护、安全和隐私法律，包括《儿童在线隐私保护法案》（COPPA）。在未先通过我们的 API 实施零数据保留之前，你不应使用 OpenAI 服务处理 13 岁以下儿童或适用数字同意年龄以下儿童的任何个人数据。你需要自行全权负责，确保你和你的用户在遵守适用法律的前提下使用 OpenAI 服务。

**安全标准**

服务未成年人的组织必须采取合理步骤，确保其通过 API 向未成年人提供的内容符合我们的使用政策中“保障未成年人安全”的要求，是安全且适龄的。这可能包括但不限于：

1. 向未成年人提供适龄披露，说明 AI 工具以及如何负责任地使用这些工具。
2. 实施适龄内容过滤器，以处理潜在敏感内容。
3. 实施合理的监控和报告机制，包括高风险互动的升级路径。
4. 在你的用例需要或其他情况下适当时，使用年龄保证系统，确保只有预期用户可以访问该产品。

**最佳实践**

服务未成年人的组织在与我们的 API 交互时应遵循这些最佳实践：

- 在处理未成年人的数据和互动时保持更高程度的谨慎，并在发现年轻用户面临风险时采取适当行动。
- 利用可用的安全工具，并遵循 OpenAI 可能提供的技术安全措施；这些措施旨在为特定用户群体（包括未成年人）定制产品体验。
- 使用 OpenAI 最新的旗舰模型，这些模型纳入了最新安全保护，尤其是在构建面向未成年人的体验时。

OpenAI 保留审计组织是否遵守本政策的权利。未能证明合规的客户可能会收到警告；在重复或严重不合规的情况下，可能会被暂停或终止 API 访问。

:::

## English source

::: details 展开英文原文
::: v-pre
Young people have unique needs online and offline, so developers should implement additional safeguards when using our API to serve minors (under 18 years old). These are in addition to requirements under our [usage policies](https://openai.com/policies/usage-policies/) and [terms and conditions](https://openai.com/policies/services-agreement/).

**Regulatory Standards**

Organizations serving minors must comply with all applicable child protection, safety, and privacy laws, including the Children's Online Privacy Protection Act (COPPA). You should not use OpenAI services to process any personal data of children under 13 or the applicable age of digital consent without first implementing zero data retention in our API. You are solely responsible for ensuring that you and your users use OpenAI services in compliance with applicable law.

**Safety Standards**

Organizations serving minors must take reasonable steps to ensure that the content they are serving to minors via the API is safe and age appropriate, in line with our usage policies to “Keep minors safe.” This may include, but is not limited to:

1. Providing age-appropriate disclosures to minors about AI tools and how to use them responsibly.
2. Implementing age-appropriate content filters to address potentially sensitive content.
3. Implementing reasonable monitoring and reporting mechanisms, including escalation paths for high-risk interactions.
4. Where required or otherwise appropriate for your use case, using age assurance systems to ensure only intended users can access the product.

**Best Practices**

Organizations serving minors should follow these best practices when interacting with our API:

- Exercise heightened care when handling minors’ data and interactions and take appropriate action when risks to young users are identified.
- Leverage available safety tools and follow technical safety measures that OpenAI may provide that are designed to tailor product experiences for specific user groups, including minors.
- Use OpenAI’s most current flagship models, which incorporate the latest safety protections, particularly when building experiences for minors.

OpenAI reserves the right to audit organizations for compliance with this policy. Customers who fail to demonstrate compliance may receive warnings and, in cases of repeated or serious noncompliance, may be subject to suspension or termination of API access.

:::
:::

