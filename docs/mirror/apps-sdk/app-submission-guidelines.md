---
title: "应用提交指南"
description: "Guidelines for submitting ChatGPT apps for publishing."
outline: deep
---

# 应用提交指南

**文档集**：Apps SDK  
**分组**：Apps SDK — App Submission Guidelines  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/apps-sdk/app-submission-guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines)
- Markdown 来源：[https://developers.openai.com/apps-sdk/app-submission-guidelines.md](https://developers.openai.com/apps-sdk/app-submission-guidelines.md)
- 抓取时间：2026-06-27T05:54:45.223Z
- Checksum：`9281049db44d6177ef6016189b014b9dacd6dc5221babbac648452bee659aabf`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

ChatGPT app 生态建立在信任之上。人们来到 ChatGPT，是期待获得安全、有用且尊重其隐私的体验。开发者来到 ChatGPT，是期待公平且透明的流程。这些开发者指南规定了每位构建者都应查阅并遵守的政策。

在进入具体内容前，我们建议你先熟悉两个基础资源：

- [**ChatGPT apps 的 UX principles**](/mirror/apps-sdk/concepts/ux-principles) - 本指南概述了构建 ChatGPT apps 的原则和最佳实践，并提供一份 checklist，帮助你确保应用非常适合 ChatGPT。
- [**ChatGPT apps 的 UI guidelines**](/mirror/apps-sdk/concepts/ui-guidelines) - 本指南描述了 interaction、layout 和 design patterns，这些模式能帮助 apps 在 ChatGPT 中感觉直观、可信且一致。

你还应阅读我们的博客文章：[what makes a great ChatGPT app](https://developers.openai.com/blog/what-makes-a-great-chatgpt-app/)，了解使用 Apps SDK 构建应用的整体方法。

以下指南概述了开发者必须满足的最低标准，只有满足这些标准，应用才会被考虑在 ChatGPT 中发布，并保持已发布且对 ChatGPT 用户可用。展现出强现实世界实用性和高用户满意度的 apps 可能有资格获得增强分发机会，例如 directory placement 或 proactive suggestions。

## 应用基础

### 目的和原创性

Apps 应有明确目的，并可靠地完成其承诺。尤其是，它们应提供 ChatGPT 核心对话能力原生不支持的功能或工作流，并能有意义地帮助满足对话中表达的常见用户意图。

只使用你拥有或已获准使用的知识产权。不要从事误导性或仿冒设计、冒充、垃圾内容，或没有有意义交互的静态 frames。Apps 不应暗示其由 OpenAI 制作或认可。

### 质量和可靠性

Apps 必须以可预测、可靠的方式运行。结果应准确且与用户输入相关。错误（包括意外错误）必须通过清晰消息或 fallback 行为得到妥善处理。

提交前，apps 必须经过充分测试，以确保在广泛场景中的稳定性、响应性和低延迟。Apps 不应崩溃、卡住或表现出不一致行为。Apps 应是完整的，任何作为试用版或演示版提交的 app 都不会被接受。

### 应用名称、描述和截图

应用名称和描述必须清晰、准确且易懂。避免过于泛化的名称，尤其是与品牌没有明显关联的单词词典词，因为这类名称可能被拒绝。Screenshots 必须准确代表应用功能，并符合所需尺寸。

### Tools

MCP tools 是 ChatGPT 使用你的应用的手册。清晰、准确的工具定义能让你的应用更安全、更容易被模型理解，也更容易获得用户信任。

#### 清晰准确的工具名称

工具名称应便于人类阅读，具体，并描述工具实际做什么。

- 工具名称在你的应用内必须唯一。
- 使用直接反映动作的普通语言，最好是动词形式（例如 `get_order_status`）。
- 避免误导性、过度宣传性或比较性语言（例如 `pick_me`、`best`、`official`）。

#### 与行为匹配的描述

每个工具都必须包含说明其目的的清晰准确描述。

- 描述应说明工具做什么。
- 描述不得偏袒或贬低其他 apps 或 services，也不得试图影响模型选择它而不是其他 app 的 tools。
- 描述不得建议超出明确用户意图和应用所满足目的的过宽触发范围。
- 如果工具行为从描述中看不清或不完整，你的应用可能会被拒绝。

#### 正确 annotation

必须正确设置 [Tool annotations](/mirror/apps-sdk/reference#annotations)，让 ChatGPT 和用户理解某个动作是否安全，或是否需要额外谨慎。

- 如果某个工具只检索或列出数据，但不改变 ChatGPT 外部的任何内容，则应使用 `readOnlyHint` annotation 标记它。
- 写入或破坏性工具（例如创建、更新、删除、发布、发送）必须使用 `readOnlyHint` 和 `destructiveHint` 清晰标记。
- 与外部系统、账号、公共平台交互，或创建公开可见内容的工具，必须使用 `openWorldHint` annotation 明确标记。
- 不正确或缺失的动作标签是常见拒绝原因。请仔细检查，确保 `readOnlyHint`、`openWorldHint` 和 `destructiveHint` annotations 设置正确，并在提交时为每一项提供详细理由。

#### 最小且目的驱动的输入

工具应只请求完成任务所必需的最少信息。

- 输入字段必须与工具声明的目的直接相关。
- 不要“以防万一”而请求完整对话历史、原始聊天 transcripts 或宽泛上下文字段。只有当一个 _简短、任务特定_ 的用户意图字段能有意义地改善执行，并且不会把数据收集扩展到超出响应用户请求和你的隐私政策所述目的所合理必要的范围时，工具才可以请求它。
- 如有需要，请依赖系统共享的粗略 geo location。不要请求精确用户位置数据（例如 GPS coordinates 或地址）。

#### 可预测、可审计的行为

工具的行为应与其名称、描述和输入完全一致。

- Side effects 绝不应隐藏或隐式发生。
- 如果工具把数据发送到当前环境之外（例如发布内容、发送消息），这必须在工具定义中说明清楚。
- 工具应在可能时可安全重试，或者清楚指出重试何时可能造成重复效果。

精心设计的 tools 有助于减少意外、保护用户，并加快审核流程。

### 认证和权限

如果你的应用需要认证，流程必须透明且明确。必须清楚告知用户所有请求的权限，并且这些请求必须严格限制在应用运行所必需的范围内。

#### 测试凭证

提交需要认证的应用进行审核时，你必须提供一个包含示例数据、功能完整的 demo account 的 login 和 password。需要任何额外登录步骤的 apps，例如要求新账号注册，或通过不可访问账号进行 2FA，都会被拒绝。

## 商务和商业化

目前，apps **只能针对实物商品** 开展 commerce。不得销售数字产品或服务，包括 subscriptions、digital content、tokens 或 credits，无论是直接提供还是间接提供（例如通过 freemium upsells）。

此外，apps 不得用于销售、推广、促成或有意义地支持以下商品或服务：

#### **禁止商品**

- **成人内容和性服务**
  - 色情内容、露骨性媒体、live-cam services、成人 subscriptions
  - 性玩具、性爱娃娃、BDSM gear、fetish products
- **赌博**
  - 真实货币赌博服务、casino credits、sportsbook wagers、crypto-casino tokens
- **非法或受管制药物**
  - Marijuana/THC products、psilocybin、非法物质
  - 超过法定 THC 限制的 CBD products
- **Drug paraphernalia**
  - Bongs、dab rigs、drug-use scales、以毒品用途营销的 cannabis grow equipment
- **处方药和年龄限制药品**
  - 仅凭处方可获得的药物（例如 insulin、antibiotics、Ozempic、opioids）
  - 年龄限制 Rx products（例如 testosterone、HGH、fertility hormones）
- **非法商品**
  - 假冒或复制产品
  - 赃物或来源不明物品
  - 金融欺诈工具（skimmers、fake POS devices）
  - Piracy tools 或 cracked software
  - 野生动物或环境违禁品（ivory、endangered species products）
- **Malware、spyware 和 surveillance**
  - Malware、ransomware、keyloggers、stalkerware
  - 隐蔽监控设备（spy cameras、IMSI catchers、hidden trackers）
- **烟草和 nicotine**
  - Tobacco products
  - Nicotine products（vapes、e-liquids、nicotine pouches）
- **武器和有害材料**
  - Firearms、ammunition、firearm parts
  - Explosives、fireworks、bomb-making materials
  - 非法或年龄限制武器（switchblades、brass knuckles、在禁用地区的 crossbows）
  - Self-defense weapons（pepper spray、stun guns、tasers）
  - Extremist merchandise 或 propaganda

#### **禁止的欺诈性、欺骗性或高风险服务**

- Fake IDs、伪造文件或文件伪造服务
- Debt relief、credit repair 或 credit-score manipulation schemes
- 不受监管、欺骗性或滥用性的金融服务
- 旨在剥削用户的 lending、advance-fee 或 credit-building schemes
- 涉及投机、消费者欺骗或金融滥用的 Crypto 或 NFT offerings
- 执行 money transfers、crypto transfers 或 investment trades
- 政府服务滥用、冒充或福利操纵
- Identity theft、冒充，或会促成误用的 identity-monitoring services
- 某些促成欺诈、规避或虚假陈述的法律或准法律服务
- Negative-option billing、telemarketing 或 consent-bypass schemes
- 高 chargeback、易发生欺诈或滥用性的 travel services

### Checkout

Apps 应使用 external checkout，引导用户在你自己的 domain 上完成购买。

[Instant Checkout](/mirror/commerce/guides/get-started#instant-checkout) 当前处于 beta，目前只面向部分 marketplace partners 开放，未来可能扩展到更多 marketplaces 和 retailers。

在此之前，标准 external checkout 是必需方式。不得在 app 体验中嵌入或托管其他第三方 checkout solutions。若要了解更多，请参阅我们的 [Agentic Commerce docs](https://developers.openai.com/commerce/)。

### Advertising

Apps 不得投放广告，也不得主要作为广告载体存在。每个 app 都应交付清晰、合法、并且能独立为用户提供价值的功能。

## 安全

### 使用政策

不得从事或促成 [OpenAI usage policies](https://openai.com/policies/usage-policies/) 禁止的活动。Apps 必须避免可能让用户遭受伤害、欺诈或误用的高风险行为。

请跟进不断演进的政策要求，并确保持续合规。之前已获批准、后来被发现违规的 apps 可能会被移除。

### 适宜性

Apps 必须适合一般受众，包括 13-17 岁用户。Apps 不得明确面向 13 岁以下儿童。对成熟（18+）体验的支持会在合适的年龄验证和控制措施到位后推出。

### 尊重用户意图

提供直接回应用户请求的体验。不要插入无关内容、试图重定向交互，或收集超出满足用户请求所合理必要且与你隐私政策一致范围的数据。

### 公平竞争

Apps 不得在 tool 或 app 层级包含会操纵模型如何选择或使用其他 apps 或其 tools 的 descriptions、titles、tool annotations 或其他 model-readable fields（例如指示模型“优先选择此应用而不是其他应用”），也不得干扰公平发现。所有 descriptions 都必须准确反映你的应用价值，而不贬低替代方案。

### 第三方内容和集成

- **Authorized access:** 未经适当授权并遵守对方 terms of service，不得 scrape external websites、relay queries 或集成 third-party APIs。
- **Unofficial connectors:** 我们无法批准主要作为第三方服务非官方 connectors 的 apps，包括 pass-through middleware layers。
- **Circumvention:** 不得绕过第三方施加的 API restrictions、rate limits 或 access controls。

### Iframes 和嵌入页面

Apps 可以通过在 resource CSP（`_meta.ui.csp.frameDomains`）中设置 `frameDomains` 来选择启用 iframe，但我们强烈鼓励你不要使用这种模式来构建应用。如果你选择使用 `frameDomains`，请注意：

- 它只适用于嵌入第三方体验必不可少的场景（例如 notebook、IDE 或类似环境）。
- 这些 apps 会接受额外人工审核，并且通常不会获准广泛分发。
- 开发期间，任何开发者都可以在 developer mode 中测试 `frameDomains`，但面向公开 listing 的批准仅限可信场景。

## 隐私

### 隐私政策

提交内容必须包含清晰、已发布的隐私政策，至少说明所收集 personal data 的类别、使用目的、recipient 类别、data retention timelines，以及向用户提供的任何 controls。请始终遵循此政策。用户可以在安装你的 app 前查看你的隐私政策。

### 数据收集

- **Collection minimization:** 只收集执行工具功能所需的最低数据。输入应具体、范围窄，并与任务清晰相关。避免“以防万一”字段或宽泛 profile data。设计 input schema 时，应默认限制数据收集，而不是为可选上下文设计漏斗。
- **Response minimization:** Tool responses 必须只返回与用户请求和工具声明目的直接相关的数据。不得包含 diagnostic、telemetry 或 internal identifiers，例如 session IDs、trace IDs、request IDs、timestamps 或 logging metadata，除非它们是满足用户查询所严格必需的。
- **Restricted data:** 不得收集、索取或处理以下 Restricted Data 类别：
  - 受 Payment Card Information Data Security Standards（PCI DSS）约束的信息
  - Protected health information（PHI）
  - Government identifiers（例如社会保障号码）
  - Access credentials 和 authentication secrets（例如 API keys、MFA/OTP codes 或 passwords）。
- **Regulated Sensitive Data:** 不得收集在数据收集辖区被视为 “sensitive” 或 “special category” 的个人数据，除非收集对执行工具声明功能严格必要；用户已提供法律上充分的同意；并且收集和使用在收集时或收集前已经清晰、显著披露。
- **Data boundaries:**
  - 避免在 input schema 中请求原始位置字段（例如 city 或 coordinates）。需要位置时，请通过 client 受控 side channel（例如 environment metadata 或 referenced resource）获取，以便应用合适的政策和 consent controls。这能减少意外 PII 捕获、强制 least-privilege access，并保持位置处理可审计且可撤销。
  - 你的 app 不得从 client 或其他地方拉取、重建或推断完整聊天记录。只能处理 client 或模型选择发送的明确 snippets 和 resources。这种分离有助于防止隐蔽的数据扩展，并让分析仅限于有意共享的内容。

### 透明度和用户控制

- **Data practices:** 不得从事 surveillance、tracking 或 behavioral profiling，包括 timestamps、IPs 或 query patterns 等 metadata collection，除非已明确披露、范围狭窄、受有意义的用户控制，并且符合 [OpenAI’s usage policies](https://openai.com/policies/usage-policies/)。
- **Accurate action labels:** 将任何改变外部状态（create、modify、delete）的工具标记为写入动作。只有当工具没有 side effects 且可安全重试时，才应将其标记为 read-only action。破坏性动作需要清晰 labels 和 friction（例如 confirmation），以便 clients 在执行前强制 guardrails、approvals、confirmations 或 prompts。
- **Preventing data exfiltration:** 任何会把数据发送到当前边界之外的动作（例如 posting messages、sending emails 或 uploading files）都必须作为写入动作暴露给 client，以便它可以要求用户确认或以 preview mode 运行。这能减少无意数据泄露，并让 server 行为与 client-side security expectations 保持一致。

## 开发者验证

### 验证

所有提交都必须来自经过验证的个人或组织。在 [OpenAI Platform Dashboard general settings](https://platform.openai.com/settings/organization/general) 中，我们提供了一种方式，用于确认你的身份以及你希望代表其发布的任何企业的关系。虚假陈述、隐藏行为或试图操纵系统可能导致被移出该计划。

### 支持联系方式

你必须提供 customer support contact details，让最终用户可以联系你获取帮助。请保持这些信息准确且最新。

## 提交你的应用

拥有 Owner role 或 `api.apps.write` permission 的用户可以从 [OpenAI Platform Dashboard](http://platform.openai.com/apps-manage) 创建 app drafts 并提交。拥有 `api.apps.read` 的用户可以在 Dashboard 中查看 app drafts 和 review status。

虽然你可以在单个 Platform organization 中发布多个唯一 apps，但每个 app 同一时间只能有一个版本处于审核中。你可以在 Dashboard 中查看审核状态，并会收到告知任何状态变化的电子邮件通知。

若要了解有关应用提交流程的更多信息，请参阅我们的 [专门指南](/mirror/apps-sdk/deploy/submission)。

:::

## English source

::: details 展开英文原文
::: v-pre
## Overview

The ChatGPT app ecosystem is built on trust. People come to ChatGPT expecting an experience that is safe, useful, and respectful of their privacy. Developers come to ChatGPT expecting a fair and transparent process. These developer guidelines set the policies every builder is expected to review and follow.

Before getting into specifics, we recommend first familiarizing yourself with two foundational resources:

- [**UX principles for ChatGPT apps**](/mirror/apps-sdk/concepts/ux-principles) - this guide outlines principles and best practices for building ChatGPT apps, as well as a checklist to help you ensure your app is a great fit for ChatGPT.
- [**UI guidelines for ChatGPT apps**](/mirror/apps-sdk/concepts/ui-guidelines) - this guide describes the interaction, layout, and design patterns that help apps feel intuitive, trustworthy, and consistent within ChatGPT.

You should also read our blog post on [what makes a great ChatGPT app](https://developers.openai.com/blog/what-makes-a-great-chatgpt-app/) to get a sense of the overall approach to building with the Apps SDK.

The guidelines below outline the minimum standard developers must meet for their app to be considered for publication in ChatGPT, and for their app to remain published and available to ChatGPT users. Apps that demonstrate strong real-world utility and high user satisfaction may be eligible for enhanced distribution opportunities—such as directory placement or proactive suggestions.

## App fundamentals

### Purpose and originality

Apps should serve a clear purpose and reliably do what they promise. In particular, they should provide functionality or workflows that are not natively supported by ChatGPT’s core conversational capabilities, and that meaningfully help satisfy common user intents expressed in conversation.

Only use intellectual property that you own or have permission to use. Do not engage in misleading or copycat designs, impersonation, spam, or static frames with no meaningful interaction. Apps should not imply that they are made or endorsed by OpenAI.

### Quality and reliability

Apps must behave predictably and reliably. Results should be accurate and relevant to user input. Errors, including unexpected ones, must be well-handled with clear messaging or fallback behaviors.

Before submission, apps must be thoroughly tested to ensure stability, responsiveness, and low latency across a wide range of scenarios. Apps should not crash, hang, or show inconsistent behavior. Apps should be complete and any app submitted as a trial or demo will not be accepted.

### App name, description, and screenshots

App names and descriptions must be clear, accurate, and easy to understand. Avoid overly generic names—especially single-word dictionary terms that aren’t clearly tied to your brand—as they may be rejected. Screenshots must accurately represent your app's functionality and comply with the required dimensions.

### Tools

MCP tools act as the manual for ChatGPT to use your app. Clear, accurate tool definitions make your app safer, easier for the model to understand, and easier for users to trust.

#### Clear and accurate tool names

Tool names should be human-readable, specific, and descriptive of what the tool actually does.

- Tool names must be unique within your app.
- Use plain language that directly reflects the action, ideally as a verb (e.g.,`get_order_status`).
- Avoid misleading, overly promotional, or comparative language (e.g., `pick_me`, `best`, `official`).

#### Descriptions that match behavior

Each tool must include a description that explains its purpose clearly and accurately.

- The description should describe what the tool does.
- Descriptions must not favor or disparage other apps or services or attempt to influence the model to select it over another app’s tools.
- Descriptions must not recommend overly-broad triggering beyond the explicit user intent and purpose the app fulfills.
- If a tool’s behavior is unclear or incomplete from its description, your app may be rejected.

#### Correct annotation

[Tool annotations](/mirror/apps-sdk/reference#annotations) must be correctly set so that ChatGPT and users understand whether an action is safe or requires extra caution.

- You should label a tool with the `readOnlyHint` annotation if it only retrieves or lists data, but does not change anything outside of ChatGPT.
- Write or destructive tools (e.g., creating, updating, deleting, posting, sending) must be clearly marked using the `readOnlyHint` and `destructiveHint`.
- Tools that interact with external systems, accounts, public platforms, or create publicly-visible content must be explicitly labeled using the `openWorldHint` annotation.
- Incorrect or missing action labels are a common cause of rejection. Double-check to ensure that the `readOnlyHint`, `openWorldHint`, and `destructiveHint` annotations are correctly set and provide a detailed justification for each at submission time.

#### Minimal and purpose-driven inputs

Tools should request the minimum information necessary to complete their task.

- Input fields must be directly related to the tool’s stated purpose.
- Do not request the full conversation history, raw chat transcripts, or broad contextual fields “just in case.” A tool may request a _brief, task-specific_ user intent field only when it meaningfully improves execution and does not expand data collection beyond what is reasonably necessary to respond to the user’s request and for the purposes described in your privacy policy.
- If needed, rely on the coarse geo location shared by the system. Do not request precise user location data (e.g. GPS coordinates or addresses).

#### Predictable, auditable behavior

Tools should behave exactly as their names, descriptions, and inputs indicate.

- Side effects should never be hidden or implicit.
- If a tool sends data outside the current environment (e.g., posting content, sending messages), this must be clear from the tool definition.
- Tools should be safe to retry where possible, or clearly indicate when retries may cause repeated effects.

Carefully designed tools help reduce surprises, protect users, and speed up the review process.

### Authentication and permissions

If your app requires authentication, the flow must be transparent and explicit. Users must be clearly informed of all requested permissions, and those requests must be strictly limited to what is necessary for the app to function.

#### Test credentials

When submitting an authenticated app for review, you must provide a login and password for a fully-featured demo account that includes sample data. Apps requiring any additional steps for login—such as requiring new account sign-up or 2FA through an inaccessible account—will be rejected.

## Commerce and monetization

Currently, apps may conduct commerce **only for physical goods**. Selling digital products or services—including subscriptions, digital content, tokens, or credits—is not allowed, whether offered directly or indirectly (for example, through freemium upsells).

In addition, apps may not be used to sell, promote, facilitate, or meaningfully enable the following goods or services:

#### **Prohibited goods**

- **Adult content & sexual services**
  - Pornography, explicit sexual media, live-cam services, adult subscriptions
  - Sex toys, sex dolls, BDSM gear, fetish products
- **Gambling**
  - Real-money gambling services, casino credits, sportsbook wagers, crypto-casino tokens
- **Illegal or regulated drugs**
  - Marijuana/THC products, psilocybin, illegal substances
  - CBD products exceeding legal THC limits
- **Drug paraphernalia**
  - Bongs, dab rigs, drug-use scales, cannabis grow equipment marketed for drugs
- **Prescription & age-restricted medications**
  - Prescription-only drugs (e.g., insulin, antibiotics, Ozempic, opioids)
  - Age-restricted Rx products (e.g., testosterone, HGH, fertility hormones)
- **Illicit goods**
  - Counterfeit or replica products
  - Stolen goods or items without clear provenance
  - Financial-fraud tools (skimmers, fake POS devices)
  - Piracy tools or cracked software
  - Wildlife or environmental contraband (ivory, endangered species products)
- **Malware, spyware & surveillance**
  - Malware, ransomware, keyloggers, stalkerware
  - Covert surveillance devices (spy cameras, IMSI catchers, hidden trackers)
- **Tobacco & nicotine**
  - Tobacco products
  - Nicotine products (vapes, e-liquids, nicotine pouches)
- **Weapons & harmful materials**
  - Firearms, ammunition, firearm parts
  - Explosives, fireworks, bomb-making materials
  - Illegal or age-restricted weapons (switchblades, brass knuckles, crossbows where banned)
  - Self-defense weapons (pepper spray, stun guns, tasers)
  - Extremist merchandise or propaganda

#### **Prohibited fraudulent, deceptive, or high-risk services**

- Fake IDs, forged documents, or document falsification services
- Debt relief, credit repair, or credit-score manipulation schemes
- Unregulated, deceptive, or abusive financial services
- Lending, advance-fee, or credit-building schemes designed to exploit users
- Crypto or NFT offerings involving speculation, consumer deception, or financial abuse
- Execution of money transfers, crypto transfers, or investment trades
- Government-service abuse, impersonation, or benefit manipulation
- Identity theft, impersonation, or identity-monitoring services that enable misuse
- Certain legal or quasi-legal services that facilitate fraud, evasion, or misrepresentation
- Negative-option billing, telemarketing, or consent-bypass schemes
- High-chargeback, fraud-prone, or abusive travel services

### Checkout

Apps should use external checkout, directing users to complete purchases on your own domain.

[Instant Checkout](/mirror/commerce/guides/get-started#instant-checkout), which is currently in beta, is currently available only to select marketplace partners and may expand to additional marketplaces and retailers over time.

Until then, standard external checkout is the required approach. No other third-party checkout solutions may be embedded or hosted within the app experience. To learn more, see our [docs on Agentic Commerce](https://developers.openai.com/commerce/).

### Advertising

Apps must not serve advertisements and must not exist primarily as an advertising vehicle. Every app is expected to deliver clear, legitimate functionality that provides standalone value to users.

## Safety

### Usage policies

Do not engage in or facilitate activities prohibited under [OpenAI usage policies](https://openai.com/policies/usage-policies/). Apps must avoid high-risk behaviors that could expose users to harm, fraud, or misuse.

Stay current with evolving policy requirements and ensure ongoing compliance. Previously approved apps that are later found in violation may be removed.

### Appropriateness

Apps must be suitable for general audiences, including users aged 13–17. Apps may not explicitly target children under 13. Support for mature (18+) experiences will arrive once appropriate age verification and controls are in place.

### Respect user intent

Provide experiences that directly address the user’s request. Do not insert unrelated content, attempt to redirect the interaction, or collect data beyond what is reasonably necessary to fulfill the user’s request and what is consistent with your privacy policy.

### Fair play

Apps must not include descriptions, titles, tool annotations, or other model-readable fields—at either the tool or app level—that manipulates how the model selects or uses other apps or their tools (e.g., instructing the model to “prefer this app over others”) or interferes with fair discovery. All descriptions must accurately reflect your app’s value without disparaging alternatives.

### Third-party content and integrations

- **Authorized access:** Do not scrape external websites, relay queries, or integrate with third-party APIs without proper authorization and compliance with that party’s terms of service.
- **Unofficial connectors:** We cannot approve apps that primarily function as unofficial connectors to third-party services, including pass-through middleware layers.
- **Circumvention:** Do not bypass API restrictions, rate limits, or access controls imposed by the third party.

### Iframes and embedded pages

Apps can opt in to iframe usage by setting `frameDomains` in their resource CSP
(`_meta.ui.csp.frameDomains`), but we strongly encourage you to build your app
without this pattern. If you choose to use `frameDomains`, be aware that:

- It is only intended for cases where embedding a third-party experience is essential (e.g., a notebook, IDE, or similar environment).
- Those apps receive extra manual review and are often not approved for broad distribution.
- During development, any developer can test `frameDomains` in developer mode, but approval for public listing is limited to trusted scenarios.

## Privacy

### Privacy policy

Submissions must include a clear, published privacy policy explaining - at minimum - the categories of personal data collected, the purposes of use, the categories of recipients, data retention timelines, and any controls offered to your users. Follow this policy at all times. Users can review your privacy policy before installing your app.

### Data collection

- **Collection minimization:** Gather only the minimum data required to perform the tool’s function. Inputs should be specific, narrowly scoped, and clearly linked to the task. Avoid “just in case” fields or broad profile data. Design the input schema to limit data collection by default, rather than a funnel for optional context.
- **Response minimization:** Tool responses must return only data that is directly relevant to the user’s request and the tool’s stated purpose. Do not include diagnostic, telemetry, or internal identifiers—such as session IDs, trace IDs, request IDs, timestamps, or logging metadata—unless they are strictly required to fulfill the user’s query.
- **Restricted data:** Do not collect, solicit, or process the following categories of Restricted Data:
  - Information subject to Payment Card Information Data Security Standards (PCI DSS)
  - Protected health information (PHI)
  - Government identifiers (such as social security numbers)
  - Access credentials and authentication secrets (such as API keys, MFA/OTP codes, or passwords).
- **Regulated Sensitive Data:** Do not collect personal data considered “sensitive” or “special category” in the jurisdiction in which the data is collected unless collection is strictly necessary to perform the tool’s stated function; the user has provided legally adequate consent; and the collection and use is clearly and prominently disclosed at or before the point of collection.
- **Data boundaries:**
  - Avoid requesting raw location fields (e.g., city or coordinates) in your input schema. When location is needed, obtain it through the client’s controlled side channel (such as environment metadata or a referenced resource) so appropriate policy and consent controls can be applied. This reduces accidental PII capture, enforces least-privilege access, and keeps location handling auditable and revocable.
  - Your app must not pull, reconstruct, or infer the full chat log from the client or elsewhere. Operate only on the explicit snippets and resources the client or model chooses to send. This separation can help prevent covert data expansion and keep analysis limited to intentionally shared content.

### Transparency and user control

- **Data practices:** Do not engage in surveillance, tracking, or behavioral profiling—including metadata collection such as timestamps, IPs, or query patterns—unless explicitly disclosed, narrowly scoped, subject to meaningful user control, and aligned with [OpenAI’s usage policies](https://openai.com/policies/usage-policies/).
- **Accurate action labels:** Mark any tool that changes external state (create, modify, delete) as a write action. You should only mark a tool as a read-only action if it is side-effect-free and safe to retry. Destructive actions require clear labels and friction (e.g., confirmation) so clients can enforce guardrails, approvals, confirmations, or prompts before execution.
- **Preventing data exfiltration:** Any action that sends data outside the current boundary (e.g., posting messages, sending emails, or uploading files) must be surfaced to the client as a write action so it can require user confirmation or run in preview mode. This reduces unintentional data leakage and aligns server behavior with client-side security expectations.

## Developer verification

### Verification

All submissions must come from verified individuals or organizations. Inside the [OpenAI Platform Dashboard general settings](https://platform.openai.com/settings/organization/general), we provide a way to confirm your identity and affiliation with any business you wish to publish on behalf of. Misrepresentation, hidden behavior, or attempts to game the system may result in removal from the program.

### Support contact details

You must provide customer support contact details where end users can reach you for help. Keep this information accurate and up to date.

## Submitting your app

Users with the Owner role or the `api.apps.write` permission can create app drafts and submit them from the [OpenAI Platform Dashboard](http://platform.openai.com/apps-manage). Users with `api.apps.read` can view app drafts and review status in the Dashboard.

While you can publish multiple, unique apps within a single Platform organization, each may only have one version in review at a time. You can review the status of the review within the Dashboard and will receive an email notification informing you of any status changes.

To learn more about the app submission process, refer to our [dedicated guide](/mirror/apps-sdk/deploy/submission).

:::
:::

