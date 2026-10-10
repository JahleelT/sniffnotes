import Link from "next/link";
import MoodTags from "@/components/MoodTags";
import { searchHref } from "@/lib/search-params";
import type { Fragrance } from "@/data/fragrances";
import type { Theme } from "@/utils/themeMap";

type BreakdownNTagsProps = {
    fragrance: Fragrance;
    theme: Theme;
};

export default function BreakdownNTags({ fragrance, theme }: BreakdownNTagsProps) {

    const tiers = [
        { title: "Top Notes", notes: fragrance.notes.top },
        // Fragrances without a pyramid keep their flat note list in `mid`.
        {
            // The card is already titled "Notes", so a flat list gets no tier heading.
            title: fragrance.notes.top.length || fragrance.notes.base.length ? "Heart Notes" : "",
            notes: fragrance.notes.mid,
        },
        { title: "Base Notes", notes: fragrance.notes.base },
    ].filter((tier) => tier.notes.length > 0);

    return (
        <div className={`flex flex-col justify-start px-4 pb-4 backdrop-blur-sm border rounded-xl ${theme.card} ${theme.border}`}>
            <section id="notes">

                <h2 className={`text-2xl mt-3 px-2 font-semibold ${theme.accent}`}>Notes</h2>

                {tiers.map((tier, index) => (
                    <div key={tier.title || "notes"} className={tier.title ? "" : "mt-4"}>
                        {index > 0 && <hr className="my-6 border-gray-500"/>}

                        {tier.title && <h3 className="flex justify-center text-2xl mt-4 mb-1 font-semibold">{tier.title}</h3>}
                        <ul className="flex flex-wrap justify-center gap-4 text-xl">
                            {tier.notes.map((note) => (
                                <li key={note}>
                                    <Link
                                        href={searchHref({ note })}
                                        title={`Fragrances with ${note}`}
                                        className="underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
                                    >
                                        {note}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>

            <hr className="my-6 border-gray-500 mb-1 mt-4"/>

            <h2 className={`flex justify-center py-2 mb-2 text-2xl font-semibold ${theme.accent}`}>Fragrance Attributes</h2>
            <section id="tags">
                <MoodTags moods={fragrance.tags} className="mb-7"/>
            </section>
        </div>
    )
}
