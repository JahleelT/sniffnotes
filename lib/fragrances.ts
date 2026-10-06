import { fragrances } from "@/data/fragrances";
import { themeMap, type Mood } from "@/utils/themeMap";

export function getAllFragrances() {
    return fragrances;
}

export function getFragranceById(id: string) {
    return fragrances.find((fragrance) => fragrance.id === id);
}

// Lowercase without accents, so "hermes" matches "Hermès" and "arpege" matches "Arpège".
function fold(text: string) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Every word in the query must appear in the name, brand, collection, tags, or notes.
export function searchFragrances({ query = "", mood }: { query?: string; mood?: Mood }) {
    const terms = fold(query).split(/\s+/).filter(Boolean);

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
        ].join(" ");

        const folded = fold(searchable);
        return terms.every((term) => folded.includes(term));
    });
}
