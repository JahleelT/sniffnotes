# SniffNotes

Discover fragrances by note, brand, and mood. Each fragrance page is themed by its first mood tag.

See [roadmap.md](roadmap.md) for what's planned.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> If your shell sets `NODE_ENV=production`, npm skips dev dependencies. Use `npm install --include=dev`.

## Supabase

Accounts and saved data live in Supabase.

1. Copy `.env.example` to `.env.local` and fill it in from the Supabase dashboard (Project Settings → API and Database).
2. Apply the database migrations in `supabase/migrations/` with `npm run db:push`.
3. After changing the schema, regenerate `lib/supabase/database.types.ts` with `npm run db:types`.

New migrations go in `supabase/migrations/` (`npx supabase migration new <name>`). In the dashboard, Authentication → URL Configuration must list every origin the site runs on (for example `http://localhost:3000/**` and the production URL), or email links fall back to the Site URL.

## Project Layout

| Path | What it holds |
| --- | --- |
| `app/` | Routes: home (`/`), search (`/search`), fragrance pages (`/fragrance/[id]`), fragrance of the day (`/daily`), collections (`/collections`), settings (`/settings`), auth (`app/(auth)/`), account (`/account`) |
| `components/` | UI pieces shared by the routes |
| `lib/fragrances.ts` | Lookup and search helpers over the dataset |
| `lib/auth.ts` | `getCurrentUser` / `requireUser` helpers |
| `lib/preferences.ts` | Display and accessibility preferences (cookie + profile) |
| `lib/collections.ts` | Saved-fragrance collection queries |
| `lib/daily.ts`, `lib/daily-picker.ts` | Fragrance of the day: storage and the no-repeat picking rules |
| `lib/supabase/` | Supabase clients and generated database types |
| `supabase/` | Supabase CLI config and SQL migrations |
| `proxy.ts` | Refreshes the auth session on each request |
| `data/fragrances.ts` | The `Fragrance` type and typed dataset export |
| `data/fragrances.json` | Generated dataset (don't edit by hand) |
| `data/import/fragrances.csv` | The source you edit to add fragrances |
| `utils/themeMap.ts` | Mood list and each mood's background and colors |

## Adding Fragrances

1. Add a row to `data/import/fragrances.csv` (a spreadsheet app works fine).
2. Put the bottle photo at `public/fragrances/<id>.jpg`.
3. Run `npm run import:fragrances`.

The importer checks every row, prints each problem with its row number, and only writes `data/fragrances.json` when everything is valid. Two things are only warnings: tags that don't have a theme in `utils/themeMap.ts` yet (they stay in the CSV and are picked up once that mood is added), and missing photos (the site shows a placeholder until the file exists; re-run the import after adding it).

| Column | Required | Notes |
| --- | --- | --- |
| `id` | no | URL slug. Defaults to the name, e.g. `Aswan` → `aswan` |
| `name` | yes | |
| `brand` | yes | |
| `collection` | no | |
| `tags` | yes | Moods separated by `;`. The first themed one sets the page theme. At least one must be themed: Tea, Fruity, Dark, Smoky, Woody, Boozy, Tropical, Floral, Spicy, Clean, Solar |
| `top`, `mid`, `base` | at least one | Notes separated by `;` |
| `image` | no | Defaults to `/fragrances/<id>.jpg` |
| `description` | yes | Wrap in double quotes if it contains commas |

A JSON array with the same fields also works: `npm run import:fragrances -- path/to/file.json`.

The importer runs TypeScript directly, so it needs Node 22.18+ or 23.6+.
