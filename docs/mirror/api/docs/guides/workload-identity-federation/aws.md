---
title: "Configuring workload identity federation for AWS"
description: "Configure AWS outbound identity federation or Amazon EKS as a workload identity federation token provider."
outline: deep
---

# Configuring workload identity federation for AWS

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/workload-identity-federation/aws](https://developers.openai.com/api/docs/guides/workload-identity-federation/aws)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/workload-identity-federation/aws.md](https://developers.openai.com/api/docs/guides/workload-identity-federation/aws.md)
- 抓取时间：2026-06-27T05:54:12.482Z
- Checksum：`ba5e4ca9dd2c2e835e9e309cdc9a9f85949a2fb4a55dd2cc69efa70d394dad55`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
在以下任一场景中，将 AWS 用作 Workload Identity Provider：

- **AWS outbound identity federation:** 将 AWS STS 通过 `GetWebIdentityToken` 签发的 OIDC JWT 交换为短期有效的 OpenAI 访问令牌。
- **Amazon EKS:** 将投射的 Amazon EKS service account token 交换为短期有效的 OpenAI 访问令牌。

OpenAI 支持来自 outbound identity federation 的 AWS 签发 OIDC JWT，以及 Amazon EKS 签发的 Kubernetes projected service account token。OpenAI 不支持将 SigV4 签名请求或 AWS STS 临时访问密钥凭证作为工作负载身份联合的 subject token。





## AWS outbound identity federation

AWS outbound identity federation 允许 AWS principal 向 AWS STS 请求一个已签名的 OIDC JWT，并将该令牌提供给外部服务。在 OpenAI 工作负载身份联合中，AWS 签发的 JWT 是 subject token；OpenAI 会先验证它，然后再签发 OpenAI 访问令牌。

### 设置 AWS outbound identity federation

为将要签发令牌的 AWS account 启用 outbound identity federation。有关设置详情，请参阅 AWS 的[开始使用 outbound identity federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_outbound_getting_started.html)指南。

```bash
aws iam enable-outbound-web-identity-federation
```

记录 AWS 返回的账号专属 issuer URL。你需要将此值配置为 OpenAI Workload Identity Provider issuer，并且它必须与 AWS 签发令牌中的 `iss` claim 匹配。

AWS STS `GetWebIdentityToken` API 在 STS global endpoint 上不可用。请配置 AWS CLI 或 SDK 使用 regional STS endpoint。

授予工作负载调用 `sts:GetWebIdentityToken` 的权限。在 IAM 中限制 audience 和最大令牌生命周期，使 AWS principal 只能铸造面向 OpenAI 的令牌。以下示例允许为 audience `https://api.openai.com/v1` 生成令牌，最大生命周期为 300 秒：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:GetWebIdentityToken",
      "Resource": "*",
      "Condition": {
        "ForAllValues:StringEquals": {
          "sts:IdentityTokenAudience": "https://api.openai.com/v1"
        },
        "NumericLessThanEquals": {
          "sts:DurationSeconds": 300
        }
      }
    }
  ]
}
```

使用你将在 OpenAI Workload Identity Provider 上配置的同一 audience，请求一个 AWS 签发的 OIDC token。除非你的环境要求兼容 `RS256`，否则请使用 `ES384`。

```bash
TOKEN=$(aws sts get-web-identity-token \
  --audience "https://api.openai.com/v1" \
  --signing-algorithm ES384 \
  --duration-seconds 300 \
  --tags Key=environment,Value=production \
         Key=workload,Value=batch-ingest \
  --query "WebIdentityToken" \
  --output text)
```

### 验证 AWS 签发的令牌

配置工作负载身份联合之前，请在本地解码一个 AWS 签发的示例令牌并检查其 claims：

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

此命令会解码 JWT payload，但不会验证令牌签名。对于生产令牌，请使用本地解码器，并避免将生产令牌粘贴到第三方工具中。

解码后的 AWS 签发 OIDC token 将类似于：

```json
{
  "iss": "https://abc123-def456-ghi789-jkl012.tokens.sts.global.api.aws",
  "aud": "https://api.openai.com/v1",
  "sub": "arn:aws:iam::123456789012:role/OpenAIWifRole",
  "iat": 1716235422,
  "exp": 1716235722,
  "jti": "jwt-id-example",
  "https://sts.amazonaws.com/": {
    "aws_account": "123456789012",
    "source_region": "us-west-2",
    "org_id": "o-exampleorgid",
    "principal_tags": {
      "environment": "production"
    },
    "request_tags": {
      "environment": "production",
      "workload": "batch-ingest"
    }
  }
}
```

并非每个 AWS 签发的令牌都包含所有 AWS 专属 claim。`https://sts.amazonaws.com/` 下的 claim 取决于调用 principal、session context 和 request tags。

验证你计划在 OpenAI 中配置的 claims：

- `iss`：必须与 OpenAI Workload Identity Provider 中配置的 AWS account-specific issuer URL 匹配。
- `aud`：必须与 `GetWebIdentityToken` audience 以及 OpenAI Workload Identity Provider audience 匹配。
- `sub`：标识请求令牌的 IAM principal ARN。建议匹配精确的 role ARN。
- AWS 专属 claims：在匹配账号、组织、principal tag 或 request tag 值之前，请以解码后的令牌作为事实来源。

使用解码后的 payload，将你收到的令牌与 OpenAI 中配置的 issuer、audience 和映射值进行比较。多数配置问题在交换令牌之前，就能从 `iss`、`aud` 和 `sub` claims 中看出来。

### 设置工作负载身份联合

在 OpenAI 中为 AWS account issuer 创建一个 Workload Identity Provider，然后添加一个 service account mapping，用于匹配 AWS 签发令牌中的稳定 claims。

先配置 Workload Identity Provider，然后创建 service account mapping。

#### 设置 Workload Identity Provider

1. **创建 Workload Identity Provider。** 将 **Name** 设为唯一值，例如 `aws-outbound-prod`。使用 **Description**，例如 `Production AWS outbound identity federation workloads`，帮助管理员识别该 provider。

2. **设置 issuer 和 audience。** 将 **OIDC Issuer URL** 设为启用 outbound identity federation 时返回的 AWS account-specific issuer URL。此值必须与令牌的 `iss` claim 匹配。将 **Audience** 设为传递给 `GetWebIdentityToken` 的同一 audience。在本例中，该值为 `https://api.openai.com/v1`。

3. **使用 AWS OIDC discovery。** 保持 **Use uploaded JWKS for token verification** 关闭。OpenAI 使用 AWS issuer 的 OIDC discovery metadata 和 JWKS 来验证 AWS 签发的令牌。

4. **仅在需要派生映射属性时添加 attribute transformations。** 原始令牌匹配支持顶层标量 claims，例如 `sub`、`aud` 和 `iss`。AWS 专属 namespaced claims 嵌套在 `https://sts.amazonaws.com/` 下，因此在 mappings 中使用它们之前，请先用 CEL bracket notation 创建派生属性。例如，输入 `aws_environment`，表达式为 `assertion["https://sts.amazonaws.com/"]["principal_tags"]["environment"]`，即可从上方解码令牌示例创建 `openai.aws_environment`。使用前请先在示例令牌中验证嵌套 claim path；如果 transformation 无法求值，mapping resolution 会失败。除非配置了匹配的 transformation，否则原始令牌中已经以 `openai.` 开头的 claims 会被忽略，不能用于 `openai.` mapping keys。

#### 设置 service account mapping

1. **创建 service account mapping。** 将 **Name** 设为 Workload Identity Provider 内唯一的值，例如 `aws-role-openai-wif`。使用 **Description**，例如 `Production AWS role for OpenAI API workload`，说明哪个工作负载可以使用此 mapping。

2. **匹配 AWS principal。** 将 **Key** 设为 `sub`，并将 **Value** 设为解码令牌中的 IAM principal ARN，例如 `arn:aws:iam::123456789012:role/OpenAIWifRole`。精确匹配 `sub` claim 可为 AWS outbound identity federation 提供最强隔离。

3. **按需添加额外 claim matches。** 你可以匹配任何可用的标量 claim 或 transformed attribute。例如，如果需要额外的信任边界，可使用从 AWS account、organization、principal tag 或 request tag claims 派生的 transformed attributes。

4. **选择 OpenAI target。** 将 **Project** 设为拥有目标 service account 的 OpenAI project。将 **Service account** 设为 AWS 工作负载可使用的 OpenAI service account，例如 `aws-outbound-prod-openai-wif`。

5. **按需收窄 API permissions。** 选择合适的 **Permissions**，例如 `api.model.request` 和 `api.vector_store.read`，以进一步收窄此 mapping 铸造的 access token。将 permissions 留空可避免添加 WIF 专属 scope 限制；该令牌仍会以映射到的 service account 授权。

### 在代码中使用令牌

配置你的 OpenAI SDK client，使其从 AWS STS 请求 AWS 签发的 OIDC token，并将其交换为 OpenAI 签发的 access token。

将 `OPENAI_WIF_AUDIENCE` 设为 OpenAI Workload Identity Provider 上配置的同一 audience。subject token provider 会使用该 audience 调用 AWS STS `GetWebIdentityToken`，返回 AWS 签发的 JWT 作为 subject token，然后 OpenAI SDK 将其交换为 OpenAI 签发的 access token。

从 AWS 签发的 OIDC token 进行身份验证

```typescript
import { GetWebIdentityTokenCommand, STSClient } from "@aws-sdk/client-sts";
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;
const audience = process.env.OPENAI_WIF_AUDIENCE;
const awsRegion = process.env.AWS_REGION;

if (!identityProviderId || !serviceAccountId || !audience || !awsRegion) {
  throw new Error(
    "Set OPENAI_IDENTITY_PROVIDER_ID, OPENAI_SERVICE_ACCOUNT_ID, OPENAI_WIF_AUDIENCE, and AWS_REGION"
  );
}

const sts = new STSClient({ region: awsRegion });

function awsOutboundWebIdentityTokenProvider(): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const response = await sts.send(
        new GetWebIdentityTokenCommand({
          Audience: [audience],
          SigningAlgorithm: "ES384",
          DurationSeconds: 300,
        })
      );

      if (!response.WebIdentityToken) {
        throw new Error("AWS STS did not return a web identity token.");
      }

      return response.WebIdentityToken;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: awsOutboundWebIdentityTokenProvider(),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from AWS outbound workload identity federation.",
});

console.log(response.output_text);
```

```python
import os

import boto3
from openai import OpenAI
from openai.auth import SubjectTokenProvider


def aws_outbound_web_identity_token_provider(audience: str) -> SubjectTokenProvider:
    sts = boto3.client("sts", region_name=os.environ["AWS_REGION"])

    def get_token() -> str:
        response = sts.get_web_identity_token(
            Audience=[audience],
            SigningAlgorithm="ES384",
            DurationSeconds=300,
        )
        token = response.get("WebIdentityToken", "")
        if not token:
            raise RuntimeError("AWS STS did not return a web identity token.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": aws_outbound_web_identity_token_provider(
            os.environ["OPENAI_WIF_AUDIENCE"]
        ),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from AWS outbound workload identity federation.",
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

	awssdk "github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sts"
	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/auth"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
)

type awsOutboundWebIdentityTokenProvider struct {
	client   *sts.Client
	audience string
}

func (p awsOutboundWebIdentityTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p awsOutboundWebIdentityTokenProvider) GetToken(ctx context.Context, _ auth.HTTPDoer) (string, error) {
	output, err := p.client.GetWebIdentityToken(ctx, &sts.GetWebIdentityTokenInput{
		Audience:         []string{p.audience},
		DurationSeconds:  awssdk.Int32(300),
		SigningAlgorithm: awssdk.String("ES384"),
	})
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "aws-outbound",
			Message:  "failed to request AWS web identity token",
			Cause:    err,
		}
	}

	token := awssdk.ToString(output.WebIdentityToken)
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "aws-outbound",
			Message:  "AWS STS did not return a web identity token",
		}
	}

	return token, nil
}

func main() {
	ctx := context.Background()
	audience := os.Getenv("OPENAI_WIF_AUDIENCE")
	if audience == "" {
		log.Fatal("Set OPENAI_WIF_AUDIENCE")
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		log.Fatal(err)
	}

	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: awsOutboundWebIdentityTokenProvider{
				client:   sts.NewFromConfig(cfg),
				audience: audience,
			},
		}),
	)

	response, err := client.Responses.New(ctx, responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from AWS outbound workload identity federation."),
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
import java.util.concurrent.CompletableFuture;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.model.GetWebIdentityTokenRequest;

public final class AwsOutboundWorkloadIdentityExample {
    private AwsOutboundWorkloadIdentityExample() {}

    static final class AwsOutboundWebIdentityTokenProvider implements SubjectTokenProvider {
        private final StsClient stsClient;
        private final String audience;

        AwsOutboundWebIdentityTokenProvider(StsClient stsClient, String audience) {
            this.stsClient = stsClient;
            this.audience = audience;
        }

        @Override
        public SubjectTokenType tokenType() {
            return SubjectTokenType.JWT;
        }

        @Override
        public String getToken(HttpClient httpClient, JsonMapper jsonMapper) {
            try {
                String token = stsClient.getWebIdentityToken(GetWebIdentityTokenRequest.builder()
                        .audience(audience)
                        .durationSeconds(300)
                        .signingAlgorithm("ES384")
                        .build()).webIdentityToken();

                if (token == null || token.isEmpty()) {
                    throw new SubjectTokenProviderException(
                            "aws-outbound",
                            "AWS STS did not return a web identity token",
                            null);
                }

                return token;
            } catch (SubjectTokenProviderException e) {
                throw e;
            } catch (Exception e) {
                throw new SubjectTokenProviderException(
                        "aws-outbound",
                        "failed to request AWS web identity token",
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
        String audience = System.getenv("OPENAI_WIF_AUDIENCE");
        StsClient stsClient = StsClient.builder()
                .region(Region.of(System.getenv("AWS_REGION")))
                .build();

        WorkloadIdentity workloadIdentity = WorkloadIdentity.builder()
                .identityProviderId(System.getenv("OPENAI_IDENTITY_PROVIDER_ID"))
                .serviceAccountId(System.getenv("OPENAI_SERVICE_ACCOUNT_ID"))
                .provider(new AwsOutboundWebIdentityTokenProvider(stsClient, audience))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from AWS outbound workload identity federation.")
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
require "aws-sdk-sts"
require "openai"

class AwsOutboundWebIdentityTokenProvider
  include OpenAI::Auth::SubjectTokenProvider

  def initialize(audience:, sts_client:)
    @audience = audience
    @sts_client = sts_client
  end

  def token_type
    OpenAI::Auth::TokenType::JWT
  end

  def get_token
    response = @sts_client.get_web_identity_token(
      audience: [@audience],
      signing_algorithm: "ES384",
      duration_seconds: 300
    )
    token = response.web_identity_token.to_s
    if token.empty?
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "AWS STS did not return a web identity token",
        provider: "aws-outbound"
      )
    end
    token
  rescue Aws::STS::Errors::ServiceError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to request AWS web identity token: #{e.message}",
      provider: "aws-outbound",
      cause: e
    )
  end
end

provider = AwsOutboundWebIdentityTokenProvider.new(
  audience: ENV.fetch("OPENAI_WIF_AUDIENCE"),
  sts_client: Aws::STS::Client.new(region: ENV.fetch("AWS_REGION"))
)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from AWS outbound workload identity federation."
)

puts(response.output_text)
```






## Amazon EKS projected service account tokens

通过将 EKS 签发的 projected service account token 交换为短期有效的 OpenAI 访问令牌，把 Amazon EKS 用作 Workload Identity Provider。

### 设置 EKS

为需要调用 OpenAI API 的 EKS 工作负载使用 Kubernetes `ServiceAccount`。如果还没有，请创建一个：

```bash
kubectl create serviceaccount openai-wif --namespace default
```

EKS projected service account tokens 使用格式为 `system:serviceaccount:&lt;namespace&gt;:&lt;service-account-name&gt;` 的 `sub` claim。对于上面的 service account，`sub` claim 为 `system:serviceaccount:default:openai-wif`。

检索与 EKS cluster 关联的 OIDC issuer URL：

```bash
aws eks describe-cluster \
  --name <cluster-name> \
  --region <region> \
  --query "cluster.identity.oidc.issuer" \
  --output text
```

示例输出：

```text
https://oidc.eks.us-west-2.amazonaws.com/id/EXAMPLED539D4633E53DE1B716D3
```

你在 OpenAI Workload Identity Provider 中配置的 issuer 必须与此 issuer URL 以及 projected EKS service account token 中的 `iss` claim 匹配。

使用 OpenAI 期望的 audience 和适合你的工作负载的过期时间来配置 projected service account token。OpenAI 会验证该令牌的 issuer、signature、audience 和 expiration。在本例中，token file 挂载在 `/var/run/secrets/tokens/token`，使用 audience `https://api.openai.com/v1`，并在 3600 秒后过期。如果 projected token audience 与 OpenAI Workload Identity Provider audience 匹配，你也可以使用不同的 audience：

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
        - name: eks-sa-token
          mountPath: /var/run/secrets/tokens
          readOnly: true
  volumes:
    - name: eks-sa-token
      projected:
        sources:
          - serviceAccountToken:
              path: token
              audience: "https://api.openai.com/v1"
              expirationSeconds: 3600
```

### 验证 EKS token

配置工作负载身份联合之前，请在本地解码一个 projected service account token 示例并检查其 claims。从已挂载 projected token 的运行中 pod 执行：

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

此命令会解码 JWT payload，但不会验证令牌签名。对于生产令牌，请使用本地解码器，并避免将生产令牌粘贴到第三方工具中。

解码后的 EKS projected service account token 将类似于：

```json
{
  "iss": "https://oidc.eks.us-west-2.amazonaws.com/id/EXAMPLED539D4633E53DE1B716D3",
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

使用解码后的 payload，将你收到的令牌与 OpenAI 中配置的 issuer、audience 和映射值进行比较。多数配置问题在交换令牌之前，就能从 `iss`、`aud` 和 `sub` claims 中看出来。

### 设置工作负载身份联合

在 OpenAI 中为 EKS issuer 创建一个 Workload Identity Provider，然后添加一个 service account mapping，用于匹配 projected token 中的属性。

先配置 Workload Identity Provider，然后创建 service account mapping。

#### 设置 Workload Identity Provider

1. **创建 Workload Identity Provider。** 将 **Name** 设为唯一值，例如 `aws-eks-prod`。使用 **Description**，例如 `Production EKS cluster`，帮助管理员识别该 cluster。

2. **设置 issuer 和 audience。** 将 **OIDC Issuer URL** 设为 `aws eks describe-cluster --query "cluster.identity.oidc.issuer"` 返回的 issuer。此值必须与 projected EKS service account token 中的 `iss` claim 匹配。将 **Audience** 设为 projected service account token volume 上配置的同一 audience。在本例中，该值为 `https://api.openai.com/v1`。

3. **使用 EKS OIDC discovery。** 保持 **Use uploaded JWKS for token verification** 关闭。OpenAI 使用 EKS issuer 的 OIDC discovery metadata 和 JWKS 来验证 projected service account token。

4. **仅在需要派生映射属性时添加 attribute transformations。** 原始令牌 claims，例如 `sub`、`aud` 和 `iss`，可直接用于 mapping assertions。例如，创建名为 `subject` 的 transformed attribute，表达式为 `assertion.sub`。在 dashboard 中，输入 `subject` 作为 attribute name；OpenAI 会将其存储为 `openai.subject`，你可以在 mappings 中引用它。

   &gt; **Note:** 除非配置了匹配的 transformation，否则原始令牌中已经以 `openai.` 开头的 claims 会被忽略，不能用于 `openai.` mapping keys。

#### 设置 service account mapping

1. **创建 service account mapping。** 将 **Name** 设为 Workload Identity Provider 内唯一的值，例如 `openai-mapping-eks`。使用 **Description**，例如 `Workload Identity Provider Mapping for EKS Workloads`，说明哪个工作负载可以使用此 mapping。

2. **匹配 EKS service account subject。** 将 **Key** 设为 `sub`，将 **Value** 设为 `system:serviceaccount:default:openai-wif`。你可以匹配任何可用的 claim 或 transformed attribute。匹配 `sub` 是限制最严格的选项，因为它唯一标识一个 Kubernetes service account。

3. **选择 OpenAI target。** 将 **Project** 设为拥有目标 service account 的 OpenAI project。将 **Service account** 设为 EKS 工作负载可使用的 OpenAI service account，例如 `aws-eks-prod-openai-wif`。如果你希望为此 mapping 创建一个新的 service account，而不是复用现有 service account，请勾选 `Create a new service account in this project`。

4. **按需收窄 API permissions。** 选择合适的 **Permissions**，例如 `api.model.request` 和 `api.vector_store.read`，以进一步收窄此 mapping 铸造的 access token。将 permissions 留空可避免添加 WIF 专属 scope 限制；该令牌仍会以映射到的 service account 授权。

### 在代码中使用令牌

配置你的 OpenAI SDK client，使其读取 projected EKS service account token，并将其交换为 OpenAI 签发的 access token。

将挂载的 token path，例如 `/var/run/secrets/tokens/token`，用作 SDK 工作负载身份联合 provider 的 subject token source。SDK 会将该 EKS token 交换为 OpenAI 签发的 access token，并使用 OpenAI token 对 API 请求进行身份验证。

以下示例使用自定义 subject token provider 初始化 OpenAI client。该 provider 从挂载的文件路径读取 projected EKS service account token，并将其作为工作负载身份联合的 subject token。

从 EKS projected service account token 进行身份验证

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

function mountedEksServiceAccountTokenProvider(path: string): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const token = (await readFile(path, "utf8")).trim();
      if (!token) {
        throw new Error("The mounted EKS service account token file is empty.");
      }
      return token;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: mountedEksServiceAccountTokenProvider(tokenPath),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from AWS workload identity federation.",
});

console.log(response.output_text);
```

```python
import os
from pathlib import Path

from openai import OpenAI
from openai.auth import SubjectTokenProvider

TOKEN_PATH = "/var/run/secrets/tokens/token"


def mounted_eks_service_account_token_provider(token_path: str) -> SubjectTokenProvider:
    def get_token() -> str:
        token = Path(token_path).read_text().strip()
        if not token:
            raise RuntimeError("The mounted EKS service account token file is empty.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": mounted_eks_service_account_token_provider(TOKEN_PATH),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from AWS workload identity federation.",
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

type mountedEksServiceAccountTokenProvider struct {
	path string
}

func (p mountedEksServiceAccountTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p mountedEksServiceAccountTokenProvider) GetToken(_ context.Context, _ auth.HTTPDoer) (string, error) {
	data, err := os.ReadFile(p.path)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "aws-eks",
			Message:  "failed to read mounted EKS service account token",
			Cause:    err,
		}
	}

	token := strings.TrimSpace(string(data))
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "aws-eks",
			Message:  "mounted EKS service account token is empty",
		}
	}

	return token, nil
}

func main() {
	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: mountedEksServiceAccountTokenProvider{
				path: tokenPath,
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from AWS workload identity federation."),
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

public final class AwsEksWorkloadIdentityExample {
    private static final String TOKEN_PATH = "/var/run/secrets/tokens/token";

    private AwsEksWorkloadIdentityExample() {}

    static final class MountedEksServiceAccountTokenProvider implements SubjectTokenProvider {
        private final Path tokenPath;

        MountedEksServiceAccountTokenProvider(String tokenPath) {
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
                        "aws-eks",
                        "failed to read mounted EKS service account token",
                        e);
            }

            if (token.isEmpty()) {
                throw new SubjectTokenProviderException(
                        "aws-eks",
                        "mounted EKS service account token is empty",
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
                .provider(new MountedEksServiceAccountTokenProvider(TOKEN_PATH))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from AWS workload identity federation.")
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

class MountedEksServiceAccountTokenProvider
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
        message: "Mounted EKS service account token is empty",
        provider: "aws-eks"
      )
    end
    token
  rescue SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to read mounted EKS service account token: #{e.message}",
      provider: "aws-eks",
      cause: e
    )
  end
end

provider = MountedEksServiceAccountTokenProvider.new(token_path: TOKEN_PATH)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from AWS workload identity federation."
)

puts(response.output_text)
```






## AWS best practices

- 为每个工作负载使用专用的 AWS identity。为 AWS outbound identity federation 使用独立的 IAM roles，并为 EKS 工作负载使用独立的 Kubernetes service accounts。
- 为 OpenAI 访问配置专用 audience。在 AWS 签发或 EKS projected token 中，以及 OpenAI Workload Identity Provider 配置中，使用相同的 audience 值。
- 保持合理较短的令牌生命周期。对于 AWS outbound identity federation，请使用 `sts:DurationSeconds` 等 IAM conditions；对于 EKS，请设置合适的 projected token expiration。
- 优先精确匹配 subject。对于 AWS outbound tokens，匹配完整的 IAM principal ARN；对于 EKS tokens，匹配完整的 Kubernetes service account subject。
- 将 mappings 限定到稳定边界。在 account、organization、namespace 或 transformed attributes 能减少访问权限且不会创建过宽信任规则时使用它们。
- 交换令牌时重新加载令牌。按需请求 AWS outbound tokens，并从挂载的文件路径读取 EKS projected tokens，以便自动获取轮换后的令牌。
- 仅授予工作负载所需的权限。使用 mapping-level permissions 进一步收窄目标 OpenAI service account 授予的访问权限。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Use AWS as a Workload Identity Provider in either of these scenarios:

- **AWS outbound identity federation:** Exchange an AWS STS-issued OIDC JWT from `GetWebIdentityToken` for a short-lived OpenAI access token.
- **Amazon EKS:** Exchange a projected Amazon EKS service account token for a short-lived OpenAI access token.

OpenAI supports AWS-issued OIDC JWTs from outbound identity federation and
  Kubernetes projected service account tokens issued by Amazon EKS. OpenAI does
  not support SigV4-signed requests or AWS STS temporary access key credentials
  as workload identity federation subject tokens.



<div data-content-switcher-pane data-value="outbound">

## AWS outbound identity federation

AWS outbound identity federation lets an AWS principal request a signed OIDC JWT from AWS STS and present that token to an external service. In OpenAI workload identity federation, the AWS-issued JWT is the subject token that OpenAI validates before issuing an OpenAI access token.

### Setting up AWS outbound identity federation

Enable outbound identity federation for the AWS account that will issue tokens. For setup details, see the AWS guide to [getting started with outbound identity federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_outbound_getting_started.html).

```bash
aws iam enable-outbound-web-identity-federation
```

Record the account-specific issuer URL returned by AWS. You will configure this value as the OpenAI Workload Identity Provider issuer, and it must match the `iss` claim in AWS-issued tokens.

The AWS STS `GetWebIdentityToken` API is not available on the STS global
  endpoint. Configure the AWS CLI or SDK to use a regional STS endpoint.

Grant the workload permission to call `sts:GetWebIdentityToken`. Restrict the audience and maximum token lifetime in IAM so the AWS principal can mint only tokens intended for OpenAI. This example allows tokens for the audience `https://api.openai.com/v1` with a maximum lifetime of 300 seconds:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:GetWebIdentityToken",
      "Resource": "*",
      "Condition": {
        "ForAllValues:StringEquals": {
          "sts:IdentityTokenAudience": "https://api.openai.com/v1"
        },
        "NumericLessThanEquals": {
          "sts:DurationSeconds": 300
        }
      }
    }
  ]
}
```

Request an AWS-issued OIDC token with the same audience you will configure on the OpenAI Workload Identity Provider. Use `ES384` unless your environment requires `RS256` compatibility.

```bash
TOKEN=$(aws sts get-web-identity-token \
  --audience "https://api.openai.com/v1" \
  --signing-algorithm ES384 \
  --duration-seconds 300 \
  --tags Key=environment,Value=production \
         Key=workload,Value=batch-ingest \
  --query "WebIdentityToken" \
  --output text)
```

### Verify the AWS-issued token

Before configuring workload identity federation, decode a sample AWS-issued token locally and inspect its claims:

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

A decoded AWS-issued OIDC token will look similar to:

```json
{
  "iss": "https://abc123-def456-ghi789-jkl012.tokens.sts.global.api.aws",
  "aud": "https://api.openai.com/v1",
  "sub": "arn:aws:iam::123456789012:role/OpenAIWifRole",
  "iat": 1716235422,
  "exp": 1716235722,
  "jti": "jwt-id-example",
  "https://sts.amazonaws.com/": {
    "aws_account": "123456789012",
    "source_region": "us-west-2",
    "org_id": "o-exampleorgid",
    "principal_tags": {
      "environment": "production"
    },
    "request_tags": {
      "environment": "production",
      "workload": "batch-ingest"
    }
  }
}
```

Not every AWS-issued token contains every AWS-specific claim. The claims under `https://sts.amazonaws.com/` depend on the calling principal, session context, and request tags.

Verify the claims you plan to configure in OpenAI:

- `iss`: Must match the AWS account-specific issuer URL configured in the OpenAI Workload Identity Provider.
- `aud`: Must match the `GetWebIdentityToken` audience and the OpenAI Workload Identity Provider audience.
- `sub`: Identifies the IAM principal ARN that requested the token. Prefer matching the exact role ARN.
- AWS-specific claims: Use the decoded token as the source of truth before matching account, organization, principal tag, or request tag values.

Use the decoded payload to compare the token you received with the issuer, audience, and mapping values configured in OpenAI. Most configuration issues are visible in the `iss`, `aud`, and `sub` claims before you exchange the token.

### Setting up workload identity federation

Create a Workload Identity Provider in OpenAI for the AWS account issuer, then add a service account mapping that matches stable claims from the AWS-issued token.

Configure the Workload Identity Provider first, then create the service account mapping.

#### Set up the Workload Identity Provider

1. **Create the Workload Identity Provider.** Set **Name** to a unique value, such as `aws-outbound-prod`. Use **Description**, such as `Production AWS outbound identity federation workloads`, to help admins identify the provider.

2. **Set the issuer and audience.** Set **OIDC Issuer URL** to the AWS account-specific issuer URL returned when outbound identity federation was enabled. This value must match the token's `iss` claim. Set **Audience** to the same audience passed to `GetWebIdentityToken`. In this example, that value is `https://api.openai.com/v1`.

3. **Use AWS OIDC discovery.** Leave **Use uploaded JWKS for token verification** disabled. OpenAI uses the AWS issuer's OIDC discovery metadata and JWKS to verify the AWS-issued token.

4. **Add attribute transformations only if you need derived mapping attributes.** Raw token matching supports top-level scalar claims such as `sub`, `aud`, and `iss`. AWS-specific namespaced claims are nested under `https://sts.amazonaws.com/`, so create derived attributes with CEL bracket notation before using them in mappings. For example, enter `aws_environment` with expression `assertion["https://sts.amazonaws.com/"]["principal_tags"]["environment"]` to create `openai.aws_environment` from the decoded token example above. Verify the nested claim path in a sample token before using it; if a transformation cannot be evaluated, mapping resolution fails. Raw token claims that already start with `openai.` are ignored for `openai.` mapping keys unless a matching transformation is configured.

#### Set up the service account mapping

1. **Create a service account mapping.** Set **Name** to a value that is unique within the Workload Identity Provider, such as `aws-role-openai-wif`. Use **Description**, such as `Production AWS role for OpenAI API workload`, to explain which workload can use the mapping.

2. **Match the AWS principal.** Set **Key** to `sub` and **Value** to the IAM principal ARN from the decoded token, such as `arn:aws:iam::123456789012:role/OpenAIWifRole`. Matching on the exact `sub` claim provides the strongest isolation for AWS outbound identity federation.

3. **Add additional claim matches if needed.** You can match on any available scalar claim or transformed attribute. For example, use transformed attributes derived from AWS account, organization, principal tag, or request tag claims if you need additional trust boundaries.

4. **Choose the OpenAI target.** Set **Project** to the OpenAI project that owns the target service account. Set **Service account** to the OpenAI service account the AWS workload can use, such as `aws-outbound-prod-openai-wif`.

5. **Narrow API permissions if needed.** Select appropriate **Permissions** such as `api.model.request` and `api.vector_store.read` to further narrow access tokens minted from this mapping. Leave permissions blank to avoid adding a WIF-specific scope restriction; the token still authorizes as the mapped service account.

### Using the token in code

Configure your OpenAI SDK client to request an AWS-issued OIDC token from AWS STS and exchange it for an OpenAI-issued access token.

Set `OPENAI_WIF_AUDIENCE` to the same audience configured on the OpenAI Workload Identity Provider. The subject token provider calls AWS STS `GetWebIdentityToken` with that audience, returns the AWS-issued JWT as the subject token, and the OpenAI SDK exchanges it for an OpenAI-issued access token.

Authenticate from an AWS-issued OIDC token

```typescript
import { GetWebIdentityTokenCommand, STSClient } from "@aws-sdk/client-sts";
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;
const audience = process.env.OPENAI_WIF_AUDIENCE;
const awsRegion = process.env.AWS_REGION;

if (!identityProviderId || !serviceAccountId || !audience || !awsRegion) {
  throw new Error(
    "Set OPENAI_IDENTITY_PROVIDER_ID, OPENAI_SERVICE_ACCOUNT_ID, OPENAI_WIF_AUDIENCE, and AWS_REGION"
  );
}

const sts = new STSClient({ region: awsRegion });

function awsOutboundWebIdentityTokenProvider(): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const response = await sts.send(
        new GetWebIdentityTokenCommand({
          Audience: [audience],
          SigningAlgorithm: "ES384",
          DurationSeconds: 300,
        })
      );

      if (!response.WebIdentityToken) {
        throw new Error("AWS STS did not return a web identity token.");
      }

      return response.WebIdentityToken;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: awsOutboundWebIdentityTokenProvider(),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from AWS outbound workload identity federation.",
});

console.log(response.output_text);
```

```python
import os

import boto3
from openai import OpenAI
from openai.auth import SubjectTokenProvider


def aws_outbound_web_identity_token_provider(audience: str) -> SubjectTokenProvider:
    sts = boto3.client("sts", region_name=os.environ["AWS_REGION"])

    def get_token() -> str:
        response = sts.get_web_identity_token(
            Audience=[audience],
            SigningAlgorithm="ES384",
            DurationSeconds=300,
        )
        token = response.get("WebIdentityToken", "")
        if not token:
            raise RuntimeError("AWS STS did not return a web identity token.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": aws_outbound_web_identity_token_provider(
            os.environ["OPENAI_WIF_AUDIENCE"]
        ),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from AWS outbound workload identity federation.",
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

	awssdk "github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sts"
	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/auth"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
)

type awsOutboundWebIdentityTokenProvider struct {
	client   *sts.Client
	audience string
}

func (p awsOutboundWebIdentityTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p awsOutboundWebIdentityTokenProvider) GetToken(ctx context.Context, _ auth.HTTPDoer) (string, error) {
	output, err := p.client.GetWebIdentityToken(ctx, &sts.GetWebIdentityTokenInput{
		Audience:         []string{p.audience},
		DurationSeconds:  awssdk.Int32(300),
		SigningAlgorithm: awssdk.String("ES384"),
	})
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "aws-outbound",
			Message:  "failed to request AWS web identity token",
			Cause:    err,
		}
	}

	token := awssdk.ToString(output.WebIdentityToken)
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "aws-outbound",
			Message:  "AWS STS did not return a web identity token",
		}
	}

	return token, nil
}

func main() {
	ctx := context.Background()
	audience := os.Getenv("OPENAI_WIF_AUDIENCE")
	if audience == "" {
		log.Fatal("Set OPENAI_WIF_AUDIENCE")
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		log.Fatal(err)
	}

	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: awsOutboundWebIdentityTokenProvider{
				client:   sts.NewFromConfig(cfg),
				audience: audience,
			},
		}),
	)

	response, err := client.Responses.New(ctx, responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from AWS outbound workload identity federation."),
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
import java.util.concurrent.CompletableFuture;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.model.GetWebIdentityTokenRequest;

public final class AwsOutboundWorkloadIdentityExample {
    private AwsOutboundWorkloadIdentityExample() {}

    static final class AwsOutboundWebIdentityTokenProvider implements SubjectTokenProvider {
        private final StsClient stsClient;
        private final String audience;

        AwsOutboundWebIdentityTokenProvider(StsClient stsClient, String audience) {
            this.stsClient = stsClient;
            this.audience = audience;
        }

        @Override
        public SubjectTokenType tokenType() {
            return SubjectTokenType.JWT;
        }

        @Override
        public String getToken(HttpClient httpClient, JsonMapper jsonMapper) {
            try {
                String token = stsClient.getWebIdentityToken(GetWebIdentityTokenRequest.builder()
                        .audience(audience)
                        .durationSeconds(300)
                        .signingAlgorithm("ES384")
                        .build()).webIdentityToken();

                if (token == null || token.isEmpty()) {
                    throw new SubjectTokenProviderException(
                            "aws-outbound",
                            "AWS STS did not return a web identity token",
                            null);
                }

                return token;
            } catch (SubjectTokenProviderException e) {
                throw e;
            } catch (Exception e) {
                throw new SubjectTokenProviderException(
                        "aws-outbound",
                        "failed to request AWS web identity token",
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
        String audience = System.getenv("OPENAI_WIF_AUDIENCE");
        StsClient stsClient = StsClient.builder()
                .region(Region.of(System.getenv("AWS_REGION")))
                .build();

        WorkloadIdentity workloadIdentity = WorkloadIdentity.builder()
                .identityProviderId(System.getenv("OPENAI_IDENTITY_PROVIDER_ID"))
                .serviceAccountId(System.getenv("OPENAI_SERVICE_ACCOUNT_ID"))
                .provider(new AwsOutboundWebIdentityTokenProvider(stsClient, audience))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from AWS outbound workload identity federation.")
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
require "aws-sdk-sts"
require "openai"

class AwsOutboundWebIdentityTokenProvider
  include OpenAI::Auth::SubjectTokenProvider

  def initialize(audience:, sts_client:)
    @audience = audience
    @sts_client = sts_client
  end

  def token_type
    OpenAI::Auth::TokenType::JWT
  end

  def get_token
    response = @sts_client.get_web_identity_token(
      audience: [@audience],
      signing_algorithm: "ES384",
      duration_seconds: 300
    )
    token = response.web_identity_token.to_s
    if token.empty?
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "AWS STS did not return a web identity token",
        provider: "aws-outbound"
      )
    end
    token
  rescue Aws::STS::Errors::ServiceError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to request AWS web identity token: #{e.message}",
      provider: "aws-outbound",
      cause: e
    )
  end
end

provider = AwsOutboundWebIdentityTokenProvider.new(
  audience: ENV.fetch("OPENAI_WIF_AUDIENCE"),
  sts_client: Aws::STS::Client.new(region: ENV.fetch("AWS_REGION"))
)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from AWS outbound workload identity federation."
)

puts(response.output_text)
```


  </div>

  <div data-content-switcher-pane data-value="eks" hidden>

## Amazon EKS projected service account tokens

Use Amazon EKS as a Workload Identity Provider by exchanging an EKS-issued projected service account token for a short-lived OpenAI access token.

### Setting up EKS

Use a Kubernetes `ServiceAccount` for the EKS workload that needs to call the OpenAI API. If you do not already have one, create it:

```bash
kubectl create serviceaccount openai-wif --namespace default
```

EKS projected service account tokens use a `sub` claim in the format `system:serviceaccount:<namespace>:<service-account-name>`. For the service account above, the `sub` claim is `system:serviceaccount:default:openai-wif`.

Retrieve the OIDC issuer URL associated with the EKS cluster:

```bash
aws eks describe-cluster \
  --name <cluster-name> \
  --region <region> \
  --query "cluster.identity.oidc.issuer" \
  --output text
```

Example output:

```text
https://oidc.eks.us-west-2.amazonaws.com/id/EXAMPLED539D4633E53DE1B716D3
```

The issuer you configure in the OpenAI Workload Identity Provider must match this issuer URL and the `iss` claim in the projected EKS service account token.

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
        - name: eks-sa-token
          mountPath: /var/run/secrets/tokens
          readOnly: true
  volumes:
    - name: eks-sa-token
      projected:
        sources:
          - serviceAccountToken:
              path: token
              audience: "https://api.openai.com/v1"
              expirationSeconds: 3600
```

### Verify the EKS token

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

A decoded EKS projected service account token will look similar to:

```json
{
  "iss": "https://oidc.eks.us-west-2.amazonaws.com/id/EXAMPLED539D4633E53DE1B716D3",
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

Create a Workload Identity Provider in OpenAI for the EKS issuer, then add a service account mapping that matches attributes from the projected token.

Configure the Workload Identity Provider first, then create the service account mapping.

#### Set up the Workload Identity Provider

1. **Create the Workload Identity Provider.** Set **Name** to a unique value, such as `aws-eks-prod`. Use **Description**, such as `Production EKS cluster`, to help admins identify the cluster.

2. **Set the issuer and audience.** Set **OIDC Issuer URL** to the issuer returned by `aws eks describe-cluster --query "cluster.identity.oidc.issuer"`. This value must match the `iss` claim in the projected EKS service account token. Set **Audience** to the same audience configured on the projected service account token volume. In this example, that value is `https://api.openai.com/v1`.

3. **Use EKS OIDC discovery.** Leave **Use uploaded JWKS for token verification** disabled. OpenAI uses the EKS issuer's OIDC discovery metadata and JWKS to verify the projected service account token.

4. **Add attribute transformations only if you need derived mapping attributes.** Raw token claims such as `sub`, `aud`, and `iss` can be used directly in mapping assertions. For example, create a transformed attribute named `subject` with expression `assertion.sub`. In the dashboard, enter `subject` as the attribute name; OpenAI stores it as `openai.subject`, which you can reference in mappings.

   > **Note:** Raw token claims that already start with `openai.` are ignored for `openai.` mapping keys unless a matching transformation is configured.

#### Set up the service account mapping

1. **Create a service account mapping.** Set **Name** to a unique value within the Workload Identity Provider, such as `openai-mapping-eks`. Use **Description**, such as `Workload Identity Provider Mapping for EKS Workloads`, to explain which workload can use the mapping.

2. **Match the EKS service account subject.** Set **Key** to `sub` and **Value** to `system:serviceaccount:default:openai-wif`. You can match on any available claim or transformed attribute. Matching on `sub` is the most restrictive option because it uniquely identifies a Kubernetes service account.

3. **Choose the OpenAI target.** Set **Project** to the OpenAI project that owns the target service account. Set **Service account** to the OpenAI service account the EKS workload can use, such as `aws-eks-prod-openai-wif`. Check `Create a new service account in this project` if you wish to create a new service account for this mapping rather than reuse an existing one.

4. **Narrow API permissions if needed.** Select appropriate **Permissions** such as `api.model.request` and `api.vector_store.read` to further narrow access tokens minted from this mapping. Leave permissions blank to avoid adding a WIF-specific scope restriction; the token still authorizes as the mapped service account.

### Using the token in code

Configure your OpenAI SDK client to read the projected EKS service account token and exchange it for an OpenAI-issued access token.

Use the mounted token path, such as `/var/run/secrets/tokens/token`, as the subject token source for the SDK workload identity federation provider. The SDK exchanges that EKS token for an OpenAI-issued access token and uses the OpenAI token to authenticate API requests.

The following examples initialize an OpenAI client with a custom subject token provider. The provider reads the projected EKS service account token from the mounted file path and uses it as the subject token for workload identity federation.

Authenticate from an EKS projected service account token

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

function mountedEksServiceAccountTokenProvider(path: string): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const token = (await readFile(path, "utf8")).trim();
      if (!token) {
        throw new Error("The mounted EKS service account token file is empty.");
      }
      return token;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: mountedEksServiceAccountTokenProvider(tokenPath),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from AWS workload identity federation.",
});

console.log(response.output_text);
```

```python
import os
from pathlib import Path

from openai import OpenAI
from openai.auth import SubjectTokenProvider

TOKEN_PATH = "/var/run/secrets/tokens/token"


def mounted_eks_service_account_token_provider(token_path: str) -> SubjectTokenProvider:
    def get_token() -> str:
        token = Path(token_path).read_text().strip()
        if not token:
            raise RuntimeError("The mounted EKS service account token file is empty.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": mounted_eks_service_account_token_provider(TOKEN_PATH),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from AWS workload identity federation.",
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

type mountedEksServiceAccountTokenProvider struct {
	path string
}

func (p mountedEksServiceAccountTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p mountedEksServiceAccountTokenProvider) GetToken(_ context.Context, _ auth.HTTPDoer) (string, error) {
	data, err := os.ReadFile(p.path)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "aws-eks",
			Message:  "failed to read mounted EKS service account token",
			Cause:    err,
		}
	}

	token := strings.TrimSpace(string(data))
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "aws-eks",
			Message:  "mounted EKS service account token is empty",
		}
	}

	return token, nil
}

func main() {
	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: mountedEksServiceAccountTokenProvider{
				path: tokenPath,
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from AWS workload identity federation."),
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

public final class AwsEksWorkloadIdentityExample {
    private static final String TOKEN_PATH = "/var/run/secrets/tokens/token";

    private AwsEksWorkloadIdentityExample() {}

    static final class MountedEksServiceAccountTokenProvider implements SubjectTokenProvider {
        private final Path tokenPath;

        MountedEksServiceAccountTokenProvider(String tokenPath) {
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
                        "aws-eks",
                        "failed to read mounted EKS service account token",
                        e);
            }

            if (token.isEmpty()) {
                throw new SubjectTokenProviderException(
                        "aws-eks",
                        "mounted EKS service account token is empty",
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
                .provider(new MountedEksServiceAccountTokenProvider(TOKEN_PATH))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from AWS workload identity federation.")
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

class MountedEksServiceAccountTokenProvider
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
        message: "Mounted EKS service account token is empty",
        provider: "aws-eks"
      )
    end
    token
  rescue SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to read mounted EKS service account token: #{e.message}",
      provider: "aws-eks",
      cause: e
    )
  end
end

provider = MountedEksServiceAccountTokenProvider.new(token_path: TOKEN_PATH)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-5.4-mini",
  input: "Say hello from AWS workload identity federation."
)

puts(response.output_text)
```


  </div>



## AWS best practices

- Use a dedicated AWS identity per workload. Use separate IAM roles for AWS outbound identity federation and separate Kubernetes service accounts for EKS workloads.
- Configure a dedicated audience for OpenAI access. Use the same audience value in the AWS-issued or EKS projected token and in the OpenAI Workload Identity Provider configuration.
- Keep token lifetimes reasonably short. For AWS outbound identity federation, use IAM conditions such as `sts:DurationSeconds`; for EKS, set an appropriate projected token expiration.
- Prefer exact subject matching. Match on the full IAM principal ARN for AWS outbound tokens or the full Kubernetes service account subject for EKS tokens.
- Scope mappings to stable boundaries. Use account, organization, namespace, or transformed attributes when they reduce access without creating broad trust rules.
- Reload tokens when exchanging them. Request AWS outbound tokens when needed, and read EKS projected tokens from the mounted file path so rotated tokens are picked up automatically.
- Grant only the permissions required by the workload. Use mapping-level permissions to further narrow access granted by the target OpenAI service account.
``````
:::
:::

