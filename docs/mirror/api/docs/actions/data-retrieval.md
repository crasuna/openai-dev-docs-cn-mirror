---
title: "Data retrieval with GPT Actions"
description: "Learn about performing data retrieval using APIs, relational databases, and vector databases with GPT Actions."
outline: deep
---

# Data retrieval with GPT Actions

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/actions/data-retrieval](https://developers.openai.com/api/docs/actions/data-retrieval)
- Markdown 来源：[https://developers.openai.com/api/docs/actions/data-retrieval.md](https://developers.openai.com/api/docs/actions/data-retrieval.md)
- 抓取时间：2026-06-27T05:53:55.905Z
- Checksum：`3f4e95d1740ba34406ca8e309114f86906c24616928cea71dcbf6e1940fc0332`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
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

:::

## English source

::: details 展开英文原文
::: v-pre
One of the most common tasks an action in a GPT can perform is data retrieval. An action might:

1. Access an API to retrieve data based on a keyword search
2. Access a relational database to retrieve records based on a structured query
3. Access a vector database to retrieve text chunks based on semantic search

We’ll explore considerations specific to the various types of retrieval integrations in this guide.

## Data retrieval using APIs

Many organizations rely on 3rd party software to store important data. Think Salesforce for customer data, Zendesk for support data, Confluence for internal process data, and Google Drive for business documents. These providers often provide REST APIs which enable external systems to search for and retrieve information.

When building an action to integrate with a provider's REST API, start by reviewing the existing documentation. You’ll need to confirm a few things:

1. Retrieval methods
   - **Search** - Each provider will support different search semantics, but generally you want a method which takes a keyword or query string and returns a list of matching documents. See [Google Drive’s `file.list` method](https://developers.google.com/drive/api/guides/search-files) for an example.
   - **Get** - Once you’ve found matching documents, you need a way to retrieve them. See [Google Drive’s `file.get` method](https://developers.google.com/drive/api/reference/rest/v3/files/get) for an example.
2. Authentication scheme
   - For example, [Google Drive uses OAuth](https://developers.google.com/workspace/guides/configure-oauth-consent) to authenticate users and ensure that only their available files are available for retrieval.
3. OpenAPI spec
   - Some providers will provide an OpenAPI spec document which you can import directly into your action. See [Zendesk](https://developer.zendesk.com/api-reference/ticketing/introduction/#download-openapi-file), for an example.
     - You may want to remove references to methods your GPT _won’t_ access, which constrains the actions your GPT can perform.
   - For providers who _don’t_ provide an OpenAPI spec document, you can create your own using the [ActionsGPT](https://chatgpt.com/g/g-TYEliDU6A-actionsgpt) (a GPT developed by OpenAI).

Your goal is to get the GPT to use the action to search for and retrieve documents containing context which are relevant to the user’s prompt. Your GPT follows your instructions to use the provided search and get methods to achieve this goal.

## Data retrieval using Relational Databases

Organizations use relational databases to store a variety of records pertaining to their business. These records can contain useful context that will help improve your GPT’s responses. For example, let’s say you are building a GPT to help users understand the status of an insurance claim. If the GPT can look up claims in a relational database based on a claims number, the GPT will be much more useful to the user.

When building an action to integrate with a relational database, there are a few things to keep in mind:

1. Availability of REST APIs
   - Many relational databases do not natively expose a REST API for processing queries. In that case, you may need to build or buy middleware which can sit between your GPT and the database.
   - This middleware should do the following:
     - Accept a formal query string
     - Pass the query string to the database
     - Respond back to the requester with the returned records
2. Accessibility from the public internet
   - Unlike APIs which are designed to be accessed from the public internet, relational databases are traditionally designed to be used within an organization’s application infrastructure. Because GPTs are hosted on OpenAI’s infrastructure, you’ll need to make sure that any APIs you expose are accessible outside of your firewall.
3. Complex query strings
   - Relational databases uses formal query syntax like SQL to retrieve relevant records. This means that you need to provide additional instructions to the GPT indicating which query syntax is supported. The good news is that GPTs are usually very good at generating formal queries based on user input.
4. Database permissions
   - Although databases support user-level permissions, it is likely that your end users won’t have permission to access the database directly. If you opt to use a service account to provide access, consider giving the service account read-only permissions. This can avoid inadvertently overwriting or deleting existing data.

Your goal is to get the GPT to write a formal query related to the user’s prompt, submit the query via the action, and then use the returned records to augment the response.

## Data retrieval using Vector Databases

If you want to equip your GPT with the most relevant search results, you might consider integrating your GPT with a vector database which supports semantic search as described above. There are many managed and self hosted solutions available on the market, [see here for a partial list](https://github.com/openai/chatgpt-retrieval-plugin#choosing-a-vector-database).

When building an action to integrate with a vector database, there are a few things to keep in mind:

1. Availability of REST APIs
   - Many relational databases do not natively expose a REST API for processing queries. In that case, you may need to build or buy middleware which can sit between your GPT and the database (more on middleware below).
2. Accessibility from the public internet
   - Unlike APIs which are designed to be accessed from the public internet, relational databases are traditionally designed to be used within an organization’s application infrastructure. Because GPTs are hosted on OpenAI’s infrastructure, you’ll need to make sure that any APIs you expose are accessible outside of your firewall.
3. Query embedding
   - As discussed above, vector databases typically accept a vector embedding (as opposed to plain text) as query input. This means that you need to use an embedding API to convert the query input into a vector embedding before you can submit it to the vector database. This conversion is best handled in the REST API gateway, so that the GPT can submit a plaintext query string.
4. Database permissions
   - Because vector databases store text chunks as opposed to full documents, it can be difficult to maintain user permissions which might have existed on the original source documents. Remember that any user who can access your GPT will have access to all of the text chunks in the database and plan accordingly.

### Middleware for vector databases

As described above, middleware for vector databases typically needs to do two things:

1. Expose access to the vector database via a REST API
2. Convert plaintext query strings into vector embeddings

![Middleware for vector databases](https://cdn.openai.com/API/docs/images/actions-db-diagram.webp)

The goal is to get your GPT to submit a relevant query to a vector database to trigger a semantic search, and then use the returned text chunks to augment the response.

:::
:::

