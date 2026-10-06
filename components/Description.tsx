import Link from "next/link";
import type { Fragrance } from "@/data/fragrances";
import type { Suggestion } from "@/lib/descriptions";
import type { Theme } from "@/utils/themeMap";


type descriptionProps = {
    fragrance: Fragrance;
    theme: Theme;
    // A peer-approved rewrite, shown instead of the original when there is one.
    community?: Suggestion | null;
    suggestionCount?: number;
};

function Paragraphs({ text }: { text: string }) {
    return text.split(/\n\s*\n/).map((paragraph) => (
        <p key={paragraph} className="flex leading-relaxed text-foreground text-xl py-3 px-2">
        {paragraph}
        </p>
    ));
}

export default function Description({ fragrance, theme, community, suggestionCount = 0 }: descriptionProps) {

    return (
        <div className={`border rounded-xl backdrop-blur-sm px-5 pb-4 ${theme.card} ${theme.border}`}>
            <h3 className={`py-4 text-2xl font-semibold ${theme.accent}`}>Description</h3>

            <hr className="my-6 border-gray-500 mb-2 mt-2" />

            {community ? (
                <>
                    <p className="px-2 pt-2 text-sm text-foreground/70">
                        Community description by {community.author} · approved by {community.upvotes} {community.upvotes === 1 ? "vote" : "votes"}
                    </p>
                    <Paragraphs text={community.body}/>
                    <details className="px-2 mt-2">
                        <summary className="cursor-pointer text-sm underline text-foreground/80">Original description</summary>
                        <div className="text-foreground/80"><Paragraphs text={fragrance.description}/></div>
                    </details>
                </>
            ) : (
                <Paragraphs text={fragrance.description}/>
            )}

            <Link href={`/fragrance/${fragrance.id}/descriptions`} className="inline-block px-2 mt-2 text-sm underline text-foreground/80 hover:text-foreground">
                {suggestionCount ? `Review ${suggestionCount} suggested ${suggestionCount === 1 ? "description" : "descriptions"}` : "Suggest a better description"}
            </Link>
        </div>

    )
}
