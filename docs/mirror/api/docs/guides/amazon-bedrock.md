---
title: "Amazon Bedrock 中的 OpenAI 模型"
description: "Learn how Amazon Bedrock availability differs from the OpenAI API, including supported capabilities, AWS-managed controls, and pricing considerations."
outline: deep
---

# Amazon Bedrock 中的 OpenAI 模型

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/amazon-bedrock](https://developers.openai.com/api/docs/guides/amazon-bedrock)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/amazon-bedrock.md](https://developers.openai.com/api/docs/guides/amazon-bedrock.md)
- 抓取时间：2026-06-27T05:53:59.276Z
- Checksum：`e66af99df11f236f307bf9262836c625657bf9c400a0484e67f256aafaff0141`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Amazon Bedrock 通过 AWS 管理的基础设施提供受支持的 OpenAI 模型。当你的组织希望将采购、身份、区域控制以及相关云运营保留在 AWS 内时，这种部署路径很有用。

Amazon Bedrock 的可用性不同于 OpenAI API。在部署之前，请确认你的工作负载所支持的模型、AWS Region、功能集和定价路径。

## Bedrock 可用性的工作方式

Amazon Bedrock 中的 OpenAI 模型通过 AWS 管理的部署路径运行，并为受支持的模型和能力提供 Responses API 兼容性。你的应用仍会使用 OpenAI 模型行为，但周围的云控制平面由 AWS 拥有，包括 account access、regional availability 和 billing。

在你需要以下能力时使用 Bedrock：

- AWS-native procurement and billing。
- AWS-managed identity、access 和 account controls。
- 为有 cloud-location 要求的客户部署到受支持的 AWS Regions。

当你需要最广泛的功能覆盖、最新的第一方平台能力，或 Bedrock 中不可用的功能时，请直接使用 OpenAI API。

## 发起 Responses API 请求

要通过 Amazon Bedrock 发送 OpenAI SDK 请求，请使用支持 Bedrock 的 SDK client，并为你的部署选择 AWS Region 和 model ID：

- 实例化 `BedrockOpenAI`，而不是默认的 `OpenAI` client。该 client 会从 AWS Region 推导 regional Mantle base URL。
- 本指南的示例使用 `us-east-2`，它解析为 `https://bedrock-mantle.us-east-2.api.aws/openai/v1`。
- 使用带 `openai.` 前缀的 Bedrock model ID，例如 `openai.gpt-5.5`。

此示例在 `us-east-2` 中使用 `openai.gpt-5.5`。请为你的 Bedrock 部署使用受支持的 model 与 AWS Region 组合。

下面的示例使用存储为 `AWS_BEARER_TOKEN_BEDROCK` 的 Bedrock API key。有关生成和使用 Bedrock API key 的信息，请参阅 [Amazon Bedrock API keys](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html)。SDK 会从你的环境中读取 token。

通过 Amazon Bedrock 发送 Responses API 请求

```javascript
import { BedrockOpenAI } from "openai";

const client = new BedrockOpenAI({
  awsRegion: "us-east-2",
});

const response = await client.responses.create({
  model: "openai.gpt-5.5",
  input: "Write a haiku about cloud infrastructure.",
});

console.log(response.output_text);
```

```python
from openai import BedrockOpenAI

client = BedrockOpenAI(aws_region="us-east-2")

response = client.responses.create(
    model="openai.gpt-5.5",
    input="Write a haiku about cloud infrastructure.",
)

print(response.output_text)
```

```bash
curl "https://bedrock-mantle.us-east-2.api.aws/openai/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AWS_BEARER_TOKEN_BEDROCK" \
  -d '{
    "model": "openai.gpt-5.5",
    "input": "Write a haiku about cloud infrastructure."
  }'
```


对于长时间运行的应用，请传入 token provider，而不是静态 API key。SDK 会在每次请求前调用 provider。AWS token-generator packages 会在当前 key 有效时返回缓存的短期 key，并在需要时生成新 key。它们使用 AWS credential chain，其中可以包含通过 `aws login` 配置的 credentials。

为你的 SDK 安装 token-generator package：

```shell
npm install @aws/bedrock-token-generator
pip install aws-bedrock-token-generator
```

使用可刷新的 Bedrock credentials 发送请求

```javascript
import { getTokenProvider } from "@aws/bedrock-token-generator";
import { BedrockOpenAI } from "openai";

const client = new BedrockOpenAI({
  awsRegion: "us-east-2",
  bedrockTokenProvider: getTokenProvider(),
});

const response = await client.responses.create({
  model: "openai.gpt-5.5",
  input: "Write a haiku about cloud infrastructure.",
});

console.log(response.output_text);
```

```python
from aws_bedrock_token_generator import provide_token
from openai import BedrockOpenAI

client = BedrockOpenAI(
    aws_region="us-east-2",
    bedrock_token_provider=provide_token,
)

response = client.responses.create(
    model="openai.gpt-5.5",
    input="Write a haiku about cloud infrastructure.",
)

print(response.output_text)
```


## 可用性与运营

可用性取决于 AWS Region 和模型。初始发布范围比 OpenAI API 更有限，因此请在 rollout 前查看[按 AWS Region 划分的模型支持](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html)。

Amazon Bedrock 为受支持 AWS Regions 中的受支持 OpenAI 模型提供与 Responses API 兼容的 inference。AWS 负责管理 authentication、account access、procurement 和 billing。

AWS Regions 是物理部署位置，不同于 OpenAI data residency jurisdictions。有 residency 要求的团队应评估 Bedrock Region 本身以及相应的 AWS 条款。

## Responses API 功能可用性

Amazon Bedrock 支持 OpenAI API 中一部分 Responses API 能力。本表描述初始 Amazon Bedrock 产品预期的功能可用性，不包括临时可用性和服务状态。

以下信息代表截至 2026 年 6 月 8 日的功能可用性。Model 和 Region 可用性也可能变化。有关最新信息，请参阅 [AWS documentation for OpenAI models in Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-openai.html) 以及[按 AWS Region 划分的模型支持](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html)。

| 能力                | OpenAI API                | 初始可用时的 Amazon Bedrock |
| ------------------------- | ------------------------- | -------------------------------------- |
| Text generation           | 可用                 | 可用                              |
| Audio input               | 可用                 | 不可用                          |
| Image input               | 可用                 | 可用                              |
| File input                | 可用                 | 对受支持的文件类型可用     |
| Structured outputs        | 可用                 | 可用                              |
| Function calling          | 可用                 | 可用                              |
| Streaming responses       | 可用                 | 可用                              |
| WebSocket connections     | 可用                 | 不可用                          |
| Context window            | 取决于模型           | GPT-5.4 和 GPT-5.5 为 272,000 tokens |
| Reasoning effort          | 可用                 | 可用                              |
| Prompt caching            | 可用                 | 可用                              |
| Custom tools              | 可用                 | 可用                              |
| Client-side `tool_search` | 可用                 | 可用                              |
| Hosted web search         | 可用                 | 不可用                          |
| Hosted file search        | 可用                 | 不可用                          |
| Computer use              | 可用                 | 不可用                          |
| Shell tool                | 可用                 | 不可用                          |
| Image generation tool     | 可用                 | 不可用                          |
| Remote MCP servers        | 可用                 | 不可用                          |
| Service tiers             | 在受支持处可用 | 仅 on-demand inference               |

Client-side `tool_search` 不同于 hosted tools 和 remote MCP server 支持。Hosted tools 通过 OpenAI 运营的 service infrastructure 运行，在初始 Amazon Bedrock 产品中不可用。

GPT-5.4 和 GPT-5.5 在 Amazon Bedrock 上具有 272,000-token context window。Amazon Bedrock 会拒绝超过此限制的请求。请参阅 AWS model cards 了解当前特定模型限制。

请将 feature parity 视为取决于具体工作负载。如果你的应用依赖特定 tool、response mode 或 service tier，请在承诺采用该部署路径之前，通过 Bedrock 测试该行为。

## 身份验证与运营

Amazon Bedrock 使用 AWS 管理的访问控制。你的 AWS administrator 控制哪些 accounts、roles 或 temporary credentials 可以访问受支持的模型部署。确切的 authentication flow 取决于你组织使用的 Bedrock 配置。

请规划 AWS 拥有的运营检查，例如：

- Account 和 model access configuration。
- Region-specific deployment approval。
- Temporary credential 或 token validity。
- AWS quota、logging 和 support workflows。

## 定价

AWS 对 Amazon Bedrock 使用量计费。Bedrock-specific pricing 可能不同于直接 OpenAI API pricing，包括 regional processing premiums 或其他 AWS-specific commercial terms。

有关直接 OpenAI API 定价，请参阅 [API pricing](/mirror/api/docs/pricing)。对于 Bedrock pricing，请使用你计划采用的 Bedrock 部署所发布的 AWS pricing materials。

## 下一步

- 在 Amazon Bedrock 中确认你受支持的模型和 AWS Region。
- 验证你的工作负载所需的确切 API 功能。
- 发布前比较 Bedrock pricing 和直接 API pricing。
- 如需 Codex-specific setup，请参阅 [Use Codex with Amazon Bedrock](/mirror/codex/amazon-bedrock)。

:::

## English source

::: details 展开英文原文
::: v-pre
Amazon Bedrock makes supported OpenAI models available through AWS-managed
infrastructure. This deployment path is useful when your organization wants to
keep procurement, identity, regional controls, and related cloud operations in
AWS.

Amazon Bedrock availability differs from the OpenAI API. Confirm the supported
  model, AWS Region, feature set, and pricing path for your workload before you
  deploy.

## How Bedrock availability works

OpenAI models in Amazon Bedrock run through an AWS-managed deployment path with
Responses API compatibility for supported models and capabilities.
Your application still uses OpenAI model behavior, but AWS owns the surrounding
cloud control plane, including account access, regional availability, and
billing.

Use Bedrock when you need:

- AWS-native procurement and billing.
- AWS-managed identity, access, and account controls.
- Deployment in supported AWS Regions for customers with cloud-location
  requirements.

Use the OpenAI API directly when you need the broadest feature coverage, the
latest first-party platform capabilities, or functionality unavailable in
Bedrock.

## Make Responses API requests

To send OpenAI SDK requests through Amazon Bedrock, use the Bedrock-aware SDK
client and select the AWS Region and model ID for your deployment:

- Instantiate `BedrockOpenAI` instead of the default `OpenAI` client. The client
  derives the regional Mantle base URL from the AWS Region.
- This guide's examples use `us-east-2`, which resolves to
  `https://bedrock-mantle.us-east-2.api.aws/openai/v1`.
- Use a Bedrock model ID with the `openai.` prefix, such as
  `openai.gpt-5.5`.

This example uses `openai.gpt-5.5` in `us-east-2`. Use a supported model and AWS
Region combination for your Bedrock deployment.

The following example uses a Bedrock API key stored as
`AWS_BEARER_TOKEN_BEDROCK`. See
[Amazon Bedrock API keys](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html)
for information about generating and using a Bedrock API key. The SDK reads the
token from your environment.

Send a Responses API request through Amazon Bedrock

```javascript
import { BedrockOpenAI } from "openai";

const client = new BedrockOpenAI({
  awsRegion: "us-east-2",
});

const response = await client.responses.create({
  model: "openai.gpt-5.5",
  input: "Write a haiku about cloud infrastructure.",
});

console.log(response.output_text);
```

```python
from openai import BedrockOpenAI

client = BedrockOpenAI(aws_region="us-east-2")

response = client.responses.create(
    model="openai.gpt-5.5",
    input="Write a haiku about cloud infrastructure.",
)

print(response.output_text)
```

```bash
curl "https://bedrock-mantle.us-east-2.api.aws/openai/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AWS_BEARER_TOKEN_BEDROCK" \
  -d '{
    "model": "openai.gpt-5.5",
    "input": "Write a haiku about cloud infrastructure."
  }'
```


For long-running applications, pass a token provider instead of a static API
key. The SDK calls the provider before each request. The AWS token-generator
packages return a cached short-term key when the current key is valid and
generate a new key when needed. They use the AWS credential chain, which can
include credentials configured with `aws login`.

Install the token-generator package for your SDK:

```shell
npm install @aws/bedrock-token-generator
pip install aws-bedrock-token-generator
```

Send a request with refreshable Bedrock credentials

```javascript
import { getTokenProvider } from "@aws/bedrock-token-generator";
import { BedrockOpenAI } from "openai";

const client = new BedrockOpenAI({
  awsRegion: "us-east-2",
  bedrockTokenProvider: getTokenProvider(),
});

const response = await client.responses.create({
  model: "openai.gpt-5.5",
  input: "Write a haiku about cloud infrastructure.",
});

console.log(response.output_text);
```

```python
from aws_bedrock_token_generator import provide_token
from openai import BedrockOpenAI

client = BedrockOpenAI(
    aws_region="us-east-2",
    bedrock_token_provider=provide_token,
)

response = client.responses.create(
    model="openai.gpt-5.5",
    input="Write a haiku about cloud infrastructure.",
)

print(response.output_text)
```


## Availability and operations

Availability depends on AWS Region and model. The initial launch scope is more
limited than the OpenAI API, so check [model support by AWS Region](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html)
before rollout.

Amazon Bedrock provides Responses API-compatible inference for supported OpenAI
models in supported AWS Regions. AWS manages authentication, account access,
procurement, and billing.

AWS Regions are physical deployment locations, which differ from OpenAI data
residency jurisdictions. Teams with residency requirements should evaluate the
Bedrock Region itself and the corresponding AWS terms.

## Responses API feature availability

Amazon Bedrock supports a subset of Responses API capabilities available
through the OpenAI API. This table describes intended feature availability for
the initial Amazon Bedrock offering. It excludes transient availability and
service status.

The information below represents feature availability as of June 8, 2026.
  Model and Region availability can also change. For the latest information, see
  the [AWS documentation for OpenAI models in Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-openai.html)
  and [model support by AWS Region](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html).

| Capability                | OpenAI API                | Amazon Bedrock at initial availability |
| ------------------------- | ------------------------- | -------------------------------------- |
| Text generation           | Available                 | Available                              |
| Audio input               | Available                 | Not available                          |
| Image input               | Available                 | Available                              |
| File input                | Available                 | Available for supported file types     |
| Structured outputs        | Available                 | Available                              |
| Function calling          | Available                 | Available                              |
| Streaming responses       | Available                 | Available                              |
| WebSocket connections     | Available                 | Not available                          |
| Context window            | Model-dependent           | 272,000 tokens for GPT-5.4 and GPT-5.5 |
| Reasoning effort          | Available                 | Available                              |
| Prompt caching            | Available                 | Available                              |
| Custom tools              | Available                 | Available                              |
| Client-side `tool_search` | Available                 | Available                              |
| Hosted web search         | Available                 | Not available                          |
| Hosted file search        | Available                 | Not available                          |
| Computer use              | Available                 | Not available                          |
| Shell tool                | Available                 | Not available                          |
| Image generation tool     | Available                 | Not available                          |
| Remote MCP servers        | Available                 | Not available                          |
| Service tiers             | Available where supported | On-demand inference only               |

Client-side `tool_search` is distinct from hosted tools and remote MCP server
support. Hosted tools run through OpenAI-operated service infrastructure and
are unavailable in the initial Amazon Bedrock offering.

GPT-5.4 and GPT-5.5 have a 272,000-token context window on Amazon Bedrock.
Amazon Bedrock rejects requests that exceed this limit. See the AWS model cards
for current model-specific limits.

Treat feature parity as workload-specific. If your application depends on a
specific tool, response mode, or service tier, test that behavior through
Bedrock before you commit to the deployment path.

## Authentication and operations

Amazon Bedrock uses AWS-managed access controls. Your AWS administrator controls
which accounts, roles, or temporary credentials can reach the supported model
deployment. The exact authentication flow depends on the Bedrock configuration
your organization uses.

Plan for AWS-owned operational checks such as:

- Account and model access configuration.
- Region-specific deployment approval.
- Temporary credential or token validity.
- AWS quota, logging, and support workflows.

## Pricing

AWS bills Amazon Bedrock usage. Bedrock-specific pricing can differ from direct
OpenAI API pricing, including regional processing premiums or other AWS-specific
commercial terms.

See [API pricing](/mirror/api/docs/pricing) for direct OpenAI API pricing. For Bedrock
pricing, use the AWS pricing materials published for the Bedrock deployment you
plan to use.

## Next steps

- Confirm your supported model and AWS Region in Amazon Bedrock.
- Verify the exact API features your workload needs.
- Compare Bedrock pricing and direct API pricing before launch.
- For Codex-specific setup, see
  [Use Codex with Amazon Bedrock](/mirror/codex/amazon-bedrock).

:::
:::

