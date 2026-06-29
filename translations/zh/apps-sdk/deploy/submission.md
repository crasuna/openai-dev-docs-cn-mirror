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

当你已经在 Developer Mode 中构建并 [测试你的应用](https://developers.openai.com/apps-sdk/deploy/testing) 后，可以通过当前基于 dashboard 的审核流程提交它。该流程仍是目前公开分发的路径。当你发布获批应用时，OpenAI 会为 Codex 分发创建 plugin。

只有当你打算让生成的 plugin 在提交期间定义的国家/地区公开可访问时，才提交应用。对于你打算私下使用或仅在 workspace 内使用的应用，请改用 [developer mode](https://platform.openai.com/docs/guides/developer-mode)。提交应用会启动审核流程，你会在审核推进过程中收到其状态通知。

自助 plugin 发布即将推出。请参阅 [构建 plugin 指南](https://developers.openai.com/codex/plugins/build)，了解打包模型和本地测试工作流。

_提交前，请阅读并确保你的应用符合我们的 [应用提交指南](https://developers.openai.com/apps-sdk/app-submission-guidelines)。_

如果你的应用获批，生成的应用可以在 ChatGPT 中列出，或作为 plugin 列在 Codex 中用户可浏览的共享目录中。起初，用户可以通过以下方式之一发现它：

- 点击指向你的 app directory listing 的 direct link
- 按名称搜索你的应用

展现出强现实世界实用性和高用户满意度的应用可能有资格获得增强分发机会，例如目录展示位或主动建议。

## 提交前：先决条件

### 组织验证

提交应用前，请在 [OpenAI Platform Dashboard](https://platform.openai.com/settings/organization/general) 中为你计划在目录中用于发布的名称完成身份验证。

- **如果你想以自己的姓名发布**，请完成 **individual verification**。
- **如果你想以企业名称发布**，请完成 **business verification**。

这会在应用审核期间强制执行。以未经验证的个人或企业名称发布会导致拒绝。

### 应用管理权限

要创建应用 draft 并提交审核，你需要 `api.apps.write` permission。要在 Dashboard 中查看应用 draft 和审核状态，你需要 `api.apps.read` permission。Organization owner 自动拥有这两个 permission，并且可以通过 [OpenAI Platform Dashboard](https://platform.openai.com/settings/organization/roles) 中的 role 将它们授予非 owner。

### MCP server 要求

- 你的 MCP server 托管在可公开访问的域名上
- 你没有使用本地或测试 endpoint
- 你定义了 [content security policy (CSP)](https://developers.openai.com/apps-sdk/build/mcp-server#content-security-policy-csp)，以允许你获取内容的确切域名（出于安全原因，这是提交应用的必需项）

### Template MCP server URL

大多数应用应提交 universal MCP server URL：一个适用于所有用户和 organization 的单一托管 MCP endpoint。

只有当你的应用使用 workspace-specific MCP server URL 时才选择 **Template**，例如每个客户都有单独 tenant、workspace 或 managed MCP endpoint 的情况。Template submission 需要两个 URL 值：

- **MCP Server URL:** 用于审核和自动化检查的具体、可工作的 MCP endpoint。
- **Template MCP Server URL:** 描述 MCP endpoint 中哪一部分会跨 customer workspaces 变化的 URL pattern。

review MCP server URL 必须是 OpenAI 在提交审核期间可以连接到的真实 endpoint。不要在 **MCP Server URL** 字段中输入 placeholder URL。

在 **Template MCP Server URL** 中，对 workspace admin 稍后将配置的部分使用 placeholder。Placeholder 必须使用 `{name}` 语法，以字母开头，并且只包含字母、数字或下划线。每个 placeholder name 必须唯一。

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
2. 完成提交表单中的必填字段，并勾选所有确认框。你需要提交应用名称、logo、description、company and privacy policy URLs、MCP and tool information、screenshots、test prompts and responses，以及 localization information。
3. 点击 Submit for review。你会收到一封确认提交的电子邮件，其中包含 Case ID，可在未来的支持请求中引用。

每个 organization 可以发布多个唯一应用，但每个应用同一时间只能发布一个版本，且同一时间只能有一个版本处于审核中。如果你提交应用后希望进行更改，应选择 “Cancel Review” 撤回该提交，并重新提交该 version draft，而不是创建新的应用。

_请注意，目前具有 EU data residency 的 project 不能提交应用进行审核。请使用具有 global data residency 的 project 提交你的应用。如果没有，你可以从 OpenAI Dashboard 在当前 organization 中创建一个新 project。_

## 应用审核与批准

提交后，你的应用会进入审核队列。你可以在 Dashboard 中查看审核状态，并会收到告知任何状态变化的电子邮件通知。

### 审核和检查

我们可能执行自动扫描或人工审核，以理解你的应用如何工作，以及它是否可能与我们的政策冲突。

### 批准、拒绝和申诉

如果你的应用获批，我们会通过电子邮件通知你。获批后，你可以从当前 dashboard flow 发布它。发布时，OpenAI 会为 Codex 分发创建 plugin。

如果你的应用被拒绝或移除，你会收到关于哪些检查未成功的反馈。做出必要更改后，你可以重新提交应用进行重新审核。或者，如果你希望申诉该决定，可以回复你收到的电子邮件。请确保包含清晰的申诉理由，以及任何有助于我们审核的新信息。

### 获取帮助

如果你在提交前、提交中或提交后有问题，且文档没有回答你的问题，请联系 OpenAI support 以获得进一步帮助。请确保包含你的 OpenAI case ID（提交后会通过电子邮件收到），以帮助我们更好地协助你。

### 应用审核与批准 FAQ

**App review 需要多长时间？**

随着我们持续构建和扩展流程，审核时间线可能会变化。请不要联系 support 请求加急审核，因为这类请求无法被满足。

**常见拒绝原因是什么，我该如何解决？**

- **我们无法使用提供的 MCP URL 和/或 test credentials 连接到你的 MCP server。**
  - 对于需要认证的 server，我们的审核团队必须能登录到 demo account，且不需要任何进一步配置。
  - 确保提供的 URL 和 credential 正确，且不包含 MFA（包括要求 SMS code、通过需要 SMS、email 或其他 verification scheme 的系统登录）。
  - 确保提供的 credential 可以成功登录（请在任何公司 network 或 LAN、或其他 internal network 外测试）。
  - 确认 credential 没有过期。
- **你的一个或多个 test case 没有产生正确结果。**
  - 仔细检查所有 test case，并逐一重新运行。确保 output 与 expected result 匹配。验证 UI（如果适用）中没有 error，例如 content、image 加载问题或其他 UI issue。
  - 确保返回的文本输出紧密遵循用户请求，并且不提供与请求无关的额外信息，包括个人标识符。
  - 确保所有 test case 在 ChatGPT web 和移动应用上都通过。
  - 将实际 output 与每个工具明确定义的 expected behavior 比较，并修复任何 mismatch，使结果与用户输入相关，且应用 “reliably does what it promises”。
  - 如有需要，在重新提交时修改你的 test case 和 expected response，使其清晰且无歧义。
- **你的应用返回了隐私政策中未披露的 user-related data type。**
  - 在 developer mode 中审计你的 MCP 工具响应：运行几个真实示例请求，并列出应用返回的每个 user-related field（包括 nested field 和 “debug” payload）。确保工具只返回用户请求严格所需内容，并移除任何不必要的 PII、telemetry/internal identifier（例如 session/trace/request IDs、timestamps、internal account IDs、logs）和/或任何 auth secret（tokens/keys/passwords）。
  - 你也可以考虑更新已发布的隐私政策，清楚披露你收集/处理/返回的所有 personal data 类别及原因；如果某个字段并不真正需要，请移除它，而不是披露它。
  - 如果 user identifier 确实必要，请让它被明确请求，并与用户意图清晰绑定（不要默认“查出并回显”）
- **Tool hint annotation 似乎与工具行为不匹配：**
  - **readOnlyHint:** 如果工具严格获取/查询/列出/检索数据，且不修改任何内容，则设为 `true`。如果工具可以创建/更新/删除任何内容、触发动作（发送 email/message、运行 job、enqueue task、写 log、启动 workflow），或以其他方式改变状态，则设为 `false`。
  - **destructiveHint:** 如果工具可能造成不可逆结果（删除、覆盖、发送无法撤销的 message/transaction、revoking access、destructive admin action 等），即使只在某些 mode、default parameter 或 indirect side effect 下发生，也设为 `true`。确保所提供的理由清楚描述哪些内容不可逆、在什么条件下发生，以及是否有确认步骤、dry-run option 或 scoping constraint 等 safeguard。否则设为 `false`。
  - **openWorldHint:** 如果工具可以写入或改变公开可见的互联网状态（例如向 social media/blog/forum 发布、向 external recipient 发送 email/SMS/message、创建 public ticket/issue、发布 page、向 public endpoint 推送 code/content、向第三方提交 form，或以其他方式影响 private/first-party context 之外的系统），设为 `true`。只有当工具完全在 closed/private system 内运行（包括内部写入），并且不会改变公开可见互联网状态时，才设为 `false`。

## 发布与分发

### 发布你的应用

应用获批后，你可以从 [OpenAI Platform Dashboard](https://platform.openai.com/apps-manage) 选择 **Publish** 来发布。发布会保留当前基于应用的工作流。此外，OpenAI 会基于你的获批应用创建 Codex plugin。

### 可发现性

发布后，用户可以通过以下方式找到你的应用：

- 点击目录中指向你的应用的 direct link。你可以在 [Platform App Management page](https://platform.openai.com/apps-manage) 上应用的 “Published” 状态旁找到此 link
- 按名称搜索你的应用

展现出强现实世界实用性和高用户满意度的应用可能有资格获得增强分发机会，例如目录展示位或主动建议，但很少有应用会在发布时获得增强分发。目前没有可请求此机会的流程。

### 发布与分发 FAQ

**我的应用获批后会发生什么？它会自动列在应用目录中吗？**

应用获批后，你可以选择从 [OpenAI Platform Dashboard](https://platform.openai.com/apps-manage) 发布它。它必须发布后，才会列入 App Directory 和 Codex Plugin Directory。

**为什么我在目录中看不到我的应用？**

只有被选中进行增强分发的应用才会在 App Directory 的主页面上对用户可见。若要确认你的应用已发布，你可以使用逐字发布名称搜索应用，或点击 [OpenAI Platform Dashboard](https://platform.openai.com/apps-manage) 中指向 app directory page 的 URL。

**如果我想发布关于应用的新闻稿或公开公告，应该怎么做？**

在发布任何关于你应用上线的新闻稿或公开公告前，请先联系 [press@openai.com](mailto:press@openai.com)，与我们的 communications team 协调。

## 持续维护

### 已发布应用版本的工作方式

请把你的 MCP server 暴露的 metadata 视为有版本的 API 契约。当你在 OpenAI Platform Dashboard 中扫描 draft app 的 MCP endpoint 时，OpenAI 会把发现的 metadata 与该 draft version 一起存储。提交版本会把该已存储 snapshot 送审。snapshot 包括：

- 工具列表、name、title 和 description
- 输入和输出 schema、annotation 和工具 security scheme
- 工具 `_meta` 字段，包括 UI resource reference 和 visibility
- 已链接的 UI resource metadata，包括 content security policy（CSP）设置
- MCP server 在 initialization 期间返回的 `instructions`

snapshot 不会冻结你的 MCP server。工具调用会继续针对 live endpoint 执行，你的 server 也会继续返回 live tool results 和 business data。工具结果中返回的 UI resource contents 和 `_meta` 也会保持 live；ChatGPT 会在 runtime 从 snapshotted URI 读取 UI resource contents。

部署 server change 不会更新已发布 snapshot。若要让新工具或变更后的 metadata 对用户可用，请创建或更新 draft version，在部署更改后扫描其 MCP endpoint，提交审核，获得批准并发布。在新版本审核期间，用户会继续使用当前已发布 snapshot，并针对你的 live MCP server 执行。

当前不支持对已发布应用进行 breaking change。例如，移除或重命名工具、使 input schema 不兼容，或更改或移除已发布 UI resource URI 所提供的内容，都会在 server change 部署后立即破坏已发布版本。相反，请做 backward-compatible update：

1. 添加新工具、字段或 UI resource，同时继续遵守已发布契约。
2. 将更新后的 metadata 作为新 app version 提交。
3. 发布获批版本，并保持旧契约可用。

如果 server-only fix 保持已发布契约不变，你可以部署它们而无需提交新版本。如果某次部署破坏了已发布版本，请回滚 server change，而不是等待新版本完成审核。

### 提交新版本进行审核

应用发布后，所有已提交信息都会出于安全目的被锁定。若要做任何更改，请创建现有应用的新 draft version，并重新提交该版本进行审核（不要创建新应用）。每次重新提交都会启动新的审核。提交更改时，请在表单的 release notes section 中包含清晰的变更说明。

应用的 base MCP server URL 不能在版本之间改变。若要使用不同 base URL，请创建新应用，而不是新版本。

我们会再次审核你的应用，并通过电子邮件和 [OpenAI Platform Dashboard](https://platform.openai.com/apps-manage) 告知你更新是否获批或被拒。与初次审核类似，如果被拒，你可以更新并重新提交，或申诉该决定。

重新提交获批后，你可以发布更新，它将替换之前的应用版本。

如果你在提交和批准之间对应用做了额外更改，并想提交新版本审核，可以在 [OpenAI Platform Apps Dashboard](https://platform.openai.com/apps-manage) 中从应用旁的三点菜单选择 “Cancel Review” 来取消审核，然后重新提交。

### 更改已发布应用版本和移除应用

应用发布后，你可以在 [OpenAI Platform Apps Dashboard](https://platform.openai.com/apps-manage) 中从当前已发布 app version 旁的三点菜单选择 “Unpublish Version”，然后选择你想改为发布的 app version 旁的 “Publish”，以更改已发布版本。你也可以选择 “Unpublish Version” 且不发布替代版本，从而将应用完全从公开可见范围中移除。

若要从你的 organization 和 ChatGPT 中完全移除应用，可以在 [OpenAI Platform Apps Dashboard](https://platform.openai.com/apps-manage) 中从应用旁的三点菜单选择 “Delete App”。

### 维护要求

不活跃、不稳定或不合规的应用可能会被移除。我们可以随时且出于任何原因拒绝或移除任何应用，无需通知，例如出于法律或安全关注或 policy violation。

### 持续维护 FAQ

**如果用户举报我的应用有害或误导，会发生什么？**

OpenAI 会审查用户举报，并可能审核或调查你的应用。被认定违反我们政策的应用可能会受到限制或移除。你可以按照此处描述的申诉流程，对你的应用的移除或其他 enforcement action 提出申诉。你应定期查看和回应反馈，并在发现问题时更新应用。

**应用更新需要多长时间？**

与新的应用提交审核类似，我们无法为应用更新审核提供预计时间。
