import { isMood, type Mood } from "@/utils/themeMap";

// Everything the search page can filter by, as it appears in the URL.
export type SearchFilters = {
    query: string;
    mood?: Mood;
    brand?: string;
    line?: string;
    note?: string;
};

type RawParams = Record<string, string | string[] | undefined>;

function text(value: string | string[] | undefined) {
    const single = Array.isArray(value) ? value[0] : value;
    return single?.trim() || undefined;
}

export function parseSearchParams(params: RawParams): SearchFilters {
    const mood = text(params.mood);
    return {
        query: text(params.q) ?? "",
        mood: mood && isMood(mood) ? mood : undefined,
        brand: text(params.brand),
        line: text(params.line),
        note: text(params.note),
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
