---
title: "Image tag（图片标签）"
description: "Send conversion events from HTML without JavaScript."
outline: deep
---

# Image tag（图片标签）

**文档集**：Ads 广告<br>
**分组**：Ads — Image Tag 图片标签<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/ads/image-tag](https://developers.openai.com/ads/image-tag)
- Markdown 来源：[https://developers.openai.com/ads/image-tag.md](https://developers.openai.com/ads/image-tag.md)
- 抓取时间：2026-06-27T05:53:54.698Z
- Checksum：`9267ac3009fe85ac0a9bebdf2abe2c4fa795297c18fdff7fec7d71a471b4cbf4`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
使用 image tag 在页面加载时发送网站 conversion，而不运行 JavaScript。每个图片请求会发送一个 event。

对于页面加载后由点击、表单提交或其他交互触发的 events，请使用 [JavaScript Pixel](/mirror/ads/measurement-pixel)。当你可以从服务器发送 event 时，请使用 [Conversions API](/mirror/ads/conversions-api)。

## 安装 image tag

在 event 发生页面的 `&lt;body&gt;` 中添加一个隐藏的 1 × 1 图片：

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

将 `&lt;PIXEL-ID&gt;` 替换为 Ads Manager 中 conversions 标签页里的 Pixel ID。只有在收集到 measurement 所需的任何 consent 后，才渲染该 tag。

若要将该图片作为 JavaScript Pixel 的 fallback，请把它放在页面 body 的 `&lt;noscript&gt;` 元素中。这样 tag 只会在 JavaScript 不可用时加载：

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

对于应该在浏览器运行 JavaScript 时执行的独立 image-tag 集成，不要使用 `&lt;noscript&gt;`。

## 添加 event data

将 `event` 设为[受支持的 event name](/mirror/ads/supported-events)，并将 `data[type]` 设为该 event 文档中说明的 data type。每个 event data field 都要加上 `data[...]` 前缀。

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

如果有可用的 `oppref` 值，请将 `&lt;OPPREF&gt;` 替换为该值。否则移除 `oppref` 参数。Image tag 不会替你捕获或存储 `oppref`。

所有动态查询值都必须 URL-encoded。对于 `data[contents]`，请将 contents array 序列化为 JSON，然后对完整 JSON 值进行 URL-encode。保持请求足够小，以适配浏览器和服务器 URL 长度限制。

如果你通过 image tag 和 Conversions API 发送同一个 conversion，请使用 image tag 的 `event_id` 值作为 Conversions API event 的 `id`，并为两个 events 使用相同 Pixel ID。对于 custom events，也请使用相同的 `custom_event_name`。了解如何[防止重复的 browser 和 server events](/mirror/ads/conversions-api#deduplicate-browser-and-server-events)。

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
| `event`             | 是 | 一个[受支持的 event name](/mirror/ads/supported-events)，或 `custom`。 |
| `custom_event_name` | 视情况而定 | 当 `event=custom` 时必填。标准 events 请省略它。 |
| `event_id`          | 否 | 唯一去重 ID。仅在重试或通过其他 channel 发送同一个 conversion 时复用。 |
| `oppref`            | 否 | OpenAI 提供的隐私保护归因标识符。 |
| `data[type]`        | 是 | event 所需的 [data type](/mirror/ads/supported-events#event-data-shapes)。 |
| `data[&lt;field&gt;]`     | 否 | 所选 data type 文档中说明的任何字段。OpenAI 会拒绝未知字段。 |

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

:::

## English source

::: details 展开英文原文
::: v-pre
Use an image tag to send a website conversion when a page loads without
running JavaScript. Each image request sends one event.

Use the [JavaScript Pixel](/mirror/ads/measurement-pixel) for events triggered by
clicks, form submissions, or other interactions after the page loads. Use the
[Conversions API](/mirror/ads/conversions-api) when you can send the event from your
server.

## Install an image tag

Add a hidden 1 × 1 image to the `&lt;body&gt;` of the page where the event happens:

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

Replace `&lt;PIXEL-ID&gt;` with the Pixel ID from the conversions tab in Ads
Manager. Render the tag only after collecting any consent required for
measurement.

To use the image as a fallback for the JavaScript Pixel, put it inside a
`&lt;noscript&gt;` element in the page body. The tag then loads only when JavaScript
is unavailable:

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

Don't use `&lt;noscript&gt;` for a standalone image-tag integration that should run
when the browser runs JavaScript.

## Add event data

Set `event` to a [supported event name](/mirror/ads/supported-events) and set
`data[type]` to the event's documented data type. Prefix each event
data field with `data[...]`.

This example sends an `order_created` event with an amount, currency,
deduplication ID, and attribution identifier:

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

If an `oppref` value is available, replace `&lt;OPPREF&gt;` with that value. Otherwise,
remove the `oppref` parameter. The image tag doesn't capture or store `oppref`
for you.

All dynamic query values must be URL-encoded. For `data[contents]`, serialize
the contents array as JSON, then URL-encode the complete JSON value. Keep the
request small enough to fit within browser and server URL-length limits.

If you send the same conversion through the image tag and the Conversions API,
use the image tag's `event_id` value as the Conversions API event's `id`, and
use the same Pixel ID for both events. For custom events, also use the same
`custom_event_name`. See how to
[prevent duplicate browser and server events](/mirror/ads/conversions-api#deduplicate-browser-and-server-events).

## Send a custom event

Use `event=custom` only when no standard event describes the conversion. A
custom event also requires `custom_event_name` and `data[type]=custom`:

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

Custom event names must be 1 to 64 characters long, contain only letters,
numbers, underscores, or dashes, and start and end with a letter or number. A
custom event name can't match a standard event name. Use lowercase names for
consistency.

## Parameters

| Parameter           | Required | What to send                                                                                                   |
| ------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `pid`               | Yes      | Your Pixel ID.                                                                                                 |
| `event`             | Yes      | A [supported event name](/mirror/ads/supported-events), or `custom`.                                                  |
| `custom_event_name` | Depends  | Required when `event=custom`. Omit it for standard events.                                                     |
| `event_id`          | No       | A unique deduplication ID. Reuse it only when retrying or sending the same conversion through another channel. |
| `oppref`            | No       | An OpenAI-provided privacy-preserving attribution identifier.                                                  |
| `data[type]`        | Yes      | The [data type](/mirror/ads/supported-events#event-data-shapes) required by the event.                                |
| `data[&lt;field&gt;]`     | No       | Any field documented for the selected data type. OpenAI rejects unknown fields.                                |

Provide each parameter at most once. Amounts and quantities are integers. If
you include `data[amount]`, also include `data[currency]` as a three-letter ISO
4217 code such as `USD`.

## Test the request

Use a test Pixel ID when possible. This command sends a real `page_viewed`
event and prints the HTTP status and response content type:

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

An accepted request returns:

```text
200 image/gif
```

A `200` response confirms that OpenAI published the event to its ingestion
pipeline. It doesn't confirm completion of downstream event processing. In a
browser, use the Network panel to inspect the hidden image request and its
status.

## Limitations

- A static image tag loads with the page. It can't measure clicks, form
  submissions, or other interactions that happen later.
- Each request sends one event. The image tag doesn't batch events.
- GET requests have URL-length limits. Use the JavaScript Pixel or Conversions
  API for larger `contents` arrays or other large payloads.
- The image tag doesn't support a `user` object. Don't put personal data,
  secrets, session IDs, customer identifiers, or order identifiers in any
  query parameter.
- The image tag doesn't capture `oppref` automatically. Pass it only when your
  page-rendering system already has the value.

:::
:::

