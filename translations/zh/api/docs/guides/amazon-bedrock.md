---
status: needs-review
sourceId: "e66af99df11f"
sourceChecksum: "e66af99df11f236f307bf9262836c625657bf9c400a0484e67f256aafaff0141"
sourceUrl: "https://developers.openai.com/api/docs/guides/amazon-bedrock"
translatedAt: "2026-06-27T18:00:38.1935616+08:00"
translator: codex-gpt-5.5-xhigh
---

# Amazon Bedrock 中的 OpenAI 模型

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

有关直接 OpenAI API 定价，请参阅 [API pricing](https://developers.openai.com/api/docs/pricing)。对于 Bedrock pricing，请使用你计划采用的 Bedrock 部署所发布的 AWS pricing materials。

## 下一步

- 在 Amazon Bedrock 中确认你受支持的模型和 AWS Region。
- 验证你的工作负载所需的确切 API 功能。
- 发布前比较 Bedrock pricing 和直接 API pricing。
- 如需 Codex-specific setup，请参阅 [Use Codex with Amazon Bedrock](https://developers.openai.com/codex/amazon-bedrock)。
