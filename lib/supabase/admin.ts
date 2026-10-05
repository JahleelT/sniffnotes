import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Uses the secret key, which bypasses row-level security. Only for trusted server code
// that has already checked who the user is (e.g. account deletion).
export function createAdminClient() {
    return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

// A cookie-less client for checking a password without touching the current session.
export function createStatelessClient() {
    return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
