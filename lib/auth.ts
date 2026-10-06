import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
    id: string;
    email: string;
    displayName: string;
    username: string | null;
};

// Cached per request, so the header and the page can both call it for one auth check.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;

    if (!claims) return null;

    const email = claims.email ?? "";
    const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, username")
        .eq("id", claims.sub)
        .maybeSingle();

    return {
        id: claims.sub,
        email,
        displayName: profile?.display_name || email.split("@")[0],
        username: profile?.username ?? null,
    };
});

// Sends signed-out visitors to sign in, then back to `returnTo`.
export async function requireUser(returnTo: string) {
    const user = await getCurrentUser();
    if (!user) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
    return user;
}

// Only allow same-site relative paths, so `?next=` can't redirect off the site.
export function safeNext(value: unknown, fallback = "/") {
    return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
