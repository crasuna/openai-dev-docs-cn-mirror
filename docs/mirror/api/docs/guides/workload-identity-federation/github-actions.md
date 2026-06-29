---
title: "为 GitHub Actions 配置工作负载身份联合"
description: "Configure GitHub Actions as a workload identity federation token provider."
outline: deep
---

# 为 GitHub Actions 配置工作负载身份联合

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/workload-identity-federation/github-actions](https://developers.openai.com/api/docs/guides/workload-identity-federation/github-actions)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/workload-identity-federation/github-actions.md](https://developers.openai.com/api/docs/guides/workload-identity-federation/github-actions.md)
- 抓取时间：2026-06-27T05:54:12.511Z
- Checksum：`3a845a10d70d04f89f4700afb6ad0d2bb5c786cf97551aa3a0440f08ccd719a0`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
通过将 GitHub 签发的 OIDC token 交换为短期有效的 OpenAI 访问令牌，把 GitHub Actions 用作 Workload Identity Provider。这样，workflows 无需在 GitHub secrets 中存储长期有效的 API key，也能向 OpenAI API 进行身份验证。

当 workflow job 具有 `id-token: write` 权限并请求 identity token 时，GitHub 可以为其铸造一个已签名的 OIDC JWT。OpenAI 会先验证该令牌的 issuer、audience、signature 和 mapping attributes，然后再签发 OpenAI 访问令牌。

## 设置 GitHub Actions

授予 workflow 或 job 请求 GitHub OIDC token 的权限：

```yaml
permissions:
  id-token: write
  contents: read
```

`id-token: write` 权限允许 job 请求 OIDC JWT。它不会授予对 repository contents 的写入权限。`contents: read` 权限是 `actions/checkout` 所需的。

使用 OpenAI Workload Identity Provider 中配置的精确 audience 请求令牌。自定义 JavaScript actions 可以调用 `core.getIDToken("your-wif-audience")`；shell steps 可以直接调用 GitHub 的 OIDC request URL。包含保留 URL 字符的 audience 值，例如 `https://api.openai.com/v1`，在附加到 request URL 之前应先进行 URL encoding：

```bash
AUDIENCE="https://api.openai.com/v1"
ENCODED_AUDIENCE=$(jq -rn --arg audience "$AUDIENCE" '$audience | @uri')

TOKEN=$(curl -sSf -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
  "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=${ENCODED_AUDIENCE}" | jq -r .value)
```

重要的 GitHub OIDC claims 包括：

- `iss`：令牌 issuer。对于 GitHub Actions，此值为 `https://token.actions.githubusercontent.com`。
- `aud`：workflow 请求的 audience 值。将 OpenAI 配置为要求你请求的精确值，例如 `your-wif-audience` 或 `https://api.openai.com/v1`。
- `sub`：主 subject 字符串。GitHub 会根据 repository、branch、tag、pull request 或 environment 等 workflow metadata 构造它。
- `repository`：运行 workflow 的 repository，例如 `my-org/my-repo`。
- `repository_owner`：拥有该 repository 的 organization 或 user，例如 `my-org`。
- `ref`：触发 workflow 的 Git ref，例如 `refs/heads/main` 或 `refs/tags/v1.0.0`。
- `workflow`：workflow claim。请使用 GitHub 实际发出的 claim 值，例如如果你的 job 中 workflow claim 为 `deploy`，则使用 `deploy`。
- `workflow_ref`：workflow file path 和 ref，例如 `my-org/my-repo/.github/workflows/deploy.yml@refs/heads/main`。
- `environment`：GitHub environment name，例如 job 使用 environment 时的 `production`。
- `run_id`、`run_number`、`run_attempt` 和 `job_workflow_ref`：run 和 job identifiers，可帮助审计或实现更高级的 trust rules。

有关完整 claim 列表和 subject 格式，请参阅 GitHub 的 [OpenID Connect 参考](https://docs.github.com/en/actions/reference/security/oidc)。

## 验证令牌

配置工作负载身份联合之前，请在 workflow runner 中解码一个 GitHub OIDC token 示例并检查其 claims。在 workflow step 中请求令牌后：

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

此命令会解码 JWT payload，但不会验证令牌签名。对于生产令牌，请使用本地解码器，并避免将生产令牌粘贴到第三方工具中。切勿记录原始 GitHub OIDC token 或交换得到的 OpenAI access token。

解码后的 GitHub Actions OIDC token 将类似于：

```json
{
  "iss": "https://token.actions.githubusercontent.com",
  "aud": "https://api.openai.com/v1",
  "sub": "repo:my-org/my-repo:environment:production",
  "repository": "my-org/my-repo",
  "repository_owner": "my-org",
  "ref": "refs/heads/main",
  "workflow": "deploy",
  "workflow_ref": "my-org/my-repo/.github/workflows/deploy.yml@refs/heads/main",
  "environment": "production",
  "run_id": "1234567890",
  "run_attempt": "1"
}
```

使用解码后的 payload，将你收到的令牌与 OpenAI 中配置的 issuer、audience 和映射值进行比较。多数配置问题在交换令牌之前，就能从 `iss`、`aud`、`repository`、`ref` 和 `workflow_ref` claims 中看出来。

## 设置工作负载身份联合

在 OpenAI 中为 GitHub Actions 创建一个 Workload Identity Provider，然后添加一个 service account mapping，用于匹配你信任的 GitHub workflow claims。

先配置 Workload Identity Provider，然后创建 service account mapping。

### 设置 Workload Identity Provider

1. **创建 Workload Identity Provider。** 将 **Name** 设为唯一值，例如 `github-actions-prod`。使用 **Description**，例如 `Production GitHub Actions workflows`，帮助管理员识别该 provider。

2. **设置 issuer 和 audience。** 将 **OIDC Issuer URL** 设为 `https://token.actions.githubusercontent.com`。将 **Audience** 设为你的 workflow 请求的精确 audience，例如 `your-wif-audience` 或 `https://api.openai.com/v1`。

3. **使用 GitHub OIDC discovery。** 保持 **Use uploaded JWKS for token verification** 关闭。OpenAI 使用 GitHub 的 OIDC discovery metadata 和 JWKS 来验证 GitHub 签名的令牌。

4. **仅在需要派生映射属性时添加 attribute transformations。** 原始 GitHub claims，例如 `repository`、`ref` 和 `workflow`，可直接用于 mapping assertions。如果你创建派生属性，dashboard 会自动应用 `openai.` 前缀；例如，输入 `github_repository`，表达式为 `assertion.repository`，即可创建 `openai.github_repository`。除非配置了匹配的 transformation，否则原始令牌中已经以 `openai.` 开头的 claims 会被忽略，不能用于 `openai.` mapping keys。

### 设置 service account mapping

1. **创建 service account mapping。** 将 **Name** 设为 Workload Identity Provider 内唯一的值，例如 `github-actions-main-deploy`。使用 **Description**，例如 `Production deploy workflow on main`，说明哪个 workflow 可以使用此 mapping。

2. **添加精确 claim assertions。** 为每个必须匹配的 GitHub claim 添加一行 **Key** 和 **Value**。OpenAI 要求每个已配置的行都匹配后，才会签发 access token。对于 production deploy workflow，请使用如下 assertions：

```text
   iss == "https://token.actions.githubusercontent.com"
   aud == "https://api.openai.com/v1"
   repository == "my-org/my-repo"
   ref == "refs/heads/main"
   workflow_ref == "my-org/my-repo/.github/workflows/deploy.yml@refs/heads/main"
```

   对于 privileged mappings，建议优先使用 `workflow_ref` 而不是 `workflow`，因为管理员通常意图信任特定 workflow file path 和 ref。Workflow names 可以被重命名，多个 workflow files 也可以共享同一个名称。

   在 mapping UI 中，将这些输入为 key/value rows，例如 **Key** `repository` 搭配 **Value** `my-org/my-repo`、**Key** `ref` 搭配 **Value** `refs/heads/main`，以及 **Key** `workflow_ref` 搭配 **Value** `my-org/my-repo/.github/workflows/deploy.yml@refs/heads/main`。如果 job 使用 GitHub environment，也请添加 **Key** `environment` 和 **Value** `production`。

   &gt; **Caution:** 避免过宽的 mappings，例如仅信任 `repository_owner == "my-org"`，除非该 owner namespace 下的每个 repository 都应能够铸造 OpenAI access tokens。

3. **选择 OpenAI target。** 将 **Project** 设为拥有目标 service account 的 OpenAI project。将 **Service account** 设为 GitHub workflow 可使用的 OpenAI service account，例如 `github-actions-prod-deploy`。

4. **按需收窄 API permissions。** 选择合适的 **Permissions**，例如 `api.model.request` 和 `api.vector_store.read`，以进一步收窄此 mapping 铸造的 access token。将 permissions 留空可避免添加 WIF 专属 scope 限制；该令牌仍会以映射到的 service account 授权。

## 在 workflow 中使用令牌

配置你的 OpenAI SDK client，使其请求 GitHub OIDC token，并将其交换为 OpenAI 签发的 access token。

workflow 必须授予 `id-token: write` 权限，并将工作负载身份联合设置传递给 SDK 代码。SDK 会从 GitHub 暴露给 job 的 `ACTIONS_ID_TOKEN_REQUEST_URL` 和 `ACTIONS_ID_TOKEN_REQUEST_TOKEN` 环境变量请求 GitHub OIDC token，然后使用交换得到的 OpenAI access token 对 API 请求进行身份验证。

例如，可以从如下 workflow 运行你的应用代码：

```yaml
name: deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Run OpenAI SDK code
        env:
          OPENAI_WIF_AUDIENCE: ${{ vars.OPENAI_WIF_AUDIENCE }}
          OPENAI_IDENTITY_PROVIDER_ID: ${{ vars.OPENAI_IDENTITY_PROVIDER_ID }}
          OPENAI_SERVICE_ACCOUNT_ID: ${{ vars.OPENAI_SERVICE_ACCOUNT_ID }}
        run: node ./scripts/call-openai.js
```

将 `OPENAI_WIF_AUDIENCE`、`OPENAI_IDENTITY_PROVIDER_ID` 和 `OPENAI_SERVICE_ACCOUNT_ID` 存储为 GitHub Actions variables。它们用于标识 provider 和 service account，但不是 bearer credentials。

以下示例使用自定义 subject token provider 初始化 OpenAI client。该 provider 会为配置的 audience 请求 GitHub OIDC token，并将其作为工作负载身份联合的 subject token。

从 GitHub Actions OIDC token 进行身份验证

```typescript
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;
const audience = process.env.OPENAI_WIF_AUDIENCE;
const requestURL = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;

if (
  !identityProviderId ||
  !serviceAccountId ||
  !audience ||
  !requestURL ||
  !requestToken
) {
  throw new Error(
    "Set OPENAI_IDENTITY_PROVIDER_ID, OPENAI_SERVICE_ACCOUNT_ID, OPENAI_WIF_AUDIENCE, and run inside GitHub Actions with id-token: write"
  );
}

function githubActionsOIDCTokenProvider(
  requestURL: string,
  requestToken: string,
  audience: string
): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const url = new URL(requestURL);
      url.searchParams.set("audience", audience);

      const response = await fetch(url, {
        headers: { Authorization: `bearer ${requestToken}` },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to request GitHub OIDC token: ${response.status} ${response.statusText}`
        );
      }

      const body = (await response.json()) as { value?: string };
      if (!body.value) {
        throw new Error("GitHub OIDC token response did not include a value.");
      }

      return body.value;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: githubActionsOIDCTokenProvider(requestURL, requestToken, audience),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from GitHub Actions workload identity federation.",
});

console.log(response.output_text);
```

```python
import json
import os
import urllib.parse
import urllib.request

from openai import OpenAI
from openai.auth import SubjectTokenProvider


def github_actions_oidc_token_provider(audience: str) -> SubjectTokenProvider:
    request_url = os.environ["ACTIONS_ID_TOKEN_REQUEST_URL"]
    request_token = os.environ["ACTIONS_ID_TOKEN_REQUEST_TOKEN"]

    def get_token() -> str:
        parsed_url = urllib.parse.urlparse(request_url)
        query = dict(urllib.parse.parse_qsl(parsed_url.query, keep_blank_values=True))
        query["audience"] = audience
        url = urllib.parse.urlunparse(
            parsed_url._replace(query=urllib.parse.urlencode(query))
        )

        request = urllib.request.Request(
            url,
            headers={"Authorization": f"bearer {request_token}"},
        )
        with urllib.request.urlopen(request) as response:
            payload = json.loads(response.read().decode("utf-8"))

        token = payload.get("value")
        if not token:
            raise RuntimeError("GitHub OIDC token response did not include a value.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": github_actions_oidc_token_provider(
            os.environ["OPENAI_WIF_AUDIENCE"]
        ),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from GitHub Actions workload identity federation.",
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

type githubActionsOIDCTokenProvider struct {
	requestURL   string
	requestToken string
	audience     string
}

func (p githubActionsOIDCTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p githubActionsOIDCTokenProvider) GetToken(ctx context.Context, httpClient auth.HTTPDoer) (string, error) {
	if httpClient == nil {
		httpClient = http.DefaultClient
	}

	oidcURL, err := url.Parse(p.requestURL)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "failed to parse GitHub OIDC request URL",
			Cause:    err,
		}
	}
	query := oidcURL.Query()
	query.Set("audience", p.audience)
	oidcURL.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, oidcURL.String(), nil)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "failed to create GitHub OIDC token request",
			Cause:    err,
		}
	}
	req.Header.Set("Authorization", "bearer "+p.requestToken)

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "failed to request GitHub OIDC token",
			Cause:    err,
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  fmt.Sprintf("GitHub OIDC token request failed with status %s", resp.Status),
		}
	}

	var body struct {
		Value string `json:"value"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "failed to decode GitHub OIDC token response",
			Cause:    err,
		}
	}
	if body.Value == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "GitHub OIDC token response did not include a value",
		}
	}

	return body.Value, nil
}

func main() {
	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: githubActionsOIDCTokenProvider{
				requestURL:   os.Getenv("ACTIONS_ID_TOKEN_REQUEST_URL"),
				requestToken: os.Getenv("ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
				audience:     os.Getenv("OPENAI_WIF_AUDIENCE"),
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from GitHub Actions workload identity federation."),
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
import com.openai.errors.SubjectTokenProviderException;
import com.openai.auth.SubjectTokenType;
import com.openai.auth.WorkloadIdentity;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.responses.ResponseCreateParams;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;

public final class GitHubActionsWorkloadIdentityExample {
    private GitHubActionsWorkloadIdentityExample() {}

    static final class GitHubActionsOidcTokenProvider implements SubjectTokenProvider {
        private final String requestUrl;
        private final String requestToken;
        private final String audience;

        GitHubActionsOidcTokenProvider(String requestUrl, String requestToken, String audience) {
            this.requestUrl = requestUrl;
            this.requestToken = requestToken;
            this.audience = audience;
        }

        @Override
        public SubjectTokenType tokenType() {
            return SubjectTokenType.JWT;
        }

        @Override
        public String getToken(
                com.openai.core.http.HttpClient httpClient, JsonMapper jsonMapper) {
            try {
                String separator = requestUrl.contains("?") ? "&" : "?";
                URI uri = URI.create(
                        requestUrl
                                + separator
                                + "audience="
                                + URLEncoder.encode(audience, StandardCharsets.UTF_8));

                HttpRequest request = HttpRequest.newBuilder(uri)
                        .header("Authorization", "bearer " + requestToken)
                        .GET()
                        .build();

                HttpResponse<String> response = java.net.http.HttpClient.newHttpClient()
                        .send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    throw new SubjectTokenProviderException(
                            "github-actions",
                            "GitHub OIDC token request failed with status "
                                    + response.statusCode(),
                            null);
                }

                JsonNode payload = jsonMapper.readTree(response.body());
                String token = payload.path("value").asText("");
                if (token.isEmpty()) {
                    throw new SubjectTokenProviderException(
                            "github-actions",
                            "GitHub OIDC token response did not include a value",
                            null);
                }

                return token;
            } catch (SubjectTokenProviderException e) {
                throw e;
            } catch (Exception e) {
                throw new SubjectTokenProviderException(
                        "github-actions",
                        "failed to request GitHub OIDC token",
                        e);
            }
        }

        @Override
        public CompletableFuture<String> getTokenAsync(
                com.openai.core.http.HttpClient httpClient, JsonMapper jsonMapper) {
            return CompletableFuture.supplyAsync(() -> getToken(httpClient, jsonMapper));
        }
    }

    public static void main(String[] args) {
        WorkloadIdentity workloadIdentity = WorkloadIdentity.builder()
                .identityProviderId(System.getenv("OPENAI_IDENTITY_PROVIDER_ID"))
                .serviceAccountId(System.getenv("OPENAI_SERVICE_ACCOUNT_ID"))
                .provider(new GitHubActionsOidcTokenProvider(
                        System.getenv("ACTIONS_ID_TOKEN_REQUEST_URL"),
                        System.getenv("ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
                        System.getenv("OPENAI_WIF_AUDIENCE")))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from GitHub Actions workload identity federation.")
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

class GitHubActionsOIDCTokenProvider
  include OpenAI::Auth::SubjectTokenProvider

  def initialize(request_url:, request_token:, audience:)
    @request_url = request_url
    @request_token = request_token
    @audience = audience
  end

  def token_type
    OpenAI::Auth::TokenType::JWT
  end

  def get_token
    uri = URI(@request_url)
    params = URI.decode_www_form(uri.query || "")
    params.reject! { |key, _| key == "audience" }
    params << ["audience", @audience]
    uri.query = URI.encode_www_form(params)

    request = Net::HTTP::Get.new(uri)
    request["Authorization"] = "bearer #{@request_token}"

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https") do |http|
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "GitHub OIDC token request failed with status #{response.code}",
        provider: "github-actions"
      )
    end

    token = JSON.parse(response.body).fetch("value", "").to_s
    if token.empty?
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "GitHub OIDC token response did not include a value",
        provider: "github-actions"
      )
    end

    token
  rescue JSON::ParserError, SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to request GitHub OIDC token: #{e.message}",
      provider: "github-actions",
      cause: e
    )
  end
end

provider = GitHubActionsOIDCTokenProvider.new(
  request_url: ENV.fetch("ACTIONS_ID_TOKEN_REQUEST_URL"),
  request_token: ENV.fetch("ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
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
  input: "Say hello from GitHub Actions workload identity federation."
)

puts(response.output_text)
```


## GitHub Actions best practices

- 对 production deployments 使用 environment protections。在 workflows 能够访问 production OpenAI resources 之前，要求 approvals 或 branch restrictions。
- 按 repository 限制 mappings。尽可能匹配 repository-specific claims，而不是允许 organization 内所有 repositories 访问。
- 按 branch 或 workflow 限制 mappings。考虑匹配 `repository`、`ref`、`environment` 或 `workflow_ref` 等 claims，以限制令牌签发。
- 为 CI/CD 和 production 工作负载使用独立的 OpenAI service accounts。Build pipelines 通常需要不同于 deployed applications 的权限。
- 避免向来自不受信任 forks 的 pull requests 授予访问权限。Forked pull requests 可能执行攻击者控制的代码，不应接收 production credentials。
- 使用短期有效的 exchanges。GitHub OIDC tokens 用于临时身份验证，应仅在需要时交换。
- 审计 repository ownership changes。Repository transfers、renames 和 permission changes 可能影响现有 mappings 背后的安全假设。
- 优先精确匹配 claim。匹配 `repository`、`ref` 和 `environment` 等 claims，而不是依赖 organization-wide trust relationships。

:::

## English source

::: details 展开英文原文
::: v-pre
Use GitHub Actions as a Workload Identity Provider by exchanging a GitHub-issued OIDC token for a short-lived OpenAI access token. This lets workflows authenticate to the OpenAI API without storing a long-lived API key in GitHub secrets.

GitHub can mint a signed OIDC JWT for a workflow job that has `id-token: write` permission and requests an identity token. OpenAI validates the token issuer, audience, signature, and mapping attributes before issuing an OpenAI access token.

## Setting up GitHub Actions

Grant the workflow or job permission to request a GitHub OIDC token:

```yaml
permissions:
  id-token: write
  contents: read
```

The `id-token: write` permission lets the job request an OIDC JWT. It does not grant write access to repository contents. The `contents: read` permission is needed by `actions/checkout`.

Request the token with the exact audience configured in your OpenAI Workload Identity Provider. Custom JavaScript actions can call `core.getIDToken("your-wif-audience")`; shell steps can call GitHub's OIDC request URL directly. Audience values containing reserved URL characters, such as `https://api.openai.com/v1`, should be URL encoded before being appended to the request URL:

```bash
AUDIENCE="https://api.openai.com/v1"
ENCODED_AUDIENCE=$(jq -rn --arg audience "$AUDIENCE" '$audience | @uri')

TOKEN=$(curl -sSf -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
  "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=${ENCODED_AUDIENCE}" | jq -r .value)
```

Important GitHub OIDC claims include:

- `iss`: The token issuer. For GitHub Actions, this is `https://token.actions.githubusercontent.com`.
- `aud`: The audience value requested by the workflow. Configure OpenAI to require the exact value you request, such as `your-wif-audience` or `https://api.openai.com/v1`.
- `sub`: The main subject string. GitHub builds it from workflow metadata such as repository, branch, tag, pull request, or environment.
- `repository`: The repository running the workflow, such as `my-org/my-repo`.
- `repository_owner`: The organization or user that owns the repository, such as `my-org`.
- `ref`: The Git ref that triggered the workflow, such as `refs/heads/main` or `refs/tags/v1.0.0`.
- `workflow`: The workflow claim. Use the actual claim value emitted by GitHub, such as `deploy` if that is the workflow claim in your job.
- `workflow_ref`: The workflow file path and ref, such as `my-org/my-repo/.github/workflows/deploy.yml@refs/heads/main`.
- `environment`: The GitHub environment name, such as `production`, when the job uses an environment.
- `run_id`, `run_number`, `run_attempt`, and `job_workflow_ref`: Run and job identifiers that can help with auditing or more advanced trust rules.

For the full claim list and subject formats, see GitHub's [OpenID Connect reference](https://docs.github.com/en/actions/reference/security/oidc).

## Verify the token

Before configuring workload identity federation, decode a sample GitHub OIDC token in the workflow runner and inspect its claims. After requesting the token in a workflow step:

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

This command decodes the JWT payload without verifying the token signature. Use a local decoder for production tokens, and avoid pasting production tokens into third-party tools. Never log the raw GitHub OIDC token or the exchanged OpenAI access token.

A decoded GitHub Actions OIDC token will look similar to:

```json
{
  "iss": "https://token.actions.githubusercontent.com",
  "aud": "https://api.openai.com/v1",
  "sub": "repo:my-org/my-repo:environment:production",
  "repository": "my-org/my-repo",
  "repository_owner": "my-org",
  "ref": "refs/heads/main",
  "workflow": "deploy",
  "workflow_ref": "my-org/my-repo/.github/workflows/deploy.yml@refs/heads/main",
  "environment": "production",
  "run_id": "1234567890",
  "run_attempt": "1"
}
```

Use the decoded payload to compare the token you received with the issuer, audience, and mapping values configured in OpenAI. Most configuration issues are visible in the `iss`, `aud`, `repository`, `ref`, and `workflow_ref` claims before you exchange the token.

## Setting up workload identity federation

Create a Workload Identity Provider in OpenAI for GitHub Actions, then add a service account mapping that matches the GitHub workflow claims you trust.

Configure the Workload Identity Provider first, then create the service account mapping.

### Set up the Workload Identity Provider

1. **Create the Workload Identity Provider.** Set **Name** to a unique value, such as `github-actions-prod`. Use **Description**, such as `Production GitHub Actions workflows`, to help admins identify the provider.

2. **Set the issuer and audience.** Set **OIDC Issuer URL** to `https://token.actions.githubusercontent.com`. Set **Audience** to the exact audience your workflow requests, such as `your-wif-audience` or `https://api.openai.com/v1`.

3. **Use GitHub OIDC discovery.** Leave **Use uploaded JWKS for token verification** disabled. OpenAI uses GitHub's OIDC discovery metadata and JWKS to verify the GitHub-signed token.

4. **Add attribute transformations only if you need derived mapping attributes.** Raw GitHub claims such as `repository`, `ref`, and `workflow` can be used directly in mapping assertions. If you create derived attributes, the dashboard applies the `openai.` prefix automatically; for example, enter `github_repository` with expression `assertion.repository` to create `openai.github_repository`. Raw token claims that already start with `openai.` are ignored for `openai.` mapping keys unless a matching transformation is configured.

### Set up the service account mapping

1. **Create a service account mapping.** Set **Name** to a unique value within the Workload Identity Provider, such as `github-actions-main-deploy`. Use **Description**, such as `Production deploy workflow on main`, to explain which workflow can use the mapping.

2. **Add exact claim assertions.** Add one **Key** and **Value** row for each GitHub claim that must match. OpenAI requires every configured row to match before it issues an access token. For a production deploy workflow, use assertions like:

```text
   iss == "https://token.actions.githubusercontent.com"
   aud == "https://api.openai.com/v1"
   repository == "my-org/my-repo"
   ref == "refs/heads/main"
   workflow_ref == "my-org/my-repo/.github/workflows/deploy.yml@refs/heads/main"
```

   Prefer `workflow_ref` over `workflow` for privileged mappings because admins usually intend to trust a specific workflow file path and ref. Workflow names can be renamed, and multiple workflow files can share the same name.

   In the mapping UI, enter these as key/value rows, such as **Key** `repository` with **Value** `my-org/my-repo`, **Key** `ref` with **Value** `refs/heads/main`, and **Key** `workflow_ref` with **Value** `my-org/my-repo/.github/workflows/deploy.yml@refs/heads/main`. If the job uses a GitHub environment, also add **Key** `environment` with **Value** `production`.

   &gt; **Caution:** Avoid overly broad mappings, such as trusting only `repository_owner == "my-org"`, unless every repository in that owner namespace should be able to mint OpenAI access tokens.

3. **Choose the OpenAI target.** Set **Project** to the OpenAI project that owns the target service account. Set **Service account** to the OpenAI service account the GitHub workflow can use, such as `github-actions-prod-deploy`.

4. **Narrow API permissions if needed.** Select appropriate **Permissions** such as `api.model.request` and `api.vector_store.read` to further narrow access tokens minted from this mapping. Leave permissions blank to avoid adding a WIF-specific scope restriction; the token still authorizes as the mapped service account.

## Using the token in a workflow

Configure your OpenAI SDK client to request a GitHub OIDC token and exchange it for an OpenAI-issued access token.

The workflow must grant `id-token: write` permission and pass the workload identity federation settings to the SDK code. The SDK requests the GitHub OIDC token from the `ACTIONS_ID_TOKEN_REQUEST_URL` and `ACTIONS_ID_TOKEN_REQUEST_TOKEN` environment variables that GitHub exposes to the job, then uses the exchanged OpenAI access token to authenticate API requests.

For example, run your application code from a workflow like this:

```yaml
name: deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Run OpenAI SDK code
        env:
          OPENAI_WIF_AUDIENCE: ${{ vars.OPENAI_WIF_AUDIENCE }}
          OPENAI_IDENTITY_PROVIDER_ID: ${{ vars.OPENAI_IDENTITY_PROVIDER_ID }}
          OPENAI_SERVICE_ACCOUNT_ID: ${{ vars.OPENAI_SERVICE_ACCOUNT_ID }}
        run: node ./scripts/call-openai.js
```

Store `OPENAI_WIF_AUDIENCE`, `OPENAI_IDENTITY_PROVIDER_ID`, and `OPENAI_SERVICE_ACCOUNT_ID` as GitHub Actions variables. They identify the provider and service account but are not bearer credentials.

The following examples initialize an OpenAI client with a custom subject token provider. The provider requests a GitHub OIDC token for the configured audience and uses it as the subject token for workload identity federation.

Authenticate from a GitHub Actions OIDC token

```typescript
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;
const audience = process.env.OPENAI_WIF_AUDIENCE;
const requestURL = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;

if (
  !identityProviderId ||
  !serviceAccountId ||
  !audience ||
  !requestURL ||
  !requestToken
) {
  throw new Error(
    "Set OPENAI_IDENTITY_PROVIDER_ID, OPENAI_SERVICE_ACCOUNT_ID, OPENAI_WIF_AUDIENCE, and run inside GitHub Actions with id-token: write"
  );
}

function githubActionsOIDCTokenProvider(
  requestURL: string,
  requestToken: string,
  audience: string
): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const url = new URL(requestURL);
      url.searchParams.set("audience", audience);

      const response = await fetch(url, {
        headers: { Authorization: `bearer ${requestToken}` },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to request GitHub OIDC token: ${response.status} ${response.statusText}`
        );
      }

      const body = (await response.json()) as { value?: string };
      if (!body.value) {
        throw new Error("GitHub OIDC token response did not include a value.");
      }

      return body.value;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: githubActionsOIDCTokenProvider(requestURL, requestToken, audience),
  },
});

const response = await client.responses.create({
  model: "gpt-5.4-mini",
  input: "Say hello from GitHub Actions workload identity federation.",
});

console.log(response.output_text);
```

```python
import json
import os
import urllib.parse
import urllib.request

from openai import OpenAI
from openai.auth import SubjectTokenProvider


def github_actions_oidc_token_provider(audience: str) -> SubjectTokenProvider:
    request_url = os.environ["ACTIONS_ID_TOKEN_REQUEST_URL"]
    request_token = os.environ["ACTIONS_ID_TOKEN_REQUEST_TOKEN"]

    def get_token() -> str:
        parsed_url = urllib.parse.urlparse(request_url)
        query = dict(urllib.parse.parse_qsl(parsed_url.query, keep_blank_values=True))
        query["audience"] = audience
        url = urllib.parse.urlunparse(
            parsed_url._replace(query=urllib.parse.urlencode(query))
        )

        request = urllib.request.Request(
            url,
            headers={"Authorization": f"bearer {request_token}"},
        )
        with urllib.request.urlopen(request) as response:
            payload = json.loads(response.read().decode("utf-8"))

        token = payload.get("value")
        if not token:
            raise RuntimeError("GitHub OIDC token response did not include a value.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": github_actions_oidc_token_provider(
            os.environ["OPENAI_WIF_AUDIENCE"]
        ),
    },
)

response = client.responses.create(
    model="gpt-5.4-mini",
    input="Say hello from GitHub Actions workload identity federation.",
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

type githubActionsOIDCTokenProvider struct {
	requestURL   string
	requestToken string
	audience     string
}

func (p githubActionsOIDCTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p githubActionsOIDCTokenProvider) GetToken(ctx context.Context, httpClient auth.HTTPDoer) (string, error) {
	if httpClient == nil {
		httpClient = http.DefaultClient
	}

	oidcURL, err := url.Parse(p.requestURL)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "failed to parse GitHub OIDC request URL",
			Cause:    err,
		}
	}
	query := oidcURL.Query()
	query.Set("audience", p.audience)
	oidcURL.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, oidcURL.String(), nil)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "failed to create GitHub OIDC token request",
			Cause:    err,
		}
	}
	req.Header.Set("Authorization", "bearer "+p.requestToken)

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "failed to request GitHub OIDC token",
			Cause:    err,
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  fmt.Sprintf("GitHub OIDC token request failed with status %s", resp.Status),
		}
	}

	var body struct {
		Value string `json:"value"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "failed to decode GitHub OIDC token response",
			Cause:    err,
		}
	}
	if body.Value == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "GitHub OIDC token response did not include a value",
		}
	}

	return body.Value, nil
}

func main() {
	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: githubActionsOIDCTokenProvider{
				requestURL:   os.Getenv("ACTIONS_ID_TOKEN_REQUEST_URL"),
				requestToken: os.Getenv("ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
				audience:     os.Getenv("OPENAI_WIF_AUDIENCE"),
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from GitHub Actions workload identity federation."),
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
import com.openai.errors.SubjectTokenProviderException;
import com.openai.auth.SubjectTokenType;
import com.openai.auth.WorkloadIdentity;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.responses.ResponseCreateParams;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;

public final class GitHubActionsWorkloadIdentityExample {
    private GitHubActionsWorkloadIdentityExample() {}

    static final class GitHubActionsOidcTokenProvider implements SubjectTokenProvider {
        private final String requestUrl;
        private final String requestToken;
        private final String audience;

        GitHubActionsOidcTokenProvider(String requestUrl, String requestToken, String audience) {
            this.requestUrl = requestUrl;
            this.requestToken = requestToken;
            this.audience = audience;
        }

        @Override
        public SubjectTokenType tokenType() {
            return SubjectTokenType.JWT;
        }

        @Override
        public String getToken(
                com.openai.core.http.HttpClient httpClient, JsonMapper jsonMapper) {
            try {
                String separator = requestUrl.contains("?") ? "&" : "?";
                URI uri = URI.create(
                        requestUrl
                                + separator
                                + "audience="
                                + URLEncoder.encode(audience, StandardCharsets.UTF_8));

                HttpRequest request = HttpRequest.newBuilder(uri)
                        .header("Authorization", "bearer " + requestToken)
                        .GET()
                        .build();

                HttpResponse<String> response = java.net.http.HttpClient.newHttpClient()
                        .send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    throw new SubjectTokenProviderException(
                            "github-actions",
                            "GitHub OIDC token request failed with status "
                                    + response.statusCode(),
                            null);
                }

                JsonNode payload = jsonMapper.readTree(response.body());
                String token = payload.path("value").asText("");
                if (token.isEmpty()) {
                    throw new SubjectTokenProviderException(
                            "github-actions",
                            "GitHub OIDC token response did not include a value",
                            null);
                }

                return token;
            } catch (SubjectTokenProviderException e) {
                throw e;
            } catch (Exception e) {
                throw new SubjectTokenProviderException(
                        "github-actions",
                        "failed to request GitHub OIDC token",
                        e);
            }
        }

        @Override
        public CompletableFuture<String> getTokenAsync(
                com.openai.core.http.HttpClient httpClient, JsonMapper jsonMapper) {
            return CompletableFuture.supplyAsync(() -> getToken(httpClient, jsonMapper));
        }
    }

    public static void main(String[] args) {
        WorkloadIdentity workloadIdentity = WorkloadIdentity.builder()
                .identityProviderId(System.getenv("OPENAI_IDENTITY_PROVIDER_ID"))
                .serviceAccountId(System.getenv("OPENAI_SERVICE_ACCOUNT_ID"))
                .provider(new GitHubActionsOidcTokenProvider(
                        System.getenv("ACTIONS_ID_TOKEN_REQUEST_URL"),
                        System.getenv("ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
                        System.getenv("OPENAI_WIF_AUDIENCE")))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from GitHub Actions workload identity federation.")
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

class GitHubActionsOIDCTokenProvider
  include OpenAI::Auth::SubjectTokenProvider

  def initialize(request_url:, request_token:, audience:)
    @request_url = request_url
    @request_token = request_token
    @audience = audience
  end

  def token_type
    OpenAI::Auth::TokenType::JWT
  end

  def get_token
    uri = URI(@request_url)
    params = URI.decode_www_form(uri.query || "")
    params.reject! { |key, _| key == "audience" }
    params << ["audience", @audience]
    uri.query = URI.encode_www_form(params)

    request = Net::HTTP::Get.new(uri)
    request["Authorization"] = "bearer #{@request_token}"

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https") do |http|
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "GitHub OIDC token request failed with status #{response.code}",
        provider: "github-actions"
      )
    end

    token = JSON.parse(response.body).fetch("value", "").to_s
    if token.empty?
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "GitHub OIDC token response did not include a value",
        provider: "github-actions"
      )
    end

    token
  rescue JSON::ParserError, SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to request GitHub OIDC token: #{e.message}",
      provider: "github-actions",
      cause: e
    )
  end
end

provider = GitHubActionsOIDCTokenProvider.new(
  request_url: ENV.fetch("ACTIONS_ID_TOKEN_REQUEST_URL"),
  request_token: ENV.fetch("ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
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
  input: "Say hello from GitHub Actions workload identity federation."
)

puts(response.output_text)
```


## GitHub Actions best practices

- Use environment protections for production deployments. Require approvals or branch restrictions before workflows can access production OpenAI resources.
- Restrict mappings by repository. Match on repository-specific claims whenever possible instead of allowing access from all repositories within an organization.
- Restrict mappings by branch or workflow. Consider matching claims such as `repository`, `ref`, `environment`, or `workflow_ref` to limit token issuance.
- Use separate OpenAI service accounts for CI/CD and production workloads. Build pipelines often require different permissions than deployed applications.
- Avoid granting access to pull requests from untrusted forks. Forked pull requests may execute attacker-controlled code and should not receive production credentials.
- Use short-lived exchanges. GitHub OIDC tokens are intended for ephemeral authentication and should be exchanged only when needed.
- Audit repository ownership changes. Repository transfers, renames, and permission changes can affect the security assumptions behind existing mappings.
- Prefer exact claim matching. Match on claims such as `repository`, `ref`, and `environment` instead of relying on organization-wide trust relationships.

:::
:::

