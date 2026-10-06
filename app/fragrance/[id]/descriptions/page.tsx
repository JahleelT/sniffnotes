import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import ActionForm from "@/components/ActionForm";
import PageShell from "@/components/PageShell";
import { getCurrentUser } from "@/lib/auth";
import { APPROVAL_SCORE, MAX_SUGGESTION_LENGTH, MIN_SUGGESTION_LENGTH, communityDescription, getSuggestions } from "@/lib/descriptions";
import { getFragranceById } from "@/lib/fragrances";
import { getTheme } from "@/utils/themeMap";
import { deleteSuggestion, saveSuggestion, voteOnSuggestion } from "./actions";

export async function generateMetadata(props: PageProps<"/fragrance/[id]/descriptions">): Promise<Metadata> {
    const { id } = await props.params;
    const fragrance = getFragranceById(id);
    return { title: fragrance ? `Descriptions for ${fragrance.name} | SniffNotes` : "SniffNotes" };
}

export default async function DescriptionsPage(props: PageProps<"/fragrance/[id]/descriptions">) {
    const { id } = await props.params;
    const fragrance = getFragranceById(id);
    if (!fragrance) notFound();

    const user = await getCurrentUser();
    const suggestions = await getSuggestions(fragrance.id, user?.id);
    const approved = communityDescription(suggestions);
    const mine = suggestions.find((s) => s.userId === user?.id);

    const theme = getTheme(fragrance.tags[0]);
    const card = `p-5 sm:p-6 border rounded-xl backdrop-blur-sm ${theme.card} ${theme.border}`;
    const voteButton = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all duration-200 cursor-pointer";

    return (
        <PageShell theme={theme}>
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                <div>
                    <Link href={`/fragrance/${fragrance.id}`} className="underline text-foreground/80">← {fragrance.name}</Link>
                    <h1 className="text-3xl sm:text-4xl font-semibold mt-3">Descriptions for {fragrance.name}</h1>
                    <p className="mt-2 text-foreground/80">
                        Suggest a better description and vote on others&apos;. A suggestion with a net score of +{APPROVAL_SCORE} or more
                        becomes the description on the fragrance page. The highest-scoring one wins.
                    </p>
                </div>

                <section className={card} aria-labelledby="current-heading">
                    <h2 id="current-heading" className={`text-xl font-semibold mb-2 ${theme.accent}`}>
                        Shown now: {approved ? `community description by ${approved.author}` : "original description"}
                    </h2>
                    <p className="whitespace-pre-line leading-relaxed">{approved ? approved.body : fragrance.description}</p>
                </section>

                <section aria-labelledby="suggestions-heading">
                    <h2 id="suggestions-heading" className="text-2xl font-semibold mb-3">Suggestions</h2>
                    {suggestions.length === 0 && <p className="text-foreground/70">No suggestions yet.</p>}
                    <ul className="flex flex-col gap-4">
                        {suggestions.map((suggestion) => {
                            const isMine = suggestion.userId === user?.id;
                            return (
                                <li key={suggestion.id} className={card}>
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                        <p className="font-semibold">
                                            {suggestion.authorUsername ? (
                                                <Link href={`/people/${suggestion.authorUsername}`} className="hover:underline underline-offset-4">{suggestion.author}</Link>
                                            ) : suggestion.author}
                                            {isMine && <span className="ml-2 text-sm font-normal text-foreground/70">(you)</span>}
                                            {suggestion.id === approved?.id && <span className="ml-2 px-2 py-0.5 rounded-full text-xs border border-foreground/40">Shown on page</span>}
                                        </p>
                                        <p className="text-sm" aria-label={`Score ${suggestion.score}: ${suggestion.upvotes} up, ${suggestion.downvotes} down`}>
                                            <span className="font-semibold">{suggestion.score > 0 ? `+${suggestion.score}` : suggestion.score}</span>
                                            <span className="text-foreground/60"> ({suggestion.upvotes} up · {suggestion.downvotes} down)</span>
                                        </p>
                                    </div>

                                    <p className="whitespace-pre-line leading-relaxed">{suggestion.body}</p>

                                    {user && !isMine && (
                                        <div className="mt-3 flex gap-2">
                                            {[1, -1].map((value) => {
                                                const active = suggestion.myVote === value;
                                                return (
                                                    <form key={value} action={voteOnSuggestion}>
                                                        <input type="hidden" name="suggestionId" value={suggestion.id}/>
                                                        <input type="hidden" name="fragranceId" value={fragrance.id}/>
                                                        <input type="hidden" name="value" value={value}/>
                                                        <button
                                                            type="submit"
                                                            aria-pressed={active}
                                                            className={`${voteButton} ${active ? "border-foreground bg-foreground/20" : "border-foreground/40 hover:bg-foreground/15"}`}
                                                        >
                                                            {value > 0 ? <ThumbsUp aria-hidden className="size-4"/> : <ThumbsDown aria-hidden className="size-4"/>}
                                                            {value > 0 ? "Better" : "Not better"}
                                                        </button>
                                                    </form>
                                                );
                                            })}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section className={card} aria-labelledby="suggest-heading">
                    <h2 id="suggest-heading" className="text-xl font-semibold mb-3">{mine ? "Edit your suggestion" : "Suggest a description"}</h2>
                    {user ? (
                        <>
                            {mine && <p className="mb-3 text-sm text-foreground/70">Changing the text resets its votes, since people voted on the old wording.</p>}
                            <ActionForm action={saveSuggestion} submitLabel={mine ? "Save changes" : "Submit suggestion"} pendingLabel="Saving...">
                                <input type="hidden" name="fragranceId" value={fragrance.id}/>
                                <label className="flex flex-col gap-1">
                                    <span className="sr-only">Description</span>
                                    <textarea
                                        name="body"
                                        rows={7}
                                        minLength={MIN_SUGGESTION_LENGTH}
                                        maxLength={MAX_SUGGESTION_LENGTH}
                                        required
                                        defaultValue={mine?.body ?? (approved?.body ?? fragrance.description)}
                                        className="px-4 py-3 rounded-lg border border-foreground/30 bg-background/40 leading-relaxed"
                                    />
                                </label>
                            </ActionForm>
                            {mine && (
                                <form action={deleteSuggestion} className="mt-3">
                                    <input type="hidden" name="fragranceId" value={fragrance.id}/>
                                    <button type="submit" className="text-sm underline text-danger cursor-pointer">Delete my suggestion</button>
                                </form>
                            )}
                        </>
                    ) : (
                        <Link href={`/sign-in?next=/fragrance/${fragrance.id}/descriptions`} className="inline-block px-6 py-3 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200">
                            Sign in to suggest or vote
                        </Link>
                    )}
                </section>
            </div>
        </PageShell>
    );
}
