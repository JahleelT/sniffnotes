import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import Field from "@/components/Field";
import FragranceCard from "@/components/FragranceCard";
import PageShell from "@/components/PageShell";
import { requireUser } from "@/lib/auth";
import { getCollection } from "@/lib/collections";
import { getPublicProfiles } from "@/lib/friends";
import { defaultTheme } from "@/utils/themeMap";
import { deleteCollection, removeFromCollection, renameCollection, setCollectionShared } from "../actions";

export const metadata: Metadata = {
    title: "Collection | SniffNotes",
};

const card = `p-6 border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`;
const pill = "px-5 py-2 rounded-full border border-foreground/60 hover:bg-foreground/15 transition-all duration-200 cursor-pointer";

export default async function CollectionPage(props: PageProps<"/collections/[id]">) {
    const { id } = await props.params;
    const user = await requireUser(`/collections/${id}`);

    // Row-level security returns your own collections and friends' shared ones; anything else is "not found".
    const collection = await getCollection(id);
    if (!collection) notFound();

    const isOwner = collection.userId === user.id;
    const isCustom = collection.kind === "custom";
    const owner = isOwner ? null : (await getPublicProfiles([collection.userId])).get(collection.userId);

    return (
        <PageShell>
            {isOwner ? (
                <Link href="/collections" className="underline text-foreground/80">← All collections</Link>
            ) : (
                owner?.username && <Link href={`/people/${owner.username}`} className="underline text-foreground/80">← {owner.displayName}&apos;s profile</Link>
            )}

            <h1 className="text-4xl font-semibold mt-4">{collection.name}</h1>
            {!isOwner && owner && <p className="text-foreground/80">Shared by {owner.displayName}</p>}
            <p className="mb-8 text-foreground/80">
                {collection.fragrances.length} {collection.fragrances.length === 1 ? "fragrance" : "fragrances"}
            </p>

            {collection.fragrances.length > 0 ? (
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-6 mb-10">
                    {collection.fragrances.map((fragrance) => (
                        <li key={fragrance.id} className="flex flex-col gap-3">
                            <FragranceCard fragrance={fragrance}/>
                            {isOwner && <form action={removeFromCollection} className="flex justify-center">
                                <input type="hidden" name="collectionId" value={collection.id}/>
                                <input type="hidden" name="fragranceId" value={fragrance.id}/>
                                <button type="submit" className={`${pill} backdrop-blur-sm`} aria-label={`Remove ${fragrance.name} from ${collection.name}`}>
                                    Remove
                                </button>
                            </form>}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mb-10 text-lg">
                    {isOwner ? "Nothing saved here yet." : "Nothing here yet."}{" "} <Link href="/search" className="underline">Browse fragrances</Link> and use the Save button on any fragrance page.
                </p>
            )}

            {isOwner && (
                <section aria-labelledby="manage-heading" className={`max-w-md ${card}`}>
                    <h2 id="manage-heading" className="text-2xl font-semibold mb-4">Manage collection</h2>

                    <form action={setCollectionShared} className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <input type="hidden" name="collectionId" value={collection.id}/>
                        <input type="hidden" name="shared" value={collection.sharedWithFriends ? "false" : "true"}/>
                        <p>{collection.sharedWithFriends ? "Your friends can see this collection." : "Only you can see this collection."}</p>
                        <button type="submit" className={pill} aria-pressed={collection.sharedWithFriends}>
                            {collection.sharedWithFriends ? "Stop sharing" : "Share with friends"}
                        </button>
                    </form>

                    {isCustom && (
                        <ActionForm action={renameCollection} submitLabel="Rename" pendingLabel="Renaming...">
                            <input type="hidden" name="collectionId" value={collection.id}/>
                            <Field label="Name" name="name" defaultValue={collection.name} maxLength={40} required/>
                        </ActionForm>
                    )}

                    {isCustom && <details className="mt-6">
                        <summary className="cursor-pointer text-danger">Delete this collection</summary>
                        <p className="my-3 text-foreground/80">This removes the collection, not the fragrances in it. It can&apos;t be undone.</p>
                        <form action={deleteCollection}>
                            <input type="hidden" name="collectionId" value={collection.id}/>
                            <button type="submit" className={`${pill} border-danger text-danger`}>
                                Yes, delete “{collection.name}”
                            </button>
                        </form>
                    </details>}
                </section>
            )}
        </PageShell>
    );
}
