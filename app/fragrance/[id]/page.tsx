import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Backdrop from "@/components/Backdrop";
import FragranceHeader from "@/components/FragranceHeader";
import FragrancePhoto from "@/components/FragrancePhoto";
import BreakdownNTags from "@/components/BreakdownNTags";
import Description from "@/components/Description";
import NewsList from "@/components/NewsList";
import RecommendationGrid from "@/components/RecommendationGrid";
import ReviewSection from "@/components/ReviewSection";
import SaveMenu from "@/components/SaveMenu";
import { getCurrentUser } from "@/lib/auth";
import { getCollections } from "@/lib/collections";
import { getAllFragrances, getFragranceById } from "@/lib/fragrances";
import { getSimilarFragrances } from "@/lib/recommendations";
import { communityDescription, getSuggestions } from "@/lib/descriptions";
import { getFriendIds } from "@/lib/friends";
import { getNews } from "@/lib/news";
import { getReviews, getReviewStats } from "@/lib/reviews";
import { pickTheme } from "@/utils/themeMap";

export function generateStaticParams() {
    return getAllFragrances().map((fragrance) => ({ id: fragrance.id }));
}

export async function generateMetadata(props: PageProps<"/fragrance/[id]">): Promise<Metadata> {
    const { id } = await props.params;
    const fragrance = getFragranceById(id);

    return {
        title: fragrance ? `${fragrance.name} by ${fragrance.brand} | SniffNotes` : "SniffNotes",
    };
}

export default async function FragrancePage(props: PageProps<"/fragrance/[id]">) {
    const { id } = await props.params;
    const fragrance = getFragranceById(id);

    if (!fragrance) notFound();

    // A random photo from the first mood, so repeat visits vary.
    const theme = pickTheme(fragrance.tags[0]);
    const user = await getCurrentUser();
    const similar = getSimilarFragrances(fragrance.id);
    const [reviews, stats, friendIds, suggestions] = await Promise.all([
        getReviews(fragrance.id),
        getReviewStats(),
        getFriendIds(),
        getSuggestions(fragrance.id, user?.id),
    ]);
    const news = await getNews({ fragranceId: fragrance.id, limit: 3 });

    const saveAction = user ? (
        <SaveMenu
            fragranceId={fragrance.id}
            fragranceName={fragrance.name}
            collections={(await getCollections()).map((c) => ({ id: c.id, name: c.name, saved: c.fragranceIds.includes(fragrance.id) }))}
            theme={theme}
        />
    ) : (
        <Link
            href={`/sign-in?next=/fragrance/${fragrance.id}`}
            className="px-6 py-3 rounded-full border border-foreground/60 backdrop-blur-sm hover:bg-foreground/15 transition-all duration-200"
        >
            Sign in to save
        </Link>
    );

    return (
        <Backdrop theme={theme}>
            <FragranceHeader fragrance={fragrance} theme={theme} actions={saveAction}/>

            <main id="main" className="p-4 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr_1fr] gap-6 lg:gap-8">
                    <BreakdownNTags fragrance={fragrance} theme={theme}/>
                    <FragrancePhoto fragrance={fragrance} theme={theme}/>
                    <Description
                        fragrance={fragrance}
                        theme={theme}
                        community={communityDescription(suggestions)}
                        suggestionCount={suggestions.length}
                    />
                </div>

                {similar.length > 0 && (
                    <section aria-labelledby="similar-heading" className="mt-10">
                        <h2 id="similar-heading" className={`text-2xl font-semibold ${theme.accent}`}>Similar fragrances</h2>
                        <p className="mb-4 text-foreground/80">Matched by mood. Moods in <strong>bold</strong> are shared with {fragrance.name}.</p>
                        <RecommendationGrid recommendations={similar} compact/>
                    </section>
                )}

                <ReviewSection
                    fragranceId={fragrance.id}
                    fragranceName={fragrance.name}
                    theme={theme}
                    user={user}
                    reviews={reviews}
                    stats={stats.get(fragrance.id)}
                    friendIds={friendIds}
                />

                {news.length > 0 && (
                    <section aria-labelledby="fragrance-news-heading" className="mt-10">
                        <h2 id="fragrance-news-heading" className={`text-2xl font-semibold mb-4 ${theme.accent}`}>In the news</h2>
                        <NewsList items={news} cardClass={`${theme.card} ${theme.border}`} compact/>
                    </section>
                )}
            </main>
        </Backdrop>
    )
}
