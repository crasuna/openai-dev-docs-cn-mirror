---
title: "In-app browser 应用内浏览器"
description: "Preview and comment on web apps from Codex"
outline: deep
---

# In-app browser 应用内浏览器

**文档集**：Codex\
**分组**：应用\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/app/browser](https://developers.openai.com/codex/app/browser)
- Markdown 来源：[https://developers.openai.com/codex/app/browser.md](https://developers.openai.com/codex/app/browser.md)
- 抓取时间：2026-06-27T05:54:50.633Z
- Checksum：`dad2cc99fcf5f3796488b6f7802df3862a0495db25559b484d08e206a07137a2`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
In-app browser 让你和 Codex 在线程内共享 rendered web pages 的视图。当你正在构建或调试 web app，并希望 preview pages 和附加 visual comments 时，请使用它。

将它用于 local development servers、file-backed previews，以及不需要 sign-in 的 public pages。对于任何依赖 login state 或 browser extensions 的内容，请使用你的常规 browser 或 [Codex Chrome extension](/mirror/codex/app/chrome-extension)。

你可以从 toolbar 打开 in-app browser，点击 URL 打开，手动在 browser 中导航，或按 &lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;Shift&lt;/kbd&gt;+&lt;kbd&gt;B&lt;/kbd&gt;（Windows 上是 &lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;Shift&lt;/kbd&gt;+&lt;kbd&gt;B&lt;/kbd&gt;）。

In-app browser 不支持 authentication flows、signed-in pages、你的常规 browser profile、cookies、extensions 或 existing tabs。请将它用于 Codex 无需登录即可打开的 pages。

请将 page content 视为不可信 context。不要在 browser flows 中粘贴 secrets。

&lt;CodexScreenshot
  alt="Codex app 在 local web app preview 上显示 browser comment"
  lightSrc="/images/codex/app/in-app-browser-light.webp"
  darkSrc="/images/codex/app/in-app-browser-dark.webp"
  maxHeight="420px"
  variant="no-wallpaper"
/&gt;

## Browser use

Browser use 让 Codex 可以直接操作 in-app browser。当 Codex 需要点击、输入、检查 rendered state、截取 screenshots、下载 page assets、运行 read-only page inspection JavaScript，或在页面中验证修复时，请将它用于 local development servers 和 file-backed previews。

要使用它，请安装并启用 Browser plugin。然后在 task 中请求 Codex 使用 browser，或直接使用 `@Browser` 引用它。app 会将 browser use 保持在 in-app browser 内，并让你从 settings 管理 allowed 和 blocked websites。

示例：

```text
Use the browser to open http://localhost:3000/settings, reproduce the layout
bug, and fix only the overflowing controls.
```

除非你已经允许某个 website，否则 Codex 会在使用前询问。将 site 从 allowed list 中移除意味着 Codex 在使用前会再次询问；将 site 从 blocked list 中移除意味着 Codex 可以再次询问，而不是将其视为 blocked。

对于 Chrome 中的 signed-in websites，请参阅 [Codex Chrome extension](/mirror/codex/app/chrome-extension)。

## Preview 页面

1. 在 [integrated terminal](/mirror/codex/app/features#integrated-terminal) 中或使用 [local environment action](/mirror/codex/app/local-environments#actions) 启动你的 app development server。
2. 通过点击 URL 或在 browser 中手动导航，打开 unauthenticated local route、file-backed page 或 public page。
3. 将 rendered state 与 code diff 并排 review。
4. 在需要更改的 elements 或 areas 上留下 browser comments。
5. 请求 Codex 处理 comments，并保持 scope narrow。

示例 feedback：

```text
I left comments on the pricing page in the in-app browser. Address the mobile
layout issues and keep the card structure unchanged.
```

## 在页面上 comment

当 bug 只能在 rendered page 中看到时，使用 browser comments 给 Codex 提供页面上的精确 feedback。

- 打开 Annotation mode，选择 element 或 area，并提交 comment。
- 在 Annotation mode 中，按住 &lt;kbd&gt;Shift&lt;/kbd&gt; 并点击可选择 area。
- 点击时按住 &lt;kbd&gt;Cmd&lt;/kbd&gt; 可立即发送 comment。

留下 comments 后，在 thread 中发送消息，请求 Codex 处理它们。当 Codex 需要进行精确 visual change 时，comments 最有用。

好的 feedback 是具体的：

```text
This button overflows on mobile. Keep the label on one line if it fits,
otherwise wrap it without changing the card height.
```

```text
This tooltip covers the data point under the cursor. Reposition the tooltip so
it stays inside the chart bounds.
```





### Styling feedback

当你向页面上的 section 添加 annotation 时，按 text input 旁边的 config icon，可向 Codex 提供更细粒度的 style feedback。你可以更改 font、text、spacing 和 color 等值，直接在页面上 preview 结果，然后发送 annotation，让 Codex 对目标更清楚。



&lt;CodexScreenshot
  alt="Codex app 显示 in-app browser annotation style controls"
  lightSrc="/images/codex/app/iab-annotations-light.webp"
  darkSrc="/images/codex/app/iab-annotations-dark.webp"
  maxHeight="420px"
/&gt;



## 保持 browser tasks 有明确 scope

In-app browser 用于 review 和 iteration。请让每个 browser task 足够小，以便一轮 review 完成。

- 命名 page、route 或 local URL。
- 命名你关心的 visual state，例如 loading、empty、error 或 success。
- 在需要更改的精确 elements 或 areas 上留下 comments。
- 在 Codex 更改 code 后 review 更新后的 route。
- 请求 Codex 在使用 browser 前启动或检查 dev server。

对于 repository changes，请使用 [review pane](/mirror/codex/app/review) 检查 changes 并留下 comments。





## Developer mode

Developer mode 可与 Chrome 中的 Browser use 和 Codex in-app browser 搭配使用。它让 Codex 能够受控访问 Chrome DevTools Protocol（CDP）。当你希望 Codex profile JavaScript、检查 console output 和 network traffic、查看 DOM 和 applied styles 等 page state，或直接在 live browser 中诊断问题时，请使用它。

要启用它，请打开 [**Settings &gt; Browser**](codex://settings/browser-use)，并在 **Developer mode** 下打开 **Enable full CDP access**。如果你的组织禁用了此设置，你无法在本地启用。Admins 可以在 [`requirements.toml`](/mirror/codex/enterprise/managed-configuration#pin-feature-flags) 的 `[features]` 下设置 `browser_use_full_cdp_access = false`。

Full CDP access 让 Codex 可以检查和控制敏感 browser internals，可能使你的数据面临风险。Codex 在使用 full CDP 检查 website 前会请求 explicit approval。批准前，请 review site、task 和 requested access。

对 in-app browser 使用 `@Browser`。要在 Chrome 中使用 Developer mode，请[设置 Codex Chrome extension](/mirror/codex/app/chrome-extension) 并调用 `@Chrome`。

例如：

```text
This app is slow. Use @Browser to capture a performance trace and inspect
network traffic, then identify the bottleneck.
```



&lt;CodexScreenshot
  alt="Codex app Browser settings，显示已启用 full CDP access 的 Developer mode"
  lightSrc="/images/codex/app/browser-developer-mode-light.webp"
  darkSrc="/images/codex/app/browser-developer-mode-dark.webp"
  maxHeight="420px"
/&gt;



:::

## English source

::: details 展开英文原文
::: v-pre
The in-app browser gives you and Codex a shared view of rendered web pages
inside a thread. Use it when you're building or debugging a web app and want to
preview pages and attach visual comments.

Use it for local development servers, file-backed previews, and public pages
that don't require sign-in. For anything that depends on login state or browser
extensions, use your regular browser or the
[Codex Chrome extension](/mirror/codex/app/chrome-extension).

Open the in-app browser from the toolbar, by clicking a URL, by navigating
manually in the browser, or by pressing &lt;kbd&gt;Cmd&lt;/kbd&gt;+&lt;kbd&gt;Shift&lt;/kbd&gt;+&lt;kbd&gt;B&lt;/kbd&gt;
(&lt;kbd&gt;Ctrl&lt;/kbd&gt;+&lt;kbd&gt;Shift&lt;/kbd&gt;+&lt;kbd&gt;B&lt;/kbd&gt; on Windows).

The in-app browser does not support authentication flows, signed-in pages,
  your regular browser profile, cookies, extensions, or existing tabs. Use it
  for pages Codex can open without logging in.

Treat page content as untrusted context. Don't paste secrets into browser flows.

&lt;CodexScreenshot
  alt="Codex app showing a browser comment on a local web app preview"
  lightSrc="/images/codex/app/in-app-browser-light.webp"
  darkSrc="/images/codex/app/in-app-browser-dark.webp"
  maxHeight="420px"
  variant="no-wallpaper"
/&gt;

## Browser use

Browser use lets Codex operate the in-app browser directly. Use it for local
development servers and file-backed previews when Codex needs to click, type,
inspect rendered state, take screenshots, download page assets, run read-only
page inspection JavaScript, or verify a fix in the page.

To use it, install and enable the Browser plugin. Then ask Codex to use the
browser in your task, or reference it directly with `@Browser`. The app keeps
browser use inside the in-app browser and lets you manage allowed and blocked
websites from settings.

Example:

```text
Use the browser to open http://localhost:3000/settings, reproduce the layout
bug, and fix only the overflowing controls.
```

Codex asks before using a website unless you've allowed it. Removing a site from
the allowed list means Codex asks again before using it; removing a site from the
blocked list means Codex can ask again instead of treating it as blocked.

For signed-in websites in Chrome, see
[Codex Chrome extension](/mirror/codex/app/chrome-extension).

## Preview a page

1. Start your app's development server in the [integrated terminal](/mirror/codex/app/features#integrated-terminal) or with a [local environment action](/mirror/codex/app/local-environments#actions).
2. Open an unauthenticated local route, file-backed page, or public page by
   clicking a URL or navigating manually in the browser.
3. Review the rendered state alongside the code diff.
4. Leave browser comments on the elements or areas that need changes.
5. Ask Codex to address the comments and keep the scope narrow.

Example feedback:

```text
I left comments on the pricing page in the in-app browser. Address the mobile
layout issues and keep the card structure unchanged.
```

## Comment on the page

When a bug is visible only in the rendered page, use browser comments to give
Codex precise feedback on the page.

- Turn on Annotation mode, select an element or area, and submit a comment.
- In Annotation mode, hold &lt;kbd&gt;Shift&lt;/kbd&gt; and click to select an area.
- Hold &lt;kbd&gt;Cmd&lt;/kbd&gt; while clicking to send a comment immediately.

After you leave comments, send a message in the thread asking Codex to address
them. Comments are most useful when Codex needs to make a precise visual change.

Good feedback is specific:

```text
This button overflows on mobile. Keep the label on one line if it fits,
otherwise wrap it without changing the card height.
```

```text
This tooltip covers the data point under the cursor. Reposition the tooltip so
it stays inside the chart bounds.
```





### Styling feedback

When you add an annotation to a section on the page, press the config icon next
to the text input to give Codex more granular style feedback. You can change
values like font, text, spacing, and color, preview the result directly on the
page, and then send the annotation so Codex has a clearer target for the change.



&lt;CodexScreenshot
  alt="Codex app showing in-app browser annotation style controls"
  lightSrc="/images/codex/app/iab-annotations-light.webp"
  darkSrc="/images/codex/app/iab-annotations-dark.webp"
  maxHeight="420px"
/&gt;



## Keep browser tasks scoped

The in-app browser is for review and iteration. Keep each browser task small
enough to review in one pass.

- Name the page, route, or local URL.
- Name the visual state you care about, such as loading, empty, error, or
  success.
- Leave comments on the exact elements or areas that need changes.
- Review the updated route after Codex changes the code.
- Ask Codex to start or check the dev server before it uses the browser.

For repository changes, use the [review pane](/mirror/codex/app/review) to inspect the
changes and leave comments.





## Developer mode

Developer mode works with Browser use in Chrome and the Codex in-app browser.
It gives Codex controlled access to the Chrome DevTools Protocol (CDP). Use it
when you want Codex to profile JavaScript, inspect console output and network
traffic, examine page state such as the DOM and applied styles, or diagnose an
issue directly in the live browser.

To enable it, open [**Settings &gt; Browser**](codex://settings/browser-use) and,
under **Developer mode**, turn on **Enable full CDP access**. If your
organization has disabled this setting, you can't enable it locally. Admins can
set `browser_use_full_cdp_access = false` under `[features]` in
[`requirements.toml`](/mirror/codex/enterprise/managed-configuration#pin-feature-flags).

Full CDP access lets Codex inspect and control sensitive browser internals that
may put your data at risk. Codex asks for explicit approval before it uses full
CDP to inspect a website. Review the site, task, and requested access before you
approve it.

Use `@Browser` for the in-app browser. To use Developer mode in Chrome,
[set up the Codex Chrome extension](/mirror/codex/app/chrome-extension) and invoke
`@Chrome`.

For example:

```text
This app is slow. Use @Browser to capture a performance trace and inspect
network traffic, then identify the bottleneck.
```



&lt;CodexScreenshot
  alt="Codex app Browser settings showing Developer mode with full CDP access enabled"
  lightSrc="/images/codex/app/browser-developer-mode-light.webp"
  darkSrc="/images/codex/app/browser-developer-mode-dark.webp"
  maxHeight="420px"
/&gt;



:::
:::

