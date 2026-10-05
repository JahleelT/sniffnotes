# SniffNotes

Discover fragrances by note, brand, and mood. Each fragrance page is themed by its first mood tag.

See [roadmap.md](roadmap.md) for what's planned.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Layout

| Path | What it holds |
| --- | --- |
| `app/` | Routes: home (`/`), search (`/search`), fragrance pages (`/fragrance/[id]`) |
| `components/` | UI pieces shared by the routes |
| `lib/fragrances.ts` | Lookup and search helpers over the dataset |
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
