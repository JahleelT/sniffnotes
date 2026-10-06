import Link from "next/link";
import ActionForm from "@/components/ActionForm";
import Stars from "@/components/Stars";
import { deleteReview, saveReview } from "@/app/fragrance/[id]/actions";
import type { CurrentUser } from "@/lib/auth";
import {
    LONGEVITY_LABELS,
    SEASONS,
    SILLAGE_LABELS,
    scaleLabel,
    type Review,
    type ReviewStats,
} from "@/lib/reviews";
import { searchHref } from "@/lib/search-params";
import type { Theme } from "@/utils/themeMap";

type ReviewSectionProps = {
    fragranceId: string;
    fragranceName: string;
    theme: Theme;
    user: CurrentUser | null;
    reviews: Review[];
    stats?: ReviewStats;
    // Reviewers the viewer is friends with; their reviews are badged and listed first.
    friendIds?: Set<string>;
};

const pillChoice = "flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/40 cursor-pointer has-[:checked]:bg-foreground/20 has-[:checked]:border-foreground";

function Meter({ label, value, max, votes }: { label: string; value: number | null; max: number; votes: number }) {
    if (value === null) return null;
    const labels = max === 5 ? LONGEVITY_LABELS : SILLAGE_LABELS;
    return (
        <div>
            <div className="flex justify-between gap-4 text-sm">
                <span className="font-medium">{label}</span>
                <span>{scaleLabel(labels, value)} <span className="text-foreground/60">({votes})</span></span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-foreground/15" aria-hidden>
                <div className="h-2 rounded-full bg-foreground/70" style={{ width: `${(value / max) * 100}%` }}/>
            </div>
        </div>
    );
}

function Summary({ stats }: { stats?: ReviewStats }) {
    if (!stats) return <p className="text-foreground/80">No reviews yet. Be the first to share how it wears.</p>;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <span className="text-4xl font-semibold">{stats.avgRating.toFixed(1)}</span>
                <div>
                    <Stars rating={stats.avgRating}/>
                    <p className="text-sm text-foreground/70">{stats.reviewCount} {stats.reviewCount === 1 ? "review" : "reviews"}</p>
                </div>
            </div>

            <Meter label="Longevity" value={stats.avgLongevity} max={5} votes={stats.longevityVotes}/>
            <Meter label="Sillage" value={stats.avgSillage} max={4} votes={stats.sillageVotes}/>

            {stats.seasonVotes > 0 && (
                <div>
                    <p className="text-sm font-medium mb-2">Best seasons</p>
                    <ul className="flex flex-wrap gap-2">
                        {SEASONS.map(({ value, label }) => {
                            const share = Math.round((stats.seasons[value] / stats.seasonVotes) * 100);
                            return (
                                <li key={value}>
                                    <Link
                                        href={searchHref({ season: value })}
                                        className={`inline-flex px-3 py-1 rounded-full border text-sm ${share >= 50 ? "border-foreground bg-foreground/20" : "border-foreground/30 text-foreground/70"}`}
                                    >
                                        {label} {share}%
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

function ReviewForm({ fragranceId, mine }: { fragranceId: string; mine?: Review }) {
    return (
        <ActionForm action={saveReview} submitLabel={mine ? "Update review" : "Post review"} pendingLabel="Saving...">
            <input type="hidden" name="fragranceId" value={fragranceId}/>

            <fieldset>
                <legend className="font-medium mb-2">Your rating</legend>
                <div className="flex flex-row-reverse justify-end gap-1">
                    {/* Reversed so CSS can light up every star up to the hovered or chosen one. */}
                    {[5, 4, 3, 2, 1].map((value) => (
                        <label key={value} className="peer cursor-pointer text-3xl leading-none text-foreground/30 has-[:checked]:text-amber-300 light:has-[:checked]:text-amber-600 peer-has-[:checked]:text-amber-300 light:peer-has-[:checked]:text-amber-600 hover:text-amber-200 peer-hover:text-amber-200">
                            <input type="radio" name="rating" value={value} required defaultChecked={mine?.rating === value} className="sr-only"/>
                            <span aria-hidden>★</span>
                            <span className="sr-only">{value} {value === 1 ? "star" : "stars"}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            <fieldset>
                <legend className="font-medium mb-2">Longevity <span className="text-foreground/60 font-normal">(optional)</span></legend>
                <div className="flex flex-wrap gap-2">
                    {LONGEVITY_LABELS.slice(1).map((label, i) => (
                        <label key={label} className={pillChoice}>
                            <input type="radio" name="longevity" value={i + 1} defaultChecked={mine?.longevity === i + 1} className="accent-current"/>
                            {label}
                        </label>
                    ))}
                </div>
            </fieldset>

            <fieldset>
                <legend className="font-medium mb-2">Sillage <span className="text-foreground/60 font-normal">(optional)</span></legend>
                <div className="flex flex-wrap gap-2">
                    {SILLAGE_LABELS.slice(1).map((label, i) => (
                        <label key={label} className={pillChoice}>
                            <input type="radio" name="sillage" value={i + 1} defaultChecked={mine?.sillage === i + 1} className="accent-current"/>
                            {label}
                        </label>
                    ))}
                </div>
            </fieldset>

            <fieldset>
                <legend className="font-medium mb-2">Best seasons <span className="text-foreground/60 font-normal">(optional)</span></legend>
                <div className="flex flex-wrap gap-2">
                    {SEASONS.map(({ value, label }) => (
                        <label key={value} className={pillChoice}>
                            <input type="checkbox" name="seasons" value={value} defaultChecked={mine?.seasons.includes(value)} className="accent-current"/>
                            {label}
                        </label>
                    ))}
                </div>
            </fieldset>

            <label className="flex flex-col gap-1">
                <span className="font-medium">Your thoughts <span className="text-foreground/60 font-normal">(optional)</span></span>
                <textarea
                    name="body"
                    rows={4}
                    maxLength={2000}
                    defaultValue={mine?.body}
                    placeholder="How does it open, dry down, and make you feel?"
                    className="px-4 py-3 rounded-lg border border-foreground/30 bg-background/40"
                />
            </label>
        </ActionForm>
    );
}

export default function ReviewSection({ fragranceId, fragranceName, theme, user, reviews, stats, friendIds = new Set() }: ReviewSectionProps) {
    const card = `p-5 sm:p-6 border rounded-xl backdrop-blur-sm ${theme.card} ${theme.border}`;
    const mine = user ? reviews.find((review) => review.userId === user.id) : undefined;
    // Friends' reviews first, then everyone else's, each newest first.
    const ordered = [...reviews].sort((a, b) => Number(friendIds.has(b.userId)) - Number(friendIds.has(a.userId)));

    return (
        <section aria-labelledby="reviews-heading" className="mt-10">
            <h2 id="reviews-heading" className={`text-2xl font-semibold mb-4 ${theme.accent}`}>Reviews</h2>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                <div className="flex flex-col gap-6">
                    <div className={card}>
                        <Summary stats={stats}/>
                    </div>

                    <div className={card}>
                        <h3 className="text-xl font-semibold mb-4">{mine ? "Your review" : `Review ${fragranceName}`}</h3>
                        {user ? (
                            <>
                                <ReviewForm fragranceId={fragranceId} mine={mine}/>
                                {mine && (
                                    <form action={deleteReview} className="mt-4">
                                        <input type="hidden" name="fragranceId" value={fragranceId}/>
                                        <button type="submit" className="text-sm underline text-danger cursor-pointer">Delete my review</button>
                                    </form>
                                )}
                            </>
                        ) : (
                            <Link
                                href={`/sign-in?next=/fragrance/${fragranceId}`}
                                className="inline-block px-6 py-3 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200"
                            >
                                Sign in to review
                            </Link>
                        )}
                    </div>
                </div>

                <ul className="flex flex-col gap-4">
                    {ordered.length === 0 && <li className={card}>No written reviews yet.</li>}
                    {ordered.map((review) => (
                        <li key={review.id} className={card}>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <p className="font-semibold">
                                    {review.author}
                                    {review.userId === user?.id && <span className="ml-2 text-sm font-normal text-foreground/70">(you)</span>}
                                    {friendIds.has(review.userId) && <span className="ml-2 px-2 py-0.5 rounded-full text-xs border border-foreground/40">Friend</span>}
                                </p>
                                <Stars rating={review.rating} className="size-4"/>
                            </div>

                            {(review.longevity || review.sillage || review.seasons.length > 0) && (
                                <p className="text-sm text-foreground/70 mb-2">
                                    {[
                                        review.longevity && `Longevity: ${LONGEVITY_LABELS[review.longevity]}`,
                                        review.sillage && `Sillage: ${SILLAGE_LABELS[review.sillage]}`,
                                        review.seasons.length > 0 && SEASONS.filter((s) => review.seasons.includes(s.value)).map((s) => s.label).join(", "),
                                    ].filter(Boolean).join(" · ")}
                                </p>
                            )}

                            {review.body && <p className="whitespace-pre-line leading-relaxed">{review.body}</p>}

                            <p className="mt-2 text-xs text-foreground/60">
                                {new Date(review.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
