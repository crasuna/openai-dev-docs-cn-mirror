---
title: "工作流"
description: "Development usage patterns with Codex"
outline: deep
---

# 工作流

**文档集**：Codex  
**分组**：Codex — Workflows  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/workflows](https://developers.openai.com/codex/workflows)
- Markdown 来源：[https://developers.openai.com/codex/workflows.md](https://developers.openai.com/codex/workflows.md)
- 抓取时间：2026-06-27T05:55:10.210Z
- Checksum：`9bd9fe21e038fc24d69d79cbd22dd33fecf07d99cc9dd180470d98313e51b4c6`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
当你把 Codex 当作一个有明确上下文和清晰“完成”定义的队友时，它效果最好。
本页提供 Codex IDE extension、Codex CLI 和 Codex cloud 的端到端工作流示例。

如果你刚开始使用 Codex，请先阅读 [Prompting](/mirror/codex/prompting)，再回到这里查看具体 recipes。

## 如何阅读这些示例

每个工作流都包括：

- **什么时候使用它**，以及最适合的 Codex 界面（IDE、CLI 或 cloud）。
- **步骤**，包含示例 user prompts。
- **Context notes**：Codex 会自动看到什么，以及你应该附加什么。
- **Verification**：如何检查输出。

&gt; **Note:** IDE extension 会自动把你打开的文件包含为上下文。在 CLI 中，你通常需要明确提及 paths（或使用 `/mention` 和 `@` path autocomplete 附加文件）。

---

## 解释 codebase

当你在 onboarding、接手一个 service，或尝试理解 protocol、data model 或 request flow 时使用它。

### IDE extension workflow（最快的本地探索方式）



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



Verification：

- 要求提供一个你可以快速验证的 diagram 或 checklist：

```text
Summarize the request flow as a numbered list of steps. Then list the files involved.
```

### CLI workflow（适合需要 transcript + shell commands 时）



1. 启动 interactive session：

```bash
   codex
```

2. 附加文件（可选）并提示：

```text
   I need to understand the protocol used by this service. Read @foo.ts @schema.ts and explain the schema and request/response flow. Focus on required vs optional fields and backward compatibility rules.
```



Context notes：

- 你可以在 composer 中使用 `@` 插入 workspace 中的 file paths，或使用 `/mention` 附加特定文件。

---

## 修复 bug

当你有可在本地复现的失败行为时使用它。

### CLI workflow（带复现和验证的紧密循环）



1. 在 repo root 启动 Codex：

```bash
   codex
```

2. 给 Codex 一个复现步骤，并附上你怀疑的文件：

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



Context notes：

- 由你提供：复现步骤和约束（它们比高层描述更重要）。
- 由 Codex 提供：command output、发现的 call sites，以及它触发的任何 stack traces。

Verification：

- Codex 应在修复后重新运行复现步骤。
- 如果你有标准 check pipeline，要求它运行：

```text
After the fix, run lint + the smallest relevant test suite. Report the commands and results.
```

### IDE extension workflow



1. 打开你认为 bug 所在的文件，以及它最近的 caller。
2. 提示 Codex：

```text
   Find the bug causing "Saved" to show without persisting changes. After proposing the fix, tell me how to verify it in the UI.
```



---

## 编写 test

当你想非常明确地指定测试范围时使用它。

### IDE extension workflow（基于 selection）



1. 打开包含该 function 的文件。
2. 选择定义该 function 的 lines。从 command palette 选择 “Add to Codex Thread”，将这些 lines 添加到上下文。
3. 提示 Codex：

```text
   Write a unit test for this function. Follow conventions used in other tests.
```



Context notes：

- 由 “Add to Codex Thread” command 提供：选中的 lines（这是 “line number” scope），以及打开的文件。

### CLI workflow（在 prompt 中描述 path + line range）



1. 启动 Codex：

```bash
   codex
```

2. 用 function name 提示：

```text
   Add a test for the invert_list function in @transform.ts. Cover the happy path plus edge cases.
```



---

## 从 screenshot 原型化

当你有 design mock、screenshot 或 UI reference，并希望快速得到可工作的 prototype 时使用它。

### CLI workflow（image + prompt）



1. 将 screenshot 保存在本地（例如 `./specs/ui.png`）。
2. 运行 Codex：

```bash
   codex
```

3. 将 image file 拖入 terminal，将其附加到 prompt。

4. 用约束和结构继续：

```text
   Create a new dashboard based on this image.

   Constraints:
   - Use react, vite, and tailwind. Write the code in typescript.
   - Match spacing, typography, and layout as closely as possible.

   Deliverables:
   - A new route/page that renders the UI
   - Any small components needed
   - README.md with instructions to run it locally
```



Context notes：

- image 提供视觉要求，但你仍需要指定 implementation constraints（framework、routing、component style）。
- 为获得最佳结果，请用文字包含任何不明显的行为（hover states、validation rules、keyboard interactions）。

Verification：

- 要求 Codex 运行 dev server（如果允许），并告诉你确切查看位置：

```text
Start the dev server and tell me the local URL/route to view the prototype.
```

### IDE extension workflow（image + existing files）



1. 在 Codex chat 中附加 image（拖放或粘贴）。
2. 提示 Codex：

```text
   Create a new settings page. Use the attached screenshot as the target UI.
   Follow design and visual patterns from other files in this project.
```



---

## 使用 live updates 迭代 UI

当你希望在 Codex 编辑代码时进行紧密的“design -&gt; tweak -&gt; refresh -&gt; tweak”循环，可以使用它。

### CLI workflow（运行 Vite，然后用小 prompt 迭代）



1. 启动 Codex：

```bash
   codex
```

2. 在单独的 terminal window 中启动 dev server：

```bash
   npm run dev
```

3. 提示 Codex 做出更改：

```text
   Propose 2-3 styling improvements for the landing page.
```

4. 选择一个方向，并用小而具体的 prompts 迭代：

```text
   Go with option 2.

   Change only the header:
   - make the typography more editorial
   - increase whitespace
   - ensure it still looks good on mobile
```

5. 用聚焦请求重复：

```text
   Next iteration: reduce visual noise.
   Keep the layout, but simplify colors and remove any redundant borders.
```



Verification：

- 在浏览器中“live”审查代码更新后的变更。
- 提交你喜欢的变更，revert 你不喜欢的变更。
- 如果你 revert 或修改了某个变更，请告诉 Codex，这样它处理下一个 prompt 时不会覆盖该变更。

---

## 将 refactor 委派给 cloud

当你想先仔细设计（本地上下文、快速检查），再把较长实现外包给可以并行运行的 cloud task 时使用它。

### 本地规划（IDE）



1. 确保当前工作已经 committed，或者至少 stashed，这样你可以干净地比较变更。
2. 要求 Codex 生成 refactor plan。如果你有可用的 `$plan` skill，请显式调用它：

```text
   $plan

   We need to refactor the auth subsystem to:
   - split responsibilities (token parsing vs session loading vs permissions)
   - reduce circular imports
   - improve testability

   Constraints:
   - No user-visible behavior changes
   - Keep public APIs stable
   - Include a step-by-step migration plan
```

3. 审查 plan 并协商修改：

```text
   Revise the plan to:
   - specify exactly which files move in each milestone
   - include a rollback strategy
```



Context notes：

- 当 Codex 可以本地扫描当前代码（entrypoints、module boundaries、dependency graph hints）时，规划效果最好。

### Cloud delegation（IDE -&gt; Cloud）



1. 如果还没有设置，请先设置 [Codex cloud environment](/mirror/codex/cloud/environments)。
2. 点击 prompt composer 下方的 cloud icon，并选择你的 cloud environment。
3. 当你输入下一个 prompt 时，Codex 会在 cloud 中创建一个新 thread，携带已有 thread context（包括 plan 和任何本地 source changes）。

```text
   Implement Milestone 1 from the plan.
```

4. 审查 cloud diff，并在需要时迭代。

5. 直接从 cloud 创建 PR，或将变更拉到本地测试并收尾。

6. 继续迭代 plan 的其他 milestones。



---

## 做本地 code review

当你想在 commit 或创建 PR 前获得第二双眼睛时使用它。

### CLI workflow（审查你的 working tree）



1. 启动 Codex：

```bash
   codex
```

2. 运行 review command：

```text
   /review
```

3. 可选：提供自定义 focus instructions：

```text
   /review Focus on edge cases and security issues
```



Verification：

- 根据 review feedback 应用修复，然后重新运行 `/review`，确认问题已解决。

---

## 审查 GitHub pull request

当你希望在不把 branch 拉到本地的情况下获得 review feedback 时使用它。

使用前，请在你的 repository 上启用 Codex **Code review**。参见 [Code review](/mirror/codex/integrations/github)。

### GitHub workflow（comment-driven）



1. 在 GitHub 上打开 pull request。
2. 留下一条 comment，标记 Codex 并带上明确 focus areas：

```text
   @codex review
```

3. 可选：提供更明确的 instructions。

```text
   @codex review for security vulnerabilities and security concerns
```



---

## 更新文档

当你需要准确、清晰的 doc change 时使用它。

### IDE 或 CLI workflow（本地编辑 + 本地验证）



1. 识别要更改的 doc file(s)，并打开它们（IDE），或 `@` mention 它们（IDE 或 CLI）。
2. 用 scope 和 validation requirements 提示 Codex：

```text
   Update the "advanced features" documentation to provide authentication troubleshooting guidance. Verify that all links are valid.
```

3. Codex 起草变更后，审查 documentation 并按需迭代。



Verification：

- 阅读渲染后的页面。

:::

## English source

::: details 展开英文原文
::: v-pre
Codex works best when you treat it like a teammate with explicit context and a clear definition of "done."
This page gives end-to-end workflow examples for the Codex IDE extension, the Codex CLI, and Codex cloud.

If you are new to Codex, read [Prompting](/mirror/codex/prompting) first, then come back here for concrete recipes.

## How to read these examples

Each workflow includes:

- **When to use it** and which Codex surface fits best (IDE, CLI, or cloud).
- **Steps** with example user prompts.
- **Context notes**: what Codex automatically sees vs what you should attach.
- **Verification**: how to check the output.

&gt; **Note:** The IDE extension automatically includes your open files as context. In the CLI, you usually need to mention paths explicitly (or attach files with `/mention` and `@` path autocomplete).

---

## Explain a codebase

Use this when you are onboarding, inheriting a service, or trying to reason about a protocol, data model, or request flow.

### IDE extension workflow (fastest for local exploration)



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

### CLI workflow (good when you want a transcript + shell commands)



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

## Fix a bug

Use this when you have a failing behavior you can reproduce locally.

### CLI workflow (tight loop with reproduction and verification)



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

### IDE extension workflow



1. Open the file where you think the bug lives, plus its nearest caller.
2. Prompt Codex:

```text
   Find the bug causing "Saved" to show without persisting changes. After proposing the fix, tell me how to verify it in the UI.
```



---

## Write a test

Use this when you want to be very explicit about the scope you want tested.

### IDE extension workflow (selection-based)



1. Open the file with the function.
2. Select the lines that define the function. Choose "Add to Codex Thread" from command palette to add these lines to the context.
3. Prompt Codex:

```text
   Write a unit test for this function. Follow conventions used in other tests.
```



Context notes:

- Supplied by "Add to Codex Thread" command: the selected lines (this is the "line number" scope), plus open files.

### CLI workflow (path + line range described in prompt)



1. Start Codex:

```bash
   codex
```

2. Prompt with a function name:

```text
   Add a test for the invert_list function in @transform.ts. Cover the happy path plus edge cases.
```



---

## Prototype from a screenshot

Use this when you have a design mock, screenshot, or UI reference and you want a working prototype quickly.

### CLI workflow (image + prompt)



1. Save your screenshot locally (for example `./specs/ui.png`).
2. Run Codex:

```bash
   codex
```

3. Drag the image file into the terminal to attach it to the prompt.

4. Follow up with constraints and structure:

```text
   Create a new dashboard based on this image.

   Constraints:
   - Use react, vite, and tailwind. Write the code in typescript.
   - Match spacing, typography, and layout as closely as possible.

   Deliverables:
   - A new route/page that renders the UI
   - Any small components needed
   - README.md with instructions to run it locally
```



Context notes:

- The image provides visual requirements, but you still need to specify the implementation constraints (framework, routing, component style).
- For best results, include any non-obvious behavior in text (hover states, validation rules, keyboard interactions).

Verification:

- Ask Codex to run the dev server (if allowed) and tell you exactly where to look:

```text
Start the dev server and tell me the local URL/route to view the prototype.
```

### IDE extension workflow (image + existing files)



1. Attach the image in the Codex chat (drag-and-drop or paste).
2. Prompt Codex:

```text
   Create a new settings page. Use the attached screenshot as the target UI.
   Follow design and visual patterns from other files in this project.
```



---

## Iterate on UI with live updates

Use this when you want a tight "design → tweak → refresh → tweak" loop while Codex edits code.

### CLI workflow (run Vite, then iterate with small prompts)



1. Start Codex:

```bash
   codex
```

2. Start the dev server in a separate terminal window:

```bash
   npm run dev
```

3. Prompt Codex to make changes:

```text
   Propose 2-3 styling improvements for the landing page.
```

4. Pick a direction and iterate with small, specific prompts:

```text
   Go with option 2.

   Change only the header:
   - make the typography more editorial
   - increase whitespace
   - ensure it still looks good on mobile
```

5. Repeat with focused requests:

```text
   Next iteration: reduce visual noise.
   Keep the layout, but simplify colors and remove any redundant borders.
```



Verification:

- Review changes in the browser "live" as the code is updated.
- Commit changes that you like and revert those that you don't.
- If you revert or modify a change, tell Codex so it doesn't overwrite the change when it works on the next prompt.

---

## Delegate refactor to the cloud

Use this when you want to design carefully (local context, quick inspection), then outsource the long implementation to a cloud task that can run in parallel.

### Local planning (IDE)



1. Make sure your current work is committed or at least stashed so you can compare changes cleanly.
2. Ask Codex to produce a refactor plan. If you have the `$plan` skill available, invoke it explicitly:

```text
   $plan

   We need to refactor the auth subsystem to:
   - split responsibilities (token parsing vs session loading vs permissions)
   - reduce circular imports
   - improve testability

   Constraints:
   - No user-visible behavior changes
   - Keep public APIs stable
   - Include a step-by-step migration plan
```

3. Review the plan and negotiate changes:

```text
   Revise the plan to:
   - specify exactly which files move in each milestone
   - include a rollback strategy
```



Context notes:

- Planning works best when Codex can scan the current code locally (entrypoints, module boundaries, dependency graph hints).

### Cloud delegation (IDE → Cloud)



1. If you haven't already done so, set up a [Codex cloud environment](/mirror/codex/cloud/environments).
2. Click on the cloud icon beneath the prompt composer and select your cloud environment.
3. When you enter the next prompt, Codex creates a new thread in the cloud that carries over the existing thread context (including the plan and any local source changes).

```text
   Implement Milestone 1 from the plan.
```

4. Review the cloud diff, iterate if needed.

5. Create a PR directly from the cloud or pull changes locally to test and finish up.

6. Iterate on additional milestones of the plan.



---

## Do a local code review

Use this when you want a second set of eyes before committing or creating a PR.

### CLI workflow (review your working tree)



1. Start Codex:

```bash
   codex
```

2. Run the review command:

```text
   /review
```

3. Optional: provide custom focus instructions:

```text
   /review Focus on edge cases and security issues
```



Verification:

- Apply fixes based on review feedback, then rerun `/review` to confirm issues are resolved.

---

## Review a GitHub pull request

Use this when you want review feedback without pulling the branch locally.

Before you can use this, enable Codex **Code review** on your repository. See [Code review](/mirror/codex/integrations/github).

### GitHub workflow (comment-driven)



1. Open the pull request on GitHub.
2. Leave a comment that tags Codex with explicit focus areas:

```text
   @codex review
```

3. Optional: Provide more explicit instructions.

```text
   @codex review for security vulnerabilities and security concerns
```



---

## Update documentation

Use this when you need a doc change that is accurate and clear.

### IDE or CLI workflow (local edits + local validation)



1. Identify the doc file(s) to change and open them (IDE) or `@` mention them (IDE or CLI).
2. Prompt Codex with scope and validation requirements:

```text
   Update the "advanced features" documentation to provide authentication troubleshooting guidance. Verify that all links are valid.
```

3. After Codex drafts the changes, review the documentation and iterate as needed.



Verification:

- Read the rendered page.

:::
:::

