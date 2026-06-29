---
title: "Web search 网页搜索"
description: "Allow models to search the web for the latest information before generating a response."
outline: deep
---

# Web search 网页搜索

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/tools-web-search](https://developers.openai.com/api/docs/guides/tools-web-search)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/tools-web-search.md](https://developers.openai.com/api/docs/guides/tools-web-search.md)
- 抓取时间：2026-06-27T05:54:11.137Z
- Checksum：`3f8cb937ff1ae0efc9c604b03b627820ff82baf5769cd2658b907554920216fb`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Web search 允许模型访问互联网上的最新信息，并提供带来源引用的答案。要启用此功能，请在 Responses API 中使用 web search tool，或在某些情况下使用 Chat Completions。

OpenAI models 可使用三种主要 web search 类型：

1. Non‑reasoning web search：non-reasoning model 会把用户查询发送给 web search tool，后者基于 top results 返回响应。这里没有内部规划，模型只是传递 search tool 的响应。这种方法速度快，非常适合快速查询。
2. Agentic search with reasoning models：这是一种由模型主动管理搜索过程的方法。模型可以把 web searches 作为其 chain of thought 的一部分，分析结果，并决定是否继续搜索。这种灵活性让 agentic search 非常适合复杂工作流，但也意味着搜索时间比快速查询更长。例如，你可以调整 `gpt-5.5` 等模型的 reasoning levels，以改变搜索深度和延迟。
3. Deep research：这是一种专门的、agent-driven 的方法，用于由 reasoning models 执行深入、扩展的调查。模型会把 web searches 作为其 chain of thought 的一部分，通常会利用数百个 sources。Deep research 可能运行数分钟，最适合与 background mode 一起使用。请使用 `gpt-5.5`，并将 reasoning 设置为 `high` 或 `xhigh`。

## 选择集成方式

| Use case                                      | Recommended path                              | Notes                                                                                                       |
| --------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 新的 web search 集成                          | Responses API with `web_search` and `gpt-5.5` | 支持 hosted web search controls，例如 filters、sources、live-access control，以及更长的 research runs       |
| 现有 Chat Completions search 集成             | Chat Completions with `gpt-5-search-api`      | 仅当你需要保留 Chat Completions 集成时使用此方式                                                           |
| 多步骤 research 或长时间运行的报告            | `gpt-5.5` with `high` or `xhigh` reasoning    | 对于可能需要几分钟的报告，请使用 background mode                                                           |

使用 [Responses API](https://developers.openai.com/api/docs/api-reference/responses) 时，你可以在 API request 的 `tools` array 中配置 web search，从而启用它来生成内容。与任何其他工具一样，模型可以根据输入 prompt 的内容选择是否搜索 web。

对于新的 Responses API 集成，请使用 `{ "type": "web_search" }`。较早的 `web_search_preview` tool 仍可用于 legacy integrations，但它不支持较新的 controls，例如 `filters`、`external_web_access` 和 `return_token_budget`。

## 输出和引用

使用 web search tool 的模型响应会包含两部分：

- 一个 `web_search_call` output item，其中包含 search call 的 ID，以及 `web_search_call.action` 中采取的 action。action 是以下之一：
  - `search`，表示一次 web search。它通常（但并不总是）包含被搜索的 search `queries`。Search actions 会产生 tool call cost（参见 [pricing](/mirror/api/docs/pricing#built-in-tools)）。
  - `open_page`，表示打开某个页面。reasoning models 支持此项。
  - `find_in_page`，表示在页面中搜索。reasoning models 支持此项。
- 一个 `message` output item，其中包含：
  - `message.content[0].text` 中的文本结果
  - `message.content[0].annotations` 中引用 URLs 的 annotations

默认情况下，模型响应会为 web search results 中找到的 URLs 包含 inline citations。此外，`url_citation` annotation object 会包含被引用 source 的 URL、title 和 location。

在向 end users 展示 web results 或 web results 中包含的信息时，必须在用户界面中让 inline citations 清晰可见并可点击。

```json
[
  {
    "type": "web_search_call",
    "id": "ws_67c9fa0502748190b7dd390736892e100be649c1a5ff9609",
    "status": "completed",
    "action": {
      "type": "search",
      "query": "latest news about AI"
    }
  },
  {
    "id": "msg_67c9fa077e288190af08fdffda2e34f20be649c1a5ff9609",
    "type": "message",
    "status": "completed",
    "role": "assistant",
    "content": [
      {
        "type": "output_text",
        "text": "On March 6, 2025, several news...",
        "annotations": [
          {
            "type": "url_citation",
            "start_index": 2606,
            "end_index": 2758,
            "url": "https://...",
            "title": "Title..."
          }
        ]
      }
    ]
  }
]
```





## 从 legacy web search 迁移

| If you use                                              | Recommended path                                                                                        | Notes                                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Responses 中的 `web_search_preview`                    | 迁移到 `web_search`                                                                                     | `web_search` 支持较新的 controls，例如 `filters`、`external_web_access` 和 `return_token_budget`         |
| `gpt-4o-search-preview` 或 `gpt-4o-mini-search-preview` | 迁移到 Responses `web_search`，或在必须保留 Chat Completions 时使用 `gpt-5-search-api`                  | preview search models 已弃用，并将于 2026-07-23 关闭                                                    |
| Chat Completions search integrations                    | 使用 `gpt-5-search-api`，或迁移到 Responses `web_search` 以获得更多 tool controls 和可选 search         | Chat Completions search models 总会先搜索再响应；Responses search 是一个工具                            |

## Search context size

`search_context_size` 控制模型生成响应之前，可从 web search results 中获得多少上下文。对于简单查询使用 `low`，平衡默认值使用 `medium`，当答案可能需要来自 search results 的更多细节时使用 `high`。此设置不会设定精确 token count，也不保证特定数量的 sources 或 citations。



设置 search context size

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[{
        "type": "web_search",
        "search_context_size": "low",
    }],
    input="What movie won best picture in 2025?",
)

print(response.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateWebSearchTool(
    searchContextSize: WebSearchToolContextSize.Low
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart(
            "What movie won best picture in 2025?"
        )
    ])
], options);

Console.WriteLine(response.GetOutputText());
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    tools: [{
        type: "web_search",
        search_context_size: "low",
    }],
    input: "What movie won best picture in 2025?",
});
console.log(response.output_text);
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "tools": [{
            "type": "web_search",
            "search_context_size": "low"
        }],
        "input": "What movie won best picture in 2025?"
    }'
```




## 运行更长的 web research

`return_token_budget` 控制在使用 GPT-5+ reasoning models 的 Responses API search run 中，web search result content 可以由工具返回多少。大多数请求保持默认值即可。只有在高强度 research 或 evaluation runs 需要检查许多页面，并且可能会因标准 returned-token cap 而提前停止时，才将其设置为 `unlimited`。

请有选择地使用 `unlimited`，因为它可能增加延迟和成本。对于长时间运行的 multi-search tasks，请使用 background mode（`background: true`），这样请求可以继续异步运行，你稍后可以检索最终响应。

| Value       | Behavior                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `default`   | 使用 web search results 的标准 returned-token budget。这与省略 `return_token_budget` 的行为相同。                           |
| `unlimited` | 移除 web search run 的默认 returned-token budget。                                                                            |

此参数只适用于 hosted Responses API `web_search` tool 与 GPT-5+ reasoning web search。它不会改变 search context window，也不适用于 non-reasoning web search、legacy Search API paths、container web search、Chat Completions search models 或 `web_search_preview`。仅支持 `default` 和 `unlimited` 两个值；`null`、数字和其他 strings 会被拒绝。



运行更长的 web searches

```bash
curl "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": { "effort": "xhigh" },
    "tools": [
      {
        "type": "web_search",
        "return_token_budget": "unlimited"
      }
    ],
    "input": "Research the economic impact of semaglutide on global healthcare systems.\n\nDo:\n- Include specific figures, trends, statistics, and measurable outcomes.\n- Prioritize reliable, up-to-date sources: peer-reviewed research, health organizations (e.g., WHO, CDC), regulatory agencies, or pharmaceutical earnings reports.\n- Include inline citations and return all source metadata.\n\nBe analytical, avoid generalities, and ensure that each section supports data-backed reasoning that could inform healthcare policy or financial modeling."
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "xhigh" },
    tools: [
        {
            type: "web_search",
            return_token_budget: "unlimited",
        },
    ],
    input: [
        "Research the economic impact of semaglutide on global healthcare systems.",
        "",
        "Do:",
        "- Include specific figures, trends, statistics, and measurable outcomes.",
        "- Prioritize reliable, up-to-date sources: peer-reviewed research, health organizations (e.g., WHO, CDC), regulatory agencies, or pharmaceutical earnings reports.",
        "- Include inline citations and return all source metadata.",
        "",
        "Be analytical, avoid generalities, and ensure that each section supports data-backed reasoning that could inform healthcare policy or financial modeling.",
    ].join("\n"),
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "xhigh"},
    tools=[
        {
            "type": "web_search",
            "return_token_budget": "unlimited",
        }
    ],
    input="""Research the economic impact of semaglutide on global healthcare systems.

Do:
- Include specific figures, trends, statistics, and measurable outcomes.
- Prioritize reliable, up-to-date sources: peer-reviewed research, health organizations (e.g., WHO, CDC), regulatory agencies, or pharmaceutical earnings reports.
- Include inline citations and return all source metadata.

Be analytical, avoid generalities, and ensure that each section supports data-backed reasoning that could inform healthcare policy or financial modeling.""",
)

print(response.output_text)
```




## Domain filtering

web search 中的 Domain filtering 允许你将结果限制在一组特定 domains 内。通过 `filters` parameter，你最多可以配置 100 个 `allowed_domains` 或最多 100 个 `blocked_domains`。格式化 domains 时，请省略 HTTP 或 HTTPS prefix。例如，使用 `openai.com` 而不是 `https://openai.com/`。这种方法也包括 subdomains。请注意，domain filtering 仅在 Responses API 中与 `web_search` tool 一起可用。



## Sources

要查看 web search 期间检索到的所有 URLs，请使用 `sources` field。与只展示最相关 references 的 inline citations 不同，sources 会返回模型在形成响应时参考过的完整 URLs 列表。
sources 的数量通常多于 citations 的数量。实时 third-party feeds 也会在这里呈现，并标记为 `oai-sports`、`oai-weather` 或 `oai-finance`。sources field 同时可用于 `web_search` 和 `web_search_preview` tools。

列出 sources

```bash
curl "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": { "effort": "low" },
    "tools": [
      {
        "type": "web_search",
        "filters": {
          "allowed_domains": [
            "pubmed.ncbi.nlm.nih.gov",
            "clinicaltrials.gov",
            "www.who.int",
            "www.cdc.gov",
            "www.fda.gov"
          ],
          "blocked_domains": [
            "reddit.com",
            "quora.com",
            "wikipedia.org"
          ]
        }
      }
    ],
    "tool_choice": "auto",
    "include": ["web_search_call.action.sources"],
    "input": "Please perform a web search on how semaglutide is used in the treatment of diabetes."
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "low" },
    tools: [
        {
            type: "web_search",
            filters: {
                allowed_domains: [
                    "pubmed.ncbi.nlm.nih.gov",
                    "clinicaltrials.gov",
                    "www.who.int",
                    "www.cdc.gov",
                    "www.fda.gov",
                ],
                blocked_domains: [
                    "reddit.com",
                    "quora.com",
                    "wikipedia.org",
                ],
            },
        },
    ],
    tool_choice: "auto",
    include: ["web_search_call.action.sources"],
    input: "Please perform a web search on how semaglutide is used in the treatment of diabetes.",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "low"},
    tools=[
        {
            "type": "web_search",
            "filters": {
                "allowed_domains": [
                    "pubmed.ncbi.nlm.nih.gov",
                    "clinicaltrials.gov",
                    "www.who.int",
                    "www.cdc.gov",
                    "www.fda.gov",
                ],
                "blocked_domains": [
                    "reddit.com",
                    "quora.com",
                    "wikipedia.org",
                ],
            },
        }
    ],
    tool_choice="auto",
    include=["web_search_call.action.sources"],
    input="Please perform a web search on how semaglutide is used in the treatment of diabetes.",
)

print(response.output_text)
```






## Image search results

Web search 可以在常规文本结果旁边返回 image results。当你的应用需要当前的或基于 web 的视觉内容时，请使用 image search，例如产品照片、地标、地点、事件或视觉参考。

要使用 image search，请将 `search_content_types` 设置为包含 `image`。如果还需要辅助文本结果来帮助模型总结、排序或解释检索到的图片，请添加 `text`。

使用 `image_settings` 控制图片相关行为：

- `max_results`：请求正数个 image results。
- `caption`：请求在可用时提供简短图片描述。

要检查原始 image results，请在请求中包含 `web_search_call.results`，并从响应中读取 `web_search_call.results[]`。Image results 会与 assistant message 分开返回，因此当你的应用需要 URLs 或 metadata 时，请直接解析 `web_search_call` item。

搜索图片

```bash
curl "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": { "effort": "low" },
    "tools": [
      {
        "type": "web_search",
        "search_content_types": ["image", "text"],
        "image_settings": {
          "max_results": 3,
          "caption": true
        }
      }
    ],
    "include": ["web_search_call.results"],
    "input": "Search for recent images and supporting text sources about the Golden Gate Bridge at sunset."
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "low" },
    tools: [
        {
            type: "web_search",
            search_content_types: ["image", "text"],
            image_settings: {
                max_results: 3,
                caption: true,
            },
        },
    ],
    include: ["web_search_call.results"],
    input: "Search for recent images and supporting text sources about the Golden Gate Bridge at sunset.",
});

console.log(response.output);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "low"},
    tools=[
        {
            "type": "web_search",
            "search_content_types": ["image", "text"],
            "image_settings": {
                "max_results": 3,
                "caption": True,
            },
        }
    ],
    include=["web_search_call.results"],
    input="Search for recent images and supporting text sources about the Golden Gate Bridge at sunset.",
)

print(response.output)
```


每个 `image_result` 都包含：

- `image_url`：该结果的 canonical image URL。
- `source_website_url`：找到该图片的页面。
- `thumbnail_url`：可用时提供 thumbnail URL。
- `caption`：可用时提供的短 caption 或描述。

```json
{
  "output": [
    {
      "type": "web_search_call",
      "status": "completed",
      "results": [
        {
          "type": "image_result",
          "image_url": "https://cdn.example/golden-gate-sunset.jpg",
          "thumbnail_url": "https://cdn.example/golden-gate-sunset-thumb.jpg",
          "source_website_url": "https://example.com/source-page",
          "caption": "Golden Gate Bridge at sunset"
        }
      ]
    }
  ]
}
```



## 用户位置

要基于地理位置优化 search results，你可以使用 country、city、region 和/或 timezone 指定 approximate user location。

- `city` 和 `region` fields 是自由文本 strings，例如 `Minneapolis` 和 `Minnesota`。
- `country` field 是两个字母的 [ISO country code](https://en.wikipedia.org/wiki/ISO_3166-1)，例如 `US`。
- `timezone` field 是 [IANA timezone](https://timeapi.io/documentation/iana-timezones)，例如 `America/Chicago`。

请注意，user location 不支持使用 web search 的 deep research models。



自定义 user location

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[{
        "type": "web_search",
        "user_location": {
            "type": "approximate",
            "country": "GB",
            "city": "London",
            "region": "London",
        }
    }],
    input="What are the best restaurants near me?",
)

print(response.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateWebSearchTool(
    userLocation: WebSearchToolLocation.CreateApproximateLocation(
        country: "GB",
        city: "London",
        region: "Granary Square"
    )
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart(
            "What are the best restaurants near me?"
        )
    ])
], options);

Console.WriteLine(response.GetOutputText());
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    tools: [{
        type: "web_search",
        user_location: {
            type: "approximate",
            country: "GB",
            city: "London",
            region: "London"
        }
    }],
    input: "What are the best restaurants near me?",
});
console.log(response.output_text);
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "tools": [{
            "type": "web_search",
            "user_location": {
                "type": "approximate",
                "country": "GB",
                "city": "London",
                "region": "London"
            }
        }],
        "input": "What are the best restaurants near me?"
    }'
```






## 实时互联网访问

控制 Responses API 中 web search tool 是获取实时内容，还是只使用缓存/已索引结果。

- 在 `web_search` tool 上设置 `external_web_access: false`，即可在 offline/cache‑only mode 下运行。
- 如果不设置，默认值为 `true`（live access）。
- Preview variants（`web_search_preview`）会忽略此参数，并表现得好像 `external_web_access` 为 `true`。



控制实时互联网访问

```bash
curl "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "tools": [
      { "type": "web_search", "external_web_access": false }
    ],
    "tool_choice": "auto",
    "input": "Find when the Eiffel Tower opened to the public and cite the source."
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    { type: "web_search", external_web_access: false },
  ],
  tool_choice: "auto",
  input: "Find when the Eiffel Tower opened to the public and cite the source.",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

resp = client.responses.create(
    model="gpt-5.5",
    tools=[{"type": "web_search", "external_web_access": False}],
    tool_choice="auto",
    input="Find when the Eiffel Tower opened to the public and cite the source.",
)
print(resp.output_text)
```




## 限制

#### Chat Completions API

Chat Completions API 仅支持专门用于 web search 的 search models。这些 models 不支持 Responses API `web_search` features，例如 domain filters、complete source lists、live-access control 和 returned-token budget control。

| Model                        | Context window | Limitation                                                                                                                                   |
| ---------------------------- | -------------: | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `gpt-5-search-api`           |           200k | 使用 Chat Completions search model path                                                                                                      |
| `gpt-4o-search-preview`      |           128k | 使用 Chat Completions search model path；[已弃用，将于 2026-07-23 关闭](/mirror/api/docs/deprecations#2026-04-22-legacy-gpt-model-snapshots) |
| `gpt-4o-mini-search-preview` |           128k | 使用 Chat Completions search model path；[已弃用，将于 2026-07-23 关闭](/mirror/api/docs/deprecations#2026-04-22-legacy-gpt-model-snapshots) |

#### Responses API

使用 hosted `web_search` tool。Responses API 仍接受 `web_search_preview` 用于 legacy integrations，但新的 integrations 应使用 `web_search`。

若需要更大的 model context window，请使用 `gpt-5.5`。web search context window 仍为 128k。

| Model          | Model context window | Limitation                                                                                                                         |
| -------------- | -------------------: | ---------------------------------------------------------------------------------------------------------------------------------- |
| `gpt-4.1`      |                   1M | Search context 限制为 128k                                                                                                         |
| `gpt-4.1-mini` |                   1M | Search context 限制为 128k                                                                                                         |
| `o4-mini`      |                 200k | Search context 限制为 128k；[已弃用，将于 2026-10-23 关闭](/mirror/api/docs/deprecations#2026-04-22-legacy-gpt-model-snapshots) |

对于 Responses API web search，即使 model context window 更大，search context window 也限制为 128k。

- Web search 不支持带 `minimal` reasoning 的 [`gpt-5`](https://developers.openai.com/api/docs/models/gpt-5)。
- reasoning effort 设置为 `none` 的 [`gpt-5.4`](https://developers.openai.com/api/docs/models/gpt-5.4) 可能产生较低质量的结果。
- Responses API web search 使用底层 model 的 tiered rate limits。
- `web_search_preview` 不支持 `filters` 或 `return_token_budget`，并且会忽略 `external_web_access`。
- 使用 `tool_choice: "auto"` 时，search 是可选的。当必须运行 search 时，请使用 `tool_choice: "required"` 或指定具体 web search tool choice。

## 使用说明





API Availability
Rate limits
Notes





      [Responses](https://developers.openai.com/api/docs/api-reference/responses)


      [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat)


      [Assistants](https://developers.openai.com/api/docs/api-reference/assistants)



    与使用该 tool 的底层 [model](https://developers.openai.com/api/docs/models) 的 tiered rate limits 相同。


    [Pricing](/mirror/api/docs/pricing#built-in-tools) &lt;br /&gt;
    [ZDR and data residency](/mirror/api/docs/guides/your-data)






:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
Web search allows models to access up-to-date information from the internet and provide answers with sourced citations. To enable this, use the web search tool in the Responses API or, in some cases, Chat Completions.

There are three main types of web search available with OpenAI models:

1. Non‑reasoning web search: The non-reasoning model sends the user’s query to the web search tool, which returns the response based on top results. There’s no internal planning and the model simply passes along the search tool’s responses. This method is fast and ideal for quick lookups.
2. Agentic search with reasoning models is an approach where the model actively manages the search process. It can perform web searches as part of its chain of thought, analyze results, and decide whether to keep searching. This flexibility makes agentic search well suited to complex workflows, but it also means searches take longer than quick lookups. For example, you can adjust reasoning levels on models like `gpt-5.5` to change both the depth and latency of the search.
3. Deep research is a specialized, agent-driven method for in-depth, extended investigations by reasoning models. The model conducts web searches as part of its chain of thought, often tapping into hundreds of sources. Deep research can run for several minutes and is best used with background mode. Use `gpt-5.5` with reasoning set to `high` or `xhigh`.

## Choose an integration

| Use case                                      | Recommended path                              | Notes                                                                                                       |
| --------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| New web search integration                    | Responses API with `web_search` and `gpt-5.5` | Supports hosted web search controls such as filters, sources, live-access control, and longer research runs |
| Existing Chat Completions search integration  | Chat Completions with `gpt-5-search-api`      | Use this only when you need to preserve a Chat Completions integration                                      |
| Multi-step research or long-running reporting | `gpt-5.5` with `high` or `xhigh` reasoning    | Use background mode for reports that can take several minutes                                               |

Using the [Responses API](https://developers.openai.com/api/docs/api-reference/responses), you can enable web search by configuring it in the `tools` array in an API request to generate content. Like any other tool, the model can choose to search the web or not based on the content of the input prompt.

For new Responses API integrations, use `{ "type": "web_search" }`. The earlier `web_search_preview` tool remains available for legacy integrations, but it does not support newer controls such as `filters`, `external_web_access`, and `return_token_budget`.

## Output and citations

Model responses that use the web search tool will include two parts:

- A `web_search_call` output item with the ID of the search call, along with the action taken in `web_search_call.action`. The action is one of:
  - `search`, which represents a web search. It will usually (but not always) includes the search `queries` which were searched. Search actions incur a tool call cost (see [pricing](https://developers.openai.com/api/docs/pricing#built-in-tools)).
  - `open_page`, which represents a page being opened. Supported in reasoning models.
  - `find_in_page`, which represents searching within a page. Supported in reasoning models.
- A `message` output item containing:
  - The text result in `message.content[0].text`
  - Annotations `message.content[0].annotations` for the cited URLs

By default, the model's response will include inline citations for URLs found in the web search results. In addition to this, the `url_citation` annotation object will contain the URL, title and location of the cited source.

When displaying web results or information contained in web results to end
  users, inline citations must be made clearly visible and clickable in your
  user interface.

```json
[
  {
    "type": "web_search_call",
    "id": "ws_67c9fa0502748190b7dd390736892e100be649c1a5ff9609",
    "status": "completed",
    "action": {
      "type": "search",
      "query": "latest news about AI"
    }
  },
  {
    "id": "msg_67c9fa077e288190af08fdffda2e34f20be649c1a5ff9609",
    "type": "message",
    "status": "completed",
    "role": "assistant",
    "content": [
      {
        "type": "output_text",
        "text": "On March 6, 2025, several news...",
        "annotations": [
          {
            "type": "url_citation",
            "start_index": 2606,
            "end_index": 2758,
            "url": "https://...",
            "title": "Title..."
          }
        ]
      }
    ]
  }
]
```





## Migrating from legacy web search

| If you use                                              | Recommended path                                                                                        | Notes                                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `web_search_preview` in Responses                       | Migrate to `web_search`                                                                                 | `web_search` supports newer controls such as `filters`, `external_web_access`, and `return_token_budget` |
| `gpt-4o-search-preview` or `gpt-4o-mini-search-preview` | Migrate to Responses `web_search`, or use `gpt-5-search-api` if you must stay on Chat Completions       | The preview search models are deprecated and shut down on 2026-07-23                                     |
| Chat Completions search integrations                    | Use `gpt-5-search-api`, or migrate to Responses `web_search` for more tool controls and optional search | Chat Completions search models always search before responding; Responses search is a tool               |

## Search context size

`search_context_size` controls how much context from web search results is made available to the model before it generates a response. Use `low` for simple lookups, `medium` for a balanced default, and `high` when the answer may require more detail from search results. This setting does not set an exact token count or guarantee a specific number of sources or citations.



Set search context size

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[{
        "type": "web_search",
        "search_context_size": "low",
    }],
    input="What movie won best picture in 2025?",
)

print(response.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateWebSearchTool(
    searchContextSize: WebSearchToolContextSize.Low
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart(
            "What movie won best picture in 2025?"
        )
    ])
], options);

Console.WriteLine(response.GetOutputText());
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    tools: [{
        type: "web_search",
        search_context_size: "low",
    }],
    input: "What movie won best picture in 2025?",
});
console.log(response.output_text);
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "tools": [{
            "type": "web_search",
            "search_context_size": "low"
        }],
        "input": "What movie won best picture in 2025?"
    }'
```




## Run longer web research

`return_token_budget` controls how much web search result content the tool can return during a Responses API search run with GPT-5+ reasoning models. Keep the default for most requests. Set it to `unlimited` only for high-effort research or evaluation runs that need to inspect many pages and might otherwise stop at the standard returned-token cap.

Use `unlimited` selectively because it can increase latency and cost. For long-running multi-search tasks, use background mode (`background: true`) so the request can keep running asynchronously and you can retrieve the final response later.

| Value       | Behavior                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `default`   | Uses the standard returned-token budget for web search results. This is the same behavior as omitting `return_token_budget`. |
| `unlimited` | Removes the default returned-token budget for the web search run.                                                            |

This parameter applies only to the hosted Responses API `web_search` tool with GPT-5+ reasoning web search. It does not change the search context window, and it does not apply to non-reasoning web search, legacy Search API paths, container web search, Chat Completions search models, or `web_search_preview`. Only `default` and `unlimited` are supported values; `null`, numbers, and other strings are rejected.



Run longer web searches

```bash
curl "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": { "effort": "xhigh" },
    "tools": [
      {
        "type": "web_search",
        "return_token_budget": "unlimited"
      }
    ],
    "input": "Research the economic impact of semaglutide on global healthcare systems.\n\nDo:\n- Include specific figures, trends, statistics, and measurable outcomes.\n- Prioritize reliable, up-to-date sources: peer-reviewed research, health organizations (e.g., WHO, CDC), regulatory agencies, or pharmaceutical earnings reports.\n- Include inline citations and return all source metadata.\n\nBe analytical, avoid generalities, and ensure that each section supports data-backed reasoning that could inform healthcare policy or financial modeling."
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "xhigh" },
    tools: [
        {
            type: "web_search",
            return_token_budget: "unlimited",
        },
    ],
    input: [
        "Research the economic impact of semaglutide on global healthcare systems.",
        "",
        "Do:",
        "- Include specific figures, trends, statistics, and measurable outcomes.",
        "- Prioritize reliable, up-to-date sources: peer-reviewed research, health organizations (e.g., WHO, CDC), regulatory agencies, or pharmaceutical earnings reports.",
        "- Include inline citations and return all source metadata.",
        "",
        "Be analytical, avoid generalities, and ensure that each section supports data-backed reasoning that could inform healthcare policy or financial modeling.",
    ].join("\n"),
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "xhigh"},
    tools=[
        {
            "type": "web_search",
            "return_token_budget": "unlimited",
        }
    ],
    input="""Research the economic impact of semaglutide on global healthcare systems.

Do:
- Include specific figures, trends, statistics, and measurable outcomes.
- Prioritize reliable, up-to-date sources: peer-reviewed research, health organizations (e.g., WHO, CDC), regulatory agencies, or pharmaceutical earnings reports.
- Include inline citations and return all source metadata.

Be analytical, avoid generalities, and ensure that each section supports data-backed reasoning that could inform healthcare policy or financial modeling.""",
)

print(response.output_text)
```




## Domain filtering

Domain filtering in web search lets you limit results to a specific set of domains. With the `filters` parameter you can configure up to 100 `allowed_domains` or up to 100 `blocked_domains`. When formatting domains, omit the HTTP or HTTPS prefix. For example, use `openai.com` instead of `https://openai.com/`. This approach also includes subdomains in the search. Note that domain filtering is only available in the Responses API with the `web_search` tool.



## Sources

To view all URLs retrieved during a web search, use the `sources` field. Unlike inline citations, which show only the most relevant references, sources returns the complete list of URLs the model consulted when forming its response.
The number of sources is often greater than the number of citations. Real-time third-party feeds are also surfaced here and are labeled as `oai-sports`, `oai-weather`, or `oai-finance`. The sources field is available with both the `web_search` and `web_search_preview` tools.

List sources

```bash
curl "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": { "effort": "low" },
    "tools": [
      {
        "type": "web_search",
        "filters": {
          "allowed_domains": [
            "pubmed.ncbi.nlm.nih.gov",
            "clinicaltrials.gov",
            "www.who.int",
            "www.cdc.gov",
            "www.fda.gov"
          ],
          "blocked_domains": [
            "reddit.com",
            "quora.com",
            "wikipedia.org"
          ]
        }
      }
    ],
    "tool_choice": "auto",
    "include": ["web_search_call.action.sources"],
    "input": "Please perform a web search on how semaglutide is used in the treatment of diabetes."
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "low" },
    tools: [
        {
            type: "web_search",
            filters: {
                allowed_domains: [
                    "pubmed.ncbi.nlm.nih.gov",
                    "clinicaltrials.gov",
                    "www.who.int",
                    "www.cdc.gov",
                    "www.fda.gov",
                ],
                blocked_domains: [
                    "reddit.com",
                    "quora.com",
                    "wikipedia.org",
                ],
            },
        },
    ],
    tool_choice: "auto",
    include: ["web_search_call.action.sources"],
    input: "Please perform a web search on how semaglutide is used in the treatment of diabetes.",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "low"},
    tools=[
        {
            "type": "web_search",
            "filters": {
                "allowed_domains": [
                    "pubmed.ncbi.nlm.nih.gov",
                    "clinicaltrials.gov",
                    "www.who.int",
                    "www.cdc.gov",
                    "www.fda.gov",
                ],
                "blocked_domains": [
                    "reddit.com",
                    "quora.com",
                    "wikipedia.org",
                ],
            },
        }
    ],
    tool_choice="auto",
    include=["web_search_call.action.sources"],
    input="Please perform a web search on how semaglutide is used in the treatment of diabetes.",
)

print(response.output_text)
```






## Image search results

Web search can return image results alongside regular text results. Use image search when your application needs current or web-grounded visuals, such as product photos, landmarks, places, events, or visual references.

To use image search, set `search_content_types` to include `image`. Add `text` when you also want supporting text results that help the model summarize, rank, or explain the retrieved images.

Use `image_settings` to control image-specific behavior:

- `max_results`: Request a positive number of image results.
- `caption`: Ask for short image descriptions when available.

To inspect raw image results, include `web_search_call.results` in the request and read `web_search_call.results[]` from the response. Image results are returned separately from the assistant message, so parse the `web_search_call` item directly when your application needs the URLs or metadata.

Search for images

```bash
curl "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "reasoning": { "effort": "low" },
    "tools": [
      {
        "type": "web_search",
        "search_content_types": ["image", "text"],
        "image_settings": {
          "max_results": 3,
          "caption": true
        }
      }
    ],
    "include": ["web_search_call.results"],
    "input": "Search for recent images and supporting text sources about the Golden Gate Bridge at sunset."
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    reasoning: { effort: "low" },
    tools: [
        {
            type: "web_search",
            search_content_types: ["image", "text"],
            image_settings: {
                max_results: 3,
                caption: true,
            },
        },
    ],
    include: ["web_search_call.results"],
    input: "Search for recent images and supporting text sources about the Golden Gate Bridge at sunset.",
});

console.log(response.output);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    reasoning={"effort": "low"},
    tools=[
        {
            "type": "web_search",
            "search_content_types": ["image", "text"],
            "image_settings": {
                "max_results": 3,
                "caption": True,
            },
        }
    ],
    include=["web_search_call.results"],
    input="Search for recent images and supporting text sources about the Golden Gate Bridge at sunset.",
)

print(response.output)
```


Each `image_result` includes:

- `image_url`: The canonical image URL for the result.
- `source_website_url`: The page where the image was found.
- `thumbnail_url`: A thumbnail URL when available.
- `caption`: A short caption or description when available.

```json
{
  "output": [
    {
      "type": "web_search_call",
      "status": "completed",
      "results": [
        {
          "type": "image_result",
          "image_url": "https://cdn.example/golden-gate-sunset.jpg",
          "thumbnail_url": "https://cdn.example/golden-gate-sunset-thumb.jpg",
          "source_website_url": "https://example.com/source-page",
          "caption": "Golden Gate Bridge at sunset"
        }
      ]
    }
  ]
}
```



## User location

To refine search results based on geography, you can specify an approximate user location using country, city, region, and/or timezone.

- The `city` and `region` fields are free text strings, like `Minneapolis` and `Minnesota` respectively.
- The `country` field is a two-letter [ISO country code](https://en.wikipedia.org/wiki/ISO_3166-1), like `US`.
- The `timezone` field is an [IANA timezone](https://timeapi.io/documentation/iana-timezones) like `America/Chicago`.

Note that user location is not supported for deep research models using web
  search.



Customizing user location

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    tools=[{
        "type": "web_search",
        "user_location": {
            "type": "approximate",
            "country": "GB",
            "city": "London",
            "region": "London",
        }
    }],
    input="What are the best restaurants near me?",
)

print(response.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateWebSearchTool(
    userLocation: WebSearchToolLocation.CreateApproximateLocation(
        country: "GB",
        city: "London",
        region: "Granary Square"
    )
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart(
            "What are the best restaurants near me?"
        )
    ])
], options);

Console.WriteLine(response.GetOutputText());
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    tools: [{
        type: "web_search",
        user_location: {
            type: "approximate",
            country: "GB",
            city: "London",
            region: "London"
        }
    }],
    input: "What are the best restaurants near me?",
});
console.log(response.output_text);
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "tools": [{
            "type": "web_search",
            "user_location": {
                "type": "approximate",
                "country": "GB",
                "city": "London",
                "region": "London"
            }
        }],
        "input": "What are the best restaurants near me?"
    }'
```






## Live internet access

Control whether the web search tool fetches live content or uses only cached/indexed results in the Responses API.

- Set `external_web_access: false` on the `web_search` tool to run in offline/cache‑only mode.
- Default is `true` (live access) if you do not set it.
- Preview variants (`web_search_preview`) ignore this parameter and behave as if `external_web_access` is `true`.



Control live internet access

```bash
curl "https://api.openai.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "tools": [
      { "type": "web_search", "external_web_access": false }
    ],
    "tool_choice": "auto",
    "input": "Find when the Eiffel Tower opened to the public and cite the source."
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.5",
  tools: [
    { type: "web_search", external_web_access: false },
  ],
  tool_choice: "auto",
  input: "Find when the Eiffel Tower opened to the public and cite the source.",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

resp = client.responses.create(
    model="gpt-5.5",
    tools=[{"type": "web_search", "external_web_access": False}],
    tool_choice="auto",
    input="Find when the Eiffel Tower opened to the public and cite the source.",
)
print(resp.output_text)
```




## Limitations

#### Chat Completions API

The Chat Completions API supports only specialized search models for web search. These models do not support Responses API `web_search` features such as domain filters, complete source lists, live-access control, and returned-token budget control.

| Model                        | Context window | Limitation                                                                                                                                   |
| ---------------------------- | -------------: | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `gpt-5-search-api`           |           200k | Uses the Chat Completions search model path                                                                                                  |
| `gpt-4o-search-preview`      |           128k | Uses the Chat Completions search model path; [deprecated, shutdown 2026-07-23](https://developers.openai.com/api/docs/deprecations#2026-04-22-legacy-gpt-model-snapshots) |
| `gpt-4o-mini-search-preview` |           128k | Uses the Chat Completions search model path; [deprecated, shutdown 2026-07-23](https://developers.openai.com/api/docs/deprecations#2026-04-22-legacy-gpt-model-snapshots) |

#### Responses API

Use the hosted `web_search` tool. The Responses API still accepts `web_search_preview` for legacy integrations, but use `web_search` for new integrations.

For a larger model context window, use `gpt-5.5`. The web search context window remains 128k.

| Model          | Model context window | Limitation                                                                                                                         |
| -------------- | -------------------: | ---------------------------------------------------------------------------------------------------------------------------------- |
| `gpt-4.1`      |                   1M | Search context is limited to 128k                                                                                                  |
| `gpt-4.1-mini` |                   1M | Search context is limited to 128k                                                                                                  |
| `o4-mini`      |                 200k | Search context is limited to 128k; [deprecated, shutdown 2026-10-23](https://developers.openai.com/api/docs/deprecations#2026-04-22-legacy-gpt-model-snapshots) |

For Responses API web search, the search context window is limited to 128k, even when the model context window is larger.

- Web search does not support [`gpt-5`](https://developers.openai.com/api/docs/models/gpt-5) with `minimal` reasoning.
- [`gpt-5.4`](https://developers.openai.com/api/docs/models/gpt-5.4) with reasoning effort set to `none` may produce lower-quality results.
- Responses API web search uses the underlying model's tiered rate limits.
- `web_search_preview` does not support `filters` or `return_token_budget`, and ignores `external_web_access`.
- With `tool_choice: "auto"`, search is optional. Use `tool_choice: "required"` or a specific web search tool choice when search must run.

## Usage notes

<table>
<tbody>

<tr>
  <th>API Availability</th>
  <th>Rate limits</th>
  <th>Notes</th>
</tr>

<tr>
  <td>
    <div className="mb-1 flex items-center gap-2">
      [Responses](https://developers.openai.com/api/docs/api-reference/responses)
    </div>
    <div className="mb-1 flex items-center gap-2">
      [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat)
    </div>
    <div className="mb-1 flex items-center gap-2">
      [Assistants](https://developers.openai.com/api/docs/api-reference/assistants)
    </div>
  </td>
  <td style={{ maxWidth: "150px" }}>
    Same as tiered rate limits for underlying [model](https://developers.openai.com/api/docs/models) used
    with the tool.
  </td>
  <td style={{ maxWidth: "150px" }}>
    [Pricing](https://developers.openai.com/api/docs/pricing#built-in-tools) <br />
    [ZDR and data residency](https://developers.openai.com/api/docs/guides/your-data)
  </td>
</tr>

</tbody>
</table>
``````
:::
:::

