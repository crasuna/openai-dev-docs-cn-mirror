# Overview

The Advertiser API lets you manage ad campaigns, ad groups, ads, files, and
reporting from one API. It supports CRUD-like functions with standard JSON content types.

## Authentication

Issue an API key in the Settings tab of [Ads Manager](https://ads.openai.com).
Each key is scoped to one ad account.

Pass the key as a bearer token on every request:

```bash
Authorization: Bearer $OPENAI_ADS_API_KEY
```

By default, the Advertiser API works in the context of a single Ad Account. If
  you need to manage multiple Ad Accounts with the API, please [contact
  us](https://openai.com/advertisers/).

## Endpoints

| Resource      | Use for                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| Campaigns     | Create, list, retrieve, update, and change campaign state.                      |
| Ad Groups     | Create, list, retrieve, update, and change ad group state.                      |
| Ads           | Create, list, retrieve, update, and change ad state.                            |
| Product feeds | Use a merchant catalog to create product-feed campaigns.                        |
| Files         | Upload creative assets for use in ads.                                          |
| Insights      | Retrieve performance data across ad account, campaign, ad group, and ad scopes. |

All resources live inside a single Ad Account.

Use the [Quickstart](https://developers.openai.com/ads/api-quickstart) for a minimal end-to-end workflow, or go
directly to the [API reference](https://developers.openai.com/ads/api-reference/authentication). To advertise
from a merchant catalog, follow the [product feeds guide](https://developers.openai.com/ads/product-feeds).

## Object Statuses

For an ad to show to users, the ad, and its parent ad group and campaign all have to be enabled. Further, the Ad has to be reviewed. Reviews typically only take a few minutes, you can monitor with the review_status field.

## Rate limits

The Advertiser API enforces limits by both ad account and IP address:

| Scope        | Limit                     |
| ------------ | ------------------------- |
| Per endpoint | 600 requests per minute   |
| Overall      | 1,200 requests per minute |

Requests must stay within both the ad-account and IP-address limits.

## OpenAPI spec

<a href="/ads/openapi.json" download>
  {"Download the OpenAPI spec"}
</a>

## Changelog

### June 11th, 2026

- Added segmented insights for product, country, and device breakdowns, plus zero-impression product expansion.

### June 3rd, 2026

- Added geotargeting support, including `/geo_lookup/search` and campaign `targeting.locations.include` for country, region, and DMA location IDs.
- Added conversion setup and reporting endpoints for API keys, pixels, event settings, and conversion insights.

### v1

- Published the initial API version.
