---
title: "Image generation"
description: "Learn how to generate or edit images with the OpenAI API and image generation models."
outline: deep
---

# Image generation

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/image-generation](https://developers.openai.com/api/docs/guides/image-generation)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/image-generation.md](https://developers.openai.com/api/docs/guides/image-generation.md)
- 抓取时间：2026-06-27T05:54:03.109Z
- Checksum：`cb9b1a99d1c9283f8aebee0018178fec39a21185ffb592b0446fce9cf34a3523`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览

OpenAI API 允许你使用 GPT Image models 根据文本 prompt 生成和编辑图像，包括我们最新的 `gpt-image-2`。你可以通过两个 API 访问图像生成能力：

### Image API

从 `gpt-image-1` 及后续模型开始，[Image API](https://developers.openai.com/api/docs/api-reference/images) 提供两个 endpoint，每个 endpoint 都有不同能力：

- **Generations**：根据文本 prompt 从零开始[生成图像](/mirror/api/docs/guides/image-generation#generate-images)
- **Edits**：使用新的 prompt [修改已有图像](/mirror/api/docs/guides/image-generation#edit-images)，可以局部修改，也可以整体修改

Image API 还为支持 variations 的模型提供 variations endpoint，例如 DALL·E 2。

### Responses API

[Responses API](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-tools) 允许你把图像生成作为对话或多步骤流程的一部分。它支持把图像生成作为[内置工具](/mirror/api/docs/guides/tools)，并在上下文中接受图像输入和输出。

与 Image API 相比，它增加了：

- **多轮编辑**：通过 prompting 对图像进行迭代式高保真编辑
- **灵活输入**：接受图像 [File](https://developers.openai.com/api/docs/api-reference/files) ID 作为输入图像，而不仅限于字节数据

Responses API 的图像生成工具使用自己的 GPT Image model 选择机制。有关支持调用此工具的主线模型详情，请参阅下方的[支持的模型](/mirror/api/docs/guides/image-generation#supported-models)。

### 选择合适的 API

- 如果你只需要根据一个 prompt 生成或编辑单张图像，Image API 是最佳选择。
- 如果你想用 GPT Image 构建可对话、可编辑的图像体验，请选择 Responses API。

使用 Image API 时，你会直接选择一个 GPT Image model。使用 Responses API 时，你会选择一个支持图像生成工具的主线模型；该工具会处理 GPT Image model 选择。Responses API 请求除了图像生成成本外，还包含主线模型的 token 用量。

两个 API 都允许你通过调整 quality、size、format 和 compression 来[自定义输出](/mirror/api/docs/guides/image-generation#customize-image-output)。透明背景取决于模型支持情况。

本指南聚焦于 GPT Image。

为确保这些模型得到负责任的使用，在使用 GPT Image models（包括 `gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 和 `gpt-image-1-mini`）之前，你可能需要在 [developer console](https://platform.openai.com/settings/organization/general) 中完成 [API Organization
  Verification](https://help.openai.com/en/articles/10910291-api-organization-verification)。

&lt;div
  className="not-prose"
  style=&#123;&#123; float: "right", margin: "10px 0 10px 10px" &#125;&#125;
&gt;
  &lt;img src="https://cdn.openai.com/API/docs/images/mug.png"
    alt="木桌上的米色咖啡杯"
    style=&#123;&#123; height: "180px", width: "auto", borderRadius: "8px" &#125;&#125;
  /&gt;


## 生成图像

你可以使用[图像生成 endpoint](https://developers.openai.com/api/docs/api-reference/images/create)，根据文本 prompt 创建图像；也可以使用 Responses API 中的[图像生成工具](/mirror/api/docs/guides/tools)，把图像生成作为对话的一部分。

要进一步了解如何自定义输出（size、quality、format、compression），请参阅下方的[自定义图像输出](/mirror/api/docs/guides/image-generation#customize-image-output)小节。

你可以设置 `n` 参数，在单个请求中一次生成多张图像（默认情况下，API 返回一张图像）。




Image API
    生成图像

```javascript
import OpenAI from "openai";
import fs from "fs";
const openai = new OpenAI();

const prompt = `
A children's book drawing of a veterinarian using a stethoscope to 
listen to the heartbeat of a baby otter.
`;

const result = await openai.images.generate({
    model: "gpt-image-2",
    prompt,
});

// Save the image to a file
const image_base64 = result.data[0].b64_json;
const image_bytes = Buffer.from(image_base64, "base64");
fs.writeFileSync("otter.png", image_bytes);
```

```python
from openai import OpenAI
import base64
client = OpenAI()

prompt = """
A children's book drawing of a veterinarian using a stethoscope to 
listen to the heartbeat of a baby otter.
"""

result = client.images.generate(
    model="gpt-image-2",
    prompt=prompt
)

image_base64 = result.data[0].b64_json
image_bytes = base64.b64decode(image_base64)

# Save the image to a file
with open("otter.png", "wb") as f:
    f.write(image_bytes)
```

```bash
curl -X POST "https://api.openai.com/v1/images/generations" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-type: application/json" \
    -d '{
        "model": "gpt-image-2",
        "prompt": "A children'\''s book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter."
    }' | jq -r '.data[0].b64_json' | base64 --decode > otter.png
```

```bash
openai images generate \
  --model gpt-image-2 \
  --prompt "A children's book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter." \
  --raw-output \
  --transform 'data.0.b64_json' | base64 --decode > otter.png
```



Responses API
    生成图像

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools: [{type: "image_generation"}],
});

// Save the image to a file
const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("otter.png", Buffer.from(imageBase64, "base64"));
}
```

```python
from openai import OpenAI
import base64

client = OpenAI() 

response = client.responses.create(
    model="gpt-5.5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

# Save the image to a file
image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]
    
if image_data:
    image_base64 = image_data[0]
    with open("otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```





### 多轮图像生成

使用 Responses API 时，你可以通过在上下文中提供 image generation call outputs（也可以只使用 image ID），或通过使用 [`previous_response_id` 参数](/mirror/api/docs/guides/conversation-state#openai-apis-for-conversation-state)，构建涉及图像生成的多轮对话。
这让你能够跨多个回合迭代图像：细化 prompts、应用新指令，并随着对话推进不断演化视觉输出。

使用 Responses API 图像生成工具时，受支持的工具模型可以选择生成新图像，或编辑对话中已经存在的图像。可选的 `action` 参数控制这种行为：保留 `action: "auto"` 让模型决定；设置 `action: "generate"` 始终创建新图像；或当上下文中存在图像时，设置 `action: "edit"` 强制编辑。

使用 action 强制创建图像

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools: [{type: "image_generation", action: "generate"}],
});

// Save the image to a file
const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("otter.png", Buffer.from(imageBase64, "base64"));
}
```

```python
from openai import OpenAI
import base64

client = OpenAI() 

response = client.responses.create(
    model="gpt-5.5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation", "action": "generate"}],
)

# Save the image to a file
image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]
    
if image_data:
    image_base64 = image_data[0]
    with open("otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```


如果你在上下文中没有提供图像却强制使用 `edit`，调用会返回错误。请把 `action` 保持为 `auto`，让模型决定何时生成或编辑。




使用 previous response ID
    多轮图像生成

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5.5",
  input:
    "Generate an image of gray tabby cat hugging an otter with an orange scarf",
  tools: [{ type: "image_generation" }],
});

const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("cat_and_otter.png", Buffer.from(imageBase64, "base64"));
}

// Follow up

const response_fwup = await openai.responses.create({
  model: "gpt-5.5",
  previous_response_id: response.id,
  input: "Now make it look realistic",
  tools: [{ type: "image_generation" }],
});

const imageData_fwup = response_fwup.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData_fwup.length > 0) {
  const imageBase64 = imageData_fwup[0];
  const fs = await import("fs");
  fs.writeFileSync(
    "cat_and_otter_realistic.png",
    Buffer.from(imageBase64, "base64")
  );
}
```

```python
from openai import OpenAI
import base64

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if image_data:
    image_base64 = image_data[0]

    with open("cat_and_otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))


# Follow up

response_fwup = client.responses.create(
    model="gpt-5.5",
    previous_response_id=response.id,
    input="Now make it look realistic",
    tools=[{"type": "image_generation"}],
)

image_data_fwup = [
    output.result
    for output in response_fwup.output
    if output.type == "image_generation_call"
]

if image_data_fwup:
    image_base64 = image_data_fwup[0]
    with open("cat_and_otter_realistic.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```



使用 image ID
    多轮图像生成

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5.5",
  input:
    "Generate an image of gray tabby cat hugging an otter with an orange scarf",
  tools: [{ type: "image_generation" }],
});

const imageGenerationCalls = response.output.filter(
  (output) => output.type === "image_generation_call"
);

const imageData = imageGenerationCalls.map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("cat_and_otter.png", Buffer.from(imageBase64, "base64"));
}

// Follow up

const response_fwup = await openai.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content: [{ type: "input_text", text: "Now make it look realistic" }],
    },
    {
      type: "image_generation_call",
      id: imageGenerationCalls[0].id,
    },
  ],
  tools: [{ type: "image_generation" }],
});

const imageData_fwup = response_fwup.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData_fwup.length > 0) {
  const imageBase64 = imageData_fwup[0];
  const fs = await import("fs");
  fs.writeFileSync(
    "cat_and_otter_realistic.png",
    Buffer.from(imageBase64, "base64")
  );
}
```

```python
import openai
import base64

response = openai.responses.create(
    model="gpt-5.5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

image_generation_calls = [
    output
    for output in response.output
    if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
    image_base64 = image_data[0]

    with open("cat_and_otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))


# Follow up

response_fwup = openai.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [{"type": "input_text", "text": "Now make it look realistic"}],
        },
        {
            "type": "image_generation_call",
            "id": image_generation_calls[0].id,
        },
    ],
    tools=[{"type": "image_generation"}],
)

image_data_fwup = [
    output.result
    for output in response_fwup.output
    if output.type == "image_generation_call"
]

if image_data_fwup:
    image_base64 = image_data_fwup[0]
    with open("cat_and_otter_realistic.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```





#### 结果






          “生成一张灰色虎斑猫抱着一只戴橙色围巾的水獭的图像”

        &lt;td
          style=&#123;&#123;
            textAlign: "right",
            verticalAlign: "top",
            paddingBottom: "16px",
          &#125;&#125;
        &gt;
          &lt;img src="https://cdn.openai.com/API/docs/images/cat_and_otter.png"
            alt="一只猫和一只水獭"
            style=&#123;&#123; width: "200px", borderRadius: "8px" &#125;&#125;
          /&gt;




          “现在让它看起来写实一些”


          &lt;img src="https://cdn.openai.com/API/docs/images/cat_and_otter_realistic.png"
            alt="一只猫和一只水獭"
            style=&#123;&#123; width: "200px", borderRadius: "8px" &#125;&#125;
          /&gt;






### Streaming

Responses API 和 Image API 都支持流式图像生成。你可以在 API 生成图像时流式接收部分图像，从而提供更具交互性的体验。

你可以调整 `partial_images` 参数，以接收 0 到 3 张 partial images。

- 如果将 `partial_images` 设置为 0，你只会收到最终图像。
- 对于大于 0 的值，如果完整图像生成得更快，你收到的 partial images 数量可能少于请求数量。




Responses API
    流式生成图像

```javascript
import OpenAI from "openai";
import fs from "fs";
const openai = new OpenAI();

function saveBase64Image(filename, imageBase64) {
  const imageBuffer = Buffer.from(imageBase64, "base64");
  fs.writeFileSync(filename, imageBuffer);
}

const stream = await openai.responses.create({
  model: "gpt-5.5",
  input:
    "Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
  stream: true,
  tools: [{ type: "image_generation", partial_images: 2 }],
});

for await (const event of stream) {
  if (event.type === "response.image_generation_call.partial_image") {
    const idx = event.partial_image_index;
    saveBase64Image(`river-partial-${idx}.png`, event.partial_image_b64);
  } else if (event.type === "response.completed") {
    const imageData = event.response.output
      .filter((output) => output.type === "image_generation_call")
      .map((output) => output.result);

    if (imageData.length > 0) {
      saveBase64Image("river-final.png", imageData[0]);
    }
  }
}
```

```python
from openai import OpenAI
import base64

client = OpenAI()

def save_base64_image(filename, image_base64):
    image_bytes = base64.b64decode(image_base64)
    with open(filename, "wb") as f:
        f.write(image_bytes)

stream = client.responses.create(
    model="gpt-5.5",
    input="Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
    stream=True,
    tools=[{"type": "image_generation", "partial_images": 2}],
)

for event in stream:
    if event.type == "response.image_generation_call.partial_image":
        idx = event.partial_image_index
        save_base64_image(f"river-partial-{idx}.png", event.partial_image_b64)
    elif event.type == "response.completed":
        image_data = [
            output.result
            for output in event.response.output
            if output.type == "image_generation_call"
        ]

        if image_data:
            save_base64_image("river-final.png", image_data[0])
```



Image API
    流式生成图像

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const prompt =
  "Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape";
const stream = await openai.images.generate({
  prompt: prompt,
  model: "gpt-image-2",
  stream: true,
  partial_images: 2,
});

for await (const event of stream) {
  if (event.type === "image_generation.partial_image") {
    const idx = event.partial_image_index;
    const imageBase64 = event.b64_json;
    const imageBuffer = Buffer.from(imageBase64, "base64");
    fs.writeFileSync(`river${idx}.png`, imageBuffer);
  }
}
```

```python
from openai import OpenAI
import base64

client = OpenAI()

stream = client.images.generate(
    prompt="Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
    model="gpt-image-2",
    stream=True,
    partial_images=2,
)

for event in stream:
    if event.type == "image_generation.partial_image":
        idx = event.partial_image_index
        image_base64 = event.b64_json
        image_bytes = base64.b64decode(image_base64)
        with open(f"river{idx}.png", "wb") as f:
            f.write(image_bytes)
```





#### 结果



| Partial 1                                                                                                                       | Partial 2                                                                                                                       | Final image                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| &lt;img className="images-example-image" src="https://cdn.openai.com/API/docs/images/imgen1p5-streaming1.png" alt="第 1 张 partial" /&gt; | &lt;img className="images-example-image" src="https://cdn.openai.com/API/docs/images/imgen1p5-streaming2.png" alt="第 2 张 partial" /&gt; | &lt;img className="images-example-image" src="https://cdn.openai.com/API/docs/images/imgen1p5-streaming3.png" alt="第 3 张 partial" /&gt; |




  Prompt: 画一张华丽的图像：一条由白色猫头鹰羽毛组成的河流，蜿蜒穿过宁静的冬季景观


### Revised prompt

在 Responses API 中使用图像生成工具时，主线模型（例如 `gpt-5.5`）会自动修订你的 prompt，以提升表现。

你可以在 image generation call 的 `revised_prompt` 字段中访问修订后的 prompt：

Revised prompt response

```json
{
  "id": "ig_123",
  "type": "image_generation_call",
  "status": "completed",
  "revised_prompt": "A gray tabby cat hugging an otter. The otter is wearing an orange scarf. Both animals are cute and friendly, depicted in a warm, heartwarming style.",
  "result": "..."
}
```


## 编辑图像

[image edits](https://developers.openai.com/api/docs/api-reference/images/createEdit) endpoint 允许你：

- 编辑已有图像
- 使用其他图像作为 reference 生成新图像
- 通过上传图像和用于标识要替换区域的 mask，编辑图像的一部分

### 使用图像 references 创建新图像

你可以使用一张或多张图像作为 reference 来生成新图像。

在这个示例中，我们会使用 4 张输入图像，生成一个包含 reference images 中物品的礼篮新图像。


Responses API


Image API
    编辑图像

```python
import base64
from openai import OpenAI
client = OpenAI()

prompt = """
Generate a photorealistic image of a gift basket on a white background 
labeled 'Relax & Unwind' with a ribbon and handwriting-like font, 
containing all the items in the reference pictures.
"""

result = client.images.edit(
    model="gpt-image-2",
    image=[
        open("body-lotion.png", "rb"),
        open("bath-bomb.png", "rb"),
        open("incense-kit.png", "rb"),
        open("soap.png", "rb"),
    ],
    prompt=prompt
)

image_base64 = result.data[0].b64_json
image_bytes = base64.b64decode(image_base64)

# Save the image to a file
with open("gift-basket.png", "wb") as f:
    f.write(image_bytes)
```

```javascript
import fs from "fs";
import OpenAI, { toFile } from "openai";

const client = new OpenAI();

const prompt = `
Generate a photorealistic image of a gift basket on a white background 
labeled 'Relax & Unwind' with a ribbon and handwriting-like font, 
containing all the items in the reference pictures.
`;

const imageFiles = [
    "bath-bomb.png",
    "body-lotion.png",
    "incense-kit.png",
    "soap.png",
];

const images = await Promise.all(
    imageFiles.map(async (file) =>
        await toFile(fs.createReadStream(file), null, {
            type: "image/png",
        })
    ),
);

const response = await client.images.edit({
    model: "gpt-image-2",
    image: images,
    prompt,
});

// Save the image to a file
const image_base64 = response.data[0].b64_json;
const image_bytes = Buffer.from(image_base64, "base64");
fs.writeFileSync("basket.png", image_bytes);
```

```bash
curl -s -D >(grep -i x-request-id >&2) \
  -o >(jq -r '.data[0].b64_json' | base64 --decode > gift-basket.png) \
  -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=gpt-image-2" \
  -F "image[]=@body-lotion.png" \
  -F "image[]=@bath-bomb.png" \
  -F "image[]=@incense-kit.png" \
  -F "image[]=@soap.png" \
  -F 'prompt=Generate a photorealistic image of a gift basket on a white background labeled "Relax & Unwind" with a ribbon and handwriting-like font, containing all the items in the reference pictures'
```

```bash
openai images edit \
  --model gpt-image-2 \
  --image body-lotion.png \
  --image bath-bomb.png \
  --image incense-kit.png \
  --image soap.png \
  --prompt 'Generate a photorealistic image of a gift basket on a white background labeled "Relax & Unwind" with a ribbon and handwriting-like font, containing all the items in the reference pictures' \
  --raw-output \
  --transform 'data.0.b64_json' | base64 --decode > gift-basket.png
```





### 使用 mask 编辑图像

你可以提供 mask 来指明图像中的哪一部分应被编辑。

使用 GPT Image 的 mask 时，会向模型发送额外指令，帮助相应地引导编辑过程。

GPT Image 的 masking 完全基于 prompt。模型会把 mask 作为指导，但不一定能以完全精确的方式遵循其具体形状。

如果你提供多张输入图像，mask 会应用到第一张图像。




Responses API
    使用 mask 编辑图像

```python
from openai import OpenAI
import base64

client = OpenAI()

def create_file(file_path):
    with open(file_path, "rb") as file_content:
        result = client.files.create(file=file_content, purpose="vision")
    return result.id

fileId = create_file("sunlit_lounge.png")
maskId = create_file("mask.png")

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "generate an image of the same sunlit indoor lounge area with a pool but the pool should contain a flamingo",
                },
                {
                    "type": "input_image",
                    "file_id": fileId,
                }
            ],
        },
    ],
    tools=[
        {
            "type": "image_generation",
            "quality": "high",
            "input_image_mask": {
                "file_id": maskId,
            }
        },
    ],
)

image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if image_data:
    image_base64 = image_data[0]
    with open("lounge.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

async function createFile(filePath) {
  const result = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "vision",
  });
  return result.id;
}

const fileId = await createFile("sunlit_lounge.png");
const maskId = await createFile("mask.png");

const response = await openai.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: "generate an image of the same sunlit indoor lounge area with a pool but the pool should contain a flamingo",
        },
        {
          type: "input_image",
          file_id: fileId,
        }
      ],
    },
  ],
  tools: [
    {
      type: "image_generation",
      quality: "high",
      input_image_mask: {
        file_id: maskId,
      }
    },
  ],
});

const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  fs.writeFileSync("lounge.png", Buffer.from(imageBase64, "base64"));
}
```



Image API
    使用 mask 编辑图像

```python
from openai import OpenAI
import base64

client = OpenAI()

result = client.images.edit(
    model="gpt-image-2",
    image=open("sunlit_lounge.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="A sunlit indoor lounge area with a pool containing a flamingo"
)

image_base64 = result.data[0].b64_json
image_bytes = base64.b64decode(image_base64)

# Save the image to a file
with open("composition.png", "wb") as f:
    f.write(image_bytes)
```

```javascript
import fs from "fs";
import OpenAI, { toFile } from "openai";

const client = new OpenAI();

const rsp = await client.images.edit({
    model: "gpt-image-2",
    image: await toFile(fs.createReadStream("sunlit_lounge.png"), null, {
        type: "image/png",
    }),
    mask: await toFile(fs.createReadStream("mask.png"), null, {
        type: "image/png",
    }),
    prompt: "A sunlit indoor lounge area with a pool containing a flamingo",
});

// Save the image to a file
const image_base64 = rsp.data[0].b64_json;
const image_bytes = Buffer.from(image_base64, "base64");
fs.writeFileSync("lounge.png", image_bytes);
```

```bash
curl -s -D >(grep -i x-request-id >&2) \
  -o >(jq -r '.data[0].b64_json' | base64 --decode > lounge.png) \
  -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=gpt-image-2" \
  -F "mask=@mask.png" \
  -F "image[]=@sunlit_lounge.png" \
  -F 'prompt=A sunlit indoor lounge area with a pool containing a flamingo'
```

```bash
openai images edit \
  --model gpt-image-2 \
  --image sunlit_lounge.png \
  --mask mask.png \
  --prompt "A sunlit indoor lounge area with a pool containing a flamingo" \
  --raw-output \
  --transform 'data.0.b64_json' | base64 --decode > out.png
```







| Image                                                                                                                                 | Mask                                                                                                                            | Output                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| &lt;img className="images-example-image" src="https://cdn.openai.com/API/docs/images/sunlit_lounge.png" alt="带泳池的粉色房间" /&gt; | &lt;img className="images-example-image" src="https://cdn.openai.com/API/docs/images/mask.png" alt="泳池一部分上的 mask" /&gt; | &lt;img className="images-example-image" src="https://cdn.openai.com/API/docs/images/sunlit_lounge_result.png" alt="原来的泳池中由充气火烈鸟替换 mask 区域" /&gt; |




  Prompt: 一个阳光照进来的室内休息区，带有一个装着火烈鸟的泳池


#### Mask 要求

要编辑的图像和 mask 必须具有相同的格式和尺寸（大小小于 50MB）。

mask 图像还必须包含 alpha channel。如果你使用图像编辑工具创建 mask，请确保使用 alpha channel 保存 mask。

你可以通过编程方式修改黑白图像，为其添加 alpha channel。

为黑白 mask 添加 alpha channel

```python
from PIL import Image
from io import BytesIO

# 1. Load your black & white mask as a grayscale image
mask = Image.open("mask.png").convert("L")

# 2. Convert it to RGBA so it has space for an alpha channel
mask_rgba = mask.convert("RGBA")

# 3. Then use the mask itself to fill that alpha channel
mask_rgba.putalpha(mask)

# 4. Convert the mask into bytes
buf = BytesIO()
mask_rgba.save(buf, format="PNG")
mask_bytes = buf.getvalue()

# 5. Save the resulting file
img_path_mask_alpha = "mask_alpha.png"
with open(img_path_mask_alpha, "wb") as f:
    f.write(mask_bytes)
```


### 图像输入保真度

`input_fidelity` 参数控制模型在编辑和 reference-image 工作流中保留输入图像细节的强度。对于 `gpt-image-2`，请省略此参数；API 不允许修改它，因为该模型会自动以高保真处理每个图像输入。

由于 `gpt-image-2` 始终以高保真处理图像输入，包含 reference images 的编辑请求可能会使用更多 image input tokens。要了解成本影响，请参阅 [vision costs](/mirror/api/docs/guides/images-vision#calculating-costs)
  小节。

## 自定义图像输出

你可以配置以下输出选项：

- **Size**：图像尺寸（例如 `1024x1024`、`1024x1536`）
- **Quality**：渲染质量（例如 `low`、`medium`、`high`）
- **Format**：文件输出格式
- **Compression**：JPEG 和 WebP 格式的压缩级别（0-100%）
- **Background**：不透明或自动

`size`、`quality` 和 `background` 支持 `auto` 选项，模型会根据 prompt 自动选择最佳选项。

`gpt-image-2` 目前不支持透明背景。此模型不支持带有 `background: "transparent"` 的请求。

### Size 和 quality 选项

当 `size` 参数满足以下约束时，`gpt-image-2` 可以接受任何分辨率。正方形图像通常生成最快。




常用尺寸



            &lt;code&gt;1024x1024&lt;/code&gt;（正方形）


            &lt;code&gt;1536x1024&lt;/code&gt;（横向）


            &lt;code&gt;1024x1536&lt;/code&gt;（纵向）


            &lt;code&gt;2048x2048&lt;/code&gt;（2K 正方形）


            &lt;code&gt;2048x1152&lt;/code&gt;（2K 横向）


            &lt;code&gt;3840x2160&lt;/code&gt;（4K 横向）


            &lt;code&gt;2160x3840&lt;/code&gt;（4K 纵向）


            &lt;code&gt;auto&lt;/code&gt;（默认）





尺寸约束



            最大边长必须小于或等于 
3840px


            两条边都必须是 &lt;code&gt;16px&lt;/code&gt; 的倍数


            长边与短边的比例不得超过 &lt;code&gt;3:1&lt;/code&gt;


            总像素数必须至少为 &lt;code&gt;655,360&lt;/code&gt;，且不超过 
8,294,400





Quality 选项



low


medium


high


            &lt;code&gt;auto&lt;/code&gt;（默认）







对于快速草稿、缩略图和快速迭代，请使用 `quality: "low"`。这是最快的选项，在你转向 `medium` 或 `high` 制作最终素材之前，它已经能很好地适用于许多常见用例。

包含超过 `2560x1440`（`3,686,400`）总像素的输出通常称为 2K，被视为实验性能力。

### 输出格式

Image API 返回 Base64 编码的图像数据。
默认格式是 `png`，但你也可以请求 `jpeg` 或 `webp`。

如果使用 `jpeg` 或 `webp`，还可以指定 `output_compression` 参数来控制压缩级别（0-100%）。例如，`output_compression=50` 会将图像压缩 50%。

使用 `jpeg` 比 `png` 更快，因此如果你关注延迟，应优先选择这种格式。

## 限制

GPT Image models（`gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 和 `gpt-image-1-mini`）是强大而多用途的图像生成模型，但仍有一些需要注意的限制：

- **Latency:** 复杂 prompts 可能需要最多 2 分钟处理。
- **Text Rendering:** 虽然已经显著改进，模型仍可能难以实现精确的文本放置和清晰度。
- **Consistency:** 尽管能够生成一致的图像，模型在跨多次生成保持重复角色或品牌元素的视觉一致性时，偶尔仍可能遇到困难。
- **Composition Control:** 尽管指令遵循能力有所提升，模型在结构化或对布局敏感的构图中，可能难以精确放置元素。

### 内容审核

所有 prompts 和生成图像都会根据我们的[内容政策](https://openai.com/policies/usage-policies/)进行过滤。

对于使用 GPT Image models（`gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 和 `gpt-image-1-mini`）的图像生成，你可以通过 `moderation` 参数控制审核严格程度。该参数支持两个值：

- `auto`（默认）：标准过滤，旨在限制创建某些类别的潜在年龄不适宜内容。
- `low`：限制较少的过滤。

### 处理被阻止的请求和其他错误

处理图像生成失败的方式与处理其他 API 错误相同：检查 HTTP status 或 SDK exception type，记录 request ID，并参阅 [error codes guide](/mirror/api/docs/guides/error-codes)，了解 authentication、quota、rate-limit 和 server failures。对于 `429` 和 `5xx` 等瞬时故障，retry 是合适的；但对于需要修改请求的图像生成用户错误，不应 retry。

某些图像生成失败可由用户纠正，并可能返回 `error.type = "image_generation_user_error"`。不要在未修改 prompt 或输入图像的情况下自动 retry 这些错误。对于程序化处理，请使用 `error.code` 作为稳定的判别字段。

当 `error.code = "moderation_blocked"` 时，错误还可能包含可选的 `error.moderation_details` 对象：

```json
{
  "error": {
    "type": "image_generation_user_error",
    "code": "moderation_blocked",
    "moderation_details": {
      "moderation_stage": "input",
      "categories": ["harassment"]
    }
  }
}
```

`moderation_details` 对象提供粗粒度调试上下文，而不会暴露内部分类器标签或分数。

`moderation_stage` 可以是：

- `input`：阻止来自 prompt 或请求输入。
- `output`：阻止来自生成图像或下游输出审核阶段。
- `unknown`：当来源难以确定时使用的少见 fallback。

`categories` 包含粗粒度公共标签。例如，你可能会看到 `harassment`、`self-harm`、`sexual` 或 `violence` 等值。

对于大多数应用，请让面向最终用户的主要消息保持通用。将 `moderation_details` 用于开发者日志、支持工作流、分析和轻量级补救提示。

例如，如果出现 `harassment`，建议移除辱骂性或针对性的语言。如果阻止发生在 `input` 阶段，引导用户修改 prompt。如果发生在 `output` 阶段，请将其视为生成结果安全阻止，并在日志中区分它。始终先基于 `error.code = "moderation_blocked"` 分支，并把 `moderation_details` 视为可选的额外上下文。

处理 moderation-blocked 图像生成错误

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

try {
  // The same error handling pattern applies to image generation requests,
  // image edits, and Responses API tool calls that generate images.
  await openai.images.generate({
    model: "gpt-image-2",
    prompt: "Create a poster humiliating my coworker with insulting captions",
  });
} catch (error) {
  if (error?.code !== "moderation_blocked") {
    throw error;
  }

  const moderationDetails = error?.moderation_details;
  const categories = moderationDetails?.categories ?? [];
  const stage = moderationDetails?.moderation_stage;

  let hint =
    "This request could not be completed because it did not meet safety requirements.";

  if (categories.includes("harassment")) {
    hint =
      "Try removing abusive or targeting language and focus on neutral visual details instead.";
  } else if (stage === "input") {
    hint = "Try revising the prompt or input images and submit the request again.";
  } else if (stage === "output") {
    hint = "The generated result was blocked by a safety check. Try changing the prompt and generating again.";
  }

  console.error("Image generation blocked", {
    request_id: error?.request_id,
    code: error?.code,
    moderation_details: moderationDetails,
  });

  console.log(hint);
}
```

```python
import openai
from openai import OpenAI

client = OpenAI()

try:
    # The same error handling pattern applies to image generation requests,
    # image edits, and Responses API tool calls that generate images.
    client.images.generate(
        model="gpt-image-2",
        prompt="Create a poster humiliating my coworker with insulting captions",
    )
except openai.BadRequestError as error:
    if error.code != "moderation_blocked":
        raise

    error_body = error.body if isinstance(error.body, dict) else {}
    moderation_details = error_body.get("moderation_details") or {}
    categories = moderation_details.get("categories") or []
    stage = moderation_details.get("moderation_stage")

    hint = "This request could not be completed because it did not meet safety requirements."

    if "harassment" in categories:
        hint = "Try removing abusive or targeting language and focus on neutral visual details instead."
    elif stage == "input":
        hint = "Try revising the prompt or input images and submit the request again."
    elif stage == "output":
        hint = "The generated result was blocked by a safety check. Try changing the prompt and generating again."

    print(
        "Image generation blocked",
        {
            "request_id": error.request_id,
            "code": error.code,
            "moderation_details": moderation_details,
        },
    )

    print(hint)
```


### 支持的模型

在 Responses API 中使用图像生成时，`gpt-5` 及更新模型应支持图像生成工具。[查看你的模型详情页](https://developers.openai.com/api/docs/models)，确认目标模型能否使用图像生成工具。

## 成本和延迟

### `gpt-image-2` output tokens

对于 `gpt-image-2`，请使用 calculator，根据请求的 `quality` 和 `size` 估算 output tokens：

### `gpt-image-2` 之前的模型

`gpt-image-2` 之前的 GPT Image models 会先生成专用 image tokens，再生成图像。延迟和最终成本都与渲染图像所需的 token 数量成正比：更大的图像尺寸和更高的 quality 设置会产生更多 tokens。

生成的 token 数量取决于图像尺寸和 quality：

| Quality | Square (1024×1024) | Portrait (1024×1536) | Landscape (1536×1024) |
| ------- | ------------------ | -------------------- | --------------------- |
| Low     | 272 tokens         | 408 tokens           | 400 tokens            |
| Medium  | 1056 tokens        | 1584 tokens          | 1568 tokens           |
| High    | 4160 tokens        | 6240 tokens          | 6208 tokens           |

请注意，你还需要计入 [input tokens](/mirror/api/docs/guides/images-vision#calculating-costs)：prompt 的 text tokens，以及编辑图像时输入图像的 image tokens。
由于 `gpt-image-2` 始终以高保真处理图像输入，包含 reference images 的编辑请求可能会使用更多 input tokens。

请参阅 [pricing page](/mirror/api/docs/pricing#image-generation) 获取当前 text 和 image token 价格，并使用下方的[计算成本](/mirror/api/docs/guides/image-generation#calculating-costs)小节估算请求成本。

最终成本由以下部分相加得到：

- input text tokens
- 使用 edits endpoint 时的 input image tokens
- image output tokens

### 计算成本

使用下方 pricing calculator 估算 GPT Image models 的请求成本。
`gpt-image-2` 支持数千种有效分辨率；下表列出了与之前 GPT Image models 相同的尺寸，以便比较。对于 GPT Image 1.5、GPT Image 1 和 GPT Image 1 Mini，下面还列出了旧版按图像计费的 output pricing table。在估算请求总成本时，你仍然应计入 text 和 image input tokens。

在相同 quality 设置下，更大的非正方形分辨率有时可能比更小或正方形分辨率产生更少 output tokens。

&lt;table
  style=&#123;&#123; borderCollapse: "collapse", tableLayout: "fixed", width: "100%" &#125;&#125;
&gt;


Model

        Quality

1024 x 1024
1024 x 1536
1536 x 1024





        GPT Image 2

还有其他尺寸可用

Low
$0.006
$0.005
$0.005


Medium
$0.053
$0.041
$0.041


High
$0.211
$0.165
$0.165




        GPT Image 1.5

Low
$0.009
$0.013
$0.013


Medium
$0.034
$0.05
$0.05


High
$0.133
$0.2
$0.2




        GPT Image 1

Low
$0.011
$0.016
$0.016


Medium
$0.042
$0.063
$0.063


High
$0.167
$0.25
$0.25




        GPT Image 1 Mini

Low
$0.005
$0.006
$0.006


Medium
$0.011
$0.015
$0.015


High
$0.036
$0.052
$0.052





### Partial images 成本

如果你想使用 `partial_images` 参数[流式生成图像](/mirror/api/docs/guides/image-generation#streaming)，每张 partial image 都会额外产生 100 个 image output tokens。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
## Overview

The OpenAI API lets you generate and edit images from text prompts using GPT Image models, including our latest, `gpt-image-2`. You can access image generation capabilities through two APIs:

### Image API

Starting with `gpt-image-1` and later models, the [Image API](https://developers.openai.com/api/docs/api-reference/images) provides two endpoints, each with distinct capabilities:

- **Generations**: [Generate images](#generate-images) from scratch based on a text prompt
- **Edits**: [Modify existing images](#edit-images) using a new prompt, either partially or entirely

The Image API also includes a variations endpoint for models that support it, such as DALL·E 2.

### Responses API

The [Responses API](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-tools) allows you to generate images as part of conversations or multi-step flows. It supports image generation as a [built-in tool](https://developers.openai.com/api/docs/guides/tools?api-mode=responses), and accepts image inputs and outputs within context.

Compared to the Image API, it adds:

- **Multi-turn editing**: Iteratively make high fidelity edits to images with prompting
- **Flexible inputs**: Accept image [File](https://developers.openai.com/api/docs/api-reference/files) IDs as input images, not just bytes

The Responses API image generation tool uses its own GPT Image model selection. For details on mainline models that support calling this tool, refer to the [supported models](#supported-models) below.

### Choosing the right API

- If you only need to generate or edit a single image from one prompt, the Image API is your best choice.
- If you want to build conversational, editable image experiences with GPT Image, go with the Responses API.

With the Image API, you choose a GPT Image model directly. With the Responses API, you choose a mainline model that supports the image generation tool; the tool handles GPT Image model selection. Responses API requests include the mainline model's token usage in addition to image generation costs.

Both APIs let you [customize output](#customize-image-output) by adjusting quality, size, format, and compression. Transparent backgrounds depend on model support.

This guide focuses on GPT Image.

To ensure these models are used responsibly, you may need to complete the [API
  Organization
  Verification](https://help.openai.com/en/articles/10910291-api-organization-verification)
  from your [developer
  console](https://platform.openai.com/settings/organization/general) before
  using GPT Image models, including `gpt-image-2`, `gpt-image-1.5`,
  `gpt-image-1`, and `gpt-image-1-mini`.

<div
  className="not-prose"
  style={{ float: "right", margin: "10px 0 10px 10px" }}
>
  <img src="https://cdn.openai.com/API/docs/images/mug.png"
    alt="A beige coffee mug on a wooden table"
    style={{ height: "180px", width: "auto", borderRadius: "8px" }}
  />
</div>

## Generate Images

You can use the [image generation endpoint](https://developers.openai.com/api/docs/api-reference/images/create) to create images based on text prompts, or the [image generation tool](https://developers.openai.com/api/docs/guides/tools?api-mode=responses) in the Responses API to generate images as part of a conversation.

To learn more about customizing the output (size, quality, format, compression), refer to the [customize image output](#customize-image-output) section below.

You can set the `n` parameter to generate multiple images at once in a single request (by default, the API returns a single image).



<div data-content-switcher-pane data-value="image">
    <div class="hidden">Image API</div>
    Generate an image

```javascript
import OpenAI from "openai";
import fs from "fs";
const openai = new OpenAI();

const prompt = `
A children's book drawing of a veterinarian using a stethoscope to 
listen to the heartbeat of a baby otter.
`;

const result = await openai.images.generate({
    model: "gpt-image-2",
    prompt,
});

// Save the image to a file
const image_base64 = result.data[0].b64_json;
const image_bytes = Buffer.from(image_base64, "base64");
fs.writeFileSync("otter.png", image_bytes);
```

```python
from openai import OpenAI
import base64
client = OpenAI()

prompt = """
A children's book drawing of a veterinarian using a stethoscope to 
listen to the heartbeat of a baby otter.
"""

result = client.images.generate(
    model="gpt-image-2",
    prompt=prompt
)

image_base64 = result.data[0].b64_json
image_bytes = base64.b64decode(image_base64)

# Save the image to a file
with open("otter.png", "wb") as f:
    f.write(image_bytes)
```

```bash
curl -X POST "https://api.openai.com/v1/images/generations" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-type: application/json" \
    -d '{
        "model": "gpt-image-2",
        "prompt": "A children'\''s book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter."
    }' | jq -r '.data[0].b64_json' | base64 --decode > otter.png
```

```cli
openai images generate \
  --model gpt-image-2 \
  --prompt "A children's book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter." \
  --raw-output \
  --transform 'data.0.b64_json' | base64 --decode > otter.png
```

  </div>
  <div data-content-switcher-pane data-value="responses" hidden>
    <div class="hidden">Responses API</div>
    Generate an image

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools: [{type: "image_generation"}],
});

// Save the image to a file
const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("otter.png", Buffer.from(imageBase64, "base64"));
}
```

```python
from openai import OpenAI
import base64

client = OpenAI() 

response = client.responses.create(
    model="gpt-5.5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

# Save the image to a file
image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]
    
if image_data:
    image_base64 = image_data[0]
    with open("otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

  </div>



### Multi-turn image generation

With the Responses API, you can build multi-turn conversations involving image generation either by providing image generation calls outputs within context (you can also just use the image ID), or by using the [`previous_response_id` parameter](https://developers.openai.com/api/docs/guides/conversation-state?api-mode=responses#openai-apis-for-conversation-state).
This lets you iterate on images across multiple turns—refining prompts, applying new instructions, and evolving the visual output as the conversation progresses.

With the Responses API image generation tool, supported tool models can choose whether to generate a new image or edit one already in the conversation. The optional `action` parameter controls this behavior: keep `action: "auto"` to let the model decide, set `action: "generate"` to always create a new image, or set `action: "edit"` to force editing when an image is in context.

Force image creation with action

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools: [{type: "image_generation", action: "generate"}],
});

// Save the image to a file
const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("otter.png", Buffer.from(imageBase64, "base64"));
}
```

```python
from openai import OpenAI
import base64

client = OpenAI() 

response = client.responses.create(
    model="gpt-5.5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation", "action": "generate"}],
)

# Save the image to a file
image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]
    
if image_data:
    image_base64 = image_data[0]
    with open("otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```


If you force `edit` without providing an image in context, the call will return an error. Leave `action` at `auto` to have the model decide when to generate or edit.



<div data-content-switcher-pane data-value="responseid">
    <div class="hidden">Using previous response ID</div>
    Multi-turn image generation

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5.5",
  input:
    "Generate an image of gray tabby cat hugging an otter with an orange scarf",
  tools: [{ type: "image_generation" }],
});

const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("cat_and_otter.png", Buffer.from(imageBase64, "base64"));
}

// Follow up

const response_fwup = await openai.responses.create({
  model: "gpt-5.5",
  previous_response_id: response.id,
  input: "Now make it look realistic",
  tools: [{ type: "image_generation" }],
});

const imageData_fwup = response_fwup.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData_fwup.length > 0) {
  const imageBase64 = imageData_fwup[0];
  const fs = await import("fs");
  fs.writeFileSync(
    "cat_and_otter_realistic.png",
    Buffer.from(imageBase64, "base64")
  );
}
```

```python
from openai import OpenAI
import base64

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if image_data:
    image_base64 = image_data[0]

    with open("cat_and_otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))


# Follow up

response_fwup = client.responses.create(
    model="gpt-5.5",
    previous_response_id=response.id,
    input="Now make it look realistic",
    tools=[{"type": "image_generation"}],
)

image_data_fwup = [
    output.result
    for output in response_fwup.output
    if output.type == "image_generation_call"
]

if image_data_fwup:
    image_base64 = image_data_fwup[0]
    with open("cat_and_otter_realistic.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

  </div>
  <div data-content-switcher-pane data-value="imageid" hidden>
    <div class="hidden">Using image ID</div>
    Multi-turn image generation

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5.5",
  input:
    "Generate an image of gray tabby cat hugging an otter with an orange scarf",
  tools: [{ type: "image_generation" }],
});

const imageGenerationCalls = response.output.filter(
  (output) => output.type === "image_generation_call"
);

const imageData = imageGenerationCalls.map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("cat_and_otter.png", Buffer.from(imageBase64, "base64"));
}

// Follow up

const response_fwup = await openai.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content: [{ type: "input_text", text: "Now make it look realistic" }],
    },
    {
      type: "image_generation_call",
      id: imageGenerationCalls[0].id,
    },
  ],
  tools: [{ type: "image_generation" }],
});

const imageData_fwup = response_fwup.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData_fwup.length > 0) {
  const imageBase64 = imageData_fwup[0];
  const fs = await import("fs");
  fs.writeFileSync(
    "cat_and_otter_realistic.png",
    Buffer.from(imageBase64, "base64")
  );
}
```

```python
import openai
import base64

response = openai.responses.create(
    model="gpt-5.5",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

image_generation_calls = [
    output
    for output in response.output
    if output.type == "image_generation_call"
]

image_data = [output.result for output in image_generation_calls]

if image_data:
    image_base64 = image_data[0]

    with open("cat_and_otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))


# Follow up

response_fwup = openai.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [{"type": "input_text", "text": "Now make it look realistic"}],
        },
        {
            "type": "image_generation_call",
            "id": image_generation_calls[0].id,
        },
    ],
    tools=[{"type": "image_generation"}],
)

image_data_fwup = [
    output.result
    for output in response_fwup.output
    if output.type == "image_generation_call"
]

if image_data_fwup:
    image_base64 = image_data_fwup[0]
    with open("cat_and_otter_realistic.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

  </div>



#### Result

<div className="not-prose">
  <table style={{ width: "100%" }}>
    <tbody>
      <tr>
        <td style={{ verticalAlign: "top", padding: "0 16px 16px 0" }}>
          "Generate an image of gray tabby cat hugging an otter with an orange
          scarf"
        </td>
        <td
          style={{
            textAlign: "right",
            verticalAlign: "top",
            paddingBottom: "16px",
          }}
        >
          <img src="https://cdn.openai.com/API/docs/images/cat_and_otter.png"
            alt="A cat and an otter"
            style={{ width: "200px", borderRadius: "8px" }}
          />
        </td>
      </tr>
      <tr>
        <td style={{ verticalAlign: "top", padding: "0 16px 0 0" }}>
          "Now make it look realistic"
        </td>
        <td style={{ textAlign: "right", verticalAlign: "top" }}>
          <img src="https://cdn.openai.com/API/docs/images/cat_and_otter_realistic.png"
            alt="A cat and an otter"
            style={{ width: "200px", borderRadius: "8px" }}
          />
        </td>
      </tr>
    </tbody>
  </table>
</div>

### Streaming

The Responses API and Image API support streaming image generation. You can stream partial images as the APIs generate them, providing a more interactive experience.

You can adjust the `partial_images` parameter to receive 0-3 partial images.

- If you set `partial_images` to 0, you will only receive the final image.
- For values larger than zero, you may not receive the full number of partial images you requested if the full image is generated more quickly.



<div data-content-switcher-pane data-value="responses">
    <div class="hidden">Responses API</div>
    Stream an image

```javascript
import OpenAI from "openai";
import fs from "fs";
const openai = new OpenAI();

function saveBase64Image(filename, imageBase64) {
  const imageBuffer = Buffer.from(imageBase64, "base64");
  fs.writeFileSync(filename, imageBuffer);
}

const stream = await openai.responses.create({
  model: "gpt-5.5",
  input:
    "Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
  stream: true,
  tools: [{ type: "image_generation", partial_images: 2 }],
});

for await (const event of stream) {
  if (event.type === "response.image_generation_call.partial_image") {
    const idx = event.partial_image_index;
    saveBase64Image(`river-partial-${idx}.png`, event.partial_image_b64);
  } else if (event.type === "response.completed") {
    const imageData = event.response.output
      .filter((output) => output.type === "image_generation_call")
      .map((output) => output.result);

    if (imageData.length > 0) {
      saveBase64Image("river-final.png", imageData[0]);
    }
  }
}
```

```python
from openai import OpenAI
import base64

client = OpenAI()

def save_base64_image(filename, image_base64):
    image_bytes = base64.b64decode(image_base64)
    with open(filename, "wb") as f:
        f.write(image_bytes)

stream = client.responses.create(
    model="gpt-5.5",
    input="Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
    stream=True,
    tools=[{"type": "image_generation", "partial_images": 2}],
)

for event in stream:
    if event.type == "response.image_generation_call.partial_image":
        idx = event.partial_image_index
        save_base64_image(f"river-partial-{idx}.png", event.partial_image_b64)
    elif event.type == "response.completed":
        image_data = [
            output.result
            for output in event.response.output
            if output.type == "image_generation_call"
        ]

        if image_data:
            save_base64_image("river-final.png", image_data[0])
```

  </div>
  <div data-content-switcher-pane data-value="image" hidden>
    <div class="hidden">Image API</div>
    Stream an image

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const prompt =
  "Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape";
const stream = await openai.images.generate({
  prompt: prompt,
  model: "gpt-image-2",
  stream: true,
  partial_images: 2,
});

for await (const event of stream) {
  if (event.type === "image_generation.partial_image") {
    const idx = event.partial_image_index;
    const imageBase64 = event.b64_json;
    const imageBuffer = Buffer.from(imageBase64, "base64");
    fs.writeFileSync(`river${idx}.png`, imageBuffer);
  }
}
```

```python
from openai import OpenAI
import base64

client = OpenAI()

stream = client.images.generate(
    prompt="Draw a gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape",
    model="gpt-image-2",
    stream=True,
    partial_images=2,
)

for event in stream:
    if event.type == "image_generation.partial_image":
        idx = event.partial_image_index
        image_base64 = event.b64_json
        image_bytes = base64.b64decode(image_base64)
        with open(f"river{idx}.png", "wb") as f:
            f.write(image_bytes)
```

  </div>



#### Result

<div className="images-examples">

| Partial 1                                                                                                                       | Partial 2                                                                                                                       | Final image                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| <img className="images-example-image" src="https://cdn.openai.com/API/docs/images/imgen1p5-streaming1.png" alt="1st partial" /> | <img className="images-example-image" src="https://cdn.openai.com/API/docs/images/imgen1p5-streaming2.png" alt="2nd partial" /> | <img className="images-example-image" src="https://cdn.openai.com/API/docs/images/imgen1p5-streaming3.png" alt="3rd partial" /> |

</div>

<div className="images-edit-prompt body-small">
  Prompt: Draw a gorgeous image of a river made of white owl feathers, snaking
  its way through a serene winter landscape
</div>

### Revised prompt

When using the image generation tool in the Responses API, the mainline model (for example, `gpt-5.5`) will automatically revise your prompt for improved performance.

You can access the revised prompt in the `revised_prompt` field of the image generation call:

Revised prompt response

```json
{
  "id": "ig_123",
  "type": "image_generation_call",
  "status": "completed",
  "revised_prompt": "A gray tabby cat hugging an otter. The otter is wearing an orange scarf. Both animals are cute and friendly, depicted in a warm, heartwarming style.",
  "result": "..."
}
```


## Edit Images

The [image edits](https://developers.openai.com/api/docs/api-reference/images/createEdit) endpoint lets you:

- Edit existing images
- Generate new images using other images as a reference
- Edit parts of an image by uploading an image and mask that identifies the areas to replace

### Create a new image using image references

You can use one or more images as a reference to generate a new image.

In this example, we'll use 4 input images to generate a new image of a gift basket containing the items in the reference images.

<div data-content-switcher-pane data-value="responses">
    <div class="hidden">Responses API</div>
    </div>
  <div data-content-switcher-pane data-value="image" hidden>
    <div class="hidden">Image API</div>
    Edit an image

```python
import base64
from openai import OpenAI
client = OpenAI()

prompt = """
Generate a photorealistic image of a gift basket on a white background 
labeled 'Relax & Unwind' with a ribbon and handwriting-like font, 
containing all the items in the reference pictures.
"""

result = client.images.edit(
    model="gpt-image-2",
    image=[
        open("body-lotion.png", "rb"),
        open("bath-bomb.png", "rb"),
        open("incense-kit.png", "rb"),
        open("soap.png", "rb"),
    ],
    prompt=prompt
)

image_base64 = result.data[0].b64_json
image_bytes = base64.b64decode(image_base64)

# Save the image to a file
with open("gift-basket.png", "wb") as f:
    f.write(image_bytes)
```

```javascript
import fs from "fs";
import OpenAI, { toFile } from "openai";

const client = new OpenAI();

const prompt = `
Generate a photorealistic image of a gift basket on a white background 
labeled 'Relax & Unwind' with a ribbon and handwriting-like font, 
containing all the items in the reference pictures.
`;

const imageFiles = [
    "bath-bomb.png",
    "body-lotion.png",
    "incense-kit.png",
    "soap.png",
];

const images = await Promise.all(
    imageFiles.map(async (file) =>
        await toFile(fs.createReadStream(file), null, {
            type: "image/png",
        })
    ),
);

const response = await client.images.edit({
    model: "gpt-image-2",
    image: images,
    prompt,
});

// Save the image to a file
const image_base64 = response.data[0].b64_json;
const image_bytes = Buffer.from(image_base64, "base64");
fs.writeFileSync("basket.png", image_bytes);
```

```bash
curl -s -D >(grep -i x-request-id >&2) \
  -o >(jq -r '.data[0].b64_json' | base64 --decode > gift-basket.png) \
  -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=gpt-image-2" \
  -F "image[]=@body-lotion.png" \
  -F "image[]=@bath-bomb.png" \
  -F "image[]=@incense-kit.png" \
  -F "image[]=@soap.png" \
  -F 'prompt=Generate a photorealistic image of a gift basket on a white background labeled "Relax & Unwind" with a ribbon and handwriting-like font, containing all the items in the reference pictures'
```

```cli
openai images edit \
  --model gpt-image-2 \
  --image body-lotion.png \
  --image bath-bomb.png \
  --image incense-kit.png \
  --image soap.png \
  --prompt 'Generate a photorealistic image of a gift basket on a white background labeled "Relax & Unwind" with a ribbon and handwriting-like font, containing all the items in the reference pictures' \
  --raw-output \
  --transform 'data.0.b64_json' | base64 --decode > gift-basket.png
```

  </div>



### Edit an image using a mask

You can provide a mask to indicate which part of the image should be edited.

When using a mask with GPT Image, additional instructions are sent to the model to help guide the editing process accordingly.

Masking with GPT Image is entirely prompt-based. The model uses the mask as
  guidance, but may not follow its exact shape with complete precision.

If you provide multiple input images, the mask will be applied to the first image.



<div data-content-switcher-pane data-value="responses">
    <div class="hidden">Responses API</div>
    Edit an image with a mask

```python
from openai import OpenAI
import base64

client = OpenAI()

def create_file(file_path):
    with open(file_path, "rb") as file_content:
        result = client.files.create(file=file_content, purpose="vision")
    return result.id

fileId = create_file("sunlit_lounge.png")
maskId = create_file("mask.png")

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "generate an image of the same sunlit indoor lounge area with a pool but the pool should contain a flamingo",
                },
                {
                    "type": "input_image",
                    "file_id": fileId,
                }
            ],
        },
    ],
    tools=[
        {
            "type": "image_generation",
            "quality": "high",
            "input_image_mask": {
                "file_id": maskId,
            }
        },
    ],
)

image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if image_data:
    image_base64 = image_data[0]
    with open("lounge.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

async function createFile(filePath) {
  const result = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "vision",
  });
  return result.id;
}

const fileId = await createFile("sunlit_lounge.png");
const maskId = await createFile("mask.png");

const response = await openai.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: "generate an image of the same sunlit indoor lounge area with a pool but the pool should contain a flamingo",
        },
        {
          type: "input_image",
          file_id: fileId,
        }
      ],
    },
  ],
  tools: [
    {
      type: "image_generation",
      quality: "high",
      input_image_mask: {
        file_id: maskId,
      }
    },
  ],
});

const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  fs.writeFileSync("lounge.png", Buffer.from(imageBase64, "base64"));
}
```

  </div>
  <div data-content-switcher-pane data-value="image" hidden>
    <div class="hidden">Image API</div>
    Edit an image with a mask

```python
from openai import OpenAI
import base64

client = OpenAI()

result = client.images.edit(
    model="gpt-image-2",
    image=open("sunlit_lounge.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="A sunlit indoor lounge area with a pool containing a flamingo"
)

image_base64 = result.data[0].b64_json
image_bytes = base64.b64decode(image_base64)

# Save the image to a file
with open("composition.png", "wb") as f:
    f.write(image_bytes)
```

```javascript
import fs from "fs";
import OpenAI, { toFile } from "openai";

const client = new OpenAI();

const rsp = await client.images.edit({
    model: "gpt-image-2",
    image: await toFile(fs.createReadStream("sunlit_lounge.png"), null, {
        type: "image/png",
    }),
    mask: await toFile(fs.createReadStream("mask.png"), null, {
        type: "image/png",
    }),
    prompt: "A sunlit indoor lounge area with a pool containing a flamingo",
});

// Save the image to a file
const image_base64 = rsp.data[0].b64_json;
const image_bytes = Buffer.from(image_base64, "base64");
fs.writeFileSync("lounge.png", image_bytes);
```

```bash
curl -s -D >(grep -i x-request-id >&2) \
  -o >(jq -r '.data[0].b64_json' | base64 --decode > lounge.png) \
  -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=gpt-image-2" \
  -F "mask=@mask.png" \
  -F "image[]=@sunlit_lounge.png" \
  -F 'prompt=A sunlit indoor lounge area with a pool containing a flamingo'
```

```cli
openai images edit \
  --model gpt-image-2 \
  --image sunlit_lounge.png \
  --mask mask.png \
  --prompt "A sunlit indoor lounge area with a pool containing a flamingo" \
  --raw-output \
  --transform 'data.0.b64_json' | base64 --decode > out.png
```

  </div>



<div className="images-examples">

| Image                                                                                                                                 | Mask                                                                                                                            | Output                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img className="images-example-image" src="https://cdn.openai.com/API/docs/images/sunlit_lounge.png" alt="A pink room with a pool" /> | <img className="images-example-image" src="https://cdn.openai.com/API/docs/images/mask.png" alt="A mask in part of the pool" /> | <img className="images-example-image" src="https://cdn.openai.com/API/docs/images/sunlit_lounge_result.png" alt="The original pool with an inflatable flamingo replacing the mask" /> |

</div>

<div className="images-edit-prompt body-small">
  Prompt: a sunlit indoor lounge area with a pool containing a flamingo
</div>

#### Mask requirements

The image to edit and mask must be of the same format and size (less than 50MB in size).

The mask image must also contain an alpha channel. If you're using an image editing tool to create the mask, make sure to save the mask with an alpha channel.

You can modify a black and white image programmatically to add an alpha channel.

Add an alpha channel to a black and white mask

```python
from PIL import Image
from io import BytesIO

# 1. Load your black & white mask as a grayscale image
mask = Image.open("mask.png").convert("L")

# 2. Convert it to RGBA so it has space for an alpha channel
mask_rgba = mask.convert("RGBA")

# 3. Then use the mask itself to fill that alpha channel
mask_rgba.putalpha(mask)

# 4. Convert the mask into bytes
buf = BytesIO()
mask_rgba.save(buf, format="PNG")
mask_bytes = buf.getvalue()

# 5. Save the resulting file
img_path_mask_alpha = "mask_alpha.png"
with open(img_path_mask_alpha, "wb") as f:
    f.write(mask_bytes)
```


### Image input fidelity

The `input_fidelity` parameter controls how strongly a model preserves details from input images during edits and reference-image workflows. For `gpt-image-2`, omit this parameter; the API doesn't allow changing it because the model processes every image input at high fidelity automatically.

Because `gpt-image-2` always processes image inputs at high fidelity, image
  input tokens can be higher for edit requests that include reference images. To
  understand the cost implications, refer to the [vision
  costs](https://developers.openai.com/api/docs/guides/images-vision?api-mode=responses#calculating-costs)
  section.

## Customize Image Output

You can configure the following output options:

- **Size**: Image dimensions (for example, `1024x1024`, `1024x1536`)
- **Quality**: Rendering quality (for example, `low`, `medium`, `high`)
- **Format**: File output format
- **Compression**: Compression level (0-100%) for JPEG and WebP formats
- **Background**: Opaque or automatic

`size`, `quality`, and `background` support the `auto` option, where the model will automatically select the best option based on the prompt.

`gpt-image-2` doesn't currently support transparent backgrounds. Requests with
  `background: "transparent"` aren't supported for this model.

### Size and quality options

`gpt-image-2` accepts any resolution in the `size` parameter when it satisfies the constraints below. Square images are typically fastest to generate.

<table>
  <tbody>
    <tr>
      <td>Popular sizes</td>
      <td>
        <ul>
          <li>
            <code>1024x1024</code> (square)
          </li>
          <li>
            <code>1536x1024</code> (landscape)
          </li>
          <li>
            <code>1024x1536</code> (portrait)
          </li>
          <li>
            <code>2048x2048</code> (2K square)
          </li>
          <li>
            <code>2048x1152</code> (2K landscape)
          </li>
          <li>
            <code>3840x2160</code> (4K landscape)
          </li>
          <li>
            <code>2160x3840</code> (4K portrait)
          </li>
          <li>
            <code>auto</code> (default)
          </li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Size constraints</td>
      <td>
        <ul>
          <li>
            Maximum edge length must be less than or equal to 
            <code>3840px</code>
          </li>
          <li>
            Both edges must be multiples of <code>16px</code>
          </li>
          <li>
            Long edge to short edge ratio must not exceed <code>3:1</code>
          </li>
          <li>
            Total pixels must be at least <code>655,360</code> and no more than 
            <code>8,294,400</code>
          </li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Quality options</td>
      <td>
        <ul>
          <li>
            <code>low</code>
          </li>
          <li>
            <code>medium</code>
          </li>
          <li>
            <code>high</code>
          </li>
          <li>
            <code>auto</code> (default)
          </li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

Use `quality: "low"` for fast drafts, thumbnails, and quick iterations. It is
  the fastest option and works well for many common use cases before you move to
  `medium` or `high` for final assets.

Outputs that contain more than `2560x1440` (`3,686,400`) total pixels,
  typically referred to as 2K, are considered experimental.

### Output format

The Image API returns base64-encoded image data.
The default format is `png`, but you can also request `jpeg` or `webp`.

If using `jpeg` or `webp`, you can also specify the `output_compression` parameter to control the compression level (0-100%). For example, `output_compression=50` will compress the image by 50%.

Using `jpeg` is faster than `png`, so you should prioritize this format if
  latency is a concern.

## Limitations

GPT Image models (`gpt-image-2`, `gpt-image-1.5`, `gpt-image-1`, and `gpt-image-1-mini`) are powerful and versatile image generation models, but they still have some limitations to be aware of:

- **Latency:** Complex prompts may take up to 2 minutes to process.
- **Text Rendering:** Although significantly improved, the model can still struggle with precise text placement and clarity.
- **Consistency:** While capable of producing consistent imagery, the model may occasionally struggle to maintain visual consistency for recurring characters or brand elements across multiple generations.
- **Composition Control:** Despite improved instruction following, the model may have difficulty placing elements precisely in structured or layout-sensitive compositions.

### Content Moderation

All prompts and generated images are filtered in accordance with our [content policy](https://openai.com/policies/usage-policies/).

For image generation using GPT Image models (`gpt-image-2`, `gpt-image-1.5`, `gpt-image-1`, and `gpt-image-1-mini`), you can control moderation strictness with the `moderation` parameter. This parameter supports two values:

- `auto` (default): Standard filtering that seeks to limit creating certain categories of potentially age-inappropriate content.
- `low`: Less restrictive filtering.

### Handling blocked requests and other errors

Handle image generation failures the same way you handle other API errors: check the HTTP status or SDK exception type, log the request ID, and refer to the [error codes guide](https://developers.openai.com/api/docs/guides/error-codes) for authentication, quota, rate-limit, and server failures. Retries are appropriate for transient failures like `429` and `5xx`, but not for image generation user errors that require changing the request.

Some image generation failures are user-correctable and may return `error.type = "image_generation_user_error"`. Don't automatically retry these errors without modifying the prompt or input images. For programmatic handling, use `error.code` as the stable discriminator.

When `error.code = "moderation_blocked"`, the error may also include an optional `error.moderation_details` object:

```json
{
  "error": {
    "type": "image_generation_user_error",
    "code": "moderation_blocked",
    "moderation_details": {
      "moderation_stage": "input",
      "categories": ["harassment"]
    }
  }
}
```

The `moderation_details` object provides coarse debugging context without exposing internal classifier labels or scores.

`moderation_stage` can be:

- `input`: The block came from the prompt or request inputs.
- `output`: The block came from a generated image or downstream output moderation stage.
- `unknown`: A rare fallback when provenance is hard to determine.

`categories` contains coarse public labels. For example, you might see values like `harassment`, `self-harm`, `sexual`, or `violence`.

For most apps, keep the primary end-user message generic. Use `moderation_details` for developer logs, support workflows, analytics, and light remediation hints.

For example, if `harassment` appears, suggest removing abusive or targeting language. If the block happened at the `input` stage, guide the user to revise the prompt. If it happened at the `output` stage, treat it as a generated result safety block and distinguish it in your logs. Always branch on `error.code = "moderation_blocked"` first, and treat `moderation_details` as optional extra context.

Handle moderation-blocked image generation errors

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

try {
  // The same error handling pattern applies to image generation requests,
  // image edits, and Responses API tool calls that generate images.
  await openai.images.generate({
    model: "gpt-image-2",
    prompt: "Create a poster humiliating my coworker with insulting captions",
  });
} catch (error) {
  if (error?.code !== "moderation_blocked") {
    throw error;
  }

  const moderationDetails = error?.moderation_details;
  const categories = moderationDetails?.categories ?? [];
  const stage = moderationDetails?.moderation_stage;

  let hint =
    "This request could not be completed because it did not meet safety requirements.";

  if (categories.includes("harassment")) {
    hint =
      "Try removing abusive or targeting language and focus on neutral visual details instead.";
  } else if (stage === "input") {
    hint = "Try revising the prompt or input images and submit the request again.";
  } else if (stage === "output") {
    hint = "The generated result was blocked by a safety check. Try changing the prompt and generating again.";
  }

  console.error("Image generation blocked", {
    request_id: error?.request_id,
    code: error?.code,
    moderation_details: moderationDetails,
  });

  console.log(hint);
}
```

```python
import openai
from openai import OpenAI

client = OpenAI()

try:
    # The same error handling pattern applies to image generation requests,
    # image edits, and Responses API tool calls that generate images.
    client.images.generate(
        model="gpt-image-2",
        prompt="Create a poster humiliating my coworker with insulting captions",
    )
except openai.BadRequestError as error:
    if error.code != "moderation_blocked":
        raise

    error_body = error.body if isinstance(error.body, dict) else {}
    moderation_details = error_body.get("moderation_details") or {}
    categories = moderation_details.get("categories") or []
    stage = moderation_details.get("moderation_stage")

    hint = "This request could not be completed because it did not meet safety requirements."

    if "harassment" in categories:
        hint = "Try removing abusive or targeting language and focus on neutral visual details instead."
    elif stage == "input":
        hint = "Try revising the prompt or input images and submit the request again."
    elif stage == "output":
        hint = "The generated result was blocked by a safety check. Try changing the prompt and generating again."

    print(
        "Image generation blocked",
        {
            "request_id": error.request_id,
            "code": error.code,
            "moderation_details": moderation_details,
        },
    )

    print(hint)
```


### Supported models

When using image generation in the Responses API, `gpt-5` and newer models should support the image generation tool. [Check the model detail page for your model](https://developers.openai.com/api/docs/models) to confirm if your desired model can use the image generation tool.

## Cost and latency

### `gpt-image-2` output tokens

For `gpt-image-2`, use the calculator to estimate output tokens from the requested `quality` and `size`:

### Models prior to `gpt-image-2`

GPT Image models prior to `gpt-image-2` generate images by first producing specialized image tokens. Both latency and eventual cost are proportional to the number of tokens required to render an image—larger image sizes and higher quality settings result in more tokens.

The number of tokens generated depends on image dimensions and quality:

| Quality | Square (1024×1024) | Portrait (1024×1536) | Landscape (1536×1024) |
| ------- | ------------------ | -------------------- | --------------------- |
| Low     | 272 tokens         | 408 tokens           | 400 tokens            |
| Medium  | 1056 tokens        | 1584 tokens          | 1568 tokens           |
| High    | 4160 tokens        | 6240 tokens          | 6208 tokens           |

Note that you will also need to account for [input tokens](https://developers.openai.com/api/docs/guides/images-vision?api-mode=responses#calculating-costs): text tokens for the prompt and image tokens for the input images if editing images.
Because `gpt-image-2` always processes image inputs at high fidelity, edit requests that include reference images can use more input tokens.

Refer to the [pricing page](https://developers.openai.com/api/docs/pricing#image-generation) for current
text and image token prices, and use the [Calculating costs](#calculating-costs)
section below to estimate request costs.

The final cost is the sum of:

- input text tokens
- input image tokens if using the edits endpoint
- image output tokens

### Calculating costs

Use the pricing calculator below to estimate request costs for GPT Image models.
`gpt-image-2` supports thousands of valid resolutions; the table below lists the
same sizes used for previous GPT Image models for comparison. For GPT Image 1.5,
GPT Image 1, and GPT Image 1 Mini, the legacy per-image output pricing table is
also listed below. You should still account for text and image input tokens when
estimating the total cost of a request.

A larger non-square resolution can sometimes produce fewer output tokens than
  a smaller or square resolution at the same quality setting.

<table
  style={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%" }}
>
  <thead>
    <tr>
      <th style={{ textAlign: "left", padding: "8px", width: "28%" }}>Model</th>
      <th style={{ textAlign: "left", padding: "8px", width: "14%" }}>
        Quality
      </th>
      <th style={{ padding: "8px", width: "19.33%" }}>1024 x 1024</th>
      <th style={{ padding: "8px", width: "19.33%" }}>1024 x 1536</th>
      <th style={{ padding: "8px", width: "19.34%" }}>1536 x 1024</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowSpan="3" style={{ padding: "8px", width: "28%" }}>
        GPT Image 2
        <br />
        <span style={{ fontSize: "0.875em" }}>Additional sizes available</span>
      </td>
      <td style={{ padding: "8px" }}>Low</td>
      <td style={{ padding: "8px" }}>$0.006</td>
      <td style={{ padding: "8px" }}>$0.005</td>
      <td style={{ padding: "8px" }}>$0.005</td>
    </tr>
    <tr>
      <td style={{ padding: "8px" }}>Medium</td>
      <td style={{ padding: "8px" }}>$0.053</td>
      <td style={{ padding: "8px" }}>$0.041</td>
      <td style={{ padding: "8px" }}>$0.041</td>
    </tr>
    <tr>
      <td style={{ padding: "8px" }}>High</td>
      <td style={{ padding: "8px" }}>$0.211</td>
      <td style={{ padding: "8px" }}>$0.165</td>
      <td style={{ padding: "8px" }}>$0.165</td>
    </tr>

    <tr>
      <td rowSpan="3" style={{ padding: "8px", width: "28%" }}>
        GPT Image 1.5
      </td>
      <td style={{ padding: "8px" }}>Low</td>
      <td style={{ padding: "8px" }}>$0.009</td>
      <td style={{ padding: "8px" }}>$0.013</td>
      <td style={{ padding: "8px" }}>$0.013</td>
    </tr>
    <tr>
      <td style={{ padding: "8px" }}>Medium</td>
      <td style={{ padding: "8px" }}>$0.034</td>
      <td style={{ padding: "8px" }}>$0.05</td>
      <td style={{ padding: "8px" }}>$0.05</td>
    </tr>
    <tr>
      <td style={{ padding: "8px" }}>High</td>
      <td style={{ padding: "8px" }}>$0.133</td>
      <td style={{ padding: "8px" }}>$0.2</td>
      <td style={{ padding: "8px" }}>$0.2</td>
    </tr>

    <tr>
      <td rowSpan="3" style={{ padding: "8px", width: "28%" }}>
        GPT Image 1
      </td>
      <td style={{ padding: "8px" }}>Low</td>
      <td style={{ padding: "8px" }}>$0.011</td>
      <td style={{ padding: "8px" }}>$0.016</td>
      <td style={{ padding: "8px" }}>$0.016</td>
    </tr>
    <tr>
      <td style={{ padding: "8px" }}>Medium</td>
      <td style={{ padding: "8px" }}>$0.042</td>
      <td style={{ padding: "8px" }}>$0.063</td>
      <td style={{ padding: "8px" }}>$0.063</td>
    </tr>
    <tr>
      <td style={{ padding: "8px" }}>High</td>
      <td style={{ padding: "8px" }}>$0.167</td>
      <td style={{ padding: "8px" }}>$0.25</td>
      <td style={{ padding: "8px" }}>$0.25</td>
    </tr>

    <tr>
      <td rowSpan="3" style={{ padding: "8px", width: "28%" }}>
        GPT Image 1 Mini
      </td>
      <td style={{ padding: "8px" }}>Low</td>
      <td style={{ padding: "8px" }}>$0.005</td>
      <td style={{ padding: "8px" }}>$0.006</td>
      <td style={{ padding: "8px" }}>$0.006</td>
    </tr>
    <tr>
      <td style={{ padding: "8px" }}>Medium</td>
      <td style={{ padding: "8px" }}>$0.011</td>
      <td style={{ padding: "8px" }}>$0.015</td>
      <td style={{ padding: "8px" }}>$0.015</td>
    </tr>
    <tr>
      <td style={{ padding: "8px" }}>High</td>
      <td style={{ padding: "8px" }}>$0.036</td>
      <td style={{ padding: "8px" }}>$0.052</td>
      <td style={{ padding: "8px" }}>$0.052</td>
    </tr>

  </tbody>
</table>

### Partial images cost

If you want to [stream image generation](#streaming) using the `partial_images` parameter, each partial image will incur an additional 100 image output tokens.
``````
:::
:::

