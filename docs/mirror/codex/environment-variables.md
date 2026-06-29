---
title: "环境变量"
description: "Environment variables supported by Codex"
outline: deep
---

# 环境变量

**文档集**：Codex 编码智能体<br>
**分组**：Codex — 环境变量<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/environment-variables](https://developers.openai.com/codex/environment-variables)
- Markdown 来源：[https://developers.openai.com/codex/environment-variables.md](https://developers.openai.com/codex/environment-variables.md)
- 抓取时间：2026-06-27T05:54:57.441Z
- Checksum：`9438ddf48834791c180c652409892f85b3a3f1504a034663ea6b11bae3ae67e2`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex 使用 `config.toml` 存放持久设置。环境变量适合用于 shell 作用域的覆盖、自动化密钥、安装器行为或诊断。

本页列出 Codex 会直接读取的稳定公开环境变量。它不会列出内部开发变量、测试变量，或你通过 [`env_key`](/mirror/codex/config-advanced#custom-model-providers) 自行选择的、特定于提供方的密钥名称。

## 核心位置

| 变量                | 使用方                                     | 默认值       | 说明                                                                                                                                                  |
| ------------------- | ------------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_HOME`        | CLI、IDE extension、app-server、安装器     | `~/.codex`   | 设置 Codex 状态的根目录，包括配置、认证、日志、会话、skills 和独立包元数据。如果设置此变量，该目录必须已经存在。                                    |
| `CODEX_SQLITE_HOME` | CLI 和 app-server 状态                     | `CODEX_HOME` | 设置 SQLite 支持的状态存储位置。`sqlite_home` 配置选项优先级更高。相对路径会从当前工作目录解析。                                                     |

若要了解 `CODEX_HOME` 下存储的文件，请参见[配置和状态位置](/mirror/codex/config-advanced#config-and-state-locations)。

## 安装器变量

这些变量适用于从 `https://chatgpt.com/codex/install.sh` 和 `https://chatgpt.com/codex/install.ps1` 提供的独立安装脚本。

| 变量                    | 默认值                                                                                 | 说明                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_NON_INTERACTIVE` | `false`                                                                                | 设置为 `1`、`true` 或 `yes` 可跳过安装器提示。提示会使用默认响应，因此请将它用于脚本化安装和更新，而不是首次运行设置。                   |
| `CODEX_INSTALL_DIR`     | macOS/Linux 上为 `~/.local/bin`；Windows 上为 `%LOCALAPPDATA%\Programs\OpenAI\Codex\bin` | 更改可见 `codex` 命令的安装位置。独立包缓存仍位于 `CODEX_HOME/packages/standalone` 下。                                                   |

对于无人值守安装，请在运行下载的安装器的 shell 中设置 `CODEX_NON_INTERACTIVE=1`：

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh
```

```powershell
$env:CODEX_NON_INTERACTIVE=1; irm https://chatgpt.com/codex/install.ps1 | iex
```

## 认证和网络

| 变量                   | 使用方                              | 说明                                                                                                                                                                |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_API_KEY`        | `codex exec`                        | 为单次非交互运行提供 API key。此功能仅在 `codex exec` 中受支持；运行由仓库控制的代码时，请以内联方式设置，而不是在整个作业范围内设置。                              |
| `CODEX_ACCESS_TOKEN`   | CLI、app-server、受信任自动化       | 为受信任自动化提供 ChatGPT 或 Codex access token。若要持久登录，请将它通过管道传给 `codex login --with-access-token`。                                             |
| `CODEX_CA_CERTIFICATE` | HTTPS、登录和 WebSocket 客户端      | 指向 PEM CA bundle，用于存在企业 TLS 拦截或私有根 CA 的环境。优先级高于 `SSL_CERT_FILE`。                                                                           |
| `SSL_CERT_FILE`        | HTTPS、登录和 WebSocket 客户端      | 在未设置 `CODEX_CA_CERTIFICATE` 时使用的备用 PEM CA bundle 路径。                                                                                                   |

对于提供方 API key，请在模型提供方配置中设置 [`env_key`](/mirror/codex/config-advanced#custom-model-providers)。Codex 会读取该配置命名的变量，因此变量名本身不是固定的 Codex 环境变量。

有关自动化密钥处理，请参见[使用 API key 认证](/mirror/codex/noninteractive#use-api-key-auth)。有关 access token 设置，请参见 [Access tokens](/mirror/codex/enterprise/access-tokens)。

## 诊断

| 变量       | 使用方             | 说明                                                                                                                       |
| ---------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `RUST_LOG` | CLI 和 app-server  | 控制 Rust 日志过滤和详细程度。除非设置更详细的值，否则 `codex exec` 默认输出 `error` 级别。                                |

`RUST_LOG` 接受 `error`、`warn`、`info`、`debug` 和 `trace` 等值。它也接受更有针对性的 Rust 日志过滤器，例如 `codex_core=debug,codex_tui=debug`。

交互式 CLI 默认会将诊断记录在有界的本地存储中，但明文 `codex-tui.log` 文件需要主动启用。当你需要用于排查问题的明文日志时，请显式设置 `log_dir`：

```bash
RUST_LOG=debug codex -c log_dir=./.codex-log
tail -F ./.codex-log/codex-tui.log
```

在非交互模式下，`codex exec` 会以内联方式打印消息，而不是写入单独的 TUI 日志文件。

:::

## English source

::: details 展开英文原文
::: v-pre
Codex uses `config.toml` for durable settings. Use environment variables for
shell-scoped overrides, automation secrets, installer behavior, or diagnostics.

This page lists stable public environment variables that Codex reads directly.
It does not list internal development variables, test variables, or
provider-specific secret names you choose yourself with
[`env_key`](/mirror/codex/config-advanced#custom-model-providers).

## Core locations

| Variable            | Used by                                    | Default      | Description                                                                                                                                                      |
| ------------------- | ------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_HOME`        | CLI, IDE extension, app-server, installers | `~/.codex`   | Sets the root for Codex state, including config, auth, logs, sessions, skills, and standalone package metadata. If you set it, the directory must already exist. |
| `CODEX_SQLITE_HOME` | CLI and app-server state                   | `CODEX_HOME` | Sets where SQLite-backed state is stored. The `sqlite_home` config option takes precedence. Relative paths resolve from the current working directory.           |

For more about the files stored under `CODEX_HOME`, see
[Config and state locations](/mirror/codex/config-advanced#config-and-state-locations).

## Installer variables

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

## Authentication and network

| Variable               | Used by                             | Description                                                                                                                                                               |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_API_KEY`        | `codex exec`                        | Provides an API key for a single non-interactive run. This is only supported in `codex exec`; set it inline rather than job-wide when running repository-controlled code. |
| `CODEX_ACCESS_TOKEN`   | CLI, app-server, trusted automation | Provides a ChatGPT or Codex access token for trusted automation. For persisted login, pipe it to `codex login --with-access-token`.                                       |
| `CODEX_CA_CERTIFICATE` | HTTPS, login, and WebSocket clients | Points to a PEM CA bundle for environments with corporate TLS interception or private root CAs. Takes precedence over `SSL_CERT_FILE`.                                    |
| `SSL_CERT_FILE`        | HTTPS, login, and WebSocket clients | Fallback PEM CA bundle path when `CODEX_CA_CERTIFICATE` is unset.                                                                                                         |

For provider API keys, set
[`env_key`](/mirror/codex/config-advanced#custom-model-providers) in the model provider
configuration. Codex reads the variable named by that config, so the variable
name itself is not a fixed Codex environment variable.

For automation secret handling, see
[Use API key auth](/mirror/codex/noninteractive#use-api-key-auth).
For access token setup, see [Access tokens](/mirror/codex/enterprise/access-tokens).

## Diagnostics

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

:::
:::

