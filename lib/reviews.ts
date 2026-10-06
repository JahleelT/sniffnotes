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
    // For linking to the author's profile; null until they pick a username.
    authorUsername: string | null;
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
    const { data: profiles } = rows.length
        ? await supabase.rpc("public_profiles", { user_ids: [...new Set(rows.map((r) => r.user_id))] })
        : { data: [] };
    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

    return rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        author: profileById.get(row.user_id)?.display_name || "A SniffNotes member",
        authorUsername: profileById.get(row.user_id)?.username ?? null,
        rating: row.rating,
        longevity: row.longevity,
        sillage: row.sillage,
        seasons: row.seasons,
        body: row.body,
        updatedAt: row.updated_at,
    }));
}

export type UserReview = {
    fragranceId: string;
    rating: number;
    body: string;
    updatedAt: string;
};

// Someone's reviews (public), newest first, for their profile page.
export async function getReviewsByUser(userId: string): Promise<UserReview[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from("reviews")
        .select("fragrance_id, rating, body, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

    return (data ?? []).map((row) => ({ fragranceId: row.fragrance_id, rating: row.rating, body: row.body, updatedAt: row.updated_at }));
}
