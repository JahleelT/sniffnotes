"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { cleanCollectionName } from "@/lib/collections";
import { getFragranceById } from "@/lib/fragrances";
import { isGuestCollectionId, setGuestSaved } from "@/lib/guest-collections";
import type { FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

const DUPLICATE_KEY = "23505";

function refresh(fragranceId?: string) {
    revalidatePath("/collections", "layout");
    if (fragranceId) revalidatePath(`/fragrance/${fragranceId}`);
}

// Adds or removes one fragrance from one collection. Returns whether it ended up saved.
export async function setFragranceSaved(collectionId: string, fragranceId: string, saved: boolean) {
    const user = await getCurrentUser();
    if (!getFragranceById(fragranceId)) return { ok: false };

    // Without an account, saves go to this device's guest collections.
    if (!user) {
        const ok = isGuestCollectionId(collectionId) && (await setGuestSaved(collectionId, fragranceId, saved));
        if (ok) refresh(fragranceId);
        return { ok };
    }

    const supabase = await createClient();
    const { error } = saved
        ? await supabase.from("collection_items").upsert(
            { collection_id: collectionId, fragrance_id: fragranceId },
            { onConflict: "collection_id,fragrance_id", ignoreDuplicates: true },
        )
        : await supabase.from("collection_items").delete().match({ collection_id: collectionId, fragrance_id: fragranceId });

    if (error) return { ok: false };

    refresh(fragranceId);
    return { ok: true };
}

// Creates a custom collection; if a fragranceId is sent along, saves it there too.
export async function createCollection(_: FormState, formData: FormData): Promise<FormState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Sign in to create collections." };

    const name = cleanCollectionName(formData.get("name"));
    if (!name) return { error: "Give your collection a name." };

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("collections")
        .insert({ user_id: user.id, name, kind: "custom" })
        .select("id")
        .single();

    if (error?.code === DUPLICATE_KEY) return { error: `You already have a collection called “${name}”.` };
    if (error || !data) return { error: "We couldn't create that collection. Try again." };

    const fragranceId = String(formData.get("fragranceId") ?? "");
    if (fragranceId && getFragranceById(fragranceId)) {
        await supabase.from("collection_items").insert({ collection_id: data.id, fragrance_id: fragranceId });
    }

    refresh(fragranceId || undefined);
    return { message: `Created “${name}”.` };
}

export async function renameCollection(_: FormState, formData: FormData): Promise<FormState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Sign in to rename collections." };

    const id = String(formData.get("collectionId") ?? "");
    const name = cleanCollectionName(formData.get("name"));
    if (!name) return { error: "Give your collection a name." };

    const supabase = await createClient();
    // Presets can't be renamed (a database trigger rejects it), so this only succeeds for custom ones.
    const { data, error } = await supabase.from("collections").update({ name }).eq("id", id).eq("user_id", user.id).select("id");

    if (error?.code === DUPLICATE_KEY) return { error: `You already have a collection called “${name}”.` };
    if (error || !data?.length) return { error: "We couldn't rename that collection." };

    refresh();
    return { message: "Renamed." };
}

export async function deleteCollection(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) redirect("/sign-in?next=/collections");

    const supabase = await createClient();
    await supabase.from("collections").delete().eq("id", String(formData.get("collectionId") ?? ""));

    refresh();
    redirect("/collections");
}

export async function removeFromCollection(formData: FormData) {
    const collectionId = String(formData.get("collectionId") ?? "");
    const fragranceId = String(formData.get("fragranceId") ?? "");
    await setFragranceSaved(collectionId, fragranceId, false);
}

export async function setCollectionShared(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return;

    const supabase = await createClient();
    await supabase
        .from("collections")
        .update({ shared_with_friends: formData.get("shared") === "true" })
        .match({ id: String(formData.get("collectionId") ?? ""), user_id: user.id });

    refresh();
    revalidatePath("/people", "layout");
}
