

## 按主题查找

- `pricing`, `plans`, `ChatGPT`, `API key`, `Plus`, `Pro`, `Business`, `Enterprise`, `Edu`, `feature maturity`：[界面与模式](#surfaces-and-modes)
- `prompting`, `threads`, `context window`, `multi_agent`, `spawn_agents_on_csv`, `/plan`, `workflow`：[执行模型与工作流](#execution-model-and-workflows)
- `approval_policy`, `sandbox_mode`, `read-only`, `workspace-write`, `danger-full-access`, `security`, `cyber`：[审批、沙盒与安全](#approvals-sandboxing-and-security)
- `config.toml`, `.codex/config.toml`, `auth.json`, `ChatGPT sign-in`, `API key login`, `models`, `providers`, `model_reasoning_effort`：[配置、认证与模型](#configuration-auth-and-models)
- `codex exec`, `codex cloud`, `codex mcp`, `worktrees`, `automations`, `cloud environments`, `internet access`：[CLI、IDE、App 与 Cloud 行为](#surface-behavior)
- `AGENTS.md`, `skills`, `rules`, `custom prompts`, `MCP`, `GitHub integration`, `Slack integration`：[自定义、技能、规则、MCP 与集成](#customization-and-tooling)
- `sdk`, `noninteractive`, `app-server`, `github-action`, `CI`, `auth in CI`：[非交互式与编程接口](#automation-and-programmatic-interfaces)
- `Windows`, `WSL`, `enterprise`, `RBAC`, `data residency`, `OSS`：[平台、企业与注意事项](#platform-enterprise-and-caveats)

## 界面与模式

<a id="surfaces-and-modes"></a>

入口、套餐、受支持的界面、成熟度，以及高层产品定位。

### Codex

来源：[Codex](/codex/overview.md)

Codex 是 OpenAI 面向软件开发的编码智能体。ChatGPT Plus、Pro、Business、Edu 和 Enterprise 套餐都包含 Codex。它可以帮助你：

- **编写代码**：描述你想构建的内容，Codex 会生成符合你意图的代码，并适配你现有的项目结构和约定。

- **理解陌生代码库**：Codex 可以读取并解释复杂或遗留代码，帮助你把握团队如何组织系统。

- **审查代码**：Codex 会分析代码，识别潜在 bug、逻辑错误和未处理的边界情况。

- **调试并修复问题**：当某些内容出错时，Codex 会帮助追踪失败、诊断根因，并建议有针对性的修复。

- **自动化开发任务**：Codex 可以运行重复性工作流，例如重构、测试、迁移和设置任务，让你专注于更高层次的工程工作。

### Codex 价格

来源：[Codex Pricing](/codex/pricing.md)

价格选项

**Free**（$0 /月）：

在快速编码任务中探索 Codex 能力。

[获取 Free](https://chatgpt.com/plans/free/)

**Go**（$8 /月）：

将 Codex 用于轻量级编码任务。

[获取 Go](https://chatgpt.com/plans/go)

**Plus**（$20 /月）：

每周支持几次专注的编码会话。

- 可在 Web、CLI、IDE extension 和 iOS 上使用 Codex
- 基于云的集成，例如自动代码审查和 Slack
  集成
- 最新模型，包括 GPT-5.5、GPT-5.4 和 GPT-5.4 mini
- 用 GPT-5.4 mini 为常规本地消息提供更高使用上限
- 可通过 [ChatGPT credits](#credits-overview) 灵活扩展使用量
- Plus 套餐的一部分其他 [ChatGPT features](https://chatgpt.com/pricing)

[获取 Plus](https://chatgpt.com/explore/plus?utm_internal_source=openai_developers_codex)

**Pro**（起价 $100 /月）：

选择比 Plus 高 5 倍或 20 倍的速率限制。

包含 Plus 的全部内容，另外包括：

- 访问 GPT-5.3-Codex-Spark（研究预览版），这是一个适用于日常编码任务的快速 Codex 模型
- 比 Plus 多 5 倍或 20 倍的 Codex 使用量\*
- Pro 套餐的一部分其他 [ChatGPT features](https://chatgpt.com/pricing)

[获取 Pro](https://chatgpt.com/explore/pro?utm_internal_source=openai_developers_codex)

[\*进一步了解两个层级的限制。](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-plans)

**API Key**：

非常适合 CI 等共享环境中的自动化。

- CLI、SDK 或 IDE extension 中的 Codex
- 不包含基于云的功能（GitHub 代码审查、Slack 等）
- 模型可用性取决于你的 key 可用的 API 模型
- 只需按 Codex 使用的 token 付费，依据 [API
  pricing](https://platform.openai.com/docs/pricing)

[了解更多](/codex/auth)

**Business**（$20 / 用户 / 月\*）：

将 Codex 引入你的初创公司或成长型企业。

- 跨桌面和移动 app 访问 ChatGPT 与 Codex
- 更大的虚拟机，可更快运行云任务
- 可通过 [ChatGPT credits](#credits-overview) 灵活扩展使用量
- 安全、专用的工作区，包含必要的管理员控制、SAML SSO
  和 MFA
- 默认不会用你的业务数据训练。 [了解
  更多](https://openai.com/business-data/)
- Business 套餐的一部分其他 [ChatGPT features](https://chatgpt.com/pricing)

[获取 Business](https://chatgpt.com/team-sign-up)

\*2 个及以上用户，按年计费。按月计费时为每用户每月 $25。

**Enterprise & Edu**：

以企业级功能为整个组织解锁 Codex。

包含 Business 的全部内容，另外包括：

- 优先请求处理
- 企业级安全和控制，包括 SCIM、EKM、用户
  分析、域名验证，以及基于角色的访问控制
  （[RBAC](https://help.openai.com/en/articles/11750701-rbac)）
- 通过 [Compliance
  API](https://chatgpt.com/admin/api-reference#tag/Codex-Tasks) 提供审计日志和使用情况监控
- 数据保留和数据驻留控制
- Enterprise 套餐的一部分其他 [ChatGPT features](https://chatgpt.com/pricing)

[联系销售](https://chatgpt.com/contact-sales?utm_internal_source=openai_developers_codex)

### 功能成熟度

来源：[Feature Maturity](/codex/feature-maturity.md)

一些 Codex 功能会带有成熟度标签发布，帮助你理解各功能的可靠程度、可能发生哪些变化，以及可以期待什么支持级别。

| 成熟度 | 含义 | 指引 |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 开发中 | 尚未准备好使用。 | 不要使用。 |
| 实验性 | 不稳定，OpenAI 可能移除或更改。 | 自担风险使用。 |
| Beta | 已准备好进行广泛测试；大部分方面完整，但某些方面可能会根据用户反馈变化。 | 适用于大多数评估和试点；预期会有小幅变化。 |
| 稳定 | 完全受支持、有文档说明，并已准备好广泛使用；行为和配置会随时间保持一致。 | 可安全用于生产；移除通常会经过弃用流程。 |

### 快速开始

来源：[Quickstart](/codex/quickstart.md)

每个 ChatGPT 套餐都包含 Codex。

你也可以通过使用 OpenAI API key 登录，用 API credits 使用 Codex。

## 执行模型与工作流

<a id="execution-model-and-workflows"></a>

Codex 如何通过工作、线程、提示、速度和多智能体协调进行推理。

### 最佳实践

来源：[Best practices](/codex/learn/best-practices.md)

如果你刚开始使用 Codex 或一般意义上的编码智能体，本指南会帮助你更快获得更好的结果。它涵盖让 Codex 在 [CLI](/codex/cli)、[IDE extension](/codex/ide) 和 [Codex app](/codex/app) 中更有效的核心习惯，从提示和规划到验证、MCP、技能和自动化。

当你把 Codex 当作一个会随着时间被配置和改进的队友，而不是一次性助手时，它的效果最好。

一个有用的理解方式是：从正确的任务上下文开始，使用 `AGENTS.md` 存放持久指引，配置 Codex 以匹配你的工作流，通过 MCP 连接外部系统，把重复工作变成技能，并自动化稳定的工作流。

#### 强有力的首次使用：上下文与提示

即使你的提示并不完美，Codex 也已经足够强，可以产生实际价值。你通常可以用最少的设置把一个困难问题交给它，并仍然得到强结果。清晰的 [prompting](/codex/prompting) 不是获得价值的必要条件，但确实会让结果更可靠，尤其是在更大的代码库或更高风险的任务中。

如果你在大型或复杂仓库中工作，最大的提升来自给 Codex 正确的任务上下文，以及清晰说明你希望完成什么的结构。

一个良好的默认做法是在提示中包含四件事：

- **目标：** 你正在尝试更改或构建什么？
- **上下文：** 哪些文件、文件夹、文档、示例或错误与此任务相关？你可以 @ 提及特定文件作为上下文。
- **约束：** Codex 应该遵循哪些标准、架构、安全要求或约定？
- **完成标准：** 任务完成前应该满足什么条件，例如测试通过、行为改变，或 bug 不再复现？

这有助于 Codex 保持范围、减少假设，并产出更容易审查的工作。

根据任务难度选择推理级别，并测试哪些设置最适合你的工作流。不同用户和任务适合不同设置。

- Low 适用于更快、范围明确的任务
- Medium 或 High 适用于更复杂的变更或调试
- Extra High 适用于长时间、智能体化、推理密集型任务

为了更快提供上下文，可以尝试在 Codex app 中使用语音听写，
口述你希望 Codex 执行的内容，而不是键入。

#### 困难任务先规划

如果任务复杂、模糊或很难准确描述，请让 Codex 在开始编码前先规划。

有几种方法很有效：

**使用 Plan mode：** 对大多数用户来说，这是最简单且最有效的选项。Plan mode 让 Codex 在实现前收集上下文、提出澄清问题，并建立更强的计划。使用 `/plan` 或 Shift+Tab 切换。

**让 Codex 采访你：** 如果你有一个粗略想法，但不确定如何把它描述清楚，可以先让 Codex 向你提问。告诉它挑战你的假设，并在编写代码前把模糊想法转化为具体内容。

**使用 PLANS.md 模板：** 对更高级的工作流，你可以配置 Codex 遵循 `PLANS.md` 或执行计划模板，用于较长或多步骤工作。更多细节见 [execution plans guide](/cookbook/articles/codex_exec_plans)。

#### 用 `AGENTS.md` 让指引可复用

一旦某个提示模式有效，下一步就是不要再手动重复它。这正是 [AGENTS.md](/codex/guides/agents-md) 的作用。

可以把 `AGENTS.md` 看作智能体使用的开放格式 README。它会自动加载到上下文中，也是编码你和团队希望 Codex 在仓库中如何工作的最佳位置。

一个好的 `AGENTS.md` 涵盖：

- 仓库布局和重要目录
- 如何运行项目
- 构建、测试和 lint 命令
- 工程约定和 PR 期望
- 约束和禁止事项
- 完成的含义以及如何验证工作

CLI 中的 `/init` 斜杠命令是用来在当前目录脚手架生成初始 `AGENTS.md` 的快速启动命令。它是一个很好的起点，但你应该编辑结果，使其匹配团队实际构建、测试、审查和发布代码的方式。

你可以在不同层级创建 `AGENTS.md` 文件：位于 `~/.codex` 的全局 `AGENTS.md` 用于个人默认值，仓库级文件用于共享标准，子目录中的更具体文件用于局部规则。如果距离当前目录更近的位置有更具体的文件，那份指引优先。

保持实用。一个简短、准确的 `AGENTS.md` 比充满模糊规则的长文件更有用。从基础开始，只在你注意到重复错误后再添加新规则。

如果 `AGENTS.md` 开始变得过大，让主文件保持简洁，并引用任务特定的 Markdown 文件，用于规划、代码审查或架构等内容。

当 Codex 第二次犯同样的错误时，让它做一次复盘，并更新
`AGENTS.md`。指引会保持实用，并基于真实摩擦。

#### 为一致性配置 Codex

配置是让 Codex 跨会话和界面表现更一致的主要方式之一。例如，你可以设置模型选择、推理强度、沙盒模式、审批策略、配置档案和 MCP 设置的默认值。

一个良好的起始模式是：

- 将个人默认值放在 `~/.codex/config.toml`（Codex app 中的 Settings → Configuration → Open config.toml）
- 将仓库特定行为放在 `.codex/config.toml`
- 只在一次性场景中使用命令行覆盖（如果你使用 CLI）

[`config.toml`](/codex/config-basic) 是定义 MCP servers、多智能体设置和 feature flags 等持久偏好的位置。配置档案特定的覆盖位于单独的 `$CODEX_HOME/profile-name.config.toml` 文件中。

Codex 自带运行级别的沙盒机制，并有两个你可以控制的关键旋钮。审批模式决定 Codex 何时向你请求运行命令的权限，沙盒模式决定 Codex 是否可以读写目录，以及智能体可以访问哪些文件。

如果你刚开始使用编码智能体，请从默认权限开始。默认情况下保持审批和沙盒较严格，只有在可信仓库或特定工作流中需求明确后，再放宽权限。

注意，CLI、IDE 和 Codex app 共享相同的配置层。可在 [sample configuration](/codex/config-sample) 页面了解更多。

尽早为你的真实环境配置 Codex。许多质量问题其实是设置问题，
例如工作目录错误、缺少写入权限、模型默认值错误，或缺少工具和连接器。

#### 通过测试和审查提升可靠性

不要只停留在让 Codex 做出变更。需要时让它创建测试、运行相关检查、确认结果，并在你接受前审查工作。

Codex 可以为你完成这个循环，但前提是它知道什么算“好”。这些指引可以来自提示，也可以来自 `AGENTS.md`。

这可以包括：

- 为变更编写或更新测试
- 运行正确的测试套件
- 检查 lint、格式化或类型检查
- 确认最终行为符合请求
- 审查 diff 中是否有 bug、回归或风险模式

在 Codex app 中切换 diff 面板，以便直接在本地 [review
changes](/codex/app/review)。点击特定行即可提供反馈，该反馈会作为上下文送入下一轮 Codex。

这里一个有用的选项是斜杠命令 `/review`，它提供几种代码审查方式：

- 按基准分支进行 PR 风格审查
- 审查未提交变更
- 审查一个 commit
- 使用自定义审查指令

如果你和团队有 `code_review.md` 文件，并从 `AGENTS.md` 引用它，Codex 也可以在审查期间遵循该指引。对于希望审查行为在仓库和贡献者之间保持一致的团队，这是一个强模式。

Codex 不应该只是生成代码。配合正确指令，它还可以帮助 **测试、检查和审查代码**。

如果你使用 GitHub Cloud，可以设置 Codex 为你的 PR 运行 [code reviews](/codex/integrations/github)。在 OpenAI，Codex 会审查 100% 的 PR。你可以启用自动审查，或让 Codex 在你 @Codex 时响应式审查。

### 示例工作流

来源：[Workflows](/codex/workflows.md)

当你把 Codex 当作有明确上下文和清晰“完成”定义的队友时，它效果最好。
本页给出 Codex IDE extension、Codex CLI 和 Codex cloud 的端到端工作流示例。

如果你刚开始使用 Codex，请先阅读 [Prompting](/codex/prompting)，再回到这里查看具体配方。

#### 如何阅读这些示例

每个工作流都包含：

- **何时使用** 以及哪个 Codex 界面最适合（IDE、CLI 或 cloud）。
- **步骤**，包含示例用户提示。
- **上下文说明**：Codex 会自动看到什么，你应该附加什么。
- **验证**：如何检查输出。

> **注意：** IDE extension 会自动把你打开的文件作为上下文包含进来。在 CLI 中，你通常需要显式提及路径（或用 `/mention` 和 `@` 路径自动补全附加文件）。

---

#### 解释代码库

在你入职熟悉项目、接手服务，或尝试理解协议、数据模型或请求流时使用此工作流。

#### 配方：在 IDE 中解释代码库

1. 打开最相关的文件。
2. 选择你关心的代码（可选但推荐）。
3. 提示 Codex：

   ```text
   Explain how the request flows through the selected code.

   Include:
   - a short summary of the responsibilities of each module involved
   - what data is validated and where
   - one or two "gotchas" to watch for when changing this
   ```

验证：

- 请求一个你可以快速验证的图或清单：

```text
Summarize the request flow as a numbered list of steps. Then list the files involved.
```

#### 配方：在 CLI 中解释代码库

1. 启动交互式会话：

   ```bash
   codex
   ```

2. 附加文件（可选）并提示：

   ```text
   I need to understand the protocol used by this service. Read @foo.ts @schema.ts and explain the schema and request/response flow. Focus on required vs optional fields and backward compatibility rules.
   ```

上下文说明：

- 你可以在 composer 中使用 `@` 插入工作区中的文件路径，或用 `/mention` 附加特定文件。

---

#### 修复 bug

当你有一个可以在本地复现的失败行为时，使用此工作流。

#### 配方：在 CLI 中修复 bug

1. 在仓库根目录启动 Codex：

   ```bash
   codex
   ```

2. 给 Codex 一个复现步骤，以及你怀疑相关的文件：

   ```text
   Bug: Clicking "Save" on the settings screen sometimes shows "Saved" but doesn't persist the change.

   Repro:
   1) Start the app: npm run dev
   2) Go to /settings
   3) Toggle "Enable alerts"
   4) Click Save
   5) Refresh the page: the toggle resets

   Constraints:
   - Do not change the API shape.
   - Keep the fix minimal and add a regression test if feasible.

   Start by reproducing the bug locally, then propose a patch and run checks.
   ```

上下文说明：

- 由你提供：复现步骤和约束（它们比高层描述更重要）。
- 由 Codex 提供：命令输出、发现的调用点，以及它触发的任何堆栈跟踪。

验证：

- Codex 应在修复后重新运行复现步骤。
- 如果你有标准检查流水线，请让它运行：

```text
After the fix, run lint + the smallest relevant test suite. Report the commands and results.
```

#### 配方：在 IDE 中修复 bug

1. 打开你认为 bug 所在的文件，以及最近的调用方。
2. 提示 Codex：

   ```text
   Find the bug causing "Saved" to show without persisting changes. After proposing the fix, tell me how to verify it in the UI.
   ```

---

#### 编写测试

当你想非常明确地说明希望测试的范围时，使用此工作流。

#### 配方：在 IDE 中编写测试

1. 打开包含该函数的文件。
2. 选择定义该函数的行。选择命令面板中的 "Add to Codex Thread"，把这些行加入上下文。
3. 提示 Codex：

   ```text
   Write a unit test for this function. Follow conventions used in other tests.
   ```

上下文说明：

- 由 "Add to Codex Thread" 命令提供：所选行（这是“行号”范围），以及打开的文件。

#### 配方：在 CLI 中编写测试

1. 启动 Codex：

   ```bash
   codex
   ```

2. 用函数名提示：

   ```text
   Add a test for the invert_list function in @transform.ts. Cover the happy path plus edge cases.
   ```

---

#### 根据截图制作原型

当你有设计稿、截图或 UI 参考，并希望快速得到可运行原型时，使用此工作流。

### 提示

来源：[Prompting](/codex/prompting.md)

#### Prompts

你通过发送提示（用户消息）与 Codex 交互，描述你希望它做什么。

示例提示：

```text
Explain how the transform module works and how other modules use it.
```

```text
Add a new command-line option `--json` that outputs JSON.
```

提交提示后，Codex 会以循环方式工作：调用模型，然后执行模型输出指示的动作，例如读取文件、编辑文件和调用工具。这个过程会在任务完成或你取消时结束。

和 ChatGPT 一样，Codex 的有效性取决于你给它的指令。下面是一些我们认为有帮助的提示：

- 当 Codex 能验证自己的工作时，它会产出更高质量的结果。包含复现问题、验证功能以及运行 lint 和 pre-commit 检查的步骤。
- Codex 在你把复杂工作拆成更小、更聚焦的步骤时处理得更好。较小任务更容易被 Codex 测试，也更容易被你审查。如果你不确定如何拆分任务，可以让 Codex 提出计划。

更多关于提示 Codex 的想法，请参阅 [workflows](/codex/workflows)。

#### 线程模型

线程是一个单独会话：你的提示，以及随后的模型输出和工具调用。一个线程可以包含多个提示。例如，你的第一个提示可能让 Codex 实现一个功能，后续提示可能让它添加测试。

当 Codex 正在主动处理线程时，该线程被称为“正在运行”。你可以同时运行多个线程，但要避免让两个线程修改同一批文件。你也可以稍后通过继续线程来恢复它。

线程可以在本地或云端运行：

- **本地线程** 在你的机器上运行。Codex 可以读取和编辑你的文件并运行命令，因此你可以看到发生了什么变化，并使用现有工具。为了降低工作区外发生意外变更的风险，本地线程会在 [sandbox](/codex/agent-approvals-security) 中运行。
- **云线程** 在隔离的 [environment](/codex/cloud/environments) 中运行。Codex 会克隆你的仓库并检出它正在处理的分支。当你想并行运行工作或从另一台设备委派任务时，云线程很有用。要让云线程使用你的仓库，请先把代码推送到 GitHub。你也可以 [delegate tasks from your local machine](/codex/ide/cloud-tasks)，其中会包含当前工作状态。

在 Codex app 中，你也可以在不选择项目的情况下开始聊天。聊天
不会绑定到已保存的仓库或项目文件夹。它们适用于研究、
规划、连接工具工作流，或其他 Codex 不应从代码库开始的工作。
聊天会使用 Codex 管理的 `threads` 目录，位于你的 Codex
home 下。默认情况下，该位置是 `~/.codex/threads`。
要更改此状态的基础位置，请设置 `CODEX_HOME`；见
[Config and state locations](/codex/config-advanced#config-and-state-locations)。

#### 上下文

提交提示时，请包含 Codex 可使用的上下文，例如相关文件和图片的引用。Codex IDE extension 会自动包含打开文件列表和所选文本范围作为上下文。

智能体工作时，也会从文件内容、工具输出，以及它已完成和仍需完成事项的持续记录中收集上下文。

线程中的全部信息必须放入模型的 **context window**，其大小随模型而异。Codex 会监控并报告剩余空间。对于较长任务，Codex 可能会自动 **compact** 上下文：总结相关信息并丢弃不太相关的细节。通过反复压缩，Codex 可以在许多步骤中持续处理复杂任务。

#### Goal mode

Goal mode 为 Codex 提供一个跨较长任务持续推进的持久目标。
当工作可能需要很多步骤，或 Codex 需要清晰的完成定义并在工作时持续检查时使用它。

设置目标时，目标文本同时作为初始提示和完成标准。
Codex 会用它决定下一步做什么，以及任务是否完成。
在 [Codex
app](/codex/app/commands#set-or-manage-a-goal-with-goal)、[IDE
extension](/codex/ide/slash-commands) 或 [CLI](/codex/cli/slash-commands#set-or-view-a-task-goal-with-goal) 中使用 `/goal` 启动 Goal mode。

如果斜杠命令列表中没有 `/goal`，请在 `config.toml` 中启用 `features.goals`：

```toml
[features]
goals = true
```

你也可以从 CLI 运行 `codex features enable goals`，或让 Codex 运行它。
在 Codex app 中，进度会显示在 composer 上方，并带有暂停、
恢复、编辑或清除目标的控件。

撰写目标时，应让 Codex 能判断自己是否成功。好的目标包含
具体结果、可衡量目标或测试标准。例如：

```text
Migrate this codebase from JavaScript to TypeScript. The app should compile in
strict mode without explicit `any` type definitions.
```

```text
Reduce the time to interactive of the home page to below 1 second.
```

如果目标一开始很难定义，请从 `/plan` 开始，让 Codex 在实现前
塑造它。你也可以让 Codex 采访你，并起草带有清晰成功标准的目标。

目标启动后，你仍可以继续引导 Codex。发送后续消息来调整约束，
例如要求 Codex 使用特定库或避免特定方法。当你想要状态回顾或
解释而不打断主任务时，可以使用 side chats。对于长时间运行的工作，
在你失去连接前暂停目标，准备继续时再恢复或编辑它。

### 速度

来源：[Speed](/codex/speed.md)

#### Fast mode

Codex 提供提升模型速度的能力，但会增加 credit 消耗。

Fast mode 会把受支持模型的速度提高 1.5 倍，并以高于
Standard mode 的速率消耗 credits。它当前支持 GPT-5.5 和 GPT-5.4，
GPT-5.5 按 Standard 速率的 2.5 倍消耗 credits，GPT-5.4 按 2 倍消耗。

在 CLI 中使用 `/fast on`、`/fast off` 或 `/fast status` 更改或检查
当前设置。你也可以在 `config.toml` 中通过 `service_tier =
"fast"` 加 `[features].fast_mode = true` 持久化默认值。当你
使用 ChatGPT 登录时，Fast mode 可在 Codex IDE extension、Codex CLI
和 Codex app 中使用。使用 API key 时，Codex 使用标准 API 价格，
不能使用 Fast mode credits。

#### Codex-Spark

GPT-5.3-Codex-Spark 是一个独立的快速、能力较弱的 Codex 模型，
针对近乎即时的实时编码迭代进行了优化。不同于以更高 credit 费率
加速受支持模型的 fast mode，Codex-Spark 是自己的模型选择，
并有自己的使用限制。

在研究预览期间，Codex-Spark 仅对 ChatGPT Pro 订阅者可用。

## 审批、沙盒与安全

<a id="approvals-sandboxing-and-security"></a>

沙盒行为、审批、网络安全防护，以及安全特定指引。

### Codex Security FAQ

来源：[FAQ](/codex/security/faq.md)

#### Security FAQ：入门

#### 什么是 Codex Security？

软件安全仍然是工程中最困难且最重要的问题之一。Codex Security 是一个由 LLM 驱动的安全分析工具包，会检查源代码并返回结构化、排序后的漏洞发现项以及建议补丁。它帮助开发者和安全团队大规模发现并修复安全问题。

#### 它为什么重要？

软件是现代工业和社会的基础，漏洞会带来系统性风险。Codex Security 支持防御优先的工作流：持续识别可能的问题，在可行时验证它们，并提出修复方案。这可以帮助团队在不拖慢开发的情况下提升安全性。

#### Codex Security 解决什么业务问题？

Codex Security 缩短了从疑似问题到带证据和建议补丁的已确认、可复现发现项之间的路径。与仅使用传统扫描器相比，这会减少分诊负担并降低误报。

#### Codex Security 如何工作？

Codex Security 在临时的隔离容器中运行分析，并临时克隆目标仓库。它执行代码级分析，并返回结构化发现项，包括描述、文件和位置、严重性、根因以及建议修复。

对于包含验证步骤的发现项，系统会在同一沙盒中执行建议命令或测试，记录成功或失败、退出码、stdout、stderr、测试结果，以及任何生成的 diff 或 artifact，并将该输出附加为供审查的证据。

#### 它会替代 SAST 吗？

不会。Codex Security 是对 SAST 的补充。它增加了基于 LLM 的语义推理和自动验证，而现有 SAST 工具仍提供广泛的确定性覆盖。

#### 功能

#### 分析流水线是什么？

Codex Security 遵循分阶段流水线：

1. **Analysis** 为仓库构建威胁模型。
2. **Commit scanning** 审查已合并 commit 和仓库历史，寻找可能的问题。
3. **Validation** 尝试在沙盒中复现可能的漏洞，以减少误报。
4. **Patching** 与 Codex 集成，提出补丁供审查者在打开 PR 前检查。

它会在 GitHub、Codex 和标准审查工作流中与工程师协同工作。

#### 支持哪些语言？

Codex Security 与语言无关。实际表现取决于模型针对仓库所用语言和框架的推理能力。

#### 扫描完成后我会得到哪些输出？

你会得到带严重性、验证状态和建议补丁（如果可用）的排序发现项。发现项还可以包含崩溃输出、复现证据、调用路径上下文和相关注释。

#### 客户代码如何隔离？

每个分析和验证作业都会在临时 Codex 容器中运行，并使用会话范围工具。Artifact 会被提取出来供审查，作业完成后容器会被销毁。

#### Codex Security 会自动应用补丁吗？

不会。建议补丁是推荐的修复。用户可以审查它，并在 findings UI 中将其作为 PR 推送到 GitHub，但 Codex Security 不会自动把变更应用到仓库。

#### 项目需要构建后才能扫描吗？

不需要。Codex Security 可以在没有编译步骤的情况下，根据仓库和 commit 上下文生成发现项。在自动验证期间，如果构建项目有助于复现问题，它可能会尝试在容器内构建项目。环境设置细节见 [Codex cloud environments](/codex/cloud/environments)。

#### Codex Security 如何减少误报并避免破坏性补丁？

Codex Security 使用两个阶段。首先，模型对可能的问题排序。然后自动验证会尝试在干净容器中复现每个问题。成功复现的发现项会标记为已验证，这有助于在人工审查前减少误报。

#### 初始扫描需要多长时间，之后会发生什么？

初始扫描时间取决于仓库大小、构建时间，以及有多少发现项进入验证。对于某些仓库，扫描可能需要数小时。对于较大仓库，可能需要多天。后续扫描通常更快，因为它们聚焦于新 commit 和增量变更。

#### 什么是威胁模型？

威胁模型是扫描时针对仓库的安全上下文。它把简洁的项目概览与入口点、信任边界、认证假设和高风险组件等攻击面细节结合起来。更多细节见 [Improving the threat model](/codex/security/threat-model)。

#### 威胁模型如何生成？

Codex Security 会提示模型总结仓库架构和安全入口点、分类仓库类型、运行专门的提取器，并把结果合并成用于整个扫描的项目概览或威胁模型 artifact。

#### 它会替代人工安全审查吗？

不会。Codex Security 会加速审查并帮助排序发现项，但它不会替代代码级验证、可利用性检查或人工威胁评估。

#### 我可以编辑威胁模型吗？

可以。Codex Security 会创建初始威胁模型，你可以随着架构、风险和业务上下文变化更新它。编辑工作流见 [Improving the threat model](/codex/security/threat-model)。

### Codex Security plugin 更新日志

来源：[Codex Security plugin changelog](/codex/security/plugin/changelog.md)

此更新日志重点说明会影响你运行扫描、审查
结果以及推进发现项修复的变更。

#### 0.1.9（2026 年 6 月）

#### 在 findings workspace 中审查扫描

- 在专用 workspace 中审查已完成扫描，把 findings、
  覆盖范围、严重性、置信度和扫描 artifact 汇总到一起。
- 筛选和排序 findings，包括按最高置信度排序，同时
  在刷新期间保留你的 workspace 状态。
- 打开一个 finding，即可在一个位置审查源证据、验证细节、可达性、
  影响和修复指引。

#### 用更少设置运行扫描

- 对 Git 仓库、单个文件夹或
  没有 Git 历史的代码库运行标准扫描。Deep scans 也可以面向特定文件夹。
- 显式取消活动扫描，在不中断后无需再次
  设置提示即可恢复扫描，并在启动并发 deep scans 前收到警告。
- 遵循更清晰的设置和进度状态，带有更紧凑的进度
  摘要，以及在你处理前保持可见的错误。

#### 导出可移植、可验证的结果

- 使用一致的已完成扫描格式，其中包含 manifest、结构化 findings、
  coverage data，以及从同一个规范结果派生出的 Markdown report。
- 将 findings 导出为 JSON、CSV 或 SARIF，用于分析、归档和与其他安全工具集成。
- 改进扫描完成和文件系统处理，包括修复 Windows
  路径和扫描锁定问题。

#### 分诊并跟踪现有 findings

- 针对当前代码库分诊来自扫描器、公告、漏洞赏金报告、
  GitHub、Jira、Linear 或 Codex Security 结果的现有 findings。
  分诊工作流会返回有证据支撑的结论和按优先级排序的
  行动队列。
- 在 Linear、Jira 或 GitHub issues 中跟踪选定的已验证 findings，或在仓库满足
  advisory 要求时创建一个私有草稿 GitHub Security Advisory。
- 在批准写入前审查重复检查、来源上下文、目标可见性以及
  精确的建议内容。Codex 会在创建或更新后读回结果
  以验证它。

### Codex Security plugin 快速开始

来源：[Codex Security plugin quickstart](/codex/security/plugin.md)

Codex Security 是一个用于 Codex 的安全审查 plugin，会扫描你的代码中的
漏洞、验证可信的发现项，并在可审查 workspace 中呈现证据和
修复指引。使用它在代码进入生产前发现你拥有或被授权评估的代码中的安全问题。

本快速开始会带你完成一次推荐的首次运行：在 Codex app 中对本地仓库进行一次普通的、
只读扫描。

本页涵盖在本地 Codex 线程中运行的 plugin。要扫描
Codex web 中已连接的 GitHub 仓库，请参阅 [Codex Security cloud
setup](/codex/security/setup)。

#### 安装 plugin

在 Codex app 中打开你要评估的仓库，然后安装 Codex
Security：

安装 Codex Security plugin

安装后，在该仓库中启动一个新线程。Codex 会在线程启动时加载 plugins，
所以不要继续使用已打开的线程。

#### 运行你的第一次扫描

为了获得最佳扫描质量，请使用 `gpt-5.5`
并配合 `high` 或 `xhigh` 推理强度。

1.  请求一次普通扫描

    在新线程中发送此提示：

    ```text
    Run a Codex Security scan on this repository.
    ```

2.  确认设置

    Codex 会在开始前打开一个设置 workspace。首次运行时，使用这些
    设置：
    - **Scan type:** `Codebase`
    - **Deep scan:** Off
    - **Scan area:** `Entire codebase`
    - **Threat model scoping guidance:** 留空，除非你已经知道某个
      具体攻击向量或应用区域值得优先处理。

    确认 **Codebase**、**Current branch** 和 **Last commit** 标识的是
    你打算扫描的仓库。然后选择 **Start scan**。

        在启动扫描前配置扫描目标、扫描区域、分支和可选的威胁模型
        指引。

3.  等待扫描完成

    扫描可能需要时间。保持线程运行，直到 workspace 报告
    完成。如果 Codex 识别出配置限制，请在允许它更新你的
    配置前，审查确切限制和建议变更。

4.  审查结果

    使用 UI 浏览 findings，或打开生成的 report 进行完整、
    可移植的审查。

        按严重性、类别、目录、补丁状态和
        审查状态浏览 findings。

#### 扫描会创建什么

每次完成的扫描都会打开一个 findings workspace。用它来审查 findings 和
coverage，而不必检查原始 artifact。扫描还会创建：

- `report.md`，一个用于共享或归档的完整可移植报告。
- `scan-manifest.json`、`findings.json` 和
  `coverage.json` 中的结构化扫描数据，用于自动化和集成。你通常不需要
  自己打开这些文件。

#### 选择你的下一步工作流

- 当你想用默认工作流扫描仓库或一个文件夹时，使用 [Run a standard or scoped scan](/codex/security/plugin/scans)。
- 当你需要更全面的扫描，并且可以等待更长时间完成时，使用 [Run a deep scan](/codex/security/plugin/deep-scans)。
- 当目标是 pull request、commit、分支范围或工作树 patch 时，使用 [Review code changes](/codex/security/plugin/code-changes)。
- 当你有现有 security findings 需要审查时，使用 [Triage a backlog](/codex/security/plugin/triage-backlog)。
- 在你接受一个 finding 准备修复后，使用 [Fix and verify a finding](/codex/security/plugin/fix-findings)。
- 当你需要 JSON、CSV、SARIF、需要审批门控的 Linear、GitHub 或 Jira issue，
  或私有草稿 GitHub Security Advisory 时，使用 [Export or track findings](/codex/security/plugin/export-findings)。

#### 从 Codex CLI 安装

要从 CLI 安装同一 plugin，请在仓库中启动 Codex 并打开
plugin 浏览器：

```text
codex
/plugins
```

搜索 **Codex Security**，选择 `Install plugin`，并启动新线程。
然后使用相同的首次扫描提示。

### Codex Security 设置

来源：[Codex Security setup](/codex/security/setup.md)

本页会带你从初始访问走到在 Codex Security 中审查 findings 和 remediation pull requests。

先确认你已设置 Codex Cloud。如果还没有，请参阅 [Codex
Cloud](/codex/cloud) 开始。

#### 1. 访问与环境

Codex Security 会扫描通过 [Codex Cloud](/codex/cloud) 连接的 GitHub 仓库。

- 确认你的 workspace 有权访问 Codex Security。
- 确认你要扫描的仓库在 Codex Cloud 中可用。

前往 [Codex environments](https://chatgpt.com/codex/settings/environments)，检查该仓库是否已有 environment。如果没有，请先在那里创建一个，再继续。

[打开 environments](https://chatgpt.com/codex/settings/environments)

#### 2. 新建安全扫描

环境存在后，前往 [Create a security scan](https://chatgpt.com/codex/security/scans/new)，选择你刚连接的仓库。

[创建 security scan](https://chatgpt.com/codex/security/scans/new)

Codex Security 会先从最新 commit 向后扫描仓库。它用此方式在新 commit 进入时构建并刷新扫描上下文。

配置仓库：

1. 选择 GitHub organization。
2. 选择 repository。
3. 选择要扫描的 branch。
4. 选择 environment。
5. 选择 **history window**。更长的 window 会提供更多上下文，但 backfill 需要更久。
6. 点击 **Create**。

#### 3. 初始扫描可能需要一段时间

创建扫描后，Codex Security 首先会跨选定 history window 运行 commit 级安全检查。
初始 backfill 可能需要几个小时，尤其是较大仓库或较长 window。
如果 findings 没有马上可见，这是预期行为。请等待初始扫描完成后再提交工单或排查问题。

初始扫描设置是自动且彻底的。这可能需要几个小时。不要
因为第一批 findings 延迟而担心。

#### 4. 审查扫描并改进威胁模型

[审查扫描](https://chatgpt.com/codex/security/scans)

初始扫描完成后，打开扫描并审查生成的威胁模型。
初始 findings 出现后，更新威胁模型，使其匹配你的架构、信任边界和业务上下文。
这有助于 Codex Security 为你的团队排序问题。

如果你希望扫描结果发生变化，可以使用更新后的范围、
优先级和假设编辑威胁模型。

初始 findings 出现后，重新审视模型，使扫描指引始终与当前优先级一致。
保持其最新有助于 Codex Security 生成更好的建议。

如需更深入解释威胁模型以及它们如何影响严重性和分诊，请参阅 [Improving the threat model](/codex/security/threat-model)。

#### 5. 审查 findings 并修补

初始 backfill 完成后，从 **Findings** 视图审查 findings。

[打开 findings](https://chatgpt.com/codex/security/findings)

你可以使用两个视图：

- **Recommended Findings**：仓库中最关键问题的动态 top 10 列表
- **All Findings**：覆盖仓库中 findings 的可排序、可筛选表格

点击 finding 打开其详情页，其中包括：

- 问题的简洁描述
- commit details 和文件路径等关键元数据
- 关于影响的上下文推理
- 相关代码摘录
- 可用时的调用路径或数据流上下文
- 验证步骤和验证输出

你可以审查每个 finding，并直接从 finding 详情页创建 PR。

[审查 findings 并创建 PR](https://chatgpt.com/codex/security/findings)

#### Security setup 参考

- [Codex Security](/codex/security) 提供产品概览。
- [FAQ](/codex/security/faq) 涵盖常见问题。
- [Improving the threat model](/codex/security/threat-model) 说明如何改进扫描上下文和 finding 优先级。

### 导出并跟踪 security findings

来源：[Export and track security findings](/codex/security/plugin/export-findings.md)

使用已完成的 Codex Security 扫描作为两种不同交接的来源：

- **Export** 会创建可移植的 JSON、CSV 或 SARIF 文件。
- **Track findings** 会将选定 findings 准备为 Linear、GitHub 或 Jira issues，
  或一个私有草稿 GitHub Security Advisory，检查重复项，并
  在写入前等待你的审批。

这些工作流不会更改密封的扫描 bundle。

#### 导出可移植 artifact

打开已完成的 findings workspace，选择 **Export**，并选择一种格式：

| 格式 | 用途 |
| ------ | ----------------------------------------------------------------- |
| JSON | 为工具和脚本保留密封的结构化 findings。 |
| CSV | 在电子表格中审查 findings 和当前本地分诊状态。 |
| SARIF | 将 findings 发送给支持 SARIF 交换格式的工具。 |

选择 **Export findings** 并使用返回的 artifact path。当其他工具需要完整扫描上下文而不只是 findings-only
投影时，请将原始 `scan-manifest.json`、`findings.json` 和 `coverage.json` 放在一起。

    将已完成 findings 导出为 JSON、CSV 或 SARIF，用于下游审查和
    工具处理。

#### 跟踪选定 findings

`$codex-security:track-findings` 工作流接受一个已验证 finding，或
来自一个密封扫描的一批最多 25 个显式选定 findings，用于
issue tracking。草稿 GitHub Security Advisories 只接受一个 finding。一次
运行使用一个 provider 和一个 destination。

对于 Linear，发送这样的提示：

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] for the Linear team [team] and project [project, if
any]. Check for duplicates and show me the exact issue title, body, metadata,
and destination. Do not create or update anything until I approve that payload.
```

对于 GitHub issues，发送：

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] for GitHub repository [owner/repository]. Check open
and closed issues for duplicates and show me the exact issue title, body,
metadata, repository visibility, and authenticated transport. Do not create or
update anything until I approve that payload.
```

对于 Jira，发送：

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] for Jira project [project key] as [issue type].
Check for duplicates and show me the exact issue summary, description,
metadata, and destination. Do not create or update anything until I approve
that payload.
```

Jira tracking 需要 Codex 中的原生 Atlassian Rovo app。复用 issue
需要读取权限；创建或更新 issue 需要读写权限。

对于私有草稿 GitHub Security Advisory，发送：

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] as a private draft GitHub Security Advisory in
[owner/repository]. Verify the sealed source revision, repository, affected
paths, package metadata, and duplicate state. Show me the exact advisory
payload, authenticated GitHub CLI identity, and disclosure warnings. Do not
create anything until I approve that payload.
```

草稿 advisories 要求一个来自密封 `git_revision` 扫描的 finding、经过
验证的公开规范源仓库，以及管理员访问权限。该工作流不支持批处理、
更新、发布或关闭 advisories。当 source 不满足这些要求时，请使用已批准的
私有 issue destination。

#### 审查建议写入

1. 确认 finding ID 和 fingerprint 来自预期的密封扫描。
2. 确认 provider、确切的 Linear team、GitHub repository、Jira project 或
   advisory repository，以及实时 destination visibility。
3. 审查重复结果：`create`、`reuse`、`update` 或 `blocked`。
4. 阅读完整的建议 title、body、source locations 和 provider
   metadata。移除 destination 不应暴露的 exploit detail 或内部证据。
5. 只批准该确切 payload。destination、visibility、finding
   set 或 body 发生变化时，需要新的 preview。

敏感 findings 应进入私有 destination。在内部或公开 GitHub 仓库中创建 issue
需要明确的可见性警告，并批准完整内容。将草稿 advisory description 视为
最终会公开，并在批准前移除凭据、私有证据和不必要的
exploit details。

#### 验证 tracked item

批准后，Codex 会重新验证密封 source、destination、access 和
duplicate state。它会串行处理 batch，并在第一个不确定
结果处停止。create、update 或 reuse 只有在 Codex 读回确切
issue 并验证其绑定 identifiers 和 content 后才算完成。

将返回的 canonical issue 或 advisory URL 与你的分诊记录放在一起。
当 owner 接受该 item 进行修复时，继续 [Fix and verify a finding](/codex/security/plugin/fix-findings)。

### 修复并验证 security findings

来源：[Fix and verify security findings](/codex/security/plugin/fix-findings.md)

Codex Security 可帮助你把已接受 findings 的 backlog 转化为经过测试的代码
变更。你可以在 findings workspace UI 中修复 findings，或从提示、
命令行或 CI/CD 调用 remediation 工作流。在每种情况下，
Codex 都会验证问题、提出聚焦补丁、添加回归覆盖，
并验证合法行为仍然有效。

先修复一个已接受 finding，以评估补丁和
验证质量。一旦工作流满足你的标准，就通过在单独任务或 CI/CD
job 中处理每个 finding，将其扩展到更多已接受 findings。
保持每个修复范围明确，会让代码变更和证据更容易
审查。

#### 在 UI 中修复 finding

在 findings workspace 中打开一个已接受 finding，以生成、审查、应用
并验证其补丁。

1. 生成聚焦补丁

   打开 finding，选择 **Patch** tab，然后选择 **Generate patch**。
   Codex 会在可行时验证或复现问题，并写入 patch
   artifact，而不修改选定 checkout。

2. 审查建议 diff

   阅读每个变更的 source 和 regression-test 文件。当你想在编辑器中查看完整 patch 时，使用 **Open diff in
   editor**。拒绝宽泛重构、
   无关清理，或会削弱其他安全控制的变更。

3. 在本地应用补丁

   只有在 diff 可接受后才选择 **Apply patch locally**。Codex
   会把确切生成的 patch 应用到 working tree，并记录该状态。
   继续前审查 working-tree diff。

4. 验证修复

   选择 **Verify fix**。Codex 会重新运行原始 reproducer 或最强
   可用 exploit check、聚焦回归覆盖、合法行为
   检查、附近 bypass checks，以及相关仓库测试。

5. 有意识地关闭 finding

   验证不会自动关闭 finding。审查命令、
   结果和剩余证明缺口，然后用准确
   原因关闭 finding，或保持打开以继续工作。

   在本地应用补丁前审查建议 source 和 test changes。

#### 从 CLI 修复 finding

当你已经从扫描、ticket、advisory、
disclosure、安全评估或内部审查中得到 finding 时，使用 Codex CLI：

下面的命令假设 Codex Security 已安装在
`codex exec` 使用的 `CODEX_HOME` 中。新的 CI runner 默认没有安装 marketplace
plugins。

```text
Use $codex-security:fix-finding to fix finding  from . Validate the issue, make the smallest safe change, add focused regression coverage, and verify that the issue no longer reproduces.
```

包含已知 source、sink、attacker input、impact、expected invariant、
reproducer、affected files 和 validation command。Codex 可以检查
仓库以补齐缺失技术细节，但在猜测产品策略或预期安全不变量前应先询问。

对于自动化运行，请在检出代码、提供 finding report，并在该
`CODEX_HOME` 中 provision plugin 后，将提示传给 `codex exec`：

```bash
codex exec 'Use $codex-security:fix-finding to fix finding  from . Validate the issue, make the smallest safe change, add focused regression coverage, and verify that the issue no longer reproduces.'
```

#### 在 CI/CD 中扫描并修复 findings

在调用这些 skills 前，在 runner 的 `CODEX_HOME` 中 provision Codex Security。
下面的命令使用已安装 plugin；它本身不安装
plugin。

在 CI/CD 中，使用一次 Codex 运行扫描 diff，并为它发现的每个
finding 生成修复。该 job 不需要 finding IDs 或 report paths 作为
输入。Codex 会在同一次运行中把扫描得到的 findings 带入 remediation。

一体化运行应：

1. 解析该变更的 base 和 head revisions。
2. 对该 diff 运行 `$codex-security:security-diff-scan`。
3. 对扫描返回的每个 finding 调用 `$codex-security:fix-finding`。
4. 生成聚焦补丁和回归覆盖，然后验证每个修复。
5. 返回扫描结果、补丁、测试、验证命令，以及任何
   它无法修复的 finding。

例如：

```bash
codex exec 'Use $codex-security:security-diff-scan to review changes from  to HEAD. For every finding returned by the scan, use $codex-security:fix-finding to generate and verify a minimal fix. Continue until every finding has either a verified fix or an explicit explanation of why it could not be fixed. Return the scan results, patches, tests, verification commands, and remaining failures.'
```

验证后，通过你的常规 code-review 和 release
流程合并 patch。若要在修复前将 findings 交给另一个团队，请参阅 [Export or
track findings](/codex/security/plugin/export-findings)。

### 改进威胁模型

来源：[Improving the threat model](/codex/security/threat-model.md)

了解威胁模型是什么，以及编辑它如何改进 Codex Security 的建议。

#### 威胁模型是什么

威胁模型是关于你的仓库如何工作的简短安全摘要。在 Codex Security 中，你把它作为 `project overview` 编辑，系统会将其用作未来扫描、优先级排序和审查的扫描上下文。

Codex Security 会从代码创建第一份草稿。如果 findings 感觉不准确，这是首先要编辑的内容。

一个有用的威胁模型会指出：

- 入口点和不可信输入
- 信任边界和认证假设
- 敏感数据路径或特权动作
- 你的团队希望优先审查的区域

例如：

> Public API for account changes. Accepts JSON requests and file uploads. Uses an internal auth service for identity checks and writes billing changes through an internal service. Focus review on auth checks, upload parsing, and service-to-service trust boundaries.

这会为 Codex Security 之后的扫描和 finding 优先级排序提供更好的起点。

#### 改进并重新审视威胁模型

如果你想改进结果，请先编辑威胁模型。当 findings 漏掉你关心的区域，或出现在你不预期的位置时使用它。威胁模型会改变未来的扫描上下文。

有些用户会把当前威胁模型复制到 Codex 中，围绕他们希望更仔细审查的区域进行对话，
然后把更新后的版本粘贴回 web UI。

#### 在哪里编辑

要审查或更新威胁模型，请前往 [Codex Security scans](https://chatgpt.com/codex/security/scans)，打开仓库并点击 **Edit**。

#### 威胁模型参考

- [Codex Security setup](/codex/security/setup) 涵盖仓库设置和 findings 审查。
- [Codex Security](/codex/security) 提供产品概览。
- [FAQ](/codex/security/faq) 涵盖常见问题。

### 审查代码变更的安全性

来源：[Review code changes for security](/codex/security/plugin/code-changes.md)

当你需要关于一个 Git 支持的变更集引入的回归的证据时，
使用安全变更审查。该工作流会审查每个已变更的源代码类
文件和直接支持代码，而不会把任务扩展为一般性的
仓库审计。

如果你想扫描完整仓库而不是特定变更，请参阅 [Run a
security scan](/codex/security/plugin/scans)。

#### 运行手动审查

对于未提交变更，发送：

```text
Use $codex-security:security-diff-scan to review my current uncommitted changes for security regressions.
```

对于 commit 或 branch range，在需要时标识两端：

```text
Use $codex-security:security-diff-scan to review the changes from origin/main to HEAD for security regressions. Focus on authentication, authorization, input handling, filesystem access, network requests, and secrets.
```

当 pull request 的 base 和 head revisions 在本地 checkout 中可用时，
你也可以命名一个 pull request。

#### 在设置中确认变更

1. 确认 **Scan type** 是 `Changes`。
2. 确认已检出的 **Codebase**、**Current branch** 和 **Last commit**。
3. 在 **Changes to review** 下选择：
   - 当前 working tree 选择 `Uncommitted changes`。
   - 单 commit 审查选择最新 commit。
   - branch 或 pull-request range 选择 base 和 head revision。
4. 确认摘要描述的是你打算审查的变更。
5. 选择 **Start scan**。

该工作流不会检出另一个 branch，也不会更改选定 working
tree。如果请求的 revision 在本地不可用，请在审查前 fetch，
或提供本地可用的 base 和 head。

#### 根据 findings 采取行动

审查结果后，[fix and verify an accepted
finding](/codex/security/plugin/fix-findings) 或 [export and track
findings](/codex/security/plugin/export-findings)。

#### 在 CI/CD 中自动化审查

当 runner 可以无交互调用 Codex CLI 时，从 CI 运行相同的 `$codex-security:security-diff-scan` skill。runner 必须已经在
`codex exec` 使用的 `CODEX_HOME` 中安装 Codex Security。新的
runner 默认没有安装 marketplace plugins，
`openai/codex-action` 也不会安装该 plugin。

运行扫描前：

1. 在 runner 的 `CODEX_HOME` 中 provision Codex Security。
2. 检出确切的 base 和 head revisions 及其 Git history。
3. 将 runner 的平台临时目录（例如 `TMPDIR`）设置为
   可写 artifact 位置。diff-scan 工作流会审查 checkout
   而不更改它，但会在仓库外写入密封的 scan bundle 和 final report。
4. 从 advisory results 开始。在把 job 设为 required check 之前，审查扫描质量和运行时间。

然后显式调用 plugin：

```bash
export CODEX_HOME=/path/to/provisioned-codex-home
export TMPDIR=/path/to/writable/temp

codex exec \
  --sandbox workspace-write \
  --output-last-message "$TMPDIR/codex-security-review.md" \
  'Use $codex-security:security-diff-scan to review changes from  to  for security regressions. Do not modify the checkout. Return the final report path, findings summary, reviewed surfaces, deferred coverage, and open questions.'
```

归档生成的 scan bundle 和 final report，然后通过你的 CI/CD 系统发布 Markdown
摘要。如果你使用 `openai/codex-action`，将其
`codex-home` input 指向同一个已 provision 目录，并传入上面的 skill prompt。
该 action 可以安装并运行 Codex CLI，但 plugin provisioning 是
独立前置条件。

关于 API-key handling、sandbox controls、fork protections 和 GitHub Actions
workflow，请参阅 [Codex GitHub Action guide](/codex/github-action)。

### 运行 Codex Security 扫描

来源：[Run a Codex Security scan](/codex/security/plugin/scans.md)

使用 Codex Security scan 进行你的首次审查，以及大多数常规仓库
或组件评估。它会完整运行一次扫描工作流。

一旦你对结果满意，运行 [deep scan](/codex/security/plugin/deep-scans)
进行更全面的评估。Deep scans 需要更久，但更
彻底。

#### 选择扫描区域

当你需要广泛覆盖且仓库是一个合理审查单元时，
扫描整个仓库：

```text
Use $codex-security:security-scan to scan this repository for security vulnerabilities.
```

当 monorepo 太大，或某个 service、package 或 component
有清晰 owner 和安全边界时，扫描一个文件夹：

```text
Use $codex-security:security-scan to scan this repository for security vulnerabilities, focusing on the services/billing component.
```

对于大型 monorepo，从一个有意义的 product 或 service 边界开始。

#### 配置扫描

1. 确认 **Scan type** 是 `Codebase`，并保持 **Deep scan** 关闭。
2. 确认 **Codebase**、**Current branch** 和 **Last commit**。
3. 将 **Scan area** 设置为 `Entire codebase`，或输入一个相对于仓库的
   folder。
4. 只有当威胁模型指引会改变审查时才添加它。有用指引会
   命名 attacker-controlled inputs、trust boundaries、sensitive actions，或需要优先处理的
   specific area。
5. 选择 **Start scan**。

`AGENTS.md` 中的仓库特定指引也可以建立产品
surfaces、trust boundaries、受支持 validation commands 和 out-of-scope
areas。启动扫描前，优先使用具体仓库上下文，而不是泛泛的规划步骤。

#### 等待各阶段完成

扫描按顺序运行这些阶段：

1. **Threat modeling** 识别 assets、entry points、trust boundaries 和
   security invariants。
2. **Finding discovery** 审查请求的代码，寻找可能的 broken
   controls 和 source-to-sink paths。
3. **Validation** 测试或以其他方式检查每个 candidate，并记录证据
   或 proof gaps。
4. **Attack-path analysis** 评估现实可达性、影响和
   严重性。
5. **Finalization** 验证结构化扫描 contract 并生成
   `report.md`。

扫描运行时，Codex 会报告阶段和 coverage progress。不要根据早期 candidates 判断
结果，也不要因为某一阶段比另一阶段花费更久就停止扫描。

#### 审查已完成扫描

按此顺序审查结果：

1. 确认 target、revision 和 scan area。
2. 阅读 reviewed surfaces，以及每个明确 deferred 或 follow-up area。
3. 对每个 finding，检查 root control 或 sink、attacker-controlled
   input、validation method、remaining uncertainty、realistic reachability、
   severity rationale 和 proposed remediation。
4. Dismiss 证据不支持所声称 path 或 impact 的 findings。
5. 在开始修复前选择一个 accepted finding。

   已完成 workspace 会先总结 scan status、coverage、severity 和
   artifacts，然后列出 findings。

   一个 finding 会把相关 source 连接到其 entry point、reachability、
   likelihood、impact，以及任何 limits 或 counterevidence。

#### 使用结果

使用 findings workspace 进行常规审查。它会呈现 findings、coverage
和 follow-up areas，而不需要你检查原始 JSON。当你需要一个
可共享或归档的完整可移植审查时，打开 `report.md`。

在 workspace 背后，每次扫描都会保留 `scan-manifest.json`、`findings.json`
和 `coverage.json`，用于自动化和集成。你通常不需要
自己打开这些文件。

findings workspace 还可以创建可移植 JSON、CSV 和 SARIF 文件。见
[Export or track findings](/codex/security/plugin/export-findings)。

#### 下一步

当有人接受一个 finding 后，使用 [Fix and verify a finding](/codex/security/plugin/fix-findings)
生成并审查一个有界补丁。不要要求 Codex 在一个任务中修复扫描中的每个 finding。

### 运行 deep security scan

来源：[Run a deep security scan](/codex/security/plugin/deep-scans.md)

Deep scan 比 standard scan 更慢，但更彻底。当你
想降低变异性并更全面搜索时使用它。

先从 [standard scan](/codex/security/plugin/scans) 开始。当你
对结果满意后，再运行 deep scan 进行更彻底评估。

#### 在 standard 和 deep scans 之间选择

|                         | Standard scan | Deep scan |
| ----------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| 最适合 | 首次运行以及常规仓库或文件夹审查 | 在 standard scan 后进行更彻底审查 |
| 变异性 | 标准 | 降低 |
| 范围 | 仓库或显式文件夹 | 仓库或显式文件夹 |
| 运行时间和资源 | 较低 | 较高 |
| Pull requests 和 diffs | 使用 change-review workflow | 不支持；改用 change-review workflow |

#### 启动 deep scan

对于仓库范围审查，发送：

```text
Use $codex-security:deep-security-scan to run a deep security scan of this repository.
```

对于 monorepo 中的一个 component，显式标识 folder：

```text
Use $codex-security:deep-security-scan to run a deep security scan of /absolute/path/to/repository/services/payments.
```

在 Codex app 中，scoped deep scan 会把选定 folder 解析为
**Codebase**，并将其 scan area 显示为整个选定 target。

#### 确认设置和 preflight

1. 确认 **Scan type** 是 `Codebase` 且 **Deep scan** 开启。
2. 确认 **Codebase** 是你打算扫描的仓库或确切 folder。
3. 只有针对具体 attack vectors、sensitive
   application areas，或代码无法揭示的 repository context 时才添加 threat-model guidance。
4. 选择 **Start scan**。
5. 审查 capability preflight。如果它提出配置变更，
   请审查确切变更，并仅在其匹配你的
   环境时允许 Codex 应用。如果 Codex 告诉你需要 restart，请启动新线程。

#### 审查结果

Deep scans 使用与 standard scans 相同的 findings workspace 和生成的 `report.md`。
在 findings 前先审查 coverage summary。Deep scan 会更广泛地搜索
代码，但任何 deferred surface 或 proof gap 仍会限制
结论。对于你接受的 finding，继续 [Fix and verify a
finding](/codex/security/plugin/fix-findings)。

要审查 pull request、commit、branch range 或 local patch，请使用 [Review code
changes](/codex/security/plugin/code-changes)。Deep scan 永远不能替代
面向 diff 的工作流。

### 分诊 backlog

来源：[Triage a backlog](/codex/security/plugin/triage-backlog.md)

使用 `$codex-security:triage-finding` 针对当前仓库审查现有 security findings。
该工作流会执行只读静态分析：Codex 会把每个 finding 视为未经证实的 claim，并在不执行代码的情况下检查仓库
证据。

从一个作用域为你要评估仓库的 Codex project 运行此工作流。
Codex 必须能够读取该仓库的源代码。Jira、Linear
和 GitHub connectors 会提供 finding data，但它们不会替代对
源代码的访问。

在底层，Codex 会从被引用的代码或版本信息开始。它会
追踪声称的 attacker-controlled source、相关 security controls、
dangerous sink 和 reachable path。它还会检查 product surface 和 trust
boundary，寻找 counterevidence，并记录 proof gaps。然后 Codex 会为每个 finding 返回一个 verdict，并排序需要 action 或 further
review 的 findings。

这不同于 `$codex-security:validation`，后者可以构建或运行代码、
创建聚焦 test 或 proof of concept，或操作真实 interface 来
复现或反驳 finding。使用 triage 对现有 backlog 进行分类和优先级排序。
当 runtime evidence 可以解决静态证据留下的不确定性时，使用 validation。

Backlog triage 从现有 findings 开始。要在仓库中搜索新
漏洞，请 [run a security scan](/codex/security/plugin/scans)。Triage
不会修改仓库或实现修复。

#### 选择要分诊的 findings

你可以从这些来源提供一个 finding 或一个集合：

| 来源 | 要提供的内容 | 要求 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 粘贴或本地 findings | SARIF results、CVE 或 GHSA、advisory、scanner ticket、bug bounty report、Codex Security finding artifact，或自然语言 vulnerability claim。 | 不需要 connector。 |
| Jira 或 Linear | 确切 security 或 vulnerability issue URLs 或 identifiers、Jira JQL，或 Linear team、project 或 search phrase。Codex 会在 triage 前检索选定 issue content。 | 具备 read access 的 [Jira through Atlassian Rovo](codex://plugins/plugin_connector_692de805e3ec8191834719067174a384) 或 [Linear](codex://plugins/plugin_asdk_app_69a089a326dc8191b32a3f2553f5be2c)。 |
| GitHub | 一个 repository 和一个 finding source：code scanning、`Dependabot` vulnerabilities and malware、security advisories and private vulnerability reports，或 all sources。如果你没有指定 repository，Codex 会在可用时使用附加到当前 Codex project 的 GitHub repository。GitHub Issues 不包含在默认 GitHub sources 中；当你要 triage 它们时，请提供特定 issue 或明确要求 GitHub Issues。 | 具备所选 repository 和 finding type 访问权限的 [GitHub](codex://plugins/plugin_connector_1p_1a69035c238881919c4190932b2df699)。 |

Codex 会按输入顺序为每个提供的 finding 保留一个结果，因此每个
source finding 都保持可追踪。它不会合并或丢弃看起来
像重复项的 findings。

#### 运行只读 triage

对于粘贴的 findings 或本地 artifacts，发送类似提示：

```text
Use $codex-security:triage-finding to triage these existing security findings against this repository:

[Paste the findings or provide the artifact path.]
```

对于 Jira 或 Linear issues，标识 issue set，并保持 source system
只读：

```text
Use $codex-security:triage-finding to import and triage the security findings from [Jira or Linear issue URLs, identifiers, or query] against this repository.
Do not change the source issues.
```

对于 GitHub findings，命名 repository 和 source：

```text
Use $codex-security:triage-finding to import and triage [code scanning, Dependabot vulnerabilities and malware, security advisories and private vulnerability reports, or all] from [owner/repository] against this repository.
```

要使用附加到当前 Codex project 的 GitHub repository，只指定
finding source：

```text
Use $codex-security:triage-finding to import and triage [code scanning, Dependabot vulnerabilities and malware, security advisories and private vulnerability reports, or all] from GitHub against this repository. Use the GitHub repository attached to the current Codex project.
```

工作流按以下顺序进行：

1. 收集并组织 findings

   Codex 会检索任何请求的 issue 或 GitHub content，保留 source
   identifiers 和 references，并为每个 input 创建一个 triage item。它会先构建
   完整 item list，再分配 verdicts。

2. 确认仓库上下文

   Codex 会在可用时解析当前 repository 和 revision。存在 `SECURITY.md` 时会读取它，
   让 supported versions、trusted inputs、product
   boundaries 和 out-of-scope surfaces 参与评估。

3. 检查静态证据

   对每个 finding，Codex 会追踪所声称的 attacker-controlled source、
   relevant security control、vulnerable sink、reachable path，以及 supported
   security boundary。它会记录 supporting evidence、反对该
   claim 的证据，以及 proof gaps。

4. 分配 verdicts 和 ranks

   Codex 会为每个 finding 分配 verdict 和 confidence。它会按 exploitability 在独立队列中排序
   `confirmed` 和 `needs_review` findings。

#### 审查结果

| Verdict | 含义 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `confirmed` | 仓库证据显示，在给定前提条件下，vulnerable path 可达，并跨越受支持的 security boundary。 |
| `not_actionable` | 仓库证据排除了该 claim，例如显示版本不受影响、路径不可达、存在有效防护，或不是已发布 surface。 |
| `needs_review` | 仓库证据不足以做出决定，因为所需信息缺失、含糊、依赖 runtime、依赖 environment 或依赖 policy。 |

Exploitability ranks 使用从 `1` 开始的正整数，并在
每个 verdict queue 中独立排序。这会把 remediation priorities 与
未解决 review work 分开。Rank `1` 是该结果集中最可利用的 `confirmed` finding
或最高优先级的 `needs_review` finding。rank
不是 scanner severity score，`not_actionable` findings 不会排序。

对每个 finding，审查：

- verdict 和 rank 的 rationale
- supporting evidence 以及反对该 claim 的证据
- open questions 和 remaining proof gaps
- affected location 和 component
- product surface 和 source trust level
- recommended next step
- 当 finding 是 `confirmed` 时的 [`$codex-security:fix-finding`](/codex/security/plugin/fix-findings)
  handoff

当每个提供的 finding 都有一个结果、Codex 保留其
source identifier，并且任何 uncertainty 都被明确写出时，Triage 完成。Jira、Linear 和其他
backlog records 会保持不变，除非你在审查 triage results 后
要求 Codex 写回。

#### 后续步骤

- `confirmed`：当有人接受该 finding 进行 remediation 后，使用
  [`$codex-security:fix-finding`](/codex/security/plugin/fix-findings) 修复并
  验证它。Triage 会准备一个 prompt-ready handoff，但不会自动调用该 skill。
- `needs_review`：如果运行代码可以解决 proof gap，使用
  `$codex-security:validation` 执行有界动态验证。传入
  triage result 中的 finding claim、affected locations、preconditions、static evidence 和
  proof gaps：

  ```text
  Use $codex-security:validation to dynamically validate finding [triage item ID or source ID] from the backlog triage result. Use the strongest realistic, bounded method, record exactly what was tested, and preserve any remaining proof gaps.
  ```

  与 triage 不同，validation 可能构建或运行代码、创建聚焦 test 或
  proof of concept，或操作真实 interface。批准命令前请审查建议命令，
  并保持 [Codex approval and security
  policies](/codex/agent-approvals-security) 启用。

- `needs_review`：如果 finding 取决于产品策略或部署
  上下文，请先回答列出的 open questions，再更改代码。
- `not_actionable`：把证据与你的 triage record 放在一起。Codex 不会
  自动关闭或更新 source ticket。
- 要查找超出所提供 backlog 的漏洞，请 [run a security
  scan](/codex/security/plugin/scans)。

### Agent approvals & security

来源：[Agent approvals & security](/codex/agent-approvals-security.md)

Codex 帮助保护你的代码和数据，并降低误用风险。

本页涵盖如何安全操作 Codex，包括沙盒、审批
和网络访问。如果你正在寻找 Codex Security，即用于
扫描已连接 GitHub 仓库的产品，请参阅 [Codex Security](/codex/security)。

默认情况下，智能体运行时会关闭网络访问。在本地，Codex 使用 OS 强制执行的沙盒，限制它可以触碰的内容（通常限于当前 workspace），并配合一个审批策略，控制它何时必须停下来并在行动前询问你。

关于沙盒如何跨 Codex app、IDE
extension 和 CLI 工作的高层说明，请参阅 [sandboxing](/codex/concepts/sandboxing)。
更广泛的企业安全概览，请参阅 [Codex security white paper](https://trust.openai.com/?itemUid=382f924d-54f3-43a8-a9df-c39e6c959958&source=click)。

#### 沙盒与审批

Codex 安全控制来自两个协同工作的层：

- **Sandbox mode**：当 Codex 执行模型生成的命令时，它在技术上可以做什么（例如，可以在哪里写入，以及是否能访问网络）。
- **Approval policy**：Codex 何时必须在执行动作前询问你（例如，离开沙盒、使用网络，或运行不在 trusted set 中的命令）。

Codex 会根据运行位置使用不同沙盒模式：

- **Codex cloud**：在 OpenAI 管理的隔离容器中运行，防止访问你的主机系统或无关数据。使用两阶段运行时模型：setup 在 agent phase 前运行，并可访问网络以安装指定依赖；随后 agent phase 默认离线运行，除非你为该 environment 启用 internet access。为 cloud environments 配置的 secrets 只在 setup 期间可用，并会在 agent phase 开始前移除。
- **Codex CLI / IDE extension**：OS 级机制强制执行沙盒策略。默认包括无网络访问，以及写入权限限制为活动 workspace。你可以根据风险承受能力配置 sandbox、approval policy 和 network settings。

在 `Auto` 预设中（例如 `--sandbox workspace-write --ask-for-approval on-request`），Codex 可以自动读取文件、进行编辑，并在 working directory 中运行命令。

Codex 在编辑 workspace 外文件，或运行需要网络访问的命令时，会请求审批。如果你想只聊天或规划而不做变更，请用 `/permissions` 命令切换到 `read-only` mode。

Codex 也可以对声明有副作用的 app（connector）工具调用发起审批，即使该动作不是 shell command 或文件变更。当工具声明 destructive annotation 时，破坏性 app/MCP 工具调用始终需要审批，即使它也声明了其他提示（例如 read-only hints）。

#### 网络访问

对于 Codex app、CLI 或 IDE Extension，默认 `workspace-write` sandbox mode 会保持网络访问关闭，除非你在配置中启用它：

```toml
[sandbox_workspace_write]
network_access = true
```

#### 网络隔离

网络访问通过 destination rules 控制，这些规则适用于命令生成的 scripts、
programs 和 subprocesses。当 command network access
已经启用时，打开 `network_proxy` feature，把该流量限制在你配置的 network policy 中。

```toml
[features.network_proxy]
enabled = true
domains = { "api.openai.com" = "allow", "example.com" = "deny" }
```

对于一次性 CLI session，当你只需要
开关时使用 boolean shorthand；当你还要设置 policy options 时使用 table form：

```bash
codex \
  -c 'features.network_proxy=true' \
  -c 'sandbox_workspace_write.network_access=true'

codex \
  -c 'features.network_proxy.enabled=true' \
  -c 'features.network_proxy.domains={ "api.openai.com" = "allow", "example.com" = "deny" }' \
  -c 'sandbox_workspace_write.network_access=true'
```

该 feature 会改变已启用网络访问的强制执行方式；它本身不授予
网络访问。使用 `sandbox_workspace_write.network_access` 搭配
`workspace-write` config 来决定命令是否完全有网络访问：

- Network off + `network_proxy` on：network 保持关闭，该 feature 不起作用。
- Network on + `network_proxy` off：network 保持开启，并具有无限制的直接
  outbound access。
- Network on + `network_proxy` on：network 保持开启，outbound traffic 会
  受配置的 network policy 约束。

管理员管理的 `experimental_network` requirements 独立于用户
feature toggle。它们可以在没有
`features.network_proxy` 的情况下配置并启动 sandboxed networking，但当活动
sandbox 保持关闭时，它们不会开启网络访问。参阅 [Managed configuration](/codex/enterprise/managed-configuration#configure-network-access-requirements)
了解管理员侧 `requirements.toml` 形态。

#### 网络策略

Domain rules 以 allowlist 优先：

- Exact hosts 只匹配自身。
- `*.example.com` 匹配 `api.example.com` 等 subdomains，但不匹配
  `example.com`。
- `**.example.com` 同时匹配 apex 和 subdomains。
- 全局 `*` allow rule 匹配任何未被 deny 的 public host。将 `*`
  视为宽泛网络访问，并尽可能优先使用 scoped rules。
- `deny` 始终优先于 `allow`，全局 `*` 只对 allow rules 有效。

#### 本地和私有 destination

默认情况下，`allow_local_binding = false` 会阻止 loopback、link-local 和
private destinations：

- 具体例外：当命令需要一个本地目标时，添加精确的 local IP literal 或 `localhost` allow rule。
- 更广泛访问：只有在你有意需要更宽的 local/private reach 时，才设置 `allow_local_binding = true`。
- Wildcards：wildcard rules 不算显式 local exceptions。
- Resolved addresses：解析为 local/private IPs 的 hostnames 即使匹配 allowlist，也会保持 blocked。

#### DNS rebinding protections

在允许 hostname 前，Codex 会执行 best-effort DNS 和 IP
classification check：

- 失败或超时的 lookups 会被阻止。
- 解析为 non-public addresses 的 hostnames 会被阻止。
- 该检查会降低 DNS rebinding risk，但不能消除它。要完全防止
  rebinding，需要通过 transport
  layer 固定 resolved IPs。

如果 hostile DNS 在范围内，也请在更低层强制执行 egress controls。

#### 危险设置

两个设置会有意扩大 trust boundary：

- `dangerously_allow_non_loopback_proxy = true` 可能把 proxy listeners 暴露到
  loopback 之外。
- `dangerously_allow_all_unix_sockets = true` 会绕过 Unix socket allowlist。

只在严格受控环境中使用它们。当 Unix socket proxying
启用时，即使请求了 non-loopback binding，listeners 也会保持 loopback-only，
因此 sandboxed networking 不会变成进入 local daemons 的远程桥梁。

`network_proxy` 默认关闭。启用它时：

| Setting | Default | Behavior |
| -------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled` | `false` | 只有在 command network access 已开启时，才启动 sandboxed networking。 |
| `domains` | unset | 使用 allowlist 行为，因此在添加 `allow` rules 前，不允许外部 destinations。支持 exact hosts、scoped wildcards 和 global `*` allow rules；`deny` 始终优先。 |
| `unix_sockets` | unset | 在你添加显式 `allow` rules 前，不允许 Unix socket destinations。 |
| `allow_local_binding` | `false` | 阻止 local 和 private-network destinations，除非你添加精确 local IP literal 或 `localhost` allow rule，或显式选择更宽泛的 local/private access。 |
| `enable_socks5` | `true` | 当 policy 允许时暴露 SOCKS5 support。 |
| `enable_socks5_udp` | `true` | 当 SOCKS5 可用时允许 UDP over SOCKS5。 |
| `allow_upstream_proxy` | `true` | 允许 sandboxed networking 使用 environment 中的 upstream proxy。 |
| `dangerously_allow_non_loopback_proxy` | `false` | 除非你有意把 endpoints 暴露到 localhost 之外，否则 listener endpoints 保持在 loopback。 |
| `dangerously_allow_all_unix_sockets` | `false` | 除非你有意绕过该保护，否则 Unix socket access 保持基于 allowlist。 |

你也可以在不授予 spawned commands 完整网络访问的情况下控制 [web search tool](https://platform.openai.com/docs/guides/tools-web-search)。Codex 默认使用 web search cache 访问结果。该 cache 是由 OpenAI 维护的 web results index，因此 cached mode 会返回预索引结果，而不是获取 live pages。这减少了来自任意 live content 的 prompt injection 暴露，但你仍应把 web results 视为不可信。如果你使用 `--yolo` 或另一个 [full access sandbox setting](#common-sandbox-and-approval-combinations)，web search 默认使用 live results。使用 `--search` 或设置 `web_search = "live"` 允许 live browsing，或将其设为 `"disabled"` 关闭该工具：

```toml
web_search = "cached"  # default
# web_search = "disabled"
# web_search = "live"  # same as --search
```

在 Codex 中启用网络访问或 web search 时请谨慎。Prompt injection 可能导致智能体获取并遵循不可信指令。

#### 默认值和建议

- 启动时，Codex 会检测文件夹是否受版本控制，并建议：
  - Version-controlled folders：`Auto`（workspace write + on-request approvals）
  - Non-version-controlled folders：`read-only`
- 根据你的设置，Codex 也可能以 `read-only` 启动，直到你显式信任 working directory（例如通过 onboarding prompt 或 `/permissions`）。
- workspace 包括当前目录和 `/tmp` 等临时目录。使用 `/status` 命令查看哪些目录在 workspace 中。
- 要接受默认值，运行 `codex`。
- 你可以显式设置这些：
  - `codex --sandbox workspace-write --ask-for-approval on-request`
  - `codex --sandbox read-only --ask-for-approval on-request`

#### writable roots 中的受保护路径

在默认 `workspace-write` sandbox policy 中，writable roots 仍包含 protected paths：

- `/.git` 无论作为目录还是文件出现，都是 read-only。
- 如果 `/.git` 是 pointer file（`gitdir: ...`），解析出的 Git directory path 也受 read-only 保护。
- 当 `/.agents` 作为目录存在时，它受 read-only 保护。
- 当 `/.codex` 作为目录存在时，它受 read-only 保护。
- 保护是递归的，因此这些 paths 下的所有内容都是 read-only。

#### 不显示审批提示运行

你可以用 `--ask-for-approval never` 或 `-a never`（简写）禁用审批提示。

该选项适用于所有 `--sandbox` modes，因此你仍然可以控制 Codex 的自主程度。Codex 会在你设置的约束内尽最大努力。

如果你需要 Codex 在没有审批提示的情况下读取文件、进行编辑，并运行带网络访问的命令，请使用 `--sandbox danger-full-access`（或 `--dangerously-bypass-approvals-and-sandbox` flag）。这样做前请谨慎。

作为折中方案，`approval_policy = { granular = { ... } }` 允许你保留特定审批提示类别的交互，同时自动拒绝其他类别。granular policy 覆盖 sandbox approvals、execpolicy-rule prompts、MCP prompts、`request_permissions` prompts 和 skill-script approvals。

#### 自动审批审查

默认情况下，审批请求会发送给你：

```toml
approvals_reviewer = "user"
```

当 approvals 可交互时（例如
`approval_policy = "on-request"` 或 granular approval policy），会应用 automatic approval reviews。设置
`approvals_reviewer = "auto_review"`，可在 Codex 运行请求前把符合条件的 approval requests
路由给 reviewer agent：

```toml
approval_policy = "on-request"
approvals_reviewer = "auto_review"
```

完整 reviewer lifecycle、触发条件、配置优先级
和失败行为，见
[Auto-review](/codex/concepts/sandboxing/auto-review)。

reviewer 只评估已经需要审批的 actions，例如 sandbox
escalations、blocked network requests、`request_permissions` prompts，或
具有 side effect 的 app 和 MCP tool calls。保持在 sandbox 内的 actions
会继续运行，不需要额外 review step。

reviewer policy 会检查 data exfiltration、credential probing、persistent
security weakening 和 destructive actions。Low-risk 和 medium-risk actions
可在 policy 允许时继续。policy 会拒绝 critical-risk actions。
High-risk actions 需要足够的 user authorization 且没有匹配的 deny rule。
Prompt-build、review-session 和 parse failures 会 fail closed。Timeouts 会
单独显示，但 action 仍不会运行。

[default reviewer policy](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md)
位于开源 Codex repository 中。Enterprises 可以用 managed requirements 中的
`guardian_policy_config` 替换其中的 tenant-specific section。
本地 `[auto_review].policy` text 也受支持，但 managed requirements
优先。设置细节见
[Managed configuration](/codex/enterprise/managed-configuration#configure-automatic-review-policy)。

在 Codex app 中，这些 reviews 会显示为 automatic review items，并带有状态，
例如 Reviewing、Approved、Denied、Aborted 或 Timed out。它们还可以
包含 risk level 和被审查
request 的 user-authorization assessment。

Automatic review 会使用额外模型调用，因此可能增加 Codex 使用量。Admins
可以通过 `allowed_approvals_reviewers` 限制它。

### Cyber Safety

来源：[Cyber Safety](/codex/concepts/cyber-safety.md)

[GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/) 是我们在 [Preparedness Framework](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf) 下视为 High cybersecurity capability 的第一个模型，该框架要求额外防护。这些防护包括训练模型拒绝明显恶意的请求，例如窃取凭据。

除了安全训练，基于自动分类器的监控会检测可疑网络安全活动信号，并将高风险流量路由到网络安全能力较低的模型（GPT-5.2）。我们预计只有很小一部分流量会受到这些缓解措施影响，并正在完善我们的政策、分类器和产品内通知。

#### 我们为什么这样做

近几个月，我们看到模型在网络安全任务上的表现显著提升，这让开发者和安全专业人员都受益。随着我们的模型在漏洞发现等网络安全相关任务上不断进步，我们采取预防性方式：扩展保护和执行，以支持合法研究，同时减缓误用。

网络安全能力天然具有双重用途。支撑重要防御工作的同一知识和技术（渗透测试、漏洞研究、大规模扫描、恶意软件分析和威胁情报）也可能导致现实世界伤害。

这些能力和技术需要在能够用于改进安全性的上下文中可用且更容易使用。我们的 [Trusted Access for Cyber](https://openai.com/index/trusted-access-for-cyber/) 试点允许个人和组织继续使用模型进行潜在高风险网络安全活动，而不会被中断。

#### 它如何工作

从事网络安全相关工作，或类似活动且可能被自动检测系统 [mistaken](#false-positives) 的开发者和安全专业人员，可能会让请求被重新路由到 GPT-5.2 作为 fallback。我们预计只有很小一部分流量会受到缓解措施影响，并正在积极校准我们的政策和分类器。

Codex CLI 的最新 alpha 版本包含产品内消息，
会在请求被重新路由时显示。此消息将在未来几天内
支持所有客户端。

受缓解措施影响的账户可以通过加入下面的 [Trusted Access](#trusted-access-for-cyber) 计划重新获得 GPT-5.3-Codex 访问权限。

我们认识到加入 Trusted Access 可能并不适合每个人，因此随着我们扩展这些缓解措施并 [strengthen](https://openai.com/index/strengthening-cyber-resilience/) 网络韧性，我们计划在大多数情况下从账户级安全检查转向请求级检查。

#### Trusted Access for Cyber

我们正在试点 "trusted access"，允许开发者在我们继续为 general availability 校准政策和分类器时保留高级能力。我们的目标是让很少用户需要加入 [Trusted Access for Cyber](https://openai.com/index/trusted-access-for-cyber/)。

要将模型用于潜在高风险网络安全工作：

- 用户可以在 [chatgpt.com/cyber](https://chatgpt.com/cyber) 验证身份
- Enterprises 可以通过他们的 OpenAI 代表，为整个团队默认请求 [trusted access](https://openai.com/form/enterprise-trusted-access-for-cyber/)

可能需要访问更高网络安全能力或更宽松模型以加速合法防御工作的安全研究人员和团队，可以表达加入我们 [invite-only program⁠](https://docs.google.com/forms/d/e/1FAIpQLSea_ptovrS3xZeZ9FoZFkKtEJFWGxNrZb1c52GW4BVjB2KVNA/viewform?usp=header) 的兴趣。拥有 trusted access 的用户仍必须遵守我们的 [Usage Policies⁠](https://openai.com/policies/usage-policies/) 和 [Terms of Use⁠](https://openai.com/policies/row-terms-of-use/)。

#### False positives

合法或非网络安全活动偶尔可能被标记。当发生重新路由时，响应模型会在 API request logs 中可见，也会在 CLI 中通过产品内通知显示，之后很快会扩展到所有界面。如果你遇到的重新路由认为不正确，请通过 `/feedback` 报告 false positives。

### Sandbox

来源：[Sandbox](/codex/concepts/sandboxing.md)

sandbox 是让 Codex 能自主行动而不授予其对你机器
无限制访问权限的边界。当 Codex 在
**Codex app**、**IDE extension** 或 **CLI** 中运行本地命令时，这些命令会在
受约束环境中运行，而不是默认以完全访问权限运行。

该环境定义了 Codex 自行可以做什么，例如可以修改哪些文件，
以及命令是否可以使用网络。当任务保持在这些边界内时，
Codex 可以继续推进而不必停下来确认。当它需要越界时，
Codex 会回退到审批流程。

沙盒和审批是协同工作的不同控制。sandbox
定义技术边界。approval policy 决定 Codex
何时必须在越界前停下来询问。

#### sandbox 做什么

sandbox 适用于生成的命令，而不仅是 Codex 内置文件
操作。如果 Codex 运行 `git`、package managers 或 test runners 等工具，
这些命令会继承相同 sandbox boundaries。

Codex 在每个 OS 上使用平台原生强制执行。macOS、Linux、WSL2 和 native Windows 之间实现不同，但在各界面上的思想相同：
给智能体一个有边界的工作位置，使常规任务可以在清晰限制内自主运行。

#### 为什么它重要

sandbox 会减少审批疲劳。Codex 不必要求你确认每个
低风险命令，而是可以在你已批准的边界内读取文件、进行编辑并运行常规项目
命令。

它也为智能体式工作提供更清晰的 trust model。你不仅是在
信任智能体的意图；你还在信任智能体运行于强制执行的
限制内。这让你更容易让 Codex 独立工作，
同时仍然知道它何时会停下来寻求帮助。

#### 入门

当你使用默认 permissions
mode 时，Codex 会自动应用 sandboxing。

#### 前置条件

在 **macOS** 上，sandboxing 使用内置 Seatbelt
framework，可开箱即用。

在 **Windows** 上，当你在 PowerShell 中运行时，Codex 使用原生 [Windows
sandbox](/codex/windows#windows-sandbox)；当你在 WSL2 中运行时，使用
Linux sandbox 实现。

在 **Linux 和 WSL2** 上，请先用你的 package manager 安装 `bubblewrap`：

```bash
sudo apt install bubblewrap
```

```bash
sudo dnf install bubblewrap
```

Codex 使用它在 `PATH` 上找到的第一个 `bwrap` 可执行文件。如果没有可用的 `bwrap`
executable，Codex 会回退到 bundled helper，但该 helper
需要支持创建 unprivileged user namespace。安装
提供 `bwrap` 的 distribution package 可保持此设置可靠。

当 `bwrap` 缺失，或 helper
无法创建所需 user namespace 时，Codex 会显示 startup warning。在限制该
AppArmor setting 的发行版上，优先加载 `bwrap` AppArmor profile，使 `bwrap` 可以
持续工作，而无需全局禁用该限制。

**Ubuntu AppArmor note:** 在 Ubuntu 25.04 上，从
Ubuntu package repository 安装 `bubblewrap` 应无需额外 AppArmor 设置即可工作。
`bwrap-userns-restrict` profile 随 `apparmor` package 提供，路径为
`/etc/apparmor.d/bwrap-userns-restrict`。

在 Ubuntu 24.04 上，即使已安装 `bubblewrap`，Codex 仍可能警告它无法创建所需 user
namespace。复制并加载额外 profile：

```bash
sudo apt update
sudo apt install apparmor-profiles apparmor-utils
sudo install -m 0644 \
  /usr/share/apparmor/extra-profiles/bwrap-userns-restrict \
  /etc/apparmor.d/bwrap-userns-restrict
sudo apparmor_parser -r /etc/apparmor.d/bwrap-userns-restrict
```

`apparmor_parser -r` 会把 profile 加载进 kernel，无需重启。你
也可以重新加载所有 AppArmor profiles：

```bash
sudo systemctl reload apparmor.service
```

如果该 profile 不可用或不能解决问题，你可以用以下方式禁用
AppArmor unprivileged user namespace 限制：

```bash
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

#### 你如何控制它

多数人从产品中的 permissions controls 开始。

在 Codex app 和 IDE 中，你可以从 composer 或 chat input 下方的 permissions selector 中选择一种模式。该 selector 让你可以依赖 Codex 的默认
permissions、切换到 full access，或使用你的 custom configuration。

在 CLI 中，使用 [`/permissions`](/codex/cli/slash-commands#update-permissions-with-permissions)
在会话期间切换模式。

#### 配置默认值

如果你希望 Codex 每次都以相同行为启动，请使用自定义
configuration。Codex 将这些默认值存储在 `config.toml`，也就是它的本地 settings
file 中。[Config basics](/codex/config-basic) 解释其工作方式，[Configuration reference](/codex/config-reference) 记录了
`sandbox_mode`、`approval_policy`、`approvals_reviewer` 和
`sandbox_workspace_write.writable_roots` 的精确 keys。使用这些设置来决定 Codex 默认获得多少
自主权、可以写入哪些目录、何时
应暂停请求审批，以及由谁审查符合条件的 approval requests。

从高层看，常见 sandbox modes 是：

- `read-only`：Codex 可以检查文件，但不能编辑文件或在没有
  审批的情况下运行命令。
- `workspace-write`：Codex 可以读取文件、在 workspace 内编辑，并在该边界内运行
  常规本地命令。这是本地工作的默认低摩擦
  mode。
- `danger-full-access`：Codex 在没有 sandbox restrictions 的情况下运行。这会移除
  filesystem 和 network boundaries，只有在你希望
  Codex 以 full access 行动时才应使用。

常见 approval policies 是：

- `untrusted`：Codex 在运行不属于 trusted
  set 的命令前询问。
- `on-request`：Codex 默认在 sandbox 内工作，并在
  需要越过该边界时询问。
- `never`：Codex 不会因 approval prompts 停止。

当 approvals 可交互时，你还可以用
`approvals_reviewer` 选择谁审查它们：

- `user`：approval prompts 显示给用户。这是默认值。
- `auto_review`：符合条件的 approval prompts 发送给 reviewer agent（见
  [Auto-review](/codex/concepts/sandboxing/auto-review)）。

Full access 意味着同时使用 `sandbox_mode = "danger-full-access"` 和
`approval_policy = "never"`。相比之下，风险更低的本地自动化
预设是 `sandbox_mode = "workspace-write"` 搭配
`approval_policy = "on-request"`，或对应 CLI flags
`--sandbox workspace-write --ask-for-approval on-request`。然后你可以保留
`approvals_reviewer = "user"` 用于人工审批，或设置
`approvals_reviewer = "auto_review"` 用于自动审批审查。

如果你需要 Codex 跨多个目录工作，writable roots 可以让
你扩展它可修改的位置，而不必完全移除 sandbox。如果
你需要更宽或更窄的 trust boundary，请调整默认 sandbox mode
和 approval policy，而不是依赖一次性例外。

当工作流需要特定例外时，使用 [rules](/codex/rules)。Rules
允许你在 sandbox 外对 command prefixes 执行 allow、prompt 或 forbid，这
通常比宽泛扩大访问范围更合适。关于 app 中 approvals 和 sandbox behavior 的高层概览，见
[Codex app features](/codex/app/features#approvals-and-sandboxing)；IDE-specific settings 入口见 [Codex IDE extension settings](/codex/ide/settings)。

Automatic review（可用时）不会改变 sandbox boundary。它只是该边界上 approval requests 的一种可能 `approvals_reviewer`，
例如 sandbox escalations、blocked network access，或仍需要审批的 side-effecting tool calls。
sandbox 内已允许的 actions 会无需额外 review 运行。
Reviewer lifecycle、trigger types、denial
semantics 和 configuration details 见
[Auto-review](/codex/concepts/sandboxing/auto-review)。

平台细节位于平台特定文档中。对于 native Windows setup、
behavior 和 troubleshooting，见 [Windows](/codex/windows)。对于 admin
requirements 和 organization-level constraints on sandboxing and approvals，见
[Agent approvals & security](/codex/agent-approvals-security)。

## 配置、认证与模型

<a id="configuration-auth-and-models"></a>

Config files、auth flows、model selection 和 configuration reference material。

### 配置参考

来源：[Configuration Reference](/codex/config-reference.md)

将本页作为 Codex configuration files 的可搜索参考。概念指引和示例请从 [Config basics](/codex/config-basic) 和 [Advanced Config](/codex/config-advanced) 开始。

### 高级配置

来源：[Advanced Configuration](/codex/config-advanced.md)

当你需要对 providers、policies 和 integrations 进行更多控制时，使用这些选项。快速开始请参阅 [Config basics](/codex/config-basic)。

关于 project guidance、reusable capabilities、custom slash commands、subagent workflows 和 integrations 的背景，请参阅 [Customization](/codex/concepts/customization)。配置 keys 见 [Configuration Reference](/codex/config-reference)。

#### Profiles

Profiles 让你保存命名 configuration layers，并从
CLI 在它们之间切换。当你传递 `--profile profile-name` 时，Codex 会加载
`~/.codex/config.toml`，然后叠加 `~/.codex/profile-name.config.toml`。
Profile names 可以包含字母、数字、hyphens 和 underscores。

为每个 profile 创建单独的 TOML 文件。在
profile file 中使用 top-level config keys；不要把它们嵌套在 `[profiles.profile-name]` 下。

```toml
# ~/.codex/deep-review.config.toml
model = "gpt-5.5"
model_reasoning_effort = "xhigh"
approval_policy = "on-request"
model_catalog_json = "/Users/me/.codex/model-catalogs/deep-review.json"
```

```shell
codex --profile deep-review
codex exec --profile deep-review "review this change"
```

因为 profile file 是位于 base user config 之上、project 和 CLI config 之下的一层，
它只需要包含不同于 base
config 的值。Profile files 也可以覆盖 `model_catalog_json`；当两个文件都设置它时，Codex 使用
profile value。

在 Codex 0.134.0 及更高版本中，`--profile` 不再从 `config.toml` 读取 `[profiles.profile-name]`，
且不再支持 top-level `profile = "profile-name"` selector。请将 legacy profile settings 移入
`~/.codex/profile-name.config.toml`，然后从
`config.toml` 中移除匹配的
`[profiles.profile-name]` table 和 `profile = "profile-name"` selector。

#### CLI 中的一次性覆盖

除了编辑 `~/.codex/config.toml`，你还可以从 CLI 对单次运行覆盖配置：

- 存在专用 flags 时优先使用（例如 `--model`）。
- 当你需要覆盖任意 key 时使用 `-c` / `--config`。

示例：

```shell
# Dedicated flag
codex --model gpt-5.4

# Generic key/value override (value is TOML, not JSON)
codex --config model='"gpt-5.4"'
codex --config sandbox_workspace_write.network_access=true
codex --config 'shell_environment_policy.include_only=["PATH","HOME"]'
```

说明：

- Keys 可以使用 dot notation 设置 nested values（例如 `mcp_servers.context7.enabled=false`）。
- `--config` values 会作为 TOML 解析。拿不准时，请给 value 加引号，避免 shell 按空格拆分。
- 如果 value 无法解析为 TOML，Codex 会把它视为 string。

#### 配置和状态位置

Codex 将本地状态存储在 `CODEX_HOME` 下（默认 `~/.codex`）。

你可能在那里看到的常见文件：

- `config.toml`（你的本地配置）
- `auth.json`（如果你使用 file-based credential storage）或你的 OS keychain/keyring
- `history.jsonl`（如果启用 history persistence）
- 其他 per-user state，例如 logs 和 caches

认证细节（包括 credential storage modes）见 [Authentication](/codex/auth)。完整 configuration keys 列表见 [Configuration Reference](/codex/config-reference)。

关于提交到 repos 或 system paths 的 shared defaults、rules 和 skills，见 [Team Config](/codex/enterprise/admin-setup#team-config)。

如果你只是需要把内置 OpenAI provider 指向 LLM proxy、router，或启用了 data-residency 的 project，请在 `config.toml` 中设置 `openai_base_url`，而不是定义新的 provider。这会更改内置 `openai` provider 的 base URL，而不需要单独的 `model_providers.` entry。

```toml
openai_base_url = "https://us.api.openai.com/v1"
```

#### Project config files（`.codex/config.toml`）

除了你的 user config，Codex 还会读取 repo 内 `.codex/config.toml` 文件中的 project-scoped overrides。Codex 会从 project root 走到当前 working directory，并加载它找到的每个 `.codex/config.toml`。如果多个文件定义同一个 key，离你的 working directory 最近的文件获胜。

出于安全考虑，Codex 只会在 project 受信任时加载 project-scoped config files。如果 project 不受信任，Codex 会忽略 project `.codex/` layers，包括 `.codex/config.toml`、project-local hooks 和 project-local rules。User 和 system layers 仍保持独立并继续加载。

project config 中的相对路径（例如 `model_instructions_file`）会相对于包含 `config.toml` 的 `.codex/` folder 解析。

Project config files 不能覆盖会重定向凭据、更改
host-owned app request metadata、更改 provider auth、选择 config profiles，
或运行 machine-local notification/telemetry commands 的设置。Codex 会忽略
project-local `.codex/config.toml` 中的以下 keys，并在看到它们时打印 startup
warning：`openai_base_url`、`chatgpt_base_url`、
`apps_mcp_product_sku`、`model_provider`、`model_providers`、`notify`、
`profile`、`profiles`、`experimental_realtime_ws_base_url` 和 `otel`。请在 user-level
`~/.codex/config.toml` 中设置 provider、notification 和 telemetry keys；用 `--profile profile-name`
和 `~/.codex/profile-name.config.toml` 选择 config profiles。

#### Hooks

Codex 还可以从 `hooks.json` 文件或
位于 active config layers 旁边的 `config.toml` 文件中的 inline
`[hooks]` tables 加载 lifecycle hooks。

实践中，四个最有用的位置是：

- `~/.codex/hooks.json`
- `~/.codex/config.toml`
- `/.codex/hooks.json`
- `/.codex/config.toml`

Project-local hooks 只会在 project `.codex/` layer 受信任时加载。
User-level hooks 独立于 project trust。

Inline TOML hooks 使用与 `hooks.json` 相同的 event structure：

```toml
[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py"'
timeout = 30
statusMessage = "Checking Bash command"
```

如果单个 layer 同时包含 `hooks.json` 和 inline `[hooks]`，Codex 会加载
两者并发出警告。每个 layer 优先使用一种表示形式。

当前 event list、input fields、output behavior 和 limitations 见
[Hooks](/codex/hooks)。

#### Agent roles（`[agents]` in `config.toml`）

关于 subagent role configuration（`[agents]` in `config.toml`），见 [Subagents](/codex/subagents)。

#### Project root detection

Codex 会通过从 working directory 向上遍历，直到到达 project root，来发现 project configuration（例如 `.codex/` layers 和 `AGENTS.md`）。

默认情况下，Codex 会把包含 `.git` 的目录视为 project root。要自定义此行为，请在 `config.toml` 中设置 `project_root_markers`：

```toml
# Treat a directory as the project root when it contains any of these markers.
project_root_markers = [".git", ".hg", ".sl"]
```

将 `project_root_markers = []` 设为空，即可跳过搜索父目录，并把当前 working directory 视为 project root。

#### 自定义模型 providers

模型 provider 定义 Codex 如何连接到模型（base URL、wire API、authentication 和可选 HTTP headers）。Custom providers 不能复用保留的 built-in provider IDs：`openai`、`ollama` 和 `lmstudio`。

定义 additional providers，并将 `model_provider` 指向它们：

```toml
model = "gpt-5.4"
model_provider = "proxy"

[model_providers.proxy]
name = "OpenAI using LLM proxy"
base_url = "http://proxy.example.com"
env_key = "OPENAI_API_KEY"

[model_providers.local_ollama]
name = "Ollama"
base_url = "http://localhost:11434/v1"

[model_providers.mistral]
name = "Mistral"
base_url = "https://api.mistral.ai/v1"
env_key = "MISTRAL_API_KEY"
```

需要时添加 request headers：

```toml
[model_providers.example]
http_headers = { "X-Example-Header" = "example-value" }
env_http_headers = { "X-Example-Features" = "EXAMPLE_FEATURES" }
```

当 provider 需要 Codex 从外部 credential helper 获取 bearer tokens 时，使用 command-backed authentication：

```toml
[model_providers.proxy]
name = "OpenAI using LLM proxy"
base_url = "https://proxy.example.com/v1"
wire_api = "responses"

[model_providers.proxy.auth]
command = "/usr/local/bin/fetch-codex-token"
args = ["--audience", "codex"]
timeout_ms = 5000
refresh_interval_ms = 300000
```

auth command 不接收 `stdin`，并且必须把 token 打印到 stdout。Codex 会 trim surrounding whitespace，将 empty token 视为错误，并按 `refresh_interval_ms` 主动 refresh；设置 `refresh_interval_ms = 0` 则只在 authentication retry 后 refresh。不要将 `[model_providers..auth]` 与 `env_key`、`experimental_bearer_token` 或 `requires_openai_auth` 组合使用。

#### Amazon Bedrock provider

Codex 包含内置 `amazon-bedrock` model provider。直接把它设为
`model_provider`；不同于 custom providers，该 built-in provider 只支持
nested AWS profile 和 region overrides。

```toml
model_provider = "amazon-bedrock"
model = ""

[model_providers.amazon-bedrock.aws]
profile = "default"
region = "eu-central-1"
```

如果省略 `profile`，Codex 会使用标准 AWS credential chain。将
`region` 设置为应该处理请求的受支持 Bedrock region。

完整 setup flow、authentication options、supported models 和 feature
availability 见 [Use Codex with Amazon Bedrock](/codex/amazon-bedrock)。

#### OSS mode（local providers）

当你传递 `--oss` 时，Codex 可以针对本地 "open source" provider（例如 Ollama 或 LM Studio）运行。如果你传递 `--oss` 而未指定 provider，Codex 会使用 `oss_provider` 作为默认值。

```toml
# Default local provider used with `--oss`
oss_provider = "ollama" # or "lmstudio"
```

#### Azure provider 和 per-provider tuning

```toml
[model_providers.azure]
name = "Azure"
base_url = "https://YOUR_PROJECT_NAME.openai.azure.com/openai"
env_key = "AZURE_OPENAI_API_KEY"
query_params = { api-version = "2025-04-01-preview" }
wire_api = "responses"
request_max_retries = 4
stream_max_retries = 10
stream_idle_timeout_ms = 300000
```

要更改 built-in OpenAI provider 的 base URL，请使用 `openai_base_url`；不要创建 `[model_providers.openai]`，因为你不能覆盖 built-in provider IDs。

#### 使用 data residency 的 ChatGPT customers

启用了 [data residency](https://help.openai.com/en/articles/9903489-data-residency-and-inference-residency-for-chatgpt) 的 projects 可以创建 model provider，以用 [correct prefix](https://platform.openai.com/docs/guides/your-data#which-models-and-features-are-eligible-for-data-residency) 更新 base_url。

```toml
model_provider = "openaidr"
[model_providers.openaidr]
name = "OpenAI Data Residency"
base_url = "https://us.api.openai.com/v1" # Replace 'us' with domain prefix
```

#### 模型推理、详细程度和限制

```toml
model_reasoning_summary = "none"          # Disable summaries
model_verbosity = "low"                   # Shorten responses
model_supports_reasoning_summaries = true # Force reasoning
model_context_window = 128000             # Context window size
```

`model_verbosity` 只适用于使用 Responses API 的 providers。Chat Completions providers 会忽略该设置。

#### 审批策略和沙盒模式

选择 approval strictness（影响 Codex 何时暂停）和 sandbox level（影响文件/网络访问）。

编辑 `config.toml` 时要牢记的操作细节，见 [Common sandbox and approval combinations](/codex/agent-approvals-security#common-sandbox-and-approval-combinations)、[Protected paths in writable roots](/codex/agent-approvals-security#protected-paths-in-writable-roots) 和 [Network access](/codex/agent-approvals-security#network-access)。

关于将 filesystem 和 network access 一起配置的 beta permission profiles，见 [Permissions](/codex/permissions)。

你也可以使用 granular approval policy（`approval_policy = { granular = { ... } }`）来允许或自动拒绝单个 prompt categories。当你希望某些情况保持正常交互式审批，但希望其他情况（例如 `request_permissions` 或 skill-script prompts）自动 fail closed 时，这很有用。

设置 `approvals_reviewer = "auto_review"`，可将符合条件的 interactive approval
requests 路由到 automatic review。这会改变 reviewer，而不是 sandbox
boundary。

使用 `[auto_review].policy` 配置本地 reviewer policy instructions。Managed
`guardian_policy_config` 优先。

```toml
approval_policy = "untrusted"   # Other options: on-request, never, or { granular = { ... } }
approvals_reviewer = "user"     # Or "auto_review" for automatic review
sandbox_mode = "workspace-write"
allow_login_shell = false       # Optional hardening: disallow login shells for shell tools

# Example granular approval policy:
# approval_policy = { granular = {
#   sandbox_approval = true,
#   rules = true,
#   mcp_elicitations = true,
#   request_permissions = false,
#   skill_approval = false
# } }

[sandbox_workspace_write]
exclude_tmpdir_env_var = false  # Allow $TMPDIR
exclude_slash_tmp = false       # Allow /tmp
writable_roots = ["/Users/YOU/.pyenv/shims"]
network_access = false          # Opt in to outbound network

[auto_review]
policy = """
Use your organization's automatic review policy.
"""
```

#### Named permission profiles

关于 built-in profiles、custom profile syntax，以及完整 filesystem 和
network configuration model，见 [Permissions](/codex/permissions)。

完整 key list 和 requirements constraints 见
[Configuration Reference](/codex/config-reference) 和
[Managed configuration](/codex/enterprise/managed-configuration)。

在 workspace-write mode 中，某些环境会让 `.git/` 和 `.codex/`
保持 read-only，即使 workspace 的其余部分可写。这就是
`git commit` 等命令仍可能需要 approval 才能在 sandbox 外运行的原因。如果你想让 Codex 跳过特定命令（例如阻止 sandbox 外的 `git
  commit`），请使用
rules。

完全禁用 sandboxing（仅当你的环境已经隔离 processes 时使用）：

```toml
sandbox_mode = "danger-full-access"
```

#### Shell environment policy

`shell_environment_policy` 控制 Codex 会把哪些 environment variables 传递给它启动的任何 subprocess（例如，当运行模型提出的 tool-command 时）。从 clean start（`inherit = "none"`）或 trimmed set（`inherit = "core"`）开始，然后叠加 excludes、includes 和 overrides，以避免泄露 secrets，同时仍提供任务所需的 paths、keys 或 flags。

```toml
[shell_environment_policy]
inherit = "none"
set = { PATH = "/usr/bin", MY_FLAG = "1" }
ignore_default_excludes = false
exclude = ["AWS_*", "AZURE_*"]
include_only = ["PATH", "HOME"]
```

Patterns 是 case-insensitive globs（`*`、`?`、`[A-Z]`）；`ignore_default_excludes = false` 会在你的 includes/excludes 运行前保留自动 KEY/SECRET/TOKEN filter。

#### MCP servers

配置细节见专门的 [MCP documentation](/codex/mcp)。

#### Observability 和 telemetry

启用 OpenTelemetry（OTel）log export 来跟踪 Codex runs（API requests、SSE/events、prompts、tool approvals/results）。默认禁用；通过 `[otel]` 选择启用：

```toml
[otel]
environment = "staging"   # defaults to "dev"
exporter = "none"         # set to otlp-http or otlp-grpc to send events
log_user_prompt = false   # redact user prompts unless explicitly enabled
```

选择 exporter：

```toml
[otel]
exporter = { otlp-http = {
  endpoint = "https://otel.example.com/v1/logs",
  protocol = "binary",
  headers = { "x-otlp-api-key" = "${OTLP_TOKEN}" }
}}
```

```toml
[otel]
exporter = { otlp-grpc = {
  endpoint = "https://otel.example.com:4317",
  headers = { "x-otlp-meta" = "abc123" }
}}
```

如果 `exporter = "none"`，Codex 会记录 events 但不发送。Exporters 会异步批处理，并在 shutdown 时 flush。Event metadata 包括 service name、CLI version、env tag、conversation id、model、sandbox/approval settings 和 per-event fields（见 [Config Reference](/codex/config-reference)）。

#### 会发出什么

Codex 会为 runs 和 tool usage 发出 structured log events。代表性 event types 包括：

- `codex.conversation_starts`（model、reasoning settings、sandbox/approval policy）
- `codex.api_request`（attempt、status/success、duration 和 error details）
- `codex.sse_event`（stream event kind、success/failure、duration，以及 `response.completed` 上的 token counts）
- `codex.websocket_request` 和 `codex.websocket_event`（request duration 加 per-message kind/success/error）
- `codex.user_prompt`（length；除非显式启用，否则 content redacted）
- `codex.tool_decision`（approved/denied，以及 decision 来自 config 还是 user）
- `codex.tool_result`（duration、success、output snippet）

### 认证和会话

来源：[Authentication](/codex/auth.md)

#### OpenAI authentication

使用 OpenAI models 时，Codex 支持两种登录方式：

- 使用 ChatGPT 登录以获得 subscription access
- 使用 API key 登录以获得 usage-based access

Codex cloud 要求使用 ChatGPT 登录。Codex CLI 和 IDE extension 支持两种登录方法。

你的登录方法也决定适用哪些 admin controls 和 data-handling policies。

- 使用 ChatGPT 登录时，Codex 的使用会遵循你的 ChatGPT workspace permissions、RBAC，以及 ChatGPT Enterprise retention 和 residency settings
- 使用 API key 时，使用会遵循你的 API organization 的 retention 和 data-sharing settings

对于 CLI，当没有有效 session 时，Sign in with ChatGPT 是默认认证路径。

#### 使用 ChatGPT 登录

当你从 Codex app、CLI 或 IDE Extension 使用 ChatGPT 登录时，Codex 会打开浏览器窗口，让你完成登录流程。登录后，浏览器会将 access token 返回给 CLI 或 IDE extension。

如果你的环境已经提供 ChatGPT access token，CLI 可以从 stdin 读取
它：

```shell
printenv CODEX_ACCESS_TOKEN | codex login --with-access-token
```

#### 使用 API key 登录

你也可以用 API key 登录 Codex app、CLI 或 IDE Extension。从 [OpenAI dashboard](https://platform.openai.com/api-keys) 获取你的 API key。

OpenAI 会通过你的 OpenAI Platform account 按标准 API 费率为 API key usage 计费。见 [API pricing page](https://openai.com/api/pricing/)。

API key authentication 支持本地 Codex 工作流，但某些
依赖 ChatGPT workspace access 或 cloud services 的功能会受限或不可用。
按 plan 对比支持情况见
[Feature availability](/codex/pricing#feature-availability)。

使用 API key 登录时，Codex 使用标准 API 价格，而不是
包含在 ChatGPT plan credits 中的额度。

我们建议将 API key authentication 用于编程式 Codex CLI 工作流，
例如 CI/CD jobs。不要在不可信或公开环境中暴露 Codex execution。

#### 将 Codex access tokens 用于企业自动化

在 ChatGPT Enterprise workspaces 中，admins 可以授予 access token
permission，使被允许的 members 可以为可信、
非交互式 Codex 本地工作流创建 Codex access tokens。当自动化
需要 ChatGPT workspace access、ChatGPT-managed Codex entitlements 或
enterprise workspace controls 且不需要 browser sign-in 时，使用 access token。

Access tokens 适用于 trusted scripts、schedulers 和 private CI
runners。一般 OpenAI API calls 仍继续使用 Platform API keys。

设置步骤、permissions、rotation 和 revocation guidance，见
[Access tokens](/codex/enterprise/access-tokens)。

#### 保护你的 Codex cloud account

Codex cloud 会直接与你的 codebase 交互，因此它需要比许多其他 ChatGPT features 更强的安全性。启用 multi-factor authentication（MFA）。

如果你使用 social login provider（Google、Microsoft、Apple），你不需要在 ChatGPT account 上启用 MFA，但可以在 social login provider 中设置。

设置说明见：

- [Google](https://support.google.com/accounts/answer/185839)
- [Microsoft](https://support.microsoft.com/en-us/topic/what-is-multifactor-authentication-e5e39437-121c-be60-d123-eda06bddf661)
- [Apple](https://support.apple.com/en-us/102660)

如果你通过 single sign-on（SSO）访问 ChatGPT，你组织的 SSO administrator 应为所有用户强制 MFA。

如果你用 email 和 password 登录，必须在访问 Codex cloud 前在账户上设置 MFA。

如果你的账户支持多种登录方法，且其中一种是 email 和 password，即使你用另一种方式登录，也必须在访问 Codex 前设置 MFA。

#### Login caching

当你使用 ChatGPT 或 API key 登录 Codex app、CLI 或 IDE Extension 时，Codex 会缓存你的登录 details，并在下次启动 CLI 或 extension 时复用它们。CLI 和 extension 共享同一份 cached login details。如果你从其中任一处注销，下次启动 CLI 或 extension 时都需要重新登录。

Codex 会将 login details 本地缓存在 `~/.codex/auth.json` plaintext file 中，或你的 OS-specific credential store 中。

对于 Sign in with ChatGPT sessions，Codex 会在使用期间、tokens 过期前自动 refresh，因此活动 sessions 通常会继续，无需再次 browser login。

#### Credential storage

使用 `cli_auth_credentials_store` 控制 Codex CLI 存储 cached credentials 的位置：

```toml
# file | keyring | auto
cli_auth_credentials_store = "keyring"
```

- `file` 将 credentials 存储在 `CODEX_HOME` 下的 `auth.json` 中（默认 `~/.codex`）。
- `keyring` 将 credentials 存储在你的 operating system credential store 中。
- `auto` 在可用时使用 OS credential store，否则回退到 `auth.json`。

如果你使用 file-based storage，请像对待密码一样对待 `~/.codex/auth.json`：
它包含 access tokens。不要 commit 它、粘贴到 tickets，或在
chat 中分享。

#### 强制登录方法或 workspace

在 managed environments 中，admins 可能限制用户允许如何 authenticate：

```toml
# Only allow ChatGPT login or only allow API key login.
forced_login_method = "chatgpt" # or "api"

# When using ChatGPT login, restrict users to a specific workspace.
forced_chatgpt_workspace_id = "00000000-0000-0000-0000-000000000000"
```

如果 active credentials 不符合配置限制，Codex 会将用户注销并退出。

这些设置通常通过 managed configuration 应用，而不是 per-user setup。见 [Managed configuration](/codex/enterprise/managed-configuration)。

#### Login diagnostics

直接运行 `codex login` 会在
你配置的 log directory 下写入专用 `codex-login.log` 文件。当你需要调试 browser-login 或
device-code failures，或 support 要求 login-specific logs 时使用它。

#### Custom CA bundles

如果你的网络使用 corporate TLS proxy 或 private root CA，请在登录前将
`CODEX_CA_CERTIFICATE` 设置为 PEM bundle。当
`CODEX_CA_CERTIFICATE` 未设置时，Codex 会回退到 `SSL_CERT_FILE`。相同的
custom CA settings 适用于 login、普通 HTTPS requests 和 secure WebSocket
connections。

```shell
export CODEX_CA_CERTIFICATE=/path/to/corporate-root-ca.pem
codex login
```

#### 在 headless devices 上登录

如果你正用 Codex CLI 登录 ChatGPT，在某些情况下 browser-based login UI 可能无法工作：

- 你在 remote 或 headless environment 中运行 CLI。
- 你的 local networking configuration 阻止了 Codex 用来在你登录后把 OAuth token 返回给 CLI 的 localhost callback。

在这些情况下，优先使用 device code authentication（beta）。在 interactive login UI 中选择 **Sign in with Device Code**，或直接运行 `codex login --device-auth`。如果 device code authentication 在你的环境中不起作用，请使用某个 fallback method。

#### 首选：Device code authentication（beta）

1. 在你的 ChatGPT security settings（个人账户）或 ChatGPT workspace permissions（workspace admin）中启用 device code login。
2. 在运行 Codex 的 terminal 中选择以下选项之一：
   - 在 interactive login UI 中，选择 **Sign in with Device Code**。
   - 运行 `codex login --device-auth`。
3. 在浏览器中打开链接、登录，然后输入一次性 code。

如果 server 未启用 device code login，Codex 会回退到标准 browser-based login flow。

#### Fallback：在本地认证并复制 auth cache

如果你可以在有浏览器的机器上完成 login flow，可以把 cached credentials 复制到 headless machine。

1. 在可以使用 browser-based login flow 的机器上，运行 `codex login`。
2. 确认 login cache 存在于 `~/.codex/auth.json`。
3. 将 `~/.codex/auth.json` 复制到 headless machine 上的 `~/.codex/auth.json`。

像对待密码一样对待 `~/.codex/auth.json`：它包含 access tokens。不要 commit 它、粘贴到 tickets，或在 chat 中分享。

如果你的 OS 将 credentials 存储在 credential store 而不是 `~/.codex/auth.json` 中，此方法可能不适用。请参阅
[Credential storage](#credential-storage)，了解如何配置 file-based storage。

通过 SSH 复制到 remote machine：

```shell
ssh user@remote 'mkdir -p ~/.codex'
scp ~/.codex/auth.json user@remote:~/.codex/auth.json
```

或使用避免 `scp` 的 one-liner：

```shell
ssh user@remote 'mkdir -p ~/.codex && cat > ~/.codex/auth.json' < ~/.codex/auth.json
```

复制到 Docker container：

```shell
# Replace MY_CONTAINER with the name or ID of your container.
CONTAINER_HOME=$(docker exec MY_CONTAINER printenv HOME)
docker exec MY_CONTAINER mkdir -p "$CONTAINER_HOME/.codex"
docker cp ~/.codex/auth.json MY_CONTAINER:"$CONTAINER_HOME/.codex/auth.json"
```

对于同一模式在 trusted CI/CD runners 上的更高级版本，见
[Maintain Codex account auth in CI/CD (advanced)](/codex/auth/ci-cd-auth)。
该指南说明如何让 Codex 在正常运行期间 refresh `auth.json`，并
为下一次 job 保留 updated file。API keys 仍是自动化推荐的
默认方式。

#### Fallback：通过 SSH 转发 localhost callback

如果你可以在本地机器和 remote host 之间转发端口，就可以通过隧道转发 Codex 的 local callback server（默认 `localhost:1455`），使用标准 browser-based flow。

1. 从本地机器启动 port forwarding：

```shell
ssh -L 1455:localhost:1455 user@remote
```

2. 在该 SSH session 中运行 `codex login`，并在本地机器上打开打印出的地址。

#### Alternative model providers

当你在 configuration file 中定义 [custom model provider](/codex/config-advanced#custom-model-providers) 时，可以选择以下认证方法之一：

- **OpenAI authentication**：设置 `requires_openai_auth = true` 以使用 OpenAI authentication。然后你可以用 ChatGPT 或 API key 登录。当你通过 LLM proxy server 访问 OpenAI models 时，这很有用。当 `requires_openai_auth = true` 时，Codex 会忽略 `env_key`。
- **Environment variable authentication**：设置 `env_key = "<ENV_VARIABLE_NAME>"`，以使用本地环境变量 `<ENV_VARIABLE_NAME>` 中的 provider-specific API key。
- **No authentication**：如果你没有设置 `requires_openai_auth`（或将其设为 `false`），也没有设置 `env_key`，Codex 会假设 provider 不需要认证。这对于 local models 很有用。
