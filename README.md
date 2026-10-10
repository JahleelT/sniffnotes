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

## Checks

The same checks CI runs, locally:

```bash
npm run lint        # ESLint
npm run typecheck   # route types + TypeScript
npm test            # unit and data tests (tests/*.test.mts, Node's built-in runner)
npm run check:data  # re-runs the importers and fails if data/ changed (CSV edited without importing)
npm run build       # production build
```

## CI/CD

**CI** — `.github/workflows/ci.yml` runs on every push to `main` and every pull request: lint, type-check, tests, the data check, `npm audit` (fails on high or critical vulnerabilities in production dependencies), and a production build. The build needs no real secrets; CI uses placeholders.

**Deploys (Vercel)** — Import the GitHub repo into Vercel once. After that, every push to `main` deploys to production and every pull request gets its own preview URL. In the Vercel project, add the environment variables from `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, and `CRON_SECRET`.

**Database migrations** — After CI passes on `main`, the `migrate` job runs `supabase db push`, which applies only migrations the database hasn't run (a no-op otherwise). It's skipped until you add the secret: GitHub repo → Settings → Secrets and variables → Actions → `SUPABASE_DB_URL`, set to the **Session pooler** connection string from Supabase (Connect → Session pooler), since GitHub's runners can't reach the IPv6-only direct connection. Vercel can deploy before the migration finishes, so keep migrations additive (new tables and columns) rather than renaming or dropping things code still uses.

**Dependabot** — `.github/dependabot.yml` opens weekly pull requests for outdated npm packages (minor and patch updates grouped into one) and monthly ones for GitHub Actions. CI checks each before you merge.

Recommended: in GitHub → Settings → Branches, protect `main` and require the "Lint, type-check, test, build" check, so nothing merges with a failing build.

## Security

SniffNotes doesn't collect payment or government ID data, so the protections are proportionate:

- **Row-level security** on every Supabase table: people can only read and change what they're allowed to (their own collections, reviews, messages, and friends' shared collections). It's enforced by the database, not just the UI.
- **Secrets stay on the server.** `SUPABASE_SECRET_KEY` is only used in `lib/supabase/admin.ts`, which imports `server-only`, so the build fails if it's ever bundled into browser code. `.env.local` is git-ignored.
- **Security headers** on every response (`next.config.ts`): no framing by other sites, no content-type sniffing, a strict referrer policy, unused browser features (camera, microphone, location) disabled, and HTTPS-only.
- **Dependency checks** in CI and Dependabot updates.
- **Form input is validated** in server actions, and `?next=` redirects only go to paths on this site.

Worth turning on in the Supabase dashboard before launch: Authentication → **Leaked password protection** and a **custom SMTP** provider; and in GitHub → Settings → Code security, **secret scanning** with push protection.

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

## News

The News page collects headlines from five publications' RSS feeds (`lib/news-core.ts`) and tags the brands and fragrances they mention. News refreshes itself: when someone visits a news page and the last fetch is over 4 hours old, the site fetches in the background after responding.

- `npm run news:refresh` fetches right away.
- `/api/cron/news` is for a scheduler. It requires `Authorization: Bearer $CRON_SECRET` (Vercel Cron sends this when `CRON_SECRET` is set). `vercel.json` schedules it daily, the most Vercel's free plan allows; on a paid plan, change it to `0 */4 * * *`.

## Manhattan Fragrance Guide

`/guide` lists places to find fragrance, grouped by part of Manhattan, then neighborhood (NYC's official Neighborhood Tabulation Areas).

- `data/guide/stores.csv` is the source of truth. Columns: `name`, `type` (`boutique`, `perfumery`, `shop`, `custom`), `neighborhood` (an exact name from `lib/guide-areas.ts`), `address`, `website`, `carries` (brand slugs, `;`-separated), `custom_blends` (`yes`/`no`), `verified` (`yes`/`no`), `note`, `lat`, `lon`, `osm_id`.
- `npm run guide:fetch` adds perfume shops from OpenStreetMap that aren't listed yet, placed in a neighborhood by their coordinates and marked unverified. It never changes existing rows.
- `npm run guide:import` checks the CSV and writes `data/guide/stores.json`, which the page reads.

## Demo Content

For presentations, `npm run demo:seed` adds 8 demo reviewer accounts with reviews on 12 fragrances and a few voted description suggestions (re-running replaces them). `npm run demo:clear` deletes every demo account and everything it wrote.

Demo accounts use the `@sniffnotes-demo.example` email domain and are created already confirmed, so no email is sent. **Run `npm run demo:clear` before real people use the site**, so demo reviews aren't mistaken for genuine ones.

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
| `tags` | yes | Moods separated by `;`. The first themed one sets the page theme. At least one must be themed: Tea, Fruity, Dark, Smoky, Woody, Boozy, Tropical, Floral, Spicy, Clean, Solar, Green, Aquatic, Gourmand, Resinous, Ancient (common synonyms like Citrus or Vanilla also work) |
| `top`, `mid`, `base` | at least one | Notes separated by `;` |
| `image` | no | Defaults to `/fragrances/<id>.jpg` |
| `description` | yes | Wrap in double quotes if it contains commas |
| `source_url` | no | Where the data came from (filled in by PerfumAPI imports) |
| `price` | no | `$` to `$$$$`. Leave blank to use the brand's usual tier from `BRAND_PRICE` in `lib/price.ts` |

Price tiers are a rough guide to a full bottle (about 100 ml) at US retail: `$` under $75, `$$` $75–$150, `$$$` $150–$300, `$$$$` over $300. Set `price` only for lines priced differently from the rest of their brand (e.g. Guerlain's L'Art & La Matière). The importer warns about any fragrance it can't price; add the brand to `BRAND_PRICE` or fill in the column.

A JSON array with the same fields also works: `npm run import:fragrances -- path/to/file.json`.

### From PerfumAPI

With a [PerfumAPI](https://perfumapi-frontend.onrender.com/) server running and `PERFUMAPI_URL` set in `.env.local`:

1. `npm run fetch:perfumapi` appends every perfume not already in the CSV, downloads bottle photos to `public/fragrances/`, and suggests up to 3 moods from each perfume's notes and fragrance family.
2. Review the suggested `tags` (the first one sets the page theme).
3. `npm run import:fragrances`, then give any brand it warns has no price tier an entry in `BRAND_PRICE` (`lib/price.ts`) and import again.
4. `npm test` checks the result; similar fragrances and recommendations pick up new entries automatically.

Rows from PerfumAPI keep their Fragrantica link in `source_url`, which is also how re-runs skip perfumes that were already fetched.

The importer runs TypeScript directly, so it needs Node 22.18+ or 23.6+.
