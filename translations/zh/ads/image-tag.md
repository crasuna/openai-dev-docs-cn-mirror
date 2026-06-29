---
status: needs-review
sourceId: "9267ac3009fe"
sourceChecksum: "9267ac3009fe85ac0a9bebdf2abe2c4fa795297c18fdff7fec7d71a471b4cbf4"
sourceUrl: "https://developers.openai.com/ads/image-tag"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# Image tag（图片标签）

使用 image tag 在页面加载时发送网站 conversion，而不运行 JavaScript。每个图片请求会发送一个 event。

对于页面加载后由点击、表单提交或其他交互触发的 events，请使用 [JavaScript Pixel](https://developers.openai.com/ads/measurement-pixel)。当你可以从服务器发送 event 时，请使用 [Conversions API](https://developers.openai.com/ads/conversions-api)。

## 安装 image tag

在 event 发生页面的 `<body>` 中添加一个隐藏的 1 × 1 图片：

```html
<img
  src="https://bzr.openai.com/v1/sdk/events
?pid=<PIXEL-ID>
&event=page_viewed
&data[type]=contents"
  width="1"
  height="1"
  style="display:none"
  alt=""
/>
```

将 `<PIXEL-ID>` 替换为 Ads Manager 中 conversions 标签页里的 Pixel ID。只有在收集到 measurement 所需的任何 consent 后，才渲染该 tag。

若要将该图片作为 JavaScript Pixel 的 fallback，请把它放在页面 body 的 `<noscript>` 元素中。这样 tag 只会在 JavaScript 不可用时加载：

```html
<noscript>
  <img
    src="https://bzr.openai.com/v1/sdk/events
?pid=<PIXEL-ID>
&event=page_viewed
&data[type]=contents"
    width="1"
    height="1"
    style="display:none"
    alt=""
  />
</noscript>
```

对于应该在浏览器运行 JavaScript 时执行的独立 image-tag 集成，不要使用 `<noscript>`。

## 添加 event data

将 `event` 设为[受支持的 event name](https://developers.openai.com/ads/supported-events)，并将 `data[type]` 设为该 event 文档中说明的 data type。每个 event data field 都要加上 `data[...]` 前缀。

此示例会发送一个 `order_created` event，带有金额、货币、去重 ID 和归因标识符：

```html
<img
  src="https://bzr.openai.com/v1/sdk/events
?pid=<PIXEL-ID>
&event=order_created
&event_id=evt_01JX8M6K4Q7F9A2B3C5D6E7F8G
&oppref=<OPPREF>
&data[type]=contents
&data[amount]=2599
&data[currency]=USD"
  width="1"
  height="1"
  style="display:none"
  alt=""
/>
```

如果有可用的 `oppref` 值，请将 `<OPPREF>` 替换为该值。否则移除 `oppref` 参数。Image tag 不会替你捕获或存储 `oppref`。

所有动态查询值都必须 URL-encoded。对于 `data[contents]`，请将 contents array 序列化为 JSON，然后对完整 JSON 值进行 URL-encode。保持请求足够小，以适配浏览器和服务器 URL 长度限制。

如果你通过 image tag 和 Conversions API 发送同一个 conversion，请使用 image tag 的 `event_id` 值作为 Conversions API event 的 `id`，并为两个 events 使用相同 Pixel ID。对于 custom events，也请使用相同的 `custom_event_name`。了解如何[防止重复的 browser 和 server events](https://developers.openai.com/ads/conversions-api#deduplicate-browser-and-server-events)。

## 发送 custom event

仅当没有标准 event 描述该 conversion 时，才使用 `event=custom`。Custom event 还需要 `custom_event_name` 和 `data[type]=custom`：

```html
<img
  src="https://bzr.openai.com/v1/sdk/events
?pid=<PIXEL-ID>
&event=custom
&custom_event_name=quote_requested
&event_id=evt_01JX8M9T2V4W6Y8Z0A1B3C5D7E
&data[type]=custom
&data[plan_id]=enterprise"
  width="1"
  height="1"
  style="display:none"
  alt=""
/>
```

Custom event names 必须为 1 到 64 个字符，只能包含字母、数字、下划线或连字符，并且以字母或数字开头和结尾。Custom event name 不能匹配标准 event name。为保持一致性，请使用小写名称。

## 参数

| 参数                | 是否必填 | 发送内容 |
| ------------------- | -------- | ------------ |
| `pid`               | 是 | 你的 Pixel ID。 |
| `event`             | 是 | 一个[受支持的 event name](https://developers.openai.com/ads/supported-events)，或 `custom`。 |
| `custom_event_name` | 视情况而定 | 当 `event=custom` 时必填。标准 events 请省略它。 |
| `event_id`          | 否 | 唯一去重 ID。仅在重试或通过其他 channel 发送同一个 conversion 时复用。 |
| `oppref`            | 否 | OpenAI 提供的隐私保护归因标识符。 |
| `data[type]`        | 是 | event 所需的 [data type](https://developers.openai.com/ads/supported-events#event-data-shapes)。 |
| `data[<field>]`     | 否 | 所选 data type 文档中说明的任何字段。OpenAI 会拒绝未知字段。 |

每个参数最多提供一次。Amounts 和 quantities 是整数。如果包含 `data[amount]`，还要包含 `data[currency]`，其值应为三字母 ISO 4217 代码，例如 `USD`。

## 测试请求

尽可能使用测试 Pixel ID。此命令会发送一个真实的 `page_viewed` event，并打印 HTTP status 和 response content type：

```bash
curl --get --silent --show-error \
  --header "Referer: https://shop.example.com/pricing" \
  --data-urlencode "pid=<PIXEL-ID>" \
  --data-urlencode "event=page_viewed" \
  --data-urlencode "event_id=evt_image_tag_test_01" \
  --data-urlencode "data[type]=contents" \
  --output /dev/null \
  --write-out "%{http_code} %{content_type}\n" \
  "https://bzr.openai.com/v1/sdk/events"
```

被接受的请求会返回：

```text
200 image/gif
```

`200` 响应确认 OpenAI 已将 event 发布到其 ingestion pipeline。它并不确认下游 event processing 已完成。在浏览器中，请使用 Network 面板检查隐藏图片请求及其状态。

## 限制

- 静态 image tag 会随页面加载。它无法 measurement 稍后发生的点击、表单提交或其他交互。
- 每个请求发送一个 event。Image tag 不会批量发送 events。
- GET 请求存在 URL 长度限制。对于较大的 `contents` arrays 或其他大型 payload，请使用 JavaScript Pixel 或 Conversions API。
- Image tag 不支持 `user` 对象。不要在任何查询参数中放入个人数据、secret、session ID、customer identifier 或 order identifier。
- Image tag 不会自动捕获 `oppref`。只有当你的页面渲染系统已经拥有该值时才传入它。
