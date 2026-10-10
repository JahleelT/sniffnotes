import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollectionKind, CollectionSummary } from "@/lib/collections";
import { getFragranceById } from "@/lib/fragrances";
import type { Database } from "@/lib/supabase/database.types";

// Visitors without an account can save to the four preset collections. Saves live in a cookie (so
// pages and recommendations can read them on the server) and move into the account on sign-in.

export const GUEST_SAVES_COOKIE = "sniffnotes-guest-saves";
const GUEST_PREFIX = "guest-";
// Keeps the cookie well under the browser's 4 KB limit.
const MAX_PER_COLLECTION = 60;

type GuestKind = Exclude<CollectionKind, "custom">;
type GuestSaves = Record<GuestKind, string[]>;

// Same names as the presets every account starts with.
const GUEST_COLLECTIONS: { kind: GuestKind; name: string }[] = [
    { kind: "saved", name: "Sniff List" },
    { kind: "wishlist", name: "Wishlist" },
    { kind: "sampled", name: "Sampled" },
    { kind: "owned", name: "Owned" },
];

export function isGuestCollectionId(id: string) {
    return GUEST_COLLECTIONS.some(({ kind }) => id === `${GUEST_PREFIX}${kind}`);
}

async function readGuestSaves(): Promise<GuestSaves> {
    const empty: GuestSaves = { saved: [], wishlist: [], sampled: [], owned: [] };
    const value = (await cookies()).get(GUEST_SAVES_COOKIE)?.value;
    if (!value) return empty;

    try {
        const raw = JSON.parse(value) as Record<string, unknown>;
        for (const { kind } of GUEST_COLLECTIONS) {
            const ids = Array.isArray(raw[kind]) ? raw[kind] : [];
            empty[kind] = [...new Set(ids.filter((id): id is string => typeof id === "string" && Boolean(getFragranceById(id))))];
        }
    } catch {
        // A damaged cookie just means nothing saved.
    }
    return empty;
}

export async function getGuestCollections(): Promise<CollectionSummary[]> {
    const saves = await readGuestSaves();
    return GUEST_COLLECTIONS.map(({ kind, name }) => ({
        id: `${GUEST_PREFIX}${kind}`,
        userId: "",
        kind,
        name,
        sharedWithFriends: false,
        fragranceIds: saves[kind],
    }));
}

export async function hasGuestSaves() {
    return Object.values(await readGuestSaves()).some((ids) => ids.length > 0);
}

// Only call from Server Actions or Route Handlers (they're the only places cookies can be set).
export async function setGuestSaved(collectionId: string, fragranceId: string, saved: boolean) {
    const kind = collectionId.slice(GUEST_PREFIX.length) as GuestKind;
    if (!isGuestCollectionId(collectionId) || !getFragranceById(fragranceId)) return false;

    const saves = await readGuestSaves();
    const without = saves[kind].filter((id) => id !== fragranceId);
    // Newest first, like account collections.
    saves[kind] = saved ? [fragranceId, ...without].slice(0, MAX_PER_COLLECTION) : without;

    (await cookies()).set(GUEST_SAVES_COOKIE, JSON.stringify(saves), {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });
    return true;
}

// After sign-in or sign-up: copies anything saved as a guest into the account's preset
// collections, then forgets the guest copy. Already-saved fragrances are left as they are.
export async function mergeGuestSaves(supabase: SupabaseClient<Database>, userId: string) {
    const saves = await readGuestSaves();
    if (!Object.values(saves).some((ids) => ids.length)) return;

    const { data: presets } = await supabase.from("collections").select("id, kind").eq("user_id", userId).neq("kind", "custom");
    const rows = (presets ?? []).flatMap(({ id, kind }) =>
        (saves[kind as GuestKind] ?? []).map((fragranceId) => ({ collection_id: id, fragrance_id: fragranceId })),
    );

    if (rows.length) {
        const { error } = await supabase
            .from("collection_items")
            .upsert(rows, { onConflict: "collection_id,fragrance_id", ignoreDuplicates: true });
        // Keep the guest copy if it didn't make it, so nothing is lost.
        if (error) return;
    }

    (await cookies()).delete(GUEST_SAVES_COOKIE);
}
