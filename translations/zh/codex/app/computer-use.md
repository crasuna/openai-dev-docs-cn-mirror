---
status: needs-review
sourceId: "c8436baf481e"
sourceChecksum: "c8436baf481e89d4223aecc290193f32bfe6b782725e154f25e8e559cd2ed7e2"
sourceUrl: "https://developers.openai.com/codex/app/computer-use"
translatedAt: "2026-06-27T11:05:57.267Z"
translator: codex-gpt-5.5-xhigh
---

# Computer Use

在支持的 regions 中，Codex app 中的 computer use 可用于 macOS 和 Windows。安装 Computer Use plugin。在 macOS 上，在提示时授予 Screen Recording 和 Accessibility permissions。

通过 computer use，Codex 可以查看并操作 macOS 或 Windows 上的 graphical user interfaces。它适用于 command-line tools 或 structured integrations 不足以完成的任务，例如检查 desktop app、使用 browser、更改 app settings、处理 plugin 无法提供的数据源，或复现只发生在 graphical user interface 中的 bug。

由于 computer use 可能影响 project workspace 外部的 app 和 system state，请将它用于 scoped tasks，并在继续前 review permission prompts。

## 设置 computer use

在 Codex settings 中，打开 **Computer Use** 并点击 **Install**，先安装 Computer Use plugin，再请求 Codex 操作 desktop apps。在 Windows 上，task 运行时请让 target app 保持在 active desktop 上可见。在 macOS 上，在提示时授予 Screen Recording 和 Accessibility permissions，让 Codex 可以看到并与 target app 交互。

在 macOS 上，授予：

- **Screen Recording** permission，让 Codex 可以看到 target app。
- **Accessibility** permission，让 Codex 可以点击、输入和导航。

## 何时使用 computer use

当 task 依赖难以仅通过 files 或 command output 验证的 graphical user interface 时，请选择 computer use。

适合的场景包括：

- 测试 Codex 正在构建的 macOS app、Windows app、iOS simulator flow 或其他 desktop app。
- 执行需要你的 web browser 的 task。
- 复现只出现在 graphical interface 中的 bug。
- 更改需要点击 UI 的 app settings。
- 检查无法通过 plugin 获得的 app 或 data source 中的信息。
- 在 macOS 上，在你继续处理其他事情时在后台运行 scoped task。
- 执行跨多个 apps 的 workflow。

对于你本地构建的 web apps，请优先使用 [in-app browser](https://developers.openai.com/codex/app/browser)。

### Windows foreground use

在 Windows 上，computer use 运行在 active desktop 上。它无法在你继续使用同一个 Windows session 时在后台运行，因此请预期 Codex 会移动 pointer、输入，并在 task 运行时接管前台。

对于应在你离开时继续运行的 Windows tasks，请让 Windows device 保持 unlocked 并连接到 internet。使用手机上的 [remote control](https://developers.openai.com/codex/remote-connections) 检查进度或发送 follow-up instructions，或在 Windows virtual machine 内运行 Codex app，这样 computer use 会接管 VM 而不是你的主 desktop。

## 启动 computer use task

在 prompt 中提到 `@Computer` 或 `@AppName`，或请求 Codex 使用 computer use。描述 Codex 应操作的确切 app、window 或 flow。

```text
Open the app with computer use, reproduce the onboarding bug, and fix the
smallest code path that causes it. After each change, run the same UI flow
again.
```

```text
Open @Chrome and verify the checkout page still works after the latest changes.
```

如果 target app 暴露了专用 plugin 或 MCP server，请优先使用该 structured integration 进行 data access 和 repeatable operations。当 Codex 需要视觉检查或操作 app 时，再选择 computer use。

## Permissions 和 approvals

computer use 的 system permissions 与 Codex 中的 app approvals 是分开的。在 macOS 上，Screen Recording 和 Accessibility permissions 让 Codex 可以查看并操作 apps。App approvals 决定你允许 Codex 使用哪些 apps。File reads、file edits 和 shell commands 仍遵循该 thread 的 sandbox 和 approval settings。

通过 computer use，Codex 只能查看和操作你允许的 apps。在 task 期间，Codex 需要使用你电脑上的 app 前会请求你的 permission。你可以选择 **Always allow**，让 Codex 以后无需再次询问即可使用该 app。你可以在 Codex settings 的 **Computer Use** section 中从 **Always allow** list 移除 apps。

<CodexScreenshot
  alt="Codex app 请求使用 Calculator 进行 computer use 的权限"
  lightSrc="/images/codex/app/computer-use-approval-light.webp"
  darkSrc="/images/codex/app/computer-use-approval-dark.webp"
  maxHeight="420px"
  variant="no-wallpaper"
/>

Codex 也可能在执行 sensitive 或 disruptive actions 前请求 permission。

如果 Codex 无法看到或控制 app，请在 macOS 上打开 **System Settings > Privacy & Security**，并检查 Codex app 的 **Screen Recording** 和 **Accessibility**。在 Windows 上，请确保 target app 在 active desktop session 中可见。

<ToggleSection title="Configure Windows app policy">

在 Windows 上，Computer Use 会将 persistent app decisions 存储在 `$CODEX_HOME/computer-use/config.toml` 中。列出 Computer Use 可以无需提示就打开的 apps，以及它必须拒绝的 apps：

```toml
[apps]
allowed = ["mspaint.exe"]
denied = ["calc.exe"]
```

使用 Windows Computer Use 报告的 app identifier，例如 desktop app 的 executable name，或 packaged app 的 app user model ID。Denied apps 优先于 allowed apps。Codex 会为没有出现在任一列表中的 apps 发出 prompt。

此文件存储 local Computer Use decisions。它不同于 admin-enforced `requirements.toml`，后者中 administrators 可以使用 `[features].computer_use = false` 禁用 Computer Use。

</ToggleSection>

## Locked use

Locked use 适用于 macOS。在 Windows 上，computer use 在前台工作。

Locked computer use 让 Codex 可以在你的 Mac 锁定后使用 Computer Use，但只有在你启用它之后才可以。当 Codex task 需要在 Mac 锁定后从 connected device 使用 desktop apps 时，请使用它。

启用 locked computer use 时，Codex 会安装一个参与 macOS unlock flow 的 Apple [authorization plug-in](https://developer.apple.com/documentation/security/authorization-plug-ins)。

Locked use 有意保持 narrow。它不是适用于你的 Mac 的 general-purpose remote-unlock path，也不会让其他 apps 或 local processes 解锁电脑。

使用 locked computer use：

1. 打开 **Codex settings > Computer Use**。
2. 启用 locked computer use。
3. 在 Mac 的 screen 锁定后，从 connected device 启动一个使用 computer use 的 task。

当 Codex task 在你的 Mac 锁定后通过 Computer Use 访问 app 时，Codex 会暂时解锁 Mac，同时阻止本地使用并保留 locked screen protections。解锁前，Codex 会检查 unlock attempt 是否用于 active、trusted computer use turn。在那个短暂窗口之外，Codex 会拒绝解锁，并在需要时要求你手动解锁。

Locked use 包含 safeguards：

- Authorization window 是 short-lived，并限定在当前 unlock attempt 内。
- Automatic unlock 仅对 active computer use turns 期间的 Codex 可用。
- 当 desktop 暂时解锁时，Codex 会覆盖每个 display。
- 如果 Codex 检测到本地 keyboard 或 pointer input，它会重新锁定 Mac，并暂停 automatic unlock，直到你手动解锁。

## 安全指南

通过 computer use，Codex 可以查看 screen content、截取 screenshots，并在 target app 中与 windows、menus、keyboard input 和 clipboard state 交互。请将 visible app content、browser pages、screenshots，以及 target app 中打开的 files 视为 Codex 在 task 运行期间可能处理的 context。

保持 tasks narrow，并在 sensitive flows 中保持在场：

- 一次只给 Codex 一个明确的 target app 或 flow。
- 你可以随时停止 task 或接管电脑。
- 除非 task 需要，否则保持 sensitive apps 关闭。
- 在 Windows 上，请预期 Codex 在工作时接管 foreground input；请使用 secondary device、VM，或在自己使用该 desktop 前停止 task。
- 避免需要 secrets 的 tasks，除非你在场并可以批准每一步。
- 在允许 Codex 使用 app 前，review app permission prompts。
- 仅对你信任 Codex 未来自动使用的 apps 使用 **Always allow**。
- 对 account、security、privacy、network、payment 或 credential-related settings，请保持在场。
- 如果 Codex 开始与错误 window 交互，请取消 task。

如果 Codex 使用你的 browser，它可以与已登录的 pages 交互。请像亲自操作一样 review website actions：web pages 可能包含恶意或误导性内容，并且 sites 可能会把已批准的 clicks、form submissions 和 signed-in actions 视为来自你的 account。要在 Codex 工作时继续使用你的 browser，请请求 Codex 使用不同的 browser。

该功能不能自动化 terminal apps 或 Codex 本身，因为自动化它们可能绕过 Codex security policies。它也不能以 administrator 身份认证，或批准你电脑上的 security 和 privacy permission prompts。

在适用时，file edits 和 shell commands 仍遵循 Codex approval 和 sandbox settings。通过 desktop apps 做出的 changes 可能要等保存到磁盘并被 project 跟踪后，才会显示在 review pane 中。你的 ChatGPT data controls 适用于通过 Codex 处理的内容，包括 computer use 截取的 screenshots。
