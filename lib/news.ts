import "server-only";
import { after } from "next/server";
import { getBrands } from "@/lib/brands";
import { claimNewsRun, fetchNews, NEWS_REFRESH_HOURS, storeNews } from "@/lib/news-core";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type NewsItem = {
    id: string;
    url: string;
    title: string;
    source: string;
    publishedAt: string;
    summary: string;
    imageUrl: string | null;
    brandSlugs: string[];
    fragranceIds: string[];
};

function references() {
    const brands = getBrands();
    return {
        brands: brands.map((b) => ({ slug: b.slug, name: b.name })),
        fragrances: brands.flatMap((b) => b.fragrances.map((f) => ({ id: f.id, name: f.name, brandSlug: b.slug }))),
    };
}

// Fetches and stores news now if it's due (or `force`). Safe to call from many requests at once.
export async function runNewsRefresh(force = false) {
    const admin = createAdminClient();
    if (!(await claimNewsRun(admin, force))) return "skipped: refreshed recently";

    const { brands, fragrances } = references();
    const { items, errors } = await fetchNews(brands, fragrances);
    return storeNews(admin, items, errors);
}

export async function getLastNewsRun() {
    const supabase = await createClient();
    const { data } = await supabase.from("job_runs").select("last_run_at").eq("name", "news").maybeSingle();
    return data ? new Date(data.last_run_at) : null;
}

// With no always-on scheduler, a visit to a news page refreshes stale news after the response is sent.
export async function refreshNewsIfStale() {
    const lastRun = await getLastNewsRun();
    if (!lastRun || Date.now() - lastRun.getTime() > NEWS_REFRESH_HOURS * 3_600_000) {
        after(() => runNewsRefresh().catch((error) => console.error("News refresh failed:", error)));
    }
}

export async function getNews({ brandSlugs, fragranceId, limit = 40 }: { brandSlugs?: string[]; fragranceId?: string; limit?: number } = {}): Promise<NewsItem[]> {
    if (brandSlugs && !brandSlugs.length) return [];

    const supabase = await createClient();
    let query = supabase
        .from("news_items")
        .select("id, url, title, source, published_at, summary, image_url, brand_slugs, fragrance_ids")
        .order("published_at", { ascending: false })
        .limit(limit);
    if (brandSlugs) query = query.overlaps("brand_slugs", brandSlugs);
    if (fragranceId) query = query.contains("fragrance_ids", [fragranceId]);

    const { data } = await query;
    return (data ?? []).map((row) => ({
        id: row.id,
        url: row.url,
        title: row.title,
        source: row.source,
        publishedAt: row.published_at,
        summary: row.summary,
        imageUrl: row.image_url,
        brandSlugs: row.brand_slugs,
        fragranceIds: row.fragrance_ids,
    }));
}
