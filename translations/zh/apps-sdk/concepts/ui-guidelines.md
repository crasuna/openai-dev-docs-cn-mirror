---
status: needs-review
sourceId: "1aaf29efbae1"
sourceChecksum: "1aaf29efbae1478705ef26bc2c0c05c668053ece5351296d8ffcd8af1f0b6cc4"
sourceUrl: "https://developers.openai.com/apps-sdk/concepts/ui-guidelines"
translatedAt: "2026-06-27T19:35:17.0701114+08:00"
translator: codex-gpt-5.5-xhigh
---

# UI 指南

## 概览

Apps 是开发者构建、可在 ChatGPT 中使用的体验。它们通过轻量 cards、carousels、fullscreen views 和其他 display modes 出现，顺畅集成到 ChatGPT 界面中，在不中断对话流的情况下扩展用户可以完成的事情。

在开始为应用进行视觉设计前，请确保你已经阅读我们推荐的 [UX principles](https://developers.openai.com/apps-sdk/concepts/ux-principles)。

![ChatGPT 移动端界面中的示例应用](https://developers.openai.com/images/apps-sdk/overview.png)

## 设计系统

为了帮助你设计出高质量、感觉原生于 ChatGPT 的应用，你可以使用 [Apps SDK UI](https://openai.github.io/apps-sdk-ui/) 设计系统。

它提供基于 Tailwind 的样式基础、CSS variable design tokens，以及一套精心制作、可访问的组件库。

使用 Apps SDK UI 不是构建应用的必需条件，但它会让为 ChatGPT 构建应用更快、更容易，并且更符合 ChatGPT design system。

在深入代码前，请先使用我们的 [Figma component library](https://www.figma.com/community/file/1625636989296445101) 开始设计。

## 显示模式

显示模式是开发者用来在 ChatGPT 中为应用创建体验的界面形态。它们让合作伙伴能够展示内容和动作，同时感觉原生于对话。每种模式都为特定类型的交互而设计，从快速确认到沉浸式工作流。

一致地使用这些模式有助于让体验保持简单且可预测。

### Inline

inline 显示模式会直接出现在对话流中。Inline surface 当前总是出现在生成的模型响应之前。每个应用最初都会以 inline 形式出现。

![ChatGPT 中 inline cards 和 carousels 示例](https://developers.openai.com/images/apps-sdk/inline_display_mode.png)

**布局**

- **Icon & tool call**：带有应用名称和图标的标签。
- **Inline display**：嵌入在模型响应上方、包含应用内容的轻量 display。
- **Follow-up**：在 widget 之后显示的简短模型生成响应，用于建议编辑、后续步骤或相关动作。避免与 card 重复的内容。

#### 内联卡片

直接嵌入对话中的轻量、单一用途 widgets。它们提供快速确认、简单动作或视觉辅助。

![Inline cards 示例](https://developers.openai.com/images/apps-sdk/inline_cards.png)

**使用场景**

- 单个动作或决策（例如确认预订）。
- 少量结构化数据（例如地图、订单摘要或快速状态）。
- 完全自包含的 widget 或 tool（例如音频播放器或记分卡）。

**布局**

![Inline cards 图解](https://developers.openai.com/images/apps-sdk/inline_card_layout.png)

- **Title**：如果你的 card 基于文档，或包含带有父元素的项目（例如播放列表中的歌曲），请包含标题。
- **Expand**：如果 card 包含富媒体或交互性内容（例如地图或交互式图表），用它打开 fullscreen display mode。
- **Show more**：如果以列表呈现多个结果，用它披露更多项目。
- **Edit controls**：为 app responses 提供内联支持，同时不要压倒对话。
- **Primary actions**：最多两个动作，放在 card 底部。动作应执行一次 conversation turn 或一次 tool call。

**交互**

![Inline cards 交互模式图解](https://developers.openai.com/images/apps-sdk/inline_card_interaction.png)

Cards 支持简单的直接交互。

- **States**：所做编辑会被持久化。
- **Simple direct edits**：在合适时，inline editable text 允许用户快速编辑，而无需提示模型。
- **Dynamic layout**：Card 布局可以展开高度以匹配内容，最高到移动端 viewport 的高度。

**经验规则**

- **限制每张 card 的 primary actions**：最多支持两个动作，其中一个 primary CTA 和一个可选 secondary CTA。
- **不要在 card 内进行深层导航或多视图。** Cards 不应包含多个 drill-ins、tabs 或更深层导航。请考虑把它们拆成单独 cards 或 tool actions。
- **不要嵌套滚动**。Cards 应自动适配内容并防止内部滚动。
- **不要重复输入能力**。不要在 card 中复制 ChatGPT 功能。

![Inline cards 中应避免的模式示例](https://developers.openai.com/images/apps-sdk/inline_card_rules.png)

#### 内联轮播

一组并排呈现的 cards，让用户快速浏览并从多个选项中选择。

![Inline carousel 示例](https://developers.openai.com/images/apps-sdk/inline_carousel.png)

**使用场景**

- 呈现一小组相似项目（例如餐厅、播放列表、活动）。
- 项目包含的视觉内容和 metadata 多于简单行可容纳的内容。

**布局**

![Inline carousel 布局图解](https://developers.openai.com/images/apps-sdk/inline_carousel_layout.png)

- **Image**：项目应始终包含图像或视觉元素。
- **Title**：Carousel 项目通常应包含标题，用于解释内容。
- **Metadata**：使用 metadata 显示在响应上下文中关于该项目最重要、最相关的信息。避免显示超过两行文本。
- **Badge**：在合适时使用 badge 显示辅助上下文。
- **Actions**：尽可能为每个项目提供一个清晰的 CTA。

**经验规则**

- 为了便于浏览，每个 carousel 保持 **3-8 个项目**。
- 将 metadata 缩减到最相关细节，最多三行。
- 每张 card 可以有一个可选 CTA（例如 “Book” 或 “Play”）。
- 在 cards 之间使用一致的视觉层级。

### Fullscreen

沉浸式体验会展开到 inline card 之外，为多步骤工作流或更深入探索提供空间。ChatGPT composer 会保持叠加显示，让用户可以在 fullscreen view 的上下文中继续通过自然对话“与应用交谈”。

![Fullscreen 示例](https://developers.openai.com/images/apps-sdk/fullscreen.png)

**使用场景**

- 无法简化为单张 card 的丰富任务（例如带 pins 的可探索地图、丰富编辑画布或交互式图表）。
- 浏览详细内容（例如房地产 listings、菜单）。

**布局**

![Fullscreen 布局图解](https://developers.openai.com/images/apps-sdk/fullscreen_layout.png)

- **System close**：关闭 sheet 或 view。
- **Fullscreen view**：内容区域。
- **Composer**：ChatGPT 原生 composer，允许用户在 fullscreen view 的上下文中跟进。

**交互**

![Fullscreen 交互模式](https://developers.openai.com/images/apps-sdk/fullscreen_interaction_a.png)

- **Chat sheet**：在 fullscreen surface 旁保持对话上下文。
- **Thinking**：composer input 会 “shimmer” 以显示响应正在 streaming。
- **Response**：模型完成响应后，一个短暂、截断的 snippet 会显示在 composer 上方。点击它会打开 chat sheet。

**经验规则**

- **让你的 UX 与系统 composer 协同工作**。composer 在 fullscreen 中始终存在，因此请确保你的体验支持可触发 tool calls、且让用户感觉自然的对话式提示。
- **使用 fullscreen 加深参与度**，不要完整复制你的原生应用。

### Picture-in-picture (PiP)

PiP 是 ChatGPT 内部的持久浮动窗口，针对游戏或视频等持续或实时 sessions 优化。PiP 会在对话继续时保持可见，并且可以响应用户提示动态更新。

![Picture-in-picture 示例](https://developers.openai.com/images/apps-sdk/pip.png)

**使用场景**

- **与对话并行运行的活动**，例如游戏、实时协作、quiz 或学习 session。
- **PiP widget 可以响应聊天输入的情况**，例如继续游戏回合或根据用户请求刷新实时数据。

**交互**

![Picture-in-picture 交互模式](https://developers.openai.com/images/apps-sdk/fullscreen_interaction.png)

- **Activated:** 滚动时，PiP window 会固定在 viewport 顶部
- **Pinned:** PiP 会保持固定，直到用户关闭它或 session 结束。
- **Session ends:** PiP 回到 inline 位置并随滚动离开。

**经验规则**

- **确保 PiP 状态可以更新或响应** 用户通过系统 composer 进行的交互。
- **在 session 结束时自动关闭 PiP**。
- **不要在 PiP 中堆砌控件或静态内容**，这些内容更适合 inline 或 fullscreen。

## 视觉设计指南

一致的 look and feel 有助于让合作伙伴构建的工具像 ChatGPT 平台的自然组成部分。视觉指南支持清晰度、可用性和可访问性，同时仍在合适位置为品牌表达留出空间。

这些原则说明了如何使用颜色、字体、间距和图像，以在保留系统清晰度的同时，让合作伙伴有空间区分自己的服务。

### 为什么这很重要

视觉和 UX 一致性有助于改善在 ChatGPT 中使用 apps 的整体用户体验。遵循这些指南后，合作伙伴可以以用户感觉一致的方式呈现工具，并在不分散注意力的情况下交付价值。

### 颜色

系统定义的 palettes 有助于确保 actions 和 responses 始终与 ChatGPT 平台保持一致。合作伙伴可以通过 accents、icons 或 inline imagery 添加品牌元素，但不应重新定义 system colors。

![Color palette](https://developers.openai.com/images/apps-sdk/color.png)

**经验规则**

- 对文本、图标和 dividers 等空间元素使用 system colors。
- 合作伙伴品牌 accents（例如 logos 或 icons）不应覆盖背景或文本颜色。
- 避免破坏 ChatGPT 极简外观的自定义 gradients 或 patterns。
- 在 app display modes 内的 primary buttons 上使用品牌 accent colors。

![Color usage 示例](https://developers.openai.com/images/apps-sdk/color_usage_1.png)

_在 accents 和 badges 上使用品牌色。不要更改文本颜色或其他核心组件样式。_

![Color usage 示例](https://developers.openai.com/images/apps-sdk/color_usage_2.png)

_不要把颜色应用到文本区域背景。_

### 字体排印

ChatGPT 使用平台原生 system fonts（iOS 上为 SF Pro，Android 上为 Roboto），以确保跨设备的可读性和可访问性。

![Typography](https://developers.openai.com/images/apps-sdk/typography.png)

**经验规则**

- 始终继承 system font stack，并遵循 headings、body text 和 captions 的系统尺寸规则。
- 仅在内容区域内使用 bold、italic 或 highlights 等合作伙伴样式，不要用于结构性 UI。
- 尽可能限制字号变化，优先使用 body 和 body-small sizes。

![Typography 示例](https://developers.openai.com/images/apps-sdk/typography_usage.png)

_不要使用自定义字体，即使在 full screen modes 中也是如此。尽可能使用 system font variables。_

### 间距与布局

一致的 margins、padding 和 alignment 能让合作伙伴内容在对话中易于浏览且可预测。

![Spacing & layout](https://developers.openai.com/images/apps-sdk/spacing.png)

**经验规则**

- 对 cards、collections 和 inspector panels 使用 system grid spacing。
- 保持 padding 一致，避免挤压内容或让文本贴边。
- 尽可能尊重系统指定的 corner rounds，让形状保持一致。
- 使用 headline、supporting text 和 CTA 的清晰顺序来维护视觉层级。

### 图标与图像

System iconography 提供视觉清晰度，而合作伙伴 logos 和 images 帮助用户识别品牌上下文。

![Icons](https://developers.openai.com/images/apps-sdk/icons.png)

**经验规则**

- 使用 system icons，或使用符合 ChatGPT 视觉世界的自定义 iconography，即单色、outline 风格。
- 不要把你的 logo 作为响应的一部分。ChatGPT 总会在 widget 渲染前附加你的 logo 和应用名称。
- 所有 imagery 都必须遵循强制 aspect ratios，避免变形。

![Icons & imagery](https://developers.openai.com/images/apps-sdk/iconography.png)

### 可访问性

每个合作伙伴体验都应尽可能面向最广泛的受众可用。
在为 ChatGPT 构建 apps 时，可访问性应是核心考虑。

**经验规则**

- 文本和背景必须保持最低 contrast ratio（WCAG AA）。
- 为所有图像提供 alt text。
- 支持文本缩放，且不会破坏布局。
