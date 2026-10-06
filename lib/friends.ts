import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type PublicProfile = {
    id: string;
    username: string | null;
    displayName: string;
};

export type Relationship = "self" | "friends" | "incoming" | "outgoing" | "none";

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

type FriendshipRow = { requester_id: string; addressee_id: string; status: string };

const getFriendshipRows = cache(async (): Promise<FriendshipRow[]> => {
    if (!(await getCurrentUser())) return [];
    const supabase = await createClient();
    const { data } = await supabase.from("friendships").select("requester_id, addressee_id, status");
    return data ?? [];
});

export async function getPublicProfiles(ids: string[]): Promise<Map<string, PublicProfile>> {
    if (!ids.length) return new Map();
    const supabase = await createClient();
    const { data } = await supabase.rpc("public_profiles", { user_ids: [...new Set(ids)] });
    return new Map((data ?? []).map((p) => [p.id, { id: p.id, username: p.username, displayName: p.display_name || p.username || "A SniffNotes member" }]));
}

export async function getProfileByUsername(username: string): Promise<PublicProfile | null> {
    const supabase = await createClient();
    const { data } = await supabase.rpc("profile_by_username", { handle: username });
    const row = data?.[0];
    return row ? { id: row.id, username: row.username, displayName: row.display_name || row.username || "" } : null;
}

export async function findProfiles(search: string): Promise<PublicProfile[]> {
    if (search.trim().length < 2) return [];
    const supabase = await createClient();
    const { data } = await supabase.rpc("find_profiles", { search });
    return (data ?? []).map((p) => ({ id: p.id, username: p.username, displayName: p.display_name || p.username || "" }));
}

export async function getFriendIds(): Promise<Set<string>> {
    const user = await getCurrentUser();
    if (!user) return new Set();
    return new Set(
        (await getFriendshipRows())
            .filter((row) => row.status === "accepted")
            .map((row) => (row.requester_id === user.id ? row.addressee_id : row.requester_id)),
    );
}

export async function getRelationship(otherId: string): Promise<Relationship> {
    const user = await getCurrentUser();
    if (!user) return "none";
    if (user.id === otherId) return "self";

    const row = (await getFriendshipRows()).find((r) => r.requester_id === otherId || r.addressee_id === otherId);
    if (!row) return "none";
    if (row.status === "accepted") return "friends";
    return row.requester_id === user.id ? "outgoing" : "incoming";
}

// Everyone the signed-in user is connected to, grouped, with public profile info.
export async function getFriendLists() {
    const user = await getCurrentUser();
    if (!user) return { friends: [], incoming: [], outgoing: [] };

    const rows = await getFriendshipRows();
    const other = (row: FriendshipRow) => (row.requester_id === user.id ? row.addressee_id : row.requester_id);
    const profiles = await getPublicProfiles(rows.map(other));
    const pick = (filter: (row: FriendshipRow) => boolean) =>
        rows.filter(filter).map((row) => profiles.get(other(row))).filter((p): p is PublicProfile => Boolean(p))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return {
        friends: pick((r) => r.status === "accepted"),
        incoming: pick((r) => r.status === "pending" && r.addressee_id === user.id),
        outgoing: pick((r) => r.status === "pending" && r.requester_id === user.id),
    };
}
