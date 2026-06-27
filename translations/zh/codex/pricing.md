---
status: needs-review
sourceId: "d54abb2fc262"
sourceChecksum: "d54abb2fc26253d081dd103c3e65821962182c16cc346d5861446736c96df37b"
sourceUrl: "https://developers.openai.com/codex/pricing"
translatedAt: "2026-06-27T19:06:51.2133192+08:00"
translator: codex-gpt-5.5-xhigh
---

# Codex 定价

<h2 class="sr-only">价格选项</h2>

<ContentSwitcher
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
>
  <div data-content-switcher-pane data-value="individual">
    <div class="codex-pricing-grid">
      <PricingCard
        name="Free"
        subtitle="在快速编码任务中探索 Codex 能力。"
        price="$0"
        interval="/月"
        ctaLabel="获取 Free"
        ctaHref="https://chatgpt.com/plans/free/"
      />
      <PricingCard
        name="Go"
        subtitle="将 Codex 用于轻量级编码任务。"
        price="$8"
        interval="/月"
        ctaLabel="获取 Go"
        ctaHref="https://chatgpt.com/plans/go"
      />
      <PricingCard
        name="Plus"
        subtitle="每周支持几次聚焦的编码会话。"
        price="$20"
        interval="/月"
        ctaLabel="获取 Plus"
        ctaHref="https://chatgpt.com/explore/plus?utm_internal_source=openai_developers_codex"
      >
        - 在 Web、CLI、IDE extension 和 iOS 上使用 Codex
        - 自动 code review 和 Slack integration 等 cloud-based integrations
        - 最新模型，包括 GPT-5.5、GPT-5.4 和 GPT-5.4 mini
        - 使用 GPT-5.4 mini，为常规 local messages 获得更高 usage limits
        - 使用 [ChatGPT credits](#credits-overview) 灵活扩展用量
        - 作为 Plus plan 的一部分提供其他 [ChatGPT features](https://chatgpt.com/pricing)
      </PricingCard>
      <PricingCard
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
      >
        - 访问 GPT-5.3-Codex-Spark（research preview），这是一个用于日常编码任务的快速 Codex 模型
        - Codex 用量比 Plus 多 5x 或 20x*
        - 作为 Pro plan 的一部分提供其他 [ChatGPT features](https://chatgpt.com/pricing)
      </PricingCard>
      <PricingCard
        name="API Key"
        subtitle="非常适合 CI 等共享环境中的自动化。"
        price=""
        interval=""
        ctaLabel="了解更多"
        ctaHref="/codex/auth"
        highlight=""
      >
        - 在 CLI、SDK 或 IDE extension 中使用 Codex
        - 不包含 cloud-based features（GitHub code review、Slack 等）
        - 模型可用性遵循你的 key 可用的 API models
        - 只根据 [API pricing](https://platform.openai.com/docs/pricing)，为 Codex 使用的 tokens 付费
      </PricingCard>
    </div>

  </div>

  <div data-content-switcher-pane data-value="business-enterprise" hidden>
    <div class="codex-pricing-grid">
      <PricingCard
        name="Business"
        subtitle="将 Codex 带入你的初创公司或成长型企业。"
        price="$20"
        interval="/ 用户 / 月*"
        ctaLabel="获取 Business"
        ctaHref="https://chatgpt.com/team-sign-up"
        footnoteLabel="*2 位及以上用户，按年计费。按月计费时为每用户每月 25 美元。"
      >
        - 在桌面和移动 app 中访问 ChatGPT 和 Codex
        - 更大的 virtual machines，让 cloud tasks 运行更快
        - 使用 [ChatGPT credits](#credits-overview) 灵活扩展用量
        - 安全、专用的 workspace，包含必要的 admin controls、SAML SSO 和 MFA
        - 默认不使用你的 business data 进行训练。[了解更多](https://openai.com/business-data/)
        - 作为 Business plan 的一部分提供其他 [ChatGPT features](https://chatgpt.com/pricing)
      </PricingCard>
      <PricingCard
        name="Enterprise & Edu"
        subtitle="通过 enterprise-grade 功能为你的整个组织解锁 Codex。"
        interval=""
        ctaLabel="联系销售"
        ctaHref="https://chatgpt.com/contact-sales?utm_internal_source=openai_developers_codex"
        highlight="包含 Business 的全部内容，另加："
      >
        - 优先 request processing
        - Enterprise-level security 和 controls，包括 SCIM、EKM、user analytics、domain verification，以及 role-based access control ([RBAC](https://help.openai.com/en/articles/11750701-rbac))
        - 通过 [Compliance API](https://chatgpt.com/admin/api-reference#tag/Codex-Tasks) 提供 audit logs 和 usage monitoring
        - Data retention 和 data residency controls
        - 作为 Enterprise plan 的一部分提供其他 [ChatGPT features](https://chatgpt.com/pricing)
      </PricingCard>
    </div>

    <div class="mt-8 mb-10 codex-pricing-grid">
      <PricingCard
        class="codex-pricing-card--span-two"
        name="API Key"
        subtitle="非常适合 CI 等共享环境中的自动化。"
        price=""
        interval=""
        ctaLabel="了解更多"
        ctaHref="/codex/auth"
        highlight=""
      >
        - 在 CLI、SDK 或 IDE extension 中使用 Codex
        - 不包含 cloud-based features（GitHub code review、Slack 等）
        - 模型可用性遵循你的 key 可用的 API models
        - 只根据 [API pricing](https://platform.openai.com/docs/pricing)，为 Codex 使用的 tokens 付费
      </PricingCard>
    </div>

  </div>
</ContentSwitcher>

## 邀请朋友和同事

符合条件的用户可以从 app 左下角的 profile menu 发送 Codex invitations。在符合条件的 personal plan 上选择 **Invite a friend**，或在符合条件的 Business workspace 中选择 **Invite a coworker**，输入收件人的电子邮件地址并发送邀请。

Invitation dialog 会显示你当前计划或 promotion 的当前 reward、recipient requirements、invite limits，以及 rewards 何时过期。Personal 和 Business referral programs 有各自独立的 rewards 和 eligibility rules。ChatGPT Enterprise 目前不支持 referrals。

从 2026 年 6 月 11 日到 2026 年 6 月 24 日，符合条件的 Plus 和 Pro 用户最多可以邀请三位朋友。当符合条件的收件人发送第一条 Codex message 时，双方都会获得一次 banked rate-limit reset。Banked rate-limit resets 可在发放后的 30 天内使用。Business referrals 使用单独的 shared-workspace credit rewards；发送邀请前请查看[当前条款](https://help.openai.com/en/articles/20001271)。

## 常见问题

### Sites 的费用是多少？

[Sites](https://developers.openai.com/codex/sites) 在 preview 期间免费。Pricing information 将很快提供。

### 我的 plan 有哪些 usage limits？

你可以发送的 Codex messages 数量取决于所用模型、编码任务的规模和复杂度，以及你是在本地还是在 cloud 中运行它们。小脚本或常规函数可能只消耗你额度的一小部分，而更大的代码库、long-running tasks，或需要 Codex 保持更多上下文的 extended sessions，会显著增加每条 message 的用量。

GPT-5.5 使用显著更少的 tokens，即可达到与 GPT-5.4 可比的结果。它的 Codex setup 运行更快，并为大多数用户提供更高质量结果。尽管 GPT-5.5 是能力显著更强的模型，这些效率提升仍支持慷慨的 usage limits。

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
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
          <tr>
            <td>GPT-5.4</td>
            <td style="text-align:center">20-100</td>
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
          <tr>
            <td>GPT-5.4 mini</td>
            <td style="text-align:center">60-350</td>
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:center">
              <a id="shared-limits-plus" class="footnote">
                *Local messages 和 cloud tasks 的 usage limits 共享一个 **five-hour window**。还可能适用额外 weekly limits。
              </a>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              对于采用 flexible pricing 的 Enterprise/Edu 用户，没有固定 rate limits，usage 会随 [credits](#credits-overview) 扩展
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              未采用 flexible pricing 的 Enterprise 和 Edu plans 在大多数功能上的 per-seat usage limits 与 Plus 相同
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
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
          <tr>
            <td>GPT-5.4</td>
            <td style="text-align:center">100-500</td>
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
          <tr>
            <td>GPT-5.4 mini</td>
            <td style="text-align:center">300-1750</td>
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:center">
              <a id="shared-limits-pro" class="footnote">
                *Local messages 和 cloud tasks 的 usage limits 共享一个 **five-hour window**。还可能适用额外 weekly limits。
              </a>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              对于采用 flexible pricing 的 Enterprise/Edu 用户，没有固定 rate limits，usage 会随 [credits](#credits-overview) 扩展
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              未采用 flexible pricing 的 Enterprise 和 Edu plans 在大多数功能上的 per-seat usage limits 与 Plus 相同
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
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
          <tr>
            <td>GPT-5.4</td>
            <td style="text-align:center">400-2000</td>
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
          <tr>
            <td>GPT-5.4 mini</td>
            <td style="text-align:center">1200-7000</td>
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:center">
              <a id="shared-limits-pro-20x" class="footnote">
                *Local messages 和 cloud tasks 的 usage limits 共享一个 **five-hour window**。还可能适用额外 weekly limits。
              </a>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              对于采用 flexible pricing 的 Enterprise/Edu 用户，没有固定 rate limits，usage 会随 [credits](#credits-overview) 扩展
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              未采用 flexible pricing 的 Enterprise 和 Edu plans 在大多数功能上的 per-seat usage limits 与 Plus 相同
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
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
          <tr>
            <td>GPT-5.4</td>
            <td style="text-align:center">20-100</td>
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
          <tr>
            <td>GPT-5.4 mini</td>
            <td style="text-align:center">60-350</td>
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:center">
              <a id="shared-limits-business" class="footnote">
                *Local messages 和 cloud tasks 的 usage limits 共享一个 **five-hour window**。还可能适用额外 weekly limits。
              </a>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              对于采用 flexible pricing 的 Enterprise/Edu 用户，没有固定 rate limits，usage 会随 [credits](#credits-overview) 扩展
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              未采用 flexible pricing 的 Enterprise 和 Edu plans 在大多数功能上的 per-seat usage limits 与 Plus 相同
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
              [按用量计费](https://platform.openai.com/docs/pricing)
            </td>
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
          <tr>
            <td>GPT-5.4</td>
            <td style="text-align:center">
              [按用量计费](https://platform.openai.com/docs/pricing)
            </td>
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
          <tr>
            <td>GPT-5.4 mini</td>
            <td style="text-align:center">
              [按用量计费](https://platform.openai.com/docs/pricing)
            </td>
            <td style="text-align:center">不可用</td>
            <td style="text-align:center">不可用</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:center">
              <a id="shared-limits-api-key" class="footnote">
                *Local messages 和 cloud tasks 的 usage limits 共享一个 **five-hour window**。还可能适用额外 weekly limits。
              </a>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              对于采用 flexible pricing 的 Enterprise/Edu 用户，没有固定 rate limits，usage 会随 [credits](#credits-overview) 扩展
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:center">
              未采用 flexible pricing 的 Enterprise 和 Edu plans 在大多数功能上的 per-seat usage limits 与 Plus 相同
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

  </ContentSwitcher>
</div>

一旦 agentic features 的定价生效，Codex usage limits 会与其他 agentic features 共享。目前这包括 Plus 和 Pro 上的 [ChatGPT for Excel](https://help.openai.com/articles/20001063)。

Speed configurations 会增加所有适用模型的 credit consumption，因此它们也会更快使用 included limits。Fast mode 会让受支持模型以更高费率消耗 credits。受支持模型和费率请参阅 [Speed](https://developers.openai.com/codex/speed)。Image generations 平均也会让 included limits 消耗速度提高约 3-5x，具体取决于 image quality 和 size。GPT-5.3-Codex-Spark 仅面向 ChatGPT Pro 用户处于 research preview，发布时不在 API 中提供。由于它运行在 specialized low-latency hardware 上，其用量由单独的 usage limit 管理，且可能根据 demand 调整。

### 达到 usage limits 后会发生什么？

我们希望你能完成已经在进行中的工作。如果你在 active turn 期间达到 usage limits，agent 将能够继续处理该 turn，但仍受 fair use limits 约束。

达到 usage limit 的 ChatGPT Plus 和 Pro 用户可以购买额外 credits 继续工作，而无需升级现有 plan。

采用 [flexible pricing](https://help.openai.com/en/articles/11487671-flexible-pricing-for-the-enterprise-edu-and-business-plans) 的 Business、Edu 和 Enterprise plans 可以购买额外 workspace credits 继续使用 Codex。

如果你正在接近 usage limits，也可以切换到更小的模型，让 usage limits 使用更久。

所有用户也可以使用 API key 运行额外 local tasks，并按[标准 API 费率](https://platform.openai.com/docs/pricing)计费。

<a id="image-generation-usage-limits"></a>

### Image generation 如何计入 usage limits？

Image generation 会计入与 local messages 和 cloud tasks 相同的一般 Codex usage limits。平均而言，image generations 消耗 included limits 的速度会比不包含 image generation 的类似 turns 快 3-5x，具体取决于 image quality 和 size。达到 included limits 后，image generation 也会从 [credits](#credits-overview) 中扣除。

Free plan 不提供 image generation。当你使用 API key 调用 Codex 时，image generation 适用 API pricing，而不是 included ChatGPT usage limits。

### 在哪里查看当前 usage limits？

你可以在 [Codex usage dashboard](https://chatgpt.com/codex/settings/usage) 中查看当前 limits。如果你想在 active Codex CLI session 中查看剩余 limits，可以使用 `/status`。

### Credits 如何工作？

Credits 让你在达到 included usage limits 后继续使用 Codex。Usage 会根据你使用的模型和功能，从可用 credits 中扣除，使你能够不中断地扩展工作。

Codex credit usage 基于 API token-based rates。Credits 仍是客户购买和消费的核心 pricing unit，但用量会按你的 workspace 消耗的每百万 input tokens、cached input tokens 和 output tokens 对应的 credits 计算。请在[这里](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)阅读 tokens 相关说明。

下面的 rate card 显示 Codex models 和 features 每百万 tokens 的 credit cost。

少数 Enterprise customers 应继续使用 legacy rate card，直到我们将你迁移到 Codex 新的 token-based pricing。更多信息请[联系 OpenAI 销售](https://chatgpt.com/contact-sales?utm_internal_source=openai_developers_codex)。

<div id="credits-overview">
  <table>
    <thead>
      <tr>
        <th scope="col">每 1M tokens 的 credits</th>
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
          GPT-5.5 用量平均为每条 message 5-45 credits。
        </td>
      </tr>
      <tr>
        <td colspan="4" style="text-align:center">
          Fast mode 会让受支持模型以更高费率消耗 credits。费率请参阅
          <a href="/codex/speed">Speed</a>。
        </td>
      </tr>
    </tfoot>
  </table>
</div>

Speed configurations 会增加所有适用模型的 credit consumption。Fast mode 会让受支持模型以更高费率消耗 credits。受支持模型和费率请参阅 [Speed](https://developers.openai.com/codex/speed)。

[了解 ChatGPT Plus 和 Pro 中 credits 的更多信息。](https://help.openai.com/en/articles/12642688)

[了解 ChatGPT Business、Enterprise 和 Edu 中 credits 的更多信息。](https://help.openai.com/en/articles/11487671-flexible-pricing-for-the-enterprise-edu-and-business-plans)

### 什么会计为 Code Review usage？

Code Review usage 仅在 Codex 通过 GitHub 运行 reviews 时适用。例如，你在 pull request 中 tag `@Codex` 请求 review，或在 repository 上启用 automatic reviews。在本地或 GitHub 之外运行的 reviews 会计入你的一般 usage limits。

### 我可以怎样让 usage limits 使用更久？

上面的 usage limits 和 credits 是平均费率。你可以尝试以下建议来最大化 limits：

- **控制 prompts 的大小。** 给 Codex 的 instructions 要精确，但移除不必要上下文。
- **减小 AGENTS.md 的大小。** 如果你在较大项目中工作，可以通过在 repository 中[嵌套 AGENTS.md files](https://developers.openai.com/codex/guides/agents-md#layer-project-instructions) 来控制注入多少上下文。
- **限制使用的 MCP servers 数量。** 你添加到 Codex 的每个 [MCP](https://developers.openai.com/codex/mcp) 都会向 messages 添加更多上下文，并使用更多 limit。不需要时请禁用 MCP servers。
- **将 routine tasks 切换到更小模型。** 使用 GPT-5.4 或 GPT-5.4 mini 可以延长 local-message usage limits，具体取决于你从哪个模型切换。

## 功能可用性

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
  }}
/>

<div
  id="codex-plan-region-limits"
  className="not-prose mt-3 text-sm text-secondary"
>
  <sup>*</sup> Feature 目前仅限特定地区使用。请查看具体 feature documentation，了解 geo restrictions。
</div>
<div
  id="codex-plan-plugin-limits"
  className="not-prose mt-1 text-sm text-secondary"
>
  <sup>†</sup> 部分 first party plugins 不可用。
</div>
