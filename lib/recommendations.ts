import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getCollections, type CollectionKind } from "@/lib/collections";
import { getAllFragrances } from "@/lib/fragrances";
import { getPreferences } from "@/lib/preferences";
import { buildIndex, recommendFor, similarByMood, topMoods, type Recommendation, type TasteSignal } from "@/lib/recommend";
import type { Mood } from "@/utils/themeMap";

// The dataset is static per deploy, so the index is built once.
const index = buildIndex(getAllFragrances());

// How much each collection says about someone's taste. Sampled may include things they didn't like.
const COLLECTION_WEIGHT: Record<CollectionKind, number> = {
    owned: 1,
    wishlist: 0.9,
    saved: 0.8,
    custom: 0.7,
    sampled: 0.4,
};

export function getSimilarFragrances(fragranceId: string, limit = 8) {
    return similarByMood(index, fragranceId, limit);
}

// One signal per saved fragrance, using its strongest collection.
const getTasteSignals = cache(async (): Promise<TasteSignal[]> => {
    if (!(await getCurrentUser())) return [];

    const weights = new Map<string, number>();
    for (const collection of await getCollections()) {
        for (const fragranceId of collection.fragranceIds) {
            weights.set(fragranceId, Math.max(weights.get(fragranceId) ?? 0, COLLECTION_WEIGHT[collection.kind]));
        }
    }
    return [...weights].map(([fragranceId, weight]) => ({ fragranceId, weight }));
});

export type PersonalRecommendations = {
    picks: Recommendation[];
    savedCount: number;
    favoriteMoods: Mood[];
};

export async function getPersonalRecommendations(limit = 8): Promise<PersonalRecommendations> {
    const [signals, { favoriteMoods }] = await Promise.all([getTasteSignals(), getPreferences()]);
    return {
        picks: recommendFor(index, signals, favoriteMoods, limit),
        savedCount: signals.length,
        favoriteMoods,
    };
}

// Moods to feature first in the homepage slideshow: favorites, then the moods someone saves most.
export async function getFeaturedMoods(): Promise<Mood[]> {
    const [signals, { favoriteMoods }] = await Promise.all([getTasteSignals(), getPreferences()]);
    return [...new Set([...favoriteMoods, ...topMoods(index, signals)])];
}

function list(items: string[]) {
    return items.length > 1 ? `${items.slice(0, -1).join(", ")} & ${items.at(-1)}` : items[0];
}

// One short line explaining a recommendation. Shared moods aren't repeated here; the card bolds them.
export function describeRecommendation(recommendation: Recommendation) {
    if (recommendation.because) return `Because you saved ${recommendation.because.name}`;
    if (recommendation.sharedNotes.length) return `Shares ${list(recommendation.sharedNotes.slice(0, 2).map((n) => n.toLowerCase()))}`;
    return "";
}
