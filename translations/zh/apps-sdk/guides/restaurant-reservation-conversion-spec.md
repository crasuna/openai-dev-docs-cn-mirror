---
status: needs-review
sourceId: "8be1b7b78e38"
sourceChecksum: "8be1b7b78e38db9ac2f4032f36ec6a9e3f6321d25991f357e25d12ca5d2c87a2"
sourceUrl: "https://developers.openai.com/apps-sdk/guides/restaurant-reservation-conversion-spec"
translatedAt: "2026-06-27T19:36:03+08:00"
translator: codex-gpt-5.5-xhigh
---

# 餐厅预订转化规格

ChatGPT 中的餐厅预订转化 app 目前处于 beta 阶段，并正在与已获批准的合作伙伴一起测试。要申请访问权限，请填写此表单
  <a
    href="https://chatgpt.com/merchants"
    target="_blank"
    rel="noopener noreferrer"
  >
    here
  </a>

## Purpose

我们的目标是让 ChatGPT 能够为餐厅预订等高意图用例直接调用合作伙伴 app。

合作伙伴向我们提供用于搜索的 feed 后，我们就可以将其 app 接入漏斗底部的转化动作。为此，合作伙伴 app 需要遵循 widget name、tool name 和 tool input 的标准化 contract。

如果你想构建遵循此规格的 app，请通过 [ChatGPT merchants form](https://chatgpt.com/merchants/) 申请访问权限。

## User experience

当用户搜索附近餐厅时，餐厅实体卡片和侧边栏会包含一个 **Reserve** 按钮，该按钮可以打开餐厅的预订服务商 app。

餐厅 UI 中的 Reserve 按钮：

![Reserve button in restaurant UI](https://developers.openai.com/images/apps-sdk/conversion-specs/reserve-button.png)

从该按钮打开的预订 modal：

![Reservation modal opened from Reserve button](https://developers.openai.com/images/apps-sdk/conversion-specs/reservation-modal.png)

## Required contract (today)

对于当前的预订集成，只要求以下内容：

- Widget name: `ui://widget/restaurant-reservation.html`
- Tool name: `restaurant_reservation`

`restaurant_reservation` 必须设置：

```ts
_meta.ui.resourceUri = "ui://widget/restaurant-reservation.html";
```

任何直接从 widget 调用的工具都必须设置：

```ts
_meta["openai/widgetAccessible"] = true;
```

## `restaurant_reservation` input

最小 payload（始终发送）：

```json
{
  "restaurant_id": "string"
}
```

我们也可能发送下面的 payload。你可以用它在 modal 中进行乐观渲染（例如，在数据水合时避免 skeleton/loading 状态）：

```json
{
  "restaurant_name": "string",
  "restaurant_image": "string",
  "restaurant_address": {
    "address": "string",
    "city": "string",
    "state": "string",
    "zipcode": "string",
    "country": "string"
  }
}
```

## Feed requirement (search integration)

为了启用 Reserve-button 路由，我们会从合作伙伴处摄取 business feed。

### Purpose and scope

此 feed contract 定义：

- 匹配与排序所需的最小 business data。
- 分页 listing API。
- 变更检测，使我们可以避免不必要的全量抓取。

### Business record (minimum required fields)

`Business` object 必须包含：

- `id` (`string`)：在 provider 内稳定且唯一。
- `name` (`string`)
- `address` (`object` 或格式化 `string`)
- `location` (`object`，包含 latitude/longitude)
- `phone_number` (`string`，优先 E.164)
- `website_url` (`string`, URL)
- `platform_url` (`string`，指向你的 canonical listing 的 URL)

推荐的最小 shape：

```json
{
  "id": "biz_123",
  "name": "Acme Coffee",
  "address": {
    "line1": "123 Market St",
    "line2": "Suite 5",
    "locality": "San Francisco",
    "region": "CA",
    "postal_code": "94105",
    "country": "US",
    "formatted": "123 Market St, Suite 5, San Francisco, CA 94105, US"
  },
  "location": {
    "latitude": 37.793,
    "longitude": -122.396
  },
  "phone_number": "+14155551234",
  "website_url": "https://acmecoffee.example",
  "platform_url": "https://provider.example/biz/biz_123"
}
```

如果结构化地址 components 不可用，`address` 可以是单个格式化字符串，但它必须保持一致且便于人类阅读。

### Paginated listing endpoint

Endpoint 示例：

- `GET /v1/businesses`

Query parameters：

- Pagination：使用一种风格
- `page` + `page_size`
- `offset` + `limit`
- 或 `next_page_token`（不透明 token；支持时优先）
- `changes_token` (`string`, optional)：表示自上次 sync checkpoint 以来数据是否发生变化。

Response 必须包含：

- `checksum` (`boolean`)：自提供的 `changes_token` 以来是否有任何变化（如果未提供则为 `true`）。
- `businesses` (`Business[]`)：当前页 payload。
- 针对你所选风格的 pagination metadata：
- `page`, `page_size`, `total_pages`（optional），或
- `offset`, `limit`, `total`（optional），或
- `next_page_token` (`string | null`)

### Example request and response

Request:

```http
GET /v1/businesses?page=1&page_size=2&changes_token=sync_2026_03_10
```

Response:

```json
{
  "checksum": true,
  "page": 1,
  "page_size": 2,
  "total_pages": 120,
  "businesses": [
    {
      "id": "biz_123",
      "name": "Acme Coffee",
      "address": {
        "line1": "123 Market St",
        "locality": "San Francisco",
        "region": "CA",
        "postal_code": "94105",
        "country": "US",
        "formatted": "123 Market St, San Francisco, CA 94105, US"
      },
      "location": {
        "latitude": 37.793,
        "longitude": -122.396
      },
      "phone_number": "+14155551234",
      "website_url": "https://acmecoffee.example",
      "platform_url": "https://provider.example/biz/biz_123"
    },
    {
      "id": "biz_124",
      "name": "Golden Diner",
      "address": "200 Howard St, San Francisco, CA 94105, US",
      "location": {
        "latitude": 37.789,
        "longitude": -122.391
      },
      "phone_number": "+14155559876",
      "website_url": "https://goldendiner.example",
      "platform_url": "https://provider.example/biz/biz_124"
    }
  ]
}
```

### How we use this feed for search

我们将 business feed 视为 search index。在查询时，我们使用 fuzzy matching（name + location/address）检索候选项，然后使用 name/address similarity 进行排序和去重，并将 location/phone/URL 作为额外信号。

## Good-to-have expansion (not required today)

为了实现完整的端到端 in-chat completion，我们建议添加：

- `refresh_availability`
- `make_reservation`
- `reservation_confirmation`
