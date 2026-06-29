---
title: "使用 embeddings 进行网页问答"
description: "How to build an AI that can answer questions about your website."
outline: deep
---

# 使用 embeddings 进行网页问答

**文档集**：OpenAI API 文档\
**分组**：文档\
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/tutorials/web-qa-embeddings](https://developers.openai.com/api/docs/tutorials/web-qa-embeddings)
- Markdown 来源：[https://developers.openai.com/api/docs/tutorials/web-qa-embeddings.md](https://developers.openai.com/api/docs/tutorials/web-qa-embeddings.md)
- 抓取时间：2026-06-27T05:54:14.223Z
- Checksum：`d1dec58d893ed8f6641a2008ea618818c348308bbf4d50940ec63581c97e3a11`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
本教程会演示一个简单示例：抓取一个网站（在本例中是 OpenAI 网站），使用 [Embeddings API](/mirror/api/docs/guides/embeddings) 将抓取到的页面转换为 embeddings，然后创建一个基础搜索功能，让用户可以就已嵌入的信息提问。它旨在作为构建更复杂应用的起点，这些应用可以使用自定义知识库。

# 开始

本教程需要一些 Python 和 GitHub 基础知识。在深入之前，请确保先[设置 OpenAI API key](https://developers.openai.com/api/docs/api-reference/introduction)，并完成 [quickstart tutorial](/mirror/api/docs/quickstart)。这会帮助你很好地理解如何充分使用 API。

本教程使用 Python 作为主要编程语言，并结合 OpenAI、Pandas、transformers、NumPy 和其他常用 packages。如果你在学习本教程时遇到任何问题，请到 [OpenAI Community Forum](https://community.openai.com) 提问。

要开始使用代码，请克隆 [GitHub 上本教程的完整代码](https://github.com/openai/web-crawl-q-and-a-example)。或者，你也可以跟着教程把每个部分复制到 Jupyter notebook 中并逐步运行代码，或只是阅读。避免问题的一个好方法是设置一个新的 virtual environment，并通过运行以下命令安装所需 packages：

```bash
python -m venv env

source env/bin/activate

pip install -r requirements.txt
```

## 设置网页爬虫

本教程的主要重点是 OpenAI API，因此如果你愿意，可以跳过如何创建网页爬虫的背景说明，直接[下载源代码](https://github.com/openai/web-crawl-q-and-a-example)。否则，请展开下面的部分，了解 scraping mechanism 的实现过程。

学习如何构建网页爬虫






      获取文本形式的数据是使用 embeddings 的第一步。本教程会通过抓取 OpenAI 网站创建一组新数据；
      你也可以把这种技术用于自己的公司网站或个人网站。


      

查看源代码






虽然这个爬虫是从零开始编写的，但像 [Scrapy](https://github.com/scrapy/scrapy) 这样的开源 packages 也可以帮助完成这些操作。

这个爬虫会从下面代码底部传入的根 URL 开始，访问每个页面，寻找额外链接，并继续访问这些页面（只要它们属于同一个根域名）。首先，导入所需 packages，设置基本 URL，并定义一个 HTMLParser class。

```python
import requests
import re
import urllib.request
from bs4 import BeautifulSoup
from collections import deque
from html.parser import HTMLParser
from urllib.parse import urlparse
import os

# Regex pattern to match a URL
HTTP_URL_PATTERN = r'^http[s]*://.+'

domain = "openai.com" # <- put your domain to be crawled
full_url = "https://openai.com/" # <- put your domain to be crawled with https or http

# Create a class to parse the HTML and get the hyperlinks
class HyperlinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        # Create a list to store the hyperlinks
        self.hyperlinks = []

    # Override the HTMLParser's handle_starttag method to get the hyperlinks
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)

        # If the tag is an anchor tag and it has an href attribute, add the href attribute to the list of hyperlinks
        if tag == "a" and "href" in attrs:
            self.hyperlinks.append(attrs["href"])
```


下一个函数接受一个 URL 作为参数，打开该 URL，并读取 HTML 内容。然后，它会返回在该页面上找到的所有 hyperlinks。

```python
# Function to get the hyperlinks from a URL
def get_hyperlinks(url):

    # Try to open the URL and read the HTML
    try:
        # Open the URL and read the HTML
        with urllib.request.urlopen(url) as response:

            # If the response is not HTML, return an empty list
            if not response.info().get('Content-Type').startswith("text/html"):
                return []

            # Decode the HTML
            html = response.read().decode('utf-8')
    except Exception as e:
        print(e)
        return []

    # Create the HTML Parser and then Parse the HTML to get hyperlinks
    parser = HyperlinkParser()
    parser.feed(html)

    return parser.hyperlinks
```


目标是只抓取并索引 OpenAI 域名下的内容。为此，需要一个函数调用 `get_hyperlinks`，但过滤掉不属于指定域名的任何 URLs。

```python
# Function to get the hyperlinks from a URL that are within the same domain
def get_domain_hyperlinks(local_domain, url):
    clean_links = []
    for link in set(get_hyperlinks(url)):
        clean_link = None

        # If the link is a URL, check if it is within the same domain
        if re.search(HTTP_URL_PATTERN, link):
            # Parse the URL and check if the domain is the same
            url_obj = urlparse(link)
            if url_obj.netloc == local_domain:
                clean_link = link

        # If the link is not a URL, check if it is a relative link
        else:
            if link.startswith("/"):
                link = link[1:]
            elif link.startswith("#") or link.startswith("mailto:"):
                continue
            clean_link = "https://" + local_domain + "/" + link

        if clean_link is not None:
            if clean_link.endswith("/"):
                clean_link = clean_link[:-1]
            clean_links.append(clean_link)

    # Return the list of hyperlinks that are within the same domain
    return list(set(clean_links))
```


`crawl` 函数是网页 scraping 任务设置的最后一步。它会跟踪已访问 URLs，避免重复访问同一个页面，因为一个网站内多个页面可能都会链接到它。它还会从页面中提取不含 HTML tags 的原始文本，并把文本内容写入该页面对应的本地 .txt 文件。

```python
def crawl(url):
    # Parse the URL and get the domain
    local_domain = urlparse(url).netloc

    # Create a queue to store the URLs to crawl
    queue = deque([url])

    # Create a set to store the URLs that have already been seen (no duplicates)
    seen = set([url])

    # Create a directory to store the text files
    if not os.path.exists("text/"):
            os.mkdir("text/")

    if not os.path.exists("text/"+local_domain+"/"):
            os.mkdir("text/" + local_domain + "/")

    # Create a directory to store the csv files
    if not os.path.exists("processed"):
            os.mkdir("processed")

    # While the queue is not empty, continue crawling
    while queue:

        # Get the next URL from the queue
        url = queue.pop()
        print(url) # for debugging and to see the progress

        # Save text from the url to a <url>.txt file
        with open('text/'+local_domain+'/'+url[8:].replace("/", "_") + ".txt", "w", encoding="UTF-8") as f:

            # Get the text from the URL using BeautifulSoup
            soup = BeautifulSoup(requests.get(url).text, "html.parser")

            # Get the text but remove the tags
            text = soup.get_text()

            # If the crawler gets to a page that requires JavaScript, it will stop the crawl
            if ("You need to enable JavaScript to run this app." in text):
                print("Unable to parse page " + url + " due to JavaScript being required")

            # Otherwise, write the text to the file in the text directory
            f.write(text)

        # Get the hyperlinks from the URL and add them to the queue
        for link in get_domain_hyperlinks(local_domain, url):
            if link not in seen:
                queue.append(link)
                seen.add(link)

crawl(full_url)
```


上面示例的最后一行会运行爬虫，它会遍历所有可访问链接，并把这些页面转换为文本文件。根据你的网站大小和复杂度，运行过程可能需要几分钟。

## 构建 embeddings 索引






      CSV 是存储 embeddings 的常见格式。你可以在 Python 中使用这种格式：
      将原始文本文件（位于 text directory 中）转换为 Pandas data frames。
      Pandas 是一个流行的开源库，可帮助你处理表格数据（存储在行和列中的数据）。


      空白行会让文本文件变得杂乱，并使其更难处理。
      一个简单函数可以移除这些行，并整理文件。




```python
def remove_newlines(serie):
    serie = serie.str.replace('\n', ' ')
    serie = serie.str.replace('\\n', ' ')
    serie = serie.str.replace('  ', ' ')
    serie = serie.str.replace('  ', ' ')
    return serie
```


将文本转换为 CSV 需要遍历先前创建的 text directory 中的文本文件。打开每个文件后，移除多余空格，并将修改后的文本追加到列表中。然后，把移除换行后的文本加入一个空的 Pandas data frame，并把 data frame 写入 CSV 文件。

多余空格和换行会让文本变得杂乱，并使 embeddings 过程更复杂。这里使用的代码有助于移除其中一部分，但你可能会发现第三方 libraries 或其他方法也可用于去除更多不必要字符。

```python
import pandas as pd

# Create a list to store the text files
texts=[]

# Get all the text files in the text directory
for file in os.listdir("text/" + domain + "/"):

    # Open the file and read the text
    with open("text/" + domain + "/" + file, "r", encoding="UTF-8") as f:
        text = f.read()

        # Omit the first 11 lines and the last 4 lines, then replace -, _, and #update with spaces.
        texts.append((file[11:-4].replace('-',' ').replace('_', ' ').replace('#update',''), text))

# Create a dataframe from the list of texts
df = pd.DataFrame(texts, columns = ['fname', 'text'])

# Set the text column to be the raw text with the newlines removed
df['text'] = df.fname + ". " + remove_newlines(df.text)
df.to_csv('processed/scraped.csv')
df.head()
```


将原始文本保存为 CSV 文件后，下一步是 tokenization。这个过程会通过拆分句子和单词，把输入文本分割成 tokens。你可以在文档中[查看我们的 Tokenizer](https://platform.openai.com/tokenizer)，看到该过程的可视化演示。

&gt; 一个有用的经验法则是：对于常见英文文本，一个 token 通常约等于 4 个字符。这大约相当于 ¾ 个单词（因此 100 tokens ~= 75 个单词）。

API 对 embeddings 的输入 tokens 最大数量有限制。为了保持在限制以下，需要把 CSV 文件中的文本拆分成多行。首先记录每行的现有长度，以识别哪些行需要拆分。

```python
import tiktoken

# Load the cl100k_base tokenizer which is designed to work with the ada-002 model
tokenizer = tiktoken.get_encoding("cl100k_base")

df = pd.read_csv('processed/scraped.csv', index_col=0)
df.columns = ['title', 'text']

# Tokenize the text and save the number of tokens to a new column
df['n_tokens'] = df.text.apply(lambda x: len(tokenizer.encode(x)))

# Visualize the distribution of the number of tokens per row using a histogram
df.n_tokens.hist()
```




    &lt;img src="https://cdn.openai.com/API/docs/images/tutorials/web-qa/embeddings-initial-histrogram.png"
      alt="Embeddings histogram"
      width="553"
      height="413"
    /&gt;



最新的 embeddings model 可以处理最多 8191 个 input tokens 的输入，因此大多数行不需要 chunking；但对于抓取到的每个子页面，情况未必如此，所以下一个代码块会把更长的行拆分成更小的 chunks。

```python
max_tokens = 500

# Function to split the text into chunks of a maximum number of tokens
def split_into_many(text, max_tokens = max_tokens):

    # Split the text into sentences
    sentences = text.split('. ')

    # Get the number of tokens for each sentence
    n_tokens = [len(tokenizer.encode(" " + sentence)) for sentence in sentences]

    chunks = []
    tokens_so_far = 0
    chunk = []

    # Loop through the sentences and tokens joined together in a tuple
    for sentence, token in zip(sentences, n_tokens):

        # If the number of tokens so far plus the number of tokens in the current sentence is greater
        # than the max number of tokens, then add the chunk to the list of chunks and reset
        # the chunk and tokens so far
        if tokens_so_far + token > max_tokens:
            chunks.append(". ".join(chunk) + ".")
            chunk = []
            tokens_so_far = 0

        # If the number of tokens in the current sentence is greater than the max number of
        # tokens, go to the next sentence
        if token > max_tokens:
            continue

        # Otherwise, add the sentence to the chunk and add the number of tokens to the total
        chunk.append(sentence)
        tokens_so_far += token + 1

    return chunks


shortened = []

# Loop through the dataframe
for row in df.iterrows():

    # If the text is None, go to the next row
    if row[1]['text'] is None:
        continue

    # If the number of tokens is greater than the max number of tokens, split the text into chunks
    if row[1]['n_tokens'] > max_tokens:
        shortened += split_into_many(row[1]['text'])

    # Otherwise, add the text to the list of shortened texts
    else:
        shortened.append( row[1]['text'] )
```


再次可视化更新后的 histogram，有助于确认这些行是否已成功拆分为缩短后的部分。

```python
df = pd.DataFrame(shortened, columns = ['text'])
df['n_tokens'] = df.text.apply(lambda x: len(tokenizer.encode(x)))
df.n_tokens.hist()
```




    &lt;img src="https://cdn.openai.com/API/docs/images/tutorials/web-qa/embeddings-tokenized-output.png"
      alt="Embeddings tokenized output"
      width="552"
      height="418"
    /&gt;



现在内容已被拆分成更小的 chunks，可以向 OpenAI API 发送一个简单请求，指定使用新的 text-embedding-ada-002 model 来创建 embeddings：

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

df['embeddings'] = df.text.apply(lambda x: client.embeddings.create(input=x, engine='text-embedding-ada-002')['data'][0]['embedding'])

df.to_csv('processed/embeddings.csv')
df.head()
```


这大约需要 3-5 分钟，完成后你就会得到可供使用的 embeddings！

## 使用你的 embeddings 构建问答系统






      embeddings 已经准备好，此流程的最后一步是创建一个简单的问答系统。
      它会接收用户的问题，为其创建 embedding，并将其与现有 embeddings 比较，
      以从抓取的网站中检索最相关的文本。随后，
      gpt-3.5-turbo-instruct model 会基于检索到的文本生成自然的答案。




---

把 embeddings 转换为 NumPy array 是第一步。鉴于有许多 functions 可以操作 NumPy arrays，这会让使用方式更灵活。它还会把维度展平为 1-D，这是许多后续操作所需的格式。

```python
import numpy as np
from openai.embeddings_utils import distances_from_embeddings

df=pd.read_csv('processed/embeddings.csv', index_col=0)
df['embeddings'] = df['embeddings'].apply(eval).apply(np.array)

df.head()
```


既然数据已经准备好，就需要用一个简单函数把问题转换为 embedding。这很重要，因为使用 embeddings 的搜索会用 cosine distance 来比较数字向量（即原始文本转换后的结果）。如果这些向量在 cosine distance 上接近，它们就可能相关，并可能包含问题答案。OpenAI python package 内置了一个 `distances_from_embeddings` 函数，在这里很有用。

```python
def create_context(
    question, df, max_len=1800, size="ada"
):
    """
    Create a context for a question by finding the most similar context from the dataframe
    """

    # Get the embeddings for the question
    q_embeddings = client.embeddings.create(input=question, engine='text-embedding-ada-002')['data'][0]['embedding']

    # Get the distances from the embeddings
    df['distances'] = distances_from_embeddings(q_embeddings, df['embeddings'].values, distance_metric='cosine')


    returns = []
    cur_len = 0

    # Sort by distance and add the text to the context until the context is too long
    for i, row in df.sort_values('distances', ascending=True).iterrows():

        # Add the length of the text to the current length
        cur_len += row['n_tokens'] + 4

        # If the context is too long, break
        if cur_len > max_len:
            break

        # Else add it to the text that is being returned
        returns.append(row["text"])

    # Return the context
    return "\n\n###\n\n".join(returns)
```


文本已被拆分为更小的 token 集合，因此按升序遍历并持续添加文本，是确保答案完整的关键步骤。如果返回的内容多于期望，也可以把 max_len 修改为更小的值。

上一步只检索到了与问题在语义上相关的 text chunks，因此它们可能包含答案，但无法保证一定包含。通过返回最可能的前 5 个结果，可以进一步提高找到答案的概率。

回答 prompt 会尝试从检索到的 contexts 中提取相关事实，以构造连贯答案。如果没有相关答案，prompt 将返回 “I don’t know”。

可以使用 completion endpoint 和 `gpt-3.5-turbo-instruct` 创建一个听起来真实自然的问题答案。

```python
def answer_question(
    df,
    model="gpt-3.5-turbo-instruct",
    question="Am I allowed to publish model outputs to Twitter, without a human review?",
    max_len=1800,
    size="ada",
    debug=False,
    max_tokens=150,
    stop_sequence=None
):
    """
    Answer a question based on the most similar context from the dataframe texts
    """
    context = create_context(
        question,
        df,
        max_len=max_len,
        size=size,
    )
    # If debug, print the raw model response
    if debug:
        print("Context:\n" + context)
        print("\n\n")

    try:
        # Create a completion using the question and context
        response = client.completions.create(
            model=model,
            prompt=f"Answer the question based on the context below, and if the question can't be answered based on the context, say \"I don't know\"\n\nContext: {context}\n\n---\n\nQuestion: {question}\nAnswer:",
            temperature=0,
            max_tokens=max_tokens,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            stop=stop_sequence,
        )
        return response.choices[0].text.strip()
    except Exception as e:
        print(e)
        return ""
```


完成了！现在，一个具备 OpenAI 网站嵌入知识的可工作 Q/A 系统已经准备好。可以做几个快速测试来查看输出质量：

```python
answer_question(df, question="What day is it?", debug=False)

answer_question(df, question="What is our newest embeddings model?")

answer_question(df, question="What is ChatGPT?")
```


响应大致会如下所示：

```json
"I don't know."

'The newest embeddings model is text-embedding-ada-002.'

'ChatGPT is a model trained to interact in a conversational way. It is able to answer followup questions, admit its mistakes, challenge incorrect premises, and reject inappropriate requests.'
```

如果系统无法回答某个预期它能回答的问题，值得在原始文本文件中搜索，看看预期应被知道的信息是否真的被嵌入了。最初完成的 crawling process 被设置为跳过所提供原始域名之外的网站，因此如果相关知识位于某个 subdomain，它可能并不具备这些知识。

目前，每次回答问题时都会传入 dataframe。对于更生产化的工作流，应使用 [vector database solution](/mirror/api/docs/guides/embeddings#how-can-i-retrieve-k-nearest-embedding-vectors-quickly)，而不是把 embeddings 存储在 CSV 文件中；不过当前方法非常适合 prototyping。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
This tutorial walks through a simple example of crawling a website (in this example, the OpenAI website), turning the crawled pages into embeddings using the [Embeddings API](https://developers.openai.com/api/docs/guides/embeddings), and then creating a basic search functionality that allows a user to ask questions about the embedded information. This is intended to be a starting point for more sophisticated applications that make use of custom knowledge bases.

# Getting started

Some basic knowledge of Python and GitHub is helpful for this tutorial. Before diving in, make sure to [set up an OpenAI API key](https://developers.openai.com/api/docs/api-reference/introduction) and walk through the [quickstart tutorial](https://developers.openai.com/api/docs/quickstart). This will give a good intuition on how to use the API to its full potential.

Python is used as the main programming language along with the OpenAI, Pandas, transformers, NumPy, and other popular packages. If you run into any issues working through this tutorial, please ask a question on the [OpenAI Community Forum](https://community.openai.com).

To start with the code, clone the [full code for this tutorial on GitHub](https://github.com/openai/web-crawl-q-and-a-example). Alternatively, follow along and copy each section into a Jupyter notebook and run the code step by step, or just read along. A good way to avoid any issues is to set up a new virtual environment and install the required packages by running the following commands:

```bash
python -m venv env

source env/bin/activate

pip install -r requirements.txt
```

## Setting up a web crawler

The primary focus of this tutorial is the OpenAI API so if you prefer, you can skip the context on how to create a web crawler and just [download the source code](https://github.com/openai/web-crawl-q-and-a-example). Otherwise, expand the section below to work through the scraping mechanism implementation.

Learn how to build a web crawler

<div className="sandbox-preview">
  <div className="sandbox-screenshot">
    </div>
  <div className="preview-info">
    <div className="description">
      Acquiring data in text form is the first step to use embeddings. This
      tutorial creates a new set of data by crawling the OpenAI website, a
      technique that you can also use for your own company or personal website.
    </div>
    <div className="actions">
      

View source code


    </div>
  </div>
</div>

While this crawler is written from scratch, open source packages like [Scrapy](https://github.com/scrapy/scrapy) can also help with these operations.

This crawler will start from the root URL passed in at the bottom of the code below, visit each page, find additional links, and visit those pages as well (as long as they have the same root domain). To begin, import the required packages, set up the basic URL, and define a HTMLParser class.

```python
import requests
import re
import urllib.request
from bs4 import BeautifulSoup
from collections import deque
from html.parser import HTMLParser
from urllib.parse import urlparse
import os

# Regex pattern to match a URL
HTTP_URL_PATTERN = r'^http[s]*://.+'

domain = "openai.com" # <- put your domain to be crawled
full_url = "https://openai.com/" # <- put your domain to be crawled with https or http

# Create a class to parse the HTML and get the hyperlinks
class HyperlinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        # Create a list to store the hyperlinks
        self.hyperlinks = []

    # Override the HTMLParser's handle_starttag method to get the hyperlinks
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)

        # If the tag is an anchor tag and it has an href attribute, add the href attribute to the list of hyperlinks
        if tag == "a" and "href" in attrs:
            self.hyperlinks.append(attrs["href"])
```


The next function takes a URL as an argument, opens the URL, and reads the HTML content. Then, it returns all the hyperlinks found on that page.

```python
# Function to get the hyperlinks from a URL
def get_hyperlinks(url):

    # Try to open the URL and read the HTML
    try:
        # Open the URL and read the HTML
        with urllib.request.urlopen(url) as response:

            # If the response is not HTML, return an empty list
            if not response.info().get('Content-Type').startswith("text/html"):
                return []

            # Decode the HTML
            html = response.read().decode('utf-8')
    except Exception as e:
        print(e)
        return []

    # Create the HTML Parser and then Parse the HTML to get hyperlinks
    parser = HyperlinkParser()
    parser.feed(html)

    return parser.hyperlinks
```


The goal is to crawl through and index only the content that lives under the OpenAI domain. For this purpose, a function that calls the `get_hyperlinks` function but filters out any URLs that are not part of the specified domain is needed.

```python
# Function to get the hyperlinks from a URL that are within the same domain
def get_domain_hyperlinks(local_domain, url):
    clean_links = []
    for link in set(get_hyperlinks(url)):
        clean_link = None

        # If the link is a URL, check if it is within the same domain
        if re.search(HTTP_URL_PATTERN, link):
            # Parse the URL and check if the domain is the same
            url_obj = urlparse(link)
            if url_obj.netloc == local_domain:
                clean_link = link

        # If the link is not a URL, check if it is a relative link
        else:
            if link.startswith("/"):
                link = link[1:]
            elif link.startswith("#") or link.startswith("mailto:"):
                continue
            clean_link = "https://" + local_domain + "/" + link

        if clean_link is not None:
            if clean_link.endswith("/"):
                clean_link = clean_link[:-1]
            clean_links.append(clean_link)

    # Return the list of hyperlinks that are within the same domain
    return list(set(clean_links))
```


The `crawl` function is the final step in the web scraping task setup. It keeps track of the visited URLs to avoid repeating the same page, which might be linked across multiple pages on a site. It also extracts the raw text from a page without the HTML tags, and writes the text content into a local .txt file specific to the page.

```python
def crawl(url):
    # Parse the URL and get the domain
    local_domain = urlparse(url).netloc

    # Create a queue to store the URLs to crawl
    queue = deque([url])

    # Create a set to store the URLs that have already been seen (no duplicates)
    seen = set([url])

    # Create a directory to store the text files
    if not os.path.exists("text/"):
            os.mkdir("text/")

    if not os.path.exists("text/"+local_domain+"/"):
            os.mkdir("text/" + local_domain + "/")

    # Create a directory to store the csv files
    if not os.path.exists("processed"):
            os.mkdir("processed")

    # While the queue is not empty, continue crawling
    while queue:

        # Get the next URL from the queue
        url = queue.pop()
        print(url) # for debugging and to see the progress

        # Save text from the url to a <url>.txt file
        with open('text/'+local_domain+'/'+url[8:].replace("/", "_") + ".txt", "w", encoding="UTF-8") as f:

            # Get the text from the URL using BeautifulSoup
            soup = BeautifulSoup(requests.get(url).text, "html.parser")

            # Get the text but remove the tags
            text = soup.get_text()

            # If the crawler gets to a page that requires JavaScript, it will stop the crawl
            if ("You need to enable JavaScript to run this app." in text):
                print("Unable to parse page " + url + " due to JavaScript being required")

            # Otherwise, write the text to the file in the text directory
            f.write(text)

        # Get the hyperlinks from the URL and add them to the queue
        for link in get_domain_hyperlinks(local_domain, url):
            if link not in seen:
                queue.append(link)
                seen.add(link)

crawl(full_url)
```


The last line of the above example runs the crawler which goes through all the accessible links and turns those pages into text files. This will take a few minutes to run depending on the size and complexity of your site.

## Building an embeddings index

<div className="sandbox-preview">
  <div className="sandbox-screenshot">
    </div>
  <div className="preview-info">
    <div className="description">
      CSV is a common format for storing embeddings. You can use this format
      with Python by converting the raw text files (which are in the text
      directory) into Pandas data frames. Pandas is a popular open source
      library that helps you work with tabular data (data stored in rows and
      columns).
    </div>
    <div className="description">
      Blank empty lines can clutter the text files and make them harder to
      process. A simple function can remove those lines and tidy up the files.
    </div>
  </div>
</div>

```python
def remove_newlines(serie):
    serie = serie.str.replace('\n', ' ')
    serie = serie.str.replace('\\n', ' ')
    serie = serie.str.replace('  ', ' ')
    serie = serie.str.replace('  ', ' ')
    return serie
```


Converting the text to CSV requires looping through the text files in the text directory created earlier. After opening each file, remove the extra spacing and append the modified text to a list. Then, add the text with the new lines removed to an empty Pandas data frame and write the data frame to a CSV file.

Extra spacing and new lines can clutter the text and complicate the embeddings
  process. The code used here helps to remove some of them but you may find 3rd
  party libraries or other methods useful to get rid of more unnecessary
  characters.

```python
import pandas as pd

# Create a list to store the text files
texts=[]

# Get all the text files in the text directory
for file in os.listdir("text/" + domain + "/"):

    # Open the file and read the text
    with open("text/" + domain + "/" + file, "r", encoding="UTF-8") as f:
        text = f.read()

        # Omit the first 11 lines and the last 4 lines, then replace -, _, and #update with spaces.
        texts.append((file[11:-4].replace('-',' ').replace('_', ' ').replace('#update',''), text))

# Create a dataframe from the list of texts
df = pd.DataFrame(texts, columns = ['fname', 'text'])

# Set the text column to be the raw text with the newlines removed
df['text'] = df.fname + ". " + remove_newlines(df.text)
df.to_csv('processed/scraped.csv')
df.head()
```


Tokenization is the next step after saving the raw text into a CSV file. This process splits the input text into tokens by breaking down the sentences and words. A visual demonstration of this can be seen by [checking out our Tokenizer](https://platform.openai.com/tokenizer) in the docs.

> A helpful rule of thumb is that one token generally corresponds to ~4 characters of text for common English text. This translates to roughly ¾ of a word (so 100 tokens ~= 75 words).

The API has a limit on the maximum number of input tokens for embeddings. To stay below the limit, the text in the CSV file needs to be broken down into multiple rows. The existing length of each row will be recorded first to identify which rows need to be split.

```python
import tiktoken

# Load the cl100k_base tokenizer which is designed to work with the ada-002 model
tokenizer = tiktoken.get_encoding("cl100k_base")

df = pd.read_csv('processed/scraped.csv', index_col=0)
df.columns = ['title', 'text']

# Tokenize the text and save the number of tokens to a new column
df['n_tokens'] = df.text.apply(lambda x: len(tokenizer.encode(x)))

# Visualize the distribution of the number of tokens per row using a histogram
df.n_tokens.hist()
```


<div className="sandbox-preview">
  <div className="sandbox-screenshot">
    <img src="https://cdn.openai.com/API/docs/images/tutorials/web-qa/embeddings-initial-histrogram.png"
      alt="Embeddings histogram"
      width="553"
      height="413"
    />
  </div>
</div>

The newest embeddings model can handle inputs with up to 8191 input tokens so most of the rows would not need any chunking, but this may not be the case for every subpage scraped so the next code chunk will split the longer lines into smaller chunks.

```python
max_tokens = 500

# Function to split the text into chunks of a maximum number of tokens
def split_into_many(text, max_tokens = max_tokens):

    # Split the text into sentences
    sentences = text.split('. ')

    # Get the number of tokens for each sentence
    n_tokens = [len(tokenizer.encode(" " + sentence)) for sentence in sentences]

    chunks = []
    tokens_so_far = 0
    chunk = []

    # Loop through the sentences and tokens joined together in a tuple
    for sentence, token in zip(sentences, n_tokens):

        # If the number of tokens so far plus the number of tokens in the current sentence is greater
        # than the max number of tokens, then add the chunk to the list of chunks and reset
        # the chunk and tokens so far
        if tokens_so_far + token > max_tokens:
            chunks.append(". ".join(chunk) + ".")
            chunk = []
            tokens_so_far = 0

        # If the number of tokens in the current sentence is greater than the max number of
        # tokens, go to the next sentence
        if token > max_tokens:
            continue

        # Otherwise, add the sentence to the chunk and add the number of tokens to the total
        chunk.append(sentence)
        tokens_so_far += token + 1

    return chunks


shortened = []

# Loop through the dataframe
for row in df.iterrows():

    # If the text is None, go to the next row
    if row[1]['text'] is None:
        continue

    # If the number of tokens is greater than the max number of tokens, split the text into chunks
    if row[1]['n_tokens'] > max_tokens:
        shortened += split_into_many(row[1]['text'])

    # Otherwise, add the text to the list of shortened texts
    else:
        shortened.append( row[1]['text'] )
```


Visualizing the updated histogram again can help to confirm if the rows were successfully split into shortened sections.

```python
df = pd.DataFrame(shortened, columns = ['text'])
df['n_tokens'] = df.text.apply(lambda x: len(tokenizer.encode(x)))
df.n_tokens.hist()
```


<div className="sandbox-preview">
  <div className="sandbox-screenshot">
    <img src="https://cdn.openai.com/API/docs/images/tutorials/web-qa/embeddings-tokenized-output.png"
      alt="Embeddings tokenized output"
      width="552"
      height="418"
    />
  </div>
</div>

The content is now broken down into smaller chunks and a simple request can be sent to the OpenAI API specifying the use of the new text-embedding-ada-002 model to create the embeddings:

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

df['embeddings'] = df.text.apply(lambda x: client.embeddings.create(input=x, engine='text-embedding-ada-002')['data'][0]['embedding'])

df.to_csv('processed/embeddings.csv')
df.head()
```


This should take about 3-5 minutes but after you will have your embeddings ready to use!

## Building a question answer system with your embeddings

<div className="sandbox-preview">
  <div className="sandbox-screenshot">
    </div>
  <div className="preview-info">
    <div className="description">
      The embeddings are ready and the final step of this process is to create a
      simple question and answer system. This will take a user's question,
      create an embedding of it, and compare it with the existing embeddings to
      retrieve the most relevant text from the scraped website. The
      gpt-3.5-turbo-instruct model will then generate a natural sounding answer
      based on the retrieved text.
    </div>
  </div>
</div>

---

Turning the embeddings into a NumPy array is the first step, which will provide more flexibility in how to use it given the many functions available that operate on NumPy arrays. It will also flatten the dimension to 1-D, which is the required format for many subsequent operations.

```python
import numpy as np
from openai.embeddings_utils import distances_from_embeddings

df=pd.read_csv('processed/embeddings.csv', index_col=0)
df['embeddings'] = df['embeddings'].apply(eval).apply(np.array)

df.head()
```


The question needs to be converted to an embedding with a simple function, now that the data is ready. This is important because the search with embeddings compares the vector of numbers (which was the conversion of the raw text) using cosine distance. The vectors are likely related and might be the answer to the question if they are close in cosine distance. The OpenAI python package has a built in `distances_from_embeddings` function which is useful here.

```python
def create_context(
    question, df, max_len=1800, size="ada"
):
    """
    Create a context for a question by finding the most similar context from the dataframe
    """

    # Get the embeddings for the question
    q_embeddings = client.embeddings.create(input=question, engine='text-embedding-ada-002')['data'][0]['embedding']

    # Get the distances from the embeddings
    df['distances'] = distances_from_embeddings(q_embeddings, df['embeddings'].values, distance_metric='cosine')


    returns = []
    cur_len = 0

    # Sort by distance and add the text to the context until the context is too long
    for i, row in df.sort_values('distances', ascending=True).iterrows():

        # Add the length of the text to the current length
        cur_len += row['n_tokens'] + 4

        # If the context is too long, break
        if cur_len > max_len:
            break

        # Else add it to the text that is being returned
        returns.append(row["text"])

    # Return the context
    return "\n\n###\n\n".join(returns)
```


The text was broken up into smaller sets of tokens, so looping through in ascending order and continuing to add the text is a critical step to ensure a full answer. The max_len can also be modified to something smaller, if more content than desired is returned.

The previous step only retrieved chunks of texts that are semantically related to the question, so they might contain the answer, but there's no guarantee of it. The chance of finding an answer can be further increased by returning the top 5 most likely results.

The answering prompt will then try to extract the relevant facts from the retrieved contexts, in order to formulate a coherent answer. If there is no relevant answer, the prompt will return “I don’t know”.

A realistic sounding answer to the question can be created with the completion endpoint using `gpt-3.5-turbo-instruct`.

```python
def answer_question(
    df,
    model="gpt-3.5-turbo-instruct",
    question="Am I allowed to publish model outputs to Twitter, without a human review?",
    max_len=1800,
    size="ada",
    debug=False,
    max_tokens=150,
    stop_sequence=None
):
    """
    Answer a question based on the most similar context from the dataframe texts
    """
    context = create_context(
        question,
        df,
        max_len=max_len,
        size=size,
    )
    # If debug, print the raw model response
    if debug:
        print("Context:\n" + context)
        print("\n\n")

    try:
        # Create a completion using the question and context
        response = client.completions.create(
            model=model,
            prompt=f"Answer the question based on the context below, and if the question can't be answered based on the context, say \"I don't know\"\n\nContext: {context}\n\n---\n\nQuestion: {question}\nAnswer:",
            temperature=0,
            max_tokens=max_tokens,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            stop=stop_sequence,
        )
        return response.choices[0].text.strip()
    except Exception as e:
        print(e)
        return ""
```


It is done! A working Q/A system that has the knowledge embedded from the OpenAI website is now ready. A few quick tests can be done to see the quality of the output:

```python
answer_question(df, question="What day is it?", debug=False)

answer_question(df, question="What is our newest embeddings model?")

answer_question(df, question="What is ChatGPT?")
```


The responses will look something like the following:

```response
"I don't know."

'The newest embeddings model is text-embedding-ada-002.'

'ChatGPT is a model trained to interact in a conversational way. It is able to answer followup questions, admit its mistakes, challenge incorrect premises, and reject inappropriate requests.'
```

If the system is not able to answer a question that is expected, it is worth searching through the raw text files to see if the information that is expected to be known actually ended up being embedded or not. The crawling process that was done initially was setup to skip sites outside the original domain that was provided, so it might not have that knowledge if there was a subdomain setup.

Currently, the dataframe is being passed in each time to answer a question. For more production workflows, a [vector database solution](https://developers.openai.com/api/docs/guides/embeddings#how-can-i-retrieve-k-nearest-embedding-vectors-quickly) should be used instead of storing the embeddings in a CSV file, but the current approach is a great option for prototyping.
``````
:::
:::

