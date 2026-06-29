---
status: needs-review
sourceId: "b1ca3f83893b"
sourceChecksum: "b1ca3f83893ba602273c526122025be6857f1f4af38b5f159115284312a55b31"
sourceUrl: "https://developers.openai.com/api/docs/guides/chatkit"
translatedAt: "2026-06-27T08:52:13.975Z"
translator: codex-gpt-5.5-xhigh
---

# ChatKit 聊天组件

ChatKit 是构建 agentic chat experiences 的最佳方式。无论你是在构建内部知识库助手、HR 入职助手、研究伙伴、购物或日程助手、故障排查 bot、财务规划顾问，还是 support agent，ChatKit 都提供了可自定义的 chat embed 来处理所有用户体验细节。

使用 ChatKit 的可嵌入 UI widgets、可自定义 prompts、tool invocation 支持、文件附件和 chain-of-thought 可视化来构建 agents，而无需重新发明 chat UI。

## 概览

在两条 ChatKit 路径之间选择：

- **自定义 server 集成**。在你自己的基础设施上运行 ChatKit。使用 ChatKit Python SDK，并连接到任意 agentic service，包括使用 [Agents SDK](https://developers.openai.com/api/docs/guides/agents) 构建的服务。使用 widgets 构建 frontend。
- **现有 Agent Builder 托管集成**。如果你已经将 ChatKit 与 Agent Builder workflow 搭配使用，可以在 Agent Builder transition window 期间继续使用该托管 workflow。

OpenAI 正在弃用 Agent Builder。现有用户可以在过渡窗口期间继续使用它，该产品计划于 2026 年 11 月 30 日关闭。ChatKit 仍然可用。对于新工作或迁移规划，请使用[高级 ChatKit 集成](https://developers.openai.com/api/docs/guides/custom-chatkit)，搭配你自己的 server-side agent 实现，并参阅 [Migrate from Agent Builder](https://developers.openai.com/api/docs/guides/agent-builder/migrate-from-agent-builder) 了解 Agent Builder 过渡指导。

## ChatKit 快速开始

## 将 ChatKit 嵌入你的 frontend

仅当你已经有一个支撑 ChatKit 实现的 Agent Builder workflow 时，才使用这条路径。对于新的 ChatKit apps，或在 Agent Builder 关闭前迁移时，请使用[高级集成](https://developers.openai.com/api/docs/guides/custom-chatkit)，将 ChatKit 连接到你自己的 server-side agent 实现。

从高层看，使用现有托管 workflow 设置 ChatKit 是一个三步流程。在 Agent Builder 仍然可用时打开你现有的 workflow。然后设置 ChatKit 并添加功能，构建你的聊天体验。

<br />
![OpenAI-hosted
ChatKit](https://cdn.openai.com/API/docs/images/openai-hosted.png)

### 1. 使用现有托管 workflow

在 [Agent Builder](https://developers.openai.com/api/docs/guides/agent-builder) 中打开你现有的 workflow。你会得到一个 workflow ID。关于过渡规划，请参阅 [Migrate from Agent Builder](https://developers.openai.com/api/docs/guides/agent-builder/migrate-from-agent-builder)。

嵌入你 frontend 的 chat 将指向你选择的 workflow。

### 2. 在你的产品中设置 ChatKit

要设置 ChatKit，你将创建一个 ChatKit session 和一个 backend endpoint，传入你的 workflow ID，交换 client secret，并添加一个 script，将 ChatKit 嵌入你的网站。

**重要安全说明：** 创建 ChatKit session 时，必须传入 `user` 参数，该参数应对每个最终用户唯一。你的 backend 负责对应用用户进行身份验证，并在此参数中传入他们的唯一标识符。

1. 在你的 server 上生成 client token。

   这个 snippet 会启动一个 FastAPI service，它唯一的工作是通过 [OpenAI Python SDK](https://github.com/openai/chatkit-python) 创建新的 ChatKit session，并返回该 session 的 client secret：

   server.py

```python
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os

app = FastAPI()
openai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

@app.post("/api/chatkit/session")
def create_chatkit_session():
    session = openai.chatkit.sessions.create({
      # ...
    })
    return { client_secret: session.client_secret }
```


2. 在你的 server-side 代码中，将 workflow ID 和 secret key 传给 session endpoint。

   client secret 是 ChatKit frontend 用于打开或刷新 chat session 的凭据。你不存储它，而是立即把它交给 ChatKit client library。

   请查看 GitHub 上的 [chatkit-js repo](https://github.com/openai/chatkit-js)。

   chatkit.ts

```typescript
export default async function getChatKitSessionToken(
deviceId: string
): Promise<string> {
const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    "OpenAI-Beta": "chatkit_beta=v1",
    Authorization: "Bearer " + process.env.VITE_OPENAI_API_SECRET_KEY,
    },
    body: JSON.stringify({
    workflow: { id: "wf_68df4b13b3588190a09d19288d4610ec0df388c3983f58d1" },
    user: deviceId,
    }),
});

const { client_secret } = await response.json();

return client_secret;
}
```


3. 在你的项目目录中安装 ChatKit React bindings：

   ```bash
   npm install @openai/chatkit-react
   ```

4. 将 ChatKit JS script 添加到页面。把这个 snippet 放入页面的 `<head>`，或放在你加载 scripts 的任何位置，浏览器会为你获取并运行 ChatKit。

   index.html

```html
<script
src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
async
></script>
```


5. 在 UI 中渲染 ChatKit。这段代码会从你的 server 获取 client secret，并挂载一个连接到你 workflow 的实时 chat widget。

   你的 frontend 代码

```react
import { ChatKit, useChatKit } from '@openai/chatkit-react';

   export function MyChat() {
     const { control } = useChatKit({
       api: {
         async getClientSecret(existing) {
           if (existing) {
             // implement session refresh
           }

           const res = await fetch('/api/chatkit/session', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
           });
           const { client_secret } = await res.json();
           return client_secret;
         },
       },
     });

     return ;
   }
```

```javascript
const chatkit = document.getElementById('my-chat');

  chatkit.setOptions({
    api: {
      getClientSecret(currentClientSecret) {
        if (!currentClientSecret) {
          const res = await fetch('/api/chatkit/start', { method: 'POST' })
          const {client_secret} = await res.json();
          return client_secret
        }
        const res = await fetch('/api/chatkit/refresh', {
          method: 'POST',
          body: JSON.stringify({ currentClientSecret })
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const {client_secret} = await res.json();
        return client_secret
      }
    },
  });
```


### 3. 构建并迭代

请参阅 [custom theming](https://developers.openai.com/api/docs/guides/chatkit-themes)、[widgets](https://developers.openai.com/api/docs/guides/chatkit-widgets) 和 [actions](https://developers.openai.com/api/docs/guides/chatkit-actions) 文档，进一步了解 ChatKit 的工作方式。你也可以探索以下资源来测试聊天、迭代 prompts，并添加 widgets 和 tools。

#### 构建你的实现

<a href="https://openai.github.io/chatkit-python">
  

<span slot="icon">
      </span>
    学习如何处理身份验证、添加 theming 和 customization，等等。


</a>
<a href="https://github.com/openai/chatkit-python">
  

<span slot="icon">
      </span>
    添加 server-side storage、access control、tools 和其他 backend 功能。


</a>

<a href="https://github.com/openai/chatkit-js">
  

<span slot="icon">
      </span>
    查看 ChatKit JS repo。


</a>

#### 探索 ChatKit UI

<a href="https://chatkit.world">
  

<span slot="icon">
      </span>
    体验 ChatKit 的交互式 demo。


</a>

<a href="https://widgets.chatkit.studio">
  

<span slot="icon">
      </span>
    浏览可用 widgets。


</a>

<a href="https://chatkit.studio/playground">
  

<span slot="icon">
      </span>
    通过交互式 demo 边做边学。


</a>

#### 查看可运行示例

<a href="https://github.com/openai/openai-chatkit-advanced-samples">
  

<span slot="icon">
      </span>
    查看 ChatKit 的可运行示例并获得灵感。


</a>

<a href="https://github.com/openai/openai-chatkit-starter-app">
  

<span slot="icon">
      </span>
    Clone 一个 repo，从完整可运行的 template 开始。


</a>

## 后续步骤

当你对 ChatKit 实现感到满意后，可以学习如何使用 [evals](https://developers.openai.com/api/docs/guides/agent-evals) 优化它。对于新的 ChatKit apps，或要将现有 ChatKit app 从 Agent Builder-hosted workflow 迁出，请参阅[高级集成文档](https://developers.openai.com/api/docs/guides/custom-chatkit)。
