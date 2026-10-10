"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/auth";
import type { FormState } from "@/lib/forms";
import { mergeGuestSaves } from "@/lib/guest-collections";
import { syncPreferencesOnSignIn } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

const MIN_PASSWORD_LENGTH = 8;

function field(formData: FormData, name: string) {
    return String(formData.get(name) ?? "").trim();
}

async function siteOrigin() {
    const headerList = await headers();
    return headerList.get("origin") ?? `https://${headerList.get("host")}`;
}

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: field(formData, "email"),
        password: String(formData.get("password") ?? ""),
    });

    if (error?.code === "email_not_confirmed") {
        return { error: "Confirm your email first. Check your inbox for the link." };
    }
    if (error) return { error: "That email and password don't match." };

    await syncPreferencesOnSignIn(supabase, data.user.id);
    await mergeGuestSaves(supabase, data.user.id);
    redirect(safeNext(formData.get("next")));
}

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
    const email = field(formData, "email");
    const password = String(formData.get("password") ?? "");
    const displayName = field(formData, "displayName").slice(0, 50);
    const next = safeNext(formData.get("next"));

    if (password.length < MIN_PASSWORD_LENGTH) {
        return { error: `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.` };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: displayName },
            emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=${encodeURIComponent(next)}`,
        },
    });

    if (error?.code === "weak_password") return { error: error.message };
    if (error?.code === "over_email_send_rate_limit" || error?.status === 429) {
        return { error: "Too many sign-ups right now. Please wait a few minutes and try again." };
    }
    if (error?.code === "email_address_invalid") return { error: "That email address doesn't look right. Check it and try again." };
    if (error) return { error: "We couldn't create that account. Check the email address and try again." };

    // With email confirmation off, Supabase signs the user in right away.
    if (data.session && data.user) {
        await syncPreferencesOnSignIn(supabase, data.user.id);
        await mergeGuestSaves(supabase, data.user.id);
        redirect(next);
    }

    return { message: `Almost there! We sent a confirmation link to ${email}.` };
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
    const email = field(formData, "email");
    const supabase = await createClient();

    await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${await siteOrigin()}/auth/confirm?next=/account/update-password`,
    });

    // Same message either way, so the form doesn't reveal which emails have accounts.
    return { message: `If ${email} has an account, a reset link is on its way.` };
}

export async function updatePassword(_: FormState, formData: FormData): Promise<FormState> {
    const password = String(formData.get("password") ?? "");

    if (password.length < MIN_PASSWORD_LENGTH) {
        return { error: `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.` };
    }
    if (password !== formData.get("confirmPassword")) {
        return { error: "The passwords don't match." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error?.code === "same_password") return { error: "Choose a password you haven't used here before." };
    if (error) return { error: "We couldn't update your password. Your reset link may have expired." };

    redirect("/account");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
}
