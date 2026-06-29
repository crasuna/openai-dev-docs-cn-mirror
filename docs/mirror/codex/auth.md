---
title: "认证"
description: "Sign-in methods for Codex"
outline: deep
---

# 认证

**文档集**：Codex 编码智能体<br>
**分组**：Codex — 身份验证<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/auth](https://developers.openai.com/codex/auth)
- Markdown 来源：[https://developers.openai.com/codex/auth.md](https://developers.openai.com/codex/auth.md)
- 抓取时间：2026-06-27T05:54:52.473Z
- Checksum：`c8716f799b53288fd50d36b96111b6b7b51996a7ed1951cc46652dc1b424a9e0`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## OpenAI 认证

使用 OpenAI 模型时，Codex 支持两种登录方式：

- 使用 ChatGPT 登录以获得订阅访问
- 使用 API key 登录以获得按用量计费的访问

Codex cloud 要求使用 ChatGPT 登录。Codex CLI 和 IDE extension 同时支持这两种登录方式。

你的登录方式也会决定适用哪些管理员控制和数据处理策略。

- 使用 ChatGPT 登录时，Codex 使用遵循你的 ChatGPT workspace 权限、RBAC，以及 ChatGPT Enterprise 的保留和驻留设置
- 使用 API key 时，使用方式改为遵循你的 API organization 的保留和数据共享设置

对于 CLI，在没有有效 session 时，Sign in with ChatGPT 是默认认证路径。

### 使用 ChatGPT 登录

当你从 Codex app、CLI 或 IDE Extension 使用 ChatGPT 登录时，Codex 会打开浏览器窗口，让你完成登录流程。登录后，浏览器会把 access token 返回给 CLI 或 IDE extension。

如果你的环境已经提供 ChatGPT access token，CLI 可以从 stdin 读取它：

```shell
printenv CODEX_ACCESS_TOKEN | codex login --with-access-token
```

### 使用 API key 登录

你也可以使用 API key 登录 Codex app、CLI 或 IDE Extension。请从 [OpenAI dashboard](https://platform.openai.com/api-keys) 获取你的 API key。

OpenAI 会通过你的 OpenAI Platform 账户按标准 API 费率对 API key 使用量计费。参见 [API pricing page](https://openai.com/api/pricing/)。

API key 认证支持本地 Codex 工作流，但某些依赖 ChatGPT workspace 访问或云服务的功能会受限或不可用。请在 [Feature availability](/mirror/codex/pricing#feature-availability) 中按计划比较支持情况。

使用 API key 登录时，Codex 使用标准 API pricing，而不是包含在 ChatGPT 计划中的额度。

我们建议将 API key 认证用于程序化 Codex CLI 工作流，例如 CI/CD 作业。不要在不受信任或公开环境中暴露 Codex 执行能力。

### 使用 Codex access tokens 进行企业自动化

在 ChatGPT Enterprise workspaces 中，管理员可以授予 access token 权限，让被允许的成员为受信任、非交互式的 Codex 本地工作流创建 Codex access tokens。当自动化需要 ChatGPT workspace 访问、由 ChatGPT 管理的 Codex 权益，或企业 workspace 控制而不需要浏览器登录时，请使用 access token。

Access tokens 适用于受信任脚本、调度器和私有 CI runner。对于一般 OpenAI API 调用，请继续使用 Platform API keys。

有关设置步骤、权限、轮换和撤销指导，请参阅 [Access tokens](/mirror/codex/enterprise/access-tokens)。

## 保护你的 Codex cloud 账户

Codex cloud 会直接与你的代码库交互，因此它需要比许多其他 ChatGPT 功能更强的安全性。请启用多因素认证（MFA）。

如果你使用社交登录提供商（Google、Microsoft、Apple），则无需在 ChatGPT 账户上启用 MFA，但可以通过社交登录提供商设置 MFA。

有关设置说明，请参阅：

- [Google](https://support.google.com/accounts/answer/185839)
- [Microsoft](https://support.microsoft.com/en-us/topic/what-is-multifactor-authentication-e5e39437-121c-be60-d123-eda06bddf661)
- [Apple](https://support.apple.com/en-us/102660)

如果你通过单点登录（SSO）访问 ChatGPT，你组织的 SSO 管理员应强制所有用户启用 MFA。

如果你使用电子邮件和密码登录，则必须先在账户上设置 MFA，然后才能访问 Codex cloud。

如果你的账户支持多种登录方式，并且其中一种是电子邮件和密码，那么即使你通过其他方式登录，也必须先设置 MFA 才能访问 Codex。

## 登录缓存

当你使用 ChatGPT 或 API key 登录 Codex app、CLI 或 IDE Extension 时，Codex 会缓存你的登录详情，并在你下次启动 CLI 或 extension 时复用它们。CLI 和 extension 共享同一份缓存登录详情。如果你从其中任意一个退出登录，下次启动 CLI 或 extension 时都需要重新登录。

Codex 会把登录详情本地缓存到 `~/.codex/auth.json` 中的明文文件，或缓存到你的操作系统专用凭据存储中。

对于使用 ChatGPT 登录的 session，Codex 会在使用期间自动刷新 token，使其在过期前更新，因此活跃 session 通常不需要再次通过浏览器登录。

## 凭据存储

使用 `cli_auth_credentials_store` 控制 Codex CLI 存储缓存凭据的位置：

```toml
# file | keyring | auto
cli_auth_credentials_store = "keyring"
```

- `file` 会把凭据存储在 `CODEX_HOME` 下的 `auth.json` 中（默认是 `~/.codex`）。
- `keyring` 会把凭据存储在你的操作系统凭据存储中。
- `auto` 会在可用时使用 OS 凭据存储，否则回退到 `auth.json`。

如果你使用基于文件的存储，请像对待密码一样对待 `~/.codex/auth.json`：它包含 access tokens。不要提交它、把它粘贴到工单中，或在聊天中分享它。

## 强制登录方式或 workspace

在托管环境中，管理员可以限制用户允许使用的认证方式：

```toml
# 只允许 ChatGPT 登录，或只允许 API key 登录。
forced_login_method = "chatgpt" # or "api"

# 使用 ChatGPT 登录时，将用户限制到特定 workspace。
forced_chatgpt_workspace_id = "00000000-0000-0000-0000-000000000000"
```

如果活动凭据与配置的限制不匹配，Codex 会让用户退出登录并退出。

这些设置通常通过 managed configuration 应用，而不是由每个用户单独设置。参见 [Managed configuration](/mirror/codex/enterprise/managed-configuration)。

## 登录诊断

直接运行 `codex login` 会在你配置的日志目录下写入专用的 `codex-login.log` 文件。当你需要调试浏览器登录或 device-code 失败，或支持人员要求提供登录专用日志时，请使用它。

## 自定义 CA bundles

如果你的网络使用企业 TLS proxy 或私有根 CA，请在登录前把 `CODEX_CA_CERTIFICATE` 设置为 PEM bundle。当 `CODEX_CA_CERTIFICATE` 未设置时，Codex 会回退到 `SSL_CERT_FILE`。相同的自定义 CA 设置适用于登录、常规 HTTPS 请求和安全 WebSocket 连接。

```shell
export CODEX_CA_CERTIFICATE=/path/to/corporate-root-ca.pem
codex login
```

## 在 headless 设备上登录

如果你使用 Codex CLI 登录 ChatGPT，在某些情况下，基于浏览器的登录 UI 可能无法工作：

- 你正在远程或 headless 环境中运行 CLI。
- 你的本地网络配置阻止了 Codex 在你登录后用于把 OAuth token 返回给 CLI 的 localhost callback。

在这些情况下，优先使用 device code authentication（beta）。在交互式登录 UI 中选择 **Sign in with Device Code**，或直接运行 `codex login --device-auth`。如果 device code authentication 在你的环境中无法工作，请使用一种 fallback 方法。

### 首选：Device code authentication（beta）

1. 在你的 ChatGPT 安全设置（个人账户）或 ChatGPT workspace 权限（workspace 管理员）中启用 device code login。
2. 在运行 Codex 的终端中，选择以下选项之一：
   - 在交互式登录 UI 中选择 **Sign in with Device Code**。
   - 运行 `codex login --device-auth`。
3. 在浏览器中打开链接，登录，然后输入一次性代码。

如果服务器未启用 device code login，Codex 会回退到标准的基于浏览器的登录流程。

### Fallback：在本地认证并复制你的 auth cache

如果你能在带浏览器的机器上完成登录流程，可以把缓存的凭据复制到 headless 机器。

1. 在可以使用基于浏览器登录流程的机器上，运行 `codex login`。
2. 确认 login cache 存在于 `~/.codex/auth.json`。
3. 把 `~/.codex/auth.json` 复制到 headless 机器上的 `~/.codex/auth.json`。

请像对待密码一样对待 `~/.codex/auth.json`：它包含 access tokens。不要提交它、把它粘贴到工单中，或在聊天中分享它。

如果你的 OS 把凭据存储在 credential store 而不是 `~/.codex/auth.json` 中，此方法可能不适用。请参阅[凭据存储](/mirror/codex/auth#credential-storage)，了解如何配置基于文件的存储。

通过 SSH 复制到远程机器：

```shell
ssh user@remote 'mkdir -p ~/.codex'
scp ~/.codex/auth.json user@remote:~/.codex/auth.json
```

或使用避免 `scp` 的单行命令：

```shell
ssh user@remote 'mkdir -p ~/.codex && cat > ~/.codex/auth.json' < ~/.codex/auth.json
```

复制到 Docker container 中：

```shell
# Replace MY_CONTAINER with the name or ID of your container.
CONTAINER_HOME=$(docker exec MY_CONTAINER printenv HOME)
docker exec MY_CONTAINER mkdir -p "$CONTAINER_HOME/.codex"
docker cp ~/.codex/auth.json MY_CONTAINER:"$CONTAINER_HOME/.codex/auth.json"
```

对于受信任 CI/CD runner 上同一模式的更高级版本，请参阅 [Maintain Codex account auth in CI/CD (advanced)](https://developers.openai.com/codex/auth/ci-cd-auth)。该指南解释了如何让 Codex 在正常运行期间刷新 `auth.json`，然后为下一个 job 保留更新后的文件。API keys 仍然是自动化的推荐默认选项。

### Fallback：通过 SSH 转发 localhost callback

如果你可以在本地机器和远程主机之间转发端口，就可以通过隧道转发 Codex 的本地 callback server（默认 `localhost:1455`），从而使用标准的基于浏览器流程。

1. 从本地机器启动端口转发：

```shell
ssh -L 1455:localhost:1455 user@remote
```

2. 在该 SSH session 中运行 `codex login`，并在本地机器上按照打印出的地址操作。

## 替代模型提供商

当你在配置文件中定义 [custom model provider](/mirror/codex/config-advanced#custom-model-providers) 时，可以选择以下认证方式之一：

- **OpenAI authentication**：设置 `requires_openai_auth = true` 以使用 OpenAI authentication。随后你可以使用 ChatGPT 或 API key 登录。当你通过 LLM proxy server 访问 OpenAI models 时，这很有用。当 `requires_openai_auth = true` 时，Codex 会忽略 `env_key`。
- **Environment variable authentication**：设置 `env_key = "&lt;ENV_VARIABLE_NAME&gt;"`，以使用本地环境变量 `&lt;ENV_VARIABLE_NAME&gt;` 中提供商专用的 API key。
- **No authentication**：如果你没有设置 `requires_openai_auth`（或将其设为 `false`），并且没有设置 `env_key`，Codex 会假定该提供商不需要认证。这对本地模型很有用。

:::

## English source

::: details 展开英文原文
::: v-pre
## OpenAI authentication

Codex supports two ways to sign in when using OpenAI models:

- Sign in with ChatGPT for subscription access
- Sign in with an API key for usage-based access

Codex cloud requires signing in with ChatGPT. The Codex CLI and IDE extension support both sign-in methods.

Your sign-in method also determines which admin controls and data-handling policies apply.

- With sign in with ChatGPT, Codex usage follows your ChatGPT workspace permissions, RBAC, and ChatGPT Enterprise retention and residency settings
- With an API key, usage follows your API organization's retention and data-sharing settings instead

For the CLI, Sign in with ChatGPT is the default authentication path when no valid session is available.

### Sign in with ChatGPT

When you sign in with ChatGPT from the Codex app, CLI, or IDE Extension, Codex opens a browser window for you to complete the login flow. After you sign in, the browser returns an access token to the CLI or IDE extension.

If your environment already provides a ChatGPT access token, the CLI can read
it from stdin:

```shell
printenv CODEX_ACCESS_TOKEN | codex login --with-access-token
```

### Sign in with an API key

You can also sign in to the Codex app, CLI, or IDE Extension with an API key. Get your API key from the [OpenAI dashboard](https://platform.openai.com/api-keys).

OpenAI bills API key usage through your OpenAI Platform account at standard API rates. See the [API pricing page](https://openai.com/api/pricing/).

API key authentication supports local Codex workflows, but some features that
rely on ChatGPT workspace access or cloud services are limited or unavailable.
Compare support by plan in
[Feature availability](/mirror/codex/pricing#feature-availability).

When you sign in with an API key, Codex uses standard API pricing instead of
included ChatGPT plan credits.

We recommend API key authentication for programmatic Codex CLI workflows, such
as CI/CD jobs. Don't expose Codex execution in untrusted or public environments.

### Use Codex access tokens for enterprise automation

In ChatGPT Enterprise workspaces, admins can grant the access token
permission so permitted members can create Codex access tokens for trusted,
non-interactive Codex local workflows. Use an access token when automation
needs ChatGPT workspace access, ChatGPT-managed Codex entitlements, or
enterprise workspace controls without a browser sign-in.

Access tokens are intended for trusted scripts, schedulers, and private CI
runners. For general OpenAI API calls, continue to use Platform API keys.

For setup steps, permissions, rotation, and revocation guidance, see
[Access tokens](/mirror/codex/enterprise/access-tokens).

## Secure your Codex cloud account

Codex cloud interacts directly with your codebase, so it needs stronger security than many other ChatGPT features. Enable multi-factor authentication (MFA).

If you use a social login provider (Google, Microsoft, Apple), you aren't required to enable MFA on your ChatGPT account, but you can set it up with your social login provider.

For setup instructions, see:

- [Google](https://support.google.com/accounts/answer/185839)
- [Microsoft](https://support.microsoft.com/en-us/topic/what-is-multifactor-authentication-e5e39437-121c-be60-d123-eda06bddf661)
- [Apple](https://support.apple.com/en-us/102660)

If you access ChatGPT through single sign-on (SSO), your organization's SSO administrator should enforce MFA for all users.

If you log in using an email and password, you must set up MFA on your account before accessing Codex cloud.

If your account supports more than one login method and one of them is email and password, you must set up MFA before accessing Codex, even if you sign in another way.

## Login caching

When you sign in to the Codex app, CLI, or IDE Extension using either ChatGPT or an API key, Codex caches your login details and reuses them the next time you start the CLI or extension. The CLI and extension share the same cached login details. If you log out from either one, you'll need to sign in again the next time you start the CLI or extension.

Codex caches login details locally in a plaintext file at `~/.codex/auth.json` or in your OS-specific credential store.

For sign in with ChatGPT sessions, Codex refreshes tokens automatically during use before they expire, so active sessions usually continue without requiring another browser login.

## Credential storage

Use `cli_auth_credentials_store` to control where the Codex CLI stores cached credentials:

```toml
# file | keyring | auto
cli_auth_credentials_store = "keyring"
```

- `file` stores credentials in `auth.json` under `CODEX_HOME` (defaults to `~/.codex`).
- `keyring` stores credentials in your operating system credential store.
- `auto` uses the OS credential store when available, otherwise falls back to `auth.json`.

If you use file-based storage, treat `~/.codex/auth.json` like a password: it
  contains access tokens. Don't commit it, paste it into tickets, or share it in
  chat.

## Enforce a login method or workspace

In managed environments, admins may restrict how users are allowed to authenticate:

```toml
# Only allow ChatGPT login or only allow API key login.
forced_login_method = "chatgpt" # or "api"

# When using ChatGPT login, restrict users to a specific workspace.
forced_chatgpt_workspace_id = "00000000-0000-0000-0000-000000000000"
```

If the active credentials don't match the configured restrictions, Codex logs the user out and exits.

These settings are commonly applied via managed configuration rather than per-user setup. See [Managed configuration](/mirror/codex/enterprise/managed-configuration).

## Login diagnostics

Direct `codex login` runs write a dedicated `codex-login.log` file under
your configured log directory. Use it when you need to debug browser-login or
device-code failures, or when support asks for login-specific logs.

## Custom CA bundles

If your network uses a corporate TLS proxy or private root CA, set
`CODEX_CA_CERTIFICATE` to a PEM bundle before logging in. When
`CODEX_CA_CERTIFICATE` is unset, Codex falls back to `SSL_CERT_FILE`. The same
custom CA settings apply to login, normal HTTPS requests, and secure WebSocket
connections.

```shell
export CODEX_CA_CERTIFICATE=/path/to/corporate-root-ca.pem
codex login
```

## Login on headless devices

If you are signing in to ChatGPT with the Codex CLI, there are some situations where the browser-based login UI may not work:

- You're running the CLI in a remote or headless environment.
- Your local networking configuration blocks the localhost callback Codex uses to return the OAuth token to the CLI after you sign in.

In these situations, prefer device code authentication (beta). In the interactive login UI, choose **Sign in with Device Code**, or run `codex login --device-auth` directly. If device code authentication doesn't work in your environment, use one of the fallback methods.

### Preferred: Device code authentication (beta)

1. Enable device code login in your ChatGPT security settings (personal account) or ChatGPT workspace permissions (workspace admin).
2. In the terminal where you're running Codex, choose one of these options:
   - In the interactive login UI, select **Sign in with Device Code**.
   - Run `codex login --device-auth`.
3. Open the link in your browser, sign in, then enter the one-time code.

If device code login isn't enabled by the server, Codex falls back to the standard browser-based login flow.

### Fallback: Authenticate locally and copy your auth cache

If you can complete the login flow on a machine with a browser, you can copy your cached credentials to the headless machine.

1. On a machine where you can use the browser-based login flow, run `codex login`.
2. Confirm the login cache exists at `~/.codex/auth.json`.
3. Copy `~/.codex/auth.json` to `~/.codex/auth.json` on the headless machine.

Treat `~/.codex/auth.json` like a password: it contains access tokens. Don't commit it, paste it into tickets, or share it in chat.

If your OS stores credentials in a credential store instead of `~/.codex/auth.json`, this method may not apply. See
[Credential storage](/mirror/codex/auth#credential-storage) for how to configure file-based storage.

Copy to a remote machine over SSH:

```shell
ssh user@remote 'mkdir -p ~/.codex'
scp ~/.codex/auth.json user@remote:~/.codex/auth.json
```

Or use a one-liner that avoids `scp`:

```shell
ssh user@remote 'mkdir -p ~/.codex && cat > ~/.codex/auth.json' < ~/.codex/auth.json
```

Copy into a Docker container:

```shell
# Replace MY_CONTAINER with the name or ID of your container.
CONTAINER_HOME=$(docker exec MY_CONTAINER printenv HOME)
docker exec MY_CONTAINER mkdir -p "$CONTAINER_HOME/.codex"
docker cp ~/.codex/auth.json MY_CONTAINER:"$CONTAINER_HOME/.codex/auth.json"
```

For a more advanced version of this same pattern on trusted CI/CD runners, see
[Maintain Codex account auth in CI/CD (advanced)](https://developers.openai.com/codex/auth/ci-cd-auth).
That guide explains how to let Codex refresh `auth.json` during normal runs and
then keep the updated file for the next job. API keys are still the recommended
default for automation.

### Fallback: Forward the localhost callback over SSH

If you can forward ports between your local machine and the remote host, you can use the standard browser-based flow by tunneling Codex's local callback server (default `localhost:1455`).

1. From your local machine, start port forwarding:

```shell
ssh -L 1455:localhost:1455 user@remote
```

2. In that SSH session, run `codex login` and follow the printed address on your local machine.

## Alternative model providers

When you define a [custom model provider](/mirror/codex/config-advanced#custom-model-providers) in your configuration file, you can choose one of these authentication methods:

- **OpenAI authentication**: Set `requires_openai_auth = true` to use OpenAI authentication. You can then sign in with ChatGPT or an API key. This is useful when you access OpenAI models through an LLM proxy server. When `requires_openai_auth = true`, Codex ignores `env_key`.
- **Environment variable authentication**: Set `env_key = "&lt;ENV_VARIABLE_NAME&gt;"` to use a provider-specific API key from the local environment variable named `&lt;ENV_VARIABLE_NAME&gt;`.
- **No authentication**: If you don't set `requires_openai_auth` (or set it to `false`) and you don't set `env_key`, Codex assumes the provider doesn't require authentication. This is useful for local models.

:::
:::

