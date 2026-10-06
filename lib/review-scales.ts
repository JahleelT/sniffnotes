// Review scales and search levels. No server imports, so client components can use them too.
import type { Database } from "@/lib/supabase/database.types";

export type Season = Database["public"]["Enums"]["season"];

export const SEASONS: { value: Season; label: string }[] = [
    { value: "spring", label: "Spring" },
    { value: "summer", label: "Summer" },
    { value: "fall", label: "Fall" },
    { value: "winter", label: "Winter" },
];

// Index = stored value. 1-based scales, so index 0 is unused.
export const LONGEVITY_LABELS = ["", "Very weak", "Weak", "Moderate", "Long lasting", "Eternal"];
export const SILLAGE_LABELS = ["", "Intimate", "Moderate", "Strong", "Enormous"];

// Search levels: a fragrance qualifies when its community average reaches the minimum.
export const LONGEVITY_LEVELS = {
    moderate: { label: "Moderate or longer", min: 3 },
    long: { label: "Long lasting or longer", min: 4 },
    eternal: { label: "Eternal", min: 4.5 },
} as const;

export const SILLAGE_LEVELS = {
    moderate: { label: "Moderate or stronger", min: 2 },
    strong: { label: "Strong or stronger", min: 3 },
    enormous: { label: "Enormous", min: 3.5 },
} as const;

export type LongevityLevel = keyof typeof LONGEVITY_LEVELS;
export type SillageLevel = keyof typeof SILLAGE_LEVELS;

export type ReviewStats = {
    reviewCount: number;
    avgRating: number;
    avgLongevity: number | null;
    longevityVotes: number;
    avgSillage: number | null;
    sillageVotes: number;
    seasonVotes: number;
    seasons: Record<Season, number>;
};

// Label for an average on a 1-based scale ("Long lasting" for 4.2).
export function scaleLabel(labels: string[], average: number | null) {
    return average === null ? null : labels[Math.min(labels.length - 1, Math.max(1, Math.round(average)))];
}

// A season counts as "good for" a fragrance when at least half of season voters picked it.
export function suitsSeason(stats: ReviewStats | undefined, season: Season) {
    return Boolean(stats && stats.seasonVotes > 0 && stats.seasons[season] / stats.seasonVotes >= 0.5);
}

// Whether a fragrance's community stats meet the performance and season search filters.
export function matchesCommunityFilters(
    stats: ReviewStats | undefined,
    filters: { longevity?: LongevityLevel; sillage?: SillageLevel; season?: Season },
) {
    if (filters.longevity && !(stats?.avgLongevity != null && stats.avgLongevity >= LONGEVITY_LEVELS[filters.longevity].min)) return false;
    if (filters.sillage && !(stats?.avgSillage != null && stats.avgSillage >= SILLAGE_LEVELS[filters.sillage].min)) return false;
    if (filters.season && !suitsSeason(stats, filters.season)) return false;
    return true;
}
