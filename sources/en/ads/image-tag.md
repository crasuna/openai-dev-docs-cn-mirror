# Image tag

Use an image tag to send a website conversion when a page loads without
running JavaScript. Each image request sends one event.

Use the [JavaScript Pixel](https://developers.openai.com/ads/measurement-pixel) for events triggered by
clicks, form submissions, or other interactions after the page loads. Use the
[Conversions API](https://developers.openai.com/ads/conversions-api) when you can send the event from your
server.

## Install an image tag

Add a hidden 1 × 1 image to the `<body>` of the page where the event happens:

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

Replace `<PIXEL-ID>` with the Pixel ID from the conversions tab in Ads
Manager. Render the tag only after collecting any consent required for
measurement.

To use the image as a fallback for the JavaScript Pixel, put it inside a
`<noscript>` element in the page body. The tag then loads only when JavaScript
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

Don't use `<noscript>` for a standalone image-tag integration that should run
when the browser runs JavaScript.

## Add event data

Set `event` to a [supported event name](https://developers.openai.com/ads/supported-events) and set
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

If an `oppref` value is available, replace `<OPPREF>` with that value. Otherwise,
remove the `oppref` parameter. The image tag doesn't capture or store `oppref`
for you.

All dynamic query values must be URL-encoded. For `data[contents]`, serialize
the contents array as JSON, then URL-encode the complete JSON value. Keep the
request small enough to fit within browser and server URL-length limits.

If you send the same conversion through the image tag and the Conversions API,
use the image tag's `event_id` value as the Conversions API event's `id`, and
use the same Pixel ID for both events. For custom events, also use the same
`custom_event_name`. See how to
[prevent duplicate browser and server events](https://developers.openai.com/ads/conversions-api#deduplicate-browser-and-server-events).

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
| `event`             | Yes      | A [supported event name](https://developers.openai.com/ads/supported-events), or `custom`.                                                  |
| `custom_event_name` | Depends  | Required when `event=custom`. Omit it for standard events.                                                     |
| `event_id`          | No       | A unique deduplication ID. Reuse it only when retrying or sending the same conversion through another channel. |
| `oppref`            | No       | An OpenAI-provided privacy-preserving attribution identifier.                                                  |
| `data[type]`        | Yes      | The [data type](https://developers.openai.com/ads/supported-events#event-data-shapes) required by the event.                                |
| `data[<field>]`     | No       | Any field documented for the selected data type. OpenAI rejects unknown fields.                                |

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
