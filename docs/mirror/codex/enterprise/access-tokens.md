---
title: "访问令牌"
description: "Create and manage access tokens for Codex programmatic workflows"
outline: deep
---

# 访问令牌

**文档集**：Codex 编码智能体<br>
**分组**：Codex — 企业<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/codex/enterprise/access-tokens](https://developers.openai.com/codex/enterprise/access-tokens)
- Markdown 来源：[https://developers.openai.com/codex/enterprise/access-tokens.md](https://developers.openai.com/codex/enterprise/access-tokens.md)
- 抓取时间：2026-06-27T05:54:56.442Z
- Checksum：`433b517f8fa3dc9b806784abe3968a74be6f8378621f7b23121bec101792db8f`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Codex 访问令牌是限定在 Codex 权限范围内的 ChatGPT 访问令牌，可让受信任的自动化以 ChatGPT workspace 身份在本地运行 Codex。当脚本、定时作业或 CI runner 需要可重复、非交互式的 Codex 访问时，请使用它们。

Codex 访问令牌目前支持 ChatGPT Business 和 Enterprise workspace。

访问令牌在 ChatGPT 管理控制台的 [Access tokens](https://chatgpt.com/admin/access-tokens) 页面创建。它们绑定到创建它们的 ChatGPT 用户和 workspace，Codex 会将它们用作程序化本地工作流的 agent 身份。

如果 Platform API key 已能满足你的自动化需求，请继续使用 API key 认证。当工作流明确需要 ChatGPT workspace 访问、ChatGPT 管理的 Codex 权益，或企业 workspace 控制时，再使用 Codex 访问令牌。

需要从你自己的系统触发已发布的 ChatGPT workspace agent？请改用 Workspace Agents API 的 Workspace Agent 访问令牌。Codex 访问令牌用于认证 Codex 本地工作流；它们不能认证 workspace agent 触发调用。请参阅[使用 Workspace Agent 访问令牌进行认证](/mirror/workspace-agents/authentication)。

## 访问令牌的工作方式

当 Codex 需要在无需用户完成浏览器登录的情况下运行时，请使用访问令牌。该令牌代表创建它的 ChatGPT workspace 用户，因此运行可以使用该用户的 Codex 访问权限，并出现在 workspace 治理数据中。

Codex 会在运行开始时检查令牌，并将该运行绑定到对应的 workspace 身份。请像处理其他自动化密钥一样处理该令牌：将其存放在密钥管理器中，避免写入日志，并定期轮换。

访问令牌适用于：

- 从受信任自动化运行的 `codex exec` 作业。
- 需要可重复、非交互式 Codex 运行的本地脚本。
- 企业工作流，其中使用情况应关联到 ChatGPT workspace 用户，而不是 API 组织 key。

需要避免的主要风险：

- **密钥泄露：** 任何持有令牌的人都可以以令牌创建者身份启动 Codex 运行。请将令牌存放在密钥管理器中，避免写入日志，并定期轮换。
- **不受信任的 runner：** 公共 CI、fork 的 pull request 或共享机器可能会把令牌暴露给 workspace 外部人员。仅在受信任的 runner 上使用访问令牌。
- **共享身份：** 将某个人的令牌复用于不相关团队会让所有权和审计轨迹更难解释。请为特定工作流负责人创建令牌。
- **过期凭据未清理：** 长期有效的令牌可能在工作流变更后仍保持活跃。优先使用有限过期时间，并撤销不再使用的令牌。
- **凭据类型错误：** Codex 访问令牌用于 Codex 本地工作流。触发已发布的 ChatGPT workspace agent 时请使用 Workspace Agent 访问令牌；通用 OpenAI API 调用请使用 Platform API key。

## 启用访问令牌创建

在 workspace 设置中使用访问令牌权限，为获准成员开启访问令牌创建。

&lt;CodexScreenshot
  alt="ChatGPT workspace RBAC 设置中的访问令牌访问权限"
  lightSrc="/images/codex/enterprise/rbac_access_token_access_permission.png"
  darkSrc="/images/codex/enterprise/rbac_access_token_access_permission_dark.png"
  maxWidth={847}
  variant="no-wallpaper"
/&gt;

1. 前往 [Workspace Settings &gt; Permissions & roles](https://chatgpt.com/admin/settings)。
2. 在 **Access tokens** 区域中，如果所有获准成员都应能够创建访问令牌，请开启 **Allow users to create access tokens**。
3. 如果成员需要将这些令牌用于 Codex app、CLI 或 IDE 扩展，请确保 **Codex Local** 区域中的 **Allow members to use Codex Local** 也已开启。

请将访问令牌创建权限限制给了解令牌存放位置、哪些自动化会使用令牌以及如何轮换令牌的人员或服务负责人。

## 设置访问令牌过期上限

Workspace owners 和 admins 可以设置成员创建 Codex 访问令牌时可选择的最长过期时间。前往 [Workspace Settings &gt; Permissions & roles](https://chatgpt.com/admin/settings)，然后在 Codex Local 区域中设置 **Access token expiration limit**。

&lt;CodexScreenshot
  alt="ChatGPT workspace 权限设置中的访问令牌过期上限"
  lightSrc="/images/codex/enterprise/access_token_expiration_limit.png"
  darkSrc="/images/codex/enterprise/access_token_expiration_limit_dark.png"
  maxWidth={847}
  variant="no-wallpaper"
/&gt;

该上限适用于新的访问令牌。现有令牌会保留其当前过期时间。

## 创建访问令牌

使用 Access tokens 页面为令牌命名并选择其过期时间。

1. 前往 [Access tokens](https://chatgpt.com/admin/access-tokens)。
2. 选择 **Create**。

&lt;CodexScreenshot
  alt="带有 Create 按钮的 Access tokens 页面"
  lightSrc="/images/codex/enterprise/access_token_create_header.png"
  darkSrc="/images/codex/enterprise/access_token_create_header_dark.png"
  maxWidth={942}
  variant="no-wallpaper"
/&gt;

3. 输入描述性名称，例如 `release-ci` 或 `nightly-docs-check`。

&lt;CodexScreenshot
  alt="包含名称和过期时间字段的创建访问令牌模态框"
  lightSrc="/images/codex/enterprise/access_token_creation_modal.png"
  darkSrc="/images/codex/enterprise/access_token_creation_modal_dark.png"
  maxWidth={544}
  variant="no-wallpaper"
/&gt;

4. 选择过期时间。优先选择有限过期时间，例如 7、30、60 或 90 天。如果选择 **No expiration**，请按固定计划轮换令牌。
5. 选择 **Create**。
6. 立即复制生成的访问令牌。关闭模态框后，你将无法再次查看它。
7. 将令牌存放在密钥管理器或 CI secret 存储中。

最短的自定义过期时间为一天。已撤销和已过期的令牌不能用于启动新的 Codex 运行。

## 在 Codex CLI 中使用访问令牌

对于临时自动化，请将令牌存放在 `CODEX_ACCESS_TOKEN` 中，并照常运行 Codex：

```bash
export CODEX_ACCESS_TOKEN="<access-token>"
codex exec --json "review this repository and summarize the top risks"
```

对于持久本地登录，请将令牌通过管道传给 `codex login --with-access-token`：

```bash
printf '%s' "$CODEX_ACCESS_TOKEN" | codex login --with-access-token
codex exec "summarize the last release diff"
```

`codex login --with-access-token` 会在 Codex 认证存储中保存一个 agent 身份凭据。如果你不希望在机器上持久保存凭据，请改用 `CODEX_ACCESS_TOKEN` 环境变量。

## 轮换或撤销令牌

轮换访问令牌的方式与轮换其他自动化密钥相同：

1. 创建替代令牌。
2. 更新 runner、scheduler 或密钥管理器中的 secret。
3. 使用新令牌运行一次 smoke test。
4. 从 [Access tokens](https://chatgpt.com/admin/access-tokens) 撤销旧令牌。

在 Access tokens 页面中，workspace owners 和 admins 可以撤销 workspace 中的任何令牌。拥有访问令牌权限的成员只能撤销自己创建的令牌。

## 权限模型

访问令牌创建由 workspace 的访问令牌权限控制，该权限独立于通用 Codex local 权限。成员可以有权访问 Codex app、CLI 或 IDE 扩展，但不一定被允许创建访问令牌。

| 能力 | Workspace owners 和 admins | 拥有访问令牌权限的成员 | 没有访问令牌权限的成员 |
| ------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| 打开 [Access tokens](https://chatgpt.com/admin/access-tokens) | 是 | 是 | 否 |
| 创建访问令牌 | 是，针对自己的 ChatGPT workspace 身份 | 是，针对自己的 ChatGPT workspace 身份 | 否 |
| 列出访问令牌 | Workspace 列表，包括每个令牌的创建者 | 仅限自己创建的令牌 | 否 |
| 从 Access tokens 页面撤销访问令牌 | Workspace 中的任何令牌 | 仅限自己创建的令牌 | 无页面访问权限 |
| 授予或移除访问令牌权限 | 是 | 否 | 否 |
| 管理其他 Codex 企业设置 | 是，取决于管理员角色和 Codex 管理员权限 | 否，除非单独授予 | 否 |

简而言之：workspace owners 和 admins 在 workspace 级别管理访问权限。成员需要访问令牌权限才能创建和管理自己的令牌，但该权限不会授予管理员权限，也不会授予访问其他成员令牌的权限。

## 故障排查

### Access tokens 页面返回 404 或 forbidden

请让 workspace owner 或 admin 确认你的角色包含 **Allow users to create access tokens**，并且如果你计划将令牌用于 Codex，**Allow members to use Codex Local** 已启用。

### `codex login --with-access-token` 失败

确认你复制的是生成的访问令牌，而不是浏览器会话令牌或 Platform API key。还要确认该令牌尚未过期或被撤销。

## 相关文档

- [Authentication](/mirror/codex/auth)
- [Non-interactive mode](/mirror/codex/noninteractive)
- [Admin setup](/mirror/codex/enterprise/admin-setup)
- [Governance](/mirror/codex/enterprise/governance)

:::

## English source

::: details 展开英文原文
::: v-pre
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
  workspace agent trigger calls. See [Authenticate with Workspace Agent access tokens](/mirror/workspace-agents/authentication).

## How access tokens work

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

## Enable access token creation

Use the access token permission in workspace settings to turn on access token creation for allowed members.

&lt;CodexScreenshot
  alt="Access token access permission in ChatGPT workspace RBAC settings"
  lightSrc="/images/codex/enterprise/rbac_access_token_access_permission.png"
  darkSrc="/images/codex/enterprise/rbac_access_token_access_permission_dark.png"
  maxWidth={847}
  variant="no-wallpaper"
/&gt;

1. Go to [Workspace Settings &gt; Permissions & roles](https://chatgpt.com/admin/settings).
2. In the **Access tokens** section, turn on **Allow users to create access tokens** if all allowed members should be able to create access tokens.
3. If members need to use those tokens with the Codex app, CLI, or IDE extension, make sure **Allow members to use Codex Local** is also turned on in the **Codex Local** section.

Keep access token creation limited to people or service owners who understand where the token will be stored, which automation will use it, and how it will be rotated.

## Set an access token expiration limit

Workspace owners and admins can set the longest expiration that members can choose when they create a Codex access token. Go to [Workspace Settings &gt; Permissions & roles](https://chatgpt.com/admin/settings), then set **Access token expiration limit** in the Codex Local section.

&lt;CodexScreenshot
  alt="Access token expiration limit in ChatGPT workspace permissions settings"
  lightSrc="/images/codex/enterprise/access_token_expiration_limit.png"
  darkSrc="/images/codex/enterprise/access_token_expiration_limit_dark.png"
  maxWidth={847}
  variant="no-wallpaper"
/&gt;

The limit applies to new access tokens. Existing tokens keep their current expiration.

## Create an access token

Use the Access tokens page to name the token and choose when it expires.

1. Go to [Access tokens](https://chatgpt.com/admin/access-tokens).
2. Select **Create**.

&lt;CodexScreenshot
  alt="Access tokens page with the Create button"
  lightSrc="/images/codex/enterprise/access_token_create_header.png"
  darkSrc="/images/codex/enterprise/access_token_create_header_dark.png"
  maxWidth={942}
  variant="no-wallpaper"
/&gt;

3. Enter a descriptive name, such as `release-ci` or `nightly-docs-check`.

&lt;CodexScreenshot
  alt="Create access token modal with fields for name and expiration"
  lightSrc="/images/codex/enterprise/access_token_creation_modal.png"
  darkSrc="/images/codex/enterprise/access_token_creation_modal_dark.png"
  maxWidth={544}
  variant="no-wallpaper"
/&gt;

4. Choose an expiration. Prefer a finite expiration such as 7, 30, 60, or 90 days. If you choose **No expiration**, rotate the token on a regular schedule.
5. Select **Create**.
6. Copy the generated access token immediately. You cannot view it again after you close the modal.
7. Store the token in your secret manager or CI secret store.

The shortest custom expiration is one day. Revoked and expired tokens cannot be used to start new Codex runs.

## Use an access token with Codex CLI

For ephemeral automation, store the token in `CODEX_ACCESS_TOKEN` and run Codex normally:

```bash
export CODEX_ACCESS_TOKEN="<access-token>"
codex exec --json "review this repository and summarize the top risks"
```

For a persistent local login, pipe the token to `codex login --with-access-token`:

```bash
printf '%s' "$CODEX_ACCESS_TOKEN" | codex login --with-access-token
codex exec "summarize the last release diff"
```

`codex login --with-access-token` stores an agent identity credential in Codex auth storage. If you prefer not to persist credentials on the machine, use the `CODEX_ACCESS_TOKEN` environment variable instead.

## Rotate or revoke a token

Rotate access tokens the same way you rotate other automation secrets:

1. Create a replacement token.
2. Update the secret in the runner, scheduler, or secret manager.
3. Run a smoke test with the new token.
4. Revoke the old token from [Access tokens](https://chatgpt.com/admin/access-tokens).

From the Access tokens page, workspace owners and admins can revoke any workspace token. Members with access token permission can revoke only the tokens they created.

## Permission model

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

## Troubleshooting

### The access tokens page returns 404 or forbidden

Ask a workspace owner or admin to confirm that your role includes **Allow users to create access tokens** and that **Allow members to use Codex Local** is enabled if you plan to use the token with Codex.

### `codex login --with-access-token` fails

Confirm that you copied the generated access token, not a browser session token or Platform API key. Also confirm that the token has not expired or been revoked.

## Related docs

- [Authentication](/mirror/codex/auth)
- [Non-interactive mode](/mirror/codex/noninteractive)
- [Admin setup](/mirror/codex/enterprise/admin-setup)
- [Governance](/mirror/codex/enterprise/governance)

:::
:::

