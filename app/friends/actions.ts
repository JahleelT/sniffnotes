"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getRelationship } from "@/lib/friends";
import { createClient } from "@/lib/supabase/server";

function refresh() {
    revalidatePath("/friends");
    revalidatePath("/people", "layout");
}

// Sends a request, or accepts theirs if they already asked.
export async function addFriend(formData: FormData) {
    const user = await getCurrentUser();
    const otherId = String(formData.get("userId") ?? "");
    if (!user || !otherId || otherId === user.id) return;

    const supabase = await createClient();
    const relationship = await getRelationship(otherId);

    if (relationship === "incoming") {
        await supabase
            .from("friendships")
            .update({ status: "accepted", responded_at: new Date().toISOString() })
            .match({ requester_id: otherId, addressee_id: user.id });
    } else if (relationship === "none") {
        await supabase.from("friendships").insert({ requester_id: user.id, addressee_id: otherId });
    }

    refresh();
}

// Declining, cancelling, and unfriending all remove the row, whichever direction it goes.
export async function removeFriend(formData: FormData) {
    const user = await getCurrentUser();
    const otherId = String(formData.get("userId") ?? "");
    if (!user || !otherId) return;

    const supabase = await createClient();
    await supabase
        .from("friendships")
        .delete()
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${user.id})`);

    refresh();
}
