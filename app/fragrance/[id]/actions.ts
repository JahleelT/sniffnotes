"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getFragranceById } from "@/lib/fragrances";
import type { FormState } from "@/lib/forms";
import { SEASONS, type Season } from "@/lib/review-scales";
import { createClient } from "@/lib/supabase/server";

const MAX_REVIEW_LENGTH = 2000;

// A whole number in [min, max], or null when the field was left blank.
function scale(value: FormDataEntryValue | null, min: number, max: number) {
    const number = Number(value);
    return value && Number.isInteger(number) && number >= min && number <= max ? number : null;
}

export async function saveReview(_: FormState, formData: FormData): Promise<FormState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Sign in to review fragrances." };

    const fragranceId = String(formData.get("fragranceId") ?? "");
    if (!getFragranceById(fragranceId)) return { error: "That fragrance doesn't exist." };

    const rating = scale(formData.get("rating"), 1, 5);
    if (!rating) return { error: "Pick a star rating." };

    const body = String(formData.get("body") ?? "").trim();
    if (body.length > MAX_REVIEW_LENGTH) return { error: `Keep your review under ${MAX_REVIEW_LENGTH} characters.` };

    const seasons = formData.getAll("seasons").map(String).filter((s): s is Season => SEASONS.some((option) => option.value === s));

    const supabase = await createClient();
    const { error } = await supabase.from("reviews").upsert(
        {
            user_id: user.id,
            fragrance_id: fragranceId,
            rating,
            longevity: scale(formData.get("longevity"), 1, 5),
            sillage: scale(formData.get("sillage"), 1, 4),
            seasons,
            body,
        },
        { onConflict: "user_id,fragrance_id" },
    );

    if (error) return { error: "We couldn't save your review. Try again." };

    revalidatePath(`/fragrance/${fragranceId}`);
    return { message: "Review saved. Thanks for sharing your nose!" };
}

export async function deleteReview(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return;

    const fragranceId = String(formData.get("fragranceId") ?? "");
    const supabase = await createClient();
    await supabase.from("reviews").delete().match({ user_id: user.id, fragrance_id: fragranceId });

    revalidatePath(`/fragrance/${fragranceId}`);
}
