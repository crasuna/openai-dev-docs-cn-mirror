# Workload identity token exchange

Use this reference to exchange an externally issued identity token for a short-lived OpenAI access token after you configure a trusted provider and service account mapping. For concepts, dashboard configuration, provider-specific setup, and SDK examples, see the [workload identity federation guide](https://developers.openai.com/api/docs/guides/workload-identity-federation).

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
- Arbitrary OIDC issuer endpoints other than the providers documented in the [setup guides](https://developers.openai.com/api/docs/guides/workload-identity-federation) aren't supported yet.
- SPIFFE support is limited to JWT-SVID subject tokens. X.509-SVIDs aren't supported by this token exchange endpoint.
