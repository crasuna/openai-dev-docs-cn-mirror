---
status: needs-review
sourceId: "3f4e95d1740b"
sourceChecksum: "3f4e95d1740ba34406ca8e309114f86906c24616928cea71dcbf6e1940fc0332"
sourceUrl: "https://developers.openai.com/api/docs/actions/data-retrieval"
translatedAt: "2026-06-27T17:30:14.9009790+08:00"
translator: codex-gpt-5.5-xhigh
---

# 使用 GPT Actions 进行数据检索

GPT 中的 action 最常见的任务之一是数据检索。一个 action 可能会：

1. 访问 API，根据关键词搜索检索数据
2. 访问关系型数据库，根据结构化查询检索记录
3. 访问向量数据库，根据语义搜索检索文本片段

本指南将探讨各类检索集成特有的注意事项。

## 使用 API 进行数据检索

许多组织依赖第三方软件来存储重要数据。例如，用 Salesforce 存储客户数据，用 Zendesk 存储支持数据，用 Confluence 存储内部流程数据，用 Google Drive 存储业务文档。这些提供商通常会提供 REST API，使外部系统能够搜索和检索信息。

在构建 action 以集成提供商的 REST API 时，先查看现有文档。你需要确认几件事：

1. 检索方法
   - **Search** - 每个提供商支持的搜索语义会有所不同，但通常你需要一种方法，它接收关键词或查询字符串，并返回匹配文档列表。可参考 [Google Drive 的 `file.list` 方法](https://developers.google.com/drive/api/guides/search-files)作为示例。
   - **Get** - 找到匹配文档后，你需要一种方法来检索这些文档。可参考 [Google Drive 的 `file.get` 方法](https://developers.google.com/drive/api/reference/rest/v3/files/get)作为示例。
2. 身份验证方案
   - 例如，[Google Drive 使用 OAuth](https://developers.google.com/workspace/guides/configure-oauth-consent) 来验证用户身份，并确保只有用户可用的文件能够被检索。
3. OpenAPI spec
   - 一些提供商会提供 OpenAPI spec 文档，你可以直接将其导入到 action 中。可参考 [Zendesk](https://developer.zendesk.com/api-reference/ticketing/introduction/#download-openapi-file)作为示例。
     - 你可能希望移除对 GPT _不会_ 访问的方法的引用，这会约束 GPT 可执行的 action。
   - 对于_不_提供 OpenAPI spec 文档的提供商，你可以使用 [ActionsGPT](https://chatgpt.com/g/g-TYEliDU6A-actionsgpt)（由 OpenAI 开发的 GPT）自行创建。

你的目标是让 GPT 使用 action 来搜索并检索包含上下文的文档，这些上下文与用户的 prompt 相关。GPT 会遵循你的指令，使用所提供的 search 和 get 方法来实现这个目标。

## 使用关系型数据库进行数据检索

组织会使用关系型数据库来存储与业务相关的各类记录。这些记录可能包含有用的上下文，有助于改进 GPT 的响应。例如，假设你正在构建一个 GPT，帮助用户了解保险理赔的状态。如果 GPT 可以根据理赔编号在关系型数据库中查找理赔记录，那么它对用户会有用得多。

在构建 action 以集成关系型数据库时，有几件事需要注意：

1. REST API 的可用性
   - 许多关系型数据库不会原生暴露用于处理查询的 REST API。在这种情况下，你可能需要构建或购买中间件，让它位于 GPT 和数据库之间。
   - 该中间件应执行以下操作：
     - 接收正式查询字符串
     - 将查询字符串传递给数据库
     - 将返回的记录响应给请求方
2. 公网可访问性
   - 与设计为从公网访问的 API 不同，关系型数据库传统上设计为在组织的应用基础设施内部使用。由于 GPT 托管在 OpenAI 的基础设施上，你需要确保你暴露的任何 API 都可以从防火墙外部访问。
3. 复杂查询字符串
   - 关系型数据库使用 SQL 等正式查询语法来检索相关记录。这意味着你需要向 GPT 提供额外指令，说明支持哪种查询语法。好消息是，GPT 通常非常擅长根据用户输入生成正式查询。
4. 数据库权限
   - 尽管数据库支持用户级权限，但你的最终用户很可能没有直接访问数据库的权限。如果你选择使用服务账户提供访问权限，请考虑为该服务账户授予只读权限。这可以避免无意中覆盖或删除现有数据。

你的目标是让 GPT 编写与用户 prompt 相关的正式查询，通过 action 提交查询，然后使用返回的记录来增强响应。

## 使用向量数据库进行数据检索

如果你想为 GPT 配备最相关的搜索结果，可以考虑将 GPT 与支持上述语义搜索的向量数据库集成。市场上有许多托管和自托管方案，[这里有一个不完整列表](https://github.com/openai/chatgpt-retrieval-plugin#choosing-a-vector-database)。

在构建 action 以集成向量数据库时，有几件事需要注意：

1. REST API 的可用性
   - 许多关系型数据库不会原生暴露用于处理查询的 REST API。在这种情况下，你可能需要构建或购买中间件，让它位于 GPT 和数据库之间（下面会进一步说明中间件）。
2. 公网可访问性
   - 与设计为从公网访问的 API 不同，关系型数据库传统上设计为在组织的应用基础设施内部使用。由于 GPT 托管在 OpenAI 的基础设施上，你需要确保你暴露的任何 API 都可以从防火墙外部访问。
3. 查询 embedding
   - 如上所述，向量数据库通常接收向量 embedding（而不是纯文本）作为查询输入。这意味着你需要先使用 embedding API 将查询输入转换为向量 embedding，然后才能将其提交给向量数据库。这个转换最好在 REST API 网关中处理，这样 GPT 就可以提交纯文本查询字符串。
4. 数据库权限
   - 由于向量数据库存储的是文本片段，而不是完整文档，因此可能很难保留原始源文档上已有的用户权限。请记住，任何可以访问你的 GPT 的用户都将能够访问数据库中的全部文本片段，并据此规划。

### 向量数据库中间件

如上所述，向量数据库中间件通常需要做两件事：

1. 通过 REST API 暴露对向量数据库的访问
2. 将纯文本查询字符串转换为向量 embedding

![向量数据库中间件](https://cdn.openai.com/API/docs/images/actions-db-diagram.webp)

目标是让你的 GPT 向向量数据库提交相关查询以触发语义搜索，然后使用返回的文本片段来增强响应。
