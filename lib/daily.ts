import { cookies } from "next/headers";
import type { Fragrance } from "@/data/fragrances";
import { chooseNextPick, dayNumber, localDate, sharedPickForDay } from "@/lib/daily-picker";
import { getAllFragrances, getFragranceById } from "@/lib/fragrances";
import { createClient } from "@/lib/supabase/server";

export const TIMEZONE_COOKIE = "sniffnotes-tz";

export type DailyPick = {
    date: string;
    fragrance: Fragrance;
};

export type PersonalDaily = DailyPick & {
    seenThisCycle: number;
    total: number;
    recent: DailyPick[];
};

// The visitor's local date, from the time zone cookie set by TimezoneSync (UTC until it's set).
export async function today() {
    const timeZone = (await cookies()).get(TIMEZONE_COOKIE)?.value ?? "UTC";
    return localDate(timeZone);
}

export async function getSharedDailyPick(): Promise<DailyPick | null> {
    const date = await today();
    const id = sharedPickForDay(getAllFragrances().map((f) => f.id), dayNumber(date));
    const fragrance = id ? getFragranceById(id) : undefined;
    return fragrance ? { date, fragrance } : null;
}

// Returns today's pick for the signed-in user, choosing and storing one if needed.
export async function getPersonalDailyPick(userId: string): Promise<PersonalDaily | null> {
    const supabase = await createClient();
    const date = await today();
    const allIds = getAllFragrances().map((f) => f.id);

    const { data } = await supabase
        .from("daily_picks")
        .select("pick_date, fragrance_id, cycle")
        .order("pick_date", { ascending: false });
    let history = data ?? [];

    if (!history.some((pick) => pick.pick_date === date)) {
        const next = chooseNextPick(
            allIds,
            history.map((pick) => ({ fragranceId: pick.fragrance_id, cycle: pick.cycle })),
        );
        if (!next) return null;

        // If another request stored today's pick first, keep that one.
        await supabase
            .from("daily_picks")
            .upsert(
                { user_id: userId, pick_date: date, fragrance_id: next.fragranceId, cycle: next.cycle },
                { onConflict: "user_id,pick_date", ignoreDuplicates: true },
            );

        // Read back with a different query: Next.js memoizes identical GET requests within a render,
        // so repeating the history query above would return the stale result.
        const { data: stored } = await supabase
            .from("daily_picks")
            .select("pick_date, fragrance_id, cycle")
            .eq("pick_date", date)
            .maybeSingle();
        if (stored) history = [stored, ...history];
    }

    const todays = history.find((pick) => pick.pick_date === date);
    const fragrance = todays ? getFragranceById(todays.fragrance_id) : undefined;
    if (!todays || !fragrance) return null;

    const seenThisCycle = new Set(
        history.filter((pick) => pick.cycle === todays.cycle && allIds.includes(pick.fragrance_id)).map((pick) => pick.fragrance_id),
    ).size;

    const recent = history
        .filter((pick) => pick.pick_date < date)
        .slice(0, 6)
        .flatMap((pick) => {
            const past = getFragranceById(pick.fragrance_id);
            return past ? [{ date: pick.pick_date, fragrance: past }] : [];
        });

    return { date, fragrance, seenThisCycle, total: allIds.length, recent };
}
