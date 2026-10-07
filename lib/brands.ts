import { cache } from "react";
import type { Fragrance } from "@/data/fragrances";
import { getCurrentUser } from "@/lib/auth";
import { fold, getAllFragrances } from "@/lib/fragrances";
import { createClient } from "@/lib/supabase/server";
import type { Mood } from "@/utils/themeMap";

export type Brand = {
    slug: string;
    name: string;
    fragrances: Fragrance[];
    // The mood most of its fragrances lead with, for theming the brand page.
    mood: Mood;
};

export function brandSlug(name: string) {
    return fold(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Every brand in the dataset, alphabetically. Built once, since the dataset is static per deploy.
const brands: Brand[] = (() => {
    const bySlug = new Map<string, Fragrance[]>();
    for (const fragrance of getAllFragrances()) {
        const slug = brandSlug(fragrance.brand);
        bySlug.set(slug, [...(bySlug.get(slug) ?? []), fragrance]);
    }

    return [...bySlug].map(([slug, fragrances]) => {
        const moodCounts = new Map<Mood, number>();
        fragrances.forEach((f) => moodCounts.set(f.tags[0], (moodCounts.get(f.tags[0]) ?? 0) + 1));
        return {
            slug,
            name: fragrances[0].brand,
            fragrances: [...fragrances].sort((a, b) => a.name.localeCompare(b.name)),
            mood: [...moodCounts].sort((a, b) => b[1] - a[1])[0][0],
        };
    }).sort((a, b) => fold(a.name).localeCompare(fold(b.name)));
})();

export function getBrands() {
    return brands;
}

export function getBrandBySlug(slug: string) {
    return brands.find((brand) => brand.slug === slug);
}

export const getFollowedBrandSlugs = cache(async (): Promise<Set<string>> => {
    if (!(await getCurrentUser())) return new Set();
    const supabase = await createClient();
    const { data } = await supabase.from("brand_follows").select("brand_slug");
    return new Set((data ?? []).map((row) => row.brand_slug));
});

export const getFollowerCounts = cache(async (): Promise<Map<string, number>> => {
    const supabase = await createClient();
    const { data } = await supabase.rpc("brand_follower_counts");
    return new Map((data ?? []).map((row) => [row.brand_slug, row.followers]));
});
