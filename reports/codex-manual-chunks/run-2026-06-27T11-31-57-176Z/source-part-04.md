### Model Context Protocol

Source: [Model Context Protocol](/codex/mcp.md)

Model Context Protocol (MCP) connects models to tools and context. Use it to give Codex access to third-party documentation, or to let it interact with developer tools like your browser or Figma.

Codex supports MCP servers in both the CLI and the IDE extension.

#### Supported MCP features

- **STDIO servers**: Servers that run as a local process (started by a command).
  - Environment variables
- **Streamable HTTP servers**: Servers that you access at an address.
  - Bearer token authentication
  - OAuth authentication (run `codex mcp login ` for servers that support OAuth)
- **Server instructions**: Codex reads the MCP `instructions` field returned during initialization and uses it as server-wide guidance alongside the server's tools.

If you build or maintain an MCP server for Codex, use `instructions` for cross-tool workflows, constraints, and rate limits that apply across the server. Keep the first 512 characters self-contained so the most important guidance is available when Codex is deciding how to use the server.

#### Connect Codex to an MCP server

Codex stores MCP configuration in `config.toml` alongside other Codex configuration settings. By default this is `~/.codex/config.toml`, but you can also scope MCP servers to a project with `.codex/config.toml` (trusted projects only).

The CLI and the IDE extension share this configuration. Once you configure your MCP servers, you can switch between the two Codex clients without redoing setup.

To configure MCP servers, choose one option:

1. **Use the CLI**: Run `codex mcp` to add and manage servers.
2. **Edit `config.toml`**: Update `~/.codex/config.toml` (or a project-scoped `.codex/config.toml` in trusted projects) directly.

#### Configure with the CLI

#### Add an MCP server

```bash
codex mcp add  --env VAR1=VALUE1 --env VAR2=VALUE2 --
```

For example, to add Context7 (a free MCP server for developer documentation), you can run the following command:

```bash
codex mcp add context7 -- npx -y @upstash/context7-mcp
```

#### Other CLI commands

To see all available MCP commands, you can run `codex mcp --help`.

#### Terminal UI (TUI)

In the `codex` TUI, use `/mcp` to see your active MCP servers.

#### Configure with config.toml

For more fine-grained control over MCP server options, edit `~/.codex/config.toml` (or a project-scoped `.codex/config.toml`). In the IDE extension, select **MCP settings** > **Open config.toml** from the gear menu.

Configure each MCP server with a `[mcp_servers.]` table in the configuration file.

#### STDIO servers

- `command` (required): The command that starts the server.
- `args` (optional): Arguments to pass to the server.
- `env` (optional): Environment variables to set for the server.
- `env_vars` (optional): Environment variables to allow and forward.
- `cwd` (optional): Working directory to start the server from.
- `experimental_environment` (optional): Set to `remote` to start the stdio
  server through a remote executor environment when one is available.

`env_vars` can contain plain variable names or objects with a source:

```toml
env_vars = ["LOCAL_TOKEN", { name = "REMOTE_TOKEN", source = "remote" }]
```

String entries and `source = "local"` read from Codex's local environment.
`source = "remote"` reads from the remote executor environment and requires
remote MCP stdio.

#### Streamable HTTP servers

- `url` (required): The server address.
- `bearer_token_env_var` (optional): Environment variable name for a bearer token to send in `Authorization`.
- `http_headers` (optional): Map of header names to static values.
- `env_http_headers` (optional): Map of header names to environment variable names (values pulled from the environment).

#### Other configuration options

- `startup_timeout_sec` (optional): Timeout (seconds) for the server to start. Default: `10`.
- `tool_timeout_sec` (optional): Timeout (seconds) for the server to run a tool. Default: `60`.
- `enabled` (optional): Set `false` to disable a server without deleting it.
- `required` (optional): Set `true` to make startup fail if this enabled server can't initialize.
- `enabled_tools` (optional): Tool allow list.
- `disabled_tools` (optional): Tool deny list (applied after `enabled_tools`).
- `default_tools_approval_mode` (optional): Default approval behavior for
  tools from this server. Supported values are `auto`, `prompt`, and
  `approve`.
- `tools..approval_mode` (optional): Per-tool approval behavior override.

If your OAuth provider requires a fixed callback port, set the top-level `mcp_oauth_callback_port` in `config.toml`. If unset, Codex binds to an ephemeral port.

If your MCP OAuth flow must use a specific callback URL (for example, a remote Devbox ingress URL or a custom callback path), set `mcp_oauth_callback_url`. Codex uses this value as the base callback URL, then appends a server-specific callback ID to produce the OAuth `redirect_uri` it sends during login. Register the full derived `redirect_uri` with your OAuth provider, including the appended callback ID and any configured path, query, or port, rather than registering only the base host or unsuffixed path. Local callback URLs (for example `localhost`) bind on the local interface; non-local callback URLs bind on `0.0.0.0` so the callback can reach the host.

If the MCP server advertises `scopes_supported`, Codex prefers those
server-advertised scopes during OAuth login. Otherwise, Codex falls back to the
scopes configured in `config.toml`.

#### config.toml examples

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
env_vars = ["LOCAL_TOKEN"]

[mcp_servers.context7.env]
MY_ENV_VAR = "MY_ENV_VALUE"
```

```toml
# Optional MCP OAuth callback overrides (used by `codex mcp login`)
mcp_oauth_callback_port = 5555
mcp_oauth_callback_url = "https://devbox.example.internal/callback"
```

```toml
[mcp_servers.figma]
url = "https://mcp.figma.com/mcp"
bearer_token_env_var = "FIGMA_OAUTH_TOKEN"
http_headers = { "X-Figma-Region" = "us-east-1" }
```

```toml
[mcp_servers.chrome_devtools]
url = "http://localhost:3000/mcp"
enabled_tools = ["open", "screenshot"]
disabled_tools = ["screenshot"] # applied after enabled_tools
default_tools_approval_mode = "prompt"
startup_timeout_sec = 20
tool_timeout_sec = 45
enabled = true

[mcp_servers.chrome_devtools.tools.open]
approval_mode = "approve"
```

#### Plugin-provided MCP servers

Installed plugins can bundle MCP servers in their plugin manifest. Those
servers are launched from the plugin, so user config doesn't set their
transport command. User config can still control on/off state and tool policy
under `plugins..mcp_servers.`.

```toml
[plugins."sample@test".mcp_servers.sample]
enabled = true
default_tools_approval_mode = "prompt"
enabled_tools = ["read", "search"]

[plugins."sample@test".mcp_servers.sample.tools.search]
approval_mode = "approve"
```

#### Examples of useful MCP servers

The list of MCP servers keeps growing. Here are a few common ones:

- [OpenAI Docs MCP](/learn/docs-mcp): Search and read OpenAI developer docs.
- [Context7](https://github.com/upstash/context7): Connect to up-to-date developer documentation.
- Figma [Local](https://developers.figma.com/docs/figma-mcp-server/local-server-installation/) and [Remote](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/): Access your Figma designs.
- [Playwright](https://www.npmjs.com/package/@playwright/mcp): Control and inspect a browser using Playwright.
- [Chrome Developer Tools](https://github.com/ChromeDevTools/chrome-devtools-mcp/): Control and inspect Chrome.
- [Sentry](https://docs.sentry.io/product/sentry-mcp/#codex): Access Sentry logs.
- [GitHub](https://github.com/github/github-mcp-server): Manage GitHub beyond what `git` supports (for example, pull requests and issues).

### Rules

Source: [Rules](/codex/rules.md)

Use rules to control which commands Codex can run outside the sandbox.

Rules are experimental and may change.

#### Create a rules file

1. Create a `.rules` file under a `rules/` folder next to an active config layer (for example, `~/.codex/rules/default.rules`).
2. Add a rule. This example prompts before allowing `gh pr view` to run outside the sandbox.

   ```python
   # Prompt before running commands with the prefix `gh pr view` outside the sandbox.
   prefix_rule(
       # The prefix to match.
       pattern = ["gh", "pr", "view"],

       # The action to take when Codex requests to run a matching command.
       decision = "prompt",

       # Optional rationale for why this rule exists.
       justification = "Viewing PRs is allowed with approval",

       # `match` and `not_match` are optional "inline unit tests" where you can
       # provide examples of commands that should (or should not) match this rule.
       match = [
           "gh pr view 7888",
           "gh pr view --repo openai/codex",
           "gh pr view 7888 --json title,body,comments",
       ],
       not_match = [
           # Does not match because the `pattern` must be an exact prefix.
           "gh pr --repo openai/codex view 7888",
       ],
   )
   ```

3. Restart Codex.

Codex scans `rules/` under every active config layer at startup, including [Team Config](/codex/enterprise/admin-setup#team-config) locations and the user layer at `~/.codex/rules/`. Project-local rules under `/.codex/rules/` load only when the project `.codex/` layer is trusted.

When you add a command to the allow list in the TUI, Codex writes to the user layer at `~/.codex/rules/default.rules` so future runs can skip the prompt.

When Smart approvals are enabled (the default), Codex may propose a
`prefix_rule` for you during escalation requests. Review the suggested prefix
carefully before accepting it.

Admins can also enforce restrictive `prefix_rule` entries from
[`requirements.toml`](/codex/enterprise/managed-configuration#admin-enforced-requirements-requirementstoml).

#### Understand rule fields

`prefix_rule()` supports these fields:

- `pattern` **(required)**: A non-empty list that defines the command prefix to match. Each element is either:
  - A literal string (for example, `"pr"`).
  - A union of literals (for example, `["view", "list"]`) to match alternatives at that argument position.
- `decision` **(defaults to `"allow"`)**: The action to take when the rule matches. Codex applies the most restrictive decision when more than one rule matches (`forbidden` > `prompt` > `allow`).
  - `allow`: Run the command outside the sandbox without prompting.
  - `prompt`: Prompt before each matching invocation.
  - `forbidden`: Block the request without prompting.
- `justification` **(optional)**: A non-empty, human-readable reason for the rule. Codex may surface it in approval prompts or rejection messages. When you use `forbidden`, include a recommended alternative in the justification when appropriate (for example, `"Use \`rg\` instead of \`grep\`."`).
- `match` and `not_match` **(defaults to `[]`)**: Examples that Codex validates when it loads your rules. Use these to catch mistakes before a rule takes effect.

When Codex considers a command to run, it compares the command's argument list to `pattern`. Internally, Codex treats the command as a list of arguments (like what `execvp(3)` receives).

#### Shell wrappers and compound commands

Some tools wrap several shell commands into a single invocation, for example:

```text
["bash", "-lc", "git add . && rm -rf /"]
```

Because this kind of command can hide multiple actions inside one string, Codex treats `bash -lc`, `bash -c`, and their `zsh` / `sh` equivalents specially.

#### When Codex can safely split the script

If the shell script is a linear chain of commands made only of:

- plain words (no variable expansion, no `VAR=...`, `$FOO`, `*`, etc.)
- joined by safe operators (`&&`, `||`, `;`, or `|`)

then Codex parses it (using tree-sitter) and splits it into individual commands before applying your rules.

The script above is treated as two separate commands:

- `["git", "add", "."]`
- `["rm", "-rf", "/"]`

Codex then evaluates each command against your rules, and the most restrictive result wins.

Even if you allow `pattern=["git", "add"]`, Codex won't auto allow `git add . && rm -rf /`, because the `rm -rf /` portion is evaluated separately and prevents the whole invocation from being auto allowed.

This prevents dangerous commands from being smuggled in alongside safe ones.

#### When Codex does not split the script

If the script uses more advanced shell features, such as:

- redirection (`>`, `>>`, `<`)
- substitutions (`$(...)`, `...`)
- environment variables (`FOO=bar`)
- wildcard patterns (`*`, `?`)
- control flow (`if`, `for`, `&&` with assignments, etc.)

then Codex doesn't try to interpret or split it.

In those cases, the entire invocation is treated as:

```text
["bash", "-lc", ""]
```

and your rules are applied to that **single** invocation.

With this handling, you get the security of per-command evaluation when it's safe to do so, and conservative behavior when it isn't.

#### Test a rule file

Use `codex execpolicy check` to test how your rules apply to a command:

```shell
codex execpolicy check --pretty \
  --rules ~/.codex/rules/default.rules \
  -- gh pr view 7888 --json title,body,comments
```

The command emits JSON showing the strictest decision and any matching rules, including any `justification` values from matched rules. Use more than one `--rules` flag to combine files, and add `--pretty` to format the output.

#### Understand the rules language

The `.rules` file format uses `Starlark` (see the [language spec](https://github.com/bazelbuild/starlark/blob/master/spec.md)). Its syntax is like Python, but it's designed to be safe to run: the rules engine can run it without side effects (for example, touching the filesystem).

### Use Codex in Linear

Source: [Use Codex in Linear](/codex/integrations/linear.md)

Use Codex in Linear to delegate work from issues. Assign an issue to Codex or mention `@Codex` in a comment, and Codex creates a cloud task and replies with progress and results.

Codex in Linear is available on paid plans (see [Pricing](/codex/pricing)).

If you're on an Enterprise plan, ask your ChatGPT workspace admin to turn on Codex cloud tasks in [workspace settings](https://chatgpt.com/admin/settings) and enable **Codex for Linear** in [connector settings](https://chatgpt.com/admin/ca).

#### Set up the Linear integration

1. Set up [Codex cloud tasks](/codex/cloud) by connecting GitHub in [Codex](https://chatgpt.com/codex) and creating an [environment](/codex/cloud/environments) for the repository you want Codex to work in.
2. Go to [Codex settings](https://chatgpt.com/codex/settings/connectors) and install **Codex for Linear** for your workspace.
3. Link your Linear account by mentioning `@Codex` in a comment thread on a Linear issue.

#### Delegate work to Codex

You can delegate in two ways:

#### Assign an issue to Codex

After you install the integration, you can assign issues to Codex the same way you assign them to teammates. Codex starts work and posts updates back to the issue.

#### Mention `@Codex` in comments

You can also mention `@Codex` in comment threads to delegate work or ask questions. After Codex replies, follow up in the thread to continue the same session.

After Codex starts working on an issue, it [chooses an environment and repo](#how-codex-chooses-an-environment-and-repo) to work in.
To pin a specific repo, include it in your comment, for example: `@Codex fix this in openai/codex`.

To track progress:

- Open **Activity** on the issue to see progress updates.
- Open the task link to follow along in more detail.

When the task finishes, Codex posts a summary and a link to the completed task so you can create a pull request.

#### How Codex chooses an environment and repo

- Linear suggests a repository based on the issue context. Codex selects the environment that best matches that suggestion. If the request is ambiguous, it falls back to the environment you used most recently.
- The task runs against the default branch of the first repository listed in that environment’s repo map. Update the repo map in Codex if you need a different default or more repositories.
- If no suitable environment or repository is available, Codex will reply in Linear with instructions on how to fix the issue before retrying.

#### Automatically assign issues to Codex

You can assign issues to Codex automatically using triage rules:

1. In Linear, go to **Settings**.
2. Under **Your teams**, select your team.
3. In the workflow settings, open **Triage** and turn it on.
4. In **Triage rules**, create a rule and choose **Delegate** > **Codex** (and any other properties you want to set).

Linear assigns new issues that enter triage to Codex automatically.
When you use triage rules, Codex runs tasks using the account of the issue creator.

#### Data usage, privacy, and security

When you mention `@Codex` or assign an issue to it, Codex receives your issue content to understand your request and create a task.
Data handling follows OpenAI's [Privacy Policy](https://openai.com/privacy), [Terms of Use](https://openai.com/terms/), and other applicable [policies](https://openai.com/policies).
For more on security, see the [Codex security documentation](/codex/agent-approvals-security).

Codex uses large language models that can make mistakes. Always review answers and diffs.

#### Tips and troubleshooting

- **Missing connections**: If Codex can't confirm your Linear connection, it replies in the issue with a link to connect your account.
- **Unexpected environment choice**: Reply in the thread with the environment you want (for example, `@Codex please run this in openai/codex`).
- **Wrong part of the code**: Add more context in the issue, or give explicit instructions in your `@Codex` comment.
- **More help**: See the [OpenAI Help Center](https://help.openai.com/).

#### Connect Linear for local tasks (MCP)

If you're using the Codex app, CLI, or IDE Extension and want Codex to access Linear issues locally, configure Codex to use the Linear Model Context Protocol (MCP) server.

To learn more, [check out the Linear MCP docs](https://linear.app/integrations/codex-mcp).

The setup steps for the MCP server are the same regardless of whether you use the IDE extension or the CLI since both share the same configuration.

#### Use the CLI (recommended)

If you have the CLI installed, run:

```bash
codex mcp add linear --url https://mcp.linear.app/mcp
```

This prompts you to sign in with your Linear account and connect it to Codex.

#### Configure manually

1. Open `~/.codex/config.toml` in your editor.
2. Add the following:

```toml
[mcp_servers.linear]
url = "https://mcp.linear.app/mcp"
```

3. Run `codex mcp login linear` to log in.

### Use Codex in Slack

Source: [Use Codex in Slack](/codex/integrations/slack.md)

Use Codex in Slack to kick off coding tasks from channels and threads. Mention `@Codex` with a prompt, and Codex creates a cloud task and replies with the results.

#### Set up the Slack app

1. Set up [Codex cloud tasks](/codex/cloud). You need a Plus, Pro, Business, Enterprise, or Edu plan (see [ChatGPT pricing](https://chatgpt.com/pricing)), a connected GitHub account, and at least one [environment](/codex/cloud/environments).
2. Go to [Codex settings](https://chatgpt.com/codex/settings/connectors) and install the Slack app for your workspace. Depending on your Slack workspace policies, an admin may need to approve the install.
3. Add `@Codex` to a channel. If you haven't added it yet, Slack prompts you when you mention it.

#### Start a task

1. In a channel or thread, mention `@Codex` and include your prompt. Codex can reference earlier messages in the thread, so you often don't need to restate context.
2. (Optional) Specify an environment or repository in your prompt, for example: `@Codex fix the above in openai/codex`.
3. Wait for Codex to react (👀) and reply with a link to the task. When it finishes, Codex posts the result and, depending on your settings, an answer in the thread.

#### How Codex chooses an environment and repo

- Codex reviews the environments you have access to and selects the one that best matches your request. If the request is ambiguous, it falls back to the environment you used most recently.
- The task runs against the default branch of the first repository listed in that environment’s repo map. Update the repo map in Codex if you need a different default or more repositories.
- If no suitable environment or repository is available, Codex will reply in Slack with instructions on how to fix the issue before retrying.

#### Enterprise data controls

By default, Codex replies in the thread with an answer, which can include information from the environment it ran in.
To prevent this, an Enterprise admin can clear **Allow Codex Slack app to post answers on task completion** in [ChatGPT workspace settings](https://chatgpt.com/admin/settings). When an admin turns off answers, Codex replies only with a link to the task.

#### Data usage, privacy, and security

When you mention `@Codex`, Codex receives your message and thread history to understand your request and create a task.
Data handling follows OpenAI's [Privacy Policy](https://openai.com/privacy), [Terms of Use](https://openai.com/terms/), and other applicable [policies](https://openai.com/policies).
For more on security, see the Codex [security documentation](/codex/agent-approvals-security).

Codex uses large language models that can make mistakes. Always review answers and diffs.

#### Tips and troubleshooting

- **Missing connections**: If Codex can't confirm your Slack or GitHub connection, it replies with a link to reconnect.
- **Unexpected environment choice**: Reply in the thread with the environment you want (for example, `Please run this in openai/openai (applied)`), then mention `@Codex` again.
- **Long or complex threads**: Summarize key details in your latest message so Codex doesn't miss context buried earlier in the thread.
- **Workspace posting**: Some Enterprise workspaces restrict posting final answers. In those cases, open the task link to view progress and results.
- **More help**: See the [OpenAI Help Center](https://help.openai.com/).

## Noninteractive and Programmatic Interfaces

<a id="automation-and-programmatic-interfaces"></a>

Automation paths for CI, SDK usage, app-server, GitHub Actions, and related agents tooling.

### Codex App Server

Source: [Codex App Server](/codex/app-server.md)

Codex app-server is the interface Codex uses to power rich clients (for example, the Codex VS Code extension). Use it when you want a deep integration inside your own product: authentication, conversation history, approvals, and streamed agent events. The app-server implementation is open source in the Codex GitHub repository ([openai/codex/codex-rs/app-server](https://github.com/openai/codex/tree/main/codex-rs/app-server)). See the [Open Source](/codex/open-source) page for the full list of open-source Codex components.

If you are automating jobs or running Codex in CI, use the
Codex SDK instead.

#### Protocol

Like [MCP](https://modelcontextprotocol.io/), `codex app-server` supports bidirectional communication using JSON-RPC 2.0 messages (with the `"jsonrpc":"2.0"` header omitted on the wire).

Supported transports:

- `stdio` (`--listen stdio://`, default): newline-delimited JSON (JSONL).
- `websocket` (`--listen ws://IP:PORT`, experimental and unsupported): one
  JSON-RPC message per WebSocket text frame.
- Unix socket (`--listen unix://` or `--listen unix://PATH`): WebSocket
  connections over Codex's default app-server control socket or a custom Unix
  socket path, using the standard HTTP Upgrade handshake.
- `off` (`--listen off`): don't expose a local transport.

When you run with `--listen ws://IP:PORT`, the same listener also serves basic
HTTP health probes:

- `GET /readyz` returns `200 OK` once the listener accepts new connections.
- `GET /healthz` returns `200 OK` when the request doesn't include an `Origin`
  header.
- Requests with an `Origin` header are rejected with `403 Forbidden`.

WebSocket transport is experimental and unsupported. Local listeners such as
`ws://127.0.0.1:PORT` are appropriate for localhost and SSH port-forwarding
workflows. Non-loopback WebSocket listeners currently allow unauthenticated
connections by default during rollout, so configure WebSocket auth before
exposing one remotely.

Supported WebSocket auth flags:

- `--ws-auth capability-token --ws-token-file /absolute/path`
- `--ws-auth capability-token --ws-token-sha256 HEX`
- `--ws-auth signed-bearer-token --ws-shared-secret-file /absolute/path`

For signed bearer tokens, you can also set `--ws-issuer`, `--ws-audience`, and
`--ws-max-clock-skew-seconds`. Clients present the credential as
`Authorization: Bearer ` during the WebSocket handshake, and app-server
enforces auth before JSON-RPC `initialize`.

Prefer `--ws-token-file` over passing raw bearer tokens on the command line. Use
`--ws-token-sha256` only when the client keeps the raw high-entropy token in a
separate local secret store; the hash is only a verifier, and clients still need
the original token.

In WebSocket mode, app-server uses bounded queues. When request ingress is full,
the server rejects new requests with JSON-RPC error code `-32001` and message
`"Server overloaded; retry later."` Clients should retry with an exponentially
increasing delay and jitter.

#### Message schema

Requests include `method`, `params`, and `id`:

```json
{ "method": "thread/start", "id": 10, "params": { "model": "gpt-5.4" } }
```

Responses echo the `id` with either `result` or `error`:

```json
{ "id": 10, "result": { "thread": { "id": "thr_123" } } }
```

```json
{ "id": 10, "error": { "code": 123, "message": "Something went wrong" } }
```

Notifications omit `id` and use only `method` and `params`:

```json
{ "method": "turn/started", "params": { "turn": { "id": "turn_456" } } }
```

You can generate a TypeScript schema or a JSON Schema bundle from the CLI. Each output is specific to the Codex version you ran, so the generated artifacts match that version exactly:

```bash
codex app-server generate-ts --out ./schemas
codex app-server generate-json-schema --out ./schemas
```

#### App-server quickstart

1. Start the server with `codex app-server` (default stdio transport),
   `codex app-server --listen ws://127.0.0.1:4500` (TCP WebSocket), or
   `codex app-server --listen unix://` (default Unix socket).
2. Connect a client over the selected transport, then send `initialize` followed by the `initialized` notification.
3. Start a thread and a turn, then keep reading notifications from the active transport stream.

Example (Node.js / TypeScript):

```ts
const proc = spawn("codex", ["app-server"], {
  stdio: ["pipe", "pipe", "inherit"],
});
const rl = readline.createInterface({ input: proc.stdout });

const send = (message: unknown) => {
  proc.stdin.write(`${JSON.stringify(message)}\n`);
};

let threadId: string | null = null;

rl.on("line", (line) => {
  const msg = JSON.parse(line) as any;
  console.log("server:", msg);

  if (msg.id === 1 && msg.result?.thread?.id && !threadId) {
    threadId = msg.result.thread.id;
    send({
      method: "turn/start",
      id: 2,
      params: {
        threadId,
        input: [{ type: "text", text: "Summarize this repo." }],
      },
    });
  }
});

send({
  method: "initialize",
  id: 0,
  params: {
    clientInfo: {
      name: "my_product",
      title: "My Product",
      version: "0.1.0",
    },
  },
});
send({ method: "initialized", params: {} });
send({ method: "thread/start", id: 1, params: { model: "gpt-5.4" } });
```

#### Core primitives

- **Thread**: A conversation between a user and the Codex agent. Threads contain turns.
- **Turn**: A single user request and the agent work that follows. Turns contain items and stream incremental updates.
- **Item**: A unit of input or output (user message, agent message, command runs, file change, tool call, and more).

Use the thread APIs to create, list, or archive conversations. Drive a conversation with turn APIs and stream progress via turn notifications.

#### Lifecycle overview

- **Initialize once per connection**: Immediately after opening a transport connection, send an `initialize` request with your client metadata, then emit `initialized`. The server rejects any request on that connection before this handshake.
- **Start (or resume) a thread**: Call `thread/start` for a new conversation, `thread/resume` to continue an existing one, or `thread/fork` to branch history into a new thread id.
- **Begin a turn**: Call `turn/start` with the target `threadId` and user input. Optional fields override model, personality, `cwd`, sandbox policy, and more.
- **Steer an active turn**: Call `turn/steer` to append user input to the currently in-flight turn without creating a new turn.
- **Stream events**: After `turn/start`, keep reading notifications on stdout: `thread/archived`, `thread/unarchived`, `item/started`, `item/completed`, `item/agentMessage/delta`, tool progress, and other updates.
- **Finish the turn**: The server emits `turn/completed` with final status when the model finishes or after a `turn/interrupt` cancellation.

#### Initialization

Clients must send a single `initialize` request per transport connection before invoking any other method on that connection, then acknowledge with an `initialized` notification. Requests sent before initialization receive a `Not initialized` error, and repeated `initialize` calls on the same connection return `Already initialized`.

The server returns the user agent string it will present to upstream services plus `platformFamily` and `platformOs` values that describe the runtime target. Set `clientInfo` to identify your integration.

`initialize.params.capabilities` also supports per-connection notification opt-out via `optOutNotificationMethods`, which is a list of exact method names to suppress for that connection. Matching is exact (no wildcards/prefixes). Unknown method names are accepted and ignored.

**Important**: Use `clientInfo.name` to identify your client for the OpenAI Compliance Logs Platform. If you are developing a new Codex integration intended for enterprise use, please contact OpenAI to get it added to a known clients list. For more context, see the [Codex logs reference](https://chatgpt.com/admin/api-reference#tag/Logs:-Codex).

Example (from the Codex VS Code extension):

```json
{
  "method": "initialize",
  "id": 0,
  "params": {
    "clientInfo": {
      "name": "codex_vscode",
      "title": "Codex VS Code Extension",
      "version": "0.1.0"
    }
  }
}
```

Example with notification opt-out:

```json
{
  "method": "initialize",
  "id": 1,
  "params": {
    "clientInfo": {
      "name": "my_client",
      "title": "My Client",
      "version": "0.1.0"
    },
    "capabilities": {
      "experimentalApi": true,
      "optOutNotificationMethods": ["thread/started", "item/agentMessage/delta"]
    }
  }
}
```

#### Experimental API opt-in

Some app-server methods and fields are intentionally gated behind `experimentalApi` capability.

- Omit `capabilities` (or set `experimentalApi` to `false`) to stay on the stable API surface, and the server rejects experimental methods/fields.
- Set `capabilities.experimentalApi` to `true` to enable experimental methods and fields.

```json
{
  "method": "initialize",
  "id": 1,
  "params": {
    "clientInfo": {
      "name": "my_client",
      "title": "My Client",
      "version": "0.1.0"
    },
    "capabilities": {
      "experimentalApi": true
    }
  }
}
```

If a client sends an experimental method or field without opting in, app-server rejects it with:

` requires experimentalApi capability`

### Codex GitHub Action

Source: [Codex GitHub Action](/codex/github-action.md)

Use the Codex GitHub Action (`openai/codex-action@v1`) to run Codex in CI/CD jobs, apply patches, or post reviews from a GitHub Actions workflow.
The action installs the Codex CLI, starts the Responses API proxy when you provide an API key, and runs `codex exec` under the permissions you specify.

Reach for the action when you want to:

- Automate Codex feedback on pull requests or releases without managing the CLI yourself.
- Gate changes on Codex-driven quality checks as part of your CI pipeline.
- Run repeatable Codex tasks (code review, release prep, migrations) from a workflow file.

For a CI example, see [Non-interactive mode](/codex/noninteractive) and explore the source in the [openai/codex-action repository](https://github.com/openai/codex-action).

#### Prerequisites

- Store your OpenAI key as a GitHub secret (for example `OPENAI_API_KEY`) and reference it in the workflow.
- Run the job on a Linux or macOS runner. For Windows, set `safety-strategy: unsafe`.
- Check out your code before invoking the action so Codex can read the repository contents.
- Decide which prompts you want to run. You can provide inline text via `prompt` or point to a file committed in the repo with `prompt-file`.

#### Example workflow

The sample workflow below reviews new pull requests, captures Codex's response, and posts it back on the PR.

```yaml
name: Codex pull request review
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  codex:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    outputs:
      final_message: ${{ steps.run_codex.outputs.final-message }}
    steps:
      - uses: actions/checkout@v5
        with:
          ref: refs/pull/${{ github.event.pull_request.number }}/merge
          fetch-depth: 0
          persist-credentials: false

      - name: Run Codex
        id: run_codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt-file: .github/codex/prompts/review.md
          output-file: codex-output.md

  post_feedback:
    runs-on: ubuntu-latest
    needs: codex
    if: needs.codex.outputs.final_message != ''
    permissions:
      issues: write
      pull-requests: write
    steps:
      - name: Post Codex feedback
        uses: actions/github-script@v7
        with:
          github-token: ${{ github.token }}
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              body: process.env.CODEX_FINAL_MESSAGE,
            });
        env:
          CODEX_FINAL_MESSAGE: ${{ needs.codex.outputs.final_message }}
```

Replace `.github/codex/prompts/review.md` with your own prompt file or use the `prompt` input for inline text. The example also writes the final Codex message to `codex-output.md` for later inspection or artifact upload.

#### Configure `codex exec`

Fine-tune how Codex runs by setting the action inputs that map to `codex exec` options:

- `prompt` or `prompt-file` (choose one): Inline instructions or a repository path to Markdown or text with your task. Consider storing prompts in `.github/codex/prompts/`.
- `codex-args`: Extra CLI flags. Provide a JSON array (for example `["--ephemeral"]`) or a shell string (`--profile ci`) to configure sessions, profiles, or MCP settings.
- `model` and `effort`: Pick the Codex agent configuration you want; leave empty for defaults.
- `sandbox`: Match the sandbox mode (`workspace-write`, `read-only`, `danger-full-access`) to the permissions Codex needs during the run.
- `output-file`: Save the final Codex message to disk so later steps can upload or diff it.
- `codex-version`: Pin a specific CLI release. Leave blank to use the latest published version.
- `codex-home`: Point to a shared Codex home directory if you want to reuse configuration files or MCP setups across steps.

#### Manage privileges

Codex has broad access on GitHub-hosted runners unless you restrict it. Use these inputs to control exposure:

- `safety-strategy` (default `drop-sudo`) removes `sudo` before running Codex. This is irreversible for the job and protects secrets in memory. On Windows you must set `safety-strategy: unsafe`.
- `unprivileged-user` pairs `safety-strategy: unprivileged-user` with `codex-user` to run Codex as a specific account. Ensure the user can read and write the repository checkout (see the [`unprivileged-user` example](https://github.com/openai/codex-action/blob/main/examples/unprivileged-user.yml) for an ownership fix).
- `read-only` keeps Codex from changing files or using the network, but it still runs with elevated privileges. Don't rely on `read-only` alone to protect secrets.
- `sandbox` limits filesystem and network access within Codex itself. Choose the narrowest option that still lets the task complete.
- `allow-users` and `allow-bots` restrict who can trigger the workflow. By default only users with write access can run the action; list extra trusted accounts explicitly or leave the field empty for the default behavior.

#### Capture outputs

The action emits the last Codex message through the `final-message` output. Map it to a job output (as shown above) or handle it directly in later steps. Combine `output-file` with the uploaded artifacts feature if you prefer to collect the full transcript from the runner. When you need structured data, pass `--output-schema` through `codex-args` to enforce a JSON shape.

#### Security checklist

- Limit who can start the workflow. Prefer trusted events or explicit approvals instead of allowing everyone to run Codex against your repository.
- Sanitize prompt inputs from pull requests, commit messages, or issue bodies to avoid prompt injection. Review HTML comments or hidden text before feeding it to Codex.
- Protect your `OPENAI_API_KEY` by keeping `safety-strategy` on `drop-sudo` or moving Codex to an unprivileged user. Never leave the action in `unsafe` mode on multi-tenant runners.
- Run Codex as the last step in a job so later steps don't inherit any unexpected state changes.
- Rotate keys immediately if you suspect the proxy logs or action output exposed secret material.

#### Troubleshooting

- **You set both prompt and prompt-file**: Remove the duplicate input so you provide exactly one source.
- **responses-api-proxy didn't write server info**: Confirm the API key is present and valid; the proxy starts only when you provide `openai-api-key`.
- **Expected `sudo` removal, but `sudo` succeeded**: Ensure no earlier step restored `sudo` and that the runner OS is Linux or macOS. Re-run with a fresh job.
- **Permission errors after `drop-sudo`**: Grant write access before the action runs (for example with `chmod -R g+rwX "$GITHUB_WORKSPACE"` or by using the unprivileged-user pattern).
- **Unauthorized trigger blocked**: Adjust `allow-users` or `allow-bots` inputs if you need to permit service accounts beyond the default write collaborators.

### Codex SDK

Source: [Codex SDK](/codex/sdk.md)

If you use Codex through the Codex CLI, the IDE extension, or Codex Web, you can also control it programmatically.

Use the SDK when you need to:

- Control Codex as part of your CI/CD pipeline
- Create your own agent that can engage with Codex to perform complex engineering tasks
- Build Codex into your own internal tools and workflows
- Integrate Codex within your own application

#### TypeScript library

The TypeScript library provides a way to control Codex from within your application that's more comprehensive and flexible than non-interactive mode.

Use the library server-side; it requires Node.js 18 or later.

#### Installation

To get started, install the Codex SDK using `npm`:

```bash
npm install @openai/codex-sdk
```

#### Usage

Start a thread with Codex and run it with your prompt.

```ts
const codex = new Codex();
const thread = codex.startThread();
const result = await thread.run(
  "Make a plan to diagnose and fix the CI failures"
);

console.log(result);
```

Call `run()` again to continue on the same thread, or resume a past thread by providing a thread ID.

```ts
// running the same thread
const result = await thread.run("Implement the plan");

console.log(result);

// resuming past thread

const threadId = "";
const thread2 = codex.resumeThread(threadId);
const result2 = await thread2.run("Pick up where you left off");

console.log(result2);
```

For more details, check out the [TypeScript repo](https://github.com/openai/codex/tree/main/sdk/typescript).

#### Python library

The Python SDK controls the local Codex app-server over JSON-RPC. It requires Python 3.10 or later. Published SDK builds include a pinned Codex CLI runtime dependency.

#### Installation

To install the SDK run:

```bash
pip install openai-codex
```

Published SDK builds automatically use their pinned runtime. Pass `CodexConfig(codex_bin=...)` only when you intentionally want to run against a specific local Codex executable.

While the Python SDK is in beta, `pip install openai-codex` selects the latest
published beta build. After a stable SDK release exists, use
`pip install --pre openai-codex` to opt in to newer prerelease builds.

#### Usage

Start Codex, create a thread, and run a prompt:

```python
from openai_codex import Codex, Sandbox

with Codex() as codex:
    thread = codex.thread_start(
        model="gpt-5.4",
        sandbox=Sandbox.workspace_write,
    )
    result = thread.run("Make a plan to diagnose and fix the CI failures")
    print(result.final_response)
```

Use `AsyncCodex` when your application is already asynchronous:

```python
import asyncio

from openai_codex import AsyncCodex

async def main() -> None:
    async with AsyncCodex() as codex:
        thread = await codex.thread_start(model="gpt-5.4")
        result = await thread.run("Implement the plan")
        print(result.final_response)

asyncio.run(main())
```

#### Sandbox presets

Use the same `Sandbox` presets when creating a thread or changing its filesystem
access for a later turn:

```python
from openai_codex import Codex, Sandbox

with Codex() as codex:
    thread = codex.thread_start(sandbox=Sandbox.workspace_write)
    thread.run("Make the requested change.")
    review = thread.run("Review the diff only.", sandbox=Sandbox.read_only)
```

Available presets:

- `Sandbox.read_only`: Read files without allowing writes.
- `Sandbox.workspace_write`: Read files and write inside the workspace and configured writable roots.
- `Sandbox.full_access`: Run without filesystem access restrictions.

When you omit `sandbox=`, app-server uses its configured default. A sandbox
passed to `run(...)` or `turn(...)` applies to that turn and later turns
on the thread.

For more details, check out the [Python repo](https://github.com/openai/codex/tree/main/sdk/python).

### Non-interactive mode

Source: [Non-interactive mode](/codex/noninteractive.md)

Non-interactive mode lets you run Codex from scripts (for example, continuous integration (CI) jobs) without opening the interactive TUI.
You invoke it with `codex exec`.

For flag-level details, see [`codex exec`](/codex/cli/reference#codex-exec).

#### When to use `codex exec`

Use `codex exec` when you want Codex to:

- Run as part of a pipeline (CI, pre-merge checks, scheduled jobs).
- Produce output you can pipe into other tools (for example, to generate release notes or summaries).
- Fit naturally into CLI workflows that chain command output into Codex and pass Codex output to other tools.
- Run with explicit, pre-set sandbox and approval settings.

#### Basic usage

Pass a task prompt as a single argument:

```bash
codex exec "summarize the repository structure and list the top 5 risky areas"
```

While `codex exec` runs, Codex streams progress to `stderr` and prints only the final agent message to `stdout`. This makes it straightforward to redirect or pipe the final result:

```bash
codex exec "generate release notes for the last 10 commits" | tee release-notes.md
```

Use `--ephemeral` when you don't want to persist session rollout files to disk:

```bash
codex exec --ephemeral "triage this repository and suggest next steps"
```

If stdin is piped and you also provide a prompt argument, Codex treats the prompt as the instruction and the piped content as additional context.

This makes it easy to generate input with one command and hand it directly to Codex:

```bash
curl -s https://jsonplaceholder.typicode.com/comments \
  | codex exec "format the top 20 items into a markdown table" \
  > table.md
```

For more advanced stdin piping patterns, see [Advanced stdin piping](#advanced-stdin-piping).

#### Permissions and safety

By default, `codex exec` runs in a read-only sandbox. In automation, set the least permissions needed for the workflow:

- Allow edits: `codex exec --sandbox workspace-write ""`
- Allow broader access: `codex exec --sandbox danger-full-access ""`

Use `danger-full-access` only in a controlled environment (for example, an isolated CI runner or container).

Codex keeps `codex exec --full-auto` as a deprecated compatibility flag and prints a warning. Prefer the explicit `--sandbox workspace-write` flag in new scripts.

Use `--ignore-user-config` when you need a run that doesn't load `$CODEX_HOME/config.toml`, and `--ignore-rules` when you need to skip user and project execpolicy `.rules` files for a controlled automation environment.

If you configure an enabled MCP server with `required = true` and it fails to initialize, `codex exec` exits with an error instead of continuing without that server.

#### Make output machine-readable

To consume Codex output in scripts, use JSON Lines output:

```bash
codex exec --json "summarize the repo structure" | jq
```

When you enable `--json`, `stdout` becomes a JSON Lines (JSONL) stream so you can capture every event Codex emits while it's running. Event types include `thread.started`, `turn.started`, `turn.completed`, `turn.failed`, `item.*`, and `error`.

Item types include agent messages, reasoning, command executions, file changes, MCP tool calls, web searches, and plan updates.

Sample JSON stream (each line is a JSON object):

```jsonl
{"type":"thread.started","thread_id":"0199a213-81c0-7800-8aa1-bbab2a035a53"}
{"type":"turn.started"}
{"type":"item.started","item":{"id":"item_1","type":"command_execution","command":"bash -lc ls","status":"in_progress"}}
{"type":"item.completed","item":{"id":"item_3","type":"agent_message","text":"Repo contains docs, sdk, and examples directories."}}
{"type":"turn.completed","usage":{"input_tokens":24763,"cached_input_tokens":24448,"output_tokens":122,"reasoning_output_tokens":0}}
```

If you only need the final message, write it to a file with `-o `/`--output-last-message `. This writes the final message to the file and still prints it to `stdout` (see [`codex exec`](/codex/cli/reference#codex-exec) for details).

#### Create structured outputs with a schema

If you need structured data for downstream steps, use `--output-schema` to request a final response that conforms to a JSON Schema.
This is useful for automated workflows that need stable fields (for example, job summaries, risk reports, or release metadata).

`schema.json`

```json
{
  "type": "object",
  "properties": {
    "project_name": { "type": "string" },
    "programming_languages": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["project_name", "programming_languages"],
  "additionalProperties": false
}
```

Run Codex with the schema and write the final JSON response to disk:

```bash
codex exec "Extract project metadata" \
  --output-schema ./schema.json \
  -o ./project-metadata.json
```

Example final output (stdout):

```json
{
  "project_name": "Codex CLI",
  "programming_languages": ["Rust", "TypeScript", "Shell"]
}
```

#### Authenticate in automation

`codex exec` reuses saved CLI authentication by default. In CI, it's common to provide credentials explicitly:

#### Use API key auth

For GitHub Actions, use the [Codex GitHub Action](/codex/github-action) instead of installing and authenticating the CLI yourself. The action is designed to reduce API key exposure by installing Codex, starting a Responses API proxy, and running Codex with a configurable safety strategy.

Do not set `OPENAI_API_KEY` or `CODEX_API_KEY` as a job-level environment variable in workflows that check out or run repository-controlled code. Build scripts, tests, dependency lifecycle hooks, or a compromised action in the same job can read those environment variables.

For other automation environments, set `CODEX_API_KEY` only for the single `codex exec` invocation and make sure no untrusted code runs in the same process environment.

To use a different API key for a single run, set `CODEX_API_KEY` inline:

```bash
CODEX_API_KEY= codex exec --json "triage open bug reports"
```

`CODEX_API_KEY` is only supported in `codex exec`.

#### Use ChatGPT-managed auth in CI/CD (advanced)

Read this if you need to run CI/CD jobs with a Codex user account instead of an
API key, such as enterprise teams using ChatGPT-managed Codex access on trusted
runners or users who need ChatGPT/Codex rate limits instead of API key usage.

API keys are the right default for automation because they are simpler to
provision and rotate. Use this path only if you specifically need to run as
your Codex account.

Treat `~/.codex/auth.json` like a password: it contains access tokens. Don't
commit it, paste it into tickets, or share it in chat.

Do not use this workflow for public or open-source repositories. If `codex login`
is not an option on the runner, seed `auth.json` through secure storage, run
Codex on the runner so Codex refreshes it in place, and persist the updated file
between runs.

See [Maintain Codex account auth in CI/CD (advanced)](/codex/auth/ci-cd-auth).

#### Resume a non-interactive session

If you need to continue a previous run (for example, a two-stage pipeline), use the `resume` subcommand:

```bash
codex exec "review the change for race conditions"
codex exec resume --last "fix the race conditions you found"
```

You can also target a specific session ID with `codex exec resume <SESSION_ID>`.

#### Git repository required

Codex requires commands to run inside a Git repository to prevent destructive changes. Override this check with `codex exec --skip-git-repo-check` if you're sure the environment is safe.

#### Common automation patterns

#### Example: Autofix CI failures in GitHub Actions

For GitHub Actions workflows, use [`openai/codex-action`](https://github.com/openai/codex-action) instead of installing Codex and passing the API key to a shell step. The action starts a secure proxy for the OpenAI API key.

You can use Codex to automatically propose fixes when a CI workflow fails. The pattern is:

1. Trigger a follow-up workflow when your main CI workflow completes with an error.
2. Check out the failing commit with repository read permissions only.
3. Run setup commands before Codex, without exposing your OpenAI API key to those steps.
4. Run the Codex GitHub Action.
5. Save Codex's local changes as a patch artifact.
6. In a separate job, apply the patch and open a pull request.

The Codex job below has only `contents: read`. After Codex runs, it only serializes the diff as an artifact. The `open_pr` job receives repository write permissions, but it does not receive `OPENAI_API_KEY`.

The example assumes a Node.js project. Adjust the setup and test commands to match your stack.

For a deeper security checklist, see the [Codex GitHub Action security guidance](https://github.com/openai/codex-action/blob/main/docs/security.md).

```yaml
name: Codex auto-fix on CI failure

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]

jobs:
  generate_fix:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
    outputs:
      has_patch: ${{ steps.diff.outputs.has_patch }}
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
          fetch-depth: 0
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then npm ci; fi

      - name: Run Codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt: |
            The CI workflow "${{ github.event.workflow_run.name }}" failed for commit
            ${{ github.event.workflow_run.head_sha }}.

            Run `npm test --silent` to reproduce the failure. Identify the minimal
            change needed to make the tests pass, implement only that change, and
            run `npm test --silent` again.

            Do not refactor unrelated files.

      - name: Create patch artifact
        id: diff
        run: |
          git add -N .
          git diff --binary HEAD > codex.patch
          if [ -s codex.patch ]; then
            echo "has_patch=true" >> "$GITHUB_OUTPUT"
          else
            echo "has_patch=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Upload patch artifact
        if: steps.diff.outputs.has_patch == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: codex-fix-patch
          path: codex.patch
          if-no-files-found: error

  open_pr:
    runs-on: ubuntu-latest
    needs: generate_fix
    if: needs.generate_fix.outputs.has_patch == 'true'
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.workflow_run.head_sha }}
          fetch-depth: 0

      - uses: actions/download-artifact@v4
        with:
          name: codex-fix-patch

      - name: Apply Codex patch
        run: git apply --index codex.patch

      - name: Open pull request
        env:
          GH_TOKEN: ${{ github.token }}
          FAILED_HEAD_BRANCH: ${{ github.event.workflow_run.head_branch }}
          FAILED_HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
          RUN_ID: ${{ github.event.workflow_run.run_id }}
        run: |
          branch="codex/auto-fix-$RUN_ID"

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git switch -c "$branch"
          git commit -m "Auto-fix failing CI via Codex"
          git push origin "$branch"

          {
            echo "Codex generated this patch after CI failed for \`$FAILED_HEAD_SHA\`."
            echo
            echo "Review the changes before merging."
          } > pr-body.md

          gh pr create \
            --base "$FAILED_HEAD_BRANCH" \
            --head "$branch" \
            --title "Auto-fix failing CI via Codex" \
            --body-file pr-body.md
```

#### Advanced stdin piping

When another command produces input for Codex, choose the stdin pattern based on where the instruction should come from. Use prompt-plus-stdin when you already know the instruction and want to pass piped output as context. Use `codex exec -` when stdin should become the full prompt.

#### Use prompt-plus-stdin

Prompt-plus-stdin is useful when another command already produces the data you want Codex to inspect. In this mode, you write the instruction yourself and pipe in the output as context, which makes it a natural fit for CLI workflows built around command output, logs, and generated data.

```bash
npm test 2>&1 \
  | codex exec "summarize the failing tests and propose the smallest likely fix" \
  | tee test-summary.md
```

#### More prompt-plus-stdin examples

#### Summarize logs

```bash
tail -n 200 app.log \
  | codex exec "identify the likely root cause, cite the most important errors, and suggest the next three debugging steps" \
  > log-triage.md
```

#### Inspect TLS or HTTP issues

```bash
curl -vv https://api.example.com/health 2>&1 \
  | codex exec "explain the TLS or HTTP failure and suggest the most likely fix" \
  > tls-debug.md
```

#### Prepare a Slack-ready update

```bash
gh run view 123456 --log \
  | codex exec "write a concise Slack-ready update on the CI failure, including the likely cause and next step" \
  | pbcopy
```

#### Draft a pull request comment from CI logs

```bash
gh run view 123456 --log \
  | codex exec "summarize the failure in 5 bullets for the pull request thread" \
  | gh pr comment 789 --body-file -
```

### Use Codex with the Agents SDK

Source: [Use Codex with the Agents SDK](/codex/guides/agents-sdk.md)

You can run Codex as an MCP server and connect it from other MCP clients (for example, an agent built with the [OpenAI Agents SDK MCP integration](/api/docs/guides/agents/integrations-observability#mcp)).

To start Codex as an MCP server, you can use the following command:

```bash
codex mcp-server
```

You can launch a Codex MCP server with the [Model Context Protocol Inspector](https://modelcontextprotocol.io/legacy/tools/inspector):

```bash
npx @modelcontextprotocol/inspector codex mcp-server
```

Send a `tools/list` request to see two tools:

**`codex`**: Run a Codex session. Accepts configuration parameters that match the Codex `Config` struct. The `codex` tool takes these properties:

| Property                | Type      | Description                                                                                                |
| ----------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| **`prompt`** (required) | `string`  | The initial user prompt to start the Codex conversation.                                                   |
| `approval-policy`       | `string`  | Approval policy for shell commands generated by the model: `untrusted`, `on-request`, and `never`.         |
| `base-instructions`     | `string`  | The set of instructions to use instead of the default ones.                                                |
| `config`                | `object`  | Individual configuration settings that override what's in `$CODEX_HOME/config.toml`.                       |
| `cwd`                   | `string`  | Working directory for the session. If relative, resolved against the server process's current directory.   |
| `include-plan-tool`     | `boolean` | Whether to include the plan tool in the conversation.                                                      |
| `model`                 | `string`  | Optional override for the model name (for example, `o3`, `o4-mini`).                                       |
| `profile`               | `string`  | Configuration profile name; Codex loads `$CODEX_HOME/profile-name.config.toml` to specify default options. |
| `sandbox`               | `string`  | Sandbox mode: `read-only`, `workspace-write`, or `danger-full-access`.                                     |

**`codex-reply`**: Continue a Codex session by providing the thread ID and prompt. The `codex-reply` tool takes these properties:

| Property                      | Type   | Description                                               |
| ----------------------------- | ------ | --------------------------------------------------------- |
| **`prompt`** (required)       | string | The next user prompt to continue the Codex conversation.  |
| **`threadId`** (required)     | string | The ID of the thread to continue.                         |
| `conversationId` (deprecated) | string | Deprecated alias for `threadId` (kept for compatibility). |

Use the `threadId` from `structuredContent.threadId` in the `tools/call` response. Approval prompts (exec/patch) also include `threadId` in their `params` payload.

Example response payload:

```json
{
  "structuredContent": {
    "threadId": "019bbb20-bff6-7130-83aa-bf45ab33250e",
    "content": "`ls -lah` (or `ls -alh`) — long listing, includes dotfiles, human-readable sizes."
  },
  "content": [
    {
      "type": "text",
      "text": "`ls -lah` (or `ls -alh`) — long listing, includes dotfiles, human-readable sizes."
    }
  ]
}
```

Note modern MCP clients generally report only `"structuredContent"` as the result of a tool call, if present, though the Codex MCP server also returns `"content"` for the benefit of older MCP clients.

Codex CLI can do far more than run ad-hoc tasks. By exposing the CLI as a [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server and orchestrating it with the OpenAI Agents SDK, you can create deterministic, reviewable workflows that scale from a single agent to a complete software delivery pipeline.

This guide walks through the same workflow showcased in the [OpenAI Cookbook](https://github.com/openai/openai-cookbook/blob/main/examples/codex/codex_mcp_agents_sdk/building_consistent_workflows_codex_cli_agents_sdk.ipynb). You will:

- launch Codex CLI as a long-running MCP server,
- build a focused single-agent workflow that produces a playable browser game, and
- orchestrate a multi-agent team with hand-offs, guardrails, and full traces you can review afterwards.

Before starting, make sure you have:

- [Codex CLI](/codex/cli) installed locally so the `codex` command is available.
- Python 3.10+ with `pip`.
- Node.js 18+ if you want to run the MCP Inspector example above.
- An OpenAI API key stored locally. You can create or manage keys in the [OpenAI dashboard](https://platform.openai.com/account/api-keys).

Create a working directory for the guide and add your API key to a `.env` file:

```bash
mkdir codex-workflows
cd codex-workflows
printf "OPENAI_API_KEY=sk-..." > .env
```

#### Install dependencies

The Agents SDK handles orchestration across Codex, hand-offs, and traces. Install the latest SDK packages:

```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade openai openai-agents python-dotenv
```

Activating a virtual environment keeps the SDK dependencies isolated from the
rest of your system.

#### Initialize Codex CLI as an MCP server

Start by turning Codex CLI into an MCP server that the Agents SDK can call. The server exposes two tools (`codex()` to start a conversation and `codex-reply()` to continue one) and keeps Codex alive across multiple agent turns.

Create a file called `codex_mcp.py` and add the following:

```python
import asyncio

from agents import Agent, Runner
from agents.mcp import MCPServerStdio

async def main() -> None:
    async with MCPServerStdio(
        name="Codex CLI",
        params={
            "command": "codex",
            "args": ["mcp-server"],
        },
        client_session_timeout_seconds=360000,
    ) as codex_mcp_server:
        print("Codex MCP server started.")
        # More logic coming in the next sections.
        return

if __name__ == "__main__":
    asyncio.run(main())
```

Run the script once to verify that Codex launches successfully:

```bash
python codex_mcp.py
```

The script exits after printing `Codex MCP server started.`. In the next sections you will reuse the same MCP server inside richer workflows.

#### Build a single-agent workflow

Let’s start with a scoped example that uses Codex MCP to ship a small browser game. The workflow relies on two agents:

1. **Game Designer**: writes a brief for the game.
2. **Game Developer**: implements the game by calling Codex MCP.

Update `codex_mcp.py` with the following code. It keeps the MCP server setup from above and adds both agents.

```python
import asyncio
import os

from dotenv import load_dotenv

from agents import Agent, Runner, set_default_openai_api
from agents.mcp import MCPServerStdio

load_dotenv(override=True)
set_default_openai_api(os.getenv("OPENAI_API_KEY"))

async def main() -> None:
    async with MCPServerStdio(
        name="Codex CLI",
        params={
            "command": "codex",
            "args": ["mcp-server"],
        },
        client_session_timeout_seconds=360000,
    ) as codex_mcp_server:
        developer_agent = Agent(
            name="Game Developer",
            instructions=(
                "You are an expert in building simple games using basic html + css + javascript with no dependencies. "
                "Save your work in a file called index.html in the current directory. "
                "Always call codex with \"approval-policy\": \"never\" and \"sandbox\": \"workspace-write\"."
            ),
            mcp_servers=[codex_mcp_server],
        )

        designer_agent = Agent(
            name="Game Designer",
            instructions=(
                "You are an indie game connoisseur. Come up with an idea for a single page html + css + javascript game that a developer could build in about 50 lines of code. "
                "Format your request as a 3 sentence design brief for a game developer and call the Game Developer coder with your idea."
            ),
            model="gpt-5",
            handoffs=[developer_agent],
        )

        await Runner.run(designer_agent, "Implement a fun new game!")

if __name__ == "__main__":
    asyncio.run(main())
```

Execute the script:

```bash
python codex_mcp.py
```

Codex will read the designer's brief, create an `index.html` file, and write the full game to disk. Open the generated file in a browser to play the result. Every run produces a different design with unique play-style twists and polish.

## Platform, Enterprise, and Caveats

<a id="platform-enterprise-and-caveats"></a>

Windows, enterprise controls, OSS notes, and product or policy caveats that shape deployment choices.

### Environment variables

Source: [Environment variables](/codex/environment-variables.md)

Codex uses `config.toml` for durable settings. Use environment variables for
shell-scoped overrides, automation secrets, installer behavior, or diagnostics.

This page lists stable public environment variables that Codex reads directly.
It does not list internal development variables, test variables, or
provider-specific secret names you choose yourself with
[`env_key`](/codex/config-advanced#custom-model-providers).

#### Core locations

| Variable            | Used by                                    | Default      | Description                                                                                                                                                      |
| ------------------- | ------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_HOME`        | CLI, IDE extension, app-server, installers | `~/.codex`   | Sets the root for Codex state, including config, auth, logs, sessions, skills, and standalone package metadata. If you set it, the directory must already exist. |
| `CODEX_SQLITE_HOME` | CLI and app-server state                   | `CODEX_HOME` | Sets where SQLite-backed state is stored. The `sqlite_home` config option takes precedence. Relative paths resolve from the current working directory.           |

For more about the files stored under `CODEX_HOME`, see
[Config and state locations](/codex/config-advanced#config-and-state-locations).

#### Installer variables

These variables apply to the standalone install scripts served from
`https://chatgpt.com/codex/install.sh` and
`https://chatgpt.com/codex/install.ps1`.

| Variable                | Default                                                                              | Description                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_NON_INTERACTIVE` | `false`                                                                              | Set to `1`, `true`, or `yes` to skip installer prompts. Prompts use their default response, so use this for scripted installs and updates, not first-run setup. |
| `CODEX_INSTALL_DIR`     | `~/.local/bin` on macOS/Linux; `%LOCALAPPDATA%\Programs\OpenAI\Codex\bin` on Windows | Changes where the visible `codex` command is installed. The standalone package cache still lives under `CODEX_HOME/packages/standalone`.                        |

For unattended installs, set `CODEX_NON_INTERACTIVE=1` on the shell that runs
the downloaded installer:

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh
```

```powershell
$env:CODEX_NON_INTERACTIVE=1; irm https://chatgpt.com/codex/install.ps1 | iex
```

#### Authentication and network

| Variable               | Used by                             | Description                                                                                                                                                               |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_API_KEY`        | `codex exec`                        | Provides an API key for a single non-interactive run. This is only supported in `codex exec`; set it inline rather than job-wide when running repository-controlled code. |
| `CODEX_ACCESS_TOKEN`   | CLI, app-server, trusted automation | Provides a ChatGPT or Codex access token for trusted automation. For persisted login, pipe it to `codex login --with-access-token`.                                       |
| `CODEX_CA_CERTIFICATE` | HTTPS, login, and WebSocket clients | Points to a PEM CA bundle for environments with corporate TLS interception or private root CAs. Takes precedence over `SSL_CERT_FILE`.                                    |
| `SSL_CERT_FILE`        | HTTPS, login, and WebSocket clients | Fallback PEM CA bundle path when `CODEX_CA_CERTIFICATE` is unset.                                                                                                         |

For provider API keys, set
[`env_key`](/codex/config-advanced#custom-model-providers) in the model provider
configuration. Codex reads the variable named by that config, so the variable
name itself is not a fixed Codex environment variable.

For automation secret handling, see
[Use API key auth](/codex/noninteractive#use-api-key-auth).
For access token setup, see [Access tokens](/codex/enterprise/access-tokens).

#### Diagnostics

| Variable   | Used by            | Description                                                                                                             |
| ---------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `RUST_LOG` | CLI and app-server | Controls Rust log filtering and verbosity. `codex exec` defaults to `error` output unless you set a more verbose value. |

`RUST_LOG` accepts values such as `error`, `warn`, `info`, `debug`, and
`trace`. It also accepts more targeted Rust logging filters, such as
`codex_core=debug,codex_tui=debug`.

The interactive CLI records diagnostics in bounded local stores by default, but
the plaintext `codex-tui.log` file is opt-in. Set `log_dir` explicitly when you
need a plaintext log for troubleshooting:

```bash
RUST_LOG=debug codex -c log_dir=./.codex-log
tail -F ./.codex-log/codex-tui.log
```

In non-interactive mode, `codex exec` prints messages inline instead of writing
to a separate TUI log file.

### Access tokens

Source: [Access tokens](/codex/enterprise/access-tokens.md)

Codex access tokens are ChatGPT access tokens scoped to Codex permissions that let trusted automation run Codex local with a ChatGPT workspace identity. Use them when a script, scheduled job, or CI runner needs repeatable, non-interactive Codex access.

Codex access tokens are currently supported for ChatGPT Business and
Enterprise workspaces.

Access tokens are created in the ChatGPT admin console at [Access tokens](https://chatgpt.com/admin/access-tokens). They are tied to the ChatGPT user and workspace that create them, and Codex uses them as agent identities for programmatic local workflows.

If a Platform API key works for your automation, keep using API key auth. Use
Codex access tokens when the workflow specifically needs ChatGPT workspace
access, ChatGPT-managed Codex entitlements, or enterprise workspace controls.

Need to trigger a published ChatGPT workspace agent from your own system? Use
a Workspace Agent access token for the Workspace Agents API instead. Codex
access tokens authenticate Codex local workflows; they do not authenticate
workspace agent trigger calls. See [Authenticate with Workspace Agent access
tokens](/workspace-agents/authentication).

#### How access tokens work

Use an access token when Codex needs to run without a user completing a browser sign-in. The token represents the ChatGPT workspace user who created it, so runs can use that user's Codex access and appear in workspace governance data.

Codex checks the token when a run starts and ties the run to that workspace identity. Treat the token like any other automation secret: store it in a secret manager, keep it out of logs, and rotate it regularly.

Use access tokens for:

- `codex exec` jobs that run from trusted automation.
- Local scripts that need repeatable, non-interactive Codex runs.
- Enterprise workflows where usage should be associated with a ChatGPT workspace user instead of an API organization key.

Main risks to avoid:

- **Leaked secrets:** anyone with the token can start Codex runs as the token creator. Store tokens in a secret manager, keep them out of logs, and rotate them regularly.
- **Untrusted runners:** public CI, forked pull requests, or shared machines can expose tokens to people outside your workspace. Use access tokens only on trusted runners.
- **Shared identities:** one person's token reused across unrelated teams makes ownership and audit trails harder to interpret. Create tokens for a specific workflow owner.
- **Stale credentials:** long-lived tokens can remain active after the workflow changes. Prefer finite expirations and revoke tokens that are no longer used.
- **Wrong credential type:** Codex access tokens are for Codex local workflows. Use Workspace Agent access tokens to trigger published ChatGPT workspace agents, and use Platform API keys for general OpenAI API calls.

#### Enable access token creation

Use the access token permission in workspace settings to turn on access token creation for allowed members.

1. Go to [Workspace Settings > Permissions & roles](https://chatgpt.com/admin/settings).
2. In the **Access tokens** section, turn on **Allow users to create access tokens** if all allowed members should be able to create access tokens.
3. If members need to use those tokens with the Codex app, CLI, or IDE extension, make sure **Allow members to use Codex Local** is also turned on in the **Codex Local** section.

Keep access token creation limited to people or service owners who understand where the token will be stored, which automation will use it, and how it will be rotated.

#### Set an access token expiration limit

Workspace owners and admins can set the longest expiration that members can choose when they create a Codex access token. Go to [Workspace Settings > Permissions & roles](https://chatgpt.com/admin/settings), then set **Access token expiration limit** in the Codex Local section.

The limit applies to new access tokens. Existing tokens keep their current expiration.

#### Create an access token

Use the Access tokens page to name the token and choose when it expires.

1. Go to [Access tokens](https://chatgpt.com/admin/access-tokens).
2. Select **Create**.

3. Enter a descriptive name, such as `release-ci` or `nightly-docs-check`.

4. Choose an expiration. Prefer a finite expiration such as 7, 30, 60, or 90 days. If you choose **No expiration**, rotate the token on a regular schedule.
5. Select **Create**.
6. Copy the generated access token immediately. You cannot view it again after you close the modal.
7. Store the token in your secret manager or CI secret store.

The shortest custom expiration is one day. Revoked and expired tokens cannot be used to start new Codex runs.

#### Use an access token with Codex CLI

For ephemeral automation, store the token in `CODEX_ACCESS_TOKEN` and run Codex normally:

```bash
export CODEX_ACCESS_TOKEN=""
codex exec --json "review this repository and summarize the top risks"
```

For a persistent local login, pipe the token to `codex login --with-access-token`:

```bash
printf '%s' "$CODEX_ACCESS_TOKEN" | codex login --with-access-token
codex exec "summarize the last release diff"
```

`codex login --with-access-token` stores an agent identity credential in Codex auth storage. If you prefer not to persist credentials on the machine, use the `CODEX_ACCESS_TOKEN` environment variable instead.

#### Rotate or revoke a token

Rotate access tokens the same way you rotate other automation secrets:

1. Create a replacement token.
2. Update the secret in the runner, scheduler, or secret manager.
3. Run a smoke test with the new token.
4. Revoke the old token from [Access tokens](https://chatgpt.com/admin/access-tokens).

From the Access tokens page, workspace owners and admins can revoke any workspace token. Members with access token permission can revoke only the tokens they created.

#### Permission model

Access token creation is controlled by the workspace's access token permission, which is separate from the general Codex local permission. A member can have access to the Codex app, CLI, or IDE extension without being allowed to create access tokens.

| Capability                                                    | Workspace owners and admins                          | Member with access token permission           | Member without access token permission |
| ------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| Open [Access tokens](https://chatgpt.com/admin/access-tokens) | Yes                                                  | Yes                                           | No                                     |
| Create access tokens                                          | Yes, for their own ChatGPT workspace identity        | Yes, for their own ChatGPT workspace identity | No                                     |
| List access tokens                                            | Workspace list, including who created each token     | Only tokens they created                      | No                                     |
| Revoke access tokens from the Access tokens page              | Any token in the workspace                           | Only tokens they created                      | No page access                         |
| Grant or remove access token permission                       | Yes                                                  | No                                            | No                                     |
| Manage other Codex enterprise settings                        | Yes, based on admin role and Codex admin permissions | No, unless separately granted                 | No                                     |

In short: workspace owners and admins manage access at the workspace level. Members need the access token permission to create and manage their own tokens, but the permission does not grant admin rights or access to other members' tokens.

#### Troubleshooting

#### The access tokens page returns 404 or forbidden

Ask a workspace owner or admin to confirm that your role includes **Allow users to create access tokens** and that **Allow members to use Codex Local** is enabled if you plan to use the token with Codex.

#### `codex login --with-access-token` fails

Confirm that you copied the generated access token, not a browser session token or Platform API key. Also confirm that the token has not expired or been revoked.

#### Related docs

- [Authentication](/codex/auth)
- [Non-interactive mode](/codex/noninteractive)
- [Admin setup](/codex/enterprise/admin-setup)
- [Governance](/codex/enterprise/governance)

### Admin Setup

Source: [Admin Setup](/codex/enterprise/admin-setup.md)

This guide is for ChatGPT Enterprise admins who want to set up Codex for their workspace.

Use this page as the step-by-step rollout guide. For detailed policy, configuration, automation, and monitoring details, use the linked pages: [Authentication](/codex/auth), [Agent approvals & security](/codex/agent-approvals-security), [Access tokens](/codex/enterprise/access-tokens), [Managed configuration](/codex/enterprise/managed-configuration), and [Governance](/codex/enterprise/governance).

#### Enterprise-grade security and privacy

Codex supports ChatGPT Enterprise security features, including:

- No training on enterprise data
- Residency and retention that follow ChatGPT Enterprise policies
- Granular user access controls
- Data encryption at rest (AES-256) and in transit (TLS 1.2+)
- Audit logging via the ChatGPT Compliance API

For security controls and runtime protections, see [Agent approvals & security](/codex/agent-approvals-security). Refer to [Zero Data Retention (ZDR)](https://platform.openai.com/docs/guides/your-data#zero-data-retention) for more details.
For a broader enterprise security overview, see the [Codex security white paper](https://trust.openai.com/?itemUid=382f924d-54f3-43a8-a9df-c39e6c959958&source=click).

#### Pre-requisites: Determine owners and rollout strategy

During your rollout, team members may support different aspects of integrating Codex into your organization. Ensure you have the following owners:

- **ChatGPT Enterprise workspace owner:** required to configure Codex settings in your workspace.
- **Security owner:** determines agent permissions settings for Codex.
- **Analytics owner:** integrates analytics and compliance APIs into your data pipelines.

Decide which Codex surfaces you will use:

- **Codex local:** includes the Codex app, CLI, and IDE extension. The agent runs on the developer's computer in a sandbox.
- **Codex cloud:** includes hosted Codex features (including Codex cloud, iOS, Code Review, and tasks created by the [Slack integration](/codex/integrations/slack) or [Linear integration](/codex/integrations/linear)). The agent runs remotely in a hosted container with your codebase.
- **Both:** use local + cloud together.

You can enable local, cloud, or both, and control access with workspace settings and role-based access control (RBAC).

#### Step 1: Enable Codex in your workspace

You configure access to Codex in ChatGPT Enterprise workspace settings.

Go to [Workspace Settings > Settings and Permissions](https://chatgpt.com/admin/settings).

#### Codex local

Codex local is enabled by default for new ChatGPT Enterprise workspaces. If
you are not a ChatGPT workspace owner, you can test whether you have access by
[installing Codex](/codex/quickstart) and logging in with your work email.

Turn on **Allow members to use Codex Local**.

This enables use of the Codex app, CLI, and IDE extension for allowed users.

If members need programmatic Codex local workflows, grant **Allow users to create access tokens** in the **Access tokens** section or through a custom role. Workspace owners and admins can use **Access token expiration limit** in the **Codex Local** section to set the longest expiration members can choose for new tokens. For setup and permission details, see [Access tokens](/codex/enterprise/access-tokens).

If the Codex Local toggle is off, users who attempt to use the Codex app, CLI, or IDE will see the following error: “403 - Unauthorized. Contact your ChatGPT administrator for access.”

#### Enable device code authentication for Codex CLI

Allow developers to sign in with a device code when using Codex CLI in a non-interactive environment (for example, a remote development box). More details are in [authentication](https://developers.openai.com/codex/auth/).

#### Codex cloud

#### Prerequisites

Codex cloud requires **GitHub (cloud-hosted) repositories**. If your codebase is on-premises or not on GitHub, you can use the Codex SDK to build similar workflows on your own infrastructure.

To set up Codex as an admin, you must have GitHub access to the repositories
commonly used across your organization. If you don't have the necessary
access, work with someone on your engineering team who does.

#### Enable Codex cloud in workspace settings

Start by turning on the ChatGPT GitHub Connector in the Codex section of [Workspace Settings > Settings and Permissions](https://chatgpt.com/admin/settings).

To enable Codex cloud for your workspace, turn on **Allow members to use Codex cloud**. Once enabled, users can access Codex directly from the left-hand navigation panel in ChatGPT.

Note that it may take up to 10 minutes for Codex to appear in ChatGPT.

#### Enable Codex Slack app to post answers on task completion

Codex posts its full answer back to Slack when the task completes. Otherwise, Codex posts only a link to the task.

To learn more, see [Codex in Slack](/codex/integrations/slack).

#### Enable Codex agent to access the internet

By default, Codex cloud agents have no internet access during runtime to help protect against security and safety risks like prompt injection.

This setting lets users use an allowlist for common software dependency domains, add domains and trusted sites, and specify allowed HTTP methods.

For security implications of internet access and runtime controls, see [Agent approvals & security](/codex/agent-approvals-security).

#### Step 2: Set up custom roles (RBAC)

Use RBAC to control granular permissions for access Codex local and Codex cloud.

#### What RBAC lets you do

Workspace Owners can use RBAC in ChatGPT admin settings to:

- Set a default role for users who aren't assigned any custom role
- Create custom roles with granular permissions
- Assign one or more custom roles to Groups
- Automatically sync users into Groups via SCIM
- Manage roles centrally from the Custom Roles tab

Users can inherit more than one role, and permissions resolve to the most permissive (least restrictive) access across those roles.

#### Create a Codex Admin group

Set up a dedicated "Codex Admin" group rather than granting Codex administration to a broad audience.

The **Allow members to administer Codex** toggle grants the Codex Admin role. Codex Admins can:

- View Codex [workspace analytics](https://chatgpt.com/codex/settings/analytics)
- Open the Codex [Policies page](https://chatgpt.com/codex/settings/policies) to manage cloud-managed `requirements.toml` policies
- Assign those managed policies to user groups or configure a default fallback policy
- Manage Codex cloud environments, including editing and deleting environments

Use this role for the small set of admins who own Codex rollout, policy management, and governance. It's not required for general Codex users. You don't need Codex cloud to enable this toggle.

Recommended rollout pattern:

- Create a "Codex Users" group for people who should use Codex
- Create a separate "Codex Admin" group for the smaller set of people who should manage Codex settings and policies
- Assign the custom role with **Allow members to administer Codex** enabled only to the "Codex Admin" group
- Keep membership in the "Codex Admin" group limited to workspace owners or designated platform, IT, and governance operators
- If you use SCIM, back the "Codex Admin" group with your identity provider so membership changes are auditable and centrally managed

This separation makes it easier to roll out Codex while keeping analytics, environment management, and policy deployment limited to trusted admins. For RBAC setup details and the full permission model, see the [OpenAI RBAC Help Center article](https://help.openai.com/en/articles/11750701-rbac).

#### Step 3: Configure Codex local requirements

Codex Admins can deploy admin-enforced `requirements.toml` policies from the Codex [Policies page](https://chatgpt.com/codex/settings/policies).

Use this page when you want to apply different local Codex constraints to different groups without distributing device-level files first. The managed policy uses the same `requirements.toml` format described in [Managed configuration](/codex/enterprise/managed-configuration), so you can define allowed approval policies, sandbox modes, web search behavior, MCP server allowlists, feature pins, and restrictive command rules. To disable Browser Use, the in-app browser, or Computer Use, see [Pin feature flags](/codex/enterprise/managed-configuration#pin-feature-flags).

Recommended setup:

1. Create a baseline policy for most users, then create stricter or more permissive variants only where needed.
2. Assign each managed policy to a specific user group, and configure a default fallback policy for everyone else.
3. Order group rules with care. If a user matches more than one group-specific rule, the first matching rule applies.
4. Treat each policy as a complete profile for that group. Codex doesn't fill missing fields from later matching group rules.

These cloud-managed policies apply across Codex local surfaces when users sign in with ChatGPT, including the Codex app, CLI, and IDE extension.

#### Example requirements.toml policies

Use cloud-managed `requirements.toml` policies to enforce the guardrails you want for each group. The snippets below are examples you can adapt, not required settings.

For Codex 0.138.0 or later, prefer `allowed_permission_profiles` with managed
`default_permissions`. Use `allowed_sandbox_modes` only for legacy deployments
that still configure `sandbox_mode`.

Example: limit web search, sandbox mode, and approvals for a standard local rollout:

```toml
allowed_web_search_modes = ["disabled", "cached"]
allowed_sandbox_modes = ["workspace-write"]
allowed_approval_policies = ["on-request"]
```

Example: allow the standard permission profiles for an upgraded fleet:

Permission-profile allowlists require Codex 0.138.0 or later. Use this example
only after every managed client runs a supporting release.

```toml
default_permissions = ":workspace"

[allowed_permission_profiles]
":read-only" = true
":workspace" = true
```

Example: constrain Browser Use, the in-app browser, and Computer Use:

```toml
[features]
browser_use = false
browser_use_full_cdp_access = false
in_app_browser = false
computer_use = false
```

Example: add a restrictive command rule when you want admins to block or gate specific commands:

```toml
[rules]
prefix_rules = [
  { pattern = [{ token = "git" }, { any_of = ["push", "commit"] }], decision = "prompt", justification = "Require review before mutating remote history." },
]
```

You can use any example on its own or combine them in a single managed policy for a group. For exact keys, precedence, and more examples, see [Managed configuration](/codex/enterprise/managed-configuration) and [Agent approvals & security](/codex/agent-approvals-security).

#### Checking user policies

Use the policy lookup tools at the end of the workflow to confirm which managed policy applies to a user. You can check policy assignment by group or by entering a user email.

If you plan to restrict login method or workspace for local clients, see the admin-managed authentication restrictions in [Authentication](https://developers.openai.com/codex/auth).

#### Step 4: Standardize local configuration with Team Config

Teams who want to standardize Codex across an organization can use Team Config to share defaults, rules, and skills without duplicating setup on every local configuration.

You can check Team Config settings into the repository under the `.codex` directory. Codex automatically picks up Team Config settings when a user opens that repository.

Start with Team Config for your highest-traffic repositories so teams get consistent behavior in the places they use Codex most.

| Type                                 | Path          | Use it to                                                                    |
| ------------------------------------ | ------------- | ---------------------------------------------------------------------------- |
| [Config basics](/codex/config-basic) | `config.toml` | Set defaults for sandbox mode, approvals, model, reasoning effort, and more. |
| [Rules](/codex/rules)                | `rules/`      | Control which commands Codex can run outside the sandbox.                    |
| [Skills](/codex/skills)              | `skills/`     | Make shared skills available to your team.                                   |

For locations and precedence, see [Config basics](/codex/config-basic#configuration-precedence).

#### Step 5: Configure Codex cloud usage (if enabled)

This step covers repository and environment setup after you enable the Codex cloud workspace toggle.

#### Connect Codex cloud to repositories

1. Navigate to [Codex](https://chatgpt.com/codex) and select **Get started**
2. Select **Connect to GitHub** to install the ChatGPT GitHub Connector if you haven't already connected GitHub to ChatGPT
3. Install or connect the ChatGPT GitHub Connector
4. Choose an installation target for the ChatGPT Connector (typically your main organization)
5. Allow the repositories you want to connect to Codex

For GitHub Enterprise Managed Users (EMU), an organization owner must install
the Codex GitHub App for the organization before users can connect
repositories in Codex cloud.

For more, see [Cloud environments](https://developers.openai.com/codex/cloud/environments).

Codex uses short-lived, least-privilege GitHub App installation tokens for each operation and respects the user's existing GitHub repository permissions and branch protection rules.

### Auto-review

Source: [Auto-review](/codex/concepts/sandboxing/auto-review.md)

Auto-review replaces manual approval at the sandbox boundary with a separate
reviewer agent. The main Codex agent still runs inside the same sandbox, with
the same approval policy and the same network and filesystem limits. The
difference is who reviews eligible escalation requests.

Auto-review only applies when approvals are interactive. In practice, that
means `approval_policy = "on-request"` or a granular approval policy that
still surfaces the relevant prompt category. With `approval_policy = "never"`,
there is nothing to review.

#### How auto-review works

At a high level, the flow is:

1. The main agent works inside `read-only` or `workspace-write`.
2. When it needs to cross the sandbox boundary, it requests approval.
3. If `approvals_reviewer = "auto_review"`, Codex routes that approval request
   to a separate reviewer agent instead of stopping for a person.
4. The reviewer decides whether the action should run and returns a rationale.
5. If the action is approved, execution continues. If it is denied, the main
   agent is instructed to find a materially safer path or stop and ask the
   user.

Auto-review is a reviewer swap, not a permission grant. It does not expand
`writable_roots`, enable network access, or weaken protected paths. It only
changes how Codex handles actions that already need approval.

#### When it triggers

Auto-review evaluates approval requests that would otherwise pause for a human.
These include:

- Shell or exec tool calls that request escalated sandbox permissions.
- Network requests blocked by the current sandbox or policy.
- File edits outside the allowed writable roots.
- MCP or app tool calls that require approval based on their tool annotations
  or configured approval mode.
- Browser Use access to a new website or domain.

Auto-review does not run for routine actions already allowed inside the
sandbox. If a command can run under the active `sandbox_mode`, or a tool call
stays within the allowed policy, the main agent continues without review.

Computer Use is a separate case. App approvals for Computer Use still surface
directly to the user, so Auto-review does not replace those app-level prompts.

#### What auto-review blocks

At a high level, Auto-review is designed to block actions such as:

- sending private data, secrets, or credentials to untrusted destinations
- probing for credentials, tokens, cookies, or session material
- broad or persistent security weakening
- destructive actions with significant risk of irreversible damage

The exact policy lives in the open-source Codex repository:
[policy_template.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy_template.md)
and
[policy.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md).
That policy can be customized per enterprise with `guardian_policy_config` or
per user with local [`[auto_review].policy`](/codex/config-advanced#approval-policies-and-sandbox-modes).

#### What the reviewer sees

The reviewer is itself a Codex agent with a narrower job than the main agent:
decide whether a specific boundary-crossing action should run.

The reviewer sees a compact transcript plus the exact approval request. That
typically includes user messages, surfaced assistant updates, relevant tool
calls and tool outputs, and the action now being proposed for approval. It can
also perform read-only checks to gather missing context, but it does so rarely.

Hidden assistant reasoning is not included. Auto-review sees retained
conversation items and tool evidence, not private chain-of-thought.

#### Denials and failure behavior

An explicit denial is not treated like an ordinary sandbox error. Codex returns
the review rationale to the main agent and adds a stronger instruction:

- Do not pursue the same outcome via workaround, indirect execution, or policy
  circumvention.
- Continue only with a materially safer alternative.
- Otherwise, stop and ask the user.

Codex also applies a rejection circuit breaker per turn. In the current
open-source implementation, Auto-review interrupts the turn after `3`
consecutive denials or `10` denials within a rolling window of the last `50`
reviews in the same turn.

Any non-denial resets the consecutive-denial counter. When the breaker trips,
Codex emits a warning and aborts the current turn with an interrupt rather than
letting the agent loop on more escalation attempts.

Timeouts are surfaced separately from explicit denials, and the main agent is
informed that a timeout alone is not proof that the action is unsafe.

There is also an explicit override path for denied actions. In the current
open-source TUI, run `/approve` to open the **Auto-review Denials** picker, then
select one recent denied action to approve for one retry. Codex records up to 10
recent denials per thread. That approval is narrow: it applies to the exact
denied action, not similar future actions; it is recorded for one retry in the
same context; and the retry still goes through Auto-review. Under the hood,
Codex injects a developer-scoped approval marker for that exact action. The
reviewer then sees that explicit user override as context, but it still follows
policy and can deny again if policy says the user cannot overwrite that class of
denial.

#### Configuration

For setup details, see
[Managed configuration](/codex/enterprise/managed-configuration#configure-automatic-review-policy).

The default reviewer policy is in the open-source Codex repository:
[core/src/guardian/policy.md](https://github.com/openai/codex/blob/main/codex-rs/core/src/guardian/policy.md).
Enterprises can replace its tenant-specific section with
`guardian_policy_config` in managed requirements. Individual users can also set
a local
[`[auto_review].policy`](/codex/config-advanced#approval-policies-and-sandbox-modes)
in their `config.toml`, but managed requirements take precedence:

```toml
[auto_review]
policy = """
YOUR POLICY GOES HERE
"""
```

To customize the policy, copy the whole default policy wording first, then
iterate based on your individual risk profile.

#### Reduce review volume without weakening security

Auto-review works best when the sandbox already covers your common safe
workflows. If too many mundane actions need review, fix the boundary first
instead of teaching the reviewer to approve noisy escalations forever.

In practice, the highest-leverage changes are:

- Add narrow
  [`writable_roots`](/codex/config-advanced#approval-policies-and-sandbox-modes)
  for scratch directories or neighboring repos you intentionally use.
- Add narrowly scoped [prefix rules](/codex/rules). Prefer precise command
  prefixes such as `["cargo", "test"]` or `["pnpm", "run", "lint"]` over broad
  patterns such as `["python"]` or `["curl"]`. Broad rules often erase the very
  boundary Auto-review is meant to guard.

Auto-review session transcripts are retained under `~/.codex/sessions` by
default, so you can ask Codex to analyze past traffic there before changing
policy or permissions.

#### Limits

Auto-review improves the default operating point for long-running agentic work,
but it is not a deterministic security guarantee.

- It only evaluates actions that ask to cross a boundary.
- It can still make mistakes, especially in adversarial or unusual contexts.
- It should complement, not replace, good sandbox design, monitoring, and
  organization-specific policy.

For the research rationale and published evaluation results, see the
[Alignment Research post on Auto-review](https://alignment.openai.com/auto-review/).

### Governance

Source: [Governance](/codex/enterprise/governance.md)

Codex gives enterprise teams visibility into adoption and impact, plus the auditability needed for security and compliance programs. Use the self-serve dashboard for day-to-day tracking, the Analytics API for programmatic reporting, and the Compliance API to export detailed logs into your governance stack.

#### Ways to track Codex usage

There are three ways to monitor Codex usage, depending on what you need:

- **Analytics Dashboard**: quick visibility into adoption, usage, and code review impact.
- **Analytics API**: pull structured daily metrics into your data warehouse or BI tools.
- **Compliance API**: exports detailed activity logs for audit, monitoring, and investigations.

#### Analytics Dashboard

#### Dashboard views

The analytics dashboard allows ChatGPT workspace administrators and analytics viewers to track Codex adoption, usage, and Code Review feedback. Usage data can lag by up to 12 hours.

Codex provides date-range controls for daily and weekly views. Key charts include:

- Active users by product surface, including CLI, IDE extension, cloud, desktop, and Code Review
- Workspace and personal usage breakdowns, including credit and token usage by product surface or model
- Product activity for threads and turns by client
- User ranking table, with filters for client and sort options such as credits, threads, turns, text tokens, and current streak
- Code Review activity, including PRs reviewed, issues by priority, comments, replies, reactions, and feedback sentiment
- Skill invocations, agent identity usage, and access token usage when your workspace has those features

#### Data export

Administrators can also export Codex analytics data in CSV or JSON format. Codex provides the following export options:

- Workspace usage, including daily active users, threads, turns, and credits by surface
- Usage per user, including daily threads, turns, and credits across surfaces, with optional email addresses when allowed
- Code Review details, including daily comments, reactions, replies, and priority-level findings

#### Analytics API

Use the [Analytics API](https://chatgpt.com/codex/cloud/settings/apireference) when you want to automate reporting, build internal dashboards, or join Codex metrics with your existing engineering data.

#### What it measures

The enterprise Analytics API returns daily or weekly UTC buckets for a workspace. It supports workspace-level and per-user usage, per-client breakdowns, Code Review throughput, Code Review comment priority, and user engagement with Code Review comments.

#### Endpoints

The base URL is `https://api.chatgpt.com/v1/analytics/codex`. All endpoints return paginated `page` objects with `has_more` and `next_page`.

Use `start_time` for the inclusive Unix timestamp at the beginning of the reporting window, `end_time` for the exclusive Unix timestamp at the end of the reporting window, `group_by` for `day` or `week` buckets, `limit` for page size, and `page` to continue from a previous response. Requests can look back up to 90 days.

#### Usage

`GET /workspaces/{workspace_id}/usage`

- Returns totals for threads, turns, credits, and per-client usage in daily or weekly buckets.
- Omit `group` to return per-user rows.
- Set `group=workspace` to return workspace-wide rows.
- Includes text input, cached input, and output token fields.

#### Code review activity

`GET /workspaces/{workspace_id}/code_reviews`

- Returns pull request reviews completed by Codex.
- Returns total comments generated by Codex.
- Breaks comments down by P0, P1, and P2 priority.

#### User engagement with code review

`GET /workspaces/{workspace_id}/code_review_responses`

- Returns replies and reactions to Codex comments.
- Breaks reactions down into positive, negative, and other reactions.
- Counts comments that received reactions, replies, or either form of engagement.

#### How it works

Analytics uses time windows and supports day or week grouping. Results are time-ordered and returned in pages with cursor-based pagination. Use an API key scoped to `codex.enterprise.analytics.read`.

#### Common use cases

- Engineering observability dashboards
- Adoption reporting for leadership updates
- Usage governance and cost monitoring

#### Compliance API

Use the [Compliance API](https://chatgpt.com/admin/api-reference) when you need auditable records for security, legal, and governance workflows.

#### What it measures

The Compliance API gives enterprises a way to export logs and metadata for Codex activity so you can connect that data to your existing audit, monitoring, and security workflows. It is designed for use with tools like eDiscovery, DLP, SIEM, or other compliance systems.

For Codex usage authenticated through ChatGPT, Compliance API exports provide audit records for Codex activity and can be used in investigations and compliance workflows. These audit logs are retained for up to 30 days. API-key-authenticated Codex usage follows your API organization settings and is not included in Compliance API exports.

#### What you can export

#### Activity logs

- Prompt text sent to Codex
- Responses Codex generated
- Identifiers such as workspace, user, timestamp, and model
- Token usage and related request metadata

#### Metadata for audit and investigation

Use record metadata to answer questions like:

- Who ran a task
- Who created or revoked an access token
- When it ran
- Which model was used
- How much content was processed

#### Common use cases

- Security investigations
- Compliance reporting
- Policy enforcement audits
- Routing events into SIEM and eDiscovery pipelines

### Managed configuration

Source: [Managed configuration](/codex/enterprise/managed-configuration.md)

Enterprise admins can control local Codex behavior in two ways:

- **Requirements**: admin-enforced constraints that users can't override.
- **Managed defaults**: starting values applied when Codex launches. Users can still change settings during a session; Codex reapplies managed defaults the next time it starts.

#### Admin-enforced requirements (requirements.toml)

Requirements constrain security-sensitive settings (approval policy, approvals reviewer, automatic review policy, sandbox mode, permission profiles, web search mode, managed hooks, which MCP servers users can enable, and which user-configured plugin marketplace sources they can add, install from, or refresh). When resolving configuration (for example from `config.toml`, [profile files](/codex/config-advanced#profiles), or CLI config overrides), if a value conflicts with an enforced rule, Codex falls back to a compatible value and notifies the user. If you configure an `mcp_servers` allowlist, Codex enables an MCP server only when both its name and identity match an approved entry; otherwise, Codex disables it.

Requirements can also constrain [feature flags](/codex/config-basic/#feature-flags) via the `[features]` table in `requirements.toml`. Note that features aren't always security-sensitive, but enterprises can pin values if desired. Omitted keys remain unconstrained.

For Codex 0.138.0 or later, prefer [permission profiles](/codex/permissions)
with `allowed_permission_profiles` and managed `default_permissions`. Use
`allowed_sandbox_modes` only for legacy deployments that still configure
`sandbox_mode`.

For the exact key list, see the [`requirements.toml` section in Configuration Reference](/codex/config-reference#requirementstoml).

#### Locations and precedence

Codex checks requirement sources in this order. If the same setting appears more
than once, the first value wins:

1. Cloud-managed requirements (ChatGPT Business or Enterprise)
2. macOS managed preferences (MDM) via `com.openai.codex:requirements_toml_base64`
3. System `requirements.toml` (`/etc/codex/requirements.toml` on Unix systems, including Linux/macOS, or `%ProgramData%\OpenAI\Codex\requirements.toml` on Windows)

Codex checks these sources from top to bottom. For ordinary settings and lists,
it uses the first value it finds. A later source can still provide a setting
that earlier sources leave unset.

Tables combine one entry at a time. For `allowed_permission_profiles`, a later
source can add profile names that earlier sources don't mention. If two sources
set the same profile name, the earlier source wins.

For backwards compatibility, Codex also interprets legacy `managed_config.toml` fields `approval_policy` and `sandbox_mode` as requirements (allowing only that single value).

#### Cloud-managed requirements

When you sign in with ChatGPT on a Business or Enterprise plan, Codex can also fetch admin-enforced requirements from the Codex service. This is another source of `requirements.toml`-compatible requirements. This applies across Codex surfaces, including the CLI, App, and IDE Extension.

#### Configure cloud-managed requirements

Go to the [Codex managed-config page](https://chatgpt.com/codex/settings/managed-configs).

Create a new managed requirements file using the same format and keys as `requirements.toml`.

```toml
enforce_residency = "us"
allowed_approval_policies = ["on-request"]
allowed_sandbox_modes = ["read-only", "workspace-write"]

[rules]
prefix_rules = [
  { pattern = [{ any_of = ["bash", "sh", "zsh"] }], decision = "prompt", justification = "Require explicit approval for shell entrypoints" },
]
```

Save the configuration. Once saved, the updated managed requirements apply immediately for matching users.
For more examples, see [Example requirements.toml](#example-requirementstoml).

#### Assign requirements to groups

Admins can configure different managed requirements for different user groups, and also set a default fallback requirements policy.

If a user matches more than one group-specific rule, the first matching rule applies. Codex doesn't fill unset fields from later matching group rules.

For example, if the first matching group rule sets only `allowed_sandbox_modes = ["read-only"]` and a later matching group rule sets `allowed_approval_policies = ["on-request"]`, Codex applies only the first matching group rule and doesn't fill `allowed_approval_policies` from the later rule.

#### How Codex applies cloud-managed requirements locally

When a user starts Codex and signs in with ChatGPT on a Business or Enterprise plan, Codex applies managed requirements on a best-effort basis. Codex first checks for a valid, unexpired local managed requirements cache entry and uses it if available. If the cache is missing, expired, corrupted, or doesn't match the current auth identity, Codex attempts to fetch managed requirements from the service (with retries) and writes a new signed cache entry on success. If no valid cached entry is available and the fetch fails or times out, Codex continues without the managed requirements layer.

After cache resolution, Codex enforces managed requirements as part of the normal requirements layering described above.

#### Example requirements.toml

This example blocks `--ask-for-approval never` and `--sandbox danger-full-access` (including `--yolo`):

```toml
allowed_approval_policies = ["untrusted", "on-request"]
allowed_sandbox_modes = ["read-only", "workspace-write"]
```

#### Disable Appshots

To disable Appshots for managed users, set the top-level `allow_appshots` requirement:

```toml
allow_appshots = false
```

Codex treats only `allow_appshots = false` as disabling Appshots. If the key is omitted, Appshots remain unconstrained by requirements and use normal product availability checks. App-server clients that read effective requirements through `configRequirements/read` receive the same restriction as `allowAppshots`; an omitted or `null` `allowAppshots` value doesn't disable Appshots.

#### Disable device remote control

To disable [device remote control](/codex/remote-connections#pick-up-work-from-another-device)
for managed users, set the top-level `allow_remote_control` requirement:

```toml
allow_remote_control = false
```

Codex treats only `allow_remote_control = false` as disabling device remote
control. If the key is omitted, device remote control remains unconstrained by
requirements and uses normal product availability checks. This requirement does
not disable SSH remote connections.

#### Control available permission profiles

Use `allowed_permission_profiles` to control which built-in and custom
[permission profiles](/codex/permissions) users can select. This is the
permission-profile equivalent of `allowed_sandbox_modes`; use the allowlist that
matches how your users select permissions.

Permission-profile allowlists require Codex 0.138.0 or later. Codex 0.137.0 and
earlier ignore `allowed_permission_profiles` and managed
`default_permissions`.

Use the permission-profile examples below only after every managed client runs a
supporting release. Don't deploy managed custom profiles until the fleet upgrade
is complete.

When the table is present, it's the complete list of allowed profiles. Profiles
set to `true` are allowed. Profiles that are omitted or set to `false` are
denied, including built-ins added in future Codex versions.

#### Allow the standard profiles

This policy allows read-only and workspace access, but not full access:

```toml
default_permissions = ":workspace"

[allowed_permission_profiles]
":read-only" = true
":workspace" = true
# ":danger-full-access" is omitted, so it is denied.
```

#### Add a managed least-privilege default

Admins can define a custom profile in the same requirements source. Use
organization-specific profile names that won't collide with names in users'
loaded config. Custom names can't start with `:` or use the reserved `filesystem`
name.

Don't deploy managed custom profiles to clients running Codex 0.137.0 or
earlier. Those clients recognize the profile table but not the managed default
that selects it.

For example:

```toml
default_permissions = "acme_review_only"

[allowed_permission_profiles]
":read-only" = true
":workspace" = true
acme_review_only = true
# ":danger-full-access" is intentionally omitted, so it is denied.

[permissions.acme_review_only]
description = "Review code without modifying the workspace."
extends = ":read-only"
```

#### Allow only enterprise-defined profiles

Omit all built-ins when users should select only admin-defined profiles:

```toml
default_permissions = "acme_workspace"

[allowed_permission_profiles]
acme_workspace = true

[permissions.acme_workspace]
description = "Workspace access with sensitive files denied."
extends = ":workspace"

[permissions.acme_workspace.filesystem]
glob_scan_max_depth = 3

[permissions.acme_workspace.filesystem.":workspace_roots"]
"**/*.env" = "deny"
```

The custom profile can extend `:workspace` even though users can't select the
built-in `:workspace` profile directly.

#### Turn off a profile allowed by another source

Permission allowlists combine by profile name. Because Codex checks cloud
requirements before system requirements, cloud requirements can use `false` to
turn off a profile allowed by the system file.

Cloud requirements:

```toml
default_permissions = ":read-only"

[allowed_permission_profiles]
":read-only" = true
":workspace" = false
```

System requirements:

```toml
[allowed_permission_profiles]
":read-only" = true
":workspace" = true  # Not honored because cloud requirements set this to false.
```

Set `default_permissions` explicitly to an allowed profile. If it's omitted,
Codex defaults to `:workspace` only when both `:workspace` and `:read-only` are
explicitly allowed. When `allowed_permission_profiles` is absent, managed
requirements don't restrict which profile names users can select. Every entry
must name a built-in profile or a custom profile defined in a loaded config or
requirements source. Define custom profiles in managed requirements when their
behavior should be controlled centrally.

#### Override sandbox requirements by host

Use `[[remote_sandbox_config]]` when one managed policy should apply different
sandbox requirements on different hosts. For example, you can keep a stricter
default for laptops while allowing workspace writes on matching dev boxes or CI
runners. Host-specific entries currently override `allowed_sandbox_modes` only:

```toml
allowed_sandbox_modes = ["read-only"]

[[remote_sandbox_config]]
hostname_patterns = ["*.devbox.example.com", "runner-??.ci.example.com"]
allowed_sandbox_modes = ["read-only", "workspace-write"]
```

Codex compares each `hostname_patterns` entry against the best-effort resolved
host name. It prefers the fully qualified domain name when available and falls
back to the local host name. Matching is case-insensitive; `*` matches any
sequence of characters, and `?` matches one character.

The first matching `[[remote_sandbox_config]]` entry wins within the same
requirements source. If no entry matches, Codex keeps the top-level
`allowed_sandbox_modes`. Host name matching is for policy selection only; don't
treat it as authenticated device proof.

You can also constrain web search mode:

```toml
allowed_web_search_modes = ["cached"] # "disabled" remains implicitly allowed
```

`allowed_web_search_modes = []` allows only `"disabled"`.
For example, `allowed_web_search_modes = ["cached"]` prevents live web search even in `danger-full-access` sessions.

#### Configure network access requirements

`[experimental_network]` is experimental and may change. Do not enable these
requirements broadly across an enterprise deployment without validating them
on the Codex client versions and operating systems your users run. Windows
support is still limited; avoid applying this policy to Windows users unless
you have tested it in your environment.

Use `[experimental_network]` in `requirements.toml` when administrators should
define network access requirements centrally. These requirements are separate
from the user `features.network_proxy` toggle: they can configure sandbox
networking without that feature flag, but they don't grant command network
access when the active sandbox keeps networking off.

```toml
experimental_network.enabled = true
experimental_network.allowed_domains = [
  "api.openai.com",
  "*.example.com",
]
experimental_network.denied_domains = [
  "blocked.example.com",
  "*.exfil.example.com",
]
```

Use `experimental_network.managed_allowed_domains_only = true` only when you
also define administrator-owned `allowed_domains` and want that allowlist to be
exclusive. If it's `true` without managed allow rules, user-added domain allow
rules don't remain effective.

The domain syntax, local/private destination rules, deny-over-allow behavior,
and DNS rebinding limitations are the same as the sandbox networking behavior
described in [Agent approvals & security](/codex/agent-approvals-security#network-isolation).

#### Pin feature flags

You can also pin [feature flags](/codex/config-basic/#feature-flags) for users
receiving a managed `requirements.toml`:

```toml
[features]
personality = true
unified_exec = false

# Disable specific Codex feature surfaces when needed.
browser_use = false
browser_use_full_cdp_access = false
in_app_browser = false
computer_use = false
```

Use the canonical feature keys from `config.toml`'s `[features]` table. Codex normalizes the resulting feature set to meet these pins and rejects conflicting writes to `config.toml` or profile file feature settings.

- `in_app_browser = false` disables the in-app browser pane.
- `browser_use = false` disables Browser Use and Browser Agent availability.
- `browser_use_full_cdp_access = false` prevents users from enabling full CDP
  access in Browser Developer mode.
- `computer_use = false` disables Computer Use, Record & Replay, and related
  install or setup flows.

If omitted, these features are allowed by policy, subject to normal client,
platform, and rollout availability.

#### Restrict locked computer use

To prevent [Computer Use](/codex/app/computer-use#locked-use) from operating
after a managed Mac locks, add this requirement:

```toml
[computer_use]
allow_locked_computer_use = false
```

This requirement doesn't enable Computer Use. It only prevents locked use on
macOS. If you omit it, locked use remains unconstrained by requirements and is
still subject to normal product availability and the user's local setting.

#### Configure automatic review policy

Use `allowed_approvals_reviewers` to require or allow automatic review. Set it
to `["auto_review"]` to require automatic review, or include `"user"` when users
can choose manual approval.

Set `guardian_policy_config` to replace the tenant-specific section of the
automatic review policy. Codex still uses the built-in reviewer template and
output contract. Managed `guardian_policy_config` takes precedence over local
`[auto_review].policy`.

```toml
allowed_approval_policies = ["on-request"]
allowed_approvals_reviewers = ["auto_review"]

guardian_policy_config = """
## Environment Profile
- Trusted internal destinations include github.com/my-org, artifacts.example.com,
  and internal CI systems.

## Tenant Risk Taxonomy and Allow/Deny Rules
- Treat uploads to unapproved third-party file-sharing services as high risk.
- Deny actions that expose credentials or private source code to untrusted
  destinations.
"""
```

### Subagents

Source: [Subagents](/codex/concepts/subagents.md)

Codex can run subagent workflows by spawning specialized agents in parallel so
they can explore, tackle, or analyze work concurrently.

This page explains the core concepts and tradeoffs. For setup, agent configuration, and examples, see [Subagents](/codex/subagents).

#### Why subagent workflows help

Even with large context windows, models have limits. If you flood the main conversation (where you're defining requirements, constraints, and decisions) with noisy intermediate output such as exploration notes, test logs, stack traces, and command output, the session can become less reliable over time.

This is often described as:

- **Context pollution**: useful information gets buried under noisy intermediate output.
- **Context rot**: performance degrades as the conversation fills up with less relevant details.

For background, see the Chroma writeup on [context rot](https://research.trychroma.com/context-rot).

Subagent workflows help by moving noisy work off the main thread:

- Keep the **main agent** focused on requirements, decisions, and final outputs.
- Run specialized **subagents** in parallel for exploration, tests, or log analysis.
- Return **summaries** from subagents instead of raw intermediate output.

They can also save time when the work can run independently in parallel, and
they make larger-shaped tasks more tractable by breaking them into bounded
pieces. For example, Codex can split analysis of a multi-million-token
document into smaller problems and return distilled takeaways to the main
thread.

As a starting point, use parallel agents for read-heavy tasks such as
exploration, tests, triage, and summarization. Be more careful with parallel
write-heavy workflows, because agents editing code at once can create
conflicts and increase coordination overhead.

#### Core terms

Codex uses a few related terms in subagent workflows:

- **Subagent workflow**: A workflow where Codex runs parallel agents and combines their results.
- **Subagent**: A delegated agent that Codex starts to handle a specific task.
- **Agent thread**: The CLI thread for an agent, which you can inspect and switch between with `/agent`.

#### Triggering subagent workflows

Codex doesn't spawn subagents automatically, and it should only use subagents when you
explicitly ask for subagents or parallel agent work.

In practice, manual triggering means using direct instructions such as
"spawn two agents," "delegate this work in parallel," or "use one agent per
point." Subagent workflows consume more tokens than comparable single-agent runs
because each subagent does its own model and tool work.

A good subagent prompt should explain how to divide the work, whether Codex
should wait for all agents before continuing, and what summary or output to
return.

```text
Review this branch with parallel subagents. Spawn one subagent for security risks, one for test gaps, and one for maintainability. Wait for all three, then summarize the findings by category with file references.
```

#### Choosing models and reasoning

Different agents need different model and reasoning settings.

If you don't pin a model or `model_reasoning_effort`, Codex can choose a setup
that balances intelligence, speed, and price for the task. It may favor `gpt-5.4-mini` for fast scans or a higher-effort `gpt-5.5` configuration for more demanding reasoning. When you want finer control, steer that choice in your prompt or set `model` and `model_reasoning_effort` directly in the agent file.

For most tasks in Codex, start with
`gpt-5.5`. Use
`gpt-5.4-mini` when you want
a faster, lower-cost option for lighter subagent work. If you have ChatGPT Pro
and want near-instant text-only iteration, `gpt-5.3-codex-spark` remains
available in research preview.

#### Model choice

- **`gpt-5.5`**: Start here for demanding agents. It is strongest for ambiguous, multi-step work that needs planning, tool use, validation, and follow-through across a larger context.
- **`gpt-5.4`**: Use this when a workflow is pinned to GPT-5.4. It combines strong coding, reasoning, tool use, and broader workflows.
- **`gpt-5.4-mini`**: Use for agents that favor speed and efficiency over depth, such as exploration, read-heavy scans, large-file review, or processing supporting documents. It works well for parallel workers that return distilled results to the main agent.
- **`gpt-5.3-codex-spark`**: If you have ChatGPT Pro, use this research preview model for near-instant, text-only iteration when latency matters more than broader capability.

#### Reasoning effort (`model_reasoning_effort`)

- **`high`**: Use when an agent needs to trace complex logic, check assumptions, or work through edge cases (for example, reviewer or security-focused agents).
- **`medium`**: A balanced default for most agents.
- **`low`**: Use when the task is straightforward and speed matters most.

Higher reasoning effort increases response time and token usage, but it can improve quality for complex work. For details, see [Models](/codex/models), [Config basics](/codex/config-basic), and [Configuration Reference](/codex/config-reference).

### Build plugins

Source: [Build plugins](/codex/plugins/build.md)

This page is for plugin authors. If you want to browse, install, and use
plugins in Codex, see [Plugins](/codex/plugins). If you are still iterating on
one repo or one personal workflow, start with a local skill. Build a plugin
when you want to share that workflow across teams, bundle app integrations or
MCP config, package lifecycle hooks, or publish a stable package.

#### Create a plugin with `@plugin-creator`

For the fastest setup, use the built-in `@plugin-creator` skill.

It scaffolds the required `.codex-plugin/plugin.json` manifest and can also
generate a local marketplace entry for testing. If you already have a plugin
folder, you can still use `@plugin-creator` to wire it into a local
marketplace.

#### Build your own curated plugin list

A marketplace is a JSON catalog of plugins. `@plugin-creator` can generate one
for a single plugin, and you can keep adding entries to that same marketplace
to build your own curated list for a repo, team, or personal workflow.

In Codex, each marketplace appears as a selectable source in the plugin
directory. Use `$REPO_ROOT/.agents/plugins/marketplace.json` for a repo-scoped
list or `~/.agents/plugins/marketplace.json` for a personal list. Add one
entry per plugin under `plugins[]`, point each `source.path` at the plugin
folder with a `./`-prefixed path relative to the marketplace root, and set
`interface.displayName` to the label you want Codex to show in the marketplace
picker. Then restart Codex. After that, open the plugin directory, choose your
marketplace, and browse or install the plugins in that curated list.

You don't need a separate marketplace per plugin. One marketplace can expose a
single plugin while you are testing, then grow into a larger curated catalog as
you add more plugins.

#### Add a marketplace from the CLI

Use `codex plugin marketplace add` when you want Codex to install and track a
marketplace source for you instead of editing `config.toml` by hand.

```bash
codex plugin marketplace add owner/repo
codex plugin marketplace add owner/repo --ref main
codex plugin marketplace add https://github.com/example/plugins.git --sparse .agents/plugins
codex plugin marketplace add ./local-marketplace-root
```

Marketplace sources can be GitHub shorthand (`owner/repo` or
`owner/repo@ref`), HTTP or HTTPS Git URLs, SSH Git URLs, or local marketplace root
directories. Use `--ref` to pin a Git ref, and repeat `--sparse PATH` to use a
sparse checkout for Git-backed marketplace repos. `--sparse` is valid only for
Git marketplace sources.

To inspect, refresh, or remove configured marketplaces:

```bash
codex plugin marketplace list
codex plugin marketplace upgrade
codex plugin marketplace upgrade marketplace-name
codex plugin marketplace remove marketplace-name
```

`codex plugin marketplace list` prints each marketplace Codex is considering
and the root path it resolves from, including local default marketplaces and
configured marketplace snapshots.

#### Create a plugin manually

Start with a minimal plugin that packages one skill.

1. Create a plugin folder with a manifest at `.codex-plugin/plugin.json`.

```bash
mkdir -p my-first-plugin/.codex-plugin
```

`my-first-plugin/.codex-plugin/plugin.json`

```json
{
  "name": "my-first-plugin",
  "version": "1.0.0",
  "description": "Reusable greeting workflow",
  "skills": "./skills/"
}
```

Use a stable plugin `name` in kebab-case. Codex uses it as the plugin
identifier and component namespace.

2. Add a skill under `skills//SKILL.md`.

```bash
mkdir -p my-first-plugin/skills/hello
```

`my-first-plugin/skills/hello/SKILL.md`

```md
---
name: hello
description: Greet the user with a friendly message.
---

Greet the user warmly and ask how you can help.
```

3. Add the plugin to a marketplace. Use `@plugin-creator` to generate one, or
   follow [Build your own curated plugin list](#build-your-own-curated-plugin-list)
   to wire the plugin into Codex manually.

From there, you can add MCP config, app integrations, or marketplace metadata
as needed.

#### Install a local plugin manually

Use a repo marketplace or a personal marketplace, depending on who should be
able to access the plugin or curated list.

    Add a marketplace file at `$REPO_ROOT/.agents/plugins/marketplace.json`
    and store your plugins under `$REPO_ROOT/plugins/`.

    **Repo marketplace example**

    Step 1: Copy the plugin folder into `$REPO_ROOT/plugins/my-plugin`.

```bash
mkdir -p ./plugins
cp -R /absolute/path/to/my-plugin ./plugins/my-plugin
```

    Step 2: Add or update `$REPO_ROOT/.agents/plugins/marketplace.json` so
    that `source.path` points to that plugin directory with a `./`-prefixed
    relative path:

```json
{
  "name": "local-repo",
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "local",
        "path": "./plugins/my-plugin"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

    Step 3: Restart Codex and verify that the plugin appears.

    Add a marketplace file at `~/.agents/plugins/marketplace.json` and store
    your plugins under `~/.codex/plugins/`.

    **Personal marketplace example**

    Step 1: Copy the plugin folder into `~/.codex/plugins/my-plugin`.

```bash
mkdir -p ~/.codex/plugins
cp -R /absolute/path/to/my-plugin ~/.codex/plugins/my-plugin
```

    Step 2: Add or update `~/.agents/plugins/marketplace.json` so that the
    plugin entry's `source.path` points to that directory.

    Step 3: Restart Codex and verify that the plugin appears.

The marketplace file points to the plugin location, so those directories are
examples rather than fixed requirements. Codex resolves `source.path` relative
to the marketplace root, not relative to the `.agents/plugins/` folder. See
[Marketplace metadata](#marketplace-metadata) for the file format.

After you change the plugin, update the plugin directory that your marketplace
entry points to and restart Codex so the local install picks up the new files.

#### Share a local plugin with your workspace

After you create a plugin and add it to Codex, you can share it with other
members of your ChatGPT workspace from the Codex app.

1. Open **Plugins** in the Codex app.
2. Go to **Created by you** and open the plugin details page.
3. Select **Share**.
4. Add workspace members or workspace groups, or copy a share link.
5. Choose who has access, then send the invitation or link.

People you share with can find the plugin under **Shared with you** in the
plugin directory. Sharing a local plugin with your workspace doesn't publish
it to the public Plugin Directory. Shared plugins stay within your workspace
and organization boundary; accounts that aren't signed in to that workspace
can't access them. Use groups when a team or role should share the same plugin
access. Use a marketplace when you want repo or CLI distribution, and use
workspace sharing when you want selected teammates to install a plugin from the
Codex app.

Workspace admins can disable plugin sharing from cloud-managed requirements by
adding `features.plugin_sharing = false` to `requirements.toml`:

```toml
features.plugin_sharing = false
```
