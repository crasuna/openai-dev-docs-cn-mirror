---
status: needs-review
sourceId: "4b523c7b6e61"
sourceChecksum: "4b523c7b6e616a03d9c03304af50898187ca8a06d690d09fca36db924a9d8f9e"
sourceUrl: "https://developers.openai.com/ads/measurement-pixel"
translatedAt: "2026-06-27T19:35:31.9333790+08:00"
translator: codex-gpt-5.5-xhigh
---

# JavaScript Pixel

OpenAI Ads Measurement Pixel 是一个浏览器 SDK，用于在有人点击 ChatGPT 中的广告后 measurement 网站 events。通过将脚本添加到你的网站、使用 Pixel ID 初始化它，并在 conversion 发生时调用 `oaiq("measure", ...)` 来使用该 pixel。

## 安装 Measurement Pixel

将以下 snippet 添加到你想捕获 conversions 的每个页面的 `<head>` 部分。请将脚本放在 `<head>` 靠前位置，以确保其他内容加载时不会丢失早期 conversions。

```html
<script>
  (function (w, d, s, u) {
    if (w.oaiq) return;
    var q = function () {
      q.q.push(arguments);
    };
    q.q = [];
    w.oaiq = q;
    var js = d.createElement(s);
    js.async = true;
    js.src = u;
    var f = d.getElementsByTagName(s)[0];
    f.parentNode.insertBefore(js, f);
  })(window, document, "script", "https://bzrcdn.openai.com/sdk/oaiq.min.js");

  oaiq("init", {
    pixelId: "<YOUR-PIXEL-ID>",
  });
</script>
```

`pixelId` 是必填项。请在 Ads Manager 的 conversions 标签页中创建新的 pixelId。`debug` 是可选项，在你测试集成时会将 SDK activity 记录到浏览器 console。

## 配置 content security policy

如果你的网站执行 Content Security Policy (CSP)，请将这些来源合并到现有 policy 中：

| Directive     | Source                      | Purpose |
| ------------- | --------------------------- | ------- |
| `script-src`  | `https://bzrcdn.openai.com` | 加载 Measurement Pixel SDK。 |
| `connect-src` | `https://bzr.openai.com`    | 使用 `fetch` 或 `sendBeacon` 发送 events。 |
| `img-src`     | `https://bzr.openai.com`    | 使用 image request fallback 发送 events。 |

例如，一个除此之外只允许 same-origin resources 并使用 nonce 的 policy 会包含：

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-<NONCE>' https://bzrcdn.openai.com; connect-src 'self' https://bzr.openai.com; img-src 'self' https://bzr.openai.com;
```

将 `<NONCE>` 替换为每个响应的新 nonce，并将相同值添加到安装 snippet 的 opening tag：`<script nonce="<NONCE>">`。你也可以使用你网站现有的基于 hash 的 CSP 机制。不要仅为了 Measurement Pixel 添加 `'unsafe-inline'`。如果你的 policy 定义了 `script-src-elem`，也请将 CDN source 以及你的 nonce 或 hash source 添加到该 directive。

## 发送 user data

向 `oaiq("init", ...)` 添加可选的 `user` 对象，以改进 conversion matching。User data 是 request-scoped，因此不要把它添加到单个 `oaiq("measure", ...)` 调用中。

`user` 对象中的每个字段都是可选的。只包含你拥有的用户字段。

```js
oaiq("init", {
  user: {
    email_sha256:
      "b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514",
    external_id_sha256:
      "73d83a078369bb4f0971b317aa7797a91cf5c0df1b62161c2e47d75c33ab5b6e",
    country: "US",
    city: "San Francisco",
    zip_code: "94107",
  },
});
```

如果这些值在安装 snippet 运行时可用，你也可以在初始 `oaiq("init", ...)` 调用中，与 Pixel ID 一起包含相同的 `user` 对象。

| Field                | Description |
| -------------------- | ----------- |
| `email_sha256`       | 对 email address 去除首尾空白并转换为小写后得到的 SHA-256 hash。 |
| `external_id_sha256` | 来自你系统的稳定、假名化 customer identifier 的 SHA-256 hash。 |
| `country`            | 两字母 ISO 3166-1 国家/地区代码，例如 `US`。 |
| `city`               | 城市名称，最多 128 个字符。OpenAI 会去除首尾空白并转换为小写。 |
| `zip_code`           | Postal 或 ZIP code。可使用字母、数字、空格或连字符，最多 32 个字符。 |

请以小写的 64 字符十六进制字符串发送 hashes。不要发送原始 email addresses、原始 external IDs、电话号码或电话号码 hashes。

如果 user data 在第一次 `init` 调用之后才可用，例如用户登录后，请使用完整的 `user` 对象再次调用 `init`。第一次成功初始化后，可以省略 `pixelId`。

## 发送 events

JavaScript Pixel 不支持 `app_installed` 或 `app_opened`。

请通过 [Conversions API](https://developers.openai.com/ads/conversions-api) 在 server-side 发送这些 events。
只要有标准 event 与你想 measurement 的操作匹配，就使用标准 event。

只要有标准 event 与你想 measurement 的操作匹配，就使用标准 event。例如，购买完成时发送 `order_created`：

```js
oaiq("measure", "order_created", {
  type: "contents",
  amount: 2599,
  currency: "USD",
});
```

一次 `measure` 调用最多接受四个参数，顺序如下：

| Argument   | Required | What to send |
| ---------- | -------- | ------------ |
| Command    | Yes      | 命令 `"measure"`。 |
| Event name | Yes      | 一个[受支持的 event name](https://developers.openai.com/ads/supported-events)，例如 `order_created`，或 `"custom"`。 |
| Event data | Yes      | 一个对象，其 `type` 与 event 的 [data shape](https://developers.openai.com/ads/supported-events#event-data-shapes) 匹配。 |
| Options    | Depends  | 对标准 events 可选。对 custom events 必填，用于传入 `custom_event_name`。 |

Event name 描述发生了什么。Event data 对象的 `type` 选择随附数据的形状。例如，`order_created` 使用 `contents` data type。

Options 对象支持这些字段：

| Field               | When to use it |
| ------------------- | -------------- |
| `event_id`          | 对从浏览器和服务器发送的同一 event 去重时，设置唯一 ID。 |
| `custom_event_name` | 命名 custom event。该字段对 custom events 必填，标准 events 不支持。 |
| `opt_out`           | 设为 `true` 可让该 event 退出未来的用户级个性化。默认值为 `false`。 |

### 发送 custom event

仅当没有标准 event name 描述该操作时，才使用 custom event。这是最小有效 custom event：

```js
oaiq(
  "measure",
  "custom",
  { type: "custom" },
  { custom_event_name: "quote_requested" }
);
```

三个 custom-event 值分别用于不同目的：

- 第二个位置的 `"custom"` 表示这是一个 custom event。
- `{ type: "custom" }` 选择 custom event data shape。
- `custom_event_name` 为 event 提供描述性名称。

你可以向 event data 对象添加 `plan_id`、`amount`、`currency` 或 `contents`。当需要 browser 和 server 去重时，请向 options 对象添加 `event_id`。

Custom event names 必须：

- 长度为 1 到 64 个字符。
- 只能包含字母、数字、下划线或连字符。
- 以字母或数字开头和结尾。
- 不匹配标准 event name。

为保持一致性，请使用小写名称。

## 标准 event 示例

使用这些示例作为常见 measurement 模式的模板。

### Page and content views

```js
oaiq("measure", "page_viewed", {
  type: "contents",
  contents: [
    {
      id: "pricing",
      name: "Pricing page",
      content_type: "page",
    },
  ],
});

oaiq("measure", "contents_viewed", {
  type: "contents",
  contents: [
    {
      id: "sku_123",
      name: "Starter bundle",
      content_type: "product",
    },
  ],
});
```

### Commerce flow

对 `items_added`、`checkout_started` 和 `order_created` 使用 `contents` data shape。

```js
oaiq("measure", "items_added", {
  type: "contents",
  amount: 2599,
  currency: "USD",
  contents: [
    {
      id: "sku_123",
      name: "Starter bundle",
      content_type: "product",
      quantity: 1,
      amount: 2599,
      currency: "USD",
    },
  ],
});

oaiq("measure", "checkout_started", {
  type: "contents",
  amount: 2599,
  currency: "USD",
  contents: [
    {
      id: "sku_123",
      name: "Starter bundle",
      content_type: "product",
      quantity: 1,
    },
  ],
});

oaiq("measure", "order_created", {
  type: "contents",
  amount: 2599,
  currency: "USD",
  contents: [
    {
      id: "sku_123",
      name: "Starter bundle",
      content_type: "product",
      quantity: 1,
    },
  ],
});
```

### Lead generation and registration

对 `lead_created`、`registration_completed` 和 `appointment_scheduled` 使用 `customer_action` data shape。

```js
oaiq("measure", "lead_created", {
  type: "customer_action",
});

oaiq("measure", "registration_completed", {
  type: "customer_action",
});

oaiq("measure", "appointment_scheduled", {
  type: "customer_action",
  amount: 5000,
  currency: "USD",
});
```

### Subscription and trial events

对 `subscription_created` 和 `trial_started` 使用 `plan_enrollment` data shape。

```js
oaiq("measure", "subscription_created", {
  type: "plan_enrollment",
  plan_id: "pro_monthly",
  amount: 2000,
  currency: "USD",
});

oaiq("measure", "trial_started", {
  type: "plan_enrollment",
  plan_id: "pro_trial",
});
```

## 对 browser 和 server events 去重

如果你同时从 Measurement Pixel 和 server-side 集成发送同一个 conversion，请在两处复用相同的 `event_id`。

```js
oaiq(
  "measure",
  "order_created",
  {
    type: "contents",
    amount: 2599,
    currency: "USD",
  },
  {
    event_id: "order_12345",
  }
);
```

当你需要在 browser 和 server events 之间去重时，请自行生成 `event_id`，并在同一个 pixel 和服务器发送的 event 上复用它。对于 custom events，也请在两端保持相同的 `custom_event_name`。去重会根据你的 Pixel ID、event name 和 `event_id` 匹配。对于 custom events，`custom_event_name` 会在该匹配中替代标准 event name。

## SDK 自动处理的内容

Pixel 会替你处理若干传输细节：

- 它会从落地页 URL 中捕获 `oppref`，这是一个隐私保护标识符
- 它会将 `oppref` 存储在第一方 `__oppref` cookie 中，以便后续页面浏览可复用它。
- 它会将当前页面 origin 添加为 `source_url`。
- 它会为每个 event 添加 timestamp，并对时间上接近的 `measure` 调用进行批处理。

使用 pixel 时不需要手动配置这些细节。

## Troubleshooting

- 测试时保持 `debug: true`，以便在浏览器 console 中检查 Pixel activity。
- 对 `amount` 和 `quantity` 使用整数值。
- 仅使用 `contents[]` 内文档说明的字段。
- 始终在浏览器上使用 pixel。不要直接从页面代码调用 server conversions API。
