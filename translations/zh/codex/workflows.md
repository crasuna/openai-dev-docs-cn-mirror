---
status: needs-review
sourceId: "9bd9fe21e038"
sourceChecksum: "9bd9fe21e038fc24d69d79cbd22dd33fecf07d99cc9dd180470d98313e51b4c6"
sourceUrl: "https://developers.openai.com/codex/workflows"
translatedAt: "2026-06-27T19:34:30.6847913+08:00"
translator: codex-gpt-5.5-xhigh
---

# 工作流

当你把 Codex 当作一个有明确上下文和清晰“完成”定义的队友时，它效果最好。
本页提供 Codex IDE extension、Codex CLI 和 Codex cloud 的端到端工作流示例。

如果你刚开始使用 Codex，请先阅读 [Prompting](https://developers.openai.com/codex/prompting)，再回到这里查看具体 recipes。

## 如何阅读这些示例

每个工作流都包括：

- **什么时候使用它**，以及最适合的 Codex 界面（IDE、CLI 或 cloud）。
- **步骤**，包含示例 user prompts。
- **Context notes**：Codex 会自动看到什么，以及你应该附加什么。
- **Verification**：如何检查输出。

> **Note:** IDE extension 会自动把你打开的文件包含为上下文。在 CLI 中，你通常需要明确提及 paths（或使用 `/mention` 和 `@` path autocomplete 附加文件）。

---

## 解释 codebase

当你在 onboarding、接手一个 service，或尝试理解 protocol、data model 或 request flow 时使用它。

### IDE extension workflow（最快的本地探索方式）

<WorkflowSteps>

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

</WorkflowSteps>

Verification：

- 要求提供一个你可以快速验证的 diagram 或 checklist：

```text
Summarize the request flow as a numbered list of steps. Then list the files involved.
```

### CLI workflow（适合需要 transcript + shell commands 时）

<WorkflowSteps>

1. 启动 interactive session：

   ```bash
   codex
   ```

2. 附加文件（可选）并提示：

   ```text
   I need to understand the protocol used by this service. Read @foo.ts @schema.ts and explain the schema and request/response flow. Focus on required vs optional fields and backward compatibility rules.
   ```

</WorkflowSteps>

Context notes：

- 你可以在 composer 中使用 `@` 插入 workspace 中的 file paths，或使用 `/mention` 附加特定文件。

---

## 修复 bug

当你有可在本地复现的失败行为时使用它。

### CLI workflow（带复现和验证的紧密循环）

<WorkflowSteps>

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

</WorkflowSteps>

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

<WorkflowSteps>

1. 打开你认为 bug 所在的文件，以及它最近的 caller。
2. 提示 Codex：

   ```text
   Find the bug causing "Saved" to show without persisting changes. After proposing the fix, tell me how to verify it in the UI.
   ```

</WorkflowSteps>

---

## 编写 test

当你想非常明确地指定测试范围时使用它。

### IDE extension workflow（基于 selection）

<WorkflowSteps>

1. 打开包含该 function 的文件。
2. 选择定义该 function 的 lines。从 command palette 选择 “Add to Codex Thread”，将这些 lines 添加到上下文。
3. 提示 Codex：

   ```text
   Write a unit test for this function. Follow conventions used in other tests.
   ```

</WorkflowSteps>

Context notes：

- 由 “Add to Codex Thread” command 提供：选中的 lines（这是 “line number” scope），以及打开的文件。

### CLI workflow（在 prompt 中描述 path + line range）

<WorkflowSteps>

1. 启动 Codex：

   ```bash
   codex
   ```

2. 用 function name 提示：

   ```text
   Add a test for the invert_list function in @transform.ts. Cover the happy path plus edge cases.
   ```

</WorkflowSteps>

---

## 从 screenshot 原型化

当你有 design mock、screenshot 或 UI reference，并希望快速得到可工作的 prototype 时使用它。

### CLI workflow（image + prompt）

<WorkflowSteps>

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

</WorkflowSteps>

Context notes：

- image 提供视觉要求，但你仍需要指定 implementation constraints（framework、routing、component style）。
- 为获得最佳结果，请用文字包含任何不明显的行为（hover states、validation rules、keyboard interactions）。

Verification：

- 要求 Codex 运行 dev server（如果允许），并告诉你确切查看位置：

```text
Start the dev server and tell me the local URL/route to view the prototype.
```

### IDE extension workflow（image + existing files）

<WorkflowSteps>

1. 在 Codex chat 中附加 image（拖放或粘贴）。
2. 提示 Codex：

   ```text
   Create a new settings page. Use the attached screenshot as the target UI.
   Follow design and visual patterns from other files in this project.
   ```

</WorkflowSteps>

---

## 使用 live updates 迭代 UI

当你希望在 Codex 编辑代码时进行紧密的“design -> tweak -> refresh -> tweak”循环，可以使用它。

### CLI workflow（运行 Vite，然后用小 prompt 迭代）

<WorkflowSteps>

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

</WorkflowSteps>

Verification：

- 在浏览器中“live”审查代码更新后的变更。
- 提交你喜欢的变更，revert 你不喜欢的变更。
- 如果你 revert 或修改了某个变更，请告诉 Codex，这样它处理下一个 prompt 时不会覆盖该变更。

---

## 将 refactor 委派给 cloud

当你想先仔细设计（本地上下文、快速检查），再把较长实现外包给可以并行运行的 cloud task 时使用它。

### 本地规划（IDE）

<WorkflowSteps>

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

</WorkflowSteps>

Context notes：

- 当 Codex 可以本地扫描当前代码（entrypoints、module boundaries、dependency graph hints）时，规划效果最好。

### Cloud delegation（IDE -> Cloud）

<WorkflowSteps>

1. 如果还没有设置，请先设置 [Codex cloud environment](https://developers.openai.com/codex/cloud/environments)。
2. 点击 prompt composer 下方的 cloud icon，并选择你的 cloud environment。
3. 当你输入下一个 prompt 时，Codex 会在 cloud 中创建一个新 thread，携带已有 thread context（包括 plan 和任何本地 source changes）。

   ```text
   Implement Milestone 1 from the plan.
   ```

4. 审查 cloud diff，并在需要时迭代。

5. 直接从 cloud 创建 PR，或将变更拉到本地测试并收尾。

6. 继续迭代 plan 的其他 milestones。

</WorkflowSteps>

---

## 做本地 code review

当你想在 commit 或创建 PR 前获得第二双眼睛时使用它。

### CLI workflow（审查你的 working tree）

<WorkflowSteps>

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

</WorkflowSteps>

Verification：

- 根据 review feedback 应用修复，然后重新运行 `/review`，确认问题已解决。

---

## 审查 GitHub pull request

当你希望在不把 branch 拉到本地的情况下获得 review feedback 时使用它。

使用前，请在你的 repository 上启用 Codex **Code review**。参见 [Code review](https://developers.openai.com/codex/integrations/github)。

### GitHub workflow（comment-driven）

<WorkflowSteps>

1. 在 GitHub 上打开 pull request。
2. 留下一条 comment，标记 Codex 并带上明确 focus areas：

   ```text
   @codex review
   ```

3. 可选：提供更明确的 instructions。

   ```text
   @codex review for security vulnerabilities and security concerns
   ```

</WorkflowSteps>

---

## 更新文档

当你需要准确、清晰的 doc change 时使用它。

### IDE 或 CLI workflow（本地编辑 + 本地验证）

<WorkflowSteps>

1. 识别要更改的 doc file(s)，并打开它们（IDE），或 `@` mention 它们（IDE 或 CLI）。
2. 用 scope 和 validation requirements 提示 Codex：

   ```text
   Update the "advanced features" documentation to provide authentication troubleshooting guidance. Verify that all links are valid.
   ```

3. Codex 起草变更后，审查 documentation 并按需迭代。

</WorkflowSteps>

Verification：

- 阅读渲染后的页面。

