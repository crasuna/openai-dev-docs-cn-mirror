---
title: "Codex IDE extension 功能"
description: "What you can do with the Codex IDE extension"
outline: deep
---

# Codex IDE extension 功能

**文档集**：Codex\
**分组**：IDE\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/ide/features](https://developers.openai.com/codex/ide/features)
- Markdown 来源：[https://developers.openai.com/codex/ide/features.md](https://developers.openai.com/codex/ide/features.md)
- 抓取时间：2026-06-27T05:54:59.932Z
- Checksum：`25163cca5f2bbe97bc2711bcd7959663774df2f075edd919b8d8bbfc9623bd43`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex IDE extension 让你可以在 VS Code、Cursor、Windsurf 和其他 VS Code 兼容编辑器中直接访问 Codex。它使用与 Codex CLI 相同的 agent，并共享相同配置。

## 提示 Codex

在编辑器中使用 Codex，可以无缝聊天、编辑和预览变更。当 Codex 拥有来自打开文件和选中代码的上下文时，你可以编写更短的 prompts，并获得更快、更相关的结果。

你可以在 prompt 中像这样标记任何编辑器文件来引用它：

```text
Use @example.tsx as a reference to add a new page named "Resources" to the app that contains a list of resources defined in @resources.ts
```

## 在模型之间切换

你可以使用聊天输入框下方的切换器来切换模型。


  &lt;img src="https://developers.openai.com/images/codex/ide/switch_model.png"
    alt="Codex model switcher"
    class="block h-auto w-full mx-0!"
  /&gt;


## 调整推理强度

你可以调整推理强度，控制 Codex 在回复前思考多久。更高强度有助于复杂任务，但响应会更慢。更高强度也会使用更多 tokens，并可能更快消耗你的 rate limits，尤其是在能力更强的模型上。

使用上方展示的同一个模型切换器，并为每个模型选择 `low`、`medium` 或 `high`。从 `medium` 开始，仅在需要更深度时切换到 `high`。

## 选择审批模式

默认情况下，Codex 以 `Agent` 模式运行。在此模式下，Codex 可以自动读取文件、进行编辑，并在工作目录中运行命令。Codex 在工作目录之外操作或访问网络时仍需要你的批准。

当你只想聊天，或想在更改前先制定计划时，请使用聊天输入框下方的切换器切换到 `Chat`。


  &lt;img src="https://developers.openai.com/images/codex/ide/approval_mode.png"
    alt="Codex approval modes"
    class="block h-auto w-full mx-0!"
  /&gt;



如果你需要 Codex 在无需批准的情况下读取文件、进行编辑，并带网络访问运行命令，请使用 `Agent (Full Access)`。这样做前请谨慎。

## 云端委托

你可以将较大的作业卸载到云端的 Codex，然后无需离开 IDE 即可跟踪进度并审查结果。

1. 为 Codex 设置一个[云端环境](https://chatgpt.com/codex/settings/environments)。
2. 选择你的环境并选择 **Run in the cloud**。

你可以让 Codex 从 `main` 运行（适合启动新想法），或从你的本地更改运行（适合完成任务）。


  &lt;img src="https://developers.openai.com/images/codex/ide/start_cloud_task.png"
    alt="Start a cloud task from the IDE"
    class="block h-auto w-full mx-0!"
  /&gt;


当你从本地对话启动云端任务时，Codex 会记住对话上下文，以便从你离开的地方继续。

## 云端任务跟进

Codex extension 让预览云端变更变得直接。你可以请求后续任务继续在云端运行，但通常你会希望将变更应用到本地来测试和完成。当你在本地继续对话时，Codex 也会保留上下文以节省时间。


  &lt;img src="https://developers.openai.com/images/codex/ide/load_cloud_task.png"
    alt="Load a cloud task into the IDE"
    class="block h-auto w-full mx-0!"
  /&gt;


你也可以在 [Codex cloud interface](https://chatgpt.com/codex) 中查看云端任务。

## Web search

Codex 内置第一方 web search 工具。对于 Codex IDE Extension 中的本地任务，Codex 默认启用 web search，并从 web search cache 提供结果。该 cache 是 OpenAI 维护的 web 结果索引，因此 cached mode 返回的是预先索引的结果，而不是抓取实时页面。这会减少来自任意实时内容的 prompt injection 暴露，但你仍应将 web 结果视为不受信任。如果你将 sandbox 配置为[完全访问](/mirror/codex/agent-approvals-security)，web search 默认会使用实时结果。参见[配置基础](/mirror/codex/config-basic)，了解如何禁用 web search 或切换到会抓取最新数据的实时结果。

每当 Codex 查找内容时，你会在 transcript 或 `codex exec --json` 输出中看到 `web_search` 项。

## 将图像拖放到 prompt 中

你可以将图像拖放到 prompt composer 中，把它们作为上下文包含进去。

拖放图像时按住 `Shift`。否则 VS Code 会阻止 extensions 接受拖放。

## 图像生成

请求 Codex 在不离开编辑器的情况下生成或编辑图像。这对 UI assets、布局、插图、sprite sheets，以及工作中的快速占位图很有用。当你希望 Codex 转换或扩展现有素材时，请在 prompt 中添加参考图像。

你可以用自然语言提出请求，也可以通过在 prompt 中包含 `$imagegen` 来显式调用图像生成 skill。

内置图像生成使用 `gpt-image-2`，计入你的常规 Codex usage limits；根据图像质量和尺寸不同，它平均会比不包含图像生成的类似 turns 快 3-5 倍消耗 included limits。详情请参见[定价](/mirror/codex/pricing#image-generation-usage-limits)。有关 prompting tips 和模型详情，请参见[图像生成指南](/mirror/api/docs/guides/image-generation)。

对于更大批量的图像生成，请在环境变量中设置 `OPENAI_API_KEY`，并请求 Codex 通过 API 生成图像，这样会适用 API pricing。

## 另请参见

- [Codex IDE extension 设置](/mirror/codex/ide/settings)

:::

## English source

::: details 展开英文原文
::: v-pre
The Codex IDE extension gives you access to Codex directly in VS Code, Cursor, Windsurf, and other VS Code-compatible editors. It uses the same agent as the Codex CLI and shares the same configuration.

## Prompting Codex

Use Codex in your editor to chat, edit, and preview changes seamlessly. When Codex has context from open files and selected code, you can write shorter prompts and get faster, more relevant results.

You can reference any file in your editor by tagging it in your prompt like this:

```text
Use @example.tsx as a reference to add a new page named "Resources" to the app that contains a list of resources defined in @resources.ts
```

## Switch between models

You can switch models with the switcher under the chat input.


  &lt;img src="https://developers.openai.com/images/codex/ide/switch_model.png"
    alt="Codex model switcher"
    class="block h-auto w-full mx-0!"
  /&gt;


## Adjust reasoning effort

You can adjust reasoning effort to control how long Codex thinks before responding. Higher effort can help on complex tasks, but responses take longer. Higher effort also uses more tokens and can consume your rate limits faster, especially with higher-capability models.

Use the same model switcher shown above, and choose `low`, `medium`, or `high` for each model. Start with `medium`, and only switch to `high` when you need more depth.

## Choose an approval mode

By default, Codex runs in `Agent` mode. In this mode, Codex can read files, make edits, and run commands in the working directory automatically. Codex still needs your approval to work outside the working directory or access the network.

When you just want to chat, or you want to plan before making changes, switch to `Chat` with the switcher under the chat input.


  &lt;img src="https://developers.openai.com/images/codex/ide/approval_mode.png"
    alt="Codex approval modes"
    class="block h-auto w-full mx-0!"
  /&gt;



If you need Codex to read files, make edits, and run commands with network access without approval, use `Agent (Full Access)`. Exercise caution before doing so.

## Cloud delegation

You can offload larger jobs to Codex in the cloud, then track progress and review results without leaving your IDE.

1. Set up a [cloud environment for Codex](https://chatgpt.com/codex/settings/environments).
2. Pick your environment and select **Run in the cloud**.

You can have Codex run from `main` (useful for starting new ideas), or run from your local changes (useful for finishing a task).


  &lt;img src="https://developers.openai.com/images/codex/ide/start_cloud_task.png"
    alt="Start a cloud task from the IDE"
    class="block h-auto w-full mx-0!"
  /&gt;


When you start a cloud task from a local conversation, Codex remembers the conversation context so it can pick up where you left off.

## Cloud task follow-up

The Codex extension makes previewing cloud changes straightforward. You can ask for follow-ups to run in the cloud, but often you'll want to apply the changes locally to test and finish. When you continue the conversation locally, Codex also retains context to save you time.


  &lt;img src="https://developers.openai.com/images/codex/ide/load_cloud_task.png"
    alt="Load a cloud task into the IDE"
    class="block h-auto w-full mx-0!"
  /&gt;


You can also view the cloud tasks in the [Codex cloud interface](https://chatgpt.com/codex).

## Web search

Codex ships with a first-party web search tool. For local tasks in the Codex IDE Extension, Codex enables web search by default and serves results from a web search cache. The cache is an OpenAI-maintained index of web results, so cached mode returns pre-indexed results instead of fetching live pages. This reduces exposure to prompt injection from arbitrary live content, but you should still treat web results as untrusted. If you configure your sandbox for [full access](/mirror/codex/agent-approvals-security), web search defaults to live results. See [Config basics](/mirror/codex/config-basic) to disable web search or switch to live results that fetch the most recent data.

You'll see `web_search` items in the transcript or `codex exec --json` output whenever Codex looks something up.

## Drag and drop images into the prompt

You can drag and drop images into the prompt composer to include them as context.

Hold down `Shift` while dropping an image. VS Code otherwise prevents extensions from accepting a drop.

## Image generation

Ask Codex to generate or edit images without leaving your editor. This is useful for UI assets, layouts, illustrations, sprite sheets, and quick placeholders while you work. Add a reference image to the prompt when you want Codex to transform or extend an existing asset.

You can ask in natural language or explicitly invoke the image generation skill by including `$imagegen` in your prompt.

Built-in image generation uses `gpt-image-2`, counts toward your general Codex usage limits, and uses included limits 3-5x faster on average than similar turns without image generation, depending on image quality and size. For details, see [Pricing](/mirror/codex/pricing#image-generation-usage-limits). For prompting tips and model details, see the [image generation guide](/mirror/api/docs/guides/image-generation).

For larger batches of image generation, set `OPENAI_API_KEY` in your environment variables and ask Codex to generate images through the API so API pricing applies instead.

## See also

- [Codex IDE extension settings](/mirror/codex/ide/settings)

:::
:::

