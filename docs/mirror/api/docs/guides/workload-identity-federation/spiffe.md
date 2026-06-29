---
title: "为 SPIFFE 配置工作负载身份联合"
description: "Configure SPIFFE JWT-SVIDs as workload identity federation subject tokens."
outline: deep
---

# 为 SPIFFE 配置工作负载身份联合

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/workload-identity-federation/spiffe](https://developers.openai.com/api/docs/guides/workload-identity-federation/spiffe)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/workload-identity-federation/spiffe.md](https://developers.openai.com/api/docs/guides/workload-identity-federation/spiffe.md)
- 抓取时间：2026-06-27T05:54:12.843Z
- Checksum：`6a8959dd7e1c0105cd5002298fb2dbd31df7318121f7d5e5e1aac7eb4aee5393`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
通过将 SPIFFE JWT-SVID 交换为短期 OpenAI access token，把 SPIFFE 用作 Workload Identity Provider。这样，经 SPIRE 或其他兼容 SPIFFE 的身份提供方认证的工作负载，就可以在不存储长期 API key 的情况下调用 OpenAI API。

OpenAI 支持可作为 JWT subject tokens 进行验证的 SPIFFE JWT-SVID，要求其具备 issuer、audience、expiration、issued-at timestamp，以及由 JWKS 支持的签名。OpenAI 不支持将 SPIFFE X.509-SVID 作为工作负载身份联合的 subject token。

JWT-SVID 规范要求包含 `sub`、`aud` 和 `exp` claims。若要将 JWT-SVID 用于 OpenAI，该 token 还必须包含 `iss` 和 `iat` claims，以及一个 `kid` header，以便 OpenAI 可以根据 Workload Identity Provider 配置验证该 token。

JWT-SVID 不是 OpenID Connect ID token。SPIRE OIDC Discovery Provider 会提供 discovery metadata 和 JWKS keys，以便 OpenAI 验证 JWT-SVID；它不会改变 token 的 SPIFFE 语义，也不要求 OIDC 登录流程。

有关 SPIFFE 术语和 token 要求，请参阅 SPIFFE [JWT-SVID specification](https://spiffe.io/docs/latest/spiffe-specs/jwt-svid/) 和 [Workload API specification](https://spiffe.io/docs/latest/spiffe-specs/spiffe_workload_api/)。

## 设置 SPIFFE

配置你的 SPIFFE provider，为需要调用 OpenAI API 的工作负载签发 JWT-SVID。这些说明使用 SPIRE 术语，但同一套 OpenAI 配置适用于任何兼容 SPIFFE 的 provider，只要它发出的 JWT-SVID 带有 OpenAI 可验证的 issuer 和 JWKS 签名材料。

你的 SPIFFE 设置必须提供：

- 工作负载的稳定 SPIFFE ID，例如 `spiffe://example.org/ns/production/sa/openai-wif`。
- 专用于 OpenAI 访问的单个 JWT-SVID audience，例如 `https://api.openai.com/v1`，或你选择的其他 opaque value。
- 出现在 JWT-SVID `iss` claim 中、供 OpenAI 验证的 JWT issuer URL。
- JWT-SVID 签名 keys 的公共 JWKS，可通过 OIDC discovery 提供，也可上传 JWKS。
- 工作负载侧从 SPIFFE Workload API 获取新 JWT-SVID 的方式。

audience 是精确匹配的标识符，不一定是接收 JWT-SVID 的 endpoint。你可以使用 `https://api.openai.com/v1`，也可以使用其他服务专用值，只要 SPIFFE Workload API 请求与 OpenAI provider 配置保持一致即可。

可行时，请通过 SPIRE OIDC Discovery Provider 暴露 SPIFFE issuer。将 SPIRE Server 的 `jwt_issuer` 和 OIDC Discovery Provider 的 `jwt_issuer` 配置为同一个 HTTPS issuer URL，也就是你将在 OpenAI 中配置的值。

在 SPIRE Server 配置中：

```hcl
server {
  trust_domain = "example.org"
  jwt_issuer   = "https://spire-oidc.example.org"
}
```

在单独的 SPIRE OIDC Discovery Provider 配置中：

```hcl
# Relevant issuer fields only
domains    = ["spire-oidc.example.org"]
jwt_issuer = "https://spire-oidc.example.org"
```

OIDC Discovery Provider 配置还需要一个 key-material source，例如 `server_api`、`workload_api` 或 `file`，以及一个 serving mechanism，例如 ACME、TLS certificate 或 Unix socket。完整配置选项请参阅 [SPIRE OIDC Discovery Provider documentation](https://github.com/spiffe/spire/tree/main/support/oidc-discovery-provider)。

SPIFFE trust domain 和 JWT issuer 是不同概念。在此示例中，JWT-SVID subject 是 `example.org` trust domain 中的 SPIFFE ID，而 issuer 是 HTTPS issuer URL：

```json
{
  "sub": "spiffe://example.org/ns/production/sa/openai-wif",
  "iss": "https://spire-oidc.example.org"
}
```

当 **Use uploaded JWKS for token verification** 处于禁用状态时，SPIRE OIDC Discovery Provider 会提供 OpenAI 可使用的 OIDC discovery document 和 JWKS endpoint。

如果 OpenAI 无法访问你的 issuer discovery endpoint，请改用 uploaded JWKS mode。在该模式下，OpenAI 仍会将 Workload Identity Provider issuer 与 JWT-SVID `iss` claim 进行比较，但会根据你保存在 Workload Identity Provider 上的 JWKS JSON 来验证签名。

&gt; **注意：** SPIFFE JWT-SVID 规范将 JWT header `kid` 设为可选，但 OpenAI 要求 JWT subject tokens 包含 `kid` header，以便从已配置的 JWKS 中选择签名 key。如果你的 SPIFFE provider 可能省略 `kid`，请将其配置为在 OpenAI 工作负载身份联合中包含该字段。

若要检查可调用 SPIFFE Workload API 的工作负载中的 JWT-SVID，请使用你将在 OpenAI 中配置的相同 audience 请求一个 JWT-SVID。请在与应用相同的工作负载上下文中运行此命令，因为 Workload API 授权取决于调用进程的身份。

```bash
spire-agent api fetch jwt \
  -socketPath /run/spire/sockets/agent.sock \
  -audience "https://api.openai.com/v1"
```

如果你的工作负载有多个 SPIFFE ID，请请求特定身份：

```bash
spire-agent api fetch jwt \
  -socketPath /run/spire/sockets/agent.sock \
  -spiffeID "spiffe://example.org/ns/production/sa/openai-wif" \
  -audience "https://api.openai.com/v1"
```

## 验证 token

配置工作负载身份联合之前，请在本地解码一个 JWT-SVID 示例，并检查其 header 和 claims：

```bash
TOKEN="$SPIFFE_JWT_SVID" python3 - <<'PY'
import base64
import json
import os

parts = os.environ["TOKEN"].split(".")
if len(parts) != 3:
    raise ValueError("Expected a compact JWT with three segments")

def decode(segment):
    segment += "=" * (-len(segment) % 4)
    return json.loads(base64.urlsafe_b64decode(segment))

print("Header:")
print(json.dumps(decode(parts[0]), indent=2))
print("\nPayload:")
print(json.dumps(decode(parts[1]), indent=2))
PY
```

此命令会解码 JWT，但不会验证 token 签名。请对生产 token 使用本地解码器，并避免将生产 token 粘贴到第三方工具中。

解码后的 SPIFFE JWT-SVID 类似如下：

```json
{
  "alg": "ES256",
  "kid": "jwt-svid-key-1"
}
```

```json
{
  "iss": "https://spire-oidc.example.org",
  "aud": ["https://api.openai.com/v1"],
  "sub": "spiffe://example.org/ns/production/sa/openai-wif",
  "iat": 1716235422,
  "exp": 1716235722
}
```

在交换 token 之前，请使用解码后的 token，将你收到的 token 与 OpenAI 配置进行比较。检查 header 中的 `alg` 和 `kid`，以及 payload 中的 `iss`、`aud`、`sub`、`iat` 和 `exp`。确切的 `alg` 值取决于你的 SPIRE Server JWT signing-key 配置。

## 设置工作负载身份联合

在 OpenAI 中为 SPIFFE JWT-SVID issuer 创建 Workload Identity Provider，然后添加一个 service account mapping，以匹配你信任的 SPIFFE IDs。

### 设置 Workload Identity Provider

1. **创建 Workload Identity Provider。** 将 **Name** 设为唯一值，例如 `spiffe-prod`。使用 **Description**，例如 `Production SPIFFE workloads`，帮助管理员识别该 provider。

2. **设置 issuer 和 audience。** 将 **OIDC Issuer URL** 设为 JWT-SVID `iss` claim 的确切值，例如 `https://spire-oidc.example.org`。将 **Audience** 设为从 SPIFFE Workload API 请求的 audience 值。在此示例中，该值为 `https://api.openai.com/v1`。

3. **选择 JWKS source。** 当 OpenAI 可以访问你的 SPIRE OIDC Discovery Provider 时，请保持 **Use uploaded JWKS for token verification** 为禁用。OpenAI 会使用 OIDC discovery 和发现到的 JWKS 来验证 JWT-SVID 签名。

   如果 OpenAI 无法访问 issuer，请启用 **Use uploaded JWKS for token verification**，然后将 **JWKS JSON** 设为 JWT-SVID 签名 keys 的公共 key set。上传完整的公共 JWKS 对象，包括外层 `keys` 数组。不要包含 private key material。

4. **仅在需要派生映射属性时添加 attribute transformations。** 如果直接从 `sub` 映射，则不需要 attribute transformations。仅当你需要从一个或多个 token claims 派生映射值时才使用它们。转换行为请参阅[主工作负载身份联合指南](/mirror/api/docs/guides/workload-identity-federation#transform-token-claims-with-cel)。

### 设置 service account mapping

1. **创建 service account mapping。** 将 **Name** 设为该 Workload Identity Provider 内的唯一值，例如 `production-openai-wif`。使用 **Description**，例如 `Production SPIFFE workload for OpenAI API access`，说明哪个工作负载可以使用该映射。

2. **匹配 SPIFFE ID。** 将 **Key** 设为 `sub`，并将 **Value** 设为工作负载的 SPIFFE ID，例如 `spiffe://example.org/ns/production/sa/openai-wif`。

   对于特权工作负载，优先使用精确 SPIFFE ID 匹配。仅当该前缀下的每个 SPIFFE ID 都应能够铸造 OpenAI access tokens 时，才使用尾随通配符。例如，`spiffe://example.org/ns/production/sa/*` 允许任何匹配的生产 service account path。

3. **选择 OpenAI 目标。** 将 **Project** 设为拥有目标 service account 的 OpenAI project。将 **Service account** 设为 SPIFFE 工作负载可使用的 OpenAI service account，例如 `spiffe-prod-openai-wif`。如果你希望为此映射创建新的 service account，而不是复用现有 service account，请勾选 `Create a new service account in this project`。

4. **如有需要，收窄 API 权限。** 选择适当的 **Permissions**，例如 `api.model.request` 和 `api.vector_store.read`，以进一步收窄由此映射铸造的 access tokens。将 permissions 留空可避免添加 WIF 专属 scope 限制；该 token 仍会以映射到的 service account 身份授权。

## 在代码中使用 token

配置你的 OpenAI SDK client，将新的 SPIFFE JWT-SVID 交换为 OpenAI 签发的 access token。

下面的 SDK 示例假设你的 SPIFFE 集成会刷新 JWT-SVID，并将其写入 `/var/run/spiffe/openai.jwt`。请确保该文件仅对工作负载可读。由于 JWT-SVID 生命周期很短，请在 token 过期前刷新该文件。另一种方式是，在可行时使用特定语言的 SPIFFE library，在 subject token provider 中直接从 SPIFFE Workload API 获取 JWT-SVID，以避免陈旧 token 文件。

在工作负载环境中设置 `OPENAI_IDENTITY_PROVIDER_ID` 和 `OPENAI_SERVICE_ACCOUNT_ID`。token 文件包含外部 subject token。`OPENAI_IDENTITY_PROVIDER_ID` 标识 OpenAI Workload Identity Provider，`OPENAI_SERVICE_ACCOUNT_ID` 标识目标 OpenAI service account。随后，OpenAI 会根据 token claims，为该 provider 和 service account 找到匹配的映射。

使用 SPIFFE JWT-SVID 进行身份验证

```typescript
import { readFile } from "node:fs/promises";
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const tokenPath = "/var/run/spiffe/openai.jwt";
const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;

if (!identityProviderId || !serviceAccountId) {
  throw new Error("Set OPENAI_IDENTITY_PROVIDER_ID and OPENAI_SERVICE_ACCOUNT_ID");
}

function spiffeJwtSvidProvider(path: string): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const token = (await readFile(path, "utf8")).trim();
      if (!token) {
        throw new Error("The SPIFFE JWT-SVID file is empty.");
      }
      return token;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: spiffeJwtSvidProvider(tokenPath),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from SPIFFE workload identity federation.",
});

console.log(response.output_text);
```

```python
import os
from pathlib import Path

from openai import OpenAI
from openai.auth import SubjectTokenProvider

TOKEN_PATH = "/var/run/spiffe/openai.jwt"


def spiffe_jwt_svid_provider(token_path: str) -> SubjectTokenProvider:
    def get_token() -> str:
        token = Path(token_path).read_text().strip()
        if not token:
            raise RuntimeError("The SPIFFE JWT-SVID file is empty.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": spiffe_jwt_svid_provider(TOKEN_PATH),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from SPIFFE workload identity federation.",
)

print(response.output_text)
```

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/auth"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
)

const tokenPath = "/var/run/spiffe/openai.jwt"

type spiffeJWTSVIDProvider struct {
	path string
}

func (p spiffeJWTSVIDProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p spiffeJWTSVIDProvider) GetToken(ctx context.Context, _ auth.HTTPDoer) (string, error) {
	data, err := os.ReadFile(p.path)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "spiffe",
			Message:  "failed to read SPIFFE JWT-SVID",
			Cause:    err,
		}
	}

	token := strings.TrimSpace(string(data))
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "spiffe",
			Message:  "SPIFFE JWT-SVID file is empty",
		}
	}

	return token, nil
}

func main() {
	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: spiffeJWTSVIDProvider{
				path: tokenPath,
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from SPIFFE workload identity federation."),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(response.OutputText())
}
```

```java
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.openai.auth.SubjectTokenProvider;
import com.openai.auth.SubjectTokenType;
import com.openai.auth.WorkloadIdentity;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.core.http.HttpClient;
import com.openai.errors.SubjectTokenProviderException;
import com.openai.models.ChatModel;
import com.openai.models.responses.ResponseCreateParams;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.CompletableFuture;

public final class SpiffeWorkloadIdentityExample {
    private static final String TOKEN_PATH = "/var/run/spiffe/openai.jwt";

    private SpiffeWorkloadIdentityExample() {}

    static final class SpiffeJwtSvidProvider implements SubjectTokenProvider {
        private final Path tokenPath;

        SpiffeJwtSvidProvider(String tokenPath) {
            this.tokenPath = Path.of(tokenPath);
        }

        @Override
        public SubjectTokenType tokenType() {
            return SubjectTokenType.JWT;
        }

        @Override
        public String getToken(HttpClient httpClient, JsonMapper jsonMapper) {
            String token;
            try {
                token = Files.readString(tokenPath).trim();
            } catch (Exception e) {
                throw new SubjectTokenProviderException(
                        "spiffe",
                        "failed to read SPIFFE JWT-SVID",
                        e);
            }

            if (token.isEmpty()) {
                throw new SubjectTokenProviderException(
                        "spiffe",
                        "SPIFFE JWT-SVID file is empty",
                        null);
            }

            return token;
        }

        @Override
        public CompletableFuture<String> getTokenAsync(
                HttpClient httpClient, JsonMapper jsonMapper) {
            return CompletableFuture.supplyAsync(() -> getToken(httpClient, jsonMapper));
        }
    }

    public static void main(String[] args) {
        WorkloadIdentity workloadIdentity = WorkloadIdentity.builder()
                .identityProviderId(System.getenv("OPENAI_IDENTITY_PROVIDER_ID"))
                .serviceAccountId(System.getenv("OPENAI_SERVICE_ACCOUNT_ID"))
                .provider(new SpiffeJwtSvidProvider(TOKEN_PATH))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from SPIFFE workload identity federation.")
                .build();

        client.responses().create(params).output().stream()
                .flatMap(item -> item.message().stream())
                .flatMap(message -> message.content().stream())
                .flatMap(content -> content.outputText().stream())
                .forEach(outputText -> System.out.println(outputText.text()));
    }
}
```

```ruby
require "openai"

TOKEN_PATH = "/var/run/spiffe/openai.jwt"

class SpiffeJWTSVIDProvider
  include OpenAI::Auth::SubjectTokenProvider

  def initialize(token_path:)
    @token_path = token_path
  end

  def token_type
    OpenAI::Auth::TokenType::JWT
  end

  def get_token
    token = File.read(@token_path).strip
    if token.empty?
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "SPIFFE JWT-SVID file is empty",
        provider: "spiffe"
      )
    end
    token
  rescue SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to read SPIFFE JWT-SVID: #{e.message}",
      provider: "spiffe",
      cause: e
    )
  end
end

provider = SpiffeJWTSVIDProvider.new(token_path: TOKEN_PATH)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from SPIFFE workload identity federation."
)

puts(response.output_text)
```


## SPIFFE 最佳实践

- 对 OpenAI 工作负载身份联合使用 JWT-SVID。X.509-SVID 对 mutual TLS 很有用，但 OpenAI token exchange endpoint 不接受它。
- 为 OpenAI 访问使用单一专用 audience。避免使用过宽的 audiences，例如整个 trust domain 或环境名称。
- 尽可能匹配精确 SPIFFE ID。仅对有意共享的 trust boundaries 使用 wildcard mappings。
- 保持 JWT-SVID 生命周期较短，以降低 bearer-token replay 风险。OpenAI access tokens 的生命周期绝不会超过用于交换的外部 subject token。
- 谨慎轮换 signing keys。在轮换窗口期间通过 OIDC discovery 发布旧 public keys 和新 public keys，或在签发带有新 `kid` 的 JWT-SVID 前更新已上传的公共 JWKS。
- 保持 SPIRE Server 和工作负载时钟同步。明显的 clock skew 可能导致原本有效的 JWT-SVID 因尚未生效、过旧或已过期而被拒绝。
- 保护 SPIFFE Workload API socket。能够获取工作负载 JWT-SVID 的进程可以尝试将其交换为 OpenAI access。
- 让 OpenAI service account 边界与你的应用和环境权限边界保持一致。不要在无关的 SPIFFE 工作负载之间共享高权限 service account。
- 监控 issuer、audience、signing key 和 mapping mismatch 导致的 token exchange failures。

:::

## English source

::: details 展开英文原文
::: v-pre
Use SPIFFE as a Workload Identity Provider by exchanging a SPIFFE JWT-SVID for a short-lived OpenAI access token. This lets workloads authenticated by SPIRE or another SPIFFE-compatible identity provider call the OpenAI API without storing long-lived API keys.

OpenAI supports SPIFFE JWT-SVIDs that can be validated as JWT subject tokens with an issuer, audience, expiration, issued-at timestamp, and JWKS-backed signature. OpenAI doesn't support SPIFFE X.509-SVIDs as workload identity federation subject tokens.

The JWT-SVID specification requires the `sub`, `aud`, and `exp` claims. To use a JWT-SVID with OpenAI, the token must also include `iss` and `iat` claims and a `kid` header so OpenAI can validate the token against the Workload Identity Provider configuration.

A JWT-SVID is not an OpenID Connect ID token. The SPIRE OIDC Discovery Provider supplies discovery metadata and JWKS keys so OpenAI can validate the JWT-SVID; it doesn't change the token's SPIFFE semantics or require an OIDC login flow.

For SPIFFE terminology and token requirements, see the SPIFFE [JWT-SVID specification](https://spiffe.io/docs/latest/spiffe-specs/jwt-svid/) and [Workload API specification](https://spiffe.io/docs/latest/spiffe-specs/spiffe_workload_api/).

## Setting up SPIFFE

Configure your SPIFFE provider to issue JWT-SVIDs for workloads that need to call the OpenAI API. These instructions use SPIRE terminology, but the same OpenAI configuration applies to any SPIFFE-compatible provider that emits JWT-SVIDs with issuer and JWKS signing material that OpenAI can validate.

Your SPIFFE setup must provide:

- A stable SPIFFE ID for the workload, such as `spiffe://example.org/ns/production/sa/openai-wif`.
- A single JWT-SVID audience dedicated to OpenAI access, such as `https://api.openai.com/v1` or another opaque value you choose.
- A JWT issuer URL that appears in the JWT-SVID `iss` claim for OpenAI validation.
- A public JWKS for the JWT-SVID signing keys, either through OIDC discovery or an uploaded JWKS.
- A workload-side way to fetch fresh JWT-SVIDs from the SPIFFE Workload API.

The audience is an exact-match identifier, not necessarily an endpoint that receives the JWT-SVID. You may use `https://api.openai.com/v1` or another service-specific value as long as the SPIFFE Workload API request and OpenAI provider configuration match.

When possible, expose the SPIFFE issuer through your SPIRE OIDC Discovery Provider. Configure the SPIRE Server `jwt_issuer` and the OIDC Discovery Provider `jwt_issuer` to the same HTTPS issuer URL that you will configure in OpenAI.

In the SPIRE Server configuration:

```hcl
server {
  trust_domain = "example.org"
  jwt_issuer   = "https://spire-oidc.example.org"
}
```

In the separate SPIRE OIDC Discovery Provider configuration:

```hcl
# Relevant issuer fields only
domains    = ["spire-oidc.example.org"]
jwt_issuer = "https://spire-oidc.example.org"
```

The OIDC Discovery Provider configuration also needs a key-material source, such as `server_api`, `workload_api`, or `file`, and a serving mechanism, such as ACME, a TLS certificate, or a Unix socket. See the [SPIRE OIDC Discovery Provider documentation](https://github.com/spiffe/spire/tree/main/support/oidc-discovery-provider) for the complete configuration options.

The SPIFFE trust domain and JWT issuer are different concepts. In this example, the JWT-SVID subject is a SPIFFE ID in the `example.org` trust domain, while the issuer is the HTTPS issuer URL:

```json
{
  "sub": "spiffe://example.org/ns/production/sa/openai-wif",
  "iss": "https://spire-oidc.example.org"
}
```

The SPIRE OIDC Discovery Provider serves an OIDC discovery document and a JWKS endpoint that OpenAI can use when **Use uploaded JWKS for token verification** is disabled.

If OpenAI can't reach your issuer discovery endpoint, use uploaded JWKS mode instead. In that mode, OpenAI still compares the Workload Identity Provider issuer with the JWT-SVID `iss` claim, but verifies signatures against the JWKS JSON you save on the Workload Identity Provider.

&gt; **Note:** The SPIFFE JWT-SVID specification makes the JWT header `kid` optional, but OpenAI requires JWT subject tokens to include a `kid` header so it can select the signing key from the configured JWKS. If your SPIFFE provider can omit `kid`, configure it to include one for OpenAI workload identity federation.

To inspect a JWT-SVID from a workload that can call the SPIFFE Workload API, request one for the same audience you will configure in OpenAI. Run this command in the same workload context as the application, because Workload API authorization depends on the identity of the calling process.

```bash
spire-agent api fetch jwt \
  -socketPath /run/spire/sockets/agent.sock \
  -audience "https://api.openai.com/v1"
```

If your workload has more than one SPIFFE ID, request the specific identity:

```bash
spire-agent api fetch jwt \
  -socketPath /run/spire/sockets/agent.sock \
  -spiffeID "spiffe://example.org/ns/production/sa/openai-wif" \
  -audience "https://api.openai.com/v1"
```

## Verify the token

Before configuring workload identity federation, decode a sample JWT-SVID locally and inspect its header and claims:

```bash
TOKEN="$SPIFFE_JWT_SVID" python3 - <<'PY'
import base64
import json
import os

parts = os.environ["TOKEN"].split(".")
if len(parts) != 3:
    raise ValueError("Expected a compact JWT with three segments")

def decode(segment):
    segment += "=" * (-len(segment) % 4)
    return json.loads(base64.urlsafe_b64decode(segment))

print("Header:")
print(json.dumps(decode(parts[0]), indent=2))
print("\nPayload:")
print(json.dumps(decode(parts[1]), indent=2))
PY
```

This command decodes the JWT without verifying the token signature. Use a local decoder for production tokens, and avoid pasting production tokens into third-party tools.

A decoded SPIFFE JWT-SVID will look similar to:

```json
{
  "alg": "ES256",
  "kid": "jwt-svid-key-1"
}
```

```json
{
  "iss": "https://spire-oidc.example.org",
  "aud": ["https://api.openai.com/v1"],
  "sub": "spiffe://example.org/ns/production/sa/openai-wif",
  "iat": 1716235422,
  "exp": 1716235722
}
```

Use the decoded token to compare the token you received with the OpenAI configuration before you exchange it. Check `alg` and `kid` in the header, and `iss`, `aud`, `sub`, `iat`, and `exp` in the payload. The exact `alg` value depends on your SPIRE Server JWT signing-key configuration.

## Setting up workload identity federation

Create a Workload Identity Provider in OpenAI for the SPIFFE JWT-SVID issuer, then add a service account mapping that matches the SPIFFE IDs you trust.

### Set up the Workload Identity Provider

1. **Create the Workload Identity Provider.** Set **Name** to a unique value, such as `spiffe-prod`. Use **Description**, such as `Production SPIFFE workloads`, to help admins identify the provider.

2. **Set the issuer and audience.** Set **OIDC Issuer URL** to the exact value of the JWT-SVID `iss` claim, such as `https://spire-oidc.example.org`. Set **Audience** to the audience value requested from the SPIFFE Workload API. In this example, that value is `https://api.openai.com/v1`.

3. **Choose the JWKS source.** Leave **Use uploaded JWKS for token verification** disabled when OpenAI can reach your SPIRE OIDC Discovery Provider. OpenAI uses OIDC discovery and the discovered JWKS to verify JWT-SVID signatures.

   If the issuer isn't reachable from OpenAI, enable **Use uploaded JWKS for token verification**, then set **JWKS JSON** to the public key set for JWT-SVID signing keys. Upload the full public JWKS object, including the surrounding `keys` array. Do not include private key material.

4. **Add attribute transformations only if you need derived mapping attributes.** Attribute transformations aren't required when mapping directly from `sub`. Use them only when you need to derive a mapping value from one or more token claims. See the [main workload identity federation guide](/mirror/api/docs/guides/workload-identity-federation#transform-token-claims-with-cel) for transformation behavior.

### Set up the service account mapping

1. **Create a service account mapping.** Set **Name** to a unique value within the Workload Identity Provider, such as `production-openai-wif`. Use **Description**, such as `Production SPIFFE workload for OpenAI API access`, to explain which workload can use the mapping.

2. **Match the SPIFFE ID.** Set **Key** to `sub` and **Value** to the workload's SPIFFE ID, such as `spiffe://example.org/ns/production/sa/openai-wif`.

   Prefer exact SPIFFE ID matching for privileged workloads. Use a trailing wildcard only when every SPIFFE ID under that prefix should be able to mint OpenAI access tokens. For example, `spiffe://example.org/ns/production/sa/*` allows any matching production service account path.

3. **Choose the OpenAI target.** Set **Project** to the OpenAI project that owns the target service account. Set **Service account** to the OpenAI service account the SPIFFE workload can use, such as `spiffe-prod-openai-wif`. Check `Create a new service account in this project` if you wish to create a new service account for this mapping rather than reuse an existing one.

4. **Narrow API permissions if needed.** Select appropriate **Permissions** such as `api.model.request` and `api.vector_store.read` to further narrow access tokens minted from this mapping. Leave permissions blank to avoid adding a WIF-specific scope restriction; the token still authorizes as the mapped service account.

## Using the token in code

Configure your OpenAI SDK client to exchange a fresh SPIFFE JWT-SVID for an OpenAI-issued access token.

The SDK samples below assume your SPIFFE integration refreshes a JWT-SVID and writes it to `/var/run/spiffe/openai.jwt`. Keep the file readable only by the workload. Because JWT-SVIDs are short lived, refresh the file before the token expires. As an alternative, use a language-specific SPIFFE library to fetch the JWT-SVID directly from the SPIFFE Workload API in the subject token provider when possible to avoid stale token files.

Set `OPENAI_IDENTITY_PROVIDER_ID` and `OPENAI_SERVICE_ACCOUNT_ID` in the workload environment. The token file contains the external subject token. `OPENAI_IDENTITY_PROVIDER_ID` identifies the OpenAI Workload Identity Provider, and `OPENAI_SERVICE_ACCOUNT_ID` identifies the target OpenAI service account. OpenAI then finds a matching mapping for that provider and service account based on the token claims.

Authenticate from a SPIFFE JWT-SVID

```typescript
import { readFile } from "node:fs/promises";
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const tokenPath = "/var/run/spiffe/openai.jwt";
const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;

if (!identityProviderId || !serviceAccountId) {
  throw new Error("Set OPENAI_IDENTITY_PROVIDER_ID and OPENAI_SERVICE_ACCOUNT_ID");
}

function spiffeJwtSvidProvider(path: string): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const token = (await readFile(path, "utf8")).trim();
      if (!token) {
        throw new Error("The SPIFFE JWT-SVID file is empty.");
      }
      return token;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: spiffeJwtSvidProvider(tokenPath),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from SPIFFE workload identity federation.",
});

console.log(response.output_text);
```

```python
import os
from pathlib import Path

from openai import OpenAI
from openai.auth import SubjectTokenProvider

TOKEN_PATH = "/var/run/spiffe/openai.jwt"


def spiffe_jwt_svid_provider(token_path: str) -> SubjectTokenProvider:
    def get_token() -> str:
        token = Path(token_path).read_text().strip()
        if not token:
            raise RuntimeError("The SPIFFE JWT-SVID file is empty.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": spiffe_jwt_svid_provider(TOKEN_PATH),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from SPIFFE workload identity federation.",
)

print(response.output_text)
```

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/auth"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
)

const tokenPath = "/var/run/spiffe/openai.jwt"

type spiffeJWTSVIDProvider struct {
	path string
}

func (p spiffeJWTSVIDProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p spiffeJWTSVIDProvider) GetToken(ctx context.Context, _ auth.HTTPDoer) (string, error) {
	data, err := os.ReadFile(p.path)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "spiffe",
			Message:  "failed to read SPIFFE JWT-SVID",
			Cause:    err,
		}
	}

	token := strings.TrimSpace(string(data))
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "spiffe",
			Message:  "SPIFFE JWT-SVID file is empty",
		}
	}

	return token, nil
}

func main() {
	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: spiffeJWTSVIDProvider{
				path: tokenPath,
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from SPIFFE workload identity federation."),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(response.OutputText())
}
```

```java
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.openai.auth.SubjectTokenProvider;
import com.openai.auth.SubjectTokenType;
import com.openai.auth.WorkloadIdentity;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.core.http.HttpClient;
import com.openai.errors.SubjectTokenProviderException;
import com.openai.models.ChatModel;
import com.openai.models.responses.ResponseCreateParams;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.CompletableFuture;

public final class SpiffeWorkloadIdentityExample {
    private static final String TOKEN_PATH = "/var/run/spiffe/openai.jwt";

    private SpiffeWorkloadIdentityExample() {}

    static final class SpiffeJwtSvidProvider implements SubjectTokenProvider {
        private final Path tokenPath;

        SpiffeJwtSvidProvider(String tokenPath) {
            this.tokenPath = Path.of(tokenPath);
        }

        @Override
        public SubjectTokenType tokenType() {
            return SubjectTokenType.JWT;
        }

        @Override
        public String getToken(HttpClient httpClient, JsonMapper jsonMapper) {
            String token;
            try {
                token = Files.readString(tokenPath).trim();
            } catch (Exception e) {
                throw new SubjectTokenProviderException(
                        "spiffe",
                        "failed to read SPIFFE JWT-SVID",
                        e);
            }

            if (token.isEmpty()) {
                throw new SubjectTokenProviderException(
                        "spiffe",
                        "SPIFFE JWT-SVID file is empty",
                        null);
            }

            return token;
        }

        @Override
        public CompletableFuture<String> getTokenAsync(
                HttpClient httpClient, JsonMapper jsonMapper) {
            return CompletableFuture.supplyAsync(() -> getToken(httpClient, jsonMapper));
        }
    }

    public static void main(String[] args) {
        WorkloadIdentity workloadIdentity = WorkloadIdentity.builder()
                .identityProviderId(System.getenv("OPENAI_IDENTITY_PROVIDER_ID"))
                .serviceAccountId(System.getenv("OPENAI_SERVICE_ACCOUNT_ID"))
                .provider(new SpiffeJwtSvidProvider(TOKEN_PATH))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from SPIFFE workload identity federation.")
                .build();

        client.responses().create(params).output().stream()
                .flatMap(item -> item.message().stream())
                .flatMap(message -> message.content().stream())
                .flatMap(content -> content.outputText().stream())
                .forEach(outputText -> System.out.println(outputText.text()));
    }
}
```

```ruby
require "openai"

TOKEN_PATH = "/var/run/spiffe/openai.jwt"

class SpiffeJWTSVIDProvider
  include OpenAI::Auth::SubjectTokenProvider

  def initialize(token_path:)
    @token_path = token_path
  end

  def token_type
    OpenAI::Auth::TokenType::JWT
  end

  def get_token
    token = File.read(@token_path).strip
    if token.empty?
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "SPIFFE JWT-SVID file is empty",
        provider: "spiffe"
      )
    end
    token
  rescue SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to read SPIFFE JWT-SVID: #{e.message}",
      provider: "spiffe",
      cause: e
    )
  end
end

provider = SpiffeJWTSVIDProvider.new(token_path: TOKEN_PATH)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from SPIFFE workload identity federation."
)

puts(response.output_text)
```


## SPIFFE best practices

- Use JWT-SVIDs for OpenAI workload identity federation. X.509-SVIDs are useful for mutual TLS but aren't accepted by the OpenAI token exchange endpoint.
- Use a single dedicated audience for OpenAI access. Avoid broad audiences such as a whole trust domain or environment name.
- Match exact SPIFFE IDs where possible. Use wildcard mappings only for intentionally shared trust boundaries.
- Keep JWT-SVID lifetimes short to reduce bearer-token replay risk. OpenAI access tokens never outlive the external subject token used for the exchange.
- Rotate signing keys carefully. Publish both old and new public keys through OIDC discovery during the rotation window, or update the uploaded public JWKS before issuing JWT-SVIDs with a new `kid`.
- Keep SPIRE Server and workload clocks synchronized. Significant clock skew can cause otherwise valid JWT-SVIDs to be rejected as not yet valid, too old, or expired.
- Protect the SPIFFE Workload API socket. A process that can fetch a workload's JWT-SVID can attempt to exchange it for OpenAI access.
- Align OpenAI service account boundaries with your application and environment permission boundaries. Don't share a highly privileged service account across unrelated SPIFFE workloads.
- Monitor token exchange failures for issuer, audience, signing key, and mapping mismatches.

:::
:::

