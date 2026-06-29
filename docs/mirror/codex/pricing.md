---
title: "Codex 定价"
description: "Codex is included in your ChatGPT Free, Go, Plus, Pro, Business, Edu, or Enterprise plan"
outline: deep
---

# Codex 定价

**文档集**：Codex<br>
**分组**：价格<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/pricing](https://developers.openai.com/codex/pricing)
- Markdown 来源：[https://developers.openai.com/codex/pricing.md](https://developers.openai.com/codex/pricing.md)
- 抓取时间：2026-06-27T05:55:05.124Z
- Checksum：`d54abb2fc26253d081dd103c3e65821962182c16cc346d5861446736c96df37b`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
价格选项

&lt;ContentSwitcher
  id="codex-pricing-plans"
  initialValue="individual"
  options={[
    {
      label: "个人",
      value: "individual",
    },
    {
      label: "Business / Enterprise",
      value: "business-enterprise",
    },
  ]}
&gt;


      &lt;PricingCard
        name="Free"
        subtitle="在快速编码任务中探索 Codex 能力。"
        price="$0"
        interval="/月"
        ctaLabel="获取 Free"
        ctaHref="https://chatgpt.com/plans/free/"
      /&gt;
      &lt;PricingCard
        name="Go"
        subtitle="将 Codex 用于轻量级编码任务。"
        price="$8"
        interval="/月"
        ctaLabel="获取 Go"
        ctaHref="https://chatgpt.com/plans/go"
      /&gt;
      &lt;PricingCard
        name="Plus"
        subtitle="每周支持几次聚焦的编码会话。"
        price="$20"
        interval="/月"
        ctaLabel="获取 Plus"
        ctaHref="https://chatgpt.com/explore/plus?utm_internal_source=openai_developers_codex"
      &gt;
        - 在 Web、CLI、IDE extension 和 iOS 上使用 Codex
        - 自动 code review 和 Slack integration 等 cloud-based integrations
        - 最新模型，包括 GPT-5.5、GPT-5.4 和 GPT-5.4 mini
        - 使用 GPT-5.4 mini，为常规 local messages 获得更高 usage limits
        - 使用 [ChatGPT credits](/mirror/codex/pricing#credits-overview) 灵活扩展用量
        - 作为 Plus plan 的一部分提供其他 [ChatGPT features](https://chatgpt.com/pricing)

      &lt;PricingCard
        name="Pro"
        subtitle="选择比 Plus 高 5x 或 20x 的 rate limits。"
        priceEyebrow="起价"
        price="$100"
        interval="/月"
        ctaLabel="获取 Pro"
        ctaHref="https://chatgpt.com/explore/pro?utm_internal_source=openai_developers_codex"
        highlight="包含 Plus 的全部内容，另加："
        footnoteLabel="*了解两个档位的限制详情。"
        footnoteHref="https://help.openai.com/en/articles/9793128-about-chatgpt-pro-plans"
      &gt;
        - 访问 GPT-5.3-Codex-Spark（research preview），这是一个用于日常编码任务的快速 Codex 模型
        - Codex 用量比 Plus 多 5x 或 20x*
        - 作为 Pro plan 的一部分提供其他 [ChatGPT features](https://chatgpt.com/pricing)

      &lt;PricingCard
        name="API Key"
        subtitle="非常适合 CI 等共享环境中的自动化。"
        price=""
        interval=""
        ctaLabel="了解更多"
        ctaHref="/codex/auth"
        highlight=""
      &gt;
        - 在 CLI、SDK 或 IDE extension 中使用 Codex
        - 不包含 cloud-based features（GitHub code review、Slack 等）
        - 模型可用性遵循你的 key 可用的 API models
        - 只根据 [API pricing](https://platform.openai.com/docs/pricing)，为 Codex 使用的 tokens 付费







      &lt;PricingCard
        name="Business"
        subtitle="将 Codex 带入你的初创公司或成长型企业。"
        price="$20"
        interval="/ 用户 / 月*"
        ctaLabel="获取 Business"
        ctaHref="https://chatgpt.com/team-sign-up"
        footnoteLabel="*2 位及以上用户，按年计费。按月计费时为每用户每月 25 美元。"
      &gt;
        - 在桌面和移动 app 中访问 ChatGPT 和 Codex
        - 更大的 virtual machines，让 cloud tasks 运行更快
        - 使用 [ChatGPT credits](/mirror/codex/pricing#credits-overview) 灵活扩展用量
        - 安全、专用的 workspace，包含必要的 admin controls、SAML SSO 和 MFA
        - 默认不使用你的 business data 进行训练。[了解更多](https://openai.com/business-data/)
        - 作为 Business plan 的一部分提供其他 [ChatGPT features](https://chatgpt.com/pricing)

      &lt;PricingCard
        name="Enterprise & Edu"
        subtitle="通过 enterprise-grade 功能为你的整个组织解锁 Codex。"
        interval=""
        ctaLabel="联系销售"
        ctaHref="https://chatgpt.com/contact-sales?utm_internal_source=openai_developers_codex"
        highlight="包含 Business 的全部内容，另加："
      &gt;
        - 优先 request processing
        - Enterprise-level security 和 controls，包括 SCIM、EKM、user analytics、domain verification，以及 role-based access control ([RBAC](https://help.openai.com/en/articles/11750701-rbac))
        - 通过 [Compliance API](https://chatgpt.com/admin/api-reference#tag/Codex-Tasks) 提供 audit logs 和 usage monitoring
        - Data retention 和 data residency controls
        - 作为 Enterprise plan 的一部分提供其他 [ChatGPT features](https://chatgpt.com/pricing)




      &lt;PricingCard
        class="codex-pricing-card--span-two"
        name="API Key"
        subtitle="非常适合 CI 等共享环境中的自动化。"
        price=""
        interval=""
        ctaLabel="了解更多"
        ctaHref="/codex/auth"
        highlight=""
      &gt;
        - 在 CLI、SDK 或 IDE extension 中使用 Codex
        - 不包含 cloud-based features（GitHub code review、Slack 等）
        - 模型可用性遵循你的 key 可用的 API models
        - 只根据 [API pricing](https://platform.openai.com/docs/pricing)，为 Codex 使用的 tokens 付费






## 邀请朋友和同事

符合条件的用户可以从 app 左下角的 profile menu 发送 Codex invitations。在符合条件的 personal plan 上选择 **Invite a friend**，或在符合条件的 Business workspace 中选择 **Invite a coworker**，输入收件人的电子邮件地址并发送邀请。

Invitation dialog 会显示你当前计划或 promotion 的当前 reward、recipient requirements、invite limits，以及 rewards 何时过期。Personal 和 Business referral programs 有各自独立的 rewards 和 eligibility rules。ChatGPT Enterprise 目前不支持 referrals。

从 2026 年 6 月 11 日到 2026 年 6 月 24 日，符合条件的 Plus 和 Pro 用户最多可以邀请三位朋友。当符合条件的收件人发送第一条 Codex message 时，双方都会获得一次 banked rate-limit reset。Banked rate-limit resets 可在发放后的 30 天内使用。Business referrals 使用单独的 shared-workspace credit rewards；发送邀请前请查看[当前条款](https://help.openai.com/en/articles/20001271)。

## 常见问题

### Sites 的费用是多少？

[Sites](/mirror/codex/sites) 在 preview 期间免费。Pricing information 将很快提供。

### 我的 plan 有哪些 usage limits？

你可以发送的 Codex messages 数量取决于所用模型、编码任务的规模和复杂度，以及你是在本地还是在 cloud 中运行它们。小脚本或常规函数可能只消耗你额度的一小部分，而更大的代码库、long-running tasks，或需要 Codex 保持更多上下文的 extended sessions，会显著增加每条 message 的用量。

GPT-5.5 使用显著更少的 tokens，即可达到与 GPT-5.4 可比的结果。它的 Codex setup 运行更快，并为大多数用户提供更高质量结果。尽管 GPT-5.5 是能力显著更强的模型，这些效率提升仍支持慷慨的 usage limits。


  &lt;ContentSwitcher
    id="codex-usage-limits"
    initialValue="plus"
    align="right"
    options={[
      {
        label: "Plus",
        value: "plus",
      },
      {
        label: "Pro 5x",
        value: "pro",
      },
      {
        label: "Pro 20x",
        value: "pro-20x",
      },
      {
        label: "Business",
        value: "business",
      },
      {
        label: "API Key",
        value: "api-key",
      },
    ]}
  &gt;

Plus






              Local Messages[\*](/mirror/codex/pricing#shared-limits-plus) / 5h


              Cloud Tasks[\*](/mirror/codex/pricing#shared-limits-plus) / 5h


              Code Reviews / 5h





GPT-5.5
15-80
不可用
不可用


GPT-5.4
20-100
不可用
不可用


GPT-5.4 mini
60-350
不可用
不可用






                *Local messages 和 cloud tasks 的 usage limits 共享一个 **five-hour window**。还可能适用额外 weekly limits。





              对于采用 flexible pricing 的 Enterprise/Edu 用户，没有固定 rate limits，usage 会随 [credits](/mirror/codex/pricing#credits-overview) 扩展




              未采用 flexible pricing 的 Enterprise 和 Edu plans 在大多数功能上的 per-seat usage limits 与 Plus 相同






Pro 5x






              Local Messages[\*](/mirror/codex/pricing#shared-limits-pro) / 5h


              Cloud Tasks[\*](/mirror/codex/pricing#shared-limits-pro) / 5h


              Code Reviews / 5h





GPT-5.5
75-400
不可用
不可用


GPT-5.4
100-500
不可用
不可用


GPT-5.4 mini
300-1750
不可用
不可用






                *Local messages 和 cloud tasks 的 usage limits 共享一个 **five-hour window**。还可能适用额外 weekly limits。





              对于采用 flexible pricing 的 Enterprise/Edu 用户，没有固定 rate limits，usage 会随 [credits](/mirror/codex/pricing#credits-overview) 扩展




              未采用 flexible pricing 的 Enterprise 和 Edu plans 在大多数功能上的 per-seat usage limits 与 Plus 相同






Pro 20x






              Local Messages[\*](/mirror/codex/pricing#shared-limits-pro-20x) / 5h


              Cloud Tasks[\*](/mirror/codex/pricing#shared-limits-pro-20x) / 5h


              Code Reviews / 5h





GPT-5.5
300-1600
不可用
不可用


GPT-5.4
400-2000
不可用
不可用


GPT-5.4 mini
1200-7000
不可用
不可用






                *Local messages 和 cloud tasks 的 usage limits 共享一个 **five-hour window**。还可能适用额外 weekly limits。





              对于采用 flexible pricing 的 Enterprise/Edu 用户，没有固定 rate limits，usage 会随 [credits](/mirror/codex/pricing#credits-overview) 扩展




              未采用 flexible pricing 的 Enterprise 和 Edu plans 在大多数功能上的 per-seat usage limits 与 Plus 相同






Business






              Local Messages[\*](/mirror/codex/pricing#shared-limits-business) / 5h


              Cloud Tasks[\*](/mirror/codex/pricing#shared-limits-business) / 5h


              Code Reviews / 5h





GPT-5.5
15-80
不可用
不可用


GPT-5.4
20-100
不可用
不可用


GPT-5.4 mini
60-350
不可用
不可用






                *Local messages 和 cloud tasks 的 usage limits 共享一个 **five-hour window**。还可能适用额外 weekly limits。





              对于采用 flexible pricing 的 Enterprise/Edu 用户，没有固定 rate limits，usage 会随 [credits](/mirror/codex/pricing#credits-overview) 扩展




              未采用 flexible pricing 的 Enterprise 和 Edu plans 在大多数功能上的 per-seat usage limits 与 Plus 相同






API Key






              Local Messages[\*](/mirror/codex/pricing#shared-limits-api-key) / 5h


              Cloud Tasks[\*](/mirror/codex/pricing#shared-limits-api-key) / 5h


              Code Reviews / 5h





GPT-5.5

              [按用量计费](https://platform.openai.com/docs/pricing)

不可用
不可用


GPT-5.4

              [按用量计费](https://platform.openai.com/docs/pricing)

不可用
不可用


GPT-5.4 mini

              [按用量计费](https://platform.openai.com/docs/pricing)

不可用
不可用






                *Local messages 和 cloud tasks 的 usage limits 共享一个 **five-hour window**。还可能适用额外 weekly limits。





              对于采用 flexible pricing 的 Enterprise/Edu 用户，没有固定 rate limits，usage 会随 [credits](/mirror/codex/pricing#credits-overview) 扩展




              未采用 flexible pricing 的 Enterprise 和 Edu plans 在大多数功能上的 per-seat usage limits 与 Plus 相同









一旦 agentic features 的定价生效，Codex usage limits 会与其他 agentic features 共享。目前这包括 Plus 和 Pro 上的 [ChatGPT for Excel](https://help.openai.com/articles/20001063)。

Speed configurations 会增加所有适用模型的 credit consumption，因此它们也会更快使用 included limits。Fast mode 会让受支持模型以更高费率消耗 credits。受支持模型和费率请参阅 [Speed](/mirror/codex/speed)。Image generations 平均也会让 included limits 消耗速度提高约 3-5x，具体取决于 image quality 和 size。GPT-5.3-Codex-Spark 仅面向 ChatGPT Pro 用户处于 research preview，发布时不在 API 中提供。由于它运行在 specialized low-latency hardware 上，其用量由单独的 usage limit 管理，且可能根据 demand 调整。

### 达到 usage limits 后会发生什么？

我们希望你能完成已经在进行中的工作。如果你在 active turn 期间达到 usage limits，agent 将能够继续处理该 turn，但仍受 fair use limits 约束。

达到 usage limit 的 ChatGPT Plus 和 Pro 用户可以购买额外 credits 继续工作，而无需升级现有 plan。

采用 [flexible pricing](https://help.openai.com/en/articles/11487671-flexible-pricing-for-the-enterprise-edu-and-business-plans) 的 Business、Edu 和 Enterprise plans 可以购买额外 workspace credits 继续使用 Codex。

如果你正在接近 usage limits，也可以切换到更小的模型，让 usage limits 使用更久。

所有用户也可以使用 API key 运行额外 local tasks，并按[标准 API 费率](https://platform.openai.com/docs/pricing)计费。



### Image generation 如何计入 usage limits？

Image generation 会计入与 local messages 和 cloud tasks 相同的一般 Codex usage limits。平均而言，image generations 消耗 included limits 的速度会比不包含 image generation 的类似 turns 快 3-5x，具体取决于 image quality 和 size。达到 included limits 后，image generation 也会从 [credits](/mirror/codex/pricing#credits-overview) 中扣除。

Free plan 不提供 image generation。当你使用 API key 调用 Codex 时，image generation 适用 API pricing，而不是 included ChatGPT usage limits。

### 在哪里查看当前 usage limits？

你可以在 [Codex usage dashboard](https://chatgpt.com/codex/settings/usage) 中查看当前 limits。如果你想在 active Codex CLI session 中查看剩余 limits，可以使用 `/status`。

### Credits 如何工作？

Credits 让你在达到 included usage limits 后继续使用 Codex。Usage 会根据你使用的模型和功能，从可用 credits 中扣除，使你能够不中断地扩展工作。

Codex credit usage 基于 API token-based rates。Credits 仍是客户购买和消费的核心 pricing unit，但用量会按你的 workspace 消耗的每百万 input tokens、cached input tokens 和 output tokens 对应的 credits 计算。请在[这里](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)阅读 tokens 相关说明。

下面的 rate card 显示 Codex models 和 features 每百万 tokens 的 credit cost。

少数 Enterprise customers 应继续使用 legacy rate card，直到我们将你迁移到 Codex 新的 token-based pricing。更多信息请[联系 OpenAI 销售](https://chatgpt.com/contact-sales?utm_internal_source=openai_developers_codex)。





每 1M tokens 的 credits

          Input Tokens


          Cached input tokens


          Output Tokens





GPT-5.5
125 credits
12.50 credits
750 credits


GPT-5.4
62.50 credits
6.250 credits
375 credits


GPT-5.4 mini
18.75 credits
1.875 credits
113 credits


GPT-5.3-Codex-Spark

          research preview



GPT-Image-2 (image)
200 credits
50 credits
750 credits


GPT-Image-2 (text)
125 credits
31.25 credits
250 credits





          GPT-5.5 用量平均为每条 message 5-45 credits。




          Fast mode 会让受支持模型以更高费率消耗 credits。费率请参阅
          &lt;a href="/codex/speed"&gt;Speed&lt;/a&gt;。






Speed configurations 会增加所有适用模型的 credit consumption。Fast mode 会让受支持模型以更高费率消耗 credits。受支持模型和费率请参阅 [Speed](/mirror/codex/speed)。

[了解 ChatGPT Plus 和 Pro 中 credits 的更多信息。](https://help.openai.com/en/articles/12642688)

[了解 ChatGPT Business、Enterprise 和 Edu 中 credits 的更多信息。](https://help.openai.com/en/articles/11487671-flexible-pricing-for-the-enterprise-edu-and-business-plans)

### 什么会计为 Code Review usage？

Code Review usage 仅在 Codex 通过 GitHub 运行 reviews 时适用。例如，你在 pull request 中 tag `@Codex` 请求 review，或在 repository 上启用 automatic reviews。在本地或 GitHub 之外运行的 reviews 会计入你的一般 usage limits。

### 我可以怎样让 usage limits 使用更久？

上面的 usage limits 和 credits 是平均费率。你可以尝试以下建议来最大化 limits：

- **控制 prompts 的大小。** 给 Codex 的 instructions 要精确，但移除不必要上下文。
- **减小 AGENTS.md 的大小。** 如果你在较大项目中工作，可以通过在 repository 中[嵌套 AGENTS.md files](/mirror/codex/guides/agents-md#layer-project-instructions) 来控制注入多少上下文。
- **限制使用的 MCP servers 数量。** 你添加到 Codex 的每个 [MCP](/mirror/codex/mcp) 都会向 messages 添加更多上下文，并使用更多 limit。不需要时请禁用 MCP servers。
- **将 routine tasks 切换到更小模型。** 使用 GPT-5.4 或 GPT-5.4 mini 可以延长 local-message usage limits，具体取决于你从哪个模型切换。

## 功能可用性

&lt;CodexPlanFeatureMatrix
  client:load
  data=&#123;&#123;
    plans: [
      { id: "plus", shortLabel: "Plus", label: "ChatGPT Plus" },
      { id: "pro", shortLabel: "Pro", label: "ChatGPT Pro" },
      {
        id: "business",
        shortLabel: "Business",
        label: "ChatGPT Business",
      },
      {
        id: "enterprise",
        shortLabel: "Enterprise",
        label: "Enterprise / Education",
      },
      { id: "api", shortLabel: "API Key", label: "API Key" },
    ],
    sections: [
      {
        title: "访问和使用界面",
        features: [
          {
            name: "Codex web",
            href: "/codex/cloud",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "用于 local tasks 的 Codex app",
            href: "/codex/app",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Codex CLI",
            href: "/codex/cli",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "IDE extension",
            href: "/codex/ide",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Codex SDK、`codex exec` 和 scriptable workflows",
            shortName: "Codex SDK 和 scripting",
            href: "/codex/sdk",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "用于 trusted automation 的 Codex access tokens",
            shortName: "Automation access tokens",
            href: "/codex/enterprise/access-tokens",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
        ],
      },
      {
        title: "模型和多模态",
        features: [
          {
            name: "Fast mode",
            href: "/codex/speed",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Codex-Spark research preview",
            href: "/codex/models",
            availability: {
              plus: "unavailable",
              pro: "available",
              business: "unavailable",
              enterprise: "unavailable",
              api: "unavailable",
            },
          },
          {
            name: "Image generation 和 editing",
            href: "/codex/app/features#image-generation",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Voice dictation",
            href: "/codex/app/features#voice-dictation",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Web search",
            href: "/codex/app/features#web-search",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
        ],
      },
      {
        title: "本地功能",
        features: [
          {
            name: "使用 `/review` 进行 local code review",
            shortName: "Local code review",
            href: "/codex/workflows#do-a-local-code-review",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Approval requests 的 auto-review",
            href: "/codex/concepts/sandboxing/auto-review",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Sandboxing 和 permission controls",
            href: "/codex/permissions",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Project 和 standalone app automations",
            shortName: "App automations",
            href: "/codex/app/automations",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Automations",
            href: "/codex/app/automations",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Worktrees 和内置 Git tools",
            shortName: "内置 Git tools",
            href: "/codex/app/worktrees",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Local environments 和 repeatable actions",
            shortName: "Repeatable actions",
            href: "/codex/app/local-environments",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Appshots",
            href: "/codex/appshots",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "unavailable",
              api: "available",
            },
          },
        ],
      },
      {
        title: "浏览器和远程控制",
        features: [
          {
            name: "In-app browser previews 和 comments",
            shortName: "In-app browser",
            href: "/codex/app/browser",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Browser Use automation",
            href: "/codex/app/browser#browser-use",
            availability: {
              plus: "limited",
              pro: "limited",
              business: "limited",
              enterprise: "limited",
              api: "limited",
            },
          },
          {
            name: "Chrome extension browser control",
            shortName: "Chrome browser control",
            href: "/codex/app/chrome-extension",
            availability: {
              plus: "limited",
              pro: "limited",
              business: "limited",
              enterprise: "limited",
              api: "limited",
            },
          },
          {
            name: "Computer Use",
            href: "/codex/app/computer-use",
            limitedFootnote: "region",
            availability: {
              plus: "limited",
              pro: "limited",
              business: "limited",
              enterprise: "limited",
              api: "limited",
            },
          },
          {
            name: "Record & Replay (macOS)",
            shortName: "Record & Replay",
            href: "/codex/record-and-replay",
            limitedFootnote: "region",
            availability: {
              plus: "limited",
              pro: "limited",
              business: "limited",
              enterprise: "limited",
              api: "limited",
            },
          },
          {
            name: "SSH remote connections",
            shortName: "SSH remote",
            href: "/codex/remote-connections#connect-to-an-ssh-host",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Mobile remote control",
            href: "/codex/remote-connections",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
        ],
      },
      {
        title: "自定义和扩展",
        features: [
          {
            name: "使用 `AGENTS.md` 的 custom instructions",
            shortName: "Custom instructions",
            href: "/codex/guides/agents-md",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Skills",
            href: "/codex/skills",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Plugins",
            href: "/codex/plugins",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "limited",
            },
            limitedFootnote: "plugins",
          },
          {
            name: "Plugin sharing",
            href: "/codex/plugins/build#share-a-local-plugin-with-your-workspace",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "App connectors",
            href: "/codex/plugins",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "MCP",
            href: "/codex/mcp",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Subagents 和 custom agents",
            shortName: "Subagents",
            href: "/codex/subagents",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Memories",
            href: "/codex/memories",
            availability: {
              plus: "limited",
              pro: "limited",
              business: "limited",
              enterprise: "limited",
              api: "limited",
            },
          },
          {
            name: "Chronicle",
            href: "/codex/memories/chronicle",
            availability: {
              plus: "unavailable",
              pro: "limited",
              business: "unavailable",
              enterprise: "unavailable",
              api: "unavailable",
            },
          },
        ],
      },
      {
        title: "Cloud 和 integrations",
        features: [
          {
            name: "Codex cloud tasks",
            shortName: "Cloud tasks",
            href: "/codex/cloud",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Cloud environments 和 setup scripts",
            shortName: "Cloud environments",
            href: "/codex/cloud/environments",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Cloud agent internet access controls",
            shortName: "Internet controls",
            href: "/codex/cloud/internet-access",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Sites",
            href: "/codex/sites",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "通过 `@codex` 委托 GitHub issue 和 PR",
            shortName: "GitHub delegation",
            href: "/codex/integrations/github#give-codex-other-tasks",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "GitHub code review 和 automatic PR reviews",
            shortName: "GitHub PR reviews",
            href: "/codex/integrations/github",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Slack cloud integration",
            shortName: "Slack integration",
            href: "/codex/integrations/slack",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Linear cloud integration",
            shortName: "Linear integration",
            href: "/codex/integrations/linear",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
        ],
      },
      {
        title: "Admin、安全和 analytics",
        features: [
          {
            name: "SAML SSO、MFA 和 workspace user management",
            shortName: "Workspace management",
            href: "/codex/enterprise/admin-setup",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "`requirements.toml` managed config",
            shortName: "`requirements.toml` config",
            href: "/codex/enterprise/managed-configuration",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Cloud-managed config policies",
            shortName: "Cloud-managed policies",
            href: "/codex/enterprise/managed-configuration#cloud-managed-requirements",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Codex RBAC 和 custom roles",
            shortName: "RBAC 和 roles",
            href: "/codex/enterprise/admin-setup#step-2-set-up-custom-roles-rbac",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "SCIM、EKM 和 domain verification",
            shortName: "SCIM、EKM 和 domains",
            href: "/codex/enterprise/admin-setup#enterprise-grade-security-and-privacy",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Enterprise retention 和 residency controls",
            shortName: "Retention 和 residency",
            href: "/codex/enterprise/admin-setup#enterprise-grade-security-and-privacy",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "默认不使用 API 或 business data 训练",
            shortName: "默认不训练",
            href: "https://openai.com/business-data/",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Analytics dashboard",
            href: "/codex/enterprise/governance#analytics-dashboard",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Analytics API",
            href: "/codex/enterprise/governance#analytics-api",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Compliance API 和 audit logs",
            shortName: "Compliance 和 audit logs",
            href: "/codex/enterprise/governance#compliance-api",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "适用于已连接 GitHub repositories 的 Codex Security",
            shortName: "Codex Security",
            href: "/codex/security",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
        ],
      },
    ],
  &#125;&#125;
/&gt;

&lt;div
  id="codex-plan-region-limits"
  className="not-prose mt-3 text-sm text-secondary"
&gt;
  &lt;sup&gt;*&lt;/sup&gt; Feature 目前仅限特定地区使用。请查看具体 feature documentation，了解 geo restrictions。

&lt;div
  id="codex-plan-plugin-limits"
  className="not-prose mt-1 text-sm text-secondary"
&gt;
  &lt;sup&gt;†&lt;/sup&gt; 部分 first party plugins 不可用。


:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
<h2 class="sr-only">Pricing options</h2>

<ContentSwitcher
  id="codex-pricing-plans"
  initialValue="individual"
  options={[
    {
      label: "Individual",
      value: "individual",
    },
    {
      label: "Business / Enterprise",
      value: "business-enterprise",
    },
  ]}
>
  <div data-content-switcher-pane data-value="individual">
    <div class="codex-pricing-grid">
      <PricingCard
        name="Free"
        subtitle="Explore Codex capabilities on quick coding tasks."
        price="$0"
        interval="/month"
        ctaLabel="Get Free"
        ctaHref="https://chatgpt.com/plans/free/"
      />
      <PricingCard
        name="Go"
        subtitle="Use Codex for lightweight coding tasks."
        price="$8"
        interval="/month"
        ctaLabel="Get Go"
        ctaHref="https://chatgpt.com/plans/go"
      />
      <PricingCard
        name="Plus"
        subtitle="Power a few focused coding sessions each week."
        price="$20"
        interval="/month"
        ctaLabel="Get Plus"
        ctaHref="https://chatgpt.com/explore/plus?utm_internal_source=openai_developers_codex"
      >
        - Codex on the web, in the CLI, in the IDE extension, and on iOS
        - Cloud-based integrations like automatic code review and Slack
          integration
        - The latest models, including GPT-5.5, GPT-5.4, and GPT-5.4 mini
        - GPT-5.4 mini for higher usage limits on routine local messages
        - Flexibly extend usage with [ChatGPT credits](#credits-overview)
        - Other [ChatGPT features](https://chatgpt.com/pricing) as part of the
          Plus plan
      </PricingCard>
      <PricingCard
        name="Pro"
        subtitle="Choose 5x or 20x higher rate limits than Plus."
        priceEyebrow="From"
        price="$100"
        interval="/month"
        ctaLabel="Get Pro"
        ctaHref="https://chatgpt.com/explore/pro?utm_internal_source=openai_developers_codex"
        highlight="Everything in Plus and:"
        footnoteLabel="*Learn more about limits on both tiers."
        footnoteHref="https://help.openai.com/en/articles/9793128-about-chatgpt-pro-plans"
      >
        - Access to GPT-5.3-Codex-Spark (research preview), a fast Codex model
          for day-to-day coding tasks
        - 5x or 20x more Codex usage than Plus*
        - Other [ChatGPT features](https://chatgpt.com/pricing) as part of the
          Pro plan
      </PricingCard>
      <PricingCard
        name="API Key"
        subtitle="Great for automation in shared environments like CI."
        price=""
        interval=""
        ctaLabel="Learn more"
        ctaHref="/codex/auth"
        highlight=""
      >
        - Codex in the CLI, SDK, or IDE extension
        - No cloud-based features (GitHub code review, Slack, etc.)
        - Model availability follows the API models available to your key
        - Pay only for the tokens Codex uses, based on [API
          pricing](https://platform.openai.com/docs/pricing)
      </PricingCard>
    </div>

  </div>

  <div data-content-switcher-pane data-value="business-enterprise" hidden>
    <div class="codex-pricing-grid">
      <PricingCard
        name="Business"
        subtitle="Bring Codex into your startup or growing business."
        price="$20"
        interval="/ user / month*"
        ctaLabel="Get Business"
        ctaHref="https://chatgpt.com/team-sign-up"
        footnoteLabel="*2+ users, billed annually. $25 per user per month when billed monthly."
      >
        - Access ChatGPT and Codex across desktop and mobile apps
        - Larger virtual machines to run cloud tasks faster
        - Flexibly extend usage with [ChatGPT credits](#credits-overview)
        - A secure, dedicated workspace with essential admin controls, SAML SSO,
          and MFA
        - No training on your business data by default. [Learn
          more](https://openai.com/business-data/)
        - Other [ChatGPT features](https://chatgpt.com/pricing) as part of the
          Business plan
      </PricingCard>
      <PricingCard
        name="Enterprise & Edu"
        subtitle="Unlock Codex for your entire organization with enterprise-grade functionality."
        interval=""
        ctaLabel="Contact sales"
        ctaHref="https://chatgpt.com/contact-sales?utm_internal_source=openai_developers_codex"
        highlight="Everything in Business and:"
      >
        - Priority request processing
        - Enterprise-level security and controls, including SCIM, EKM, user
          analytics, domain verification, and role-based access control
          ([RBAC](https://help.openai.com/en/articles/11750701-rbac))
        - Audit logs and usage monitoring via the [Compliance
          API](https://chatgpt.com/admin/api-reference#tag/Codex-Tasks)
        - Data retention and data residency controls
        - Other [ChatGPT features](https://chatgpt.com/pricing) as part of the
          Enterprise plan
      </PricingCard>
    </div>

    <div class="mt-8 mb-10 codex-pricing-grid">
      <PricingCard
        class="codex-pricing-card--span-two"
        name="API Key"
        subtitle="Great for automation in shared environments like CI."
        price=""
        interval=""
        ctaLabel="Learn more"
        ctaHref="/codex/auth"
        highlight=""
      >
        - Codex in the CLI, SDK, or IDE extension
        - No cloud-based features (GitHub code review, Slack, etc.)
        - Model availability follows the API models available to your key
        - Pay only for the tokens Codex uses, based on [API
          pricing](https://platform.openai.com/docs/pricing)
      </PricingCard>
    </div>

  </div>
</ContentSwitcher>

## Invite friends and coworkers

Eligible users can send Codex invitations from the profile menu in the
lower-left corner of the app. Choose **Invite a friend** on an eligible personal
plan or **Invite a coworker** in an eligible Business workspace, enter the
recipient's email address, and send the invitation.

The invitation dialog shows the current reward, recipient requirements, invite
limits, and when rewards expire for your plan or promotion. Personal and
Business referral programs have separate rewards and eligibility rules.
Referrals aren't currently available for ChatGPT Enterprise.

From June 11 through June 24, 2026, eligible Plus and Pro users can invite up to
three friends. When an eligible recipient sends their first Codex message, both
people receive a banked rate-limit reset. Banked rate-limit resets are usable for
30 days after they're granted. Business referrals use separate shared-workspace
credit rewards; review the
[current terms](https://help.openai.com/en/articles/20001271) before you send an
invitation.

## Frequently asked questions

### How much does Sites cost?

[Sites](https://developers.openai.com/codex/sites) is free while in preview. Pricing information will be
available soon.

### What are the usage limits for my plan?

The number of Codex messages you can send depends on the model used, size and
complexity of your coding tasks and whether you run them locally or in the
cloud. Small scripts or routine functions may consume only a fraction of your
allowance, while larger codebases, long-running tasks, or extended sessions that
require Codex to hold more context will use significantly more per message.

GPT-5.5 uses significantly fewer tokens to achieve results comparable to
GPT-5.4. Its Codex setup runs faster and delivers higher-quality results for
most users. These efficiency gains support generous usage limits despite
GPT-5.5 being a significantly more capable model.

<div id="usage-limits">
  <ContentSwitcher
    id="codex-usage-limits"
    initialValue="plus"
    align="right"
    options={[
      {
        label: "Plus",
        value: "plus",
      },
      {
        label: "Pro 5x",
        value: "pro",
      },
      {
        label: "Pro 20x",
        value: "pro-20x",
      },
      {
        label: "Business",
        value: "business",
      },
      {
        label: "API Key",
        value: "api-key",
      },
    ]}
  >
    <div data-content-switcher-pane data-value="plus">
      <div class="hidden">Plus</div>

      <table>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col" style="text-align:center">
              Local Messages[\*](#shared-limits-plus) / 5h
            </th>
            <th scope="col" style="text-align:center">
              Cloud Tasks[\*](#shared-limits-plus) / 5h
            </th>
            <th scope="col" style="text-align:center">
              Code Reviews / 5h
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GPT-5.5</td>
            <td style="text-align:center">15-80</td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
          <tr>
            <td>GPT-5.4</td>
            <td style="text-align:center">20-100</td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
          <tr>
            <td>GPT-5.4 mini</td>
            <td style="text-align:center">60-350</td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:center">
              <a id="shared-limits-plus" class="footnote">
                *The usage limits for local messages and cloud tasks share a
                **five-hour window**. Additional weekly limits may apply.
              </a>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              For Enterprise/Edu users with flexible pricing, there are no
              fixed rate limits - usage scales with
              [credits](#credits-overview)
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              Enterprise and Edu plans without flexible pricing have the same
              per-seat usage limits as Plus for most features
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div data-content-switcher-pane data-value="pro" hidden>
      <div class="hidden">Pro 5x</div>

      <table>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col" style="text-align:center">
              Local Messages[\*](#shared-limits-pro) / 5h
            </th>
            <th scope="col" style="text-align:center">
              Cloud Tasks[\*](#shared-limits-pro) / 5h
            </th>
            <th scope="col" style="text-align:center">
              Code Reviews / 5h
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GPT-5.5</td>
            <td style="text-align:center">75-400</td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
          <tr>
            <td>GPT-5.4</td>
            <td style="text-align:center">100-500</td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
          <tr>
            <td>GPT-5.4 mini</td>
            <td style="text-align:center">300-1750</td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:center">
              <a id="shared-limits-pro" class="footnote">
                *The usage limits for local messages and cloud tasks share a
                **five-hour window**. Additional weekly limits may apply.
              </a>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              For Enterprise/Edu users with flexible pricing, there are no
              fixed rate limits - usage scales with
              [credits](#credits-overview)
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              Enterprise and Edu plans without flexible pricing have the same
              per-seat usage limits as Plus for most features
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div data-content-switcher-pane data-value="pro-20x" hidden>
      <div class="hidden">Pro 20x</div>

      <table>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col" style="text-align:center">
              Local Messages[\*](#shared-limits-pro-20x) / 5h
            </th>
            <th scope="col" style="text-align:center">
              Cloud Tasks[\*](#shared-limits-pro-20x) / 5h
            </th>
            <th scope="col" style="text-align:center">
              Code Reviews / 5h
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GPT-5.5</td>
            <td style="text-align:center">300-1600</td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
          <tr>
            <td>GPT-5.4</td>
            <td style="text-align:center">400-2000</td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
          <tr>
            <td>GPT-5.4 mini</td>
            <td style="text-align:center">1200-7000</td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:center">
              <a id="shared-limits-pro-20x" class="footnote">
                *The usage limits for local messages and cloud tasks share a
                **five-hour window**. Additional weekly limits may apply.
              </a>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              For Enterprise/Edu users with flexible pricing, there are no
              fixed rate limits - usage scales with
              [credits](#credits-overview)
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              Enterprise and Edu plans without flexible pricing have the same
              per-seat usage limits as Plus for most features
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div data-content-switcher-pane data-value="business" hidden>
      <div class="hidden">Business</div>

      <table>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col" style="text-align:center">
              Local Messages[\*](#shared-limits-business) / 5h
            </th>
            <th scope="col" style="text-align:center">
              Cloud Tasks[\*](#shared-limits-business) / 5h
            </th>
            <th scope="col" style="text-align:center">
              Code Reviews / 5h
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GPT-5.5</td>
            <td style="text-align:center">15-80</td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
          <tr>
            <td>GPT-5.4</td>
            <td style="text-align:center">20-100</td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
          <tr>
            <td>GPT-5.4 mini</td>
            <td style="text-align:center">60-350</td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:center">
              <a id="shared-limits-business" class="footnote">
                *The usage limits for local messages and cloud tasks share a
                **five-hour window**. Additional weekly limits may apply.
              </a>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              For Enterprise/Edu users with flexible pricing, there are no
              fixed rate limits - usage scales with
              [credits](#credits-overview)
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              Enterprise and Edu plans without flexible pricing have the same
              per-seat usage limits as Plus for most features
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div data-content-switcher-pane data-value="api-key" hidden>
      <div class="hidden">API Key</div>

      <table>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col" style="text-align:center">
              Local Messages[\*](#shared-limits-api-key) / 5h
            </th>
            <th scope="col" style="text-align:center">
              Cloud Tasks[\*](#shared-limits-api-key) / 5h
            </th>
            <th scope="col" style="text-align:center">
              Code Reviews / 5h
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GPT-5.5</td>
            <td style="text-align:center">
              [Usage-based](https://platform.openai.com/docs/pricing)
            </td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
          <tr>
            <td>GPT-5.4</td>
            <td style="text-align:center">
              [Usage-based](https://platform.openai.com/docs/pricing)
            </td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
          <tr>
            <td>GPT-5.4 mini</td>
            <td style="text-align:center">
              [Usage-based](https://platform.openai.com/docs/pricing)
            </td>
            <td style="text-align:center">Not available</td>
            <td style="text-align:center">Not available</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:center">
              <a id="shared-limits-api-key" class="footnote">
                *The usage limits for local messages and cloud tasks share a
                **five-hour window**. Additional weekly limits may apply.
              </a>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              For Enterprise/Edu users with flexible pricing, there are no
              fixed rate limits - usage scales with
              [credits](#credits-overview)
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              Enterprise and Edu plans without flexible pricing have the same
              per-seat usage limits as Plus for most features
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

  </ContentSwitcher>
</div>

Codex usage limits are shared with other agentic features once pricing for
those features is effective. This currently includes [ChatGPT for
Excel](https://help.openai.com/articles/20001063) on Plus and Pro.

Speed configurations increase credit consumption for all applicable models, so
they also use included limits faster. Fast mode consumes credits at a higher
rate for supported models. See [Speed](https://developers.openai.com/codex/speed) for supported models and
rates. Image generations also use included limits ~3-5x faster on average,
depending on image quality and size. GPT-5.3-Codex-Spark is in research preview
for ChatGPT Pro users only, and isn't available in the API at launch. Because it
runs on specialized low-latency hardware, usage is governed by a separate usage
limit that may adjust based on demand.

### What happens when you hit usage limits?

We want you to be able to complete work already in progress. If you reach your
usage limits during an active turn, the agent will be able to continue working
on that turn, subject to fair use limits.

ChatGPT Plus and Pro users who reach their usage limit can purchase additional
credits to continue working without needing to upgrade their existing plan.

Business, Edu, and Enterprise plans with [flexible
pricing](https://help.openai.com/en/articles/11487671-flexible-pricing-for-the-enterprise-edu-and-business-plans)
can purchase additional workspace credits to continue using Codex.

If you are approaching usage limits, you can also switch to a smaller model to
make your usage limits last longer.

All users may also run extra local tasks using an API key, with usage charged at
[standard API rates](https://platform.openai.com/docs/pricing).

<a id="image-generation-usage-limits"></a>

### How does image generation count toward usage limits?

Image generation counts toward the same general Codex usage limits as local
messages and cloud tasks. Image generations use included limits 3-5x faster on
average than similar turns without image generation, depending on
image quality and size. After you reach your included limits, image generation
also draws from [credits](#credits-overview).

Image generation isn't available on the Free plan. When you use Codex with an
API key, API pricing applies to image generation instead of included ChatGPT
usage limits.

### Where can I see my current usage limits?

You can find your current limits in the [Codex usage
dashboard](https://chatgpt.com/codex/settings/usage). If you want to see your
remaining limits during an active Codex CLI session, you can use `/status`.

### How do credits work?

Credits let you continue using Codex after you reach your included usage
limits. Usage draws down from your available credits based on the models and
features you use, allowing you to extend work without interruption.

Codex credit usage is based on API token-based rates. Credits remain the core
pricing unit that customers purchase and consume, but usage is calculated as
credits per million input tokens, cached input tokens, and output tokens your
workspace consumes. Read about tokens
[here](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them).

The rate card below shows the credit cost per million tokens for Codex models
and features.

A small subset of Enterprise customers should continue using the legacy rate
card until we migrate you to the new token-based pricing for Codex. For more
information, [contact OpenAI
sales](https://chatgpt.com/contact-sales?utm_internal_source=openai_developers_codex).

<div id="credits-overview">
  <table>
    <thead>
      <tr>
        <th scope="col">Credits per 1M tokens</th>
        <th scope="col" style="text-align:center">
          Input Tokens
        </th>
        <th scope="col" style="text-align:center">
          Cached input tokens
        </th>
        <th scope="col" style="text-align:center">
          Output Tokens
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>GPT-5.5</td>
        <td style="text-align:center">125 credits</td>
        <td style="text-align:center">12.50 credits</td>
        <td style="text-align:center">750 credits</td>
      </tr>
      <tr>
        <td>GPT-5.4</td>
        <td style="text-align:center">62.50 credits</td>
        <td style="text-align:center">6.250 credits</td>
        <td style="text-align:center">375 credits</td>
      </tr>
      <tr>
        <td>GPT-5.4 mini</td>
        <td style="text-align:center">18.75 credits</td>
        <td style="text-align:center">1.875 credits</td>
        <td style="text-align:center">113 credits</td>
      </tr>
      <tr>
        <td>GPT-5.3-Codex-Spark</td>
        <td colspan="3" style="text-align:center">
          research preview
        </td>
      </tr>
      <tr>
        <td>GPT-Image-2 (image)</td>
        <td style="text-align:center">200 credits</td>
        <td style="text-align:center">50 credits</td>
        <td style="text-align:center">750 credits</td>
      </tr>
      <tr>
        <td>GPT-Image-2 (text)</td>
        <td style="text-align:center">125 credits</td>
        <td style="text-align:center">31.25 credits</td>
        <td style="text-align:center">250 credits</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align:center">
          GPT-5.5 usage averages 5-45 credits per message.
        </td>
      </tr>
      <tr>
        <td colspan="4" style="text-align:center">
          Fast mode consumes credits at a higher rate for supported models. See
          <a href="/codex/speed">Speed</a> for rates.
        </td>
      </tr>
    </tfoot>
  </table>
</div>

Speed configurations will increase credit consumption for all models that apply.
Fast mode consumes credits at a higher rate for supported models. See
[Speed](https://developers.openai.com/codex/speed) for supported models and rates.

[Learn more about credits in ChatGPT Plus and
Pro.](https://help.openai.com/en/articles/12642688)

[Learn more about credits in ChatGPT Business, Enterprise, and
Edu.](https://help.openai.com/en/articles/11487671-flexible-pricing-for-the-enterprise-edu-and-business-plans)

### What counts as Code Review usage?

Code Review usage applies only when Codex runs reviews through GitHub—for
example, when you tag `@Codex` for review in a pull request or enable automatic
reviews on your repository. Reviews run locally or outside of GitHub count
toward your general usage limits.

### What can I do to make my usage limits last longer?

The usage limits and credits above are average rates. You can try the following
tips to maximize your limits:

- **Control the size of your prompts.** Be precise with the instructions you
  give Codex, but remove unnecessary context.
- **Reduce the size of your AGENTS.md.** If you work on a larger project, you
  can control how much context you inject through AGENTS.md files by [nesting
  them within your repository](https://developers.openai.com/codex/guides/agents-md#layer-project-instructions).
- **Limit the number of MCP servers you use.** Every [MCP](https://developers.openai.com/codex/mcp) you add
  to Codex adds more context to your messages and uses more of your limit.
  Disable MCP servers when you don’t need them.
- **Switch to a smaller model for routine tasks.** Using GPT-5.4 or
  GPT-5.4 mini can extend your local-message usage limits, depending on the
  model you switch from.

## Feature availability

<CodexPlanFeatureMatrix
  client:load
  data={{
    plans: [
      { id: "plus", shortLabel: "Plus", label: "ChatGPT Plus" },
      { id: "pro", shortLabel: "Pro", label: "ChatGPT Pro" },
      {
        id: "business",
        shortLabel: "Business",
        label: "ChatGPT Business",
      },
      {
        id: "enterprise",
        shortLabel: "Enterprise",
        label: "Enterprise / Education",
      },
      { id: "api", shortLabel: "API Key", label: "API Key" },
    ],
    sections: [
      {
        title: "Access and surfaces",
        features: [
          {
            name: "Codex web",
            href: "/codex/cloud",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Codex app for local tasks",
            href: "/codex/app",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Codex CLI",
            href: "/codex/cli",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "IDE extension",
            href: "/codex/ide",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Codex SDK, `codex exec`, and scriptable workflows",
            shortName: "Codex SDK and scripting",
            href: "/codex/sdk",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Codex access tokens for trusted automation",
            shortName: "Automation access tokens",
            href: "/codex/enterprise/access-tokens",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
        ],
      },
      {
        title: "Models and multimodal",
        features: [
          {
            name: "Fast mode",
            href: "/codex/speed",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Codex-Spark research preview",
            href: "/codex/models",
            availability: {
              plus: "unavailable",
              pro: "available",
              business: "unavailable",
              enterprise: "unavailable",
              api: "unavailable",
            },
          },
          {
            name: "Image generation and editing",
            href: "/codex/app/features#image-generation",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Voice dictation",
            href: "/codex/app/features#voice-dictation",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Web search",
            href: "/codex/app/features#web-search",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
        ],
      },
      {
        title: "Local features",
        features: [
          {
            name: "Local code review with `/review`",
            shortName: "Local code review",
            href: "/codex/workflows#do-a-local-code-review",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Auto-review for approval requests",
            href: "/codex/concepts/sandboxing/auto-review",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Sandboxing and permission controls",
            href: "/codex/permissions",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Project and standalone app automations",
            shortName: "App automations",
            href: "/codex/app/automations",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Automations",
            href: "/codex/app/automations",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Worktrees and built-in Git tools",
            shortName: "Built-in Git tools",
            href: "/codex/app/worktrees",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Local environments and repeatable actions",
            shortName: "Repeatable actions",
            href: "/codex/app/local-environments",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Appshots",
            href: "/codex/appshots",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "unavailable",
              api: "available",
            },
          },
        ],
      },
      {
        title: "Browser and remote control",
        features: [
          {
            name: "In-app browser previews and comments",
            shortName: "In-app browser",
            href: "/codex/app/browser",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Browser Use automation",
            href: "/codex/app/browser#browser-use",
            availability: {
              plus: "limited",
              pro: "limited",
              business: "limited",
              enterprise: "limited",
              api: "limited",
            },
          },
          {
            name: "Chrome extension browser control",
            shortName: "Chrome browser control",
            href: "/codex/app/chrome-extension",
            availability: {
              plus: "limited",
              pro: "limited",
              business: "limited",
              enterprise: "limited",
              api: "limited",
            },
          },
          {
            name: "Computer Use",
            href: "/codex/app/computer-use",
            limitedFootnote: "region",
            availability: {
              plus: "limited",
              pro: "limited",
              business: "limited",
              enterprise: "limited",
              api: "limited",
            },
          },
          {
            name: "Record & Replay (macOS)",
            shortName: "Record & Replay",
            href: "/codex/record-and-replay",
            limitedFootnote: "region",
            availability: {
              plus: "limited",
              pro: "limited",
              business: "limited",
              enterprise: "limited",
              api: "limited",
            },
          },
          {
            name: "SSH remote connections",
            shortName: "SSH remote",
            href: "/codex/remote-connections#connect-to-an-ssh-host",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Mobile remote control",
            href: "/codex/remote-connections",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
        ],
      },
      {
        title: "Customization and extensions",
        features: [
          {
            name: "Custom instructions with `AGENTS.md`",
            shortName: "Custom instructions",
            href: "/codex/guides/agents-md",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Skills",
            href: "/codex/skills",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Plugins",
            href: "/codex/plugins",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "limited",
            },
            limitedFootnote: "plugins",
          },
          {
            name: "Plugin sharing",
            href: "/codex/plugins/build#share-a-local-plugin-with-your-workspace",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "App connectors",
            href: "/codex/plugins",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "MCP",
            href: "/codex/mcp",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Subagents and custom agents",
            shortName: "Subagents",
            href: "/codex/subagents",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Memories",
            href: "/codex/memories",
            availability: {
              plus: "limited",
              pro: "limited",
              business: "limited",
              enterprise: "limited",
              api: "limited",
            },
          },
          {
            name: "Chronicle",
            href: "/codex/memories/chronicle",
            availability: {
              plus: "unavailable",
              pro: "limited",
              business: "unavailable",
              enterprise: "unavailable",
              api: "unavailable",
            },
          },
        ],
      },
      {
        title: "Cloud and integrations",
        features: [
          {
            name: "Codex cloud tasks",
            shortName: "Cloud tasks",
            href: "/codex/cloud",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Cloud environments and setup scripts",
            shortName: "Cloud environments",
            href: "/codex/cloud/environments",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Cloud agent internet access controls",
            shortName: "Internet controls",
            href: "/codex/cloud/internet-access",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Sites",
            href: "/codex/sites",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "GitHub issue and PR delegation with `@codex`",
            shortName: "GitHub delegation",
            href: "/codex/integrations/github#give-codex-other-tasks",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "GitHub code review and automatic PR reviews",
            shortName: "GitHub PR reviews",
            href: "/codex/integrations/github",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Slack cloud integration",
            shortName: "Slack integration",
            href: "/codex/integrations/slack",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Linear cloud integration",
            shortName: "Linear integration",
            href: "/codex/integrations/linear",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
        ],
      },
      {
        title: "Admin, security, and analytics",
        features: [
          {
            name: "SAML SSO, MFA, and workspace user management",
            shortName: "Workspace management",
            href: "/codex/enterprise/admin-setup",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "`requirements.toml` managed config",
            shortName: "`requirements.toml` config",
            href: "/codex/enterprise/managed-configuration",
            availability: {
              plus: "available",
              pro: "available",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Cloud-managed config policies",
            shortName: "Cloud-managed policies",
            href: "/codex/enterprise/managed-configuration#cloud-managed-requirements",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "available",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Codex RBAC and custom roles",
            shortName: "RBAC and roles",
            href: "/codex/enterprise/admin-setup#step-2-set-up-custom-roles-rbac",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "SCIM, EKM, and domain verification",
            shortName: "SCIM, EKM, and domains",
            href: "/codex/enterprise/admin-setup#enterprise-grade-security-and-privacy",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Enterprise retention and residency controls",
            shortName: "Retention and residency",
            href: "/codex/enterprise/admin-setup#enterprise-grade-security-and-privacy",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "No training on API or business data by default",
            shortName: "No default training",
            href: "https://openai.com/business-data/",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "available",
              enterprise: "available",
              api: "available",
            },
          },
          {
            name: "Analytics dashboard",
            href: "/codex/enterprise/governance#analytics-dashboard",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Analytics API",
            href: "/codex/enterprise/governance#analytics-api",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Compliance API and audit logs",
            shortName: "Compliance and audit logs",
            href: "/codex/enterprise/governance#compliance-api",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
          {
            name: "Codex Security for connected GitHub repositories",
            shortName: "Codex Security",
            href: "/codex/security",
            availability: {
              plus: "unavailable",
              pro: "unavailable",
              business: "unavailable",
              enterprise: "available",
              api: "unavailable",
            },
          },
        ],
      },
    ],
  }}
/>

<div
  id="codex-plan-region-limits"
  className="not-prose mt-3 text-sm text-secondary"
>
  <sup>*</sup> Feature is currently limited to only specific regions. Check the
  individual feature documentation to learn more about geo restrictions.
</div>
<div
  id="codex-plan-plugin-limits"
  className="not-prose mt-1 text-sm text-secondary"
>
  <sup>†</sup> Some first party plugins are not available.
</div>
``````
:::
:::

