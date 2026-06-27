---
status: needs-review
sourceId: 8cbcdecb7c41
sourceChecksum: 8cbcdecb7c4143f80ed1df3ec2a22b9f004c6df7c4a3b3f6623dfdf57ef90355
sourceUrl: https://developers.openai.com/api/docs/guides/completions
translatedAt: 2026-06-27T17:13:53.3182238+08:00
translator: codex-gpt-5.5-xhigh
---

# Completions API

Completions API endpoint 已于 2023 年 7 月收到最后一次更新，它的接口不同于新的 Chat Completions endpoint。它的输入不是消息列表，而是一个称为 `prompt` 的自由格式文本字符串。

旧版 Completions API 调用示例如下：

```python
from openai import OpenAI
client = OpenAI()

response = client.completions.create(
model="gpt-3.5-turbo-instruct",
prompt="Write a tagline for an ice cream shop."
)
```

```javascript
const completion = await openai.completions.create({
model: 'gpt-3.5-turbo-instruct',
prompt: 'Write a tagline for an ice cream shop.'
});
```


请参阅完整的 [API reference documentation](https://platform.openai.com/docs/api-reference/completions) 了解更多信息。

#### 插入文本

除了作为前缀处理的标准 prompt 之外，completions endpoint 还支持通过提供 [suffix](https://developers.openai.com/api/docs/api-reference/completions/create#completions-create-suffix) 来插入文本。在撰写长文本、段落衔接、遵循大纲或引导模型走向某个结尾时，自然会出现这种需求。这也适用于代码，可用于在函数或文件中间插入内容。



为了说明 suffix 上下文如何影响生成文本，请考虑这个 prompt：“今天我决定做一个大改变。”人们可以想象出许多种续写方式。但如果我们现在提供故事结尾：“我的新发型收到了很多赞美！”，预期的补全就会变得清晰。

> 我曾就读于波士顿大学。拿到学位后，我决定做出一个改变**。一个大改变！**

> **我收拾行李，搬到了美国西海岸。**

> 现在，我怎么也看不够太平洋！

通过向模型提供额外上下文，可以显著提升可控性。不过，这对模型来说也是一个约束更强、难度更高的任务。为了获得最佳结果，我们建议如下：

**使用 `max_tokens` > 256。** 模型更擅长插入较长的补全文本。如果 `max_tokens` 太小，模型可能在能够衔接到 suffix 之前就被截断。请注意，即使使用较大的 `max_tokens`，你也只会按实际生成的 token 数量付费。

**优先选择 `finish_reason` == "stop"。** 当模型到达自然停止点或用户提供的 stop sequence 时，它会将 `finish_reason` 设为 "stop"。这表明模型已经很好地衔接到了 suffix，是补全质量的良好信号。当使用 n > 1 或重新采样（见下一点）在多个补全之间选择时，这一点尤其相关。

**重新采样 3-5 次。** 虽然几乎所有补全都能连接到 prefix，但在更难的情况下，模型可能难以连接到 suffix。我们发现，在这类情况下，重新采样 3 或 5 次（或使用 best_of 且 k=3,5），并选择 `finish_reason` 为 "stop" 的样本，是一种有效做法。重新采样时，你通常会希望使用更高的 temperature 来增加多样性。

注意：如果所有返回样本的 `finish_reason` 都是 "length"，很可能是 max_tokens 太小，模型在自然连接 prompt 和 suffix 之前就用完了 token。请考虑先增加 `max_tokens`，再重新采样。

**尝试提供更多线索。** 在某些情况下，为了更好地帮助模型生成，你可以通过给出几个模式示例来提供线索，让模型可以据此决定自然停止的位置。

> 如何制作一杯美味的热巧克力：
>
> 1.** 烧水**
> **2. 将热巧克力粉放入杯中**
> **3. 向杯中加入沸水** 4. 享用热巧克力

> 1. 狗是忠诚的动物。
> 2. 狮子是凶猛的动物。
> 3. 海豚**是爱玩的动物。**
> 4. 马是威严的动物。



### Completions 响应格式

Completions API 响应示例如下：

```
{
  "choices": [
    {
      "finish_reason": "length",
      "index": 0,
      "logprobs": null,
      "text": "\n\n\"Let Your Sweet Tooth Run Wild at Our Creamy Ice Cream Shack"
    }
  ],
  "created": 1683130927,
  "id": "cmpl-7C9Wxi9Du4j1lQjdjhxBlO22M61LD",
  "model": "gpt-3.5-turbo-instruct",
  "object": "text_completion",
  "usage": {
    "completion_tokens": 16,
    "prompt_tokens": 10,
    "total_tokens": 26
  }
}
```

在 Python 中，可以用 `response['choices'][0]['text']` 提取输出。

响应格式类似于 Chat Completions API 的响应格式。

### 插入文本

除了作为前缀处理的标准 prompt 之外，completions endpoint 还支持通过提供 [suffix](https://developers.openai.com/api/docs/api-reference/completions/create#completions-create-suffix) 来插入文本。在撰写长文本、段落衔接、遵循大纲或引导模型走向某个结尾时，自然会出现这种需求。这也适用于代码，可用于在函数或文件中间插入内容。



为了说明 suffix 上下文如何影响生成文本，请考虑这个 prompt：“今天我决定做一个大改变。”人们可以想象出许多种续写方式。但如果我们现在提供故事结尾：“我的新发型收到了很多赞美！”，预期的补全就会变得清晰。

> 我曾就读于波士顿大学。拿到学位后，我决定做出一个改变**。一个大改变！**

> **我收拾行李，搬到了美国西海岸。**

> 现在，我怎么也看不够太平洋！

通过向模型提供额外上下文，可以显著提升可控性。不过，这对模型来说也是一个约束更强、难度更高的任务。为了获得最佳结果，我们建议如下：

**使用 `max_tokens` > 256。** 模型更擅长插入较长的补全文本。如果 `max_tokens` 太小，模型可能在能够衔接到 suffix 之前就被截断。请注意，即使使用较大的 `max_tokens`，你也只会按实际生成的 token 数量付费。

**优先选择 `finish_reason` == "stop"。** 当模型到达自然停止点或用户提供的 stop sequence 时，它会将 `finish_reason` 设为 "stop"。这表明模型已经很好地衔接到了 suffix，是补全质量的良好信号。当使用 n > 1 或重新采样（见下一点）在多个补全之间选择时，这一点尤其相关。

**重新采样 3-5 次。** 虽然几乎所有补全都能连接到 prefix，但在更难的情况下，模型可能难以连接到 suffix。我们发现，在这类情况下，重新采样 3 或 5 次（或使用 best_of 且 k=3,5），并选择 `finish_reason` 为 "stop" 的样本，是一种有效做法。重新采样时，你通常会希望使用更高的 temperature 来增加多样性。

注意：如果所有返回样本的 `finish_reason` 都是 "length"，很可能是 max_tokens 太小，模型在自然连接 prompt 和 suffix 之前就用完了 token。请考虑先增加 `max_tokens`，再重新采样。

**尝试提供更多线索。** 在某些情况下，为了更好地帮助模型生成，你可以通过给出几个模式示例来提供线索，让模型可以据此决定自然停止的位置。

> 如何制作一杯美味的热巧克力：
>
> 1.** 烧水**
> **2. 将热巧克力粉放入杯中**
> **3. 向杯中加入沸水** 4. 享用热巧克力

> 1. 狗是忠诚的动物。
> 2. 狮子是凶猛的动物。
> 3. 海豚**是爱玩的动物。**
> 4. 马是威严的动物。



## Chat Completions 与 Completions

通过使用单条 user message 构造请求，可以让 Chat Completions 格式与 completions 格式相似。例如，可以用下面的 completions prompt 将英文翻译成法语：

```
Translate the following English text to French: "{text}"
```

等价的 chat prompt 如下：

```
[{"role": "user", "content": 'Translate the following English text to French: "{text}"'}]
```

同样，completions API 也可以通过相应地格式化输入来模拟用户和 assistant 之间的聊天，详见[相关示例](https://platform.openai.com/playground/p/default-chat?model=gpt-3.5-turbo-instruct)。

这些 API 之间的差异在于各自可用的底层模型。Chat Completions API 支持当前的 GPT 模型，例如 [`gpt-5.5`](https://developers.openai.com/api/docs/models/gpt-5.5)，以及成本更低的选项，例如 [`gpt-5.4-mini`](https://developers.openai.com/api/docs/models/gpt-5.4-mini)。
