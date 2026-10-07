// Fetches news now, ignoring the 4-hour interval: npm run news:refresh
// The site also refreshes stale news on its own when someone visits a news page.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { claimNewsRun, fetchNews, storeNews } from "../lib/news-core.ts";
import { slugify } from "./csv.mts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.");
    process.exit(1);
}

const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const dataset: { id: string; name: string; brand: string }[] = JSON.parse(readFileSync(new URL("../data/fragrances.json", import.meta.url), "utf8"));

// Same slugs as lib/brands.ts.
const brands = [...new Map(dataset.map((f) => [slugify(f.brand), { slug: slugify(f.brand), name: f.brand }])).values()];
const fragrances = dataset.map((f) => ({ id: f.id, name: f.name, brandSlug: slugify(f.brand) }));

await claimNewsRun(admin, true);
const { items, errors } = await fetchNews(brands, fragrances);
console.log(await storeNews(admin, items, errors));
const tagged = items.filter((item) => item.brand_slugs.length);
console.log(`${tagged.length} mention a brand on SniffNotes:`, tagged.map((i) => `${i.title.slice(0, 50)} → ${i.brand_slugs.join(",")}`).slice(0, 10));
