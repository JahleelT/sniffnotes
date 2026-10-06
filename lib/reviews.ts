import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ReviewStats, Season } from "@/lib/review-scales";

export * from "@/lib/review-scales";

// Every fragrance's community stats, read in one query (the dataset is small).
export const getReviewStats = cache(async (): Promise<Map<string, ReviewStats>> => {
    const supabase = await createClient();
    const { data } = await supabase.from("fragrance_review_stats").select("*");

    return new Map((data ?? []).filter((row) => row.fragrance_id).map((row) => [row.fragrance_id!, {
        reviewCount: row.review_count ?? 0,
        avgRating: row.avg_rating ?? 0,
        avgLongevity: row.avg_longevity,
        longevityVotes: row.longevity_votes ?? 0,
        avgSillage: row.avg_sillage,
        sillageVotes: row.sillage_votes ?? 0,
        seasonVotes: row.season_votes ?? 0,
        seasons: { spring: row.spring ?? 0, summer: row.summer ?? 0, fall: row.fall ?? 0, winter: row.winter ?? 0 },
    }]));
});

export type Review = {
    id: string;
    userId: string;
    author: string;
    rating: number;
    longevity: number | null;
    sillage: number | null;
    seasons: Season[];
    body: string;
    updatedAt: string;
};

// A fragrance's reviews, newest first, with each author's display name.
export async function getReviews(fragranceId: string): Promise<Review[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from("reviews")
        .select("id, user_id, rating, longevity, sillage, seasons, body, updated_at")
        .eq("fragrance_id", fragranceId)
        .order("updated_at", { ascending: false });

    const rows = data ?? [];
    const { data: names } = rows.length
        ? await supabase.rpc("display_names", { user_ids: [...new Set(rows.map((r) => r.user_id))] })
        : { data: [] };
    const nameById = new Map((names ?? []).map((n) => [n.id, n.display_name]));

    return rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        author: nameById.get(row.user_id) || "A SniffNotes member",
        rating: row.rating,
        longevity: row.longevity,
        sillage: row.sillage,
        seasons: row.seasons,
        body: row.body,
        updatedAt: row.updated_at,
    }));
}
