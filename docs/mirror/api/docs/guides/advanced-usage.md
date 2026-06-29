---
title: "高级用法"
description: "Discover advanced usage techniques for OpenAI's API, including reproducible outputs, token management, and parameter settings."
outline: deep
---

# 高级用法

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/advanced-usage](https://developers.openai.com/api/docs/guides/advanced-usage)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/advanced-usage.md](https://developers.openai.com/api/docs/guides/advanced-usage.md)
- 抓取时间：2026-06-27T05:53:57.459Z
- Checksum：`024310aaa276629876ba1672351a3c12d31191570bc80d1db3a6cf3b6c31dd4d`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
OpenAI 的文本生成模型（通常称为生成式预训练 Transformer 或大型语言模型）已经过训练，能够理解自然语言、代码和图像。这些模型会根据输入提供文本输出。给这些模型的文本输入也称为“prompt”。设计 prompt 本质上就是你“编程”大型语言模型的方式，通常是通过提供指令或一些示例，说明如何成功完成任务。

## 可复现输出

Chat Completions 默认是非确定性的（这意味着模型输出可能因请求而异）。即便如此，我们通过让你使用 [seed](https://developers.openai.com/api/docs/api-reference/chat/create#chat-create-seed) 参数和 [system_fingerprint](https://developers.openai.com/api/docs/api-reference/completions/object#completions/object-system_fingerprint) 响应字段，提供了一定程度的确定性输出控制。

要在多次 API 调用之间获得（大体上）确定性的输出，你可以：

- 将 [seed](https://developers.openai.com/api/docs/api-reference/chat/create#chat-create-seed) 参数设为你选择的任意整数，并在希望输出确定的请求之间使用相同的值。
- 确保所有其他参数（例如 `prompt` 或 `temperature`）在各次请求中完全相同。

有时，由于 OpenAI 需要在我们这端更改模型配置，确定性可能会受到影响。为了帮助你跟踪这些变化，我们暴露了 [system_fingerprint](https://developers.openai.com/api/docs/api-reference/chat/object#chat/object-system_fingerprint) 字段。如果该值不同，你可能会因为我们系统中的更改而看到不同的输出。

&lt;a
  href="https://cookbook.openai.com/examples/reproducible_outputs_with_the_seed_parameter"
  target="_blank"
  rel="noreferrer"
&gt;
  



    在 OpenAI cookbook 中探索新的 seed 参数




## 管理 token

语言模型以称为 token 的片段读取和写入文本。在英语中，一个 token 可以短到一个字符，也可以长到一个单词（例如 `a` 或 ` apple`）；在某些语言中，token 甚至可能短于一个字符，或长于一个单词。

粗略经验是，对于英文文本，1 个 token 大约相当于 4 个字符或 0.75 个单词。

请查看我们的 
  &lt;a
    href="https://platform.openai.com/tokenizer"
    target="_blank"
    rel="noreferrer"
  &gt;
    Tokenizer 工具

  来测试具体字符串，并查看它们如何被转换为 token。

例如，字符串 `"ChatGPT is great!"` 会被编码为六个 token：`["Chat", "G", "PT", " is", " great", "!"]`。

API 调用中的 token 总数会影响：

- API 调用的费用，因为你按 token 付费
- API 调用耗时，因为写入更多 token 需要更多时间
- API 调用能否正常工作，因为总 token 数必须低于模型的最大限制（`gpt-3.5-turbo` 为 4097 个 token）

输入和输出 token 都会计入这些数量。例如，如果你的 API 调用在消息输入中使用了 10 个 token，并在消息输出中收到 20 个 token，你将按 30 个 token 计费。不过请注意，对于某些模型，输入 token 和输出 token 的单价不同（更多信息请参阅[定价](https://openai.com/api/pricing)页面）。

要查看一次 API 调用使用了多少 token，请检查 API 响应中的 `usage` 字段（例如 `response['usage']['total_tokens']`）。

像 `gpt-3.5-turbo` 和 `gpt-4-turbo-preview` 这样的聊天模型与 completions API 中可用的模型以相同方式使用 token；但由于它们基于消息的格式，更难计算一段对话会使用多少 token。



下面是一个示例函数，用于统计传给 `gpt-3.5-turbo-0613` 的消息的 token 数。

消息被转换为 token 的确切方式可能会随模型而变。因此，当未来模型版本发布时，此函数返回的答案可能只是近似值。

```python
def num_tokens_from_messages(messages, model="gpt-3.5-turbo-0613"):
  """Returns the number of tokens used by a list of messages."""
  try:
      encoding = tiktoken.encoding_for_model(model)
  except KeyError:
      encoding = tiktoken.get_encoding("cl100k_base")
  if model == "gpt-3.5-turbo-0613":  # note: future models may deviate from this
      num_tokens = 0
      for message in messages:
          num_tokens += 4  # every message follows <im_start>{role/name}\n{content}<im_end>\n
          for key, value in message.items():
              num_tokens += len(encoding.encode(value))
              if key == "name":  # if there's a name, the role is omitted
                  num_tokens += -1  # role is always required and always 1 token
      num_tokens += 2  # every reply is primed with <im_start>assistant
      return num_tokens
  else:
      raise NotImplementedError(f"""num_tokens_from_messages() is not presently implemented for model {model}.""")
```


接下来，创建一条消息并将其传给上面定义的函数来查看 token 计数；这应该与 API `usage` 参数返回的值匹配：

```python
messages = [
  {"role": "system", "content": "You are a helpful, pattern-following assistant that translates corporate jargon into plain English."},
  {"role": "system", "name":"example_user", "content": "New synergies will help drive top-line growth."},
  {"role": "system", "name": "example_assistant", "content": "Things working well together will increase revenue."},
  {"role": "system", "name":"example_user", "content": "Let's circle back when we have more bandwidth to touch base on opportunities for increased leverage."},
  {"role": "system", "name": "example_assistant", "content": "Let's talk later when we're less busy about how to do better."},
  {"role": "user", "content": "This late pivot means we don't have time to boil the ocean for the client deliverable."},
]

model = "gpt-3.5-turbo-0613"

print(f"{num_tokens_from_messages(messages, model)} prompt tokens counted.")
# Should show ~126 total_tokens
```


要确认上面函数生成的数量与 API 返回的数量相同，请创建一个新的 Chat Completion：

```python
# example token count from the OpenAI API
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
  model=model,
  messages=messages,
  temperature=0,
)

print(f'{response.usage.prompt_tokens} prompt tokens used.')
```



要在不发起 API 调用的情况下查看文本字符串中有多少 token，请使用 OpenAI 的 [tiktoken](https://github.com/openai/tiktoken) Python 库。示例代码可见于 OpenAI Cookbook 的[如何使用 tiktoken 统计 token](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken)指南。

传给 API 的每条消息都会消耗其 content、role 和其他字段中的 token 数量，此外还会因为幕后格式化而额外消耗少量 token。未来这可能会略有变化。

如果对话中的 token 太多，无法放入模型的最大限制（例如 `gpt-3.5-turbo` 超过 4097 个 token，或 `gpt-4o` 超过 128k 个 token），你就必须截断、省略或以其他方式压缩文本，直到它能够放入限制范围。请注意，如果某条消息从 messages 输入中被移除，模型会失去关于它的所有信息。

请注意，非常长的对话更有可能收到不完整回复。例如，一个长度为 4090 个 token 的 `gpt-3.5-turbo` 对话，其回复会在仅 6 个 token 后被截断。

## 参数详情

### 频率惩罚和存在惩罚

[Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat/create) 和 [Legacy Completions API](https://developers.openai.com/api/docs/api-reference/completions) 中的频率惩罚和存在惩罚可用于降低采样重复 token 序列的可能性。



它们通过直接修改 logits（未归一化的对数概率），加入一个加性项来起作用。

```python
mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
```

其中：

- `mu[j]` 是第 j 个 token 的 logits
- `c[j]` 是在当前位置之前该 token 被采样的次数
- `float(c[j] &gt; 0)` 在 `c[j] &gt; 0` 时为 1，否则为 0
- `alpha_frequency` 是频率惩罚系数
- `alpha_presence` 是存在惩罚系数

如我们所见，存在惩罚是一次性的加性项，作用于所有至少采样过一次的 token；频率惩罚则是一个与特定 token 已被采样次数成比例的贡献项。



如果目标只是稍微减少重复采样，惩罚系数的合理取值大约在 0.1 到 1 之间。如果目标是强力抑制重复，可以把系数提高到 2，但这可能会明显降低采样质量。负值可用于提高重复出现的可能性。

### Token 对数概率

当请求 [Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat/create) 和 [Legacy Completions API](https://developers.openai.com/api/docs/api-reference/completions) 中的 [logprobs](https://developers.openai.com/api/docs/api-reference/chat/create#chat-create-logprobs) 参数时，它会提供每个输出 token 的对数概率，并在每个 token 位置旁边给出数量有限的最可能 token 及其对数概率。在某些情况下，这有助于评估模型对其输出的置信度，或检查模型可能给出的其他备选响应。

### 其他参数

请参阅完整的 [API reference 文档](https://platform.openai.com/docs/api-reference/chat)了解更多信息。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
OpenAI's text generation models (often called generative pre-trained transformers or large language models) have been trained to understand natural language, code, and images. The models provide text outputs in response to their inputs. The text inputs to these models are also referred to as "prompts". Designing a prompt is essentially how you “program” a large language model model, usually by providing instructions or some examples of how to successfully complete a task.

## Reproducible outputs

Chat Completions are non-deterministic by default (which means model outputs may differ from request to request). That being said, we offer some control towards deterministic outputs by giving you access to the [seed](https://developers.openai.com/api/docs/api-reference/chat/create#chat-create-seed) parameter and the [system_fingerprint](https://developers.openai.com/api/docs/api-reference/completions/object#completions/object-system_fingerprint) response field.

To receive (mostly) deterministic outputs across API calls, you can:

- Set the [seed](https://developers.openai.com/api/docs/api-reference/chat/create#chat-create-seed) parameter to any integer of your choice and use the same value across requests you'd like deterministic outputs for.
- Ensure all other parameters (like `prompt` or `temperature`) are the exact same across requests.

Sometimes, determinism may be impacted due to necessary changes OpenAI makes to model configurations on our end. To help you keep track of these changes, we expose the [system_fingerprint](https://developers.openai.com/api/docs/api-reference/chat/object#chat/object-system_fingerprint) field. If this value is different, you may see different outputs due to changes we've made on our systems.

<a
  href="https://cookbook.openai.com/examples/reproducible_outputs_with_the_seed_parameter"
  target="_blank"
  rel="noreferrer"
>
  

<span slot="icon">
      </span>
    Explore the new seed parameter in the OpenAI cookbook


</a>

## Managing tokens

Language models read and write text in chunks called tokens. In English, a token can be as short as one character or as long as one word (e.g., `a` or ` apple`), and in some languages tokens can be even shorter than one character or even longer than one word.

As a rough rule of thumb, 1 token is approximately 4 characters or 0.75 words for English text.

Check out our 
  <a
    href="https://platform.openai.com/tokenizer"
    target="_blank"
    rel="noreferrer"
  >
    Tokenizer tool
  </a> 
  to test specific strings and see how they are translated into tokens.

For example, the string `"ChatGPT is great!"` is encoded into six tokens: `["Chat", "G", "PT", " is", " great", "!"]`.

The total number of tokens in an API call affects:

- How much your API call costs, as you pay per token
- How long your API call takes, as writing more tokens takes more time
- Whether your API call works at all, as total tokens must be below the model's maximum limit (4097 tokens for `gpt-3.5-turbo`)

Both input and output tokens count toward these quantities. For example, if your API call used 10 tokens in the message input and you received 20 tokens in the message output, you would be billed for 30 tokens. Note however that for some models the price per token is different for tokens in the input vs. the output (see the [pricing](https://openai.com/api/pricing) page for more information).

To see how many tokens are used by an API call, check the `usage` field in the API response (e.g., `response['usage']['total_tokens']`).

Chat models like `gpt-3.5-turbo` and `gpt-4-turbo-preview` use tokens in the same way as the models available in the completions API, but because of their message-based formatting, it's more difficult to count how many tokens will be used by a conversation.



Below is an example function for counting tokens for messages passed to `gpt-3.5-turbo-0613`.

The exact way that messages are converted into tokens may change from model to model. So when future model versions are released, the answers returned by this function may be only approximate.

```python
def num_tokens_from_messages(messages, model="gpt-3.5-turbo-0613"):
  """Returns the number of tokens used by a list of messages."""
  try:
      encoding = tiktoken.encoding_for_model(model)
  except KeyError:
      encoding = tiktoken.get_encoding("cl100k_base")
  if model == "gpt-3.5-turbo-0613":  # note: future models may deviate from this
      num_tokens = 0
      for message in messages:
          num_tokens += 4  # every message follows <im_start>{role/name}\n{content}<im_end>\n
          for key, value in message.items():
              num_tokens += len(encoding.encode(value))
              if key == "name":  # if there's a name, the role is omitted
                  num_tokens += -1  # role is always required and always 1 token
      num_tokens += 2  # every reply is primed with <im_start>assistant
      return num_tokens
  else:
      raise NotImplementedError(f"""num_tokens_from_messages() is not presently implemented for model {model}.""")
```


Next, create a message and pass it to the function defined above to see the token count, this should match the value returned by the API usage parameter:

```python
messages = [
  {"role": "system", "content": "You are a helpful, pattern-following assistant that translates corporate jargon into plain English."},
  {"role": "system", "name":"example_user", "content": "New synergies will help drive top-line growth."},
  {"role": "system", "name": "example_assistant", "content": "Things working well together will increase revenue."},
  {"role": "system", "name":"example_user", "content": "Let's circle back when we have more bandwidth to touch base on opportunities for increased leverage."},
  {"role": "system", "name": "example_assistant", "content": "Let's talk later when we're less busy about how to do better."},
  {"role": "user", "content": "This late pivot means we don't have time to boil the ocean for the client deliverable."},
]

model = "gpt-3.5-turbo-0613"

print(f"{num_tokens_from_messages(messages, model)} prompt tokens counted.")
# Should show ~126 total_tokens
```


To confirm the number generated by our function above is the same as what the API returns, create a new Chat Completion:

```python
# example token count from the OpenAI API
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
  model=model,
  messages=messages,
  temperature=0,
)

print(f'{response.usage.prompt_tokens} prompt tokens used.')
```



To see how many tokens are in a text string without making an API call, use OpenAI’s [tiktoken](https://github.com/openai/tiktoken) Python library. Example code can be found in the OpenAI Cookbook’s guide on [how to count tokens with tiktoken](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken).

Each message passed to the API consumes the number of tokens in the content, role, and other fields, plus a few extra for behind-the-scenes formatting. This may change slightly in the future.

If a conversation has too many tokens to fit within a model’s maximum limit (e.g., more than 4097 tokens for `gpt-3.5-turbo` or more than 128k tokens for `gpt-4o`), you will have to truncate, omit, or otherwise shrink your text until it fits. Beware that if a message is removed from the messages input, the model will lose all knowledge of it.

Note that very long conversations are more likely to receive incomplete replies. For example, a `gpt-3.5-turbo` conversation that is 4090 tokens long will have its reply cut off after just 6 tokens.

## Parameter details

### Frequency and presence penalties

The frequency and presence penalties found in the [Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat/create) and [Legacy Completions API](https://developers.openai.com/api/docs/api-reference/completions) can be used to reduce the likelihood of sampling repetitive sequences of tokens.



They work by directly modifying the logits (un-normalized log-probabilities) with an additive contribution.

```python
mu[j] -> mu[j] - c[j] * alpha_frequency - float(c[j] > 0) * alpha_presence
```

Where:

- `mu[j]` is the logits of the j-th token
- `c[j]` is how often that token was sampled prior to the current position
- `float(c[j] > 0)` is 1 if `c[j] > 0` and 0 otherwise
- `alpha_frequency` is the frequency penalty coefficient
- `alpha_presence` is the presence penalty coefficient

As we can see, the presence penalty is a one-off additive contribution that applies to all tokens that have been sampled at least once and the frequency penalty is a contribution that is proportional to how often a particular token has already been sampled.



Reasonable values for the penalty coefficients are around 0.1 to 1 if the aim is to just reduce repetitive samples somewhat. If the aim is to strongly suppress repetition, then one can increase the coefficients up to 2, but this can noticeably degrade the quality of samples. Negative values can be used to increase the likelihood of repetition.

### Token log probabilities

The [logprobs](https://developers.openai.com/api/docs/api-reference/chat/create#chat-create-logprobs) parameter found in the [Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat/create) and [Legacy Completions API](https://developers.openai.com/api/docs/api-reference/completions), when requested, provides the log probabilities of each output token, and a limited number of the most likely tokens at each token position alongside their log probabilities. This can be useful in some cases to assess the confidence of the model in its output, or to examine alternative responses the model might have given.

### Other parameters

See the full [API reference documentation](https://platform.openai.com/docs/api-reference/chat) to learn more.
``````
:::
:::

