---
title: "Moderation 内容审核"
description: "Learn how to identify harmful content in text and images with OpenAI moderation models."
outline: deep
---

# Moderation 内容审核

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/moderation](https://developers.openai.com/api/docs/guides/moderation)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/moderation.md](https://developers.openai.com/api/docs/guides/moderation.md)
- 抓取时间：2026-06-27T05:54:03.819Z
- Checksum：`1a8fdb088c8b5b7e94fe1b51c784649cfe1097c381b98c9c47e3c6a8070c9a59`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用 OpenAI moderation models 检测文本和图像中的有害内容。你可以使用 [moderation endpoint](https://developers.openai.com/api/docs/api-reference/moderations) 对独立输入进行分类，也可以请求在生成回复的同时返回 moderation scores。使用结果执行你的应用政策，例如过滤内容、将请求路由到审核，或干预提交被标记内容的账号。

`omni-moderation-latest` 模型接受文本和图像输入。它不会分类音频。moderation endpoint 可免费使用，图像文件最大可达 20 MB。

## 选择 moderation 工作流

| 工作流                                                          | 使用场景                                                                                           |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [Moderate generated content](/mirror/api/docs/guides/moderation#moderate-generated-content)       | 你的应用使用 Responses API 或 Chat Completions API 生成文本，并需要 moderation signals。           |
| [Classify standalone inputs](/mirror/api/docs/guides/moderation#classify-standalone-inputs)       | 你的应用需要在不生成模型回复的情况下，对文本或图像分类。                                          |
| [Understand moderation results](/mirror/api/docs/guides/moderation#understand-moderation-results) | 你的应用需要解释 flags、categories、scores 或 applied input types。                                |
| [Review supported categories](/mirror/api/docs/guides/moderation#review-supported-categories)     | 你的应用需要知道哪些 harm categories 适用于文本、图像或二者。                                     |

## 对生成内容进行 moderation

当你的应用需要同时获得生成文本和 moderation scores 时，请在生成请求中传入顶层 `moderation` 对象。API 会返回模型输入和生成输出的 moderation scores，而无需发起单独的 moderation 请求。

模型仍会正常生成。请先审查 moderation results，再向用户显示输出或采取下游操作。



创建 response 时设置 `moderation.model`：

生成带有 moderation scores 的 response

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": (
                "A user asks for instructions to make a harmful weapon. "
                "Draft a brief refusal and offer a safer alternative."
            ),
        }
    ],
    moderation={"model": "omni-moderation-latest"},
)

input_moderation = response.moderation.input
output_moderation = response.moderation.output

print(input_moderation.flagged)
print(output_moderation.flagged)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content:
        "A user asks for instructions to make a harmful weapon. Draft a brief refusal and offer a safer alternative.",
    },
  ],
  moderation: { model: "omni-moderation-latest" },
});

const inputModeration = response.moderation.input;
const outputModeration = response.moderation.output;

console.log(inputModeration.flagged);
console.log(outputModeration.flagged);
```


Responses API 会在 `response.moderation.input` 返回一个 input `moderation_result` 对象，并在 `response.moderation.output` 返回一个 output `moderation_result` 对象。





Inline moderation results 使用与独立 moderation result 相同的 category fields。先用 `flagged` 做第一轮决策，再检查 `categories` 和 `category_scores`，用于日志记录、路由、审计轨迹或人工审核队列。如果拒绝回复或其他具备安全意识的回复讨论了有害内容，它仍然可能触发 flag。请将 moderation scores 视为你的应用政策的信号，而不是自动拦截决策。

如果你的应用需要处理 moderation failures，请在读取 scores 前检查 moderation result type。如果某个 moderation step 无法完成，对应的 input 或 output moderation field 可能包含 error，而不是 moderation scores。

对于 tool-calling 请求，当 tool-call arguments 和 tool outputs 出现在 conversation content 中时，moderation 会覆盖它们。它不会覆盖 tool names、tool descriptions、tool schemas 或 response-format schemas。

如果你 stream 生成的 response，moderation scores 会在完整生成输出可用后到达。它们不会包含在 partial output deltas 中。

## 对独立输入进行分类

使用 [moderation endpoint](https://developers.openai.com/api/docs/api-reference/moderations) 在不生成模型回复的情况下对文本或图像输入分类。下面的 tabs 展示如何使用 [OpenAI libraries](/mirror/api/docs/libraries) 和 [`omni-moderation-latest` model](https://developers.openai.com/api/docs/models#moderation)：




Moderate text inputs


Moderate images and text




## 理解 moderation results

下面是一个来自战争电影单帧图像的完整示例输出。模型在图像中识别出暴力指标，并给出大于 0.8 的 `violence` category score。

```json
{
  "id": "modr-970d409ef3bef3b70c73d8232df86e7d",
  "model": "omni-moderation-latest",
  "results": [
    {
      "flagged": true,
      "categories": {
        "sexual": false,
        "sexual/minors": false,
        "harassment": false,
        "harassment/threatening": false,
        "hate": false,
        "hate/threatening": false,
        "illicit": false,
        "illicit/violent": false,
        "self-harm": false,
        "self-harm/intent": false,
        "self-harm/instructions": false,
        "violence": true,
        "violence/graphic": false
      },
      "category_scores": {
        "sexual": 2.34135824776394e-7,
        "sexual/minors": 1.6346470245419304e-7,
        "harassment": 0.0011643905680426018,
        "harassment/threatening": 0.0022121340080906377,
        "hate": 3.1999824407395835e-7,
        "hate/threatening": 2.4923252458203563e-7,
        "illicit": 0.0005227032493135171,
        "illicit/violent": 3.682979260160596e-7,
        "self-harm": 0.0011175734280627694,
        "self-harm/intent": 0.0006264858507989037,
        "self-harm/instructions": 7.368592981140821e-8,
        "violence": 0.8599265510337075,
        "violence/graphic": 0.37701736389561064
      },
      "category_applied_input_types": {
        "sexual": ["image"],
        "sexual/minors": [],
        "harassment": [],
        "harassment/threatening": [],
        "hate": [],
        "hate/threatening": [],
        "illicit": [],
        "illicit/violent": [],
        "self-harm": ["image"],
        "self-harm/intent": ["image"],
        "self-harm/instructions": ["image"],
        "violence": ["image"],
        "violence/graphic": ["image"]
      }
    }
  ]
}
```

JSON response 包含一些字段，用于描述输入中存在哪些 categories，以及模型对每个 category 的置信度。



输出 category
描述


`flagged`

      如果模型将内容分类为可能有害，则设置为 `true`，
      否则为 `false`。



`categories`

      包含一个按 category 划分的违规 flags 字典。对每个 category，
      如果模型标记相应 category 被违反，则值为 `true`，
      否则为 `false`。



`category_scores`

      包含一个按 category 划分的 scores 字典。每个 score 表示模型对
      输入包含该 category 内容的置信度。值介于 0 和 1 之间，值越高表示置信度越高。



`category_applied_input_types`

      包含 category score 适用的 input types。例如，
      如果 `violence/graphic` category 同时适用于图像和文本输入，
      则 `violence/graphic` 属性会被设置为 `["image", "text"]`。




我们计划持续升级 moderation endpoint 的底层模型。因此，依赖 `category_scores` 的自定义政策可能需要随着时间重新校准。

## 审查支持的 categories

下表描述 moderation endpoint 可以检测的内容 categories，以及每个 category 支持的 input types。

标记为“Text only”的 categories 不支持图像输入。如果你只向 `omni-moderation-latest` 模型发送图像（不附带文本），它会为这些不支持的 categories 返回 0 分。图像文件限制为 20 MB。




Category


Description


Inputs



`harassment`

      表达、煽动或宣扬针对任何目标的骚扰性语言的内容。

Text only


`harassment/threatening`

      同时包含针对任何目标的暴力或严重伤害的骚扰内容。

Text only


`hate`

      基于种族、性别、族裔、宗教、国籍、性取向、残障状态
      或 caste 表达、煽动或宣扬仇恨的内容。针对非受保护群体
      （例如棋手）的仇恨内容属于 harassment。

Text only


`hate/threatening`

      基于种族、性别、族裔、宗教、国籍、
      性取向、残障状态或 caste，且同时包含针对目标群体的暴力或严重伤害的仇恨内容。

Text only


`illicit`

      就如何实施非法行为给出建议或指令的内容。
      像 "how to shoplift" 这样的短语适合此 category。

Text only


`illicit/violent`

      与 `illicit` category 标记的内容类型相同，
      但还包含对暴力或获取武器的引用。

Text only


`self-harm`

      宣扬、鼓励或描绘自伤行为的内容，例如自杀、
      割伤自己和进食障碍。

Text and images


`self-harm/intent`

      说话者表达其正在实施或意图实施自伤行为的内容，
      例如自杀、割伤自己和进食障碍。

Text and images


`self-harm/instructions`

      鼓励实施自伤行为的内容，例如自杀、
      割伤自己和进食障碍，或提供如何实施此类行为的指令或建议的内容。

Text and images


`sexual`

      旨在激发性兴奋的内容，例如对性行为的描述，
      或推广性服务的内容（不包括性教育和健康）。

Text and images


`sexual/minors`

      包含 18 岁以下个人的性内容。

Text only


`violence`
描绘死亡、暴力或身体伤害的内容。
Text and images


`violence/graphic`

      以图像化细节描绘死亡、暴力或身体伤害的内容。

Text and images



:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Use OpenAI moderation models to detect harmful content in text and images. You can classify standalone inputs with the [moderation endpoint](https://developers.openai.com/api/docs/api-reference/moderations) or request moderation scores alongside a generated response. Use the results to enforce your application's policy, such as filtering content, routing a request for review, or intervening with accounts that submit flagged content.

The `omni-moderation-latest` model accepts text and image inputs. It doesn't classify audio. The moderation endpoint is free to use, and image files can be up to 20 MB.

## Choose a moderation workflow

| Workflow                                                        | Use when                                                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [Moderate generated content](#moderate-generated-content)       | Your application generates text with the Responses API or Chat Completions API and needs moderation signals. |
| [Classify standalone inputs](#classify-standalone-inputs)       | Your application needs to classify text or images without generating a model response.                       |
| [Understand moderation results](#understand-moderation-results) | Your application needs to interpret flags, categories, scores, or applied input types.                       |
| [Review supported categories](#review-supported-categories)     | Your application needs to know which harm categories apply to text, images, or both.                         |

## Moderate generated content

When your application needs generated text and moderation scores together, pass a top-level `moderation` object in the generation request. The API returns moderation scores for the model input and generated output without a separate moderation request.

The model still generates normally. Review the moderation results before you show the output to a user or take downstream actions.



Set `moderation.model` when you create a response:

Generate a response with moderation scores

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": (
                "A user asks for instructions to make a harmful weapon. "
                "Draft a brief refusal and offer a safer alternative."
            ),
        }
    ],
    moderation={"model": "omni-moderation-latest"},
)

input_moderation = response.moderation.input
output_moderation = response.moderation.output

print(input_moderation.flagged)
print(output_moderation.flagged)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content:
        "A user asks for instructions to make a harmful weapon. Draft a brief refusal and offer a safer alternative.",
    },
  ],
  moderation: { model: "omni-moderation-latest" },
});

const inputModeration = response.moderation.input;
const outputModeration = response.moderation.output;

console.log(inputModeration.flagged);
console.log(outputModeration.flagged);
```


The Responses API returns an input `moderation_result` object at `response.moderation.input` and an output `moderation_result` object at `response.moderation.output`.





Inline moderation results use the same category fields as a standalone moderation result. Start with `flagged` for a first-pass decision, then inspect `categories` and `category_scores` for logging, routing, audit trails, or human-review queues. A refusal or other safety-aware response can still trigger a flag if it discusses harmful content. Treat moderation scores as signals for your application's policy, not as an automatic blocking decision.

Check the moderation result type before you read scores if your application needs to handle moderation failures. If a moderation step can't complete, the corresponding input or output moderation field can contain an error instead of moderation scores.

For tool-calling requests, moderation covers tool-call arguments and tool outputs when they appear in conversation content. It doesn't cover tool names, tool descriptions, tool schemas, or response-format schemas.

If you stream a generated response, moderation scores arrive after the full generated output is available. They aren't included with partial output deltas.

## Classify standalone inputs

Use the [moderation endpoint](https://developers.openai.com/api/docs/api-reference/moderations) to classify text or image inputs without generating a model response. The tabs below show how to use the [OpenAI libraries](https://developers.openai.com/api/docs/libraries) and the [`omni-moderation-latest` model](https://developers.openai.com/api/docs/models#moderation):



<div data-content-switcher-pane data-value="text">
    <div class="hidden">Moderate text inputs</div>
    </div>
  <div data-content-switcher-pane data-value="images" hidden>
    <div class="hidden">Moderate images and text</div>
    </div>



## Understand moderation results

Here's a full example output for an image from a single frame of a war movie. The model identifies indicators of violence in the image, with a `violence` category score greater than 0.8.

```json
{
  "id": "modr-970d409ef3bef3b70c73d8232df86e7d",
  "model": "omni-moderation-latest",
  "results": [
    {
      "flagged": true,
      "categories": {
        "sexual": false,
        "sexual/minors": false,
        "harassment": false,
        "harassment/threatening": false,
        "hate": false,
        "hate/threatening": false,
        "illicit": false,
        "illicit/violent": false,
        "self-harm": false,
        "self-harm/intent": false,
        "self-harm/instructions": false,
        "violence": true,
        "violence/graphic": false
      },
      "category_scores": {
        "sexual": 2.34135824776394e-7,
        "sexual/minors": 1.6346470245419304e-7,
        "harassment": 0.0011643905680426018,
        "harassment/threatening": 0.0022121340080906377,
        "hate": 3.1999824407395835e-7,
        "hate/threatening": 2.4923252458203563e-7,
        "illicit": 0.0005227032493135171,
        "illicit/violent": 3.682979260160596e-7,
        "self-harm": 0.0011175734280627694,
        "self-harm/intent": 0.0006264858507989037,
        "self-harm/instructions": 7.368592981140821e-8,
        "violence": 0.8599265510337075,
        "violence/graphic": 0.37701736389561064
      },
      "category_applied_input_types": {
        "sexual": ["image"],
        "sexual/minors": [],
        "harassment": [],
        "harassment/threatening": [],
        "hate": [],
        "hate/threatening": [],
        "illicit": [],
        "illicit/violent": [],
        "self-harm": ["image"],
        "self-harm/intent": ["image"],
        "self-harm/instructions": ["image"],
        "violence": ["image"],
        "violence/graphic": ["image"]
      }
    }
  ]
}
```

The JSON response includes fields that describe which categories are present in the input and the model's confidence in each category.

<table>
  <tr>
    <th>Output category</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>`flagged`</td>
    <td>
      Set to `true` if the model classifies the content as potentially harmful,
      `false` otherwise.
    </td>
  </tr>
  <tr>
    <td>`categories`</td>
    <td>
      Contains a dictionary of per-category violation flags. For each category,
      the value is `true` if the model flags the corresponding category as
      violated, `false` otherwise.
    </td>
  </tr>
  <tr>
    <td>`category_scores`</td>
    <td>
      Contains a dictionary of per-category scores. Each score represents the
      model's confidence that the input contains content in the category. The
      value is between 0 and 1, where higher values denote higher confidence.
    </td>
  </tr>
  <tr>
    <td>`category_applied_input_types`</td>
    <td>
      Contains the input types that the category score applies to. For example,
      if the `violence/graphic` category applies to both image and text inputs,
      the `violence/graphic` property is set to `["image", "text"]`.
    </td>
  </tr>
</table>

We plan to continuously upgrade the moderation endpoint's underlying model.
  Therefore, custom policies that rely on `category_scores` may need
  recalibration over time.

## Review supported categories

The table below describes the content categories that the moderation endpoint can detect and the input types that each category supports.

Categories marked as "Text only" do not support image inputs. If you send only
  images (without accompanying text) to the `omni-moderation-latest` model, it
  will return a score of 0 for these unsupported categories. Image files are
  limited to 20 MB.

<table>
  <tr>
    <th>
      <strong>Category</strong>
    </th>
    <th>
      <strong>Description</strong>
    </th>
    <th>
      <strong>Inputs</strong>
    </th>
  </tr>
  <tr>
    <td>`harassment`</td>
    <td>
      Content that expresses, incites, or promotes harassing language towards
      any target.
    </td>
    <td>Text only</td>
  </tr>
  <tr>
    <td>`harassment/threatening`</td>
    <td>
      Harassment content that also includes violence or serious harm towards any
      target.
    </td>
    <td>Text only</td>
  </tr>
  <tr>
    <td>`hate`</td>
    <td>
      Content that expresses, incites, or promotes hate based on race, gender,
      ethnicity, religion, nationality, sexual orientation, disability status,
      or caste. Hateful content aimed at non-protected groups (e.g., chess
      players) is harassment.
    </td>
    <td>Text only</td>
  </tr>
  <tr>
    <td>`hate/threatening`</td>
    <td>
      Hateful content that also includes violence or serious harm towards the
      targeted group based on race, gender, ethnicity, religion, nationality,
      sexual orientation, disability status, or caste.
    </td>
    <td>Text only</td>
  </tr>
  <tr>
    <td>`illicit`</td>
    <td>
      Content that gives advice or instruction on how to commit illicit acts. A
      phrase like "how to shoplift" would fit this category.
    </td>
    <td>Text only</td>
  </tr>
  <tr>
    <td>`illicit/violent`</td>
    <td>
      The same types of content flagged by the `illicit` category, but also
      includes references to violence or procuring a weapon.
    </td>
    <td>Text only</td>
  </tr>
  <tr>
    <td>`self-harm`</td>
    <td>
      Content that promotes, encourages, or depicts acts of self-harm, such as
      suicide, cutting, and eating disorders.
    </td>
    <td>Text and images</td>
  </tr>
  <tr>
    <td>`self-harm/intent`</td>
    <td>
      Content where the speaker expresses that they are engaging or intend to
      engage in acts of self-harm, such as suicide, cutting, and eating
      disorders.
    </td>
    <td>Text and images</td>
  </tr>
  <tr>
    <td>`self-harm/instructions`</td>
    <td>
      Content that encourages performing acts of self-harm, such as suicide,
      cutting, and eating disorders, or that gives instructions or advice on how
      to commit such acts.
    </td>
    <td>Text and images</td>
  </tr>
  <tr>
    <td>`sexual`</td>
    <td>
      Content meant to arouse sexual excitement, such as the description of
      sexual activity, or that promotes sexual services (excluding sex education
      and wellness).
    </td>
    <td>Text and images</td>
  </tr>
  <tr>
    <td>`sexual/minors`</td>
    <td>
      Sexual content that includes an individual who is under 18 years old.
    </td>
    <td>Text only</td>
  </tr>
  <tr>
    <td>`violence`</td>
    <td>Content that depicts death, violence, or physical injury.</td>
    <td>Text and images</td>
  </tr>
  <tr>
    <td>`violence/graphic`</td>
    <td>
      Content that depicts death, violence, or physical injury in graphic
      detail.
    </td>
    <td>Text and images</td>
  </tr>
</table>
``````
:::
:::

