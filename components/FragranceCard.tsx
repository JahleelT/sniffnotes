import Link from "next/link";
import BottleImage from "@/components/BottleImage";
import PriceTag from "@/components/PriceTag";
import type { Fragrance } from "@/data/fragrances";
import { getTheme, themeMap, type Mood } from "@/utils/themeMap";

type FragranceCardProps = {
    fragrance: Fragrance;
    // Why it's shown, e.g. for recommendations.
    reason?: string;
    compact?: boolean;
    // Moods to bold because they're shared with whatever this card is being compared to.
    highlightMoods?: Mood[];
    // Mood match with the fragrance being viewed, 0–100.
    match?: number;
};

export default function FragranceCard({ fragrance, reason, compact = false, highlightMoods = [], match }: FragranceCardProps) {
    const theme = getTheme(fragrance.tags[0]);

    return (
        <Link
            href={`/fragrance/${fragrance.id}`}
            className={`card-link flex flex-col items-center gap-3 h-full ${compact ? "p-4" : "p-5"} border rounded-xl backdrop-blur-sm hover:scale-[1.02] transition-all duration-200 ${theme.card} ${theme.border}`}
        >
            <BottleImage
                fragrance={fragrance}
                width={200}
                height={300}
                className={compact ? "h-40 w-auto" : "h-56 w-auto"}
            />

            <div className="text-center">
                <h3 className={`${compact ? "text-xl" : "text-2xl"} font-semibold text-foreground`}>{fragrance.name}</h3>
                <p className={`${compact ? "text-base" : "text-lg"} text-foreground/80`}>{fragrance.brand}</p>
                <PriceTag tier={fragrance.price} className="text-sm text-foreground/80"/>
            </div>

            {match !== undefined && (
                <p className="px-3 py-0.5 rounded-full border border-foreground/40 text-sm font-semibold">{match}% mood match</p>
            )}

            <p className={`text-sm text-center ${theme.accent}`}>
                {fragrance.tags.map((tag, i) => (
                    <span key={tag}>
                        {i > 0 && " • "}
                        {highlightMoods.includes(tag) ? <strong className="font-bold">{themeMap[tag].label}</strong> : themeMap[tag].label}
                    </span>
                ))}
            </p>

            {reason && <p className="mt-auto text-sm text-center italic text-foreground/80">{reason}</p>}
        </Link>
    );
}
