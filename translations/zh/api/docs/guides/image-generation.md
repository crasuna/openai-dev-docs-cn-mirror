---
status: needs-review
sourceId: "cb9b1a99d1c9"
sourceChecksum: "cb9b1a99d1c9283f8aebee0018178fec39a21185ffb592b0446fce9cf34a3523"
sourceUrl: "https://developers.openai.com/api/docs/guides/image-generation"
translatedAt: "2026-06-27T17:45:12.7147584+08:00"
translator: codex-gpt-5.5-xhigh
---

# Image generation 图像生成

## 概览

OpenAI API 允许你使用 GPT Image models 根据文本 prompt 生成和编辑图像，包括我们最新的 `gpt-image-2`。你可以通过两个 API 访问图像生成能力：

### Image API

从 `gpt-image-1` 及后续模型开始，[Image API](https://developers.openai.com/api/docs/api-reference/images) 提供两个 endpoint，每个 endpoint 都有不同能力：

- **Generations**：根据文本 prompt 从零开始[生成图像](#generate-images)
- **Edits**：使用新的 prompt [修改已有图像](#edit-images)，可以局部修改，也可以整体修改

Image API 还为支持 variations 的模型提供 variations endpoint，例如 DALL·E 2。

### Responses API

[Responses API](https://developers.openai.com/api/docs/api-reference/responses/create#responses-create-tools) 允许你把图像生成作为对话或多步骤流程的一部分。它支持把图像生成作为[内置工具](https://developers.openai.com/api/docs/guides/tools?api-mode=responses)，并在上下文中接受图像输入和输出。

与 Image API 相比，它增加了：

- **多轮编辑**：通过 prompting 对图像进行迭代式高保真编辑
- **灵活输入**：接受图像 [File](https://developers.openai.com/api/docs/api-reference/files) ID 作为输入图像，而不仅限于字节数据

Responses API 的图像生成工具使用自己的 GPT Image model 选择机制。有关支持调用此工具的主线模型详情，请参阅下方的[支持的模型](#supported-models)。

### 选择合适的 API

- 如果你只需要根据一个 prompt 生成或编辑单张图像，Image API 是最佳选择。
- 如果你想用 GPT Image 构建可对话、可编辑的图像体验，请选择 Responses API。

使用 Image API 时，你会直接选择一个 GPT Image model。使用 Responses API 时，你会选择一个支持图像生成工具的主线模型；该工具会处理 GPT Image model 选择。Responses API 请求除了图像生成成本外，还包含主线模型的 token 用量。

两个 API 都允许你通过调整 quality、size、format 和 compression 来[自定义输出](#customize-image-output)。透明背景取决于模型支持情况。

本指南聚焦于 GPT Image。

为确保这些模型得到负责任的使用，在使用 GPT Image models（包括 `gpt-image-2`、`gpt-image-1.5`、`gpt-image-1` 和 `gpt-image-1-mini`）之前，你可能需要在 [developer console](https://platform.openai.com/settings/organization/general) 中完成 [API
  Organization
  Verification](https://help.openai.com/en/articles/10910291-api-organization-verification)。

<div
  className="not-prose"
  style={{ float: "right", margin: "10px 0 10px 10px" }}
>
  <img src="https://cdn.openai.com/API/docs/images/mug.png"
    alt="木桌上的米色咖啡杯"
    style={{ height: "180px", width: "auto", borderRadius: "8px" }}
  />
</div>

## 生成图像

你可以使用[图像生成 endpoint](https://developers.openai.com/api/docs/api-reference/images/create)，根据文本 prompt 创建图像；也可以使用 Responses API 中的[图像生成工具](https://developers.openai.com/api/docs/guides/tools?api-mode=responses)，把图像生成作为对话的一部分。

要进一步了解如何自定义输出（size、quality、format、compression），请参阅下方的[自定义图像输出](#customize-image-output)小节。

你可以设置 `n` 参数，在单个请求中一次生成多张图像（默认情况下，API 返回一张图像）。



<div data-content-switcher-pane data-value="image">
    <div class="hidden">Image API</div>
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

  </div>



### 多轮图像生成

使用 Responses API 时，你可以通过在上下文中提供 image generation call outputs（也可以只使用 image ID），或通过使用 [`previous_response_id` 参数](https://developers.openai.com/api/docs/guides/conversation-state?api-mode=responses#openai-apis-for-conversation-state)，构建涉及图像生成的多轮对话。
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



<div data-content-switcher-pane data-value="responseid">
    <div class="hidden">使用 previous response ID</div>
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

  </div>
  <div data-content-switcher-pane data-value="imageid" hidden>
    <div class="hidden">使用 image ID</div>
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

  </div>



#### 结果

<div className="not-prose">
  <table style={{ width: "100%" }}>
    <tbody>
      <tr>
        <td style={{ verticalAlign: "top", padding: "0 16px 16px 0" }}>
          “生成一张灰色虎斑猫抱着一只戴橙色围巾的水獭的图像”
        </td>
        <td
          style={{
            textAlign: "right",
            verticalAlign: "top",
            paddingBottom: "16px",
          }}
        >
          <img src="https://cdn.openai.com/API/docs/images/cat_and_otter.png"
            alt="一只猫和一只水獭"
            style={{ width: "200px", borderRadius: "8px" }}
          />
        </td>
      </tr>
      <tr>
        <td style={{ verticalAlign: "top", padding: "0 16px 0 0" }}>
          “现在让它看起来写实一些”
        </td>
        <td style={{ textAlign: "right", verticalAlign: "top" }}>
          <img src="https://cdn.openai.com/API/docs/images/cat_and_otter_realistic.png"
            alt="一只猫和一只水獭"
            style={{ width: "200px", borderRadius: "8px" }}
          />
        </td>
      </tr>
    </tbody>
  </table>
</div>

### Streaming

Responses API 和 Image API 都支持流式图像生成。你可以在 API 生成图像时流式接收部分图像，从而提供更具交互性的体验。

你可以调整 `partial_images` 参数，以接收 0 到 3 张 partial images。

- 如果将 `partial_images` 设置为 0，你只会收到最终图像。
- 对于大于 0 的值，如果完整图像生成得更快，你收到的 partial images 数量可能少于请求数量。



<div data-content-switcher-pane data-value="responses">
    <div class="hidden">Responses API</div>
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

  </div>
  <div data-content-switcher-pane data-value="image" hidden>
    <div class="hidden">Image API</div>
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

  </div>



#### 结果

<div className="images-examples">

| Partial 1                                                                                                                       | Partial 2                                                                                                                       | Final image                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| <img className="images-example-image" src="https://cdn.openai.com/API/docs/images/imgen1p5-streaming1.png" alt="第 1 张 partial" /> | <img className="images-example-image" src="https://cdn.openai.com/API/docs/images/imgen1p5-streaming2.png" alt="第 2 张 partial" /> | <img className="images-example-image" src="https://cdn.openai.com/API/docs/images/imgen1p5-streaming3.png" alt="第 3 张 partial" /> |

</div>

<div className="images-edit-prompt body-small">
  Prompt: 画一张华丽的图像：一条由白色猫头鹰羽毛组成的河流，蜿蜒穿过宁静的冬季景观
</div>

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

<div data-content-switcher-pane data-value="responses">
    <div class="hidden">Responses API</div>
    </div>
  <div data-content-switcher-pane data-value="image" hidden>
    <div class="hidden">Image API</div>
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



### 使用 mask 编辑图像

你可以提供 mask 来指明图像中的哪一部分应被编辑。

使用 GPT Image 的 mask 时，会向模型发送额外指令，帮助相应地引导编辑过程。

GPT Image 的 masking 完全基于 prompt。模型会把 mask 作为指导，但不一定能以完全精确的方式遵循其具体形状。

如果你提供多张输入图像，mask 会应用到第一张图像。



<div data-content-switcher-pane data-value="responses">
    <div class="hidden">Responses API</div>
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

  </div>
  <div data-content-switcher-pane data-value="image" hidden>
    <div class="hidden">Image API</div>
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
| <img className="images-example-image" src="https://cdn.openai.com/API/docs/images/sunlit_lounge.png" alt="带泳池的粉色房间" /> | <img className="images-example-image" src="https://cdn.openai.com/API/docs/images/mask.png" alt="泳池一部分上的 mask" /> | <img className="images-example-image" src="https://cdn.openai.com/API/docs/images/sunlit_lounge_result.png" alt="原来的泳池中由充气火烈鸟替换 mask 区域" /> |

</div>

<div className="images-edit-prompt body-small">
  Prompt: 一个阳光照进来的室内休息区，带有一个装着火烈鸟的泳池
</div>

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

由于 `gpt-image-2` 始终以高保真处理图像输入，包含 reference images 的编辑请求可能会使用更多 image input tokens。要了解成本影响，请参阅 [vision
  costs](https://developers.openai.com/api/docs/guides/images-vision?api-mode=responses#calculating-costs)
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

<table>
  <tbody>
    <tr>
      <td>常用尺寸</td>
      <td>
        <ul>
          <li>
            <code>1024x1024</code>（正方形）
          </li>
          <li>
            <code>1536x1024</code>（横向）
          </li>
          <li>
            <code>1024x1536</code>（纵向）
          </li>
          <li>
            <code>2048x2048</code>（2K 正方形）
          </li>
          <li>
            <code>2048x1152</code>（2K 横向）
          </li>
          <li>
            <code>3840x2160</code>（4K 横向）
          </li>
          <li>
            <code>2160x3840</code>（4K 纵向）
          </li>
          <li>
            <code>auto</code>（默认）
          </li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>尺寸约束</td>
      <td>
        <ul>
          <li>
            最大边长必须小于或等于 
            <code>3840px</code>
          </li>
          <li>
            两条边都必须是 <code>16px</code> 的倍数
          </li>
          <li>
            长边与短边的比例不得超过 <code>3:1</code>
          </li>
          <li>
            总像素数必须至少为 <code>655,360</code>，且不超过 
            <code>8,294,400</code>
          </li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Quality 选项</td>
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
            <code>auto</code>（默认）
          </li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

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

处理图像生成失败的方式与处理其他 API 错误相同：检查 HTTP status 或 SDK exception type，记录 request ID，并参阅 [error codes guide](https://developers.openai.com/api/docs/guides/error-codes)，了解 authentication、quota、rate-limit 和 server failures。对于 `429` 和 `5xx` 等瞬时故障，retry 是合适的；但对于需要修改请求的图像生成用户错误，不应 retry。

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

请注意，你还需要计入 [input tokens](https://developers.openai.com/api/docs/guides/images-vision?api-mode=responses#calculating-costs)：prompt 的 text tokens，以及编辑图像时输入图像的 image tokens。
由于 `gpt-image-2` 始终以高保真处理图像输入，包含 reference images 的编辑请求可能会使用更多 input tokens。

请参阅 [pricing page](https://developers.openai.com/api/docs/pricing#image-generation) 获取当前 text 和 image token 价格，并使用下方的[计算成本](#calculating-costs)小节估算请求成本。

最终成本由以下部分相加得到：

- input text tokens
- 使用 edits endpoint 时的 input image tokens
- image output tokens

### 计算成本

使用下方 pricing calculator 估算 GPT Image models 的请求成本。
`gpt-image-2` 支持数千种有效分辨率；下表列出了与之前 GPT Image models 相同的尺寸，以便比较。对于 GPT Image 1.5、GPT Image 1 和 GPT Image 1 Mini，下面还列出了旧版按图像计费的 output pricing table。在估算请求总成本时，你仍然应计入 text 和 image input tokens。

在相同 quality 设置下，更大的非正方形分辨率有时可能比更小或正方形分辨率产生更少 output tokens。

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
        <span style={{ fontSize: "0.875em" }}>还有其他尺寸可用</span>
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

### Partial images 成本

如果你想使用 `partial_images` 参数[流式生成图像](#streaming)，每张 partial image 都会额外产生 100 个 image output tokens。
