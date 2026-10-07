import type { Metadata } from "next";
import Link from "next/link";
import NewsList from "@/components/NewsList";
import PageShell from "@/components/PageShell";
import { getCurrentUser } from "@/lib/auth";
import { getBrandBySlug, getFollowedBrandSlugs } from "@/lib/brands";
import { getLastNewsRun, getNews, refreshNewsIfStale } from "@/lib/news";
import { NEWS_SOURCES } from "@/lib/news-core";
import { defaultTheme } from "@/utils/themeMap";

export const metadata: Metadata = {
    title: "News | SniffNotes",
};

const tab = "px-5 py-2 rounded-full border transition-all duration-200";

export default async function NewsPage(props: PageProps<"/news">) {
    const { tab: tabParam } = await props.searchParams;
    const [user, followed, lastRun] = await Promise.all([getCurrentUser(), getFollowedBrandSlugs(), getLastNewsRun()]);
    await refreshNewsIfStale();

    const following = tabParam === "following";
    const items = await getNews(following ? { brandSlugs: [...followed] } : {});
    const card = `${defaultTheme.card} ${defaultTheme.border}`;

    return (
        <PageShell>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-semibold">News</h1>
                <p className="mt-2 text-foreground/80">
                    Headlines from {NEWS_SOURCES.map((s) => s.name).join(", ")}.
                    {lastRun && lastRun.getTime() > 0 && ` Updated ${lastRun.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}.`}
                </p>

                <nav aria-label="News views" className="flex gap-2 my-6">
                    <Link href="/news" aria-current={!following ? "page" : undefined} className={`${tab} ${!following ? "border-foreground bg-foreground/20" : "border-foreground/40 hover:bg-foreground/15"}`}>
                        All
                    </Link>
                    <Link href="/news?tab=following" aria-current={following ? "page" : undefined} className={`${tab} ${following ? "border-foreground bg-foreground/20" : "border-foreground/40 hover:bg-foreground/15"}`}>
                        Following
                    </Link>
                </nav>

                {following && !user && (
                    <p className="text-foreground/80"><Link href="/sign-in?next=/news?tab=following" className="underline">Sign in</Link> and follow brands to see their news here.</p>
                )}
                {following && user && followed.size === 0 && (
                    <p className="text-foreground/80">You aren&apos;t following any brands yet. <Link href="/brands" className="underline">Find brands to follow</Link>.</p>
                )}
                {following && user && followed.size > 0 && (
                    <p className="mb-4 text-sm text-foreground/70">
                        News mentioning {[...followed].map((slug) => getBrandBySlug(slug)?.name).filter(Boolean).join(", ")}.
                    </p>
                )}

                {items.length > 0 ? (
                    <NewsList items={items} cardClass={card}/>
                ) : (
                    (!following || (user && followed.size > 0)) && (
                        <p className="text-foreground/80">
                            {following ? "No recent news about the brands you follow." : "No news yet. Check back soon."}
                        </p>
                    )
                )}
            </div>
        </PageShell>
    );
}
