---
status: needs-review
sourceId: "b6f84e3c7957"
sourceChecksum: "b6f84e3c795735ce47a7065db840661d0c9bdc4748f10716be5162a29afa0d0c"
sourceUrl: "https://developers.openai.com/api/reference/workload-identity-federation"
translatedAt: "2026-06-27T11:05:57.267Z"
translator: codex-gpt-5.5-xhigh
---

# 工作负载身份 token 交换

配置可信提供方和服务账号映射后，使用此参考将外部签发的身份 token 交换为短期 OpenAI access token。概念、Dashboard 配置、特定提供方设置和 SDK 示例见[工作负载身份联合指南](https://developers.openai.com/api/docs/guides/workload-identity-federation)。

## 交换 subject token

在 OpenAI token 端点交换外部 subject token：

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

| 参数                   | 必需     | 说明                                                                                             |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `grant_type`           | 是       | 必须是 `urn:ietf:params:oauth:grant-type:token-exchange`。                                       |
| `subject_token_type`   | 是       | 支持 `urn:ietf:params:oauth:token-type:jwt` 和 `urn:ietf:params:oauth:token-type:id_token`。     |
| `subject_token`        | 是       | 来自你的 Workload Identity Provider 的外部签发 OIDC JWT 或 SPIFFE JWT-SVID。                     |
| `identity_provider_id` | 是       | 为外部签发方配置的 OpenAI Workload Identity Provider ID。                                        |
| `service_account_id`   | 是       | 要针对匹配的服务账号映射解析的 OpenAI service account ID。                                       |

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

| 错误类别                   | 常见原因                                                                                                                                                                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 缺少请求参数               | 缺少 `subject_token`、`subject_token_type`、`identity_provider_id` 或 `service_account_id`。                                                                                                                                                         |
| 不受支持的 token 请求      | `subject_token_type` 不是 `urn:ietf:params:oauth:token-type:jwt` 或 `urn:ietf:params:oauth:token-type:id_token`。                                                                                                                                    |
| 提供方解析错误             | Workload Identity Provider ID 格式不正确或未知。                                                                                                                                                                                                     |
| Subject token 验证         | JWT 格式不正确，header 缺少 `kid` 或 `alg`，算法不受支持，签名无效，issuer 或 audience 不匹配，缺少必需 claim，token 已过期，或没有 JWKS key 匹配该 token 的 `kid`。                                                                                |
| 映射解析                   | 请求的服务账号没有映射、匹配的映射已禁用、token 属性与映射不匹配，或属性转换失败。                                                                                                                                                                 |

大多数 subject-token 问题都可以通过在本地解码 JWT payload，并将它的 `iss`、`aud`、`sub`、`exp`、`iat` 以及提供方特定 claims 与你的 Workload Identity Provider 和服务账号映射配置进行比较来发现。

如果 token 交换成功，但后续 OpenAI API 请求失败，请把铸造出的 access token 作为授权问题来调试。该 token 仍然受到适用于普通 OpenAI API 请求的项目、服务账号、端点授权、IP allowlist 和其他策略检查约束。

## 授权行为

工作负载身份 access token 由 OpenAI service account 和 project 支撑。在 OpenAI API 中，它们像 service account API 凭据一样授权，而不是像用户 OAuth token 一样授权。

如果某个映射定义了权限，这些权限会进一步缩小从该映射铸造的 token 的有效 API 访问权限。如果某个映射没有定义权限，OpenAI 不会添加特定于工作负载身份联合的 scope 限制，授权会从映射到的 service account 的 project 和组织角色派生。

工作负载身份 token 不会绕过普通端点授权。目标端点仍必须允许 token 携带的有效权限和项目访问。

## 限制

工作负载身份联合目前有以下限制：

- 工作负载身份 access token 不能用于调用 Admin API 端点。对于 Admin API，请使用 admin API key。
- 每个组织最多可以创建 50 个 Workload Identity Providers。每个 Workload Identity Provider 最多可以有 50 个服务账号映射。
- 以下端点不接受工作负载身份 access token：`DELETE /v1/models/{id}` 和 `POST /v1/images/request_audit`。
- 尚不支持[设置指南](https://developers.openai.com/api/docs/guides/workload-identity-federation)中记录的提供方之外的任意 OIDC issuer 端点。
- SPIFFE 支持仅限 JWT-SVID subject token。此 token 交换端点不支持 X.509-SVID。
