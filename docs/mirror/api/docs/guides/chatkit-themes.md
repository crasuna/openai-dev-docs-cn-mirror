---
title: "ChatKit 中的主题和自定义"
description: "Configure colors, typography, density, and component variants in your ChatKit implementation."
outline: deep
---

# ChatKit 中的主题和自定义

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/chatkit-themes](https://developers.openai.com/api/docs/guides/chatkit-themes)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/chatkit-themes.md](https://developers.openai.com/api/docs/guides/chatkit-themes.md)
- 抓取时间：2026-06-27T05:54:00.170Z
- Checksum：`8cfa3083d93f2b91b8fa28ddb2930f85073554324c2527d96366adc2d9537084`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
完成 [ChatKit quickstart](/mirror/api/docs/guides/chatkit) 后，了解如何更改主题并为你的聊天嵌入添加自定义。通过浅色和深色主题、设置强调色、控制密度和圆角，让它匹配你应用的美学风格。

## 概览

从高层来看，可以通过传入 options 对象来自定义主题。如果你按照 [ChatKit quickstart](/mirror/api/docs/guides/chatkit) 将 ChatKit 嵌入到前端，请使用下面的 React 语法。

- **React**：将 options 传给 `useChatKit({...})`
- **高级集成**：使用 `chatkit.setOptions({...})` 设置 options

在两种集成类型中，options 对象的形状相同。

## 探索自定义选项

访问 [ChatKit Studio](https://chatkit.studio)，查看 ChatKit 的可运行实现和交互式构建器。如果你喜欢通过尝试而不是阅读来构建，这些资源是很好的起点。

#### 探索 ChatKit UI


  



    体验 ChatKit 的交互式演示。





  



    浏览可用 widgets。





  



    通过交互式演示边做边学。




#### 查看可运行示例


  



    查看 ChatKit 的可运行示例并获取灵感。





  



    克隆一个 repo，从完全可运行的模板开始。




## 更改主题

通过指定颜色、排版等选项，让外观和体验匹配你的产品。下面我们设置深色模式、更改颜色、圆角、调整信息密度并设置字体。

如需查看所有主题选项，请参阅 [API reference](https://openai.github.io/chatkit-js/api/openai/chatkit/type-aliases/themeoption/)。

```jsx
const options: Partial<ChatKitOptions> = {
  theme: {
    colorScheme: "dark",
    color: {
      accent: {
        primary: "#2D8CFF",
        level: 2
      }
    },
    radius: "round",
    density: "compact",
    typography: { fontFamily: "'Inter', sans-serif" },
  },
};
```

## 自定义起始屏幕文本

通过更改 composer 的 placeholder 文本，让用户知道可以询问什么，或引导他们的首次输入。

```jsx
const options: Partial<ChatKitOptions> = {
  composer: {
    placeholder: "Ask anything about your data…",
  },
  startScreen: {
    greeting: "Welcome to FeedbackBot!",
  },
};
```

## 为新线程显示 starter prompts

在开始对话时，通过建议 prompt 想法来引导用户询问或执行什么。

```js
const options: Partial<ChatKitOptions> = {
  startScreen: {
    greeting: "What can I help you build today?",
    prompts: [
      {
        name: "Check on the status of a ticket",
        prompt: "Can you help me check on the status of a ticket?",
        icon: "search"
      },
      {
        name: "Create Ticket",
        prompt: "Can you help me create a new support ticket?",
        icon: "write"
      },
    ],
  },
};
```

## 向 header 添加自定义按钮

自定义 header 按钮可帮助你添加与集成相关的导航、上下文或操作。

```jsx
const options: Partial<ChatKitOptions> = {
  header: {
    customButtonLeft: {
      icon: "settings-cog",
      onClick: () => openProfileSettings(),
    },
    customButtonRight: {
      icon: "home",
      onClick: () => openHomePage(),
    },
  },
};
```

## 启用文件附件

附件默认禁用。要启用它们，请添加附件配置。
除非你在做自定义后端，否则必须使用 `hosted` 上传策略。
有关其他上传策略如何与自定义后端配合使用的更多信息，请参阅 Python SDK 文档。

你还可以控制用户可附加到消息的文件数量、大小和类型。

```jsx
const options: Partial<ChatKitOptions> = {
  composer: {
    attachments: {
      uploadStrategy: { type: 'hosted' },
      maxSize: 20 * 1024 * 1024, // 20MB per file
      maxCount: 3,
      accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg"] },
    },
  },
}
```

## 使用 entity tags 在 composer 中启用 @mentions

让用户通过 @-mentions 标记自定义“entities”。这可以提供更丰富的对话上下文和互动性。

- 使用 `onTagSearch` 根据输入查询返回 entity 列表。
- 使用 `onClick` 处理 entity 的点击事件。

```jsx
const options: Partial<ChatKitOptions> = {
  entities: {
    async onTagSearch(query) {
      return [
        {
          id: "user_123",
          title: "Jane Doe",
          group: "People",
          interactive: true,
        },
        {
          id: "document_123",
          title: "Quarterly Plan",
          group: "Documents",
          interactive: true,
        },
      ]
    },
    onClick: (entity) => {
      navigateToEntity(entity.id);
    },
  },
};
```

## 自定义 entity tags 的显示方式

你可以使用 widgets 自定义鼠标悬停时 entity tags 的外观。当用户悬停在 entity tag 上时，显示丰富预览，例如名片、文档摘要或图片。


  



    浏览可用 widgets。




```jsx
const options: Partial<ChatKitOptions> = {
  entities: {
    async onTagSearch() { /* ... */ },
    onRequestPreview: async (entity) => ({
      preview: {
        type: "Card",
        children: [
          { type: "Text", value: `Profile: ${entity.title}` },
          { type: "Text", value: "Role: Developer" },
        ],
      },
    }),
  },
};
```

## 向 composer 添加自定义工具

通过让用户从 composer bar 触发应用特定操作来提升生产力。选中的工具
会作为工具偏好发送给模型。

```jsx
const options: Partial<ChatKitOptions> = {
  composer: {
    tools: [
      {
        id: 'add-note',
        label: 'Add Note',
        icon: 'write',
        pinned: true,
      },
    ],
  },
};
```

## 切换 UI 区域和功能

如果你需要对 header 中可用选项做更多自定义，并希望自行实现，可以禁用主要 UI 区域和功能。当线程与历史记录的概念不适合你的用例时，禁用 history 会很有用，例如支持聊天机器人。

```jsx
const options: Partial<ChatKitOptions> = {
  history: { enabled: false },
  header: { enabled: false },
};
```

## 覆盖 locale

如果你的应用有全局语言设置，可以覆盖默认 locale。默认情况下，locale 设置为浏览器的 locale。

```jsx
const options: Partial<ChatKitOptions> = {
  locale: 'de-DE',
};
```

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
After following the [ChatKit quickstart](https://developers.openai.com/api/docs/guides/chatkit), learn how to change themes and add customization to your chat embed. Match your app’s aesthetic with light and dark themes, setting an accent color, controlling the density, and rounded corners.

## Overview

At a high level, customize the theme by passing in an options object. If you followed the [ChatKit quickstart](https://developers.openai.com/api/docs/guides/chatkit) to embed ChatKit in your frontend, use the React syntax below.

- **React**: Pass options to `useChatKit({...})`
- **Advanced integrations**: Set options with `chatkit.setOptions({...})`

In both integration types, the shape of the options object is the same.

## Explore customization options

Visit [ChatKit Studio](https://chatkit.studio) to see working implementations of ChatKit and interactive builders. If you like building by trying things rather than reading, these resources are a good starting point.

#### Explore ChatKit UI

<a href="https://chatkit.world">
  

<span slot="icon">
      </span>
    Play with an interactive demo of ChatKit.


</a>

<a href="https://widgets.chatkit.studio">
  

<span slot="icon">
      </span>
    Browse available widgets.


</a>

<a href="https://chatkit.studio/playground">
  

<span slot="icon">
      </span>
    Play with an interactive demo to learn by doing.


</a>

#### See working examples

<a href="https://github.com/openai/openai-chatkit-advanced-samples">
  

<span slot="icon">
      </span>
    See working examples of ChatKit and get inspired.


</a>

<a href="https://github.com/openai/openai-chatkit-starter-app">
  

<span slot="icon">
      </span>
    Clone a repo to start with a fully working template.


</a>

## Change the theme

Match the look and feel of your product by specifying colors, typography, and more. Below, we set to dark mode, change colors, round the corners, adjust the information density, and set the font.

For all theming options, see the [API reference](https://openai.github.io/chatkit-js/api/openai/chatkit/type-aliases/themeoption/).

```jsx
const options: Partial<ChatKitOptions> = {
  theme: {
    colorScheme: "dark",
    color: {
      accent: {
        primary: "#2D8CFF",
        level: 2
      }
    },
    radius: "round",
    density: "compact",
    typography: { fontFamily: "'Inter', sans-serif" },
  },
};
```

## Customize the start screen text

Let users know what to ask or guide their first input by changing the composer’s placeholder text.

```jsx
const options: Partial<ChatKitOptions> = {
  composer: {
    placeholder: "Ask anything about your data…",
  },
  startScreen: {
    greeting: "Welcome to FeedbackBot!",
  },
};
```

## Show starter prompts for new threads

Guide users on what to ask or do by suggesting prompt ideas when starting a conversation.

```js
const options: Partial<ChatKitOptions> = {
  startScreen: {
    greeting: "What can I help you build today?",
    prompts: [
      {
        name: "Check on the status of a ticket",
        prompt: "Can you help me check on the status of a ticket?",
        icon: "search"
      },
      {
        name: "Create Ticket",
        prompt: "Can you help me create a new support ticket?",
        icon: "write"
      },
    ],
  },
};
```

## Add custom buttons to the header

Custom header buttons help you add navigation, context, or actions relevant to your integration.

```jsx
const options: Partial<ChatKitOptions> = {
  header: {
    customButtonLeft: {
      icon: "settings-cog",
      onClick: () => openProfileSettings(),
    },
    customButtonRight: {
      icon: "home",
      onClick: () => openHomePage(),
    },
  },
};
```

## Enable file attachments

Attachments are disabled by default. To enable them, add attachments configuration.
Unless you are doing a custom backend, you must use the `hosted` upload strategy.
See the Python SDK docs for more information on other upload strategies work with a custom backend.

You can also control the number, size, and types of files that users can attach to messages.

```jsx
const options: Partial<ChatKitOptions> = {
  composer: {
    attachments: {
      uploadStrategy: { type: 'hosted' },
      maxSize: 20 * 1024 * 1024, // 20MB per file
      maxCount: 3,
      accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg"] },
    },
  },
}
```

## Enable @mentions in the composer with entity tags

Let users tag custom “entities” with @-mentions. This enables richer conversation context and interactivity.

- Use `onTagSearch` to return a list of entities based on the input query.
- Use `onClick` to handle the click event of an entity.

```jsx
const options: Partial<ChatKitOptions> = {
  entities: {
    async onTagSearch(query) {
      return [
        {
          id: "user_123",
          title: "Jane Doe",
          group: "People",
          interactive: true,
        },
        {
          id: "document_123",
          title: "Quarterly Plan",
          group: "Documents",
          interactive: true,
        },
      ]
    },
    onClick: (entity) => {
      navigateToEntity(entity.id);
    },
  },
};
```

## Customize how entity tags appear

You can customize the appearance of entity tags on mouseover using widgets. Show rich previews such as a business card, document summary, or image when the user hovers over an entity tag.

<a href="https://widgets.chatkit.studio">
  

<span slot="icon">
      </span>
    Browse available widgets.


</a>

```jsx
const options: Partial<ChatKitOptions> = {
  entities: {
    async onTagSearch() { /* ... */ },
    onRequestPreview: async (entity) => ({
      preview: {
        type: "Card",
        children: [
          { type: "Text", value: `Profile: ${entity.title}` },
          { type: "Text", value: "Role: Developer" },
        ],
      },
    }),
  },
};
```

## Add custom tools to the composer

Enhance productivity by letting users trigger app-specific actions from the composer bar. The selected tool
will be sent to the model as a tool preference.

```jsx
const options: Partial<ChatKitOptions> = {
  composer: {
    tools: [
      {
        id: 'add-note',
        label: 'Add Note',
        icon: 'write',
        pinned: true,
      },
    ],
  },
};
```

## Toggle UI regions and features

Disable major UI regions and features if you need more customization over the options available in the header and want to implement your own instead. Disabling history can be useful when the concept of threads and history doesn't make sense for your use case—e.g., in a support chatbot.

```jsx
const options: Partial<ChatKitOptions> = {
  history: { enabled: false },
  header: { enabled: false },
};
```

## Override the locale

Override the default locale if you have an app-wide language setting. By default, the locale is set to the browser's locale.

```jsx
const options: Partial<ChatKitOptions> = {
  locale: 'de-DE',
};
```
``````
:::
:::

