"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/forms";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateDisplayName(_: FormState, formData: FormData): Promise<FormState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Your session ended. Sign in again." };

    const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 50);
    if (!displayName) return { error: "Display name can't be empty." };

    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);

    if (error) return { error: "We couldn't save your display name. Try again." };

    revalidatePath("/", "layout");
    return { message: "Display name saved." };
}
