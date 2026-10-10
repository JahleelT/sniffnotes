import { LONGEVITY_LEVELS, SEASONS, SILLAGE_LEVELS, type LongevityLevel, type Season, type SillageLevel } from "@/lib/review-scales";
import { parsePriceTier, type PriceTier } from "@/lib/price";
import { isMood, type Mood } from "@/utils/themeMap";

// Everything the search page can filter by, as it appears in the URL.
export type SearchFilters = {
    query: string;
    mood?: Mood;
    brand?: string;
    line?: string;
    note?: string;
    // Highest price tier to show, so "$$" means $ and $$.
    price?: PriceTier;
    // These three come from community reviews.
    longevity?: LongevityLevel;
    sillage?: SillageLevel;
    season?: Season;
};

type RawParams = Record<string, string | string[] | undefined>;

function text(value: string | string[] | undefined) {
    const single = Array.isArray(value) ? value[0] : value;
    return single?.trim() || undefined;
}

export function parseSearchParams(params: RawParams): SearchFilters {
    const mood = text(params.mood);
    const longevity = text(params.longevity);
    const sillage = text(params.sillage);
    const season = text(params.season);
    return {
        query: text(params.q) ?? "",
        mood: mood && isMood(mood) ? mood : undefined,
        brand: text(params.brand),
        line: text(params.line),
        note: text(params.note),
        price: parsePriceTier(text(params.price)),
        longevity: longevity && Object.hasOwn(LONGEVITY_LEVELS, longevity) ? (longevity as LongevityLevel) : undefined,
        sillage: sillage && Object.hasOwn(SILLAGE_LEVELS, sillage) ? (sillage as SillageLevel) : undefined,
        season: SEASONS.find((s) => s.value === season)?.value,
    };
}

// URL params for a set of filters (empty values left out).
export function filterParams(filters: Partial<SearchFilters>): Record<string, string> {
    const entries = {
        q: filters.query,
        mood: filters.mood,
        brand: filters.brand,
        line: filters.line,
        note: filters.note,
        price: filters.price ? String(filters.price) : undefined,
        longevity: filters.longevity,
        sillage: filters.sillage,
        season: filters.season,
    };
    return Object.fromEntries(Object.entries(entries).filter((entry): entry is [string, string] => Boolean(entry[1])));
}

// A /search link for the given filters, e.g. searchHref({ note: "Rose" }).
export function searchHref(filters: Partial<SearchFilters>) {
    const params = new URLSearchParams(filterParams(filters)).toString();
    return params ? `/search?${params}` : "/search";
}

export function hasFilters(filters: SearchFilters) {
    return Object.keys(filterParams(filters)).length > 0;
}
