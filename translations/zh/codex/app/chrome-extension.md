---
status: needs-review
sourceId: "f38f472639ab"
sourceChecksum: "f38f472639ab2afffacb5ea38bab3733070bc152cb188e0459e9e7bcf637ce42"
sourceUrl: "https://developers.openai.com/codex/app/chrome-extension"
translatedAt: "2026-06-27T11:05:57.267Z"
translator: codex-gpt-5.5-xhigh
---

# Codex Chrome extension

Codex Chrome extension 让 Codex 可以使用 Chrome 处理需要你 signed-in browser state 的 browser tasks。当 Codex 需要读取或操作 LinkedIn、Salesforce、Gmail 或内部工具等 sites 时，请使用它。

对于 local development servers、file-backed previews，以及不需要 sign-in 的 public pages，请优先使用 [in-app browser](https://developers.openai.com/codex/app/browser)。In-app browser 会将 preview 和 verification 工作保留在 Codex 内，而不使用你的 Chrome profile。

Codex 也可以根据 task 需要在 tools 之间切换：有专用 integration 时使用 plugins，需要 logged-in browser context 时使用 Chrome，用于 localhost 时使用 in-app browser。

<div className="not-prose my-4">
  <Alert
    client:load
    color="warning"
    variant="soft"
    description="请将页面内容视为不可信 context，并在允许 Codex 继续之前 review 该网站。"
  />
</div>

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

#### 始终允许 browser content <ElevatedRiskBadge class="ml-2" />

如果你开启 always allow browser content，Codex 在使用 websites 前不再请求确认。

#### Browser history <ElevatedRiskBadge class="ml-2" />

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

<CodexScreenshot
  alt="Codex Chrome extension 显示 connected status"
  lightSrc="/images/codex/app/chrome-connected-light.png"
  darkSrc="/images/codex/app/chrome-connected-dark.png"
  maxHeight="300px"
  class="mt-4"
/>

### Upload Files

如果 Chrome task 需要从你的电脑上传文件，请允许 Codex extension 访问 Chrome 中的 file URLs：

1. 在 Chrome 中，打开 toolbar 中的 extensions icon，然后点击 **Manage Extensions**。
2. 在 Codex extension card 上，点击 **Details**。
3. 开启 **Allow access to file URLs**。

更改设置后，重新启动 Chrome task。

<CodexScreenshot
  alt="Chrome extension settings，显示 Codex 已启用 Allow access to file URLs"
  lightSrc="/images/codex/app/chrome-file-url-access-light.webp"
  darkSrc="/images/codex/app/chrome-file-url-access-dark.webp"
  maxHeight="420px"
  class="mt-4"
/>
