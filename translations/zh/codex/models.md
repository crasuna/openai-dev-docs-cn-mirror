---
status: needs-review
sourceId: "cd7c418aea8b"
sourceChecksum: "cd7c418aea8b2729aa34e625fea6c8e20c6cbb88ede8f06c071f4630305c32f4"
sourceUrl: "https://developers.openai.com/codex/models"
translatedAt: "2026-06-27T19:06:51.2133192+08:00"
translator: codex-gpt-5.5-xhigh
---

# Codex 模型

## 推荐模型

<div class="not-prose grid gap-6 md:grid-cols-2 xl:grid-cols-3">
  <ModelDetails
    client:load
    name="gpt-5.5"
    slug="gpt-5.5"
    wallpaperUrl="/images/api/models/gpt-5.5.jpg"
    description="OpenAI 最新的 frontier model，适合 Codex 中复杂编码、computer use、知识工作和研究工作流。"
    data={{
      features: [
        {
          title: "能力",
          value: "",
          icons: [
            "openai.SparklesFilled",
            "openai.SparklesFilled",
            "openai.SparklesFilled",
            "openai.SparklesFilled",
            "openai.SparklesFilled",
          ],
        },
        {
          title: "速度",
          value: "",
          icons: ["openai.Flash", "openai.Flash", "openai.Flash"],
        },
        {
          title: "Codex CLI & SDK",
          value: true,
        },
        { title: "Codex app & IDE extension", value: true },
        {
          title: "Codex Cloud",
          value: false,
        },
        { title: "ChatGPT Credits", value: true },
        { title: "API 访问", value: true },
      ],
    }}
  />

<ModelDetails
  client:load
  name="gpt-5.4"
  slug="gpt-5.4"
  wallpaperUrl="/images/api/models/gpt-5.4.jpg"
  description="面向专业工作的旗舰 frontier model，具备强大的编码、推理、工具使用和 agentic workflow 能力。"
  data={{
    features: [
      {
        title: "能力",
        value: "",
        icons: [
          "openai.SparklesFilled",
          "openai.SparklesFilled",
          "openai.SparklesFilled",
          "openai.SparklesFilled",
          "openai.SparklesFilled",
        ],
      },
      {
        title: "速度",
        value: "",
        icons: ["openai.Flash", "openai.Flash", "openai.Flash"],
      },
      {
        title: "Codex CLI & SDK",
        value: true,
      },
      { title: "Codex app & IDE extension", value: true },
      {
        title: "Codex Cloud",
        value: false,
      },
      { title: "ChatGPT Credits", value: true },
      { title: "API 访问", value: true },
    ],
  }}
/>

<ModelDetails
  client:load
  name="gpt-5.4-mini"
  slug="gpt-5.4-mini"
  wallpaperUrl="/images/api/models/gpt-5-mini.jpg"
  description="快速、高效的 mini 模型，适合响应式编码任务和 subagents。"
  data={{
    features: [
      {
        title: "能力",
        value: "",
        icons: [
          "openai.SparklesFilled",
          "openai.SparklesFilled",
          "openai.SparklesFilled",
        ],
      },
      {
        title: "速度",
        value: "",
        icons: ["openai.Flash", "openai.Flash", "openai.Flash", "openai.Flash"],
      },
      {
        title: "Codex CLI & SDK",
        value: true,
      },
      { title: "Codex app & IDE extension", value: true },
      {
        title: "Codex Cloud",
        value: false,
      },
      { title: "ChatGPT Credits", value: true },
      { title: "API 访问", value: true },
    ],
  }}
/>

<ModelDetails
  client:load
  name="gpt-5.3-codex-spark"
  slug="gpt-5.3-codex-spark"
  wallpaperUrl="/images/codex/codex-wallpaper-2.webp"
  description="纯文本 research preview 模型，针对近乎即时的实时编码迭代优化。面向 ChatGPT Pro 用户开放。"
  data={{
    features: [
      {
        title: "能力",
        value: "",
        icons: [
          "openai.SparklesFilled",
          "openai.SparklesFilled",
          "openai.SparklesFilled",
        ],
      },
      {
        title: "速度",
        value: "",
        icons: [
          "openai.Flash",
          "openai.Flash",
          "openai.Flash",
          "openai.Flash",
          "openai.Flash",
        ],
      },
      {
        title: "Codex CLI & SDK",
        value: true,
      },
      { title: "Codex app & IDE extension", value: true },
      {
        title: "Codex Cloud",
          value: false,
      },
      { title: "ChatGPT Credits", value: false },
      { title: "API 访问", value: false },
    ],
  }}
/>

</div>

对于 Codex 中的大多数任务，请从 `gpt-5.5` 开始。它在复杂编码、computer use、知识工作和研究工作流方面最强。目前，当你使用 ChatGPT 或 API-key authentication 登录时，Codex 中可以使用 GPT-5.5。当你希望为较轻的编码任务或 subagents 选择更快、成本更低的选项时，请使用 `gpt-5.4-mini`。`gpt-5.3-codex-spark` 模型以 research preview 形式面向 ChatGPT Pro 订阅者开放，并针对近乎即时的实时编码迭代进行了优化。

## 其他模型

当你使用 ChatGPT 登录时，Codex 与上面列出的推荐模型搭配效果最好。

你也可以让 Codex 指向任何支持 [Chat Completions](https://platform.openai.com/docs/api-reference/chat) 或 [Responses APIs](https://platform.openai.com/docs/api-reference/responses) 的模型和 provider，以适配你的具体用例。

对 Chat Completions API 的支持已弃用，并将在 Codex 的未来版本中移除。

## 已弃用的 Codex 模型

当你使用 ChatGPT 登录时，`gpt-5.2` 和 `gpt-5.3-codex` 模型在 Codex 中已弃用。如果你的脚本、配置文件或 `codex exec --model` 命令仍引用已弃用模型，请将它们更新为上方列出的最新模型。

某些对 ChatGPT 登录已弃用的模型可能仍可在 API 中使用。如果你的工作流依赖其中某个模型，请使用 API-key authentication，并查看 [API models page](https://developers.openai.com/api/docs/models) 了解当前可用性。

## 配置模型

### 配置默认本地模型

Codex CLI 和 IDE extension 使用相同的 `config.toml` [配置文件](https://developers.openai.com/codex/config-basic)。要指定模型，请向配置文件添加 `model` 条目。如果你不指定模型，Codex app、CLI 或 IDE Extension 会默认使用推荐模型。

```toml
model = "gpt-5.5"
```


### 临时选择不同的本地模型

在 Codex CLI 中，你可以在活跃线程中使用 `/model` 命令切换模型。在 IDE extension 中，你可以使用输入框下方的模型选择器选择模型。

要使用特定模型启动新的 Codex CLI 线程，或为 `codex exec` 指定模型，可以使用 `--model`/`-m` 标志：

```bash
codex -m gpt-5.5
```


### 为 cloud tasks 选择模型

目前，你无法更改 Codex cloud tasks 的默认模型。
