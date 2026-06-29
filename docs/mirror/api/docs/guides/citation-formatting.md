---
title: "引用格式化"
description: "Learn practical citation formatting patterns that help models generate reliable citations."
outline: deep
---

# 引用格式化

**文档集**：OpenAI API 文档<br>
**分组**：OpenAI API — 文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/citation-formatting](https://developers.openai.com/api/docs/guides/citation-formatting)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/citation-formatting.md](https://developers.openai.com/api/docs/guides/citation-formatting.md)
- 抓取时间：2026-06-27T05:54:00.136Z
- Checksum：`898ecb70dd5bffcbf20e69144200a77b56a58138acd7efddff13330924644748`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
可靠的引用可以建立信任，并帮助读者验证回答的准确性。本指南提供实用指导，说明如何准备可引用材料，并指示模型以 OpenAI 模型熟悉的模式有效地格式化引用。

## 概览

一个引用系统包含许多部分：你需要决定哪些内容可以被引用，清晰地表示这些材料，指示模型如何引用，并在结果渲染给用户之前验证它。

本指南涵盖模型直接接触到的五个核心元素：

1. 可引用单元：定义模型允许引用什么。
2. 材料表示：以清晰、结构化的格式呈现源材料。
3. 引用格式：指定模型应使用的确切引用格式。
4. Prompt 指令：告诉模型何时引用以及如何正确引用。
5. 引用解析：从模型响应中提取引用，供下游使用。

## 选择可引用单元

在编写 prompt 之前，先明确定义模型可以引用什么。常见选项包括：

| 可引用单元  | 最适合用于                                                   | 缺点                              | 示例                                                                                            |
| ----------- | ------------------------------------------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------- |
| 文档        | 你只需要显示答案来自哪个文档。                               | 精度不高。                        | 当你只需要显示哪份文档支持某个主张时，引用整本员工手册。                                      |
| 块 / chunk  | 你希望在简洁性和精度之间取得良好平衡。                       | 仍然无法精确到行。                | 引用包含该条款的特定合同段落或检索到的 chunk。                                                 |
| 行范围      | 你需要显示精确的支持文本。                                   | 对模型来说更困难。                | 当用户需要核验精确段落时，引用 `L42-L47` 行。                                                   |

一个好的可引用单元应该：

- 一致：同一个来源应在多次运行中保持相同 ID。
- 易于检查：人应该能够阅读它，并理解周围上下文。
- 大小合适：足够大以便有意义，但也足够小以保持精确。

对于大多数系统，块级引用是最佳默认选择。与行级引用相比，它通常对模型更容易；与文档级引用相比，它对用户更有用。

## 表示可引用材料

模型无法引用没有被清晰呈现的材料。无论材料来自工具，还是直接注入，都应确保它具备：

- 稳定 Source ID：一致的标识符，例如 `file1` 或 `block1`。
- 可读文本：格式清晰的源材料。
- 元数据（可选）：URL、时间戳、标题和类似上下文。

可引用材料示例

```text
Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}file0{CITATION_STOP}
Title: Employee Handbook
URL: https://company.example/handbook
Updated: 2026-03-01

[L1] Employees may work remotely up to three days per week.
[L2] Additional remote days require manager approval.
[L3] Exceptions may apply for approved accommodations.
```

&lt;strong&gt;Source ID 与 locator：&lt;/strong&gt;Source ID 是稳定的、模型生成的标识符，例如 &lt;code&gt;block1&lt;/code&gt;。locator 是精确的 UI 渲染高亮，例如 &lt;code&gt;lines L8-L13&lt;/code&gt; 或 &lt;code&gt;Paragraph 21&lt;/code&gt;。一般来说，模型应发出 Source ID，而由你的系统解析或渲染 locator。过早混合两者往往会增加格式错误。

## 定义引用格式

你需要定义模型将生成的引用格式。请使用一种明确、一致且便于模型可靠复现的格式。

下面是我们推荐的引用格式和标记。我们强烈推荐这些引用标记，因为它们与我们的模型训练中见过的标记高度相似。如果你选择不同的标记值，请尽量保持整体引用格式相似。

| 组成部分             | 作用                                                                                                 | 推荐值                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `CITATION_START`     | 打开引用标记。                                                                                       | `\ue200`                                 |
| 引用族               | 标识引用类型。对所有支持的来源使用 `cite`。                                                          | `cite`                                   |
| `CITATION_DELIMITER` | 分隔标记内的字段。                                                                                   | `\ue202`                                 |
| Source ID            | 标识被引用的单元。`turn#` 是轮次编号。`item#` 是具体文件、块或 URL。                                  | `turn0file1`, `turn0block1`, `turn0url1` |
| Locator（可选）      | 将引用缩小到精确范围。                                                                               | `L8-L13`                                 |
| `CITATION_STOP`      | 关闭引用标记。                                                                                       | `\ue201`                                 |

对于工具调用，&lt;code&gt;turnN&lt;/code&gt; 会按每次工具调用递增一次，而不是按每个单独结果递增。在一次调用内，来源通过 &lt;code&gt;file0&lt;/code&gt;、&lt;code&gt;file1&lt;/code&gt; 等后缀区分。在单响应系统中，只有当模型在回答前恰好进行一次工具调用时，所有引用才会都是 &lt;code&gt;turn0...&lt;/code&gt;。如果它进行了多次工具调用，你可能会看到类似 &lt;code&gt;turn0fileX&lt;/code&gt;、&lt;code&gt;turn1fileX&lt;/code&gt; 等引用。

### 模板

```text
{CITATION_START}<citation_family>{CITATION_DELIMITER}<source_id>{CITATION_DELIMITER}<locator>{CITATION_STOP}
```

### 示例

```text
{CITATION_START}cite{CITATION_DELIMITER}turn0file1{CITATION_DELIMITER}L8-L13{CITATION_STOP}
```

如果你的系统不使用 locator，请省略该字段：

```text
{CITATION_START}cite{CITATION_DELIMITER}turn0file1{CITATION_STOP}
```

## 编写有效的引用指令

为了保持最高准确性，请使用熟悉的引用模式。自定义或不熟悉的格式会增加模型的认知负担，导致引用错误，尤其是在以下场景中：

- reasoning effort 较低，模型用于从格式错误中恢复的预算更少。
- 高复杂度任务，大部分 reasoning 预算用于解决任务本身，而不是清理引用语法。

下面，我们推荐一种接近模型熟悉模式的引用格式。你可以直接使用，也可以调整以适配自己的系统。

如果你想定义自己的 prompt，请定义：

- 精确的标记语法。
- 引用放在哪里。
- 何时引用以及何时不引用。
- 如何引用多个支持来源。
- 哪些格式被禁止。
- 缺少支持来源时该怎么做。

推荐的 prompt 指令

请使用以下格式清楚地指示模型：

```md
## Citations

Results are returned by "tool_1". Each message from `tool_1` is called a "source" and identified by its reference ID, which is the first occurrence of 【turn\d+\w+\d+】 (e.g. 【turn2file1】). In this example, the string "turn2file1" would be the source reference ID.

Citations are references to `tool_1` sources. Citations may be used to refer to either a single source or multiple sources.

Citations to a single source must be written as {CITATION_START}cite{CITATION_DELIMITER}turn\d+\w+\d+{CITATION_STOP} (e.g. {CITATION_START}cite{CITATION_DELIMITER}turn2file5{CITATION_STOP}).

Citations to multiple sources must be written as {CITATION_START}cite{CITATION_DELIMITER}turn\d+\w+\d+{CITATION_DELIMITER}turn\d+\w+\d+{CITATION_DELIMITER}...{CITATION_STOP} (e.g. {CITATION_START}cite{CITATION_DELIMITER}turn2file5{CITATION_DELIMITER}turn2file1{CITATION_DELIMITER}...{CITATION_STOP}).

Citations must not be placed inside markdown bold, italics, or code fences, as they will not display correctly. Instead, place the citations outside the markdown block. Citations outside code fences may not be placed on the same line as the end of the code fence.

You must NOT write reference ID turn\d+\w+\d+ verbatim in the response text without putting them between {CITATION_START}...{CITATION_STOP}.

- Place citations at the end of the paragraph, or inline if the paragraph is long, unless the user requests specific citation placement.
- Citations must be placed after punctuation.
- Citations must not be all grouped together at the end of the response.
- Citations must not be put in a line or paragraph with nothing else but the citations themselves.
```

如果你希望模型也输出行号（`L1-L22`）这样的 locator，请在 prompt 中这样说明：

```text
You *must* cite any results you use from this tool using the:
`\ue200cite\ue202turn0file0\ue202L8-L13\ue201` format ONLY if the item has a corresponding citation marker.
```

- 不要尝试引用没有对应 citation marker 的 item，因为它们并不是用于引用的。
- 你必须在引用中包含行范围。

更高质量 grounding 的可选指令

当你需要更高质量的 grounding 行为时，以下规则通常值得包含。请根据你的用例需求调整本节。

```xml
<extra_considerations_for_citations>
- **Relevance:** Include only search results and citations that support the cited response text. Irrelevant sources permanently degrade user trust.
- **Diversity:** You must base your answer on sources from diverse domains, and cite accordingly.
- **Trustworthiness:** To produce a credible response, you must rely on high quality domains, and ignore information from less reputable domains unless they are the only source.
- **Accurate Representation:** Each citation must accurately reflect the source content. Selective interpretation of the source content is not allowed.

Remember, the quality of a domain/source depends on the context.
- When multiple viewpoints exist, cite sources covering the spectrum of opinions to ensure balance and comprehensiveness.
- When reliable sources disagree, cite at least one high-quality source for each major viewpoint.
- Ensure more than half of citations come from widely recognized authoritative outlets on the topic.
- For debated topics, cite at least one reliable source representing each major viewpoint.
- Do not ignore the content of a relevant source because it is low quality.
</extra_considerations_for_citations>
```

## 解析引用

模型发出引用后，你需要从响应文本中提取它们，这样就可以解析 source ID、渲染链接，或在向用户展示答案前移除原始标记。

下面的 helper 可直接复制到你的应用中。它会解析单来源引用、多来源引用和可选的行范围 locator，同时保留原始文本中的字符偏移。

此示例仅支持行 locator；如果你的系统使用不同的 locator 格式，应进行调整。

后处理器示例

引用解析 helper

```python
import re
from typing import Iterable, TypedDict

CITATION_START = "\ue200"
CITATION_DELIMITER = "\ue202"
CITATION_STOP = "\ue201"

SOURCE_ID_RE = re.compile(r"^[A-Za-z0-9_-]+$")
LINE_LOCATOR_RE = re.compile(r"^L\\d+(?:-L\\d+)?$")


class Citation(TypedDict):
    raw: str
    family: str
    source_ids: list[str]
    locator: str | None
    start: int
    end: int


def extract_citations(
    text: str,
    *,
    families: tuple[str, ...] = ("cite",),
) -> list[Citation]:
    """
    Extract citations such as:

      {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}
      {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_DELIMITER}L8-L13{CITATION_STOP}
      {CITATION_START}cite{CITATION_DELIMITER}turn0search0{CITATION_DELIMITER}turn1news2{CITATION_STOP}
    """
    if not families:
        return []

    family_pattern = "|".join(re.escape(family) for family in families)
    token_re = re.compile(
        rf"{re.escape(CITATION_START)}"
        rf"(?P<family>{family_pattern})"
        rf"{re.escape(CITATION_DELIMITER)}"
        rf"(?P<body>.*?)"
        rf"{re.escape(CITATION_STOP)}",
        re.DOTALL,
    )

    citations: list[Citation] = []

    for match in token_re.finditer(text):
        parts = [part.strip() for part in match.group("body").split(CITATION_DELIMITER)]
        parts = [part for part in parts if part]

        if not parts:
            continue

        locator = None
        if LINE_LOCATOR_RE.fullmatch(parts[-1]):
            locator = parts.pop()

        if not parts or any(not SOURCE_ID_RE.fullmatch(part) for part in parts):
            continue

        citations.append(
            {
                "raw": match.group(0),
                "family": match.group("family"),
                "source_ids": parts,
                "locator": locator,
                "start": match.start(),
                "end": match.end(),
            }
        )

    return citations


def strip_citations(text: str, citations: Iterable[Citation]) -> str:
    """
    Remove raw citation markers from text using offsets returned by
    extract_citations().
    """
    clean_text = text

    for citation in sorted(citations, key=lambda item: item["start"], reverse=True):
        clean_text = clean_text[: citation["start"]] + clean_text[citation["end"] :]

    return clean_text
```

```javascript
const CITATION_START = "\uE200";
const CITATION_DELIMITER = "\uE202";
const CITATION_STOP = "\uE201";

const SOURCE_ID_RE = /^[A-Za-z0-9_-]+$/;
const LINE_LOCATOR_RE = /^L\d+(?:-L\d+)?$/;

/**
 * @typedef {Object} Citation
 * @property {string} raw
 * @property {string} family
 * @property {string[]} source_ids
 * @property {string | null} locator
 * @property {number} start
 * @property {number} end
 */

/**
 * Extract citations such as:
 *
 *   {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}
 *   {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_DELIMITER}L8-L13{CITATION_STOP}
 *   {CITATION_START}cite{CITATION_DELIMITER}turn0search0{CITATION_DELIMITER}turn1news2{CITATION_STOP}
 *
 * @param {string} text
 * @param {{ families?: string[] }} [options]
 * @returns {Citation[]}
 */
function extractCitations(text, { families = ["cite"] } = {}) {
  if (families.length === 0) {
    return [];
  }

  const familyPattern = families
    .map((family) => family.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const tokenRe = new RegExp(
    `${CITATION_START}(?<family>${familyPattern})${CITATION_DELIMITER}(?<body>[\\s\\S]*?)${CITATION_STOP}`,
    "g"
  );

  /** @type {Citation[]} */
  const citations = [];

  for (const match of text.matchAll(tokenRe)) {
    const body = match.groups?.body ?? "";
    const parts = body
      .split(CITATION_DELIMITER)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      continue;
    }

    let locator = null;
    const lastPart = parts[parts.length - 1];
    if (LINE_LOCATOR_RE.test(lastPart)) {
      locator = parts.pop() ?? null;
    }

    if (parts.length === 0 || parts.some((part) => !SOURCE_ID_RE.test(part))) {
      continue;
    }

    citations.push({
      raw: match[0],
      family: match.groups?.family ?? "",
      source_ids: parts,
      locator,
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    });
  }

  return citations;
}

/**
 * @param {string} text
 * @param {Iterable<Citation>} citations
 * @returns {string}
 */
function stripCitations(text, citations) {
  let cleanText = text;
  const sortedCitations = Array.from(citations).sort(
    (left, right) => right.start - left.start
  );

  for (const citation of sortedCitations) {
    cleanText = cleanText.slice(0, citation.start) + cleanText.slice(citation.end);
  }

  return cleanText;
}
```


如果你的 source ID 使用不同的形状，请更新 `SOURCE_ID_RE` 以匹配你的系统。

## 示例

以下示例展示两种常见引用模式：

- 检索到的工具上下文，其中你的工具返回可引用材料和 ID。
- 注入的上下文，其中你直接在 prompt 中提供可引用块。

### 为检索到的工具上下文格式化引用

当模型通过工具检索上下文，并在答案中引用该检索上下文时，使用此模式。

#### 定义可引用单元

你应该根据用例所需精度选择可引用单元。下面的示例展示了几种可能的工具输出。

下面展示了几种推荐的工具输出格式。底层工具可能因应用而异，但最重要的是输出以清晰、稳定的结构呈现，如这些示例所示。

行级示例

以下是工具调用输出示例：

```text
Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}
[L1] The service agreement states that termination for convenience requires thirty (30) days’ written notice, unless superseded by a customer-specific addendum.
[L2] In practice, renewal terms auto-extend for successive one-year periods when no written non-renewal notice is received before the deadline.
[L3] Appendix B further clarifies that pricing exceptions must be approved in writing by both Finance and the account owner.

Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}turn0file1{CITATION_STOP}
...
```

这里，`turn0file0` 是稳定的 source ID。行号是 locator。

块级示例

以下是工具调用输出示例：

```text
Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}
[Block1]
The service agreement states that termination for convenience requires thirty (30) days’ written notice, unless superseded by a customer-specific addendum.
In practice, renewal terms auto-extend for successive one-year periods when no written non-renewal notice is received before the deadline.
Appendix B further clarifies that pricing exceptions must be approved in writing by both Finance and the account owner.

Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}turn0file1{CITATION_STOP}
[Block2]
...
```

如果你想使用块级引用而不是行级引用，推荐做法是让每个检索到的块都拥有自己的稳定 source ID，并仍然用相同的双字段 cite 形状引用它，例如 `{CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}`，而不是发明完全不同的引用族。

#### 编写 prompt 指令

```md
## Citations

Results are returned by "tool_1". Each message from `tool_1` is called a "source" and identified by its reference ID, which is the first occurrence of `turn\\d+file\\d+` (for example, `turn0file0` or `turn2file1`). In this example, the string `turn0file0` would be the source reference ID.

Citations are references to `tool_1` sources. Citations may be used to refer to either a single source or multiple sources.

A citation to a single source must be written as:
{CITATION_START}cite{CITATION_DELIMITER}turn\d+file\d+{CITATION_STOP}

If line-level citations are supported, a citation to a specific line range must be written as:
{CITATION_START}cite{CITATION_DELIMITER}turn\d+file\d+{CITATION_DELIMITER}L\d+-L\d+{CITATION_STOP}

Citations to multiple sources must be written by emitting multiple citation markers, one for each supporting source.

You must NOT write reference IDs like `turn0file0` verbatim in the response text without putting them between {CITATION_START}...{CITATION_STOP}.

- Place citations at the end of the supported sentence, or inline if the sentence is long and contains multiple supported clauses.
- Citations must be placed after punctuation.
- Cite only retrieved sources that directly support the cited text.
- Never invent source IDs, line ranges, or block locators that were not returned by the tool.
- If multiple retrieved sources materially support a proposition, cite all of them.
- If the retrieved sources disagree, cite the conflicting sources and describe the disagreement accurately.
```

示例输出：

```text
The on-call handoff process is documented in the weekly support sync notes. \ue200cite\ue202turn0file0\ue202L8-L13\ue201
```

### 为注入的上下文格式化引用

当你提前检索或准备上下文，并将其直接注入 prompt 时，使用此模式。

#### 定义可引用单元

对于注入的上下文，一种常见模式是用带有稳定 reference ID 的显式标签包裹 source segment。

```xml


The service agreement states that termination for convenience requires thirty (30) days’ written notice, unless superseded by a customer-specific addendum.
In practice, renewal terms auto-extend for successive one-year periods when no written non-renewal notice is received before the deadline.
Appendix B further clarifies that pricing exceptions must be approved in writing by both Finance and the account owner.





Syllabus


...
```

这会让可引用单元变得明确，也便于模型引用。

#### 编写 prompt 指令

```md
## Citations

Supporting context is provided directly in the prompt as citable units. Each citable unit is identified by the value of its `id` attribute in the first occurrence of a tag such as `

...

`. In this example, `block5` would be the source reference ID.

Because this pattern does not invoke tools, there is no tool turn counter to increment. That means you do not need to use a `turn#` prefix for the citation marker. You can keep IDs in a `turn0block5` style if that matches the rest of your system, or use plain IDs like `block5` as shown here. The key requirement is that the citation marker matches the injected context ID exactly and consistently.

Citations are references to these provided citable units. Citations may be used to refer to either a single source or multiple sources.

A citation to a single source must be written as:
{CITATION_START}cite{CITATION_DELIMITER}<block_id>{CITATION_STOP}

For example:
{CITATION_START}cite{CITATION_DELIMITER}block5{CITATION_STOP}

Citations to multiple sources must be written by emitting multiple citation markers, one for each supporting block.

You must NOT write block IDs verbatim in the response text without putting them between {CITATION_START}...{CITATION_STOP}.

- Place citations at the end of the supported sentence, or inline if the sentence is long and contains multiple supported clauses.
- Citations must be placed after punctuation.
- Cite only blocks that appear in the provided context.
- Never invent new block IDs.
- Never cite outside knowledge or outside authorities.
- If multiple blocks materially support a proposition, cite all of them.
- If the provided blocks conflict, cite the conflicting blocks and describe the conflict accurately.
```

示例输出：

```text
The Court held that the District Court lacked personal jurisdiction over the petitioner. \ue200cite\ue202block5\ue201
```

&lt;strong&gt;注意：&lt;/strong&gt;OpenAI 托管工具（如 web search）会提供自动内联引用。如果你想改用托管工具，请参阅 &lt;a href="/api/docs/guides/tools"&gt;tools overview&lt;/a&gt;、&lt;a href="/api/docs/guides/tools-web-search"&gt;web search guide&lt;/a&gt; 和 &lt;a href="/api/docs/guides/tools-file-search"&gt;file search guide&lt;/a&gt;。

:::

## English source

::: details 展开英文原文
::: v-pre
Reliable citations build trust and help readers verify the accuracy of responses. This guide provides practical guidance on how to prepare citable material and instruct the model to format citations effectively, using patterns that are familiar to OpenAI models.

## Overview

A citation system has many parts: you decide what can be cited, represent that material clearly, instruct the model how to cite it, and validate the result before it renders to the user.

This guide covers five core elements experienced directly by the model:

1. Citable units: Define what the model is allowed to cite.
2. Material representation: Present the source material in a clear, structured format.
3. Citation format: Specify the exact format the model should use for citations.
4. Prompt instructions: Tell the model when to cite and how to do it correctly.
5. Citation parsing: Extract the citations from the model’s response for downstream use.

## Choose citable units

Before writing prompts, clearly define what the model can cite. Common options include:

| Citable unit  | Best used for                                              | Downside                          | Example                                                                                         |
| ------------- | ---------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------- |
| Document      | You only need to show which document the answer came from. | Not very precise.                 | Cite the entire employee handbook when you only need to show which document supports the claim. |
| Block / chunk | You want a good balance between simplicity and precision.  | Still not exact down to the line. | Cite the specific contract paragraph or retrieved chunk that contains the clause.               |
| Line range    | You need to show the exact supporting text.                | More difficult for the model.     | Cite lines `L42-L47` when the user needs to verify the precise passage.                         |

A good citable unit should be:

- Consistent: the same source should keep the same ID across runs.
- Easy to inspect: a person should be able to read it and understand the surrounding context.
- The right size: large enough to make sense, but small enough to stay precise.

For most systems, block-level citations are the best default. They are usually easier for the model than line-level citations and more useful to users than document-level citations.

## Represent citable material

The model cannot cite material that has not been presented clearly. Whether material comes from a tool or is injected directly, ensure it has:

- Stable Source ID: Consistent identifier like `file1` or `block1`.
- Readable Text: Clearly formatted source material.
- Metadata (optional): URLs, timestamps, titles, and similar context.

Example citable material

```text
Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}file0{CITATION_STOP}
Title: Employee Handbook
URL: https://company.example/handbook
Updated: 2026-03-01

[L1] Employees may work remotely up to three days per week.
[L2] Additional remote days require manager approval.
[L3] Exceptions may apply for approved accommodations.
```

&lt;strong&gt;Source IDs vs. locators:&lt;/strong&gt; A source ID is a stable,
  model-generated identifier such as &lt;code&gt;block1&lt;/code&gt;. A locator is the
  precise UI-rendered highlight, such as &lt;code&gt;lines L8-L13&lt;/code&gt; or 
  &lt;code&gt;Paragraph 21&lt;/code&gt;. In general, the model should emit the source ID,
  while your system resolves or renders the locator. Mixing the two too early
  tends to increase formatting errors.

## Define citation format

You need to define the citation format that the model will generate. Use a
format that is explicit, consistent, and easy for the model to reproduce
reliably.

Below is our recommended citation format and the markers we recommend. These
citation markers are highly recommended because they closely match the markers
our models are trained on. If you choose different marker values, keep the overall citation format as similar as possible.

| Piece                | What it does                                                                                        | Recommended                              |
| -------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `CITATION_START`     | Opens the citation marker.                                                                          | `\ue200`                                 |
| Citation family      | Identifies the citation type. Use `cite` for all supported sources.                                 | `cite`                                   |
| `CITATION_DELIMITER` | Separates fields inside the marker.                                                                 | `\ue202`                                 |
| Source ID            | Identifies the cited unit. `turn#` is the turn number. `item#` is the specific file, block, or URL. | `turn0file1`, `turn0block1`, `turn0url1` |
| Locator (optional)   | Narrows the citation to a precise span.                                                             | `L8-L13`                                 |
| `CITATION_STOP`      | Closes the citation marker.                                                                         | `\ue201`                                 |

For tool calls, &lt;code&gt;turnN&lt;/code&gt; increments once per tool invocation, not
  once per individual result. Within a single invocation, sources are
  distinguished by suffixes such as &lt;code&gt;file0&lt;/code&gt;, &lt;code&gt;file1&lt;/code&gt;, and
  so on. In a single-response system, all references will be 
  &lt;code&gt;turn0...&lt;/code&gt; only if the model makes exactly one tool call before
  answering. If it makes multiple tool calls, you may instead see references
  like &lt;code&gt;turn0fileX&lt;/code&gt;, &lt;code&gt;turn1fileX&lt;/code&gt;, and so on.

### Template

```text
{CITATION_START}<citation_family>{CITATION_DELIMITER}<source_id>{CITATION_DELIMITER}<locator>{CITATION_STOP}
```

### Example

```text
{CITATION_START}cite{CITATION_DELIMITER}turn0file1{CITATION_DELIMITER}L8-L13{CITATION_STOP}
```

If your system does not use locators, omit that field:

```text
{CITATION_START}cite{CITATION_DELIMITER}turn0file1{CITATION_STOP}
```

## Write effective citation instructions

To maintain maximum accuracy, use familiar citation patterns. Custom or unfamiliar formats increase cognitive load on the model, leading to citation errors, especially in:

- low reasoning effort, where the model has less budget to recover from formatting mistakes.
- high-complexity tasks, where most of the reasoning budget is spent on solving the task itself rather than cleaning up citation syntax.

Below, we recommend a citation format that is close to patterns the model is familiar with. You can use it as-is or adapt it to fit your own system.

If you want to define your own prompt, define:

- the exact marker syntax.
- where citations go.
- when to cite and when not to cite.
- how to cite multiple supports.
- what formats are forbidden.
- what to do when support is missing.

Recommended prompt instructions

Clearly instruct the model using the following format:

```md
## Citations

Results are returned by "tool_1". Each message from `tool_1` is called a "source" and identified by its reference ID, which is the first occurrence of 【turn\d+\w+\d+】 (e.g. 【turn2file1】). In this example, the string "turn2file1" would be the source reference ID.

Citations are references to `tool_1` sources. Citations may be used to refer to either a single source or multiple sources.

Citations to a single source must be written as {CITATION_START}cite{CITATION_DELIMITER}turn\d+\w+\d+{CITATION_STOP} (e.g. {CITATION_START}cite{CITATION_DELIMITER}turn2file5{CITATION_STOP}).

Citations to multiple sources must be written as {CITATION_START}cite{CITATION_DELIMITER}turn\d+\w+\d+{CITATION_DELIMITER}turn\d+\w+\d+{CITATION_DELIMITER}...{CITATION_STOP} (e.g. {CITATION_START}cite{CITATION_DELIMITER}turn2file5{CITATION_DELIMITER}turn2file1{CITATION_DELIMITER}...{CITATION_STOP}).

Citations must not be placed inside markdown bold, italics, or code fences, as they will not display correctly. Instead, place the citations outside the markdown block. Citations outside code fences may not be placed on the same line as the end of the code fence.

You must NOT write reference ID turn\d+\w+\d+ verbatim in the response text without putting them between {CITATION_START}...{CITATION_STOP}.

- Place citations at the end of the paragraph, or inline if the paragraph is long, unless the user requests specific citation placement.
- Citations must be placed after punctuation.
- Citations must not be all grouped together at the end of the response.
- Citations must not be put in a line or paragraph with nothing else but the citations themselves.
```

If you want the model to also output locators such as lines (`L1-L22`), specify it in the prompt like this:

```text
You *must* cite any results you use from this tool using the:
`\ue200cite\ue202turn0file0\ue202L8-L13\ue201` format ONLY if the item has a corresponding citation marker.
```

- Do not attempt to cite items without a corresponding citation marker, as they are not meant to be cited.
- You MUST include line ranges in your citations.

Optional instructions for higher-quality grounding

The following rules are often worth including when you need higher-quality grounding behavior. Adapt this section based on your use case requirements.

```xml
<extra_considerations_for_citations>
- **Relevance:** Include only search results and citations that support the cited response text. Irrelevant sources permanently degrade user trust.
- **Diversity:** You must base your answer on sources from diverse domains, and cite accordingly.
- **Trustworthiness:** To produce a credible response, you must rely on high quality domains, and ignore information from less reputable domains unless they are the only source.
- **Accurate Representation:** Each citation must accurately reflect the source content. Selective interpretation of the source content is not allowed.

Remember, the quality of a domain/source depends on the context.
- When multiple viewpoints exist, cite sources covering the spectrum of opinions to ensure balance and comprehensiveness.
- When reliable sources disagree, cite at least one high-quality source for each major viewpoint.
- Ensure more than half of citations come from widely recognized authoritative outlets on the topic.
- For debated topics, cite at least one reliable source representing each major viewpoint.
- Do not ignore the content of a relevant source because it is low quality.
</extra_considerations_for_citations>
```

## Parse citations

Once the model emits citations, you need to extract them from the response text
so you can resolve source IDs, render links, or remove the raw markers before
showing the answer to users.

The helper below is designed to be copied directly into your application. It
parses single-source citations, multi-source citations, and optional line-range
locators while preserving character offsets in the original text.

This example supports line locators only and should be adapted if your system
uses a different locator format.

Post-processor examples

Citation parsing helpers

```python
import re
from typing import Iterable, TypedDict

CITATION_START = "\ue200"
CITATION_DELIMITER = "\ue202"
CITATION_STOP = "\ue201"

SOURCE_ID_RE = re.compile(r"^[A-Za-z0-9_-]+$")
LINE_LOCATOR_RE = re.compile(r"^L\\d+(?:-L\\d+)?$")


class Citation(TypedDict):
    raw: str
    family: str
    source_ids: list[str]
    locator: str | None
    start: int
    end: int


def extract_citations(
    text: str,
    *,
    families: tuple[str, ...] = ("cite",),
) -> list[Citation]:
    """
    Extract citations such as:

      {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}
      {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_DELIMITER}L8-L13{CITATION_STOP}
      {CITATION_START}cite{CITATION_DELIMITER}turn0search0{CITATION_DELIMITER}turn1news2{CITATION_STOP}
    """
    if not families:
        return []

    family_pattern = "|".join(re.escape(family) for family in families)
    token_re = re.compile(
        rf"{re.escape(CITATION_START)}"
        rf"(?P<family>{family_pattern})"
        rf"{re.escape(CITATION_DELIMITER)}"
        rf"(?P<body>.*?)"
        rf"{re.escape(CITATION_STOP)}",
        re.DOTALL,
    )

    citations: list[Citation] = []

    for match in token_re.finditer(text):
        parts = [part.strip() for part in match.group("body").split(CITATION_DELIMITER)]
        parts = [part for part in parts if part]

        if not parts:
            continue

        locator = None
        if LINE_LOCATOR_RE.fullmatch(parts[-1]):
            locator = parts.pop()

        if not parts or any(not SOURCE_ID_RE.fullmatch(part) for part in parts):
            continue

        citations.append(
            {
                "raw": match.group(0),
                "family": match.group("family"),
                "source_ids": parts,
                "locator": locator,
                "start": match.start(),
                "end": match.end(),
            }
        )

    return citations


def strip_citations(text: str, citations: Iterable[Citation]) -> str:
    """
    Remove raw citation markers from text using offsets returned by
    extract_citations().
    """
    clean_text = text

    for citation in sorted(citations, key=lambda item: item["start"], reverse=True):
        clean_text = clean_text[: citation["start"]] + clean_text[citation["end"] :]

    return clean_text
```

```javascript
const CITATION_START = "\uE200";
const CITATION_DELIMITER = "\uE202";
const CITATION_STOP = "\uE201";

const SOURCE_ID_RE = /^[A-Za-z0-9_-]+$/;
const LINE_LOCATOR_RE = /^L\d+(?:-L\d+)?$/;

/**
 * @typedef {Object} Citation
 * @property {string} raw
 * @property {string} family
 * @property {string[]} source_ids
 * @property {string | null} locator
 * @property {number} start
 * @property {number} end
 */

/**
 * Extract citations such as:
 *
 *   {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}
 *   {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_DELIMITER}L8-L13{CITATION_STOP}
 *   {CITATION_START}cite{CITATION_DELIMITER}turn0search0{CITATION_DELIMITER}turn1news2{CITATION_STOP}
 *
 * @param {string} text
 * @param {{ families?: string[] }} [options]
 * @returns {Citation[]}
 */
function extractCitations(text, { families = ["cite"] } = {}) {
  if (families.length === 0) {
    return [];
  }

  const familyPattern = families
    .map((family) => family.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const tokenRe = new RegExp(
    `${CITATION_START}(?<family>${familyPattern})${CITATION_DELIMITER}(?<body>[\\s\\S]*?)${CITATION_STOP}`,
    "g"
  );

  /** @type {Citation[]} */
  const citations = [];

  for (const match of text.matchAll(tokenRe)) {
    const body = match.groups?.body ?? "";
    const parts = body
      .split(CITATION_DELIMITER)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      continue;
    }

    let locator = null;
    const lastPart = parts[parts.length - 1];
    if (LINE_LOCATOR_RE.test(lastPart)) {
      locator = parts.pop() ?? null;
    }

    if (parts.length === 0 || parts.some((part) => !SOURCE_ID_RE.test(part))) {
      continue;
    }

    citations.push({
      raw: match[0],
      family: match.groups?.family ?? "",
      source_ids: parts,
      locator,
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    });
  }

  return citations;
}

/**
 * @param {string} text
 * @param {Iterable<Citation>} citations
 * @returns {string}
 */
function stripCitations(text, citations) {
  let cleanText = text;
  const sortedCitations = Array.from(citations).sort(
    (left, right) => right.start - left.start
  );

  for (const citation of sortedCitations) {
    cleanText = cleanText.slice(0, citation.start) + cleanText.slice(citation.end);
  }

  return cleanText;
}
```


If your source IDs use a different shape, update `SOURCE_ID_RE` to match your
system.

## Examples

The examples below show two common citation patterns:

- Retrieved tool context, where your tool returns citable material and IDs.
- Injected context, where you provide citable blocks directly in the prompt.

### Format citations for retrieved tool context

Use this pattern when the model retrieves context through a tool and cites that retrieved context in its answer.

#### Define citable units

You should choose the citable units based on the precision required for your use case. The examples below show a few possible tool outputs.

The examples below show a few recommended tool output formats. The underlying tool may vary by application, but what matters most is that the output is presented in a clear, stable structure like these examples.

Line-level example

The following is an example of the tool call output:

```text
Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}
[L1] The service agreement states that termination for convenience requires thirty (30) days’ written notice, unless superseded by a customer-specific addendum.
[L2] In practice, renewal terms auto-extend for successive one-year periods when no written non-renewal notice is received before the deadline.
[L3] Appendix B further clarifies that pricing exceptions must be approved in writing by both Finance and the account owner.

Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}turn0file1{CITATION_STOP}
...
```

Here, `turn0file0` is the stable source ID. The line numbers are the locators.

Block-level example

The following is an example of the tool call output:

```text
Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}
[Block1]
The service agreement states that termination for convenience requires thirty (30) days’ written notice, unless superseded by a customer-specific addendum.
In practice, renewal terms auto-extend for successive one-year periods when no written non-renewal notice is received before the deadline.
Appendix B further clarifies that pricing exceptions must be approved in writing by both Finance and the account owner.

Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}turn0file1{CITATION_STOP}
[Block2]
...
```

If you want block-level citations instead of line-level citations, the recommended option is to make each retrieved block its own stable source ID and still cite it with the same two-field cite shape, for example `{CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}`, rather than inventing a completely different citation family.

#### Write prompt instructions

```md
## Citations

Results are returned by "tool_1". Each message from `tool_1` is called a "source" and identified by its reference ID, which is the first occurrence of `turn\\d+file\\d+` (for example, `turn0file0` or `turn2file1`). In this example, the string `turn0file0` would be the source reference ID.

Citations are references to `tool_1` sources. Citations may be used to refer to either a single source or multiple sources.

A citation to a single source must be written as:
{CITATION_START}cite{CITATION_DELIMITER}turn\d+file\d+{CITATION_STOP}

If line-level citations are supported, a citation to a specific line range must be written as:
{CITATION_START}cite{CITATION_DELIMITER}turn\d+file\d+{CITATION_DELIMITER}L\d+-L\d+{CITATION_STOP}

Citations to multiple sources must be written by emitting multiple citation markers, one for each supporting source.

You must NOT write reference IDs like `turn0file0` verbatim in the response text without putting them between {CITATION_START}...{CITATION_STOP}.

- Place citations at the end of the supported sentence, or inline if the sentence is long and contains multiple supported clauses.
- Citations must be placed after punctuation.
- Cite only retrieved sources that directly support the cited text.
- Never invent source IDs, line ranges, or block locators that were not returned by the tool.
- If multiple retrieved sources materially support a proposition, cite all of them.
- If the retrieved sources disagree, cite the conflicting sources and describe the disagreement accurately.
```

Example output:

```text
The on-call handoff process is documented in the weekly support sync notes. \ue200cite\ue202turn0file0\ue202L8-L13\ue201
```

### Format citations for injected context

Use this pattern when you retrieve or prepare the context ahead of time and inject it directly into the prompt.

#### Define citable units

For injected context, a common pattern is to wrap source segments in explicit tags with stable reference IDs.

```xml


The service agreement states that termination for convenience requires thirty (30) days’ written notice, unless superseded by a customer-specific addendum.
In practice, renewal terms auto-extend for successive one-year periods when no written non-renewal notice is received before the deadline.
Appendix B further clarifies that pricing exceptions must be approved in writing by both Finance and the account owner.





Syllabus


...
```

This makes the citable unit explicit and easy for the model to reference.

#### Write prompt instructions

```md
## Citations

Supporting context is provided directly in the prompt as citable units. Each citable unit is identified by the value of its `id` attribute in the first occurrence of a tag such as `

...

`. In this example, `block5` would be the source reference ID.

Because this pattern does not invoke tools, there is no tool turn counter to increment. That means you do not need to use a `turn#` prefix for the citation marker. You can keep IDs in a `turn0block5` style if that matches the rest of your system, or use plain IDs like `block5` as shown here. The key requirement is that the citation marker matches the injected context ID exactly and consistently.

Citations are references to these provided citable units. Citations may be used to refer to either a single source or multiple sources.

A citation to a single source must be written as:
{CITATION_START}cite{CITATION_DELIMITER}<block_id>{CITATION_STOP}

For example:
{CITATION_START}cite{CITATION_DELIMITER}block5{CITATION_STOP}

Citations to multiple sources must be written by emitting multiple citation markers, one for each supporting block.

You must NOT write block IDs verbatim in the response text without putting them between {CITATION_START}...{CITATION_STOP}.

- Place citations at the end of the supported sentence, or inline if the sentence is long and contains multiple supported clauses.
- Citations must be placed after punctuation.
- Cite only blocks that appear in the provided context.
- Never invent new block IDs.
- Never cite outside knowledge or outside authorities.
- If multiple blocks materially support a proposition, cite all of them.
- If the provided blocks conflict, cite the conflicting blocks and describe the conflict accurately.
```

Example output:

```text
The Court held that the District Court lacked personal jurisdiction over the petitioner. \ue200cite\ue202block5\ue201
```

&lt;strong&gt;Note:&lt;/strong&gt; OpenAI-hosted tools such as web search provide
  automatic inline citations. If you want to use hosted tools instead, see the 
  &lt;a href="/api/docs/guides/tools"&gt;tools overview&lt;/a&gt;, 
  &lt;a href="/api/docs/guides/tools-web-search"&gt;web search guide&lt;/a&gt;, and 
  &lt;a href="/api/docs/guides/tools-file-search"&gt;file search guide&lt;/a&gt;.

:::
:::

