# JavaScript Pixel

The OpenAI Ads Measurement Pixel is a browser SDK for measuring website events
after someone clicks an ad in ChatGPT. Use the pixel by adding the script to your site, initializing
it with your Pixel ID, and call `oaiq("measure", ...)` when a conversion
happens.

## Install the Measurement Pixel

Add the following snippet to the `<head>` section every page where you want to capture
conversions. Put the script near the top of your `<head>` to ensure early conversions aren't lost while other content loads.

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

`pixelId` is required. Create a new pixelId in the conversions tab of Ads Manager. `debug` is optional and logs SDK activity to the browser
console while you test your integration.

## Configure a content security policy

If your site enforces a Content Security Policy (CSP), merge these sources into
your existing policy:

| Directive     | Source                      | Purpose                                      |
| ------------- | --------------------------- | -------------------------------------------- |
| `script-src`  | `https://bzrcdn.openai.com` | Load the Measurement Pixel SDK.              |
| `connect-src` | `https://bzr.openai.com`    | Send events with `fetch` or `sendBeacon`.    |
| `img-src`     | `https://bzr.openai.com`    | Send events with the image request fallback. |

For example, a policy that otherwise allows only same-origin resources and uses
a nonce would include:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-<NONCE>' https://bzrcdn.openai.com; connect-src 'self' https://bzr.openai.com; img-src 'self' https://bzr.openai.com;
```

Replace `<NONCE>` with a fresh nonce for each response and add the same value to
the installation snippet's opening tag: `<script nonce="<NONCE>">`. You can use
your site's existing hash-based CSP mechanism instead. Don't add `'unsafe-inline'`
solely for the Measurement Pixel. If your policy defines `script-src-elem`, add
the CDN source and your nonce or hash source to that directive as well.

## Send user data

Add an optional `user` object to `oaiq("init", ...)` to improve conversion
matching. User data is request-scoped, so don't add it to individual
`oaiq("measure", ...)` calls.

Every field in the `user` object is optional. Include only the fields you have
for the user.

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

If these values are available when the installation snippet runs, you can
instead include the same `user` object in the initial `oaiq("init", ...)` call
with your Pixel ID.

| Field                | Description                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `email_sha256`       | SHA-256 hash of the email address after trimming whitespace and converting it to lowercase.        |
| `external_id_sha256` | SHA-256 hash of a stable, pseudonymous customer identifier from your system.                       |
| `country`            | Two-letter ISO 3166-1 country code, such as `US`.                                                  |
| `city`               | City name, with a maximum of 128 characters. OpenAI trims whitespace and converts it to lowercase. |
| `zip_code`           | Postal or ZIP code. Use letters, numbers, spaces, or hyphens, with a maximum of 32 characters.     |

Send hashes as lowercase, 64-character hexadecimal strings. Don't send raw email
addresses, raw external IDs, phone numbers, or phone number hashes.

If user data becomes available after the first `init` call, such as after login,
call `init` again with the complete `user` object. You can omit `pixelId` after
the first successful initialization.

## Send events

The JavaScript Pixel does not support `app_installed` or `app_opened`.

Send these events server-side through the
[Conversions API](https://developers.openai.com/ads/conversions-api).
Use a standard event whenever one matches the action you want to measure.

Use a standard event whenever one matches the action you want to measure. For
example, send `order_created` when a purchase is completed:

```js
oaiq("measure", "order_created", {
  type: "contents",
  amount: 2599,
  currency: "USD",
});
```

A `measure` call accepts up to four arguments, in this order:

| Argument   | Required | What to send                                                                                      |
| ---------- | -------- | ------------------------------------------------------------------------------------------------- |
| Command    | Yes      | The command `"measure"`.                                                                          |
| Event name | Yes      | A [supported event name](https://developers.openai.com/ads/supported-events), such as `order_created`, or `"custom"`.          |
| Event data | Yes      | An object whose `type` matches the event's [data shape](https://developers.openai.com/ads/supported-events#event-data-shapes). |
| Options    | Depends  | Optional for standard events. Required for custom events to pass `custom_event_name`.             |

The event name describes what happened. The event data object's `type` selects
the shape of the accompanying data. For example, `order_created` uses the
`contents` data type.

The options object supports these fields:

| Field               | When to use it                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| `event_id`          | Set a unique ID when deduplicating the same event sent from the browser and server.                  |
| `custom_event_name` | Name a custom event. This field is required for custom events and isn't supported for standard ones. |
| `opt_out`           | Set to `true` to opt out the event from future user-level personalization. Defaults to `false`.      |

### Send a custom event

Use a custom event only when none of the standard event names describe the
action. This is the smallest valid custom event:

```js
oaiq(
  "measure",
  "custom",
  { type: "custom" },
  { custom_event_name: "quote_requested" }
);
```

The three custom-event values serve different purposes:

- `"custom"` in the second position identifies this as a custom event.
- `{ type: "custom" }` selects the custom event data shape.
- `custom_event_name` gives the event its descriptive name.

You can add `plan_id`, `amount`, `currency`, or `contents` to the event data
object. Add `event_id` to the options object when you need browser and server
deduplication.

Custom event names must:

- Be 1 to 64 characters long.
- Contain only letters, numbers, underscores, or dashes.
- Start and end with a letter or number.
- Not match a standard event name.

Use lowercase names for consistency.

## Standard event examples

Use these examples as templates for common measurement patterns.

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

Use the `contents` data shape for `items_added`, `checkout_started`, and
`order_created`.

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

Use the `customer_action` data shape for `lead_created`,
`registration_completed`, and `appointment_scheduled`.

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

Use the `plan_enrollment` data shape for `subscription_created` and
`trial_started`.

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

## Deduplicate browser and server events

If you send the same conversion from both the Measurement Pixel and a
server-side integration, reuse the same `event_id` in both places.

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

When you need deduplication across browser and server events, generate the
`event_id` yourself and reuse it on the same pixel and server-sent event. For
custom events, keep the same `custom_event_name` on both sides as well.
Deduplication matches on your Pixel ID, the event name, and `event_id`. For
custom events, `custom_event_name` replaces the standard event name in that
match.

## What the SDK handles automatically

The Pixel handles several transport details for you:

- It captures `oppref` from the landing page URL, which is a privacy-preserving identifier
- It stores `oppref` in a first-party `__oppref` cookie so later page views can
  reuse it.
- It adds the current page origin as `source_url`.
- It timestamps each event and batches closely grouped `measure` calls.

No manual configuration of these details is necessary when using the pixel.

## Troubleshooting

- Keep `debug: true` while testing so you can inspect Pixel activity in the
  browser console.
- Use integer values for `amount` and `quantity`.
- Use only the documented fields inside `contents[]`.
- Always use the pixel on the browser. Do not call the server conversions API directly from page code.
