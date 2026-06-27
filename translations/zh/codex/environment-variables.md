---
status: needs-review
sourceId: "9438ddf48834"
sourceChecksum: "9438ddf48834791c180c652409892f85b3a3f1504a034663ea6b11bae3ae67e2"
sourceUrl: "https://developers.openai.com/codex/environment-variables"
translatedAt: "2026-06-27T19:05:47.1891485+08:00"
translator: codex-gpt-5.5-xhigh
---

# 环境变量

Codex 使用 `config.toml` 存放持久设置。环境变量适合用于 shell 作用域的覆盖、自动化密钥、安装器行为或诊断。

本页列出 Codex 会直接读取的稳定公开环境变量。它不会列出内部开发变量、测试变量，或你通过 [`env_key`](https://developers.openai.com/codex/config-advanced#custom-model-providers) 自行选择的、特定于提供方的密钥名称。

## 核心位置

| 变量                | 使用方                                     | 默认值       | 说明                                                                                                                                                  |
| ------------------- | ------------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CODEX_HOME`        | CLI、IDE extension、app-server、安装器     | `~/.codex`   | 设置 Codex 状态的根目录，包括配置、认证、日志、会话、skills 和独立包元数据。如果设置此变量，该目录必须已经存在。                                    |
| `CODEX_SQLITE_HOME` | CLI 和 app-server 状态                     | `CODEX_HOME` | 设置 SQLite 支持的状态存储位置。`sqlite_home` 配置选项优先级更高。相对路径会从当前工作目录解析。                                                     |

若要了解 `CODEX_HOME` 下存储的文件，请参见[配置和状态位置](https://developers.openai.com/codex/config-advanced#config-and-state-locations)。

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

对于提供方 API key，请在模型提供方配置中设置 [`env_key`](https://developers.openai.com/codex/config-advanced#custom-model-providers)。Codex 会读取该配置命名的变量，因此变量名本身不是固定的 Codex 环境变量。

有关自动化密钥处理，请参见[使用 API key 认证](https://developers.openai.com/codex/noninteractive#use-api-key-auth)。有关 access token 设置，请参见 [Access tokens](https://developers.openai.com/codex/enterprise/access-tokens)。

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
