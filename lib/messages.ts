import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getFriendIds, getPublicProfiles, type PublicProfile } from "@/lib/friends";
import { createClient } from "@/lib/supabase/server";

export const PENDING_MESSAGE_LIMIT = 3;

export type Message = {
    id: string;
    senderId: string;
    body: string;
    createdAt: string;
    readAt: string | null;
};

// Where a conversation stands, from the signed-in user's side.
export type ConversationStatus =
    | "open"              // friends, or a request was accepted
    | "request-received"  // they messaged you first; accept, decline, or reply
    | "request-sent"      // you messaged them first; waiting for them
    | "declined-by-you"
    | "declined-by-them";

export type Conversation = {
    other: PublicProfile;
    status: ConversationStatus;
    lastMessage: Message;
    unread: number;
};

type RequestRow = { sender_id: string; recipient_id: string; status: string };

const getRequestRows = cache(async (): Promise<RequestRow[]> => {
    const supabase = await createClient();
    const { data } = await supabase.from("message_requests").select("sender_id, recipient_id, status");
    return data ?? [];
});

function statusWith(otherId: string, me: string, friends: Set<string>, requests: RequestRow[]): ConversationStatus {
    if (friends.has(otherId)) return "open";
    const request = requests.find((r) => r.sender_id === otherId || r.recipient_id === otherId);
    if (!request || request.status === "accepted") return "open";
    const sentByMe = request.sender_id === me;
    if (request.status === "declined") return sentByMe ? "declined-by-them" : "declined-by-you";
    return sentByMe ? "request-sent" : "request-received";
}

// All of the signed-in user's conversations, newest first, split into the inbox and incoming requests.
export async function getConversations() {
    const user = await getCurrentUser();
    if (!user) return { inbox: [], requests: [] };

    const supabase = await createClient();
    const [{ data }, friends, requests] = await Promise.all([
        supabase
            .from("messages")
            .select("id, sender_id, recipient_id, body, created_at, read_at")
            .order("created_at", { ascending: false })
            .limit(1000),
        getFriendIds(),
        getRequestRows(),
    ]);

    const byOther = new Map<string, { last: Message; unread: number }>();
    for (const row of data ?? []) {
        const otherId = row.sender_id === user.id ? row.recipient_id : row.sender_id;
        const entry = byOther.get(otherId) ?? {
            last: { id: row.id, senderId: row.sender_id, body: row.body, createdAt: row.created_at, readAt: row.read_at },
            unread: 0,
        };
        if (row.recipient_id === user.id && !row.read_at) entry.unread++;
        byOther.set(otherId, entry);
    }

    const profiles = await getPublicProfiles([...byOther.keys()]);
    const conversations: Conversation[] = [...byOther].flatMap(([otherId, { last, unread }]) => {
        const other = profiles.get(otherId);
        return other ? [{ other, status: statusWith(otherId, user.id, friends, requests), lastMessage: last, unread }] : [];
    });

    return {
        inbox: conversations.filter((c) => c.status !== "request-received" && c.status !== "declined-by-you"),
        requests: conversations.filter((c) => c.status === "request-received"),
    };
}

export async function getThread(otherId: string) {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createClient();
    const [{ data }, friends, requests] = await Promise.all([
        supabase
            .from("messages")
            .select("id, sender_id, recipient_id, body, created_at, read_at")
            .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`)
            .order("created_at", { ascending: true })
            .limit(500),
        getFriendIds(),
        getRequestRows(),
    ]);

    const messages: Message[] = (data ?? []).map((row) => ({
        id: row.id, senderId: row.sender_id, body: row.body, createdAt: row.created_at, readAt: row.read_at,
    }));
    const sentWhilePending = messages.filter((m) => m.senderId === user.id).length;

    return {
        messages,
        status: messages.length || friends.has(otherId) ? statusWith(otherId, user.id, friends, requests) : "open" as ConversationStatus,
        isFriend: friends.has(otherId),
        sentWhilePending,
    };
}

// Marks everything the other person sent you as read.
export async function markThreadRead(otherId: string) {
    const user = await getCurrentUser();
    if (!user) return;
    const supabase = await createClient();
    await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .match({ sender_id: otherId, recipient_id: user.id })
        .is("read_at", null);
}

// For the header badge: unread messages, not counting people you declined.
export const getUnreadMessageCount = cache(async (): Promise<number> => {
    const user = await getCurrentUser();
    if (!user) return 0;

    const supabase = await createClient();
    const [{ data }, requests] = await Promise.all([
        supabase.from("messages").select("sender_id").eq("recipient_id", user.id).is("read_at", null),
        getRequestRows(),
    ]);
    const declined = new Set(requests.filter((r) => r.recipient_id === user.id && r.status === "declined").map((r) => r.sender_id));
    return (data ?? []).filter((row) => !declined.has(row.sender_id)).length;
});
