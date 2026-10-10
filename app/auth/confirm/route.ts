import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth";
import { mergeGuestSaves } from "@/lib/guest-collections";
import { syncPreferencesOnSignIn } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

// Landing point for email links (sign-up confirmation and password reset).
// Handles both Supabase's default `code` links and `token_hash` links from custom email templates.
export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl;
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = safeNext(searchParams.get("next"));

    const supabase = await createClient();
    let userId: string | undefined;

    if (code) {
        userId = (await supabase.auth.exchangeCodeForSession(code)).data.user?.id;
    } else if (tokenHash && type) {
        userId = (await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).data.user?.id;
    }

    if (userId) {
        await syncPreferencesOnSignIn(supabase, userId);
        await mergeGuestSaves(supabase, userId);
        return NextResponse.redirect(new URL(next, origin));
    }

    // A `code` means Supabase already accepted the link (and confirmed the email) but the session
    // couldn't be finished here, usually because the link was opened in a different browser or
    // app than the one used to sign up (e.g. tapping it inside the Gmail app on a phone).
    if (code) {
        const isReset = next.startsWith("/account/update-password");
        return NextResponse.redirect(new URL(isReset ? "/forgot-password?error=browser" : "/sign-in?confirmed=1", origin));
    }

    return NextResponse.redirect(new URL("/sign-in?error=link", origin));
}
