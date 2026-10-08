import stores from "@/data/guide/stores.json";
import { SECTIONS, type StoreType } from "@/lib/guide-areas";

export type Store = {
    id: string;
    name: string;
    type: StoreType;
    neighborhood: string;
    address: string;
    website: string;
    carries: string[];
    customBlends: boolean;
    verified: boolean;
    note: string;
    lat?: number;
    lon?: number;
};

// "custom" is a filter on the custom-blends flag, which any type of store can have.
export type GuideFilter = StoreType | "all";

const allStores = stores as Store[];

function matches(store: Store, filter: GuideFilter) {
    if (filter === "all") return true;
    if (filter === "custom") return store.customBlends;
    return store.type === filter;
}

// Sections south to north, each with only the neighborhoods that have matching stores.
export function getGuide(filter: GuideFilter = "all") {
    const visible = allStores.filter((store) => matches(store, filter));

    const sections = SECTIONS.map((section) => {
        const neighborhoods = section.neighborhoods
            .map((name) => ({
                name,
                stores: visible
                    .filter((store) => store.neighborhood === name)
                    .sort((a, b) => Number(b.verified) - Number(a.verified) || a.name.localeCompare(b.name)),
            }))
            .filter((n) => n.stores.length > 0);
        return { name: section.name, neighborhoods, count: neighborhoods.reduce((sum, n) => sum + n.stores.length, 0) };
    }).filter((s) => s.count > 0);

    return { sections, total: visible.length, counts: countByFilter() };
}

function countByFilter(): Record<GuideFilter, number> {
    return {
        all: allStores.length,
        boutique: allStores.filter((s) => matches(s, "boutique")).length,
        perfumery: allStores.filter((s) => matches(s, "perfumery")).length,
        shop: allStores.filter((s) => matches(s, "shop")).length,
        custom: allStores.filter((s) => matches(s, "custom")).length,
    };
}

// Opens the store in the visitor's maps app (by address when known, otherwise by coordinates).
export function directionsUrl(store: Store) {
    const query = store.address ? `${store.name}, ${store.address}, New York, NY` : `${store.lat},${store.lon}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
