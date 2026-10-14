# Poster print masters

These PDF, SVG, and 300 DPI PNG files are production artwork. Keep them outside `public` and do not import them into application code or add a serving route.

Regenerate the public gallery assets with:

```sh
npm run generate:poster-previews
```

The generator exports capped whole-poster previews, two small detail crops, and illustrative room mockups. Crop coordinates live in `scripts/generate-poster-previews.ts`.

To enable ordering, update the relevant variant in `src/lib/greekTheogenyPoster.ts` or `src/lib/transitTheogonyPoster.ts`:

```ts
order: {
  status: "available",
  price: 45, // Example only: replace with the actual retail price.
  currency: "EUR",
  checkoutUrl: "https://your-shop.example/this-version",
}
```

Prices are expressed in major currency units. Configure a checkout URL for each version and ensure the external listing matches the A2 unframed poster shown on the page. Keep `order: { status: "coming-soon" }` until its price and checkout are ready.
