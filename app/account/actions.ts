"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/forms";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient, createStatelessClient } from "@/lib/supabase/admin";
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

// Permanently deletes the signed-in user. Profile, collections, and daily picks are removed
// by `on delete cascade` foreign keys to auth.users.
export async function deleteAccount(_: FormState, formData: FormData): Promise<FormState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Your session ended. Sign in again." };

    if (formData.get("confirm") !== "on") {
        return { error: "Check the box to confirm you understand this can't be undone." };
    }

    // Re-check the password so an unattended signed-in browser can't delete the account.
    const { error: passwordError } = await createStatelessClient().auth.signInWithPassword({
        email: user.email,
        password: String(formData.get("password") ?? ""),
    });
    if (passwordError) return { error: "That password isn't right." };

    const { error } = await createAdminClient().auth.admin.deleteUser(user.id);
    if (error) return { error: "We couldn't delete your account. Try again in a moment." };

    // The session is already invalid; this clears its cookies from the browser.
    await (await createClient()).auth.signOut({ scope: "local" });

    redirect("/account-deleted");
}
