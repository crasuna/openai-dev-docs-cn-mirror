---
title: "向量 embeddings"
description: "Learn how to turn text into numbers, unlocking use cases like search, clustering, and more with OpenAI API embeddings."
outline: deep
---

# 向量 embeddings

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/embeddings](https://developers.openai.com/api/docs/guides/embeddings)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/embeddings.md](https://developers.openai.com/api/docs/guides/embeddings.md)
- 抓取时间：2026-06-27T05:54:01.540Z
- Checksum：`f1fce4424d68321023e328fc0752720d21e96f899c2d178c56f2b11ad20be7cf`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## 什么是 embeddings？

OpenAI 的文本 embeddings 用来度量文本字符串之间的相关性。Embeddings 通常用于：

- **搜索**（按与查询字符串的相关性对结果排序）
- **聚类**（按相似度对文本字符串分组）
- **推荐**（推荐具有相关文本字符串的项目）
- **异常检测**（识别相关性很低的离群点）
- **多样性度量**（分析相似度分布）
- **分类**（根据最相似的标签对文本字符串分类）

Embedding 是由浮点数组成的向量（列表）。两个向量之间的[距离](/mirror/api/docs/guides/embeddings#which-distance-function-should-i-use)度量它们的相关性。小距离表示高相关性，大距离表示低相关性。

请访问我们的[定价页面](https://openai.com/api/pricing/)了解 embeddings 价格。请求会根据 [input](https://developers.openai.com/api/docs/api-reference/embeddings/create#embeddings/create-input) 中的 [tokens](https://platform.openai.com/tokenizer) 数量计费。

## 如何获取 embeddings

要获取 embedding，请将你的文本字符串连同 embedding 模型名称（例如 `text-embedding-3-small`）发送到 [embeddings API endpoint](https://developers.openai.com/api/docs/api-reference/embeddings)：

示例：获取 embeddings

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Your text string goes here",
  encoding_format: "float",
});

console.log(embedding);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.embeddings.create(
    input="Your text string goes here",
    model="text-embedding-3-small"
)

print(response.data[0].embedding)
```

```bash
curl https://api.openai.com/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "input": "Your text string goes here",
    "model": "text-embedding-3-small"
  }'
```


响应包含 embedding vector（浮点数列表）以及一些额外元数据。你可以提取 embedding vector，把它保存在 vector database 中，并用于许多不同用例。

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [
        -0.006929283495992422, -0.005336422007530928, -4.547132266452536e-5,
        -0.024047505110502243
      ]
    }
  ],
  "model": "text-embedding-3-small",
  "usage": {
    "prompt_tokens": 5,
    "total_tokens": 5
  }
}
```

默认情况下，`text-embedding-3-small` 的 embedding vector 长度为 `1536`，`text-embedding-3-large` 的长度为 `3072`。要在不损失其概念表示属性的情况下降低 embedding 的维度，请传入 [`dimensions` parameter](https://developers.openai.com/api/docs/api-reference/embeddings/create#embeddings-create-dimensions)。有关 embedding 维度的更多细节，请参阅 [embedding 用例部分](/mirror/api/docs/guides/embeddings#use-cases)。

## Embedding 模型

OpenAI 提供两个强大的第三代 embedding 模型（模型 ID 中以 `-3` 表示）。更多细节请阅读 embedding v3 [announcement blog post](https://openai.com/blog/new-embedding-models-and-api-updates)。

使用按输入 token 计价。下面是按每美元可处理文本页数展示的定价页面示例（假设每页约 800 tokens）：

| Model | ~ Pages per dollar | Performance on [MTEB](https://github.com/embeddings-benchmark/mteb) eval | Max input |
| --- | --- | --- | --- |
| text-embedding-3-small | 62,500 | 62.3% | 8192 |
| text-embedding-3-large | 9,615 | 64.6% | 8192 |
| text-embedding-ada-002 | 12,500 | 61.0% | 8192 |

## 用例

这里展示一些代表性用例，使用 [Amazon fine-food reviews dataset](https://www.kaggle.com/snap/amazon-fine-food-reviews)。

### 获取 embeddings

该数据集包含截至 2012 年 10 月 Amazon 用户留下的共 568,454 条食品评论。为了说明，我们使用最近 1000 条评论的子集。这些评论是英文的，倾向于正面或负面。每条评论都有 `ProductId`、`UserId`、`Score`、评论标题（`Summary`）和评论正文（`Text`）。例如：



| Product Id | User Id | Score | Summary | Text |
| ---------- | -------------- | ----- | --------------------- | ------------------------------------------------- |
| B001E4KFG0 | A3SGXH7AUHU8GW | 5 | Good Quality Dog Food | I have bought several of the Vitality canned... |
| B00813GRG4 | A1D87F6ZCVE5NK | 1 | Not as Advertised | Product arrived labeled as Jumbo Salted Peanut... |



下面，我们把评论摘要和评论文本合并为一段 combined text。模型会编码这段 combined text，并输出单个 vector embedding。



Get_embeddings_from_dataset.ipynb

```python
from openai import OpenAI
client = OpenAI()

def get_embedding(text, model="text-embedding-3-small"):
    text = text.replace("\n", " ")
    return client.embeddings.create(input = [text], model=model).data[0].embedding

df['ada_embedding'] = df.combined.apply(lambda x: get_embedding(x, model='text-embedding-3-small'))
df.to_csv('output/embedded_1k_reviews.csv', index=False)
```


要从已保存文件加载数据，可以运行以下代码：

```python
import pandas as pd

df = pd.read_csv('output/embedded_1k_reviews.csv')
df['ada_embedding'] = df.ada_embedding.apply(eval).apply(np.array)
```


降低 embedding 维度

使用更大的 embeddings，例如把它们存储在 vector store 中用于检索，通常会比使用较小 embeddings 花费更多，并消耗更多计算、内存和存储。

我们的两个新 embedding 模型都使用了一种[技术](https://arxiv.org/abs/2205.13147)进行训练，使开发者能够在使用 embeddings 的性能和成本之间做取舍。具体来说，开发者可以通过传入 [`dimensions` API parameter](https://developers.openai.com/api/docs/api-reference/embeddings/create#embeddings-create-dimensions) 缩短 embeddings（即移除序列末尾的一些数字），而不会让 embedding 失去概念表示属性。例如，在 MTEB benchmark 上，一个 `text-embedding-3-large` embedding 可以被缩短到 256 维，同时仍优于未缩短、大小为 1536 的 `text-embedding-ada-002` embedding。你可以在我们的 [embeddings v3 launch blog post](https://openai.com/blog/new-embedding-models-and-api-updates#:~:text=Native%20support%20for%20shortening%20embeddings) 中阅读更多关于改变维度如何影响性能的信息。

一般来说，在创建 embedding 时使用 `dimensions` 参数是推荐方式。在某些情况下，你可能需要在生成后改变 embedding 维度。手动改变维度时，需要确保按如下方式对 embedding 的维度进行归一化。

```python
from openai import OpenAI
import numpy as np

client = OpenAI()

def normalize_l2(x):
    x = np.array(x)
    if x.ndim == 1:
        norm = np.linalg.norm(x)
        if norm == 0:
            return x
        return x / norm
    else:
        norm = np.linalg.norm(x, 2, axis=1, keepdims=True)
        return np.where(norm == 0, x, x / norm)


response = client.embeddings.create(
    model="text-embedding-3-small", input="Testing 123", encoding_format="float"
)

cut_dim = response.data[0].embedding[:256]
norm_dim = normalize_l2(cut_dim)

print(norm_dim)
```


动态改变维度带来了非常灵活的用法。例如，当使用只支持最长 1024 维 embeddings 的 vector data store 时，开发者现在仍可以使用我们最好的 embedding 模型 `text-embedding-3-large`，并为 `dimensions` API parameter 指定 1024，这会把 embedding 从 3072 维缩短，牺牲一部分准确性来换取更小的向量尺寸。

使用基于 embeddings 的搜索进行问答


  

&lt;span&gt;Question_answering_using_embeddings.ipynb&lt;/span&gt; &lt;/p&gt;

在许多常见情况下，模型并未在包含你希望在响应用户查询时可访问的关键事实和信息的数据上训练。解决这个问题的一种方法如下所示：把额外信息放入模型的上下文窗口。这在许多用例中有效，但会导致更高的 token 成本。在这个 notebook 中，我们探索这种方法与基于 embeddings 的搜索之间的取舍。

```python
query = f"""Use the below article on the 2022 Winter Olympics to answer the subsequent question. If the answer cannot be found, write "I don't know."

Article:
\"\"\"
{wikipedia_article_on_curling}
\"\"\"

Question: Which athletes won the gold medal in curling at the 2022 Winter Olympics?"""

response = client.chat.completions.create(
    messages=[
        {'role': 'system', 'content': 'You answer questions about the 2022 Winter Olympics.'},
        {'role': 'user', 'content': query},
    ],
    model=GPT_MODEL,
    temperature=0,
)

print(response.choices[0].message.content)
```


使用 embeddings 进行文本搜索


  

&lt;span&gt;Semantic_text_search_using_embeddings.ipynb&lt;/span&gt; &lt;/p&gt;

为了检索最相关的文档，我们使用查询和每个文档的 embedding vectors 之间的 cosine similarity，并返回得分最高的文档。

```python
from openai.embeddings_utils import get_embedding, cosine_similarity

def search_reviews(df, product_description, n=3, pprint=True):
    embedding = get_embedding(product_description, model='text-embedding-3-small')
    df['similarities'] = df.ada_embedding.apply(lambda x: cosine_similarity(x, embedding))
    res = df.sort_values('similarities', ascending=False).head(n)
    return res

res = search_reviews(df, 'delicious beans', n=3)
```


使用 embeddings 进行代码搜索


  

&lt;span&gt;Code_search.ipynb&lt;/span&gt; &lt;/p&gt;

代码搜索的工作方式与基于 embedding 的文本搜索类似。我们提供了一种方法，从给定仓库中的所有 Python 文件中提取 Python 函数。随后用 `text-embedding-3-small` 模型为每个函数建立索引。

要执行代码搜索，我们使用同一个模型对自然语言查询进行 embedding。然后计算所得查询 embedding 与每个函数 embedding 之间的 cosine similarity。cosine similarity 最高的结果最相关。

```python
from openai.embeddings_utils import get_embedding, cosine_similarity

df['code_embedding'] = df['code'].apply(lambda x: get_embedding(x, model='text-embedding-3-small'))

def search_functions(df, code_query, n=3, pprint=True, n_lines=7):
    embedding = get_embedding(code_query, model='text-embedding-3-small')
    df['similarities'] = df.code_embedding.apply(lambda x: cosine_similarity(x, embedding))

    res = df.sort_values('similarities', ascending=False).head(n)
    return res

res = search_functions(df, 'Completions API tests', n=3)
```


使用 embeddings 进行推荐


  

&lt;span&gt;Recommendation_using_embeddings.ipynb&lt;/span&gt; &lt;/p&gt;

因为 embedding vectors 之间更短的距离表示更大的相似性，所以 embeddings 可用于推荐。

下面，我们展示一个基础推荐器。它接收一个字符串列表和一个“source”字符串，计算它们的 embeddings，然后返回字符串排名，从最相似到最不相似排序。作为具体示例，下面链接的 notebook 将此函数的一个版本应用于 [AG news dataset](http://groups.di.unipi.it/~gulli/AG_corpus_of_news_articles.html)（抽样缩小到 2,000 条新闻文章描述），以返回与任意给定 source article 最相似的前 5 篇文章。

```python
def recommendations_from_strings(
    strings: List[str],
    index_of_source_string: int,
    model="text-embedding-3-small",
) -> List[int]:
    """Return nearest neighbors of a given string."""

    # get embeddings for all strings
    embeddings = [embedding_from_string(string, model=model) for string in strings]

    # get the embedding of the source string
    query_embedding = embeddings[index_of_source_string]

    # get distances between the source embedding and other embeddings (function from embeddings_utils.py)
    distances = distances_from_embeddings(query_embedding, embeddings, distance_metric="cosine")

    # get indices of nearest neighbors (function from embeddings_utils.py)
    indices_of_nearest_neighbors = indices_of_nearest_neighbors_from_distances(distances)
    return indices_of_nearest_neighbors
```


二维数据可视化


  

&lt;span&gt;Visualizing_embeddings_in_2D.ipynb&lt;/span&gt; &lt;/p&gt;

Embeddings 的大小会随着底层模型的复杂度变化。为了可视化这种高维数据，我们使用 t-SNE 算法把数据转换为二维。

我们根据评论者给出的星级为单条评论着色：

- 1-star：red
- 2-star：dark orange
- 3-star：gold
- 4-star：turquoise
- 5-star：dark green

可视化看起来大致生成了 3 个 cluster，其中一个主要包含负面评论。

```python
import pandas as pd
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
import matplotlib

df = pd.read_csv('output/embedded_1k_reviews.csv')
matrix = df.ada_embedding.apply(eval).to_list()

# Create a t-SNE model and transform the data
tsne = TSNE(n_components=2, perplexity=15, random_state=42, init='random', learning_rate=200)
vis_dims = tsne.fit_transform(matrix)

colors = ["red", "darkorange", "gold", "turquiose", "darkgreen"]
x = [x for x,y in vis_dims]
y = [y for x,y in vis_dims]
color_indices = df.Score.values - 1

colormap = matplotlib.colors.ListedColormap(colors)
plt.scatter(x, y, c=color_indices, cmap=colormap, alpha=0.3)
plt.title("Amazon ratings visualized in language using t-SNE")
```


Embedding 作为 ML 算法的文本特征编码器


  

&lt;span&gt;Regression_using_embeddings.ipynb&lt;/span&gt; &lt;/p&gt;

Embedding 可以在机器学习模型中用作通用自由文本特征编码器。如果部分相关输入是自由文本，引入 embeddings 会提升任何机器学习模型的性能。Embedding 也可以在 ML 模型中用作分类特征编码器。如果分类变量的名称有意义且数量很多，例如职位名称，这会带来最大价值。对于此任务，similarity embeddings 通常比 search embeddings 表现更好。

我们观察到，embedding 表示通常非常丰富且信息密集。例如，使用 SVD 或 PCA 降低输入维度，即使只降低 10%，通常也会导致特定任务的下游性能变差。

这段代码把数据拆分为训练集和测试集，后续两个用例（即回归和分类）会使用它们。

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    list(df.ada_embedding.values),
    df.Score,
    test_size = 0.2,
    random_state=42
)
```


#### 使用 embedding 特征进行回归

Embeddings 提供了一种优雅方式来预测数值。在这个示例中，我们根据评论文本预测评论者的星级评分。由于 embeddings 中包含的语义信息很高，即使评论数量很少，预测也还不错。

我们假设分数是 1 到 5 之间的连续变量，并允许算法预测任意浮点值。ML 算法会最小化预测值与真实分数之间的距离，并达到 0.39 的平均绝对误差，这意味着平均预测偏差不到半颗星。

```python
from sklearn.ensemble import RandomForestRegressor

rfr = RandomForestRegressor(n_estimators=100)
rfr.fit(X_train, y_train)
preds = rfr.predict(X_test)
```


使用 embedding 特征进行分类


  

&lt;span&gt;Classification_using_embeddings.ipynb&lt;/span&gt; &lt;/p&gt;

这一次，我们不让算法预测 1 到 5 之间的任意值，而是尝试把评论的确切星级数分类到 5 个桶中，范围从 1 到 5 星。

训练后，模型学会更好地预测 1 星和 5 星评论，而对更细微的评论（2-4 星）预测较差，这可能是因为极端情感表达更多。

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

clf = RandomForestClassifier(n_estimators=100)
clf.fit(X_train, y_train)
preds = clf.predict(X_test)
```


Zero-shot 分类


  

&lt;span&gt;Zero-shot_classification_with_embeddings.ipynb&lt;/span&gt; &lt;/p&gt;

我们可以使用 embeddings 进行 zero shot classification，而不需要任何带标签训练数据。对于每个 class，我们对 class 名称或 class 的简短描述做 embedding。要以 zero-shot 方式分类某段新文本，我们将其 embedding 与所有 class embeddings 比较，并预测相似度最高的 class。

```python
from openai.embeddings_utils import cosine_similarity, get_embedding

df= df[df.Score!=3]
df['sentiment'] = df.Score.replace({1:'negative', 2:'negative', 4:'positive', 5:'positive'})

labels = ['negative', 'positive']
label_embeddings = [get_embedding(label, model=model) for label in labels]

def label_score(review_embedding, label_embeddings):
    return cosine_similarity(review_embedding, label_embeddings[1]) - cosine_similarity(review_embedding, label_embeddings[0])

prediction = 'positive' if label_score('Sample Review', label_embeddings) > 0 else 'negative'
```


获取用户和产品 embeddings 以进行 cold-start 推荐


  

&lt;span&gt;User_and_product_embeddings.ipynb&lt;/span&gt; &lt;/p&gt;

我们可以通过平均某个用户的所有评论来获得 user embedding。类似地，可以通过平均某个产品的所有评论来获得 product embedding。为了展示这种方法的实用性，我们使用 50k 条评论的子集，以覆盖每个用户和每个产品的更多评论。

我们在单独的测试集上评估这些 embeddings 的实用性，在测试集中绘制 user embedding 和 product embedding 的相似度与评分之间的函数关系。有趣的是，基于这种方法，即使在用户收到产品之前，我们也能以优于随机的方式预测他们是否会喜欢该产品。

```python
user_embeddings = df.groupby('UserId').ada_embedding.apply(np.mean)
prod_embeddings = df.groupby('ProductId').ada_embedding.apply(np.mean)
```


聚类


  

&lt;span&gt;Clustering.ipynb&lt;/span&gt; &lt;/p&gt;

聚类是理解大量文本数据的一种方式。Embeddings 对此任务很有用，因为它们为每段文本提供语义上有意义的向量表示。因此，在无监督方式下，聚类会揭示数据集中的隐藏分组。

在这个示例中，我们发现四个不同 cluster：一个聚焦狗粮，一个聚焦负面评论，两个聚焦正面评论。

```python
import numpy as np
from sklearn.cluster import KMeans

matrix = np.vstack(df.ada_embedding.values)
n_clusters = 4

kmeans = KMeans(n_clusters = n_clusters, init='k-means++', random_state=42)
kmeans.fit(matrix)
df['Cluster'] = kmeans.labels_
```


## FAQ

### 如何在 embedding 前判断字符串有多少 tokens？

在 Python 中，你可以使用 OpenAI tokenizer [`tiktoken`](https://github.com/openai/tiktoken) 将字符串拆分为 tokens。

示例代码：

```python
import tiktoken

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

num_tokens_from_string("tiktoken is great!", "cl100k_base")
```


对于 `text-embedding-3-small` 这样的第三代 embedding 模型，请使用 `cl100k_base` encoding。

OpenAI Cookbook 指南 [how to count tokens with tiktoken](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken) 中有更多细节和示例代码。

### 如何快速检索 K 个最近的 embedding vectors？

要在大量向量中快速搜索，我们建议使用 vector database。你可以在 GitHub 上的 [Cookbook](https://developers.openai.com/cookbook/examples/vector_databases/readme) 中找到使用 vector databases 和 OpenAI API 的示例。

### 应该使用哪种距离函数？

我们推荐 [cosine similarity](https://en.wikipedia.org/wiki/Cosine_similarity)。距离函数的选择通常并不太重要。

OpenAI embeddings 已归一化为长度 1，这意味着：

- 可以只使用点积稍快地计算 cosine similarity
- Cosine similarity 和 Euclidean distance 会得到完全相同的排序

### 我可以在线分享我的 embeddings 吗？

可以，客户拥有我们模型的输入和输出，包括 embeddings 情况下的输入和输出。你有责任确保输入到我们 API 的内容不违反任何适用法律或我们的 [Terms of Use](https://openai.com/policies/terms-of-use)。

### V3 embedding 模型了解近期事件吗？

不了解，`text-embedding-3-large` 和 `text-embedding-3-small` 模型缺乏 2021 年 9 月之后发生事件的知识。一般来说，这不像文本生成模型那样构成很大限制，但在某些边缘情况下会降低性能。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
## What are embeddings?

OpenAI’s text embeddings measure the relatedness of text strings. Embeddings are commonly used for:

- **Search** (where results are ranked by relevance to a query string)
- **Clustering** (where text strings are grouped by similarity)
- **Recommendations** (where items with related text strings are recommended)
- **Anomaly detection** (where outliers with little relatedness are identified)
- **Diversity measurement** (where similarity distributions are analyzed)
- **Classification** (where text strings are classified by their most similar label)

An embedding is a vector (list) of floating point numbers. The [distance](#which-distance-function-should-i-use) between two vectors measures their relatedness. Small distances suggest high relatedness and large distances suggest low relatedness.

Visit our [pricing page](https://openai.com/api/pricing/) to learn about embeddings pricing. Requests are billed based on the number of [tokens](https://platform.openai.com/tokenizer) in the [input](https://developers.openai.com/api/docs/api-reference/embeddings/create#embeddings/create-input).

## How to get embeddings

To get an embedding, send your text string to the [embeddings API endpoint](https://developers.openai.com/api/docs/api-reference/embeddings) along with the embedding model name (e.g., `text-embedding-3-small`):

Example: Getting embeddings

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Your text string goes here",
  encoding_format: "float",
});

console.log(embedding);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.embeddings.create(
    input="Your text string goes here",
    model="text-embedding-3-small"
)

print(response.data[0].embedding)
```

```bash
curl https://api.openai.com/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "input": "Your text string goes here",
    "model": "text-embedding-3-small"
  }'
```


The response contains the embedding vector (list of floating point numbers) along with some additional metadata. You can extract the embedding vector, save it in a vector database, and use for many different use cases.

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [
        -0.006929283495992422, -0.005336422007530928, -4.547132266452536e-5,
        -0.024047505110502243
      ]
    }
  ],
  "model": "text-embedding-3-small",
  "usage": {
    "prompt_tokens": 5,
    "total_tokens": 5
  }
}
```

By default, the length of the embedding vector is `1536` for `text-embedding-3-small` or `3072` for `text-embedding-3-large`. To reduce the embedding's dimensions without losing its concept-representing properties, pass in the [dimensions parameter](https://developers.openai.com/api/docs/api-reference/embeddings/create#embeddings-create-dimensions). Find more detail on embedding dimensions in the [embedding use case section](#use-cases).

## Embedding models

OpenAI offers two powerful third-generation embedding model (denoted by `-3` in the model ID). Read the embedding v3 [announcement blog post](https://openai.com/blog/new-embedding-models-and-api-updates) for more details.

Usage is priced per input token. Below is an example of pricing pages of text per US dollar (assuming ~800 tokens per page):

| Model                  | ~ Pages per dollar | Performance on [MTEB](https://github.com/embeddings-benchmark/mteb) eval | Max input |
| ---------------------- | ------------------ | ------------------------------------------------------------------------ | --------- |
| text-embedding-3-small | 62,500             | 62.3%                                                                    | 8192      |
| text-embedding-3-large | 9,615              | 64.6%                                                                    | 8192      |
| text-embedding-ada-002 | 12,500             | 61.0%                                                                    | 8192      |

## Use cases

Here we show some representative use cases, using the [Amazon fine-food reviews dataset](https://www.kaggle.com/snap/amazon-fine-food-reviews).

### Obtaining the embeddings

The dataset contains a total of 568,454 food reviews left by Amazon users up to October 2012. We use a subset of the 1000 most recent reviews for illustration purposes. The reviews are in English and tend to be positive or negative. Each review has a `ProductId`, `UserId`, `Score`, review title (`Summary`) and review body (`Text`). For example:

<div className="docs-embeddings-sample-data-table">

| Product Id | User Id        | Score | Summary               | Text                                              |
| ---------- | -------------- | ----- | --------------------- | ------------------------------------------------- |
| B001E4KFG0 | A3SGXH7AUHU8GW | 5     | Good Quality Dog Food | I have bought several of the Vitality canned...   |
| B00813GRG4 | A1D87F6ZCVE5NK | 1     | Not as Advertised     | Product arrived labeled as Jumbo Salted Peanut... |

</div>

Below, we combine the review summary and review text into a single combined text. The model encodes this combined text and output a single vector embedding.



<span>Get_embeddings_from_dataset.ipynb</span> ```python
from openai import OpenAI
client = OpenAI()

def get_embedding(text, model="text-embedding-3-small"):
    text = text.replace("\n", " ")
    return client.embeddings.create(input = [text], model=model).data[0].embedding

df['ada_embedding'] = df.combined.apply(lambda x: get_embedding(x, model='text-embedding-3-small'))
df.to_csv('output/embedded_1k_reviews.csv', index=False)
```


To load the data from a saved file, you can run the following:

```python
import pandas as pd

df = pd.read_csv('output/embedded_1k_reviews.csv')
df['ada_embedding'] = df.ada_embedding.apply(eval).apply(np.array)
```


Reducing embedding dimensions

Using larger embeddings, for example storing them in a vector store for retrieval, generally costs more and consumes more compute, memory and storage than using smaller embeddings.

Both of our new embedding models were trained [with a technique](https://arxiv.org/abs/2205.13147) that allows developers to trade-off performance and cost of using embeddings. Specifically, developers can shorten embeddings (i.e. remove some numbers from the end of the sequence) without the embedding losing its concept-representing properties by passing in the [`dimensions` API parameter](https://developers.openai.com/api/docs/api-reference/embeddings/create#embeddings-create-dimensions). For example, on the MTEB benchmark, a `text-embedding-3-large` embedding can be shortened to a size of 256 while still outperforming an unshortened `text-embedding-ada-002` embedding with a size of 1536. You can read more about how changing the dimensions impacts performance in our [embeddings v3 launch blog post](https://openai.com/blog/new-embedding-models-and-api-updates#:~:text=Native%20support%20for%20shortening%20embeddings).

In general, using the `dimensions` parameter when creating the embedding is the suggested approach. In certain cases, you may need to change the embedding dimension after you generate it. When you change the dimension manually, you need to be sure to normalize the dimensions of the embedding as is shown below.

```python
from openai import OpenAI
import numpy as np

client = OpenAI()

def normalize_l2(x):
    x = np.array(x)
    if x.ndim == 1:
        norm = np.linalg.norm(x)
        if norm == 0:
            return x
        return x / norm
    else:
        norm = np.linalg.norm(x, 2, axis=1, keepdims=True)
        return np.where(norm == 0, x, x / norm)


response = client.embeddings.create(
    model="text-embedding-3-small", input="Testing 123", encoding_format="float"
)

cut_dim = response.data[0].embedding[:256]
norm_dim = normalize_l2(cut_dim)

print(norm_dim)
```


Dynamically changing the dimensions enables very flexible usage. For example, when using a vector data store that only supports embeddings up to 1024 dimensions long, developers can now still use our best embedding model `text-embedding-3-large` and specify a value of 1024 for the `dimensions` API parameter, which will shorten the embedding down from 3072 dimensions, trading off some accuracy in exchange for the smaller vector size.

Question answering using embeddings-based search

<p>
  

<span>Question_answering_using_embeddings.ipynb</span> </p>

There are many common cases where the model is not trained on data which contains key facts and information you want to make accessible when generating responses to a user query. One way of solving this, as shown below, is to put additional information into the context window of the model. This is effective in many use cases but leads to higher token costs. In this notebook, we explore the tradeoff between this approach and embeddings bases search.

```python
query = f"""Use the below article on the 2022 Winter Olympics to answer the subsequent question. If the answer cannot be found, write "I don't know."

Article:
\"\"\"
{wikipedia_article_on_curling}
\"\"\"

Question: Which athletes won the gold medal in curling at the 2022 Winter Olympics?"""

response = client.chat.completions.create(
    messages=[
        {'role': 'system', 'content': 'You answer questions about the 2022 Winter Olympics.'},
        {'role': 'user', 'content': query},
    ],
    model=GPT_MODEL,
    temperature=0,
)

print(response.choices[0].message.content)
```


Text search using embeddings

<p>
  

<span>Semantic_text_search_using_embeddings.ipynb</span> </p>

To retrieve the most relevant documents we use the cosine similarity between the embedding vectors of the query and each document, and return the highest scored documents.

```python
from openai.embeddings_utils import get_embedding, cosine_similarity

def search_reviews(df, product_description, n=3, pprint=True):
    embedding = get_embedding(product_description, model='text-embedding-3-small')
    df['similarities'] = df.ada_embedding.apply(lambda x: cosine_similarity(x, embedding))
    res = df.sort_values('similarities', ascending=False).head(n)
    return res

res = search_reviews(df, 'delicious beans', n=3)
```


Code search using embeddings

<p>
  

<span>Code_search.ipynb</span> </p>

Code search works similarly to embedding-based text search. We provide a method to extract Python functions from all the Python files in a given repository. Each function is then indexed by the `text-embedding-3-small` model.

To perform a code search, we embed the query in natural language using the same model. Then we calculate cosine similarity between the resulting query embedding and each of the function embeddings. The highest cosine similarity results are most relevant.

```python
from openai.embeddings_utils import get_embedding, cosine_similarity

df['code_embedding'] = df['code'].apply(lambda x: get_embedding(x, model='text-embedding-3-small'))

def search_functions(df, code_query, n=3, pprint=True, n_lines=7):
    embedding = get_embedding(code_query, model='text-embedding-3-small')
    df['similarities'] = df.code_embedding.apply(lambda x: cosine_similarity(x, embedding))

    res = df.sort_values('similarities', ascending=False).head(n)
    return res

res = search_functions(df, 'Completions API tests', n=3)
```


Recommendations using embeddings

<p>
  

<span>Recommendation_using_embeddings.ipynb</span> </p>

Because shorter distances between embedding vectors represent greater similarity, embeddings can be useful for recommendation.

Below, we illustrate a basic recommender. It takes in a list of strings and one 'source' string, computes their embeddings, and then returns a ranking of the strings, ranked from most similar to least similar. As a concrete example, the linked notebook below applies a version of this function to the [AG news dataset](http://groups.di.unipi.it/~gulli/AG_corpus_of_news_articles.html) (sampled down to 2,000 news article descriptions) to return the top 5 most similar articles to any given source article.

```python
def recommendations_from_strings(
    strings: List[str],
    index_of_source_string: int,
    model="text-embedding-3-small",
) -> List[int]:
    """Return nearest neighbors of a given string."""

    # get embeddings for all strings
    embeddings = [embedding_from_string(string, model=model) for string in strings]

    # get the embedding of the source string
    query_embedding = embeddings[index_of_source_string]

    # get distances between the source embedding and other embeddings (function from embeddings_utils.py)
    distances = distances_from_embeddings(query_embedding, embeddings, distance_metric="cosine")

    # get indices of nearest neighbors (function from embeddings_utils.py)
    indices_of_nearest_neighbors = indices_of_nearest_neighbors_from_distances(distances)
    return indices_of_nearest_neighbors
```


Data visualization in 2D

<p>
  

<span>Visualizing_embeddings_in_2D.ipynb</span> </p>

The size of the embeddings varies with the complexity of the underlying model. In order to visualize this high dimensional data we use the t-SNE algorithm to transform the data into two dimensions.

We color the individual reviews based on the star rating which the reviewer has given:

- 1-star: red
- 2-star: dark orange
- 3-star: gold
- 4-star: turquoise
- 5-star: dark green

The visualization seems to have produced roughly 3 clusters, one of which has mostly negative reviews.

```python
import pandas as pd
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
import matplotlib

df = pd.read_csv('output/embedded_1k_reviews.csv')
matrix = df.ada_embedding.apply(eval).to_list()

# Create a t-SNE model and transform the data
tsne = TSNE(n_components=2, perplexity=15, random_state=42, init='random', learning_rate=200)
vis_dims = tsne.fit_transform(matrix)

colors = ["red", "darkorange", "gold", "turquiose", "darkgreen"]
x = [x for x,y in vis_dims]
y = [y for x,y in vis_dims]
color_indices = df.Score.values - 1

colormap = matplotlib.colors.ListedColormap(colors)
plt.scatter(x, y, c=color_indices, cmap=colormap, alpha=0.3)
plt.title("Amazon ratings visualized in language using t-SNE")
```


Embedding as a text feature encoder for ML algorithms

<p>
  

<span>Regression_using_embeddings.ipynb</span> </p>

An embedding can be used as a general free-text feature encoder within a machine learning model. Incorporating embeddings will improve the performance of any machine learning model, if some of the relevant inputs are free text. An embedding can also be used as a categorical feature encoder within a ML model. This adds most value if the names of categorical variables are meaningful and numerous, such as job titles. Similarity embeddings generally perform better than search embeddings for this task.

We observed that generally the embedding representation is very rich and information dense. For example, reducing the dimensionality of the inputs using SVD or PCA, even by 10%, generally results in worse downstream performance on specific tasks.

This code splits the data into a training set and a testing set, which will be used by the following two use cases, namely regression and classification.

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    list(df.ada_embedding.values),
    df.Score,
    test_size = 0.2,
    random_state=42
)
```


#### Regression using the embedding features

Embeddings present an elegant way of predicting a numerical value. In this example we predict the reviewer’s star rating, based on the text of their review. Because the semantic information contained within embeddings is high, the prediction is decent even with very few reviews.

We assume the score is a continuous variable between 1 and 5, and allow the algorithm to predict any floating point value. The ML algorithm minimizes the distance of the predicted value to the true score, and achieves a mean absolute error of 0.39, which means that on average the prediction is off by less than half a star.

```python
from sklearn.ensemble import RandomForestRegressor

rfr = RandomForestRegressor(n_estimators=100)
rfr.fit(X_train, y_train)
preds = rfr.predict(X_test)
```


Classification using the embedding features

<p>
  

<span>Classification_using_embeddings.ipynb</span> </p>

This time, instead of having the algorithm predict a value anywhere between 1 and 5, we will attempt to classify the exact number of stars for a review into 5 buckets, ranging from 1 to 5 stars.

After the training, the model learns to predict 1 and 5-star reviews much better than the more nuanced reviews (2-4 stars), likely due to more extreme sentiment expression.

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

clf = RandomForestClassifier(n_estimators=100)
clf.fit(X_train, y_train)
preds = clf.predict(X_test)
```


Zero-shot classification

<p>
  

<span>Zero-shot_classification_with_embeddings.ipynb</span> </p>

We can use embeddings for zero shot classification without any labeled training data. For each class, we embed the class name or a short description of the class. To classify some new text in a zero-shot manner, we compare its embedding to all class embeddings and predict the class with the highest similarity.

```python
from openai.embeddings_utils import cosine_similarity, get_embedding

df= df[df.Score!=3]
df['sentiment'] = df.Score.replace({1:'negative', 2:'negative', 4:'positive', 5:'positive'})

labels = ['negative', 'positive']
label_embeddings = [get_embedding(label, model=model) for label in labels]

def label_score(review_embedding, label_embeddings):
    return cosine_similarity(review_embedding, label_embeddings[1]) - cosine_similarity(review_embedding, label_embeddings[0])

prediction = 'positive' if label_score('Sample Review', label_embeddings) > 0 else 'negative'
```


Obtaining user and product embeddings for cold-start recommendation

<p>
  

<span>User_and_product_embeddings.ipynb</span> </p>

We can obtain a user embedding by averaging over all of their reviews. Similarly, we can obtain a product embedding by averaging over all the reviews about that product. In order to showcase the usefulness of this approach we use a subset of 50k reviews to cover more reviews per user and per product.

We evaluate the usefulness of these embeddings on a separate test set, where we plot similarity of the user and product embedding as a function of the rating. Interestingly, based on this approach, even before the user receives the product we can predict better than random whether they would like the product.

```python
user_embeddings = df.groupby('UserId').ada_embedding.apply(np.mean)
prod_embeddings = df.groupby('ProductId').ada_embedding.apply(np.mean)
```


Clustering

<p>
  

<span>Clustering.ipynb</span> </p>

Clustering is one way of making sense of a large volume of textual data. Embeddings are useful for this task, as they provide semantically meaningful vector representations of each text. Thus, in an unsupervised way, clustering will uncover hidden groupings in our dataset.

In this example, we discover four distinct clusters: one focusing on dog food, one on negative reviews, and two on positive reviews.

```python
import numpy as np
from sklearn.cluster import KMeans

matrix = np.vstack(df.ada_embedding.values)
n_clusters = 4

kmeans = KMeans(n_clusters = n_clusters, init='k-means++', random_state=42)
kmeans.fit(matrix)
df['Cluster'] = kmeans.labels_
```


## FAQ

### How can I tell how many tokens a string has before I embed it?

In Python, you can split a string into tokens with OpenAI's tokenizer [`tiktoken`](https://github.com/openai/tiktoken).

Example code:

```python
import tiktoken

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

num_tokens_from_string("tiktoken is great!", "cl100k_base")
```


For third-generation embedding models like `text-embedding-3-small`, use the `cl100k_base` encoding.

More details and example code are in the OpenAI Cookbook guide [how to count tokens with tiktoken](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken).

### How can I retrieve K nearest embedding vectors quickly?

For searching over many vectors quickly, we recommend using a vector database. You can find examples of working with vector databases and the OpenAI API [in our Cookbook](https://developers.openai.com/cookbook/examples/vector_databases/readme) on GitHub.

### Which distance function should I use?

We recommend [cosine similarity](https://en.wikipedia.org/wiki/Cosine_similarity). The choice of distance function typically doesn't matter much.

OpenAI embeddings are normalized to length 1, which means that:

- Cosine similarity can be computed slightly faster using just a dot product
- Cosine similarity and Euclidean distance will result in the identical rankings

### Can I share my embeddings online?

Yes, customers own their input and output from our models, including in the case of embeddings. You are responsible for ensuring that the content you input to our API does not violate any applicable law or our [Terms of Use](https://openai.com/policies/terms-of-use).

### Do V3 embedding models know about recent events?

No, the `text-embedding-3-large` and `text-embedding-3-small` models lack knowledge of events that occurred after September 2021. This is generally not as much of a limitation as it would be for text generation models but in certain edge cases it can reduce performance.
``````
:::
:::

