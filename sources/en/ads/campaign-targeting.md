# Campaign Targeting

Use campaign targeting to control where your ads can deliver. OpenAI Ads supports
country, region, and DMA targeting. Look up the locations you want, copy their
location IDs, then pass those IDs when you create or update a campaign.

If you do not provide location targeting, the campaign can target all available
locations.

## Available locations

Use the geo lookup API when you want to search for current targetable locations.
The response returns the location `id`, display `name`, `canonical_name`,
`country_code`, `type`, and `region_code`.

```bash
curl -G "https://api.ads.openai.com/v1/geo_lookup/search" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  --data-urlencode "q=San Francisco" \
  --data-urlencode "limit=5"
```

```json
{
  "count": 1,
  "query": "San Francisco",
  "results": [
    {
      "id": "3000194",
      "type": "dma",
      "canonical_name": "San Francisco - Oakland - San Jose, United States",
      "country_code": "US",
      "name": "San Francisco - Oakland - San Jose",
      "region_code": "807"
    }
  ]
}
```

You can also download the current location catalog as a CSV:

<a href="/ads/openai-geotargets.csv" download>
  {"Download OpenAI Ads locations"}
</a>

## Campaign creation

Create a campaign with `targeting.locations.include`. Each item only needs the
location `id`; the API expands the saved campaign with the matching location
details.

```bash
curl -X POST "https://api.ads.openai.com/v1/campaigns" \
  -H "Authorization: Bearer $OPENAI_ADS_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: campaign-targeting-example-1" \
  -d '{
    "name": "West Coast launch",
    "status": "paused",
    "budget": {
      "lifetime_spend_limit_micros": 25000000
    },
    "bidding_type": "clicks",
    "targeting": {
      "locations": {
        "include": [
          { "id": "2000043" },
          { "id": "3000194" },
          { "id": "3000001" }
        ]
      }
    }
  }'
```

In this example:

| Location ID | Meaning                                           | Type     |
| ----------- | ------------------------------------------------- | -------- |
| `2000043`   | California, United States                         | `region` |
| `3000194`   | San Francisco - Oakland - San Jose, United States | `dma`    |
| `3000001`   | New York, United States                           | `dma`    |

Use `status: "paused"` while you are validating campaign setup. Switch the
campaign to `active` when the campaign, ad groups, and ads are ready to serve.
