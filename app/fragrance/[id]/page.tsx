import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Backdrop from "@/components/Backdrop";
import FragranceHeader from "@/components/FragranceHeader";
import FragrancePhoto from "@/components/FragrancePhoto";
import BreakdownNTags from "@/components/BreakdownNTags";
import Description from "@/components/Description";
import SaveMenu from "@/components/SaveMenu";
import { getCurrentUser } from "@/lib/auth";
import { getCollections } from "@/lib/collections";
import { getAllFragrances, getFragranceById } from "@/lib/fragrances";
import { getTheme } from "@/utils/themeMap";

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

    const theme = getTheme(fragrance.tags[0]);
    const user = await getCurrentUser();

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

            <main id="main" className="grid grid-cols-[1fr_0.9fr_1fr] gap-8 p-8">
                <BreakdownNTags fragrance={fragrance} theme={theme}/>
                <FragrancePhoto fragrance={fragrance} theme={theme}/>
                <Description fragrance={fragrance} theme={theme}/>
            </main>
        </Backdrop>
    )
}
