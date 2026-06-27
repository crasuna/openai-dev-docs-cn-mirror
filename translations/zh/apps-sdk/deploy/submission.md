---
status: needs-review
sourceId: "2cfc13baf207"
sourceChecksum: "2cfc13baf207496cf959da081714b164472bdf5bbc4cf89e1aac3d879eeada84"
sourceUrl: "https://developers.openai.com/apps-sdk/deploy/submission"
translatedAt: "2026-06-27T19:35:17.0701114+08:00"
translator: codex-gpt-5.5-xhigh
---

# 提交并维护你的应用

了解如何将你的应用提交到 ChatGPT Apps Directory 和 Codex Plugin Directory。

## 应用提交概览

当你已经在 Developer Mode 中构建并 [测试你的应用](https://developers.openai.com/apps-sdk/deploy/testing) 后，可以通过当前基于 dashboard 的审核流程提交它。该流程仍是目前公开分发的路径。当你发布获批应用时，OpenAI 会为 Codex distribution 创建 plugin。

只有当你打算让生成的 plugin 在提交期间定义的国家/地区公开可访问时，才提交应用。对于你打算私下使用或仅在 workspace 内使用的 apps，请改用 [developer mode](https://platform.openai.com/docs/guides/developer-mode)。提交 app 会启动审核流程，你会在审核推进过程中收到其状态通知。

Self-serve plugin publishing 即将推出。请参阅 [build plugins guide](https://developers.openai.com/codex/plugins/build)，了解 packaging model 和 local testing workflow。

_提交前，请阅读并确保你的 app 符合我们的 [App Submission Guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines)。_

如果你的 app 获批，生成的 app 可以在 ChatGPT 中列出，或作为 plugin 列在 Codex 中用户可浏览的共享 directory 中。起初，用户可以通过以下方式之一发现它：

- 点击指向你的 app directory listing 的 direct link
- 按名称搜索你的 app

展现出强现实世界实用性和高用户满意度的 apps 可能有资格获得增强分发机会，例如 directory placement 或 proactive suggestions。

## 提交前：先决条件

### Organization verification

提交 app 前，请在 [OpenAI Platform Dashboard](https://platform.openai.com/settings/organization/general) 中为你计划在 directory 中用于发布的名称完成 identity verification。

- **如果你想以自己的姓名发布**，请完成 **individual verification**。
- **如果你想以企业名称发布**，请完成 **business verification**。

这会在 app review 期间强制执行。以未经验证的个人或企业名称发布会导致拒绝。

### App management permissions

要创建 app drafts 并提交审核，你需要 `api.apps.write` permission。要在 Dashboard 中查看 app drafts 和 review status，你需要 `api.apps.read` permission。Organization owners 自动拥有这两个 permissions，并且可以通过 [OpenAI Platform Dashboard](https://platform.openai.com/settings/organization/roles) 中的 roles 将它们授予 non-owners。

### MCP server requirements

- 你的 MCP server 托管在可公开访问的 domain 上
- 你没有使用本地或测试 endpoint
- 你定义了 [content security policy (CSP)](https://developers.openai.com/apps-sdk/build/mcp-server#content-security-policy-csp)，以允许你获取内容的确切 domains（出于安全原因，这是提交 app 的必需项）

### Template MCP server URLs

大多数 apps 应提交 universal MCP server URL：一个适用于所有用户和 organizations 的单一托管 MCP endpoint。

只有当你的 app 使用 workspace-specific MCP server URLs 时才选择 **Template**，例如每个客户都有单独 tenant、workspace 或 managed MCP endpoint 的情况。Template submissions 需要两个 URL 值：

- **MCP Server URL:** 用于审核和自动化检查的具体、可工作的 MCP endpoint。
- **Template MCP Server URL:** 描述 MCP endpoint 中哪一部分会跨 customer workspaces 变化的 URL pattern。

review MCP server URL 必须是 OpenAI 在 submission review 期间可以连接到的真实 endpoint。不要在 **MCP Server URL** 字段中输入 placeholder URL。

在 **Template MCP Server URL** 中，对 workspace admin 稍后将配置的部分使用 placeholders。Placeholders 必须使用 `{name}` 语法，以字母开头，并且只包含字母、数字或 underscores。每个 placeholder name 必须唯一。

确保具体的 **MCP Server URL** 在把每个 placeholder 替换为真实值后与 template pattern 匹配。

例如：

```text
https://{workspace}.example.com/mcp
https://mcp.example.com/{tenant}/mcp
```

## 提交审核

如果满足先决条件，你可以从 [OpenAI Platform Dashboard](http://platform.openai.com/apps-manage) 提交应用进行审核。

### 启动审核流程

从 dashboard：

1. 添加你的 MCP server details（如果选择 OAuth，也添加 OAuth credentials）
2. 完成提交表单中的必填字段，并勾选所有确认框。你需要提交 app name、logo、description、company and privacy policy URLs、MCP and tool information、screenshots、test prompts and responses，以及 localization information。
3. 点击 Submit for review。你会收到一封确认提交的电子邮件，其中包含 Case ID，可在未来的支持请求中引用。

每个 organization 可以发布多个唯一 apps，但每个 app 同一时间只能发布一个版本，且同一时间只能有一个版本处于审核中。如果你提交 app 后希望进行更改，应选择 “Cancel Review” 撤回该提交，并重新提交该 version draft，而不是创建新的 app。

_请注意，目前具有 EU data residency 的 projects 不能提交 apps 进行审核。请使用具有 global data residency 的 project 提交你的 apps。如果没有，你可以从 OpenAI Dashboard 在当前 organization 中创建一个新 project。_

## App review & approval

提交后，你的 app 会进入审核队列。你可以在 Dashboard 中查看审核状态，并会收到告知任何状态变化的电子邮件通知。

### Reviews and checks

我们可能执行 automated scans 或 manual reviews，以理解你的 app 如何工作，以及它是否可能与我们的 policies 冲突。

### Approval、rejection 和 appeals

如果你的 app 获批，我们会通过电子邮件通知你。获批后，你可以从当前 dashboard flow 发布它。发布时，OpenAI 会为 Codex distribution 创建 plugin。

如果你的 app 被拒绝或移除，你会收到关于哪些 checks 未成功的反馈。做出必要更改后，你可以重新提交 app 进行 re-review。或者，如果你希望 appeal 该决定，可以回复你收到的电子邮件。请确保包含清晰的 appeal 理由，以及任何有助于我们审核的新信息。

### 获取帮助

如果你在提交前、提交中或提交后有问题，且文档没有回答你的问题，请联系 OpenAI support 以获得进一步帮助。请确保包含你的 OpenAI case ID（提交后会通过电子邮件收到），以帮助我们更好地协助你。

### App review & approval FAQs

**App review 需要多长时间？**

随着我们持续构建和扩展流程，review timelines 可能会变化。请不要联系 support 请求加急审核，因为这类请求无法被满足。

**常见拒绝原因是什么，我该如何解决？**

- **我们无法使用提供的 MCP URL 和/或 test credentials 连接到你的 MCP server。**
  - 对于需要认证的 servers，我们的 review team 必须能登录到 demo account，且不需要任何进一步配置。
  - 确保提供的 URL 和 credentials 正确，且不包含 MFA（包括要求 SMS codes、通过需要 SMS、email 或其他 verification schemes 的系统登录）。
  - 确保提供的 credentials 可以成功登录（请在任何公司 networks 或 LANs、或其他 internal networks 外测试）。
  - 确认 credentials 没有过期。
- **你的一个或多个 test cases 没有产生正确结果。**
  - 仔细检查所有 test cases，并逐一重新运行。确保 outputs 与 expected results 匹配。验证 UI（如果适用）中没有 errors，例如 content、images 加载问题或其他 UI issues。
  - 确保返回的文本输出紧密遵循用户请求，并且不提供与请求无关的额外信息，包括 personal identifiers。
  - 确保所有 test cases 在 ChatGPT web 和 mobile apps 上都通过。
  - 将实际 outputs 与每个工具明确定义的 expected behavior 比较，并修复任何 mismatch，使结果与用户输入相关，且 app “reliably does what it promises”。
  - 如有需要，在重新提交时修改你的 test cases 和 expected responses，使其清晰且无歧义。
- **你的 app 返回了隐私政策中未披露的 user-related data types。**
  - 在 developer mode 中审计你的 MCP tool responses：运行几个真实示例请求，并列出 app 返回的每个 user-related field（包括 nested fields 和 “debug” payloads）。确保 tools 只返回用户请求严格所需内容，并移除任何不必要的 PII、telemetry/internal identifiers（例如 session/trace/request IDs、timestamps、internal account IDs、logs）和/或任何 auth secrets（tokens/keys/passwords）。
  - 你也可以考虑更新已发布的隐私政策，清楚披露你收集/处理/返回的所有 personal data 类别及原因；如果某个字段并不真正需要，请移除它，而不是披露它。
  - 如果 user identifier 确实必要，请让它被明确请求，并与用户意图清晰绑定（不要默认“查出并回显”）
- **Tool hint annotations 似乎与工具行为不匹配：**
  - **readOnlyHint:** 如果工具严格获取/查询/列出/检索数据，且不修改任何内容，则设为 `true`。如果工具可以创建/更新/删除任何内容、触发动作（发送 emails/messages、运行 jobs、enqueue tasks、写 logs、启动 workflows），或以其他方式改变状态，则设为 `false`。
  - **destructiveHint:** 如果工具可能造成不可逆结果（删除、覆盖、发送无法撤销的 messages/transactions、revoking access、destructive admin actions 等），即使只在某些 modes、default parameters 或 indirect side effects 下发生，也设为 `true`。确保所提供的理由清楚描述哪些内容不可逆、在什么条件下发生，以及是否有 confirmation steps、dry-run options 或 scoping constraints 等 safeguards。否则设为 `false`。
  - **openWorldHint:** 如果工具可以写入或改变公开可见的互联网状态（例如向 social media/blogs/forums 发布、向 external recipients 发送 emails/SMS/messages、创建 public tickets/issues、发布 pages、向 public endpoints 推送 code/content、向第三方提交 forms，或以其他方式影响 private/first-party context 之外的系统），设为 `true`。只有当工具完全在 closed/private systems 内运行（包括 internal writes），并且不会改变公开可见互联网状态时，才设为 `false`。

## Publication and Distribution

### 发布你的应用

app 获批后，你可以从 [OpenAI Platform Dashboard](https://platform.openai.com/apps-manage) 选择 **Publish** 来发布。发布会保留当前 app-based workflow。此外，OpenAI 会基于你的获批 app 创建 Codex plugin。

### Discoverability

发布后，用户可以通过以下方式找到你的 app：

- 点击 directory 中指向你的 app 的 direct link。你可以在 [Platform App Management page](https://platform.openai.com/apps-manage) 上 app 的 “Published” 状态旁找到此 link
- 按名称搜索你的 app

展现出强现实世界实用性和高用户满意度的 apps 可能有资格获得增强分发机会，例如 directory placement 或 proactive suggestions，但很少有 apps 会在发布时获得增强分发。目前没有可请求此机会的流程。

### Publication and Distribution FAQs

**我的 app 获批后会发生什么？它会自动列在 app directory 中吗？**

app 获批后，你可以选择从 [OpenAI Platform Dashboard](https://platform.openai.com/apps-manage) 发布它。它必须发布后，才会列入 App Directory 和 Codex Plugin Directory。

**为什么我在 directory 中看不到我的 app？**

只有被选中进行增强分发的 apps 才会在 App Directory 的主页面上对用户可见。若要确认你的 app 已发布，你可以使用逐字发布名称搜索 app，或点击 [OpenAI Platform Dashboard](https://platform.openai.com/apps-manage) 中指向 app directory page 的 URL。

**如果我想发布关于 app 的 press release 或公开公告，应该怎么做？**

在发布任何关于你 app launch 的 press releases 或 public announcements 前，请先联系 [press@openai.com](mailto:press@openai.com)，与我们的 communications team 协调。

## 持续维护

### 已发布应用版本的工作方式

请把你的 MCP server 暴露的 metadata 视为 versioned API contract。当你在 OpenAI Platform Dashboard 中扫描 draft app 的 MCP endpoint 时，OpenAI 会把发现的 metadata 与该 draft version 一起存储。提交版本会把该已存储 snapshot 送审。snapshot 包括：

- 工具列表、names、titles 和 descriptions
- Input and output schemas、annotations 和 tool security schemes
- Tool `_meta` fields，包括 UI resource references 和 visibility
- 已链接的 UI resource metadata，包括 content security policy（CSP）settings
- MCP server 在 initialization 期间返回的 `instructions`

snapshot 不会冻结你的 MCP server。Tool calls 会继续针对 live endpoint 执行，你的 server 也会继续返回 live tool results 和 business data。Tool results 中返回的 UI resource contents 和 `_meta` 也会保持 live；ChatGPT 会在 runtime 从 snapshotted URI 读取 UI resource contents。

部署 server change 不会更新已发布 snapshot。若要让新工具或变更后的 metadata 对用户可用，请创建或更新 draft version，在部署更改后扫描其 MCP endpoint，提交审核，获得批准并发布。在新版本审核期间，用户会继续使用当前已发布 snapshot，并针对你的 live MCP server 执行。

当前不支持对已发布 apps 进行 breaking changes。例如，移除或重命名工具、使 input schema 不兼容，或更改或移除已发布 UI resource URI 所提供的内容，都会在 server change 部署后立即破坏已发布版本。相反，请做 backward-compatible updates：

1. 添加新 tools、fields 或 UI resources，同时继续遵守已发布 contracts。
2. 将更新后的 metadata 作为新 app version 提交。
3. 发布获批版本，并保持旧 contracts 可用。

如果 server-only fixes 保持已发布 contract 不变，你可以部署它们而无需提交新版本。如果某次部署破坏了已发布版本，请回滚 server change，而不是等待新版本完成审核。

### 提交新版本进行审核

app 发布后，所有已提交信息都会出于安全目的被锁定。若要做任何更改，请创建现有 app 的新 draft version，并重新提交该版本进行审核（不要创建新 app）。每次重新提交都会启动新的审核。提交更改时，请在表单的 release notes section 中包含清晰的变更说明。

app 的 base MCP server URL 不能在版本之间改变。若要使用不同 base URL，请创建新 app，而不是新版本。

我们会再次审核你的 app，并通过电子邮件和 [OpenAI Platform Dashboard](https://platform.openai.com/apps-manage) 告知你更新是否获批或被拒。与初次审核类似，如果被拒，你可以更新并重新提交，或 appeal 该决定。

重新提交获批后，你可以发布更新，它将替换之前的 app 版本。

如果你在提交和批准之间对 app 做了额外更改，并想提交新版本审核，可以在 [OpenAI Platform Apps Dashboard](https://platform.openai.com/apps-manage) 中从 app 旁的三点菜单选择 “Cancel Review” 来取消审核，然后重新提交。

### 更改已发布应用版本和移除应用

app 发布后，你可以在 [OpenAI Platform Apps Dashboard](https://platform.openai.com/apps-manage) 中从当前已发布 app version 旁的三点菜单选择 “Unpublish Version”，然后选择你想改为发布的 app version 旁的 “Publish”，以更改已发布版本。你也可以选择 “Unpublish Version” 且不发布替代版本，从而将 app 完全从 public visibility 中移除。

若要从你的 organization 和 ChatGPT 中完全移除 app，可以在 [OpenAI Platform Apps Dashboard](https://platform.openai.com/apps-manage) 中从 app 旁的三点菜单选择 “Delete App”。

### 维护要求

不活跃、不稳定或不合规的 apps 可能会被移除。我们可以随时且出于任何原因拒绝或移除任何 app，无需通知，例如出于法律或安全关注或 policy violations。

### Ongoing Maintenance FAQs

**如果用户举报我的 app 有害或误导，会发生什么？**

OpenAI 会审查用户举报，并可能审核或调查你的 app。被认定违反我们 policies 的 apps 可能会受到限制或移除。你可以按照此处描述的 appeals process，对你的 app 的移除或其他 enforcement action 提出 appeal。你应定期查看和回应反馈，并在发现问题时更新 app。

**App updates 需要多长时间？**

与新的 app submission reviews 类似，我们无法为 app updates 的 reviews 提供预计时间。
