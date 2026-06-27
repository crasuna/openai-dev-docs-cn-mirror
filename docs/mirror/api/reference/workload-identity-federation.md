---
title: "Workload identity token exchange"
description: "Exchange a trusted workload identity token for a short-lived OpenAI API credential."
outline: deep
---

# Workload identity token exchange

**文档集**：API Reference  
**分组**：OpenAI API — Reference  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/reference/workload-identity-federation](https://developers.openai.com/api/reference/workload-identity-federation)
- Markdown 来源：[https://developers.openai.com/api/reference/workload-identity-federation.md](https://developers.openai.com/api/reference/workload-identity-federation.md)
- 抓取时间：2026-06-27T05:54:44.532Z
- Checksum：`b6f84e3c795735ce47a7065db840661d0c9bdc4748f10716be5162a29afa0d0c`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
配置可信提供方和服务账号映射后，使用此参考将外部签发的身份 token 交换为短期 OpenAI access token。概念、dashboard 配置、特定提供方设置和 SDK 示例见[工作负载身份联合指南](/mirror/api/docs/guides/workload-identity-federation)。

## 交换 subject token

在 OpenAI token endpoint 交换外部 subject token：

```bash
curl https://auth.openai.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
    "subject_token_type": "urn:ietf:params:oauth:token-type:jwt",
    "subject_token": "'"$EXTERNAL_OIDC_JWT"'",
    "identity_provider_id": "'"$IDENTITY_PROVIDER_ID"'",
    "service_account_id": "'"$SERVICE_ACCOUNT_ID"'"
  }'
```

### 请求参数

| Parameter              | Required | Description                                                                                      |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `grant_type`           | Yes      | 必须是 `urn:ietf:params:oauth:grant-type:token-exchange`。                                       |
| `subject_token_type`   | Yes      | 支持 `urn:ietf:params:oauth:token-type:jwt` 和 `urn:ietf:params:oauth:token-type:id_token`。 |
| `subject_token`        | Yes      | 来自你的 Workload Identity Provider 的外部签发 OIDC JWT 或 SPIFFE JWT-SVID。          |
| `identity_provider_id` | Yes      | 为外部签发方配置的 OpenAI Workload Identity Provider ID。                     |
| `service_account_id`   | Yes      | 要针对匹配的服务账号映射解析的 OpenAI service account ID。           |

token 交换使用匹配服务账号映射上配置的权限。请求 body 中的 `scope` 值不会授予访问权限。

## Subject token 验证

OpenAI 会先验证外部 subject token，然后再解析映射。该 token 必须：

- 是一个 JWT，并且 header 中包含 `kid` 和受支持的 `alg`。
- 包含 `iss`、`aud`、`sub`、`exp` 和 `iat` claims。
- 匹配配置的 Workload Identity Provider issuer 和 audience。
- 由配置的 JWKS source 中的 key 签名。

如果验证失败，token 交换会返回认证错误，并且不会铸造 OpenAI access token。

subject token 验证成功后，OpenAI 会根据该 token 的原始 claims 和派生属性解析请求的服务账号映射。映射不匹配会在映射解析期间导致 token 交换失败。

## 响应

成功响应包含一个短期 bearer token：

```json
{
  "access_token": "eyJ...",
  "issued_token_type": "urn:ietf:params:oauth:token-type:access_token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "api.model.read api.model.request"
}
```

只有当解析得到的映射具有权限时，才会返回 `scope` 属性。Access token 最多一小时后过期，并且永远不会超过用于交换的外部 subject token 的有效期。

## Token 交换错误

如果 token 交换失败，OpenAI 不会铸造 access token。常见原因包括：

| Error category             | Typical causes                                                                                                                                                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missing request parameter  | 缺少 `subject_token`、`subject_token_type`、`identity_provider_id` 或 `service_account_id`。                                                                                                                                                   |
| Unsupported token request  | `subject_token_type` 不是 `urn:ietf:params:oauth:token-type:jwt` 或 `urn:ietf:params:oauth:token-type:id_token`。                                                                                                                                    |
| Provider resolution error  | Workload Identity Provider ID 格式不正确或未知。                                                                                                                                                                                           |
| Subject token verification | JWT 格式不正确，header 缺少 `kid` 或 `alg`，算法不受支持，签名无效，issuer 或 audience 不匹配，缺少必需 claim，token 已过期，或没有 JWKS key 匹配该 token 的 `kid`。 |
| Mapping resolution         | 请求的服务账号没有映射、匹配的映射已禁用、token 属性与映射不匹配，或属性转换失败。                                                                           |

大多数 subject-token 问题都可以通过在本地解码 JWT payload，并将它的 `iss`、`aud`、`sub`、`exp`、`iat` 以及提供方特定 claims 与你的 Workload Identity Provider 和服务账号映射配置进行比较来发现。

如果 token 交换成功，但后续 OpenAI API 请求失败，请把铸造出的 access token 作为授权问题来调试。该 token 仍然受到适用于普通 OpenAI API 请求的项目、服务账号、endpoint 授权、IP allowlist 和其他策略检查约束。

## 授权行为

工作负载身份 access token 由 OpenAI service account 和 project 支撑。在 OpenAI API surfaces 上，它们像 service-account API credentials 一样授权，而不是像用户 OAuth token 一样授权。

如果某个映射定义了权限，这些权限会进一步缩小从该映射铸造的 token 的有效 API 访问权限。如果某个映射没有定义权限，OpenAI 不会添加特定于工作负载身份联合的 scope 限制，授权会从映射到的 service account 的 project 和 organization roles 派生。

工作负载身份 token 不会绕过普通 endpoint 授权。目标 endpoint 仍必须允许 token 携带的有效权限和项目访问。

## 限制

工作负载身份联合目前有以下限制：

- 工作负载身份 access token 不能用于调用 Admin API endpoints。对于 Admin APIs，请使用 admin API key。
- 每个组织最多可以创建 50 个 Workload Identity Providers。每个 Workload Identity Provider 最多可以有 50 个服务账号映射。
- 以下 endpoints 不接受工作负载身份 access token：`DELETE /v1/models/{id}` 和 `POST /v1/images/request_audit`。
- 尚不支持[设置指南](/mirror/api/docs/guides/workload-identity-federation)中记录的提供方之外的任意 OIDC issuer endpoints。
- SPIFFE 支持仅限 JWT-SVID subject tokens。此 token 交换 endpoint 不支持 X.509-SVID。

:::

## English source

::: details 展开英文原文
::: v-pre
Use this reference to exchange an externally issued identity token for a short-lived OpenAI access token after you configure a trusted provider and service account mapping. For concepts, dashboard configuration, provider-specific setup, and SDK examples, see the [workload identity federation guide](/mirror/api/docs/guides/workload-identity-federation).

## Exchange a subject token

Exchange the external subject token at the OpenAI token endpoint:

```bash
curl https://auth.openai.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
    "subject_token_type": "urn:ietf:params:oauth:token-type:jwt",
    "subject_token": "'"$EXTERNAL_OIDC_JWT"'",
    "identity_provider_id": "'"$IDENTITY_PROVIDER_ID"'",
    "service_account_id": "'"$SERVICE_ACCOUNT_ID"'"
  }'
```

### Request parameters

| Parameter              | Required | Description                                                                                      |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `grant_type`           | Yes      | Must be `urn:ietf:params:oauth:grant-type:token-exchange`.                                       |
| `subject_token_type`   | Yes      | Supports `urn:ietf:params:oauth:token-type:jwt` and `urn:ietf:params:oauth:token-type:id_token`. |
| `subject_token`        | Yes      | The externally issued OIDC JWT or SPIFFE JWT-SVID from your Workload Identity Provider.          |
| `identity_provider_id` | Yes      | The OpenAI Workload Identity Provider ID configured for the external issuer.                     |
| `service_account_id`   | Yes      | The OpenAI service account ID to resolve against the matching service account mapping.           |

The token exchange uses the permissions configured on the matching service account mapping. A `scope` value in the request body doesn't grant access.

## Subject token validation

OpenAI verifies the external subject token before resolving a mapping. The token must:

- Be a JWT with a `kid` and supported `alg` in the header.
- Include `iss`, `aud`, `sub`, `exp`, and `iat` claims.
- Match the configured Workload Identity Provider issuer and audience.
- Be signed by a key from the configured JWKS source.

If verification fails, the token exchange returns an authentication error and doesn't mint an OpenAI access token.

After subject token validation succeeds, OpenAI resolves the requested service account mapping against the token's raw claims and derived attributes. Mapping mismatches fail the token exchange during mapping resolution.

## Response

Successful responses include a short-lived bearer token:

```json
{
  "access_token": "eyJ...",
  "issued_token_type": "urn:ietf:params:oauth:token-type:access_token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "api.model.read api.model.request"
}
```

The `scope` property is returned only when the resolved mapping has permissions. Access tokens expire after at most one hour and never outlive the external subject token used for the exchange.

## Token exchange errors

If token exchange fails, OpenAI doesn't mint an access token. Common causes include:

| Error category             | Typical causes                                                                                                                                                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missing request parameter  | `subject_token`, `subject_token_type`, `identity_provider_id`, or `service_account_id` is missing.                                                                                                                                                   |
| Unsupported token request  | `subject_token_type` isn't `urn:ietf:params:oauth:token-type:jwt` or `urn:ietf:params:oauth:token-type:id_token`.                                                                                                                                    |
| Provider resolution error  | The Workload Identity Provider ID is malformed or unknown.                                                                                                                                                                                           |
| Subject token verification | The JWT is malformed, the header is missing `kid` or `alg`, the algorithm is unsupported, the signature is invalid, the issuer or audience doesn't match, a required claim is missing, the token is expired, or no JWKS key matches the token `kid`. |
| Mapping resolution         | No mapping exists for the requested service account, the matching mapping is disabled, the token attributes don't match the mapping, or an attribute transformation fails.                                                                           |

Most subject-token problems are visible by decoding the JWT payload locally and comparing its `iss`, `aud`, `sub`, `exp`, `iat`, and provider-specific claims with your Workload Identity Provider and service account mapping configuration.

If token exchange succeeds but a later OpenAI API request fails, debug the minted access token as an authorization issue. The token still has the project, service account, endpoint authorization, IP allowlist, and other policy checks that apply to normal OpenAI API requests.

## Authorization behavior

Workload identity access tokens are backed by an OpenAI service account and project. On OpenAI API surfaces, they authorize like service-account API credentials rather than user OAuth tokens.

If a mapping defines permissions, those permissions further narrow the effective API access for tokens minted from that mapping. If a mapping doesn't define permissions, OpenAI doesn't add a workload identity federation-specific scope restriction, and authorization is derived from the mapped service account's project and organization roles.

Workload identity tokens don't bypass normal endpoint authorization. The target endpoint must still allow the effective permissions and project access carried by the token.

## Limitations

Workload identity federation currently has the following limitations:

- Workload identity access tokens can't be used to call Admin API endpoints. For Admin APIs, use an admin API key.
- Each organization can create at most 50 Workload Identity Providers. Each Workload Identity Provider can have at most 50 service account mappings.
- Workload identity access tokens aren't accepted by these endpoints: `DELETE /v1/models/{id}` and `POST /v1/images/request_audit`.
- Arbitrary OIDC issuer endpoints other than the providers documented in the [setup guides](/mirror/api/docs/guides/workload-identity-federation) aren't supported yet.
- SPIFFE support is limited to JWT-SVID subject tokens. X.509-SVIDs aren't supported by this token exchange endpoint.

:::
:::

