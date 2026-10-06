import { cache } from "react";
import { getPublicProfiles } from "@/lib/friends";
import { createClient } from "@/lib/supabase/server";

// Net votes (up minus down) a suggestion needs to become the description shown on the page.
export const APPROVAL_SCORE = 3;
export const MIN_SUGGESTION_LENGTH = 40;
export const MAX_SUGGESTION_LENGTH = 2000;

export type Suggestion = {
    id: string;
    userId: string;
    author: string;
    authorUsername: string | null;
    body: string;
    upvotes: number;
    downvotes: number;
    score: number;
    // The signed-in viewer's vote: 1, -1, or 0 for none.
    myVote: number;
    updatedAt: string;
};

// A fragrance's suggestions, best first (ties go to the earlier one).
export const getSuggestions = cache(async (fragranceId: string, viewerId?: string): Promise<Suggestion[]> => {
    const supabase = await createClient();
    const { data } = await supabase
        .from("description_suggestions")
        .select("id, user_id, body, updated_at, description_votes(user_id, value)")
        .eq("fragrance_id", fragranceId);

    const rows = data ?? [];
    const profiles = await getPublicProfiles(rows.map((row) => row.user_id));

    return rows
        .map((row) => {
            const votes = row.description_votes;
            const upvotes = votes.filter((v) => v.value > 0).length;
            const downvotes = votes.filter((v) => v.value < 0).length;
            return {
                id: row.id,
                userId: row.user_id,
                author: profiles.get(row.user_id)?.displayName ?? "A SniffNotes member",
                authorUsername: profiles.get(row.user_id)?.username ?? null,
                body: row.body,
                upvotes,
                downvotes,
                score: upvotes - downvotes,
                myVote: votes.find((v) => v.user_id === viewerId)?.value ?? 0,
                updatedAt: row.updated_at,
            };
        })
        .sort((a, b) => b.score - a.score || a.updatedAt.localeCompare(b.updatedAt));
});

// The peer-approved description, if any suggestion has earned enough votes.
export function communityDescription(suggestions: Suggestion[]) {
    return suggestions.find((s) => s.score >= APPROVAL_SCORE) ?? null;
}
