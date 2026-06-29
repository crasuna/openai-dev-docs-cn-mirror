---
title: "文件搜索"
description: "Allow models to search your files for relevant information before generating a response."
outline: deep
---

# 文件搜索

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/tools-file-search](https://developers.openai.com/api/docs/guides/tools-file-search)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/tools-file-search.md](https://developers.openai.com/api/docs/guides/tools-file-search.md)
- 抓取时间：2026-06-27T05:54:10.345Z
- Checksum：`66796728b890b3076b83fdf67a586b05fa27a2336eb2dd68f11a262f64f52a58`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
文件搜索（File Search）是 [Responses API](https://developers.openai.com/api/docs/api-reference/responses) 中可用的工具。
它让模型能够通过语义搜索和关键词搜索，在先前上传文件构成的知识库中检索信息。
通过创建向量存储（vector stores）并向其中上传文件，你可以让模型访问这些知识库或 `vector_stores`，从而增强模型的固有知识。

要进一步了解向量存储和语义搜索的工作方式，请参阅我们的
  [检索指南](/mirror/api/docs/guides/retrieval)。

这是由 OpenAI 管理的托管工具，也就是说，你不必在自己这端实现代码来处理它的执行。
当模型决定使用它时，它会自动调用该工具，从你的文件中检索信息，并返回输出。

## 如何使用

在通过 Responses API 使用文件搜索之前，你需要先在向量存储中设置好知识库，并向其中上传文件。

创建向量存储并上传文件

按照以下步骤创建向量存储并向其中上传文件。你可以使用[这个示例文件](https://cdn.openai.com/API/docs/deep_research_blog.pdf)，也可以上传自己的文件。

#### 将文件上传到 File API

上传文件

```python
import requests
from io import BytesIO
from openai import OpenAI

client = OpenAI()

def create_file(client, file_path):
    if file_path.startswith("http://") or file_path.startswith("https://"):
        # Download the file content from the URL
        response = requests.get(file_path)
        file_content = BytesIO(response.content)
        file_name = file_path.split("/")[-1]
        file_tuple = (file_name, file_content)
        result = client.files.create(
            file=file_tuple,
            purpose="assistants"
        )
    else:
        # Handle local file path
        with open(file_path, "rb") as file_content:
            result = client.files.create(
                file=file_content,
                purpose="assistants"
            )
    print(result.id)
    return result.id

# Replace with your own file path or URL
file_id = create_file(client, "https://cdn.openai.com/API/docs/deep_research_blog.pdf")
```

```javascript
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI();

async function createFile(filePath) {
  let result;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    // Download the file content from the URL
    const res = await fetch(filePath);
    const buffer = await res.arrayBuffer();
    const urlParts = filePath.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const file = new File([buffer], fileName);
    result = await openai.files.create({
      file: file,
      purpose: "assistants",
    });
  } else {
    // Handle local file path
    const fileContent = fs.createReadStream(filePath);
    result = await openai.files.create({
      file: fileContent,
      purpose: "assistants",
    });
  }
  return result.id;
}

// Replace with your own file path or URL
const fileId = await createFile(
  "https://cdn.openai.com/API/docs/deep_research_blog.pdf"
);

console.log(fileId);
```


#### 创建向量存储

创建向量存储

```python
vector_store = client.vector_stores.create(
    name="knowledge_base"
)
print(vector_store.id)
```

```javascript
const vectorStore = await openai.vectorStores.create({
    name: "knowledge_base",
});
console.log(vectorStore.id);
```


#### 将文件添加到向量存储

将文件添加到向量存储

```python
result = client.vector_stores.files.create(
    vector_store_id=vector_store.id,
    file_id=file_id
)
print(result)
```

```javascript
await openai.vectorStores.files.create(
    vectorStore.id,
    {
        file_id: fileId,
    }
});
```


#### 检查状态

运行这段代码，直到文件已经可供使用（即状态为 `completed`）。

检查状态

```python
result = client.vector_stores.files.list(
    vector_store_id=vector_store.id
)
print(result)
```

```javascript
const result = await openai.vectorStores.files.list({
    vector_store_id: vectorStore.id,
});
console.log(result);
```


知识库设置完成后，你可以在可供模型使用的工具列表中包含 `file_search` 工具，并同时提供要搜索的向量存储列表。

文件搜索工具

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }]
)
print(response)
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "What is deep research by OpenAI?",
    tools: [
        {
            type: "file_search",
            vector_store_ids: ["<vector_store_id>"],
        },
    ],
});
console.log(response);
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateFileSearchTool(["<vector_store_id>"]));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is deep research by OpenAI?"),
    ]),
], options);

Console.WriteLine(response.GetOutputText());
```


当模型调用此工具时，你会收到包含多个输出的响应：

1. 一个 `file_search_call` 输出项，其中包含文件搜索调用的 id。
2. 一个 `message` 输出项，其中包含模型响应以及文件引用。

文件搜索响应

```json
{
  "output": [
    {
      "type": "file_search_call",
      "id": "fs_67c09ccea8c48191ade9367e3ba71515",
      "status": "completed",
      "queries": ["What is deep research?"],
      "search_results": null
    },
    {
      "id": "msg_67c09cd3091c819185af2be5d13d87de",
      "type": "message",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "Deep research is a sophisticated capability that allows for extensive inquiry and synthesis of information across various domains. It is designed to conduct multi-step research tasks, gather data from multiple online sources, and provide comprehensive reports similar to what a research analyst would produce. This functionality is particularly useful in fields requiring detailed and accurate information...",
          "annotations": [
            {
              "type": "file_citation",
              "index": 992,
              "file_id": "file-2dtbBZdjtDKS8eqWxqbgDi",
              "filename": "deep_research_blog.pdf"
            },
            {
              "type": "file_citation",
              "index": 992,
              "file_id": "file-2dtbBZdjtDKS8eqWxqbgDi",
              "filename": "deep_research_blog.pdf"
            },
            {
              "type": "file_citation",
              "index": 1176,
              "file_id": "file-2dtbBZdjtDKS8eqWxqbgDi",
              "filename": "deep_research_blog.pdf"
            },
            {
              "type": "file_citation",
              "index": 1176,
              "file_id": "file-2dtbBZdjtDKS8eqWxqbgDi",
              "filename": "deep_research_blog.pdf"
            }
          ]
        }
      ]
    }
  ]
}
```


## 检索自定义

### 限制结果数量

通过 Responses API 使用文件搜索工具时，你可以自定义想要从向量存储中检索的结果数量。这有助于同时减少 token 使用量和延迟，但可能会以回答质量下降为代价。

限制结果数量

```python
response = client.responses.create(
    model="gpt-5.5",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"],
        // highlight-start
        "max_num_results": 2
        // highlight-end
    }]
)
print(response)
```

```javascript
const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "What is deep research by OpenAI?",
    tools: [{
        type: "file_search",
        vector_store_ids: ["<vector_store_id>"],
        // highlight-start
        max_num_results: 2,
        // highlight-end
    }],
});
console.log(response);
```


### 在响应中包含搜索结果

虽然你可以在输出文本中看到注解（annotations，即对文件的引用），但文件搜索调用默认不会返回搜索结果。

要在响应中包含搜索结果，可以在创建响应时使用 `include` 参数。

包含搜索结果

```python
response = client.responses.create(
    model="gpt-5.5",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }],
    // highlight-start
    include=["file_search_call.results"]
    // highlight-end
)
print(response)
```

```javascript
const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "What is deep research by OpenAI?",
    tools: [{
        type: "file_search",
        vector_store_ids: ["<vector_store_id>"],
    }],
    // highlight-start
    include: ["file_search_call.results"],
    // highlight-end
});
console.log(response);
```


### 元数据筛选

你可以根据文件的元数据筛选搜索结果。更多细节请参阅我们的[检索指南](/mirror/api/docs/guides/retrieval)，其中涵盖：

- 如何[在向量存储文件上设置属性（attributes）](/mirror/api/docs/guides/retrieval#attributes)
- 如何[定义筛选器（filters）](/mirror/api/docs/guides/retrieval#attribute-filtering)

元数据筛选

```python
response = client.responses.create(
    model="gpt-5.5",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"],
        // highlight-start
        "filters": {
            "type": "in",
            "key": "category",
            "value": ["blog", "announcement"]
        }
        // highlight-end
    }]
)
print(response)
```

```javascript
const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "What is deep research by OpenAI?",
    tools: [{
        type: "file_search",
        vector_store_ids: ["<vector_store_id>"],
        // highlight-start
        filters: {
            type: "in",
            key: "category",
            value: ["blog", "announcement"]
        }
        // highlight-end
    }]
});
console.log(response);
```


## 支持的文件

_对于 `text/` MIME 类型，编码必须是 `utf-8`、`utf-16` 或 `ascii` 之一。_



| 文件格式 | MIME 类型                                                                   |
| ----------- | --------------------------------------------------------------------------- |
| `.c`        | `text/x-c`                                                                  |
| `.cpp`      | `text/x-c++`                                                                |
| `.cs`       | `text/x-csharp`                                                             |
| `.css`      | `text/css`                                                                  |
| `.doc`      | `application/msword`                                                        |
| `.docx`     | `application/vnd.openxmlformats-officedocument.wordprocessingml.document`   |
| `.go`       | `text/x-golang`                                                             |
| `.html`     | `text/html`                                                                 |
| `.java`     | `text/x-java`                                                               |
| `.js`       | `text/javascript`                                                           |
| `.json`     | `application/json`                                                          |
| `.md`       | `text/markdown`                                                             |
| `.pdf`      | `application/pdf`                                                           |
| `.php`      | `text/x-php`                                                                |
| `.pptx`     | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `.py`       | `text/x-python`                                                             |
| `.py`       | `text/x-script.python`                                                      |
| `.rb`       | `text/x-ruby`                                                               |
| `.sh`       | `application/x-sh`                                                          |
| `.tex`      | `text/x-tex`                                                                |
| `.ts`       | `application/typescript`                                                    |
| `.txt`      | `text/plain`                                                                |

## 使用说明





API 可用性
速率限制
备注





    [Responses](https://developers.openai.com/api/docs/api-reference/responses)


    [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat)


    [Assistants](https://developers.openai.com/api/docs/api-reference/assistants)



**Tier 1**&lt;br/&gt;
100 RPM

**Tier 2 和 3**&lt;br/&gt;
500 RPM

**Tier 4 和 5**&lt;br/&gt;
1000 RPM



[定价](/mirror/api/docs/pricing#built-in-tools) &lt;br/&gt;
[ZDR 和数据驻留](/mirror/api/docs/guides/your-data)






:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
File search is a tool available in the [Responses API](https://developers.openai.com/api/docs/api-reference/responses).
It enables models to retrieve information in a knowledge base of previously uploaded files through semantic and keyword search.
By creating vector stores and uploading files to them, you can augment the models' inherent knowledge by giving them access to these knowledge bases or `vector_stores`.

To learn more about how vector stores and semantic search work, refer to our
  [retrieval guide](https://developers.openai.com/api/docs/guides/retrieval).

This is a hosted tool managed by OpenAI, meaning you don't have to implement code on your end to handle its execution.
When the model decides to use it, it will automatically call the tool, retrieve information from your files, and return an output.

## How to use

Prior to using file search with the Responses API, you need to have set up a knowledge base in a vector store and uploaded files to it.

Create a vector store and upload a file

Follow these steps to create a vector store and upload a file to it. You can use [this example file](https://cdn.openai.com/API/docs/deep_research_blog.pdf) or upload your own.

#### Upload the file to the File API

Upload a file

```python
import requests
from io import BytesIO
from openai import OpenAI

client = OpenAI()

def create_file(client, file_path):
    if file_path.startswith("http://") or file_path.startswith("https://"):
        # Download the file content from the URL
        response = requests.get(file_path)
        file_content = BytesIO(response.content)
        file_name = file_path.split("/")[-1]
        file_tuple = (file_name, file_content)
        result = client.files.create(
            file=file_tuple,
            purpose="assistants"
        )
    else:
        # Handle local file path
        with open(file_path, "rb") as file_content:
            result = client.files.create(
                file=file_content,
                purpose="assistants"
            )
    print(result.id)
    return result.id

# Replace with your own file path or URL
file_id = create_file(client, "https://cdn.openai.com/API/docs/deep_research_blog.pdf")
```

```javascript
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI();

async function createFile(filePath) {
  let result;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    // Download the file content from the URL
    const res = await fetch(filePath);
    const buffer = await res.arrayBuffer();
    const urlParts = filePath.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const file = new File([buffer], fileName);
    result = await openai.files.create({
      file: file,
      purpose: "assistants",
    });
  } else {
    // Handle local file path
    const fileContent = fs.createReadStream(filePath);
    result = await openai.files.create({
      file: fileContent,
      purpose: "assistants",
    });
  }
  return result.id;
}

// Replace with your own file path or URL
const fileId = await createFile(
  "https://cdn.openai.com/API/docs/deep_research_blog.pdf"
);

console.log(fileId);
```


#### Create a vector store

Create a vector store

```python
vector_store = client.vector_stores.create(
    name="knowledge_base"
)
print(vector_store.id)
```

```javascript
const vectorStore = await openai.vectorStores.create({
    name: "knowledge_base",
});
console.log(vectorStore.id);
```


#### Add the file to the vector store

Add a file to a vector store

```python
result = client.vector_stores.files.create(
    vector_store_id=vector_store.id,
    file_id=file_id
)
print(result)
```

```javascript
await openai.vectorStores.files.create(
    vectorStore.id,
    {
        file_id: fileId,
    }
});
```


#### Check status

Run this code until the file is ready to be used (i.e., when the status is `completed`).

Check status

```python
result = client.vector_stores.files.list(
    vector_store_id=vector_store.id
)
print(result)
```

```javascript
const result = await openai.vectorStores.files.list({
    vector_store_id: vectorStore.id,
});
console.log(result);
```


Once your knowledge base is set up, you can include the `file_search` tool in the list of tools available to the model, along with the list of vector stores in which to search.

File search tool

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }]
)
print(response)
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "What is deep research by OpenAI?",
    tools: [
        {
            type: "file_search",
            vector_store_ids: ["<vector_store_id>"],
        },
    ],
});
console.log(response);
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateFileSearchTool(["<vector_store_id>"]));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is deep research by OpenAI?"),
    ]),
], options);

Console.WriteLine(response.GetOutputText());
```


When this tool is called by the model, you will receive a response with multiple outputs:

1. A `file_search_call` output item, which contains the id of the file search call.
2. A `message` output item, which contains the response from the model, along with the file citations.

File search response

```json
{
  "output": [
    {
      "type": "file_search_call",
      "id": "fs_67c09ccea8c48191ade9367e3ba71515",
      "status": "completed",
      "queries": ["What is deep research?"],
      "search_results": null
    },
    {
      "id": "msg_67c09cd3091c819185af2be5d13d87de",
      "type": "message",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "Deep research is a sophisticated capability that allows for extensive inquiry and synthesis of information across various domains. It is designed to conduct multi-step research tasks, gather data from multiple online sources, and provide comprehensive reports similar to what a research analyst would produce. This functionality is particularly useful in fields requiring detailed and accurate information...",
          "annotations": [
            {
              "type": "file_citation",
              "index": 992,
              "file_id": "file-2dtbBZdjtDKS8eqWxqbgDi",
              "filename": "deep_research_blog.pdf"
            },
            {
              "type": "file_citation",
              "index": 992,
              "file_id": "file-2dtbBZdjtDKS8eqWxqbgDi",
              "filename": "deep_research_blog.pdf"
            },
            {
              "type": "file_citation",
              "index": 1176,
              "file_id": "file-2dtbBZdjtDKS8eqWxqbgDi",
              "filename": "deep_research_blog.pdf"
            },
            {
              "type": "file_citation",
              "index": 1176,
              "file_id": "file-2dtbBZdjtDKS8eqWxqbgDi",
              "filename": "deep_research_blog.pdf"
            }
          ]
        }
      ]
    }
  ]
}
```


## Retrieval customization

### Limiting the number of results

Using the file search tool with the Responses API, you can customize the number of results you want to retrieve from the vector stores. This can help reduce both token usage and latency, but may come at the cost of reduced answer quality.

Limit the number of results

```python
response = client.responses.create(
    model="gpt-5.5",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"],
        // highlight-start
        "max_num_results": 2
        // highlight-end
    }]
)
print(response)
```

```javascript
const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "What is deep research by OpenAI?",
    tools: [{
        type: "file_search",
        vector_store_ids: ["<vector_store_id>"],
        // highlight-start
        max_num_results: 2,
        // highlight-end
    }],
});
console.log(response);
```


### Include search results in the response

While you can see annotations (references to files) in the output text, the file search call will not return search results by default.

To include search results in the response, you can use the `include` parameter when creating the response.

Include search results

```python
response = client.responses.create(
    model="gpt-5.5",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }],
    // highlight-start
    include=["file_search_call.results"]
    // highlight-end
)
print(response)
```

```javascript
const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "What is deep research by OpenAI?",
    tools: [{
        type: "file_search",
        vector_store_ids: ["<vector_store_id>"],
    }],
    // highlight-start
    include: ["file_search_call.results"],
    // highlight-end
});
console.log(response);
```


### Metadata filtering

You can filter the search results based on the metadata of the files. For more details, refer to our [retrieval guide](https://developers.openai.com/api/docs/guides/retrieval), which covers:

- How to [set attributes on vector store files](https://developers.openai.com/api/docs/guides/retrieval#attributes)
- How to [define filters](https://developers.openai.com/api/docs/guides/retrieval#attribute-filtering)

Metadata filtering

```python
response = client.responses.create(
    model="gpt-5.5",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"],
        // highlight-start
        "filters": {
            "type": "in",
            "key": "category",
            "value": ["blog", "announcement"]
        }
        // highlight-end
    }]
)
print(response)
```

```javascript
const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "What is deep research by OpenAI?",
    tools: [{
        type: "file_search",
        vector_store_ids: ["<vector_store_id>"],
        // highlight-start
        filters: {
            type: "in",
            key: "category",
            value: ["blog", "announcement"]
        }
        // highlight-end
    }]
});
console.log(response);
```


## Supported files

_For `text/` MIME types, the encoding must be one of `utf-8`, `utf-16`, or `ascii`._

{/* Keep this table in sync with RETRIEVAL_SUPPORTED_EXTENSIONS in the agentapi service */}

| File format | MIME type                                                                   |
| ----------- | --------------------------------------------------------------------------- |
| `.c`        | `text/x-c`                                                                  |
| `.cpp`      | `text/x-c++`                                                                |
| `.cs`       | `text/x-csharp`                                                             |
| `.css`      | `text/css`                                                                  |
| `.doc`      | `application/msword`                                                        |
| `.docx`     | `application/vnd.openxmlformats-officedocument.wordprocessingml.document`   |
| `.go`       | `text/x-golang`                                                             |
| `.html`     | `text/html`                                                                 |
| `.java`     | `text/x-java`                                                               |
| `.js`       | `text/javascript`                                                           |
| `.json`     | `application/json`                                                          |
| `.md`       | `text/markdown`                                                             |
| `.pdf`      | `application/pdf`                                                           |
| `.php`      | `text/x-php`                                                                |
| `.pptx`     | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `.py`       | `text/x-python`                                                             |
| `.py`       | `text/x-script.python`                                                      |
| `.rb`       | `text/x-ruby`                                                               |
| `.sh`       | `application/x-sh`                                                          |
| `.tex`      | `text/x-tex`                                                                |
| `.ts`       | `application/typescript`                                                    |
| `.txt`      | `text/plain`                                                                |

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
<td style={{"maxWidth": "150px"}}>
**Tier 1**<br/>
100 RPM

**Tier 2 and 3**<br/>
500 RPM

**Tier 4 and 5**<br/>
1000 RPM

</td>
<td style={{"maxWidth": "150px"}}>
[Pricing](https://developers.openai.com/api/docs/pricing#built-in-tools) <br/>
[ZDR and data residency](https://developers.openai.com/api/docs/guides/your-data)
</td>
</tr>

</tbody>
</table>
``````
:::
:::

