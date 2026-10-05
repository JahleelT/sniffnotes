"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import type { FormState } from "@/lib/forms";
import { MAX_FAVORITE_MOODS, parsePreferences, preferencesToJson, setPreferencesCookie } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export async function savePreferences(_: FormState, formData: FormData): Promise<FormState> {
    const favoriteMoods = formData.getAll("favoriteMoods");
    if (favoriteMoods.length > MAX_FAVORITE_MOODS) {
        return { error: `Pick up to ${MAX_FAVORITE_MOODS} favorite moods.` };
    }

    const preferences = parsePreferences({
        theme: formData.get("theme"),
        textSize: formData.get("textSize"),
        reduceMotion: formData.get("reduceMotion") === "on",
        highContrast: formData.get("highContrast") === "on",
        legibleFont: formData.get("legibleFont") === "on",
        underlineLinks: formData.get("underlineLinks") === "on",
        favoriteMoods,
    });

    await setPreferencesCookie(preferences);

    const user = await getCurrentUser();
    if (user) {
        const supabase = await createClient();
        const { error } = await supabase
            .from("profiles")
            .update({ preferences: preferencesToJson(preferences) })
            .eq("id", user.id);

        if (error) return { error: "Saved on this device, but we couldn't sync it to your account." };
    }

    revalidatePath("/", "layout");
    return { message: user ? "Preferences saved to your account." : "Preferences saved on this device." };
}
