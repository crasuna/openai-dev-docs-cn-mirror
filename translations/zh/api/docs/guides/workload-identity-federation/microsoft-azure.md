---
status: needs-review
sourceId: cf83c5e05ca3
sourceChecksum: cf83c5e05ca3c27e872299e9f1c21c1bcaee78fca681db1947e6fdb0f43de369
sourceUrl: https://developers.openai.com/api/docs/guides/workload-identity-federation/microsoft-azure
translatedAt: 2026-06-27T17:15:06+08:00
translator: codex-gpt-5.5-xhigh
---

# 为 Microsoft Azure 配置工作负载身份联合

在以下任一场景中，将 Microsoft Azure 用作 Workload Identity Provider：

- **Azure managed identity：** 将为 managed identity 签发的 Microsoft Entra ID access token 交换为短期 OpenAI access token。
- **AKS：** 将投射的 Azure Kubernetes Service (AKS) service account token 交换为短期 OpenAI access token。



<div data-content-switcher-pane data-value="managed-identity">

## Azure managed identity

Azure managed identities 让托管在 Azure 上的工作负载能够在不存储长期 secret 的情况下请求 Microsoft Entra tokens。在 OpenAI 工作负载身份联合中，managed identity token 是 OpenAI 在签发 OpenAI access token 之前验证的 subject token。

### 设置 Azure managed identity

创建或使用一个 Microsoft Entra application registration，用来表示 OpenAI 应信任的 token audience。配置其 **Application ID URI**；此 URI 是你的工作负载从 Azure Instance Metadata Service (IMDS) 请求的 `resource` 值，也会作为已签发 token 中的 `aud` claim 出现。有关 Microsoft 设置步骤，请参阅 Microsoft Entra 指南：[create a new Entra ID application and service principal](https://learn.microsoft.com/en-au/entra/identity-platform/howto-create-service-principal-portal#register-an-application-with-azure-ad-and-create-a-service-principal)。

在 Microsoft Entra ID 中配置的 Application ID URI、IMDS `resource`
  parameter、生成的 token `aud` claim，以及 OpenAI Workload Identity
  Provider audience 必须全部匹配。

[创建](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/manage-user-assigned-managed-identities-azure-portal?pivots=identity-mi-methods-azp)一个 managed identity，然后将该 managed identity [分配](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-portal-windows-vm#user-assigned-managed-identity)给运行应用的 Azure resource，例如 virtual machine。该 resource 必须能够在运行时调用 IMDS。有关 Azure 设置详情，请参阅 Microsoft 的 [managed identities overview](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview)，以及用于分配该 identity 的相关 Azure resource 文档。

### 获取 Azure managed identity token

从已分配 managed identity 的 Azure resource，使用 Application ID URI 作为 `resource` parameter 向 IMDS 请求 token。此 token 是 OpenAI 用来交换 OpenAI 签发 access token 的 subject token。

```bash
APPLICATION_ID_URI="api://<application-client-id>"

TOKEN=$(curl -sS -G -H "Metadata: true" \
  "http://169.254.169.254/metadata/identity/oauth2/token" \
  --data-urlencode "api-version=2018-02-01" \
  --data-urlencode "resource=${APPLICATION_ID_URI}" \
  | jq -r .access_token)
```

如果该 resource 有多个 user-assigned managed identities，请为你要使用的 managed identity 添加 `client_id`、`object_id` 或 `msi_res_id` query parameter。Microsoft 在 [Use managed identities on a virtual machine to acquire access token](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/how-to-use-vm-token) 中记录了 IMDS token request parameters。

### 验证 token

配置工作负载身份联合之前，请在本地解码一个 token 示例，并检查其 claims：

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

此命令会解码 JWT payload，但不会验证 token 签名。请对生产 token 使用本地解码器，并避免将生产 token 粘贴到第三方工具中。

解码后的 Microsoft Entra ID managed identity token 类似如下：

```json
{
  "iss": "https://login.microsoftonline.com/11111111-2222-3333-4444-555555555555/v2.0",
  "aud": "api://00000000-1111-2222-3333-444444444444",
  "tid": "11111111-2222-3333-4444-555555555555",
  "appid": "22222222-3333-4444-5555-666666666666",
  "oid": "33333333-4444-5555-6666-777777777777",
  "sub": "33333333-4444-5555-6666-777777777777",
  "xms_mirid": "/subscriptions/<subscription-id>/resourcegroups/my-resource-group/providers/Microsoft.Compute/virtualMachines/openai-wif-vm",
  "iat": 1716235422,
  "exp": 1716239022
}
```

验证你计划在 OpenAI 中配置的 claims：

- `iss`：使用 token 中的确切 issuer 值。issuer 可能是 `https://login.microsoftonline.com/<tenant-id>/v2.0`，但不要假设一定带有该后缀。
- `aud`：必须与 Application ID URI、IMDS `resource` parameter 和 OpenAI Workload Identity Provider audience 匹配。
- `tid`：Microsoft Entra tenant ID。
- `appid`：managed identity 的 application/client ID（如果存在）。

Managed identity tokens 还可以包含 `azp`、`oid`、`sub` 或 `xms_mirid` 等 claims。请以解码后的 token 作为事实来源，并选择能够标识你信任的确切 managed identity 和 resource boundary 的 claims。

使用解码后的 payload，将你收到的 token 与 OpenAI 中配置的 issuer、audience 和 mapping values 进行比较。大多数配置问题在交换 token 之前，就可以从 `iss`、`aud`、`tid` 以及 managed identity claims 中看出来。

### 设置工作负载身份联合

在 OpenAI 中为 Microsoft Entra ID issuer 创建 Workload Identity Provider，然后添加一个 service account mapping，用来匹配 managed identity token 中的稳定 claims。

先配置 Workload Identity Provider，再创建 service account mapping。

#### 设置 Workload Identity Provider

1. **创建 Workload Identity Provider。** 将 **Name** 设为唯一值，例如 `azure-managed-identity-prod`。使用 **Description**，例如 `Production Azure managed identity workloads`，帮助管理员识别该 provider。

2. **设置 issuer 和 audience。** 将 **OIDC Issuer URL** 设为 token `iss` claim 的确切值。先获取一个 managed identity token 示例并检查其 claims。例如，issuer 可能是 `https://login.microsoftonline.com/<tenant-id>/v2.0`。将 **Audience** 设为你配置的 Microsoft Entra Application ID URI，例如 `api://<application-client-id>`。该值必须与 token 的 `aud` claim 匹配。

3. **使用 Microsoft Entra token verification。** 保持 **Use uploaded JWKS for token verification** 为禁用。OpenAI 会使用 Microsoft Entra issuer metadata 和 JWKS 来验证 managed identity token。

4. **如果需要派生映射属性，请添加 attribute transformations。** 例如，输入 `managed_identity_client_id`，表达式为 `assertion.appid`，以从 managed identity application/client ID claim 创建 `openai.managed_identity_client_id`。dashboard 会自动应用 `openai.` 前缀。除非配置了匹配的 transformation，否则已以 `openai.` 开头的原始 token claims 会被忽略，不会用作 `openai.` mapping keys。

#### 设置 service account mapping

1. **创建 service account mapping。** 将 **Name** 设为该 Workload Identity Provider 内唯一的值，例如 `vm-openai-wif`。使用 **Description**，例如 `Production VM Azure managed identity workload`，说明哪个工作负载可以使用该映射。

2. **匹配稳定的 managed identity claims。** 为每个必须匹配的 claim 添加一行 **Key** 和 **Value**。如果 token 包含 `appid`，请将 **Key** 设为 `appid`，并将 **Value** 设为 managed identity client ID。`appid` claim 标识 managed identity 的 application/client ID，通常是将映射绑定到特定 managed identity 时最稳定的 claim。如果你的 token 不包含 `appid`，请使用解码后 token 中的另一个稳定 claim，例如 `azp`、`oid`、`sub` 或 `xms_mirid`。若要将映射绑定到某个 tenant，还应将 **Key** 设为 `tid`，并将 **Value** 设为 Microsoft Entra tenant ID。请从 IMDS 解码一个 token 示例，并使用对你信任的 managed identity 和 resource 稳定的 claims。

3. **选择 OpenAI 目标。** 将 **Project** 设为拥有目标 service account 的 OpenAI project。将 **Service account** 设为 Azure 工作负载可使用的 OpenAI service account，例如 `azure-managed-identity-prod-openai-wif`。

4. **如有需要，收窄 API 权限。** 选择适当的 **Permissions**，例如 `api.model.request` 和 `api.vector_store.read`，以进一步收窄由此映射铸造的 access tokens。将 permissions 留空可避免添加 WIF 专属 scope 限制；该 token 仍会以映射到的 service account 身份授权。

### 在代码中使用 token

配置你的 OpenAI SDK client，从 IMDS 请求 Azure managed identity token，并将其交换为 OpenAI 签发的 access token。

将 `OPENAI_WIF_AUDIENCE` 设置为配置为 Workload Identity Provider audience 的 Microsoft Entra Application ID URI。SDK 会请求该 audience 的 managed identity token，将其交换为 OpenAI 签发的 access token，并使用 OpenAI token 对 API 请求进行身份验证。

使用 Azure managed identity token 进行身份验证

```typescript
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const imdsEndpoint = "http://169.254.169.254/metadata/identity/oauth2/token";

const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;
const audience = process.env.OPENAI_WIF_AUDIENCE;

if (!identityProviderId || !serviceAccountId || !audience) {
  throw new Error(
    "Set OPENAI_IDENTITY_PROVIDER_ID, OPENAI_SERVICE_ACCOUNT_ID, and OPENAI_WIF_AUDIENCE"
  );
}

function azureManagedIdentityTokenProvider(resource: string): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const url = new URL(imdsEndpoint);
      url.searchParams.set("api-version", "2018-02-01");
      url.searchParams.set("resource", resource);

      const clientId = process.env.AZURE_CLIENT_ID;
      if (clientId) {
        url.searchParams.set("client_id", clientId);
      }

      const response = await fetch(url, {
        headers: { Metadata: "true" },
      });

      if (!response.ok) {
        throw new Error(
          `Azure IMDS token request failed with status ${response.status}.`
        );
      }

      const body = (await response.json()) as { access_token?: string };
      if (!body.access_token) {
        throw new Error("Azure IMDS did not return an access token.");
      }

      return body.access_token;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: azureManagedIdentityTokenProvider(audience),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from Azure managed identity workload identity federation.",
});

console.log(response.output_text);
```

```python
import json
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from openai import OpenAI
from openai.auth import SubjectTokenProvider

IMDS_ENDPOINT = "http://169.254.169.254/metadata/identity/oauth2/token"


def azure_managed_identity_token_provider(resource: str) -> SubjectTokenProvider:
    def get_token() -> str:
        params = {
            "api-version": "2018-02-01",
            "resource": resource,
        }

        client_id = os.environ.get("AZURE_CLIENT_ID")
        if client_id:
            params["client_id"] = client_id

        request = Request(
            f"{IMDS_ENDPOINT}?{urlencode(params)}",
            headers={"Metadata": "true"},
        )

        with urlopen(request, timeout=10) as response:
            body = json.loads(response.read().decode("utf-8"))

        token = body.get("access_token", "")
        if not token:
            raise RuntimeError("Azure IMDS did not return an access token.")
        return token

    return {"token_type": "jwt", "get_token": get_token}

client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": azure_managed_identity_token_provider(
            os.environ["OPENAI_WIF_AUDIENCE"]
        ),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from Azure managed identity workload identity federation.",
)

print(response.output_text)
```

```go
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/auth"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
)

const azureIMDSEndpoint = "http://169.254.169.254/metadata/identity/oauth2/token"

type azureManagedIdentityTokenProvider struct {
	resource string
}

func (p azureManagedIdentityTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p azureManagedIdentityTokenProvider) GetToken(ctx context.Context, httpClient auth.HTTPDoer) (string, error) {
	values := url.Values{}
	values.Set("api-version", "2018-02-01")
	values.Set("resource", p.resource)
	if clientID := os.Getenv("AZURE_CLIENT_ID"); clientID != "" {
		values.Set("client_id", clientID)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, azureIMDSEndpoint+"?"+values.Encode(), nil)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "azure-managed-identity",
			Message:  "failed to build Azure IMDS token request",
			Cause:    err,
		}
	}
	req.Header.Set("Metadata", "true")

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "azure-managed-identity",
			Message:  "failed to request Azure managed identity token",
			Cause:    err,
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", &auth.SubjectTokenProviderError{
			Provider: "azure-managed-identity",
			Message:  fmt.Sprintf("Azure IMDS token request failed with status %d", resp.StatusCode),
		}
	}

	var body struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "azure-managed-identity",
			Message:  "failed to decode Azure IMDS token response",
			Cause:    err,
		}
	}
	if body.AccessToken == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "azure-managed-identity",
			Message:  "Azure IMDS did not return an access token",
		}
	}

	return body.AccessToken, nil
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
			Provider: azureManagedIdentityTokenProvider{
				resource: audience,
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from Azure managed identity workload identity federation."),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(response.OutputText())
}
```

```java
import com.fasterxml.jackson.databind.JsonNode;
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

public final class AzureManagedIdentityWorkloadIdentityExample {
    private static final String IMDS_ENDPOINT =
            "http://169.254.169.254/metadata/identity/oauth2/token";

    private AzureManagedIdentityWorkloadIdentityExample() {}

    static final class AzureManagedIdentityTokenProvider implements SubjectTokenProvider {
        private final String resource;

        AzureManagedIdentityTokenProvider(String resource) {
            this.resource = resource;
        }

        @Override
        public SubjectTokenType tokenType() {
            return SubjectTokenType.JWT;
        }

        @Override
        public String getToken(HttpClient httpClient, JsonMapper jsonMapper) {
            try {
                String query = "api-version=2018-02-01&resource="
                        + URLEncoder.encode(resource, StandardCharsets.UTF_8);
                String clientId = System.getenv("AZURE_CLIENT_ID");
                if (clientId != null && !clientId.isEmpty()) {
                    query += "&client_id="
                            + URLEncoder.encode(clientId, StandardCharsets.UTF_8);
                }

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(IMDS_ENDPOINT + "?" + query))
                        .header("Metadata", "true")
                        .GET()
                        .build();

                HttpResponse<String> response = java.net.http.HttpClient.newHttpClient()
                        .send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    throw new SubjectTokenProviderException(
                            "azure-managed-identity",
                            "Azure IMDS token request failed with status "
                                    + response.statusCode(),
                            null);
                }

                JsonNode body = jsonMapper.readTree(response.body());
                String token = body.path("access_token").asText();
                if (token.isEmpty()) {
                    throw new SubjectTokenProviderException(
                            "azure-managed-identity",
                            "Azure IMDS did not return an access token",
                            null);
                }

                return token;
            } catch (SubjectTokenProviderException e) {
                throw e;
            } catch (Exception e) {
                throw new SubjectTokenProviderException(
                        "azure-managed-identity",
                        "failed to request Azure managed identity token",
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
                .provider(new AzureManagedIdentityTokenProvider(
                        System.getenv("OPENAI_WIF_AUDIENCE")))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from Azure managed identity workload identity federation.")
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
require "json"
require "net/http"
require "openai"
require "uri"

class AzureManagedIdentityTokenProvider
  include OpenAI::Auth::SubjectTokenProvider

  IMDS_ENDPOINT = "http://169.254.169.254/metadata/identity/oauth2/token"

  def initialize(resource:)
    @resource = resource
  end

  def token_type
    OpenAI::Auth::TokenType::JWT
  end

  def get_token
    uri = URI(IMDS_ENDPOINT)
    params = {
      "api-version" => "2018-02-01",
      "resource" => @resource
    }
    params["client_id"] = ENV["AZURE_CLIENT_ID"] if ENV["AZURE_CLIENT_ID"]
    uri.query = URI.encode_www_form(params)

    request = Net::HTTP::Get.new(uri)
    request["Metadata"] = "true"

    response = Net::HTTP.start(uri.hostname, uri.port, read_timeout: 10) do |http|
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "Azure IMDS token request failed with status #{response.code}",
        provider: "azure-managed-identity"
      )
    end

    token = JSON.parse(response.body).fetch("access_token", "")
    if token.empty?
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "Azure IMDS did not return an access token",
        provider: "azure-managed-identity"
      )
    end
    token
  rescue JSON::ParserError, SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to request Azure managed identity token: #{e.message}",
      provider: "azure-managed-identity",
      cause: e
    )
  end
end

provider = AzureManagedIdentityTokenProvider.new(
  resource: ENV.fetch("OPENAI_WIF_AUDIENCE")
)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from Azure managed identity workload identity federation."
)

puts(response.output_text)
```


  </div>

  <div data-content-switcher-pane data-value="aks" hidden>

## Azure Kubernetes Service (AKS)

通过将 AKS 签发的 projected service account token 交换为短期 OpenAI access token，把 AKS 用作 Workload Identity Provider。

AKS 工作负载也可以使用 Azure Workload Identity，为附加到该工作负载的 managed identity 获取 Microsoft Entra
  ID access token。在这种
  配置中，OpenAI 验证的是 Microsoft Entra token，而不是
  projected Kubernetes service account token。请使用 [Azure managed
  identity](#azure-managed-identity) 中的步骤配置 OpenAI workload identity
  federation，并按照 Microsoft 文档配置 Azure Workload Identity。

### 设置 AKS

检索与 AKS cluster 关联的 OIDC issuer URL：

```bash
az aks show \
  --name <cluster-name> \
  --resource-group <resource-group> \
  --query "oidcIssuerProfile.issuerUrl" \
  --output tsv
```

如果 issuer URL 为空，请为该 cluster 启用 AKS OIDC issuer。使用以下命令：

```bash
az aks update \
    --resource-group <resource-group> \
    --name <cluster-name> \
    --enable-oidc-issuer
```

你在 OpenAI Workload Identity Provider 中配置的 issuer 必须与此 issuer URL 以及 projected AKS service account token 中的 `iss` claim 匹配。

为需要调用 OpenAI API 的 AKS 工作负载使用 Kubernetes `ServiceAccount`。如果你还没有，请创建它：

```bash
kubectl create serviceaccount openai-wif --namespace default
```

使用 OpenAI 期望的 audience 和适合你工作负载的 expiration 配置 projected service account token。OpenAI 会验证该 token 的 issuer、signature、audience 和 expiration。在此示例中，token 文件挂载在 `/var/run/secrets/tokens/token`，使用 audience `https://api.openai.com/v1`，并在 3600 秒后过期。如果 projected token audience 与 OpenAI Workload Identity Provider audience 匹配，你可以使用不同 audience。

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
        - name: aks-sa-token
          mountPath: /var/run/secrets/tokens
          readOnly: true
  volumes:
    - name: aks-sa-token
      projected:
        sources:
          - serviceAccountToken:
              path: token
              audience: "https://api.openai.com/v1"
              expirationSeconds: 3600
```

### 验证 token

配置工作负载身份联合之前，请在本地解码一个 projected service account token 示例，并检查其 claims。从一个已挂载 projected token 的运行中 pod 执行：

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

此命令会解码 JWT payload，但不会验证 token 签名。请对生产 token 使用本地解码器，并避免将生产 token 粘贴到第三方工具中。

解码后的 AKS projected service account token 类似如下：

```json
{
  "iss": "https://eastus.oic.prod-aks.azure.com/11111111-2222-3333-4444-555555555555/22222222-3333-4444-5555-666666666666/",
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

验证你计划在 OpenAI 中配置的 claims：

- `iss`：必须与 OpenAI Workload Identity Provider 中配置的 AKS issuer URL 匹配。
- `aud`：必须与 projected service account token audience 和 OpenAI Workload Identity Provider audience 匹配。
- `sub`：必须与你在 service account mapping 中配置的 Kubernetes service account subject 匹配。

使用解码后的 payload，将你收到的 token 与 OpenAI 中配置的 issuer、audience 和 mapping values 进行比较。大多数配置问题在交换 token 之前，就可以从 `iss`、`aud` 和 `sub` claims 中看出来。

### 设置工作负载身份联合

在 OpenAI 中为 AKS issuer 创建 Workload Identity Provider，然后添加一个 service account mapping，用来匹配 projected token 中的 attributes。

先配置 Workload Identity Provider，再创建 service account mapping。

#### 设置 Workload Identity Provider

1. **创建 Workload Identity Provider。** 将 **Name** 设为唯一值，例如 `azure-aks-prod`。使用 **Description**，例如 `Production AKS cluster`，帮助管理员识别该 cluster。

2. **设置 issuer 和 audience。** 将 **OIDC Issuer URL** 设为 `az aks show --query "oidcIssuerProfile.issuerUrl"` 返回的 issuer。该值必须与 projected AKS service account token 中的 `iss` claim 匹配。将 **Audience** 设为 projected service account token volume 上配置的相同 audience。在此示例中，该值为 `https://api.openai.com/v1`。

3. **使用 AKS OIDC discovery。** 保持 **Use uploaded JWKS for token verification** 为禁用。OpenAI 会使用 AKS issuer 的 OIDC discovery metadata 和 JWKS 来验证 projected service account token。

4. **如果需要派生映射属性，请添加 attribute transformations。** 例如，输入 `aks_subject`，表达式为 `assertion.sub`，以创建 `openai.aks_subject`。dashboard 会自动应用 `openai.` 前缀。除非配置了匹配的 transformation，否则已以 `openai.` 开头的原始 token claims 会被忽略，不会用作 `openai.` mapping keys。

#### 设置 service account mapping

1. **创建 service account mapping。** 将 **Name** 设为该 Workload Identity Provider 内唯一的值，例如 `default-openai-wif`。使用 **Description**，例如 `Default namespace AKS OpenAI API workload`，说明哪个工作负载可以使用该映射。

2. **匹配 AKS service account subject。** 将 **Key** 设为 `sub`，并将 **Value** 设为 `system:serviceaccount:default:openai-wif`。对于 AKS service accounts，subject 格式为 `system:serviceaccount:<namespace>:<service-account-name>`。

   Workload Identity Provider 会将 tokens 限制为已配置的 AKS issuer。service account mapping 会进一步将访问限制为指定的 Kubernetes service account subject。

3. **选择 OpenAI 目标。** 将 **Project** 设为拥有目标 service account 的 OpenAI project。将 **Service account** 设为 AKS 工作负载可使用的 OpenAI service account，例如 `azure-aks-prod-openai-wif`。

4. **如有需要，收窄 API 权限。** 选择适当的 **Permissions**，例如 `api.model.request` 和 `api.vector_store.read`，以进一步收窄由此映射铸造的 access tokens。将 permissions 留空可避免添加 WIF 专属 scope 限制；该 token 仍会以映射到的 service account 身份授权。

### 在代码中使用 token

配置你的 OpenAI SDK client，读取 projected AKS service account token，并将其交换为 OpenAI 签发的 access token。

使用挂载的 token path（例如 `/var/run/secrets/tokens/token`）作为 SDK workload identity federation provider 的 subject token source。SDK 会将该 AKS token 交换为 OpenAI 签发的 access token，并使用 OpenAI token 对 API 请求进行身份验证。

以下示例使用自定义 subject token provider 初始化 OpenAI client。该 provider 会从挂载的文件路径读取 projected AKS service account token，并将其作为工作负载身份联合的 subject token。

使用 AKS projected service account token 进行身份验证

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

function mountedAksServiceAccountTokenProvider(path: string): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const token = (await readFile(path, "utf8")).trim();
      if (!token) {
        throw new Error("The mounted AKS service account token file is empty.");
      }
      return token;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: mountedAksServiceAccountTokenProvider(tokenPath),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from AKS workload identity federation.",
});

console.log(response.output_text);
```

```python
import os
from pathlib import Path

from openai import OpenAI
from openai.auth import SubjectTokenProvider

TOKEN_PATH = "/var/run/secrets/tokens/token"


def mounted_aks_service_account_token_provider(token_path: str) -> SubjectTokenProvider:
    def get_token() -> str:
        token = Path(token_path).read_text().strip()
        if not token:
            raise RuntimeError("The mounted AKS service account token file is empty.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": mounted_aks_service_account_token_provider(TOKEN_PATH),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from AKS workload identity federation.",
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

type mountedAksServiceAccountTokenProvider struct {
	path string
}

func (p mountedAksServiceAccountTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p mountedAksServiceAccountTokenProvider) GetToken(_ context.Context, _ auth.HTTPDoer) (string, error) {
	data, err := os.ReadFile(p.path)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "azure-aks",
			Message:  "failed to read mounted AKS service account token",
			Cause:    err,
		}
	}

	token := strings.TrimSpace(string(data))
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "azure-aks",
			Message:  "mounted AKS service account token is empty",
		}
	}

	return token, nil
}

func main() {
	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: mountedAksServiceAccountTokenProvider{
				path: tokenPath,
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from AKS workload identity federation."),
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

public final class AzureAksWorkloadIdentityExample {
    private static final String TOKEN_PATH = "/var/run/secrets/tokens/token";

    private AzureAksWorkloadIdentityExample() {}

    static final class MountedAksServiceAccountTokenProvider implements SubjectTokenProvider {
        private final Path tokenPath;

        MountedAksServiceAccountTokenProvider(String tokenPath) {
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
                        "azure-aks",
                        "failed to read mounted AKS service account token",
                        e);
            }

            if (token.isEmpty()) {
                throw new SubjectTokenProviderException(
                        "azure-aks",
                        "mounted AKS service account token is empty",
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
                .provider(new MountedAksServiceAccountTokenProvider(TOKEN_PATH))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from AKS workload identity federation.")
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

class MountedAksServiceAccountTokenProvider
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
        message: "Mounted AKS service account token is empty",
        provider: "azure-aks"
      )
    end
    token
  rescue SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to read mounted AKS service account token: #{e.message}",
      provider: "azure-aks",
      cause: e
    )
  end
end

provider = MountedAksServiceAccountTokenProvider.new(token_path: TOKEN_PATH)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from AKS workload identity federation."
)

puts(response.output_text)
```


  </div>



## Microsoft Azure 最佳实践

- 尽可能使用 managed identities。与手动分发 credentials 相比，managed identities 提供了更简单、更安全的身份验证模型。
- 针对不同应用和环境使用独立的 managed identities、Microsoft Entra applications 和 OpenAI mappings。避免在开发、预发和生产工作负载之间共享同一个 identity。
- 限制接受的 audiences。只配置 OpenAI 工作负载身份联合所需的 audiences。
- 使用专用 Microsoft Entra ID applications 作为安全边界。独立 applications 提供更清晰的 ownership、auditing 和 access management。
- 优先使用工作负载专用 mappings。基于工作负载专用 claims 进行匹配，而不是使用宽泛的 tenant-wide attributes。
- 定期审查 federated credential configurations。陈旧的 federated credentials 可能会在工作负载退役很久之后，仍无意中继续授予访问权限。
- 分离生产和非生产 identities。生产工作负载应通过不同的 federated identities 和 OpenAI service accounts 进行身份验证。
