

## Find By Topic

- `pricing`, `plans`, `ChatGPT`, `API key`, `Plus`, `Pro`, `Business`, `Enterprise`, `Edu`, `feature maturity`: [Surfaces and Modes](#surfaces-and-modes)
- `prompting`, `threads`, `context window`, `multi_agent`, `spawn_agents_on_csv`, `/plan`, `workflow`: [Execution Model and Workflows](#execution-model-and-workflows)
- `approval_policy`, `sandbox_mode`, `read-only`, `workspace-write`, `danger-full-access`, `security`, `cyber`: [Approvals, Sandboxing, and Security](#approvals-sandboxing-and-security)
- `config.toml`, `.codex/config.toml`, `auth.json`, `ChatGPT sign-in`, `API key login`, `models`, `providers`, `model_reasoning_effort`: [Configuration, Authentication, and Models](#configuration-auth-and-models)
- `codex exec`, `codex cloud`, `codex mcp`, `worktrees`, `automations`, `cloud environments`, `internet access`: [CLI, IDE, App, and Cloud Behavior](#surface-behavior)
- `AGENTS.md`, `skills`, `rules`, `custom prompts`, `MCP`, `GitHub integration`, `Slack integration`: [Customization, Skills, Rules, MCP, and Integrations](#customization-and-tooling)
- `sdk`, `noninteractive`, `app-server`, `github-action`, `CI`, `auth in CI`: [Noninteractive and Programmatic Interfaces](#automation-and-programmatic-interfaces)
- `Windows`, `WSL`, `enterprise`, `RBAC`, `data residency`, `OSS`: [Platform, Enterprise, and Caveats](#platform-enterprise-and-caveats)

## Surfaces and Modes

<a id="surfaces-and-modes"></a>

Entry points, plans, supported surfaces, maturity, and high-level product framing.

### Codex

Source: [Codex](/codex/overview.md)

Codex is OpenAI's coding agent for software development. ChatGPT Plus, Pro, Business, Edu, and Enterprise plans include Codex. It can help you:

- **Write code**: Describe what you want to build, and Codex generates code that matches your intent, adapting to your existing project structure and conventions.

- **Understand unfamiliar codebases**: Codex can read and explain complex or legacy code, helping you grasp how teams organize systems.

- **Review code**: Codex analyzes code to identify potential bugs, logic errors, and unhandled edge cases.

- **Debug and fix problems**: When something breaks, Codex helps trace failures, diagnose root causes, and suggest targeted fixes.

- **Automate development tasks**: Codex can run repetitive workflows such as refactoring, testing, migrations, and setup tasks so you can focus on higher-level engineering work.

### Codex Pricing

Source: [Codex Pricing](/codex/pricing.md)

Pricing options

**Free** ($0 /month):

Explore Codex capabilities on quick coding tasks.

[Get Free](https://chatgpt.com/plans/free/)

**Go** ($8 /month):

Use Codex for lightweight coding tasks.

[Get Go](https://chatgpt.com/plans/go)

**Plus** ($20 /month):

Power a few focused coding sessions each week.

- Codex on the web, in the CLI, in the IDE extension, and on iOS
- Cloud-based integrations like automatic code review and Slack
  integration
- The latest models, including GPT-5.5, GPT-5.4, and GPT-5.4 mini
- GPT-5.4 mini for higher usage limits on routine local messages
- Flexibly extend usage with [ChatGPT credits](#credits-overview)
- Other [ChatGPT features](https://chatgpt.com/pricing) as part of the
  Plus plan

[Get Plus](https://chatgpt.com/explore/plus?utm_internal_source=openai_developers_codex)

**Pro** (From $100 /month):

Choose 5x or 20x higher rate limits than Plus.

Everything in Plus and:

- Access to GPT-5.3-Codex-Spark (research preview), a fast Codex model
  for day-to-day coding tasks
- 5x or 20x more Codex usage than Plus\*
- Other [ChatGPT features](https://chatgpt.com/pricing) as part of the
  Pro plan

[Get Pro](https://chatgpt.com/explore/pro?utm_internal_source=openai_developers_codex)

[\*Learn more about limits on both tiers.](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-plans)

**API Key**:

Great for automation in shared environments like CI.

- Codex in the CLI, SDK, or IDE extension
- No cloud-based features (GitHub code review, Slack, etc.)
- Model availability follows the API models available to your key
- Pay only for the tokens Codex uses, based on [API
  pricing](https://platform.openai.com/docs/pricing)

[Learn more](/codex/auth)

**Business** ($20 / user / month\*):

Bring Codex into your startup or growing business.

- Access ChatGPT and Codex across desktop and mobile apps
- Larger virtual machines to run cloud tasks faster
- Flexibly extend usage with [ChatGPT credits](#credits-overview)
- A secure, dedicated workspace with essential admin controls, SAML SSO,
  and MFA
- No training on your business data by default. [Learn
  more](https://openai.com/business-data/)
- Other [ChatGPT features](https://chatgpt.com/pricing) as part of the
  Business plan

[Get Business](https://chatgpt.com/team-sign-up)

\*2+ users, billed annually. $25 per user per month when billed monthly.

**Enterprise & Edu**:

Unlock Codex for your entire organization with enterprise-grade functionality.

Everything in Business and:

- Priority request processing
- Enterprise-level security and controls, including SCIM, EKM, user
  analytics, domain verification, and role-based access control
  ([RBAC](https://help.openai.com/en/articles/11750701-rbac))
- Audit logs and usage monitoring via the [Compliance
  API](https://chatgpt.com/admin/api-reference#tag/Codex-Tasks)
- Data retention and data residency controls
- Other [ChatGPT features](https://chatgpt.com/pricing) as part of the
  Enterprise plan

[Contact sales](https://chatgpt.com/contact-sales?utm_internal_source=openai_developers_codex)

### Feature Maturity

Source: [Feature Maturity](/codex/feature-maturity.md)

Some Codex features ship behind a maturity label so you can understand how reliable each one is, what might change, and what level of support to expect.

| Maturity          | What it means                                                                                                 | Guidance                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Under development | Not ready for use.                                                                                            | Don't use.                                                                    |
| Experimental      | Unstable and OpenAI may remove or change it.                                                                  | Use at your own risk.                                                         |
| Beta              | Ready for broad testing; complete in most respects, but some aspects may change based on user feedback.       | OK for most evaluation and pilots; expect small changes.                      |
| Stable            | Fully supported, documented, and ready for broad use; behavior and configuration remain consistent over time. | Safe for production use; removals typically go through a deprecation process. |

### Quickstart

Source: [Quickstart](/codex/quickstart.md)

Every ChatGPT plan includes Codex.

You can also use Codex with API credits by signing in with an OpenAI API key.

## Execution Model and Workflows

<a id="execution-model-and-workflows"></a>

How Codex reasons through work, threads, prompting, speed, and multi-agent coordination.

### Best practices

Source: [Best practices](/codex/learn/best-practices.md)

If you’re new to Codex or coding agents in general, this guide will help you get better results faster. It covers the core habits that make Codex more effective across the [CLI](/codex/cli), [IDE extension](/codex/ide), and the [Codex app](/codex/app), from prompting and planning to validation, MCP, skills, and automations.

Codex works best when you treat it less like a one-off assistant and more like a teammate you configure and improve over time.

A useful way to think about this: start with the right task context, use `AGENTS.md` for durable guidance, configure Codex to match your workflow, connect external systems with MCP, turn repeated work into skills, and automate stable workflows.

#### Strong first use: Context and prompts

Codex is already strong enough to be useful even when your prompt isn't perfect. You can often hand it a hard problem with minimal setup and still get a strong result. Clear [prompting](/codex/prompting) isn't required to get value, but it does make results more reliable, especially in larger codebases or higher-stakes tasks.

If you work in a large or complex repository, the biggest unlock is giving Codex the right task context and a clear structure for what you want done.

A good default is to include four things in your prompt:

- **Goal:** What are you trying to change or build?
- **Context:** Which files, folders, docs, examples, or errors matter for this task? You can @ mention certain files as context.
- **Constraints:** What standards, architecture, safety requirements, or conventions should Codex follow?
- **Done when:** What should be true before the task is complete, such as tests passing, behavior changing, or a bug no longer reproducing?

This helps Codex stay scoped, make fewer assumptions, and produce work that's easier to review.

Choose a reasoning level based on how hard the task is and test what works best for your workflow. Different users and tasks work best with different settings.

- Low for faster, well-scoped tasks
- Medium or High for more complex changes or debugging
- Extra High for long, agentic, reasoning-heavy tasks

To provide context faster, try using speech dictation inside the Codex app to
dictate what you want Codex to do rather than typing it.

#### Plan first for difficult tasks

If the task is complex, ambiguous, or hard to describe well, ask Codex to plan before it starts coding.

A few approaches work well:

**Use Plan mode:** For most users, this is the easiest and most effective option. Plan mode lets Codex gather context, ask clarifying questions, and build a stronger plan before implementation. Toggle with `/plan` or Shift+Tab.

**Ask Codex to interview you:** If you have a rough idea of what you want but aren't sure how to describe it well, ask Codex to question you first. Tell it to challenge your assumptions and turn the fuzzy idea into something concrete before writing code.

**Use a PLANS.md template:** For more advanced workflows, you can configure Codex to follow a `PLANS.md` or execution-plan template for longer-running or multi-step work. For more detail, see the [execution plans guide](/cookbook/articles/codex_exec_plans).

#### Make guidance reusable with `AGENTS.md`

Once a prompting pattern works, the next step is to stop repeating it manually. That's where [AGENTS.md](/codex/guides/agents-md) comes in.

Think of `AGENTS.md` as an open-format README for agents. It loads into context automatically and is the best place to encode how you and your team want Codex to work in a repository.

A good `AGENTS.md` covers:

- repo layout and important directories
- How to run the project
- Build, test, and lint commands
- Engineering conventions and PR expectations
- Constraints and do-not rules
- What done means and how to verify work

The `/init` slash command in the CLI is the quick-start command to scaffold a starter `AGENTS.md` in the current directory. It's a great starting point, but you should edit the result to match how your team actually builds, tests, reviews, and ships code.

You can create `AGENTS.md` files at different levels: a global `AGENTS.md` for personal defaults that sits in `~/.codex`, a repo-level file for shared standards, and more specific files in subdirectories for local rules. If there’s a more specific file closer to your current directory, that guidance wins.

Keep it practical. A short, accurate `AGENTS.md` is more useful than a long file full of vague rules. Start with the basics, then add new rules only after you notice repeated mistakes.

If `AGENTS.md` starts getting too large, keep the main file concise and reference task-specific markdown files for things like planning, code review, or architecture.

When Codex makes the same mistake twice, ask it for a retrospective and update
`AGENTS.md`. Guidance stays practical and based on real friction.

#### Configure Codex for consistency

Configuration is one of the main ways to make Codex behave more consistently across sessions and surfaces. For example, you can set defaults for model choice, reasoning effort, sandbox mode, approval policy, profiles, and MCP setup.

A good starting pattern is:

- Keep personal defaults in `~/.codex/config.toml` (Settings → Configuration → Open config.toml from the Codex app)
- Keep repo-specific behavior in `.codex/config.toml`
- Use command-line overrides only for one-off situations (if you use the CLI)

[`config.toml`](/codex/config-basic) is where you define durable preferences such as MCP servers, multi-agent setup, and feature flags. Profile-specific overrides live in separate `$CODEX_HOME/profile-name.config.toml` files.

Codex ships with operating level sandboxing and has two key knobs that you can control. Approval mode determines when Codex asks for your permission to run a command and sandbox mode determines if Codex can read or write in the directory and what files the agent can access.

If you're new to coding agents, start with the default permissions. Keep approval and sandboxing tight by default, then loosen permissions only for trusted repos or specific workflows once the need is clear.

Note that the CLI, IDE, and Codex app all share the same configuration layers. Learn more on the [sample configuration](/codex/config-sample) page.

Configure Codex for your real environment early. Many quality issues are
really setup issues, like the wrong working directory, missing write access,
wrong model defaults, or missing tools and connectors.

#### Improve reliability with testing and review

Don't stop at asking Codex to make a change. Ask it to create tests when needed, run the relevant checks, confirm the result, and review the work before you accept it.

Codex can do this loop for you, but only if it knows what “good” looks like. That guidance can come from either the prompt or `AGENTS.md`.

That can include:

- Writing or updating tests for the change
- Running the right test suites
- Checking lint, formatting, or type checks
- Confirming the final behavior matches the request
- Reviewing the diff for bugs, regressions, or risky patterns

Toggle the diff panel in the Codex app to directly [review
changes](/codex/app/review) locally. Click on a specific row to provide
feedback that gets fed as context to the next Codex turn.

A useful option here is the slash command `/review`, which gives you a few ways to review code:

- Review against a base branch for PR-style review
- Review uncommitted changes
- Review a commit
- Use custom review instructions

If you and your team have a `code_review.md` file and reference it from `AGENTS.md`, Codex can follow that guidance during review as well. This is a strong pattern for teams that want review behavior to stay consistent across repositories and contributors.

Codex shouldn't just generate code. With the right instructions, it can also help **test it, check it, and review it**.

If you use GitHub Cloud, you can set up Codex to run [code reviews for your PRs](/codex/integrations/github). At OpenAI, Codex reviews 100% of PRs. You can enable automatic reviews or have Codex reactively review when you @Codex.

### Example workflows

Source: [Workflows](/codex/workflows.md)

Codex works best when you treat it like a teammate with explicit context and a clear definition of "done."
This page gives end-to-end workflow examples for the Codex IDE extension, the Codex CLI, and Codex cloud.

If you are new to Codex, read [Prompting](/codex/prompting) first, then come back here for concrete recipes.

#### How to read these examples

Each workflow includes:

- **When to use it** and which Codex surface fits best (IDE, CLI, or cloud).
- **Steps** with example user prompts.
- **Context notes**: what Codex automatically sees vs what you should attach.
- **Verification**: how to check the output.

> **Note:** The IDE extension automatically includes your open files as context. In the CLI, you usually need to mention paths explicitly (or attach files with `/mention` and `@` path autocomplete).

---

#### Explain a codebase

Use this when you are onboarding, inheriting a service, or trying to reason about a protocol, data model, or request flow.

#### Recipe: explain a codebase in IDE

1. Open the most relevant files.
2. Select the code you care about (optional but recommended).
3. Prompt Codex:

   ```text
   Explain how the request flows through the selected code.

   Include:
   - a short summary of the responsibilities of each module involved
   - what data is validated and where
   - one or two "gotchas" to watch for when changing this
   ```

Verification:

- Ask for a diagram or checklist you can validate quickly:

```text
Summarize the request flow as a numbered list of steps. Then list the files involved.
```

#### Recipe: explain a codebase in CLI

1. Start an interactive session:

   ```bash
   codex
   ```

2. Attach the files (optional) and prompt:

   ```text
   I need to understand the protocol used by this service. Read @foo.ts @schema.ts and explain the schema and request/response flow. Focus on required vs optional fields and backward compatibility rules.
   ```

Context notes:

- You can use `@` in the composer to insert file paths from the workspace, or `/mention` to attach a specific file.

---

#### Fix a bug

Use this when you have a failing behavior you can reproduce locally.

#### Recipe: fix a bug in CLI

1. Start Codex at the repo root:

   ```bash
   codex
   ```

2. Give Codex a reproduction recipe, plus the file(s) you suspect:

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

Context notes:

- Supplied by you: the repro steps and constraints (these matter more than a high-level description).
- Supplied by Codex: command output, discovered call sites, and any stack traces it triggers.

Verification:

- Codex should re-run the repro steps after the fix.
- If you have a standard check pipeline, ask it to run it:

```text
After the fix, run lint + the smallest relevant test suite. Report the commands and results.
```

#### Recipe: fix a bug in IDE

1. Open the file where you think the bug lives, plus its nearest caller.
2. Prompt Codex:

   ```text
   Find the bug causing "Saved" to show without persisting changes. After proposing the fix, tell me how to verify it in the UI.
   ```

---

#### Write a test

Use this when you want to be very explicit about the scope you want tested.

#### Recipe: write a test in IDE

1. Open the file with the function.
2. Select the lines that define the function. Choose "Add to Codex Thread" from command palette to add these lines to the context.
3. Prompt Codex:

   ```text
   Write a unit test for this function. Follow conventions used in other tests.
   ```

Context notes:

- Supplied by "Add to Codex Thread" command: the selected lines (this is the "line number" scope), plus open files.

#### Recipe: write a test in CLI

1. Start Codex:

   ```bash
   codex
   ```

2. Prompt with a function name:

   ```text
   Add a test for the invert_list function in @transform.ts. Cover the happy path plus edge cases.
   ```

---

#### Prototype from a screenshot

Use this when you have a design mock, screenshot, or UI reference and you want a working prototype quickly.

### Prompting

Source: [Prompting](/codex/prompting.md)

#### Prompts

You interact with Codex by sending prompts (user messages) that describe what you want it to do.

Example prompts:

```text
Explain how the transform module works and how other modules use it.
```

```text
Add a new command-line option `--json` that outputs JSON.
```

When you submit a prompt, Codex works in a loop: it calls the model and then performs the actions indicated by the model output, such as file reads, file edits, and tool calls. This process ends when the task is complete or you cancel it.

As with ChatGPT, Codex is only as effective as the instructions you give it. Here are some tips we find helpful when prompting Codex:

- Codex produces higher-quality outputs when it can verify its work. Include steps to reproduce an issue, validate a feature, and run linting and pre-commit checks.
- Codex handles complex work better when you break it into smaller, focused steps. Smaller tasks are easier for Codex to test and for you to review. If you're not sure how to split a task up, ask Codex to propose a plan.

For more ideas about prompting Codex, refer to [workflows](/codex/workflows).

#### Thread model

A thread is a single session: your prompt plus the model outputs and tool calls that follow. A thread can include multiple prompts. For example, your first prompt might ask Codex to implement a feature, and a follow-up prompt might ask it to add tests.

A thread is said to be "running" when Codex is actively working on it. You can run multiple threads at once, but avoid having two threads modify the same files. You can also resume a thread later by continuing it with another prompt.

Threads can run either locally or in the cloud:

- **Local threads** run on your machine. Codex can read and edit your files and run commands, so you can see what changes and use your existing tools. To reduce the risk of unwanted changes outside your workspace, local threads run in a [sandbox](/codex/agent-approvals-security).
- **Cloud threads** run in an isolated [environment](/codex/cloud/environments). Codex clones your repository and checks out the branch it's working on. Cloud threads are useful when you want to run work in parallel or delegate tasks from another device. To use cloud threads with your repo, push your code to GitHub first. You can also [delegate tasks from your local machine](/codex/ide/cloud-tasks), which includes your current working state.

In the Codex app, you can also start a chat without choosing a project. Chats
aren't tied to a saved repository or project folder. Use them for research,
planning, connected-tool workflows, or other work where Codex shouldn't start
from a codebase. Chats use a Codex-managed `threads` directory under your Codex
home as their working location. By default, that location is `~/.codex/threads`.
To change the base location for this state, set `CODEX_HOME`; see
[Config and state locations](/codex/config-advanced#config-and-state-locations).

#### Context

When you submit a prompt, include context that Codex can use, such as references to relevant files and images. The Codex IDE extension automatically includes the list of open files and the selected text range as context.

As the agent works, it also gathers context from file contents, tool output, and an ongoing record of what it has done and what it still needs to do.

All information in a thread must fit within the model's **context window**, which varies by model. Codex monitors and reports the remaining space. For longer tasks, Codex may automatically **compact** the context by summarizing relevant information and discarding less relevant details. With repeated compaction, Codex can continue working on complex tasks over many steps.

#### Goal mode

Goal mode gives Codex a persistent objective to work toward across a longer
task. Use it when the work may take many steps, or when Codex needs a clear
definition of done that it can keep checking as it works.

When you set a goal, the goal text acts as both the starting prompt and the
completion criteria. Codex uses it to decide what to do next and whether the
task is complete. Start Goal mode with `/goal` in the [Codex
app](/codex/app/commands#set-or-manage-a-goal-with-goal), [IDE
extension](/codex/ide/slash-commands), or [CLI](/codex/cli/slash-commands#set-or-view-a-task-goal-with-goal).

If `/goal` doesn't appear in the slash command list, enable `features.goals`
in `config.toml`:

```toml
[features]
goals = true
```

You can also run `codex features enable goals` from the CLI or ask Codex to run it.
In the Codex app, progress appears above the composer with controls to pause,
resume, edit, or clear the goal.

Write goals so Codex can tell whether it has succeeded. Good goals include a
specific outcome, measurable target, or test criteria. For example:

```text
Migrate this codebase from JavaScript to TypeScript. The app should compile in
strict mode without explicit `any` type definitions.
```

```text
Reduce the time to interactive of the home page to below 1 second.
```

If the goal is hard to define up front, start with `/plan` and ask Codex to
shape it before implementation. You can also ask Codex to interview you and
draft a goal with clear success criteria.

You can continue steering Codex after the goal starts. Send follow-up messages
to adjust constraints, such as asking Codex to use a particular library or
avoid a specific approach. Use side chats when you want a status recap or
explanation without interrupting the main task. For long-running work, pause
the goal before you lose connectivity, then resume or edit it when you are
ready to continue.

### Speed

Source: [Speed](/codex/speed.md)

#### Fast mode

Codex offers the ability to increase the speed of the model for increased
credit consumption.

Fast mode increases supported model speed by 1.5x and consumes credits at a
higher rate than Standard mode. It currently supports GPT-5.5 and GPT-5.4,
consuming credits at 2.5x the Standard rate for GPT-5.5 and 2x the Standard
rate for GPT-5.4.

Use `/fast on`, `/fast off`, or `/fast status` in the CLI to change or inspect
the current setting. You can also persist the default with `service_tier =
"fast"` plus `[features].fast_mode = true` in `config.toml`. Fast mode is
available in the Codex IDE extension, Codex CLI, and the Codex app when you
sign in with ChatGPT. With an API key, Codex uses standard API pricing instead
and you can't use Fast mode credits.

#### Codex-Spark

GPT-5.3-Codex-Spark is a separate fast, less-capable Codex model optimized for
near-instant, real-time coding iteration. Unlike fast mode, which speeds up a
supported model at a higher credit rate, Codex-Spark is its own model choice
and has its own usage limits.

During research preview Codex-Spark is only available for ChatGPT Pro subscribers.

## Approvals, Sandboxing, and Security

<a id="approvals-sandboxing-and-security"></a>

Sandbox behavior, approvals, cyber-safety, and security-specific guidance.

### Codex Security FAQ

Source: [FAQ](/codex/security/faq.md)

#### Security FAQ: getting started

#### What is Codex Security?

Software security remains one of the hardest and most important problems in engineering. Codex Security is an LLM-driven security analysis toolkit that inspects source code and returns structured, ranked vulnerability findings with proposed patches. It helps developers and security teams discover and fix security issues at scale.

#### Why does it matter?

Software is foundational to modern industry and society, and vulnerabilities create systemic risk. Codex Security supports a defender-first workflow by continuously identifying likely issues, validating them when possible, and proposing fixes. That helps teams improve security without slowing development.

#### What business problem does Codex Security solve?

Codex Security shortens the path from a suspected issue to a confirmed, reproducible finding with evidence and a proposed patch. That reduces triage load and cuts false positives compared with traditional scanners alone.

#### How does Codex Security work?

Codex Security runs analysis in an ephemeral, isolated container and temporarily clones the target repository. It performs code-level analysis and returns structured findings with a description, file and location, criticality, root cause, and a suggested remediation.

For findings that include verification steps, the system executes proposed commands or tests in the same sandbox, records success or failure, exit codes, stdout, stderr, test results, and any generated diffs or artifacts, and attaches that output as evidence for review.

#### Does it replace SAST?

No. Codex Security complements SAST. It adds semantic, LLM-based reasoning and automated validation, while existing SAST tools still provide broad deterministic coverage.

#### Features

#### What is the analysis pipeline?

Codex Security follows a staged pipeline:

1. **Analysis** builds a threat model for the repository.
2. **Commit scanning** reviews merged commits and repository history for likely issues.
3. **Validation** tries to reproduce likely vulnerabilities in a sandbox to reduce false positives.
4. **Patching** integrates with Codex to propose patches that reviewers can inspect before opening a PR.

It works alongside engineers in GitHub, Codex, and standard review workflows.

#### What languages are supported?

Codex Security is language-agnostic. In practice, performance depends on the model's reasoning ability for the language and framework used by the repository.

#### What outputs do I get after the scan completes?

You get ranked findings with criticality, validation status, and a proposed patch when one is available. Findings can also include crash output, reproduction evidence, call-path context, and related annotations.

#### How is customer code isolated?

Each analysis and validation job runs in an ephemeral Codex container with session-scoped tools. Artifacts are extracted for review, and the container is torn down after the job completes.

#### Does Codex Security auto-apply patches?

No. The proposed patch is a recommended remediation. Users can review it and push it as a PR to GitHub from the findings UI, but Codex Security does not auto-apply changes to the repository.

#### Does the project need to be built for scanning?

No. Codex Security can produce findings from repository and commit context without a compile step. During auto-validation, it may try to build the project inside the container if that helps reproduce the issue. For environment setup details, see [Codex cloud environments](/codex/cloud/environments).

#### How does Codex Security reduce false positives and avoid broken patches?

Codex Security uses two stages. First, the model ranks likely issues. Then auto-validation tries to reproduce each issue in a clean container. Findings that successfully reproduce are marked as validated, which helps reduce false positives before human review.

#### How long do initial scans take, and what happens after that?

Initial scan time depends on repository size, build time, and how many findings proceed to validation. For some repositories, scans can take several hours. For larger repositories, they can take multiple days. Later scans are usually faster because they focus on new commits and incremental changes.

#### What is a threat model?

A threat model is the scan-time security context for a repository. It combines a concise project overview with attack-surface details such as entry points, trust boundaries, auth assumptions, and risky components. For more detail, see [Improving the threat model](/codex/security/threat-model).

#### How is a threat model generated?

Codex Security prompts the model to summarize the repository architecture and security entry points, classify the repository type, run specialized extractors, and merge the results into a project overview or threat model artifact used throughout the scan.

#### Does it replace manual security review?

No. Codex Security accelerates review and helps rank findings, but it does not replace code-level validation, exploitability checks, or human threat assessment.

#### Can I edit the threat model?

Yes. Codex Security creates the initial threat model, and you can update it as the architecture, risks, and business context change. For the editing workflow, see [Improving the threat model](/codex/security/threat-model).

### Codex Security plugin changelog

Source: [Codex Security plugin changelog](/codex/security/plugin/changelog.md)

This changelog highlights changes that affect how you run scans, review
results, and move findings toward remediation.

#### 0.1.9 (June 2026)

#### Review scans in the findings workspace

- Review completed scans in a dedicated workspace that brings findings,
  coverage, severity, confidence, and scan artifacts together.
- Filter and sort findings, including sorting by highest confidence, while
  preserving your workspace state during refreshes.
- Open a finding to review source evidence, validation details, reachability,
  impact, and remediation guidance in one place.

#### Run scans with less setup

- Run standard scans against Git repositories, individual folders, or
  codebases without Git history. Deep scans can also target a specific folder.
- Cancel an active scan explicitly, resume an interrupted scan without another
  setup prompt, and receive a warning before starting concurrent deep scans.
- Follow clearer setup and progress states, with more compact progress
  summaries and errors that remain visible until you address them.

#### Export portable, verifiable results

- Use a consistent completed-scan format with a manifest, structured findings,
  coverage data, and a Markdown report derived from the same canonical result.
- Export findings as JSON, CSV, or SARIF for analysis, archiving, and integration
  with other security tools.
- Improved scan completion and filesystem handling, including fixes for Windows
  paths and scan locking.

#### Triage and track existing findings

- Triage existing findings from scanners, advisories, bug bounty reports,
  GitHub, Jira, Linear, or Codex Security results against the current codebase.
  The triage workflow returns an evidence-backed verdict and a prioritized
  action queue.
- Track selected validated findings in Linear, Jira, or GitHub issues, or create
  a private draft GitHub Security Advisory when the repository meets the
  advisory requirements.
- Review duplicate checks, source context, destination visibility, and the
  exact proposed content before approving a write. Codex reads the result back
  after creation or update to verify it.

### Codex Security plugin quickstart

Source: [Codex Security plugin quickstart](/codex/security/plugin.md)

Codex Security is a security-review plugin for Codex that scans your code for
vulnerabilities, validates plausible findings, and presents evidence and
remediation guidance in a reviewable workspace. Use it to find security issues
in code you own or have authorization to assess before they reach production.

This quickstart takes you through one recommended first run: an ordinary,
read-only scan of a local repository in the Codex app.

This page covers the plugin that runs in a local Codex thread. To scan a
connected GitHub repository in Codex web, see [Codex Security cloud
setup](/codex/security/setup).

#### Install the plugin

Open the repository you want to assess in the Codex app, then install Codex
Security:

Install the Codex Security plugin

After installation, start a new thread in that repository. Codex loads plugins
when the thread starts, so don't continue in a thread that was already open.

#### Run your first scan

For the best scan quality, use `gpt-5.5`
with `high` or `xhigh` reasoning effort.

1.  Ask for an ordinary scan

    Send this prompt in the new thread:

    ```text
    Run a Codex Security scan on this repository.
    ```

2.  Confirm the setup

    Codex opens a setup workspace before it starts. For your first run, use these
    settings:
    - **Scan type:** `Codebase`
    - **Deep scan:** Off
    - **Scan area:** `Entire codebase`
    - **Threat model scoping guidance:** Leave blank unless you already know a
      specific attack vector or application area that deserves priority.

    Confirm that **Codebase**, **Current branch**, and **Last commit** identify
    the repository you intended to scan. Then select **Start scan**.

        Configure the scan target, scan area, branch, and optional threat model
        guidance before starting the scan.

3.  Let the scan finish

    The scan can take time. Keep the thread running until the workspace reports
    completion. If Codex identifies a configuration limitation, review the exact
    limitation and proposed change before allowing it to update your
    configuration.

4.  Review the result

    Use the UI to browse findings or open the generated report for a complete,
    portable review.

        Browse findings by severity, category, directory, patch status, and
        review status.

#### What the scan creates

Every completed scan opens a findings workspace. Use it to review findings and
coverage without inspecting raw artifacts. The scan also creates:

- `report.md`, a complete portable report for sharing or archiving.
- Structured scan data in `scan-manifest.json`, `findings.json`, and
  `coverage.json` for automation and integrations. You normally don't need to
  open these files yourself.

#### Choose your next workflow

- [Run a standard or scoped scan](/codex/security/plugin/scans) when you want
  to scan a repository or one folder with the default workflow.
- [Run a deep scan](/codex/security/plugin/deep-scans) when you need a more
  comprehensive scan and can wait longer for it to finish.
- [Review code changes](/codex/security/plugin/code-changes) when the target is
  a pull request, commit, branch range, or working-tree patch.
- [Triage a backlog](/codex/security/plugin/triage-backlog) when you have
  existing security findings to review.
- [Fix and verify a finding](/codex/security/plugin/fix-findings) after you
  accept one finding for remediation.
- [Export or track findings](/codex/security/plugin/export-findings) when you
  need JSON, CSV, SARIF, an approval-gated Linear, GitHub, or Jira issue, or a
  private draft GitHub Security Advisory.

#### Install from Codex CLI

To install the same plugin from the CLI, start Codex in the repository and open
the plugin browser:

```text
codex
/plugins
```

Search for **Codex Security**, select `Install plugin`, and start a new thread.
Then use the same first-scan prompt.

### Codex Security setup

Source: [Codex Security setup](/codex/security/setup.md)

This page walks you from initial access to reviewed findings and remediation pull requests in Codex Security.

Confirm you've set up Codex Cloud first. If not, see [Codex
Cloud](/codex/cloud) to get started.

#### 1. Access and environment

Codex Security scans GitHub repositories connected through [Codex Cloud](/codex/cloud).

- Confirm your workspace has access to Codex Security.
- Confirm the repository you want to scan is available in Codex Cloud.

Go to [Codex environments](https://chatgpt.com/codex/settings/environments) and check whether the repository already has an environment. If it doesn't, create one there before continuing.

[Open environments](https://chatgpt.com/codex/settings/environments)

#### 2. New security scan

After the environment exists, go to [Create a security scan](https://chatgpt.com/codex/security/scans/new) and choose the repository you just connected.

[Create a security scan](https://chatgpt.com/codex/security/scans/new)

Codex Security scans repositories from newest commits backward first. It uses this to build and refresh scan context as new commits come in.

To configure a repository:

1. Select the GitHub organization.
2. Select the repository.
3. Select the branch you want to scan.
4. Select the environment.
5. Choose a **history window**. Longer windows provide more context, but backfill takes longer.
6. Click **Create**.

#### 3. Initial scans can take a while

When you create the scan, Codex Security first runs a commit-level security pass across the selected history window.
The initial backfill can take a few hours, especially for larger repositories or longer windows.
If findings aren't visible right away, this is expected. Wait for the initial scan to finish before opening a ticket or troubleshooting.

Initial scan setup is automatic and thorough. This can take a few hours. Don’t
be alarmed if the first set of findings is delayed.

#### 4. Review scans and improve the threat model

[Review scans](https://chatgpt.com/codex/security/scans)

When the initial scan finishes, open the scan and review the threat model that was generated.
After initial findings appear, update the threat model so it matches your architecture, trust boundaries, and business context.
This helps Codex Security rank issues for your team.

If you want scan results to change, you can edit the threat model with your
updated scope, priorities, and assumptions.

After initial findings appear, revisit the model so scan guidance stays aligned with current priorities.
Keeping it current helps Codex Security produce better suggestions.

For a deeper explanation of threat models and how they affect criticality and triage, see [Improving the threat model](/codex/security/threat-model).

#### 5. Review findings and patch

After the initial backfill completes, review findings from the **Findings** view.

[Open findings](https://chatgpt.com/codex/security/findings)

You can use two views:

- **Recommended Findings**: an evolving top 10 list of the most critical issues in the repo
- **All Findings**: a sortable, filterable table of findings across the repository

Click a finding to open its detail page, which includes:

- a concise description of the issue
- key metadata such as commit details and file paths
- contextual reasoning about impact
- relevant code excerpts
- call-path or data-flow context when available
- validation steps and validation output

You can review each finding and create a PR directly from the finding detail page.

[Review findings and create a PR](https://chatgpt.com/codex/security/findings)

#### Security setup references

- [Codex Security](/codex/security) gives the product overview.
- [FAQ](/codex/security/faq) covers common questions.
- [Improving the threat model](/codex/security/threat-model) explains how to improve scan context and finding prioritization.

### Export and track security findings

Source: [Export and track security findings](/codex/security/plugin/export-findings.md)

Use a completed Codex Security scan as the source for two different handoffs:

- **Export** creates a portable JSON, CSV, or SARIF file.
- **Track findings** prepares selected findings as Linear, GitHub, or Jira issues
  or one private draft GitHub Security Advisory, checks for duplicates, and
  waits for your approval before writing.

These workflows don't change the sealed scan bundle.

#### Export a portable artifact

Open the completed findings workspace, select **Export**, and choose a format:

| Format | Use it for                                                        |
| ------ | ----------------------------------------------------------------- |
| JSON   | Preserve the sealed structured findings for tools and scripts.    |
| CSV    | Review findings and current local triage state in a spreadsheet.  |
| SARIF  | Send findings to tools that support the SARIF interchange format. |

Select **Export findings** and use the returned artifact path. Keep the
original `scan-manifest.json`, `findings.json`, and `coverage.json` together
when another tool needs the complete scan context rather than a findings-only
projection.

    Export completed findings as JSON, CSV, or SARIF for downstream review and
    tooling.

#### Track selected findings

The `$codex-security:track-findings` workflow accepts one validated finding or
an explicitly selected batch of up to 25 findings from one sealed scan for
issue tracking. Draft GitHub Security Advisories accept one finding only. One
run uses one provider and one destination.

For Linear, send a prompt like:

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] for the Linear team [team] and project [project, if
any]. Check for duplicates and show me the exact issue title, body, metadata,
and destination. Do not create or update anything until I approve that payload.
```

For GitHub issues, send:

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] for GitHub repository [owner/repository]. Check open
and closed issues for duplicates and show me the exact issue title, body,
metadata, repository visibility, and authenticated transport. Do not create or
update anything until I approve that payload.
```

For Jira, send:

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] for Jira project [project key] as [issue type].
Check for duplicates and show me the exact issue summary, description,
metadata, and destination. Do not create or update anything until I approve
that payload.
```

Jira tracking requires the native Atlassian Rovo app in Codex. Reusing an issue
requires read access; creating or updating one requires read and write access.

For a private draft GitHub Security Advisory, send:

```text
Use $codex-security:track-findings to prepare finding [finding ID] from
[completed scan directory] as a private draft GitHub Security Advisory in
[owner/repository]. Verify the sealed source revision, repository, affected
paths, package metadata, and duplicate state. Show me the exact advisory
payload, authenticated GitHub CLI identity, and disclosure warnings. Do not
create anything until I approve that payload.
```

Draft advisories require one finding from a sealed `git_revision` scan, the
verified public canonical source repository, and administrator access. The
workflow doesn't batch, update, publish, or close advisories. Use an approved
private issue destination when the source doesn't meet those requirements.

#### Review the proposed write

1. Confirm the finding ID and fingerprint came from the intended sealed scan.
2. Confirm the provider, exact Linear team, GitHub repository, Jira project, or
   advisory repository, and the live destination visibility.
3. Review the duplicate outcome: `create`, `reuse`, `update`, or `blocked`.
4. Read the complete proposed title, body, source locations, and provider
   metadata. Remove exploit detail or internal evidence that the destination
   shouldn't expose.
5. Approve only that exact payload. A changed destination, visibility, finding
   set, or body requires a new preview.

Sensitive findings should go to a private destination. Creating an issue in an
internal or public GitHub repository requires an explicit visibility warning
and approval of the complete content. Treat a draft advisory description as
eventually public and remove credentials, private evidence, and unnecessary
exploit details before approval.

#### Verify the tracked item

After approval, Codex revalidates the sealed source, destination, access, and
duplicate state. It processes a batch serially and stops on the first uncertain
result. A create, update, or reuse is complete only after Codex reads the exact
issue back and verifies its binding identifiers and content.

Keep the returned canonical issue or advisory URL with your triage record.
Continue with [Fix and verify a finding](/codex/security/plugin/fix-findings)
when the owner accepts the item for remediation.

### Fix and verify security findings

Source: [Fix and verify security findings](/codex/security/plugin/fix-findings.md)

Codex Security helps you turn a backlog of accepted findings into tested code
changes. You can fix findings in the findings workspace UI or invoke the
remediation workflow from a prompt, the command line, or CI/CD. In each case,
Codex validates the issue, proposes a focused patch, adds regression coverage,
and verifies that legitimate behavior still works.

Start by fixing one accepted finding so you can evaluate the patch and
verification quality. Once the workflow meets your standards, scale it across
more accepted findings by processing each finding in a separate task or CI/CD
job. Keeping each fix scoped makes the code changes and evidence easier to
review.

#### Fix a finding in the UI

Open an accepted finding in the findings workspace to generate, review, apply,
and verify its patch.

1. Generate a focused patch

   Open the finding, select the **Patch** tab, and select **Generate patch**.
   Codex validates or reproduces the issue when feasible and writes a patch
   artifact without modifying the selected checkout.

2. Review the proposed diff

   Read every changed source and regression-test file. Use **Open diff in
   editor** when you want the full patch in the editor. Reject broad refactors,
   unrelated cleanup, or changes that weaken another security control.

3. Apply the patch locally

   Select **Apply patch locally** only after the diff is acceptable. Codex
   applies the exact generated patch to the working tree and records that state.
   Review the working-tree diff before continuing.

4. Verify the fix

   Select **Verify fix**. Codex reruns the original reproducer or strongest
   available exploit check, focused regression coverage, legitimate-behavior
   checks, nearby bypass checks, and relevant repository tests.

5. Close the finding deliberately

   Verification doesn't automatically close a finding. Review the commands,
   results, and remaining proof gap, then close the finding with an accurate
   reason or keep it open for more work.

   Review the proposed source and test changes before applying the patch
   locally.

#### Fix a finding from the CLI

Use the Codex CLI when you already have a finding from a scan, ticket, advisory,
disclosure, security assessment, or internal review:

The commands below assume Codex Security is already installed in the
`CODEX_HOME` used by `codex exec`. A fresh CI runner doesn't have marketplace
plugins installed by default.

```text
Use $codex-security:fix-finding to fix finding  from . Validate the issue, make the smallest safe change, add focused regression coverage, and verify that the issue no longer reproduces.
```

Include the known source, sink, attacker input, impact, expected invariant,
reproducer, affected files, and validation command. Codex can inspect the
repository for missing technical details, but it should ask before guessing a
product policy or intended security invariant.

For an automated run, pass the prompt to `codex exec` after checking out the
code, making the finding report available, and provisioning the plugin in that
`CODEX_HOME`:

```bash
codex exec 'Use $codex-security:fix-finding to fix finding  from . Validate the issue, make the smallest safe change, add focused regression coverage, and verify that the issue no longer reproduces.'
```

#### Scan and fix findings in CI/CD

Provision Codex Security in the runner's `CODEX_HOME` before invoking these
skills. The command below uses the installed plugin; it doesn't install the
plugin itself.

In CI/CD, use one Codex run to scan the diff and generate fixes for every
finding it discovers. The job doesn't need finding IDs or report paths as
inputs. Codex carries the findings from the scan into remediation within the
same run.

The all-in-one run should:

1. Resolve the base and head revisions for the change.
2. Run `$codex-security:security-diff-scan` against that diff.
3. Invoke `$codex-security:fix-finding` for every finding returned by the scan.
4. Generate focused patches and regression coverage, then verify each fix.
5. Return the scan results, patches, tests, verification commands, and any
   finding it couldn't fix.

For example:

```bash
codex exec 'Use $codex-security:security-diff-scan to review changes from  to HEAD. For every finding returned by the scan, use $codex-security:fix-finding to generate and verify a minimal fix. Continue until every finding has either a verified fix or an explicit explanation of why it could not be fixed. Return the scan results, patches, tests, verification commands, and remaining failures.'
```

After verification, merge the patch through your normal code-review and release
process. To hand findings to another team before remediation, see [Export or
track findings](/codex/security/plugin/export-findings).

### Improving the threat model

Source: [Improving the threat model](/codex/security/threat-model.md)

Learn what a threat model is and how editing it improves Codex Security's suggestions.

#### What a threat model is

A threat model is a short security summary of how your repository works. In Codex Security, you edit it as a `project overview`, and the system uses it as scan context for future scans, prioritization, and review.

Codex Security creates the first draft from the code. If the findings feel off, this is the first thing to edit.

A useful threat model calls out:

- entry points and untrusted inputs
- trust boundaries and auth assumptions
- sensitive data paths or privileged actions
- the areas your team wants reviewed first

For example:

> Public API for account changes. Accepts JSON requests and file uploads. Uses an internal auth service for identity checks and writes billing changes through an internal service. Focus review on auth checks, upload parsing, and service-to-service trust boundaries.

That gives Codex Security a better starting point for future scans and finding prioritization.

#### Improving and revisiting the threat model

If you want to improve the results, edit the threat model first. Use it when findings are missing the areas you care about or showing up in places you don't expect. The threat model changes future scan context.

Some users copy the current threat model into Codex, have a conversation to
improve it based on the areas they want reviewed more closely, and then paste
the updated version back into the web UI.

#### Where to edit

To review or update the threat model, go to [Codex Security scans](https://chatgpt.com/codex/security/scans), open the repository, and click **Edit**.

#### Threat model references

- [Codex Security setup](/codex/security/setup) covers repository setup and findings review.
- [Codex Security](/codex/security) gives the product overview.
- [FAQ](/codex/security/faq) covers common questions.

### Review code changes for security

Source: [Review code changes for security](/codex/security/plugin/code-changes.md)

Use a security change review when you need evidence about regressions introduced
by one Git-backed change set. The workflow reviews every changed source-like
file and directly supporting code without turning the task into a general
repository audit.

If you want to scan a full repository instead of a specific change, see [Run a
security scan](/codex/security/plugin/scans).

#### Run a manual review

For uncommitted changes, send:

```text
Use $codex-security:security-diff-scan to review my current uncommitted changes for security regressions.
```

For a commit or branch range, identify both ends when needed:

```text
Use $codex-security:security-diff-scan to review the changes from origin/main to HEAD for security regressions. Focus on authentication, authorization, input handling, filesystem access, network requests, and secrets.
```

You can also name a pull request when its base and head revisions are available
in the local checkout.

#### Confirm the change in setup

1. Confirm **Scan type** is `Changes`.
2. Confirm the checked-out **Codebase**, **Current branch**, and **Last commit**.
3. Under **Changes to review**, choose:
   - `Uncommitted changes` for the current working tree.
   - The latest commit for a single-commit review.
   - A base and head revision for a branch or pull-request range.
4. Confirm that the summary describes the change you intended to review.
5. Select **Start scan**.

The workflow doesn't check out another branch or change the selected working
tree. If a requested revision isn't available locally, fetch it before the
review or provide a locally available base and head.

#### Act on findings

After reviewing the results, [fix and verify an accepted
finding](/codex/security/plugin/fix-findings) or [export and track
findings](/codex/security/plugin/export-findings).

#### Automate reviews in CI/CD

Run the same `$codex-security:security-diff-scan` skill from CI when the runner
can invoke the Codex CLI without interaction. The runner must already have
Codex Security installed in the `CODEX_HOME` used by `codex exec`. A fresh
runner doesn't have marketplace plugins installed by default, and
`openai/codex-action` doesn't install the plugin.

Before running the scan:

1. Provision Codex Security in the runner's `CODEX_HOME`.
2. Check out the exact base and head revisions with their Git history.
3. Set the runner's platform temporary directory, such as `TMPDIR`, to a
   writable artifact location. The diff-scan workflow reviews the checkout
   without changing it, but it writes its sealed scan bundle and final report
   outside the repository.
4. Start with advisory results. Review scan quality and runtime before making
   the job a required check.

Then invoke the plugin explicitly:

```bash
export CODEX_HOME=/path/to/provisioned-codex-home
export TMPDIR=/path/to/writable/temp

codex exec \
  --sandbox workspace-write \
  --output-last-message "$TMPDIR/codex-security-review.md" \
  'Use $codex-security:security-diff-scan to review changes from  to  for security regressions. Do not modify the checkout. Return the final report path, findings summary, reviewed surfaces, deferred coverage, and open questions.'
```

Archive the generated scan bundle and final report, then publish the Markdown
summary through your CI/CD system. If you use `openai/codex-action`, point its
`codex-home` input at the same provisioned directory and pass the skill prompt
above. The action can install and run the Codex CLI, but plugin provisioning is
a separate prerequisite.

For API-key handling, sandbox controls, fork protections, and a GitHub Actions
workflow, see the [Codex GitHub Action guide](/codex/github-action).

### Run a Codex Security scan

Source: [Run a Codex Security scan](/codex/security/plugin/scans.md)

Use a Codex Security scan for your first review and for most routine repository
or component assessments. It runs the complete scan workflow once.

Once you're satisfied with the results, run a [deep scan](/codex/security/plugin/deep-scans)
for a more comprehensive assessment. Deep scans take longer, but they're more
thorough.

#### Choose the scan area

Scan the whole repository when you need broad coverage and the repository is a
reasonable review unit:

```text
Use $codex-security:security-scan to scan this repository for security vulnerabilities.
```

Scan a folder when a monorepo is too large or one service, package, or component
has a clear owner and security boundary:

```text
Use $codex-security:security-scan to scan this repository for security vulnerabilities, focusing on the services/billing component.
```

For a large monorepo, start with one meaningful product or service boundary.

#### Configure the scan

1. Confirm **Scan type** is `Codebase` and leave **Deep scan** off.
2. Confirm the **Codebase**, **Current branch**, and **Last commit**.
3. Set **Scan area** to `Entire codebase` or enter one repository-relative
   folder.
4. Add threat-model guidance only when it changes the review. Useful guidance
   names attacker-controlled inputs, trust boundaries, sensitive actions, or a
   specific area to prioritize.
5. Select **Start scan**.

Repository-specific guidance in `AGENTS.md` can also establish the product
surfaces, trust boundaries, supported validation commands, and out-of-scope
areas. Prefer concrete repository context over a generic planning step before
the scan.

#### Let the phases complete

A scan runs these phases in order:

1. **Threat modeling** identifies assets, entry points, trust boundaries, and
   security invariants.
2. **Finding discovery** reviews the requested code for plausible broken
   controls and source-to-sink paths.
3. **Validation** tests or otherwise checks each candidate and records evidence
   or proof gaps.
4. **Attack-path analysis** evaluates realistic reachability, impact, and
   severity.
5. **Finalization** validates the structured scan contract and generates
   `report.md`.

Codex reports phase and coverage progress as the scan runs. Don't judge the
result from early candidates or stop the scan because one phase takes longer
than another.

#### Review the completed scan

Review the result in this order:

1. Confirm the target, revision, and scan area.
2. Read reviewed surfaces and every explicit deferred or follow-up area.
3. For each finding, inspect the root control or sink, attacker-controlled
   input, validation method, remaining uncertainty, realistic reachability,
   severity rationale, and proposed remediation.
4. Dismiss findings whose evidence doesn't support the claimed path or impact.
5. Select one accepted finding before starting a fix.

   The completed workspace summarizes scan status, coverage, severity, and
   artifacts before listing the findings.

   A finding connects the relevant source to its entry point, reachability,
   likelihood, impact, and any limits or counterevidence.

#### Use the results

Use the findings workspace for normal review. It presents findings, coverage,
and follow-up areas without requiring you to inspect raw JSON. Open `report.md`
when you need a complete portable review for sharing or archiving.

Behind the workspace, each scan preserves `scan-manifest.json`, `findings.json`,
and `coverage.json` for automation and integrations. You normally don't need to
open these files yourself.

The findings workspace can also create portable JSON, CSV, and SARIF files. See
[Export or track findings](/codex/security/plugin/export-findings).

#### Next step

After a person accepts a finding, use [Fix and verify a finding](/codex/security/plugin/fix-findings)
to generate and review one bounded patch. Don't ask Codex to fix every finding
from a scan in one task.

### Run a deep security scan

Source: [Run a deep security scan](/codex/security/plugin/deep-scans.md)

A deep scan is slower but more thorough than a standard scan. Use it when you
want to reduce variability and search more comprehensively.

Start with a [standard scan](/codex/security/plugin/scans). Once you're
satisfied with the results, run a deep scan for a more thorough assessment.

#### Choose between standard and deep scans

|                         | Standard scan                                      | Deep scan                                             |
| ----------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| Best for                | First runs and routine repository or folder review | More thorough reviews after a standard scan           |
| Variability             | Standard                                           | Reduced                                               |
| Scope                   | Repository or explicit folder                      | Repository or explicit folder                         |
| Runtime and resources   | Lower                                              | Higher                                                |
| Pull requests and diffs | Use the change-review workflow                     | Not supported; use the change-review workflow instead |

#### Start the deep scan

For a repository-wide review, send:

```text
Use $codex-security:deep-security-scan to run a deep security scan of this repository.
```

For one component in a monorepo, identify the folder explicitly:

```text
Use $codex-security:deep-security-scan to run a deep security scan of /absolute/path/to/repository/services/payments.
```

In the Codex app, a scoped deep scan resolves the selected folder as the
**Codebase** and shows its scan area as the entire selected target.

#### Confirm setup and preflight

1. Confirm **Scan type** is `Codebase` and **Deep scan** is on.
2. Confirm that **Codebase** is the repository or exact folder you intended to
   scan.
3. Add threat-model guidance only for concrete attack vectors, sensitive
   application areas, or repository context that the code can't reveal.
4. Select **Start scan**.
5. Review the capability preflight. If it proposes a configuration change,
   review the exact change and let Codex apply it only if it matches your
   environment. Start a new thread if Codex tells you a restart is required.

#### Review the result

Deep scans use the same findings workspace and generated `report.md` as standard
scans. Review the coverage summary before the findings. A deep scan searches
the code more extensively, but any deferred surface or proof gap still limits
the conclusion. For a finding you accept, continue with [Fix and verify a
finding](/codex/security/plugin/fix-findings).

To review a pull request, commit, branch range, or local patch, use [Review code
changes](/codex/security/plugin/code-changes). A deep scan never substitutes
for the diff-focused workflow.

### Triage a backlog

Source: [Triage a backlog](/codex/security/plugin/triage-backlog.md)

Use `$codex-security:triage-finding` to review existing security findings
against the current repository. This workflow performs a read-only static
analysis: Codex treats each finding as an unproven claim and inspects repository
evidence without executing the code.

Run this workflow from a Codex project scoped to the repository you want to
assess. Codex must be able to read the repository's source code. Jira, Linear,
and GitHub connectors provide finding data, but they don't replace access to
the source code.

Under the hood, Codex starts from the cited code or version information. It
traces the claimed attacker-controlled source, relevant security controls,
dangerous sink, and reachable path. It also checks the product surface and trust
boundary, looks for counterevidence, and records proof gaps. Codex then returns
one verdict per finding and ranks the findings that need action or further
review.

This differs from `$codex-security:validation`, which can build or run code,
create a focused test or proof of concept, or exercise a real interface to
reproduce or disprove a finding. Use triage to classify and prioritize an
existing backlog. Use validation when runtime evidence could resolve a finding
that static evidence leaves uncertain.

Backlog triage starts from existing findings. To search the repository for new
vulnerabilities, [run a security scan](/codex/security/plugin/scans). Triage
doesn't modify the repository or implement fixes.

#### Choose the findings to triage

You can supply one finding or a collection from these sources:

| Source                   | What to provide                                                                                                                                                                                                                                                                                                                                                                                                                                        | Requirements                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pasted or local findings | SARIF results, a CVE or GHSA, an advisory, a scanner ticket, a bug bounty report, a Codex Security finding artifact, or a plain-language vulnerability claim.                                                                                                                                                                                                                                                                                          | No connector required.                                                                                                                                                                           |
| Jira or Linear           | Exact security or vulnerability issue URLs or identifiers, Jira JQL, or a Linear team, project, or search phrase. Codex retrieves the selected issue content before triage.                                                                                                                                                                                                                                                                            | [Jira through Atlassian Rovo](codex://plugins/plugin_connector_692de805e3ec8191834719067174a384) or [Linear](codex://plugins/plugin_asdk_app_69a089a326dc8191b32a3f2553f5be2c) with read access. |
| GitHub                   | A repository and one finding source: code scanning, `Dependabot` vulnerabilities and malware, security advisories and private vulnerability reports, or all sources. If you don't specify a repository, Codex uses the GitHub repository attached to the current Codex project when available. GitHub Issues aren't included in the default GitHub sources; provide a specific issue or ask for GitHub Issues explicitly when you want to triage them. | [GitHub](codex://plugins/plugin_connector_1p_1a69035c238881919c4190932b2df699) with access to the selected repository and finding type.                                                          |

Codex keeps one result for every supplied finding, in input order, so each
source finding stays traceable. It doesn't merge or drop findings that look
like duplicates.

#### Run read-only triage

For pasted findings or local artifacts, send a prompt like:

```text
Use $codex-security:triage-finding to triage these existing security findings against this repository:

[Paste the findings or provide the artifact path.]
```

For Jira or Linear issues, identify the issue set and keep the source system
read-only:

```text
Use $codex-security:triage-finding to import and triage the security findings from [Jira or Linear issue URLs, identifiers, or query] against this repository.
Do not change the source issues.
```

For GitHub findings, name the repository and source:

```text
Use $codex-security:triage-finding to import and triage [code scanning, Dependabot vulnerabilities and malware, security advisories and private vulnerability reports, or all] from [owner/repository] against this repository.
```

To use the GitHub repository attached to the current Codex project, specify
only the finding source:

```text
Use $codex-security:triage-finding to import and triage [code scanning, Dependabot vulnerabilities and malware, security advisories and private vulnerability reports, or all] from GitHub against this repository. Use the GitHub repository attached to the current Codex project.
```

The workflow proceeds in this order:

1. Collect and organize the findings

   Codex retrieves any requested issue or GitHub content, preserves source
   identifiers and references, and creates one triage item per input. It builds
   the complete item list before assigning verdicts.

2. Confirm the repository context

   Codex resolves the current repository and revision when available. It reads
   `SECURITY.md` when present so supported versions, trusted inputs, product
   boundaries, and out-of-scope surfaces inform the assessment.

3. Inspect the static evidence

   For each finding, Codex traces the claimed attacker-controlled source,
   relevant security control, vulnerable sink, reachable path, and supported
   security boundary. It records supporting evidence, evidence against the
   claim, and proof gaps.

4. Assign verdicts and ranks

   Codex assigns a verdict and confidence to every finding. It ranks
   `confirmed` and `needs_review` findings by exploitability in separate queues.

#### Review the results

| Verdict          | What it means                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `confirmed`      | Repository evidence shows that the vulnerable path is reachable under the stated preconditions and crosses a supported security boundary.                     |
| `not_actionable` | Repository evidence rules out the claim, such as by showing an unaffected version, unreachable path, effective guard, or non-shipped surface.                 |
| `needs_review`   | Repository evidence isn't enough to decide because required information is missing, ambiguous, runtime-dependent, environment-dependent, or policy-dependent. |

Exploitability ranks use positive integers starting at `1`, independently
within each verdict queue. This keeps remediation priorities separate from
unresolved review work. Rank `1` is the most exploitable `confirmed` finding
or the highest-priority `needs_review` finding in that result set. The rank
isn't a scanner severity score, and `not_actionable` findings aren't ranked.

For each finding, review:

- the rationale for the verdict and rank
- supporting evidence and evidence against the claim
- open questions and remaining proof gaps
- the affected location and component
- the product surface and source trust level
- the recommended next step
- the [`$codex-security:fix-finding`](/codex/security/plugin/fix-findings)
  handoff, when the finding is `confirmed`

Triage is complete when every supplied finding has one result, Codex preserves
its source identifier, and any uncertainty is explicit. Jira, Linear, and other
backlog records remain unchanged unless you ask Codex to write back after
reviewing the triage results.

#### Next steps

- `confirmed`: After a person accepts the finding for remediation, use
  [`$codex-security:fix-finding`](/codex/security/plugin/fix-findings) to fix and
  verify it. Triage prepares a prompt-ready handoff but doesn't invoke the skill
  automatically.
- `needs_review`: If running code can resolve the proof gap, use
  `$codex-security:validation` to perform bounded dynamic validation. Pass
  the finding claim, affected locations, preconditions, static evidence, and
  proof gaps from the triage result:

  ```text
  Use $codex-security:validation to dynamically validate finding [triage item ID or source ID] from the backlog triage result. Use the strongest realistic, bounded method, record exactly what was tested, and preserve any remaining proof gaps.
  ```

  Unlike triage, validation may build or run code, create a focused test or
  proof of concept, or exercise a real interface. Review the proposed commands
  before approving them and keep [Codex approval and security
  policies](/codex/agent-approvals-security) in place.

- `needs_review`: If the finding depends on product policy or deployment
  context, answer the listed open questions before changing code.
- `not_actionable`: Keep the evidence with your triage record. Codex doesn't
  automatically close or update the source ticket.
- To look for vulnerabilities beyond the supplied backlog, [run a security
  scan](/codex/security/plugin/scans).

### Agent approvals & security

Source: [Agent approvals & security](/codex/agent-approvals-security.md)

Codex helps protect your code and data and reduces the risk of misuse.

This page covers how to operate Codex safely, including sandboxing, approvals,
and network access. If you are looking for Codex Security, the product for
scanning connected GitHub repositories, see [Codex Security](/codex/security).

By default, the agent runs with network access turned off. Locally, Codex uses an OS-enforced sandbox that limits what it can touch (typically to the current workspace), plus an approval policy that controls when it must stop and ask you before acting.

For a high-level explanation of how sandboxing works across the Codex app, IDE
extension, and CLI, see [sandboxing](/codex/concepts/sandboxing).
For a broader enterprise security overview, see the [Codex security white paper](https://trust.openai.com/?itemUid=382f924d-54f3-43a8-a9df-c39e6c959958&source=click).

#### Sandbox and approvals

Codex security controls come from two layers that work together:

- **Sandbox mode**: What Codex can do technically (for example, where it can write and whether it can reach the network) when it executes model-generated commands.
- **Approval policy**: When Codex must ask you before it executes an action (for example, leaving the sandbox, using the network, or running commands outside a trusted set).

Codex uses different sandbox modes depending on where you run it:

- **Codex cloud**: Runs in isolated OpenAI-managed containers, preventing access to your host system or unrelated data. Uses a two-phase runtime model: setup runs before the agent phase and can access the network to install specified dependencies, then the agent phase runs offline by default unless you enable internet access for that environment. Secrets configured for cloud environments are available only during setup and are removed before the agent phase starts.
- **Codex CLI / IDE extension**: OS-level mechanisms enforce sandbox policies. Defaults include no network access and write permissions limited to the active workspace. You can configure the sandbox, approval policy, and network settings based on your risk tolerance.

In the `Auto` preset (for example, `--sandbox workspace-write --ask-for-approval on-request`), Codex can read files, make edits, and run commands in the working directory automatically.

Codex asks for approval to edit files outside the workspace or to run commands that require network access. If you want to chat or plan without making changes, switch to `read-only` mode with the `/permissions` command.

Codex can also elicit approval for app (connector) tool calls that advertise side effects, even when the action isn't a shell command or file change. Destructive app/MCP tool calls always require approval when the tool advertises a destructive annotation, even if it also advertises other hints (for example, read-only hints).

#### Network access

For the Codex app, CLI, or IDE Extension, the default `workspace-write` sandbox mode keeps network access turned off unless you enable it in your configuration:

```toml
[sandbox_workspace_write]
network_access = true
```

#### Network isolation

Network access is controlled through destination rules that apply to scripts,
programs, and subprocesses spawned by commands. When command network access is
already enabled, turn on the `network_proxy` feature to constrain that traffic
to the network policy you configure.

```toml
[features.network_proxy]
enabled = true
domains = { "api.openai.com" = "allow", "example.com" = "deny" }
```

For a one-off CLI session, use the boolean shorthand when you only need the
toggle, and the table form when you also set policy options:

```bash
codex \
  -c 'features.network_proxy=true' \
  -c 'sandbox_workspace_write.network_access=true'

codex \
  -c 'features.network_proxy.enabled=true' \
  -c 'features.network_proxy.domains={ "api.openai.com" = "allow", "example.com" = "deny" }' \
  -c 'sandbox_workspace_write.network_access=true'
```

The feature changes how enabled network access is enforced; it does not grant
network access by itself. Use `sandbox_workspace_write.network_access` with
`workspace-write` config to decide whether commands have network access at all:

- Network off + `network_proxy` on: network stays off, and the feature does nothing.
- Network on + `network_proxy` off: network stays on with unrestricted direct
  outbound access.
- Network on + `network_proxy` on: network stays on, and outbound traffic is
  constrained by the configured network policy.

Admin-managed `experimental_network` requirements are separate from the user
feature toggle. They can configure and start sandboxed networking without
`features.network_proxy`, but they do not turn on network access when the active
sandbox keeps it off. See [Managed configuration](/codex/enterprise/managed-configuration#configure-network-access-requirements)
for the administrator-side `requirements.toml` shape.

#### Network policy

Domain rules are allowlist-first:

- Exact hosts match only themselves.
- `*.example.com` matches subdomains such as `api.example.com`, but not
  `example.com`.
- `**.example.com` matches both the apex and subdomains.
- A global `*` allow rule matches any public host that is not denied. Treat `*`
  as broad network access and prefer scoped rules when you can.
- `deny` always wins over `allow`, and global `*` is only valid for allow rules.

#### Local and private destinations

By default, `allow_local_binding = false` blocks loopback, link-local, and
private destinations:

- Specific exceptions: add an exact local IP literal or `localhost` allow rule
  when a command needs one local target.
- Broader access: set `allow_local_binding = true` only when you intentionally
  want wider local/private reach.
- Wildcards: wildcard rules do not count as explicit local exceptions.
- Resolved addresses: hostnames that resolve to local/private IPs stay blocked
  even if they match the allowlist.

#### DNS rebinding protections

Before allowing a hostname, Codex performs a best-effort DNS and IP
classification check:

- Lookups that fail or time out are blocked.
- Hostnames that resolve to non-public addresses are blocked.
- The check reduces DNS rebinding risk, but it does not eliminate it. Preventing
  rebinding completely would require pinning resolved IPs through the transport
  layer.

If hostile DNS is in scope, enforce egress controls at a lower layer too.

#### Dangerous settings

Two settings deliberately widen the trust boundary:

- `dangerously_allow_non_loopback_proxy = true` can expose proxy listeners beyond
  loopback.
- `dangerously_allow_all_unix_sockets = true` bypasses the Unix socket allowlist.

Use them only in tightly controlled environments. When Unix socket proxying is
enabled, listeners stay loopback-only even if non-loopback binding was requested,
so sandboxed networking does not become a remote bridge into local daemons.

`network_proxy` is off by default. When you enable it:

| Setting                                | Default | Behavior                                                                                                                                                                              |
| -------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`                              | `false` | Starts sandboxed networking only when command network access is already on.                                                                                                           |
| `domains`                              | unset   | Uses allowlist behavior, so no external destinations are allowed until you add `allow` rules. Supports exact hosts, scoped wildcards, and global `*` allow rules; `deny` always wins. |
| `unix_sockets`                         | unset   | No Unix socket destinations are allowed until you add explicit `allow` rules.                                                                                                         |
| `allow_local_binding`                  | `false` | Blocks local and private-network destinations unless you add an exact local IP literal or `localhost` allow rule, or explicitly opt into broader local/private access.                |
| `enable_socks5`                        | `true`  | Exposes SOCKS5 support when policy allows it.                                                                                                                                         |
| `enable_socks5_udp`                    | `true`  | Allows UDP over SOCKS5 when SOCKS5 is available.                                                                                                                                      |
| `allow_upstream_proxy`                 | `true`  | Lets sandboxed networking honor an upstream proxy from the environment.                                                                                                               |
| `dangerously_allow_non_loopback_proxy` | `false` | Keeps listener endpoints on loopback unless you deliberately expose them beyond localhost.                                                                                            |
| `dangerously_allow_all_unix_sockets`   | `false` | Keeps Unix socket access allowlist-based unless you deliberately bypass that protection.                                                                                              |

You can also control the [web search tool](https://platform.openai.com/docs/guides/tools-web-search) without granting full network access to spawned commands. Codex defaults to using a web search cache to access results. The cache is an OpenAI-maintained index of web results, so cached mode returns pre-indexed results instead of fetching live pages. This reduces exposure to prompt injection from arbitrary live content, but you should still treat web results as untrusted. If you are using `--yolo` or another [full access sandbox setting](#common-sandbox-and-approval-combinations), web search defaults to live results. Use `--search` or set `web_search = "live"` to allow live browsing, or set it to `"disabled"` to turn the tool off:

```toml
web_search = "cached"  # default
# web_search = "disabled"
# web_search = "live"  # same as --search
```

Use caution when enabling network access or web search in Codex. Prompt injection can cause the agent to fetch and follow untrusted instructions.

#### Defaults and recommendations

- On launch, Codex detects whether the folder is version-controlled and recommends:
  - Version-controlled folders: `Auto` (workspace write + on-request approvals)
  - Non-version-controlled folders: `read-only`
- Depending on your setup, Codex may also start in `read-only` until you explicitly trust the working directory (for example, via an onboarding prompt or `/permissions`).
- The workspace includes the current directory and temporary directories like `/tmp`. Use the `/status` command to see which directories are in the workspace.
- To accept the defaults, run `codex`.
- You can set these explicitly:
  - `codex --sandbox workspace-write --ask-for-approval on-request`
  - `codex --sandbox read-only --ask-for-approval on-request`

#### Protected paths in writable roots

In the default `workspace-write` sandbox policy, writable roots still include protected paths:

- `/.git` is protected as read-only whether it appears as a directory or file.
- If `/.git` is a pointer file (`gitdir: ...`), the resolved Git directory path is also protected as read-only.
- `/.agents` is protected as read-only when it exists as a directory.
- `/.codex` is protected as read-only when it exists as a directory.
- Protection is recursive, so everything under those paths is read-only.

#### Run without approval prompts

You can disable approval prompts with `--ask-for-approval never` or `-a never` (shorthand).

This option works with all `--sandbox` modes, so you still control Codex's level of autonomy. Codex makes a best effort within the constraints you set.

If you need Codex to read files, make edits, and run commands with network access without approval prompts, use `--sandbox danger-full-access` (or the `--dangerously-bypass-approvals-and-sandbox` flag). Use caution before doing so.

For a middle ground, `approval_policy = { granular = { ... } }` lets you keep specific approval prompt categories interactive while automatically rejecting others. The granular policy covers sandbox approvals, execpolicy-rule prompts, MCP prompts, `request_permissions` prompts, and skill-script approvals.

#### Automatic approval reviews

By default, approval requests route to you:

```toml
approvals_reviewer = "user"
```

Automatic approval reviews apply when approvals are interactive, such as
`approval_policy = "on-request"` or a granular approval policy. Set
`approvals_reviewer = "auto_review"` to route eligible approval requests
through a reviewer agent before Codex runs the request:

```toml
approval_policy = "on-request"
approvals_reviewer = "auto_review"
```

For the full reviewer lifecycle, trigger conditions, configuration precedence,
and failure behavior, see
[Auto-review](/codex/concepts/sandboxing/auto-review).

The reviewer evaluates only actions that already need approval, such as sandbox
escalations, blocked network requests, `request_permissions` prompts, or
side-effecting app and MCP tool calls. Actions that stay inside the sandbox
continue without an extra review step.

The reviewer policy checks for data exfiltration, credential probing, persistent
security weakening, and destructive actions. Low-risk and medium-risk actions
can proceed when policy allows them. The policy denies critical-risk actions.
High-risk actions require enough user authorization and no matching deny rule.
Prompt-build, review-session, and parse failures fail closed. Timeouts are
surfaced separately, but the action still does not run.

The [default reviewer policy](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md)
is in the open-source Codex repository. Enterprises can replace its
tenant-specific section with `guardian_policy_config` in managed requirements.
Local `[auto_review].policy` text is also supported, but managed requirements
take precedence. For setup details, see
[Managed configuration](/codex/enterprise/managed-configuration#configure-automatic-review-policy).

In the Codex app, these reviews appear as automatic review items with a status
such as Reviewing, Approved, Denied, Aborted, or Timed out. They can also
include a risk level and user-authorization assessment for the reviewed
request.

Automatic review uses extra model calls, so it can add to Codex usage. Admins
can constrain it with `allowed_approvals_reviewers`.

### Cyber Safety

Source: [Cyber Safety](/codex/concepts/cyber-safety.md)

[GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/) is the first model we are treating as High cybersecurity capability under our [Preparedness Framework](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf), which requires additional safeguards. These safeguards include training the model to refuse clearly malicious requests like stealing credentials.

In addition to safety training, automated classifier-based monitors detect signals of suspicious cyber activity and route high-risk traffic to a less cyber-capable model (GPT-5.2). We expect a very small portion of traffic to be affected by these mitigations, and are working to refine our policies, classifiers, and in-product notifications.

#### Why we’re doing this

Over recent months, we’ve seen meaningful gains in model performance on cybersecurity tasks, benefiting both developers and security professionals. As our models improve at cybersecurity-related tasks like vulnerability discovery, we’re taking a precautionary approach: expanding protections and enforcement to support legitimate research while slowing misuse.

Cyber capabilities are inherently dual-use. The same knowledge and techniques that underpin important defensive work — penetration testing, vulnerability research, high-scale scanning, malware analysis, and threat intelligence — can also enable real-world harm.

These capabilities and techniques need to be available and easier to use in contexts where they can be used to improve security. Our [Trusted Access for Cyber](https://openai.com/index/trusted-access-for-cyber/) pilot enables individuals and organizations to continue using models for potentially high-risk cybersecurity activity without disruption.

#### How it works

Developers and security professionals doing cybersecurity-related work or similar activity that could be [mistaken](#false-positives) by automated detection systems may have requests rerouted to GPT-5.2 as a fallback. We expect a very small portion of traffic to affected by mitigations, and are actively working to calibrate our policies and classifiers.

The latest alpha version of the Codex CLI includes in-product messaging for
when requests are rerouted. This messaging will be supported in all clients in
the next few days.

Accounts impacted by mitigations can regain access to GPT-5.3-Codex by joining the [Trusted Access](#trusted-access-for-cyber) program below.

We recognize that joining Trusted Access may not be a good fit for everyone, so we plan to move from account-level safety checks to request-level checks in most cases as we scale these mitigations and [strengthen](https://openai.com/index/strengthening-cyber-resilience/) cyber resilience.

#### Trusted Access for Cyber

We are piloting "trusted access" which allows developers to retain advanced capabilities while we continue to calibrate policies and classifiers for general availability. Our goal is for very few users to need to join [Trusted Access for Cyber](https://openai.com/index/trusted-access-for-cyber/).

To use models for potentially high-risk cybersecurity work:

- Users can verify their identity at [chatgpt.com/cyber](https://chatgpt.com/cyber)
- Enterprises can request [trusted access](https://openai.com/form/enterprise-trusted-access-for-cyber/) for their entire team by default through their OpenAI representative

Security researchers and teams who may need access to even more cyber-capable or permissive models to accelerate legitimate defensive work can express interest in our [invite-only program⁠](https://docs.google.com/forms/d/e/1FAIpQLSea_ptovrS3xZeZ9FoZFkKtEJFWGxNrZb1c52GW4BVjB2KVNA/viewform?usp=header). Users with trusted access must still abide by our [Usage Policies⁠](https://openai.com/policies/usage-policies/) and [Terms of Use⁠](https://openai.com/policies/row-terms-of-use/).

#### False positives

Legitimate or non-cybersecurity activity may occasionally be flagged. When rerouting occurs, the responding model will be visible in API request logs and in with an in-product notice in the CLI, soon all surfaces. If you're experiencing rerouting that you believe is incorrect, please report via `/feedback` for false positives.

### Sandbox

Source: [Sandbox](/codex/concepts/sandboxing.md)

The sandbox is the boundary that lets Codex act autonomously without giving it
unrestricted access to your machine. When Codex runs local commands in the
**Codex app**, **IDE extension**, or **CLI**, those commands run inside a
constrained environment instead of running with full access by default.

That environment defines what Codex can do on its own, such as which files it
can modify and whether commands can use the network. When a task stays inside
those boundaries, Codex can keep moving without stopping for confirmation. When
it needs to go beyond them, Codex falls back to the approval flow.

Sandboxing and approvals are different controls that work together. The
sandbox defines technical boundaries. The approval policy decides when Codex
must stop and ask before crossing them.

#### What the sandbox does

The sandbox applies to spawned commands, not just to Codex's built-in file
operations. If Codex runs tools like `git`, package managers, or test runners,
those commands inherit the same sandbox boundaries.

Codex uses platform-native enforcement on each OS. The implementation differs
between macOS, Linux, WSL2, and native Windows, but the idea is the same across
surfaces: give the agent a bounded place to work so routine tasks can run
autonomously inside clear limits.

#### Why it matters

The sandbox reduces approval fatigue. Instead of asking you to confirm every
low-risk command, Codex can read files, make edits, and run routine project
commands within the boundary you already approved.

It also gives you a clearer trust model for agentic work. You aren't just
trusting the agent's intentions; you are trusting that the agent is operating
inside enforced limits. That makes it easier to let Codex work independently
while still knowing when it will stop and ask for help.

#### Getting started

Codex applies sandboxing automatically when you use the default permissions
mode.

#### Prerequisites

On **macOS**, sandboxing works out of the box using the built-in Seatbelt
framework.

On **Windows**, Codex uses the native [Windows
sandbox](/codex/windows#windows-sandbox) when you run in PowerShell and the
Linux sandbox implementation when you run in WSL2.

On **Linux and WSL2**, install `bubblewrap` with your package manager first:

```bash
sudo apt install bubblewrap
```

```bash
sudo dnf install bubblewrap
```

Codex uses the first `bwrap` executable it finds on `PATH`. If no `bwrap`
executable is available, Codex falls back to a bundled helper, but that helper
requires support for unprivileged user namespace creation. Installing the
distribution package that provides `bwrap` keeps this setup reliable.

Codex surfaces a startup warning when `bwrap` is missing or when the helper
can't create the needed user namespace. On distributions that restrict this
AppArmor setting, prefer loading the `bwrap` AppArmor profile so `bwrap` can
keep working without disabling the restriction globally.

**Ubuntu AppArmor note:** On Ubuntu 25.04, installing `bubblewrap` from
Ubuntu's package repository should work without extra AppArmor setup. The
`bwrap-userns-restrict` profile ships in the `apparmor` package at
`/etc/apparmor.d/bwrap-userns-restrict`.

On Ubuntu 24.04, Codex may still warn that it can't create the needed user
namespace after `bubblewrap` is installed. Copy and load the extra profile:

```bash
sudo apt update
sudo apt install apparmor-profiles apparmor-utils
sudo install -m 0644 \
  /usr/share/apparmor/extra-profiles/bwrap-userns-restrict \
  /etc/apparmor.d/bwrap-userns-restrict
sudo apparmor_parser -r /etc/apparmor.d/bwrap-userns-restrict
```

`apparmor_parser -r` loads the profile into the kernel without a reboot. You
can also reload all AppArmor profiles:

```bash
sudo systemctl reload apparmor.service
```

If that profile is unavailable or does not resolve the issue, you can disable
the AppArmor unprivileged user namespace restriction with:

```bash
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

#### How you control it

Most people start with the permissions controls in the product.

In the Codex app and IDE, you choose a mode from the permissions selector under
the composer or chat input. That selector lets you rely on Codex's default
permissions, switch to full access, or use your custom configuration.

In the CLI, use [`/permissions`](/codex/cli/slash-commands#update-permissions-with-permissions)
to switch modes during a session.

#### Configure defaults

If you want Codex to start with the same behavior every time, use a custom
configuration. Codex stores those defaults in `config.toml`, its local settings
file. [Config basics](/codex/config-basic) explains how it works, and the
[Configuration reference](/codex/config-reference) documents the exact keys for
`sandbox_mode`, `approval_policy`, `approvals_reviewer`, and
`sandbox_workspace_write.writable_roots`. Use those settings to decide how much
autonomy Codex gets by default, which directories it can write to, when it
should pause for approval, and who reviews eligible approval requests.

At a high level, the common sandbox modes are:

- `read-only`: Codex can inspect files, but it can't edit files or run
  commands without approval.
- `workspace-write`: Codex can read files, edit within the workspace, and run
  routine local commands inside that boundary. This is the default low-friction
  mode for local work.
- `danger-full-access`: Codex runs without sandbox restrictions. This removes
  the filesystem and network boundaries and should be used only when you want
  Codex to act with full access.

The common approval policies are:

- `untrusted`: Codex asks before running commands that aren't in its trusted
  set.
- `on-request`: Codex works inside the sandbox by default and asks when it
  needs to go beyond that boundary.
- `never`: Codex doesn't stop for approval prompts.

When approvals are interactive, you can also choose who reviews them with
`approvals_reviewer`:

- `user`: approval prompts surface to the user. This is the default.
- `auto_review`: eligible approval prompts go to a reviewer agent (see
  [Auto-review](/codex/concepts/sandboxing/auto-review)).

Full access means using `sandbox_mode = "danger-full-access"` together with
`approval_policy = "never"`. By contrast, the lower-risk local automation
preset is `sandbox_mode = "workspace-write"` together with
`approval_policy = "on-request"`, or the matching CLI flags
`--sandbox workspace-write --ask-for-approval on-request`. You can then keep
`approvals_reviewer = "user"` for manual approvals or set
`approvals_reviewer = "auto_review"` for automatic approval review.

If you need Codex to work across more than one directory, writable roots let
you extend the places it can modify without removing the sandbox entirely. If
you need a broader or narrower trust boundary, adjust the default sandbox mode
and approval policy instead of relying on one-off exceptions.

When a workflow needs a specific exception, use [rules](/codex/rules). Rules
let you allow, prompt, or forbid command prefixes outside the sandbox, which is
often a better fit than broadly expanding access. For a higher-level overview
of approvals and sandbox behavior in the app, see
[Codex app features](/codex/app/features#approvals-and-sandboxing), and for the
IDE-specific settings entry points, see [Codex IDE extension settings](/codex/ide/settings).

Automatic review, when available, does not change the sandbox boundary. It is
one possible `approvals_reviewer` for approval requests at that boundary, such
as sandbox escalations, blocked network access, or side-effecting tool calls
that still need approval. Actions already allowed inside the sandbox run
without extra review. For the reviewer lifecycle, trigger types, denial
semantics, and configuration details, see
[Auto-review](/codex/concepts/sandboxing/auto-review).

Platform details live in the platform-specific docs. For native Windows setup,
behavior, and troubleshooting, see [Windows](/codex/windows). For admin
requirements and organization-level constraints on sandboxing and approvals, see
[Agent approvals & security](/codex/agent-approvals-security).

## Configuration, Authentication, and Models

<a id="configuration-auth-and-models"></a>

Config files, auth flows, model selection, and configuration reference material.

### Configuration Reference

Source: [Configuration Reference](/codex/config-reference.md)

Use this page as a searchable reference for Codex configuration files. For conceptual guidance and examples, start with [Config basics](/codex/config-basic) and [Advanced Config](/codex/config-advanced).

### Advanced Configuration

Source: [Advanced Configuration](/codex/config-advanced.md)

Use these options when you need more control over providers, policies, and integrations. For a quick start, see [Config basics](/codex/config-basic).

For background on project guidance, reusable capabilities, custom slash commands, subagent workflows, and integrations, see [Customization](/codex/concepts/customization). For configuration keys, see [Configuration Reference](/codex/config-reference).

#### Profiles

Profiles let you save named configuration layers and switch between them from
the CLI. When you pass `--profile profile-name`, Codex loads
`~/.codex/config.toml`, then overlays `~/.codex/profile-name.config.toml`.
Profile names can contain letters, numbers, hyphens, and underscores.

Create a separate TOML file for each profile. Use top-level config keys in the
profile file; don't nest them under `[profiles.profile-name]`.

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

Because the profile file is a layer above your base user config and below
project and CLI config, it only needs the values that differ from your base
config. Profile files can also override `model_catalog_json`; Codex uses the
profile value when both files set it.

In Codex 0.134.0 and later, `--profile` no longer reads `[profiles.profile-name]`
from `config.toml`, and the top-level `profile = "profile-name"` selector is no
longer supported. Move legacy profile settings into
`~/.codex/profile-name.config.toml`, then remove the matching
`[profiles.profile-name]` table and `profile = "profile-name"` selector from
`config.toml`.

#### One-off overrides from the CLI

In addition to editing `~/.codex/config.toml`, you can override configuration for a single run from the CLI:

- Prefer dedicated flags when they exist (for example, `--model`).
- Use `-c` / `--config` when you need to override an arbitrary key.

Examples:

```shell
# Dedicated flag
codex --model gpt-5.4

# Generic key/value override (value is TOML, not JSON)
codex --config model='"gpt-5.4"'
codex --config sandbox_workspace_write.network_access=true
codex --config 'shell_environment_policy.include_only=["PATH","HOME"]'
```

Notes:

- Keys can use dot notation to set nested values (for example, `mcp_servers.context7.enabled=false`).
- `--config` values are parsed as TOML. When in doubt, quote the value so your shell doesn't split it on spaces.
- If the value can't be parsed as TOML, Codex treats it as a string.

#### Config and state locations

Codex stores its local state under `CODEX_HOME` (defaults to `~/.codex`).

Common files you may see there:

- `config.toml` (your local configuration)
- `auth.json` (if you use file-based credential storage) or your OS keychain/keyring
- `history.jsonl` (if history persistence is enabled)
- Other per-user state such as logs and caches

For authentication details (including credential storage modes), see [Authentication](/codex/auth). For the full list of configuration keys, see [Configuration Reference](/codex/config-reference).

For shared defaults, rules, and skills checked into repos or system paths, see [Team Config](/codex/enterprise/admin-setup#team-config).

If you just need to point the built-in OpenAI provider at an LLM proxy, router, or data-residency enabled project, set `openai_base_url` in `config.toml` instead of defining a new provider. This changes the base URL for the built-in `openai` provider without requiring a separate `model_providers.` entry.

```toml
openai_base_url = "https://us.api.openai.com/v1"
```

#### Project config files (`.codex/config.toml`)

In addition to your user config, Codex reads project-scoped overrides from `.codex/config.toml` files inside your repo. Codex walks from the project root to your current working directory and loads every `.codex/config.toml` it finds. If multiple files define the same key, the closest file to your working directory wins.

For security, Codex loads project-scoped config files only when the project is trusted. If the project is untrusted, Codex ignores project `.codex/` layers, including `.codex/config.toml`, project-local hooks, and project-local rules. User and system layers remain separate and still load.

Relative paths inside a project config (for example, `model_instructions_file`) are resolved relative to the `.codex/` folder that contains the `config.toml`.

Project config files can't override settings that redirect credentials, alter
host-owned app request metadata, change provider auth, select config profiles,
or run machine-local notification/telemetry commands. Codex ignores the
following keys in project-local `.codex/config.toml` and prints a startup
warning when it sees them: `openai_base_url`, `chatgpt_base_url`,
`apps_mcp_product_sku`, `model_provider`, `model_providers`, `notify`,
`profile`, `profiles`, `experimental_realtime_ws_base_url`, and `otel`. Set
provider, notification, and telemetry keys in your user-level
`~/.codex/config.toml`; select config profiles with `--profile profile-name`
and `~/.codex/profile-name.config.toml`.

#### Hooks

Codex can also load lifecycle hooks from either `hooks.json` files or inline
`[hooks]` tables in `config.toml` files that sit next to active config layers.

In practice, the four most useful locations are:

- `~/.codex/hooks.json`
- `~/.codex/config.toml`
- `/.codex/hooks.json`
- `/.codex/config.toml`

Project-local hooks load only when the project `.codex/` layer is trusted.
User-level hooks remain independent of project trust.

Inline TOML hooks use the same event structure as `hooks.json`:

```toml
[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py"'
timeout = 30
statusMessage = "Checking Bash command"
```

If a single layer contains both `hooks.json` and inline `[hooks]`, Codex loads
both and warns. Prefer one representation per layer.

For the current event list, input fields, output behavior, and limitations, see
[Hooks](/codex/hooks).

#### Agent roles (`[agents]` in `config.toml`)

For subagent role configuration (`[agents]` in `config.toml`), see [Subagents](/codex/subagents).

#### Project root detection

Codex discovers project configuration (for example, `.codex/` layers and `AGENTS.md`) by walking up from the working directory until it reaches a project root.

By default, Codex treats a directory containing `.git` as the project root. To customize this behavior, set `project_root_markers` in `config.toml`:

```toml
# Treat a directory as the project root when it contains any of these markers.
project_root_markers = [".git", ".hg", ".sl"]
```

Set `project_root_markers = []` to skip searching parent directories and treat the current working directory as the project root.

#### Custom model providers

A model provider defines how Codex connects to a model (base URL, wire API, authentication, and optional HTTP headers). Custom providers can't reuse the reserved built-in provider IDs: `openai`, `ollama`, and `lmstudio`.

Define additional providers and point `model_provider` at them:

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

Add request headers when needed:

```toml
[model_providers.example]
http_headers = { "X-Example-Header" = "example-value" }
env_http_headers = { "X-Example-Features" = "EXAMPLE_FEATURES" }
```

Use command-backed authentication when a provider needs Codex to fetch bearer tokens from an external credential helper:

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

The auth command receives no `stdin` and must print the token to stdout. Codex trims surrounding whitespace, treats an empty token as an error, and refreshes proactively at `refresh_interval_ms`; set `refresh_interval_ms = 0` to refresh only after an authentication retry. Don't combine `[model_providers..auth]` with `env_key`, `experimental_bearer_token`, or `requires_openai_auth`.

#### Amazon Bedrock provider

Codex includes a built-in `amazon-bedrock` model provider. Set it directly as
`model_provider`; unlike custom providers, this built-in provider supports only
the nested AWS profile and region overrides.

```toml
model_provider = "amazon-bedrock"
model = ""

[model_providers.amazon-bedrock.aws]
profile = "default"
region = "eu-central-1"
```

If you omit `profile`, Codex uses the standard AWS credential chain. Set
`region` to the supported Bedrock region that should handle requests.

For the full setup flow, authentication options, supported models, and feature
availability, see [Use Codex with Amazon Bedrock](/codex/amazon-bedrock).

#### OSS mode (local providers)

Codex can run against a local "open source" provider (for example, Ollama or LM Studio) when you pass `--oss`. If you pass `--oss` without specifying a provider, Codex uses `oss_provider` as the default.

```toml
# Default local provider used with `--oss`
oss_provider = "ollama" # or "lmstudio"
```

#### Azure provider and per-provider tuning

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

To change the base URL for the built-in OpenAI provider, use `openai_base_url`; don't create `[model_providers.openai]`, because you can't override built-in provider IDs.

#### ChatGPT customers using data residency

Projects created with [data residency](https://help.openai.com/en/articles/9903489-data-residency-and-inference-residency-for-chatgpt) enabled can create a model provider to update the base_url with the [correct prefix](https://platform.openai.com/docs/guides/your-data#which-models-and-features-are-eligible-for-data-residency).

```toml
model_provider = "openaidr"
[model_providers.openaidr]
name = "OpenAI Data Residency"
base_url = "https://us.api.openai.com/v1" # Replace 'us' with domain prefix
```

#### Model reasoning, verbosity, and limits

```toml
model_reasoning_summary = "none"          # Disable summaries
model_verbosity = "low"                   # Shorten responses
model_supports_reasoning_summaries = true # Force reasoning
model_context_window = 128000             # Context window size
```

`model_verbosity` applies only to providers using the Responses API. Chat Completions providers will ignore the setting.

#### Approval policies and sandbox modes

Pick approval strictness (affects when Codex pauses) and sandbox level (affects file/network access).

For operational details to keep in mind while editing `config.toml`, see [Common sandbox and approval combinations](/codex/agent-approvals-security#common-sandbox-and-approval-combinations), [Protected paths in writable roots](/codex/agent-approvals-security#protected-paths-in-writable-roots), and [Network access](/codex/agent-approvals-security#network-access).

For beta permission profiles that configure filesystem and network access together, see [Permissions](/codex/permissions).

You can also use a granular approval policy (`approval_policy = { granular = { ... } }`) to allow or auto-reject individual prompt categories. This is useful when you want normal interactive approvals for some cases but want others, such as `request_permissions` or skill-script prompts, to fail closed automatically.

Set `approvals_reviewer = "auto_review"` to route eligible interactive approval
requests through automatic review. This changes the reviewer, not the sandbox
boundary.

Use `[auto_review].policy` for local reviewer policy instructions. Managed
`guardian_policy_config` takes precedence.

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

For built-in profiles, custom profile syntax, and the full filesystem and
network configuration model, see [Permissions](/codex/permissions).

For the complete key list and requirements constraints, see
[Configuration Reference](/codex/config-reference) and
[Managed configuration](/codex/enterprise/managed-configuration).

In workspace-write mode, some environments keep `.git/` and `.codex/`
read-only even when the rest of the workspace is writable. This is why
commands like `git commit` may still require approval to run outside the
sandbox. If you want Codex to skip specific commands (for example, block `git
  commit` outside the sandbox), use
rules.

Disable sandboxing entirely (use only if your environment already isolates processes):

```toml
sandbox_mode = "danger-full-access"
```

#### Shell environment policy

`shell_environment_policy` controls which environment variables Codex passes to any subprocess it launches (for example, when running a tool-command the model proposes). Start from a clean start (`inherit = "none"`) or a trimmed set (`inherit = "core"`), then layer on excludes, includes, and overrides to avoid leaking secrets while still providing the paths, keys, or flags your tasks need.

```toml
[shell_environment_policy]
inherit = "none"
set = { PATH = "/usr/bin", MY_FLAG = "1" }
ignore_default_excludes = false
exclude = ["AWS_*", "AZURE_*"]
include_only = ["PATH", "HOME"]
```

Patterns are case-insensitive globs (`*`, `?`, `[A-Z]`); `ignore_default_excludes = false` keeps the automatic KEY/SECRET/TOKEN filter before your includes/excludes run.

#### MCP servers

See the dedicated [MCP documentation](/codex/mcp) for configuration details.

#### Observability and telemetry

Enable OpenTelemetry (OTel) log export to track Codex runs (API requests, SSE/events, prompts, tool approvals/results). Disabled by default; opt in via `[otel]`:

```toml
[otel]
environment = "staging"   # defaults to "dev"
exporter = "none"         # set to otlp-http or otlp-grpc to send events
log_user_prompt = false   # redact user prompts unless explicitly enabled
```

Choose an exporter:

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

If `exporter = "none"` Codex records events but sends nothing. Exporters batch asynchronously and flush on shutdown. Event metadata includes service name, CLI version, env tag, conversation id, model, sandbox/approval settings, and per-event fields (see [Config Reference](/codex/config-reference)).

#### What gets emitted

Codex emits structured log events for runs and tool usage. Representative event types include:

- `codex.conversation_starts` (model, reasoning settings, sandbox/approval policy)
- `codex.api_request` (attempt, status/success, duration, and error details)
- `codex.sse_event` (stream event kind, success/failure, duration, plus token counts on `response.completed`)
- `codex.websocket_request` and `codex.websocket_event` (request duration plus per-message kind/success/error)
- `codex.user_prompt` (length; content redacted unless explicitly enabled)
- `codex.tool_decision` (approved/denied and whether the decision came from config vs user)
- `codex.tool_result` (duration, success, output snippet)

### Authentication and sessions

Source: [Authentication](/codex/auth.md)

#### OpenAI authentication

Codex supports two ways to sign in when using OpenAI models:

- Sign in with ChatGPT for subscription access
- Sign in with an API key for usage-based access

Codex cloud requires signing in with ChatGPT. The Codex CLI and IDE extension support both sign-in methods.

Your sign-in method also determines which admin controls and data-handling policies apply.

- With sign in with ChatGPT, Codex usage follows your ChatGPT workspace permissions, RBAC, and ChatGPT Enterprise retention and residency settings
- With an API key, usage follows your API organization's retention and data-sharing settings instead

For the CLI, Sign in with ChatGPT is the default authentication path when no valid session is available.

#### Sign in with ChatGPT

When you sign in with ChatGPT from the Codex app, CLI, or IDE Extension, Codex opens a browser window for you to complete the login flow. After you sign in, the browser returns an access token to the CLI or IDE extension.

If your environment already provides a ChatGPT access token, the CLI can read
it from stdin:

```shell
printenv CODEX_ACCESS_TOKEN | codex login --with-access-token
```

#### Sign in with an API key

You can also sign in to the Codex app, CLI, or IDE Extension with an API key. Get your API key from the [OpenAI dashboard](https://platform.openai.com/api-keys).

OpenAI bills API key usage through your OpenAI Platform account at standard API rates. See the [API pricing page](https://openai.com/api/pricing/).

API key authentication supports local Codex workflows, but some features that
rely on ChatGPT workspace access or cloud services are limited or unavailable.
Compare support by plan in
[Feature availability](/codex/pricing#feature-availability).

When you sign in with an API key, Codex uses standard API pricing instead of
included ChatGPT plan credits.

We recommend API key authentication for programmatic Codex CLI workflows, such
as CI/CD jobs. Don't expose Codex execution in untrusted or public environments.

#### Use Codex access tokens for enterprise automation

In ChatGPT Enterprise workspaces, admins can grant the access token
permission so permitted members can create Codex access tokens for trusted,
non-interactive Codex local workflows. Use an access token when automation
needs ChatGPT workspace access, ChatGPT-managed Codex entitlements, or
enterprise workspace controls without a browser sign-in.

Access tokens are intended for trusted scripts, schedulers, and private CI
runners. For general OpenAI API calls, continue to use Platform API keys.

For setup steps, permissions, rotation, and revocation guidance, see
[Access tokens](/codex/enterprise/access-tokens).

#### Secure your Codex cloud account

Codex cloud interacts directly with your codebase, so it needs stronger security than many other ChatGPT features. Enable multi-factor authentication (MFA).

If you use a social login provider (Google, Microsoft, Apple), you aren't required to enable MFA on your ChatGPT account, but you can set it up with your social login provider.

For setup instructions, see:

- [Google](https://support.google.com/accounts/answer/185839)
- [Microsoft](https://support.microsoft.com/en-us/topic/what-is-multifactor-authentication-e5e39437-121c-be60-d123-eda06bddf661)
- [Apple](https://support.apple.com/en-us/102660)

If you access ChatGPT through single sign-on (SSO), your organization's SSO administrator should enforce MFA for all users.

If you log in using an email and password, you must set up MFA on your account before accessing Codex cloud.

If your account supports more than one login method and one of them is email and password, you must set up MFA before accessing Codex, even if you sign in another way.

#### Login caching

When you sign in to the Codex app, CLI, or IDE Extension using either ChatGPT or an API key, Codex caches your login details and reuses them the next time you start the CLI or extension. The CLI and extension share the same cached login details. If you log out from either one, you'll need to sign in again the next time you start the CLI or extension.

Codex caches login details locally in a plaintext file at `~/.codex/auth.json` or in your OS-specific credential store.

For sign in with ChatGPT sessions, Codex refreshes tokens automatically during use before they expire, so active sessions usually continue without requiring another browser login.

#### Credential storage

Use `cli_auth_credentials_store` to control where the Codex CLI stores cached credentials:

```toml
# file | keyring | auto
cli_auth_credentials_store = "keyring"
```

- `file` stores credentials in `auth.json` under `CODEX_HOME` (defaults to `~/.codex`).
- `keyring` stores credentials in your operating system credential store.
- `auto` uses the OS credential store when available, otherwise falls back to `auth.json`.

If you use file-based storage, treat `~/.codex/auth.json` like a password: it
contains access tokens. Don't commit it, paste it into tickets, or share it in
chat.

#### Enforce a login method or workspace

In managed environments, admins may restrict how users are allowed to authenticate:

```toml
# Only allow ChatGPT login or only allow API key login.
forced_login_method = "chatgpt" # or "api"

# When using ChatGPT login, restrict users to a specific workspace.
forced_chatgpt_workspace_id = "00000000-0000-0000-0000-000000000000"
```

If the active credentials don't match the configured restrictions, Codex logs the user out and exits.

These settings are commonly applied via managed configuration rather than per-user setup. See [Managed configuration](/codex/enterprise/managed-configuration).

#### Login diagnostics

Direct `codex login` runs write a dedicated `codex-login.log` file under
your configured log directory. Use it when you need to debug browser-login or
device-code failures, or when support asks for login-specific logs.

#### Custom CA bundles

If your network uses a corporate TLS proxy or private root CA, set
`CODEX_CA_CERTIFICATE` to a PEM bundle before logging in. When
`CODEX_CA_CERTIFICATE` is unset, Codex falls back to `SSL_CERT_FILE`. The same
custom CA settings apply to login, normal HTTPS requests, and secure WebSocket
connections.

```shell
export CODEX_CA_CERTIFICATE=/path/to/corporate-root-ca.pem
codex login
```

#### Login on headless devices

If you are signing in to ChatGPT with the Codex CLI, there are some situations where the browser-based login UI may not work:

- You're running the CLI in a remote or headless environment.
- Your local networking configuration blocks the localhost callback Codex uses to return the OAuth token to the CLI after you sign in.

In these situations, prefer device code authentication (beta). In the interactive login UI, choose **Sign in with Device Code**, or run `codex login --device-auth` directly. If device code authentication doesn't work in your environment, use one of the fallback methods.

#### Preferred: Device code authentication (beta)

1. Enable device code login in your ChatGPT security settings (personal account) or ChatGPT workspace permissions (workspace admin).
2. In the terminal where you're running Codex, choose one of these options:
   - In the interactive login UI, select **Sign in with Device Code**.
   - Run `codex login --device-auth`.
3. Open the link in your browser, sign in, then enter the one-time code.

If device code login isn't enabled by the server, Codex falls back to the standard browser-based login flow.

#### Fallback: Authenticate locally and copy your auth cache

If you can complete the login flow on a machine with a browser, you can copy your cached credentials to the headless machine.

1. On a machine where you can use the browser-based login flow, run `codex login`.
2. Confirm the login cache exists at `~/.codex/auth.json`.
3. Copy `~/.codex/auth.json` to `~/.codex/auth.json` on the headless machine.

Treat `~/.codex/auth.json` like a password: it contains access tokens. Don't commit it, paste it into tickets, or share it in chat.

If your OS stores credentials in a credential store instead of `~/.codex/auth.json`, this method may not apply. See
[Credential storage](#credential-storage) for how to configure file-based storage.

Copy to a remote machine over SSH:

```shell
ssh user@remote 'mkdir -p ~/.codex'
scp ~/.codex/auth.json user@remote:~/.codex/auth.json
```

Or use a one-liner that avoids `scp`:

```shell
ssh user@remote 'mkdir -p ~/.codex && cat > ~/.codex/auth.json' < ~/.codex/auth.json
```

Copy into a Docker container:

```shell
# Replace MY_CONTAINER with the name or ID of your container.
CONTAINER_HOME=$(docker exec MY_CONTAINER printenv HOME)
docker exec MY_CONTAINER mkdir -p "$CONTAINER_HOME/.codex"
docker cp ~/.codex/auth.json MY_CONTAINER:"$CONTAINER_HOME/.codex/auth.json"
```

For a more advanced version of this same pattern on trusted CI/CD runners, see
[Maintain Codex account auth in CI/CD (advanced)](/codex/auth/ci-cd-auth).
That guide explains how to let Codex refresh `auth.json` during normal runs and
then keep the updated file for the next job. API keys are still the recommended
default for automation.

#### Fallback: Forward the localhost callback over SSH

If you can forward ports between your local machine and the remote host, you can use the standard browser-based flow by tunneling Codex's local callback server (default `localhost:1455`).

1. From your local machine, start port forwarding:

```shell
ssh -L 1455:localhost:1455 user@remote
```

2. In that SSH session, run `codex login` and follow the printed address on your local machine.

#### Alternative model providers

When you define a [custom model provider](/codex/config-advanced#custom-model-providers) in your configuration file, you can choose one of these authentication methods:

- **OpenAI authentication**: Set `requires_openai_auth = true` to use OpenAI authentication. You can then sign in with ChatGPT or an API key. This is useful when you access OpenAI models through an LLM proxy server. When `requires_openai_auth = true`, Codex ignores `env_key`.
- **Environment variable authentication**: Set `env_key = "<ENV_VARIABLE_NAME>"` to use a provider-specific API key from the local environment variable named `<ENV_VARIABLE_NAME>`.
- **No authentication**: If you don't set `requires_openai_auth` (or set it to `false`) and you don't set `env_key`, Codex assumes the provider doesn't require authentication. This is useful for local models.
