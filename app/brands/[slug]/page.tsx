import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FollowBrandButton from "@/components/FollowBrandButton";
import FragranceCard from "@/components/FragranceCard";
import NewsList from "@/components/NewsList";
import PageShell from "@/components/PageShell";
import { getCurrentUser } from "@/lib/auth";
import { getBrandBySlug, getBrands, getFollowedBrandSlugs, getFollowerCounts } from "@/lib/brands";
import { getNews, refreshNewsIfStale } from "@/lib/news";
import { pickTheme } from "@/utils/themeMap";

export function generateStaticParams() {
    return getBrands().map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata(props: PageProps<"/brands/[slug]">): Promise<Metadata> {
    const { slug } = await props.params;
    const brand = getBrandBySlug(slug);
    return { title: brand ? `${brand.name} | SniffNotes` : "SniffNotes" };
}

export default async function BrandPage(props: PageProps<"/brands/[slug]">) {
    const { slug } = await props.params;
    const brand = getBrandBySlug(slug);
    if (!brand) notFound();

    const [user, followed, followers, news] = await Promise.all([
        getCurrentUser(),
        getFollowedBrandSlugs(),
        getFollowerCounts(),
        getNews({ brandSlugs: [slug], limit: 5 }),
    ]);
    await refreshNewsIfStale();
    const theme = pickTheme(brand.mood);
    const followerCount = followers.get(brand.slug) ?? 0;

    return (
        <PageShell theme={theme}>
            <Link href="/brands" className="underline text-foreground/80">← All brands</Link>

            <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-semibold">{brand.name}</h1>
                    <p className={`mt-1 ${theme.accent}`}>
                        {brand.fragrances.length} {brand.fragrances.length === 1 ? "fragrance" : "fragrances"}
                        {" · "}
                        {followerCount} {followerCount === 1 ? "follower" : "followers"}
                    </p>
                </div>
                <FollowBrandButton slug={brand.slug} name={brand.name} following={followed.has(brand.slug)} signedIn={Boolean(user)}/>
            </div>

            {news.length > 0 && (
                <section aria-labelledby="brand-news-heading" className="mb-10">
                    <h2 id="brand-news-heading" className={`text-2xl font-semibold mb-4 ${theme.accent}`}>In the news</h2>
                    <NewsList items={news} cardClass={`${theme.card} ${theme.border}`}/>
                </section>
            )}

            <section aria-labelledby="brand-fragrances-heading">
                <h2 id="brand-fragrances-heading" className="sr-only">Fragrances</h2>
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-6">
                    {brand.fragrances.map((fragrance) => (
                        <li key={fragrance.id}><FragranceCard fragrance={fragrance}/></li>
                    ))}
                </ul>
            </section>
        </PageShell>
    );
}
