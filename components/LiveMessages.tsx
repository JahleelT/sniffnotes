"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// Re-renders the page when a message arrives for this user. Supabase Realtime applies the
// messages table's row-level security, so only messages you're allowed to read are delivered.
export default function LiveMessages({ userId }: { userId: string }) {
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        let channel: RealtimeChannel | undefined;
        let cancelled = false;

        (async () => {
            // Realtime needs the signed-in user's token before subscribing; without it the
            // connection is anonymous and row-level security (rightly) hides every message.
            const { data } = await supabase.auth.getSession();
            if (cancelled || !data.session) return;
            await supabase.realtime.setAuth(data.session.access_token);

            channel = supabase
                .channel(`messages-for-${userId}`)
                .on(
                    "postgres_changes",
                    { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` },
                    () => router.refresh(),
                )
                .subscribe();
        })();

        return () => {
            cancelled = true;
            if (channel) supabase.removeChannel(channel);
        };
    }, [userId, router]);

    return null;
}
