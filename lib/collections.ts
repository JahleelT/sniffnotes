import { getCurrentUser } from "@/lib/auth";
import { getFragranceById } from "@/lib/fragrances";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import type { Fragrance } from "@/data/fragrances";

export type CollectionKind = Database["public"]["Enums"]["collection_kind"];

export type CollectionSummary = {
    id: string;
    userId: string;
    kind: CollectionKind;
    name: string;
    sharedWithFriends: boolean;
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

const COLLECTION_COLUMNS = "id, user_id, kind, name, shared_with_friends, created_at, collection_items(fragrance_id, added_at)";

// Someone's collections: your own by default, or a friend's (row-level security only returns
// a friend's collections they've shared). Filtering by owner matters, because the signed-in
// user can also read their friends' shared collections.
export async function getCollections(ownerId?: string): Promise<CollectionSummary[]> {
    const userId = ownerId ?? (await getCurrentUser())?.id;
    if (!userId) return [];

    const supabase = await createClient();
    const { data } = await supabase.from("collections").select(COLLECTION_COLUMNS).eq("user_id", userId);

    return sortCollections(data ?? []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        kind: row.kind,
        name: row.name,
        sharedWithFriends: row.shared_with_friends,
        fragranceIds: newestFirst(row.collection_items),
    }));
}

export async function getCollection(id: string): Promise<CollectionDetail | null> {
    const supabase = await createClient();
    const { data: row } = await supabase
        .from("collections")
        .select(COLLECTION_COLUMNS)
        .eq("id", id)
        .maybeSingle();

    if (!row) return null;

    const fragranceIds = newestFirst(row.collection_items);

    return {
        id: row.id,
        userId: row.user_id,
        kind: row.kind,
        name: row.name,
        sharedWithFriends: row.shared_with_friends,
        fragranceIds,
        // Fragrances removed from the dataset are skipped.
        fragrances: fragranceIds.map(getFragranceById).filter((f): f is Fragrance => Boolean(f)),
    };
}

export function cleanCollectionName(value: unknown) {
    return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, MAX_COLLECTION_NAME_LENGTH);
}
