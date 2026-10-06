import { fragrances, type Fragrance } from "@/data/fragrances";
import type { SearchFilters } from "@/lib/search-params";
import { themeMap } from "@/utils/themeMap";

export function getAllFragrances() {
    return fragrances;
}

export function getFragranceById(id: string) {
    return fragrances.find((fragrance) => fragrance.id === id);
}

// Lowercase without accents, so "hermes" matches "Hermès" and "arpege" matches "Arpège".
export function fold(text: string) {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function allNotes(fragrance: Fragrance) {
    return [...fragrance.notes.top, ...fragrance.notes.mid, ...fragrance.notes.base];
}

// Free text must match somewhere; brand and line must match exactly; a note filter matches any
// note containing it ("rose" matches "Turkish Rose"). Accents and case are ignored throughout.
export function searchFragrances(filters: Partial<SearchFilters>) {
    const terms = fold(filters.query ?? "").split(/\s+/).filter(Boolean);
    const brand = filters.brand && fold(filters.brand);
    const line = filters.line && fold(filters.line);
    const note = filters.note && fold(filters.note);

    return fragrances.filter((fragrance) => {
        if (filters.mood && !fragrance.tags.includes(filters.mood)) return false;
        if (brand && fold(fragrance.brand) !== brand) return false;
        if (line && fold(fragrance.collection ?? "") !== line) return false;
        if (note && !allNotes(fragrance).some((n) => fold(n).includes(note))) return false;

        const searchable = fold([
            fragrance.name,
            fragrance.brand,
            fragrance.collection ?? "",
            ...fragrance.tags.map((tag) => themeMap[tag].label),
            ...allNotes(fragrance),
        ].join(" "));

        return terms.every((term) => searchable.includes(term));
    });
}

// Options for the search filters, with how many fragrances each one has.
export function getSearchFacets() {
    const count = <T,>(values: T[], key: (value: T) => string) => {
        const counts = new Map<string, { value: T; count: number }>();
        for (const value of values) {
            const k = key(value);
            counts.set(k, { value, count: (counts.get(k)?.count ?? 0) + 1 });
        }
        return [...counts.values()];
    };
    const byName = (a: string, b: string) => fold(a).localeCompare(fold(b));

    const brands = count(fragrances.map((f) => f.brand), fold)
        .map(({ value, count }) => ({ brand: value, count }))
        .sort((a, b) => byName(a.brand, b.brand));

    const lines = count(fragrances.filter((f) => f.collection), (f) => fold(f.collection!))
        .map(({ value, count }) => ({ line: value.collection!, brand: value.brand, count }))
        .sort((a, b) => byName(a.brand, b.brand) || byName(a.line, b.line));

    const notes = count(fragrances.flatMap(allNotes), fold)
        .map(({ value, count }) => ({ note: value, count }))
        .sort((a, b) => byName(a.note, b.note));

    return { brands, lines, notes };
}
