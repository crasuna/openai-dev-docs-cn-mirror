---
title: "图像与视觉"
description: "Learn how to understand or generate images with the OpenAI API."
outline: deep
---

# 图像与视觉

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/images-vision](https://developers.openai.com/api/docs/guides/images-vision)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/images-vision.md](https://developers.openai.com/api/docs/guides/images-vision.md)
- 抓取时间：2026-06-27T05:54:03.170Z
- Checksum：`9920065b4ed62d8261a2e9dd96e8c7515a389a4d1d31335c4f18cf432094c191`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 概览




在本指南中，你将了解如何使用 OpenAI API 构建涉及图像的应用。
如果你已经知道自己想构建什么，请在下方找到你的用例并开始。如果你不确定从哪里开始，请继续阅读概览。

### 图像相关用例导览

近期的语言模型可以处理图像输入并分析图像；这种能力称为 **视觉（vision）**。GPT Image 模型可以使用文本和图像输入来创建新图像或编辑现有图像。

OpenAI API 提供多个端点，可将图像作为输入处理，或将图像作为输出生成，从而让你构建强大的多模态应用。

| API | 支持的用例 |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| [Responses API](https://developers.openai.com/api/docs/api-reference/responses) | 分析图像并将其用作输入，和/或将图像作为输出生成 |
| [Images API](https://developers.openai.com/api/docs/api-reference/images) | 将图像作为输出生成，可选择使用图像作为输入 |
| [Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat) | 分析图像并将其用作输入，以生成文本或音频 |

如需进一步了解我们的模型支持的输入和输出模态，请参考我们的[模型页面](https://developers.openai.com/api/docs/models)。

## 生成或编辑图像

你可以使用 Images API 或 Responses API 生成或编辑图像。

当前最先进的图像生成模型 `gpt-image-2` 可以理解文本和图像，并利用广泛的世界知识生成指令遵循能力强、具备上下文感知的图像。



使用 Responses 生成图像

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
  fs.writeFileSync("cat_and_otter.png", Buffer.from(imageBase64, "base64"));
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
    with open("cat_and_otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

```bash
openai responses create \
  --model gpt-5.5 \
  --raw-output \
  --transform 'output.#(type=="image_generation_call").result' <<'YAML' | base64 --decode > cat_and_otter.png
tools:
  - type: image_generation
input: Generate an image of a gray tabby cat hugging an otter with an orange scarf.
YAML
```



你可以在我们的[图像生成指南](/mirror/api/docs/guides/image-generation)中了解更多关于图像生成的内容。

### 使用世界知识进行图像生成

GPT Image 模型可以利用对世界的视觉理解，在没有参考图的情况下生成包含真实细节的逼真图像。

例如，如果你 prompt GPT Image 生成一张装有最受欢迎半宝石的玻璃柜图像，模型会知道足以选择紫水晶、粉晶、玉石等宝石，并以写实方式描绘它们。

## 分析图像

**Vision** 是模型“看见”并理解图像的能力。如果图像中有文本，模型也可以理解这些文本。
它可以理解大多数视觉元素，包括物体、形状、颜色和纹理，但仍存在一些[限制](/mirror/api/docs/guides/images-vision#limitations)。

### 将图像作为输入提供给模型





你可以通过多种方式向生成请求提供图像作为输入：

- 提供指向图像文件的完全限定 URL
- 提供图像的 Base64 编码 data URL
- 提供 file ID（使用 [Files API](https://developers.openai.com/api/docs/api-reference/files) 创建）

你可以在单个请求中通过在 `content` 数组中包含多张图像来提供多个图像输入，但请记住，[图像会计为 tokens](/mirror/api/docs/guides/images-vision#calculating-costs)，并会相应计费。




传入 URL
    分析图像内容

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: [{
        role: "user",
        content: [
            { type: "input_text", text: "what's in this image?" },
            {
                type: "input_image",
                image_url: "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
            },
        ],
    }],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "what's in this image?"},
            {
                "type": "input_image",
                "image_url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
            },
        ],
    }],
)

print(response.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

Uri imageUrl = new("https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg");

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is in this image?"),
        ResponseContentPart.CreateInputImagePart(imageUrl)
    ])
]);

Console.WriteLine(response.GetOutputText());
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": [
      {
        "role": "user",
        "content": [
          {"type": "input_text", "text": "what is in this image?"},
          {
            "type": "input_image",
            "image_url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg"
          }
        ]
      }
    ]
  }'
```

```bash
openai responses create \
  --model gpt-5.5 \
  --raw-output \
  --transform 'output.#(type=="message").content.0.text' <<'YAML'
input:
  - role: user
    content:
      - type: input_text
        text: What is in this image?
      - type: input_image
        image_url: https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg
YAML
```



传入 Base64 编码图像
    分析图像内容

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const imagePath = "path_to_your_image.jpg";
const base64Image = fs.readFileSync(imagePath, "base64");

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: [
        {
            role: "user",
            content: [
                { type: "input_text", text: "what's in this image?" },
                {
                    type: "input_image",
                    image_url: `data:image/jpeg;base64,${base64Image}`,
                },
            ],
        },
    ],
});

console.log(response.output_text);
```

```python
import base64
from openai import OpenAI

client = OpenAI()

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


# Path to your image
image_path = "path_to_your_image.jpg"

# Getting the Base64 string
base64_image = encode_image(image_path)


response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                { "type": "input_text", "text": "what's in this image?" },
                {
                    "type": "input_image",
                    "image_url": f"data:image/jpeg;base64,{base64_image}",
                },
            ],
        }
    ],
)

print(response.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

Uri imageUrl = new("https://openai-documentation.vercel.app/images/cat_and_otter.png");
using HttpClient http = new();

// Download an image as stream
using var stream = await http.GetStreamAsync(imageUrl);

OpenAIResponse response1 = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is in this image?"),
        ResponseContentPart.CreateInputImagePart(BinaryData.FromStream(stream), "image/png")
    ])
]);

Console.WriteLine($"From image stream: {response1.GetOutputText()}");

// Download an image as byte array
byte[] bytes = await http.GetByteArrayAsync(imageUrl);

OpenAIResponse response2 = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is in this image?"),
        ResponseContentPart.CreateInputImagePart(BinaryData.FromBytes(bytes), "image/png")
    ])
]);

Console.WriteLine($"From byte array: {response2.GetOutputText()}");
```



传入 file ID
    分析图像内容

```javascript
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI();

// Function to create a file with the Files API
async function createFile(filePath) {
  const fileContent = fs.createReadStream(filePath);
  const result = await openai.files.create({
    file: fileContent,
    purpose: "vision",
  });
  return result.id;
}

// Getting the file ID
const fileId = await createFile("path_to_your_image.jpg");

const response = await openai.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content: [
        { type: "input_text", text: "what's in this image?" },
        {
          type: "input_image",
          file_id: fileId,
        },
      ],
    },
  ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

# Function to create a file with the Files API
def create_file(file_path):
  with open(file_path, "rb") as file_content:
    result = client.files.create(
        file=file_content,
        purpose="vision",
    )
    return result.id

# Getting the file ID
file_id = create_file("path_to_your_image.jpg")

response = client.responses.create(
    model="gpt-5.5",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "what's in this image?"},
            {
                "type": "input_image",
                "file_id": file_id,
            },
        ],
    }],
)

print(response.output_text)
```

```csharp
using OpenAI.Files;
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

string filename = "cat_and_otter.png";
Uri imageUrl = new($"https://openai-documentation.vercel.app/images/{filename}");
using var http = new HttpClient();

// Download an image as stream
using var stream = await http.GetStreamAsync(imageUrl);

OpenAIFileClient files = new(key);
OpenAIFile file = await files.UploadFileAsync(BinaryData.FromStream(stream), filename, FileUploadPurpose.Vision);

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("what's in this image?"),
        ResponseContentPart.CreateInputImagePart(file.Id)
    ])
]);

Console.WriteLine(response.GetOutputText());
```






### 图像输入要求

输入图像必须满足以下要求，才能在 API 中使用。



支持的文件类型

      - PNG (`.png`) - JPEG (`.jpeg` 和 `.jpg`) - WEBP (`.webp`) - 非动画
      GIF (`.gif`)



大小限制

      - 每个请求总 payload size 最高 512 MB - 每个请求最多 1500 个单独
      图像输入



其他要求

      - 无水印或 logo - 无 NSFW 内容 - 足够清晰，便于人类
      理解




### 选择图像 detail level

`detail` 参数会告诉模型在处理和理解图像时使用哪个细节级别（`low`、`high`、`original` 或 `auto`）。如果你省略该参数，模型会使用 `auto`。此行为在 Responses API 和 Chat Completions API 中相同。在 `gpt-5.5` 上，`auto` 与默认省略行为等同于 `original`。




```plain
{
    "type": "input_image",
    "image_url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
    "detail": "original"
}
```



使用以下指导选择 detail level：

| 细节级别 | 最适合 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `low` | 当精细视觉细节不重要时，用于快速、低成本理解。模型会接收图像的低分辨率 512px x 512px 版本。 |
| `high` | 标准的高保真图像理解。 |
| `original` | 大型、密集、对空间敏感或 computer-use 图像。可用于 `gpt-5.4` 和未来模型。 |
| `auto` | 自动选择 detail。在 `gpt-5.5` 上，`auto` 与省略/默认行为等同于 `original`。 |

对于 `gpt-5.4` 和未来模型上的 computer use、localization 和点击准确性用例，我们建议使用 `"detail": "original"`。更多细节请参阅 [Computer use guide](/mirror/api/docs/guides/tools-computer-use)。

关于模型如何调整图像大小，请阅读[模型尺寸处理行为](/mirror/api/docs/guides/images-vision#model-sizing-behavior)部分；关于 token 成本，请阅读下方[计算成本](/mirror/api/docs/guides/images-vision#calculating-costs)部分。

### 模型尺寸处理行为

不同模型在图像 tokenization 之前使用不同的 resizing 规则：



模型系列
支持的 detail 级别
Patch 与尺寸调整行为



gpt-5.5


      &lt;code&gt;low&lt;/code&gt;, &lt;code&gt;high&lt;/code&gt;, &lt;code&gt;original&lt;/code&gt;,
auto


      &lt;code&gt;high&lt;/code&gt; 最多允许 2,500 个 patches，或最大维度为 2048
      pixels。&lt;code&gt;original&lt;/code&gt; 最多允许 10,000 个 patches，或最大维度为
      6000 pixels。如果任一限制被超过，我们会在保留 aspect ratio 的同时调整图像大小，使其适配所选 detail level 下这两个约束中较小的那个。
      &lt;code&gt;auto&lt;/code&gt; 和省略的 &lt;code&gt;detail&lt;/code&gt; 使用与
      &lt;code&gt;original&lt;/code&gt; 相同的 sizing 行为。[完整 resizing 细节见下方。](/mirror/api/docs/guides/images-vision#patch-based-image-tokenization)




gpt-5.4


      &lt;code&gt;low&lt;/code&gt;, &lt;code&gt;high&lt;/code&gt;, &lt;code&gt;original&lt;/code&gt;,
auto


      &lt;code&gt;high&lt;/code&gt; 最多允许 2,500 个 patches，或最大维度为 2048
      pixels。&lt;code&gt;original&lt;/code&gt; 最多允许 10,000 个 patches，或最大维度为
      6000 pixels。如果任一限制被超过，我们会在保留 aspect ratio 的同时调整图像大小，使其适配所选 detail level 下这两个约束中较小的那个。
      &lt;code&gt;auto&lt;/code&gt; 和省略的 &lt;code&gt;detail&lt;/code&gt; 使用与
      &lt;code&gt;high&lt;/code&gt; 相同的 sizing 行为。[完整 resizing 细节见下方。](/mirror/api/docs/guides/images-vision#patch-based-image-tokenization)




      &lt;code&gt;gpt-5.4-mini&lt;/code&gt;, &lt;code&gt;gpt-5.4-nano&lt;/code&gt;,
      &lt;code&gt;gpt-5-mini&lt;/code&gt;, &lt;code&gt;gpt-5-nano&lt;/code&gt;, &lt;code&gt;gpt-5.2&lt;/code&gt;,
      &lt;code&gt;gpt-5.3-codex&lt;/code&gt;, &lt;code&gt;gpt-5-codex-mini&lt;/code&gt;,
      &lt;code&gt;gpt-5.1-codex-mini&lt;/code&gt;, &lt;code&gt;gpt-5.2-codex&lt;/code&gt;,
      &lt;code&gt;gpt-5.2-chat-latest&lt;/code&gt;, &lt;code&gt;o4-mini&lt;/code&gt;, and the 
      &lt;code&gt;gpt-4.1-mini&lt;/code&gt; and &lt;code&gt;gpt-4.1-nano&lt;/code&gt; 2025-04-14
      snapshot variants


low</code>, <code>high</code>, <code>auto


      &lt;code&gt;high&lt;/code&gt; 最多允许 1,536 个 patches，或最大维度为 2048 pixels。如果任一限制被超过，我们会在保留 aspect ratio 的同时调整图像大小，使其适配这两个约束中较小的那个。
      [完整 resizing 细节见下方。](/mirror/api/docs/guides/images-vision#patch-based-image-tokenization)




      &lt;code&gt;GPT-4o&lt;/code&gt;, &lt;code&gt;GPT-4.1&lt;/code&gt;, &lt;code&gt;GPT-4o-mini&lt;/code&gt;,
      &lt;code&gt;computer-use-preview&lt;/code&gt;, and o-series models except
o4-mini


low</code>, <code>high</code>, <code>auto


      使用 tile-based resizing behavior。请见

        下方详细行为





## 计算成本

图像输入会以类似文本输入的 token 单位计量和收费。图像如何转换为文本 token 输入，会因模型而异。你可以在 [pricing page](https://openai.com/api/pricing/) 的 FAQ 部分找到 vision pricing calculator。

### 基于 patch 的图像 tokenization

一些模型会用 32px x 32px patches 覆盖图像来对图像进行 tokenization。每个模型会定义一个最大 patch budget。图像的 token 成本按如下方式确定：

A. 计算覆盖原始图像需要多少个 32px x 32px patches。一个 patch 可能会超出图像边界。

```
original_patch_count = ceil(width/32)×ceil(height/32)
```

B. 如果原始图像会超过模型的 patch budget，则按比例缩小，直到适配该 budget。然后调整缩放比例，确保最终调整后的图像在转换为整数像素尺寸并计算 patch 覆盖后仍保持在 budget 内。

```
shrink_factor = sqrt((32^2 * patch_budget) / (width * height))
adjusted_shrink_factor = shrink_factor * min(
  floor(width * shrink_factor / 32) / (width * shrink_factor / 32),
  floor(height * shrink_factor / 32) / (height * shrink_factor / 32)
)
```

C. 将调整后的缩放比例转换为整数像素尺寸，然后计算覆盖调整后图像所需的 patches 数量。这个 resized patch count 是应用模型乘数前的 image-token count，并且会被模型的 patch budget 封顶。

```
resized_patch_count = ceil(resized_width/32)×ceil(resized_height/32)
```

D. 根据模型应用乘数，得到总 token：

| 模型 | 乘数 |
| --------------- | ---------- |
| `gpt-5.4-mini` | 1.62 |
| `gpt-5.4-nano` | 2.46 |
| `gpt-5-mini` | 1.62 |
| `gpt-5-nano` | 2.46 |
| `gpt-4.1-mini*` | 1.62 |
| `gpt-4.1-nano*` | 2.46 |
| `o4-mini` | 1.72 |

_对于 `gpt-4.1-mini` 和 `gpt-4.1-nano`，这适用于 2025-04-14 snapshot variants。_

**对于 patch budget 为 1,536 的模型，成本计算示例**

- 一张 1024 x 1024 图像在 resize 后的 patch count 为 **1024**
  - A. `original_patch_count = ceil(1024 / 32) * ceil(1024 / 32) = 32 * 32 = 1024`
  - B. `1024` 低于 `1,536` patch budget，因此不需要 resize。
  - C. `resized_patch_count = 1024`
  - 应用模型乘数前的 resized patch count：`1024`
  - 乘以模型的 token 乘数，得到计费 token 单位。
- 一张 1800 x 2400 图像在 resize 后的 patch count 为 **1452**
  - A. `original_patch_count = ceil(1800 / 32) * ceil(2400 / 32) = 57 * 75 = 4275`
  - B. `4275` 超过 `1,536` patch budget，因此我们先计算 `shrink_factor = sqrt((32^2 * 1536) / (1800 * 2400)) = 0.603`。
  - 然后我们调整该缩放比例，使最终整数像素尺寸在 patch counting 后保持在 budget 内：`adjusted_shrink_factor = 0.603 * min(floor(1800 * 0.603 / 32) / (1800 * 0.603 / 32), floor(2400 * 0.603 / 32) / (2400 * 0.603 / 32)) = 0.586`。
  - 整数像素下调整后的图像：`1056 x 1408`
  - C. `resized_patch_count = ceil(1056 / 32) * ceil(1408 / 32) = 33 * 44 = 1452`
  - 应用模型乘数前的 resized patch count：`1452`
  - 乘以模型的 token 乘数，得到计费 token 单位。

### 基于 tile 的图像 tokenization

#### GPT-4o、GPT-4.1、GPT-4o-mini、CUA 和 o-series（o4-mini 除外）

图像的 token 成本由两个因素决定：尺寸和 detail。

任何带有 `"detail": "low"` 的图像都会花费一个固定的 base token 数。这个数额因模型而异。要计算带有 `"detail": "high"` 的图像成本，我们会执行以下步骤：

- 缩放到适配 2048px x 2048px 正方形，同时保持原始 aspect ratio
- 缩放，使图像最短边长度为 768px
- 计算图像中 512px 方块的数量。每个方块花费固定数量的 tokens，如下所示。
- 将基础 token 加到总数中

| 模型 | 基础 token | Tile token |
| ------------------------ | ----------- | ----------- |
| gpt-5, gpt-5-chat-latest | 70 | 140 |
| 4o, 4.1, 4.5 | 85 | 170 |
| 4o-mini | 2833 | 5667 |
| o1, o1-pro, o3 | 75 | 150 |
| computer-use-preview | 65 | 129 |

### GPT Image 1

对于 GPT Image 1，我们使用上文所述的相同方式计算图像输入成本，不同之处在于，我们会将图像缩小，使最短边为 512px，而不是 768px。
价格取决于图像尺寸和[输入保真度](/mirror/api/docs/guides/image-generation#input-fidelity)。

当 input fidelity 设置为 low 时，基础成本为 65 个图像 token，每个 tile 花费 129 个图像 token。
使用 high input fidelity 时，除了上述图像 token 外，我们还会根据图像的宽高比额外添加固定数量的 token。

- 如果你的图像是正方形，我们会添加 4160 个额外输入图像 token。
- 如果它更接近纵向或横向，我们会添加 6240 个额外 token。

如需查看图像输入 token 的价格，请参考我们的[定价页面](/mirror/api/docs/pricing#latest-models)。

## 限制

尽管具备 vision capabilities 的模型功能强大，可以用于许多场景，但理解这些模型的限制很重要。以下是一些已知限制：

- **医学图像**：模型不适合解释 CT 扫描等专业医学图像，也不应用于医疗建议。
- **非英语**：当处理包含非拉丁字母文本的图像时，例如日语或韩语，模型表现可能不是最优。
- **小文本**：放大图像中的文本以提高可读性。可用时，使用 `"detail": "original"` 也有助于提升性能。
- **旋转**：模型可能会误解旋转或倒置的文本和图像。
- **视觉元素**：模型可能难以理解图表，或颜色/样式不同的文本，例如实线、虚线或点线。
- **空间推理**：模型难以处理需要精确空间定位的任务，例如识别国际象棋局面。
- **准确性**：模型在某些场景下可能生成不正确的描述或说明文字。
- **图像形状**：模型难以处理全景图和鱼眼图像。
- **Metadata 和 resizing**：模型不会处理原始文件名或 metadata。根据图像大小和 `detail` level，图像在分析前可能会被调整大小，从而影响其原始尺寸。
- **计数**：模型可能会给出图像中物体数量的近似值。
- **CAPTCHAS**：出于安全原因，我们的系统会阻止提交 CAPTCHAs。

---

我们在 token 级别处理图像，因此我们处理的每张图像都会计入你的每分钟 token 数（TPM）限制。

如需获得最精确且最新的图像处理估算，请使用我们[这里](https://openai.com/api/pricing/)提供的图像定价计算器。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
## Overview

<div className="mb-10 w-full max-w-full overflow-hidden">
  </div>

In this guide, you will learn about building applications involving images with the OpenAI API.
If you know what you want to build, find your use case below to get started. If you're not sure where to start, continue reading to get an overview.

### A tour of image-related use cases

Recent language models can process image inputs and analyze them—a capability known as **vision**. GPT Image models can use text and image inputs to create new images or edit existing ones.

The OpenAI API offers several endpoints to process images as input or generate them as output, enabling you to build powerful multimodal applications.

| API                                                  | Supported use cases                                                   |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| [Responses API](https://developers.openai.com/api/docs/api-reference/responses)   | Analyze images and use them as input and/or generate images as output |
| [Images API](https://developers.openai.com/api/docs/api-reference/images)         | Generate images as output, optionally using images as input           |
| [Chat Completions API](https://developers.openai.com/api/docs/api-reference/chat) | Analyze images and use them as input to generate text or audio        |

To learn more about the input and output modalities supported by our models, refer to our [models page](https://developers.openai.com/api/docs/models).

## Generate or edit images

You can generate or edit images using the Image API or the Responses API.

The state-of-the-art image generation model, `gpt-image-2`, can understand text and images and use broad world knowledge to generate images with strong instruction following and contextual awareness.



Generate images with Responses

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
  fs.writeFileSync("cat_and_otter.png", Buffer.from(imageBase64, "base64"));
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
    with open("cat_and_otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

```cli
openai responses create \
  --model gpt-5.5 \
  --raw-output \
  --transform 'output.#(type=="image_generation_call").result' <<'YAML' | base64 --decode > cat_and_otter.png
tools:
  - type: image_generation
input: Generate an image of a gray tabby cat hugging an otter with an orange scarf.
YAML
```



You can learn more about image generation in our [Image
  generation](https://developers.openai.com/api/docs/guides/image-generation) guide.

### Using world knowledge for image generation

GPT Image models can use visual understanding of the world to generate lifelike images including real-life details without a reference.

For example, if you prompt GPT Image to generate an image of a glass cabinet with the most popular semi-precious stones, the model knows enough to select gemstones like amethyst, rose quartz, jade, etc, and depict them in a realistic way.

## Analyze images

**Vision** is the ability for a model to "see" and understand images. If there is text in an image, the model can also understand the text.
It can understand most visual elements, including objects, shapes, colors, and textures, even if there are some [limitations](#limitations).

### Giving a model images as input





You can provide images as input to generation requests in multiple ways:

- By providing a fully qualified URL to an image file
- By providing an image as a Base64-encoded data URL
- By providing a file ID (created with the [Files API](https://developers.openai.com/api/docs/api-reference/files))

You can provide multiple images as input in a single request by including multiple images in the `content` array, but keep in mind that [images count as tokens](#calculating-costs) and will be billed accordingly.



<div data-content-switcher-pane data-value="url">
    <div class="hidden">Passing a URL</div>
    Analyze the content of an image

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: [{
        role: "user",
        content: [
            { type: "input_text", text: "what's in this image?" },
            {
                type: "input_image",
                image_url: "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
            },
        ],
    }],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "what's in this image?"},
            {
                "type": "input_image",
                "image_url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
            },
        ],
    }],
)

print(response.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

Uri imageUrl = new("https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg");

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is in this image?"),
        ResponseContentPart.CreateInputImagePart(imageUrl)
    ])
]);

Console.WriteLine(response.GetOutputText());
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": [
      {
        "role": "user",
        "content": [
          {"type": "input_text", "text": "what is in this image?"},
          {
            "type": "input_image",
            "image_url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg"
          }
        ]
      }
    ]
  }'
```

```cli
openai responses create \
  --model gpt-5.5 \
  --raw-output \
  --transform 'output.#(type=="message").content.0.text' <<'YAML'
input:
  - role: user
    content:
      - type: input_text
        text: What is in this image?
      - type: input_image
        image_url: https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg
YAML
```

  </div>
  <div data-content-switcher-pane data-value="base64-encoded" hidden>
    <div class="hidden">Passing a Base64 encoded image</div>
    Analyze the content of an image

```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const imagePath = "path_to_your_image.jpg";
const base64Image = fs.readFileSync(imagePath, "base64");

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: [
        {
            role: "user",
            content: [
                { type: "input_text", text: "what's in this image?" },
                {
                    type: "input_image",
                    image_url: `data:image/jpeg;base64,${base64Image}`,
                },
            ],
        },
    ],
});

console.log(response.output_text);
```

```python
import base64
from openai import OpenAI

client = OpenAI()

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


# Path to your image
image_path = "path_to_your_image.jpg"

# Getting the Base64 string
base64_image = encode_image(image_path)


response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                { "type": "input_text", "text": "what's in this image?" },
                {
                    "type": "input_image",
                    "image_url": f"data:image/jpeg;base64,{base64_image}",
                },
            ],
        }
    ],
)

print(response.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

Uri imageUrl = new("https://openai-documentation.vercel.app/images/cat_and_otter.png");
using HttpClient http = new();

// Download an image as stream
using var stream = await http.GetStreamAsync(imageUrl);

OpenAIResponse response1 = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is in this image?"),
        ResponseContentPart.CreateInputImagePart(BinaryData.FromStream(stream), "image/png")
    ])
]);

Console.WriteLine($"From image stream: {response1.GetOutputText()}");

// Download an image as byte array
byte[] bytes = await http.GetByteArrayAsync(imageUrl);

OpenAIResponse response2 = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is in this image?"),
        ResponseContentPart.CreateInputImagePart(BinaryData.FromBytes(bytes), "image/png")
    ])
]);

Console.WriteLine($"From byte array: {response2.GetOutputText()}");
```

  </div>
  <div data-content-switcher-pane data-value="file" hidden>
    <div class="hidden">Passing a file ID</div>
    Analyze the content of an image

```javascript
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI();

// Function to create a file with the Files API
async function createFile(filePath) {
  const fileContent = fs.createReadStream(filePath);
  const result = await openai.files.create({
    file: fileContent,
    purpose: "vision",
  });
  return result.id;
}

// Getting the file ID
const fileId = await createFile("path_to_your_image.jpg");

const response = await openai.responses.create({
  model: "gpt-5.5",
  input: [
    {
      role: "user",
      content: [
        { type: "input_text", text: "what's in this image?" },
        {
          type: "input_image",
          file_id: fileId,
        },
      ],
    },
  ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

# Function to create a file with the Files API
def create_file(file_path):
  with open(file_path, "rb") as file_content:
    result = client.files.create(
        file=file_content,
        purpose="vision",
    )
    return result.id

# Getting the file ID
file_id = create_file("path_to_your_image.jpg")

response = client.responses.create(
    model="gpt-5.5",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "what's in this image?"},
            {
                "type": "input_image",
                "file_id": file_id,
            },
        ],
    }],
)

print(response.output_text)
```

```csharp
using OpenAI.Files;
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

string filename = "cat_and_otter.png";
Uri imageUrl = new($"https://openai-documentation.vercel.app/images/{filename}");
using var http = new HttpClient();

// Download an image as stream
using var stream = await http.GetStreamAsync(imageUrl);

OpenAIFileClient files = new(key);
OpenAIFile file = await files.UploadFileAsync(BinaryData.FromStream(stream), filename, FileUploadPurpose.Vision);

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("what's in this image?"),
        ResponseContentPart.CreateInputImagePart(file.Id)
    ])
]);

Console.WriteLine(response.GetOutputText());
```

  </div>




### Image input requirements

Input images must meet the following requirements to be used in the API.

<table>
  <tr>
    <td>Supported file types</td>
    <td>
      - PNG (`.png`) - JPEG (`.jpeg` and `.jpg`) - WEBP (`.webp`) - Non-animated
      GIF (`.gif`)
    </td>
  </tr>
  <tr>
    <td>Size limits</td>
    <td>
      - Up to 512 MB total payload size per request - Up to 1500 individual
      image inputs per request
    </td>
  </tr>
  <tr>
    <td>Other requirements</td>
    <td>
      - No watermarks or logos - No NSFW content - Clear enough for a human to
      understand
    </td>
  </tr>
</table>

### Choose an image detail level

The `detail` parameter tells the model what level of detail to use when processing and understanding the image (`low`, `high`, `original`, or `auto`). If you skip the parameter, the model will use `auto`. This behavior is the same in both the Responses API and the Chat Completions API. On `gpt-5.5`, `auto` and the default omitted behavior are equivalent to `original`.




  ```plain
{
    "type": "input_image",
    "image_url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
    "detail": "original"
}
```



Use the following guidance to choose a detail level:

| Detail level | Best for                                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `low`        | Fast, low-cost understanding when fine visual detail is not important. The model receives a low-resolution 512px x 512px version of the image. |
| `high`       | Standard high-fidelity image understanding.                                                                                                    |
| `original`   | Large, dense, spatially sensitive, or computer-use images. Available on `gpt-5.4` and future models.                                           |
| `auto`       | Automatic detail selection. On `gpt-5.5`, `auto` and the omitted/default behavior are equivalent to `original`.                                |

For computer use, localization, and click-accuracy use cases on `gpt-5.4` and future models, we recommend `"detail": "original"`. See the [Computer use guide](https://developers.openai.com/api/docs/guides/tools-computer-use) for more detail.

Read more about how models resize images in the [Model sizing
  behavior](#model-sizing-behavior) section, and about token costs in the
  [Calculating costs](#calculating-costs) section below.

### Model sizing behavior

Different models use different resizing rules before image tokenization:

<table>
  <tr>
    <th>Model family</th>
    <th>Supported detail levels</th>
    <th>Patch and resizing behavior</th>
  </tr>
  <tr>
    <td>
      <code>gpt-5.5</code>
    </td>
    <td>
      <code>low</code>, <code>high</code>, <code>original</code>,
      <code>auto</code>
    </td>
    <td>
      <code>high</code> allows up to 2,500 patches or a 2048-pixel maximum
      dimension. <code>original</code> allows up to 10,000 patches or a
      6000-pixel maximum dimension. If either limit is exceeded, we resize the
      image while preserving aspect ratio to fit within the lesser of those two
      constraints for the selected detail level. <code>auto</code> and omitted
      <code>detail</code> use the same sizing behavior as
      <code>original</code>. [Full resizing details
      below.](#patch-based-image-tokenization)
    </td>
  </tr>
  <tr>
    <td>
      <code>gpt-5.4</code>
    </td>
    <td>
      <code>low</code>, <code>high</code>, <code>original</code>,
      <code>auto</code>
    </td>
    <td>
      <code>high</code> allows up to 2,500 patches or a 2048-pixel maximum
      dimension. <code>original</code> allows up to 10,000 patches or a
      6000-pixel maximum dimension. If either limit is exceeded, we resize the
      image while preserving aspect ratio to fit within the lesser of those two
      constraints for the selected detail level. <code>auto</code> and omitted
      <code>detail</code> use the same sizing behavior as
      <code>high</code>.[Full resizing details
      below.](#patch-based-image-tokenization)
    </td>
  </tr>
  <tr>
    <td>
      <code>gpt-5.4-mini</code>, <code>gpt-5.4-nano</code>,
      <code>gpt-5-mini</code>, <code>gpt-5-nano</code>, <code>gpt-5.2</code>,
      <code>gpt-5.3-codex</code>, <code>gpt-5-codex-mini</code>,
      <code>gpt-5.1-codex-mini</code>, <code>gpt-5.2-codex</code>,
      <code>gpt-5.2-chat-latest</code>, <code>o4-mini</code>, and the 
      <code>gpt-4.1-mini</code> and <code>gpt-4.1-nano</code> 2025-04-14
      snapshot variants
    </td>
    <td>
      <code>low</code>, <code>high</code>, <code>auto</code>
    </td>
    <td>
      <code>high</code> allows up to 1,536 patches or a 2048-pixel maximum
      dimension. If either limit is exceeded, we resize the image while
      preserving aspect ratio to fit within the lesser of those two constraints.
      [Full resizing details below.](#patch-based-image-tokenization)
    </td>
  </tr>
  <tr>
    <td>
      <code>GPT-4o</code>, <code>GPT-4.1</code>, <code>GPT-4o-mini</code>,
      <code>computer-use-preview</code>, and o-series models except
      <code>o4-mini</code>
    </td>
    <td>
      <code>low</code>, <code>high</code>, <code>auto</code>
    </td>
    <td>
      Use tile-based resizing behavior. See 
      <a href="#gpt-4o-gpt-41-gpt-4o-mini-cua-and-o-series-except-o4-mini">
        the detailed behavior below
      </a>
    </td>
  </tr>
</table>

## Calculating costs

Image inputs are metered and charged in token units similar to text inputs. How images are converted to text token inputs varies based on the model. You can find a vision pricing calculator in the FAQ section of the [pricing page](https://openai.com/api/pricing/).

### Patch-based image tokenization

Some models tokenize images by covering them with 32px x 32px patches. Each model defines a maximum patch budget. The token cost of an image is determined as follows:

A. Compute how many 32px x 32px patches are needed to cover the original image. A patch may extend beyond the image boundary.

```
original_patch_count = ceil(width/32)×ceil(height/32)
```

B. If the original image would exceed the model's patch budget, scale it down proportionally until it fits within that budget. Then adjust the scale so the final resized image stays within budget after converting to integer pixel dimensions and computing patch coverage.

```
shrink_factor = sqrt((32^2 * patch_budget) / (width * height))
adjusted_shrink_factor = shrink_factor * min(
  floor(width * shrink_factor / 32) / (width * shrink_factor / 32),
  floor(height * shrink_factor / 32) / (height * shrink_factor / 32)
)
```

C. Convert the adjusted scale into integer pixel dimensions, then compute the number of patches needed to cover the resized image. This resized patch count is the image-token count before applying the model multiplier, and it is capped by the model's patch budget.

```
resized_patch_count = ceil(resized_width/32)×ceil(resized_height/32)
```

D. Apply a multiplier based on the model to get the total tokens:

| Model           | Multiplier |
| --------------- | ---------- |
| `gpt-5.4-mini`  | 1.62       |
| `gpt-5.4-nano`  | 2.46       |
| `gpt-5-mini`    | 1.62       |
| `gpt-5-nano`    | 2.46       |
| `gpt-4.1-mini*` | 1.62       |
| `gpt-4.1-nano*` | 2.46       |
| `o4-mini`       | 1.72       |

_For `gpt-4.1-mini` and `gpt-4.1-nano`, this applies to the 2025-04-14 snapshot variants._

**Cost calculation examples for a model with a 1,536-patch budget**

- A 1024 x 1024 image has a post-resize patch count of **1024**
  - A. `original_patch_count = ceil(1024 / 32) * ceil(1024 / 32) = 32 * 32 = 1024`
  - B. `1024` is below the `1,536` patch budget, so no resize is needed.
  - C. `resized_patch_count = 1024`
  - Resized patch count before the model multiplier: `1024`
  - Multiply by the model's token multiplier to get the billed token units.
- A 1800 x 2400 image has a post-resize patch count of **1452**
  - A. `original_patch_count = ceil(1800 / 32) * ceil(2400 / 32) = 57 * 75 = 4275`
  - B. `4275` exceeds the `1,536` patch budget, so we first compute `shrink_factor = sqrt((32^2 * 1536) / (1800 * 2400)) = 0.603`.
  - We then adjust that scale so the final integer pixel dimensions stay within budget after patch counting: `adjusted_shrink_factor = 0.603 * min(floor(1800 * 0.603 / 32) / (1800 * 0.603 / 32), floor(2400 * 0.603 / 32) / (2400 * 0.603 / 32)) = 0.586`.
  - Resized image in integer pixels: `1056 x 1408`
  - C. `resized_patch_count = ceil(1056 / 32) * ceil(1408 / 32) = 33 * 44 = 1452`
  - Resized patch count before the model multiplier: `1452`
  - Multiply by the model's token multiplier to get the billed token units.

### Tile-based image tokenization

#### GPT-4o, GPT-4.1, GPT-4o-mini, CUA, and o-series (except o4-mini)

The token cost of an image is determined by two factors: size and detail.

Any image with `"detail": "low"` costs a set, base number of tokens. This amount varies by model. To calculate the cost of an image with `"detail": "high"`, we do the following:

- Scale to fit in a 2048px x 2048px square, maintaining original aspect ratio
- Scale so that the image's shortest side is 768px long
- Count the number of 512px squares in the image. Each square costs a set amount of tokens, shown below.
- Add the base tokens to the total

| Model                    | Base tokens | Tile tokens |
| ------------------------ | ----------- | ----------- |
| gpt-5, gpt-5-chat-latest | 70          | 140         |
| 4o, 4.1, 4.5             | 85          | 170         |
| 4o-mini                  | 2833        | 5667        |
| o1, o1-pro, o3           | 75          | 150         |
| computer-use-preview     | 65          | 129         |

### GPT Image 1

For GPT Image 1, we calculate the cost of an image input the same way as described above, except that we scale down the image so that the shortest side is 512px instead of 768px.
The price depends on the dimensions of the image and the [input fidelity](https://developers.openai.com/api/docs/guides/image-generation?image-generation-model=gpt-image-1#input-fidelity).

When input fidelity is set to low, the base cost is 65 image tokens, and each tile costs 129 image tokens.
When using high input fidelity, we add a set number of tokens based on the image's aspect ratio in addition to the image tokens described above.

- If your image is square, we add 4160 extra input image tokens.
- If it is closer to portrait or landscape, we add 6240 extra tokens.

To see pricing for image input tokens, refer to our [pricing page](https://developers.openai.com/api/docs/pricing#latest-models).

## Limitations

While models with vision capabilities are powerful and can be used in many situations, it's important to understand the limitations of these models. Here are some known limitations:

- **Medical images**: The model is not suitable for interpreting specialized medical images like CT scans and shouldn't be used for medical advice.
- **Non-English**: The model may not perform optimally when handling images with text of non-Latin alphabets, such as Japanese or Korean.
- **Small text**: Enlarge text within the image to improve readability. When available, using `"detail": "original"` can also help performance.
- **Rotation**: The model may misinterpret rotated or upside-down text and images.
- **Visual elements**: The model may struggle to understand graphs or text where colors or styles—like solid, dashed, or dotted lines—vary.
- **Spatial reasoning**: The model struggles with tasks requiring precise spatial localization, such as identifying chess positions.
- **Accuracy**: The model may generate incorrect descriptions or captions in certain scenarios.
- **Image shape**: The model struggles with panoramic and fisheye images.
- **Metadata and resizing**: The model doesn't process original file names or metadata. Depending on image size and `detail` level, images may be resized before analysis, affecting their original dimensions.
- **Counting**: The model may give approximate counts for objects in images.
- **CAPTCHAS**: For safety reasons, our system blocks the submission of CAPTCHAs.

---

We process images at the token level, so each image we process counts towards your tokens per minute (TPM) limit.

For the most precise and up-to-date estimates for image processing, please use our image pricing calculator available [here](https://openai.com/api/pricing/).
``````
:::
:::

