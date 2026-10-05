import MoodTags from "@/components/MoodTags";
import type { Fragrance } from "@/data/fragrances";
import type { Theme } from "@/utils/themeMap";

type BreakdownNTagsProps = {
    fragrance: Fragrance;
    theme: Theme;
};

export default function BreakdownNTags({ fragrance, theme }: BreakdownNTagsProps) {

    const tiers = [
        { title: "Top Notes", notes: fragrance.notes.top },
        { title: "Heart Notes", notes: fragrance.notes.mid },
        { title: "Base Notes", notes: fragrance.notes.base },
    ].filter((tier) => tier.notes.length > 0);

    return (
        <div className={`flex flex-col justify-center px-4 backdrop-blur-sm border rounded-xl lg:mb-6 ${theme.card} ${theme.border}`}>
            <section id="notes">

                <h2 className={`text-2xl mt-3 px-2 font-semibold ${theme.accent}`}>Notes</h2>

                {tiers.map((tier, index) => (
                    <div key={tier.title}>
                        {index > 0 && <hr className="my-6 border-gray-500"/>}

                        <h3 className="flex justify-center text-2xl mt-4 mb-1 font-semibold">{tier.title}</h3>
                        <ul className="flex flex-wrap justify-center gap-4 text-xl">
                            {tier.notes.map((note) => (
                                <li key={note}>
                                    {note}
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
