// Pure picking rules for the fragrance of the day. No I/O, so they're easy to test.

export type PastPick = {
    fragranceId: string;
    cycle: number;
};

// Picks a fragrance not yet seen in the current cycle. When every fragrance has been seen,
// starts the next cycle, avoiding an immediate repeat of the most recent pick.
// `history` is newest first.
export function chooseNextPick(allIds: string[], history: PastPick[], random: () => number = Math.random) {
    if (allIds.length === 0) return null;

    const currentCycle = history.length ? Math.max(...history.map((pick) => pick.cycle)) : 1;
    const seen = new Set(history.filter((pick) => pick.cycle === currentCycle).map((pick) => pick.fragranceId));

    let cycle = currentCycle;
    let candidates = allIds.filter((id) => !seen.has(id));

    if (candidates.length === 0) {
        cycle = currentCycle + 1;
        const lastPick = history[0]?.fragranceId;
        candidates = allIds.length > 1 ? allIds.filter((id) => id !== lastPick) : allIds;
    }

    return {
        fragranceId: candidates[Math.floor(random() * candidates.length)],
        cycle,
    };
}

// Small seeded PRNG (mulberry32) so a shuffle is the same for everyone on the same seed.
function seededRandom(seed: number) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function seededShuffle<T>(items: T[], seed: number) {
    const random = seededRandom(seed);
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Site-wide pick for signed-out visitors: walks a shuffled order one fragrance per day,
// reshuffling each time the whole dataset has been shown. Needs no storage.
export function sharedPickForDay(allIds: string[], dayNumber: number) {
    if (allIds.length === 0) return null;

    const sorted = [...allIds].sort();
    const cycle = Math.floor(dayNumber / sorted.length);
    return seededShuffle(sorted, cycle + 1)[dayNumber % sorted.length];
}

// "YYYY-MM-DD" for `now` in the given IANA time zone (falls back to UTC if it's invalid).
export function localDate(timeZone: string, now = new Date()) {
    const format = (zone: string) =>
        new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);

    try {
        return format(timeZone);
    } catch {
        return format("UTC");
    }
}

// Days since 1970-01-01 for a "YYYY-MM-DD" date.
export function dayNumber(date: string) {
    return Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
}
