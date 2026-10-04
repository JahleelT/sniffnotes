import { fragrances } from "@/data/fragrances";
import { themeMap, type Mood } from "@/utils/themeMap";

export function getAllFragrances() {
    return fragrances;
}

export function getFragranceById(id: string) {
    return fragrances.find((fragrance) => fragrance.id === id);
}

// Every word in the query must appear in the name, brand, collection, tags, or notes.
export function searchFragrances({ query = "", mood }: { query?: string; mood?: Mood }) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

    return fragrances.filter((fragrance) => {
        if (mood && !fragrance.tags.includes(mood)) return false;

        const searchable = [
            fragrance.name,
            fragrance.brand,
            fragrance.collection ?? "",
            ...fragrance.tags.map((tag) => themeMap[tag].label),
            ...fragrance.notes.top,
            ...fragrance.notes.mid,
            ...fragrance.notes.base,
        ].join(" ").toLowerCase();

        return terms.every((term) => searchable.includes(term));
    });
}
