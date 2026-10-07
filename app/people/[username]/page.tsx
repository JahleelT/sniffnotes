import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BottleImage from "@/components/BottleImage";
import FriendActions from "@/components/FriendActions";
import PageShell from "@/components/PageShell";
import Stars from "@/components/Stars";
import { getCurrentUser } from "@/lib/auth";
import { getCollections } from "@/lib/collections";
import { getFragranceById } from "@/lib/fragrances";
import { getProfileByUsername, getRelationship } from "@/lib/friends";
import { getReviewsByUser } from "@/lib/reviews";
import type { Fragrance } from "@/data/fragrances";
import { defaultTheme } from "@/utils/themeMap";

export async function generateMetadata(props: PageProps<"/people/[username]">): Promise<Metadata> {
    const { username } = await props.params;
    const profile = await getProfileByUsername(username);
    return { title: profile ? `${profile.displayName} (@${profile.username}) | SniffNotes` : "SniffNotes" };
}

const card = `p-5 sm:p-6 border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`;

export default async function PersonPage(props: PageProps<"/people/[username]">) {
    const { username } = await props.params;
    const profile = await getProfileByUsername(username);
    if (!profile) notFound();

    const [viewer, relationship, reviews] = await Promise.all([
        getCurrentUser(),
        getRelationship(profile.id),
        getReviewsByUser(profile.id),
    ]);

    // Row-level security returns only collections this viewer may see: all of your own,
    // or a friend's shared ones. Strangers get none.
    const canSeeCollections = relationship === "self" || relationship === "friends";
    const collections = canSeeCollections ? await getCollections(profile.id) : [];
    const visibleCollections = collections.filter((c) => relationship === "self" || c.sharedWithFriends);

    return (
        <PageShell>
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-semibold">{profile.displayName}</h1>
                        <p className="text-foreground/70">@{profile.username}{relationship === "friends" && " · Friend"}{relationship === "self" && " · You"}</p>
                    </div>
                    {viewer ? (
                        <div className="flex flex-wrap gap-2">
                            {relationship !== "self" && (
                                <Link href={`/messages/${profile.username}`} className="px-4 py-2 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200 text-sm font-semibold">
                                    Message
                                </Link>
                            )}
                            <FriendActions userId={profile.id} name={profile.displayName} relationship={relationship}/>
                        </div>
                    ) : (
                        <Link href={`/sign-in?next=/people/${profile.username}`} className="px-4 py-2 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200 text-sm">
                            Sign in to add friend
                        </Link>
                    )}
                </div>

                <section aria-labelledby="collections-heading">
                    <h2 id="collections-heading" className="text-2xl font-semibold mb-3">Collections</h2>
                    {canSeeCollections ? (
                        visibleCollections.length ? (
                            <ul className="grid gap-4 sm:grid-cols-2">
                                {visibleCollections.map((collection) => {
                                    const fragrances = collection.fragranceIds.map(getFragranceById).filter((f): f is Fragrance => Boolean(f));
                                    return (
                                        <li key={collection.id} className={card}>
                                            <Link href={`/collections/${collection.id}`} className="font-semibold text-lg hover:underline underline-offset-4">
                                                {collection.name}
                                            </Link>
                                            <p className="text-sm text-foreground/70 mb-3">{fragrances.length} {fragrances.length === 1 ? "fragrance" : "fragrances"}</p>
                                            <div className="flex gap-2 overflow-hidden">
                                                {fragrances.slice(0, 5).map((fragrance) => (
                                                    <Link key={fragrance.id} href={`/fragrance/${fragrance.id}`} title={fragrance.name} className="card-link shrink-0">
                                                        <BottleImage fragrance={fragrance} width={60} height={90} className="h-20 w-auto"/>
                                                    </Link>
                                                ))}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-foreground/70">Nothing shared yet.</p>
                        )
                    ) : (
                        <p className="text-foreground/70">Collections are visible to friends.</p>
                    )}
                </section>

                <section aria-labelledby="person-reviews-heading">
                    <h2 id="person-reviews-heading" className="text-2xl font-semibold mb-3">Reviews</h2>
                    {reviews.length ? (
                        <ul className="flex flex-col gap-3">
                            {reviews.map((review) => {
                                const fragrance = getFragranceById(review.fragranceId);
                                if (!fragrance) return null;
                                return (
                                    <li key={review.fragranceId} className={card}>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <Link href={`/fragrance/${fragrance.id}`} className="font-semibold hover:underline underline-offset-4">
                                                {fragrance.name} <span className="font-normal text-foreground/70">· {fragrance.brand}</span>
                                            </Link>
                                            <Stars rating={review.rating} className="size-4"/>
                                        </div>
                                        {review.body && <p className="mt-2 whitespace-pre-line leading-relaxed">{review.body}</p>}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-foreground/70">No reviews yet.</p>
                    )}
                </section>
            </div>
        </PageShell>
    );
}
