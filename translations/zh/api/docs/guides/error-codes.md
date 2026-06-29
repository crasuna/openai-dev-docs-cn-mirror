---
status: needs-review
sourceId: "612d0de804d3"
sourceChecksum: "612d0de804d30acb09f1bdc57bce81670af02be247ec33fa1d69c5a9ced5008a"
sourceUrl: "https://developers.openai.com/api/docs/guides/error-codes"
translatedAt: "2026-06-27T17:29:03.6672446+08:00"
translator: codex-gpt-5.5-xhigh
---

# 错误代码

本指南概述了你可能从 [API](https://developers.openai.com/api/docs/introduction) 和我们的[官方 Python 库](https://developers.openai.com/api/docs/libraries#python-library) 中看到的错误代码。概览中提到的每个错误代码都有专门小节，提供进一步指导。官方错误消息会保留英文原文，并在必要时补充中文释义。

## API 错误

| 代码                                                                              | 概览                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 401 - Invalid Authentication（认证无效）                                          | **原因：** 认证凭据无效。 <br /> **解决方案：** 确保正在使用正确的 [API key](https://platform.openai.com/settings/organization/api-keys) 和请求组织。                                                                                                                                    |
| 401 - Incorrect API key provided（提供的 API key 不正确）                         | **原因：** 请求所用的 API key 不正确。 <br /> **解决方案：** 确保使用的 API key 正确，清除浏览器缓存，或[生成一个新的 API key](https://platform.openai.com/settings/organization/api-keys)。                                                                                           |
| 401 - You must be a member of an organization to use the API（必须属于某个组织才能使用 API） | **原因：** 你的账户不属于任何组织。 <br /> **解决方案：** 联系我们以加入新的组织，或请你的组织管理员[邀请你加入组织](https://platform.openai.com/settings/organization/people)。                                                                                                           |
| 401 - IP not authorized（IP 未授权）                                              | **原因：** 你的请求 IP 与项目或组织配置的 IP 允许列表不匹配。 <br /> **解决方案：** 从正确的 IP 发送请求，或更新你的 [IP 允许列表设置](https://platform.openai.com/settings/organization/security/ip-allowlist)。                                                                         |
| 403 - Country, region, or territory not supported（不支持该国家、地区或领土）     | **原因：** 你正从不受支持的国家、地区或领土访问 API。 <br /> **解决方案：** 请查看[此页面](https://developers.openai.com/api/docs/supported-countries)了解更多信息。                                                                                                                    |
| 429 - Rate limit reached for requests（请求达到速率限制）                         | **原因：** 你发送请求过快。 <br /> **解决方案：** 控制请求节奏。阅读[速率限制指南](https://developers.openai.com/api/docs/guides/rate-limits)。                                                                                                                                          |
| 429 - You exceeded your current quota, please check your plan and billing details（已超出当前配额，请检查方案和账单详情） | **原因：** 你的额度已用完，或达到了月度最高支出。 <br /> **解决方案：** [购买更多额度](https://platform.openai.com/settings/organization/billing)，或了解如何[提高你的限制](https://platform.openai.com/settings/organization/limits)。                                                   |
| 500 - The server had an error while processing your request（服务器处理请求时出错） | **原因：** 我们的服务器出现问题。 <br /> **解决方案：** 短暂等待后重试请求；如果问题持续存在，请联系我们。查看[状态页](https://status.openai.com/)。                                                                                                                                      |
| 503 - The engine is currently overloaded, please try again later（引擎当前过载，请稍后重试） | **原因：** 我们的服务器正在经历高流量。 <br /> **解决方案：** 请在短暂等待后重试你的请求。                                                                                                                                                                                             |
| 503 - Slow Down（请减速）                                                        | **原因：** 你的请求速率突然增加，正在影响服务可靠性。 <br /> **解决方案：** 请将请求速率降回原始水平，至少保持 15 分钟的稳定速率，然后再逐步提高。                                                                                                                                       |

## WebSocket 模式错误

如果你正在使用 [Responses API WebSocket 模式](https://developers.openai.com/api/docs/guides/websocket-mode)，可能会看到以下额外错误：

- `previous_response_not_found`：无法从可用状态解析 `previous_response_id`。请使用完整输入上下文重试，并将 `previous_response_id` 设置为 `null`。
- `websocket_connection_limit_reached`：连接达到了 60 分钟限制。打开新的 WebSocket 连接并继续。

401 - Invalid Authentication（认证无效）

此错误消息表示你的认证凭据无效。出现这种情况可能有多种原因，例如：

- 你正在使用已被撤销的 API key。
- 你使用的 API key 与请求组织或项目分配的 API key 不同。
- 你使用的 API key 没有所调用端点所需的权限。

要解决此错误，请按以下步骤操作：

- 检查你是否在请求标头中使用了正确的 API key 和组织 ID。你可以在[账户设置](https://platform.openai.com/settings/organization/api-keys)中找到 API key 和组织 ID，也可以通过选择所需项目，在[通用设置](https://platform.openai.com/settings/organization/general)下找到特定项目相关的 key。
- 如果你不确定 API key 是否有效，可以[生成一个新的 API key](https://platform.openai.com/settings/organization/api-keys)。请务必在请求中用新 key 替换旧 API key，并遵循我们的 [best practices guide](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)。

401 - Incorrect API key provided（提供的 API key 不正确）

此错误消息表示你在请求中使用的 API key 不正确。出现这种情况可能有多种原因，例如：

- 你的 API key 中存在拼写错误或多余空格。
- 你使用的是属于不同组织或项目的 API key。
- 你使用的 API key 已被删除或停用。
- 本地可能缓存了旧的、已撤销的 API key。

要解决此错误，请按以下步骤操作：

- 尝试清除浏览器缓存和 cookies，然后重试。
- 检查你是否在请求标头中使用了正确的 API key。
- 如果你不确定 API key 是否正确，可以[生成一个新的 API key](https://platform.openai.com/settings/organization/api-keys)。请务必在代码库中替换旧 API key，并遵循我们的 [best practices guide](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)。

401 - You must be a member of an organization to use the API（必须属于某个组织才能使用 API）

此错误消息表示你的账户不属于任何组织。出现这种情况可能有多种原因，例如：

- 你已离开或被移出先前的组织。
- 你已离开或被移出先前的项目。
- 你的组织已被删除。

要解决此错误，请按以下步骤操作：

- 如果你已离开或被移出先前的组织，可以请求新的组织，或被邀请加入现有组织。
- 要请求新的组织，请通过 help.openai.com 联系我们。
- 现有组织所有者可以通过[团队页面](https://platform.openai.com/settings/organization/people)邀请你加入他们的组织，或从[设置页面](https://developers.openai.com/api/docs/guides/settings/organization/general)创建新的项目。
- 如果你已离开或被移出先前的项目，可以请组织或项目所有者将你添加回去，或创建一个新的项目。

429 - Rate limit reached for requests（请求达到速率限制）

此错误消息表示你已达到 API 分配给你的 rate limit。这意味着你在短时间内提交了过多 token 或请求，并且已超过允许的请求数量。出现这种情况可能有多种原因，例如：

- 你正在使用会频繁或并发发起请求的循环或脚本。
- 你正在与其他用户或应用共享 API key。
- 你正在使用速率限制较低的免费方案。
- 你已达到项目上定义的限制。

要解决此错误，请按以下步骤操作：

- 控制请求节奏，避免发出不必要或重复的调用。
- 如果你正在使用循环或脚本，请务必实现遵守速率限制和响应标头的退避机制或重试逻辑。你可以在我们的[速率限制指南](https://developers.openai.com/api/docs/guides/rate-limits)中阅读更多关于速率限制政策和最佳实践的信息。
- 如果你正在与其他用户共享组织，请注意限制是按组织而不是按用户应用的。值得检查团队其他成员的使用情况，因为这也会计入限制。
- 如果你正在使用免费或低层级方案，请考虑升级到提供更高速率限制的按量付费方案。你可以在我们的[速率限制指南](https://developers.openai.com/api/docs/guides/rate-limits)中比较各个方案的限制。
- 联系你的组织所有者，提高项目上的速率限制。

429 - You exceeded your current quota, please check your plan and billing details（已超出当前配额，请检查方案和账单详情）

此错误消息表示你已达到 API 的月度[用量限制](https://platform.openai.com/settings/organization/limits)，或者对于预付额度客户，你已经用完了所有额度。你可以在[限制页面](https://platform.openai.com/settings/organization/limits)查看你的最高用量限制。出现这种情况可能有多种原因，例如：

- 你正在使用高容量或复杂服务，消耗大量额度或 token。
- 你的月度预算相对于组织使用量设置得过低。
- 你的月度预算相对于项目使用量设置得过低。

要解决此错误，请按以下步骤操作：

- 检查账户的[当前用量](https://platform.openai.com/settings/organization/usage)，并与账户的[限制](https://platform.openai.com/settings/organization/limits)比较。
- 如果你使用的是免费方案，请考虑[升级到付费方案](https://platform.openai.com/settings/organization/billing)以获得更高限制。
- 联系你的组织所有者，提高项目预算。

503 - The engine is currently overloaded, please try again later（引擎当前过载，请稍后重试）

此错误消息表示我们的服务器正在经历高流量，目前无法处理你的请求。出现这种情况可能有多种原因，例如：

- 我们服务的需求突然激增。
- 我们的服务器正在进行计划内或计划外维护或更新。
- 我们的服务器发生了意外或不可避免的服务中断或事件。

要解决此错误，请按以下步骤操作：

- 短暂等待后重试你的请求。我们建议使用指数退避策略，或遵守响应标头和速率限制的重试逻辑。你可以阅读更多关于速率限制[最佳实践](https://help.openai.com/en/articles/6891753-rate-limit-advice)的内容。
- 查看我们的[状态页](https://status.openai.com/)，了解关于服务和服务器的任何更新或公告。
- 如果经过合理时间后仍然收到此错误，请联系我们以获得进一步帮助。对由此造成的不便我们深表歉意，并感谢你的耐心和理解。

503 - Slow Down（请减速）

Pay-As-You-Go 模型可能会出现此错误，这些模型在所有 OpenAI 用户之间共享。它表示你的流量显著增加，使模型过载，并触发临时节流以维持服务稳定性。

要解决此错误，请按以下步骤操作：

- 将请求速率降回原始水平，至少稳定保持 15 分钟，然后逐步提升。
- 保持一致的流量模式，以尽量降低被节流的可能性。如果你的请求量保持稳定，应该很少遇到此错误。
- 考虑升级到 [Scale Tier](https://openai.com/api-scale-tier/) 以获得有保证的容量和性能，确保在高峰需求时段获得更可靠的访问。

## Python 库错误类型

| 类型                     | 概览                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APIConnectionError       | **原因：** 连接到我们服务时出现问题。 <br /> **解决方案：** 检查你的网络设置、代理配置、SSL 证书或防火墙规则。                                                                                                                                                                                                                                                                                                                       |
| APITimeoutError          | **原因：** 请求超时。 <br /> **解决方案：** 短暂等待后重试请求；如果问题持续存在，请联系我们。                                                                                                                                                                                                                                                                                                                                         |
| AuthenticationError      | **原因：** 你的 API key 或 token 无效、已过期或已被撤销。 <br /> **解决方案：** 检查你的 API key 或 token，确保其正确且处于可用状态。你可能需要从账户仪表板生成一个新的。                                                                                                                                                                                               |
| BadRequestError          | **原因：** 你的请求格式错误，或缺少某些必需参数，例如 token 或 input。 <br /> **解决方案：** 错误消息应会提示你具体犯了什么错误。查看你正在调用的具体 API 方法的[文档](https://developers.openai.com/api/docs/api-reference/)，确保发送的是有效且完整的参数。你可能还需要检查请求数据的编码、格式或大小。                                                               |
| ConflictError            | **原因：** 资源已被另一个请求更新。 <br /> **解决方案：** 再次尝试更新该资源，并确保没有其他请求正在尝试更新它。                                                                                                                                                                                                                                                                                                                     |
| InternalServerError      | **原因：** 我们这边出现问题。 <br /> **解决方案：** 短暂等待后重试请求；如果问题持续存在，请联系我们。                                                                                                                                                                                                                                                                                                                               |
| NotFoundError            | **原因：** 请求的资源不存在。 <br /> **解决方案：** 确保你使用的是正确的资源标识符。                                                                                                                                                                                                                                                                                                                                                  |
| PermissionDeniedError    | **原因：** 你无权访问请求的资源。 <br /> **解决方案：** 确保你使用了正确的 API key、组织 ID 和资源 ID。                                                                                                                                                                                                                                                                                                                               |
| RateLimitError           | **原因：** 你已达到分配给你的速率限制。 <br /> **解决方案：** 控制请求节奏。阅读我们的[速率限制指南](https://developers.openai.com/api/docs/guides/rate-limits)了解更多信息。                                                                                                                                                                                           |
| UnprocessableEntityError | **原因：** 请求格式正确，但无法处理该请求。 <br /> **解决方案：** 请再次尝试该请求。                                                                                                                                                                                                                                                                                                                                                  |

APIConnectionError

`APIConnectionError` 表示你的请求无法到达我们的服务器，或无法建立安全连接。这可能是由网络问题、代理配置、SSL 证书或防火墙规则引起的。

如果遇到 `APIConnectionError`，请尝试以下步骤：

- 检查网络设置，确保你有稳定且快速的互联网连接。你可能需要切换到其他网络、使用有线连接，或减少使用带宽的设备或应用数量。
- 检查代理配置，确保它与我们的服务兼容。你可能需要更新代理设置、使用其他代理，或完全绕过代理。
- 检查 SSL 证书，确保它们有效且为最新状态。你可能需要安装或续期证书、使用其他证书颁发机构，或禁用 SSL 验证。
- 检查防火墙规则，确保它们没有阻止或过滤我们的服务。你可能需要修改防火墙设置。
- 如果适用，请检查你的容器是否具有发送和接收流量所需的正确权限。
- 如果问题持续存在，请查看我们的“持续性错误”后续步骤部分。

APITimeoutError

`APITimeoutError` 错误表示你的请求耗时过长，服务器关闭了连接。这可能是由网络问题、我们的服务负载较重，或需要更多处理时间的复杂请求引起的。

如果遇到 `APITimeoutError` 错误，请尝试以下步骤：

- 等待几秒后重试请求。有时网络拥塞或我们服务的负载可能会降低，你的请求可能会在第二次尝试时成功。
- 检查网络设置，确保你有稳定且快速的互联网连接。你可能需要切换到其他网络、使用有线连接，或减少使用带宽的设备或应用数量。
- 如果问题持续存在，请查看我们的“持续性错误”后续步骤部分。

AuthenticationError

`AuthenticationError` 表示你的 API key 或 token 无效、已过期或已被撤销。这可能是由拼写错误、格式错误或安全泄露引起的。

如果遇到 `AuthenticationError`，请尝试以下步骤：

- 检查你的 API key 或 token，确保其正确且处于可用状态。你可能需要从 API Key 仪表板生成新的 key，确保没有多余空格或字符；如果你有多个 key 或 token，也可以使用其他 key 或 token。
- 确保你遵循了正确的格式。

BadRequestError

`BadRequestError`（以前称为 `InvalidRequestError`）表示你的请求格式错误，或缺少某些必需参数，例如 token 或 input。这可能是由拼写错误、格式错误或代码中的逻辑错误引起的。

如果遇到 `BadRequestError`，请尝试以下步骤：

- 仔细阅读错误消息并识别具体错误。错误消息应会提示你哪个参数无效或缺失，以及期望的值或格式是什么。
- 查看你所调用具体 API 方法的 [API Reference](https://developers.openai.com/api/docs/api-reference/)，确保发送的是有效且完整的参数。你可能需要检查参数名称、类型、值和格式，并确保它们与文档匹配。
- 检查请求数据的编码、格式或大小，确保它们与我们的服务兼容。你可能需要用 UTF-8 对数据进行编码、将数据格式化为 JSON，或在数据过大时压缩数据。
- 使用 Postman 或 curl 等工具测试你的请求，确保它按预期工作。你可能需要调试代码，并修复请求逻辑中的任何错误或不一致。
- 如果问题持续存在，请查看我们的“持续性错误”后续步骤部分。

InternalServerError

`InternalServerError` 表示我们在处理你的请求时出现了问题。这可能是由临时错误、bug 或系统中断引起的。

我们对由此造成的不便深表歉意，并正在努力尽快解决任何问题。你可以[查看我们的系统状态页](https://status.openai.com/)了解更多信息。

如果遇到 `InternalServerError`，请尝试以下步骤：

- 等待几秒后重试请求。有时问题可能会很快解决，你的请求可能会在第二次尝试时成功。
- 查看我们的状态页，了解可能影响服务的任何持续事件或维护。如果存在活跃事件，请关注更新，并在其解决后再重试请求。
- 如果问题持续存在，请查看我们的“持续性错误”后续步骤部分。

我们的支持团队会调查该问题并尽快回复你。请注意，由于需求量很高，我们的支持队列时间可能较长。你也可以在我们的 [Community Forum](https://community.openai.com) 发帖，但请务必省略任何敏感信息。

RateLimitError

`RateLimitError` 表示你已达到分配给你的速率限制。这意味着你在给定时间段内发送了过多 token 或请求，我们的服务已临时阻止你继续发送更多请求。

我们实施速率限制，是为了确保公平、高效地使用资源，并防止滥用或服务过载。

如果遇到 `RateLimitError`，请尝试以下步骤：

- 发送更少的 token 或请求，或放慢速度。你可能需要降低请求频率或数量、批处理 token，或实现指数退避。你可以阅读我们的[速率限制指南](https://developers.openai.com/api/docs/guides/rate-limits)了解更多详情。
- 等待速率限制重置（一分钟）后重试请求。错误消息应会让你了解自己的使用速率和允许用量。
- 你也可以从账户仪表板查看 API 用量统计。

### 持续性错误

如果问题持续存在，请[通过聊天联系我们的支持团队](https://help.openai.com/en/)，并向他们提供以下信息：

- 你使用的模型
- 你收到的错误消息和代码
- 你发送的请求数据和标头
- 请求的时间戳和时区
- 任何其他可能有助于我们诊断问题的相关细节

我们的支持团队会调查该问题并尽快回复你。请注意，由于需求量很高，我们的支持队列时间可能较长。你也可以在我们的 [Community Forum](https://community.openai.com) 发帖，但请务必省略任何敏感信息。

### 处理错误

我们建议你以编程方式处理 API 返回的错误。为此，你可以使用类似下面的代码片段：

```python
import openai
from openai import OpenAI
client = OpenAI()

try:
  #Make your OpenAI API request here
  response = client.responses.create(
    model="gpt-5.5",
    input="Hello world"
  )
except openai.APIError as e:
  #Handle API error here, e.g. retry or log
  print(f"OpenAI API returned an API Error: {e}")
  pass
except openai.APIConnectionError as e:
  #Handle connection error here
  print(f"Failed to connect to OpenAI API: {e}")
  pass
except openai.RateLimitError as e:
  #Handle rate limit error (we recommend using exponential backoff)
  print(f"OpenAI API request exceeded rate limit: {e}")
  pass
```
