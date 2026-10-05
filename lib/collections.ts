import { getFragranceById } from "@/lib/fragrances";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import type { Fragrance } from "@/data/fragrances";

export type CollectionKind = Database["public"]["Enums"]["collection_kind"];

export type CollectionSummary = {
    id: string;
    kind: CollectionKind;
    name: string;
    fragranceIds: string[];
};

export type CollectionDetail = CollectionSummary & {
    fragrances: Fragrance[];
};

export const MAX_COLLECTION_NAME_LENGTH = 40;

const presetOrder: CollectionKind[] = ["saved", "wishlist", "sampled", "owned"];

// Presets first in a fixed order, then custom collections oldest first.
function sortCollections<T extends { kind: CollectionKind; created_at: string }>(rows: T[]) {
    const rank = (kind: CollectionKind) => (kind === "custom" ? presetOrder.length : presetOrder.indexOf(kind));
    return [...rows].sort((a, b) => rank(a.kind) - rank(b.kind) || a.created_at.localeCompare(b.created_at));
}

function newestFirst(items: { fragrance_id: string; added_at: string }[]) {
    return [...items].sort((a, b) => b.added_at.localeCompare(a.added_at)).map((item) => item.fragrance_id);
}

// Row-level security limits every query here to the signed-in user's collections.
export async function getCollections(): Promise<CollectionSummary[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from("collections")
        .select("id, kind, name, created_at, collection_items(fragrance_id, added_at)");

    return sortCollections(data ?? []).map((row) => ({
        id: row.id,
        kind: row.kind,
        name: row.name,
        fragranceIds: newestFirst(row.collection_items),
    }));
}

export async function getCollection(id: string): Promise<CollectionDetail | null> {
    const supabase = await createClient();
    const { data: row } = await supabase
        .from("collections")
        .select("id, kind, name, created_at, collection_items(fragrance_id, added_at)")
        .eq("id", id)
        .maybeSingle();

    if (!row) return null;

    const fragranceIds = newestFirst(row.collection_items);

    return {
        id: row.id,
        kind: row.kind,
        name: row.name,
        fragranceIds,
        // Fragrances removed from the dataset are skipped.
        fragrances: fragranceIds.map(getFragranceById).filter((f): f is Fragrance => Boolean(f)),
    };
}

export function cleanCollectionName(value: unknown) {
    return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, MAX_COLLECTION_NAME_LENGTH);
}
