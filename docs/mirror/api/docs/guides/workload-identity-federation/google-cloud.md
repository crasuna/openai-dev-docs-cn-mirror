---
title: "为 Google Cloud 配置 workload identity federation"
description: "Configure Google workload identity or GKE as a workload identity federation token provider."
outline: deep
---

# 为 Google Cloud 配置 workload identity federation

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/workload-identity-federation/google-cloud](https://developers.openai.com/api/docs/guides/workload-identity-federation/google-cloud)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/workload-identity-federation/google-cloud.md](https://developers.openai.com/api/docs/guides/workload-identity-federation/google-cloud.md)
- 抓取时间：2026-06-27T05:54:12.544Z
- Checksum：`5b798667743981348d28b20bb4e927a5bc2ad2687a86806f9f2cdd4438138360`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
在以下任一场景中，将 Google Cloud 用作 Workload Identity Provider：

- **Google workload identity：** 将签发给已附加 Google service account 的 Google 签名 OIDC token，交换为短期 OpenAI access token。
- **Google Kubernetes Engine：** 将投射的 GKE service account token 交换为短期 OpenAI access token。





## Google workload identity

Google Cloud 工作负载可以从 Google metadata server 请求签名的 OIDC identity token，而无需存储长期 service account key。在 OpenAI workload identity federation 中，Google identity token 是 subject token，OpenAI 会先验证该 token，然后签发 OpenAI access token。此流程适用于 Compute Engine、Cloud Run、使用已附加 Google service account 的 GKE 工作负载，以及其他公开 metadata server identity endpoint 的 Google 托管运行时。

### 设置 Google workload identity

为需要调用 OpenAI API 的工作负载创建一个 Google service account。完整设置流程请参阅 Google 的[创建 service account](https://docs.cloud.google.com/iam/docs/service-accounts-create)指南。

例如，使用 Google Cloud CLI 创建 service account：

```bash
gcloud iam service-accounts create openai-wif \
  --description="Service account for OpenAI workload identity federation" \
  --display-name="OpenAI workload identity federation"
```

创建 Compute Engine VM 并附加该 service account，或将该 service account 附加到运行应用程序的 Google Cloud 资源。该资源必须能够在运行时调用 Google metadata server。有关 VM 设置详情，请参阅 Google 的[创建使用用户管理的 service account 的 VM](https://docs.cloud.google.com/compute/docs/access/create-enable-service-accounts-for-instances)指南。

不要为此流程创建或下载 service account key。工作负载会使用已附加的 service account 和 metadata server 来请求短期 OIDC token。

### 获取 Google identity token

在已附加 service account 的 Google Cloud 资源中，使用已配置的 audience 从 metadata server 请求 OIDC identity token。此 token 是 subject token，OpenAI 会将其交换为 OpenAI 签发的 access token。

```bash
AUDIENCE="https://api.openai.com/v1"

TOKEN=$(curl -sS -G -H "Metadata-Flavor: Google" \
  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity" \
  --data-urlencode "audience=${AUDIENCE}")
```

metadata server 会返回 Google 签名的 JWT。有关 metadata server identity endpoint 的更多信息，请参阅 Google 的[验证 VM identity](https://docs.cloud.google.com/compute/docs/instances/verifying-instance-identity)指南。

### 验证 token

在配置 workload identity federation 之前，先在本地解码一个 Google identity token 示例，并检查其 claims：

```bash
TOKEN="$TOKEN" python3 - <<'PY'
import base64
import json
import os

payload = os.environ["TOKEN"].split(".")[1]
payload += "=" * (-len(payload) % 4)
print(json.dumps(json.loads(base64.urlsafe_b64decode(payload)), indent=2))
PY
```

此命令会在不验证 token 签名的情况下解码 JWT payload。对于生产 token，请使用本地解码器，并避免将生产 token 粘贴到第三方工具中。

解码后的 Google metadata server identity token 将类似于：

```json
{
  "iss": "https://accounts.google.com",
  "aud": "https://api.openai.com/v1",
  "azp": "110123456789012345678",
  "sub": "110123456789012345678",
  "email": "openai-wif@my-project.iam.gserviceaccount.com",
  "email_verified": true,
  "iat": 1716235422,
  "exp": 1716239022
}
```

使用解码后的 payload，将收到的 token 与 OpenAI 中配置的 issuer、audience 和映射值进行比较。在交换 token 之前，大多数配置问题都可以从 `iss`、`aud`、`email` 和 `sub` claims 中看出来。

### 设置 workload identity federation

在 OpenAI 中为 Google 签发的 identity token 创建 Workload Identity Provider，然后添加一个 service account mapping，使其匹配 token 中的稳定 claims。

先配置 Workload Identity Provider，然后创建 service account mapping。

#### 设置 Workload Identity Provider

1. **创建 Workload Identity Provider。** 将 **Name** 设置为唯一值，例如 `google-workload-identity-prod`。使用 **Description**（例如 `Production Google Cloud workloads`）帮助管理员识别该 provider。

2. **设置 issuer 和 audience。** 将 **OIDC Issuer URL** 设置为 `https://accounts.google.com`。将 **Audience** 设置为工作负载从 Google metadata server 请求时使用的自定义 audience，例如 `https://api.openai.com/v1`。此值必须与 token 的 `aud` claim 匹配。

3. **使用 Google OIDC discovery。** 保持 **Use uploaded JWKS for token verification** 关闭。OpenAI 会使用 Google 的 OIDC discovery metadata 和 JWKS 来验证 Google 签名的 identity token。

4. **如果需要派生的映射属性，请添加 attribute transformations。** 例如，输入 `subject`，并将 expression 设置为 `assertion.sub`，以便从 subject claim 创建 `openai.subject`。dashboard 会自动应用 `openai.` 前缀。除非配置了匹配的 transformation，否则原始 token claims 中已以 `openai.` 开头的 claim 在用于 `openai.` mapping keys 时会被忽略。

#### 设置 service account mapping

1. **创建 service account mapping。** 将 **Name** 设置为 Workload Identity Provider 内的唯一值，例如 `compute-openai-wif`。使用 **Description**（例如 `Production Compute Engine OpenAI API workload`）说明哪个工作负载可以使用该 mapping。

2. **匹配稳定的 Google service account claims。** 为每个必须匹配的 claim 添加一行 **Key** 和 **Value**。使用 `sub` 作为主要 identity binding，因为它稳定且唯一。你也可以额外匹配 `email` 以提高可读性。

3. **选择 OpenAI 目标。** 将 **Project** 设置为拥有目标 service account 的 OpenAI project。将 **Service account** 设置为 Google Cloud 工作负载可以使用的 OpenAI service account，例如 `google-workload-identity-prod-openai-wif`。

4. **按需收窄 API 权限。** 选择适当的 **Permissions**，例如 `api.model.request` 和 `api.vector_store.read`，以进一步收窄从此 mapping 铸造的 access tokens。将 permissions 留空可避免添加 WIF 专用 scope 限制；该 token 仍会以映射到的 service account 身份授权。

### 在代码中使用 token

配置 OpenAI SDK client，使其从 metadata server 请求 Google identity token，并将其交换为 OpenAI 签发的 access token。

将 `OPENAI_WIF_AUDIENCE` 设置为配置为 Workload Identity Provider audience 的自定义 audience。SDK 会为该 audience 请求 Google identity token，将其交换为 OpenAI 签发的 access token，并使用 OpenAI token 对 API 请求进行身份验证。

使用 Google metadata server identity token 进行身份验证

```typescript
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const metadataEndpoint =
  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity";

const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;
const audience = process.env.OPENAI_WIF_AUDIENCE;

if (!identityProviderId || !serviceAccountId || !audience) {
  throw new Error(
    "Set OPENAI_IDENTITY_PROVIDER_ID, OPENAI_SERVICE_ACCOUNT_ID, and OPENAI_WIF_AUDIENCE"
  );
}

function googleMetadataIdentityTokenProvider(audience: string): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const url = new URL(metadataEndpoint);
      url.searchParams.set("audience", audience);
      url.searchParams.set("format", "full");

      const response = await fetch(url, {
        headers: { "Metadata-Flavor": "Google" },
      });

      if (!response.ok) {
        throw new Error(
          `Google metadata token request failed with status ${response.status}.`
        );
      }

      const token = (await response.text()).trim();
      if (!token) {
        throw new Error("Google metadata server did not return an identity token.");
      }

      return token;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: googleMetadataIdentityTokenProvider(audience),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from Google Cloud workload identity federation.",
});

console.log(response.output_text);
```

```python
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from openai import OpenAI
from openai.auth import SubjectTokenProvider

METADATA_ENDPOINT = (
    "http://metadata.google.internal/computeMetadata/v1/instance/"
    "service-accounts/default/identity"
)


def google_metadata_identity_token_provider(audience: str) -> SubjectTokenProvider:
    def get_token() -> str:
        request = Request(
            f"{METADATA_ENDPOINT}?{urlencode({'audience': audience, 'format': 'full'})}",
            headers={"Metadata-Flavor": "Google"},
        )

        with urlopen(request, timeout=10) as response:
            token = response.read().decode("utf-8").strip()

        if not token:
            raise RuntimeError("Google metadata server did not return an identity token.")
        return token

    return {"token_type": "jwt", "get_token": get_token}

client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": google_metadata_identity_token_provider(
            audience=os.environ["OPENAI_WIF_AUDIENCE"]
        ),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from Google Cloud workload identity federation.",
)

print(response.output_text)
```

```go
package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/auth"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
)

const googleMetadataEndpoint = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity"

type googleMetadataIdentityTokenProvider struct {
	audience string
}

func (p googleMetadataIdentityTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p googleMetadataIdentityTokenProvider) GetToken(ctx context.Context, httpClient auth.HTTPDoer) (string, error) {
	values := url.Values{}
	values.Set("audience", p.audience)
	values.Set("format", "full")

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, googleMetadataEndpoint+"?"+values.Encode(), nil)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-metadata",
			Message:  "failed to build Google metadata token request",
			Cause:    err,
		}
	}
	req.Header.Set("Metadata-Flavor", "Google")

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-metadata",
			Message:  "failed to request Google identity token",
			Cause:    err,
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-metadata",
			Message:  fmt.Sprintf("Google metadata token request failed with status %d", resp.StatusCode),
		}
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-metadata",
			Message:  "failed to read Google metadata token response",
			Cause:    err,
		}
	}

	token := strings.TrimSpace(string(data))
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-metadata",
			Message:  "Google metadata server did not return an identity token",
		}
	}

	return token, nil
}

func main() {
	audience := os.Getenv("OPENAI_WIF_AUDIENCE")
	if audience == "" {
		log.Fatal("Set OPENAI_WIF_AUDIENCE")
	}

	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: googleMetadataIdentityTokenProvider{
				audience: audience,
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from Google Cloud workload identity federation."),
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
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;

public final class GoogleWorkloadIdentityExample {
    private static final String METADATA_ENDPOINT =
            "http://metadata.google.internal/computeMetadata/v1/instance/"
                    + "service-accounts/default/identity";

    private GoogleWorkloadIdentityExample() {}

    static final class GoogleMetadataIdentityTokenProvider implements SubjectTokenProvider {
        private final String audience;

        GoogleMetadataIdentityTokenProvider(String audience) {
            this.audience = audience;
        }

        @Override
        public SubjectTokenType tokenType() {
            return SubjectTokenType.JWT;
        }

        @Override
        public String getToken(HttpClient httpClient, JsonMapper jsonMapper) {
            try {
                String query = "audience="
                        + URLEncoder.encode(audience, StandardCharsets.UTF_8)
                        + "&format=full";
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(METADATA_ENDPOINT + "?" + query))
                        .header("Metadata-Flavor", "Google")
                        .GET()
                        .build();

                HttpResponse<String> response = java.net.http.HttpClient.newHttpClient()
                        .send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    throw new SubjectTokenProviderException(
                            "google-metadata",
                            "Google metadata token request failed with status "
                                    + response.statusCode(),
                            null);
                }

                String token = response.body().trim();
                if (token.isEmpty()) {
                    throw new SubjectTokenProviderException(
                            "google-metadata",
                            "Google metadata server did not return an identity token",
                            null);
                }

                return token;
            } catch (SubjectTokenProviderException e) {
                throw e;
            } catch (Exception e) {
                throw new SubjectTokenProviderException(
                        "google-metadata",
                        "failed to request Google identity token",
                        e);
            }
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
                .provider(new GoogleMetadataIdentityTokenProvider(
                        System.getenv("OPENAI_WIF_AUDIENCE")))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from Google Cloud workload identity federation.")
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
require "net/http"
require "openai"
require "uri"

class GoogleMetadataIdentityTokenProvider
  include OpenAI::Auth::SubjectTokenProvider

  METADATA_ENDPOINT =
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity"

  def initialize(audience:)
    @audience = audience
  end

  def token_type
    OpenAI::Auth::TokenType::JWT
  end

  def get_token
    uri = URI(METADATA_ENDPOINT)
    uri.query = URI.encode_www_form(
      audience: @audience,
      format: "full"
    )

    request = Net::HTTP::Get.new(uri)
    request["Metadata-Flavor"] = "Google"

    response = Net::HTTP.start(uri.hostname, uri.port, read_timeout: 10) do |http|
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "Google metadata token request failed with status #{response.code}",
        provider: "google-metadata"
      )
    end

    token = response.body.strip
    if token.empty?
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "Google metadata server did not return an identity token",
        provider: "google-metadata"
      )
    end
    token
  rescue SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to request Google identity token: #{e.message}",
      provider: "google-metadata",
      cause: e
    )
  end
end

provider = GoogleMetadataIdentityTokenProvider.new(
  audience: ENV.fetch("OPENAI_WIF_AUDIENCE")
)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from Google Cloud workload identity federation."
)

puts(response.output_text)
```






## Google Kubernetes Engine

通过将 GKE 签发的投射 service account token 交换为短期 OpenAI access token，将 Google Kubernetes Engine 用作 Workload Identity Provider。

GKE 工作负载可以使用以下任一方式进行身份验证：

- 由集群 OIDC issuer 签发的投射 Kubernetes service account token。
- 通过 GKE Workload Identity 获取的 Google service account identity token，其中 Kubernetes service account 绑定到 Google service account。

如果你希望 OpenAI 直接信任集群的 OIDC issuer，请使用投射 Kubernetes service account token。如果你的工作负载已经依赖 Google service account identity，并且希望 OpenAI 改为信任 Google 签发的 identity token，请使用 GKE Workload Identity。

如果你的 GKE 工作负载已配置 GKE Workload Identity，并且可以从 metadata server 请求 Google identity token，请改为遵循上面的 [Google workload identity](/mirror/api/docs/guides/workload-identity-federation/google-cloud#google-workload-identity) 说明，而不是使用 GKE projected token flow。

### 设置 GKE

这些说明假定使用托管 GKE 集群。对于自管理 Kubernetes 集群，请使用 [Kubernetes 指南](/mirror/api/docs/guides/workload-identity-federation/kubernetes)。

为需要调用 OpenAI API 的 GKE 工作负载使用 Kubernetes `ServiceAccount`。如果还没有，请创建一个：

```bash
kubectl create serviceaccount openai-wif --namespace default
```

检索与 GKE 集群关联的 issuer URL：

```bash
kubectl get --raw /.well-known/openid-configuration | jq -r .issuer
```

示例输出：

```text
https://container.googleapis.com/v1/projects/my-project/locations/us-central1/clusters/openai-wif
```

你在 OpenAI Workload Identity Provider 中配置的 issuer 必须与此 issuer URL 以及投射 GKE service account token 中的 `iss` claim 匹配。

使用 OpenAI 预期的 audience 和适合工作负载的过期时间来配置投射 service account token。OpenAI 会验证 token 的 issuer、signature、audience 和 expiration。在此示例中，token 文件挂载在 `/var/run/secrets/tokens/token`，使用 audience `https://api.openai.com/v1`，并在 3600 秒后过期。如果投射 token audience 与 OpenAI Workload Identity Provider audience 匹配，你可以使用不同的 audience：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: openai-wif-app
  namespace: default
spec:
  serviceAccountName: openai-wif
  containers:
    - name: app
      image: my-image
      volumeMounts:
        - name: gke-sa-token
          mountPath: /var/run/secrets/tokens
          readOnly: true
  volumes:
    - name: gke-sa-token
      projected:
        sources:
          - serviceAccountToken:
              path: token
              audience: "https://api.openai.com/v1"
              expirationSeconds: 3600
```

### 验证 token

在配置 workload identity federation 之前，先在本地解码一个投射 service account token 示例，并检查其 claims。从挂载了投射 token 的运行中 pod 执行：

```bash
TOKEN=$(kubectl exec -n default openai-wif-app -- cat /var/run/secrets/tokens/token)

TOKEN="$TOKEN" python3 - <<'PY'
import base64
import json
import os

payload = os.environ["TOKEN"].split(".")[1]
payload += "=" * (-len(payload) % 4)
print(json.dumps(json.loads(base64.urlsafe_b64decode(payload)), indent=2))
PY
```

此命令会在不验证 token 签名的情况下解码 JWT payload。对于生产 token，请使用本地解码器，并避免将生产 token 粘贴到第三方工具中。

解码后的 GKE 投射 service account token 将类似于：

```json
{
  "iss": "https://container.googleapis.com/v1/projects/my-project/locations/us-central1/clusters/openai-wif",
  "aud": ["https://api.openai.com/v1"],
  "sub": "system:serviceaccount:default:openai-wif",
  "iat": 1716235422,
  "exp": 1716239022,
  "kubernetes.io": {
    "namespace": "default",
    "serviceaccount": {
      "name": "openai-wif",
      "uid": "11111111-2222-3333-4444-555555555555"
    }
  }
}
```

使用解码后的 payload，将收到的 token 与 OpenAI 中配置的 issuer、audience 和映射值进行比较。在交换 token 之前，大多数配置问题都可以从 `iss`、`aud` 和 `sub` claims 中看出来。

### 设置 workload identity federation

在 OpenAI 中为 GKE issuer 创建 Workload Identity Provider，然后添加一个 service account mapping，使其匹配投射 token 中的 attributes。

先配置 Workload Identity Provider，然后创建 service account mapping。

#### 设置 Workload Identity Provider

1. **创建 Workload Identity Provider。** 将 **Name** 设置为唯一值，例如 `google-gke-prod`。使用 **Description**（例如 `Production GKE cluster`）帮助管理员识别该集群。

2. **设置 issuer 和 audience。** 将 **OIDC Issuer URL** 设置为 `kubectl get --raw /.well-known/openid-configuration | jq -r .issuer` 返回的 issuer。此值必须与投射 GKE service account token 中的 `iss` claim 匹配。将 **Audience** 设置为投射 service account token volume 上配置的同一 audience。在此示例中，该值为 `https://api.openai.com/v1`。

3. **使用 GKE OIDC discovery。** 保持 **Use uploaded JWKS for token verification** 关闭。OpenAI 会使用 GKE issuer 的 OIDC discovery metadata 和 JWKS 来验证投射 service account token。

4. **如果需要派生的映射属性，请添加 attribute transformations。** 例如，输入 `gke_subject`，并将 expression 设置为 `assertion.sub`，以创建 `openai.gke_subject`。dashboard 会自动应用 `openai.` 前缀。除非配置了匹配的 transformation，否则原始 token claims 中已以 `openai.` 开头的 claim 在用于 `openai.` mapping keys 时会被忽略。

#### 设置 service account mapping

1. **创建 service account mapping。** 将 **Name** 设置为 Workload Identity Provider 内的唯一值，例如 `default-openai-wif`。使用 **Description**（例如 `Default namespace GKE OpenAI API workload`）说明哪个工作负载可以使用该 mapping。

2. **匹配 GKE service account subject。** 将 **Key** 设置为 `sub`，将 **Value** 设置为 `system:serviceaccount:default:openai-wif`。对于 GKE service accounts，subject 格式为 `system:serviceaccount:&lt;namespace&gt;:&lt;service-account-name&gt;`。

3. **选择 OpenAI 目标。** 将 **Project** 设置为拥有目标 service account 的 OpenAI project。将 **Service account** 设置为 GKE 工作负载可以使用的 OpenAI service account，例如 `google-gke-prod-openai-wif`。

4. **按需收窄 API 权限。** 选择适当的 **Permissions**，例如 `api.model.request` 和 `api.vector_store.read`，以进一步收窄从此 mapping 铸造的 access tokens。将 permissions 留空可避免添加 WIF 专用 scope 限制；该 token 仍会以映射到的 service account 身份授权。

### 在代码中使用 token

配置 OpenAI SDK client，使其读取投射 GKE service account token，并将其交换为 OpenAI 签发的 access token。

将挂载的 token 路径（例如 `/var/run/secrets/tokens/token`）用作 SDK workload identity federation provider 的 subject token source。SDK 会将该 GKE token 交换为 OpenAI 签发的 access token，并使用 OpenAI token 对 API 请求进行身份验证。

以下示例使用自定义 subject token provider 初始化 OpenAI client。该 provider 会从挂载的文件路径读取投射 GKE service account token，并将其用作 workload identity federation 的 subject token。

使用 GKE 投射 service account token 进行身份验证

```typescript
import { readFile } from "node:fs/promises";
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const tokenPath = "/var/run/secrets/tokens/token";
const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;

if (!identityProviderId || !serviceAccountId) {
  throw new Error("Set OPENAI_IDENTITY_PROVIDER_ID and OPENAI_SERVICE_ACCOUNT_ID");
}

function mountedGkeServiceAccountTokenProvider(path: string): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const token = (await readFile(path, "utf8")).trim();
      if (!token) {
        throw new Error("The mounted GKE service account token file is empty.");
      }
      return token;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: mountedGkeServiceAccountTokenProvider(tokenPath),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from Google GKE workload identity federation.",
});

console.log(response.output_text);
```

```python
import os
from pathlib import Path

from openai import OpenAI
from openai.auth import SubjectTokenProvider

TOKEN_PATH = "/var/run/secrets/tokens/token"


def mounted_gke_service_account_token_provider(token_path: str) -> SubjectTokenProvider:
    def get_token() -> str:
        token = Path(token_path).read_text().strip()
        if not token:
            raise RuntimeError("The mounted GKE service account token file is empty.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": mounted_gke_service_account_token_provider(TOKEN_PATH),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from Google GKE workload identity federation.",
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

const tokenPath = "/var/run/secrets/tokens/token"

type mountedGkeServiceAccountTokenProvider struct {
	path string
}

func (p mountedGkeServiceAccountTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p mountedGkeServiceAccountTokenProvider) GetToken(_ context.Context, _ auth.HTTPDoer) (string, error) {
	data, err := os.ReadFile(p.path)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-gke",
			Message:  "failed to read mounted GKE service account token",
			Cause:    err,
		}
	}

	token := strings.TrimSpace(string(data))
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-gke",
			Message:  "mounted GKE service account token is empty",
		}
	}

	return token, nil
}

func main() {
	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: mountedGkeServiceAccountTokenProvider{
				path: tokenPath,
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from Google GKE workload identity federation."),
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

public final class GoogleGkeWorkloadIdentityExample {
    private static final String TOKEN_PATH = "/var/run/secrets/tokens/token";

    private GoogleGkeWorkloadIdentityExample() {}

    static final class MountedGkeServiceAccountTokenProvider implements SubjectTokenProvider {
        private final Path tokenPath;

        MountedGkeServiceAccountTokenProvider(String tokenPath) {
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
                        "google-gke",
                        "failed to read mounted GKE service account token",
                        e);
            }

            if (token.isEmpty()) {
                throw new SubjectTokenProviderException(
                        "google-gke",
                        "mounted GKE service account token is empty",
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
                .provider(new MountedGkeServiceAccountTokenProvider(TOKEN_PATH))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from Google GKE workload identity federation.")
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

TOKEN_PATH = "/var/run/secrets/tokens/token"

class MountedGkeServiceAccountTokenProvider
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
        message: "Mounted GKE service account token is empty",
        provider: "google-gke"
      )
    end
    token
  rescue SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to read mounted GKE service account token: #{e.message}",
      provider: "google-gke",
      cause: e
    )
  end
end

provider = MountedGkeServiceAccountTokenProvider.new(token_path: TOKEN_PATH)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from Google GKE workload identity federation."
)

puts(response.output_text)
```






## Google Cloud 最佳实践

- 为每个工作负载使用专用 Google service account。避免在无关服务或环境之间共享 service account。
- 使用 workload identity 流程，而不是长期 service account key。对于可以使用 metadata-server identity token 或 GKE Workload Identity 的工作负载，避免分发和轮换 JSON key 文件。
- 将 identity 的作用范围限制在最小可行的工作负载边界内。为各个应用程序分别使用 service account，可以提供更清晰的审计和最小权限访问。
- 谨慎使用基于 attribute 的映射。尽可能优先使用 service account subject claims 等稳定标识符，而不是可变 metadata。
- 分离生产和非生产项目。不同的项目可降低意外共享权限的风险，并简化审计。
- 仅授予所需 IAM permissions。将 Google identity 限制为仅拥有工作负载所需的 permissions。
- 监控 service account 使用情况。意外的 token exchange 可能表明配置漂移或工作负载已遭入侵。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Use Google Cloud as a Workload Identity Provider in either of these scenarios:

- **Google workload identity:** Exchange a Google-signed OIDC token issued to an attached Google service account for a short-lived OpenAI access token.
- **Google Kubernetes Engine:** Exchange a projected GKE service account token for a short-lived OpenAI access token.



<div data-content-switcher-pane data-value="workload-identity">

## Google workload identity

Google Cloud workloads can request signed OIDC identity tokens from the Google metadata server without storing long-lived service account keys. In OpenAI workload identity federation, the Google identity token is the subject token that OpenAI validates before issuing an OpenAI access token. This flow works on Compute Engine, Cloud Run, GKE workloads using attached Google service accounts, and other Google-managed runtimes that expose the metadata server identity endpoint.

### Setting up Google workload identity

Create a Google service account for the workload that needs to call the OpenAI API. For the full setup flow, see Google's guide to [create service accounts](https://docs.cloud.google.com/iam/docs/service-accounts-create).

For example, create a service account with the Google Cloud CLI:

```bash
gcloud iam service-accounts create openai-wif \
  --description="Service account for OpenAI workload identity federation" \
  --display-name="OpenAI workload identity federation"
```

Create the Compute Engine VM with the service account attached, or attach the service account to the Google Cloud resource running your application. The resource must be able to call the Google metadata server at runtime. For VM setup details, see Google's guide to [create a VM that uses a user-managed service account](https://docs.cloud.google.com/compute/docs/access/create-enable-service-accounts-for-instances).

Do not create or download service account keys for this flow. The workload uses the attached service account and the metadata server to request a short-lived OIDC token.

### Getting a Google identity token

From the Google Cloud resource with the service account attached, request an OIDC identity token from the metadata server with the configured audience. This token is the subject token that OpenAI exchanges for an OpenAI-issued access token.

```bash
AUDIENCE="https://api.openai.com/v1"

TOKEN=$(curl -sS -G -H "Metadata-Flavor: Google" \
  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity" \
  --data-urlencode "audience=${AUDIENCE}")
```

The metadata server returns a Google-signed JWT. For more information about the metadata server identity endpoint, see Google's guide to [verify VM identity](https://docs.cloud.google.com/compute/docs/instances/verifying-instance-identity).

### Verify the token

Before configuring workload identity federation, decode a sample Google identity token locally and inspect its claims:

```bash
TOKEN="$TOKEN" python3 - <<'PY'
import base64
import json
import os

payload = os.environ["TOKEN"].split(".")[1]
payload += "=" * (-len(payload) % 4)
print(json.dumps(json.loads(base64.urlsafe_b64decode(payload)), indent=2))
PY
```

This command decodes the JWT payload without verifying the token signature. Use a local decoder for production tokens, and avoid pasting production tokens into third-party tools.

A decoded Google metadata server identity token will look similar to:

```json
{
  "iss": "https://accounts.google.com",
  "aud": "https://api.openai.com/v1",
  "azp": "110123456789012345678",
  "sub": "110123456789012345678",
  "email": "openai-wif@my-project.iam.gserviceaccount.com",
  "email_verified": true,
  "iat": 1716235422,
  "exp": 1716239022
}
```

Use the decoded payload to compare the token you received with the issuer, audience, and mapping values configured in OpenAI. Most configuration issues are visible in the `iss`, `aud`, `email`, and `sub` claims before you exchange the token.

### Setting up workload identity federation

Create a Workload Identity Provider in OpenAI for Google-issued identity tokens, then add a service account mapping that matches stable claims from the token.

Configure the Workload Identity Provider first, then create the service account mapping.

#### Set up the Workload Identity Provider

1. **Create the Workload Identity Provider.** Set **Name** to a unique value, such as `google-workload-identity-prod`. Use **Description**, such as `Production Google Cloud workloads`, to help admins identify the provider.

2. **Set the issuer and audience.** Set **OIDC Issuer URL** to `https://accounts.google.com`. Set **Audience** to the custom audience your workload requests from the Google metadata server, such as `https://api.openai.com/v1`. This value must match the token's `aud` claim.

3. **Use Google OIDC discovery.** Leave **Use uploaded JWKS for token verification** disabled. OpenAI uses Google's OIDC discovery metadata and JWKS to verify the Google-signed identity token.

4. **Add attribute transformations if you need derived mapping attributes.** For example, enter `subject` with expression `assertion.sub` to create `openai.subject` from the subject claim. The dashboard applies the `openai.` prefix automatically. Raw token claims that already start with `openai.` are ignored for `openai.` mapping keys unless a matching transformation is configured.

#### Set up the service account mapping

1. **Create a service account mapping.** Set **Name** to a unique value within the Workload Identity Provider, such as `compute-openai-wif`. Use **Description**, such as `Production Compute Engine OpenAI API workload`, to explain which workload can use the mapping.

2. **Match stable Google service account claims.** Add one **Key** and **Value** row for each claim that must match. Use `sub` as the primary identity binding because it is stable and unique. You may additionally match `email` for readability.

3. **Choose the OpenAI target.** Set **Project** to the OpenAI project that owns the target service account. Set **Service account** to the OpenAI service account the Google Cloud workload can use, such as `google-workload-identity-prod-openai-wif`.

4. **Narrow API permissions if needed.** Select appropriate **Permissions** such as `api.model.request` and `api.vector_store.read` to further narrow access tokens minted from this mapping. Leave permissions blank to avoid adding a WIF-specific scope restriction; the token still authorizes as the mapped service account.

### Using the token in code

Configure your OpenAI SDK client to request a Google identity token from the metadata server and exchange it for an OpenAI-issued access token.

Set `OPENAI_WIF_AUDIENCE` to the custom audience configured as the Workload Identity Provider audience. The SDK requests a Google identity token for that audience, exchanges it for an OpenAI-issued access token, and uses the OpenAI token to authenticate API requests.

Authenticate from a Google metadata server identity token

```typescript
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const metadataEndpoint =
  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity";

const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;
const audience = process.env.OPENAI_WIF_AUDIENCE;

if (!identityProviderId || !serviceAccountId || !audience) {
  throw new Error(
    "Set OPENAI_IDENTITY_PROVIDER_ID, OPENAI_SERVICE_ACCOUNT_ID, and OPENAI_WIF_AUDIENCE"
  );
}

function googleMetadataIdentityTokenProvider(audience: string): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const url = new URL(metadataEndpoint);
      url.searchParams.set("audience", audience);
      url.searchParams.set("format", "full");

      const response = await fetch(url, {
        headers: { "Metadata-Flavor": "Google" },
      });

      if (!response.ok) {
        throw new Error(
          `Google metadata token request failed with status ${response.status}.`
        );
      }

      const token = (await response.text()).trim();
      if (!token) {
        throw new Error("Google metadata server did not return an identity token.");
      }

      return token;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: googleMetadataIdentityTokenProvider(audience),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from Google Cloud workload identity federation.",
});

console.log(response.output_text);
```

```python
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from openai import OpenAI
from openai.auth import SubjectTokenProvider

METADATA_ENDPOINT = (
    "http://metadata.google.internal/computeMetadata/v1/instance/"
    "service-accounts/default/identity"
)


def google_metadata_identity_token_provider(audience: str) -> SubjectTokenProvider:
    def get_token() -> str:
        request = Request(
            f"{METADATA_ENDPOINT}?{urlencode({'audience': audience, 'format': 'full'})}",
            headers={"Metadata-Flavor": "Google"},
        )

        with urlopen(request, timeout=10) as response:
            token = response.read().decode("utf-8").strip()

        if not token:
            raise RuntimeError("Google metadata server did not return an identity token.")
        return token

    return {"token_type": "jwt", "get_token": get_token}

client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": google_metadata_identity_token_provider(
            audience=os.environ["OPENAI_WIF_AUDIENCE"]
        ),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from Google Cloud workload identity federation.",
)

print(response.output_text)
```

```go
package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/auth"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
)

const googleMetadataEndpoint = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity"

type googleMetadataIdentityTokenProvider struct {
	audience string
}

func (p googleMetadataIdentityTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p googleMetadataIdentityTokenProvider) GetToken(ctx context.Context, httpClient auth.HTTPDoer) (string, error) {
	values := url.Values{}
	values.Set("audience", p.audience)
	values.Set("format", "full")

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, googleMetadataEndpoint+"?"+values.Encode(), nil)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-metadata",
			Message:  "failed to build Google metadata token request",
			Cause:    err,
		}
	}
	req.Header.Set("Metadata-Flavor", "Google")

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-metadata",
			Message:  "failed to request Google identity token",
			Cause:    err,
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-metadata",
			Message:  fmt.Sprintf("Google metadata token request failed with status %d", resp.StatusCode),
		}
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-metadata",
			Message:  "failed to read Google metadata token response",
			Cause:    err,
		}
	}

	token := strings.TrimSpace(string(data))
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-metadata",
			Message:  "Google metadata server did not return an identity token",
		}
	}

	return token, nil
}

func main() {
	audience := os.Getenv("OPENAI_WIF_AUDIENCE")
	if audience == "" {
		log.Fatal("Set OPENAI_WIF_AUDIENCE")
	}

	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: googleMetadataIdentityTokenProvider{
				audience: audience,
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from Google Cloud workload identity federation."),
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
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;

public final class GoogleWorkloadIdentityExample {
    private static final String METADATA_ENDPOINT =
            "http://metadata.google.internal/computeMetadata/v1/instance/"
                    + "service-accounts/default/identity";

    private GoogleWorkloadIdentityExample() {}

    static final class GoogleMetadataIdentityTokenProvider implements SubjectTokenProvider {
        private final String audience;

        GoogleMetadataIdentityTokenProvider(String audience) {
            this.audience = audience;
        }

        @Override
        public SubjectTokenType tokenType() {
            return SubjectTokenType.JWT;
        }

        @Override
        public String getToken(HttpClient httpClient, JsonMapper jsonMapper) {
            try {
                String query = "audience="
                        + URLEncoder.encode(audience, StandardCharsets.UTF_8)
                        + "&format=full";
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(METADATA_ENDPOINT + "?" + query))
                        .header("Metadata-Flavor", "Google")
                        .GET()
                        .build();

                HttpResponse<String> response = java.net.http.HttpClient.newHttpClient()
                        .send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    throw new SubjectTokenProviderException(
                            "google-metadata",
                            "Google metadata token request failed with status "
                                    + response.statusCode(),
                            null);
                }

                String token = response.body().trim();
                if (token.isEmpty()) {
                    throw new SubjectTokenProviderException(
                            "google-metadata",
                            "Google metadata server did not return an identity token",
                            null);
                }

                return token;
            } catch (SubjectTokenProviderException e) {
                throw e;
            } catch (Exception e) {
                throw new SubjectTokenProviderException(
                        "google-metadata",
                        "failed to request Google identity token",
                        e);
            }
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
                .provider(new GoogleMetadataIdentityTokenProvider(
                        System.getenv("OPENAI_WIF_AUDIENCE")))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from Google Cloud workload identity federation.")
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
require "net/http"
require "openai"
require "uri"

class GoogleMetadataIdentityTokenProvider
  include OpenAI::Auth::SubjectTokenProvider

  METADATA_ENDPOINT =
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity"

  def initialize(audience:)
    @audience = audience
  end

  def token_type
    OpenAI::Auth::TokenType::JWT
  end

  def get_token
    uri = URI(METADATA_ENDPOINT)
    uri.query = URI.encode_www_form(
      audience: @audience,
      format: "full"
    )

    request = Net::HTTP::Get.new(uri)
    request["Metadata-Flavor"] = "Google"

    response = Net::HTTP.start(uri.hostname, uri.port, read_timeout: 10) do |http|
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "Google metadata token request failed with status #{response.code}",
        provider: "google-metadata"
      )
    end

    token = response.body.strip
    if token.empty?
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "Google metadata server did not return an identity token",
        provider: "google-metadata"
      )
    end
    token
  rescue SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to request Google identity token: #{e.message}",
      provider: "google-metadata",
      cause: e
    )
  end
end

provider = GoogleMetadataIdentityTokenProvider.new(
  audience: ENV.fetch("OPENAI_WIF_AUDIENCE")
)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from Google Cloud workload identity federation."
)

puts(response.output_text)
```


  </div>

  <div data-content-switcher-pane data-value="gke" hidden>

## Google Kubernetes Engine

Use Google Kubernetes Engine as a Workload Identity Provider by exchanging a GKE-issued projected service account token for a short-lived OpenAI access token.

GKE workloads can authenticate using either:

- A projected Kubernetes service account token issued by the cluster OIDC issuer.
- A Google service account identity token obtained through GKE Workload Identity, where a Kubernetes service account is bound to a Google service account.

Use projected Kubernetes service account tokens when you want OpenAI to trust the cluster's OIDC issuer directly. Use GKE Workload Identity when your workload already relies on a Google service account identity and you want OpenAI to trust Google-issued identity tokens instead.

If your GKE workload is configured with GKE Workload Identity and can request
  Google identity tokens from the metadata server, follow the [Google workload
  identity](#google-workload-identity) instructions above instead of the GKE
  projected token flow.

### Setting up GKE

These instructions assume a managed GKE cluster. For a self-managed Kubernetes cluster, use the [Kubernetes guide](https://developers.openai.com/api/docs/guides/workload-identity-federation/kubernetes).

Use a Kubernetes `ServiceAccount` for the GKE workload that needs to call the OpenAI API. If you do not already have one, create it:

```bash
kubectl create serviceaccount openai-wif --namespace default
```

Retrieve the issuer URL associated with the GKE cluster:

```bash
kubectl get --raw /.well-known/openid-configuration | jq -r .issuer
```

Example output:

```text
https://container.googleapis.com/v1/projects/my-project/locations/us-central1/clusters/openai-wif
```

The issuer you configure in the OpenAI Workload Identity Provider must match this issuer URL and the `iss` claim in the projected GKE service account token.

Configure the projected service account token with the audience OpenAI expects and an expiration suitable for your workload. OpenAI validates the token's issuer, signature, audience, and expiration. In this example, the token file is mounted at `/var/run/secrets/tokens/token`, uses the audience `https://api.openai.com/v1`, and expires after 3600 seconds. You may use a different audience if the projected token audience and OpenAI Workload Identity Provider audience match:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: openai-wif-app
  namespace: default
spec:
  serviceAccountName: openai-wif
  containers:
    - name: app
      image: my-image
      volumeMounts:
        - name: gke-sa-token
          mountPath: /var/run/secrets/tokens
          readOnly: true
  volumes:
    - name: gke-sa-token
      projected:
        sources:
          - serviceAccountToken:
              path: token
              audience: "https://api.openai.com/v1"
              expirationSeconds: 3600
```

### Verify the token

Before configuring workload identity federation, decode a sample projected service account token locally and inspect its claims. From a running pod with the projected token mounted:

```bash
TOKEN=$(kubectl exec -n default openai-wif-app -- cat /var/run/secrets/tokens/token)

TOKEN="$TOKEN" python3 - <<'PY'
import base64
import json
import os

payload = os.environ["TOKEN"].split(".")[1]
payload += "=" * (-len(payload) % 4)
print(json.dumps(json.loads(base64.urlsafe_b64decode(payload)), indent=2))
PY
```

This command decodes the JWT payload without verifying the token signature. Use a local decoder for production tokens, and avoid pasting production tokens into third-party tools.

A decoded GKE projected service account token will look similar to:

```json
{
  "iss": "https://container.googleapis.com/v1/projects/my-project/locations/us-central1/clusters/openai-wif",
  "aud": ["https://api.openai.com/v1"],
  "sub": "system:serviceaccount:default:openai-wif",
  "iat": 1716235422,
  "exp": 1716239022,
  "kubernetes.io": {
    "namespace": "default",
    "serviceaccount": {
      "name": "openai-wif",
      "uid": "11111111-2222-3333-4444-555555555555"
    }
  }
}
```

Use the decoded payload to compare the token you received with the issuer, audience, and mapping values configured in OpenAI. Most configuration issues are visible in the `iss`, `aud`, and `sub` claims before you exchange the token.

### Setting up workload identity federation

Create a Workload Identity Provider in OpenAI for the GKE issuer, then add a service account mapping that matches attributes from the projected token.

Configure the Workload Identity Provider first, then create the service account mapping.

#### Set up the Workload Identity Provider

1. **Create the Workload Identity Provider.** Set **Name** to a unique value, such as `google-gke-prod`. Use **Description**, such as `Production GKE cluster`, to help admins identify the cluster.

2. **Set the issuer and audience.** Set **OIDC Issuer URL** to the issuer returned by `kubectl get --raw /.well-known/openid-configuration | jq -r .issuer`. This value must match the `iss` claim in the projected GKE service account token. Set **Audience** to the same audience configured on the projected service account token volume. In this example, that value is `https://api.openai.com/v1`.

3. **Use GKE OIDC discovery.** Leave **Use uploaded JWKS for token verification** disabled. OpenAI uses the GKE issuer's OIDC discovery metadata and JWKS to verify the projected service account token.

4. **Add attribute transformations if you need derived mapping attributes.** For example, enter `gke_subject` with expression `assertion.sub` to create `openai.gke_subject`. The dashboard applies the `openai.` prefix automatically. Raw token claims that already start with `openai.` are ignored for `openai.` mapping keys unless a matching transformation is configured.

#### Set up the service account mapping

1. **Create a service account mapping.** Set **Name** to a unique value within the Workload Identity Provider, such as `default-openai-wif`. Use **Description**, such as `Default namespace GKE OpenAI API workload`, to explain which workload can use the mapping.

2. **Match the GKE service account subject.** Set **Key** to `sub` and **Value** to `system:serviceaccount:default:openai-wif`. For GKE service accounts, the subject format is `system:serviceaccount:<namespace>:<service-account-name>`.

3. **Choose the OpenAI target.** Set **Project** to the OpenAI project that owns the target service account. Set **Service account** to the OpenAI service account the GKE workload can use, such as `google-gke-prod-openai-wif`.

4. **Narrow API permissions if needed.** Select appropriate **Permissions** such as `api.model.request` and `api.vector_store.read` to further narrow access tokens minted from this mapping. Leave permissions blank to avoid adding a WIF-specific scope restriction; the token still authorizes as the mapped service account.

### Using the token in code

Configure your OpenAI SDK client to read the projected GKE service account token and exchange it for an OpenAI-issued access token.

Use the mounted token path, such as `/var/run/secrets/tokens/token`, as the subject token source for the SDK workload identity federation provider. The SDK exchanges that GKE token for an OpenAI-issued access token and uses the OpenAI token to authenticate API requests.

The following examples initialize an OpenAI client with a custom subject token provider. The provider reads the projected GKE service account token from the mounted file path and uses it as the subject token for workload identity federation.

Authenticate from a GKE projected service account token

```typescript
import { readFile } from "node:fs/promises";
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const tokenPath = "/var/run/secrets/tokens/token";
const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;

if (!identityProviderId || !serviceAccountId) {
  throw new Error("Set OPENAI_IDENTITY_PROVIDER_ID and OPENAI_SERVICE_ACCOUNT_ID");
}

function mountedGkeServiceAccountTokenProvider(path: string): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const token = (await readFile(path, "utf8")).trim();
      if (!token) {
        throw new Error("The mounted GKE service account token file is empty.");
      }
      return token;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: mountedGkeServiceAccountTokenProvider(tokenPath),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from Google GKE workload identity federation.",
});

console.log(response.output_text);
```

```python
import os
from pathlib import Path

from openai import OpenAI
from openai.auth import SubjectTokenProvider

TOKEN_PATH = "/var/run/secrets/tokens/token"


def mounted_gke_service_account_token_provider(token_path: str) -> SubjectTokenProvider:
    def get_token() -> str:
        token = Path(token_path).read_text().strip()
        if not token:
            raise RuntimeError("The mounted GKE service account token file is empty.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": mounted_gke_service_account_token_provider(TOKEN_PATH),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from Google GKE workload identity federation.",
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

const tokenPath = "/var/run/secrets/tokens/token"

type mountedGkeServiceAccountTokenProvider struct {
	path string
}

func (p mountedGkeServiceAccountTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p mountedGkeServiceAccountTokenProvider) GetToken(_ context.Context, _ auth.HTTPDoer) (string, error) {
	data, err := os.ReadFile(p.path)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-gke",
			Message:  "failed to read mounted GKE service account token",
			Cause:    err,
		}
	}

	token := strings.TrimSpace(string(data))
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "google-gke",
			Message:  "mounted GKE service account token is empty",
		}
	}

	return token, nil
}

func main() {
	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: mountedGkeServiceAccountTokenProvider{
				path: tokenPath,
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from Google GKE workload identity federation."),
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

public final class GoogleGkeWorkloadIdentityExample {
    private static final String TOKEN_PATH = "/var/run/secrets/tokens/token";

    private GoogleGkeWorkloadIdentityExample() {}

    static final class MountedGkeServiceAccountTokenProvider implements SubjectTokenProvider {
        private final Path tokenPath;

        MountedGkeServiceAccountTokenProvider(String tokenPath) {
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
                        "google-gke",
                        "failed to read mounted GKE service account token",
                        e);
            }

            if (token.isEmpty()) {
                throw new SubjectTokenProviderException(
                        "google-gke",
                        "mounted GKE service account token is empty",
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
                .provider(new MountedGkeServiceAccountTokenProvider(TOKEN_PATH))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from Google GKE workload identity federation.")
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

TOKEN_PATH = "/var/run/secrets/tokens/token"

class MountedGkeServiceAccountTokenProvider
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
        message: "Mounted GKE service account token is empty",
        provider: "google-gke"
      )
    end
    token
  rescue SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to read mounted GKE service account token: #{e.message}",
      provider: "google-gke",
      cause: e
    )
  end
end

provider = MountedGkeServiceAccountTokenProvider.new(token_path: TOKEN_PATH)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from Google GKE workload identity federation."
)

puts(response.output_text)
```


  </div>



## Google Cloud best practices

- Use dedicated Google service accounts for each workload. Avoid sharing service accounts across unrelated services or environments.
- Use workload identity flows instead of long-lived service account keys. Avoid distributing and rotating JSON key files for workloads that can use metadata-server identity tokens or GKE Workload Identity.
- Scope identities to the smallest practical workload boundary. Separate service accounts for individual applications provide clearer auditing and least-privilege access.
- Use attribute-based mappings carefully. Prefer stable identifiers such as service account subject claims over mutable metadata where possible.
- Separate production and non-production projects. Distinct projects reduce the risk of accidental privilege sharing and simplify auditing.
- Grant only required IAM permissions. Restrict the Google identity to only the permissions required for the workload.
- Monitor service account usage. Unexpected token exchanges may indicate configuration drift or compromised workloads.
``````
:::
:::

