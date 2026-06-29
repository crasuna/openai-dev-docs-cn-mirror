---
title: "Codex Chrome 扩展"
description: "Use Chrome with Codex while managing browser permissions, website approvals, and browsing data"
outline: deep
---

# Codex Chrome 扩展

**文档集**：Codex  
**分组**：Codex — App  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/app/chrome-extension](https://developers.openai.com/codex/app/chrome-extension)
- Markdown 来源：[https://developers.openai.com/codex/app/chrome-extension.md](https://developers.openai.com/codex/app/chrome-extension.md)
- 抓取时间：2026-06-27T05:54:50.307Z
- Checksum：`f38f472639ab2afffacb5ea38bab3733070bc152cb188e0459e9e7bcf637ce42`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex Chrome extension 让 Codex 可以使用 Chrome 处理需要你 signed-in browser state 的 browser tasks。当 Codex 需要读取或操作 LinkedIn、Salesforce、Gmail 或内部工具等 sites 时，请使用它。

对于 local development servers、file-backed previews，以及不需要 sign-in 的 public pages，请优先使用 [in-app browser](/mirror/codex/app/browser)。In-app browser 会将 preview 和 verification 工作保留在 Codex 内，而不使用你的 Chrome profile。

Codex 也可以根据 task 需要在 tools 之间切换：有专用 integration 时使用 plugins，需要 logged-in browser context 时使用 Chrome，用于 localhost 时使用 in-app browser。


  &lt;Alert
    client:load
    color="warning"
    variant="soft"
    description="请将页面内容视为不可信 context，并在允许 Codex 继续之前 review 该网站。"
  /&gt;


## 从 Plugins 设置 Chrome

从 Codex 设置 extension：

1. 打开 Codex 并进入 **Plugins**。
2. 添加 **Chrome** plugin。
3. 按照 setup flow 操作。它会引导你安装 [Codex Chrome extension](https://chromewebstore.google.com/detail/codex/hehggadaopoacecdllhhajmbjkdcmajg)，并批准 Chrome 的 permission prompts。
4. 打开 Chrome，并确认 Codex extension 显示 **Connected**。

plugin 设置完成后，启动新的 Codex thread。当 task 需要 signed-in website 时，Codex 可以建议使用 Chrome。你也可以在 prompt 中直接调用它：

```text
@Chrome open Salesforce and update the account from these call notes.
```

如果 Chrome 尚未打开，Codex 可以打开它。Chrome browser tasks 会在 Chrome tab groups 中运行，因此 thread 的工作会保持分组。

## 控制 website access

默认情况下，Codex 会在与每个新 website 交互前询问。Codex 会根据 website host（例如 `example.com`）生成 prompt。

当 Codex 请求使用某个 website 时，你可以选择与 task 和你的 risk tolerance 匹配的选项：

- 允许当前 chat 使用该 website。
- 始终允许该 host，让 Codex 以后无需询问即可再次使用该 website。
- 拒绝该 website。

### 管理 allowlist 和 blocklist

在 Computer Use settings 中，你可以管理 domains 的 allowlist 和 blocklist。allowlist 包含 Codex 无需再次询问即可使用的 domains。blocklist 包含 Codex 不应使用的 domains。

从 allowlist 中移除 domain 意味着 Codex 在使用前会再次询问。从 blocklist 中移除 domain 意味着 Codex 可以再次询问，而不是将该 domain 视为 blocked。

#### 始终允许 browser content &lt;ElevatedRiskBadge class="ml-2" /&gt;

如果你开启 always allow browser content，Codex 在使用 websites 前不再请求确认。

#### Browser history &lt;ElevatedRiskBadge class="ml-2" /&gt;

Browser history 可能包含敏感 telemetry、内部 URLs、search terms，以及 signed-in devices 上 Chrome sessions 的 activity。如果你允许 Codex 访问 browser history，相关 history entries 可能会成为 Codex 用于 task 的 context 的一部分。恶意或误导性 page content 可能增加 Codex 将这些数据复制到非预期位置的风险。

Codex 想要使用 browser history 时会询问。Codex 会将 history access 限定在该 request 内，并且 history 没有 always-allow 选项。

## 数据和安全

### Chrome extension permissions

安装 extension 时，Chrome 会要求你接受 extension permissions。permission prompt 可能包括：

- 访问 page debugger
- 读取和更改你在所有 websites 上的所有数据
- 读取和更改你在所有 signed-in devices 上的 browsing history
- 显示 notifications
- 读取和更改你的 bookmarks
- 管理 downloads
- 与 cooperating native applications 通信
- 查看和管理 tab groups

这些 Chrome permissions 使 extension 能够操作 browser workflows。Codex 在 task 中使用 websites 或 browser history 之前，仍会使用自己的 confirmations、settings、allowlists 和 blocklists。

### Memories

Browser use 遵循你的 Codex Memories setting。如果 Memories 开启，Codex 可以在 Chrome 中工作时使用相关 saved memories。如果 Memories 关闭，browser use 不会使用 memories。

### OpenAI 会存储哪些 browsing 内容

OpenAI 不会从 extension 存储你的 Chrome actions 的单独完整记录。只有当 browser activity 成为 Codex context 的一部分时，OpenAI 才会存储它，例如 Codex 从页面读取的文本、screenshots、tool calls、summaries、messages，或 thread 中包含的其他内容。

你的 ChatGPT 和 Codex data controls 适用于在 context 中处理的内容。除非 browser tasks 需要，并且你在场 review 每个 prompt，否则请避免通过 browser tasks 发送 secrets 或高度敏感数据。

## 故障排除

如果 Codex 无法连接到 Chrome，请先确认 Codex 尝试访问的网站不在 Settings 的 blocklist 中。如果网站未被 blocked，请完成以下检查：

1. 从 Chrome toolbar 或 Chrome extensions menu 打开 Codex extension。确保它显示 **Connected**。如果显示 disconnected 或提到 missing native host，请在 Codex 的 **Plugins** 中移除并重新添加 Chrome plugin，然后重新完成 setup flow。
2. 在 Codex 中，打开 **Plugins** 并确认 Chrome plugin 已开启。如果 plugin 关闭，请开启它并再次尝试 task。
3. 确保你正在使用安装了 Codex extension 的同一个 Chrome profile。如果你使用多个 Chrome profiles，请在 active profile 中安装并启用 extension。
4. 启动新的 Codex thread，并再次尝试 Chrome task。这可以清除 thread-specific connection state。
5. 重启 Chrome 和 Codex，然后重试。如果 extension 仍无法连接，请卸载 Codex Chrome extension，从 **Plugins** 移除并重新添加 Chrome plugin，然后再次完成 setup flow。
6. 如果 extension 显示 **Connected**，但 Codex 仍无法使用 Chrome，请在 Codex app 中运行 `/feedback`，并在联系 support 时包含 thread ID。

&lt;CodexScreenshot
  alt="Codex Chrome extension 显示 connected status"
  lightSrc="/images/codex/app/chrome-connected-light.png"
  darkSrc="/images/codex/app/chrome-connected-dark.png"
  maxHeight="300px"
  class="mt-4"
/&gt;

### Upload Files

如果 Chrome task 需要从你的电脑上传文件，请允许 Codex extension 访问 Chrome 中的 file URLs：

1. 在 Chrome 中，打开 toolbar 中的 extensions icon，然后点击 **Manage Extensions**。
2. 在 Codex extension card 上，点击 **Details**。
3. 开启 **Allow access to file URLs**。

更改设置后，重新启动 Chrome task。

&lt;CodexScreenshot
  alt="Chrome extension settings，显示 Codex 已启用 Allow access to file URLs"
  lightSrc="/images/codex/app/chrome-file-url-access-light.webp"
  darkSrc="/images/codex/app/chrome-file-url-access-dark.webp"
  maxHeight="420px"
  class="mt-4"
/&gt;

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
The Codex Chrome extension lets Codex use Chrome for browser tasks that need
your signed-in browser state. Use it when Codex needs to read or act on sites
such as LinkedIn, Salesforce, Gmail, or internal tools.

For local development servers, file-backed previews, and public pages that do
not require sign-in, use the [in-app browser](https://developers.openai.com/codex/app/browser) first. The
in-app browser keeps preview and verification work inside Codex without using
your Chrome profile.

Codex can also switch between tools as a task requires, using plugins when a
dedicated integration is available, Chrome when it needs logged-in browser
context, and the in-app browser for localhost.

<div className="not-prose my-4">
  <Alert
    client:load
    color="warning"
    variant="soft"
    description="Treat page content as untrusted context, and review the website before allowing Codex to continue."
  />
</div>

## Set up Chrome from Plugins

Set up the extension from Codex:

1. Open Codex and go to **Plugins**.
2. Add the **Chrome** plugin.
3. Follow the setup flow. It guides you through installing the [Codex Chrome
   extension](https://chromewebstore.google.com/detail/codex/hehggadaopoacecdllhhajmbjkdcmajg)
   and approving Chrome's permission prompts.
4. Open Chrome and confirm the Codex extension shows **Connected**.

After the plugin setup is complete, start a new Codex thread. Codex can suggest
Chrome when a task needs a signed-in website. You can also invoke it directly in
a prompt:

```text
@Chrome open Salesforce and update the account from these call notes.
```

If Chrome isn't already open, Codex can open it. Chrome browser tasks run in
Chrome tab groups so the work for a thread stays grouped together.

## Control website access

By default, Codex asks before it interacts with each new website. Codex bases
the prompt on the website host, such as `example.com`.

When Codex asks to use a website, you can choose the option that matches the
task and your risk tolerance:

- Allow the website for the current chat.
- Always allow the host so Codex can use that website again without asking.
- Decline the website.

### Manage the allowlist and blocklist

In Computer Use settings, you can manage an allowlist and blocklist for
domains. The allowlist contains domains Codex can use without asking again. The
blocklist contains domains Codex shouldn't use.

Removing a domain from the allowlist means Codex asks again before using it.
Removing a domain from the blocklist means Codex can ask again instead of
treating the domain as blocked.

#### Always allow browser content <ElevatedRiskBadge class="ml-2" />

If you turn on always allow browser content, Codex no longer asks for
confirmation before using websites.

#### Browser history <ElevatedRiskBadge class="ml-2" />

Browser history can include sensitive telemetry, internal URLs, search terms,
and activity from Chrome sessions on signed-in devices. If you allow Codex to
access browser history, relevant history entries can become part of the context
Codex uses for the task. Malicious or misleading page content can increase the
risk that Codex copies this data somewhere unintended.

Codex asks when it wants to use browser history. Codex scopes history access to
the request, and history doesn't have an always-allow option.

## Data and security

### Chrome extension permissions

Chrome asks you to accept extension permissions when you install the extension.
The permission prompt may include:

- Access the page debugger
- Read and change all your data on all websites
- Read and change your browsing history on all your signed-in devices
- Display notifications
- Read and change your bookmarks
- Manage your downloads
- Communicate with cooperating native applications
- View and manage your tab groups

These Chrome permissions make the extension capable of operating browser
workflows. Codex still uses its own confirmations, settings, allowlists, and
blocklists before using websites or browser history during a task.

### Memories

Browser use follows your Codex Memories setting. If Memories is on, Codex can
use relevant saved memories while working in Chrome. If Memories is off, browser
use doesn't use memories.

### What OpenAI stores from browsing

OpenAI doesn't store a separate complete record of your Chrome actions from the
extension. OpenAI stores browser activity only when it becomes part of the Codex
context, such as text Codex reads from a page, screenshots, tool calls,
summaries, messages, or other content included in the thread.

Your ChatGPT and Codex data controls apply to content processed in context.
Avoid sending secrets or highly sensitive data through browser tasks unless
they're required and you are present to review each prompt.

## Troubleshooting

If Codex can't connect to Chrome, first confirm the website Codex is trying to
access isn't in the blocklist in Settings. If the website isn't blocked, work
through these checks:

1. Open the Codex extension from the Chrome toolbar or Chrome's extensions
   menu. Make sure it shows **Connected**. If it shows disconnected or mentions
   a missing native host, remove and re-add the Chrome plugin from **Plugins**
   in Codex, then follow the setup flow again.
2. In Codex, open **Plugins** and confirm that the Chrome plugin is on. If the
   plugin is off, turn it on and try the task again.
3. Make sure you are using the same Chrome profile where the Codex extension is
   installed. If you use more than one Chrome profile, install and enable the
   extension in the active profile.
4. Start a new Codex thread and try the Chrome task again. This can clear a
   thread-specific connection state.
5. Restart Chrome and Codex, then try again. If the extension still doesn't
   connect, uninstall the Codex Chrome extension, remove and re-add the Chrome
   plugin from **Plugins**, and follow the setup flow again.
6. If the extension shows **Connected** but Codex still can't use Chrome, run
   `/feedback` in the Codex app and include the thread ID when you contact
   support.

<CodexScreenshot
  alt="Codex Chrome extension showing connected status"
  lightSrc="/images/codex/app/chrome-connected-light.png"
  darkSrc="/images/codex/app/chrome-connected-dark.png"
  maxHeight="300px"
  class="mt-4"
/>

### Upload Files

If a Chrome task needs to upload a file from your computer, allow the Codex
extension to access file URLs in Chrome:

1. In Chrome, open the extensions icon in the toolbar, then click **Manage
   Extensions**.
2. On the Codex extension card, click **Details**.
3. Turn on **Allow access to file URLs**.

After you change the setting, start the Chrome task again.

<CodexScreenshot
  alt="Chrome extension settings showing Allow access to file URLs enabled for Codex"
  lightSrc="/images/codex/app/chrome-file-url-access-light.webp"
  darkSrc="/images/codex/app/chrome-file-url-access-dark.webp"
  maxHeight="420px"
  class="mt-4"
/>
``````
:::
:::

