---
status: needs-review
sourceId: 973b4fd98b37
sourceChecksum: 973b4fd98b3755554d709c149824bdac70fd026c4112e77d876f738683c3977b
sourceUrl: https://developers.openai.com/api/docs/guides/workload-identity-federation/kubernetes
translatedAt: 2026-06-27T17:13:59+08:00
translator: codex-gpt-5.5-xhigh
---

# 为 Kubernetes 配置 workload identity federation

通过将投射的 Kubernetes service account token 交换为短期 OpenAI access token，将 Kubernetes 用作 Workload Identity Provider。

## 设置 Kubernetes

本指南假定 Kubernetes service account token projection 已启用；在现代 Kubernetes 版本中，该功能默认可用。OpenAI workload identity federation 需要兼容 OIDC 的投射 service account tokens。不支持存储在 Secrets 中的旧版 Kubernetes service account tokens。

为需要调用 OpenAI API 的工作负载使用 Kubernetes `ServiceAccount`。如果还没有，请创建一个：

```bash
kubectl create serviceaccount openai-wif --namespace default
```

获取 Kubernetes 集群的 OIDC issuer：

```bash
kubectl get --raw /.well-known/openid-configuration | jq -r .issuer
```

即使你上传 JWKS，且 OpenAI 不针对该 OIDC issuer 执行 JWKS discovery，此 issuer 也必须与 Workload Identity Provider 中配置的 issuer 匹配。

获取集群 JWKS，并保存返回的 key set。配置 Workload Identity Provider 时会用到它：

```bash
kubectl get --raw /openid/v1/jwks
```

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
        - name: ksa-token
          mountPath: /var/run/secrets/tokens
          readOnly: true
  volumes:
    - name: ksa-token
      projected:
        sources:
          - serviceAccountToken:
              path: token
              audience: "https://api.openai.com/v1"
              expirationSeconds: 3600
```

## 验证 token

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

解码后的 Kubernetes 投射 service account token 将类似于：

```json
{
  "iss": "https://kubernetes.example.com",
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

## 设置 workload identity federation

在 OpenAI 中为 Kubernetes issuer 创建 Workload Identity Provider，然后添加一个 service account mapping，使其匹配投射 token 中的 attributes。

先配置 Workload Identity Provider，然后创建 service account mapping。

### 设置 Workload Identity Provider

1. **创建 Workload Identity Provider。** 将 **Name** 设置为唯一值，例如 `kubernetes-prod`。使用 **Description**（例如 `Production Kubernetes cluster`）帮助管理员识别该集群。

2. **设置 issuer 和 audience。** 将 **OIDC Issuer URL** 设置为 `kubectl get --raw /.well-known/openid-configuration | jq -r .issuer` 返回的 issuer。此值必须与投射 token 中的 `iss` claim 匹配。将 **Audience** 设置为投射 service account token volume 上配置的同一不透明 audience string。在此示例中，该值为 `https://api.openai.com/v1`。

3. **上传 Kubernetes JWKS。** 启用 **Use uploaded JWKS for token verification**，然后将 **JWKS JSON** 设置为 `kubectl get --raw /openid/v1/jwks` 的输出。OpenAI 会使用此 public key set 来验证投射 Kubernetes service account tokens。上传完整的 key set，包括外层的 `keys`。

   > **Note:** 对于 self-hosted Kubernetes clusters，OpenAI 仅支持 local JWKS mode。请上传你的集群返回的 JWKS；OpenAI 不会针对配置的 issuer 执行 OIDC discovery。OpenAI 仍会将配置的 issuer 与 token 中的 `iss` 字段进行比较。

   如果你的集群轮换 service account signing keys，请在 Workload Identity Provider 配置中更新已上传的 JWKS。由未出现在已配置 JWKS 中的 keys 签名的 tokens 会被拒绝。如果 JWKS 包含多个 active public keys，请包含完整的 `keys` array。

4. **仅在需要派生的映射属性时添加 attribute transformations。** 原始 token claims（例如 `sub`、`aud` 和 `iss`）可以直接用于 mapping assertions。如果你计划匹配 transformed attributes，而不是原始 token claims，dashboard 会自动应用 `openai.` 前缀；例如，输入 `workload_subject`，并将 expression 设置为 `assertion.sub`，以创建 `openai.workload_subject`。除非配置了匹配的 transformation，否则原始 token claims 中已以 `openai.` 开头的 claim 在用于 `openai.` mapping keys 时会被忽略。

### 设置 service account mapping

1. **创建 service account mapping。** 将 **Name** 设置为 Workload Identity Provider 内的唯一值，例如 `openai-mapping-kubernetes`。使用 **Description**（例如 `Workload Identity Provider Mapping for Kubernetes Workloads`）说明哪个工作负载可以使用该 mapping。

2. **匹配 Kubernetes service account subject。** 将 **Key** 设置为 `sub`，将 **Value** 设置为 `system:serviceaccount:default:openai-wif`。对于 Kubernetes service accounts，subject 格式为 `system:serviceaccount:<namespace>:<service-account-name>`。

3. **选择 OpenAI 目标。** 将 **Project** 设置为拥有目标 service account 的 OpenAI project。将 **Service account** 设置为 Kubernetes 工作负载可以使用的 OpenAI service account，例如 `kubernetes-prod-openai-wif`。如果你希望为此 mapping 创建新的 service account，而不是复用已有 service account，请勾选 `Create a new service account in this project`。

4. **按需收窄 API 权限。** 选择适当的 **Permissions**，例如 `api.model.request` 和 `api.vector_store.read`，以进一步收窄从此 mapping 铸造的 access tokens。将 permissions 留空可避免添加 WIF 专用 scope 限制；该 token 仍会以映射到的 service account 身份授权。

## 在代码中使用 token

配置 OpenAI SDK client，使其读取投射 Kubernetes token，并将其交换为 OpenAI 签发的 access token。

将挂载的 token 路径（例如 `/var/run/secrets/tokens/token`）用作 SDK workload identity federation provider 的 subject token source。SDK 会将该 Kubernetes token 交换为 OpenAI 签发的 access token，并使用 OpenAI token 对 API 请求进行身份验证。

以下示例使用自定义 subject token provider 初始化 OpenAI client。该 provider 会从挂载的文件路径读取投射 Kubernetes service account token，并将其用作 workload identity federation 的 subject token。

使用 Kubernetes 投射 service account token 进行身份验证

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

function mountedServiceAccountTokenProvider(path: string): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const token = (await readFile(path, "utf8")).trim();
      if (!token) {
        throw new Error("The mounted service account token file is empty.");
      }
      return token;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: mountedServiceAccountTokenProvider(tokenPath),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from Kubernetes workload identity federation.",
});

console.log(response.output_text);
```

```python
import os
from pathlib import Path

from openai import OpenAI
from openai.auth import SubjectTokenProvider

TOKEN_PATH = "/var/run/secrets/tokens/token"


def mounted_service_account_token_provider(token_path: str) -> SubjectTokenProvider:
    def get_token() -> str:
        token = Path(token_path).read_text().strip()
        if not token:
            raise RuntimeError("The mounted service account token file is empty.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": mounted_service_account_token_provider(TOKEN_PATH),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from Kubernetes workload identity federation.",
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

type mountedServiceAccountTokenProvider struct {
	path string
}

func (p mountedServiceAccountTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p mountedServiceAccountTokenProvider) GetToken(ctx context.Context, _ auth.HTTPDoer) (string, error) {
	data, err := os.ReadFile(p.path)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "kubernetes",
			Message:  "failed to read mounted service account token",
			Cause:    err,
		}
	}

	token := strings.TrimSpace(string(data))
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "kubernetes",
			Message:  "mounted service account token is empty",
		}
	}

	return token, nil
}

func main() {
	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: mountedServiceAccountTokenProvider{
				path: tokenPath,
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from Kubernetes workload identity federation."),
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

public final class KubernetesWorkloadIdentityExample {
    private static final String TOKEN_PATH = "/var/run/secrets/tokens/token";

    private KubernetesWorkloadIdentityExample() {}

    static final class MountedServiceAccountTokenProvider implements SubjectTokenProvider {
        private final Path tokenPath;

        MountedServiceAccountTokenProvider(String tokenPath) {
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
                        "kubernetes",
                        "failed to read mounted service account token",
                        e);
            }

            if (token.isEmpty()) {
                throw new SubjectTokenProviderException(
                        "kubernetes",
                        "mounted service account token is empty",
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
                .provider(new MountedServiceAccountTokenProvider(TOKEN_PATH))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from Kubernetes workload identity federation.")
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

class MountedServiceAccountTokenProvider
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
        message: "Mounted service account token is empty",
        provider: "kubernetes"
      )
    end
    token
  rescue SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to read mounted service account token: #{e.message}",
      provider: "kubernetes",
      cause: e
    )
  end
end

provider = MountedServiceAccountTokenProvider.new(token_path: TOKEN_PATH)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from Kubernetes workload identity federation."
)

puts(response.output_text)
```


## Kubernetes 最佳实践

- 使用稳定的 OIDC issuer。issuer URL 必须与投射 service account token 的 `iss` claim 匹配，并且应在集群升级和维护操作期间保持稳定。
- 谨慎保护 signing keys。任何能够访问集群 service account signing keys 的人，都可以铸造可能被 OpenAI 接受的 tokens。
- 为 OpenAI 集成使用专用 service accounts。避免复用同时用于无关基础设施或应用访问的 service accounts。
- 保持上传的 JWKS 为最新。OpenAI 在 local JWKS mode 下使用已配置的 JWKS 验证 workload identity tokens，因此请在轮换到新的 signing keys 之前更新 Workload Identity Provider。
- 尽量降低自定义 claim 复杂度。优先匹配标准 claims，例如 `sub` 和 `aud`，或匹配直接从这些 claims 派生的 transformed attributes。
- 将 namespace ownership 视为安全模型的一部分。如果 namespace administrators 可以创建 service accounts，请确保 mappings 的范围设置得当，防止意外 privilege escalation。
- 监控 issuer 和 signing key 变更。在未更新 Workload Identity Provider JWKS 的情况下轮换 signing keys，可能会导致 token exchange failures。
