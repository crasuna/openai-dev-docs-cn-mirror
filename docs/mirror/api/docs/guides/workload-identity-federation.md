---
title: "Workload identity federation 工作负载身份联合"
description: "Authenticate to OpenAI APIs with short-lived credentials through workload identity federation instead of storing static long-lived API keys."
outline: deep
---

# Workload identity federation 工作负载身份联合

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/workload-identity-federation](https://developers.openai.com/api/docs/guides/workload-identity-federation)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/workload-identity-federation.md](https://developers.openai.com/api/docs/guides/workload-identity-federation.md)
- 抓取时间：2026-06-27T05:54:12.101Z
- Checksum：`ce9023789458194fe5441a614d706585b46aff0c223b25bbcea36e56fbe3536e`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Workload identity federation 允许受信任的 workloads 将外部签发的 identity tokens 交换为短期 OpenAI access tokens。使用这些指南来配置外部 identity provider、创建 OpenAI service account mappings，并在不存储长期 API keys 的情况下对 workloads 进行身份验证。

有关 token exchange 请求和响应详情、授权行为以及当前限制，请参阅 [workload identity token exchange reference](/mirror/api/reference/workload-identity-federation)。

## 工作原理

Workload identity federation 包含四个部分：

1. **workload identity provider** 描述受信任的 issuer。它存储预期的 OIDC issuer、audience，以及用于验证外部 subject tokens 的 key source。
2. **service account mapping** 授权特定的外部 token attributes，为项目内某个 OpenAI service account 铸造 tokens。
3. **token exchange** 请求将外部 subject token 发送给 OpenAI，并返回一个短期 OpenAI access token。
4. workload 使用 OpenAI 签发的 access token 作为 bearer credential，对 OpenAI API requests 进行身份验证。

你必须是 organization owner 才能配置此功能。要访问它，请前往 [Organization Settings &gt; Security &gt; Workload Identity Provider](https://platform.openai.com/settings/organization/security/workload-identity-provider)。请从 workload identity provider 详情页配置 service account mappings。

## 选择设置指南

从与你的 workload 运行位置相匹配的指南开始：




OpenAI 支持文档化配置中的 OIDC-compatible JWT subject tokens，包括 SPIFFE JWT-SVIDs。如果你需要未列出的 OIDC provider，请联系我们。

每个 provider guide 都会说明如何在该平台上签发和检查 subject token，以及如何配置 OpenAI SDK 将其交换为短期 OpenAI access token。

## 配置 Workload Identity Provider

为每个你信任的外部 issuer 创建一个 Workload Identity Provider。Workload identity federation 支持 OIDC JWT subject tokens。

Workload Identity Provider 配置包含以下 dashboard 选项：

| Option                                   | Description                                                                                                                                        |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                                     | 你组织中 Workload Identity Provider 的唯一名称。                                                                                                   |
| OIDC Issuer URL                          | 预期的 OIDC issuer URL。Issuer 比较会忽略尾部斜杠。                                                                                               |
| Audience                                 | 外部 subject token 上预期的 `aud` claim。                                                                                                         |
| Description                              | Workload Identity Provider 的可选描述。                                                                                                           |
| Use uploaded JWKS for token verification | 启用后，OpenAI 会根据上传的 JWKS 验证 tokens，而不是从 OIDC discovery 获取 keys。                                                                  |
| JWKS JSON                                | 启用 uploaded JWKS verification 时使用的已上传 public JWKS object。JWKS 必须包含非空 `keys` array，并且不得包含 private key material。             |
| Attribute transformations                | 可选 CEL expressions，用于从 token claims 派生自定义 `openai.*` attributes，以供 mapping decisions 使用。                                          |

### 使用 CEL 转换 token claims

Attribute transformations 使用 Common Expression Language（CEL）。OpenAI 支持 [langdef.md](https://github.com/google/cel-spec/blob/master/doc/langdef.md) 中指定的标准 CEL operators，并且不添加 workload identity federation 专用的自定义 functions。每个 expression 会收到一个 root object：

- `assertion`：已验证的 JWT claim set。

在 dashboard 中，`openai.` prefix 会自动应用。请输入后缀（例如 `subject`）和 expression（例如 `assertion.sub`）。API 会将派生 attribute 存储为 `openai.subject`。

```json
[
  {
    "attribute": "openai.subject",
    "expression": "assertion.sub"
  },
  {
    "attribute": "openai.repository",
    "expression": "assertion.repository"
  }
]
```

请使用 CEL 语言规范定义的 CEL 语法。例如，你可以使用 `assertion.sub` 或 `assertion.repository` 等 expressions 读取 claim values。不支持的语法或 functions 会导致 mapping resolution 失败。

```json
[
  {
    "attribute": "openai.repository_ref",
    "expression": "assertion.repository + \"@\" + assertion.ref"
  },
  {
    "attribute": "openai.production",
    "expression": "assertion.ref == \"refs/heads/main\""
  }
]
```

Transformation results 必须是 scalar values：strings、booleans、integers 或有限 numbers。Arrays、objects、null values 和 evaluation errors 会导致 mapping resolution 失败。OpenAI 会先将 scalar transformation results 转换为 strings，再与 mapping values 比较。例如，`true` 会变为 `"true"`，`7` 会变为 `"7"`。

以 `openai.` 开头的 mapping keys 只会从 attribute transformations 中解析。已经使用 `openai.` prefix 的原始 subject token claims 不会影响 mapping decisions，除非你配置了匹配的 transformation。

### 管理 JWKS 和 key rotation

OpenAI 会使用 Workload Identity Provider 上配置的 key source 来验证 OIDC subject tokens。

- **OIDC discovery：** OpenAI 获取 issuer 的 `/.well-known/openid-configuration`，然后获取 discovery 得到的 `jwks_uri`。Discovery documents 和 remote JWKS payloads 会缓存 600 秒。
- **Key refresh on miss：** 如果在缓存的 JWKS 中找不到 token `kid`，OpenAI 会刷新 JWKS 并再次尝试查找，然后才拒绝 token。
- **Uploaded JWKS：** 启用 **Use uploaded JWKS for token verification** 后，OpenAI 会使用 Workload Identity Provider 上存储的 uploaded JWKS，并且不会执行 OIDC discovery 或 remote JWKS fetching。在 provider update 保存并可用于 token exchange 后，新的 exchanges 会使用保存的 JWKS。
- **Multiple keys：** 一个 JWKS 可以包含多个 public keys，每个 key 都必须有唯一且非空的 `kid`。

在 signing-key rotation 期间，请在 rotation window 内把旧 public key 和新 public key 都发布到 issuer JWKS 中。这样，旧 key 签名的 tokens 可以继续工作，同时 OpenAI 也会接受新 key 签名的 tokens。对于 uploaded JWKS 模式，请在使用新的 `kid` 签发 tokens 之前更新 Workload Identity Provider JWKS；OpenAI 会拒绝由未包含在已配置 JWKS 中的 key 签名的 tokens。

## 配置 service account mappings

service account mapping 定义哪些外部 identities 可以为 OpenAI service account 铸造 access tokens。

Mapping 配置包含以下 dashboard 选项：

| Option          | Description                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name            | Workload Identity Provider 中 mapping 的唯一名称。                                                                                                          |
| Key             | 要匹配的 attribute key。使用原始 token claim，例如 `sub`、`aud` 或 `iss`，也可以使用 `openai.subject` 这样的派生 attribute。                                |
| Value           | OpenAI 签发 token 前必须匹配的 attribute value。                                                                                                            |
| Description     | mapping 的可选描述。                                                                                                                                         |
| Project         | 拥有目标 service account 的 project。                                                                                                                        |
| Service account | workload 可使用的 service account。你可以在所选 project 中创建新的 service account，或选择现有 service account。                                            |
| Permissions     | 可选 API permissions，用于进一步缩小此 mapping 铸造出的 access tokens 的权限。这些 permissions 不能授予超出 mapped service account 的访问能力。              |

Attribute assertion values 必须是 scalar JSON values。String values 可以使用一个尾随 wildcard，例如 `repo:example/*`。wildcard 必须有非空 prefix；不支持单独的 `*`。

有效 wildcard values：

- `repo:openai/*`
- `repository:my-org/*`

无效 wildcard values：

- `*`
- `repo:*:prod`
- `repo/*/main`

dashboard 会将 mapping-level restrictions 显示为 **Permissions**。Token exchange responses 会在 `scope` property 中以 OAuth scopes 形式暴露相同 restrictions。Admin API scopes 不能分配给 Workload Identity Provider mappings，并且 OpenAI 铸造 token 后，downstream API authorization 仍然适用。

### Mapping resolution 示例

Mapping resolution 会在 OpenAI 验证外部 subject token 之后开始。OpenAI 会查找所请求 `identity_provider_id` 和 `service_account_id` 的 mappings，跳过 disabled mappings，只评估每个 mapping 所需的 attributes，并且只有在恰好一个 enabled mapping 匹配所有已配置 attributes 时才签发 token。

例如，一个 GitHub Actions token 可能包含以下 claims：

```json
{
  "iss": "https://token.actions.githubusercontent.com",
  "aud": "https://api.openai.com/v1",
  "sub": "repo:my-org/my-repo:ref:refs/heads/main",
  "repository": "my-org/my-repo",
  "ref": "refs/heads/main"
}
```

Workload Identity Provider 可以定义一个派生 attribute：

```json
[
  {
    "attribute": "openai.repository_ref",
    "expression": "assertion.repository + \"@\" + assertion.ref"
  }
]
```

然后，service account mapping 可以同时要求原始和派生 attributes：

| Key                     | Value                                         |
| ----------------------- | --------------------------------------------- |
| `iss`                   | `https://token.actions.githubusercontent.com` |
| `sub`                   | `repo:my-org/my-repo:*`                       |
| `openai.repository_ref` | `my-org/my-repo@refs/heads/main`              |

只有三个 attributes 全部匹配时，此 mapping 才匹配。`sub` value 使用了尾随 wildcard，因此会匹配任何具有 `repo:my-org/my-repo:` prefix 的值。`openai.repository_ref` key 从 attribute transformation 解析；OpenAI 不会使用名为 `openai.repository_ref` 的原始 token claim。

如果同一个 token exchange 匹配多个 enabled mappings，OpenAI 会拒绝该 exchange。OpenAI 会对每个 `(provider, service account)` pair 强制执行唯一 mapping，并且不会跨多个 mappings 合并 permissions。

## 安全建议

- 为每个 application 或 workload 使用专用 OpenAI service account。
- 分离 production 和 non-production 环境。
- 优先使用精确 claim matching，而不是宽泛的 attribute patterns。
- 只授予所需的最低 OpenAI permissions。
- 定期审查并移除未使用的 mappings。
- 监控 token exchange failures 和异常 access patterns。
- 避免在无关 workloads 之间共享 identities。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Workload identity federation lets trusted workloads exchange externally issued identity tokens for short-lived OpenAI access tokens. Use these guides to configure your external identity provider, create OpenAI service account mappings, and authenticate workloads without storing long-lived API keys.

For token exchange request and response details, authorization behavior, and current limitations, see the [workload identity token exchange reference](https://developers.openai.com/api/reference/workload-identity-federation).

## How it works

Workload identity federation has four parts:

1. A **workload identity provider** describes the trusted issuer. It stores the expected OIDC issuer, audience, and key source used to verify external subject tokens.
2. A **service account mapping** authorizes specific external token attributes to mint tokens for a particular OpenAI service account within a project.
3. A **token exchange** request sends the external subject token to OpenAI and returns a short-lived OpenAI access token.
4. The workload uses the OpenAI-issued access token as a bearer credential to authenticate requests to the OpenAI API.

You must be an organization owner to configure this feature. To access it, go to [Organization Settings > Security > Workload Identity Provider](https://platform.openai.com/settings/organization/security/workload-identity-provider). Configure service account mappings from the workload identity provider details page.

## Choose a setup guide

Start with the guide that matches where your workload runs:

<div className="my-4 w-full max-w-full overflow-hidden">
  </div>

OpenAI supports OIDC-compatible JWT subject tokens in the documented configurations, including SPIFFE JWT-SVIDs. If you need an OIDC provider that isn't listed, contact us.

Each provider guide shows how to issue and inspect a subject token on that platform, and how to configure the OpenAI SDK to exchange it for a short-lived OpenAI access token.

## Configure a Workload Identity Provider

Create a Workload Identity Provider for each external issuer you trust. Workload identity federation supports OIDC JWT subject tokens.

Workload Identity Provider configuration includes these dashboard options:

| Option                                   | Description                                                                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name                                     | A unique name for the Workload Identity Provider in your organization.                                                                                       |
| OIDC Issuer URL                          | The expected OIDC issuer URL. Issuer comparisons ignore a trailing slash.                                                                                    |
| Audience                                 | The expected `aud` claim on the external subject token.                                                                                                      |
| Description                              | Optional description for the Workload Identity Provider.                                                                                                     |
| Use uploaded JWKS for token verification | When enabled, OpenAI verifies tokens against an uploaded JWKS instead of fetching keys from OIDC discovery.                                                  |
| JWKS JSON                                | The uploaded public JWKS object used when uploaded JWKS verification is enabled. The JWKS must contain a non-empty `keys` array and no private key material. |
| Attribute transformations                | Optional CEL expressions that derive custom `openai.*` attributes from token claims for mapping decisions.                                                   |

### Transform token claims with CEL

Attribute transformations use Common Expression Language (CEL). OpenAI supports the standard CEL operators specified in [langdef.md](https://github.com/google/cel-spec/blob/master/doc/langdef.md) and doesn't add custom workload identity federation-specific functions. Each expression receives one root object:

- `assertion`: The verified JWT claim set.

In the dashboard, the `openai.` prefix is applied automatically. Enter the suffix, such as `subject`, and an expression, such as `assertion.sub`. The API stores the derived attribute as `openai.subject`.

```json
[
  {
    "attribute": "openai.subject",
    "expression": "assertion.sub"
  },
  {
    "attribute": "openai.repository",
    "expression": "assertion.repository"
  }
]
```

Use CEL syntax defined by the CEL language specification. For example, you can read claim values with expressions such as `assertion.sub` or `assertion.repository`. Unsupported syntax or functions fail mapping resolution.

```json
[
  {
    "attribute": "openai.repository_ref",
    "expression": "assertion.repository + \"@\" + assertion.ref"
  },
  {
    "attribute": "openai.production",
    "expression": "assertion.ref == \"refs/heads/main\""
  }
]
```

Transformation results must be scalar values: strings, booleans, integers, or finite numbers. Arrays, objects, null values, and evaluation errors fail mapping resolution. OpenAI converts scalar transformation results to strings before comparing them to mapping values. For example, `true` becomes `"true"` and `7` becomes `"7"`.

Mapping keys that start with `openai.` resolve only from attribute transformations. Raw subject token claims that already use an `openai.` prefix don't affect mapping decisions unless you configure a matching transformation.

### Manage JWKS and key rotation

OpenAI verifies OIDC subject tokens with the key source configured on the Workload Identity Provider.

- **OIDC discovery:** OpenAI fetches the issuer's `/.well-known/openid-configuration`, then fetches the discovered `jwks_uri`. Discovery documents and remote JWKS payloads are cached for 600 seconds.
- **Key refresh on miss:** If a token `kid` isn't found in the cached JWKS, OpenAI refreshes the JWKS and tries the lookup again before rejecting the token.
- **Uploaded JWKS:** When **Use uploaded JWKS for token verification** is enabled, OpenAI uses the uploaded JWKS stored on the Workload Identity Provider and doesn't perform OIDC discovery or remote JWKS fetching. After a provider update is saved and available to token exchange, new exchanges use the saved JWKS.
- **Multiple keys:** A JWKS can contain multiple public keys, and each key must have a unique non-empty `kid`.

During signing-key rotation, publish both old and new public keys in the issuer JWKS during the rotation window. This lets tokens signed by the old key continue working while OpenAI accepts tokens signed by the new key. For uploaded JWKS mode, update the Workload Identity Provider JWKS before issuing tokens with the new `kid`; OpenAI rejects tokens signed by a key absent from the configured JWKS.

## Configure service account mappings

A service account mapping defines which external identities can mint access tokens for an OpenAI service account.

Mapping configuration includes these dashboard options:

| Option          | Description                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name            | A unique name for the mapping within the Workload Identity Provider.                                                                                         |
| Key             | The attribute key to match. Use a raw token claim, such as `sub`, `aud`, or `iss`, or a derived attribute like `openai.subject`.                             |
| Value           | The attribute value that must match before OpenAI issues a token.                                                                                            |
| Description     | Optional description for the mapping.                                                                                                                        |
| Project         | The project that owns the target service account.                                                                                                            |
| Service account | The service account the workload can use. You can create a new service account in the selected project or select an existing service account.                |
| Permissions     | Optional API permissions that further narrow access tokens minted from this mapping. These permissions can't grant access beyond the mapped service account. |

Attribute assertion values must be scalar JSON values. String values may use one trailing wildcard, such as `repo:example/*`. The wildcard must have a non-empty prefix; `*` by itself isn't supported.

Valid wildcard values:

- `repo:openai/*`
- `repository:my-org/*`

Invalid wildcard values:

- `*`
- `repo:*:prod`
- `repo/*/main`

The dashboard shows mapping-level restrictions as **Permissions**. Token exchange responses expose the same restrictions as OAuth scopes in the `scope` property. Admin API scopes can't be assigned to Workload Identity Provider mappings, and downstream API authorization still applies after OpenAI mints a token.

### Mapping resolution example

Mapping resolution starts after OpenAI verifies the external subject token. OpenAI looks up mappings for the requested `identity_provider_id` and `service_account_id`, skips disabled mappings, evaluates only the attributes needed by each mapping, and issues a token only if exactly one enabled mapping matches all configured attributes.

For example, a GitHub Actions token might contain these claims:

```json
{
  "iss": "https://token.actions.githubusercontent.com",
  "aud": "https://api.openai.com/v1",
  "sub": "repo:my-org/my-repo:ref:refs/heads/main",
  "repository": "my-org/my-repo",
  "ref": "refs/heads/main"
}
```

The Workload Identity Provider can define a derived attribute:

```json
[
  {
    "attribute": "openai.repository_ref",
    "expression": "assertion.repository + \"@\" + assertion.ref"
  }
]
```

Then a service account mapping can require both raw and derived attributes:

| Key                     | Value                                         |
| ----------------------- | --------------------------------------------- |
| `iss`                   | `https://token.actions.githubusercontent.com` |
| `sub`                   | `repo:my-org/my-repo:*`                       |
| `openai.repository_ref` | `my-org/my-repo@refs/heads/main`              |

This mapping matches only when all three attributes match. The `sub` value uses a trailing wildcard, so it matches any value with the prefix `repo:my-org/my-repo:`. The `openai.repository_ref` key resolves from the attribute transformation; OpenAI doesn't use a raw token claim named `openai.repository_ref`.

If multiple enabled mappings match the same token exchange, OpenAI rejects the exchange. OpenAI enforces a unique mapping for each `(provider, service account)` pair and doesn't combine permissions across multiple mappings.

## Security recommendations

- Use a dedicated OpenAI service account for each application or workload.
- Separate production and non-production environments.
- Prefer exact claim matching over broad attribute patterns.
- Grant only the minimum OpenAI permissions required.
- Review and remove unused mappings regularly.
- Monitor token exchange failures and unexpected access patterns.
- Avoid sharing identities across unrelated workloads.
``````
:::
:::

