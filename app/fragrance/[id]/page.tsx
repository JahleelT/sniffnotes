import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Backdrop from "@/components/Backdrop";
import FragranceHeader from "@/components/FragranceHeader";
import FragrancePhoto from "@/components/FragrancePhoto";
import BreakdownNTags from "@/components/BreakdownNTags";
import Description from "@/components/Description";
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

    return (
        <Backdrop theme={theme}>
            <FragranceHeader fragrance={fragrance} theme={theme}/>

            <div className="grid grid-cols-[1fr_0.9fr_1fr] gap-8 p-8">
                <BreakdownNTags fragrance={fragrance} theme={theme}/>
                <FragrancePhoto fragrance={fragrance} theme={theme}/>
                <Description fragrance={fragrance} theme={theme}/>
            </div>
        </Backdrop>
    )
}
