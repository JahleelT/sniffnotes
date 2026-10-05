import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/ActionForm";
import BottleImage from "@/components/BottleImage";
import Field from "@/components/Field";
import PageShell from "@/components/PageShell";
import { requireUser } from "@/lib/auth";
import { getCollections } from "@/lib/collections";
import { getFragranceById } from "@/lib/fragrances";
import { defaultTheme } from "@/utils/themeMap";
import type { Fragrance } from "@/data/fragrances";
import { createCollection } from "./actions";

export const metadata: Metadata = {
    title: "Collections | SniffNotes",
};

const card = `border rounded-xl backdrop-blur-sm ${defaultTheme.card} ${defaultTheme.border}`;

export default async function CollectionsPage() {
    await requireUser("/collections");
    const collections = await getCollections();

    return (
        <PageShell>
            <h1 className="text-4xl font-semibold mb-8">Your collections</h1>

            <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-6 mb-10">
                {collections.map((collection) => {
                    const covers = collection.fragranceIds
                        .map(getFragranceById)
                        .filter((f): f is Fragrance => Boolean(f))
                        .slice(0, 3);

                    return (
                        <li key={collection.id}>
                            <Link
                                href={`/collections/${collection.id}`}
                                className={`card-link flex flex-col gap-4 p-5 h-full hover:scale-[1.02] transition-all duration-200 ${card}`}
                            >
                                <div className="flex justify-center items-end gap-2 h-32">
                                    {covers.length > 0 ? (
                                        covers.map((fragrance) => (
                                            <BottleImage key={fragrance.id} fragrance={fragrance} width={80} height={120} className="h-28 w-auto"/>
                                        ))
                                    ) : (
                                        <span className="self-center text-foreground/60">Nothing here yet</span>
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-2xl font-semibold">{collection.name}</h2>
                                    <p className="text-foreground/80">
                                        {collection.fragranceIds.length} {collection.fragranceIds.length === 1 ? "fragrance" : "fragrances"}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <section aria-labelledby="new-collection-heading" className={`max-w-md p-6 ${card}`}>
                <h2 id="new-collection-heading" className="text-2xl font-semibold mb-4">New collection</h2>
                <ActionForm action={createCollection} submitLabel="Create collection" pendingLabel="Creating..." resetOnSuccess>
                    <Field label="Name" name="name" maxLength={40} placeholder="e.g. Summer rotation" required/>
                </ActionForm>
            </section>
        </PageShell>
    );
}
