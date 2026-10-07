import type { Metadata } from "next";
import Link from "next/link";
import BottleImage from "@/components/BottleImage";
import FollowBrandButton from "@/components/FollowBrandButton";
import PageShell from "@/components/PageShell";
import { getCurrentUser } from "@/lib/auth";
import { getBrands, getFollowedBrandSlugs, getFollowerCounts } from "@/lib/brands";
import { defaultTheme } from "@/utils/themeMap";

export const metadata: Metadata = {
    title: "Brands | SniffNotes",
};

const card = `flex flex-col gap-3 p-5 border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`;

export default async function BrandsPage() {
    const [user, followed, followers] = await Promise.all([getCurrentUser(), getFollowedBrandSlugs(), getFollowerCounts()]);
    // Brands you follow come first.
    const brands = [...getBrands()].sort((a, b) => Number(followed.has(b.slug)) - Number(followed.has(a.slug)));

    return (
        <PageShell>
            <h1 className="text-3xl sm:text-4xl font-semibold">Brands</h1>
            <p className="mt-2 mb-8 text-foreground/80">Follow brands to see their news first and keep up with what they release.</p>

            <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-5">
                {brands.map((brand) => (
                    <li key={brand.slug} className={card}>
                        <Link href={`/brands/${brand.slug}`} className="card-link flex items-end gap-2 h-24 overflow-hidden">
                            {brand.fragrances.slice(0, 3).map((fragrance) => (
                                <BottleImage key={fragrance.id} fragrance={fragrance} width={60} height={90} className="h-20 w-auto"/>
                            ))}
                        </Link>
                        <div>
                            <Link href={`/brands/${brand.slug}`} className="text-xl font-semibold hover:underline underline-offset-4">{brand.name}</Link>
                            <p className="text-sm text-foreground/70">
                                {brand.fragrances.length} {brand.fragrances.length === 1 ? "fragrance" : "fragrances"}
                                {" · "}
                                {followers.get(brand.slug) ?? 0} {(followers.get(brand.slug) ?? 0) === 1 ? "follower" : "followers"}
                            </p>
                        </div>
                        <FollowBrandButton slug={brand.slug} name={brand.name} following={followed.has(brand.slug)} signedIn={Boolean(user)}/>
                    </li>
                ))}
            </ul>
        </PageShell>
    );
}
