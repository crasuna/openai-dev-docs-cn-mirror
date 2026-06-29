---
title: "使用 Sora 生成视频"
description: "Learn how to generate, refine, and manage videos using the OpenAI Videos API."
outline: deep
---

# 使用 Sora 生成视频

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/video-generation](https://developers.openai.com/api/docs/guides/video-generation)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/video-generation.md](https://developers.openai.com/api/docs/guides/video-generation.md)
- 抓取时间：2026-06-27T05:54:11.773Z
- Checksum：`2eced5e4618035e7d27581f29d882a392473be3215c7dae486613d2ec8a20969`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre



## 概览

Sora 是 OpenAI 最新的生成式媒体前沿模型，这是一款先进的视频模型，能够根据自然语言或图像创建细节丰富、动态且带音频的片段。Sora 建立在多年多模态 diffusion 研究之上，并在多样化视觉数据上训练，为 text-to-video generation 带来对 3D 空间、运动和场景连续性的深刻理解。

[Videos API](/mirror/api/reference/resources/videos) 首次向开发者开放这些能力，可通过程序化方式创建、延展、编辑和管理视频。

你可以用它来：

- 根据 prompts 创建新视频。
- 使用图像参考引导生成。
- 在多次生成中复用角色资产，以获得更强的视觉一致性。
- 使用视频扩展继续已完成的片段。
- 通过定向修改编辑现有视频。
- 下载完成的视频和支持资产。
- 通过 [Batch API](/mirror/api/docs/guides/batch) 提交大型离线渲染队列。

## 模型

第二代 Sora 模型有两个变体，分别面向不同用例。

### Sora 2

`sora-2` 面向 **速度和灵活性** 设计。它非常适合探索阶段：当你在试验 tone、结构或视觉风格，并且需要快速反馈而不是完美保真度时使用。

它能快速生成质量良好的结果，适合快速迭代、概念设计和 rough cuts。对于社交媒体内容、原型，以及周转时间比超高保真度更重要的场景，`sora-2` 往往已经绰绰有余。

### Sora 2 Pro

`sora-2-pro` 会生成更高质量的结果。当你需要 **production-quality output** 时，它是更好的选择。

`sora-2-pro` 渲染时间更长，运行成本更高，但能生成更精致、更稳定的结果。它最适合高分辨率电影感素材、营销资产，以及任何视觉精度非常关键的情况。

当你需要 `1920x1080` 或 `1080x1920` 的 1080p 导出时，请使用 `sora-2-pro`。

`sora-2` 和 `sora-2-pro` 都支持 `16` 秒和 `20` 秒生成。

## 生成视频

生成视频是一个 **异步** 过程：

1. 当你调用 `POST /videos` endpoint 时，API 会返回一个 job object，其中包含 job `id` 和初始 `status`。

2. 你可以轮询 `GET /videos/{video_id}` endpoint，直到状态转换为 completed；或者使用更高效的方法：通过 webhooks（见下方 webhooks 部分）在 job 完成时自动获得通知。

3. 一旦 job 到达 `completed` 状态，你就可以使用 `GET /videos/{video_id}/content` 获取最终 MP4 文件。

### 启动渲染 job

先使用文本 prompt 和必需参数调用 `POST /videos`。Prompt 定义创意观感，包括主体、镜头、灯光和运动；`size`、`seconds` 等参数控制视频的分辨率和长度。

创建视频

```python
from openai import OpenAI

openai = OpenAI()

video = openai.videos.create(
    model="sora-2",
    prompt="A video of a cool cat on a motorcycle in the night",
)

print("Video generation started:", video)
```

```bash
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F prompt="Wide tracking shot of a teal coupe driving through a desert highway, heat ripples visible, hard sun overhead." \
  -F model="sora-2-pro" \
  -F size="1280x720" \
  -F seconds="8" \
```


响应是一个 JSON 对象，包含唯一 id 和初始状态，例如 `queued` 或 `in_progress`。这表示渲染 job 已经启动。

```shell
{
  "id": "video_68d7512d07848190b3e45da0ecbebcde004da08e1e0678d5",
  "object": "video",
  "created_at": 1758941485,
  "status": "queued",
  "model": "sora-2-pro",
  "progress": 0,
  "seconds": "8",
  "size": "1280x720"
}
```

### 选择尺寸和时长

选择能满足生产需求的最小格式：

- 在迭代 prompt、运动或构图时使用较短片段。
- 当你需要更长的节奏、更完整的场景或更完整的广告片段时，生成最长 `20` 秒的视频。
- 对于 `1920x1080` 或 `1080x1920` 的更高分辨率导出，使用 `sora-2-pro`。

较长时长和 1080p jobs 可能比短 720p 或 480p renders 花费明显更长时间完成，因此在面向用户的流程中应为更高延迟做好规划。

### Guardrails 和限制

API 强制执行若干内容限制：

- 仅允许适合 18 岁以下受众的内容（未来会提供绕过此限制的设置）。
- 受版权保护的角色和受版权保护的音乐会被拒绝。
- 不能生成真实人物，包括公众人物。
- 默认会阻止描绘人类相貌的 character uploads。
- 当前会拒绝包含人脸的输入图像。

请确保 prompts、reference images 和 transcripts 遵守这些规则，以避免生成失败。

### 有效 prompting

为获得最佳结果，请描述 **镜头类型、主体、动作、场景和灯光**。例如：

- _“Wide shot of a child flying a red kite in a grassy park, golden hour sunlight, camera slowly pans upward.”_
- _“Close-up of a steaming coffee cup on a wooden table, morning light through blinds, soft depth of field.”_

这种具体程度有助于模型生成一致结果，而不会发明不需要的细节。有关更高级的 prompting 技巧，请参阅我们专门的 Sora 2 [prompting guide](https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide)。

### 监控进度

视频生成需要时间。取决于模型、API 负载和分辨率，**单次渲染可能需要几分钟**。

为了高效管理，你可以轮询 API 请求状态更新，也可以通过 webhook 接收通知。

#### 轮询状态 endpoint

使用创建调用返回的 id 调用 `GET /videos/{video_id}`。响应会显示 job 当前状态、进度百分比（如果可用）以及任何错误。

典型状态包括 `queued`、`in_progress`、`completed` 和 `failed`。以合理间隔轮询（例如每 10-20 秒一次），必要时使用 exponential backoff，并向用户提供 job 仍在进行中的反馈。

轮询状态 endpoint

```javascript
import OpenAI from 'openai';

const openai = new OpenAI();

async function main() {
  const video = await openai.videos.createAndPoll({
    model: 'sora-2',
    prompt: "A video of the words 'Thank you' in sparkling letters",
  });

  if (video.status === 'completed') {
    console.log('Video successfully completed: ', video);
  } else {
    console.log('Video creation failed. Status: ', video.status);
  }
}

main();
```

```python
import asyncio

from openai import AsyncOpenAI

client = AsyncOpenAI()


async def main() -> None:
    video = await client.videos.create_and_poll(
        model="sora-2",
        prompt="A video of a cat on a motorcycle",
    )

    if video.status == "completed":
        print("Video successfully completed: ", video)
    else:
        print("Video creation failed. Status: ", video.status)


asyncio.run(main())
```


响应示例：

```shell
{
  "id": "video_68d7512d07848190b3e45da0ecbebcde004da08e1e0678d5",
  "object": "video",
  "created_at": 1758941485,
  "status": "in_progress",
  "model": "sora-2-pro",
  "progress": 33,
  "seconds": "8",
  "size": "1280x720"
}
```

#### 使用 webhooks 接收通知

与其反复用 `GET` 轮询 job 状态，不如注册一个 [webhook](/mirror/api/docs/guides/webhooks)，在视频生成完成或失败时自动收到通知。

可以在你的 [webhook settings page](https://platform.openai.com/settings/project/webhooks) 配置 Webhooks。当 job 结束时，API 会发出两种 event types 之一：`video.completed` 和 `video.failed`。每个 event 都包含触发它的 job ID。

Webhook payload 示例：

```
{
  "id": "evt_abc123",
  "object": "event",
  "created_at": 1758941485,
  "type": "video.completed", // or "video.failed"
  "data": {
    "id": "video_abc123"
  }
}
```

### 检索结果

#### 下载 MP4

一旦 job 到达 `completed` 状态，就可以用 `GET /videos/{video_id}/content` 获取 MP4。这个 endpoint 会流式返回二进制视频数据和标准内容 headers，因此你可以直接把文件保存到磁盘，或将其管道传输到 cloud storage。

下载 MP4

```javascript
import OpenAI from 'openai';

const openai = new OpenAI();

let video = await openai.videos.create({
    model: 'sora-2',
    prompt: "A video of the words 'Thank you' in sparkling letters",
});

console.log('Video generation started: ', video);
let progress = video.progress ?? 0;

while (video.status === 'in_progress' || video.status === 'queued') {
    video = await openai.videos.retrieve(video.id);
    progress = video.progress ?? 0;

    // Display progress bar
    const barLength = 30;
    const filledLength = Math.floor((progress / 100) * barLength);
    // Simple ASCII progress visualization for terminal output
    const bar = '='.repeat(filledLength) + '-'.repeat(barLength - filledLength);
    const statusText = video.status === 'queued' ? 'Queued' : 'Processing';

    process.stdout.write(`${statusText}: [${bar}] ${progress.toFixed(1)}%`);

    await new Promise((resolve) => setTimeout(resolve, 2000));
}

// Clear the progress line and show completion
process.stdout.write('\n');

if (video.status === 'failed') {
    console.error('Video generation failed');
    return;
}

console.log('Video generation completed: ', video);

console.log('Downloading video content...');

const content = await openai.videos.downloadContent(video.id);

const body = content.arrayBuffer();
const buffer = Buffer.from(await body);

require('fs').writeFileSync('video.mp4', buffer);

console.log('Wrote video.mp4');
```

```bash
curl -L "https://api.openai.com/v1/videos/video_abc123/content" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output video.mp4
```

```python
from openai import OpenAI
import sys
import time


openai = OpenAI()

video = openai.videos.create(
    model="sora-2",
    prompt="A video of a cool cat on a motorcycle in the night",
)

print("Video generation started:", video)

progress = getattr(video, "progress", 0)
bar_length = 30

while video.status in ("in_progress", "queued"):
    # Refresh status
    video = openai.videos.retrieve(video.id)
    progress = getattr(video, "progress", 0)

    filled_length = int((progress / 100) * bar_length)
    bar = "=" * filled_length + "-" * (bar_length - filled_length)
    status_text = "Queued" if video.status == "queued" else "Processing"

    sys.stdout.write(f"\r{status_text}: [{bar}] {progress:.1f}%")
    sys.stdout.flush()
    time.sleep(2)

# Move to next line after progress loop
sys.stdout.write("\n")

if video.status == "failed":
    message = getattr(
        getattr(video, "error", None), "message", "Video generation failed"
    )
    print(message)
    return

print("Video generation completed:", video)
print("Downloading video content...")

content = openai.videos.download_content(video.id, variant="video")
content.write_to_file("video.mp4")

print("Wrote video.mp4")
```


现在你已经获得可用于播放、编辑或分发的最终视频文件。下载 URL 在生成后最多有效 1 小时。如果需要长期存储，请及时将文件复制到你自己的存储系统。

#### 下载支持资产

对于每个已完成视频，你还可以下载 **thumbnail** 和 **spritesheet**。这些是轻量资产，可用于预览、scrubbers 或目录显示。使用 `variant` query parameter 指定要下载的内容。默认是用于 MP4 的 `variant=video`。

```bash
# Download a thumbnail
curl -L "https://api.openai.com/v1/videos/video_abc123/content?variant=thumbnail" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output thumbnail.webp

# Download a spritesheet
curl -L "https://api.openai.com/v1/videos/video_abc123/content?variant=spritesheet" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output spritesheet.jpg
```


## 使用图像参考

你可以用输入图像引导生成，它会作为 **视频的第一帧**。如果你需要输出视频保留品牌资产、角色或特定环境的外观，这会很有用。

根据请求类型选择 `input_reference` 格式：

- 在 `multipart/form-data` 请求中，将 `input_reference` 与上传的图像一起使用。
- 在 `application/json` 请求（包括 Batch）中，将 `input_reference` 与 JSON object 一起使用。JSON 形式接受 `file_id` 或 `image_url`。

图像必须匹配目标视频的分辨率（`size`）。

支持的文件格式为 `image/jpeg`、`image/png` 和 `image/webp`。

```bash
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F prompt="She turns around and smiles, then slowly walks out of the frame." \
  -F model="sora-2-pro" \
  -F size="1280x720" \
  -F seconds="8" \
  -F input_reference="@sample_720p.jpeg;type=image/jpeg"
```


|                          使用 [OpenAI GPT Image](/mirror/api/docs/guides/image-generation) 生成的输入图像                           |                                 使用 Sora 2 生成的视频（转换为 GIF）                                  |
| :---------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------: |
| ![][sora_woman_skyline_original][Download this image](https://cdn.openai.com/API/docs/images/sora/woman_skyline_original_720p.jpeg) |    ![][sora_woman_skyline_video] Prompt: _“She turns around and smiles, then slowly walks out of the frame.”_    |
|    ![][sora_monster_original_jpeg][Download this image](https://cdn.openai.com/API/docs/images/sora/monster_original_720p.jpeg)     | ![][sora_monster_original_gif] Prompt: _“The fridge door opens. A cute, chubby purple monster comes out of it.”_ |

## 使用 characters 保持一致性

Characters 让你可以上传可复用的非人类主体，并在多次生成中引用它。这在你希望动物、吉祥物或物体在多个镜头中保持相同核心外观、风格和画面存在感时很有用。

Character uploads 目前最适合短 `2` 到 `4` 秒片段，使用
  `16:9` 或 `9:16`，分辨率从 `720p` 到 `1080p`。Character source videos 在
  匹配请求输出宽高比时效果最佳。如果宽高比
  不同，character 可能会显得拉伸或扭曲。单个视频最多可以
  包含两个 characters。

Characters 不同于 `input_reference`。图像参考会调节
单次生成的开头帧，而 character asset 可以在
未来的视频请求中复用。

通过将短 MP4 片段上传到 `POST /v1/videos/characters` 创建 character，然后在创建视频时将返回的 character ID 包含在 `characters` 数组中。

默认会阻止描绘人类相貌的 character uploads。请联系
  你的 account manager 或[联系我们的销售 团队](https://openai.com/contact-sales/)了解 human-likeness access 的资格。

```bash
curl -X POST "https://api.openai.com/v1/videos/characters" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "video=@character.mp4;type=video/mp4" \
  -F "name=Mossy"
```


在 prompt 中逐字提及 character name。仅传递 character ID
不足以可靠地在镜头中保留 character。

Characters 可以与 `input_reference` 结合使用。Extensions 不支持
characters。

```bash
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sora-2",
    "prompt": "A cinematic tracking shot of Mossy, a moss-covered teapot mascot, weaving through a lantern-lit market at dusk.",
    "size": "1280x720",
    "seconds": "8",
    "characters": [
      { "id": "char_123" }
    ]
  }'
```


## 扩展已完成视频

Video extensions 让你继续现有已完成视频，并创建新的拼接结果。请在 `POST /v1/videos/extensions` 的 `video` 字段中提供源视频，添加描述场景应如何继续的 prompt，API 会使用完整源片段作为上下文生成下一个片段。

当你希望保留运动、相机方向和场景连续性时，请使用 extensions。如果你只需要控制新生成的开头帧，请改用 `input_reference`。

每次 extension 最多可以增加 `20` 秒。单个视频最多可扩展
  六次，总长度最多 `120` 秒。Extensions
  当前只接受源视频和 prompt。它们不支持 characters
  或图像参考。

```bash
curl -X POST "https://api.openai.com/v1/videos/extensions" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "video": {
      "id": "video_abc123"
    },
    "prompt": "Continue the scene as the camera rises over the rooftops and reveals the sunrise.",
    "seconds": "8"
  }'
```


## 编辑现有视频

Editing 让你可以处理现有视频并进行定向调整，而不必从头重新生成所有内容。使用 prompt 和 `video` reference 发送 `POST /v1/videos/edits`，系统会复用原始结构、连续性和构图，同时应用修改。它在你进行单一、定义明确的更改时效果最佳，因为更小、更聚焦的 edits 能保留更多原始保真度，并降低引入 artifacts 的风险。

以前可以使用 remix endpoint 编辑视频生成结果，该 endpoint
  正在弃用。新的集成请使用 edits endpoint。

`video` 字段接受 video ID 或上传的视频。如果传入
video ID，API 会从源视频推断模型。

编辑上传视频仅向符合条件的客户开放。如果你需要此
  工作流，请联系你的 account manager 或[联系我们的销售 团队](https://openai.com/contact-sales/)。

```bash
curl -X POST "https://api.openai.com/v1/videos/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "video": {
      "id": "video_abc123"
    },
    "prompt": "Shift the color palette to teal, sand, and rust, with a warm backlight."
  }'
```


如果你上传新视频而不是编辑现有生成结果，请在请求中显式设置
`model`。

```bash
curl -X POST "https://api.openai.com/v1/videos/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "video=@source.mp4;type=video/mp4" \
  -F "model=sora-2-pro" \
  -F "prompt=Shift the color palette to teal, sand, and rust, with a warm backlight."
```


Editing 对迭代尤其有价值，因为它允许你在不丢弃已有有效内容的情况下细化结果。通过将每次 edit 约束为一个清晰调整，你可以保持视觉风格、主体一致性和相机 framing 稳定，同时探索 mood、palette 或 staging 的变化。这让你更容易通过小而可靠的步骤构建精致序列。

|         原始视频         |                             编辑后生成的视频                              |
| :----------------------------: | :-----------------------------------------------------------------------------: |
| ![][sora_monster_original_gif] | ![][sora_monster_orange] Prompt: _“Change the color of the monster to orange.”_ |
| ![][sora_monster_original_gif] | ![][sora_monster_2monsters] Prompt: _“A second monster comes out right after.”_ |

## 通过 Batch API 运行视频 jobs

当你需要为离线处理、审核流水线或 studio 工作流排队大量视频 renders 时，请使用 [Batch API](/mirror/api/docs/guides/batch)。Batch input file 中的每一行都使用与你发送到 `POST /v1/videos` 相同的 JSON request body，因此很适合 shot lists 和计划渲染队列。

在 Batch 中进行视频生成：

- Batch 当前仅支持 `POST /v1/videos`。
- Batch requests 必须使用 JSON，而不是 multipart。
- 请提前上传 assets，并从 JSON request body 中引用它们。
- 在 Batch 中使用 `input_reference` 进行图像引导生成。在 JSON requests 中，将 `input_reference` 作为带有 `file_id` 或 `image_url` 的对象传入。
- Batch 不支持 multipart `input_reference` uploads，包括视频参考输入。
- Batch-generated videos 在 batch 完成后最多可下载 `24` 小时。

```jsonl
{"custom_id":"shot-001","method":"POST","url":"/v1/videos","body":{"model":"sora-2-pro","prompt":"Slow dolly shot through a miniature paper city at blue hour, soft fog, practical window lights flickering on.","size":"1920x1080","seconds":"20"}}
{"custom_id":"shot-002","method":"POST","url":"/v1/videos","body":{"model":"sora-2-pro","prompt":"Portrait close-up of a red panda chef plating noodles in a stainless-steel kitchen, shallow depth of field.","size":"1080x1920","seconds":"16"}}
```

当 batch 到达 `completed` 时，其输出中的 video jobs 已经到达 `completed`、`failed` 或 `expired` 等终止状态。使用稳定的 `custom_id` 值，以便将 batch 结果映射回你的内部 shot IDs、editorial queue 或 asset pipeline，然后使用返回的 video IDs 下载最终 assets。

## 维护你的资料库

使用 `GET /videos` 枚举你的视频。该 endpoint 支持用于分页和排序的可选 query parameters。

```bash
curl "https://api.openai.com/v1/videos?limit=20&after=video_123&order=asc" \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq .
```


使用 `DELETE /videos/{video_id}` 从 OpenAI 的存储中移除不再需要的视频。

```bash
curl -X DELETE "https://api.openai.com/v1/videos/REPLACE_WITH_YOUR_VIDEO_ID" \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq .
```


[sora_woman_skyline_original]: https://cdn.openai.com/API/docs/images/sora/sora_woman_skyline_original_2.jpeg
[sora_woman_skyline_video]: https://cdn.openai.com/API/docs/images/sora/sora_woman_skyline_video.gif
[sora_monster_original_jpeg]: https://cdn.openai.com/API/docs/images/sora/sora_monster_original_2.jpeg
[sora_monster_original_gif]: https://cdn.openai.com/API/docs/images/sora/sora_monster_original.gif
[sora_monster_orange]: https://cdn.openai.com/API/docs/images/sora/sora_monster_orange.gif
[sora_monster_2monsters]: https://cdn.openai.com/API/docs/images/sora/sora_monster_2monsters.gif

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
<div className="mt-6 mb-8">
  </div>

## Overview

Sora is OpenAI’s newest frontier in generative media – a state-of-the-art video model capable of creating richly detailed, dynamic clips with audio from natural language or images. Built on years of research into multimodal diffusion and trained on diverse visual data, Sora brings a deep understanding of 3D space, motion, and scene continuity to text-to-video generation.

The [Videos API](https://developers.openai.com/api/reference/resources/videos) exposes these capabilities to developers for the first time, enabling programmatic creation, extension, editing, and management of videos.

You can use it to:

- Create new videos from prompts.
- Guide a generation with an image reference.
- Reuse character assets across multiple generations for stronger visual consistency.
- Continue a completed clip with video extensions.
- Edit an existing video with targeted changes.
- Download finished videos and supporting assets.
- Submit large offline render queues through the [Batch API](https://developers.openai.com/api/docs/guides/batch).

## Models

The second generation Sora model comes in two variants, each tailored for different use cases.

### Sora 2

`sora-2` is designed for **speed and flexibility**. It’s ideal for the exploration phase, when you’re experimenting with tone, structure, or visual style and need quick feedback rather than perfect fidelity.

It generates good quality results quickly, making it well suited for rapid iteration, concepting, and rough cuts. `sora-2` is often more than sufficient for social media content, prototypes, and scenarios where turnaround time matters more than ultra-high fidelity.

### Sora 2 Pro

`sora-2-pro` produces higher quality results. It’s the better choice when you need **production-quality output**.

`sora-2-pro` takes longer to render and is more expensive to run, but it produces more polished, stable results. It’s best for high-resolution cinematic footage, marketing assets, and any situation where visual precision is critical.

Use `sora-2-pro` when you need 1080p exports in `1920x1080` or `1080x1920`.

Both `sora-2` and `sora-2-pro` support `16`- and `20`-second generations.

## Generate a video

Generating a video is an **asynchronous** process:

1. When you call the `POST /videos` endpoint, the API returns a job object with a job `id` and an initial `status`.

2. You can either poll the `GET /videos/{video_id}` endpoint until the status transitions to completed, or – for a more efficient approach – use webhooks (see the webhooks section below) to be notified automatically when the job finishes.

3. Once the job has reached the `completed` state you can fetch the final MP4 file with `GET /videos/{video_id}/content`.

### Start a render job

Start by calling `POST /videos` with a text prompt and the required parameters. The prompt defines the creative look and feel – subjects, camera, lighting, and motion – while parameters like `size` and `seconds` control the video's resolution and length.

Create a video

```python
from openai import OpenAI

openai = OpenAI()

video = openai.videos.create(
    model="sora-2",
    prompt="A video of a cool cat on a motorcycle in the night",
)

print("Video generation started:", video)
```

```bash
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F prompt="Wide tracking shot of a teal coupe driving through a desert highway, heat ripples visible, hard sun overhead." \
  -F model="sora-2-pro" \
  -F size="1280x720" \
  -F seconds="8" \
```


The response is a JSON object with a unique id and an initial status such as `queued` or `in_progress`. This means the render job has started.

```shell
{
  "id": "video_68d7512d07848190b3e45da0ecbebcde004da08e1e0678d5",
  "object": "video",
  "created_at": 1758941485,
  "status": "queued",
  "model": "sora-2-pro",
  "progress": 0,
  "seconds": "8",
  "size": "1280x720"
}
```

### Choose size and duration

Pick the smallest format that meets your production needs:

- Use shorter clips when you are iterating on prompt, motion, or composition.
- Generate videos up to `20` seconds when you need longer beats, fuller scenes, or fuller spots.
- Use `sora-2-pro` for higher-resolution exports in `1920x1080` or `1080x1920`.

Longer durations and 1080p jobs can take materially longer to complete than short 720p or 480p renders, so plan for higher latency in user-facing flows.

### Guardrails and restrictions

The API enforces several content restrictions:

- Only content suitable for audiences under 18 (a setting to bypass this restriction will be available in the future).
- Copyrighted characters and copyrighted music will be rejected.
- Real people—including public figures—cannot be generated.
- Character uploads that depict human likeness are blocked by default.
- Input images with faces of humans are currently rejected.

Make sure prompts, reference images, and transcripts respect these rules to avoid failed generations.

### Effective prompting

For best results, describe **shot type, subject, action, setting, and lighting**. For example:

- _“Wide shot of a child flying a red kite in a grassy park, golden hour sunlight, camera slowly pans upward.”_
- _“Close-up of a steaming coffee cup on a wooden table, morning light through blinds, soft depth of field.”_

This level of specificity helps the model produce consistent results without inventing unwanted details. For more advanced prompting techniques, please refer to our dedicated Sora 2 [prompting guide](https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide).

### Monitor progress

Video generation takes time. Depending on model, API load and resolution, **a single render may take several minutes**.

To manage this efficiently, you can poll the API to request status updates or you can get notified via a webhook.

#### Poll the status endpoint

Call `GET /videos/{video_id}` with the id returned from the create call. The response shows the job’s current status, progress percentage (if available), and any errors.

Typical states are `queued`, `in_progress`, `completed`, and `failed`. Poll at a reasonable interval (for example, every 10–20 seconds), use exponential backoff if necessary, and provide feedback to users that the job is still in progress.

Poll the status endpoint

```javascript
import OpenAI from 'openai';

const openai = new OpenAI();

async function main() {
  const video = await openai.videos.createAndPoll({
    model: 'sora-2',
    prompt: "A video of the words 'Thank you' in sparkling letters",
  });

  if (video.status === 'completed') {
    console.log('Video successfully completed: ', video);
  } else {
    console.log('Video creation failed. Status: ', video.status);
  }
}

main();
```

```python
import asyncio

from openai import AsyncOpenAI

client = AsyncOpenAI()


async def main() -> None:
    video = await client.videos.create_and_poll(
        model="sora-2",
        prompt="A video of a cat on a motorcycle",
    )

    if video.status == "completed":
        print("Video successfully completed: ", video)
    else:
        print("Video creation failed. Status: ", video.status)


asyncio.run(main())
```


Response example:

```shell
{
  "id": "video_68d7512d07848190b3e45da0ecbebcde004da08e1e0678d5",
  "object": "video",
  "created_at": 1758941485,
  "status": "in_progress",
  "model": "sora-2-pro",
  "progress": 33,
  "seconds": "8",
  "size": "1280x720"
}
```

#### Use webhooks for notifications

Instead of polling job status repeatedly with `GET`, register a [webhook](https://developers.openai.com/api/docs/guides/webhooks) to be notified automatically when a video generation completes or fails.

Webhooks can be configured in your [webhook settings page](https://platform.openai.com/settings/project/webhooks). When a job finishes, the API emits one of two event types: `video.completed` and `video.failed`. Each event includes the ID of the job that triggered it.

Example webhook payload:

```
{
  "id": "evt_abc123",
  "object": "event",
  "created_at": 1758941485,
  "type": "video.completed", // or "video.failed"
  "data": {
    "id": "video_abc123"
  }
}
```

### Retrieve results

#### Download the MP4

Once the job reaches status `completed`, fetch the MP4 with `GET /videos/{video_id}/content`. This endpoint streams the binary video data and returns standard content headers, so you can either save the file directly to disk or pipe it to cloud storage.

Download the MP4

```javascript
import OpenAI from 'openai';

const openai = new OpenAI();

let video = await openai.videos.create({
    model: 'sora-2',
    prompt: "A video of the words 'Thank you' in sparkling letters",
});

console.log('Video generation started: ', video);
let progress = video.progress ?? 0;

while (video.status === 'in_progress' || video.status === 'queued') {
    video = await openai.videos.retrieve(video.id);
    progress = video.progress ?? 0;

    // Display progress bar
    const barLength = 30;
    const filledLength = Math.floor((progress / 100) * barLength);
    // Simple ASCII progress visualization for terminal output
    const bar = '='.repeat(filledLength) + '-'.repeat(barLength - filledLength);
    const statusText = video.status === 'queued' ? 'Queued' : 'Processing';

    process.stdout.write(`${statusText}: [${bar}] ${progress.toFixed(1)}%`);

    await new Promise((resolve) => setTimeout(resolve, 2000));
}

// Clear the progress line and show completion
process.stdout.write('\n');

if (video.status === 'failed') {
    console.error('Video generation failed');
    return;
}

console.log('Video generation completed: ', video);

console.log('Downloading video content...');

const content = await openai.videos.downloadContent(video.id);

const body = content.arrayBuffer();
const buffer = Buffer.from(await body);

require('fs').writeFileSync('video.mp4', buffer);

console.log('Wrote video.mp4');
```

```bash
curl -L "https://api.openai.com/v1/videos/video_abc123/content" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output video.mp4
```

```python
from openai import OpenAI
import sys
import time


openai = OpenAI()

video = openai.videos.create(
    model="sora-2",
    prompt="A video of a cool cat on a motorcycle in the night",
)

print("Video generation started:", video)

progress = getattr(video, "progress", 0)
bar_length = 30

while video.status in ("in_progress", "queued"):
    # Refresh status
    video = openai.videos.retrieve(video.id)
    progress = getattr(video, "progress", 0)

    filled_length = int((progress / 100) * bar_length)
    bar = "=" * filled_length + "-" * (bar_length - filled_length)
    status_text = "Queued" if video.status == "queued" else "Processing"

    sys.stdout.write(f"\r{status_text}: [{bar}] {progress:.1f}%")
    sys.stdout.flush()
    time.sleep(2)

# Move to next line after progress loop
sys.stdout.write("\n")

if video.status == "failed":
    message = getattr(
        getattr(video, "error", None), "message", "Video generation failed"
    )
    print(message)
    return

print("Video generation completed:", video)
print("Downloading video content...")

content = openai.videos.download_content(video.id, variant="video")
content.write_to_file("video.mp4")

print("Wrote video.mp4")
```


You now have the final video file ready for playback, editing, or distribution. Download URLs are valid for a maximum of 1 hour after generation. If you need long-term storage, copy the file to your own storage system promptly.

#### Download supporting assets

For each completed video, you can also download a **thumbnail** and a **spritesheet**. These are lightweight assets useful for previews, scrubbers, or catalog displays. Use the `variant` query parameter to specify what you want to download. The default is `variant=video` for the MP4.

```bash
# Download a thumbnail
curl -L "https://api.openai.com/v1/videos/video_abc123/content?variant=thumbnail" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output thumbnail.webp

# Download a spritesheet
curl -L "https://api.openai.com/v1/videos/video_abc123/content?variant=spritesheet" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output spritesheet.jpg
```


## Use image references

You can guide a generation with an input image, which acts as **the first frame of your video**. This is useful if you need the output video to preserve the look of a brand asset, a character, or a specific environment.

Choose the `input_reference` format based on the request type:

- Use `input_reference` with an uploaded image in `multipart/form-data` requests.
- Use `input_reference` with a JSON object in `application/json` requests, including Batch. The JSON form accepts either `file_id` or `image_url`.

The image must match the target video's resolution (`size`).

Supported file formats are `image/jpeg`, `image/png`, and `image/webp`.

```bash
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F prompt="She turns around and smiles, then slowly walks out of the frame." \
  -F model="sora-2-pro" \
  -F size="1280x720" \
  -F seconds="8" \
  -F input_reference="@sample_720p.jpeg;type=image/jpeg"
```


|                          Input image generated with [OpenAI GPT Image](https://developers.openai.com/api/docs/guides/image-generation)                           |                                 Generated video using Sora 2 (converted to GIF)                                  |
| :---------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------: |
| ![][sora_woman_skyline_original][Download this image](https://cdn.openai.com/API/docs/images/sora/woman_skyline_original_720p.jpeg) |    ![][sora_woman_skyline_video] Prompt: _“She turns around and smiles, then slowly walks out of the frame.”_    |
|    ![][sora_monster_original_jpeg][Download this image](https://cdn.openai.com/API/docs/images/sora/monster_original_720p.jpeg)     | ![][sora_monster_original_gif] Prompt: _“The fridge door opens. A cute, chubby purple monster comes out of it.”_ |

## Use characters for consistency

Characters let you upload a reusable non-human subject and reference it across multiple generations. This is useful when you want an animal, mascot, or object to keep the same core appearance, styling, and screen presence across several shots.

Character uploads currently work best with short `2`- to `4`-second clips in
  `16:9` or `9:16`, at `720p` to `1080p`. Character source videos work best when
  they match the aspect ratio of the requested output. If the aspect ratios
  differ, the character can appear stretched or distorted. A single video can
  include up to two characters.

Characters are different from `input_reference`. An image reference conditions
the opening frame of a single generation, while a character asset can be reused
across future video requests.

Create the character by uploading a short MP4 clip to `POST /v1/videos/characters`, then include the returned character ID in the `characters` array when you create a video.

Character uploads that depict human likeness are blocked by default. Contact
  your account manager or [reach out to our sales
  team](https://openai.com/contact-sales/) to learn more about eligibility for
  human-likeness access.

```bash
curl -X POST "https://api.openai.com/v1/videos/characters" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "video=@character.mp4;type=video/mp4" \
  -F "name=Mossy"
```


Mention the character name verbatim in your prompt. Passing the character ID
alone isn't enough to reliably preserve the character in the shot.

Characters can be combined with `input_reference`. Extensions don't support
characters.

```bash
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sora-2",
    "prompt": "A cinematic tracking shot of Mossy, a moss-covered teapot mascot, weaving through a lantern-lit market at dusk.",
    "size": "1280x720",
    "seconds": "8",
    "characters": [
      { "id": "char_123" }
    ]
  }'
```


## Extend completed videos

Video extensions let you continue an existing completed video and create a new stitched result. Provide the source video in the `video` field to `POST /v1/videos/extensions`, add a prompt describing how the scene should continue, and the API generates the next segment using the full source clip as context.

Use extensions when you want to preserve motion, camera direction, and scene continuity. If you only need to control the opening frame of a new generation, use `input_reference` instead.

Each extension can add up to `20` seconds. A single video can be extended up
  to six times, for a maximum total length of `120` seconds. Extensions
  currently accept only a source video and prompt. They don't support characters
  or image references.

```bash
curl -X POST "https://api.openai.com/v1/videos/extensions" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "video": {
      "id": "video_abc123"
    },
    "prompt": "Continue the scene as the camera rises over the rooftops and reveals the sunrise.",
    "seconds": "8"
  }'
```


## Edit existing videos

Editing lets you take an existing video and make targeted adjustments without regenerating everything from scratch. Send `POST /v1/videos/edits` with a prompt and a `video` reference, and the system reuses the original structure, continuity, and composition while applying the modification. This works best when you make a single, well-defined change because smaller, focused edits preserve more of the original fidelity and reduce the risk of introducing artifacts.

Video generations could previously be edited using the remix endpoint, which
  is being deprecated. Use the edits endpoint for new integrations.

The `video` field accepts either a video ID or an uploaded video. If you pass a
video ID, the API infers the model from the source video.

Editing uploaded videos is only available to eligible customers. Contact your
  account manager or [reach out to our sales
  team](https://openai.com/contact-sales/) if you need this workflow.

```bash
curl -X POST "https://api.openai.com/v1/videos/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "video": {
      "id": "video_abc123"
    },
    "prompt": "Shift the color palette to teal, sand, and rust, with a warm backlight."
  }'
```


If you upload a new video instead of editing an existing generation, set
`model` explicitly in the request.

```bash
curl -X POST "https://api.openai.com/v1/videos/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "video=@source.mp4;type=video/mp4" \
  -F "model=sora-2-pro" \
  -F "prompt=Shift the color palette to teal, sand, and rust, with a warm backlight."
```


Editing is especially valuable for iteration because it lets you refine without discarding what already works. By constraining each edit to one clear adjustment, you keep the visual style, subject consistency, and camera framing stable, while still exploring variations in mood, palette, or staging. This makes it far easier to build polished sequences through small, reliable steps.

|         Original video         |                             Edited generated video                              |
| :----------------------------: | :-----------------------------------------------------------------------------: |
| ![][sora_monster_original_gif] | ![][sora_monster_orange] Prompt: _“Change the color of the monster to orange.”_ |
| ![][sora_monster_original_gif] | ![][sora_monster_2monsters] Prompt: _“A second monster comes out right after.”_ |

## Run video jobs through the Batch API

Use the [Batch API](https://developers.openai.com/api/docs/guides/batch) when you need to queue many video renders for offline processing, review pipelines, or studio workflows. Each line in the batch input file uses the same JSON request body you would send to `POST /v1/videos`, which makes it a good fit for shot lists and scheduled render queues.

For video generation in Batch:

- Batch currently supports `POST /v1/videos` only.
- Batch requests must use JSON, not multipart.
- Upload assets ahead of time and reference them from the JSON request body.
- Use `input_reference` for image-guided generations in Batch. In JSON requests, pass `input_reference` as an object with either `file_id` or `image_url`.
- Multipart `input_reference` uploads, including video reference inputs, aren't supported in Batch.
- Batch-generated videos are available for download for up to `24` hours after the batch completes.

```jsonl
{"custom_id":"shot-001","method":"POST","url":"/v1/videos","body":{"model":"sora-2-pro","prompt":"Slow dolly shot through a miniature paper city at blue hour, soft fog, practical window lights flickering on.","size":"1920x1080","seconds":"20"}}
{"custom_id":"shot-002","method":"POST","url":"/v1/videos","body":{"model":"sora-2-pro","prompt":"Portrait close-up of a red panda chef plating noodles in a stainless-steel kitchen, shallow depth of field.","size":"1080x1920","seconds":"16"}}
```

When a batch reaches `completed`, the video jobs in its output have already reached a terminal state such as `completed`, `failed`, or `expired`. Use stable `custom_id` values so you can map batch results back to your internal shot IDs, editorial queue, or asset pipeline, then download final assets with the returned video IDs.

## Maintain your library

Use `GET /videos` to enumerate your videos. The endpoint supports optional query parameters for pagination and sorting.

```bash
curl "https://api.openai.com/v1/videos?limit=20&after=video_123&order=asc" \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq .
```


Use `DELETE /videos/{video_id}` to remove videos you no longer need from OpenAI’s storage.

```bash
curl -X DELETE "https://api.openai.com/v1/videos/REPLACE_WITH_YOUR_VIDEO_ID" \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq .
```


[sora_woman_skyline_original]: https://cdn.openai.com/API/docs/images/sora/sora_woman_skyline_original_2.jpeg
[sora_woman_skyline_video]: https://cdn.openai.com/API/docs/images/sora/sora_woman_skyline_video.gif
[sora_monster_original_jpeg]: https://cdn.openai.com/API/docs/images/sora/sora_monster_original_2.jpeg
[sora_monster_original_gif]: https://cdn.openai.com/API/docs/images/sora/sora_monster_original.gif
[sora_monster_orange]: https://cdn.openai.com/API/docs/images/sora/sora_monster_orange.gif
[sora_monster_2monsters]: https://cdn.openai.com/API/docs/images/sora/sora_monster_2monsters.gif
``````
:::
:::

