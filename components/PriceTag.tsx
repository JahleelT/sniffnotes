import { PRICE_TIERS, describePrice, type PriceTier } from "@/lib/price";

type PriceTagProps = {
    tier?: PriceTier;
    // Show the tier's name and price range next to the symbols, not just on hover.
    detailed?: boolean;
    className?: string;
};

// Google Maps-style dollar signs: filled up to the tier, faded after, so "$$" reads as two of four.
export default function PriceTag({ tier, detailed = false, className = "" }: PriceTagProps) {
    if (!tier) return null;
    const { label, range } = PRICE_TIERS[tier];

    return (
        <span className={`inline-flex items-baseline gap-2 ${className}`} title={describePrice(tier)}>
            <span aria-hidden className="font-semibold tracking-wider">
                {"$".repeat(tier)}<span className="opacity-30">{"$".repeat(4 - tier)}</span>
            </span>
            <span className={detailed ? "" : "sr-only"}>
                {label}{detailed ? " · " : ", "}{range}{detailed ? " for a full bottle" : ""}
            </span>
        </span>
    );
}
