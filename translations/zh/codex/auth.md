---
status: needs-review
sourceId: "c8716f799b53"
sourceChecksum: "c8716f799b53288fd50d36b96111b6b7b51996a7ed1951cc46652dc1b424a9e0"
sourceUrl: "https://developers.openai.com/codex/auth"
translatedAt: "2026-06-27T19:07:21.7838419+08:00"
translator: codex-gpt-5.5-xhigh
---

# 认证

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

API key 认证支持本地 Codex 工作流，但某些依赖 ChatGPT workspace 访问或云服务的功能会受限或不可用。请在 [Feature availability](https://developers.openai.com/codex/pricing#feature-availability) 中按计划比较支持情况。

使用 API key 登录时，Codex 使用标准 API pricing，而不是包含在 ChatGPT 计划中的额度。

我们建议将 API key 认证用于程序化 Codex CLI 工作流，例如 CI/CD 作业。不要在不受信任或公开环境中暴露 Codex 执行能力。

### 使用 Codex access tokens 进行企业自动化

在 ChatGPT Enterprise workspaces 中，管理员可以授予 access token 权限，让被允许的成员为受信任、非交互式的 Codex 本地工作流创建 Codex access tokens。当自动化需要 ChatGPT workspace 访问、由 ChatGPT 管理的 Codex 权益，或企业 workspace 控制而不需要浏览器登录时，请使用 access token。

Access tokens 适用于受信任脚本、调度器和私有 CI runner。对于一般 OpenAI API 调用，请继续使用 Platform API keys。

有关设置步骤、权限、轮换和撤销指导，请参阅 [Access tokens](https://developers.openai.com/codex/enterprise/access-tokens)。

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

这些设置通常通过 managed configuration 应用，而不是由每个用户单独设置。参见 [Managed configuration](https://developers.openai.com/codex/enterprise/managed-configuration)。

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

如果你的 OS 把凭据存储在 credential store 而不是 `~/.codex/auth.json` 中，此方法可能不适用。请参阅[凭据存储](#credential-storage)，了解如何配置基于文件的存储。

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

当你在配置文件中定义 [custom model provider](https://developers.openai.com/codex/config-advanced#custom-model-providers) 时，可以选择以下认证方式之一：

- **OpenAI authentication**：设置 `requires_openai_auth = true` 以使用 OpenAI authentication。随后你可以使用 ChatGPT 或 API key 登录。当你通过 LLM proxy server 访问 OpenAI models 时，这很有用。当 `requires_openai_auth = true` 时，Codex 会忽略 `env_key`。
- **Environment variable authentication**：设置 `env_key = "<ENV_VARIABLE_NAME>"`，以使用本地环境变量 `<ENV_VARIABLE_NAME>` 中提供商专用的 API key。
- **No authentication**：如果你没有设置 `requires_openai_auth`（或将其设为 `false`），并且没有设置 `env_key`，Codex 会假定该提供商不需要认证。这对本地模型很有用。
