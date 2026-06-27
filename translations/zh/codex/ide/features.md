---
status: needs-review
sourceId: "25163cca5f2b"
sourceChecksum: "25163cca5f2bbe97bc2711bcd7959663774df2f075edd919b8d8bbfc9623bd43"
sourceUrl: "https://developers.openai.com/codex/ide/features"
translatedAt: "2026-06-27T19:05:47.1891485+08:00"
translator: codex-gpt-5.5-xhigh
---

# Codex IDE extension 功能

Codex IDE extension 让你可以在 VS Code、Cursor、Windsurf 和其他 VS Code 兼容编辑器中直接访问 Codex。它使用与 Codex CLI 相同的 agent，并共享相同配置。

## 提示 Codex

在编辑器中使用 Codex，可以无缝聊天、编辑和预览变更。当 Codex 拥有来自打开文件和选中代码的上下文时，你可以编写更短的 prompts，并获得更快、更相关的结果。

你可以在 prompt 中像这样标记任何编辑器文件来引用它：

```text
Use @example.tsx as a reference to add a new page named "Resources" to the app that contains a list of resources defined in @resources.ts
```

## 在模型之间切换

你可以使用聊天输入框下方的切换器来切换模型。

<div class="not-prose max-w-[20rem] mr-auto">
  <img src="https://developers.openai.com/images/codex/ide/switch_model.png"
    alt="Codex model switcher"
    class="block h-auto w-full mx-0!"
  />
</div>

## 调整推理强度

你可以调整推理强度，控制 Codex 在回复前思考多久。更高强度有助于复杂任务，但响应会更慢。更高强度也会使用更多 tokens，并可能更快消耗你的 rate limits，尤其是在能力更强的模型上。

使用上方展示的同一个模型切换器，并为每个模型选择 `low`、`medium` 或 `high`。从 `medium` 开始，仅在需要更深度时切换到 `high`。

## 选择审批模式

默认情况下，Codex 以 `Agent` 模式运行。在此模式下，Codex 可以自动读取文件、进行编辑，并在工作目录中运行命令。Codex 在工作目录之外操作或访问网络时仍需要你的批准。

当你只想聊天，或想在更改前先制定计划时，请使用聊天输入框下方的切换器切换到 `Chat`。

<div class="not-prose max-w-[18rem] mr-auto">
  <img src="https://developers.openai.com/images/codex/ide/approval_mode.png"
    alt="Codex approval modes"
    class="block h-auto w-full mx-0!"
  />
</div>
<br />

如果你需要 Codex 在无需批准的情况下读取文件、进行编辑，并带网络访问运行命令，请使用 `Agent (Full Access)`。这样做前请谨慎。

## 云端委托

你可以将较大的作业卸载到云端的 Codex，然后无需离开 IDE 即可跟踪进度并审查结果。

1. 为 Codex 设置一个[云端环境](https://chatgpt.com/codex/settings/environments)。
2. 选择你的环境并选择 **Run in the cloud**。

你可以让 Codex 从 `main` 运行（适合启动新想法），或从你的本地更改运行（适合完成任务）。

<div class="not-prose max-w-xl mr-auto mb-6">
  <img src="https://developers.openai.com/images/codex/ide/start_cloud_task.png"
    alt="Start a cloud task from the IDE"
    class="block h-auto w-full mx-0!"
  />
</div>

当你从本地对话启动云端任务时，Codex 会记住对话上下文，以便从你离开的地方继续。

## 云端任务跟进

Codex extension 让预览云端变更变得直接。你可以请求后续任务继续在云端运行，但通常你会希望将变更应用到本地来测试和完成。当你在本地继续对话时，Codex 也会保留上下文以节省时间。

<div class="not-prose max-w-xl mr-auto mb-6">
  <img src="https://developers.openai.com/images/codex/ide/load_cloud_task.png"
    alt="Load a cloud task into the IDE"
    class="block h-auto w-full mx-0!"
  />
</div>

你也可以在 [Codex cloud interface](https://chatgpt.com/codex) 中查看云端任务。

## Web search

Codex 内置第一方 web search 工具。对于 Codex IDE Extension 中的本地任务，Codex 默认启用 web search，并从 web search cache 提供结果。该 cache 是 OpenAI 维护的 web 结果索引，因此 cached mode 返回的是预先索引的结果，而不是抓取实时页面。这会减少来自任意实时内容的 prompt injection 暴露，但你仍应将 web 结果视为不受信任。如果你将 sandbox 配置为[完全访问](https://developers.openai.com/codex/agent-approvals-security)，web search 默认会使用实时结果。参见[配置基础](https://developers.openai.com/codex/config-basic)，了解如何禁用 web search 或切换到会抓取最新数据的实时结果。

每当 Codex 查找内容时，你会在 transcript 或 `codex exec --json` 输出中看到 `web_search` 项。

## 将图像拖放到 prompt 中

你可以将图像拖放到 prompt composer 中，把它们作为上下文包含进去。

拖放图像时按住 `Shift`。否则 VS Code 会阻止 extensions 接受拖放。

## 图像生成

请求 Codex 在不离开编辑器的情况下生成或编辑图像。这对 UI assets、布局、插图、sprite sheets，以及工作中的快速占位图很有用。当你希望 Codex 转换或扩展现有素材时，请在 prompt 中添加参考图像。

你可以用自然语言提出请求，也可以通过在 prompt 中包含 `$imagegen` 来显式调用图像生成 skill。

内置图像生成使用 `gpt-image-2`，计入你的常规 Codex usage limits；根据图像质量和尺寸不同，它平均会比不包含图像生成的类似 turns 快 3-5 倍消耗 included limits。详情请参见[定价](https://developers.openai.com/codex/pricing#image-generation-usage-limits)。有关 prompting tips 和模型详情，请参见[图像生成指南](https://developers.openai.com/api/docs/guides/image-generation)。

对于更大批量的图像生成，请在环境变量中设置 `OPENAI_API_KEY`，并请求 Codex 通过 API 生成图像，这样会适用 API pricing。

## 另请参见

- [Codex IDE extension 设置](https://developers.openai.com/codex/ide/settings)
