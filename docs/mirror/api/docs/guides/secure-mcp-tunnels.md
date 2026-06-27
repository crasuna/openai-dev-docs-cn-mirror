---
title: "Secure MCP Tunnel"
description: "Connect private or on-prem MCP servers to supported OpenAI products with an outbound-only MCP tunnel, without exposing them to the public internet."
outline: deep
---

# Secure MCP Tunnel

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/secure-mcp-tunnels](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/secure-mcp-tunnels.md](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels.md)
- 抓取时间：2026-06-27T05:54:08.592Z
- Checksum：`7cfd4e4ddd6715e3b38e61bb88835fd5ebcfdcce1bd9937cab015043a3f553c7`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Secure MCP Tunnel 让你可以把私有 MCP servers 连接到受支持的 OpenAI 产品，而无需打开入站防火墙端口，也无需把这些 servers 暴露到公网。请在已经能够访问你的 MCP server 的网络内运行 `tunnel-client`；它会打开一条通往 OpenAI 的出站 HTTPS 路径，拉取排队的 MCP 工作，在本地转发请求，并通过同一个 tunnel 返回响应。

## 什么是 MCP tunnel？

MCP tunnel 是从你网络内部某台主机到 OpenAI-hosted MCP endpoint 的 outbound-only connection。当你的 MCP server 是私有的、位于本地环境中或在防火墙后面，但 ChatGPT、Codex、Responses API 或其他受支持的 OpenAI surface 仍需要调用它时，请使用 MCP tunnel。

Secure MCP Tunnel 会让 MCP server 保持私有，同时给受支持的 OpenAI 产品提供正常的 MCP 请求路径。`tunnel-client` 会轮询 OpenAI 获取工作，在本地转发 MCP requests，并通过同一个 tunnel 返回响应。

## 何时使用 Secure MCP Tunnel

- 你的 MCP server 运行在私有网络、本地环境、开发者机器上，或位于现有访问控制之后。
- 你希望 ChatGPT、Codex、Responses API 或其他受支持的 OpenAI surface 使用该 server，而无需把 MCP server 公开。
- 你的网络允许运行 `tunnel-client` 的主机默认向 `api.openai.com:443` 发起出站 HTTPS 请求，或在配置 control-plane mTLS 时向 `mtls.api.openai.com:443` 发起出站 HTTPS 请求，并且该主机能访问私有 MCP server。
- 如需了解一般 MCP 概念，请从 [MCP and Connectors guide](/mirror/api/docs/guides/tools-connectors-mcp) 开始。

## 工作原理

1. 在 Platform tunnel settings 中创建或管理一个 OpenAI-hosted MCP tunnel endpoint。
2. 在可以访问私有 MCP server 的网络内运行 `tunnel-client`。
3. 使用 tunnel identity 和私有 MCP server 地址配置 `tunnel-client`。
4. OpenAI 产品把 MCP requests 发送到 OpenAI-hosted tunnel endpoint。
5. `tunnel-client` long-polls 排队工作，把每个 `JSON-RPC` request 转发到私有 MCP server，并通过 tunnel 发回响应。

私有 MCP server 不需要公开 listener。OpenAI-hosted endpoint 为受支持的产品提供正常 MCP 请求路径，同时网络发起点仍留在你的边界内。当 connector 请求 streamed results 时，tunnel path 可以转发中间 server-sent events。



    OpenAI 产品调用 OpenAI-hosted tunnel endpoint；`tunnel-client`
    long-polls 排队工作，并通过同一个 tunnel 返回 MCP response。



## 开始之前

你需要：

- 来自 [Platform tunnel settings](https://platform.openai.com/settings/organization/tunnels) 的 `tunnel_id`。
- 用于 `tunnel-client` 的 runtime API key。
- 一个 `tunnel-client` 能够在你的网络内部通过 stdio 或 HTTP 访问的 MCP server。

## 权限和访问

[Platform tunnel permissions](/mirror/api/docs/guides/rbac) 和 ChatGPT developer-mode access 是分开的：

- 创建或编辑 tunnel 需要 Tunnels **Read** + **Manage**。
- 运行 `tunnel-client` 或在 connector settings 中选择 tunnel 需要 Tunnels **Read** + **Use**。
- Tunnel permissions 适用于 Platform organization。Platform organization owner 或 RBAC administrator 会授予 tunnel role。
- ChatGPT developer mode 是单独的 workspace permission。对于 Enterprise/Edu，workspace admin 会授予 **Permissions & Roles** &gt; **Connected Data** &gt; **Developer mode / Create custom MCP connectors**；随后用户在 **Settings** &gt; **Apps** &gt; **Advanced Settings** 中启用它。请查看 [developer-mode Help Center article](https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta) 了解特定 plan 的 policy。

请向目标 ChatGPT workspace admin 请求 developer-mode access，并向目标 Platform organization owner/RBAC admin 请求 tunnel permissions。

## 将 tunnels 关联到正确的 organizations 和 workspaces

一个 tunnel 可以关联到一个或多个 Platform organizations 或 ChatGPT workspaces。使用这些 associations 来定义每个应该被允许发现或使用该 tunnel 的 OpenAI context。

- 包含拥有或管理该 tunnel 的 Platform organization。
- 包含应在 connector settings 中列出该 tunnel 的 ChatGPT workspace。
- 当 Codex、Responses API 或其他受支持产品将从另一个 Platform organization 调用私有 MCP server 时，包含该 Platform organization。
- 对 `tunnel-client` 使用同一个 `tunnel_id`；添加 organizations 或 workspaces 不会创建第二个 tunnel，也不会改变私有 MCP server endpoint。

对于个人账号，请使用属于该账号的 personal Platform organization。对于 ChatGPT 和 Codex 测试，请把 tunnel 关联到目标 ChatGPT workspace，以及 Codex 将使用的 Platform organization。只关联到 personal Platform organization 的 tunnel 不会自动出现在 Enterprise/Edu workspace 中。

如果 Platform organization 和 ChatGPT workspace 已经链接，你可以在 [Platform tunnel settings](https://platform.openai.com/settings/organization/tunnels) 中添加缺失的 organization 或 workspace。如果你的企业设置无法自动验证，例如 Platform organization 没有对应的 ChatGPT workspace，请联系你的 OpenAI account team，请求对应该使用该 tunnel 的 enterprise account mapping 进行经审核的 manual association override。

## 网络要求

`tunnel-client` 不需要入站互联网访问。它需要到 OpenAI 的出站 HTTPS，以及到私有 MCP server 的本地可达性：

| From                         | To                                                     | Used for                                                            |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| Host running `tunnel-client` | `api.openai.com:443` over HTTPS on `/v1/tunnel/*`      | 默认 polling 和 response posting。                                  |
| Host running `tunnel-client` | `mtls.api.openai.com:443` over HTTPS on `/v1/tunnel/*` | 配置 control-plane mTLS 时的 polling 和 response posting。           |
| Host running `tunnel-client` | 配置的 stdio command 或 MCP server URL                 | 从你的网络内部转发 MCP requests。                                    |

## 设置 tunnel-client

打开 [Platform tunnel settings](https://platform.openai.com/settings/organization/tunnels)，然后使用其中的下载链接，或使用来自 [openai/tunnel-client](https://github.com/openai/tunnel-client/releases/latest) 的最新公开 `tunnel-client` release。请让你的 runbook 指向 latest-release URL，而不是硬编码某个特定 release URL。

如果你已经有 binary，请从 `tunnel-client help quickstart` 开始。对于命名的本地 stdio profile，请使用：

```bash
export CONTROL_PLANE_API_KEY="sk-..."

tunnel-client init \
  --sample sample_mcp_stdio_local \
  --profile local-stdio \
  --tunnel-id tunnel_0123456789abcdef0123456789abcdef \
  --mcp-command "python /path/to/server.py"

tunnel-client doctor --profile local-stdio --explain
tunnel-client run --profile local-stdio
```

对于 HTTP MCP server，请使用 `--mcp-server-url https://mcp.internal.example.com/mcp` 代替 `--mcp-command`。

在创建或测试 connector 时，请保持 `tunnel-client run ...` 健康运行。Connector discovery 和 MCP tool calls 依赖正在运行的 client。



    位于 &lt;code&gt;/ui&lt;/code&gt; 的本地 admin UI 会显示正在运行的 client 是否健康、ready
    并已连接，便于你从 ChatGPT、Codex 或 API flow 测试之前确认状态。



## 选择在哪里运行 tunnel-client

在已经可以访问私有 MCP server 的同一 trust boundary 中运行 `tunnel-client`。常见部署模式包括：

- **Kubernetes sidecar：** 在同一个 Pod 中将 `tunnel-client` 放在 MCP server 旁边运行，并通过 `localhost` 连接。
- **专用 Kubernetes deployment：** 当 MCP server 已经可以通过私有 Service 访问时，单独运行 `tunnel-client`。
- **VM 或 systemd service：** 在能通过私有网络访问 MCP server 的主机上运行 `tunnel-client`。

## 从 ChatGPT 连接

打开 [ChatGPT connector settings](https://chatgpt.com/#settings/Connectors)，创建 custom connector，并在 **Connection** 下选择 **Tunnel**。当 ChatGPT 列出可用 tunnel 时选择一个，或者如果你已有有效 `tunnel_id`，也可以粘贴它。

如果 tunnel 没有出现在 ChatGPT 中，请确认该 tunnel 已关联到目标 ChatGPT workspace，而不只是 Platform organization，并确认 connector operator 拥有 Tunnels **Read** + **Use**。

## 安全和网络



    私有 MCP server 保持在客户控制的环境内部。
    `tunnel-client` 使用 runtime API key，并在需要时使用可选 control-plane mTLS，
    通过出站 HTTPS 访问 OpenAI。



- MCP server 地址保持私有，并且只会从运行 `tunnel-client` 的环境内部使用。
- `tunnel-client` 向 OpenAI tunnel control plane 认证；受支持的 OpenAI 产品使用 OpenAI-hosted tunnel endpoint。
- Tunnel access 遵循现有 organization 和 workspace context，而不是引入单独的 public ingress path。
- `tunnel-client` 支持企业网络要求，例如 outbound proxies、custom CA bundles、control-plane client certificates，以及 MCP-side `mTLS`。

### Logging boundaries

Secure MCP Tunnel 将 tunnel transport 与 app-level product logging 分开：

- Tunnel control-plane auth、long-poll / response traffic，以及单个 tunnel transport requests 不会由 tunnel path 作为 ChatGPT Compliance Platform app events 发出。
- Tunnel metadata changes 会通过 API Platform [Audit logs](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/audit_logs) surface 暴露为 `tunnel.created`、`tunnel.updated` 和 `tunnel.deleted`。
- 当 ChatGPT 通过 Secure MCP Tunnel 访问 custom app 时，tunnel 仍然只是 transport path。正常的 app-level compliance logging 仍适用于 app path，包括 app invocation logs 和 app auth lifecycle logs，例如 app 被 linked 或 unlinked 时的 `APP_AUTH_LOG`。

## Advanced: allowlisted HTTP callouts

Secure MCP Tunnel 还可以支持从受支持的 agent 或 API flows 到客户网络的窄范围 HTTP callouts。`tunnel-client` 包含一个嵌入式 MCP server Harpoon，它按 label 暴露已配置的 HTTP targets，并允许调用者通过 tunnel 调用它们，同时限制 request/response 大小。

当你需要访问一小组私有 REST endpoints 且不希望公开暴露它们时，请使用此功能。Harpoon 不是通用 proxy：调用者不能选择任意 hosts，请求也被限制在客户配置的 targets 和 methods 内。

## Troubleshooting

- **Tunnel 在 ChatGPT 中不可见：** 检查 tunnel 是否包含目标 ChatGPT workspace，而不只是 Platform organization；然后检查 connector operator 的 Tunnels **Use** permission。如果 enterprise account 的 workspace 无法自动链接，请联系你的 OpenAI account team，请求经审核的 manual association override。
- **Connector discovery 或 tool calls 失败：** 确认 `tunnel-client run ...` 仍在运行，然后重新运行 `tunnel-client doctor --profile &lt;name&gt; --explain`。
- **你可以检查 tunnel，但无法编辑它：** operator 可能拥有 Tunnels **Read**，但没有 Tunnels **Manage**。
- `tunnel-client` 暴露 `/healthz`、`/readyz`、`/metrics`，以及位于 `/ui` 的本地 admin UI。
- admin UI 默认仅 loopback 可访问。只有在你有意需要 operator network 访问它时，才远程暴露它。
- 在从 ChatGPT、Codex 或 API flow 测试之前，使用这些 surfaces 确认 client 健康、ready 且正在 polling。
- 如果 client 未连接，通过 tunnel 的请求会失败，直到 `tunnel-client` 重新连接。
- Raw HTTP logging 默认禁用，support exports 会被 redacted。

## OAuth

- OAuth discovery 可以通过 tunnel path 传输，因此 MCP server 本身可以保持私有。
- Tunnel 会保留 browser-facing OAuth flows 所需的 upstream authorization server metadata。
- Authorization server 本身不会自动被 tunneled。如果它无法从公网以及 `tunnel-client` host 访问，即使 MCP server 可访问，OAuth flow 仍可能失败。

## 在哪里配置

- 在 [Platform tunnel settings](https://platform.openai.com/settings/organization/tunnels) 中管理 OpenAI-hosted MCP tunnel endpoints。
- 从 [ChatGPT connector settings](https://chatgpt.com/#settings/Connectors) 创建 connector 时使用 tunnel。
- 对于 Codex 或 API flows，请使用受支持产品 surface 暴露的 tunnel-backed MCP target。

## 下一步

- 在 [Platform tunnel settings](https://platform.openai.com/settings/organization/tunnels) 中创建或管理 tunnel。
- 使用 `tunnel-client doctor --profile &lt;profile&gt; --explain` 验证你的 `tunnel-client` profile。
- 从 [ChatGPT connector settings](https://chatgpt.com/#settings/Connectors) 或你正在使用的受支持 OpenAI surface 连接 tunnel。




      &lt;img src="https://developers.openai.com/images/platform/guides/secure-mcp-tunnels/platform-tunnels-settings.png"
        alt="经过清理的 OpenAI Platform tunnel settings 截图。"
        loading="lazy"
        class="w-full rounded-md border border-gray-200 dark:border-gray-800"
      /&gt;


      从 Platform tunnel settings 创建和管理 OpenAI-hosted MCP tunnel
      endpoints。




      &lt;img src="https://developers.openai.com/images/platform/guides/secure-mcp-tunnels/chatgpt-connectors-tunnel.png"
        alt="经过清理且已选择 Tunnel 的 ChatGPT connector settings 截图。"
        loading="lazy"
        class="w-full rounded-md border border-gray-200 dark:border-gray-800"
      /&gt;


      将 ChatGPT connector 连接到私有 MCP server 时选择 Tunnel。




:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Secure MCP Tunnel lets you connect private MCP servers to supported OpenAI products without opening inbound firewall ports or exposing those servers to the public internet. Run `tunnel-client` inside the network that can already reach your MCP server; it opens an outbound HTTPS path to OpenAI, pulls queued MCP work, forwards requests locally, and returns responses through the same tunnel.

## What is an MCP tunnel?

An MCP tunnel is an outbound-only connection from a host inside your network to an OpenAI-hosted MCP endpoint. Use it when your MCP server is private, on-premises, or behind a firewall, but ChatGPT, Codex, the Responses API, or another supported OpenAI surface still needs to call it.

Secure MCP Tunnel keeps the MCP server private while giving supported OpenAI products a normal MCP request path. `tunnel-client` polls OpenAI for work, forwards MCP requests locally, and returns responses through the same tunnel.

## Use Secure MCP Tunnel when

- Your MCP server runs on a private network, on-premises, on a developer machine, or behind existing access controls.
- You want ChatGPT, Codex, the Responses API, or another supported OpenAI surface to use that server without making the MCP server public.
- Your network allows the host running `tunnel-client` to make outbound HTTPS requests to `api.openai.com:443` by default, or `mtls.api.openai.com:443` when control-plane mTLS is configured, and reach the private MCP server.
- Start with the [MCP and Connectors guide](https://developers.openai.com/api/docs/guides/tools-connectors-mcp) for general MCP concepts.

## How it works

1. Create or manage an OpenAI-hosted MCP tunnel endpoint in Platform tunnel settings.
2. Run `tunnel-client` inside the network that can reach your private MCP server.
3. Configure `tunnel-client` with the tunnel identity and the private MCP server address.
4. OpenAI products send MCP requests to the OpenAI-hosted tunnel endpoint.
5. `tunnel-client` long-polls for queued work, forwards each `JSON-RPC` request to the private MCP server, and posts the response back through the tunnel.

The private MCP server does not need a public listener. The OpenAI-hosted endpoint gives supported products a normal MCP request path, while the network initiation point stays inside your boundary. When a connector asks for streamed results, the tunnel path can forward intermediate server-sent events.

<figure className="not-prose my-8">
  <figcaption className="mt-3 text-sm text-gray-600 dark:text-gray-400">
    OpenAI products call the OpenAI-hosted tunnel endpoint; `tunnel-client`
    long-polls for queued work and returns the MCP response through the same
    tunnel.
  </figcaption>
</figure>

## Before you start

You need:

- A `tunnel_id` from [Platform tunnel settings](https://platform.openai.com/settings/organization/tunnels).
- A runtime API key for `tunnel-client`.
- An MCP server that `tunnel-client` can reach over stdio or HTTP from inside your network.

## Permissions and access

[Platform tunnel permissions](https://developers.openai.com/api/docs/guides/rbac) and ChatGPT developer-mode access are separate:

- Creating or editing a tunnel requires Tunnels **Read** + **Manage**.
- Running `tunnel-client` or selecting the tunnel in connector settings requires Tunnels **Read** + **Use**.
- Tunnel permissions apply to a Platform organization. A Platform organization owner or RBAC administrator grants the tunnel role.
- ChatGPT developer mode is a separate workspace permission. For Enterprise/Edu, a workspace admin grants **Permissions & Roles** > **Connected Data** > **Developer mode / Create custom MCP connectors**; the user then enables it in **Settings** > **Apps** > **Advanced Settings**. See the [developer-mode Help Center article](https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta) for plan-specific policy.

Ask the target ChatGPT workspace admin for developer-mode access, and ask the target Platform organization owner/RBAC admin for tunnel permissions.

## Associate tunnels with the right organizations and workspaces

A tunnel can be associated with one or more Platform organizations or ChatGPT workspaces. Use these associations to define every OpenAI context that should be allowed to find or use the tunnel.

- Include the Platform organization that owns or manages the tunnel.
- Include the ChatGPT workspace that should list the tunnel in connector settings.
- Include another Platform organization when Codex, the Responses API, or another supported product will call the private MCP server from that organization.
- Use the same `tunnel_id` for `tunnel-client`; adding organizations or workspaces does not create a second tunnel or change the private MCP server endpoint.

For personal accounts, use the personal Platform organization that belongs to that account. For ChatGPT and Codex testing, associate the tunnel with the target ChatGPT workspace and the Platform organization that Codex will use. A tunnel associated only with a personal Platform organization doesn't automatically appear in an Enterprise/Edu workspace.

If the Platform organization and ChatGPT workspace are already linked, you can add the missing organization or workspace in [Platform tunnel settings](https://platform.openai.com/settings/organization/tunnels). If your enterprise setup can't be verified automatically, such as when the Platform organization has no corresponding ChatGPT workspace, contact your OpenAI account team to request a reviewed manual association override for the enterprise account mapping that should use the tunnel.

## Network requirements

`tunnel-client` does not need inbound internet access. It needs outbound HTTPS to OpenAI and local reachability to the private MCP server:

| From                         | To                                                     | Used for                                                            |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| Host running `tunnel-client` | `api.openai.com:443` over HTTPS on `/v1/tunnel/*`      | Default polling and response posting.                               |
| Host running `tunnel-client` | `mtls.api.openai.com:443` over HTTPS on `/v1/tunnel/*` | Polling and response posting when control-plane mTLS is configured. |
| Host running `tunnel-client` | The configured stdio command or MCP server URL         | Forwarding MCP requests from inside your network.                   |

## Set up tunnel-client

Open [Platform tunnel settings](https://platform.openai.com/settings/organization/tunnels), then use the download link there or the latest public `tunnel-client` release from [openai/tunnel-client](https://github.com/openai/tunnel-client/releases/latest). Keep your runbook pointed at the latest-release URL instead of hard-coding a specific release URL.

If you already have a binary, start with `tunnel-client help quickstart`. For a named local stdio profile, use:

```bash
export CONTROL_PLANE_API_KEY="sk-..."

tunnel-client init \
  --sample sample_mcp_stdio_local \
  --profile local-stdio \
  --tunnel-id tunnel_0123456789abcdef0123456789abcdef \
  --mcp-command "python /path/to/server.py"

tunnel-client doctor --profile local-stdio --explain
tunnel-client run --profile local-stdio
```

For an HTTP MCP server, use `--mcp-server-url https://mcp.internal.example.com/mcp` instead of `--mcp-command`.

Keep `tunnel-client run ...` healthy while you create or test the connector. Connector discovery and MCP tool calls depend on the running client.

<figure className="not-prose my-8">
  <figcaption className="mt-3 text-sm text-gray-600 dark:text-gray-400">
    The local admin UI at <code>/ui</code> shows whether the running client is
    healthy, ready, and connected before you test from ChatGPT, Codex, or an API
    flow.
  </figcaption>
</figure>

## Choose where to run tunnel-client

Run `tunnel-client` in the same trust boundary that can already reach the private MCP server. Common deployment patterns are:

- **Kubernetes sidecar:** Run `tunnel-client` beside the MCP server in one Pod and connect over `localhost`.
- **Dedicated Kubernetes deployment:** Run `tunnel-client` separately when the MCP server is already reachable through a private Service.
- **VM or systemd service:** Run `tunnel-client` on a host that can reach the MCP server over private networking.

## Connect from ChatGPT

Open [ChatGPT connector settings](https://chatgpt.com/#settings/Connectors), create a custom connector, and choose **Tunnel** under **Connection**. Select an available tunnel when ChatGPT lists it, or paste a valid `tunnel_id` if you already have one.

If the tunnel does not appear in ChatGPT, verify that the tunnel is associated with the target ChatGPT workspace, not only with a Platform organization, and that the connector operator has Tunnels **Read** + **Use**.

## Security and networking

<figure className="not-prose my-8">
  <figcaption className="mt-3 text-sm text-gray-600 dark:text-gray-400">
    The private MCP server stays inside the customer-controlled environment.
    `tunnel-client` reaches OpenAI over outbound HTTPS using the runtime API key
    and, when required, optional control-plane mTLS.
  </figcaption>
</figure>

- The MCP server address stays private and is used only from inside the environment where `tunnel-client` runs.
- `tunnel-client` authenticates to the OpenAI tunnel control plane; supported OpenAI products use the OpenAI-hosted tunnel endpoint.
- Tunnel access follows the existing organization and workspace context instead of introducing a separate public ingress path.
- `tunnel-client` supports enterprise networking requirements such as outbound proxies, custom CA bundles, control-plane client certificates, and MCP-side `mTLS`.

### Logging boundaries

Secure MCP Tunnel separates tunnel transport from app-level product logging:

- Tunnel control-plane auth, long-poll / response traffic, and individual tunnel transport requests are not emitted as ChatGPT Compliance Platform app events by the tunnel path.
- Tunnel metadata changes are exposed through the API Platform [Audit logs](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/audit_logs) surface as `tunnel.created`, `tunnel.updated`, and `tunnel.deleted`.
- When ChatGPT reaches a custom app through Secure MCP Tunnel, the tunnel remains only the transport path. Normal app-level compliance logging still applies on the app path, including app invocation logs and app auth lifecycle logs such as `APP_AUTH_LOG` when the app is linked or unlinked.

## Advanced: allowlisted HTTP callouts

Secure MCP Tunnel can also support narrowly scoped HTTP callouts from supported agent or API flows into a customer network. `tunnel-client` includes an embedded MCP server, Harpoon, that exposes configured HTTP targets by label and lets callers invoke them through the tunnel with bounded request/response limits.

Use this when you need to reach a small set of private REST endpoints without exposing them publicly. Harpoon is not a general-purpose proxy: callers cannot choose arbitrary hosts, and requests are limited to the targets and methods configured by the customer.

## Troubleshooting

- **Tunnel not visible in ChatGPT:** Check that the tunnel includes the target ChatGPT workspace, not only a Platform organization; then check the connector operator's Tunnels **Use** permission. If the workspace cannot be linked automatically for an enterprise account, contact your OpenAI account team for a reviewed manual association override.
- **Connector discovery or tool calls fail:** Confirm that `tunnel-client run ...` is still running, then re-run `tunnel-client doctor --profile <name> --explain`.
- **You can inspect a tunnel but cannot edit it:** The operator likely has Tunnels **Read** but not Tunnels **Manage**.
- `tunnel-client` exposes `/healthz`, `/readyz`, `/metrics`, and a local admin UI at `/ui`.
- The admin UI is loopback-only by default. Expose it remotely only when you intentionally need an operator network to reach it.
- Use those surfaces to confirm that the client is healthy, ready, and polling before testing from ChatGPT, Codex, or an API flow.
- If the client is not connected, requests through the tunnel fail until `tunnel-client` reconnects.
- Raw HTTP logging is disabled by default, and support exports are redacted.

## OAuth

- OAuth discovery can travel through the tunnel path so the MCP server itself can remain private.
- The tunnel preserves the upstream authorization server metadata needed for browser-facing OAuth flows.
- The authorization server itself is not automatically tunneled. If it is unreachable from the public internet and from the `tunnel-client` host, the OAuth flow can still fail even when the MCP server is reachable.

## Where to configure it

- Manage OpenAI-hosted MCP tunnel endpoints in [Platform tunnel settings](https://platform.openai.com/settings/organization/tunnels).
- Use a tunnel when creating a connector from [ChatGPT connector settings](https://chatgpt.com/#settings/Connectors).
- For Codex or API flows, use the tunnel-backed MCP target exposed by the supported product surface.

## Next steps

- Create or manage the tunnel in [Platform tunnel settings](https://platform.openai.com/settings/organization/tunnels).
- Validate your `tunnel-client` profile with `tunnel-client doctor --profile <profile> --explain`.
- Connect the tunnel from [ChatGPT connector settings](https://chatgpt.com/#settings/Connectors) or the supported OpenAI surface you are using.

<div class="not-prose my-8 grid gap-4 lg:grid-cols-2">
  <figure>
    <a href="https://platform.openai.com/settings/organization/tunnels">
      <img src="https://developers.openai.com/images/platform/guides/secure-mcp-tunnels/platform-tunnels-settings.png"
        alt="Sanitized OpenAI Platform tunnel settings screenshot."
        loading="lazy"
        class="w-full rounded-md border border-gray-200 dark:border-gray-800"
      />
    </a>
    <figcaption class="mt-3 text-sm text-gray-600 dark:text-gray-400">
      Create and manage OpenAI-hosted MCP tunnel endpoints from Platform tunnel
      settings.
    </figcaption>
  </figure>
  <figure>
    <a href="https://chatgpt.com/#settings/Connectors">
      <img src="https://developers.openai.com/images/platform/guides/secure-mcp-tunnels/chatgpt-connectors-tunnel.png"
        alt="Sanitized ChatGPT connector settings screenshot with Tunnel selected."
        loading="lazy"
        class="w-full rounded-md border border-gray-200 dark:border-gray-800"
      />
    </a>
    <figcaption class="mt-3 text-sm text-gray-600 dark:text-gray-400">
      Select Tunnel when connecting a ChatGPT connector to a private MCP server.
    </figcaption>
  </figure>
</div>
``````
:::
:::

