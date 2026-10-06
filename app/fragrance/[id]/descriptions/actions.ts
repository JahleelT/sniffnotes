"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { MAX_SUGGESTION_LENGTH, MIN_SUGGESTION_LENGTH } from "@/lib/descriptions";
import { getFragranceById } from "@/lib/fragrances";
import type { FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

function refresh(fragranceId: string) {
    revalidatePath(`/fragrance/${fragranceId}`);
    revalidatePath(`/fragrance/${fragranceId}/descriptions`);
}

// Creates or edits your suggestion for a fragrance. Editing the text resets its votes (a database trigger).
export async function saveSuggestion(_: FormState, formData: FormData): Promise<FormState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Sign in to suggest a description." };

    const fragranceId = String(formData.get("fragranceId") ?? "");
    if (!getFragranceById(fragranceId)) return { error: "That fragrance doesn't exist." };

    const body = String(formData.get("body") ?? "").trim();
    if (body.length < MIN_SUGGESTION_LENGTH) return { error: `Write at least ${MIN_SUGGESTION_LENGTH} characters.` };
    if (body.length > MAX_SUGGESTION_LENGTH) return { error: `Keep it under ${MAX_SUGGESTION_LENGTH} characters.` };

    const supabase = await createClient();
    const { error } = await supabase
        .from("description_suggestions")
        .upsert({ user_id: user.id, fragrance_id: fragranceId, body }, { onConflict: "user_id,fragrance_id" });

    if (error) return { error: "We couldn't save your suggestion. Try again." };

    refresh(fragranceId);
    return { message: "Suggestion saved. Others can now vote on it." };
}

export async function deleteSuggestion(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return;

    const fragranceId = String(formData.get("fragranceId") ?? "");
    const supabase = await createClient();
    await supabase.from("description_suggestions").delete().match({ user_id: user.id, fragrance_id: fragranceId });
    refresh(fragranceId);
}

// Votes up or down; voting the same way again takes the vote back.
export async function voteOnSuggestion(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return;

    const suggestionId = String(formData.get("suggestionId") ?? "");
    const fragranceId = String(formData.get("fragranceId") ?? "");
    const value = Number(formData.get("value")) > 0 ? 1 : -1;

    const supabase = await createClient();
    const { data: current } = await supabase
        .from("description_votes")
        .select("value")
        .match({ suggestion_id: suggestionId, user_id: user.id })
        .maybeSingle();

    if (current?.value === value) {
        await supabase.from("description_votes").delete().match({ suggestion_id: suggestionId, user_id: user.id });
    } else {
        // Row-level security refuses votes on your own suggestion.
        await supabase
            .from("description_votes")
            .upsert({ suggestion_id: suggestionId, user_id: user.id, value }, { onConflict: "suggestion_id,user_id" });
    }

    refresh(fragranceId);
}
