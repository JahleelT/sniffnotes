"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getBrandBySlug } from "@/lib/brands";
import { createClient } from "@/lib/supabase/server";

// Follows or unfollows a brand, depending on the `follow` field.
export async function setBrandFollowed(formData: FormData) {
    const user = await getCurrentUser();
    const slug = String(formData.get("brand") ?? "");
    if (!user || !getBrandBySlug(slug)) return;

    const supabase = await createClient();
    if (formData.get("follow") === "true") {
        await supabase.from("brand_follows").upsert({ user_id: user.id, brand_slug: slug }, { ignoreDuplicates: true });
    } else {
        await supabase.from("brand_follows").delete().match({ user_id: user.id, brand_slug: slug });
    }

    revalidatePath("/brands", "layout");
    revalidatePath("/news");
}
