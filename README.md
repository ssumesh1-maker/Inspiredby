# Inspiredby

Inspiredby is a public, browse-only visual reference library. The Next.js app
includes category navigation, search, source filtering, and linkable reference
pages. A curated starter catalog is available locally without credentials.

## Run locally

With Node.js 24 installed, run `npm ci` and `npm run dev`, then open
`http://localhost:3000`. Run `npm run build` for the production build.

Place the original Inspiredby™ artwork at
`public/brand/wordmark.svg` or use the same basename with a PNG, WebP, or JPEG
extension. The header uses the image directly at its intrinsic aspect ratio.
Without the file, the header displays a Discover home link.

## Supabase

Apply the migrations in `supabase/migrations`. Run `supabase/seed.sql` to load
the curated starter catalog in an empty remote database, or use `supabase db reset`
for a disposable local database managed by the Supabase CLI. The seed image paths
refer to assets included with the Next.js app.

Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in the app environment.
The hosted app then reads the Supabase catalog. Row-level security exposes
published entries while the public database roles have read-only access.
To keep registration disabled at the Supabase project level, turn off new user
sign-ups in Authentication settings. The Next.js app has no authentication or
visitor submission routes.

## Automated discovery

The Discover inspiration workflow supports scheduled and manual runs. Set the
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` repository secrets. Set the
`INSPIRED_BY_FEEDS` repository variable to a JSON array of RSS or Atom sources
that permit redistribution of their previews, for example:

```json
[
  {
    "url": "https://your-source.example/feed.xml",
    "name": "Your source",
    "category": "Websites",
    "publish": false
  }
]
```

Entries need an HTTPS post link and a media attachment or image enclosure.
New entries are drafts unless the feed explicitly sets `publish` to `true`.
Use the Supabase dashboard to review drafts and publish individual entries.
Canonical post URLs are unique and repeated runs preserve existing records.
For local ingestion, pass the same three values to `npm run ingest` through
your shell environment.

The Met and NASA preview credits and direct source pages are listed on each
reference page.

## GitHub Pages preview

The Pages workflow builds a static export with the bundled catalog. It includes
browser-side search and filtering and a static page for each reference. Pages
publishing uses GitHub Actions. The normal Next.js build continues to support
server-side Supabase reads.

To reproduce the Pages export locally, run `PAGES_PREVIEW=1
NEXT_PUBLIC_BASE_PATH=/Inspiredby npm run build`. The output is in `out/`.
