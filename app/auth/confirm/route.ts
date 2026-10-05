import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth";
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
    let verified = false;

    if (code) {
        verified = !(await supabase.auth.exchangeCodeForSession(code)).error;
    } else if (tokenHash && type) {
        verified = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
    }

    return NextResponse.redirect(new URL(verified ? next : "/sign-in?error=link", origin));
}
