---
status: needs-review
sourceId: "acf4d88cfa1c"
sourceChecksum: "acf4d88cfa1c01f7c53fbc6f619cb1d7dca5c1acdb5ea65638f14a5f0edb4d83"
sourceUrl: "https://developers.openai.com/api/docs/mcp"
translatedAt: "2026-06-27T08:52:13.975Z"
translator: codex-gpt-5.5-xhigh
---

# 为 ChatGPT Apps 和 API 集成构建 MCP server

[Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) 是一种开放协议，正在成为用额外工具和知识扩展 AI 模型的行业标准。远程 MCP server 可用于通过互联网将模型连接到新的数据源和能力。

在本指南中，我们将介绍如何构建一个远程 MCP server：它从私有数据源（一个 [vector store](https://developers.openai.com/api/docs/guides/retrieval)）读取数据，并将这些数据作为 ChatGPT 中的纯数据 app（以前称为 connector）提供给聊天、deep research 和 company knowledge 使用，同时也可[通过 API](https://developers.openai.com/api/docs/guides/deep-research) 使用。

**注意**：对于 ChatGPT app 设置（developer mode、连接你的 MCP server，以及可选 UI），请从 Apps SDK 文档开始：[Quickstart](https://developers.openai.com/apps-sdk/quickstart)、[Build your MCP server](https://developers.openai.com/apps-sdk/build/mcp-server)、[Connect from ChatGPT](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt) 和 [Authentication](https://developers.openai.com/apps-sdk/build/auth)。如果你正在构建纯数据 app，可以跳过 UI resources，只暴露 tools。

**术语更新**：自 **2025 年 12 月 17 日** 起，ChatGPT 将 connectors 重命名为 apps。现有功能保持不变，但当前文档和产品 UI 使用 “apps”。请参阅 Help Center 更新：[ChatGPT apps with sync](https://help.openai.com/en/articles/10847137-chatgpt-apps-with-sync)、[Company knowledge in ChatGPT](https://help.openai.com/en/articles/12628342-company-knowledge-in-chatgpt-business-enterprise-and-edu)，以及 [Admin controls, security, and compliance in apps](https://help.openai.com/en/articles/11509118-admin-controls-security-and-compliance-in-apps-connectors-enterprise-edu-and-business)。

## 配置数据源

你可以使用任意来源的数据来驱动远程 MCP server，但为了简单起见，我们将使用 OpenAI API 中的 [vector stores](https://developers.openai.com/api/docs/guides/retrieval)。先将一个 PDF 文档上传到新的 vector store；示例可以使用[这本公有领域的 19 世纪猫主题书籍](https://cdn.openai.com/API/docs/cats.pdf)。

你可以[在 dashboard 中](https://platform.openai.com/storage/vector_stores)上传文件并创建 vector store，也可以通过 API 创建 vector store 并上传文件。[按照 vector store guide](https://developers.openai.com/api/docs/guides/retrieval) 设置一个 vector store，并向其中上传文件。

记下该 vector store 的唯一 ID，后续示例会用到它。

![vector store configuration](https://cdn.openai.com/API/docs/images/vector_store.png)

## 创建 MCP server

接下来，我们创建一个远程 MCP server，它会对我们的 vector store 执行搜索查询，并能够根据给定 ID 返回文件的文档内容。

在此示例中，我们将使用 Python 和 [FastMCP](https://github.com/jlowin/fastmcp) 构建 MCP server。本节末尾会提供完整的 server 实现，以及在 [Replit](https://replit.com/) 上运行它的说明。

请注意，你还可以使用许多其他 MCP server 框架，并可选择多种编程语言。无论使用哪种框架，你的 server 中的 tool definitions 都需要符合这里描述的形状。

为了配合 ChatGPT deep research 和 company knowledge（以及通过 API 使用的 deep research），你的 MCP server 应实现两个只读工具：`search` 和 `fetch`，并使用 [Company knowledge compatibility](https://developers.openai.com/apps-sdk/build/mcp-server#company-knowledge-compatibility) 中的兼容 schema。

请为每个 tool 声明 output schema，以便客户端验证结果形状。在 FastMCP 中，带类型的返回模型可以自动生成该 schema；下面的示例也从同一组模型显式传入 `output_schema`。

### `search` tool

`search` tool 负责根据用户查询，从你的 MCP server 数据源返回相关搜索结果列表。

_参数：_

一个查询字符串。

_返回：_

一个对象，包含单个键 `results`，其值是结果对象数组。每个结果对象都应包含：

- `id` - 文档或搜索结果项的唯一 ID
- `title` - 人类可读的标题。
- `url` - 用于引用的规范 URL。

在 MCP 中，将该对象作为 `structuredContent` 返回，并在 [content array](https://modelcontextprotocol.io/docs/learn/architecture#understanding-the-tool-execution-response) 中以 JSON 编码字符串形式包含相同值，以保持兼容性。

最终 tool response 应如下所示：

```json
{
  "structuredContent": {
    "results": [{ "id": "doc-1", "title": "...", "url": "..." }]
  },
  "content": [
    {
      "type": "text",
      "text": "{\"results\":[{\"id\":\"doc-1\",\"title\":\"...\",\"url\":\"...\"}]}"
    }
  ]
}
```

### `fetch` tool

fetch tool 用于取回搜索结果文档或项目的完整内容。

_参数：_

一个字符串，作为搜索文档的唯一标识符。

_返回：_

一个对象，包含以下属性：

- `id` - 文档或搜索结果项的唯一 ID
- `title` - 搜索结果项的字符串标题
- `text` - 文档或项目的完整文本
- `url` - 指向文档或搜索结果项的 URL。对于在研究中引用特定资源很有用。
- `metadata` - 可选的结果相关键/值数据

在 MCP 中，将该对象作为 `structuredContent` 返回，并在 content array 中以 JSON 编码字符串形式包含相同值，以保持兼容性。

最终 tool response 应如下所示：

```json
{
  "structuredContent": {
    "id": "doc-1",
    "title": "...",
    "text": "full text...",
    "url": "https://example.com/doc",
    "metadata": { "source": "vector_store" }
  },
  "content": [
    {
      "type": "text",
      "text": "{\"id\":\"doc-1\",\"title\":\"...\",\"text\":\"full text...\",\"url\":\"https://example.com/doc\",\"metadata\":{\"source\":\"vector_store\"}}"
    }
  ]
}
```

### 引用行为

对于 `search` 结果和 `fetch` 响应，只有当 `url` 是非空字符串时，ChatGPT 才会创建 citation metadata。带有 `title` 但没有可用 `url` 的结果会保持为普通 tool output，而不会变成空引用。若要让结果可引用，请返回其规范 `url`。

例如，ChatGPT 可能会使用以下内容调用 `search`：

```json
{ "query": "What is the quarterly plan?" }
```

MCP server 可以返回一个带 URL 的结果：

```json
{
  "structuredContent": {
    "results": [
      {
        "id": "quarterly-plan",
        "title": "Quarterly plan",
        "url": "https://example.com/quarterly-plan"
      }
    ]
  },
  "content": [
    {
      "type": "text",
      "text": "{\"results\":[{\"id\":\"quarterly-plan\",\"title\":\"Quarterly plan\",\"url\":\"https://example.com/quarterly-plan\"}]}"
    }
  ]
}
```

在这个响应中，`url` 字段有值，因此该结果具备生成 citation metadata 的条件。查询本身不会触发 citation 处理。如果结果省略 `url`，或提供空值、非字符串值，ChatGPT 会将该结果保留为普通 tool output。

### Server 示例

试用这个示例 MCP server 的简单方式是使用 [Replit](https://replit.com/)。你可以用自己的 API 凭据和 vector store 信息配置这个示例应用并亲自测试。

<a href="https://replit.com/@kwhinnery-oai/DeepResearchServer?v=1#README.md">
  

<span slot="icon">
      </span>
    Remix Replit 上的 server 示例以进行实时测试。


</a>

为方便起见，下面还提供了 FastMCP 中 `search` 和 `fetch` 两个 tool 的完整实现。

完整实现 - FastMCP server

```python
"""
Sample MCP Server for ChatGPT Integration

This server implements the Model Context Protocol (MCP) with search and fetch
capabilities designed to work with ChatGPT's chat and deep research features.
"""

import logging
import os
from typing import Any

from fastmcp import FastMCP
from openai import OpenAI
from pydantic import BaseModel


class SearchResult(BaseModel):
    id: str
    title: str
    url: str


class SearchOutput(BaseModel):
    results: list[SearchResult]


class FetchOutput(BaseModel):
    id: str
    title: str
    text: str
    url: str
    metadata: dict[str, Any] | None = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI configuration
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
VECTOR_STORE_ID = os.environ.get("VECTOR_STORE_ID", "")

# Initialize OpenAI client
openai_client = OpenAI()

server_instructions = """
This MCP server provides search and document retrieval capabilities
for ChatGPT Apps and deep research. Use the search tool to find relevant documents
based on keywords, then use the fetch tool to retrieve complete
document content with citations.
"""


def create_server():
    """Create and configure the MCP server with search and fetch tools."""

    # Initialize the FastMCP server
    mcp = FastMCP(name="Sample MCP Server",
                  instructions=server_instructions)

    @mcp.tool(output_schema=SearchOutput.model_json_schema())
    async def search(query: str) -> SearchOutput:
        """
        Search for documents using OpenAI Vector Store search.

        This tool searches through the vector store to find semantically relevant matches.
        Returns a list of search results with basic information. Use the fetch tool to get
        complete document content.

        Args:
            query: Search query string. Natural language queries work best for semantic search.

        Returns:
            Dictionary with 'results' key containing list of matching documents.
            Each result includes id, title, and URL.
        """
        if not query or not query.strip():
            return SearchOutput(results=[])

        if not openai_client:
            logger.error("OpenAI client not initialized - API key missing")
            raise ValueError(
                "OpenAI API key is required for vector store search")

        # Search the vector store using OpenAI API
        logger.info(f"Searching {VECTOR_STORE_ID} for query: '{query}'")

        response = openai_client.vector_stores.search(
            vector_store_id=VECTOR_STORE_ID, query=query)

        results = []

        # Process the vector store search results
        if hasattr(response, 'data') and response.data:
            for i, item in enumerate(response.data):
                # Extract file_id, filename, and content
                item_id = getattr(item, 'file_id', f"vs_{i}")
                item_filename = getattr(item, 'filename', f"Document {i+1}")

                result = SearchResult(
                    id=item_id,
                    title=item_filename,
                    url=f"https://platform.openai.com/storage/files/{item_id}",
                )

                results.append(result)

        logger.info(f"Vector store search returned {len(results)} results")
        return SearchOutput(results=results)

    @mcp.tool(output_schema=FetchOutput.model_json_schema())
    async def fetch(id: str) -> FetchOutput:
        """
        Retrieve complete document content by ID for detailed
        analysis and citation. This tool fetches the full document
        content from OpenAI Vector Store. Use this after finding
        relevant documents with the search tool to get complete
        information for analysis and proper citation.

        Args:
            id: File ID from vector store (file-xxx) or local document ID

        Returns:
            Complete document with id, title, full text content,
            optional URL, and metadata

        Raises:
            ValueError: If the specified ID is not found
        """
        if not id:
            raise ValueError("Document ID is required")

        if not openai_client:
            logger.error("OpenAI client not initialized - API key missing")
            raise ValueError(
                "OpenAI API key is required for vector store file retrieval")

        logger.info(f"Fetching content from vector store for file ID: {id}")

        # Fetch file content from vector store
        content_response = openai_client.vector_stores.files.content(
            vector_store_id=VECTOR_STORE_ID, file_id=id)

        # Get file metadata
        file_info = openai_client.vector_stores.files.retrieve(
            vector_store_id=VECTOR_STORE_ID, file_id=id)

        # Extract content from paginated response
        file_content = ""
        if hasattr(content_response, 'data') and content_response.data:
            # Combine all content chunks from FileContentResponse objects
            content_parts = []
            for content_item in content_response.data:
                if hasattr(content_item, 'text'):
                    content_parts.append(content_item.text)
            file_content = "\n".join(content_parts)
        else:
            file_content = "No content available"

        # Use filename as title and create proper URL for citations
        filename = getattr(file_info, 'filename', f"Document {id}")

        result = FetchOutput(
            id=id,
            title=filename,
            text=file_content,
            url=f"https://platform.openai.com/storage/files/{id}",
        )

        # Add metadata if available from file info
        if hasattr(file_info, 'attributes') and file_info.attributes:
            result.metadata = dict(file_info.attributes)

        logger.info(f"Fetched vector store file: {id}")
        return result

    return mcp


def main():
    """Main function to start the MCP server."""
    # Verify OpenAI client is initialized
    if not openai_client:
        logger.error(
            "OpenAI API key not found. Please set OPENAI_API_KEY environment variable."
        )
        raise ValueError("OpenAI API key is required")

    logger.info(f"Using vector store: {VECTOR_STORE_ID}")

    # Create the MCP server
    server = create_server()

    # Configure and start the server
    logger.info("Starting MCP server on 0.0.0.0:8000")
    logger.info("Server will be accessible via SSE transport")

    try:
        # Use FastMCP's built-in run method with SSE transport
        server.run(transport="sse", host="0.0.0.0", port=8000)
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        raise


if __name__ == "__main__":
    main()
```


Replit 设置

在 Replit 上，你需要在 “Secrets” UI 中配置两个环境变量：

- `OPENAI_API_KEY` - 你的标准 OpenAI API key
- `VECTOR_STORE_ID` - 可用于搜索的 vector store 的唯一标识符，也就是你之前创建的那个。

在免费的 Replit 账户上，只要编辑器处于活动状态，server URL 就会保持可用。因此在测试期间，你需要保持浏览器标签页打开。点击链条图标即可获得 MCP server 的 URL：

![replit configuration](https://cdn.openai.com/API/docs/images/replit.png)

在较长的 dev URL 中，确保它以 `/sse/` 结尾，这是 MCP server 的 server-sent events（streaming）接口。你将使用此 URL 在 ChatGPT 中连接你的 app，并通过 API 调用它。Replit URL 示例：

```
https://777xxx.janeway.replit.dev/sse/
```

## 测试并连接你的 MCP server

你可以在 [prompts dashboard](https://platform.openai.com/chat) 中使用 deep research 模型测试 MCP server。新建一个 prompt，或编辑现有 prompt，并向 prompt 配置中添加一个新的 MCP tool。请记住，通过 API 用于 deep research 的 MCP server 必须配置为不需要 approval。

如果你在 ChatGPT 中将此 server 作为 app 测试，请按照 [Connect from ChatGPT](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt) 操作。

![prompts configuration](https://cdn.openai.com/API/docs/images/prompts_mcp.png)

配置 MCP server 后，你可以通过 Prompts UI 使用它与模型聊天。

![prompts chat](https://cdn.openai.com/API/docs/images/chat_prompts_mcp.png)

你可以直接使用 Responses API，通过如下请求测试 MCP server：

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
  "model": "o4-mini-deep-research",
  "input": [
    {
      "role": "developer",
      "content": [
        {
          "type": "input_text",
          "text": "You are a research assistant that searches MCP servers to find answers to your questions."
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Are cats attached to their homes? Give a succinct one page overview."
        }
      ]
    }
  ],
  "reasoning": {
    "summary": "auto"
  },
  "tools": [
    {
      "type": "mcp",
      "server_label": "cats",
      "server_url": "https://777ff573-9947-4b9c-8982-658fa40c7d09-00-3le96u7wsymx.janeway.replit.dev/sse/",
      "allowed_tools": [
        "search",
        "fetch"
      ],
      "require_approval": "never"
    }
  ]
}'
```


### 处理身份验证

作为自定义远程 MCP server 的构建者，授权和身份验证可以帮助你保护数据。我们建议在 authorization server 支持 CIMD 且 connector creator 选择 CIMD 时，使用 OAuth 搭配 [Client ID Metadata Documents](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#client-id-metadata-documents) 进行 client registration。ChatGPT 支持 CIMD，并支持 public-client token exchange (`none`) 或 signed client assertion token exchange (`private_key_jwt`)。在配置后，dynamic client registration 仍然受支持。关于 ChatGPT app auth 要求，请参阅 [Authentication](https://developers.openai.com/apps-sdk/build/auth)。关于协议细节，请阅读 [MCP user guide](https://modelcontextprotocol.io/docs/concepts/transports#authentication-and-authorization) 或 [authorization specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)。

如果你在 ChatGPT 中将自定义远程 MCP server 作为 app 连接，你 workspace 中的用户将获得指向你应用的 OAuth flow。

### 在 ChatGPT 中连接

1. 在 [ChatGPT settings](https://chatgpt.com/#settings) 中导入你的远程 MCP server。
1. 使用你的 server URL，在 **Apps & Connectors** 中创建并配置你的 app。
1. 通过在聊天和 deep research 中运行 prompts 来测试你的 app。

有关详细设置步骤，请参阅 [Connect from ChatGPT](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt)。

## 风险与安全

自定义 MCP server 可以把你的 ChatGPT workspace 连接到外部应用，使 ChatGPT 能够在这些应用中访问、发送和接收数据。请注意，自定义 MCP server 不是由 OpenAI 开发或验证的，而是受其自身条款和条件约束的第三方服务。

如果你发现恶意 MCP server，请向 security@openai.com 报告。

### Prompt injection 相关风险

Prompt injection 是一种攻击形式，攻击者会把恶意指令嵌入到我们的模型可能遇到的内容中（例如网页），意图让这些指令覆盖 ChatGPT 的预期行为。如果模型遵从了注入的指令，就可能采取用户和开发者从未打算执行的操作，包括把私有数据发送到外部目的地。

例如，你可能要求 ChatGPT 通过查看你的日历和近期邮件来为一群人寻找聚餐餐厅。在研究过程中，它可能遇到一条恶意评论，本质上是一段有害内容，旨在诱骗 agent 执行非预期操作，例如指示它从 Gmail 取回密码重置代码并发送到恶意网站。

下面是一张列出具体场景的表格，供你参考。我们建议仔细审阅该表，以帮助你判断是否使用自定义 MCP。

| 场景 / 风险                                                                                                                                                                                                                                                                                                                                                                                                                            | 如果我信任 MCP 的开发者，这是否安全？                                                                                                                                                                                                                                                       | 我可以如何降低风险？                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 攻击者可能以某种方式将 prompt injection 攻击插入可通过 MCP 访问的数据中。 <br /><br />_示例：_<br />• 对于客户支持 MCP，攻击者可以向你发送一条包含 prompt injection 攻击的客户支持请求。                                                                                                                                                                                                 | 信任 MCP 的开发者并不会让这种情况变得安全。<br /><br />要让这种情况安全，你需要信任 _MCP 内可访问的所有内容_。                                                                                                                                          | • 如果某个 MCP 可能包含恶意或不受信任的用户输入，即使你信任该 MCP 的开发者，也不要使用它。<br />• 配置访问权限，尽量减少能够访问该 MCP 的人数。                                                                                                                              |
| 恶意 MCP 可能会为读取或写入 action 请求过多参数。 <br /><br />_示例：_<br />• 员工航班预订 MCP 可能暴露一个读取 action 用于获取航班时刻表，但请求参数却包括 `summaryOfConversation`、`userAnnualIncome`、`userHomeAddress`。                                                                                                                                             | 信任 MCP 的开发者并不一定会让这种情况安全。<br /><br />MCP 的开发者可能认为请求某些数据是合理的，但你并不认为这些数据可以共享。                                                                                              | • 侧载 MCP 时，请仔细审阅每个 action 请求的参数，确保不存在隐私越界。                                                                                                                                                                                             |
| 攻击者可能使用 prompt injection 攻击诱骗 ChatGPT 从自定义 MCP 获取敏感数据，然后将其发送给攻击者。 <br /><br />_示例：_<br />• 攻击者可能通过另一个 MCP（例如邮件）向某个企业用户投递 prompt injection 攻击，该攻击试图诱骗 ChatGPT 从某个内部工具 MCP 读取敏感数据，然后尝试将其外泄。 | 信任 MCP 的开发者并不会让这种情况安全。<br /><br />新 MCP 内的一切都可能是安全且可信的，因为风险来自不同恶意来源发起的攻击导致这些数据被盗。                                                                             | • _ChatGPT 旨在保护用户_，但攻击者可能尝试窃取你的数据，因此请了解风险，并考虑是否值得承担。<br />• 配置访问权限，尽量减少能够访问包含特别敏感数据的 MCP 的人数。                                                          |
| 攻击者可能使用 prompt injection 攻击，通过自定义 MCP 的写入 action 外泄敏感信息。 <br /><br />_示例：_<br />• 攻击者使用 prompt injection 攻击（通过另一个 MCP）诱骗 ChatGPT 获取敏感数据，然后通过诱骗 ChatGPT 使用某个客户支持系统 MCP 将其发送给攻击者来外泄数据。                                             | 信任 MCP 的开发者并不会让这种情况安全。<br /><br />即使你完全信任该 MCP，只要写入 action 产生的任何后果能被攻击者观察到，他们就可能尝试利用它。                                                                          | • 用户应在写入 action 发生时仔细审阅，确保它们确实是预期操作，且不包含不应共享的数据。                                                                                                                                                                            |
| 攻击者可能使用 prompt injection 攻击，通过恶意自定义 MCP 的读取 action 外泄敏感信息（因为这些内容可能被 MCP 记录日志）。                                                                                                                                                                                                                                                                  | 只有当 MCP 是恶意的，或 MCP 错误地将写入 action 标记为读取 action 时，这种攻击才会奏效。<br /><br />如果你信任 MCP 的开发者会正确地只把读取 action 标记为 _read_，并信任该开发者不会尝试窃取数据，那么该风险可能较低。 | • 只使用来自你信任的开发者的 MCP（但请注意，仅这一点并不足以让它变得安全）。                                                                                                                                                                                                                            |
| 攻击者可能使用 prompt injection 攻击诱骗 ChatGPT 通过自定义 MCP 执行用户并不想要的有害或破坏性写入 action。                                                                                                                                                                                                                                                                               | 信任 MCP 的开发者并不会让这种情况安全。<br /><br />新 MCP 内的一切都可能是安全且可信的，但这种风险仍然存在，因为攻击来自不同的恶意来源。                                                                                     | • 用户应仔细审阅写入 action，确保它们是预期且正确的。<br />• ChatGPT 旨在保护用户，但攻击者可能尝试诱骗 ChatGPT 执行非预期写入 action。<br />• 配置访问权限，尽量减少能够访问包含特别敏感数据的 MCP 的人数。 |

### 非 prompt injection 相关风险

自定义 MCP 还存在与 prompt injection 攻击无关的其他风险：

- **写入 action 会同时增加 MCP server 的有用性和风险**，因为它们让 server 可能执行破坏性操作，而不只是把信息返回给 ChatGPT。ChatGPT 目前要求在任何对话中，执行写入 action 前都必须手动确认。确认界面会标记潜在敏感数据，但你应只在已经仔细考虑并接受 ChatGPT 可能在此类 action 中出错的情况下使用写入 action。即使 MCP server 已将 action 标记为 read only，写入 action 仍可能发生，因此在部署到 ChatGPT 前信任自定义 MCP server 变得更加重要。
- **任何 MCP server 都可能在查询过程中接收敏感数据**。即使 server 并非恶意，它也能访问 ChatGPT 在交互期间提供给它的任何数据，其中可能包括用户此前提供给 ChatGPT 的敏感数据。例如，当 ChatGPT 使用 deep research 或 chat app tools 时，这类数据可能被包含在 ChatGPT 发送给 MCP server 的查询中。

### 连接可信 server

我们建议，除非你了解并信任底层应用，否则不要连接到自定义 MCP server。

例如，应始终选择由服务提供商自己托管的官方 server（例如连接到 Stripe 自己在 mcp.stripe.com 托管的 Stripe server，而不是由第三方托管的非官方 Stripe MCP server）。由于目前官方 MCP server 并不多，你可能会想使用由并不运营该服务的组织托管、只是通过 API 代理请求到该服务的 MCP server。不建议这样做；只有在你仔细审阅其如何使用你的数据，并验证你可以信任该 server 后，才应连接到 MCP。构建并连接你自己的 MCP server 时，请再次确认它确实是正确的 server。请非常谨慎地处理你在响应 MCP server 请求时提供的数据，以及 OpenAI 调用你的 MCP server 时发送给你的数据。

你的远程 MCP server 允许其他人把 OpenAI 连接到你的服务，并允许 OpenAI 访问、发送和接收数据，以及在这些服务中采取行动。请避免在 tools 的 JSON 中放入任何敏感信息，也避免存储访问你的远程 MCP server 的 ChatGPT 用户的任何敏感信息。

作为 MCP server 的构建者，不要在 tool definitions 中放入任何恶意内容。
