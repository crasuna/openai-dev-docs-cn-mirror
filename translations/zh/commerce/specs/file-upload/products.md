---
status: needs-review
sourceId: "63bed99a5173"
sourceChecksum: "63bed99a517300713290a0a448c968d71a60024df7da9200f14749a67cae66b0"
sourceUrl: "https://developers.openai.com/commerce/specs/file-upload/products"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# 商品

<div data-product-feed-version-container>
    <div data-product-feed-version-fragment>
      <h2 id="feed-reference">Feed 参考</h2>
      <p>
        为了让你的商品可以在 ChatGPT 中被发现，商家需要提供一个结构化的
        product feed 文件，供 OpenAI 摄取并建立索引。本规范定义了文件上传所用的商品
        schema：字段名称、数据类型、约束，以及实现准确发现、定价、可售性和卖家上下文所需的示例值。
      </p>
      <p>
        下方每个表格都会按 schema object 对字段分组，并说明字段是必填还是可选，
        同时提供校验规则，帮助你的工程团队构建和维护合规的上传文件。
      </p>
      <p>
        提供所有必填字段可确保你的商品能正确展示；可选字段则可以增强相关性和用户信任。
      </p>
      </div>
  </div>
