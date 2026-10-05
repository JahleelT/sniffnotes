import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth";
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

    if (userId) await syncPreferencesOnSignIn(supabase, userId);
    const verified = Boolean(userId);

    return NextResponse.redirect(new URL(verified ? next : "/sign-in?error=link", origin));
}
