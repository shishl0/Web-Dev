# Online Store (Angular + Kaspi Parser)

Premium Angular storefront UI with Spartan UI + Tailwind, animated product cards, and server-side Kaspi parsing with cache.

## Install

```bash
npm install
```

## Run (recommended for API + app together)

```bash
npm run start
```

Open [http://localhost:4200](http://localhost:4200).

The app uses `/api/kaspi/parse` served by the Angular SSR dev server and parses Kaspi HTML server-side (no browser CORS issues).

## Production build

```bash
npm run build
npm run serve:ssr:online-store
```

This starts the Node SSR server at `http://localhost:4000` by default.

## Features

- Spartan UI primitives (`hlmBtn`, `hlmInput`, `hlmCard`, `hlmSkeleton`) + Tailwind v4 setup
- Server proxy endpoint with:
  - Query API: `/api/kaspi/parse?count=N&url=ENCODED_URL`
  - HTML parsing via `cheerio`
  - In-memory server cache (short TTL) and basic rate limiting
- Product list toolbar:
  - Count input `N` (1..50)
  - `Load from Kaspi`
  - `Use cached`
  - `Clear cache`
- Client cache in `localStorage` key `kaspi_ram_cache_v1` with payload:
  - `{ url, count, fetchedAtISO, expiresAtISO, products[] }`
- Cache validity: up to 24 hours or end of current day (whichever comes first)
- Product cards with image carousel, stars, and share links:
  - Open in Kaspi
  - Share WhatsApp
  - Share Telegram
- Motion polish:
  - Angular list stagger animation
  - Motion One hover-lift directive
  - Skeleton shimmer while loading

## Notes

- Kaspi HTML structure can change over time. Parser selectors are resilient but may require updates if Kaspi redesigns card markup.
- The server endpoint only allows `kaspi.kz` URLs.
