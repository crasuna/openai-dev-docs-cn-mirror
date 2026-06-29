---
status: needs-review
sourceId: "2eced5e46180"
sourceChecksum: "2eced5e4618035e7d27581f29d882a392473be3215c7dae486613d2ec8a20969"
sourceUrl: "https://developers.openai.com/api/docs/guides/video-generation"
translatedAt: "2026-06-27T18:23:55.4970917+08:00"
translator: codex-gpt-5.5-xhigh
---

# 使用 Sora 生成视频

<div className="mt-6 mb-8">
  </div>

## 概览

Sora 是 OpenAI 最新的前沿生成式媒体模型，这是一款先进的视频模型，能够根据自然语言或图像创建细节丰富、动态且带音频的片段。Sora 建立在多年多模态扩散研究之上，并在多样化视觉数据上训练，为文生视频生成带来对 3D 空间、运动和场景连续性的深刻理解。

[Videos API](https://developers.openai.com/api/reference/resources/videos) 首次向开发者开放这些能力，可通过程序化方式创建、延展、编辑和管理视频。

你可以用它来：

- 根据 prompt 创建新视频。
- 使用图像参考引导生成。
- 在多次生成中复用角色资产，以获得更强的视觉一致性。
- 使用视频扩展继续已完成的片段。
- 通过定向修改编辑现有视频。
- 下载完成的视频和支持资产。
- 通过 [Batch API](https://developers.openai.com/api/docs/guides/batch) 提交大型离线渲染队列。

## 模型

第二代 Sora 模型有两个变体，分别面向不同用例。

### Sora 2

`sora-2` 面向 **速度和灵活性** 设计。它非常适合探索阶段：当你在试验语气、结构或视觉风格，并且需要快速反馈而不是完美保真度时使用。

它能快速生成质量良好的结果，适合快速迭代、概念设计和粗剪。对于社交媒体内容、原型，以及周转时间比超高保真度更重要的场景，`sora-2` 往往已经绰绰有余。

### Sora 2 Pro

`sora-2-pro` 会生成更高质量的结果。当你需要 **生产级输出** 时，它是更好的选择。

`sora-2-pro` 渲染时间更长，运行成本更高，但能生成更精致、更稳定的结果。它最适合高分辨率电影感素材、营销资产，以及任何视觉精度非常关键的情况。

当你需要 `1920x1080` 或 `1080x1920` 的 1080p 导出时，请使用 `sora-2-pro`。

`sora-2` 和 `sora-2-pro` 都支持 `16` 秒和 `20` 秒生成。

## 生成视频

生成视频是一个 **异步** 过程：

1. 当你调用 `POST /videos` 端点时，API 会返回一个任务对象，其中包含任务 `id` 和初始 `status`。

2. 你可以轮询 `GET /videos/{video_id}` 端点，直到状态转换为 `completed`；或者使用更高效的方法：通过 webhooks（见下方 webhooks 部分）在任务完成时自动获得通知。

3. 一旦任务到达 `completed` 状态，你就可以使用 `GET /videos/{video_id}/content` 获取最终 MP4 文件。

### 启动渲染任务

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


响应是一个 JSON 对象，包含唯一 id 和初始状态，例如 `queued` 或 `in_progress`。这表示渲染任务已经启动。

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

较长时长和 1080p 任务可能比短 720p 或 480p 渲染花费明显更长时间完成，因此在面向用户的流程中应为更高延迟做好规划。

### 护栏和限制

API 强制执行若干内容限制：

- 仅允许适合 18 岁以下受众的内容（未来会提供绕过此限制的设置）。
- 受版权保护的角色和受版权保护的音乐会被拒绝。
- 不能生成真实人物，包括公众人物。
- 默认会阻止描绘人类相貌的角色上传。
- 当前会拒绝包含人脸的输入图像。

请确保 prompt、参考图像和转录文本遵守这些规则，以避免生成失败。

### 有效编写 prompt

为获得最佳结果，请描述 **镜头类型、主体、动作、场景和灯光**。例如：

- _“Wide shot of a child flying a red kite in a grassy park, golden hour sunlight, camera slowly pans upward.”_（中文释义：宽镜头，一个孩子在草地公园放红色风筝，金色时刻的阳光，镜头缓慢向上摇移。）
- _“Close-up of a steaming coffee cup on a wooden table, morning light through blinds, soft depth of field.”_（中文释义：木桌上一杯冒热气咖啡的特写，晨光穿过百叶窗，浅景深。）

这种具体程度有助于模型生成一致结果，而不会发明不需要的细节。有关更高级的 prompting 技巧，请参阅我们专门的 Sora 2 [prompting guide](https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide)。

### 监控进度

视频生成需要时间。取决于模型、API 负载和分辨率，**单次渲染可能需要几分钟**。

为了高效管理，你可以轮询 API 请求状态更新，也可以通过 webhook 接收通知。

#### 轮询状态端点

使用创建调用返回的 id 调用 `GET /videos/{video_id}`。响应会显示任务当前状态、进度百分比（如果可用）以及任何错误。

典型状态包括 `queued`、`in_progress`、`completed` 和 `failed`。以合理间隔轮询（例如每 10-20 秒一次），必要时使用指数退避，并向用户提供任务仍在进行中的反馈。

轮询状态端点

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

与其反复用 `GET` 轮询任务状态，不如注册一个 [webhook](https://developers.openai.com/api/docs/guides/webhooks)，在视频生成完成或失败时自动收到通知。

可以在你的 [webhook 设置页面](https://platform.openai.com/settings/project/webhooks)配置 Webhooks。当任务结束时，API 会发出两种事件类型之一：`video.completed` 和 `video.failed`。每个事件都包含触发它的任务 ID。

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

一旦任务到达 `completed` 状态，就可以用 `GET /videos/{video_id}/content` 获取 MP4。这个端点会流式返回二进制视频数据和标准内容标头，因此你可以直接把文件保存到磁盘，或将其管道传输到云存储。

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


|                          使用 [OpenAI GPT Image](https://developers.openai.com/api/docs/guides/image-generation) 生成的输入图像                           |                                 使用 Sora 2 生成的视频（转换为 GIF）                                  |
| :---------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------: |
| ![][sora_woman_skyline_original][下载此图像](https://cdn.openai.com/API/docs/images/sora/woman_skyline_original_720p.jpeg) |    ![][sora_woman_skyline_video] Prompt（提示词）: _“She turns around and smiles, then slowly walks out of the frame.”_<br/>中文释义：她转身微笑，然后慢慢走出画面。    |
|    ![][sora_monster_original_jpeg][下载此图像](https://cdn.openai.com/API/docs/images/sora/monster_original_720p.jpeg)     | ![][sora_monster_original_gif] Prompt（提示词）: _“The fridge door opens. A cute, chubby purple monster comes out of it.”_<br/>中文释义：冰箱门打开，一个可爱、胖乎乎的紫色小怪物从里面走出来。 |

## 使用 characters 保持一致性

Characters 让你可以上传可复用的非人类主体，并在多次生成中引用它。这在你希望动物、吉祥物或物体在多个镜头中保持相同核心外观、风格和画面存在感时很有用。

Character uploads 目前最适合短 `2` 到 `4` 秒片段，使用
  `16:9` 或 `9:16`，分辨率从 `720p` 到 `1080p`。角色源视频在
  匹配请求输出宽高比时效果最佳。如果宽高比
  不同，character 可能会显得拉伸或扭曲。单个视频最多可以
  包含两个 characters。

Characters 不同于 `input_reference`。图像参考会调节
单次生成的开头帧，而角色资产可以在
未来的视频请求中复用。

通过将短 MP4 片段上传到 `POST /v1/videos/characters` 创建 character，然后在创建视频时将返回的 character ID 包含在 `characters` 数组中。

默认会阻止描绘人类相貌的 character uploads。请联系
  你的 account manager 或[联系我们的销售
  团队](https://openai.com/contact-sales/)了解 human-likeness access 的资格。

```bash
curl -X POST "https://api.openai.com/v1/videos/characters" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "video=@character.mp4;type=video/mp4" \
  -F "name=Mossy"
```


在 prompt 中逐字提及角色名称。仅传递 character ID
不足以可靠地在镜头中保留角色。

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

Editing 让你可以处理现有视频并进行定向调整，而不必从头重新生成所有内容。使用 prompt 和 `video` reference 发送 `POST /v1/videos/edits`，系统会复用原始结构、连续性和构图，同时应用修改。它在你进行单一、定义明确的更改时效果最佳，因为更小、更聚焦的编辑能保留更多原始保真度，并降低引入伪影的风险。

以前可以使用 remix 端点编辑视频生成结果，该端点
  正在弃用。新的集成请使用 edits 端点。

`video` 字段接受 video ID 或上传的视频。如果传入
video ID，API 会从源视频推断模型。

编辑上传视频仅向符合条件的客户开放。如果你需要此
  工作流，请联系你的 account manager 或[联系我们的销售
  团队](https://openai.com/contact-sales/)。

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


Editing 对迭代尤其有价值，因为它允许你在不丢弃已有有效内容的情况下细化结果。通过将每次编辑约束为一个清晰调整，你可以保持视觉风格、主体一致性和相机取景稳定，同时探索情绪、调色或场景调度的变化。这让你更容易通过小而可靠的步骤构建精致序列。

|         原始视频         |                             编辑后生成的视频                              |
| :----------------------------: | :-----------------------------------------------------------------------------: |
| ![][sora_monster_original_gif] | ![][sora_monster_orange] Prompt（提示词）: _“Change the color of the monster to orange.”_<br/>中文释义：把怪物的颜色改成橙色。 |
| ![][sora_monster_original_gif] | ![][sora_monster_2monsters] Prompt（提示词）: _“A second monster comes out right after.”_<br/>中文释义：紧接着第二个怪物也出来。 |

## 通过 Batch API 运行视频任务

当你需要为离线处理、审核流水线或 studio 工作流排队大量视频渲染时，请使用 [Batch API](https://developers.openai.com/api/docs/guides/batch)。Batch input file 中的每一行都使用与你发送到 `POST /v1/videos` 相同的 JSON request body，因此很适合镜头清单和计划渲染队列。

在 Batch 中进行视频生成：

- Batch 当前仅支持 `POST /v1/videos`。
- Batch 请求必须使用 JSON，而不是 multipart。
- 请提前上传 assets，并从 JSON request body 中引用它们。
- 在 Batch 中使用 `input_reference` 进行图像引导生成。在 JSON requests 中，将 `input_reference` 作为带有 `file_id` 或 `image_url` 的对象传入。
- Batch 不支持 multipart `input_reference` 上传，包括视频参考输入。
- Batch-generated videos 在 batch 完成后最多可下载 `24` 小时。

```jsonl
{"custom_id":"shot-001","method":"POST","url":"/v1/videos","body":{"model":"sora-2-pro","prompt":"Slow dolly shot through a miniature paper city at blue hour, soft fog, practical window lights flickering on.","size":"1920x1080","seconds":"20"}}
{"custom_id":"shot-002","method":"POST","url":"/v1/videos","body":{"model":"sora-2-pro","prompt":"Portrait close-up of a red panda chef plating noodles in a stainless-steel kitchen, shallow depth of field.","size":"1080x1920","seconds":"16"}}
```

当 batch 到达 `completed` 时，其输出中的视频任务已经到达 `completed`、`failed` 或 `expired` 等终止状态。使用稳定的 `custom_id` 值，以便将 batch 结果映射回你的内部镜头 ID、编辑队列或资产流水线，然后使用返回的 video ID 下载最终资产。

## 维护你的资料库

使用 `GET /videos` 枚举你的视频。该端点支持用于分页和排序的可选查询参数。

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
