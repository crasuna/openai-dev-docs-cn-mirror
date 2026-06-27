### Chronicle

Source: [Chronicle](/codex/memories/chronicle.md)

Chronicle is in an **opt-in research preview**. It is only available for
ChatGPT Pro subscribers on macOS. Please review the [Privacy and
Security](#privacy-and-security) section for details and to understand the
current risks before enabling.

Chronicle augments Codex memories with context from your screen. When you prompt
Codex, those memories can help it understand what you’ve been working on with
less need for you to restate context.

Chronicle is available as an opt-in research preview in the Codex app on macOS.
It requires macOS Screen Recording and Accessibility permissions. Before
enabling, be aware that Chronicle uses rate limits quickly, increases risk of
prompt injection, and stores memories unencrypted on your device.

#### How Chronicle helps

We’ve designed Chronicle to reduce the amount of context you have to restate
when you work with Codex. By using recent screen context to improve memory
building, Chronicle can help Codex understand what you’re referring to, identify
the right source to use, and pick up on the tools and workflows you rely on.

#### Use what’s on screen

With Chronicle Codex can understand what you are currently looking at, saving
you time and context switching.

#### Fill in missing context

No need to carefully craft your context and start from zero. Chronicle lets
Codex fill in the gaps in your context.

#### Remember tools and workflows

No need to explain to Codex which tools to use to perform your work. Codex
learns as you work to save you time in the long run.

In these cases, Codex uses Chronicle to provide additional context. When another
source is better for the job, such as reading the specific file, Slack thread,
Google Doc, dashboard, or pull request, Codex uses Chronicle to identify the
source and then use that source directly.

#### Enable Chronicle

1. Open Settings in the Codex app.
2. Go to **Personalization** and make sure **Memories** is enabled.
3. Turn on **Chronicle** below the Memories setting.
4. Review the consent dialog and choose **Continue**.
5. Grant macOS Screen Recording and Accessibility permissions when prompted.
6. When setup completes, choose **Try it out** or start a new thread.

If macOS reports that Screen Recording or Accessibility permission is denied,
open System Settings &gt; Privacy & Security &gt; Screen Recording or
Accessibility and enable Codex. If a permission is restricted by macOS or your
organization, Chronicle will start after the restriction is removed and Codex
receives the required permission.

#### Pause or disable Chronicle at any time

You control when Chronicle generates memories using screen context. Use the
Codex menu bar icon to choose **Pause Chronicle** or **Resume Chronicle**. Pause
Chronicle before meetings or when viewing sensitive content that you do not want
Codex to use as context. To disable Chronicle, return to **Settings &gt;
Personalization &gt; Memories** and turn off **Chronicle**.

You can also control whether memories are used in a given thread. [Learn
more](/codex/memories#control-memories-per-thread).

#### Rate limits

Chronicle works by running sandboxed agents in the background to generate
memories from captured screen images. These agents currently consume rate limits
quickly.

#### Privacy and security

Chronicle uses screen captures, which can include sensitive information visible
on your screen. It does not have access to your microphone or system audio.
Don’t use Chronicle to record meetings or communications with others without
their consent. Pause Chronicle when viewing content you do not want remembered
in memories.

#### Where does Chronicle store my data?

Screen captures are ephemeral and will only be saved temporarily on your
computer. Temporary screen capture files may appear under
`$TMPDIR/chronicle/screen_recording/` while Chronicle is running. Screen captures
that are older than 6 hours will be deleted while Chronicle is running.

The memories that Chronicle generates are just like other Codex memories:
unencrypted markdown files that you can read and modify if needed. You can also
ask Codex to search them. If you want to have Codex forget something you can
delete the respective file inside the folder or selectively edit the markdown
files to remove the information you’d like to remove. You should not manually
add new information. The generated Chronicle memories are stored locally on your
computer under `$CODEX_HOME/memories_extensions/chronicle/` (typically
`~/.codex/memories_extensions/chronicle`).

#### What data gets shared with OpenAI?

Chronicle captures screen context locally, then periodically uses Codex to
summarize recent activity into memories. To generate those memories, Chronicle
starts an ephemeral Codex session with access to this screen context. That
session may process selected screenshot frames, OCR text extracted from
screenshots, timing information, and local file paths for the relevant time
window.

Screen captures used for memory generation are stored temporarily on your device. They are processed on our
servers to generate memories, which are then stored locally on device. We do not
store the screenshots on our servers after processing unless required by law,
and do not use them for training.

The generated memories are Markdown files stored locally under
`$CODEX_HOME/memories_extensions/chronicle/`. When Codex uses memories in a
future session, relevant memory contents may be included as context for that
session, and may be used to improve our models if allowed in your ChatGPT
settings. [Learn more](https://help.openai.com/en/articles/7730893-data-controls-faq).

#### Prompt injection risk

Using Chronicle increases risk to prompt injection attacks from screen content.
For instance, if you browse a site with malicious agent instructions, Codex may
follow those instructions.

### Codex Security

Source: [Codex Security](/codex/security/index.md)

[Install plugin in Codex App](https://chatgpt.com/plugins/share/676aca3811d54fa7bcdef5255236b3c4)

For a prescriptive first local scan, start with the [Codex Security plugin
quickstart](/codex/security/plugin).

#### Explore plugin use cases

- [Run a security scan](/codex/security/plugin/scans) for a repository or one scoped folder.
- [Run a deep security scan](/codex/security/plugin/deep-scans) when you need a more comprehensive scan and can wait longer for it to finish.
- [Review code changes](/codex/security/plugin/code-changes) before you merge a pull request or branch.
- [Triage a backlog](/codex/security/plugin/triage-backlog) when you have existing security findings to review.
- [Fix and verify findings](/codex/security/plugin/fix-findings) with bounded patches for approved findings.
- [Export or track findings](/codex/security/plugin/export-findings) as portable artifacts or approval-gated tracking destinations.
- [See what's new](/codex/security/plugin/changelog) in the Codex Security plugin.

The plugin runs in your Codex thread. Codex Security cloud scans connected
GitHub repositories through Codex Web. For Codex sandboxing, approvals,
network controls, and admin settings, see [Agent approvals &
security](/codex/agent-approvals-security).

#### Codex Security cloud

Codex Security cloud is currently in research preview. It scans connected
GitHub repositories for likely security issues.

It helps teams:

1. **Find likely vulnerabilities** by using a repo-specific threat model and real code context.
2. **Reduce noise** by validating findings before you review them.
3. **Move findings toward fixes** with ranked results, evidence, and suggested patch options.

#### How Codex Security cloud works

Codex Security scans connected repositories commit by commit.
It builds scan context from your repo, checks likely vulnerabilities against that context, and validates high-signal issues in an isolated environment before surfacing them.

You get a workflow focused on:

- repo-specific context instead of generic signatures
- validation evidence that helps reduce false positives
- suggested fixes you can review in GitHub

#### Codex Security cloud access and prerequisites

Codex Security is available for ChatGPT Enterprise, Edu, Business, and Pro users. It works with connected GitHub repositories through Codex Web. If you need access or a repository isn't visible, confirm the repository is available through your Codex Web workspace or contact your OpenAI account team.

#### Security overview references

- [Codex Security plugin quickstart](/codex/security/plugin) walks through installation and a first local scan.
- [Codex Security cloud setup](/codex/security/setup) details setup, scanning, and findings review.
- [Improving the threat model](/codex/security/threat-model) explains how to tune scope, attack surface, and criticality assumptions.
- [FAQ](/codex/security/faq) covers common product questions.

### Glossary

Source: [Glossary](/codex/glossary.md)

Use this glossary as a quick reference for Codex terms across the app, CLI, IDE extension, cloud, SDK, and related integrations.

### Hooks

Source: [Hooks](/codex/hooks.md)

Hooks are an extensibility framework for Codex. They allow
you to inject your own scripts into the agentic loop, enabling features such as:

- Send the conversation to a custom logging/analytics engine
- Scan your team's prompts to block accidentally pasting API keys
- Summarize conversations to create persistent memories automatically
- Run a custom validation check when a conversation turn stops, enforcing standards
- Customize prompting when in a certain directory

Hooks are enabled by default. If you need to turn them off in `config.toml`,
set:

```toml
[features]
hooks = false
```

Use `hooks` as the canonical feature key. `codex_hooks` still works as a
deprecated alias.

Admins can force hooks off the same way in `requirements.toml` with
`[features].hooks = false`.

Runtime behavior to keep in mind:

- Matching hooks from multiple files all run.
- Multiple matching command hooks for the same event are launched concurrently,
  so one hook cannot prevent another matching hook from starting.
- Non-managed command hooks must be reviewed and trusted before they run.
- `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PreCompact`,
  `PostCompact`, `UserPromptSubmit`, `SubagentStop`, and `Stop` run at turn
  scope. `SessionStart` and `SubagentStart` run at thread or subagent-start
  scope.

#### Where Codex looks for hooks

Codex discovers hooks next to active config layers in either of these forms:

- `hooks.json`
- inline `[hooks]` tables inside `config.toml`

Installed plugins can also bundle lifecycle config through their plugin
manifest or a default `hooks/hooks.json` file. See [Build
plugins](/codex/plugins/build#bundled-mcp-servers-and-lifecycle-hooks) for the
plugin packaging rules.

In practice, the four most useful locations are:

- `~/.codex/hooks.json`
- `~/.codex/config.toml`
- `/.codex/hooks.json`
- `/.codex/config.toml`

If more than one hook source exists, Codex loads all matching hooks.
Higher-precedence config layers don't replace lower-precedence hooks.
If a single layer contains both `hooks.json` and inline `[hooks]`, Codex
merges them and warns at startup. Prefer one representation per layer.

Codex can also discover hooks bundled with enabled plugins. Plugin-bundled
hooks load alongside other hook sources and use the same trust-review flow as
other non-managed hooks.

Project-local hooks load only when the project `.codex/` layer is trusted. In
untrusted projects, Codex still loads user and system hooks from their own
active config layers.

#### Review and trust hooks

Codex lists configured hooks before deciding which ones can run. Before a
non-managed command hook can run, Codex requires you to review and trust the
exact hook definition. Codex records trust against the hook's current hash, so
new or changed hooks are marked for review and skipped until trusted.

Use `/hooks` in the CLI to inspect hook sources, review new or changed hooks,
trust hooks, or disable individual non-managed hooks. If hooks need review at
startup, Codex prints a warning that tells you to open `/hooks`.

Managed hooks from system, MDM, cloud, or `requirements.toml` sources are marked
as managed, trusted by policy, and can't be disabled from the user hook browser.

For one-off automation that already vets hook sources outside Codex, pass
`--dangerously-bypass-hook-trust` to run enabled hooks without requiring
persisted hook trust for that invocation.

#### Config shape

Hooks are organized in three levels:

- A hook event such as `PreToolUse`, `PostToolUse`, `PreCompact`,
  `SubagentStart`, or `Stop`
- A matcher group that decides when that event matches
- One or more hook handlers that run when the matcher group matches

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.codex/hooks/session_start.py",
            "statusMessage": "Loading session notes"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py\"",
            "statusMessage": "Checking Bash command"
          }
        ]
      }
    ],
    "PermissionRequest": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/permission_request.py\"",
            "statusMessage": "Checking approval request"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/post_tool_use_review.py\"",
            "statusMessage": "Reviewing Bash output"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/user_prompt_submit_data_flywheel.py\""
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/stop_continue.py\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

Notes:

- `timeout` is in seconds.
- If `timeout` is omitted, Codex uses `600` seconds.
- `statusMessage` is optional.
- `commandWindows` is an optional Windows-only command override. In TOML, use
  `command_windows` or `commandWindows`.
- `async` is parsed, but async command hooks aren't supported yet. Codex skips
  handlers with `async: true`.
- Only `type: "command"` handlers run today. `prompt` and `agent` handlers are
  parsed but skipped.
- Commands run with the session `cwd` as their working directory.
- For repo-local hooks, prefer resolving from the git root instead of using a
  relative path such as `.codex/hooks/...`. Codex may be started from a
  subdirectory, and a git-root-based path keeps the hook location stable.

Equivalent inline TOML in `config.toml`:

```toml
[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py"'
timeout = 30
statusMessage = "Checking Bash command"

[[hooks.PostToolUse]]
matcher = "^Bash$"

[[hooks.PostToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/post_tool_use_review.py"'
timeout = 30
statusMessage = "Reviewing Bash output"
```

#### Matcher patterns

The `matcher` field is a regex string that filters when hooks fire. Use `"*"`,
`""`, or omit `matcher` entirely to match every occurrence of a supported
event.

Only some current Codex events honor `matcher`:

| Event               | What `matcher` filters | Notes                                                        |
| ------------------- | ---------------------- | ------------------------------------------------------------ |
| `PermissionRequest` | tool name              | Support includes `Bash`, `apply_patch`\*, and MCP tool names |
| `PostToolUse`       | tool name              | Support includes `Bash`, `apply_patch`\*, and MCP tool names |
| `PostCompact`       | compaction trigger     | Values are `manual` or `auto`                                |
| `PreCompact`        | compaction trigger     | Values are `manual` or `auto`                                |
| `PreToolUse`        | tool name              | Support includes `Bash`, `apply_patch`\*, and MCP tool names |
| `SessionStart`      | start source           | Values are `startup`, `resume`, `clear`, and `compact`       |
| `SubagentStart`     | subagent type          | Values depend on the subagent that starts                    |
| `SubagentStop`      | subagent type          | Values depend on the subagent that stops                     |
| `UserPromptSubmit`  | not supported          | Any configured `matcher` is ignored for this event           |
| `Stop`              | not supported          | Any configured `matcher` is ignored for this event           |

\*For `apply_patch`, `matcher` values can also use `Edit` or `Write`.

Examples:

- `Bash`
- `^apply_patch$`
- `Edit|Write`
- `mcp__filesystem__read_file`
- `mcp__filesystem__.*`
- `startup|resume|clear|compact`
- `manual|auto`

### Import to Codex

Source: [Import to Codex](/codex/import.md)

Use the import flow to bring your instructions, settings, skills, plugins,
projects, and recent chat sessions from other agents into Codex. Codex imports
the supported items directly and lets you finish setup for any imported plugins
or connections that need authorization.

Importing does not change or delete your existing agent setup.

#### Start an import

1. In the Codex app, open **Settings**.
2. Under **General**, find **Import other agent setup**.
3. Select **Import**.
4. Choose the agents you want to import from, then select **Continue**.
5. On **Select items to import**, select **Continue** to import everything or **Customize** to choose specific items.
6. If you customize the import, select the items to bring over, then select **Confirm**.
7. After the import finishes, open an imported project or thread to continue working.

#### How importing works

Codex checks both your user-level setup and your existing projects. User-level
setup comes from files on your machine. Project-level setup comes from files in
the repositories and folders you select.

When you import, Codex:

1. Detects supported setup and recent work.
2. Imports the items you select.
3. Leaves your existing agent setup unchanged.
4. Checks whether imported plugins or connections still need setup.
5. Shows a status card when follow-up is required.

#### What Codex can import

| Imported item                       | Codex destination                      |
| ----------------------------------- | -------------------------------------- |
| Instruction files                   | [`AGENTS.md`](/codex/guides/agents-md) |
| `settings.json`                     | [`config.toml`](/codex/config-basic)   |
| Skills                              | [Codex skills](/codex/skills)          |
| Plugins                             | Codex plugins                          |
| Existing project folders            | Codex projects using the same folders  |
| Chat sessions from the last 30 days | Codex threads                          |
| MCP server configuration            | [Codex MCP configuration](/codex/mcp)  |
| Hooks                               | [Codex hooks](/codex/hooks)            |
| Slash commands                      | [Codex skills](/codex/skills)          |
| Subagents                           | [Codex agents](/codex/subagents)       |

#### Finish setup after importing

When the import completes, Codex shows a status card in the lower-left corner.
If an imported plugin or connection still needs setup, the card calls it out.

When Codex flags an item that needs attention, select **Finish** and follow the
prompts to complete setup.

#### What to review after importing

Review imported setup before you rely on it, especially:

- Tool restrictions or permissions in imported skills and agents.
- MCP server settings that use custom authentication, headers, environment
  variables, or transports. You may need to sign in again.
- Hooks whose behavior may differ in Codex.
- Plugins, marketplaces, or other setup that needs manual follow-up.
- Prompt templates or command-style prompts that depend on arguments, shell
  interpolation, or file-path placeholders.

#### After you import

Once the import finishes, open one of your imported projects and continue from
there. If you are new to Codex, see the [quickstart](/codex/quickstart) for the
rest of the setup flow.

### Memories

Source: [Memories](/codex/memories.md)

Memories are off by default. In the European Economic Area, the United
Kingdom, and Switzerland, Codex uses or generates memories only after you
enable them in Codex settings, or set `memories = true` in the `[features]`
table in `~/.codex/config.toml`.

Memories let Codex carry useful context from earlier threads into future work.
After you enable memories, Codex can remember stable preferences, recurring
workflows, tech stacks, project conventions, and known pitfalls so you don't
need to repeat the same context in every thread.

Keep required team guidance in `AGENTS.md` or checked-in documentation. Treat
memories as a helpful local recall layer, not as the only source for rules that
must always apply.

[Chronicle](/codex/memories/chronicle) helps Codex recover recent working
context from your screen to build up memory.

#### Enable memories

In the Codex app, enable Memories in settings.

For config-based setup, add the feature flag to `config.toml`:

```toml
[features]
memories = true
```

See [Config basics](/codex/config-basic) for where Codex stores user-level
configuration and how Codex loads `~/.codex/config.toml`.

#### How memories work

After you enable memories, Codex can turn useful context from eligible prior
threads into local memory files. Codex skips active or short-lived sessions,
redacts secrets from generated memory fields, and updates memories in the
background instead of immediately at the end of every thread.

Memories may not update right away when a thread ends. Codex waits until a
thread has been idle long enough to avoid summarizing work that's still in
progress.

Memory generation can also skip a background pass when your Codex rate-limit
remaining percentage is below the configured threshold, so Codex doesn't spend
quota when you're near a limit.

#### Memory storage

Codex stores memories under your Codex home directory. By default, that's
`~/.codex`. See [Config and state locations](/codex/config-advanced#config-and-state-locations)
for how Codex uses `CODEX_HOME`.

The main memory files live under `~/.codex/memories/` and include summaries,
durable entries, recent inputs, and supporting evidence from prior threads.

Treat these files as generated state. You can inspect them when troubleshooting
or before sharing your Codex home directory, but don't rely on editing them by
hand as your primary control surface.

#### Control memories per thread

In the Codex app and Codex TUI, use `/memories` to control memory behavior for
the current thread. Thread-level choices let you decide whether the current
thread can use existing memories and whether Codex can use the thread to
generate future memories.

Thread-level choices don't change your global memory settings.

#### Configuration

Enable memories in the Codex app settings, or set `memories = true` in the
`[features]` section of `config.toml`.

For config file locations and the full list of memory-related settings, see the
[configuration reference](/codex/config-reference).

Common memory-specific settings include:

- `memories.generate_memories`: controls whether newly created threads can be
  stored as memory-generation inputs.
- `memories.use_memories`: controls whether Codex injects existing memories into
  future sessions.
- `memories.disable_on_external_context`: when `true`, keeps threads that used
  external context such as MCP tool calls, web search, or tool search out of
  memory generation. The older `memories.no_memories_if_mcp_or_web_search` key
  is still accepted as an alias.
- `memories.min_rate_limit_remaining_percent`: controls the minimum remaining
  Codex rate-limit percentage required before memory generation starts.
- `memories.extract_model`: overrides the model used for per-thread memory
  extraction.
- `memories.consolidation_model`: overrides the model used for global memory
  consolidation.

#### Review memories

Don't store secrets in memories. Codex redacts secrets from generated memory
fields, but you should still review memory files before sharing your Codex home
directory or generated memory artifacts.

### Open Source

Source: [Open Source](/codex/open-source.md)

OpenAI develops key parts of Codex in the open. That work lives on GitHub so you can follow progress, report issues, and contribute improvements.

If you maintain a widely used open-source project or want to nominate maintainers stewarding important projects, you can also [apply to the Codex for OSS program](/community/codex-for-oss) for API credits, ChatGPT Pro with Codex, and selective access to Codex Security.

#### Open-source components

| Component                   | Where to find                                                                                     | Notes                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Codex CLI                   | [openai/codex](https://github.com/openai/codex)                                                   | The primary home for Codex open-source development |
| Codex SDK                   | [openai/codex/sdk](https://github.com/openai/codex/tree/main/sdk)                                 | SDK sources live in the Codex repo                 |
| Codex App Server            | [openai/codex/codex-rs/app-server](https://github.com/openai/codex/tree/main/codex-rs/app-server) | App-server sources live in the Codex repo          |
| Skills                      | [openai/skills](https://github.com/openai/skills)                                                 | Reusable skills that extend Codex                  |
| IDE extension               | -                                                                                                 | Not open source                                    |
| Codex web                   | -                                                                                                 | Not open source                                    |
| Universal cloud environment | [openai/codex-universal](https://github.com/openai/codex-universal)                               | Base environment used by Codex cloud               |

#### Where to report issues and request features

Use the Codex GitHub repository for bug reports and feature requests across Codex components:

- Bug reports and feature requests: [openai/codex/issues](https://github.com/openai/codex/issues)
- Discussion forum: [openai/codex/discussions](https://github.com/openai/codex/discussions)

When you file an issue, include which component you are using (CLI, SDK, IDE extension, Codex web) and the version where possible.

### Permissions

Source: [Permissions](/codex/permissions.md)

#### Filesystem permissions

Filesystem entries use `read`, `write`, or `deny`:

| Access  | Meaning                                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `read`  | Allows commands to read files and list directories under the path. Commands cannot create, modify, rename, or delete files there. |
| `write` | Allows commands to read and modify files under the path, including creating, renaming, and deleting files when the OS allows it.  |
| `deny`  | Denies both reads and writes under the path. Use it to carve out a denied subpath from a broader `read` or `write` grant.         |

More specific entries override broader entries. When two entries target the
same path, `deny` takes precedence over `write`, and `write` takes precedence
over `read`.

This precedence lets a profile describe a broad working area first, then carve
out files or directories that should stay unreadable:

```toml
[permissions.project-edit.filesystem]
":minimal" = "read"

[permissions.project-edit.filesystem.":workspace_roots"]
"." = "write"
".devcontainer" = "read"
"**/*.env" = "deny"
```

In this example, the workspace root stays writable, `.devcontainer/` stays
readable without becoming writable, and matching environment files remain
unavailable to sandboxed commands.

A more specific path can also reopen a narrower subtree inside a broader deny:

```toml
[permissions.project-edit.filesystem]
"~/Documents" = "deny"
"~/Documents/codex" = "write"
```

Supported path forms:

| Path               | Meaning                                                                                     | Scoped subpaths |
| ------------------ | ------------------------------------------------------------------------------------------- | --------------- |
| `:root`            | The filesystem root                                                                         | `.` only        |
| `:minimal`         | Platform and runtime paths needed by common tools                                           | `.` only        |
| `:workspace_roots` | The current session's workspace roots plus any enabled profile-defined workspace roots      | Yes             |
| `:tmpdir`          | The `$TMPDIR` location, when one is available                                               | `.` only        |
| `:slash_tmp`       | The `/tmp` folder, if it exists                                                             | `.` only        |
| `/absolute/path`   | A platform absolute path, such as `/path` on macOS/Linux/WSL or `C:\path` on native Windows | Yes             |
| `~/path`           | A path under the current user's home directory                                              | Yes             |

On native Windows, home-relative paths can also use backslashes, such as
`~\work`.

Use `:root` only when a profile intentionally needs broad read coverage:

```toml
[permissions.audit.filesystem]
":root" = "read"
```

Use nested entries under `:workspace_roots` to scope access to workspace-root
relative subpaths:

```toml
[permissions.project-edit.filesystem.":workspace_roots"]
"." = "write"          # each workspace root
"docs" = "read"        # each workspace-root docs directory
"generated" = "deny"   # each workspace-root generated directory
```

Nested subpaths must stay inside their workspace root. Parent traversal such as
`../other-repo` is rejected.

#### Deny reads with exact paths or globs

Use `deny` for files or subtrees that Codex should not read, even when a broader
profile rule grants access nearby. Exact paths work well for stable locations
such as `~/.ssh`. Glob patterns work better when a profile needs to cover a
family of sensitive files whose exact locations vary across repositories.

When a glob sits under `:workspace_roots`, Codex interprets it relative to each
effective workspace root. For example:

```toml
[permissions.project-edit.filesystem.":workspace_roots"]
"**/*.env" = "deny"
```

This rule denies reads for matching `.env` files found beneath each runtime or
profile-defined workspace root. Use it when you want to preserve normal
workspace writes while keeping environment files, generated secrets, or similar
credential-bearing files unreadable.

`deny` glob patterns are supported as deny-read rules. `read` or `write` globs
are less portable on Linux, WSL, and native Windows sandboxing, so prefer exact
paths or subtree rules such as `"docs/**" = "read"` when possible.

On Linux, WSL, and native Windows, an unbounded `**` deny-read pattern may need
bounded pre-expansion before the sandbox starts. Set `glob_scan_max_depth` when
you use an unbounded pattern such as `"**/*.env" = "deny"`:

```toml
[permissions.project-edit.filesystem]
glob_scan_max_depth = 3

[permissions.project-edit.filesystem.":workspace_roots"]
"**/*.env" = "deny"
```

`glob_scan_max_depth` must be at least `1`. Higher values scan deeper before
sandbox startup, which can add startup work on Linux, WSL, and native Windows.
If you prefer not to use bounded expansion, enumerate explicit depths such as
`*.env`, `*/*.env`, and `*/*/*.env`.

Add reusable workspace roots to the profile when the same rules should apply to
more than the current session root:

```toml
[permissions.project-edit.workspace_roots]
"~/code/app" = true
"~/code/shared-lib" = true
```

When this profile is active, Codex applies the `:workspace_roots` rules to the
current session's runtime workspace roots and to each enabled profile-defined
workspace root.

On native Windows, drive-letter paths such as `D:\work` and UNC paths such as
`\\server\share` are supported as absolute paths.

#### Network permissions

Set `enabled = true` to allow network access for the selected profile:

```toml
[permissions.project-edit.network]
enabled = true
```

When network access is enabled, Codex uses full network behavior by default.
Most profiles should also define domain rules:

```toml
[permissions.project-edit.network.domains]
"example.com" = "allow"      # exact host
"*.example.com" = "allow"    # subdomains only
"**.example.com" = "allow"   # apex and subdomains
"ads.example.com" = "deny"   # deny wins over allow
```

The network sandbox proxy binds to local listeners by default:

```toml
[permissions.project-edit.network]
enabled = true
proxy_url = "http://127.0.0.1:3128"
enable_socks5 = true
socks_url = "http://127.0.0.1:8081"
enable_socks5_udp = true
```

Leave these listener settings at their defaults unless you are integrating with
a specific runtime. The `dangerously_*` network keys are escape hatches for
specialized environments and should not be used for ordinary local development.

#### Local and private networks

Codex applies a local/private-network guard by default as a defense against DNS
rebinding and accidental access to local services. To intentionally allow a
literal local target, allowlist the exact host or IP literal:

```toml
[permissions.project-edit.network.domains]
"localhost" = "allow"
"127.0.0.1" = "allow"
```

Set `allow_local_binding = true` only when the profile must reach allowlisted
hostnames that resolve to local or private addresses:

```toml
[permissions.project-edit.network]
enabled = true
allow_local_binding = true

[permissions.project-edit.network.domains]
"localhost" = "allow"
```

#### Unix sockets

Unix socket proxying is a local escape hatch for tools such as Docker. Use it
sparingly:

```toml
[permissions.project-edit.network.unix_sockets]
"/var/run/docker.sock" = "allow"
"/tmp/old.sock" = "deny"
```

Use `deny` to reject a socket path, including an inherited allow entry. Denied
socket paths are omitted from the effective allowlist.

When Unix sockets are enabled, keep proxy listeners bound to loopback addresses.

#### Migrate from older sandbox settings

Permission profiles replace the older combination of `sandbox_mode` and
`sandbox_workspace_write` when you want one reusable profile to describe both
filesystem and network behavior. Use one system or the other for a session, not
both.

Suggested starting points:

- For a read-only workflow, use the built-in `:read-only` profile or define a
  custom profile with read access only where needed.
- For workspace editing, use the built-in `:workspace` profile or define a
  custom profile that writes through `:workspace_roots` and adds only the extra
  temp or cache paths the workflow needs.
- For unrestricted local execution, use `:danger-full-access` only when you
  intentionally want the broadest local access model.

Profiles describe the local default posture for a session. Organization-managed
requirements can still add restrictions that user configuration should not
broaden. See [Managed configuration](/codex/enterprise/managed-configuration)
for admin-enforced filesystem and network constraints.

### Plugins

Source: [Plugins](/codex/plugins.md)

#### Overview

Plugins bundle skills, app integrations, and MCP servers into reusable
workflows for Codex.

Extend what Codex can do, for example:

- Install the Codex Security plugin to scan authorized code and confirm
  plausible vulnerability findings.
- Install the Gmail plugin to let Codex read and manage Gmail.
- Install the Google Drive plugin to work across Drive, Docs, Sheets, and
  Slides.
- Install the Slack plugin to summarize channels or draft replies.
- Install [Sites](/codex/sites) to create and deploy hosted websites,
  web apps, and games.

A plugin can contain:

- **Skills:** reusable instructions for specific kinds of work. Codex can load
  them when needed so it follows the right steps and uses the right references
  or helper scripts for a task.
- **Apps:** connections to tools like GitHub, Slack, or Google Drive, so
  Codex can read information from those tools and take actions in them.
- **MCP servers:** services that give Codex access to more tools or shared
  information, often from systems outside your local project.

You can share plugins by publishing them through a marketplace source, such as a
repo marketplace for a project or team. See [Build plugins](/codex/plugins/build)
for marketplace setup, packaging, and distribution guidance.

#### Use and install plugins

#### Plugin Directory in the Codex app

Open **Plugins** in the Codex app to browse and install curated plugins.

The plugin directory groups plugins into categories:

- **Curated by OpenAI:** highlighted plugins available to all Codex users.
- **Shared with you:** plugins shared by other members of your ChatGPT
  workspace.
- **Created by you:** plugins you created or added to your own workspace.

#### Plugin directory in the CLI

In Codex CLI, run the following command to open the plugins list:

```text
codex
/plugins
```

The CLI plugin browser groups plugins by marketplace. Use the marketplace tabs
to switch sources, open a plugin to inspect details, install or uninstall
marketplace entries, and press Space on an installed plugin to toggle
its enabled state.

#### Install and use a plugin

Once you open the plugin directory:

1. Search or browse for a plugin, then open its details.
2. Select the install button. In the app, select the plus button or
   **Add to Codex**. In the CLI, select `Install plugin`.
3. If the plugin needs an external app, connect it when prompted. Some plugins
   ask you to authenticate during install. Others wait until the first time you
   use them.
4. After installation, start a new thread and ask Codex to use the plugin.

After you install a plugin, you can use it directly in the prompt window:

    Describe the task directly

      Ask for the outcome you want, such as "Summarize unread Gmail threads
      from today" or "Pull the latest launch notes from Google Drive."

      Use this when you want Codex to choose the right installed tools for the
      task.

    Choose a specific plugin

      Type @ to invoke the plugin or one of its bundled skills
      explicitly.

      Use this when you want to be specific about which plugin or skill Codex
      should use. See Codex app commands and
      Skills.

#### How permissions and data sharing work

Installing a plugin makes its workflows available in Codex, but your existing
[approval settings](/codex/agent-approvals-security) still apply. Any
connected external services remain subject to their own authentication,
privacy, and data-sharing policies.

- Bundled skills are available as soon as you install the plugin.
- If a plugin includes apps, Codex may prompt you to install or sign in to
  those apps in ChatGPT during setup or the first time you use them.
- If a plugin includes MCP servers, they may require extra setup or
  authentication before you can use them.
- When Codex sends data through a bundled app, that app's terms and privacy
  policy apply.

#### Remove or turn off a plugin

To remove a plugin, reopen it from the plugin browser and select
**Uninstall plugin**.

Uninstalling a plugin removes the plugin bundle from Codex, but bundled apps
stay installed until you manage them in ChatGPT.

If you want to keep a plugin installed but turn it off, set its entry in
`~/.codex/config.toml` to `enabled = false`, then restart Codex:

```toml
[plugins."gmail@openai-curated"]
enabled = false
```

#### Build your own plugin

If you want to create, test, or distribute your own plugin, see
[Build plugins](/codex/plugins/build). That page covers local scaffolding,
manual marketplace setup, workspace sharing, plugin manifests, and packaging
guidance.

#### Plugin guides

- [Record & Replay](/codex/record-and-replay): Show Codex a workflow
  once and turn it into a reusable skill.
- [Codex Security plugin quickstart](/codex/security/plugin): Install the
  plugin, scan authorized code, and review the result.

### Record & Replay

Source: [Record & Replay](/codex/record-and-replay.md)

Record & Replay is available on macOS. Initial availability excludes the
European Economic Area, the United Kingdom, and Switzerland. Computer Use must
also be available and enabled.

Record & Replay lets you demonstrate a workflow on your
Mac and turn it into a reusable skill. Use it when the workflow is repetitive,
depends on your preferences, or is easier to show than to describe in a prompt.

For example, you might record how you file an expense, book a parking space,
create a correctly configured issue, publish a video, or download a recurring
report. Codex can package the pattern into a skill that you can use again with
Computer Use, browser actions, connected plugins, or a combination of them.

#### Before you start

Pick a workflow that you already know how to complete. Record & Replay works
best when the steps are stable and the success criteria are clear.

#### Start a recording

1. Open **Plugins** in the Codex app.
2. Open the **+** menu.
3. Select **Record a skill**.
4. Review the suggested prompt, give Codex any helpful context, and submit it.
5. When Codex asks for permission to record your actions, approve the request
   once you are ready to demonstrate the workflow.
6. Perform the workflow on your Mac.
7. When you are done, stop recording from the menu bar, overlay, or tell Codex
   that you are done.

During recording, Codex observes the actions and window content needed to learn
the workflow. Recording continues until you stop it. Keep the recording focused
on the task you want Codex to learn.

After you stop recording, Codex inspects the captured workflow and drafts a
skill. The skill explains when to use the workflow, what inputs it needs, what
steps to follow, and how to verify the result. You can also ask Codex to
refine the skill further.

#### Replay the workflow

Start a new thread and ask Codex to use the generated skill. Give it the
values that are different this time, such as the file to upload, the issue to
create, or the date range for the report.

Codex uses the skill as reusable context for the task. It can then complete the
workflow with the tools available in the current environment, including
Computer Use, browser actions, and installed plugins.

#### Tips for better recordings

- Keep the demonstration short and complete.
- Let Codex know your goal and any specific inputs that might vary between
  skill uses before you start recording.
- Use realistic inputs, but avoid secrets and sensitive data.
- Refine the skill after recording to call out hidden preferences that matter,
  such as naming conventions, field defaults, or decision points.
- Stop recording when the workflow is complete instead of continuing into
  unrelated cleanup.

#### When to build another plugin

Record & Replay is a fast way to create a skill from a demonstrated workflow.
If you want to distribute a separate stable package across a team, bundle
multiple skills, include app integrations, add MCP servers, or manage install
metadata, package that workflow as its own plugin. See
[Build plugins](/codex/plugins/build).

#### I don't see Record & Replay

If your organization manages Codex with `requirements.toml`, the
`[features].computer_use` requirement controls Record & Replay too. Setting
`computer_use = false` makes both features unavailable.

### Remote connections

Source: [Remote connections](/codex/remote-connections.md)

import {
Desktop,
Storage,
Terminal,
} from "@components/react/oai/platform/ui/Icon.react";

Remote connections let you use Codex from another device or another machine.
Use Codex in the ChatGPT mobile app to work with Codex on a connected Mac or
Windows device, continue work from another supported Codex App device, or connect
the Codex App to projects on an SSH host.

Remote access uses the connected host's projects, threads, files, credentials,
permissions, plugins, Computer Use, browser setup, and local tools.

#### What you can do remotely

- Start new threads in projects on the host, or continue existing ones.
- Send follow-up instructions, answer questions, and steer active work.
- Approve commands and other actions.
- Review outputs, diffs, test results, terminal output, and screenshots.
- Get notified when Codex completes a task or needs your attention.
- Switch between connected hosts and threads.

The next sections cover using Codex in the ChatGPT mobile app to control a Codex
App host. To connect Codex to a project on an SSH host, see
[connect to an SSH host](#connect-to-an-ssh-host).

#### Before you set up mobile access

Codex mobile setup supports Codex App hosts on macOS and Windows. You can
control a Windows host from ChatGPT on iOS or Android, or from a Mac running
Codex. Windows can't currently control another computer from the Codex App.

Make sure you have:

- Codex access in the ChatGPT account and workspace you want to use.
- The latest ChatGPT mobile app on an iOS or Android device. If you don't see
  Codex in the ChatGPT mobile app, update ChatGPT first.
- The latest Codex App for macOS or Windows running on a host that's awake,
  online, and signed in to the same account and workspace. Mobile setup starts
  from the Codex App; you can't set it up from the Codex CLI or IDE Extension.
- Any required multi-factor authentication, SSO, or passkey configuration for
  that account or workspace.

If you use Codex through a ChatGPT workspace, your admin may need to enable
Remote Control access before you can connect from your phone.

#### Set up mobile access

Start in the Codex App on the host you want to connect. The setup flow enables
remote access for that host, then shows a QR code you can scan from your phone.
The QR code pairs that phone with that host. Pair every phone or supported Codex
App device with every host you want it to control.

Existing connections used since June 8, 2026, remain paired. If you haven't
used an existing connection since June 8, 2026, update both apps and pair the
devices again.

1. Start Codex mobile setup.

   Open Codex on the host and select **Set up Codex mobile** in the
   sidebar.

2. Scan the QR code.

   Use your phone to scan the QR code shown by Codex. The code opens ChatGPT so
   you can finish connecting the mobile app to the host.

3. Finish setup in ChatGPT.

   ChatGPT opens the Codex mobile setup flow. Confirm the same ChatGPT account
   and workspace, then complete any required multi-factor authentication, SSO,
   or passkey steps. After setup succeeds, the host appears in Codex on your
   phone.

4. Review host settings.

   In Codex on the host, use **Settings > Connections** to manage connected
   devices. You can also choose whether to keep the computer awake, enable
   Computer Use, or install the Chrome extension.

#### Choose what to connect

Start with the laptop or desktop where you already use Codex. Add an always-on
computer or SSH host when you need continuous access or a different environment.

#### Your laptop or desktop

Connect the Mac or Windows PC where you already run Codex day to day. This gives
remote access to the same projects, threads, credentials, plugins, and local
setup you already use.

If that computer sleeps, loses network access, or closes Codex, remote access
stops until it's available again. If you use this computer as your host device,
keep it plugged in and use the host's connection settings to keep it awake where
available.

On a Mac laptop, remote access can stay available with the lid open and power
connected. With the lid closed, connect an external display as well. Choosing
**Sleep** still stops remote access.

On a Windows host, keep the session unlocked and available for tasks that use
[Computer Use](/codex/app/computer-use). Computer use on Windows runs in the
foreground, so remote control is best for starting or checking work while you
dedicate the host desktop to the task.

#### A dedicated always-on computer

Use a dedicated always-on Mac or Windows PC when you want Codex to stay
reachable for longer-running work.

Install the projects, credentials, plugins, MCP servers, and tools Codex should
use on that machine.

#### A remote development environment

Use an SSH host or managed remote development environment when the project
already lives in a remote environment. Connect the Codex App host to that
environment first; your phone still connects to the Codex App host, and Codex
works in the remote environment with its dependencies, security policies, and
compute resources.

For SSH setup details, see [connect to an SSH host](#connect-to-an-ssh-host).

For browser or desktop tasks on an always-on computer or remote host, enable
Computer Use and install the Chrome extension on that host.

#### What comes from the connected host

Your phone sends prompts, approvals, and follow-up messages to Codex. The
connected host provides the environment Codex uses.

That means:

- Repository files and local documents come from the connected host.
- Shell commands run on that host or remote environment.
- Any plugin installed on that host is available when you use Codex remotely.
- MCP servers, skills, browser access, and Computer Use come from that host's
  configuration.
- Signed-in websites and desktop apps are available only when the host can
  access them.
- The sandboxing settings, security controls, and action approvals still apply
  to the connected session.

Codex uses a secure relay layer to keep trusted machines reachable across your
authorized ChatGPT devices without exposing them directly to the public
internet.

#### Pick up work from another device

You can continue work from another signed-in Codex App device that supports
remote control. For example, if your laptop is unavailable, you can start
a thread from your phone on an always-on host, then later open Codex on your
laptop and continue that same thread there.

In Codex on a Mac, use **Settings > Connections > Control other devices** to add
the other host. A device can allow remote access and control another device at
the same time. You can control Windows hosts from a Mac or from ChatGPT on iOS
or Android, but you can't use Windows to control another computer. For example,
you can control a Windows device from your Mac or phone, but you can't use a
Windows device to control another Windows device.

#### Connect to an SSH host

In the Codex App, add remote projects from an SSH host and run threads against
the remote filesystem and shell. Remote project threads run commands, read
files, and write changes on the remote host.

Keep the remote host configured with the same security expectations you use for
normal SSH access: trusted keys, least-privilege accounts, and no
unauthenticated public listeners.

1. Add the host to your SSH config so Codex can auto-discover it.

   ```text
   Host devbox
     HostName devbox.example.com
     User you
     IdentityFile ~/.ssh/id_ed25519
   ```

   Codex reads concrete host aliases from `~/.ssh/config`, resolves them with
   OpenSSH, and ignores pattern-only hosts.

2. Confirm you can SSH to the host from the machine running the Codex App.

   ```bash
   ssh devbox
   ```

3. Install and authenticate Codex on the remote host.

   The app starts the remote Codex app server through SSH, using the remote
   user's login shell. Make sure the `codex` command is available on the
   remote host's `PATH` in that shell.

4. In the Codex App, open **Settings > Connections**, add or enable the SSH
   host, then choose a remote project folder.

### Sites

Source: [Sites](/codex/sites.md)

Sites lets Codex create, save, deploy, and inspect websites, web apps, and
games hosted by OpenAI. Use the **Sites** plugin when you want to turn a prompt
or a compatible existing project into a hosted site without setting up a
separate deployment workflow.

Every Sites deployment URL is a production deployment. If you want to review a
build before it becomes live, ask Codex to save a version without deploying
it.

#### Understand projects, versions, and deployments

A Sites project links a local source project to hosting managed through Sites.
Codex stores that linkage and optional storage binding names in
`.openai/hosting.json`. A newly created local starter can begin without a
`project_id`; Sites adds one after it provisions the hosted project.

For example, a provisioned site that uses a relational database binding and no
file storage can contain:

```json
{
  "project_id": "",
  "d1": "DB",
  "r2": null
}
```

Sites publishing has two separate stages:

1. **Save a version.** Codex builds the deployable site and associates that
   version with the source Git commit used for the build. Use this stage when
   you want a reviewable deployment candidate.
2. **Deploy a version.** Codex publishes a saved version and reports the
   production URL when deployment succeeds. Use this only when you intend for
   the selected audience to access the site.

Ask Codex to list or inspect saved versions when you need to identify a
previous deployment candidate.

#### Choose a supported site shape

Sites hosts projects that build Cloudflare Worker-compatible output as ES
modules. For new projects, the Sites workflow can start with its recommended
site starter. For an existing site, ask Codex to confirm that the project's
build can produce compatible deployment artifacts before you request a
deployment.

Tell Codex about the product behavior you need so it can select the appropriate
site shape:

| Site need                                                      | What to ask Sites for                                                         |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Content-led website or landing page                            | A site with no persistent application state unless the experience requires it |
| Saved records, user progress, or game scores                   | D1, a relational database for durable structured data                         |
| Images, documents, audio, video, or other uploads              | R2, object storage for files                                                  |
| Uploaded files with searchable metadata                        | D1 for metadata and R2 for file contents                                      |
| Internal site that needs the current workspace user's identity | Workspace-authenticated user identity                                         |
| Public sign-in or an external identity provider                | An authentication-enabled Sites project                                       |

Don't request durable storage for temporary presentation state, such as a
theme choice or a dismissed banner. Do request it for product data that people
expect the hosted site to remember.

#### Control access and secrets

Set the audience before you share a deployed URL. For a new site, keep access
limited to the owner and workspace admins until you have reviewed the content,
data handling, and expected audience.

You can ask Sites to apply one of these access modes:

| Access mode                      | Who can access the site                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| Owner and admins (`admins_only`) | The site owner and workspace admins                                                           |
| Workspace (`workspace_all`)      | All active users in the workspace                                                             |
| Custom (`custom`)                | Specific active users or workspace groups that you choose; Sites continues to allow the owner |

For example:

```text
@Sites Change this deployed site's access to everyone in my workspace after
showing me the current site and confirming the deployment URL.
```

#### Configure runtime environment values

Open **Sites** in the app sidebar and select a project to add, update, or remove
hosted environment variables and secrets in the Sites panel. Don't store these
values in `.openai/hosting.json`. Keep local `.env` and `.env.example` files
aligned with the keys needed for local development, and don't commit secret
values.

When you add, update, or remove hosted environment values, ask Codex to
redeploy the approved saved version so the next deployment uses the updated
configuration.

#### Review before you share

Before you deploy or widen access:

- Review the source changes and any database migrations in the Codex
  [review pane](/codex/app/review).
- Confirm that the build succeeded and that the selected saved version is the
  version you intend to publish.
- Check that only the intended audience can access the site.
- Confirm that you configured runtime secret values through Sites and didn't
  commit them in source files.
- After deployment, ask Codex to confirm deployment status and the production
  URL before you share it.

#### Related documentation

- [Plugins](/codex/plugins) explains how to install and invoke Codex plugins.
- [Codex app](/codex/app) introduces app navigation and project threads.
- [Review and ship changes](/codex/app/review) explains how to inspect source
  changes before publishing them.

### Subagents

Source: [Subagents](/codex/subagents.md)

Codex can run subagent workflows by spawning specialized agents in parallel and then collecting their results in one response. This can be particularly helpful for complex tasks that are highly parallel, such as codebase exploration or implementing a multi-step feature plan.

With subagent workflows, you can also define your own custom agents with different model configurations and instructions depending on the task.

For the concepts and tradeoffs behind subagent workflows, including context pollution, context rot, and model-selection guidance, see [Subagent concepts](/codex/concepts/subagents).

#### Availability

Current Codex releases enable subagent workflows by default.

Subagent activity is currently surfaced in the Codex app and CLI. Visibility
in the IDE Extension is coming soon.

Codex only spawns subagents when you explicitly ask it to. Because each
subagent does its own model and tool work, subagent workflows consume more
tokens than comparable single-agent runs.

#### Typical workflow

Codex handles orchestration across agents, including spawning new subagents,
routing follow-up instructions, waiting for results, and closing agent
threads.

When many agents are running, Codex waits until all requested results are
available, then returns a consolidated response.

Codex only spawns a new agent when you explicitly ask it to do so.

To see it in action, try the following prompt on your project:

```text
I would like to review the following points on the current PR (this branch vs main). Spawn one agent per point, wait for all of them, and summarize the result for each point.
1. Security issue
2. Code quality
3. Bugs
4. Race
5. Test flakiness
6. Maintainability of the code
```

#### Managing subagents

- Use `/agent` in the CLI to switch between active agent threads and inspect the ongoing thread.
- Ask Codex directly to steer a running subagent, stop it, or close completed agent threads.

#### Approvals and sandbox controls

Subagents inherit your current sandbox policy.

In interactive CLI sessions, approval requests can surface from inactive agent
threads even while you are looking at the main thread. The approval overlay
shows the source thread label, and you can press `o` to open that thread before
you approve, reject, or answer the request.

In non-interactive flows, or whenever a run can't surface a fresh approval, an
action that needs new approval fails and Codex surfaces the error back to the
parent workflow.

Codex also reapplies the parent turn's live runtime overrides when it spawns a
child. That includes sandbox and approval choices you set interactively during
the session, such as `/permissions` changes or `--yolo`, even if the selected
custom agent file sets different defaults.

You can also override the sandbox configuration for individual [custom agents](#custom-agents), such as explicitly marking one to work in read-only mode.

#### Custom agents

Codex ships with built-in agents:

- `default`: general-purpose fallback agent.
- `worker`: execution-focused agent for implementation and fixes.
- `explorer`: read-heavy codebase exploration agent.

To define your own custom agents, add standalone TOML files under
`~/.codex/agents/` for personal agents or `.codex/agents/` for project-scoped
agents.

Each file defines one custom agent. Codex loads these files as configuration
layers for spawned sessions, so custom agents can override the same settings as
a normal Codex session config. That can feel heavier than a dedicated agent
manifest, and the format may evolve as authoring and sharing mature.

Every standalone custom agent file must define:

- `name`
- `description`
- `developer_instructions`

Optional fields such as `nickname_candidates`, `model`,
`model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, and `skills.config`
inherit from the parent session when you omit them.

#### Global settings

Global subagent settings still live under `[agents]` in your [configuration](/codex/config-basic#configuration-precedence).

| Field                            | Type   | Required | Purpose                                                    |
| -------------------------------- | ------ | :------: | ---------------------------------------------------------- |
| `agents.max_threads`             | number |    No    | Concurrent open agent thread cap.                          |
| `agents.max_depth`               | number |    No    | Spawned agent nesting depth (root session starts at 0).    |
| `agents.job_max_runtime_seconds` | number |    No    | Default timeout per worker for `spawn_agents_on_csv` jobs. |

**Notes:**

- `agents.max_threads` defaults to `6` when you leave it unset.
- `agents.max_depth` defaults to `1`, which allows a direct child agent to spawn but prevents deeper nesting. Keep the default unless you specifically need recursive delegation. Raising this value can turn broad delegation instructions into repeated fan-out, which increases token usage, latency, and local resource consumption. `agents.max_threads` still caps concurrent open threads, but it doesn't remove the cost and predictability risks of deeper recursion.
- `agents.job_max_runtime_seconds` is optional. When you leave it unset, `spawn_agents_on_csv` falls back to its per-call default timeout of 1800 seconds per worker.
- If a custom agent name matches a built-in agent such as `explorer`, your custom agent takes precedence.

#### Custom agent file schema

| Field                    | Type     | Required | Purpose                                                         |
| ------------------------ | -------- | :------: | --------------------------------------------------------------- |
| `name`                   | string   |   Yes    | Agent name Codex uses when spawning or referring to this agent. |
| `description`            | string   |   Yes    | Human-facing guidance for when Codex should use this agent.     |
| `developer_instructions` | string   |   Yes    | Core instructions that define the agent's behavior.             |
| `nickname_candidates`    | string[] |    No    | Optional pool of display nicknames for spawned agents.          |

You can also include other supported `config.toml` keys in a custom agent file, such as `model`, `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, and `skills.config`.

Codex identifies the custom agent by its `name` field. Matching the filename to
the agent name is the simplest convention, but the `name` field is the source
of truth.

#### Display nicknames

Use `nickname_candidates` when you want Codex to assign more readable display
names to spawned agents. This is especially helpful when you run many
instances of the same custom agent and want the UI to show distinct labels
instead of repeating the same agent name.

Nicknames are presentation-only. Codex still identifies and spawns the agent by
its `name`.

Nickname candidates must be a non-empty list of unique names. Each nickname can
use ASCII letters, digits, spaces, hyphens, and underscores.

Example:

```toml
name = "reviewer"
description = "PR reviewer focused on correctness, security, and missing tests."
developer_instructions = """
Review code like an owner.
Prioritize correctness, security, behavior regressions, and missing test coverage.
"""
nickname_candidates = ["Atlas", "Delta", "Echo"]
```

In practice, the Codex app and CLI can show the nicknames where agent activity
appears, while the underlying agent type stays
`reviewer`.

#### Example custom agents

The best custom agents are narrow and opinionated. Give each one clear job, a
tool surface that matches that job, and instructions that keep it from
drifting into adjacent work.

### Use Codex with Amazon Bedrock

Source: [Use Codex with Amazon Bedrock](/codex/amazon-bedrock.md)

Configure Codex to use OpenAI models available through Amazon Bedrock. In this
setup, Codex runs locally and sends model requests to Bedrock using
AWS-managed authentication and access controls.

#### How it works

When you configure Codex with Amazon Bedrock as the model provider, the
OpenAI-hosted Responses API isn't in the request path. Codex sends model
requests to Amazon Bedrock, and Bedrock provides an OpenAI-compatible Responses
API implementation for supported OpenAI models.

Authentication is AWS-native. Users authenticate with a Bedrock API key or AWS
IAM credentials. They do not use ChatGPT sign-in or `OPENAI_API_KEY` for this
provider.

#### Before you start

Make sure you have:

- Access to supported OpenAI models in Amazon Bedrock.
- An AWS Region where the selected model is available.
- Authentication for the Amazon Bedrock Mantle path configured for the AWS
  account.

#### Configure Codex

Add the `amazon-bedrock` model provider for the Amazon Bedrock Mantle path to
`~/.codex/config.toml`. Supplying a model is optional. Select a supported model
explicitly when needed.

```toml
model_provider = "amazon-bedrock"
```

This guide covers the Amazon Bedrock Mantle path in supported commercial AWS
Regions. Codex doesn't support Bedrock Mantle endpoints in AWS GovCloud
Regions.

#### Authentication options

Codex supports two Bedrock authentication paths. It checks them in this order:

1. Bedrock API key.
2. AWS SDK credential chain.

#### Option 1: Bedrock API key

Set the Bedrock API key in the environment Codex reads. You must specify a
Region when using API-key authentication.

```shell
export AWS_BEARER_TOKEN_BEDROCK=
export AWS_REGION=us-east-2
```

#### Option 2: AWS SDK credentials

Use this path when your organization manages Bedrock access through the AWS SDK
credential chain. Codex can use these standard AWS SDK credential sources:

1. Shared AWS `config` and `credentials` files.

   ```shell
   aws configure
   ```

2. Environment variables.

   ```shell
   export AWS_ACCESS_KEY_ID=
   export AWS_SECRET_ACCESS_KEY=
   export AWS_SESSION_TOKEN=
   ```

3. AWS Management Console credentials.

   ```shell
   aws login
   ```

4. AWS SSO or a named profile.

   ```shell
   aws sso login --profile codex-bedrock
   export AWS_PROFILE=codex-bedrock
   ```

5. Federated identity configured with `credential_process`. For corporate SSO or
   OIDC federation, configure the AWS profile outside Codex and let the AWS SDK
   resolve credentials. Put browser login, token exchange, caching, and refresh
   in your AWS profile's `credential_process` helper.

#### Desktop app and VS Code extension

Desktop apps and IDE extensions may not inherit environment variables from the
shell. Put required values in `~/.codex/.env`, then restart the app or
extension.

```shell
export AWS_BEARER_TOKEN_BEDROCK=
export AWS_REGION=us-east-2
```

#### Verify setup

- In Codex CLI, open `/status` and confirm Codex is using the
  `amazon-bedrock` model provider.
- In the desktop app or VS Code extension, start a new session after restarting
  the app.
- Confirm the selected model is available in the configured AWS Region and that
  the AWS identity has permission to access it.

#### Supported models

Use exact model IDs:

```text
openai.gpt-5.5
openai.gpt-5.4
```

Model availability varies by AWS Region. Before selecting a model, see [model
support by AWS
Region](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html).

#### Feature availability

This configuration supports local Codex workflows. Some features that depend on
OpenAI-hosted cloud services, hosted tools, or cloud-managed discovery aren't
currently available.

Fast Mode isn't available with Amazon Bedrock. Fast Mode uses priority
processing, and the initial Amazon Bedrock offering supports on-demand
inference only.

#### Detailed feature availability

- Feature is currently limited to only specific regions. Check
  the individual feature documentation to learn more about geo restrictions.

  † Local plugin bundles are supported when their capabilities do
  not require ChatGPT authentication. OpenAI-curated plugin discovery and
  features that depend on app connectors or cloud-hosted sharing aren't
  available.

### Windows platform

Source: [Windows](/codex/windows.md)

Use Codex on Windows with the native [Codex app](/codex/app/windows), the
[CLI](/codex/cli), or the [IDE extension](/codex/ide).

The Codex app on Windows supports core workflows such as parallel agent threads,
worktrees, automations, Git functionality, the in-app browser, artifact previews,
plugins, and skills.

Depending on the surface and your setup, Codex can run on Windows in three
practical ways:

- natively on Windows with the stronger `elevated` sandbox,
- natively on Windows with the fallback `unelevated` sandbox,
- or inside [Windows Subsystem for Linux 2](https://learn.microsoft.com/en-us/windows/wsl/install) (WSL2), which uses the Linux sandbox implementation.

#### Windows sandbox

When you run Codex natively on Windows, agent mode uses a Windows sandbox to
block filesystem writes outside the working folder and prevent network access
without your explicit approval.

Native Windows sandbox support includes two modes that you can configure in
`config.toml`:

```toml
[windows]
sandbox = "elevated" # or "unelevated"
```

`elevated` is the preferred native Windows sandbox. It uses dedicated
lower-privilege sandbox users, filesystem permission boundaries, firewall
rules, and local policy changes needed for commands that run in the sandbox.

`unelevated` is the fallback native Windows sandbox. It runs commands with a
restricted Windows token derived from your current user, applies ACL-based
filesystem boundaries, and uses environment-level offline controls instead of
the dedicated offline-user firewall rule. It's weaker than `elevated`, but it
is still useful when administrator-approved setup is blocked by local or
enterprise policy.

If both modes are available, use `elevated`. If the default native sandbox
doesn't work in your environment, use `unelevated` as a fallback while you
troubleshoot the setup.

Enterprise administrators can constrain which native sandbox implementations
Codex can use through [`requirements.toml`](/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml):

```toml
[windows]
allowed_sandbox_implementations = ["elevated"]
```

This example requires the `elevated` sandbox and prevents users from falling
back to `unelevated`. To permit either implementation, include both values;
Codex prefers `elevated` when no mode is selected. See the
[`requirements.toml` reference](/codex/config-reference#requirementstoml) for
the supported values.

By default, both sandbox modes also use a private desktop for stronger UI
isolation. Set `windows.sandbox_private_desktop = false` only if you need the
older `Winsta0\\Default` behavior for compatibility.

#### Sandbox permissions

Running Codex in full access mode means Codex is not limited to your project
directory and might perform unintentional destructive actions that can lead to
data loss. For safer automation, keep sandbox boundaries in place and use
[rules](/codex/rules) for specific exceptions, or set your [approval policy to
never](/codex/agent-approvals-security#run-without-approval-prompts) to have
Codex attempt to solve problems without asking for escalated permissions,
based on your [approval and security setup](/codex/agent-approvals-security).

#### Windows version matrix

| Windows version                  | Support level   | Notes                                                                                                                                                                                 |
| -------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows 11                       | Recommended     | Best baseline for Codex on Windows. Use this if you are standardizing an enterprise deployment.                                                                                       |
| Recent, fully updated Windows 10 | Best effort     | Can work, but is less reliable than Windows 11. For Windows 10, Codex depends on modern console support, including ConPTY. In practice, Windows 10 version 1809 or newer is required. |
| Older Windows 10 builds          | Not recommended | More likely to miss required console components such as ConPTY and more likely to fail in enterprise setups.                                                                          |

Additional environment assumptions:

- `winget` should be available. If it's missing, update Windows or install
  the Windows Package Manager before setting up Codex.
- The recommended native sandbox depends on administrator-approved setup.
- Some enterprise-managed devices block the required setup steps even when the
  OS version itself is acceptable.

#### Grant sandbox read access

When a command fails because the Windows sandbox can't read a directory, use:

```text
/sandbox-add-read-dir C:\absolute\directory\path
```

The path must be an existing absolute directory. After the command succeeds, later commands that run in the sandbox can read that directory during the current session.

Use the native Windows sandbox by default. The native Windows sandbox offers the best performance and highest speeds while keeping the same security. Choose WSL2 when you
need a Linux-native environment on Windows, when your workflow already lives in
WSL2, or when neither native Windows sandbox mode meets your needs.

#### Windows Subsystem for Linux

If you choose WSL2, Codex runs inside the Linux environment instead of using the
native Windows sandbox. This is useful if you need Linux-native tooling on
Windows, if your repositories and developer workflow already live in WSL2, or
if neither native Windows sandbox mode works for your environment.

WSL1 was supported through Codex `0.114`. Starting in Codex `0.115`, the Linux
sandbox moved to `bubblewrap`, so WSL1 is no longer supported.

#### Launch VS Code from inside WSL

For step-by-step instructions, see the [official VS Code WSL tutorial](https://code.visualstudio.com/docs/remote/wsl-tutorial).

#### Prerequisites

- Windows with WSL installed. To install WSL, open PowerShell as an administrator, then run `wsl --install` (Ubuntu is a common choice).
- VS Code with the [WSL extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) installed.

#### Open VS Code from a WSL terminal

```bash
# From your WSL shell
cd ~/code/your-project
code .
```

This opens a WSL remote window, installs the VS Code Server if needed, and ensures integrated terminals run in Linux.

#### Confirm you're connected to WSL

- Look for the green status bar that shows `WSL: `.
- Integrated terminals should display Linux paths (such as `/home/...`) instead of `C:\`.
- You can verify with:

  ```bash
  echo $WSL_DISTRO_NAME
  ```

  This prints your distribution name.

If you don't see "WSL: ..." in the status bar, press `Ctrl+Shift+P`, pick
`WSL: Reopen Folder in WSL`, and keep your repository under `/home/...` (not
`C:\`) for best performance.

If the Windows app or project picker does not show your WSL repository, type
\\wsl$ into the file picker or Explorer, then navigate to your
distro's home directory.

#### Use Codex CLI with WSL

Run these commands from an elevated PowerShell or Windows Terminal:

```powershell
# Install default Linux distribution (like Ubuntu)
wsl --install

# Start a shell inside Windows Subsystem for Linux
wsl
```

Then run these commands from your WSL shell:

```bash
# Install and run Codex in WSL
curl -fsSL https://chatgpt.com/codex/install.sh | sh
codex
```

#### Working on code inside WSL

- Working in Windows-mounted paths like /mnt/c/... can be slower than working in Windows-native paths. Keep your repositories under your Linux home directory (like ~/code/my-app) for faster I/O and fewer symlink and permission issues:
  ```bash
  mkdir -p ~/code && cd ~/code
  git clone https://github.com/your/repo.git
  cd repo
  ```
- If you need Windows access to files, they're under \\wsl$\Ubuntu\home\&lt;user&gt; in Explorer.
