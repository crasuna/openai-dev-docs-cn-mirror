### Codex CLI features

Source: [Codex CLI features](/codex/cli/features.md)

Codex supports workflows beyond chat. Use this guide to learn what each one unlocks and when to use it.

#### Running in interactive mode

Codex launches into a full-screen terminal UI that can read your repository, make edits, and run commands as you iterate together. Use it whenever you want a conversational workflow where you can review Codex's actions in real time.

```bash
codex
```

You can also specify an initial prompt on the command line.

```bash
codex "Explain this codebase to me"
```

Once the session is open, you can:

- Send prompts, code snippets, or screenshots (see [image inputs](#image-inputs)) directly into the composer.
- Watch Codex explain its plan before making a change, and approve or reject steps inline.
- Read syntax-highlighted markdown code blocks and diffs in the TUI, then use `/theme` to preview and save a preferred theme.
- Use `/clear` to wipe the terminal and start a fresh chat, or press Ctrl+L to clear the screen without starting a new conversation.
- Use `/copy` or press Ctrl+O to copy the latest completed Codex output. If a turn is still running, Codex copies the most recent finished output instead of in-progress text.
- Press Tab while Codex is running to queue follow-up text, slash commands, or `!` shell commands for the next turn.
- Navigate draft history in the composer with Up/Down; Codex restores prior draft text and image placeholders.
- Press Ctrl+R to search prompt history from the composer, then press Enter to accept a match or Esc to cancel.
- Press Ctrl+C or use `/exit` to close the interactive session when you're done.

#### Resuming conversations

Codex stores your transcripts locally so you can pick up where you left off instead of repeating context. Use the `resume` subcommand when you want to reopen an earlier thread with the same repository state and instructions.

- `codex resume` launches a picker of recent interactive sessions. Highlight a run to see its summary and press Enter to reopen it.
- `codex resume --all` shows sessions beyond the current working directory, so you can reopen any local run.
- `codex resume --last` skips the picker and jumps straight to your most recent session from the current working directory (add `--all` to ignore the current working directory filter).
- `codex resume <SESSION_ID>` targets a specific run. You can copy the ID from the picker, `/status`, or the files under `~/.codex/sessions/`.

Non-interactive automation runs can resume too:

```bash
codex exec resume --last "Fix the race conditions you found"
codex exec resume 7f9f9a2e-1b3c-4c7a-9b0e-.... "Implement the plan"
```

Each resumed run keeps the original transcript, plan history, and approvals, so Codex can use prior context while you supply new instructions. Override the working directory with `--cd` or add extra roots with `--add-dir` if you need to steer the environment before resuming.

#### Connect the TUI to a remote app server

Remote TUI mode lets you run the Codex app server on one machine and use the
Codex terminal UI from another machine. Start the app server with a WebSocket
listener:

```bash
codex app-server --listen ws://127.0.0.1:4500
```

Then connect the TUI to that endpoint:

```bash
codex --remote ws://127.0.0.1:4500
```

For access from another machine, bind the app server to a reachable interface
and configure WebSocket auth before remote use:

```bash
TOKEN_FILE="$HOME/.codex/app-server-token"
openssl rand -base64 32 > "$TOKEN_FILE"
chmod 600 "$TOKEN_FILE"
codex app-server --listen ws://0.0.0.0:4500 --ws-auth capability-token --ws-token-file "$TOKEN_FILE"
```

`--remote` accepts explicit `ws://host:port`, `wss://host:port`, `unix://`, and
`unix://PATH` addresses. Use `unix://` for Codex's default local Unix socket or
`unix://PATH` for an explicit local socket path. Plain WebSocket connections are
appropriate for localhost and SSH port-forwarding workflows. For non-local
clients, use WebSocket auth and put the connection behind TLS.

Codex supports these WebSocket authentication modes:

- Capability token: start the server with `--ws-auth capability-token` and
  either `--ws-token-file /absolute/path` or `--ws-token-sha256 HEX`.
- Signed bearer token: start the server with
  `--ws-auth signed-bearer-token --ws-shared-secret-file /absolute/path`, plus
  optional `--ws-issuer`, `--ws-audience`, and `--ws-max-clock-skew-seconds`.

The TUI sends the remote auth token as an `Authorization: Bearer ` header
during the WebSocket handshake. Codex only accepts remote auth tokens over
`wss://` URLs or local-only `ws://` URLs.

```bash
export CODEX_REMOTE_TOKEN="$(cat "$TOKEN_FILE")"
codex --remote wss://remote-host:4500 --remote-auth-token-env CODEX_REMOTE_TOKEN
```

For SSH remote projects in the Codex app, use
[Remote connections](/codex/remote-connections). For managed remote-control
clients, `codex remote-control` starts an app-server process with
remote-control support enabled.

#### Models and reasoning

For most tasks in Codex, `gpt-5.5` is the recommended model. It's OpenAI's newest frontier model for complex coding, computer
use, knowledge work, and research workflows, with stronger planning, tool use,
and follow-through on multi-step tasks. For extra fast tasks, ChatGPT Pro subscribers have
access to the GPT-5.3-Codex-Spark model in research preview.

Switch models mid-session with the `/model` command, or specify one when launching the CLI.

```bash
codex --model gpt-5.5
```

[Learn more about the models available in Codex](/codex/models).

#### Feature flags

Codex includes a small set of feature flags. Use the `features` subcommand to inspect what's available and to persist changes in your configuration.

```bash
codex features list
codex features enable unified_exec
codex features disable shell_snapshot
```

`codex features enable ` and `codex features disable ` write
to `$CODEX_HOME/config.toml`. The `features` subcommand doesn't accept
`--profile`.

#### Subagents

Use Codex subagent workflows to parallelize larger tasks. For setup, role configuration (`[agents]` in `config.toml`), and examples, see [Subagents](/codex/subagents).

Codex only spawns subagents when you explicitly ask it to. Because each
subagent does its own model and tool work, subagent workflows consume more
tokens than comparable single-agent runs.

#### Image inputs

Attach screenshots or design specs so Codex can read image details alongside your prompt. You can paste images into the interactive composer or provide files on the command line.

```bash
codex -i screenshot.png "Explain this error"
```

```bash
codex --image img1.png,img2.jpg "Summarize these diagrams"
```

Codex accepts common formats such as PNG and JPEG. Use comma-separated filenames for two or more images, and combine them with text instructions to add context.

#### Image generation

Ask Codex to generate or edit images directly in the CLI. This works well for assets such as icons, banners, illustrations, sprite sheets, and placeholder art. If you want Codex to transform or extend an existing asset, attach a reference image with your prompt.

You can ask in natural language or explicitly invoke the image generation skill by including `$imagegen` in your prompt.

Built-in image generation uses `gpt-image-2`, counts toward your general Codex usage limits, and uses included limits 3-5x faster on average than similar turns without image generation, depending on image quality and size. For details, see [Pricing](/codex/pricing#image-generation-usage-limits). For prompting tips and model details, see the [image generation guide](/api/docs/guides/image-generation).

For larger batches of image generation, set `OPENAI_API_KEY` in your environment variables and ask Codex to generate images through the API so API pricing applies instead.

#### Syntax highlighting and themes

The TUI syntax-highlights fenced markdown code blocks and file diffs so code is easier to scan during reviews and debugging.

Use `/theme` to open the theme picker, preview themes live, and save your selection to `tui.theme` in `~/.codex/config.toml`. You can also add custom `.tmTheme` files under `$CODEX_HOME/themes` and select them in the picker.

#### Running local code review

Type `/review` in the CLI to open Codex's review presets. The CLI launches a dedicated reviewer that reads the diff you select and reports prioritized, actionable findings without touching your working tree. By default it uses the current session model; set `review_model` in `config.toml` to override.

- **Review against a base branch** lets you pick a local branch; Codex finds the merge base against its upstream, diffs your work, and highlights the biggest risks before you open a pull request.
- **Review uncommitted changes** inspects everything that's staged, not staged, or not tracked so you can address issues before committing.
- **Review a commit** lists recent commits and has Codex read the exact change set for the SHA you choose.
- **Custom review instructions** accepts your own wording (for example, "Focus on accessibility regressions") and runs the same reviewer with that prompt.

Each run shows up as its own turn in the transcript, so you can rerun reviews as the code evolves and compare the feedback.

#### Web search

Codex ships with a first-party web search tool. For local tasks in the Codex CLI, Codex enables web search by default and serves results from a web search cache. The cache is an OpenAI-maintained index of web results, so cached mode returns pre-indexed results instead of fetching live pages. This reduces exposure to prompt injection from arbitrary live content, but you should still treat web results as untrusted. If you are using `--yolo` or another [full access sandbox setting](/codex/agent-approvals-security), web search defaults to live results. To fetch the most recent data, pass `--search` for a single run or set `web_search = "live"` in [Config basics](/codex/config-basic). You can also set `web_search = "disabled"` to turn the tool off.

You'll see `web_search` items in the transcript or `codex exec --json` output whenever Codex looks something up.

#### Running with an input prompt

When you just need a quick answer, run Codex with a single prompt and skip the interactive UI.

```bash
codex "explain this codebase"
```

Codex will read the working directory, craft a plan, and stream the response back to your terminal before exiting. Pair this with flags like `--path` to target a specific directory or `--model` to dial in the behavior up front.

#### Shell completions

Speed up everyday usage by installing the generated completion scripts for your shell:

```bash
codex completion bash
codex completion zsh
codex completion fish
```

Run the completion script in your shell configuration file to set up completions for new sessions. For example, if you use `zsh`, you can add the following to the end of your `~/.zshrc` file:

```bash
# ~/.zshrc
eval "$(codex completion zsh)"
```

Start a new session, type `codex`, and press Tab to see the completions. If you see a `command not found: compdef` error, add `autoload -Uz compinit && compinit` to your `~/.zshrc` file before the `eval "$(codex completion zsh)"` line, then restart your shell.

#### Approval modes

Approval modes define how much Codex can do without stopping for confirmation. Use `/permissions` inside an interactive session to switch modes as your comfort level changes.

- **Auto** (default) lets Codex read files, edit, and run commands within the working directory. It still asks before touching anything outside that scope or using the network.
- **Read-only** keeps Codex in a consultative mode. It can browse files but won't make changes or run commands until you approve a plan.
- **Full Access** grants Codex the ability to work across your machine, including network access, without asking. Use it sparingly and only when you trust the repository and task.

Codex always surfaces a transcript of its actions, so you can review or roll back changes with your usual git workflow.

#### Scripting Codex

Automate workflows or wire Codex into your existing scripts with the `exec` subcommand. This runs Codex non-interactively, piping the final plan and results back to `stdout`.

```bash
codex exec "fix the CI failure"
```

Combine `exec` with shell scripting to build custom workflows, such as automatically updating changelogs, sorting issues, or enforcing editorial checks before a PR ships.

#### Working with Codex cloud

The `codex cloud` command lets you triage and launch [Codex cloud tasks](/codex/cloud) without leaving the terminal. Run it with no arguments to open an interactive picker, browse active or finished tasks, and apply the changes to your local project.

You can also start a task directly from the terminal:

```bash
codex cloud exec --env ENV_ID "Summarize open bugs"
```

Add `--attempts` (1–4) to request best-of-N runs when you want Codex cloud to generate more than one solution. For example, `codex cloud exec --env ENV_ID --attempts 3 "Summarize open bugs"`.

Environment IDs come from your Codex cloud configuration—use `codex cloud` and press Ctrl+O to choose an environment or the web dashboard to confirm the exact value. Authentication follows your existing CLI login, and the command exits non-zero if submission fails so you can wire it into scripts or CI.

#### Slash commands

Slash commands give you quick access to specialized workflows like `/review`, `/fork`, `/side`, or your own reusable prompts. Codex ships with a curated set of built-ins, and you can create custom ones for team-specific tasks or personal shortcuts.

See the [slash commands guide](/codex/guides/slash-commands) to browse the catalog of built-ins, learn how to author custom commands, and understand where they live on disk.

#### Prompt editor

When you're drafting a longer prompt, it can be easier to switch to a full editor and then send the result back to the composer.

In the prompt input, press Ctrl+G to open the editor defined by the `VISUAL` environment variable (or `EDITOR` if `VISUAL` isn't set).

#### Model Context Protocol (MCP)

Connect Codex to more tools by configuring Model Context Protocol servers. Add STDIO or streaming HTTP servers in `~/.codex/config.toml`, or manage them with the `codex mcp` CLI commands—Codex launches them automatically when a session starts and exposes their tools next to the built-ins. You can even run Codex itself as an MCP server when you need it inside another agent.

See [Model Context Protocol](/codex/mcp) for example configurations, supported auth flows, and a more detailed guide.

### Codex IDE extension commands

Source: [Codex IDE extension commands](/codex/ide/commands.md)

Use these commands to control Codex from the VS Code Command Palette. You can also bind them to keyboard shortcuts.

#### Assign a key binding

To assign or change a key binding for a Codex command:

1. Open the Command Palette (**Cmd+Shift+P** on macOS or **Ctrl+Shift+P** on Windows/Linux).
2. Run **Preferences: Open Keyboard Shortcuts**.
3. Search for `Codex` or the command ID (for example, `chatgpt.newChat`).
4. Select the pencil icon, then enter the shortcut you want.

#### Extension commands

| Command                   | Default key binding | Description                                               |
| ------------------------- | ------------------- | --------------------------------------------------------- |
| `chatgpt.addToThread`     | -                   | Add selected text range as context for the current thread |
| `chatgpt.addFileToThread` | -                   | Add the entire file as context for the current thread     |
| `chatgpt.newChat`         | macOS: `Cmd+N`      |
| Windows/Linux: `Ctrl+N`   | Create a new thread |
| `chatgpt.implementTodo`   | -                   | Ask Codex to address the selected TODO comment            |
| `chatgpt.newCodexPanel`   | -                   | Create a new Codex panel                                  |
| `chatgpt.openSidebar`     | -                   | Opens the Codex sidebar panel                             |

### Codex IDE extension features

Source: [Codex IDE extension features](/codex/ide/features.md)

The Codex IDE extension gives you access to Codex directly in VS Code, Cursor, Windsurf, and other VS Code-compatible editors. It uses the same agent as the Codex CLI and shares the same configuration.

#### Prompting Codex

Use Codex in your editor to chat, edit, and preview changes seamlessly. When Codex has context from open files and selected code, you can write shorter prompts and get faster, more relevant results.

You can reference any file in your editor by tagging it in your prompt like this:

```text
Use @example.tsx as a reference to add a new page named "Resources" to the app that contains a list of resources defined in @resources.ts
```

#### Switch between models

You can switch models with the switcher under the chat input.

#### Adjust reasoning effort

You can adjust reasoning effort to control how long Codex thinks before responding. Higher effort can help on complex tasks, but responses take longer. Higher effort also uses more tokens and can consume your rate limits faster, especially with higher-capability models.

Use the same model switcher shown above, and choose `low`, `medium`, or `high` for each model. Start with `medium`, and only switch to `high` when you need more depth.

#### Choose an approval mode

By default, Codex runs in `Agent` mode. In this mode, Codex can read files, make edits, and run commands in the working directory automatically. Codex still needs your approval to work outside the working directory or access the network.

When you just want to chat, or you want to plan before making changes, switch to `Chat` with the switcher under the chat input.

If you need Codex to read files, make edits, and run commands with network access without approval, use `Agent (Full Access)`. Exercise caution before doing so.

#### Cloud delegation

You can offload larger jobs to Codex in the cloud, then track progress and review results without leaving your IDE.

1. Set up a [cloud environment for Codex](https://chatgpt.com/codex/settings/environments).
2. Pick your environment and select **Run in the cloud**.

You can have Codex run from `main` (useful for starting new ideas), or run from your local changes (useful for finishing a task).

When you start a cloud task from a local conversation, Codex remembers the conversation context so it can pick up where you left off.

#### Cloud task follow-up

The Codex extension makes previewing cloud changes straightforward. You can ask for follow-ups to run in the cloud, but often you'll want to apply the changes locally to test and finish. When you continue the conversation locally, Codex also retains context to save you time.

You can also view the cloud tasks in the [Codex cloud interface](https://chatgpt.com/codex).

#### Web search

Codex ships with a first-party web search tool. For local tasks in the Codex IDE Extension, Codex enables web search by default and serves results from a web search cache. The cache is an OpenAI-maintained index of web results, so cached mode returns pre-indexed results instead of fetching live pages. This reduces exposure to prompt injection from arbitrary live content, but you should still treat web results as untrusted. If you configure your sandbox for [full access](/codex/agent-approvals-security), web search defaults to live results. See [Config basics](/codex/config-basic) to disable web search or switch to live results that fetch the most recent data.

You'll see `web_search` items in the transcript or `codex exec --json` output whenever Codex looks something up.

#### Drag and drop images into the prompt

You can drag and drop images into the prompt composer to include them as context.

Hold down `Shift` while dropping an image. VS Code otherwise prevents extensions from accepting a drop.

#### Image generation

Ask Codex to generate or edit images without leaving your editor. This is useful for UI assets, layouts, illustrations, sprite sheets, and quick placeholders while you work. Add a reference image to the prompt when you want Codex to transform or extend an existing asset.

You can ask in natural language or explicitly invoke the image generation skill by including `$imagegen` in your prompt.

Built-in image generation uses `gpt-image-2`, counts toward your general Codex usage limits, and uses included limits 3-5x faster on average than similar turns without image generation, depending on image quality and size. For details, see [Pricing](/codex/pricing#image-generation-usage-limits). For prompting tips and model details, see the [image generation guide](/api/docs/guides/image-generation).

For larger batches of image generation, set `OPENAI_API_KEY` in your environment variables and ask Codex to generate images through the API so API pricing applies instead.

#### IDE feature references

- [Codex IDE extension settings](/codex/ide/settings)

### Codex IDE extension settings

Source: [Codex IDE extension settings](/codex/ide/settings.md)

Use these settings to customize the Codex IDE extension.

#### Change a setting

To change a setting, follow these steps:

1. Open your editor settings.
2. Search for `Codex` or the setting name.
3. Update the value.

The Codex IDE extension uses the Codex CLI. Configure some behavior, such as the default model, approvals, and sandbox settings, in the shared `~/.codex/config.toml` file instead of in editor settings. See [Config basics](/codex/config-basic).

The extension also honors VS Code's built-in chat font settings for Codex conversation surfaces.

#### Settings reference

| Setting                                      | Description                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chat.fontSize`                              | Controls chat text in the Codex sidebar, including conversation content and the composer.                                                                                                                                                                                                                             |
| `chat.editor.fontSize`                       | Controls code-rendered content in Codex conversations, including code snippets and diffs.                                                                                                                                                                                                                             |
| `chatgpt.cliExecutable`                      | Development only: Path to the Codex CLI executable. You don't need to set this unless you're actively developing the Codex CLI. If you set this manually, parts of the extension might not work as expected.                                                                                                          |
| `chatgpt.commentCodeLensEnabled`             | Show CodeLens above to-do comments so you can complete them with Codex.                                                                                                                                                                                                                                               |
| `chatgpt.localeOverride`                     | Preferred language for the Codex UI. Leave empty to detect automatically.                                                                                                                                                                                                                                             |
| `chatgpt.openOnStartup`                      | Focus the Codex sidebar when the extension finishes starting.                                                                                                                                                                                                                                                         |
| `chatgpt.runCodexInWindowsSubsystemForLinux` | Windows only: Run Codex in WSL when Windows Subsystem for Linux (WSL) is available. Use this when your repositories and tooling live in WSL2 or when you need Linux-native tooling. Otherwise, Codex can run natively on Windows with the Windows sandbox. Changing this setting reloads VS Code to apply the change. |

### Codex IDE extension slash commands

Source: [Codex IDE extension slash commands](/codex/ide/slash-commands.md)

Slash commands let you control Codex without leaving the chat input. Use them to check status, switch between local and cloud mode, or send feedback.

#### Use a slash command

1. In the Codex chat input, type `/`.
2. Select a command from the list, or keep typing to filter (for example, `/status`).
3. Press **Enter**.

#### Available slash commands

| Slash command        | Description                                                                            |
| -------------------- | -------------------------------------------------------------------------------------- |
| `/auto-context`      | Turn Auto Context on or off to include recent files and IDE context automatically.     |
| `/cloud`             | Switch to cloud mode to run the task remotely (requires cloud access).                 |
| `/cloud-environment` | Choose the cloud environment to use (available only in cloud mode).                    |
| `/feedback`          | Open the feedback dialog to submit feedback and optionally include logs.               |
| `/goal`              | Set a persistent goal for Codex to work toward.                                        |
| `/local`             | Switch to local mode to run the task in your workspace.                                |
| `/review`            | Start code review mode to review uncommitted changes or compare against a base branch. |
| `/status`            | Show the thread ID, context usage, and rate limits.                                    |

If `/goal` doesn't appear in the slash command list, enable `features.goals`
in `config.toml`:

```toml
[features]
goals = true
```

You can also run `codex features enable goals` from the CLI or ask Codex to run it.

### Computer Use

Source: [Computer Use](/codex/app/computer-use.md)

In supported regions, computer use in the Codex app is available on macOS and
Windows. Install the Computer Use plugin. On macOS, grant Screen Recording and
Accessibility permissions when prompted.

With computer use, Codex can see and operate graphical user interfaces on macOS
or Windows. Use it for tasks where command-line tools or structured integrations
aren't enough, such as checking a desktop app, using a browser, changing app
settings, working with a data source that isn't available as a plugin, or
reproducing a bug that only happens in a graphical user interface.

Because computer use can affect app and system state outside your project
workspace, use it for scoped tasks and review permission prompts before
continuing.

#### Set up computer use

In Codex settings, open **Computer Use** and click **Install** to install the
Computer Use plugin before you ask Codex to operate desktop apps. On Windows,
keep the target app visible on the active desktop while the task runs. On
macOS, grant Screen Recording and Accessibility permissions when prompted so
Codex can see and interact with the target app.

On macOS, grant:

- **Screen Recording** permission so Codex can see the target app.
- **Accessibility** permission so Codex can click, type, and navigate.

#### When to use computer use

Choose computer use when the task depends on a graphical user interface that's
hard to verify through files or command output alone.

Good fits include:

- Testing a macOS app, Windows app, iOS simulator flow, or another desktop app
  that Codex is building.
- Performing a task that requires your web browser.
- Reproducing a bug that only appears in a graphical interface.
- Changing app settings that require clicking through a UI.
- Inspecting information in an app or data source that isn't available through a
  plugin.
- On macOS, running a scoped task in the background while you keep working
  elsewhere.
- Executing a workflow that spans more than one app.

For web apps you are building locally, use the
[in-app browser](/codex/app/browser) first.

#### Windows foreground use

On Windows, computer use runs on the active desktop. It can't operate in the
background while you keep using the same Windows session, so expect Codex to
move the pointer, type, and take over the foreground while the task runs.

For Windows tasks that should continue while you step away, keep the Windows
device unlocked and connected to the internet. Use
[remote control](/codex/remote-connections) from your phone to check progress
or send follow-up instructions, or run the Codex app inside a Windows virtual
machine so computer use takes over the VM instead of your main desktop.

#### Start a computer use task

Mention `@Computer` or `@AppName` in your prompt, or ask Codex to use
computer use. Describe the exact app, window, or flow Codex should operate.

```text
Open the app with computer use, reproduce the onboarding bug, and fix the
smallest code path that causes it. After each change, run the same UI flow
again.
```

```text
Open @Chrome and verify the checkout page still works after the latest changes.
```

If the target app exposes a dedicated plugin or MCP server, prefer that
structured integration for data access and repeatable operations. Choose
computer use when Codex needs to inspect or operate the app visually.

#### Permissions and approvals

System permissions for computer use are separate from app approvals in Codex.
On macOS, Screen Recording and Accessibility permissions let Codex see and
operate apps. App approvals determine which apps you allow Codex to use. File
reads, file edits, and shell commands still follow the sandbox and approval
settings for the thread.

With computer use, Codex can see and take action only in the apps you allow.
During a task, Codex asks for your permission before it can use an app on your
computer. You can choose **Always allow** so Codex can use that app in the future
without asking again. You can remove apps from the **Always allow** list in the
**Computer Use** section of Codex settings.

Codex may also ask for permission before taking sensitive or disruptive actions.

If Codex can't see or control an app, open **System Settings > Privacy &
Security** and check **Screen Recording** and **Accessibility** for the Codex
app on macOS. On Windows, make sure the target app is visible in the active
desktop session.

#### Configure Windows app policy

On Windows, Computer Use stores persistent app decisions in
`$CODEX_HOME/computer-use/config.toml`. List apps that Computer Use can open
without prompting and apps that it must decline:

```toml
[apps]
allowed = ["mspaint.exe"]
denied = ["calc.exe"]
```

Use the app identifier that Windows Computer Use reports, such as an executable
name for a desktop app or an app user model ID for a packaged app. Denied apps
take precedence over allowed apps. Codex prompts for apps that don't appear in
either list.

This file stores local Computer Use decisions. It's separate from the
admin-enforced `requirements.toml`, where administrators can disable Computer
Use with `[features].computer_use = false`.

#### Locked use

Locked use is for macOS. On Windows, computer use works in the foreground.

Locked computer use lets Codex use Computer Use after your Mac locks, but only
after you enable it. Use it when a Codex task needs to use desktop apps from a
connected device after the Mac locks.

When you enable locked computer use, Codex installs an Apple
[authorization plug-in](https://developer.apple.com/documentation/security/authorization-plug-ins)
that participates in the macOS unlock flow.

Locked use is intentionally narrow. It's not a general-purpose remote-unlock
path for your Mac, and it doesn't let other apps or local processes unlock the
computer.

To use locked computer use:

1. Open **Codex settings > Computer Use**.
2. Enable locked computer use.
3. Start a task that uses computer use from a connected device after your Mac's
   screen has locked.

When a Codex task accesses an app via Computer Use after your Mac locks, Codex
temporarily unlocks the Mac while blocking local use and preserving the locked
screen protections. Before unlocking, Codex checks whether the unlock attempt is
for an active, trusted computer use turn. Outside that short-lived window, Codex
denies the unlock and asks you to unlock manually if needed.

Locked use includes safeguards:

- The authorization window is short-lived and scoped to the current unlock
  attempt.
- Automatic unlock is available only to Codex during active computer use turns.
- Codex covers every display while the desktop is temporarily unlocked.
- If Codex detects local keyboard or pointer input, it relocks the Mac and
  pauses automatic unlock until you unlock it manually.

#### Safety guidance

With computer use, Codex can view screen content, take screenshots, and interact
with windows, menus, keyboard input, and clipboard state in the target app.
Treat visible app content, browser pages, screenshots, and files opened in the
target app as context Codex may process while the task runs.

Keep tasks narrow and stay present for sensitive flows:

- Give Codex one clear target app or flow at a time.
- You can stop the task or take over your computer at any time.
- Keep sensitive apps closed unless they're required for the task.
- On Windows, expect Codex to take over foreground input while it works; use a
  secondary device, a VM, or stop the task before using that desktop yourself.
- Avoid tasks that require secrets unless you're present and can approve each
  step.
- Review app permission prompts before allowing Codex to use an app.
- Use **Always allow** only for apps you trust Codex to use automatically in
  future tasks.
- Stay present for account, security, privacy, network, payment, or
  credential-related settings.
- Cancel the task if Codex starts interacting with the wrong window.

If Codex uses your browser, it can interact with pages where you're already
signed in. Review website actions as if you were taking them yourself: web pages
can contain malicious or misleading content, and sites may treat approved clicks,
form submissions, and signed-in actions as coming from your account. To keep
using your browser while Codex works, ask Codex to use a different browser.

The feature can't automate terminal apps or Codex itself, since automating them
could bypass Codex security policies. It also can't authenticate as an
administrator or approve security and privacy permission prompts on your
computer.

File edits and shell commands still follow Codex approval and sandbox settings
where applicable. Changes made through desktop apps may not appear in the review
pane until they're saved to disk and tracked by the project. Your ChatGPT data
controls apply to content processed through Codex, including screenshots taken
by computer use.

### In-app browser

Source: [In-app browser](/codex/app/browser.md)

The in-app browser gives you and Codex a shared view of rendered web pages
inside a thread. Use it when you're building or debugging a web app and want to
preview pages and attach visual comments.

Use it for local development servers, file-backed previews, and public pages
that don't require sign-in. For anything that depends on login state or browser
extensions, use your regular browser or the
[Codex Chrome extension](/codex/app/chrome-extension).

Open the in-app browser from the toolbar, by clicking a URL, by navigating
manually in the browser, or by pressing Cmd+Shift+B
(Ctrl+Shift+B on Windows).

The in-app browser does not support authentication flows, signed-in pages,
your regular browser profile, cookies, extensions, or existing tabs. Use it
for pages Codex can open without logging in.

Treat page content as untrusted context. Don't paste secrets into browser flows.

#### Browser use

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
[Codex Chrome extension](/codex/app/chrome-extension).

#### Preview a page

1. Start your app's development server in the [integrated terminal](/codex/app/features#integrated-terminal) or with a [local environment action](/codex/app/local-environments#actions).
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

#### Comment on the page

When a bug is visible only in the rendered page, use browser comments to give
Codex precise feedback on the page.

- Turn on Annotation mode, select an element or area, and submit a comment.
- In Annotation mode, hold Shift and click to select an area.
- Hold Cmd while clicking to send a comment immediately.

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

#### Styling feedback

When you add an annotation to a section on the page, press the config icon next
to the text input to give Codex more granular style feedback. You can change
values like font, text, spacing, and color, preview the result directly on the
page, and then send the annotation so Codex has a clearer target for the change.

#### Keep browser tasks scoped

The in-app browser is for review and iteration. Keep each browser task small
enough to review in one pass.

- Name the page, route, or local URL.
- Name the visual state you care about, such as loading, empty, error, or
  success.
- Leave comments on the exact elements or areas that need changes.
- Review the updated route after Codex changes the code.
- Ask Codex to start or check the dev server before it uses the browser.

For repository changes, use the [review pane](/codex/app/review) to inspect the
changes and leave comments.

#### Developer mode

Developer mode works with Browser use in Chrome and the Codex in-app browser.
It gives Codex controlled access to the Chrome DevTools Protocol (CDP). Use it
when you want Codex to profile JavaScript, inspect console output and network
traffic, examine page state such as the DOM and applied styles, or diagnose an
issue directly in the live browser.

To enable it, open [**Settings > Browser**](codex://settings/browser-use) and,
under **Developer mode**, turn on **Enable full CDP access**. If your
organization has disabled this setting, you can't enable it locally. Admins can
set `browser_use_full_cdp_access = false` under `[features]` in
[`requirements.toml`](/codex/enterprise/managed-configuration#pin-feature-flags).

Full CDP access lets Codex inspect and control sensitive browser internals that
may put your data at risk. Codex asks for explicit approval before it uses full
CDP to inspect a website. Review the site, task, and requested access before you
approve it.

Use `@Browser` for the in-app browser. To use Developer mode in Chrome,
[set up the Codex Chrome extension](/codex/app/chrome-extension) and invoke
`@Chrome`.

For example:

```text
This app is slow. Use @Browser to capture a performance trace and inspect
network traffic, then identify the bottleneck.
```

### Local environments

Source: [Local environments](/codex/app/local-environments.md)

Local environments let you configure setup steps for worktrees as well as common actions for a project.

You configure your local environments through the [Codex app settings](codex://settings) pane. You can check the generated file into your project's Git repository to share with others.

Codex stores this configuration inside the `.codex` folder at the root of your
project. If your repository contains more than one project, open the project
directory that contains the shared `.codex` folder.

#### Setup scripts

Since worktrees run in different directories than your local tasks, your project might not be fully set up and might be missing dependencies or files that aren't checked into your repository. Setup scripts run automatically when Codex creates a new worktree at the start of a new thread.

Use this script to run any command required to configure your environment, such as installing dependencies or running a build process.

For example, for a TypeScript project you might want to install the dependencies and do an initial build using a setup script:

```bash
npm install
npm run build
```

If your setup is platform-specific, define setup scripts for macOS, Windows, or Linux to override the default.

#### Actions

Use actions to define common tasks like starting your app's development server or running your test suite. These actions appear in the Codex app top bar for quick access. The actions will be run within the app's [integrated terminal](/codex/app/features#integrated-terminal).

Actions are helpful to keep you from typing common actions like triggering a build for your project or starting a development server. For one-off quick debugging you can use the integrated terminal directly.

For example, for a Node.js project you might create a "Run" action that contains the following script:

```bash
npm start
```

If the commands for your action are platform-specific, define platform-specific scripts for macOS, Windows, and Linux.

To identify your actions, choose an icon associated with each action.

### Review

Source: [Review](/codex/app/review.md)

The review pane helps you understand what Codex changed, give targeted feedback, and decide what to keep.

It only works for projects that live inside a Git repository. If your project
isn't a Git repository yet, the review pane will prompt you to create one.

#### What changes it shows

The review pane reflects the state of your Git repository, not just what Codex
edited. That means it will show:

- Changes made by Codex
- Changes you made yourself
- Any other uncommitted changes in the repo

By default, the review pane focuses on **uncommitted changes**. You can also
switch the scope to:

- **All branch changes** (diff against your base branch)
- **Last turn changes** (just the most recent assistant turn)

When working locally, you can also toggle between **Unstaged** and **Staged**
changes.

#### Navigating the review pane

- Clicking a file name typically opens that file in your chosen editor. You can choose the default editor in [settings](/codex/app/settings).
- Clicking the file name background expands or collapses the diff.
- Clicking a single line while holding Cmd pressed will open the line in your chosen editor.
- If you are happy with a change you can [stage the changes or revert changes](#staging-and-reverting-files) you don't like.

#### Inline comments for feedback

Inline comments let you attach feedback directly to specific lines in the diff.
This is often the fastest way to guide Codex to the right fix.

To leave an inline comment:

1. Open the review pane.
2. Hover the line you want to comment on.
3. Click the **+** button that appears.
4. Write your feedback and submit it.
5. After you finish leaving feedback, send a message back to the thread.

Because comments are line-specific, Codex can respond more precisely than with a
general instruction.

Codex treats inline comments as review guidance. After leaving comments, send a
follow-up message that makes your intent explicit, for example “Address the
inline comments and keep the scope minimal.”

#### Code review results

If you use `/review` to run a code review, comments will show up directly
inline in the review pane.

#### Pull request reviews

When Codex has GitHub access for your repository and the current project is on
the pull request branch, the Codex app can help you work through pull request
feedback without leaving the app. The sidebar shows pull request context and
feedback from reviewers, and the review pane shows comments alongside the diff
so you can ask Codex to address issues in the same thread.

Install the GitHub CLI (`gh`) and authenticate it with `gh auth login` so Codex
can load pull request context, review comments, and changed files. If `gh` is
missing or unauthenticated, pull request details may not appear in the sidebar
or review pane.

Use this flow when you want to keep the full fix loop in one place:

1. Open the review pane on the pull request branch.
2. Review the pull request context, comments, and changed files.
3. Ask Codex to fix the specific comments you want handled.
4. Inspect the resulting diff in the review pane.
5. Stage, commit, and push the changes to the PR branch when you are ready.

For GitHub-triggered reviews, see [Use Codex in GitHub](/codex/integrations/github).

#### Staging and reverting files

The review pane includes Git actions so you can shape the diff before you
commit.

You can stage, unstage, or revert changes at these levels:

- **Entire diff**: use the action buttons in the review header (for example,
  "Stage all" or "Revert all")
- **Per file**: stage, unstage, or revert an individual file
- **Per hunk**: stage, unstage, or revert a single hunk

Use staging when you want to accept part of the work, and revert when you want
to discard it.

#### Staged and unstaged states

Git can represent both staged and unstaged changes in the same file. When that
happens, it can look like the pane is showing “the same file twice” across
staged and unstaged views. That's normal Git behavior.

### Slash commands in Codex CLI

Source: [Slash commands in Codex CLI](/codex/cli/slash-commands.md)

Slash commands give you fast, keyboard-first control over Codex. Type `/` in
the composer to open the slash popup, choose a command, and Codex will perform
actions such as switching models, adjusting permissions, or summarizing long
conversations without leaving the terminal.

This guide shows you how to:

- Find the right built-in slash command for a task
- Steer an active session with commands like `/model`, `/fast`,
  `/personality`, `/permissions`, `/approve`, `/raw`, `/agent`, and `/status`

#### Built-in slash commands

Codex ships with the following commands. Open the slash popup and start typing
the command name to filter the list.

When a task is already running, you can type a slash command and press `Tab` to
queue it for the next turn. Codex parses queued slash commands when they run, so
command menus and errors appear after the current turn finishes. Slash
completion still works before you queue the command.

| Command                                                                         | Purpose                                                         | When to use it                                                                                             |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`/permissions`](#update-permissions-with-permissions)                          | Set what Codex can do without asking first.                     | Relax or tighten approval requirements mid-session, such as switching between Auto and Read Only.          |
| [`/ide`](#include-ide-context-with-ide)                                         | Include open files, current selection, and other IDE context.   | Pull editor context into the next prompt without re-explaining what's open in your IDE.                    |
| [`/keymap`](#remap-tui-shortcuts-with-keymap)                                   | Remap TUI keyboard shortcuts.                                   | Inspect and persist custom shortcut bindings in `config.toml`.                                             |
| [`/vim`](#toggle-vim-mode-with-vim)                                             | Toggle Vim mode for the composer.                               | Switch between Vim normal/insert behavior and the default composer editing mode.                           |
| [`/sandbox-add-read-dir`](#grant-sandbox-read-access-with-sandbox-add-read-dir) | Grant sandbox read access to an extra directory (Windows only). | Unblock commands that need to read an absolute directory path outside the current readable roots.          |
| [`/agent`](#switch-agent-threads-with-agent)                                    | Switch the active agent thread.                                 | Inspect or continue work in a spawned subagent thread.                                                     |
| [`/apps`](#browse-apps-with-apps)                                               | Browse apps (connectors) and insert them into your prompt.      | Attach an app as `$app-slug` before asking Codex to use it.                                                |
| [`/plugins`](#browse-plugins-with-plugins)                                      | Browse installed and discoverable plugins.                      | Inspect plugin tools, install suggested plugins, or manage plugin availability.                            |
| [`/hooks`](#view-and-manage-lifecycle-hooks-with-hooks)                         | View and manage lifecycle hooks.                                | Inspect configured hooks, trust new or changed hooks, or disable non-managed hooks before they run.        |
| [`/clear`](#clear-the-terminal-and-start-a-new-chat-with-clear)                 | Clear the terminal and start a fresh chat.                      | Reset the visible UI and conversation together when you want a fresh start.                                |
| [`/archive`](#archive-the-current-session-with-archive)                         | Archive the current session and exit Codex.                     | Remove the current session from active session lists without deleting its transcript.                      |
| [`/delete`](#delete-the-current-session-with-delete)                            | Permanently delete the current session and exit Codex.          | Remove the transcript and descendant sessions when archiving isn't enough.                                 |
| [`/compact`](#keep-transcripts-lean-with-compact)                               | Summarize the visible conversation to free tokens.              | Use after long runs so Codex retains key points without blowing the context window.                        |
| [`/copy`](#copy-the-latest-response-with-copy)                                  | Copy the latest completed Codex output.                         | Grab the latest finished response or plan text without manually selecting it. You can also press `Ctrl+O`. |
| [`/diff`](#review-changes-with-diff)                                            | Show the Git diff, including files Git isn't tracking yet.      | Review Codex's edits before you commit or run tests.                                                       |
| [`/exit`](#exit-the-cli-with-quit-or-exit)                                      | Exit the CLI (same as `/quit`).                                 | Alternative spelling; both commands exit the session.                                                      |
| [`/experimental`](#toggle-experimental-features-with-experimental)              | Toggle experimental features.                                   | Enable optional features such as subagents from the CLI.                                                   |
| [`/approve`](#approve-an-auto-review-denial-with-approve)                       | Approve one retry of a recent auto review denial.               | Retry a command or action that the auto reviewer denied.                                                   |
| [`/memories`](#configure-memories-with-memories)                                | Configure memory use and generation.                            | Turn memory injection or memory generation on or off without leaving the TUI.                              |
| [`/skills`](#use-skills-with-skills)                                            | Browse and use skills.                                          | Improve task-specific behavior by selecting a relevant local skill.                                        |
| [`/import`](#import-claude-code-configuration-with-import)                      | Import Claude Code setup, project files, and recent chats.      | Migrate supported external-agent artifacts into Codex configuration and local files.                       |
| [`/feedback`](#send-feedback-with-feedback)                                     | Send logs to the Codex maintainers.                             | Report issues or share diagnostics with support.                                                           |
| [`/init`](#generate-agentsmd-with-init)                                         | Generate an `AGENTS.md` scaffold in the current directory.      | Capture persistent instructions for the repository or subdirectory you're working in.                      |
| [`/logout`](#sign-out-with-logout)                                              | Sign out of Codex.                                              | Clear local credentials when using a shared machine.                                                       |
| [`/mcp`](#list-mcp-tools-with-mcp)                                              | List configured Model Context Protocol (MCP) tools.             | Check which external tools Codex can call during the session; add `verbose` for server details.            |
| [`/mention`](#highlight-files-with-mention)                                     | Attach a file to the conversation.                              | Point Codex at specific files or folders you want it to inspect next.                                      |
| [`/model`](#set-the-active-model-with-model)                                    | Choose the active model (and reasoning effort, when available). | Switch between general-purpose models (`gpt-4.1-mini`) and deeper reasoning models before running a task.  |
| [`/fast`](#toggle-fast-mode-with-fast)                                          | Toggle a Fast service tier when the model catalog exposes one.  | Turn the current model's Fast tier on or off, or check whether the thread is using it.                     |
| [`/plan`](#switch-to-plan-mode-with-plan)                                       | Switch to plan mode and optionally send a prompt.               | Ask Codex to propose an execution plan before implementation work starts.                                  |
| [`/goal`](#set-or-view-a-task-goal-with-goal)                                   | Set, pause, resume, view, or clear a task goal.                 | Give Codex a persistent target to track while a larger task runs.                                          |
| [`/personality`](#set-a-communication-style-with-personality)                   | Choose a communication style for responses.                     | Make Codex more concise, more explanatory, or more collaborative without changing your instructions.       |
| [`/ps`](#check-background-terminals-with-ps)                                    | Show experimental background terminals and their recent output. | Check long-running commands without leaving the main transcript.                                           |
| [`/stop`](#stop-background-terminals-with-stop)                                 | Stop all background terminals.                                  | Cancel background terminal work started by the current session.                                            |
| [`/fork`](#fork-the-current-conversation-with-fork)                             | Fork the current conversation into a new thread.                | Branch the active session to explore a new approach without losing the current transcript.                 |
| [`/side`, `/btw`](#start-a-side-conversation-with-side)                         | Start an ephemeral side conversation.                           | Ask a focused follow-up without disrupting the main thread's transcript.                                   |
| [`/raw`](#toggle-raw-scrollback-with-raw)                                       | Toggle raw scrollback mode.                                     | Make terminal selection and copying less formatted while reviewing long output.                            |
| [`/resume`](#resume-a-saved-conversation-with-resume)                           | Resume a saved conversation from your session list.             | Continue work from a previous CLI session without starting over.                                           |
| [`/new`](#start-a-new-conversation-with-new)                                    | Start a new conversation inside the same CLI session.           | Reset the chat context without leaving the CLI when you want a fresh prompt in the same repo.              |
| [`/quit`](#exit-the-cli-with-quit-or-exit)                                      | Exit the CLI.                                                   | Leave the session immediately.                                                                             |
| [`/review`](#ask-for-a-working-tree-review-with-review)                         | Ask Codex to review your working tree.                          | Run after Codex completes work or when you want a second set of eyes on local changes.                     |
| [`/status`](#inspect-the-session-with-status)                                   | Display session configuration and token usage.                  | Confirm the active model, approval policy, writable roots, and remaining context capacity.                 |
| [`/usage`](#view-account-usage-with-usage)                                      | View account token usage or use a rate-limit reset.             | Inspect daily, weekly, or cumulative ChatGPT token activity from inside the TUI.                           |
| [`/debug-config`](#inspect-config-layers-with-debug-config)                     | Print config layer and requirements diagnostics.                | Debug precedence and policy requirements, including experimental network constraints.                      |
| [`/statusline`](#configure-footer-items-with-statusline)                        | Configure TUI status-line fields interactively.                 | Pick and reorder footer items (model/context/limits/git/tokens/session) and persist in config.toml.        |
| [`/title`](#configure-terminal-title-items-with-title)                          | Configure terminal window or tab title fields interactively.    | Pick and reorder title items such as project, status, thread, branch, model, and task progress.            |
| [`/theme`](#choose-a-syntax-theme-with-theme)                                   | Choose a syntax-highlighting theme.                             | Preview and persist a terminal syntax-highlighting theme.                                                  |

`/quit` and `/exit` both exit the CLI. Use them only after you have saved or
committed any important work.

Use `/permissions` to adjust what Codex can do without asking first. Use
`/approve` only when you need to retry a recent action that automatic review
denied.

#### Control your session with slash commands

The following workflows keep your session on track without restarting Codex.

#### Set the active model with `/model`

1. Start Codex and open the composer.
2. Type `/model` and press Enter.
3. Choose a model such as `gpt-4.1-mini` or `gpt-4.1` from the popup.

Expected: Codex confirms the new model in the transcript. Run `/status` to verify the change.

#### Toggle Fast mode with `/fast`

1. Type `/fast on`, `/fast off`, or `/fast status`.
2. If you want the setting to persist, confirm the update when Codex offers to save it.

Expected: Codex reports whether the current model's Fast service tier is on or
off for the current thread. In the TUI footer, you can also show a Fast mode
status-line item with `/statusline`.

Fast tier commands are catalog-driven. If the current model doesn't advertise a
Fast tier, Codex won't show `/fast`.

#### Set a communication style with `/personality`

Use `/personality` to change how Codex communicates without rewriting your prompt.

1. In an active conversation, type `/personality` and press Enter.
2. Choose a style from the popup.

Expected: Codex confirms the new style in the transcript and uses it for later
responses in the thread.

Codex supports `friendly`, `pragmatic`, and `none` personalities. Use `none`
to disable personality instructions.

If the active model doesn't support personality-specific instructions, Codex hides this command.

#### Switch to plan mode with `/plan`

1. Type `/plan` and press Enter to switch the active conversation into plan
   mode.
2. Optional: provide inline prompt text (for example, `/plan Propose a
migration plan for this service`).
3. You can paste content or attach images while using inline `/plan` arguments.

Expected: Codex enters plan mode and uses your optional inline prompt as the first planning request.

While a task is already running, `/plan` is temporarily unavailable.

#### Set or view a task goal with `/goal`

1. Type `/goal ` to set the goal, for example `/goal Finish the migration and keep tests green`.
2. Type `/goal` to view the current goal.
3. Use `/goal pause`, `/goal resume`, or `/goal clear` to pause, resume, or remove it.

Expected: Codex keeps the goal attached to the active thread while work continues.

Goal objectives must be non-empty and at most 4,000 characters. For longer
instructions, put the details in a file and point the goal at that file.

#### Toggle experimental features with `/experimental`

1. Type `/experimental` and press Enter.
2. Toggle the features you want (for example, Apps or Smart Approvals), then restart Codex if the prompt asks you to.

Expected: Codex saves your feature choices to config and applies them on restart.

#### Approve an auto review denial with `/approve`

Use `/approve` when the automatic reviewer denied a recent action and you want
Codex to retry it once.

1. Type `/approve`.
2. Confirm the retry when Codex shows the relevant denied action.

Expected: Codex retries that denied action once under the current session
policy.

#### Configure memories with `/memories`

1. Type `/memories`.
2. Choose whether Codex should use existing memories, generate new memories, or
   keep memory behavior disabled.

Expected: Codex updates the relevant memory settings for future sessions.

#### Use skills with `/skills`

1. Type `/skills`.
2. Pick the skill you want Codex to apply.

Expected: Codex inserts the selected skill context so the next request follows
that skill's instructions.

#### Import Claude Code configuration with `/import`

1. Type `/import`.
2. Choose the Claude Code setup, project files, or recent chats you want to migrate.

Expected: Codex opens the external-agent import picker and imports the selected
supported artifacts into Codex configuration and local files.

Run `/import` from a local TUI session. It's unavailable while a task is running,
in remote sessions, and while connected to the local app-server daemon.

#### Clear the terminal and start a new chat with `/clear`

1. Type `/clear` and press Enter.

Expected: Codex clears the terminal, resets the visible transcript, and starts
a fresh chat in the same CLI session.

Unlike Ctrl+L, `/clear` starts a new conversation.

Ctrl+L only clears the terminal view and keeps the current
chat. Codex disables both actions while a task is in progress.

### Troubleshooting

Source: [Troubleshooting](/codex/app/troubleshooting.md)

#### Frequently Asked Questions

#### Files appear in the side panel that Codex didn't edit

If your project is inside a Git repository, the review panel automatically
shows changes based on your project's Git state, including changes that Codex
didn't make.

In the review pane, you can switch between staged changes and changes not yet
staged, and compare your branch with main.

If you want to see only the changes of your last Codex turn, switch the diff
pane to the "Last turn changes" view.

[Learn more about how to use the review pane](/codex/app/review).

#### Remove a project from the sidebar

To remove a project from the sidebar, hover over the name of your project, click
the three dots and choose "Remove." To restore it, re-add the
project using the **Add new project** button next to **Threads** or using

Cmd+O.

#### Find archived threads

Archived threads can be found in the [Settings](codex://settings). When you
unarchive a thread it will reappear in the original location of your sidebar.

#### Only some threads appear in the sidebar

The sidebar allows filtering of threads depending on the state of a project. If
you're missing threads, click the filter icon next to the **Threads** label and
switch to Chronological. If you still don't see the thread, open
[Settings](codex://settings) and check the archived chats or archived threads
section.

#### Code doesn't run on a worktree

Worktrees are created in a different directory and inherit files checked into
Git by default. Depending on how you manage dependencies and tooling for your
project, you might have to run setup scripts on your worktree using a
[local environment](/codex/app/local-environments) or copy ignored setup files
with [`.worktreeinclude`](/codex/app/worktrees#copy-ignored-local-files-into-managed-worktrees).
Alternatively, you can check out the changes in your regular local project. See
the [worktrees documentation](/codex/app/worktrees) to learn more.

#### App doesn't pick up a teammate's shared local environment

The local environment configuration must be inside the `.codex` folder at the
root of your project. If you are working in a monorepo with more than one
project, make sure you open the project in the directory that contains the
`.codex` folder.

#### Codex asks to access Apple Music

Depending on your task, Codex may need to navigate the file system. Certain
directories on macOS, including Music, Downloads, or Desktop, require
additional approval from the user. If Codex needs to read your home directory,
macOS prompts you to approve access to those folders.

#### Automations create many worktrees

Frequent automations can create many worktrees over time. Archive automation
runs you no longer need and avoid pinning runs unless you intend to keep their
worktrees.

#### Recover a prompt after selecting the wrong target

If you started a thread with the wrong target (**Local**, **Worktree**, or **Cloud**) by accident, you can cancel the current run and recover your previous prompt by pressing the up arrow key in the composer.

#### Feature is working in the Codex CLI but not in the Codex app

The Codex app and Codex CLI use the same underlying Codex agent and configuration but might rely on different versions of the agent at any time and some experimental features might land in the Codex CLI first.

To get the version of the Codex CLI on your system run:

```bash
codex --version
```

To get the version of Codex bundled with your Codex app run:

```bash
/Applications/Codex.app/Contents/Resources/codex --version
```

#### Feedback and logs

Type / into the message composer to provide feedback for the team. If
you trigger feedback in an existing conversation, you can choose to share the
existing session along with your feedback. After submitting your feedback,
you'll receive a session ID that you can share with the team.

To report an issue:

1. Find [existing issues](https://github.com/openai/codex/issues) on the Codex GitHub repo.
2. [Open a new GitHub issue](https://github.com/openai/codex/issues/new?template=2-bug-report.yml&steps=Uploaded%20thread%3A%20019c0d37-d2b6-74c0-918f-0e64af9b6e14)

More logs are available in the following locations:

- App logs (macOS): `~/Library/Logs/com.openai.codex/YYYY/MM/DD`
- Session transcripts: `$CODEX_HOME/sessions` (default: `~/.codex/sessions`)
- Archived sessions: `$CODEX_HOME/archived_sessions` (default: `~/.codex/archived_sessions`)

If you share logs, review them first to confirm they don't contain sensitive
information.

#### Stuck states and recovery patterns

If a thread appears stuck:

1. Check whether Codex is waiting for an approval.
2. Open the terminal and run a basic command like `git status`.
3. Start a new thread with a smaller, more focused prompt.

If you cancel worktree creation by mistake and lose your prompt, press the up
arrow key in the composer to recover it.

#### Terminal issues

**Terminal appears stuck**

1. Close the terminal panel.
2. Reopen it with Cmd+J.
3. Re-run a basic command like `pwd` or `git status`.

If commands behave differently than expected, validate the current directory and
branch in the terminal first.

If it continues to be stuck, wait until your active Codex threads are completed and restart the app.

**Fonts aren't rendering correctly**

Codex uses the same font for the review pane, integrated terminal and any other code displayed inside the app. You can configure the font inside the [Settings](codex://settings) pane as **Code font**.

### Windows app

Source: [Windows](/codex/app/windows.md)

The [Codex app for Windows](https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi) gives you one interface for
working across projects, running parallel agent threads, and reviewing results.
The Windows app supports core workflows such as worktrees, automations, Git
functionality, the in-app browser, artifact previews, plugins, and skills.
It runs natively on Windows using PowerShell and the
[Windows sandbox](/codex/windows#windows-sandbox), or you can configure it to
run in [Windows Subsystem for Linux 2 (WSL2)](#windows-subsystem-for-linux-wsl).

#### Download the Codex app

Download the [Codex app](https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi) for Windows.

Then follow the [quickstart](/codex/quickstart?setup=app) to get started.

For enterprises, administrators can deploy the app with Microsoft Store app
distribution through enterprise management tools.

If you prefer a command-line install path, or need an alternative to opening
the Microsoft Store UI, run:

```powershell
winget install Codex -s msstore
```

#### Native sandbox

The Codex app on Windows supports a native [Windows sandbox](/codex/windows#windows-sandbox) when the agent runs in PowerShell, and uses Linux sandboxing when you run the agent in [Windows Subsystem for Linux 2 (WSL2)](#windows-subsystem-for-linux-wsl). To apply sandbox protections in either mode, set sandbox permissions to **Default permissions** in the Composer before sending messages to Codex.

Running Codex in full access mode means Codex is not limited to your project
directory and might perform unintentional destructive actions that can lead to
data loss. Keep sandbox boundaries in place and use [rules](/codex/rules) for
targeted exceptions, or set your [approval policy to
never](/codex/agent-approvals-security#run-without-approval-prompts) to have
Codex attempt to solve problems without asking for escalated permissions,
based on your [approval and security setup](/codex/agent-approvals-security).

#### Customize for your dev setup

#### Preferred editor

Choose a default app for **Open**, such as Visual Studio, VS Code, or another
editor. You can override that choice per project. If you already picked a
different app from the **Open** menu for a project, that project-specific
choice takes precedence.

#### Integrated terminal

You can also choose the default integrated terminal. Depending on what you have
installed, options include:

- PowerShell
- Command Prompt
- Git Bash
- WSL

This change applies only to new terminal sessions. If you already have an
integrated terminal open, restart the app or start a new thread before
expecting the new default terminal to appear.

#### Windows Subsystem for Linux (WSL)

By default, the Codex app uses the Windows-native agent. That means the agent
runs commands in PowerShell. The app can still work with projects that live in
Windows Subsystem for Linux 2 (WSL2) by using the `wsl` CLI when needed.

If you want to add a project from the WSL filesystem, click **Add new project**
or press Ctrl+O, then type `\\wsl$\` into the File
Explorer window. From there, choose your Linux distribution and the folder you
want to open.

If you plan to keep using the Windows-native agent, prefer storing projects on
your Windows filesystem and accessing them from WSL through
`/mnt//...`. This setup is more reliable than opening projects
directly from the WSL filesystem.

If you want the agent itself to run in WSL2, open **[Settings](codex://settings)**,
switch the agent from Windows native to WSL, and **restart the app**. The
change doesn't take effect until you restart. Your projects should remain in
place after restart.

WSL1 was supported through Codex `0.114`. Starting in Codex `0.115`, the Linux
sandbox moved to `bubblewrap`, so WSL1 is no longer supported.

You configure the integrated terminal independently from the agent. See
[Customize for your dev setup](#customize-for-your-dev-setup) for the
terminal options. You can keep the agent in WSL and still use PowerShell in the
terminal, or use WSL for both, depending on your workflow.

#### Useful developer tools

Codex works best when a few common developer tools are already installed:

- **Git**: Powers the review panel in the Codex app and lets you inspect or
  revert changes.
- **Node.js**: A common tool that the agent uses to perform tasks more
  efficiently.
- **Python**: A common tool that the agent uses to perform tasks more
  efficiently.
- **.NET SDK**: Useful when you want to build native Windows apps.
- **GitHub CLI**: Powers GitHub-specific functionality in the Codex app.

Install them with the default Windows package manager `winget` by pasting this
into the [integrated terminal](/codex/app/features#integrated-terminal) or
asking Codex to install them:

```powershell
winget install --id Git.Git
winget install --id OpenJS.NodeJS.LTS
winget install --id Python.Python.3.14
winget install --id Microsoft.DotNet.SDK.10
winget install --id GitHub.cli
```

After installing GitHub CLI, run `gh auth login` to enable GitHub features in
the app.

If you need a different Python or .NET version, change the package IDs to the
version you want.

#### Troubleshooting and FAQ

#### Run commands with elevated permissions

If you need Codex to run commands with elevated permissions, start the Codex app
itself as an administrator. After installation, open the Start menu, find
Codex, and choose Run as administrator. The Codex agent inherits that
permission level.

#### PowerShell execution policy blocks commands

If you have never used tools such as Node.js or `npm` in PowerShell before, the
Codex agent or integrated terminal may hit execution policy errors.

This can also happen if Codex creates PowerShell scripts for you. In that case,
you may need a less restrictive execution policy before PowerShell will run
them.

An error may look something like this:

```text
npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

A common fix is to set the execution policy to `RemoteSigned`:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```

For details and other options, check Microsoft's
[execution policy guide](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies)
before changing the policy.

#### Local environment scripts on Windows

If your [local environment](/codex/app/local-environments) uses cross-platform
commands such as `npm` scripts, you can keep one shared setup script or
set of actions for every platform.

If you need Windows-specific behavior, create Windows-specific setup scripts or
Windows-specific actions.

Actions run in the environment used by your integrated terminal. See
[Customize for your dev setup](#customize-for-your-dev-setup).

Local setup scripts run in the agent environment: WSL if the agent uses WSL,
and PowerShell otherwise.

#### Share config, auth, and sessions with WSL

The Windows app uses the same Codex home directory as native Codex on Windows:
`%USERPROFILE%\.codex`.

If you also run the Codex CLI inside WSL, the CLI uses the Linux home
directory by default, so it doesn't automatically share configuration, cached
auth, or session history with the Windows app.

To share them, use one of these approaches:

- Sync WSL `~/.codex` with `%USERPROFILE%\.codex` on your file system.
- Point WSL at the Windows Codex home directory by setting `CODEX_HOME`:

```bash
export CODEX_HOME=/mnt/c/Users//.codex
```

If you want that setting in every shell, add it to your WSL shell profile, such
as `~/.bashrc` or `~/.zshrc`.

#### Git features are unavailable

If you don't have Git installed natively on Windows, the app can't use some
features. Install it with `winget install Git.Git` from PowerShell or `cmd.exe`.

#### Git isn't detected for projects opened from `\\wsl$`

For now, if you want to use the Windows-native agent with a project also
accessible from WSL, the most reliable workaround is to store the project
on the native Windows drive and access it in WSL through `/mnt//...`.

#### `Cmder` isn't listed in the open dialog

If `Cmder` is installed but doesn't show in Codex's open dialog, add it to the
Windows Start Menu: right-click `Cmder` and choose **Add to Start**, then
restart Codex or reboot.

### Worktrees

Source: [Worktrees](/codex/app/worktrees.md)

In the Codex app, worktrees let Codex run multiple independent tasks in the same project without interfering with each other. For Git repositories, [automations](/codex/app/automations) run on dedicated background worktrees so they don't conflict with your ongoing work. In non-version-controlled projects, automations run directly in the project directory. You can also start threads on a worktree manually, and use Handoff to move a thread between Local and Worktree.

#### What's a worktree

Worktrees only work in projects that are part of a Git repository since they use [Git worktrees](https://git-scm.com/docs/git-worktree) under the hood. A worktree allows you to create a second copy ("checkout") of your repository. Each worktree has its own copy of every file in your repo but they all share the same metadata (`.git` folder) about commits, branches, etc. This allows you to check out and work on multiple branches in parallel.

#### Terminology

- **Local checkout**: The repository that you created. Sometimes just referred to as **Local** in the Codex app.
- **Worktree**: A [Git worktree](https://git-scm.com/docs/git-worktree) that was created from your local checkout in the Codex app.
- **Handoff**: The flow that moves a thread between Local and Worktree. Codex handles the Git operations required to move your work safely between them.

#### Why use a worktree

1. Work in parallel with Codex without disturbing your current Local setup.
2. Queue up background work while you stay focused on the foreground.
3. Move a thread into Local later when you're ready to inspect, test, or collaborate more directly.

#### Worktree setup

Worktrees require a Git repository. Make sure the project you selected lives in one.

1.  Select "Worktree"

    In the new thread view, select **Worktree** under the composer.
    Optionally, choose a [local environment](/codex/app/local-environments) to run setup scripts for the worktree.

2.  Select the starting branch

    Below the composer, choose the Git branch to base the worktree on. This can be your `main` / `master` branch, a feature branch, or your current branch with unstaged local changes.

3.  Submit your prompt

    Submit your task and Codex will create a Git worktree based on the branch you selected. By default, Codex works in a ["detached HEAD"](https://git-scm.com/docs/git-checkout#_detached_head).

4.  Choose where to keep working

    When you're ready, you can either keep working directly on the worktree or hand the thread off to your local checkout. Handing off to or from local will move your thread _and_ code so you can continue in the other checkout.

#### Working between Local and Worktree

Worktrees look and feel much like your local checkout. The difference is where they fit into your flow. You can think of Local as the foreground and Worktree as the background. Handoff lets you move a thread between them.

Under the hood, Handoff handles the Git operations required to move work between two checkouts safely. This matters because **Git only allows a branch to be checked out in one place at a time**. If you check out a branch on a worktree, you **can't** check it out in your local checkout at the same time, and vice versa.

In practice, there are two common paths:

1. [Work exclusively on the worktree](#option-1-working-on-the-worktree). This path works best when you can verify changes directly on the worktree, for example because you have dependencies and tools installed using a [local environment setup script](/codex/app/local-environments).
2. [Hand the thread off to Local](#option-2-handing-a-thread-off-to-local). Use this when you want to bring the thread into the foreground, for example because you want to inspect changes in your usual IDE or can run only one instance of your app.

#### Option 1: Working on the worktree

If you want to stay exclusively on the worktree with your changes, turn your worktree into a branch using the **Create branch here** button in the header of your thread.

From here you can commit your changes, push your branch to your remote repository, and open a pull request on GitHub.

You can open your IDE to the worktree using the "Open" button in the header, use the integrated terminal, or anything else that you need to do from the worktree directory.

Remember, if you create a branch on a worktree, you can't check it out in any other worktree, including your local checkout.

#### Option 2: Handing a thread off to Local

If you want to bring a thread into the foreground, click **Hand off** in the header of your thread and move it to **Local**.

This path works well when you want to read the changes in your usual IDE window, run your existing development server, or validate the work in the same environment you already use day to day.

Codex handles the Git steps required to move the thread safely between the worktree and your local checkout.

Each thread keeps the same associated worktree over time. If you hand the thread back to a worktree later, Codex returns it to that same background environment so you can pick up where you left off.

You can also go the other direction. If you're already working in Local and want to free up the foreground, use **Hand off** to move the thread to a worktree. This is useful when you want Codex to keep working in the background while you switch your attention back to something else locally.

Since Handoff uses Git operations, any files that are part of your `.gitignore` file won't move with the thread unless Codex copies them into a local managed worktree with `.worktreeinclude`.

#### Advanced details

#### Codex-managed and permanent worktrees

By default, threads use a Codex-managed worktree. These are meant to feel lightweight and disposable. A Codex-managed worktree is typically dedicated to one thread, and Codex returns that thread to the same worktree if you hand it back there later.

If you want a long-lived environment, create a permanent worktree from the three-dot menu on a project in the sidebar. This creates a new permanent worktree as its own project. Permanent worktrees aren't automatically deleted, and you can start multiple threads from the same worktree.

#### How Codex manages worktrees for you

Codex creates worktrees in `$CODEX_HOME/worktrees`. The starting commit will be the `HEAD` commit of the branch selected when you start your thread. If you chose a branch with local changes, the uncommitted changes will be applied to the worktree as well. The worktree will _not_ be checked out as a branch. It will be in a [detached HEAD](https://git-scm.com/docs/git-checkout#_detached_head) state. This lets Codex create several worktrees without polluting your branches.

#### Copy ignored local files into managed worktrees

Local Codex-managed worktrees start from a Git checkout, so tracked files are already present. If your repository ignores local setup files that a new worktree needs, add a `.worktreeinclude` file to the repository root and list the ignored paths or `.gitignore`-style patterns to copy when Codex creates a managed worktree.

Use this for files Git intentionally ignores, such as `.env`, `.env.local`, or `config/secrets.json`. Codex only copies ignored files that match `.worktreeinclude`; it doesn't copy other local files that Git doesn't track. Don't list tracked files.

Codex automatically copies an ignored `AGENTS.override.md` into local managed worktrees, so you don't need to list it in `.worktreeinclude`.

```text
# .worktreeinclude
.env
.env.local
config/secrets.json
```

Codex skips source symlinks and won't overwrite files that already exist in the new checkout. This behavior applies to local Codex app managed worktrees, not remote worktrees or Git worktrees you create yourself from the command line.

#### Branch limitations

Suppose Codex finishes some work on a worktree and you choose to create a `feature/a` branch on it using **Create branch here**. Now, you want to try it on your local checkout. If you tried to check out the branch, you would get the following error:

```
fatal: 'feature/a' is already used by worktree at '<WORKTREE_PATH>'
```

To resolve this, you would need to check out another branch instead of `feature/a` on the worktree.

If you plan on checking out the branch locally, use Handoff to move the thread into Local instead of trying to keep the same branch checked out in both places at once.

#### Why this limitation exists

Git prevents the same branch from being checked out in more than one worktree at a time because a branch represents a single mutable reference (`refs/heads/`) whose meaning is “the current checked-out state” of a working tree.

When a branch is checked out, Git treats its HEAD as owned by that worktree and expects operations like commits, resets, rebases, and merges to advance that reference in a well-defined, serialized way. Allowing multiple worktrees to simultaneously check out the same branch would create ambiguity and race conditions around which worktree’s operations update the branch reference, potentially leading to lost commits, inconsistent indexes, or unclear conflict resolution.

By enforcing a one-branch-per-worktree rule, Git guarantees that each branch has a single authoritative working copy, while still allowing other worktrees to safely reference the same commits via detached HEADs or separate branches.

#### Worktree cleanup

Worktrees can take up a lot of disk space. Each one has its own set of repository files, dependencies, build caches, etc. As a result, the Codex app tries to keep the number of worktrees to a reasonable limit.

By default, Codex keeps your most recent 15 Codex-managed worktrees. You can change this limit or turn off automatic deletion in settings if you prefer to manage disk usage yourself.

Codex tries to avoid deleting worktrees that are still important. Codex-managed worktrees won't be deleted automatically if:

- A pinned conversation is tied to it
- The thread is still in progress
- The worktree is a permanent worktree

Codex-managed worktrees are deleted automatically when:

- You archive the associated thread
- Codex needs to delete older worktrees to stay within your configured limit

Before deleting a Codex-managed worktree, Codex saves a snapshot of the work on it. If you open a conversation after its worktree was deleted, you'll see the option to restore it.

#### Can I control where worktrees are created?

Not today. Codex creates worktrees under `$CODEX_HOME/worktrees` so it can
manage them consistently.

#### Can I move a thread between Local and Worktree?

Yes. Use **Hand off** in the thread header to move a thread between your local
checkout and a worktree. Codex handles the Git operations needed to move the
thread safely between environments. If you hand a thread back to a worktree
later, Codex returns it to the same associated worktree.

#### What happens to threads if a worktree is deleted?

Threads can remain in your history even if the underlying worktree directory
is deleted. For Codex-managed worktrees, Codex saves a snapshot before
deleting the worktree and offers to restore it if you reopen the associated
thread. Permanent worktrees are not automatically deleted when you archive
their threads.

### Appshots

Source: [Appshots](/codex/appshots.md)

Appshots let you send the frontmost app window to a Codex thread. Use them when
you're actively working in another app on your computer and want to provide
Codex with your current context so it can help you with the task.

Appshots are available in the Codex app on macOS. Press both Command keys, or
your custom Appshots hotkey, to take one.

#### What appshots capture

An appshot captures the frontmost window only. It can include:

- An image of the visible window.
- Available text from that window, including visible text and text the app makes
  available outside the visible scroll area.

After you add an appshot to a thread, it behaves like a Codex attachment. Codex
stores appshots locally in the session file, like files or images you attach
manually.

#### When to use appshots

Use appshots when Codex needs context from a Mac app before it can act.

Examples:

- Share an API reference page and ask Codex to write a script that uses it.
- Share an email or calendar view and ask Codex to draft the next step.
- Share an image editor, design, or preview window and ask Codex to revise the
  related assets or code.
- Share an error, settings panel, or app state that's easier to show than
  describe.

#### Take an appshot

1. Open the Codex app on your Mac.
2. Open the app and window you want to share.
3. Press both Command keys, or the custom hotkey you configured in Codex
   settings.
4. Allow macOS permissions if Codex asks.
5. Ask Codex to perform a task with the appshot.

By default, Codex starts a new thread for the appshot. If you interacted with a
Codex thread in the last 60 seconds, Codex adds the appshot to that recent
thread instead. Taking consecutive appshots adds them to the same thread.

You can change the Appshots hotkey in Codex settings.

#### Permissions and safety

Codex may ask for permissions before it can take appshots:

- **Screen & System Audio Recording** lets Codex capture an image of the
  frontmost window.
- **Accessibility** lets Codex read available text from the frontmost window.

Taking an appshot shares the captured image and available text with Codex.
Avoid taking appshots of sensitive content unless the task requires that
content.

Review appshots the same way you would review sharing screenshots and documents
with Codex.

#### Limits and troubleshooting

Appshots are a Codex app feature. Create them from the Codex app on macOS. If
you resume a thread in the CLI that already contains an appshot, the attachment
is part of the thread history, but the CLI can't create a new appshot.

For some apps and websites, including Google Docs, Gmail, Google Sheets, and
Google Slides, Codex may receive only the visible screenshot and may not receive
the full document or off-screen text. If you have the matching plugin installed,
Codex can use that plugin to access the relevant app content and help with your
request.

If appshots don't work:

1. Open **System Settings > Privacy & Security**.
2. Check **Screen & System Audio Recording** and **Accessibility** for Codex
   Computer Use.
3. Restart Codex and try again.

### Codex app

Source: [Codex app](/codex/app.md)

The Codex app is a focused desktop experience for working on Codex threads in parallel, with built-in worktree support, automations, and Git functionality.

ChatGPT Plus, Pro, Business, Edu, and Enterprise plans include Codex. Learn more about [what's included](/codex/pricing).

#### Getting started

The Codex app is available on macOS and Windows.

Most Codex app features are available on both platforms. The relevant docs
describe platform-specific exceptions.

1. Download and install the Codex app

   Download the Codex app for macOS or Windows. Choose the Intel build if you're using an Intel-based Mac.

2. Open Codex and sign in

   Once you downloaded and installed the Codex app, open it and sign in with your ChatGPT account or an OpenAI API key.

   If you sign in with an OpenAI API key, [some functionality might not be available](/codex/pricing#feature-availability).

3. Select a project

   Choose a project folder that you want Codex to work in.

If you used the Codex app, CLI, or IDE Extension before you'll see past projects that you worked on.

4. Send your first message

   After choosing the project, make sure **Local** is selected to have Codex work on your machine and send your first message to Codex.

   You can ask Codex anything about the project or your computer in general. Here are some examples:

---

#### Work with the Codex app

#### Worktrees

Keep parallel code changes isolated with built-in Git worktree support.

### Codex CLI

Source: [Codex CLI](/codex/cli.md)

Codex CLI is OpenAI's coding agent that you can run locally from your terminal. It can read, change, and run code on your machine in the selected directory.
It's [open source](https://github.com/openai/codex) and built in Rust for speed and efficiency.

ChatGPT Plus, Pro, Business, Edu, and Enterprise plans include Codex. Learn more about [what's included](/codex/pricing).

#### CLI setup

The Codex CLI is available on macOS, Windows, and Linux. On Windows, run Codex
natively in PowerShell with the Windows sandbox, or use WSL2 when you need a
Linux-native environment. For setup details, see the
Windows setup guide.

---

#### Work with the Codex CLI

#### Run local code review

Get your code reviewed by a separate Codex agent before you commit or push your changes.

### Codex IDE extension

Source: [Codex IDE extension](/codex/ide.md)

Codex is OpenAI's coding agent that can read, edit, and run code. It helps you build faster, squash bugs, and understand unfamiliar code. With the Codex VS Code extension, you can use Codex side by side in your IDE or delegate tasks to Codex Cloud.

ChatGPT Plus, Pro, Business, Edu, and Enterprise plans include Codex. Learn more about [what's included](/codex/pricing).

#### JetBrains IDE integration

If you want to use Codex in JetBrains IDEs like Rider, IntelliJ, PyCharm, or WebStorm, install the JetBrains IDE integration. It supports signing in with ChatGPT, an API key, or a JetBrains AI subscription.

[Install Codex for JetBrains IDEs](https://blog.jetbrains.com/ai/2026/01/codex-in-jetbrains-ides/)

#### Move Codex to the right sidebar

In VS Code, Codex appears in the right sidebar automatically.
If you prefer it in the primary (left) sidebar, drag the Codex icon back to the left activity bar.

In VS Code forks like Cursor, you may need to move Codex to the right sidebar manually.
To do that, you may need to temporarily change the activity bar orientation first:

1. Open your editor settings and search for `activity bar` (in Workbench settings).
2. Change the orientation to `vertical`.
3. Restart your editor.

Now drag the Codex icon to the right sidebar (for example, next to your Cursor chat). Codex appears as another tab in the sidebar.

After you move it, reset the activity bar orientation to `horizontal` to restore the default behavior.
If you change your mind later, you can drag Codex back to the primary (left) sidebar at any time.

#### Sign in

After you install the extension, it prompts you to sign in with your ChatGPT account or API key. Your ChatGPT plan includes usage credits, so you can use Codex without extra setup. Learn more on the [pricing page](/codex/pricing).

### Codex web

Source: [Codex web](/codex/cloud.md)

#### Codex web setup

Go to [Codex](https://chatgpt.com/codex) and connect your GitHub account. This lets Codex work with the code in your repositories and create pull requests from its work.

Your Plus, Pro, Business, Edu, or Enterprise plan includes Codex. Learn more about [what's included](/codex/pricing). Some Enterprise workspaces may require [admin setup](/codex/enterprise/admin-setup) before you can access Codex.

---

#### Work with Codex web

#### Learn about prompting

Write clearer prompts, add constraints, and choose the right level of detail to get better results.

#### Common workflows

Start with proven patterns for delegating tasks, reviewing changes, and turning results into PRs.

## Customization, Skills, Rules, MCP, and Integrations

<a id="customization-and-tooling"></a>

How to shape Codex behavior with instructions, skills, prompts, MCP, and external integrations.

### Agent Skills

Source: [Agent Skills](/codex/skills.md)

Use agent skills to extend Codex with task-specific capabilities. A skill packages instructions, resources, and optional scripts so Codex can follow a workflow reliably. Skills build on the [open agent skills standard](https://agentskills.io).

Skills are the authoring format for reusable workflows. Plugins are the installable distribution unit for reusable skills and apps in Codex. Use skills to design the workflow itself, then package it as a [plugin](/codex/plugins/build) when you want other developers to install it.

Skills are available in the Codex CLI, IDE extension, and Codex app.

Skills use **progressive disclosure** to manage context efficiently: Codex starts with each skill's name, description, and file path. Codex loads the full `SKILL.md` instructions only when it decides to use a skill.

Codex includes an initial list of available skills in context so it can choose the right skill for a task. To avoid crowding out the rest of the prompt, this list uses at most 2% of the model’s context window, or 8,000 characters when the context window is unknown. If many skills are installed, Codex shortens skill descriptions first. For large skill sets, Codex may omit some skills from the initial list and show a warning.

This budget applies only to the initial skills list. When Codex selects a skill, it still reads the full SKILL.md instructions for that skill.

A skill is a directory with a `SKILL.md` file plus optional scripts and references. The `SKILL.md` file must include `name` and `description`.

#### How Codex uses skills

Codex can activate skills in two ways:

1. **Explicit invocation:** Include the skill directly in your prompt. In CLI/IDE, run `/skills` or type `$` to mention a skill.
2. **Implicit invocation:** Codex can choose a skill when your task matches the skill `description`.

Because implicit matching depends on `description`, write concise descriptions with clear scope and boundaries. Front-load the key use case and trigger words so Codex can still match the skill if descriptions are shortened.

#### Create a skill

If you already know the workflow and it's easier to show than describe, use
[Record & Replay](/codex/record-and-replay). Codex records the workflow,
inspects the steps, and drafts a reusable skill from the demonstration.

If you want to describe the skill instead, use the built-in creator:

```text
$skill-creator
```

The creator asks what the skill does, when it should trigger, and whether it should stay instruction-only or include scripts. Instruction-only is the default.

You can also create a skill manually by creating a folder with a `SKILL.md` file:

```md
---
name: skill-name
description: Explain exactly when this skill should and should not trigger.
---

Skill instructions for Codex to follow.
```

Codex detects skill changes automatically. If an update doesn't appear, restart Codex.

#### Where to save skills

Codex reads skills from repository, user, admin, and system locations. For repositories, Codex scans `.agents/skills` in every directory from your current working directory up to the repository root. If two skills share the same `name`, Codex doesn't merge them; both can appear in skill selectors.

| Skill Scope                                                                    | Location                                                                                                                                                                                             | Suggested use                                                                                                                      |
| :----------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `REPO`                                                                         | `$CWD/.agents/skills`                                                                                                                                                                                |
| Current working directory: where you launch Codex.                             | If you're in a repository or code environment, teams can check in skills relevant to a working folder. For example, skills only relevant to a microservice or a module.                              |
| `REPO`                                                                         | `$CWD/../.agents/skills`                                                                                                                                                                             |
| A folder above CWD when you launch Codex inside a Git repository.              | If you're in a repository with nested folders, organizations can check in skills relevant to a shared area in a parent folder.                                                                       |
| `REPO`                                                                         | `$REPO_ROOT/.agents/skills`                                                                                                                                                                          |
| The topmost root folder when you launch Codex inside a Git repository.         | If you're in a repository with nested folders, organizations can check in skills relevant to everyone using the repository. These serve as root skills available to any subfolder in the repository. |
| `USER`                                                                         | `$HOME/.agents/skills`                                                                                                                                                                               |
| Any skills checked into the user's personal folder.                            | Use to curate skills relevant to a user that apply to any repository the user may work in.                                                                                                           |
| `ADMIN`                                                                        | `/etc/codex/skills`                                                                                                                                                                                  |
| Any skills checked into the machine or container in a shared, system location. | Use for SDK scripts, automation, and for checking in default admin skills available to each user on the machine.                                                                                     |
| `SYSTEM`                                                                       | Bundled with Codex by OpenAI.                                                                                                                                                                        | Useful skills relevant to a broad audience such as the skill-creator and plan skills. Available to everyone when they start Codex. |

Codex supports symlinked skill folders and follows the symlink target when scanning these locations.

These locations are for authoring and local discovery. When you want to
distribute reusable skills beyond a single repo, or optionally bundle them with
app integrations, use [plugins](/codex/plugins/build).

#### Distribute skills with plugins

Direct skill folders are best for local authoring and repo-scoped workflows. If
you want to distribute a reusable skill, bundle two or more skills together, or
ship a skill alongside an app integration, package them as a
[plugin](/codex/plugins/build).

Plugins can include one or more skills. They can also optionally bundle app
mappings, MCP server configuration, and presentation assets in a single
package.

#### Install curated skills for local use

To add curated skills beyond the built-ins for your own local Codex setup, use `$skill-installer`. For example, to install the `$linear` skill:

```bash
$skill-installer linear
```

You can also prompt the installer to download skills from other repositories.
Codex detects newly installed skills automatically; if one doesn't appear,
restart Codex.

Use this for local setup and experimentation. For reusable distribution of your
own skills, prefer plugins.

#### Enable or disable skills

Use `[[skills.config]]` entries in `~/.codex/config.toml` to disable a skill without deleting it:

```toml
[[skills.config]]
path = "/path/to/skill/SKILL.md"
enabled = false
```

Restart Codex after changing `~/.codex/config.toml`.

#### Optional metadata

Add `agents/openai.yaml` to configure UI metadata in the [Codex app](/codex/app), to set invocation policy, and to declare tool dependencies for a more seamless experience with using the skill.

```yaml
interface:
  display_name: "Optional user-facing name"
  short_description: "Optional user-facing description"
  icon_small: "./assets/small-logo.svg"
  icon_large: "./assets/large-logo.png"
  brand_color: "#3B82F6"
  default_prompt: "Optional surrounding prompt to use the skill with"

policy:
  allow_implicit_invocation: false

dependencies:
  tools:
    - type: "mcp"
      value: "openaiDeveloperDocs"
      description: "OpenAI Docs MCP server"
      transport: "streamable_http"
      url: "https://developers.openai.com/mcp"
```

`allow_implicit_invocation` (default: `true`): When `false`, Codex won't implicitly invoke the skill based on user prompt; explicit `$skill` invocation still works.

#### Best practices

- Keep each skill focused on one job.
- Prefer instructions over scripts unless you need deterministic behavior or external tooling.
- Write imperative steps with explicit inputs and outputs.
- Test prompts against the skill description to confirm the right trigger behavior.

For more examples, see [github.com/openai/skills](https://github.com/openai/skills) and [the agent skills specification](https://agentskills.io/specification).

### Codex code review in GitHub

Source: [Codex code review in GitHub](/codex/integrations/github.md)

Use Codex code review to get another high-signal review pass on GitHub pull
requests. Codex reviews the pull request diff, follows your repository guidance,
and posts a standard GitHub code review focused on serious issues.

#### Before you start

Make sure you have:

- [Codex cloud](/codex/cloud) set up for the repository you want to review.
- Access to [Codex code review settings](https://chatgpt.com/codex/settings/code-review).
- An `AGENTS.md` file if you want Codex to follow repository-specific review guidance.

#### Set up Codex code review

1. Set up [Codex cloud](/codex/cloud).
2. Go to [Codex settings](https://chatgpt.com/codex/settings/code-review).
3. Turn on **Code review** for your repository.

#### Request a Codex review

1. In a pull request comment, mention `@codex review`.
2. Wait for Codex to react (👀) and post a review.

Codex posts a review on the pull request, just like a teammate would. In
GitHub, Codex flags only P0 and P1 issues so review comments stay focused on
high-priority risks.

#### Enable automatic reviews

If you want Codex to review every pull request automatically, turn on
**Automatic reviews** in [Codex settings](https://chatgpt.com/codex/settings/code-review).
Codex will post a review whenever someone opens a new PR for review, without
needing an `@codex review` comment.

#### Customize what Codex reviews

Codex searches your repository for `AGENTS.md` files and follows any **Review guidelines** you include.

To set guidelines for a repository, add or update a top-level `AGENTS.md` with a section like this:

```md
## Review guidelines

- Don't log PII.
- Verify that authentication middleware wraps every route.
```

Codex applies guidance from the closest `AGENTS.md` to each changed file. You can place more specific instructions deeper in the tree when particular packages need extra scrutiny.

For a one-off focus, add it to your pull request comment:

`@codex review for security regressions`

If you want Codex to flag typos in documentation, add guidance in `AGENTS.md`
(for example, “Treat typos in docs as P1.”).

#### Act on review findings

After Codex posts a review, you can ask it to fix issues in the same pull
request by leaving another comment:

```md
@codex fix the P1 issue
```

Codex starts a cloud task with the pull request as context and can push a fix
back to the branch when it has permission to do so.

#### Give Codex other tasks

If you mention `@codex` in a comment with anything other than `review`, Codex starts a [cloud task](/codex/cloud) using your pull request as context.

```md
@codex fix the CI failures
```

#### Troubleshoot code review

If Codex doesn't react or post a review:

- Confirm you turned on **Code review** for the repository in [Codex settings](https://chatgpt.com/codex/settings/code-review).
- Confirm the pull request belongs to a repository with [Codex cloud](/codex/cloud) set up.
- Use the exact trigger `@codex review` in a pull request comment.
- For automatic reviews, check that you turned on **Automatic reviews** and that
  the pull request event matches your review trigger settings.

### Custom instructions with AGENTS.md

Source: [Custom instructions with AGENTS.md](/codex/guides/agents-md.md)

Codex reads `AGENTS.md` files before doing any work. By layering global guidance with project-specific overrides, you can start each task with consistent expectations, no matter which repository you open.

#### How Codex discovers guidance

Codex builds an instruction chain when it starts (once per run; in the TUI this usually means once per launched session). Discovery follows this precedence order:

1. **Global scope:** In your Codex home directory (defaults to `~/.codex`, unless you set `CODEX_HOME`), Codex reads `AGENTS.override.md` if it exists. Otherwise, Codex reads `AGENTS.md`. Codex uses only the first non-empty file at this level.
2. **Project scope:** Starting at the project root (typically the Git root), Codex walks down to your current working directory. If Codex cannot find a project root, it only checks the current directory. In each directory along the path, it checks for `AGENTS.override.md`, then `AGENTS.md`, then any fallback names in `project_doc_fallback_filenames`. Codex includes at most one file per directory.
3. **Merge order:** Codex concatenates files from the root down, joining them with blank lines. Files closer to your current directory override earlier guidance because they appear later in the combined prompt.

Codex skips empty files and stops adding files once the combined size reaches the limit defined by `project_doc_max_bytes` (32 KiB by default). For details on these knobs, see [Project instructions discovery](/codex/config-advanced#project-instructions-discovery). Raise the limit or split instructions across nested directories when you hit the cap.

#### Create global guidance

Create persistent defaults in your Codex home directory so every repository inherits your working agreements.

1. Ensure the directory exists:

   ```bash
   mkdir -p ~/.codex
   ```

2. Create `~/.codex/AGENTS.md` with reusable preferences:

   ```md
   # ~/.codex/AGENTS.md

   ## Working agreements

   - Always run `npm test` after modifying JavaScript files.
   - Prefer `pnpm` when installing dependencies.
   - Ask for confirmation before adding new production dependencies.
   ```

3. Run Codex anywhere to confirm it loads the file:

   ```bash
   codex --ask-for-approval never "Summarize the current instructions."
   ```

   Expected: Codex quotes the items from `~/.codex/AGENTS.md` before proposing work.

Use `~/.codex/AGENTS.override.md` when you need a temporary global override without deleting the base file. Remove the override to restore the shared guidance.

#### Layer project instructions

Repository-level files keep Codex aware of project norms while still inheriting your global defaults.

1. In your repository root, add an `AGENTS.md` that covers basic setup:

   ```md
   # AGENTS.md

   ## Repository expectations

   - Run `npm run lint` before opening a pull request.
   - Document public utilities in `docs/` when you change behavior.
   ```

2. Add overrides in nested directories when specific teams need different rules. For example, inside `services/payments/` create `AGENTS.override.md`:

   ```md
   # services/payments/AGENTS.override.md

   ## Payments service rules

   - Use `make test-payments` instead of `npm test`.
   - Never rotate API keys without notifying the security channel.
   ```

3. Start Codex from the payments directory:

   ```bash
   codex --cd services/payments --ask-for-approval never "List the instruction sources you loaded."
   ```

   Expected: Codex reports the global file first, the repository root `AGENTS.md` second, and the payments override last.

Codex stops searching once it reaches your current directory, so place overrides as close to specialized work as possible.

Here is a sample repository after you add a global file and a payments-specific override:

#### Customize fallback filenames

If your repository already uses a different filename (for example `TEAM_GUIDE.md`), add it to the fallback list so Codex treats it like an instructions file.

1. Edit your Codex configuration:

   ```toml
   # ~/.codex/config.toml
   project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
   project_doc_max_bytes = 65536
   ```

2. Restart Codex or run a new command so the updated configuration loads.

Now Codex checks each directory in this order: `AGENTS.override.md`, `AGENTS.md`, `TEAM_GUIDE.md`, `.agents.md`. Filenames not on this list are ignored for instruction discovery. The larger byte limit allows more combined guidance before truncation.

With the fallback list in place, Codex treats the alternate files as instructions:

Set the `CODEX_HOME` environment variable when you want a different profile, such as a project-specific automation user:

```bash
CODEX_HOME=$(pwd)/.codex codex exec "List active instruction sources"
```

Expected: The output lists files relative to the custom `.codex` directory.

#### Verify your setup

- Run `codex --ask-for-approval never "Summarize the current instructions."` from a repository root. Codex should echo guidance from global and project files in precedence order.
- Use `codex --cd subdir --ask-for-approval never "Show which instruction files are active."` to confirm nested overrides replace broader rules.
- To audit which instruction files Codex loaded, opt into a plaintext TUI log with `codex -c log_dir=./.codex-log` and check `./.codex-log/codex-tui.log`, or inspect the most recent `session-*.jsonl` file if you enabled session logging.
- If instructions look stale, restart Codex in the target directory. Codex rebuilds the instruction chain on every run (and at the start of each TUI session), so there is no cache to clear manually.

#### Troubleshoot discovery issues

- **Nothing loads:** Verify you are in the intended repository and that `codex status` reports the workspace root you expect. Ensure instruction files contain content; Codex ignores empty files.
- **Wrong guidance appears:** Look for an `AGENTS.override.md` higher in the directory tree or under your Codex home. Rename or remove the override to fall back to the regular file.
- **Codex ignores fallback names:** Confirm you listed the names in `project_doc_fallback_filenames` without typos, then restart Codex so the updated configuration takes effect.
- **Instructions truncated:** Raise `project_doc_max_bytes` or split large files across nested directories to keep critical guidance intact.
- **Profile confusion:** Run `echo $CODEX_HOME` before launching Codex. A non-default value points Codex at a different home directory than the one you edited.

#### Next steps

- Visit the official [AGENTS.md](https://agents.md) website for more information.
- Review [Prompting Codex](/codex/prompting) for conversational patterns that pair well with persistent guidance.

### Custom Prompts

Source: [Custom Prompts](/codex/custom-prompts.md)

Custom prompts are deprecated. Use [skills](/codex/skills) for reusable
instructions that Codex can invoke explicitly or implicitly.

Custom prompts (deprecated) let you turn Markdown files into reusable prompts that you can invoke as slash commands in both the Codex CLI and the Codex IDE extension.

Custom prompts require explicit invocation and live in your local Codex home directory (for example, `~/.codex`), so they're not shared through your repository. If you want to share a prompt (or want Codex to implicitly invoke it), [use skills](/codex/skills).

1. Create the prompts directory:

   ```bash
   mkdir -p ~/.codex/prompts
   ```

2. Create `~/.codex/prompts/draftpr.md` with reusable guidance:

   ```markdown
   ---
   description: Prep a branch, commit, and open a draft PR
   argument-hint: [FILES=] [PR_TITLE=""]
   ---

   Create a branch named `dev/` for this work.
   If files are specified, stage them first: $FILES.
   Commit the staged changes with a clear message.
   Open a draft PR on the same branch. Use $PR_TITLE when supplied; otherwise write a concise summary yourself.
   ```

3. Restart Codex so it loads the new prompt (restart your CLI session, and reload the IDE extension if you are using it).

Expected: Typing `/prompts:draftpr` in the slash command menu shows your custom command with the description from the front matter and hints that files and a PR title are optional.

#### Add metadata and arguments

Codex reads prompt metadata and resolves placeholders the next time the session starts.

- **Description:** Shown under the command name in the popup. Set it in YAML front matter as `description:`.
- **Argument hint:** Document expected parameters with `argument-hint: KEY=`.
- **Positional placeholders:** `$1` through `$9` expand from space-separated arguments you provide after the command. `$ARGUMENTS` includes them all.
- **Named placeholders:** Use uppercase names like `$FILE` or `$TICKET_ID` and supply values as `KEY=value`. Quote values with spaces (for example, `FOCUS="loading state"`).
- **Literal dollar signs:** Write `$$` to emit a single `$` in the expanded prompt.

After editing prompt files, restart Codex or open a new chat so the updates load. Codex ignores non-Markdown files in the prompts directory.

#### Invoke and manage custom commands

1. In Codex (CLI or IDE extension), type `/` to open the slash command menu.
2. Enter `prompts:` or the prompt name, for example `/prompts:draftpr`.
3. Supply required arguments:

   ```text
   /prompts:draftpr FILES="src/pages/index.astro src/lib/api.ts" PR_TITLE="Add hero animation"
   ```

4. Press Enter to send the expanded instructions (skip either argument when you don't need it).

Expected: Codex expands the content of `draftpr.md`, replacing placeholders with the arguments you supplied, then sends the result as a message.

Manage prompts by editing or deleting files under `~/.codex/prompts/`. Codex scans only the top-level Markdown files in that folder, so place each custom prompt directly under `~/.codex/prompts/` rather than in subdirectories.

### Customization

Source: [Customization](/codex/concepts/customization.md)

Customization is how you make Codex work the way your team works.

In Codex, customization comes from a few layers that work together:

- **Project guidance (`AGENTS.md`)** for persistent instructions
- **[Memories](/codex/memories)** for useful context learned from prior work
- **Skills** for reusable workflows and domain expertise
- **[MCP](/codex/mcp)** for access to external tools and shared systems
- **[Subagents](/codex/concepts/subagents)** for delegating work to specialized subagents

These are complementary, not competing. `AGENTS.md` shapes behavior, memories
carry local context forward, skills package repeatable processes, and
[MCP](/codex/mcp) connects Codex to systems outside the local workspace.

#### AGENTS Guidance

`AGENTS.md` gives Codex durable project guidance that travels with your repository and applies before the agent starts work. Keep it small.

Use it for the rules you want Codex to follow every time in a repo, such as:

- Build and test commands
- Review expectations
- repo-specific conventions
- Directory-specific instructions

When the agent makes incorrect assumptions about your codebase, correct them in `AGENTS.md` and ask the agent to update `AGENTS.md` so the fix persists. Treat it as a feedback loop.

**Updating `AGENTS.md`:** Start with only the instructions that matter. Codify recurring review feedback, put guidance in the closest directory where it applies, and tell the agent to update `AGENTS.md` when you correct something so future sessions inherit the fix.

#### When to update `AGENTS.md`

- **Repeated mistakes**: If the agent makes the same mistake repeatedly, add a rule.
- **Too much reading**: If it finds the right files but reads too many documents, add routing guidance (which directories/files to prioritize).
- **Recurring PR feedback**: If you leave the same feedback more than once, codify it.
- **In GitHub**: In a pull request comment, tag `@codex` with a request (for example, `@codex add this to AGENTS.md`) to delegate the update to a cloud task.
- **Automate drift checks**: Use [automations](/codex/app/automations) to run recurring checks (for example, daily) that look for guidance gaps and suggest what to add to `AGENTS.md`.

Pair `AGENTS.md` with infrastructure that enforces those rules: pre-commit hooks, linters, and type checkers catch issues before you see them, so the system gets smarter about preventing recurring mistakes.

Codex can load guidance from multiple locations: a global file in your Codex home directory (for you as a developer) and repo-specific files that teams can check in. Files closer to the working directory take precedence.
Use the global file to shape how Codex communicates with you (for example, review style, verbosity, and defaults), and keep repo files focused on team and codebase rules.

[Custom instructions with AGENTS.md](/codex/guides/agents-md)

#### Skills

Skills give Codex reusable capabilities for repeatable workflows.
Skills are often the best fit for reusable workflows because they support richer instructions, scripts, and references while staying reusable across tasks.
Skills are loaded and visible to the agent (at least their metadata), so Codex can discover and choose them implicitly. This keeps rich workflows available without bloating context up front.

Use skill folders to author and iterate on workflows locally. If a plugin
already exists for the workflow, install it first to reuse a proven setup. When
you want to distribute your own workflow across teams or bundle it with app
integrations, package it as a [plugin](/codex/plugins/build). Skills remain the
authoring format; plugins are the installable distribution unit.

A skill is typically a `SKILL.md` file plus optional scripts, references, and assets.

The skill directory can include a `scripts/` folder with CLI scripts that Codex invokes as part of the workflow (for example, seed data or run validations). When the workflow needs external systems (issue trackers, design tools, docs servers), pair the skill with [MCP](/codex/mcp).

Example `SKILL.md`:

```md
---
name: commit
description: Stage and commit changes in semantic groups. Use when the user wants to commit, organize commits, or clean up a branch before pushing.
---

1. Do not run `git add .`. Stage files in logical groups by purpose.
2. Group into separate commits: feat → test → docs → refactor → chore.
3. Write concise commit messages that match the change scope.
4. Keep each commit focused and reviewable.
```

Use skills for:

- Repeatable workflows (release steps, review routines, docs updates)
- Team-specific expertise
- Procedures that need examples, references, or helper scripts

Skills can be global (in your user directory, for you as a developer) or repo-specific (checked into `.agents/skills`, for your team). Put repo skills in `.agents/skills` when the workflow applies to that project; use your user directory for skills you want across all repos.

| Layer  | Global                 | Repo                                           |
| :----- | :--------------------- | :--------------------------------------------- |
| AGENTS | `~/.codex/AGENTS.md`   | `AGENTS.md` in repo root or nested directories |
| Skills | `$HOME/.agents/skills` | `.agents/skills` in repo                       |

Codex uses progressive disclosure for skills:

- It starts with metadata (`name`, `description`) for discovery
- It loads `SKILL.md` only when a skill is chosen
- It reads references or runs scripts only when needed

Skills can be invoked explicitly, and Codex can also choose them implicitly when the task matches the skill description. Clear skill descriptions improve triggering reliability.

[Agent Skills](/codex/skills)

#### MCP

MCP (Model Context Protocol) is the standard way to connect Codex to external tools and context providers.
It's especially useful for remotely hosted systems such as Figma, Linear, GitHub, or internal knowledge services your team depends on.

Use MCP when Codex needs capabilities that live outside the local repo, such as issue trackers, design tools, browsers, or shared documentation systems.

One way to think about it:

- **Host**: Codex
- **Client**: the MCP connection inside Codex
- **Server**: the external tool or context provider

MCP servers can expose:

- **Tools** (actions)
- **Resources** (readable data)
- **Prompts** (reusable prompt templates)

This separation helps you reason about trust and capability boundaries. Some servers mainly provide context, while others expose powerful actions.

In practice, MCP is often most useful when paired with skills:

- A skill defines the workflow and names the MCP tools to use

[Model Context Protocol](/codex/mcp)

#### Subagents

You can create different agents with different roles and prompt them to use tools differently. For example, one agent might run specific testing commands and configurations, while another has MCP servers that fetch production logs for debugging. Each subagent stays focused and uses the right tools for its job.

[Subagent concepts](/codex/concepts/subagents)

#### Skills + MCP together

Skills plus MCP is where it all comes together: skills define repeatable workflows, and MCP connects them to external tools and systems.
If a skill depends on MCP, declare that dependency in `agents/openai.yaml` so Codex can install and wire it automatically (see [Agent Skills](/codex/skills)).

#### Next step

Build in this order:

1. [Custom instructions with AGENTS.md](/codex/guides/agents-md) so Codex follows your repo conventions. Add pre-commit hooks and linters to enforce those rules.
2. Install a [plugin](/codex/plugins) when a reusable workflow already exists. Otherwise, create a [skill](/codex/skills) and package it as a plugin when you want to share it.
3. [MCP](/codex/mcp) when workflows need external systems (Linear, GitHub, docs servers, design tools).
4. [Subagents](/codex/subagents) when you're ready to delegate noisy or specialized tasks to subagents.
