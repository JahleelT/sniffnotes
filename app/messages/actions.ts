"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import type { FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

const MAX_MESSAGE_LENGTH = 2000;

function refresh() {
    revalidatePath("/messages", "layout");
}

export async function sendMessage(_: FormState, formData: FormData): Promise<FormState> {
    const user = await getCurrentUser();
    if (!user) return { error: "Sign in to send messages." };

    const recipientId = String(formData.get("recipientId") ?? "");
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return { error: "Write a message first." };
    if (body.length > MAX_MESSAGE_LENGTH) return { error: `Keep messages under ${MAX_MESSAGE_LENGTH} characters.` };

    const supabase = await createClient();
    // The database decides who can be messaged (friends, accepted requests, or up to 3 first messages).
    const { error } = await supabase.from("messages").insert({ sender_id: user.id, recipient_id: recipientId, body });

    if (error?.code === "42501") return { error: "You can't send more messages until they accept your request." };
    if (error) return { error: "We couldn't send that. Try again." };

    refresh();
    return { message: "Sent." };
}

export async function respondToRequest(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return;

    const senderId = String(formData.get("senderId") ?? "");
    const status = formData.get("accept") === "true" ? "accepted" : "declined";

    const supabase = await createClient();
    await supabase
        .from("message_requests")
        .update({ status, responded_at: new Date().toISOString() })
        .match({ sender_id: senderId, recipient_id: user.id });

    refresh();
}
