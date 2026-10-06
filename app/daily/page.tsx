import type { Metadata } from "next";
import Link from "next/link";
import BottleImage from "@/components/BottleImage";
import MoodTags from "@/components/MoodTags";
import PageShell from "@/components/PageShell";
import SaveMenu from "@/components/SaveMenu";
import { getCurrentUser } from "@/lib/auth";
import { getCollections } from "@/lib/collections";
import { getPersonalDailyPick, getSharedDailyPick } from "@/lib/daily";
import { pickTheme } from "@/utils/themeMap";

export const metadata: Metadata = {
    title: "Fragrance of the Day | SniffNotes",
};

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
    // Dates are local calendar days, so format them as UTC to avoid shifting.
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", ...options });
}

export default async function DailyPage() {
    const user = await getCurrentUser();
    const personal = user ? await getPersonalDailyPick(user.id) : null;
    const daily = user ? personal : await getSharedDailyPick();

    if (!daily) {
        return (
            <PageShell>
                <h1 className="text-4xl font-semibold">Fragrance of the day</h1>
                <p className="mt-4">There are no fragrances to choose from yet.</p>
            </PageShell>
        );
    }

    const { fragrance } = daily;
    const theme = pickTheme(fragrance.tags[0]);
    const card = `border rounded-xl backdrop-blur-sm ${theme.card} ${theme.border}`;

    const collections = user
        ? (await getCollections()).map((c) => ({ id: c.id, name: c.name, saved: c.fragranceIds.includes(fragrance.id) }))
        : [];

    return (
        <PageShell theme={theme}>
            <p className={`text-center text-lg font-semibold uppercase tracking-widest ${theme.accent}`}>
                Fragrance of the day
            </p>
            <p className="text-center text-foreground/80 mb-8">
                {formatDate(daily.date, { weekday: "long", month: "long", day: "numeric" })}
            </p>

            <article className={`max-w-4xl mx-auto grid md:grid-cols-[1fr_1.4fr] gap-6 sm:gap-8 p-5 sm:p-8 ${card}`} aria-labelledby="daily-name">
                <div className="flex justify-center items-center">
                    <BottleImage fragrance={fragrance} width={320} height={480} className="max-h-[50vh] md:max-h-none w-auto"/>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <h1 id="daily-name" className="text-4xl sm:text-5xl font-semibold">{fragrance.name}</h1>
                        <p className="text-xl mt-1">
                            {fragrance.collection ? `${fragrance.brand} • ${fragrance.collection}` : fragrance.brand}
                        </p>
                    </div>

                    <MoodTags moods={fragrance.tags} className="justify-start! mt-0"/>

                    <p className="leading-relaxed text-lg line-clamp-6">{fragrance.description.split(/\n\s*\n/)[0]}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-auto">
                        <Link
                            href={`/fragrance/${fragrance.id}`}
                            className="px-6 py-3 rounded-full border border-foreground/60 font-semibold hover:bg-foreground/15 transition-all duration-200"
                        >
                            See notes &amp; full profile
                        </Link>
                        {user && (
                            <SaveMenu fragranceId={fragrance.id} fragranceName={fragrance.name} collections={collections} theme={theme}/>
                        )}
                    </div>
                </div>
            </article>

            <div className="max-w-4xl mx-auto mt-8 text-center">
                {personal ? (
                    <p className="text-lg">
                        You&apos;ve discovered {personal.seenThisCycle} of {personal.total} fragrances this round.
                        No repeats until you&apos;ve seen them all.
                    </p>
                ) : (
                    <p className="text-lg">
                        This is everyone&apos;s pick today. <Link href="/sign-in?next=/daily" className="underline">Sign in</Link> for your own daily
                        picks that never repeat until you&apos;ve seen every fragrance.
                    </p>
                )}
            </div>

            {personal && personal.recent.length > 0 && (
                <section aria-labelledby="recent-heading" className="max-w-4xl mx-auto mt-10">
                    <h2 id="recent-heading" className="text-2xl font-semibold mb-4">Recent picks</h2>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {personal.recent.map((pick) => (
                            <li key={pick.date}>
                                <Link
                                    href={`/fragrance/${pick.fragrance.id}`}
                                    className={`card-link flex flex-col items-center gap-2 p-3 h-full hover:scale-[1.02] transition-all duration-200 ${card}`}
                                >
                                    <BottleImage fragrance={pick.fragrance} width={80} height={120} className="h-24 w-auto"/>
                                    <span className="font-semibold text-center">{pick.fragrance.name}</span>
                                    <span className="text-sm text-foreground/70">{formatDate(pick.date, { month: "short", day: "numeric" })}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </PageShell>
    );
}
